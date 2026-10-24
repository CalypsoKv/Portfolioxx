import test from "node:test";
import assert from "node:assert/strict";
import {
  transmissions,
  liveTransmissions,
  frequencies,
  contactEmail,
} from "../src/data/transmissions.ts";

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
  assert.equal(liveTransmissions.length, 5);
  for (const t of liveTransmissions) {
    assert.notEqual(t.status, "vault");
    assert.ok(t.sections?.length);
    assert.ok(t.reading > 0);
  }
  assert.equal(transmissions.filter((t) => t.status === "vault").length, 14);
});
test("provenance preserves the distinction between published work and field analysis", () => {
  assert.deepEqual(
    transmissions.filter((t) => t.status === "published").map((t) => t.id),
    ["007"],
  );
  assert.equal(transmissions.find((t) => t.id === "000").status, "analysis");
  assert.ok(
    transmissions
      .find((t) => t.id === "000")
      .sections.some(
        (s) =>
          s.text.includes("no authorship is claimed") ||
          s.text.includes("no Jahan Patel credit"),
      ),
  );
});
test("every transmission belongs to a real frequency and public contact is confirmed", () => {
  for (const t of transmissions)
    assert.ok(frequencies.some((f) => f.name === t.frequency));
  assert.equal(contactEmail, "jahandms60@gmail.com");
});
