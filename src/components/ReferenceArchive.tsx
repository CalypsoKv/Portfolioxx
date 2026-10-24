import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Grid2X2,
  List,
  Plus,
  Radio,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  frequencies,
  liveTransmissions,
  statusLabel,
  transmissions,
  type Transmission,
} from "../data/transmissions";
import "./reference-archive.css";
import { TreatmentIndex } from "./ProjectTreatment";

function storedView(): "grid" | "list" {
  try {
    return localStorage.getItem("itv_view") === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function EngravedReceiver({
  item,
  suffix,
}: {
  item: Transmission;
  suffix: string;
}) {
  const hatch = `collection-hatch-${suffix}`;
  const fine = `collection-fine-${suffix}`;
  return (
    <svg
      className="collection-receiver"
      viewBox="0 0 680 540"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={hatch}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <path d="M0 0V6" stroke="#161616" strokeWidth="1.2" />
        </pattern>
        <pattern
          id={fine}
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-28)"
        >
          <path d="M0 0V3" stroke="#161616" strokeWidth=".6" />
        </pattern>
      </defs>
      <g stroke="#171717" strokeLinejoin="round" strokeLinecap="round">
        <ellipse
          cx="337"
          cy="474"
          rx="221"
          ry="21"
          fill={`url(#${fine})`}
          strokeWidth="1"
        />
        <path d="M315 144 314 92 253 33M314 92 379 24" strokeWidth="3" />
        <circle cx="253" cy="33" r="4" fill="#171717" />
        <circle cx="379" cy="24" r="4" fill="#171717" />
        <path
          d="M151 184 235 129Q241 125 252 126L535 139Q554 141 554 159V373Q555 390 539 399L468 445Z"
          fill="#f8f6ec"
          strokeWidth="3"
        />
        <path
          d="M465 191 545 150V377Q545 387 533 393L465 432Z"
          fill={`url(#${hatch})`}
          strokeWidth="2"
        />
        <path
          d="M153 179 236 129 535 142 468 190Z"
          fill={`url(#${fine})`}
          strokeWidth="2"
        />
        <path
          d="M163 178 242 137 523 148M174 180 247 143 511 154M186 181 251 148 500 159"
          strokeWidth=".8"
        />
        <path
          d="M134 199Q134 182 153 182L449 192Q468 193 469 213V426Q469 444 450 445L153 434Q134 433 134 414Z"
          fill="#f8f6ec"
          strokeWidth="3"
        />
        <path
          d="M141 200Q141 189 154 189L448 199Q461 199 462 213V425Q462 437 449 437L154 427Q141 426 141 414Z"
          fill={`url(#${fine})`}
          strokeWidth="1.2"
        />
        <path
          d="M154 215Q161 204 176 204L376 211Q395 212 399 230L399 385Q396 409 377 412L176 405Q155 402 153 385Z"
          fill="#171717"
          strokeWidth="3"
        />
        <path
          d="M170 227Q177 217 190 218L366 224Q383 226 386 241V375Q383 394 367 396L189 390Q170 389 167 373L166 244Q166 232 170 227Z"
          fill="#f8f6ec"
          strokeWidth="2"
        />
        <path
          d="M174 235Q190 226 367 233M173 380Q267 390 372 381"
          strokeWidth="1"
        />
        <path
          d="M181 244H369M181 249H369M181 254H369M181 352H369M181 357H369M181 362H369M181 367H369"
          strokeWidth=".5"
          opacity=".4"
        />
        <text
          x="273"
          y="278"
          fill="#171717"
          stroke="none"
          textAnchor="middle"
          fontFamily="DM Sans,sans-serif"
          fontWeight="600"
          fontSize="10"
          letterSpacing="3"
        >
          CHANNEL
        </text>
        <text
          x="273"
          y="337"
          fill="#171717"
          stroke="none"
          textAnchor="middle"
          fontFamily="Bodoni Moda,serif"
          fontWeight="700"
          fontSize="69"
          letterSpacing="-3"
        >
          {item.id}
        </text>
        <text
          x="273"
          y="380"
          fill="#171717"
          stroke="none"
          textAnchor="middle"
          fontFamily="DM Sans,sans-serif"
          fontWeight="600"
          fontSize="9"
          letterSpacing="3"
        >
          {item.frequency.toUpperCase()}
        </text>
        <path
          d="M411 216 447 218 447 289 411 288Z"
          fill="#f8f6ec"
          strokeWidth="1.4"
        />
        <circle cx="429" cy="237" r="11" fill="#171717" />
        <circle
          cx="429"
          cy="237"
          r="7"
          fill={`url(#${fine})`}
          stroke="#f8f6ec"
        />
        <path d="m424 243 10-12" strokeWidth="3" />
        <circle cx="429" cy="271" r="11" fill="#171717" />
        <circle
          cx="429"
          cy="271"
          r="7"
          fill={`url(#${fine})`}
          stroke="#f8f6ec"
        />
        <path d="m423 268 12 4" strokeWidth="3" />
        {Array.from({ length: 18 }, (_, i) => (
          <path key={i} d={`M413 ${303 + i * 5}h33`} strokeWidth="2" />
        ))}
        <circle cx="429" cy="414" r="4" fill="#c82924" />
        <path
          d="M167 434 162 454 191 458 199 436M414 444 420 465 447 465 450 445"
          fill={`url(#${hatch})`}
          strokeWidth="2"
        />
        <path
          d="M481 209 537 179M481 219 537 189M481 229 537 199M481 239 537 209M481 249 537 219M481 259 537 229M481 269 537 239M481 279 537 249M481 289 537 259M481 299 537 269M481 309 537 279M481 319 537 289M481 329 537 299M481 339 537 309M481 349 537 319"
          strokeWidth="1.2"
        />
        <path
          d="M280 138V118Q280 109 291 109L347 112Q359 112 359 121V141M287 139V120Q287 116 293 116L345 119Q351 119 351 124V141"
          fill="#f8f6ec"
          strokeWidth="2"
        />
        <text
          x="282"
          y="423"
          fill="#171717"
          stroke="none"
          fontFamily="DM Sans,sans-serif"
          textAnchor="middle"
          fontWeight="600"
          fontSize="5"
          letterSpacing="2"
        >
          INTERDIMENSIONAL TELEVISION
        </text>
      </g>
    </svg>
  );
}

export default function ReferenceArchive({
  openContact,
}: {
  openContact: (service?: string) => void;
}) {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All frequencies");
  const [view, setView] = useState<"grid" | "list">(storedView);
  const [sort, setSort] = useState("featured");
  const active = liveTransmissions[selected];
  const changeSelection = (direction: number) =>
    setSelected(
      (index) =>
        (index + direction + liveTransmissions.length) %
        liveTransmissions.length,
    );
  const setArchiveView = (next: "grid" | "list") => {
    setView(next);
    try {
      localStorage.setItem("itv_view", next);
    } catch {
      /* Optional preference. */
    }
  };
  const filtered = liveTransmissions
    .filter(
      (item) =>
        (filter === "All frequencies" || item.frequency === filter) &&
        [item.title, item.subtitle, item.frequency, ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "channel"
        ? a.id.localeCompare(b.id)
        : sort === "shortest"
          ? a.reading - b.reading
          : 0,
    );

  return (
    <div className="reference-archive">
      <section className="collection-hero" aria-label="Featured transmissions">
        <div className="collection-hero-top">
          <span>THE COLLECTION OF SIGNALS</span>
          <span>
            {String(selected + 1).padStart(2, "0")} /{" "}
            {String(liveTransmissions.length).padStart(2, "0")}
          </span>
        </div>
        <div className="collection-hero-title" aria-live="polite">
          <h1 aria-label={active.title}>
            {(active.slug === "digistatement"
              ? ["DIGI", "STATEMENT"]
              : active.slug === "camden-imagines"
                ? ["CAMDEN", "IMAGINES"]
                : active.slug === "mymunshi"
                  ? ["MY", "MUNSHI"]
                  : active.slug === "game-prototype"
                    ? ["THE NEXT", "FREQUENCY"]
                    : ["PARDA"]
            ).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
        </div>
        <div className="collection-hero-object" key={active.id}>
          <EngravedReceiver item={active} suffix="featured" />
        </div>
        <div className="collection-hero-label collection-hero-label-left">
          <span>{active.frequency.toUpperCase()}</span>
          <span>{active.tags[0].toUpperCase()}</span>
          <span>{statusLabel(active.status).toUpperCase()}</span>
        </div>
        <div className="collection-hero-label collection-hero-label-right">
          <span>CH. {active.id}</span>
          <span>{active.reading} MINUTE TRANSMISSION</span>
          <span>{active.year.toUpperCase()}</span>
        </div>
        <div className="collection-hero-subtitle">
          <p>{active.subtitle}</p>
        </div>
        <div className="collection-controls">
          <button
            className="collection-arrow"
            aria-label="Previous transmission"
            onClick={() => changeSelection(-1)}
          >
            <ArrowLeft size={22} />
          </button>
          <Link className="collection-open" to={`/work/${active.slug}`}>
            OPEN TRANSMISSION <ArrowUpRight size={17} />
          </Link>
          <button
            className="collection-arrow"
            aria-label="Next transmission"
            onClick={() => changeSelection(1)}
          >
            <ArrowRight size={22} />
          </button>
        </div>
        <div
          className="collection-pagination"
          aria-label="Choose featured transmission"
        >
          {liveTransmissions.map((item, i) => (
            <button
              key={item.id}
              aria-label={`Show ${item.title}`}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <a className="collection-hero-library-link" href="#all-transmissions">
          THE FULL PROGRAMME GUIDE <ArrowRight size={15} />
        </a>
      </section>

      <section className="collection-library" id="all-transmissions">
        <div className="collection-library-heading">
          <span>ALL AVAILABLE TRANSMISSIONS</span>
          <h2>
            FIND YOUR
            <br />
            FREQUENCY.
          </h2>
          <p>
            Follow a question, a discipline, or a little curiosity.
            <br />
            Every signal tells you where it comes from.
          </p>
        </div>
        <div className="archive-tools">
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Search transmissions</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the transmissions…"
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery("")}>
                <X size={17} />
              </button>
            )}
          </label>
          <div className="view-switch" aria-label="Archive view">
            <button
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setArchiveView("grid")}
            >
              <Grid2X2 size={18} />
            </button>
            <button
              aria-label="Schedule view"
              aria-pressed={view === "list"}
              onClick={() => setArchiveView("list")}
            >
              <List size={19} />
            </button>
          </div>
        </div>
        <div className="filter-toolbar">
          <div className="filter-pills">
            {["All frequencies", ...frequencies.map((f) => f.name)].map(
              (name) => (
                <button
                  key={name}
                  aria-pressed={filter === name}
                  onClick={() => setFilter(name)}
                >
                  {name}
                  {name === "All frequencies" && (
                    <span>{liveTransmissions.length}</span>
                  )}
                </button>
              ),
            )}
          </div>
          <label className="sort-label">
            <SlidersHorizontal size={14} />
            <span className="sr-only">Sort transmissions</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured first</option>
              <option value="channel">Channel number</option>
              <option value="shortest">Shortest read</option>
            </select>
          </label>
        </div>
        <div className="collection-results-label" aria-live="polite">
          {String(filtered.length).padStart(2, "0")} SIGNALS /{" "}
          {filter.toUpperCase()}
        </div>
        {filtered.length ? (
          view === "grid" ? (
            <div className="archive-grid collection-grid">
              {filtered.map((item, i) => (
                <Link
                  className="collection-project"
                  to={`/work/${item.slug}`}
                  key={item.id}
                >
                  <div className="collection-project-art">
                    <span>CH. {item.id}</span>
                    <EngravedReceiver item={item} suffix={`card-${i}`} />
                    <ArrowUpRight size={19} />
                  </div>
                  <div className="collection-project-status">
                    <span>{statusLabel(item.status)}</span>
                    <span>{item.reading} MIN</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="schedule-list">
              {filtered.map((item) => (
                <Link to={`/work/${item.slug}`} key={item.id}>
                  <span>CH. {item.id}</span>
                  <h3>{item.title}</h3>
                  <span>{item.frequency}</span>
                  <span>{statusLabel(item.status)}</span>
                  <span>{item.reading} MIN</span>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="empty-state">
            <Radio size={32} />
            <h2>No signal on this frequency.</h2>
            <p>
              No transmission matches “{query || filter}”. Try another
              frequency, or tell me what you’re looking for.
            </p>
            <button
              className="collection-open"
              onClick={() => {
                setQuery("");
                setFilter("All frequencies");
              }}
            >
              Reset the receiver <ArrowRight size={16} />
            </button>
            <button
              className="collection-custom-brief"
              onClick={() => openContact()}
            >
              Transmit a custom brief <ArrowUpRight size={16} />
            </button>
          </div>
        )}
        <TreatmentIndex />
        <details className="signal-vault">
          <summary>
            <div>
              <span>THE SIGNAL VAULT</span>
              <h2>
                NOT LOST.
                <br />
                IN RESTORATION.
              </h2>
            </div>
            <span>
              14 ARCHIVES <Plus size={18} />
            </span>
          </summary>
          <p>
            Earlier briefs, research, and studio projects awaiting source checks
            and excerpt clearance. These are archive entries, not live case
            studies.
          </p>
          <div className="vault-table">
            {transmissions
              .filter((item) => item.status === "vault")
              .sort((a, b) => a.id.localeCompare(b.id))
              .map((item) => (
                <div key={item.id}>
                  <span>CH. {item.id}</span>
                  <strong>{item.title}</strong>
                  <span>{item.frequency}</span>
                  <span>IN RESTORATION</span>
                </div>
              ))}
          </div>
          <button
            className="collection-custom-brief"
            onClick={() => openContact("Private archive walkthrough")}
          >
            ASK ABOUT A RELEVANT ARCHIVE <ArrowUpRight size={17} />
          </button>
        </details>
      </section>
      <section className="collection-contact">
        <p>THE NEXT SIGNAL COULD BE YOURS.</p>
        <h2>
          LET’S MAKE
          <br />
          SOMETHING
          <br />
          WORTH TUNING IN.
        </h2>
        <button className="collection-open" onClick={() => openContact()}>
          OPEN A CHANNEL <ArrowUpRight size={17} />
        </button>
      </section>
    </div>
  );
}
