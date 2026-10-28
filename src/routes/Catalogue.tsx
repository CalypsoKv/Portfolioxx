import { useMemo, useState } from "react";
import { frequencies, provenanceLabel, transmissions, type Frequency } from "../data/transmissions";
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

export default function Catalogue() {
  useScene(GUIDE_PLATE, "natural", 0.35);
  const [q, setQ] = useState("");
  const [freq, setFreq] = useState<"All" | Frequency>("All");
  const [view, setView] = useState(() => (memory("itv_view", "guide") === "wall" ? "wall" : "guide"));
  const setViewSaved = (v: string) => {
    setView(v);
    try {
      localStorage.setItem("itv_view", v);
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
  const kind = (s: string) => (s === "published" || s === "owned" ? "vf" : s === "vault" ? "ph" : "dr");

  return (
    <section className="page-hero catalogue">
      <title>Programme guide · Interdimensional TV</title>
      <meta name="description" content="Every channel on Interdimensional TV, with honest provenance: published work, owned work, field analysis, concepts and the archive being restored." />
      <div className="in">
        <span className="osd yel">The programme guide · {live} on air · {transmissions.length - live} in the archive</span>
        <h1 className="disp" tabIndex={-1}>The work. Not the noise.</h1>
        <p className="narr ink"><b className="osd">Narrator</b>Each signal says where it comes from. Archive channels show how the work will be shown; nothing there is an outcome.</p>
        <div className="catalogue-tools">
          <label className="search"><span className="sr-only">Search the programme guide</span><input placeholder="Search a project, a discipline, a number…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <div className="chips" role="group" aria-label="Filter by frequency">
            {(["All", ...frequencies.map((f) => f.name)] as const).map((f) => (
              <button key={f} type="button" className="hud" aria-pressed={freq === f} onClick={() => setFreq(f)}>{f}</button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="View">
            <button type="button" className="hud" aria-pressed={view === "guide"} onClick={() => setViewSaved("guide")}>Guide</button>
            <button type="button" className="hud" aria-pressed={view === "wall"} onClick={() => setViewSaved("wall")}>Wall</button>
          </div>
        </div>

        {view === "guide" ? (
          <div className="epg" aria-live="polite">
            {items.map((t) => (
              <TuneLink key={t.id} to={`/work/${t.slug}`} className="row">
                <span className="n">{t.id}</span>
                <span className="tt disp">{t.title}</span>
                <span className="p"><State kind={kind(t.status)}>{provenanceLabel(t)}</State></span>
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
                  <span className="card-cap"><span className="osd yel">CH {t.id}</span><strong className="disp">{t.title}</strong><State kind={kind(t.status)}>{provenanceLabel(t)}</State></span>
                </TuneLink>
              </li>
            ))}
          </ul>
        )}
        {!items.length && (
          <div className="note"><strong className="osd">No matching signal</strong><button type="button" className="hud" onClick={() => { setQ(""); setFreq("All"); }}>Reset filters</button></div>
        )}
      </div>
    </section>
  );
}
