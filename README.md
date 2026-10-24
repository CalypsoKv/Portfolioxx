# Interdimensional TV

A portfolio for Jahan Patel that closely reconstructs Santioni Spirits’ visual structure: a charcoal opening with monumental uppercase type and flowing hatch marks, paper comic-panel scenes, and a vivid red archive where the receiver sits in front of oversized project titles. The reference was studied with the REA skill/CLI, production-source inspection, and compatibility-adjusted browser captures. Portfolio content and receiver artwork remain specific to Interdimensional TV.

## Develop

Requires Node.js 24 and npm. The checkout is `/workspace/Portfolioxx`.

```sh
npm ci --cache /tmp/npm-cache
npm run dev -- --port 5173
```

`npm run build` checks TypeScript and builds `dist/`. `npm run preview -- --port 4173` serves the production build. The Vercel configuration includes an SPA route fallback; other static hosts need the equivalent fallback to `index.html`.

## Validate

```sh
npm test
npm run test:e2e
npm run build
```

The browser suite uses `/usr/bin/chromium` in this cloud environment, starts Vite if necessary, and exercises navigation, search, filtering, the reader, inquiry composition, keyboard controls, and mobile behavior. It never sends an email. Reference screenshots became available after the user approved the managed proxy CA trust setup. Capturing the reference required removing its SwiftShader blocklist entry in a browser-local response; those captures are explicitly labelled compatibility-modified, with TLS verification intact. See the reference study for the evidence boundary.

## Site behavior

- `/`: cinematic charcoal title scene, flowing hatch marks, a paper comic-panel broadcast world, frequency tuning, optional procedural audio, and inquiry access. The fixed white Experience / Archive plaque mirrors the reference’s navigation treatment.
- `/catalogue`: red receiver-and-type archive composition, instant search, frequency filters, grid/schedule views, sort, and a separate restoration vault.
- `/work/:slug`: paper reading surface, source disclosures, strategic notes, share link, and a small playable frequency experiment.
- `/services` and `/about`: commissioning scope, working principles, and confirmed public contact.
- `G` opens the quick programme guide, `C` the inquiry console, `M` toggles sound. Shortcuts do not intercept typing or an open dialog.
- Inquiry uses `jahandms60@gmail.com`. The validated form composes a `mailto:` draft; delivery happens in the visitor's email app. No backend, credentials, or fabricated “sent” state. A draft stays in session storage until cleared or the browser tab is closed.
- Sound is off at every fresh load. Frequency and archive view are optional local preferences. Reduced motion disables parallax and transitions. Fonts and scene artwork are local; the portfolio requires no WebGL, third-party analytics, or runtime font service.

## Visual fidelity

Bodoni Moda provides an open-font approximation to the reference’s expressive Charles Rosie display lettering. The composition, palette, scale, comic framing, and mode plaque follow the observed design closely; the portfolio does not reproduce the exact proprietary title font or original 3D models. The original generated broadcast-world illustration is `public/art/the-broadcast-world.webp`.

## Content integrity and remaining launch work

The supplied document is a product/design brief, not evidence of completed deliverables. Its proposed six verified flagship projects are not treated as supplied content. All 19 original channel identifiers are retained, with five readable entries and fourteen unreleased archive entries. Only DigiStatement is identified as published writing, based on the PRD's reported byline; its reader contains newly written commentary, not an invented original article excerpt. Camden is field analysis with explicit unconfirmed-role disclosure. The three concept pages are labelled explorations; the frequency game was created for this implementation.

Before presenting this as a complete commercial archive, supply permission-cleared article excerpts and client artifacts, confirm credits, and promote entries in `src/data/transmissions.ts` only when supporting content is available. No rankings, traffic, revenue, customer outcomes, or client endorsements are fabricated.

See [reference study](docs/reference-study.md), [visual map](docs/reference-visual-map.md), [content readiness](docs/content-readiness.md), and [validation](docs/validation.md).
