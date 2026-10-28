#!/usr/bin/env bash
# Turns each tall capture (art-src/video/<name>.png) into a seamless loop: a 16:9 window eases down the page and back up.
# Desktop: 960x540; phones: 640x360. The CRT shader adds the grain and colour, so a low bitrate is enough.
# Run: bash scripts/video/encode.sh
set -euo pipefail
T=18
mkdir -p public/video
for src in art-src/video/*.png; do
  name=$(basename "$src" .png)
  pan="crop=1280:720:0:'(ih-oh)*(0.5-0.5*cos(2*PI*t/${T}))'"
  ffmpeg -v error -y -loop 1 -framerate 30 -t "$T" -i "$src" -vf "${pan},scale=960:540:flags=lanczos" \
    -c:v libx264 -preset slow -crf 31 -pix_fmt yuv420p -g 90 -movflags +faststart -an "public/video/${name}.mp4"
  ffmpeg -v error -y -loop 1 -framerate 24 -t "$T" -i "$src" -vf "${pan},scale=640:360:flags=lanczos" \
    -c:v libx264 -preset slow -crf 33 -pix_fmt yuv420p -g 72 -movflags +faststart -an "public/video/${name}-lite.mp4"
  echo "$name $(du -k "public/video/${name}.mp4" | cut -f1)KB / $(du -k "public/video/${name}-lite.mp4" | cut -f1)KB"
done
