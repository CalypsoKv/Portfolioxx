#!/usr/bin/env python3
"""Sound for the social cut: everything is ORIGINAL (synthesised here) except the authentic street ambience.

  score      felt piano, pad, sub and soft drums written on the 0.72 s hazard grid (83.3 BPM), D minor / F major.
             Section energy follows the storyboard; the music leaves at "Love is not the proof." and only one
             chord returns on "No hurry.". Ducking under the voice is baked in (side-chain from the VO lines).
  tick       the hazard relay, tick (on) / tock (off) every 0.72 s, level-automated, stops at the cut to black.
  sfx        whooshes, impacts, pops, glitch, stutter, swell, shutter, flicker, risers - one file each.
  ambience   authentic street sound from VID-20261005-WA0000.mp4, used under the real walk.
  vo         work/social/narration/<ID>.wav polished (zero-phase de-esser, gentle compression).

Levels are set with headroom (voice ~ -21 LUFS short-term); the final master (-14 LUFS, -1 dBTP) happens after
the Remotion render (tools/master_social.py), so stems can be moved and re-balanced in Studio.

Usage: sound_social.py <project_root>        writes studio/public/audio/{vo,sfx}/*.wav, score.wav, tick.wav, amb_walk.wav
"""
import json, os, sys

import numpy as np
import pyloudnorm
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = sys.argv[1]
sys.path.insert(0, os.path.dirname(__file__))
_argv, sys.argv = sys.argv, [sys.argv[0], ROOT]
import sound as base  # noqa: E402  (Phase 1 instruments + dynamics: piano, pad, relay_click, reverb_ir, deess, compress)
sys.argv = _argv
from social_common import Social, TICK_PERIOD, TICK_START  # noqa: E402

SR = base.SR
S = Social(ROOT)
DUR = S.tl["duration"]
CUT = S.tl["cut_to_black"]
N = int(round(DUR * SR))
OUT = os.path.join(ROOT, "studio", "public", "audio")
RNG = np.random.default_rng(20261102)
METER = pyloudnorm.Meter(SR)
BEAT = TICK_PERIOD
HEADROOM_DB = -5.0          # every stem sits 5 dB under its final level; the master pass restores it


def db(x):
    return 10 ** (x / 20)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "lowpass", fs=SR, output="sos"), x, axis=0)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "highpass", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x, axis=0)


def stereo(x, pan=0.0):
    return np.stack([x * np.sqrt(0.5 - pan / 2), x * np.sqrt(0.5 + pan / 2)], 1).astype(np.float32)


def place(buf, sig, t, gain=1.0):
    i = int(round(t * SR))
    if i < 0:
        sig, i = sig[-i:], 0
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig * gain


def svf_sweep(x, f_curve, q=1.2):
    """Time-varying state-variable band-pass (Chamberlin), f_curve in Hz per sample."""
    y = np.zeros_like(x)
    low = band = 0.0
    damp = 1 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(f_curve[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        y[i] = band
    return y


def write(path, x, peak_db=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    x = np.asarray(x, np.float32)
    if peak_db is not None:
        x = x / max(1e-9, np.abs(x).max()) * db(peak_db)
    sf.write(path, x, SR, subtype="FLOAT")
    return x


# ------------------------------------------------------------------ sfx library
def whoosh(length=0.6, peak=0.22, pan=(-0.7, 0.7), lo=280, hi=2600):
    n = int(length * SR)
    t = np.arange(n) / SR
    env = np.where(t < peak, (t / peak) ** 2.2, np.exp(-(t - peak) / (0.28 * (length - peak))))
    noise = RNG.standard_normal(n)
    fc = lo + (hi - lo) * env
    body = svf_sweep(noise, fc, q=1.6) * env
    air = hp(noise, 4000) * env ** 1.5 * 0.25
    x = body + air
    p = np.interp(t, [0, length], pan)
    return np.stack([x * np.sqrt(0.5 - p / 2), x * np.sqrt(0.5 + p / 2)], 1)


def whoosh_rev(length=0.32):
    n = int(length * SR)
    t = np.arange(n) / SR
    env = (t / length) ** 3
    noise = RNG.standard_normal(n)
    x = svf_sweep(noise, 400 + 4200 * env, q=1.3) * env + hp(noise, 5000) * env ** 2 * 0.3
    x[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR))
    return stereo(x)


def boom(f0, f1, decay, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.06)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / decay) * (1 - np.exp(-t / 0.002))


def impact(low=False):
    length = 2.6 if low else 2.0
    n = int(length * SR)
    t = np.arange(n) / SR
    sub = boom(70 if low else 95, 31 if low else 42, 0.9 if low else 0.5, length)
    trans = lp(RNG.standard_normal(n) * np.exp(-t / 0.012), 2800 if not low else 1200) * (0.5 if not low else 0.25)
    body = bp(RNG.standard_normal(n), 80, 400) * np.exp(-t / 0.16) * 0.5
    dry = sub + trans + body
    ir = base.reverb_ir(rt60=1.6 if not low else 2.4, length=length)
    wet = fftconvolve(np.stack([dry, dry], 1), ir, axes=0)[:n] * 0.35
    return stereo(dry) + wet.astype(np.float32)


def pop():
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    f = 880 * (1 + 0.45 * (1 - np.exp(-t / 0.01)))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) * (1 - np.exp(-t / 0.0015))
    x += 0.3 * np.sin(2 * np.pi * 1760 * t) * np.exp(-t / 0.015)
    return stereo(x)


def glitch():
    n = int(0.42 * SR)
    x = np.zeros((n, 2))
    pos = 0
    while pos < n:
        L = int(RNG.uniform(0.012, 0.05) * SR)
        kind = RNG.integers(3)
        t = np.arange(L) / SR
        if kind == 0:
            seg = np.sign(np.sin(2 * np.pi * RNG.uniform(180, 1600) * t))
        elif kind == 1:
            seg = np.round(RNG.standard_normal(L) * 3) / 3
        else:
            seg = np.sin(2 * np.pi * RNG.uniform(2000, 6000) * t) * (RNG.random(L) > 0.4)
        seg *= RNG.uniform(0.3, 1.0) * (RNG.random() > 0.15)
        p = RNG.uniform(-0.8, 0.8)
        x[pos:pos + L, 0] += seg[: n - pos] * np.sqrt(0.5 - p / 2)
        x[pos:pos + L, 1] += seg[: n - pos] * np.sqrt(0.5 + p / 2)
        pos += L + int(RNG.uniform(0, 0.012) * SR)
    return lp(x, 9000).astype(np.float32)


def stutter():
    """A bright chord chopped into 16ths of the grid with falling gain: the frame keeps halving."""
    grain_t = np.arange(int(0.05 * SR)) / SR
    chord = sum(np.sin(2 * np.pi * base.hz(nm)[0] * grain_t) for nm in ("D5", "F5", "A5", "E6"))
    chord *= np.hanning(len(grain_t)) ** 0.3
    step = BEAT / 8
    n = int(0.62 * SR)
    x = np.zeros(n)
    for k in range(6):
        place(x, chord, k * step, 0.9 ** k)
    return stereo(hp(x, 300) * 0.5)


def swell(length=0.7):
    n = int(length * SR)
    t = np.arange(n) / SR
    env = np.exp((t - length) / 0.16)
    x = hp(RNG.standard_normal(n), 3500) * env * 0.6
    note = base.piano("A5", 0.6, 0.55)[:, 0]
    note = note[: n][::-1] if len(note) >= n else np.pad(note, (0, n - len(note)))[::-1]
    x = x + note * 0.8
    x[-int(0.003 * SR):] *= np.linspace(1, 0, int(0.003 * SR))
    return stereo(x)


def shutter():
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for t0, g in ((0.0, 1.0), (0.055, 0.7)):
        i = int(t0 * SR)
        tt = t[: n - i]
        click = hp(RNG.standard_normal(n - i), 1500) * np.exp(-tt / 0.004) + np.sin(2 * np.pi * 3100 * tt) * np.exp(-tt / 0.006) * 0.4
        x[i:] += click * g
    return stereo(x)


def flicker(length=3.3):
    n = int(length * SR)
    t = np.arange(n) / SR
    motor = sum(np.sin(2 * np.pi * 50 * k * t + RNG.uniform(0, 6)) / k for k in range(1, 6)) * 0.05
    motor += bp(RNG.standard_normal(n), 500, 1800) * 0.03
    x = motor
    step = 4 / S.fps
    k = 0
    while k * step < length - 0.05:
        click = hp(RNG.standard_normal(int(0.012 * SR)), 1200) * np.exp(-np.arange(int(0.012 * SR)) / SR / 0.003)
        place(x, click * RNG.uniform(0.5, 0.9), k * step)
        k += 1
    fade = np.minimum(1, np.minimum(t / 0.08, (length - t) / 0.25))
    return stereo(x * fade)


def riser(length):
    n = int(length * SR)
    t = np.arange(n) / SR
    u = t / length
    env = u ** 2.5
    f = 220 * 2 ** (1.5 * u)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * np.cumsum(2 + 14 * u) / SR)
    noise = svf_sweep(RNG.standard_normal(n), 300 + 5000 * u, q=1.4)
    x = (tone * 0.35 * trem + noise * 0.8) * env
    x[-int(0.003 * SR):] *= np.linspace(1, 0, int(0.003 * SR))
    return stereo(x)


SFX = {   # id -> (generator, peak dBFS before headroom)
    "whoosh": (lambda: whoosh(pan=(-0.7, 0.7)), -9), "whoosh_l": (lambda: whoosh(pan=(0.7, -0.7)), -9),
    "whoosh_short": (lambda: whoosh(0.36, 0.15, (-0.4, 0.4), 400, 3200), -11), "whoosh_rev": (whoosh_rev, -10),
    "impact": (lambda: impact(False), -6), "impact_low": (lambda: impact(True), -6), "pop": (pop, -15),
    "glitch": (glitch, -13), "stutter": (stutter, -12), "swell": (swell, -12), "shutter": (shutter, -13),
    "flicker": (flicker, -17), "riser": (lambda: riser(2.6), -12), "riser_short": (lambda: riser(0.9), -12),
}


# ------------------------------------------------------------------ the score
CHORDS = {   # left hand, right hand (felt piano voicings)
    "Dm9": (["D2", "A2"], ["F3", "A3", "E4"]), "Bbmaj7": (["Bb1", "F2"], ["D3", "A3", "F4"]),
    "Fadd9": (["F2", "C3"], ["A3", "C4", "G4"]), "Csus": (["C2", "G2"], ["F3", "G3", "C4"]),
    "Fmaj9": (["F2", "C3"], ["A3", "E4", "G4"]), "Am7": (["A1", "E2"], ["G3", "C4", "E4"]),
    "Gm7": (["G1", "D2"], ["F3", "Bb3", "D4"]),
}
MINOR = ["Dm9", "Bbmaj7", "Fadd9", "Csus"]
MAJOR = ["Fmaj9", "Csus", "Dm9", "Bbmaj7"]
PAD = {"Dm9": ["D3", "F3", "A3", "E4"], "Bbmaj7": ["Bb2", "D3", "F3", "A3"], "Fadd9": ["F3", "A3", "C4", "G4"],
       "Csus": ["C3", "F3", "G3", "C4"], "Fmaj9": ["F3", "A3", "C4", "E4", "G4"], "Am7": ["A2", "C3", "E3", "G3"],
       "Gm7": ["G2", "Bb2", "D3", "F3"]}
ROOT_NOTE = {"Dm9": "D", "Bbmaj7": "Bb", "Fadd9": "F", "Csus": "C", "Fmaj9": "F", "Am7": "A", "Gm7": "G"}


def kick():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    x = boom(150, 48, 0.22, 0.5) + lp(RNG.standard_normal(n) * np.exp(-t / 0.004), 3000) * 0.25
    return x


def hat():
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    return hp(RNG.standard_normal(n), 7000) * np.exp(-t / 0.012)


def sub_note(name, dur):
    f, _ = base.hz(name)
    n = int((dur + 0.3) * SR)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.02) * np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.08))
    return np.sin(2 * np.pi * f * t) * env


def section_events(t0, t1, level, prog, start_bar_chord=0):
    """Generate events on the grid between t0 and t1 at density `level` (0 air .. 4 peak)."""
    ev = []
    k0 = int(np.ceil((t0 - TICK_START) / BEAT - 1e-6))
    k1 = int(np.floor((t1 - TICK_START) / BEAT - 1e-6))
    for k in range(k0, k1 + 1):
        t = TICK_START + k * BEAT
        bar, beat = divmod(k - k0, 4)
        ch = prog[(start_bar_chord + bar) % len(prog)]
        lh, rh = CHORDS[ch]
        if beat == 0:
            ev.append(("pad", t, ch, min(4 * BEAT, t1 - t)))
            if level >= 1:
                for nm in lh:
                    ev.append(("piano", t, nm, 2.6 * BEAT, 0.42 + 0.05 * level))
                for i, nm in enumerate(rh):
                    ev.append(("piano", t + 0.012 * i, nm, 2.2 * BEAT, 0.34 + 0.05 * level))
            if level >= 2:
                ev.append(("sub", t, ROOT_NOTE[ch] + "1", 3.6 * BEAT))
        if level >= 2 and beat in (0, 2) or level >= 3:
            ev.append(("kick", t, 0.55 + 0.12 * (level - 2) if beat in (0, 2) else 0.4))
        if level >= 2:                         # muted-piano 8ths: root / fifth
            for h in (0, 1):
                nm = (lh[0][:-1] + "3") if (beat * 2 + h) % 2 == 0 else (rh[1])
                ev.append(("piano", t + h * BEAT / 2, nm, 0.12, 0.22 + 0.04 * level))
        if level >= 3:
            ev.append(("hat", t + BEAT / 2, 0.35))
            arp = rh + [rh[0][:-1] + str(int(rh[0][-1]) + 1)]
            for h in range(2):
                ev.append(("piano", t + h * BEAT / 2, arp[(beat * 2 + h) % len(arp)], 0.3, 0.3))
        if level >= 4:
            arp = rh + [rh[1][:-1] + str(int(rh[1][-1]) + 1)]
            for h in range(4):
                ev.append(("piano", t + h * BEAT / 4, arp[(beat * 4 + h) % len(arp)].replace("3", "4"), 0.1, 0.22))
            ev.append(("hat", t + BEAT / 4, 0.2)); ev.append(("hat", t + 3 * BEAT / 4, 0.2))
    return ev


_PIANO = {}


def piano(name, dur, vel):
    """Cached felt-piano note (the same note/length/velocity is the same 'sample', as on a real sampler)."""
    key = (name, round(dur, 2), round(vel, 2))
    if key not in _PIANO:
        _PIANO[key] = base.piano(name, key[1], key[2])
    return _PIANO[key]


def render_events(ev, n):
    out = np.zeros((n, 2), np.float32)
    k, h = kick(), hat()
    for e in ev:
        kind, t = e[0], e[1]
        if kind == "piano":
            place(out, piano(e[2], e[3], e[4]), t)
        elif kind == "pad":
            place(out, base.pad(PAD[e[2]], e[3], attack=min(1.2, e[3] / 3), release=1.5) * 2.2, t)
        elif kind == "kick":
            place(out, stereo(k * e[2]), t)
        elif kind == "hat":
            place(out, stereo(h * e[2], RNG.uniform(-0.3, 0.3)), t)
        elif kind == "sub":
            place(out, stereo(sub_note(e[2], e[3]) * 0.5), t)
        elif kind == "note":                       # (note, t, name, dur, vel) single melody note
            place(out, piano(e[2], e[3], e[4]), t)
    return out


def at(anchor):
    return S.at(anchor)


def beat_start(bid):
    return next(b["t0"] for b in S.beats if b["id"] == bid)


def compose():
    ev = []
    B = beat_start
    # Act I - cold open: air, then sparse piano; "Her." is a held breath; the title lands on a full chord.
    ev += [("pad", 0.0, "Dm9", B("B06") - 0.2)]
    ev += [("sub", 0.0, "D1", B("B06") - 0.3)]
    for anchor, nm in (("L01:centuries", "A4"), ("L01:Zeno", "F4"), ("L01:arrived", "E4"), ("L02:Jahan", "D4"),
                       ("L02:impossible", "C5")):
        ev.append(("note", at(anchor), nm, 1.6, 0.42))
    ev += [("note", at("L03:Her"), "A5", 2.4, 0.5), ("note", at("L03:Her") + 0.02, "E5", 2.4, 0.38)]
    t_title = B("B07")
    ev += [("piano", t_title, nm, 3.0, 0.62) for nm in ("D2", "A2", "F3", "A3", "E4", "D5")]
    ev += [("sub", t_title, "D1", 2.2), ("pad", t_title, "Dm9", B("B08") - t_title + 0.6)]
    # Act II - Zeno's division: pulse, building to drive; air for "waiting."; evidence is near silence.
    ev += section_events(B("B08"), B("B13"), 2, MINOR)
    ev += section_events(B("B13"), B("B17"), 3, MINOR)
    ev += [("pad", B("B17"), "Bbmaj7", B("B18") - B("B17"))]
    for anchor, nm in (("L12:evidence", "D2"), ("L13:gate", "A1"), ("L14:street", "F2"), ("L15:tarmac", "D2")):
        ev += [("note", at(anchor), nm, 1.4, 0.5), ("note", at(anchor) + 0.01, nm[:-1] + "3", 1.4, 0.32)]
    ev += section_events(B("B22"), B("B24"), 2, ["Dm9", "Gm7", "Bbmaj7", "Am7"])
    ev += section_events(B("B24"), B("B25"), 4, ["Dm9", "Bbmaj7"])
    # Act III - the infinite in-between: a series that halves its note values and lands on "one."
    ev += [("pad", B("B25"), "Csus", B("B26") - B("B25")), ("pad", B("B26"), "Fmaj9", at("L20:one") - B("B26"))]
    marks = [at("L20:half#2"), at("L20:quarter"), at("L20:eighth"), at("L20:eighth.end") + 0.1]
    for tm, nm in zip(marks[:3], ("C5", "E5", "G5")):
        ev.append(("note", tm, nm, 0.9, 0.48))
    run = ["A5", "C6", "E6", "G6", "A6", "C7", "E7"]
    t, d = marks[3], 0.36
    end = at("L20:one") - 0.02
    i = 0
    while t + d < end and i < 24:
        ev.append(("note", t, run[i % len(run)], d * 0.9, 0.3))
        t += d; d = max(0.045, d * 0.62); i += 1
    t_one = at("L20:one")
    ev += [("piano", t_one, nm, 3.2, 0.6) for nm in ("F1", "F2", "C3", "A3", "E4", "G4", "C5")]
    ev += [("sub", t_one, "F1", 2.6)]
    ev += section_events(B("B28"), B("B30"), 2, MAJOR)
    ev += section_events(B("B30"), B("B32"), 1, ["Fmaj9", "Am7", "Dm9", "Bbmaj7"])
    for anchor, nm in (("L25:hair", "E5"), ("L25:quarter", "C5"), ("L25:half-smile", "A5"), ("L25:watching", "G5")):
        ev.append(("note", at(anchor), nm, 1.4, 0.36))
    # Act IV - a hundred different women: the ostinato builds to the montage and resolves on "in."
    ev += section_events(B("B32"), B("B34"), 2, MINOR)
    ev += section_events(B("B34"), B("B35"), 3, MINOR)
    ev += section_events(B("B35"), B("B36"), 4, MINOR)
    ev += section_events(B("B36"), at("L30:in") - 0.05, 3, ["Bbmaj7", "Csus"])
    t_in = at("L30:in")
    ev += [("piano", t_in, nm, 1.2, 0.6) for nm in ("F1", "F2", "C3", "A3", "E4", "G4", "C5")]
    ev += [("sub", t_in, "F1", 1.0), ("pad", t_in, "Fmaj9", 1.0)]
    # Act V - the practical proof: no music. One chord returns on "No hurry." and rings past the cut.
    t_nh = at("L34:No")
    ev += [("piano", t_nh + 0.015 * i, nm, 4.5, 0.52) for i, nm in enumerate(("F2", "C3", "A3", "E4", "G4", "A4"))]
    ev += [("pad", t_nh, "Fmaj9", 4.5), ("sub", t_nh, "F1", 3.0)]
    return ev


def music_out_gain():
    """Hard musical exits: nothing sounds between the 'in.' chord tail and 'No hurry.'"""
    g = np.ones(N, np.float32)
    t_out, t_back = beat_start("B38"), at("L34:No") - 0.05
    a, b = int(t_out * SR), int(t_back * SR)
    fade = int(0.9 * SR)
    g[a - fade:a] *= np.linspace(1, 0, fade) ** 2
    g[a:b] = 0
    return g


def vo_track():
    vo = np.zeros(N, np.float32)
    for l in S.tl["lines"]:
        x, sr = sf.read(os.path.join(OUT, "vo", f"{l['id']}.wav"), dtype="float32")
        place(vo, x, l["start"])
    return vo


def duck(vo, depth_db=-6.0, attack=0.06, release=0.35):
    win = int(0.03 * SR)
    env = np.sqrt(np.convolve(vo.astype(np.float64) ** 2, np.ones(win) / win, mode="same"))
    active = (20 * np.log10(env + 1e-9) > -45).astype(np.float64)
    # look-ahead: start ducking slightly before the word
    shift = int(attack * SR)
    active = np.concatenate([active[shift:], np.zeros(shift)])
    a, r = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    out, acc = np.empty(len(active)), 0.0
    step = 64
    for i in range(0, len(active), step):
        v = active[i]
        coef = a ** step if v > acc else r ** step
        acc = v + (acc - v) * coef
        out[i:i + step] = acc
    return db(depth_db * out).astype(np.float32)


def tick_bed():
    tick = np.zeros((N, 2), np.float32)
    on, off = base.relay_click(False), base.relay_click(True)
    k = 0
    while True:
        t = TICK_START + k * BEAT
        if t >= CUT - 0.05:
            break
        place(tick, np.stack([on * 0.95, on], 1), t + RNG.uniform(-0.002, 0.002))
        if t + BEAT / 2 < CUT - 0.05:
            place(tick, np.stack([off, off * 0.92], 1), t + BEAT / 2 + RNG.uniform(-0.002, 0.002))
        k += 1
    B = beat_start
    pts = [(0, -11), (B("B08"), -11), (B("B08") + 0.5, -20), (B("B21") - 0.3, -20), (B("B21"), -6),
           (B("B22") - 0.2, -6), (B("B22") + 0.4, -21), (B("B25"), -21), (B("B25") + 0.3, -14), (B("B26"), -14),
           (B("B26") + 0.4, -24), (B("B38") - 0.6, -24), (B("B38"), -7), (CUT, -7)]
    ts = np.array([p[0] for p in pts]) * SR
    g = db(np.interp(np.arange(N), ts, [p[1] for p in pts])).astype(np.float32)
    return tick * g[:, None]


def ambience_walk():
    src = base.decode(os.path.join(ROOT, "assets", "videos", "VID-20261005-WA0000.mp4"))
    b0, b1 = beat_start("B28"), beat_start("B30")
    L = min(len(src) / SR, b1 - b0 + 0.6)
    x = src[: int(L * SR)].copy()
    fade_in, fade_out = int(0.4 * SR), int(0.5 * SR)
    x[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    x[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
    x = hp(lp(x, 9000), 90)
    return x


def lufs(x):
    x = np.asarray(x, np.float64)
    if x.ndim == 1:
        x = x[:, None]
    return METER.integrated_loudness(x)


def main():
    os.makedirs(os.path.join(OUT, "vo"), exist_ok=True)
    # --- voice: polish each line (zero-phase de-esser, gentle compression), same gain for all lines
    for l in S.tl["lines"]:
        x, sr = sf.read(os.path.join(ROOT, "work", "social", "narration", f"{l['id']}.wav"), dtype="float32")
        assert sr == SR
        x = base.compress(base.deess(x), thresh_db=-24, ratio=2.5)
        sf.write(os.path.join(OUT, "vo", f"{l['id']}.wav"), x, SR, subtype="FLOAT")
    vo = vo_track()
    vo_gain_db = -21.0 + HEADROOM_DB - lufs(vo)          # whole narration at -21 LUFS before headroom
    for l in S.tl["lines"]:
        p = os.path.join(OUT, "vo", f"{l['id']}.wav")
        x, _ = sf.read(p, dtype="float32")
        sf.write(p, x * db(vo_gain_db), SR, subtype="FLOAT")
    vo *= db(vo_gain_db)
    print(f"vo     34 lines, narration {lufs(vo):.1f} LUFS (incl. {HEADROOM_DB} dB headroom), peak {20*np.log10(np.abs(vo).max()):.1f} dBFS")

    # --- sfx
    for name, (gen, peak) in SFX.items():
        write(os.path.join(OUT, "sfx", f"{name}.wav"), gen(), peak + HEADROOM_DB)
    print(f"sfx    {len(SFX)} files: {', '.join(SFX)}")

    # --- score
    music = render_events(compose(), N + 6 * SR)[:N]
    music = hp(music, 35)
    music *= music_out_gain()[:, None]
    ir = base.reverb_ir(rt60=2.2, length=2.6)
    wet = fftconvolve(music, ir, axes=0)[:N] * 0.22
    music = (music + wet.astype(np.float32)) * music_out_gain()[:, None] ** 0.5
    # level: unducked score about 1 LU under the voice, ducked 6 dB under speech (~11 dB under the words)
    music *= db(lufs(vo) - 1.0 - lufs(music))
    d = duck(vo)
    music *= d[:, None]
    # the "No hurry." chord should bloom after the words, not under them: ducking already handles it
    write(os.path.join(OUT, "score.wav"), music)
    print(f"score  {DUR:.2f}s, {lufs(music):.1f} LUFS (ducked), peak {20*np.log10(np.abs(music).max()):.1f} dBFS")

    tick = tick_bed() * db(HEADROOM_DB)
    write(os.path.join(OUT, "tick.wav"), tick)
    print(f"tick   {lufs(tick):.1f} LUFS, stops at {CUT:.2f}s")

    amb = ambience_walk()
    amb *= db(lufs(vo) - 16.0 - lufs(amb))
    write(os.path.join(OUT, "amb_walk.wav"), amb)
    print(f"amb    {len(amb)/SR:.1f}s street ambience (authentic) at {lufs(amb):.1f} LUFS")


if __name__ == "__main__":
    main()
