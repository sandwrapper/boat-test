/* Skipper Prep — topic 6: Charts, compass and navigation.
   Facts: scratchpad/facts/charts-and-navigation.md (verified 2026-10-03 against Kartverket, Kystverket,
   the Norwegian Maritime Authority, INT1 2020, Lovdata and NOAA WMM-2025). Fact ids (F1...F104),
   worked examples (WE-n) and illustration specs (Spec n) in comments refer to that sheet.
   Curriculum: part 3 (chart structure, symbols, datum, compass, variation and deviation, electronic aids,
   current and tide, calculations) and part 4 item 1.4.2 (chart symbols: rocks awash, shoals, bridges,
   cables, pipelines, overhead power lines; sectors and characteristics of minor lights).
   Sea marks (IALA buoyage, part 4 item 1.4.1) are taught in their own topic and only referenced here. */
(function () {
  'use strict';
  const S = BOAT.svg, C = S.COLORS, T = S.text;
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)';
  const PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', SHALLOW = 'var(--shallow)', MAG = 'var(--accent)';
  const LAND = C.hullLight, LAND_INK = '#1a2630';      // buff chart "land" is a printed colour: fixed, with dark text on it
  const SKY = '#dbeefb', WATER = '#9ecbe6', SEABED = '#8d6e63';

  // ---------- small drawing helpers (chart-style, INT1 look) ----------
  const fx = n => Math.round(n * 10) / 10;
  function ln(x1, y1, x2, y2, stroke, o) {
    o = o || {};
    return `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${stroke || INK}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linecap="${o.cap || 'round'}"${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`;
  }
  function rect(x, y, w, h, fill, stroke, o) {
    o = o || {};
    return `<rect x="${fx(x)}" y="${fx(y)}" width="${fx(w)}" height="${fx(h)}" rx="${o.rx == null ? 4 : o.rx}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${o.sw || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`;
  }
  function head(x, y, ang, fill, L) {
    L = L || 9;
    const bx = x - L * Math.cos(ang), by = y - L * Math.sin(ang);
    const px = -Math.sin(ang) * L * 0.45, py = Math.cos(ang) * L * 0.45;
    return `<polygon points="${fx(x)},${fx(y)} ${fx(bx + px)},${fx(by + py)} ${fx(bx - px)},${fx(by - py)}" fill="${fill}"/>`;
  }
  /* double-headed measuring arrow between (x,y1) and (x,y2) with a label beside it */
  function dim(x, y1, y2, label, col, o) {
    o = o || {}; col = col || INK;
    const a1 = Math.atan2(y1 - y2, 0), a2 = Math.atan2(y2 - y1, 0);
    let s = ln(x, y1, x, y2, col, { sw: 1.6 }) + head(x, y1, a1, col, 8) + head(x, y2, a2, col, 8);
    const lines = Array.isArray(label) ? label : [label];
    lines.forEach((l, i) => { s += T(x + (o.dx == null ? 8 : o.dx), (y1 + y2) / 2 + (i - (lines.length - 1) / 2) * 13, l, { size: o.size || 11, anchor: o.anchor || 'start', weight: i === 0 ? 700 : 500, fill: o.fill || col }); });
    return s;
  }
  const plus = (x, y, s, w) => `<g stroke="${INK}" stroke-width="${w || 2.2}" stroke-linecap="round"><line x1="${fx(x - s)}" y1="${y}" x2="${fx(x + s)}" y2="${y}"/><line x1="${x}" y1="${fx(y - s)}" x2="${x}" y2="${fx(y + s)}"/></g>`;
  const dots4 = (x, y, d, r) => [[-d, -d], [d, -d], [-d, d], [d, d]].map(p => `<circle cx="${fx(x + p[0])}" cy="${fx(y + p[1])}" r="${r || 2}" fill="${INK}"/>`).join('');
  const star6 = (x, y, r) => `<g stroke="${INK}" stroke-width="2.2" stroke-linecap="round">${[0, 60, 120].map(a => { const dx = r * Math.sin(S.deg(a)), dy = r * Math.cos(S.deg(a)); return `<line x1="${fx(x + dx)}" y1="${fx(y - dy)}" x2="${fx(x - dx)}" y2="${fx(y + dy)}"/>`; }).join('')}</g>`;
  const dotCircle = (x, y, r) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="${r}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="2.5 3"/>`;
  const upright = (x, y, s, size, o) => T(x, y, s, Object.assign({ size: size || 14, weight: 700 }, o || {}));
  const italic = (x, y, s, size, o) => T(x, y, s, Object.assign({ size: size || 14, weight: 500, italic: true }, o || {}));
  const blob = (x, y, r, fill) => `<path d="M${fx(x - r)},${y} q${fx(r * .3)},${fx(-r * 1.1)} ${fx(r)},${fx(-r * .8)} q${fx(r * .9)},${fx(.3 * r)} ${fx(r)},${fx(r * .8)} q${fx(-r * .3)},${fx(r * .9)} ${fx(-r)},${fx(r * .8)} q${fx(-r * .9)},${fx(-.1 * r)} ${fx(-r)},${fx(-r * .8)} Z" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>`;
  function wavy(x1, y, x2, amp) { amp = amp || 3; let d = `M${x1},${y}`; for (let x = x1; x < x2; x += 10) d += ` q2.5,${-amp} 5,0 t5,0`; return `<path d="${d}" fill="none" stroke="${MAG}" stroke-width="1.7"/>`; }
  const zig = (x, y) => `<polyline points="${x - 5},${y - 12} ${x + 3},${y - 4} ${x - 3},${y} ${x + 5},${y + 10}" fill="none" stroke="${MAG}" stroke-width="1.7" stroke-linejoin="round"/>`;
  const pipe = (x1, y, x2) => ln(x1, y, x2, y, MAG, { sw: 1.9, dash: '14 4 1.5 4' });
  const pylon = (x, y) => `<g stroke="${INK}" stroke-width="1.6" fill="none"><line x1="${x}" y1="${y}" x2="${x}" y2="${y - 22}"/><polyline points="${x - 8},${y} ${x},${y - 22} ${x + 8},${y}"/><line x1="${x - 6}" y1="${y - 8}" x2="${x + 6}" y2="${y - 8}"/><line x1="${x - 4}" y1="${y - 15}" x2="${x + 4}" y2="${y - 15}"/></g>`;
  const anchorSym = (x, y, col) => `<g stroke="${col || MAG}" stroke-width="2.2" fill="none" stroke-linecap="round"><circle cx="${x}" cy="${y - 16}" r="4"/><line x1="${x}" y1="${y - 12}" x2="${x}" y2="${y + 14}"/><line x1="${x - 9}" y1="${y - 4}" x2="${x + 9}" y2="${y - 4}"/><path d="M${x - 14},${y + 4} Q${x},${y + 20} ${x + 14},${y + 4}"/></g>`;
  const landStrip = (d) => `<path d="${d}" fill="${LAND}" stroke="${INK}" stroke-width="1.3"/>`;
  function ferry(x, y) { return `<path d="M${x - 12},${y + 3} L${x + 12},${y + 3} L${x + 9},${y - 4} L${x - 9},${y - 4} Z" fill="${MAG}"/><rect x="${x - 5}" y="${y - 9}" width="10" height="5" fill="${MAG}"/>`; }

  /* one chart symbol in a chart-paper cell at (x,y) — shared by the lesson rows and the picture questions */
  const SYM = {
    'islet': (x, y) => blob(x, y, 12, LAND) + T(x + 20, y + 2, '(1,7)', { size: 13, anchor: 'start' }),
    'rock-drying': (x, y) => star6(x, y, 12),
    'rock-awash': (x, y) => plus(x, y, 12) + dots4(x, y, 6),
    'rock-submerged': (x, y) => plus(x, y, 12),
    'rock-known': (x, y) => plus(x - 10, y, 10) + upright(x + 12, y + 1, '7,5', 12.5, { anchor: 'start' }),
    'rock-circle': (x, y) => upright(x, y + 1, '7', 14) + dotCircle(x, y, 13),
    'shoal-upright': (x, y) => italic(x - 46, y - 22, '32', 13) + italic(x + 40, y + 26, '27', 13) + italic(x + 44, y - 26, '35', 13) + upright(x, y + 1, '12', 14) + italic(x - 44, y + 26, '29', 13),
    'danger-line': (x, y) => `<path d="M${x - 44},${y - 6} q10,-28 44,-24 q36,4 42,28 q-6,26 -46,26 q-40,0 -40,-30 Z" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="2.5 3"/>` + plus(x - 14, y + 2, 8, 2) + plus(x + 16, y - 6, 8, 2) + upright(x + 22, y + 12, '4', 11),
    'cable': (x, y) => wavy(x - 62, y, x + 62),
    'power-cable': (x, y) => wavy(x - 62, y, x - 24) + zig(x - 14, y) + wavy(x - 4, y, x + 36) + zig(x + 46, y) + wavy(x + 56, y, x + 62),
    'cable-area': (x, y) => rect(x - 58, y - 30, 116, 60, 'none', MAG, { dash: '6 4', rx: 2, sw: 1.4 }) + wavy(x - 58, y - 30, x + 58) + wavy(x - 58, y + 30, x + 58) + T(x, y + 2, 'Cables', { size: 12, fill: MAG, weight: 600 }),
    'pipeline': (x, y) => pipe(x - 62, y, x + 62) + T(x, y - 13, 'Gas', { size: 11.5, fill: MAG }),
    'overhead-cable': (x, y) => landStrip(`M${x - 72},${y - 48} h22 q8,30 0,56 q-4,20 4,40 h-26 Z`) + landStrip(`M${x + 72},${y - 48} h-22 q-8,30 0,56 q4,20 -4,40 h26 Z`) + pylon(x - 56, y + 4) + pylon(x + 56, y + 4) + ln(x - 56, y - 16, x + 56, y - 16, INK, { sw: 1.6 }) + upright(x, y - 26, '22', 13),
    'bridge': (x, y) => landStrip(`M${x - 72},${y - 48} h24 q6,30 0,56 q-4,20 4,40 h-28 Z`) + landStrip(`M${x + 72},${y - 48} h-24 q-6,30 0,56 q4,20 -4,40 h28 Z`) + rect(x - 52, y - 9, 104, 12, LAND, INK, { rx: 1, sw: 1.4 }) + ln(x - 52, y - 9, x - 52, y + 3, INK, { sw: 2 }) + ln(x + 52, y - 9, x + 52, y + 3, INK, { sw: 2 }) + upright(x, y - 20, '12', 13),
    'no-anchor': (x, y) => anchorSym(x, y) + ln(x - 16, y + 14, x + 16, y - 18, MAG, { sw: 2.4 }),
    'cable-ferry': (x, y) => landStrip(`M${x - 72},${y - 48} h18 q8,30 0,56 q-4,20 4,40 h-22 Z`) + landStrip(`M${x + 72},${y - 48} h-18 q-8,30 0,56 q4,20 -4,40 h22 Z`) + ln(x - 54, y + 2, x + 54, y + 2, MAG, { sw: 1.6, dash: '6 4' }) + ferry(x, y + 2) + T(x, y + 22, 'Cable Ferry', { size: 11, fill: MAG }),
    'anchorage': (x, y) => `<circle cx="${x}" cy="${y}" r="34" fill="none" stroke="${MAG}" stroke-width="1.4" stroke-dasharray="6 4"/>` + anchorSym(x, y) + T(x, y + 50, '24h', { size: 11, fill: MAG }),
    'wreck-dangerous': (x, y) => `<g stroke="${INK}" stroke-width="2" stroke-linecap="round"><line x1="${x - 14}" y1="${y}" x2="${x + 14}" y2="${y}"/><line x1="${x - 7}" y1="${y - 7}" x2="${x - 7}" y2="${y + 7}"/><line x1="${x}" y1="${y - 10}" x2="${x}" y2="${y + 10}"/><line x1="${x + 7}" y1="${y - 7}" x2="${x + 7}" y2="${y + 7}"/></g>` + dotCircle(x, y, 22),
    'obstruction': (x, y) => dotCircle(x, y, 20) + T(x, y + 1, 'Obstn', { size: 11.5 }),
    'soundings': (x, y) => italic(x - 40, y - 24, '12', 14) + italic(x + 30, y - 20, '7,3', 14) + italic(x - 30, y + 24, '18', 14) + italic(x + 36, y + 22, '9,6', 14) + upright(x + 2, y + 1, '4', 14) + dotCircle(x + 2, y, 11),
  };
  /* picture-question version: the symbol alone on a chart-paper square, no caption that gives the answer away */
  function qsym(kind) {
    const draw = SYM[kind]; if (!draw) throw new Error('qsym: unknown kind ' + kind);
    const W = 360, H = 220;
    let s = rect(80, 14, 200, 170, PAPER, LINE, { rx: 4 }) + rect(81, 15, 198, 168, SHALLOW, 'none', { rx: 4, opacity: .55 });
    s += `<g>${draw(180, 96)}</g>`;
    s += T(W / 2, 205, 'Chart symbol (INT1 style): what does it mean?', { size: 11.5, fill: MUTED });
    return S.svg(W, H, s, { label: 'A chart symbol shown for identification' });
  }
  /* lesson rows: cells with captions */
  function symRow(title, cells, cols, opts) {
    opts = opts || {};
    const cw = 640 / cols, ch = 150, rows = Math.ceil(cells.length / cols);
    const W = 640, H = 40 + rows * ch + (opts.footer ? 26 : 0);
    let s = T(W / 2, 20, title, { size: 15, weight: 700 });
    cells.forEach((c, i) => {
      const col = i % cols, row = Math.floor(i / cols), x0 = col * cw, y0 = 36 + row * ch;
      s += rect(x0 + 8, y0, cw - 16, 96, PAPER, LINE, { rx: 4 }) + rect(x0 + 9, y0 + 1, cw - 18, 94, SHALLOW, 'none', { rx: 4, opacity: .55 });
      s += `<g>${SYM[c.kind](x0 + cw / 2, y0 + 48)}</g>`;
      c.label.forEach((l, k) => { s += T(x0 + cw / 2, y0 + 109 + k * 13, l, { size: 10.5, weight: k === 0 ? 700 : 500, fill: k === 0 ? INK : INK2 }); });
    });
    if (opts.footer) s += T(W / 2, H - 10, opts.footer, { size: 10.5, fill: MUTED });
    return S.svg(W, H, s, { label: opts.label || title });
  }
  /* Spec 5: rocks and shoals */
  function rockRow() {
    return symRow('Rocks and shoals in the chart (INT1 section K)', [
      { kind: 'islet', label: ['Islet, never covers', 'height above MHW', 'in brackets (K10)'] },
      { kind: 'rock-drying', label: ['Rock, covers and uncovers', 'between chart datum', 'and MHW (K11)'] },
      { kind: 'rock-awash', label: ['Rock awash at chart datum', 'between CD and', '0.5 m below CD (K12)'] },
      { kind: 'rock-submerged', label: ['Rock, depth unknown', 'dangerous to', 'navigation (K13)'] },
      { kind: 'rock-known', label: ['Norwegian: + with depth', 'rock 0.5 to 9.9 m deep'] },
      { kind: 'rock-circle', label: ['Known depth, dangerous', 'upright figure in a', 'danger circle (K14)'] },
      { kind: 'shoal-upright', label: ['Upright 12 among italics', 'shoal deeper than 10 m', '(its shallowest point)'] },
      { kind: 'danger-line', label: ['Dotted danger line', 'unsafe area, keep out', '(K1)'] },
    ], 4, { footer: 'Upright figures = rocks and shoals; italic (sloping) figures = ordinary soundings. Depths in metres below chart datum.', label: 'Eight chart symbols for rocks and shoals: islet with height in brackets, six-pointed star for a drying rock, cross with four dots for a rock awash, plain cross for an underwater rock of unknown depth, cross with the figure 7,5 for a Norwegian rock of known depth, upright 7 in a dotted circle for a dangerous rock of known depth, upright 12 among italic soundings for a shoal deeper than 10 m, and a dotted danger line enclosing two rocks.' });
  }
  /* Spec 6: cables, pipelines, overhead lines, bridges, areas */
  function linesRow() {
    return symRow('Cables, pipelines, overhead lines, bridges and areas (INT1 D, L, M, N)', [
      { kind: 'cable', label: ['Submarine cable', 'wavy magenta line (L30)'] },
      { kind: 'power-cable', label: ['Submarine power cable', 'wavy line with', 'lightning zigzags (L31)'] },
      { kind: 'cable-area', label: ['Cable area', 'dashed boundary with', 'the cable symbol (L30.2)'] },
      { kind: 'pipeline', label: ['Pipeline', 'long dash, dot, long dash', '"Gas", "Oil", "Water" (L40)'] },
      { kind: 'overhead-cable', label: ['Overhead power line', 'pylons and a line; 22 =', 'clearance in m above HAT'] },
      { kind: 'bridge', label: ['Fixed bridge', '12 = vertical clearance', 'in m above HAT (D20)'] },
      { kind: 'no-anchor', label: ['Anchoring prohibited', 'anchor struck through', '(N20)'] },
      { kind: 'cable-ferry', label: ['Cable ferry', 'dashed line; wire near', 'the surface (M51)'] },
    ], 4, { footer: 'Magenta = information printed on the chart (cables, pipelines, areas, ferries); black = physical structures.', label: 'Eight chart symbols: wavy magenta submarine cable, power cable with zigzags, cable area box, dash-dot pipeline labelled Gas, overhead power line between two pylons with clearance 22, fixed bridge with clearance 12, anchor struck through for anchoring prohibited, and a dashed cable-ferry line.' });
  }
  /* Spec 4 (cross-section): the reference levels */
  function datumSection() {
    const W = 640, H = 430;
    const yHAT = 150, yMHW = 170, yMSL = 190, yLAT = 215, yDRY = 230;
    let s = rect(0, 0, W, H, SKY, 'none', { rx: 8 });
    // sea body (down to the seabed) and seabed
    s += `<path d="M20,${yMSL} H452 V${yMHW} Q430,235 400,250 Q320,290 220,320 Q120,345 20,330 Z" fill="${WATER}"/>`;
    s += `<path d="M20,330 Q120,345 220,320 Q320,290 400,250 Q430,235 452,${yMHW} L452,${H} L20,${H} Z" fill="${SEABED}"/>`;
    // land: shore at MHW, hill to the right
    s += `<path d="M452,${yMHW} Q500,150 540,120 Q580,60 600,58 Q620,60 640,80 L640,${H} L452,${H} Z" fill="${LAND}" stroke="${INK}" stroke-width="1.3"/>`;
    // drying area shading between MHW and CD-0.5 along the shore
    s += `<path d="M452,${yMHW} Q430,235 404,248 L404,${yDRY} L452,${yDRY} Z" fill="${C.green}" opacity=".35"/>`;
    s += T(372, 236, 'drying area', { size: 10.5, fill: LAND_INK, weight: 700 });
    // level lines across the picture
    const levels = [[yHAT, 'HAT', 'highest astronomical tide', true], [yMHW, 'MHW', 'mean high water = the coastline', false], [yMSL, 'MSL', 'mean sea level', false], [yLAT, 'LAT = chart datum', 'depths are measured from here', false], [yDRY, 'CD − 0.5 m', 'lower limit of the drying area', false]];
    levels.forEach(([y, a, b], i) => {
      s += ln(20, y, 620, y, LAND_INK, { sw: i === 3 ? 2 : 1.1, dash: i === 4 ? '2 3' : i === 3 ? '' : '6 4', opacity: .9 });
      s += rect(22, y - 9, 150, 18, PAPER, 'none', { rx: 3, opacity: .9 }) + T(26, y, a, { size: 11, weight: 700, anchor: 'start' }) + T(26 + a.length * 6.6 + 6, y, b, { size: 9.5, anchor: 'start', fill: INK2 });
    });
    // bridge on the left with a pier
    s += rect(20, 74, 230, 14, PAPER2, INK, { rx: 2, sw: 1.4 }) + rect(238, 88, 14, 330 - 88, PAPER2, INK, { rx: 1 });
    s += T(130, 60, 'bridge', { size: 11.5, weight: 700 });
    s += dim(120, 88, yHAT, ['Vertical clearance', 'measured from HAT'], MAG, { dx: 8 });
    // charted depth arrow
    s += dim(300, yLAT, 294, ['Charted depth', 'below chart datum (LAT)'], LAND_INK, { dx: 8 });
    // lantern on the shore
    const lx = 480, lyTop = 95;
    s += rect(lx - 6, lyTop + 8, 12, 150 - lyTop, PAPER, INK, { rx: 1 }) + `<circle cx="${lx}" cy="${lyTop + 2}" r="7" fill="${C.yellow}" stroke="${INK}" stroke-width="1.2"/>`;
    s += dim(466, lyTop + 2, yMHW, ['Light elevation (21m)', 'above MHW'], LAND_INK, { dx: -8, anchor: 'end' });
    // hill height
    s += dim(600, 58, yMSL, ['Land height', 'above MSL'], LAND_INK, { dx: -8, anchor: 'end' });
    // notes
    s += rect(20, 352, 600, 66, PAPER, LINE, { rx: 6 });
    s += T(32, 368, 'Depths 0.5 to 10.5 m are written with decimetres (7,3); deeper water in whole metres. Position = centre of the figure.', { size: 11, anchor: 'start' });
    s += T(32, 386, 'South coast (Swedish border to Utsira): chart datum is 20 cm below LAT; inner Oslo fjord: 30 cm below LAT.', { size: 11, anchor: 'start' });
    s += T(32, 404, 'Reason: there the weather moves the water more than the tide does, so the zero level is set lower for safety.', { size: 11, anchor: 'start', fill: INK2 });
    return S.svg(W, H, s, { label: 'Cross-section of coast and sea with the five reference levels: HAT (bridge and overhead-cable clearances), MHW (the coastline and light elevations), MSL (land heights), LAT = chart datum (charted depths) and 0.5 m below chart datum (lower limit of the drying area).' });
  }
  /* electronic aids: the same water on a plotter zoomed out and zoomed in */
  function plotterZoom() {
    const W = 640, H = 330;
    let s = T(W / 2, 20, 'Same water, two zoom levels on a chart plotter', { size: 15, weight: 700 });
    const screen = (x, y, w, h, zoomIn) => {
      let g = rect(x, y, w, h, '#0b1f2e', INK, { rx: 10, sw: 2 });
      g += rect(x + 10, y + 10, w - 20, h - 50, '#dfe9ee', 'none', { rx: 4 });
      // land masses
      g += `<path d="M${x + 10},${y + 10} h${w * .32} q-10,40 -30,60 q-30,30 -70,20 Z" fill="${LAND}" stroke="${LAND_INK}" stroke-width="1"/>`;
      g += `<path d="M${x + w - 10},${y + h - 40} v-${h * .45} q-40,10 -60,40 q-20,40 10,60 Z" fill="${LAND}" stroke="${LAND_INK}" stroke-width="1"/>`;
      // route and boat
      const bx = x + w * .3, by = y + h - 70, ex = x + w * .78, ey = y + 40;
      g += ln(bx, by, ex, ey, MAG, { sw: 1.6, dash: '5 4' });
      g += `<polygon points="${fx(bx)},${fx(by - 10)} ${fx(bx + 6)},${fx(by + 7)} ${fx(bx - 6)},${fx(by + 7)}" fill="${C.red}" transform="rotate(${Math.atan2(ey - by, ex - bx) * 180 / Math.PI + 90} ${fx(bx)} ${fx(by)})"/>`;
      if (zoomIn) {
        // the rock and soundings appear right on the track
        const rx = (bx + ex) / 2 + 6, ry = (by + ey) / 2;
        g += plus(rx, ry, 9, 2) + upright(rx + 12, ry + 2, '1,8', 11, { anchor: 'start', fill: LAND_INK });
        g += italic(rx - 40, ry - 30, '14', 11, { fill: LAND_INK }) + italic(rx + 40, ry + 30, '23', 11, { fill: LAND_INK }) + italic(rx - 50, ry + 32, '9,6', 11, { fill: LAND_INK });
        g += `<circle cx="${fx(rx)}" cy="${fx(ry)}" r="20" fill="none" stroke="${C.red}" stroke-width="2"/>`;
      }
      g += T(x + w / 2, y + h - 22, zoomIn ? 'zoomed IN: a 1,8 m rock sits on the planned track' : 'zoomed OUT: the track looks clear', { size: 12, fill: '#ffffff', weight: 700 });
      return g;
    };
    s += screen(20, 36, 290, 230, false) + screen(330, 36, 290, 230, true);
    s += T(W / 2, 290, 'Small-scale display drops symbols that the chart data contain. Plan the route zoomed in, leg by leg.', { size: 12, weight: 600 });
    s += T(W / 2, 312, 'GPS tells you where you are; only an updated chart tells you whether that place is safe.', { size: 11.5, fill: INK2 });
    return S.svg(W, H, s, { label: 'Two chart-plotter screens showing the same planned track: zoomed out the water looks clear, zoomed in a rock of 1.8 m depth appears on the track.' });
  }
  /* Spec 17 simplified: tidal range along the coast, south to north */
  function tideStrip() {
    const W = 640, H = 322;
    const st = [['Oslo', 0.72], ['Mandal', 0.50], ['Bergen', 1.8], ['Kristiansund', 2.65], ['Harstad', 2.68], ['Narvik', 3.82], ['Vadso', 3.97]];
    let s = T(W / 2, 20, 'Tidal range (HAT minus LAT) along the Norwegian coast', { size: 15, weight: 700 });
    const x0 = 60, x1 = 600, base = 222, scale = 38;
    s += ln(x0 - 20, base, x1 + 20, base, INK, { sw: 1.4 });
    s += T(x0 - 20, base + 16, 'south-east (Skagerrak)', { size: 10.5, fill: INK2, anchor: 'start' }) + T(x1 + 20, base + 16, 'north (Finnmark)', { size: 10.5, fill: INK2, anchor: 'end' });
    st.forEach(([n, v], i) => {
      const x = x0 + i * (x1 - x0) / (st.length - 1), h = v * scale;
      s += rect(x - 16, base - h, 32, h, WATER, C.blue, { rx: 2 });
      s += T(x, base - h - 10, v.toFixed(2).replace(/0$/, '') + ' m', { size: 12, weight: 700 });
      s += T(x, base + 34, n, { size: 11.5 });
    });
    // amphidromic point marker between Mandal and Bergen
    const ax = x0 + 1.5 * (x1 - x0) / (st.length - 1);
    s += T(ax, base - 14, '*', { size: 30, fill: MAG, weight: 700 }) + ln(ax, 64, ax, base - 30, MAG, { sw: 1.2, dash: '3 3' });
    s += T(ax, 44, 'amphidromic point west of Egersund', { size: 10.5, fill: MAG, weight: 700 }) + T(ax, 57, '(almost no tide)', { size: 10.5, fill: MAG });
    s += rect(20, 276, 600, 40, PAPER, LINE, { rx: 6 });
    s += T(W / 2, 290, 'South: the weather (wind, air pressure) often moves the water more than the tide does.', { size: 11, fill: INK2 });
    s += T(W / 2, 305, 'North: ranges approach 4 m, with two high and two low waters a day.', { size: 11, fill: INK2 });
    return S.svg(W, H, s, { label: 'Bars showing the tidal range from south to north: Oslo 0.72 m, Mandal 0.50 m, Bergen 1.8 m, Kristiansund 2.65 m, Harstad 2.68 m, Narvik 3.82 m, Vadso 3.97 m, with the amphidromic point west of Egersund marked.' });
  }

  // =====================================================================================
  BOAT.register({
    id: 'charts-and-navigation',
    title: 'Charts, compass and navigation',
    order: 6,
    examShare: 7,
    examWeight: 'about 7 of 50 questions, several of them in part 4',
    summary: 'How to read a Norwegian nautical chart and use it with a compass: the grid of latitude and longitude, the nautical mile and the knot, chart datum and the five reference levels, the symbols for rocks, shoals, wrecks, cables, pipelines, bridges and overhead power lines, lights and their descriptions, magnetic variation and deviation and how to convert between true, magnetic and compass courses, speed-time-distance arithmetic, fixing your position, what GPS and plotters can and cannot do, and tides. This is curriculum part 3 (navigation and chart reading); the chart symbols for dangers are also part 4 item 1.4.2, where more than two wrong answers fail the whole exam.',
    sections: [
      // 1 ------------------------------------------------------------
      {
        id: 'intro',
        title: 'What the exam asks, and the chart you will be handed',
        html: `<p>Navigation is the one part of the exam where you work with paper: before the exam you receive excerpts of <strong>four nautical charts</strong>, and the questions send you into them to read positions, measure distances, identify symbols and decode lights. You may bring a <strong>calculator (memory cleared)</strong>, a <strong>ruler or parallel ruler</strong>, <strong>dividers</strong>, pencil or pen and scrap paper. A <strong>mobile phone is not allowed</strong>, not even as a calculator. The invigilator may help you find a named light in the chart, but gives no other help.</p>
<p>The curriculum calls this <strong>part 3, navigation and chart reading</strong>: chart construction, symbols and chart datum; how the compass works; what causes variation and deviation and how to allow for them; the possibilities and limitations of GPS, electronic charts and apps; current and tide; and practical calculations of position, course, speed and distance. Roughly a quarter of the 50 questions come from this part. On top of that, the symbols for <strong>rocks awash, shoals, bridges, cables, pipelines and overhead power lines</strong> and the sectors and characters of minor lights are <strong>part 4 item 1.4.2</strong>: "particularly important" knowledge where <strong>more than two errors fail the whole exam</strong>. Learn those symbols until they are automatic.</p>
<p>Norwegian official charts are produced by the Norwegian Hydrographic Service, part of the Norwegian Mapping Authority (Kartverket). The <strong>main series is at 1:50 000</strong> (143 charts along the mainland coast). <strong>Harbour charts</strong> use larger scales, <strong>1:5 000 to 1:25 000</strong>, and show more detail of a smaller area; <strong>coastal charts</strong> at 1:350 000 and general charts at 1:700 000 and smaller show the big picture. Where a chart shows the limits of a larger-scale chart or inset, use that one: it carries more navigational information.</p>
<p>All charts are printed on demand and re-issued every <strong>14 days</strong> with the latest corrections, which are announced in the Norwegian Notices to Mariners. Keeping the chart you use corrected is <strong>your</strong> responsibility, and the same applies to the data in a plotter or an app.</p>
<div class="callout tip"><p>"Larger scale" means a <em>larger</em> fraction: 1:20 000 is larger than 1:50 000 and shows <em>more</em> detail of <em>less</em> area. Harbour chart = large scale = detail.</p></div>`,
        illustration: () => S.chartExcerpt(),
        caption: 'An invented chart excerpt with the things this topic teaches: land, blue depth contours and tint, italic soundings, upright shoal depths in a danger circle, rock symbols, lateral buoys with the magenta direction-of-buoyage arrow, a sector light, a leading line, a wreck and an obstruction.',
        keyFacts: ['Exam: four chart excerpts; calculator (cleared), ruler/parallel ruler, dividers, pencil, scrap paper; no mobile phone', 'Part 3 = navigation and chart reading (about a quarter of the exam); danger symbols and minor lights are also part 4 item 1.4.2 (max 2 errors)', 'Main chart series 1:50 000; harbour charts 1:5 000 to 1:25 000 (more detail); coastal charts 1:350 000', 'Charts re-issued every 14 days with corrections from the Norwegian Notices to Mariners; updating is the user\'s responsibility', 'Larger scale = more detail of a smaller area; use the largest-scale chart available'],
        check: { id: 'charts-c1', q: 'You have a 1:50 000 chart and a 1:10 000 harbour chart of the same bay. Which shows more detail?', options: ['The 1:50 000 chart, because 50 000 is the bigger number', 'The 1:10 000 harbour chart, because it is the larger scale', 'They show the same detail; only the paper size differs', 'Neither; detail is only shown on electronic charts'], answer: 1, explanation: 'A larger scale (1:10 000) covers a smaller area with more detail, and INT1 says the larger-scale chart or inset should normally be used because it contains more navigational information (F4, F5).' },
      },
      // 2 ------------------------------------------------------------
      {
        id: 'grid',
        title: 'Latitude, longitude, the nautical mile and measuring distance',
        html: `<p>Every chart is wrapped in a grid. <strong>Latitude</strong> is measured 0 to 90 degrees north or south of the equator and is printed on the <strong>left and right</strong> borders. <strong>Longitude</strong> is measured 0 to 180 degrees east or west of Greenwich and is printed on the <strong>top and bottom</strong> borders. Each degree has 60 minutes, and the chart divides each minute into tenths. A position is written <strong>latitude first</strong>, in degrees, minutes and decimal minutes: <strong>59°54,5'N 010°44,0'E</strong>. All of Norway is north and east, from about 58°N to 71°N and from about 4.5°E to 31°E, so every exam position ends in N and E. Write longitude with three digits (010°, not 10°).</p>
<p>To read a position from a dot in the chart, draw (or lay the ruler along) a horizontal line to the side border and read the latitude; then a vertical line to the top border and read the longitude. To plot a GPS position do the reverse: find the latitude on the side scale, the longitude on the top scale, and bring them together with the parallel ruler.</p>
<p>The <strong>nautical mile</strong> (NM, written M on the chart) is <strong>1852 m</strong>, and it equals <strong>one minute of latitude</strong>. That is why distance is always measured with the dividers on the <strong>latitude scale</strong> at the side of the chart, level with the leg you measured. A <strong>cable</strong> is a tenth of a mile, 185.2 m. A <strong>knot</strong> is a speed of one nautical mile per hour (about 1.85 km/h, so 10 knots is about 18.5 km/h).</p>
<div class="callout warn"><p><strong>Never measure distance on the longitude scale</strong> (top or bottom border). Minutes of longitude shrink toward the pole: at 60°N one minute of longitude is only about 0.5 NM (926 m). On a harbour chart you may also use the printed scale bar.</p></div>`,
        illustration: () => S.latitudeScale(),
        caption: 'Dividers span the leg, then move to the latitude scale at the side: 1 minute of latitude = 1 NM = 1852 m. The longitude minutes along the top are about half as long at 60°N and must never be used for distance.',
        keyFacts: ['Position: latitude first, degrees + minutes + decimal minutes, e.g. 59°54,5\'N 010°44,0\'E; Norway is N and E', 'Latitude on the side borders, longitude on the top and bottom borders', '1 nautical mile = 1852 m = 1 minute of latitude; 1 cable = 0.1 NM = 185.2 m', '1 knot = 1 NM per hour (about 1.85 km/h)', 'Measure distance on the LATITUDE scale level with the leg, never on the longitude scale (1\' of longitude is about 0.5 NM at 60°N)'],
        check: { id: 'charts-c2', q: 'With the dividers you span a leg and move them to the side border, where they cover 7.5 minutes of latitude. How long is the leg?', options: ['7.5 nautical miles', '3.75 nautical miles', '7.5 km', '75 nautical miles'], answer: 0, explanation: 'One minute of latitude is one nautical mile (1852 m), so 7.5 minutes on the side scale is 7.5 NM. Half that would be the longitude-scale error at 60°N (F65, F68, WE-4).' },
      },
      // 3 ------------------------------------------------------------
      {
        id: 'datum',
        title: 'Chart datum, depths, heights and clearances',
        html: `<p>A depth figure is useless unless you know which water level it is measured from. Norwegian charts use <strong>chart datum = Lowest Astronomical Tide (LAT)</strong>, the lowest level the tide alone can produce, with no help from the weather. It has been the datum since 1 January 2000. Because the real water is almost always above LAT, the charted depth is a near-worst case: you normally have <em>more</em> water than the chart says.</p>
<p>There are two exceptions. Along the <strong>south coast from the Swedish border to Utsira the datum is set 20 cm below LAT</strong>, and in the <strong>inner Oslo fjord 30 cm below LAT</strong>, because there the tide is tiny and wind and air pressure move the water more than the tide does; the Norwegian Mapping Authority lowers the zero level "for safety reasons".</p>
<p>Depths are in metres below chart datum. Between 0.5 and 10.5 m they are written with decimetres and a decimal comma (<strong>7,3</strong>); deeper water is in whole metres. The position of a sounding is the centre of the figure. <strong>Ordinary soundings are italic (sloping)</strong>; <strong>rock and shoal depths are upright</strong>, which is how you spot a danger in open water. Depth contours are blue, and on charts of 1:50 000 and larger a blue tint normally fills the water shallower than the <strong>10 m contour</strong>, so white water is usually deeper than 10 m; always check the chart's own legend, and remember that an upright figure or a cross can sit in white water.</p>
<p>Each kind of height has its own zero. The <strong>coastline is drawn at Mean High Water (MHW)</strong>, and the <strong>elevation of a light</strong> (the "21m" in a light description) is also above MHW. <strong>Land heights are above Mean Sea Level (MSL)</strong>. The <strong>vertical clearance under bridges and overhead power lines is measured from Highest Astronomical Tide (HAT)</strong>, so a charted clearance of 12 m is the clearance at the highest tide; at any lower water level you have more room, and only a storm surge above HAT can take some of it away. The <strong>drying area</strong> between the coastline and 0.5 m below chart datum is tinted green; rocks there are shown with a star symbol.</p>
<div class="callout rule"><p>Depths from <strong>LAT</strong> (chart datum). Bridge and cable clearances from <strong>HAT</strong>. Coastline and light elevations at <strong>MHW</strong>. Land heights from <strong>MSL</strong>.</p></div>`,
        illustration: () => datumSection(),
        caption: 'The five reference levels in one cross-section. The water is rarely below chart datum and rarely above HAT, so both charted depths and charted clearances are on the safe side.',
        keyFacts: ['Chart datum = LAT (since 2000); south coast Swedish border to Utsira 20 cm below LAT, inner Oslo fjord 30 cm below LAT', 'Depths 0.5 to 10.5 m with decimetres (7,3); italic = ordinary sounding, upright = rock or shoal', 'Blue tint normally to the 10 m contour on 1:50 000 charts; white water is usually deeper than 10 m but can hold a rock symbol', 'Bridge and overhead-line clearance above HAT; light elevation above MHW; coastline at MHW; land heights above MSL', 'Drying area: between the coastline (MHW) and 0.5 m below chart datum'],
        check: { id: 'charts-c3', q: 'A bridge is charted with a vertical clearance of 12 m. Your mast top is 11.5 m above the water. The water level today is 0.4 m below HAT. Can you pass?', options: ['No: the clearance is measured from chart datum, so it is less today', 'Yes: clearance is measured from HAT, so today you have about 12.4 m', 'Only at low water, because the clearance is measured from mean sea level', 'No: a safety margin of 1 m is required by law'], answer: 1, explanation: 'Clearances under bridges and overhead cables are referred to HAT; with the water 0.4 m below HAT the real clearance is about 12.4 m, more than the 11.5 m mast. Only a surge above HAT reduces the clearance below the charted figure (F18, WE-8).' },
      },
      // 4 ------------------------------------------------------------
      {
        id: 'rocks',
        title: 'Rocks, shoals and wrecks: the danger symbols (part 4)',
        html: `<p>These symbols are part 4 item 1.4.2: the examiners expect you to recognise a danger at a glance. The international chart standard (INT1, section K) grades rocks by how far they stick up relative to the water levels you learned in the previous section.</p>
<ul>
<li><strong>Islet or rock that never covers</strong> (K10): a small land-coloured outline with its <strong>height above MHW in brackets</strong>, e.g. (1,7).</li>
<li><strong>Rock that covers and uncovers</strong> (K11): a six-pointed <strong>star</strong>. It lies between chart datum and MHW, so it dries at low water and hides at high water. A drying height may be given.</li>
<li><strong>Rock awash at chart datum</strong> (K12): a <strong>cross with a dot in each of the four quadrants</strong>. The rock lies between chart datum and 0.5 m below it, so at low water the sea washes over it and it is very hard to see.</li>
<li><strong>Underwater rock of unknown depth, dangerous to surface navigation</strong> (K13): a <strong>plain cross (+)</strong>.</li>
<li><strong>Underwater rock of known depth</strong>: internationally an upright depth figure inside a <strong>dotted danger circle</strong> (K14) when it lies in deeper surroundings. <strong>Norwegian charts</strong> keep the + and print the depth in small upright figures beside it for rocks <strong>0.5 to 9.9 m</strong> deep ("+ 7,5"); a shoal <strong>deeper than 10 m</strong> is shown as an <strong>upright figure alone</strong> (an upright "12" among italic soundings marks the shallowest point of the shoal).</li>
</ul>
<p>A <strong>dotted danger line</strong> (K1) draws attention to a danger that would not stand out, or encloses an area with so many dangers that it is unsafe to navigate inside it. <strong>Wrecks</strong> carry "Wk": a wreck symbol (a short hull line crossed by three strokes) inside a dotted circle is dangerous, depth unknown; the same symbol without a circle is considered covered by at least 20 m; a known least depth is written as "25 Wk". <strong>"Obstn"</strong> in a dotted circle is an obstruction, and <strong>"Foul"</strong> marks foul ground that will not hurt a boat but will catch an anchor.</p>
<div class="callout warn"><p>Do not mistake the cross-with-four-dots for a church or a wreck. Church symbols stand on land; the four dots mean <em>awash</em>: a rock at the water's surface at low water.</p></div>`,
        illustration: () => rockRow(),
        caption: 'The rock symbols graded by level: above water (height in brackets), drying (star), awash (cross with four dots), submerged of unknown depth (plain cross), known depth (Norwegian + with figure, or upright figure in a danger circle), deep shoal (upright figure alone) and the dotted danger line.',
        keyFacts: ['Cross with four dots = rock awash at chart datum (between CD and 0.5 m below)', 'Plain cross (+) = underwater rock of unknown depth, dangerous', 'Six-pointed star = rock that covers and uncovers (between CD and MHW); (1,7) beside a small islet = height above MHW', 'Norwegian charts: + with a small upright depth (7,5) = rock 0.5 to 9.9 m deep; upright figure alone = shoal deeper than 10 m', 'Dotted danger circle or danger line = danger; wreck symbol in a circle = dangerous wreck; "Obstn" = obstruction; "Foul" = foul ground'],
        check: { id: 'charts-c4', q: 'In white (untinted) water you notice an upright "4" inside a dotted circle, while the figures around it are sloping. What is it?', options: ['An ordinary sounding of 4 m that happens to be printed upright', 'A buoy numbered 4', 'A dangerous rock or shoal with 4 m of water over it', 'A spot where anchoring is prohibited'], answer: 2, explanation: 'Upright figures are rock and shoal depths, and the dotted danger circle marks a danger lying in deeper surroundings (INT1 K14, F13, F25). Italic figures are ordinary soundings.' },
      },
      // 5 ------------------------------------------------------------
      {
        id: 'lines',
        title: 'Cables, pipelines, overhead lines, bridges and areas (part 4)',
        html: `<p>The second group of part-4 symbols concerns things you must not anchor on, must not hit from below, and must not hit from above. On the chart they are mostly printed in <strong>magenta</strong>, the colour used for information that is not a physical feature of the seabed.</p>
<ul>
<li><strong>Submarine cable</strong> (L30): a <strong>wavy magenta line</strong>. A <strong>submarine power cable</strong> (L31) is the same wavy line with small <strong>lightning zigzags</strong> at intervals. A <strong>cable area</strong> is bounded by a dashed magenta line carrying the wavy symbol, usually labelled. Anchoring on a cable can cut the power to an island, and a fouled anchor on a live cable can kill.</li>
<li><strong>Pipeline</strong> (L40): a magenta line of <strong>long dashes with a dot between each dash</strong>, labelled "Oil", "Gas" or "Water" when known. A pipeline area is bounded by a dashed line carrying the same dash-dot symbol. Disused cables and pipelines are drawn broken.</li>
<li><strong>Overhead power line</strong> (D26): a straight line between two <strong>pylon symbols</strong> across the water, with its <strong>vertical clearance in metres above HAT</strong> written beside it. The clearance refers to the lowest point of the wires; a mast or an aerial that touches a high-voltage line is lethal, so compare the figure with your air draught before you go under.</li>
<li><strong>Bridges</strong> (D20 onwards): drawn in plan across the water with the <strong>vertical clearance above HAT</strong> beside the span, and sometimes a horizontal clearance. Opening bridges are marked as such.</li>
<li><strong>Anchoring prohibited</strong> (N20): an <strong>anchor struck through</strong> by a line. An <strong>anchorage</strong> (N12) is an anchor symbol inside a dashed boundary, sometimes with a time limit such as "24h". A restricted or prohibited area is bounded by a magenta T-dashed line, often with a tint band.</li>
<li><strong>Ferry routes</strong> (M50) are dashed magenta lines between the terminals with a ferry symbol or label. A <strong>cable ferry</strong> (M51) pulls itself along a wire that can lie near the surface: never pass between the ferry and its landing.</li>
</ul>
<div class="callout tip"><p>Wavy = cable (think of a loose rope on the seabed); add lightning = power. Dash-dot-dash = pipeline (think of the joints in a pipe). Pylons on both shores with a number = overhead line, number above HAT.</p></div>`,
        illustration: () => linesRow(),
        caption: 'Cable, power cable, cable area and pipeline in magenta; overhead power line and bridge with their clearances above HAT; anchoring prohibited; cable ferry.',
        keyFacts: ['Wavy magenta line = submarine cable; wavy line with lightning zigzags = power cable; do not anchor on either', 'Magenta long dash - dot - long dash = pipeline ("Oil", "Gas", "Water")', 'Overhead power line: line between two pylon symbols with the clearance in metres above HAT', 'Bridge: plan symbol across the water with the vertical clearance above HAT', 'Anchor struck through = anchoring prohibited; dashed line labelled Cable Ferry = wire near the surface, never pass between ferry and landing'],
        check: { id: 'charts-c5', q: 'A straight line crosses a narrow sound between two small pylon symbols, with the figure "22" beside it. What does it tell you?', options: ['A submarine cable 22 m deep', 'An overhead power line with 22 m clearance above HAT', 'A ferry route 22 cables long', 'A pipeline carrying gas at 22 bar'], answer: 1, explanation: 'Pylon symbols joined by a line show an overhead power line (INT1 D26); the figure is the vertical clearance in metres above Highest Astronomical Tide (F18, Spec 6).' },
      },
      // 6 ------------------------------------------------------------
      {
        id: 'lights',
        title: 'Lights in the chart: descriptions, sectors and leading lines',
        html: `<p>A light is charted as a position dot with a <strong>magenta flare</strong> and a short text. On single-colour charts the flare is magenta whatever the light's colour; on multicoloured charts the flare carries the colour, and sector lights show their colours as arcs. The description looks like <strong>Fl(3) WRG 15s 21m 15-11M</strong> and reads: <strong>Fl(3)</strong> group flashing, three flashes; <strong>WRG</strong> white, red and green sectors; <strong>15s</strong> the period, one complete sequence of flashes and darkness; <strong>21m</strong> the elevation of the light above MHW; <strong>15-11M</strong> the nominal range in nautical miles, white 15, green 11, red in between. Range is a clear-weather figure, not a promise: a low boat may have the light below the horizon.</p>
<p>The <strong>character</strong> abbreviations: <strong>F</strong> fixed; <strong>Oc</strong> occulting (light longer than dark); <strong>Iso</strong> isophase (equal light and dark); <strong>Fl</strong> flashing (dark longer than light); <strong>LFl</strong> long flash of 2 s or more; <strong>Q</strong> quick (50 to 79 flashes a minute); <strong>VQ</strong> very quick (80 to 159); <strong>Mo(A)</strong> Morse letter; <strong>Al</strong> alternating colours. Colours: W, R, G, Y, and more rarely Bu, Vi, Or.</p>
<p>Norway has close to 2 000 <strong>sector lights</strong>. The <strong>white sector marks the fairway</strong>; <strong>red and green sectors mark foul ground</strong>. Since the IALA conversion completed in November 2025, every Norwegian sector light follows one rule: heading <strong>toward the light in its white sector, green lies to starboard and red to port</strong>. If the light turns red, you have drifted toward the port edge: alter to starboard until it is white again. Sector limits in the chart and the list of lights are <strong>true bearings from the sea toward the light</strong>. The Norwegian Coastal Administration warns that <strong>shoals can still exist inside a white sector</strong>: white means "the intended traffic can pass", not "deep everywhere".</p>
<p>A <strong>leading line</strong> (transit) is two marks or lights that you keep exactly in line; the firm part of the charted line is the track and its direction is given in degrees true ("Ldg 270°"). A <strong>direction light</strong> ("Dir 269°") does the same with one narrow sector.</p>`,
        illustration: () => S.lightDecoder(),
        caption: 'Decoding Fl(3) WRG 15s 21m 15-11M: group of three flashes, white-red-green sectors, 15-second period, 21 m above MHW, white range 15 NM, green 11 NM.',
        keyFacts: ['Light: dot with a magenta flare; description e.g. Fl(3) WRG 15s 21m 15-11M', '21m = elevation above MHW; 15-11M = nominal range in NM (white 15, green 11, red between)', 'F fixed, Oc occulting, Iso equal, Fl flashing, LFl long flash (2 s or more), Q quick (50-79/min), VQ very quick (80-159/min)', 'Sector light: white = fairway, red and green = foul ground; heading toward the light in white, green is to starboard and red to port', 'Sector limits are true bearings from the sea toward the light; shoals may still lie inside a white sector'],
        check: { id: 'charts-c6', q: 'At night you steer toward a sector light and it shows red. According to the Norwegian (IALA) convention, where are you?', options: ['Toward the starboard edge of the fairway; alter course to port', 'Toward the port edge of the fairway; alter course to starboard until the light turns white', 'Exactly in the fairway; red marks the centre', 'Beyond the light\'s range; get closer'], answer: 1, explanation: 'Heading toward the light in its white sector, red lies to port and green to starboard. Seeing red means you have moved into the red sector on the port side of the fairway, so alter to starboard (F38, WE-9).' },
      },
      // 7 ------------------------------------------------------------
      {
        id: 'compass',
        title: 'The compass and magnetic variation',
        html: `<p>A magnetic compass is a magnetised needle or card floating in liquid that lines itself up with the Earth's magnetic field. It therefore points to <strong>magnetic north</strong>, not to the geographic (true) north that the chart grid uses. The angle between the two is <strong>magnetic variation</strong>. It is a property of the place, not of your boat: every compass in the same area has the same variation, and it changes slowly from year to year as the Earth's field drifts.</p>
<p>In Norway variation is <strong>easterly everywhere</strong>, meaning magnetic north lies to the <em>right</em> of true north. the Norwegian Mapping Authority gives about zero degrees on the west coast rising to <strong>about 15° E in East Finnmark</strong>, and it increases by roughly 0.1 to 0.2° per year; the 2026 world magnetic model puts Bergen near 3° E, Oslo near 5° E and the Tromso area near 11° E. Do not let "Norway is far north" tempt you into assuming westerly variation.</p>
<p>The chart tells you the local value. The <strong>compass rose</strong> has an outer ring of true directions and an inner ring rotated by the variation to show magnetic directions, with an annotation such as <strong>"4° E 2020 (8'W)"</strong>: variation 4° east in 2020, decreasing 8 minutes of arc per year, so 3°52' E in 2021. In the exam, use the value printed on your chart excerpt; apply the annual change only if the question asks. Small-scale charts draw isogonic lines joining points of equal variation, and areas of local magnetic anomaly, where the compass may be unreliable, are marked.</p>
<div class="callout rule"><p><strong>True course</strong> is what you measure in the chart. <strong>Magnetic course</strong> is the true course corrected for variation. <strong>Compass course</strong> is the magnetic course also corrected for your boat's deviation; it is the number you steer by.</p></div>
<p>Even a good compass only helps if you steer a steady average course: a 5° error over 1 km puts you about 90 m off track, and over 10 NM roughly 0.9 NM.</p>`,
        illustration: () => S.compassRose({ variation: 4 }),
        caption: 'A chart compass rose: outer ring true, inner ring magnetic, rotated 4° clockwise for 4° E variation. The annotation "4° E 2020 (8\'W)" gives the value, its year and its annual change.',
        keyFacts: ['The compass points to magnetic north; variation is the angle between magnetic and true north', 'Variation in Norway is easterly everywhere: about 0° on the west coast to about 15° E in East Finnmark (Oslo about 5° E, Bergen about 3° E in 2026); changes 0.1 to 0.2° a year', '"4° E 2020 (8\'W)" on the rose = 4° east in 2020, decreasing 8 minutes per year', 'Easterly variation: magnetic north lies to the RIGHT of true north', 'True course from the chart; magnetic = true corrected for variation; compass = magnetic corrected for deviation'],
        check: { id: 'charts-c7', q: 'The compass rose on your chart reads "3° E 2020 (10\'E)". What is the variation in 2026 if you apply the annual change?', options: ['3° E', '4° E', '2° E', '3° W'], answer: 1, explanation: 'The annual change is 10 minutes easterly, so after six years the variation has grown by 60 minutes = 1°: 3° E + 1° = 4° E (F76, WE-3).' },
      },
      // 8 ------------------------------------------------------------
      {
        id: 'deviation',
        title: 'Deviation and converting between true, magnetic and compass',
        html: `<p>Your own boat disturbs the compass. The engine, iron fittings, loudspeakers and electronics create a magnetic field of their own, and the compass error they cause is <strong>deviation</strong>. Unlike variation, deviation <strong>belongs to the boat and changes with the heading</strong>: it may be 4° E when you steer north and 2° W when you steer east. It is measured by swinging the compass and recorded in a <strong>deviation table</strong> for that boat. Keep phones, knives and speakers away from the compass; they add deviation the table does not know about.</p>
<p>Norwegian teaching gives easterly errors a plus sign and westerly errors a minus sign. Then the conversion is one line each way:</p>
<div class="callout rule"><p><strong>Compass to true (add east):</strong> magnetic = compass + deviation; true = magnetic + variation.<br><strong>True to compass (subtract east):</strong> magnetic = true − variation; compass = magnetic − deviation.<br>Westerly values carry a minus sign, so "subtracting" them means adding.</p></div>
<p>Two mnemonics say the same thing. <strong>CADET</strong>: Compass, ADd East, to get True. And <strong>"error east, compass least; error west, compass best"</strong>: with an easterly error the compass reads less than true, with a westerly error it reads more.</p>
<p><strong>Worked example 1</strong>: compass course 359°, deviation 4° E, variation 4° E. Magnetic = 359 + 4 = 363 → <strong>003°</strong>. True = 003 + 4 = <strong>007°</strong>. Remember to wrap past 360.</p>
<p><strong>Worked example 2</strong>: the chart gives a true course of 146°, variation 4° W, deviation 2° E. Magnetic = 146 − (−4) = <strong>150°</strong> (westerly variation is added going from true to magnetic). Compass = 150 − 2 = <strong>148°</strong>. Steer 148° by compass.</p>
<p>The same arithmetic converts <strong>bearings</strong>: a compass bearing of 036° with variation 4° E and no deviation is a true bearing of 040°, and only true bearings are plotted on the chart. The syllabus stresses understanding <em>what causes</em> variation and deviation and <em>how to allow</em> for them more than long sums, so make sure you can explain both in one sentence each.</p>`,
        illustration: () => S.courseTriangle({ compass: 359, variation: 4, deviation: 4 }),
        caption: 'The correction ladder: going up from compass to true you ADD easterly deviation and variation; going down from true to compass you subtract them. Compass 359° + 4° E + 4° E = true 007°.',
        keyFacts: ['Deviation = compass error caused by the boat\'s own magnetism; changes with heading; recorded in the boat\'s deviation table', 'Variation = the Earth\'s field, from the chart, same for every boat in the area', 'East positive, west negative. Compass → true: ADD. True → compass: SUBTRACT (CADET; "error east, compass least")', 'Compass 359°, dev 4° E, var 4° E → magnetic 003°, true 007° (wrap past 360)', 'True 146°, var 4° W → magnetic 150°; with dev 2° E → compass 148°'],
        check: { id: 'charts-c8', q: 'Your chart course is 090° true. Variation is 3° E and the deviation table gives 2° W on this heading. What compass course do you steer?', options: ['085°', '089°', '091°', '095°'], answer: 1, explanation: 'True to compass: subtract east, add west. Magnetic = 090 − 3 = 087°; compass = 087 + 2 = 089° (F80).' },
      },
      // 9 ------------------------------------------------------------
      {
        id: 'std',
        title: 'Speed, time and distance',
        html: `<p>Every passage plan and every dead-reckoning position rests on one relationship: <strong>distance = speed × time</strong>, with distance in nautical miles, speed in knots and time in <strong>hours</strong>. Rearranged: speed = distance ÷ time, and time = distance ÷ speed. The only trap is the units. Exam questions give time in minutes; <strong>divide minutes by 60</strong> to get hours before you multiply, and convert decimal hours back to minutes at the end (0.5 h = 30 min, 0.625 h = 37.5 min).</p>
<p><strong>12 knots for 40 minutes</strong>: 12 × 40/60 = <strong>8 NM</strong>. <strong>15 NM at 10 knots</strong>: 15 ÷ 10 = 1.5 h = <strong>1 h 30 min</strong>. <strong>4.5 NM in 27 minutes</strong>: 27/60 = 0.45 h; 4.5 ÷ 0.45 = <strong>10 knots</strong>. <strong>7.5 NM at 12 knots</strong>: 7.5 ÷ 12 = 0.625 h = <strong>37.5 minutes</strong>.</p>
<p>The <strong>six-minute rule</strong> makes mental arithmetic easy: six minutes is a tenth of an hour, so in six minutes you cover a <strong>tenth of your speed</strong> in miles. At 18 knots you run 1.8 NM every 6 minutes, so 6 NM in 20 minutes. Checking the log at each six-minute mark is the simplest way to keep a dead-reckoning position without a calculator.</p>
<p>Do not mix the two kinds of minute. <strong>Minutes of time</strong> are divided by 60 to give hours; <strong>minutes of arc</strong> on the latitude scale are nautical miles. "0.5 minutes" on the side scale is 0.5 NM, about 926 m, and has nothing to do with the clock.</p>
<div class="callout tip"><p>Write the triangle on your scrap paper: D on top, S and T below. Cover the one you want: side by side means multiply (D = S × T), one above the other means divide (S = D ÷ T, T = D ÷ S).</p></div>`,
        illustration: () => S.std({ speed: 12, minutes: 40 }),
        caption: 'The speed-time-distance triangle with two worked examples: 12 kn × 40/60 h = 8 NM, and 15 NM ÷ 10 kn = 1.5 h = 1 h 30 min.',
        keyFacts: ['Distance (NM) = speed (kn) × time (h); time = distance ÷ speed; speed = distance ÷ time', 'Minutes of time ÷ 60 = hours: 40 min = 0.667 h, 27 min = 0.45 h', '12 kn for 40 min = 8 NM; 15 NM at 10 kn = 1 h 30 min; 4.5 NM in 27 min = 10 kn', 'Six-minute rule: in 6 minutes you cover one tenth of your speed in NM (18 kn → 1.8 NM)', 'Minutes of arc on the latitude scale are nautical miles, not time'],
        check: { id: 'charts-c9', q: 'You pass a beacon at 10:12 and a lighthouse 4.5 NM further on at 10:39. What is your speed?', options: ['6 knots', '8 knots', '10 knots', '12 knots'], answer: 2, explanation: '27 minutes = 0.45 h; 4.5 NM ÷ 0.45 h = 10 knots (F70, WE-5).' },
      },
      // 10 -----------------------------------------------------------
      {
        id: 'fixing',
        title: 'Finding your position: bearings, transits and dead reckoning',
        html: `<p>The exam's practical questions ask you to find your position in the chart "using compass and GPS coordinates" and "using lighthouses, minor lights and landmarks". The tool is the <strong>bearing</strong>: the direction from you to a charted object. A <strong>relative bearing</strong> is measured from your bow, a <strong>compass bearing</strong> from the steering or hand-bearing compass, and a <strong>true bearing</strong> is the compass bearing corrected for deviation and variation. <strong>Only true bearings are plotted</strong> on the chart.</p>
<p><strong>Cross-bearing fix</strong>: take compass bearings of two, preferably three, charted objects (a lighthouse, a church, a beacon), convert each to true, and draw each bearing line from the object; where the lines cross is your position. The angle between the lines should be wide, ideally <strong>60 to 120°</strong>, with 90° best; lines that are nearly parallel give a poor fix. With three lines you usually get a small triangle, the "cocked hat", whose size tells you how good the fix is. Example: compass bearings 036°, 108° and 176° with variation 4° E and no deviation become true 040°, 112° and 180°.</p>
<p>A <strong>transit</strong>, two charted objects exactly in line, gives a position line that needs no compass at all and so has no compass error; cross it with a bearing or a <strong>depth contour</strong> and you have a fix. The echo sounder gives that contour once you allow for the water level: sounder reading = charted depth + height of water above chart datum, less the transducer depth.</p>
<p><strong>Dead reckoning</strong> (DR) carries the last fix forward: from the fix, draw the true course steered and mark off the distance run (speed × time). From a 09:00 fix steering 090° true at 8 knots, the 09:45 DR position is 8 × 0.75 = 6 NM east along the line. Update it at regular intervals and whenever course or speed changes, and keep a log of time, course, speed, log reading and position so that the DR can be reconstructed if the GPS dies.</p>
<p>The plotting workflow in the exam: draw the course line, read the true course against the compass rose or a meridian with the parallel ruler, apply variation and deviation to get the compass course, measure the distance on the latitude scale, and calculate the time.</p>`,
        illustration: () => S.bearingFix({ bearings: [40, 112, 180], cockedHat: true }),
        caption: 'Three true bearings (040°, 112° and 180°) plotted back from a lighthouse, a church and a beacon cross in a small cocked hat: your fix. Angles of about 70° between the lines are good.',
        keyFacts: ['Only TRUE bearings are plotted; compass bearing + deviation + variation (east positive) = true bearing', 'Cross-bearing fix: 2 to 3 charted objects, lines 60 to 120° apart (90° best); three lines give a "cocked hat"', 'A transit (two objects in line) is a position line with no compass error', 'Sounder reading = charted depth + height of water above chart datum (minus transducer depth)', 'Dead reckoning: last fix + true course + distance run (speed × time); 8 kn for 45 min = 6 NM'],
        check: { id: 'charts-c10', q: 'You take compass bearings of a lighthouse (036°) and a church (108°). Variation is 4° E, deviation 0. Which bearings do you plot?', options: ['032° and 104°', '036° and 108°', '040° and 112°', '044° and 116°'], answer: 2, explanation: 'Convert compass to true by adding easterly variation: 036 + 4 = 040° and 108 + 4 = 112°. Only true bearings go on the chart (F80, F86, WE-14).' },
      },
      // 11 -----------------------------------------------------------
      {
        id: 'electronic',
        title: 'GPS, plotters, apps, AIS and radar: possibilities and limitations',
        html: `<p>GPS gives your position to within a few metres, in the <strong>WGS84</strong> datum. Because <strong>all Norwegian charts also use WGS84</strong>, a GPS position can be plotted directly, with no conversion. That is the possibility. The limitation is just as simple: <strong>GPS tells you where you are, not whether it is safe</strong>. Safety comes from reading that position against an <strong>up-to-date chart</strong>, paper or electronic.</p>
<p>Electronic charts and plotters have their own traps. The displayed detail depends on <strong>zoom level</strong>: zoomed out, rock symbols and soundings are dropped and a dangerous track can look clean, so plan and check each leg zoomed in. The data must be <strong>kept updated</strong> like a paper chart, and consumer apps may not use official chart data at all. Official charts carry a <strong>Zone of Confidence (ZOC)</strong> diagram showing where the depth data are of poorer quality and the risk is greater. At high speed the plotter's position <strong>lags behind the boat</strong>, and staring at the screen narrows your vision; the syllabus lists both as high-speed dangers.</p>
<p><strong>AIS</strong> broadcasts a vessel's identity, position, course and speed over VHF. Ships above certain sizes must carry it; <strong>recreational craft need not</strong>, and most small boats, kayaks and many fishing boats have none. The Class B units sold for pleasure craft transmit less often than ship-borne Class A, so an <strong>empty AIS screen never means empty water</strong>. The Norwegian Coastal Administration runs the national AIS network.</p>
<p><strong>Radar</strong> shows range and bearing of targets around you in darkness and fog, but small wooden or plastic boats and low rocks are poor targets and may vanish in sea clutter.</p>
<div class="callout rule"><p>Rule 5 of the Rules of the Road requires a proper look-out "by sight and hearing as well as by all available means", and Rule 7(c) forbids assumptions "on the basis of scanty information, especially scanty radar information". Rule 6 makes radar limitations a factor in choosing a safe speed. Electronics supplement the look-out; they never replace it.</p></div>`,
        illustration: () => plotterZoom(),
        caption: 'Zoomed out, the plotter drops the rock symbols and the track looks clear; zoomed in, a 1,8 m rock sits on the planned line. Check each leg at a large scale.',
        keyFacts: ['GPS and all Norwegian charts use WGS84: positions plot directly without conversion', 'GPS shows where you are; only an updated chart shows whether it is safe', 'Plotter traps: dangers disappear when zoomed out, data must be updated, apps may lack official data, position lags at high speed; ZOC diagram shows poor-quality survey areas', 'AIS is not mandatory for recreational craft; an empty AIS screen never means empty water', 'Rule 5: look-out by all available means; Rule 7(c): no conclusions from scanty radar information; electronics never replace the look-out'],
        check: { id: 'charts-c11', q: 'Which statement about GPS and Norwegian charts is correct?', options: ['GPS positions must be converted from WGS84 before plotting on a Norwegian chart', 'A GPS position can be plotted directly, but the chart must be up to date to show whether the position is safe', 'A plotter that shows your position removes the need for a look-out', 'Zooming out on a plotter reveals more dangers'], answer: 1, explanation: 'Norwegian charts are in WGS84 like GPS, so positions plot directly; dangers can vanish when zoomed out, and Rule 5 still requires a look-out by all means (F9, F92, F93, F94).' },
      },
      // 12 -----------------------------------------------------------
      {
        id: 'tide',
        title: 'Tide, water level and current in general',
        html: `<p>The tide is the rise and fall of the sea caused by the Moon and the Sun. In Norway it is <strong>semi-diurnal</strong>: two high waters and two low waters a day, about 12 h 25 min apart. The range is largest at <strong>spring tides</strong> around new and full moon and smallest at <strong>neap tides</strong> around half moon. The tide produces tidal streams, which run fastest where the water is squeezed through narrows; the chart and the pilot books tell you where they matter.</p>
<p><strong>Current in general</strong>: besides tidal streams, water moves because of wind, river outflow and the general coastal circulation. Any current sets the boat sideways, so the course you steer and the track you actually make good are not the same line, and the speed over the ground differs from the speed through the water. Allow for it by steering up-current of the direct course, check the result with a fix or a transit, and remember that the strongest streams run in narrow sounds and around headlands, where they can also raise steep seas against the wind.</p>
<p>How much the water moves depends on where you are. The <strong>tidal range (HAT minus LAT)</strong> is <strong>0.50 m at Mandal and 0.72 m at Oslo</strong>, grows to <strong>1.8 m at Bergen</strong>, 2.65 m at Kristiansund and 2.68 m at Harstad, and reaches <strong>3.82 m at Narvik and 3.97 m at Vadso</strong>. The small range in the south is caused by an <strong>amphidromic point</strong> west of Egersund, a spot where the tide almost disappears; northward the range grows, and the Lofoten islands concentrate the tidal wave so the largest ranges are near Narvik. In southern Norway the <strong>weather often moves the water more than the tide</strong>: wind and air pressure can push the level above or below the prediction, which is why chart datum there is set below LAT.</p>
<p>The Norwegian Mapping Authority publishes official tide tables and the observed and forecast water level in its public online water-level service; the Norwegian Meteorological Institute adds the weather effect five days ahead. Use it for two sums. <strong>Depth</strong>: charted 2,3 m plus a water level 0.8 m above chart datum gives 3.1 m; with a 1.2 m draught the clearance is 1.9 m, but if the weather holds the level 0.3 m <em>below</em> datum, depth is 2.0 m and clearance only 0.8 m. <strong>Clearance</strong>: a bridge charted at 12 m above HAT gives at least 12 m unless a surge takes the level above HAT.</p>
<div class="callout tip"><p>Planning a passage: pick waypoints in safe water; mark shoals, cables, bridges, ferry routes and prohibited areas; note the lights and marks on the way; check weather and water level; and carry fuel in thirds: one third out, one third back, one third in reserve.</p></div>`,
        illustration: () => tideStrip(),
        caption: 'Tidal range grows from under a metre in the south and east to almost four metres in Finnmark. The amphidromic point west of Egersund explains the small tide in Skagerrak.',
        keyFacts: ['Semi-diurnal tide: two highs and two lows a day, about 12 h 25 min apart; springs at new and full moon, neaps at half moon', 'Range (HAT − LAT): Mandal 0.50 m, Oslo 0.72 m, Bergen 1.8 m, Narvik 3.82 m, Vadso 3.97 m', 'Amphidromic point west of Egersund = almost no tide in Skagerrak; Lofoten concentrates the tide in the north', 'In the south the weather (wind, air pressure) moves the water more than the tide; the forecast covers five days', 'Current (tidal stream, wind, river outflow) sets the boat sideways: course steered and track made good differ; steer up-current and check with a fix','Actual depth = charted depth + water level above chart datum; fuel rule of thumb: one third out, one third back, one third reserve'],
        check: { id: 'charts-c12', q: 'The chart shows 2,3 m over a shoal. The water-level service says the level is 0.8 m above chart datum. Your boat draws 1.2 m. What is the clearance under the keel?', options: ['0.3 m', '1.1 m', '1.9 m', '2.3 m'], answer: 2, explanation: 'Actual depth = 2.3 + 0.8 = 3.1 m; minus the 1.2 m draught leaves 1.9 m (F89, WE-7).' },
      },
    ],

    // =====================================================================================
    flashcards: [
      { front: 'One nautical mile in metres?', back: '1852 m, equal to one minute of latitude. A cable is 0.1 NM = 185.2 m.' },
      { front: 'Where on the chart do you measure distance?', back: 'On the latitude scale (side border), level with the leg. Never on the longitude scale.' },
      { front: 'Length of 1 minute of longitude at 60°N?', back: 'About 0.5 NM (926 m), because longitude minutes shrink with the cosine of latitude.' },
      { front: 'Correct way to write a position?', back: 'Latitude first: 59°54,5\'N 010°44,0\'E (degrees, minutes, decimal minutes). Norway is N and E.' },
      { front: 'What is a knot?', back: 'A speed of 1 nautical mile per hour (about 1.85 km/h).' },
      { front: 'Chart datum in Norway?', back: 'Lowest Astronomical Tide (LAT) since 2000; 20 cm lower from the Swedish border to Utsira, 30 cm lower in the inner Oslo fjord.' },
      { front: 'Why is chart datum below LAT on the south coast?', back: 'The tide is tiny there and weather moves the water more; the Norwegian Mapping Authority lowers the zero level for safety.' },
      { front: 'Reference level for bridge and overhead-cable clearance?', back: 'Highest Astronomical Tide (HAT).' },
      { front: 'Reference level for the coastline and light elevations?', back: 'Mean High Water (MHW). Land heights are above Mean Sea Level (MSL).' },
      { front: 'Italic versus upright depth figures?', back: 'Italic (sloping) = ordinary sounding. Upright = depth over a rock or shoal.' },
      { front: 'How are depths between 0.5 and 10.5 m written?', back: 'In metres and decimetres with a decimal comma, e.g. 7,3. Deeper water in whole metres.' },
      { front: 'Blue tint on a 1:50 000 chart normally covers?', back: 'Water shallower than the 10 m contour. White is usually deeper than 10 m, but check the legend and look for rock symbols.' },
      { front: 'Cross with a dot in each quadrant?', back: 'Rock awash at chart datum (INT1 K12): between chart datum and 0.5 m below it.' },
      { front: 'Plain cross (+) in the water?', back: 'Underwater rock of unknown depth, dangerous to surface navigation (INT1 K13).' },
      { front: 'Six-pointed star symbol?', back: 'Rock that covers and uncovers (INT1 K11): between chart datum and MHW.' },
      { front: 'Small islet with (1,7) beside it?', back: 'Rock that never covers; 1.7 m is its height above MHW (INT1 K10).' },
      { front: '"+ 7,5" on a Norwegian chart?', back: 'Underwater rock with 7.5 m of water over it (rocks 0.5 to 9.9 m keep the + and get a depth figure).' },
      { front: 'Upright "12" alone among italic soundings?', back: 'A shoal deeper than 10 m; the upright figure marks its shallowest point.' },
      { front: 'Wavy magenta line?', back: 'Submarine cable (INT1 L30). With lightning zigzags: submarine power cable (L31). Do not anchor.' },
      { front: 'Magenta line of long dashes with a dot between them?', back: 'Pipeline (INT1 L40), labelled Oil, Gas or Water where known.' },
      { front: 'Line between two pylon symbols with "22"?', back: 'Overhead power line; 22 m vertical clearance above HAT (INT1 D26).' },
      { front: 'Anchor symbol struck through?', back: 'Anchoring prohibited (INT1 N20).' },
      { front: 'Wreck symbol inside a dotted circle?', back: 'Dangerous wreck, depth unknown (K28). Without the circle: at least 20 m over it (K29).' },
      { front: 'Dashed line labelled "Cable Ferry"?', back: 'A cable ferry: its wire can lie near the surface; never pass between ferry and landing.' },
      { front: 'Decode "Fl(3) WRG 15s 21m 15-11M".', back: 'Group of 3 flashes; white, red, green sectors; 15 s period; 21 m above MHW; range W 15 NM, G 11 NM, R between.' },
      { front: 'Oc, Iso, Fl, LFl, Q, VQ?', back: 'Occulting (light longer), isophase (equal), flashing (dark longer), long flash (2 s or more), quick 50-79/min, very quick 80-159/min.' },
      { front: 'Heading toward a sector light in its white sector, where is green?', back: 'To starboard; red to port (IALA convention, all Norwegian sector lights since Nov 2025).' },
      { front: 'Does a white sector guarantee deep water?', back: 'No. White marks the fairway for intended traffic; the Norwegian Coastal Administration warns that shoals may still exist inside it.' },
      { front: 'What is magnetic variation?', back: 'The angle between true and magnetic north at a place; easterly everywhere in Norway (about 0° west coast to 15° E in East Finnmark).' },
      { front: 'What causes deviation?', back: 'The boat\'s own magnetism (engine, iron, electronics); it changes with heading and is listed in the deviation table.' },
      { front: '"4° E 2020 (8\'W)" on the compass rose?', back: 'Variation 4° east in 2020, decreasing 8 minutes of arc per year (3°52\' E in 2021).' },
      { front: 'Compass to true: add or subtract easterly errors?', back: 'ADD east (CADET: Compass ADd East = True). Subtract west. True to compass: the opposite.' },
      { front: 'Compass 359°, deviation 4° E, variation 4° E. True course?', back: '359 + 4 + 4 = 367 → 007° true.' },
      { front: 'True 146°, variation 4° W. Magnetic course?', back: '150°. Going from true to magnetic, westerly variation is added.' },
      { front: '"Error east, compass least" means?', back: 'With easterly error the compass reads less than true; with westerly error it reads more ("compass best").' },
      { front: '12 knots for 40 minutes = ?', back: '12 × 40/60 = 8 NM.' },
      { front: '15 NM at 10 knots takes?', back: '1.5 h = 1 h 30 min.' },
      { front: 'The six-minute rule?', back: 'In 6 minutes (0.1 h) you cover one tenth of your speed in NM: 18 kn → 1.8 NM.' },
      { front: 'Good angle between cross bearings?', back: '60 to 120°, ideally 90°. Only true bearings are plotted; two or three objects.' },
      { front: 'Why can a GPS position be plotted directly on a Norwegian chart?', back: 'Both use the WGS84 datum. But GPS shows where you are, not whether it is safe: read the updated chart.' },
      { front: 'Is AIS mandatory for recreational craft?', back: 'No. Most small boats have none, so an empty AIS screen never means empty water.' },
      { front: 'Tidal range Oslo versus Narvik?', back: 'Oslo about 0.7 m, Narvik about 3.8 m. An amphidromic point west of Egersund damps the tide in the south.' },
    ],

    // =====================================================================================
    questions: [
      // ---- part 4, item 1.4.2: chart symbols for dangers (picture questions first) ----
      { id: 'charts-01', q: 'What does this chart symbol mean?', illustration: () => qsym('rock-awash'), options: ['A church on the shore', 'A rock awash at chart datum, lying between chart datum and 0.5 m below it', 'A wreck with four known depths around it', 'A fish farm'], answer: 1, explanation: 'A cross with a dot in each quadrant is INT1 K12, the rock awash at chart datum. At low water the sea washes over it and it is almost invisible (F23).', difficulty: 1, part: 4, p4: '1.4.2', tags: ['symbols', 'rock-awash'] },
      { id: 'charts-02', q: 'What does this plain cross in the water mean?', illustration: () => qsym('rock-submerged'), options: ['A buoy', 'A rock that is always above water', 'An underwater rock of unknown depth, dangerous to surface navigation', 'A recommended anchor berth'], answer: 2, explanation: 'INT1 K13: a plain cross marks an underwater rock whose depth is unknown and which is dangerous to surface navigation (F24).', difficulty: 1, part: 4, p4: '1.4.2', tags: ['symbols', 'rock'] },
      { id: 'charts-03', q: 'What does this star-shaped symbol mean?', illustration: () => qsym('rock-drying'), options: ['A rock that covers and uncovers with the tide, lying between chart datum and mean high water', 'A lighthouse', 'A rock awash at chart datum', 'An obstruction of unknown nature'], answer: 0, explanation: 'INT1 K11: the six-pointed star is a drying rock, visible at low water and covered at high water. The rock awash (K12) is a cross with four dots (F22, F23).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'rock'] },
      { id: 'charts-04', q: 'On a Norwegian chart you see this symbol: a cross with the small upright figures 7,5 beside it. What does it mean?', illustration: () => qsym('rock-known'), options: ['A rock 7.5 m above the water', 'A sounding of 7.5 m with no danger', 'A buoy numbered 7.5', 'An underwater rock with 7.5 m of water over it'], answer: 3, explanation: 'Norwegian practice (INT1 p. 3): for a rock between 0.5 and 9.9 m deep the + symbol is kept and the depth is written in small upright figures beside it (F25).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'rock', 'shoal'] },
      { id: 'charts-05', q: 'Among italic soundings of 27 to 35 m you see an upright "12". What does it mean?', illustration: () => qsym('shoal-upright'), options: ['A shoal deeper than 10 m; the upright figure marks its shallowest point', 'A misprint; all soundings should be italic', 'A rock 12 m above the water', 'A depth that has been surveyed twice'], answer: 0, explanation: 'Upright figures are rock and shoal depths; on Norwegian charts a shoal deeper than 10 m is shown as an upright figure alone marking its depth and position (F13, F25).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'shoal'] },
      { id: 'charts-06', q: 'What is the difference between an italic depth figure and an upright one on a Norwegian chart?', options: ['Italic figures are in feet, upright figures in metres', 'Italic figures are ordinary soundings; upright figures are depths over rocks and shoals', 'Italic figures are unreliable; upright figures are confirmed', 'Italic figures mark anchorages; upright figures mark fairways'], answer: 1, explanation: 'INT1 (Norwegian edition): ordinary soundings are printed in italic, rock and shoal depths in upright numerals, so an upright figure in open water is a warning (F13).', difficulty: 1, part: 4, p4: '1.4.2', tags: ['symbols', 'shoal'] },
      { id: 'charts-07', q: 'What does this wavy magenta line mean, and what must you avoid?', illustration: () => qsym('cable'), options: ['A ferry route; do not cross it', 'A depth contour; do not go inside it', 'A submarine cable; do not anchor on it', 'A leading line; keep exactly on it'], answer: 2, explanation: 'INT1 L30.1: a wavy magenta line is a submarine cable. Anchoring on it can damage the cable and foul your anchor (F28).', difficulty: 1, part: 4, p4: '1.4.2', tags: ['symbols', 'cable'] },
      { id: 'charts-08', q: 'What does this wavy magenta line with lightning-shaped zigzags mean?', illustration: () => qsym('power-cable'), options: ['An area of magnetic anomaly', 'A pipeline carrying gas', 'A recommended track', 'A submarine power cable'], answer: 3, explanation: 'INT1 L31.1: the wavy cable line with small lightning zigzags at intervals is a submarine power cable (F28).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'cable'] },
      { id: 'charts-09', q: 'What does this magenta line of long dashes with a dot between each dash mean?', illustration: () => qsym('pipeline'), options: ['A pipeline, here carrying gas', 'A submarine cable', 'A limit of a restricted area', 'A ferry route'], answer: 0, explanation: 'INT1 L40.1: a pipeline is a magenta dash-dot-dash line, labelled Oil, Gas or Water where known; a cable is a wavy line (F28).', difficulty: 1, part: 4, p4: '1.4.2', tags: ['symbols', 'pipeline'] },
      { id: 'charts-10', q: 'A line crosses the sound between two pylon symbols with the figure "22" beside it. What does the figure mean?', illustration: () => qsym('overhead-cable'), options: ['The depth of a submarine cable in metres', 'The vertical clearance of an overhead power line, 22 m above Highest Astronomical Tide', 'The length of the span in cables', 'The voltage of the line in kilovolts'], answer: 1, explanation: 'Pylons joined by a line show an overhead power line (INT1 D26); the figure is its vertical clearance in metres above HAT, so a mast must be lower than that (F18).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'overhead-line'] },
      { id: 'charts-11', q: 'This bridge is charted with the figure 12. Your sailing boat has an air draught of 11.5 m and the water is at mean sea level. Can you pass under it?', illustration: () => qsym('bridge'), options: ['No: 12 is the horizontal width of the opening in metres', 'No: clearances are measured from chart datum, so at mean sea level you have less than 12 m', 'Yes: the clearance of 12 m is measured from HAT, so at mean sea level you have more than 12 m', 'Only at high water, when the bridge clearance is largest'], answer: 2, explanation: 'Bridge clearances on Norwegian charts are referred to HAT; at any water level below HAT the real clearance is greater than the charted 12 m (F18, WE-8).', difficulty: 3, part: 4, p4: '1.4.2', tags: ['symbols', 'bridge'] },
      { id: 'charts-12', q: 'Which water level are the vertical clearances of bridges and overhead cables on Norwegian charts referred to?', options: ['Chart datum (LAT)', 'Mean sea level', 'Mean high water', 'Highest Astronomical Tide (HAT)'], answer: 3, explanation: 'Clearances are measured from HAT, which builds in a margin because the water is rarely above HAT. Depths use LAT, the coastline and light elevations MHW, land heights MSL (F18).', difficulty: 1, part: 4, p4: '1.4.2', tags: ['bridge', 'datum'] },
      { id: 'charts-13', q: 'A small islet is charted with "(1,7)" beside it. What does the figure mean?', illustration: () => qsym('islet'), options: ['The islet is 1.7 m above mean high water and never covers', 'There is 1.7 m of water over the rock', 'The islet is 1.7 cables long', 'The rock dries 1.7 m above chart datum'], answer: 0, explanation: 'INT1 K10: a rock or islet that never covers is drawn as a small land outline with its height above MHW in brackets (F21).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'rock'] },
      { id: 'charts-14', q: 'Between which two levels does a "rock awash" (cross with four dots) lie?', options: ['Between mean high water and mean sea level', 'Between chart datum and 0.5 m below chart datum', 'More than 10 m below chart datum', 'Between 0.5 and 9.9 m below chart datum'], answer: 1, explanation: 'INT1 K12 and the Norwegian drying-area definition: the awash rock lies between chart datum and 0.5 m below it, so at low water it is right at the surface (F16, F23).', difficulty: 3, part: 4, p4: '1.4.2', tags: ['rock-awash', 'datum'] },
      { id: 'charts-15', q: 'What does this dotted line enclosing two rock symbols mean?', illustration: () => qsym('danger-line'), options: ['An anchorage area', 'A recommended track with a least depth of 4 m', 'A danger line enclosing an area with dangers through which it is unsafe to navigate', 'A military exercise area'], answer: 2, explanation: 'INT1 K1: a dotted danger line draws attention to a danger or encloses an area with many dangers that is unsafe to navigate. Stay outside it (F26).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'danger-line'] },
      { id: 'charts-18', q: 'What does this wreck symbol inside a dotted circle mean?', illustration: () => qsym('wreck-dangerous'), options: ['A wreck that is always visible above water', 'A wreck of unknown depth that is dangerous to surface navigation', 'A wreck covered by at least 20 m of water', 'A historic wreck where diving is prohibited'], answer: 1, explanation: 'INT1 K28: the wreck symbol inside a dotted danger circle is a potentially dangerous wreck of unknown depth; without the circle (K29) the wreck is considered covered by at least 20 m (F27).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'wreck'] },
      { id: 'charts-19', q: 'What does this anchor symbol with a line struck through it mean?', illustration: () => qsym('no-anchor'), options: ['An anchorage limited to 24 hours', 'A place where an anchor was lost', 'A harbour office', 'Anchoring prohibited'], answer: 3, explanation: 'INT1 N20: an anchor with a line through it means anchoring is prohibited, typically over cables or pipelines; an anchorage area has an anchor inside a dashed boundary (F29, F30).', difficulty: 1, part: 4, p4: '1.4.2', tags: ['symbols', 'anchoring'] },
      { id: 'charts-20', q: 'A sector light is charted "Oc WRG 6s" with green 190° to 230°, white 230° to 260° and red 260° to 300°. These sector limits are measured as:', options: ['Relative bearings from the boat\'s bow', 'True bearings from the sea toward the light', 'True bearings from the light toward the sea', 'Magnetic bearings from the light'], answer: 1, explanation: 'Sector limits in the chart and the list of lights are given as true bearings from seaward, as seen by the mariner looking toward the light, 0 to 360 clockwise from north (F39).', difficulty: 3, part: 4, p4: '1.4.2', tags: ['sector-light'] },
      { id: 'charts-22', q: 'The chart shows a dashed magenta line across a sound labelled "Cable Ferry". What is the practical warning?', illustration: () => qsym('cable-ferry'), options: ['It is a prohibited area at all times', 'It marks a submarine power cable only', 'A wire can lie near the surface between the ferry and its landing; never pass between them', 'It is a leading line for the ferry'], answer: 2, explanation: 'INT1 M51: a cable ferry pulls itself along a wire that can be close to the surface, so passing between the ferry and its landing can foul your boat (F31).', difficulty: 2, part: 4, p4: '1.4.2', tags: ['symbols', 'ferry'] },

      // ---- part 3: grid, distance, datum ----
      { id: 'charts-23', q: 'How long is one nautical mile?', options: ['1000 m', '1609 m', '1852 m', '2000 m'], answer: 2, explanation: 'The international nautical mile is 1852 m and equals one minute of latitude (F65). 1609 m is a statute mile.', difficulty: 1, part: 3, tags: ['units'] },
      { id: 'charts-24', q: 'Where do you measure a distance on the chart?', options: ['On the longitude scale along the top border', 'On the latitude scale at the side, level with the leg', 'Anywhere on the compass rose', 'Along the nearest depth contour'], answer: 1, explanation: 'Only minutes of latitude equal nautical miles. Longitude minutes shrink toward the pole and are about half as long at 60°N (F68).', difficulty: 1, part: 3, tags: ['distance'] },
      { id: 'charts-25', q: 'Which position is written correctly?', illustration: () => S.latitudeScale({ position: true }), options: ['010°44,0\'E 59°54,5\'N', '59,54°N 10,44°W', 'N59 E10', '59°54,5\'N 010°44,0\'E'], answer: 3, explanation: 'Latitude first, then longitude, in degrees, minutes and decimal minutes; Norway is north and east and longitude is written with three digits (F64).', difficulty: 1, part: 3, tags: ['position'] },
      { id: 'charts-26', q: 'At 60°N, roughly how long is one minute of longitude?', options: ['About 0.5 nautical mile', 'Exactly 1 nautical mile', 'About 2 nautical miles', 'About 1.5 nautical miles'], answer: 0, explanation: 'The length of a longitude minute shrinks with the cosine of latitude; cos 60° = 0.5, so one minute is about 0.5 NM or 926 m (F68).', difficulty: 2, part: 3, tags: ['distance'] },
      { id: 'charts-27', q: 'What is the reference level for charted depths in most of Norway?', options: ['Mean sea level', 'Mean high water', 'Highest Astronomical Tide', 'Lowest Astronomical Tide (chart datum)'], answer: 3, explanation: 'Chart datum has been LAT since 1 January 2000; on the south coast it is 20 cm lower and in the inner Oslo fjord 30 cm lower (F10, F11).', difficulty: 1, part: 3, tags: ['datum'] },
      { id: 'charts-28', q: 'Why is chart datum set 20 cm below LAT along the south coast from the Swedish border to Utsira?', options: ['Because the tide there is very large', 'Because the tide there is small and wind and air pressure move the water more than the tide, so the zero level is lowered for safety', 'Because the charts there are older', 'Because the land is sinking'], answer: 1, explanation: 'The Norwegian Mapping Authority: in the south the weather effect is large compared with the tidal variation, so chart datum is placed 20 cm (inner Oslo fjord 30 cm) below LAT for safety reasons (F11, F100).', difficulty: 3, part: 3, tags: ['datum'] },
      { id: 'charts-29', q: 'What is the scale of the main Norwegian chart series?', options: ['1:10 000', '1:50 000', '1:350 000', '1:1 000 000'], answer: 1, explanation: 'The main series is at 1:50 000 with a few exceptions (143 charts along the mainland coast); harbour charts are 1:5 000 to 1:25 000 and coastal charts 1:350 000 (F3, F4).', difficulty: 2, part: 3, tags: ['chart-series'] },
      { id: 'charts-30', q: 'How are Norwegian paper charts kept up to date?', options: ['They are printed on demand and re-issued every 14 days with corrections announced in the Norwegian Notices to Mariners; the user must keep them updated', 'They are reprinted once a year and are valid until the next print', 'They never need correction because the coast does not change', 'Only electronic charts can be corrected'], answer: 0, explanation: 'All Norwegian charts are print-on-demand, re-issued every 14 days with all published corrections, and it is the user\'s responsibility to keep them corrected (F6).', difficulty: 2, part: 3, tags: ['chart-series'] },
      { id: 'charts-31', q: 'Normally, what does white (untinted) water on a 1:50 000 Norwegian chart tell you?', options: ['The area has not been surveyed', 'The depth is less than 2 m', 'The water is deeper than 10 m, but check the legend and look for rock symbols', 'The water is always safe for every vessel'], answer: 2, explanation: 'A blue tint normally covers the water shallower than the 10 m contour on charts at 1:50 000 and larger; isolated rocks and upright shoal figures can still sit in white water (F14).', difficulty: 2, part: 3, tags: ['depths'] },
      { id: 'charts-32', q: 'How are the depths 0.5 to 10.5 m written on Norwegian charts?', options: ['In feet and fathoms', 'In whole metres only', 'In metres and decimetres with a decimal comma, e.g. 7,3', 'As a percentage of the tidal range'], answer: 2, explanation: 'Between 0.5 and 10.5 m depths are given in metres and decimetres (7,3); deeper than 10.5 m in whole metres. The position is the centre of the figure (F12, F13).', difficulty: 2, part: 3, tags: ['depths'] },
      { id: 'charts-33', q: 'Which statement about the horizontal datum of Norwegian charts is correct?', options: ['Norwegian charts use a national datum, so GPS positions must be converted', 'Norwegian charts use WGS84, the same as GPS, so positions can be plotted directly', 'The datum differs between the main series and the harbour charts', 'The datum is printed only on electronic charts'], answer: 1, explanation: 'All Norwegian charts use WGS84, so a GPS position goes straight onto the chart without conversion (F9, F92).', difficulty: 2, part: 3, tags: ['datum', 'gps'] },

      // ---- part 3: compass, variation, deviation ----
      { id: 'charts-34', q: 'What is magnetic variation?', options: ['The compass error caused by the boat\'s engine and electronics', 'The angle between true (geographic) north and magnetic north at a place', 'The difference between two compasses on the same boat', 'The drift of the boat caused by wind'], answer: 1, explanation: 'A magnetic compass points to magnetic north; the angle between magnetic and true north is the variation, which depends on where you are and changes slowly (F73).', difficulty: 1, part: 3, tags: ['variation'] },
      { id: 'charts-35', q: 'Magnetic variation in Norway is:', options: ['Westerly everywhere', 'Easterly in the south and westerly in the north', 'Easterly everywhere, from about 0° on the west coast to about 15° in East Finnmark', 'Zero everywhere'], answer: 2, explanation: 'The Norwegian Mapping Authority: about zero degrees on the west coast rising to about 15° easterly in East Finnmark, increasing by 0.1 to 0.2° a year (F74).', difficulty: 2, part: 3, tags: ['variation'] },
      { id: 'charts-36', q: 'The compass rose on the chart reads "4° E 2020 (8\'W)". What does "(8\'W)" mean?', illustration: () => S.compassRose({ variation: 4 }), options: ['The deviation is 8° west', 'The variation is 8° west', 'The rose was surveyed 8 miles west of the chart centre', 'The variation decreases by 8 minutes of arc per year'], answer: 3, explanation: 'The bracket gives the annual change: 4° E in 2020 becomes 3°52\' E in 2021. Charts update the variation every five years (F76).', difficulty: 2, part: 3, tags: ['variation', 'compass-rose'] },
      { id: 'charts-37', q: 'What causes deviation?', options: ['Magnetic material and electrical equipment on board the boat', 'The Earth\'s magnetic field', 'Errors in the chart projection', 'The difference between true and magnetic north'], answer: 0, explanation: 'Deviation is the compass error produced by the boat\'s own magnetic fields; it varies with heading and is recorded in the boat\'s deviation table. Variation is the Earth\'s field (F78).', difficulty: 1, part: 3, tags: ['deviation'] },
      { id: 'charts-38', q: 'Which statement about variation and deviation is correct?', options: ['Both are read from the compass rose on the chart', 'Variation changes with the boat\'s heading; deviation does not', 'Deviation changes with the boat\'s heading and is specific to the boat; variation depends only on the place', 'Both are zero in Norway'], answer: 2, explanation: 'Deviation belongs to the boat and depends on heading (deviation table); variation belongs to the place and is printed on the chart (F73, F78).', difficulty: 2, part: 3, tags: ['deviation', 'variation'] },
      { id: 'charts-39', q: 'Compass course 359°, variation 4° E, deviation 4° E. What is the true course?', illustration: () => S.courseTriangle({ compass: 359, variation: 4, deviation: 4 }), options: ['351°', '359°', '367°', '007°'], answer: 3, explanation: 'Compass to true: add easterly errors. 359 + 4 + 4 = 367, which wraps to 007° (F80, F82).', difficulty: 2, part: 3, tags: ['course-conversion'] },
      { id: 'charts-40', q: 'The chart gives a true course of 146°. Variation is 4° W. What is the magnetic course?', options: ['142°', '150°', '146°', '154°'], answer: 1, explanation: 'Going from true to magnetic you subtract easterly and add westerly variation: 146 + 4 = 150° (F83).', difficulty: 2, part: 3, tags: ['course-conversion'] },
      { id: 'charts-41', q: 'True course 146°, variation 4° W, deviation 2° E. What compass course do you steer?', illustration: () => S.courseTriangle({ true: 146, variation: -4, deviation: 2 }), options: ['148°', '140°', '152°', '144°'], answer: 0, explanation: 'Magnetic = 146 + 4 (west added) = 150°; compass = 150 − 2 (east subtracted when going down to compass) = 148° (F80, WE-2).', difficulty: 3, part: 3, tags: ['course-conversion'] },
      { id: 'charts-42', q: 'You take a compass bearing of 036° on a lighthouse. Variation is 4° E, deviation 0. What true bearing do you plot?', options: ['032°', '036°', '040°', '044°'], answer: 2, explanation: 'Compass to true: add easterly variation. 036 + 4 = 040° true. Only true bearings are plotted on the chart (F80, F86).', difficulty: 2, part: 3, tags: ['bearing'] },
      { id: 'charts-43', q: 'What does the rhyme "error east, compass least" mean?', options: ['With an easterly error the compass reads less than the true direction', 'With an easterly error the compass reads more than the true direction', 'Easterly errors can be ignored', 'The compass is least reliable on easterly headings'], answer: 0, explanation: 'With easterly variation or deviation the compass reading is smaller than true; with westerly error it is larger ("compass best") (F81).', difficulty: 2, part: 3, tags: ['mnemonic'] },
      { id: 'charts-44', q: 'Compass course 096°, deviation 6° W, variation 4° W. What is the true course?', options: ['106°', '086°', '094°', '098°'], answer: 1, explanation: 'True = compass + deviation + variation with westerly values negative: 096 − 6 − 4 = 086° (F82).', difficulty: 3, part: 3, tags: ['course-conversion'] },

      // ---- part 3: speed, time, distance ----
      { id: 'charts-45', q: 'You run at 12 knots for 40 minutes. How far have you travelled?', illustration: () => S.std({ speed: 12, minutes: 40 }), options: ['4.8 NM', '8 NM', '12 NM', '480 NM'], answer: 1, explanation: 'Distance = speed × time in hours: 12 × 40/60 = 8 NM (F70).', difficulty: 1, part: 3, tags: ['std'] },
      { id: 'charts-46', q: 'You must cover 15 NM at 10 knots. How long will it take?', options: ['1 h 05 min', '1 h 30 min', '1 h 50 min', '2 h 30 min'], answer: 1, explanation: 'Time = distance ÷ speed = 15 ÷ 10 = 1.5 h = 1 h 30 min (F70).', difficulty: 1, part: 3, tags: ['std'] },
      { id: 'charts-47', q: 'At 18 knots, how far do you travel in 6 minutes?', options: ['0.6 NM', '3 NM', '1.8 NM', '18 NM'], answer: 2, explanation: 'Six minutes is 0.1 h, so you cover one tenth of your speed: 1.8 NM (F71).', difficulty: 1, part: 3, tags: ['std'] },
      { id: 'charts-48', q: 'A leg measures 7.5 minutes on the latitude scale. At 12 knots, how long does it take?', options: ['About 38 minutes', 'About 19 minutes', 'About 45 minutes', 'About 90 minutes'], answer: 0, explanation: '7.5 minutes of latitude = 7.5 NM; 7.5 ÷ 12 = 0.625 h = 37.5 minutes, about 38 (F65, F70, WE-4).', difficulty: 2, part: 3, tags: ['std', 'distance'] },
      { id: 'charts-49', q: 'From a fix at 09:00 you steer 090° true at 8 knots. Where is your dead-reckoning position at 09:45?', illustration: () => S.plotExample({ course: 90, speed: 8, minutes: 45, start: '09:00' }), options: ['8 NM east of the fix', '4 NM east of the fix', '6 NM west of the fix', '6 NM east of the fix'], answer: 3, explanation: 'Distance run = 8 × 45/60 = 6 NM along the true course of 090°, i.e. 6 NM east of the fix (F90, WE-15).', difficulty: 2, part: 3, tags: ['dead-reckoning'] },
      { id: 'charts-50', q: 'What is a knot?', options: ['A speed of one kilometre per hour', 'A distance of 1852 m', 'A speed of one nautical mile per hour', 'A speed of one cable per minute'], answer: 2, explanation: 'A knot is one nautical mile per hour, about 1.85 km/h (F67, F72).', difficulty: 1, part: 3, tags: ['units'] },

      // ---- part 3: position fixing ----
      { id: 'charts-51', q: 'For a good cross-bearing fix, how far apart should the bearing lines be?', illustration: () => S.bearingFix({ bearings: [40, 112, 180], cockedHat: true }), options: ['As close to parallel as possible', 'Exactly 180° apart', 'Between 60° and 120°, ideally about 90°', 'Less than 30° apart'], answer: 2, explanation: 'Lines crossing at 60 to 120° (90° best) give a sharp intersection; near-parallel or opposite lines give a poor fix. Use two, preferably three, objects (F87).', difficulty: 2, part: 3, tags: ['fix'] },
      { id: 'charts-52', q: 'Why is a transit (two charted objects seen exactly in line) so useful?', options: ['It gives a position line that is free of compass error', 'It gives your exact position on its own without any other line', 'It tells you the depth of water', 'It shows the direction of buoyage'], answer: 0, explanation: 'A transit needs no compass, so it has no variation or deviation error; crossing it with a bearing or a depth contour gives a fix (F88).', difficulty: 2, part: 3, tags: ['fix', 'transit'] },
      { id: 'charts-53', q: 'The chart shows a leading line labelled "Ldg 270°". What does this mean?', options: ['A magnetic course of 270° to the leading marks', 'Two marks in line define a track whose true direction is 270°; the firm part of the line is the track to follow', 'A sector light whose white sector is centred on 270°', 'A depth contour of 270 m'], answer: 1, explanation: 'A leading line is two marks or lights seen in line; the firm part of the charted line is the track and its direction is given in degrees true (F41).', difficulty: 2, part: 3, tags: ['leading-line'] },
      { id: 'charts-54', q: 'What is dead reckoning?', options: ['Finding your position from the depth sounder alone', 'Estimating your position from the last known position plus the true course steered and the distance run', 'Fixing your position by GPS', 'Steering straight toward a light'], answer: 1, explanation: 'Dead reckoning carries the last fix forward using course and distance (speed × time); update it regularly and whenever course or speed changes (F90).', difficulty: 1, part: 3, tags: ['dead-reckoning'] },

      // ---- part 3: electronic aids ----
      { id: 'charts-55', q: 'Your chart plotter, zoomed well out, shows a clear track across a bay. What should you do before trusting it?', options: ['Nothing; a plotter shows every danger at every zoom level', 'Switch the plotter to night mode', 'Zoom in and check each leg at a large scale, because symbols and soundings are dropped when zoomed out', 'Switch the datum from WGS84 to the Norwegian datum'], answer: 2, explanation: 'Electronic charts drop detail at small scales, so dangers can disappear when zoomed out; the data must also be kept updated (F93).', difficulty: 2, part: 3, tags: ['plotter'] },
      { id: 'charts-56', q: 'Which statement about AIS and recreational craft is correct?', options: ['AIS is mandatory for all boats over 5 m', 'An empty AIS screen means there are no vessels nearby', 'AIS replaces the look-out required by Rule 5', 'AIS is not mandatory for recreational craft, so an empty AIS screen never means empty water'], answer: 3, explanation: 'The carriage requirement covers ships above certain sizes; most small boats have no AIS, and Rule 5 still demands a look-out by all available means (F94, F95).', difficulty: 2, part: 3, tags: ['ais'] },
      { id: 'charts-57', q: 'In fog you rely on radar. What do the Rules of the Road say about this?', options: ['Radar replaces the look-out when visibility is below 1 NM', 'A proper look-out must be kept by sight and hearing and all available means, and no conclusions may be drawn from scanty radar information', 'Radar may only be used by vessels over 15 m', 'Radar is required on all recreational craft in fog'], answer: 1, explanation: 'Rule 5 requires a look-out by all available means and Rule 7(c) forbids assumptions on scanty information, especially scanty radar information; Rule 6 counts radar limitations toward safe speed (F94, F96).', difficulty: 3, part: 3, tags: ['radar', 'rule-5'] },

      // ---- part 3: tide ----
      { id: 'charts-58', q: 'Why is the tidal range in Oslo (about 0.7 m) so much smaller than in Narvik (about 3.8 m)?', options: ['An amphidromic point west of Egersund damps the tide in Skagerrak, while the Lofoten islands concentrate it in the north', 'Oslo is further from the Moon', 'The Oslo fjord contains fresh water, which has no tide', 'There is no tide at all south of Bergen'], answer: 0, explanation: 'The Norwegian Mapping Authority: an amphidromic point (almost no tide) lies west of Egersund; from Stavanger northward the range grows and Lofoten concentrates the tidal wave, so the largest ranges are near Narvik (F98, F99).', difficulty: 3, part: 3, tags: ['tide'] },
      { id: 'charts-61', q: 'You steer a steady compass course across a sound where a current runs from your port side. What happens to your track?', options: ['Nothing; a current only changes your speed', 'The boat is set to port, so you must steer further to port', 'The compass starts to show the current\'s direction', 'The boat is set to starboard, so the track made good lies to the right of the course steered; aim up-current to compensate'], answer: 3, explanation: 'A current pushes the whole boat sideways, so the course steered and the track made good differ. With the current coming from port the boat is set toward starboard; steer up-current (to port) and check the result with a fix or a transit.', difficulty: 2, part: 3, tags: ['current'] },
    ],
  });
})();
