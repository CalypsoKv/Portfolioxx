import type { CSSProperties } from "react";

/** Letters blur in one after another. The parent keeps the full text for assistive tech; the pieces are hidden from it. */
export default function SplitChars({
  text,
  className,
  stagger = 60,
}: {
  text: string;
  className?: string;
  stagger?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="split-char"
          style={{ "--i": i, "--stagger": `${stagger}ms` } as CSSProperties}
        >
          {c}
        </span>
      ))}
    </span>
  );
}
