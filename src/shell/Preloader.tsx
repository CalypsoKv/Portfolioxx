import { useEffect, useRef } from "react";
import { gsap } from "../motion/clock";
import SplitChars from "../motion/SplitChars";
import { prefersReducedMotion } from "../motion/capability";

/** The border fills with real progress (first frame of the screen + fonts). Any key, click, or 2.6s after ready lets you in. */
export default function Preloader({ progress, onEnter }: { progress: number; onEnter: () => void }) {
  const rect = useRef<SVGRectElement>(null);
  const done = useRef(false);
  const ready = progress >= 1;

  useEffect(() => {
    gsap.to(rect.current, { strokeDashoffset: 1000 * (1 - progress), duration: prefersReducedMotion() ? 0 : 0.5, ease: "none" });
  }, [progress]);

  useEffect(() => {
    if (!ready) return;
    const go = () => {
      if (done.current) return;
      done.current = true;
      onEnter();
    };
    const t = window.setTimeout(go, prefersReducedMotion() ? 0 : 2600);
    window.addEventListener("keydown", go);
    window.addEventListener("pointerdown", go);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", go);
      window.removeEventListener("pointerdown", go);
    };
  }, [ready, onEnter]);

  return (
    <div className="preloader" role="dialog" aria-label="Loading the broadcast" aria-modal="true">
      <div className="preloader-in">
        <div className="preloader-box">
          <svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
            <rect ref={rect} x="1.5" y="1.5" width="397" height="57" rx="9" pathLength="1000" />
          </svg>
          <span>Tuning the broadcast. The border fills as the screen and the type load.</span>
        </div>
        <div className={`preloader-gate ${ready ? "ready" : ""}`} aria-live="polite">
          {ready ? <SplitChars text="Press any key to tune in" /> : "Loading"}
        </div>
      </div>
    </div>
  );
}
