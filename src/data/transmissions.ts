export type Frequency = "Words" | "Product" | "Research" | "Studio" | "Play";
/**
 * What kind of evidence stands behind a channel. Never blur them:
 * published = public byline or URL checked; reported = role and results from Jahan's CV; cleared = Jahan's own
 * files shown with his permission; owned = a business he owns, runs or built; analysis = a reading of someone
 * else's public work; concept = self-initiated; vault = evidence still being restored.
 */
export type Status = "published" | "reported" | "cleared" | "owned" | "analysis" | "concept" | "vault";
export type Link = { label: string; url: string };
/** Real, publicly checkable facts for work the owner runs or built. Required for every "owned" channel. */
export type Owned = {
  kind: "operator" | "builder" | "marketer";
  roles: string[];
  liveUrl: string;
  links: Link[];
  disclosure: string;
  works?: { title: string; note: string; url: string; image?: string }[];
  process?: { title: string; time: string; text: string }[];
  reported?: { metric: string; value: string; source: string; date: string }[];
  highlights?: string[];
  quote?: { text: string; attribution: string; url: string };
};
/** A number from a role, always with where it comes from. */
export type Metric = { value: string; label: string; source: string };
/** A public byline, checked on the live site. */
export type Byline = { title: string; date: string; section: string; url: string; note?: string };
/** A card in a draggable row: an essay, an article, a character. */
export type Piece = { kicker: string; title: string; text: string; url?: string };
/** Website copy shown as written: headline options, the story beats, labelled blocks, the page outline. */
export type CopySpec = { title: string; intro: string; headlines?: string[]; beats?: string[]; blocks?: { label: string; text: string }[]; outline?: string[] };
/** A script excerpt: scenes with lines and the animation notes that travel with them. */
export type ScriptSpec = { title: string; intro: string; scenes: { heading: string; setting?: string; lines: { who: string; dir?: string; text: string }[]; notes: string[] }[] };
/** A looping recording that plays on the screen behind the channel. The plate stays as the still. */
export type Media = { video: string; lite: string; source: string };
export type Transmission = {
  id: string;
  slug: string;
  title: string;
  frequency: Frequency;
  status: Status;
  owned?: Owned;
  subtitle: string;
  tags: string[];
  year: string;
  reading: number;
  summary: string;
  sections?: { title: string; text: string; note?: string }[];
  source?: string;
  /** ROLE · CONTEXT · EVIDENCE · LINK, the one-line record shown under every title. */
  role?: string;
  context?: string;
  links?: Link[];
  metrics?: Metric[];
  bylines?: Byline[];
  pieces?: Piece[];
  copy?: CopySpec;
  script?: ScriptSpec;
  media?: Media;
};
export const frequencies: {
  name: Frequency;
  number: string;
  label: string;
  description: string;
  color: string;
  deliverables: string[];
}[] = [
  {
    name: "Words",
    number: "01",
    label: "Words & editorial",
    description: "Articles, guides, essays and scripts that answer the reader’s real question.",
    color: "#e4aa54",
    deliverables: ["Search-intent articles & guides", "Essays & long-form research", "Scripts for talks, seminars & animation"],
  },
  {
    name: "Product",
    number: "02",
    label: "Product & websites",
    description: "Websites, messaging and content systems that lead somewhere: to the next action.",
    color: "#a5c2ca",
    deliverables: ["Website overhauls & UX content", "B2B SaaS messaging & sales material", "SEO, newsletters & lifecycle email"],
  },
  {
    name: "Research",
    number: "03",
    label: "Research & systems",
    description: "Find the structure of a hard problem before deciding how to say it.",
    color: "#b6c4a0",
    deliverables: ["Research synthesis & documentation", "Reports, briefs & white papers", "Market and competitor maps"],
  },
  {
    name: "Studio",
    number: "04",
    label: "Brand & design",
    description: "A voice, an identity and a website, designed to belong to the same world.",
    color: "#d3a48c",
    deliverables: ["Brand identity & voice", "Website structure & copy", "Interactive brand guidelines"],
  },
  {
    name: "Play",
    number: "05",
    label: "Animation & AI",
    description: "Characters, scripts, motion and AI-assisted prototypes.",
    color: "#c1add0",
    deliverables: ["Animated stories & scripts", "Character design & reference sheets", "AI-assisted illustration & prototypes"],
  },
];
export const transmissions: Transmission[] = [
  {
    id: "000",
    slug: "camden-imagines",
    title: "Camden Imagines",
    frequency: "Research",
    status: "analysis",
    subtitle: "What happens when a borough imagines its future?",
    tags: ["Civic systems", "Field analysis", "Research"],
    year: "Archive",
    reading: 4,
    summary:
      "A contextual reading of civic imagination, participation, and the systems that turn a public conversation into a shared direction.",
    sections: [
      {
        title: "The public question",
        text: "How can a place imagine its future without reducing its people to a set of survey responses? Camden Imagines is included here as a reference for thinking about civic participation, shared narratives, and the distance between consultation and meaningful agency. This is a field-analysis page; it is not presented as commissioned work by Jahan Patel.",
        note: "Context is distinct from contribution. This study does not claim authorship of the original report.",
      },
      {
        title: "Looking for the system",
        text: "A useful systems reading asks who gets to frame the question, who is invited into the conversation, and how ideas travel from individual experience into an institutional decision. The connections between those stages can be more revealing than any single output. A polished report is only one visible part of that larger system.",
      },
      {
        title: "From participation to a usable signal",
        text: "Research synthesis requires attention to what is missing as well as what is repeated. An unusual account can reveal a barrier that a dominant theme obscures. The task is to preserve that specificity while giving decision makers a structure they can use. Any subsequent client case study would need to show the actual research inputs, synthesis decisions, and permission-cleared deliverables.",
      },
      {
        title: "Source and role disclosure",
        text: "No Jahan Patel credit was found in the inspected Camden Imagines report, so his specific contribution is unconfirmed. This reference is therefore labelled Field analysis, and is excluded from claims of authored client work. Original report excerpts and contribution evidence are still required before this can become a credited project.",
      },
    ],
  },
  {
    id: "001",
    slug: "origins",
    title: "Origins",
    frequency: "Studio",
    status: "reported",
    subtitle: "A physics degree, a Quora habit, and the first paid words.",
    tags: ["Story", "Physics", "First jobs"],
    year: "2016–19",
    reading: 3,
    summary:
      "How a physics degree at St. Xavier’s, Mumbai became a writing practice: answering strangers’ questions on Quora from 2017, then a first content job at MapaGuru in 2019.",
    role: "Student, then content writer",
    context: "St. Xavier’s College, Mumbai · Quora · MapaGuru, Delhi",
    sections: [
      {
        title: "Physics first",
        text: "Jahan studied Physics (Hons.) at St. Xavier’s College, Mumbai, from 2016 to 2019, and finished with a GPA of 3.87 out of 4. Physics trains one habit above the others: find the model underneath the noise, then check it against what actually happens. Most of the work on this guide comes back to that habit.",
        note: "Reported from Jahan’s CV.",
      },
      {
        title: "Answering strangers",
        text: "His Quora profile lists freelance writing from 2017. On Quora the brief is always somebody else’s question, and the reader leaves the moment an answer stops being useful. It was a good first editor.",
      },
      {
        title: "The first paid words",
        text: "In March 2019 he joined MapaGuru in Delhi, a platform that connected local coaching centres with students. He wrote the descriptions of centres and courses that sat inside the product, working with the design and development teams. There, content was part of the interface: a title, a trust signal, a course fit, a next action.",
        note: "Content is part of the interface.",
      },
      {
        title: "What carried over",
        text: "The pattern from these years runs through the rest of the guide: a reader with a specific question, a structure that answers it, and a check against reality. The later channels show where it went: games journalism, B2B SaaS, research documentation, brand systems and animation.",
      },
    ],
  },
  {
    id: "002",
    slug: "badhuche",
    title: "Badhuche",
    frequency: "Studio",
    status: "owned",
    subtitle: "Monumental sculpture and public art, from research to installation.",
    tags: ["Sculpture", "Public art", "Studio"],
    year: "Ongoing",
    reading: 3,
    summary:
      "Badhuche Art Studio makes large-scale sculpture and public art for airports, museums and sacred spaces. Jahan owns and runs the studio.",
    media: { video: "/video/badhuche.mp4", lite: "/video/badhuche-lite.mp4", source: "Scroll recording of badhuche.co.in, captured 28 Oct 2026" },
    owned: {
      kind: "operator",
      roles: ["Owner and operator"],
      liveUrl: "https://www.badhuche.co.in",
      links: [
        { label: "Studio website", url: "https://www.badhuche.co.in" },
        { label: "All works", url: "https://www.badhuche.co.in/works" },
        { label: "Start a commission", url: "https://www.badhuche.co.in/contact" },
      ],
      disclosure:
        "Descriptions and figures come from the studio's own website, captured on 28 October 2026. Statistics are studio-reported and have not been independently audited. Work is shown with the owner's permission.",
      works: [
        { title: "Ayodhya Airport art", note: "Kingdom of Lord Ram", url: "https://www.badhuche.co.in/works/ayodhya-ram-darbar", image: "/work/badhuche/ayodhya.webp" },
        { title: "GAN Airport, Maldives", note: "Airport art", url: "https://www.badhuche.co.in/works/gan-airport-maldives", image: "/work/badhuche/gan.webp" },
        { title: "Hindu Samruddhi Mahamarg, Maharashtra", note: "Artwork along the expressway", url: "https://www.badhuche.co.in/works/Samruddhi-MahaMarg", image: "/work/badhuche/samruddhi.webp" },
        { title: "Dehradun Airport", note: "Wall mural", url: "https://www.badhuche.co.in/works/Dehradun-airport-Art", image: "/work/badhuche/dehradun.webp" },
        { title: "Surat Airport", note: "Culture, art and work", url: "https://www.badhuche.co.in/works/surat-airport", image: "/work/badhuche/surat.webp" },
        { title: "Hanimaadhoo Airport, Maldives", note: "Realistic art of an airport wall", url: "https://www.badhuche.co.in/works/202", image: "/work/badhuche/hanimaadhoo.webp" },
      ],
      process: [
        { title: "Design & research", time: "2–4 weeks", text: "Site visits, historical analysis and community engagement shape a cultural brief." },
        { title: "Concept development", time: "4–6 weeks", text: "Sketches, 3D models and material studies explore several directions." },
        { title: "Artisan collaboration", time: "8–24 weeks", text: "Bronze casters, stone carvers, textile artists and metal fabricators work in concert." },
        { title: "Installation & unveiling", time: "2–6 weeks", text: "The work is installed at its permanent home and unveiled with stakeholders." },
      ],
      reported: [
        { metric: "Monumental projects completed", value: "50+", source: "badhuche.co.in", date: "28 Oct 2026" },
        { metric: "Countries", value: "4+", source: "badhuche.co.in", date: "28 Oct 2026" },
        { metric: "Largest installation", value: "440 ft", source: "badhuche.co.in", date: "28 Oct 2026" },
        { metric: "Heaviest bronze sculpture", value: "15 tons", source: "badhuche.co.in", date: "28 Oct 2026" },
      ],
      highlights: ["Airport art", "Museum design", "Bronze casting", "Sacred spaces"],
    },
    sections: [
      {
        title: "A studio for monumental work",
        text: "Badhuche Art Studio makes large-scale sculpture and public art: airport murals, bronze casting, museum design and sacred spaces. Jahan owns and runs the studio. This channel describes the work in the studio's own words and links out to each commission on the studio's website.",
        note: "Owned and operated. The studio's site is the source of record for every figure below.",
      },
      {
        title: "How a commission moves",
        text: "The studio publishes a four-step process: design and research, concept development, artisan collaboration, then installation and unveiling. Timelines vary by commission, from a few weeks of research to several months of fabrication.",
      },
      {
        title: "Selected works",
        text: "Six commissions are listed on the studio's homepage: Ayodhya Airport, GAN Airport in the Maldives, the Hindu Samruddhi Mahamarg in Maharashtra, Dehradun Airport, Surat Airport and Hanimaadhoo Airport in the Maldives. Each links to its page on the studio's site.",
      },
      {
        title: "Source and role",
        text: "Role: owner and operator. The figures shown here (50+ projects, 4+ countries, a 440 ft installation, a 15-ton bronze) are the studio's own statements, as its homepage showed them on 28 October 2026, and are labelled studio-reported. They are not independently audited and are not presented as outcomes of this portfolio.",
      },
    ],
  },
  {
    id: "003",
    slug: "reptrics",
    title: "Reptrics",
    frequency: "Product",
    status: "reported",
    subtitle: "Turning customer-success software into one marketing system.",
    tags: ["B2B SaaS", "Website", "Content system"],
    year: "2022–23",
    reading: 4,
    summary:
      "Senior Marketing Manager at Reptrics, a B2B customer-success platform, from August 2022 to October 2023: the website overhaul, the content programme, sales material, newsletters and attribution.",
    role: "Senior Marketing Manager, leading marketing",
    context: "Reptrics · Tampa, Florida (remote) · Aug 2022 – Oct 2023",
    media: { video: "/video/reptrics.mp4", lite: "/video/reptrics-lite.mp4", source: "Scroll recording of reptrics.com, captured 28 Oct 2026" },
    links: [
      { label: "reptrics.com", url: "https://www.reptrics.com/" },
      { label: "The Reptrics blog", url: "https://www.reptrics.com/blog/" },
    ],
    metrics: [
      { value: "+35%", label: "Marketing-qualified leads within 12 months", source: "Reported" },
      { value: "+20%", label: "Organic traffic after the website and SEO overhaul", source: "Reported" },
      { value: "~15%", label: "Shorter sales cycle with the new sales material", source: "Reported estimate" },
      { value: "+40%", label: "Reach and engagement from cold email and the newsletter", source: "Reported" },
    ],
    pieces: [
      { kicker: "Health scores", title: "Beyond the Numbers: How to Interpret Customer Health Scores", text: "For the CS lead who has a score on every account and needs to know what it is actually saying.", url: "https://www.reptrics.com/beyond-the-numbers-how-to-interpret-customer-health-scores/" },
      { kicker: "Metrics", title: "NPS vs CSAT: A Definitive Guide on Customer Satisfaction Metrics", text: "Two survey metrics, two different questions. When each one is the right instrument.", url: "https://www.reptrics.com/nps-vs-csat/" },
      { kicker: "Revenue", title: "GRR vs NRR: What Is Best for Customer Success and Your B2B SaaS?", text: "Gross and net retention side by side, and what each one hides.", url: "https://www.reptrics.com/grr-vs-nrr-what-is-best-for-customer-success-and-your-b2b-saas/" },
      { kicker: "Mistakes", title: "3 Critical Mistakes You Are Making with Customer Health Scores", text: "Where health scoring goes wrong, and how to fix the model rather than the dashboard.", url: "https://www.reptrics.com/3-critical-mistakes-you-are-making-with-customer-health-scoring-and-how-to-improve-them/" },
      { kicker: "Process", title: "Customer Success Playbooks: Definition, Process, Templates & More", text: "Turning what good CSMs already do into steps a whole team can run.", url: "https://www.reptrics.com/customer-success-playbooks-definition-process-templates-more/" },
      { kicker: "AI", title: "Guide to Using ChatGPT for Customer Success Managers", text: "Where a language model helps a CSM, starting with defining the scope of its use.", url: "https://www.reptrics.com/guide-to-using-chatgpt-for-customer-success-managers/" },
    ],
    sections: [
      {
        title: "The brief",
        text: "Reptrics is a B2B customer-success platform: onboarding, support, Account 360, playbook automation, customer-experience surveys and analytics. The job was to turn a wide product into a clear category story, and to connect that story to demand, sales and conversion.",
        note: "Content becomes commercially useful when it has a next action attached to it.",
      },
      {
        title: "What changed",
        text: "Jahan led the marketing department. He ran the end-to-end overhaul of the company website (structure, UX and UI content, SEO and conversion paths), set the content strategy for the blog, articles and guest writing, rebuilt the pitch decks and sales collateral, and revived the newsletter alongside cold-email campaigns. Team workflows ran through Asana.",
      },
      {
        title: "Measuring it",
        text: "He introduced attribution models so spend could follow what worked. The figures on this page are the outcomes his CV reports for the role. They describe a team’s work in which he led marketing, they are not independently audited, and they are not controlled experiments.",
      },
      {
        title: "What it taught",
        text: "A content programme is a system: category education, problem diagnosis, product explanation, proof, conversion, sales enablement, distribution and measurement. A blog post that is not connected to the next step is decoration.",
      },
    ],
  },
  {
    id: "004",
    slug: "customersuccessbox",
    title: "CustomerSuccessBox",
    frequency: "Product",
    status: "reported",
    subtitle: "Category education that turned into organic demand.",
    tags: ["B2B SaaS", "SEO", "Lifecycle email"],
    year: "2021–22",
    reading: 3,
    summary:
      "Content Marketer at CustomerSuccessBox, a B2B customer-success platform, from October 2021 to July 2022: top-of-funnel strategy, articles, landing pages, ebooks, webinars and the email programme.",
    role: "Content Marketer",
    context: "CustomerSuccessBox · Remote · Oct 2021 – Jul 2022",
    metrics: [
      { value: "+25%", label: "Email open rate", source: "Reported" },
      { value: "+18%", label: "Email click-through rate", source: "Reported" },
      { value: "28%", label: "Of site traffic from the top four ranked articles", source: "Reported" },
      { value: "+15%", label: "Marketing-qualified leads through content paths and lead magnets", source: "Reported" },
    ],
    sections: [
      {
        title: "The problem",
        text: "Customer-success software asks buyers to understand a problem, and a whole category, before they can judge a product. Most of them arrive with a question, not a shortlist.",
        note: "Teach the category first. Product intent follows understanding.",
      },
      {
        title: "The work",
        text: "Jahan set the top-of-funnel strategy and wrote the blog posts, landing pages, ebooks and webinar content behind it. He did the keyword research and on-page SEO, built backlinks through guest writing on industry sites, and wrote the newsletter and the email sequences.",
      },
      {
        title: "Results, as reported",
        text: "His CV reports a 25% lift in email open rates, an 18% lift in click-through, 28% of site traffic arriving through the top four ranked articles, and a 15% increase in marketing-qualified leads from optimised content paths and lead magnets. These are reported figures for the period, not audited ones.",
      },
    ],
  },
  {
    id: "005",
    slug: "urmila-ben-nu-rasodu",
    title: "Urmila Ben Nu Rasodu",
    frequency: "Studio",
    status: "owned",
    subtitle: "My mother’s kitchen in Indore. I run the marketing.",
    tags: ["Food", "Local marketing", "Family business"],
    year: "2024–now",
    reading: 2,
    summary:
      "Urmila Ben Nu Rasodu is his mother’s kitchen in Vijay Nagar, Indore, serving North Indian and street food. Jahan runs its marketing; revenue has grown from zero to more than ₹50 lakh, as reported.",
    metrics: [{ value: "₹50L+", label: "Revenue, grown from zero", source: "Reported" }],
    owned: {
      kind: "marketer",
      roles: ["Marketing"],
      liveUrl: "https://www.instagram.com/urmila_ben_nu_rasoda/",
      links: [
        { label: "Instagram", url: "https://www.instagram.com/urmila_ben_nu_rasoda/" },
        { label: "Zomato listing", url: "https://www.zomato.com/indore/urmila-ben-nu-rasodu-vijay-nagar" },
        { label: "District listing", url: "https://www.district.in/dining/indore/urmila-ben-nu-rasodu-vijay-nagar" },
      ],
      disclosure:
        "The kitchen is his mother’s; Jahan runs its marketing. The revenue figure is his own report and is not audited. Third-party ratings change, so they are linked rather than embedded.",
      highlights: ["North Indian", "Street food", "Dine-in", "Takeaway", "Swiggy & Zomato"],
    },
    sections: [
      {
        title: "The kitchen",
        text: "Urmila Ben Nu Rasodu is a neighbourhood kitchen in Vijay Nagar, Indore, serving North Indian and street food. It is his mother’s restaurant; Jahan runs the marketing. The kitchen’s own pages carry the menu, the photographs and the daily updates.",
        note: "Family business. Jahan’s role: marketing.",
      },
      {
        title: "What is on the menu",
        text: "Public listings describe North Indian and street food, with dine-in and takeaway. The kitchen’s profile mentions dishes such as dal pakwan and dabeli alongside house pickles and snacks.",
      },
      {
        title: "From zero",
        text: "He has run the kitchen’s marketing for about a year, across its Instagram account and its listings on the delivery and dining apps. He reports that revenue has grown from zero to more than ₹50 lakh in that time.",
      },
      {
        title: "Source and role",
        text: "Role: marketing. The revenue figure is Jahan’s own report, not an audited number. Review scores live on the listing sites and change daily, so they are linked rather than quoted.",
      },
    ],
  },
  {
    id: "006",
    slug: "orma-health",
    title: "Orma Health",
    frequency: "Product",
    status: "cleared",
    subtitle: "A healthcare data company’s website, storyboarded.",
    tags: ["Healthcare", "Website copy", "UX content"],
    year: "2019–20",
    reading: 3,
    summary:
      "At TealBox Digital, Jahan developed the website UX and content for Orma Health, a healthcare data and remote patient monitoring company. This channel shows his storyboard for the main and product pages.",
    role: "Website UX and content, in the TealBox Digital team",
    context: "TealBox Digital · Freelance · Aug 2019 – Jun 2020",
    copy: {
      title: "The main page, as a story",
      intro: "From Jahan’s storyboard: the headline options, the story the page tells, and the order of sections that followed from it.",
      headlines: [
        "A holistic data-driven approach to exceptional health care",
        "Exceptional care starts with exceptional data",
        "Exceptional care starts with a continuum of data",
        "Connecting health data for better value-based care",
      ],
      beats: [
        "The headline hooks the visitor and establishes a data company.",
        "How big data is transforming the healthcare system.",
        "The products and services, and how actionable data improves outcomes.",
        "Testimonials, social proof and resources that back the claims.",
        "Calls to action for each kind of stakeholder.",
      ],
      blocks: [
        { label: "First paragraph", text: "Bringing you rich, meaningful insights through a continuum of data. Finding the right formula with data for healthcare providers and health plans to navigate the paradigm shifts." },
        { label: "Sub-headline options", text: "Breathing life into the data. · Data is our insight. Remote Patient Monitoring is our action." },
        { label: "Content block", text: "Proactive care management to drive more value out of care, reducing readmissions and lowering healthcare costs." },
      ],
      outline: ["Headline", "First paragraph", "Hero image", "Call to action", "Data visualisation", "Collaborators", "Remote patient monitoring", "Request a demo", "Testimonials", "Data toolkit", "Blog", "Stakeholder calls to action", "About & contact"],
    },
    sections: [
      {
        title: "The job",
        text: "TealBox Digital ran digital marketing for clients including Orma Health, Performance Medstop and Dekorio. For Orma Health, a company built on healthcare data and remote patient monitoring, Jahan developed the website’s UX and content, working on the user journey and the paths to conversion. He also made pitch decks and sales collateral for the agency’s clients.",
      },
      {
        title: "A storyboard before a sitemap",
        text: "The storyboard sets out the story of the main page before any wireframe exists: hook the visitor and establish a data company, show how big data is changing healthcare, explain the products, back the claims with proof, and close with calls to action for each stakeholder. The sitemap and wireframes followed from it.",
        note: "Write the story first. The layout is how the story is paced.",
      },
      {
        title: "Source and limits",
        text: "Shown from Jahan’s working document, with his permission. It is a planning artifact: no clinical claims are made here, and no outcome figures are reported for the project.",
      },
    ],
  },
  {
    id: "007",
    slug: "digistatement",
    title: "DigiStatement",
    frequency: "Words",
    status: "published",
    subtitle: "200+ articles on games, tech and entertainment, written against the clock.",
    tags: ["Editorial", "Search intent", "Gaming"],
    year: "2020–21",
    reading: 4,
    summary:
      "More than 200 published articles for DigiStatement on games, technology and entertainment: guides, patch analysis, esports news and interviews.",
    role: "Writer",
    context: "DigiStatement · Remote · bylines dated Mar 2020 – Jan 2021",
    source: "https://digistatement.com/author/jahan-patel/",
    media: { video: "/video/digistatement.mp4", lite: "/video/digistatement-lite.mp4", source: "Scroll recording of a DigiStatement byline, captured 28 Oct 2026" },
    links: [{ label: "All articles by Jahan Patel", url: "https://digistatement.com/author/jahan-patel/" }],
    metrics: [
      { value: "200+", label: "Published articles", source: "Reported" },
      { value: "20", label: "Bylines on this page, re-checked on the live site", source: "Verified 28 Oct 2026" },
    ],
    bylines: [
      { title: "Dota 2: Interview with Young CIS Star “Collapse” on How to go Pro & His Journey", date: "21 Jan 2021", section: "Interview", url: "https://digistatement.com/dota-2-interview-with-young-cis-star-collapse-on-how-to-go-pro-his-journey/", note: "An interview with Collapse, then a rising CIS Dota 2 player, on going pro and the journey so far." },
      { title: "Cyberpunk 2077 Tapeworm Mission Guide & Walkthrough", date: "17 Dec 2020", section: "Guide", url: "https://digistatement.com/cyberpunk-2077-tapeworm-mission-guide-walkthrough/" },
      { title: "Dota 2 Hoodwink Gets Nerfed in a Balance Patch, How to Counter Hoodwink?", date: "19 Dec 2020", section: "Patch", url: "https://digistatement.com/dota-2-hoodwink-gets-nerfed-in-a-balance-patch-how-to-counter-hoodwink/" },
      { title: "League of Legends (LoL): Zhonya’s Hourglass still the most purchased item", date: "24 Jan 2021", section: "Analysis", url: "https://digistatement.com/league-of-legends-lol-zhonyas-hourglass-still-the-most-purchased-item/" },
      { title: "Dota 2: TORONTOTOKYO “In the CIS, Only No[o]ne & GPK are world class mid-laners”", date: "22 Jan 2021", section: "Esports", url: "https://digistatement.com/dota-2-torontotokyo-in-the-cis-only-no-o-ne-gpk-are-world-class-mid-laners/" },
      { title: "The most beautiful skins of League of Legends 2020", date: "27 Dec 2020", section: "Feature", url: "https://digistatement.com/the-most-beautiful-skins-of-league-of-legends-2020/" },
      { title: "League of Legends (LoL) Wild Rift Guide: Garen Top Build, Runes", date: "8 Dec 2020", section: "Guide", url: "https://digistatement.com/league-of-legends-lol-wild-rift-guide-garen-top-build-runes/" },
      { title: "League of Legends (LoL): ADC and Bot Lane situation not better in Preseason", date: "17 Nov 2020", section: "Analysis", url: "https://digistatement.com/league-of-legends-lol-adc-and-bot-lane-situation-not-better-in-preseason/" },
      { title: "Dota 2: 4AM abandons the roster, Fy team changes tags", date: "17 Nov 2020", section: "Esports", url: "https://digistatement.com/dota-2-4am-abandons-the-roster-fy-team-changes-tags/" },
      { title: "Genshin Impact: Stone Harbor Treasure Journal Event is now Live!", date: "13 Nov 2020", section: "News", url: "https://digistatement.com/genshin-impact-stone-harbor-treasure-journal-event-is-now-live" },
      { title: "Genshin Impact: Where to find Violetgrass? And how to farm them?", date: "4 Nov 2020", section: "Guide", url: "https://digistatement.com/genshin-impact-where-to-find-violetgrass-and-how-to-farm-them/" },
      { title: "League of Legends Worlds 2020 Review by Region: No Playoffs for LCS again this year", date: "4 Nov 2020", section: "Esports", url: "https://digistatement.com/league-of-legends-worlds-2020-review-by-region-no-playoffs-for-lcs-again-this-year/" },
      { title: "Dota 2 Abed and Kuku come together for Dota Summit 13 new roster", date: "19 Oct 2020", section: "Esports", url: "https://digistatement.com/dota-2-abed-and-kuku-come-together-for-dota-summit-13-new-roster/" },
      { title: "League of Legends vs Wild Rift: Huge Difference in the quality of skins", date: "14 Oct 2020", section: "Feature", url: "https://digistatement.com/league-of-legends-vs-wild-rift-huge-difference-in-the-quality-of-skins/" },
      { title: "League of Legends (LoL) Seraphine Ability Kit revealed, Fans disappointed, Copy of Sona?", date: "13 Oct 2020", section: "News", url: "https://digistatement.com/league-of-legends-lol-seraphine-ability-kit-revealed-fans-disappointed-copy-of-sona/" },
      { title: "Rainbow Six Siege New Attacker Sam Zero Fisher, Ping 2.0, New Weapon Optics & more", date: "17 Aug 2020", section: "News", url: "https://digistatement.com/rainbow-six-siege-new-attacker-sam-zero-fisher-ping-2-0-new-weapon-optics-more/" },
      { title: "Dragon Ball Super- What is Moro Power Level?", date: "10 Jul 2020", section: "Anime", url: "https://digistatement.com/dragon-ball-super-what-is-moro-power-level/" },
      { title: "Valorant Closed Beta Skins : All Weapon Skins on the Market", date: "3 May 2020", section: "Guide", url: "https://digistatement.com/valorant-closed-beta-skins-all-weapon-skins-on-the-market/" },
      { title: "Escape From Tarkov Keys and Prices Guide", date: "31 Mar 2020", section: "Guide", url: "https://digistatement.com/escape-from-tarkov-keys-and-prices-guide/" },
      { title: "GTA 6 Release Date - When is it coming out ?", date: "31 Mar 2020", section: "News", url: "https://digistatement.com/gta-6-release-date-when-is-it-coming-out/" },
    ],
    sections: [
      {
        title: "The question behind the search",
        text: "A player searching for a mission walkthrough is rarely asking for a general review of the game. They have reached a specific point, something seems unclear, and they want to know what to do next. The editorial job is to recognise that small moment of uncertainty and answer it without burying the response beneath a broad introduction.",
        note: "Search intent is a constraint on structure. Start with the decision the reader needs to make.",
      },
      {
        title: "Speed with accuracy",
        text: "Games news moves with patches, leaks and tournaments. The work was to find the question people were actually asking, research it fast and publish an accurate answer before the subject moved: a hero nerfed in a balance patch and how to counter it, where to farm an item, what a roster change meant, an interview with a rising Dota 2 player.",
        note: "Research fast. Publish before the subject moves. Stay accurate.",
      },
      {
        title: "Structure is part of the answer",
        text: "For time-sensitive guides, clarity depends on the relationship between headings, prerequisites and individual steps. A descriptive heading gives readers a way to find their exact problem. Short sections reduce the cost of switching between the game and the article. Spoiler boundaries matter too: the most complete answer is not always the most helpful one.",
      },
      {
        title: "Distribution",
        text: "Articles were shared on Reddit and Twitter, where the communities were already discussing them. His CV reports that many reached the first page of search results and drew thousands of views each; those figures are reported, not audited.",
      },
      {
        title: "Source and evidence",
        text: "Every byline on the front page above was checked on digistatement.com on 28 October 2026 and links to the live article. The text on this page is portfolio commentary, not a reproduction of the articles.",
      },
    ],
  },
  {
    id: "008",
    slug: "pepper-content",
    title: "Pepper Content",
    frequency: "Words",
    status: "reported",
    subtitle: "Healthcare, SaaS, EdTech and airlines: one editorial standard.",
    tags: ["Editorial", "White papers", "PR"],
    year: "2020–21",
    reading: 2,
    summary:
      "Freelance writer and editor through Pepper Content from June 2020 to October 2021: articles, white papers, educational content and press releases for clients in healthcare, SaaS, EdTech and aviation.",
    role: "Freelance writer and editor",
    context: "Pepper Content · Remote · Jun 2020 – Oct 2021",
    sections: [
      {
        title: "The capability",
        text: "Agency writing is adaptation: understand a brief quickly, enter the client’s language, research the subject, respect the constraints, and deliver clean work without the client having to teach you how to write.",
        note: "A new brief every week. One standard.",
      },
      {
        title: "The range",
        text: "Jahan wrote articles, white papers, educational content and press releases for clients in healthcare, SaaS, EdTech and airlines, taking each project from concept to completion against the client’s brief, brand guidelines and SEO requirements. He also edited and proofread other writers’ work.",
      },
      {
        title: "What is shown",
        text: "Agency work is usually ghostwritten and under confidentiality terms, so no samples are reproduced here. Cleared samples will be added with the client named and the permission noted.",
      },
    ],
  },
  {
    id: "009",
    slug: "life-itself",
    title: "Life Itself",
    frequency: "Research",
    status: "analysis",
    subtitle: "How do groups learn to act better over time?",
    tags: ["Collective intelligence", "Research", "Field reading"],
    year: "Reading",
    reading: 3,
    summary:
      "A field reading of Life Itself’s public white paper on collective intelligence: the ability of groups to take intelligent collective action, and how they might get better at it.",
    links: [
      { label: "Collective Intelligence white paper", url: "https://lifeitself.org/research/publications/collective-intelligence" },
      { label: "Life Itself research", url: "https://lifeitself.org/research" },
    ],
    sections: [
      {
        title: "The public artifact",
        text: "Life Itself’s white paper introduces collective intelligence as the ability of groups to take intelligent collective action, and explores how groups might improve their capacity to learn and act over time, drawing on social science and information technology.",
        note: "The useful question is not what collective intelligence is, but what makes groups learn to act better over time.",
      },
      {
        title: "Making an unfamiliar field legible",
        text: "This reading maps the argument as layers: individual minds, the social process between them, the information technology that carries it, and the collective action that results. Each layer depends on the one beneath it, and the interesting failures happen at the joins.",
      },
      {
        title: "Source and role",
        text: "Life Itself appears in Jahan’s research background. The paper belongs to its named authors; this channel is a field reading of it and claims no authorship. His specific contribution is being confirmed.",
      },
    ],
  },
  {
    id: "010",
    slug: "perspectiva",
    title: "Perspectiva",
    frequency: "Research",
    status: "reported",
    subtitle: "Serious ideas need architecture, not flattening.",
    tags: ["Editorial research", "Synthesis", "Sensemaking"],
    year: "Research",
    reading: 2,
    summary:
      "Editorial research and synthesis around Perspectiva’s intellectual ecosystem: systems, souls and society, from education and technology to ecology, politics and the metacrisis.",
    role: "Editorial research, synthesis and publication support",
    context: "Perspectiva · systems, souls and society",
    links: [{ label: "Perspectiva essays", url: "https://systems-souls-society.com/insight/essays/" }],
    sections: [
      {
        title: "The ecosystem",
        text: "Perspectiva works across systems, inner life and society: education, technology, ecology, politics, philosophy and what it calls the metacrisis. The writing is long, careful and dense on purpose.",
      },
      {
        title: "The work layer",
        text: "Jahan’s records describe editorial research, synthesis, writing and publication support: keeping complex arguments intact while making them enterable for a reader who has not read everything else yet.",
        note: "Do not flatten serious ideas. Give them architecture.",
      },
      {
        title: "Source and limits",
        text: "Role reported from Jahan’s own records. Public essays carry their authors’ bylines; none is claimed here.",
      },
    ],
  },
  {
    id: "011",
    slug: "redorange-ai",
    title: "RedOrange.AI",
    frequency: "Product",
    status: "reported",
    subtitle: "Seminar scripts, technical decks and a newsletter for an AI company.",
    tags: ["AI", "Scripts", "Newsletter"],
    year: "2025",
    reading: 2,
    summary:
      "Freelance work for RedOrange.AI in 2025: Jahan ran its seminar scripts, the technical documents behind its presentations, and its newsletter.",
    role: "Seminar scripts, presentation documents and newsletter",
    context: "RedOrange.AI · Freelance · 2025",
    sections: [
      {
        title: "Three formats, three readers",
        text: "In 2025 Jahan ran three strands of communication for RedOrange.AI: the scripts for its seminars, the technical documents behind its presentations, and its newsletter. Each had a different reader: a live audience, a technical evaluator, and a subscriber deciding whether to keep reading.",
        note: "Same subject, three readers. Write for the one in front of you.",
      },
      {
        title: "The same 2025 desk",
        text: "Alongside it he built content funnels for TealBox’s clients, set up LinkedIn newsletters and automations, and wrote blogs, PR material and website copy for other freelance briefs.",
      },
      {
        title: "Source and limits",
        text: "Role reported from Jahan’s CV. Scripts and documents appear here once RedOrange.AI clears them.",
      },
    ],
  },
  {
    id: "012",
    slug: "perfect-pixel",
    title: "Perfect Pixel",
    frequency: "Studio",
    status: "vault",
    subtitle: "Where the words and the interface meet.",
    tags: ["Web", "UX writing"],
    year: "Archive",
    reading: 0,
    summary: "Perfect Pixel is a design studio working on UX and UI, visual identity and digital marketing. Jahan’s role is being confirmed before the work is shown.",
    links: [{ label: "perfectpixel.co.in", url: "https://www.perfectpixel.co.in/" }],
  },
  {
    id: "013",
    slug: "premaculture",
    title: "Prem-a-Culture",
    frequency: "Studio",
    status: "cleared",
    subtitle: "Website copy for conscious-dating retreats.",
    tags: ["Website copy", "Brand voice", "Events"],
    year: "2022",
    reading: 2,
    summary:
      "Website copy for Prem-a-Culture, which runs conscious-dating retreats for singles who want in-person, unhurried connection instead of swipe-text-swipe.",
    role: "Website copy",
    context: "Prem-a-Culture · retreats in Mumbai and Lonavala · 2022",
    copy: {
      title: "The homepage, as written",
      intro: "Excerpts from Jahan’s copy document. Participant testimonials and contact details from the same document are left out: they belong to other people.",
      headlines: ["Join the journey towards forming more intimate and mindful connections", "A space for singles to explore romantic possibilities"],
      blocks: [
        { label: "Experience dating differently", text: "We asked ourselves questions like: why is dating exhausting and tiresome today? Why does it feel meaningless and mundane? What is missing? Dating apps might have made connecting possible and yet difficult. Make a profile, select photos, swipe, text, swipe! The thrill just goes missing." },
        { label: "Now imagine", text: "Going on a date with child-like openness and playfulness. Smiles and laughter amidst conversations that touch your heart. Pauses and reflections that evoke insights. And what follows is a new yet deep friendship, forming almost instantly, with a sense of belonging." },
        { label: "Heart-to-heart conversations", text: "Move beyond chat-based interactions to have in-person, heartfelt conversations in a loving and open environment. Be yourself. No need to perform." },
        { label: "Fun and playful dating life", text: "Many of us feel hesitation, saturation, boredom and even depression in our dating lives. The retreats give you the tools to get your flow and creativity back." },
        { label: "Guilt-free flirting", text: "A perspective change: flirting as a life skill, an attitude that can charge up your life. You leave with a joyful experience grounded in curiosity and authenticity." },
      ],
    },
    sections: [
      {
        title: "The brief",
        text: "Prem-a-Culture runs retreats for singles who are tired of dating apps. The site had to say what was different without sounding like another app: in person, unhurried, playful, and honest about who it is for.",
      },
      {
        title: "Voice",
        text: "The copy opens with the questions a tired dater already asks (why does this feel exhausting, what is missing) and lets the reader imagine the alternative before it names the product.",
        note: "Name the reader’s fatigue before you offer the fix.",
      },
      {
        title: "What is shown",
        text: "Excerpts from Jahan’s copy document, shown with his permission. Testimonials, phone numbers and event pricing in the same document are left out.",
      },
    ],
  },
  {
    id: "014",
    slug: "nowtheo",
    title: "NowTheo",
    frequency: "Studio",
    status: "owned",
    subtitle: "A practice, described in its own words.",
    tags: ["Site & brand", "Content", "Community"],
    year: "Ongoing",
    reading: 2,
    summary:
      "NowTheo is a public practice of slow, gentle, playful somatic-imaginal exploration. Jahan built its site and brand, writes and posts its content, and runs the TPOT community side.",
    media: { video: "/video/nowtheo.mp4", lite: "/video/nowtheo-lite.mp4", source: "Scroll recording of untanglingself.com, captured 28 Oct 2026" },
    owned: {
      kind: "builder",
      roles: ["Site and brand", "Content", "TPOT community"],
      liveUrl: "https://x.com/nowtheo",
      links: [
        { label: "@nowtheo on X", url: "https://x.com/nowtheo" },
        { label: "Untangling Self", url: "https://untanglingself.com/" },
      ],
      disclosure:
        "This portfolio describes the practice in its own public words and shows only what Jahan built and ran. It makes no therapeutic claims, shows no client material and does not speak for the practice.",
      highlights: ["Somatic-imaginal", "Slow", "Gentle", "Playful"],
      quote: {
        text: "i help folks untangle stubborn knots and open into deeper intimacy with self & life through slow, gentle, playful somatic-imaginal explorations",
        attribution: "@nowtheo on X, public profile",
        url: "https://x.com/nowtheo",
      },
    },
    sections: [
      {
        title: "In its own words",
        text: "NowTheo describes itself as helping people untangle stubborn knots and open into deeper intimacy with self and life, through slow, gentle, playful somatic-imaginal explorations. That line is from the practice's public profile on X.",
        note: "Quoted from the public profile. This portfolio does not speak for the practice.",
      },
      {
        title: "What was built",
        text: "Three strands: the website and visual identity, the writing and posts that carry the practice's voice, and the community side around TPOT, where conversations and connections happen in the open.",
      },
      {
        title: "Where it lives",
        text: "The practice is active on X as @nowtheo, and its site is untanglingself.com. Both are linked in the panel beside this text.",
      },
      {
        title: "Source, role and limits",
        text: "Roles: site and brand, content, TPOT community. This portfolio makes no therapeutic claims, shows no client material, and does not describe outcomes.",
      },
    ],
  },
  {
    id: "015",
    slug: "mymunshi",
    title: "MyMunshi",
    frequency: "Play",
    status: "concept",
    subtitle: "A Hindi-first desk companion for small online sellers.",
    tags: ["AI companion", "Product concept", "Hindi-first"],
    year: "Concept",
    reading: 3,
    summary:
      "A self-initiated product concept: a Hindi-first desktop companion for Meesho sellers, part desk pet, part business copilot, part cursor guide. It notices, explains and guides; it never clicks for you.",
    sections: [
      {
        title: "The problem",
        text: "Small sellers on Meesho run a business through dashboards written for someone else: English-first, dense, and quick to punish a wrong click. Help usually arrives as a chat window that promises to do everything.",
        note: "Self-initiated concept. No deployment, no seller data and no outcomes are claimed.",
      },
      {
        title: "The character",
        text: "MyMunshi is named after the munshi, the clerk who kept the accounts. It sits on the desktop as a small character, part desk pet and part copilot, speaks Hindi first, and keeps a tall bahi-khata panel: a ledger of what it noticed and why. The visual motif is marigold paper, a dark copilot panel and Indian ledger details.",
      },
      {
        title: "Why it shouldn’t auto-click",
        text: "The interaction model is notice, explain, guide. The munshi can point the cursor at the right control and say why, but the seller makes every click. A wrong automated action on a live store costs real money; a pointed suggestion costs a second.",
      },
      {
        title: "The guardrails are the product",
        text: "A prototype has to separate quoted material, inferred connections and generated prose, and it should never send or publish anything because a suggested workflow implies it. The clickable sketch below uses fictional data to show the review step.",
      },
    ],
  },
  {
    id: "016",
    slug: "parda",
    title: "PARDA",
    frequency: "Play",
    status: "concept",
    subtitle: "The screen and the veil: a one-performer memory play.",
    tags: ["Theatre", "Memory", "Cinema"],
    year: "Concept",
    reading: 2,
    summary:
      "A self-initiated play: the night before Kohinoor Talkies is demolished, one performer carries seven roles through the cinema’s last night. Memory, thermodynamics and cinema.",
    sections: [
      {
        title: "The premise",
        text: "Parda means both the screen and the veil. The play is set on the night before the demolition of Kohinoor Talkies, a single-screen cinema, and one performer carries seven roles.",
        note: "Self-initiated concept. No production, dates or performances are claimed.",
      },
      {
        title: "The form",
        text: "Its subjects are memory, thermodynamics and cinema. The pages are numbered as reels, not acts: Reel I, Reel II, Reel III. The opening image is an empty projection booth, the projector throwing light onto dust, with a cinema ticket in the foreground. The palette is black, warm silver and faded cinema red.",
      },
      {
        title: "Status",
        text: "A theatre concept with a written premise and structure. A cleared script excerpt will appear on this channel.",
      },
    ],
  },
  {
    id: "017",
    slug: "game-prototype",
    title: "The next frequency",
    frequency: "Play",
    status: "concept",
    subtitle: "A small experiment in finding a signal.",
    tags: ["Interactive", "Game concept", "Experiment"],
    year: "Concept",
    reading: 2,
    summary:
      "A playable frequency-matching experiment created for this portfolio. Tune the dial and find the hidden broadcast.",
    sections: [
      {
        title: "A simple rule",
        text: "Tune the receiver until the two frequencies meet. This small interaction was created as an illustrative portfolio experiment. It demonstrates feedback, a constrained interaction, and a clear completion state; it is not an archived client deliverable.",
      },
      {
        title: "What makes an experiment useful?",
        text: "A prototype is a question made tangible. Here the question is whether a dial, a visual signal, and a little feedback are enough to explain a game without an instruction wall. The experiment is deliberately small enough to understand, play, and leave.",
      },
    ],
  },
  {
    id: "018",
    slug: "fiction-essays",
    title: "Fiction, essays & open mics",
    frequency: "Words",
    status: "cleared",
    subtitle: "Long-form essays on AI, institutions and the stories around them.",
    tags: ["Essays", "AI", "Research"],
    year: "2024–26",
    reading: 4,
    summary:
      "Independent essays: a sourced study of where value collects in India’s AI industry, its companion research corpus, and a satirical explainer on AI data governance.",
    pieces: [
      { kicker: "Undercurrent Research Desk · Sep 2026", title: "The Indian AI Stack Is Not a Model Race", text: "“Indian AI businesses become more defensible when they control an expensive, recurring bottleneck that a customer cannot cheaply bypass.” Sourced to public primary documents, evidence cutoff 12 September 2026." },
      { kicker: "Companion corpus", title: "Undercurrent: India AI Dossier", text: "The research corpus behind the essay: companies and operating brands separated from public institutions, with the evidence gaps identified rather than filled in." },
      { kicker: "Satire · explainer", title: "The Rise of AI Data Governance: When Algorithms Need Adult Supervision", text: "“In a world where algorithms have the reliability of a small child asked to get the coffee off the highest shelf, someone needs to be the responsible adult in the room.”" },
      { kicker: "Inside the satire", title: "The Editor’s Intervention Log", text: "A section of the governance piece written as an editor’s log of an AI drafting an essay about AI governance: day one, corporate buzzwords; day three, gardening metaphors; day four, a sentient book club." },
    ],
    sections: [
      {
        title: "Why essays",
        text: "The essays are where the research habit gets room. Each starts with a problem rather than a trend list, separates what has been announced from what has been delivered, and says what would prove it wrong.",
      },
      {
        title: "The Indian AI stack",
        text: "The longest piece argues that India’s AI opportunity should be studied as a system of dependencies (compute, deployment, data, evaluation and distribution) rather than a national leaderboard of model scores. Every infrastructure claim gets a status: announced, financed, ordered, delivered, accepted, available, contracted or generating revenue.",
        note: "Every claim gets a status and a date.",
      },
      {
        title: "And with a sense of humour",
        text: "The data-governance piece goes the other way: a satirical explainer with dystopian what-ifs and an editor’s log of an AI failing to write about AI governance.",
      },
      {
        title: "Status",
        text: "Independent pieces from Jahan’s own archive, shown with his permission. Where a piece is published, the link goes to the published version. Spoken-word recordings will appear here when cleared.",
      },
    ],
  },
  {
    id: "019",
    slug: "kink-studios",
    title: "Kink Studios",
    frequency: "Studio",
    status: "cleared",
    subtitle: "We mark leather. Permanently.",
    tags: ["Brand identity", "Voice", "AI prototype"],
    year: "2025",
    reading: 2,
    summary:
      "A brand identity system for Kink Studios, a leather-marking studio: philosophy, voice and visual identity, published as interactive brand guidelines with a voice generator built on Gemini.",
    role: "Brand identity, voice and interactive guidelines",
    context: "Kink Studios · built in Google AI Studio · Dec 2025",
    sections: [
      {
        title: "The brief",
        text: "Kink Studios marks leather, and its brief describes the work as ritualistic. The identity had to carry the weight of a mark that cannot be undone.",
        note: "A permanent mark needs a voice that sounds permanent.",
      },
      {
        title: "The system",
        text: "The identity system opens with a brand philosophy and one line, “We mark leather. Permanently.”, then sets out the voice and the visual identity the studio uses.",
      },
      {
        title: "Guidelines you can use",
        text: "The guidelines are an interactive app built in Google AI Studio, including a voice generator powered by Gemini that writes in the studio’s ritual tone.",
      },
      {
        title: "What is shown",
        text: "Described from Jahan’s project files, with his permission. Screens from the guidelines app will appear on this channel.",
      },
    ],
  },
  {
    id: "020",
    slug: "animation",
    title: "Animation & characters",
    frequency: "Play",
    status: "cleared",
    subtitle: "Scripts, character design and AI-assisted illustration.",
    tags: ["Animation", "Character design", "AI-assisted"],
    year: "2021–26",
    reading: 4,
    summary:
      "The Weight of the Ticket, an animated anthology set on a Mumbai local; Troyfall, a comic in which the Greek gods are AIs; character reference sheets made with AI image tools; and Procreate animation tests.",
    role: "Writer, character designer and animator",
    context: "Self-initiated · 2021–2026",
    script: {
      title: "The Weight of the Ticket",
      intro: "Excerpts from the anthology’s scripts, with the animation notes that travel with each scene.",
      scenes: [
        {
          heading: "Analysis Paralysis",
          setting: "Maya scrolls through her fifteenth food-delivery app of the day.",
          lines: [
            { who: "Maya", dir: "to the menu-ticket", text: "Funny thing about old menus. They just had food. Not ‘curated suggestions based on your mood-weather-biorhythm matrix.’" },
            { who: "Maya", text: "This Irani café had what, ten items? Butter chakli, bun maska, chai. Done." },
            { who: "Maya", dir: "laughs", text: "Sometimes I think we didn’t design a food delivery system. We designed the perfect loneliness simulator." },
          ],
          notes: ["Food-delivery interfaces float and multiply around the scene.", "Old café menu items appear as warm, hand-drawn illustrations.", "Star ratings appear and shatter like mirrors."],
        },
        {
          heading: "Spores of Thought",
          setting: "Mumbai local, 3:33 AM. Mushrooms glow faintly in the corners when no one is looking.",
          lines: [
            { who: "Professor Mathur", dir: "in an academic tone", text: "The fungal network in his brain… so elegant. They don’t replace thoughts, you see. They just guide them." },
            { who: "Aristotle", text: "We must think for ourselves! Like all the other free-thinking parrots on ParrotBook said!" },
            { who: "Mathur & Aristotle", dir: "in perfect unison, unaware", text: "Critical thinking is when you find sources that agree with you." },
          ],
          notes: ["Fungal patterns subtly mirror social-network diagrams.", "Mathur and Aristotle’s movements sync more and more through the scene."],
        },
        {
          heading: "The Punch Card",
          setting: "Deepika picks up the ticket and squints at the punch holes.",
          lines: [
            { who: "Deepika", dir: "amused", text: "These punch-card holes probably stored less data than my coffee loyalty app." },
            { who: "Deepika", text: "My AI assistant talks to their AI assistant to schedule a meeting about AI assistants." },
          ],
          notes: ["Minimal character movement; the environment does the acting.", "The train’s LED light becomes a character, and flickers into a 404 at the end."],
        },
      ],
    },
    pieces: [
      { kicker: "Troyfall · God", title: "Zeus", text: "The most powerful AI, overseer of the AIs and protector of humanity. Keeps his servers tucked away on Earth, thinking it is the last place anyone would look." },
      { kicker: "Troyfall · God", title: "Hephaestus", text: "God of technology and creation, and the only god with a chassis: an old-school robot with a square face, round eyes and visible circular joints. He talks in creaks." },
      { kicker: "Troyfall · God", title: "Aphrodite", text: "Goddess of love, manipulation, lust and passion. Gives free and terrible love advice to troubled couples. Her throne is translucent glass embroidered in gold." },
      { kicker: "Reference sheet · 2026", title: "Calypso", text: "A character reference sheet made with AI image tools in Google AI Studio. The sheet appears here when uploaded." },
      { kicker: "Reference sheet · 2025", title: "Cyclops", text: "A cyclops character design, built as a reference sheet with AI image tools. The sheet appears here when uploaded." },
    ],
    sections: [
      {
        title: "The Weight of the Ticket",
        text: "An animated anthology set on Mumbai’s local trains. In each episode the ticket in a passenger’s hand becomes the trigger for a monologue about modern life: automation that automates itself, recommendation engines tuned to decision fatigue, a mycologist whose parrot believes it thinks for itself.",
        note: "Minimal character movement. Let the environment do the acting.",
      },
      {
        title: "Notes that animate",
        text: "Every scene carries its animation notes: tech references pop up in a retro style, the train’s LED light reacts to the monologue, recommendation algorithms grow like tangling vines, star ratings shatter like mirrors. The illustrations were developed with AI image tools in Google AI Studio.",
      },
      {
        title: "Troyfall",
        text: "Begun in 2021, Troyfall retells the Trojan War in space, with the Greek gods as AIs and their followers as scions. The character briefs for Issue #1 were written for an illustrator: who each god is, what they want, and what they should look like.",
      },
      {
        title: "Sheets and motion tests",
        text: "Recent character reference sheets were made with AI image tools; short Procreate animation tests date from 2024. Clips and sheets appear on this channel as they are uploaded.",
      },
    ],
  },
  {
    id: "021",
    slug: "gyaragyara",
    title: "Gyara Gyara",
    frequency: "Studio",
    status: "cleared",
    subtitle: "Quiet objects for modern homes.",
    tags: ["Website UX", "Brand research", "E-commerce"],
    year: "2025",
    reading: 3,
    summary:
      "Brand research and website UX for Gyara Gyara, which makes handcrafted vases and planters from reclaimed wood: a competitor study across three market tiers, an audit of the live site, and an ‘11:11’ landing-page concept.",
    role: "Research, website UX and a landing-page concept",
    context: "Gyara Gyara · India · Dec 2025",
    media: { video: "/video/gyaragyara.mp4", lite: "/video/gyaragyara-lite.mp4", source: "Scroll recording of gyaragyara.com, captured 28 Oct 2026" },
    links: [{ label: "gyaragyara.com", url: "https://www.gyaragyara.com/" }],
    sections: [
      {
        title: "The brand",
        text: "Gyara Gyara makes vases, planters and home objects from reclaimed wood, in Japandi and Elementary collections. Its line: quiet objects for modern homes.",
      },
      {
        title: "Research first",
        text: "Jahan’s competitor analysis placed the brand across three tiers: Indian artisan brands, regional South Asian makers and global luxury minimalists. It found the brand’s strength in authentic artisanal storytelling, sustainability and a Japandi-meets-nature design language that mass-market premium brands lack.",
        note: "“Artisanal craftsmanship, minimalist design and nature-inspired aesthetics.”",
      },
      {
        title: "The live site",
        text: "With the research done, he audited gyaragyara.com for UI and UX problems and prototyped the fixes. A separate concept, ‘11:11’, is described in the project file as a high-end, quiet-luxury streetwear landing page built around synchronicity and alignment, with a minimalist, brutalist layout.",
      },
      {
        title: "Source",
        text: "From Jahan’s project files, with his permission. The live site is the brand’s own; screens of the concept will appear on this channel.",
      },
    ],
  },
];
export const statusLabel = (status: Transmission["status"]) =>
  ({
    published: "Published · publicly verified",
    reported: "Role · results reported",
    cleared: "Own work · shown with permission",
    owned: "Owned, run or built by Jahan",
    analysis: "Field analysis",
    concept: "Self-initiated concept",
    vault: "Archive, evidence being restored",
  })[status];
/** The label shown on chips: owned channels say what the role actually was. */
export const provenanceLabel = (t: Transmission) =>
  t.status === "owned"
    ? t.owned?.kind === "operator"
      ? "Owned & operated"
      : t.owned?.kind === "marketer"
        ? "Family business · marketing"
        : "Site, brand & community"
    : statusLabel(t.status);
/** Solid for checkable or owned work, half for reported and readings, dashed for the archive. */
export const evidenceKind = (t: Pick<Transmission, "status">): "vf" | "dr" | "ph" =>
  t.status === "published" || t.status === "owned" || t.status === "cleared" ? "vf" : t.status === "vault" ? "ph" : "dr";
/** The first public link for a channel, if there is one. */
export const publicLink = (t: Transmission): Link | undefined =>
  t.owned ? { label: t.owned.links[0].label, url: t.owned.liveUrl } : t.links?.[0] ?? (t.source ? { label: "Original publication", url: t.source } : undefined);
export const liveTransmissions = transmissions.filter((t) => t.status !== "vault");
export const contactEmail = "jahandms60@gmail.com";
