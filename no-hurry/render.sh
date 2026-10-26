#!/usr/bin/env bash
# NO HURRY - reproducible render pipeline (FFmpeg + Python, CPU only).
#
#   ./render.sh                 everything: narration -> align -> timeline -> grade -> sound -> captions -> film -> QA
#   ./render.sh --from sound    re-run from a stage (narration|align|timeline|grade|sound|captions|film|qa)
#   ./render.sh --only captions run a single stage
#   ./render.sh --check         verify inputs and tools, render nothing
#
# Inputs (never committed - private media):
#   assets/photos/*.jpg, assets/videos/*.mp4   working copies of the Google Drive folder "Zeno" (see edit/source_inventory.tsv)
#   assets/luts/no_hurry_warm_memory_film.cube the custom LUT
#   assets/voiceover/L01.wav ... L34.wav        OPTIONAL real narration, one file per script line (see output/no_hurry_voiceover_guide.md);
#                                               any line without a recording falls back to the synthetic draft voice
# Edit decisions live in edit/script.json (words + pauses), edit/manifest.json (shots), edit/grade.json (colour).
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$PWD"
PY="$ROOT/.venv/bin/python"
STAGES=(narration align timeline grade sound captions film qa)

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

setup() {
  for t in ffmpeg ffprobe python3 curl; do command -v "$t" >/dev/null || { echo "missing tool: $t" >&2; exit 1; }; done
  ffmpeg -hide_banner -filters 2>/dev/null | grep -q " lut3d " || { echo "this ffmpeg has no lut3d filter" >&2; exit 1; }
  ffmpeg -hide_banner -filters 2>/dev/null | grep -q " subtitles " || { echo "this ffmpeg has no libass subtitles filter" >&2; exit 1; }
  if [ ! -x "$PY" ]; then
    python3 -m venv --system-site-packages .venv
    .venv/bin/pip install -q -r tools/requirements.txt
  fi
  mkdir -p work/models assets/fonts
  local rel=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
  [ -s work/models/kokoro-v1.0.onnx ] || curl -sSL --retry 3 -o work/models/kokoro-v1.0.onnx "$rel/kokoro-v1.0.onnx"
  [ -s work/models/voices-v1.0.bin ] || curl -sSL --retry 3 -o work/models/voices-v1.0.bin "$rel/voices-v1.0.bin"
  # Cormorant Garamond (SIL OFL) from Google Fonts; Inter (SIL OFL) must be installed system-wide or dropped in assets/fonts
  if [ ! -s assets/fonts/CormorantGaramond-MediumItalic.ttf ]; then
    curl -sS "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600" \
      | grep -oE "font-style: [a-z]+|font-weight: [0-9]+|url\([^)]+\)" | paste - - - | while read -r _ style _ weight url; do
        style=${style%;}; weight=${weight%;}; url=${url#url(}; url=${url%)}
        name=$([ "$weight" = 500 ] && echo Medium || echo SemiBold)$([ "$style" = italic ] && echo Italic)
        curl -sS -o "assets/fonts/CormorantGaramond-$name.ttf" "$url"
      done
  fi
  fc-list | grep -qi "Inter" || ls assets/fonts | grep -qi "^Inter" || echo "warning: Inter font not found - captions will fall back" >&2
}

check_inputs() {
  local missing=0
  [ -s assets/luts/no_hurry_warm_memory_film.cube ] || { echo "missing LUT: assets/luts/no_hurry_warm_memory_film.cube" >&2; missing=1; }
  tail -n +2 edit/source_inventory.tsv | while IFS=$'\t' read -r title bytes mime used note; do
    [ -z "$used" ] && continue
    dir=photos; [[ "$mime" == video/* ]] && dir=videos
    f="assets/$dir/$title"
    if [ ! -f "$f" ]; then echo "missing asset: $f" >&2; echo x >> work/.missing
    elif [ "$(stat -c %s "$f")" != "$bytes" ]; then echo "size differs from Drive original: $f" >&2; fi
  done
  [ -f work/.missing ] && { rm -f work/.missing; missing=1; }
  [ "$missing" = 0 ] || { echo "inputs incomplete" >&2; exit 1; }
  echo "inputs ok"
}

run_stage() {
  case "$1" in
    narration) say "narration (real recordings in assets/voiceover/ win over the synthetic draft)"; "$PY" tools/narration.py "$ROOT" ;;
    align)     say "word alignment (faster-whisper)"; HF_HOME="$ROOT/work/models/hf" "$PY" tools/align.py "$ROOT" ;;
    timeline)  say "timeline"; "$PY" tools/timeline.py "$ROOT" | tail -1 ;;
    grade)     say "colour: P3->sRGB, per-asset correction, LUT once (ffmpeg lut3d)"; "$PY" tools/grade.py "$ROOT" ;;
    sound)     say "sound design, score, mix"; "$PY" tools/sound.py "$ROOT" ;;
    captions)  say "captions + graphics"; "$PY" tools/subtitles.py "$ROOT" > work/captions_check.txt ;;
    film)      say "picture + encode"; "$PY" tools/encode.py "$ROOT" --preset slow ;;
    qa)        say "QA + stems"; "$PY" tools/qa.py "$ROOT" ;;
    *) echo "unknown stage $1" >&2; exit 1 ;;
  esac
}

mkdir -p work
setup
check_inputs
case "${1:-}" in
  --check) exit 0 ;;
  --only)  run_stage "$2" ;;
  --from)  go=0; for s in "${STAGES[@]}"; do [ "$s" = "$2" ] && go=1; [ $go = 1 ] && run_stage "$s"; done ;;
  "")      for s in "${STAGES[@]}"; do run_stage "$s"; done ;;
  *) echo "usage: $0 [--check | --only STAGE | --from STAGE]" >&2; exit 1 ;;
esac
