// Writes public/sitemap.xml from the channel list, so a new channel is never missing from it.
// Run: node --experimental-strip-types scripts/sitemap.mjs  (Node 22+ reads the .ts data directly)
import fs from "node:fs";
import { transmissions } from "../src/data/transmissions.ts";

const SITE = "https://eortfolioa.vercel.app";
const paths = ["/", "/catalogue", "/services", "/about", ...transmissions.filter((t) => t.status !== "vault").map((t) => `/work/${t.slug}`)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync("public/sitemap.xml", xml);
console.log(paths.length, "urls");
