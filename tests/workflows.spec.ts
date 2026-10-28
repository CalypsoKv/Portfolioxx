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
const scrollVh = (page: Page, vh: number) => page.evaluate((v) => window.scrollTo(0, window.innerHeight * v), vh);

test("home tunes through the featured channels as you scroll, with no dots or chips to press", async ({ page }) => {
  const errors = trackErrors(page);
  await seen(page);
  await page.goto("/?tier=lite");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Jahan");
  await expect(page.locator(".dots")).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Featured channels" })).toHaveCount(0);
  await scrollVh(page, 2.0);
  await expect(page.locator("#l2")).not.toHaveAttribute("inert", "");
  await expect(page.locator("#l0")).toHaveAttribute("inert", "");
  await expect(page.locator("#l2 h2")).toHaveText("DigiStatement");
  await scrollVh(page, 1.8 + 2.5 * 0.62);
  await expect(page.locator("#l2 h2")).toHaveText("Reptrics");
  await expect(page.locator("#l2").getByRole("link", { name: /open the channel/i })).toHaveAttribute("href", "/work/reptrics");
  await scrollVh(page, 7.6);
  await expect(page.locator("#l4")).not.toHaveAttribute("inert", "");
  await expect(page.locator("#l4").getByRole("link", { name: "jahandms60@gmail.com" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("the broadcaster layer shows Jahan's portrait", async ({ page }) => {
  await seen(page);
  await page.goto("/?tier=static");
  await expect(page.getByRole("img", { name: /portrait of Jahan Patel/i })).toBeVisible();
});

test("first visit shows the tuning preloader and can be skipped from the keyboard", async ({ page }) => {
  await page.goto("/?tier=lite");
  const pre = page.getByRole("dialog", { name: "Loading the broadcast" });
  await expect(pre).toBeVisible();
  await expect(page.locator(".preloader-gate.ready")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(pre).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Jahan");
});

test("the plaque holds the only controls: Room, Work, the dial, sound and Contact", async ({ page }) => {
  await seen(page);
  await page.goto("/?tier=static");
  await expect(page.locator(".hud-cluster")).toHaveCount(0);
  const plaque = page.locator(".plaque");
  await expect(plaque.getByRole("link", { name: "Room" })).toBeVisible();
  await expect(plaque.getByRole("link", { name: "Work" })).toBeVisible();
  const sound = plaque.getByRole("button", { name: /sound/i });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await plaque.getByRole("button", { name: /programme guide/i }).click();
  await expect(page.getByRole("dialog", { name: /find your signal/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await plaque.getByRole("button", { name: "Contact" }).click();
  await expect(page.getByRole("dialog", { name: /wavelength/i })).toBeVisible();
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

test("catalogue filters with text tabs, searches, resets, switches view and keeps the archive last", async ({ page }) => {
  await seen(page);
  await page.goto("/catalogue?tier=static");
  await expect(page.locator(".epg .row")).toHaveCount(22);
  const titles = await page.locator(".epg .row .tt").allTextContents();
  expect(titles[0]).toMatch(/camden/i);
  expect(titles[titles.length - 1]).toMatch(/perfect pixel/i);
  await page.getByRole("group", { name: "Filter by frequency" }).getByRole("button", { name: "Research", exact: true }).click();
  await expect(page.locator(".epg .row")).toHaveCount(3);
  await page.getByRole("textbox", { name: /search/i }).fill("zzz-no-signal");
  await expect(page.getByText("No matching signal")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".epg .row")).toHaveCount(22);
  await page.getByRole("group", { name: "View" }).getByRole("button", { name: "Wall" }).click();
  await expect(page.locator(".wall li")).toHaveCount(22);
  await page.reload();
  await expect(page.getByRole("button", { name: "Wall" })).toHaveAttribute("aria-pressed", "true");
});

test("every channel renders, states its evidence and fits mobile width", async ({ page }) => {
  test.setTimeout(150_000);
  const errors = trackErrors(page);
  await seen(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const t of transmissions) {
    await page.goto(`/work/${t.slug}?tier=static`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(t.title.split(" ")[0]);
    await expect(page.locator("main")).toContainText(/owned|operated|field analysis|concept|publicly verified|archive, evidence being restored|site, brand|reported|shown with permission|family business/i);
    expect(await noOverflow(page), `${t.slug} overflows at 390px`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("the record under each title gives role, context, evidence and a link", async ({ page }) => {
  await seen(page);
  await page.goto("/work/reptrics?tier=static");
  const record = page.getByRole("definition").first();
  await expect(record).toBeVisible();
  await expect(page.locator(".record")).toContainText("Senior Marketing Manager");
  await expect(page.locator(".record")).toContainText("Aug 2022");
  await expect(page.locator(".record")).toContainText(/results reported/i);
  await expect(page.locator(".record a")).toHaveAttribute("href", "https://www.reptrics.com/");
});

test("archive channels show clearly marked placeholder slots, and ?collect=1 adds the evidence checklist", async ({ page }) => {
  await seen(page);
  await page.goto("/work/perfect-pixel?tier=static");
  await expect(page.getByRole("img", { name: /Empty .* slot/ }).first()).toBeVisible();
  await expect(page.getByText("Archive, evidence being restored").first()).toBeVisible();
  await expect(page.getByText("File", { exact: false }).filter({ hasText: "Permission" })).toHaveCount(0);
  await page.goto("/work/perfect-pixel?tier=static&collect=1");
  await expect(page.getByText(/File\s+□ Source\s+□ Permission/).first()).toBeVisible();
});

test("owned channels state the real role and link out to the live sites", async ({ page }) => {
  await seen(page);
  await page.goto("/work/badhuche?tier=static");
  await expect(page.locator("main")).toContainText("Owned & operated");
  await expect(page.getByRole("link", { name: /visit live/i }).first()).toHaveAttribute("href", /^https:\/\//);
  await page.goto("/work/urmila-ben-nu-rasodu?tier=static");
  await expect(page.locator("main")).toContainText("Family business · marketing");
  await expect(page.locator("main")).toContainText(/mother/i);
  await page.goto("/work/nowtheo?tier=static");
  await expect(page.locator("main")).toContainText("Site, brand & community");
  await expect(page.locator("main")).not.toContainText(/my own practice/i);
});

test("the reader keeps its notes in view and states provenance", async ({ page }) => {
  await seen(page);
  await page.goto("/work/camden-imagines?tier=static");
  await expect(page.locator("main")).toContainText(/no authorship is claimed/i);
  await expect(page.getByRole("button", { name: "Strategic notes" })).toHaveCount(0);
  await expect(page.locator(".narr-note").first()).toBeVisible();
});

test("the DigiStatement front page prints 20 checked bylines", async ({ page }) => {
  await seen(page);
  await page.goto("/work/digistatement?tier=static");
  const paper = page.getByRole("region", { name: /front page/i });
  await expect(paper.getByRole("heading", { name: "The DigiStatement Bylines" })).toBeVisible();
  await expect(paper.locator('a[href^="https://digistatement.com/"][href*="-"]').filter({ hasNotText: /read on/i })).toHaveCount(21);
  await expect(paper).toContainText("17 Dec 2020");
});

test("the article slider moves with the arrow keys", async ({ page }) => {
  await seen(page);
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto("/work/reptrics?tier=static");
  const track = page.getByRole("region", { name: /from the content programme, 6 items/i });
  await track.scrollIntoViewIfNeeded();
  await track.focus();
  const before = await track.evaluate((el) => el.scrollLeft);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  await expect(track.getByRole("link", { name: /read it/i })).toHaveCount(6);
});

test("a press pass turns over to show its proof, and turns back", async ({ page }) => {
  await seen(page);
  await page.goto("/about?tier=static");
  await page.getByRole("button", { name: "Turn over the Reptrics pass" }).click();
  const pass = page.locator(".pass.flipped");
  await expect(pass).toContainText("+35% marketing-qualified leads");
  await expect(pass.getByRole("link", { name: /open the channel/i })).toHaveAttribute("href", "/work/reptrics");
  await pass.getByRole("button", { name: "Turn back" }).click();
  await expect(page.locator(".pass.flipped")).toHaveCount(0);
});

test("every channel ends by handing over to the next one", async ({ page }) => {
  await seen(page);
  await page.goto("/work/reptrics?tier=static");
  const next = page.getByRole("region", { name: "Next channel" });
  await expect(next).toContainText("CH 004");
  await next.getByRole("link", { name: "CustomerSuccessBox" }).click();
  await expect(page).toHaveURL(/\/work\/customersuccessbox$/);
});

test("changing channel on the full screen switches the set off and back on", async ({ page }) => {
  const errors = trackErrors(page);
  await seen(page);
  await page.goto("/catalogue?tier=full");
  await page.locator(".epg .row").first().click();
  await expect(page).toHaveURL(/\/work\/camden-imagines$/);
  await expect(page.locator(".powercut")).toHaveCSS("visibility", "hidden");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Camden Imagines");
  expect(errors).toEqual([]);
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
  test.setTimeout(90_000);
  await seen(page);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/catalogue", "/services", "/about", "/work/badhuche", "/work/digistatement", "/work/animation", "/work/orma-health", "/design-system"]) {
      await page.goto(`${path}?tier=static`);
      expect(await noOverflow(page), `${path} @${width}`).toBe(true);
    }
  }
});

test("share tags, robots and sitemap are in place", async ({ page, request }) => {
  await page.goto("/?tier=static");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\.jpg$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/work/digistatement");
});

test("unknown routes fail gracefully", async ({ page }) => {
  await seen(page);
  await page.goto("/work/not-a-real-channel?tier=static");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /programme|guide|home|work|back/i }).first()).toBeVisible();
});
