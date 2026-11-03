#!/usr/bin/env python3
"""Matte of a SMALL subject (her, far down the street): run BiRefNet on a crop around a hint point, keep the parts
that touch the hint, and write a full-size alpha for the photo. One photo per process (BiRefNet's onnxruntime arena
grows across images). Only an alpha channel is produced; no pixel of the photo is changed.

Usage: matte_hint.py <project_root> <public photo path> <cx> <cy> <crop_w_frac> <crop_h_frac> <out_mask.png>
"""
import sys

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

root, src, cx, cy, fw, fh, out = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:7]), sys.argv[7]
img = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2RGB)
H, W = img.shape[:2]
x0, x1 = int(max(0, (cx - fw / 2) * W)), int(min(W, (cx + fw / 2) * W))
y0, y1 = int(max(0, (cy - fh / 2) * H)), int(min(H, (cy + fh / 2) * H))
crop = Image.fromarray(img[y0:y1, x0:x1])
mask = np.asarray(remove(crop, session=new_session("birefnet-portrait"), only_mask=True, post_process_mask=True), np.float32) / 255
n, lab, stats, _ = cv2.connectedComponentsWithStats((mask > 0.5).astype(np.uint8))
hx, hy = int(cx * W) - x0, int(cy * H) - y0
keep = np.zeros(n, bool)
for i in range(1, n):                                   # parts within reach of the hint (her, and anyone walking with her)
    x, y, w, h, a = stats[i]
    if a > 0.002 * mask.size and x - w < hx < x + 2 * w and y - h < hy < y + 2 * h:
        keep[i] = True
region = cv2.dilate(keep[lab].astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
full = np.zeros((H, W), np.float32)
full[y0:y1, x0:x1] = mask * region
cv2.imwrite(out, (full * 255).astype(np.uint8))
print(f"{src.split('/')[-1]}: coverage {full.mean():.2%} of the photo")
