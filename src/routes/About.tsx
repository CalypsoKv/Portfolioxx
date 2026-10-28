import { contactEmail } from "../data/transmissions";
import Wallet from "../showcase/Wallet";
import { useShell } from "../shell/context";
import { HOME_PLATE } from "../stage/registers";
import { useScene } from "../stage/useScene";

export default function About() {
  const { openContact } = useShell();
  useScene({ plate: HOME_PLATE, reg: "natural", dim: 0.15 });
  return (
    <>
      <section className="page-hero">
        <title>The broadcaster · Jahan Patel</title>
        <meta name="description" content="Jahan Patel: physics graduate, writer, website and brand designer, animator. Based in Indore, India, working remotely." />
        <div className="in">
          <span className="osd yel">Behind the signal · Jahan Patel</span>
          <h1 className="disp" tabIndex={-1}>One person.<br />Not one thing.</h1>
          <p className="narr ink"><b className="osd">Narrator</b>A writer's curiosity. A strategist's structure. A maker's instinct.</p>
        </div>
      </section>
      <div className="paper-band">
        <div className="in work-body">
          <div className="about-intro">
            <article className="paper ink">
              <p className="dropcap">I’m Jahan Patel, a writer and designer based in Indore, India, working remotely. I studied physics at St. Xavier’s College in Mumbai, started answering strangers’ questions on Quora in 2017, and have been paid to write since 2019.</p>
              <p>Since then: more than 200 games and tech articles for DigiStatement; website content for healthcare and SaaS clients through TealBox Digital and Pepper Content; the content programme at CustomerSuccessBox; and, as Senior Marketing Manager at Reptrics, a website rebuilt end to end with a marketing system around it. I kept the documentation for long-horizon research at the Civilization Research Institute, and in 2025 ran seminar scripts and a newsletter for RedOrange.AI.</p>
              <p>I also run Badhuche Art Studio, handle the marketing for my mother’s kitchen in Indore, and built the site, brand and community side of NowTheo. Lately the work has moved toward brand systems and animation: character design, scripts and AI-assisted illustration.</p>
              <p>Two questions run through all of it. From commercial work: what makes someone understand, trust and act? From research: what is the actual structure of the problem, before we decide how to say it?</p>
            </article>
            <figure className="press-photo ink">
              <img src="/people/jahan-press.webp" alt="Jahan Patel in a light blazer with a camera strap over his shoulders, smiling, printed in ink on cream paper." width="640" height="800" decoding="async" />
              <figcaption className="osd">Jahan Patel · photo supplied by Jahan, printed for this site</figcaption>
            </figure>
          </div>
          <Wallet />
          <section className="principles">
            {[
              ["01", "Clarity is a form of care.", "The reader's time matters. Start with their question, use the words you need, and leave the rest."],
              ["02", "Follow the signal.", "A source is not a credit. A concept is not a client outcome. Every project here says what kind of evidence stands behind it."],
              ["03", "Stay curious.", "The interesting work sits between disciplines: physics and prose, research and marketing, words and moving pictures."],
            ].map(([n, h, b]) => (
              <div key={n} className="principle ink thin"><span className="osd">{n}</span><h2 className="disp">{h}</h2><p>{b}</p></div>
            ))}
          </section>
          <aside className="banner ink" id="contact">
            <span className="osd">Open a channel · Direct inquiry</span>
            <p><a className="big-mail" href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
            <p><button type="button" className="inline-link" onClick={() => openContact()}>Or send a short brief →</button></p>
          </aside>
        </div>
      </div>
    </>
  );
}
