export type Frequency = "Words" | "Product" | "Research" | "Studio" | "Play";
export type Status = "published" | "analysis" | "concept" | "owned" | "vault";
export type Link = { label: string; url: string };
/** Real, publicly checkable facts for work the owner runs or built. Required for every "owned" channel. */
export type Owned = {
  kind: "operator" | "builder";
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
    description:
      "Useful answers. Distinctive voices. Writing that earns the reader’s attention.",
    color: "#e4aa54",
    deliverables: [
      "Search-intent articles & guides",
      "Editorial strategy & ghostwriting",
      "Long-form stories & thought leadership",
    ],
  },
  {
    name: "Product",
    number: "02",
    label: "Product & narrative",
    description:
      "Make the value clear, from the first impression to the next action.",
    color: "#a5c2ca",
    deliverables: [
      "B2B SaaS messaging",
      "Onboarding & lifecycle copy",
      "Product positioning & UX writing",
    ],
  },
  {
    name: "Research",
    number: "03",
    label: "Research & systems",
    description:
      "Find the patterns in complex ideas. Make the thinking useful.",
    color: "#b6c4a0",
    deliverables: [
      "Research synthesis",
      "Civic & organisational systems",
      "Frameworks, reports & explainers",
    ],
  },
  {
    name: "Studio",
    number: "04",
    label: "Brand & web systems",
    description: "A voice, an interface, a world. Designed to work together.",
    color: "#d3a48c",
    deliverables: [
      "Brand voice & narrative",
      "Website structure & copy",
      "Creative direction & digital experiences",
    ],
  },
  {
    name: "Play",
    number: "05",
    label: "Play & possibilities",
    description:
      "A space for the strange, the unfinished, and the not-yet possible.",
    color: "#c1add0",
    deliverables: [
      "Interactive storytelling",
      "Human-led AI prototypes",
      "Theatre & game experiments",
    ],
  },
];
export const transmissions: Transmission[] = [
  {
    id: "007",
    slug: "digistatement",
    title: "DigiStatement",
    frequency: "Words",
    status: "published",
    subtitle: "The right answer, at exactly the right moment.",
    tags: ["Editorial", "Search intent", "Gaming"],
    year: "2020",
    reading: 4,
    summary:
      "A closer look at a published Cyberpunk 2077 mission guide: turning a player’s uncertainty into a clear next step.",
    source: "https://digistatement.com/?s=Cyberpunk+2077+Tapeworm",
    sections: [
      {
        title: "The question behind the search",
        text: "A player searching for a mission walkthrough is rarely asking for a general review of the game. They have reached a specific point, something seems unclear, and they want to know what to do next. The editorial challenge is to recognise that small moment of uncertainty and answer it without burying the response beneath a broad introduction.",
        note: "Search intent is a constraint on structure. Start with the decision the reader needs to make.",
      },
      {
        title: "A guide to a conversation",
        text: "The Tapeworm mission in Cyberpunk 2077 unfolds through conversations with Johnny Silverhand, rather than through a single conventional quest sequence. A useful guide needs to distinguish the conditions that trigger those conversations from the actions the player can take once they begin. That distinction is the organising idea of this portfolio commentary.",
        note: "Separate trigger conditions from the walkthrough. The reader may need one without the other.",
      },
      {
        title: "Structure is part of the answer",
        text: "For time-sensitive guides, clarity depends on the relationship between headings, prerequisites, and individual steps. A descriptive heading gives readers a way to locate their current problem. Short sections reduce the cost of returning to the game and back to the article. Spoiler boundaries also matter: the most complete answer is not always the most helpful one.",
        note: "Headings act as a navigation layer for readers who are scanning with one specific question.",
      },
      {
        title: "Follow the signal",
        text: "The supplied portfolio brief identifies Jahan Patel’s byline on the December 17, 2020 DigiStatement article. This page is an original editorial analysis of that reference, not a reproduction of the published article. The original article remains the source of record. No traffic, ranking, or conversion results have been supplied or claimed.",
      },
    ],
  },
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
        text: "The supplied PRD reports that no Jahan Patel credit was found in the inspected Camden Imagines report. His specific contribution is unconfirmed. This reference is therefore labelled Field analysis, and is excluded from claims of authored client work. Original report excerpts and contribution evidence are still required before this can become a credited project.",
      },
    ],
  },
  {
    id: "015",
    slug: "mymunshi",
    title: "MyMunshi",
    frequency: "Play",
    status: "concept",
    subtitle: "A quieter interface for the work behind the work.",
    tags: ["AI systems", "Product concept", "Human oversight"],
    year: "Concept",
    reading: 3,
    summary:
      "An illustrative concept brief for a human-supervised AI work companion. An exploration, not a shipped client product.",
    sections: [
      {
        title: "A question worth prototyping",
        text: "Can an AI work companion reduce the effort of organising information without hiding the decisions that matter? This illustrative concept explores a restrained alternative to a chat window that promises to do everything. The original portfolio inventory names MyMunshi as a concept; the interaction proposal below is new design exploration, not a claim about an existing implementation.",
        note: "Self-initiated concept. No deployment or customer outcomes are claimed.",
      },
      {
        title: "A human stays in the loop",
        text: "The proposed workflow starts with a bounded source set. The system groups related material, makes uncertainty visible, and offers a draft structure. A person reviews the source links, changes the priorities, and explicitly approves the next action. The interface should make it easier to disagree with a suggestion than to accept an unsupported statement.",
      },
      {
        title: "The guardrails are the product",
        text: "A prototype would need to distinguish quoted material, inferred connections, and generated prose. It should never send a message or publish a document merely because a suggested workflow implies it. A useful next step would be a small test with a real research task, checking whether users can trace every conclusion back to a source.",
      },
    ],
  },
  {
    id: "016",
    slug: "parda",
    title: "PARDA",
    frequency: "Play",
    status: "concept",
    subtitle: "Some stories need a stage, not a screen.",
    tags: ["Theatre", "Narrative", "Concept"],
    year: "Concept",
    reading: 2,
    summary:
      "A channel reserved for theatrical work: voice, presence, and the tension between what is said and what remains behind the curtain.",
    sections: [
      {
        title: "Behind the curtain",
        text: "PARDA appears in the portfolio inventory as a theatre and narrative concept. This page provides a channel description rather than a fabricated script. It marks a space for work that depends on dialogue, timing, and the relationship between a performer and an audience.",
      },
      {
        title: "An open rehearsal",
        text: "The same questions that shape a clear article can become more ambiguous on a stage. Who is speaking? What do they want? What does the audience know that the character does not? This channel will hold a permission-cleared script or excerpt when one is available. No production credits, dates, or performances are claimed.",
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
    id: "001",
    slug: "origins",
    title: "Origins",
    frequency: "Studio",
    status: "vault",
    subtitle: "Early signals and the beginnings of a practice.",
    tags: ["Archive"],
    year: "Archive",
    reading: 0,
    summary: "Archive pending.",
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
        { metric: "Monumental projects completed", value: "280+", source: "badhuche.co.in", date: "28 Oct 2026" },
        { metric: "Countries", value: "23+", source: "badhuche.co.in", date: "28 Oct 2026" },
        { metric: "Largest installation", value: "2,462 ft", source: "badhuche.co.in", date: "28 Oct 2026" },
        { metric: "Heaviest bronze sculpture", value: "84 tons", source: "badhuche.co.in", date: "28 Oct 2026" },
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
        text: "Role: owner and operator. The figures shown here (280+ projects, 23+ countries, 2,462 ft, 84 tons) are the studio's own statements, captured on 28 October 2026 and labelled studio-reported. They are not independently audited and are not presented as outcomes of this portfolio.",
      },
    ],
  },
  {
    id: "003",
    slug: "reptrics",
    title: "Reptrics",
    frequency: "Product",
    status: "vault",
    subtitle: "B2B SaaS product storytelling.",
    tags: ["SaaS", "Product copy"],
    year: "Archive",
    reading: 0,
    summary: "Writing samples and role confirmation in preparation.",
  },
  {
    id: "004",
    slug: "customersuccessbox",
    title: "CustomerSuccessBox",
    frequency: "Product",
    status: "vault",
    subtitle: "Customer success, explained with clarity.",
    tags: ["SaaS", "Lifecycle"],
    year: "Archive",
    reading: 0,
    summary: "Permission-cleared excerpts in preparation.",
  },
  {
    id: "005",
    slug: "urmila-ben-nu-rasodu",
    title: "Urmila Ben Nu Rasodu",
    frequency: "Studio",
    status: "owned",
    subtitle: "A neighbourhood kitchen in Indore.",
    tags: ["Food", "Brand", "Local business"],
    year: "Ongoing",
    reading: 2,
    summary:
      "Urmila Ben Nu Rasodu serves North Indian and street food in Vijay Nagar, Indore. Jahan owns and runs it.",
    owned: {
      kind: "operator",
      roles: ["Owner and operator"],
      liveUrl: "https://www.instagram.com/urmila_ben_nu_rasoda/",
      links: [
        { label: "Instagram", url: "https://www.instagram.com/urmila_ben_nu_rasoda/" },
        { label: "Zomato listing", url: "https://www.zomato.com/indore/urmila-ben-nu-rasodu-vijay-nagar" },
        { label: "District listing", url: "https://www.district.in/dining/indore/urmila-ben-nu-rasodu-vijay-nagar" },
      ],
      disclosure:
        "Described from the kitchen's public listings. Third-party ratings change, so they are linked rather than embedded here. Photographs and menu cards appear once the owner supplies them.",
      highlights: ["North Indian", "Street food", "Dine-in", "Takeaway", "Swiggy & Zomato"],
    },
    sections: [
      {
        title: "The kitchen",
        text: "Urmila Ben Nu Rasodu is a neighbourhood kitchen in Vijay Nagar, Indore, serving North Indian and street food. Jahan owns and runs it. This channel is the short version of the story; the kitchen's own pages carry the menu, the photographs and the daily updates.",
        note: "Owned and operated. Menu and photographs come from the owner.",
      },
      {
        title: "What is on the menu",
        text: "Public listings describe North Indian and street food, with dine-in and takeaway. The kitchen's profile mentions dishes such as dal pakwan and dabeli alongside house pickles and snacks.",
      },
      {
        title: "Where to find it",
        text: "The kitchen is in Vijay Nagar, Indore, and takes orders through Swiggy and Zomato. Its Instagram account shows what is cooking now. Links are in the panel beside this text.",
      },
      {
        title: "Source and role",
        text: "Role: owner and operator. No sales figures or review scores are claimed on this page; those live on the listing sites and change daily.",
      },
    ],
  },
  {
    id: "006",
    slug: "orma-health",
    title: "Orma Health",
    frequency: "Product",
    status: "vault",
    subtitle: "Making health information easier to navigate.",
    tags: ["Health", "Product"],
    year: "Archive",
    reading: 0,
    summary: "Source material in preparation.",
  },
  {
    id: "008",
    slug: "pepper-content",
    title: "Pepper Content",
    frequency: "Words",
    status: "vault",
    subtitle: "Different briefs. A consistent editorial standard.",
    tags: ["Editorial", "Agency"],
    year: "Archive",
    reading: 0,
    summary: "Client samples and publication permissions in preparation.",
  },
  {
    id: "009",
    slug: "life-itself",
    title: "Life Itself",
    frequency: "Research",
    status: "vault",
    subtitle: "Ideas, organisations, and the systems between them.",
    tags: ["Systems", "Research"],
    year: "Archive",
    reading: 0,
    summary: "Source material in preparation.",
  },
  {
    id: "010",
    slug: "perspectiva",
    title: "Perspectiva",
    frequency: "Research",
    status: "vault",
    subtitle: "Finding a language for complex ideas.",
    tags: ["Research", "Narrative"],
    year: "Archive",
    reading: 0,
    summary: "Source material in preparation.",
  },
  {
    id: "011",
    slug: "redorange-ai",
    title: "RedOrange.ai",
    frequency: "Product",
    status: "vault",
    subtitle: "AI and product systems.",
    tags: ["AI", "Product"],
    year: "Archive",
    reading: 0,
    summary: "Archive pending.",
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
    summary: "Source material in preparation.",
  },
  {
    id: "013",
    slug: "premaculture",
    title: "Premaculture",
    frequency: "Studio",
    status: "vault",
    subtitle: "A brand system rooted in a point of view.",
    tags: ["Brand", "Web"],
    year: "Archive",
    reading: 0,
    summary: "Source material in preparation.",
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
    id: "018",
    slug: "fiction-essays",
    title: "Fiction, essays & open mics",
    frequency: "Words",
    status: "vault",
    subtitle: "Words beyond the brief.",
    tags: ["Fiction", "Essays"],
    year: "Archive",
    reading: 0,
    summary: "Archive pending.",
  },
];
export const statusLabel = (status: Transmission["status"]) =>
  ({
    published: "Published writing",
    analysis: "Field analysis",
    concept: "Self-initiated concept",
    owned: "Owned or built by Jahan",
    vault: "Archive, evidence being restored",
  })[status];
/** The label shown on chips: owned channels say what the role actually was. */
export const provenanceLabel = (t: Transmission) =>
  t.status === "owned"
    ? t.owned?.kind === "operator"
      ? "Owned & operated"
      : "Site, brand & community"
    : statusLabel(t.status);
export const liveTransmissions = transmissions.filter(
  (t) => t.status !== "vault",
);
export const contactEmail = "jahandms60@gmail.com";
