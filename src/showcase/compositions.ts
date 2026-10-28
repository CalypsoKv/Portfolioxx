/**
 * How each channel is shown. Blocks are page skeletons built from the block library; real content goes in the
 * channel data (src/data/transmissions.ts) and the owner's files. Anything described under a "placeholder" rail step
 * says what will be shown there, never a result.
 */
export type Slot = "16:9" | "4:5" | "1:1";
export type Step = { title: string; text: string; slot?: Slot };
export type RailVariant = "pipeline" | "timeline" | "strata" | "stepper" | "lenses" | "branches" | "reels" | "voices" | "levels" | "shelf";
export type FlowStep = { label: string; note?: string };
export type Block =
  | { kind: "reader" }
  | { kind: "rail"; variant: RailVariant; title: string; intro: string; steps: Step[]; real?: boolean }
  | { kind: "network"; title: string; intro: string; nodes: { id: string; label: string; note: string }[]; edges: [string, string, string][]; center?: { label: string; note: string }; real?: string }
  | { kind: "works" }
  | { kind: "process" }
  | { kind: "ledger"; title: string; intro: string }
  | { kind: "strands" }
  | { kind: "links" }
  | { kind: "prototype"; which: "dial" | "copilot" | "workbench" }
  | { kind: "artifacts"; title: string; intro: string; slots: { slot: Slot; label: string }[] }
  /** Big numbers that count up, each with where it comes from. */
  | { kind: "metrics"; title: string; intro: string }
  /** Public bylines set as a broadsheet front page. */
  | { kind: "newspaper" }
  /** The channel's pieces as a draggable row with momentum. */
  | { kind: "slider"; title: string; intro: string }
  /** Website copy as written, with its headline options typed in and out. */
  | { kind: "copy" }
  /** A chain of steps that draws itself as you scroll. */
  | { kind: "flow"; title: string; intro: string; steps: FlowStep[]; timeline?: boolean }
  /** A script page: scenes, lines and the animation notes beside them. */
  | { kind: "script" }
  /** One line, set very large, burned in. */
  | { kind: "statement"; text: string; sub: string };

const net = (labels: [string, string][]) => labels.map(([label, note], i) => ({ id: `n${i}`, label, note }));

export const compositions: Record<string, Block[]> = {
  "camden-imagines": [
    { kind: "reader" },
    {
      kind: "network",
      title: "A place imagined through many voices",
      intro: "A relationship map of how lived experience might reach a decision. The nodes are structure, not findings; each waits on a source.",
      nodes: net([["The public question", "Who asks, and in whose words."], ["Who frames it", "The people and bodies that set the terms."], ["Evidence", "What was said, anonymised."], ["Gaps", "What is missing as well as what repeats."], ["Systems", "How ideas travel into a decision."], ["Decision", "Where a shared direction is made."]]),
      edges: [["n0", "n1", "is shaped by"], ["n1", "n2", "draws on"], ["n2", "n3", "leaves"], ["n2", "n4", "feeds"], ["n4", "n5", "ends in"], ["n3", "n4", "should reach"]],
    },
    { kind: "artifacts", title: "Sources and excerpts", intro: "Report pages and permitted quotes go here with their sources.", slots: [{ slot: "16:9", label: "Report page" }, { slot: "16:9", label: "Source excerpt" }] },
    { kind: "ledger", title: "What is known and unknown", intro: "Role and source facts in one table." },
  ],
  origins: [
    { kind: "reader" },
    {
      kind: "flow", timeline: true, title: "Ten years, one habit", intro: "From a physics lab to a brand studio. Every stop is on the CV; the habit is the same at each one.",
      steps: [
        { label: "2016", note: "BSc Physics (Hons.), St. Xavier’s College, Mumbai" },
        { label: "2017", note: "Answers on Quora, a first public writing habit" },
        { label: "2019", note: "Content writer, MapaGuru, Delhi" },
        { label: "2019", note: "TealBox Digital: Orma Health, Performance Medstop, Dekorio" },
        { label: "2020", note: "DigiStatement: 200+ games and tech articles" },
        { label: "2020", note: "Pepper Content: healthcare, SaaS, EdTech, airlines" },
        { label: "2021", note: "Content Marketer, CustomerSuccessBox" },
        { label: "2022", note: "Senior Marketing Manager, Reptrics" },
        { label: "2023", note: "Documentation In-charge, Civilization Research Institute" },
        { label: "2025", note: "RedOrange.AI, brand systems and AI-assisted animation" },
      ],
    },
  ],
  badhuche: [{ kind: "reader" }, { kind: "works" }, { kind: "process" }, { kind: "ledger", title: "Studio-reported figures", intro: "The studio's own statements, labelled as such." }, { kind: "links" }],
  reptrics: [
    { kind: "reader" },
    { kind: "metrics", title: "Reported outcomes", intro: "Four numbers from the role, as Jahan’s CV reports them." },
    {
      kind: "flow", title: "The content machine", intro: "One programme, eight stages. Each piece of content knows which stage it serves and what the next step is.",
      steps: [{ label: "Category education" }, { label: "Problem diagnosis" }, { label: "Product explanation" }, { label: "Proof" }, { label: "Conversion" }, { label: "Sales enablement" }, { label: "Distribution" }, { label: "Measurement" }],
    },
    { kind: "slider", title: "From the content programme", intro: "Articles on the Reptrics blog from this period. Drag the row, or use the arrow keys." },
    { kind: "links" },
  ],
  customersuccessbox: [
    { kind: "reader" },
    { kind: "metrics", title: "Reported outcomes", intro: "As Jahan’s CV reports them for the period." },
    {
      kind: "flow", title: "The learning curve", intro: "Content set out like a curriculum: each piece moves a reader one step closer to product intent.",
      steps: [{ label: "Search question" }, { label: "Diagnosis" }, { label: "Framework" }, { label: "Content" }, { label: "Lead magnet" }, { label: "Product intent" }],
    },
  ],
  "urmila-ben-nu-rasodu": [
    { kind: "reader" },
    { kind: "metrics", title: "From zero", intro: "The one number Jahan reports for the kitchen’s marketing." },
    { kind: "artifacts", title: "Menu cards and the kitchen", intro: "Photographs and menu cards arrive from the owner and are logged with their sources.", slots: [{ slot: "4:5", label: "Menu card" }, { slot: "4:5", label: "Dish" }, { slot: "4:5", label: "Takeaway menu" }] },
    { kind: "links" },
  ],
  "orma-health": [{ kind: "reader" }, { kind: "copy" }],
  digistatement: [
    { kind: "newspaper" },
    { kind: "metrics", title: "By the numbers", intro: "One number reported, one checked." },
    { kind: "reader" },
    { kind: "links" },
  ],
  "pepper-content": [
    { kind: "reader" },
    { kind: "artifacts", title: "Cleared samples", intro: "Each sample arrives with the client named and the permission noted.", slots: [{ slot: "4:5", label: "SaaS brief" }, { slot: "4:5", label: "Healthcare brief" }, { slot: "4:5", label: "EdTech brief" }] },
  ],
  "life-itself": [
    { kind: "reader" },
    {
      kind: "network", real: "Field reading of the public paper", title: "Four layers of a group mind", intro: "How the paper’s argument stacks up, as this reading maps it. Choose a layer to see what it depends on.",
      nodes: net([["Individual minds", "What each person knows, notices and wants."], ["Social process", "How people talk, decide and disagree."], ["Information technology", "The tools that carry the process further than a room."], ["Collective action", "What the group actually does."], ["Learning", "What changes the next time round."]]),
      edges: [["n0", "n1", "meet in"], ["n1", "n2", "is carried by"], ["n2", "n3", "enables"], ["n3", "n4", "feeds"], ["n4", "n0", "changes"]],
    },
    { kind: "links" },
  ],
  perspectiva: [
    { kind: "reader" },
    {
      kind: "network", real: "From Jahan’s own map of the work", title: "A constellation, one centre", intro: "The subjects the ecosystem holds together, all turning on one practice.",
      center: { label: "Sensemaking", note: "The practice the other subjects turn on: making a complex situation legible enough to act in." },
      nodes: net([["Systems", "How parts depend on each other."], ["Souls", "Inner life and meaning."], ["Society", "Institutions and culture."], ["Technology", "What tools make possible, and costly."], ["Education", "How people learn to think together."], ["Politics", "How power decides."], ["Ecology", "The living systems underneath."], ["Meaning", "Why any of it matters."]]),
      edges: [],
    },
    { kind: "links" },
  ],
  "redorange-ai": [
    { kind: "reader" },
    { kind: "flow", title: "One subject, three readers", intro: "The same material, written three ways.", steps: [{ label: "Seminar script", note: "For a live audience" }, { label: "Presentation document", note: "For a technical evaluator" }, { label: "Newsletter", note: "For a subscriber deciding whether to keep reading" }] },
  ],
  "perfect-pixel": [{ kind: "prototype", which: "workbench" }, { kind: "artifacts", title: "Real screens and copy", intro: "Wireframes and final copy are shown as they shipped, with the rationale.", slots: [{ slot: "16:9", label: "Wireframe" }, { slot: "16:9", label: "Final screen" }] }],
  premaculture: [{ kind: "reader" }, { kind: "copy" }],
  nowtheo: [{ kind: "reader" }, { kind: "strands" }, { kind: "links" }],
  mymunshi: [{ kind: "reader" }, { kind: "prototype", which: "copilot" }],
  parda: [
    { kind: "statement", text: "Parda", sub: "The screen. The veil. One performer, seven roles, a cinema’s last night." },
    { kind: "reader" },
    { kind: "artifacts", title: "Reel I", intro: "A cleared script excerpt appears here.", slots: [{ slot: "16:9", label: "Script excerpt" }] },
  ],
  "game-prototype": [{ kind: "reader" }, { kind: "prototype", which: "dial" }],
  "fiction-essays": [{ kind: "slider", title: "The essays", intro: "Drag the row, or use the arrow keys. Quotes are from the pieces themselves." }, { kind: "reader" }],
  "kink-studios": [
    { kind: "statement", text: "We mark leather. Permanently.", sub: "The line the identity system opens with." },
    { kind: "reader" },
    { kind: "artifacts", title: "The guidelines app", intro: "Screens from the interactive guidelines appear here.", slots: [{ slot: "16:9", label: "Brand philosophy" }, { slot: "16:9", label: "Voice generator" }] },
  ],
  animation: [
    { kind: "reader" },
    { kind: "script" },
    { kind: "slider", title: "Characters", intro: "Troyfall’s gods as briefed for an illustrator, and the reference sheets. Drag the row, or use the arrow keys." },
    { kind: "artifacts", title: "Motion tests", intro: "Procreate animation tests and character sheets play here as they are uploaded.", slots: [{ slot: "1:1", label: "Motion test 01" }, { slot: "1:1", label: "Motion test 02" }, { slot: "1:1", label: "Motion test 03" }, { slot: "1:1", label: "Motion test 04" }] },
  ],
  gyaragyara: [
    { kind: "reader" },
    { kind: "flow", title: "Research first, then the site", intro: "The order the work went in.", steps: [{ label: "Competitor map", note: "Three market tiers" }, { label: "Positioning", note: "Artisanal storytelling, Japandi-meets-nature" }, { label: "Site audit", note: "UI and UX problems on gyaragyara.com" }, { label: "Fixes", note: "Prototyped" }, { label: "11:11", note: "A quiet-luxury landing concept" }] },
    { kind: "links" },
  ],
};
