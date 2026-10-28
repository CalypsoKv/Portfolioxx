import { frequencies } from "../data/transmissions";
import { useShell } from "../shell/context";
import TuneLink from "../shell/TuneLink";
import { plateFor } from "../stage/registers";
import { useScene } from "../stage/useScene";

const FIT: Record<string, string> = {
  Words: "Publications, editorial teams, and founders with something worth saying.",
  Product: "SaaS teams translating a complex product into a clear customer journey.",
  Research: "Research groups and organisations making sense of a complicated landscape.",
  Studio: "Founders and creative teams who want the words and the website to belong to the same world.",
};
const LINK: Record<string, [string, string]> = {
  Words: ["/work/digistatement", "Read editorial analysis"],
  Research: ["/work/camden-imagines", "Explore a field reading"],
  Product: ["/catalogue", "Explore the programme guide"],
  Studio: ["/work/badhuche", "See a studio I run"],
};

export default function Services() {
  const { openContact } = useShell();
  useScene(plateFor("012"), "natural", 0.2);
  return (
    <>
      <section className="page-hero">
        <title>Services · Interdimensional TV</title>
        <meta name="description" content="Ways to work together: editorial writing, product narrative, research and systems, and brand and web systems." />
        <div className="in">
          <span className="osd yel">The frequencies · Ways to work together</span>
          <h1 className="disp" tabIndex={-1}>Complex brief.<br />Clear signal.</h1>
          <p className="narr ink"><b className="osd">Narrator</b>I help teams find the useful idea, shape the story, and build a system that carries it further.</p>
        </div>
      </section>
      <div className="paper-band">
        <div className="in work-body">
          {frequencies.slice(0, 4).map((f) => (
            <article key={f.name} id={f.name.toLowerCase()} className="service ink">
              <span className="osd">Freq. {f.number} / {f.name}</span>
              <h2 className="disp">{f.label}</h2>
              <p className="lead">{f.description}</p>
              <div className="service-cols">
                <div><h3 className="osd">The kind of work</h3><ul>{f.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></div>
                <div><h3 className="osd">A good fit for</h3><p>{FIT[f.name]}</p></div>
              </div>
              <div className="chips">
                <button type="button" className="hud" onClick={() => openContact(f.label)}>Discuss a {f.name.toLowerCase()} brief</button>
                <TuneLink className="hud" to={LINK[f.name][0]}>{LINK[f.name][1]}</TuneLink>
              </div>
            </article>
          ))}
          <aside className="banner ink">
            <span className="osd">A note on the process</span>
            <p>Every collaboration begins with the question you need answered. We agree on the scope, audience, deliverables and what a useful result looks like before the work begins. Project sprints and ongoing collaborations are both welcome.</p>
          </aside>
        </div>
      </div>
    </>
  );
}
