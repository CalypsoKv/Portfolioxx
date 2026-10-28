# Design language

The visual direction is a mix of two studied references, expressed in original code and original art. Nothing from either site's files, 3D models, fonts or copy is used.

## What was studied

| Reference | How it was examined | Evidence boundary |
| --- | --- | --- |
| hardikbhansali.com | REA CLI (`analyze-javascript-application`, `capture-browser-scenario`) over the production bundle and a headless browser session | Software WebGL only, so no real-GPU frame rate was measured. The dependency graph was capped at 20k nodes. Findings describe technique, not source. |
| Santioni (`saahiyo/santioni-rev`) | Repository read plus the earlier REA/browser study | The reference is a reconstruction of a live site, so its details are secondhand. |

## Techniques taken, and where they live

- **One clock.** `gsap.ticker` drives Lenis, ScrollTrigger, the screen render and the stepped ink seed. `src/motion/clock.ts`.
- **A fixed screen behind everything.** One full-viewport canvas for the whole site; the DOM above it stays real text. Plates are textures; a channel change is glitch up, swap, glitch down. `src/stage/`.
- **Type holds still, the world moves.** Home is a 700vh track with five fixed layers shown by ScrollTrigger windows, not a stack of scrolling sections. `src/routes/Home.tsx`.
- **Tiered capability.** Full, lite and static, with adaptive screen quality from measured frames. `src/motion/capability.ts`, `src/stage/Stage.tsx`.
- **Hand-inked paper.** SVG displacement filters wobble the `::before` borders of every card, plaque and button; the seed steps at 8 fps so it boils like redrawn ink. `src/shell/InkDefs.tsx`.
- **Flat tone registers.** A three-tone colour map retunes the plate per channel: natural, red (Badhuche), turmeric (Urmila Ben Nu Rasodu), blue (NowTheo). `src/stage/registers.ts`.
- **Retro screen type.** Bodoni Moda 900 for display, Silkscreen for on-screen labels, IM Fell DW Pica for print, VT323 for terminals.

## What was not copied

No file, geometry, shader, copy or font from either reference. Bodoni Moda is an open font standing in for expressive Didone display lettering. The CRT shader, the glitch bands, the ink filters, the channel plates and the showcase blocks were written for this project.

## Art

Plates are engraved line art in one ink and cream duotone. Seven were generated and twelve are drawn in code; see the README for the rebuild commands and `src/data/assets.json` for provenance. Every plate has alt text and a recorded origin.

## Motion and accessibility rules

- Reduced motion, save-data, no WebGL and a lost context all land on the static tier: no canvas, no smooth scroll, the layers read as normal sections.
- Inactive Home layers are `inert`.
- After a route change focus moves to the new `h1` and the title is announced; the first load leaves focus alone so the skip link is the first Tab stop.
- Sound is off until the visitor turns it on. All sounds are procedural.
- Text never sits only on the canvas. Every stage image has a DOM twin or is decorative.
