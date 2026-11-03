# NO HURRY: motion lab (side experiment)

**The note.** The stills felt static and incohesive: each photo had its own Ken Burns, so the cut read like a
slideshow.

**The question.** How do strong editors make stills feel like footage, and does that work for these photos?

**Where it lives.** This is a side experiment. The delivered social cut is untouched. The experiment is a separate
Studio composition, `NoHurrySocialMotion` (folder "Side-experiments"), plus a before/after reel.

## What strong editors do to stills

| Technique | What it does | Used here |
|---|---|---|
| **3D photo / depth parallax** | A depth map (white near, black far) turns the photo into a scene a virtual camera can move through. Near things move more than far ones, so a still reads as a camera move. The usual advice is to keep it subtle: slow push-ins, gentle drifts | ✔ every photo and B-roll beat |
| **Layer separation (2.5D)** | The subject is cut onto its own layer and the background behind it is rebuilt. The layers move at different speeds, so the camera can look a little "around" the subject without smearing | ✔ she, the car interior and the street are separate layers. The street behind her and behind the car is filled by an inpainting model (LaMa) |
| **Stop-motion from bursts** | Sequential photos are aligned on the background and cut on the beat. The world stays still while the subject jumps forward, so it reads as time passing in one shot | ✔ `162415 → 162416 → 162417` are aligned on the street. She steps forward on each "half", and the Zeno line shortens with her |
| **One camera language** | Every shot uses the same lens and the same move speed, so the cut feels shot rather than assembled | ✔ the same eased push, the same gentle depth of field, rack focus only where the story turns ("Her.") |
| **Light that lives on the beat** | Practical light in the scene flickers with the rhythm | ✔ the hazard lamp flashes amber on the car interior on the real relay grid (0.72 s), the same clock as the tick you hear |
| **Camera reacting to the edit** | The frame kicks on the beat when a key word lands | ✔ a 3.5 % zoom bump on every key word, settling in a quarter second |
| Atmosphere | Dust in sunbeams, grain | ✔ sunlit dust in the car (never over her face); the existing grain and vignette |

## Her face

Her face is preserved.
- **She is never warped.** She is a rigid layer: uniform scale and position only, the same as a Ken Burns on her
  alone. The depth warp only bends the car and the street.
- **No generative tools touched her.** No AI video generation, face restoration or upscaling was used. The inpainting
  model only fills background that was hidden behind her or behind the car.
- **Her pixels are not regenerated.** Rack focus can briefly soften her, as a real lens would. Nothing else in her is
  changed.

**Why not AI image-to-video?** Those tools "animate" a photo by re-generating every frame, her face included. The face
drifts from frame to frame. That breaks the one thing you asked to keep, and it would invent footage of a real person.

## How it is built

| Path | What it is |
|---|---|
| `edit/social/motion.py` | which beats move, and how: push, depth strength, drift, focus, hazard, dust, burst order |
| `tools/motion_lab.py` | the renderer. It covers depth (Depth Anything V2 small, ONNX), the near/her/far layers, LaMa fill, the depth camera, rack focus, the hazard light, dust, diagrams and glitch hits. Output: `studio/public/motion/*.mp4` (private) |
| `tools/matte_hint.py` | her matte when she is small in the frame: BiRefNet runs on a crop around her |
| `tools/build_studio.py --motion` | writes `studio/src/NoHurrySocialMotion.tsx`: the same edit, with `MotionPlate` clips in the photo beats. Where type sits behind her, her cut-out follows the plate's rigid move (`rig`) |
| `tools/motion_compare.py` | before/after reel: the same stretches of the film as delivered, then as the side version |

```sh
.venv/bin/python tools/motion_lab.py "$PWD"                 # all plates (CPU, about 1.5 s per frame per worker)
.venv/bin/python tools/build_studio.py "$PWD" --motion
.venv/bin/python tools/motion_compare.py "$PWD" output/no_hurry_social_9x16.mp4 output/no_hurry_motion_lab.mp4
```

## Limits

- **Disocclusion.** Depth parallax only works for small moves. Bigger moves reveal places no photo ever saw. The fill
  there is a plausible guess, so the moves stay small.
- **Small figures.** When she is small in the frame (the windshield shots), her matte is less precise at the edges.
  At that size it is not visible.
- **Plates are baked.** The plates are rendered video. The Zeno diagrams and glitch hits are baked into them, so in
  this side version they are no longer editable as Studio props. Type, sound and transitions still are.
