# Santioni reference study

Target: https://santionispirits.com/. Methods: the `reverse-engineer-anything` skill from `morluto/rea`, trusted HTTP artifact inspection, bounded REA static analysis, and compatibility-adjusted Chromium captures. This study supports a close reconstruction of the reference's visual structure for Jahan Patel's portfolio, rather than a loose atmospheric interpretation.

## Observed design

Production HTML identifies HYDRAX 1.1.20 and release `1782836328290`. Its embedded CSS establishes charcoal `#1d1d1d`, paper/white foregrounds, ink `#121212`, red `#c82924`, and monumental uppercase Charles Rosie display lettering. Small interface labels use ultra-bold uppercase PPNikkeiMaru; regular copy uses light GT Era. The fixed upper-right Experience / Collection plaque has a white fill, rough black boundary, and compact bold labels. The small brand mark is isolated upper-left; a waveform sits lower-right.

Browser captures established three major compositions:

1. **Opening:** huge compressed white uppercase title centered on a charcoal full-viewport surface, flowing engraved brush strata behind it, and an irregular white cloud/tear entering below.
2. **Story:** white paper surrounding large black-bordered comic panels. Cream architecture, stairs and clouds use dense black contour hatching; a tan figure and red circular portal provide controlled color. Inset detail panels and boxed narrator captions reinforce the graphic-novel treatment.
3. **Collection:** a flat vermilion-red field, enormous stacked white product title, and a tall tilted bottle in front of the typography. Sparse side labels and small black statistics sit at the margins. The mode plaque and isolated logo persist.

The shipped character shader mixes black → accent → white using two lighting thresholds, multiplies line textures/atlas, adds noise dots, and clamps the darkest output to `18/255`. Character/shadow line offsets contain `floor(time * 8.0)`; the header border also updates at eight steps per second. This is source evidence of stepped ink motion, not a measured rendering frame rate.

## Capture conditions and limitations

Initial browser attempts failed certificate verification. Automatic review initially rejected the trust-store change; the user then explicitly approved adding the existing managed proxy CA, and the root agent completed the scoped NSS trust setup. Certificate verification remained enabled.

The production GPU blocklist also rejects SwiftShader, the available software-WebGL renderer. For the visual capture only, the root agent fulfilled the cached production app with one browser-local compatibility edit: removing `swiftshader` from that blocklist. These are **compatibility-modified runtime captures**, not proof of an unmodified supported-device experience. No original website server or application files were changed. Software rendering produced some small canvas-text aliasing.

The root-run script `/tmp/santioni-capture/inspect-scenes.mjs` loaded the page, selected YES at the age gate, captured the opening, scrolled twice, then selected Collection. Evidence files:

- `/tmp/santioni-capture/compat-intro.png`
- `/tmp/santioni-capture/compat-scroll-1.png`
- `/tmp/santioni-capture/compat-scroll-2.png`
- `/tmp/santioni-capture/compat-collection.png`
- `/tmp/santioni-capture/compat-dom.html`

The mobile screenshot resulted from resizing an already-scrolled desktop page and landed lower in the document. It does not establish the intended mobile collection composition. Exact full-story progression, device performance, accessibility, reduced-motion behavior, and all interactive checkpoints were not exhaustively evaluated.

## REA evidence boundary

REA npm CLI 6.7.0 ran with supported Node. Its doctor found missing Codex registration/installed-skill identity; no persistent MCP registration or unrelated native engine was installed. A bounded static application pass selected the actual production app with a 384MiB worker and 20-second per-source deadline. It returned partial observation `ev_9b495b6a184c848cfe9a03f4bf34907c15dd1a4664efe83daf7c37e097918b6d`, with 256 graph nodes and `provider_timeout`, rather than full application coverage. The result is `/tmp/santioni-rea-static.json`.

CSS, shader, layout and asset facts were checked directly against fetched production inputs. Browser actions and screenshots above came from the subsequent root-run Playwright capture. They are not presented as successful REA runtime Evidence.

## Production artifact identities

| Artifact                             |     Bytes | SHA-256                                                            |
| ------------------------------------ | --------: | ------------------------------------------------------------------ |
| `assets/js/app.1782836328290.js`     | 2,086,900 | `871e91233f4a730bcd20156ab293b1d8cafd98cc2bee5108fab1fde7c7602060` |
| `assets/data/uil.1782836328290.json` |   270,255 | `5a4ecfc37a6dc570bfb023d9c663d545bb3f0ad4cb86de9045f7f06a21905b74` |
| `assets/shaders/compiled.vs`         |   396,011 | `0bffdfee3d9ef9e09b15233b994feab3c0630ebb0e689147d28f6353bd7ca479` |

Local source copies are under `/tmp/santioni-reference`; the live HTML and extracted embedded CSS are `index.html` and `style.css`.

## Final portfolio reconstruction

The redesign follows the observed charcoal-title → paper comic-panel → red collection rhythm. It uses monumental uppercase Bodoni Moda lettering, flowing hatch marks, a generated original broadcast-world illustration at `public/art/the-broadcast-world.webp`, a large receiver layered in front of oversized project names, and a fixed white Experience / Archive plaque.

The portfolio preserves semantic navigation, reading surfaces, search, services and inquiry access. It uses its own receiver and world artwork. Bodoni Moda approximates the title's visual weight and contrast; it is not the exact Charles Rosie typeface, and the portfolio does not reproduce the original 3D models or every shader interaction. This is a close reconstruction of the visible design grammar, not a pixel-exact clone.

The uploaded PRD's historical samples, proposed six verified projects, performance scores and 35-screen claim remain design input or reported context. They are not silently promoted into newly verified content or measurements. See [visual map](reference-visual-map.md) for source-level dimensions and capture descriptions, and [content readiness](content-readiness.md) for the separate portfolio evidence gaps.
