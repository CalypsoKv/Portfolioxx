#!/usr/bin/env python3
"""Lay the narration lines on the film timeline and resolve word anchors.

Line N starts after line N-1 ends plus its designed pause (edit/script.json).
Everything visual is anchored to these times, so a real recording re-times the edit.

Usage: timeline.py <project_root>
Writes work/timeline.json and work/narration/narration_track.wav (48 kHz mono, lines placed on the timeline)
"""
import json, os, re, sys

import numpy as np
import soundfile as sf

ROOT = sys.argv[1]
END_BLACK = 2.6  # silence on black after the cut (room for the draft label)


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


def build():
    script = json.load(open(os.path.join(ROOT, "edit", "script.json")))
    lines_meta = {l["id"]: l for l in json.load(open(os.path.join(ROOT, "work", "narration", "lines.json")))["lines"]}
    words = json.load(open(os.path.join(ROOT, "work", "narration", "words.json")))
    t = script["preroll_seconds"]
    out = []
    for line in script["lines"]:
        lid = line["id"]
        dur = lines_meta[lid]["duration"]
        out.append({"id": lid, "act": line["act"], "text": lines_meta[lid]["text"], "start": round(t, 3),
                    "end": round(t + dur, 3), "pause": line["pause"],
                    "words": [{"w": w["w"], "start": round(t + w["start"], 3), "end": round(t + w["end"], 3)}
                              for w in words[lid]["words"]]})
        t += dur + line["pause"]
    cut = out[-1]["end"] + script["tail_seconds"]
    return {"lines": out, "cut_to_black": round(cut, 3), "duration": round(cut + END_BLACK, 3),
            "sources": {k: v["source"] for k, v in lines_meta.items()}}


def resolve(tl, anchor):
    """Anchor syntax:
         "L05"              line start            "L05.end"        line end
         "L05:half"         start of first 'half' "L05:half#2"     second occurrence
         "L05:distance.end" end of that word      any of these + "+0.3" / "-0.2" offset (seconds)
         "@12.5"            absolute time          "cut"            cut to black
    """
    m = re.fullmatch(r"(.+?)([+-]\d+(?:\.\d+)?)?", anchor.strip())
    base, off = m.group(1), float(m.group(2) or 0)
    if base.startswith("@"):
        return float(base[1:]) + off
    if base == "cut":
        return tl["cut_to_black"] + off
    lines = {l["id"]: l for l in tl["lines"]}
    if ":" not in base:
        lid, _, edge = base.partition(".")
        return lines[lid]["end" if edge == "end" else "start"] + off
    lid, rest = base.split(":", 1)
    word, _, edge = rest.partition(".")
    word, _, occ = word.partition("#")
    occ = int(occ or 1)
    hits = [w for w in lines[lid]["words"] if norm(w["w"]) == norm(word)]
    if len(hits) < occ:
        raise KeyError(f"anchor {anchor!r}: word {word!r} #{occ} not in {lid}")
    return hits[occ - 1]["end" if edge == "end" else "start"] + off


def resolve_any(tl, tick, anchor):
    """resolve() plus beat anchors on the hazard-tick grid:
         "beat:<anchor>"     first tick at/after the anchor
         "beat:<anchor>~N"   N ticks after that
    """
    import math
    a = anchor.strip()
    if not a.startswith("beat:"):
        return resolve(tl, a)
    body, n = a[5:], 0
    if "~" in body:
        body, n = body.split("~")
        n = int(n)
    t = resolve(tl, body)
    k = math.ceil((t - tick["start"]) / tick["period"] - 1e-6)
    return tick["start"] + (k + n) * tick["period"]


def main():
    tl = build()
    os.makedirs(os.path.join(ROOT, "work"), exist_ok=True)
    json.dump(tl, open(os.path.join(ROOT, "work", "timeline.json"), "w"), indent=1)
    sr = 48000
    nar = np.zeros(int(tl["duration"] * sr) + sr, np.float32)
    for l in tl["lines"]:
        a, _ = sf.read(os.path.join(ROOT, "work", "narration", f"{l['id']}.wav"), dtype="float32")
        i = int(round(l["start"] * sr))
        nar[i:i + len(a)] += a
    sf.write(os.path.join(ROOT, "work", "narration", "narration_track.wav"), nar[: int(tl["duration"] * sr)], sr,
             subtype="FLOAT")
    for l in tl["lines"]:
        print(f"{l['id']} {l['start']:7.2f}-{l['end']:7.2f}  {l['text'][:70]}")
    print(f"cut to black {tl['cut_to_black']:.2f}s, total {tl['duration']:.2f}s")


if __name__ == "__main__":
    main()
