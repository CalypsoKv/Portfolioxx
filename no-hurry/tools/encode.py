#!/usr/bin/env python3
"""Render picture + mux sound into the two deliverables in one pass.

  output/no_hurry_master_9x16.mp4  graphics + burned-in captions
  output/no_hurry_clean.mp4        graphics only (no captions)

Usage: encode.py <project_root> [--segment START END] [--preset slow|medium|veryfast]
"""
import json, os, subprocess, sys, time

ROOT = sys.argv[1]
args = sys.argv[2:]
seg = None
preset = "slow"
if "--segment" in args:
    i = args.index("--segment"); seg = (float(args[i + 1]), float(args[i + 2]))
if "--preset" in args:
    preset = args[args.index("--preset") + 1]
tl = json.load(open(os.path.join(ROOT, "work", "timeline.json")))
draft = any(v.startswith("SYNTHETIC") for v in tl["sources"].values())
out_dir = os.path.join(ROOT, "output") if not seg else os.path.join(ROOT, "work", "qa")
suffix = "" if not seg else f"_seg_{seg[0]:06.2f}"
master = os.path.join(out_dir, f"no_hurry_master_9x16{suffix}.mp4")
clean = os.path.join(out_dir, f"no_hurry_clean{suffix}.mp4")
fonts = os.path.join(ROOT, "assets", "fonts")
gfx = os.path.join(ROOT, "work", "graphics.ass")
caps = os.path.join(ROOT, "output", "no_hurry_captions.ass")
esc = lambda p: p.replace("\\", "/").replace(":", "\\:").replace("'", "\\'")  # noqa: E731

t0 = seg[0] if seg else 0.0
shift = f"setpts=PTS+{t0}/TB," if seg else ""
unshift = ",setpts=PTS-STARTPTS" if seg else ""
to709 = "scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p"
fc = (f"[0:v]{shift}subtitles='{esc(gfx)}':fontsdir='{esc(fonts)}',split=2[g1][g2];"
      f"[g1]{to709}{unshift}[clean];"
      f"[g2]subtitles='{esc(caps)}':fontsdir='{esc(fonts)}',{to709}{unshift}[master]")
comment = ("DRAFT CUT - narration is a synthetic placeholder voice (Kokoro-82M), not the filmmaker's voice."
           if draft else "Narration: recorded by the filmmaker.")
venc = ["-c:v", "libx264", "-preset", preset, "-crf", "19", "-tune", "film", "-profile:v", "high", "-level", "4.2",
        "-maxrate", "10M", "-bufsize", "20M", "-g", "48", "-keyint_min", "24", "-pix_fmt", "yuv420p",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"]
aenc = ["-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2"]
meta = ["-metadata", "title=NO HURRY", "-metadata", f"comment={comment}", "-movflags", "+faststart"]
audio_in = ["-ss", str(t0), "-t", str(seg[1] - seg[0])] if seg else []
cmd = (["ffmpeg", "-v", "error", "-nostats", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1080x1920", "-r", "24",
        "-i", "pipe:0"] + audio_in + ["-i", os.path.join(ROOT, "work", "stems", "mix.wav"), "-filter_complex", fc]
       + ["-map", "[master]", "-map", "1:a"] + venc + aenc + meta + ["-shortest", master]
       + ["-map", "[clean]", "-map", "1:a"] + venc + aenc + meta + ["-shortest", clean])
render = [sys.executable, os.path.join(ROOT, "tools", "render_frames.py"), ROOT, "--stdout"]
if seg:
    render += [str(seg[0]), str(seg[1])]
start = time.time()
r = subprocess.Popen(render, stdout=subprocess.PIPE)
e = subprocess.Popen(cmd, stdin=r.stdout)
r.stdout.close()
e.wait(); r.wait()
if r.returncode or e.returncode:
    sys.exit(f"render failed: frames={r.returncode} ffmpeg={e.returncode}")
print(f"wrote {master}\n      {clean}\n({time.time() - start:.0f}s)")
