#!/usr/bin/env python3
"""MOTION LAB (side experiment): turn the still photo beats into moving plates, in one camera language.

What good editors do to stills, and how it is done here:
  1. depth parallax ("3D photo"): a monocular depth map (Depth Anything V2 small, ONNX) drives a virtual camera;
     every pixel moves by its depth, so the car interior slides past the street while the camera pushes in.
  2. layers: the car interior (near) and her are cut into their own layers; the background behind them is filled
     (LaMa, ONNX), so the camera can look slightly "around" them without smearing.
  3. her face is never warped: she is a rigid layer (uniform scale + move only, like a Ken Burns on her alone).
  4. stop-motion from bursts: sequential photos are registered on the far background (SIFT + homography), so she
     steps forward through one stable street while the camera keeps moving.
  5. one lens for every shot: the same eased push-in, a gentle depth of field (rack focus where the story asks),
     the hazard lamp flashing amber on the car interior on the real relay grid, sunlit dust where the car is lit.
Diagrams and glitch hits are baked into the plates; type, sound, transitions stay in Remotion.

Usage: motion_lab.py <project_root> [shot ids ...]
Writes studio/public/motion/<shot>.mp4 (private media) and work/social/motionlab/manifest.json
"""
import importlib.util, json, math, os, subprocess, sys, zlib
from concurrent.futures import ProcessPoolExecutor

import cv2
import numpy as np

ROOT = sys.argv[1]
sys.path.insert(0, os.path.dirname(__file__))
from social_common import Social, TICK_PERIOD, TICK_START  # noqa: E402

FPS, W, H = 30, 1080, 1920
MX, MY = 135, 240                      # canvas margin around the frame, px per side
CW, CH = W + 2 * MX, H + 2 * MY
PUB = os.path.join(ROOT, "studio", "public")
LAB = os.path.join(ROOT, "work", "social", "motionlab")
MODELS = os.path.join(ROOT, "work", "models", "motion")
AMBER = np.array([1.0, 0.58, 0.16], np.float32)
GY, GX = np.mgrid[0:H, 0:W].astype(np.float32)


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SPEC = load(os.path.join(ROOT, "edit", "social", "motion.py"), "motion")
S = Social(ROOT)
META = json.load(open(os.path.join(ROOT, "work", "social", "studio_meta.json")))
SEQ = {b["id"]: b for b in META["beats"]}
BEAT = {b["id"]: b for b in S.beats}


def F(t):
    return int(round(t * FPS))


def smooth(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)


def travel(u):
    """Camera travel over a shot: near-constant speed with a soft start and landing, so no cut sits on a frozen frame
    (the same curve is used by the Remotion cut-out rig)."""
    u = min(max(u, 0.0), 1.0)
    return 0.8 * u + 0.2 * u * u * (3 - 2 * u)


# ------------------------------------------------------------------ images, geometry
def src_path(src):
    return os.path.join(PUB, src + ".jpg") if src.startswith("broll/") else os.path.join(PUB, "photos", src + ".jpg")


def read(path):
    return cv2.cvtColor(cv2.imread(path), cv2.COLOR_BGR2RGB).astype(np.float32) / 255


def cover(Wp, Hp, view):
    s = max(W / Wp, H / Hp) * view[2]
    w, h = Wp * s, Hp * s
    return s, min(max(W / 2 - view[0] * w, W - w), 0), min(max(H / 2 - view[1] * h, H - h), 0)


def to_canvas(img, view, interp=cv2.INTER_AREA):
    """Photo -> canvas (frame + margin) at the beat's framing; also returns photo->canvas mapping (s, ox, oy)."""
    Hp, Wp = img.shape[:2]
    s, left, top = cover(Wp, Hp, view)
    sc = cv2.resize(img, (max(1, round(Wp * s)), max(1, round(Hp * s))), interpolation=interp if s < 1 else cv2.INTER_CUBIC)
    M = np.float32([[1, 0, left + MX], [0, 1, top + MY]])
    out = cv2.warpAffine(sc, M, (CW, CH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return out, (s, left + MX, top + MY)


# ------------------------------------------------------------------ models
_depth = _lama = None


def depth_map(rgb):
    """Relative inverse depth, normalised to 0 (far) .. 1 (near)."""
    global _depth
    import onnxruntime as ort
    if _depth is None:
        _depth = ort.InferenceSession(os.path.join(MODELS, "depth-anything-v2-small", "onnx", "model.onnx"),
                                      providers=["CPUExecutionProvider"])
    h, w = rgb.shape[:2]
    tw = 518
    th = max(14, int(round(h / w * tw / 14)) * 14)
    x = cv2.resize(rgb, (tw, th), interpolation=cv2.INTER_AREA)
    x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
    out = _depth.run(None, {"pixel_values": x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
    d = cv2.resize(out.astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    lo, hi = np.percentile(d, [2, 98])
    d = np.clip((d - lo) / (hi - lo + 1e-6), 0, 1).astype(np.float32)
    return cv2.bilateralFilter(d, 9, 0.08, 9)


def lama(rgb, hole):
    """Fill `hole` (bool) from its surroundings with LaMa, at the best resolution a 512 crop allows."""
    global _lama
    import onnxruntime as ort
    if not hole.any():
        return rgb
    if _lama is None:
        _lama = ort.InferenceSession(os.path.join(MODELS, "LaMa-ONNX", "lama_fp32.onnx"), providers=["CPUExecutionProvider"])
    h, w = hole.shape
    ys, xs = np.where(hole)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    pad = int(0.3 * max(y1 - y0, x1 - x0)) + 48
    y0, y1, x0, x1 = max(0, y0 - pad), min(h, y1 + pad), max(0, x0 - pad), min(w, x1 + pad)
    crop, m = rgb[y0:y1, x0:x1], hole[y0:y1, x0:x1]
    a = cv2.resize(crop, (512, 512), interpolation=cv2.INTER_AREA)
    mm = cv2.dilate((cv2.resize(m.astype(np.uint8), (512, 512), interpolation=cv2.INTER_NEAREST)), np.ones((5, 5), np.uint8))
    a = a * (1 - mm[..., None])
    out = _lama.run(None, {"image": a.transpose(2, 0, 1)[None].astype(np.float32),
                           "mask": mm[None, None].astype(np.float32)})[0][0].transpose(1, 2, 0)
    if out.max() > 2:
        out = out / 255.0
    back = cv2.resize(np.clip(out, 0, 1).astype(np.float32), (x1 - x0, y1 - y0), interpolation=cv2.INTER_CUBIC)
    res = rgb.copy()
    soft = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 2)[..., None]
    soft = np.maximum(soft, m[..., None].astype(np.float32))
    res[y0:y1, x0:x1] = crop * (1 - soft) + back * soft
    return res


def fill_depth(d, hole, sigma=40):
    valid = (~hole).astype(np.float32)
    num = cv2.GaussianBlur(d * valid, (0, 0), sigma)
    den = cv2.GaussianBlur(valid, (0, 0), sigma)
    out = d.copy()
    out[hole] = (num / np.maximum(den, 1e-4))[hole]
    return cv2.GaussianBlur(out, (0, 0), 2)


# ------------------------------------------------------------------ mattes and registration
def matte(stem, hint, shape):
    """Her alpha in photo coordinates (float 0..1)."""
    if hint is not None:
        p = os.path.join(LAB, "mattes", f"{stem}_{hint[0]:.2f}_{hint[1]:.2f}.png")
        if not os.path.exists(p):
            os.makedirs(os.path.dirname(p), exist_ok=True)
            subprocess.run([sys.executable, os.path.join(ROOT, "tools", "matte_hint.py"), ROOT, src_path(stem),
                            str(hint[0]), str(hint[1]), "0.36", "0.34", p], check=True)
        m = cv2.imread(p, cv2.IMREAD_GRAYSCALE)
    else:
        p = os.path.join(ROOT, "work", "social", "cutouts", f"{stem}_mask.png")
        if not os.path.exists(p):
            return np.zeros(shape, np.float32)
        m = cv2.imread(p, cv2.IMREAD_GRAYSCALE)
    return cv2.resize(m, (shape[1], shape[0]), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255


def register(ref, ref_excl, img, img_excl):
    """Homography taking `img` onto `ref`, fitted on the far background only."""
    def prep(x, excl):
        k = 1400 / x.shape[1]
        g = cv2.cvtColor((cv2.resize(x, None, fx=k, fy=k, interpolation=cv2.INTER_AREA) * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
        m = (cv2.resize((~excl).astype(np.uint8), (g.shape[1], g.shape[0]), interpolation=cv2.INTER_NEAREST) * 255)
        return g, m, k
    g1, m1, k1 = prep(ref, ref_excl)
    g2, m2, k2 = prep(img, img_excl)
    sift = cv2.SIFT_create(6000)
    p1, d1 = sift.detectAndCompute(g1, m1)
    p2, d2 = sift.detectAndCompute(g2, m2)
    good = [p[0] for p in cv2.BFMatcher().knnMatch(d2, d1, k=2) if len(p) == 2 and p[0].distance < 0.72 * p[1].distance]
    src = np.float32([p2[m.queryIdx].pt for m in good]) / k2
    dst = np.float32([p1[m.trainIdx].pt for m in good]) / k1
    Hm, inl = cv2.findHomography(src, dst, cv2.RANSAC, 4.0)
    print(f"    registration: {len(good)} matches, {int(inl.sum())} inliers")
    return Hm


# ------------------------------------------------------------------ the camera
def cam_scale(d, e, cam, gx):
    return gx * (1 + (cam["push"] + cam["kz"] * d) * e)


def warp(img, D, e, cam, gx):
    """Backward-map a canvas layer through the depth camera (3 fixed-point iterations on the depth)."""
    d = cv2.remap(D, GX + MX, GY + MY, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    for _ in range(3):
        s = cam_scale(d, e, cam, gx)
        px = W / 2 + (GX - W / 2 - gx * cam["kx"] * d * W * e) / s
        py = H / 2 + (GY - H / 2 - gx * cam["ky"] * d * H * e) / s
        d = cv2.remap(D, px + MX, py + MY, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return cv2.remap(img, px + MX, py + MY, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT), d


def rigid(dh, e, cam, gx):
    s = cam_scale(dh, e, cam, gx)
    tx, ty = gx * cam["kx"] * dh * W * e, gx * cam["ky"] * dh * H * e
    return np.float32([[s, 0, W / 2 - s * (MX + W / 2) + tx], [0, s, H / 2 - s * (MY + H / 2) + ty]])


def project(pc, d, e, cam, gx):
    """Canvas point -> output point, for a point at depth d."""
    s = cam_scale(d, e, cam, gx)
    return (W / 2 + s * (pc[0] - MX - W / 2) + gx * cam["kx"] * d * W * e,
            H / 2 + s * (pc[1] - MY - H / 2) + gx * cam["ky"] * d * H * e)


# ------------------------------------------------------------------ look
def dof(img, dmap, f, R):
    """Depth of field: blur grows with |depth - focus|, up to R px (two blur levels, blended per pixel)."""
    if R < 0.3:
        return img
    w = np.clip(np.abs(dmap - f), 0, 1)[..., None]
    b1 = cv2.GaussianBlur(img, (0, 0), R / 2)
    b2 = cv2.GaussianBlur(img, (0, 0), R)
    lo = img + (b1 - img) * np.clip(w * 2, 0, 1)
    return np.where(w <= 0.5, lo, b1 + (b2 - b1) * np.clip(w * 2 - 1, 0, 1))


def lamp(t_abs):
    ph = ((t_abs - TICK_START) % TICK_PERIOD + TICK_PERIOD) % TICK_PERIOD
    half = TICK_PERIOD / 2
    return 1 - 0.15 * ph / half if ph < half else 0.85 * math.exp(-(ph - half) / 0.045)


def screen(base, light):
    return 1 - (1 - base) * (1 - np.clip(light, 0, 1))


GLITCH = [1, 0.55, 0.95, 0.3, 0.8, 0.2, 0.55, 0.12, 0]


def glitch(img, k, seed):
    amp = GLITCH[k]
    rng = np.random.default_rng(seed * 100 + k)
    dx = int(round(28 * amp))
    out = img.copy()
    out[..., 0] = np.roll(img[..., 0], dx, axis=1)
    out[..., 2] = np.roll(img[..., 2], -dx, axis=1)
    for _ in range(5):
        y = int(rng.uniform(0, H)); h = int(24 + rng.uniform(0, 150)); off = int((rng.uniform() - 0.5) * 190 * amp)
        out[y:y + h] = np.roll(out[y:y + h], off, axis=1)
    return out


class Dust:
    def __init__(self, seed, n=70):
        r = np.random.default_rng(seed)
        self.p = np.stack([r.uniform(0, CW, n), r.uniform(0, CH * 0.75, n)], 1)
        self.v = np.stack([r.uniform(-14, 14, n), r.uniform(-8, 10, n)], 1)
        self.sig = r.uniform(0.8, 2.6, n)
        self.b = r.uniform(0.12, 0.42, n)
        self.d = r.uniform(0.85, 1.0, n)
        self.ph = r.uniform(0, 6.28, n)
        self.k = {}

    def kernel(self, s):
        key = round(s, 1)
        if key not in self.k:
            r = int(3 * s) + 1
            y, x = np.mgrid[-r:r + 1, -r:r + 1]
            self.k[key] = np.exp(-(x * x + y * y) / (2 * s * s)).astype(np.float32)
        return self.k[key]

    def layer(self, f, e, cam, gx):
        buf = np.zeros((H, W), np.float32)
        for i in range(len(self.b)):
            pc = self.p[i] + self.v[i] * f / FPS
            x, y = project(pc, self.d[i], e, cam, gx)
            kk = self.kernel(self.sig[i])
            r = kk.shape[0] // 2
            xi, yi = int(round(x)), int(round(y))
            if r <= xi < W - r and r <= yi < H - r:
                buf[yi - r:yi + r + 1, xi - r:xi + r + 1] += kk * self.b[i] * (0.65 + 0.35 * math.sin(self.ph[i] + f * 0.21))
        return buf


# ------------------------------------------------------------------ diagrams (same look as the Remotion PhotoShot)
def font(px):
    from PIL import ImageFont
    return ImageFont.truetype(os.path.join(ROOT, "assets", "fonts", "JetBrainsMono-Medium.ttf"), px)


def draw_diagram(img, kind, a, b, f, until=None, label=None, step=0, trail=()):
    """a = the car point, b = her point (output px, already moved by the camera)."""
    from PIL import Image, ImageDraw, ImageFilter
    SS = 2
    ov = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    A, B = (a[0] * SS, a[1] * SS), (b[0] * SS, b[1] * SS)

    def ease_back(u):
        u = min(max(u, 0), 1); c = 2.2
        return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2

    def dot(p, r, col):
        d.ellipse([p[0] - r * SS, p[1] - r * SS, p[0] + r * SS, p[1] + r * SS], fill=col)

    def dashed(p, q, col, width):
        L = math.hypot(q[0] - p[0], q[1] - p[1])
        n = int(L / (16 * SS))
        for i in range(n):
            t = i / max(n, 1)
            x, y = p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t
            d.ellipse([x - width, y - width, x + width, y + width], fill=col)

    white, amber = (247, 243, 236, 255), (255, 176, 0, 255)
    if kind == "distance":
        u = smooth((f - 3) / 13)
        if u > 0:
            d.line([A, (A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u)], fill=white, width=6 * SS)
        if label and f >= 12:
            L = math.hypot(B[0] - A[0], B[1] - A[1]) or 1
            nx, ny = -(B[1] - A[1]) / L, (B[0] - A[0]) / L
            d.text(((A[0] + B[0]) / 2 + nx * 54 * SS, (A[1] + B[1]) / 2 + ny * 54 * SS), label, font=font(44 * SS),
                   fill=(247, 243, 236, int(255 * min(1, (f - 12) / 6))), anchor="mm")
    if kind == "halves":
        dashed(B, A, (247, 243, 236, 150), 2.5 * SS)
        for q in trail:
            Q = (q[0] * SS, q[1] * SS)
            d.ellipse([Q[0] - 12 * SS, Q[1] - 12 * SS, Q[0] + 12 * SS, Q[1] + 12 * SS], outline=(61, 43, 255, 255), width=5 * SS)
        if step > 0:
            pop = ease_back((f - 6) / 6)
            if pop > 0:
                d.text((B[0] + 34 * SS, B[1] + 6 * SS), ["", "½ left", "¼ left", "⅛ left"][step], font=font(46 * SS),
                       fill=white, anchor="lm")
    if kind == "arrive":
        u = smooth((f - 2) / max(1, until - 2))
        D = (B[0] + (A[0] - B[0]) * u, B[1] + (A[1] - B[1]) * u)
        dashed(D, A, (247, 243, 236, 150), 2.5 * SS)
        d.line([B, D], fill=amber, width=8 * SS)
        dot(D, 15, amber)
        if f >= until:
            r = min(1, (f - until) / 18)
            rr = (16 + 70 * r) * SS
            d.ellipse([A[0] - rr, A[1] - rr, A[0] + rr, A[1] + rr], outline=(255, 176, 0, int(255 * (1 - r))), width=5 * SS)
    ra = 15 * ease_back(f / 6) if kind != "halves" else 15
    rb = 15 * ease_back((f - 4) / 6) if kind != "halves" else 15
    if ra > 0:
        dot(A, ra, white)
    if rb > 0:
        dot(B, rb, amber if kind == "arrive" else white)
    ov = ov.resize((W, H), Image.LANCZOS)
    sh = ov.split()[3].filter(ImageFilter.GaussianBlur(8))
    o = np.asarray(ov, np.float32) / 255
    s = np.asarray(sh, np.float32)[..., None] / 255
    img = img * (1 - 0.45 * s)
    return img * (1 - o[..., 3:]) + o[..., :3] * o[..., 3:]


# ------------------------------------------------------------------ one shot
def layers_for(rgb_canvas, D, alpha, near_thr, holes_extra=None):
    """Split a canvas into far (filled), her (premultiplied RGBA) and near (premultiplied RGBA)."""
    hard = alpha > 0.5
    pdil = cv2.dilate(hard.astype(np.uint8), np.ones((21, 21), np.uint8)) > 0
    if near_thr is not None:
        n = ((D > near_thr) & ~pdil).astype(np.uint8)
        n = cv2.morphologyEx(n, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
        cnt, lab, st, _ = cv2.connectedComponentsWithStats(n)
        keep = np.zeros(cnt, bool)
        keep[1:] = st[1:, cv2.CC_STAT_AREA] > 0.01 * n.size
        n = cv2.dilate(keep[lab].astype(np.uint8), np.ones((7, 7), np.uint8)).astype(np.float32)
        near_a = cv2.GaussianBlur(n, (0, 0), 2.0)
    else:
        near_a = np.zeros(D.shape, np.float32)
    ndil = cv2.dilate((near_a > 0.02).astype(np.uint8), np.ones((41, 41), np.uint8)) > 0   # no trace of the car left in the far layer
    far = lama(rgb_canvas, ndil) if ndil.any() else rgb_canvas
    far = lama(far, pdil) if pdil.any() else far
    far_d = fill_depth(D, pdil | ndil)
    her = np.dstack([rgb_canvas * alpha[..., None], alpha])
    near = np.dstack([rgb_canvas * near_a[..., None], near_a])
    dh = float(np.median(D[hard])) if hard.sum() > 50 else None
    return far, far_d, her, near, dh


def build_segment(stem, hint, view, ref=None):
    """Canvas layers for one photo. ref: (ref_photo, ref_excl, near_layer, D) for burst members."""
    photo = read(src_path(stem))
    a_photo = matte(stem, hint, photo.shape[:2]) if not stem.startswith("broll/") else np.zeros(photo.shape[:2], np.float32)
    if ref is not None:
        rp, rexcl, rD_photo = ref["photo"], ref["excl"], ref["Dphoto"]
        excl = (cv2.dilate((a_photo > 0.3).astype(np.uint8), np.ones((41, 41), np.uint8)) > 0) | (depth_map(photo) > 0.5)
        Hm = register(rp, rexcl, photo, excl)
        photo = cv2.warpPerspective(photo, Hm, (rp.shape[1], rp.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        a_photo = cv2.warpPerspective(a_photo, Hm, (rp.shape[1], rp.shape[0]), flags=cv2.INTER_LINEAR)
    canvas, mapping = to_canvas(photo, view)
    alpha = np.clip(to_canvas(a_photo, view, cv2.INTER_AREA)[0], 0, 1)
    return photo, a_photo, canvas, alpha, mapping, (Hm if ref is not None else None)


def render_shot(sid):
    sh = SPEC.SHOTS[sid]
    cam = dict(SPEC.CAM, **sh.get("cam", {}))
    members = [b for b, _, _ in sh["burst"]] if "burst" in sh else [sid]
    first, last = members[0], members[-1]
    start = SEQ[first]["start"]
    total = SEQ[last]["start"] + SEQ[last]["dur"] - start
    view = BEAT[first]["visual"]["fr"]
    near_thr = sh.get("near", 0.62)
    print(f"[{sid}] {total} frames from frame {start}")

    segs = []                                                          # (local start, layers..., diagram points)
    if "burst" in sh:
        ref_stem, ref_hint = sh["burst"][0][1], sh["burst"][0][2]
        rphoto = read(src_path(ref_stem))
        ra = matte(ref_stem, ref_hint, rphoto.shape[:2])
        rDp = depth_map(rphoto)
        rexcl = (cv2.dilate((ra > 0.3).astype(np.uint8), np.ones((41, 41), np.uint8)) > 0) | (rDp > 0.5)
        ref = dict(photo=rphoto, excl=rexcl, Dphoto=rDp)
        _, _, rcanvas, ralpha, mapping, _ = build_segment(ref_stem, ref_hint, view)
        D = depth_map(rcanvas)
        _, _, _, near, _ = layers_for(rcanvas, D, ralpha, near_thr)
        for bid, stem, hint in sh["burst"]:
            photo, a_photo, canvas, alpha, mp, Hm = build_segment(stem, hint, view, None if bid == first else ref)
            far, far_d, her, _, dh = layers_for(canvas, D, alpha, near_thr)
            dg = BEAT[bid]["visual"].get("diagram")
            bpt = None
            if dg:
                bx, by = dg["b"]
                if Hm is not None:
                    hh, ww = read(src_path(stem)).shape[:2]
                    q = Hm @ np.array([bx * ww, by * hh, 1.0])
                    bx, by = q[0] / q[2] / rphoto.shape[1], q[1] / q[2] / rphoto.shape[0]
                bpt = (bx, by, dg["a"])
            segs.append(dict(start=SEQ[bid]["start"] - start, far=far, far_d=far_d, her=her, near=near, dh=dh, D=D,
                             mapping=mapping, photo_shape=rphoto.shape[:2], bpt=bpt, step=dg.get("step", 0) if dg else 0))
    elif "segments" in sh:                                             # punch-ins: hard cuts to other photos/framings
        for anchor, stem, hint, vw in sh["segments"]:
            lf = 0 if anchor == "@0" else F(S.at(anchor)) - start
            photo, a_photo, canvas, alpha, mapping, _ = build_segment(stem, hint, vw)
            Dk = depth_map(canvas)
            far, far_d, her, near, dh = layers_for(canvas, Dk, alpha, near_thr)
            segs.append(dict(start=lf, far=far, far_d=far_d, her=her, near=near, dh=dh, D=Dk, mapping=mapping,
                             photo_shape=photo.shape[:2], bpt=None))
    else:
        photo, a_photo, canvas, alpha, mapping, _ = build_segment(sh["src"], sh.get("hint"), view)
        D = depth_map(canvas)
        far, far_d, her, near, dh = layers_for(canvas, D, alpha, near_thr)
        segs.append(dict(start=0, far=far, far_d=far_d, her=her, near=near, dh=dh, D=D, mapping=mapping,
                         photo_shape=photo.shape[:2], bpt=None))

    v = BEAT[first]["visual"]
    # timing extras (local frames)
    glitch_at = F(S.at(v["glitch"])) - start if v.get("glitch") else None
    stutter = None
    if v.get("stutter"):
        sa = F(S.at("L08:never")) - start
        stutter = (sa, [z / view[2] for z in v["stutter"]])
    dg = v.get("diagram") if "burst" not in sh else None
    until = F(S.at(dg["until"])) - start if dg and dg.get("until") else None
    dh0 = segs[0]["dh"]
    focus_keys = []
    for anchor, val in sh.get("focus", [("@0", "her" if dh0 is not None else 0.5)]):
        fl = 0 if anchor == "@0" else (int(anchor[1:-1]) if anchor.startswith("+") and anchor.endswith("f") else F(S.at(anchor)) - start)
        fv = {"far": 0.12, "near": 0.9, "her": dh0 if dh0 is not None else 0.5}.get(val, val)
        focus_keys.append((fl, float(fv)))
    R = 6.0 if len(focus_keys) > 1 else 2.2
    dust = Dust(zlib.crc32(sid.encode()) % 1000) if sh.get("dust") else None

    def focus(f):
        if f <= focus_keys[0][0]:
            return focus_keys[0][1]
        for (f0, v0), (f1, v1) in zip(focus_keys, focus_keys[1:]):
            if f0 <= f <= f1:
                return v0 + (v1 - v0) * smooth((f - f0) / max(1, f1 - f0))
        return focus_keys[-1][1]

    out_path = os.path.join(PUB, "motion", f"{sid}.mp4")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                            "-i", "-", "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p", "-c:v", "libx264",
                            "-preset", "medium", "-crf", "14", "-g", "15", "-bf", "0", "-color_primaries", "bt709",
                            "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", out_path], stdin=subprocess.PIPE)
    rig_blur = []
    trail = []
    for f in range(total):
        e = travel(f / max(1, total - 1))
        seg = [s for s in segs if s["start"] <= f][-1]
        if seg is not segs[0] and f == seg["start"] and segs.index(seg) > 0:
            pass
        gx = 1.0
        if stutter and 0 <= f - stutter[0] < 3 * len(stutter[1]):
            gx = stutter[1][(f - stutter[0]) // 3]
        fo = focus(f) if sh.get("focus") else (seg["dh"] if seg["dh"] is not None else 0.5)
        far, fd = warp(seg["far"], seg["far_d"], e, cam, gx)
        img = dof(far, fd, fo, R)
        if seg["dh"] is not None:
            M = rigid(seg["dh"], e, cam, gx)
            hp = cv2.warpAffine(seg["her"], M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
            sig = min(R, R * abs(seg["dh"] - fo))
            if sig > 0.3:
                hp = cv2.GaussianBlur(hp, (0, 0), sig)
            img = hp[..., :3] + img * (1 - hp[..., 3:])
            if sh.get("rig") and f % 2 == 0:
                rig_blur.append([f, round(sig if sig > 0.3 else 0.0, 2)])
        if seg["near"][..., 3].max() > 0:
            nr, nd = warp(seg["near"], seg["D"], e, cam, gx)
            na = nr[..., 3:]
            nrgb = dof(nr[..., :3], nd, fo, R)
            img = nrgb + img * (1 - na)
            if sh.get("hazard"):                             # a soft wash of amber over the interior, no hard edges
                L = lamp((SEQ[first]["start"] + f) / FPS)
                wash = cv2.GaussianBlur(na[..., 0], (0, 0), 45)[..., None]
                if seg["dh"] is not None:                    # the light falls on the car, not on her
                    wash = wash * (1 - cv2.dilate(hp[..., 3], np.ones((9, 9), np.uint8))[..., None])
                img = screen(img, (0.11 * L) * wash * AMBER)
        if sh.get("lamp"):                                   # the hazard switch itself (B-roll): same relay grid
            L = lamp((SEQ[first]["start"] + f) / FPS)
            img = np.clip(img * (0.58 + 0.52 * L), 0, 1)
            cx, cy = project((MX + W * 0.5, MY + H * 0.48), 0.6, e, cam, gx)
            r2 = (GX - cx) ** 2 + (GY - cy) ** 2
            glow = (0.85 * np.exp(-r2 / (2 * 160 ** 2)) + 0.35 * np.exp(-r2 / (2 * 380 ** 2)))[..., None] * np.array([1.0, 0.27, 0.12], np.float32)
            img = screen(img, 0.75 * L * glow)
        if dust is not None:
            dl = dust.layer(f, e, cam, gx)
            if seg["dh"] is not None:
                dl *= 1 - cv2.dilate(hp[..., 3], np.ones((15, 15), np.uint8))
            img = screen(img, dl[..., None] * np.array([1.0, 0.92, 0.8], np.float32))
        # diagrams
        s_, ox, oy = seg["mapping"]
        hh, ww = seg["photo_shape"]

        def pc(p):
            return (ox + p[0] * ww * s_, oy + p[1] * hh * s_)

        def depth_at(c):
            return float(seg["D"][int(np.clip(c[1], 0, CH - 1)), int(np.clip(c[0], 0, CW - 1))])
        if dg:
            ca, cb = pc(dg["a"]), pc(dg["b"])
            A = project(ca, depth_at(ca), e, cam, gx)
            B = project(cb, seg["dh"] if seg["dh"] is not None else depth_at(cb), e, cam, gx)
            img = draw_diagram(img, dg["kind"], A, B, f, until=until, label=dg.get("label"), step=dg.get("step", 0))
        if seg.get("bpt"):
            bx, by, a = seg["bpt"]
            ca, cb = pc(a), pc((bx, by))
            A = project(ca, depth_at(ca), e, cam, gx)
            B = project(cb, seg["dh"] if seg["dh"] is not None else depth_at(cb), e, cam, gx)
            tr = []
            for prev in segs[:segs.index(seg)]:
                pbx, pby, _ = prev["bpt"]
                cp = pc((pbx, pby))
                tr.append(project(cp, prev["dh"] if prev["dh"] is not None else depth_at(cp), e, cam, gx))
            img = draw_diagram(img, "halves", A, B, f - seg["start"], step=seg["step"], trail=tr)
        if glitch_at is not None and 0 <= f - glitch_at < len(GLITCH):
            img = glitch(img, f - glitch_at, zlib.crc32(sid.encode()) % 997)
        enc.stdin.write((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    rig = None
    if sh.get("rig") and segs[0]["dh"] is not None:
        dh = segs[0]["dh"]
        rig = dict(s1=round(cam["push"] + cam["kz"] * dh, 5), x1=round(cam["kx"] * dh * W, 2), y1=round(cam["ky"] * dh * H, 2),
                   blur=rig_blur if any(b for _, b in rig_blur) else None)
    print(f"[{sid}] done -> {out_path}")
    return sid, dict(members=members, start=start, frames=total, src=f"motion/{sid}.mp4", rig=rig,
                     her_depth=None if dh0 is None else round(dh0, 3))


def main():
    ids = sys.argv[2:] or list(SPEC.SHOTS)
    # mattes first, one process at a time (BiRefNet memory), then the shots in parallel
    for sid in ids:
        sh = SPEC.SHOTS[sid]
        for stem, hint in ([(s, h) for _, s, h in sh["burst"]] if "burst" in sh else [(sh["src"], sh.get("hint"))]):
            if hint is not None and not stem.startswith("broll/"):
                matte(stem, hint, (1, 1))
    man_p = os.path.join(LAB, "manifest.json")
    manifest = json.load(open(man_p)) if os.path.exists(man_p) else {}
    with ProcessPoolExecutor(max_workers=3) as ex:
        for sid, info in ex.map(render_shot, ids):
            manifest[sid] = info
    os.makedirs(LAB, exist_ok=True)
    json.dump(manifest, open(man_p, "w"), indent=1)
    print(f"manifest: {len(manifest)} shots")


if __name__ == "__main__":
    main()
