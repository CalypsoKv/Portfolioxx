#!/usr/bin/env python3
"""Before / after reel for the motion lab: the same stretches of the film, first as delivered (stills), then from the
side composition NoHurrySocialMotion (moving plates), each with its type, voice and music.

Usage: motion_compare.py <project_root> <master.mp4> <out.mp4>
Renders the ranges in edit/social/motion.py RANGES from the side composition (Remotion --frames), cuts the same
frames from the master, labels both, applies the master's loudness gain to the side renders, concatenates.
"""
import importlib.util, json, os, re, subprocess, sys

ROOT, MASTER, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.dirname(__file__))
from social_common import Social  # noqa: E402

S = Social(ROOT)
spec = importlib.util.spec_from_file_location("motion", os.path.join(ROOT, "edit", "social", "motion.py"))
M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
WORK = os.path.join(ROOT, "work", "social", "motionlab", "compare")
FONT = os.path.join(ROOT, "assets", "fonts", "JetBrainsMono-Medium.ttf")
os.makedirs(WORK, exist_ok=True)


def F(t):
    return int(round(t * 30))


def master_gain_db():
    """The +x dB the master pass applied (render mix -> -14 LUFS), so side renders sound like the master."""
    s = subprocess.run(["ffmpeg", "-nostats", "-i", os.path.join(ROOT, "work", "social", "render", "no_hurry_social.mkv"),
                        "-filter_complex", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    i = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", s)[-1])
    return -14.0 - i


def label(src, dst, text, ss=None, n=None):
    vf = (f"drawtext=fontfile={FONT}:text='{text}':x=60:y=60:fontsize=34:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=14")
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if ss is not None:
        cmd += ["-ss", f"{ss:.4f}"]
    cmd += ["-i", src]
    if n is not None:
        cmd += ["-frames:v", str(n), "-t", f"{n / 30:.4f}"]
    af = "aresample=48000" if ss is not None else f"volume={GAIN:.2f}dB,alimiter=limit=0.89:attack=5:release=60:level=disabled,aresample=48000"
    cmd += ["-vf", vf, "-af", af, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "256k", "-ac", "2", dst]
    subprocess.run(cmd, check=True)


GAIN = master_gain_db()
parts = []
for a, b in M.RANGES:
    f0 = F(next(x["t0"] for x in S.beats if x["id"] == a))
    f1 = F(next(x["t1"] for x in S.beats if x["id"] == b)) - 1
    side = os.path.join(WORK, f"after_{a}_{b}.mkv")
    if not os.path.exists(side):
        subprocess.run(["npx", "remotion", "render", "NoHurrySocialMotion", side, f"--frames={f0}-{f1}", "--codec=h264-mkv",
                        "--audio-codec=pcm-16", "--crf=15", "--color-space=bt709", "--concurrency=4", "--image-format=jpeg",
                        "--jpeg-quality=95", "--log=error"], cwd=os.path.join(ROOT, "studio"), check=True)
    before = os.path.join(WORK, f"before_{a}_{b}.mp4")
    after = os.path.join(WORK, f"after_{a}_{b}.mp4")
    label(MASTER, before, f"BEFORE  stills  {a}-{b}", ss=f0 / 30, n=f1 - f0 + 1)
    label(side, after, f"AFTER  motion  {a}-{b}")
    parts += [before, after]
lst = os.path.join(WORK, "list.txt")
open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", OUT], check=True)
print(f"wrote {OUT} ({len(parts)} parts, side audio +{GAIN:.1f} dB)")
