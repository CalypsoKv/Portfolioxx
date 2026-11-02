# NO HURRY social cut: QA report

Automated checks of the encoded file `output/no_hurry_social_9x16.mp4`, made by `tools/qa_social.py`.
Contact sheets of mid-beat frames are kept privately (`work/social/qa/`).

- PASS video h264 1080x1920
- PASS pixel format yuv420p
- PASS frame rate 30/1
- PASS colour tags bt709/bt709/bt709
- PASS 4314 frames (timeline 4314)
- PASS duration 143.80s (timeline 143.79s)
- PASS audio aac 48000 Hz 2 ch
- PASS encoded loudness -14.0 LUFS integrated (target -14)
- PASS encoded true peak -1.1 dBTP (ceiling -1.0)
- INFO loudness range 2.7 LU
- PASS black stretches only on black cards (5 found)
- PASS picture changes across 43 beat boundaries

**All checks passed.**
