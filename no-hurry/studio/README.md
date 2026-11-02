# NO HURRY: Remotion Studio project (social cut)

This is the editable timeline of the 9:16 social cut. It is 1080×1920 at 30 fps and 4314 frames (2:23.8).

```sh
cd no-hurry
./render_social.sh            # build everything and render output/no_hurry_social_9x16.mp4
./render_social.sh --studio   # open Remotion Studio at http://localhost:3000
```

## What is where

| Path | What it is |
|---|---|
| `src/NoHurrySocial.tsx` | **Generated** timeline: the "Picture" `TransitionSeries` (44 beats) plus audio tracks: Voice (synthetic draft), SFX 1–3, Music, Hazard relay, Street |
| `src/nohurry/PhotoShot.tsx` | Photo plate with Ken Burns, zoom stutter, punch-ins, glitch hit, hazard-lamp pulse on the real relay grid, and the Zeno dot-and-line diagram. Also `CutoutLayer`: her matte, locked to the plate's move |
| `src/nohurry/KineticPhrase.tsx` | Word-by-word type: key words slam in on a spring, others rise in; strike-through, glitch, highlight box |
| `src/nohurry/Interrupts.tsx` | `EvidenceBoard`, `FlickerShot` (with count-up), `CollageCutouts`, `MontageShot` (date stamps) |
| `src/nohurry/Cards.tsx` | `TitleCard`, `MonoLabel`, `ChapterTag`, `Scrim`, `Flash`, `LightLeak`, `Finish` (grain + vignette) |
| `src/nohurry/transitions.tsx` | CSS-only `whip`, `zoomPunch` and `dip` presentations (no WebGL, so the film renders on CPU) |
| `src/nohurry/fonts.ts` | Plus Jakarta Sans, Cormorant Garamond and JetBrains Mono, all SIL OFL, loaded from `public/fonts` |
| `public/` | **Private media, git-ignored.** Written by `tools/social_assets.py` and `tools/sound_social.py` |

## Editing

- Every clip, phrase, label and sound is its own node with **inline literal props**. Studio can select, move, trim
  and restyle each one. The schema fields (plate brightness, type shadow, grain and vignette, title text and colour,
  scrim strength) and the transform controls are editable in the panel.
- The timeline is generated from `edit/social/storyboard.py` by `tools/build_studio.py`. Re-running the generator
  **overwrites** `NoHurrySocial.tsx`. Put structural changes in the storyboard (beats, words, colours, anchors,
  transitions, SFX) and use Studio for nudges.
- `PhotoShot` and `CutoutLayer` in a "behind her" beat must keep the same `fr`/`to` move, or the matte will slide.
- Music ducking is baked into `public/audio/score.wav`. If you move voice lines a long way, re-run
  `./render_social.sh --only sound`.
- The Remotion mix keeps 5 dB of headroom. `./render_social.sh --only master` brings the render to −14 LUFS,
  −1 dBTP.

## Replacing the draft voice

The voice clips are a **synthetic placeholder**. To use real recordings:

1. Put them in `assets/voiceover/`, as `full_take.*` or `L01.*` … `L34.*`.
2. Run `./render_social.sh`.

The narration, timeline, word pops, cuts, ducking and SFX positions all re-time.

## Licence

Remotion has its own licence: free for individuals and small teams, while companies need a company licence. See
https://www.remotion.dev/docs/license.
