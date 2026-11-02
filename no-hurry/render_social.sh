#!/usr/bin/env bash
# NO HURRY - the social cut (9:16, 30 fps), edited in Remotion Studio. CPU only.
#
#   ./render_social.sh                  everything below, in order
#   ./render_social.sh --from studio    re-run from a stage
#   ./render_social.sh --only render    run one stage
#   ./render_social.sh --studio         open Remotion Studio on the generated timeline (http://localhost:3000)
#
# Stages
#   narration   philosophical-cadence narration (real recordings in assets/voiceover/ win over the synthetic draft)
#   timeline    lines laid on the 30 fps social timeline (tight pauses, held breaths where the picture must land)
#   cutouts     her mattes (BiRefNet) for type-behind-her and the collage - mattes only, pixels stay photographic
#   assets      finished photos / b-roll / cut-outs / video into studio/public (private, git-ignored)
#   sound       original score, hazard tick, SFX, street ambience, polished voice lines
#   storyboard  panel sheets + HTML from edit/social/storyboard.py (private: contains photos)
#   studio      edit/social/storyboard.py -> studio/src/NoHurrySocial.tsx (editable Remotion timeline)
#   render      Remotion render (H.264 + PCM)
#   master      -14 LUFS / -1 dBTP master, AAC, MP4 + stems
#   qa          specs, loudness of the encoded file, black frames, beat changes -> output/no_hurry_social_qa_report.md
#
# Needs: the main pipeline's graded photos (./render.sh --only grade), Node 20+, FFmpeg, Python 3.
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$PWD"
PY="$ROOT/.venv/bin/python"
STAGES=(narration timeline cutouts assets sound storyboard studio render master qa)
RENDER="work/social/render/no_hurry_social.mkv"

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

fonts() {
  # Plus Jakarta Sans, Cormorant Garamond, JetBrains Mono - all SIL Open Font License, from Google Fonts
  mkdir -p assets/fonts
  get() {  # family css-query weight style outfile
    [ -s "assets/fonts/$5" ] && return
    local url
    url=$(curl -sS "https://fonts.googleapis.com/css2?family=$2" | tr -d '\n' | grep -oE "font-style: $4;[^}]*font-weight: $3;[^}]*url\([^)]+\)" \
      | grep -oE "url\([^)]+\)" | head -1 | sed 's/^url(//; s/)$//')
    [ -n "$url" ] && curl -sS -o "assets/fonts/$5" "$url" || echo "warning: could not fetch $1 $3 $4" >&2
  }
  get "Plus Jakarta Sans" "Plus+Jakarta+Sans:wght@500;700;800" 500 normal PlusJakartaSans-500.ttf
  get "Plus Jakarta Sans" "Plus+Jakarta+Sans:wght@500;700;800" 700 normal PlusJakartaSans-700.ttf
  get "Plus Jakarta Sans" "Plus+Jakarta+Sans:wght@500;700;800" 800 normal PlusJakartaSans-800.ttf
  get "Cormorant Garamond" "Cormorant+Garamond:ital,wght@1,600;1,700" 600 italic CormorantGaramond-600Italic.ttf
  get "Cormorant Garamond" "Cormorant+Garamond:ital,wght@1,600;1,700" 700 italic CormorantGaramond-700Italic.ttf
  get "JetBrains Mono" "JetBrains+Mono:wght@500" 500 normal JetBrainsMono-Medium.ttf
}

setup() {
  for t in ffmpeg node npm python3 curl; do command -v "$t" >/dev/null || { echo "missing tool: $t" >&2; exit 1; }; done
  [ -x "$PY" ] || { echo "run ./render.sh --check first (it creates .venv)" >&2; exit 1; }
  "$PY" -c "import rembg" 2>/dev/null || .venv/bin/pip install -q "rembg==2.0.86"
  ls work/graded/*.png >/dev/null 2>&1 || { say "graded photos missing: running the main grade"; ./render.sh --only grade; }
  fonts
  [ -d studio/node_modules ] || (cd studio && npm ci)
}

cutouts() {
  # one process per photo: BiRefNet's onnxruntime arena grows across images (14 GB after two), a fresh process does not
  local photos
  photos=$("$PY" - "$ROOT" <<'EOF'
import sys
sys.path.insert(0, "tools")
from social_common import Social
S = Social(sys.argv[1])
need = set()
for b in S.beats:
    v = b["visual"]
    if v["kind"] == "behind":
        need.add(v["src"])
    if v["kind"] == "collage":
        need.update(v["cutouts"])
print("\n".join(sorted(need)))
EOF
)
  while read -r stem; do
    [ -s "work/social/cutouts/${stem}_mask.png" ] && continue
    "$PY" tools/cutouts.py "$ROOT" birefnet-portrait "$stem.jpg" 2>&1 | grep -v "%|" | tail -1
  done <<< "$photos"
}

run_stage() {
  case "$1" in
    narration)  say "narration (synthetic draft unless assets/voiceover/ has your recording)"; HF_HOME="$ROOT/work/models/hf" "$PY" tools/narration_social.py "$ROOT" ;;
    timeline)   say "social timeline"; "$PY" tools/social_timeline.py "$ROOT" | tail -1 ;;
    cutouts)    say "her mattes"; cutouts ;;
    assets)     say "finished picture assets -> studio/public"; "$PY" tools/social_assets.py "$ROOT" ;;
    sound)      say "score, tick, sfx, ambience, voice polish"; "$PY" tools/sound_social.py "$ROOT" ;;
    storyboard) say "storyboard sheets"; "$PY" tools/storyboard_sheets.py "$ROOT" | tail -1 ;;
    studio)     say "Remotion timeline"; "$PY" tools/build_studio.py "$ROOT"; (cd studio && npx tsc --noEmit -p .) ;;
    render)     say "Remotion render"; mkdir -p work/social/render
                (cd studio && npx remotion render NoHurrySocial "../$RENDER" --codec=h264-mkv --audio-codec=pcm-16 --crf=15 \
                   --x264-preset=slow --color-space=bt709 --concurrency="${CONCURRENCY:-4}" --image-format=jpeg --jpeg-quality=95 --log=error) ;;
    master)     say "master"; "$PY" tools/master_social.py "$ROOT" "$RENDER" output/no_hurry_social_9x16.mp4 --stems output/stems/social \
                  --upload output/no_hurry_social_9x16_upload.mp4 ;;
    qa)         say "QA + captions file"; "$PY" tools/social_srt.py "$ROOT"; "$PY" tools/qa_social.py "$ROOT" output/no_hurry_social_9x16.mp4 ;;
    *) echo "unknown stage $1" >&2; exit 1 ;;
  esac
}

setup
case "${1:-}" in
  --studio) cd studio && exec npx remotion studio ;;
  --only)   run_stage "$2" ;;
  --from)   go=0; for s in "${STAGES[@]}"; do [ "$s" = "$2" ] && go=1; [ $go = 1 ] && run_stage "$s"; done ;;
  "")       for s in "${STAGES[@]}"; do run_stage "$s"; done ;;
  *) echo "usage: $0 [--studio | --only STAGE | --from STAGE]" >&2; exit 1 ;;
esac
