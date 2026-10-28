import type { CSSProperties } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { evidenceKind, provenanceLabel, publicLink, transmissions } from "../data/transmissions";
import { Banner, Blocks, Credits, FollowOn, Proof, State } from "../showcase/blocks";
import { useShell } from "../shell/context";
import { plateFor, sceneFor } from "../stage/registers";
import { useScene } from "../stage/useScene";

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default function Work() {
  const { slug } = useParams();
  const t = transmissions.find((x) => x.slug === slug);
  const { openContact } = useShell();
  const [copied, setCopied] = useState(false);
  useScene(t ? sceneFor(t) : { plate: plateFor("017"), reg: "natural", dim: 0.3 });

  if (!t)
    return (
      <section className="page-hero">
        <title>Signal lost · Jahan Patel</title>
        <div className="in">
          <span className="osd yel">404 · Signal lost</span>
          <h1 className="disp" tabIndex={-1}>This frequency is quiet.</h1>
          <Link className="inline-link" to="/catalogue">Back to the programme guide →</Link>
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
  const link = publicLink(t);
  const role = t.owned ? t.owned.roles.join(" · ") : t.role;
  return (
    <article className="work" data-register={sceneFor(t).reg}>
      <title>{`${t.title} · Jahan Patel`}</title>
      <meta name="description" content={t.summary} />
      <header className="work-hero">
        <div className="in">
          <span className="osd yel">CH {t.id} · {t.frequency} · {t.year}</span>
          <h1 className={`disp work-title ${t.title.length > 14 ? "long" : ""}`} style={{ "--lw": Math.max(...t.title.split(" ").map((w) => w.length)) } as CSSProperties} tabIndex={-1}>{t.title}</h1>
          <p className="narr ink"><b className="osd">Narrator</b>{t.subtitle}</p>
          <dl className="record" aria-label="The record">
            {role && <div><dt>Role</dt><dd>{role}</dd></div>}
            {t.context && <div><dt>Context</dt><dd>{t.context}</dd></div>}
            <div><dt>Evidence</dt><dd><State kind={evidenceKind(t)}>{provenanceLabel(t)}</State></dd></div>
            {link && <div><dt>Link</dt><dd><a href={link.url} target="_blank" rel="noreferrer">{host(link.url)} ↗</a></dd></div>}
          </dl>
          <p className="inline-row hero-actions">
            {t.owned && <><a className="inline-link" href={t.owned.liveUrl} target="_blank" rel="noreferrer">Visit live ↗</a><span aria-hidden="true">·</span></>}
            <button type="button" className="inline-link" onClick={copy}>{copied ? "Link copied" : "Copy link"}</button>
            <span aria-hidden="true">·</span>
            <button type="button" className="inline-link" onClick={() => openContact(t.frequency)}>Discuss a brief</button>
            {t.reading > 0 && <span className="osd read">{t.reading} min read</span>}
          </p>
        </div>
      </header>
      <div className="paper-band">
        <div className="in work-body">
          <Banner t={t} />
          <Blocks t={t} />
          <Proof />
          <Credits t={t} />
        </div>
      </div>
      <section className="work-cta">
        <div className="in">
          <h2 className="disp" data-reveal>Something on a similar wavelength?</h2>
          <button type="button" className="inline-link big" onClick={() => openContact(t.frequency)}>Discuss your brief →</button>
        </div>
      </section>
      <FollowOn t={t} />
    </article>
  );
}
