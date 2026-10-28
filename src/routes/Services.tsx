import { frequencies } from "../data/transmissions";
import { useShell } from "../shell/context";
import TuneLink from "../shell/TuneLink";
import { plateFor } from "../stage/registers";
import { useScene } from "../stage/useScene";

const FIT: Record<string, string> = {
  Words: "Publications, editorial teams and founders with something worth saying, and readers with a specific question.",
  Product: "SaaS and product teams whose website, content and sales material need to tell one story and lead to the next step.",
  Research: "Research groups and organisations whose thinking is valuable but hard to enter.",
  Studio: "Founders and makers who want the voice, the identity and the website to belong to the same world.",
  Play: "Teams that want a character, a short animated story or an AI-assisted prototype with a human hand on it.",
};
const LINK: Record<string, [string, string]> = {
  Words: ["/work/digistatement", "See 20 published bylines"],
  Product: ["/work/reptrics", "See the Reptrics system"],
  Research: ["/work/fiction-essays", "Read the essays"],
  Studio: ["/work/kink-studios", "See a brand system"],
  Play: ["/work/animation", "See the animation work"],
};

export default function Services() {
  const { openContact } = useShell();
  useScene({ plate: plateFor("012"), reg: "natural", dim: 0.2 });
  return (
    <>
      <section className="page-hero">
        <title>Services · Jahan Patel</title>
        <meta name="description" content="Ways to work with Jahan Patel: editorial writing, product websites and content, research and systems, brand and design, animation and AI." />
        <div className="in">
          <span className="osd yel">The frequencies · Ways to work together</span>
          <h1 className="disp" tabIndex={-1}>Complex brief.<br />Clear signal.</h1>
          <p className="narr ink"><b className="osd">Narrator</b>Find the useful idea, shape the story, and build the words, pages and pictures that carry it.</p>
        </div>
      </section>
      <div className="paper-band">
        <div className="in work-body">
          {frequencies.map((f) => (
            <article key={f.name} id={f.name.toLowerCase()} className="service ink">
              <span className="osd">Freq. {f.number} / {f.name}</span>
              <h2 className="disp" data-reveal>{f.label}</h2>
              <p className="lead">{f.description}</p>
              <div className="service-cols">
                <div><h3 className="osd">The kind of work</h3><ul>{f.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></div>
                <div><h3 className="osd">A good fit for</h3><p>{FIT[f.name]}</p></div>
              </div>
              <p className="inline-row">
                <button type="button" className="inline-link" onClick={() => openContact(f.label)}>Discuss a {f.name.toLowerCase()} brief →</button>
                <span aria-hidden="true">·</span>
                <TuneLink className="inline-link" to={LINK[f.name][0]}>{LINK[f.name][1]}</TuneLink>
              </p>
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
