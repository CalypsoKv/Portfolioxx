# NO HURRY

A short vertical essay film (9:16, 1080×1920, 24 fps, about 3 minutes) that turns Zeno's paradox into a love letter.

This folder holds the **reproducible edit**: the script, the edit decision list, the colour decisions, the render code
and the captions. **None of the private media is in the repository.** Photographs, videos, recordings, the custom LUT,
renders and stems are git-ignored and stay with their owner (Google Drive folder "Zeno").

| Path | What it is |
|---|---|
| `edit/script.json` | narration lines (L01–L34), designed pauses, emphasis phrases |
| `edit/manifest.json` | the edit: shots anchored to spoken words or to the hazard-tick beat grid, crops and moves |
| `edit/grade.json` | per-asset colour correction before the custom LUT, and LUT intensity |
| `edit/source_inventory.tsv` | every file in the Drive folder, its size, which shots use it |
| `render.sh` | runs the whole pipeline, or one stage at a time |
| `tools/` | narration · align · timeline · grade · sound · subtitles · render_frames · encode · qa |
| `output/no_hurry_captions.srt` / `.ass` | editable captions / styled captions |
| `output/no_hurry_voiceover_guide.md` | how to record the real narration (one phone take is enough) |
| `output/no_hurry_edit_decisions.md` | asset choices, edit rationale, colour, sound, typography, limitations |
| `output/no_hurry_qa_report.md` | automated checks of the last render |

## Re-render

Put the working copies in `assets/photos/`, `assets/videos/` and the LUT in `assets/luts/`, then:

```sh
./render.sh            # narration -> align -> timeline -> grade -> sound -> captions -> film -> qa
./render.sh --from sound
./render.sh --check
```

You need FFmpeg with `lut3d` and libass, plus Python 3. The script creates `.venv` and fetches the draft-voice model
and the Cormorant Garamond font (both openly licensed). It runs on CPU only.

To use your own voice, put `assets/voiceover/full_take.m4a` (one take of the whole script), or `L01.m4a` … `L34.m4a`,
and re-run `./render.sh`. Every cut and caption re-times to the recording.

## Social cut (Remotion Studio)

There is a second edit for Reels, TikTok and Shorts: 1080×1920, 30 fps, 2:24. It uses kinetic word-by-word type,
type set behind her, interrupt cards, a Zeno diagram over the real photos, an evidence board, a flicker count-up, a
stop-motion collage, whips and zooms, an original score on the hazard-relay grid, and a philosophical-cadence draft
voice. It is an editable **Remotion Studio** project.

| Path | What it is |
|---|---|
| `edit/social/storyboard.py` | the storyboard: 43 beats, each with picture, type, transition, SFX and notes. The single source of truth |
| `studio/` | Remotion project. `src/NoHurrySocial.tsx` is generated from the storyboard; components are in `src/nohurry/` (see `studio/README.md`) |
| `render_social.sh` | narration → timeline → cut-outs → assets → sound → storyboard sheets → Studio timeline → render → master |
| `tools/*social*.py`, `tools/cutouts.py`, `tools/build_studio.py`, `tools/storyboard_sheets.py` | the stages |
| `output/no_hurry_social_edit_decisions.md` | style brief, storyboard, picture/sound decisions, what is generated vs real, limits |

```sh
./render_social.sh            # everything (needs the main grade; it runs it if missing)
./render_social.sh --studio   # edit in Remotion Studio
./render_social.sh --from studio
```

Node 20+ is needed for the Studio and render stages.
