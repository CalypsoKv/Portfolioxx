import { useId, useRef, type CSSProperties } from "react";
import "./broadcast-scene.css";

type BroadcastSceneProps = {
  frequency: string;
  onTune: (frequency: string) => void;
};

const frequencies = {
  Words: {
    channel: "007",
    title: "WORDS THAT",
    line: "TRAVEL.",
    note: "EDITORIAL / NARRATIVE",
    color: "#c4d0ac",
  },
  Product: {
    channel: "004",
    title: "LESS FRICTION.",
    line: "MORE FLOW.",
    note: "PRODUCT / SYSTEMS",
    color: "#e4aa54",
  },
  Research: {
    channel: "000",
    title: "FOLLOW THE",
    line: "QUESTION.",
    note: "RESEARCH / SYNTHESIS",
    color: "#a7c7c0",
  },
  Studio: {
    channel: "013",
    title: "BUILD A",
    line: "BETTER WORLD.",
    note: "IDENTITY / DIGITAL",
    color: "#d5b894",
  },
  Play: {
    channel: "017",
    title: "WHAT IF",
    line: "WE TRIED?",
    note: "EXPERIMENT / POSSIBILITY",
    color: "#c8b9ce",
  },
};

export default function BroadcastScene({
  frequency,
  onTune,
}: BroadcastSceneProps) {
  const uid = useId().replace(/:/g, "");
  const p = (name: string) => `${uid}-${name}`;
  const wrap = useRef<HTMLDivElement>(null);
  const current =
    frequencies[frequency as keyof typeof frequencies] || frequencies.Words;
  const updateParallax = (x: number, y: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    wrap.current?.style.setProperty("--scene-x", `${x}deg`);
    wrap.current?.style.setProperty("--scene-y", `${y}deg`);
  };

  return (
    <div
      ref={wrap}
      className="broadcast-scene"
      style={{ "--phosphor": current.color } as CSSProperties}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        updateParallax(
          ((event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 3,
          ((event.clientY - bounds.top - bounds.height / 2) / bounds.height) *
            -2,
        );
      }}
      onPointerLeave={() => updateParallax(0, 0)}
    >
      <div className="scene-coordinate scene-coordinate-top">
        <span>FIG. 01</span> THE BROADCAST ROOM
      </div>
      <svg
        className="broadcast-art"
        viewBox="0 0 720 610"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={p("hatch")}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(32)"
          >
            <path
              d="M0 0V6"
              stroke="#e9e2cf"
              strokeOpacity=".38"
              strokeWidth=".65"
            />
          </pattern>
          <pattern
            id={p("dense")}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-35)"
          >
            <path
              d="M0 0V4"
              stroke="#071b17"
              strokeOpacity=".7"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id={p("screen")}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 1H4"
              stroke="#0d2220"
              strokeOpacity=".16"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id={p("dots")}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".7" fill="#e9e2cf" fillOpacity=".3" />
          </pattern>
          <linearGradient id={p("glow")} x1="0" x2="1" y1="0" y2="1">
            <stop stopColor={current.color} />
            <stop offset="1" stopColor="#718a6c" />
          </linearGradient>
          <clipPath id={p("main-screen")}>
            <path d="M209 230Q302 211 396 220Q410 223 410 241L410 360Q408 379 392 382L218 394Q202 393 200 375L199 252Q199 234 209 230Z" />
          </clipPath>
        </defs>

        {/* The room is an ink illustration: no external model or texture download. */}
        <g stroke="#d7d9bc" strokeWidth=".7" opacity=".22">
          <ellipse cx="363" cy="315" rx="274" ry="239" strokeDasharray="3 8" />
          <path d="M54 375L656 255M92 474L673 356M169 557L692 451M183 149L118 530M313 113L320 569M438 100L521 544M555 126L682 462" />
          <path d="M26 429L167 555L685 452L562 339Z" />
          <path d="M176 554V570M313 527V544M450 499V516M589 472V489" />
        </g>
        <g stroke="#e9e2cf" strokeWidth="1" opacity=".65">
          <path d="M87 173V188M80 180H95M614 298V311M608 304H621M325 54V65M320 59H331" />
          <path d="M619 82L622 89L629 92L622 95L619 102L616 95L609 92L616 89Z" />
          <path d="M152 111L155 117L161 120L155 123L152 129L149 123L143 120L149 117Z" />
        </g>

        {/* A distant transmitter and its orbital signal. */}
        <circle
          cx="568"
          cy="124"
          r="43"
          fill={`url(#${p("hatch")})`}
          stroke="#e9e2cf"
          strokeWidth=".9"
          opacity=".48"
        />
        <path
          d="M518 132Q581 83 623 99Q652 112 590 140Q536 164 520 148"
          stroke="#e9e2cf"
          strokeWidth=".7"
          opacity=".45"
        />
        <circle cx="609" cy="104" r="3" fill="#e4aa54" />

        {/* Rear receiver: an open window onto another frequency. */}
        <g stroke="#d9dfc9" strokeWidth="1.2" strokeLinejoin="round">
          <path d="M400 102L441 76L576 86L542 112Z" fill="#294139" />
          <path
            d="M542 112L576 86L576 208L542 237Z"
            fill={`url(#${p("hatch")})`}
          />
          <path d="M400 102L542 112L542 237L400 224Z" fill="#18332c" />
          <path d="M408 110L534 120L534 227L408 216Z" strokeOpacity=".4" />
          <path d="M418 124L511 132L511 205L418 197Z" fill="#10241f" />
          <path
            d="M422 128L507 135L507 200L422 193Z"
            fill="#365145"
            strokeOpacity=".5"
          />
          <path d="M424 180L447 157L464 177L478 157L506 190" strokeWidth=".8" />
          <path
            d="M425 184L449 166L464 182L480 166L505 194M425 188L449 174L463 187L481 175L504 197"
            strokeWidth=".5"
            opacity=".6"
          />
          <circle cx="480" cy="147" r="6" fill="#d9dfc9" stroke="none" />
          <path
            d="M519 134L527 135M519 140L527 141M519 146L527 147M519 152L527 153M519 158L527 159M519 164L527 165M519 170L527 171"
            strokeWidth=".65"
          />
          <ellipse cx="523" cy="191" rx="4" ry="5" fill="#e4aa54" />
          <path
            d="M421 226L418 244L430 246L436 228M514 236L514 248L524 249L528 237"
            fill="#0d2220"
          />
          <path d="M454 82L459 57L425 27M459 57L494 17" />
          <circle cx="425" cy="27" r="2" fill="#d9dfc9" />
          <circle cx="494" cy="17" r="2" fill="#d9dfc9" />
          <path d="M557 114V203M562 109V199M567 105V194" strokeWidth=".6" />
        </g>

        {/* A compact field monitor, half hidden behind the desk. */}
        <g stroke="#d9dfc9" strokeWidth="1.1" strokeLinejoin="round">
          <path d="M58 279L91 260L220 274L189 295Z" fill="#2d4539" />
          <path
            d="M189 295L220 274L220 394L189 414Z"
            fill={`url(#${p("hatch")})`}
          />
          <path d="M58 279L189 295L189 414L58 397Z" fill="#203c31" />
          <path d="M68 292L159 303L159 384L68 374Z" fill="#0b211b" />
          <path d="M74 300L152 309L152 377L74 367Z" fill="#bdc8aa" />
          <path
            d="M76 334L90 336L96 321L105 354L114 335L132 338L137 329L145 340L151 341"
            stroke="#102c22"
            strokeWidth="1.2"
          />
          <path
            d="M80 347L145 354M80 354L128 360"
            stroke="#102c22"
            strokeWidth=".5"
          />
          <path
            d="M166 309L180 311M166 315L180 317M166 321L180 323M166 327L180 329M166 333L180 335M166 339L180 341M166 345L180 347"
            strokeWidth=".7"
          />
          <ellipse cx="173" cy="371" rx="6" ry="7" fill="#354d3c" />
          <path
            d="M65 397L64 411L77 413L81 399M167 412L165 425L178 426L181 413"
            fill="#0d2220"
          />
          <path
            d="M88 278L88 246Q89 237 98 237L145 242Q151 243 151 252V285"
            strokeWidth="2"
          />
          <path
            d="M96 280L96 249Q96 245 101 246L139 250Q143 250 143 255V284"
            strokeWidth=".8"
          />
          <path d="M200 298V390M205 294V387M210 290V383" strokeWidth=".6" />
        </g>

        {/* The desk: a substantial, hatched, physical object. */}
        <g stroke="#d9dfc9" strokeWidth="1.1" strokeLinejoin="round">
          <path d="M128 435L569 363L662 411L202 494Z" fill="#243f33" />
          <path
            d="M128 435L202 481L662 400L662 418L202 505L128 455Z"
            fill="#192f27"
          />
          <path d="M128 435L202 481L662 400L581 355Z" fill="#314c3b" />
          <path
            d="M128 435L202 481L662 400L581 355Z"
            fill={`url(#${p("dots")})`}
          />
          <path
            d="M142 436L204 474L648 399L581 362Z"
            strokeWidth=".55"
            opacity=".7"
          />
          <path
            d="M154 464L154 545L173 558L173 477M173 558L183 551L183 483"
            fill="#1b352a"
          />
          <path
            d="M616 428L616 512L635 522L635 424M635 522L647 513L647 421"
            fill="#1b352a"
          />
          <path
            d="M233 500L233 562L244 568L244 498M244 568L255 562L255 496"
            fill="#203a2e"
          />
          <path
            d="M161 472V540M166 476V545M623 435V506M628 433V511"
            strokeWidth=".6"
          />
          <path d="M173 528L616 454M173 535L616 461" opacity=".7" />
          <path d="M203 488L656 407" strokeWidth=".5" />
        </g>

        {/* Main studio CRT: engraved shell, sloping glass and phosphor typography. */}
        <g stroke="#e9e2cf" strokeWidth="1.2" strokeLinejoin="round">
          <path
            d="M183 208L252 173Q258 170 268 170L522 157Q542 157 545 173L545 365Q545 377 532 384L466 417Z"
            fill="#314b3d"
          />
          <path
            d="M466 201L535 168L540 174L540 364Q540 373 528 380L466 411Z"
            fill={`url(#${p("hatch")})`}
            strokeWidth=".6"
          />
          <path
            d="M183 208L252 173L522 157Q537 157 542 167L466 201Z"
            fill="#52604b"
          />
          <path
            d="M191 205L258 178L513 164M203 203L264 182L495 169M217 202L269 186L474 174"
            strokeWidth=".5"
            opacity=".6"
          />
          <path
            d="M180 218Q180 208 194 207L450 193Q468 192 468 211L468 399Q468 417 451 419L198 437Q180 438 180 420Z"
            fill="#c5c7a8"
          />
          <path
            d="M185 219Q185 213 196 212L449 198Q462 198 462 212V399Q462 411 450 413L198 431Q186 431 186 419Z"
            fill={`url(#${p("dense")})`}
            stroke="#172c22"
            strokeWidth=".7"
          />
          <path
            d="M195 227Q294 208 404 217Q418 218 420 236L420 363Q418 385 399 389L216 402Q194 401 192 380L190 249Q190 231 195 227Z"
            fill="#122c23"
            stroke="#0c241b"
            strokeWidth="2"
          />
          <path
            d="M209 230Q302 211 396 220Q410 223 410 241L410 360Q408 379 392 382L218 394Q202 393 200 375L199 252Q199 234 209 230Z"
            fill={`url(#${p("glow")})`}
            stroke="#344c37"
          />
          <g
            clipPath={`url(#${p("main-screen")})`}
            stroke="none"
            fill="#183527"
          >
            <path
              d="M200 250L410 237M200 374L410 360"
              stroke="#183527"
              strokeOpacity=".45"
              strokeWidth=".6"
            />
            <text
              x="216"
              y="247"
              fontFamily="monospace"
              fontSize="7"
              letterSpacing="2"
            >
              I D T V / CH. {current.channel}
            </text>
            <circle cx="391" cy="237" r="2.2" />
            <g transform="rotate(-3 310 301)">
              <text
                x="217"
                y="299"
                fontFamily="Georgia, serif"
                fontSize={current.title.length > 12 ? "23" : "28"}
                letterSpacing="-1"
              >
                {current.title}
              </text>
              <text
                x="217"
                y="330"
                fontFamily="Georgia, serif"
                fontStyle="italic"
                fontSize={current.line.length > 12 ? "25" : "34"}
                letterSpacing="-1.2"
              >
                {current.line}
              </text>
            </g>
            <path d="M219 350H390" stroke="#183527" strokeWidth=".6" />
            <text
              x="219"
              y="365"
              fontFamily="monospace"
              fontSize="6.5"
              letterSpacing="1"
            >
              {current.note}
            </text>
            <path
              d="M217 234Q201 265 209 365"
              stroke="#f2efd8"
              strokeWidth="3"
              strokeOpacity=".24"
            />
            <path d="M200 220H420V398H200Z" fill={`url(#${p("screen")})`} />
          </g>
          <g stroke="#1b3427">
            <path d="M429 217L452 216L452 286L429 287Z" fill="#87967b" />
            <circle cx="440" cy="237" r="9" fill="#283f2e" />
            <circle cx="440" cy="237" r="6.4" fill="#b9c2a1" strokeWidth=".6" />
            <path d="M438 239L442 234" strokeWidth="2" />
            <circle cx="440" cy="268" r="9" fill="#283f2e" />
            <circle cx="440" cy="268" r="6.4" fill="#b9c2a1" strokeWidth=".6" />
            <path d="M437 267L443 269" strokeWidth="2" />
            <path
              d="M430 299L452 298M430 304L452 303M430 309L452 308M430 314L452 313M430 319L452 318M430 324L452 323M430 329L452 328M430 334L452 333M430 339L452 338M430 344L452 343M430 349L452 348M430 354L452 353M430 359L452 358M430 364L452 363M430 369L452 368"
              strokeWidth="1.4"
            />
            <circle cx="439" cy="391" r="3" fill="#e4aa54" />
            <text
              x="267"
              y="419"
              fontFamily="monospace"
              fontSize="6.5"
              letterSpacing="3"
              stroke="none"
              fill="#213c2b"
            >
              INTERDIMENSIONAL
            </text>
          </g>
          <path
            d="M207 437L204 454L229 457L237 435M423 422L426 438L447 437L452 420"
            fill="#617059"
            stroke="#bfc7ab"
          />
          <path
            d="M480 219L531 194M480 228L531 203M480 237L531 212M480 246L531 221M480 255L531 230M480 264L531 239M480 273L531 248M480 282L531 257M480 291L531 266M480 300L531 275M480 309L531 284M480 318L531 293M480 327L531 302M480 336L531 311"
            strokeWidth=".8"
            opacity=".7"
          />
          <path
            d="M288 174L288 159Q288 153 298 151L359 147Q368 146 368 154V169M296 173L296 161Q296 158 301 158L355 154Q360 154 360 159V169"
            fill="#152f23"
          />
        </g>

        {/* Studio ephemera: a coiled cable, signal notebook and tuning console. */}
        <g stroke="#d9dfc9" strokeWidth="1" strokeLinejoin="round">
          <path d="M551 325C609 347 590 367 562 383C541 395 536 407 567 413C593 417 611 403 592 399C577 395 571 407 592 414" />
          <path d="M277 462L335 450L369 466L309 477Z" fill="#bfc6a8" />
          <path
            d="M277 462V466L309 481L369 470V466M309 477V481"
            fill="#283f2f"
          />
          <path
            d="M286 462L309 472L359 463M303 460L322 469M309 458L330 468"
            stroke="#24412d"
            strokeWidth=".6"
          />
          <path d="M379 448L460 433L483 445L400 462Z" fill="#263f30" />
          <path
            d="M379 448V455L400 468L483 451V445M400 462V468"
            fill="#132d22"
          />
          <path
            d="M389 448L458 437M395 452L466 441M401 456L474 445"
            strokeWidth=".55"
          />
          <path
            d="M400 446L408 452M415 443L423 449M430 440L438 446M445 437L453 443"
            strokeWidth=".55"
          />
          <circle cx="471" cy="439" r="3" fill="#e4aa54" />
        </g>

        {/* Botanical engraving at the edge of the room. */}
        <g stroke="#bfc9a9" strokeWidth="1" strokeLinejoin="round">
          <path d="M580 350L583 391Q601 405 622 388L626 348Z" fill="#243f2d" />
          <ellipse cx="603" cy="348" rx="24" ry="8" fill="#112a20" />
          <path
            d="M586 357L590 391M592 359L595 394M599 359L601 396M607 359L607 396M614 358L613 394M620 356L618 390"
            strokeWidth=".6"
          />
          <path d="M603 349Q600 292 615 240M604 321Q575 300 573 279M605 302Q633 285 640 268M609 278Q594 259 596 244" />
          <path d="M614 249Q601 221 628 204Q636 231 614 249Z" fill="#314c35" />
          <path
            d="M615 244L626 211M617 235L626 228M619 228L625 220"
            strokeWidth=".5"
          />
          <path d="M597 264Q573 259 581 228Q601 236 597 264Z" fill="#314c35" />
          <path
            d="M596 259L584 235M593 252L584 249M590 245L584 242"
            strokeWidth=".5"
          />
          <path d="M627 286Q625 256 655 252Q656 277 627 286Z" fill="#314c35" />
          <path
            d="M631 280L649 258M636 274L649 270M641 268L648 265"
            strokeWidth=".5"
          />
          <path d="M582 302Q549 305 549 274Q578 273 582 302Z" fill="#314c35" />
          <path
            d="M577 298L555 280M569 291L558 291M563 286L557 285"
            strokeWidth=".5"
          />
          <path d="M605 329Q612 299 638 305Q632 330 605 329Z" fill="#314c35" />
          <path
            d="M611 325L631 309M618 319L631 318M624 314L630 313"
            strokeWidth=".5"
          />
        </g>
        <g
          fill="#d9dfc9"
          opacity=".45"
          fontFamily="monospace"
          fontSize="7"
          letterSpacing="1.5"
        >
          <text x="93" y="218">
            45° N / NO FIXED ADDRESS
          </text>
          <text x="478" y="552">
            EST. IN CURIOSITY
          </text>
        </g>
        <path
          d="M128 225H100L87 255M545 250H579L592 234"
          stroke="#d9dfc9"
          strokeWidth=".6"
          opacity=".5"
        />
        <circle cx="128" cy="225" r="2" fill="#e4aa54" />
      </svg>

      <button
        className={`receiver-label receiver-label-research ${frequency === "Research" ? "is-tuned" : ""}`}
        onClick={() => onTune("Research")}
        aria-label="Tune to Research frequency"
        aria-pressed={frequency === "Research"}
      >
        <span className="receiver-label-dot" /> RESEARCH <span>000 ↗</span>
      </button>
      <button
        className={`receiver-label receiver-label-words ${frequency === "Words" ? "is-tuned" : ""}`}
        onClick={() => onTune("Words")}
        aria-label="Tune to Words frequency"
        aria-pressed={frequency === "Words"}
      >
        <span className="receiver-label-dot" /> WORDS <span>007 ↗</span>
      </button>
      <button
        className={`receiver-label receiver-label-studio ${frequency === "Studio" ? "is-tuned" : ""}`}
        onClick={() => onTune("Studio")}
        aria-label="Tune to Studio frequency"
        aria-pressed={frequency === "Studio"}
      >
        <span className="receiver-label-dot" /> STUDIO <span>013 ↗</span>
      </button>
      <div className="scene-caption">
        <span className="scene-live-dot" />{" "}
        <span>
          CH. {current.channel} / {frequency.toUpperCase()}
        </span>
        <span className="scene-caption-action">
          SELECT A FREQUENCY TO TUNE IN
        </span>
      </div>
    </div>
  );
}
