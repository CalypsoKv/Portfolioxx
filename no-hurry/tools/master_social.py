#!/usr/bin/env python3
"""Master the social cut: Remotion render (H.264 + PCM in MKV) -> loudness-normalised MP4 for Reels/TikTok/Shorts.

  * audio: the Remotion mix (stems summed with 5 dB headroom) -> gain to -14 LUFS integrated
           -> 4x-oversampled look-ahead limiter at -1.0 dBTP -> AAC 320 kb/s (encoded once)
  * video: stream copy (no re-encode), MP4 with faststart, BT.709 tags
  * stems: voice / music / sfx+tick / ambience re-summed from the same placements (work/social/studio_meta.json),
           with the same master gain, as 48 kHz WAV for re-mixing or replacing the draft voice

  * upload: optional lighter copy for posting from a phone (x264 CRF 21, same mastered audio)

Usage: master_social.py <project_root> <render.mkv> <out.mp4> [--stems <dir>] [--upload <upload.mp4>]
"""
import json, os, subprocess, sys

import numpy as np
import pyloudnorm
import soundfile as sf

ROOT, SRC, DST = sys.argv[1], sys.argv[2], sys.argv[3]
STEMS = sys.argv[sys.argv.index("--stems") + 1] if "--stems" in sys.argv else None
UPLOAD = sys.argv[sys.argv.index("--upload") + 1] if "--upload" in sys.argv else None
sys.path.insert(0, os.path.dirname(__file__))
_argv, sys.argv = sys.argv, [sys.argv[0], ROOT]
import sound as base  # noqa: E402  (look-ahead true-peak limiter)
sys.argv = _argv

SR = 48000
TARGET, CEIL_DBTP = -14.0, -1.0
METER = pyloudnorm.Meter(SR)


def decode(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def lufs(x):
    return METER.integrated_loudness(np.asarray(x, np.float64))


def true_peak_db(x):
    from scipy.signal import resample_poly
    return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)


def master(x):
    g = 10 ** ((TARGET - lufs(x)) / 20)
    y = base.limit(x * g, 10 ** (CEIL_DBTP / 20) * 0.985)
    for _ in range(2):                                  # the limiter shaves a little loudness: top up once or twice
        d = TARGET - lufs(y)
        if abs(d) < 0.1:
            break
        g *= 10 ** (d / 20)
        y = base.limit(x * g, 10 ** (CEIL_DBTP / 20) * 0.985)
    return y.astype(np.float32), g


def stems(meta, n, gain):
    pub = os.path.join(ROOT, "studio", "public")
    groups = {"voice": ["voice"], "music": ["music"], "sfx_tick": ["sfx", "tick"], "ambience": ["ambience"]}
    out = {k: np.zeros((n, 2), np.float32) for k in groups}
    for a in meta["audio"]:
        x, sr = sf.read(os.path.join(pub, a["src"]), dtype="float32", always_2d=True)
        assert sr == SR, a["src"]
        if x.shape[1] == 1:
            x = np.repeat(x, 2, axis=1)
        i = int(round(a["frame"] / meta["fps"] * SR))
        if i >= n:
            continue
        x = x[: n - i]
        for k, kinds in groups.items():
            if a["kind"] in kinds:
                out[k][i:i + len(x)] += x
    os.makedirs(STEMS, exist_ok=True)
    for k, x in out.items():
        sf.write(os.path.join(STEMS, f"no_hurry_social_{k}.wav"), (x * gain).astype(np.float32), SR, subtype="FLOAT")
    return out


def main():
    x = decode(SRC)
    print(f"render mix   {lufs(x):6.1f} LUFS, true peak {true_peak_db(x):5.1f} dBTP, {len(x) / SR:.2f} s")
    y, g = master(x)
    print(f"master       {lufs(y):6.1f} LUFS, true peak {true_peak_db(y):5.1f} dBTP (gain {20 * np.log10(g):+.1f} dB)")
    tmp = DST + ".master.wav"
    sf.write(tmp, y, SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-i", tmp, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "320k", "-ar", str(SR), "-movflags", "+faststart",
                    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", DST], check=True)
    if UPLOAD:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-i", tmp, "-map", "0:v:0", "-map", "1:a:0",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-profile:v", "high", "-pix_fmt", "yuv420p",
                        "-g", "60", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                        "-c:a", "aac", "-b:a", "256k", "-ar", str(SR), "-movflags", "+faststart", UPLOAD], check=True)
        print(f"upload copy  {UPLOAD} ({os.path.getsize(UPLOAD) / 1e6:.0f} MB)")
    os.remove(tmp)
    if STEMS:
        meta = json.load(open(os.path.join(ROOT, "work", "social", "studio_meta.json")))
        st = stems(meta, len(x), g)
        offline = sum(st.values())
        print(f"stems        re-summed offline: {lufs(offline * g):6.1f} LUFS after master gain "
              f"(Remotion mix {lufs(x * g):6.1f}); voice {lufs(st['voice'] * g):.1f}, music {lufs(st['music'] * g):.1f}, "
              f"sfx+tick {lufs(st['sfx_tick'] * g):.1f}, ambience {lufs(st['ambience'] * g):.1f} LUFS")
    print(f"wrote {DST}")


if __name__ == "__main__":
    main()
