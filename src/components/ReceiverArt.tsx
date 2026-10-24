import type { Frequency } from "../data/transmissions";
export default function ReceiverArt({
  frequency,
  variant = 0,
}: {
  frequency: Frequency;
  variant?: number;
}) {
  const c = {
    Words: "#e4aa54",
    Product: "#a5c2ca",
    Research: "#b6c4a0",
    Studio: "#d3a48c",
    Play: "#c1add0",
  }[frequency];
  return (
    <svg viewBox="0 0 500 290" aria-hidden="true" className="receiver-art">
      <defs>
        <pattern
          id={`hatch${variant}${frequency}`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <path d="M0 0v5" stroke={c} strokeWidth=".65" opacity=".35" />
        </pattern>
      </defs>
      <g fill="none" stroke={c} strokeWidth="1.3">
        <ellipse cx="250" cy="253" rx="155" ry="12" opacity=".2" />
        <path d="M140 93 173 70H370V215L337 240H140Z" fill="#132c29" />
        <path d="M140 93H337V240M337 93 370 70M337 240V93M146 99H331V234H146Z" />
        <path
          d="M341 100 363 85V210L341 227Z"
          fill={`url(#hatch${variant}${frequency})`}
        />
        <rect x="155" y="106" width="146" height="111" rx="18" fill="#0a1b19" />
        <rect x="164" y="114" width="128" height="94" rx="13" />
        <path d="m218 71 12-30m-12 30-29-22M184 244v9h22v-9M311 244v9h22v-9" />
        <circle cx="316" cy="121" r="8" />
        <path d="m311 125 10-8M309 147h14M309 152h14M309 157h14M309 162h14M309 167h14M309 172h14M309 177h14M309 182h14M309 187h14" />
        {frequency === "Words" ? (
          <g>
            <path d="M181 130h32m-32 7h25m-25 42h91m-91 6h91m-91 6h65M235 130h38v37h-38Z" />
            <text
              x="181"
              y="166"
              fill={c}
              stroke="none"
              fontFamily="Instrument Serif"
              fontSize="26"
            >
              Aa
            </text>
          </g>
        ) : frequency === "Research" ? (
          <g>
            <circle cx="228" cy="160" r="29" />
            <ellipse cx="228" cy="160" rx="12" ry="29" />
            <path d="M199 160h58m-53-15h48m-48 30h48M181 192h36m31 0h28" />
          </g>
        ) : frequency === "Play" ? (
          <g>
            <path d="m225 132 29 17v27l-29 17-29-17v-27Z M196 149l29 17 29-17M225 166v27" />
            <circle cx="270" cy="130" r="5" />
            <path d="M181 190v-9m-5 5h10" />
          </g>
        ) : frequency === "Studio" ? (
          <g>
            <path d="m200 145 32-18 32 18v35l-32 18-32-18Z M200 145l32 19 32-19m-32 19v34" />
            <circle cx="232" cy="162" r="35" />
          </g>
        ) : (
          <g>
            <rect x="180" y="133" width="95" height="15" rx="2" />
            <path d="M180 157h42v32h-42Zm52 0h43m-43 8h43m-43 8h33m-33 8h40" />
          </g>
        )}
        <path d="M156 223h145M149 78h201M354 119v78" opacity=".4" />
        <text
          x="164"
          y="229"
          stroke="none"
          fill={c}
          fontFamily="IBM Plex Mono"
          fontSize="5"
        >
          ITV — {frequency.toUpperCase()} RECEIVER / ANALOGUE SERIES
        </text>
      </g>
      <g stroke={c} opacity=".15">
        {Array.from({ length: 18 }, (_, i) => (
          <path key={i} d={`M167 ${118 + i * 5}h122`} />
        ))}
      </g>
    </svg>
  );
}
