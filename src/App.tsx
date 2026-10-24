import { useState, useEffect, useRef, useCallback } from "react";
import {
  Link,
  NavLink,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Search,
  X,
  Volume2,
  VolumeX,
  Grid2X2,
  List,
  SlidersHorizontal,
  Radio,
  Plus,
  Minus,
  Check,
  Copy,
  ExternalLink,
  Menu,
} from "lucide-react";
import {
  frequencies,
  transmissions,
  liveTransmissions,
  statusLabel,
  contactEmail,
  type Frequency,
  type Transmission,
} from "./data/transmissions";
import ReceiverArt from "./components/ReceiverArt";
import ContactDialog from "./components/ContactDialog";
import CinematicHome from "./components/CinematicHome";
import ReferenceArchive from "./components/ReferenceArchive";

function readMemory(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
function saveMemory(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Storage is optional. */
  }
}
const Arrow = () => <ArrowUpRight size={17} strokeWidth={1.5} />;
function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Interdimensional TV home">
      <span className="brand-mark">
        <svg viewBox="0 0 48 60" fill="none">
          <ellipse
            cx="24"
            cy="33"
            rx="22"
            ry="25"
            stroke="currentColor"
            strokeWidth=".8"
          />
          <path
            d="m15 5 9 9 12-13M9 22h30v22H9zM14 27h17v12H14zM35 28v3m0 4v3M14 49v-5m20 5v-5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path d="m20 29 7 4-7 4Z" fill="currentColor" />
          <path
            d="m4 24 5 3m-6 7h6m-4 11 4-4m30-14 5-3m-5 10h6m-6 7 4 4"
            stroke="currentColor"
            strokeWidth=".5"
          />
        </svg>
      </span>
      <span className="signature-name">
        Jahan<span>Patel</span>
        <small>INTERDIMENSIONAL TV</small>
      </span>
    </Link>
  );
}
export default function App() {
  const [frequency, setFrequency] = useState<Frequency>(() => {
    const stored = readMemory("itv_frequency", "Words");
    return frequencies.some((f) => f.name === stored)
      ? (stored as Frequency)
      : "Words";
  });
  const [contact, setContact] = useState(false),
    [service, setService] = useState(""),
    [guide, setGuide] = useState(false),
    [sound, setSound] = useState(false),
    [mobileMenu, setMobileMenu] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const openContact = useCallback((s = "") => {
    setService(s);
    setContact(true);
  }, []);
  const clickSound = useCallback(() => {
    if (!sound) return;
    try {
      audio.current ??= new AudioContext();
      const context = audio.current;
      void context.resume();
      const osc = context.createOscillator(),
        gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        180,
        context.currentTime + 0.07,
      );
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.1);
    } catch {
      /* Audio is an enhancement. */
    }
  }, [sound]);
  const tune = (value: Frequency) => {
    setFrequency(value);
    saveMemory("itv_frequency", value);
    clickSound();
  };
  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
    } else window.scrollTo(0, 0);
    document.documentElement.dataset.surface =
      location.pathname === "/" ? "dark" : "paper";
    setMobileMenu(false);
    const names: Record<string, string> = {
      "/": "Jahan Patel",
      "/catalogue": "Programme Guide",
      "/services": "The Frequencies",
      "/about": "Behind the Signal",
    };
    document.title = `${names[location.pathname] || "Transmission"} — Interdimensional TV`;
  }, [location.pathname, location.hash]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest("input,textarea,select,[contenteditable]") ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key === "Escape") {
        setMobileMenu(false);
        return;
      }
      if (document.querySelector("dialog[open]")) return;
      switch (event.key.toLowerCase()) {
        case "g":
          event.preventDefault();
          setGuide(true);
          break;
        case "c":
          event.preventDefault();
          openContact();
          break;
        case "m":
          event.preventDefault();
          setSound((s) => !s);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openContact]);
  return (
    <div
      className={`site reference-site ${location.pathname === "/" ? "experience-mode" : "collection-mode"}`}
      style={
        {
          "--signal": frequencies.find((f) => f.name === frequency)?.color,
        } as React.CSSProperties
      }
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Brand />
        <nav
          className={`main-nav ${mobileMenu ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink to="/" end>
            Experience
          </NavLink>
          <NavLink to="/catalogue">
            Archive <kbd>G</kbd>
          </NavLink>
          <NavLink className="secondary-link" to="/services">
            Services
          </NavLink>
          <NavLink className="secondary-link" to="/about">
            The broadcaster
          </NavLink>
        </nav>
        <button className="header-contact" onClick={() => openContact()}>
          Let’s talk <Arrow />
        </button>
        <button
          className="mobile-toggle icon-button"
          aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenu}
          onClick={() => setMobileMenu((v) => !v)}
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main">
        <Routes>
          <Route
            path="/"
            element={
              <CinematicHome
                frequency={frequency}
                tune={tune}
                openContact={openContact}
                openGuide={() => setGuide(true)}
                sound={sound}
                toggleSound={() => setSound((v) => !v)}
              />
            }
          />
          <Route
            path="/catalogue"
            element={<ReferenceArchive openContact={openContact} />}
          />
          <Route
            path="/services"
            element={<Services openContact={openContact} />}
          />
          <Route path="/about" element={<About openContact={openContact} />} />
          <Route
            path="/work/:slug"
            element={
              <Reader openContact={openContact} onChannel={setFrequency} />
            }
          />
          <Route
            path="*"
            element={
              <div className="not-found">
                <span className="mono">404 / SIGNAL LOST</span>
                <h1>This frequency is quiet.</h1>
                <Link className="button button-gold" to="/">
                  Return to the broadcast room <Arrow />
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer">
        <Brand />
        <div>
          <span className="mono">AN INDEPENDENT FREQUENCY.</span>
          <p>One person. Many frequencies.</p>
        </div>
        <div className="footer-links">
          <Link to="/catalogue">
            The archive <Arrow />
          </Link>
          <a href={`mailto:${contactEmail}`}>
            Open a channel <Arrow />
          </a>
        </div>
        <div className="footer-bottom mono">
          <span>© {new Date().getFullYear()} JAHAN PATEL</span>
          <span>WORDS · SYSTEMS · WORLDS</span>
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            BACK TO TOP ↑
          </button>
        </div>
      </footer>
      <ContactDialog
        open={contact}
        onClose={() => setContact(false)}
        initialService={service}
      />
      <Guide
        open={guide}
        onClose={() => setGuide(false)}
        onSelect={(slug) => {
          setGuide(false);
          navigate(`/work/${slug}`);
        }}
      />
    </div>
  );
}

function Services({ openContact }: { openContact: (s?: string) => void }) {
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(
        () =>
          document
            .getElementById(window.location.hash.slice(1))
            ?.scrollIntoView(),
        100,
      );
    }
  }, []);
  return (
    <>
      <section className="services-page paper-section">
        <div className="page-intro">
          <span className="eyebrow">
            THE FREQUENCIES / WAYS TO WORK TOGETHER
          </span>
          <h1>
            Complex brief.
            <br />
            <em>Clear signal.</em>
          </h1>
          <p>
            I help teams find the useful idea, shape the story,
            <br />
            and build a system that carries it further.
          </p>
        </div>
        {frequencies.slice(0, 4).map((f) => (
          <article
            className="service-detail"
            key={f.name}
            id={f.name.toLowerCase()}
          >
            <span className="mono">
              FREQ. {f.number} / {f.name.toUpperCase()}
            </span>
            <div>
              <h2>{f.label}</h2>
              <p className="service-lead">{f.description}</p>
              <div className="service-detail-columns">
                <div>
                  <span className="eyebrow">THE KIND OF WORK</span>
                  <ul>
                    {f.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="eyebrow">A GOOD FIT FOR</span>
                  <p>
                    {f.name === "Words"
                      ? "Publications, editorial teams, and founders with something worth saying."
                      : f.name === "Product"
                        ? "SaaS teams translating a complex product into a clear customer journey."
                        : f.name === "Research"
                          ? "Research groups and organisations making sense of a complicated landscape."
                          : "Founders and creative teams who want the words and the website to belong to the same world."}
                  </p>
                </div>
              </div>
              <div className="service-detail-actions">
                <button
                  className="button button-ink"
                  onClick={() => openContact(f.label)}
                >
                  Discuss a {f.name.toLowerCase()} brief <Arrow />
                </button>
                <Link
                  className="text-link"
                  to={
                    f.name === "Words"
                      ? "/work/digistatement"
                      : f.name === "Research"
                        ? "/work/camden-imagines"
                        : "/catalogue"
                  }
                >
                  {f.name === "Words"
                    ? "Read editorial analysis"
                    : f.name === "Research"
                      ? "Explore a field reading"
                      : "Explore the programme guide"}{" "}
                  <Arrow />
                </Link>
              </div>
            </div>
          </article>
        ))}
        <div className="working-notes">
          <span className="eyebrow">A NOTE ON THE PROCESS</span>
          <h2>
            A conversation first.
            <br />
            <em>A useful outcome next.</em>
          </h2>
          <div>
            <p>
              Every collaboration begins with the question you need answered. We
              agree on the scope, audience, deliverables, and what a useful
              result looks like before the work begins.
            </p>
            <p>
              Project sprints and ongoing collaborations are both welcome. No
              mystery packages; just a clear brief, a shared direction, and room
              for good thinking.
            </p>
          </div>
        </div>
      </section>
      <ContactBanner openContact={openContact} />
    </>
  );
}

function About({ openContact }: { openContact: (s?: string) => void }) {
  return (
    <>
      <section className="about-page paper-section">
        <div className="about-layout">
          <div>
            <span className="eyebrow">BEHIND THE SIGNAL / JAHAN PATEL</span>
            <h1>
              One person.
              <br />
              <em>Not one thing.</em>
            </h1>
            <p className="about-intro">
              A writer’s curiosity.
              <br />A strategist’s structure.
              <br />A maker’s instinct.
            </p>
            <p>
              I’m Jahan Patel. Interdimensional TV is my working portfolio: a
              place for writing, product thinking, research, and the experiments
              that happen between them.
            </p>
            <p>
              I’m interested in how an idea becomes legible. Sometimes that
              takes an article. Sometimes a product narrative, a system map, a
              website, or a different question entirely.
            </p>
          </div>
          <div className="about-art">
            <ReceiverArt frequency="Studio" />
            <span className="mono">THE BROADCASTER / ALWAYS RECEIVING</span>
            <div className="about-art-orbit" />
          </div>
        </div>
        <div className="about-principles">
          <span className="eyebrow">A FEW OPERATING PRINCIPLES</span>
          {[
            [
              "01",
              "Clarity is a form of care.",
              "The reader’s time matters. Start with their question, use the words you need, and leave the rest.",
            ],
            [
              "02",
              "Follow the signal.",
              "A source is not a credit. An experiment is not a client outcome. Every project is labelled for what it actually is.",
            ],
            [
              "03",
              "Stay curious.",
              "The interesting work often sits between disciplines. Keep listening beyond your own frequency.",
            ],
          ].map(([n, title, body]) => (
            <div key={n}>
              <span className="mono">{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
        <div className="about-contact" id="contact">
          <span className="eyebrow">OPEN A CHANNEL / DIRECT INQUIRY</span>
          <h2>
            Good things start
            <br />
            <em>with a conversation.</em>
          </h2>
          <a href={`mailto:${contactEmail}`}>
            {contactEmail} <Arrow />
          </a>
          <button className="button button-ink" onClick={() => openContact()}>
            Or send a short brief <Arrow />
          </button>
        </div>
      </section>
    </>
  );
}

function Reader({
  openContact,
  onChannel,
}: {
  openContact: (s?: string) => void;
  onChannel: (f: Frequency) => void;
}) {
  const { slug } = useParams();
  const item = transmissions.find((t) => t.slug === slug);
  const [annotations, setAnnotations] = useState(true),
    [copied, setCopied] = useState(false),
    [progress, setProgress] = useState(0);
  useEffect(() => {
    setCopied(false);
    setProgress(0);
    if (item) {
      onChannel(item.frequency);
      saveMemory("itv_last_channel", item.id);
      document.title = `${item.title} — Interdimensional TV`;
    }
  }, [item, onChannel]);
  useEffect(() => {
    const scroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 100,
      );
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  if (!item || item.status === "vault")
    return (
      <div className="not-found">
        <span className="eyebrow">SIGNAL IN RESTORATION</span>
        <h1>This archive isn’t on air yet.</h1>
        <Link to="/catalogue" className="button button-gold">
          Back to the programme guide <Arrow />
        </Link>
      </div>
    );
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <article className="reader-page paper-section">
      <div className="reader-toolbar">
        <Link to="/catalogue">
          <ArrowLeft size={15} /> Programme guide
        </Link>
        <label className="annotation-toggle">
          <input
            type="checkbox"
            checked={annotations}
            onChange={(e) => setAnnotations(e.target.checked)}
          />
          <span className="toggle-track" /> Strategic notes
        </label>
        <button onClick={copyLink} aria-label="Copy transmission link">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? "Copied" : "Copy link"}</span>
        </button>
      </div>
      <div className="reader-progress" style={{ width: `${progress}%` }} />
      <header className="reader-header">
        <span className="eyebrow">
          CH. {item.id} / {item.frequency.toUpperCase()} / {item.year}
        </span>
        <div className="reader-title">
          <div>
            <h1>
              {item.title}
              <em>{item.subtitle}</em>
            </h1>
            <p>{item.summary}</p>
            <div className="reader-meta mono">
              <span className="status">
                <i className={item.status} />
                {statusLabel(item.status)}
              </span>
              <span>{item.reading} MIN READ</span>
            </div>
          </div>
          <ReceiverArt frequency={item.frequency} />
        </div>
        <div className="source-disclosure">
          <span className="mono">SOURCE NOTE</span>
          <p>
            {item.status === "published"
              ? "The supplied PRD identifies Jahan’s published byline. The text below is new portfolio commentary, not the original article."
              : item.status === "analysis"
                ? "Contextual field analysis. Jahan’s contribution to the original report is unconfirmed; no authorship is claimed."
                : "Self-initiated concept. This is an illustrative exploration, not a claim of paid client work or a shipped product."}
          </p>
        </div>
      </header>
      <div className="reader-body">
        <aside className="reader-outline">
          <span className="eyebrow">IN THIS TRANSMISSION</span>
          {item.sections?.map((section, i) => (
            <a key={section.title} href={`#chapter-${i}`}>
              <span className="mono">0{i + 1}</span>
              {section.title}
            </a>
          ))}
          <div className="reader-outline-footer mono">
            {item.status === "published"
              ? "BYLINE REPORTED / 2020"
              : item.status === "analysis"
                ? "FIELD ANALYSIS"
                : "CONCEPT / EXPLORATION"}
            <br />
            FOLLOW THE SIGNAL ↗
          </div>
        </aside>
        <div className="reader-copy">
          {item.slug === "game-prototype" && <FrequencyGame />}
          {item.sections?.map((section, i) => (
            <section id={`chapter-${i}`} key={section.title}>
              <span className="chapter-number mono">0{i + 1} /</span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
              {annotations && section.note && (
                <aside className="inline-note">
                  <span className="mono">↳ STRATEGIC NOTE 0{i + 1}</span>
                  <p>{section.note}</p>
                </aside>
              )}
            </section>
          ))}
          {item.source && (
            <a
              className="button button-ink original-source"
              href={item.source}
              target="_blank"
              rel="noreferrer"
            >
              Locate original publication <ExternalLink size={16} />
            </a>
          )}
          <div className="reader-endmark">✳</div>
          <div className="reader-commission">
            <span className="eyebrow">YOUR NEXT TRANSMISSION</span>
            <h2>
              Something on
              <br />a similar <em>wavelength?</em>
            </h2>
            <button
              className="button button-ink"
              onClick={() => openContact(item.frequency)}
            >
              Discuss your brief <Arrow />
            </button>
          </div>
        </div>
        <aside className="reader-side">
          <span className="eyebrow">SIGNAL INFORMATION</span>
          <dl>
            <dt>FREQUENCY</dt>
            <dd>{item.frequency}</dd>
            <dt>FORMAT</dt>
            <dd>{item.tags.join(" / ")}</dd>
            <dt>STATUS</dt>
            <dd>{statusLabel(item.status)}</dd>
          </dl>
          <p>
            Clear provenance.
            <br />
            No invented outcomes.
          </p>
        </aside>
      </div>
      <div className="next-transmission">
        <span className="mono">CONTINUE RECEIVING</span>
        <Link
          to={`/work/${liveTransmissions[(liveTransmissions.indexOf(item) + 1) % liveTransmissions.length].slug}`}
        >
          Next transmission <ArrowRight />
        </Link>
      </div>
    </article>
  );
}
function FrequencyGame() {
  const [dial, setDial] = useState(87);
  const won = dial === 104;
  return (
    <div className="frequency-game">
      <span className="mono">EXPERIMENT 017 / FIND THE SIGNAL</span>
      <div className={`signal-number ${won ? "locked" : ""}`}>
        {dial.toFixed(1)}
        <span> MHz</span>
      </div>
      <div className="wave-bars" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <i
            key={i}
            style={{
              height: `${10 + Math.sin(i * 0.6) * Math.sin(i * 0.3) * Math.max(8, 60 - Math.abs(dial - 104) * 3)}px`,
            }}
          />
        ))}
      </div>
      <label htmlFor="frequency-dial" className="mono">
        TUNE THE RECEIVER / TARGET 104.0 MHz
      </label>
      <input
        id="frequency-dial"
        type="range"
        min="87"
        max="108"
        value={dial}
        onChange={(e) => setDial(Number(e.target.value))}
      />
      <p aria-live="polite">
        {won
          ? "Signal locked. You found the next frequency."
          : Math.abs(dial - 104) < 4
            ? "A little closer. The signal is getting clearer."
            : "Mostly static. Keep tuning."}
      </p>
    </div>
  );
}
function ContactBanner({ openContact }: { openContact: (s?: string) => void }) {
  return (
    <section className="contact-banner">
      <div className="contact-banner-orbit" aria-hidden="true">
        ✳
      </div>
      <span className="eyebrow">NO STATIC. JUST A GOOD CONVERSATION.</span>
      <h2>
        Have something
        <br />
        on your <em>wavelength?</em>
      </h2>
      <button className="button button-gold" onClick={() => openContact()}>
        Let’s make contact <Arrow />
      </button>
      <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
    </section>
  );
}
function Guide({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (slug: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) {
      setQuery("");
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [open]);
  const items = liveTransmissions.filter((t) =>
    `${t.title} ${t.frequency} ${t.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <dialog
      ref={dialog}
      className="guide-dialog"
      onCancel={onClose}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
      aria-labelledby="guide-title"
    >
      <div className="guide-inner">
        <div className="guide-heading">
          <div>
            <span className="eyebrow">
              THE QUICK TUNE / {liveTransmissions.length} TRANSMISSIONS
            </span>
            <h2 id="guide-title">
              Find your <em>signal.</em>
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close programme guide"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">Search programme guide</span>
          <input
            autoFocus
            placeholder="A project, a discipline, a possibility…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="guide-results" aria-live="polite">
          {items.map((item) => (
            <button key={item.id} onClick={() => onSelect(item.slug)}>
              <span className="mono">CH. {item.id}</span>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.frequency} · {statusLabel(item.status)}
                </span>
              </div>
              <Arrow />
            </button>
          ))}
          {!items.length && (
            <p className="guide-empty">
              No matching signal. Try “Words”, “Research”, or “Play”.
            </p>
          )}
        </div>
        <div className="guide-footer mono">
          <span>↑ SCROLL TO EXPLORE</span>
          <Link to="/catalogue" onClick={onClose}>
            FULL PROGRAMME GUIDE ↗
          </Link>
        </div>
      </div>
    </dialog>
  );
}
