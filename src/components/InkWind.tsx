export default function InkWind() {
  return (
    <svg
      className="ink-wind"
      viewBox="0 0 1440 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="wind-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="1440" height="1000" fill="#1d1d1d" />
      <g fill="none" stroke="#454545" strokeLinecap="butt">
        {Array.from({ length: 64 }, (_, i) => {
          const y = 50 + i * 13;
          const n = Math.sin(i * 8.3) * 15;
          return (
            <path
              key={i}
              opacity={i % 4 === 0 ? 0.5 : 0.3}
              strokeWidth={i % 6 === 0 ? 8 : i % 3 === 0 ? 3 : 1}
              d={`M${-400 + (i % 5) * 40} ${y + 220} C ${190 + n} ${y - 5},${430 - n} ${y + 150},${690 + n} ${y + 60} S ${1120 + n} ${y - 10},${1610} ${y - 150}`}
            />
          );
        })}
      </g>
      <g fill="#141414" opacity=".8">
        <path d="M-50 720C220 610 390 855 810 658C433 756 312 641-50 720Z" />
        <path d="M-30 420C170 270 540 320 760 255C449 367 310 249-30 420Z" />
        <path d="M720 850C840 762 1250 779 1500 540C1250 832 1010 777 720 850Z" />
      </g>
      <rect
        width="1440"
        height="1000"
        opacity=".065"
        filter="url(#wind-grain)"
      />
    </svg>
  );
}
