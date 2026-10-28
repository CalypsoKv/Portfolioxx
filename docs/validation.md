# Validation

Last full run: 28 October 2026, against the Vite dev server on port 5173 with Chromium under software WebGL (SwiftShader).

| Check | Result |
| --- | --- |
| `tsc` strict type-check | clean |
| `npm run build` | passes; main chunk 647 kB (213 kB gzip), lazy `Stage` chunk 932 kB (252 kB gzip). Screen loops: 5 × 0.5–0.8 MB (desktop) and 0.3–0.4 MB (lite), loaded only for the channel on screen |
| `npm test` (12 node tests) | passing: 22 channels (the original 19 kept, three added), 21 live and 1 archive entry, each evidence status kept distinct, owned and family roles, role and context on every reported channel, 20 dated public bylines, every composition block has its data, https links, empty-by-default proof, no phone number, street address or old name in anything shipped, manifest entries with files on disk (plates, portrait, loops), robots and sitemap |
| `npm run test:e2e` (37 Playwright tests) | passing |

## What the browser suite covers

- Home: scrolling changes the featured channel (no dots or chips exist), only the active layer is interactive, the close layer is reachable, the portrait renders.
- First-visit preloader and keyboard entry.
- The plaque is the only control surface: Room, Work, the dial (opens the guide), sound, Contact. The old bottom bar is gone.
- Programme guide: `G` opens, search, navigate, Escape closes, reopens after a navigation.
- Catalogue: frequency tabs, search, empty state and reset, Guide and Wall views, saved view, archive last.
- All 22 channels render, state their evidence and have no horizontal overflow at 390px.
- The record under each title (role, context, evidence, link).
- Placeholder slots on the archive channel, and `?collect=1` showing the evidence checklist.
- Owned channels state the real role and link out; the kitchen is described as Jahan's mother's; NowTheo is never called his own practice.
- Reader notes in view without a toggle; Camden states that no authorship is claimed.
- DigiStatement front page: 20 checked bylines linking to the live articles.
- Article slider moves with the arrow keys; its links go to the published pieces.
- Press passes turn over to their proof and back.
- Every channel hands over to the next one; on the full screen a channel change runs the power cut and the overlay is hidden again afterwards.
- Inquiry: required-field validation, encoded `mailto:` subject and body, session draft restored after reload. The `mailto:` navigation is intercepted; no email is sent.
- The tuning game locks at 104 MHz and restarts.
- Static tier and reduced motion: no canvas, no Lenis, every Home layer visible.
- Full tier mounts exactly one canvas without page errors.
- Primary routes fit at 390px and 1440px.
- Share tags, robots.txt and the sitemap are served.
- axe-core (WCAG 2 A and AA, 2.1 AA) finds no serious or critical violations on thirteen routes in the static tier. It reports on the DOM, not on the canvas.

## Checked by eye

Screenshots at 1440×900 (full tier) and 390×844 (lite and static) of every home layer, the newspaper, the proof strip, the flow, the slider, the copy specimen, the script page, the statement, the wallet and the follow-on. Text over the bright website loops was too weak at first; the screen now dims under type (0.38 on channel pages, 0.42 on the home channel layer).

## Not verified

- **Frame rate and video decoding on real hardware.** All rendering here ran on a software rasteriser. Adaptive quality is implemented but its thresholds are untuned against a real GPU.
- **Autoplay on iOS in Low Power Mode.** A loop that refuses to play falls back to the channel's still; this path is implemented but was not exercised on a device.
- **Contrast over the live canvas.** axe runs in the static tier; text over the moving screen was checked by eye in screenshots only.
- **Screen readers.** Focus management and the live-region title announcement are implemented and checked in the browser, not tried with a screen reader.
- **Safari and Firefox.** Only Chromium was run.
- **Production behaviour of `?tier=`.** The override is stripped from production builds by design, so the tiers are tested on the dev server.
