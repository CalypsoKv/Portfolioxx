/**
 * How each channel is shown. Blocks are page skeletons built from the block library; real content goes in the
 * channel data (src/data/transmissions.ts) and the owner's files. Anything described under a "placeholder" rail step
 * says what will be shown there, never a result.
 */
export type Slot = "16:9" | "4:5" | "1:1";
export type Step = { title: string; text: string; slot?: Slot };
export type RailVariant = "pipeline" | "timeline" | "strata" | "stepper" | "lenses" | "branches" | "reels" | "voices" | "levels" | "shelf";
export type Block =
  | { kind: "reader" }
  | { kind: "rail"; variant: RailVariant; title: string; intro: string; steps: Step[]; real?: boolean }
  | { kind: "network"; title: string; intro: string; nodes: { id: string; label: string; note: string }[]; edges: [string, string, string][] }
  | { kind: "works" }
  | { kind: "process" }
  | { kind: "ledger"; title: string; intro: string }
  | { kind: "strands" }
  | { kind: "links" }
  | { kind: "prototype"; which: "dial" | "copilot" | "workbench" }
  | { kind: "artifacts"; title: string; intro: string; slots: { slot: Slot; label: string }[] };

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
    {
      kind: "rail", variant: "strata", title: "An excavation, layer by layer", intro: "Each layer holds one dated artifact and a note on what it changed. Layers appear only when the artifact exists.",
      steps: [
        { title: "Earliest verified artifact", text: "The first dated notebook, draft or experiment, with the date shown beside it.", slot: "16:9" },
        { title: "A turning point", text: "The moment one discipline met another, shown through the thing that was made.", slot: "16:9" },
        { title: "Two disciplines that seemed separate", text: "A pair of artifacts side by side that now belong to one practice.", slot: "16:9" },
        { title: "The pattern now", text: "The thread connecting the layers, written once the layers are real.", slot: "16:9" },
      ],
    },
  ],
  badhuche: [{ kind: "reader" }, { kind: "works" }, { kind: "process" }, { kind: "ledger", title: "Studio-reported figures", intro: "The studio's own statements, labelled as such." }, { kind: "links" }],
  reptrics: [
    {
      kind: "rail", variant: "pipeline", title: "From a wall of features to one customer question", intro: "Four stages carry a feature to a benefit. Each opens a real artifact once it is supplied.",
      steps: [
        { title: "Input", text: "The crowded list of product terms and capabilities the team started with.", slot: "16:9" },
        { title: "Interpret", text: "The feature-to-benefit logic and the message hierarchy it produced.", slot: "16:9" },
        { title: "Review", text: "How the messaging was checked against what the product actually does.", slot: "16:9" },
        { title: "Output", text: "A landing-page, email or funnel excerpt that carries the final story.", slot: "16:9" },
      ],
    },
  ],
  customersuccessbox: [
    {
      kind: "rail", variant: "timeline", title: "A customer lifecycle as signals and next actions", intro: "Each stage shows the trigger, the message and the next customer action as three separate beats.",
      steps: [
        { title: "Onboarding", text: "The first message after sign-up and what it asks the customer to do next.", slot: "16:9" },
        { title: "Adoption", text: "A trigger from product use and the message it sends.", slot: "16:9" },
        { title: "Expansion", text: "The moment a customer is ready for more, and how the content meets it.", slot: "16:9" },
        { title: "Renewal", text: "The reminder and the reasons shown to stay.", slot: "16:9" },
      ],
    },
    { kind: "ledger", title: "How effectiveness was measured", intro: "Only measured results appear here." },
  ],
  "urmila-ben-nu-rasodu": [
    { kind: "reader" },
    { kind: "artifacts", title: "Menu cards and the kitchen", intro: "Photographs and menu cards arrive from the owner and are logged with their sources.", slots: [{ slot: "4:5", label: "Menu card" }, { slot: "4:5", label: "Dish" }, { slot: "4:5", label: "Takeaway menu" }] },
    { kind: "links" },
  ],
  "orma-health": [
    {
      kind: "rail", variant: "stepper", title: "A calm pathway, one clear step at a time", intro: "Each step shows the actual copy or document and the question it answers. No clinical claims are made.",
      steps: [
        { title: "Where the person starts", text: "The uncertainty the journey begins with, in the person's own terms.", slot: "16:9" },
        { title: "The next clear step", text: "The information or decision that comes first.", slot: "16:9" },
        { title: "A touchpoint", text: "A brochure, email or screen with the copy as written.", slot: "16:9" },
        { title: "Review and approval", text: "How the material was source-checked before it was used.", slot: "16:9" },
      ],
    },
    { kind: "ledger", title: "What improved and what remains unknown", intro: "Stated plainly, with sources." },
  ],
  digistatement: [
    { kind: "reader" },
    {
      kind: "rail", variant: "levels", title: "A mission map with a spoiler gate", intro: "Three levels, from where you are to what to do next. The deeper level stays closed until you ask for it.",
      steps: [
        { title: "Where you are", text: "The point in the game the reader has reached, in their words.", slot: "16:9" },
        { title: "What triggers the next conversation", text: "The conditions that start it, kept apart from the walkthrough.", slot: "16:9" },
        { title: "What to do next", text: "The step the reader came for, behind the spoiler gate.", slot: "16:9" },
      ],
    },
    { kind: "links" },
  ],
  "pepper-content": [
    {
      kind: "rail", variant: "voices", title: "An anthology of three voices", intro: "A brief card, an opening sample and the editorial decision, side by side for each voice. Ghostwriting and confidentiality terms stay explicit.",
      steps: [
        { title: "A technical guide", text: "Constraints, audience and the structure chosen for depth.", slot: "16:9" },
        { title: "A founder voice", text: "How tone changes when someone's own story is the point.", slot: "16:9" },
        { title: "An explainer", text: "How a complex idea is made short without losing it.", slot: "16:9" },
      ],
    },
  ],
  "life-itself": [
    {
      kind: "network", title: "Separate parts, one living system", intro: "Choose an element to see what connects to it and why. Nodes are structure; each waits on a source.",
      nodes: net([["The question", "What the research asks."], ["Corpus", "The sources read."], ["Pattern", "What repeats across them."], ["Relationship", "How two parts depend on each other."], ["Limit", "What the evidence cannot say."], ["Implication", "What follows, stated carefully."]]),
      edges: [["n0", "n1", "asks of"], ["n1", "n2", "reveals"], ["n2", "n3", "links"], ["n3", "n5", "suggests"], ["n2", "n4", "stops at"], ["n4", "n5", "bounds"]],
    },
    { kind: "ledger", title: "Role and uncertainty", intro: "What is confirmed and what is not." },
  ],
  perspectiva: [
    {
      kind: "rail", variant: "lenses", title: "The same question through three lenses", intro: "Initial framing, counter-reading, synthesis. Every view cites its source; none is invented to balance another.",
      steps: [
        { title: "Initial framing", text: "The thesis as first stated.", slot: "16:9" },
        { title: "Counter-reading", text: "Evidence from another view, with citations.", slot: "16:9" },
        { title: "Synthesis", text: "What holds once both are read, and its limits.", slot: "16:9" },
      ],
    },
  ],
  "redorange-ai": [
    {
      kind: "rail", variant: "pipeline", title: "An auditable pipeline, not a magic box", intro: "Input, interpretation, human review, approved output. Illustrative examples are marked; nothing here is a deployed system.",
      steps: [
        { title: "Input", text: "A source document and the requirement it must meet.", slot: "16:9" },
        { title: "Interpret", text: "The rule or model reading, with its evidence and uncertainty.", slot: "16:9" },
        { title: "Human review", text: "The decision a person makes at the gate, and the guardrail behind it.", slot: "16:9" },
        { title: "Approved output", text: "The deliverable that passes, clearly marked as approved.", slot: "16:9" },
      ],
    },
    { kind: "ledger", title: "Requirement, evidence, owner, state", intro: "A compliance matrix once the source data exists." },
  ],
  "perfect-pixel": [{ kind: "prototype", which: "workbench" }, { kind: "artifacts", title: "Real screens and copy", intro: "Wireframes and final copy are shown as they shipped, with the rationale.", slots: [{ slot: "16:9", label: "Wireframe" }, { slot: "16:9", label: "Final screen" }] }],
  premaculture: [
    {
      kind: "rail", variant: "branches", title: "A seed grows into a brand ecosystem", intro: "Select a branch to see the real piece and how it connects to the others.",
      steps: [
        { title: "The central idea", text: "The brand thesis in a sentence.", slot: "1:1" },
        { title: "Identity", text: "The marks, colour and type that carry it.", slot: "1:1" },
        { title: "Messaging and voice", text: "How the brand speaks.", slot: "1:1" },
        { title: "Web and content", text: "The site and the pieces that keep it alive.", slot: "1:1" },
      ],
    },
  ],
  nowtheo: [{ kind: "reader" }, { kind: "strands" }, { kind: "links" }],
  mymunshi: [{ kind: "reader" }, { kind: "prototype", which: "copilot" }],
  parda: [
    { kind: "reader" },
    {
      kind: "rail", variant: "reels", title: "A six-reel score for one performer", intro: "Choose a reel for its stage direction and excerpt. Nothing here claims a production, a date or a recording.",
      steps: [
        { title: "Reel one", text: "Premise and the opening light.", slot: "16:9" },
        { title: "Reel two", text: "The first role.", slot: "16:9" },
        { title: "Reel three", text: "A change of voice.", slot: "16:9" },
        { title: "Reel four", text: "The turn.", slot: "16:9" },
        { title: "Reel five", text: "What the audience knows that the character does not.", slot: "16:9" },
        { title: "Reel six", text: "The last light.", slot: "16:9" },
      ],
    },
  ],
  "game-prototype": [{ kind: "reader" }, { kind: "prototype", which: "dial" }],
  "fiction-essays": [
    {
      kind: "rail", variant: "shelf", title: "A literary anthology with a listening booth", intro: "Browse by category, open a piece in a calm reader, and listen only where a cleared recording exists. Unpublished work stays separate from published work.",
      steps: [
        { title: "Fiction", text: "Stories, each with date, genre and context.", slot: "4:5" },
        { title: "Essays", text: "Pieces with the original link when published.", slot: "4:5" },
        { title: "Research", text: "Longer analysis, labelled as such.", slot: "4:5" },
        { title: "Spoken word", text: "Open-mic performances where a recording is cleared.", slot: "4:5" },
      ],
    },
  ],
};
