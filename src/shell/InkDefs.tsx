import { useEffect, useRef } from "react";
import { gsap } from "../motion/clock";
import { prefersReducedMotion } from "../motion/capability";

/** Hand-inked edges: one displacement filter whose seed steps 8 times a second, so borders "boil" like drawn animation. */
export default function InkDefs() {
  const a = useRef<SVGFETurbulenceElement>(null);
  const b = useRef<SVGFETurbulenceElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let step = -1;
    const tick = (t: number) => {
      const s = Math.floor(t * 8);
      if (s === step) return;
      step = s;
      a.current?.setAttribute("seed", String((s % 9) + 2));
      b.current?.setAttribute("seed", String((s % 7) + 11));
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="rough" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence ref={a} type="fractalNoise" baseFrequency="0.03 0.045" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G" /></filter>
      <filter id="rough-s" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence ref={b} type="fractalNoise" baseFrequency="0.05 0.07" numOctaves="2" seed="5" /><feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G" /></filter>
    </svg>
  );
}
