import { useEffect, useRef, useState, type CSSProperties } from "react";
import { contactEmail, evidenceKind, liveTransmissions, provenanceLabel, transmissions } from "../data/transmissions";
import { gsap, ScrollTrigger } from "../motion/clock";
import { staticBurst, tick } from "../motion/audio";
import { prefersReducedMotion } from "../motion/capability";
import { State } from "../showcase/blocks";
import { useShell } from "../shell/context";
import TuneLink from "../shell/TuneLink";
import { HOME_PLATE, sceneFor } from "../stage/registers";
import { pulse, requestScene, setProgress } from "../stage/state";

const FEATURED = ["007", "019", "003", "020", "021", "002"];
const SLOT = 0.62; // viewport heights of scroll per featured channel
const L2 = [1.8, 1.8 + FEATURED.length * SLOT];
const LAYERS: [string, number, number][] = [["l0", 0, 0.8], ["l1", 0.8, L2[0]], ["l2", L2[0], L2[1]], ["l3", L2[1], L2[1] + 1.4], ["l4", L2[1] + 1.4, L2[1] + 3]];
// The last layer must still be showing at the bottom of the page: the page ends inside its window.
const TRACK = LAYERS[4][2] + 0.2;
const featured = FEATURED.map((id) => transmissions.find((t) => t.id === id)!);
const homeScene = (dim = 0) => requestScene({ plate: HOME_PLATE, reg: "natural", dim });
// The screen dims under words: the portrait and the featured loops sit behind type.
const UNDER_TEXT = 0.42;

/** The engraved portrait with a chronophotograph trail: four fainter exposures follow the figure on springs, after Marey. */
function Broadcaster({ active }: { active: boolean }) {
  const fig = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const root = fig.current!;
    // The sharp exposure leads; each fainter one follows the one before it.
    const layers = [...root.querySelectorAll<HTMLElement>("[data-exp]")].sort((a, b) => Number(a.dataset.exp) - Number(b.dataset.exp));
    const pos = layers.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const target = { x: 0, y: 0 };
    let pointer = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = true;
      target.x = (e.clientX / window.innerWidth - 0.5) * 70;
      target.y = (e.clientY / window.innerHeight - 0.5) * 26;
    };
    const step = (t: number) => {
      const tx = pointer ? target.x : Math.sin(t * 0.7) * 22;
      const ty = pointer ? target.y : Math.cos(t * 0.5) * 6;
      layers.forEach((el, i) => {
        const lead = i === 0 ? { x: tx, y: ty } : pos[i - 1];
        const p = pos[i], k = i === 0 ? 0.08 : 0.055;
        p.vx = (p.vx + (lead.x - p.x) * k) * 0.78;
        p.vy = (p.vy + (lead.y - p.y) * k) * 0.78;
        p.x += p.vx;
        p.y += p.vy;
        el.style.transform = `translate3d(${(p.x - i * 34).toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    gsap.ticker.add(step);
    return () => {
      window.removeEventListener("pointermove", move);
      gsap.ticker.remove(step);
    };
  }, [active]);
  return (
    <div className="broadcaster" ref={fig}>
      {[3, 2, 1].map((i) => (
        <img key={i} data-exp={i} src="/people/jahan-engraved.webp" alt="" aria-hidden="true" className="exp" style={{ "--o": 0.07 + (3 - i) * 0.06, zIndex: 3 - i } as CSSProperties} decoding="async" />
      ))}
      <img data-exp={0} src="/people/jahan-engraved.webp" alt="Engraved portrait of Jahan Patel smiling, in a light blazer and tie, a camera on a strap around his neck." className="main" width="805" height="1295" decoding="async" />
    </div>
  );
}

/** The programme guide scrolls itself, like a TV listings channel. Hover, focus or touch hands it back to you. */
function AutoGuide({ live }: { live: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || !live || prefersReducedMotion()) return;
    let held = false;
    const hold = () => (held = true);
    const free = () => (held = false);
    const first = el.querySelector<HTMLElement>(".epg-list");
    const step = () => {
      if (held || !first || el.closest("[inert]")) return;
      el.scrollTop += 0.45;
      if (el.scrollTop >= first.offsetHeight) el.scrollTop -= first.offsetHeight;
    };
    el.addEventListener("pointerenter", hold);
    el.addEventListener("pointerleave", free);
    el.addEventListener("focusin", hold);
    el.addEventListener("focusout", free);
    el.addEventListener("touchstart", hold, { passive: true });
    gsap.ticker.add(step);
    return () => {
      gsap.ticker.remove(step);
      el.removeEventListener("pointerenter", hold);
      el.removeEventListener("pointerleave", free);
      el.removeEventListener("focusin", hold);
      el.removeEventListener("focusout", free);
      el.removeEventListener("touchstart", hold);
    };
  }, [live]);
  const rows = (copy: boolean) => (
    <div className="epg-list" {...(copy ? { inert: true, "aria-hidden": true } : {})}>
      {liveTransmissions.map((t) => (
        <TuneLink key={t.id} to={`/work/${t.slug}`} className="row" tabIndex={copy ? -1 : undefined}>
          <span className="n">{t.id}</span>
          <span className="tt disp">{t.title}</span>
          <span className="p"><State kind={evidenceKind(t)}>{provenanceLabel(t)}</State></span>
          <span className="d">{t.subtitle}</span>
        </TuneLink>
      ))}
    </div>
  );
  return (
    <div className={`epg ${live ? "auto" : ""}`} ref={box} data-lenis-prevent>
      {rows(false)}
      {live && rows(true)}
    </div>
  );
}

export default function Home() {
  const { tier, openContact } = useShell();
  const theatre = tier !== "static";
  const root = useRef<HTMLDivElement>(null);
  const tuner = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(0);
  const [at, setAt] = useState(0);
  const cur = featured[sel];

  useEffect(() => {
    homeScene();
    return () => setProgress(0);
  }, []);

  useEffect(() => {
    if (!theatre) return;
    const reduce = prefersReducedMotion();
    const vh = () => window.innerHeight;
    let k = -1;
    let layer = -1;
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
      // One reading of the scroll position drives the layer, the featured channel and the tuner needle.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          setProgress(self.progress);
          const y = window.scrollY / vh();
          let c = 0;
          LAYERS.forEach(([, a], i) => {
            if (y >= a - 0.05) c = i;
          });
          if (c !== layer) {
            layer = c;
            setAt(c);
            if (c !== 2) {
              k = -1;
              homeScene(c === 1 ? 0.3 : 0);
            }
          }
          const p = Math.min(1, Math.max(0, (y - L2[0]) / (L2[1] - L2[0])));
          tuner.current?.style.setProperty("--p", p.toFixed(4));
          if (c === 2) {
            const next = Math.min(FEATURED.length - 1, Math.floor(p * FEATURED.length));
            if (next !== k) {
              k = next;
              setSel(next);
              tick();
              staticBurst();
              requestScene(sceneFor(featured[next], UNDER_TEXT));
            }
          }
        },
      });
    }, root);
    return () => ctx.revert();
  }, [theatre]);

  // Each new channel cuts in with a hard, stepped wipe.
  useEffect(() => {
    if (!theatre || prefersReducedMotion()) return;
    const els = root.current?.querySelectorAll("#l2 .cut");
    if (els?.length) gsap.fromTo(els, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.42, ease: "steps(5)", stagger: 0.06, overwrite: true });
  }, [sel, theatre]);

  return (
    <div ref={root} className={`home ${theatre ? "theatre" : "flow"}`} style={theatre ? { height: `${TRACK * 100}vh` } : undefined}>
      <title>Jahan Patel · Writer, web designer and animator</title>
      <meta name="description" content="Jahan Patel writes, designs websites and brands, and makes AI-assisted animation. 200+ published articles, a B2B SaaS website rebuilt end to end, brand systems and animated stories." />

      <section className="layer" id="l0" aria-label="Opening">
        <div className="osd yel">An independent frequency · Vol. 01</div>
        <h1 className="disp home-title" tabIndex={-1}>
          <span className="a">Jahan</span>
          <span className="b">Patel</span>
        </h1>
        <p className="narr ink"><b className="osd">Narrator</b>Words, websites, brand design and AI-assisted animation. One person, many frequencies.</p>
        <div className="osd yel hint">Scroll to tune in ↓</div>
      </section>

      <section className="layer" id="l1" aria-label="The broadcaster">
        <Broadcaster active={theatre ? at === 1 : false} />
        <div className="osd yel">I. The broadcaster</div>
        <h2 className="disp home-h2">One person.<br />Many frequencies.</h2>
        <p className="desc">A physics graduate who became a writer: 200+ published articles, a B2B SaaS website rebuilt end to end, brand systems, and animated stories made with AI tools.</p>
        <div className="chips"><span className="tape">Writing</span><span className="tape">Websites</span><span className="tape">Design</span><span className="tape">Animation</span></div>
        <TuneLink className="inline-link" to="/about">Meet the broadcaster →</TuneLink>
      </section>

      <section className="layer" id="l2" aria-label="Now showing">
        {theatre ? (
          <>
            <div className="osd yel">II. Now showing · CH {cur.id} · {sel + 1} of {featured.length}</div>
            <h2 className={`disp home-channel cut ${cur.title.length > 12 ? "long" : ""}`}>{cur.title}</h2>
            <div className="meta cut">
              <State kind={evidenceKind(cur)}>{provenanceLabel(cur)}</State>
              <span className="chip">{cur.frequency} · {cur.year}</span>
            </div>
            <p className="desc cut">{cur.summary}</p>
            <TuneLink className="inline-link" to={`/work/${cur.slug}`}>Open the channel →</TuneLink>
            <div className="tuner" ref={tuner} aria-hidden="true">
              <span className="band">{featured.map((t, i) => <i key={t.id} className={i === sel ? "on" : ""}>{t.id}</i>)}</span>
              <span className="needle" />
              <span className="osd keep">Keep scrolling to change channel</span>
            </div>
          </>
        ) : (
          <>
            <div className="osd yel">II. Now showing</div>
            <ol className="featured-list">
              {featured.map((t) => (
                <li key={t.id}>
                  <span className="osd">CH {t.id} · {t.frequency}</span>
                  <h3 className="disp">{t.title}</h3>
                  <State kind={evidenceKind(t)}>{provenanceLabel(t)}</State>
                  <p>{t.summary}</p>
                  <TuneLink className="inline-link" to={`/work/${t.slug}`}>Open the channel →</TuneLink>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      <section className="layer" id="l3" aria-label="On the guide">
        <div className="osd yel">III. On the guide · {liveTransmissions.length} on air, {transmissions.length - liveTransmissions.length} in the archive</div>
        <AutoGuide live={theatre} />
        <TuneLink className="inline-link" to="/catalogue">The full programme guide →</TuneLink>
      </section>

      <section className="layer" id="l4" aria-label="Open a channel">
        <div className="osd yel">IV. The next transmission starts with you</div>
        <h2 className="disp home-h2">Have something on your wavelength?</h2>
        <p className="contact-line">
          <a className="big-mail" href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
        <p className="inline-row">
          <button type="button" className="inline-link" onClick={() => openContact()}>Send a short brief</button>
          <span aria-hidden="true">·</span>
          <TuneLink className="inline-link" to="/services">Ways to work together</TuneLink>
        </p>
      </section>
    </div>
  );
}
