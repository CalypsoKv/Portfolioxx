# Jahan Patel · An independent frequency

The portfolio of Jahan Patel (writing, websites, brand design and AI-assisted animation), built as a television you tune. The whole site sits behind one fixed CRT screen (WebGL) that plays looping recordings of his live work, glitches between channels and switches off like an old set between pages. Real semantic HTML sits on top of it, with a static fallback underneath.

The look mixes two studied references, rebuilt in original code and with original art:

- the scroll theatre of hardikbhansali.com (one clock for GSAP, ScrollTrigger, Lenis and the render; a fixed canvas; muted looping video as the screen's picture; type that stays still while the world changes), and
- the hand-inked paper language of Santioni (wobbling ink borders, torn narrator cards, engraved plates, flat tones),

with retro screen type (Bodoni Moda display, Silkscreen on-screen labels, IM Fell print body, VT323 terminal). See [design language](docs/design-language.md).

## Develop

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev -- --port 5173
```

`npm run build` type-checks and builds `dist/`. `npm run preview` serves it. `vercel.json` carries the SPA fallback; other static hosts need the equivalent rewrite to `index.html`.

In development only, `?tier=full|lite|static` forces a capability tier. `?collect=1` on any channel shows the evidence checklist (file, source, permission) on every empty slot.

## Validate

```sh
npm test            # data, evidence, privacy, sitemap and asset-manifest checks
npm run test:e2e    # Playwright: workflows and axe accessibility
npm run build
```

Playwright starts Vite if needed and uses `CHROMIUM_PATH`, then `/opt/pw-browsers/chromium`, then Playwright's own browser. It never sends email. See [validation](docs/validation.md).

## How it is built

| Layer | Choice |
| --- | --- |
| App | Vite 6, React 19, React Router 7 (one layout route), TypeScript strict |
| Motion | GSAP 3 (ScrollTrigger, Draggable, InertiaPlugin, SplitText, ScrambleText), Lenis smooth scroll on the full tier, one `gsap.ticker` clock |
| Screen | three.js through React Three Fiber v9 with `frameloop="never"`; the shared ticker advances it. One fragment shader: barrel curve, scanlines, stepped grain, glitch bands with RGB split, a three-tone register map, slow drift on stills, and a pointer that bends the glass and splits the colour. Channels with a loop play a muted `VideoTexture` |
| Fallback | `StaticBackdrop` (CSS still with a register wash) for reduced motion, save-data, no WebGL or a lost context |
| Type | Bodoni Moda 900, Silkscreen, IM Fell DW Pica, VT323 (all local, via Fontsource) |

### Capability tiers

`src/motion/capability.ts` picks one tier per visit.

- **full**: fixed canvas, 960×540 loops, Lenis smooth scroll, glitch and power-cut transitions, adaptive quality from measured frame rate.
- **lite**: touch devices and low core or memory counts; same screen with 640×360 loops, lighter quality caps, native scroll.
- **static**: reduced motion, data saver, no WebGL or a lost context. No canvas, no video, no smooth scroll; the Home layers read as ordinary sections.

### Routes

- `/` a scroll theatre of five fixed layers: the name, the broadcaster (Jahan's engraved portrait with a chronophotograph trail), now showing (scrolling tunes through six featured channels; a tuner needle follows), the self-scrolling programme guide, and the close. No dots or chips: scrolling is the control.
- `/catalogue` the programme guide: search, frequency tabs, Guide and Wall views, the archive last.
- `/work/:slug` a channel. All 22 have a composition in `src/showcase/compositions.ts`, and each ends by handing over to the next channel: its picture takes the screen, and holding at the end tunes straight in.
- `/services`, `/about` (story, press photo and the wallet of press passes), `/design-system`.
- The plaque holds every control: Room and Work, the tuning dial (press for the guide, turn to tune), sound, Contact. `G` guide, `C` inquiry, `M` sound; shortcuts never fire while typing or inside an open dialog.

### Showcase system

Each channel is a list of blocks (`src/showcase/blocks.tsx`, `src/showcase/features.tsx`): reader, newspaper front page, draggable article slider, proof strip, website-copy specimen, flow, script page, burned-in statement, network, ledger terminal, works, strands, links, prototypes, credits, follow-on. Anything without evidence renders as a labelled empty slot rather than an invented artifact.

## Content integrity

Every channel carries a status that decides what the page may claim (`src/data/transmissions.ts`), and every title has a one-line record under it: role, context, evidence, link.

| Status | Meaning |
| --- | --- |
| published | Public byline or URL, checked on the live site (DigiStatement: 20 bylines, re-checked 28 Oct 2026). |
| reported | Role and results as reported on Jahan's CV (Reptrics, CustomerSuccessBox, Pepper Content, RedOrange.AI, Perspectiva, Origins). Not audited; team work. |
| cleared | Jahan's own files shown with his permission (Orma Health and Prem-a-Culture website copy, essays, Kink Studios, animation scripts and characters, Gyara Gyara). Other people's details in those files are left out. |
| owned | Badhuche is owned and operated. Urmila Ben Nu Rasodu is his mother's kitchen; he runs the marketing. NowTheo is a site, brand and community role, not his own practice. |
| analysis | Field reading of someone else's public work (Camden Imagines, Life Itself). No authorship claimed. |
| concept | Self-initiated concept or experiment, never presented as client work. |
| vault | Archive, evidence being restored (Perfect Pixel, role unconfirmed). |

Voices and awards (`src/data/proof.ts`) are empty on purpose: an entry needs a name, a permission note and a public source. A test fails if a phone number, a street address or the old site name appears in anything shipped. Only work Jahan cleared for publication is shown.

## Art and assets

Every shipped image and video is recorded in `src/data/assets.json` (origin, generator, permission, description). A test fails if an entry points at a missing file or lacks a description.

- 7 channel plates (000 to 006) were generated as engravings; 15 (007 to 021) are drawn in code (`scripts/plates/scenes.mjs`). All share one ink and cream duotone.
- The portrait assets are built from Jahan's own photo by `scripts/portrait/portrait.py` (the source photo is not committed: its edges show other guests).
- The screen loops are scroll recordings of the live sites (`scripts/video/`): a tall capture is panned down and back up, so each loop is seamless.
- `public/og.jpg` is rendered from the same art (`scripts/plates/og.mjs`).

```sh
node scripts/plates/render.mjs         # code-drawn scenes -> art-src/rendered
python3 -I scripts/plates/process.py   # normalise -> public/plates and thumbs
node scripts/video/capture.mjs         # live sites -> art-src/video/*.png
bash scripts/video/encode.sh           # -> public/video/*.mp4 (desktop and lite)
node scripts/plates/og.mjs             # public/og.jpg
node scripts/plates/manifest.mjs       # src/data/assets.json
node scripts/sitemap.mjs               # public/sitemap.xml
```

## Contact

Inquiry uses `jahandms60@gmail.com`. The validated form composes a `mailto:` draft; delivery happens in the visitor's email app. No backend and no fabricated "sent" state. A draft stays in session storage until cleared. Sound is off on every fresh load.

More: [content readiness](docs/content-readiness.md), [validation](docs/validation.md), [design language](docs/design-language.md).
