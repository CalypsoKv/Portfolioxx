import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { contactEmail } from "../data/transmissions";
import { detectTier, prefersReducedMotion } from "../motion/capability";
import { pauseScroll, resumeScroll, scrollToY, startClock } from "../motion/clock";
import { onSound, setSound, soundOn, staticBurst, tick } from "../motion/audio";
import { useReveals } from "../motion/useReveals";
import StageHost from "../stage/StageHost";
import { S, outPhase } from "../stage/state";
import ContactDialog from "./ContactDialog";
import Dial from "./Dial";
import Guide from "./Guide";
import InkDefs from "./InkDefs";
import PowerCut from "./PowerCut";
import Preloader from "./Preloader";
import TuneLink from "./TuneLink";
import { ShellContext } from "./context";
import { powerOff, powerOn } from "./power";

const seen = () => {
  try {
    return sessionStorage.getItem("itv_seen") === "1";
  } catch {
    return false;
  }
};

function Mark() {
  return (
    <TuneLink to="/" className="mark" aria-label="Jahan Patel, home">
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 22 L24 8 M30 22 L22 8" />
          <rect x="6" y="22" width="40" height="24" rx="4" />
          <rect x="11" y="27" width="22" height="14" rx="3" />
          <path d="M38 28 h3 M38 34 h3 M38 40 h3" />
        </g>
      </svg>
    </TuneLink>
  );
}

export default function TvShell() {
  const [{ tier }] = useState(detectTier);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const isWork = location.pathname.startsWith("/work/");
  const mainRef = useRef<HTMLElement>(null);
  const busy = useRef(false);
  const [contact, setContact] = useState(false);
  const [service, setService] = useState("");
  const [guide, setGuide] = useState(false);
  const [sound, setSoundState] = useState(soundOn);
  const [frame, setFrame] = useState(false);
  const [fonts, setFonts] = useState(false);
  const [entered, setEntered] = useState(() => location.pathname !== "/" || seen() || tier === "static");
  const [announce, setAnnounce] = useState("");

  // One clock for scroll, ScrollTrigger and the render.
  useEffect(() => {
    startClock({ smooth: tier === "full" });
    S.mode = tier;
  }, [tier]);

  useEffect(() => {
    let alive = true;
    const done = () => alive && setFonts(true);
    void document.fonts?.ready.then(done);
    const t = window.setTimeout(done, 2200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  const onFirstFrame = useCallback(() => setFrame(true), []);
  const progress = (frame ? 0.6 : 0) + (fonts ? 0.4 : 0);

  const showPre = !entered;
  useEffect(() => {
    document.documentElement.classList.toggle("no-scroll", showPre);
    if (showPre) pauseScroll();
    else resumeScroll();
  }, [showPre]);
  const enter = useCallback(() => {
    try {
      sessionStorage.setItem("itv_seen", "1");
    } catch {
      /* optional */
    }
    setEntered(true);
  }, []);

  useEffect(() => onSound(() => setSoundState(soundOn())), []);

  const openContact = useCallback((s = "") => {
    setService(s);
    setContact(true);
  }, []);
  const openGuide = useCallback(() => setGuide(true), []);

  // Changing channel: the screen glitches and the set switches off; the next page switches on (see the effect below).
  const tune = useCallback(
    (to: string) => {
      if (busy.current || prefersReducedMotion() || S.mode === "static") {
        navigate(to);
        return;
      }
      busy.current = true;
      tick();
      staticBurst();
      void Promise.all([outPhase(), powerOff()]).then(() => {
        navigate(to);
        busy.current = false;
      });
    },
    [navigate],
  );

  // After a route change: scroll to the anchor or the top, switch the set back on, focus the new heading, announce the title.
  // The first load keeps the browser's own focus start so the skip link stays the first Tab stop.
  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(location.hash.slice(1));
        if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 24, { immediate: true });
      });
    } else scrollToY(0, { immediate: true });
    requestAnimationFrame(() => void powerOn());
    if (location.key === "default") return;
    const t = window.setTimeout(() => {
      const h1 = mainRef.current?.querySelector<HTMLElement>("h1");
      h1?.focus({ preventScroll: true });
      setAnnounce(document.title);
    }, 80);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  useReveals(mainRef, location.pathname, tier !== "static");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input,textarea,select,[contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector("dialog[open]")) return;
      switch (e.key.toLowerCase()) {
        case "g":
          e.preventDefault();
          setGuide(true);
          break;
        case "c":
          e.preventDefault();
          openContact();
          break;
        case "m":
          e.preventDefault();
          setSound(!soundOn());
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openContact]);

  const ctx = useMemo(() => ({ tier, openContact, openGuide, tune }), [tier, openContact, openGuide, tune]);
  const workActive = location.pathname.startsWith("/catalogue") || isWork;

  return (
    <ShellContext.Provider value={ctx}>
      <div className={`shell tier-${tier}`} data-route={isHome ? "home" : "page"}>
        <InkDefs />
        <a className="skip-link" href="#main">Skip to content</a>
        <StageHost mode={tier} onFirstFrame={onFirstFrame} />
        <Mark />
        <header className="plaque">
          <nav aria-label="Primary">
            <TuneLink to="/" className={isHome ? "on" : ""} aria-current={isHome ? "page" : undefined}>Room</TuneLink>
            <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true"><path d="M1 6 C 5 1, 8 9, 11 5 S 17 1, 21 5" fill="none" stroke="#c82924" strokeWidth="2.6" strokeLinecap="round" /></svg>
            <TuneLink to="/catalogue" className={workActive ? "on" : ""} aria-current={workActive ? "page" : undefined}>Work</TuneLink>
          </nav>
          <span className="plaque-rule" aria-hidden="true" />
          <Dial />
          <button type="button" className="plaque-icon" aria-pressed={sound} aria-label="Sound (M)" onClick={() => setSound(!soundOn())}>
            {sound ? <Volume2 aria-hidden="true" size={18} strokeWidth={2.4} /> : <VolumeX aria-hidden="true" size={18} strokeWidth={2.4} />}
          </button>
          <button type="button" className="plaque-contact" onClick={() => openContact()}>Contact</button>
        </header>
        <main id="main" ref={mainRef} tabIndex={-1}>
          <Outlet />
        </main>
        {!isHome && !isWork && (
          <footer className="shell-footer">
            <div className="in">
              <span className="osd">Jahan Patel · An independent frequency · Writing, websites, design and animation</span>
              <nav aria-label="Footer">
                <TuneLink to="/catalogue">Programme guide</TuneLink>
                <TuneLink to="/services">Services</TuneLink>
                <TuneLink to="/about">The broadcaster</TuneLink>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </nav>
            </div>
          </footer>
        )}
        <ContactDialog open={contact} onClose={() => setContact(false)} initialService={service} />
        <Guide open={guide} onClose={() => setGuide(false)} />
        {showPre && <Preloader progress={progress} onEnter={enter} />}
        <PowerCut />
        <div className="sr-only" role="status" aria-live="polite">{announce}</div>
      </div>
    </ShellContext.Provider>
  );
}
