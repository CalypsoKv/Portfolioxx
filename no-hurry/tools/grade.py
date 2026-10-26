#!/usr/bin/env python3
"""Grade every source asset ONCE into work/graded/ (16-bit PNG stills, PNG frame folders for video).

Pipeline per pixel (the only place the LUT is ever applied):
  1. decode; stills: EXIF orientation + embedded ICC (Display P3) -> sRGB; video: BT.709 -> RGB
  2. per-asset correction BEFORE the LUT: exposure + white balance (linear light),
     shadow toe / highlight shoulder (display gamma), saturation with green muting and skin protection
  3. FFmpeg lut3d (tetrahedral) with assets/luts/no_hurry_warm_memory_film.cube
  4. LUT intensity mix:  out = corrected * (1 - mix) + lut(corrected) * mix
The renderer reads only these graded files and never applies the LUT again.

Usage: grade.py <project_root> [asset ...]      (default: every asset in edit/grade.json)
       grade.py <project_root> --compare a b ... (writes before/after sheets to work/qa/)
"""
import json, os, subprocess, sys, tempfile

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from imageio_nh import linear_to_srgb, load_srgb, luma, srgb_to_linear  # noqa: E402

ROOT = sys.argv[1]
LUT = os.path.join(ROOT, "assets", "luts", "no_hurry_warm_memory_film.cube")
GRADED = os.path.join(ROOT, "work", "graded")


def load_params():
    cfg = json.load(open(os.path.join(ROOT, "edit", "grade.json")))
    out = {}
    for name, p in cfg["assets"].items():
        merged = dict(cfg["classes"][p["class"]])
        merged.update({k: v for k, v in p.items() if k != "class"})
        merged["class"] = p["class"]
        out[name] = merged
    return out


def correct(v, p):
    """v: float32 sRGB-encoded HxWx3 in [0,1]. Returns corrected sRGB-encoded float32."""
    lin = srgb_to_linear(v)
    gains = np.array(p.get("wb", [1.0, 1.0, 1.0]), np.float32)
    gains /= gains @ np.array([0.2126, 0.7152, 0.0722], np.float32)  # keep luminance
    lin = lin * gains * (2.0 ** p.get("ev", 0.0))
    g = linear_to_srgb(lin)
    toe = p.get("toe", 0.0)
    if toe:
        # local shadow lift: tone-map a blurred luminance base, then re-apply the base gain to the
        # full-detail image, so the dark car interior opens up without losing its texture (no haze)
        y = np.clip(luma(g), 0, 1)
        sigma = max(2.0, 0.018 * min(g.shape[:2]))
        base = cv2.GaussianBlur(y, (0, 0), sigma)
        w = (1 - base) ** 2
        lifted = w * np.power(base, 1 / (1 + toe)) + (1 - w) * base
        gain = np.clip(lifted / np.maximum(base, 1e-4), 1.0, 2.2)
        g = g * gain[..., None]
    knee = p.get("knee")
    if knee:
        # soft shoulder: slope 1 at the knee, asymptote at 1.0 -> restrained, creamy highlights
        g = np.where(g > knee, knee + (1 - knee) * np.tanh((g - knee) / (1 - knee)), g)
    con = p.get("contrast", 1.0)
    if con != 1.0:
        piv = p.get("pivot", 0.42)
        g = piv + (g - piv) * con
    g = np.clip(g, 0, 1)
    sat, gd = p.get("sat", 1.0), p.get("green_desat", 0.0)
    if sat != 1.0 or gd:
        hsv = cv2.cvtColor(g.astype(np.float32), cv2.COLOR_RGB2HSV)
        hue = hsv[..., 0]
        greens = np.exp(-0.5 * ((hue - 105) / 32) ** 2)            # yellow-green .. green .. teal-green
        skin = np.exp(-0.5 * ((((hue + 180) % 360) - 180 - 22) / 14) ** 2)
        s_eff = sat * (1 - gd * greens)
        s_eff = s_eff * (1 - skin) + np.clip(s_eff, 0.94, 1.03) * skin  # skin hues barely move
        y = luma(g)[..., None]
        g = np.clip(y + (g - y) * s_eff[..., None], 0, 1)
    return g.astype(np.float32)


def ffmpeg_lut(rgb16_frames_dir, out_dir, w, h):
    os.makedirs(out_dir, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(rgb16_frames_dir, "%05d.png"),
                    "-vf", f"format=rgb48le,lut3d=file='{LUT}':interp=tetrahedral",
                    "-pix_fmt", "rgb48le", os.path.join(out_dir, "%05d.png")], check=True)


def write16(path, g):
    cv2.imwrite(path, cv2.cvtColor((np.clip(g, 0, 1) * 65535 + 0.5).astype(np.uint16), cv2.COLOR_RGB2BGR))


def read16(path):
    return cv2.cvtColor(cv2.imread(path, cv2.IMREAD_UNCHANGED), cv2.COLOR_BGR2RGB).astype(np.float32) / 65535


def lut_frames(frames, mix):
    """Apply the .cube to a list of corrected float frames via FFmpeg lut3d, then mix."""
    with tempfile.TemporaryDirectory(dir=os.path.join(ROOT, "work")) as td:
        a, b = os.path.join(td, "in"), os.path.join(td, "out")
        os.makedirs(a)
        for i, f in enumerate(frames):
            write16(os.path.join(a, f"{i + 1:05d}.png"), f)
        ffmpeg_lut(a, b, frames[0].shape[1], frames[0].shape[0])
        out = []
        for i, f in enumerate(frames):
            l = read16(os.path.join(b, f"{i + 1:05d}.png"))
            out.append(f * (1 - mix) + l * mix)
        return out


def video_frames(path):
    """Decode a video (respecting rotation) to float sRGB frames using BT.709 limited-range maths."""
    info = json.loads(subprocess.check_output(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height:stream_side_data=rotation", "-of", "json", path]))
    st = info["streams"][0]
    w, h = st["width"], st["height"]
    rot = 0
    for sd in st.get("side_data_list", []):
        rot = int(sd.get("rotation", 0))
    if abs(rot) == 90:
        w, h = h, w
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-vf",
                                   "scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb48le",
                                   "-f", "rawvideo", "-"])
    arr = np.frombuffer(raw, np.uint16).reshape(-1, h, w, 3).astype(np.float32) / 65535
    return list(arr)


def grade_asset(name, p):
    src = os.path.join(ROOT, "assets", "photos" if name.lower().endswith(".jpg") else "videos", name)
    stem = os.path.splitext(name)[0]
    mix = p.get("lut_mix", 0.65)
    if name.lower().endswith(".jpg"):
        v = load_srgb(src)
        c = correct(v, p)
        g = lut_frames([c], mix)[0]
        if p.get("denoise"):
            g = denoise(g, p["denoise"])
        write16(os.path.join(GRADED, stem + ".png"), g)
        write16(os.path.join(GRADED, "_corrected_" + stem + ".png"), c)
        print(f"graded {name}  class={p['class']} mix={mix}")
    else:
        frames = video_frames(src)
        corr = [correct(f, p) for f in frames]
        graded = lut_frames(corr, mix)
        d = os.path.join(GRADED, stem)
        os.makedirs(d, exist_ok=True)
        for i, g in enumerate(graded):
            if p.get("denoise"):
                g = denoise(g, p["denoise"])
            write16(os.path.join(d, f"{i:05d}.png"), g)
        write16(os.path.join(GRADED, "_corrected_" + stem + "_00000.png"), corr[len(corr) // 2])
        print(f"graded {name}  {len(graded)} frames  class={p['class']} mix={mix}")


def denoise(g, strength):
    u8 = (np.clip(g, 0, 1) * 255).astype(np.uint8)
    d = cv2.fastNlMeansDenoisingColored(u8, None, strength, strength, 5, 15).astype(np.float32) / 255
    # keep 16-bit gradations: apply only the removed noise difference, smoothly
    return np.clip(g + (d - u8.astype(np.float32) / 255), 0, 1)


def compare(names, params):
    """Before (sRGB-converted original) | corrected | final graded, per asset."""
    os.makedirs(os.path.join(ROOT, "work", "qa"), exist_ok=True)
    rows = []
    for n in names:
        stem = os.path.splitext(n)[0]
        before = load_srgb(os.path.join(ROOT, "assets", "photos", n), max_side=900)
        corr = cv2.resize(read16(os.path.join(GRADED, "_corrected_" + stem + ".png")), before.shape[1::-1],
                          interpolation=cv2.INTER_AREA)
        fin = cv2.resize(read16(os.path.join(GRADED, stem + ".png")), before.shape[1::-1], interpolation=cv2.INTER_AREA)
        row = np.concatenate([before, np.ones((before.shape[0], 12, 3), np.float32) * 0.08, corr,
                              np.ones((before.shape[0], 12, 3), np.float32) * 0.08, fin], axis=1)
        rows.append(cv2.resize(row, (2400, int(row.shape[0] * 2400 / row.shape[1])), interpolation=cv2.INTER_AREA))
    for i, r in enumerate(rows):
        out = os.path.join(ROOT, "work", "qa", f"grade_compare_{os.path.splitext(names[i])[0]}.jpg")
        cv2.imwrite(out, cv2.cvtColor((r * 255).astype(np.uint8), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
        print(out)


def main():
    params = load_params()
    os.makedirs(GRADED, exist_ok=True)
    args = sys.argv[2:]
    if args and args[0] == "--compare":
        compare(args[1:], params)
        return
    for name in (args or list(params)):
        grade_asset(name, params[name])


if __name__ == "__main__":
    main()
