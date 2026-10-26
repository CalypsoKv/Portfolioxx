# NO HURRY: edit decisions, colour and sound

*The mathematics says the distance can never be finished. The film proves that someone can still arrive.*

Vertical 9:16, 1080×1920, 24 fps, 3:10.5 (narration 0:07–3:04, cut to black at 3:07.9).
**This is a draft cut. The narration is a synthetic placeholder voice** (see `no_hurry_voiceover_guide.md`).

## 1. Sources

The Google Drive folder **Zeno** (no subfolders) holds **31 files**: 20 camera photos (Samsung Galaxy A56),
8 WhatsApp photos and 3 WhatsApp videos. I retrieved 30 of them through the Drive connector as working copies,
each byte-identical in size to the original. The originals were never renamed, moved, re-shared or modified.

| Not used | Why |
|---|---|
| `VID-20260728-WA0012.mp4` (9.3 MB) | **Could not be retrieved.** The Drive connector returns files as one base64 message, and this file is too big for it. I neither saw nor used this clip. |
| `IMG-20260820-WA0007.jpg` | A phone screenshot with gallery UI baked in. It repeats the Aug 20 moment, which `IMG-20260820-WA0003` and the dance video already cover. |

The Drive folder held **no audio files, no narration recording and no LUT**. The LUT
`no_hurry_warm_memory_film.cube` came from the file attached to the conversation, copied unchanged
(33³ grid, 0–1 domain). Per-file usage is in `edit/source_inventory.tsv`.

The material turned out to be the film's argument. The camera photos are a series of real
**arrivals**, shot from the driver's seat on eight different days: Aug 28, Sep 22 (night), Oct 4 twice, Oct 9, 11, 12 and 14.
Each is a different outfit and the same act: she crosses the distance and gets in. Several days survive as bursts.
**Oct 12, 16:24:15 → :16 → :17 → :20 → :23** runs windshield, closer, closer, window, door: a
real Zeno sequence. Oct 4 (15:11:03 → :11) and Oct 11 (14:23:33 → :42) go from distant figure to arrival in seconds.

## 2. Structure

| Act | Time | What carries it |
|---|---|---|
| I · The Impossible Arrival | 0:00–0:28 | Black, ticking, then the windshield. A distant figure on two different days. Hard cut on **"Her."** to the sunlit smile at the open door, taken 8 seconds after the opening photo. The title on black. |
| II · Zeno's Division | 0:28–1:27 | The real Oct 12 approach, in order, a hard cut on every "half". Then the frame itself is halved: 2× and 3× punch-ins on the same photo. "The evidence" is shown as evidence: a gate, a street, the tarmac, the actual hazard switch. Ends with five windshield views from five days, one per hazard tick. |
| III · The Infinite In-Between | 1:27–2:03 | The Oct 11 approach builds the series ½ + ¼ + ⅛ + … and lands on her arrival at "exactly one". "A finite walk" is the real walk: the dusk piggyback video, slowed to 0.8×, with its own street sound. Then the hair in her face, the half-smile. |
| IV · A Hundred Different Women | 2:03–2:38 | Arrivals in different clothes, then an energetic montage on the beat. Navratri (Oct 20) is interleaved with ordinary days and nights rather than grouped. It ends on her hand raised at the window. |
| V · The Practical Proof | 2:38–3:10 | Back to the film's opening image. The pace slows, the music leaves after "Love is not the proof.", the hazard switch appears again, and the Oct 12 approach returns. "I am here." on her at the window; **"No hurry."** on the one frame Act II withheld: she arrives at the door. Ticking, cut to black, silence. |

The structural rhyme: Act II uses the Oct 12 sequence up to the window and never shows her arrive (the paradox).
The last shot of the film is the next frame from that same sequence (16:24:23), with nothing invented.

### Editorial constructions (stated plainly)

- **Punch-ins** (S08, S09, S28, S29, S15–S18, S37, S40): digital enlargements of one photograph, used as a formal
  device ("half of that"). They don't depict new moments.
- **The tick-flicker** (S21–S25) and the Act IV montage join photos from different days on purpose. The point
  is that they are different days.
- **"A gate." / "A street."** are two crops of the same Oct 11 frame.
- **The hazard switch** sits at the very bottom edge of its photo. So that it can be framed in the centre, the frame extends past the edge into black.
  Nothing is stretched or generated.
- **The car selfie** (M01) was stored rotated 90°. It is shown upright as a square insert over a blurred extension of itself.
- **The two dance clips** (M04, M09) are 4:3 landscape. Each is shown as a 3:4 crop over a darkened, blurred extension of the same frame.
- No footage, faces or events were synthesised. The only synthetic elements are the draft narration voice, the hazard tick,
  the room tone and the original score (§4).

Every cut is anchored to a narration word or the hazard-tick beat grid (`edit/manifest.json`). A real
recording therefore re-times the whole edit automatically. The full shot list is at the end of this document.

## 3. Colour

**Colour space first.** All 20 camera photos and one WhatsApp image carry a **Display P3** ICC profile.
Every photo is converted P3 → sRGB with LittleCMS (relative colorimetric with black-point compensation)
before any grading. The videos are decoded as BT.709 limited range. Output is tagged BT.709.

**Per-asset correction before the LUT** (`edit/grade.json`), in eight classes:

| Class | Used for | Treatment | LUT mix |
|---|---|---|---|
| interior | window/door shots from inside the car | **local** shadow lift (tone-mapped blurred base, so the interior opens without haze), soft highlight shoulder, slight contrast, greens −28% | 65% |
| windshield | street through the windshield | warm the cool windshield cast, shadow lift, shoulder for the sky, greens −32% | 70% |
| noon_cool | Oct 4 noon | stronger warm white balance | 65% |
| sunlit_skin | the sunlit arrivals | lighter lift, skin hues protected | 60% |
| night | Sep 22 night, Aug 20 night | slight exposure lift, gentle denoise | 60% |
| **navratri** | Oct 20 festival photos | almost untouched, saturation 1.02, no green muting | **45%** (keeps its colour) |
| day_memory, dusk_video, dark_video | WhatsApp days, dusk street, dark room | light touch; the dark room gets +0.45 EV, warmer balance and denoise | 55–60% |

**The custom LUT is applied exactly once**, in `tools/grade.py`, with FFmpeg's `lut3d` (tetrahedral) on
16-bit RGB. It is then mixed at the intensity above, as the LUT's own header recommends ("start at 50–70%").
The renderer only reads the graded files.

- **Cross-check:** FFmpeg's output matched an independent reading of the `.cube` to within 0.003/255.
- **QA:** a check confirms the LUT's signature (warmer highlights, cooler shadows) is present in every graded still.
- **Before/after:** frames were checked on bright, dark-interior, skin, night and Navratri images. The first pass
  looked hazy in the car interiors; I replaced the global shadow lift with a local one and re-checked.

**Texture, applied at output resolution:**

- diffusion: 20% on the sharp camera photos, 8% on WhatsApp images, none on video;
- faint warm halation around highlights;
- a 10% vignette;
- fine luma grain, strongest in the mid-tones and regenerated every frame;
- no light leaks, flares, shake or fake parallax.

## 4. Sound

| Element | Source | Notes |
|---|---|---|
| Narration | **Synthetic draft** (Kokoro-82M `am_michael`) | Name and Greek names re-phonemised. De-essed (zero-phase split), 3:1 voice compression. Replaceable (voice-over guide). |
| Hazard tick | **Synthesised** relay "tick/tock" | No recording of the real hazard lights existed. Cycle 0.72 s; it is also the score's tempo and the montage's cut grid. Stops dead at the cut to black. |
| Street ambience | **Authentic**: audio of `VID-20261005-WA0000` | Low-passed "through the glass" inside the car. Opens up on "A street.". Sync sound (time-stretched with the 0.8× picture, pitch kept) under the walk. |
| Room tone | Synthesised | A very low noise floor inside the car, so the silences are never digital zero. |
| Score | **Original**, synthesised in `tools/sound.py` | Felt piano and soft pad in D major, on the tick grid (83.3 bpm). Nothing until "Her.". In Act II a note on each "half", then a converging flourish. Low notes for the evidence. Ascending notes under "a half, a quarter, an eighth" resolve to a tonic chord on "exactly one". An eighth-note ostinato builds through Act IV with a soft pulse under the montage. It leaves completely after "Love is not the proof." |
| Dance-video audio | Not used | Contains music playback, probably a commercial recording, so it was left out to keep the film copyright-safe. |

There was no authentic Navratri audio (no festival video in the folder). The montage uses the original score's
soft pulse, which doesn't pretend to be festival sound.

**Mix:** the voice leads; the score sits 13–15 LU below it under speech (−12 dB ducking) and near voice
level in the wordless interludes. Master: **−16 LUFS integrated, −1.5 dBTP**, loudness range about 5 LU
(phone-friendly). The look-ahead limiter acts on under 1% of the programme. Stems (24-bit WAV) are pre-limiter,
loudness-matched to the mix, and kept at or below −0.2 dBFS.

## 5. Typography

- **Captions:** Inter Medium 50 px, warm off-white `#F4EDE1`, bottom-centred with a 330 px bottom margin and
  90 px side margins (safe on phones). At most two lines of 34 characters. Breaks follow phrase structure
  (never after an article, preposition or conjunction). Timed from word timestamps, with soft 160 ms fades.
  Every caption checks the picture behind it; only bright frames get the stronger soft shadow.
- **Emphasis** in Cormorant Garamond Medium Italic 78 px, for the seven phrases you named.
- **Section titles:** "NO HURRY" letter-spaced Cormorant on black, plus five small chapter markers at the top.
- **Two pieces of motion typography:**
  1. The **Zeno bar** in Act II: an 11-metre line where a dot covers half of what remains on each "half" (½, ¾, ⅞…). It converges and never arrives.
  2. The **series ½ + ¼ + ⅛ + … = 1**: each term appears on its spoken word. It sits in the upper third, the one
     band that stays clear of the gate's sign and of her face in all four shots.
- No karaoke, bouncing text, hearts or quote cards. Captions sit in the lower band, below the faces.
- `no_hurry_captions.srt` is plain and editable; `no_hurry_captions.ass` is the styled version. The master carries
  captions and graphics; the clean version carries the graphics (title, chapters, bar, series) but no captions.

## 6. Technical

Python (NumPy/OpenCV) renders every frame with sub-pixel crop motion from mip-mapped 16-bit sources (no
zoompan jitter) and pipes them to FFmpeg. libass burns the text. The encode is x264 High@4.2, CRF 19, capped at
10 Mbit/s, BT.709 tagged, with AAC 256 kbit/s 48 kHz and fast-start. `render.sh` reruns everything, or any one stage.

## 7. Known limitations

1. **Narration is synthetic.** Record it (guide included) and re-render; the edit follows your voice.
2. **One video was unreachable** through the connector (`VID-20260728-WA0012.mp4`, 9.3 MB). If you put it in
   `assets/videos/` (or share a smaller copy), I can review it for the cut.
3. **No authentic hazard, footstep, door or Navratri sound existed.** The tick is synthesised; the rest is left
   out rather than faked.
4. I can't listen to audio. I verified the sound by measurement only: loudness, true peak, spectra, ducking depth
   and limiter activity. A human listen on headphones and a phone speaker is still needed.
5. The source videos are low resolution (480×848 and 768×576 WhatsApp copies), so those moments are softer
   than the photos.
6. **Before posting publicly:** a residential society's name board is legible in the Oct 11 shots (S02, S11,
   S15, S21, S25–S29), and a car number plate is partly visible in a few street frames. That's fine for a private
   film. If you plan to post it widely, I can blur or reframe those details.

## Appendix: shot list

| Shot | In | Length | Source | Treatment / purpose |
|---|---|---|---|---|
| **I · The Impossible Arrival** | | | | |
| S01 | 0:00.0 | 14.4 s | 20261004_151103.jpg | push-in. Establishing: the windshield, the street, a distant figure on her phone (Oct 4, 15:11:03). Slow push-in. |
| S02 | 0:14.4 | 6.0 s | 20261011_142333.jpg | push-in. 'Hi, I am Jahan' - same POV, another day (Oct 11). She walks out of a residential gate. |
| S03 | 0:20.4 | 4.9 s | 20261004_151111.jpg | pull-back. 'Her.' - the reveal. Sunlit smile at the open door, 8 seconds after S01 was taken. Gentle pull-back, then hold. |
| S04 | 0:25.4 | 2.8 s | black | . Title card NO HURRY on black (graphics.ass). |
| **II · Zeno's Division** | | | | |
| S05 | 0:28.2 | 5.5 s | 20261012_162415.jpg | push-in, dissolve 0.5s. Zeno's division uses the real Oct 12 approach, in order: 16:24:15 -> :16 -> :17 (-> :20 later, -> :23 withheld until the last shot). |
| S06 | 0:33.7 | 2.0 s | 20261012_162416.jpg | push-in. Hard cut on 'half the distance'. |
| S07 | 0:35.7 | 2.3 s | 20261012_162417.jpg | push-in. Hard cut on 'half of what remains'. |
| S08 | 0:38.0 | 1.9 s | 20261012_162417.jpg | hold (punch-in 2.0x). Editorial construction: a 2x punch-in on the same frame - the picture itself is halved. |
| S09 | 0:39.9 | 2.3 s | 20261012_162417.jpg | push-in (punch-in 3.0x). Halved again ('The halves never run out'). |
| S10 | 0:42.2 | 4.4 s | 20261004_151104.jpg | push-in. Another day: she is mid-road, still far ('always a remainder'). |
| S11 | 0:46.6 | 6.1 s | 20261011_142335.jpg | push-in. 'stranded forever in the generous middle of the road' - Oct 11, mid-road. |
| S12 | 0:52.7 | 4.5 s | 20260922_024033.jpg | push-in. 'a puzzle about motion' - the night arrival (Sep 22, 02:40), motion-blurred in the original. |
| S13 | 0:57.3 | 4.9 s | 20260828_170926.jpg | push-in. 'a puzzle about waiting' - inside the car, she is outside the passenger window (Aug 28). |
| S14 | 1:02.1 | 2.2 s | 20261004_151103.jpg | push-in. 'Here is the evidence.' - the dashboard idol and the road beyond. |
| S15 | 1:04.4 | 1.4 s | 20261011_142333.jpg | hold (punch-in 2.3x). 'A gate.' - the gatehouse she walked out of. |
| S16 | 1:05.7 | 1.5 s | 20261011_142333.jpg | push-in (punch-in 2.1x). 'A street.' - the same Oct 11 frame as the gate, looking down the street. |
| S17 | 1:07.2 | 2.5 s | 20261004_151103.jpg | push-in (punch-in 2.1x). 'Eleven metres of tarmac.' - the road between the car and her. |
| S18 | 1:09.7 | 3.7 s | 20261012_162415.jpg | push-in (punch-in 3.2x). 'The hazard lights ticking.' - the real hazard switch (Oct 12). It sits at the photo's bottom edge, so the frame extends past it into black (no stretching). |
| S19 | 1:13.4 | 2.8 s | 20261012_162416.jpg | push-in. 'still somewhere in the first half'. |
| S20 | 1:16.2 | 5.8 s | 20261012_162420.jpg | push-in. '...by every known law of logic, impossible' - and yet there she is at the window (Oct 12, 16:24:20). |
| S21 | 1:22.0 | 0.7 s | 20261011_142335.jpg | hold. 'I have watched this hundreds of times' - the same windshield view on different days, one hazard tick each. |
| S22 | 1:22.7 | 0.7 s | 20261004_151103.jpg | hold |
| S23 | 1:23.4 | 0.7 s | 20261012_162417.jpg | hold |
| S24 | 1:24.1 | 0.7 s | 20261004_151104.jpg | hold |
| S25 | 1:24.9 | 2.0 s | 20261011_142333.jpg | push-in |
| **III · The Infinite In-Between** | | | | |
| S26 | 1:26.8 | 7.9 s | 20261011_142333.jpg | push-in, dissolve 1.0s. Mathematicians: the Oct 11 approach in order, 14:23:33 -> :35 -> :42. |
| S27 | 1:34.8 | 0.7 s | 20261011_142335.jpg | hold. 'a half' (the series typography builds above). |
| S28 | 1:35.4 | 0.6 s | 20261011_142335.jpg | hold. 'a quarter' - punch-in. |
| S29 | 1:36.1 | 1.5 s | 20261011_142335.jpg | hold (punch-in 2.4x). 'an eighth' - punch-in. |
| S30 | 1:37.6 | 2.3 s | 20261011_142342.jpg | push-in. 'and the total is exactly one' - she has arrived (14:23:42), smiling to herself. |
| S31 | 1:39.9 | 12.2 s | VID-20261005-WA0000.mp4 | hold. 'a finite walk' - the real walk: he carries her down a busy street at dusk (Oct 5). 30 fps shown at 24 fps = gentle 0.8x. Authentic sync sound. |
| S32 | 1:52.1 | 3.0 s | 20261009_162044(0).jpg | push-in. 'the hair in your face at the quarter mark' - literally (Oct 9). |
| S33 | 1:55.0 | 8.0 s | 20261004_125103.jpg | push-in. 'the half-smile you wear when you think nobody's watching' (Oct 4, noon). |
| **IV · A Hundred Different Women** | | | | |
| S34 | 2:03.1 | 3.0 s | 20260828_170927.jpg | pull-back, dissolve 0.8s. Heraclitus: arrivals from different days, different clothes. |
| S35 | 2:06.1 | 1.7 s | 20261004_125057.jpg | push-in |
| S36 | 2:07.8 | 4.6 s | 20261009_162043.jpg | pull-back |
| M01 | 2:12.4 | 1.8 s | IMG-20260818-WA0019.jpg | contained, blurred extension; push-in. Montage: Navratri interleaved with ordinary days. Car selfie (Aug 18) was saved sideways; shown upright as a square insert. |
| M02 | 2:14.2 | 1.4 s | IMG-20261020-WA0000.jpg | pull-back. Navratri (Oct 20). |
| M03 | 2:15.5 | 1.9 s | IMG-20260818-WA0016.jpg | push-in. Ordinary day (Aug 18). |
| M04 | 2:17.4 | 2.2 s | VID-20260820-WA0006.mp4 | contained, blurred extension; hold. Aug 20, dancing in white at home (original audio not used: it contains playback music). |
| M05 | 2:19.6 | 1.4 s | IMG-20261020-WA0010.jpg | pull-back. Navratri. |
| M06 | 2:21.0 | 1.4 s | IMG-20260828-WA0037.jpg | push-in. Aug 28, the same maroon outfit as S34. |
| M07 | 2:22.5 | 1.4 s | IMG-20260820-WA0003.jpg | pull-back. Aug 20, night. |
| M08 | 2:23.9 | 1.4 s | IMG-20261020-WA0012.jpg | push-in. Navratri. |
| M09 | 2:25.3 | 1.4 s | VID-20260820-WA0006.mp4 | contained, blurred extension; hold |
| M10 | 2:26.8 | 2.4 s | 20260828_170928.jpg | pull-back. Her hand raised at the window: hello. |
| S37 | 2:29.2 | 4.3 s | 20261004_151104.jpg | push-in (punch-in 2.2x). 'by standing up and walking' - her walking towards the car (Oct 4). |
| S38 | 2:33.5 | 4.2 s | 20261014_144251.jpg | pull-back. 'You answer him every time by getting in.' (Oct 14) |
| **V · The Practical Proof** | | | | |
| S39 | 2:37.7 | 12.4 s | 20261004_151103.jpg | push-in, dissolve 1.4s. Return to the opening image: the car, the street, the waiting. Pace slows. |
| S40 | 2:50.1 | 2.6 s | 20261012_162415.jpg | push-in (punch-in 2.8x). 'putting the hazards on' - the switch again. |
| S41 | 2:52.7 | 7.8 s | 20261012_162417.jpg | push-in, dissolve 0.6s. 'while she crosses the distance' - back to the Oct 12 approach Act II left unfinished. |
| S42 | 3:00.4 | 2.1 s | 20261012_162420.jpg | hold. 'I am here.' - static. |
| S43 | 3:02.6 | 5.3 s | 20261012_162423.jpg | pull-back. 'No hurry.' - she arrives (16:24:23), the frame Act II withheld. Hold on the ticking, then cut to black. |
| END | 3:07.9 | 2.6 s | black | Cut to black; ticking stops; silence |
