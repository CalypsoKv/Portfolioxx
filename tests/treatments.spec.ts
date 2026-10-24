import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const treatments = JSON.parse(
  readFileSync(new URL("../src/data/treatments.json", import.meta.url), "utf8"),
);
import { transmissions } from "../src/data/transmissions";
test("all nineteen projects have working treatments, evidence slots, and reference desks", async ({
  page,
}) => {
  for (const item of transmissions) {
    await page.goto(`/work/${item.slug}/treatment`);
    await expect(page.locator("h1")).toHaveText(item.title);
    await expect(page.locator(".treatment-chapter")).toHaveCount(3);
    await expect(page.locator(".content-slots>div")).toHaveCount(6);
    await expect(page.locator(".treatment-references a")).toHaveCount(3);
    await expect(page.locator(".treatment-seal")).toContainText(
      "EXACT WORK & CONTENT TO BE ADDED",
    );
  }
});
test("story controls, notes, chapter links and next project are functional", async ({
  page,
}) => {
  await page.goto("/work/parda/treatment");
  await page.getByRole("button", { name: "Show direction notes" }).click();
  await expect(page.locator(".direction-note")).toHaveCount(3);
  await page
    .getByRole("slider", { name: "Explore presentation structure" })
    .fill("90");
  await expect(page.locator(".treatment-control")).toContainText(
    "Clearer structure · 90%",
  );
  await page.locator(".treatment-dock a").filter({ hasText: "03" }).click();
  await expect(page).toHaveURL(/#treatment-2$/);
  await page.locator(".treatment-ending>a").click();
  await expect(page.locator("h1")).toHaveText("The next frequency");
});
test("system guide and complete index are discoverable and fit mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/design-system");
  await expect(page.locator(".system-section")).toHaveCount(5);
  await expect(page.locator(".treatment-index a")).toHaveCount(19);
  await page.getByText("Header / every surface", { exact: true }).click();
  await expect(
    page.getByText(
      "The fixed white Experience / Archive plaque never moves on hover.",
      { exact: false },
    ),
  ).toBeVisible();
  for (const slug of [
    "camden-imagines",
    "reptrics",
    "parda",
    "redorange-ai",
    "fiction-essays",
  ]) {
    await page.goto(`/work/${slug}/treatment`);
    await page.locator("h1").waitFor();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
  expect(treatments).toHaveLength(19);
});
