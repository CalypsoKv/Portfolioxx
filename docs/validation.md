# Validation

Last full run: 28 October 2026, against the Vite dev server on port 5173 with Chromium under software WebGL (SwiftShader).

| Check | Result |
| --- | --- |
| `tsc` strict type-check | clean |
| `npm run build` | passes; main chunk 516 kB (169 kB gzip), lazy `Stage` chunk 930 kB (251 kB gzip) |
| `npm test` (7 node tests) | passing: 19-channel inventory, 8 live and 11 archive entries, status and provenance, owned roles, a composition for every channel, empty-by-default proof, asset manifest with files on disk |
| `npm run test:e2e` (23 Playwright tests) | passing |

## What the browser suite covers

- Home scroll theatre: dots move between layers, only the active layer is interactive, the featured chips retune the screen.
- First-visit preloader and keyboard entry.
- Programme guide: `G` opens, search, navigate, Escape closes, reopens after a navigation.
- Catalogue: frequency filter, search, empty state and reset, Guide and Wall views, saved view, archive last.
- All 19 channels render, state their provenance and have no horizontal overflow at 390px.
- Placeholder slots, and `?collect=1` showing the evidence checklist.
- Owned channels state the real role and link out; NowTheo is never called Jahan's own practice.
- Reader provenance and the strategic-notes toggle.
- Inquiry: required-field validation, encoded `mailto:` subject and body, session draft restored after reload. The `mailto:` navigation is intercepted; no email is sent.
- The tuning game locks at 104 MHz and restarts.
- Static tier and reduced motion: no canvas, no Lenis, every Home layer visible.
- Full tier mounts exactly one canvas without page errors.
- Primary routes fit at 390px and 1440px.
- axe-core (WCAG 2 A and AA, 2.1 AA) finds no serious or critical violations on eight routes in the static tier. It reports on the DOM, not on the canvas.

## Not verified

- **Frame rate on real hardware.** All rendering here ran on a software rasteriser. Adaptive quality is implemented but its thresholds are untuned against a real GPU.
- **Contrast over the live canvas.** axe runs in the static tier; text over the moving screen was checked by eye in screenshots only.
- **Screen readers.** Focus management (skip link first on load, the new heading focused after a route change) and the live-region title announcement are implemented and checked in the browser, not tried with a screen reader.
- **Safari and Firefox.** Only Chromium was run.
- **Production behaviour of `?tier=`.** The override is stripped from production builds by design, so the tiers are tested on the dev server.
