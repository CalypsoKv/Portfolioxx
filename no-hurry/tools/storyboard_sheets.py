#!/usr/bin/env python3
"""Render the social-cut storyboard: panel mock-ups + notes, as JPG sheets and one HTML page.

Usage: storyboard_sheets.py <project_root>
Writes work/social/storyboard/sheet_XX.jpg and work/social/storyboard/no_hurry_storyboard.html (private: contains photos)
"""
import base64, functools, io, os, sys, textwrap

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from social_common import Social  # noqa: E402

ROOT = sys.argv[1]
S = Social(ROOT)
OUT = os.path.join(ROOT, "work", "social", "storyboard")
FONTS = os.path.join(ROOT, "assets", "fonts")
TW, TH = 360, 640                      # thumbnail = 1/3 of 1080x1920
COL = {"white": (247, 243, 236), "amber": (255, 176, 0), "ink": (61, 43, 255), "magenta": (255, 45, 135),
       "cream": (244, 233, 216)}
SIZE = {"s": 15, "m": 19, "l": 27, "xl": 40, "xxl": 57, "mega": 80}
BG, FG, DIM = (14, 14, 14), (236, 230, 220), (150, 146, 140)


@functools.lru_cache(maxsize=None)
def font(kind, px):
    f = {"sans": "PlusJakartaSans-800.ttf", "sans_s": "PlusJakartaSans-700.ttf", "serif": "CormorantGaramond-600Italic.ttf",
         "mono": "JetBrainsMono-Medium.ttf"}[kind]
    return ImageFont.truetype(os.path.join(FONTS, f), px)


def fmt(t):
    t = round(t, 1)
    return f"{int(t // 60)}:{t % 60:04.1f}"


@functools.lru_cache(maxsize=64)
def load(src):
    """Source image as 8-bit RGB PIL (graded photo, generated b-roll, or a graded video frame)."""
    if src.startswith("VID-"):
        name, _, t = src.partition("@")
        fps = 30.0 if "20261005" in name else 24.0
        idx = int(float(t or 0) * fps)
        p = os.path.join(ROOT, "work", "graded", name, f"{idx:05d}.png")
    elif os.path.exists(os.path.join(ROOT, "assets", "broll", "gen", src + ".webp")):
        return Image.open(os.path.join(ROOT, "assets", "broll", "gen", src + ".webp")).convert("RGB")
    else:
        p = os.path.join(ROOT, "work", "graded", src + ".png")
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    im = cv2.cvtColor((im / 257).astype(np.uint8), cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(im)
    pil.thumbnail((1200, 1600))
    return pil


def frame_crop(im, cx, cy, z, w=TW, h=TH):
    W, H = im.size
    asp = w / h
    hm, wm = (H, H * asp) if W / H > asp else (W / asp, W)
    cw, ch = wm / z, hm / z
    x = min(max(cx * W - cw / 2, 0), W - cw)
    y = min(max(cy * H - ch / 2, 0), H - ch)
    return im.resize((w, h), Image.LANCZOS, box=(x, y, x + cw, y + ch)), (x, y, cw, ch, W, H)


def contain(im, aspect=0.75):
    W, H = im.size
    th = int(TW / aspect)
    fg = im.copy(); fg.thumbnail((TW, th))
    bg = im.resize((TW, TH)).filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.4))
    bg.paste(fg, (0, (TH - fg.size[1]) // 2))
    return bg


def text_block(phrase, words):
    """Rows of (text, size, font, color) following the key-word hierarchy."""
    key = phrase.get("key", [])
    keysizes = phrase.get("keysizes")
    base = "serif" if phrase.get("font") == "serif" else "sans"
    color = phrase.get("color", "white")
    first = phrase["words"][1]
    if phrase.get("one_row"):
        return [(" ".join(w["w"] for w in words), SIZE[phrase.get("size", "xl")], base, color)]
    rows, cur = [], []
    for i, w in enumerate(words):
        idx = first + i
        if idx in key:
            if cur:
                rows.append((" ".join(cur), SIZE["s"] if phrase.get("size") not in ("m",) else SIZE["m"], base, "white")); cur = []
            k = keysizes[key.index(idx)] if keysizes else phrase.get("size", "xl")
            rows.append((w["w"], SIZE[k], base, color))
        else:
            cur.append(w["w"])
            if len(" ".join(cur)) > 22:
                rows.append((" ".join(cur), SIZE[phrase.get("size", "s")] if not key else SIZE["s"], base, "white")); cur = []
    if cur:
        rows.append((" ".join(cur), SIZE[phrase.get("size", "s")] if not key else SIZE["s"], base, "white"))
    return rows


def layout_phrase(phrase, d):
    """Measured rows (text, font, color, w, h) fitted to the safe width; returns rows and block size."""
    rows = text_block(phrase, S.phrase_words(phrase))
    safe = TW - 2 * 27
    out = []
    for txt, px, kind, col in rows:
        while True:
            f = font(kind if kind != "sans" or px >= 27 else "sans_s", px)
            l, t, r, b = d.textbbox((0, 0), txt, font=f)
            if r - l <= safe or px <= 12:
                break
            px = int(px * 0.92)
        asc, desc = f.getmetrics()
        out.append((txt, f, col, r - l, asc + desc, px, t))
    bw = max(m[3] for m in out)
    bh = sum(int(m[4] * 0.92) for m in out)
    return out, bw, bh


def draw_phrase(img, phrase, stack, paint=True):
    """stack: dict anchor -> y offset already used (phrases sharing an anchor stack instead of overlapping).
    paint=False only reserves the space (two-pass drawing: behind-her phrases, cut-out, then front phrases)."""
    d = ImageDraw.Draw(img)
    at = phrase.get("at", "tl")
    rows, bw, bh = layout_phrase(phrase, d)
    mx, my = 27, 40
    side = {"tl": "l", "ml": "l", "bl": "l", "tr": "r", "mr": "r", "br": "r"}.get(at, "c")
    vert = {"tl": "t", "tr": "t", "tc": "t", "ml": "m", "mr": "m", "c": "m"}.get(at, "b")
    used = stack.get(at, 0)
    x0 = {"l": mx, "r": TW - mx - bw, "c": (TW - bw) / 2 + phrase.get("dx", 0) * TW}[side]
    y0 = {"t": my + used, "m": (TH - bh) / 2 + used, "b": TH - my - bh - 60 - used}[vert] + phrase.get("dy", 0) * TH
    stack[at] = used + bh + 14
    if not paint:
        return
    y = y0
    for txt, f, col, w, h, px, top in rows:
        x = x0 if side == "l" else (x0 + bw - w if side == "r" else x0 + (bw - w) / 2)
        d.text((x + 1, y + 1), txt, font=f, fill=(0, 0, 0))
        d.text((x, y), txt, font=f, fill=COL.get(col, COL["white"]))
        y += int(h * 0.92)


def visual(b):
    v = b["visual"]
    k = v["kind"]
    if k in ("black", "title"):
        img = Image.new("RGB", (TW, TH), (8, 8, 8))
        if k == "title":
            d = ImageDraw.Draw(img); f = font("sans", 52)
            d.text((TW / 2, TH / 2), "no hurry.", font=f, fill=COL["cream"], anchor="mm")
        return img, None
    if k in ("photo", "broll", "behind"):
        img, geo = frame_crop(load(v["src"]), *v["fr"])
        if k == "behind":
            img = img.point(lambda p: int(p * v.get("dim", 0.85)))
        return img, geo
    if k == "video":
        return contain(load(f"{v['src']}@{v.get('src_in', 0)}"), aspect=0.5625), None
    if k == "evidence":
        img, _ = frame_crop(load(v["bg"]), 0.5, 0.5, 1.0)
        img = img.filter(ImageFilter.GaussianBlur(10)).point(lambda p: int(p * 0.35))
        for c in v["cards"]:
            ph, _ = frame_crop(load(c["src"]), *c["crop"], w=150, h=150)
            card = Image.new("RGB", (166, 196), (240, 236, 228)); card.paste(ph, (8, 8))
            ImageDraw.Draw(card).text((10, 168), c["caption"], font=font("mono", 11), fill=(30, 30, 30))
            card = card.rotate(c["rot"], expand=True, fillcolor=(0, 0, 0))
            img.paste(card, (int(c["pos"][0] * TW - card.size[0] / 2), int(c["pos"][1] * TH - card.size[1] / 2)))
        return img, None
    if k == "flicker":
        img = Image.new("RGB", (TW, TH))
        for i, s in enumerate(v["srcs"][:4]):
            t, _ = frame_crop(load(s), 0.5, 0.5, 1.0, w=TW // 2, h=TH // 2)
            img.paste(t, ((i % 2) * TW // 2, (i // 2) * TH // 2))
        ImageDraw.Draw(img).text((TW - 12, 14), f"x{len(v['srcs'])} · {v['every']}f", font=font("mono", 14), fill=COL["amber"], anchor="ra")
        return img, None
    if k == "collage":
        img = Image.new("RGB", (TW, TH), (255, 45, 135))
        return img, None
    if k == "montage":
        img = Image.new("RGB", (TW, TH))
        for i, (s, _) in enumerate(v["items"][:9]):
            src = s if "@" in s or not s.startswith("VID") else s
            t, _ = frame_crop(load(src), 0.5, 0.45, 1.0, w=TW // 3, h=TH // 3)
            img.paste(t, ((i % 3) * TW // 3, (i // 3) * TH // 3))
        return img, None
    raise ValueError(k)


def cutout_overlay(img, src, fr):
    p = os.path.join(ROOT, "work", "social", "cutouts", src + ".png")
    if not os.path.exists(p):
        return img
    co = Image.open(p)
    full = load(src)                                    # the panel was cropped from this image
    co = co.resize(full.size, Image.LANCZOS)
    crop, _ = frame_crop(co, *fr) if False else (None, None)
    W, H = full.size
    asp = TW / TH
    hm, wm = (H, H * asp) if W / H > asp else (W / asp, W)
    cx, cy, z = fr
    cw, ch = wm / z, hm / z
    x = min(max(cx * W - cw / 2, 0), W - cw); y = min(max(cy * H - ch / 2, 0), H - ch)
    layer = co.resize((TW, TH), Image.LANCZOS, box=(x, y, x + cw, y + ch))
    img = img.convert("RGBA"); img.alpha_composite(layer)
    return img.convert("RGB")


def collage_overlay(img, srcs):
    """Stop-motion collage: one cut-out at a time, bottom-centred at 78 % of frame height (first one shown)."""
    img = img.convert("RGBA")
    for s in srcs:
        p = os.path.join(ROOT, "work", "social", "cutouts", s + ".png")
        if not os.path.exists(p):
            continue
        co = Image.open(p)
        co = co.crop(co.getchannel("A").getbbox())
        h = int(TH * 0.78); w = int(co.size[0] * h / co.size[1])
        if w > TW * 0.95:
            w = int(TW * 0.95); h = int(co.size[1] * w / co.size[0])
        co = co.resize((w, h), Image.LANCZOS)
        img.alpha_composite(co, (int((TW - w) / 2), TH - h))
        break
    return img.convert("RGB")


def diagram(img, b, geo):
    dg = b["visual"].get("diagram")
    if not dg or not geo:
        return
    x, y, cw, ch, W, H = geo
    def P(p):
        return ((p[0] * W - x) / cw * TW, (p[1] * H - y) / ch * TH)
    a, c = P(dg["a"]), P(dg["b"])
    d = ImageDraw.Draw(img)
    d.line([a, c], fill=(255, 255, 255), width=2)
    for p in (a, c):
        d.ellipse([p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6], fill=(255, 255, 255))
    steps = dg.get("step", 0)
    for s in range(1, steps + 1):
        f = 1 - 0.5 ** s
        m = (a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f)
        d.ellipse([m[0] - 4, m[1] - 4, m[0] + 4, m[1] + 4], outline=(255, 255, 255), width=2)
    if dg.get("label"):
        d.text(((a[0] + c[0]) / 2 + 8, (a[1] + c[1]) / 2), dg["label"], font=font("mono", 14), fill=(255, 255, 255))


def panel(b):
    img, geo = visual(b)
    v = b["visual"]
    diagram(img, b, geo)
    stack = {}
    for ph in b.get("say", []):                     # pass 1: type that sits behind her
        draw_phrase(img, ph, stack, paint=bool(ph.get("behind")))
    if v["kind"] == "behind":
        img = cutout_overlay(img, v["src"], v["fr"])
    if v["kind"] == "collage":
        img = collage_overlay(img, v["cutouts"])
    stack = {}
    for ph in b.get("say", []):                     # pass 2: type in front
        draw_phrase(img, ph, stack, paint=not ph.get("behind"))
    if b.get("label"):
        d = ImageDraw.Draw(img); lab = b["label"]
        d.text((26 if lab["at"][-1] == "l" else TW - 26, 22 if lab["at"][0] == "t" else TH - 34), lab["text"],
               font=font("mono", 11), fill=(255, 255, 255), anchor="la" if lab["at"][-1] == "l" else "ra")
    if b.get("chapter"):
        ImageDraw.Draw(img).text((TW / 2, 12), b["chapter"].upper(), font=font("mono", 10), fill=(255, 255, 255), anchor="ma")
    return img


def notes(b):
    lines = []
    vo = " ".join(" ".join(w["w"] for w in S.phrase_words(p)) for p in b.get("say", []))
    if vo:
        lines.append(("VO", vo))
    v = b["visual"]
    src = v.get("src") or v.get("bg") or ""
    lines.append(("PIC", f"{v['kind']} {src}".strip()))
    keys = [S.phrase_words(p)[i - p["words"][1]]["w"] for p in b.get("say", []) for i in p.get("key", [])]
    if keys:
        lines.append(("TYPE", " · ".join(keys)))
    lines.append(("CUT", b.get("transition", "cut")))
    if b.get("sfx"):
        lines.append(("SFX", ", ".join(s for s, _ in b["sfx"])))
    if b.get("note"):
        lines.append(("NOTE", b["note"]))
    return lines


def render_panel_card(b):
    card = Image.new("RGB", (TW + 24, TH + 300), BG)
    d = ImageDraw.Draw(card)
    d.text((12, 10), f"{b['id']}", font=font("sans", 22), fill=COL["amber"])
    d.text((70, 14), f"{fmt(b['t0'])}  ·  {b['t1'] - b['t0']:.1f}s", font=font("mono", 15), fill=DIM)
    d.text((12, 40), b["name"], font=font("sans_s", 17), fill=FG)
    card.paste(panel(b), (12, 70))
    y = 70 + TH + 10
    for tag, txt in notes(b):
        for j, ln in enumerate(textwrap.wrap(txt, 40)[:4]):
            d.text((12, y), tag if j == 0 else "", font=font("mono", 12), fill=COL["amber"])
            d.text((62, y), ln, font=font("mono", 12), fill=FG if tag != "VO" else (200, 196, 188))
            y += 17
        y += 3
    return card


def cover():
    W, H = 4 * (TW + 24) + 40, TH + 340
    c = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(c)
    d.text((40, 40), "no hurry.", font=font("sans", 110), fill=COL["cream"])
    d.text((44, 170), "SOCIAL CUT  ·  STORYBOARD  ·  9:16  ·  30 fps  ·  " + fmt(S.tl["duration"]) + "  ·  " + str(len(S.beats)) + " beats",
           font=font("mono", 20), fill=DIM)
    brief = [
        ("Spine", "every spoken word types on screen, on its word. one key word per phrase, huge; the rest small."),
        ("Placement", "type lives in negative space, never on her face; key words can sit BEHIND her (cut-out matte)."),
        ("Accents", "amber = the hazard light (acts I, V) · ultramarine = logic (act II) · magenta = the hundred women (IV)."),
        ("Interrupts", "black cards on the turns, evidence board, zoom stutter, flicker counter, glitch hits, collage."),
        ("Motion gfx", "white dots + lines: the 11 m distance, halved on every 'half'; the series ½+¼+⅛… = 1."),
        ("B-roll", "generated metaphors (bust, tortoise, runner, river, Diogenes, hourglass, hazard switch) + her real days."),
        ("Cuts", "hard cuts on words and on the hazard tick; whips, zoom-throughs, flashes, one light leak."),
        ("Voice", "deliberate, breath-spaced cadence; −1.5 st warmth. synthetic draft until your recording drops in."),
        ("Sound", "tick heartbeat, sub impacts on slams, whooshes on whips, risers into cards; music out at 'love is not the proof'."),
        ("Look", "cleaned + sharpened sources, your LUT once, extra punch; her face is never altered."),
    ]
    y = 240
    for k, v in brief:
        d.text((44, y), k.upper(), font=font("mono", 18), fill=COL["amber"])
        d.text((250, y), v, font=font("sans_s", 22), fill=FG)
        y += 46
    x = 44
    for name in ("white", "amber", "ink", "magenta", "cream"):
        d.rectangle([x, y + 20, x + 120, y + 90], fill=COL[name]); d.text((x, y + 98), name, font=font("mono", 16), fill=DIM)
        x += 150
    d.text((x + 40, y + 24), "Plus Jakarta Sans 800", font=font("sans", 34), fill=FG)
    d.text((x + 40, y + 66), "Cormorant Garamond italic", font=font("serif", 40), fill=FG)
    return c


def main():
    os.makedirs(OUT, exist_ok=True)
    cards = [render_panel_card(b) for b in S.beats if b["id"] != "END"]
    per = 8
    sheets = [cover()]
    for i in range(0, len(cards), per):
        chunk = cards[i:i + per]
        cw, ch = chunk[0].size
        sheet = Image.new("RGB", (4 * cw + 40, 2 * ch + 40), BG)
        for j, c in enumerate(chunk):
            sheet.paste(c, (20 + (j % 4) * cw, 20 + (j // 4) * ch))
        sheets.append(sheet)
    paths = []
    for i, s in enumerate(sheets):
        p = os.path.join(OUT, f"sheet_{i:02d}.jpg")
        s.save(p, quality=86); paths.append(p); print(p, s.size)
    html = ["<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>",
            "<title>No Hurry storyboard</title><style>:root{color-scheme:dark}body{margin:0;background:#0e0e0e;color:#ece6dc;"
            "font:15px/1.5 system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:16px}img{width:100%;height:auto;"
            "display:block;margin:0 0 16px;border-radius:8px}h1{font-size:28px;margin:8px 0 16px}</style></head><body><main>",
            "<h1>No Hurry — social cut storyboard</h1>"]
    for p in paths:
        buf = io.BytesIO(); Image.open(p).save(buf, "JPEG", quality=80)
        html.append(f"<img alt='storyboard sheet' src='data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}'>")
    html.append("</main></body></html>")
    open(os.path.join(OUT, "no_hurry_storyboard.html"), "w").write("\n".join(html))
    print(os.path.join(OUT, "no_hurry_storyboard.html"))


if __name__ == "__main__":
    main()
