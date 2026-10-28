import type { CSSProperties } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { provenanceLabel, transmissions } from "../data/transmissions";
import { Banner, Blocks, Credits, NextSignal, Proof, State } from "../showcase/blocks";
import { useShell } from "../shell/context";
import { plateFor, registerFor } from "../stage/registers";
import { useScene } from "../stage/useScene";

export default function Work() {
  const { slug } = useParams();
  const t = transmissions.find((x) => x.slug === slug);
  const { openContact } = useShell();
  const [copied, setCopied] = useState(false);
  useScene(t ? plateFor(t.id) : plateFor("017"), t ? registerFor(t) : "natural", t ? 0 : 0.3);

  if (!t)
    return (
      <section className="page-hero">
        <title>Signal lost · Interdimensional TV</title>
        <div className="in">
          <span className="osd yel">404 · Signal lost</span>
          <h1 className="disp" tabIndex={-1}>This frequency is quiet.</h1>
          <Link className="hud" to="/catalogue">Back to the programme guide</Link>
        </div>
      </section>
    );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const kind = t.status === "published" || t.status === "owned" ? "vf" : t.status === "vault" ? "ph" : "dr";
  return (
    <article className="work" data-register={registerFor(t)}>
      <title>{`${t.title} · Interdimensional TV`}</title>
      <meta name="description" content={t.summary} />
      <header className="work-hero">
        <div className="in">
          <span className="osd yel">CH {t.id} · {t.frequency} · {t.year}</span>
          <h1 className={`disp work-title ${t.title.length > 14 ? "long" : ""}`} style={{ "--lw": Math.max(...t.title.split(" ").map((w) => w.length)) } as CSSProperties} tabIndex={-1}>{t.title}</h1>
          <p className="narr ink"><b className="osd">Narrator</b>{t.subtitle}</p>
          <div className="chips">
            <State kind={kind}>{provenanceLabel(t)}</State>
            {t.reading > 0 && <span className="chip">{t.reading} min read</span>}
            {t.tags.map((x) => <span key={x} className="chip">{x}</span>)}
          </div>
          <div className="chips">
            {t.owned && <a className="hud" href={t.owned.liveUrl} target="_blank" rel="noreferrer">Visit live ↗</a>}
            <button type="button" className="hud" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
            <button type="button" className="hud" onClick={() => openContact(t.frequency)}>Discuss a brief</button>
          </div>
        </div>
      </header>
      <div className="paper-band">
        <div className="in work-body">
          <Banner t={t} />
          <Blocks t={t} />
          <Proof />
          <Credits t={t} />
          <NextSignal t={t} />
        </div>
      </div>
      <section className="work-cta">
        <div className="in">
          <h2 className="disp">Something on a similar wavelength?</h2>
          <button type="button" className="hud" onClick={() => openContact(t.frequency)}>Discuss your brief</button>
        </div>
      </section>
    </article>
  );
}

