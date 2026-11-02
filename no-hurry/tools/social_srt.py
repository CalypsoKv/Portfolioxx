#!/usr/bin/env python3
"""Caption file for the social cut (for platforms that take an .srt, e.g. YouTube Shorts; the film itself carries
the words as kinetic type). Cues follow the narration's word timings on the social timeline.

Usage: social_srt.py <project_root>        writes output/no_hurry_social_captions.srt
"""
import os, sys

sys.path.insert(0, os.path.dirname(__file__))
from social_common import Social  # noqa: E402

MAX_CHARS = 40
WEAK = {"a", "an", "the", "of", "to", "in", "and", "at", "on", "by", "what", "that", "is", "with", "into", "for", "who",
        "she", "he", "we", "they", "you", "can", "be", "when", "while", "if", "as", "than", "so"}
PARTICLE = {"on", "up", "out", "off"}


def ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def split_line(words):
    """Balanced cues for one line: dynamic programming over break points; breaks after punctuation are cheap,
    a break that strands one or two words is expensive."""
    n = len(words)
    best = [0.0] + [float("inf")] * n
    back = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(j - 1, -1, -1):
            text = " ".join(w["w"] for w in words[i:j])
            if len(text) > MAX_CHARS:
                break
            c = (MAX_CHARS - len(text)) ** 2 / 10
            if j < n and words[j - 1]["w"][-1] not in ".?!:;,":
                c += 160
            if n > 2 and j - i <= 2 and len(text) < 14:
                c += 220
            if j - i > 3:                                               # a clause should end its cue, not run on
                c += 120 * sum(1 for w in words[i:j - 1] if w["w"][-1] in ".?!:;,")
            last = words[j - 1]["w"]
            if j < n and last[-1] not in ".?!:;," and last.lower() in WEAK:   # never end a cue on "the", "of", "she"
                c += 140
            if i > 0 and words[i]["w"].lower().strip(",.") in PARTICLE:        # nor start one on a stranded particle
                c += 100
            if best[i] + c < best[j]:
                best[j], back[j] = best[i] + c, i
    out, j = [], n
    while j > 0:
        out.append(words[back[j]:j]); j = back[j]
    return out[::-1]


def cues(lines):
    return [c for l in lines for c in split_line(l["words"])]


def main():
    S = Social(sys.argv[1])
    cs = cues(S.tl["lines"])
    rows = []
    for i, c in enumerate(cs):
        start = c[0]["start"]
        end = c[-1]["end"] + 0.25
        if i + 1 < len(cs):
            end = min(end, cs[i + 1][0]["start"] - 0.04)
        rows.append(f"{i + 1}\n{ts(start)} --> {ts(max(end, start + 0.6))}\n{' '.join(w['w'] for w in c)}\n")
    out = os.path.join(sys.argv[1], "output", "no_hurry_social_captions.srt")
    open(out, "w").write("\n".join(rows))
    print(f"{len(rows)} cues -> {out}")


if __name__ == "__main__":
    main()
