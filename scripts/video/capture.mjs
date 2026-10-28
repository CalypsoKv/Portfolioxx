// Captures each live site as one tall still (after scrolling once so lazy images load).
// encode.sh then pans a 16:9 window down and back up the still, which loops without a seam.
// Run: node scripts/video/capture.mjs  (writes art-src/video/<name>.png)
import { chromium } from "@playwright/test";
import fs from "node:fs";

const SITES = {
  badhuche: "https://www.badhuche.co.in/",
  reptrics: "https://www.reptrics.com/",
  digistatement: "https://digistatement.com/author/jahan-patel/",
  nowtheo: "https://untanglingself.com/",
  gyaragyara: "https://www.gyaragyara.com/",
};
const only = process.argv[2];
const exe = process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
fs.mkdirSync("art-src/video", { recursive: true });
const browser = await chromium.launch({ ...(exe ? { executablePath: exe } : {}), ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}) });
for (const [name, url] of Object.entries(SITES)) {
  if (only && name !== only) continue;
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(4000);
    // Close cookie and newsletter prompts when they offer an obvious button.
    for (const label of [/accept/i, /agree/i, /got it/i, /^ok$/i, /close/i, /no thanks/i]) {
      const b = page.getByRole("button", { name: label }).first();
      if (await b.isVisible().catch(() => false)) await b.click({ timeout: 2000 }).catch(() => {});
    }
    // Scroll down slowly so lazy images load and scroll-triggered counters finish while they are on screen.
    // Real wheel input: some lazy loaders wait for user interaction rather than a scroll event.
    await page.mouse.move(640, 360);
    for (let y = 0; y <= 3400; y += 400) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(1200);
    }
    for (let y = 0; y <= 4000; y += 800) await page.mouse.wheel(0, -800);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(1500);
    // Floating bars (cookies, chat, back-to-top) would sit in the middle of the frame: remove anything fixed below the header.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        if ((cs.position === "fixed" || cs.position === "sticky") && el.getBoundingClientRect().top > 120) el.remove();
      }
    });
    const full = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: `art-src/video/${name}.png`, fullPage: true, clip: { x: 0, y: 0, width: 1280, height: Math.min(full, 3400) } });
    console.log("captured", name, full);
  } catch (e) {
    console.log("failed", name, String(e).split("\n")[0]);
  }
  await page.close();
}
await browser.close();
