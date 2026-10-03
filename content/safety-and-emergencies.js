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
    s += boatPlan(x + 100, y + 95, 70, 26, C.hullLight, 0) + flames(x + 100, y + 128, 0.72) + circ(x + 100, y + 72, 3.5, INK2) + circ(x + 92, y + 78, 3.5, INK2) + circ(x + 108, y + 78, 3.5, INK2);
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
    s += person(x + 70, y + 52, { noLegs: true }) + extinguisher(x + 94, y + 84, 0.8);
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
    s += line(60, 150, 580, 150, LINE, { sw: 1, dash: '4 3' }) + T(590, 150, 'cabin floor', { size: 9, fill: MUTED, anchor: 'start' });
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
    s += circ(170, 88, 11, PAPER, INK, 1.5) + T(170, 89, 'CO', { size: 8, weight: 800 }) + lines(188, 84, ['CO alarm: HIGH, above 1.5 m,', 'near the heater'], { size: 9.5, lh: 11, fill: INK2, anchor: 'start' });
    s += line(60, 110, 580, 110, LINE, { sw: 1, dash: '2 4' }) + T(590, 110, '1.5 m', { size: 9, fill: MUTED, anchor: 'start' });
    // extinguisher at companionway
    s += extinguisher(360, 142, 0.9) + lines(360, 92, ['2 kg ABC powder, min. 13A 89B C,', 'in a bracket by the exit'], { size: 9.5, lh: 11, fill: INK2 });
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
    const W = 640, H = 330, cx = 200, cy = 170, R = 120;
    const segs = [
      { n: '112', lab: 'police / general emergency', col: '#2c5aa0' },
      { n: '113', lab: 'medical emergency', col: '#c0392b' },
      { n: '110', lab: 'fire', col: '#d35400' },
      { n: '120', lab: 'coast radio', col: '#1f7a5c' },
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
      s += rect(445, 50, 185, 236, PAPER2, LINE);
      s += lines(537, 72, ['At sea, 112 / 113 / 110 are', 'passed on to the Joint Rescue', 'Coordination Centre.', '', '120 connects a mobile phone to', 'the nearest coast radio station', '(report a need for assistance).', '', '02016 is the Norwegian Society', 'for Sea Rescue: towing and help,', 'not an emergency number.', '', '112 works without SIM or signal', 'from your own operator.'], { size: 10.5, lh: 13.5, fill: INK });
    } else {
      s += T(500, 170, 'Which number is missing?', { size: 13, weight: 700 });
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
        s += line(x + 124, 58, x + 146, 78, C.red, { sw: 1.2, dash: '3 3' });
        s += `<path d="M${x + 136},${84} Q${x + 150},${68} ${x + 164},${84}" fill="none" stroke="${INK2}" stroke-width="1.5"/>` + line(x + 136, 84, x + 150, 96, INK2, { sw: 1 }) + line(x + 164, 84, x + 150, 96, INK2, { sw: 1 }) + circ(x + 150, 98, 4, C.red);
        s += T(x + 172, 112, '15 deg max', { size: 8.5, fill: INK2 });
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
    if (kind === 'flags') s += rect(60, 30, 100, 36, C.white, INK, { rx: 0, sw: 1 }) + [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => `<rect x="${60 + c * 25}" y="${30 + r * 9}" width="25" height="9" fill="${(r + c) % 2 === 0 ? C.blue : C.white}"/>`).join('')).join('') + `<rect x="60" y="74" width="100" height="36" fill="${C.blue}" stroke="${INK}"/><rect x="60" y="83" width="100" height="18" fill="${C.white}"/><rect x="60" y="88" width="100" height="8" fill="${C.red}"/>` + T(110, 128, 'N over C', { size: 10, weight: 700, fill: INK2 });
    return S.svg(W, H, s, { label: 'Signal: ' + kind });
  }

  // ---------- ILL-4 man overboard: actions and the Williamson turn (F84, F85, F93) ----------
  function trackPoints(x0, y0, h0, R1, R2) {
    // heading h in degrees, 0 = up, clockwise. Start at the MOB point heading h0; starboard turn 60 deg (radius R1),
    // then port turn 240 deg (radius R2, tighter: hard over) to the reciprocal heading. F85: 60 deg, then hard over the other way.
    const pts = []; let x = x0, y = y0, h = h0;
    const step = (dh, R, n) => { const ds = Math.abs(S.deg(dh)) * R / n; for (let i = 0; i < n; i++) { h += dh / n; x += Math.sin(S.deg(h)) * ds; y -= Math.cos(S.deg(h)) * ds; pts.push([x, y]); } };
    pts.push([x, y]);
    const mark = { x: 0, y: 0, h: 0 };
    step(60, R1, 30); mark.x = x; mark.y = y; mark.h = h;
    step(-240, R2, 90);
    const endH = h; for (let i = 0; i < 80; i++) { const along = (x - x0) * Math.sin(S.deg(h0)) - (y - y0) * Math.cos(S.deg(h0)); if (along < -14) break; x += Math.sin(S.deg(endH)) * 4; y -= Math.cos(S.deg(endH)) * 4; pts.push([x, y]); }
    return { pts, mark, endH };
  }
  function mobTurn(o) {
    o = o || {};
    const W = 640, H = 420;
    let s = '';
    if (!o.quiz) {
      s += T(W / 2, 18, 'Man overboard: act first, then turn', { size: 15, weight: 700 });
      // Panel A: four actions
      const acts = [['Shout', '"MAN OVERBOARD"'], ['Throw the lifebuoy', 'with light and line'], ['Press MOB', 'on the plotter'], ['One person points', 'and never looks away']];
      acts.forEach((a, i) => {
        const x = 20 + i * 152;
        s += rect(x, 32, 144, 86, PAPER, LINE);
        if (i === 0) s += `<path d="M${x + 22},${56} L${x + 46},${48} L${x + 46},${80} L${x + 22},${72} Z" fill="${INK2}"/>` + rect(x + 14, 58, 10, 12, INK2, 'none', { rx: 2 }) + line(x + 52, 58, x + 60, 54, INK2) + line(x + 52, 64, x + 62, 64, INK2) + line(x + 52, 70, x + 60, 74, INK2);
        if (i === 1) s += circ(x + 38, 64, 16, C.orange, INK, 1.2) + circ(x + 38, 64, 8, PAPER, 'none') + circ(x + 38, 50, 3, C.white, INK, 0.6) + `<path d="M${x + 54},${66} q10,8 4,20 q-6,10 6,16" fill="none" stroke="${INK2}" stroke-width="1.5"/>`;
        if (i === 2) s += rect(x + 16, 46, 48, 34, INK2, 'none', { rx: 4 }) + rect(x + 20, 50, 40, 20, '#1e2a16', 'none', { rx: 2 }) + rect(x + 32, 84, 16, 10, C.red, INK, { rx: 2, sw: 0.8 }) + T(x + 40, 89, 'MOB', { size: 6.5, weight: 800, fill: '#fff' });
        if (i === 3) s += person(x + 30, 50, { jacket: true, noLegs: true }) + line(x + 38, 64, x + 66, 56, SKIN, { sw: 3.5 }) + circ(x + 70, 55, 2.5, SKIN);
        s += lines(x + 72, 101, a, { size: 9.4, lh: 11.5, fill: INK, weight: 600 });   // captions below the icons so they never overlap
      });
    }
    // Panel B: track diagram, north up. Original course 045 from bottom-left.
    const bx = 20, by = o.quiz ? 20 : 130, bw = 400, bh = o.quiz ? 380 : 270;
    s += rect(bx, by, bw, bh, SHALLOW, LINE);
    const ox = bx + 60, oy = by + bh - 40, mx = bx + 150, my = by + bh - 130; // original track: 045
    s += line(ox, oy, mx + 230, my - 230, INK2, { sw: 1.5, dash: '6 5' });
    s += T(ox + 14, oy - 2, 'original course 045', { size: 9.5, fill: INK2, anchor: 'start' });
    const tr = trackPoints(mx, my, 45, 70, 36);
    s += `<polyline points="${tr.pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="2.6" stroke-linejoin="round"/>`;
    const last = tr.pts[tr.pts.length - 1], prev = tr.pts[tr.pts.length - 2];
    s += head(last[0], last[1], Math.atan2(last[1] - prev[1], last[0] - prev[0]), C.blue, 12);
    // MOB point
    s += circ(mx, my, 7, C.red) + circ(mx, my, 3, SKIN) + T(mx - 12, my + 14, 'MOB', { size: 9.5, weight: 800, fill: C.red, anchor: 'end' });
    // 60 degree angle marker at the point where the helm is reversed
    const m = tr.mark;
    s += line(m.x, m.y, m.x + Math.sin(S.deg(45)) * 40, m.y - Math.cos(S.deg(45)) * 40, INK2, { sw: 1, dash: '3 3' });
    s += line(m.x, m.y, m.x + Math.sin(S.deg(m.h)) * 40, m.y - Math.cos(S.deg(m.h)) * 40, INK2, { sw: 1, dash: '3 3' });
    s += `<path d="M${(m.x + Math.sin(S.deg(45)) * 28).toFixed(1)},${(m.y - Math.cos(S.deg(45)) * 28).toFixed(1)} A28,28 0 0,1 ${(m.x + Math.sin(S.deg(m.h)) * 28).toFixed(1)},${(m.y - Math.cos(S.deg(m.h)) * 28).toFixed(1)}" fill="none" stroke="${BAD}" stroke-width="1.6"/>`;
    s += T(m.x + 46, m.y - 22, o.quiz ? '?' : '60 deg', { size: 11, weight: 800, fill: BAD });
    // boat at start
    s += boatPlan(ox + 30, oy - 30, 30, 12, C.hullLight, 45);
    // labels
    s += rect(bx + bw - 232, by + bh - 74, 224, 66, PAPER, LINE, { rx: 6, opacity: 0.95 });
    s += lines(bx + bw - 224, by + bh - 60, ['1. Hard over to one side until', '    ' + (o.quiz ? '?' : '60') + ' degrees off the course', '2. Hard over the other way until', '    on the opposite course', '3. The casualty appears ahead'], { size: 9.5, lh: 11.5, anchor: 'start', fill: INK });
    if (!o.quiz) {
      // Panel C: approach and recovery
      const cx = 436, cy = 130;
      s += rect(cx, cy, 184, 270, PAPER, LINE);
      s += T(cx + 92, cy + 16, 'Approach and recover', { size: 11.5, weight: 700 });
      s += wind(cx + 92, cy + 36, Math.PI / 2, 'wind');
      s += boatPlan(cx + 70, cy + 110, 70, 26, C.hullLight, 0);
      s += circ(cx + 112, cy + 112, 6, C.orange, INK, 1) + circ(cx + 112, cy + 112, 2.5, SKIN) + T(cx + 112, cy + 130, 'alongside', { size: 8.5, fill: INK2 });
      s += circ(cx + 70, cy + 150, 7, PAPER, INK, 1) + line(cx + 64, cy + 144, cx + 76, cy + 156, C.red, { sw: 2 }) + line(cx + 76, cy + 144, cx + 64, cy + 156, C.red, { sw: 2 }) + T(cx + 70, cy + 166, 'engine in neutral', { size: 8.5, weight: 700, fill: BAD });
      s += lines(cx + 92, cy + 190, ['Head into the wind so you', 'stop with the casualty alongside.', 'Use the ladder or a line: a wet,', 'limp adult is too heavy to lift.', 'Keep a cold person horizontal.', 'Not found quickly? MAYDAY.'], { size: 9.3, lh: 12, fill: INK2 });
    }
    return S.svg(W, H, s, { label: 'Man overboard: shout, throw, mark, point; Williamson turn 60 degrees to one side then hard over to the reciprocal course; approach into the wind with the engine in neutral' });
  }

  // ---------- ILL-5 HELP position, huddle, 1-10-1 (F67-F69, F72) ----------
  function helpPosition() {
    const W = 640, H = 340;
    let s = T(W / 2, 18, 'In cold water: breathe, then save heat', { size: 15, weight: 700 });
    // left: HELP side view
    s += rect(20, 34, 300, 196, PAPER, LINE) + T(170, 50, 'HELP position (alone)', { size: 12, weight: 700 });
    s += water(22, 120, 296, 108);
    // person: head out, collar, torso tilted back, knees drawn up, arms folded across the chest
    const hx = 150, hy = 100;
    s += `<path d="M${hx - 16},${hy + 12} Q${hx - 18},${hy - 8} ${hx},${hy - 10} Q${hx + 18},${hy - 8} ${hx + 16},${hy + 12} Z" fill="${C.orange}" stroke="${INK}" stroke-width="0.8"/>`;
    s += circ(hx, hy, 9, SKIN, INK, 0.8);
    s += `<path d="M${hx - 14},${hy + 10} L${hx - 22},${hy + 44} L${hx + 14},${hy + 50} L${hx + 16},${hy + 10} Z" fill="${C.orange}" stroke="${INK}" stroke-width="0.8"/>`;
    // thighs drawn up toward the chest, shins hanging down
    s += `<path d="M${hx + 2},${hy + 48} L${hx + 30},${hy + 26} L${hx + 40},${hy + 52}" fill="none" stroke="${INK2}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    // upper arms along the sides, forearms folded across the chest
    s += `<path d="M${hx - 14},${hy + 16} L${hx - 10},${hy + 34} L${hx + 12},${hy + 28}" fill="none" stroke="${SKIN}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += arrow([[70, 86], [hx - 16, hy + 26]], INK2) + lines(60, 66, ['arms clamp', 'the armpits'], { size: 9.5, lh: 11, fill: INK2 });
    s += arrow([[238, 158], [hx + 38, hy + 34]], INK2) + lines(256, 166, ['knees up,', 'protect the groin'], { size: 9.5, lh: 11, fill: INK2 });
    s += arrow([[236, 86], [hx + 16, hy - 2]], INK2) + lines(238, 70, ['head out,', 'collar supports'], { size: 9.5, lh: 11, fill: INK2, anchor: 'start' });
    s += lines(170, 196, ['Cuts heat loss by about one third.', 'Only works with a life jacket on.'], { size: 10, lh: 12.5, fill: INK, weight: 600 });
    // right: huddle top view
    s += rect(336, 34, 284, 196, PAPER, LINE) + T(478, 50, 'Huddle (several people)', { size: 12, weight: 700 });
    s += circ(478, 130, 60, SHALLOW, 'none');
    [0, 120, 240].forEach(a => {
      const px = 478 + Math.sin(S.deg(a)) * 30, py = 130 - Math.cos(S.deg(a)) * 30;
      s += circ(px, py, 13, C.orange, INK, 1) + circ(px, py, 7, SKIN, INK, 0.8);
      const nx = 478 + Math.sin(S.deg(a + 120)) * 30, ny = 130 - Math.cos(S.deg(a + 120)) * 30;
      s += line(px, py, nx, ny, SKIN, { sw: 4 });
    });
    s += circ(478, 130, 7, SKIN, INK, 0.8);
    s += lines(478, 196, ['Chest to chest, arms over shoulders;', 'weakest or children in the middle;', 'a bigger target for rescuers.'], { size: 10, lh: 12.5, fill: INK, weight: 600 });
    // bottom timeline 1-10-1
    const segs = [[BADBG, BAD, '1 minute', 'cold shock: float on your back, control your breathing'], [WARNBG, WARN, '10 minutes', 'useful movement: get to the boat or ladder, signal'], [SHALLOW, SEA, '1 hour', 'hypothermia: HELP or huddle, stay still, stay with the boat']];
    segs.forEach((g, i) => {
      const x = 20 + i * 200;
      s += rect(x, 244, 196, 62, g[0], g[1]) + T(x + 98, 260, g[2], { size: 13, weight: 800, fill: g[1] }) + lines(x + 98, 278, g[3].split(': ').map((t, k) => k === 0 ? t + ':' : t), { size: 9.5, lh: 12, fill: INK });
    });
    s += T(W / 2, 326, 'Norwegian sea water is about 6-10 C. Do not swim for shore unless it is very close.', { size: 10.5, fill: MUTED });
    return S.svg(W, H, s, { label: 'HELP position with knees up and arms clamped, a huddle of three, and the 1-10-1 cold-water timeline' });
  }

  BOAT.register({
    id: 'safety-and-emergencies',
    title: 'Safety equipment and emergencies',
    order: 8,
    examShare: 6,
    examWeight: 'about 6 to 10 of 50 questions, two of them in part 4',
    summary: 'What a recreational boat must and should carry, the law on wearing a life jacket, how to prevent and fight fire, how to call for help (VHF channel 16, DSC, the coast radio number 120, 112), the official distress signals, and what to do when someone falls overboard, the boat takes on water, or a casualty has been in cold water. Two items here are "particularly important topics": the flotation-device rules (1.4.5) and 120 / channel 16 (1.4.6).',
    sections: [
      // 1 ------------------------------------------------------------
      {
        id: 'overview',
        title: 'What this topic is and how the exam tests it',
        html: `<p>Most boating deaths in Norway do not happen in storms far out at sea. They happen to older men in small open motorboats, in sheltered water, often while fishing or stepping between the quay and the boat, usually without a life jacket and often after drinking. In 2025 the Norwegian Maritime Authority recorded 18 deaths; 11 of them wore no flotation device. This topic is the knowledge that would have saved most of them.</p>
<p>On the official syllabus the material sits in <strong>part 1, seamanship</strong>: safety equipment and its correct use, fire hazards and fire fighting, VHF and mobile phone at sea, precautions and emergencies, the rescue service, and first aid. Two pieces are lifted into <strong>part 4, the "particularly important topics"</strong>, where you may make at most two mistakes in the whole exam:</p>
<ul>
<li><strong>1.4.5</strong>: the rules on the use of flotation devices (who must wear one, when, and who is responsible).</li>
<li><strong>1.4.6</strong>: emergencies, meaning the coast radio station's telephone number <strong>120</strong> and <strong>VHF channel 16</strong>.</li>
</ul>
<p>Course providers report that this material gives roughly six to ten questions in a 50-question exam, and that 120, channel 16 and the life-jacket rules turn up in part 4 almost every time. The style is simple: direct recall ("which number reaches the coast radio from a mobile phone?"), rule application ("a 7.5 m boat is under way; who must wear a life jacket?") and short scenarios ("your engine fails 200 m upwind of rocks; what do you do first?"). The distress signals of Annex IV to the Rules of the Road also belong to this topic (they are formally part 2).</p>
<div class="callout tip"><p>Learn five numbers cold: <strong>8 m</strong> (wear a life jacket below this length), <strong>15 years</strong> (skipper responsible for younger children), <strong>120</strong> (coast radio from a mobile), <strong>16</strong> (VHF distress channel) and <strong>112</strong> (emergency). Two of them are part-4 material.</p></div>`,
        keyFacts: ['Part 1 seamanship, plus part-4 items 1.4.5 (flotation rules) and 1.4.6 (120 and channel 16)', 'Typical victim: older man, open motorboat, sheltered water, no life jacket, often alcohol', '2025: 18 deaths, 11 without a flotation device; 2024: 40 deaths, 30 without', 'About 6 to 10 questions out of 50 come from this topic'],
        check: { q: 'Which two items from this topic belong to part 4 of the exam, where more than two errors fail you?', options: ['Fire classes and extinguisher sizes', 'The flotation-device rules and the numbers 120 / channel 16', 'CPR ratios and hypothermia stages', 'The Williamson turn and the HELP position'], answer: 1, explanation: 'Part 4 item 1.4.5 covers the rules on using flotation devices and 1.4.6 covers the coast radio number 120 and VHF channel 16. Everything else here is part 1 seamanship.' },
      },
      // 2 ------------------------------------------------------------
      {
        id: 'flotation-law',
        title: 'The life-jacket law: carry for all, wear under 8 m',
        html: `<p>A life jacket only helps if it is on your body when you hit the water, and a fall overboard is usually sudden. That is why the law has two layers: every boat must <em>carry</em> flotation for everyone, and on small boats everyone must <em>wear</em> it while moving. This is part-4 material (1.4.5).</p>
<div class="callout rule"><p><strong>Carry:</strong> every recreational boat under way must have suitable rescue and flotation equipment for <strong>everyone on board</strong>, whatever the boat's length (Small Craft Act, Section 23).<br><strong>Wear:</strong> in a recreational boat <strong>shorter than 8 metres</strong>, everyone must <strong>wear</strong> suitable flotation equipment when they are <strong>outdoors</strong> on the boat while it is <strong>under way</strong> (Section 23a, in force 1 May 2015).</p></div>
<p>Three words carry the rule. <strong>Shorter than 8 m</strong>: an 8.0 m boat is not covered, a 7.9 m boat is. <strong>Under way</strong> means propelled by engine, sail or oars; a boat lying at anchor with the engine off, or tied up at the quay, is not under way, so sunbathers on an anchored 6 m boat are not breaking the law (wearing is still recommended). <strong>Outdoors</strong>: someone inside the cabin of a small boat need not wear it at that moment.</p>
<p>Who answers for it? <strong>Each person is responsible for themselves</strong>, except that the <strong>skipper is responsible for everyone under 15 years</strong>. A 14-year-old without a jacket is the skipper's offence; a 15-year-old's is their own. "Suitable" means a life jacket, buoyancy aid, flotation clothing or inflatable vest that is <strong>CE- or wheel-marked</strong> as flotation equipment, in the right size. The 1995 Flotation Equipment Regulation also requires the gear to be approved to the recognised standards, durably marked, and stored easily accessible.</p>
<p>There are only two exemptions: pedal boats and rowing boats hired from a <em>staffed</em> rental business on a small lake or within a marked area close to shore, and organised sport under the Norwegian sports federation where the device would hinder the activity. The police issue on-the-spot fines for a missing or unworn jacket (currently NOK 900 per person).</p>
<div class="callout warn"><p>Trap: "everyone must wear a life jacket on all boats" is wrong. Wearing is compulsory only under 8 m, under way, outdoors. Carrying one for every person is compulsory on <em>every</em> boat.</p></div>`,
        illustration: () => vestScene({ len: '7.5', underway: true, jackets: true, child: true, childAge: 12 }),
        caption: 'A 7.5 m boat under way: everyone outdoors must wear flotation. The 12-year-old in the cabin is indoors, but the skipper remains responsible for the under-15.',
        keyFacts: ['Every recreational boat must CARRY suitable flotation for everyone on board', 'Shorter than 8 m + under way + outdoors = everyone must WEAR it (Section 23a, since 1 May 2015)', 'Each person is responsible for themselves; the skipper is responsible for persons under 15', 'Under way = propelled by engine, sail or oars; anchored or moored is not under way', 'Equipment must be CE- or wheel-marked and stored easily accessible'],
        check: { q: 'A 6 m open motorboat lies at anchor with the engine off while three adults swim and sunbathe. Must they wear flotation equipment on board?', options: ['Yes, the boat is under 8 m', 'Yes, whenever the boat is afloat', 'No, the boat is not under way, although wearing is recommended', 'No, the wearing rule applies only to boats over 8 m'], answer: 2, explanation: 'The wearing duty applies when the boat is under way, that is propelled by engine, sail or oars. An anchored boat is not under way. Suitable devices must still be on board for all three.' },
      },
      // 3 ------------------------------------------------------------
      {
        id: 'flotation-types',
        title: 'Choosing and checking the device: 50 to 275 newtons',
        html: `<p>Not every orange vest keeps an unconscious person's face out of the water. The European standard EN ISO 12402 sorts flotation devices into four buoyancy levels, measured in newtons (N) for an average adult, and the level decides what the device can do for you.</p>
<div class="table-wrap"><table><thead><tr><th>Level</th><th>What it is</th><th>Who and where</th><th>Unconscious wearer</th></tr></thead><tbody>
<tr><td><strong>50 N</strong></td><td>Buoyancy aid (not a life jacket); slim vest without collar</td><td>Competent swimmers over 30 kg, close to help, e.g. the sheltered archipelago</td><td>Not turned face-up; floats vertically</td></tr>
<tr><td><strong>100 N</strong></td><td>Classic life jacket with collar, belt, crotch straps and reflectors (whistle recommended)</td><td>Swimmers and non-swimmers in sheltered or coastal waters; the right choice for children and non-swimmers</td><td>Supports the head; face-up position not guaranteed</td></tr>
<tr><td><strong>150 N</strong></td><td>Usually an inflatable vest (automatic or manual CO2)</td><td>Adults, all waters and all weather; not recommended for children</td><td>Turns you face-up unless heavy or waterproof clothing is worn</td></tr>
<tr><td><strong>275 N</strong></td><td>Bulky inflatable</td><td>Offshore and extreme conditions, heavy waterproof clothing</td><td>Turns you face-up even in heavy clothing</td></tr>
</tbody></table></div>
<p>Two exam favourites follow from the table. A <strong>child or non-swimmer gets a 100 N jacket</strong> with a collar and a fastened crotch strap; the Norwegian Maritime Authority explicitly does <em>not</em> recommend inflatables for children. A <strong>50 N buoyancy aid is for swimmers over 30 kg near help</strong>; it is comfortable for paddling and dinghy sailing but will not save someone who is knocked out.</p>
<p>Inflatable vests are <strong>automatic</strong> (a water-soluble element fires the CO2 cylinder on immersion) or <strong>manual</strong> (pull toggle), with a mouth tube as backup. They need a yearly check, because the 2025 accident report includes a vest that "did not inflate on contact with water": <strong>1)</strong> unscrew and <strong>weigh the CO2 cylinder</strong> against the weight printed on it; <strong>2)</strong> check the <strong>firing element</strong> is not expired, damp or broken and replace it by the printed date; <strong>3)</strong> inflate the bladder and confirm it is still firm after <strong>24 hours</strong>. For every device: rated for your weight, <strong>crotch strap fastened</strong> (jackets ride up over the head otherwise), seams intact, stored dry and out of the sun.</p>`,
        illustration: () => buoyancyClasses(),
        caption: 'The four buoyancy levels of EN ISO 12402. More newtons means more support for an unconscious wearer in rougher water, at the cost of bulk.',
        keyFacts: ['50 N = buoyancy aid for swimmers over 30 kg close to help; does not turn you face-up', '100 N = life jacket with collar and crotch strap; best for children and non-swimmers', '150 N = inflatable for adults in all weather; not recommended for children', '275 N = offshore, turns you face-up even in heavy waterproof clothing', 'Inflatables: automatic or manual; yearly check = weigh the cylinder, firing element in date, holds air 24 h; crotch strap fastened'],
        check: { q: 'Which flotation device should a non-swimming 7-year-old wear on a fjord trip?', options: ['A 50 N buoyancy aid, because it gives freedom of movement', 'A 100 N life jacket with collar and crotch strap', 'A 150 N automatic inflatable vest', 'A 275 N offshore jacket'], answer: 1, explanation: 'The Norwegian Maritime Authority recommends 100 N with collar and crotch strap for children and non-swimmers. 50 N is only for swimmers over 30 kg, and inflatables are not recommended for children.' },
      },
      // 5 ------------------------------------------------------------
      {
        id: 'equipment',
        title: 'What else to carry, and why',
        html: `<p>Only two things are legally compulsory on a private recreational boat: <strong>flotation equipment for everyone</strong> and <strong>navigation lights</strong> when you are out at night or in poor visibility. Everything else on the Norwegian Maritime Authority's list is a recommendation, but the exam expects you to know what each item is for.</p>
<ul>
<li><strong>Kill switch (kill cord).</strong> A lanyard from your wrist or jacket to the engine's emergency stop. If you fall overboard the engine stops, so the boat does not circle back into you or drive off without you. There is no general legal duty to use it (a proposal from 2020 has not been adopted), but the Authority calls it "important to use".</li>
<li><strong>Boarding ladder</strong> reachable from the water. "A lifeless person in wet clothes is usually far too heavy to haul aboard alone." Practise climbing it.</li>
<li><strong>Anchor and drift anchor (drogue).</strong> After engine failure, anchoring stops you drifting onto a lee shore; a drogue from the bow slows the drift and holds the bow to the seas. A bucket on a long line from the bow is an acceptable improvisation.</li>
<li><strong>Lifebuoy with a light and a throwing line.</strong> If someone falls in, always throw it: it supports the person and marks the spot.</li>
<li><strong>Alerting:</strong> VHF, mobile phone, and ideally an EPIRB (boat) or PLB (personal) satellite beacon. The Authority recommends a PLB if you go out alone.</li>
<li><strong>Fire extinguisher</strong> (2 kg ABC powder minimum) and a smoke detector if you sleep aboard; <strong>first-aid kit</strong>; sound-signal device; oars, ropes, boat hook and fenders; spare fuel, tools and spares; paper chart and compass as backup to the plotter.</li>
</ul>
<p>Pyrotechnic distress signals (red hand flares, red parachute rockets, orange smoke) are strongly advised but not legally required for recreational boats; recommended quantities vary by course provider, so the exam does not ask for a fixed number. Whatever you carry, check the <strong>expiry date</strong> on flares and return expired ones to a dealer or collection point; they are explosive waste, never household rubbish.</p>
<div class="callout rule"><p>Legally required on a private recreational boat: flotation equipment for all on board, and navigation lights at night or in poor visibility. The rest is recommended equipment.</p></div>`,
        keyFacts: ['Only flotation for all and navigation lights are legally required; the rest is recommended', 'Kill cord stops the engine if the helmsman falls out; recommended, not a legal duty', 'Boarding ladder: a wet, lifeless adult is too heavy to lift aboard alone', 'Anchor or drogue stops the drift after engine failure; a bucket on a bow line works as a drogue', 'Lifebuoy with light and line: always throw it, it supports the person and marks the spot', 'PLB recommended when boating alone; flares not legally required but advised'],
        check: { q: 'Why does the Norwegian Maritime Authority say the kill cord is important?', options: ['It is compulsory above 15 knots', 'It stops the engine if the helmsman falls overboard, so the boat does not continue or circle back', 'It cuts the fuel supply in a fire', 'It triggers the DSC distress alert automatically'], answer: 1, explanation: 'The kill switch stops the engine when the lanyard is pulled, which happens when the helmsman leaves the helm. There is no general legal duty to use it; the 2020 proposal was not adopted.' },
      },
      // 6 ------------------------------------------------------------
      {
        id: 'fire-prevention',
        title: 'Fire prevention: vapour sinks, gas sinks, the CO alarm goes high',
        html: `<p>A boat fire is worse than a house fire: you cannot step outside, the hull is full of fuel and plastic, and the way out is cold water. Most boat fires start in the <strong>fuel system</strong> or the <strong>electrical system</strong>, so prevention is about vapour, gas and wiring.</p>
<p><strong>Petrol vapour is about 2.8 times heavier than air.</strong> It does not blow away; it pours into the bilge under the engine and waits for a spark. Therefore: run the blower and ventilate the engine compartment <strong>before</strong> starting a petrol inboard; stop the engine and put out all flames before refuelling; refuel outboard or over the deck rather than into the bilge area; close hatches so vapour cannot enter the cabin; wipe up spills; fill portable tanks ashore; stop at once if you notice a leak; shut all fuel and gas valves after the trip. If you smell petrol, do not start the engine or touch an electrical switch until the smell is gone.</p>
<p><strong>LPG</strong> (propane and butane) also sinks to the lowest point, so a gas detector sensor goes <strong>as low as possible</strong>, and gas installations should be fitted and inspected by professionals with hoses and couplings checked regularly. <strong>Carbon monoxide</strong> from engines, generators, heaters and charcoal grills under a canopy is colourless and odourless; it causes headache, dizziness, nausea, then confusion and unconsciousness. A CO alarm goes <strong>high</strong>, above 1.5 m, near the heater. Get the victim into fresh air and call 113 if serious. Fit a smoke detector if you sleep aboard and change its battery at least yearly.</p>
<div class="callout rule"><p>Norwegian Maritime Authority: at least one <strong>2 kg ABC powder</strong> hand extinguisher, easily accessible, in a fixed bracket; the Society for Sea Rescue recommends a rating of at least 13A 89B C. Boats with inboard <strong>petrol</strong> engines should always have a fixed engine-room system; above <strong>120 kW</strong> it is required. Check the gauge is in the green and turn the unit over now and then so the powder does not compact.</p></div>
<p>Fire classes: <strong>A</strong> solids, <strong>B</strong> liquids such as petrol and oil, <strong>C</strong> gases, <strong>D</strong> metals, <strong>F</strong> cooking fat. ABC powder covers A, B and C and is safe on live electrics, but not fat (smother with a fire blanket or lid; never water) or metal. A fire blanket is the right tool for a galley pan.</p>`,
        illustration: () => firePrevention(),
        caption: 'Petrol vapour and LPG are heavier than air and pool in the bilge, so the gas detector goes low and you ventilate before starting. Carbon monoxide alarms go high, near the heater.',
        keyFacts: ['Petrol vapour is about 2.8 times heavier than air: it collects in the bilge; ventilate BEFORE starting', 'Refuel with engine off and no flames, outboard or over the deck, hatches closed, spills wiped up', 'Gas detector LOW (LPG sinks); CO alarm HIGH (above 1.5 m) near the heater; smoke detector if sleeping aboard', 'Minimum 2 kg ABC powder extinguisher, easily accessible; fixed system required above 120 kW', 'ABC powder: solids, liquids, gases and live electrics; NOT fat fires (fire blanket) or metals'],
        check: { q: 'Why must you ventilate the engine compartment before starting a petrol inboard engine?', options: ['To warm the engine for an easier start', 'Because petrol vapour is heavier than air and collects in the bilge, where a spark can ignite it', 'To reduce carbon monoxide in the cabin', 'It is only necessary for diesel engines'], answer: 1, explanation: 'Petrol vapour is about 2.8 times heavier than air and pools in the bilge under the engine. Running the blower before starting removes it so the starter spark cannot cause an explosion.' },
      },
      // 6b -----------------------------------------------------------
      {
        id: 'fire-fighting',
        title: 'Fire on board: six steps, aim at the base',
        html: `<p>With prevention done, the remaining risk is the fire you did not prevent. Fire needs fuel, heat and oxygen; fighting it means removing one of the three and keeping the people where the smoke is not. The sequence below is what the exam expects, in this order.</p>
<ol>
<li><strong>Alert and stop.</strong> Shout "fire", stop the engine, get everyone away from the flames.</li>
<li><strong>Shut off.</strong> Close the fuel valve and the gas bottle, and cut the electrical main switch if you can reach it safely. You are taking away fuel and ignition sources.</li>
<li><strong>Turn the boat</strong> so the wind carries flames and smoke <strong>away from the people</strong>. Fire aft: head into the wind, so the smoke blows astern. Fire forward: run downwind, so it blows ahead. The people are always upwind of the fire.</li>
<li><strong>Life jackets on</strong>, everyone, now. You may have to leave the boat in a hurry.</li>
<li><strong>Attack the base</strong> of the fire from upwind with the extinguisher or the fire blanket: pull the pin, aim at the <strong>bottom</strong> of the flames, squeeze, sweep from side to side. Keep your escape route behind you and never let the fire get between you and the way out.</li>
<li><strong>Call and prepare.</strong> Send <strong>MAYDAY</strong> early on channel 16 (or 112 / 120 from a phone); a fire is grave and imminent danger. Prepare to abandon, taking flares, handheld VHF and any beacon, but abandon only as a <strong>last resort</strong> when the fire is clearly out of control. In the water, stay together and stay near the boat.</li>
</ol>
<p>Two details catch candidates. Aim at the <strong>base</strong>, not the top of the flames or the smoke; the powder has to reach what is burning. And a burning pan of fat is <strong>never</strong> put out with water: it explodes into a fireball. Smother it with the lid or a fire blanket after shutting the gas.</p>
<div class="callout warn"><p>Abandoning the boat is the last resort, only when it is sinking or burning out of control. Take the EPIRB or PLB, the flares and a handheld VHF, and stay together: a group is easier to find than scattered swimmers.</p></div>`,
        illustration: () => fireSteps(),
        caption: 'Six steps when fire breaks out. In step 3 the people stay upwind of the fire, so a stern fire means heading into the wind.',
        keyFacts: ['Stop the engine; shut off fuel, gas and electricity', 'Turn so the wind carries fire and smoke away from the people: fire aft = head into the wind', 'Everyone into life jackets before fighting the fire', 'Attack from upwind, aim at the BASE of the flames: Pull, Aim, Squeeze, Sweep', 'Fat fire: lid or fire blanket, never water; MAYDAY early; abandon only as a last resort'],
        check: { q: 'Fire breaks out in the engine compartment at the stern of your motorboat. How should you turn the boat?', options: ['Run downwind at full speed to blow the flames out', 'Head into the wind so the flames and smoke blow aft, away from the people in the bow', 'Turn broadside to the wind and anchor', 'It makes no difference; the extinguisher is what matters'], answer: 1, explanation: 'The wind must carry flames and smoke away from the people. With the fire at the stern, heading into the wind blows them astern; with a fire forward you would run downwind instead.' },
      },
      // 7 ------------------------------------------------------------
      {
        id: 'alerting',
        title: 'Calling for help: channel 16, DSC, 120 and 112',
        html: `<p>Help arrives only if someone hears you, and the first minutes decide whether a problem stays a problem or becomes a funeral. The exam puts two facts from this section into part 4 (1.4.6): the coast radio station's telephone number <strong>120</strong> and <strong>VHF channel 16</strong>.</p>
<div class="callout rule"><p><strong>VHF channel 16</strong> (156.800 MHz) is the international distress, urgency, safety and calling channel. The Norwegian coast radio stations keep a 24-hour listening watch on channel 16 and on DSC. <strong>Telephone 120</strong> connects a mobile phone to the nearest coast radio station, for boats whose only means of communication is a phone; the official procedure card labels it "report a need for assistance".</p></div>
<p>Why VHF beats a phone: one call reaches the coast radio <em>and every vessel around you</em> at once, without knowing anyone's number, and a nearby boat is often the fastest rescuer. A mobile reaches one subscriber, and its signal weakens noticeably already in moderate seas. A marine VHF requires the <strong>SRC</strong> operator certificate and a radio licence, which gives the boat its call sign and <strong>MMSI</strong>.</p>
<p><strong>DSC (Digital Selective Calling):</strong> press and hold the red DISTRESS button and the radio sends a pre-formatted alert with your MMSI (and GPS position if connected) to the coast radio and all DSC radios in range. The digital alert travels on <strong>channel 70</strong>; you then speak on channel 16. Procedure: 1) hold the DSC button until the radio confirms; 2) "<strong>MAYDAY MAYDAY MAYDAY</strong>, this is [boat name three times], [call sign], [MMSI]"; 3) "MAYDAY, [name, call sign, MMSI], position, nature of distress, assistance required, number of persons on board, over".</p>
<p>Use the right word. <strong>MAYDAY</strong> = grave and imminent danger to life or vessel (fire, sinking, person missing in the water). <strong>PAN PAN</strong> = urgency without immediate danger to life (engine failure in calm weather, a non-critical injury). <strong>SECURITE</strong> = a safety message about a navigation hazard or weather. The land numbers also work at sea: <strong>112</strong> police and general emergency (works without a SIM card or your own operator's coverage), <strong>113</strong> medical, <strong>110</strong> fire; at sea they are passed to the Joint Rescue Coordination Centre (Sola for waters south of 65&deg;N, Bodo north of it). <strong>02016</strong> is the Norwegian Society for Sea Rescue's assistance line for towing and non-urgent help; it is not an emergency number.</p>`,
        illustration: () => maydayCard(),
        caption: 'The official distress procedure: DSC button first, then the MAYDAY call and message on channel 16. PAN PAN for urgency, SECURITE for safety messages.',
        keyFacts: ['VHF channel 16 = distress, urgency, safety and calling; coast radio listens 24 h', 'Telephone 120 = nearest coast radio station from a mobile phone (part 4!)', 'DSC distress alert: hold the red button; the digital alert goes on channel 70, then speak on 16', 'MAYDAY = danger to life or vessel; PAN PAN = urgent, no immediate danger; SECURITE = safety message', '112 emergency (also without SIM), 113 medical, 110 fire; 02016 = Sea Rescue assistance, not emergency', 'VHF needs an SRC certificate, a radio licence, call sign and MMSI'],
        check: { q: 'You only have a mobile phone on board and need to reach the coast radio station. Which number do you dial?', options: ['110', '113', '120', '02016'], answer: 2, explanation: '120 connects a mobile phone to the nearest coast radio station. 110 is fire, 113 medical, and 02016 is the Society for Sea Rescue’s assistance line.' },
      },
      // 8 ------------------------------------------------------------
      {
        id: 'distress-signals',
        title: 'Distress signals: Annex IV and how to fire a flare',
        html: `<p>Rule 37 of the Rules of the Road says a vessel in distress and requiring assistance shall use or exhibit the signals in <strong>Annex IV</strong>. The list is international, and the exam asks which signals are on it, which are not, and how to use the pyrotechnic ones.</p>
<ul>
<li>(a) a gun or explosive signal about every minute; (b) <strong>continuous sounding</strong> of a fog-signal apparatus;</li>
<li>(c) <strong>red star rockets</strong> fired one at a time; (d) <strong>SOS</strong> by any method (&middot; &middot; &middot; &mdash; &mdash; &mdash; &middot; &middot; &middot;); (e) the spoken word <strong>MAYDAY</strong> on the radio;</li>
<li>(f) code flags <strong>N over C</strong>; (g) a <strong>square flag with a ball</strong> above or below it; (h) <strong>flames</strong> on the vessel (a burning oil barrel);</li>
<li>(i) a <strong>red parachute rocket</strong> or <strong>red hand flare</strong>; (j) <strong>orange smoke</strong>; (k) <strong>slowly and repeatedly raising and lowering outstretched arms</strong>;</li>
<li>(l) a <strong>DSC distress alert</strong> on VHF channel 70; (m) satellite distress alert; (n) <strong>EPIRB</strong>; (o) approved radio signals including SART.</li>
</ul>
<p>Paragraph 2 forbids using any of these except to indicate distress, and forbids signals that could be confused with them. White flares and white lights are attention or illumination signals, not distress. Waving your arms is not the signal; <em>slowly</em> raising and lowering them is.</p>
<p><strong>Red hand flare</strong> (about 60 seconds, seen about 5 nautical miles): pull the handle out until it locks, remove the cap, hold it at arm's length <strong>pointing downward and away</strong> from body and face, on the <strong>lee (downwind) side</strong> so sparks and slag blow clear. Use it to show your exact position when rescuers are near.</p>
<p><strong>Red parachute rocket</strong> (about 300 m high, 40 seconds, 25+ nautical miles): stand with your <strong>back to the wind</strong>, arm fully extended, rocket vertical or tilted up to about <strong>15 degrees downwind</strong>, never into the wind, clear of rigging and canopy; fire two or three but keep some for when a rescue unit approaches. <strong>Orange smoke</strong> (about 3 minutes, <strong>daytime only</strong>): a floating smoke is activated and thrown into the water clear of the boat, never held; it confirms your position and shows the helicopter pilot the wind. Pyrotechnics last typically 3 to 5 years from the production date; check the expiry date and return expired units to a dealer.</p>`,
        illustration: () => flares(),
        caption: 'Wind from the left. Hand flare down and away on the lee side; rocket with your back to the wind, vertical or slightly downwind; floating smoke in the water, its plume showing the wind.',
        keyFacts: ['Annex IV distress: red flares/rockets, orange smoke, SOS, MAYDAY, N over C, square flag + ball, flames, continuous fog signal, arms slowly up and down, DSC, EPIRB', 'Misuse of a distress signal is prohibited; white flares are not distress signals', 'Hand flare: arm out, pointing down and away, lee side; about 60 s, about 5 NM', 'Rocket: back to the wind, vertical or up to 15 degrees downwind, never into the wind; about 300 m, 40 s, 25+ NM', 'Orange smoke: daytime only, about 3 minutes, floating type goes in the water; shows the pilot the wind', 'Shelf life typically 3-5 years from production; return expired flares to a dealer'],
        check: { q: 'How do you fire a red parachute rocket?', options: ['Into the wind so it climbs higher', 'With your back to the wind, arm extended, vertical or tilted up to about 15 degrees downwind', 'Horizontally toward the rescue vessel', 'Held low over the water on the lee side'], answer: 1, explanation: 'Back to the wind, rocket vertical or tilted slightly downwind (max about 15 degrees), never into the wind, which can bring it back over the boat. Holding low and pointing down describes the hand flare.' },
      },
      // 9 ------------------------------------------------------------
      {
        id: 'man-overboard',
        title: 'Man overboard: shout, throw, mark, point, turn',
        html: `<p>A head in the water disappears behind the first wave, and a person in Norwegian water has only minutes of useful strength. The man-overboard drill exists so that the first ten seconds are automatic.</p>
<ol>
<li><strong>Shout</strong> "man overboard" so everyone knows.</li>
<li><strong>Throw the lifebuoy</strong> at once, even if the person seems fine: it gives buoyancy and <strong>marks the spot</strong>.</li>
<li><strong>Press MOB</strong> on the chart plotter to store the position.</li>
<li><strong>One person points</strong> at the casualty continuously and never looks away.</li>
<li><strong>Turn back</strong>. From a straight course the <strong>Williamson turn</strong> brings you back down your own track: put the helm hard over to one side until you are about <strong>60 degrees</strong> off the original course, then hard over the other way until you are on the <strong>opposite (reciprocal) course</strong>; the casualty appears ahead.</li>
<li><strong>Approach into the wind</strong> so the boat loses way and stops with the casualty alongside, and put the engine in <strong>neutral or off</strong> before anyone is near the stern: propellers maim.</li>
<li><strong>Recover</strong> with the boarding ladder, a line, or a loop under the arms. A wet, limp adult is far too heavy to lift by hand. If the person has been in cold water for a while, keep them horizontal and handle them gently.</li>
</ol>
<p>If the casualty is not quickly found or recovered, send <strong>MAYDAY</strong> immediately; the Society for Sea Rescue's advice is "don't wait too long". A person missing in the water is grave and imminent danger to life.</p>
<p>Never run the engine when someone is in the water near the stern. And prevent the whole thing: wear the life jacket, clip on the kill cord, keep low and hold on when moving about, and be especially careful when stepping between boat and quay, which killed 15 people in 2024.</p>
<div class="callout tip"><p>Order matters in exam questions: the first action is to shout and throw the lifebuoy, not to start the turn or to call 113. The Williamson angle is 60 degrees, not 90.</p></div>`,
        illustration: () => mobTurn(),
        caption: 'Top: the four immediate actions. Left: the Williamson turn, 60 degrees to one side, then hard over the other way to the reciprocal course. Right: approach into the wind, engine in neutral.',
        keyFacts: ['First: shout and throw the lifebuoy (marks the spot), press MOB, one person points continuously', 'Williamson turn: hard over to 60 degrees off course, then hard over the other way to the reciprocal course', 'Approach into the wind so you stop with the casualty alongside, engine in neutral or off', 'Recover with ladder or line; keep a cold casualty horizontal', 'Not found quickly: MAYDAY at once'],
        check: { q: 'In the Williamson turn, when do you reverse the helm to the other side?', options: ['After about 30 degrees of heading change', 'After about 60 degrees of heading change', 'After about 90 degrees of heading change', 'When you are on the reciprocal course'], answer: 1, explanation: 'Helm hard over to one side until the heading has changed about 60 degrees, then hard over the other way until you reach the opposite course and run back down your track.' },
      },
      // 10 -----------------------------------------------------------
      {
        id: 'cold-water',
        title: 'Cold water, hypothermia and the HELP position',
        html: `<p>Norwegian sea water averages about 6 to 10 &deg;C over the year, and the Society for Sea Rescue's rule is that it is almost always cold enough to kill, so a fall overboard is life-threatening in every season. Cold water does not kill the way people expect: most victims drown in the first minutes, long before hypothermia.</p>
<p>The Society for Sea Rescue teaches four phases. <strong>1. Cold shock</strong> (about one minute): you gasp involuntarily and hyperventilate, your heart rate and blood pressure jump. Float on your back, keep nose and mouth clear, and get your breathing under control before doing anything else. <strong>2. Cold incapacitation</strong> (about ten minutes): muscles cool until you cannot swim or grip; this is the window to reach the boat or ladder and to signal. <strong>3. Hypothermia</strong>: core temperature below 35 &deg;C; unconsciousness from cold takes about an hour even in ice-cold water. <strong>4. Rescue collapse</strong>: circulatory collapse during or after rescue.</p>
<p>The teaching rule is <strong>1-10-1</strong>: one minute to control breathing, ten minutes of meaningful movement, one hour to unconsciousness. Survival in 5 to 15 &deg;C water ranges from about 45 minutes to four hours depending on clothing and circumstances.</p>
<p>With a life jacket on, take the <strong>HELP position</strong> (Heat Escape Lessening Posture): knees drawn up to the chest, arms clamped to the sides or crossed over the chest, head out. It cuts heat loss by about a third. Several people <strong>huddle</strong> chest to chest with the weakest in the middle. <strong>Do not swim</strong> for shore unless it is very close: swimming pumps heat out of you and a swimmer is almost invisible. <strong>Stay with the boat</strong>: even capsized it floats and is far easier to see.</p>
<p><strong>Hypothermia stages:</strong> mild 35-32 &deg;C (awake, shivering); moderate 32-28 &deg;C (confused, shivering stops); severe 28-24 &deg;C (unconscious but breathing); deep below 24 &deg;C (not breathing). <strong>First aid:</strong> out of wind and water, remove wet clothes, insulate <em>under</em> as well as around (wool blanket, rescue bag), warm slowly with shared body heat and shelter, warm non-alcoholic drink only if awake and not vomiting, <strong>never alcohol</strong>, no rubbing or exercise. Keep them <strong>horizontal</strong> and handle gently; rough handling can trigger cardiac arrest. Unconscious but breathing: recovery position, call 113 or channel 16, watch the breathing continuously. Not breathing normally: start CPR and keep going; a cold patient is not given up on.</p>`,
        illustration: () => helpPosition(),
        caption: 'HELP position alone, huddle in a group, and the 1-10-1 timeline: one minute of cold shock, ten minutes of useful movement, about one hour to hypothermic unconsciousness.',
        keyFacts: ['Norwegian sea: 6-10 C; cold shock lasts about 1 minute: float on your back and control breathing', '1-10-1: 1 minute to breathe, 10 minutes of useful movement, 1 hour to unconsciousness', 'HELP: knees up, arms clamped, head out; cuts heat loss by about one third; huddle in a group', 'Stay with the boat; do not swim for shore unless very close', 'Hypothermia below 35 C; stages 35/32/28/24', 'First aid: dry, insulate underneath, warm slowly, no alcohol, horizontal, gentle; CPR if not breathing'],
        check: { q: 'A shivering, conscious person is pulled out of 8 degree water after 20 minutes. What is the correct first aid?', options: ['A warm shower and a glass of brandy to get the blood going', 'Vigorous rubbing of arms and legs and a brisk walk', 'Remove wet clothes, insulate under and around, warm slowly, warm non-alcoholic drink, keep horizontal', 'Leave the wet clothes on to keep the heat in and sit them upright'], answer: 2, explanation: 'Dry clothes, insulation underneath and around, slow warming, warm non-alcoholic drink if awake, gentle handling and a horizontal position. Alcohol, rubbing and exercise are dangerous.' },
      },
      // 11 -----------------------------------------------------------
      {
        id: 'first-aid',
        title: 'First aid afloat: the ABC check, CPR and drowning',
        html: `<p>On the water the ambulance cannot drive to you, so until a lifeboat or helicopter arrives the crew is the ambulance. The syllabus asks for the casualty check, CPR, bleeding, hypothermia (previous section) and injuries from collisions or falls at speed.</p>
<p><strong>The check, in order:</strong> consciousness (speak to them, shake gently), airway (tilt the head back, lift the chin), breathing (look, listen and feel for up to 10 seconds), circulation (bleeding, colour). Make the scene safe first, and call <strong>113</strong> on speaker so the operator can guide you.</p>
<div class="callout rule"><p><strong>Adult CPR</strong> (Norwegian Resuscitation Council 2021): not breathing normally &rarr; <strong>30 chest compressions</strong> in the middle of the chest at <strong>100-120 per minute</strong>, <strong>5-6 cm</strong> deep, then <strong>2 breaths</strong>; repeat 30:2 until help takes over. Breathing normally &rarr; recovery position and watch. Untrained rescuers give continuous compressions guided by 113. Fetch the nearest defibrillator (AED) if one is close.</p></div>
<p><strong>Drowning is different.</strong> The casualty has stopped because of lack of oxygen, so ventilation matters: the European Resuscitation Council recommends <strong>5 rescue breaths first</strong>, then 30:2. Compression-only CPR is not adequate for a drowned person. A cold casualty is not given up on: continue CPR and follow 113's instructions.</p>
<p><strong>Rescuing someone in the water:</strong> shout and direct them to the ladder; <strong>reach</strong> with a boat hook or oar if within about 5 m; <strong>throw</strong> the lifebuoy or a vest with a line; <strong>row or drive</strong> the boat to them; <strong>swim</strong> only as a last resort and only with a flotation aid, because a panicking person can pull you under.</p>
<p><strong>Bleeding:</strong> direct pressure with a clean compress, elevate, bandage firmly. <strong>Burns:</strong> cool with water that is cool, not ice-cold, for about 20 minutes, cover loosely, do not pop blisters. <strong>High-energy injuries</strong> after a collision or a fall at speed: suspect injuries to head, neck and inside the body even if the person looks fine; keep them still, support the head and neck, call 113. <strong>Carbon monoxide:</strong> fresh air, rest, 113 if serious. <strong>Heat exhaustion:</strong> shade, cool the body, fluids if conscious.</p>`,
        keyFacts: ['Check in order: consciousness, airway, breathing (up to 10 s), circulation; call 113 on speaker', 'Adult CPR 30:2, 100-120 per minute, 5-6 cm deep; recovery position if breathing', 'Drowning: 5 rescue breaths first, then 30:2; compression-only is not enough', 'Rescue order: shout, reach (about 5 m), throw, row, swim only as a last resort with a flotation aid', 'Bleeding: pressure, elevate, bandage; burns: cool water about 20 min; collision injuries: keep still, 113'],
        check: { q: 'You pull an unconscious person who is not breathing out of the water. How do you start resuscitation?', options: ['30 compressions, then 2 breaths, as for any adult', '5 rescue breaths, then 30 compressions and 2 breaths', 'Continuous chest compressions only until the ambulance arrives', 'Recovery position and wait for breathing to return'], answer: 1, explanation: 'For drowning the European Resuscitation Council recommends 5 initial rescue breaths because the arrest is caused by lack of oxygen; then continue 30:2. Compression-only CPR is not adequate for drowning.' },
      },
      // 12 -----------------------------------------------------------
      {
        id: 'other-emergencies',
        title: 'Engine failure, leaks, capsizing and collision',
        html: `<p>Most emergencies are not dramatic until they are allowed to grow. The pattern is always the same: life jackets on, stop the situation getting worse, then call early, with the right priority word.</p>
<p><strong>Engine failure.</strong> If you are drifting toward a lee shore (the shore the wind blows onto), <strong>anchor at once</strong> or stream a drogue; then life jackets on and call for assistance: <strong>120</strong> from a phone, the Society for Sea Rescue on <strong>02016</strong> or SafeTrx, or <strong>PAN PAN</strong> on channel 16. It becomes <strong>MAYDAY</strong> only if the anchor does not hold and you are about to strike the rocks.</p>
<p><strong>Taking on water.</strong> Find and stop the leak (bung, rag, cushion), start the bilge pump or bail, head for shelter or shallow water, life jackets on, and alert the coast radio early rather than late.</p>
<p><strong>Capsizing.</strong> <strong>Stay with the boat</strong>, climb onto the hull if you can, keep everyone together and signal. Do not swim for shore unless it is very close: the Authority's Code of Conduct says "stay calm, stay by the boat and call for help", because a boat is visible and buoyant and a swimmer is neither. Capsizing killed 9 of the 18 who died in 2025, six of them fishing from an open motorboat.</p>
<div class="callout rule"><p><strong>Collision</strong> (Maritime Code, Section 164): each master must render all possible and necessary help to the other vessel and its people, as far as this can be done without serious danger to their own vessel and crew, and must give their own name, home port and ports of departure and destination. This applies to small boats too. Wilful or grossly negligent failure to assist is punishable by up to <strong>3 years</strong> in prison, up to 6 if someone dies or is seriously injured. Leisure-boat accidents may be reported to the police on 112.</p></div>
<p>Behind all of this stands the Authority's seven-point Code of Conduct: think safety, bring the equipment, respect weather and waters, follow the Rules of the Road, wear a life jacket or flotation clothing, be well rested and sober, be considerate. The alcohol limit for a boat under 15 m is 0.8 per mille; in 2024 about half of those who died were under the influence.</p>`,
        illustration: () => numbersWheel(),
        caption: 'Who to call: 112, 113 and 110 reach the emergency services (relayed to the rescue centre at sea); 120 reaches the coast radio from a mobile; 02016 is the Society for Sea Rescue for assistance.',
        keyFacts: ['Engine failure near a lee shore: anchor or drogue first, life jackets, then 120 / 02016 / PAN PAN', 'Taking on water: stop the leak, pump or bail, head for shelter, alert coast radio early', 'Capsizing: stay with the boat, climb on the hull, keep together, signal; do not swim for shore', 'Collision: you must help the other vessel and exchange name, home port and ports; up to 3 years in prison for leaving', 'Code of Conduct: think safety, equipment, weather, Rules of the Road, life jacket, sober and rested, considerate'],
        check: { q: 'Your engine fails and the fresh breeze is pushing you toward a rocky shore 200 m away. What do you do first?', options: ['Send MAYDAY on channel 16', 'Drop the anchor (or stream a drogue) to stop the drift, then put on life jackets and call for assistance', 'Swim ashore with a line', 'Fire a red parachute rocket'], answer: 1, explanation: 'Stopping the drift is the first priority; the anchor or a drogue buys time. Then life jackets and a call for assistance (120, 02016 or PAN PAN). MAYDAY and flares are for when life is actually in danger, for example if the anchor fails.' },
      },
    ],
    flashcards: [
      { front: 'On which boats must everyone outdoors WEAR flotation equipment while under way?', back: 'Recreational boats shorter than 8 m (Small Craft Act, Section 23a, since 1 May 2015).' },
      { front: 'What must EVERY recreational boat carry, whatever its length?', back: 'Suitable flotation and rescue equipment for everyone on board (Section 23).' },
      { front: 'Who is responsible for a 14-year-old wearing a life jacket?', back: 'The skipper. The skipper is responsible for persons under 15; everyone else for themselves.' },
      { front: '"Under way" in the life-jacket rule means?', back: 'Propelled by engine, sail or oars. Anchored or moored is not under way.' },
      { front: 'Fine for a missing or unworn life jacket?', back: 'A fixed penalty from the police, currently NOK 900 per person (older books say NOK 500).' },
      { front: '50 N device: what is it and who is it for?', back: 'A buoyancy aid, not a life jacket. Swimmers over 30 kg close to help; does not turn you face-up.' },
      { front: 'Best flotation device for children and non-swimmers?', back: '100 N life jacket with collar, crotch strap and reflectors (ISO 12402-4).' },
      { front: '150 N inflatable: for whom, and one limitation?', back: 'Adults in all weather; not recommended for children. Turns you face-up unless heavy waterproof clothing is worn.' },
      { front: 'Three checks on an inflatable life jacket?', back: 'Weigh the CO2 cylinder; firing element not expired, damp or broken; inflate and confirm firm after 24 hours.' },
      { front: 'Which two items are legally required on a private recreational boat?', back: 'Flotation equipment for all on board, and navigation lights at night or in poor visibility.' },
      { front: 'Purpose of the kill cord?', back: 'Stops the engine if the helmsman falls overboard. Recommended by the Authority; no general legal duty.' },
      { front: 'Minimum fire extinguisher recommended by the Norwegian Maritime Authority?', back: 'At least one 2 kg ABC powder extinguisher, easily accessible (rating 13A 89B C recommended).' },
      { front: 'Above what engine power is a fixed engine-room extinguishing system required?', back: '120 kW. Inboard petrol engines should always have one.' },
      { front: 'Petrol vapour: how heavy, where does it go, what do you do?', back: 'About 2.8 times heavier than air; collects in the bilge. Ventilate / run the blower BEFORE starting.' },
      { front: 'Where do the LPG gas detector and the CO alarm go?', back: 'Gas detector as LOW as possible (gas sinks); CO alarm HIGH, above 1.5 m, near the heater.' },
      { front: 'Where do you aim the extinguisher?', back: 'At the BASE of the flames, from upwind: Pull, Aim, Squeeze, Sweep.' },
      { front: 'Fire at the stern: which way do you turn the boat?', back: 'Head into the wind so flames and smoke blow aft, away from the people. Fire forward: run downwind.' },
      { front: 'Burning fat in a pan: what do you use?', back: 'Shut the gas; smother with a lid or fire blanket. Never water; ABC powder is not rated for fat.' },
      { front: 'VHF channel 16?', back: 'The international distress, urgency, safety and calling channel (156.800 MHz). Coast radio listens 24 h.' },
      { front: 'Telephone number 120?', back: 'Connects a mobile phone to the nearest coast radio station (report a need for assistance). Part 4!' },
      { front: 'Which channel carries the DSC distress alert?', back: 'Channel 70 (digital). You then speak on channel 16.' },
      { front: 'MAYDAY, PAN PAN, SECURITE: meanings?', back: 'MAYDAY: grave and imminent danger to life or vessel. PAN PAN: urgency, no immediate danger. SECURITE: safety message.' },
      { front: '112, 113, 110, 02016?', back: '112 police/general emergency (works without SIM); 113 medical; 110 fire; 02016 Society for Sea Rescue assistance.' },
      { front: 'Which Annex IV signal uses the arms?', back: 'Slowly and repeatedly raising and lowering outstretched arms. Waving is not the signal.' },
      { front: 'Are white flares distress signals?', back: 'No. Red hand flares, red rockets and orange smoke are; white is attention or illumination. Misuse of distress signals is prohibited.' },
      { front: 'How do you hold a red hand flare?', back: 'Arm extended, pointing down and away from body and face, on the lee (downwind) side. About 60 s, about 5 NM.' },
      { front: 'How do you fire a red parachute rocket?', back: 'Back to the wind, arm extended, vertical or tilted up to 15 degrees downwind, never into the wind. About 300 m, 40 s, 25+ NM.' },
      { front: 'Orange smoke: when and how?', back: 'Daytime only, about 3 minutes. Floating smoke: activate and throw into the water clear of the boat; shows the pilot the wind.' },
      { front: 'Man overboard: the first two actions?', back: 'Shout "man overboard" and throw the lifebuoy at once (it marks the spot). Then MOB on the plotter, one person points.' },
      { front: 'Williamson turn: the key angle?', back: '60 degrees: hard over to one side until 60 degrees off course, then hard over the other way to the reciprocal course.' },
      { front: 'How do you approach a person in the water?', back: 'Into the wind so you stop with them alongside; engine in neutral or off; recover by ladder or line.' },
      { front: 'The 1-10-1 principle?', back: '1 minute to control breathing (cold shock), 10 minutes of useful movement, about 1 hour to hypothermic unconsciousness.' },
      { front: 'HELP position?', back: 'Heat Escape Lessening Posture: knees to chest, arms clamped to sides, head out, life jacket on. Cuts heat loss by about a third.' },
      { front: 'Hypothermia: definition and the four stages?', back: 'Core below 35 C. Mild 35-32, moderate 32-28, severe 28-24 (unconscious, breathing), deep below 24 (not breathing).' },
      { front: 'First aid for a hypothermic person?', back: 'Out of wind and water, dry clothes, insulate under and around, warm slowly, no alcohol, horizontal, handle gently; CPR if not breathing.' },
      { front: 'Adult CPR numbers?', back: '30 compressions : 2 breaths, 100-120 per minute, 5-6 cm deep. Check breathing for up to 10 s. Call 113 on speaker.' },
      { front: 'CPR for a drowned person: what is different?', back: 'Start with 5 rescue breaths, then 30:2. Compression-only CPR is not adequate for drowning.' },
      { front: 'Rescue a person in the water: the order?', back: 'Shout, reach (within about 5 m), throw, row or drive to them, swim only as a last resort with a flotation aid.' },
      { front: 'Duty after a collision?', back: 'Help the other vessel and its people as far as possible without serious danger to your own; exchange name, home port and ports. Leaving: up to 3 years in prison.' },
      { front: 'Boat capsizes 500 m from shore: what do you do?', back: 'Stay with the boat, climb on the hull, keep together, signal. Do not swim for shore unless it is very close.' },
    ],
    questions: [
      // ---- Part 4, item 1.4.5: flotation-device rules (F1-F8) ----
      { id: 'safety-03', q: 'The boat in the picture is 7.5 m and under way. Two adults sit in the cockpit and a 12-year-old is inside the cabin. Who must wear flotation equipment right now?', illustration: () => vestScene({ len: '7.5', underway: true, jackets: true, child: true, childAge: 12 }), options: ['Nobody; the boat has a cabin', 'Only the child, because children are always covered', 'Everyone including the child in the cabin', 'The two adults outdoors; the child is indoors at the moment, but the skipper remains responsible for the under-15'], answer: 3, explanation: 'Under 8 m and under way, everyone OUTDOORS must wear flotation. The child in the cabin is indoors, but the skipper is responsible for ensuring persons under 15 wear a device when they are outdoors (F2, F3).', difficulty: 3, part: 4, p4: '1.4.5', tags: ['flotation', 'law', 'picture'] },
      { id: 'safety-04', q: 'The motorboat in the picture is exactly 8.0 m long and under way with two adults on board. Must they wear flotation equipment?', illustration: () => vestScene({ len: '8.0', underway: true, jackets: false }), options: ['No: the wearing rule applies to boats shorter than 8 m, but suitable flotation must still be on board for both', 'Yes: the rule covers all boats up to and including 8 m', 'Yes: the rule covers every motorboat regardless of length', 'No: flotation equipment is only required on boats over 8 m'], answer: 0, explanation: 'The law says "shorter than eight metres", so an 8.0 m boat is outside the wearing duty. Every boat must still carry suitable flotation for everyone on board (F1, F2, trap 2).', difficulty: 3, part: 4, p4: '1.4.5', tags: ['flotation', 'law', 'picture'] },
      { id: 'safety-05', q: 'The 6 m boat in the picture lies at anchor with the engine stopped while the crew sunbathe on deck. Is wearing flotation equipment required?', illustration: () => vestScene({ len: '6.0', underway: false, jackets: false }), options: ['Yes, because the boat is shorter than 8 m', 'Yes, whenever the boat is afloat', 'No: the boat is not under way (not propelled by engine, sail or oars), though wearing is recommended', 'No: the rule applies only between sunset and sunrise'], answer: 2, explanation: 'The wearing duty applies while the boat is under way, meaning propelled by engine, sail or oars. An anchored boat is exempt, although the Authority still recommends wearing (F4).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['flotation', 'law', 'picture'] },
      { id: 'safety-08', q: 'A 15-year-old passenger in a 7 m boat under way refuses to wear a life jacket on deck. Who commits the offence?', options: ['The 15-year-old, who is responsible for themselves', 'The skipper, who is responsible for everyone under 18', 'The boat owner, even if not on board', 'Nobody, because passengers are exempt'], answer: 0, explanation: 'The skipper is responsible only for persons under 15. From 15 each person is responsible for wearing their own device (F3, trap 3).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['flotation', 'law'] },
      { id: 'safety-09', q: 'In the life-jacket rule, when is a boat "under way"?', options: ['Only when it exceeds 5 knots', 'When it is propelled by engine, sail or oars', 'Whenever it is afloat, including at anchor', 'Only when the engine is running'], answer: 1, explanation: 'Under way means being propelled by engine, sail, oars or similar; a boat at anchor or moored is not under way (F4). Speed is irrelevant.', difficulty: 2, part: 4, p4: '1.4.5', tags: ['flotation', 'law'] },
      // ---- Part 4, item 1.4.6: 120 and channel 16 (F42-F49). DSC/112 questions are part 1 (syllabus 1.1c-d). ----
      { id: 'safety-12', q: 'Which VHF channel is used for a spoken distress call?', options: ['Channel 6', 'Channel 16', 'Channel 70', 'Channel 72'], answer: 1, explanation: 'Channel 16 is the international distress, urgency, safety and calling channel; channel 70 carries only the digital DSC alert (F42, F43).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['channel-16', 'radio'] },
      { id: 'safety-16', q: 'On what does the Norwegian coast radio keep a continuous 24-hour listening watch?', options: ['Channel 6 and channel 8', 'VHF channel 16 and DSC', 'Channel 70 only', 'Mobile number 120 only, not VHF'], answer: 1, explanation: 'The coast radio stations keep a 24-hour watch on channel 16 (voice) and on DSC (digital) (F42).', difficulty: 2, part: 4, p4: '1.4.6', tags: ['channel-16', 'radio'] },
      { id: 'safety-17', q: 'What is the difference between 120 and 02016?', options: ['They are the same service under two numbers', '120 is for fire at sea, 02016 for medical help at sea', '120 is the police at sea; 02016 is the coast radio', '120 reaches the nearest coast radio station; 02016 is the Society for Sea Rescue’s assistance line for towing and non-urgent help'], answer: 3, explanation: '120 is the coast radio number and is in the exam’s part 4; 02016 is the Norwegian Society for Sea Rescue’s assistance line, not an emergency number (F47, F49, trap 5).', difficulty: 2, part: 4, p4: '1.4.6', tags: ['120', '02016'] },
      { id: 'safety-19', q: 'What happens when you press and hold the red DISTRESS button on a DSC VHF radio?', options: ['It transmits a recorded MAYDAY voice message on channel 16', 'It sends a pre-formatted digital distress alert with your MMSI (and GPS position if connected) to the coast radio and all DSC vessels in range', 'It sends a text message to 112', 'It activates the boat’s EPIRB'], answer: 1, explanation: 'The DSC distress alert goes out on channel 70 with your MMSI and position; the MMSI must be programmed in for it to work. You then make the voice call on channel 16 (F43, F44).', difficulty: 2, part: 1, tags: ['dsc', 'radio'] },
      { id: 'safety-20', q: 'Fire is spreading in the engine compartment and you have a VHF. What do you transmit, and where?', options: ['PAN PAN on channel 70', 'SECURITE on channel 16', 'MAYDAY on channel 16 (after holding the DSC button)', 'MAYDAY on channel 6'], answer: 2, explanation: 'Fire on board is grave and imminent danger: hold the DSC button, then send MAYDAY three times on channel 16 with name, call sign, MMSI, position and nature of distress (F44, F46).', difficulty: 2, part: 4, p4: '1.4.6', tags: ['mayday', 'channel-16'] },
      { id: 'safety-21', q: 'Which statement about the emergency number 112 is correct?', options: ['It is the pan-European emergency number and works even without a SIM card or coverage from your own operator', 'It only works on land', 'It connects directly to the coast radio station', 'It is the Society for Sea Rescue’s number'], answer: 0, explanation: '112 is the police and pan-European emergency number; it can be dialled without a SIM or your own operator’s coverage. At sea the call is routed to the rescue service (F45, F48).', difficulty: 2, part: 1, tags: ['112'] },
      // ---- Part 1: flotation types and equipment (F9-F26) ----
      { id: 'safety-22', q: 'Which buoyancy class does the Norwegian Maritime Authority recommend for children and non-swimmers?', options: ['50 N buoyancy aid', '100 N life jacket with collar and crotch strap', '150 N automatic inflatable', '275 N offshore jacket'], answer: 1, explanation: '100 N with collar, crotch strap and reflectors is the most suitable device for children and non-swimmers; inflatables are not recommended for children (F11, F12).', difficulty: 1, part: 1, tags: ['flotation'] },
      { id: 'safety-23', q: 'A 50 N buoyancy aid is intended for:', options: ['Anyone, in any weather', 'Unconscious casualties, because it turns them face-up', 'Competent swimmers over 30 kg, close to help, for example in the sheltered archipelago', 'Offshore sailing in heavy clothing'], answer: 2, explanation: 'A 50 N aid is not a life jacket: it floats you vertically, does not turn you face-up, and is meant for swimmers over 30 kg near help (F10).', difficulty: 2, part: 1, tags: ['flotation'] },
      { id: 'safety-24', q: 'Which statement about a 150 N inflatable life jacket is correct?', options: ['It is designed to turn an unconscious wearer face-up unless heavy waterproof clothing is worn, and is not recommended for children', 'It is the ideal choice for small children because it is light', 'It floats the wearer vertically with the chin at the waterline', 'It may only be used within 500 m of the shore'], answer: 0, explanation: '150 N (ISO 12402-3) is for adults in all waters and turns the wearer face-up unless heavy or waterproof clothing is worn; the Authority does not recommend it for children (F12).', difficulty: 2, part: 1, tags: ['flotation'] },
      { id: 'safety-25', q: 'How do you check the CO2 cylinder of an inflatable life jacket?', options: ['Fire it once a year to see that it works', 'Shake it and listen for liquid', 'Submerge the whole jacket and watch for bubbles', 'Unscrew it and weigh it; the weight must match the value printed on the cylinder'], answer: 3, explanation: 'The Authority’s check: unscrew the cylinder and weigh it on a kitchen scale against the printed weight; a light cylinder has leaked (F15).', difficulty: 2, part: 1, tags: ['flotation', 'maintenance'] },
      { id: 'safety-26', q: 'Which two pieces of equipment are legally required on a private recreational boat?', options: ['Fire extinguisher and anchor', 'VHF radio and first-aid kit', 'Flotation equipment for everyone on board, and navigation lights at night or in poor visibility', 'Life raft and distress flares'], answer: 2, explanation: 'Only flotation for all on board and navigation lights are mandatory; the rest of the Authority’s list is recommended (F19).', difficulty: 2, part: 1, tags: ['equipment'] },
      { id: 'safety-27', q: 'What is the purpose of the kill cord (kill switch)?', options: ['It stops the engine if the helmsman falls overboard or leaves the helm', 'It cuts the fuel supply in a fire', 'It triggers the DSC distress alert', 'It locks the throttle at a safe speed'], answer: 0, explanation: 'The lanyard pulls the emergency stop when the helmsman falls out, so the boat does not drive off or circle back. The Authority calls it important to use; there is no general legal duty (F23).', difficulty: 1, part: 1, tags: ['equipment'] },
      { id: 'safety-28', q: 'Why should you always throw the lifebuoy when someone falls overboard, even if they seem to be swimming well?', options: ['It is required by the Rules of the Road', 'It gives the person buoyancy and marks the spot where they fell in', 'It signals distress to other boats', 'It prevents the propeller from hitting them'], answer: 1, explanation: 'The Authority: always throw the buoy; it supports the person and marks the position. A lifebuoy with a light and a throwing line is recommended (F21, F84).', difficulty: 1, part: 1, tags: ['equipment', 'mob'] },
      { id: 'safety-29', q: 'Your engine stops and the wind is pushing you toward rocks. What is the use of a drogue (drift anchor)?', options: ['It restarts the engine by water pressure', 'It signals to other boats that you need a tow', 'It slows the drift and holds the bow to the seas; a bucket on a long bow line can be improvised', 'It replaces the life jackets'], answer: 2, explanation: 'A drogue streamed from the bow slows the drift and can save you from disaster when the boat stops close to shore; the Authority suggests a bucket on a long line fastened at the bow (F24).', difficulty: 2, part: 1, tags: ['equipment'] },
      // ---- Part 1: fire (F27-F41, F91) ----
      { id: 'safety-30', q: 'What is the Norwegian Maritime Authority’s minimum recommendation for a hand extinguisher on a recreational boat?', options: ['A 1 kg CO2 extinguisher in the engine room', 'At least one 2 kg ABC powder extinguisher in an easily accessible place', 'A 6 kg foam extinguisher', 'A fire blanket only'], answer: 1, explanation: 'At least one 2 kg ABC powder hand extinguisher, easily accessible for quick use; larger boats should have more (F27).', difficulty: 1, part: 1, tags: ['fire'] },
      { id: 'safety-31', q: 'Above which engine power is a fixed engine-room extinguishing system required?', options: ['50 kW', '75 kW', '120 kW', '250 kW'], answer: 2, explanation: 'Above 120 kW a fixed system is required (ISO 9094); boats with inboard petrol engines should always have one (F30).', difficulty: 3, part: 1, tags: ['fire'] },
      { id: 'safety-32', q: 'Why must the engine compartment of a petrol inboard be ventilated before starting?', options: ['Petrol vapour is about 2.8 times heavier than air and collects in the bilge, where a spark can ignite it', 'To cool the engine before it is started', 'Because diesel exhaust accumulates overnight', 'It is only necessary after refuelling'], answer: 0, explanation: 'Petrol vapour sinks into the bilge; run the blower and air the compartment before every start (F34).', difficulty: 1, part: 1, tags: ['fire'] },
      { id: 'safety-33', q: 'Where should the sensor of an LPG gas detector be mounted?', options: ['At eye level next to the stove', 'As low as possible in the boat, because the gas is heavier than air', 'Near the cabin roof', 'Outside in the cockpit'], answer: 1, explanation: 'Propane and butane sink to the lowest point, so the sensor goes low (F38). A CO alarm, by contrast, goes high (F41).', difficulty: 2, part: 1, tags: ['fire', 'gas'] },
      { id: 'safety-34', q: 'Where should a carbon monoxide (CO) alarm be mounted?', options: ['In the bilge', 'Next to the gas bottle', 'At the waterline', 'High up, above 1.5 m, preferably near the heater'], answer: 3, explanation: 'The Society for Sea Rescue recommends mounting a CO alarm above 1.5 m near a diesel heater, unlike a gas detector, which goes low (F41).', difficulty: 2, part: 1, tags: ['fire', 'co'] },
      { id: 'safety-35', q: 'Carbon monoxide is dangerous on board because it:', options: ['Smells strongly and causes panic', 'Sinks into the bilge like petrol vapour', 'Is colourless and odourless and causes headache, dizziness, nausea, confusion and unconsciousness', 'Is produced only by petrol engines'], answer: 2, explanation: 'CO from engines, heaters and grills under a canopy cannot be seen or smelt; symptoms progress from headache and nausea to unconsciousness. Fresh air and 113 if serious (F40).', difficulty: 2, part: 1, tags: ['co'] },
      { id: 'safety-36', q: 'When using a hand extinguisher you aim at:', options: ['The top of the flames', 'The smoke', 'The base of the fire', 'The area around the fire to stop it spreading'], answer: 2, explanation: 'Pull the pin, aim at the base of the flames, squeeze, sweep from side to side, keeping your escape route behind you (F33).', difficulty: 1, part: 1, tags: ['fire'] },
      { id: 'safety-37', q: 'Fire has broken out at the stern of the boat in the picture, the crew are in the bow and the boat is heading into the wind. What should the helmsman do?', illustration: () => fireScene(true), options: ['Keep heading into the wind so flames and smoke blow aft, away from the crew', 'Turn and run downwind at full speed', 'Turn broadside to the wind', 'Stop and let the boat drift beam-on'], answer: 0, explanation: 'Turn the boat so the wind carries flames and smoke away from the people: with a fire aft, head into the wind (F91).', difficulty: 2, part: 1, tags: ['fire', 'picture'] },
      { id: 'safety-38', q: 'In the picture the fire is at the BOW, the crew are aft, and the boat is heading into the wind. What should you do?', illustration: () => fireScene(false), options: ['Keep heading into the wind', 'Anchor immediately regardless of the wind', 'Increase speed into the wind to blow the fire out', 'Turn and run downwind so the smoke and flames blow forward, away from the crew'], answer: 3, explanation: 'With the fire forward, running downwind carries flames and smoke ahead of the boat and away from the people aft (F91).', difficulty: 3, part: 1, tags: ['fire', 'picture'] },
      { id: 'safety-39', q: 'A pan of cooking oil catches fire in the galley. What is the right action?', options: ['Pour water on it', 'Shut off the gas and smother the pan with a lid or fire blanket', 'Carry the pan out into the cockpit', 'Open all hatches to let the smoke out'], answer: 1, explanation: 'Shut the gas at the bottle and smother the fire; water on burning fat causes a fireball and ABC powder is not rated for fat fires (F31, F32, F35).', difficulty: 2, part: 1, tags: ['fire'] },
      { id: 'safety-40', q: 'You smell petrol after refuelling an inboard engine. What do you do first?', options: ['Start the engine to pump the vapour out', 'Switch on all cabin lights to inspect the bilge', 'Do not start the engine or use electrical switches; open hatches, run the blower and ventilate until the smell is gone', 'Pour water into the bilge'], answer: 2, explanation: 'Petrol vapour lies in the bilge waiting for a spark. Ventilate, find and wipe up the spill and check the fuel lines before starting; no flames, no switches (F34-F36).', difficulty: 2, part: 1, tags: ['fire'] },
      // ---- Part 1: man overboard and cold water (F66-F76, F84-F86, F93) ----
      { id: 'safety-41', q: 'A crew member falls overboard from a motorboat at speed. What is the FIRST thing to do?', options: ['Start the Williamson turn', 'Shout "man overboard" and throw the lifebuoy at once', 'Call 113', 'Jump in after them'], answer: 1, explanation: 'Alert and throw first: the buoy supports the casualty and marks the spot. Then MOB on the plotter, one person points, and you turn back (F84).', difficulty: 1, part: 1, tags: ['mob'] },
      { id: 'safety-42', q: 'The picture shows the Williamson turn used to return to a person overboard. Through how many degrees do you turn before reversing the helm?', illustration: () => mobTurn({ quiz: true }), options: ['About 30 degrees', 'About 90 degrees', 'About 60 degrees', 'A full 180 degrees'], answer: 2, explanation: 'Helm hard over to one side until about 60 degrees off the original course, then hard over the other way until on the reciprocal course, which brings you back down your track (F85).', difficulty: 2, part: 1, tags: ['mob', 'picture'] },
      { id: 'safety-43', q: 'How should you make the final approach to a person in the water?', options: ['At speed, downwind, so the boat stops quickly', 'From astern with the engine in gear to hold position', 'Beam-on to the wind with the engine running', 'Into the wind so the boat stops with the casualty alongside, engine in neutral or off'], answer: 3, explanation: 'Approach into the wind so you stop alongside, and take the engine out of gear before anyone is near the propeller (F84, F93).', difficulty: 2, part: 1, tags: ['mob'] },
      { id: 'safety-44', q: 'According to the 1-10-1 principle, how long do you have in cold water before cold incapacitation stops meaningful movement?', options: ['About 1 minute', 'About 10 minutes', 'About 1 hour', 'About 10 hours'], answer: 1, explanation: '1 minute to get breathing under control (cold shock), about 10 minutes of useful movement, about 1 hour before unconsciousness from hypothermia (F69).', difficulty: 2, part: 1, tags: ['cold-water'] },
      { id: 'safety-45', q: 'You fall into 8 degree water. What should you do in the first minute?', options: ['Float on your back, keep nose and mouth clear and get your breathing under control before anything else', 'Swim hard for the shore while you still have strength', 'Take off your heavy clothing', 'Dive to check for underwater hazards'], answer: 0, explanation: 'Cold shock makes you gasp and hyperventilate for about a minute; floating and controlling the breathing prevents inhaling water (F67). Movement comes in the next ten minutes.', difficulty: 2, part: 1, tags: ['cold-water'] },
      { id: 'safety-46', q: 'Your boat capsizes about 500 m from the shore. What is the best course of action?', options: ['Swim for the shore immediately while you are still warm', 'Dive under the hull to recover the flares', 'Remove heavy clothing and tread water to stay warm', 'Stay with the boat, climb onto the hull if possible, keep everyone together and signal for help'], answer: 3, explanation: 'The Authority’s rule is "stay calm, stay by the boat and call for help": the hull is visible and buoyant, swimming pumps heat away, and a head in the water is almost invisible (F73, F86).', difficulty: 2, part: 1, tags: ['capsize', 'cold-water'] },
      { id: 'safety-47', q: 'What is the HELP position?', options: ['With a life jacket on: knees drawn up to the chest, arms clamped to the sides or across the chest, head out of the water', 'Lying flat on your back with arms and legs spread wide', 'Swimming slowly in a circle to keep the blood moving', 'Floating face-down with the body relaxed between breaths'], answer: 0, explanation: 'Heat Escape Lessening Posture protects the armpits and groin and cuts heat loss by about one third; it requires a life jacket (F72).', difficulty: 1, part: 1, tags: ['cold-water'] },
      { id: 'safety-48', q: 'Which action is dangerous when treating a hypothermic person?', options: ['Replacing wet clothes with dry ones', 'Putting insulation under as well as around the person', 'Giving a warm non-alcoholic drink to a conscious person', 'Giving alcohol and rubbing the arms and legs vigorously'], answer: 3, explanation: 'Never give alcohol; warm slowly, insulate, keep horizontal and handle gently. Rubbing and exercise move cold blood to the core and can trigger cardiac arrest (F75, F76).', difficulty: 2, part: 1, tags: ['hypothermia', 'first-aid'] },
      { id: 'safety-49', q: 'Adult CPR according to the Norwegian Resuscitation Council (2021) is:', options: ['30 compressions then 2 breaths, 100-120 compressions per minute, 5-6 cm deep', '15 compressions then 2 breaths at 60 per minute', '5 compressions then 1 breath', 'Breaths only, every 5 seconds'], answer: 0, explanation: 'Check breathing for up to 10 s; if not breathing normally, 30:2 at 100-120 per minute, 5-6 cm deep, with 113 on speaker (F77).', difficulty: 2, part: 1, tags: ['cpr', 'first-aid'] },
      { id: 'safety-50', q: 'How does resuscitation of a drowned person differ from ordinary adult CPR?', options: ['Compressions only; no breaths are given', 'It starts with 2 minutes of compressions before any breaths', 'The ratio is changed to 15:2', 'It starts with 5 rescue breaths, then continues 30:2'], answer: 3, explanation: 'Drowning is a hypoxic arrest, so ventilation is essential: 5 initial rescue breaths, then 30:2. Compression-only CPR is not adequate for drowning (F78).', difficulty: 3, part: 1, tags: ['cpr', 'first-aid'] },
      { id: 'safety-52', q: 'What is the maximum penalty for a skipper who wilfully leaves the scene of a collision without helping the other vessel?', options: ['Imprisonment for up to 3 years (6 if someone dies or is seriously injured)', 'A fixed fine of NOK 900', 'Loss of the boating licence for one month', 'There is no penalty; the duty is only moral'], answer: 0, explanation: 'Maritime Code Section 506: wilful or grossly negligent breach of the duty to assist is punishable by fines or imprisonment up to 3 years, up to 6 years if the failure results in death or significant injury (F90).', difficulty: 3, part: 1, tags: ['collision', 'law'] },
      { id: 'safety-53', q: 'Your engine fails 200 m upwind of a rocky shore in a fresh breeze. Nobody is hurt. What is the correct order of actions?', options: ['MAYDAY first, then flares, then anchor', 'Anchor or stream a drogue at once, put on life jackets, then call for assistance (120 / 02016 / PAN PAN)', 'Swim ashore with a line to pull the boat in', 'Wait and see whether the wind drops'], answer: 1, explanation: 'Stop the drift first, then life jackets, then a call for assistance. Escalate to MAYDAY only if the anchor fails and you are about to strike the rocks (F87, scenario 3).', difficulty: 3, part: 1, tags: ['engine-failure'] },
      { id: 'safety-54', q: 'Your engine has failed in calm weather and nobody is in danger. Which priority word do you use on VHF channel 16?', options: ['MAYDAY', 'SECURITE', 'ALL STATIONS', 'PAN PAN'], answer: 3, explanation: 'PAN PAN marks an urgent situation without immediate danger to life; MAYDAY is reserved for grave and imminent danger; SECURITE is for safety messages about hazards or weather (F46).', difficulty: 2, part: 1, tags: ['radio', 'pan-pan'] },
      { id: 'safety-55', q: 'Which description matches the typical victim in the Norwegian Maritime Authority’s fatality statistics?', options: ['An older man in an open motorboat in sheltered waters, without a life jacket, often under the influence of alcohol', 'A young woman in a sailing boat offshore in a storm', 'A licensed skipper in a large closed motor cruiser', 'A child in a kayak on a lake'], answer: 0, explanation: 'In 2025 all 18 who died were men, average age 65; 11 wore no flotation, open motorboats dominated, and most accidents were in narrow coastal waters, lakes and harbours; about half of the 2024 victims were under the influence (F95-F99).', difficulty: 2, part: 1, tags: ['statistics'] },
      // ---- Part 2: Annex IV distress signals (F58-F65) ----
      { id: 'safety-56', q: 'Is the signal in the picture, a burning WHITE hand flare, a distress signal under Annex IV of the Rules of the Road?', illustration: () => flareIcon('white'), options: ['Yes, any hand flare is a distress signal', 'Yes, but only at night', 'No: red flares, red rockets and orange smoke are distress signals; white is an attention or illumination signal', 'No: hand flares are never distress signals, only rockets are'], answer: 2, explanation: 'Annex IV lists red parachute rockets, red hand flares and orange smoke. A white flare is used to attract attention or illuminate and must not be confused with a distress signal (F59, F60, trap 19).', difficulty: 2, part: 2, tags: ['annex-iv', 'picture'] },
      { id: 'safety-58', q: 'How and when is the orange smoke signal in the picture used?', illustration: () => flareIcon('smoke'), options: ['At night, held above the head', 'Fired into the air like a rocket', 'Held at arm’s length on the lee side for about 60 seconds', 'In daylight: a floating smoke is activated and thrown into the water clear of the boat; it burns about 3 minutes and shows the helicopter pilot the wind'], answer: 3, explanation: 'Orange smoke is invisible in the dark and lasts about 3 minutes; a floating smoke goes in the water, never in the hand, and its plume shows the wind to a helicopter pilot (F63).', difficulty: 2, part: 1, tags: ['flares', 'picture'] },
      { id: 'safety-60', q: 'You have a box of expired red flares and want to use a couple for fun at a midsummer party. Is this allowed?', options: ['Yes, if they are expired they no longer count as distress signals', 'Yes, provided you tell the coast radio first', 'No: using a distress signal for any purpose other than distress is prohibited, and expired flares must be returned to a dealer as explosive waste', 'Yes, as long as you are on land'], answer: 2, explanation: 'Annex IV paragraph 2 prohibits using these signals except to indicate distress, or using signals that could be confused with them. Expired pyrotechnics are explosive waste for a dealer or collection point, never household rubbish or fireworks (F60, F64).', difficulty: 2, part: 2, tags: ['annex-iv', 'flares'] },
    ],
  });
})();
