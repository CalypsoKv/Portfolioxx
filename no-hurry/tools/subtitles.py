#!/usr/bin/env python3
"""Captions (SRT + styled ASS) and the graphics layer (titles, chapters, the series, the Zeno bar).

Captions are timed from word timestamps (work/timeline.json). Emphasis phrases from
edit/script.json are set in Cormorant Garamond italic; everything else in Inter.
Each caption checks the picture behind it and gets a stronger soft shadow only on bright frames.

Usage: subtitles.py <project_root>
Writes output/no_hurry_captions.srt, output/no_hurry_captions.ass, work/graphics.ass
"""
import json, os, re, sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from timeline import resolve_any  # noqa: E402

ROOT = sys.argv[1]
TL = json.load(open(os.path.join(ROOT, "work", "timeline.json")))
MAN = json.load(open(os.path.join(ROOT, "edit", "manifest.json")))
SCRIPT = json.load(open(os.path.join(ROOT, "edit", "script.json")))
MAX_LINE = 30          # characters per line (Inter Medium 50 px on a 1080 px frame)
LEAD, TAIL = 0.10, 0.28
WARM_WHITE = "&H00E1EDF4"  # #F4EDE1 in ASS BGR


def at(a):
    return resolve_any(TL, MAN["tick"], a)


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


def ts_ass(t):
    t = max(0.0, t)
    h, rem = divmod(t, 3600); m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def ts_srt(t):
    ms = int(round(max(0.0, t) * 1000))
    h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


BREAK_BEFORE = {"and", "so", "which", "while", "that", "but", "then", "when", "by", "in"}   # clause/phrase starters
BIND_NEXT = {"the", "a", "an"}                       # never strand an article from its noun
BIND_PREV = {"of", "to", "at", "the", "a", "an", "your", "my", "is", "every", "same", "can", "will", "must"}  # words that lean forward


def split_two(text):
    """Balanced two-line break, preferring punctuation, never leaving a one-word orphan line."""
    words = text.split()
    if len(text) <= MAX_LINE or len(words) < 3:
        return [text]
    best = None
    for i in range(2, len(words) - 1):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        if max(len(a), len(b)) > MAX_LINE + 4:
            continue
        last, first = norm(words[i - 1]), norm(words[i])
        cost = abs(len(a) - len(b)) - (6 if a[-1] in ",.:;" else 0) + (2 if len(a) > len(b) else 0)
        cost += 8 if last in BIND_PREV else 0
        cost += 6 if last in {"i", "you", "he", "she", "we", "they", "it"} else 0  # keep subject with verb
        cost -= 3 if first in BREAK_BEFORE else 0
        cost += 10 if last in BREAK_BEFORE else 0             # a line should not end on a conjunction
        if best is None or cost < best[0]:
            best = (cost, [a, b])
    return best[1] if best else [text]





def fits_two_lines(text):
    lines = split_two(text)
    return len(lines) <= 2 and all(len(l) <= MAX_LINE + 4 for l in lines)


def chunk_cost(ws, is_last):
    text = " ".join(w["w"] for w in ws)
    if not fits_two_lines(text):
        return None
    end_ch = ws[-1]["w"][-1]
    cost = 1.0                                             # every extra caption costs a little
    if not is_last:
        if end_ch in ".:;?!":
            cost -= 4
        elif end_ch == ",":
            cost -= 2
        else:
            cost += 3
    dur = ws[-1]["end"] - ws[0]["start"]
    if len(ws) <= 2 and not (end_ch in ".:;?!" and len(text) >= 9):
        cost += 6                                          # no one- or two-word fragments
    if dur < 0.8:
        cost += 4
    if dur > 4.6:
        cost += 3 * (dur - 4.6)
    if len(text) > 2 * MAX_LINE - 6:
        cost += 2
    return cost


def chunk_words(words):
    """Optimal caption breaks (dynamic programming over break positions)."""
    n = len(words)
    best = [0.0] + [float("inf")] * n
    back = [0] * (n + 1)
    for i in range(1, n + 1):
        for j in range(max(0, i - 14), i):
            c = chunk_cost(words[j:i], i == n)
            if c is None:
                continue
            if i < n:
                nxt, last = norm(words[i]["w"]), norm(words[i - 1]["w"])
                c += -1.5 if nxt in BREAK_BEFORE else 0
                c += 2.5 if nxt in BIND_NEXT and words[i - 1]["w"][-1] not in ",.:;" else 0
                c += 3 if last in BIND_PREV else 0
            if best[j] + c < best[i]:
                best[i], back[i] = best[j] + c, j
    out, i = [], n
    while i > 0:
        out.append(words[back[i]:i]); i = back[i]
    return out[::-1]


def caption_events():
    emph = {}
    for e in SCRIPT["emphasis"]:
        emph.setdefault(e["line"], []).append([norm(x) for x in e["phrase"].split()])
    events = []
    for line in TL["lines"]:
        words = line["words"]
        spans = []
        for phrase in emph.get(line["id"], []):
            toks = [norm(w["w"]) for w in words]
            for i in range(len(toks) - len(phrase) + 1):
                if toks[i:i + len(phrase)] == phrase:
                    spans.append((i, i + len(phrase)))
                    break
        pos, groups = 0, []
        for a, b in sorted(spans):
            if a > pos:
                groups += [("Dialogue", c) for c in chunk_words(words[pos:a])]
            groups.append(("Emphasis", words[a:b]))
            pos = b
        if pos < len(words):
            groups += [("Dialogue", c) for c in chunk_words(words[pos:])]
        for style, ws in groups:
            text = " ".join(w["w"] for w in ws)
            events.append({"style": style, "text": text, "start": ws[0]["start"] - LEAD,
                           "end": ws[-1]["end"] + TAIL, "line": line["id"]})
    # continuity: no flicker between close chunks, minimum on-screen time, no overlaps
    for i, e in enumerate(events):
        nxt = events[i + 1]["start"] if i + 1 < len(events) else TL["cut_to_black"] - 0.3
        min_dur = 1.25 if e["style"] == "Emphasis" else 0.95
        if e["end"] - e["start"] < min_dur:
            e["end"] = e["start"] + min_dur
        if nxt - e["end"] < 0.35:
            e["end"] = nxt - 0.04
        e["end"] = min(e["end"], nxt - 0.04)
    # the last line holds into the ticking, leaves before the cut
    events[-1]["end"] = TL["cut_to_black"] - 0.9
    return events


def brightness_behind(events):
    """Mean luminance of the picture in the caption band (rendered without texture)."""
    sys.argv = [sys.argv[0], ROOT]
    import render_frames as rf
    for e in events:
        vals = []
        for t in np.linspace(e["start"] + 0.1, e["end"] - 0.1, 3):
            img = rf.frame_at(float(t), int(t * 24), with_texture=False)
            band = img[1400:1660, 90:990]
            vals.append(float((band @ np.array([0.2126, 0.7152, 0.0722], np.float32)).mean()))
        e["bright"] = max(vals)
    return events


ASS_HEAD = """[Script Info]
Title: NO HURRY - {title}
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{styles}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

CAPTION_STYLES = "\n".join([
    f"Style: Dialogue,Inter Medium,50,{WARM_WHITE},&H000000FF,&H8C000000,&H96000000,0,0,0,0,100,100,0.4,0,1,1.6,0,2,90,90,330,1",
    f"Style: DialogueBright,Inter Medium,50,{WARM_WHITE},&H000000FF,&H52000000,&H78000000,0,0,0,0,100,100,0.4,0,1,2.6,1.2,2,90,90,330,1",
    f"Style: Emphasis,Cormorant Garamond Medium,78,{WARM_WHITE},&H000000FF,&H8C000000,&H96000000,0,-1,0,0,100,100,0.6,0,1,1.4,0,2,90,90,322,1",
    f"Style: EmphasisBright,Cormorant Garamond Medium,78,{WARM_WHITE},&H000000FF,&H52000000,&H78000000,0,-1,0,0,100,100,0.6,0,1,2.4,1.2,2,90,90,322,1",
])

GRAPHIC_STYLES = "\n".join([
    f"Style: Title,Cormorant Garamond Medium,132,{WARM_WHITE},&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,30,0,1,0,0,5,60,60,0,1",
    f"Style: Chapter,Cormorant Garamond SemiBold,42,&H00E1EDF4,&H000000FF,&H64000000,&H96000000,0,0,0,0,100,100,7,0,1,2.4,0,8,90,90,236,1",
    f"Style: Series,Cormorant Garamond Medium,104,{WARM_WHITE},&H000000FF,&H5A000000,&H80000000,0,0,0,0,100,100,2,0,1,3.2,0,8,60,60,0,1",
    f"Style: Mark,Cormorant Garamond Medium,44,&H20E1EDF4,&H000000FF,&H8C000000,&HA0000000,0,0,0,0,100,100,1,0,1,1.4,0,8,0,0,0,1",
    f"Style: Shape,Inter,20,&H38E1EDF4,&H000000FF,&HB4000000,&HB4000000,0,0,0,0,100,100,0,0,1,0.8,0,7,0,0,0,1",
    "Style: Note,Inter,28,&H70C8C2B8,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,1.5,0,1,0,0,2,90,90,120,1",
])


def write_captions(events):
    out_dir = os.path.join(ROOT, "output")
    os.makedirs(out_dir, exist_ok=True)
    srt, ass = [], [ASS_HEAD.format(title="captions", styles=CAPTION_STYLES)]
    for i, e in enumerate(events, 1):
        lines = [e["text"]] if e["style"] == "Emphasis" and len(e["text"]) <= 26 else split_two(e["text"])
        srt_text = "\n".join(lines)
        if e["style"] == "Emphasis":
            srt_text = "\n".join(f"<i>{l}</i>" for l in lines)
        srt.append(f"{i}\n{ts_srt(e['start'])} --> {ts_srt(e['end'])}\n{srt_text}\n")
        style = e["style"] + ("Bright" if e["bright"] > 0.55 else "")
        fade = "\\fad(320,260)" if e["style"] == "Emphasis" else "\\fad(160,160)"
        blur = "\\blur5" if e["bright"] > 0.55 else "\\blur3.5"
        ass.append(f"Dialogue: 0,{ts_ass(e['start'])},{ts_ass(e['end'])},{style},,0,0,0,,{{{fade}{blur}}}" + "\\N".join(lines))
    open(os.path.join(out_dir, "no_hurry_captions.srt"), "w").write("\n".join(srt))
    open(os.path.join(out_dir, "no_hurry_captions.ass"), "w").write("\n".join(ass) + "\n")
    return events


def shot(sid):
    return at(next(s for s in MAN["shots"] if s["id"] == sid)["start"])


def circle(r):
    """ASS vector circle with its bounding box at 0..2r (libass aligns drawings by bounding box)."""
    k = r * 0.5523
    p = lambda x, y: f"{x + r:.2f} {y + r:.2f}"  # noqa: E731
    return (f"m {p(0, -r)} b {p(k, -r)} {p(r, -k)} {p(r, 0)} b {p(r, k)} {p(k, r)} {p(0, r)} "
            f"b {p(-k, r)} {p(-r, k)} {p(-r, 0)} b {p(-r, -k)} {p(-k, -r)} {p(0, -r)}")


def graphics():
    ev = []
    D = lambda a, b, style, text, layer=0: ev.append(  # noqa: E731
        f"Dialogue: {layer},{ts_ass(a)},{ts_ass(b)},{style},,0,0,0,,{text}")
    # chapter markers (top, letter-spaced) and the title on black
    chapters = [("S01", 1.0, "I · THE IMPOSSIBLE ARRIVAL"), ("S05", 0.5, "II · ZENO’S DIVISION"),
                ("S26", 0.7, "III · THE INFINITE IN-BETWEEN"), ("S34", 0.6, "IV · A HUNDRED DIFFERENT WOMEN"),
                ("S39", 0.9, "V · THE PRACTICAL PROOF")]
    for sid, off, text in chapters:
        t = shot(sid) + off
        D(t, t + 3.3, "Chapter", "{\\fad(700,700)\\blur3}" + text)
    t0, t1 = shot("S04") + 0.45, shot("S05") - 0.05
    D(t0, t1, "Title", "{\\fad(900,600)\\blur0.4}NO HURRY")

    # the series: terms appear on their words, layout fixed (centred on the full expression)
    a = at("L20:half#2") - 0.12
    b = at("L21") + 0.4
    terms = [("½", at("L20:half#2")), (" + ¼", at("L20:quarter")), (" + ⅛", at("L20:eighth")),
             (" + …", at("L20:eighth.end") + 0.25), (" = 1", at("L20:one"))]
    txt = "{\\pos(540,290)\\fad(0,450)\\blur5}"   # above the gate sign and her face in S27-S30
    for term, t in terms:
        ms = int((t - a) * 1000)
        txt += f"{{\\alpha&HFF&\\t({ms},{ms + 260},\\alpha&H00&)}}{term}"
    D(a, b, "Series", txt)

    # the Zeno bar: an 11-metre line; the traveller covers half of what remains on each 'half'
    y, x0, x1 = 1318, 150, 930
    bar_in, bar_out = at("L05") - 0.1, at("L09:middle") + 0.5
    fadebar = "\\fad(500,700)"
    D(bar_in, bar_out, "Shape", f"{{\\an7\\pos({x0},{y})\\p1{fadebar}}}m 0 0 l {x1 - x0} 0 {x1 - x0} 2 0 2")
    D(bar_in, bar_out, "Shape", f"{{\\an7\\pos({x1 - 1},{y - 11})\\p1{fadebar}}}m 0 0 l 3 0 3 24 0 24")
    hits = [at("L05:half"), at("L06:half"), at("L07:half"), at("L08:out.end") + 0.15]
    xs, pos = [], x0
    for k in range(10):
        pos = pos + (x1 - pos) / 2
        xs.append(pos)
    times = hits[:3] + [hits[3] + 0.18 * i for i in range(7)]   # the halves never run out: a converging flurry
    labels = ["½", "¾", "⅞"]
    dot = lambda x: f"{x - 6:.1f},{y - 5}"                         # circle(6) spans 0..12 -> centre on the line
    D(bar_in, times[0], "Shape", f"{{\\an7\\pos({dot(x0)}){fadebar}\\p1}}{circle(6)}", 1)
    prev = x0
    for i, (xx, tt) in enumerate(zip(xs, times)):
        dur = 520 if i < 3 else 140
        last = i == len(xs) - 1
        end = bar_out if last else times[i + 1]
        D(tt, end, "Shape", f"{{\\an7\\move({dot(prev)},{dot(xx)},0,{dur}){'\\fad(0,700)' if last else ''}\\p1}}{circle(6)}", 1)
        D(tt + dur / 1000, bar_out, "Shape", f"{{\\an7\\pos({xx - 1:.1f},{y - 7})\\fad(200,700)\\p1}}m 0 0 l 2 0 2 16 0 16")
        if i < 3:
            D(tt + dur / 1000, bar_out, "Mark", f"{{\\an8\\pos({xx:.1f},{y + 16})\\fad(250,700)}}{labels[i]}")
        prev = xx
    # draft label: shown only while any narration line is synthetic
    if any(v.startswith("SYNTHETIC") for v in TL["sources"].values()):
        D(TL["cut_to_black"] + 0.35, TL["duration"] - 0.05, "Note",
          "{\\fad(300,200)}draft cut · narration is a synthetic placeholder voice")
    path = os.path.join(ROOT, "work", "graphics.ass")
    open(path, "w").write(ASS_HEAD.format(title="graphics", styles=GRAPHIC_STYLES) + "\n".join(ev) + "\n")


def main():
    events = brightness_behind(caption_events())
    write_captions(events)
    graphics()
    for e in events:
        flag = " (bright bg)" if e["bright"] > 0.55 else ""
        print(f"{e['start']:7.2f}-{e['end']:7.2f} {e['style']:9s} {e['text']}{flag}")


if __name__ == "__main__":
    main()
