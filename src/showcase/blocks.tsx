import { useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { awards, voices } from "../data/proof";
import { provenanceLabel, transmissions, type Transmission } from "../data/transmissions";
import { setSound, soundOn, tick } from "../motion/audio";
import { compositions, type Block, type Slot as SlotKind } from "./compositions";
import { useShell } from "../shell/context";

/** ?collect=1 shows what each empty slot still needs (file, source, permission). Visitors see a calm "being restored" line. */
export const useCollect = () => new URLSearchParams(useLocation().search).has("collect");

export function State({ kind, children }: { kind: "ph" | "dr" | "vf"; children: ReactNode }) {
  return (
    <span className={`state ${kind}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

export function Slot({ slot = "16:9", label, n = 1 }: { slot?: SlotKind; label: string; n?: number }) {
  const collect = useCollect();
  const cls = slot === "4:5" ? "r45" : slot === "1:1" ? "r11" : "";
  return (
    <div className={`slot ${cls}`} role="img" aria-label={`Empty ${label} slot, ${slot}`}>
      <div>
        <span className="tape">Slot {String(n).padStart(2, "0")} · {label}</span>
        {collect ? <span className="chk">□ File &nbsp;□ Source &nbsp;□ Permission</span> : <span className="calm">Archive, evidence being restored</span>}
      </div>
    </div>
  );
}

export function ArtifactFrame(p: { src?: string; alt?: string; caption: string; source?: string; permission?: string; slot?: SlotKind; label?: string; n?: number; href?: string }) {
  const img = p.src && (
    <img src={p.src} alt={p.alt ?? ""} loading="lazy" decoding="async" />
  );
  return (
    <figure className="frame ink">
      <div className={`shot ${p.slot === "4:5" ? "shot45" : p.slot === "1:1" ? "shot11" : ""}`}>
        {p.src ? (p.href ? <a href={p.href} target="_blank" rel="noreferrer">{img}</a> : img) : <Slot slot={p.slot} label={p.label ?? "Artifact"} n={p.n} />}
      </div>
      <div className="meta">
        {p.src ? (
          <>
            <State kind="vf">Verified</State>
            <span className="chip">Source · {p.source}</span>
            <span className="chip">Permission · {p.permission}</span>
          </>
        ) : (
          <>
            <State kind="ph">Placeholder</State>
            <span className="chip dash">Source —</span>
            <span className="chip dash">Permission —</span>
          </>
        )}
      </div>
      <figcaption>{p.caption}</figcaption>
    </figure>
  );
}

export function Banner({ t }: { t: Transmission }) {
  const note =
    t.status === "published"
      ? "The supplied brief identifies Jahan's published byline. The text below is new portfolio commentary, not the original article."
      : t.status === "analysis"
        ? "Contextual field analysis. Jahan's contribution to the original report is unconfirmed; no authorship is claimed."
        : t.status === "concept"
          ? "Self-initiated concept. An illustrative exploration, not paid client work or a shipped product."
          : t.status === "owned"
            ? t.owned?.disclosure
            : "Archive, evidence being restored. The structure below shows how this work will be shown. Nothing here is an artifact or an outcome.";
  const kind = t.status === "published" || t.status === "owned" ? "vf" : t.status === "vault" ? "ph" : "dr";
  return (
    <aside className="banner ink" aria-label="Provenance">
      <State kind={kind}>{provenanceLabel(t)}</State>
      {t.owned && <span className="osd">Role · {t.owned.roles.join(" · ")}</span>}
      <p>{note}</p>
    </aside>
  );
}

export function Reader({ t }: { t: Transmission }) {
  const [notes, setNotes] = useState(true);
  if (!t.sections?.length) return null;
  return (
    <div className={`reader-wrap ${notes ? "has-notes" : ""}`}>
      <div className="tools">
        <button type="button" className="hud" aria-pressed={notes} onClick={() => setNotes(!notes)}>Strategic notes</button>
      </div>
      <article className="paper ink">
        <h2 className="disp">The reading</h2>
        {t.sections.map((s, i) => (
          <section key={s.title} id={`chapter-${i}`} className="chapter">
            <span className="osd">{String(i + 1).padStart(2, "0")} /</span>
            <h3 className="disp">{s.title}</h3>
            <p className={i === 0 ? "dropcap" : ""}>{s.text}</p>
            {notes && s.note && (
              <aside className="narr-note ink thin">
                <b className="osd">Narrator · note {i + 1}</b>
                {s.note}
              </aside>
            )}
          </section>
        ))}
        {t.source && (
          <a className="hud" href={t.source} target="_blank" rel="noreferrer">Locate the original publication ↗</a>
        )}
      </article>
    </div>
  );
}

type Rail = Extract<Block, { kind: "rail" }>;
export function StepRail({ block, note }: { block: Rail; note?: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const s = block.steps[i];
  const gated = block.variant === "levels" && i === block.steps.length - 1 && !open;
  return (
    <section className={`rail rail-${block.variant}`} aria-label={block.title}>
      <header className="block-head">
        <h2 className="disp">{block.title}</h2>
        <p>{block.intro}</p>
      </header>
      <ol className="rail-steps">
        {block.steps.map((st, k) => (
          <li key={st.title}>
            <button type="button" aria-pressed={k === i} aria-current={k === i ? "step" : undefined} onClick={() => { setI(k); setOpen(false); tick(); }}>
              <span className="osd">{String(k + 1).padStart(2, "0")}</span>
              {st.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="rail-panel" aria-live="polite">
        <div className="rail-copy">
          <h3 className="disp">{s.title}</h3>
          <p>{s.text}</p>
          {!block.real && <State kind="ph">Placeholder · {note ?? "describes what will be shown here"}</State>}
        </div>
        {s.slot &&
          (gated ? (
            <div className="gatebox ink thin">
              <span className="osd">Deeper detail contains spoilers</span>
              <button type="button" className="hud" onClick={() => setOpen(true)}>Show deeper detail</button>
            </div>
          ) : (
            <ArtifactFrame slot={s.slot} label={s.title} n={i + 1} caption={`Reserved for the real ${s.title.toLowerCase()} artifact.`} />
          ))}
      </div>
    </section>
  );
}

type Net = Extract<Block, { kind: "network" }>;
export function Network({ block }: { block: Net }) {
  const [sel, setSel] = useState(block.nodes[0].id);
  const pos = useMemo(() => {
    const n = block.nodes.length;
    return Object.fromEntries(
      block.nodes.map((nd, k) => {
        const a = (k / n) * Math.PI * 2 - Math.PI / 2;
        return [nd.id, { x: 450 + Math.cos(a) * 330, y: 180 + Math.sin(a) * 125 }];
      }),
    );
  }, [block.nodes]);
  const cur = block.nodes.find((n) => n.id === sel)!;
  const near = block.edges.filter((e) => e[0] === sel || e[1] === sel);
  const label = (id: string) => block.nodes.find((n) => n.id === id)!.label;
  return (
    <section className="network" aria-label={block.title}>
      <header className="block-head">
        <h2 className="disp">{block.title}</h2>
        <p>{block.intro}</p>
      </header>
      <div className="network-grid">
        <svg viewBox="0 0 900 360" role="group" aria-label="Relationship map">
          {block.edges.map(([a, b, rel], k) => (
            <g key={k} className={a === sel || b === sel ? "edge on" : "edge"}>
              <line x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} />
              <text x={(pos[a].x + pos[b].x) / 2} y={(pos[a].y + pos[b].y) / 2 - 6}>{rel}</text>
            </g>
          ))}
          {block.nodes.map((n) => (
            <g key={n.id} className={n.id === sel ? "node on" : "node"} tabIndex={0} role="button" aria-pressed={n.id === sel} aria-label={n.label} onClick={() => setSel(n.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(n.id))}>
              <circle cx={pos[n.id].x} cy={pos[n.id].y} r="30" />
              <text x={pos[n.id].x} y={pos[n.id].y + 52} textAnchor="middle">{n.label}</text>
            </g>
          ))}
        </svg>
        <div className="network-detail" aria-live="polite">
          <h3 className="disp">{cur.label}</h3>
          <p>{cur.note}</p>
          <State kind="ph">Placeholder · awaiting a source</State>
          <ul>{near.map(([a, b, rel], k) => <li key={k}>{label(a)} <em>{rel}</em> {label(b)}</li>)}</ul>
        </div>
      </div>
      <details className="twin">
        <summary className="osd">List version of the map</summary>
        <table>
          <thead><tr><th scope="col">From</th><th scope="col">Relationship</th><th scope="col">To</th><th scope="col">State</th></tr></thead>
          <tbody>{block.edges.map(([a, b, rel], k) => <tr key={k}><td>{label(a)}</td><td>{rel}</td><td>{label(b)}</td><td><State kind="ph">Placeholder</State></td></tr>)}</tbody>
        </table>
      </details>
    </section>
  );
}

export function Ledger({ t, title, intro }: { t: Transmission; title: string; intro: string }) {
  const rows: { metric: string; value?: string; source: string; date: string; state: "ph" | "dr" | "vf" }[] = t.owned?.reported
    ? t.owned.reported.map((r) => ({ ...r, state: "dr" as const }))
    : t.status === "analysis"
      ? [{ metric: "Jahan's contribution", value: "Unconfirmed", source: "Project brief", date: "—", state: "dr" }, { metric: "Outcome", source: "—", date: "—", state: "ph" }]
      : [{ metric: "Outcome 1", source: "—", date: "—", state: "ph" }, { metric: "Outcome 2", source: "—", date: "—", state: "ph" }];
  return (
    <section className="ledger" aria-label={title}>
      <header className="block-head"><h2 className="disp">{title}</h2><p>{intro}</p></header>
      <div className="crt-t"><div className="scroll"><table>
        <thead><tr><th scope="col">Metric</th><th scope="col">Value</th><th scope="col">Source</th><th scope="col">Date</th><th scope="col">State</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.metric}>
              <td>{r.metric}</td>
              <td>{r.value ?? <span className="leader">not yet measured</span>}</td>
              <td>{r.source}</td><td>{r.date}</td>
              <td><State kind={r.state}>{r.state === "dr" ? (t.owned ? "Studio-reported" : "Draft") : "Placeholder"}</State></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
      {t.owned?.reported && <p className="fine">These are the studio's own statements, captured from its website. They are labelled as reported and are not independently checked.</p>}
    </section>
  );
}

export function Works({ t }: { t: Transmission }) {
  if (!t.owned?.works) return null;
  return (
    <section className="works" aria-label="Selected works">
      <header className="block-head"><h2 className="disp">Selected works</h2><p>As listed on the studio's own site. Each opens that commission there.</p></header>
      <ul className="work-cards">
        {t.owned.works.map((w) => (
          <li key={w.title}>
            <a className="work-card ink" href={w.url} target="_blank" rel="noreferrer">
              {w.image && <img src={w.image} alt={`${w.title}: ${w.note}`} loading="lazy" decoding="async" />}
              <span className="work-card-cap"><strong className="disp">{w.title}</strong><span className="osd">{w.note} ↗</span></span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Strands({ t }: { t: Transmission }) {
  const items = [
    ["Site & brand", "The website and visual identity."],
    ["Content", "The writing and posts that carry the voice."],
    ["Community", "The TPOT side: conversations and connections in the open."],
  ];
  return (
    <section className="strands" aria-label="What was built">
      <header className="block-head"><h2 className="disp">Three strands</h2><p>What Jahan built and runs for the practice. Screens and posts arrive from the owner.</p></header>
      <div className="strand-grid">
        {items.map(([name, text], i) => (
          <div key={name} className="strand">
            <h3 className="disp">{name}</h3>
            <p>{text}</p>
            <ArtifactFrame slot="16:9" label={name} n={i + 1} caption={`Reserved for ${name.toLowerCase()} artifacts.`} />
          </div>
        ))}
      </div>
      {t.owned?.quote && (
        <blockquote className="quote ink thin">
          <p>"{t.owned.quote.text}"</p>
          <footer className="osd"><a href={t.owned.quote.url} target="_blank" rel="noreferrer">{t.owned.quote.attribution} ↗</a></footer>
        </blockquote>
      )}
    </section>
  );
}

export function Links({ t }: { t: Transmission }) {
  const links = t.owned?.links ?? (t.source ? [{ label: "Original publication", url: t.source }] : []);
  if (!links.length) return null;
  return (
    <nav className="links" aria-label="Where to find it">
      {links.map((l) => <a key={l.url} className="hud" href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>)}
    </nav>
  );
}

/* ---------- prototypes ---------- */
function Dial() {
  const [dial, setDial] = useState(87);
  const [skipped, setSkipped] = useState(false);
  const won = dial === 104;
  const near = Math.abs(dial - 104);
  return (
    <section className="prototype dial" aria-label="The next frequency, a playable experiment">
      <header className="block-head"><h2 className="disp">Find the signal</h2><p>Tune the receiver to 104.0 MHz. Use the slider, the arrow keys or type a number. Sound stays off unless you turn it on.</p></header>
      <div className={`signal ${won || skipped ? "locked" : ""}`}>
        <div className="signal-number disp">{dial.toFixed(1)}<span className="osd"> MHz</span></div>
        <div className="wave-bars" aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => <i key={i} style={{ height: `${10 + Math.sin(i * 0.6) * Math.sin(i * 0.3) * Math.max(8, 60 - near * 3)}px` }} />)}
        </div>
        <label className="osd" htmlFor="dial-range">Tune the receiver · target 104.0 MHz</label>
        <div className="dial-row">
          <input id="dial-range" type="range" min="87" max="108" step="1" value={dial} onChange={(e) => { const v = Number(e.target.value); setDial(v); if (v === 104) tick(); }} />
          <input aria-label="Frequency in MHz" type="number" min="87" max="108" value={dial} onChange={(e) => setDial(Math.min(108, Math.max(87, Number(e.target.value) || 87)))} />
        </div>
        <p aria-live="polite">{won || skipped ? "Signal locked. You found the next frequency." : near < 4 ? "A little closer. The signal is getting clearer." : "Mostly static. Keep tuning."}</p>
        <div className="chips">
          <button type="button" className="hud" onClick={() => { setDial(87); setSkipped(false); }}>Restart</button>
          <button type="button" className="hud" onClick={() => setSkipped(true)}>Skip</button>
          <button type="button" className="hud" aria-pressed={soundOn()} onClick={() => setSound(!soundOn())}>Sound</button>
        </div>
      </div>
      <p className="fine">Playtest status: not tested yet. Self-initiated experiment.</p>
    </section>
  );
}

const SOURCES = [
  { id: "faq", hi: "सामान्य प्रश्न", en: "Seller FAQ note", quote: "Returns are accepted within seven days." },
  { id: "pol", hi: "नीति का मसौदा", en: "Returns policy draft", quote: "Damaged items need a photo within two days." },
  { id: "msg", hi: "ग्राहक संदेश", en: "Customer message thread", quote: "My parcel arrived with a broken seal." },
];
function Copilot() {
  const [picked, setPicked] = useState<string[]>(["faq", "msg"]);
  const [step, setStep] = useState(0);
  const [verdict, setVerdict] = useState<"" | "approved" | "rejected">("");
  const chosen = SOURCES.filter((s) => picked.includes(s.id));
  return (
    <section className="prototype copilot" aria-label="MyMunshi, a clickable prototype">
      <header className="block-head"><h2 className="disp">A ledger that never acts on its own</h2><p>A three-step prototype with fictional data. Nothing is sent, published or connected to any real account.</p></header>
      <State kind="dr">Simulated · fictional data · no backend</State>
      <ol className="rail-steps">
        {["स्रोत चुनें · Give a bounded source set", "प्रमाण · See grouped evidence", "समीक्षा · Review before any action"].map((l, k) => (
          <li key={l}><button type="button" aria-pressed={k === step} onClick={() => setStep(k)}><span className="osd">{String(k + 1).padStart(2, "0")}</span>{l}</button></li>
        ))}
      </ol>
      <div className="rail-panel">
        {step === 0 && (
          <fieldset className="sources"><legend className="osd">Sources for this task</legend>
            {SOURCES.map((s) => (
              <label key={s.id}><input type="checkbox" checked={picked.includes(s.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, s.id] : picked.filter((x) => x !== s.id))} /> {s.hi} · {s.en}</label>
            ))}
            <button type="button" className="hud" disabled={!picked.length} onClick={() => setStep(1)}>Group the evidence</button>
          </fieldset>
        )}
        {step === 1 && (
          <div className="evidence">
            {chosen.map((s) => <blockquote key={s.id} className="ink thin"><State kind="vf">Quoted</State><p>"{s.quote}"</p><footer className="osd">{s.en}</footer></blockquote>)}
            <blockquote className="ink thin"><State kind="dr">Inferred · uncertain</State><p>Customers may expect a faster refund than the draft policy allows.</p><footer className="osd">Linked to {chosen.length} source{chosen.length === 1 ? "" : "s"}</footer></blockquote>
            <button type="button" className="hud" onClick={() => setStep(2)}>Draft a reply</button>
          </div>
        )}
        {step === 2 && (
          <div className="review">
            <p className="draft ink thin">Draft reply (not sent): "Thank you for the photo. We will review it within two days and update you here."</p>
            <div className="chips">
              <button type="button" className="hud" onClick={() => setVerdict("approved")}>स्वीकृत करें · Approve</button>
              <button type="button" className="hud" onClick={() => setVerdict("rejected")}>Reject</button>
              <button type="button" className="hud" onClick={() => { setPicked(["faq", "msg"]); setStep(0); setVerdict(""); }}>Reset</button>
            </div>
            <p aria-live="polite">{verdict === "approved" ? "Approved in this demo. Nothing was sent or published." : verdict === "rejected" ? "Rejected. The draft was discarded. Nothing was sent." : "Waiting for a person to decide."}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Workbench() {
  const [text, setText] = useState("Where should your parcel go?");
  const [tab, setTab] = useState(0);
  const states = [
    ["Headline", <h4 key="h" className="disp">{text}</h4>],
    ["Helper", <p key="p" className="helper">{text} We only use this to deliver your order.</p>],
    ["Empty", <p key="e" className="empty">No saved addresses yet. {text}</p>],
    ["Error", <p key="r" className="err" role="alert">Something is missing. {text}</p>],
    ["Success", <p key="s" className="ok">Saved. {text}</p>],
  ] as const;
  return (
    <section className="prototype workbench" aria-label="UX copy workbench">
      <header className="block-head"><h2 className="disp">The same words, five places</h2><p>Type a line and see it where someone has to act. Illustrative copy, not historical client work.</p></header>
      <label className="osd" htmlFor="wb">Sample line</label>
      <input id="wb" value={text} maxLength={80} onChange={(e) => setText(e.target.value)} />
      <ol className="rail-steps">{states.map(([n], k) => <li key={n}><button type="button" aria-pressed={k === tab} onClick={() => setTab(k)}>{n}</button></li>)}</ol>
      <div className="wb-ui ink thin"><div className="wb-field">Address</div>{states[tab][1]}<div className="wb-btn">Continue</div></div>
    </section>
  );
}

export function Prototype({ which }: { which: "dial" | "copilot" | "workbench" }) {
  return which === "dial" ? <Dial /> : which === "copilot" ? <Copilot /> : <Workbench />;
}

/* ---------- proof blocks: empty by design ---------- */
export function Proof() {
  const collect = useCollect();
  if (!collect && !voices.length && !awards.length) return null;
  return (
    <section className="proof" aria-label="Voices and recognition">
      <header className="block-head"><h2 className="disp">Voices and recognition</h2><p>Added only with a name, permission and a public source.</p></header>
      <div className="proof-grid">
        {voices.map((v) => <blockquote key={v.name} className="ink thin"><p>"{v.quote}"</p><footer className="osd">{v.name} · {v.role}</footer></blockquote>)}
        {!voices.length && [1, 2, 3].map((n) => <div key={n} className="ink thin voice-slot"><span className="tape">Signal 0{n}</span><span className="chk">□ Name · role · permission · quote</span></div>)}
        {awards.map((a) => <a key={a.name} className="hud" href={a.url} target="_blank" rel="noreferrer">{a.name} · {a.issuer} · {a.year} ↗</a>)}
        {!awards.length && [1, 2].map((n) => <div key={n} className="ink thin award-slot"><span className="tape">Recognition 0{n}</span><span className="chk">□ Name · issuer · year · URL</span></div>)}
      </div>
    </section>
  );
}

export function Credits({ t }: { t: Transmission }) {
  return (
    <section className="credits ink thin" aria-label="Credits">
      <h2 className="osd">Credits and provenance</h2>
      <dl>
        <dt>Role</dt><dd>{t.owned ? t.owned.roles.join(" · ") : t.status === "vault" ? "To be confirmed with the evidence" : t.status === "analysis" ? "Unconfirmed; no authorship claimed" : t.status === "published" ? "Byline reported" : "Self-initiated"}</dd>
        <dt>Status</dt><dd>{provenanceLabel(t)}</dd>
        <dt>Year</dt><dd>{t.year}</dd>
        <dt>Format</dt><dd>{t.tags.join(" · ")}</dd>
      </dl>
    </section>
  );
}

export function NextSignal({ t }: { t: Transmission }) {
  const { tune } = useShell();
  const order = [...transmissions].sort((a, b) => a.id.localeCompare(b.id));
  const next = order[(order.findIndex((x) => x.id === t.id) + 1) % order.length];
  return (
    <nav className="next-signal" aria-label="Next channel">
      <span className="osd">Next signal</span>
      <button type="button" className="hud" onClick={() => tune(`/work/${next.slug}`)}>CH {next.id} · {next.title} →</button>
    </nav>
  );
}

export function Blocks({ t }: { t: Transmission }) {
  const blocks = compositions[t.slug] ?? [];
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "reader": return <Reader key={i} t={t} />;
          case "rail": return <StepRail key={i} block={b} />;
          case "network": return <Network key={i} block={b} />;
          case "works": return <Works key={i} t={t} />;
          case "process":
            return t.owned?.process ? <StepRail key={i} block={{ kind: "rail", variant: "timeline", title: "How a commission moves", intro: "As the studio describes its own process.", real: true, steps: t.owned.process.map((p) => ({ title: `${p.title} · ${p.time}`, text: p.text })) }} /> : null;
          case "ledger": return <Ledger key={i} t={t} title={b.title} intro={b.intro} />;
          case "strands": return <Strands key={i} t={t} />;
          case "links": return <Links key={i} t={t} />;
          case "prototype": return <Prototype key={i} which={b.which} />;
          case "artifacts":
            return (
              <section key={i} className="artifacts" aria-label={b.title}>
                <header className="block-head"><h2 className="disp">{b.title}</h2><p>{b.intro}</p></header>
                <div className="artifact-grid">{b.slots.map((s, k) => <ArtifactFrame key={k} slot={s.slot} label={s.label} n={k + 1} caption={`Reserved for the real ${s.label.toLowerCase()}.`} />)}</div>
              </section>
            );
        }
      })}
    </>
  );
}
