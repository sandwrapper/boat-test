/* Skipper Prep — Topic 7: Seamanship and boat handling.
   Facts: scratchpad/facts/seamanship-and-boat-handling.md (fact ids F.. cited in comments).
   Extra verification (2026-10-03): sdir.no "About CE marking" — the builder's plate lists manufacturer, max load
   incl. outboard, max persons, design category and CE symbol; maximum engine power (kW) is stated in the owner's
   manual, not on the plate. sdir.no "Husk vest i bat" — towed water-sports equipment (water skis, tubes,
   wakeboards) is covered by the duty to wear flotation; the operator must ensure under-15s wear it; operator and
   owner are responsible that there is flotation for everyone on board. */
(function () {
  'use strict';
  const S = BOAT.svg, C = S.COLORS, T = S.text;
  const INK = 'var(--ink)', MUTED = 'var(--muted)', LINE = 'var(--line)';
  const HULL = '#D9DEE3', HULL_STROKE = '#2b3440', WATER = '#2E86DE', SEABED = '#8B6B43', QUAY = '#7a5230';

  /* ---------- drawing helpers ---------- */
  function head(x, y, a, len, col) {
    const hx = x - len * Math.cos(a), hy = y - len * Math.sin(a), s = len * 0.5;
    return `<polygon points="${x.toFixed(1)},${y.toFixed(1)} ${(hx + s * Math.sin(a)).toFixed(1)},${(hy - s * Math.cos(a)).toFixed(1)} ${(hx - s * Math.sin(a)).toFixed(1)},${(hy + s * Math.cos(a)).toFixed(1)}" fill="${col}"/>`;
  }
  function arrow(x1, y1, x2, y2, o) {
    o = o || {}; const col = o.color || INK, w = o.width || 2, hl = o.head || 9;
    const a = Math.atan2(y2 - y1, x2 - x1);
    const ex = x2 - hl * 0.8 * Math.cos(a), ey = y2 - hl * 0.8 * Math.sin(a);
    const sx = o.both ? x1 + hl * 0.8 * Math.cos(a) : x1, sy = o.both ? y1 + hl * 0.8 * Math.sin(a) : y1;
    let s = `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''}/>`;
    s += head(x2, y2, a, hl, col);
    if (o.both) s += head(x1, y1, a + Math.PI, hl, col);
    return s;
  }
  function boatPath(cx, cy, L, B) {
    const t = cy - L / 2, b = cy + L / 2, hw = B / 2;
    return `M${cx},${t} C${cx + hw * 0.5},${t + L * 0.07} ${cx + hw},${t + L * 0.28} ${cx + hw},${t + L * 0.42} L${cx + hw},${b} L${cx - hw},${b} L${cx - hw},${t + L * 0.42} C${cx - hw},${t + L * 0.28} ${cx - hw * 0.5},${t + L * 0.07} ${cx},${t} Z`;
  }
  /* top view, bow up, centred at (cx,cy); o.rot rotates clockwise about the centre */
  function boatTop(cx, cy, L, B, o) {
    o = o || {};
    const fill = o.fill || HULL, stroke = o.stroke || HULL_STROKE;
    let inner = `<path d="${boatPath(cx, cy, L, B)}" fill="${fill}" stroke="${stroke}" stroke-width="${o.sw || 2}" stroke-linejoin="round"/>`;
    if (o.motor !== false) inner += `<rect x="${cx - B * 0.12}" y="${cy + L / 2 - 2}" width="${B * 0.24}" height="${L * 0.07}" rx="2" fill="${HULL_STROKE}"/>`;
    if (o.console) inner += `<path d="M${cx - B * 0.32},${cy - L * 0.02} Q${cx},${cy - L * 0.12} ${cx + B * 0.32},${cy - L * 0.02}" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;
    return o.rot ? `<g transform="rotate(${o.rot} ${cx} ${cy})">${inner}</g>` : inner;
  }
  function cleat(x, y, col) { return `<path d="M${x - 6},${y} h12 M${x},${y} v4" stroke="${col || HULL_STROKE}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`; }
  function wave(x, y, w, col) { let d = `M${x},${y}`; for (let i = 0; i < w; i += 12) d += ` q3,-4 6,0 q3,4 6,0`; return `<path d="${d}" fill="none" stroke="${col || WATER}" stroke-width="1.5"/>`; }
  function wind(x1, y1, x2, y2, label, o) { return arrow(x1, y1, x2, y2, { color: '#3b82c4', width: 2.5, head: 10 }) + (label ? T((x1 + x2) / 2 + ((o || {}).dx || 0), (y1 + y2) / 2 + ((o || {}).dy || 0), label, { size: 11, fill: '#3b82c4', weight: 700, anchor: (o || {}).anchor || 'middle' }) : ''); }
  function box(x, y, w, h, o) { o = o || {}; return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.fill || 'var(--paper)'}" stroke="${o.stroke || LINE}" stroke-width="${o.sw || 1}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''}/>`; }
  function label(x, y, s, size, o) { return T(x, y, s, Object.assign({ size: size || 11 }, o || {})); }
  function lines(x, y, arr, size, o, lh) { return arr.map((s, i) => label(x, y + i * (lh || (size || 11) + 3), s, size, o)).join(''); }
  function dot(x, y, r, fill, stroke) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke || HULL_STROKE}" stroke-width="1"/>`; }
  function lamp(x, y, col, r) { r = r || 6; return `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${col}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`; }
  function badge(x, y, s) { return `<circle cx="${x}" cy="${y}" r="10" fill="var(--ink)"/>` + T(x, y, s, { size: 11, fill: 'var(--paper)', weight: 700 }); }

  /* ---------- ILL-1 terminology (F89) ---------- */
  function illTerms() {
    const cx = 230, bowY = 30, L = 300, B = 100, cy = bowY + L / 2, left = cx - B / 2, right = cx + B / 2, tr = bowY + L;
    let s = boatTop(cx, cy, L, B, { console: true });
    s += cleat(190, 70) + cleat(270, 70) + cleat(190, 300) + cleat(270, 300);
    s += label(cx, 14, 'BOW (front)', 12, { weight: 700 });
    s += label(cx, 372, 'STERN (back)', 12, { weight: 700 });
    // sides with sidelight colours
    s += dot(190, 112, 5, C.red) + dot(270, 112, 5, C.green);
    s += label(168, 112, 'PORT (left, red)', 12, { anchor: 'end', weight: 700 });
    s += label(292, 112, 'STARBOARD (right, green)', 12, { anchor: 'start', weight: 700 });
    // gunwale
    s += `<line x1="${left}" y1="180" x2="140" y2="180" stroke="${MUTED}" stroke-width="1"/>`;
    s += label(136, 180, 'GUNWALE', 11, { anchor: 'end', weight: 700 }) + label(136, 194, '(top edge of the side)', 10, { anchor: 'end', fill: MUTED });
    // cleat
    s += `<line x1="184" y1="300" x2="140" y2="300" stroke="${MUTED}" stroke-width="1"/>` + label(136, 300, 'CLEAT', 11, { anchor: 'end', weight: 700 });
    // transom
    s += `<line x1="${right}" y1="${tr - 3}" x2="320" y2="340" stroke="${MUTED}" stroke-width="1"/>` + label(325, 340, 'TRANSOM (flat stern plate)', 11, { anchor: 'start', weight: 700 });
    // fore / aft arrows on centreline
    s += arrow(cx, 150, cx, 104, { width: 2 }) + label(cx, 92, 'FORE', 10, { weight: 700 });
    s += arrow(cx, 232, cx, 280, { width: 2 }) + label(cx, 291, 'AFT', 10, { weight: 700 });
    // beam & athwartships
    s += arrow(left + 3, 200, right - 3, 200, { both: true, width: 2 }) + label(cx, 211, 'BEAM (width)', 10, { weight: 700 });
    s += arrow(left + 3, 250, right - 3, 250, { both: true, width: 2, dash: '4 3' }) + label(cx, 262, 'ATHWARTSHIPS', 10, { weight: 700 });
    // wind
    s += wind(430, 160, 300, 160, 'WIND', { dx: 95, anchor: 'start' });
    s += label(300, 185, 'WINDWARD side (wind comes from here)', 10, { anchor: 'start', fill: '#3b82c4' });
    s += label(160, 222, 'LEEWARD side (sheltered)', 10, { anchor: 'end', fill: '#3b82c4' });
    // side-view inset
    s += box(330, 232, 300, 150, { fill: 'var(--paper-2)' });
    s += label(480, 248, 'Side view', 11, { weight: 700, fill: MUTED });
    s += `<path d="M380,296 L585,296 Q604,315 598,338 L570,360 L400,360 L380,340 Z" fill="${HULL}" stroke="${HULL_STROKE}" stroke-width="2"/>`;
    s += `<line x1="338" y1="330" x2="624" y2="330" stroke="${WATER}" stroke-width="2.5"/>` + label(345, 321, 'waterline', 9, { anchor: 'start', fill: WATER });
    s += arrow(410, 330, 410, 297, { width: 1.5, head: 7 }) + arrow(410, 297, 410, 330, { width: 1.5, head: 7 }) + label(416, 313, 'FREEBOARD', 10, { anchor: 'start', weight: 700 });
    s += arrow(540, 330, 540, 359, { width: 1.5, head: 7 }) + arrow(540, 359, 540, 330, { width: 1.5, head: 7 }) + label(546, 345, 'DRAUGHT', 10, { anchor: 'start', weight: 700 });
    s += label(520, 312, 'HULL', 10, { weight: 700 }) + label(485, 372, 'KEEL (centreline of the bottom)', 10, { weight: 700 });
    return S.svg(640, 390, s, { label: 'Boat terminology: bow, stern, port, starboard, beam, draught, freeboard' });
  }

  /* ---------- CE plate (F14, F15) ---------- */
  function illCEPlate(o) {
    o = o || {}; const cat = o.cat || 'C', persons = o.persons || 6, load = o.load || 650;
    let s = box(20, 30, 270, 190, { fill: '#cfd6dd', stroke: '#5b6672', sw: 2, rx: 10 });
    s += `<circle cx="40" cy="50" r="4" fill="#5b6672"/><circle cx="270" cy="50" r="4" fill="#5b6672"/><circle cx="40" cy="200" r="4" fill="#5b6672"/><circle cx="270" cy="200" r="4" fill="#5b6672"/>`;
    s += label(155, 58, o.quiz ? 'EXAMPLE BOATS' : 'EXAMPLE BOATS (manufacturer)', 12, { weight: 700, fill: '#1c242c' });
    s += `<line x1="40" y1="72" x2="270" y2="72" stroke="#5b6672"/>`;
    s += label(40, 95, 'Max load incl. outboard:', 11, { anchor: 'start', fill: '#1c242c' }) + label(270, 95, load + ' kg', 12, { anchor: 'end', weight: 700, fill: '#1c242c' });
    s += label(40, 120, 'Max persons:', 11, { anchor: 'start', fill: '#1c242c' }) + label(270, 120, String(persons), 12, { anchor: 'end', weight: 700, fill: '#1c242c' });
    s += label(40, 145, 'Design category:', 11, { anchor: 'start', fill: '#1c242c' }) + label(270, 145, cat, 14, { anchor: 'end', weight: 800, fill: '#1c242c' });
    s += `<text x="50" y="190" font-size="30" font-weight="800" fill="#1c242c" font-family="Arial, sans-serif">CE</text>`;
    s += label(160, 188, 'symbol required', 9, { fill: '#5b6672' });
    if (!o.quiz) {
      const rows = [['A', 'Ocean', 'wind above Beaufort 8', 'waves above 4 m'], ['B', 'Offshore', 'up to Beaufort 8', 'waves up to 4 m'], ['C', 'Inshore', 'up to Beaufort 6', 'waves up to 2 m'], ['D', 'Sheltered', 'up to Beaufort 4', 'waves up to 0.3 m']];
      s += label(465, 40, 'Design categories (CE)', 12, { weight: 700 });
      rows.forEach((r, i) => {
        const y = 60 + i * 42;
        s += box(320, y, 300, 36, { fill: r[0] === cat ? 'var(--shallow)' : 'var(--paper)' });
        s += `<circle cx="340" cy="${y + 18}" r="12" fill="var(--ink)"/>` + T(340, y + 18, r[0], { size: 12, fill: 'var(--paper)', weight: 800 });
        s += label(360, y + 12, r[1], 11, { anchor: 'start', weight: 700 }) + label(360, y + 27, r[2] + ', ' + r[3], 10, { anchor: 'start', fill: MUTED });
      });
      s += label(470, 236, 'A = most seaworthy, D = most limited', 10, { fill: MUTED });
    } else {
      s += lines(465, 100, ['Read the plate.', 'What does it allow?'], 13, { weight: 700 }, 20);
    }
    return S.svg(640, 250, s, { label: 'CE builder plate and design categories' });
  }

  /* ---------- loading cross-sections (F16, F17) ---------- */
  function hullSection(cx, cy, w, h, heel, inner) {
    const hull = `<path d="M${cx - w / 2},${cy - h / 2} L${cx - w / 2 + 6},${cy + h * 0.25} Q${cx},${cy + h / 2 + 14} ${cx + w / 2 - 6},${cy + h * 0.25} L${cx + w / 2},${cy - h / 2} Z" fill="${HULL}" stroke="${HULL_STROKE}" stroke-width="2"/>`;
    return `<g transform="rotate(${heel} ${cx} ${cy})">${hull}${inner || ''}</g>`;
  }
  function illLoading(o) {
    o = o || {};
    const panels = [
      { t: o.quiz ? 'A' : 'Low and centred', sub: o.quiz ? '' : 'stable: weight low, in the middle', heel: 0, inner: (cx, cy) => `<rect x="${cx - 26}" y="${cy + 4}" width="52" height="22" fill="#c07a2c" stroke="${HULL_STROKE}"/><rect x="${cx - 14}" y="${cy - 14}" width="28" height="18" fill="#c07a2c" stroke="${HULL_STROKE}"/>` + dot(cx, cy + 6, 4, C.red) + label(cx, cy + 40, 'G', 10, { weight: 700, fill: C.red }) },
      { t: o.quiz ? 'B' : 'High and on one side', sub: o.quiz ? '' : 'heels, little reserve stability', heel: 14, inner: (cx, cy) => `<rect x="${cx + 8}" y="${cy - 56}" width="34" height="30" fill="#c07a2c" stroke="${HULL_STROKE}"/><rect x="${cx + 14}" y="${cy - 26}" width="22" height="14" fill="#c07a2c" stroke="${HULL_STROKE}"/>` + dot(cx + 16, cy - 24, 4, C.red) + label(cx + 16, cy - 36, 'G', 10, { weight: 700, fill: C.red }) },
      { t: o.quiz ? 'C' : 'Water in the bilge', sub: o.quiz ? '' : 'free surface: water slides to the low side', heel: 10, inner: (cx, cy) => `<path d="M${cx - 40},${cy + 26} L${cx + 34},${cy + 12} L${cx + 34},${cy + 30} Q${cx},${cy + 52} ${cx - 40},${cy + 26} Z" fill="${WATER}" opacity=".7"/>` + dot(cx + 10, cy + 20, 4, C.red) + label(cx + 10, cy + 8, 'G', 10, { weight: 700, fill: C.red }) },
    ];
    let s = '';
    panels.forEach((p, i) => {
      const cx = 110 + i * 210, cy = 130;
      s += `<line x1="${cx - 100}" y1="${cy + 18}" x2="${cx + 100}" y2="${cy + 18}" stroke="${WATER}" stroke-width="2"/>`;
      s += hullSection(cx, cy, 130, 80, p.heel, p.inner(cx, cy));
      // people
      s += dot(cx - 36, cy - 48, 7, '#f1c27d') + dot(cx + 36, cy - 48, 7, '#f1c27d');
      s += label(cx, 24, p.t, 13, { weight: 700 });
      if (p.sub) s += label(cx, 42, p.sub, 10, { fill: MUTED });
      if (!o.quiz) s += label(cx, 228, i === 0 ? 'correct' : 'wrong', 11, { weight: 700, fill: i === 0 ? C.green : C.red });
    });
    if (!o.quiz) s += label(320, 250, 'G = centre of gravity. Lower and more central = more stable; more freeboard left.', 10, { fill: MUTED });
    return S.svg(640, 262, s, { label: 'Loading and stability cross-sections' });
  }

  /* ---------- trim side views (F18, F67) ---------- */
  function hullSide(cx, cy, L, H, tilt, col) {
    return `<g transform="rotate(${tilt} ${cx} ${cy})"><path d="M${cx - L / 2},${cy - H / 2} L${cx + L / 2 - 20},${cy - H / 2} Q${cx + L / 2 + 6},${cy} ${cx + L / 2 - 8},${cy + H / 2} L${cx - L / 2 + 12},${cy + H / 2} L${cx - L / 2},${cy - H / 2 + 6} Z" fill="${col || HULL}" stroke="${HULL_STROKE}" stroke-width="2"/><rect x="${cx - L / 2 - 8}" y="${cy - H / 2 + 4}" width="10" height="${H * 0.9}" rx="2" fill="${HULL_STROKE}"/></g>`;
  }
  function illTrim(o) {
    o = o || {};
    const panels = [
      { t: o.quiz ? 'A' : 'Level trim', sub: 'correct: runs flat, steers true', tilt: 0 },
      { t: o.quiz ? 'B' : 'Bow-heavy', sub: 'bow digs in; may veer suddenly at speed', tilt: 10 },
      { t: o.quiz ? 'C' : 'Stern-heavy', sub: 'hard to plane; porpoising', tilt: -12 },
    ];
    let s = '';
    panels.forEach((p, i) => {
      const cx = 110 + i * 210, cy = 120;
      s += `<rect x="${cx - 100}" y="${cy + 10}" width="200" height="60" fill="${WATER}" opacity=".25"/>`;
      s += `<line x1="${cx - 100}" y1="${cy + 10}" x2="${cx + 100}" y2="${cy + 10}" stroke="${WATER}" stroke-width="2"/>`;
      s += hullSide(cx, cy + 4, 150, 34, p.tilt);
      s += arrow(cx + 100, cy - 30, cx + 60, cy - 30, { width: 1.5, head: 7, color: MUTED }) + label(cx + 80, cy - 42, 'direction', 9, { fill: MUTED });
      s += label(cx, 26, p.t, 13, { weight: 700 });
      if (!o.quiz) s += label(cx, 44, p.sub, 10, { fill: MUTED });
      if (!o.quiz) s += label(cx, 200, i === 0 ? 'correct' : 'wrong', 11, { weight: 700, fill: i === 0 ? C.green : C.red });
    });
    return S.svg(640, 216, s, { label: 'Trim: level, bow-heavy and stern-heavy' });
  }
