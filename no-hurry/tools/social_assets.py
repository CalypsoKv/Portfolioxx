#!/usr/bin/env python3
"""Picture assets for the social cut, written into studio/public (private media, gitignored).

What happens to each kind of asset:
  photos     work/graded/<stem>.png (custom LUT already applied ONCE in the main grade) -> social finish -> JPG.
             Resolution: full 3000x4000 when the storyboard zooms past 1.25x anywhere, else 1800x2400.
  cut-outs   her matte (work/social/cutouts/<stem>_mask.png) applied to the SAME finished plate, so the
             cut-out is pixel-identical to the photo underneath: plate-aligned (type-behind beats) or
             trimmed to her silhouette (collage).
  b-roll     generated stills (assets/broll/gen) -> custom LUT applied once (mix 0.55) -> social finish -> JPG.
  montage    WhatsApp stills -> social finish -> JPG.
  videos     graded frame sequences -> temporal denoise -> lanczos upscale -> social finish -> H.264 (short GOP).

The social finish is classical photo finishing only: chroma denoise, local contrast ("clarity"),
a gentle S-curve, vibrance that protects skin tones, and luma unsharp masking. Nothing is generated or
re-synthesised: every pixel of her face is the photographed pixel, filtered.

Usage: social_assets.py <project_root> [photos|cutouts|broll|montage|video|fonts|fx ...]   (default: all)
"""
import glob, os, shutil, subprocess, sys

import cv2
import numpy as np

ROOT = sys.argv[1]
sys.path.insert(0, os.path.dirname(__file__))
from social_common import Social  # noqa: E402

PUB = os.path.join(ROOT, "studio", "public")
GRADED = os.path.join(ROOT, "work", "graded")
CUT = os.path.join(ROOT, "work", "social", "cutouts")
LUT = os.path.join(ROOT, "assets", "luts", "no_hurry_warm_memory_film.cube")
BROLL_LUT_MIX = 0.55
FULL_RES_ZOOM = 1.25


# ------------------------------------------------------------------ io
def read_rgb(path):
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im is None:
        raise FileNotFoundError(path)
    scale = 65535.0 if im.dtype == np.uint16 else 255.0
    if im.ndim == 3 and im.shape[2] == 4:
        im = im[..., :3]
    return cv2.cvtColor(im.astype(np.float32) / scale, cv2.COLOR_BGR2RGB)


def to8(rgb):
    return (np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8)


def write_jpg(path, rgb, q=92):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cv2.imwrite(path, cv2.cvtColor(to8(rgb), cv2.COLOR_RGB2BGR),
                [cv2.IMWRITE_JPEG_QUALITY, q, cv2.IMWRITE_JPEG_OPTIMIZE, 1, cv2.IMWRITE_JPEG_SAMPLING_FACTOR, 0x111111])


def write_webp_rgba(path, rgb, alpha, q=92):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bgra = np.dstack([cv2.cvtColor(to8(rgb), cv2.COLOR_RGB2BGR), to8(alpha)])
    cv2.imwrite(path, bgra, [cv2.IMWRITE_WEBP_QUALITY, q])


# ------------------------------------------------------------------ the social finish
def finish(rgb, px_per_out, clarity=0.28, contrast=0.12, vibrance=0.14, sharpen=0.6):
    """px_per_out: source pixels per output pixel at zoom 1 (sets the sharpening radius at screen scale)."""
    h = rgb.shape[0]
    ycc = cv2.cvtColor(np.clip(rgb, 0, 1), cv2.COLOR_RGB2YCrCb)
    s = max(0.6, 0.9 * px_per_out)                                   # chroma noise only; luma untouched here
    for c in (1, 2):
        ycc[..., c] = cv2.GaussianBlur(ycc[..., c], (0, 0), s)
    y = ycc[..., 0]
    big = cv2.GaussianBlur(y, (0, 0), 0.012 * h)                      # clarity, weighted to the mid-tones
    y = y + clarity * (y - big) * np.clip(4 * y * (1 - y), 0, 1)
    y = np.clip(y, 0, 1)
    y = y - contrast * np.sin(2 * np.pi * y) / (2 * np.pi)            # S-curve, end points fixed
    ycc[..., 0] = y
    rgb = np.clip(cv2.cvtColor(ycc, cv2.COLOR_YCrCb2RGB), 0, 1)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)                        # H 0..360, S, V 0..1
    hue = hsv[..., 0]
    skin = np.clip(1 - np.abs(hue - 25) / 25, 0, 1) * np.clip(hsv[..., 1] * 4, 0, 1)
    gain = 1 + vibrance * (1 - hsv[..., 1]) * (1 - 0.75 * skin)       # skin keeps its own saturation
    hsv[..., 1] = np.clip(hsv[..., 1] * gain, 0, 1)
    rgb = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
    ycc = cv2.cvtColor(np.clip(rgb, 0, 1), cv2.COLOR_RGB2YCrCb)
    y = ycc[..., 0]
    d = y - cv2.GaussianBlur(y, (0, 0), max(0.7, 0.75 * px_per_out))
    d *= np.clip((np.abs(d) - 0.003) / 0.008, 0, 1)                    # threshold: noise is not sharpened
    ycc[..., 0] = np.clip(y + sharpen * d, 0, 1)
    return np.clip(cv2.cvtColor(ycc, cv2.COLOR_YCrCb2RGB), 0, 1)


# ------------------------------------------------------------------ what the storyboard needs
def usage(S):
    photos, behind, collage, broll, montage = {}, set(), [], set(), []

    def need(stem, z):
        photos[stem] = max(photos.get(stem, 1.0), z)

    for b in S.beats:
        v = b["visual"]
        k = v["kind"]
        if k in ("photo", "behind"):
            need(v["src"], max(v["fr"][2], v["to"][2]))
            for _, stem, fr in v.get("punch", []):
                need(stem, fr[2])
            for z in v.get("stutter", []):
                need(v["src"], z)
            if k == "behind":
                behind.add(v["src"])
        elif k == "broll":
            broll.add(v["src"])
        elif k == "flicker":
            for s in v["srcs"]:
                need(s, 1.0)
        elif k == "evidence":
            need(v["bg"], 1.0)
            for c in v["cards"]:
                need(c["src"], 1.0)
        elif k == "collage":
            collage = list(v["cutouts"])
        elif k == "montage":
            montage = [s for s, _ in v["items"] if not s.startswith("VID")]
    return photos, behind, collage, broll, montage


def plate_size(stem, zmax):
    w, h = (3000, 4000) if zmax > FULL_RES_ZOOM else (1800, 2400)
    return w, h


# ------------------------------------------------------------------ jobs
def do_photos(S):
    photos, *_ = usage(S)
    for stem, z in sorted(photos.items()):
        out = os.path.join(PUB, "photos", stem + ".jpg")
        rgb = read_rgb(os.path.join(GRADED, stem + ".png"))
        w, h = plate_size(stem, z)
        if rgb.shape[1] != w:
            rgb = cv2.resize(rgb, (w, h), interpolation=cv2.INTER_AREA)
        write_jpg(out, finish(rgb, h / 1920))
        print(f"photo  {stem:24s} {w}x{h}  max zoom {z:.2f}")


def finished_plate(stem):
    p = os.path.join(PUB, "photos", stem + ".jpg")
    if not os.path.exists(p):
        raise SystemExit(f"run the photos job first ({p} missing)")
    return read_rgb(p)


def keep_main_body(a):
    """Drop stray matte islands: keep connected parts with at least 5 % of the largest part's area."""
    n, lab, stats, _ = cv2.connectedComponentsWithStats((a > 0.5).astype(np.uint8), connectivity=8)
    if n <= 2:
        return a
    areas = stats[1:, cv2.CC_STAT_AREA]
    keep = np.zeros(n, bool)
    keep[1:] = areas >= 0.05 * areas.max()
    region = cv2.dilate(keep[lab].astype(np.uint8), np.ones((15, 15), np.uint8)) > 0
    return a * region


def do_cutouts(S):
    _, behind, collage, _, _ = usage(S)
    for stem in sorted(behind | set(collage)):
        mp = os.path.join(CUT, stem + "_mask.png")
        if not os.path.exists(mp):
            print(f"cutout {stem:24s} MISSING matte - skipped"); continue
        plate = finished_plate(stem) if os.path.exists(os.path.join(PUB, "photos", stem + ".jpg")) else \
            finish(cv2.resize(read_rgb(os.path.join(GRADED, stem + ".png")), (1800, 2400), interpolation=cv2.INTER_AREA), 1.25)
        h, w = plate.shape[:2]
        a = cv2.imread(mp, cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255
        a = keep_main_body(a)
        a = np.clip(cv2.resize(a, (w, h), interpolation=cv2.INTER_CUBIC), 0, 1)
        if stem in behind:                                       # same geometry as the photo: drop-in layer
            write_webp_rgba(os.path.join(PUB, "cutouts", stem + ".webp"), plate, a)
        if stem in collage:                                      # trimmed to her silhouette
            ys, xs = np.where(a > 0.02)
            y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            sub, sa = plate[y0:y1, x0:x1], a[y0:y1, x0:x1]
            if sub.shape[0] > 1700:
                f = 1700 / sub.shape[0]
                size = (int(sub.shape[1] * f), 1700)
                sub, sa = cv2.resize(sub, size, interpolation=cv2.INTER_AREA), cv2.resize(sa, size, interpolation=cv2.INTER_AREA)
            write_webp_rgba(os.path.join(PUB, "collage", stem + ".webp"), sub, sa)
        print(f"cutout {stem:24s} {'behind ' if stem in behind else ''}{'collage' if stem in collage else ''}")


def lut_once(rgb, mix):
    """Custom LUT through FFmpeg lut3d (tetrahedral), the same path as the main grade; blended at `mix`."""
    h, w = rgb.shape[:2]
    raw = (np.clip(rgb, 0, 1) * 65535 + 0.5).astype("<u2").tobytes()
    out = subprocess.run(["ffmpeg", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb48le", "-s", f"{w}x{h}", "-i", "-",
                          "-vf", f"lut3d=file='{LUT}':interp=tetrahedral", "-f", "rawvideo", "-pix_fmt", "rgb48le", "-"],
                         input=raw, capture_output=True, check=True).stdout
    l = np.frombuffer(out, "<u2").reshape(h, w, 3).astype(np.float32) / 65535
    return rgb * (1 - mix) + l * mix


def do_broll(S):
    _, _, _, broll, _ = usage(S)
    for name in sorted(broll):
        src = os.path.join(ROOT, "assets", "broll", "gen", name + ".webp")
        rgb = read_rgb(src)
        rgb = finish(lut_once(rgb, BROLL_LUT_MIX), rgb.shape[0] / 1920, clarity=0.25, vibrance=0.06)
        write_jpg(os.path.join(PUB, "broll", name + ".jpg"), rgb)
        print(f"broll  {name:24s} {rgb.shape[1]}x{rgb.shape[0]}  LUT once @ {BROLL_LUT_MIX}")


def do_montage(S):
    *_, montage = usage(S)
    for stem in montage:
        rgb = read_rgb(os.path.join(GRADED, stem + ".png"))
        write_jpg(os.path.join(PUB, "montage", stem + ".jpg"), finish(rgb, 1.0, sharpen=0.8))
        print(f"montage {stem}")


def frames(d):
    return sorted(glob.glob(os.path.join(GRADED, d, "*.png")))


def encode(out, w, h, fps, frame_iter):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", str(fps),
                            "-i", "-", "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-g", "15", "-bf", "0",
                            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                            "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    n = 0
    for f in frame_iter:
        enc.stdin.write(to8(f).tobytes()); n += 1
    enc.stdin.close(); enc.wait()
    if enc.returncode:
        raise SystemExit(f"encode failed: {out}")
    return n


def denoised_upscaled(src_dir, fps, w, h, extra_vf=""):
    """Graded PNG sequence -> hqdn3d (temporal) -> lanczos upscale, as float RGB frames."""
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-framerate", str(fps), "-i", os.path.join(GRADED, src_dir, "%05d.png"),
                          "-vf", f"hqdn3d=2.5:2:4:4,{extra_vf}scale={w}:{h}:flags=lanczos", "-f", "rawvideo", "-pix_fmt", "rgb48le", "-"],
                         stdout=subprocess.PIPE)
    size = w * h * 3 * 2
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, "<u2").reshape(h, w, 3).astype(np.float32) / 65535
    p.wait()


def do_video(S):
    # the dusk walk: portrait 480x848 @30 -> 1088x1920
    n = encode(os.path.join(PUB, "video", "VID-20261005-WA0000.mp4"), 1088, 1920, 30,
               (finish(f, 1.6, clarity=0.28, sharpen=0.75) for f in denoised_upscaled("VID-20261005-WA0000", 30, 1088, 1920)))
    print(f"video  VID-20261005-WA0000 1088x1920 @30  {n} frames")
    # landscape 768x576 @24 -> 1080x1920 frame: the clip contained over a blurred, darkened copy of itself
    w, h = 1080, 810
    fg = denoised_upscaled("VID-20260820-WA0006", 24, w, h)

    def comp():
        for f in fg:
            f = finish(f, 1.4, clarity=0.25, sharpen=0.7)
            bg = cv2.resize(f, (2560, 1920), interpolation=cv2.INTER_AREA)[:, 740:1820]
            bg = cv2.GaussianBlur(bg, (0, 0), 38) * 0.45
            y0 = (1920 - h) // 2
            bg[y0:y0 + h] = f
            yield bg
    n = encode(os.path.join(PUB, "video", "VID-20260820-WA0006.mp4"), 1080, 1920, 24, comp())
    print(f"video  VID-20260820-WA0006 1080x1920 @24 (contained)  {n} frames")


def do_fonts(S):
    want = ["PlusJakartaSans-500.ttf", "PlusJakartaSans-700.ttf", "PlusJakartaSans-800.ttf",
            "CormorantGaramond-600Italic.ttf", "CormorantGaramond-700Italic.ttf", "JetBrainsMono-Medium.ttf"]
    os.makedirs(os.path.join(PUB, "fonts"), exist_ok=True)
    for f in want:
        shutil.copy2(os.path.join(ROOT, "assets", "fonts", f), os.path.join(PUB, "fonts", f))
        print(f"font   {f}")


def do_fx(S):
    """Film grain tiles (monochrome, 540x960, shown at 2x so a grain is ~2 output pixels)."""
    rng = np.random.default_rng(7)
    os.makedirs(os.path.join(PUB, "fx"), exist_ok=True)
    for i in range(6):
        g = rng.normal(0, 1, (960, 540)).astype(np.float32)
        g = cv2.GaussianBlur(g, (0, 0), 0.55)
        g = np.clip(128 + g / g.std() * 34, 0, 255).astype(np.uint8)
        cv2.imwrite(os.path.join(PUB, "fx", f"grain_{i}.png"), g)
    print("fx     grain_0..5.png")


JOBS = {"photos": do_photos, "cutouts": do_cutouts, "broll": do_broll, "montage": do_montage,
        "video": do_video, "fonts": do_fonts, "fx": do_fx}

if __name__ == "__main__":
    S = Social(ROOT)
    for j in (sys.argv[2:] or list(JOBS)):
        JOBS[j](S)
