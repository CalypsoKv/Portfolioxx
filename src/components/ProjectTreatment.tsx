import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import treatments from "../data/treatments.json";
import { transmissions, type Transmission } from "../data/transmissions";
import "./project-treatment.css";
export function TreatmentIndex() {
  return (
    <section className="treatment-index">
      <span>THE COMPLETE WORLD / 19 PRESENTATION BLUEPRINTS</span>
      <h2>
        Every channel.
        <br />
        Its own universe.
      </h2>
      <p>
        Explore the proposed visual story for every project. Presentation
        prototypes are labelled separately from completed work.
      </p>
      <div>
        {transmissions
          .slice()
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((item) => (
            <Link to={`/work/${item.slug}/treatment`} key={item.id}>
              <span>CH. {item.id}</span>
              <strong>{item.title}</strong>
              <span>{treatments.find((t) => t.id === item.id)?.motif}</span>
              <ArrowUpRight size={17} />
            </Link>
          ))}
      </div>
    </section>
  );
}
export default function ProjectTreatment({
  item,
  openContact,
}: {
  item: Transmission;
  openContact: (s?: string) => void;
}) {
  const treatment = treatments.find((t) => t.id === item.id)!;
  const [chapter, setChapter] = useState(0),
    [mode, setMode] = useState<"work" | "direction">("work");
  const panels = useRef<(HTMLElement | null)[]>([]);
  const [lens, setLens] = useState(50);
  useEffect(() => {
    setChapter(0);
    setLens(50);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            setChapter(Number((entry.target as HTMLElement).dataset.chapter));
          }
      },
      { threshold: 0.35 },
    );
    panels.current.forEach((p) => p && observer.observe(p));
    return () => observer.disconnect();
  }, [item.id]);
  const index = transmissions.slice().sort((a, b) => a.id.localeCompare(b.id));
  const next =
    index[(index.findIndex((t) => t.id === item.id) + 1) % index.length];
  return (
    <article
      className={`project-treatment motif-${treatment.motif}`}
      style={{ "--project-accent": treatment.color } as React.CSSProperties}
    >
      <header className="treatment-opening">
        <span className="treatment-label">
          CH. {item.id} / {item.frequency.toUpperCase()} / PRESENTATION
          PROTOTYPE
        </span>
        <h1>{item.title}</h1>
        <p>{treatment.title}</p>
        <div className="treatment-seal">
          PROPOSED ART DIRECTION
          <br />
          EXACT WORK & CONTENT TO BE ADDED
        </div>
        <div className="treatment-hero-art" aria-hidden="true">
          <Motif motif={treatment.motif} phase={0} value={50} />
        </div>
        <a href="#treatment-story" className="treatment-enter">
          Enter the transmission <ArrowDown size={17} />
        </a>
      </header>
      <nav className="treatment-dock" aria-label="Project chapters">
        <Link to="/catalogue">
          <ArrowLeft size={14} /> Archive
        </Link>
        <div>
          {treatment.chapters.map((c, i) => (
            <a
              aria-current={chapter === i ? "step" : undefined}
              key={c}
              href={`#treatment-${i}`}
            >
              0{i + 1}
              <span>{c}</span>
            </a>
          ))}
        </div>
        <button
          aria-pressed={mode === "direction"}
          onClick={() => setMode((v) => (v === "work" ? "direction" : "work"))}
        >
          {mode === "work" ? "Show direction notes" : "Hide direction notes"}
        </button>
      </nav>
      <section className="treatment-premise" id="treatment-story">
        <span>THE STORY KERNEL</span>
        <h2>{treatment.story}</h2>
        <p>
          This is the proposed presentation of {item.title}. The layouts, visual
          metaphor, and interactions are working prototypes. They do not
          represent verified project deliverables, results, or historical
          process.
        </p>
        <Link to={`/work/${item.slug}`}>
          {item.status === "vault"
            ? "View this project shell"
            : "Read the current transmission"}{" "}
          <ArrowUpRight size={16} />
        </Link>
      </section>
      {treatment.chapters.map((title, i) => (
        <section
          className={`treatment-chapter phase-${i}`}
          data-chapter={i}
          id={`treatment-${i}`}
          ref={(e) => {
            panels.current[i] = e;
          }}
          key={title}
        >
          <div className="treatment-chapter-copy">
            <span>
              0{i + 1} /{" "}
              {["THE QUESTION", "THE TRANSFORMATION", "THE SIGNAL"][i]}
            </span>
            <h2>{title}</h2>
            <p>
              {
                [
                  "Open with the real audience, constraint, or question. This scene establishes the world before explaining the work.",
                  "Reveal the actual decisions through a tangible artifact. Let the visitor inspect how structure, language, or a system changes.",
                  "Bring the finished work into focus. Close with verified evidence, honest attribution, and a clear route into a related commission.",
                ][i]
              }
            </p>
            {mode === "direction" && (
              <aside className="direction-note">
                <strong>DIRECTOR’S NOTE</strong>
                <p>
                  {i === 0
                    ? `Begin with the ${treatment.motif} motif in its quietest state. Keep the headline in HTML; artwork never carries essential copy.`
                    : i === 1
                      ? "The control below changes the proposed composition. This is an interaction study, not a before/after claim about the actual work."
                      : "Resolve the composition into a stable reading surface. Do not animate body text; reveal real outcomes only when supplied."}
                </p>
                <span>
                  Reference: {treatment.reference} — adapted composition, not
                  copied project evidence.
                </span>
              </aside>
            )}
          </div>
          <div className="treatment-artifact">
            <div className="artifact-frame">
              <Motif motif={treatment.motif} phase={i} value={lens} />
              <span className="artifact-stamp">
                ILLUSTRATIVE ARTIFACT / CH. {item.id}
              </span>
            </div>
            {i === 1 && (
              <label className="treatment-control">
                {treatment.motif === "stage"
                  ? "Raise the curtain"
                  : treatment.motif === "lens"
                    ? "Change the perspective"
                    : treatment.motif === "pipeline"
                      ? "Adjust the human review layer"
                      : "Reveal the structure"}
                <input
                  aria-label="Explore presentation structure"
                  type="range"
                  min="0"
                  max="100"
                  value={lens}
                  onChange={(e) => setLens(Number(e.target.value))}
                />
                <span aria-live="polite">
                  {lens < 34
                    ? "Raw signal"
                    : lens < 67
                      ? "Finding the pattern"
                      : "Clearer structure"}{" "}
                  · {lens}%
                </span>
              </label>
            )}
          </div>
        </section>
      ))}
      <section className="treatment-fill">
        <span>YOUR CONTENT GOES HERE</span>
        <h2>
          Keep the world.
          <br />
          Replace the evidence.
        </h2>
        <div className="content-slots">
          {[
            "The real brief",
            "Your exact role",
            "The finished artifact",
            "Decisions & iterations",
            "Verified outcome",
            "Credits & permissions",
          ].map((label, i) => (
            <div key={label}>
              <span>0{i + 1}</span>
              <h3>{label}</h3>
              <p>
                {i === 0
                  ? "Add audience, constraints, timeline, and objective."
                  : i === 1
                    ? "Add your contribution and collaborators."
                    : i === 2
                      ? treatment.assets
                      : i === 3
                        ? "Add approved sketches, drafts, and the reasons behind changes."
                        : i === 4
                          ? "Add a sourced result, or a qualitative reflection. No metric is required."
                          : "Add publication links, dates, attribution, and reproduction permission."}
              </p>
              <span className="slot-pending">
                PLACEHOLDER / AWAITING YOUR CONTENT
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="treatment-references">
        <span>THE REFERENCE DESK</span>
        <h2>
          Borrow the grammar.
          <br />
          Keep your own voice.
        </h2>
        <a href="https://santionispirits.com/" target="_blank" rel="noreferrer">
          Santioni Spirits{" "}
          <span>Engraved world, monumental title, comic-panel transitions</span>
          <ArrowUpRight />
        </a>
        <a href={treatment.url} target="_blank" rel="noreferrer">
          {treatment.reference}
          <span>
            Proposed interaction / editorial reference; not a newly audited
            implementation
          </span>
          <ArrowUpRight />
        </a>
        <Link to="/design-system">
          Explore the complete visual & motion system <ArrowUpRight />
        </Link>
      </section>
      <section className="treatment-ending">
        <span>THE NEXT TRANSMISSION</span>
        <Link to={`/work/${next.slug}/treatment`}>
          {next.title}
          <ArrowRight />
        </Link>
        <button onClick={() => openContact(item.frequency)}>
          Commission something on this wavelength <ArrowUpRight size={17} />
        </button>
      </section>
    </article>
  );
}
function Motif({
  motif,
  phase,
  value,
}: {
  motif: string;
  phase: number;
  value: number;
}) {
  const open = phase === 0 ? 15 : phase === 2 ? 100 : value;
  return (
    <svg
      viewBox="0 0 640 480"
      role="img"
      aria-label={`${motif} visual study, stage ${phase + 1}`}
    >
      <defs>
        <pattern
          id={`lines-${motif}-${phase}`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(30)"
        >
          <path d="M0 0v5" stroke="currentColor" strokeWidth="1" opacity=".3" />
        </pattern>
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="2">
        {motif === "constellation" ? (
          <>
            {Array.from({ length: 12 }, (_, i) => {
              const x = 320 + Math.cos(i * 2.4) * 180,
                y = 240 + Math.sin(i * 2.4) * 150;
              return (
                <g key={i}>
                  <path
                    d={`M320 240L${320 + ((x - 320) * open) / 100} ${240 + ((y - 240) * open) / 100}`}
                    opacity=".4"
                  />
                  <circle cx={x} cy={y} r={i % 3 === 0 ? 15 : 7} />
                </g>
              );
            })}
            <circle cx="320" cy="240" r="30" />
          </>
        ) : motif === "stage" ? (
          <>
            <path d="M80 80h480v330H80zM80 100h480M100 410h440" />
            {[0, 1].map((n) => (
              <path
                key={n}
                fill={`url(#lines-${motif}-${phase})`}
                d={
                  n === 0
                    ? `M80 100h${230 - open * 1.8}v280Q150 340 80 380Z`
                    : `M560 100h-${230 - open * 1.8}v280Q490 340 560 380Z`
                }
              />
            ))}
            <circle cx="320" cy="230" r="24" />
            <path d="M320 254v95m0-65-35 25m35-25 35 25m-35 40-25 40m25-40 25 40" />
          </>
        ) : motif === "lens" ? (
          <>
            {[0, 1, 2].map((n) => (
              <g
                transform={`translate(${(open - 50) * (n - 1) * 0.6} 0)`}
                key={n}
              >
                <circle cx={250 + n * 70} cy="240" r="125" />
                <path
                  d={`M${140 + n * 70} 240h220m-110-110v220`}
                  opacity=".3"
                />
              </g>
            ))}
          </>
        ) : motif === "pipeline" || motif === "journey" ? (
          <>
            {["INPUT", "INTERPRET", "REVIEW", "OUTPUT"].map((s, i) => (
              <g key={s}>
                <rect
                  x={45 + i * 150}
                  y={190 + Math.sin(i) * ((100 - open) / 2)}
                  width="105"
                  height="90"
                  rx="5"
                />
                <text
                  x={97 + i * 150}
                  y={238 + Math.sin(i) * ((100 - open) / 2)}
                  textAnchor="middle"
                  fill="currentColor"
                  stroke="none"
                  fontFamily="DM Sans"
                  fontSize="10"
                >
                  {s}
                </text>
                {i < 3 && <path d={`M${150 + i * 150} 235h40m-8-6 8 6-8 6`} />}
              </g>
            ))}
          </>
        ) : motif === "growth" ? (
          <>
            <path d="M320 405V120M320 310 230 255M320 260l85-65M320 210l-50-45" />
            {[0, 1, 2, 3].map((n) => (
              <ellipse
                key={n}
                cx={n % 2 ? 365 : 275}
                cy={170 + n * 48}
                rx={15 + open * 0.35}
                ry="20"
                transform={`rotate(${n % 2 ? -35 : 35} ${n % 2 ? 365 : 275} ${170 + n * 48})`}
              />
            ))}
            <path d="M220 405h200" />
          </>
        ) : motif === "identity" ? (
          <>
            <rect
              x="130"
              y="100"
              width="380"
              height="280"
              fill={`url(#lines-${motif}-${phase})`}
            />
            <text
              x="320"
              y="285"
              textAnchor="middle"
              fontFamily="Bodoni Moda"
              fontSize={75 + open * 0.3}
              stroke="none"
              fill="currentColor"
            >
              Aa
            </text>
            <path
              d="M100 90h440M120 70v340m400-340v340M100 390h440"
              opacity=".35"
            />
          </>
        ) : motif === "strata" ? (
          <>
            {Array.from({ length: 8 }, (_, i) => (
              <path
                key={i}
                d={`M100 ${100 + i * 40}q110 ${Math.sin(i) * open} 220 0t220 0`}
                strokeWidth={i % 3 === 0 ? 7 : 1.5}
              />
            ))}
            <circle cx="320" cy="240" r="115" />
          </>
        ) : motif === "recipe" ? (
          <>
            <ellipse cx="320" cy="250" rx="170" ry="115" />
            <ellipse cx="320" cy="250" rx="130" ry="85" />
            {Array.from({ length: 7 }, (_, i) => (
              <path
                key={i}
                d={`M${230 + i * 30} ${220 - open * 0.5}q-25-35 0-70`}
                opacity=".6"
              />
            ))}
            <path d="M110 160v190m-20-190v50q20 25 40 0v-50m390 0v190m20-190v110h-20" />
          </>
        ) : motif === "game" ? (
          <>
            <rect x="120" y="120" width="400" height="250" rx="28" />
            <path
              d={Array.from(
                { length: 50 },
                (_, i) =>
                  `${i ? "L" : "M"}${145 + i * 7} ${245 + Math.sin(i * 0.7) * (100 - open) * 0.45}`,
              ).join(" ")}
            />
            <circle cx="495" cy="325" r="9" />
            <text
              x="320"
              y="175"
              textAnchor="middle"
              fontSize="18"
              fontFamily="DM Sans"
              fill="currentColor"
              stroke="none"
            >
              {(87 + open * 0.17).toFixed(1)} MHz
            </text>
          </>
        ) : (
          <>
            {[0, 1, 2].map((n) => (
              <g
                key={n}
                transform={`translate(${n * 22 + open * n * 0.15} ${-n * 18}) rotate(${(n - 1) * (100 - open) * 0.05} 300 260)`}
              >
                <rect
                  x="160"
                  y="130"
                  width="280"
                  height="250"
                  fill="var(--project-paper,#f5f3e9)"
                />
                <path
                  d="M190 175h170m-170 25h220m-220 25h180m-180 50h220m-220 25h200m-200 25h150"
                  opacity=".65"
                />
              </g>
            ))}
          </>
        )}
      </g>
    </svg>
  );
}
