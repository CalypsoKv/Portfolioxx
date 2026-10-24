export type Frequency = "Words" | "Product" | "Research" | "Studio" | "Play";
export type Transmission = {
  id: string;
  slug: string;
  title: string;
  frequency: Frequency;
  status: "published" | "analysis" | "concept" | "vault";
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
    status: "vault",
    subtitle: "Brand narrative and studio practice.",
    tags: ["Brand", "Narrative"],
    year: "Archive",
    reading: 0,
    summary: "Source material in preparation.",
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
    status: "vault",
    subtitle: "A food and culture archive.",
    tags: ["Brand", "Archive"],
    year: "Archive",
    reading: 0,
    summary: "Archive pending.",
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
    status: "vault",
    subtitle: "Another perspective, in preparation.",
    tags: ["Studio"],
    year: "Archive",
    reading: 0,
    summary: "Source material in preparation.",
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
    vault: "In restoration",
  })[status];
export const liveTransmissions = transmissions.filter(
  (t) => t.status !== "vault",
);
export const contactEmail = "jahandms60@gmail.com";
