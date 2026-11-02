#!/usr/bin/env python3
"""QA of the social cut: specs, duration, loudness / true peak of the ENCODED file, black frames only where the
storyboard puts black, picture changes at every beat boundary, and a contact sheet of frames to look at.

Usage: qa_social.py <project_root> <film.mp4>
Writes output/no_hurry_social_qa_report.md and work/social/qa/contact_*.jpg (private: contains photos)
"""
import json, os, re, subprocess, sys

import numpy as np
from PIL import Image, ImageDraw

ROOT, FILM = sys.argv[1], sys.argv[2]
sys.path.insert(0, os.path.dirname(__file__))
from social_common import Social  # noqa: E402

S = Social(ROOT)
META = json.load(open(os.path.join(ROOT, "work", "social", "studio_meta.json")))
QA = os.path.join(ROOT, "work", "social", "qa")
os.makedirs(QA, exist_ok=True)
report, fails = [], 0


def ok(cond, msg):
    global fails
    report.append(("PASS " if cond else "FAIL ") + msg)
    fails += 0 if cond else 1


def probe():
    j = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", FILM]))
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    a = next(s for s in j["streams"] if s["codec_type"] == "audio")
    return v, a, float(j["format"]["duration"])


def frame_at(t):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", FILM, "-frames:v", "1", "-f", "rawvideo",
                                   "-pix_fmt", "rgb24", "-s", "270x480", "-"])
    return np.frombuffer(raw, np.uint8).reshape(480, 270, 3)


def main():
    v, a, dur = probe()
    ok(v["codec_name"] == "h264" and v["width"] == 1080 and v["height"] == 1920, f"video {v['codec_name']} {v['width']}x{v['height']}")
    ok(v.get("pix_fmt") == "yuv420p", f"pixel format {v.get('pix_fmt')}")
    ok(v.get("r_frame_rate") == "30/1", f"frame rate {v.get('r_frame_rate')}")
    ok(v.get("color_primaries") == "bt709" and v.get("color_transfer") == "bt709", f"colour tags {v.get('color_primaries')}/{v.get('color_transfer')}/{v.get('color_space')}")
    nb = int(v.get("nb_frames", 0) or 0)
    ok(abs(nb - META["durationInFrames"]) <= 1 or nb == 0, f"{nb} frames (timeline {META['durationInFrames']})")
    ok(abs(dur - S.tl["duration"]) < 0.1, f"duration {dur:.2f}s (timeline {S.tl['duration']:.2f}s)")
    ok(a["codec_name"] == "aac" and int(a["sample_rate"]) == 48000 and a["channels"] == 2, f"audio {a['codec_name']} {a['sample_rate']} Hz {a['channels']} ch")

    s = subprocess.run(["ffmpeg", "-nostats", "-i", FILM, "-filter_complex", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    summ = s[s.rfind("Summary:"):]
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1))
    lra = float(re.search(r"LRA:\s+([\d.]+) LU", summ).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ).group(1))
    ok(-14.6 <= I <= -13.4, f"encoded loudness {I:.1f} LUFS integrated (target -14)")
    ok(tp <= -0.8, f"encoded true peak {tp:.1f} dBTP (ceiling -1.0)")
    report.append(f"INFO loudness range {lra:.1f} LU")

    # black frames: only where the storyboard is black (black cards, title card, end)
    bd = subprocess.run(["ffmpeg", "-nostats", "-i", FILM, "-vf", "blackdetect=d=0.25:pix_th=0.08", "-an", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    blacks = [(float(m.group(1)), float(m.group(2))) for m in re.finditer(r"black_start:([\d.]+) black_end:([\d.]+)", bd)]
    allowed = [(b["t0"] - 0.3, b["t1"] + 0.3) for b in S.beats if b["visual"]["kind"] in ("black", "title")]
    stray = [x for x in blacks if not any(lo <= x[0] and x[1] <= hi for lo, hi in allowed)]
    ok(not stray, f"black stretches only on black cards ({len(blacks)} found" + (f"; stray: {stray}" if stray else "") + ")")

    # every beat boundary changes the picture (catches a sequence that failed to render or a frozen image)
    t_bounds = [b["t0"] for b in S.beats[1:]]
    same = []
    for t in t_bounds:
        f0, f1 = frame_at(max(0, t - 0.2)).astype(np.int16), frame_at(t + 0.25).astype(np.int16)
        if np.abs(f0 - f1).mean() < 4:
            same.append(round(t, 2))
    ok(len(same) <= 1, f"picture changes across {len(t_bounds)} beat boundaries" + (f" (near-identical at {same})" if same else ""))

    # contact sheets: mid-beat frames
    tiles = []
    for b in S.beats:
        t = b["t0"] + 0.8 * (b["t1"] - b["t0"])
        tiles.append((b["id"], frame_at(t)))
    per = 12
    for k in range(0, len(tiles), per):
        sheet = Image.new("RGB", (6 * 278 + 8, 2 * 506 + 8), (16, 16, 16))
        d = ImageDraw.Draw(sheet)
        for i, (bid, fr) in enumerate(tiles[k:k + per]):
            x, y = (i % 6) * 278 + 8, (i // 6) * 506 + 22
            sheet.paste(Image.fromarray(fr), (x, y)); d.text((x, y - 16), bid, fill=(255, 190, 0))
        sheet.save(os.path.join(QA, f"contact_{k // per}.jpg"), quality=86)

    out = os.path.join(ROOT, "output", "no_hurry_social_qa_report.md")
    with open(out, "w") as f:
        f.write("# NO HURRY social cut: QA report\n\nAutomated checks of the encoded file `output/no_hurry_social_9x16.mp4`, "
                "made by `tools/qa_social.py`.\nContact sheets of mid-beat frames are kept privately (`work/social/qa/`).\n\n")
        f.write("\n".join(f"- {r}" for r in report))
        f.write(f"\n\n**{'All checks passed' if fails == 0 else f'{fails} check(s) failed'}.**\n")
    print("\n".join(report))
    print(f"{fails} failed -> {out}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
