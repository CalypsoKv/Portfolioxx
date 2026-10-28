import { W, H, INK, PAPER, rng, f, pts, hatch, poly, line, path, circle, blob, sky, clouds, figure, lantern, mountains, ground } from "./lib.mjs";

/** Curtain drape: dark cloth with cream fold lines. side = "l" | "r". */
function drape(side, reach = 300, bottom = H) {
  const m = side === "r";
  const X = (x) => (m ? W - x : x);
  const body = [[X(0), 0], [X(reach), 0], [X(reach * 0.82), 210], [X(reach * 0.55), 470], [X(reach * 0.3), 700], [X(reach * 0.18), bottom], [X(0), bottom]];
  let out = poly(body, INK, INK, 1);
  const r = rng(m ? 91 : 19);
  for (let i = 0; i < 11; i++) {
    const x = (i / 10) * reach * 0.9;
    const bow = (r() - 0.5) * 40;
    out += path(`M${f(X(x))} 0 C${f(X(x * 0.9 + bow))} ${f(bottom * 0.3)} ${f(X(x * 0.55 - bow))} ${f(bottom * 0.65)} ${f(X(x * 0.25))} ${f(bottom)}`, 1.5, PAPER, "none", 'opacity=".55"');
  }
  return out;
}
const vtop = (n = 8) => {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = (i / n) * W, w = W / n;
    out += `<path d="M${f(x)} 0 L${f(x + w)} 0 Q${f(x + w * 0.5)} 90 ${f(x)} 0Z" fill="${INK}"/>`;
    out += path(`M${f(x)} 0 Q${f(x + w * 0.5)} 92 ${f(x + w)} 0`, 1.4, PAPER, "none", 'opacity=".6"');
  }
  return out;
};

function lens(cx, cy, r, kind) {
  const id = `lens${kind}`;
  let out = `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r - 12}"/></clipPath>`;
  out += circle(cx, cy, r, PAPER, INK, 9) + circle(cx, cy, r - 14, PAPER, INK, 2.4);
  let g = "";
  if (kind === 0) {
    g += `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${INK}"/>`;
    const q = rng(33);
    for (let i = 0; i < 26; i++) g += path(`M${f(cx - r + q() * 2 * r)} ${f(cy - r + q() * r)} l${f(60 + q() * 80)} ${f(-10 + q() * 20)}`, 1, PAPER, "none", 'opacity=".5"');
    g += poly([[cx - r, cy + r * 0.55], [cx - r * 0.55, cy - r * 0.1], [cx - r * 0.2, cy + r * 0.25], [cx + r * 0.2, cy - r * 0.45], [cx + r * 0.6, cy + r * 0.2], [cx + r, cy + r * 0.05], [cx + r, cy + r], [cx - r, cy + r]], PAPER, INK, 2);
    g += path(`M${cx + 30} ${cy - r * 0.8} L${cx - 10} ${cy - r * 0.35} L${cx + 26} ${cy - r * 0.3} L${cx - 20} ${cy + r * 0.15}`, 4, PAPER);
  } else if (kind === 1) {
    g += `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${PAPER}"/>`;
    for (let i = 0; i < 40; i++) {
      const a = Math.PI + (i / 39) * Math.PI;
      g += line(cx, cy + r * 0.3, cx + Math.cos(a) * r * 1.5, cy + r * 0.3 + Math.sin(a) * r * 1.5, i % 2 ? 1 : 2, INK);
    }
    g += circle(cx, cy + r * 0.18, r * 0.2, PAPER, INK, 3);
    g += poly([[cx - r, cy + r * 0.45], [cx - r * 0.4, cy + r * 0.05], [cx, cy + r * 0.35], [cx + r * 0.45, cy - r * 0.05], [cx + r, cy + r * 0.4], [cx + r, cy + r], [cx - r, cy + r]], INK, INK, 2);
  } else {
    g += `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${PAPER}"/>`;
    for (let i = 1; i < 11; i++) g += path(`M${f(cx - r * 0.18 * i)} ${f(cy + r * 0.45)} Q${f(cx)} ${f(cy - r * 0.9 + i * r * 0.06)} ${f(cx + r * 0.18 * i)} ${f(cy + r * 0.45)} Q${f(cx)} ${f(cy + r * 0.6 + i * 6)} ${f(cx - r * 0.18 * i)} ${f(cy + r * 0.45)}Z`, 1.4, INK);
    g += circle(cx, cy - r * 0.1, 6, INK, INK, 1);
  }
  return out + `<g clip-path="url(#${id})">${g}</g>`;
}

const scenes = {
  // 007 DigiStatement: a quest map under a lantern, curtain half lifted
  "007-digistatement": () => {
    let s = sky(7, { swirls: 3 });
    s += lantern(300, 180, 260, 5);
    s += mountains(71, 0, W, 610, 200, 2);
    const map = [[360, 585], [1200, 540], [1330, 775], [250, 810]];
    s += poly([[map[0][0] + 14, map[0][1] + 16], [map[1][0] + 14, map[1][1] + 16], [map[2][0] + 14, map[2][1] + 16], [map[3][0] + 14, map[3][1] + 16]], INK, INK, 1);
    s += poly(map, PAPER, INK, 3) + hatch(map, { angle: 90, gap: 9, w0: 0.5, w1: 0.9, opacity: 0.35 });
    const peaks = [[520, 700, 60], [610, 690, 80], [700, 715, 55], [960, 650, 70], [1050, 640, 90], [1150, 660, 60], [820, 760, 50]];
    for (const [x, y, h] of peaks) { const p = [[x - h * 0.7, y + h * 0.5], [x, y - h * 0.5], [x + h * 0.7, y + h * 0.5]]; s += poly(p, PAPER, INK, 2) + hatch(p, { angle: 70, gap: 5, w0: 0.7, w1: 1.6 }); }
    s += path("M420 780 C 520 740, 620 800, 740 748 S 900 700, 980 740 S 1120 780, 1230 700", 3.2, INK, "none", 'stroke-dasharray="14 10"');
    s += `<g stroke="${INK}" stroke-width="5" stroke-linecap="round"><line x1="1210" y1="690" x2="1250" y2="730"/><line x1="1250" y1="690" x2="1210" y2="730"/></g>`;
    s += circle(430, 640, 32, PAPER, INK, 3) + path("M430 612 L430 668 M402 640 L458 640", 2) + poly([[430, 614], [438, 640], [430, 666], [422, 640]], INK, INK, 1);
    s += figure(800, 730, 120);
    s += drape("l", 330) + drape("r", 300) + vtop(9);
    return s;
  },
  // 008 Pepper Content: three towering books, three voices
  "008-pepper-content": () => {
    let s = sky(8, { swirls: 2, stars: 90 });
    s += mountains(81, 0, W, 640, 120, 1);
    s += ground(82, 700, 0, W, 160);
    const book = (x, w, h, kind) => {
      const y = 706, dx = 46, dy = 26;
      let b = poly([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], PAPER, INK, 3.4);
      b += poly([[x + w, y], [x + w + dx, y - dy], [x + w + dx, y - h - dy], [x + w, y - h]], INK, INK, 2);
      for (let i = 1; i < 12; i++) b += line(x + w + 4, y - h * (i / 12), x + w + dx - 4, y - h * (i / 12) - dy, 0.9, PAPER);
      b += poly([[x, y - h], [x + w, y - h], [x + w + dx, y - h - dy], [x + dx, y - h - dy]], PAPER, INK, 2.6) + hatch([[x, y - h], [x + w, y - h], [x + w + dx, y - h - dy], [x + dx, y - h - dy]], { angle: 20, gap: 6, w0: 0.6, w1: 1.4 });
      b += `<rect x="${x + 24}" y="${y - h + 24}" width="${w - 48}" height="${h - 48}" fill="none" stroke="${INK}" stroke-width="2"/>`;
      const cx = x + w / 2, cy = y - h / 2;
      if (kind === 0) {
        for (const [gx, gy, gr] of [[cx - 30, cy - 40, 62], [cx + 56, cy + 36, 44], [cx - 52, cy + 80, 34]]) {
          const teeth = 14; let d = "";
          for (let i = 0; i < teeth * 2; i++) { const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? gr * 0.82 : gr; d += (i ? "L" : "M") + f(gx + Math.cos(a) * rr) + " " + f(gy + Math.sin(a) * rr); }
          b += path(d + "Z", 2.4, INK, PAPER) + circle(gx, gy, gr * 0.3, INK, INK, 1);
        }
      } else if (kind === 1) {
        const m = [[cx - 90, cy + 90], [cx - 10, cy - 70], [cx + 20, cy], [cx + 70, cy - 40], [cx + 120, cy + 90]];
        b += poly(m, PAPER, INK, 2.4) + hatch(m, { angle: 66, gap: 5, w0: 0.7, w1: 1.8 }) + figure(cx - 4, cy + 90, 74) + path(`M${cx + 14} ${cy + 36} l30 -16 M${cx + 14} ${cy + 36} l34 4 M${cx + 14} ${cy + 36} l30 22`, 2);
      } else {
        for (let i = 0; i < 6; i++) b += path(`M${x + 36} ${f(cy - 70 + i * 28)} q${f((w - 72) * 0.25)} -14 ${f((w - 72) * 0.5)} 0 t${f((w - 72) * 0.5)} 0`, 2.2);
        b += poly([[cx - 60, cy + 70], [cx + 60, cy + 70], [cx + 40, cy + 98], [cx - 40, cy + 98]], INK, INK, 1) + line(cx, cy + 70, cx, cy + 4, 2.4) + poly([[cx, cy + 6], [cx + 46, cy + 58], [cx, cy + 58]], PAPER, INK, 2.2);
      }
      return b;
    };
    s += book(150, 330, 560, 0) + book(580, 360, 640, 1) + book(1050, 330, 560, 2);
    for (const x of [90, 520, 990, 1440]) s += figure(x, 790, 62);
    return s;
  },
  // 009 Life Itself: a tree, its roots, and the network between them
  "009-life-itself": () => {
    let s = sky(9, { swirls: 2, y1: 520, stars: 60 });
    s += `<rect x="0" y="500" width="${W}" height="${H - 500}" fill="${PAPER}"/>`;
    const strata = [[0, 500], [W, 500], [W, 640], [0, 640]];
    s += hatch(strata, { angle: 2, gap: 12, w0: 0.6, w1: 1.1, opacity: 0.6 });
    s += hatch([[0, 650], [W, 650], [W, H], [0, H]], { angle: 80, gap: 7, w0: 0.7, w1: 1.9, cross: true, opacity: 0.55 });
    s += line(0, 500, W, 500, 5, INK);
    const trunk = [[722, 505], [748, 340], [740, 210], [800, 210], [790, 340], [820, 505]];
    s += poly(trunk, PAPER, INK, 3) + hatch(trunk, { angle: 86, gap: 5, w0: 0.8, w1: 2.2 });
    const r = rng(90);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.26, l = 180 + r() * 110;
      s += path(`M770 230 Q${f(770 + Math.cos(a) * l * 0.5)} ${f(230 + Math.sin(a) * l * 0.7)} ${f(770 + Math.cos(a) * l)} ${f(230 + Math.sin(a) * l * 0.9)}`, 6 - Math.abs(i - 4) * 0.5, INK);
    }
    for (let i = 0; i < 46; i++) { const a = r() * Math.PI * 2, d = 40 + r() * 190; const x = 770 + Math.cos(a) * d * 1.45, y = 200 + Math.sin(a) * d * 0.65; s += circle(x, y, 26 + r() * 22, PAPER, INK, 1.8); }
    const nodes = [];
    for (let i = 0; i < 18; i++) nodes.push([120 + r() * (W - 240), 560 + r() * 270]);
    nodes.push([770, 520]);
    for (const n of nodes) {
      const near = nodes.map((m) => [m, Math.hypot(m[0] - n[0], m[1] - n[1])]).filter((p) => p[1] > 1).sort((a, b) => a[1] - b[1]).slice(0, 2);
      for (const [m] of near) s += path(`M${f(n[0])} ${f(n[1])} Q${f((n[0] + m[0]) / 2 + (r() - 0.5) * 80)} ${f((n[1] + m[1]) / 2 + (r() - 0.5) * 60)} ${f(m[0])} ${f(m[1])}`, 1.8, INK);
    }
    for (const [x, y] of nodes) s += circle(x, y, 11, INK, INK, 1) + circle(x, y, 17, "none", INK, 1.6);
    s += path("M770 505 C 740 560, 640 560, 560 620 M770 505 C 800 560, 900 560, 990 640", 5, INK);
    for (const x of [200, 330, 1240, 1380]) { const h = [[x - 38, 500], [x - 38, 462], [x, 430], [x + 38, 462], [x + 38, 500]]; s += poly(h, PAPER, INK, 2.6) + `<rect x="${x - 9}" y="468" width="18" height="32" fill="${INK}"/>`; }
    return s;
  },
  // 010 Perspectiva: one mountain through three lenses
  "010-perspectiva": () => {
    let s = sky(10, { swirls: 3, y1: 620 });
    s += mountains(101, 0, W, 640, 150, 1);
    s += `<rect x="0" y="640" width="${W}" height="${H - 640}" fill="${PAPER}"/>` + hatch([[0, 640], [W, 640], [W, H], [0, H]], { angle: 6, gap: 8, w0: 0.6, w1: 1.6, opacity: 0.7 });
    s += line(0, 640, W, 640, 4);
    for (const [cx, k] of [[330, 0], [768, 1], [1206, 2]]) {
      s += line(cx - 80, 640, cx, 560, 6) + line(cx + 80, 640, cx, 560, 6) + line(cx, 640, cx, 560, 6);
      s += lens(cx, 380, 190, k);
    }
    s += figure(110, 790, 100);
    return s;
  },
  // 011 RedOrange.ai: documents move down a belt to a gate, a human lifts a lantern at the gate
  "011-redorange-ai": () => {
    let s = sky(11, { swirls: 2, stars: 40 });
    s += mountains(111, 0, W, 520, 90, 1);
    s += ground(112, 640, 0, W, 220);
    const belt = (y, x0, x1) => {
      const b = [[x0, y], [x1, y - 24], [x1, y + 20], [x0, y + 50]];
      let o = poly(b, PAPER, INK, 3) + hatch(b, { angle: 0, gap: 6, w0: 0.7, w1: 1.4, opacity: 0.7 });
      for (let x = x0 + 30; x < x1; x += 70) o += circle(x, y + 52 - ((x - x0) / (x1 - x0)) * 26 + 0, 9, INK, INK, 1);
      return o;
    };
    s += belt(700, 40, 880);
    for (let i = 0; i < 5; i++) {
      const x = 90 + i * 150, y = 690 - i * 4;
      s += poly([[x, y - 70], [x + 64, y - 78], [x + 62, y - 6], [x - 2, y]], PAPER, INK, 2.4);
      for (let k = 1; k < 5; k++) s += line(x + 8, y - 70 + k * 13, x + 52, y - 76 + k * 13, 1.4);
    }
    const gate = [[960, 650], [960, 300], [1020, 230], [1210, 230], [1270, 300], [1270, 650]];
    s += poly(gate, PAPER, INK, 3.6) + hatch(gate, { angle: 90, gap: 7, w0: 0.7, w1: 1.8 });
    const hole = [[1010, 650], [1010, 330], [1050, 290], [1180, 290], [1220, 330], [1220, 650]];
    s += poly(hole, INK, INK, 1);
    s += lantern(1115, 430, 150, 11);
    s += figure(1115, 650, 190, { fill: PAPER, face: INK });
    s += path("M1270 640 C 1340 660, 1380 700, 1500 720", 120, PAPER, "none", 'opacity=".35"');
    for (let i = 0; i < 3; i++) { const x = 1300 + i * 70, y = 690 + i * 8; s += poly([[x, y - 56], [x + 50, y - 62], [x + 48, y - 6], [x, y]], PAPER, INK, 2.4) + path(`M${x + 8} ${y - 40} l30 -4 M${x + 8} ${y - 26} l30 -4`, 1.4); }
    s += clouds(113, 0, W, 840, 0.9, 1);
    return s;
  },
  // 012 Perfect Pixel: a drafting table, empty interface frames, a block dropping into place
  "012-perfect-pixel": () => {
    let s = `<rect width="${W}" height="${H}" fill="${INK}"/>`;
    for (let x = 0; x <= W; x += 48) s += line(x, 0, x, H, 0.8, PAPER).replace("<line", '<line opacity=".12"');
    for (let y = 0; y <= H; y += 48) s += line(0, y, W, y, 0.8, PAPER).replace("<line", '<line opacity=".12"');
    const table = [[160, 560], [1376, 560], [1500, 800], [36, 800]];
    s += poly(table, PAPER, INK, 3) + hatch(table, { angle: 4, gap: 8, w0: 0.5, w1: 1.1, opacity: 0.45 });
    const frame = (x, y, w, h) => {
      let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
      o += `<rect x="${x + 28}" y="${y + 30}" width="${w * 0.5}" height="18" fill="none" stroke="${INK}" stroke-width="2.4"/><rect x="${x + 28}" y="${y + 66}" width="${w - 56}" height="${h * 0.3}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-dasharray="10 7"/>`;
      o += `<rect x="${x + w - 128}" y="${y + h - 52}" width="100" height="30" fill="${INK}"/>`;
      return o;
    };
    s += frame(240, 220, 380, 270) + frame(680, 150, 420, 300) + frame(1150, 250, 290, 220);
    s += `<g transform="translate(780 510)">` + poly([[0, 0], [90, -16], [90, 64], [0, 80]], PAPER, INK, 3) + poly([[0, 0], [90, -16], [140, 2], [50, 18]], PAPER, INK, 3) + poly([[90, -16], [140, 2], [140, 82], [90, 64]], INK, INK, 2) + hatch([[0, 0], [90, -16], [90, 64], [0, 80]], { angle: 80, gap: 5, w0: 0.6, w1: 1.4 }) + `</g>`;
    for (let i = 0; i < 6; i++) s += line(826 + i * 8, 400 - i * 18, 826 + i * 8, 470 - i * 18, 1.6, INK);
    s += poly([[440, 720], [1100, 700], [1104, 716], [444, 736]], PAPER, INK, 2.4) + poly([[1180, 640], [1300, 760]], "none", INK, 5);
    s += circle(1240, 700, 36, PAPER, INK, 3) + circle(1240, 700, 6, INK, INK, 1);
    s += poly([[300, 650], [420, 640], [430, 656], [310, 668]], INK, INK, 1);
    return s;
  },
  // 013 Premaculture: a seed, a tree, the touchpoints in its branches
  "013-premaculture": () => {
    let s = sky(13, { swirls: 3, stars: 50 });
    s += mountains(131, 0, W, 640, 130, 1);
    s += ground(132, 690, 0, W, 180);
    s += path("M118 690 q0 -34 14 -54 q14 20 14 54", 3, INK, PAPER) + path("M132 636 q-30 -4 -44 -24 M132 636 q28 -10 38 -30", 3);
    s += blob(132, 700, 52, 16, 5, 12, 0.2) && poly(blob(132, 700, 60, 18, 5, 12, 0.2), PAPER, INK, 2.4);
    const r = rng(130);
    const branch = (x, y, a, len, w, depth, out) => {
      if (depth === 0 || len < 24) return;
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      out.push([x, y, x2, y2, w]);
      branch(x2, y2, a - 0.46 + r() * 0.15, len * 0.74, w * 0.68, depth - 1, out);
      branch(x2, y2, a + 0.46 - r() * 0.15, len * 0.74, w * 0.68, depth - 1, out);
    };
    const bs = []; branch(780, 700, -Math.PI / 2, 190, 36, 6, bs);
    for (const [x1, y1, x2, y2, w] of bs) s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${PAPER}" stroke-width="${f(w + 5)}" stroke-linecap="round"/><line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${INK}" stroke-width="${f(Math.max(1.6, w * 0.7))}" stroke-linecap="round" opacity=".9"/>`;
    const tips = bs.filter((b) => b[4] < 7);
    const icon = (k, x, y) => {
      if (k === 0) return poly([[x - 20, y + 14], [x - 20, y - 6], [x, y - 22], [x + 20, y - 6], [x + 20, y + 14]], PAPER, INK, 2.4) + `<rect x="${x - 5}" y="${y}" width="10" height="14" fill="${INK}"/>`;
      if (k === 1) return poly([[x - 22, y - 16], [x, y - 10], [x, y + 16], [x - 22, y + 10]], PAPER, INK, 2.4) + poly([[x + 22, y - 16], [x, y - 10], [x, y + 16], [x + 22, y + 10]], PAPER, INK, 2.4);
      if (k === 2) return `<rect x="${x - 18}" y="${y - 18}" width="36" height="36" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>` + line(x, y - 18, x, y + 18, 2) + line(x - 18, y, x + 18, y, 2);
      return poly([[x - 4, y - 22], [x + 4, y - 22], [x + 4, y + 20], [x - 4, y + 20]], PAPER, INK, 2.2) + poly([[x - 20, y - 22], [x + 20, y - 22], [x + 20, y - 10], [x - 20, y - 10]], INK, INK, 1);
    };
    tips.forEach((t, i) => { s += circle(t[2], t[3], 34, PAPER, INK, 2) + icon(i % 4, t[2], t[3]); });
    s += `<rect x="740" y="640" width="80" height="62" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>` + hatch([[740, 640], [820, 640], [820, 702], [740, 702]], { angle: 86, gap: 5, w0: 0.7, w1: 2.2 });
    s += figure(1180, 790, 86);
    return s;
  },
  // 014 NowTheo: a tangle becoming clean parallel lines
  "014-nowtheo": () => {
    let s = `<rect width="${W}" height="${H}" fill="${PAPER}"/>`;
    s += hatch([[0, 0], [W, 0], [W, 560], [0, 560]], { angle: 90, gap: 14, w0: 0.4, w1: 0.8, opacity: 0.28 });
    const win = [[1000, 70], [1330, 70], [1330, 400], [1000, 400]];
    s += poly(win, INK, INK, 1) + `<g stroke="${PAPER}" stroke-width="1.4" opacity=".7">` + [0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="${1000 + i * 55}" y1="70" x2="${1000 + i * 55}" y2="400"/>`).join("") + `</g>`;
    s += line(1165, 70, 1165, 400, 10, INK) + line(1000, 235, 1330, 235, 10, INK);
    s += poly([[0, 650], [W, 650], [W, H], [0, H]], PAPER, INK, 3) + hatch([[0, 650], [W, 650], [W, H], [0, H]], { angle: 2, gap: 9, w0: 0.7, w1: 1.9 });
    const r = rng(14);
    let d = "M470 520";
    for (let i = 0; i < 28; i++) d += ` C ${f(300 + r() * 360)} ${f(350 + r() * 300)}, ${f(300 + r() * 360)} ${f(350 + r() * 300)}, ${f(380 + r() * 220)} ${f(420 + r() * 200)}`;
    s += path(d, 3.2, INK) + path(d, 1.2, PAPER, "none", 'opacity=".9" transform="translate(2 -2)"');
    for (let i = 0; i < 9; i++) s += path(`M640 ${f(470 + i * 17)} C 800 ${f(440 + i * 17)}, 1000 ${f(520 + i * 17)}, 1210 ${f(480 + i * 17)}`, 2.2, INK);
    s += circle(1250, 560, 70, PAPER, INK, 4) + circle(1250, 560, 22, INK, INK, 1) + circle(1250, 560, 70, "none", INK, 1.5);
    for (let i = 0; i < 9; i++) s += path(`M${f(1250 + Math.cos(i * 0.7) * 24)} ${f(560 + Math.sin(i * 0.7) * 24)} L${f(1250 + Math.cos(i * 0.7) * 66)} ${f(560 + Math.sin(i * 0.7) * 66)}`, 1.4);
    s += `<g transform="translate(250 0)">` + poly([[-70, 585], [70, 585], [60, 650], [-60, 650]], INK, INK, 1) + path("M-60 585 L-70 650 M60 585 L70 650", 4) + `</g>`;
    s += figure(250, 585, 230, { cloak: true });
    s += path("M262 470 C 330 480, 380 500, 440 520", 3, INK);
    s += lantern(820, 150, 100, 14).replace(new RegExp(PAPER, "g"), INK).replace(`fill="${INK}"`, `fill="${INK}"`);
    return s;
  },
  // 015 MyMunshi: a ledger on a desk and a small clerk-companion
  "015-mymunshi": () => {
    let s = `<rect width="${W}" height="${H}" fill="${INK}"/>`;
    for (let row = 0; row < 3; row++) for (let i = 0; i < 24; i++) {
      const x = 20 + i * 64, y = 60 + row * 150, h = 110 + ((i * 37 + row * 11) % 30), w = 46 + ((i * 13) % 14);
      s += poly([[x, y + 140 - h], [x + w, y + 140 - h], [x + w, y + 140], [x, y + 140]], PAPER, INK, 2) + hatch([[x, y + 140 - h], [x + w, y + 140 - h], [x + w, y + 140], [x, y + 140]], { angle: 86, gap: 4 + (i % 3), w0: 0.7, w1: 1.6, opacity: 0.8 });
      s += line(x + 4, y + 140 - h + 14, x + w - 4, y + 140 - h + 14, 2.4, INK);
    }
    s += `<rect x="0" y="570" width="${W}" height="${H - 570}" fill="${INK}"/>`;
    const desk = [[60, 640], [1476, 640], [1536, 864], [0, 864]];
    s += poly(desk, PAPER, INK, 3) + hatch(desk, { angle: 3, gap: 9, w0: 0.7, w1: 1.9 });
    const L = [[330, 620], [770, 590], [790, 790], [300, 830]], R = [[770, 590], [1210, 620], [1236, 830], [790, 790]];
    s += poly(L, PAPER, INK, 3.4) + poly(R, PAPER, INK, 3.4) + line(770, 590, 790, 790, 5);
    for (const [pg, sx] of [[L, -1], [R, 1]]) {
      for (let i = 1; i < 9; i++) { const t = i / 9; s += line(pg[0][0] + (pg[3][0] - pg[0][0]) * t, pg[0][1] + (pg[3][1] - pg[0][1]) * t, pg[1][0] + (pg[2][0] - pg[1][0]) * t, pg[1][1] + (pg[2][1] - pg[1][1]) * t, 1.4, INK); }
      for (let i = 1; i < 4; i++) { const t = i / 4; s += line(pg[0][0] + (pg[1][0] - pg[0][0]) * t, pg[0][1] + (pg[1][1] - pg[0][1]) * t, pg[3][0] + (pg[2][0] - pg[3][0]) * t, pg[3][1] + (pg[2][1] - pg[3][1]) * t, 1.4, INK); }
    }
    for (let i = 0; i < 6; i++) s += path(`M${f(380 + i * 12)} ${f(660 + i * 24)} q40 -6 80 0`, 3);
    const rx = 1160, ry = 560;
    s += poly([[rx - 60, ry], [rx + 60, ry], [rx + 50, ry + 120], [rx - 50, ry + 120]], PAPER, INK, 3.4) + hatch([[rx - 60, ry], [rx + 60, ry], [rx + 50, ry + 120], [rx - 50, ry + 120]], { angle: 80, gap: 5, w0: 0.7, w1: 1.8 });
    s += circle(rx, ry - 44, 46, PAPER, INK, 3.4) + circle(rx - 14, ry - 50, 14, INK, INK, 1) + circle(rx + 18, ry - 50, 10, PAPER, INK, 2.4);
    s += line(rx, ry - 90, rx - 6, ry - 130, 3) + circle(rx - 6, ry - 134, 7, INK, INK, 1);
    s += poly([[rx - 70, ry + 20], [rx - 130, ry + 70], [rx - 150, ry + 60], [rx - 84, ry + 4]], PAPER, INK, 3) + path(`M${rx - 150} ${ry + 60} L${rx - 220} ${ry + 20}`, 3) + poly([[rx - 220, ry + 20], [rx - 268, ry - 30], [rx - 236, ry + 6]], PAPER, INK, 2);
    s += lantern(260, 470, 150, 15);
    return s;
  },
  // 016 PARDA: a proscenium, a spotlight, six reels, one performer
  "016-parda": () => {
    let s = `<rect width="${W}" height="${H}" fill="${INK}"/>`;
    const floor = [[300, 640], [1236, 640], [1536, 864], [0, 864]];
    s += poly(floor, PAPER, INK, 3) + hatch(floor, { angle: 90, gap: 36, w0: 1.2, w1: 2.4 }) + hatch(floor, { angle: 0, gap: 40, w0: 0.5, w1: 0.9, opacity: 0.5 });
    const cone = [[768 - 40, 30], [768 + 40, 30], [768 + 260, 700], [768 - 260, 700]];
    s += poly(cone, PAPER, "none", 0) + hatch(cone, { angle: 90, gap: 6, w0: 0.4, w1: 1.1, opacity: 0.5 }).replace(/stroke="#11100d"/g, `stroke="${INK}"`);
    s = s.replace(poly(cone, PAPER, "none", 0), `<polygon points="${pts(cone)}" fill="${PAPER}" opacity=".18"/>`);
    s += poly([[768 - 190, 700], [768 + 190, 700], [768 + 230, 724], [768 - 230, 724]], PAPER, INK, 2) + `<ellipse cx="768" cy="702" rx="210" ry="24" fill="${PAPER}" opacity=".9"/>`;
    s += figure(768, 700, 250, { fill: INK, face: PAPER }) + `<ellipse cx="768" cy="710" rx="90" ry="10" fill="${INK}" opacity=".5"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 330 + i * 175, y = 140 + (i % 2) * 70 + (i === 2 || i === 3 ? 20 : 0);
      s += line(x, 0, x, y - 52, 2.2, PAPER);
      s += circle(x, y, 52, PAPER, INK, 3.4) + circle(x, y, 12, INK, INK, 1);
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; s += circle(x + Math.cos(a) * 30, y + Math.sin(a) * 30, 9, INK, INK, 1); }
    }
    s += drape("l", 360) + drape("r", 360) + vtop(10);
    const stalls = [[0, 864], [W, 864], [W, 780], [0, 780]];
    s += `<polygon points="${pts(stalls)}" fill="${INK}"/>`;
    for (let i = 0; i < 14; i++) { const x = 40 + i * 112; s += blob(x, 842, 44, 38, 30 + i, 10, 0.2) && poly(blob(x, 842, 44, 34, 30 + i, 10, 0.2), INK, PAPER, 1.6); }
    return s;
  },
  // 017 The Next Frequency: a mountain-sized radio dial, a tiny figure, static and a clean signal
  "017-the-next-frequency": () => {
    let s = sky(17, { swirls: 1, stars: 20 });
    const r = rng(170);
    for (let i = 0; i < 1900; i++) { const x = r() * 640, y = r() * 520; if (r() < 1 - x / 700) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.8 + r() * 1.6)}" fill="${PAPER}" opacity="${f(0.3 + r() * 0.7)}"/>`; }
    for (let i = 0; i < 9; i++) s += path(`M${700 + i * 14} ${f(90 + i * 6)} q ${f(210 + i * 8)} ${f(-50 + i * 3)} ${f(420)} 0 t ${f(420)} 0`, 1.6, PAPER, "none", `opacity="${f(0.8 - i * 0.07)}"`);
    s += mountains(171, 0, W, 760, 180, 1);
    s += ground(172, 760, 0, W, 120);
    const cx = 900, cy = 560, R = 330;
    s += circle(cx, cy, R + 24, INK, PAPER, 3) + circle(cx, cy, R, PAPER, INK, 6) + circle(cx, cy, R - 90, "none", INK, 2.4);
    for (let i = 0; i <= 120; i++) { const a = Math.PI + (i / 120) * Math.PI; const big = i % 10 === 0, mid = i % 5 === 0; const l = big ? 54 : mid ? 38 : 22; s += line(cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12), cx + Math.cos(a) * (R - 12 - l), cy + Math.sin(a) * (R - 12 - l), big ? 4 : 2); }
    const ang = Math.PI * 1.62;
    s += poly([[cx + Math.cos(ang) * (R - 40), cy + Math.sin(ang) * (R - 40)], [cx - 12, cy], [cx + 12, cy]], INK, INK, 1);
    s += circle(cx, cy, 62, PAPER, INK, 6) + circle(cx, cy, 34, INK, INK, 2) + hatch(blob(cx, cy, 58, 58, 3, 18, 0.01), { angle: 40, gap: 6, w0: 0.7, w1: 1.6 });
    s += `<rect x="${cx - R - 24}" y="${cy}" width="${2 * R + 48}" height="${R + 60}" fill="${PAPER}"/>` + hatch([[cx - R - 24, cy], [cx + R + 24, cy], [cx + R + 24, cy + R + 60], [cx - R - 24, cy + R + 60]], { angle: 88, gap: 6, w0: 0.7, w1: 1.9, cross: true });
    s += figure(430, 770, 120) + path("M440 700 L560 640", 3);
    return s;
  },
  // 018 Fiction, Essays & Open Mics: shelves, a listening booth, loose pages
  "018-fiction-essays": () => {
    let s = sky(18, { swirls: 1, stars: 30 });
    s += `<rect x="0" y="120" width="${W}" height="${H - 120}" fill="${INK}"/>`;
    for (let row = 0; row < 4; row++) {
      const y = 190 + row * 146;
      s += `<rect x="0" y="${y + 120}" width="760" height="14" fill="${PAPER}"/>`;
      let x = 20;
      const r = rng(180 + row);
      while (x < 730) {
        const w = 28 + r() * 36, h = 78 + r() * 40, lean = r() < 0.08;
        const b = [[x, y + 120 - h], [x + w, y + 120 - h], [x + w, y + 120], [x, y + 120]];
        s += poly(b, PAPER, INK, 2) + hatch(b, { angle: 84 + (lean ? 8 : 0), gap: 4 + Math.floor(r() * 3), w0: 0.7, w1: 1.8, opacity: 0.85 }) + line(x + 3, y + 120 - h + 12, x + w - 3, y + 120 - h + 12, 2.2);
        x += w + 2;
      }
    }
    const booth = [[900, 330], [1300, 330], [1300, 780], [900, 780]];
    s += poly(booth, PAPER, INK, 4) + poly([[930, 360], [1270, 360], [1270, 780], [930, 780]], INK, INK, 1);
    s += poly([[880, 310], [1320, 310], [1290, 330], [910, 330]], PAPER, INK, 3.4) + hatch([[900, 330], [1300, 330], [1300, 780], [900, 780]], { angle: 90, gap: 8, w0: 0.8, w1: 1.8, opacity: 0.6 }).replace(INK, INK);
    s += line(1100, 780, 1100, 560, 5, PAPER) + circle(1100, 540, 28, PAPER, PAPER, 1) + path("M1076 540 h48 M1100 512 v56", 2, INK) + path("M1060 586 q40 40 80 0", 5, PAPER);
    s += path("M1040 500 a60 60 0 0 1 120 0", 6, PAPER) + circle(1040, 504, 14, PAPER, PAPER, 1) + circle(1160, 504, 14, PAPER, PAPER, 1);
    const q = rng(181);
    for (let i = 0; i < 16; i++) {
      const x = 780 + q() * 130 + i * 6, y = 120 + q() * 560, a = q() * 0.9 - 0.45;
      s += `<g transform="rotate(${f(a * 57)} ${f(x)} ${f(y)})">` + poly([[x, y], [x + 70, y - 8], [x + 76, y + 48], [x + 6, y + 56]], PAPER, INK, 2.2) + [0, 1, 2, 3].map((k) => line(x + 10, y + 12 + k * 10, x + 62, y + 4 + k * 10, 1.4)).join("") + `</g>`;
    }
    s += `<rect x="0" y="780" width="${W}" height="${H - 780}" fill="${PAPER}"/>` + hatch([[0, 780], [W, 780], [W, H], [0, H]], { angle: 3, gap: 8, w0: 0.8, w1: 2, opacity: 0.8 });
    s += figure(1380, 780, 160) + lantern(500, 120, 120, 18).replace("<circle", "<circle").replace(new RegExp(PAPER, "g"), PAPER);
    return s;
  },
  // 019 Kink Studios: a hide stretched on a frame, a branding iron leaving its mark, smoke rising
  "019-kink-studios": () => {
    let s = `<rect width="${W}" height="${H}" fill="${INK}"/>`;
    const q = rng(190);
    // pegboard of leather tools
    for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) s += circle(70 + i * 42, 90 + j * 46, 3, PAPER, PAPER, 1);
    for (let i = 0; i < 7; i++) {
      const x = 92 + i * 48, y = 110 + (i % 2) * 40, l = 90 + q() * 70;
      s += line(x, y, x, y + l, 3, PAPER) + (i % 3 === 0 ? circle(x, y + l + 10, 12, PAPER, PAPER, 1) : i % 3 === 1 ? poly([[x - 9, y + l], [x + 9, y + l], [x, y + l + 26]], PAPER, PAPER, 1) : `<rect x="${x - 14}" y="${y + l - 6}" width="28" height="22" fill="${PAPER}"/>`);
    }
    // the frame
    const fx0 = 330, fy0 = 210, fx1 = 1150, fy1 = 760;
    for (const r of [[fx0 - 28, fy0 - 28, fx1 - fx0 + 56, 28], [fx0 - 28, fy1, fx1 - fx0 + 56, 28], [fx0 - 28, fy0, 28, fy1 - fy0], [fx1, fy0, 28, fy1 - fy0]]) {
      const pg = [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0] + r[2], r[1] + r[3]], [r[0], r[1] + r[3]]];
      s += poly(pg, PAPER, INK, 2.4) + hatch(pg, { angle: r[2] > r[3] ? 2 : 88, gap: 5, w0: 0.6, w1: 1.4 });
    }
    // the hide, laced to the frame
    const hide = blob(740, 485, 330, 215, 191, 22, 0.22);
    for (const [hx, hy] of hide) {
      const tx = hx < 740 ? fx0 : fx1, ty = hy < 485 ? fy0 : fy1;
      const nearX = Math.abs(hx - tx) < Math.abs(hy - ty);
      s += line(hx, hy, nearX ? tx : hx, nearX ? hy : ty, 1.6, PAPER);
    }
    s += poly(hide, PAPER, INK, 3) + hatch(hide, { angle: 60, gap: 7, w0: 0.5, w1: 1.3, opacity: 0.55 });
    // the burned mark: a ring and a cross-stitch, no letters
    const mx = 700, my = 470;
    s += `<circle cx="${mx}" cy="${my}" r="96" fill="none" stroke="${INK}" stroke-width="16"/>` + `<circle cx="${mx}" cy="${my}" r="60" fill="none" stroke="${INK}" stroke-width="6"/>`;
    s += path(`M${mx - 36} ${my - 36} L${mx + 36} ${my + 36} M${mx + 36} ${my - 36} L${mx - 36} ${my + 36}`, 12, INK);
    // scorch rays around the mark
    for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2 + q() * 0.1, r0 = 110, r1 = 130 + q() * 40; s += line(mx + Math.cos(a) * r0, my + Math.sin(a) * r0, mx + Math.cos(a) * r1, my + Math.sin(a) * r1, 1 + q(), INK); }
    // the iron, lifting away to the upper right: a shaft from the brand head to a wrapped grip
    const ix = 850, iy = 314, ex = 1420, ey = -46, len = Math.hypot(ex - ix, ey - iy), ox = (-(ey - iy) / len) * 13, oy = ((ex - ix) / len) * 13;
    const shaft = [[ix - ox, iy - oy], [ix + ox, iy + oy], [ex + ox, ey + oy], [ex - ox, ey - oy]];
    s += poly(shaft, PAPER, INK, 2.4) + hatch(shaft, { angle: 58, gap: 4, w0: 0.6, w1: 1.2 });
    s += `<circle cx="${ix - 6}" cy="${iy + 8}" r="46" fill="none" stroke="${PAPER}" stroke-width="12"/>` + `<circle cx="${ix - 6}" cy="${iy + 8}" r="46" fill="none" stroke="${INK}" stroke-width="3"/>`;
    const ang = (Math.atan2(ey - iy, ex - ix) * 180) / Math.PI;
    s += `<rect x="1230" y="0" width="170" height="48" rx="12" fill="${INK}" stroke="${PAPER}" stroke-width="3" transform="rotate(${f(ang)} 1315 24)"/>`;
    for (let i = 0; i < 6; i++) s += `<line x1="${1250 + i * 26}" y1="2" x2="${1250 + i * 26}" y2="46" stroke="${PAPER}" stroke-width="2" transform="rotate(${f(ang)} 1315 24)"/>`;
    // smoke
    for (let i = 0; i < 7; i++) s += path(`M${f(mx - 60 + i * 20)} ${f(my - 110)} c ${f(-40 + q() * 20)} -60 ${f(50 + q() * 30)} -90 ${f(-10 + q() * 30)} -170 s ${f(-60)} -80 ${f(10 + q() * 30)} -150`, 1.6 + q(), PAPER, "none", `opacity="${f(0.35 + q() * 0.4)}"`);
    s += ground(192, 790, 0, W, 80);
    return s;
  },
  // 020 Animation & characters: a zoetrope, a strip of frames with a runner, a lamp
  "020-animation": () => {
    let s = sky(20, { swirls: 2, stars: 50, y1: 360 });
    s += `<rect x="0" y="330" width="${W}" height="${H - 330}" fill="${INK}"/>`;
    const runner = (x, y, k, ph) => {
      const a = Math.sin(ph) * 0.8, b = Math.sin(ph + Math.PI) * 0.8, lean = k * 0.08;
      const hip = [x, y - k * 0.5], neck = [x + lean, y - k * 0.86];
      let o = line(hip[0], hip[1], neck[0], neck[1], k * 0.06, INK) + circle(neck[0] + lean * 0.4, neck[1] - k * 0.1, k * 0.085, INK, INK, 1);
      for (const t of [a, b]) {
        const knee = [hip[0] + Math.sin(t) * k * 0.26, hip[1] + Math.cos(t) * k * 0.24];
        o += path(`M${f(hip[0])} ${f(hip[1])} L${f(knee[0])} ${f(knee[1])} L${f(knee[0] - Math.abs(Math.sin(t)) * k * 0.12)} ${f(knee[1] + k * 0.24)}`, k * 0.05, INK);
      }
      for (const t of [b, a]) o += path(`M${f(neck[0])} ${f(neck[1] + k * 0.05)} l${f(Math.sin(t) * k * 0.2)} ${f(k * 0.16)} l${f(Math.sin(t) * k * 0.1 + k * 0.08)} ${f(-k * 0.04)}`, k * 0.045, INK);
      return o;
    };
    // a strip of seven frames across the sky
    const sy = 70;
    s += `<g transform="rotate(-3 768 200)">` + `<rect x="60" y="${sy}" width="1416" height="250" fill="${INK}" stroke="${PAPER}" stroke-width="3"/>`;
    for (let i = 0; i < 30; i++) s += `<rect x="${78 + i * 47}" y="${sy + 10}" width="22" height="14" rx="3" fill="${PAPER}"/><rect x="${78 + i * 47}" y="${sy + 226}" width="22" height="14" rx="3" fill="${PAPER}"/>`;
    for (let i = 0; i < 7; i++) {
      const x = 84 + i * 198;
      s += `<rect x="${x}" y="${sy + 34}" width="180" height="182" fill="${PAPER}"/>` + line(x + 10, sy + 196, x + 170, sy + 196, 2);
      s += runner(x + 90, sy + 196, 150, (i / 7) * Math.PI * 2);
    }
    s += `</g>`;
    // the zoetrope on its stand
    const cx = 900, top = 470, bot = 650, rx = 280, ry = 58;
    s += line(cx, bot + ry, cx, 790, 10, PAPER) + `<ellipse cx="${cx}" cy="800" rx="150" ry="22" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`;
    const body = [[cx - rx, top], [cx + rx, top], [cx + rx, bot], [cx - rx, bot]];
    s += poly(body, PAPER, INK, 3) + `<ellipse cx="${cx}" cy="${bot}" rx="${rx}" ry="${ry}" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>` + hatch(body, { angle: 90, gap: 7, w0: 0.6, w1: 1.6, opacity: 0.6 });
    for (let i = 0; i < 13; i++) {
      const th = -Math.PI / 2 + (i / 12) * Math.PI, x = cx + Math.sin(th) * rx * 0.94, w = 16 * Math.cos(th) + 3;
      s += `<rect x="${f(x - w / 2)}" y="${top + 16}" width="${f(w)}" height="70" fill="${INK}"/>`;
    }
    s += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${INK}" stroke="${PAPER}" stroke-width="4"/>`;
    for (let i = 0; i < 5; i++) s += `<g opacity="${f(0.35 + i * 0.12)}">` + runner(cx - 180 + i * 90, top + 26, 60, i * 1.2).replace(new RegExp(INK, "g"), PAPER) + `</g>`;
    s += lantern(300, 520, 170, 21) + poly([[260, 560], [340, 560], [360, 790], [240, 790]], PAPER, INK, 2) + hatch([[260, 560], [340, 560], [360, 790], [240, 790]], { angle: 80, gap: 6, w0: 0.6, w1: 1.6 });
    s += ground(201, 800, 0, W, 64);
    return s;
  },
  // 021 Gyara Gyara: turned wooden vases on a plinth by a tall window, a tree outside
  "021-gyaragyara": () => {
    let s = `<rect width="${W}" height="${H}" fill="${PAPER}"/>`;
    s += hatch([[0, 0], [W, 0], [W, 700], [0, 700]], { angle: 90, gap: 14, w0: 0.4, w1: 0.8, opacity: 0.35 });
    // the window and the tree beyond it
    const wx = 120, wy = 70, ww = 420, wh = 610;
    s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="${INK}"/>`;
    s += `<clipPath id="win"><rect x="${wx + 14}" y="${wy + 14}" width="${ww - 28}" height="${wh - 28}"/></clipPath><g clip-path="url(#win)">`;
    s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="${PAPER}"/>` + hatch([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], { angle: 0, gap: 9, w0: 0.4, w1: 0.9, opacity: 0.5 });
    s += poly([[320, 680], [345, 380], [360, 380], [390, 680]], INK, INK, 1);
    for (const [bx, by, br] of [[260, 300, 120], [400, 260, 130], [330, 190, 120], [470, 360, 90], [200, 400, 80]]) s += poly(blob(bx, by, br, br * 0.8, bx + by, 16, 0.3), PAPER, INK, 2.4) + hatch(blob(bx, by, br, br * 0.8, bx + by, 16, 0.3), { angle: 50, gap: 6, w0: 0.7, w1: 1.7, cross: true });
    s += `</g>` + line(wx + ww / 2, wy, wx + ww / 2, wy + wh, 8, INK) + line(wx, wy + wh / 2, wx + ww, wy + wh / 2, 8, INK);
    // the plinth
    const pl = [[620, 640], [1460, 640], [1460, 720], [620, 720]];
    s += poly(pl, PAPER, INK, 3) + hatch(pl, { angle: 2, gap: 6, w0: 0.6, w1: 1.6 });
    s += poly([[600, 620], [1480, 620], [1460, 640], [620, 640]], PAPER, INK, 2.4);
    // vases: a turned profile, wood grain following the curve, a sprig in two of them
    const vase = (x, base, w, h, grain, sprig) => {
      const L = (k) => x - w * k, R = (k) => x + w * k;
      const d = `M${f(L(0.32))} ${base} C${f(L(0.62))} ${f(base - h * 0.08)} ${f(L(0.66))} ${f(base - h * 0.62)} ${f(L(0.2))} ${f(base - h * 0.82)} L${f(L(0.14))} ${f(base - h)} L${f(R(0.14))} ${f(base - h)} L${f(R(0.2))} ${f(base - h * 0.82)} C${f(R(0.66))} ${f(base - h * 0.62)} ${f(R(0.62))} ${f(base - h * 0.08)} ${f(R(0.32))} ${base} Z`;
      let o = `<path d="${d}" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`;
      for (let i = 1; i <= grain; i++) { const k = i / (grain + 1); o += path(`M${f(L(0.3 * (1 - k * 0.6)))} ${f(base - 4)} C${f(L(0.58 * (1 - k)))} ${f(base - h * 0.1)} ${f(L(0.6 * (1 - k)))} ${f(base - h * 0.6)} ${f(L(0.17 * (1 - k)))} ${f(base - h * 0.84)}`, 1.4, INK) + path(`M${f(R(0.3 * (1 - k * 0.6)))} ${f(base - 4)} C${f(R(0.58 * (1 - k)))} ${f(base - h * 0.1)} ${f(R(0.6 * (1 - k)))} ${f(base - h * 0.6)} ${f(R(0.17 * (1 - k)))} ${f(base - h * 0.84)}`, 1.4, INK); }
      if (sprig) {
        o += path(`M${x} ${f(base - h)} C${f(x - 10)} ${f(base - h - 80)} ${f(x + 30)} ${f(base - h - 140)} ${f(x + 10)} ${f(base - h - 210)}`, 2.4, INK);
        for (let i = 0; i < 5; i++) { const ly = base - h - 50 - i * 34, lx = x + (i % 2 ? 18 : -14); o += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="20" ry="9" fill="${PAPER}" stroke="${INK}" stroke-width="2" transform="rotate(${i % 2 ? -30 : 30} ${f(lx)} ${f(ly)})"/>`; }
      }
      return o;
    };
    s += vase(720, 622, 150, 240, 4, true) + vase(880, 622, 120, 170, 3, false) + vase(1040, 622, 170, 300, 5, true) + vase(1210, 622, 110, 150, 3, false) + vase(1350, 622, 130, 210, 4, false);
    // floor
    const fl = [[0, 720], [W, 720], [W, H], [0, H]];
    s += poly(fl, PAPER, INK, 2) + hatch(fl, { angle: 4, gap: 10, w0: 0.6, w1: 1.6, opacity: 0.7 });
    return s;
  },
};
export default scenes;
