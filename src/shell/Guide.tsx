import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { transmissions, provenanceLabel } from "../data/transmissions";
import { pauseScroll, resumeScroll } from "../motion/clock";
import { useShell } from "./context";

/** The quick tune: search every channel (G). */
export default function Guide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  // Each close we trigger ourselves still fires an async "close" event; count them so only user-driven closes report.
  const quiet = useRef(0);
  const closeQuiet = () => {
    if (!ref.current?.open) return;
    quiet.current += 1;
    ref.current.close();
  };
  const { tune } = useShell();
  const navigate = useNavigate();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setQ("");
      d.showModal();
      pauseScroll();
    } else if (!open && d.open) {
      quiet.current += 1;
      d.close();
    }
  }, [open]);
  const sorted = [...transmissions].sort((a, b) => Number(a.status === "vault") - Number(b.status === "vault") || a.id.localeCompare(b.id));
  const items = sorted.filter((t) => `${t.title} ${t.frequency} ${t.id} ${t.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <dialog
      ref={ref}
      className="guide-dialog"
      aria-labelledby="guide-title"
      data-lenis-prevent
      onCancel={onClose}
      onClose={() => {
        resumeScroll();
        if (quiet.current > 0) quiet.current -= 1;
        else onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      <div className="guide-inner">
        <div className="guide-head">
          <div>
            <span className="osd">The quick tune · {transmissions.length} channels</span>
            <h2 id="guide-title" className="disp">Find your signal</h2>
          </div>
          <button type="button" className="hud" onClick={() => ref.current?.close()} aria-label="Close programme guide">Close</button>
        </div>
        <label className="guide-search">
          <span className="sr-only">Search programme guide</span>
          <input autoFocus placeholder="A project, a discipline, a channel number…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="guide-results" aria-live="polite">
          {items.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                // Close now (an open modal swallows the G shortcut) and report it through state.
                closeQuiet();
                onClose();
                tune(`/work/${t.slug}`);
              }}
            >
              <span className="osd">CH {t.id}</span>
              <strong className="disp">{t.title}</strong>
              <span className="osd dim">{t.frequency} · {provenanceLabel(t)}</span>
            </button>
          ))}
          {!items.length && <p className="guide-empty">No matching signal. Try "Words", "Research" or "Play".</p>}
        </div>
        <div className="guide-foot osd">
          <button type="button" onClick={() => { closeQuiet(); onClose(); navigate("/catalogue"); }}>Full programme guide</button>
        </div>
      </div>
    </dialog>
  );
}
