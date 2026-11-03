#!/usr/bin/env python3
"""Turn the storyboard (edit/social/storyboard.py) + narration timing into the Remotion timeline.

Writes studio/src/NoHurrySocial.tsx: every clip, phrase, transition and sound is its own JSX node with literal,
inline props, so Remotion Studio can select, move, trim and restyle it (and save the edit back to code).
Type is laid out here with the real font files (same rules as the storyboard sheets, at full 1080x1920 scale).

Usage: build_studio.py <project_root>
Needs studio/public populated (tools/social_assets.py, tools/sound_social.py).
"""
import json, os, sys

import soundfile as sf
from PIL import Image, ImageFilter, ImageFont

ROOT = sys.argv[1]
sys.path.insert(0, os.path.dirname(__file__))
from social_common import Social  # noqa: E402

S = Social(ROOT)
FPS = S.fps
PUB = os.path.join(ROOT, "studio", "public")
FONTS = os.path.join(ROOT, "assets", "fonts")
OUT = os.path.join(ROOT, "studio", "src", "NoHurrySocial.tsx")
# --motion: the side experiment. Same edit, but the photo beats listed in work/social/motionlab/manifest.json play
# the moving plates from tools/motion_lab.py; writes NoHurrySocialMotion.tsx and leaves the main timeline alone.
MOTION = {}
if "--motion" in sys.argv:
    OUT = os.path.join(ROOT, "studio", "src", "NoHurrySocialMotion.tsx")
    for sid, info in json.load(open(os.path.join(ROOT, "work", "social", "motionlab", "manifest.json"))).items():
        for bid in info["members"]:
            MOTION[bid] = dict(info, shot=sid)
W, H = 1080, 1920
MX, TOP, BOTTOM, GAP = 81, 150, 380, 36
SAFE_W = {"t": W - 2 * MX, "m": W - 2 * MX, "b": W - MX - 150}     # keep clear of the Reels icon column
SIZE = {"s": 45, "m": 57, "l": 81, "xl": 120, "xxl": 171, "mega": 240}
COL = {"white": "#F7F3EC", "amber": "#FFB000", "ink": "#3D2BFF", "magenta": "#FF2D87", "cream": "#F4E9D8"}
TRANS = {"whip-l": 8, "whip-r": 8, "zoom": 8, "dip": 12}            # overlapping transitions (TransitionSeries.Transition)
OVERLAY = {"flash": 6, "leak": 26}                                  # effects on the cut (TransitionSeries.Overlay)
FONT_FILE = {("sans", 800): "PlusJakartaSans-800.ttf", ("sans", 700): "PlusJakartaSans-700.ttf",
             ("serif", 600): "CormorantGaramond-600Italic.ttf", ("mono", 500): "JetBrainsMono-Medium.ttf"}


def F(t):
    return int(round(t * FPS))


_fonts = {}


def font(kind, weight, px):
    key = (kind, weight, px)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(os.path.join(FONTS, FONT_FILE[(kind, weight)]), px)
    return _fonts[key]


def js(v):
    """Python value -> TSX literal (inline)."""
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int,)):
        return str(v)
    if isinstance(v, float):
        s = f"{v:.4f}".rstrip("0").rstrip(".")
        return s if s not in ("-0", "") else "0"
    if isinstance(v, str):
        return "'" + v.replace("\\", "\\\\").replace("'", "\\'") + "'"
    if isinstance(v, (list, tuple)):
        return "[" + ", ".join(js(x) for x in v) + "]"
    if isinstance(v, dict):
        return "{" + ", ".join(f"{k}: {js(x)}" for k, x in v.items() if x is not None) + "}"
    raise TypeError(type(v))


def attr(name, value):
    """JSX string attribute: raw "..." (JSX does not process escapes) unless the text itself has a double quote."""
    return f'{name}="{value}"' if '"' not in value else f"{name}={{{js(value)}}}"


_dims = {}


def dims(public_path):
    if public_path not in _dims:
        with Image.open(os.path.join(PUB, public_path)) as im:
            _dims[public_path] = im.size
    return _dims[public_path]


def photo(stem):
    return f"photos/{stem}.jpg"


def board_bg(stem):
    """Blurred, darkened full-frame version of a photo for the evidence board (derived asset)."""
    out = f"photos/{stem}_board.jpg"
    p = os.path.join(PUB, out)
    if not os.path.exists(p):
        im = Image.open(os.path.join(PUB, photo(stem))).convert("RGB")
        w, h = im.size
        cw = h * W / H
        im = im.crop((int((w - cw) / 2), 0, int((w + cw) / 2), h)).resize((W, H), Image.LANCZOS)
        im = im.filter(ImageFilter.GaussianBlur(22)).point(lambda v: int(v * 0.36))
        im.save(p, quality=90)
    return out


# ------------------------------------------------------------------ type layout (port of the storyboard rules)
def text_rows(phrase, words):
    key = phrase.get("key", [])
    keysizes = phrase.get("keysizes")
    base = "serif" if phrase.get("font") == "serif" else ("mono" if phrase.get("font") == "mono" else "sans")
    color = COL[phrase.get("color", "white")]
    first = phrase["words"][1]
    size_tok = phrase.get("size", "s")
    rows, cur = [], []

    def small_row(ws, pre_key):
        if key:
            tok = "m" if (pre_key and size_tok == "m") else "s"
        else:
            tok = size_tok
        rows.append(dict(words=ws, tok=tok, font=base, color=COL["white"], key=False))

    if phrase.get("one_row"):                       # the whole phrase as one key row (e.g. the closing title)
        return [dict(words=words, tok=size_tok, font=base, color=color, key=True)]
    for i, w in enumerate(words):
        idx = first + i
        if idx in key:
            if cur:
                small_row(cur, True); cur = []
            tok = keysizes[key.index(idx)] if keysizes else size_tok
            rows.append(dict(words=[w], tok=tok, font=base, color=color, key=True, idx=idx))
        else:
            cur.append(w)
            if len(" ".join(x["w"] for x in cur)) > 22:
                small_row(cur, False); cur = []
    if cur:
        small_row(cur, False)
    for r in rows:
        for w in r["words"]:
            w.setdefault("idx", None)
    return rows


def measure_rows(rows, safe):
    out = []
    for r in rows:
        px = SIZE[r["tok"]]
        if r["font"] == "serif" and not r["key"]:
            px = int(px * 1.3)                          # Cormorant's small x-height needs more size to read
        text = " ".join(w["w"] for w in r["words"])
        while True:
            if r["font"] == "sans":
                weight = 800 if (r["key"] or px >= 81) else 700
                track = -0.035 if r["key"] else (-0.015 if px >= 81 else -0.005)
            elif r["font"] == "serif":
                weight, track = 600, -0.01
            else:
                weight, track = 500, 0.0
            f = font(r["font"], weight, px)
            width = f.getlength(text) + track * px * len(text) + (0.3 * px * len(r["words"]) if r.get("box") else 0)
            if width <= safe or px <= 30:
                break
            px = int(px * 0.94)
        asc, desc = f.getmetrics()
        lh = int(round((asc + desc) * (0.86 if r["font"] == "serif" else 0.92)))
        out.append(dict(r, size=px, weight=weight, track=track, width=width, lh=lh))
    return out


def layout(phrase, seq_start, stack, strike=None, glitch_at=None):
    words = [dict(w, idx=phrase["words"][1] + i) for i, w in enumerate(S.phrase_words(phrase))]
    at = phrase.get("at", "tl")
    vert = {"tl": "t", "tr": "t", "tc": "t", "ml": "m", "mr": "m", "c": "m"}.get(at, "b")
    side = {"tl": "l", "ml": "l", "bl": "l", "tr": "r", "mr": "r", "br": "r"}.get(at, "c")
    rows = text_rows(phrase, words)
    if phrase.get("box"):
        for r in rows:
            if r["key"]:
                r["box"] = COL[phrase["box"]]
    rows = measure_rows(rows, SAFE_W[vert])
    bw = int(max(r["width"] for r in rows)) + 4
    bh = sum(r["lh"] for r in rows)
    used = stack.get(at, 0)
    x = {"l": MX, "r": W - MX - bw, "c": (W - bw) / 2 + phrase.get("dx", 0) * W}[side]
    y = {"t": TOP + used, "m": (H - bh) / 2 + used, "b": H - BOTTOM - bh - used}[vert] + phrase.get("dy", 0) * H
    stack[at] = used + bh + GAP
    krows, strike_ref = [], None
    for ri, r in enumerate(rows):
        kw = []
        for wi, w in enumerate(r["words"]):
            kw.append(dict(text=w["w"], at=F(w["start"]) - seq_start - 1))
            if strike is not None and w["idx"] == strike[0]:
                strike_ref = dict(row=ri, word=wi, at=strike[1], color=COL["amber"])
        krows.append(dict(words=kw, size=r["size"], lh=r["lh"], font=r["font"], weight=r["weight"],
                          color=r["color"], key=True if r["key"] else None, track=r["track"], box=r.get("box")))
    name = " ".join(w["w"] for w in words)
    return dict(name=name, rows=krows, x=round(x), y=round(y), blockWidth=bw,
                align={"l": "left", "r": "right", "c": "center"}[side], strike=strike_ref, glitchAt=glitch_at)


def phrase_jsx(p, ind):
    name = ("‘" + p["name"][:48] + ("…’" if len(p["name"]) > 48 else "’"))
    rows = ",\n".join(f"{ind}\t\t{js(r)}" for r in p["rows"])
    extra = ""
    if p.get("strike"):
        extra += f"\n{ind}\tstrike={{{js(p['strike'])}}}"
    if p.get("glitchAt") is not None:
        extra += f"\n{ind}\tglitchAt={{{p['glitchAt']}}}"
    return (f"{ind}<KineticPhrase\n{ind}\t{attr('name', name)}\n"
            f"{ind}\tx={{{p['x']}}}\n{ind}\ty={{{p['y']}}}\n{ind}\tblockWidth={{{p['blockWidth']}}}\n{ind}\talign=\"{p['align']}\"{extra}\n"
            f"{ind}\trows={{[\n{rows},\n{ind}\t]}}\n{ind}/>")


# ------------------------------------------------------------------ visuals
def view(v):
    return [round(float(x), 4) for x in v]


def diagram_spec(dg, seq_start):
    d = dict(kind=dg["kind"], a=view(dg["a"]), b=view(dg["b"]))
    if dg.get("label"):
        d["label"] = dg["label"]
    if dg["kind"] == "halves":
        d["step"] = dg.get("step", 0)
    if dg["kind"] == "arrive":
        d["until"] = F(S.at(dg["until"])) - seq_start
    return d


def photo_jsx(b, v, seq_start, src, ind, dim=None):
    w, h = dims(src)
    kw = dict(src=src, imgW=w, imgH=h, fr=view(v["fr"]), to=view(v["to"]))
    if dim is not None:
        kw["dim"] = dim
    if v.get("glitch"):
        kw["glitchAt"] = F(S.at(v["glitch"])) - seq_start
    if v.get("stutter"):
        kw["stutter"] = [float(z) for z in v["stutter"]]
        kw["stutterAt"] = F(S.at("L08:never")) - seq_start if b["id"] == "B12" else 0
    if v.get("punch"):
        pl = []
        for anchor, stem, fr in v["punch"]:
            pw, ph = dims(photo(stem))
            pl.append(dict(at=F(S.at(anchor)) - seq_start, src=photo(stem), imgW=pw, imgH=ph, view=view(fr)))
        kw["punch"] = pl
    if v.get("pulse"):
        kw["pulseOffset"] = seq_start
        kw["pulseCenter"] = [0.5, 0.48]
    if v.get("diagram"):
        kw["diagram"] = diagram_spec(v["diagram"], seq_start)
    nm = f"{b['id']} plate · {os.path.basename(src)}"
    lines = [f"{ind}<PhotoShot", f"{ind}\tname=\"{nm}\""]
    for k, x in kw.items():
        lines.append(f"{ind}\t{k}={{{js(x)}}}" if not isinstance(x, str) else f"{ind}\t{k}=\"{x}\"")
    lines.append(f"{ind}/>")
    return "\n".join(lines)


def montage_items(v, dur):
    items = v["items"]
    n = len(items)
    half = 0.36 * FPS
    base = [int(round(half * (i + 1)) - round(half * i)) for i in range(n - 1)]
    last = dur - sum(base)
    out = []
    for (src, date), d in zip(items, base + [last]):
        if src.startswith("VID-"):
            name, _, t = src.partition("@")
            out.append(dict(src=f"video/{name}.mp4", kind="video", imgW=1080, imgH=1920,
                            trimBefore=F(float(t)), date=date, dur=d))
        else:
            w, h = dims(f"montage/{src}.jpg")
            out.append(dict(src=f"montage/{src}.jpg", kind="image", imgW=w, imgH=h, date=date, dur=d))
    return out


def visual_jsx(b, seq_start, dur, ind):
    """Returns (layers_before_type, behind_layers, layers_after_behind) as JSX strings."""
    v = b["visual"]
    k = v["kind"]
    pre, mid = [], []
    if b["id"] in MOTION:
        m = MOTION[b["id"]]
        hits = sorted({F(S.lines[ph["words"][0]]["words"][i]["start"]) - seq_start
                       for ph in b.get("say", []) for i in ph.get("key", [])
                       if 0 <= F(S.lines[ph["words"][0]]["words"][i]["start"]) - seq_start < dur})
        pre.append(f"{ind}<MotionPlate\n{ind}\tname=\"{b['id']} motion plate ({m['shot']})\"\n{ind}\tsrc=\"{m['src']}\"\n"
                   f"{ind}\tplateFrom={{{seq_start - m['start']}}}\n{ind}\thits={{{js(hits)}}}\n{ind}\tkick={{0.035}}\n{ind}/>")
        if k == "behind" and m.get("rig") and any(ph.get("behind") for ph in b.get("say", [])):
            cw, ch = dims(f"cutouts/{v['src']}.webp")
            mid.append(f"{ind}<CutoutLayer\n{ind}\tname=\"{b['id']} her cut-out (rigid, same move as the plate)\"\n"
                       f"{ind}\tsrc=\"cutouts/{v['src']}.webp\"\n{ind}\timgW={{{cw}}}\n{ind}\timgH={{{ch}}}\n"
                       f"{ind}\tfr={{{js(view(v['fr']))}}}\n{ind}\tto={{{js(view(v['fr']))}}}\n{ind}\trig={{{js(m['rig'])}}}\n"
                       f"{ind}\thits={{{js(hits)}}}\n{ind}/>")
        return pre, mid
    if k == "black":
        pre.append(f"{ind}<AbsoluteFill name=\"{b['id']} black\" style={{{{backgroundColor: '#050505'}}}} />")
    elif k == "title":
        pre.append(f"{ind}<TitleCard\n{ind}\tname=\"{b['id']} title\"\n{ind}\ttext=\"{v['text']}.\"\n{ind}\tcolor=\"{COL['cream']}\"\n"
                   f"{ind}\tsize={{176}}\n{ind}\tstyle={{{{backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center'}}}}\n{ind}/>")
    elif k in ("photo", "broll"):
        src = photo(v["src"]) if k == "photo" else f"broll/{v['src']}.jpg"
        pre.append(photo_jsx(b, v, seq_start, src, ind, dim=v.get("dim")))
    elif k == "behind":
        pre.append(photo_jsx(b, v, seq_start, photo(v["src"]), ind, dim=v.get("dim", 0.85)))
        cw, ch = dims(f"cutouts/{v['src']}.webp")
        g = F(S.at(v["glitch"])) - seq_start if v.get("glitch") else None
        mid.append(f"{ind}<CutoutLayer\n{ind}\tname=\"{b['id']} her cut-out (same move as the plate)\"\n{ind}\tsrc=\"cutouts/{v['src']}.webp\"\n"
                   f"{ind}\timgW={{{cw}}}\n{ind}\timgH={{{ch}}}\n{ind}\tfr={{{js(view(v['fr']))}}}\n{ind}\tto={{{js(view(v['to']))}}}"
                   + (f"\n{ind}\tglitchAt={{{g}}}" if g is not None else "") + f"\n{ind}/>")
    elif k == "video":
        pre.append(f"{ind}<Video\n{ind}\tname=\"{b['id']} {v['src']} (real)\"\n{ind}\tsrc={{staticFile('video/{v['src']}.mp4')}}\n"
                   f"{ind}\ttrimBefore={{{F(v.get('src_in', 0))}}}\n{ind}\tplaybackRate={{{v.get('rate', 1)}}}\n{ind}\tmuted\n"
                   f"{ind}\tobjectFit=\"cover\"\n{ind}\tstyle={{{{width: 1080, height: 1920}}}}\n{ind}/>")
    elif k == "evidence":
        cards = []
        for c in v["cards"]:
            cw, ch = dims(photo(c["src"]))
            cards.append(dict(src=photo(c["src"]), imgW=cw, imgH=ch, view=view(c["crop"]), at=F(S.at(c["at"])) - seq_start,
                              caption=c["caption"], rot=c["rot"], pos=view(c["pos"])))
        body = ",\n".join(f"{ind}\t\t{js(c)}" for c in cards)
        pre.append(f"{ind}<EvidenceBoard\n{ind}\tname=\"{b['id']} evidence board\"\n{ind}\tbg=\"{board_bg(v['bg'])}\"\n"
                   f"{ind}\tcards={{[\n{body},\n{ind}\t]}}\n{ind}/>")
    elif k == "flicker":
        items = [dict(src=photo(s), imgW=dims(photo(s))[0], imgH=dims(photo(s))[1]) for s in v["srcs"]]
        body = ",\n".join(f"{ind}\t\t{js(x)}" for x in items)
        pre.append(f"{ind}<FlickerShot\n{ind}\tname=\"{b['id']} flicker\"\n{ind}\tevery={{{v['every']}}}"
                   + (f"\n{ind}\tcounter={{{js(v['counter'])}}}" if v.get("counter") else "")
                   + f"\n{ind}\titems={{[\n{body},\n{ind}\t]}}\n{ind}/>")
    elif k == "collage":
        pre.append(f"{ind}<AbsoluteFill name=\"{b['id']} magenta\" style={{{{backgroundColor: '{v['bg']}'}}}} />")
        items = []
        for s in v["cutouts"]:
            cw, ch = dims(f"collage/{s}.webp")
            items.append(dict(src=f"collage/{s}.webp", w=cw, h=ch))
        body = ",\n".join(f"{ind}\t\t{js(x)}" for x in items)
        mid.append(f"{ind}<CollageCutouts\n{ind}\tname=\"{b['id']} her, eight times\"\n{ind}\tevery={{{v['every']}}}\n"
                   f"{ind}\titems={{[\n{body},\n{ind}\t]}}\n{ind}/>")
    elif k == "montage":
        items = montage_items(v, dur)
        body = ",\n".join(f"{ind}\t\t{js(x)}" for x in items)
        pre.append(f"{ind}<MontageShot\n{ind}\tname=\"{b['id']} montage\"\n{ind}\titems={{[\n{body},\n{ind}\t]}}\n{ind}/>")
    else:
        raise ValueError(k)
    return pre, mid


def beat_jsx(b, seq_start, dur, d_in, ind):
    v = b["visual"]
    pre, mid = visual_jsx(b, seq_start, dur, ind)
    glitch = F(S.at(v["glitch"])) - seq_start if v.get("glitch") else None
    stack, behind, front = {}, [], []
    for ph in b.get("say", []):
        strike = None
        if ph.get("strike") is not None:
            strike = (ph["strike"], F(S.at(ph["strike_at"])) - seq_start)
        p = layout(ph, seq_start, stack, strike=strike, glitch_at=glitch if ph.get("key") else None)
        (behind if ph.get("behind") else front).append(phrase_jsx(p, ind))
    if v["kind"] == "photo" and v.get("series"):
        ts = [F(S.at(a)) - seq_start - 1 for a in v["series"]]
        rows = [dict(words=[dict(text="½", at=ts[0]), dict(text="+ ¼", at=ts[1]), dict(text="+ ⅛", at=ts[2]), dict(text="+ …", at=ts[3])],
                     size=124, lh=150, font="sans", weight=800, color=COL["white"], track=-0.02)]
        front.append(phrase_jsx(dict(name="series ½ + ¼ + ⅛ + …", rows=rows, x=MX, y=TOP, blockWidth=W - 2 * MX, align="left"), ind))
    scrim = []
    if v["kind"] in ("photo", "broll", "behind", "video", "flicker"):
        ats = [ph.get("at", "tl") for ph in b.get("say", [])] + (["tl"] if v.get("series") else [])
        top = 0.42 if any(a[0] == "t" for a in ats) else 0
        bottom = 0.4 if any(a[0] == "b" for a in ats) else 0
        if b.get("label") and b["label"]["at"][0] == "t":
            top = max(top, 0.3)
        if top or bottom:
            scrim.append(f"{ind}<Scrim name=\"{b['id']} scrim\" top={{{top}}} bottom={{{bottom}}} />")
    extra = []
    if b.get("label"):
        lab = b["label"]
        extra.append(f"{ind}<MonoLabel name=\"{b['id']} label\" {attr('text', lab['text'])} at=\"{lab['at']}\""
                     + (f" size={{{lab['size']}}}" if lab.get("size") else "")
                     + (f" color=\"{COL[lab['color']]}\"" if lab.get("color") else "") + " />")
    if b.get("chapter"):
        extra.append(f"{ind}<ChapterTag name=\"{b['id']} chapter\" {attr('text', b['chapter'])} from={{{d_in // 2}}} durationInFrames={{{min(66, dur - d_in // 2)}}} />")
    return "\n".join(pre + scrim + behind + mid + front + extra)


# ------------------------------------------------------------------ sound
def sfx_name(b, sid):
    if sid == "whoosh" and b.get("transition") == "whip-l":
        return "whoosh_l"
    return sid


def lanes(events):
    """Greedy lane assignment so sounds on one Track never overlap."""
    ends, out = [], []
    for e in sorted(events, key=lambda e: e["from"]):
        for i, end in enumerate(ends):
            if e["from"] >= end:
                ends[i] = e["from"] + e["len"]; out.append((i, e)); break
        else:
            ends.append(e["from"] + e["len"]); out.append((len(ends) - 1, e))
    return out, len(ends)


def audio_len(rel):
    info = sf.info(os.path.join(PUB, rel))
    return int(info.frames / info.samplerate * FPS) + 1


# ------------------------------------------------------------------ assemble
def main():
    beats = S.beats
    T = [F(b["t0"]) for b in beats] + [F(S.tl["duration"])]
    din = [TRANS.get(b.get("transition", "cut"), 0) for b in beats] + [0]
    seqs = []
    for i, b in enumerate(beats):
        s0 = T[i] - din[i] // 2
        e0 = T[i + 1] + din[i + 1] // 2
        seqs.append((b, s0, e0 - s0, din[i]))
    total = T[-1]
    assert seqs[-1][1] + seqs[-1][2] == total, (seqs[-1], total)

    pic = []
    ind = "\t\t\t\t"
    for i, (b, s0, dur, d_in) in enumerate(seqs):
        tr = b.get("transition", "cut")
        if i > 0 and tr in TRANS:
            pres = {"whip-l": "whip({direction: 'left'})", "whip-r": "whip({direction: 'right'})", "zoom": "zoomPunch({strength: 1})",
                    "dip": "dip()"}[tr]
            pic.append(f"\t\t\t<TransitionSeries.Transition\n\t\t\t\tpresentation={{{pres}}}\n\t\t\t\ttiming={{linearTiming({{durationInFrames: {TRANS[tr]}}})}}\n\t\t\t/>")
        elif i > 0 and tr in OVERLAY:
            comp = {"flash": "<Flash name=\"Flash\" color=\"#FFFFFF\" />", "leak": "<LightLeak name=\"Light leak\" />"}[tr]
            pic.append(f"\t\t\t<TransitionSeries.Overlay durationInFrames={{{OVERLAY[tr]}}}>\n{ind}{comp}\n\t\t\t</TransitionSeries.Overlay>")
        title = f"{b['id']} · {b['name']}".replace('"', "'")
        pic.append(f"\t\t\t<TransitionSeries.Sequence name=\"{title}\" durationInFrames={{{dur}}}>\n{beat_jsx(b, s0, dur, d_in, ind)}\n\t\t\t</TransitionSeries.Sequence>")

    # voice
    vo = []
    for l in S.tl["lines"]:
        nm = (l["id"] + " · " + l["text"][:42] + ("…" if len(l["text"]) > 42 else "")).replace('"', "'")
        vo.append(f"\t\t\t<Audio name=\"{nm}\" src={{staticFile('audio/vo/{l['id']}.wav')}} from={{{F(l['start'])}}} />")

    # sfx
    ev = []
    for b in beats:
        for sid, anchor in b.get("sfx", []):
            name = sfx_name(b, sid)
            rel = f"audio/sfx/{name}.wav"
            ev.append(dict(name=name, rel=rel, beat=b["id"], **{"from": max(0, F(S.at(anchor)))}, len=audio_len(rel)))
    placed, nl = lanes(ev)
    sfx_tracks = []
    for lane in range(nl):
        items = [f"\t\t\t<Audio name=\"{e['beat']} {e['name']}\" src={{staticFile('{e['rel']}')}} from={{{e['from']}}} />"
                 for i, e in placed if i == lane]
        sfx_tracks.append(f"\t\t<Track name=\"SFX {lane + 1}\">\n" + "\n".join(items) + "\n\t\t</Track>")

    amb_from = F(next(b["t0"] for b in beats if b["id"] == "B28"))
    COMP = "NoHurrySocialMotion" if MOTION else "NoHurrySocial"
    motion_import = "\nimport {MotionPlate} from './nohurry/MotionPlate';" if MOTION else ""
    src = f"""// GENERATED by tools/build_studio.py from edit/social/storyboard.py and the narration timing.
// Every clip, phrase and sound below is its own node with inline props, so Remotion Studio can edit it.
// Re-running the generator overwrites this file: keep hand edits small, or move them into the storyboard.
import {{Audio, Video}} from '@remotion/media';
import {{linearTiming, TransitionSeries}} from '@remotion/transitions';
import React from 'react';
import {{AbsoluteFill, staticFile, Track}} from 'remotion';
import {{ChapterTag, Finish, Flash, LightLeak, MonoLabel, Scrim, TitleCard}} from './nohurry/Cards';
import {{CollageCutouts, EvidenceBoard, FlickerShot, MontageShot}} from './nohurry/Interrupts';
import {{KineticPhrase}} from './nohurry/KineticPhrase';
import {{CutoutLayer, PhotoShot}} from './nohurry/PhotoShot';{motion_import}
import {{dip, whip, zoomPunch}} from './nohurry/transitions';

export const {COMP}: React.FC = () => {{
	return (
		<AbsoluteFill style={{{{backgroundColor: '#050505'}}}}>
		<TransitionSeries name="Picture">
{chr(10).join(pic)}
		</TransitionSeries>
		<Finish name="Grain + vignette" grain={{0.11}} vignette={{0.3}} />
		<Track name="Voice (synthetic draft)">
{chr(10).join(vo)}
		</Track>
{chr(10).join(sfx_tracks)}
		<Track name="Music (original score)">
			<Audio name="Score" src={{staticFile('audio/score.wav')}} />
		</Track>
		<Track name="Hazard relay (synthesised)">
			<Audio name="Tick / tock" src={{staticFile('audio/tick.wav')}} />
		</Track>
		<Track name="Street (real, VID-20261005)">
			<Audio name="Street ambience" src={{staticFile('audio/amb_walk.wav')}} from={{{amb_from}}} />
		</Track>
		</AbsoluteFill>
	);
}};
"""
    open(OUT, "w").write(src)
    audio = [dict(kind="voice", src=f"audio/vo/{l['id']}.wav", frame=F(l["start"])) for l in S.tl["lines"]]
    audio += [dict(kind="sfx", src=e["rel"], frame=e["from"]) for e in ev]
    audio += [dict(kind="music", src="audio/score.wav", frame=0), dict(kind="tick", src="audio/tick.wav", frame=0),
              dict(kind="ambience", src="audio/amb_walk.wav", frame=amb_from)]
    meta = dict(durationInFrames=total, fps=FPS, beats=[dict(id=b["id"], start=s0, dur=d) for b, s0, d, _ in seqs], audio=audio)
    meta_name = "studio_meta_motion.json" if MOTION else "studio_meta.json"
    json.dump(meta, open(os.path.join(ROOT, "work", "social", meta_name), "w"), indent=1)
    print(f"wrote {OUT}: {len(seqs)} sequences, {len(vo)} voice lines, {len(ev)} sfx on {nl} lanes, {total} frames")


if __name__ == "__main__":
    main()
