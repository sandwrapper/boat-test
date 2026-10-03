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

  /* ---------- ILL-2 prop walk (F22, F23): right-handed prop, astern -> stern to PORT ---------- */
  function propSymbol(cx, cy, dir) {
    // small 3-blade propeller seen from astern with a curved rotation arrow (dir 1 = clockwise)
    let s = '';
    for (let k = 0; k < 3; k++) s += `<ellipse cx="${cx}" cy="${cy - 9}" rx="4" ry="9" fill="${HULL_STROKE}" transform="rotate(${k * 120} ${cx} ${cy})"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="3" fill="#888"/>`;
    const r = 17, a0 = dir > 0 ? 200 : 160, a1 = dir > 0 ? 340 : 20;
    const p = a => [cx + r * Math.sin(S.deg(a)), cy - r * Math.cos(S.deg(a))];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    s += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 ${dir > 0 ? 1 : 0} ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${C.blue}" stroke-width="2"/>`;
    const tangent = dir > 0 ? S.deg(a1 + 90) : S.deg(a1 - 90);
    s += head(x1, y1, tangent, 8, C.blue);
    return s;
  }
  function illPropWalk(o) {
    o = o || {};
    function panel(x0, title, astern) {
      const cx = x0 + 150, cy = 170, L = 190, B = 70;
      let s = label(cx, 22, title, 14, { weight: 700 });
      s += boatTop(cx, cy, L, B, { console: true, motor: false });
      s += propSymbol(cx, cy + L / 2 + 30, astern ? -1 : 1);
      s += label(cx, cy + L / 2 + 60, astern ? 'prop turns anticlockwise in reverse' : 'turns clockwise seen from astern', 10, { fill: MUTED });
      s += label(cx, cy + L / 2 + 73, '(right-handed propeller)', 10, { fill: MUTED });
      if (astern) {
        s += arrow(cx - B / 2 - 4, cy + 70, cx - B / 2 - 70, cy + 70, { color: C.red, width: 5, head: 14 });
        s += lines(cx - B / 2 - 36, cy + 92, ['stern kicks', 'to PORT'], 12, { weight: 800, fill: C.red }, 14);
        s += arrow(cx + B / 2 + 4, cy - 60, cx + B / 2 + 50, cy - 60, { color: INK, width: 2, head: 9 });
        s += lines(cx + B / 2 + 28, cy - 44, ['bow swings', 'to starboard'], 10, { fill: INK }, 12);
        s += arrow(cx, cy + L / 2 + 95, cx, cy + L / 2 + 120, { color: MUTED, width: 2 }) ;
        s += label(cx + 10, cy + L / 2 + 108, 'boat moves astern', 10, { anchor: 'start', fill: MUTED });
      } else {
        s += arrow(cx + B / 2 + 4, cy + 70, cx + B / 2 + 40, cy + 70, { color: MUTED, width: 2.5, head: 9 });
        s += lines(cx + B / 2 + 22, cy + 92, ['stern walks slightly', 'to starboard (small)'], 10, { fill: MUTED }, 12);
        s += arrow(cx, cy - L / 2 - 8, cx, cy - L / 2 - 36, { color: MUTED, width: 2 });
        s += label(cx + 8, cy - L / 2 - 22, 'boat moves ahead', 10, { anchor: 'start', fill: MUTED });
      }
      return s;
    }
    let s = '';
    if (o.quiz) {
      // single panel: boat going astern, two candidate arrows numbered 1 (to port) and 2 (to starboard)
      const cx = 320, cy = 170, L = 190, B = 70;
      s += label(cx, 22, 'Right-handed propeller, engine in ASTERN', 14, { weight: 700 });
      s += boatTop(cx, cy, L, B, { console: true, motor: false });
      s += propSymbol(cx, cy + L / 2 + 30, -1);
      s += label(cx, cy + L / 2 + 60, 'prop turns anticlockwise in reverse', 10, { fill: MUTED });
      s += arrow(cx - B / 2 - 4, cy + 70, cx - B / 2 - 70, cy + 70, { color: INK, width: 3, head: 11, dash: '7 5' }) + badge(cx - B / 2 - 90, cy + 70, '1');
      s += arrow(cx + B / 2 + 4, cy + 70, cx + B / 2 + 70, cy + 70, { color: INK, width: 3, head: 11, dash: '7 5' }) + badge(cx + B / 2 + 90, cy + 70, '2');
      s += label(cx, cy + L / 2 + 100, 'Which way does the stern move?', 12, { weight: 700 });
      s += label(cx, 46, 'bow up; left of picture = port', 10, { fill: MUTED });
    } else {
      s += panel(0, 'A — AHEAD', false) + `<line x1="320" y1="10" x2="320" y2="320" stroke="${LINE}"/>` + panel(320, 'B — ASTERN (reverse)', true);
    }
    return S.svg(640, 330, s, { label: 'Propeller walk with a right-handed propeller' });
  }

  /* ---------- ILL-3 approaching a quay in wind (F27, F28) ---------- */
  function illBerthing() {
    function panel(x0, title, offQuay) {
      let s = label(x0 + 160, 20, title, 13, { weight: 700 });
      s += `<rect x="${x0 + 8}" y="236" width="304" height="26" fill="${QUAY}"/>` + label(x0 + 160, 249, 'QUAY', 11, { fill: '#fff3e0', weight: 700 });
      // wind arrows
      for (let i = 0; i < 3; i++) {
        const wx = x0 + 230 + i * 30;
        s += offQuay ? arrow(wx, 225, wx, 170, { color: '#3b82c4', width: 2, head: 8 }) : arrow(wx, 60, wx, 115, { color: '#3b82c4', width: 2, head: 8 });
      }
      s += label(x0 + 260, offQuay ? 158 : 50, 'WIND', 11, { fill: '#3b82c4', weight: 700 });
      if (offQuay) {
        // boat bow pointing down-left at about 40 degrees to the quay; bow near the quay
        const cx = x0 + 150, cy = 150;
        s += boatTop(cx, cy, 130, 46, { rot: 180 + 40, console: true });
        // fenders on quay side (the port side faces the quay when heading down-left... bow down-left: starboard faces down-right; quay is below -> port side? bow points down-left => the hull's left side (port) faces up-left, starboard faces down-right. Fenders on starboard (lower) side.)
        [[-20, 18], [8, 42], [36, 66]].forEach(([dx, dy]) => { s += `<ellipse cx="${cx + dx - 36}" cy="${cy + dy - 10}" rx="4" ry="7" fill="${C.orange}" transform="rotate(40 ${cx + dx - 36} ${cy + dy - 10})"/>`; });
        // angle arc at the bow
        const bx = cx - 65 * Math.sin(S.deg(40)) , by = cy + 65 * Math.cos(S.deg(40));
        s += `<path d="M${(bx - 40).toFixed(1)},${(by + 3).toFixed(1)} A40,40 0 0 1 ${(bx - 40 * Math.cos(S.deg(40))).toFixed(1)},${(by + 3 - 40 * Math.sin(S.deg(40))).toFixed(1)}" fill="none" stroke="${C.red}" stroke-width="1.5"/>`;
        s += `<line x1="${(bx - 60).toFixed(1)}" y1="${(by + 3).toFixed(1)}" x2="${(bx + 20).toFixed(1)}" y2="${(by + 3).toFixed(1)}" stroke="${C.red}" stroke-width="1" stroke-dasharray="3 3"/>`;
        s += label(bx - 56, by - 26, '30–45°', 11, { fill: C.red, weight: 700 });
        // bow line to quay
        s += `<line x1="${(bx + 2).toFixed(1)}" y1="${(by + 2).toFixed(1)}" x2="${x0 + 40}" y2="238" stroke="${C.orange}" stroke-width="2"/>`;
        s += badge(x0 + 40, 90, '1') + label(x0 + 56, 90, 'dead slow, short bursts in gear', 10, { anchor: 'start' });
        s += badge(x0 + 40, 110, '2') + label(x0 + 56, 110, 'bow line ashore FIRST', 10, { anchor: 'start' });
        s += badge(x0 + 40, 130, '3') + label(x0 + 56, 130, 'helm toward quay, touch of ahead:', 10, { anchor: 'start' }) + label(x0 + 72, 143, 'the stern swings in', 10, { anchor: 'start' });
        s += badge(x0 + 40, 163, '4') + label(x0 + 56, 163, 'stern line', 10, { anchor: 'start' });
        s += label(x0 + 160, 290, 'Steep angle so the bow reaches the quay before the wind blows it off.', 10, { fill: MUTED });
      } else {
        const cx = x0 + 150, cy = 150;
        s += boatTop(cx, cy, 130, 46, { rot: 270 - 12, console: true });
        [[-40, 0], [0, 0], [40, 0]].forEach(([dx]) => { s += `<ellipse cx="${cx + dx}" cy="${cy + 26 + dx * 0.21}" rx="4" ry="7" fill="${C.orange}" transform="rotate(-12 ${cx + dx} ${cy + 26 + dx * 0.21})"/>`; });
        for (let i = 0; i < 3; i++) { const wx = cx - 50 + i * 50; s += arrow(wx, cy + 40, wx, cy + 76, { color: '#3b82c4', width: 1.5, head: 7, dash: '4 3' }); }
        s += label(cx, cy - 46, 'stop about one boat-width off, nearly parallel (10–15°)', 10, {});
        s += label(cx, cy + 92, 'the wind sets you gently onto the fenders', 10, { fill: '#3b82c4' });
        s += label(x0 + 160, 290, 'Stop short and let the wind do the last metre. Fenders out early.', 10, { fill: MUTED });
      }
      return s;
    }
    const s = panel(0, 'A — wind blowing OFF the quay', true) + `<line x1="320" y1="10" x2="320" y2="300" stroke="${LINE}"/>` + panel(320, 'B — wind blowing ONTO the quay', false);
    return S.svg(640, 305, s, { label: 'Approaching a quay with wind off and onto the quay' });
  }

  /* ---------- mooring lines (F30, F31) ---------- */
  function illMooringLines(o) {
    o = o || {};
    const cx = 320, cy = 182, L = 240, B = 66;
    let s = `<rect x="0" y="228" width="640" height="26" fill="${QUAY}"/>` + label(620, 241, 'QUAY', 11, { fill: '#fff3e0', weight: 700, anchor: 'end' });
    s += boatTop(cx, cy, L, B, { rot: 90, console: true });
    s += label(445, 150, 'BOW', 10, { weight: 700, anchor: 'start' }) + label(195, 150, 'STERN', 10, { weight: 700, anchor: 'end' });
    const bowC = [420, 206], sternC = [215, 206], mid = [320, 214];
    s += cleat(bowC[0], bowC[1] - 6) + cleat(sternC[0], sternC[1] - 6);
    // fenders
    [250, 320, 390].forEach(x => { s += `<ellipse cx="${x}" cy="${221}" rx="7" ry="4" fill="${C.orange}"/>`; });
    const L_ = [
      { from: bowC, to: [570, 230], name: 'BOW LINE', n: '1', dash: false },
      { from: sternC, to: [70, 230], name: 'STERN LINE', n: '2', dash: false },
      { from: bowC, to: [215, 230], name: 'FORE SPRING', n: '3', dash: false },
      { from: sternC, to: [425, 230], name: 'AFT SPRING', n: '4', dash: false },
      { from: mid, to: [320, 230], name: 'BREAST LINE (optional)', n: '5', dash: true },
    ];
    L_.forEach(l => {
      s += `<line x1="${l.from[0]}" y1="${l.from[1]}" x2="${l.to[0]}" y2="${l.to[1]}" stroke="${l.dash ? MUTED : C.orange}" stroke-width="${l.dash ? 2 : 3}" ${l.dash ? 'stroke-dasharray="5 4"' : ''} stroke-linecap="round"/>`;
      s += `<circle cx="${l.to[0]}" cy="${l.to[1] + 4}" r="4" fill="#3b2a1a"/>`;
      s += o.quiz ? badge(l.to[0], 272, l.n) : label(l.to[0], 272, l.name, 10, { weight: 700 });
    });
    s += label(320, 40, o.quiz ? 'A boat moored alongside a quay — which line is which?' : 'Mooring alongside: bow line, stern line, springs (and optional breast line)', 12, { weight: 700 });
    if (!o.quiz) {
      s += label(320, 60, 'Bow line stops movement astern, stern line stops movement ahead,', 10, { fill: MUTED });
      s += label(320, 74, 'springs cross and stop surging fore and aft, breast lines stop sideways movement.', 10, { fill: MUTED });
    }
    s += wind(560, 100, 560, 140, 'tide / waves: leave slack', { dy: -52, anchor: 'middle' });
    return S.svg(640, 290, s, { label: 'Mooring lines alongside a quay' });
  }

  /* ---------- ILL-4 anchor scope (F37–F41) ---------- */
  function anchorIcon(x, y, tilt, scale) {
    scale = scale || 1;
    return `<g transform="translate(${x} ${y}) rotate(${tilt || 0}) scale(${scale})"><path d="M0,0 L28,-12 M0,0 L6,6 L22,8 L8,-4 Z" fill="${HULL_STROKE}" stroke="${HULL_STROKE}" stroke-width="3" stroke-linejoin="round"/></g>`;
  }
  function illAnchorScope() {
    const surf = 112, bed = 270;
    let s = `<rect x="0" y="${surf}" width="640" height="${bed - surf}" fill="${WATER}" opacity=".22"/>`;
    s += `<rect x="0" y="${bed}" width="640" height="70" fill="${SEABED}"/>`;
    s += `<line x1="0" y1="${surf}" x2="640" y2="${surf}" stroke="${WATER}" stroke-width="2.5"/>`;
    // shore with transit marks (right)
    s += `<path d="M580,${surf} L600,78 L640,70 L640,${surf} Z" fill="#9bb86b" stroke="${HULL_STROKE}"/>`;
    s += `<rect x="598" y="80" width="4" height="18" fill="#5a3b1e"/><circle cx="600" cy="74" r="10" fill="#3d8b3d"/>`;
    s += `<rect x="618" y="78" width="16" height="14" fill="#c84c3c"/><polygon points="616,78 626,68 636,78" fill="#8a2f24"/>`;
    // boat on the surface
    s += `<path d="M400,${surf} L420,90 L540,90 L556,${surf - 2} L548,${surf + 8} L412,${surf + 8} Z" fill="${HULL}" stroke="${HULL_STROKE}" stroke-width="2"/>`;
    s += `<rect x="455" y="72" width="40" height="18" fill="${HULL}" stroke="${HULL_STROKE}" stroke-width="1.5"/>`;
    s += `<line x1="470" y1="72" x2="470" y2="40" stroke="${HULL_STROKE}" stroke-width="2"/>`;
    s += `<circle cx="470" cy="38" r="6" fill="${C.white}" stroke="${HULL_STROKE}" stroke-width="1.5"/>`;
    s += label(470, 22, 'night: ONE all-round white light (vessel under 50 m)', 10, { weight: 700 });
    s += `<line x1="430" y1="90" x2="430" y2="62" stroke="${HULL_STROKE}" stroke-width="1.5"/><circle cx="430" cy="56" r="7" fill="${C.black}"/>`;
    s += label(424, 56, 'day: black ball forward', 10, { anchor: 'end', weight: 700 });
    // transit sight line
    s += `<line x1="470" y1="98" x2="636" y2="78" stroke="${MUTED}" stroke-width="1" stroke-dasharray="4 3"/>`;
    s += lines(598, 150, ['Transit: tree in line', 'with the house.', 'If it opens,', 'you are dragging.'], 10, { fill: INK }, 13);
    // rode: bow roller (400,112) sagging to chain at (170,266)
    s += `<path d="M400,${surf} Q280,275 170,266" fill="none" stroke="${C.orange}" stroke-width="3"/>`;
    s += `<line x1="170" y1="266" x2="102" y2="268" stroke="${HULL_STROKE}" stroke-width="5" stroke-dasharray="6 4" stroke-linecap="round"/>`;
    s += anchorIcon(74, 270, 5, 1.1);
    s += label(135, 292, '5–8 m chain next to the anchor', 10, { fill: '#fff3e0', weight: 700 });
    s += label(330, 292, 'pull on the anchor stays nearly horizontal — it digs in', 10, { fill: '#fff3e0' });
    s += label(250, 168, 'RODE LENGTH ~ 5 x D', 13, { weight: 800, fill: C.orange });
    s += label(250, 186, '(3 x for all-chain in calm weather; 7–10 x in strong wind or poor holding)', 10, { fill: INK });
    // depth arrow
    s += arrow(392, surf + 2, 392, bed - 2, { both: true, width: 1.5, head: 8 });
    s += lines(400, 196, ['DEPTH D', 'from bow roller to seabed', '(charted depth + freeboard', '+ rise of tide)'], 10, { anchor: 'start', weight: 600 }, 13);
    // wrong inset
    s += box(16, 10, 220, 94, { fill: 'var(--paper-2)' });
    s += `<line x1="24" y1="44" x2="228" y2="44" stroke="${WATER}" stroke-width="2"/><line x1="24" y1="96" x2="228" y2="96" stroke="${SEABED}" stroke-width="4"/>`;
    s += `<path d="M170,44 L176,34 L214,34 L220,44 Z" fill="${HULL}" stroke="${HULL_STROKE}"/>`;
    s += `<line x1="176" y1="44" x2="128" y2="92" stroke="${C.orange}" stroke-width="2.5"/>`;
    s += anchorIcon(112, 92, -40, 0.7);
    s += `<path d="M94,70 L110,86 M110,70 L94,86" stroke="${C.red}" stroke-width="3"/>`;
    s += lines(60, 56, ['WRONG: scope too short,', 'steep pull lifts the anchor', 'and it drags'], 9, { anchor: 'start', fill: C.red, weight: 700 }, 11);
    return S.svg(640, 340, s, { label: 'Anchoring: scope, chain, depth, anchor light and transit check' });
  }

  /* ---------- scope comparison for a picture question ---------- */
  function illScopeCompare() {
    // three panels, same depth, different rode lengths: A 1 x, B 5 x, C 2.5 x
    const specs = [['A', 20, 'rode about equal to the depth'], ['B', 110, 'rode about five times the depth'], ['C', 50, 'rode about twice the depth']];
    let s = '';
    specs.forEach(([n, dx, sub], i) => {
      const x0 = i * 213, surf = 60, bed = 150;
      s += `<rect x="${x0 + 4}" y="${surf}" width="205" height="${bed - surf}" fill="${WATER}" opacity=".22"/><rect x="${x0 + 4}" y="${bed}" width="205" height="22" fill="${SEABED}"/>`;
      s += `<line x1="${x0 + 4}" y1="${surf}" x2="${x0 + 209}" y2="${surf}" stroke="${WATER}" stroke-width="2"/>`;
      const bx = x0 + 150;
      s += `<path d="M${bx},${surf} L${bx + 8},${surf - 12} L${bx + 48},${surf - 12} L${bx + 56},${surf} L${bx + 50},${surf + 6} L${bx + 6},${surf + 6} Z" fill="${HULL}" stroke="${HULL_STROKE}" stroke-width="1.5"/>`;
      const ax = bx - dx;
      s += `<path d="M${bx},${surf} Q${(bx + ax) / 2},${bed + (dx > 60 ? 10 : 0)} ${ax},${bed - 2}" fill="none" stroke="${C.orange}" stroke-width="2.5"/>`;
      s += anchorIcon(ax - 18, bed, dx > 60 ? 5 : -35, 0.7);
      s += badge(x0 + 24, 22, n);
      s += label(x0 + 106, 190, sub, 10, { fill: MUTED });
    });
    s += label(320, 44, 'Same depth, rope-and-chain rode, light wind. Which boat has paid out a correct scope?', 11, { weight: 700 });
    return S.svg(640, 205, s, { label: 'Three anchored boats with different scope' });
  }

  /* ---------- ILL-7 towing (F53–F59) ---------- */
  function illTowing() {
    let s = '';
    const cx = 250;
    s += boatTop(cx, 95, 140, 54, { console: true });
    s += label(cx, 14, 'TOWING BOAT', 11, { weight: 700 });
    // bridle from the two stern cleats meeting one beam aft
    s += cleat(cx - 22, 160) + cleat(cx + 22, 160);
    s += `<path d="M${cx - 22},162 L${cx},218 L${cx + 22},162" fill="none" stroke="${C.orange}" stroke-width="3" stroke-linejoin="round"/>`;
    s += label(cx + 36, 190, 'bridle between both stern cleats', 10, { anchor: 'start' }) + label(cx + 36, 203, '(centres the pull; the tug can still steer)', 10, { anchor: 'start', fill: MUTED });
    // towline with sag
    s += `<path d="M${cx},218 Q${cx + 14},270 ${cx},322" fill="none" stroke="${C.orange}" stroke-width="3"/>`;
    s += `<rect x="${cx - 36}" y="160" width="72" height="166" fill="${C.red}" opacity=".12"/>`;
    s += `<rect x="${cx - 36}" y="160" width="72" height="166" fill="none" stroke="${C.red}" stroke-width="1" stroke-dasharray="5 4"/>`;
    s += lines(cx + 44, 240, ['KEEP CLEAR:', 'snap-back zone', '(a parting nylon line', 'whips back)'], 10, { anchor: 'start', fill: C.red, weight: 700 }, 12);
    s += arrow(160, 162, 160, 320, { both: true, width: 1.5, head: 8 });
    s += lines(150, 215, ['Long towline:', 'both boats on wave', 'crests at the same time', '(4–5+ boat lengths);', 'halve it in harbour.'], 10, { anchor: 'end' }, 13);
    // towed boat: bow eye at (cx, 322)
    s += boatTop(cx, 380, 116, 48, { console: true });
    s += `<circle cx="${cx}" cy="326" r="4" fill="none" stroke="${HULL_STROKE}" stroke-width="2"/>`;
    s += label(cx + 36, 330, 'bow eye / strong bow cleat', 10, { anchor: 'start' });
    s += label(cx, 452, 'TOWED BOAT: helmsman steers to follow, outboard raised, all seated', 10, { weight: 700 });
    s += label(cx, 466, 'Tow at 3–5 knots, wide turns, never go astern with the line in the water', 10, { fill: MUTED });
    // night inset
    s += `<rect x="420" y="20" width="210" height="440" rx="10" fill="${C.night}"/>`;
    s += label(525, 38, 'At night (Rule 24, schematic)', 10, { fill: '#e8eef5', weight: 700 });
    s += `<path d="${boatPath(525, 120, 120, 44)}" fill="#1f2d3d" stroke="#56708a" stroke-width="1.5"/>`;
    s += lamp(525, 98, C.white, 5) + lamp(525, 118, C.white, 5);
    s += label(548, 108, '2 masthead lights', 9, { fill: '#e8eef5', anchor: 'start' }) + label(548, 120, 'in a vertical line', 9, { fill: '#e8eef5', anchor: 'start' });
    s += lamp(506, 128, C.red, 4) + lamp(544, 128, C.green, 4);
    s += lamp(525, 162, C.yellow, 5) + lamp(525, 178, C.white, 5);
    s += label(548, 162, 'YELLOW towing light', 9, { fill: C.yellow, anchor: 'start', weight: 700 }) + label(548, 178, 'above the sternlight', 9, { fill: '#e8eef5', anchor: 'start' });
    s += `<line x1="525" y1="186" x2="525" y2="300" stroke="#9aa9b8" stroke-width="2"/>`;
    s += `<path d="${boatPath(525, 350, 100, 40)}" fill="#1f2d3d" stroke="#56708a" stroke-width="1.5"/>`;
    s += lamp(507, 352, C.red, 4) + lamp(543, 352, C.green, 4) + lamp(525, 398, C.white, 5);
    s += label(525, 420, 'towed boat: sidelights + sternlight', 9, { fill: '#e8eef5' });
    s += label(525, 440, '3 masthead lights if tow > 200 m', 9, { fill: '#9aa9b8' });
    return S.svg(640, 475, s, { label: 'Towing arrangement with bridle, towline and Rule 24 lights' });
  }

  /* ---------- bathers and water sports (F9, F75) ---------- */
  function illBathers() {
    let s = `<rect x="0" y="0" width="640" height="200" fill="${WATER}" opacity=".2"/>`;
    s += `<path d="M0,200 Q320,160 640,200 L640,250 L0,250 Z" fill="#e8d7a8"/>` + label(320, 236, 'BEACH / bathing place', 10, { fill: '#6b5a2e', weight: 700 });
    // swimmers
    [[300, 160], [330, 150], [360, 168]].forEach(([x, y]) => { s += dot(x, y, 6, '#f1c27d') + wave(x - 14, y + 8, 28, WATER); });
    s += `<circle cx="330" cy="160" r="118" fill="none" stroke="${C.red}" stroke-width="2" stroke-dasharray="7 5"/>`;
    s += arrow(330, 160, 330 + 118 * Math.cos(S.deg(-30)), 160 - 118 * Math.sin(S.deg(30)), { color: C.red, width: 1.5, head: 8 });
    s += label(400, 112, '50 m', 12, { fill: C.red, weight: 800 });
    s += label(330, 60, 'within 50 m of bathers: max 5 knots', 12, { fill: C.red, weight: 800 });
    // slow boat inside circle
    s += boatTop(250, 110, 56, 22, { rot: 80, console: false });
    s += label(250, 136, '5 kn', 10, { weight: 700 });
    // fast boat outside, with wake
    s += boatTop(90, 80, 70, 26, { rot: 95, console: false });
    s += `<path d="M58,72 l-30,-16 M58,88 l-30,16" stroke="${WATER}" stroke-width="2"/>`;
    s += label(90, 110, 'keep speed and wash down near the shore', 10, { fill: MUTED });
    // skier
    s += boatTop(540, 70, 70, 26, { rot: 100, console: false });
    s += `<line x1="505" y1="72" x2="430" y2="90" stroke="${C.orange}" stroke-width="2"/>` + dot(424, 92, 6, '#f1c27d');
    s += lines(540, 108, ['towing a skier: observer on board,', 'floating line, flotation worn,', 'engine in NEUTRAL when the skier', 'is near the propeller'], 9.5, { fill: INK }, 11);
    return S.svg(640, 250, s, { label: 'Speed near bathers and water-sports safety' });
  }

  /* ---------- high speed dangers (F69, syllabus 1.4.7) ---------- */
  function illHighSpeed() {
    let s = '';
    function fov(x0, title, span, sub) {
      const cx = x0 + 150, cy = 230;
      s += label(cx, 22, title, 13, { weight: 700 });
      s += S.sector(cx, cy, 190, -span / 2, span / 2, '#3b82c4', .18);
      s += `<path d="M${cx},${cy} L${(cx + 190 * Math.sin(S.deg(-span / 2))).toFixed(1)},${(cy - 190 * Math.cos(S.deg(span / 2))).toFixed(1)} M${cx},${cy} L${(cx + 190 * Math.sin(S.deg(span / 2))).toFixed(1)},${(cy - 190 * Math.cos(S.deg(span / 2))).toFixed(1)}" stroke="#3b82c4" stroke-width="1.5"/>`;
      s += boatTop(cx, cy + 20, 56, 22, { console: true, motor: false });
      s += label(cx, cy + 62, sub, 10, { fill: MUTED });
      // hazards
      s += `<polygon points="${x0 + 40},120 ${x0 + 62},110 ${x0 + 70},132 ${x0 + 48},140" fill="#8a8f96" stroke="${HULL_STROKE}"/>`;
      s += label(x0 + 55, 152, 'rock', 9, { fill: MUTED });
      s += boatTop(x0 + 250, 110, 40, 16, { rot: 230, console: false, motor: false }) + label(x0 + 250, 134, 'small boat', 9, { fill: MUTED });
    }
    fov(0, 'Slow: wide field of view', 130, 'you see the rock and the small boat');
    fov(320, 'Fast: tunnel vision', 36, 'eyes lock on a narrow cone ahead');
    s += `<line x1="320" y1="10" x2="320" y2="300" stroke="${LINE}"/>`;
    // GPS lag strip
    s += box(16, 318, 608, 86, { fill: 'var(--paper-2)' });
    s += label(320, 334, 'Electronic chart / GPS at speed: the position shown lags behind where the boat really is', 11, { weight: 700 });
    s += `<line x1="60" y1="372" x2="580" y2="372" stroke="${MUTED}" stroke-width="1" stroke-dasharray="4 4"/>`;
    s += boatTop(300, 372, 56, 22, { rot: 270, console: false, motor: false }) + label(300, 396, 'position shown on the screen', 9.5, { fill: MUTED });
    s += boatTop(470, 372, 56, 22, { rot: 270, console: true, motor: false, fill: '#f6c9a8' }) + label(470, 396, 'where you really are', 9.5, { fill: C.red, weight: 700 });
    s += arrow(336, 356, 436, 356, { both: true, width: 1.5, head: 7, color: C.red }) + label(386, 347, 'delay x speed = distance', 9.5, { fill: C.red });
    return S.svg(640, 412, s, { label: 'Dangers of high speed: tunnel vision and lag of electronic aids' });
  }

  /* =====================================================================
     TOPIC
     ===================================================================== */
  BOAT.register({
    id: 'seamanship-and-boat-handling',
    title: 'Seamanship and boat handling',
    order: 7,
    examShare: 5,
    examWeight: 'about 4–6 of 50 questions',
    summary: 'How a boat behaves and how you handle it safely: boat types and CE design categories, trim, stability and loading, steering and propeller effects, berthing and mooring, anchoring, assistance and towing, water-sports safety and good seamanship. One item here, the dangers of high speed, belongs to the "particularly important" part 4 of the exam, where more than two mistakes fails you.',
    sections: [
      /* ---------------- 1 ---------------- */
      {
        id: 'intro',
        title: 'What this topic is and how the exam tests it',
        html: `
<p>Seamanship is the practical side of the exam: knowing what your boat can do, what it cannot do, and how to handle it without hurting anyone. The official curriculum lists it under part 1, with items on CE design categories, trim and stability, loading and freeboard, mooring and anchoring, assistance and towing, water-sports safety and "good seamanship". One item is lifted into <strong>part 4, "particularly important topics"</strong>: <em>1.4.7 Good seamanship: dangers associated with high speed</em>. Part-4 questions are weighted more, and more than two errors in part 4 fails the whole exam regardless of your total score, so learn the high-speed section until it is automatic.</p>
<p>Exam questions in this topic are recognition questions: "Which way does the stern move when you reverse?", "How much anchor line in 4 m of water?", "Where do you place heavy loads?", "What does the CE plate tell you?". Most can be answered from a handful of numbers and principles, which the "Remember" boxes collect for you.</p>
<p>Start with the words. The exam, the Rules of the Road and every chart use the same vocabulary, and several traps depend on it. <strong>Port</strong> is the left side when you face the bow and carries the <strong>red</strong> sidelight; <strong>starboard</strong> is the right side and carries the <strong>green</strong> one. In a top-view picture, find the bow first: if the boat is drawn pointing down, port appears on the right of the picture.</p>
<div class="callout tip"><p><strong>Windward and leeward.</strong> The windward side is where the wind comes from; the leeward (lee) side is the sheltered side. But a <strong>lee shore</strong> is a shore the wind blows <em>onto</em>: you are being pushed towards it, so it is the dangerous shore, never a place to anchor.</p></div>
<p>Two measurements matter for loading: <strong>draught</strong> is the depth of the boat below the waterline, and <strong>freeboard</strong> is the height of the side above it. Load the boat and the draught grows while the freeboard shrinks.</p>`,
        illustration: () => illTerms(),
        caption: 'Top view with the bow up: port is on the left of the picture (red), starboard on the right (green). Inset: draught below the waterline, freeboard above it.',
        keyFacts: [
          'Part 1 topic; "dangers of high speed" is part-4 item 1.4.7 (max 2 errors in all of part 4).',
          'Port = left facing forward, red; starboard = right, green. Locate the bow before reading any picture.',
          'Draught = waterline to lowest point of the keel; freeboard = waterline to deck edge.',
          'Windward = where the wind comes from; a lee shore is the shore the wind blows ONTO (dangerous).',
        ],
        check: { q: 'What is a "lee shore"?', options: ['The shore the wind blows from, giving sheltered water', 'The shore the wind blows onto, towards which you are pushed', 'The shore on your port side', 'A harbour with a breakwater'], answer: 1, explanation: 'A lee shore lies downwind of you; wind and waves push you towards it, so it is dangerous and a poor place to anchor. The sheltered water is under a weather shore (F89).' },
      },
      /* ---------------- 2 ---------------- */
      {
        id: 'boat-types',
        title: 'Boat types and CE design categories',
        html: `
<p>Boats are built for different waters, and the exam wants you to know how to read that. Start with the hull. A <strong>displacement hull</strong> is carried by buoyancy alone and pushes water aside; its top speed is limited by its waterline length (roughly 1.34 times the square root of the waterline length in feet, so a 25 ft boat manages about 6.7 knots however much power you add). A <strong>planing hull</strong> develops dynamic lift at speed, rises on the water and runs with less draught; it is efficient only at high speed and usually has a hard <strong>chine</strong>, the angle where the bottom meets the side. A <strong>semi-displacement hull</strong> sits in between: some lift, but most of the weight is still carried by buoyancy.</p>
<p>Since 16 June 1998 every new recreational craft with a hull length of 2.5 to 24 m sold in the EEA must be <strong>CE-marked</strong>. The builder's plate on board tells you exactly what the boat was designed for. It must show the manufacturer's name, the <strong>maximum load</strong> including an optional outboard (kg), the <strong>maximum number of persons</strong>, the <strong>design category</strong> A, B, C or D, and the CE symbol. The maximum recommended engine power is stated in the owner's manual.</p>
<div class="table-wrap"><table><thead><tr><th>Category</th><th>Waters</th><th>Wind</th><th>Significant wave height</th></tr></thead><tbody>
<tr><td><strong>A</strong></td><td>Ocean</td><td>above Beaufort 8</td><td>above 4 m</td></tr>
<tr><td><strong>B</strong></td><td>Offshore</td><td>up to and including Beaufort 8</td><td>up to 4 m</td></tr>
<tr><td><strong>C</strong></td><td>Inshore</td><td>up to Beaufort 6</td><td>up to 2 m</td></tr>
<tr><td><strong>D</strong></td><td>Sheltered</td><td>up to Beaufort 4</td><td>up to 0.3 m</td></tr>
</tbody></table></div>
<div class="callout tip"><p><strong>Mnemonic:</strong> A is for Atlantic, D is for Duck pond. Wind 8-8-6-4, waves 4-4-2-0.3. Category D is the most limited, A the most seaworthy.</p></div>
<p>Use the plate before every trip: compare the forecast with the category, and count the people. A category C boat with "max 6 persons" is not for seven adults, and not for a forecast of Beaufort 7 with 2.5 m waves.</p>`,
        illustration: () => illCEPlate({ cat: 'C', persons: 6, load: 650 }),
        caption: 'A builder\'s (CE) plate and the four design categories. The plate shows manufacturer, max load, max persons, category and the CE mark.',
        keyFacts: [
          'CE marking required for new recreational craft 2.5–24 m since 16 June 1998.',
          'CE plate: manufacturer, max load incl. outboard (kg), max persons, design category, CE symbol.',
          'A: > Bf 8, > 4 m. B: up to Bf 8, 4 m. C: up to Bf 6, 2 m. D: up to Bf 4, 0.3 m.',
          'Displacement hull: speed limited by waterline length. Planing hull: lifts and runs flat at speed; has a chine.',
        ],
        check: { q: 'A boat is CE design category C. For what conditions was it designed?', options: ['Wind up to Beaufort 8 and waves up to 4 m', 'Wind up to Beaufort 6 and waves up to 2 m', 'Wind up to Beaufort 4 and waves up to 0.3 m', 'Any conditions, including the open ocean'], answer: 1, explanation: 'Category C (inshore) is designed for winds up to and including Beaufort 6 and significant wave heights up to 2 m. B is Beaufort 8 / 4 m, D is Beaufort 4 / 0.3 m, A is beyond B (F15).' },
      },
      /* ---------------- 3 ---------------- */
      {
        id: 'stability-loading',
        title: 'Stability, loading and freeboard',
        html: `
<p>A boat stays upright because its weight acts downward through the <strong>centre of gravity</strong> while buoyancy pushes up through the centre of the underwater volume. Heel the boat and the buoyancy moves towards the low side and pushes it back upright. The lower and more central the weight, the stronger this righting effect. That is the whole theory you need, and it gives three rules the exam asks about.</p>
<p><strong>Heavy loads go low and amidships.</strong> Weight high up (people standing, luggage on the roof) or out on one side reduces stability; weight in the bow makes the boat bow-heavy and weight aft makes it stern-heavy (see the next section). Not "forward to keep the bow down", not "aft to lift the bow": low and in the middle.</p>
<p><strong>Do not overload.</strong> Every kilogram sinks the boat deeper, increasing the draught and reducing the <strong>freeboard</strong>. With little freeboard the first wave comes over the side, and a boat with water inside loses stability fast. The maximum load and maximum number of persons on the CE plate are limits, not targets, and the load limit already includes the outboard engine.</p>
<div class="callout warn"><p><strong>Free surface effect.</strong> Liquid that can slide across the boat, such as bilge water or a half-full tank, runs to the low side as soon as the boat heels and pushes it further over. Only 10–15 cm of water in the bottom of a small boat already weighs several hundred kilograms. Pump the bilge dry before you leave and keep the drain plug in.</p></div>
<p><strong>Stay seated.</strong> In a small open boat nobody should stand up or move about suddenly, especially at speed, in turns and in waves. The safest place at speed is seated low and aft of the bow. Nobody sits on the bow, the gunwale or the transom while the boat is moving.</p>`,
        illustration: () => illLoading(),
        caption: 'Left: weight low and centred, the boat sits level with good freeboard. Middle: weight high and to one side heels the boat. Right: loose water slides to the low side and makes it worse.',
        keyFacts: [
          'Heavy loads: low and amidships. High or one-sided weight reduces stability.',
          'Overloading increases draught and reduces freeboard; respect max load and max persons on the CE plate.',
          'Free surface effect: bilge water or a half-full tank slides to the low side; 10–15 cm of water can weigh hundreds of kg.',
          'Everyone seated and low at speed; never on the bow, gunwale or transom while underway.',
        ],
        check: { q: 'Where should heavy loads be placed in a small boat?', options: ['Forward, to keep the bow down', 'Aft, so the boat planes faster', 'Low and in the middle of the boat', 'Along one side, to balance the helmsman'], answer: 2, explanation: 'Weight low and centred gives the greatest stability and keeps the trim level. Weight forward makes the boat bow-heavy, weight aft makes it stern-heavy, and weight on one side heels it (F16, F18).' },
      },
      /* ---------------- 4 ---------------- */
      {
        id: 'trim',
        title: 'Trim, engine size and how the boat runs',
        html: `
<p><strong>Trim</strong> is the fore-and-aft attitude of the boat: the difference between the draught forward and the draught aft. You change it with where you place people and gear, with the angle of the outboard or sterndrive, and with trim tabs. Wrong trim is not only uncomfortable, it is dangerous at speed.</p>
<ul>
<li><strong>Bow-heavy</strong> (bow down): the boat ploughs, throws spray, and at speed the bow can grip the water and make the boat <strong>veer suddenly</strong>. Move weight aft, or trim the drive out a little.</li>
<li><strong>Stern-heavy</strong> (bow up): the boat struggles to get on the plane, you cannot see over the bow, and at planing speed it starts <strong>porpoising</strong>, a rhythmic bow-up, bow-down bouncing. Cure: trim the drive in (bow down), a little tab down, or move weight forward.</li>
</ul>
<p><strong>Trim tabs</strong> are plates on the transom. Lowering both pushes the bow down, which helps the boat on to the plane and softens a head sea. Lowering one tab lifts that side of the stern and lowers the opposite bow, so you use a single tab to correct a list caused by wind or by people sitting on one side.</p>
<p><strong>Chine walk</strong> is a side-to-side rocking of a fast planing hull that is over-trimmed and running on a narrow strip of keel. Trim down slightly, reduce speed and steer with small corrections.</p>
<div class="callout rule"><p><strong>An appropriately sized engine.</strong> The curriculum asks you to know why engine power must match the boat. Too large an engine puts extra weight on the transom (stern-heavy trim, less freeboard aft), drives the hull faster than it was designed for and makes the boat hard to control; too small an engine cannot bring you home against wind and sea. Follow the maximum engine power given in the owner's manual.</p></div>
<p>Remember also that the licence itself has engine-size thresholds: a licence is required for a boat longer than 8 m or with more than 25 hp (19 kW), and a driver must be at least 16 to operate more than 10 hp (7.5 kW).</p>`,
        illustration: () => illTrim(),
        caption: 'Level trim runs flat and steers true. A bow-heavy boat digs in and may veer; a stern-heavy boat planes badly and porpoises.',
        keyFacts: [
          'Trim = difference between draught forward and aft.',
          'Bow-heavy: may veer suddenly at speed. Stern-heavy: hard to plane, porpoising.',
          'Porpoising cure: trim drive in (bow down), tab down, or weight forward.',
          'Both trim tabs down = bow down; one tab down lifts that side of the stern and lowers the opposite bow.',
          'Engine power must match the boat: follow the owner\'s manual maximum.',
        ],
        check: { q: 'At planing speed your boat bounces rhythmically bow-up, bow-down. What is this and what is the cure?', options: ['Chine walk; steer hard from side to side', 'Porpoising; trim the drive in (bow down) or move weight forward', 'Broaching; increase speed', 'Prop walk; engage astern briefly'], answer: 1, explanation: 'Porpoising comes from too much bow-up trim or too much weight aft. Trim the engine or drive in, lower the tabs a little, or move weight forward (F67).' },
      },
      /* ---------------- 5 ---------------- */
      {
        id: 'handling',
        title: 'Steering, pivot point and propeller walk',
        html: `
<p>A boat does not steer like a car. The steering force, whether a rudder or a swivelling outboard or sterndrive, acts at the <strong>stern</strong>: it pushes the stern sideways and the boat pivots about a point roughly <strong>one third of the length aft of the bow</strong> when going ahead (and about one third forward of the stern when going astern). Two practical consequences follow. First, in a turn the <strong>stern swings outward</strong>, so turning the bow away from an obstacle can swing the stern into it. Second, when you leave a berth you must first move the stern away from the quay; steering away with the bow only grinds the stern along it.</p>
<p>An <strong>outboard or sterndrive</strong> steers by pointing its thrust, so it steers in reverse too and even at zero speed with a burst of throttle. A boat with a fixed propeller and a <strong>rudder</strong> needs water flowing past the rudder to steer: no speed and no prop wash means no steering, and steering in astern is poor.</p>
<p><strong>Propeller walk</strong> (the paddle-wheel effect) is the exam favourite. A right-handed propeller turns clockwise, seen from astern, when driving ahead. Going ahead the stern walks slightly to starboard, a small effect you correct without noticing. In <strong>astern</strong> the propeller turns the other way and the effect is strong: the <strong>stern kicks to port</strong> and the bow swings to starboard, and at low speed the rudder cannot stop it.</p>
<div class="callout tip"><p><strong>"Right-handed, reverse, PORT."</strong> Use it instead of fighting it: a single right-handed-prop boat berths most easily <strong>port side to</strong>, because a burst of astern pulls the stern in towards the quay, and it turns most tightly <strong>clockwise</strong> (to starboard) in a confined space.</p></div>
<p>Scenario: you are lying starboard side to a pontoon and engage astern. The stern kicks to port, away from the pontoon: good. Lying port side to, the stern would kick into the pontoon, so push the stern off first or spring off before going astern.</p>`,
        illustration: () => illPropWalk(),
        caption: 'Right-handed propeller. Ahead: stern walks slightly to starboard. Astern: stern kicks strongly to PORT, bow to starboard. Berth port side to; pivot clockwise.',
        keyFacts: [
          'A boat steers from the stern and pivots about a point about 1/3 of the length aft of the bow (ahead).',
          'The stern swings outward in a turn: move the stern clear of the quay first when leaving.',
          'Right-handed prop in astern: stern to PORT, bow to starboard; strong, rudder cannot correct it.',
          'Berth port side to and pivot clockwise with a single right-handed propeller.',
          'Outboard/sterndrive steers in reverse and at zero speed; a rudder needs water flow.',
        ],
        check: { q: 'Your boat has a single right-handed propeller. You engage astern from rest. Which way does the stern move?', options: ['To starboard', 'Straight back, no sideways movement', 'To port', 'It depends only on the rudder angle'], answer: 2, explanation: 'Propeller walk in astern with a right-handed prop kicks the stern to port and swings the bow to starboard. At low speed the rudder has too little water flow to correct it (F22).' },
      },
      /* ---------------- 6 ---------------- */
      {
        id: 'berthing',
        title: 'Coming alongside and leaving a berth',
        html: `
<p>Berthing is a controlled collision with the quay at walking pace, and the rule is to arrive <strong>slowly and under control</strong>. Approach heading <strong>into the stronger of wind or current</strong>, so that nature brakes you and your rudder keeps working. Use dead-slow speed, in gear with short bursts rather than coasting in neutral, and have fenders out and bow and stern lines ready before you are close. Never approach faster than you are willing to hit the quay.</p>
<p><strong>Wind blowing off the quay</strong> is the harder case, because the bow is blown away as soon as you slow down. Approach at a steeper angle, about 30–45° to the quay, get the <strong>bow line ashore first</strong>, then put the helm towards the quay and give a touch of ahead: the stern swings in and you make the stern line fast.</p>
<p><strong>Wind blowing onto the quay</strong> is easy: approach nearly parallel, stop about one boat-width off and let the wind set you down onto the fenders. The upwind side of a pontoon is easiest to come alongside but pins you there; the downwind side is harder to reach but easy to leave.</p>
<div class="callout rule"><p><strong>Leaving.</strong> Remove every line except the one you still need, and make sure no line can reach the propeller before you engage gear. Swing the <strong>stern clear first</strong>: push the bow in and the stern out, then reverse out, or "spring off" with a bow line and gentle ahead with the helm towards the quay so the stern swings out.</p></div>
<p>Picking up a <strong>mooring buoy</strong>: approach slowly into wind or current, pick it up from the bow, and make fast to the ring or shackle under the buoy, not to a small lifting eye on top. And remember the Norwegian rule of the road for anchoring and mooring (Rule 45): never anchor or moor so that you obstruct passage without compelling necessity.</p>`,
        illustration: () => illBerthing(),
        caption: 'Wind off the quay: steep approach, bow line first, then swing the stern in. Wind onto the quay: nearly parallel, stop short, let the wind finish the job.',
        keyFacts: [
          'Approach into the stronger of wind or current, dead slow, in gear with short bursts, fenders and lines ready.',
          'Wind OFF the quay: steeper angle (30–45°), bow line ashore first, then drive the stern in.',
          'Wind ONTO the quay: nearly parallel, stop one boat-width off, let the wind set you alongside.',
          'Leaving: no line near the prop, swing the stern clear first (push off or spring off).',
          'Mooring buoy: approach into wind/current, from the bow, make fast to the ring under the buoy.',
        ],
        check: { q: 'You are coming alongside a quay with the wind blowing OFF the quay. What is the recommended approach?', options: ['Parallel and fast, so the wind has no time to act', 'Parallel, stop one boat-width off and wait for the wind', 'At a steep angle (about 30–45°), bow line ashore first, then swing the stern in', 'Stern first, with the engine in astern'], answer: 2, explanation: 'With wind off the quay the bow is blown away as you slow down. A steeper angle gets the bow to the quay first; once the bow line is on, helm towards the quay and a touch of ahead brings the stern in (F28).' },
      },
