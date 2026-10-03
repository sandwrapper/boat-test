/* Skipper Prep — topic 8: Safety equipment and emergencies.
   Facts: scratchpad/facts/safety-and-emergencies.md (verified 2026-10-03 against the Norwegian Maritime
   Authority, Lovdata, Kystverket's 2025 distress-procedure card, the Joint Rescue Coordination Centre,
   Redningsselskapet and the Norwegian Resuscitation Council). Fact ids (F1...F102) and illustration ids
   (ILL-1...ILL-8) in comments refer to that sheet. Claims graded "low" in the sheet are not used. */
(function () {
  'use strict';
  const S = BOAT.svg, C = S.COLORS, T = S.text;
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)', PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', SHALLOW = 'var(--shallow)';
  const OK = 'var(--ok)', OKBG = 'var(--ok-bg)', BAD = 'var(--bad)', BADBG = 'var(--bad-bg)', WARN = 'var(--warn)', WARNBG = 'var(--warn-bg)', SEA = 'var(--sea)', ACC = 'var(--accent)';
  const SKIN = '#e8c39e', FLAME1 = '#f2771a', FLAME2 = '#f5c400', SMOKE = '#8a8a8a';

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
  /* wind arrow: a few parallel arrows pointing in direction ang (radians, screen coords) */
  function wind(x, y, ang, label) {
    let s = '';
    for (let i = -1; i <= 1; i++) {
      const ox = -Math.sin(ang) * i * 9, oy = Math.cos(ang) * i * 9;
      s += arrow([[x + ox, y + oy], [x + ox + Math.cos(ang) * 26, y + oy + Math.sin(ang) * 26]], SEA, { sw: 2 });
    }
    if (label) s += T(x + Math.cos(ang) * 13 - Math.sin(ang) * 22, y + Math.sin(ang) * 13 + Math.cos(ang) * 22, label, { size: 10, fill: SEA, weight: 700 });
    return s;
  }
  /* standing person, head centre (x, y), about 46 px tall. o.jacket: orange vest; o.collar: thick collar; o.aid: slim yellow aid */
  function person(x, y, o) {
    o = o || {}; const col = o.color || INK2;
    let s = '';
    if (o.collar) s += `<path d="M${x - 11},${y + 9} Q${x - 11},${y - 6} ${x},${y - 7} Q${x + 11},${y - 6} ${x + 11},${y + 9} Z" fill="${C.orange}" stroke="${INK}" stroke-width="0.8"/>`;
    s += circ(x, y, 5.5, SKIN, INK, 0.8);
    if (o.jacket) s += rect(x - 8, y + 7, 16, 18, C.orange, INK, { rx: 3, sw: 0.8 }) + (o.collar ? line(x - 3, y + 25, x - 3, y + 31, INK, { sw: 1.2 }) + line(x + 3, y + 25, x + 3, y + 31, INK, { sw: 1.2 }) + rect(x - 8, y + 16, 16, 2.5, '#cfcfcf', 'none', { rx: 0 }) : '');
    else if (o.aid) s += rect(x - 7, y + 7, 14, 17, C.yellow, INK, { rx: 3, sw: 0.8 });
    else if (o.inflatable) s += rect(x - 8, y + 7, 16, 18, col, 'none', { rx: 3 }) + `<path d="M${x - 7},${y + 22} L${x - 7},${y + 9} Q${x},${y + 4} ${x + 7},${y + 9} L${x + 7},${y + 22}" fill="none" stroke="${o.bulky ? C.orange : '#2b2b2b'}" stroke-width="${o.bulky ? 7 : 4}" stroke-linecap="round"/>` + circ(x + 8, y + 24, 2.2, C.red);
    else s += rect(x - 7, y + 7, 14, 18, col, 'none', { rx: 3 });
    if (!o.noLegs) s += line(x - 3, y + 25, x - 4, y + 40, col, { sw: 3 }) + line(x + 3, y + 25, x + 4, y + 40, col, { sw: 3 });
    return s;
  }
  /* side view boat, stern at x, waterline at y, bow to the right */
  function boatSide(x, y, len, h, fill, o) {
    o = o || {};
    let s = `<path d="M${x},${y - h} L${x + len * 0.78},${y - h} Q${x + len},${y - h * 1.15} ${x + len},${y - h * 0.15} L${x + len * 0.94},${y + h * 0.35} L${x + len * 0.04},${y + h * 0.35} Z" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>`;
    if (o.cabin) s += rect(x + len * 0.28, y - h - o.cabin, len * 0.4, o.cabin + 2, fill, INK, { rx: 3 }) + rect(x + len * 0.34, y - h - o.cabin + 5, len * 0.1, o.cabin * 0.4, SHALLOW, INK, { rx: 1, sw: 0.8 }) + rect(x + len * 0.48, y - h - o.cabin + 5, len * 0.1, o.cabin * 0.4, SHALLOW, INK, { rx: 1, sw: 0.8 });
    if (o.outboard) s += rect(x - 7, y - h - 6, 9, h * 0.9, INK2, 'none', { rx: 2 });
    return s;
  }
  /* plan view boat, bow up, centred at (cx,cy), rotated rot degrees clockwise */
  function boatPlan(cx, cy, len, beam, fill, rot) {
    const p = `M${cx},${cy - len / 2} C${cx + beam * 0.6},${cy - len / 2 + len * 0.3} ${cx + beam / 2},${cy + len * 0.15} ${cx + beam / 2},${cy + len / 2} L${cx - beam / 2},${cy + len / 2} C${cx - beam / 2},${cy + len * 0.15} ${cx - beam * 0.6},${cy - len / 2 + len * 0.3} ${cx},${cy - len / 2} Z`;
    return `<g transform="rotate(${rot || 0} ${cx} ${cy})"><path d="${p}" fill="${fill}" stroke="${INK}" stroke-width="1.2"/></g>`;
  }
  function flames(x, y, sc) {
    sc = sc || 1;
    return `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0,0 C-14,-10 -10,-28 -2,-34 C-2,-24 4,-22 4,-30 C12,-22 14,-8 0,0 Z" fill="${FLAME1}"/><path d="M0,-2 C-6,-8 -5,-18 -1,-22 C-1,-16 3,-15 3,-20 C7,-14 7,-6 0,-2 Z" fill="${FLAME2}"/></g>`;
  }
  function water(x, y, w, h) { return rect(x, y, w, h, SHALLOW, 'none', { rx: 0 }) + line(x, y, x + w, y, SEA, { sw: 1.5 }); }
  function extinguisher(x, y, sc) {
    sc = sc || 1;
    return `<g transform="translate(${x} ${y}) scale(${sc})">` + rect(-7, -18, 14, 36, C.red, INK, { rx: 4, sw: 0.9 }) + rect(-3, -24, 6, 7, INK2, 'none', { rx: 1 }) + line(0, -22, 10, -30, INK, { sw: 2 }) + `</g>`;
  }
  function phone(x, y, txt) { return rect(x - 11, y - 20, 22, 40, INK2, 'none', { rx: 4 }) + rect(x - 8, y - 16, 16, 28, PAPER, 'none', { rx: 1 }) + T(x, y - 2, txt, { size: 9, weight: 800 }); }
  function handset(x, y, ch) {
    return rect(x - 16, y - 28, 32, 56, INK2, INK, { rx: 5 }) + rect(x - 11, y - 22, 22, 16, '#1e2a16', 'none', { rx: 2 }) + T(x, y - 14, ch, { size: 11, weight: 800, fill: '#9df26a', family: 'var(--font-mono)' }) + circ(x, y + 8, 6, C.red, INK, 0.8) + line(x + 12, y - 28, x + 12, y - 44, INK, { sw: 2.5 });
  }
  function tile(x, y, w, h, n, title) {
    return rect(x, y, w, h, PAPER, LINE) + circ(x + 14, y + 14, 10, ACC) + T(x + 14, y + 14.5, String(n), { size: 11, weight: 800, fill: 'var(--accent-ink)' }) + T(x + 30, y + 14.5, title, { size: 11.5, weight: 700, anchor: 'start' });
  }

  // ---------- ILL-1 buoyancy classes (F9-F13) ----------
  function buoyancyClasses() {
    const W = 640, H = 400, cols = [
      { n: '50 N', iso: 'ISO 12402-5', opts: { aid: true }, floatUp: false, name: 'Buoyancy aid', b: ['Not a life jacket', 'Swimmers over 30 kg,', 'close to help', 'Does not turn you face-up'] },
      { n: '100 N', iso: 'ISO 12402-4', opts: { jacket: true, collar: true }, floatUp: true, name: 'Life jacket', b: ['Children and non-swimmers', 'Sheltered and coastal', 'Collar, crotch strap,', 'reflectors, whistle'] },
      { n: '150 N', iso: 'ISO 12402-3', opts: { inflatable: true }, floatUp: true, name: 'Inflatable', b: ['Auto or manual CO2', 'Adults, all weather', 'Not for children', 'Turns you face-up*'] },
      { n: '275 N', iso: 'ISO 12402-2', opts: { inflatable: true, bulky: true, color: '#b48a3c' }, floatUp: true, name: 'Offshore', b: ['Extreme conditions', 'Heavy waterproof', 'clothing', 'Face-up even in oilskins'] },
    ];
    let s = T(W / 2, 20, 'Flotation devices: the four buoyancy levels of EN ISO 12402', { size: 15, weight: 700 });
    cols.forEach((c, i) => {
      const x = 20 + i * 150, cx = x + 70;
      s += rect(x, 36, 140, 300, PAPER, LINE);
      s += T(cx, 60, c.n, { size: 24, weight: 800, fill: ACC }) + T(cx, 80, c.name, { size: 11.5, weight: 700, fill: INK2 });
      s += person(cx - 32, 110, c.opts);
      // floating position icon
      const wx = cx + 8, wy = 132;
      s += water(wx, wy, 58, 26);
      if (c.floatUp) s += circ(wx + 14, wy - 2, 5, SKIN, INK, 0.8) + rect(wx + 19, wy - 5, 26, 9, C.orange, INK, { rx: 3, sw: 0.8 }) + line(wx + 45, wy - 1, wx + 56, wy + 3, INK2, { sw: 3 }) + T(wx + 29, wy + 18, 'face up', { size: 9, fill: INK2 });
      else s += circ(wx + 29, wy - 3, 5, SKIN, INK, 0.8) + rect(wx + 23, wy + 2, 12, 14, C.yellow, INK, { rx: 2, sw: 0.8 }) + T(wx + 29, wy + 22, 'vertical', { size: 9, fill: INK2 });
      s += lines(cx, 190, c.b, { size: 10.5, lh: 14, fill: INK });
      s += T(cx, 320, c.iso, { size: 10, fill: MUTED, family: 'var(--font-mono)' });
    });
    s += arrow([[40, 352], [600, 352]], INK2, { sw: 2 }) + T(W / 2, 366, 'more buoyancy: safer when unconscious and in rougher water', { size: 11, fill: INK2 });
    s += T(W / 2, 388, '*150 N turns an unconscious wearer face-up unless heavy or waterproof clothing is worn. All devices must be CE- or wheel-marked.', { size: 9.5, fill: MUTED });
    return S.svg(W, H, s, { label: 'The four buoyancy levels: 50 N buoyancy aid, 100 N life jacket, 150 N inflatable, 275 N offshore' });
  }

  // ---------- ILL-2 inflatable vest service check (F14, F15) ----------
  function vestCheck() {
    const W = 640, H = 230;
    let s = T(W / 2, 20, 'Checking an inflatable life jacket (Norwegian Maritime Authority)', { size: 15, weight: 700 });
    // panel 1: cylinder and scale
    s += tile(20, 38, 190, 150, 1, 'Gas cylinder');
    s += rect(50, 78, 18, 44, '#9aa3ab', INK, { rx: 5, sw: 0.9 }) + rect(54, 70, 10, 10, INK2, 'none', { rx: 2 });
    s += rect(100, 108, 90, 14, INK2, 'none', { rx: 3 }) + rect(110, 94, 70, 16, PAPER, INK, { rx: 2 }) + T(145, 102, '-- g', { size: 10, weight: 700, family: 'var(--font-mono)' });
    s += lines(115, 140, ['Unscrew and weigh it:', 'weight = value printed', 'on the cylinder?'], { size: 10.5, lh: 13, fill: INK2 });
    // panel 2: firing element
    s += tile(225, 38, 190, 150, 2, 'Firing element');
    s += rect(250, 80, 50, 40, INK2, 'none', { rx: 6 }) + rect(262, 92, 26, 16, PAPER, INK, { rx: 3, sw: 0.8 }) + T(275, 100, 'tablet', { size: 8.5, fill: INK2 });
    s += lines(320, 86, ['Not expired, not damp,', 'not broken.', 'Replace by the date', 'printed on the unit.'], { size: 10.5, lh: 13, fill: INK2 });
    // panel 3: air test
    s += tile(430, 38, 190, 150, 3, 'Air test');
    s += `<path d="M455,120 L455,90 Q485,66 515,90 L515,120" fill="none" stroke="${C.orange}" stroke-width="12" stroke-linecap="round"/>`;
    s += rect(528, 84, 10, 40, INK2, 'none', { rx: 2 }) + rect(524, 78, 18, 6, INK2, 'none', { rx: 1 }) + T(533, 134, 'pump', { size: 9, fill: MUTED });
    s += circ(590, 100, 16, PAPER, INK, 2) + line(590, 100, 590, 89, INK, { sw: 2 }) + line(590, 100, 598, 104, INK, { sw: 2 }) + T(590, 126, '24 h', { size: 11, weight: 800 });
    s += lines(525, 152, ['Inflate by mouth or pump:', 'still firm after 24 hours'], { size: 10.5, lh: 13, fill: INK2 });
    s += T(W / 2, 208, 'Also: crotch strap fastened, correct size for your weight, stored dry and out of the sun.', { size: 11, weight: 600, fill: INK2 });
    return S.svg(W, H, s, { label: 'Three-step check of an inflatable life jacket: weigh the cylinder, inspect the firing element, 24-hour air test' });
  }

  // ---------- picture question: boat with length label and people (F2-F4) ----------
  function vestScene(o) {
    const W = 640, H = 230;
    let s = water(0, 150, W, 80);
    s += boatSide(130, 150, 360, 36, C.hullLight, { cabin: 30, outboard: !o.inboard });
    if (o.underway) s += [0, 1, 2].map(i => line(100 - i * 12, 158 + i * 6, 122 - i * 12, 158 + i * 6, SEA, { sw: 2 })).join('');
    else s += line(470, 150, 470, 205, INK2, { sw: 1.5, dash: '4 3' }) + `<path d="M462,205 q8,8 16,0" fill="none" stroke="${INK2}" stroke-width="2"/>` + T(492, 180, 'anchored', { size: 10, fill: INK2 });
    // people in cockpit (outdoors) and one in cabin
    s += person(175, 92, { jacket: o.jackets, noLegs: true }) + person(205, 92, { jacket: o.jackets, noLegs: true });
    if (o.child) s += circ(300, 110, 4, SKIN, INK, 0.8) + rect(295, 115, 10, 10, INK2, 'none', { rx: 2 }) + T(300, 136, o.childAge + ' yrs, in cabin', { size: 9, fill: INK2 });
    s += line(130, 60, 490, 60, INK, { sw: 1.3 }) + line(130, 54, 130, 66, INK) + line(490, 54, 490, 66, INK) + T(310, 46, o.len + ' m', { size: 15, weight: 800 });
    s += T(W / 2, 220, o.underway ? 'engine running, boat moving' : 'engine stopped, at anchor', { size: 11, fill: INK2 });
    return S.svg(W, H, s, { label: `A ${o.len} m boat, ${o.underway ? 'under way' : 'at anchor'}` });
  }

  // ---------- picture question: VHF handset with a channel on the display ----------
  function radioDisplay(ch, label) {
    const W = 320, H = 150;
    let s = rect(90, 20, 140, 110, INK2, INK, { rx: 8 }) + rect(110, 34, 100, 40, '#1e2a16', 'none', { rx: 3 }) + T(160, 56, 'CH ' + ch, { size: 22, weight: 800, fill: '#9df26a', family: 'var(--font-mono)' });
    s += circ(130, 100, 9, C.red, INK, 0.8) + T(130, 118, 'DISTRESS', { size: 7.5, fill: PAPER, weight: 700 }) + circ(190, 100, 9, PAPER, INK, 0.8) + T(190, 118, '16', { size: 7.5, fill: PAPER, weight: 700 });
    s += line(220, 20, 220, 2, INK, { sw: 3 });
    if (label) s += T(W / 2, 142, label, { size: 11, fill: INK2 });
    return S.svg(W, H, s, { label: 'A marine VHF radio showing channel ' + ch });
  }

  // ---------- ILL-3a fire-fighting steps (F91, F33) ----------
  function fireSteps() {
    const W = 640, H = 420, tw = 196, th = 170;
    const px = i => 20 + (i % 3) * (tw + 8), py = i => 40 + Math.floor(i / 3) * (th + 10);
    let s = T(W / 2, 20, 'Fire on board: six steps', { size: 15, weight: 700 });
    // 1 alert and stop
    let x = px(0), y = py(0);
    s += tile(x, y, tw, th, 1, 'Alert and stop');
    s += boatSide(x + 40, y + 90, 110, 16, C.hullLight, { outboard: true }) + flames(x + 70, y + 76, 0.7);
    s += circ(x + 150, y + 68, 14, PAPER, INK, 1.5) + line(x + 150, y + 68, x + 150, y + 58, INK, { sw: 3 }) + T(x + 150, y + 96, 'engine OFF', { size: 9.5, weight: 700, fill: BAD });
    s += lines(x + tw / 2, y + 130, ['Shout FIRE, stop the engine,', 'everyone away from the flames'], { size: 10.5, lh: 13, fill: INK2 });
    // 2 shut off
    x = px(1); y = py(1);
    s += tile(x, y, tw, th, 2, 'Shut off');
    [[x + 40, 'fuel valve'], [x + 98, 'gas bottle'], [x + 156, 'battery switch']].forEach(([cx, lab], k) => {
      if (k === 0) s += line(cx - 14, y + 70, cx + 14, y + 70, INK, { sw: 4 }) + circ(cx, y + 70, 7, PAPER, INK, 2) + line(cx, y + 63, cx, y + 54, INK, { sw: 3 });
      if (k === 1) s += rect(cx - 10, y + 56, 20, 30, '#3f7fbf', INK, { rx: 4, sw: 0.9 }) + rect(cx - 4, y + 49, 8, 8, INK2, 'none', { rx: 1 });
      if (k === 2) s += rect(cx - 13, y + 56, 26, 30, INK2, 'none', { rx: 3 }) + line(cx, y + 70, cx + 8, y + 60, C.red, { sw: 3 });
      s += line(cx - 12, y + 58, cx + 12, y + 82, C.red, { sw: 3 }) + line(cx + 12, y + 58, cx - 12, y + 82, C.red, { sw: 3 });
      s += T(cx, y + 100, lab, { size: 9.5, fill: INK2 });
    });
    s += lines(x + tw / 2, y + 130, ['Cut fuel, gas and', 'electricity if you can'], { size: 10.5, lh: 13, fill: INK2 });
    // 3 turn the boat
    x = px(2); y = py(0);
    s += tile(x, y, tw, th, 3, 'Turn the boat');
    s += wind(x + 40, y + 48, Math.PI / 2, 'wind');
    s += boatPlan(x + 100, y + 95, 70, 26, C.hullLight, 0) + flames(x + 100, y + 128, 0.55) + circ(x + 100, y + 72, 3.5, INK2) + circ(x + 92, y + 78, 3.5, INK2) + circ(x + 108, y + 78, 3.5, INK2);
    s += T(x + 100, y + 150, 'people upwind, fire downwind', { size: 9.5, weight: 700, fill: INK2 });
    s += lines(x + 150, y + 70, ['fire aft:', 'head into', 'the wind'], { size: 9.5, lh: 11, fill: INK2 });
    // 4 life jackets
    x = px(3); y = py(3);
    s += tile(x, y, tw, th, 4, 'Life jackets on');
    s += person(x + 55, y + 60, { jacket: true, collar: true }) + person(x + 100, y + 60, { inflatable: true }) + person(x + 145, y + 60, { jacket: true });
    s += lines(x + tw / 2, y + 130, ['Everyone, now:', 'you may have to abandon'], { size: 10.5, lh: 13, fill: INK2 });
    // 5 attack the base
    x = px(4); y = py(4);
    s += tile(x, y, tw, th, 5, 'Attack the base');
    s += wind(x + 22, y + 60, 0, 'wind');
    s += person(x + 70, y + 50, {}) + extinguisher(x + 92, y + 80, 0.8);
    s += `<path d="M${x + 100},${y + 84} L${x + 150},${y + 100} L${x + 150},${y + 108} L${x + 100},${y + 90} Z" fill="${SMOKE}" opacity="0.6"/>`;
    s += flames(x + 158, y + 108, 0.9) + line(x + 140, y + 108, x + 176, y + 108, INK, { sw: 1.5 });
    s += T(x + 160, y + 122, 'aim LOW', { size: 9.5, weight: 800, fill: BAD });
    s += lines(x + tw / 2, y + 140, ['From upwind, aim at the base of the fire', 'Pull - Aim - Squeeze - Sweep'], { size: 10, lh: 13, fill: INK2 });
    // 6 call and prepare
    x = px(5); y = py(5);
    s += tile(x, y, tw, th, 6, 'Call and prepare');
    s += handset(x + 50, y + 80, 'CH16') + rect(x + 72, y + 46, 62, 22, PAPER, INK, { rx: 6 }) + T(x + 103, y + 57, 'MAYDAY', { size: 10, weight: 800, fill: BAD });
    s += phone(x + 160, y + 80, '112') + T(x + 160, y + 110, 'or 120', { size: 9, fill: INK2 });
    s += lines(x + tw / 2, y + 136, ['Abandon only as a last resort,', 'when the fire is out of control'], { size: 10, lh: 13, fill: INK2 });
    return S.svg(W, H, s, { label: 'Six steps when fire breaks out on board' });
  }

  // ---------- ILL-3b fire prevention: vapour in the bilge, detector positions (F34, F38, F41, F27) ----------
  function firePrevention() {
    const W = 640, H = 300;
    let s = T(W / 2, 20, 'Prevention: where the dangers collect and where the alarms go', { size: 15, weight: 700 });
    // cross-section of a cabin boat
    s += `<path d="M60,70 L60,200 Q60,250 120,258 L520,258 Q580,250 580,200 L580,70 Z" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`;
    s += line(60, 150, 580, 150, LINE, { sw: 1, dash: '4 3' }) + T(590, 150, 'deck', { size: 9, fill: MUTED, anchor: 'start' });
    // engine box and vapour layer
    s += rect(400, 160, 120, 60, INK2, 'none', { rx: 4 }) + T(460, 192, 'ENGINE', { size: 11, weight: 800, fill: PAPER });
    s += `<path d="M90,230 Q300,215 548,232 L548,256 L90,256 Z" fill="${SMOKE}" opacity="0.45"/>`;
    s += arrow([[300, 170], [300, 222]], INK2, { sw: 2 }) + lines(300, 240, ['petrol vapour and LPG: heavier than air', '(petrol vapour about 2.8 x), they pool in the bilge'], { size: 10, lh: 12, fill: INK, weight: 600 });
    // blower
    s += circ(540, 110, 14, PAPER, INK, 1.5) + `<path d="M540,98 C548,104 548,116 540,122 C532,116 532,104 540,98 Z" fill="${SEA}"/>` + lines(540, 136, ['blower: ventilate', 'BEFORE starting'], { size: 9.5, lh: 11, fill: INK2 });
    // gas detector low
    s += rect(120, 234, 40, 14, C.yellow, INK, { rx: 2, sw: 0.9 }) + T(140, 241, 'GAS', { size: 8, weight: 800, fill: INK }) + lines(140, 270, ['LPG detector: as LOW', 'as possible'], { size: 9.5, lh: 11, fill: INK2 });
    // heater and CO alarm high
    s += rect(100, 100, 30, 44, INK2, 'none', { rx: 3 }) + T(115, 160, 'heater', { size: 9, fill: INK2 });
    s += circ(170, 88, 11, PAPER, INK, 1.5) + T(170, 89, 'CO', { size: 8, weight: 800 }) + lines(230, 84, ['CO alarm: HIGH, above 1.5 m,', 'near the heater'], { size: 9.5, lh: 11, fill: INK2 });
    s += line(60, 110, 580, 110, LINE, { sw: 1, dash: '2 4' }) + T(590, 110, '1.5 m', { size: 9, fill: MUTED, anchor: 'start' });
    // extinguisher at companionway
    s += extinguisher(360, 128, 0.9) + lines(360, 96, ['2 kg ABC powder, min. 13A 89B C,', 'in a bracket by the exit'], { size: 9.5, lh: 11, fill: INK2 });
    return S.svg(W, H, s, { label: 'Cross-section of a boat: petrol vapour and LPG collect in the bilge, gas detector low, CO alarm high, extinguisher by the exit' });
  }

  // ---------- picture question: fire aft or forward, which way to turn (F91) ----------
  function fireScene(fireAft) {
    const W = 360, H = 260;
    let s = water(0, 0, W, H);
    s += wind(60, 40, Math.PI / 2, 'wind');
    s += boatPlan(180, 130, 130, 46, C.hullLight, 0);
    s += flames(180, fireAft ? 190 : 86, 0.9);
    const py = fireAft ? 90 : 170;
    s += circ(180, py, 5, INK2) + circ(166, py + 12, 5, INK2) + circ(194, py + 12, 5, INK2);
    s += T(180, 230, fireAft ? 'fire at the STERN, crew forward' : 'fire at the BOW, crew aft', { size: 11, weight: 700 }) + T(180, 246, 'boat currently heading into the wind', { size: 10, fill: INK2 });
    return S.svg(W, H, s, { label: fireAft ? 'Fire at the stern, wind from ahead' : 'Fire at the bow, wind from ahead' });
  }

  // ---------- ILL-7 MAYDAY card (F44-F46) ----------
  function maydayCard() {
    const W = 640, H = 400;
    let s = rect(20, 12, 600, 376, PAPER, INK, { rx: 10, sw: 1.5 });
    s += rect(20, 12, 600, 40, BAD, 'none', { rx: 10 }) + rect(20, 32, 600, 20, BAD, 'none', { rx: 0 });
    s += T(320, 32, 'DISTRESS: grave and imminent danger to life or vessel', { size: 14, weight: 800, fill: '#fff' });
    // step 1
    s += circ(50, 86, 12, ACC) + T(50, 87, '1', { size: 12, weight: 800, fill: 'var(--accent-ink)' });
    s += circ(90, 86, 14, C.red, INK, 1.2) + T(90, 87, 'SOS', { size: 7, weight: 800, fill: '#fff' });
    s += lines(116, 80, ['Press and HOLD the red DSC DISTRESS button until the radio confirms', 'The alert goes out digitally on channel 70 with your MMSI and GPS position'], { size: 11, lh: 14, anchor: 'start', fill: INK });
    // step 2
    s += circ(50, 134, 12, ACC) + T(50, 135, '2', { size: 12, weight: 800, fill: 'var(--accent-ink)' });
    s += T(70, 128, 'Distress CALL on channel 16, speak slowly:', { size: 11, weight: 700, anchor: 'start' });
    s += rect(70, 140, 320, 62, PAPER2, LINE, { rx: 6 });
    s += lines(80, 154, ['MAYDAY MAYDAY MAYDAY', 'THIS IS  [boat name] x3', '[call sign]  [MMSI]'], { size: 11.5, lh: 17, anchor: 'start', fill: INK, family: 'var(--font-mono)', weight: 700 });
    // step 3
    s += circ(50, 224, 12, ACC) + T(50, 225, '3', { size: 12, weight: 800, fill: 'var(--accent-ink)' });
    s += T(70, 218, 'Distress MESSAGE:', { size: 11, weight: 700, anchor: 'start' });
    s += rect(70, 230, 320, 112, PAPER2, LINE, { rx: 6 });
    s += lines(80, 244, ['MAYDAY  [name, call sign, MMSI]', 'POSITION ...', 'NATURE OF DISTRESS ...', 'ASSISTANCE REQUIRED ...', 'PERSONS ON BOARD ...', 'OVER'], { size: 11.5, lh: 16.5, anchor: 'start', fill: INK, family: 'var(--font-mono)', weight: 700 });
    // side strip
    s += rect(410, 140, 196, 96, WARNBG, WARN, { rx: 6 });
    s += lines(508, 158, ['PAN PAN x3 = urgency', 'serious, but no immediate', 'danger to life', '(engine failure, injury)'], { size: 10.5, lh: 13, fill: INK });
    s += T(508, 222, 'MAYDAY only when life is at risk', { size: 9.5, weight: 700, fill: WARN });
    s += rect(410, 246, 196, 60, SHALLOW, SEA, { rx: 6 });
    s += lines(508, 262, ['SECURITE x3 = safety', 'navigation hazard or', 'weather warning'], { size: 10.5, lh: 13, fill: INK });
    // phone strip
    s += rect(30, 354, 580, 26, PAPER2, LINE, { rx: 6 });
    s += T(320, 367, '112 emergency  |  120 coast radio (assistance)  |  113 medical  |  110 fire  |  02016 Society for Sea Rescue', { size: 10.5, weight: 600, fill: INK });
    return S.svg(W, H, s, { label: 'VHF distress procedure card: DSC button, MAYDAY call, MAYDAY message, PAN PAN and SECURITE, phone numbers' });
  }

  // ---------- ILL-8 emergency numbers wheel (F45, F47-F49) ----------
  function numbersWheel(o) {
    o = o || {};
    const W = 640, H = 330, cx = 220, cy = 170, R = 130;
    const segs = [
      { n: '112', lab: 'police / general emergency', col: '#2c5aa0' },
      { n: '113', lab: 'medical emergency', col: '#c0392b' },
      { n: '110', lab: 'fire', col: '#d35400' },
      { n: '120', lab: 'nearest coast radio', col: '#1f7a5c' },
      { n: '02016', lab: 'Sea Rescue assistance', col: '#7d6608' },
    ];
    let s = '';
    segs.forEach((g, i) => {
      const a1 = i * 72, a2 = a1 + 72, mid = (a1 + a2) / 2;
      s += S.sector(cx, cy, R, a1, a2, g.col, o.hide === g.n ? 0.15 : 0.85);
      const lx = cx + Math.sin(S.deg(mid)) * R * 0.68, ly = cy - Math.cos(S.deg(mid)) * R * 0.68;
      s += T(lx, ly - 6, o.hide === g.n ? '?' : g.n, { size: g.n.length > 3 ? 15 : 19, weight: 800, fill: '#fff' });
      const ex = cx + Math.sin(S.deg(mid)) * (R + 16), ey = cy - Math.cos(S.deg(mid)) * (R + 16);
      s += T(ex, ey, o.hide === g.n ? '' : g.lab, { size: 10, fill: INK2, anchor: mid > 180 ? 'end' : mid === 180 ? 'middle' : 'start', weight: 600 });
    });
    for (let i = 0; i < 5; i++) { const a = S.deg(i * 72); s += line(cx, cy, cx + Math.sin(a) * R, cy - Math.cos(a) * R, PAPER, { sw: 2 }); }
    s += circ(cx, cy, 44, PAPER, INK, 1.5) + lines(cx, cy - 8, ['VHF', 'CH 16 / DSC'], { size: 11, weight: 800, lh: 14 });
    if (!o.hide) {
      s += rect(400, 60, 220, 220, PAPER2, LINE);
      s += lines(510, 84, ['At sea, 112 / 113 / 110 are', 'passed on to the Joint Rescue', 'Coordination Centre.', '', '120 connects a mobile phone to', 'the nearest coast radio station', '(report a need for assistance).', '', '02016 is the Norwegian Society', 'for Sea Rescue: towing and help,', 'not an emergency number.', '', '112 works without SIM or signal', 'from your own operator.'], { size: 10.5, lh: 13.5, fill: INK });
    } else {
      s += T(510, 170, 'Which number is missing?', { size: 13, weight: 700 });
    }
    return S.svg(W, H, s, { label: 'Norwegian emergency numbers: 112 police, 113 medical, 110 fire, 120 coast radio, 02016 Sea Rescue; VHF channel 16 in the centre' });
  }

  // ---------- ILL-6 flares (F61-F64). Wind from the LEFT; lee = right. ----------
  function flareBoat(x, y) { // small side-view boat, bow to the right, deck at y
    return `<path d="M${x},${y} L${x + 150},${y} Q${x + 190},${y - 2} ${x + 196},${y + 4} L${x + 184},${y + 26} L${x + 8},${y + 26} Z" fill="${C.hullLight}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  function flares(o) {
    o = o || {};
    const W = 640, H = 330;
    let s = o.title === false ? '' : T(W / 2, 18, 'Pyrotechnic distress signals and how to use them', { size: 15, weight: 700 });
    s += wind(40, 60, 0, 'wind');
    const panels = [
      { t: 'Red hand flare', cap: ['Pull the handle out until it locks,', 'remove the cap, fire', 'Arm out, pointing DOWN and away,', 'on the lee (downwind) side', 'about 60 s, seen about 5 NM', 'shows your exact position'] },
      { t: 'Red parachute rocket', cap: ['Back to the wind, arm extended,', 'vertical or tilted up to 15 degrees', 'downwind, never into the wind', 'about 300 m, 40 s, 25+ NM', 'to be noticed far away', 'fire 2-3, keep some for later'] },
      { t: 'Orange smoke', cap: ['DAYTIME only, about 3 minutes', 'Floating smoke: activate and', 'throw it into the water clear of', 'the boat, never hold it', 'shows the helicopter pilot', 'the wind direction'] },
    ];
    panels.forEach((p, i) => {
      const x = 20 + i * 204;
      s += rect(x, 36, 196, 268, PAPER, LINE) + T(x + 98, 54, p.t, { size: 12.5, weight: 700, fill: i < 2 ? C.red : C.orange });
      s += water(x + 2, 170, 192, 30);
      s += flareBoat(x + 10, 150);
      if (i === 0) { // person on the right (lee) side, flare pointing down and outboard
        s += person(x + 150, 100, { jacket: true, noLegs: true }) + line(x + 158, 118, x + 182, 142, SKIN, { sw: 3.5 });
        s += line(x + 182, 142, x + 192, 158, INK2, { sw: 4 }) + circ(x + 194, 160, 6, C.red) + circ(x + 198, 172, 1.5, C.red) + circ(x + 194, 178, 1.5, C.red) + circ(x + 201, 180, 1.5, C.red);
      }
      if (i === 1) { // back to the wind, rocket nearly vertical tilted slightly right
        s += person(x + 90, 104, { jacket: true, noLegs: true }) + line(x + 98, 118, x + 114, 92, SKIN, { sw: 3.5 });
        s += line(x + 114, 92, x + 120, 68, INK2, { sw: 4 }) + circ(x + 121, 64, 4, C.red);
        s += line(x + 122, 60, x + 150, -10 + 70, C.red, { sw: 1.2, dash: '3 3' });
        s += `<path d="M${x + 136},${72} Q${x + 150},${56} ${x + 164},${72}" fill="none" stroke="${INK2}" stroke-width="1.5"/>` + line(x + 136, 72, x + 150, 84, INK2, { sw: 1 }) + line(x + 164, 72, x + 150, 84, INK2, { sw: 1 }) + circ(x + 150, 86, 4, C.red);
        s += T(x + 170, 100, '15 deg max', { size: 8.5, fill: INK2 });
      }
      if (i === 2) { // floating canister in the water, plume with the wind (left to right)
        s += rect(x + 80, 164, 14, 14, C.orange, INK, { rx: 2, sw: 0.9 });
        s += `<path d="M${x + 88},${166} C${x + 100},${140} ${x + 130},${150} ${x + 150},${124} C${x + 160},${112} ${x + 175},${118} ${x + 186},${110}" fill="none" stroke="${C.orange}" stroke-width="11" stroke-linecap="round" opacity="0.8"/>`;
        s += rect(x + 130, 66, 40, 10, INK2, 'none', { rx: 3 }) + line(x + 110, 60, x + 190, 60, INK2, { sw: 2 }) + line(x + 170, 76, x + 180, 82, INK2, { sw: 2 }) + T(x + 150, 92, 'helicopter', { size: 8.5, fill: MUTED });
      }
      s += lines(x + 98, 214, p.cap, { size: 9.3, lh: 12.5, fill: INK2 });
    });
    s += T(W / 2, 318, 'All three are Annex IV distress signals; misuse is prohibited. Check expiry (typically 3-5 years from production); return expired units to a dealer.', { size: 9.5, fill: MUTED });
    return S.svg(W, H, s, { label: 'Red hand flare held down and away on the lee side, red parachute rocket fired with back to the wind, orange floating smoke in the water' });
  }
  /* single flare type for picture questions */
  function flareIcon(kind) {
    const W = 220, H = 150;
    let s = '';
    if (kind === 'hand') s += rect(95, 40, 30, 80, INK2, 'none', { rx: 4 }) + rect(92, 30, 36, 14, C.red, INK, { rx: 3, sw: 0.9 }) + T(110, 138, 'hand-held, burning red', { size: 10, fill: INK2 });
    if (kind === 'rocket') s += rect(100, 30, 20, 90, C.red, INK, { rx: 4, sw: 0.9 }) + `<path d="M100,30 L110,10 L120,30 Z" fill="${INK2}"/>` + T(110, 138, 'rocket with parachute, red light', { size: 10, fill: INK2 });
    if (kind === 'smoke') s += rect(90, 70, 40, 50, C.orange, INK, { rx: 4, sw: 0.9 }) + `<path d="M110,70 C100,50 130,40 120,20" fill="none" stroke="${C.orange}" stroke-width="9" stroke-linecap="round" opacity="0.8"/>` + T(110, 138, 'orange smoke, daytime', { size: 10, fill: INK2 });
    if (kind === 'white') s += rect(95, 40, 30, 80, INK2, 'none', { rx: 4 }) + rect(92, 30, 36, 14, C.white, INK, { rx: 3, sw: 0.9 }) + T(110, 138, 'hand-held, burning white', { size: 10, fill: INK2 });
    if (kind === 'arms') s += circ(110, 40, 8, SKIN, INK, 0.8) + rect(100, 50, 20, 34, C.orange, INK, { rx: 3, sw: 0.8 }) + line(100, 56, 70, 36, SKIN, { sw: 4 }) + line(120, 56, 150, 36, SKIN, { sw: 4 }) + arrow([[66, 48], [66, 78]], INK2) + arrow([[66, 78], [66, 48]], INK2) + arrow([[154, 48], [154, 78]], INK2) + arrow([[154, 78], [154, 48]], INK2) + T(110, 138, 'arms outstretched, raised and lowered slowly', { size: 9.5, fill: INK2 });
    if (kind === 'flags') s += rect(60, 30, 100, 36, C.white, INK, { rx: 0, sw: 1 }) + `<rect x="60" y="30" width="25" height="18" fill="${C.blue}"/><rect x="85" y="30" width="25" height="18" fill="${C.white}"/><rect x="110" y="30" width="25" height="18" fill="${C.blue}"/><rect x="135" y="30" width="25" height="18" fill="${C.white}"/><rect x="60" y="48" width="25" height="18" fill="${C.white}"/><rect x="85" y="48" width="25" height="18" fill="${C.blue}"/><rect x="110" y="48" width="25" height="18" fill="${C.white}"/><rect x="135" y="48" width="25" height="18" fill="${C.blue}"/>` + `<rect x="60" y="74" width="100" height="36" fill="${C.blue}" stroke="${INK}"/><rect x="60" y="83" width="100" height="18" fill="${C.white}"/><rect x="60" y="88" width="100" height="8" fill="${C.red}"/>` + T(110, 128, 'N over C', { size: 10, weight: 700, fill: INK2 });
    return S.svg(W, H, s, { label: 'Signal: ' + kind });
  }
