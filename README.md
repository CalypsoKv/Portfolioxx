# Interdimensional TV

A portfolio for Jahan Patel, built as a television you tune. The whole site sits behind one fixed CRT screen (WebGL) that glitches between channels, with real semantic HTML on top of it and a static fallback underneath.

The look is a deliberate mix of two studied references, rebuilt in original code and with original art:

- the scroll-theatre technique of hardikbhansali.com (one clock for GSAP, ScrollTrigger, Lenis and the render; a fixed canvas; type that stays still while the world changes), and
- the hand-inked paper language of Santioni (wobbling ink borders, torn narrator cards, engraved plates, flat tones),

with retro screen type (Bodoni Moda display, Silkscreen on-screen labels, IM Fell print body, VT323 terminal). See [design language](docs/design-language.md) for what was studied, what was reproduced, and what was deliberately not copied.

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
npm test            # data, provenance and asset-manifest checks
npm run test:e2e    # Playwright: workflows and axe accessibility
npm run build
```

Playwright starts Vite if needed and uses `CHROMIUM_PATH`, then `/opt/pw-browsers/chromium`, then Playwright's own browser. It never sends email. See [validation](docs/validation.md) for what is and is not covered.

## How it is built

| Layer | Choice |
| --- | --- |
| App | Vite 6, React 19, React Router 7 (one layout route), TypeScript strict |
| Motion | GSAP 3 + ScrollTrigger, Lenis smooth scroll (full tier only), one `gsap.ticker` clock |
| Screen | three.js through React Three Fiber v9 with `frameloop="never"`; the shared ticker advances it. One fragment shader: barrel distortion, scanlines, stepped grain, glitch bands with RGB split, three-tone register map |
| Fallback | `StaticBackdrop` (CSS plate with a register wash) for reduced motion, save-data, no WebGL or a lost context |
| Type | Bodoni Moda 900, Silkscreen, IM Fell DW Pica, VT323 (all local, via Fontsource) |

### Capability tiers

`src/motion/capability.ts` picks one tier per visit.

- **full**: fixed canvas, Lenis smooth scroll, glitch transitions, adaptive quality from measured frame rate.
- **lite**: touch devices and low core or memory counts; same screen, lighter quality caps, native scroll.
- **static**: reduced motion, data saver, no WebGL or a lost context. No canvas, no smooth scroll, the Home layers read as ordinary sections.

### Routes

- `/` a 700vh scroll theatre of five fixed layers (opening, broadcaster, choose a frequency, on the guide, open a channel). Inactive layers are `inert`.
- `/catalogue` the programme guide: search, frequency filters, Guide and Wall views, unreleased channels last.
- `/work/:slug` a channel. All 19 have a composition in `src/showcase/compositions.ts`.
- `/services`, `/about`, `/design-system`.
- `G` quick-tune guide, `C` inquiry, `M` sound. Shortcuts never fire while typing or inside an open dialog.

### Showcase system

Each channel is a list of blocks (`src/showcase/blocks.tsx`): reader, step rail, network, ledger terminal, works, strands, links, prototypes, proof, credits, next signal. Anything without evidence renders as a labelled "No signal" slot rather than an invented artifact.

## Content integrity

Every channel carries a status that decides what the page may claim (`src/data/transmissions.ts`):

| Status | Meaning |
| --- | --- |
| owned | Owned or built by Jahan. Badhuche and Urmila Ben Nu Rasodu are owned and operated. NowTheo is a site, brand and community role, not Jahan's own practice. |
| published | Published writing (DigiStatement, from the byline in the supplied brief). |
| analysis | Field analysis. Camden Imagines states that no authorship is claimed. |
| concept | Self-initiated concept or experiment, never presented as client work. |
| vault | Archive, evidence being restored. A designed placeholder only. |

Voices and awards (`src/data/proof.ts`) are empty on purpose. An entry needs a name, a permission note and a public source before it appears. No rankings, traffic, revenue, outcomes or endorsements are invented. Owner-supplied Badhuche images are used with the owner's stated permission and listed in `src/data/assets.json`.

## Art and assets

Every shipped image is original to this project and recorded in `src/data/assets.json` (origin, generator, prompt, permission, alt text). Nothing is copied from the reference sites. A test fails if a manifest entry points at a missing file or lacks alt text.

- 7 channel plates (000 to 006) were generated as engravings, then post-processed into the shared ink and cream duotone.
- 12 channel plates (007 to 018) are drawn in code (`scripts/plates/scenes.mjs`). Their generated versions are queued: prompts and seeds are in `art-src/plate-prompts.json`, and the generator quota ran out during the build.
- `public/og.jpg` and `public/favicon.svg` are rendered from the same art.

Rebuild the plates:

```sh
node scripts/plates/render.mjs         # code-drawn scenes -> art-src/rendered
python3 -I scripts/plates/process.py   # normalise -> public/plates and thumbs
node scripts/plates/og.mjs             # public/og.jpg
node scripts/plates/manifest.mjs       # src/data/assets.json
```

## Contact

Inquiry uses `jahandms60@gmail.com`. The validated form composes a `mailto:` draft; delivery happens in the visitor's email app. No backend and no fabricated "sent" state. A draft stays in session storage until cleared. Sound is off on every fresh load.

More: [content readiness](docs/content-readiness.md), [validation](docs/validation.md), [design language](docs/design-language.md).
