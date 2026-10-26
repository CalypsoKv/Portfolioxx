#!/usr/bin/env python3
"""Build labelled contact sheets for photos (EXIF-oriented) and sampled video frames.

Usage: contact_sheets.py <project_root>
Outputs: work/contact_sheets/photos_XX.jpg, work/contact_sheets/video_<name>.jpg
"""
import glob, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont, ImageOps

root = sys.argv[1]
out_dir = os.path.join(root, "work", "contact_sheets")
os.makedirs(out_dir, exist_ok=True)
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)

def sheet(images, labels, cols, cell_w, cell_h, path):
    rows = (len(images) + cols - 1) // cols
    pad, lab = 8, 30
    W = cols * (cell_w + pad) + pad
    H = rows * (cell_h + lab + pad) + pad
    canvas = Image.new("RGB", (W, H), (24, 24, 24))
    d = ImageDraw.Draw(canvas)
    for i, (im, label) in enumerate(zip(images, labels)):
        r, c = divmod(i, cols)
        x = pad + c * (cell_w + pad)
        y = pad + r * (cell_h + lab + pad)
        t = ImageOps.contain(im, (cell_w, cell_h))
        canvas.paste(t, (x + (cell_w - t.width) // 2, y + (cell_h - t.height) // 2))
        d.text((x + 4, y + cell_h + 3), label, fill=(235, 225, 205), font=font)
    canvas.save(path, quality=88)
    print(path, canvas.size)

photos = sorted(glob.glob(os.path.join(root, "assets", "photos", "*.jpg")))
per = 8
for n in range(0, len(photos), per):
    chunk = photos[n:n + per]
    ims = [ImageOps.exif_transpose(Image.open(p)).convert("RGB") for p in chunk]
    for im in ims:
        im.thumbnail((900, 900))
    labels = [f"{n + i + 1:02d} {os.path.basename(p)[:24]}" for i, p in enumerate(chunk)]
    sheet(ims, labels, 4, 420, 560, os.path.join(out_dir, f"photos_{n // per + 1:02d}.jpg"))

for v in sorted(glob.glob(os.path.join(root, "assets", "videos", "*.mp4"))):
    name = os.path.splitext(os.path.basename(v))[0]
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                         "-of", "csv=p=0", v]).decode())
    step = 1.0 if dur <= 24 else dur / 24
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", f"fps=1/{step},scale=480:-2",
                        os.path.join(td, "f%03d.jpg")], check=True)
        frames = sorted(glob.glob(os.path.join(td, "f*.jpg")))
        ims = [Image.open(f).convert("RGB") for f in frames]
        labels = [f"t={i * step:5.1f}s" for i in range(len(ims))]
        portrait = ims[0].height > ims[0].width
        cw, ch = (270, 480) if portrait else (400, 300)
        sheet(ims, labels, 6 if portrait else 5, cw, ch, os.path.join(out_dir, f"video_{name}.jpg"))
