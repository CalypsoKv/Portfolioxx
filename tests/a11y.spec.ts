import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/catalogue", "/services", "/about", "/work/badhuche", "/work/camden-imagines", "/work/reptrics", "/work/digistatement", "/work/orma-health", "/work/animation", "/work/kink-studios", "/work/perfect-pixel", "/work/game-prototype"];

for (const route of routes) {
  test(`no serious accessibility violations on ${route}`, async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("itv_seen", "1"));
    await page.goto(`${route}?tier=static`);
    await page.waitForTimeout(400);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });
}

test("headings, landmarks and the skip link exist on every shell page", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("itv_seen", "1"));
  for (const route of ["/", "/catalogue", "/work/nowtheo"]) {
    await page.goto(`${route}?tier=static`);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /skip to/i })).toBeFocused();
  }
});
