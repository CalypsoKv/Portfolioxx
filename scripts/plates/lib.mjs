// Tiny engraving toolkit: deterministic SVG helpers that draw in the project's ink-and-cream grammar.
// Everything here is original code; no external artwork is traced or sampled.
export const W = 1536;
export const H = 864;
export const INK = "#11100d";
export const PAPER = "#f5efe0";

export const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

let uid = 0;
const nid = () => `k${uid++}`;
export const f = (n) => +Number(n).toFixed(1);
export const pts = (a) => a.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");

/** Parallel hatch lines clipped to a polygon; stroke width ramps w0 -> w1 across the lines for smooth tone. */
export function hatch(poly, o = {}) {
  const { angle = 45, gap = 7, w0 = 0.8, w1 = 1.6, color = INK, cross = false, opacity = 1 } = o;
  const id = nid();
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
  const n = Math.max(2, Math.ceil((2 * R) / gap));
  let out = `<clipPath id="${id}"><polygon points="${pts(poly)}"/></clipPath><g clip-path="url(#${id})" stroke="${color}" stroke-linecap="round" fill="none" opacity="${opacity}">`;
  for (let i = 0; i <= n; i++) {
    const o2 = -R + i * gap;
    const w = w0 + (w1 - w0) * (i / n);
    const px = cx + nx * o2, py = cy + ny * o2;
    out += `<line x1="${f(px - dx * R)}" y1="${f(py - dy * R)}" x2="${f(px + dx * R)}" y2="${f(py + dy * R)}" stroke-width="${f(w)}"/>`;
  }
  out += "</g>";
  if (cross) out += hatch(poly, { angle: angle + 68, gap: gap * 1.4, w0: w0 * 0.7, w1: w1 * 0.8, color, opacity });
  return out;
}

export const poly = (points, fill = PAPER, stroke = INK, sw = 2.4) =>
  `<polygon points="${pts(points)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
export const line = (x1, y1, x2, y2, sw = 2, color = INK) =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
export const path = (d, sw = 2, color = INK, fill = "none", extra = "") =>
  `<path d="${d}" stroke="${color}" stroke-width="${sw}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const circle = (cx, cy, r, fill = PAPER, stroke = INK, sw = 2.4) =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

/** Jagged blob polygon (rocks, boulders). */
export function blob(cx, cy, rx, ry, seed, n = 14, jag = 0.28) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const k = 1 - jag / 2 + r() * jag;
    out.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
  }
  return out;
}

/** Black engraved night sky: swirling cream line-work, scratches and stars. */
export function sky(seed, o = {}) {
  const { swirls = 3, y0 = 0, y1 = H, stars = 70 } = o;
  const r = rng(seed);
  let out = `<rect x="0" y="${y0}" width="${W}" height="${y1 - y0}" fill="${INK}"/>`;
  for (let s = 0; s < swirls; s++) {
    const cx = 160 + r() * (W - 320), cy = y0 + 70 + r() * (y1 - y0) * 0.5;
    const turns = 2.4 + r() * 1.6, R = 70 + r() * 90, rot = r() * 6;
    let d = "";
    for (let k = 0; k <= 160; k++) {
      const t = (k / 160) * turns * Math.PI * 2 + rot;
      const rad = 6 + (k / 160) * R;
      const x = cx + Math.cos(t) * rad * 1.35, y = cy + Math.sin(t) * rad * 0.8;
      d += (k ? "L" : "M") + f(x) + " " + f(y);
    }
    out += path(d, 1.1, PAPER, "none", 'opacity=".7"');
    for (let rr = 0; rr < 4; rr++) {
      const rad = R * (1.15 + rr * 0.16);
      out += path(`M${f(cx - rad * 1.4)} ${f(cy + rr * 5)} Q${f(cx)} ${f(cy - rad * 0.9 + rr * 7)} ${f(cx + rad * 1.4)} ${f(cy + rr * 3)}`, 0.9, PAPER, "none", 'opacity=".38"');
    }
  }
  for (let i = 0; i < 46; i++) {
    const x = r() * W, y = y0 + r() * (y1 - y0) * 0.7;
    out += path(`M${f(x)} ${f(y)} q${f(40 + r() * 80)} ${f(-8 + r() * 16)} ${f(90 + r() * 140)} ${f(-6 + r() * 12)}`, 0.8, PAPER, "none", 'opacity=".22"');
  }
  for (let i = 0; i < stars; i++) {
    const x = r() * W, y = y0 + r() * (y1 - y0) * 0.75, s = r() < 0.12 ? 3.2 : 1.4 + r();
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="${PAPER}" opacity="${f(0.5 + r() * 0.5)}"/>`;
  }
  return out;
}

/** Scalloped engraved cloud bank. */
export function clouds(seed, x0, x1, yBase, size = 1, rows = 2) {
  const r = rng(seed);
  const circles = [];
  for (let row = 0; row < rows; row++) {
    for (let x = x0 - 40; x < x1 + 60; x += (60 + r() * 50) * size) {
      circles.push({ x: x + r() * 30, y: yBase - row * 38 * size + r() * 26 * size, r: (46 + r() * 52) * size });
    }
  }
  circles.sort((a, b) => a.y - b.y);
  let out = "";
  for (const c of circles) {
    out += circle(c.x, c.y, c.r, PAPER, INK, 2.2);
    for (let k = 0; k < 4; k++) {
      const rr = c.r * (0.82 - k * 0.17);
      out += path(`M${f(c.x - rr * 0.2)} ${f(c.y + rr * 0.9)} A${f(rr)} ${f(rr)} 0 0 0 ${f(c.x + rr * 0.95)} ${f(c.y + rr * 0.1)}`, 1.1, INK, "none", 'opacity=".75"');
    }
  }
  return out;
}

export function figure(x, y, h, o = {}) {
  const { cloak = true, fill = INK, face = PAPER } = o;
  const w = h * 0.34;
  const body = cloak
    ? [[x - w * 0.2, y - h * 0.78], [x + w * 0.2, y - h * 0.78], [x + w * 0.62, y - h * 0.2], [x + w * 0.78, y], [x - w * 0.78, y], [x - w * 0.62, y - h * 0.2]]
    : [[x - w * 0.22, y - h * 0.76], [x + w * 0.22, y - h * 0.76], [x + w * 0.3, y - h * 0.38], [x + w * 0.2, y], [x - w * 0.2, y], [x - w * 0.3, y - h * 0.38]];
  return poly(body, fill, fill, 1) + circle(x, y - h * 0.88, h * 0.1, fill, fill, 1) + (face ? `<path d="M${f(x - h * 0.05)} ${f(y - h * 0.9)} q${f(h * 0.05)} ${f(h * 0.05)} ${f(h * 0.1)} 0" stroke="${face}" stroke-width="1" fill="none"/>` : "");
}

/** Radiating lantern: cream rays on dark, small lamp body. */
export function lantern(x, y, r = 120, seed = 3) {
  const q = rng(seed);
  let out = "";
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + q() * 0.1, l = r * (0.5 + q() * 0.6);
    out += path(`M${f(x + Math.cos(a) * 16)} ${f(y + Math.sin(a) * 16)} L${f(x + Math.cos(a) * l)} ${f(y + Math.sin(a) * l)}`, 0.9 + q() * 0.7, PAPER, "none", `opacity="${f(0.25 + q() * 0.5)}"`);
  }
  out += circle(x, y, 17, PAPER, PAPER, 1);
  out += poly([[x - 11, y - 20], [x + 11, y - 20], [x + 7, y - 28], [x - 7, y - 28]], INK, PAPER, 1.6);
  return out;
}

/** Ridge of hatched mountains. */
export function mountains(seed, x0, x1, yBase, hMax, tone = 1) {
  const r = rng(seed);
  const pts0 = [[x0, yBase]];
  let x = x0;
  while (x < x1) {
    const w = 60 + r() * 120;
    pts0.push([x + w * 0.5, yBase - hMax * (0.35 + r() * 0.65)]);
    x += w;
    pts0.push([Math.min(x, x1), yBase - hMax * (0.08 + r() * 0.2)]);
  }
  pts0.push([x1, yBase]);
  return poly(pts0, PAPER, INK, 2) + hatch(pts0, { angle: 62, gap: 6 - tone, w0: 0.7, w1: 1.9, cross: tone > 1 });
}

/** Hatched rocky ground shelf. */
export function ground(seed, y, x0 = 0, x1 = W, depth = 160) {
  const r = rng(seed);
  const top = [];
  for (let x = x0; x <= x1; x += 40 + r() * 40) top.push([x, y + r() * 28 - 14]);
  const p = [...top, [x1, H + 10], [x0, H + 10]];
  return poly(p, PAPER, INK, 2.6) + hatch(p, { angle: 78, gap: 6, w0: 0.9, w1: 2.4, cross: true });
}

export function svgDoc(inner, { wobble = 3.2 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><filter id="wob" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${wobble}" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
<rect width="${W}" height="${H}" fill="${PAPER}"/><g filter="url(#wob)">${inner}</g></svg>`;
}
