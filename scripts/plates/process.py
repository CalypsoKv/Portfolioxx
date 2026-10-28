#!/usr/bin/env python3
"""Normalise plates into public/plates.

Inputs:  art-src/ai/<slug>.webp        generated engravings (a thin frame is cropped off)
         art-src/rendered/<slug>.png   code-drawn plates from render.mjs
Outputs: public/plates/<slug>.webp (1536x864) and public/plates/thumb/<slug>.webp (640x360)
Every plate is mapped through the same ink -> cream duotone so the two sources share one palette.
Run: python3 -I scripts/plates/process.py
"""
import json, os
from PIL import Image, ImageOps

INK, PAPER = (17, 16, 13), (245, 239, 224)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.makedirs(os.path.join(ROOT, "public/plates/thumb"), exist_ok=True)
meta = json.load(open(os.path.join(ROOT, "art-src/plate-prompts.json")))

for p in meta["plates"]:
    slug = p["slug"]
    ai = os.path.join(ROOT, "art-src/ai", slug + ".webp")
    code = os.path.join(ROOT, "art-src/rendered", slug + ".png")
    src = ai if os.path.exists(ai) else code
    if not os.path.exists(src):
        print("skip", slug); continue
    im = Image.open(src).convert("RGB")
    if src == ai:
        w, h = im.size
        cx, cy = int(w * 0.042), int(h * 0.046)
        im = im.crop((cx, cy, w - cx, h - cy)).resize((1536, 864), Image.LANCZOS)
    g = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1)
    out = ImageOps.colorize(g, black=INK, white=PAPER)
    out.save(os.path.join(ROOT, "public/plates", slug + ".webp"), quality=80, method=6)
    out.resize((640, 360), Image.LANCZOS).save(os.path.join(ROOT, "public/plates/thumb", slug + ".webp"), quality=74, method=6)
    p["file"] = f"/plates/{slug}.webp"
    print("ok", slug, "(ai)" if src == ai else "(code)")
