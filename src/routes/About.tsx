import { contactEmail } from "../data/transmissions";
import { useShell } from "../shell/context";
import { HOME_PLATE } from "../stage/registers";
import { useScene } from "../stage/useScene";

export default function About() {
  const { openContact } = useShell();
  useScene(HOME_PLATE, "natural", 0.15);
  return (
    <>
      <section className="page-hero">
        <title>The broadcaster · Interdimensional TV</title>
        <meta name="description" content="Jahan Patel: a writer's curiosity, a strategist's structure, a maker's instinct." />
        <div className="in">
          <span className="osd yel">Behind the signal · Jahan Patel</span>
          <h1 className="disp" tabIndex={-1}>One person.<br />Not one thing.</h1>
          <p className="narr ink"><b className="osd">Narrator</b>A writer's curiosity. A strategist's structure. A maker's instinct.</p>
        </div>
      </section>
      <div className="paper-band">
        <div className="in work-body">
          <article className="paper ink">
            <p className="dropcap">I'm Jahan Patel. Interdimensional TV is my working portfolio: a place for writing, product thinking, research, and the experiments that happen between them. I also run Badhuche Art Studio and Urmila Ben Nu Rasodu, and I built the site, brand and community side of NowTheo.</p>
            <p>I'm interested in how an idea becomes legible. Sometimes that takes an article. Sometimes a product narrative, a system map, a website, or a different question entirely.</p>
          </article>
          <section className="principles">
            {[
              ["01", "Clarity is a form of care.", "The reader's time matters. Start with their question, use the words you need, and leave the rest."],
              ["02", "Follow the signal.", "A source is not a credit. An experiment is not a client outcome. Every project is labelled for what it actually is."],
              ["03", "Stay curious.", "The interesting work often sits between disciplines. Keep listening beyond your own frequency."],
            ].map(([n, h, b]) => (
              <div key={n} className="principle ink thin"><span className="osd">{n}</span><h2 className="disp">{h}</h2><p>{b}</p></div>
            ))}
          </section>
          <aside className="banner ink" id="contact">
            <span className="osd">Open a channel · Direct inquiry</span>
            <p><a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
            <button type="button" className="hud" onClick={() => openContact()}>Or send a short brief</button>
          </aside>
        </div>
      </div>
    </>
  );
}
