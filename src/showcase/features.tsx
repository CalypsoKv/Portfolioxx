import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Piece, Transmission } from "../data/transmissions";
import { Draggable, gsap, SplitText } from "../motion/clock";
import { prefersReducedMotion } from "../motion/capability";
import { useShell } from "../shell/context";
import type { FlowStep } from "./compositions";
import { State } from "./StateChip";

const still = () => prefersReducedMotion();

/* ---------- proof strip: numbers that count up, each with its source ---------- */
const parts = (v: string) => {
  const m = v.match(/^([^\d]*)([\d,.]+)(.*)$/);
  return m ? { pre: m[1], n: parseFloat(m[2].replace(/,/g, "")), post: m[3], comma: m[2].includes(",") } : null;
};
export function Metrics({ t, title, intro }: { t: Transmission; title: string; intro: string }) {
  const root = useRef<HTMLElement>(null);
  const { tier } = useShell();
  useEffect(() => {
    const el = root.current;
    if (!el || tier === "static" || still()) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
        const p = parts(n.dataset.count!);
        if (!p) return;
        const o = { v: 0 };
        n.textContent = `${p.pre}0${p.post}`;
        gsap.to(o, {
          v: p.n,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: n, start: "top 90%", once: true },
          onUpdate: () => (n.textContent = `${p.pre}${p.comma ? Math.round(o.v).toLocaleString("en-IN") : Math.round(o.v)}${p.post}`),
        });
      });
    }, el);
    return () => ctx.revert();
  }, [tier]);
  if (!t.metrics?.length) return null;
  return (
    <section className="metrics" ref={root} aria-label={title}>
      <header className="block-head"><h2 className="disp" data-reveal>{title}</h2><p>{intro}</p></header>
      <ul className="metric-grid">
        {t.metrics.map((m) => (
          <li key={m.label} className="metric">
            <strong className="disp" aria-hidden="true" data-count={m.value}>{m.value}</strong>
            <span className="sr-only">{m.value}</span>
            <span className="metric-label">{m.label}</span>
            <State kind={/verified/i.test(m.source) ? "vf" : "dr"}>{m.source}</State>
          </li>
        ))}
      </ul>
      <p className="fine">Reported figures come from Jahan’s CV and describe team work in roles he held. They are not audited, and they are not a promise.</p>
    </section>
  );
}

/* ---------- newspaper: the public bylines as a broadsheet front page that prints in ---------- */
export function Newspaper({ t }: { t: Transmission }) {
  const root = useRef<HTMLElement>(null);
  const { tier } = useShell();
  const b = t.bylines ?? [];
  useEffect(() => {
    const el = root.current;
    if (!el || tier === "static" || still()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%", once: true } });
      tl.from(el, { yPercent: 6, rotateX: 18, transformOrigin: "50% 100%", opacity: 0, duration: 0.7, ease: "power3.out" })
        .from(".rule", { scaleX: 0, transformOrigin: "0 50%", duration: 0.5, ease: "power2.inOut", stagger: 0.05 }, 0.2)
        .to(".lead .hl-print", { duration: 1.1, scrambleText: { text: b[0]?.title ?? "", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ&#%", revealDelay: 0.25, speed: 0.6 } }, 0.35)
        .from(".press", { clipPath: "inset(0 0 100% 0)", duration: 0.45, ease: "steps(5)", stagger: 0.035 }, 0.5);
    }, el);
    return () => ctx.revert();
  }, [tier, b]);
  if (!b.length) return null;
  const [lead, second, third, ...rest] = b;
  return (
    <section className="broadsheet" ref={root} aria-label="Front page: published bylines">
      <header className="mast">
        <span className="osd">{b[b.length - 1].date} – {b[0].date}</span>
        <h2 className="masthead">The DigiStatement Bylines</h2>
        <span className="osd">By Jahan Patel · {b.length} articles on this page · each checked on the live site, 28 Oct 2026</span>
      </header>
      <i className="rule" /><i className="rule thin" />
      <div className="front">
        <article className="lead">
          <span className="kicker osd">{lead.section} · {lead.date}</span>
          <h3 className="hl"><a href={lead.url} target="_blank" rel="noreferrer"><span className="hl-print" aria-hidden="true">{lead.title}</span><span className="sr-only">{lead.title}</span></a></h3>
          {lead.note && <p className="press standfirst">{lead.note}</p>}
          <a className="press more" href={lead.url} target="_blank" rel="noreferrer">Read on digistatement.com ↗</a>
        </article>
        <div className="side">
          {[second, third].filter(Boolean).map((x) => (
            <article key={x.url} className="press second">
              <span className="kicker osd">{x.section} · {x.date}</span>
              <h3 className="hl2"><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></h3>
            </article>
          ))}
        </div>
        <i className="rule thin" />
        <ul className="cols">
          {rest.map((x) => (
            <li key={x.url} className="press">
              <span className="kicker osd">{x.section} · {x.date}</span>
              <a href={x.url} target="_blank" rel="noreferrer">{x.title}</a>
            </li>
          ))}
        </ul>
      </div>
      <footer className="imprint osd">Headlines exactly as published. Archive of every article: <a href="https://digistatement.com/author/jahan-patel/" target="_blank" rel="noreferrer">digistatement.com/author/jahan-patel ↗</a></footer>
    </section>
  );
}

/* ---------- slider: drag with momentum, headlines word by word ---------- */
export function Slider({ items, title, intro }: { items: Piece[]; title: string; intro: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const { tier } = useShell();
  useEffect(() => {
    const el = root.current, sc = track.current;
    if (!el || !sc) return;
    const fine = matchMedia("(pointer: fine)").matches;
    const motion = tier !== "static" && !still();
    let last = sc.scrollLeft;
    const cards = [...sc.querySelectorAll<HTMLElement>(".slide")];
    const onScroll = () => {
      const max = sc.scrollWidth - sc.clientWidth;
      bar.current?.style.setProperty("--p", String(max > 0 ? sc.scrollLeft / max : 0));
      if (!motion) return;
      const v = sc.scrollLeft - last;
      last = sc.scrollLeft;
      gsap.to(cards, { skewX: gsap.utils.clamp(-7, 7, -v * 0.35), duration: 0.35, ease: "power3.out", overwrite: true });
      gsap.to(cards, { skewX: 0, duration: 0.6, delay: 0.15, ease: "power3.out" });
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const ctx = gsap.context(() => {
      if (!motion) return;
      const splits = [...el.querySelectorAll<HTMLElement>(".slide h3")].map((h) => SplitText.create(h, { type: "words", mask: "words" }));
      gsap.from(splits.flatMap((s) => s.words), { yPercent: 110, duration: 0.7, ease: "power3.out", stagger: 0.025, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      return () => splits.forEach((s) => s.revert());
    }, el);
    // Mouse users drag the row itself; touch and keyboard scroll it natively.
    const drag = fine ? Draggable.create(sc, { type: "scrollLeft", inertia: true, edgeResistance: 0.85, dragClickables: true, allowNativeTouchScrolling: true, cursor: "grab", activeCursor: "grabbing", snap: (v: number) => -nearest(sc, -v) })[0] : null;
    return () => {
      sc.removeEventListener("scroll", onScroll);
      drag?.kill();
      ctx.revert();
    };
  }, [tier]);
  const step = (dir: number) => {
    const sc = track.current;
    if (!sc) return;
    const w = sc.querySelector<HTMLElement>(".slide")?.offsetWidth ?? 300;
    sc.scrollBy({ left: dir * (w + 18), behavior: still() ? "auto" : "smooth" });
  };
  return (
    <section className="slider" ref={root} aria-label={title}>
      <header className="block-head"><h2 className="disp" data-reveal>{title}</h2><p>{intro}</p></header>
      <div
        className="slide-track"
        ref={track}
        tabIndex={0}
        role="region"
        aria-label={`${title}, ${items.length} items. Use the arrow keys to move.`}
        data-lenis-prevent
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            step(e.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {items.map((p, i) => (
          <article key={p.title} className="slide ink thin">
            <span className="osd">{String(i + 1).padStart(2, "0")} · {p.kicker}</span>
            <h3 className="disp">{p.title}</h3>
            <p>{p.text}</p>
            {p.url && <a className="inline-link" href={p.url} target="_blank" rel="noreferrer">Read it ↗</a>}
          </article>
        ))}
      </div>
      <span className="slide-bar" ref={bar} aria-hidden="true"><i /></span>
    </section>
  );
}
/** The scroll position that puts the card edge nearest to v at the start of the row. */
function nearest(sc: HTMLElement, v: number) {
  const pad = parseFloat(getComputedStyle(sc).paddingLeft) || 0;
  const base = sc.getBoundingClientRect().left - sc.scrollLeft + pad;
  const xs = [...sc.querySelectorAll<HTMLElement>(".slide")].map((c) => c.getBoundingClientRect().left - base);
  const max = sc.scrollWidth - sc.clientWidth;
  return Math.max(0, Math.min(max, xs.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), 0)));
}

/* ---------- website copy, as written ---------- */
export function CopySpecimen({ t }: { t: Transmission }) {
  const c = t.copy;
  const head = useRef<HTMLSpanElement>(null);
  const { tier } = useShell();
  const [i, setI] = useState(0);
  const many = (c?.headlines?.length ?? 0) > 1;
  useEffect(() => {
    if (!many || tier === "static" || still()) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % c!.headlines!.length), 3600);
    return () => clearInterval(id);
  }, [many, tier, c]);
  useEffect(() => {
    if (!many || !head.current || tier === "static" || still()) return;
    const tw = gsap.to(head.current, { duration: 0.9, scrambleText: { text: c!.headlines![i], chars: "lowerCase", speed: 0.7 } });
    return () => {
      tw.kill();
    };
  }, [i, many, tier, c]);
  if (!c) return null;
  return (
    <section className="specimen" aria-label={c.title}>
      <header className="block-head"><h2 className="disp" data-reveal>{c.title}</h2><p>{c.intro}</p></header>
      <div className="browser ink thin">
        <div className="chrome" aria-hidden="true"><i /><i /><i /><span className="osd">{t.title} · {c.title}</span></div>
        <div className="page">
          {c.headlines && (
            <div className="hero-copy">
              <span className="osd">{many ? `Headline option ${i + 1} of ${c.headlines.length}` : "Headline"}</span>
              <p className="headline disp" aria-hidden={many || undefined}><span ref={head}>{c.headlines[0]}</span></p>
              {many && <ol className="sr-only">{c.headlines.map((h) => <li key={h}>{h}</li>)}</ol>}
            </div>
          )}
          {c.beats && (
            <ol className="beats">
              {c.beats.map((b, k) => <li key={b} data-reveal><span className="osd">Beat {k + 1}</span>{b}</li>)}
            </ol>
          )}
          {c.blocks && (
            <div className="copy-blocks">
              {c.blocks.map((b) => (
                <div key={b.label} className="copy-block" data-reveal>
                  <span className="osd">{b.label}</span>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>
          )}
          {c.outline && (
            <div className="outline" aria-label="Page outline">
              <span className="osd">Section order</span>
              <ol>{c.outline.map((o, k) => <li key={o} style={{ "--w": `${55 + ((k * 37) % 40)}%` } as CSSProperties}><span>{o}</span></li>)}</ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- a chain of steps that lights up as you scroll ---------- */
export function Flow({ title, intro, steps, timeline }: { title: string; intro: string; steps: FlowStep[]; timeline?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const { tier } = useShell();
  useEffect(() => {
    const el = root.current;
    if (!el || tier === "static" || still()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el.querySelector(".flow-list"), start: "top 75%", end: "bottom 55%", scrub: 0.6 };
      gsap.fromTo(".flow-line i", { scale: 0 }, { scale: 1, ease: "none", scrollTrigger: st });
      gsap.fromTo(".flow-list li", { opacity: 0.18 }, { opacity: 1, ease: "none", stagger: 0.5, scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, [tier]);
  return (
    <section className={`flow ${timeline ? "timeline" : ""}`} ref={root} aria-label={title} data-many={!timeline && steps.length > 6 ? "" : undefined}>
      <header className="block-head"><h2 className="disp" data-reveal>{title}</h2><p>{intro}</p></header>
      <div className="flow-wrap">
        <span className="flow-line" aria-hidden="true"><i /></span>
        <ol className="flow-list">
          {steps.map((s, k) => (
            <li key={`${s.label}-${k}`}>
              <span className="osd">{timeline ? s.label : String(k + 1).padStart(2, "0")}</span>
              <strong className="disp">{timeline ? s.note : s.label}</strong>
              {!timeline && s.note && <small>{s.note}</small>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- a script page ---------- */
export function Script({ t }: { t: Transmission }) {
  const s = t.script;
  if (!s) return null;
  return (
    <section className="script" aria-label={s.title}>
      <header className="block-head"><h2 className="disp" data-reveal>{s.title}</h2><p>{s.intro}</p></header>
      {s.scenes.map((sc, k) => (
        <article key={sc.heading} className="script-page ink thin">
          <div className="script-text">
            <h3 className="slug">Scene {k + 1}. {sc.heading}</h3>
            {sc.setting && <p className="setting">{sc.setting}</p>}
            {sc.lines.map((l, j) => (
              <div key={j} className="line">
                <span className="who">{l.who}</span>
                {l.dir && <span className="dir">({l.dir})</span>}
                <p>{l.text}</p>
              </div>
            ))}
          </div>
          <aside className="script-notes" aria-label="Animation notes">
            <b className="osd">Animation notes</b>
            <ul>{sc.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </aside>
        </article>
      ))}
    </section>
  );
}

/* ---------- one line, burned in ---------- */
export function Statement({ text, sub }: { text: string; sub: string }) {
  const root = useRef<HTMLElement>(null);
  const { tier } = useShell();
  useEffect(() => {
    const el = root.current;
    if (!el || tier === "static" || still()) return;
    const ctx = gsap.context(() => {
      const split = SplitText.create(el.querySelector(".burn")!, { type: "words,chars" });
      gsap.fromTo(split.chars, { color: "#ffb347", textShadow: "0 0 18px rgba(255,120,40,.9), 0 0 4px #c82924" }, { color: "#11100d", textShadow: "0 0 0 rgba(0,0,0,0)", duration: 1.6, ease: "power2.out", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 75%", once: true } });
      return () => split.revert();
    }, el);
    return () => ctx.revert();
  }, [tier]);
  return (
    <section className="statement" ref={root} aria-label={text}>
      <p className="burn disp">{text}</p>
      <p className="statement-sub">{sub}</p>
    </section>
  );
}

