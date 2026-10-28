import { test, expect, type Page } from "@playwright/test";
import { transmissions } from "../src/data/transmissions";

const seen = (page: Page) => page.addInitScript(() => sessionStorage.setItem("itv_seen", "1"));
const trackErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};
const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

test("home is a scroll theatre: dots tune between layers and only one layer is interactive", async ({ page }) => {
  const errors = trackErrors(page);
  await seen(page);
  await page.goto("/?tier=lite");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Interdimensional");
  await page.getByRole("button", { name: "Go to Choose a frequency" }).click();
  await expect(page.locator("#l2")).toBeVisible();
  await expect(page.locator("#l2")).not.toHaveAttribute("inert", "");
  await expect(page.locator("#l0")).toHaveAttribute("inert", "");
  await page.getByRole("group", { name: "Featured channels" }).getByRole("button").nth(1).click();
  await expect(page.getByRole("group", { name: "Featured channels" }).getByRole("button", { pressed: true })).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("first visit shows the tuning preloader and can be skipped from the keyboard", async ({ page }) => {
  await page.goto("/?tier=lite");
  const pre = page.getByRole("dialog", { name: "Loading the broadcast" });
  await expect(pre).toBeVisible();
  await expect(page.locator(".preloader-gate.ready")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(pre).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Interdimensional");
});

test("programme guide opens with G, searches, navigates and closes with Escape", async ({ page }) => {
  await seen(page);
  await page.goto("/?tier=static");
  await page.keyboard.press("g");
  const dialog = page.getByRole("dialog", { name: /find your signal|programme guide/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox").fill("Badhuche");
  await dialog.getByRole("button", { name: /Badhuche/ }).first().click();
  await expect(page).toHaveURL(/\/work\/badhuche$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Badhuche");
  await expect(dialog).not.toBeVisible();
  await page.keyboard.press("g");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("catalogue filters, searches, resets, switches view and keeps the archive last", async ({ page }) => {
  await seen(page);
  await page.goto("/catalogue?tier=static");
  await expect(page.locator(".epg .row")).toHaveCount(19);
  const titles = await page.locator(".epg .row .tt").allTextContents();
  expect(titles[0]).toMatch(/camden/i);
  await page.getByRole("group", { name: "Filter by frequency" }).getByRole("button", { name: "Research", exact: true }).click();
  await expect(page.locator(".epg .row")).toHaveCount(3);
  await page.getByRole("textbox", { name: /search/i }).fill("zzz-no-signal");
  await expect(page.getByText("No matching signal")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".epg .row")).toHaveCount(19);
  await page.getByRole("group", { name: "View" }).getByRole("button", { name: "Wall" }).click();
  await expect(page.locator(".wall li")).toHaveCount(19);
  await page.reload();
  await expect(page.getByRole("button", { name: "Wall" })).toHaveAttribute("aria-pressed", "true");
});

test("every one of the 19 channels renders, states its provenance and fits mobile width", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = trackErrors(page);
  await seen(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const t of transmissions) {
    await page.goto(`/work/${t.slug}?tier=static`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(t.title.split(" ")[0]);
    await expect(page.locator("main")).toContainText(/owned|operated|field analysis|concept|published|archive, evidence being restored|site, brand/i);
    expect(await noOverflow(page), `${t.slug} overflows at 390px`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("archive channels show clearly marked placeholder slots, and ?collect=1 adds the evidence checklist", async ({ page }) => {
  await seen(page);
  await page.goto("/work/reptrics?tier=static");
  await expect(page.getByRole("img", { name: /Empty .* slot/ }).first()).toBeVisible();
  await expect(page.getByText("Archive, evidence being restored").first()).toBeVisible();
  await expect(page.getByText("File", { exact: false }).filter({ hasText: "Permission" })).toHaveCount(0);
  await page.goto("/work/reptrics?tier=static&collect=1");
  await expect(page.getByText(/File\s+□ Source\s+□ Permission/).first()).toBeVisible();
});

test("owned channels state the real role and link out to the live sites", async ({ page }) => {
  await seen(page);
  await page.goto("/work/badhuche?tier=static");
  await expect(page.locator("main")).toContainText("Owned & operated");
  await expect(page.getByRole("link", { name: /visit live/i }).first()).toHaveAttribute("href", /^https:\/\//);
  await page.goto("/work/nowtheo?tier=static");
  await expect(page.locator("main")).toContainText("Site, brand & community");
  await expect(page.locator("main")).not.toContainText(/my own practice/i);
});

test("reader distinguishes provenance and toggles strategic notes", async ({ page }) => {
  await seen(page);
  await page.goto("/work/camden-imagines?tier=static");
  await expect(page.locator("main")).toContainText(/no authorship is claimed/i);
  const notes = page.getByRole("button", { name: "Strategic notes" });
  await expect(notes).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".narr-note").first()).toBeVisible();
  await notes.click();
  await expect(page.locator(".narr-note")).toHaveCount(0);
});

test("inquiry validates, composes an encoded mailto and keeps the draft", async ({ page }) => {
  await seen(page);
  await page.goto("/?tier=static");
  await page.keyboard.press("c");
  const dialog = page.getByRole("dialog", { name: /wavelength/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /compose email/i }).click();
  await expect(dialog.getByLabel(/your name/i)).toBeFocused();
  await dialog.getByLabel(/your name/i).fill("Test Person");
  await dialog.getByLabel(/your email/i).fill("test@example.com");
  await dialog.getByLabel(/brief|working on/i).fill("A research & story brief");
  await page.reload();
  await page.keyboard.press("c");
  await expect(dialog.getByLabel(/your name/i)).toHaveValue("Test Person");
  // The dialog composes the mailto through a detached anchor, so record it instead of leaving the page.
  await page.evaluate(() => {
    (window as unknown as { __mail?: string }).__mail = "";
    HTMLAnchorElement.prototype.click = function () {
      (window as unknown as { __mail?: string }).__mail = this.href;
    };
  });
  await dialog.getByRole("button", { name: /compose email/i }).click();
  const href = await page.evaluate(() => (window as unknown as { __mail?: string }).__mail);
  expect(href).toContain("mailto:jahandms60@gmail.com");
  expect(href).toContain(encodeURIComponent("A research & story brief"));
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("the tuning game has a real completion state", async ({ page }) => {
  await seen(page);
  await page.goto("/work/game-prototype?tier=static");
  const dial = page.getByLabel("Frequency in MHz");
  await dial.fill("104");
  await expect(page.getByText("Signal locked. You found the next frequency.")).toBeVisible();
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(dial).toHaveValue("87");
});

test("static tier and reduced motion render no canvas and no smooth-scroll takeover", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await seen(page);
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".stage-static")).toBeVisible();
  await expect(page.locator("html.lenis")).toHaveCount(0);
  for (const id of ["l0", "l1", "l2", "l3", "l4"]) await expect(page.locator(`#${id}`)).toBeVisible();
  await ctx.close();
});

test("full tier mounts the fixed canvas", async ({ page }) => {
  const errors = trackErrors(page);
  await seen(page);
  await page.goto("/?tier=full");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("primary routes fit the viewport at 390 and 1440", async ({ page }) => {
  await seen(page);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/catalogue", "/services", "/about", "/work/badhuche", "/design-system"]) {
      await page.goto(`${path}?tier=static`);
      expect(await noOverflow(page), `${path} @${width}`).toBe(true);
    }
  }
});

test("unknown routes fail gracefully", async ({ page }) => {
  await seen(page);
  await page.goto("/work/not-a-real-channel?tier=static");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /programme|guide|home|work|back/i }).first()).toBeVisible();
});
