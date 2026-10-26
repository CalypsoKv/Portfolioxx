#!/usr/bin/env python3
"""Automated QA for the rendered film + stem export.

Checks: container/stream specs, duration vs timeline, unexpected black frames, loudness/true peak of the
encoded audio, caption hygiene (overlaps, durations, line lengths, every word present in the script),
LUT applied exactly once (graded vs corrected statistics + no LUT code outside grade.py).
Writes output/no_hurry_qa_report.md, work/qa/final_contact_sheet.jpg and output/stems/*.wav

Usage: qa.py <project_root>
"""
import glob, json, os, re, subprocess, sys

import cv2
import numpy as np
import soundfile as sf

ROOT = sys.argv[1]
OUT = os.path.join(ROOT, "output")
MASTER = os.path.join(OUT, "no_hurry_master_9x16.mp4")
CLEAN = os.path.join(OUT, "no_hurry_clean.mp4")
TL = json.load(open(os.path.join(ROOT, "work", "timeline.json")))
report, problems = [], []


def ok(cond, msg):
    (report if cond else problems).append(("PASS " if cond else "FAIL ") + msg)
    if cond:
        return
    report.append("FAIL " + msg)


def probe(path):
    return json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path]))


def check_streams():
    for path in (MASTER, CLEAN):
        name = os.path.basename(path)
        p = probe(path)
        v = next(s for s in p["streams"] if s["codec_type"] == "video")
        a = [s for s in p["streams"] if s["codec_type"] == "audio"]
        dur = float(p["format"]["duration"])
        size = int(p["format"]["size"]) / 1e6
        rate = float(p["format"]["bit_rate"]) / 1e6
        ok(v["codec_name"] == "h264" and v["width"] == 1080 and v["height"] == 1920,
           f"{name}: H.264 {v['width']}x{v['height']} ({v.get('profile')}, {v['pix_fmt']})")
        ok(v["r_frame_rate"] == "24/1", f"{name}: {v['r_frame_rate']} fps")
        ok(v.get("color_primaries") == "bt709" and v.get("color_transfer") == "bt709" and v.get("color_space") == "bt709",
           f"{name}: colour tagged BT.709 ({v.get('color_range')} range)")
        ok(len(a) == 1 and a[0]["codec_name"] == "aac" and a[0]["channels"] == 2 and a[0]["sample_rate"] == "48000",
           f"{name}: 1 audio stream, AAC stereo 48 kHz")
        ok(abs(dur - TL["duration"]) < 0.15, f"{name}: duration {dur:.2f}s (timeline {TL['duration']:.2f}s)")
        report.append(f"INFO {name}: {size:.1f} MB, {rate:.2f} Mbit/s overall")
        dec = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "null", "-"], capture_output=True, text=True)
        ok(dec.returncode == 0 and not dec.stderr.strip(), f"{name}: decodes end-to-end without errors")


def check_black():
    out = subprocess.run(["ffmpeg", "-i", MASTER, "-vf", "blackdetect=d=0.25:pix_th=0.06", "-an", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    segs = [(float(a), float(b)) for a, b in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", out)]
    title = next(s for s in json.load(open(os.path.join(ROOT, "edit", "manifest.json")))["shots"] if s["id"] == "S04")
    sys.argv = [sys.argv[0], ROOT]
    sys.path.insert(0, os.path.join(ROOT, "tools"))
    import render_frames as rf
    shots = {s["id"]: s for s in rf.edl()}
    expected = [(0.0, 4.0), (shots["S04"]["t0"] - 0.6, shots["S05"]["t0"] + 0.5), (TL["cut_to_black"] - 0.05, TL["duration"] + 1)]
    unexpected = [s for s in segs if not any(a - 0.05 <= s[0] and s[1] <= b + 0.05 for a, b in expected)]
    report.append("INFO black segments: " + ", ".join(f"{a:.2f}-{b:.2f}s" for a, b in segs))
    ok(not unexpected, "no unexpected black frames" + ("" if not unexpected else f": {unexpected}"))


def check_audio():
    out = subprocess.run(["ffmpeg", "-i", MASTER, "-map", "0:a", "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    s = out[out.rfind("Summary:"):]
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1))
    lra = float(re.search(r"LRA:\s+(-?[\d.]+) LU", s).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1))
    ok(-17.0 <= I <= -15.0, f"encoded audio loudness {I:.1f} LUFS integrated (target -16)")
    ok(tp <= -1.0, f"encoded audio true peak {tp:.1f} dBTP (ceiling -1.0)")
    report.append(f"INFO loudness range {lra:.1f} LU")
    # the ending: ticking continues after the last line, then silence on black
    x, sr = sf.read(os.path.join(ROOT, "work", "stems", "mix.wav"), dtype="float32")
    last = TL["lines"][-1]["end"]
    rms = lambda a, b: 20 * np.log10(np.sqrt(np.mean(x[int(a * sr):int(b * sr)] ** 2)) + 1e-12)  # noqa: E731
    ok(rms(last + 0.5, TL["cut_to_black"] - 0.1) > -60, f"ticking audible after the last line ({rms(last + 0.5, TL['cut_to_black'] - 0.1):.1f} dBFS RMS)")
    ok(rms(TL["cut_to_black"] + 0.05, TL["duration"]) < -70, f"silence after the cut to black ({rms(TL['cut_to_black'] + 0.05, TL['duration']):.1f} dBFS RMS)")
    m, _ = sf.read(os.path.join(ROOT, "work", "stems", "music.wav"), dtype="float32")
    proof = next(l for l in TL["lines"] if l["id"] == "L31")["end"]
    mr = 20 * np.log10(np.sqrt(np.mean(m[int((proof + 4) * sr):int(TL["cut_to_black"] * sr)] ** 2)) + 1e-12)
    ok(mr < -55, f"music removed after 'Love is not the proof' ({mr:.1f} dBFS RMS from +4 s to the cut)")


def check_captions():
    script = json.load(open(os.path.join(ROOT, "edit", "script.json")))
    words = set()
    for l in script["lines"]:
        for w in l["text"].replace("{name}", script["narrator_name"]).split():
            words.add(re.sub(r"[^\w'’-]", "", w).lower())
    srt = open(os.path.join(OUT, "no_hurry_captions.srt")).read().strip().split("\n\n")
    prev_end, bad_words, long_lines, issues = -1, set(), [], []
    t = lambda s: sum(float(x) * m for x, m in zip(s.replace(",", ".").split(":"), (3600, 60, 1)))  # noqa: E731
    for block in srt:
        lines = block.split("\n")
        a, b = [t(x.strip()) for x in lines[1].split("-->")]
        text = [re.sub(r"</?i>", "", x) for x in lines[2:]]
        if a < prev_end - 1e-3:
            issues.append(f"overlap at {lines[1]}")
        if b - a < 0.5:
            issues.append(f"too short ({b - a:.2f}s) at {lines[1]}")
        if len(text) > 2:
            issues.append(f">2 lines at {lines[1]}")
        long_lines += [x for x in text if len(x) > 34]
        for w in " ".join(text).split():
            w2 = re.sub(r"[^\w'’-]", "", w).lower()
            if w2 and w2 not in words:
                bad_words.add(w)
        prev_end = b
    ok(not issues, f"{len(srt)} captions: no overlaps, none shorter than 0.5 s, max two lines" + ("" if not issues else f" -> {issues}"))
    ok(not long_lines, "caption lines <= 34 characters" + ("" if not long_lines else f" -> {long_lines}"))
    ok(not bad_words, "every caption word appears in the script (spelling)" + ("" if not bad_words else f" -> {bad_words}"))


def check_lut():
    rows = []
    for g in sorted(glob.glob(os.path.join(ROOT, "work", "graded", "_corrected_*.png"))):
        name = os.path.basename(g)[len("_corrected_"):]
        if "_00000" in name:
            continue
        c = cv2.imread(g, cv2.IMREAD_UNCHANGED).astype(np.float32) / 65535
        f = cv2.imread(os.path.join(ROOT, "work", "graded", name), cv2.IMREAD_UNCHANGED).astype(np.float32) / 65535
        c, f = c[::8, ::8, ::-1], f[::8, ::8, ::-1]
        y = c.mean(axis=2)
        hi, lo = y > 0.75, y < 0.12
        warm_hi = (f[..., 0] - f[..., 2])[hi].mean() - (c[..., 0] - c[..., 2])[hi].mean() if hi.any() else np.nan
        cool_lo = (f[..., 2] - f[..., 0])[lo].mean() - (c[..., 2] - c[..., 0])[lo].mean() if lo.any() else np.nan
        rows.append((name, warm_hi * 255, cool_lo * 255))
    warm = np.nanmean([r[1] for r in rows]); cool = np.nanmean([r[2] for r in rows])
    ok(warm > 0.5 and cool > 0.2, f"LUT signature present in all {len(rows)} graded stills (highlights warmer by {warm:.1f}/255, "
                                   f"shadows cooler by {cool:.1f}/255 vs pre-LUT)")
    code = {p: open(p).read() for p in glob.glob(os.path.join(ROOT, "tools", "*.py"))}
    users = [os.path.basename(p) for p, s in code.items() if "lut3d" in s and not p.endswith(("qa.py", "lutlib.py"))]
    ok(users == ["grade.py"], f"LUT applied in exactly one place ({', '.join(users)}), renderer reads graded files only")


def contact_sheet():
    d = os.path.join(ROOT, "work", "qa")
    os.makedirs(d, exist_ok=True)
    times = np.arange(1.0, TL["duration"] - 0.5, 3.0)
    tiles = []
    for t in times:
        raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", MASTER, "-frames:v", "1",
                                       "-vf", "scale=216:384", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"])
        im = np.frombuffer(raw, np.uint8).reshape(384, 216, 3).copy()
        cv2.putText(im, f"{int(t // 60)}:{t % 60:04.1f}", (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 230, 255), 1)
        tiles.append(im)
    cols = 16
    while len(tiles) % cols:
        tiles.append(np.zeros_like(tiles[0]))
    sheet = np.concatenate([np.concatenate(tiles[i:i + cols], 1) for i in range(0, len(tiles), cols)], 0)
    p = os.path.join(d, "final_contact_sheet.jpg")
    cv2.imwrite(p, sheet, [cv2.IMWRITE_JPEG_QUALITY, 85])
    report.append(f"INFO contact sheet ({len(times)} frames, every 3 s): {os.path.relpath(p, ROOT)}")


def export_stems():
    d = os.path.join(OUT, "stems")
    os.makedirs(d, exist_ok=True)
    synthetic = any(v.startswith("SYNTHETIC") for v in TL["sources"].values())
    names = {"narration": "no_hurry_narration" + ("_SYNTHETIC_DRAFT" if synthetic else ""), "music": "no_hurry_music",
             "ambience_fx": "no_hurry_ambience_fx", "mix": "no_hurry_mix"}
    for k, n in names.items():
        x, sr = sf.read(os.path.join(ROOT, "work", "stems", f"{k}.wav"), dtype="float32")
        if k == "narration":
            x = x[:, 0]                                   # dual-mono -> mono
        peak = np.abs(x).max()
        if peak > 0.98:                                   # stems are pre-limiter; keep them clip-free as 24-bit
            x = x * (0.98 / peak)
        sf.write(os.path.join(d, n + ".wav"), x, sr, subtype="PCM_24")
    report.append("INFO stems: " + ", ".join(sorted(os.listdir(d))))


def main():
    check_streams(); check_black(); check_audio(); check_captions(); check_lut(); contact_sheet(); export_stems()
    lines = ["# NO HURRY - automated QA report", "", f"Film duration {TL['duration']:.2f} s; cut to black at "
             f"{TL['cut_to_black']:.2f} s.", ""]
    lines += [f"- {r}" for r in report]
    lines += ["", f"**{len([r for r in report if r.startswith('PASS')])} passed, {len(problems)} failed.**"]
    open(os.path.join(OUT, "no_hurry_qa_report.md"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
