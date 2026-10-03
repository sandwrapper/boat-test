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
    s += `<line x1="${left}" y1="${tr - 3}" x2="140" y2="336" stroke="${MUTED}" stroke-width="1"/>` + label(136, 336, 'TRANSOM', 11, { anchor: 'end', weight: 700 }) + label(136, 350, '(flat stern plate)', 10, { anchor: 'end', fill: MUTED });
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
      s += arrow(cx + 60, cy - 30, cx + 100, cy - 30, { width: 1.5, head: 7, color: MUTED }) + label(cx + 80, cy - 42, 'direction', 9, { fill: MUTED });
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
    for (let k = 0; k < 3; k++) s += `<ellipse cx="${cx}" cy="${cy - 9}" rx="4" ry="9" fill="${INK}" transform="rotate(${k * 120} ${cx} ${cy})"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="3" fill="#888"/>`;
    const r = 17, a0 = dir > 0 ? 200 : 160, a1 = dir > 0 ? 340 : 20;
    const p = a => [cx + r * Math.sin(S.deg(a)), cy - r * Math.cos(S.deg(a))];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    s += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 ${dir > 0 ? 1 : 0} ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${C.blue}" stroke-width="2"/>`;
    const tangent = dir > 0 ? S.deg(a1) : S.deg(a1) + Math.PI;
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
        s += lines(cx + B / 2 + 8, cy + 92, ['stern walks slightly', 'to starboard (small)'], 10, { fill: MUTED, anchor: 'start' }, 12);
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
      if (offQuay) {
        // wind arrows pointing away from the quay (up), on the right of the panel
        for (let i = 0; i < 3; i++) { const wx = x0 + 240 + i * 28; s += arrow(wx, 226, wx, 176, { color: '#3b82c4', width: 2, head: 8 }); }
        s += label(x0 + 268, 164, 'WIND', 11, { fill: '#3b82c4', weight: 700 });
        // boat heading down-left at 40 degrees to the quay; bow touching the quay at (bx, by)
        const rot = 220, bx = x0 + 120, by = 232, L = 130, B = 46;
        const bd = [-Math.sin(S.deg(40)), Math.cos(S.deg(40))];          // unit vector bow direction (down-left)
        const pd = [Math.cos(S.deg(40)), Math.sin(S.deg(40))];           // unit vector towards the quay-facing (port) side
        const cx = bx - bd[0] * L / 2, cy = by - bd[1] * L / 2;
        s += boatTop(cx, cy, L, B, { rot: rot, console: true });
        [-32, 0, 32].forEach(t => { const fx = cx + bd[0] * t + pd[0] * (B / 2 + 3), fy = cy + bd[1] * t + pd[1] * (B / 2 + 3); s += `<ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="4" ry="7" fill="${C.orange}" transform="rotate(40 ${fx.toFixed(1)} ${fy.toFixed(1)})"/>`; });
        // angle between hull centreline and quay edge, drawn at the bow
        s += `<line x1="${bx}" y1="${by}" x2="${bx + 90}" y2="${by}" stroke="${C.red}" stroke-width="1" stroke-dasharray="3 3"/>`;
        s += `<line x1="${bx}" y1="${by}" x2="${(bx - bd[0] * 80).toFixed(1)}" y2="${(by - bd[1] * 80).toFixed(1)}" stroke="${C.red}" stroke-width="1" stroke-dasharray="3 3"/>`;
        s += `<path d="M${bx + 48},${by} A48,48 0 0 0 ${(bx + 48 * Math.cos(S.deg(40))).toFixed(1)},${(by - 48 * Math.sin(S.deg(40))).toFixed(1)}" fill="none" stroke="${C.red}" stroke-width="1.5"/>`;
        s += label(bx + 62, by - 14, '30–45°', 11, { fill: C.red, weight: 700, anchor: 'start' });
        // bow line to the quay
        s += `<line x1="${bx}" y1="${by - 2}" x2="${x0 + 48}" y2="240" stroke="${C.orange}" stroke-width="2.5"/>`;
        s += badge(x0 + 28, 48, '1') + label(x0 + 44, 48, 'dead slow, short bursts in gear', 10, { anchor: 'start' });
        s += badge(x0 + 28, 68, '2') + label(x0 + 44, 68, 'bow line ashore FIRST', 10, { anchor: 'start' });
        s += badge(x0 + 28, 88, '3') + label(x0 + 44, 88, 'helm toward quay, touch of ahead:', 10, { anchor: 'start' }) + label(x0 + 60, 101, 'the stern swings in', 10, { anchor: 'start' });
        s += badge(x0 + 28, 121, '4') + label(x0 + 44, 121, 'stern line', 10, { anchor: 'start' });
        s += label(x0 + 160, 290, 'Steep angle so the bow reaches the quay before the wind blows it off.', 10, { fill: MUTED });
      } else {
        // wind arrows pointing towards the quay (down), top-right corner
        for (let i = 0; i < 3; i++) { const wx = x0 + 240 + i * 28; s += arrow(wx, 50, wx, 100, { color: '#3b82c4', width: 2, head: 8 }); }
        s += label(x0 + 268, 40, 'WIND', 11, { fill: '#3b82c4', weight: 700 });
        // boat nearly parallel, bow pointing left and slightly towards the quay (12 degrees)
        const rot = 282, cx = x0 + 150, cy = 158, L = 130, B = 46;
        const bd = [Math.sin(S.deg(rot)), -Math.cos(S.deg(rot))];
        const pd = [-Math.cos(S.deg(rot)), -Math.sin(S.deg(rot))];        // port side faces the quay
        s += boatTop(cx, cy, L, B, { rot: rot, console: true });
        [-40, 0, 40].forEach(t => { const fx = cx + bd[0] * t + pd[0] * (B / 2 + 3), fy = cy + bd[1] * t + pd[1] * (B / 2 + 3); s += `<ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="4" ry="7" fill="${C.orange}" transform="rotate(${rot} ${fx.toFixed(1)} ${fy.toFixed(1)})"/>`; });
        for (let i = 0; i < 3; i++) { const wx = cx - 50 + i * 50; s += arrow(wx, cy + 36, wx, cy + 56, { color: '#3b82c4', width: 1.5, head: 7, dash: '4 3' }); }
        s += label(cx, 118, 'stop about one boat-width off, nearly parallel (10–15°)', 10, {});
        s += label(cx, cy + 66, 'the wind sets you gently onto the fenders', 10, { fill: '#3b82c4' });
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
    return S.svg(640, 290, s, { label: 'Mooring lines alongside a quay' });
  }

  /* ---------- ILL-4 anchor scope (F37–F41) ---------- */
  function anchorIcon(x, y, tilt, scale, col) {
    scale = scale || 1; col = col || HULL_STROKE;
    return `<g transform="translate(${x} ${y}) rotate(${tilt || 0}) scale(${scale})"><path d="M0,0 L28,-12 M0,0 L6,6 L22,8 L8,-4 Z" fill="${col}" stroke="${col}" stroke-width="3" stroke-linejoin="round"/></g>`;
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
    s += label(210, 150, 'RODE LENGTH ~ 5 x D', 13, { weight: 800, fill: C.orange });
    s += label(210, 168, '(3 x for all-chain in calm weather;', 10, { fill: INK }) + label(210, 181, '7–10 x in strong wind or poor holding)', 10, { fill: INK });
    // depth arrow
    s += arrow(392, surf + 2, 392, bed - 2, { both: true, width: 1.5, head: 8 });
    s += lines(400, 196, ['DEPTH D', 'from bow roller to seabed', '(charted depth + freeboard', '+ rise of tide)'], 10, { anchor: 'start', weight: 600 }, 13);
    // wrong inset
    s += box(16, 10, 220, 94, { fill: 'var(--paper-2)' });
    s += `<line x1="24" y1="44" x2="228" y2="44" stroke="${WATER}" stroke-width="2"/><line x1="24" y1="96" x2="228" y2="96" stroke="${SEABED}" stroke-width="4"/>`;
    s += `<path d="M170,44 L176,34 L214,34 L220,44 Z" fill="${HULL}" stroke="${HULL_STROKE}"/>`;
    s += `<line x1="176" y1="44" x2="128" y2="92" stroke="${C.orange}" stroke-width="2.5"/>`;
    s += anchorIcon(112, 92, -40, 0.7, INK);
    s += `<path d="M138,78 L152,92 M152,78 L138,92" stroke="${C.red}" stroke-width="3"/>`;
    s += lines(30, 54, ['WRONG: scope too short,', 'steep pull lifts the anchor', 'and it drags'], 9, { anchor: 'start', fill: C.red, weight: 700 }, 11);
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
      s += badge(x0 + 24, 40, n);
      s += label(x0 + 106, 190, sub, 10, { fill: MUTED });
    });
    s += label(320, 16, 'Same depth, rope-and-chain rode, light wind. Which boat has paid out a correct scope?', 11, { weight: 700 });
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
    s += lines(cx + 36, 184, ['bridle between', 'both stern cleats', '(centres the pull)'], 10, { anchor: 'start' }, 12);
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
    s += `<path d="${boatPath(500, 120, 120, 44)}" fill="#1f2d3d" stroke="#56708a" stroke-width="1.5"/>`;
    s += lamp(500, 98, C.white, 5) + lamp(500, 118, C.white, 5);
    s += label(524, 100, '2 masthead lights', 9, { fill: '#e8eef5', anchor: 'start' }) + label(524, 112, 'in a vertical line', 9, { fill: '#e8eef5', anchor: 'start' });
    s += lamp(481, 130, C.red, 4) + lamp(519, 130, C.green, 4);
    s += lamp(500, 162, C.yellow, 5) + lamp(500, 178, C.white, 5);
    s += label(524, 162, 'YELLOW towing light', 9, { fill: C.yellow, anchor: 'start', weight: 700 }) + label(524, 178, 'above the sternlight', 9, { fill: '#e8eef5', anchor: 'start' });
    s += `<line x1="500" y1="186" x2="500" y2="300" stroke="#9aa9b8" stroke-width="2"/>`;
    s += `<path d="${boatPath(500, 350, 100, 40)}" fill="#1f2d3d" stroke="#56708a" stroke-width="1.5"/>`;
    s += lamp(482, 352, C.red, 4) + lamp(518, 352, C.green, 4) + lamp(500, 398, C.white, 5);
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
    s += boatTop(110, 80, 70, 26, { rot: 95, console: false });
    s += `<path d="M78,72 l-30,-16 M78,88 l-30,16" stroke="${WATER}" stroke-width="2"/>`;
    s += label(110, 112, 'keep speed and wash down', 10, { fill: MUTED }) + label(110, 125, 'near the shore', 10, { fill: MUTED });
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
    // both boats travel to the RIGHT (bow right): the real boat is AHEAD of the position on the screen
    s += arrow(80, 372, 120, 372, { width: 1.5, head: 7, color: MUTED }) + label(100, 388, 'direction of travel', 9, { fill: MUTED });
    s += boatTop(300, 372, 56, 22, { rot: 90, console: false, motor: false }) + label(300, 396, 'position shown on the screen', 9.5, { fill: MUTED });
    s += boatTop(470, 372, 56, 22, { rot: 90, console: true, motor: false, fill: '#f6c9a8' }) + label(470, 396, 'where you really are (ahead)', 9.5, { fill: C.red, weight: 700 });
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
      /* ---------------- 7 ---------------- */
      {
        id: 'mooring-knots',
        title: 'Mooring lines, fenders and the knots you need',
        html: `
<p>A boat alongside a quay moves fore and aft, away from the quay, and up and down with tide and waves. Each movement has a line that stops it, and the exam asks you to name them.</p>
<ul>
<li>The <strong>bow line</strong> runs from the bow forward to the quay and stops the boat moving astern. The <strong>stern line</strong> runs from the stern aft and stops movement ahead.</li>
<li><strong>Springs</strong> run diagonally: the fore spring from the bow cleat aft, the aft spring from the stern cleat forward. They cross and stop the boat <strong>surging fore and aft</strong>. Bow line, stern line and two springs is the standard set.</li>
<li><strong>Breast lines</strong> run at right angles to the quay and stop sideways movement; optional, and slack where the water level changes.</li>
</ul>
<p>Where tide or waves move the boat, use <strong>long lines and leave slack</strong>, or a falling tide leaves the boat hanging and a rising one tears out the cleats.</p>
<div class="table-wrap"><table><thead><tr><th>Knot</th><th>Use</th><th>Why</th></tr></thead><tbody>
<tr><td><strong>Bowline</strong></td><td>Fixed loop over a bollard or through a ring</td><td>Does not slip, easy to untie after load; cannot be tied or untied under load</td></tr>
<tr><td><strong>Round turn and two half hitches</strong></td><td>Line to a ring, post or rail</td><td>The round turn takes the strain: can be tied and released under load</td></tr>
<tr><td><strong>Cleat hitch</strong></td><td>Line on a cleat</td><td>One full turn round the base, one or two figure-eights, one locking hitch</td></tr>
<tr><td><strong>Clove hitch</strong></td><td>Hanging fenders, temporary</td><td>Quick but can slip; back it up with a half hitch</td></tr>
<tr><td><strong>Sheet bend</strong></td><td>Joining two ropes, also of different thickness</td><td>Thicker rope forms the bight; tails on the same side</td></tr>
<tr><td><strong>Figure-eight</strong></td><td>Stopper in the end of a line</td><td>Will not jam</td></tr>
</tbody></table></div>
<div class="callout warn"><p>The <strong>reef (square) knot</strong> is a binding knot for sail covers. Never use it to join two ropes under load: it capsizes and slips. Use a sheet bend or two bowlines.</p></div>
<p>Rope: <strong>nylon</strong> stretches and absorbs shocks (anchor rode, mooring lines); <strong>polyester</strong> has little stretch and resists sun and chafe (sheets, halyards); <strong>polypropylene</strong> floats but is weak and degrades in sunlight (ski lines, heaving lines, never an anchor rode).</p>`,
        illustration: () => illMooringLines(),
        caption: 'Bow line and stern line hold the boat in place; the crossed springs stop fore-and-aft surging; a breast line (dashed) is optional.',
        keyFacts: [
          'Bow line stops movement astern; stern line stops movement ahead; springs stop surging; breast lines stop sideways movement.',
          'Standard set: bow line + stern line + fore spring + aft spring. Slack and long lines where the tide or waves move the boat.',
          'Bowline = fixed loop (not under load); round turn and two half hitches = can be tied under load; sheet bend joins ropes of unequal size.',
          'Reef knot is a binding knot only; it slips when joining loaded ropes.',
          'Nylon stretches (anchor rode); polyester low stretch; polypropylene floats and weakens in sunlight.',
        ],
        check: { q: 'Which mooring line stops the boat surging forward and aft along the quay?', options: ['The bow line', 'A spring', 'The breast line', 'The painter'], answer: 1, explanation: 'Springs run diagonally along the boat (fore spring from the bow aft, aft spring from the stern forward) and stop fore-and-aft movement. Breast lines stop sideways movement; a painter is a dinghy\'s bow line (F30).' },
      },
      /* ---------------- 8 ---------------- */
      {
        id: 'anchoring',
        title: 'Anchoring',
        html: `
<p>An anchor holds because the pull on it is nearly horizontal and it digs in; make the pull steep and it lifts out. Everything about anchoring follows from that.</p>
<p><strong>Choose the spot.</strong> Shelter from wind and waves (never under a lee shore), enough depth for the whole stay allowing for the tide, swinging room clear of other boats, and a <strong>good holding bottom</strong>: sand, clay and mud hold well; rock, weed and gravel hold poorly. The chart shows the bottom type (S sand, M mud, G gravel). Keep out of fairways, cable areas, bathing areas and fish farms; Rule 45 forbids anchoring so that you obstruct passage.</p>
<p><strong>Anchor types.</strong> A fluke (Danforth) anchor is excellent in sand and mud but poor in gravel and weed. The small <strong>grapnel</strong> common on Norwegian boats sets quickly in rock but holds poorly in sand, clay and mud.</p>
<div class="callout rule"><p><strong>Scope.</strong> Pay out rode of at least <strong>about 5 times the depth</strong>, measured from the bow roller to the seabed including freeboard and the rise of tide, and <strong>more (7–10 times) in strong wind</strong> or poor holding. All-chain in calm weather can manage 3 times. Fit <strong>5–8 m of chain</strong> next to the anchor: its weight keeps the pull horizontal, its sag absorbs shocks and it resists chafe.</p></div>
<p><strong>Setting.</strong> Head into the wind or current, stop over the spot and <strong>lower</strong> the anchor; never throw it. Pay out rode as the boat drifts back so it lies straight, then apply gentle astern until the anchor digs in and the rode goes taut. Check for dragging with a transit on two shore objects or a GPS anchor alarm. Example: 4 m of water plus 1 m of freeboard and tide gives D = 5 m, so pay out at least 25 m, 35–50 m if strong wind is forecast.</p>
<p><strong>Signals (Rule 30).</strong> At anchor a vessel under 50 m shows one all-round white light at night and one black ball by day. A vessel under 7 m anchored away from fairways, narrow channels and anchorages need not show them.</p>`,
        illustration: () => illAnchorScope(),
        caption: 'Rode about 5 times the depth measured from the bow roller, with chain nearest the anchor so the pull stays nearly horizontal. Check a transit ashore for dragging.',
        keyFacts: [
          'Good holding: sand, clay, mud. Poor: rock, weed, gravel. Never anchor under a lee shore or in a fairway.',
          'Scope: about 5 x depth (bow roller to seabed, incl. tide); 7–10 x in strong wind; 3 x only for all-chain in calm weather.',
          '5–8 m of chain next to the anchor keeps the pull horizontal and absorbs shocks.',
          'Lower the anchor (never throw), drift back, snub gently astern, check a transit.',
          'At anchor under 50 m: one all-round white light at night, one black ball by day; under 7 m away from fairways: not required.',
        ],
        check: { q: 'You anchor overnight with rope-and-chain in 4 m of water; the bow roller is 1 m above the surface. Roughly how much rode should you pay out in good weather?', options: ['About 5 m', 'About 10 m', 'About 25 m', 'About 100 m'], answer: 2, explanation: 'Depth from the bow roller to the seabed is 4 + 1 = 5 m. At least 5 times that is 25 m; pay out more (35–50 m) if strong wind is expected (F37, S2).' },
      },
      /* ---------------- 9 ---------------- */
      {
        id: 'towing',
        title: 'Assistance and towing',
        html: `
<p>Seafarers help each other. Norwegian maritime law obliges a master after a collision to render all possible help to the other vessel and its people, as far as it can be done <strong>without serious danger to your own boat, crew and passengers</strong>; courses teach the same principle for all assistance. If you cannot help safely, call the coast radio station (telephone 120) or VHF channel 16 so that the rescue service can.</p>
<p><strong>Agree the plan first.</strong> Who is in command, which VHF channel or hand signals you use, where you are going, how fast, and how either boat aborts.</p>
<p><strong>Rig it properly.</strong> On the towed boat, attach the line to the bow eye or a through-bolted bow cleat. On the towing boat, use a <strong>bridle</strong> between the two stern cleats so the pull is centred and you can still steer. Make the towline <strong>long</strong> in open water, about 4–5 boat lengths or more, adjusted so that <strong>both boats ride the wave crests at the same time</strong>; a long nylon line is a shock absorber. Shorten to about half in confined waters.</p>
<div class="callout warn"><p>Keep everyone seated and <strong>well clear of the towline</strong> on both boats: a stretched nylon line that parts snaps back like a projectile. Never go <strong>astern with the line in the water</strong>, and never reduce power suddenly, or the tow overruns you.</p></div>
<p><strong>Towing.</strong> Take up the slack dead slow by bumping in and out of gear, then increase gradually to about <strong>3–5 knots</strong>, never planing speed, with wide turns. On the towed boat a helmsman steers to follow the tug, with the outboard raised. In harbour shorten the tow or tow <strong>alongside</strong> with fenders; enter bow into wind or current.</p>
<p><strong>Lights (Rule 24).</strong> The towing vessel shows two masthead lights in a vertical line (three if the tow exceeds 200 m), sidelights, a sternlight and a <strong>yellow towing light above the sternlight</strong>; by day a diamond if the tow exceeds 200 m. The towed vessel shows only sidelights and a sternlight.</p>`,
        illustration: () => illTowing(),
        caption: 'Bridle between the stern cleats, a long sagging towline to the bow eye, and a snap-back zone nobody enters. Night: towing vessel two masthead lights and yellow over white at the stern; towed vessel sidelights and sternlight.',
        keyFacts: [
          'Help others, but never endanger your own boat and crew; otherwise alert coast radio 120 / VHF 16.',
          'Agree command, signals, destination, speed and how to abort before towing.',
          'Bridle between the tug\'s stern cleats; towline to the bow eye; long line so both boats ride crests together; halve it in harbour.',
          'Tow slowly (3–5 knots), wide turns, everyone seated and clear of the line, never astern with the line out.',
          'Rule 24: towing vessel 2 masthead lights (3 if tow > 200 m) + yellow towing light over sternlight; towed vessel sidelights + sternlight.',
        ],
        check: { q: 'What is the recommended speed when towing a disabled boat in open water?', options: ['Planing speed, to finish quickly', 'Slow, about 3–5 knots, taking up the slack gently first', 'Exactly 10 knots', 'Full speed as long as the line is long'], answer: 1, explanation: 'Take up the slack dead slow, then tow at a slow steady speed of about 3–5 knots with wide turns. A towed boat is never towed on the plane (F55).' },
      },
      /* ---------------- 10 ---------------- */
      {
        id: 'waves-wash',
        title: 'Waves, wash and running aground',
        html: `
<p>The CE category tells you what sea the boat was built for; seamanship is how you drive in it. <strong>Head seas</strong> give the best control: slow down, ease the throttle as you go down each wave so the bow does not bury, and take steep waves at a slight angle (about 30–45° off the bow) rather than dead on. <strong>Beam seas</strong> roll the boat most; if they are short and steep, zigzag with the sea first broad on the bow, then on the quarter.</p>
<div class="callout warn"><p><strong>Following and quartering seas</strong> hold the greatest danger: <strong>broaching</strong>. An overtaking wave lifts the stern, the rudder loses grip, the boat slews beam-on and may capsize. Do not run at the same speed as the waves and do not surf down a face: add power on the back of the wave, ease it on the crest, and keep the stern square to the sea. Keep weight low and centred.</p></div>
<p>A planing boat that leaves the water and slams can injure people (high-energy injuries) and damage the hull: <strong>reduce speed in waves</strong>.</p>
<p><strong>Your wash is your responsibility.</strong> It can swamp small boats, damage moored boats and hurt people on pontoons. Rule 6 requires a safe speed at all times, Norwegian Rule 43 requires small vessels approaching others to reduce speed and if necessary stop, and the sea-sense rules tell you to show consideration. Many harbours and shore areas have local speed limits (typically 5, 8, 10 or 30 knots).</p>
<p><strong>Running aground.</strong> Throttle to neutral and stop the engine; check people for injuries; check the bilge and hull for leaks. If there is <strong>no leak</strong>: raise the outboard or drive, shift weight away from the grounded part, push off with a boathook and try <strong>gentle astern only</strong>. Never rev hard in reverse: sand and weed are sucked into the cooling intake and the propeller is damaged. Otherwise kedge off with the anchor or wait for a rising tide. If there <strong>is a leak</strong>, stay put and call VHF 16 or coast radio 120.</p>`,
        keyFacts: [
          'Head seas: slow down, ease the throttle down each wave, take steep waves at 30–45° off the bow.',
          'Following sea: danger is broaching; do not match wave speed, power on the back of the wave, stern square to the sea.',
          'Your wash is your responsibility (Rule 6 safe speed, Norwegian Rule 43, show consideration).',
          'Aground, no leak: neutral, check crew and bilge, lift the drive, shift weight, gentle astern only; never full throttle astern.',
          'Aground with a leak: stay put, call VHF 16 / coast radio 120.',
        ],
        check: { q: 'You run aground on sand and find no leak. What is the correct action?', options: ['Full throttle astern immediately', 'Lift the drive, shift weight away from the grounding point, push off and try gentle astern', 'Open the drain plug to lighten the boat', 'Everyone jumps overboard to push'], answer: 1, explanation: 'First neutral and a check for injuries and leaks. With no leak, raise the drive, move weight to the deep-water end, push off and use gentle astern only; hard reverse sucks sand into the cooling intake and damages the propeller (F70, F71).' },
      },
      /* ---------------- 11 ---------------- */
      {
        id: 'water-sports',
        title: 'Swimmers, water sports and consideration for others',
        html: `
<p>Summer waters are shared with people who have no hull around them. The regulation on reduced speed when passing bathers is on the curriculum: <strong>within 50 m of swimmers or bathing places you must not exceed 5 knots</strong>. Not 3, not 10: five knots, fifty metres. Keep your wash down as well; a wave that is fun for you can knock a child off a jetty.</p>
<p><strong>Towing a water-skier, wakeboarder or tube</strong> is towing a person, and the Norwegian Maritime Authority confirms that people on towed water-sports equipment are covered by the duty to wear suitable flotation. Good practice on the towing boat: a second person acts as <strong>observer</strong> watching the skier so that the driver can keep a proper lookout ahead (Rule 5) and maintain a safe speed (Rule 6); use a <strong>floating line</strong> (polypropylene) so it stays visible and away from the propeller; and when the skier is in the water near the boat put the engine in <strong>neutral</strong>, exactly as for a person overboard. Never reverse towards a person in the water, and shut the engine off before anyone climbs the bathing ladder at the stern.</p>
<div class="callout rule"><p><strong>Flotation.</strong> Every recreational boat must carry suitable flotation for everyone on board. In boats shorter than 8 m everyone must <strong>wear</strong> it outdoors while the boat is underway, and the operator must ensure that persons under 15 wear it. The operator and owner are responsible for having the equipment on board; each person is responsible for using it.</p></div>
<p><strong>Good seamanship</strong> is also a curriculum item, summed up by the seven sea-sense rules of the Norwegian Society for Sea Rescue: think safety; bring the necessary equipment; respect weather and waters; follow the collision regulations; wear a life jacket or flotation garment; be rested and sober; show consideration. Rule 44 of the Norwegian rules asks pleasure craft to keep out of the way of larger vessels, scheduled ferries and commercial traffic as far as possible, and the alcohol limit for operating a boat under 15 m is 0.8 per mille.</p>`,
        illustration: () => illBathers(),
        caption: 'Max 5 knots within 50 m of bathers. Towing a skier: observer on board, floating line, flotation worn, engine in neutral when the skier is near the boat.',
        keyFacts: [
          'Within 50 m of swimmers or bathing places: max 5 knots.',
          'People on towed water-sports equipment (skis, tubes, wakeboards) must wear flotation.',
          'Observer watches the skier; floating line; engine in NEUTRAL when a person is in the water near the boat; never reverse towards a person.',
          'Flotation carried for everyone in every boat; WORN by everyone outdoors underway in boats under 8 m; operator ensures under-15s wear it.',
          'Seven sea-sense rules; Rule 44: keep clear of larger vessels and ferries; alcohol limit 0.8 per mille.',
        ],
        check: { q: 'How fast may you pass within 50 m of swimmers?', options: ['3 knots', '5 knots', '8 knots', '10 knots'], answer: 1, explanation: 'The regulation on reduced speed when passing bathers sets a maximum of 5 knots within 50 m of swimmers and bathing places (F9).' },
      },
      /* ---------------- 12 ---------------- */
      {
        id: 'high-speed',
        title: 'Dangers of high speed (part 4, item 1.4.7)',
        html: `
<p>This section is <strong>part 4, "particularly important topics"</strong>. The curriculum lists four dangers of high speed, and the exam asks about each: narrowed vision, delay in electronic equipment, proper distance from shore, and risk and consequences.</p>
<ol>
<li><strong>Tunnel vision.</strong> At speed your eyes lock on to a narrow cone straight ahead and your peripheral vision shrinks. You stop seeing the rock to one side, the swimmer, the small boat on your quarter. The faster you go, the narrower the tunnel.</li>
<li><strong>Lag in electronic aids.</strong> A GPS or chart plotter updates with a delay, so at high speed the position on the screen is <strong>behind</strong> where the boat really is. At 30 knots you cover about 15 m every second; a few seconds of delay puts the screen boat tens of metres astern of you. Navigate by eye and chart, and use the plotter as a check, not as a windscreen.</li>
<li><strong>Little time to react.</strong> Distance to a hazard shrinks fast, and a turn or a stop needs room. Keep a <strong>proper distance from shore</strong>, rocks and other boats so that you have time and space to act.</li>
<li><strong>Consequences.</strong> A collision or grounding at speed throws people against the boat or out of it: high-energy injuries. Rule 6 demands a safe speed at all times, Norwegian Rule 43 demands reduced speed and caution when approaching other vessels, and the shore has speed limits.</li>
</ol>
<div class="callout rule"><p><strong>Before you open the throttle:</strong> everyone seated low and holding on, flotation worn, the <strong>kill cord</strong> clipped around your leg (it stops the engine if you are thrown from the helm; test it every trip and carry a spare), the trim right, and a sea state within the boat's CE category.</p></div>
<p>Two legal notes: within 50 m of bathers the limit is 5 knots, and since 1 June 2023 the operator of a motorised craft or personal watercraft that can reach <strong>50 knots or more</strong> needs a separate high-speed certificate.</p>
<div class="callout tip"><p>Expect: "the field of vision ..." narrows (tunnel vision); "the position shown by the GPS ..." lags behind; "why keep distance from shore?" little time to react.</p></div>`,
        illustration: () => illHighSpeed(),
        caption: 'At speed the field of view narrows to a tunnel, and the position shown on the plotter lags behind where the boat really is.',
        keyFacts: [
          'Part-4 item 1.4.7. Four dangers: tunnel vision, lag in electronic aids, little time to react / distance from shore, severe consequences.',
          'Tunnel vision: peripheral vision shrinks as speed rises; you miss hazards to the side.',
          'GPS/plotter lag: the displayed position is behind the real position; do not steer by the screen at speed.',
          'Keep a proper distance from shore and other boats; Rule 6 safe speed, Norwegian Rule 43.',
          'Kill cord worn and tested, everyone seated, flotation on; craft capable of 50 knots or more need a high-speed certificate (since 1 June 2023).',
        ],
        check: { q: 'What happens to the skipper\'s field of vision at high speed?', options: ['It widens, because more of the horizon passes the eye', 'It narrows to a tunnel straight ahead, and hazards to the side are missed', 'It is unchanged; only hearing is affected', 'It improves because spray is thrown clear of the windscreen'], answer: 1, explanation: 'Tunnel vision is the first danger of high speed listed in the curriculum: the eyes lock on to a narrow cone ahead and peripheral vision shrinks, so rocks, swimmers and small boats to the side go unseen (F69).' },
      },
    ],
    flashcards: [
      { front: 'Port side: which side, which colour?', back: 'Left side facing forward; red sidelight.' },
      { front: 'Starboard side: which side, which colour?', back: 'Right side facing forward; green sidelight.' },
      { front: 'Draught vs freeboard?', back: 'Draught: waterline down to the lowest point of the keel. Freeboard: waterline up to the deck edge.' },
      { front: 'Lee shore?', back: 'A shore the wind blows ONTO. Dangerous: you are pushed towards it. Never anchor there.' },
      { front: 'What must the CE builder\'s plate show?', back: 'Manufacturer, max load incl. outboard (kg), max persons, design category A–D, CE symbol.' },
      { front: 'CE category A?', back: 'Ocean: wind above Beaufort 8, waves above 4 m. The most seaworthy.' },
      { front: 'CE category B?', back: 'Offshore: wind up to Beaufort 8, waves up to 4 m.' },
      { front: 'CE category C?', back: 'Inshore: wind up to Beaufort 6, waves up to 2 m.' },
      { front: 'CE category D?', back: 'Sheltered waters: wind up to Beaufort 4, waves up to 0.3 m. The most limited.' },
      { front: 'CE marking: which boats, since when?', back: 'New recreational craft with hull length 2.5–24 m, since 16 June 1998.' },
      { front: 'Displacement hull speed limit?', back: 'Set by waterline length: about 1.34 x square root of LWL in feet, in knots. More power does not help.' },
      { front: 'Where do heavy loads go?', back: 'Low and amidships. High or one-sided weight reduces stability.' },
      { front: 'Free surface effect?', back: 'Loose liquid (bilge water, half-full tank) slides to the low side as the boat heels and reduces stability.' },
      { front: 'Bow-heavy trim: danger?', back: 'The bow digs in and the boat may veer suddenly at speed.' },
      { front: 'Porpoising: cause and cure?', back: 'Too much bow-up trim or weight aft. Trim the drive in (bow down), tab down, or move weight forward.' },
      { front: 'Lowering ONE trim tab does what?', back: 'Lifts that side of the stern and lowers the opposite bow: corrects a list.' },
      { front: 'Pivot point of a boat going ahead?', back: 'About one third of the length aft of the bow; the stern swings outward in a turn.' },
      { front: 'Right-handed propeller, astern: stern goes where?', back: 'To PORT (bow to starboard). Strong effect; the rudder cannot correct it at low speed.' },
      { front: 'Best side to berth with a single right-handed prop?', back: 'Port side to: a burst of astern pulls the stern in. Pivot clockwise in tight spots.' },
      { front: 'Approach a quay with wind blowing OFF it?', back: 'Steeper angle (30–45 degrees), bow line ashore first, then helm to the quay and a touch ahead swings the stern in.' },
      { front: 'Approach a quay with wind blowing ONTO it?', back: 'Nearly parallel, stop about one boat-width off, let the wind set you onto the fenders.' },
      { front: 'What do springs do?', back: 'Run diagonally along the boat and stop surging fore and aft. Standard set: bow line, stern line, two springs.' },
      { front: 'Bow line and stern line: what do they stop?', back: 'Bow line (runs forward) stops movement astern; stern line (runs aft) stops movement ahead.' },
      { front: 'Knot for a fixed loop that does not slip?', back: 'Bowline. Easy to untie after load, but cannot be tied or untied under load.' },
      { front: 'Hitch that can be tied and released under load?', back: 'Round turn and two half hitches: the round turn takes the strain.' },
      { front: 'Knot to join two ropes of different thickness?', back: 'Sheet bend: the thicker rope forms the bight, tails on the same side. Never a reef knot.' },
      { front: 'Which rope floats but weakens in sunlight?', back: 'Polypropylene. Nylon stretches (anchor rode); polyester has low stretch.' },
      { front: 'Anchor scope rule of thumb?', back: 'About 5 x depth (bow roller to seabed, incl. tide); 7–10 x in strong wind; 3 x only all-chain in calm weather.' },
      { front: 'Why chain between anchor and rope?', back: 'Weight keeps the pull horizontal so the anchor digs in; sag absorbs shocks; resists chafe. 5–8 m.' },
      { front: 'Good and poor holding bottoms?', back: 'Good: sand, clay, mud. Poor: rock, weed, gravel.' },
      { front: 'Anchor light and day shape, vessel under 50 m?', back: 'One all-round white light; one black ball by day (Rule 30). Under 7 m away from fairways: not required.' },
      { front: 'Towing speed and towline length?', back: 'Slow, 3–5 knots; long line (4–5+ boat lengths) so both boats ride crests together; halve in harbour.' },
      { front: 'Lights of a vessel towing astern (Rule 24)?', back: 'Two masthead lights in a line (three if tow > 200 m), sidelights, sternlight, yellow towing light above the sternlight.' },
      { front: 'Greatest danger in a following sea?', back: 'Broaching: the wave lifts the stern, steering is lost, the boat slews beam-on. Do not match wave speed.' },
      { front: 'Aground, no leak: what do you do?', back: 'Neutral, check crew and bilge, lift the drive, shift weight away, push off, gentle astern only.' },
      { front: 'Speed limit near swimmers?', back: 'Max 5 knots within 50 m of bathers or bathing places.' },
      { front: 'Four dangers of high speed (part 4, 1.4.7)?', back: 'Tunnel vision; lag in GPS/plotter; little time to react, keep distance from shore; severe consequences.' },
      { front: 'At high speed, the position on the plotter ...?', back: 'Lags behind the boat\'s real position. Navigate by eye; the screen is a check, not a windscreen.' },
      { front: 'Kill cord: use?', back: 'Stops the engine if the driver leaves the helm. Wear it round the leg, test every trip, carry a spare.' },
      { front: 'High-speed certificate: when needed?', back: 'Since 1 June 2023 for motorised craft and personal watercraft that can reach 50 knots or more.' },
    ],
    questions: [
      /* ---- part 4, item 1.4.7: dangers of high speed (F69, syllabus 1.1 p) ---- */
      { id: 'seamanship-01', q: 'What happens to the skipper\'s field of vision as boat speed increases?', options: ['It narrows to a tunnel straight ahead, so hazards to the side are missed', 'It widens because the horizon moves faster', 'It is unchanged; speed affects only hearing', 'It improves because the bow lifts'], answer: 0, explanation: 'Tunnel vision is the first danger of high speed in the curriculum: the eyes lock on to a narrow cone ahead and peripheral vision shrinks (F69).', difficulty: 1, part: 4, p4: '1.4.7', tags: ['high-speed', 'tunnel-vision'] },
      { id: 'seamanship-02', q: 'You are running at 30 knots using the chart plotter. Where is the position shown on the screen in relation to the boat?', options: ['Slightly ahead of the boat, because the plotter predicts movement', 'Exactly where the boat is; GPS has no delay', 'Behind the boat, because the display updates with a delay', 'To one side of the boat, depending on the current'], answer: 2, explanation: 'Electronic aids update with a delay, so at high speed the displayed position lags behind the real position. Navigate by eye and use the plotter as a check (F69).', difficulty: 3, part: 4, p4: '1.4.7', tags: ['high-speed', 'gps-lag'] },
      { id: 'seamanship-03', q: 'Why should you keep a good distance from the shore when driving fast?', options: ['Because the water is colder close to the shore', 'Because there is little time and distance to react to rocks, swimmers and other boats', 'Because the GPS signal is weaker near land', 'Because the engine overheats in shallow water'], answer: 1, explanation: 'At speed distances shrink fast and a turn or stop needs room; a proper distance from shore gives you time to react (F69).', difficulty: 1, part: 4, p4: '1.4.7', tags: ['high-speed', 'distance'] },
      { id: 'seamanship-04', q: 'Which of these is one of the dangers of high speed listed in the curriculum?', options: ['Propeller walk', 'Free surface effect', 'Porpoising', 'Tunnel vision'], answer: 3, explanation: 'The curriculum item on high speed lists narrowed (tunnel) vision, delay in electronic equipment, proper distance from shore and the risk and consequences. Prop walk, free surface and porpoising are handling topics (F69).', difficulty: 1, part: 4, p4: '1.4.7', tags: ['high-speed'] },
      { id: 'seamanship-05', q: 'Look at the lower strip of the picture. What does it illustrate?', illustration: () => illHighSpeed(), options: ['That two boats must keep a safe passing distance', 'That at speed the plotter shows a position behind where the boat really is', 'That the boat ahead has right of way', 'That a following sea pushes the boat off course'], answer: 1, explanation: 'The grey boat is the position on the screen; the highlighted boat is where you really are. Delay multiplied by speed gives the gap: the plotter lags at high speed (F69).', difficulty: 2, part: 4, p4: '1.4.7', tags: ['high-speed', 'gps-lag', 'picture'] },
      { id: 'seamanship-06', q: 'At 30 knots, roughly how far does the boat travel each second?', options: ['About 3 m', 'About 8 m', 'About 15 m', 'About 30 m'], answer: 2, explanation: '30 knots is 30 x 1852 m per hour, which is about 15.4 m per second. A three-second glance at the plotter is about 45 m of travel, and a few seconds of display delay puts the screen position tens of metres astern (F69).', difficulty: 3, part: 4, p4: '1.4.7', tags: ['high-speed', 'arithmetic'] },
      { id: 'seamanship-07', q: 'Before you accelerate to planing speed, how should your passengers be placed?', options: ['Standing at the gunwale to balance the boat', 'Seated low, holding on, with flotation worn, nobody on the bow or transom', 'On the bow, to keep the bow down', 'Anywhere, as long as the kill cord is attached'], answer: 1, explanation: 'At speed and in turns people must sit low and hold on; a sudden movement or a slam can throw them out or cause high-energy injuries. Nobody sits on the bow, gunwale or transom while underway (F19, F90).', difficulty: 1, part: 4, p4: '1.4.7', tags: ['high-speed', 'passengers'] },
      { id: 'seamanship-08', q: 'What is the purpose of the kill cord?', options: ['To stop the engine if the driver is thrown from the helm', 'To lock the throttle at cruising speed', 'To release the anchor in an emergency', 'To cut a towline that has fouled the propeller'], answer: 0, explanation: 'The kill cord stops the engine when the driver leaves the helm, so the boat does not circle at speed with nobody at the wheel. Wear it round the leg, test it every trip and carry a spare (F83).', difficulty: 1, part: 4, p4: '1.4.7', tags: ['high-speed', 'kill-cord'] },
      { id: 'seamanship-09', q: 'Why are collisions and groundings at high speed especially serious?', options: ['Because insurance never covers them', 'Because the propeller always falls off', 'Because the boat sinks faster in deep water', 'Because people are thrown against the boat or out of it, causing high-energy injuries'], answer: 3, explanation: 'The curriculum pairs "dangers of high speed" with first aid for high-energy injuries: a sudden stop at speed throws people violently (F64, F69).', difficulty: 2, part: 4, p4: '1.4.7', tags: ['high-speed', 'consequences'] },
      { id: 'seamanship-10', q: 'You approach a narrow sound at high speed, steering by the chart plotter. What is the seamanlike action?', options: ['Keep speed; the plotter is accurate to a few metres', 'Zoom in on the plotter and keep speed', 'Slow down and navigate by eye and chart, because the plotter position lags at speed', 'Switch the plotter off to avoid distraction and keep speed'], answer: 2, explanation: 'The position on the screen is behind the boat at speed, and a narrow passage leaves no room for error. Reduce speed, look out, and treat the plotter as a check (F69, Rule 6 safe speed, F10).', difficulty: 3, part: 4, p4: '1.4.7', tags: ['high-speed', 'gps-lag'] },
      { id: 'seamanship-11', q: 'What does Rule 6 of the Rules of the Road require of every vessel?', options: ['A maximum speed of 30 knots', 'A safe speed at all times, so that it can take proper action to avoid collision and stop in time', 'Full speed in open water to clear the fairway quickly', 'A minimum speed of 5 knots in fairways'], answer: 1, explanation: 'Rule 6 requires every vessel to proceed at a safe speed at all times. Norwegian Rule 43 adds that small vessels approaching others must manoeuvre with caution, reduce speed and if necessary stop (F10).', difficulty: 2, part: 4, p4: '1.4.7', tags: ['high-speed', 'rule-6'] },
      /* ---- part 4, item 1.4.5: flotation (F5, F6, sdir.no) ---- */
      { id: 'seamanship-12', q: 'You tow a water-skier behind a 6 m boat. Who must wear flotation?', options: ['Only the skier', 'Only the people in the boat', 'The skier and everyone in the boat', 'Nobody, because the boat is under 8 m'], answer: 2, explanation: 'In a boat under 8 m everyone outdoors must wear flotation while underway, and the Norwegian Maritime Authority states that people on towed water-sports equipment (skis, tubes, wakeboards) are covered by the same duty (F5; sdir.no).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['flotation', 'water-sports'] },
      /* ---- part 2: law and rules touched by this topic ---- */
      { id: 'seamanship-13', q: 'What is the maximum speed when passing within 50 m of swimmers?', options: ['3 knots', '10 knots', '8 knots', '5 knots'], answer: 3, explanation: 'The regulation on reduced speed when passing bathers sets a maximum of 5 knots within 50 m of swimmers and bathing places (F9).', difficulty: 1, part: 2, tags: ['bathers', 'speed'] },
      { id: 'seamanship-14', q: 'A 9 m motorboat lies at anchor at night in an anchorage. What light does it show?', options: ['One all-round white light', 'Sidelights and a sternlight', 'Two all-round red lights', 'Red over white all-round lights'], answer: 0, explanation: 'Rule 30: a vessel under 50 m at anchor may show one all-round white light where best seen (one black ball by day). Sidelights are for vessels underway (F41).', difficulty: 1, part: 2, tags: ['rule-30', 'anchor-light'] },
      { id: 'seamanship-15', q: 'A power-driven vessel tows a 10 m boat on a 40 m towline at night. Which lights does the towing vessel show?', options: ['Only sidelights and a sternlight', 'Two masthead lights in a vertical line, sidelights, a sternlight and a yellow towing light above the sternlight', 'Three masthead lights in a vertical line and a red towing light', 'One all-round white light'], answer: 1, explanation: 'Rule 24(a): two masthead lights in a vertical line (three only if the tow exceeds 200 m), sidelights, sternlight and a yellow towing light vertically above the sternlight. The towed boat shows sidelights and a sternlight (F59).', difficulty: 2, part: 2, tags: ['rule-24', 'towing-lights'] },
      { id: 'seamanship-16', q: 'Norwegian Rule 45 concerns anchoring and mooring. What does it say?', options: ['Anchoring is only allowed in marked anchorages', 'Vessels under 7 m may anchor anywhere', 'Vessels must not, without compelling necessity, anchor or moor so that they obstruct passage', 'Anchored vessels must always show two white lights'], answer: 2, explanation: 'Norwegian Rule 45: do not anchor or moor so that you obstruct passage, unless compelled to. Keep out of fairways and narrow channels when choosing an anchorage (F11).', difficulty: 2, part: 2, tags: ['rule-45', 'anchoring'] },
      { id: 'seamanship-17', q: 'Since 1 June 2023 a separate high-speed certificate is required for the operator of a motorised recreational craft or personal watercraft that can reach what speed?', options: ['30 knots or more', '40 knots or more', '60 knots or more', '50 knots or more'], answer: 3, explanation: 'The high-speed certificate applies to craft capable of 50 knots or more; the course can be taken from age 17 and the certificate issued from 18 (F4).', difficulty: 2, part: 2, tags: ['high-speed-certificate'] },
      /* ---- part 1: boat types and CE (F13–F15, F20, F21) ---- */
      { id: 'seamanship-18', q: 'What information must the CE builder\'s plate on a recreational boat show?', options: ['Top speed, engine serial number and hull colour', 'Manufacturer, maximum load including outboard, maximum number of persons, design category and the CE symbol', 'Owner\'s name, home port and registration number', 'Anchor size, chain length and rode length'], answer: 1, explanation: 'The plate shows the manufacturer, max load incl. optional outboard (kg), max persons, design category A–D and the CE mark. Maximum engine power is in the owner\'s manual (F14; sdir.no).', difficulty: 1, part: 1, tags: ['ce-plate'] },
      { id: 'seamanship-19', q: 'Read the plate in the picture. Which statement is correct?', illustration: () => illCEPlate({ cat: 'B', persons: 8, load: 1100, quiz: true }), options: ['The boat may carry 8 persons and is designed for wind up to Beaufort 8 and waves up to 4 m', 'The boat may carry 8 persons and is designed for wind up to Beaufort 6 and waves up to 2 m', 'The boat may carry 1100 persons in sheltered waters', 'The boat is designed for any ocean conditions'], answer: 0, explanation: 'Category B means offshore: wind up to and including Beaufort 8 and significant waves up to 4 m. Max persons 8; 1100 kg is the maximum load including the outboard (F14, F15).', difficulty: 3, part: 1, tags: ['ce-plate', 'picture'] },
      { id: 'seamanship-20', q: 'Which CE design category is the most limited, intended for sheltered waters only?', options: ['A', 'B', 'C', 'D'], answer: 3, explanation: 'Category D: wind up to Beaufort 4 and waves up to 0.3 m. A is the most seaworthy (ocean), B offshore, C inshore (F15).', difficulty: 1, part: 1, tags: ['ce-category'] },
      { id: 'seamanship-21', q: 'Your boat is CE category C, the forecast is Beaufort 7 with 2.5 m waves. What do you conclude?', options: ['Fine: category C covers up to Beaufort 8', 'Fine if everyone wears flotation', 'The conditions exceed what the boat was designed for (Beaufort 6, 2 m): do not go', 'Fine in daylight, not at night'], answer: 2, explanation: 'Category C is designed for winds up to Beaufort 6 and waves up to 2 m. Beaufort 7 and 2.5 m are beyond the design limits (F15, S7).', difficulty: 3, part: 1, tags: ['ce-category', 'scenario'] },
      { id: 'seamanship-22', q: 'Why can a displacement hull not go faster however much engine power you add?', options: ['Because the propeller cavitates above 6 knots', 'Because its speed is limited by its waterline length: it cannot climb over its own bow wave', 'Because the rudder stalls', 'Because CE rules forbid it'], answer: 1, explanation: 'A displacement hull is carried by buoyancy alone; its practical top speed is about 1.34 times the square root of the waterline length in feet (about 6.7 knots for 25 ft). Only a planing hull climbs on to the water (F20, F21).', difficulty: 2, part: 1, tags: ['hull-types'] },
      { id: 'seamanship-23', q: 'What is a chine?', options: ['The flat stern surface where the outboard is mounted', 'The upper edge of the side of the boat', 'The centreline member along the bottom', 'The angle where the bottom of a planing hull meets its side'], answer: 3, explanation: 'Planing hulls typically have at least one chine, the edge between bottom and side. The flat stern is the transom, the upper edge of the side is the gunwale, the centreline member is the keel (F21, F89).', difficulty: 1, part: 1, tags: ['terminology'] },
      /* ---- part 1: stability, loading, trim (F16–F19, F66, F67, F90) ---- */
      { id: 'seamanship-24', q: 'Where should heavy loads be placed in a small boat?', options: ['Low and in the middle', 'In the bow, to keep the bow down at speed', 'Aft, to lift the bow', 'High up, where they are easy to reach'], answer: 0, explanation: 'Weight low and centred gives the most stability and level trim. Bow-heavy boats veer at speed, stern-heavy boats porpoise, high weight reduces stability (F16, F18).', difficulty: 1, part: 1, tags: ['loading'] },
      { id: 'seamanship-25', q: 'Which boat in the picture is correctly loaded?', illustration: () => illLoading({ quiz: true }), options: ['B, because the weight is high and easy to reach', 'A, because the weight is low and in the middle', 'C, because water in the bilge adds useful ballast', 'B and C are both correct'], answer: 1, explanation: 'Boat A has the centre of gravity low and central and sits level. Boat B has weight high and on one side and heels; boat C has loose water that slides to the low side (free surface effect) (F16, F17).', difficulty: 1, part: 1, tags: ['loading', 'picture'] },
      { id: 'seamanship-26', q: 'Why is loose water in the bottom of a small boat dangerous?', options: ['It slides to the low side as the boat heels and reduces stability (free surface effect)', 'It corrodes the propeller', 'It makes the boat plane too early', 'It is not dangerous as long as the pump works'], answer: 0, explanation: 'Free surface effect: liquid that can move across the boat shifts the centre of gravity towards the low side and pushes the boat further over. 10–15 cm of water can weigh several hundred kilograms (F17).', difficulty: 2, part: 1, tags: ['stability', 'free-surface'] },
      { id: 'seamanship-27', q: 'What happens to a boat that is overloaded?', options: ['It planes earlier and steers better', 'Its freeboard increases', 'Its draught increases and its freeboard decreases, so water comes aboard more easily and stability suffers', 'Nothing, as long as the load is in the bow'], answer: 2, explanation: 'Every kilogram sinks the boat deeper: more draught, less freeboard. The CE plate\'s maximum load and maximum persons are limits (F14, F16).', difficulty: 1, part: 1, tags: ['loading', 'freeboard'] },
      { id: 'seamanship-28', q: 'What is the particular danger of a bow-heavy trim at speed?', options: ['The boat cannot be steered in reverse', 'The engine overheats', 'The propeller walks to port', 'The bow digs in and the boat may veer suddenly'], answer: 3, explanation: 'A bow-heavy boat ploughs and the bow can grip the water, making the boat veer. Move weight aft or trim the drive out a little (F18).', difficulty: 2, part: 1, tags: ['trim'] },
      { id: 'seamanship-29', q: 'Which boat in the picture is stern-heavy and likely to porpoise at planing speed?', illustration: () => illTrim({ quiz: true }), options: ['A', 'B', 'C', 'None of them; porpoising is caused by waves'], answer: 2, explanation: 'Boat C runs bow-up: too much weight aft or bow-up trim causes porpoising and makes planing hard. Boat B is bow-heavy, boat A is level (F18, F67).', difficulty: 2, part: 1, tags: ['trim', 'picture'] },
      { id: 'seamanship-30', q: 'Wind on the starboard bow is making the boat list. How do you use trim tabs to correct it?', options: ['Lower one tab: it lifts that side of the stern and lowers the opposite bow', 'Lower both tabs fully', 'Raise both tabs fully', 'Trim tabs cannot correct a list'], answer: 0, explanation: 'Lowering a single tab lifts that side of the stern and lowers the opposite bow, which is how a list from wind or uneven loading is corrected. Both tabs down pushes the bow down (F66).', difficulty: 3, part: 1, tags: ['trim-tabs'] },
      { id: 'seamanship-31', q: 'Why is an engine that is too powerful for the boat a safety problem?', options: ['It uses less fuel, so you forget to refuel', 'It makes the boat too stable', 'It adds weight to the transom, drives the hull faster than designed and makes the boat hard to control', 'It is only a problem for sailing boats'], answer: 2, explanation: 'The curriculum asks for the importance of an appropriately sized engine: excess weight aft trims the boat stern-heavy, and excess speed overruns the hull design. Follow the owner\'s manual maximum (syllabus 1.1 g; sdir.no).', difficulty: 2, part: 1, tags: ['engine-size'] },
      /* ---- part 1: handling (F22–F26, F33) ---- */
      { id: 'seamanship-32', q: 'You are alongside a quay and want to leave by steering away with the bow. What happens?', options: ['The stern swings into the quay, because a boat pivots about a point near the bow and the stern swings outward', 'The boat leaves cleanly, like a car', 'The bow swings into the quay', 'Nothing, until you engage astern'], answer: 0, explanation: 'A boat steers from the stern and pivots about a point roughly one third of the length aft of the bow, so the stern swings outward in a turn. When leaving, move the stern clear first (F24, F25, F33).', difficulty: 3, part: 1, tags: ['pivot-point', 'leaving'] },
      { id: 'seamanship-33', q: 'The boat in the picture has a right-handed propeller and engages astern from rest. Which arrow shows how the stern moves?', illustration: () => illPropWalk({ quiz: true }), options: ['Arrow 2: the stern goes to starboard', 'Arrow 1: the stern goes to port', 'Neither: the stern goes straight back', 'It depends entirely on the rudder angle'], answer: 1, explanation: 'Propeller walk in astern with a right-handed prop kicks the stern to port and the bow to starboard. The picture has the bow up, so port is on the left: arrow 1 (F22).', difficulty: 2, part: 1, tags: ['prop-walk', 'picture'] },
      { id: 'seamanship-34', q: 'Which side is easiest to berth on with a single right-handed propeller, and why?', options: ['Starboard side to, because the stern kicks to starboard in astern', 'Either side; prop walk has no practical use', 'Starboard side to, because the bow swings to port in astern', 'Port side to, because a burst of astern pulls the stern in towards the quay'], answer: 3, explanation: 'In astern the stern kicks to port, so lying port side to, a burst of astern brings the stern neatly alongside. The same boat pivots most tightly clockwise (F23).', difficulty: 3, part: 1, tags: ['prop-walk', 'berthing'] },
      { id: 'seamanship-35', q: 'Why does an outboard-powered boat steer in reverse while a boat with a fixed propeller and rudder steers poorly in astern?', options: ['The outboard points its thrust, so it steers at any speed; a rudder needs water flowing past it', 'Outboards have two propellers', 'Rudders are locked in astern', 'Outboards are lighter'], answer: 0, explanation: 'An outboard or sterndrive steers by directing the thrust, even at zero speed with a burst of throttle. A rudder only works with water flow from boat speed or prop wash (F26).', difficulty: 2, part: 1, tags: ['steering'] },
      /* ---- part 1: berthing and mooring (F27–F34) ---- */
      { id: 'seamanship-36', q: 'How should you approach a quay to come alongside?', options: ['Fast and parallel, then full astern', 'Downwind, so the wind pushes you in', 'Heading into the stronger of wind or current, dead slow, in gear with short bursts, fenders and lines ready', 'In neutral from a long way off, coasting in'], answer: 2, explanation: 'Heading into wind or current lets nature brake you while the rudder keeps working. Use short bursts in gear rather than coasting in neutral, and prepare fenders and lines early (F27).', difficulty: 1, part: 1, tags: ['berthing'] },
      { id: 'seamanship-37', q: 'The wind is blowing ONTO the quay. What is the recommended approach?', options: ['At a steep angle with the bow line first', 'Stern first against the wind', 'At full speed to beat the wind', 'Nearly parallel, stop about one boat-width off and let the wind set you onto the fenders'], answer: 3, explanation: 'With the wind pushing you onto the quay, stop short and let it do the last metre gently. The steep-angle approach is for wind blowing OFF the quay (F28).', difficulty: 2, part: 1, tags: ['berthing'] },
      { id: 'seamanship-38', q: 'Before you engage gear to leave a berth, what must you check?', options: ['That no mooring line can reach the propeller and that only the line you still need is attached', 'That the anchor is lowered', 'That the fenders have been taken in first', 'That the engine is at full throttle'], answer: 0, explanation: 'A line in the propeller disables the boat instantly. Remove every line except the one you need, keep them clear of the prop, then swing the stern clear first (F33).', difficulty: 1, part: 1, tags: ['leaving'] },
      { id: 'seamanship-39', q: 'In the picture, which numbered lines are the springs?', illustration: () => illMooringLines({ quiz: true }), options: ['1 and 2', '2 and 5', '3 and 4', '1 and 5'], answer: 2, explanation: 'Springs run diagonally along the boat and cross: the fore spring (3) from the bow cleat aft, the aft spring (4) from the stern cleat forward. 1 is the bow line, 2 the stern line, 5 a breast line (F30).', difficulty: 2, part: 1, tags: ['mooring-lines', 'picture'] },
      { id: 'seamanship-40', q: 'What does the bow line do when a boat is moored alongside?', options: ['Stops the boat moving ahead', 'Runs forward from the bow and stops the boat moving astern', 'Stops the boat moving sideways', 'Holds the anchor'], answer: 1, explanation: 'The bow line leads forward and stops movement astern; the stern line leads aft and stops movement ahead; springs stop surging and breast lines stop sideways movement (F30).', difficulty: 1, part: 1, tags: ['mooring-lines'] },
      { id: 'seamanship-41', q: 'You moor overnight in a harbour with a large tidal range. How do you arrange the lines?', options: ['Long lines with slack, so the boat can rise and fall without hanging or tearing out cleats', 'Short, tight lines so the boat cannot move', 'Only a breast line at midships', 'A single bow line to the highest bollard'], answer: 0, explanation: 'Where the water level changes, short lines leave the boat hanging on a falling tide or tear out fittings on a rising one; use long lines and leave slack, with fenders at bow, midships and stern (F31).', difficulty: 3, part: 1, tags: ['mooring', 'tide'] },
      /* ---- part 1: knots and rope (F43–F49) ---- */
      { id: 'seamanship-42', q: 'Which knot makes a fixed loop that will not slip and is easy to untie after it has carried a load?', options: ['Clove hitch', 'Reef knot', 'Figure-eight', 'Bowline'], answer: 3, explanation: 'The bowline is the standard fixed loop for a bollard or ring. Remember it cannot be tied or untied while under load (F43).', difficulty: 1, part: 1, tags: ['knots'] },
      { id: 'seamanship-43', q: 'Which hitch can be tied and released while the line is under strain, for example when mooring to a ring in wind?', options: ['Bowline', 'Sheet bend', 'Round turn and two half hitches', 'Reef knot'], answer: 2, explanation: 'The round turn takes the load while you make the two half hitches, so the hitch can be made and released under strain. A bowline cannot be tied under load (F44).', difficulty: 2, part: 1, tags: ['knots'] },
      { id: 'seamanship-44', q: 'You must join a thick mooring line to a thinner line. Which knot do you use?', options: ['Sheet bend, with the thicker rope forming the bight', 'Reef (square) knot', 'Clove hitch', 'Cleat hitch'], answer: 0, explanation: 'The sheet bend joins ropes, especially of unequal diameter; the thicker rope forms the bight and both tails finish on the same side. A reef knot is a binding knot and capsizes under load (F46, F48).', difficulty: 1, part: 1, tags: ['knots'] },
      { id: 'seamanship-45', q: 'Which rope material floats, is comparatively weak and degrades in sunlight?', options: ['Nylon', 'Polyester', 'Steel wire', 'Polypropylene'], answer: 3, explanation: 'Polypropylene floats and is UV-sensitive: good for ski lines and heaving lines, never for an anchor rode. Nylon stretches and absorbs shocks; polyester has low stretch and resists sun and chafe (F49).', difficulty: 2, part: 1, tags: ['rope'] },
      /* ---- part 1: anchoring (F35–F40) ---- */
      { id: 'seamanship-46', q: 'Which seabed gives the best holding for a fluke (Danforth) type anchor?', options: ['Rock', 'Thick weed', 'Sand or mud', 'Loose gravel'], answer: 2, explanation: 'Fluke anchors excel in sand and mud and do poorly in gravel and weed; rock suits a grapnel. The chart shows the bottom type (S sand, M mud, G gravel) (F35, F36).', difficulty: 1, part: 1, tags: ['anchoring'] },
      { id: 'seamanship-47', q: 'Why is a length of chain fitted between the anchor and the rope?', options: ['To make the anchor easier to throw', 'To keep the pull on the anchor nearly horizontal, absorb shocks and resist chafe on the bottom', 'To make the rode float clear of the propeller', 'Because the Rules of the Road require it'], answer: 1, explanation: 'The chain\'s weight lowers the angle of pull so the anchor digs in instead of lifting, its sag absorbs snatching, and it resists abrasion on the seabed. Norwegian courses recommend 5–8 m (F38).', difficulty: 2, part: 1, tags: ['anchoring'] },
      { id: 'seamanship-48', q: 'Three boats are anchored in the same depth with rope-and-chain rodes in light wind. Which has paid out a correct scope?', illustration: () => illScopeCompare(), options: ['B', 'A', 'C', 'All three are acceptable in light wind'], answer: 0, explanation: 'Boat B has rode about five times the depth, so the pull on the anchor is nearly horizontal. Boat A (about equal to the depth) and boat C (about twice the depth) pull the anchor upward and it will drag (F37).', difficulty: 3, part: 1, tags: ['anchoring', 'scope', 'picture'] },
      { id: 'seamanship-49', q: 'What is the correct way to set an anchor?', options: ['Throw it as far as possible from the bow while moving ahead', 'Drop it over the stern at speed so it digs in', 'Stop head to wind over the spot, lower it to the bottom, pay out rode as you drift back, then snub gently astern until it holds', 'Lower it, then motor ahead at full power to test it'], answer: 2, explanation: 'Never throw an anchor: lower it, let the boat drift back so the rode lies straight, then apply gentle astern until the rode goes taut and the anchor has dug in (F39).', difficulty: 2, part: 1, tags: ['anchoring'] },
      { id: 'seamanship-50', q: 'How can you tell that your anchor is dragging?', options: ['The rode goes slack and floats', 'The boat stops swinging', 'The anchor light goes out', 'A transit or bearings on two shore objects change, or the GPS anchor alarm sounds'], answer: 3, explanation: 'Line up two fixed objects ashore when the anchor has set; if they open or your bearings change, you are moving. A GPS anchor alarm does the same job (F39).', difficulty: 2, part: 1, tags: ['anchoring'] },
      /* ---- part 1: towing (F51–F58) ---- */
      { id: 'seamanship-51', q: 'How should the towline be attached on the towing boat?', options: ['To one stern cleat, so it is easy to release', 'To a bridle between the two stern cleats, so the pull is centred and the boat can still steer', 'To the bow cleat', 'Around the helmsman\'s seat'], answer: 1, explanation: 'A bridle spreads the load over both stern cleats and keeps the pull on the centreline so the tug keeps steering control. On the towed boat use the bow eye or a through-bolted bow cleat (F53).', difficulty: 2, part: 1, tags: ['towing'] },
      { id: 'seamanship-52', q: 'How long should the towline be when towing in open water with waves?', options: ['As short as possible to keep control', 'Long, adjusted so that both boats ride the wave crests at the same time, and shortened in harbour', 'Exactly one boat length', 'It does not matter as long as the line is strong'], answer: 1, explanation: 'A long line (4–5 boat lengths or more) with both boats on crests together stops snatching; a nylon line also absorbs shocks. Shorten to about half in confined waters (F54).', difficulty: 2, part: 1, tags: ['towing'] },
      { id: 'seamanship-53', q: 'Why must everyone keep clear of the towline during a tow?', options: ['Because the line is slippery', 'Because it blocks the view of the helmsman', 'Because touching it is bad luck', 'Because a stretched nylon line that parts snaps back like a projectile'], answer: 3, explanation: 'A towline under tension stores energy; if it parts it whips back and can kill. Everyone sits down clear of the line, and a knife is kept ready to cut the tow (F56).', difficulty: 1, part: 1, tags: ['towing', 'snap-back'] },
      { id: 'seamanship-54', q: 'A boat nearby has engine failure in strong wind and drifting towards rocks. Your own small boat would be endangered by going close. What is the right attitude under Norwegian law and good seamanship?', options: ['You must tow them regardless of the risk to your own boat', 'Help as far as you can without serious danger to your own boat and crew; otherwise alert coast radio (120) or VHF 16 at once', 'Ignore them; assistance is the rescue service\'s job', 'Only help if they offer payment'], answer: 1, explanation: 'The duty to assist applies as far as it can be done without serious danger to your own vessel and people. If you cannot help safely, alert the rescue service immediately via coast radio 120 or VHF channel 16 (F51, F88).', difficulty: 3, part: 1, tags: ['assistance'] },
      /* ---- part 1: waves, grounding, consideration (F61–F65, F70–F71, F12) ---- */
      { id: 'seamanship-55', q: 'What is the greatest danger when running before a following sea in a small motorboat?', options: ['Prop walk', 'Excessive spray', 'Broaching: the wave lifts the stern, steering is lost and the boat slews beam-on', 'Porpoising'], answer: 2, explanation: 'Do not run at the same speed as the waves or surf down a face; add power on the back of the wave, ease it on the crest and keep the stern square to the sea (F63).', difficulty: 2, part: 1, tags: ['waves', 'broaching'] },
      { id: 'seamanship-56', q: 'Why should you not use full throttle astern to get off after grounding on sand?', options: ['Because it is forbidden by Rule 45', 'Because sand and weed are sucked into the cooling intake and the propeller is damaged', 'Because the boat will plane backwards', 'Because the anchor will drag'], answer: 1, explanation: 'Hard reverse in shallow water damages the engine and propeller. Lift the drive, shift weight away from the grounding point, push off and use gentle astern, or kedge off or wait for the tide (F71).', difficulty: 2, part: 1, tags: ['grounding'] },
      { id: 'seamanship-57', q: 'Your water-skier has fallen and you circle back to pick her up. What do you do as you come alongside?', options: ['Engine in neutral, approach so that she is on the lee side, never reverse towards her', 'Reverse slowly towards her so she can grab the stern', 'Keep the engine in gear so you can hold position', 'Approach downwind at speed so you arrive quickly'], answer: 0, explanation: 'A person in the water near the boat is at risk from the propeller: neutral when alongside, never reverse towards them, and engine off before anyone uses the stern ladder. Approach slowly into the wind so the boat stops under control (F74, F75).', difficulty: 3, part: 1, tags: ['water-sports', 'propeller'] },
      { id: 'seamanship-58', q: 'Which of the following is one of the seven sea-sense rules of the Norwegian Society for Sea Rescue?', options: ['Always anchor with 3 times the depth', 'Be rested and sober', 'Keep 10 knots in harbours', 'Tow only in daylight'], answer: 1, explanation: 'The seven rules: think safety; bring the necessary equipment; respect weather and waters; follow the collision regulations; wear a life jacket or flotation garment; be rested and sober; show consideration (F12).', difficulty: 1, part: 1, tags: ['good-seamanship'] },
    ],
  });
})();
