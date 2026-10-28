import { useEffect, useRef, useState } from "react";
import { liveTransmissions } from "../data/transmissions";
import { Draggable } from "../motion/clock";
import { tick } from "../motion/audio";
import { prefersReducedMotion } from "../motion/capability";
import { useShell } from "./context";

const STEP = 360 / liveTransmissions.length;
const at = (rot: number) => {
  const n = liveTransmissions.length;
  return liveTransmissions[((Math.round(rot / STEP) % n) + n) % n];
};

/** The tuning knob on the plaque. Press it for the programme guide; turn it (drag, with momentum) to tune straight to a channel. */
export default function Dial() {
  const { openGuide, tune } = useShell();
  const knob = useRef<HTMLButtonElement>(null);
  const dragged = useRef(false);
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!knob.current || prefersReducedMotion() || matchMedia("(pointer: coarse)").matches) return;
    let last = "";
    const show = (rot: number) => {
      const t = at(rot);
      if (t.id !== last) {
        last = t.id;
        tick();
      }
      setLabel(`CH ${t.id} · ${t.title}`);
    };
    const [d] = Draggable.create(knob.current, {
      type: "rotation",
      inertia: true,
      snap: (v: number) => Math.round(v / STEP) * STEP,
      onDragStart() {
        dragged.current = true;
      },
      onDrag() {
        show(this.rotation);
      },
      onThrowUpdate() {
        show(this.rotation);
      },
      onRelease() {
        // The click that follows a drag is not a press.
        window.setTimeout(() => (dragged.current = false), 0);
        if (!this.isThrowing) finish(this.rotation);
      },
      onThrowComplete() {
        finish(this.rotation);
      },
    });
    let timer = 0;
    const finish = (rot: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setLabel("");
        tune(`/work/${at(rot).slug}`);
      }, 420);
    };
    return () => {
      window.clearTimeout(timer);
      d.kill();
    };
  }, [tune]);
  return (
    <span className="knob-wrap">
      <button
        ref={knob}
        type="button"
        className="knob"
        aria-label="Programme guide (G). Turn the dial to tune to a channel."
        onClick={() => {
          if (!dragged.current) openGuide();
        }}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="13" />
          <path d="M16 4.5 V11" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={16 + Math.cos((i / 12) * Math.PI * 2) * 15.2} cy={16 + Math.sin((i / 12) * Math.PI * 2) * 15.2} r="0.9" className="tick" />
          ))}
        </svg>
      </button>
      {label && <span className="knob-label osd" aria-hidden="true">{label}</span>}
    </span>
  );
}
