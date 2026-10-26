#!/usr/bin/env python3
"""Word-level timing for every narration line (synthetic draft or real recording).

faster-whisper transcribes each line WAV with word timestamps; the recognised
words are matched back onto the exact script words (difflib), and any script
word Whisper missed is interpolated between its matched neighbours.

Usage: align.py <project_root>
Reads work/narration/<ID>.wav, writes work/narration/words.json
"""
import difflib, json, os, re, sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = sys.argv[1]
NUMS = {"25": "twenty five", "100": "hundred", "11": "eleven", "1": "one"}


def pieces(word):
    """Normalised sub-tokens of one written word ('half-smile' -> ['half', 'smile'])."""
    w = word.lower().replace("’", "'")
    w = NUMS.get(re.sub(r"[^0-9]", "", w), w) if re.fullmatch(r"[^a-z]*\d+[^a-z]*", w) else w
    return [p for p in re.split(r"[^a-z0-9']+", w.replace("-", " ")) if p]


def align_line(model, text, wav_path):
    audio, sr = sf.read(wav_path, dtype="float32")
    a16 = resample_poly(audio, 1, sr // 16000).astype(np.float32)
    segs, _ = model.transcribe(a16, language="en", beam_size=5, word_timestamps=True,
                               initial_prompt=text, condition_on_previous_text=False)
    hyp = []  # (token, start, end)
    for s in segs:
        for w in s.words:
            for p in pieces(w.word):
                hyp.append((p, w.start, w.end))
    words = text.split()
    ref, owner = [], []
    for i, w in enumerate(words):
        for p in pieces(w):
            ref.append(p); owner.append(i)
    sm = difflib.SequenceMatcher(a=ref, b=[h[0] for h in hyp], autojunk=False)
    t = [[None, None] for _ in words]
    matched = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                o, (_, st, en) = owner[i1 + k], hyp[j1 + k]
                t[o][0] = st if t[o][0] is None else min(t[o][0], st)
                t[o][1] = en if t[o][1] is None else max(t[o][1], en)
                matched += tag == "equal"
    dur = len(audio) / sr
    # interpolate gaps by character weight between known neighbours
    known = [i for i, (a, b) in enumerate(t) if a is not None]
    if not known:
        known_pts = [(-1, 0.0), (len(words), dur)]
    else:
        known_pts = [(-1, 0.0)] + [(i, None) for i in known] + [(len(words), dur)]
    for i in range(len(words)):
        if t[i][0] is not None:
            continue
        prev = max([k for k in known if k < i], default=None)
        nxt = min([k for k in known if k > i], default=None)
        t0 = t[prev][1] if prev is not None else 0.0
        t1 = t[nxt][0] if nxt is not None else dur
        lo = (prev + 1) if prev is not None else 0
        hi = nxt if nxt is not None else len(words)
        span = words[lo:hi]
        w8 = np.cumsum([0] + [len(x) for x in span]) / max(1, sum(len(x) for x in span))
        k = i - lo
        t[i] = [t0 + (t1 - t0) * w8[k], t0 + (t1 - t0) * w8[k + 1]]
    out = []
    for w, (a, b) in zip(words, t):
        a = float(np.clip(a, 0, dur)); b = float(np.clip(max(b, a + 0.05), 0, dur))
        out.append({"w": w, "start": round(a, 3), "end": round(b, 3)})
    return out, matched / max(1, len(ref)), " ".join(h[0] for h in hyp)


def main():
    from faster_whisper import WhisperModel
    lines = json.load(open(os.path.join(ROOT, "work", "narration", "lines.json")))["lines"]
    model = WhisperModel("small.en", device="cpu", compute_type="int8",
                         download_root=os.path.join(ROOT, "work", "models", "whisper"))
    result = {}
    for line in lines:
        words, score, heard = align_line(model, line["text"],
                                         os.path.join(ROOT, "work", "narration", f"{line['id']}.wav"))
        result[line["id"]] = {"match": round(score, 3), "heard": heard, "words": words}
        flag = "" if score >= 0.9 else "   <-- check"
        print(f"{line['id']} match={score:.0%}{flag}")
    json.dump(result, open(os.path.join(ROOT, "work", "narration", "words.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
