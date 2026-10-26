"""Minimal .cube reader + trilinear sampler, used only for analysis and QA checks.
The film itself is graded with FFmpeg's lut3d filter (see grade.py)."""
import numpy as np


def read_cube(path):
    size, rows = None, []
    for line in open(path):
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if s.startswith("LUT_3D_SIZE"):
            size = int(s.split()[1]); continue
        if s[0].isalpha():
            continue
        rows.append([float(v) for v in s.split()])
    lut = np.asarray(rows, np.float32)
    assert size and len(lut) == size ** 3, (size, len(lut))
    # .cube order: red fastest -> index [b, g, r]
    return lut.reshape(size, size, size, 3)


def apply_trilinear(lut, rgb):
    n = lut.shape[0] - 1
    x = np.clip(rgb, 0, 1) * n
    i0 = np.floor(x).astype(int).clip(0, n - 1)
    f = x - i0
    r0, g0, b0 = i0[..., 0], i0[..., 1], i0[..., 2]
    fr, fg, fb = f[..., 0:1], f[..., 1:2], f[..., 2:3]
    out = 0
    for db in (0, 1):
        for dg in (0, 1):
            for dr in (0, 1):
                w = (fr if dr else 1 - fr) * (fg if dg else 1 - fg) * (fb if db else 1 - fb)
                out = out + w * lut[b0 + db, g0 + dg, r0 + dr]
    return out
