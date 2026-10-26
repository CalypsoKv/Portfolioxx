#!/usr/bin/env python3
"""Narration, one WAV per script line: the real recording when there is one, else a DRAFT SYNTHETIC voice.

The synthetic voice (Kokoro-82M, local CPU) is a placeholder used only to time the edit;
it is not the filmmaker's voice. Real recordings always win, in this order:
  1. assets/voiceover/<LINE_ID>.<ext>            one file per line (L01 ... L34)
  2. assets/voiceover/full_take.<ext>            the whole script in one take: it is transcribed,
                                                 matched to the script and cut into lines automatically
  (ext: wav, m4a, mp3, flac, aif, aiff - anything ffmpeg reads; a phone voice memo is fine)

Usage: narration.py <project_root>
Writes work/narration/<LINE_ID>.wav (48 kHz mono float) and work/narration/lines.json
"""
import json, os, subprocess, sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = sys.argv[1]
SR = 48000
VOICE = "am_michael"
DEFAULT_SPEED = 0.88
LINE_SPEED = {"L03": 0.80, "L13": 0.84, "L14": 0.84, "L15": 0.85, "L16": 0.85,
              "L31": 0.82, "L33": 0.78, "L34": 0.76}
# espeak-ng gets these wrong; replace its phonemes with the intended pronunciation.
PHONEME_FIXES = {
    "dʒˈæhæn": "dʒəhˈɑːn",            # Jahan  -> juh-HAAN
    "hˈɛɹɐklˌɪɾəs": "hˌɛɹəklˈaɪɾəs",  # Heraclitus -> heh-ruh-KLY-tus
    "dɪˈoʊdʒiːnz": "daɪˈɑːdʒəniːz",    # Diogenes -> dye-OJ-in-eez
}
TARGET_RMS_DB = -21.0


def line_text(script, line):
    return line["text"].replace("{name}", script["narrator_name"])


def load_any(path):
    """Decode any audio file to 48 kHz mono float via ffmpeg."""
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR),
                                   "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()


def trim(x, thresh_db=-50.0, pad=0.04):
    win = int(0.01 * SR)
    env = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode="same") + 1e-12)
    idx = np.where(20 * np.log10(env) > thresh_db)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * SR)); b = min(len(x), idx[-1] + int(pad * SR))
    y = x[a:b].copy()
    f = int(0.008 * SR)
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y


def voiced_rms_db(x):
    win = int(0.03 * SR)
    frames = x[: len(x) // win * win].reshape(-1, win)
    rms = np.sqrt((frames ** 2).mean(axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    voiced = rms[db > db.max() - 30]
    return 20 * np.log10(np.sqrt((voiced ** 2).mean()))


EXTS = ("wav", "flac", "m4a", "mp3", "aif", "aiff")


def split_full_take(path, script):
    """Cut one continuous recording into script lines using Whisper word timestamps."""
    import difflib, re
    from faster_whisper import WhisperModel
    norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))  # noqa: E731
    audio = load_any(path)
    a16 = resample_poly(audio.astype(np.float64), 1, 3).astype(np.float32)
    model = WhisperModel("small.en", device="cpu", compute_type="int8",
                         download_root=os.path.join(ROOT, "work", "models", "whisper"))
    segs, _ = model.transcribe(a16, language="en", beam_size=5, word_timestamps=True, vad_filter=True,
                               initial_prompt=" ".join(line_text(script, l) for l in script["lines"])[:900])
    heard = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
    ref, owner = [], []
    for li, line in enumerate(script["lines"]):
        for w in line_text(script, line).split():
            if norm(w):
                ref.append(norm(w)); owner.append(li)
    spans = {}
    sm = difflib.SequenceMatcher(a=ref, b=[h[0] for h in heard], autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                li, (_, st, en) = owner[i1 + k], heard[j1 + k]
                a, b = spans.get(li, (st, en))
                spans[li] = (min(a, st), max(b, en))
    # energy envelope (10 ms hop) to snap every cut to real silence
    hop = int(0.01 * SR)
    env = np.sqrt(np.convolve(audio.astype(np.float64) ** 2, np.ones(3 * hop) / (3 * hop), mode="same")[::hop] + 1e-12)
    env_db = 20 * np.log10(env)
    floor = np.percentile(env_db, 10)
    quiet = env_db < max(floor + 10, env_db.max() - 45)

    def snap(t, direction, limit=0.6):
        i = int(t / 0.01)
        for k in range(int(limit / 0.01)):
            j = i + direction * k
            if j <= 0 or j >= len(quiet) - 1:
                return max(0.0, min(len(audio) / SR, j * 0.01))
            if quiet[j]:
                return j * 0.01
        return t + direction * limit

    spans = {li: (snap(a, -1), snap(b, +1)) for li, (a, b) in spans.items()}
    for li in range(len(script["lines"])):    # lines Whisper missed (e.g. a one-word line): the voiced run between neighbours
        if li in spans:
            continue
        prev = max((k for k in spans if k < li), default=None)
        nxt = min((k for k in spans if k > li), default=None)
        lo = spans[prev][1] + 0.05 if prev is not None else 0.0
        hi = spans[nxt][0] - 0.05 if nxt is not None else len(audio) / SR
        runs, cur = [], None
        for i in range(int(lo / 0.01), min(len(quiet), int(hi / 0.01))):
            if not quiet[i]:
                cur = [i, i] if cur is None or i - cur[1] > 12 else [cur[0], i]
                if not runs or runs[-1][0] != cur[0]:
                    runs.append(cur)
                else:
                    runs[-1] = cur
        if runs:
            a, b = max(runs, key=lambda r: r[1] - r[0])
            spans[li] = (a * 0.01, b * 0.01)
    cuts = {}
    for li, line in enumerate(script["lines"]):
        if li not in spans:
            print(f"  {line['id']}: not found in the full take -> synthetic draft for this line")
            continue
        a, b = spans[li]
        cuts[line["id"]] = audio[int(max(0, a - 0.05) * SR): int((b + 0.08) * SR)]
    return cuts


def main():
    script = json.load(open(os.path.join(ROOT, "edit", "script.json")))
    out_dir = os.path.join(ROOT, "work", "narration")
    os.makedirs(out_dir, exist_ok=True)
    kokoro = None
    report = []
    vo = os.path.join(ROOT, "assets", "voiceover")
    full = next((os.path.join(vo, f"full_take.{e}") for e in EXTS if os.path.exists(os.path.join(vo, f"full_take.{e}"))), None)
    from_full = split_full_take(full, script) if full else {}
    for line in script["lines"]:
        lid, text = line["id"], line_text(script, line)
        real = next((os.path.join(vo, f"{lid}.{e}") for e in EXTS if os.path.exists(os.path.join(vo, f"{lid}.{e}"))), None)
        if real:
            audio, source = load_any(real), "recorded:" + os.path.basename(real)
        elif lid in from_full:
            audio, source = from_full[lid], "recorded:" + os.path.basename(full)
        else:
            if kokoro is None:
                from kokoro_onnx import Kokoro
                kokoro = Kokoro(os.path.join(ROOT, "work", "models", "kokoro-v1.0.onnx"),
                                os.path.join(ROOT, "work", "models", "voices-v1.0.bin"))
            ph = kokoro.tokenizer.phonemize(text, "en-us")
            for bad, good in PHONEME_FIXES.items():
                ph = ph.replace(bad, good)
            a24, sr = kokoro.create(ph, voice=VOICE, speed=LINE_SPEED.get(lid, DEFAULT_SPEED),
                                    lang="en-us", is_phonemes=True)
            audio = resample_poly(a24.astype(np.float64), SR // 8000, sr // 8000).astype(np.float32)
            source = f"SYNTHETIC DRAFT (Kokoro-82M {VOICE}, speed {LINE_SPEED.get(lid, DEFAULT_SPEED)})"
        audio = trim(audio)
        audio *= 10 ** ((TARGET_RMS_DB - voiced_rms_db(audio)) / 20)
        peak = np.abs(audio).max()
        if peak > 0.89:
            audio *= 0.89 / peak
        sf.write(os.path.join(out_dir, f"{lid}.wav"), audio, SR, subtype="FLOAT")
        report.append({"id": lid, "text": text, "duration": round(len(audio) / SR, 3), "source": source})
        print(f"{lid} {len(audio) / SR:6.2f}s  {source}")
    json.dump({"sample_rate": SR, "voice": VOICE, "lines": report},
              open(os.path.join(out_dir, "lines.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
