import { useMemo, useState } from "react";
import { evidenceKind, frequencies, provenanceLabel, transmissions, type Frequency } from "../data/transmissions";
import { State } from "../showcase/blocks";
import TuneLink from "../shell/TuneLink";
import { GUIDE_PLATE, thumbFor } from "../stage/registers";
import { useScene } from "../stage/useScene";

function memory(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

/** A row of text tabs: one choice at a time, no button chrome. */
function Tabs<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o} type="button" className="tab" aria-pressed={value === o} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

export default function Catalogue() {
  useScene({ plate: GUIDE_PLATE, reg: "natural", dim: 0.35 });
  const [q, setQ] = useState("");
  const [freq, setFreq] = useState<"All" | Frequency>("All");
  const [view, setView] = useState<"Guide" | "Wall">(() => (memory("itv_view", "guide") === "wall" ? "Wall" : "Guide"));
  const setViewSaved = (v: "Guide" | "Wall") => {
    setView(v);
    try {
      localStorage.setItem("itv_view", v.toLowerCase());
    } catch {
      /* optional */
    }
  };
  const items = useMemo(
    () =>
      transmissions
        .filter((t) => (freq === "All" || t.frequency === freq) && `${t.title} ${t.subtitle} ${t.frequency} ${t.id} ${t.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => Number(a.status === "vault") - Number(b.status === "vault") || a.id.localeCompare(b.id)),
    [q, freq],
  );
  const live = transmissions.filter((t) => t.status !== "vault").length;

  return (
    <section className="page-hero catalogue">
      <title>Programme guide · Jahan Patel</title>
      <meta name="description" content="Every channel of Jahan Patel's work, with honest provenance: published, reported, shown with permission, owned, read, self-initiated, or still in the archive." />
      <div className="in">
        <span className="osd yel">The programme guide · {live} on air · {transmissions.length - live} in the archive</span>
        <h1 className="disp" tabIndex={-1}>The work. Not the noise.</h1>
        <p className="narr ink"><b className="osd">Narrator</b>Every channel says what kind of evidence stands behind it: published, reported, shown with permission, owned, or self-initiated.</p>
        <div className="catalogue-tools">
          <label className="search"><span className="sr-only">Search the programme guide</span><input placeholder="Search a project, a discipline, a number…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <Tabs label="Filter by frequency" options={["All", ...frequencies.map((f) => f.name)] as const} value={freq} onChange={setFreq} />
          <Tabs label="View" options={["Guide", "Wall"] as const} value={view} onChange={setViewSaved} />
        </div>

        {view === "Guide" ? (
          <div className="epg" aria-live="polite">
            {items.map((t) => (
              <TuneLink key={t.id} to={`/work/${t.slug}`} className="row">
                <span className="n">{t.id}</span>
                <span className="tt disp">{t.title}</span>
                <span className="p"><State kind={evidenceKind(t)}>{provenanceLabel(t)}</State></span>
                <span className="d">{t.subtitle}</span>
              </TuneLink>
            ))}
          </div>
        ) : (
          <ul className="wall" aria-live="polite">
            {items.map((t) => (
              <li key={t.id}>
                <TuneLink to={`/work/${t.slug}`} className="card-tv">
                  <span className="card-shot"><img src={thumbFor(t.id)} alt="" loading="lazy" decoding="async" width="640" height="360" /></span>
                  <span className="card-cap"><span className="osd yel">CH {t.id}</span><strong className="disp">{t.title}</strong><State kind={evidenceKind(t)}>{provenanceLabel(t)}</State></span>
                </TuneLink>
              </li>
            ))}
          </ul>
        )}
        {!items.length && (
          <div className="note"><strong className="osd">No matching signal</strong><button type="button" className="inline-link" onClick={() => { setQ(""); setFreq("All"); }}>Reset filters</button></div>
        )}
      </div>
    </section>
  );
}
