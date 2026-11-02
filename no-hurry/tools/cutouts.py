#!/usr/bin/env python3
"""Subject cut-outs (alpha mattes) of her from the GRADED photos, for type-behind-subject and the collage.

Only a matte is computed; every visible pixel of her (face included) is the original graded pixel.
Usage: cutouts.py <project_root> <model> <photo.jpg> [...]
Writes work/social/cutouts/<stem>.png (RGBA, half resolution) and <stem>_mask.png
"""
import os, sys, time

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

root, model = sys.argv[1], sys.argv[2]
session = new_session(model)
out = os.path.join(root, "work", "social", "cutouts")
os.makedirs(out, exist_ok=True)
for name in sys.argv[3:]:
    stem = os.path.splitext(name)[0]
    g = cv2.imread(os.path.join(root, "work", "graded", stem + ".png"), cv2.IMREAD_UNCHANGED)
    g8 = cv2.cvtColor((g / 257).astype(np.uint8), cv2.COLOR_BGR2RGB)
    h, w = g8.shape[:2]
    small = Image.fromarray(g8).resize((w // 2, h // 2), Image.LANCZOS)
    t = time.time()
    mask = remove(small, session=session, only_mask=True, post_process_mask=True)
    rgba = small.copy(); rgba.putalpha(mask)
    rgba.save(os.path.join(out, stem + ".png"))
    mask.save(os.path.join(out, stem + "_mask.png"))
    print(f"{stem}: {small.size} matte in {time.time() - t:.1f}s, coverage {np.asarray(mask).mean() / 255:.1%}", flush=True)
