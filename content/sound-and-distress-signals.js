/* Skipper Prep — topic 4: Sound signals, radio and distress.
   Facts: scratchpad/facts/sound-and-distress-signals.md (verified 2026-10-03 against the Norwegian Maritime
   Authority's official English translation of the Rules of the Road (Rules 32-37, Annex III, Annex IV, national
   Rule 41), Lovdata, the IMO COLREG consolidated text, the NMA exam curriculum, the Joint Rescue Coordination
   Centre's coast-radio page, the NMA radio pages, ITU Radio Regulations Art. 32-33 and Rec. ITU-R M.493-14).
   Fact ids (F1...F99), trap ids (T1...T22) and illustration ids (I1...I12) in comments refer to that sheet.
   Claims graded "low" in the sheet (coast-station MMSIs, Rules 49/53, exact question count) are not used. */
(function () {
  'use strict';
  const S = BOAT.svg, C = S.COLORS, T = S.text;
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)', PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', SHALLOW = 'var(--shallow)';
  const OK = 'var(--ok)', OKBG = 'var(--ok-bg)', BAD = 'var(--bad)', BADBG = 'var(--bad-bg)', WARN = 'var(--warn)', WARNBG = 'var(--warn-bg)', SEA = 'var(--sea)', ACC = 'var(--accent)';
  const BRONZE = '#9a6b2f', FLAGBLUE = '#0033a0', SKIN = '#e8c39e', FLAME1 = '#f2771a', FLAME2 = '#f5c400';

  // ---------- small drawing helpers ----------
  function rect(x, y, w, h, fill, stroke, o) {
    o = o || {};
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 6 : o.rx}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${o.sw || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`;
  }
  function line(x1, y1, x2, y2, stroke, o) {
    o = o || {};
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke || INK}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>`;
  }
  function circ(cx, cy, r, fill, stroke, sw) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${sw || 1.2}"/>`; }
  function head(x, y, ang, fill, L) {
    L = L || 9;
    const bx = x - L * Math.cos(ang), by = y - L * Math.sin(ang);
    const px = -Math.sin(ang) * L * 0.45, py = Math.cos(ang) * L * 0.45;
    return `<polygon points="${x.toFixed(1)},${y.toFixed(1)} ${(bx + px).toFixed(1)},${(by + py).toFixed(1)} ${(bx - px).toFixed(1)},${(by - py).toFixed(1)}" fill="${fill}"/>`;
  }
  function arrow(pts, stroke, o) {
    o = o || {}; stroke = stroke || INK;
    const n = pts.length, [x1, y1] = pts[n - 2], [x2, y2] = pts[n - 1];
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ex = x2 - 7 * Math.cos(ang), ey = y2 - 7 * Math.sin(ang);
    const body = pts.slice(0, n - 1).concat([[ex, ey]]).map(p => p.map(v => (+v).toFixed(1)).join(',')).join(' ');
    return `<polyline points="${body}" fill="none" stroke="${stroke}" stroke-width="${o.sw || 1.8}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>` + head(x2, y2, ang, stroke, o.head || 9);
  }
  function lines(x, y, arr, o) { o = o || {}; const lh = o.lh || 15; return arr.map((s, i) => T(x, y + i * lh, s, o)).join(''); }
  /* Blast bars on a time axis: '.' = 1 unit (about 1 s), '-' = 5 units (4-6 s), gap between blasts = o.gap units (default 1).
     Follows the sheet's illustration convention: never draw a prolonged blast narrower than five short ones. */
  function bars(x, y, pattern, o) {
    o = o || {};
    const U = o.unit || 14, h = o.h || 20, gap = o.gap == null ? 1 : o.gap, fill = o.fill || SEA;
    let s = '', t = 0;
    for (const ch of pattern.replace(/\s+/g, '')) {
      const d = ch === '.' ? 1 : 5;
      s += rect(x + t * U, y, d * U - 2, h, fill, 'none', { rx: 3 });
      if (o.labels) s += T(x + (t + d / 2) * U - 1, y - 8, d === 1 ? '≈1 s' : '4–6 s', { size: 9, fill: INK2 });
      t += d + gap;
    }
    return { svg: s, w: (t - gap) * U };
  }
  /* plan view boat, bow up, centred at (cx,cy) */
  function boatPlan(cx, cy, len, beam, fill) {
    const p = `M${cx},${cy - len / 2} C${cx + beam * 0.6},${cy - len / 2 + len * 0.3} ${cx + beam / 2},${cy + len * 0.15} ${cx + beam / 2},${cy + len / 2} L${cx - beam / 2},${cy + len / 2} C${cx - beam / 2},${cy + len * 0.15} ${cx - beam * 0.6},${cy - len / 2 + len * 0.3} ${cx},${cy - len / 2} Z`;
    return `<path d="${p}" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  /* side view hull, stern at x, waterline at y, bow to the right */
  function hull(x, y, len, h, fill) {
    return `<path d="M${x},${y - h} L${x + len * 0.78},${y - h} Q${x + len},${y - h * 1.15} ${x + len},${y - h * 0.15} L${x + len * 0.94},${y + h * 0.35} L${x + len * 0.04},${y + h * 0.35} Z" fill="${fill}" stroke="${INK}" stroke-width="1.1"/>`;
  }
  function flames(x, y, sc) {
    sc = sc || 1;
    return `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0,0 C-14,-10 -10,-28 -2,-34 C-2,-24 4,-22 4,-30 C12,-22 14,-8 0,0 Z" fill="${FLAME1}"/><path d="M0,-2 C-6,-8 -5,-18 -1,-22 C-1,-16 3,-15 3,-20 C7,-14 7,-6 0,-2 Z" fill="${FLAME2}"/></g>`;
  }
  function bellIcon(x, y, sc, motion) {
    sc = sc || 1;
    let s = `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M-10,8 L10,8 L10,4 Q9,-8 0,-11 Q-9,-8 -10,4 Z" fill="${BRONZE}" stroke="${INK}" stroke-width="0.8"/><circle cx="0" cy="-12" r="2" fill="${INK}"/><circle cx="0" cy="11" r="2.4" fill="${INK2}"/></g>`;
    if (motion) s += line(x - 16 * sc, y - 6 * sc, x - 20 * sc, y - 10 * sc, INK2, { sw: 1.4 }) + line(x + 16 * sc, y - 6 * sc, x + 20 * sc, y - 10 * sc, INK2, { sw: 1.4 }) + line(x - 17 * sc, y + 2 * sc, x - 22 * sc, y + 2 * sc, INK2, { sw: 1.4 }) + line(x + 17 * sc, y + 2 * sc, x + 22 * sc, y + 2 * sc, INK2, { sw: 1.4 });
    return s;
  }
  function star(cx, cy, r, fill) {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`); }
    return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
  }
  /* Signal flag N: 4 x 4 chequerboard of blue and white, top-left square blue (F73) */
  function flagN(x, y, w, h) {
    let s = rect(x, y, w, h, C.white, INK, { rx: 0, sw: 0.8 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if ((r + c) % 2 === 0) s += rect(x + c * w / 4, y + r * h / 4, w / 4, h / 4, FLAGBLUE, 'none', { rx: 0 });
    return s;
  }
  /* Signal flag C: five horizontal stripes blue, white, red, white, blue (F73) */
  function flagC(x, y, w, h) {
    const cols = [FLAGBLUE, C.white, C.red, C.white, FLAGBLUE];
    return cols.map((f, i) => rect(x, y + i * h / 5, w, h / 5, f, 'none', { rx: 0 })).join('') + rect(x, y, w, h, 'none', INK, { rx: 0, sw: 0.8 });
  }
  function handsetIcon(x, y, sc, ch) {
    sc = sc || 1;
    return `<g transform="translate(${x} ${y}) scale(${sc})">` + rect(-16, -28, 32, 56, INK2, INK, { rx: 5 }) + rect(-11, -22, 22, 16, '#1e2a16', 'none', { rx: 2 }) + T(0, -14, ch || '16', { size: 11, weight: 800, fill: '#9df26a', family: 'var(--font-mono)' }) + circ(0, 8, 6, C.red, INK, 0.8) + line(12, -28, 12, -44, INK, { sw: 2.5 }) + `</g>`;
  }

  // ---------- I1 blast legend (F2, F3) ----------
  function blastLegend() {
    const W = 560, H = 210, x0 = 40, U = 28;
    let s = T(W / 2, 22, 'The two building blocks of every whistle signal (Rule 32)', { size: 14, weight: 700 });
    s += rect(x0, 50, U - 2, 24, SEA, 'none', { rx: 3 }) + T(x0 + U / 2 - 1, 42, '≈1 s', { size: 9, fill: INK2 });
    s += T(x0 + 6 * U + 16, 62, 'Short blast: about 1 second. Written', { size: 13, weight: 600, anchor: 'start' }) + circ(x0 + 6 * U + 262, 62, 4, INK);
    s += rect(x0, 100, 5 * U - 2, 24, SEA, 'none', { rx: 3 }) + T(x0 + 2.5 * U - 1, 92, '4–6 s', { size: 9, fill: INK2 });
    s += T(x0 + 6 * U + 16, 112, 'Prolonged blast: 4 to 6 seconds. Written', { size: 13, weight: 600, anchor: 'start' }) + rect(x0 + 6 * U + 282, 109, 22, 5, INK, 'none', { rx: 1 });
    const ry = 150;
    s += line(x0, ry, x0 + 6 * U, ry, INK2, { sw: 1 });
    for (let t = 0; t <= 6; t++) s += line(x0 + t * U, ry, x0 + t * U, ry + 6, INK2, { sw: 1 }) + T(x0 + t * U, ry + 16, String(t), { size: 10, fill: MUTED });
    s += T(x0 + 6 * U + 16, ry + 16, 'seconds', { size: 10, fill: MUTED, anchor: 'start' });
    s += T(W / 2, 194, 'Five short blasts fit inside one prolonged blast. Gaps between blasts of one signal are about 1 s.', { size: 10.5, fill: INK2 });
    return S.svg(W, H, s, { label: 'Short blast about one second and prolonged blast four to six seconds, drawn to scale over a six-second ruler' });
  }

  // ---------- I2 manoeuvring signals card (F15-F20) ----------
  function manoeuvringCard() {
    const W = 640, H = 364;
    let s = T(W / 2, 20, 'Manoeuvring signals, Rule 34(a): what a power-driven vessel tells you', { size: 14, weight: 700 });
    const rows = [
      { pat: '.', main: 'I am altering my course to STARBOARD', sub: 'one short blast (one flash)', arrow: cy => arrow([[60, cy - 22], [62, cy - 32], [72, cy - 38], [92, cy - 40]], ACC, { sw: 2.2 }) },
      { pat: '..', main: 'I am altering my course to PORT', sub: 'two short blasts (two flashes)', arrow: cy => arrow([[60, cy - 22], [58, cy - 32], [48, cy - 38], [28, cy - 40]], ACC, { sw: 2.2 }) },
      { pat: '...', main: 'I am operating ASTERN propulsion', sub: 'three short blasts (three flashes); engine in reverse, the boat may still move ahead', arrow: cy => arrow([[60, cy + 22], [60, cy + 41]], ACC, { sw: 2.2 }) },
    ];
    rows.forEach((r, i) => {
      const cy = 92 + i * 92;
      s += rect(14, cy - 44, W - 28, 88, PAPER, LINE);
      s += boatPlan(60, cy, 40, 20, 'var(--shallow-2)') + T(60, cy + 6, 'bow', { size: 7, fill: MUTED }) + T(60, cy - 8, '▲', { size: 7, fill: MUTED });
      s += r.arrow(cy);
      const b = bars(136, cy - 10, r.pat, { unit: 16, h: 20, labels: true });
      s += b.svg;
      s += T(252, cy - 6, r.main, { size: 13.5, weight: 700, anchor: 'start' });
      s += T(252, cy + 14, r.sub, { size: 10.5, fill: INK2, anchor: 'start' });
    });
    s += lines(W / 2, 336, ['Power-driven vessels only, and only when the vessels are IN SIGHT of one another.', 'Optional light supplement: 1 / 2 / 3 flashes of an all-round WHITE light (flash ≈1 s, gap ≈1 s, at least 10 s between signals).'], { size: 10, fill: INK2, lh: 13 });
    return S.svg(W, H, s, { label: 'One short blast: altering course to starboard (right, bow up); two short: to port; three short: astern propulsion' });
  }

  // ---------- I6 restricted-visibility table (F37-F48) ----------
  function fogTable() {
    const W = 640, H = 470;
    let s = T(W / 2, 20, 'Sound signals in restricted visibility (Rule 35): who sounds what, and how often', { size: 14, weight: 700 });
    const hullCol = 'var(--shallow-2)';
    const rows = [
      { icon: (x, y) => hull(x, y, 52, 11, hullCol) + rect(x + 20, y - 19, 16, 9, hullCol, INK, { rx: 2, sw: 0.9 }) + line(x - 4, y + 3, x - 18, y + 3, SEA, { sw: 1.5 }) + line(x - 2, y + 7, x - 22, y + 7, SEA, { sw: 1.5 }), pat: '-', every: 'every ≤ 2 min', main: ['Power-driven vessel MAKING WAY'], sub: 'Rule 35(a)' },
      { icon: (x, y) => hull(x, y, 52, 11, hullCol) + rect(x + 20, y - 19, 16, 9, hullCol, INK, { rx: 2, sw: 0.9 }) + T(x + 26, y + 14, 'stopped', { size: 8, fill: MUTED }), pat: '--', gap: 2, every: 'every ≤ 2 min', main: ['Power-driven vessel underway', 'but STOPPED, making no way'], sub: 'Rule 35(b): two prolonged, about 2 s apart' },
      { icon: (x, y) => hull(x, y, 50, 9, hullCol) + `<polygon points="${x + 26},${y - 9} ${x + 26},${y - 40} ${x + 46},${y - 10}" fill="${C.white}" stroke="${INK}" stroke-width="1"/>` + line(x + 26, y - 9, x + 26, y - 42, INK, { sw: 1.4 }), pat: '-..', every: 'every ≤ 2 min', main: ['SAILING vessel; also fishing, NUC,', 'RAM, constrained by draught, towing'], sub: 'Rule 35(c)' },
      { icon: (x, y) => hull(x, y, 24, 8, hullCol) + hull(x + 36, y, 22, 9, hullCol) + rect(x + 44, y - 17, 10, 8, hullCol, INK, { rx: 2, sw: 0.9 }) + line(x + 24, y - 5, x + 36, y - 5, INK, { sw: 1.2, dash: '2 2' }), pat: '-...', every: 'every ≤ 2 min', main: ['Manned vessel being TOWED', '(the last vessel of the tow)'], sub: 'Rule 35(e)' },
      { icon: (x, y) => hull(x, y, 50, 10, hullCol) + line(x + 12, y - 10, x + 2, y + 16, INK, { sw: 1.3 }) + circ(x + 12, y - 12, 2.2, 'none', INK, 1.2) + `<path d="M${x - 6},${y + 10} Q${x + 2},${y + 20} ${x + 10},${y + 10}" fill="none" stroke="${INK}" stroke-width="1.3"/>`, bell: 'rapid ringing ≈5 s', every: 'every ≤ 1 MIN', warn: true, main: ['Vessel at ANCHOR (bell)'], sub: 'Rule 35(g); may add short-prolonged-short' },
      { icon: (x, y) => `<path d="M${x - 2},${y + 10} L${x + 20},${y - 2} L${x + 44},${y + 10} Z" fill="${MUTED}"/>` + `<g transform="rotate(-14 ${x + 26} ${y})">${hull(x, y - 2, 50, 10, hullCol)}</g>`, bell: '3 strokes | ≈5 s ringing | 3 strokes', every: 'every ≤ 1 MIN', warn: true, main: ['Vessel AGROUND (bell)'], sub: 'Rule 35(h)' },
    ];
    rows.forEach((r, i) => {
      const cy = 72 + i * 60;
      s += rect(12, cy - 27, W - 24, 56, PAPER, LINE);
      s += r.icon(42, cy + 4);
      if (r.pat) {
        const b = bars(112, cy - 10, r.pat, { unit: 13, h: 20, gap: r.gap || 1 });
        s += b.svg;
        if (r.gap === 2) s += T(112 + 6 * 13, cy, '≈2 s', { size: 8, fill: MUTED });
      } else if (i === 4) {
        s += bellIcon(124, cy, 1, true) + rect(146, cy - 9, 80, 18, BRONZE, 'none', { rx: 3 }) + T(186, cy, r.bell, { size: 8.5, fill: C.white, weight: 700 });
      } else {
        s += bellIcon(124, cy, 1, false);
        [0, 1, 2].forEach(k => { s += circ(150 + k * 8, cy, 2.6, BRONZE); s += circ(246 + k * 8, cy, 2.6, BRONZE); });
        s += rect(178, cy - 9, 60, 18, BRONZE, 'none', { rx: 3 }) + T(208, cy, '≈5 s', { size: 8.5, fill: C.white, weight: 700 });
        s += T(206, cy + 18, '3 strokes before and after', { size: 8, fill: MUTED });
      }
      s += rect(296, cy - 11, 92, 22, r.warn ? WARNBG : PAPER2, r.warn ? WARN : LINE, { rx: 11 }) + T(342, cy, r.every, { size: 10, weight: 800, fill: r.warn ? WARN : INK2 });
      s += lines(402, cy - (r.main.length > 1 ? 13 : 6), r.main, { size: 10.5, weight: 700, anchor: 'start', lh: 13 });
      s += T(402, cy + (r.main.length > 1 ? 14 : 10), r.sub, { size: 9, fill: INK2, anchor: 'start' });
    });
    s += rect(12, 418, W - 24, 42, OKBG, OK) + lines(W / 2, 432, ['Boats under 12 m need not give these formal signals,', 'but must make some efficient sound signal at least every 2 minutes (Rule 35(j)).'], { size: 10, weight: 600, fill: INK, lh: 14 });
    return S.svg(W, H, s, { label: 'Rule 35 fog signals: one prolonged making way, two prolonged stopped, one prolonged two short for sailing and hampered vessels, one prolonged three short towed, bell at anchor every minute, bell with three strokes aground' });
  }

  // ---------- I8 distress signals gallery (F56-F72) ----------
  function distressGallery(o) {
    o = o || {};
    const W = 640, H = 436, tw = 122, th = 108, x0 = 8, y0 = 32;
    let s = T(W / 2, 18, o.title || 'The distress signals of Annex IV: each one alone means "I am in distress and need assistance"', { size: 13, weight: 700 });
    const tiles = [
      { cap: ['Red rocket', 'parachute flare'], draw: (cx, ty) => line(cx - 22, ty + 66, cx + 2, ty + 30, INK2, { sw: 1.4, dash: '3 3' }) + `<path d="M${cx - 6},${ty + 24} Q${cx + 8},${ty + 4} ${cx + 22},${ty + 24}" fill="none" stroke="${INK}" stroke-width="1.2"/>` + line(cx - 6, ty + 24, cx + 8, ty + 36, INK, { sw: 0.8 }) + line(cx + 22, ty + 24, cx + 8, ty + 36, INK, { sw: 0.8 }) + star(cx + 8, ty + 38, 7, C.red) },
      { cap: ['Red hand flare'], draw: (cx, ty) => rect(cx - 5, ty + 36, 10, 30, INK2, 'none', { rx: 2 }) + circ(cx, ty + 68, 6, SKIN, INK, 0.8) + `<ellipse cx="${cx}" cy="${ty + 26}" rx="9" ry="13" fill="${C.red}"/>` + `<ellipse cx="${cx}" cy="${ty + 29}" rx="4" ry="7" fill="${FLAME2}"/>` },
      { cap: ['Orange smoke'], draw: (cx, ty) => rect(cx - 8, ty + 50, 16, 22, INK2, 'none', { rx: 2 }) + circ(cx + 2, ty + 42, 7, C.orange) + circ(cx + 12, ty + 32, 9, C.orange) + circ(cx + 24, ty + 20, 11, C.orange) },
      { cap: ['Rockets or shells', 'throwing red stars'], draw: (cx, ty) => [[-22, 40], [0, 24], [22, 44]].map(([dx, dy]) => line(cx + dx, ty + 70, cx + dx, ty + dy + 10, INK2, { sw: 1, dash: '2 2' }) + star(cx + dx, ty + dy, 7, C.red)).join('') },
      { cap: ['SOS by any method', '(light, sound)'], draw: (cx, ty) => T(cx, ty + 36, '· · ·  – – –  · · ·', { size: 15, weight: 800 }) + rect(cx - 10, ty + 50, 20, 22, INK2, 'none', { rx: 3 }) + `<polygon points="${cx - 10},${ty + 50} ${cx + 10},${ty + 50} ${cx + 16},${ty + 44} ${cx - 16},${ty + 44}" fill="${FLAME2}"/>` },
      { cap: ['Spoken word MAYDAY', 'on VHF channel 16'], draw: (cx, ty) => handsetIcon(cx - 20, ty + 46, 0.85, '16') + rect(cx + 2, ty + 20, 50, 18, PAPER, INK, { rx: 4 }) + T(cx + 27, ty + 29, 'MAYDAY', { size: 9, weight: 800, fill: C.red }) },
      { cap: ['DSC distress alert', 'on VHF channel 70'], draw: (cx, ty) => rect(cx - 26, ty + 20, 52, 50, INK2, INK, { rx: 5 }) + rect(cx - 20, ty + 26, 40, 16, '#1e2a16', 'none', { rx: 2 }) + T(cx, ty + 34, 'DSC  70', { size: 9, weight: 800, fill: '#9df26a', family: 'var(--font-mono)' }) + circ(cx, ty + 56, 8, C.red, INK, 0.8) + T(cx, ty + 56.5, 'SOS', { size: 5.5, weight: 800, fill: C.white }) },
      { cap: ['Flags N over C'], draw: (cx, ty) => line(cx - 24, ty + 12, cx - 24, ty + 74, INK, { sw: 1.5 }) + flagN(cx - 22, ty + 14, 42, 26) + flagC(cx - 22, ty + 44, 42, 26) + T(cx + 28, ty + 27, 'N', { size: 10, weight: 700 }) + T(cx + 28, ty + 57, 'C', { size: 10, weight: 700 }) },
      { cap: ['Square flag with a ball', 'above or below it'], draw: (cx, ty) => line(cx - 18, ty + 10, cx - 18, ty + 74, INK, { sw: 1.5 }) + circ(cx - 4, ty + 22, 9, C.black) + rect(cx - 16, ty + 36, 32, 32, C.red, INK, { rx: 0, sw: 0.8 }) },
      { cap: ['Slowly, repeatedly raising and', 'lowering outstretched arms'], draw: (cx, ty) => circ(cx, ty + 22, 7, SKIN, INK, 0.8) + line(cx, ty + 29, cx, ty + 56, INK2, { sw: 4 }) + line(cx - 22, ty + 36, cx + 22, ty + 36, INK2, { sw: 3.5 }) + line(cx, ty + 56, cx - 6, ty + 74, INK2, { sw: 3 }) + line(cx, ty + 56, cx + 6, ty + 74, INK2, { sw: 3 }) + arrow([[cx - 32, ty + 44], [cx - 32, ty + 24]], ACC, { sw: 1.4, head: 6 }) + arrow([[cx + 32, ty + 24], [cx + 32, ty + 44]], ACC, { sw: 1.4, head: 6 }) },
      { cap: ['Flames on the vessel', '(e.g. burning oil barrel)'], draw: (cx, ty) => hull(cx - 28, ty + 62, 56, 12, 'var(--shallow-2)') + rect(cx - 6, ty + 40, 12, 12, INK2, 'none', { rx: 1 }) + flames(cx, ty + 42, 0.75) },
      { cap: ['Gun or explosive signal', 'at intervals of about 1 min'], draw: (cx, ty) => `<g transform="rotate(-25 ${cx} ${ty + 54})">${rect(cx - 10, ty + 48, 40, 12, INK2, INK, { rx: 4 })}</g>` + circ(cx - 6, ty + 62, 9, INK2, INK, 1) + circ(cx - 6, ty + 62, 3, PAPER) + star(cx + 30, ty + 30, 8, C.orange) + T(cx, ty + 20, 'every ≈1 min', { size: 8.5, fill: INK2 }) },
      { cap: ['Continuous sounding of', 'the fog horn'], draw: (cx, ty) => `<polygon points="${cx - 36},${ty + 40} ${cx - 16},${ty + 36} ${cx - 2},${ty + 24} ${cx - 2},${ty + 56} ${cx - 16},${ty + 44} ${cx - 36},${ty + 40}" fill="${INK2}"/>` + rect(cx + 4, ty + 32, 44, 16, SEA, 'none', { rx: 3 }) + T(cx + 26, ty + 62, 'without stopping', { size: 8.5, fill: INK2 }) },
      { cap: ['EPIRB satellite', 'distress beacon'], draw: (cx, ty) => rect(cx - 10, ty + 38, 20, 34, C.yellow, INK, { rx: 4, sw: 0.9 }) + line(cx + 6, ty + 38, cx + 6, ty + 16, INK, { sw: 2 }) + `<path d="M${cx + 12},${ty + 24} Q${cx + 22},${ty + 20} ${cx + 24},${ty + 10}" fill="none" stroke="${SEA}" stroke-width="1.6"/><path d="M${cx + 14},${ty + 32} Q${cx + 30},${ty + 26} ${cx + 34},${ty + 10}" fill="none" stroke="${SEA}" stroke-width="1.6"/>` },
      { cap: ['Orange canvas, black square', 'and circle; dye marker'], draw: (cx, ty) => rect(cx - 30, ty + 22, 60, 36, C.orange, INK, { rx: 2, sw: 0.8 }) + rect(cx - 22, ty + 30, 20, 20, C.black, 'none', { rx: 0 }) + circ(cx + 12, ty + 40, 10, C.black) + `<ellipse cx="${cx}" cy="${ty + 68}" rx="34" ry="6" fill="#53c48a" opacity="0.8"/>` },
    ];
    tiles.forEach((t, i) => {
      const col = i % 5, row = Math.floor(i / 5), x = x0 + col * (tw + 4), y = y0 + row * (th + 4);
      s += rect(x, y, tw, th, PAPER, LINE);
      s += circ(x + 11, y + 11, 8, ACC) + T(x + 11, y + 11.5, String(i + 1), { size: 9, weight: 800, fill: 'var(--accent-ink)' });
      s += t.draw(x + tw / 2, y + 4);
      s += lines(x + tw / 2, y + th - (t.cap.length > 1 ? 20 : 12), t.cap, { size: 8.6, lh: 10.5, fill: INK, weight: 600 });
    });
    s += rect(x0, 374, W - 16, 28, BADBG, BAD, { sw: 1.5 }) + T(W / 2, 388, 'Using or showing any of these when NOT in distress is PROHIBITED (Annex IV, paragraph 2).', { size: 11, weight: 700, fill: BAD });
    s += T(W / 2, 420, 'Also distress signals: a ship-to-shore satellite alert (Inmarsat) and the radar transponder SART. DSC uses MF/HF frequencies too (e.g. 2187.5 kHz).', { size: 9, fill: MUTED });
    return S.svg(W, H, s, { label: 'Fifteen distress signals from Annex IV: red flares, orange smoke, red stars, SOS, Mayday, DSC, flags N over C, square flag and ball, arm signal, flames, gun, continuous horn, EPIRB, orange canvas' });
  }

  // ---------- I9 "not distress" strip (F53, F74) ----------
  function notDistress() {
    const W = 560, H = 190;
    let s = T(W / 2, 20, 'Common exam traps: these are NOT distress signals', { size: 14, weight: 700 });
    const tiles = [
      { cap: ['WHITE flare or white light', 'attention / illumination only'], draw: (cx, cy) => rect(cx - 5, cy - 4, 10, 30, INK2, 'none', { rx: 2 }) + `<ellipse cx="${cx}" cy="${cy - 14}" rx="9" ry="13" fill="${C.white}" stroke="${INK}" stroke-width="0.8"/>` },
      { cap: ['GREEN flare', 'not listed in Annex IV'], draw: (cx, cy) => rect(cx - 5, cy - 4, 10, 30, INK2, 'none', { rx: 2 }) + `<ellipse cx="${cx}" cy="${cy - 14}" rx="9" ry="13" fill="${C.green}"/>` },
      { cap: ['STROBE light', 'to be avoided (Rule 36)'], draw: (cx, cy) => circ(cx, cy, 10, C.white, INK, 0.8) + [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = S.deg(a); return line(cx + 14 * Math.sin(r), cy - 14 * Math.cos(r), cx + 22 * Math.sin(r), cy - 22 * Math.cos(r), INK2, { sw: 1.4 }); }).join('') },
    ];
    tiles.forEach((t, i) => {
      const x = 20 + i * 176, y = 36, w = 164, h = 130;
      s += rect(x, y, w, h, PAPER2, LINE);
      s += t.draw(x + w / 2, y + 48);
      s += lines(x + w / 2, y + 96, t.cap, { size: 10, lh: 13, fill: INK2 });
      s += line(x + 40, y + 82, x + w - 40, y + 12, BAD, { sw: 3 });
    });
    s += T(W / 2, 180, 'Distress pyrotechnics are RED (flares, stars) or ORANGE (smoke).', { size: 10.5, weight: 600, fill: INK2 });
    return S.svg(W, H, s, { label: 'White flare, green flare and strobe light are not distress signals' });
  }

  // ---------- flags N over C, standalone (F61, F73) ----------
  function flagsNC() {
    const W = 300, H = 250;
    let s = line(60, 16, 60, 236, INK, { sw: 2.5 });
    s += flagN(64, 26, 150, 90) + flagC(64, 130, 150, 90);
    s += T(246, 71, 'N', { size: 22, weight: 800 }) + T(246, 175, 'C', { size: 22, weight: 800 });
    return S.svg(W, H, s, { label: 'Two signal flags on a halyard: a blue and white chequered flag above a flag with blue, white, red, white, blue stripes' });
  }

  // ---------- VHF handset with channel display and DISTRESS button (F75-F78) ----------
  function radioPanel(ch, o) {
    o = o || {};
    const W = 340, H = 300, cx = 120;
    let s = line(cx + 36, 60, cx + 36, 14, INK, { sw: 4 });
    s += rect(cx - 56, 60, 112, 220, INK2, INK, { rx: 10 });
    s += rect(cx - 44, 74, 88, 56, '#1e2a16', 'none', { rx: 4 });
    s += T(cx, 92, 'CH', { size: 11, weight: 700, fill: '#9df26a', family: 'var(--font-mono)' });
    s += T(cx, 116, String(ch), { size: 28, weight: 800, fill: '#9df26a', family: 'var(--font-mono)' });
    // keypad
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) s += rect(cx - 40 + c * 28, 144 + r * 24, 22, 16, '#55606c', 'none', { rx: 3 });
    // distress button with lid
    s += rect(cx - 30, 222, 60, 44, '#55606c', 'none', { rx: 6 }) + circ(cx, 244, 14, C.red, INK, 1) + T(cx, 244.5, 'DISTRESS', { size: 5.5, weight: 800, fill: C.white });
    s += rect(cx - 30, 222, 60, 44, 'none', C.white, { rx: 6, sw: 1, dash: '3 3' });
    // PTT
    s += rect(cx - 66, 120, 12, 44, '#55606c', INK, { rx: 3 }) + T(cx - 60, 142, 'PTT', { size: 6, weight: 700, fill: C.white });
    // labels
    s += arrow([[cx + 90, 100], [cx + 48, 100]], ACC, { sw: 1.6, head: 7 }) + lines(cx + 94, 94, o.chLabel || ['channel', 'selected'], { size: 10, fill: INK2, anchor: 'start', lh: 12 });
    s += arrow([[cx + 90, 244], [cx + 34, 244]], ACC, { sw: 1.6, head: 7 }) + lines(cx + 94, 232, ['red DISTRESS button', 'under a spring lid:', 'lift, press and hold'], { size: 10, fill: INK2, anchor: 'start', lh: 12 });
    return S.svg(W, H, s, { label: `A VHF handset showing channel ${ch}, with a red DISTRESS button under a protective lid` });
  }

  // ---------- I11 Mayday script card (F79-F84) ----------
  function maydayCard() {
    const W = 640, H = 392;
    let s = T(W / 2, 20, 'The distress call and message on VHF channel 16', { size: 14, weight: 700 });
    s += rect(12, 34, 404, 346, PAPER, BAD, { sw: 1.5 });
    s += rect(12, 34, 404, 26, BADBG, 'none', { rx: 6 }) + T(214, 47, 'MAYDAY: grave and imminent danger, immediate assistance required', { size: 10.5, weight: 700, fill: BAD });
    const steps = [
      ['1', 'MAYDAY, MAYDAY, MAYDAY', 'the distress signal, three times'],
      ['2', 'THIS IS  [boat name] x 3,  call sign,  MMSI', 'the distress call: who is calling'],
      ['3', 'MAYDAY  [boat name], call sign', 'the message starts, identity again'],
      ['4', 'POSITION', 'lat/long from the GPS, or bearing and distance from a landmark'],
      ['5', 'NATURE OF DISTRESS  [sinking, fire, man overboard ...]', ''],
      ['6', 'ASSISTANCE REQUIRED', ''],
      ['7', '[number] PERSONS ON BOARD', 'taught in Norway; not a separate ITU field'],
      ['8', 'OTHER INFORMATION  [boat description, liferaft, injuries]', ''],
      ['9', 'OVER', 'then release the button and listen'],
    ];
    steps.forEach((st, i) => {
      const y = 80 + i * 33;
      s += circ(30, y, 9, BAD) + T(30, y + 0.5, st[0], { size: 10, weight: 800, fill: C.white });
      s += T(46, y - (st[2] ? 5 : 0), st[1], { size: 11, weight: 700, anchor: 'start' });
      if (st[2]) s += T(46, y + 9, st[2], { size: 9, fill: MUTED, anchor: 'start' });
    });
    // side column
    s += rect(428, 34, 200, 160, WARNBG, WARN, { sw: 1.5 }) + T(528, 52, 'PAN PAN x 3', { size: 13, weight: 800, fill: WARN });
    s += lines(528, 74, ['Urgency: a very urgent message', 'about the safety of a vessel or', 'person, but NOT grave and', 'imminent danger.', '', 'Example: engine failure, drifting', 'slowly, nobody in danger yet.', 'Then "ALL STATIONS" x 3 (or the', 'coast radio station), THIS IS ...'], { size: 9.5, fill: INK, lh: 12.5 });
    s += rect(428, 206, 200, 112, OKBG, OK, { sw: 1.5 }) + T(528, 224, 'SECURITE x 3', { size: 13, weight: 800, fill: OK });
    s += lines(528, 246, ['Safety: a navigational or weather', 'warning, e.g. a drifting log or a', 'gale warning. The coast radio uses', 'it for Maritime Safety Information.'], { size: 9.5, fill: INK, lh: 12.5 });
    s += rect(428, 330, 200, 50, PAPER, LINE) + lines(528, 346, ['Priority: MAYDAY > PAN PAN >', 'SECURITE. Each marker is spoken', 'three times.'], { size: 9.5, fill: INK2, lh: 12.5 });
    return S.svg(W, H, s, { label: 'Mayday call and message in nine steps, with the urgency marker Pan Pan and the safety marker Securite' });
  }

  // ---------- I10 numbers card (F75, F76, F86-F91) ----------
  function numbersCard(o) {
    o = o || {};
    const W = 520, H = 392, px = 110, pw = 300;
    let s = rect(px, 10, pw, 372, INK2, INK, { rx: 22, sw: 1.5 });
    s += rect(px + 12, 30, pw - 24, 334, PAPER, 'none', { rx: 10 });
    s += rect(px + 12, 30, pw - 24, 60, BADBG, 'none', { rx: 10 }) + rect(px + 12, 70, pw - 24, 20, BADBG, 'none', { rx: 0 });
    s += T(px + pw / 2, 46, 'VHF channel 16', { size: 15, weight: 800, fill: BAD }) + T(px + pw / 2, 62, 'voice: distress, safety and calling', { size: 9.5, fill: INK });
    s += T(px + pw / 2, 80, 'DSC DISTRESS button: channel 70 (digital)', { size: 9.5, weight: 700, fill: INK });
    const rows = [
      ['120', 'Coast radio station, by mobile phone', BAD, o.hide === '120'],
      ['112', 'Police / general emergency (any mobile)', INK, false],
      ['113', 'Medical emergency', INK, false],
      ['110', 'Fire', INK, false],
    ];
    rows.forEach((r, i) => {
      const y = 112 + i * 46;
      s += rect(px + 20, y - 16, pw - 40, 38, PAPER2, LINE);
      s += T(px + 56, y + 3, r[3] ? '?' : r[0], { size: 20, weight: 800, fill: r[2], family: 'var(--font-mono)' });
      s += T(px + 92, y + 3, r[1], { size: 9.5, fill: INK, anchor: 'start', weight: 600 });
    });
    s += rect(px + 20, 282, pw - 40, 42, PAPER2, LINE, { dash: '3 3' }) + T(px + 56, 300, '02016', { size: 13, weight: 800, fill: MUTED, family: 'var(--font-mono)' }) + lines(px + 92, 296, ['Society for Sea Rescue assistance line', '(915 02016): engine trouble, towing.', 'Not an emergency number.'], { size: 8.5, fill: INK2, anchor: 'start', lh: 11 });
    s += lines(px + pw / 2, 338, ['Since 1 Jan 2026 the coast radio is run by', 'the Joint Rescue Coordination Centre.'], { size: 8.5, fill: MUTED, lh: 11 });
    s += circ(px + pw / 2, 372, 5, 'none', PAPER, 1.2);
    return S.svg(W, H, s, { label: 'Emergency numbers card: VHF channel 16, DSC channel 70, 120 coast radio, 112 police, 113 medical, 110 fire, 02016 assistance' });
  }

  /* picture question: a sound signal drawn with the shared helper but WITHOUT its meaning caption */
  const sig = pattern => S.soundSignal(pattern, { meaning: 'What does this signal mean?' });

  BOAT.register({
    id: 'sound-and-distress-signals',
    title: 'Sound signals, radio and distress',
    order: 4,
    examShare: 5,
    examWeight: 'about 3–6 of 50 questions, one of them in part 4',
    summary: 'How vessels talk to each other without radio: the whistle signals that announce a turn or a reversing engine, the doubt signal, the fog signals that tell you what kind of vessel is hidden in the murk, and the official distress signals of Annex IV. Then the radio side: VHF channel 16, the DSC distress button on channel 70, the Mayday call, and the coast radio telephone number 120. The last two numbers are a "particularly important topic" (1.4.6): more than two errors in that part of the exam means a fail, whatever your total.',
    sections: [
      // 1 ------------------------------------------------------------
      {
        id: 'overview',
        title: 'What this topic is and how the exam tests it',
        html: `<p>Two boats closing in a narrow sound cannot phone each other. A motorboat in fog cannot see what is coming. A sinking crew needs everyone within reach to understand them at once. For all three problems the Rules of the Road give fixed signals that every seafarer in the world knows: whistle blasts, bell strokes, flags, flares and the spoken word Mayday. This topic teaches them, plus the radio and telephone numbers that bring the rescue service to you.</p>
<p>On the official curriculum the material sits in three places:</p>
<ul>
<li><strong>Part 2, laws and regulations</strong> (good knowledge required): equipment for sound signals (Rule 33), manoeuvring signals (Rule 34 (a) and (b)), sound signals in restricted visibility (Rule 35 (a) and (i)) and the distress signals of Annex IV.</li>
<li><strong>Part 1, seamanship</strong>: VHF channel 16 and DSC, the coast radio telephone number 120, and the range, possibilities and limitations of VHF and mobile phones at sea.</li>
<li><strong>Part 4, particularly important topics, item 1.4.6</strong>: emergencies, the coast radio number <strong>120</strong> and <strong>VHF channel 16</strong>.</li>
</ul>
<p>Part 4 is where the exam is unforgiving: more than two wrong answers in that group fails you regardless of your total. A slip on "120" or "channel 16" therefore costs far more than a slip on the bell signal of a vessel aground. Expect roughly three to six questions from this topic in all (the split is not published), typically: what one, two, three or five short blasts mean; which signal a motorboat gives in fog and how often; which of several pictures is a distress signal; which number reaches the coast radio from a mobile phone; which VHF channel is the distress channel; and whether you may fire a red flare to test it.</p>
<div class="callout tip"><p>Learn two numbers before anything else: <strong>120</strong> (coast radio by phone) and <strong>16</strong> (VHF distress and calling channel). Then learn the whistle signals as a little language: one short, two short, three short, five short.</p></div>`,
        keyFacts: ['Part 2: Rules 33, 34(a)(b), 35(a)(i) and Annex IV distress signals', 'Part 1: VHF channel 16, DSC, the number 120, limits of VHF and mobile phone', 'Part 4 item 1.4.6: coast radio 120 and VHF channel 16; more than two part-4 errors = fail', 'Roughly 3–6 questions out of 50 come from this topic (estimate; the split is not published)'],
        check: { q: 'Which item from this topic belongs to part 4 of the exam, where more than two errors fail you?', options: ['The length from which a bell is compulsory', 'The coast radio number 120 and VHF channel 16', 'The colour of distress smoke', 'The fog signal of a sailing vessel'], answer: 1, explanation: 'Part 4 item 1.4.6 "Emergencies" names the coast radio station number 120 and VHF channel 16. The sound signals and Annex IV belong to part 2.' },
      },
      // 2 ------------------------------------------------------------
      {
        id: 'blasts-and-equipment',
        title: 'Short, prolonged, and who must carry a whistle',
        html: `<p>Every whistle signal in the Rules is built from only two sounds. The Rules define them precisely so that a blast means the same thing from a dinghy and from a tanker.</p>
<div class="callout rule"><p><strong>Short blast:</strong> a blast of about <strong>one second</strong>. <strong>Prolonged blast:</strong> a blast of <strong>four to six seconds</strong> (Rule 32).</p></div>
<p>"Whistle" in the Rules means any sound-signalling appliance that can produce these blasts and meets the technical standard in Annex III. On a small boat that is in practice a compressed-air or electric horn, or a mouth-blown horn. Norwegian texts call the prolonged blast a "long blast"; the English Rules say "prolonged". Do not confuse it with the special Norwegian narrow-channel signal, a long blast of <strong>at least 10 seconds</strong> sounded by a power-driven vessel about half a mile before entering a narrow channel (national Rule 41).</p>
<p>Who must carry what? <strong>Rule 33</strong> scales the equipment with the size of the vessel, because a big ship needs to be heard further off and must also signal at anchor:</p>
<ul>
<li><strong>12 m or more:</strong> a whistle.</li>
<li><strong>20 m or more:</strong> a bell in addition to the whistle.</li>
<li><strong>100 m or more:</strong> a gong as well, with a tone that cannot be confused with the bell.</li>
<li><strong>Under 12 m:</strong> not obliged to carry the whistle, bell or gong, but <strong>must have some other means of making an efficient sound signal</strong>.</li>
</ul>
<p>So your 7 m motorboat is not required to carry an Annex III whistle, but it must be able to make an efficient sound signal: a hand horn in the locker satisfies the Rule and the curriculum's list of safety equipment. Annex III adds that the indicative audible range of a whistle on a vessel under 20 m is only about half a nautical mile, and that wind and engine noise can cut it much further. Hearing is not a substitute for a lookout.</p>
<div class="callout warn"><p>Trap: "bell from 12 m" is wrong. Whistle from <strong>12 m</strong>, bell from <strong>20 m</strong>, gong from <strong>100 m</strong>.</p></div>`,
        illustration: () => blastLegend(),
        caption: 'Drawn to scale: a short blast lasts about one second, a prolonged blast four to six seconds. Five short blasts fit inside one prolonged blast.',
        keyFacts: ['Short blast ≈ 1 second; prolonged blast 4–6 seconds (Rule 32)', 'Whistle compulsory from 12 m, bell from 20 m, gong from 100 m (Rule 33(a))', 'Under 12 m: some other means of making an efficient sound signal (Rule 33(b))', 'Whistle audible only about 0.5 NM on a vessel under 20 m (Annex III), less in wind and noise', 'Norwegian Rule 41: long blast of at least 10 s about half a mile before a narrow channel'],
        check: { q: 'Your motorboat is 9 m long. What does Rule 33 require for sound signalling?', options: ['A whistle and a bell', 'A whistle meeting Annex III', 'Some means of making an efficient sound signal', 'Nothing at all'], answer: 2, explanation: 'Rule 33(b): a vessel under 12 m need not carry the Annex III whistle or bell, but must have some other means of making an efficient sound signal, for example a hand horn.' },
      },
      // 3 ------------------------------------------------------------
      {
        id: 'manoeuvring',
        title: 'Manoeuvring signals: one, two and three short blasts',
        html: `<p>When two vessels can see each other, the give-way vessel is supposed to act early and obviously. The whistle removes the last doubt about <em>what</em> she is doing. <strong>Rule 34(a)</strong> applies to a <strong>power-driven vessel underway</strong>, <strong>in sight of</strong> another vessel, when she manoeuvres as the Rules allow or require.</p>
<div class="callout rule"><p><strong>One short blast:</strong> "I am altering my course to starboard."<br><strong>Two short blasts:</strong> "I am altering my course to port."<br><strong>Three short blasts:</strong> "I am operating astern propulsion." (Rule 34(a))</p></div>
<p>Note the wording of the third signal. It says the <em>engine</em> is going astern; the boat may still be sliding ahead while she loses speed. It does not mean "I have stopped" and it is not a distress signal. A sailing vessel under sail alone does not give the course-alteration signals, because Rule 34(a) speaks of power-driven vessels; a sailing boat with her engine running is power-driven and does.</p>
<p><strong>Rule 34(b)</strong> lets any vessel back up the whistle with light: <strong>one flash</strong> for starboard, <strong>two</strong> for port, <strong>three</strong> for astern propulsion, repeated while the manoeuvre lasts. Each flash lasts about one second, the gap between flashes is about one second, and successive signals are at least ten seconds apart. The light, if fitted, is an <strong>all-round white light</strong> visible at least <strong>5 miles</strong>. So a ferry ahead flashing twice, then twice again ten seconds later, is turning to port.</p>
<p>How to remember which is which: the standard avoiding manoeuvre in the Rules is a turn to <strong>starboard</strong> (head-on, crossing, narrow channels), so the standard move gets the single, simplest blast. Port, the odd one out, gets two.</p>
<div class="callout tip"><p>Say it as a rhythm while you tap the blasts: "ONE, starboard. TWO, port. THREE, astern." Then "FIVE" for "I do not understand you".</p></div>`,
        illustration: () => manoeuvringCard(),
        caption: 'Bow up, starboard is to the right. One short blast: turning to starboard. Two: turning to port. Three: engine astern.',
        keyFacts: ['1 short = altering course to starboard; 2 short = to port; 3 short = operating astern propulsion', 'Power-driven vessels only, and only when in sight of one another (Rule 34(a))', 'Light supplement: 1 / 2 / 3 flashes, all-round WHITE light visible 5 miles (Rule 34(b))', 'Flash ≈1 s, gap ≈1 s, at least 10 s between successive signals', 'Three short blasts = engine in reverse, not "I have stopped" and not distress'],
        check: { q: 'A motorboat ahead of you, in sight, sounds two short blasts. What is she doing?', options: ['Altering course to starboard', 'Altering course to port', 'Going astern', 'Asking you to keep clear'], answer: 1, explanation: 'Rule 34(a): two short blasts mean "I am altering my course to port". One short is starboard, three short is astern propulsion.' },
      },
      // 4 ------------------------------------------------------------
      {
        id: 'doubt-and-channel',
        title: 'Five short blasts, overtaking in a channel and the blind bend',
        html: `<p>Most collisions grow out of a few seconds of "what is he doing?". The Rules give you a signal for exactly that moment, and they make it a duty, not an option.</p>
<div class="callout rule"><p>When vessels in sight of one another are approaching and either fails to understand the intentions or actions of the other, or doubts whether sufficient action is being taken to avoid collision, the vessel in doubt <strong>shall immediately</strong> give <strong>at least five short and rapid blasts</strong> on the whistle, which may be supplemented by at least five short and rapid flashes (Rule 34(d)).</p></div>
<p>This is the doubt or danger signal, and <strong>any</strong> vessel gives it, sailing boats included. It means "I do not understand you" or "I think you are not doing enough". It is not a distress signal; distress with a horn is a <em>continuous</em> sounding. If you hear five blasts aimed at you, look again at your own course and act.</p>
<p><strong>Overtaking in a narrow channel</strong> (Rule 34(c)) has its own dialogue, used when the vessel ahead must move to let you pass: <strong>two prolonged followed by one short</strong> means "I intend to overtake you on your starboard side"; <strong>two prolonged followed by two short</strong> means "on your port side". The vessel ahead agrees with <strong>prolonged, short, prolonged, short</strong>, and if in doubt she sounds the five-blast signal. Agreement does not free you from your duty to keep clear as the overtaking vessel.</p>
<p><strong>The blind bend</strong> (Rule 34(e)): nearing a bend or obstruction where other vessels may be hidden, sound <strong>one prolonged blast</strong>; a vessel approaching from the other side answers with one prolonged blast. In Norwegian waters, national Rule 41 adds that a power-driven vessel announces her arrival at a narrow channel from about half a mile off with a long blast of at least 10 seconds; if two meet where they cannot pass, the one that arrived last waits, and a vessel in a channel too narrow to pass sounds at least five short blasts to tell the other to wait.</p>`,
        illustration: () => S.soundSignal('.....'),
        caption: 'At least five short, rapid blasts: "I do not understand your intentions" or "I doubt you are doing enough to avoid collision".',
        keyFacts: ['Doubt signal: at least 5 short rapid blasts, given IMMEDIATELY by the vessel in doubt (Rule 34(d)); any vessel', 'May be backed by at least 5 short rapid flashes', 'Overtaking in a narrow channel: 2 prolonged + 1 short = your starboard side; 2 prolonged + 2 short = your port side', 'Agreement to be overtaken: prolonged, short, prolonged, short', 'Blind bend: 1 prolonged blast, answered with 1 prolonged blast (Rule 34(e))'],
        check: { q: 'In a narrow channel you intend to overtake a slow vessel on her starboard side and she must make room. Which signal do you sound?', options: ['One short blast', 'Two prolonged blasts followed by one short blast', 'Two prolonged blasts followed by two short blasts', 'Five short blasts'], answer: 1, explanation: 'Rule 34(c)(i): two prolonged + one short = "I intend to overtake you on your starboard side". Two prolonged + two short is for her port side. She agrees with prolonged-short-prolonged-short.' },
      },
      // 5 ------------------------------------------------------------
      {
        id: 'fog-power',
        title: 'Fog signals for a power-driven vessel: one or two prolonged blasts',
        html: `<p>In fog nobody can see your lights, so the Rules replace sight with sound. <strong>Rule 35</strong> applies <strong>in or near</strong> an area of restricted visibility, <strong>by day or night</strong>, and the signals are given whether or not you know another vessel is close. Restricted visibility means fog, mist, falling snow, heavy rain or similar causes. "Near" matters: you start signalling as you approach a fog bank, not only once you are inside it.</p>
<div class="callout rule"><p>A power-driven vessel <strong>making way</strong> through the water: <strong>one prolonged blast</strong> at intervals of not more than <strong>2 minutes</strong> (Rule 35(a)).<br>A power-driven vessel underway but <strong>stopped and making no way</strong>: <strong>two prolonged blasts</strong> in succession, about 2 seconds apart, at intervals of not more than 2 minutes (Rule 35(b)).</p></div>
<p>"Underway" means not at anchor, not made fast to the shore and not aground. A motorboat that has stopped her engine to listen is still underway; she is just not making way, so she switches from one prolonged blast to two. She does not ring a bell: the bell is for vessels at anchor. The moment she gets going again, back to one prolonged blast.</p>
<p>Compare the two rules you now know. <strong>Rule 34</strong> manoeuvring signals use short blasts and are only given when vessels are in sight of each other. <strong>Rule 35</strong> fog signals use prolonged blasts, are given blind, and repeat on a clock. Hearing a prolonged blast in fog means "a power-driven vessel is moving somewhere out there"; slow down, listen between your own signals, and remember that a whistle on a small boat may carry only half a mile.</p>
<p>The curriculum names Rule 35(a) specifically, and a question of the type "a motorboat is making way in fog; which signal and how often?" is the classic form. The answer is one prolonged blast at least every two minutes.</p>`,
        illustration: () => S.soundSignal('-'),
        caption: 'One prolonged blast (4–6 s) at intervals of not more than 2 minutes: a power-driven vessel making way in restricted visibility.',
        keyFacts: ['Rule 35 applies in OR NEAR restricted visibility, by day or night, whether or not anyone is seen', 'Power-driven vessel making way: 1 prolonged blast, at least every 2 minutes (Rule 35(a))', 'Power-driven vessel underway but stopped: 2 prolonged blasts about 2 s apart, at least every 2 minutes (Rule 35(b))', 'Underway = not at anchor, not moored, not aground; a stopped vessel is still underway and does not ring a bell'],
        check: { q: 'Your motorboat is in thick fog. You stop the engine and lie still to listen. Which signal do you now give?', options: ['One prolonged blast every 2 minutes', 'Two prolonged blasts about 2 seconds apart, every 2 minutes', 'Rapid ringing of a bell for 5 seconds every minute', 'One prolonged and two short blasts every 2 minutes'], answer: 1, explanation: 'Rule 35(b): a power-driven vessel underway but stopped and making no way sounds two prolonged blasts about 2 s apart at intervals of not more than 2 minutes. The bell is for a vessel at anchor.' },
      },
      // 6 ------------------------------------------------------------
      {
        id: 'fog-others',
        title: 'Fog signals of other vessels, and what a small boat must do',
        html: `<p>The rest of Rule 35 lets you identify, by ear, what kind of vessel is hidden in the fog and whether she can get out of your way. The pattern "one prolonged then short blasts" always means "something other than an ordinary power-driven vessel".</p>
<ul>
<li><strong>One prolonged + two short</strong> every ≤ 2 min: a <strong>sailing vessel</strong>, a vessel engaged in fishing, a vessel not under command, a vessel restricted in her ability to manoeuvre, a vessel constrained by her draught, and a vessel towing or pushing (Rule 35(c)). A fishing vessel at anchor uses this signal too, instead of the bell (Rule 35(d)).</li>
<li><strong>One prolonged + three short</strong> every ≤ 2 min: a <strong>manned vessel being towed</strong>, or the last vessel of the tow, sounded right after the tug's signal if possible (Rule 35(e)). There is a towline ahead of it: never pass between.</li>
<li><strong>Bell rung rapidly for about 5 seconds</strong> at intervals of not more than <strong>one minute</strong>: a vessel <strong>at anchor</strong> (Rule 35(g)). She may add <strong>short, prolonged, short</strong> on the whistle to warn a vessel approaching her.</li>
<li>Same bell signal with <strong>three separate strokes before and after</strong> the rapid ringing: a vessel <strong>aground</strong> (Rule 35(h)). Shoal water: keep well clear.</li>
</ul>
<p>Now the paragraphs that concern you directly. A vessel of <strong>12 m or more but under 20 m</strong> need not give the bell signals, but if she does not she must make some other efficient sound signal at least every 2 minutes (Rule 35(i)). A vessel <strong>under 12 m</strong> is not obliged to give any of the Rule 35 signals, but if she does not she <strong>shall make some other efficient sound signal at intervals of not more than 2 minutes</strong> (Rule 35(j)). The curriculum cites "Rule 35 (a) and (i)"; the intent is this small-craft rule. In practice a motorboat under 12 m simply gives one prolonged blast every two minutes, because that is what everyone understands.</p>
<div class="callout warn"><p>Two clocks: whistle fog signals repeat at least every <strong>2 minutes</strong>; the anchor and aground bell signals at least every <strong>1 minute</strong>.</p></div>`,
        illustration: () => fogTable(),
        caption: 'Rule 35 at a glance. Whistle signals every two minutes at most; bell signals (anchor, aground) every minute at most.',
        keyFacts: ['1 prolonged + 2 short: sailing, fishing, NUC, RAM, constrained by draught, towing or pushing (Rule 35(c))', '1 prolonged + 3 short: manned vessel being towed (Rule 35(e))', 'At anchor: bell rung rapidly ≈5 s at least every 1 MINUTE (Rule 35(g)); aground: plus 3 strokes before and after (Rule 35(h))', '12–20 m: may omit bell signals; under 12 m: may omit all Rule 35 signals; both must then make an efficient sound signal at least every 2 minutes (Rule 35(i), (j))', 'Sailing boat with engine running = power-driven: one prolonged blast'],
        check: { q: 'In fog you hear one prolonged blast followed by two short blasts, repeated about every two minutes. Which of these vessels could it be?', options: ['A motorboat making way', 'A motorboat stopped with the engine idling', 'A sailing vessel under sail', 'A vessel at anchor'], answer: 2, explanation: 'Rule 35(c): one prolonged + two short is the signal of a sailing vessel and of fishing, NUC, RAM, draught-constrained and towing vessels. A motorboat gives one (making way) or two (stopped) prolonged blasts; a vessel at anchor rings a bell.' },
      },
      // 7 ------------------------------------------------------------
      {
        id: 'distress-signals',
        title: 'The distress signals of Annex IV',
        html: `<p>When a vessel is in distress and requires assistance she uses or exhibits the signals of <strong>Annex IV</strong> (Rule 37). They may be used <strong>together or separately</strong>: each one alone means "I am in grave and imminent danger and need immediate assistance". The curriculum requires items 1 a–l, l(i), o and paragraph 2. Learn them in groups.</p>
<h4>Pyrotechnics and fire</h4>
<ul>
<li>Rockets or shells throwing <strong>red stars</strong>, fired one at a time at short intervals.</li>
<li>A rocket parachute flare or a hand flare showing a <strong>red light</strong>.</li>
<li>A smoke signal giving off <strong>orange-coloured smoke</strong> (a daytime signal).</li>
<li><strong>Flames</strong> on the vessel, as from a burning oil barrel.</li>
<li>A gun or other explosive signal fired at intervals of about <strong>one minute</strong>.</li>
</ul>
<h4>Sound and code</h4>
<ul>
<li>A <strong>continuous sounding</strong> of any fog-signalling apparatus: the horn held down without stopping.</li>
<li>The group <strong>· · · – – – · · ·</strong> (SOS) in Morse code, made by any method, for example a torch at night.</li>
<li>The spoken word <strong>"Mayday"</strong> by radiotelephony (on VHF channel 16).</li>
<li>The International Code signal <strong>N.C.</strong>: flag N above flag C.</li>
<li>A <strong>square flag</strong> with a <strong>ball</strong>, or anything resembling a ball, above or below it.</li>
<li>Slowly and repeatedly <strong>raising and lowering outstretched arms</strong>.</li>
</ul>
<h4>Radio systems</h4>
<ul>
<li>A distress alert by <strong>DSC</strong> on <strong>VHF channel 70</strong> (or on the MF/HF DSC frequencies, e.g. 2187.5 kHz).</li>
<li>A ship-to-shore distress alert by satellite (Inmarsat); signals from an <strong>EPIRB</strong>; approved radio signals including the radar transponder <strong>SART</strong>.</li>
</ul>
<p>Annex IV also points to two signals that help aircraft find you: a piece of <strong>orange canvas</strong> with a black square and circle, and a <strong>dye marker</strong> colouring the water. On a small boat the practical kit is red hand flares, a red parachute rocket, orange smoke and a VHF with DSC; the flares and rocket are in the curriculum's list of recommended safety equipment.</p>`,
        illustration: () => distressGallery(),
        caption: 'Annex IV: fifteen ways to say "I need immediate assistance". Red for pyrotechnic light, orange for smoke and canvas.',
        keyFacts: ['Distress signals may be used together or separately; each alone means distress (Annex IV 1)', 'Red flares, red stars, orange smoke, flames, gun about every 1 minute', 'Continuous horn, SOS by any method, spoken Mayday, flags N over C, square flag + ball, arms raised and lowered slowly', 'DSC alert on VHF channel 70; EPIRB; SART; satellite alert', 'Orange canvas with black square and circle, and dye marker, for identification from the air'],
        check: { q: 'Which of these is a distress signal under Annex IV?', options: ['A white hand flare', 'A green flare', 'A smoke signal giving off orange smoke', 'Signal flag A'], answer: 2, explanation: 'Annex IV lists orange smoke (1(j)) and red flares and stars. White and green pyrotechnics are not distress signals, and flag A means "I have a diver down".' },
      },
      // 8 ------------------------------------------------------------
      {
        id: 'distress-rules',
        title: 'What is not distress, and why you may never test a flare',
        html: `<p>A distress signal works only because everyone trusts it. One false alarm sends lifeboats and helicopters to sea for nothing, and ten false alarms teach people to ignore the real one. That is why <strong>Annex IV paragraph 2</strong> is absolute:</p>
<div class="callout rule"><p>The use or exhibition of any of the foregoing signals, except for the purpose of indicating distress and need of assistance, and the use of other signals which may be confused with any of the above signals, <strong>is prohibited</strong> (Annex IV 2).</p></div>
<p>So you may not fire an old red flare "to see if it still works", not on New Year's Eve, not in the harbour. Expired pyrotechnics go back to the retailer or to the police as hazardous goods. Shouting Mayday as a joke on channel 16 is equally forbidden. The exam asks this in one form or another, and the answer is always no.</p>
<p>The second trap is colour. Distress pyrotechnics are <strong>red</strong> (rockets, stars, parachute flares, hand flares) or <strong>orange</strong> (smoke). A <strong>white</strong> flare or white hand-held light is not a distress signal; white pyrotechnics are used to light up a scene or attract attention. A <strong>green</strong> flare is not listed either. Remember too that the ball may be <em>above or below</em> the square flag, that flag <strong>A</strong> means "diver down" and not distress, and that waving one arm is a greeting while slowly raising and lowering <em>both outstretched</em> arms is distress.</p>
<p>What about attracting attention without being in distress? <strong>Rule 36</strong> allows light or sound signals that cannot be mistaken for any signal in the Rules, or a searchlight pointed at the danger, provided it does not embarrass another vessel or look like an aid to navigation. It adds that high-intensity intermittent or revolving lights such as <strong>strobe lights shall be avoided</strong>. The five-blast doubt signal is also not a distress signal: it is a warning between two vessels in sight of each other.</p>
<div class="callout tip"><p>For the picture question "which of these is (not) a distress signal", scan for colour first: red light or orange smoke = distress; white or green = not.</p></div>`,
        illustration: () => notDistress(),
        caption: 'White pyrotechnics, green flares and strobe lights are not distress signals. Red light and orange smoke are.',
        keyFacts: ['Using a distress signal when not in distress is PROHIBITED (Annex IV 2): no tests, no celebrations', 'Signals that may be confused with distress signals are also prohibited', 'Red = distress light; orange = distress smoke; white and green pyrotechnics are NOT distress signals', 'Flag A = diver down, not distress; the ball goes above OR below the square flag', 'Rule 36: attract attention only with signals that cannot be mistaken for others; avoid strobe lights'],
        check: { q: 'You find a red parachute rocket on board that expired last year. May you fire it in the harbour to check that it works?', options: ['Yes, if you warn the coast radio station first', 'Yes, as long as nobody is within 100 m', 'Yes, but only in daylight', 'No, using a distress signal except to indicate distress is prohibited'], answer: 3, explanation: 'Annex IV paragraph 2 prohibits using any distress signal except to indicate distress and need of assistance. Dispose of expired pyrotechnics through the retailer or the police.' },
      },
      // 9 ------------------------------------------------------------
      {
        id: 'vhf',
        title: 'VHF radio: channel 16, DSC on channel 70, and the mobile phone',
        html: `<p>A mobile phone call reaches one person. A VHF call reaches every vessel within range and the coast radio station at the same time, and the coast radio station is the door to the rescue service. That is why the curriculum, and the exam, treat the VHF as the primary means of alerting at sea, and why two of its numbers are part-4 material.</p>
<div class="callout rule"><p><strong>VHF channel 16</strong> (156.8 MHz) is the international distress, safety and calling channel for voice. The Norwegian coast radio stations keep a continuous listening watch on it.<br><strong>VHF channel 70</strong> (156.525 MHz) is the <strong>DSC</strong> (Digital Selective Calling) channel: digital alerts only, never voice.</p></div>
<p><strong>DSC</strong> is the red button on a modern VHF. Lift the spring-loaded cover, <strong>press and hold the red DISTRESS button</strong> until the radio confirms the alert has gone (usually a few seconds; follow your radio's manual). The set then transmits a digital distress alert on channel 70 containing your <strong>MMSI</strong> (a nine-digit identity) and, if a GPS is connected, your position, and switches itself to channel 16 for the voice call that follows. For the button to work correctly, the boat's MMSI must be programmed into the radio; the MMSI and a call sign are assigned with the radio licence.</p>
<p>Range and limitations: a VHF has a limited range, but within that range one call alerts every listening vessel and the coast radio at once. Mobile coverage along the coast is patchy and a phone reaches a single party, so the Society for Sea Rescue's advice is that a mobile phone can never replace a VHF. As a backup, <strong>120</strong> reaches the coast radio by phone.</p>
<p>Paperwork: a VHF on a Norwegian recreational boat needs a <strong>radio licence</strong> for the boat (basic VHF and AIS licence NOK 200 a year, which gives you the call sign and MMSI) and the operator needs the <strong>Short Range Certificate (SRC)</strong>. Since 1 January 2026 both come from the Norwegian Maritime Authority. The boating licence exam itself does not require an SRC.</p>`,
        illustration: () => radioPanel(16, { chLabel: ['channel 16:', 'distress, safety', 'and calling'] }),
        caption: 'Channel 16 for voice distress and calling. The red DISTRESS button sends a digital alert with your MMSI and position on channel 70.',
        keyFacts: ['VHF channel 16 = distress, safety and calling channel (voice); coast radio keeps a continuous watch on it', 'VHF channel 70 = DSC digital alerts only; never talk on 70', 'DSC: lift the cover, press and hold the red DISTRESS button until confirmed; sends MMSI (9 digits) and GPS position, then switch to 16 and speak', 'VHF alerts everyone in range at once; a mobile phone reaches one party and coverage at sea is patchy', 'Boat needs a radio licence (NOK 200/yr, gives call sign and MMSI); operator needs the SRC; both from the Norwegian Maritime Authority since 2026'],
        check: { q: 'What happens when you lift the cover and press and hold the red DISTRESS button on a DSC VHF radio?', options: ['A recorded Mayday voice message is sent on channel 16', 'A digital distress alert with your MMSI and GPS position is sent on channel 70, and the radio switches to channel 16 for the voice call', 'A text message goes to the emergency number 112', 'The radio transmits your position on channel 70 every minute until you release the button'], answer: 1, explanation: 'The DSC alert goes out digitally on channel 70 with your MMSI and position; the radio then tunes to channel 16 so you can make the spoken Mayday call. The MMSI must be programmed in for this to work.' },
      },
      // 10 -----------------------------------------------------------
      {
        id: 'mayday',
        title: 'Mayday, Pan Pan and Securite: what to say on channel 16',
        html: `<p>A distress call has a fixed form so that a stressed operator can follow it from memory and a listener can take notes in the right order. Two parts follow each other: the <strong>distress call</strong>, which grabs attention, and the <strong>distress message</strong>, which tells rescuers what they need.</p>
<div class="callout rule"><p><strong>Call:</strong> "MAYDAY, MAYDAY, MAYDAY. THIS IS [boat name] three times, [call sign], [MMSI]."<br><strong>Message:</strong> "MAYDAY [boat name, call sign]. POSITION ... NATURE OF DISTRESS ... ASSISTANCE REQUIRED ... [number] PERSONS ON BOARD ... [other useful information] ... OVER."</p></div>
<p><strong>Mayday</strong> is spoken three times, and the boat's name three times. Give the position as latitude and longitude from the GPS, or as a bearing and distance from a known point ("two miles south of the lighthouse"). State what is wrong (sinking, fire, man overboard), what you need, and how many people are on board; describe the boat and whether you have a liferaft. End with "OVER", release the button and <strong>listen</strong>. If nobody answers, repeat.</p>
<p>Mayday is reserved for <strong>grave and imminent danger</strong> to a vessel or person requiring immediate assistance. Two lower levels exist:</p>
<ul>
<li><strong>PAN PAN</strong> (three times): an urgency message about the safety of a vessel or person where there is no immediate danger to life, for example engine failure drifting slowly in calm weather. It is followed by "ALL STATIONS" three times or the coast radio station's name, then "THIS IS" and your identity and message.</li>
<li><strong>SECURITE</strong> (three times): a safety message, typically a navigational or weather warning such as a drifting log or a gale. The coast radio stations use it for maritime safety information.</li>
</ul>
<p>The priority order is <strong>Mayday &gt; Pan Pan &gt; Securite</strong>. If a Pan Pan situation deteriorates, say the wind rises and you are drifting onto rocks with people on board, it becomes distress: press the DSC button and send Mayday. If you have a DSC radio, the alert goes first; the voice call follows on channel 16 either way.</p>`,
        illustration: () => maydayCard(),
        caption: 'Mayday in nine steps, read aloud slowly. Pan Pan for urgency without immediate danger to life; Securite for safety messages.',
        keyFacts: ['MAYDAY x 3, THIS IS [name] x 3, call sign, MMSI; then MAYDAY [name], position, nature of distress, assistance required, persons on board, other information, OVER', 'Mayday = grave and imminent danger; PAN PAN = urgency, no immediate danger to life; SECURITE = safety or navigation warning', 'Each marker is spoken three times; priority Mayday > Pan Pan > Securite', 'Position: lat/long from the GPS, or bearing and distance from a landmark', 'With DSC: send the alert first, then the voice call on channel 16'],
        check: { q: 'Your engine has failed in calm weather, you are drifting slowly away from the coast and nobody is in danger. Which radio marker fits the situation?', options: ['MAYDAY', 'PAN PAN', 'SECURITE', 'SOS'], answer: 1, explanation: 'Pan Pan announces an urgent message about the safety of a vessel or person without grave and imminent danger. Mayday is reserved for distress; Securite is for safety and navigation warnings.' },
      },
      // 11 -----------------------------------------------------------
      {
        id: 'numbers',
        title: 'The numbers: 120, 112 and the coast radio service',
        html: `<p>Part 4 item 1.4.6 is short and ruthless: <strong>the coast radio station's number 120</strong> and <strong>VHF channel 16</strong>. A wrong answer here counts against the two-error limit for the whole exam. Learn the following card by heart.</p>
<div class="callout rule"><p><strong>120</strong>: the coast radio stations, from any mobile phone. <strong>VHF channel 16</strong>: the distress, safety and calling channel, monitored continuously by the coast radio.</p></div>
<p>The coast radio stations are the shore side of the maritime radio system. They listen on channel 16 and on DSC around the clock, relay your distress to the <strong>Joint Rescue Coordination Centre</strong> and coordinate the vessels that come to help. Since <strong>1 January 2026</strong> the Norwegian state runs the service: the Joint Rescue Coordination Centre operates the radio watch, the Coastal Administration owns the technical network, and the Norwegian Maritime Authority manages the ship radio register, licences and radio certificates. There are two stations, North (from about 65 degrees north to the Russian border, plus the Arctic islands and the Norwegian and Barents Seas) and South (from the Swedish border to 65 degrees north); you call them by name on VHF, and 120 reaches the coast radio service by telephone.</p>
<p>The land emergency numbers also work at sea: <strong>112</strong> police and general emergency, <strong>113</strong> medical, <strong>110</strong> fire. 112 can be dialled from any mobile phone, even without a SIM card or credit, as long as any network is available, and the Society for Sea Rescue's advice is "if in distress, always call 112"; you may also call the coast radio on 120. The exam, however, asks specifically which number reaches the <em>coast radio station</em>, and that answer is <strong>120</strong>.</p>
<p>One more number to keep apart: <strong>02016</strong> (full number 915 02016) is the <strong>Society for Sea Rescue's assistance line</strong> for non-emergency help such as engine trouble, navigation problems or a tow. It is not an emergency number, and it is not the coast radio.</p>
<div class="callout warn"><p>Trap: 112 is the general emergency number; 120 is the coast radio; 02016 is the rescue society's assistance line. If the question says "coast radio" the answer is 120.</p></div>`,
        illustration: () => numbersCard(),
        caption: 'The card to memorise: channel 16 and DSC on the radio; 120 for the coast radio by phone; 112, 113, 110 on land and sea; 02016 for non-emergency assistance.',
        keyFacts: ['120 = the coast radio stations by telephone (part 4, item 1.4.6)', 'VHF channel 16 = distress, safety and calling; the coast radio keeps a continuous watch', '112 police / general emergency (works on any mobile), 113 medical, 110 fire', '02016 (915 02016) = Society for Sea Rescue assistance line, NOT an emergency number', 'Since 1 Jan 2026 the coast radio is run by the Joint Rescue Coordination Centre; two stations, North and South'],
        check: { q: 'You have only a mobile phone on board and need to reach the coast radio station. Which number do you dial?', options: ['110', '113', '120', '02016'], answer: 2, explanation: '120 is the coast radio stations telephone number named in the curriculum (part 4, 1.4.6). 110 is fire, 113 medical and 02016 the Society for Sea Rescue assistance line.' },
      },
    ],

    flashcards: [
      { front: 'How long is a short blast?', back: 'About <b>1 second</b> (Rule 32(b)).' },
      { front: 'How long is a prolonged blast?', back: '<b>4 to 6 seconds</b> (Rule 32(c)).' },
      { front: 'From what length is a whistle compulsory?', back: '<b>12 m</b>. Under 12 m: some other means of making an efficient sound signal (Rule 33).' },
      { front: 'From what length is a bell compulsory?', back: '<b>20 m</b> (in addition to the whistle). Gong from 100 m (Rule 33(a)).' },
      { front: 'One short blast?', back: '"I am altering my course to <b>starboard</b>" (Rule 34(a)).' },
      { front: 'Two short blasts?', back: '"I am altering my course to <b>port</b>" (Rule 34(a)).' },
      { front: 'Three short blasts?', back: '"I am operating <b>astern propulsion</b>" (Rule 34(a)). Engine in reverse, not necessarily stopped.' },
      { front: 'At least five short, rapid blasts?', back: 'Doubt / danger signal: "I do not understand your intentions" (Rule 34(d)). Given immediately by the vessel in doubt.' },
      { front: 'When do Rule 34 manoeuvring signals apply?', back: 'Power-driven vessels underway, only when vessels are <b>in sight</b> of one another.' },
      { front: 'Light that may supplement manoeuvring signals?', back: 'All-round <b>white</b> light visible 5 miles; 1/2/3 flashes, flash ≈1 s, gap ≈1 s, ≥10 s between signals (Rule 34(b)).' },
      { front: 'Two prolonged + one short blast?', back: '"I intend to overtake you on your <b>starboard</b> side" (narrow channel, Rule 34(c)).' },
      { front: 'Two prolonged + two short blasts?', back: '"I intend to overtake you on your <b>port</b> side" (Rule 34(c)).' },
      { front: 'Prolonged, short, prolonged, short?', back: 'Agreement from the vessel being overtaken (Rule 34(c)(ii)).' },
      { front: 'Signal when nearing a blind bend in a channel?', back: '<b>One prolonged blast</b>; an approaching vessel answers with one prolonged blast (Rule 34(e)).' },
      { front: 'Norwegian Rule 41: signal before entering a narrow channel?', back: 'Power-driven vessel: a long blast of <b>at least 10 s</b>, from about half a mile off.' },
      { front: 'Power-driven vessel making way in fog?', back: '<b>One prolonged blast</b> at intervals of not more than <b>2 minutes</b> (Rule 35(a)).' },
      { front: 'Power-driven vessel underway but stopped in fog?', back: '<b>Two prolonged blasts</b> about 2 s apart, at least every 2 minutes (Rule 35(b)).' },
      { front: 'Sailing vessel in fog?', back: '<b>One prolonged + two short</b> every ≤ 2 min (Rule 35(c)); same for fishing, NUC, RAM, constrained by draught, towing.' },
      { front: 'Manned vessel being towed, in fog?', back: '<b>One prolonged + three short</b> every ≤ 2 min (Rule 35(e)).' },
      { front: 'Vessel at anchor in fog?', back: 'Bell rung rapidly for about <b>5 s</b> at least every <b>1 minute</b> (Rule 35(g)).' },
      { front: 'Vessel aground in fog?', back: 'Anchor bell signal plus <b>three separate strokes</b> before and after the ringing (Rule 35(h)).' },
      { front: 'Boat under 12 m in fog: what must she do?', back: 'Not obliged to give the formal signals, but must make <b>some efficient sound signal at least every 2 minutes</b> (Rule 35(j)).' },
      { front: 'When does Rule 35 apply?', back: 'In <b>or near</b> an area of restricted visibility, by day or night, whether or not another vessel is seen.' },
      { front: 'Colour of distress flares and stars? Of distress smoke?', back: 'Flares and stars: <b>red</b>. Smoke: <b>orange</b> (Annex IV). White and green are not distress.' },
      { front: 'Distress signal with a horn?', back: '<b>Continuous sounding</b> of the fog-signalling apparatus (Annex IV 1(b)).' },
      { front: 'Flag signal for distress?', back: '<b>N over C</b> (Annex IV 1(f)). Also: a square flag with a ball above or below it.' },
      { front: 'Arm signal for distress?', back: 'Slowly and repeatedly <b>raising and lowering outstretched arms</b> (Annex IV 1(k)).' },
      { front: 'May you fire a red flare to test it?', back: '<b>No</b>. Using a distress signal except to indicate distress is prohibited (Annex IV 2).' },
      { front: 'SOS in Morse?', back: '· · · – – – · · · by any signalling method, e.g. a torch (Annex IV 1(d)).' },
      { front: 'VHF channel 16?', back: 'International <b>distress, safety and calling</b> channel (voice), 156.8 MHz. Coast radio keeps a continuous watch. Part 4!' },
      { front: 'VHF channel 70?', back: '<b>DSC</b> digital alerting only (156.525 MHz); the DSC distress alert is an Annex IV signal. Never voice.' },
      { front: 'How do you send a DSC distress alert?', back: 'Lift the cover, press and hold the red <b>DISTRESS</b> button until confirmed; sends MMSI and GPS position on ch 70, then speak on ch 16.' },
      { front: 'What is an MMSI?', back: 'Maritime Mobile Service Identity: a <b>9-digit</b> number programmed into the DSC radio, assigned with the radio licence.' },
      { front: 'How many times is MAYDAY spoken, and what follows?', back: '<b>Three times</b>, then "THIS IS" + boat name three times, call sign, MMSI; then the message: position, nature, assistance, persons on board, OVER.' },
      { front: 'PAN PAN?', back: 'Urgency marker (x 3): very urgent message about a vessel or person, but <b>no grave and imminent danger</b>.' },
      { front: 'SECURITE?', back: 'Safety marker (x 3): navigational or weather warning. Priority: Mayday > Pan Pan > Securite.' },
      { front: 'Coast radio station by mobile phone?', back: '<b>120</b>. Part 4 item 1.4.6.' },
      { front: '112, 113, 110?', back: '112 police / general emergency (works on any mobile), 113 medical, 110 fire.' },
      { front: '02016?', back: 'Society for Sea Rescue <b>assistance line</b> (915 02016) for engine trouble and towing. Not an emergency number, not the coast radio.' },
      { front: 'What does a VHF on a Norwegian recreational boat need legally?', back: 'A <b>radio licence</b> for the boat (NOK 200/yr; call sign + MMSI) and the <b>SRC</b> for the operator; both from the Norwegian Maritime Authority since 2026.' },
    ],

    questions: [
      // ---- Part 2: Rules 32-33 (F2-F8) ----
      { id: 'sound-01', q: 'How long is a "short blast" on the whistle?', options: ['About one second', 'About half a second', 'Two to three seconds', 'Four to six seconds'], answer: 0, explanation: 'Rule 32(b) defines a short blast as a blast of about one second. Four to six seconds is a prolonged blast (F2, F3).', difficulty: 1, part: 2, tags: ['rule-32'] },
      { id: 'sound-02', q: 'How long is a "prolonged blast"?', options: ['About one second', 'Two to three seconds', 'Four to six seconds', 'At least ten seconds'], answer: 2, explanation: 'Rule 32(c): a prolonged blast lasts from four to six seconds (F3). At least ten seconds is the Norwegian Rule 41 long blast given before a narrow channel (F31).', difficulty: 1, part: 2, tags: ['rule-32'] },
      { id: 'sound-03', q: 'From what length must a vessel carry a bell in addition to a whistle?', options: ['7 m', '12 m', '50 m', '20 m'], answer: 3, explanation: 'Rule 33(a): whistle from 12 m, bell from 20 m, gong from 100 m (F4-F6). "Bell from 12 m" is the classic trap (T1).', difficulty: 2, part: 2, tags: ['rule-33'] },
      { id: 'sound-04', q: 'Your motorboat is 7 m long. What does Rule 33 require of you for sound signalling?', options: ['Some means of making an efficient sound signal', 'A whistle meeting Annex III', 'A whistle and a bell', 'Nothing; boats under 12 m are fully exempt'], answer: 0, explanation: 'Rule 33(b): a vessel under 12 m need not carry the Annex III whistle, but must be provided with some other means of making an efficient sound signal, e.g. a hand horn (F8).', difficulty: 2, part: 2, tags: ['rule-33'] },
      { id: 'sound-05', q: 'From what length is a vessel required to be provided with a whistle?', options: ['8 m', '10 m', '15 m', '12 m'], answer: 3, explanation: 'Rule 33(a): a vessel of 12 m or more shall be provided with a whistle (F4). Smaller vessels need some other efficient means of sound signalling.', difficulty: 1, part: 2, tags: ['rule-33'] },
      // ---- Part 2: Rule 34 (F14-F30) ----
      { id: 'sound-06', q: 'A motorboat in sight of you sounds one short blast. What is she telling you?', options: ['I am altering my course to port', 'I am operating astern propulsion', 'I am altering my course to starboard', 'I am in doubt about your intentions'], answer: 2, explanation: 'Rule 34(a): one short blast means "I am altering my course to starboard" (F15). Two short is port, three short astern propulsion, five short doubt.', difficulty: 1, part: 2, tags: ['rule-34'] },
      { id: 'sound-07', q: 'What do two short blasts from a power-driven vessel in sight mean?', options: ['I am altering my course to starboard', 'I intend to overtake you', 'I am stopping', 'I am altering my course to port'], answer: 3, explanation: 'Rule 34(a): two short blasts mean "I am altering my course to port" (F16).', difficulty: 1, part: 2, tags: ['rule-34'] },
      { id: 'sound-08', q: 'Three short blasts mean that the vessel is...', options: ['Operating astern propulsion', 'Turning around', 'Stopped and making no way', 'In distress'], answer: 0, explanation: 'Rule 34(a): three short blasts mean "I am operating astern propulsion" (F17). The engine is in reverse; the vessel may still be moving ahead. Distress with a horn is a continuous sounding (F57).', difficulty: 1, part: 2, tags: ['rule-34'] },
      { id: 'sound-09', q: 'A motorboat in sight of you gives the whistle signal shown in the picture. What is she doing?', illustration: () => sig('..'), options: ['Altering course to starboard', 'Altering course to port', 'Going astern', 'Warning you that she is in doubt'], answer: 1, explanation: 'Two short blasts (each about one second) mean "I am altering my course to port" (Rule 34(a), F16).', difficulty: 1, part: 2, tags: ['rule-34', 'picture'] },
      { id: 'sound-10', q: 'The ferry ahead of you, in sight, gives the signal in the picture. What does it mean?', illustration: () => sig('...'), options: ['She is altering course to port', 'She is altering course to starboard', 'She is operating astern propulsion', 'She is about to leave the quay'], answer: 2, explanation: 'Three short blasts: "I am operating astern propulsion" (Rule 34(a), F17). Her engine is going astern, so expect her to slow or move backwards.', difficulty: 2, part: 2, tags: ['rule-34', 'picture'] },
      { id: 'sound-11', q: 'A motorboat is approaching and you cannot tell what she intends to do. Which signal should you give?', options: ['One prolonged blast', 'Two prolonged blasts', 'Continuous sounding of the horn', 'At least five short, rapid blasts'], answer: 3, explanation: 'Rule 34(d): the vessel in doubt shall immediately give at least five short and rapid blasts (F25). A continuous sounding is a distress signal (F57).', difficulty: 2, part: 2, tags: ['rule-34', 'doubt'] },
      { id: 'sound-12', q: 'A vessel in sight of you sounds the signal in the picture. What does it mean?', illustration: () => sig('.....'), options: ['She does not understand your intentions or doubts you are doing enough to avoid collision', 'She is in distress and needs immediate assistance', 'She is turning hard to starboard', 'She is a pilot vessel identifying herself'], answer: 0, explanation: 'At least five short, rapid blasts is the doubt or danger signal of Rule 34(d) (F25). It is not a distress signal (T5); the pilot identity signal is four short blasts (F50).', difficulty: 2, part: 2, tags: ['rule-34', 'doubt', 'picture'] },
      { id: 'sound-13', q: 'Which light may be used to supplement the manoeuvring whistle signals?', options: ['A red all-round light', 'A yellow flashing light', 'An all-round white light visible at least 5 miles', 'A green masthead light'], answer: 2, explanation: 'Rule 34(b)(iii): the manoeuvring light is an all-round white light visible at a minimum range of 5 miles (F20). One, two or three flashes correspond to the one, two or three blasts (F18).', difficulty: 2, part: 2, tags: ['rule-34', 'light'] },
      { id: 'sound-14', q: 'At night a ship ahead of you flashes a white light twice, and about ten seconds later twice again. What is she doing?', options: ['Signalling that she is at anchor', 'Altering her course to port', 'Altering her course to starboard', 'Asking you to show your lights'], answer: 1, explanation: 'Rule 34(b): two flashes of the all-round white manoeuvring light supplement two short blasts, "I am altering my course to port"; signals are repeated at least 10 s apart (F16, F18, F19, scenario S10).', difficulty: 3, part: 2, tags: ['rule-34', 'light'] },
      { id: 'sound-15', q: 'When must a power-driven vessel give the manoeuvring signals of Rule 34(a)?', options: ['Whenever she alters course, in any visibility', 'Only in restricted visibility', 'When she manoeuvres as the Rules require and the vessels are in sight of one another', 'Only in a narrow channel'], answer: 2, explanation: 'Rule 34(a) applies when vessels are in sight of one another and a power-driven vessel manoeuvres as authorised or required by the Rules (F14). Fog signals are Rule 35 (F51).', difficulty: 2, part: 2, tags: ['rule-34'] },
      { id: 'sound-16', q: 'A sailing boat under sail alone, in sight of a motorboat, alters course to starboard. Must she sound one short blast?', options: ['Yes, every vessel must', 'No; Rule 34(a) applies to power-driven vessels, but she must give the five-blast doubt signal if she is in doubt', 'Yes, but only at night', 'No; sailing vessels never give whistle signals'], answer: 1, explanation: 'Rule 34(a) speaks of a power-driven vessel. A vessel under sail alone does not give the course-alteration signals, but the doubt signal of Rule 34(d) is a duty for any vessel in doubt (F30).', difficulty: 3, part: 2, tags: ['rule-34', 'sail'] },
      { id: 'sound-17', q: 'In a narrow channel you want to overtake a vessel on her port side and need her to make room. Which signal do you sound?', options: ['Two short blasts', 'Two prolonged blasts followed by one short blast', 'Two prolonged blasts followed by two short blasts', 'One prolonged, one short, one prolonged, one short'], answer: 2, explanation: 'Rule 34(c)(i): two prolonged + two short means "I intend to overtake you on your port side" (F22); two prolonged + one short is for her starboard side (F21).', difficulty: 2, part: 2, tags: ['rule-34', 'overtaking'] },
      { id: 'sound-18', q: 'How does a vessel in a narrow channel signal that she agrees to be overtaken?', options: ['One prolonged, one short, one prolonged, one short blast', 'Five short blasts', 'One prolonged blast', 'Two prolonged blasts'], answer: 0, explanation: 'Rule 34(c)(ii): the vessel about to be overtaken, if in agreement, sounds prolonged-short-prolonged-short and makes room (F23). If in doubt she sounds at least five short blasts.', difficulty: 2, part: 2, tags: ['rule-34', 'overtaking'] },
      { id: 'sound-19', q: 'You approach a sharp bend in a narrow channel where other vessels may be hidden behind the headland. Which signal do you sound?', options: ['Two short blasts', 'One prolonged blast', 'Five short blasts', 'No signal is prescribed'], answer: 1, explanation: 'Rule 34(e): a vessel nearing a bend where other vessels may be obscured sounds one prolonged blast; a vessel approaching from the other side answers with one prolonged blast (F28).', difficulty: 2, part: 2, tags: ['rule-34', 'bend'] },
      { id: 'sound-20', q: 'In a narrow sound, a coaster astern of you sounds the signal shown in the picture. What does she intend?', illustration: () => sig('- - . .'), options: ['To overtake you on your starboard side', 'To stop and let you pass', 'To overtake you on your port side', 'To warn you of a bend ahead'], answer: 2, explanation: 'Two prolonged followed by two short blasts: "I intend to overtake you on your port side" (Rule 34(c)(i), F22). With one short blast at the end it would be your starboard side.', difficulty: 3, part: 2, tags: ['rule-34', 'overtaking', 'picture'] },
      // ---- Part 2: Rule 35 (F36-F51) ----
      { id: 'sound-21', q: 'A motorboat is making way through the water in thick fog. Which sound signal does she give, and how often?', options: ['Two prolonged blasts every 2 minutes', 'One prolonged blast every minute', 'One prolonged blast at intervals of not more than 2 minutes', 'One prolonged and two short blasts every 2 minutes'], answer: 2, explanation: 'Rule 35(a): a power-driven vessel making way sounds one prolonged blast at intervals of not more than 2 minutes (F37).', difficulty: 1, part: 2, tags: ['rule-35', 'fog'] },
      { id: 'sound-22', q: 'A motorboat in fog has stopped her engine and is making no way through the water. Which signal does she give?', options: ['One prolonged blast every 2 minutes', 'Rapid ringing of a bell for 5 s every minute', 'One prolonged and two short blasts', 'Two prolonged blasts about 2 seconds apart, at least every 2 minutes'], answer: 3, explanation: 'Rule 35(b): a power-driven vessel underway but stopped sounds two prolonged blasts in succession, about 2 s apart, at intervals of not more than 2 minutes (F38). The bell is for a vessel at anchor (F43).', difficulty: 2, part: 2, tags: ['rule-35', 'fog'] },
      { id: 'sound-23', q: 'A sailing boat under sail alone is in fog. Which signal does she sound?', options: ['One prolonged blast', 'One prolonged followed by two short blasts, at least every 2 minutes', 'Two prolonged blasts', 'No signal; sailing vessels are exempt'], answer: 1, explanation: 'Rule 35(c): a sailing vessel sounds one prolonged followed by two short blasts at intervals of not more than 2 minutes, like fishing, NUC, RAM, draught-constrained and towing vessels (F39).', difficulty: 2, part: 2, tags: ['rule-35', 'fog', 'sail'] },
      { id: 'sound-24', q: 'In fog you hear the signal in the picture repeated about every two minutes. Which vessel could it be?', illustration: () => sig('- . .'), options: ['A motorboat making way', 'A vessel at anchor', 'A motorboat stopped with her engine running', 'A fishing vessel or a sailing vessel'], answer: 3, explanation: 'One prolonged + two short is the Rule 35(c) signal of a sailing vessel, a vessel fishing, NUC, RAM, constrained by draught or towing (F39). A motorboat gives one or two prolonged blasts; a vessel at anchor rings a bell.', difficulty: 2, part: 2, tags: ['rule-35', 'fog', 'picture'] },
      { id: 'sound-25', q: 'In fog you hear a bell rung rapidly for about 5 seconds once a minute. What is it?', options: ['A vessel at anchor', 'A vessel aground', 'A pilot vessel', 'A vessel being towed'], answer: 0, explanation: 'Rule 35(g): a vessel at anchor rings the bell rapidly for about 5 s at intervals of not more than one minute (F43). A vessel aground adds three distinct strokes before and after the ringing (F46).', difficulty: 2, part: 2, tags: ['rule-35', 'anchor'] },
      { id: 'sound-26', q: 'Which extra signal identifies a vessel AGROUND in fog?', options: ['Four short blasts on the whistle', 'Continuous ringing of the bell', 'One short, one prolonged, one short blast', 'Three separate strokes on the bell immediately before and after the rapid ringing'], answer: 3, explanation: 'Rule 35(h): a vessel aground gives the anchor bell signal plus three separate and distinct strokes before and after it (F46). Four short blasts is the pilot identity signal (F50); short-prolonged-short is the optional anchor warning (F45).', difficulty: 3, part: 2, tags: ['rule-35', 'aground'] },
      { id: 'sound-27', q: 'Your 9 m motorboat is in fog. What does Rule 35 require of you?', options: ['Nothing; boats under 12 m are fully exempt from all sound signals', 'Rapid ringing of a bell every minute', 'One prolonged blast every minute', 'Some efficient sound signal at intervals of not more than 2 minutes'], answer: 3, explanation: 'Rule 35(j): a vessel under 12 m is not obliged to give the formal signals, but must then make some other efficient sound signal at intervals of not more than 2 minutes (F48). In practice: one prolonged blast every 2 minutes.', difficulty: 2, part: 2, tags: ['rule-35', 'small-craft'] },
      { id: 'sound-28', q: 'In fog you hear one prolonged blast followed by three short blasts, shortly after a one-prolonged-two-short signal nearby. What is the vessel giving the second signal?', options: ['A pilot vessel', 'A manned vessel being towed', 'A vessel aground', 'A vessel constrained by her draught'], answer: 1, explanation: 'Rule 35(e): a manned towed vessel sounds one prolonged + three short, when practicable right after the towing vessel\'s signal (F41). Expect a towline between the two; do not pass between them (T10).', difficulty: 3, part: 2, tags: ['rule-35', 'towing'] },
      { id: 'sound-29', q: 'When do the sound signals of Rule 35 have to be given?', options: ['Only at night in fog', 'Only when another vessel has been detected nearby', 'In or near an area of restricted visibility, by day or night', 'Only in open sea, not in narrow channels'], answer: 2, explanation: 'Rule 35 applies in or near an area of restricted visibility, whether by day or night, and the signals are given whether or not another vessel is known to be nearby (F36, F51, T22).', difficulty: 2, part: 2, tags: ['rule-35', 'fog'] },
      { id: 'sound-30', q: 'A sailing boat is in fog sounding one prolonged and two short blasts. She then starts her engine and motors on with sails still up. Which signal should she now give?', options: ['One prolonged blast at least every 2 minutes', 'The same one prolonged and two short blasts', 'Two prolonged blasts every 2 minutes', 'One prolonged and three short blasts'], answer: 0, explanation: 'With the engine running she is a power-driven vessel, and a power-driven vessel making way sounds one prolonged blast at intervals of not more than 2 minutes (Rule 35(a), F37, scenario S3).', difficulty: 3, part: 2, tags: ['rule-35', 'sail'] },
      { id: 'sound-31', q: 'In fog you hear the signal in the picture once about every two minutes. What is out there?', illustration: () => sig('-'), options: ['A vessel at anchor', 'A power-driven vessel making way', 'A sailing vessel', 'A vessel aground'], answer: 1, explanation: 'One prolonged blast at intervals of not more than 2 minutes is the Rule 35(a) signal of a power-driven vessel making way (F37). It is the single most important fog signal to recognise.', difficulty: 1, part: 2, tags: ['rule-35', 'fog', 'picture'] },
      // ---- Part 2: Annex IV (F54-F74) ----
      { id: 'sound-32', q: 'Which of the following is a distress signal under Annex IV?', options: ['A white hand flare', 'Signal flag A', 'A green flare', 'A smoke signal giving off orange smoke'], answer: 3, explanation: 'Annex IV 1(j): orange-coloured smoke is a distress signal (F65). White and green pyrotechnics are not listed (F74); flag A means "I have a diver down".', difficulty: 1, part: 2, tags: ['annex-iv', 'distress'] },
      { id: 'sound-33', q: 'A vessel is flying the two flags shown in the picture, one above the other. What do they mean?', illustration: () => flagsNC(), options: ['I have a diver down; keep well clear at slow speed', 'I am in distress and require immediate assistance', 'You are running into danger', 'I am taking in or discharging dangerous goods'], answer: 1, explanation: 'Flag N (blue and white chequered) over flag C (blue, white, red, white, blue stripes) is the International Code distress signal "N.C." of Annex IV 1(f) (F61, F73).', difficulty: 2, part: 2, tags: ['annex-iv', 'flags', 'picture'] },
      { id: 'sound-34', q: 'A square flag with a ball, or something resembling a ball, above or below it indicates...', options: ['A vessel at anchor', 'A vessel engaged in fishing', 'A vessel in distress', 'A vessel constrained by her draught'], answer: 2, explanation: 'Annex IV 1(g): a square flag having above or below it a ball or anything resembling a ball is a distress signal (F62). A single ball alone is the anchor day shape.', difficulty: 2, part: 2, tags: ['annex-iv', 'flags'] },
      { id: 'sound-35', q: 'May you fire a red parachute flare on New Year\'s Eve to see whether it still works?', options: ['Yes, if you call the coast radio station first', 'Yes, as long as you are in a harbour', 'Yes, pyrotechnics may be tested once a year', 'No; using a distress signal except to indicate distress is prohibited'], answer: 3, explanation: 'Annex IV paragraph 2 prohibits the use of any distress signal except to indicate distress and need of assistance (F71, T16). Expired flares go back to the retailer or the police.', difficulty: 2, part: 2, tags: ['annex-iv', 'prohibited'] },
      { id: 'sound-36', q: 'Which arm signal means distress?', options: ['Slowly and repeatedly raising and lowering both outstretched arms', 'Waving one arm above the head', 'Crossing both arms over the head', 'Pointing repeatedly towards the shore'], answer: 0, explanation: 'Annex IV 1(k): slowly and repeatedly raising and lowering arms outstretched to each side (F66). Waving one arm is just a greeting (T15).', difficulty: 1, part: 2, tags: ['annex-iv', 'distress'] },
      { id: 'sound-37', q: 'At night a boat flashes a torch towards you: three short, three long, three short flashes, repeated. What is this?', options: ['A request for you to show your navigation lights', 'The letter U: you are running into danger', 'The distress signal SOS, which counts by any signalling method', 'A warning that she is dragging her anchor'], answer: 2, explanation: 'Annex IV 1(d): the Morse group · · · – – – · · · (SOS) made by any signalling method, including a torch, is a distress signal (F59, T13).', difficulty: 2, part: 2, tags: ['annex-iv', 'sos'] },
      { id: 'sound-38', q: 'How is distress indicated with the boat\'s horn?', options: ['At least five short, rapid blasts', 'Three short blasts repeated every minute', 'A continuous sounding of the horn', 'One prolonged blast every 2 minutes'], answer: 2, explanation: 'Annex IV 1(b): a continuous sounding with any fog-signalling apparatus is a distress signal (F57). Five short blasts is the doubt signal (F25); one prolonged every 2 minutes is a fog signal (F37).', difficulty: 2, part: 2, tags: ['annex-iv', 'horn'] },
      { id: 'sound-39', q: 'What colour are distress hand flares, rocket parachute flares and distress stars?', options: ['Red', 'White', 'Green', 'Blue'], answer: 0, explanation: 'Annex IV 1(c) and 1(i): rockets throwing red stars and flares showing a red light are distress signals (F58, F64). Smoke is orange (F65); white and green are not distress (F74).', difficulty: 1, part: 2, tags: ['annex-iv', 'colour'] },
      { id: 'sound-40', q: 'A DSC distress alert sent by pressing the red button on a VHF radio...', options: ['Is a convenience feature but not a recognised distress signal', 'Is itself a distress signal under Annex IV, transmitted on VHF channel 70', 'Is transmitted as a voice message on channel 16', 'Is only valid if followed by a red flare'], answer: 1, explanation: 'Annex IV 1(l)(i): a distress alert by digital selective calling transmitted on VHF channel 70 is a listed distress signal (F67, F76). The voice Mayday on channel 16 follows it.', difficulty: 3, part: 2, tags: ['annex-iv', 'dsc'] },
      { id: 'sound-41', q: 'You want to attract the attention of a nearby boat that is heading for a rock, but you are not in distress yourself. Which is correct under Rule 36?', options: ['Fire a red hand flare so that she sees you', 'Use a light or sound signal that cannot be mistaken for any signal in the Rules, or point a searchlight at the danger', 'Switch on a strobe light', 'Sound Mayday on channel 16 on her behalf'], answer: 1, explanation: 'Rule 36 permits signals that cannot be mistaken for any authorised signal, or a searchlight directed at the danger, and says strobe lights shall be avoided (F52, F53). Red flares are reserved for distress (F71).', difficulty: 3, part: 2, tags: ['rule-36'] },
      // ---- Part 1: radio, DSC, Mayday, limitations (F75-F98) ----
      { id: 'sound-42', q: 'Why does the curriculum prefer the VHF to a mobile phone for calling for help at sea?', options: ['Because the VHF is cheaper to use', 'Because a VHF call on channel 16 reaches every vessel in range and the coast radio at once, while a phone reaches one party and coverage at sea is patchy', 'Because mobile phones are not allowed to be used at sea', 'Because the coast radio has no telephone number'], answer: 1, explanation: 'A Mayday on channel 16 alerts all vessels within range and the coast radio simultaneously; mobile coverage at sea is patchy and a call reaches only one party (F85). The coast radio can still be phoned on 120 (F86).', difficulty: 2, part: 1, tags: ['vhf', 'mobile'] },
      { id: 'sound-43', q: 'What must be programmed into a DSC VHF radio for the DISTRESS button to work correctly?', options: ['The boat\'s MMSI', 'The owner\'s mobile number', 'The coast radio\'s telephone number 120', 'The boat\'s CE design category'], answer: 0, explanation: 'The DSC alert carries the boat\'s MMSI (a nine-digit Maritime Mobile Service Identity), which is assigned with the radio licence and must be programmed into the set (F77).', difficulty: 2, part: 1, tags: ['dsc', 'mmsi'] },
      { id: 'sound-44', q: 'How many times is the word "Mayday" spoken at the start of a distress call?', options: ['Once', 'Twice', 'Three times', 'Continuously until someone answers'], answer: 2, explanation: '"MAYDAY, MAYDAY, MAYDAY, THIS IS [boat name] three times, call sign, MMSI" (F79). Then the message with position, nature of distress, assistance required and persons on board.', difficulty: 1, part: 1, tags: ['mayday'] },
      { id: 'sound-45', q: 'Which information belongs in the Mayday message after the call?', options: ['Only your position', 'Position, nature of distress, assistance required and number of persons on board', 'Your home address and insurance company', 'Engine type and remaining fuel'], answer: 1, explanation: 'The distress message gives identity, position, nature of distress, assistance required, number of persons on board and other useful information, then OVER (F80).', difficulty: 2, part: 1, tags: ['mayday'] },
      { id: 'sound-46', q: 'A gale warning or a report of a drifting log is broadcast by the coast radio station. Which marker introduces such a message?', options: ['MAYDAY', 'PAN PAN', 'MAYDAY RELAY', 'SECURITE'], answer: 3, explanation: 'Securite (spoken three times) announces a safety message such as a navigational hazard or weather warning (F83). Pan Pan is urgency, Mayday distress (F84).', difficulty: 2, part: 1, tags: ['securite'] },
      { id: 'sound-47', q: 'Which marker announces an urgent message about the safety of a vessel or person where there is no grave and imminent danger?', options: ['PAN PAN', 'MAYDAY', 'SECURITE', 'SOS'], answer: 0, explanation: 'Pan Pan (three times) is the urgency marker, for example engine failure drifting slowly with nobody in danger (F82). Mayday is for grave and imminent danger only (F84).', difficulty: 2, part: 1, tags: ['pan-pan'] },
      { id: 'sound-48', q: 'What is legally required to operate a VHF radio on a Norwegian recreational boat?', options: ['A radio licence for the boat and a Short Range Certificate (SRC) for the operator', 'Nothing; VHF is licence-free for leisure craft', 'Only the boating licence', 'A written permit from the coast radio station for each trip'], answer: 0, explanation: 'The boat needs a radio licence (basic VHF/AIS licence NOK 200 a year, giving call sign and MMSI) and the operator must hold at least the SRC; both are issued by the Norwegian Maritime Authority since 1 January 2026 (F93-F96, T20).', difficulty: 3, part: 1, tags: ['licence', 'src'] },
      // ---- Part 4, item 1.4.6: 120 and channel 16 (F75, F76, F78, F79, F86-F91) ----
      { id: 'sound-49', q: 'You have only a mobile phone on board and need to reach the coast radio station. Which number do you dial?', options: ['110', '120', '113', '02016'], answer: 1, explanation: '120 is the coast radio stations\' telephone number named in the curriculum (F86). 110 is fire, 113 medical, 02016 the Society for Sea Rescue assistance line (F89, F91).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['120'] },
      { id: 'sound-50', q: 'Which VHF channel is the international distress, safety and calling channel for voice?', options: ['Channel 6', 'Channel 70', 'Channel 72', 'Channel 16'], answer: 3, explanation: 'VHF channel 16 (156.8 MHz) is the distress, safety and calling channel, monitored continuously by the coast radio stations (F75). Channel 70 carries DSC data only (F76).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['channel-16'] },
      { id: 'sound-51', q: 'Your VHF is set to the channel shown in the picture. What is this channel for?', illustration: () => radioPanel(16), options: ['Distress, safety and calling by voice; the coast radio keeps a continuous watch on it', 'Private chat between leisure boats', 'Digital DSC alerts only', 'Harbour and marina traffic'], answer: 0, explanation: 'Channel 16 is the international distress, safety and calling channel for radiotelephony, watched around the clock by the Norwegian coast radio (F75).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['channel-16', 'picture'] },
      { id: 'sound-52', q: 'The radio in the picture is tuned to channel 70. What is channel 70 used for?', illustration: () => radioPanel(70, { chLabel: ['channel 70', 'selected'] }), options: ['Spoken distress calls', 'Weather forecasts from the coast radio', 'Routine calls between leisure boats', 'Digital DSC alerts, including the distress alert sent by the red button; no voice'], answer: 3, explanation: 'Channel 70 (156.525 MHz) is reserved for digital selective calling. The DSC distress alert goes out there; you then speak on channel 16 (F76, T18).', difficulty: 2, part: 1, tags: ['dsc', 'channel-70', 'picture'] },
      { id: 'sound-53', q: 'On which VHF channel do the Norwegian coast radio stations keep a continuous listening watch for voice calls?', options: ['Channel 16', 'Channel 6', 'Channel 13', 'Channel 72'], answer: 0, explanation: 'The coast radio stations keep a continuous listening watch on channel 16, the distress, safety and calling channel (F75), as well as on DSC.', difficulty: 1, part: 4, p4: '1.4.6', tags: ['channel-16'] },
      { id: 'sound-54', q: 'What is the difference between the numbers 120 and 112?', options: ['They are two numbers for the same service', '120 reaches the coast radio station; 112 is the general emergency number for the police, which works on any mobile phone', '120 is the fire service at sea; 112 is the coast radio', '120 is the medical emergency number; 112 is the Society for Sea Rescue'], answer: 1, explanation: '120 is the coast radio telephone number required by the curriculum (F86); 112 is the general emergency number (police), which can be dialled from any mobile (F89). If the question says "coast radio", answer 120 (T17).', difficulty: 2, part: 4, p4: '1.4.6', tags: ['120', '112'] },
      { id: 'sound-55', q: 'You are chatting with a friend\'s boat on a working channel when your passenger collapses and you need help urgently. What do you do with the radio?', options: ['Stay on the working channel and ask your friend to call for help', 'Switch to channel 70 and speak', 'Switch to channel 16 (and use the DSC DISTRESS button if the situation is life-threatening) and call the coast radio', 'Switch the radio off and use the mobile phone instead'], answer: 2, explanation: 'Channel 16 is the distress, safety and calling channel that the coast radio monitors continuously (F75); a DSC alert on channel 70 is digital only, you never speak on it (F76, F78).', difficulty: 2, part: 4, p4: '1.4.6', tags: ['channel-16', 'scenario'] },
      { id: 'sound-56', q: 'Which number is missing from the card in the picture: the one that reaches the coast radio station from a mobile phone?', illustration: () => numbersCard({ hide: '120' }), options: ['116 117', '110', '112', '120'], answer: 3, explanation: 'The coast radio stations are reached on 120 (F86). 112 is police / general emergency, 110 fire, 113 medical (F89).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['120', 'picture'] },
      { id: 'sound-57', q: 'Who answers when you dial 120?', options: ['A coast radio station (Kystradio), run since 2026 by the Joint Rescue Coordination Centre', 'The police operations centre', 'The Society for Sea Rescue\'s towing service', 'The Norwegian Maritime Authority\'s licence office'], answer: 0, explanation: '120 connects you to the coast radio stations, which keep watch on channel 16 and relay distress to the rescue service; since 1 January 2026 the service is run by the Joint Rescue Coordination Centre (F86, F87).', difficulty: 2, part: 4, p4: '1.4.6', tags: ['120'] },
      { id: 'sound-58', q: 'Your engine has failed in calm weather, nobody is in danger, and you have no VHF. Which number is a correct one to call for assistance?', options: ['113', '120, the coast radio station (or 02016, the Society for Sea Rescue)', '110', '116 117'], answer: 1, explanation: 'The coast radio on 120 handles assistance needs at sea, and the Society for Sea Rescue\'s line 02016 provides non-emergency help such as towing (F86, F91). 113 is medical, 110 fire.', difficulty: 2, part: 4, p4: '1.4.6', tags: ['120', '02016'] },
      { id: 'sound-59', q: 'A crew member has fallen overboard in cold water and you cannot get him back on board. You have a DSC VHF. What is the correct radio action?', options: ['Call 02016 and ask for a tow', 'Send Securite on channel 16', 'Press and hold the DSC DISTRESS button, then send a Mayday by voice on channel 16', 'Send Pan Pan on channel 70'], answer: 2, explanation: 'A person in the water in cold water is grave and imminent danger: send the DSC alert (channel 70, with MMSI and position) and then the spoken Mayday on channel 16, the distress channel the coast radio monitors (F75, F78, F79, scenario S8).', difficulty: 3, part: 4, p4: '1.4.6', tags: ['channel-16', 'dsc', 'scenario'] },
      { id: 'sound-60', q: 'Which pair of numbers does the "particularly important" curriculum item on emergencies name?', options: ['112 and channel 70', '120 and VHF channel 16', '110 and channel 6', '02016 and channel 72'], answer: 1, explanation: 'Part 4 item 1.4.6 "Emergencies" names the coast radio station number 120 and VHF channel 16; both must be known cold because more than two part-4 errors fails the exam (F86, F75).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['120', 'channel-16'] },
    ],
  });
})();
