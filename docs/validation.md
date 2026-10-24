# Browser validation

The reference-style redesign is covered by **12 Playwright workflow checks**, using the installed `/usr/bin/chromium` against the actual Vite app on port 5173.

The full redesign run completed with 11 passing checks and one stale-selector failure after the archive title was moved from a caption into the large accessible hero heading during the run. That selector was updated to the new semantic heading; the affected carousel check then passed in its targeted rerun. No checks were skipped, disabled, or marked expected-failure. The initial blank-page failures were diagnosed as Vite's outdated dependency cache and resolved by restarting the dev server with forced dependency optimization.

Verified workflows:

- Frequency selection updates the fullscreen tuner and survives reload; the fixed Archive link routes directly to the catalogue.
- Keyboard `G` opens the searchable programme guide; selecting a transmission navigates to it; Escape closes the dialog.
- Archive search, frequency filter, empty-state reset, grid/schedule preference, and 14 non-clickable restoration entries.
- The featured archive carousel changes the visible project heading, the correct reader destination, and selection through previous/next and direct pagination controls.
- Editorial provenance disclosures, strategic note switch, and original-publication link.
- Inquiry required-field validation, public email, encoded email subject/body, browser-tab draft restore, and clearing the draft.
- The experiment locks its signal at 104 MHz and returns to static at another value.
- Mobile navigation, Escape, and modal keyboard focus: background controls remain outside the modal tab sequence (Chromium may briefly focus its browser chrome/body between cycles).
- Primary routes `/`, `/catalogue`, `/services`, `/about`, `/work/digistatement`, and `/work/game-prototype` do not overflow horizontally at 390px or 1440px widths.
- The cinematic hero, ink artwork, and original comic-panel artwork load, and the visible Explore the work control opens the actual guide.
- Hero title line bounds remain inside the first viewport at 1440×1000, 1280×800, and 390×844.

Review screenshots:

- `/tmp/itv-redesign-desktop.png` and `/tmp/itv-redesign-mobile.png` (full homepage).
- `/tmp/itv-redesign-desktop-top.png`, `/tmp/itv-redesign-laptop-top.png`, `/tmp/itv-redesign-mobile-top.png` (first viewport).

The email test replaces only the generated anchor's `click` method to capture the mailto URI. No email is sent and delivery is not claimed. These checks demonstrate the implemented client-side workflow; they do not establish permission for historical writing excerpts, public production deployment, mail-client availability on every device, or actual email delivery.

Final integrated redesign verification: a single complete browser run passed **12/12** tests with zero failures or skips; `npm test` passed **4/4** content checks. The production build passes. Final visual review also corrected the mobile mode switch, red ornament rendering, and monochrome header contrast.

Project-world expansion: **15/15 browser tests** pass, including traversal of all nineteen treatment routes, three chapters and six evidence slots per project, reference links, director notes, the native structure control, next-project navigation, the design-system guide and mobile width checks. Four content-invariant tests and the production build also pass. The remaining asset-dependent choreography is specified as proposed direction rather than claimed as finished client work.
