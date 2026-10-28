import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  transmissions,
  liveTransmissions,
  frequencies,
  contactEmail,
  statusLabel,
  provenanceLabel,
} from "../src/data/transmissions.ts";
import { compositions } from "../src/showcase/compositions.ts";
import { voices, awards } from "../src/data/proof.ts";

const manifest = JSON.parse(readFileSync(new URL("../src/data/assets.json", import.meta.url), "utf8"));
const pub = (p) => new URL(`../public${p}`, import.meta.url);

test("complete 19-channel inventory has unique stable IDs and routes", () => {
  assert.equal(transmissions.length, 19);
  assert.equal(new Set(transmissions.map((t) => t.id)).size, 19);
  assert.equal(new Set(transmissions.map((t) => t.slug)).size, 19);
  assert.deepEqual(
    transmissions.map((t) => t.id).sort(),
    Array.from({ length: 19 }, (_, i) => String(i).padStart(3, "0")),
  );
});

test("unreleased archives cannot enter the live programme", () => {
  assert.equal(liveTransmissions.length, 8);
  for (const t of liveTransmissions) {
    assert.notEqual(t.status, "vault");
    assert.ok(t.sections?.length, `${t.slug} has sections`);
    assert.ok(t.reading > 0);
  }
  assert.equal(transmissions.filter((t) => t.status === "vault").length, 11);
});

test("provenance preserves the distinction between published, analysed, owned and conceptual work", () => {
  const ids = (s) => transmissions.filter((t) => t.status === s).map((t) => t.id).sort();
  assert.deepEqual(ids("published"), ["007"]);
  assert.deepEqual(ids("analysis"), ["000"]);
  assert.deepEqual(ids("owned"), ["002", "005", "014"]);
  assert.deepEqual(ids("concept"), ["015", "016", "017"]);
  const camden = transmissions.find((t) => t.id === "000");
  assert.ok(camden.sections.some((s) => /no authorship is claimed|not claim authorship|contribution .* unconfirmed/i.test(s.text)));
});

test("owned channels state the real role and never overclaim", () => {
  const role = (id) => provenanceLabel(transmissions.find((t) => t.id === id));
  assert.equal(role("002"), "Owned & operated");
  assert.equal(role("005"), "Owned & operated");
  assert.equal(role("014"), "Site, brand & community");
  assert.match(statusLabel("owned"), /owned or built by Jahan/i);
  assert.match(statusLabel("vault"), /evidence being restored/i);
  // NowTheo is not presented as Jahan's own practice.
  const nowtheo = transmissions.find((t) => t.id === "014");
  assert.ok(!/my own practice/i.test(JSON.stringify(nowtheo)));
});

test("every transmission belongs to a real frequency, has a composition, and public contact is confirmed", () => {
  for (const t of transmissions) {
    assert.ok(frequencies.some((f) => f.name === t.frequency), `${t.slug} frequency`);
    assert.ok(compositions[t.slug], `${t.slug} has a composition`);
  }
  assert.equal(Object.keys(compositions).length, 19);
  assert.equal(contactEmail, "jahandms60@gmail.com");
});

test("voices and awards are empty until a name, permission and public source exist", () => {
  for (const v of voices) {
    assert.ok(v.name && v.permission && v.source, "voice needs name, permission and source");
  }
  for (const a of awards) {
    assert.ok(a.name && a.issuer && a.url, "award needs issuer and public url");
  }
});

test("every shipped image has provenance, alt text and a file on disk; each channel has a plate", () => {
  const origins = new Set(["generated-engraving", "code-drawn", "composite", "render", "hand-authored-svg", "owner-supplied"]);
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
  }
  assert.ok(existsSync(pub("/og.jpg")));
});
