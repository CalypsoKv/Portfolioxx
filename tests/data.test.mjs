import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  transmissions,
  liveTransmissions,
  frequencies,
  contactEmail,
  statusLabel,
  provenanceLabel,
  publicLink,
} from "../src/data/transmissions.ts";
import { compositions } from "../src/showcase/compositions.ts";
import { voices, awards } from "../src/data/proof.ts";

const manifest = JSON.parse(readFileSync(new URL("../src/data/assets.json", import.meta.url), "utf8"));
const pub = (p) => new URL(`../public${p}`, import.meta.url);
const root = new URL("..", import.meta.url).pathname;
const byId = (id) => transmissions.find((t) => t.id === id);

/** Every text file we ship or build from: source, styles, the HTML shell and public text assets. */
function shippedText() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx|css|json|html|txt|xml|svg)$/.test(name)) out.push([p, readFileSync(p, "utf8")]);
    }
  };
  walk(join(root, "src"));
  walk(join(root, "public"));
  out.push([join(root, "index.html"), readFileSync(join(root, "index.html"), "utf8")]);
  return out;
}

test("the original 19 channels are all kept and three new ones follow: 22 unique IDs and routes", () => {
  assert.equal(transmissions.length, 22);
  assert.equal(new Set(transmissions.map((t) => t.id)).size, 22);
  assert.equal(new Set(transmissions.map((t) => t.slug)).size, 22);
  assert.deepEqual(
    transmissions.map((t) => t.id).sort(),
    Array.from({ length: 22 }, (_, i) => String(i).padStart(3, "0")),
  );
  for (const slug of ["camden-imagines", "origins", "badhuche", "reptrics", "customersuccessbox", "urmila-ben-nu-rasodu", "orma-health", "digistatement", "pepper-content", "life-itself", "perspectiva", "redorange-ai", "perfect-pixel", "premaculture", "nowtheo", "mymunshi", "parda", "game-prototype", "fiction-essays"]) {
    assert.ok(transmissions.some((t) => t.slug === slug), `${slug} is still a channel`);
  }
  assert.deepEqual(["019", "020", "021"].map((id) => byId(id).slug), ["kink-studios", "animation", "gyaragyara"]);
});

test("live channels have reading content; only evidence-less work stays in the archive", () => {
  assert.equal(liveTransmissions.length, 21);
  for (const t of liveTransmissions) {
    assert.notEqual(t.status, "vault");
    assert.ok(t.sections?.length, `${t.slug} has sections`);
    assert.ok(t.reading > 0, `${t.slug} has a reading time`);
  }
  assert.deepEqual(transmissions.filter((t) => t.status === "vault").map((t) => t.id), ["012"]);
});

test("each kind of evidence stays distinct: published, reported, shown with permission, owned, analysis, concept", () => {
  const ids = (s) => transmissions.filter((t) => t.status === s).map((t) => t.id).sort();
  assert.deepEqual(ids("published"), ["007"]);
  assert.deepEqual(ids("analysis"), ["000", "009"]);
  assert.deepEqual(ids("owned"), ["002", "005", "014"]);
  assert.deepEqual(ids("concept"), ["015", "016", "017"]);
  assert.deepEqual(ids("reported"), ["001", "003", "004", "008", "010", "011"]);
  assert.deepEqual(ids("cleared"), ["006", "013", "018", "019", "020", "021"]);
  const camden = byId("000");
  assert.ok(camden.sections.some((s) => /no authorship is claimed|not claim authorship|contribution .* unconfirmed/i.test(s.text)));
  assert.ok(byId("009").sections.some((s) => /claims no authorship/i.test(s.text)));
});

test("owned channels state the real role and never overclaim", () => {
  const role = (id) => provenanceLabel(byId(id));
  assert.equal(role("002"), "Owned & operated");
  assert.equal(role("005"), "Family business · marketing");
  assert.equal(role("014"), "Site, brand & community");
  assert.match(statusLabel("owned"), /owned, run or built by Jahan/i);
  assert.match(statusLabel("vault"), /evidence being restored/i);
  // The kitchen is his mother's; he runs the marketing.
  const urmila = byId("005");
  assert.match(urmila.summary, /mother/i);
  assert.ok(!/Jahan owns/i.test(JSON.stringify(urmila)));
  // NowTheo is not presented as Jahan's own practice.
  assert.ok(!/my own practice/i.test(JSON.stringify(byId("014"))));
});

test("reported channels carry a role, a context and sourced numbers; every number says where it comes from", () => {
  for (const t of transmissions.filter((x) => x.status === "reported")) {
    assert.ok(t.role && t.context, `${t.slug} has role and context`);
  }
  for (const t of transmissions) {
    for (const m of t.metrics ?? []) assert.ok(m.value && m.label && m.source, `${t.slug} metric ${m.label}`);
    for (const m of t.owned?.reported ?? []) assert.ok(m.source && m.date, `${t.slug} reported figure`);
  }
  assert.deepEqual(byId("003").metrics.map((m) => m.value), ["+35%", "+20%", "~15%", "+40%"]);
});

test("the DigiStatement front page lists 20 public bylines with dates", () => {
  const b = byId("007").bylines;
  assert.equal(b.length, 20);
  for (const x of b) {
    assert.match(x.url, /^https:\/\/digistatement\.com\//);
    assert.match(x.date, /^\d{1,2} [A-Z][a-z]{2} 20(20|21)$/);
  }
  assert.ok(b.some((x) => x.title === "Cyberpunk 2077 Tapeworm Mission Guide & Walkthrough" && x.date === "17 Dec 2020"));
});

test("every transmission belongs to a frequency and has a composition whose blocks have their data", () => {
  for (const t of transmissions) {
    assert.ok(frequencies.some((f) => f.name === t.frequency), `${t.slug} frequency`);
    const blocks = compositions[t.slug];
    assert.ok(blocks?.length, `${t.slug} has a composition`);
    for (const b of blocks) {
      if (b.kind === "slider") assert.ok(t.pieces?.length, `${t.slug} slider has pieces`);
      if (b.kind === "newspaper") assert.ok(t.bylines?.length, `${t.slug} newspaper has bylines`);
      if (b.kind === "copy") assert.ok(t.copy, `${t.slug} has copy`);
      if (b.kind === "script") assert.ok(t.script, `${t.slug} has a script`);
      if (b.kind === "metrics") assert.ok(t.metrics?.length, `${t.slug} has metrics`);
    }
  }
  assert.equal(Object.keys(compositions).length, 22);
  assert.equal(contactEmail, "jahandms60@gmail.com");
});

test("public links are real https URLs", () => {
  for (const t of transmissions) {
    const l = publicLink(t);
    if (l) assert.match(l.url, /^https:\/\//, `${t.slug} link`);
    for (const x of [...(t.links ?? []), ...(t.owned?.links ?? [])]) assert.match(x.url, /^https:\/\//);
    for (const p of t.pieces ?? []) if (p.url) assert.match(p.url, /^https:\/\//);
  }
});

test("voices and awards are empty until a name, permission and public source exist", () => {
  for (const v of voices) assert.ok(v.name && v.permission && v.source, "voice needs name, permission and source");
  for (const a of awards) assert.ok(a.name && a.issuer && a.url, "award needs issuer and public url");
});

test("privacy: no phone number or street address ships, and the old name is gone", () => {
  for (const [file, text] of shippedText()) {
    assert.ok(!/\+91|(?<![\d.])\d{10}(?![\d.])|Township/i.test(text), `${file} looks like it contains personal contact details`);
    assert.ok(!/Interdimensional/i.test(text), `${file} still uses the old name`);
  }
});

test("every shipped image and video has provenance, a description and a file on disk; each channel has a plate", () => {
  const origins = new Set(["generated-engraving", "code-drawn", "composite", "render", "hand-authored-svg", "owner-supplied", "screen-recording"]);
  for (const a of manifest.assets) {
    assert.ok(origins.has(a.origin), `${a.id} origin`);
    assert.ok(a.alt && a.alt.length > 8, `${a.id} alt`);
    assert.ok(existsSync(pub(a.file)), `${a.id} file ${a.file}`);
    if (a.origin === "owner-supplied") assert.ok(a.owner && a.permission, `${a.id} owner permission`);
    // The pre-existing home plate was made in an earlier session whose prompt was not kept; its entry says so.
    if (a.origin === "generated-engraving") assert.ok(a.generator && (a.prompt || a.owner === "project-original"), `${a.id} generator`);
  }
  const plates = manifest.assets.filter((a) => a.kind === "channel-plate");
  for (const t of transmissions) {
    assert.ok(plates.some((p) => p.id.startsWith(`${t.id}-`)), `${t.slug} has a plate`);
    if (t.media) {
      for (const f of [t.media.video, t.media.lite]) {
        assert.ok(existsSync(pub(f)), `${t.slug} loop ${f}`);
        assert.ok(manifest.assets.some((a) => a.file === f), `${t.slug} loop ${f} is in the manifest`);
      }
    }
  }
  assert.ok(existsSync(pub("/og.jpg")));
  for (const f of ["/people/jahan-engraved.webp", "/people/jahan-press.webp", "/people/jahan-pass.webp"]) assert.ok(existsSync(pub(f)), f);
});

test("robots.txt and the sitemap point at every live channel", () => {
  const robots = readFileSync(pub("/robots.txt"), "utf8");
  assert.match(robots, /Sitemap: https:\/\/eortfolioa\.vercel\.app\/sitemap\.xml/);
  const sitemap = readFileSync(pub("/sitemap.xml"), "utf8");
  for (const t of liveTransmissions) assert.ok(sitemap.includes(`/work/${t.slug}<`), `${t.slug} in sitemap`);
});
