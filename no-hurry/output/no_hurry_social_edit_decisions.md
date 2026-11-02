# NO HURRY: social cut. Edit decisions

The social cut is a 2:24 vertical edit, re-cut from the same story for Reels, TikTok and Shorts. It is built as an
editable **Remotion Studio** project. Output: 1080×1920, 30 fps, H.264 + AAC, mastered to −14 LUFS and −1 dBTP.

The 3-minute film from the first pass is unchanged. This cut is a second edit, with a different rhythm and grammar.

## 1. Style brief (from the reference reel)

The reference reel was downloaded with yt-dlp **for analysis only**. It stays in a private scratch folder and is not
redistributed or committed. What I took from it:

| Reference | What NO HURRY does with it |
|---|---|
| Word-by-word kinetic type. Each phrase has **one oversized key word** among small supporting words | Every spoken phrase builds word by word, on the frame it is spoken. Key words are set at 120–240 px and slam in on a spring. Supporting words rise in at 45–57 px |
| Key words in a few saturated colours: yellow, electric blue, white | Amber `#FFB000` for the argument's stakes (*arrived, impossible, hazard, one, getting in*). Ink `#3D2BFF` for Zeno's division (*simple*, set on a cream box, then *half* and *remains*). Cream and white for the rest. Magenta `#FF2D87` for the collage |
| Tiny date stamps, quotes and sub-captions | Mono labels (*ZENO OF ELEA · c. 490–430 BC*, *EXHIBITS A–D*), chapter tags, and orange camera-style date stamps in the memories montage |
| Calm B-roll interludes between talking moments | Generated illustrative B-roll (bust, runner, tortoise, hourglass, river, Diogenes, hazard switch), each used where the voice names an idea, never as a fake memory |
| An even cut rhythm with a soft music bed | Cuts sit on spoken words. Interrupts land on the hazard relay's grid (0.72 s, 83.3 BPM). The score is written on the same grid |

Additions in the language of current essay-style editors:

- black **interrupt cards** at each turn of the argument;
- **type behind her**, using cut-out mattes;
- a dot-and-line **Zeno diagram** drawn over the real windshield photos;
- an **evidence board** of slammed polaroids;
- a **flicker** count-up ("hundreds of times");
- a magenta **stop-motion collage** ("hundred arrivals");
- a zoom **stutter** ("the halves never run out");
- **glitch hits** on "impossible";
- whip, zoom and dip transitions, flashes and one light leak.

### Philosophical cadence

The script is the same 34 lines. The delivery changes:

- each line is synthesised whole, so it keeps natural sentence intonation;
- a breath gap is opened at every comma, colon and mid-line full stop (0.22–0.42 s), placed from Whisper word timings;
- the voice is lowered 1.5 semitones with formants preserved, warmed with EQ and given a small room;
- the gaps between lines are tight (0.25 s) through the argument and held where the picture must land: 2.4 s after
  "Her.", 4.6 s for the montage, 1.4 s before "Love is not the proof."

The result is 116 s of speech at about 146 words per minute.

## 2. Storyboard

The storyboard has 43 beats in five chapters. The single source of truth is `edit/social/storyboard.py`. The panel
sheets and the Studio timeline are both generated from it, so they cannot drift apart.

| Act | Time | Beats | Grammar |
|---|---|---|---|
| I · the impossible arrival | 0:00–0:14.7 | B01–B07 | Cold open on black and the tick. The marble Zeno. The distance drawn as a line on the windshield photo. "Her." set **behind her** in serif. Flash to the title |
| II · Zeno's division | 0:14.7–1:05.1 | B08–B24 | Each halving is a new dot on the same line, with "½ left" and "¼ left". A 2× punch-in, then a 3×/4×/2.4× zoom stutter. Tortoise B-roll for "remainder". Black card "waiting." Evidence board. Hazard switch pulsing with the real tick. Flicker count-up ×001→×100 |
| III · the infinite in-between | 1:05.1–1:34.7 | B25–B31 | Black card "Mathematicians". The series ½ + ¼ + ⅛ + … builds while the picture punches in 1.05×→1.6×→2.4× on the words; it lands on "one." The real dusk walk at 0.8×. A light leak into the tender close-ups (hair, half-smile) |
| IV · a hundred different women | 1:34.7–2:00.0 | B32–B37 | Heraclitus' river. "Same car" quick cuts. A magenta collage of her cut-outs from eight moments, swapping every 4 frames. A memories montage cut on half-beats with date stamps. Diogenes walks. "getting in." |
| V · the practical proof | 2:00.0–2:23.8 | B38–B43 | The music leaves. Black card "Love is not the proof." in serif. Only the tick remains. The hazard switch again. The dot finishes the line as "never" is struck through. "I am here." Then **"No hurry." behind her**, the one chord returns, and a cut to black |

The panel sheets and an HTML version are kept privately with the renders, because they contain the photographs.

## 3. Picture

- **Her face is preserved.** Every image of her is one of her real photographs or videos. There is no generative
  editing, face restoration, AI upscaling, face swap or re-synthesis anywhere.
- **Cut-outs.** The cut-outs for type-behind-her and the collage are alpha mattes (BiRefNet portrait), applied to the
  same finished photograph. The pixels of her inside the matte are the photo's own pixels. Stray matte islands are
  removed. Cut-outs where the car frame was caught in the matte were left out of the collage.
- **Clean, sharper, more punch.** All of these are classical finishing applied to the whole frame:
  - chroma denoise;
  - local contrast ("clarity", weighted to the mid-tones);
  - a gentle S-curve;
  - vibrance that protects skin hues;
  - threshold-gated luma unsharp masking at screen scale.

  Videos also get temporal denoise and a Lanczos upscale (480×848 → 1088×1920). The dusk walk is still soft: that is
  the source resolution.
- **Resolution.** Photos the edit pushes into get full 3000×4000 plates, so a 2.4× punch stays sharp. The 4× stutter
  frames are the limit of the source.
- **LUT, still once.** The photographs and video frames come from the first pass's grade, where the custom LUT was
  applied once. The generated B-roll had the same LUT applied once, at 55 %, so it sits in the same colour world.
  Nothing in Remotion applies a LUT.
- **Legibility.**
  - Soft scrims at the top or bottom of a photo appear only when type sits there.
  - Small serif lines are set 1.3× larger, because Cormorant's x-height is small.
  - Type stays out of the bottom 380 px and the right-hand icon column of the Reels interface.
- **Two "behind her" placements were dropped after test renders.** "impossible." and the first draft of "No hurry."
  were more than half hidden by her. "impossible." moved in front, onto the dark door. "No hurry." moved up, so only
  the bottom of "hurry." passes behind her hair.

## 4. Sound

All music and effects are original. They were synthesised for this film, so the cut is copyright-safe.

- **Score.**
  - Felt piano, pad, sub and soft drums on the 0.72 s grid, in D minor and F major.
  - The energy follows the acts: air, pulse, drive, peak.
  - In the series beat the note values literally halve until they land on "one."
  - The score leaves at "Love is not the proof." Only one chord returns, on "No hurry."
  - Side-chain ducking under the voice is baked in: about 7 dB.
- **Hazard relay.** A synthesised tick (lamp on) and tock (lamp off) every 0.72 s. It is level-automated, loud in the
  cold open, on "The hazard lights ticking" and in Act V, and it stops at the cut to black. The hazard switch's glow
  follows the same clock.
- **SFX.** 14 synthesised sounds: whooshes in both directions, a reversed whoosh, two impacts, a pop, glitch,
  stutter, swell, shutter, flicker and two risers. They are placed from the storyboard, 33 hits in total.
- **Ambience.** Authentic street sound from `VID-20261005-WA0000` sits under the real walk.
- **Master.** The Remotion mix is set at −14 LUFS integrated, with a 4×-oversampled look-ahead limiter at −1 dBTP,
  then AAC at 320 kb/s, encoded once.
- **Stems.** Voice, music, sfx + tick and ambience are exported as WAV files with the same master gain.

## 5. The narration is still a synthetic DRAFT

The voice is **not your voice and not a recording of anyone**. It is Kokoro-82M (`am_michael`), processed as described
in section 1, and it is a placeholder. The voice lives as 34 separate clips on the Studio track
"Voice (synthetic draft)".

To use your own voice:

1. Put `assets/voiceover/full_take.m4a`, or `L01.m4a` … `L34.m4a`, in place
   (see `no_hurry_voiceover_guide.md`).
2. Run `./render_social.sh`.

Your recording gets the same breath spacing but no pitch change. Every word pop, cut and SFX re-times to it.

## 6. Remotion Studio

The Studio project is the editable version of this cut. Open it with `./render_social.sh --studio`, or
`cd studio && npm run dev`.

- **Composition.** `NoHurrySocial` is 1080×1920 at 30 fps, 4314 frames.
- **Picture.** One `TransitionSeries` named "Picture" holds the 44 beats. Each beat contains its plate, scrim,
  behind-type, cut-out, front type, labels and chapter tag as separate nodes, all with inline literal props.
- **Tracks.** Voice (34 clips), SFX 1–3, Music, Hazard relay and Street.
- **Components** (`studio/src/nohurry/`). Each component is made with `Interactive.create`, so it is selectable and
  movable, and its schema fields can be edited in Studio:
  - `PhotoShot`: Ken Burns, stutter, punch-ins, glitch, hazard pulse and Zeno diagram;
  - `CutoutLayer`;
  - `KineticPhrase`;
  - `EvidenceBoard`;
  - `FlickerShot`;
  - `CollageCutouts`;
  - `MontageShot`;
  - `TitleCard`;
  - `MonoLabel`;
  - `ChapterTag`;
  - `Scrim`;
  - `Flash`;
  - `LightLeak`;
  - `Finish` (grain and vignette).
- **Transitions.** Whip, zoom-punch and dip are CSS-only custom presentations, so the film renders on a CPU-only
  machine.
- **Regenerating.** `NoHurrySocial.tsx` is generated by `tools/build_studio.py`. Re-running the generator overwrites
  it, so keep big changes in `edit/social/storyboard.py`. Small nudges made in Studio are fine to keep as long as you
  do not regenerate.

### Skills used

- **Remotion's published agent skills, v4.0.540, read rather than vendored:**
  - best practices;
  - interactivity: editable timeline structure and inline props and effects;
  - markup: transitions, effects, video editing, timing props, images and local fonts;
  - multimedia;
  - render;
  - license.
- **Process skills:** using-superpowers and verification-before-completion.

**Remotion licence:** Remotion is free for individuals and small teams. A company needs a company licence. Check
https://www.remotion.dev/docs/license before commercial use.

## 7. What is generated, and what is real

| Real (from the Drive folder "Zeno") | Generated or synthesised (labelled as such) |
|---|---|
| All photographs and videos of her, the car, the street | B-roll illustrations: marble bust, bronze runner, tortoise, hourglass, river, Diogenes, hazard switch (Z-Image Turbo) |
| Street ambience under the dusk walk | Narration (draft voice), score, tick, all SFX |

No generated image depicts her, the narrator or the actual events. The B-roll only illustrates the ideas the voice
names: Zeno, Heraclitus, Diogenes, the tortoise, the hourglass, the hazard lights.

## 8. Limits and blockers

- **Narration.** It is still synthetic. See section 5.
- **Public-domain art.** Wikimedia rate-limited the requests (HTTP 429). The one public-domain portrait that came
  through (Heraclitus) was 334×292, too small for 1080×1920, so the river B-roll carries the Heraclitus label instead.
- **Image generation.** The free GPU quota for the image model ran out after 8 images. A "corridor" plate was never
  made, and the requested arrow came out as a feather, which is unused.
- **Missing video.** The 9.3 MB video in the Drive folder still cannot be downloaded through the connector, so it is
  not in this cut.
- **Source resolution.** The WhatsApp videos are 480×848 and 768×576, so they stay softer than the photos.
- **Collage.** Three cut-outs (`170927`, `170928`, `162420`) caught part of the car frame and were left out of the
  collage.
