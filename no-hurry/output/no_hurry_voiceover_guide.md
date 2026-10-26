# NO HURRY: voice-over guide

> **Status of the current cut:** the narration you hear is a **synthetic placeholder voice**
> (Kokoro-82M, voice `am_michael`, generated locally on CPU). It is **not your voice**. I used it only to time
> the picture, the captions and the music. No recording of your voice existed in the Drive folder "Zeno",
> so none was used. The film ends with a small on-screen note saying so. That note disappears
> automatically once every line comes from a real recording.

## How to replace it (phone-friendly)

**Option A: one take (easiest).** Record the whole script in one go in your phone's voice-memo app. Pause
naturally between lines; the film's timing comes from the script, not from your pauses. Name the file
`full_take.m4a` and put it in `assets/voiceover/` (or upload it to the Drive folder "Zeno" and ask Claude to fetch it).
The pipeline transcribes it, finds each line, cuts it out and re-times the whole film around your delivery.
A dry run of this splitter, using the draft lines joined into one long take, found 34 of 34 lines.
The median cut boundary error was 70 ms.

**Option B: one file per line.** Name the files `L01.m4a` … `L34.m4a` (wav/mp3/flac also work). Any line that
has a file wins over Option A and over the draft voice, so you can re-record a single line.

Then run `./render.sh` (or ask Claude to re-render). Every cut, caption and music cue is anchored to your
words, not to clock times, so your pacing re-conforms the edit automatically.

## Recording on a phone

- **Room:** small and soft. A wardrobe, a bedroom with curtains and a bed, or a parked car with the engine off
  (fitting, and surprisingly dead acoustically). Avoid tiled bathrooms and kitchens. Fans and ACs off.
- **Distance:** phone 15–20 cm from your mouth, mic pointed at your chin rather than straight at your lips
  (this softens "p" and "b" pops). Keep the same distance for the whole take.
- **Level:** speak at the volume you'd use across a small table. If the app shows levels, peaks around
  −12 dB with nothing hitting the top.
- **Phone:** airplane mode, notifications off, case off if it rattles.
- **Takes:** read each paragraph twice. Leave about 1 second of silence before you start and after you finish.
- **Format:** the app default (m4a/AAC) is fine; WAV 48 kHz is ideal if offered.

## Delivery

Conversational, close and unhurried: a private letter that happens to have an argument in it. Don't perform
the philosophy. Let the ideas be a little amused with themselves ("How reassuring." is dry, almost a smile).
The draft voice runs at about 148 words per minute; a natural human pace here is 125–140. Slower is fine,
because the edit stretches with you.

- **"Her."** One word, softer and lower than everything before it. Breathe before it. The picture cuts on it.
- **The halves (L05–L08):** even, patient, almost a metronome. Each "half" lands a cut.
- **"A gate. A street. Eleven metres of tarmac."** Separate, plain, like evidence laid on a table.
- **L20:** "a half, a quarter, an eighth" are counted; the typography appears on each word. Land on "exactly one".
- **L25:** the most intimate line in the film. Quieter, slower, closer to the phone.
- **"Love is not the proof."** Then a real pause. The music leaves after this line.
- **"I am here. No hurry."** The quietest words in the film, against the hazard ticking. Don't push the ending.

**Pronunciation:** Zeno *ZEE-no* · Heraclitus *heh-ruh-KLY-tus* · Diogenes *dye-OJ-in-eez* ·
Jahan *juh-HAAN* (the draft uses this).

**Name:** your notes say "Jahan/Calypso". The draft says **Jahan**. If you'd rather say Calypso, say it in your
recording and change `"narrator_name"` in `edit/script.json` so the caption matches.

## The script (as timed in this cut)

Punctuation is corrected for natural delivery; the wording is yours. *Italic* phrases are set in the
serif emphasis style in the captions. Times are from the draft and will move with your recording.

| Line | Starts | Draft length | Pause after | Text |
|---|---|---|---|---|
| L01 | 0:07.0 | 5.7 s | 2.0 s | Twenty-five centuries ago, a man named Zeno proved that *nothing ever arrived.* |
| L02 | 0:14.7 | 4.2 s | 1.5 s | Hi. I am Jahan, and something impossible happened to me. |
| L03 | 0:20.5 | 0.6 s | 7.5 s | *Her.* |
| L04 | 0:28.6 | 1.9 s | 0.7 s | Zeno's argument is simple. |
| L05 | 0:31.2 | 3.7 s | 0.6 s | To reach any place, you must first cover half the distance. |
| L06 | 0:35.4 | 1.8 s | 0.5 s | Then half of what remains. |
| L07 | 0:37.7 | 1.3 s | 0.9 s | Then half of that. |
| L08 | 0:39.9 | 1.8 s | 0.6 s | The halves never run out. |
| L09 | 0:42.3 | 8.7 s | 2.0 s | There is always a remainder, and the remainder has a remainder, so the traveller is stranded forever in the generous middle of the road. |
| L10 | 0:53.0 | 3.9 s | 0.5 s | For centuries, this was treated as a puzzle about motion. |
| L11 | 0:57.4 | 2.6 s | 2.2 s | I submit it is *a puzzle about waiting.* |
| L12 | 1:02.2 | 1.5 s | 0.7 s | Here is the evidence. |
| L13 | 1:04.4 | 0.9 s | 0.5 s | A gate. |
| L14 | 1:05.8 | 1.0 s | 0.5 s | A street. |
| L15 | 1:07.3 | 1.9 s | 0.6 s | Eleven metres of tarmac. |
| L16 | 1:09.7 | 1.7 s | 2.2 s | The hazard lights ticking. |
| L17 | 1:13.6 | 7.0 s | 1.3 s | And you, still somewhere in the first half, which makes you, by every known law of logic, impossible. |
| L18 | 1:21.9 | 2.3 s | 4.5 s | I have watched this hundreds of times. |
| L19 | 1:28.7 | 2.8 s | 0.6 s | Mathematicians eventually rescued us. |
| L20 | 1:32.2 | 6.6 s | 1.4 s | Add every half together, they said: a half, a quarter, an eighth, and the total is exactly one. |
| L21 | 1:40.1 | 2.7 s | 0.6 s | *The infinite fits inside a finite walk.* |
| L22 | 1:43.3 | 1.3 s | 1.8 s | How reassuring. |
| L23 | 1:46.4 | 2.3 s | 0.5 s | But the sum only measures how far. |
| L24 | 1:49.2 | 2.4 s | 0.6 s | It cannot say what the in-between is like: |
| L25 | 1:52.2 | 6.3 s | 5.0 s | the hair in your face at the quarter mark, the half-smile you wear when you think nobody's watching. |
| L26 | 2:03.6 | 3.8 s | 0.6 s | Heraclitus said no one steps into the same river twice. |
| L27 | 2:07.9 | 3.0 s | 1.5 s | Nobody gets into the same car twice, either. |
| L28 | 2:12.4 | 4.9 s | 12.0 s | *Hundred arrivals, hundred different women,* and every single one of them you. |
| L29 | 2:29.4 | 3.6 s | 0.6 s | Diogenes answered Zeno by standing up and walking. |
| L30 | 2:33.6 | 2.6 s | 4.6 s | You answer him every time by getting in. |
| L31 | 2:40.8 | 1.8 s | 3.0 s | *Love is not the proof.* |
| L32 | 2:45.6 | 12.0 s | 3.0 s | Love is the practical, slightly awkward, repeated action of putting the hazards on and sitting there while she crosses the distance that logic says can never be finished. |
| L33 | 3:00.6 | 1.1 s | 1.0 s | *I am here.* |
| L34 | 3:02.7 | 1.2 s | (end) | *No hurry.* |

The pauses are edit decisions: they hold the "Her." reveal and title, the chapter changes, the 12-second Navratri montage
after L28, and the silence in Act V. Change them in `edit/script.json` (`"pause"`), not by pausing longer
in the recording.
