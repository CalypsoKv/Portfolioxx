// Renders public/og.jpg (1200x630): the broadcast world, the engraved portrait and Bodoni Moda lettering.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const exe = process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
// Inline everything as data URIs: a page set from a string may not load file:// resources.
const data = (file, type) => `data:${type};base64,${fs.readFileSync(path.resolve(file)).toString("base64")}`;
const font = data("node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-900-normal.woff2", "font/woff2");
const osd = data("node_modules/@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff2", "font/woff2");
const art = data("public/art/the-broadcast-world.webp", "image/webp");
const me = data("public/people/jahan-engraved.webp", "image/webp");
const html = `<body style="margin:0;width:1200px;height:630px;background:#1d1d1d;position:relative;overflow:hidden">
<style>@font-face{font-family:B;src:url('${font}')}@font-face{font-family:S;src:url('${osd}')}
.bg{position:absolute;inset:0;background:linear-gradient(90deg,rgba(17,16,13,.94) 0,rgba(17,16,13,.7) 48%,rgba(17,16,13,.35)),url('${art}') 50% 100%/cover;filter:grayscale(1)}
.me{position:absolute;right:28px;bottom:-12px;height:640px;filter:drop-shadow(0 18px 30px rgba(0,0,0,.6))}
.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)}
.t{position:absolute;left:64px;top:150px;font:900 132px/.84 B;color:#fbf8ef;text-transform:uppercase;letter-spacing:-.02em}
.t span{display:block}.t span+span{margin-left:48px;transform:rotate(-1.4deg);font-size:168px}
.k{position:absolute;left:64px;top:64px;font:20px S;color:#ffea63;text-transform:uppercase;letter-spacing:.06em;text-shadow:0 0 12px rgba(255,234,99,.4)}
.d{position:absolute;left:64px;bottom:64px;font:18px S;color:#f5efe0;text-transform:uppercase;letter-spacing:.06em;background:rgba(3,3,0,.7);padding:8px 12px;border-left:4px solid #ffea63}
.v{position:absolute;inset:0;box-shadow:inset 0 0 160px 40px #000}</style>
<div class="bg"></div><img class="me" src="${me}"><div class="scan"></div><div class="v"></div>
<div class="k">An independent frequency</div>
<div class="t"><span>Jahan</span><span>Patel</span></div>
<div class="d">Writing · Websites · Design · Animation</div></body>`;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: "public/og.jpg", type: "jpeg", quality: 84 });
await browser.close();
console.log("og.jpg");
