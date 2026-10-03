/* Skipper Prep — topic 1: The exam, the licence and the law.
   Facts: scratchpad/facts/exam-and-law.md (verified 2026-10-03 against the Norwegian Maritime
   Authority, Lovdata, the exam provider's FAQ and the Joint Rescue Coordination Centre).
   Fact ids (F1...F93) and illustration ids (IL-1...IL-11) in comments refer to that sheet. */
(function () {
  'use strict';
  const S = BOAT.svg, C = S.COLORS, T = S.text;
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)', PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', SHALLOW = 'var(--shallow)';
  const OK = 'var(--ok)', OKBG = 'var(--ok-bg)', BAD = 'var(--bad)', BADBG = 'var(--bad-bg)', WARN = 'var(--warn)', WARNBG = 'var(--warn-bg)', SEA = 'var(--sea)', ACC = 'var(--accent)';
  const LAND = '#c9b98c', LANDGREEN = '#8fae6b';

  // ---------- small drawing helpers (theme tokens for ink, fixed colours only for real objects) ----------
  function rect(x, y, w, h, fill, stroke, o) {
    o = o || {};
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 6 : o.rx}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${o.sw || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`;
  }
  function line(x1, y1, x2, y2, stroke, o) {
    o = o || {};
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke || INK}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>`;
  }
  function head(x, y, ang, fill, L) {
    L = L || 9;
    const bx = x - L * Math.cos(ang), by = y - L * Math.sin(ang);
    const px = -Math.sin(ang) * L * 0.45, py = Math.cos(ang) * L * 0.45;
    return `<polygon points="${x.toFixed(1)},${y.toFixed(1)} ${(bx + px).toFixed(1)},${(by + py).toFixed(1)} ${(bx - px).toFixed(1)},${(by - py).toFixed(1)}" fill="${fill}"/>`;
  }
  /* polyline arrow through points [[x,y],...] with a head on the last segment */
  function arrow(pts, stroke, o) {
    o = o || {}; stroke = stroke || INK;
    const n = pts.length, [x1, y1] = pts[n - 2], [x2, y2] = pts[n - 1];
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ex = x2 - 7 * Math.cos(ang), ey = y2 - 7 * Math.sin(ang);
    const body = pts.slice(0, n - 1).concat([[ex, ey]]).map(p => p.join(',')).join(' ');
    return `<polyline points="${body}" fill="none" stroke="${stroke}" stroke-width="${o.sw || 1.8}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>` + head(x2, y2, ang, stroke);
  }
  /* quadratic curve arrow: head direction taken from control point to end */
  function curveArrow(x1, y1, cx, cy, x2, y2, stroke, o) {
    o = o || {}; stroke = stroke || INK;
    const ang = Math.atan2(y2 - cy, x2 - cx);
    return `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" fill="none" stroke="${stroke}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>` + head(x2, y2, ang, stroke, 10);
  }
  function lines(x, y, arr, o) { o = o || {}; const lh = o.lh || 15; return arr.map((s, i) => T(x, y + i * lh, s, o)).join(''); }
  function diamond(cx, cy, w, h, fill, stroke) { return `<polygon points="${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`; }
  function person(x, y, o) { // head centre (x, y); about 34 px tall
    o = o || {}; const col = o.color || INK2;
    let s = `<circle cx="${x}" cy="${y}" r="4.5" fill="${col}"/>`;
    s += o.jacket ? rect(x - 7, y + 6, 14, 14, C.orange, INK, { rx: 3, sw: 0.8 }) : rect(x - 6, y + 6, 12, 14, col, 'none', { rx: 3 });
    if (!o.noLegs) s += line(x - 3, y + 20, x - 4, y + 31, col, { sw: 3 }) + line(x + 3, y + 20, x + 4, y + 31, col, { sw: 3 });
    return s;
  }
  /* side view, stern at x, waterline at y, bow pointing right */
  function boatSide(x, y, len, h, fill, o) {
    o = o || {};
    let s = `<path d="M${x},${y - h} L${x + len * 0.78},${y - h} Q${x + len},${y - h * 1.15} ${x + len},${y - h * 0.15} L${x + len * 0.94},${y + h * 0.35} L${x + len * 0.04},${y + h * 0.35} Z" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>`;
    if (o.cabin) s += rect(x + len * 0.28, y - h - o.cabin, len * 0.4, o.cabin + 2, fill, INK, { rx: 3 }) + rect(x + len * 0.34, y - h - o.cabin + 5, len * 0.1, o.cabin * 0.4, SHALLOW, INK, { rx: 1, sw: 0.8 }) + rect(x + len * 0.48, y - h - o.cabin + 5, len * 0.1, o.cabin * 0.4, SHALLOW, INK, { rx: 1, sw: 0.8 });
    if (o.outboard) s += rect(x - 7, y - h - 6, 9, h * 0.9, INK2, 'none', { rx: 2 });
    if (o.wake) s += [0, 1, 2].map(i => line(x - 12 - i * 10, y + 3 + i * 5, x - 2 - i * 10, y + 3 + i * 5, SEA, { sw: 2 })).join('');
    return s;
  }
  function shipSide(x, y, len, h, fill) {
    return `<path d="M${x},${y - h} L${x + len * 0.86},${y - h} L${x + len},${y - h * 0.3} L${x + len * 0.96},${y + h * 0.4} L${x + len * 0.03},${y + h * 0.4} Z" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>` +
      rect(x + len * 0.08, y - h - 26, len * 0.26, 28, fill, INK, { rx: 2 }) + rect(x + len * 0.12, y - h - 42, len * 0.18, 18, fill, INK, { rx: 2 }) +
      rect(x + len * 0.42, y - h - 16, 10, 18, INK2, 'none', { rx: 1 });
  }
  /* plan view, bow up, centred (cx, cy) */
  function boatPlan(cx, cy, len, beam, fill, rot, o) {
    o = o || {};
    const p = `M${cx},${cy - len / 2} C${cx + beam * 0.6},${cy - len / 2 + len * 0.3} ${cx + beam / 2},${cy + len * 0.15} ${cx + beam / 2},${cy + len / 2} L${cx - beam / 2},${cy + len / 2} C${cx - beam / 2},${cy + len * 0.15} ${cx - beam * 0.6},${cy - len / 2 + len * 0.3} ${cx},${cy - len / 2} Z`;
    let inner = `<path d="${p}" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>`;
    if (o.sail) inner += `<path d="M${cx},${cy - len * 0.32} L${cx + beam * 1.1},${cy + len * 0.22} L${cx + 1},${cy + len * 0.2} Z" fill="${C.white}" stroke="${INK}" stroke-width="1"/>`;
    if (o.wake) inner += line(cx - beam * 0.3, cy + len / 2 + 4, cx - beam * 0.9, cy + len / 2 + 22, SEA, { sw: 2 }) + line(cx + beam * 0.3, cy + len / 2 + 4, cx + beam * 0.9, cy + len / 2 + 22, SEA, { sw: 2 });
    return `<g transform="rotate(${rot || 0} ${cx} ${cy})">${inner}</g>`;
  }
  function ferryPlan(cx, cy, len, beam) {
    return `<path d="M${cx},${cy - len / 2} L${cx + beam / 2},${cy - len / 2 + beam * 0.8} L${cx + beam / 2},${cy + len / 2} L${cx - beam / 2},${cy + len / 2} L${cx - beam / 2},${cy - len / 2 + beam * 0.8} Z" fill="${C.white}" stroke="${INK}" stroke-width="1.4"/>` +
      rect(cx - beam * 0.32, cy - len * 0.22, beam * 0.64, len * 0.6, PAPER2, INK, { rx: 4 }) + T(cx, cy + len * 0.08, 'FERRY', { size: 11, weight: 700, fill: INK });
  }
  function clock(cx, cy, r) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>` + line(cx, cy, cx, cy - r * 0.65, INK, { sw: 2 }) + line(cx, cy, cx + r * 0.5, cy + r * 0.2, INK, { sw: 2 });
  }
  function swimmer(x, y) {
    return `<circle cx="${x}" cy="${y}" r="5" fill="${INK2}"/><path d="M${x - 14},${y + 6} q7,-6 14,0 q7,6 14,0" fill="none" stroke="${INK2}" stroke-width="2.2" stroke-linecap="round"/>`;
  }

  // ---------- IL-8 exam structure ----------
  function examBar(o) {
    o = o || {};
    const W = 640, H = 300, x0 = 30, bw = 580, y = 78, bh = 34, cell = bw / 50;
    let s = T(W / 2, 22, 'The exam: 50 multiple-choice questions, four curriculum parts', { size: 15, weight: 700 });
    for (let i = 0; i < 50; i++) s += rect(x0 + i * cell, y, cell - 1.5, bh, i >= 37 ? ACC : SHALLOW, 'none', { rx: 2, opacity: i >= 37 ? 0.8 : 1 });
    const labels = ['Seamanship', 'Laws and rules', 'Navigation and chart', 'Part 4: especially important'];
    for (let k = 0; k < 4; k++) {
      const a = x0 + k * bw / 4 + 3, b = x0 + (k + 1) * bw / 4 - 3;
      s += `<path d="M${a},${y - 8} v-6 H${b} v6" fill="none" stroke="${k === 3 ? ACC : INK2}" stroke-width="1.5"/>`;
      s += T((a + b) / 2, y - 24, labels[k], { size: 12, weight: k === 3 ? 700 : 600, fill: k === 3 ? ACC : INK2 });
    }
    s += T(W / 2, y + bh + 18, 'Roughly one quarter each. The exact split is not published by the Norwegian Maritime Authority.', { size: 11, fill: MUTED });
    s += rect(x0, 150, 280, 64, OKBG, OK) + lines(x0 + 140, 172, ['Overall: at least 40 of 50 correct', '(at most 10 wrong)'], { size: 13, weight: 600, lh: 20 });
    s += rect(330, 150, 280, 64, 'none', BAD, { sw: 1.8 }) + lines(470, 172, ['Part 4: at most 2 wrong', 'you fail with 48/50 if 3 wrong are here'], { size: 13, weight: 600, lh: 20, fill: BAD });
    s += clock(62, 258, 20) + T(96, 258, '60 minutes', { size: 14, weight: 700, anchor: 'start' });
    s += `<path d="M240,243 h70 l14,15 l-14,15 h-70 Z" fill="${WARNBG}" stroke="${WARN}" stroke-width="1.4"/><circle cx="250" cy="258" r="3" fill="${WARN}"/>` + T(282, 258, 'NOK 940', { size: 13, weight: 700 });
    s += lines(336, 252, ['first attempt, incl. the licence card', 'retake after 14 days: NOK 495'], { size: 11, fill: MUTED, anchor: 'start', lh: 13 });
    return S.svg(W, H, s, { label: 'Structure of the exam: 50 questions, four parts, two pass rules' });
  }

  // ---------- IL-1 licence decision flowchart ----------
  function licenceFlow() {
    const W = 640, H = 560, cx = 190, dw = 300, dh = 100;
    let s = '';
    s += diamond(cx, 70, dw, dh, PAPER, INK) + lines(cx, 63, ['Born on or after', '1 January 1980?'], { size: 13, weight: 600, lh: 16 });
    s += diamond(cx, 215, dw, dh, PAPER, INK) + lines(cx, 199, ['Boat longer than 8 m', 'OR engine more than', '25 hp (19 kW)?'], { size: 13, weight: 600, lh: 16 });
    s += diamond(cx, 360, dw, dh, PAPER, INK) + lines(cx, 353, ['Boat shorter', 'than 15 m?'], { size: 13, weight: 600, lh: 16 });
    s += rect(400, 110, 220, 120, OKBG, OK) + T(510, 135, 'No boating licence needed', { size: 13, weight: 700, fill: OK }) + lines(510, 160, ['Age, alcohol, lifejacket, speed', 'and high-speed-certificate', 'rules still apply to you'], { size: 12, lh: 15, fill: INK2 });
    s += rect(400, 325, 220, 70, PAPER2, INK2) + lines(510, 345, ['15 to 24 m: recreational', 'skipper certificate', 'D5L / D5LA required'], { size: 12, weight: 600, lh: 15, fill: INK2 });
    s += rect(40, 440, 300, 60, BADBG, BAD, { sw: 1.8 }) + T(190, 462, 'Boating licence required', { size: 15, weight: 700, fill: BAD }) + T(190, 484, 'the exam you are preparing for', { size: 11, fill: INK2 });
    s += rect(40, 514, 300, 36, 'none', INK2, { dash: '5 4' }) + lines(190, 525, ['Capable of 50 knots or more? Also needed:', 'the high-speed certificate (since 1 June 2023)'], { size: 11, lh: 14, fill: INK2 });
    // arrows
    s += arrow([[cx, 120], [cx, 165]]) + T(cx + 18, 142, 'YES', { size: 11, weight: 700, anchor: 'start', fill: INK2 });
    s += arrow([[cx, 265], [cx, 310]]) + T(cx + 18, 287, 'YES', { size: 11, weight: 700, anchor: 'start', fill: INK2 });
    s += arrow([[cx, 410], [cx, 440]]) + T(cx + 18, 425, 'YES', { size: 11, weight: 700, anchor: 'start', fill: INK2 });
    s += arrow([[340, 70], [370, 70], [370, 140], [400, 140]]) + T(356, 58, 'NO', { size: 11, weight: 700, fill: INK2 });
    s += arrow([[340, 215], [400, 215]]) + T(368, 203, 'NO', { size: 11, weight: 700, fill: INK2 });
    s += arrow([[340, 360], [400, 360]]) + T(368, 348, 'NO', { size: 11, weight: 700, fill: INK2 });
    return S.svg(W, H, s, { label: 'Decision chart: who needs the boating licence' });
  }

  // ---------- IL-2 age ladder ----------
  function ageLadder() {
    const W = 640, H = 380, rl = 262, rr = 330;
    let s = line(rl, 36, rl, 352, INK, { sw: 4 }) + line(rr, 36, rr, 352, INK, { sw: 4 });
    const rungs = [
      [18, 62, ['high-speed certificate issued (boats capable of 50 knots or more);', 'recreational skipper certificate D5L (15 to 24 m)']],
      [17, 122, ['may take the high-speed course (certificate comes at 18)']],
      [16, 182, ['boating licence issued; may operate more than 10 hp']],
      [14, 258, ['may sit the boating exam (licence held back until 16)']],
      [13, 322, ['organised training or competition only, with safety supervision']],
    ];
    rungs.forEach(([age, y, txt]) => {
      s += line(rl, y, rr, y, INK, { sw: 4 }) + `<circle cx="${(rl + rr) / 2}" cy="${y}" r="15" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>` + T((rl + rr) / 2, y, String(age), { size: 13, weight: 800 });
      s += lines(rr + 16, y - (txt.length - 1) * 7, txt, { size: 12, anchor: 'start', lh: 14, fill: INK2 });
    });
    // bracket "under 16" covering the 13 and 14 rungs up to the 16 rung
    s += `<path d="M${rl - 14},188 h-10 v150 h10" fill="none" stroke="${WARN}" stroke-width="2"/>`;
    s += lines(rl - 34, 232, ['Under 16: at most 10 hp (7.5 kW)', 'AND at most 8 m.', 'No speed-capability limit', 'since 1 July 2021.'], { size: 12, anchor: 'end', lh: 15, weight: 600, fill: INK2 });
    s += T(170, 300, '"10 knots"', { size: 13, fill: MUTED, weight: 700 }) + line(140, 300, 200, 300, MUTED, { sw: 2 }) + T(170, 316, 'old rule, abolished 1 July 2021', { size: 10, fill: MUTED });
    s += T(W / 2, 18, 'Age steps for recreational boating', { size: 15, weight: 700 });
    s += T(610, 366, 'rules from the licence regulation of 3 March 2009', { size: 10, fill: MUTED, anchor: 'end' });
    return S.svg(W, H, s, { label: 'Age ladder: 13, 14, 16, 17 and 18' });
  }

  // ---------- IL-3 alcohol limits ----------
  function alcoholGraphic() {
    const W = 640, H = 340, wl = 160;
    let s = rect(0, wl, W, 14, SHALLOW, 'none', { rx: 0 }) + line(300, 20, 300, 320, LINE, { dash: '4 4' });
    s += boatSide(70, wl, 150, 22, C.hullLight, { cabin: 18, outboard: true });
    s += T(150, 56, '0.8 ‰', { size: 34, weight: 800 }) + T(150, 90, 'blood alcohol', { size: 11, fill: MUTED }) + T(150, 112, '0.4 mg/l breath', { size: 15, weight: 700, fill: INK2 });
    s += T(150, wl + 32, 'small craft under 15 m', { size: 13, weight: 700 }) + T(150, wl + 48, 'Small Craft Act, Section 33', { size: 11, fill: MUTED });
    s += shipSide(360, wl, 240, 26, C.hullDark);
    s += T(480, 56, '0.2 ‰', { size: 34, weight: 800 }) + T(480, 90, 'blood alcohol', { size: 11, fill: MUTED }) + T(480, 112, '0.1 mg/l breath', { size: 15, weight: 700, fill: INK2 });
    s += T(480, wl + 32, 'ships 15 m and over', { size: 13, weight: 700 }) + T(480, wl + 48, 'Maritime Code, Section 143', { size: 11, fill: MUTED });
    // who is covered by the 0.8 rule
    s += `<path d="M30,258 L50,258 L62,250 L56,262 L24,262 Z" fill="${C.hullLight}" stroke="${INK}" stroke-width="1"/><path d="M44,250 L44,222 L60,250 Z" fill="${C.white}" stroke="${INK}" stroke-width="1"/>`;
    s += lines(74, 246, ['Covered: any boat with an engine, sailing boats', '4.5 m or longer, and boats carrying paying passengers'], { size: 11, anchor: 'start', lh: 13, fill: INK2 });
    s += `<path d="M24,300 L60,300 L54,308 L30,308 Z" fill="${C.hullLight}" stroke="${INK}" stroke-width="1"/>` + line(38, 300, 30, 290, INK, { sw: 1.2 }) + line(48, 300, 56, 290, INK, { sw: 1.2 });
    s += lines(74, 294, ['Not covered: rowing boats and sailing boats under 4.5 m without', 'an engine. The general "unfit" rule (Section 32) still applies.'], { size: 11, anchor: 'start', lh: 13, fill: INK2 });
    s += clock(350, 272, 22) + T(350, 306, '6 h', { size: 14, weight: 800 });
    s += lines(386, 258, ['After an incident that may be investigated:', 'no alcohol or other intoxicants for', 'six hours after the trip ended.'], { size: 11, anchor: 'start', lh: 14, fill: INK2 });
    return S.svg(W, H, s, { label: 'Alcohol limits: 0.8 per mille under 15 m, 0.2 per mille from 15 m' });
  }

  // ---------- IL-4 flotation devices ----------
  function lifejacketPanels(mode) { // mode: 'both' (default) | 'small' | 'large'
    mode = mode || 'both';
    const panels = [];
    if (mode !== 'large') panels.push('small');
    if (mode !== 'small') panels.push('large');
    const pw = 290, W = panels.length === 2 ? 640 : 340, H = mode === 'both' ? 380 : 300, wl = 190;
    let s = '';
    panels.forEach((p, i) => {
      const x = 20 + i * 310;
      s += rect(x, 14, pw, 272, PAPER, LINE) + rect(x + 1, wl, pw - 2, 18, SHALLOW, 'none', { rx: 0 });
      if (p === 'small') {
        s += boatSide(x + 50, wl, 190, 24, C.hullLight, { outboard: true, wake: true });
        [95, 135, 175].forEach(px => { s += person(x + px, wl - 54, { jacket: true }); });
        s += line(x + 50, wl + 34, x + 240, wl + 34, INK, { sw: 1.2 }) + head(x + 50, wl + 34, Math.PI, INK, 7) + head(x + 240, wl + 34, 0, INK, 7) + T(x + 145, wl + 34, 'under 8 m', { size: 12, weight: 700, fill: INK }) ;
        s += T(x + 145, 40, 'WEAR it', { size: 16, weight: 800, fill: BAD });
        s += lines(x + 145, 244, ['Underway and outdoors on deck:', 'everyone WEARS a flotation device.', 'Children under 15: the skipper is responsible.'], { size: 11.5, lh: 14, fill: INK2 });
      } else {
        s += boatSide(x + 30, wl, 240, 28, C.hullLight, { cabin: 30 });
        s += person(x + 225, wl - 60) + person(x + 250, wl - 60);
        s += rect(x + 60, wl - 50, 44, 26, PAPER2, INK, { rx: 2 }) + rect(x + 64, wl - 46, 11, 18, C.orange, INK, { rx: 2, sw: 0.7 }) + rect(x + 77, wl - 46, 11, 18, C.orange, INK, { rx: 2, sw: 0.7 }) + rect(x + 90, wl - 46, 11, 18, C.orange, INK, { rx: 2, sw: 0.7 });
        s += line(x + 30, wl + 34, x + 270, wl + 34, INK, { sw: 1.2 }) + head(x + 30, wl + 34, Math.PI, INK, 7) + head(x + 270, wl + 34, 0, INK, 7) + T(x + 150, wl + 34, '8 m and over', { size: 12, weight: 700, fill: INK });
        s += T(x + 145, 40, 'CARRY it', { size: 16, weight: 800, fill: SEA });
        s += lines(x + 145, 244, ['Must CARRY a suitable, readily accessible', 'flotation device for every person on board.', 'This duty applies to boats of ALL lengths.'], { size: 11.5, lh: 14, fill: INK2 });
      }
      // white label background for the dimension text
    });
    if (mode === 'both') {
      s += rect(20, 300, 600, 30, PAPER2, LINE) + T(320, 315, 'Stationary at anchor or at a mooring, or inside a cabin: wearing is not required (the devices must still be on board).', { size: 11.5, fill: INK2 });
      s += rect(20, 340, 600, 30, 'none', BAD, { sw: 1.6 }) + T(320, 355, 'Simplified fine from 1 January 2026: NOK 900 per person not wearing, and NOK 900 per missing device', { size: 12, weight: 700, fill: BAD });
    }
    return S.svg(W, H, s, { label: 'Flotation devices: wear under 8 m when underway and outdoors; carry on every boat' });
  }

  // ---------- IL-5 five-knot bathing zone ----------
  function bathingZone(o) {
    o = o || {};
    const W = 640, H = 400;
    let s = rect(0, 0, W, H, SHALLOW, 'none', { rx: 8 });
    // shore along the bottom with a beach
    s += `<path d="M0,330 C80,300 140,316 200,318 C260,320 300,312 360,322 C440,336 520,300 640,318 L640,400 L0,400 Z" fill="${LANDGREEN}"/>`;
    s += `<path d="M120,324 C170,304 260,304 320,322 C330,332 150,340 120,324 Z" fill="${LAND}"/>`;
    // swimming area circle
    const cx = 225, cy = 262, r = 92;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.red}" opacity="0.13"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.red}" stroke-width="2" stroke-dasharray="6 4"/>`;
    s += line(cx, cy, cx + r * 0.71, cy - r * 0.71, C.red, { sw: 1.6 }) + rect(cx + 24, cy - 56, 44, 18, PAPER, C.red, { rx: 4, sw: 1 }) + T(cx + 46, cy - 47, '50 m', { size: 12, weight: 800, fill: C.red });
    s += swimmer(205, 282) + swimmer(240, 296) + swimmer(222, 306);
    // yellow marker buoys enclosing the swimming area
    [[150, 316], [160, 268], [196, 236], [240, 230], [282, 252], [300, 300]].forEach(([bx, by]) => { s += `<circle cx="${bx}" cy="${by}" r="5" fill="${C.yellow}" stroke="${INK}" stroke-width="1"/>`; });
    s += `<path d="M150,316 L160,268 L196,236 L240,230 L282,252 L300,300" fill="none" stroke="${C.yellow}" stroke-width="1.2" stroke-dasharray="3 4"/>`;
    // inner path at 5 knots
    s += curveArrow(30, 212, 230, 150, 430, 180, INK, { sw: 2.2, dash: '7 5' });
    s += boatPlan(150, 190, 34, 13, C.hullLight, 72);
    s += rect(440, 160, 180, 40, PAPER, INK, { rx: 6 }) + lines(530, 173, ['max 5 knots (about 9.2 km/h)', 'within 50 m of bathers or buoys'], { size: 11.5, weight: 700, lh: 14 });
    // outer path
    s += arrow([[30, 90], [600, 90]], INK, { sw: 2.2 }) + boatPlan(300, 90, 40, 15, C.hullLight, 90, { wake: true });
    s += rect(30, 24, 580, 44, PAPER, LINE) + lines(320, 38, ['Normal speed, but always adapt speed so that your wash causes no danger,', 'damage or nuisance to swimmers, paddlers, other boats, quays or wildlife (Section 2).'], { size: 11.5, lh: 14, fill: INK2 });
    // buoy label
    s += rect(318, 290, 300, 50, PAPER, LINE) + lines(468, 303, ['Yellow buoys of a public bathing area:', 'no anchoring, no moving under motor or sail inside;', 'max 5 knots within 50 m of the buoys.'], { size: 11, lh: 13.5, fill: INK2 });
    // signpost
    s += line(600, 395, 600, 352, INK, { sw: 3 }) + rect(576, 338, 48, 22, C.white, INK, { rx: 3 }) + T(600, 349, '5 knots', { size: 10.5, weight: 800, fill: C.black });
    s += T(600, 376, 'local limit', { size: 9.5, fill: C.black, weight: 600 }) + T(600, 387, '(sign)', { size: 9.5, fill: C.black, weight: 600 });
    return S.svg(W, H, s, { label: 'Plan view: 5 knots within 50 m of bathers and bathing-area buoys' });
  }

  // ---------- IL-6 signal flag A ----------
  function flagA(o) {
    o = o || {};
    const W = 360, H = o.labels === false ? 240 : 310, x = 40, y = 20, fw = 300, fh = 200;
    let s = line(x, y - 10, x, y + fh + 20, INK2, { sw: 4 });
    s += `<rect x="${x}" y="${y}" width="${fw / 2}" height="${fh}" fill="#FFFFFF" stroke="#9a9a9a" stroke-width="1"/>`;
    s += `<polygon points="${x + fw / 2},${y} ${x + fw},${y} ${x + fw * 0.75},${y + fh / 2} ${x + fw},${y + fh} ${x + fw / 2},${y + fh}" fill="#0038A8" stroke="#0038A8" stroke-width="1"/>`;
    if (o.labels !== false) {
      s += T(W / 2, 248, 'Signal flag A (Alpha): white at the hoist, blue at the fly, swallow-tailed', { size: 11.5, weight: 700 });
      s += T(W / 2, 268, '"I have a diver down; keep well clear at slow speed"', { size: 11.5, fill: INK2 });
      s += lines(W / 2, 286, ['Pass with caution; power-driven vessels stop', 'the engine if possible (Norwegian Rule 42).'], { size: 11, lh: 13, fill: INK2 });
    }
    return S.svg(W, H, s, { label: 'Signal flag A: white and blue, swallow-tailed' });
  }

  // ---------- IL-7 Rule 44: small craft in a narrow sound ----------
  function narrowSound(o) {
    o = o || {};
    const W = 640, H = 400;
    let s = rect(0, 0, W, H, SHALLOW, 'none', { rx: 8 });
    s += `<path d="M0,0 L250,0 C230,60 262,110 240,160 C222,210 262,260 236,310 C222,350 250,380 244,400 L0,400 Z" fill="${LANDGREEN}"/>`;
    s += `<path d="M640,0 L400,0 C420,50 388,110 410,160 C428,210 392,260 416,310 C430,350 402,380 408,400 L640,400 Z" fill="${LANDGREEN}"/>`;
    s += T(120, 40, 'LAND', { size: 13, weight: 700, fill: '#2f4a1f' }) + T(520, 40, 'LAND', { size: 13, weight: 700, fill: '#2f4a1f' });
    s += ferryPlan(325, 215, 180, 52) + arrow([[325, 118], [325, 76]], INK, { sw: 2.2 });
    s += rect(262, 318, 126, 20, PAPER, INK2, { rx: 4 }) + T(325, 328, 'scheduled ferry', { size: 11, weight: 700 });
    // small motorboat ahead on the ferry's port bow, turning toward its own shore and away
    s += boatPlan(282, 356, 34, 13, C.hullLight, -15) + curveArrow(282, 338, 272, 310, 258, 290, BAD, { sw: 2.2 });
    // small sailing boat coming down the sound, turning toward the right-hand shore
    s += boatPlan(378, 110, 36, 14, C.hullLight, 165, { sail: true }) + curveArrow(382, 128, 392, 156, 404, 180, BAD, { sw: 2.2 });
    s += rect(80, 352, 150, 36, PAPER, BAD, { rx: 5 }) + lines(155, 364, ['small craft keep', 'out of the way (Rule 44)'], { size: 11, weight: 700, lh: 13, fill: BAD });
    s += rect(440, 120, 160, 36, PAPER, BAD, { rx: 5 }) + lines(520, 132, ['sail or motor, open or', 'decked: the duty is the same'], { size: 11, weight: 600, lh: 13, fill: BAD });
    s += T(W / 2, 20, 'Narrow sound, busy fairway or harbour area', { size: 14, weight: 700 });
    return S.svg(W, H, s, { label: 'Plan view of a narrow sound: pleasure craft keep out of the way of a scheduled ferry' });
  }

  // ---------- IL-9 builder's plate ----------
  function builderPlate() {
    const W = 480, H = 300;
    let s = rect(20, 20, 440, 232, '#b9bec3', '#6f757b', { rx: 12, sw: 2 });
    [[34, 34], [446, 34], [34, 238], [446, 238]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="4" fill="#7d8388" stroke="#4d5358" stroke-width="1"/>`; });
    s += T(240, 50, 'EXAMPLE BOATWORKS', { size: 17, weight: 800, fill: '#1a1a1a' });
    s += T(100, 150, 'CE', { size: 64, weight: 800, fill: '#1a1a1a' });
    s += T(100, 196, 'conformity mark', { size: 10, fill: '#333' });
    s += T(170, 104, 'Design category:', { size: 14, anchor: 'start', fill: '#1a1a1a' }) + T(400, 104, 'C', { size: 22, weight: 800, fill: '#1a1a1a' });
    s += `<circle cx="178" cy="138" r="5" fill="#1a1a1a"/>` + rect(172, 145, 12, 14, '#1a1a1a', 'none', { rx: 3 }) + T(196, 148, 'max persons:', { size: 14, anchor: 'start', fill: '#1a1a1a' }) + T(400, 148, '6', { size: 22, weight: 800, fill: '#1a1a1a' });
    s += `<path d="M170,196 L190,196 L186,180 L174,180 Z" fill="#1a1a1a"/><path d="M176,180 q4,-8 8,0" fill="none" stroke="#1a1a1a" stroke-width="2"/>` + T(196, 190, 'max load incl. outboard:', { size: 14, anchor: 'start', fill: '#1a1a1a' }) + T(400, 190, '650 kg', { size: 18, weight: 800, fill: '#1a1a1a' });
    s += T(240, 232, 'Notified body 0123 (only where relevant)', { size: 11, fill: '#333' });
    s += T(240, 276, 'Example values. Real plates differ, but these fields are always there.', { size: 11, fill: MUTED });
    return S.svg(W, H, s, { label: "Example of a builder's plate on a CE-marked boat" });
  }

  // ---------- IL-10 fines ladder (2026 rates) ----------
  function finesChart() {
    const W = 640, H = 400, lx = 292, bx = 304, scale = 300 / 15000, y0 = 52, step = 31, bh = 18;
    const data = [
      [900, 'lifejacket not worn (per person)'], [900, 'one lifejacket missing'], [900, 'licence card not carried'],
      [4000, 'navigation lights fitted but not working'], [5000, 'no boating licence'], [5000, 'over 5 knots within 50 m of bathers'],
      [5000, 'navigation lights not fitted'], [7500, '50-knot boat without high-speed certificate'], [8900, 'lifejackets missing for 10 or more persons'],
    ];
    let s = T(W / 2, 20, 'Simplified on-the-spot fines in NOK (rates from 1 January 2026)', { size: 14, weight: 700 });
    [5000, 10000, 15000].forEach(v => { const x = bx + v * scale; s += line(x, y0 - 10, x, y0 + data.length * step + 2, LINE, { sw: 1 }) + T(x, y0 + data.length * step + 14, v.toLocaleString('en-GB'), { size: 10.5, fill: MUTED }); });
    data.forEach(([v, label], i) => {
      const y = y0 + i * step;
      s += T(lx, y + bh / 2, label, { size: 12, anchor: 'end', fill: INK2 });
      s += rect(bx, y, v * scale, bh, SEA, 'none', { rx: 4 });
      s += T(bx + v * scale + 8, y + bh / 2, v.toLocaleString('en-GB'), { size: 12, weight: 700, anchor: 'start' });
    });
    const capX = bx + 15000 * scale, yEnd = y0 + data.length * step;
    s += line(capX, y0 - 14, capX, yEnd + 2, BAD, { sw: 2, dash: '6 4' });
    s += T(capX - 6, y0 - 20, 'cap: no simplified fine above NOK 15,000 in total', { size: 11, weight: 700, fill: BAD, anchor: 'end' });
    s += T(W / 2, H - 14, 'Several offences at once: the highest fine in full, the rest reduced by half. Source: regulation 2001-634.', { size: 10.5, fill: MUTED });
    return S.svg(W, H, s, { label: 'Bar chart of simplified fines in NOK, 2026 rates' });
  }

  // ---------- IL-11 who is responsible ----------
  function responsible() {
    const W = 640, H = 310;
    const cols = [
      [110, 'Owner', ['must make sure anyone using the', 'boat is qualified to operate it', '(Section 35); liable together', 'with the operator (Section 27)']],
      [320, 'Skipper (operator)', ['responsible for the boat, its speed,', 'lights and lookout, keeping the', 'alcohol limit, and children under 15', 'wearing flotation devices']],
      [530, 'Passenger aged 15 or over', ['responsible for wearing their', 'own flotation device', '(fined personally: NOK 900)']],
    ];
    let s = '';
    cols.forEach(([x, title, txt], i) => {
      s += person(x, 42, { jacket: i === 2 }) + T(x, 96, title, { size: 14, weight: 700 }) + lines(x, 118, txt, { size: 11.5, lh: 15, fill: INK2 });
    });
    s += arrow([[110, 185], [110, 236]], INK2) + arrow([[320, 185], [320, 236]], INK2);
    s += rect(40, 238, 360, 52, PAPER2, INK2) + lines(220, 256, ['Compliance with the Small Craft Act:', 'both the owner and the operator are responsible (Section 27)'], { size: 12, weight: 600, lh: 16 });
    return S.svg(W, H, s, { label: 'Owner, skipper and passenger responsibilities' });
  }

  BOAT.register({
    id: 'exam-and-law',
    title: 'The exam, the licence and the law',
    order: 1,
    examShare: 7,
    examWeight: 'about 7 of 50 questions',
    summary: 'How the Norwegian boating licence exam is built and scored, who must hold the licence, and the Norwegian rules every skipper is tested on: age limits, alcohol, flotation devices, speed, the supplementary rules for narrow waters, duties to assist, and the paperwork and fines around a boat.',
    sections: [
      // 1 ------------------------------------------------------------
      {
        id: 'the-exam',
        title: 'The exam: 50 questions, two pass rules',
        html: `<p>This topic covers the exam itself and the Norwegian laws that sit around the international Rules of the Road: who needs the licence, how old you must be, how much you may drink, when a lifejacket must be worn, how fast you may go near swimmers, and what the police fine you for. On the official syllabus this is mainly <strong>part 2, laws and regulations</strong>, but two items belong to <strong>part 4, the "particularly important topics"</strong>: the alcohol limit for boats up to 15 m and the rules on flotation devices (item 1.4.5). The dangers of high speed (1.4.7) and Norwegian Rules 43 and 44 on small craft in narrow waters (part of 1.4.3) are also part 4 and are taught here.</p>
<p>The exam is a computer-based multiple-choice test at an approved test centre: <strong>50 questions in 60 minutes</strong>. Two conditions must both be true to pass:</p>
<div class="callout rule"><p><strong>Pass rule 1:</strong> at least 80 % correct overall, so at most 10 wrong out of 50.<br><strong>Pass rule 2:</strong> in part 4 you may have <strong>at most 2 wrong</strong>, whatever you scored elsewhere.</p></div>
<p>The second rule is the one that catches people: 47 of 50 correct is still a fail if the three mistakes are all part-4 questions. The Authority does not publish how many questions each part has (roughly a quarter each), so simply aim to get every part-4 question right.</p>
<p>Practicalities: you may sit the exam from <strong>age 14</strong>; the licence card is issued when you turn <strong>16</strong>. Registration costs <strong>NOK 940</strong> (2026) and covers one attempt and the card; after a fail you may retake no earlier than <strong>14 days</strong> later, at <strong>NOK 495</strong> per attempt. You are handed chart extracts and may use a calculator with cleared memory, ruler or parallel ruler, dividers, pencil and scratch paper. A mobile phone is not allowed, not even as a calculator. The exam can be taken in English on request, and no course is compulsory.</p>
<div class="callout tip"><p>Exam tip: read every question about alcohol, lifejackets, who gives way, sea marks, lights, 120 / channel 16 or high speed twice. Two mistakes is the whole part-4 budget.</p></div>`,
        illustration: () => examBar(),
        caption: 'The exam at a glance: 50 questions in 60 minutes, roughly a quarter from each curriculum part, at least 40 correct overall and at most 2 wrong in part 4.',
        keyFacts: ['50 questions, 60 minutes, multiple choice, at an approved test centre', 'Pass: at least 40 of 50 correct AND at most 2 wrong in part 4', 'You can fail with only 3 errors if all three are in part 4', 'Sit at 14, licence issued at 16; fee NOK 940, retake after 14 days for NOK 495', 'Allowed: calculator (cleared), ruler, dividers, pencil; no phone'],
        check: { id: 'exam-c1', q: 'You answer 46 questions correctly, but 3 of your 4 mistakes are in part 4 ("particularly important topics"). What is the result?', options: ['Pass: 92 % is well above the 80 % pass mark', 'Pass, but you must retake part 4 within 14 days', 'Fail: part 4 allows at most 2 wrong answers', 'Fail: any single error in part 4 fails the exam'], answer: 2, explanation: 'Both pass rules must hold. 46/50 clears the 80 % rule, but more than two errors in part 4 fails you regardless of the total.' },
      },
      // 2 ------------------------------------------------------------
      {
        id: 'who-needs',
        title: 'Who must hold the boating licence',
        html: `<p>The licence requirement was introduced on 1 May 2010 to raise the basic competence of people driving the bigger and faster recreational boats, without forcing a whole generation of experienced skippers back to school. That is why it is tied to a birth date rather than to everyone.</p>
<div class="callout rule"><p>Anyone <strong>born on or after 1 January 1980</strong> must hold a boating licence (or an equivalent qualification) to operate a Norwegian recreational craft under 15 m that <strong>either</strong> is <strong>longer than 8 m</strong> (26.25 ft) <strong>or</strong> has an engine of <strong>more than 25 hp (19 kW)</strong>. Licence regulation of 3 March 2009, Section 7.</p></div>
<p>Read the thresholds as alternatives. A 5 m dinghy with a 30 hp outboard needs a licence; a 9 m sailing boat with a 15 hp engine also needs one. Only when the boat is both 8 m or shorter and 25 hp or less can a person born in 1980 or later drive it without a licence. "Length" means hull length (ISO 8666). The date is a hard line: born 31 December 1979 is exempt; born 1 January 1980 is not.</p>
<p>Being born before 1980 exempts you from the licence only. Age limits, the alcohol limit, the flotation-device rules, speed rules and the high-speed certificate apply to everyone. The owner also has a duty: whoever lets another person use the boat must make sure that person is entitled to operate it (Small Craft Act, Section 35).</p>
<p>The licence entitles you to operate recreational craft <strong>up to 15 m</strong> (49.21 ft). Boats of 15 m up to 24 m need a recreational skipper certificate, D5L (coastal) or D5LA (unrestricted): minimum age 18, a 120-hour course and sea time. Holders of D5L, D5LA or a deck-officer certificate get the boating licence without the exam. When operating you must be able to show a valid licence on request; the Authority may also issue it digitally. For use abroad an International Certificate of Competence (ICC) is available from age 16 after the exam, a practical test and a health declaration.</p>`,
        illustration: () => licenceFlow(),
        caption: 'Decision chart for the licence requirement. The two thresholds in the second diamond are alternatives: exceeding either one triggers the requirement.',
        keyFacts: ['Born on or after 1 Jan 1980 + boat over 8 m OR engine over 25 hp (19 kW) = licence required', 'Born before 1980: no licence needed, but every other rule still applies', 'The licence covers recreational craft up to 15 m; 15 to 24 m needs D5L/D5LA', 'The owner must check that the person using the boat is qualified (Section 35)', 'Carry the licence (or the digital version) and show it on request'],
        check: { id: 'exam-c2', q: 'Kari was born in 1990. She wants to drive a 6 m boat with a 30 hp outboard. Does she need a boating licence?', options: ['No, the boat is under 8 m', 'No, boats under 50 hp are exempt', 'Yes, because the engine is more powerful than 25 hp', 'Only if the boat can exceed 10 knots'], answer: 2, explanation: 'Either threshold is enough: over 8 m OR over 25 hp. 30 hp exceeds 25 hp, so she needs the licence even though the boat is short.' },
      },
      // 3 ------------------------------------------------------------
      {
        id: 'age-and-speed-cert',
        title: 'Age limits and the high-speed certificate',
        html: `<p>Young people may drive boats, but the law keeps the engine small until they are 16 and keeps the fastest boats for adults with extra training. Three ages matter for the exam, and one date.</p>
<div class="callout rule"><p>You must be <strong>16</strong> to operate a recreational craft with an engine of more than <strong>10 hp (7.5 kW)</strong>. Under 16 you may drive a boat of at most 10 hp and at most 8 m, because anything longer needs a licence and the licence is only issued at 16.</p></div>
<p>Older course books add a third limit for under-16s: the boat must not be capable of more than 10 knots. That rule was <strong>abolished on 1 July 2021</strong>; only the 10 hp and 8 m limits remain. If a question offers "cannot exceed 10 knots" for under-16s, it is the outdated distractor. From age 13 young people may drive bigger engines in organised training or competition with safety supervision.</p>
<p>At the other end sits the <strong>high-speed certificate</strong>. Since <strong>1 June 2023</strong> anyone operating a motorised recreational craft under 24 m, including a water scooter, that is <strong>capable of 50 knots or more</strong> must hold it in addition to the ordinary requirements for the boat. The course (at least 6 hours of theory plus practical training) may be taken from 17; the certificate is issued from <strong>age 18</strong>. It applies to everyone, so a skipper born in 1975 who needs no boating licence still needs it for a 50-knot boat. Driving such a boat without it costs NOK 7,500.</p>
<p>Practice driving is allowed under the supervision of someone who is entitled to operate that boat and meets the requirements for a licence-requiring boat; during practice the supervisor counts as the operator.</p>
<div class="callout warn"><p>Do not confuse the 10 hp age limit (under-16s) with the 25 hp licence limit (born 1980 or later). A 15-year-old with a passed exam still may not drive a 40 hp boat, and the owner who lets them is fined too (NOK 5,000 each).</p></div>`,
        illustration: () => ageLadder(),
        caption: 'Age steps: 13 competition only, 14 sit the exam, 16 licence and more than 10 hp, 17 high-speed course, 18 high-speed certificate and D5L. The 10-knot rule for under-16s is history.',
        keyFacts: ['16 to operate more than 10 hp (7.5 kW); under 16: max 10 hp AND max 8 m', 'The "10 knots" limit for under-16s was abolished 1 July 2021', 'High-speed certificate since 1 June 2023 for boats capable of 50 knots or more', 'High-speed course from 17, certificate issued from 18; fine without it NOK 7,500', 'Practice driving is allowed with a qualified supervisor, who counts as the operator'],
        check: { id: 'exam-c3', q: 'Lisa is 15 and has passed the boating exam. Which boat may she operate on her own?', options: ['A 5.5 m boat with a 40 hp engine, since she has passed', 'A 7 m boat with a 10 hp engine', 'A 9 m sailing boat with a 10 hp engine', 'Any boat that cannot exceed 10 knots'], answer: 1, explanation: 'Under 16 the limits are 10 hp and 8 m. Her certificate is not issued until 16, so the 40 hp boat and the 9 m boat are out, and the 10-knot rule no longer exists.' },
      },
      // 4 ------------------------------------------------------------
      {
        id: 'alcohol',
        title: 'Alcohol and fitness: 0.8 and 0.2',
        html: `<p>Alcohol slows reactions and blunts judgement exactly when a boat needs both, and cold water forgives nothing. This is a part-4 item: the exam asks for the number and tests which boats it applies to.</p>
<div class="callout rule"><p>Small Craft Act, Section 33: nobody may operate or attempt to operate a <strong>small craft (under 15 m)</strong> under the influence of alcohol or other intoxicants. The operator is always deemed under the influence with a blood alcohol level <strong>above 0.8 per mille (0.8 &permil;)</strong> or a breath alcohol level <strong>above 0.4 mg per litre of air</strong>.</p></div>
<p>Section 33 applies to small craft with an engine, to sailing boats of 4.5 m or longer, and to boats carrying paying passengers. A 4 m rowing boat or a short sailing dinghy without an engine is outside the 0.8 rule, but Section 32 still forbids anyone unfit because of alcohol, illness, fatigue or medication from operating any small craft.</p>
<p>For <strong>ships of 15 m or more</strong> the Maritime Code (Section 143) is far stricter: <strong>0.2 &permil;</strong> blood alcohol or 0.1 mg/l of breath, for the master and anyone with a safety-critical duty. Remember the pair as 0.8 under 15 m, 0.2 from 15 m.</p>
<p>After an incident that may lead to a police investigation, the operator must not drink or take intoxicants during the first <strong>six hours</strong> after the trip ended. The police may breath-test you on suspicion, after an accident or during a routine control, and may require a blood test. Breaking the rules is punished with fines or <strong>prison for up to one year</strong>, and a conviction leads to <strong>loss of the right to operate</strong> licence-requiring boats for at least one year, up to five in aggravated cases (over 2.0 &permil;, a serious accident or a repeat within five years); you must then pass the exam again. The only exemption is an emergency: the rules do not apply to someone operating a boat to save life or property from serious danger.</p>
<div class="callout tip"><p>Three numbers: 0.8 blood under 15 m, 0.4 breath under 15 m, 0.2 blood from 15 m. A distractor offering "0.4 &permil;" mixes up breath and blood.</p></div>`,
        illustration: () => alcoholGraphic(),
        caption: 'Alcohol limits: 0.8 per mille blood (0.4 mg/l breath) for small craft under 15 m; 0.2 per mille (0.1 mg/l) for ships of 15 m and over.',
        keyFacts: ['Under 15 m: 0.8 per mille blood or 0.4 mg/l breath (Small Craft Act, Section 33)', '15 m and over: 0.2 per mille blood or 0.1 mg/l breath (Maritime Code, Section 143)', 'Covered: boats with an engine, sailing boats 4.5 m or longer, commercial passenger boats', 'No alcohol for 6 hours after an incident that may be investigated', 'Penalty: fine or up to 1 year in prison, and loss of the right to operate for at least 1 year'],
        check: { id: 'exam-c4', q: 'The skipper of a 9 m sailing boat with an inboard engine has 0.9 per mille alcohol in his blood. Which statement is correct?', options: ['Legal: sailing boats are not covered by the alcohol rule', 'Legal: the limit for small craft is 1.0 per mille', 'Illegal: the limit for boats under 15 m is 0.8 per mille', 'Illegal only if the engine is running'], answer: 2, explanation: 'A sailing boat of 4.5 m or longer (and any boat with an engine) is covered by Section 33, and 0.9 exceeds the 0.8 per mille limit. Sails or engine makes no difference.' },
      },
      // 5 ------------------------------------------------------------
      {
        id: 'lifejackets',
        title: 'Flotation devices: wear it or carry it',
        html: `<p>Most people who drown from recreational boats end up in the water unexpectedly, and a lifejacket you are not wearing is of no use in the first minute. The law therefore has two duties that exist side by side, and the exam loves to test whether you can keep them apart.</p>
<div class="callout rule"><p><strong>Wearing duty</strong> (Small Craft Act, Section 23a, since 1 May 2015): in recreational craft <strong>shorter than 8 m</strong>, everyone must <strong>wear</strong> a suitable flotation device when they are <strong>outdoors on the boat while it is underway</strong>.<br><strong>Carrying duty</strong> (Section 23 and the 1995 flotation-equipment regulation): <strong>every</strong> recreational craft, of any length, must when underway <strong>carry</strong> suitable rescue and flotation equipment for every person on board, stored so that it is readily accessible.</p></div>
<p>Each person aged 15 or over is responsible for wearing their own device. For <strong>children under 15</strong> the <strong>skipper</strong> is responsible. The wearing duty pauses when the boat is stationary at anchor or at a mooring, and it does not apply inside a cabin, but the devices must still be on board. "Suitable" means a lifejacket, buoyancy aid or flotation clothing that is CE-marked or wheel-marked as a personal flotation device. Two exemptions exist: participants in organised sport or competition who follow their organisation's safety rules, and rental rowing or pedal boats on lakes of at most 0.5 km² or within 500 m of the shore under staff supervision.</p>
<p>The police enforce this with simplified on-the-spot fines. From 1 January 2026 the fine is <strong>NOK 900 per person</strong> not wearing a device; for children under 15 the skipper pays, NOK 900 for one child rising to NOK 8,900 for ten or more. Not carrying devices on board costs NOK 900 per missing device on the same scale. The older figure of NOK 500 that many course books quote is no longer current.</p>
<div class="callout warn"><p>"The boat is over 8 m, so no lifejackets are needed" is wrong. Over 8 m you need not wear them while underway, but you must still carry an accessible device for every single person on board.</p></div>`,
        illustration: () => lifejacketPanels('both'),
        caption: 'Left: under 8 m, underway and outdoors, everyone wears a flotation device. Right: on every boat, whatever its length, a suitable device must be carried for every person on board.',
        keyFacts: ['Under 8 m, underway, outdoors: everyone WEARS a flotation device (since 1 May 2015)', 'All boats, any length: CARRY an accessible device for every person on board', 'Adults (15+) are responsible for themselves; the skipper is responsible for children under 15', 'Not required while stationary at anchor/mooring or inside a cabin', 'Fine from 2026: NOK 900 per person not wearing, NOK 900 per missing device'],
        check: { id: 'exam-c5', q: 'Four adults and a 12-year-old are underway in a 7 m open boat. Who is responsible if the child is not wearing a flotation device?', options: ['The child', 'The skipper', 'The boat owner, even if not on board', 'Nobody; the duty only applies to adults'], answer: 1, explanation: 'Section 23a makes the skipper responsible for children under 15; each adult (15 or over) is responsible for wearing their own device.' },
      },
      // 6 ------------------------------------------------------------
      {
        id: 'speed-rules',
        title: 'Speed: five knots near bathers, local limits, your wash',
        html: `<p>A boat has no brakes and its wash travels far beyond the hull, so Norwegian law ties speed to the people and places around you rather than to a single national limit. Three layers matter.</p>
<div class="callout rule"><p><strong>General duty</strong> (Speed Limits at Sea Regulation, Section 2): everyone operating a vessel must exercise care and adapt speed to visibility, the waters and the vessel's size and manoeuvrability, so that wash or anything else causes no danger, damage or nuisance to people (including swimmers and paddlers), other vessels, quays, aquaculture installations, shorelines, wildlife or birds.</p></div>
<div class="callout rule"><p><strong>The 5-knot rule</strong> (Section 3): vessels must not exceed <strong>5 knots</strong> (about 9.2 km/h) within <strong>50 m</strong> of places where bathing is in progress, or within 50 m of the marker buoys of a public bathing area. Inside such buoys it is forbidden to anchor or to move under motor or sail at all (emergency services excepted).</p></div>
<p>Note what the national rule is tied to: bathers and bathing-area buoys, not the shoreline in general. The speed limits you see in harbours and narrow sounds are <strong>local limits</strong>: municipalities set them in their own sea areas and the Norwegian Coastal Administration elsewhere. They are published as regulations and marked with approved signs, commonly 5 knots, so look for the signs. The 2009 and 1983 speed regulations named in the printed syllabus were repealed; the rules now live in the Speed Limits at Sea Regulation of 2021.</p>
<p>Exceeding 5 knots within 50 m of bathers, anchoring or moving under motor or sail inside bathing-area buoys, and exceeding a local speed limit each carry a simplified fine of <strong>NOK 5,000</strong> (2026). More importantly, a planing boat near a beach can kill: a swimmer's head is almost invisible from a fast boat, and wash can swamp a kayak or knock a child off a jetty.</p>
<div class="callout tip"><p>"50 m, 5 knots" is the pair to memorise. Distractors will offer 3 or 10 knots, or 100 or 200 m. If people are swimming there, 5 knots inside 50 m.</p></div>`,
        illustration: () => bathingZone(),
        caption: 'Within 50 m of bathers or of the yellow buoys of a public bathing area: at most 5 knots, and no anchoring or motor/sail inside the buoys. Elsewhere, adapt speed so your wash harms nobody (Speed Limits at Sea Regulation, Sections 2 and 3).',
        keyFacts: ['Max 5 knots (about 9.2 km/h) within 50 m of bathers or of public bathing-area buoys', 'Inside bathing-area buoys: no anchoring, no moving under motor or sail', 'Always adapt speed so wash causes no danger, damage or nuisance (Section 2)', 'Local speed limits are set by municipalities (own sea area) or the Coastal Administration, and marked by signs', 'Fine for each of these offences: NOK 5,000 (2026)'],
        check: { id: 'exam-c6', q: 'You pass a beach where people are swimming. Which rule applies?', options: ['Max 5 knots within 50 m of the bathers', 'Max 10 knots within 100 m of the shoreline', 'Max 3 knots within 200 m of any beach', 'No national rule; only local limits apply'], answer: 0, explanation: 'Section 3 of the Speed Limits at Sea Regulation: at most 5 knots within 50 m of places where bathing is in progress or of public bathing-area buoys.' },
      },
      // 7 ------------------------------------------------------------
      {
        id: 'high-speed',
        title: 'The dangers of high speed',
        html: `<p>Modern outboards make 30 or 40 knots ordinary, and the syllabus lists "dangers associated with high speed" as a part-4 item (1.4.7). The questions are about what speed does to you, your boat and the people around you.</p>
<p><strong>Your eyes narrow.</strong> At speed your useful field of vision shrinks toward the point you are steering at: tunnel vision. Objects at the edges, a swimmer, a kayak or a floating log, register late or not at all. The faster you go, the more deliberately you must scan from side to side, and the harder a proper lookout becomes.</p>
<p><strong>Distance disappears.</strong> One knot is 1,852 m per hour, so 30 knots is about 15 m every second: in the ten seconds it takes to notice, decide and react, you have travelled about 150 m. Doubling speed roughly quadruples the energy in a collision, which is why high-speed accidents cause high-energy injuries: people thrown against the boat or overboard, broken bones and head injuries.</p>
<p><strong>Electronics lag.</strong> A chart plotter or phone app shows where you were a moment ago, and at speed that is already astern of you. Position updates and screen redraws introduce delay. Use the plotter to plan and confirm, keep your eyes outside the boat, and slow down before a narrow passage or unfamiliar waters.</p>
<p><strong>Keep off the shore.</strong> Near land you have less water, rocks close to the surface, swimmers and small craft, and your wash hits beaches, jetties and moored boats. Distance from the shore buys reaction time and keeps your wash harmless. At night or in poor visibility, speed must come down to what you can stop within.</p>
<p>The law adds hard edges: the duty to adapt speed (Section 2), the 5-knot bathing rule, the high-speed certificate for boats capable of 50 knots or more, and fines of NOK 5,000 to 7,500. A kill cord that stops the engine if you are thrown from the helm is strongly recommended, although not yet a legal duty.</p>
<div class="callout tip"><p>If a high-speed question asks what to do, the answer is almost always "reduce speed".</p></div>`,
        keyFacts: ['High speed narrows your field of vision (tunnel vision) and weakens your lookout', '30 knots is about 15 m per second: about 150 m in a 10-second reaction', 'Collision energy grows with the square of speed: high-energy injuries', 'Plotters and apps lag; at speed the screen shows where you were', 'Keep well off the shore; reduce speed in darkness, poor visibility and narrow waters'],
        check: { id: 'exam-c7', q: 'Why is a chart plotter a poor sole reference when driving at high speed?', options: ['It only works below 20 knots', 'Its position and screen update with a delay, so at speed it shows where you were, not where you are', 'It switches off automatically above 30 knots', 'Chart plotters are not permitted on recreational craft'], answer: 1, explanation: 'Electronic equipment introduces delay. At 30 knots you cover 15 m every second, so a position a few seconds old is already astern. Keep your eyes outside the boat and slow down.' },
      },
      // 8 ------------------------------------------------------------
      {
        id: 'narrow-waters',
        title: 'Norwegian Rules 43 and 44: small craft in narrow waters',
        html: `<p>The international Rules of the Road (COLREG) apply in Norwegian waters, including inland waters, but Norway adds a chapter of supplementary rules. Four are on the syllabus by number: Rules 43, 44, 45 and 54. Rules 43 and 44 are part-4 material because they decide who moves when a ferry meets a dinghy in a narrow sound.</p>
<div class="callout rule"><p><strong>Rule 44:</strong> pleasure craft and open boats propelled by oars, sail or engine shall as far as possible keep out of the way of larger vessels, scheduled ferries and other commercial traffic when passing a <strong>narrow channel, a heavily trafficked fairway or a harbour area</strong>.</p></div>
<div class="callout rule"><p><strong>Rule 43:</strong> a rowing boat, and a power-driven or sailing vessel that shows only a single all-round white light (the small, slow boat of COLREG Rule 23(d): under 7 m, at most 7 knots), must, when approaching or being approached by other vessels, manoeuvre with caution, go at reduced speed, stop if necessary, and keep well clear.</p></div>
<p>Rule 44 does not give commercial vessels a blanket right of way. In open water, away from fairways and harbours, the ordinary COLREG steering rules decide who gives way, cargo ship or not. Rule 44 bites in confined, busy waters, where a large vessel cannot stop or turn in time and a sailing boat tacking across the channel endangers everyone. The duty covers sail and motor, open boats and decked pleasure craft alike.</p>
<p>The rest of the chapter is quick. <strong>Rule 41</strong>: a power-driven vessel announces its arrival at a narrow channel with one prolonged blast of at least 10 seconds, about half a mile away. <strong>Rule 42</strong>: when a vessel shows signal flag A, others pass with caution and power-driven vessels stop their engine if possible (next section). <strong>Rule 45</strong>: vessels and floating objects must not, without compelling necessity, be anchored or moored so that they obstruct or may damage other vessels. <strong>Rule 54</strong>: every decked Norwegian vessel must carry a copy of the collision regulations.</p>
<div class="callout tip"><p>Narrow, busy or harbour: small craft keep clear. Open water: normal COLREG rules.</p></div>`,
        illustration: () => narrowSound(),
        caption: 'Rule 44 in practice: in a narrow sound both the small motorboat and the small sailing boat keep out of the way of the scheduled ferry. In open water the ordinary COLREG steering rules apply.',
        keyFacts: ['Rule 44: pleasure craft and open boats (oars, sail or engine) keep out of the way of larger vessels, scheduled ferries and commercial traffic in narrow channels, busy fairways and harbour areas', 'Rule 43: rowing boats and vessels showing only one all-round white light slow down, stop if necessary and keep well clear', 'Rule 44 is not blanket right of way: in open water ordinary COLREG rules decide', 'Rule 45: do not anchor or moor so you obstruct other vessels', 'Rule 54: a decked Norwegian vessel must carry a copy of the collision regulations'],
        check: { id: 'exam-c8', q: 'In a narrow sound a scheduled ferry is approaching your 6 m motorboat. According to Norwegian Rule 44 you should:', options: ['Hold your course; a power-driven vessel on your port side must give way', 'Sound five short blasts and continue', 'Keep out of the way of the ferry as far as possible', 'Overtake the ferry quickly so you are not in its way'], answer: 2, explanation: 'Rule 44: in a narrow channel, busy fairway or harbour area, pleasure craft and open boats keep out of the way of larger vessels, scheduled ferries and other commercial traffic.' },
      },
      // 9 ------------------------------------------------------------
      {
        id: 'divers-skiers-scooters',
        title: 'Divers, water-skiers and water scooters',
        html: `<p>Three activities turn up in exam questions because they put people in the water or move fast close to others. Each has a simple rule.</p>
<h4>Flag A: diver down</h4>
<p>A boat or buoy showing international signal flag A (Alpha) has divers in the water. The flag is divided vertically: <strong>white</strong> in the half nearest the hoist, <strong>blue</strong> in the outer half, with a <strong>swallow-tail</strong> notch cut into the outer edge. It is not the red flag with a white diagonal stripe used in North America. Its meaning is "I have a diver down; keep well clear at slow speed". Norwegian Rule 42 turns this into a duty: other vessels must pass with caution, and power-driven vessels must, if possible, stop their engine. Divers can surface up to about <strong>300 m</strong> from the flag, so give a wide berth at slow speed. There is no statutory metre figure; the "50 m" sometimes quoted is a safety recommendation from diving organisations.</p>
<h4>Towing a water-skier</h4>
<p>No special statute governs water-skiing, so the Rules of the Road and the speed and wash rules apply in full. The expected exam answer reflects good practice: the towing boat should carry <strong>two people</strong>, a driver who watches ahead and to the sides and a lookout who watches the skier, and towing must not take place near bathing areas, in harbour basins or in heavy traffic.</p>
<h4>Water scooters</h4>
<p>Since the water-scooter regulation was repealed on <strong>18 May 2017</strong>, a jet ski is legally just another recreational boat: 16 years for more than 10 hp, a boating licence above 25 hp (which means practically all of them), the 0.8 per mille limit, the flotation-device duty, the speed rules and the high-speed certificate above 50 knots. The old national no-go belts of 400 m from land at sea and 500 m inland no longer exist, but municipalities may restrict water scooters locally and they remain banned in some protected areas.</p>`,
        illustration: () => flagA(),
        caption: 'Signal flag A: white half at the hoist, blue half at the fly with a swallow-tail. Divers may be up to about 300 m away: pass with caution at slow speed and stop the engine if possible (Rule 42).',
        keyFacts: ['Flag A: white at the hoist, blue at the fly, swallow-tailed = "I have a diver down"', 'Rule 42: pass with caution; power-driven vessels stop the engine if possible; divers may be up to 300 m away', 'Water-skiing: two people in the towing boat (driver and lookout); not near bathers, harbours or heavy traffic', 'Water scooters are ordinary recreational boats since 18 May 2017: same licence, age, alcohol and lifejacket rules', 'The old 400 m / 500 m water-scooter zones no longer apply; local municipal rules may'],
        check: { id: 'exam-c9', q: 'A boat 200 m ahead shows a flag that is white at the hoist and blue at the fly with a swallow-tail. What must you do?', options: ['Keep at least 200 m away; that is the legal minimum', 'Pass with caution at slow speed and stop your engine if possible', 'Nothing special; it is a yacht-club pennant', 'Sound one prolonged blast and hold your course'], answer: 1, explanation: 'This is signal flag A: divers are down. Norwegian Rule 42 requires caution and slow speed, with power-driven vessels stopping the engine if possible. The law states no metre figure.' },
      },
      // 10 -----------------------------------------------------------
      {
        id: 'duties',
        title: 'Duties to assist and report, and who is responsible',
        html: `<p>The sea is a place where help may be a long way off, so the law makes every master a potential rescuer and spells out who answers for what on board.</p>
<div class="callout rule"><p><strong>Duty to assist</strong> (Maritime Code, Section 135): the master must, as far as possible without serious danger to the own vessel or those on board, give all possible and necessary assistance to anyone in distress at sea or threatened by danger at sea.</p></div>
<p>After a <strong>collision</strong> (Section 164) the master must help the other vessel, its crew and passengers as far as possible without special danger to the own vessel, and must give the other vessel the own vessel's name, home port, port of departure and destination. <strong>Accidents</strong> involving serious injury, grounding or collision must be notified without delay; a recreational craft may notify the police instead of the rescue centre, and a written report to the Norwegian Maritime Authority is due within <strong>72 hours</strong>.</p>
<p>To raise the alarm, use <strong>VHF channel 16</strong> (or the DSC distress button), or telephone <strong>120</strong> for the coast radio service and <strong>112</strong> for general emergencies. Since 1 January 2026 the coast radio service is run by the Joint Rescue Coordination Centre; number and channel are unchanged.</p>
<h4>Owner, skipper, passenger</h4>
<p>Both the owner and the operator are responsible for compliance with the Small Craft Act (Section 27). The owner, or whoever controls the boat, must make sure that anyone they let use it is entitled to operate it (Section 35): lending a 40 hp boat to a 15-year-old costs the owner NOK 5,000 as well as the teenager. The skipper is responsible for the boat and the safety of everyone on board: speed, lights, lookout, the alcohol limit and the flotation devices of children under 15. Every recreational craft must have the equipment needed to protect the safety and health of those on board (Section 22), which is why overloading beyond the builder's plate breaches the skipper's duty. Passengers aged 15 or over answer for one thing themselves: wearing their own flotation device under 8 m.</p>`,
        illustration: () => responsible(),
        caption: 'Who is responsible: the owner checks that the user is qualified and is liable with the operator; the skipper answers for the boat and the people on board; passengers of 15 and over wear their own flotation device.',
        keyFacts: ['Duty to assist anyone in distress at sea, unless it puts your own vessel and crew in serious danger (Maritime Code, Section 135)', 'After a collision: help, and exchange name, home port, departure port and destination (Section 164)', 'Alarm: VHF channel 16 / DSC, telephone 120 (coast radio) or 112; written accident report to the Maritime Authority within 72 hours', 'Owner and operator are both responsible under the Small Craft Act (Section 27); the owner must check the user is qualified (Section 35)', 'The skipper answers for speed, lights, lookout, alcohol and children under 15 wearing flotation devices'],
        check: { id: 'exam-c10', q: 'You see a capsized kayak with a person clinging to it. What does the law require of you?', options: ['Call 120 and continue; rescue is the coast radio’s job', 'Render all possible assistance unless it puts your own vessel and crew in serious danger', 'Assist only if you are a commercial vessel', 'Assist only if you caused the capsize'], answer: 1, explanation: 'Maritime Code, Section 135: every master must give all possible and necessary assistance to anyone in distress at sea, as far as possible without serious danger to the own vessel and those on board.' },
      },
      // 11 -----------------------------------------------------------
      {
        id: 'boat-paperwork',
        title: 'CE marking, registration, insurance and the right to roam',
        html: `<p>The exam expects you to know what the paperwork around a boat means and which parts of it are voluntary. The surprise for many candidates is how little is compulsory.</p>
<h4>CE marking and the builder's plate</h4>
<p>Recreational craft with a hull length of <strong>2.5 to 24 m</strong> must be CE-marked before they are placed on the market or used for the first time in the EEA; this also applies to a used boat imported from outside the EEA. A CE boat carries a <strong>builder's plate</strong> showing the manufacturer's name, the maximum load including the outboard engine in kg, the <strong>maximum number of persons</strong>, the <strong>design category</strong> A, B, C or D, the CE symbol and, where relevant, the notified-body number. It also has a 15-character hull identification number (CIN) on the starboard side of the transom, an owner's manual and a declaration of conformity. The categories tell you what the boat is built for: <strong>A</strong> ocean (above Beaufort 8, waves above 4 m), <strong>B</strong> offshore (up to Beaufort 8 and 4 m), <strong>C</strong> inshore (up to Beaufort 6 and 2 m), <strong>D</strong> sheltered (up to Beaufort 4 and 0.3 m). Never exceed the plate's persons or load figures.</p>
<h4>Registration and insurance</h4>
<p>Registration of boats under 15 m in the Small Boat Register is <strong>voluntary</strong>; the register is run by the Norwegian Society for Sea Rescue and helps identify stolen boats and their owners (NOK 480 to register, NOK 249 per year). Boat insurance is <strong>not required by law</strong>, but strongly recommended.</p>
<h4>Where you may go</h4>
<p>Under the Outdoor Recreation Act everyone has free passage by boat on the sea. You may pull a boat ashore for a short time on uncultivated land and bathe from shore or boat at a reasonable distance from inhabited houses, but you may not use a private quay or jetty without the owner's consent. On inland waters the Motor Traffic Act allows motorboats on lakes of <strong>2 km² or more</strong> and on navigable rivers; on smaller lakes motor use is prohibited unless the municipality permits it.</p>`,
        illustration: () => builderPlate(),
        caption: "A builder's plate (example values): manufacturer, CE symbol, design category, maximum persons and maximum load including the outboard. Categories: A ocean, B offshore (Beaufort 8, 4 m), C inshore (Beaufort 6, 2 m), D sheltered (Beaufort 4, 0.3 m).",
        keyFacts: ['CE marking is required for recreational craft with hull length 2.5 to 24 m, including used imports from outside the EEA', "Builder's plate: manufacturer, max load incl. outboard, max persons, design category, CE symbol", 'Design categories: A ocean (>Bf 8, >4 m), B offshore, C inshore (Bf 6, 2 m), D sheltered (Bf 4, 0.3 m)', 'Small Boat Register: voluntary, run by the Norwegian Society for Sea Rescue; insurance: not required by law', 'Free passage by boat on the sea; no use of private quays without consent; motorboats on lakes of 2 km² or more'],
        check: { id: 'exam-c11', q: 'Registration of a 7 m recreational boat in the Small Boat Register is:', options: ['Compulsory for all boats over 25 hp', 'Compulsory and run by the Norwegian Maritime Authority', 'Voluntary and run by the Norwegian Society for Sea Rescue', 'Compulsory for boats over 8 m only'], answer: 2, explanation: 'Registration has been voluntary since 2003. The register is run by the Norwegian Society for Sea Rescue, not the state, and mainly helps trace stolen boats and owners.' },
      },
      // 12 -----------------------------------------------------------
      {
        id: 'fines',
        title: 'Fines and losing the right to operate',
        html: `<p>The police enforce the boating rules mostly with <strong>simplified penalty notices</strong>: fixed on-the-spot fines listed in a regulation, revised from 1 January 2026. You do not need every figure, but the pattern shows the authorities' priorities, and the exam asks about a few of them.</p>
<div class="table-wrap"><table><thead><tr><th>Offence</th><th>Fine (NOK, 2026)</th><th>Who pays</th></tr></thead><tbody>
<tr><td>Not wearing a flotation device (boat under 8 m, underway, outdoors)</td><td>900 per person</td><td>the person; the skipper for children under 15</td></tr>
<tr><td>Flotation device missing on board</td><td>900 per missing device, up to 8,900 for 10 or more</td><td>the skipper</td></tr>
<tr><td>Not having the licence card with you</td><td>900</td><td>the operator</td></tr>
<tr><td>Navigation lights fitted but not working or not lit</td><td>4,000</td><td>the operator</td></tr>
<tr><td>Required navigation lights not fitted</td><td>5,000</td><td>the operator</td></tr>
<tr><td>Operating without a licence when one is required; under 16 with more than 10 hp</td><td>5,000</td><td>the operator; the owner who allowed it pays the same</td></tr>
<tr><td>Over 5 knots within 50 m of bathers; inside bathing-area buoys; over a local limit</td><td>5,000</td><td>the operator</td></tr>
<tr><td>Boat capable of 50 knots or more without a high-speed certificate</td><td>7,500</td><td>the operator; the owner who allowed it pays the same</td></tr>
</tbody></table></div>
<p>When several fines are combined, the highest is charged in full and the sum of the others is halved; no simplified fine may be issued if the total would exceed <strong>NOK 15,000</strong>. Serious matters go to court instead.</p>
<p><strong>Losing the right to operate.</strong> A conviction for drink-boating, or another serious breach, leads to loss of the right to operate licence-requiring boats for at least <strong>one year</strong>, up to five in aggravated cases (over 2.0 per mille, a serious accident, or a repeat within five years). The police may seize the card on reasonable suspicion. Someone without a licence gets a ban period before they may obtain one, and anyone who loses the right must <strong>pass the exam again</strong>.</p>
<div class="callout tip"><p>Pattern for the exam: lifejacket offences and a forgotten card are 900; most "you should not be driving this boat" offences are 5,000; the high-speed certificate is 7,500; and the cap is 15,000.</p></div>`,
        illustration: () => finesChart(),
        caption: 'Simplified fines from 1 January 2026 (regulation 2001-634). The dashed line marks the NOK 15,000 cap on a combined simplified fine.',
        keyFacts: ['NOK 900: flotation device not worn or missing (per person); licence card not carried', 'NOK 5,000: no licence, under-age with over 10 hp, lights not fitted, speeding near bathers, over a local limit', 'NOK 7,500: 50-knot boat without a high-speed certificate; the owner who lends it pays the same', 'Cap on a combined simplified fine: NOK 15,000', 'Drink-boating: loss of the right to operate for at least 1 year (up to 5), and the exam must be passed again'],
        check: { id: 'exam-c12', q: 'What is the simplified fine (2026) for an adult who is not wearing a flotation device in a 6 m boat underway?', options: ['NOK 500, paid by the skipper', 'NOK 900, paid by the person', 'NOK 5,000, paid by the owner', 'NOK 900, paid by the owner'], answer: 1, explanation: 'Adults (15 and over) are responsible for themselves and are fined NOK 900 each. The older NOK 500 figure is out of date; the skipper pays only for children under 15.' },
      },
    ],

    flashcards: [
      { front: 'How many questions, and how long, is the boating exam?', back: '50 multiple-choice questions in 60 minutes at an approved test centre.' },
      { front: 'The two pass rules?', back: 'At least 40 of 50 correct (max 10 wrong) AND at most 2 wrong in part 4, the "particularly important topics".' },
      { front: 'Smallest number of mistakes that can still fail you?', back: '3, if all three are in part 4.' },
      { front: 'Minimum age to sit the exam / to receive the licence?', back: 'Sit at 14; the licence is issued at 16.' },
      { front: 'Exam fee and retake rule?', back: 'NOK 940 incl. one attempt and the card; retake no earlier than 14 days later, NOK 495 per new attempt.' },
      { front: 'Who must hold a boating licence?', back: 'Born on or after 1 Jan 1980, operating a boat under 15 m that is over 8 m OR has more than 25 hp (19 kW).' },
      { front: '5 m boat, 30 hp, skipper born 1995: licence?', back: 'Yes. Over 25 hp is enough on its own; the thresholds are alternatives.' },
      { front: 'Skipper born in 1978 with a 13 m, 400 hp motor yacht: licence?', back: 'No licence needed (born before 1980, boat under 15 m). All other rules still apply.' },
      { front: 'What length does the boating licence cover?', back: 'Recreational craft up to 15 m. From 15 to 24 m: recreational skipper certificate D5L / D5LA.' },
      { front: 'Minimum age for more than 10 hp (7.5 kW)?', back: '16. Under 16: at most 10 hp AND at most 8 m.' },
      { front: 'Does the "10 knots" limit for under-16s still apply?', back: 'No. It was abolished on 1 July 2021. Only 10 hp and 8 m remain.' },
      { front: 'High-speed certificate: since when, for which boats?', back: 'Since 1 June 2023, for motorised recreational craft (incl. water scooters) capable of 50 knots or more.' },
      { front: 'Ages for the high-speed certificate?', back: 'Course from 17; certificate issued from 18. Applies even to skippers born before 1980.' },
      { front: 'Alcohol limit for a boat under 15 m?', back: '0.8 per mille blood, or 0.4 mg per litre of breath (Small Craft Act, Section 33).' },
      { front: 'Alcohol limit for a ship of 15 m or more?', back: '0.2 per mille blood, or 0.1 mg/l breath (Maritime Code, Section 143).' },
      { front: 'Which boats does the 0.8 rule cover?', back: 'Boats with an engine, sailing boats 4.5 m or longer, and boats carrying paying passengers.' },
      { front: 'How long after an incident must you stay off alcohol?', back: '6 hours after the trip ended, if the incident may lead to a police investigation.' },
      { front: 'Penalty for drink-boating?', back: 'Fine or prison up to 1 year; loss of the right to operate for at least 1 year (up to 5); exam must be retaken.' },
      { front: 'Who must WEAR a flotation device, and when?', back: 'Everyone outdoors on a recreational craft under 8 m while it is underway (since 1 May 2015).' },
      { front: 'Who must CARRY flotation devices?', back: 'Every recreational craft of any length: a suitable, readily accessible device for every person on board.' },
      { front: 'Who is responsible for a 12-year-old wearing a lifejacket?', back: 'The skipper. Persons 15 and over are responsible for themselves.' },
      { front: 'When does the wearing duty not apply?', back: 'Stationary at anchor or a mooring, or inside a cabin. Devices must still be on board.' },
      { front: 'Fine for not wearing a flotation device (2026)?', back: 'NOK 900 per person; the skipper pays for children under 15.' },
      { front: 'Maximum speed near bathers?', back: '5 knots (about 9.2 km/h) within 50 m of bathers or of public bathing-area buoys.' },
      { front: 'What is forbidden inside the buoys of a public bathing area?', back: 'Anchoring, and moving under motor or sail (emergency services excepted).' },
      { front: 'Fine for exceeding 5 knots within 50 m of bathers?', back: 'NOK 5,000 (2026), the same as for breaking a local speed limit.' },
      { front: 'Who sets local speed limits at sea?', back: 'Municipalities in their own sea areas; the Norwegian Coastal Administration elsewhere. Marked with approved signs.' },
      { front: 'Norwegian Rule 44 in one sentence?', back: 'Pleasure craft and open boats keep out of the way of larger vessels, scheduled ferries and commercial traffic in narrow channels, busy fairways and harbour areas.' },
      { front: 'Norwegian Rule 43?', back: 'Rowing boats and vessels showing only one all-round white light: manoeuvre with caution, reduce speed, stop if necessary, keep well clear.' },
      { front: 'Does Rule 44 apply in open water?', back: 'No. In open water the ordinary COLREG steering rules decide who gives way.' },
      { front: 'Signal flag A: colours and meaning?', back: 'White at the hoist, blue at the fly, swallow-tailed. "I have a diver down; keep well clear at slow speed."' },
      { front: 'Rule 42: what must you do near flag A?', back: 'Pass with caution; power-driven vessels stop the engine if possible. Divers may be up to 300 m away.' },
      { front: 'Rule 45 and Rule 54?', back: '45: do not anchor or moor so you obstruct other vessels. 54: decked Norwegian vessels carry a copy of the collision regulations.' },
      { front: 'Water scooters: special national rules?', back: 'None since 18 May 2017; they are ordinary recreational boats. Municipalities may restrict them locally.' },
      { front: 'Duty to assist: which law?', back: 'Maritime Code, Section 135: all possible assistance to anyone in distress at sea, unless it seriously endangers your own vessel and crew.' },
      { front: 'Emergency numbers at sea?', back: 'VHF channel 16 (or DSC), telephone 120 for coast radio, 112 general emergency.' },
      { front: 'Written accident report to the Maritime Authority: deadline?', back: 'Within 72 hours. Recreational craft may notify the police instead of the rescue centre.' },
      { front: "What does a builder's plate show?", back: 'Manufacturer, max load incl. outboard (kg), max persons, design category A to D, CE symbol, notified body if relevant.' },
      { front: 'CE design categories?', back: 'A ocean (>Bf 8, >4 m), B offshore (Bf 8, 4 m), C inshore (Bf 6, 2 m), D sheltered (Bf 4, 0.3 m).' },
      { front: 'Is boat registration or insurance compulsory?', back: 'Neither. The Small Boat Register (Norwegian Society for Sea Rescue) is voluntary; insurance is recommended, not required.' },
    ],

    questions: [
      // ---- The exam (part 2) ----
      { id: 'exam-01', q: 'How many questions does the Norwegian boating licence exam contain, and how much time do you have?', options: ['40 questions, 45 minutes', '50 questions, 60 minutes', '60 questions, 60 minutes', '50 questions, 90 minutes'], answer: 1, explanation: 'The exam has 50 multiple-choice questions to be answered within one hour (F2).', difficulty: 1, part: 2, tags: ['exam'] },
      { id: 'exam-02', q: 'You answer 47 of 50 questions correctly, but all three mistakes are in part 4, the "particularly important topics". What is the result?', options: ['Pass, because 94 % is above the 80 % pass mark', 'Pass, but you must retake part 4', 'Fail, because part 4 allows at most 2 wrong answers', 'Fail, because any error in part 4 fails the exam'], answer: 2, explanation: 'Two conditions must both hold: at least 80 % overall and at most 2 wrong in part 4. Three errors in part 4 fails you regardless of the total (F4, F5).', difficulty: 2, part: 2, tags: ['exam'] },
      { id: 'exam-03', q: 'You fail the exam. When may you retake it at the earliest, and what does it cost?', options: ['The next day, free of charge', 'After 7 days, NOK 940', 'After 14 days, NOK 495 per new attempt', 'After 30 days, NOK 495 per new attempt'], answer: 2, explanation: 'The earliest retake is after 14 days; the first registration (NOK 940) covers one attempt and the card, and each further attempt costs NOK 495 (F13, F15).', difficulty: 2, part: 2, tags: ['exam'] },
      { id: 'exam-04', q: 'What is the minimum age to sit the boating exam, and at what age is the licence issued?', options: ['14 and 16', '16 and 16', '15 and 18', '14 and 18'], answer: 0, explanation: 'You may sit the exam from age 14; the licence is issued on or after your 16th birthday (F14).', difficulty: 1, part: 2, tags: ['exam', 'age'] },
      // ---- Who needs the licence (part 2) ----
      { id: 'exam-05', q: 'Who must hold a boating licence in Norway?', options: ['Everyone who operates a motorboat', 'Those born on or after 1 January 1980 who operate a boat longer than 8 m or with an engine of more than 25 hp', 'Those born before 1980 who operate a boat longer than 8 m', 'Only people who operate boats commercially'], answer: 1, explanation: 'Licence regulation Section 7: born on or after 1 Jan 1980, boat under 15 m that is over 8 m OR has more than 25 hp (19 kW) (F25).', difficulty: 1, part: 2, tags: ['licence'] },
      { id: 'exam-06', q: 'Kari, born 1990, drives a 6 m boat with a 30 hp outboard. Does she need a boating licence?', options: ['No, the boat is shorter than 8 m', 'No, unless the boat can exceed 10 knots', 'Only if she carries passengers', 'Yes, because the engine is more powerful than 25 hp'], answer: 3, explanation: 'The two thresholds are alternatives. Exceeding either one (here 30 hp > 25 hp) triggers the requirement for anyone born in 1980 or later (F25, trap 1).', difficulty: 2, part: 2, tags: ['licence'] },
      { id: 'exam-07', q: 'Ole, born 1978, buys a 13 m motor cruiser with 400 hp. Which statement is correct?', options: ['He needs a boating licence because of the engine power', 'He needs a D5L skipper certificate because of the length', 'He needs no licence for this boat but must follow all other rules', 'He may not operate it without an International Certificate of Competence'], answer: 2, explanation: 'Born before 1 Jan 1980 means exempt from the licence requirement, and 13 m is within the 15 m the licence covers. Age, alcohol, lifejacket and speed rules still apply (F26, F27).', difficulty: 2, part: 2, tags: ['licence'] },
      { id: 'exam-08', q: 'What does the boating licence entitle you to operate?', options: ['Recreational craft up to 15 m', 'Recreational craft up to 24 m', 'Any boat that cannot exceed 50 knots', 'Boats up to 8 m only'], answer: 0, explanation: 'The licence covers recreational craft up to 15 m (49.21 ft). Boats of 15 to 24 m require the recreational skipper certificate D5L or D5LA (F27, F29).', difficulty: 1, part: 2, tags: ['licence'] },
      { id: 'exam-09', q: 'Four people each want to drive a 9 m motorboat. Who needs a boating licence?', options: ['The one born on 31 December 1979', 'The one born on 1 January 1980', 'The one born in 1975', 'The one born in 1960'], answer: 1, explanation: 'The cut-off is "born on or after 1 January 1980", so 1 January 1980 is inside the requirement while 31 December 1979 is exempt (F25, F26).', difficulty: 3, part: 2, tags: ['licence'] },
      { id: 'exam-10', q: 'A 15-year-old may operate a recreational boat with at most:', options: ['10 hp and 8 m', '25 hp and 8 m', '10 hp and any length', 'Any engine, if the boat cannot exceed 10 knots'], answer: 0, explanation: 'Under 16 the limits are 10 hp (7.5 kW) and 8 m. The 10-knot rule was abolished on 1 July 2021 (F31 to F33).', difficulty: 2, part: 2, tags: ['age'] },
      { id: 'exam-11', q: 'From which date, and for which boats, is a high-speed certificate required?', options: ['1 May 2010; boats with more than 25 hp', '1 July 2021; boats capable of 40 knots', '1 June 2023; boats capable of 50 knots or more', '1 January 2026; all planing boats'], answer: 2, explanation: 'Since 1 June 2023 the operator of a motorised recreational craft capable of 50 knots or more must hold the high-speed certificate (F35).', difficulty: 2, part: 2, tags: ['high-speed-cert'] },
      { id: 'exam-12', q: 'Per, born 1975, buys a boat capable of 55 knots. Which documents does he need to operate it?', options: ['The high-speed certificate only; no boating licence because he was born before 1980', 'Neither; people born before 1980 are exempt from all certificates', 'Both the boating licence and the high-speed certificate', 'The boating licence only'], answer: 0, explanation: 'Being born before 1980 exempts him from the boating licence, but the high-speed certificate applies to everyone operating a boat capable of 50 knots or more (F26, F37).', difficulty: 3, part: 2, tags: ['high-speed-cert', 'licence'] },
      { id: 'exam-13', q: 'An owner lends a 40 hp boat to a 15-year-old. Who is liable?', options: ['Only the 15-year-old', 'Only the owner', 'Nobody, the boat is under 8 m', 'Both: the owner must check the user is qualified, and the operator must meet the age rule'], answer: 3, explanation: 'Small Craft Act Sections 27 and 35 and the licence regulation Section 5: the owner must ensure the user is entitled to operate the boat, and under-16s are limited to 10 hp. Both face a NOK 5,000 fine (F31, F38, F91).', difficulty: 2, part: 2, tags: ['responsibility', 'age'] },
      { id: 'exam-14', q: 'You are stopped by the police while driving a licence-requiring boat and cannot show your licence. What applies?', options: ['Nothing; the licence only has to exist in the register', 'A simplified fine of NOK 900 for not having the licence with you', 'Loss of the right to operate for one year', 'A simplified fine of NOK 5,000 as if you had no licence'], answer: 1, explanation: 'You must be able to show a valid licence on request (regulation Section 20); not carrying it costs NOK 900. Not holding one at all costs NOK 5,000 (F91, F93).', difficulty: 3, part: 2, tags: ['licence', 'fines'] },
      // ---- Alcohol (part 4, 1.4.5) ----
      { id: 'exam-15', q: 'What is the blood alcohol limit for the operator of a 7 m motorboat?', options: ['0.2 per mille', '0.5 per mille', '0.8 per mille', 'There is no limit for recreational boats'], answer: 2, explanation: 'Small Craft Act Section 33: for small craft under 15 m the operator is deemed under the influence above 0.8 per mille (F42).', difficulty: 1, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'exam-16', q: 'What is the breath alcohol limit for the operator of a small craft under 15 m?', options: ['0.1 mg per litre of air', '0.4 mg per litre of air', '0.8 mg per litre of air', '2.0 mg per litre of air'], answer: 1, explanation: 'Section 33 sets 0.8 per mille in blood or 0.4 mg per litre of breath. 0.1 mg/l is the breath limit for ships of 15 m and over (F42, F44).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'exam-17', q: 'What is the blood alcohol limit for the master of a 16 m vessel?', options: ['0.8 per mille', '0.5 per mille', '0.0 per mille', '0.2 per mille'], answer: 3, explanation: 'Maritime Code Section 143: ships of 15 m or more have a limit of 0.2 per mille (0.1 mg/l breath) for the master and anyone with a safety-critical duty (F44).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'exam-18', q: 'The operator of which of these boats is outside the 0.8 per mille rule in Section 33?', options: ['A 4 m rowing boat without an engine', 'A 5 m sailing dinghy without an engine', 'A 3 m dinghy with a 2 hp outboard', 'A 14 m sailing yacht'], answer: 0, explanation: 'Section 33 covers boats with an engine, sailing boats of 4.5 m or longer and commercial passenger boats. A rowing boat is outside it, though the general "unfit" rule in Section 32 still applies (F43).', difficulty: 3, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'exam-19', q: 'After a collision that will probably be investigated by the police, how long must the operator refrain from alcohol?', options: ['2 hours', '12 hours', '24 hours', '6 hours'], answer: 3, explanation: 'Section 33: no alcohol or other intoxicants during the first six hours after the trip ended when the incident may lead to a police investigation (F45).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'exam-20', q: 'What can a conviction for operating a 9 m boat at 1.2 per mille lead to?', options: ['A simplified fine of NOK 900 and nothing more', 'A warning on the first offence', 'A fine only; prison is never possible for boating offences', 'A fine or prison up to one year, and loss of the right to operate licence-requiring boats for at least one year'], answer: 3, explanation: 'Section 37 punishes drink-boating with fines or imprisonment up to one year, and the conviction is a serious breach leading to loss of the right to operate for at least one year, up to five in aggravated cases (F47, F48).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'exam-21', q: 'The skipper of a 5 m sailing dinghy with no engine has 1.0 per mille alcohol in her blood. Which statement is correct?', options: ['Legal: boats without an engine are never covered', 'Legal: the limit for sailing boats is 1.5 per mille', 'Illegal: sailing boats of 4.5 m or longer are covered by the 0.8 per mille limit', 'Illegal only if she is racing'], answer: 2, explanation: 'Section 33 covers sailing boats of 4.5 m or longer even without an engine. 1.0 exceeds 0.8 (F42, F43).', difficulty: 3, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'exam-22', q: 'When may the police breath-test the operator of a recreational boat?', options: ['When they suspect an offence, after an accident, or during a routine control', 'Only after an accident with personal injury', 'Only with a court order', 'Never; breath tests apply only to road traffic'], answer: 0, explanation: 'Small Craft Act Section 36: a preliminary breath test may be taken on suspicion, after an accident or in a control, and a blood test may be required (F46).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'exam-23', q: 'Who is exempt from the alcohol and fitness rules of the Small Craft Act?', options: ['Anyone born before 1980', 'A person operating a boat to save life or property from serious danger', 'Skippers of sailing boats under 15 m', 'Anyone who holds a D5L certificate'], answer: 1, explanation: 'Section 34: the fitness and alcohol rules do not apply to someone operating a boat to rescue a person or property from serious danger. Birth year and certificates are irrelevant (F50).', difficulty: 3, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      // ---- Flotation devices (part 4, 1.4.5) ----
      { id: 'exam-24', q: 'On which boats must everyone outdoors WEAR a flotation device while underway?', options: ['All recreational craft', 'Recreational craft shorter than 8 m', 'Boats with more than 25 hp', 'Only boats carrying children'], answer: 1, explanation: 'Small Craft Act Section 23a: in recreational craft under 8 m everyone must wear a suitable flotation device when outdoors while the boat is underway (F51).', difficulty: 1, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      { id: 'exam-25', q: 'A 13-year-old is not wearing a flotation device in a 6 m boat underway. Who is responsible?', options: ['The child', 'The child’s parents, wherever they are', 'The skipper', 'The boat owner only'], answer: 2, explanation: 'Section 23a: each person is responsible for their own device, but for children under 15 the skipper is responsible (F52).', difficulty: 1, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      { id: 'exam-26', q: 'Your 10 m cabin cruiser has six people on board. What does the law require regarding flotation devices?', options: ['Nothing, the boat is longer than 8 m', 'Everyone must wear one at all times', 'Devices are needed only for children', 'A suitable, readily accessible device must be carried for every person on board'], answer: 3, explanation: 'The carrying duty (Section 23 and the 1995 regulation) applies to all recreational craft of any length; the wearing duty is what stops at 8 m (F54).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      { id: 'exam-27', q: 'When does the duty to WEAR a flotation device in a boat under 8 m not apply?', options: ['When the boat is stationary at anchor or a mooring, or you are inside a cabin', 'When the boat is going slower than 5 knots', 'When the water is warmer than 15 degrees', 'When everyone on board can swim'], answer: 0, explanation: 'The law requires wearing "when outdoors on the boat while the boat is underway"; at anchor, moored or inside a cabin the duty pauses, though the devices must remain on board (F53).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      { id: 'exam-28', q: 'What counts as a "suitable flotation device" under the wearing duty?', options: ['Any cushion or fender that floats', 'A CE-marked or wheel-marked lifejacket, buoyancy aid or flotation clothing', 'Only an inflatable lifejacket with a crotch strap', 'Only a lifejacket with a light and a whistle'], answer: 1, explanation: 'A suitable device is a lifejacket, flotation clothing, buoyancy aid or similar that is CE-marked or wheel-marked as a personal flotation device (F55).', difficulty: 1, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      { id: 'exam-29', q: 'The police check a 7 m boat underway and find two adults without flotation devices. What is the fine (2026)?', options: ['NOK 500 each, paid by the skipper', 'NOK 5,000 in total, paid by the owner', 'NOK 900 each, paid by the adults themselves', 'No fine; only a warning on the first occasion'], answer: 2, explanation: 'From 1 January 2026 the simplified fine is NOK 900 per person not wearing a device, and adults (15 and over) are fined personally (F57).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['lifejacket', 'fines'] },
      { id: 'exam-30', q: 'Since when has it been mandatory to wear a flotation device in recreational craft under 8 m?', options: ['1 May 2015', '1 May 2010', '1 July 2021', '1 January 2026'], answer: 0, explanation: 'The wearing duty in Section 23a came into force on 1 May 2015. 2010 is the licence requirement, 2021 the end of the 10-knot rule, 2026 the new fine rates (F51).', difficulty: 1, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      { id: 'exam-31', q: 'Which of these is a genuine exemption from the duty to wear a flotation device?', options: ['Boats with a cabin, whatever their length, while underway', 'Adults who can prove they are strong swimmers', 'Boats going slower than 5 knots', 'Participants in organised sport or competition following their organisation’s safety rules'], answer: 3, explanation: 'Exemptions: organised sport or competition under the organisation’s safety rules, and rental rowing or pedal boats on small lakes or near shore under staff supervision. Swimming ability and speed are irrelevant (F56).', difficulty: 3, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      { id: 'exam-32', q: 'The boat in the picture is 7 m long and underway with everyone on deck. What does the law require?', options: ['Flotation devices need only be stored within reach', 'Everyone on deck must wear a flotation device', 'Only the children must wear flotation devices', 'Only the skipper must wear a flotation device'], answer: 1, explanation: 'Under 8 m, underway and outdoors: everyone wears a suitable flotation device. Adults are responsible for themselves, the skipper for children under 15 (F51, F52).', illustration: () => lifejacketPanels('small'), difficulty: 2, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      { id: 'exam-33', q: 'A 7 m boat lies at anchor in a bay with five people sunbathing on deck. Which statement is correct?', options: ['Everyone must still wear a flotation device because the boat is under 8 m', 'Wearing is not required while anchored, and the devices need not be on board', 'Wearing is not required while anchored, but a device for every person must still be on board and accessible', 'Only the skipper must wear one while anchored'], answer: 2, explanation: 'The wearing duty applies only while the boat is underway; at anchor it pauses. The carrying duty for every person on board applies to all boats at all times underway and the devices must stay on board (F53, F54).', difficulty: 3, part: 4, p4: '1.4.5', tags: ['lifejacket'] },
      // ---- Dangers of high speed (part 4, 1.4.7) ----
      { id: 'exam-34', q: 'What happens to your field of vision when you drive a boat at high speed?', options: ['It narrows toward the point you are steering at (tunnel vision)', 'It widens, because you scan faster', 'It is unchanged; only hearing is affected', 'It improves at night because of the spray'], answer: 0, explanation: 'At speed the useful field of vision narrows (tunnel vision), so objects at the edges, such as swimmers or kayaks, are noticed late or not at all. You must scan deliberately and slow down (syllabus 1.4.7).', difficulty: 1, part: 4, p4: '1.4.7', tags: ['high-speed'] },
      { id: 'exam-35', q: 'Why is a chart plotter or phone app a poor sole reference when driving at high speed?', options: ['Because it stops working above 25 knots', 'Because electronic charts are not legal for navigation', 'Because the display lags: at speed it shows where you were, not where you are', 'Because GPS does not work close to the coast'], answer: 2, explanation: 'Electronic equipment introduces delay in position updates and screen redraws. At 30 knots you move about 15 m per second, so a position a few seconds old is already astern (syllabus 1.4.7).', difficulty: 2, part: 4, p4: '1.4.7', tags: ['high-speed'] },
      // 1 knot = 1852 m/h, so 30 kn = 15.4 m/s and 10 s = 154 m.
      { id: 'exam-36', q: 'At 30 knots, roughly how far does your boat travel in the 10 seconds it takes you to notice something, decide and react?', options: ['About 50 m', 'About 150 m', 'About 300 m', 'About 500 m'], answer: 1, explanation: 'One knot is 1,852 m per hour, so 30 knots is about 15 m per second and about 150 m in ten seconds. That is why high speed leaves no margin near shore or other craft.', difficulty: 3, part: 4, p4: '1.4.7', tags: ['high-speed'] },
      { id: 'exam-37', q: 'If you double your speed, what happens to the energy released in a collision?', options: ['It stays the same', 'It doubles', 'It halves because the impact is shorter', 'It roughly quadruples'], answer: 3, explanation: 'Kinetic energy grows with the square of speed, so twice the speed means about four times the energy. This is why high-speed accidents cause high-energy injuries (syllabus 1.4.7 and first aid).', difficulty: 2, part: 4, p4: '1.4.7', tags: ['high-speed'] },
      { id: 'exam-38', q: 'You are driving fast and it is getting dark. What is the correct response?', options: ['Keep the speed up so you reach harbour before full darkness', 'Reduce speed to what you can stop within the distance you can see', 'Switch on the plotter and steer by the screen', 'Move closer to the shore to see landmarks better'], answer: 1, explanation: 'Speed must be adapted to visibility (Speed Limits at Sea Regulation Section 2 and good seamanship). In darkness or poor visibility you reduce speed; the plotter lags and the shore adds hazards (syllabus 1.4.7).', difficulty: 1, part: 4, p4: '1.4.7', tags: ['high-speed'] },
      { id: 'exam-39', q: 'Why should a fast boat keep well away from the shore?', options: ['Because the water is always deeper offshore, which makes the boat faster', 'Because GPS is more accurate offshore', 'Because near the shore there are swimmers, rocks and small craft, less reaction time, and your wash damages beaches, jetties and moored boats', 'Because local speed limits only apply within 50 m of land'], answer: 2, explanation: 'Proper distance from the shore buys reaction time and keeps your wash harmless; the shore zone has bathers, shallow rocks and small craft. Local limits are set by regulation, not by a fixed 50 m (syllabus 1.4.7, F61).', difficulty: 2, part: 4, p4: '1.4.7', tags: ['high-speed'] },
      { id: 'exam-40', q: 'Why do high-speed boating accidents cause particularly serious injuries?', options: ['The energy in the impact rises with the square of speed, so people are thrown against the boat or overboard (high-energy injuries)', 'Because fast boats are always made of aluminium', 'Because the engine noise prevents calling for help', 'Because fast boats sink faster than slow boats'], answer: 0, explanation: 'High-energy injuries from collisions or falls at speed are a named syllabus item: broken bones, head injuries and people thrown overboard, because impact energy grows with the square of speed (syllabus 1 m, 1.4.7).', difficulty: 2, part: 4, p4: '1.4.7', tags: ['high-speed'] },
      // ---- Rules 43 and 44 (part 4, 1.4.3) ----
      { id: 'exam-41', q: 'In the situation shown, a scheduled ferry is coming through a narrow sound toward your small motorboat. What does Norwegian Rule 44 require of you?', options: ['Hold course and speed; the ferry gives way to the vessel on its starboard side', 'Keep out of the way of the ferry as far as possible', 'Sound five short blasts and continue', 'Cross ahead of the ferry quickly to clear the channel'], answer: 1, explanation: 'Rule 44: pleasure craft and open boats propelled by oars, sail or engine keep out of the way of larger vessels, scheduled ferries and other commercial traffic in narrow channels, busy fairways and harbour areas (F68).', illustration: () => narrowSound(), difficulty: 1, part: 4, p4: '1.4.3', tags: ['rule-44'] },
      { id: 'exam-42', q: 'Where does Norwegian Rule 44 (small craft keep out of the way of commercial traffic) apply?', options: ['Everywhere in Norwegian waters, including the open sea', 'Only inside harbours', 'Only in restricted visibility', 'In narrow channels, heavily trafficked fairways and harbour areas'], answer: 3, explanation: 'Rule 44 applies when passing a narrow channel, a heavily trafficked fairway or a harbour area. Elsewhere the ordinary COLREG steering rules decide (F68, F71).', difficulty: 2, part: 4, p4: '1.4.3', tags: ['rule-44'] },
      { id: 'exam-43', q: 'Which vessels are bound by Norwegian Rule 44 to keep out of the way of larger vessels and ferries in narrow waters?', options: ['Pleasure craft and open boats propelled by oars, sail or engine', 'Only motorboats under 7 m', 'Only sailing vessels', 'Only rowing boats and kayaks'], answer: 0, explanation: 'The rule names pleasure craft and open boats propelled by oars, sail or engine, so sailing boats, motorboats and rowing boats are all covered (F68).', difficulty: 2, part: 4, p4: '1.4.3', tags: ['rule-44'] },
      { id: 'exam-44', q: 'At night your 5 m boat shows only a single all-round white light. Another vessel approaches. What does Norwegian Rule 43 require?', options: ['Switch on sidelights and hold your course', 'Sound one prolonged blast every two minutes', 'Manoeuvre with caution, reduce speed, stop if necessary and keep well clear', 'Nothing; the other vessel must give way to the smaller boat'], answer: 2, explanation: 'Rule 43: rowing boats and vessels showing only one all-round white light must manoeuvre with caution, go at reduced speed, stop if necessary and keep well clear of other vessels (F64).', difficulty: 2, part: 4, p4: '1.4.3', tags: ['rule-43'] },
      { id: 'exam-45', q: 'In open water, far from any fairway or harbour, a cargo ship and your motorboat are on crossing courses. Which rules decide who gives way?', options: ['Rule 44: the cargo ship always has right of way over pleasure craft', 'The ordinary COLREG steering rules; Rule 44 applies only in narrow, busy or harbour waters', 'Rule 43: the smaller vessel must always stop', 'No rule applies in open water'], answer: 1, explanation: 'Rule 44 is a duty for small craft in narrow channels, busy fairways and harbour areas. In open water the international steering rules decide, whoever the other vessel is (F71).', difficulty: 3, part: 4, p4: '1.4.3', tags: ['rule-44'] },
      { id: 'exam-46', q: 'A sailing boat under sail meets a scheduled ferry in a heavily trafficked fairway. Who keeps out of the way?', options: ['The ferry, because power gives way to sail', 'The ferry, because it is the larger vessel', 'Neither; both hold course', 'The sailing boat, under Norwegian Rule 44'], answer: 3, explanation: 'Rule 44 covers pleasure craft propelled by sail as well as by oars or engine. In a heavily trafficked fairway the sailing boat keeps out of the way of the scheduled ferry (F68).', difficulty: 2, part: 4, p4: '1.4.3', tags: ['rule-44'] },
      { id: 'exam-47', q: 'Which vessels does Norwegian Rule 43 apply to?', options: ['Rowing boats, and power-driven or sailing vessels that show only a single all-round white light', 'All vessels under 15 m', 'All power-driven vessels in narrow channels', 'Only vessels engaged in fishing'], answer: 0, explanation: 'Rule 43 is aimed at rowing boats and at small, slow vessels that show only an all-round white light (COLREG Rule 23(d): under 7 m, max 7 knots, or small sailing boats) (F64).', difficulty: 2, part: 4, p4: '1.4.3', tags: ['rule-43'] },
      // ---- Flag A (part 4, 1.4.4) ----
      { id: 'exam-48', q: 'A boat ahead shows the flag in the picture. What does it mean, and what must you do?', options: ['Yacht club pennant; no action required', 'Pilot on board; keep clear of the pilot ladder', 'Diver down; pass with caution at slow speed and stop your engine if possible', 'Vessel requires assistance; approach and offer help'], answer: 2, explanation: 'Signal flag A (white at the hoist, blue at the fly, swallow-tailed) means "I have a diver down; keep well clear at slow speed". Norwegian Rule 42 adds that power-driven vessels stop the engine if possible (F67, F72).', illustration: () => flagA({ labels: false }), difficulty: 1, part: 4, p4: '1.4.4', tags: ['flag-a'] },
      { id: 'exam-49', q: 'How far from a boat showing signal flag A may divers be in the water?', options: ['At most 20 m', 'Up to about 300 m', 'Within the boat’s own length', 'At least 1 nautical mile'], answer: 1, explanation: 'Divers may be up to about 300 m from the boat or buoy showing flag A, which is why the Maritime Authority asks for a wide berth at slow speed. The "50 m minimum" is a recommendation, not a legal figure (F73).', difficulty: 3, part: 4, p4: '1.4.4', tags: ['flag-a'] },
      // ---- Emergency number (part 4, 1.4.6) ----
      { id: 'exam-50', q: 'Which telephone number reaches the coast radio service in Norway?', options: ['110', '113', '02800', '120'], answer: 3, explanation: 'The coast radio service answers on telephone 120 and keeps watch on VHF channel 16. 112 is the general emergency number (F83).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['emergency'] },
      // ---- Speed rules (part 2) ----
      { id: 'exam-51', q: 'What is the maximum speed within 50 m of people who are bathing?', options: ['3 knots', '5 knots', '8 knots', '10 knots'], answer: 1, explanation: 'Speed Limits at Sea Regulation Section 3: at most 5 knots (about 9.2 km/h) within 50 m of bathers or of public bathing-area buoys (F60).', difficulty: 1, part: 2, tags: ['speed'] },
      { id: 'exam-52', q: 'What is the simplified fine (2026) for exceeding 5 knots within 50 m of bathers?', options: ['NOK 900', 'NOK 2,000', 'NOK 5,000', 'NOK 15,000'], answer: 2, explanation: 'Regulation 2001-634: NOK 5,000, the same as for anchoring or motoring inside bathing-area buoys and for exceeding a local speed limit (F63).', difficulty: 2, part: 2, tags: ['speed', 'fines'] },
      { id: 'exam-53', q: 'A public bathing area is enclosed by yellow marker buoys, as in the picture. What applies inside the buoys?', options: ['No anchoring and no moving under motor or sail', 'Max 5 knots, anchoring allowed', 'Max 3 knots under motor; sailing allowed', 'No rules; the buoys are only a warning to swimmers'], answer: 0, explanation: 'Section 3 of the Speed Limits at Sea Regulation forbids anchoring and moving under motor or sail inside the marker buoys of a public bathing area; the 5-knot limit applies within 50 m outside them (F60).', illustration: () => bathingZone(), difficulty: 2, part: 2, tags: ['speed'] },
      { id: 'exam-54', q: 'Who sets the local speed limits you meet in harbours and sounds, and how do you know about them?', options: ['The police, announced on VHF channel 16', 'The municipality in its own sea area or the Norwegian Coastal Administration elsewhere, marked with approved signs', 'The Norwegian Maritime Authority, printed only in the regulations', 'Each harbour master verbally, on arrival'], answer: 1, explanation: 'Local limits are set by municipalities in their sea areas and by the Coastal Administration elsewhere, published as regulations and marked with signs approved by the Coastal Administration. Breaking one costs NOK 5,000 (F62).', difficulty: 3, part: 2, tags: ['speed'] },
      // ---- Divers, scooters, paperwork, duties (parts 1 and 2) ----
      { id: 'exam-55', q: 'Which statement about water scooters (jet skis) in Norway is correct?', options: ['They must stay at least 400 m from the shore everywhere at sea', 'No licence is ever required to drive one', 'They are banned in all Norwegian waters', 'They are regulated like other recreational boats, and municipalities may add local restrictions'], answer: 3, explanation: 'The water-scooter regulation was repealed on 18 May 2017; the same age, licence, alcohol, lifejacket and speed rules apply as for other boats, with local municipal rules possible (F74).', difficulty: 2, part: 2, tags: ['water-scooter'] },
      { id: 'exam-56', q: 'Registration of a recreational boat under 15 m in the Small Boat Register is:', options: ['Compulsory for all boats over 25 hp', 'Compulsory for boats over 8 m', 'Voluntary, and the register is run by the Norwegian Society for Sea Rescue', 'Compulsory, and the register is run by the Norwegian Maritime Authority'], answer: 2, explanation: 'Registration has been voluntary since 2003; the register is run by the Norwegian Society for Sea Rescue and helps identify stolen boats and their owners (F84).', difficulty: 1, part: 2, tags: ['registration'] },
      { id: 'exam-57', q: 'What information must the builder’s plate shown in the picture carry on a CE-marked boat?', options: ['The owner’s name and home port', 'Manufacturer, maximum load, maximum number of persons, design category and the CE symbol', 'The engine serial number and fuel type', 'The boat’s registration number and insurance company'], answer: 1, explanation: 'The builder’s plate shows the manufacturer, max load including outboard (kg), max persons, design category A to D, the CE symbol and, where relevant, the notified-body number (F87).', illustration: () => builderPlate(), difficulty: 1, part: 2, tags: ['ce'] },
      { id: 'exam-58', q: 'A boat with CE design category C is designed for conditions up to:', options: ['Wind above Beaufort 8 and waves above 4 m', 'Beaufort 8 and 4 m waves', 'Beaufort 4 and 0.3 m waves', 'Beaufort 6 and 2 m waves'], answer: 3, explanation: 'Category C (inshore) is designed for up to Beaufort 6 and 2 m waves; A is ocean (above Bf 8, above 4 m), B offshore (Bf 8, 4 m), D sheltered (Bf 4, 0.3 m) (F88).', difficulty: 2, part: 1, tags: ['ce'] },
      { id: 'exam-59', q: 'You see a person in the water who is clearly in distress. What does the law require of you?', options: ['Call 120 and wait for the rescue service', 'Render all possible assistance unless it puts your own vessel and crew in serious danger', 'Assist only if you are a commercial vessel', 'Assist only if you caused the accident'], answer: 1, explanation: 'Maritime Code Section 135: the master must give all possible and necessary assistance to anyone in distress at sea, as far as possible without serious danger to the own vessel and those on board (F76).', difficulty: 1, part: 2, tags: ['duty-to-assist'] },
      { id: 'exam-60', q: 'After a collision between two boats, what must each master do in addition to helping?', options: ['Leave immediately to avoid blocking the fairway', 'Report only to their insurance company', 'Give the other vessel their vessel’s name, home port, port of departure and destination', 'Wait for the police before speaking to the other skipper'], answer: 2, explanation: 'Maritime Code Section 164: give all possible help and tell the other vessel your vessel’s name, home port, port of departure and destination (F77).', difficulty: 2, part: 2, tags: ['collision'] },
    ],
  });

  // Exam settings: fee and retake rule from the fact sheet (F13, F15).
  BOAT.setExam({ questions: 50, minutes: 60, pass: 40, maxPart4Errors: 2, note: 'The real exam costs NOK 940 (2026) for the first attempt including the licence card; if you fail, the earliest retake is after 14 days and each new attempt costs NOK 495.' });
})();
