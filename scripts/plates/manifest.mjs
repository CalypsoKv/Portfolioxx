// Writes src/data/assets.json: source, origin and alt text for every shipped plate. A node test fails if a file is missing here.
import fs from "node:fs";

const meta = JSON.parse(fs.readFileSync("art-src/plate-prompts.json", "utf8"));
const alt = {
  "000-camden-imagines": "Engraved night view over a sprawl of terraced rooftops, thin lines of light linking lit windows like constellations.",
  "001-origins": "Engraved cross-section of layered earth holding buried notebooks and tools, a ladder, and a small figure brushing a page clean.",
  "002-badhuche": "Engraved colossal bronze head rising from clouds beside a stone archway on a floating island, small figures on the stairs.",
  "003-reptrics": "Engraved wall of crowded gears and pipes funnelling toward one lit doorway and a single clear road.",
  "004-customersuccessbox": "Engraved winding stone path with lanterns at each bend and travellers carrying small boxes.",
  "005-urmila-ben-nu-rasodu": "Engraved kitchen with a steaming brass kadhai, stacked tiffin boxes, hanging chillies and a glowing open doorway.",
  "006-orma-health": "Engraved quiet garden path through open doors and blank signposts toward a bright gate.",
  "007-digistatement": "Code-drawn engraving of a quest map lit by a lantern, framed by curtains, a lone traveller on the route.",
  "008-pepper-content": "Code-drawn engraving of three towering books, each cover showing a different scene: gears, a speaker on a mountain, a river.",
  "009-life-itself": "Code-drawn engraving of a tree above ground and a web of roots and glowing nodes in the soil below.",
  "010-perspectiva": "Code-drawn engraving of three glass lenses, each showing the same mountain as a storm, a sunrise and a contour map.",
  "011-redorange-ai": "Code-drawn engraving of a conveyor of documents reaching a stone gate where a figure holds a lantern to inspect them.",
  "012-perfect-pixel": "Code-drawn engraving of a drafting table with three empty interface frames and a blank block dropping into place.",
  "013-premaculture": "Code-drawn engraving of a seed beside a large tree whose branches carry houses, books, windows and tools.",
  "014-nowtheo": "Code-drawn engraving of a seated figure beside a tangle of thread that becomes clean parallel lines running to a spool.",
  "015-mymunshi": "Code-drawn engraving of an open ledger on a desk with a small mechanical clerk holding a quill.",
  "016-parda": "Code-drawn engraving of a theatre stage with curtains, a spotlight on a lone performer and six hanging film reels.",
  "017-the-next-frequency": "Code-drawn engraving of a mountain-sized radio dial with a needle, static in the sky resolving into clean waves.",
  "018-fiction-essays": "Code-drawn engraving of library shelves, a small listening booth with a microphone and loose pages in the air.",
  "019-kink-studios": "Code-drawn engraving of a leather hide laced to a wooden frame, a ring-shaped mark burned into it and a branding iron lifting away as smoke rises.",
  "020-animation": "Code-drawn engraving of a film strip of seven frames showing a running figure, above a zoetrope drum on a stand and a lamp.",
  "021-gyaragyara": "Code-drawn engraving of turned wooden vases on a long plinth beside a tall window with a tree outside."
};
const assets = meta.plates.map((p) => ({
  id: p.slug,
  file: `/plates/${p.slug}.webp`,
  thumb: `/plates/thumb/${p.slug}.webp`,
  kind: "channel-plate",
  origin: p.source === "ai" ? "generated-engraving" : "code-drawn",
  generator: p.source === "ai" ? `Z-Image-Turbo via the mcp-tools Hugging Face Space, seed ${p.seed}, post-processed to the project duotone` : "scripts/plates (scenes.mjs, lib.mjs), rendered in Chromium, post-processed to the project duotone",
  prompt: p.source === "ai" ? `${meta.style} ${p.subject}` : p.subject,
  owner: "project-original",
  permission: "Original to this project; atmospheric illustration, not an evidence artifact.",
  alt: alt[p.slug],
  caption: "Channel plate: illustration of the idea, not an artifact of the work."
}));
assets.push(
  { id: "guide-wall", file: "/plates/guide-wall.webp", thumb: "/plates/thumb/guide-wall.webp", kind: "composite", origin: "composite", generator: "scripts (PIL collage of the channel plates in CRT frames)", prompt: "", owner: "project-original", permission: "Original composite of this project's own plates.", alt: "A wall of twelve small screens, each showing a different engraved channel plate.", caption: "The programme guide wall." },
  { id: "broadcast-world", file: "/art/the-broadcast-world.webp", kind: "home-plate", origin: "generated-engraving", generator: "Generated for this project in an earlier session", prompt: "", owner: "project-original", permission: "Original to this project.", alt: "Engraved scene: a solitary viewer beneath a monumental television on a floating island.", caption: "The broadcast world." },
  { id: "og", file: "/og.jpg", kind: "social", origin: "render", generator: "scripts/plates/og.mjs from broadcast-world, the engraved portrait and Bodoni Moda lettering", prompt: "", owner: "project-original", permission: "Original to this project; the portrait is the owner's own photo.", alt: "Social card: Jahan Patel's engraved portrait beside his name and the line An independent frequency, over the broadcast world.", caption: "Social share image." },
  { id: "favicon", file: "/favicon.svg", kind: "mark", origin: "hand-authored-svg", generator: "public/favicon.svg", prompt: "", owner: "project-original", permission: "Original to this project.", alt: "Small television with antenna.", caption: "Broadcaster mark." }
);

const badhuche = [
  ["ayodhya", "ayodhya-ram-darbar", "Wide mural art for Ayodhya Airport showing the Ramayana-themed work, as published by the studio."],
  ["gan", "gan-airport-maldives", "Artwork installed at GAN Airport in the Maldives, as published by the studio."],
  ["samruddhi", "Samruddhi-MahaMarg", "Artwork for the Hindu Samruddhi Mahamarg in Maharashtra, as published by the studio."],
  ["dehradun", "Dehradun-airport-Art", "Wall mural at Dehradun Airport, as published by the studio."],
  ["surat", "surat-airport", "Culture-themed artwork at Surat Airport, as published by the studio."],
  ["hanimaadhoo", "202", "Realistic mural of an airport wall at Hanimaadhoo Airport in the Maldives, as published by the studio."]
];
for (const [n, page, a] of badhuche) {
  assets.push({ id: `badhuche-${n}`, file: `/work/badhuche/${n}.webp`, kind: "owner-artifact", origin: "owner-supplied", generator: `Downloaded from the studio's own site (cdn.sanity.io, linked from https://www.badhuche.co.in/works/${page}) and converted to webp`, prompt: "", owner: "Badhuche Art Studio (Jahan owns and runs the studio)", permission: "Owner-stated permission, 28 Oct 2026. Source of record: the studio's website.", alt: a, caption: "Published by Badhuche Art Studio." });
}
const portrait = "Supplied by Jahan Patel for this portfolio, 28 Oct 2026. The crop excludes the other guests in the original photo.";
assets.push(
  { id: "jahan-engraved", file: "/people/jahan-engraved.webp", kind: "portrait", origin: "owner-supplied", generator: "scripts/portrait/portrait.py: line engraving of a background-removed cut-out (rembg, isnet-general-use) of the owner's photo", prompt: "", owner: "Jahan Patel", permission: portrait, alt: "Engraved line portrait of Jahan Patel smiling, in a light blazer and tie, a camera on a strap around his neck.", caption: "The broadcaster." },
  { id: "jahan-press", file: "/people/jahan-press.webp", kind: "portrait", origin: "owner-supplied", generator: "scripts/portrait/portrait.py: ink and paper duotone of the same cut-out", prompt: "", owner: "Jahan Patel", permission: portrait, alt: "Jahan Patel in a light blazer with a camera strap over his shoulders, smiling, printed in ink on cream paper.", caption: "Press photo." },
  { id: "jahan-pass", file: "/people/jahan-pass.webp", kind: "portrait", origin: "owner-supplied", generator: "scripts/portrait/portrait.py: head crop of the duotone", prompt: "", owner: "Jahan Patel", permission: portrait, alt: "Head-and-shoulders photo of Jahan Patel smiling, in ink and cream.", caption: "Pass photo." }
);
const recordings = [
  ["badhuche", "https://www.badhuche.co.in/", "Badhuche Art Studio (Jahan owns and runs the studio)", "Scroll through the Badhuche Art Studio homepage: airport murals, the studio's figures and selected works."],
  ["reptrics", "https://www.reptrics.com/", "Reptrics", "Scroll through the Reptrics homepage: the customer-success platform, its product screens and feature sections."],
  ["digistatement", "https://digistatement.com/author/jahan-patel/", "DigiStatement", "Scroll through Jahan Patel's author page on DigiStatement, a list of his games and anime articles."],
  ["nowtheo", "https://untanglingself.com/", "NowTheo (Jahan built the site)", "Scroll through the Untangling Self website, its welcome text and the explanation of somatic-imaginal work."],
  ["gyaragyara", "https://www.gyaragyara.com/", "Gyara Gyara", "Scroll through the Gyara Gyara shop: wooden vases and planters in the Japandi and Elementary collections."]
];
for (const [n, url, owner, a] of recordings) {
  for (const [suffix, size] of [["", "960x540"], ["-lite", "640x360"]]) {
    assets.push({ id: `video-${n}${suffix}`, file: `/video/${n}${suffix}.mp4`, kind: "screen-video", origin: "screen-recording", generator: `scripts/video (capture.mjs, encode.sh): ${url} captured 28 Oct 2026, panned and encoded at ${size}`, prompt: "", owner, permission: "Public web page, recorded to show the context of Jahan's work. The live site is the source of record.", alt: a, caption: "Plays on the screen behind the channel." });
  }
}
fs.writeFileSync("src/data/assets.json", JSON.stringify({ _note: "Provenance for every shipped image. Reference sites were studied for technique only; none of their files are used.", assets }, null, 2) + "\n");
console.log(assets.length, "assets");
