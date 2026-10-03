/* Skipper Prep — illustration library, navigation part.
   compassRose, courseTriangle, bearingFix, latitudeScale, std, plotExample.
   Facts follow the verified sheet charts-and-navigation.md (F64–F90, Specs 1–3, 14–16).
   Real navigation colours come from BOAT_SVG.COLORS; diagram ink, water and paper use the
   theme variables so every picture reads in light and dark themes. Pure functions, no DOM. */
(function () {
  'use strict';
  const S = window.BOAT_SVG;
  const C = S.COLORS;
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)';
  const PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', SHALLOW = 'var(--shallow)', MAGENTA = 'var(--accent)';
  const LAND = C.hullLight;          // buff "land" colour as printed on charts (fixed, not themed)
  const LAND_INK = '#1a2630';        // text drawn on top of the buff land must stay dark in both themes
  const T = S.text;

  /* ---------- shared internal helpers ---------- */
  const r1 = n => Math.round(n * 10) / 10;
  const norm = d => ((d % 360) + 360) % 360;
  const deg3 = d => String(Math.round(norm(d))).padStart(3, '0') + '°';
  const num = n => String(Math.round(n * 100) / 100);
  const ew = v => (v >= 0 ? 'E' : 'W');
  const signed = (v, unit) => `${Math.abs(v)}${unit || '°'} ${ew(v)}`;
  const dirv = a => [Math.sin(S.deg(a)), -Math.cos(S.deg(a))];      // 0° = up, clockwise
  const angleOf = (dx, dy) => norm(Math.atan2(dx, -dy) * 180 / Math.PI);
  const fail = (fn, what, valid) => { throw new Error(`${fn}: ${what}. Valid: ${valid}`); };

  function head(x, y, a, size, fill) {
    const [ux, uy] = dirv(a), px = -uy, py = ux, s = size || 10;
    const b1 = [x - ux * s + px * s * .45, y - uy * s + py * s * .45];
    const b2 = [x - ux * s - px * s * .45, y - uy * s - py * s * .45];
    return `<polygon points="${r1(x)},${r1(y)} ${r1(b1[0])},${r1(b1[1])} ${r1(b2[0])},${r1(b2[1])}" fill="${fill || INK}"/>`;
  }
  function line(x1, y1, x2, y2, o) {
    o = o || {};
    return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${o.stroke || INK}" stroke-width="${o.width || 1.5}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>`;
  }
  function arrow(x1, y1, x2, y2, o) {
    o = o || {};
    const a = angleOf(x2 - x1, y2 - y1), s = o.head || 10, [ux, uy] = dirv(a);
    return line(x1, y1, x2 - ux * s * .6, y2 - uy * s * .6, o) + head(x2, y2, a, s, o.stroke || INK);
  }
  function arcPath(cx, cy, r, a1, a2, o) {
    o = o || {};
    const span = norm(a2 - a1), p = a => [cx + r * Math.sin(S.deg(a)), cy - r * Math.cos(S.deg(a))];
    const [x1, y1] = p(a1), [x2, y2] = p(a1 + span);
    return `<path d="M${r1(x1)},${r1(y1)} A${r},${r} 0 ${span > 180 ? 1 : 0},1 ${r1(x2)},${r1(y2)}" fill="none" stroke="${o.stroke || INK}" stroke-width="${o.width || 1.5}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''}/>`;
  }
  function box(x, y, w, h, lines, o) {
    o = o || {};
    const lh = o.lineHeight || 17, size = o.size || 12;
    const y0 = y + h / 2 - (lines.length - 1) * lh / 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${o.fill || PAPER}" stroke="${o.stroke || LINE}" stroke-width="${o.strokeWidth || 1.2}"/>`
      + lines.map((s, i) => T(x + w / 2, y0 + i * lh, s, { size, weight: i === 0 && o.boldFirst ? 700 : 500, fill: o.ink || INK })).join('');
  }
  /* Dividers (measuring compass) spanning (x1,y1)-(x2,y2); the hinge sits off to one side. */
  function dividers(x1, y1, x2, y2, o) {
    o = o || {};
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L = Math.hypot(x2 - x1, y2 - y1);
    let nx = -(y2 - y1) / L, ny = (x2 - x1) / L; if (o.flip) { nx = -nx; ny = -ny; }
    const hh = o.height || Math.max(60, L * .75), hx = mx + nx * hh, hy = my + ny * hh;
    const col = o.stroke || INK2;
    return line(hx, hy, x1, y1, { stroke: col, width: 3 }) + line(hx, hy, x2, y2, { stroke: col, width: 3 })
      + `<circle cx="${r1(hx)}" cy="${r1(hy)}" r="5" fill="${col}"/>`
      + `<circle cx="${r1(x1)}" cy="${r1(y1)}" r="2.2" fill="${col}"/><circle cx="${r1(x2)}" cy="${r1(y2)}" r="2.2" fill="${col}"/>`;
  }
  function northArrow(x, y) {
    return arrow(x, y + 26, x, y - 14, { width: 2 }) + T(x, y - 26, 'N', { size: 13, weight: 700 });
  }
  function landBlob(cx, cy, rx, ry, seed) {
    // a lumpy islet; deterministic shape from the seed
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, k = 1 + .18 * Math.sin(i * 2.3 + (seed || 0)) + .1 * Math.cos(i * 4.1 + (seed || 0));
      pts.push(`${r1(cx + Math.cos(a) * rx * k)},${r1(cy + Math.sin(a) * ry * k)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${LAND}" stroke="${INK2}" stroke-width="1"/>`;
  }
  function lighthouse(x, y) {
    return `<polygon points="${x - 6},${y} ${x + 6},${y} ${x + 4},${y - 20} ${x - 4},${y - 20}" fill="${LAND_INK}"/>`
      + `<rect x="${x - 5}" y="${y - 25}" width="10" height="5" fill="${LAND_INK}"/>`
      + `<path d="M${x},${y - 25} l-5,-12 q5,-6 10,0 z" fill="${MAGENTA}"/>`;
  }
  function church(x, y) {
    return `<rect x="${x - 7}" y="${y - 12}" width="14" height="12" fill="${LAND_INK}"/>`
      + line(x, y - 12, x, y - 24, { stroke: LAND_INK, width: 2 }) + line(x - 5, y - 19, x + 5, y - 19, { stroke: LAND_INK, width: 2 });
  }
  function beacon(x, y) {
    return line(x, y, x, y - 16, { stroke: LAND_INK, width: 2 }) + `<polygon points="${x - 7},${y - 14} ${x + 7},${y - 14} ${x},${y - 26}" fill="${C.green}" stroke="${LAND_INK}" stroke-width="1"/>`;
  }
  /* Plan-view boat pointing along heading a (0 = up). */
  function boatPlan(x, y, a, len, fill) {
    const L = len || 26, W = L * .42;
    const pts = [[0, -L / 2], [W / 2, -L / 8], [W / 2, L / 2], [-W / 2, L / 2], [-W / 2, -L / 8]];
    return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${a || 0})"><polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill || INK2}" stroke="${PAPER}" stroke-width="1"/></g>`;
  }
  const fixMark = (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${INK}" stroke-width="1.8"/><circle cx="${x}" cy="${y}" r="1.8" fill="${INK}"/>`;

  /* Chart grid with latitude (side) and longitude (top/bottom) borders. 10' of latitude tall,
     20' of longitude wide at 60°N, where 1' of longitude is only half as long as 1' of latitude (F68). */
  function chartGrid(g, o) {
    o = o || {};
    const { x0, y0, w, h, band } = g;
    const pxLat = h / 10, pxLon = w / 20;
    let s = `<rect x="${x0 - band}" y="${y0 - band}" width="${w + 2 * band}" height="${h + 2 * band}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>`;
    // latitude bands (left and right): alternate shading per minute, tenths ticked
    for (let m = 0; m < 10; m++) {
      const y = y0 + m * pxLat;
      [x0 - band, x0 + w].forEach((bx, side) => {
        const inner = side === 0 ? bx + band / 2 : bx;
        if (m % 2) s += `<rect x="${inner}" y="${r1(y)}" width="${band / 2}" height="${r1(pxLat)}" fill="${INK}" opacity=".85"/>`;
        s += line(bx, y, bx + band, y, { width: 1 });
        for (let t = 1; t < 10; t++) { const ty = y + t * pxLat / 10; const tx = side === 0 ? bx : bx + band / 2; s += line(tx, ty, tx + band / 2 * (t === 5 ? 1 : .55), ty, { width: .6 }); }
      });
    }
    // longitude bands (top and bottom)
    for (let m = 0; m < 20; m++) {
      const x = x0 + m * pxLon;
      [y0 - band, y0 + h].forEach((by, side) => {
        const inner = side === 0 ? by + band / 2 : by;
        if (m % 2) s += `<rect x="${r1(x)}" y="${inner}" width="${r1(pxLon)}" height="${band / 2}" fill="${INK}" opacity=".85"/>`;
        s += line(x, by, x, by + band, { width: 1 });
        for (let t = 1; t < 10; t++) { const tx = x + t * pxLon / 10; const ty = side === 0 ? by : by + band / 2; s += line(tx, ty, tx, ty + band / 2 * (t === 5 ? 1 : .55), { width: .6 }); }
      });
    }
    // labels
    const latLab = [[0, "60°00'N"], [5, "59°55'N"], [10, "59°50'N"]];
    latLab.forEach(([m, t]) => { const y = y0 + m * pxLat; if (o.leftLabels !== 'ends' || m !== 5) s += T(x0 - band - 6, y, t, { size: 11, anchor: 'end', fill: INK2 }); s += T(x0 + w + band + 6, y, t, { size: 11, anchor: 'start', fill: INK2 }); });
    [[0, "010°30'E"], [10, "010°40'E"], [20, "010°50'E"]].forEach(([m, t]) => { const x = x0 + m * pxLon; s += T(x, y0 - band - 10, t, { size: 11, fill: INK2 }); s += T(x, y0 + h + band + 11, t, { size: 11, fill: INK2 }); });
    // light meridian / parallel every 5' inside the chart
    for (let m = 5; m < 10; m += 5) s += line(x0, y0 + m * pxLat, x0 + w, y0 + m * pxLat, { stroke: LINE, width: 1 });
    for (let m = 5; m < 20; m += 5) s += line(x0 + m * pxLon, y0, x0 + m * pxLon, y0 + h, { stroke: LINE, width: 1 });
    return s;
  }

  /* ---------- 1. Compass rose with variation (Spec 1, F73–F76) ---------- */
  function compassRose(opts) {
    opts = opts || {};
    const v = opts.variation == null ? 4 : opts.variation;
    if (typeof v !== 'number' || !isFinite(v) || Math.abs(v) > 45) fail('compassRose', `opts.variation ${JSON.stringify(v)} is not a usable number`, 'degrees as a number, east positive (e.g. 4 = 4° E, -4 = 4° W), |v| ≤ 45');
    const year = opts.year || 2020;
    const change = opts.change == null ? "8'W" : String(opts.change);      // annual change, chart style
    const chg = /^(\d+)'\s*([EW])$/i.exec(change.replace(/\s/g, ''));
    if (!chg) fail('compassRose', `opts.change ${JSON.stringify(change)} is not chart style`, `"8'W" or "10'E" (minutes per year with E or W)`);
    const delta = (+chg[1]) * (chg[2].toUpperCase() === 'E' ? 1 : -1);
    const increasing = v === 0 ? delta > 0 : Math.sign(delta) === Math.sign(v);
    const W = 480, H = 580, cx = 240, cy = 275, R = 200, Ri = 128;
    let s = '';
    // wedge between true and magnetic north so even a small variation is visible
    s += S.sector(cx, cy, R - 12, Math.min(0, v), Math.max(0, v), MAGENTA, .28);
    // outer (true) ring
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R - 16}" fill="none" stroke="${INK}" stroke-width=".8"/>`;
    for (let a = 0; a < 360; a++) {
      const len = a % 10 === 0 ? 16 : a % 5 === 0 ? 10 : 5, [ux, uy] = dirv(a);
      s += line(cx + ux * R, cy + uy * R, cx + ux * (R - len), cy + uy * (R - len), { width: a % 10 === 0 ? 1.4 : .7 });
    }
    for (let a = 0; a < 360; a += 10) {
      const [ux, uy] = dirv(a), rr = R - 30, big = a % 30 === 0;
      s += `<text x="${r1(cx + ux * rr)}" y="${r1(cy + uy * rr)}" font-size="${big ? 13 : 11}" font-weight="${big ? 700 : 500}" fill="${INK}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${a} ${r1(cx + ux * rr)} ${r1(cy + uy * rr)})">${a}</text>`;
    }
    // true north: line and star
    s += line(cx, cy, cx, cy - R + 44, { width: 1.2 });
    const star = (x, y, r) => { let p = []; for (let i = 0; i < 10; i++) { const a = i * 36, rr = i % 2 ? r * .45 : r, [ux, uy] = dirv(a); p.push(`${r1(x + ux * rr)},${r1(y + uy * rr)}`); } return `<polygon points="${p.join(' ')}" fill="${INK}"/>`; };
    s += star(cx, cy - R - 22, 11);
    s += T(cx, cy - R - 42, 'True north', { size: 12, weight: 700 });
    // inner (magnetic) ring, rotated clockwise by the variation (east = to the right of true north)
    let inner = `<circle cx="${cx}" cy="${cy}" r="${Ri}" fill="none" stroke="${MAGENTA}" stroke-width="1.5"/>`;
    for (let a = 0; a < 360; a += 5) {
      const len = a % 10 === 0 ? 12 : 7, [ux, uy] = dirv(a);
      inner += line(cx + ux * Ri, cy + uy * Ri, cx + ux * (Ri - len), cy + uy * (Ri - len), { stroke: MAGENTA, width: a % 10 === 0 ? 1.3 : .7 });
    }
    for (let a = 30; a < 360; a += 30) {   // the inner "0" is replaced by the magnetic north arrow
      const [ux, uy] = dirv(a), rr = Ri - 24;
      inner += `<text x="${r1(cx + ux * rr)}" y="${r1(cy + uy * rr)}" font-size="11" font-weight="600" fill="${MAGENTA}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${a} ${r1(cx + ux * rr)} ${r1(cy + uy * rr)})">${a}</text>`;
    }
    // magnetic north arrow with a half arrowhead, and the chart annotation along it
    const ay = cy - Ri - 24;
    inner += line(cx, cy, cx, ay, { stroke: MAGENTA, width: 2.2 });
    inner += `<polygon points="${cx},${ay} ${cx},${ay + 24} ${cx - 11},${ay + 22}" fill="${MAGENTA}"/>`;
    inner += T(cx, cy + 60, 'MAGNETIC', { size: 11, weight: 700, fill: MAGENTA });
    s += `<g transform="rotate(${v} ${cx} ${cy})">${inner}</g>`;
    // chart annotation beside the magnetic north arrow (kept horizontal for legibility)
    const ann = `${Math.abs(v)}° ${ew(v)} ${year} (${change})`, aw = 16 + ann.length * 7.2, axx = v >= 0 ? cx + 14 : cx - 14 - aw;
    s += `<rect x="${r1(axx)}" y="${cy - 82}" width="${r1(aw)}" height="22" rx="4" fill="${PAPER}" stroke="${MAGENTA}"/>`;
    s += T(axx + aw / 2, cy - 71, ann, { size: 12, weight: 700, fill: MAGENTA });
    s += T(cx, cy + R - 50, 'TRUE', { size: 11, weight: 700 });
    // annotation of the angle
    s += T(cx, 14, `Magnetic north lies ${Math.abs(v)}° to the ${v >= 0 ? 'right (east)' : 'left (west)'} of true north`, { size: 11, fill: INK2 });
    // caption
    s += T(cx, H - 48, `Variation ${Math.abs(v)}° ${v >= 0 ? 'east' : 'west'} in ${year}, ${increasing ? 'increasing' : 'decreasing'} ${Math.abs(delta)}' per year`, { size: 13, weight: 700 });
    s += T(cx, H - 26, 'Outer ring: true (chart) · Inner ring: magnetic (what the compass follows)', { size: 11, fill: INK2 });
    if (v < 0) s += T(cx, H - 8, 'Westerly example for comparison — all of Norway has easterly (or near-zero) variation', { size: 11, fill: MUTED });
    return S.svg(W, H, s, { label: `Chart compass rose: outer true ring and inner magnetic ring rotated ${Math.abs(v)} degrees ${v >= 0 ? 'east (clockwise)' : 'west (anticlockwise)'}, annotated ${Math.abs(v)}° ${ew(v)} ${year} (${change})` });
  }

  /* ---------- 2. True / magnetic / compass ladder (Spec 14, F79–F84) ---------- */
  function courseTriangle(opts) {
    opts = opts || {};
    const variation = opts.variation == null ? 4 : opts.variation, deviation = opts.deviation == null ? 0 : opts.deviation;
    [['variation', variation], ['deviation', deviation]].forEach(([k, val]) => { if (typeof val !== 'number' || !isFinite(val)) fail('courseTriangle', `opts.${k} must be a number of degrees`, 'east positive, west negative, e.g. 4 or -2'); });
    let up, tc, mc, cc;   // up = compass → true (CADET); down = true → compass
    if (opts.compass != null) { up = true; cc = norm(opts.compass); mc = norm(cc + deviation); tc = norm(mc + variation); }
    else if (opts.true != null) { up = false; tc = norm(opts.true); mc = norm(tc - variation); cc = norm(mc - deviation); }
    else fail('courseTriangle', 'no starting course given', 'opts.true (course from the chart, converted down to compass) or opts.compass (course steered, converted up to true), plus variation and deviation');
    const W = 600, H = 470, bx = 60, bw = 190, bh = 54, ys = [50, 200, 350];
    const hi = MAGENTA, lo = MUTED;
    let s = '';
    const names = [['TRUE (chart)', tc], ['MAGNETIC', mc], ['COMPASS (steer)', cc]];
    names.forEach(([n, val], i) => { s += box(bx, ys[i], bw, bh, [n, deg3(val)], { boldFirst: true, size: 14, lineHeight: 22, stroke: INK, strokeWidth: 1.5 }); });
    // left side: downward conversion (true → compass): subtract east, add west
    // right side: upward conversion (compass → true): add east, subtract west (CADET)
    const stepNames = ['variation', 'deviation'], stepVals = [variation, deviation];
    for (let i = 0; i < 2; i++) {
      const y1 = ys[i] + bh, y2 = ys[i + 1], ym = (y1 + y2) / 2;
      const lx = bx + 40, rx = bx + bw - 40;
      s += arrow(lx, y1 + 6, lx, y2 - 6, { stroke: up ? lo : hi, width: up ? 1.5 : 2.5 });
      s += arrow(rx, y2 - 6, rx, y1 + 6, { stroke: up ? hi : lo, width: up ? 2.5 : 1.5 });
      s += T(lx - 10, ym - 8, '− E', { size: 11, anchor: 'end', fill: up ? lo : hi, weight: 700 });
      s += T(lx - 10, ym + 8, '+ W', { size: 11, anchor: 'end', fill: up ? lo : hi, weight: 700 });
      s += T(rx + 10, ym - 8, '+ E', { size: 11, anchor: 'start', fill: up ? hi : lo, weight: 700 });
      s += T(rx + 10, ym + 8, '− W', { size: 11, anchor: 'start', fill: up ? hi : lo, weight: 700 });
      s += box(bx + bw / 2 - 52, ym - 15, 104, 30, [`${stepNames[i]} ${signed(stepVals[i])}`], { size: 12, fill: PAPER2 });
    }
    s += T(bx + bw / 2, ys[2] + bh + 26, '↓ true → compass: − E / + W     ↑ compass → true: + E / − W', { size: 11, fill: INK2 });
    // worked example panel
    const px = 300, pw = 280;
    const opUp = v => (v >= 0 ? '+' : '−'), opDown = v => (v >= 0 ? '−' : '+');
    const lines = [];
    if (up) {
      lines.push(`Compass ${deg3(cc)} ${opUp(deviation)} deviation ${signed(deviation)}`);
      lines.push(`= Magnetic ${deg3(mc)}${norm(cc + deviation) !== cc + deviation ? `  (${cc + deviation} → ${deg3(mc)})` : ''}`);
      lines.push(`Magnetic ${deg3(mc)} ${opUp(variation)} variation ${signed(variation)}`);
      lines.push(`= True ${deg3(tc)}${mc + variation >= 360 || mc + variation < 0 ? `  (${mc + variation} → ${deg3(tc)})` : ''}`);
    } else {
      lines.push(`True ${deg3(tc)} ${opDown(variation)} variation ${signed(variation)}`);
      lines.push(`= Magnetic ${deg3(mc)}${tc - variation >= 360 || tc - variation < 0 ? `  (${tc - variation} → ${deg3(mc)})` : ''}`);
      lines.push(`Magnetic ${deg3(mc)} ${opDown(deviation)} deviation ${signed(deviation)}`);
      lines.push(`= Compass ${deg3(cc)}${mc - deviation >= 360 || mc - deviation < 0 ? `  (${mc - deviation} → ${deg3(cc)})` : ''}`);
    }
    s += `<rect x="${px}" y="50" width="${pw}" height="354" rx="8" fill="${PAPER2}" stroke="${LINE}"/>`;
    s += T(px + pw / 2, 74, up ? 'Worked example: compass → true' : 'Worked example: true → compass', { size: 14, weight: 700 });
    s += T(px + pw / 2, 96, up ? 'CADET: Compass ADd East to get True' : 'From the chart to the steering compass', { size: 11, fill: INK2 });
    lines.forEach((l, i) => s += T(px + 14, 134 + i * 30, l, { size: 13, anchor: 'start', weight: i % 2 ? 700 : 500, fill: i % 2 ? hi : INK }));
    s += T(px + 14, 268, 'Sign convention: east = +, west = −', { size: 12, anchor: 'start', fill: INK2 });
    s += T(px + 14, 290, 'Error east, compass least;', { size: 12, anchor: 'start', fill: INK2 });
    s += T(px + 14, 308, 'error west, compass best.', { size: 12, anchor: 'start', fill: INK2 });
    s += T(px + 14, 340, 'Variation: from the chart rose (Earth).', { size: 12, anchor: 'start', fill: MUTED });
    s += T(px + 14, 358, 'Deviation: from this boat\'s table (varies', { size: 12, anchor: 'start', fill: MUTED });
    s += T(px + 14, 376, 'with heading). Wrap past 360°: 367° = 007°.', { size: 12, anchor: 'start', fill: MUTED });
    s += T(W / 2, H - 22, up ? `Compass ${deg3(cc)} → Magnetic ${deg3(mc)} → True ${deg3(tc)}` : `True ${deg3(tc)} → Magnetic ${deg3(mc)} → Compass ${deg3(cc)}`, { size: 14, weight: 700 });
    return S.svg(W, H, s, { label: `Course conversion ladder true, magnetic, compass with variation ${signed(variation)} and deviation ${signed(deviation)}: ${up ? 'compass' : 'true'} ${deg3(up ? cc : tc)} gives ${up ? 'true' : 'compass'} ${deg3(up ? tc : cc)}` });
  }

  /* ---------- 3. Cross-bearing fix (Spec 15, F86–F87) ---------- */
  function bearingFix(opts) {
    opts = opts || {};
    const bearings = opts.bearings || [40, 110, 180];
    if (!Array.isArray(bearings) || bearings.length < 2 || bearings.length > 3 || bearings.some(b => typeof b !== 'number' || !isFinite(b))) fail('bearingFix', `opts.bearings ${JSON.stringify(bearings)}`, 'an array of 2 or 3 true bearings in degrees from the boat to the objects, e.g. [40, 110, 180]');
    const cocked = !!opts.cockedHat && bearings.length === 3;
    const variation = opts.variation == null ? 4 : opts.variation;
    const W = 640, H = 480, fx = 215, fy = 250;
    const kinds = [['Lighthouse', lighthouse, 2.1], ['Church', church, 0.4], ['Beacon', beacon, 4.2]];
    const dists = [168, 150, 150];
    let s = `<rect x="12" y="12" width="420" height="${H - 24}" rx="8" fill="${SHALLOW}" stroke="${INK}" stroke-width="1.2"/>`;
    const objs = bearings.map((b, i) => { const [ux, uy] = dirv(b); return { b: norm(b), x: fx + ux * dists[i], y: fy + uy * dists[i], i }; });
    objs.forEach(o => { s += landBlob(o.x, o.y + 6, 38, 24, kinds[o.i][2]); });
    // position lines: from the object back toward the boat. A cocked hat comes from small bearing errors.
    const errs = cocked ? [1.8, -1.8, 1.6] : [0, 0, 0];
    const lines = objs.map(o => { const a = norm(o.b + 180 + errs[o.i]); const [ux, uy] = dirv(a); return { x: o.x, y: o.y, ux, uy, o }; });
    lines.forEach(l => {
      const L = dists[l.o.i] + 55;
      s += line(l.x, l.y, l.x + l.ux * L, l.y + l.uy * L, { stroke: INK, width: 1.6 });
      // arrowhead pointing TOWARD the object: the bearing is the direction from the boat to the object
      s += head(l.x + l.ux * 36, l.y + l.uy * 36, norm(l.o.b), 10, INK);
      // bearing label beside the line, beyond the angle labels (which sit 46–64 px from the fix)
      const [bx, by] = dirv(l.o.b), lx = fx + bx * 84, ly = fy + by * 84;
      s += T(lx - by * 18, ly + bx * 18, `${deg3(l.o.b)} T`, { size: 12, weight: 700, fill: INK });
    });
    // fix: intersections (cocked hat) or the single point
    let cx = fx, cy = fy;
    if (cocked) {
      const inter = (a, b) => { const d = a.ux * b.uy - a.uy * b.ux; const t = ((b.x - a.x) * b.uy - (b.y - a.y) * b.ux) / d; return [a.x + a.ux * t, a.y + a.uy * t]; };
      const p = [inter(lines[0], lines[1]), inter(lines[1], lines[2]), inter(lines[0], lines[2])];
      s += `<polygon points="${p.map(q => `${r1(q[0])},${r1(q[1])}`).join(' ')}" fill="${MAGENTA}" opacity=".35" stroke="${MAGENTA}" stroke-width="1.5"/>`;
      cx = (p[0][0] + p[1][0] + p[2][0]) / 3; cy = (p[0][1] + p[1][1] + p[2][1]) / 3;
      s += T(cx - 70, cy + 44, 'cocked hat', { size: 12, weight: 700, fill: MAGENTA });
      s += line(cx - 44, cy + 36, cx - 8, cy + 8, { stroke: MAGENTA, width: 1 });
    }
    s += fixMark(r1(cx), r1(cy));
    s += T(cx - 16, cy - 20, 'FIX', { size: 13, weight: 700 });
    // angles between adjacent bearings
    for (let i = 0; i + 1 < objs.length; i++) {
      const a1 = objs[i].b, a2 = objs[i + 1].b, span = norm(a2 - a1), mid = a1 + span / 2;
      s += arcPath(cx, cy, 46, a1, a2, { stroke: INK2, width: 1.2, dash: '3 3' });
      const [ux, uy] = dirv(mid);
      s += T(cx + ux * 64, cy + uy * 64, `${Math.round(span)}°`, { size: 12, weight: 700, fill: INK2 });
    }
    objs.forEach(o => { const [ux, uy] = dirv(o.b); s += kinds[o.i][1](o.x, o.y); s += T(o.x, o.y + 42, kinds[o.i][0], { size: 12, fill: INK, weight: 700 }); });
    s += northArrow(395, 48);
    s += T(222, H - 22, 'Objects charted; bearings taken from the boat and plotted back from the objects', { size: 11, fill: INK2 });
    // right panel
    const px = 445, pw = 182;
    s += `<rect x="${px}" y="12" width="${pw}" height="${H - 24}" rx="8" fill="${PAPER2}" stroke="${LINE}"/>`;
    s += T(px + pw / 2, 36, 'Cross-bearing fix', { size: 14, weight: 700 });
    const info = [
      ['1. Take compass bearings of', INK], ['   2–3 charted objects', INK], ['2. Convert to true', INK], ['3. Plot from the objects', INK], ['4. Crossing = your position', INK], ['', INK],
      ['Compass bearing ' + deg3(objs[0].b - variation), INK2], [`${variation >= 0 ? '+' : '−'} variation ${signed(variation)}`, INK2], [`= true ${deg3(objs[0].b)}`, MAGENTA], ['', INK],
      ['Spread: 60–120° apart is', INK2], ['good (90° best); near 0°', INK2], ['or 180° is useless.', INK2], ['', INK],
      cocked ? ['Three lines rarely meet in', INK2] : ['Only true bearings are', INK2], cocked ? ['one point: the small triangle', INK2] : ['plotted on the chart.', INK2], cocked ? ['shows the fix quality.', INK2] : ['', INK2]];
    info.forEach((l, i) => s += T(px + 10, 62 + i * 19, l[0], { size: 12, anchor: 'start', fill: l[1], weight: l[1] === MAGENTA ? 700 : 500 }));
    return S.svg(W, H, s, { label: `Cross-bearing fix: true bearings ${objs.map(o => deg3(o.b)).join(', ')} to ${objs.map(o => kinds[o.i][0].toLowerCase()).join(', ')} plotted back from the objects, crossing at the boat's position${cocked ? ' in a small cocked-hat triangle' : ''}` });
  }

  /* ---------- 4. Latitude scale / measuring distance, and reading a position (Specs 2–3, F64–F68) ---------- */
  function latitudeScale(opts) {
    opts = opts || {};
    const mode = opts.position ? 'position' : 'distance';
    const W = 640, H = mode === 'distance' ? 560 : 520, g = { x0: 150, y0: 48, w: 320, h: 320, band: 20 };
    const pxLat = g.h / 10, pxLon = g.w / 20;
    let s = chartGrid(g, { leftLabels: mode === 'position' ? 'all' : 'ends' });
    const noteY = g.y0 + g.h + g.band + 30;
    if (mode === 'distance') {
      // a leg from A (59°52'N) to B of 5' = 5 NM on a 45° course
      const L = 5 * pxLat, ax = g.x0 + 3 * pxLon, ay = g.y0 + 8 * pxLat, bx = ax + L * Math.SQRT1_2, by = ay - L * Math.SQRT1_2;
      s += line(ax, ay, bx, by, { width: 2 });
      s += head(bx, by, angleOf(bx - ax, by - ay), 9);
      s += `<circle cx="${r1(ax)}" cy="${ay}" r="3" fill="${INK}"/>`;
      s += T(ax + 12, ay + 10, 'A', { size: 12, weight: 700 }); s += T(bx + 12, by - 8, 'B', { size: 12, weight: 700 });
      s += dividers(ax, ay, bx, by, { height: 56 });          // hinge to the lower right of the leg
      // the same opening moved straight across to the left border, level with the leg
      const sx = g.x0 - g.band / 2, sy1 = ay, sy2 = ay - L;
      s += arrow(ax - 10, ay, sx + 12, ay, { stroke: MAGENTA, width: 1.2, dash: '5 3' });
      s += line(bx, by, sx + 12, sy2, { stroke: MAGENTA, width: 1, dash: '5 3' });
      s += dividers(sx, sy1, sx, sy2, { height: 50, stroke: MAGENTA });
      s += T(sx - 58, (sy1 + sy2) / 2 - 10, '5′ = 5 NM', { size: 13, weight: 700, fill: MAGENTA, anchor: 'end' });
      s += T(sx - 58, (sy1 + sy2) / 2 + 8, 'read here', { size: 11, fill: MAGENTA, anchor: 'end' });
      s += T(ax + 60, ay + 44, 'move straight across', { size: 11, fill: MAGENTA });
      // wrong: dividers on the longitude scale with a red cross
      const wx1 = g.x0 + 8 * pxLon, wx2 = wx1 + L, wy = g.y0 + g.h + g.band / 2;
      s += dividers(wx1, wy, wx2, wy, { height: 44, flip: true, stroke: MUTED });
      const mx = (wx1 + wx2) / 2;
      s += line(mx - 22, wy - 22, mx + 22, wy + 22, { stroke: C.red, width: 5 }); s += line(mx - 22, wy + 22, mx + 22, wy - 22, { stroke: C.red, width: 5 });
      s += T(g.x0 + g.w / 2, noteY + 6, 'Never measure distance on the longitude scale', { size: 13, weight: 700, fill: C.red });
      s += T(g.x0 + g.w / 2, noteY + 24, 'At 60°N one minute of longitude is only about 0.5 NM (926 m): it shrinks with cos(latitude)', { size: 11, fill: INK2 });
      s += T(W / 2, noteY + 56, 'Latitude scale (side border): 1′ = 1 NM = 1852 m. Set the dividers on the leg, move them', { size: 12, weight: 700 });
      s += T(W / 2, noteY + 74, 'straight across to the side scale level with the leg and count the minutes (tenths: 0.5′ = 926 m).', { size: 12, weight: 700 });
      s += T(W / 2, H - 10, 'Example chart grid near 60°N (not a real chart): 10′ of latitude tall, 20′ of longitude wide', { size: 11, fill: MUTED });
      return S.svg(W, H, s, { label: 'Chart border scales: dividers on a 5-minute leg moved to the left latitude border read 5 nautical miles (1 minute = 1 NM = 1852 m); dividers on the bottom longitude scale are crossed out in red, never measure distance there' });
    }
    // position mode: 59°54,5'N 010°44,0'E
    const py = g.y0 + 5.5 * pxLat, pxx = g.x0 + 14 * pxLon;
    s += line(g.x0 - g.band, py, pxx, py, { stroke: MAGENTA, width: 1.5, dash: '6 4' });
    s += line(pxx, g.y0 - g.band, pxx, py, { stroke: MAGENTA, width: 1.5, dash: '6 4' });
    s += head(g.x0 - g.band + 4, py, 270, 9, MAGENTA);
    s += head(pxx, g.y0 - g.band + 4, 0, 9, MAGENTA);
    s += `<circle cx="${r1(pxx)}" cy="${r1(py)}" r="5" fill="${MAGENTA}"/>`;
    s += T(pxx + 10, py + 14, 'P', { size: 13, weight: 700, fill: MAGENTA, anchor: 'start' });
    s += `<rect x="${g.x0 + 24}" y="${r1(py - 32)}" width="86" height="22" rx="4" fill="${PAPER}" stroke="${MAGENTA}"/>`;
    s += T(g.x0 + 67, py - 21, "1: 59°54,5′N", { size: 12, weight: 700, fill: MAGENTA });
    s += `<rect x="${r1(pxx + 8)}" y="${g.y0 + 24}" width="96" height="22" rx="4" fill="${PAPER}" stroke="${MAGENTA}"/>`;
    s += T(pxx + 56, g.y0 + 35, "2: 010°44,0′E", { size: 12, weight: 700, fill: MAGENTA });
    s += T(W / 2, noteY + 6, 'P = 59°54,5′N 010°44,0′E', { size: 15, weight: 700, fill: MAGENTA });
    s += T(W / 2, noteY + 28, 'Latitude first, then longitude; degrees, minutes and decimal minutes', { size: 12, weight: 700 });
    s += T(W / 2, noteY + 48, '1: straight across to the side scale: 54′ + 5 tenths.  2: straight up to the top scale: 44′ + 0 tenths.', { size: 11, fill: INK2 });
    s += T(W / 2, noteY + 66, 'Keep the leading zero in 010°. Norway is always N and E.', { size: 11, fill: INK2 });
    s += T(W / 2, H - 10, 'Example chart grid near 60°N (not a real chart): 10′ of latitude tall, 20′ of longitude wide', { size: 11, fill: MUTED });
    return S.svg(W, H, s, { label: 'Reading a position from the chart grid: dashed line left to the latitude scale reads 59°54,5′N, dashed line up to the longitude scale reads 010°44,0′E; latitude first, then longitude' });
  }

  /* ---------- 5. Speed – time – distance (Spec 16, F70–F71) ---------- */
  function stdSolve(o, fn) {
    const has = k => o[k] != null;
    const minutes = has('minutes') ? o.minutes : has('hours') ? o.hours * 60 : null;
    const given = ['speed', 'distance'].filter(has).length + (minutes != null ? 1 : 0);
    if (given !== 2) fail(fn, `opts ${JSON.stringify(o)} must give exactly two of speed, distance and time`, '{ speed, minutes } → distance; { distance, speed } → time; { distance, minutes } → speed (hours may replace minutes)');
    if (has('speed') && minutes != null) {
      const d = o.speed * minutes / 60;
      return { speed: o.speed, minutes, distance: d, text: `${num(o.speed)} kn × ${num(minutes)}/60 h = ${num(d)} NM`, solve: 'Distance = Speed × Time' };
    }
    if (has('distance') && has('speed')) {
      const h = o.distance / o.speed, m = Math.round(h * 60), hh = Math.floor(m / 60), mm = m - hh * 60;
      return { speed: o.speed, minutes: m, distance: o.distance, text: `${num(o.distance)} NM ÷ ${num(o.speed)} kn = ${num(h)} h = ${hh} h ${String(mm).padStart(2, '0')} min`, solve: 'Time = Distance ÷ Speed' };
    }
    const sp = o.distance / (minutes / 60);
    return { speed: sp, minutes, distance: o.distance, text: `${num(o.distance)} NM ÷ ${num(minutes)}/60 h = ${num(sp)} kn`, solve: 'Speed = Distance ÷ Time' };
  }
  function std(opts) {
    opts = opts || {};
    const ex1 = stdSolve(Object.keys(opts).length ? opts : { speed: 12, minutes: 40 }, 'std');
    const second = opts.second || (ex1.solve.startsWith('Time') ? { speed: 12, minutes: 40 } : { distance: 15, speed: 10 });
    const ex2 = stdSolve(second, 'std');
    const W = 600, H = 400;
    let s = '';
    // triangle: D on top, S and T below
    const ax = 150, top = 46, base = 236, half = 128;
    s += `<polygon points="${ax},${top} ${ax - half},${base} ${ax + half},${base}" fill="${PAPER2}" stroke="${INK}" stroke-width="2"/>`;
    const midY = (top + base) / 2 + 12;
    s += line(ax - half * (base - midY) / (base - top), midY, ax + half * (base - midY) / (base - top), midY, { width: 2 });
    s += line(ax, midY, ax, base, { width: 2 });
    s += T(ax, midY - 36, 'D', { size: 34, weight: 700 }); s += T(ax, midY - 8, 'Distance (NM)', { size: 11, fill: INK2 });
    s += T(ax - 54, midY + 36, 'S', { size: 30, weight: 700 }); s += T(ax - 54, midY + 64, 'Speed (kn)', { size: 11, fill: INK2 });
    s += T(ax + 54, midY + 36, 'T', { size: 30, weight: 700 }); s += T(ax + 54, midY + 64, 'Time (h)', { size: 11, fill: INK2 });
    s += T(ax, base + 20, 'Cover the one you want: side by side = multiply, over = divide', { size: 11, fill: MUTED });
    // formulas
    const fx = 330;
    [['D = S × T', 'Distance = Speed × Time'], ['S = D ÷ T', 'Speed = Distance ÷ Time'], ['T = D ÷ S', 'Time = Distance ÷ Speed']].forEach((f, i) => {
      const y = 50 + i * 54;
      s += box(fx, y, 118, 40, [f[0]], { size: 17, fill: PAPER });
      s += T(fx + 130, y + 20, f[1], { size: 12, anchor: 'start', fill: INK2 });
    });
    s += box(fx, 216, 250, 40, ['minutes ÷ 60 = hours   (40 min = 0.667 h)'], { size: 12, fill: PAPER2, stroke: MAGENTA, ink: MAGENTA });
    s += T(fx + 125, 274, '6-minute rule: in 6 min you cover 1/10 of your speed in NM', { size: 11, fill: MUTED });
    // worked boxes
    [ex1, ex2].forEach((e, i) => {
      const x = 24 + i * 282;
      s += box(x, 296, 270, 86, [e.solve, e.text, `(${num(e.speed)} kn, ${num(e.minutes)} min, ${num(e.distance)} NM)`], { boldFirst: true, size: 13, lineHeight: 24, stroke: i === 0 ? MAGENTA : LINE, strokeWidth: i === 0 ? 2 : 1.2 });
    });
    return S.svg(W, H, s, { label: `Speed-time-distance triangle with D over S and T; worked example ${ex1.text} and ${ex2.text}` });
  }

  /* ---------- 6. A plotted leg on a chart excerpt (F85, F90, worked example 15) ---------- */
  function plotExample(opts) {
    opts = opts || {};
    const course = opts.course == null ? 90 : opts.course, speed = opts.speed == null ? 8 : opts.speed, minutes = opts.minutes == null ? 45 : opts.minutes;
    [['course', course], ['speed', speed], ['minutes', minutes]].forEach(([k, v]) => { if (typeof v !== 'number' || !isFinite(v) || (k !== 'course' && v <= 0)) fail('plotExample', `opts.${k} must be a positive number`, 'course in degrees true, speed in knots, minutes of time, e.g. { course: 90, speed: 8, minutes: 45 }'); });
    const start = opts.start || '09:00';
    const tm = /^(\d{1,2}):(\d{2})$/.exec(start); if (!tm) fail('plotExample', `opts.start ${JSON.stringify(start)}`, 'a clock time "HH:MM"');
    const endMin = (+tm[1]) * 60 + (+tm[2]) + minutes, endT = `${String(Math.floor(endMin / 60) % 24).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
    const dist = speed * minutes / 60;
    const W = 640, H = 470, x0 = 150, y0 = 36, w = 440, h = 340, band = 20, pxLat = h / 10;
    let s = `<rect x="${x0 - band}" y="${y0}" width="${w + band}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>`;
    // latitude band on the left with minute shading and tenths
    for (let m = 0; m < 10; m++) {
      const y = y0 + m * pxLat;
      if (m % 2) s += `<rect x="${x0 - band / 2}" y="${r1(y)}" width="${band / 2}" height="${r1(pxLat)}" fill="${INK}" opacity=".85"/>`;
      s += line(x0 - band, y, x0, y, { width: 1 });
      for (let t = 1; t < 10; t++) s += line(x0 - band, y + t * pxLat / 10, x0 - band + band / 2 * (t === 5 ? 1 : .55), y + t * pxLat / 10, { width: .6 });
    }
    [[0, "60°00'N"], [10, "59°50'N"]].forEach(([m, t]) => s += T(x0 - band - 6, y0 + m * pxLat, t, { size: 11, anchor: 'end', fill: INK2 }));
    // some chart content: shallow water and a coast along the bottom, a lighthouse, soundings, a rock
    s += `<path d="M${x0},${y0 + h} L${x0},${y0 + h - 70} Q${x0 + 90},${y0 + h - 110} ${x0 + 180},${y0 + h - 75} T${x0 + 330},${y0 + h - 85} Q${x0 + 400},${y0 + h - 95} ${x0 + w},${y0 + h - 60} L${x0 + w},${y0 + h} Z" fill="${SHALLOW}"/>`;
    s += `<path d="M${x0},${y0 + h} L${x0},${y0 + h - 30} Q${x0 + 100},${y0 + h - 60} ${x0 + 200},${y0 + h - 30} T${x0 + 340},${y0 + h - 40} Q${x0 + 400},${y0 + h - 50} ${x0 + w},${y0 + h - 20} L${x0 + w},${y0 + h} Z" fill="${LAND}" stroke="${INK2}"/>`;
    s += lighthouse(x0 + 230, y0 + h - 34); s += T(x0 + 230, y0 + h - 12, 'Lt', { size: 11, fill: LAND_INK, weight: 700 });
    s += T(x0 + 60, y0 + h - 86, '7,3', { size: 11, fill: INK2, family: 'serif' });
    s += T(x0 + 330, y0 + h - 100, '12', { size: 11, fill: INK2, family: 'serif' });
    s += line(x0 + 380, y0 + h - 64, x0 + 380, y0 + h - 50, { stroke: INK2, width: 1.5 }); s += line(x0 + 373, y0 + h - 57, x0 + 387, y0 + h - 57, { stroke: INK2, width: 1.5 });
    s += northArrow(x0 + w - 30, y0 + 46);
    // the leg: centred in open water; scaled down only if it would not fit
    const maxLen = 240, lenPx = Math.min(dist * pxLat, maxLen);
    const cx = x0 + w / 2, cy = y0 + 125, [ux, uy] = dirv(course), nx = -uy, ny = ux;   // n = to the right of the course
    const sx = cx - ux * lenPx / 2, sy = cy - uy * lenPx / 2, ex = cx + ux * lenPx / 2, ey = cy + uy * lenPx / 2;
    s += line(sx, sy, ex, ey, { width: 2.4 });
    s += head(ex - ux * 2, ey - uy * 2, course, 11);
    s += fixMark(r1(sx), r1(sy));
    s += `<circle cx="${r1(ex)}" cy="${r1(ey)}" r="6" fill="${PAPER}" stroke="${INK}" stroke-width="1.8" stroke-dasharray="3 2"/>`;
    const left = ux >= 0;   // heading rightwards: fix label to the left of the fix, DR label to the right of the DR
    s += T(left ? sx - 12 : sx + 12, sy, `Fix ${start}`, { size: 12, weight: 700, anchor: left ? 'end' : 'start' });
    s += T(left ? ex + 12 : ex - 12, ey, `DR ${endT}`, { size: 12, weight: 700, anchor: left ? 'start' : 'end' });
    const mx = (sx + ex) / 2, my = (sy + ey) / 2;
    const lx = mx - nx * 34, ly = my - ny * 34;     // label box on the left of the course line
    s += `<rect x="${r1(lx - 66)}" y="${r1(ly - 22)}" width="132" height="44" rx="5" fill="${PAPER}" stroke="${LINE}"/>`;
    s += T(lx, ly - 10, `${deg3(course)} T   ${num(speed)} kn`, { size: 13, weight: 700 });
    s += T(lx, ly + 10, `${num(dist)} NM in ${num(minutes)} min`, { size: 13, weight: 700, fill: MAGENTA });
    s += dividers(sx, sy, ex, ey, { height: 40 });   // hinge on the right of the course line
    // the dividers' opening moved straight across to the latitude scale, level with the leg
    const bxs = x0 - band / 2, dy1 = cy - lenPx / 2, dy2 = cy + lenPx / 2;
    s += arrow(mx + nx * 40 - 20, my + ny * 40, bxs + 12, cy, { stroke: MAGENTA, width: 1.2, dash: '5 3' });
    s += dividers(bxs, dy1, bxs, dy2, { height: 46, stroke: MAGENTA });
    s += T(bxs - 54, cy - 8, `${num(dist)}′ of latitude`, { size: 12, weight: 700, fill: MAGENTA, anchor: 'end' });
    s += T(bxs - 54, cy + 8, `= ${num(dist)} NM`, { size: 12, weight: 700, fill: MAGENTA, anchor: 'end' });
    // caption
    s += T(W / 2, H - 66, `From the fix at ${start} steer true ${deg3(course)} at ${num(speed)} kn; after ${num(minutes)} min (${num(minutes / 60)} h) you have run ${num(speed)} × ${num(minutes / 60)} = ${num(dist)} NM.`, { size: 12 });
    s += T(W / 2, H - 46, `Dead reckoning (DR) at ${endT}: last fix + true course + distance run. Distance is read on the latitude scale (1′ = 1 NM).`, { size: 11, fill: INK2 });
    s += T(W / 2, H - 26, 'The chart gives the true course; steer the compass course after allowing for variation and deviation.', { size: 11, fill: INK2 });
    s += T(W / 2, H - 8, 'Fix = dot in a circle. DR = dashed circle. Example chart excerpt, not a real chart.', { size: 11, fill: MUTED });
    return S.svg(W, H, s, { label: `A plotted leg on a chart excerpt: fix at ${start}, true course ${deg3(course)}, ${num(speed)} knots for ${num(minutes)} minutes gives a dead-reckoning position ${num(dist)} nautical miles along the line at ${endT}` });
  }

  /* Disagreements noted: ILLUSTRATIONS.md gives the rose annotation as "Var 3°E (2026)"; the verified
     sheet (Spec 1 / F76) uses the chart form "4° E 2020 (8'W)", which is what is drawn (opts.variation,
     opts.year and opts.change let a lesson show other values). Colours: the sheet lists flat hex colours;
     the library rule is to use BOAT_SVG.COLORS and theme variables, so those are used instead. */

  Object.assign(S, { compassRose, courseTriangle, bearingFix, latitudeScale, std, plotExample });

  const G = S.gallery;
  G.push({ name: 'compassRose 4E 2020 (8W)', svg: () => compassRose({ variation: 4 }) });
  G.push({ name: 'compassRose 11E Tromso', svg: () => compassRose({ variation: 11, year: 2025, change: "12'E" }) });
  G.push({ name: 'compassRose 4W example', svg: () => compassRose({ variation: -4, change: "8'E" }) });
  G.push({ name: 'courseTriangle compass359 var4E dev4E', svg: () => courseTriangle({ compass: 359, variation: 4, deviation: 4 }) });
  G.push({ name: 'courseTriangle true146 var4W dev2E', svg: () => courseTriangle({ true: 146, variation: -4, deviation: 2 }) });
  G.push({ name: 'courseTriangle true90 var3E dev2W', svg: () => courseTriangle({ true: 90, variation: 3, deviation: -2 }) });
  G.push({ name: 'bearingFix three', svg: () => bearingFix({ bearings: [40, 110, 180] }) });
  G.push({ name: 'bearingFix cockedHat', svg: () => bearingFix({ bearings: [40, 110, 180], cockedHat: true }) });
  G.push({ name: 'bearingFix two', svg: () => bearingFix({ bearings: [40, 130] }) });
  G.push({ name: 'latitudeScale distance', svg: () => latitudeScale() });
  G.push({ name: 'latitudeScale position', svg: () => latitudeScale({ position: true }) });
  G.push({ name: 'std 12kn 40min', svg: () => std({ speed: 12, minutes: 40 }) });
  G.push({ name: 'std 15NM 10kn', svg: () => std({ distance: 15, speed: 10 }) });
  G.push({ name: 'std 4.5NM 27min', svg: () => std({ distance: 4.5, minutes: 27 }) });
  G.push({ name: 'plotExample 090 8kn 45min', svg: () => plotExample() });
  G.push({ name: 'plotExample 045 10kn 30min', svg: () => plotExample({ course: 45, speed: 10, minutes: 30, start: '13:10' }) });
})();
