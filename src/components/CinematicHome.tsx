import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Radio,
} from "lucide-react";
import {
  frequencies,
  transmissions,
  statusLabel,
  type Frequency,
} from "../data/transmissions";
import { EngravedReceiver } from "./ReferenceArchive";
import "./cinematic-home.css";
import InkWind from "./InkWind";

type Props = {
  frequency: Frequency;
  tune: (f: Frequency) => void;
  openContact: (s?: string) => void;
  openGuide: () => void;
  sound: boolean;
  toggleSound: () => void;
};
const palettes: Record<Frequency, string> = {
  Words: "#c82924",
  Product: "#8cb7cc",
  Research: "#b7c99b",
  Studio: "#e5cb65",
  Play: "#c4b7df",
};
const programmes: Record<Frequency, string> = {
  Words: "007",
  Product: "003",
  Research: "000",
  Studio: "013",
  Play: "017",
};
export default function CinematicHome({
  frequency,
  tune,
  openContact,
  openGuide,
  sound,
  toggleSound,
}: Props) {
  const hero = useRef<HTMLElement>(null),
    world = useRef<HTMLDivElement>(null);
  const active = frequencies.find((f) => f.name === frequency)!;
  const programme = transmissions.find((t) => t.id === programmes[frequency])!;
  useEffect(() => {
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        document.documentElement.dataset.surface =
          window.scrollY <
          (hero.current?.offsetHeight || window.innerHeight) - 80
            ? "dark"
            : "paper";
        hero.current?.style.setProperty(
          "--journey",
          String(Math.min(window.scrollY / window.innerHeight, 1)),
        );
        pending = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const point = (event: React.PointerEvent) => {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    world.current?.style.setProperty(
      "--gaze-x",
      `${(event.clientX - bounds.width / 2) * 0.008}px`,
    );
    world.current?.style.setProperty(
      "--gaze-y",
      `${(event.clientY - bounds.height / 2) * 0.008}px`,
    );
  };
  const step = (direction: number) => {
    const index = frequencies.findIndex((f) => f.name === frequency);
    tune(
      frequencies[(index + direction + frequencies.length) % frequencies.length]
        .name,
    );
  };
  return (
    <div className="cinematic-home">
      <section className="cinema-hero" ref={hero} onPointerMove={point}>
        <div className="cinema-world" ref={world}>
          <InkWind />
        </div>
        <div className="cinema-vignette" />
        <div className="cinema-heading">
          <p className="cinema-kicker">
            AN INDEPENDENT FREQUENCY BY JAHAN PATEL
          </p>
          <h1>
            <span className="cinema-the">The</span>
            <span className="cinema-title-first">Interdimensional</span>
            <span className="cinema-title-second">Television</span>
          </h1>
          <p className="cinema-subtitle">ONE PERSON. MANY FREQUENCIES.</p>
        </div>
        <div className="cinema-corner cinema-corner-left">
          <span>WRITING. PRODUCT. RESEARCH.</span>
          <p>
            Clear signals
            <br />
            for complex worlds.
          </p>
          <button className="cinema-text-action" onClick={() => openContact()}>
            Transmit a brief <ArrowUpRight size={15} />
          </button>
        </div>
        <a href="#the-signal" className="cinema-scroll">
          <span>SCROLL TO TUNE IN</span>
          <span className="cinema-scroll-circle">
            <ArrowDown size={20} />
          </span>
        </a>
        <button className="cinema-guide" onClick={openGuide}>
          Explore the work <ArrowUpRight size={16} />
          <kbd>G</kbd>
        </button>
        <span className="cinema-edition">
          VOL. 01 — A CONTINUOUS TRANSMISSION
        </span>
        <svg
          className="cinema-cloud-bank"
          viewBox="0 0 1440 230"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 230H1440V229C1290 220 1235 240 1176 221Q1140 228 1117 216Q1085 224 1068 202Q1041 213 1032 185Q1009 190 1003 170Q980 179 967 153Q940 159 934 132Q908 140 902 110Q879 118 874 91Q849 78 838 108Q815 105 815 132Q787 127 783 155Q758 149 749 178Q723 168 707 184Q682 175 680 151Q653 151 654 124Q625 129 626 102Q602 98 603 80Q580 71 573 95Q551 92 552 121Q526 117 522 144Q493 144 492 168Q466 165 458 189Q428 179 416 205Q390 199 375 216Q339 207 324 222C240 218 190 237 0 230Z"
            fill="#f5f3e9"
          />
          <path
            d="m596 39 14-5 7 9-6 13-14 1-6-9Zm226 18 13-8 17 10-2 17-20 4-11-13Zm57-24 11-2 10 11-6 13-11-1-6-11Z"
            fill="#f5f3e9"
          />
        </svg>
      </section>
      <section
        className="cinema-panel-section"
        aria-label="Enter the broadcast world"
      >
        <figure className="cinema-comic-panel">
          <img
            src="/art/the-broadcast-world.webp"
            alt="A hand-engraved world: a solitary viewer beneath a monumental television on a floating island."
            width="1672"
            height="941"
          />
          <figcaption>
            <span>THE STORY SO FAR</span>Somewhere between
            <br />
            the question and the signal.
          </figcaption>
          <div className="cinema-comic-inset" aria-hidden="true">
            <img src="/art/the-broadcast-world.webp" alt="" />
          </div>
          <span className="cinema-panel-number">I.</span>
        </figure>
      </section>
      <section className="cinema-manifesto" id="the-signal">
        <div className="chapter-mark">
          <span>01 / THE BROADCASTER</span>
          <span>✷</span>
          <span>NO FIXED FREQUENCY</span>
        </div>
        <div className="manifesto-title">
          <h2>
            One person.
            <br />
            <span>Many frequencies.</span>
          </h2>
          <div className="manifesto-star" aria-hidden="true">
            ✷
          </div>
        </div>
        <div className="manifesto-columns">
          <p className="manifesto-side">
            THINGS MADE.
            <br />
            SYSTEMS BUILT.
            <br />
            WORLDS IMAGINED.
          </p>
          <p>
            I’m Jahan. I write, research, shape product narratives, and build
            digital worlds. Different kinds of work. The same instinct: find the
            question, follow the thread, make something worth paying attention
            to.
          </p>
          <Link className="cinema-text-action" to="/about">
            Meet the broadcaster <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="manifesto-divider">
          <span />
          <Radio size={25} strokeWidth={1} />
          <span />
        </div>
      </section>
      <section
        className="cinema-tuner"
        style={{ "--tuning-color": palettes[frequency] } as React.CSSProperties}
        id="frequencies"
      >
        <div className="chapter-mark">
          <span>02 / CHOOSE YOUR FREQUENCY</span>
          <span>THE SIGNAL IS YOURS</span>
        </div>
        <h2 className="tuner-headline">
          {active.name}
          <br />
          <span>
            {active.name === "Words"
              ? "& editorial"
              : active.name === "Product"
                ? "& narrative"
                : active.name === "Research"
                  ? "& systems"
                  : active.name === "Studio"
                    ? "& identity"
                    : "& possibility"}
          </span>
        </h2>
        <div
          className="tuner-navigation hero-services"
          aria-label="Select a frequency"
        >
          {frequencies.map((f) => (
            <button
              key={f.name}
              aria-pressed={frequency === f.name}
              className={frequency === f.name ? "selected" : ""}
              onClick={() => tune(f.name)}
            >
              <span>{f.number}</span>
              {f.name}
              <span className="tuner-dot" />
            </button>
          ))}
        </div>
        <div className="tuner-stage">
          <div className="tuner-side">
            <span>FREQUENCY {active.number}</span>
            <h3>{active.label}</h3>
            <p>{active.description}</p>
          </div>
          <div className="tuner-object" key={frequency}>
            <EngravedReceiver item={programme} suffix={`tuner-${frequency}`} />
            <div className="tuner-object-shadow" />
          </div>
          <div className="tuner-side tuner-side-right">
            <span>
              {programme.status === "vault"
                ? "THE WORK / THE PRACTICE"
                : `CH. ${programme.id} / ${statusLabel(programme.status)}`}
            </span>
            <h3>
              {programme.status === "vault"
                ? active.deliverables[0]
                : programme.title}
            </h3>
            <p>
              {programme.status === "vault"
                ? "The archive is still being restored. Explore the service, or start a conversation about a new brief."
                : programme.subtitle}
            </p>
            <Link
              className="cinema-text-action"
              to={
                programme.status === "vault"
                  ? `/services#${frequency.toLowerCase()}`
                  : `/work/${programme.slug}`
              }
            >
              {programme.status === "vault"
                ? "Explore this frequency"
                : "Open transmission"}{" "}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <div className="tuner-bottom">
          <div className="tuner-arrows">
            <button aria-label="Previous frequency" onClick={() => step(-1)}>
              <ArrowLeft size={20} />
            </button>
            <button aria-label="Next frequency" onClick={() => step(1)}>
              <ArrowRight size={20} />
            </button>
          </div>
          <p className="scene-footnote" aria-live="polite">
            RECEIVING {frequency.toUpperCase()} SIGNAL
          </p>
          <span>{active.number} — 05</span>
        </div>
      </section>
      <section className="cinema-work" id="selected-work">
        <div className="chapter-mark">
          <span>03 / SELECTED TRANSMISSIONS</span>
          <span>FOLLOW THE SIGNAL</span>
        </div>
        <h2>
          The work.
          <br />
          <span>Not the noise.</span>
        </h2>
        <div className="cinema-work-list">
          {[transmissions[0], transmissions[1], transmissions[2]].map(
            (item) => (
              <Link key={item.id} to={`/work/${item.slug}`}>
                <span className="cinema-work-id">
                  CH. {item.id}
                  <small>{item.frequency.toUpperCase()}</small>
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
                <span className="cinema-work-status">
                  {statusLabel(item.status)}
                </span>
                <span className="cinema-work-arrow">
                  <ArrowUpRight size={26} />
                </span>
              </Link>
            ),
          )}
        </div>
        <Link className="cinema-outlined-button" to="/catalogue">
          The complete programme guide <ArrowUpRight size={18} />
        </Link>
        <div className="cinema-provenance">
          PUBLISHED WORK. FIELD ANALYSIS. SELF-INITIATED CONCEPTS.
          <br />
          EACH SIGNAL TELLS YOU WHERE IT COMES FROM.
        </div>
      </section>
      <section className="cinema-contact">
        <div className="cinema-contact-star" aria-hidden="true">
          ✷
        </div>
        <p>THE NEXT TRANSMISSION STARTS WITH YOU</p>
        <h2>
          What happens
          <br />
          <span>next is up to you.</span>
        </h2>
        <button
          className="cinema-outlined-button"
          onClick={() => openContact()}
        >
          Let’s make contact <ArrowUpRight size={19} />
        </button>
        <Link to="/services">
          Explore ways to work together <ArrowUpRight size={14} />
        </Link>
      </section>
      <button
        className={`cinema-audio ${sound ? "is-playing" : ""}`}
        onClick={toggleSound}
        aria-label={`Turn sound ${sound ? "off" : "on"}`}
        aria-pressed={sound}
      >
        <span className="audio-bars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>SOUND {sound ? "ON" : "OFF"}</span>
        <kbd>M</kbd>
      </button>
    </div>
  );
}
