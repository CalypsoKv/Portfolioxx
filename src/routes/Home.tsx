import { useEffect, useRef, useState } from "react";
import { liveTransmissions, provenanceLabel, transmissions, contactEmail } from "../data/transmissions";
import { gsap, ScrollTrigger, scrollToY } from "../motion/clock";
import { staticBurst, tick } from "../motion/audio";
import { prefersReducedMotion } from "../motion/capability";
import { State } from "../showcase/blocks";
import { useShell } from "../shell/context";
import TuneLink from "../shell/TuneLink";
import { HOME_PLATE, plateFor, registerFor } from "../stage/registers";
import { pulse, requestScene, setProgress } from "../stage/state";

const FEATURED = ["007", "002", "005", "014", "000", "015"];
const LAYERS: [string, number, number][] = [["l0", 0, 0.8], ["l1", 0.8, 1.8], ["l2", 1.8, 3.6], ["l3", 3.6, 5.0], ["l4", 5.0, 6.2]];
const NAMES = ["Opening", "The broadcaster", "Choose a frequency", "On the guide", "Open a channel"];

export default function Home() {
  const { tier, openContact } = useShell();
  const theatre = tier !== "static";
  const root = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(0);
  const [at, setAt] = useState(0);
  const selRef = useRef(0);
  const featured = FEATURED.map((id) => transmissions.find((t) => t.id === id)!);
  const cur = featured[sel];

  const sceneFor = (k: number) => {
    const t = featured[k];
    requestScene({ plate: plateFor(t.id), reg: registerFor(t) });
  };

  useEffect(() => {
    requestScene({ plate: HOME_PLATE, reg: "natural" });
  }, []);

  useEffect(() => {
    if (!theatre) return;
    const reduce = prefersReducedMotion();
    const vh = () => window.innerHeight;
    const ctx = gsap.context(() => {
      const els = Object.fromEntries(LAYERS.map(([id]) => [id, root.current!.querySelector<HTMLElement>(`#${id}`)!]));
      const show = (id: string) => {
        els[id].toggleAttribute("inert", false);
        gsap.to(els[id], { opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.out", overwrite: true });
      };
      const hide = (id: string) => {
        els[id].toggleAttribute("inert", true);
        gsap.to(els[id], { opacity: 0, duration: reduce ? 0 : 0.6, ease: "power4.in", overwrite: true });
      };
      LAYERS.forEach(([id, a, b], i) => {
        if (i) els[id].toggleAttribute("inert", true);
        ScrollTrigger.create({
          trigger: root.current,
          start: () => vh() * a,
          end: () => vh() * b,
          invalidateOnRefresh: true,
          onEnter: () => show(id),
          onEnterBack: () => show(id),
          onLeave: () => hide(id),
          onLeaveBack: () => hide(id),
        });
        if (i) ScrollTrigger.create({ trigger: root.current, start: () => vh() * a, onEnter: () => pulse(0.5), onEnterBack: () => pulse(0.5) });
      });
      // the chosen channel takes the screen only while the "choose" layer is up
      ScrollTrigger.create({
        trigger: root.current,
        start: () => vh() * 1.8,
        end: () => vh() * 3.6,
        invalidateOnRefresh: true,
        onEnter: () => sceneFor(selRef.current),
        onEnterBack: () => sceneFor(selRef.current),
        onLeave: () => requestScene({ plate: HOME_PLATE, reg: "natural" }),
        onLeaveBack: () => requestScene({ plate: HOME_PLATE, reg: "natural" }),
      });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          setProgress(self.progress);
          const y = window.scrollY;
          let c = 0;
          LAYERS.forEach(([, a], i) => {
            if (y >= vh() * a - vh() * 0.05) c = i;
          });
          setAt(c);
        },
      });
    }, root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theatre]);

  const choose = (k: number) => {
    setSel(k);
    selRef.current = k;
    tick();
    staticBurst();
    sceneFor(k);
  };
  const go = (i: number) => scrollToY(window.innerHeight * (LAYERS[i][1] + (i ? 0.12 : 0)));

  return (
    <div ref={root} className={`home ${theatre ? "theatre" : "flow"}`}>
      <title>Jahan Patel · Interdimensional TV</title>
      <meta name="description" content="Interdimensional TV: Jahan Patel's independent frequency for editorial writing, product narratives, research and digital brand systems." />
      {theatre && (
        <nav className="dots" aria-label="Sections">
          {LAYERS.map((_, i) => (
            <button key={i} type="button" className={i === at ? "on" : ""} aria-label={`Go to ${NAMES[i]}`} aria-current={i === at ? "true" : undefined} onClick={() => go(i)} />
          ))}
        </nav>
      )}

      <section className="layer" id="l0" aria-label="Opening">
        <div className="osd yel">An independent frequency by Jahan Patel · Vol. 01</div>
        <h1 className="disp home-title" tabIndex={-1}>
          <span className="a">Interdimensional</span>
          <span className="b">Television</span>
        </h1>
        <p className="narr ink"><b className="osd">Narrator</b>One person. Many frequencies. Writing, product, research.</p>
        <div className="osd yel hint">Scroll to tune in ↓</div>
      </section>

      <section className="layer" id="l1" aria-label="The broadcaster">
        <div className="osd yel">I. The broadcaster</div>
        <h2 className="disp home-h2">One person.<br />Many frequencies.</h2>
        <div className="chips"><span className="tape">Writing</span><span className="tape">Product</span><span className="tape">Research</span></div>
        <TuneLink className="hud" to="/about">Meet the broadcaster</TuneLink>
      </section>

      <section className="layer" id="l2" aria-label="Choose a frequency">
        <div className="osd yel">II. Choose your frequency</div>
        <h2 className={`disp home-channel ${cur.title.length > 12 ? "long" : ""}`}>{cur.title}</h2>
        <div className="meta">
          <span className="tape">CH. {cur.id} · {provenanceLabel(cur)}</span>
          <State kind={cur.status === "published" || cur.status === "owned" ? "vf" : "dr"}>{provenanceLabel(cur)}</State>
        </div>
        <p className="desc">{cur.summary}</p>
        <div className="chips" role="group" aria-label="Featured channels">
          {featured.map((t, k) => (
            <button key={t.id} type="button" className="hud" aria-pressed={k === sel} onClick={() => choose(k)}>CH {t.id} · {t.title.split(" ")[0]}</button>
          ))}
          <TuneLink className="hud" to={`/work/${cur.slug}`}>Open transmission →</TuneLink>
        </div>
      </section>

      <section className="layer" id="l3" aria-label="On the guide">
        <div className="osd yel">III. On the guide · {liveTransmissions.length} on air, {transmissions.length - liveTransmissions.length} in the archive</div>
        <div className="epg">
          {liveTransmissions.map((t) => (
            <TuneLink key={t.id} to={`/work/${t.slug}`} className="row">
              <span className="n">{t.id}</span>
              <span className="tt disp">{t.title}</span>
              <span className="p"><State kind={t.status === "published" || t.status === "owned" ? "vf" : "dr"}>{provenanceLabel(t)}</State></span>
              <span className="d">{t.subtitle}</span>
            </TuneLink>
          ))}
        </div>
        <TuneLink className="hud" to="/catalogue">The full programme guide</TuneLink>
      </section>

      <section className="layer" id="l4" aria-label="Open a channel">
        <div className="osd yel">IV. The next transmission starts with you</div>
        <h2 className="disp home-h2">Have something on your wavelength?</h2>
        <div className="chips">
          <button type="button" className="hud" onClick={() => openContact()}>Let's make contact</button>
          <a className="hud" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <TuneLink className="hud" to="/services">Ways to work together</TuneLink>
        </div>
      </section>
    </div>
  );
}
