"""Portrait assets for the site, built from the owner's photo.

Input: the background-removed cut-out (RGBA PNG) made with rembg (isnet-general-use) from the photo Jahan supplied.
The source photo is not committed: its edges show other guests, and the crop used for the cut-out excludes them.

Run: python3 -I scripts/portrait/portrait.py <cut-out.png> public/people
"""
import os
import sys

import numpy as np
from PIL import Image, ImageChops, ImageFilter, ImageOps

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
cut = Image.open(src).convert("RGBA")
W, H = cut.size
alpha = cut.split()[3]
BONE = np.array([238, 232, 218], float)
INK = np.array([17, 16, 13], float)


def tone(img, gamma=0.9):
    g = np.asarray(ImageOps.autocontrast(img.convert("L"), cutoff=1), float) / 255.0
    g = g ** gamma
    return Image.fromarray((INK * (1 - g[..., None]) + BONE * g[..., None]).astype(np.uint8))


def outline(width_out=9, width_in=3):
    return ImageChops.subtract(alpha.filter(ImageFilter.MaxFilter(width_out)), alpha.filter(ImageFilter.MinFilter(width_in)))


# 1. Engraved cut-out: XDoG line drawing inside the silhouette, hand-weight outline, transparent outside.
g = ImageOps.autocontrast(cut.convert("RGB").convert("L"), cutoff=1)
a = np.asarray(g.filter(ImageFilter.GaussianBlur(1.1)), float) / 255.0
b = np.asarray(g.filter(ImageFilter.GaussianBlur(1.1 * 1.7)), float) / 255.0
d = a - 0.982 * b
e = np.clip(np.where(d >= 0.012, 1.0, 1.0 + np.tanh(70 * (d - 0.012))), 0, 1)
line = Image.fromarray((INK * (1 - e[..., None]) + BONE * e[..., None]).astype(np.uint8)).convert("RGBA")
edge = outline()
ink = Image.new("RGBA", (W, H), tuple(int(v) for v in INK) + (255,))
line.paste(ink, (0, 0), edge.point(lambda v: 255 if v > 100 else 0))
line.putalpha(ImageChops.lighter(alpha, edge.point(lambda v: 255 if v > 100 else 0)))
line.save(os.path.join(out, "jahan-engraved.webp"), "WEBP", quality=80, method=6)

# 2. Press photo: duotone figure with the same outline on paper, 4:5, for the About page.
fig = tone(cut.convert("RGB"))
paper = Image.new("RGB", (W, H), tuple(int(v) for v in BONE))
paper.paste(fig, (0, 0), alpha)
paper.paste(Image.new("RGB", (W, H), tuple(int(v) for v in INK)), (0, 0), edge.point(lambda v: 255 if v > 90 else 0))
press = paper.crop((0, 0, W, round(W * 1.25))).resize((640, 800), Image.LANCZOS)
press.save(os.path.join(out, "jahan-press.webp"), "WEBP", quality=82, method=6)

# 3. Pass photo: a square head crop for the press passes.
head = paper.crop((190, 30, 610, 450)).resize((300, 300), Image.LANCZOS)
head.save(os.path.join(out, "jahan-pass.webp"), "WEBP", quality=82, method=6)
print("ok", W, H)
