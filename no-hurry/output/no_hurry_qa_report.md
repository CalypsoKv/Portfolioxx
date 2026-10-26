# NO HURRY - automated QA report

Film duration 190.49 s; cut to black at 187.89 s.

- PASS no_hurry_master_9x16.mp4: H.264 1080x1920 (High, yuv420p)
- PASS no_hurry_master_9x16.mp4: 24/1 fps
- PASS no_hurry_master_9x16.mp4: colour tagged BT.709 (tv range)
- PASS no_hurry_master_9x16.mp4: 1 audio stream, AAC stereo 48 kHz
- PASS no_hurry_master_9x16.mp4: duration 190.49s (timeline 190.49s)
- INFO no_hurry_master_9x16.mp4: 233.1 MB, 9.79 Mbit/s overall
- PASS no_hurry_master_9x16.mp4: decodes end-to-end without errors
- PASS no_hurry_clean.mp4: H.264 1080x1920 (High, yuv420p)
- PASS no_hurry_clean.mp4: 24/1 fps
- PASS no_hurry_clean.mp4: colour tagged BT.709 (tv range)
- PASS no_hurry_clean.mp4: 1 audio stream, AAC stereo 48 kHz
- PASS no_hurry_clean.mp4: duration 190.49s (timeline 190.49s)
- INFO no_hurry_clean.mp4: 232.9 MB, 9.78 Mbit/s overall
- PASS no_hurry_clean.mp4: decodes end-to-end without errors
- INFO black segments: 0.00-2.42s, 25.67-28.04s, 187.92-190.42s
- PASS no unexpected black frames
- PASS encoded audio loudness -16.1 LUFS integrated (target -16)
- PASS encoded audio true peak -1.4 dBTP (ceiling -1.0)
- INFO loudness range 4.9 LU
- PASS ticking audible after the last line (-37.3 dBFS RMS)
- PASS silence after the cut to black (-96.7 dBFS RMS)
- PASS music removed after 'Love is not the proof' (-76.8 dBFS RMS from +4 s to the cut)
- PASS 51 captions: no overlaps, none shorter than 0.5 s, max two lines
- PASS caption lines <= 34 characters
- PASS every caption word appears in the script (spelling)
- PASS LUT signature present in all 27 graded stills (highlights warmer by 5.5/255, shadows cooler by 0.8/255 vs pre-LUT)
- PASS LUT applied in exactly one place (grade.py), renderer reads graded files only
- INFO contact sheet (63 frames, every 3 s): work/qa/final_contact_sheet.jpg
- INFO stems: no_hurry_ambience_fx.wav, no_hurry_mix.wav, no_hurry_music.wav, no_hurry_narration_SYNTHETIC_DRAFT.wav

**23 passed, 0 failed.**
