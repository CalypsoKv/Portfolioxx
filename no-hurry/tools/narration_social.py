#!/usr/bin/env python3
"""Narration for the social cut: philosophical cadence, still a DRAFT SYNTHETIC voice.

Cadence is made in the edit, not by slowing the voice down:
  1. each script line is synthesised whole (natural sentence intonation), or taken from a real recording
  2. Whisper finds the word boundaries; at every comma / colon / mid-line full stop a breath gap is opened
     (the clause lands, the next one starts clean)
  3. gravitas: -1.5 semitone pitch with formants preserved, warmer tone, gentle room

Real recordings (assets/voiceover/L01.* or full_take.*) are used instead of the synthetic voice and get the
same breath spacing but no pitch change.

Usage: narration_social.py <project_root>
Writes work/social/narration/<ID>.wav (48 kHz mono) and work/social/narration/words.json
"""
import json, os, re, subprocess, sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = sys.argv[1]
sys.path.insert(0, os.path.dirname(__file__))
sys.argv = [sys.argv[0], ROOT]
import narration as base  # noqa: E402  (reuses voice, phoneme fixes, trimming, real-recording lookup)

SR = 48000
OUT = os.path.join(ROOT, "work", "social", "narration")
SPEED = 0.88
BREATH = {",": 0.22, ";": 0.3, ":": 0.36, ".": 0.42, "?": 0.42, "—": 0.3}
SYNTH_FX = ("rubberband=pitch=0.917:formant=preserved:pitchq=quality,"
            "equalizer=f=160:t=q:w=0.8:g=2,equalizer=f=3200:t=q:w=1.2:g=1.2,highshelf=f=9000:g=-2,"
            "aecho=0.88:0.6:23|37:0.06|0.04")


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


def whisper():
    from faster_whisper import WhisperModel
    return WhisperModel("small.en", device="cpu", compute_type="int8",
                        download_root=os.path.join(ROOT, "work", "models", "whisper"))


def word_times(model, audio, text):
    """Script words with start/end (s), matched from Whisper's word timestamps."""
    import difflib
    a16 = resample_poly(audio.astype(np.float64), 1, 3).astype(np.float32)
    segs, _ = model.transcribe(a16, language="en", beam_size=5, word_timestamps=True, initial_prompt=text,
                               condition_on_previous_text=False)
    heard = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
    words = text.split()
    ref, owner = [], []
    for i, w in enumerate(words):
        for p in re.split(r"[-\s]+", w):
            if norm(p):
                ref.append(norm(p)); owner.append(i)
    t = [[None, None] for _ in words]
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(a=ref, b=[h[0] for h in heard], autojunk=False).get_opcodes():
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                o, (_, s, e) = owner[i1 + k], heard[j1 + k]
                t[o] = [s if t[o][0] is None else min(t[o][0], s), e if t[o][1] is None else max(t[o][1], e)]
    dur = len(audio) / SR
    known = [i for i, (s, _) in enumerate(t) if s is not None]
    for i in range(len(words)):          # interpolate any word Whisper did not return
        if t[i][0] is None:
            p = max((k for k in known if k < i), default=None); n = min((k for k in known if k > i), default=None)
            a = t[p][1] if p is not None else 0.0; b = t[n][0] if n is not None else dur
            span = (n if n is not None else len(words)) - (p + 1 if p is not None else 0)
            k = i - (p + 1 if p is not None else 0)
            t[i] = [a + (b - a) * k / span, a + (b - a) * (k + 1) / span]
    return [{"w": w, "start": round(float(s), 3), "end": round(float(e), 3)} for w, (s, e) in zip(words, t)]


def breathe(audio, words):
    """Open a breath gap after punctuation inside the line; returns new audio and shifted word times."""
    pieces, shift, cursor = [], 0.0, 0
    out_words = []
    fade = int(0.012 * SR)
    for i, w in enumerate(words):
        out_words.append({"w": w["w"], "start": round(w["start"] + shift, 3), "end": round(w["end"] + shift, 3)})
        mark = w["w"][-1] if w["w"][-1] in BREATH else None
        if mark is None or i == len(words) - 1:
            continue
        cut = int(((w["end"] + words[i + 1]["start"]) / 2) * SR)
        seg = audio[cursor:cut].copy()
        seg[-fade:] *= np.linspace(1, 0, fade)
        if cursor:
            seg[:fade] *= np.linspace(0, 1, fade)
        pieces += [seg, np.zeros(int(BREATH[mark] * SR), np.float32)]
        shift += BREATH[mark]
        cursor = cut
    tail = audio[cursor:].copy()
    if cursor:
        tail[:fade] *= np.linspace(0, 1, fade)
    pieces.append(tail)
    return np.concatenate(pieces), out_words


def ffmpeg_fx(audio, chain):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                          "-af", chain, "-f", "f32le", "-ar", str(SR), "-ac", "1", "-"],
                         input=audio.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def main():
    script = json.load(open(os.path.join(ROOT, "edit", "script.json")))
    os.makedirs(OUT, exist_ok=True)
    vo = os.path.join(ROOT, "assets", "voiceover")
    full = next((os.path.join(vo, f"full_take.{e}") for e in base.EXTS if os.path.exists(os.path.join(vo, f"full_take.{e}"))), None)
    from_full = base.split_full_take(full, script) if full else {}
    kokoro, model, result = None, whisper(), {}
    for line in script["lines"]:
        lid, text = line["id"], base.line_text(script, line)
        real = next((os.path.join(vo, f"{lid}.{e}") for e in base.EXTS if os.path.exists(os.path.join(vo, f"{lid}.{e}"))), None)
        if real or lid in from_full:
            audio = base.load_any(real) if real else from_full[lid]
            source, fx = "recorded:" + os.path.basename(real or full), "highpass=f=70"
        else:
            if kokoro is None:
                from kokoro_onnx import Kokoro
                kokoro = Kokoro(os.path.join(ROOT, "work", "models", "kokoro-v1.0.onnx"),
                                os.path.join(ROOT, "work", "models", "voices-v1.0.bin"))
            ph = kokoro.tokenizer.phonemize(text, "en-us")
            for bad, good in base.PHONEME_FIXES.items():
                ph = ph.replace(bad, good)
            speed = min(SPEED, base.LINE_SPEED.get(lid, SPEED))
            a24, sr = kokoro.create(ph, voice=base.VOICE, speed=speed, lang="en-us", is_phonemes=True)
            audio = resample_poly(a24.astype(np.float64), SR // 8000, sr // 8000).astype(np.float32)
            source, fx = f"SYNTHETIC DRAFT (Kokoro-82M {base.VOICE}, speed {speed}, -1.5 st)", SYNTH_FX
        audio = base.trim(audio)
        words = word_times(model, audio, text)
        audio, words = breathe(audio, words)
        audio = base.trim(ffmpeg_fx(audio, fx), thresh_db=-55)
        audio *= 10 ** ((base.TARGET_RMS_DB - base.voiced_rms_db(audio)) / 20)
        audio *= min(1.0, 0.89 / max(1e-9, np.abs(audio).max()))
        words = word_times(model, audio, text)          # re-time on the final audio (fx adds a little latency)
        sf.write(os.path.join(OUT, f"{lid}.wav"), audio, SR, subtype="FLOAT")
        result[lid] = {"text": text, "duration": round(len(audio) / SR, 3), "source": source, "words": words}
        print(f"{lid} {len(audio) / SR:6.2f}s  {source[:40]}")
    json.dump(result, open(os.path.join(OUT, "words.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
