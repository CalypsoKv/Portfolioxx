import { REGISTERS } from "../stage/registers";
import { HOME_PLATE } from "../stage/registers";
import { useScene } from "../stage/useScene";

const SWATCHES: [string, string][] = [["Charcoal", "#1d1d1d"], ["Black", "#030300"], ["Ink", "#11100d"], ["Paper", "#f5efe0"], ["Red", "#c82924"], ["HUD", "#ffea63"]];

/** A small, live reference for the visual system. */
export default function World() {
  useScene(HOME_PLATE, "natural", 0.35);
  return (
    <section className="page-hero">
      <title>World and motion · Interdimensional TV</title>
      <div className="in">
        <span className="osd yel">World and motion</span>
        <h1 className="disp" tabIndex={-1}>One world, one HUD.</h1>
        <p className="narr ink"><b className="osd">Narrator</b>The world is ink and paper. The interface is a yellow glow on black. One condensed Didone voice sets the titles.</p>
        <div className="swatches">{SWATCHES.map(([n, c]) => <div key={n} className="swatch" style={{ background: c, color: n === "Paper" || n === "HUD" ? "#030300" : "#fbf8ef" }}><span className="osd">{n}<br />{c}</span></div>)}</div>
        <h2 className="disp">Three stations</h2>
        <div className="swatches">{(["red", "turmeric", "blue"] as const).map((k) => <div key={k} className="swatch" style={{ background: `linear-gradient(90deg, ${REGISTERS[k].c.join(", ")})` }}><span className="osd" style={{ background: "#030300", color: "#ffea63", padding: "3px 6px" }}>{k}</span></div>)}</div>
        <p className="fine">Motion: hand-inked borders step eight times a second; letters blur in; the screen glitches between channels; reduced motion switches all of it off and keeps the state changes.</p>
      </div>
    </section>
  );
}
