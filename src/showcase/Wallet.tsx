import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "../motion/clock";
import { prefersReducedMotion } from "../motion/capability";
import { useShell } from "../shell/context";
import TuneLink from "../shell/TuneLink";

type Pass = { org: string; role: string; years: string; tone: string; proof: string[]; note: string; to?: string };
const PASSES: Pass[] = [
  { org: "TealBox Digital", role: "Performance marketing & content", years: "2019–20", tone: "#2438c9", proof: ["Website UX and content for Orma Health", "Pitch decks and sales collateral", "Clients included Performance Medstop and Dekorio"], note: "Reported", to: "/work/orma-health" },
  { org: "DigiStatement", role: "Writer", years: "2020–21", tone: "#c82924", proof: ["200+ articles on games, tech and entertainment", "20 bylines re-checked on the live site", "Guides, patch analysis, esports, interviews"], note: "Publicly verified", to: "/work/digistatement" },
  { org: "Pepper Content", role: "Freelance writer & editor", years: "2020–21", tone: "#f0b21c", proof: ["Healthcare, SaaS, EdTech and airline clients", "Articles, white papers, press releases", "Editing and proofreading"], note: "Reported", to: "/work/pepper-content" },
  { org: "CustomerSuccessBox", role: "Content Marketer", years: "2021–22", tone: "#1c5a2b", proof: ["+25% email opens, +18% click-through", "28% of traffic from the top four articles", "+15% marketing-qualified leads"], note: "Reported", to: "/work/customersuccessbox" },
  { org: "Reptrics", role: "Senior Marketing Manager", years: "2022–23", tone: "#11100d", proof: ["Led marketing; rebuilt the website end to end", "+35% marketing-qualified leads in 12 months", "+20% organic traffic after the overhaul"], note: "Reported", to: "/work/reptrics" },
  { org: "Civilization Research Institute", role: "Documentation In-charge", years: "2023–24", tone: "#6b4b8a", proof: ["Reports, policy briefs, grant proposals", "Knowledge bases with version control and QA", "Research on long-term futures, made usable"], note: "Reported" },
  { org: "RedOrange.AI", role: "Seminars, decks & newsletter", years: "2025", tone: "#d2491f", proof: ["Seminar scripts", "Technical presentation documents", "The newsletter"], note: "Reported", to: "/work/redorange-ai" },
];

/** Seven roles as press passes in a wallet: they fan out as the wallet arrives, and each turns over to show its proof. */
export default function Wallet() {
  const { tier } = useShell();
  const root = useRef<HTMLOListElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || tier === "static" || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".pass", el);
      const n = cards.length, mid = (n - 1) / 2;
      const spread = () => Math.min(150, (el.clientWidth - 280) / (n - 1));
      gsap.set(el, { height: 520 });
      gsap.fromTo(
        cards,
        { x: (i) => (i - mid) * 3, y: (i) => i * 3, rotation: (i) => -3 + i, xPercent: -50 },
        {
          x: (i) => (i - mid) * spread(),
          y: (i) => Math.abs(i - mid) ** 2 * 7,
          rotation: (i) => (i - mid) * 6,
          xPercent: -50,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top 72%", once: true },
        },
      );
    });
    return () => mm.revert();
  }, [tier]);
  return (
    <section className="wallet-wrap" aria-labelledby="wallet-title">
      <header className="block-head">
        <h2 id="wallet-title" className="disp" data-reveal>The press passes</h2>
        <p>Seven roles, one wallet. Turn a pass over for the proof; each says whether its numbers are checked or reported.</p>
      </header>
      <ol className={`wallet ${tier !== "static" ? "fan" : ""}`} ref={root}>
        {PASSES.map((p, i) => (
          <li key={p.org} className={`pass ${open === i ? "flipped" : ""}`} style={{ "--tone": p.tone, zIndex: open === i ? 30 : i } as CSSProperties}>
            <div className="pass-inner">
              <div className="pass-face front" inert={open === i}>
                <span className="pass-hole" aria-hidden="true" />
                <span className="pass-band osd">Press · Pass {String(i + 1).padStart(2, "0")}</span>
                <img src="/people/jahan-pass.webp" alt="" width="300" height="300" loading="lazy" decoding="async" />
                <strong className="disp">{p.org}</strong>
                <span className="pass-role">{p.role}</span>
                <span className="osd">Jahan Patel · {p.years}</span>
                <span className="pass-code" aria-hidden="true" />
                <button type="button" className="pass-turn" aria-label={`Turn over the ${p.org} pass`} onClick={() => setOpen(i)} />
              </div>
              <div className="pass-face back" inert={open !== i}>
                <span className="osd">{p.org} · {p.years}</span>
                <ul>{p.proof.map((x) => <li key={x}>{x}</li>)}</ul>
                <span className="pass-note osd">{p.note}</span>
                <span className="pass-actions">
                  {p.to && <TuneLink className="inline-link" to={p.to}>Open the channel →</TuneLink>}
                  <button type="button" className="inline-link" onClick={() => setOpen(null)}>Turn back</button>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
