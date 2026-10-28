// Renders each code-drawn scene (scenes.mjs) to art-src/svg/*.svg and art-src/rendered/*.png using Chromium.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import scenes from "./scenes.mjs";
import { svgDoc, W, H } from "./lib.mjs";

const exe = process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
fs.mkdirSync("art-src/svg", { recursive: true });
fs.mkdirSync("art-src/rendered", { recursive: true });
const only = process.argv[2];
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [name, draw] of Object.entries(scenes)) {
  if (only && !name.includes(only)) continue;
  const svg = svgDoc(draw());
  fs.writeFileSync(`art-src/svg/${name}.svg`, svg);
  await page.setContent(`<body style="margin:0;background:#f5efe0">${svg}</body>`);
  await page.screenshot({ path: `art-src/rendered/${name}.png` });
  console.log("rendered", name);
}
await browser.close();
