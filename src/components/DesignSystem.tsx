import { Link } from "react-router-dom";
import { TreatmentIndex } from "./ProjectTreatment";
import "./project-treatment.css";
const references = [
  [
    "Santioni Spirits",
    "https://santionispirits.com/",
    "Primary visual structure: ink, monumental type, comic panels, object-over-title collection.",
  ],
  [
    "Stripe Press",
    "https://press.stripe.com/",
    "Physical artifact presentation paired with literary reading.",
  ],
  [
    "The Pudding",
    "https://pudding.cool/",
    "Progressive explanation of complex research.",
  ],
  [
    "Emil Kowalski",
    "https://emilkowal.ski/",
    "Responsive, interruptible interaction timing.",
  ],
  [
    "Julian Shapiro",
    "https://www.julian.com/guide/write/intro",
    "Reading hierarchy and optional editorial commentary.",
  ],
  [
    "Vercel guidelines",
    "https://vercel.com/design/guidelines",
    "Focus, state feedback, form behavior, and interface detail.",
  ],
  [
    "GOV.UK Design System",
    "https://design-system.service.gov.uk/",
    "Plain language and predictable accessible controls.",
  ],
];
const details = [
  [
    "Entry / first paint",
    "Show the HTML title immediately on charcoal. Load the original 289 KB comic artwork below the fold. No fake percentage loader, age gate, or forced sound. Keep Archive and contact available before any scene finishes.",
  ],
  [
    "Header / every surface",
    "The fixed white Experience / Archive plaque never moves on hover. A red ornament separates its actions. The small signature changes between light and dark at chapter boundaries. Index opens Services and The broadcaster; Escape closes it. On mobile the plaque is 190px wide, leaving the signature unobstructed.",
  ],
  [
    "Scroll / entering a chapter",
    "Use native scrolling and real document anchors. A chapter gets one spatial transition, not one transition per paragraph. IntersectionObserver updates the current chapter. The reader remains still; browser back, deep links, and text selection remain native. Sticky navigation must never cover a focused field or chapter heading.",
  ],
  [
    "Project opening / tuning",
    "A selected project changes title, receiver metadata, destination, and accent together. The collection uses previous/next controls and direct indicators. No text is hidden behind the receiver unless a fully readable version is present elsewhere. Project pages begin with provenance before making any work claim.",
  ],
  [
    "Hover / cursor / press",
    "Links underline or increase contrast; buttons respond within 80–150ms. Keep a native pointer and visible keyboard focus. Decorative parallax is limited to a few pixels. A draggable control uses an explicit label and a native range input, never an invisible canvas hit target.",
  ],
  [
    "Reading / annotations / artifacts",
    "Use Newsreader at approximately20px with a comfortable line length. Do not animate letters or paragraphs. Place sample permissions and role labels near the work. Notes are optional and never pretend an illustrative revision was a historical before/after. Every artifact requires a caption and usable text alternative.",
  ],
  [
    "Mobile / reduced motion",
    "Collapse side labels into a readable block; retain every essential action. No hover-only content. Range inputs stay keyboard operable. Under reduced motion, stop drifting ink, parallax, and entrance movement; preserve chapter changes and color as immediate state changes.",
  ],
  [
    "Loading / failure / empty",
    "Artwork failure leaves readable title, story, and links. Empty search offers reset and a custom brief. Unknown projects get a recovery link. Clipboard failure offers a selectable address. mailto composition states that the visitor must send the message in their own email app.",
  ],
  [
    "Sound / memory / privacy",
    "Audio is muted on each fresh load. M enables only procedural clicks after a user gesture; no autoplay soundtrack. Remember frequency and archive view locally. Store brief drafts only in the tab session and offer Clear draft. Never infer email delivery or record contact text as analytics.",
  ],
  [
    "Exit / next story / contact",
    "End a story with evidence slots, references, the next channel, and a relevant commissioning route. Keep back-to-archive visible. A contact brief may be prefilled with the current frequency, but visitors can change it. Final credits name real collaborators only.",
  ],
];
export default function DesignSystem() {
  return (
    <>
      <article className="design-system">
        <span className="treatment-label">
          THE NETWORK BIBLE / VISUAL IDENTITY & MOTION
        </span>
        <h1>
          One world.
          <br />
          Nineteen signals.
        </h1>
        <p>
          A working specification for the entire portfolio: visual identity,
          storytelling, transitions, interaction details, and project
          treatments. Reference links below are design precedents; they are not
          claims that every linked site has been audited.
        </p>
        <section className="system-section">
          <span>01 / IDENTITY</span>
          <h2>Ink. Paper. Interference.</h2>
          <div className="system-swatches">
            {[
              "#1d1d1d",
              "#f5f3e9",
              "#c82924",
              "#aebf9f",
              "#9cbcc9",
              "#e4bd54",
            ].map((c) => (
              <span
                key={c}
                style={{
                  background: c,
                  color:
                    c === "#1d1d1d" || c === "#c82924" ? "#fff" : "#171717",
                }}
              >
                {c}
              </span>
            ))}
          </div>
          <div className="system-grid">
            {[
              [
                "The masthead",
                "Bodoni Moda, uppercase, tightly spaced. Monumental display only; never force reading text into display proportions. Instrument Serif gives the signature and marginal voices a personal hand.",
              ],
              [
                "The reading voice",
                "Newsreader for long text; DM Sans for controls. Use short labels, humane sentences, generous line spacing, and dark ink on paper. Channel numbers support orientation rather than dominate it.",
              ],
              [
                "The material language",
                "Three tones: solid ink, a single middle accent, and bone highlights. Engraving indicates volume. Comic borders divide scenes. Grain stays subtle. Artifacts should feel like objects with evidence, not abstract decorative cards.",
              ],
            ].map(([title, text]) => (
              <div className="system-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="system-section">
          <span>02 / MOTION GRAMMAR</span>
          <h2>Movement with a job.</h2>
          <div className="system-grid">
            {[
              [
                "instant",
                "Feedback",
                "80–150ms. Hover, press, filter and input feedback. Never delay a result to perform an animation.",
              ],
              [
                "",
                "Spatial transition",
                "450–600ms; cubic-bezier(.22,1,.36,1). Opening a new visual context or shifting an artifact. Interrupted transitions follow the latest intent.",
              ],
              [
                "stepped",
                "Engraved atmosphere",
                "Eight visual steps per second at most, low amplitude. Only decorative ink drifts; all text stays still. Reduced motion removes the effect.",
              ],
            ].map(([kind, title, text]) => (
              <div className="system-card" key={title} tabIndex={0}>
                <div className={`motion-sample ${kind}`} aria-hidden="true">
                  <i />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="system-section">
          <span>03 / STORY ARCHITECTURE</span>
          <h2>The question becomes a world.</h2>
          <p className="system-flow">
            01 TITLE & PROVENANCE → 02 THE QUESTION → 03 THE TRANSFORMATION → 04
            THE ACTUAL ARTIFACT → 05 VERIFIED EVIDENCE → 06 CREDITS & REFERENCES
            → 07 NEXT TRANSMISSION / COMMISSION
          </p>
          <p>
            Each project treatment below implements a three-scene presentation
            prototype and six replaceable evidence slots. Keep these labelled
            until exact content is supplied.
          </p>
        </section>
        <section className="system-section">
          <span>04 / EVERY LITTLE THING</span>
          <h2>The interaction ledger.</h2>
          {details.map(([title, text]) => (
            <details key={title}>
              <summary>{title}</summary>
              <p>{text}</p>
            </details>
          ))}
        </section>
        <section className="system-section">
          <span>05 / REFERENCE ATLAS</span>
          <h2>A reference for every decision.</h2>
          <div className="system-reference-list">
            {references.map(([title, url, text]) => (
              <a href={url} target="_blank" rel="noreferrer" key={title}>
                {title} ↗<span>{text}</span>
              </a>
            ))}
          </div>
        </section>
        <Link className="cinema-outlined-button" to="/catalogue">
          Return to the collection ↗
        </Link>
      </article>
      <TreatmentIndex />
    </>
  );
}
