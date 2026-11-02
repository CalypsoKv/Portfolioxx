#!/usr/bin/env python3
"""Lay the social-cut narration on a 30 fps timeline with tight, rhythmic pauses.

Usage: social_timeline.py <project_root>
Reads work/social/narration/words.json, writes work/social/timeline.json
"""
import json, os, sys

ROOT = sys.argv[1]
FPS = 30
PREROLL = 0.25
# breath after each line (s): short for argument, longer only where the picture needs to land
PAUSE = {"L01": 0.45, "L02": 0.35, "L03": 2.4, "L04": 0.25, "L05": 0.25, "L06": 0.25, "L07": 0.35, "L08": 0.3,
         "L09": 0.6, "L10": 0.2, "L11": 0.9, "L12": 0.25, "L13": 0.25, "L14": 0.25, "L15": 0.25, "L16": 0.9,
         "L17": 0.5, "L18": 1.1, "L19": 0.3, "L20": 0.6, "L21": 0.25, "L22": 0.7, "L23": 0.25, "L24": 0.25,
         "L25": 1.4, "L26": 0.25, "L27": 0.4, "L28": 4.6, "L29": 0.25, "L30": 1.2, "L31": 1.4, "L32": 0.9,
         "L33": 0.55, "L34": 0.0}
TAIL, BLACK = 2.6, 1.6


def main():
    words = json.load(open(os.path.join(ROOT, "work", "social", "narration", "words.json")))
    t, lines = PREROLL, []
    for lid in sorted(words):
        w = words[lid]
        lines.append({"id": lid, "text": w["text"], "start": round(t, 3), "end": round(t + w["duration"], 3),
                      "source": w["source"],
                      "words": [{"w": x["w"], "start": round(t + x["start"], 3), "end": round(t + x["end"], 3)}
                                for x in w["words"]]})
        t += w["duration"] + PAUSE[lid]
    cut = lines[-1]["end"] + TAIL
    total = cut + BLACK
    tl = {"fps": FPS, "lines": lines, "cut_to_black": round(cut, 3), "duration": round(total, 3),
          "durationInFrames": int(round(total * FPS))}
    json.dump(tl, open(os.path.join(ROOT, "work", "social", "timeline.json"), "w"), indent=1)
    for l in lines:
        print(f"{l['id']} {l['start']:7.2f}-{l['end']:7.2f}  {l['text'][:64]}")
    print(f"cut to black {cut:.2f}s, total {total:.2f}s = {tl['durationInFrames']} frames")


if __name__ == "__main__":
    main()
