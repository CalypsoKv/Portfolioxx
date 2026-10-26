#!/usr/bin/env python3
"""Sound design, original score and mix for NO HURRY.

Elements (all timing comes from work/timeline.json and edit/manifest.json):
  * hazard relay tick/tock  - SYNTHESISED (no authentic hazard recording exists in the Drive folder)
  * car room tone           - synthesised low noise floor
  * street ambience         - AUTHENTIC, from VID-20261005-WA0000.mp4 (through-the-glass bed + sync under S31)
  * score                   - ORIGINAL: synthesised felt piano + soft pad, written on the tick grid (83.3 BPM)
  * narration               - work/narration/narration_track.wav (synthetic draft or real recording)

Usage: sound.py <project_root>
Writes work/stems/{narration,music,ambience_fx}.wav (loudness-matched, pre-limiter) and work/stems/mix.wav
"""
import json, os, subprocess, sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt, sosfiltfilt, resample_poly

sys.path.insert(0, os.path.dirname(__file__))
from timeline import resolve_any  # noqa: E402

ROOT = sys.argv[1]
SR = 48000
TL = json.load(open(os.path.join(ROOT, "work", "timeline.json")))
MAN = json.load(open(os.path.join(ROOT, "edit", "manifest.json")))
TICK = MAN["tick"]
N = int(TL["duration"] * SR)
CUT = TL["cut_to_black"]
RNG = np.random.default_rng(20261026)
TARGET_LUFS, CEILING_DBTP = -16.0, -1.5
MUSIC_TRIM_DB = -14.0      # score ~11 LU under the voice when ducked; about voice level in the interludes
PAD_DB = -4.0


def at(anchor):
    return resolve_any(TL, TICK, anchor)


def shot_start(shot_id):
    return at(next(s for s in MAN["shots"] if s["id"] == shot_id)["start"])


def db(x):
    return 10 ** (x / 20)


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x, axis=0)


def automation(points, n=N):
    """Piecewise-linear dB automation from [(time, dB), ...] -> linear gain per sample."""
    ts = np.array([p[0] for p in points]) * SR
    vs = np.array([p[1] for p in points], float)
    return db(np.interp(np.arange(n), ts, vs)).astype(np.float32)


def place(buf, sig, t, gain=1.0):
    i = int(round(t * SR))
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig * gain


# ------------------------------------------------------------------ instruments
def hz(name):
    names = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6,
             "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
    note, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + names[note]
    return 440.0 * 2 ** ((midi - 69) / 12), midi


def piano(note, dur, vel):
    """Felt piano: inharmonic partials, two-stage decay, 3 detuned strings, soft hammer, damper."""
    f, midi = hz(note)
    T = dur + 2.2
    t = np.arange(int(T * SR)) / SR
    B = 0.00018 * (f / 220) ** 1.2
    bright = 0.3 + 0.7 * vel
    y = np.zeros_like(t)
    for k in range(1, 15):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 9000:
            break
        amp = k ** -1.1 * np.exp(-(k - 1) / (1.6 + 4.5 * bright))
        tau_fast = 0.22 + 0.8 * (220 / f) ** 0.4 / k ** 0.35
        tau_slow = 2.6 * (220 / f) ** 0.5 / (1 + 0.2 * (k - 1)) + 0.35
        env = 0.55 * np.exp(-t / tau_fast) + 0.45 * np.exp(-t / tau_slow)
        for det in (-0.7, 0.0, 0.8):
            y += amp / 3 * env * np.sin(2 * np.pi * fk * 2 ** (det / 1200) * t + RNG.uniform(0, 6.283))
    y *= 1 - np.exp(-t / 0.004)                                    # felt hammer: soft onset
    y *= np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.2))           # damper
    thump = filt(RNG.standard_normal(len(t)) * np.exp(-t / 0.01), "lowpass", 650) * 0.05
    y = (y + thump) * vel ** 1.4
    y = filt(y, "lowpass", 2600 + 3400 * vel)
    pan = float(np.clip((midi - 62) / 40, -0.35, 0.35))
    return np.stack([y * np.sqrt(0.5 - pan / 2), y * np.sqrt(0.5 + pan / 2)], axis=1).astype(np.float32)


def pad(notes, dur, attack=2.0, release=3.0):
    T = dur + release
    t = np.arange(int(T * SR)) / SR
    out = np.zeros((len(t), 2))
    for name in notes:
        f, _ = hz(name)
        for ch, det in ((0, -5.0), (1, 5.0)):
            ff = f * 2 ** (det / 1200)
            ph = RNG.uniform(0, 6.283)
            w = 2 * np.pi * ff * t + ph
            out[:, ch] += np.sin(w) + np.sin(3 * w) / 9 + np.sin(5 * w) / 25
    env = np.ones_like(t)
    a = int(attack * SR)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    r0 = int(dur * SR)
    env[r0:] = np.cos(np.linspace(0, np.pi / 2, len(t) - r0)) ** 2
    lfo = 1 + 0.06 * np.sin(2 * np.pi * 0.09 * t + RNG.uniform(0, 6.283))
    out = filt(out, "lowpass", 1400) * (env * lfo)[:, None] / (len(notes) * 1.4) * db(PAD_DB)
    return out.astype(np.float32)


def relay_click(tock):
    """Hazard relay: tiny broadband snap + damped plastic/metal modes, muffled behind the dash."""
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    modes = [(1480, 0.008, 0.9), (2900, 0.0045, 0.45), (820, 0.012, 0.5)] if tock else \
            [(1850, 0.007, 1.0), (3650, 0.004, 0.5), (980, 0.010, 0.45)]
    y = 0.35 * filt(RNG.standard_normal(n) * np.exp(-t / 0.0012), "highpass", 900)
    for f, tau, a in modes:
        y += a * np.exp(-t / tau) * np.sin(2 * np.pi * f * (1 + RNG.uniform(-0.01, 0.01)) * t)
    y += 0.4 * np.exp(-t / 0.012) * np.sin(2 * np.pi * 170 * t)
    y = filt(y, "lowpass", 5200) * (0.8 if tock else 1.0)
    y /= np.abs(y).max()
    return y.astype(np.float32)


def reverb_ir(rt60=2.6, length=3.2):
    n = int(length * SR)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for ch in range(2):
        noise = RNG.standard_normal(n)
        lo = filt(noise, "lowpass", 2500) * 10 ** (-3 * t / rt60)
        hi = filt(noise, "highpass", 2500) * 10 ** (-3 * t / (rt60 * 0.45))
        ir[:, ch] = lo + 0.5 * hi
        for d, g in ((0.011, 0.5), (0.019, 0.35), (0.027, 0.3), (0.041, 0.22)):
            ir[int((d + RNG.uniform(0, 0.004)) * SR), ch] += g
    ir[: int(0.016 * SR)] = 0  # pre-delay
    return (ir / np.sqrt((ir ** 2).sum(axis=0))).astype(np.float32)


# ------------------------------------------------------------------ source audio
def decode(path, rate=SR, tempo=None):
    af = f"atempo={tempo}" if tempo else "anull"
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-vn", "-af", af, "-ac", "2", "-ar",
                                   str(rate), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def ambience_bed(src, dur, regions):
    """Long bed stitched from random slices of the authentic clip (equal-power crossfades)."""
    out = np.zeros((int(dur * SR) + SR, 2), np.float32)
    xf = int(0.6 * SR)
    pos = 0
    while pos < len(out) - xf:
        a, b = regions[RNG.integers(len(regions))]
        L = RNG.uniform(2.0, 3.4)
        s0 = RNG.uniform(a, max(a, b - L))
        seg = src[int(s0 * SR): int((s0 + L) * SR)].copy()
        fade = np.sin(np.linspace(0, np.pi / 2, xf))[:, None] ** 1
        seg[:xf] *= fade
        seg[-xf:] *= fade[::-1]
        out[pos:pos + len(seg)] += seg[: len(out) - pos]
        pos += len(seg) - xf
    return out[: int(dur * SR)]


# ------------------------------------------------------------------ score
def compose():
    music = np.zeros((N + 6 * SR, 2), np.float32)
    P = lambda note, t, dur=1.4, vel=0.3: place(music, piano(note, dur, vel), t)  # noqa: E731
    Q = lambda notes, t, dur, g=1.0, att=2.0, rel=3.0: place(music, pad(notes, dur, att, rel), t, g)  # noqa: E731
    beat = TICK["period"]

    # Act I: no music until "Her."
    her = at("L03:Her")
    Q(["D3", "A3", "F#4", "E5"], her - 0.25, 6.0, 0.9, att=1.4, rel=3.2)
    P("D5", her + 0.02, 2.5, 0.34); P("A4", her + 0.04, 2.5, 0.22)
    P("F#5", at("L03:Her+5.6"), 2.0, 0.18)

    # Act II: Zeno's division - sparse piano, the halves, a converging flourish
    a2 = at("L04-0.4")
    Q(["B2", "F#3", "D4", "A4"], a2, at("L09.end") - a2, 0.7, att=3.0, rel=3.5)
    for i, n in enumerate(["F#4", "A4", "E4", "D4"]):
        P(n, at(f"beat:L04~{i * 2}"), 1.4, 0.2)
    for k, anchor in enumerate(["L05:half", "L06:half", "L07:half"]):
        P("A5", at(anchor), 1.0, 0.30 - 0.05 * k)
        P("D5", at(anchor) + 0.01, 1.0, 0.16 - 0.03 * k)
    t, gap, v = at("L08:out.end") + 0.15, beat / 2, 0.24
    while gap > 0.02:
        P("A5", t, 0.4, v)
        t += gap; gap /= 2; v *= 0.72
    Q(["G2", "D3", "B3", "F#4"], at("L10-0.3"), at("L11.end+1.6") - at("L10-0.3"), 0.6, att=2.5, rel=2.5)
    P("B4", at("L10:motion"), 1.6, 0.2); P("D5", at("L11:waiting"), 2.6, 0.24)
    # the evidence: almost nothing, one low note per noun, then only the ticking
    Q(["D2", "A2"], at("L12-0.2"), at("L16") - at("L12-0.2"), 0.45, att=1.5, rel=1.5)
    P("D3", at("L13:gate"), 1.0, 0.3); P("A2", at("L14:street"), 1.0, 0.28); P("F#3", at("L15:tarmac"), 1.2, 0.26)
    Q(["B2", "F#3", "D4", "A4"], at("L17-0.2"), at("L18.end+2.0") - at("L17-0.2"), 0.55, att=2.5, rel=2.0)
    for i, n in enumerate(["B4", "A4", "F#4", "E4", "D4"]):     # one note per flicker cut
        P(n, at(f"beat:L18~{i}"), 0.7, 0.26)

    # Act III: the infinite in-between - lyrical broken chords, the series resolves to the tonic
    a3 = shot_start("S26")
    prog = [["D3", "A3", "D4", "F#4"], ["B2", "F#3", "B3", "D4"], ["G2", "D3", "G3", "B3"], ["A2", "E3", "A3", "C#4"]]
    t = at(f"beat:@{a3:.3f}")
    end3 = at("L20:half#2") - 0.2
    i = 0
    while t < end3:
        ch = prog[(i // 4) % 4]
        P(ch[[0, 2, 1, 3][i % 4]], t, beat * 1.6, 0.2 if i % 4 else 0.26)
        t += beat; i += 1
    Q(["D3", "A3", "F#4"], a3, at("L20:exactly") - a3, 0.5, att=2.5, rel=1.0)
    P("A4", at("L20:half#2"), 0.8, 0.3); P("F#4", at("L20:quarter"), 0.8, 0.28); P("E4", at("L20:eighth"), 0.8, 0.26)
    one = at("L20:one")
    for n, v in (("D3", 0.4), ("A3", 0.34), ("D4", 0.36), ("F#4", 0.32), ("A4", 0.26)):
        P(n, one, 3.2, v)
    Q(["D3", "A3", "D4", "F#4"], one - 0.1, 6.0, 0.6, att=0.8, rel=4.0)
    walk = shot_start("S31")
    Q(["G2", "D3", "B3", "D4"], walk + 4.0, 7.0, 0.5, att=3.0, rel=3.0)
    for k, n in enumerate(["B4", "D5", "A4", "G4"]):
        P(n, at(f"beat:@{walk + 1.0:.3f}~{k * 4}"), 2.2, 0.18)
    a3b = shot_start("S32")
    Q(["G2", "D3", "B3", "F#4"], a3b - 0.3, shot_start("S34") - a3b, 0.6, att=2.0, rel=3.0)
    for k, n in enumerate(["F#5", "E5", "D5", "A4", "B4", "A4"]):
        P(n, at(f"beat:@{a3b + 0.4:.3f}~{k * 3}"), 2.0, 0.2)

    # Act IV: a hundred different women - ostinato on the tick, building through the montage
    a4 = shot_start("S34")
    mont = shot_start("M01")
    peak0, peak1 = shot_start("M04"), shot_start("M10")
    a4_end = shot_start("S39") + 1.0
    chords = [["D", "A", "F#"], ["B", "F#", "D"], ["G", "D", "B"], ["A", "E", "C#"]]  # root, fifth, third
    pattern = [(0, 4), (1, 4), (2, 4), (1, 4), (0, 5), (1, 4), (2, 4), (1, 4)]           # (tone, octave)
    t = at(f"beat:@{a4:.3f}")
    j = 0
    while t < a4_end:
        bar = (j // 8) % 4
        c = chords[bar]
        if t < mont:
            vel = 0.12 + 0.06 * (t - a4) / (mont - a4)
        elif t < peak1:
            vel = 0.2 + 0.08 * min(1, max(0, (t - peak0) / 3))
        else:
            vel = max(0.05, 0.24 - 0.2 * (t - peak1) / (a4_end - peak1))
        tone, octave = pattern[j % 8]
        P(f"{c[tone]}{octave}", t, beat * 0.9, vel)
        if j % 8 == 0:
            P(f"{c[0]}2", t, beat * 7, vel + 0.06)
            Q([f"{c[0]}3", f"{c[1]}3", f"{c[2]}4"], t, beat * 8, 0.55 if t >= mont else 0.4, att=1.2, rel=2.0)
        t += beat / 2; j += 1
    # soft pulse under the montage only (felt thump + brush), no claim to be festival audio
    t = at(f"beat:@{peak0:.3f}")
    while t < peak1 - 0.05:
        n = int(0.25 * SR); tt = np.arange(n) / SR
        thump = np.sin(2 * np.pi * (52 + 30 * np.exp(-tt / 0.03)) * tt) * np.exp(-tt / 0.13) * 0.16
        place(music, np.stack([thump, thump], 1).astype(np.float32), t)
        b = filt(RNG.standard_normal(int(0.06 * SR)), "highpass", 5000) * np.hanning(int(0.06 * SR)) * 0.03
        place(music, np.stack([b * 0.8, b], 1).astype(np.float32), t + beat / 2)
        t += beat

    # Act V: the practical proof - music thins, then leaves after "Love is not the proof."
    a5 = shot_start("S39")
    Q(["D3", "A3", "E4", "F#4"], a5 - 0.5, at("L31.end+1.4") - a5, 0.55, att=2.0, rel=3.5)
    P("F#4", at("L31:proof"), 3.0, 0.16)
    return music[:N]


def main():
    os.makedirs(os.path.join(ROOT, "work", "stems"), exist_ok=True)
    nar_m, _ = sf.read(os.path.join(ROOT, "work", "narration", "narration_track.wav"), dtype="float32")
    nar_m = compress(deess(filt(nar_m[:N], "highpass", 75)))
    nar = np.stack([nar_m, nar_m], 1).astype(np.float32)

    # ---- music + reverb
    music = compose()
    ir = reverb_ir()
    wet = np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1)
    music = (music * 0.82 + wet * 0.34).astype(np.float32) * db(MUSIC_TRIM_DB)

    # ---- hazard tick (synthetic), one click on, one off, per cycle
    tick = np.zeros((N, 2), np.float32)
    on, off = relay_click(False), relay_click(True)
    t = TICK["start"]
    while t < CUT - 0.005:
        g = db(RNG.uniform(-0.8, 0.8))
        place(tick, np.stack([on * 0.95, on], 1), t + RNG.uniform(-0.002, 0.002), g)
        if t + TICK["period"] / 2 < CUT - 0.005:
            place(tick, np.stack([off, off * 0.92], 1), t + TICK["period"] / 2 + RNG.uniform(-0.002, 0.002), g)
        t += TICK["period"]
    walk0, walk1 = shot_start("S31"), shot_start("S32")
    tick *= automation([
        (0, -70), (TICK["start"], -46), (3.2, -31), (at("L16-0.3"), -31), (at("L16"), -21), (at("L17-0.5"), -21),
        (at("L17+0.3"), -31), (at("beat:L18") - 0.1, -31), (at("beat:L18"), -26), (shot_start("S26"), -27),
        (shot_start("S26") + 1.5, -33), (walk0 - 0.3, -33), (walk0 + 0.8, -60), (walk1 - 0.5, -60), (walk1 + 0.4, -34),
        (shot_start("M01"), -36), (shot_start("S39"), -33), (at("L32:putting"), -33), (at("L32:hazards"), -24),
        (at("L33-1.0"), -24), (at("L33"), -21), (CUT - 0.01, -21), (CUT, -90), (TL["duration"], -90)])[:, None]

    # ---- authentic street ambience from VID-20261005-WA0000.mp4
    vid = os.path.join(ROOT, "assets", "videos", "VID-20261005-WA0000.mp4")
    street = filt(decode(vid), "highpass", 110)
    bed = ambience_bed(street, TL["duration"], [(0.3, 6.4)])  # avoids the horn (6.6-7.5 s) and the voices
    glass = filt(bed, "lowpass", 950)
    open_ = filt(bed, "lowpass", 4200)
    amb = glass * automation([
        (0, -80), (0.8, -60), (4.0, -35), (at("L03:Her") + 4.4, -35), (at("L03:Her") + 5.2, -80),
        (shot_start("S05") - 0.3, -80), (shot_start("S05") + 1.2, -37), (shot_start("S26"), -38),
        (walk0, -42), (walk0 + 0.4, -80), (walk1, -80), (walk1 + 0.8, -40), (shot_start("M01"), -46),
        (shot_start("S39") - 0.5, -46), (shot_start("S39") + 1.5, -37), (at("L33"), -40), (CUT - 0.01, -41),
        (CUT, -90), (TL["duration"], -90)])[:, None]
    s16 = shot_start("S16")
    amb += open_ * automation([(0, -90), (s16 - 0.25, -90), (s16, -30), (shot_start("S17") + 0.2, -30),
                               (shot_start("S17") + 0.9, -90), (TL["duration"], -90)])[:, None]
    # sync sound under the walk (picture runs at 0.8x, so the audio is time-stretched to match, pitch kept)
    s31 = next(s for s in MAN["shots"] if s["id"] == "S31")
    sync = filt(decode(vid, tempo=s31["speed"]), "highpass", 110)
    seg = sync[: int((walk1 - walk0 + 0.6) * SR)].copy()
    fl = int(0.35 * SR)
    seg[:fl] *= np.linspace(0, 1, fl)[:, None]; seg[-fl:] *= np.linspace(1, 0, fl)[:, None]
    place(amb, seg, walk0 - 0.1, db(-12))

    # ---- room tone in the car
    room = filt(np.cumsum(RNG.standard_normal((N, 2)), axis=0) * 0.002, "highpass", 25)
    room = filt(room, "lowpass", 280)
    room = room / np.sqrt((room ** 2).mean()) * db(-56)
    room *= automation([(0, -90), (2.0, -90), (4.0, 0), (walk0, 0), (walk0 + 0.5, -90), (walk1, -90),
                        (walk1 + 0.5, 0), (CUT - 0.01, 0), (CUT, -90), (TL["duration"], -90)])[:, None]

    # ---- ducking under the narration
    env = np.sqrt(np.convolve(nar_m ** 2, np.ones(int(0.05 * SR)) / int(0.05 * SR), mode="same"))
    active = (env > db(-40)).astype(np.float32)
    att, rel = 1 - np.exp(-1 / (0.08 * SR)), 1 - np.exp(-1 / (0.55 * SR))
    sm = np.zeros_like(active)
    acc = 0.0
    for i in range(0, N, 64):                       # block-wise smoothing (fast enough, 1.3 ms blocks)
        target = active[i:i + 64].max()
        k = att if target > acc else rel
        acc += (target - acc) * (1 - (1 - k) ** 64)
        sm[i:i + 64] = acc
    music *= db(-12 * sm)[:, None]
    amb_duck = db(-6 * sm)[:, None]
    fx = (amb * amb_duck + tick * db(-2 * sm)[:, None] + room).astype(np.float32)

    # ---- loudness: one gain for everything, then a true-peak-safe limiter on the sum
    import pyloudnorm as pyln
    mix = nar + music + fx
    meter = pyln.Meter(SR)
    lufs = meter.integrated_loudness(mix.astype(np.float64))
    gain = db(TARGET_LUFS - lufs)
    nar, music, fx, mix = nar * gain, music * gain, fx * gain, mix * gain
    mix = limit(mix, db(CEILING_DBTP))
    for name, x in (("narration", nar), ("music", music), ("ambience_fx", fx), ("mix", mix)):
        sf.write(os.path.join(ROOT, "work", "stems", f"{name}.wav"), x.astype(np.float32), SR, subtype="FLOAT")
    print(f"pre-gain loudness {lufs:.1f} LUFS, gain {20 * np.log10(gain):+.1f} dB")


def deess(x, split=3600.0, max_cut_db=8.0):
    """Split-band de-esser: when the >3.6 kHz band dominates (sibilants), turn that band down."""
    hi = sosfiltfilt(butter(4, split, btype="highpass", fs=SR, output="sos"), x)  # zero-phase: lo + hi == x
    lo = x - hi
    win = int(0.004 * SR)
    eh = np.sqrt(np.convolve(hi.astype(np.float64) ** 2, np.ones(win) / win, mode="same") + 1e-12)
    ef = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(win) / win, mode="same") + 1e-12)
    ratio_db = 20 * np.log10(eh / ef)                      # 0 dB = band carries everything
    cut = np.clip((ratio_db + 7.0) * 1.4, 0, max_cut_db)    # starts when the band is within 7 dB of the total
    cut = np.convolve(cut, np.hanning(int(0.006 * SR)) / np.hanning(int(0.006 * SR)).sum(), mode="same")
    return (lo + hi * db(-cut)).astype(np.float32)


def compress(x, thresh_db=-26.0, ratio=3.0, knee=6.0, attack=0.005, release=0.12):
    """Gentle voice-over compressor (feed-forward, soft knee) on a mono signal."""
    win = int(0.01 * SR)
    env = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(win) / win, mode="same") + 1e-12)
    lvl = 20 * np.log10(env)
    over = lvl - thresh_db
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio),
                           (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))
    a, r = np.exp(-64 / (attack * SR)), np.exp(-64 / (release * SR))
    out, acc = [], 0.0
    for v in gr[::64].tolist():
        acc = v + (acc - v) * (a if v > acc else r)
        out.append(acc)
    g = np.repeat(np.asarray(out), 64)[: len(x)]
    return (x * db(-g)).astype(np.float32)


def limit(x, ceiling, look=0.004, release=0.08):
    """Look-ahead peak limiter evaluated on a 4x oversampled copy (approximates true peak)."""
    up = resample_poly(x, 4, 1, axis=0)
    peak = np.abs(up).max(axis=1).reshape(-1, 4).max(axis=1)[: len(x)]
    need = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    la = int(look * SR)
    from scipy.ndimage import minimum_filter1d
    need = minimum_filter1d(need, size=2 * la + 1, origin=0)
    r = 1 - np.exp(-1 / (release * SR))
    g, acc = [], 1.0
    for v in need.tolist():                      # instant attack (look-ahead already applied), smooth release
        acc = v if v < acc else acc + (v - acc) * r
        g.append(acc)
    return x * np.asarray(g, np.float32)[:, None]


if __name__ == "__main__":
    main()
