#!/usr/bin/env python3
"""Render the picture: edit/manifest.json + work/timeline.json + work/graded/* -> raw RGB frames.

Sources are already graded (the LUT lives only in grade.py); this stage does geometry
(crops, push-ins, pans, punch-ins, contain-fit with blurred extension), dissolves/fades and
restrained film texture (diffusion, highlight halation, vignette, per-frame grain).

Usage:
  render_frames.py <root> --stdout            raw rgb24 1080x1920 frames to stdout (for ffmpeg)
  render_frames.py <root> --stills t1 t2 ...   write full-res PNGs of given times to work/qa/stills/
  render_frames.py <root> --preview            first/last frame of every shot -> work/qa/shots_*.jpg
  render_frames.py <root> --edl                print the resolved edit decision list
"""
import functools, json, math, os, re, sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from timeline import resolve_any  # noqa: E402

ROOT = sys.argv[1]
MAN = json.load(open(os.path.join(ROOT, "edit", "manifest.json")))
TL = json.load(open(os.path.join(ROOT, "work", "timeline.json")))
W, H, FPS = MAN["format"]["width"], MAN["format"]["height"], MAN["format"]["fps"]
ASPECT = W / H
GRADED = os.path.join(ROOT, "work", "graded")
VIDEO_FPS = {"VID-20261005-WA0000.mp4": 30.0, "VID-20260820-WA0006.mp4": 24.0}
# film texture (kept restrained on purpose)
SOFTEN = {"camera": 0.20, "whatsapp": 0.08, "video": 0.0}
GRAIN = 0.0125
HALATION = 0.06
VIGNETTE = 0.10


# ---------------------------------------------------------------- timing
def resolve(anchor):
    return resolve_any(TL, MAN["tick"], anchor)


def edl():
    shots = []
    for s in MAN["shots"]:
        d = dict(s)
        d["t0"] = resolve(s["start"])
        shots.append(d)
    for i, s in enumerate(shots):
        s["t1"] = shots[i + 1]["t0"] if i + 1 < len(shots) else TL["duration"]
        if s["t1"] <= s["t0"]:
            raise ValueError(f"{s['id']} has non-positive duration ({s['t0']:.2f} -> {s['t1']:.2f})")
    return shots


# ---------------------------------------------------------------- sources
def read16(path):
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im is None:
        raise FileNotFoundError(path)
    return cv2.cvtColor(im, cv2.COLOR_BGR2RGB).astype(np.float32) / 65535.0


@functools.lru_cache(maxsize=10)
def still_pyramid(name, rotate=0):
    img = read16(os.path.join(GRADED, os.path.splitext(name)[0] + ".png"))
    if rotate:
        img = np.ascontiguousarray(np.rot90(img, k=rotate // 90))  # counter-clockwise, like PIL
    levels = [img]
    while min(levels[-1].shape[:2]) > 900:
        levels.append(cv2.resize(levels[-1], (levels[-1].shape[1] // 2, levels[-1].shape[0] // 2),
                                 interpolation=cv2.INTER_AREA))
    return levels


@functools.lru_cache(maxsize=48)
def video_frame(name, idx):
    d = os.path.join(GRADED, os.path.splitext(name)[0])
    n = len([f for f in os.listdir(d) if f.endswith(".png")])
    idx = int(np.clip(idx, 0, n - 1))
    return read16(os.path.join(d, f"{idx:05d}.png"))


def kind(name):
    if name.lower().endswith(".mp4"):
        return "video"
    return "whatsapp" if name.startswith("IMG-") else "camera"


# ---------------------------------------------------------------- geometry
def window(src_w, src_h, cx, cy, z, aspect, clamp=True):
    if src_w / src_h > aspect:
        hm, wm = src_h, src_h * aspect
    else:
        wm, hm = src_w, src_w / aspect
    w, h = wm / z, hm / z
    x, y = cx * src_w - w / 2, cy * src_h - h / 2
    if clamp:
        x, y = np.clip(x, 0, src_w - w), np.clip(y, 0, src_h - h)
    return x, y, w, h


def warp(levels, x, y, w, h, out_w, out_h, border=cv2.BORDER_REFLECT):
    s = out_w / w  # output pixels per source pixel (level 0)
    lvl = int(np.clip(math.floor(math.log2(1 / s)) if s < 1 else 0, 0, len(levels) - 1))
    src = levels[lvl]
    f = 1 / (2 ** lvl)
    sx = s / f
    M = np.array([[sx, 0, -x * f * sx + 0.5 * (sx - 1)], [0, sx, -y * f * sx + 0.5 * (sx - 1)]], np.float32)
    return cv2.warpAffine(src, M, (out_w, out_h), flags=cv2.INTER_CUBIC, borderMode=border)


def ease(u, e):
    u = float(np.clip(u, 0, 1))
    return (1 - e) * u + e * (u * u * (3 - 2 * u))


def shot_params(s, t):
    u = ease((t - s["t0"]) / max(1e-6, s["t1"] - s["t0"]), s.get("ease", 0.35))
    a, b = s.get("from", [0.5, 0.5, 1.0]), s.get("to", s.get("from", [0.5, 0.5, 1.0]))
    cx = a[0] + (b[0] - a[0]) * u
    cy = a[1] + (b[1] - a[1]) * u
    z = math.exp(math.log(a[2]) + (math.log(b[2]) - math.log(a[2])) * u)
    return cx, cy, z


def render_shot(s, t):
    name = s["src"]
    if name == "black":
        return np.zeros((H, W, 3), np.float32)
    cx, cy, z = shot_params(s, t)
    if kind(name) == "video":
        fps = VIDEO_FPS[name]
        idx = round((s.get("src_in", 0.0) + (t - s["t0"]) * s.get("speed", 1.0)) * fps)
        frame = video_frame(name, idx)
        levels = [frame]
    else:
        levels = still_pyramid(name, s.get("rotate", 0))
    src_h, src_w = levels[0].shape[:2]
    if s.get("fit") == "contain":
        ca = s.get("crop_aspect", 0.75)
        x, y, w, h = window(src_w, src_h, cx, cy, z, ca)
        fh = int(round(W / ca))
        fg = warp(levels, x, y, w, h, W, fh)
        bx, by, bw, bh = window(src_w, src_h, 0.5, 0.5, 1.0, ASPECT)
        bg = warp(levels, bx, by, bw, bh, W // 4, H // 4)
        bg = cv2.GaussianBlur(bg, (0, 0), 9)
        bg = cv2.resize(bg, (W, H), interpolation=cv2.INTER_LINEAR)
        yb = bg.mean(axis=2, keepdims=True)
        bg = (yb + (bg - yb) * 0.75) * 0.42
        out = bg.copy()
        y0 = (H - fh) // 2
        feather = 18
        m = np.ones((fh, 1, 1), np.float32)
        ramp = np.linspace(0, 1, feather, dtype=np.float32)[:, None, None]
        m[:feather] = ramp; m[-feather:] = ramp[::-1]
        out[y0:y0 + fh] = fg * m + out[y0:y0 + fh] * (1 - m)
        return out * s.get("gain", 1.0)
    if s.get("pad"):
        # frame past the photo's bottom edge: extend the (dark) last rows, then fade them to black
        x, y, w, h = window(src_w, src_h, cx, cy, z, ASPECT, clamp=False)
        img = warp(levels, x, y, w, h, W, H, border=cv2.BORDER_REPLICATE)
        edge = (src_h - y) / h * H                     # output row where the photo ends
        rows = np.arange(H, dtype=np.float32)
        fade = np.clip(1 - (rows - (edge - 0.03 * H)) / (0.05 * H), 0, 1) ** 2  # black before the copied rows show
        return img * fade[:, None, None] * s.get("gain", 1.0)
    x, y, w, h = window(src_w, src_h, cx, cy, z, ASPECT)
    return warp(levels, x, y, w, h, W, H) * s.get("gain", 1.0)


# ---------------------------------------------------------------- texture
_vig = None
_grain = None
HAL_TINT = np.array([1.0, 0.62, 0.42], np.float32) * HALATION


def grain_bank(n=24):
    """Pre-generated luma grain (half-res noise upscaled -> soft, film-like clumps)."""
    rng = np.random.default_rng(1009)
    return [cv2.resize(rng.standard_normal((H // 2, W // 2), dtype=np.float32), (W, H),
                       interpolation=cv2.INTER_LINEAR) for _ in range(n)]


def texture(img, frame_idx, soften):
    global _vig, _grain
    if soften > 0:
        img = cv2.addWeighted(img, 1 - soften, cv2.GaussianBlur(img, (0, 0), 1.3), soften, 0)
    if HALATION > 0:
        small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
        hl = np.clip((cv2.cvtColor(small, cv2.COLOR_RGB2GRAY) - 0.72) / 0.28, 0, 1)
        hl = cv2.GaussianBlur(hl * np.sqrt(hl), (0, 0), 6)
        hl = cv2.resize(hl, (W, H), interpolation=cv2.INTER_LINEAR)
        img = img + cv2.merge([hl * HAL_TINT[0], hl * HAL_TINT[1], hl * HAL_TINT[2]])
    if _vig is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 * 0.9 + ((yy - H / 2) / (H / 2)) ** 2)
        v = (1 - VIGNETTE * np.clip(r, 0, 1.6) ** 2.2).astype(np.float32)
        _vig = cv2.merge([v, v, v])
    img = cv2.multiply(img, _vig)
    if GRAIN > 0:
        if _grain is None:
            _grain = grain_bank()
        rng = np.random.default_rng(1009 + frame_idx)
        g = _grain[int(rng.integers(len(_grain)))]
        flip = int(rng.integers(4))                      # 24 noise fields x 4 orientations, picked per frame
        if flip:
            g = cv2.flip(g, flip - 2)
        y = np.clip(cv2.cvtColor(img, cv2.COLOR_RGB2GRAY), 0, 1)
        n = g * (GRAIN * (0.35 + 2.6 * y * (1 - y)))      # grain strongest in the mid-tones
        img = img + cv2.merge([n, n, n])
    return np.clip(img, 0, 1)


# ---------------------------------------------------------------- frame assembly
SHOTS = None


def frame_at(t, frame_idx, with_texture=True):
    global SHOTS
    if SHOTS is None:
        SHOTS = edl()
    cur = next((i for i, s in enumerate(SHOTS) if s["t0"] <= t < s["t1"]), len(SHOTS) - 1)
    s = SHOTS[cur]
    img = render_shot(s, t)
    soften = 0.0 if s["src"] == "black" else SOFTEN[kind(s["src"])]
    # dissolve into the NEXT shot (centred on its cut point)
    if cur + 1 < len(SHOTS):
        n = SHOTS[cur + 1]
        d = n.get("transition", {}).get("dissolve")
        if d and t >= n["t0"] - d / 2:
            w = ease((t - (n["t0"] - d / 2)) / d, 1.0)
            img = img * (1 - w) + render_shot(n, t) * w
    # dissolve from the PREVIOUS shot
    d = s.get("transition", {}).get("dissolve")
    if d and cur > 0 and t < s["t0"] + d / 2:
        p = SHOTS[cur - 1]
        w = ease((t - (s["t0"] - d / 2)) / d, 1.0)
        img = render_shot(p, t) * (1 - w) + img * w
    fi = s.get("fade_in")
    if fi:
        img = img * ease((t - s["t0"] - fi[0]) / (fi[1] - fi[0]), 1.0)
    if t >= TL["cut_to_black"]:
        img = np.zeros_like(img)
    if with_texture and img.max() > 0:
        img = texture(img, frame_idx, soften)
    return img


def to8(img):
    return (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)


def main():
    mode = sys.argv[2] if len(sys.argv) > 2 else "--edl"
    if mode == "--edl":
        for s in edl():
            print(f"{s['id']:4s} {s['t0']:7.2f} -> {s['t1']:7.2f} ({s['t1'] - s['t0']:5.2f}s)  {s['src']}")
        print(f"cut to black at {TL['cut_to_black']:.2f}s; total {TL['duration']:.2f}s")
    elif mode == "--stdout":
        first = int(round(float(sys.argv[3]) * FPS)) if len(sys.argv) > 3 else 0
        last = int(round(float(sys.argv[4]) * FPS)) if len(sys.argv) > 4 else int(round(TL["duration"] * FPS))
        out = sys.stdout.buffer
        for i in range(first, last):
            out.write(to8(frame_at(i / FPS, i)).tobytes())
            if i % 240 == 0:
                print(f"frame {i}/{last}", file=sys.stderr, flush=True)
    elif mode == "--stills":
        d = os.path.join(ROOT, "work", "qa", "stills")
        os.makedirs(d, exist_ok=True)
        for ts in sys.argv[3:]:
            t = float(ts)
            img = frame_at(t, int(t * FPS))
            p = os.path.join(d, f"t{t:07.2f}.png")
            cv2.imwrite(p, cv2.cvtColor(to8(img), cv2.COLOR_RGB2BGR))
            print(p)
    elif mode == "--preview":
        shots = edl()
        d = os.path.join(ROOT, "work", "qa")
        os.makedirs(d, exist_ok=True)
        tiles = []
        for s in shots:
            if s["src"] == "black":
                continue
            for edge, t in (("in", s["t0"] + 0.01), ("out", s["t1"] - 0.05)):
                img = cv2.resize(render_shot(s, t), (270, 480), interpolation=cv2.INTER_AREA)
                img = to8(img)
                cv2.putText(img, f"{s['id']} {edge}", (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 240, 200), 2)
                tiles.append(img)
        per = 16
        for k in range(0, len(tiles), per):
            chunk = tiles[k:k + per]
            while len(chunk) % 8:
                chunk.append(np.zeros_like(tiles[0]))
            rows = [np.concatenate(chunk[r:r + 8], axis=1) for r in range(0, len(chunk), 8)]
            sheet = np.concatenate(rows, axis=0)
            p = os.path.join(d, f"shots_{k // per + 1:02d}.jpg")
            cv2.imwrite(p, cv2.cvtColor(sheet, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 85])
            print(p)


if __name__ == "__main__":
    main()
