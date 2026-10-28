// Renders public/og.jpg (1200x630) from this project's own engraved art plus Bodoni Moda lettering.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const exe = process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const font = path.resolve("node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-900-normal.woff2");
const osd = path.resolve("node_modules/@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff2");
const art = path.resolve("public/art/the-broadcast-world.webp");
const html = `<body style="margin:0;width:1200px;height:630px;background:#1d1d1d;position:relative;overflow:hidden">
<style>@font-face{font-family:B;src:url('file://${font}')}@font-face{font-family:S;src:url('file://${osd}')}
.bg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(29,29,29,.9),rgba(29,29,29,.25) 60%),url('file://${art}') 50% 100%/cover}
.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.25) 0 1px,transparent 1px 3px)}
.t{position:absolute;left:64px;bottom:72px;font:900 118px/.86 B;color:#fbf8ef;text-transform:uppercase;letter-spacing:-.02em}
.t span{display:block}.t span+span{margin-left:40px;transform:rotate(-1.2deg);font-size:150px}
.k{position:absolute;left:64px;top:56px;font:20px S;color:#ffea63;text-transform:uppercase;letter-spacing:.06em;text-shadow:0 0 12px rgba(255,234,99,.4)}
.v{position:absolute;inset:0;box-shadow:inset 0 0 160px 40px #000}</style>
<div class="bg"></div><div class="scan"></div><div class="v"></div>
<div class="k">An independent frequency by Jahan Patel</div>
<div class="t"><span style="font-size:84px">Interdimensional</span><span>Television</span></div></body>`;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.waitForTimeout(600);
await page.screenshot({ path: "public/og.jpg", type: "jpeg", quality: 84 });
await browser.close();
console.log("og.jpg");
