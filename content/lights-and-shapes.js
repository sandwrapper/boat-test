/* Skipper Prep — topic 3: Navigation lights and day shapes.
   Facts: scratchpad/facts/lights-and-shapes.md (verified 2026-10-03 against the IMO COLREG consolidated
   text, the Norwegian collision regulation on Lovdata and the Norwegian Maritime Authority's English
   translation, the NMA exam syllabus and the NMA diving-flag notice). Fact ids (F1...F92), scenario ids
   (S1...S12) and illustration ids (IL-1...IL-13) in comments refer to that sheet.
   Shared pictures come from src/svg-lights.js (lightArcs, vesselLights, shipProfile, dayShape); the
   topic-specific pictures below are drawn with the base primitives. Quiz pictures are drawn inline so
   that no title or caption gives the answer away. */
(function () {
  'use strict';
  const S = BOAT.svg, C = S.COLORS, T = S.text;
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)', PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', SHALLOW = 'var(--shallow)';
  // Night scenes have a fixed dark background, so their ink is fixed too (never theme dependent).
  const NI = '#e7edf2', NM = '#a7b6c4', NHULL = '#1f3447', NSEA = '#0d1d2c', NMAST = '#34506a', NPANEL = '#101f31';
  // Day-shape scenes have a fixed pale sky so black shapes always show.
  const DSKY = '#eaf2fb', DSEA = '#9ec5d8', DINK = '#1a2630', DMUTED = '#4b5a66', HULL = '#8a97a3';
  const LAMP = { white: C.white, red: C.red, green: C.green, yellow: C.yellow };
  const f = n => Math.round(n * 100) / 100;

  // ---------- primitives ----------
  function rect(x, y, w, h, fill, stroke, o) {
    o = o || {};
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 6 : o.rx}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${o.sw || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`;
  }
  function line(x1, y1, x2, y2, stroke, o) {
    o = o || {};
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke || INK}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>`;
  }
  function lines(x, y, arr, o) { o = o || {}; const lh = o.lh || 14; return arr.map((s, i) => T(x, y + i * lh, s, o)).join(''); }
  function wrap(s, max) {
    const out = []; let cur = '';
    String(s).split(/\s+/).forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) out.push(cur); return out;
  }
  /* A navigation light: bright disc with a soft halo, plus its colour word (so colour-blind readers are not disadvantaged). */
  function lamp(x, y, color, o) {
    o = o || {};
    const r = o.r || 6, col = LAMP[color] || color;
    let s = `<circle cx="${f(x)}" cy="${f(y)}" r="${r * 3}" fill="${col}" opacity=".13"/><circle cx="${f(x)}" cy="${f(y)}" r="${r * 1.8}" fill="${col}" opacity=".3"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${col}"/>`;
    if (o.label !== false && o.below) s += T(x, y + r + 11, o.label || color, { size: o.size || 10.5, fill: NM, weight: 600 });
    else if (o.label !== false) {
      const right = o.side !== 'left';
      s += T(x + (right ? r + 7 : -r - 7), y, o.label || color, { size: o.size || 10.5, fill: NM, anchor: right ? 'start' : 'end', weight: 600 });
    }
    return s;
  }
  function xmark(x, y, r, color) { const c = color || C.red; return line(x - r, y - r, x + r, y + r, c, { sw: 4 }) + line(x - r, y + r, x + r, y - r, c, { sw: 4 }); }
  /* dark panel with a sea band at the bottom */
  function nightPanel(x, y, w, h, seaFrom) {
    return rect(x, y, w, h, NPANEL, 'none', { rx: 6 }) + `<rect x="${x}" y="${y + (seaFrom == null ? h * .78 : seaFrom)}" width="${w}" height="${h - (seaFrom == null ? h * .78 : seaFrom)}" rx="6" fill="${NSEA}"/>`;
  }
  /* small side-view motorboat silhouette for night panels: stern at x, waterline y, bow to the right (dir=1) or left (dir=-1) */
  function hullSide(x, y, len, dir, o) {
    o = o || {};
    const d = dir || 1, h = o.h || 14;
    return `<polygon points="${x},${y} ${x},${y - h} ${f(x + d * (len - 22))},${y - h} ${f(x + d * len)},${y - h * .55} ${f(x + d * (len - 6))},${y}" fill="${o.fill || NHULL}"/>` + (o.house ? rect(Math.min(x + d * len * .35, x + d * len * .65), y - h - 12, len * .3, 12, o.fill || NHULL, 'none', { rx: 2 }) : '');
  }
  function mast(x, y1, y2, col) { return line(x, y1, x, y2, col || NMAST, { sw: 2.5 }); }
  /* black day shapes with the top edge at y, centred on x; k = scale (1 = 0.6 m ball drawn 36 px) */
  function glyph(kind, x, y, k) {
    k = k || 1; const b = C.black;
    if (kind === 'ball') return `<circle cx="${x}" cy="${f(y + 18 * k)}" r="${18 * k}" fill="${b}"/>`;
    if (kind === 'cone-down') return `<polygon points="${f(x - 19 * k)},${y} ${f(x + 19 * k)},${y} ${x},${f(y + 38 * k)}" fill="${b}"/>`;
    if (kind === 'cone-up') return `<polygon points="${x},${y} ${f(x + 19 * k)},${f(y + 38 * k)} ${f(x - 19 * k)},${f(y + 38 * k)}" fill="${b}"/>`;
    if (kind === 'diamond') return `<polygon points="${x},${y} ${f(x + 19 * k)},${f(y + 32 * k)} ${x},${f(y + 64 * k)} ${f(x - 19 * k)},${f(y + 32 * k)}" fill="${b}"/>`;
    if (kind === 'cylinder') return `<rect x="${f(x - 16 * k)}" y="${y}" width="${32 * k}" height="${64 * k}" fill="${b}"/>`;
    if (kind === 'two-cones') return glyph('cone-down', x, y, k) + glyph('cone-up', x, y + 38 * k, k);
    throw new Error('glyph: unknown ' + kind);
  }
  const GH = { ball: 36, 'cone-down': 38, 'cone-up': 38, diamond: 64, cylinder: 64, 'two-cones': 76 };
  /* a vertical stack of shapes with its top at y, 12 px apart */
  function stack(parts, x, y, k) { let s = '', yy = y; parts.forEach(p => { s += glyph(p, x, yy, k); yy += GH[p] * k + 12 * k; }); return s; }
  const stackH = (parts, k) => parts.reduce((a, p) => a + GH[p] * k, 0) + 12 * k * (parts.length - 1);

  // ---------- IL-2/IL-3 variant: which lights may a motorboat show? (Rules 23, 46; F18-F24) ----------
  function sizeLadder() {
    const W = 640, H = 400;
    let s = rect(0, 0, W, H, C.night, 'none', { rx: 8 });
    s += T(W / 2, 22, 'Power-driven vessel underway (Rule 23): the choice depends on LENGTH and speed', { size: 13.5, weight: 700, fill: NI });
    const cols = [
      { x: 10, title: 'Under 7 m AND max speed 7 knots', lights: ['all-round white only', 'sidelights "if practicable"'], draw: (x) => hullSide(x + 30, 200, 90, 1, { h: 10 }) + mast(x + 78, 190, 150) + lamp(x + 78, 146, 'white', { label: 'white 360°', size: 9.5 }) + `<circle cx="${x + 118}" cy="192" r="4" fill="none" stroke="${C.green}" stroke-width="1.5" stroke-dasharray="2 2"/>` + T(x + 118, 212, 'optional', { size: 9, fill: NM }), note: 'Both conditions. A fast 6 m boat does NOT qualify (F21).' },
      { x: 168, title: 'Under 12 m', lights: ['all-round white + sidelights,', 'OR masthead + sidelights', '+ sternlight'], draw: (x) => hullSide(x + 24, 200, 108, 1, { h: 12, house: true }) + mast(x + 80, 188, 142) + lamp(x + 80, 138, 'white', { label: 'white 360°', size: 9.5 }) + lamp(x + 128, 190, 'green', { label: 'green', size: 9.5, below: true }), note: 'White light at least 1 m above the sidelights (0.5 m if conditions require, Norwegian Rule 46).' },
      { x: 326, title: '12 m to under 50 m', lights: ['masthead light (225°)', 'sidelights + sternlight', 'second masthead optional'], draw: (x) => hullSide(x + 16, 200, 122, 1, { h: 14, house: true }) + mast(x + 90, 186, 136) + lamp(x + 90, 132, 'white', { label: 'white 225°', size: 9.5 }) + lamp(x + 134, 190, 'green', { label: 'green', size: 9.5, below: true }) + lamp(x + 20, 190, 'white', { label: 'stern 135°', size: 9.5, r: 5, below: true }), note: 'Masthead light at least 2.5 m above the gunwale (12 m to under 20 m).' },
      { x: 484, title: '50 m and over', lights: ['TWO masthead lights,', 'the after one HIGHER', '+ sidelights + sternlight'], draw: (x) => hullSide(x + 10, 200, 134, 1, { h: 16, house: true }) + mast(x + 112, 184, 150) + mast(x + 50, 172, 118) + lamp(x + 112, 146, 'white', { label: 'fwd', size: 9.5 }) + lamp(x + 50, 114, 'white', { label: 'aft, higher', size: 9.5 }) + lamp(x + 134, 190, 'green', { label: 'green', size: 9.5, below: true }), note: 'The after masthead light is compulsory from 50 m (Rule 23(a)(ii)).' },
    ];
    cols.forEach(c => {
      s += nightPanel(c.x, 40, 148, 346, 160);
      s += lines(c.x + 74, 56, wrap(c.title, 20), { size: 11.5, weight: 700, fill: NI, lh: 13 });
      s += c.draw(c.x);
      s += lines(c.x + 74, 236, c.lights, { size: 10, weight: 600, fill: NI, lh: 13 });
      s += lines(c.x + 74, 290, wrap(c.note, 24), { size: 9.5, fill: NM, lh: 12 });
    });
    return S.svg(W, H, s, { label: 'Four columns showing the lights a power-driven vessel may show by length: under 7 m and 7 knots an all-round white only; under 12 m an all-round white plus sidelights; under 50 m masthead, sidelights and sternlight; 50 m and over two masthead lights' });
  }

  // ---------- IL-3: rowing boats, kayaks and tiny motorboats (Rules 25(d), 43; F20, F41, F42, F44) ----------
  function smallCraft() {
    const W = 640, H = 300;
    let s = rect(0, 0, W, H, C.night, 'none', { rx: 8 });
    // left: rowing boat / kayak with a torch
    s += nightPanel(10, 10, 305, 280, 150);
    s += T(162, 30, 'Rowing boat, kayak, canoe', { size: 13, weight: 700, fill: NI });
    s += `<polygon points="60,160 70,146 250,146 268,152 254,160" fill="${NHULL}"/>` + line(110, 146, 90, 128, NMAST, { sw: 2.5 }) + line(210, 146, 230, 128, NMAST, { sw: 2.5 });
    s += `<circle cx="160" cy="124" r="7" fill="${NHULL}"/>` + rect(152, 131, 16, 16, NHULL, 'none', { rx: 3 });
    s += line(168, 132, 190, 118, NM, { sw: 3 }) + `<polygon points="190,112 190,124 210,132 210,104" fill="${C.white}" opacity=".9"/>` + S.sector(210, 118, 60, 40, 110, C.white, .18);
    s += lamp(206, 118, 'white', { label: 'torch', size: 9.5, r: 4 });
    s += lines(162, 190, ['No fixed lights required (Rule 25(d)(ii)).', 'MUST have an electric torch or lit white', 'lantern ready, and show it in time to', 'prevent collision. May instead carry', 'sailing-vessel lights (sidelights + stern).'], { size: 10.5, fill: NI, lh: 13 });
    s += lines(162, 262, ['Advice: an all-round white light', 'on a pole above head height.'], { size: 10, fill: NM, lh: 12 });
    // right: motorboat under 7 m, max 7 knots
    s += nightPanel(325, 10, 305, 280, 150);
    s += T(477, 30, 'Motorboat under 7 m, max speed 7 knots', { size: 13, weight: 700, fill: NI });
    s += hullSide(380, 160, 150, 1, { h: 13 }) + rect(436, 134, 30, 13, NHULL, 'none', { rx: 2 }) + mast(480, 147, 96);
    s += lamp(480, 92, 'white', { label: 'white, all round (360°)', size: 9.5 });
    s += `<circle cx="526" cy="152" r="4" fill="none" stroke="${C.green}" stroke-width="1.5" stroke-dasharray="2 2"/>` + line(530, 156, 548, 172, NM, { sw: 1 }) + T(552, 176, 'sidelights if practicable', { size: 9.5, fill: NM, anchor: 'start' });
    s += lines(477, 190, ['Rule 23(c)/(d)(ii): an all-round white light', 'is enough; both the 7 m AND the 7 knot', 'conditions must be met.'], { size: 10.5, fill: NI, lh: 13 });
    s += rect(340, 232, 275, 46, 'none', C.yellow, { rx: 5, sw: 1.2 }) + lines(477, 246, ['Norwegian Rule 43: a boat showing only a white', 'light, and any rowing boat, keeps WELL clear of', 'other vessels, slows down and stops if needed.'], { size: 10, weight: 600, fill: C.yellow, lh: 12 });
    return S.svg(W, H, s, { label: 'A rowing boat showing a torch, and a small slow motorboat showing a single all-round white light, with the Norwegian Rule 43 duty to keep well clear' });
  }

  // ---------- IL-6: what you see from four directions (F83-F86) ----------
  function aspectStrip(type) {
    type = type || 'power';
    const W = 640, H = 330, pw = 150;
    let s = rect(0, 0, W, H, C.night, 'none', { rx: 8 });
    const sail = type === 'sail';
    s += T(W / 2, 20, sail ? 'A sailing vessel under sail (Rule 25): the SAME sidelights, but NO white light above them' : 'A power-driven vessel under 50 m (Rule 23) seen from four directions', { size: 13, weight: 700, fill: NI });
    const panels = [
      { title: 'From AHEAD', draw: x => (sail ? '' : lamp(x + 75, 78, 'white')) + lamp(x + 42, 124, 'green', { side: 'left' }) + lamp(x + 108, 124, 'red'), txt: sail ? ['Red on YOUR right, green on', 'your left, nothing above:', 'a sailing boat is coming at', 'you. A power-driven vessel', 'keeps out of her way (Rule 18).'] : ['Both sidelights + white above:', 'HEAD-ON. Her red (port) light', 'is on YOUR right.', 'Both alter course to', 'STARBOARD (Rule 14).'] },
      { title: 'From HER PORT side', draw: x => (sail ? '' : lamp(x + 62, 74, 'white', { side: 'left' })) + lamp(x + 78, 124, 'red') + mast(x + 62, 150, sail ? 60 : 82, NMAST) + hullSide(x + 118, 158, 90, -1, { h: 9 }), txt: sail ? ['You see RED only, no white:', 'sailing boat, bow to your', 'left. Under power you give', 'way whichever side she is.'] : ['You see RED: she is crossing', 'from YOUR STARBOARD side.', 'YOU give way (Rule 15):', 'turn to starboard, pass', 'astern of her.'] },
      { title: 'From HER STARBOARD side', draw: x => (sail ? '' : lamp(x + 88, 74, 'white')) + lamp(x + 72, 124, 'green', { side: 'left' }) + mast(x + 88, 150, sail ? 60 : 82, NMAST) + hullSide(x + 32, 158, 90, 1, { h: 9 }), txt: sail ? ['You see GREEN only, no', 'white: sailing boat, bow', 'to your right. A motorboat', 'still keeps clear of her.'] : ['You see GREEN: she has you', 'on HER starboard side.', 'SHE gives way, you STAND', 'ON (keep course and', 'speed, Rule 17).'] },
      { title: 'From ASTERN', draw: x => lamp(x + 75, 128, 'white') + hullSide(x + 50, 158, 50, 1, { h: 9 }), txt: ['Only a white STERNLIGHT:', 'you are in her 135° stern', 'sector, so you are', 'OVERTAKING and keep', 'clear (Rule 13).'] },
    ];
    panels.forEach((p, i) => {
      const x = 10 + i * (pw + 6.7);
      s += nightPanel(x, 34, pw, 286, 124);
      s += T(x + 75, 50, p.title, { size: 11.5, weight: 700, fill: NI });
      s += p.draw(x);
      s += lines(x + 75, 182, p.txt, { size: 10, fill: NI, lh: 13 });
    });
    s += T(W / 2, 326, sail ? 'Sailing under 20 m may instead show the same three colours from one tricolour lantern at the masthead.' : 'Rhyme: "If to starboard red appear, it is your duty to keep clear."', { size: 10, fill: NM, italic: true });
    return S.svg(W, H, s, { label: (sail ? 'A sailing vessel' : 'A power-driven vessel') + ' seen from ahead, her port side, her starboard side and astern, with the rule that applies in each case' });
  }

  // ---------- quiz night scene: lights only, no give-away text (IL-6 style) ----------
  function nightScene(lightsArr, o) {
    o = o || {};
    const W = 360, H = 230;
    let s = rect(0, 0, W, H, C.night, 'none', { rx: 8 }) + `<rect x="0" y="176" width="${W}" height="54" rx="8" fill="${NSEA}"/>`;
    s += T(W / 2, 18, o.title || 'Night. The lights of ONE vessel, seen from your boat.', { size: 11.5, weight: 600, fill: NI });
    if (o.masts) o.masts.forEach(m => { s += mast(m[0], m[1], m[2]); });
    if (o.hull) s += hullSide(o.hull[0], 176, o.hull[1], o.hull[2], { h: 10 });
    if (o.stern) s += `<polygon points="${W / 2 - 34},176 ${W / 2 + 34},176 ${W / 2 + 26},160 ${W / 2 - 26},160" fill="${NHULL}"/>`;
    lightsArr.forEach(l => { s += lamp(l[0], l[1], l[2], { side: l[3] || (l[0] < W / 2 ? 'left' : 'right') }); });
    s += T(W / 2, 212, o.note || 'Colour words are given so the picture works for everyone.', { size: 9.5, fill: NM });
    return S.svg(W, H, s, { label: o.label || ('Night view with lights: ' + lightsArr.map(l => l[2]).join(', ')) });
  }
  const SCENES = {
    headOnPower: () => nightScene([[180, 72, 'white'], [134, 124, 'green', 'left'], [226, 124, 'red']], { label: 'Night view: a white light above, green on the left and red on the right' }),
    headOnSail: () => nightScene([[134, 124, 'green', 'left'], [226, 124, 'red']], { masts: [[180, 176, 70]], label: 'Night view: green on the left and red on the right, no white light above' }),
    redWithWhite: () => nightScene([[150, 74, 'white', 'left'], [168, 124, 'red']], { masts: [[150, 170, 82]], hull: [212, 100, -1], label: 'Night view: a white light high and a red light lower, slightly to the right of it' }),
    greenWithWhite: () => nightScene([[210, 74, 'white'], [192, 124, 'green', 'left']], { masts: [[210, 170, 82]], hull: [148, 100, 1], label: 'Night view: a white light high and a green light lower, slightly to the left of it' }),
    sternOnly: () => nightScene([[180, 134, 'white']], { stern: true, label: 'Night view: a single low white light' }),
    bigShipPort: () => nightScene([[118, 96, 'white', 'left'], [218, 58, 'white'], [138, 136, 'red', 'left']], { masts: [[118, 170, 104], [218, 160, 66]], hull: [268, 180, -1], label: 'Night view: two white lights, the left one lower, and a red light low on the left' }),
    tricolourAhead: () => nightScene([[160, 60, 'green', 'left'], [200, 60, 'red']], { masts: [[180, 176, 68]], label: 'Night view: green and red side by side high up, nothing else' }),
    redOverGreen: () => nightScene([[180, 52, 'red'], [180, 80, 'green'], [150, 134, 'red', 'left']], { masts: [[180, 176, 60]], hull: [222, 90, -1], label: 'Night view: red over green high up, and a red light low' }),
    fishing: () => nightScene([[180, 60, 'red'], [180, 88, 'white'], [136, 136, 'red', 'left']], { masts: [[180, 176, 68]], hull: [226, 110, -1], label: 'Night view: red over white all-round lights and a red sidelight' }),
    trawling: () => nightScene([[180, 60, 'green'], [180, 88, 'white'], [136, 136, 'red', 'left']], { masts: [[180, 176, 68]], hull: [226, 110, -1], label: 'Night view: green over white all-round lights and a red sidelight' }),
    nuc: () => nightScene([[180, 60, 'red'], [180, 88, 'red'], [226, 136, 'green']], { masts: [[180, 176, 68]], hull: [134, 110, 1], label: 'Night view: red over red all-round lights and a green sidelight' }),
    ram: () => nightScene([[120, 62, 'white', 'left'], [200, 62, 'red'], [200, 88, 'white'], [200, 114, 'red'], [142, 142, 'red', 'left']], { masts: [[120, 176, 70], [200, 176, 70]], hull: [244, 130, -1], label: 'Night view: a white masthead light forward and red, white, red in a vertical line, plus a red sidelight' }),
    pilot: () => nightScene([[180, 60, 'white'], [180, 88, 'red'], [136, 136, 'red', 'left']], { masts: [[180, 176, 68]], hull: [226, 110, -1], label: 'Night view: white over red all-round lights and a red sidelight' }),
    anchoredBig: () => nightScene([[120, 70, 'white', 'left'], [240, 112, 'white']], { masts: [[120, 176, 78], [240, 176, 120]], hull: [60, 240, 1], label: 'Night view: two white lights, the forward one higher, nothing else' }),
    aground: () => nightScene([[120, 70, 'white', 'left'], [240, 112, 'white'], [180, 62, 'red'], [180, 90, 'red']], { masts: [[120, 176, 78], [240, 176, 120], [180, 176, 70]], hull: [60, 240, 1], label: 'Night view: two white anchor lights and two red lights in a vertical line' }),
    towingAstern: () => nightScene([[180, 108, 'yellow'], [180, 136, 'white']], { stern: true, label: 'Night view: a yellow light directly above a white light' }),
    towingSide: () => nightScene([[140, 62, 'white', 'left'], [140, 88, 'white', 'left'], [160, 136, 'red'], [60, 150, 'white', 'left']], { masts: [[140, 170, 96]], hull: [200, 100, -1], label: 'Night view: two white lights in a vertical line, a red light and a white light astern' }),
    singleWhiteHigh: () => nightScene([[180, 96, 'white']], { masts: [[180, 170, 104]], hull: [130, 100, 1], label: 'Night view: a single white light with nothing else' }),
  };

  // ---------- IL-11: signal flag A (F55-F57) ----------
  function flagAlpha(o) {
    o = o || {};
    const quiz = !!o.quiz, W = quiz ? 360 : 640, H = quiz ? 250 : 320;
    let s = '';
    const flag = (x, y, w, h) => line(x, y - 12, x, y + h + 16, INK2, { sw: 4 }) +
      `<rect x="${x}" y="${y}" width="${w / 2}" height="${h}" fill="#ffffff" stroke="#9a9a9a" stroke-width="1"/>` +
      `<polygon points="${x + w / 2},${y} ${x + w},${y} ${x + w * .75},${y + h / 2} ${x + w},${y + h} ${x + w / 2},${y + h}" fill="${C.blue}"/>`;
    if (quiz) {
      s += flag(50, 26, 270, 180);
      s += T(W / 2, 240, 'A rigid replica of this flag, at least 1 m high, is used at night with lights.', { size: 10, fill: MUTED });
      return S.svg(W, H, s, { label: 'A flag divided vertically, white nearest the pole and blue at the outer edge, with a swallow-tailed notch' });
    }
    s += flag(40, 30, 270, 180);
    s += T(175, 232, 'Signal flag A (Alpha)', { size: 13, weight: 700 }) + T(175, 248, 'WHITE at the hoist, BLUE at the fly, swallow-tailed', { size: 11.5, weight: 700 });
    s += lines(175, 268, ['"I have a diver down; keep well clear at slow speed."', 'Norwegian Rule 42: pass with caution; power-driven vessels', 'stop the engine if possible. Divers may be far from the flag', '(the Maritime Authority mentions up to about 300 m).'], { size: 11, fill: INK2, lh: 14 });
    // the North American "diver down" flag, crossed out
    const x = 400, y = 60, w = 200, h = 134;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.red}"/><polygon points="${x},${y} ${x + 26},${y} ${x + w},${y + h - 18} ${x + w},${y + h} ${x + w - 26},${y + h} ${x},${y + 18}" fill="#ffffff"/>`;
    s += line(x, y - 12, x, y + h + 24, INK2, { sw: 4 });
    s += xmark(x + w / 2, y + h / 2, 70, 'var(--bad)');
    s += lines(500, 240, ['NOT the Norwegian signal.', 'The red flag with a white diagonal is the', 'North American diver-down flag; course', 'material calling flag A "red and white" is wrong.'], { size: 11, fill: INK2, lh: 14 });
    return S.svg(W, H, s, { label: 'Signal flag A, white and blue with a swallow tail, next to the crossed-out red flag with a white diagonal stripe that is not the Norwegian signal' });
  }

  // ---------- IL-10: anchored and aground (Rule 30; F65-F70) ----------
  function anchorStrip() {
    const W = 640, H = 330, pw = 200;
    let s = rect(0, 0, W, H, C.night, 'none', { rx: 8 });
    s += T(W / 2, 20, 'At anchor and aground (Rule 30): all-round lights, no sidelights, no sternlight', { size: 13, weight: 700, fill: NI });
    const panels = [
      { t: 'At anchor, under 50 m', draw: x => hullSide(x + 40, 160, 120, 1, { h: 12, house: true }) + mast(x + 112, 148, 92) + lamp(x + 112, 88, 'white', { label: 'white, 360°' }), day: ['ball'], txt: ['ONE all-round white light where', 'best seen (Rule 30(b)).', 'By day: one black ball forward.', 'Under 7 m, away from channels', 'and traffic: no light needed.'] },
      { t: 'At anchor, 50 m and over', draw: x => hullSide(x + 20, 160, 160, 1, { h: 16, house: true }) + mast(x + 160, 144, 70) + mast(x + 60, 144, 104) + lamp(x + 160, 66, 'white', { label: 'fwd, HIGHER', side: 'left' }) + lamp(x + 60, 100, 'white', { label: 'aft, lower', side: 'left' }), day: ['ball'], txt: ['White forward and a LOWER white', 'aft (Rule 30(a)); from 100 m the', 'decks are lit as well. By day:', 'one ball forward.'] },
      { t: 'Aground', draw: x => hullSide(x + 20, 160, 160, 1, { h: 16, house: true }) + mast(x + 160, 144, 70) + mast(x + 60, 144, 104) + mast(x + 110, 150, 60) + lamp(x + 160, 66, 'white', { label: 'white', side: 'left' }) + lamp(x + 60, 100, 'white', { label: 'white', side: 'left' }) + lamp(x + 110, 60, 'red', { label: 'red' }) + lamp(x + 110, 84, 'red', { label: 'red' }), day: ['ball', 'ball', 'ball'], txt: ['Anchor light(s) PLUS two all-', 'round RED lights in a vertical', 'line (Rule 30(d)). By day: THREE', 'balls. Under 12 m: anchor light', 'only, no reds and no balls.'] },
    ];
    panels.forEach((p, i) => {
      const x = 10 + i * (pw + 10);
      s += nightPanel(x, 34, pw, 288, 126);
      s += T(x + pw / 2, 50, p.t, { size: 12, weight: 700, fill: NI });
      s += p.draw(x);
      s += lines(x + 76, 184, p.txt, { size: 10, fill: NI, lh: 13, anchor: 'middle' });
      // day inset: pale box with the black shapes
      const k = .3, sh = stackH(p.day, k);
      s += rect(x + pw - 46, 170, 38, 60, DSKY, 'none', { rx: 4 }) + stack(p.day, x + pw - 27, 200 - sh / 2, k) + T(x + pw - 27, 240, 'by day', { size: 8.5, fill: NM });
    });
    return S.svg(W, H, s, { label: 'Three night panels: one white anchor light on a vessel under 50 m, two white anchor lights with the forward one higher on a vessel of 50 m or more, and the anchor lights plus two red lights of a vessel aground, with the black day shapes in small insets' });
  }

  // ---------- IL-7: the vertical light stacks of special vessels (Rules 24-29; F45-F64) ----------
  function stackChart() {
    const W = 640, H = 420, cw = 150, ch = 180;
    let s = rect(0, 0, W, H, C.night, 'none', { rx: 8 });
    s += T(W / 2, 20, 'Recognition chart: read the colours from the TOP down', { size: 13.5, weight: 700, fill: NI });
    const cards = [
      { t: 'Trawling', l: ['green', 'white'], m: '"Green over white, trawling at night"', d: 'Day: two cones, points together. Sidelights + stern when making way.' },
      { t: 'Fishing (not trawling)', l: ['red', 'white'], m: '"Red over white, fishing at night"', d: 'Day: two cones, points together. Gear over 150 m: extra white light / cone apex up toward the gear.' },
      { t: 'Not under command', l: ['red', 'red'], m: '"Red over red, the captain is dead"', d: 'Day: two balls. Sidelights + stern when making way, no masthead light.' },
      { t: 'Restricted in ability to manoeuvre', l: ['red', 'white', 'red'], m: '"Red white red, restricted ahead"', d: 'Day: ball, diamond, ball. Plus masthead, side and stern lights when making way.' },
      { t: 'Constrained by her draught', l: ['red', 'red', 'red'], m: 'Three reds in a row: deep draught below', d: 'Day: a cylinder. Shown IN ADDITION to normal power-driven lights.' },
      { t: 'Pilot vessel on duty', l: ['white', 'red'], m: '"White over red, pilot ahead"', d: 'No day shape in Rule 29. Sidelights + stern when underway.' },
      { t: 'Sailing vessel (optional extra)', l: ['red', 'green'], m: 'Red over green at the masthead', d: 'In addition to sidelights + sternlight; never together with a tricolour.' },
      { t: 'Towing astern', l: ['white', 'white'], m: 'Two whites forward; three if tow > 200 m', d: 'At the stern: YELLOW towing light above the white sternlight. Day (tow over 200 m): diamond.' },
    ];
    cards.forEach((c, i) => {
      const x = 10 + (i % 4) * (cw + 6.7), y = 34 + Math.floor(i / 4) * (ch + 10);
      s += rect(x, y, cw, ch, NPANEL, 'none', { rx: 6 });
      s += lines(x + 75, y + 14, wrap(c.t, 20), { size: 11, weight: 700, fill: NI, lh: 12 });
      const top = y + 44, gap = 20, mx = x + 36;
      s += mast(mx, top + (c.l.length - 1) * gap + 12, top - 10);
      c.l.forEach((col, k) => { s += lamp(mx, top + k * gap, col, { r: 5.5, size: 9.5 }); });
      s += lines(x + 75, y + 112, wrap(c.m, 24), { size: 9.5, weight: 600, fill: C.yellow, lh: 11, italic: true });
      s += lines(x + 75, y + 136, wrap(c.d, 27), { size: 9, fill: NM, lh: 11 });
    });
    s += T(W / 2, H - 10, 'All of these are all-round lights except the towing vessel’s masthead lights (225°).', { size: 10, fill: NM, italic: true });
    return S.svg(W, H, s, { label: 'Eight cards with vertical light stacks: green over white trawling, red over white fishing, red over red not under command, red white red restricted in ability to manoeuvre, three reds constrained by draught, white over red pilot, red over green sailing, two whites towing' });
  }

  // ---------- IL-8: day shapes reference (Annex I s.6; F43, F45, F50, F52, F61, F65, F68, F73) ----------
  function dayShapeChart(o) {
    o = o || {};
    const W = 640, H = 330, cw = 150, ch = 140;
    let s = rect(0, 0, W, H, DSKY, 'none', { rx: 8 });
    s += T(W / 2, 20, 'Day shapes are always BLACK. Ball at least 0.6 m across; shapes at least 1.5 m apart.', { size: 12.5, weight: 700, fill: DINK });
    const cards = [
      { p: ['ball'], t: 'One ball', m: 'at anchor (Rule 30)' },
      { p: ['cone-down'], t: 'Cone, apex DOWN', m: 'sailing with the engine on = power-driven (Rule 25(e))' },
      { p: ['two-cones'], t: 'Two cones, apexes together', m: 'engaged in fishing or trawling (Rule 26)' },
      { p: ['diamond'], t: 'Diamond', m: 'tow longer than 200 m, on tug and tow (Rule 24)' },
      { p: ['cylinder'], t: 'Cylinder', m: 'constrained by her draught (Rule 28)' },
      { p: ['ball', 'ball'], t: 'Two balls', m: 'not under command (Rule 27)' },
      { p: ['ball', 'ball', 'ball'], t: 'Three balls', m: 'aground (Rule 30(d))' },
      { p: ['ball', 'diamond', 'ball'], t: 'Ball, diamond, ball', m: 'restricted in her ability to manoeuvre (Rule 27)' },
    ];
    cards.forEach((c, i) => {
      const x = 10 + (i % 4) * (cw + 6.7), y = 32 + Math.floor(i / 4) * (ch + 8);
      s += rect(x, y, cw, ch, '#ffffff', '#c9d6e2', { rx: 6 });
      const k0 = .62, h0 = stackH(c.p, k0), k = h0 > 84 ? k0 * 84 / h0 : k0, h = stackH(c.p, k);
      s += line(x + 38, y + 8, x + 38, y + 100, '#555', { sw: 2.5 }) + stack(c.p, x + 38, y + 54 - h / 2, k);
      s += lines(x + 102, y + 30, wrap(c.t, 15), { size: 11, weight: 700, fill: DINK, lh: 13 });
      s += lines(x + 102, y + 70, wrap(c.m, 18), { size: 9.5, fill: DMUTED, lh: 11.5 });
    });
    return S.svg(W, H, s, { label: 'Eight black day shapes with their meanings: ball at anchor, cone apex down motor-sailing, two cones fishing, diamond long tow, cylinder constrained by draught, two balls not under command, three balls aground, ball diamond ball restricted in ability to manoeuvre' });
  }
  /* quiz: one day shape on a mast, no text */
  function dayShapeQuiz(parts, o) {
    o = o || {};
    const W = 300, H = 230;
    let s = rect(0, 0, W, H, DSKY, 'none', { rx: 8 }) + `<rect x="0" y="170" width="${W}" height="60" rx="8" fill="${DSEA}"/>`;
    s += `<polygon points="90,170 100,154 220,154 232,170" fill="${HULL}"/>` + line(150, 154, 150, 20, '#555', { sw: 3 });
    const k0 = .85, h0 = stackH(parts, k0), k = h0 > 120 ? k0 * 120 / h0 : k0, h = stackH(parts, k);
    s += stack(parts, 150, 86 - h / 2, k);
    if (o.sail) s += `<polygon points="153,30 153,150 70,150" fill="#ffffff" stroke="#777" stroke-width="1"/>` + `<polygon points="147,34 147,146 236,152" fill="#ffffff" stroke="#777" stroke-width="1"/>` + stack(parts, 190, 86 - h / 2, k);
    s += T(W / 2, 214, o.note || 'Daytime. The black shape(s) shown by a vessel.', { size: 10.5, fill: DINK });
    return S.svg(W, H, s, { label: o.label || ('Day shape(s): ' + parts.join(', ')) });
  }

  // ---------- IL-13: visibility ranges (Rule 22; F13-F15) ----------
  function rangeChart() {
    const W = 640, H = 300, x0 = 170, unit = 68;
    let s = T(W / 2, 20, 'Minimum visibility of lights in nautical miles (Rule 22)', { size: 13.5, weight: 700 });
    const groups = [
      { t: 'Under 12 m', v: [2, 1, 2, 2] },
      { t: '12 m to under 50 m', v: [5, 2, 2, 2], note: 'masthead 3 NM if under 20 m' },
      { t: '50 m and over', v: [6, 3, 3, 3] },
    ];
    const names = ['masthead', 'sidelight', 'sternlight', 'all-round'];
    const cols = [C.white, null, C.white, C.white];
    for (let n = 0; n <= 6; n++) s += line(x0 + n * unit, 40, x0 + n * unit, 272, LINE, { sw: 1 }) + T(x0 + n * unit, 284, n + ' NM', { size: 10, fill: MUTED });
    groups.forEach((g, gi) => {
      const y0 = 48 + gi * 76;
      s += T(x0 - 12, y0 + 2, g.t, { size: 12, weight: 700, anchor: 'end' });
      if (g.note) s += T(x0 - 12, y0 + 16, g.note, { size: 9.5, fill: MUTED, anchor: 'end' });
      g.v.forEach((v, k) => {
        const y = y0 + 10 + k * 14, w = v * unit;
        if (k === 1) s += rect(x0, y, w / 2, 11, C.red, INK, { rx: 2, sw: .6 }) + rect(x0 + w / 2, y, w / 2, 11, C.green, INK, { rx: 2, sw: .6 });
        else s += rect(x0, y, w, 11, cols[k], INK, { rx: 2, sw: .6 });
        s += T(x0 + w + 6, y + 6, names[k] + ' ' + v, { size: 10, anchor: 'start', fill: INK2 });
      });
    });
    return S.svg(W, H, s, { label: 'Bar chart of minimum light ranges: under 12 m masthead 2, sidelight 1, sternlight 2, all-round 2 nautical miles; 12 to 50 m 5 (3 under 20 m), 2, 2, 2; 50 m and over 6, 3, 3, 3' });
  }

  BOAT.register({
    id: 'lights-and-shapes',
    title: 'Navigation lights and day shapes',
    order: 3,
    examShare: 6,
    examWeight: 'about 4–7 of 50 questions, some of them in part 4',
    summary: 'The lights a boat must show from sunset to sunrise and in poor visibility, and the black shapes shown by day: the colours and arcs of the masthead light, sidelights and sternlight, the small-boat options (under 7 m and 7 knots, under 12 m, under 20 m, under 50 m), the lights of sailing boats and the torch rule for rowing boats, towing, anchoring, the fishing and "cannot manoeuvre" stacks, and the white-and-blue flag A for a diver down. The motorboat and sailing-boat lights and flag A are part-4 item 1.4.4, where more than two mistakes in the whole exam means a fail.',
    sections: [
      // 1 ------------------------------------------------------------
      {
        id: 'overview',
        title: 'What this topic is and how the exam tests it',
        html: `<p>At night a boat is invisible. All another skipper can see of you is your lights, and all you can see of them is theirs. The Rules of the Road therefore prescribe exactly which coloured lights each kind of vessel shows, over which arcs, so that from a few dots you can tell <em>what</em> is out there, <em>which way</em> it is heading and <em>who must give way</em>.</p>
<p>The syllabus lists this material twice. In <strong>part 2, laws and regulations</strong>, you need good knowledge of the lights on large and small motorboats, the light on a rowing boat, the lights on sailing vessels, the lights and day signal for towing, and signal flag A. Then <strong>part 4, item 1.4.4 "lights and flags"</strong>, repeats the core: lights carried by motorboats and sailing boats, and flag A ("I have a diver down"). Part 4 is the fail-critical group: more than two wrong answers there fails the whole exam, however well you do elsewhere.</p>
<div class="callout rule"><p><strong>When</strong> (Rule 20): lights must be shown <strong>from sunset to sunrise</strong>, and also <strong>by day in restricted visibility</strong> (fog, heavy rain, snow). They may be switched on at any other time when you think it necessary. During those hours you must not show any other light that could be mistaken for a navigation light or spoil a look-out.</p></div>
<p>Typical exam questions: which lights a sailing boat or a motorboat of a given length shows; the colour of each light; when lights must be on; what you show when being towed; a night picture of two or three dots ("what is it, who gives way?"); what flag A means; and what day shape a sailing boat under engine shows. Expect roughly four to seven of the fifty questions, two or three of them in part 4.</p>
<div class="callout tip"><p>A common trap is "only at night". Lights are also compulsory by day in poor visibility, and the police fine a boat whose required lights are not switched on (NOK 4,000) or not fitted at all (NOK 5,000).</p></div>`,
        keyFacts: ['Part 2 (good knowledge) and part 4 item 1.4.4: motorboat and sailing-boat lights, flag A', 'Lights on from sunset to sunrise AND by day in restricted visibility (Rule 20)', 'More than two wrong part-4 answers = fail, whatever the total score', 'Fines: lights not fitted NOK 5,000; fitted but not working or not switched on NOK 4,000'],
        check: { q: 'When must a recreational boat show its navigation lights?', options: ['Only after 22:00', 'Only when other vessels are nearby', 'From sunset to sunrise, and in restricted visibility by day', 'Only outside harbours'], answer: 2, explanation: 'Rule 20(b) and (c): from sunset to sunrise, and also between sunrise and sunset in restricted visibility. They may be shown at any other time when necessary (F1, F2).' },
      },
      // 2 ------------------------------------------------------------
      {
        id: 'arcs',
        title: 'The four basic lights: colour, position and arc',
        html: `<p>Four lights do almost all the work, and the exam asks about each of them by colour, side and arc. The arcs matter because they are what tells you which part of a vessel you are looking at.</p>
<div class="table-wrap"><table><thead><tr><th>Light</th><th>Colour</th><th>Where</th><th>Arc</th></tr></thead><tbody>
<tr><td><strong>Masthead light</strong></td><td>White</td><td>On the centreline, high up, forward</td><td><strong>225°</strong>: from right ahead to 22.5° abaft the beam on each side</td></tr>
<tr><td><strong>Sidelights</strong></td><td><strong>Green to starboard</strong> (right), <strong>red to port</strong> (left)</td><td>Each side of the bow; under 20 m they may be one combined lantern on the centreline</td><td><strong>112.5°</strong> each: from right ahead to 22.5° abaft the beam on its own side</td></tr>
<tr><td><strong>Sternlight</strong></td><td>White</td><td>As near the stern as practicable</td><td><strong>135°</strong>: 67.5° on each side from right aft</td></tr>
<tr><td><strong>Towing light</strong></td><td>Yellow</td><td>Above the sternlight</td><td>135°, same as the sternlight</td></tr>
</tbody></table></div>
<p>Notice the arithmetic: 225° + 135° = 360°. The masthead light and the sternlight together cover the whole horizon, and the sidelights cover the same 225° as the masthead light, split into two halves. The boundary, <strong>22.5° abaft the beam</strong>, is also the edge of the overtaking sector in Rule 13: if you can only see her sternlight, you are overtaking.</p>
<p>Two more definitions: an <strong>all-round light</strong> shows over the full 360°, and a <strong>flashing light</strong> flashes at 120 or more flashes per minute. Memory aid for the sides: "port wine is red" and "port" and "left" both have four letters.</p>
<p>Minimum visibility (Rule 22) for a boat <strong>under 12 m</strong>: sidelights <strong>1 nautical mile</strong>, every other light (masthead, stern, towing, all-round) <strong>2 nautical miles</strong>. From 12 m to under 50 m the masthead light must reach 5 miles (3 miles if under 20 m) and the rest 2 miles; from 50 m, 6 miles for the masthead light and 3 for the others.</p>`,
        illustration: () => S.lightArcs(),
        caption: 'Plan view: masthead white 225°, starboard green and port red 112.5° each, sternlight white 135°. The sidelight and sternlight sectors meet exactly at 22.5° abaft the beam.',
        keyFacts: ['Masthead light: white, 225°, forward on the centreline', 'Sidelights: green starboard, red port, 112.5° each; may be one combined lantern under 20 m', 'Sternlight: white, 135° (67.5° each side of dead astern); towing light: yellow, 135°, above the sternlight', '225° + 135° = 360°; the sternlight sector is the overtaking sector of Rule 13', 'Under 12 m: sidelights visible 1 NM, all other lights 2 NM'],
        check: { q: 'Over what arc does a masthead light show?', options: ['112.5°', '225°', '135°', '360°'], answer: 1, explanation: 'Rule 21(a): a masthead light is white and shows over 225°, from right ahead to 22.5° abaft the beam on each side. 112.5° is a sidelight, 135° the sternlight, 360° an all-round light (F5).' },
      },
      // 3 ------------------------------------------------------------
      {
        id: 'motorboats-small',
        title: 'Motorboats under 12 m: the options you will actually use',
        html: `<p>This is part-4 material (1.4.4). A power-driven vessel underway normally shows a <strong>masthead light, sidelights and a sternlight</strong> (Rule 23(a)). Small boats cannot always fit a proper masthead light, so Rule 23 gives two relaxations, and the exam asks about both, usually with a boat length and sometimes a speed in the question.</p>
<div class="callout rule"><p><strong>Under 12 m</strong>: instead of a masthead light and a sternlight you may show <strong>one all-round white light</strong>, together with the <strong>sidelights</strong>.<br><strong>Under 7 m AND maximum speed not more than 7 knots</strong>: you may show <strong>only an all-round white light</strong>, and sidelights "if practicable".</p></div>
<p>The "7 and 7" rule is about the boat's <em>maximum attainable</em> speed, not how fast you happen to be going. A 6 m boat with a 50 hp outboard can do far more than 7 knots, so it does not qualify: it must show sidelights plus either an all-round white light or a masthead light and sternlight. A small dinghy with a 2 hp outboard or an electric motor does qualify.</p>
<p>Position matters too. The white light on a boat under 12 m must sit <strong>at least 1 m above the sidelights</strong>, so that the colours cannot be confused with the white. Norwegian Rule 46 allows down to 0.5 m on boats under 12 m where conditions require. On boats from 12 m to under 20 m the masthead light goes at least 2.5 m above the gunwale. On a boat under 12 m the white light may be off the centreline if that is impractical, provided the sidelights are a combined lantern on the centreline or in the same fore-and-aft line as the white light.</p>
<div class="callout warn"><p>A motorboat may <strong>never</strong> use a sailing boat's tricolour lantern, and a sailing boat with its engine running is a power-driven vessel and must show the motorboat lights above. "Underway" means not anchored, moored or aground: a drifting boat with the engine off still shows underway lights, not an anchor light.</p></div>`,
        illustration: () => sizeLadder(),
        caption: 'The lights of a power-driven vessel by length (Rule 23). Both conditions of the "7 m and 7 knots" exemption must be met.',
        keyFacts: ['Standard: masthead light + sidelights + sternlight (Rule 23(a))', 'Under 12 m: one all-round white light + sidelights may replace masthead + sternlight', 'Under 7 m AND max speed 7 knots or less: all-round white only, sidelights if practicable', 'White light at least 1 m above the sidelights on a boat under 12 m (0.5 m if conditions require, Norwegian Rule 46)', 'Sailing boat under engine = power-driven vessel; tricolour never on a motorboat'],
        check: { q: 'Your 6.5 m motorboat has a 90 hp outboard. Which lights may you show at night?', options: ['An all-round white light only', 'Sidelights and an all-round white light (or masthead light and sternlight)', 'A tricolour lantern at the top of a pole', 'A red all-round light over a white one'], answer: 1, explanation: 'The boat can do far more than 7 knots, so the "7 m and 7 knots" exemption fails. Under 12 m you must show sidelights with either an all-round white light or a masthead light plus sternlight (S1, F19, F21).' },
      },
      // 4 ------------------------------------------------------------
      {
        id: 'ships',
        title: 'Larger vessels: the second masthead light tells you where the bow is',
        html: `<p>A ship of <strong>50 m or more</strong> must show <strong>two masthead lights</strong>: the forward one lower, and the after one <strong>higher</strong> and at least half the ship's length further aft, plus sidelights and a sternlight. A vessel under 50 m may carry the second masthead light but need not. The after light must be at least 4.5 m higher than the forward one.</p>
<p>Why the exam cares: the two white lights are a heading indicator. The <strong>lower white light is at the bow end</strong>, so when you see two whites with the right-hand one lower, the ship is heading to the right. If the two whites line up one above the other with both sidelights below, she is coming straight at you. Seeing one white light above another therefore tells you two things at once: she is big, and which way she is going. Compare that to a single masthead light, which gives no heading information except what the sidelights add.</p>
<p>Three other things large vessels may add are worth recognising, because they change who gives way:</p>
<ul>
<li><strong>Constrained by her draught</strong> (Rule 28): three all-round red lights in a vertical line, or a cylinder by day, in addition to the normal power-driven lights. Norwegian Rule 48 requires this of big tankers bound for Slagentangen, Risavika and Mongstad, and of tankers inside Filtvet in the Oslofjord. Do not impede her.</li>
<li><strong>Pilot vessel on duty</strong> (Rule 29): white over red all-round at the masthead, plus sidelights and sternlight when underway. "White over red, pilot ahead."</li>
<li><strong>Norwegian Coast Guard</strong> on fisheries protection: an all-round blue light at the highest masthead (Norwegian Rule 53d).</li>
</ul>
<p>In Norwegian narrow waters, busy fairways and harbours, pleasure craft under 15 m must keep out of the way of larger vessels and ferries anyway (Norwegian Rule 44), so when you identify a ship's lights at night the practical answer is almost always: keep well clear, early.</p>`,
        illustration: () => S.shipProfile('ship'),
        caption: 'Power-driven vessel of 50 m or more: forward masthead light low near the bow, after masthead light higher and further aft, green starboard sidelight, white sternlight.',
        keyFacts: ['50 m and over: two masthead lights, the after one at least 4.5 m higher; optional under 50 m', 'The LOWER masthead light is nearer the bow: it tells you her heading', 'Three all-round reds + normal lights = constrained by her draught (cylinder by day)', 'White over red at the masthead = pilot vessel on duty', 'All-round blue light = Norwegian Coast Guard'],
        check: { q: 'At night you see two white lights, the right-hand one lower, with a green light below them. What do you know?', options: ['A small motorboat at anchor', 'A vessel of 50 m or more heading to your right, showing you her starboard side', 'A vessel of 50 m or more heading to your left, showing you her port side', 'A sailing vessel with red over green'], answer: 1, explanation: 'The lower masthead light is the forward one, so the bow is to the right. Green is the starboard sidelight. Two masthead lights are compulsory from 50 m (F88, S12).' },
      },
      // 5 ------------------------------------------------------------
      {
        id: 'sailing',
        title: 'Sailing vessels: sidelights and sternlight, and no white light above',
        html: `<p>Part-4 material again (1.4.4). A sailing vessel under sail shows <strong>sidelights and a sternlight</strong> (Rule 25(a)), and that is all. The absence of a white masthead light above the coloured lights is the signal "I am under sail" and it is what gives her priority over a motorboat under Rule 18. Candidates lose marks by adding a masthead light to the sailing boat: do not.</p>
<p>Two variants for yachts:</p>
<ul>
<li><strong>Tricolour lantern</strong>: a sailing vessel <strong>under 20 m</strong> may combine sidelights and sternlight in <strong>one lantern at or near the top of the mast</strong>. From ahead you then see red and green side by side high up; from astern a single white, high up. Only for sailing vessels, only under 20 m, only while under sail.</li>
<li><strong>Red over green</strong>: in addition to deck-level sidelights and sternlight, a sailing vessel may show two all-round lights in a vertical line at the masthead, <strong>red above green</strong>. These are never shown together with the tricolour.</li>
</ul>
<p>Sailing boats <strong>under 7 m</strong> show the lights above if practicable; if not, they must have a torch or a lit white lantern ready to show in time to prevent collision (the same rule as for rowing boats, next section).</p>
<div class="callout rule"><p><strong>Engine on</strong>: a vessel under sail that is also using her engine is a <strong>power-driven vessel</strong> (Rule 3). At night she shows the motorboat lights: white masthead light + sidelights + sternlight (tricolour off). By day she hangs a <strong>black cone, apex downwards</strong>, forward where it can best be seen (Rule 25(e)).</p></div>
<p>So a yacht entering harbour at dusk with the engine running and the sails still up must switch from tricolour to deck lights plus steaming light, and if it is daylight the cone must already be hanging. The exam's favourite question here is "what day shape does a sailing boat under engine show?" Answer: a cone with its point down.</p>`,
        illustration: () => S.shipProfile('sailboat'),
        caption: 'Under sail at night: green and red sidelights and a white sternlight, no masthead light. Under 20 m the three colours may instead come from a tricolour at the masthead.',
        keyFacts: ['Under sail: sidelights + sternlight, NO masthead light (Rule 25(a))', 'Under 20 m: tricolour lantern at the masthead may replace them (Rule 25(b))', 'Optional: red over green all-round lights at the masthead, never with a tricolour (Rule 25(c))', 'Sails up + engine on = power-driven vessel: masthead light at night, black cone apex DOWN by day', 'Under 7 m: lights if practicable, otherwise a torch or white lantern ready'],
        check: { q: 'A sailing boat is motoring with the sails set by day. What must it show?', options: ['A black ball', 'A black cone, apex upwards', 'A black cone, apex downwards', 'A black diamond'], answer: 2, explanation: 'Rule 25(e): a vessel under sail that is also propelled by machinery shows forward a cone, apex downwards. A ball means at anchor, a diamond a long tow (F43).' },
      },
      // 6 ------------------------------------------------------------
      {
        id: 'small-craft',
        title: 'Rowing boats, kayaks and the Norwegian Rule 43 duty',
        html: `<p>The syllabus asks specifically for "the light on a rowing boat". A vessel under oars (a rowing boat, and in practice a kayak or canoe) <strong>may</strong> show the lights of a sailing vessel, sidelights and sternlight. If it does not, it <strong>must have ready at hand an electric torch or a lit lantern showing a white light</strong>, and must show it in time to prevent a collision (Rule 25(d)(ii)). "No light at all" is always a wrong answer. The Norwegian Society for Sea Rescue's practical advice is an all-round white light, on a kayak mounted on a pole high enough that the paddler's body does not hide it.</p>
<p>The same torch rule applies to a sailing boat under 7 m that cannot carry fixed lights. And a motorboat under 7 m with a maximum speed of 7 knots or less, as you saw, may show only an all-round white light.</p>
<div class="callout rule"><p><strong>Norwegian Rule 43</strong>: a vessel under oars, and a power-driven or sailing vessel that shows only a white light under the small-vessel exemptions, must when approaching other vessels <strong>manoeuvre with caution, slacken speed and if necessary stop</strong>, and must <strong>keep well out of the way</strong> of other vessels.</p></div>
<p>The logic is simple. A single white light tells other skippers nothing about your heading, so the Rules put the burden on you to stay clear. The same single white light seen from another boat could be a sternlight (you are overtaking), a small boat, or a vessel at anchor. In every case the safe answer is the same: slow down, watch whether it moves against the shore lights, and pass well clear.</p>
<div class="callout tip"><p>Exam wording to recognise: "which lights must a rowing boat carry at night?" Answer: a torch or white lantern ready to show in time to prevent collision (or, optionally, sailing-vessel lights). "What must a boat showing only a white light do?" Answer: keep well clear, slow down, stop if required (Rule 43).</p></div>`,
        illustration: () => smallCraft(),
        caption: 'Left: a rowing boat or kayak needs a torch or white lantern ready to show. Right: a motorboat under 7 m and 7 knots may show one all-round white light. Both keep well clear under Norwegian Rule 43.',
        keyFacts: ['Rowing boat / kayak: may show sidelights + sternlight; otherwise a torch or white lantern ready to show in time (Rule 25(d)(ii))', 'Sailing boat under 7 m without fixed lights: the same torch rule', 'Norwegian Rule 43: boats showing only a white light, and rowing boats, keep WELL clear, slow down, stop if needed', 'A single white light ahead: sternlight, small boat or anchored vessel; slow down and keep clear'],
        check: { q: 'What must a rowing boat have at night if it carries no fixed navigation lights?', options: ['Nothing; rowing boats are exempt', 'A red all-round light', 'A torch or lit white lantern, ready to show in time to prevent collision', 'Signal flag A'], answer: 2, explanation: 'Rule 25(d)(ii): a vessel under oars may show sailing-vessel lights; if not, she must have ready at hand an electric torch or lit white lantern to show in time to prevent collision (F42, F91).' },
      },
      // 7 ------------------------------------------------------------
      {
        id: 'reading',
        title: 'Reading another vessel’s lights: who gives way?',
        html: `<p>Picture questions show you two or three dots on a black background and ask what the vessel is doing and what you must do. Work through them in a fixed order: <strong>(1)</strong> is there a white light <em>above</em> the coloured ones? Yes = power-driven; no = sailing. <strong>(2)</strong> Which colours do you see? Both red and green = she is coming towards you; red alone = you see her port side; green alone = her starboard side; a single white low down = her stern. <strong>(3)</strong> Apply the steering rules.</p>
<ul>
<li><strong>Red and green with a white above</strong>: a power-driven vessel head-on. Her red light is on <em>your right</em>, because her port side faces your starboard side. Both vessels alter course to starboard and pass port to port (Rule 14).</li>
<li><strong>Red (and a white above), bearing steady</strong>: she is crossing from your starboard side and you are the give-way vessel (Rule 15). Act early: turn to starboard to pass astern of her, or slow down. "If to starboard red appear, it is your duty to keep clear."</li>
<li><strong>Green (and a white above)</strong>: she has you on her starboard side; she gives way and you stand on, keeping course and speed but watching her (Rule 17).</li>
<li><strong>Red and green with no white above</strong>, or a tricolour high up: a sailing vessel. A power-driven vessel keeps out of her way whichever side she is on (Rule 18), unless you are overtaking her.</li>
<li><strong>Only a white light</strong>: you may be overtaking (you keep clear, Rule 13), or it is a small boat or an anchored vessel. Slow down and identify.</li>
</ul>
<p>Then check for stacks: two reds (not under command), red-white-red (restricted in ability to manoeuvre), red over white or green over white (fishing), three reds (constrained by draught). A power-driven vessel keeps out of the way of all of these; a sailing vessel keeps out of the way of all but the last, which she must simply not impede (Rule 18).</p>`,
        illustration: () => aspectStrip('power'),
        caption: 'The same motorboat seen from ahead, from her port side, from her starboard side and from astern. The colour you see decides who gives way.',
        keyFacts: ['White above coloured lights = power-driven; coloured lights with no white above = sailing', 'Red + green + white ahead = head-on: both turn to starboard (Rule 14)', 'You see her RED = she is on your starboard side = YOU give way (Rule 15)', 'You see her GREEN = you stand on, she gives way', 'Only a white light = overtaking, small boat or anchored: slow down, keep clear'],
        check: { q: 'At night, on your starboard bow, you see a white light with a red light below it, bearing steady. You are in a motorboat. What do you do?', options: ['Hold course and speed; she must give way', 'Alter course to port to pass ahead of her', 'Give way: alter course to starboard and pass astern of her, or slow down', 'Switch on your anchor light'], answer: 2, explanation: 'You are looking at her port side, so she is crossing from your starboard side and you are the give-way vessel under Rule 15. Turn to starboard early to pass astern, or slow down (F85, S3).' },
      },
      // 8 ------------------------------------------------------------
      {
        id: 'flag-a',
        title: 'Flag A: a diver is down',
        html: `<p>The third part-4 item in this topic is a flag, not a light. International Code flag <strong>A (Alpha)</strong> means <strong>"I have a diver down; keep well clear at slow speed."</strong> It is divided vertically: the half nearest the pole is <strong>white</strong>, the outer half is <strong>blue</strong>, and the outer edge has a triangular notch (it is "swallow-tailed"). It is <em>not</em> the red flag with a white diagonal stripe that films and American dive shops use; course material that calls flag A "red and white" is wrong.</p>
<div class="callout rule"><p><strong>Norwegian Rule 42</strong>: when a vessel marks with flag A, or an equivalent rigid board, that a diver is down, other vessels shall <strong>pass with caution</strong>, and <strong>power-driven vessels shall, if possible, stop their engine</strong>.</p></div>
<p>Why stop the engine? A propeller is lethal to a diver surfacing, and divers do not surface where the flag is: the Norwegian Maritime Authority points out that divers may be as far as <strong>about 300 m</strong> from the dive boat. There is no fixed distance in the rule itself. The required reaction is caution, slow speed, a wide berth, and the engine off if you must pass close.</p>
<p>At night a small vessel engaged in diving operations shows three all-round lights in a vertical line, <strong>red, white, red</strong> (the "restricted in her ability to manoeuvre" signal), and a <strong>rigid replica of flag A at least 1 m high</strong>, lit so that it is visible all round (Rule 27(e)). Larger vessels doing underwater work add two reds on the side where the obstruction is and two greens on the side where you may pass.</p>
<div class="callout tip"><p>Three exam facts: flag A is <strong>white and blue, swallow-tailed</strong>; it means <strong>diver down, keep well clear at slow speed</strong>; power-driven vessels <strong>stop the engine if possible</strong>. Distractors will offer "I am at anchor", "I require a pilot" and "I am towing". Flag A is also used on dive buoys floating away from any boat; treat them exactly the same.</p></div>`,
        illustration: () => flagAlpha(),
        caption: 'Signal flag A: white at the hoist, blue at the fly, swallow-tailed. The red flag with a white diagonal is the North American diver-down flag, not the Norwegian signal.',
        keyFacts: ['Flag A: WHITE half at the pole, BLUE half outside, swallow-tailed', 'Meaning: "I have a diver down; keep well clear at slow speed"', 'Norwegian Rule 42: pass with caution; power-driven vessels stop the engine if possible', 'Divers may be about 300 m from the flag (NMA guidance); no fixed distance in the rule', 'Night: red-white-red all-round lights plus a lit rigid flag A at least 1 m high (Rule 27(e))'],
        check: { q: 'A small boat ahead flies a white-and-blue swallow-tailed flag. What does it mean and what must you do?', options: ['Pilot on board; keep clear of the pilot ladder', 'Diver down; pass with caution at slow speed and stop your engine if possible', 'Vessel at anchor; pass on either side at normal speed', 'Vessel requires assistance; approach and offer help'], answer: 1, explanation: 'Signal flag A means "I have a diver down; keep well clear at slow speed". Norwegian Rule 42 adds that power-driven vessels stop the engine if possible (F55, F56).' },
      },
      // 9 ------------------------------------------------------------
      {
        id: 'towing',
        title: 'Towing: two masthead lights, a yellow light and the 200 m limit',
        html: `<p>The syllabus wants the lights and day signal for towing, and towing a friend's broken-down boat home is something you may actually do. The rules are in Rule 24.</p>
<div class="callout rule"><p>A power-driven vessel <strong>towing astern</strong> shows: <strong>two masthead lights in a vertical line</strong> (instead of the single forward masthead light), sidelights, a sternlight, and a <strong>yellow towing light directly above the sternlight</strong>. If the tow is <strong>longer than 200 m</strong> (measured from the tug's stern to the after end of the tow) she shows <strong>three</strong> masthead lights in a vertical line and, by day, a <strong>diamond</strong> where it can best be seen.</p></div>
<p>The <strong>vessel being towed</strong> shows <strong>sidelights and a sternlight</strong>, and a diamond by day if the tow exceeds 200 m. This is the exam's standard question: "you are being towed at night, which lights do you show?" Answer: sidelights and sternlight. A Norwegian rule adds that nets towed under water must end in a float showing a white light or a diamond.</p>
<p><strong>Pushing ahead or towing alongside</strong>: two masthead lights in a vertical line, sidelights and sternlight, but <strong>no yellow towing light</strong>. A pushing tug rigidly connected to its barge is lit as one ordinary power-driven vessel. A towing vessel of 50 m or more also carries its after masthead light.</p>
<p>What about your own motorboat towing a disabled boat at night? Rule 24(i) accepts that a vessel not normally engaged in towing may be unable to show towing lights when helping a vessel in distress. You must then do everything possible to indicate that you are towing, <strong>in particular by lighting up the towline</strong>, and the towed boat shows its sidelights and sternlight if it has them.</p>
<div class="callout tip"><p>Seen from astern a tug shows yellow over white: the towing light sits <em>above</em> the sternlight. From ahead she shows two (or three) whites in a vertical line with the sidelights below, which you must not confuse with a big ship's two masthead lights (those are separated horizontally, the forward one lower).</p></div>`,
        illustration: () => S.shipProfile('tug'),
        caption: 'Tug towing astern at night: two masthead lights in a vertical line, green sidelight, yellow towing light above the white sternlight. The barge shows sidelight and sternlight.',
        keyFacts: ['Tug towing astern: two masthead lights vertical, sidelights, sternlight, YELLOW towing light above the sternlight', 'Tow longer than 200 m (tug stern to end of tow): three masthead lights, diamond by day', 'Towed vessel: sidelights + sternlight (+ diamond if tow over 200 m)', 'Pushing or towing alongside: two masthead lights, no yellow light', 'Towing a vessel in distress with a normal boat: light up the towline (Rule 24(i))'],
        check: { q: 'You are being towed home at night in your 7 m boat after an engine failure. Which lights do you show?', options: ['No lights; the tug shows them for you', 'Sidelights and a sternlight', 'An all-round white light only', 'A yellow towing light'], answer: 1, explanation: 'Rule 24(e): a vessel being towed shows sidelights and a sternlight. The yellow towing light belongs on the towing vessel (F31, S6).' },
      },
      // 10 ------------------------------------------------------------
      {
        id: 'anchor',
        title: 'At anchor and aground',
        html: `<p>A vessel at anchor is not underway, so it shows none of the underway lights. Instead, Rule 30 prescribes <strong>all-round white lights</strong>: one in the fore part and a second one near the stern, <strong>lower</strong> than the forward one. A vessel <strong>under 50 m</strong> may show just <strong>one all-round white light</strong> where it can best be seen, and that is the answer for every recreational boat. By day the signal is <strong>one black ball</strong> forward. Vessels of 100 m or more must also light up their decks.</p>
<p>When do you need the anchor light? A boat <strong>under 7 m</strong> is exempt when anchored away from narrow channels, fairways, anchorages and places where other vessels normally navigate. Everywhere else, and for every boat of 7 m or more, the light is required: typically in a natural harbour where boats come and go at night, but not when you are tied up in a guest harbour. On a boat under 12 m the anchor light must be visible 2 nautical miles, like any other all-round light.</p>
<div class="callout rule"><p><strong>Aground</strong> (Rule 30(d)): the anchor light(s) <strong>plus two all-round red lights in a vertical line</strong>; by day <strong>three balls</strong> in a vertical line. A vessel <strong>under 12 m</strong> aground need not show the red lights or the balls, only the anchor light or ball.</p></div>
<p>Keep the stacks apart: <strong>two reds alone</strong> on a moving vessel is "not under command"; two reds together with white anchor lights on a vessel that is not moving is "aground"; <strong>three reds</strong> with normal steaming lights is "constrained by her draught". Count the lights and look for the whites.</p>
<div class="callout warn"><p>An anchored vessel shows no sidelights and no masthead light. If a question offers "masthead light and sidelights" for a boat at anchor, it is a distractor. And a fishing vessel at anchor keeps her fishing lights rather than switching to anchor lights (Rule 26).</p></div>`,
        illustration: () => anchorStrip(),
        caption: 'Rule 30: one all-round white under 50 m; two whites with the forward one higher from 50 m; aground adds red over red (three balls by day).',
        keyFacts: ['At anchor under 50 m: ONE all-round white light; by day one black ball', '50 m and over: white forward and a LOWER white aft; 100 m and over also lights the decks', 'Under 7 m anchored away from channels and traffic: no light required', 'Aground: anchor light(s) + two all-round reds; three balls by day; under 12 m exempt from the reds and balls', 'No sidelights, no masthead light at anchor'],
        check: { q: 'A 35 m vessel at anchor at night shows:', options: ['Two white masthead lights', 'Sidelights and a sternlight', 'One all-round white light where it can best be seen', 'Two red lights in a vertical line'], answer: 2, explanation: 'Rule 30(b): a vessel under 50 m at anchor may show a single all-round white light. Two reds would mean not under command or, with anchor lights, aground (F66).' },
      },
      // 11 ------------------------------------------------------------
      {
        id: 'special',
        title: 'Fishing vessels and vessels that cannot manoeuvre: the stacks',
        html: `<p>You need these at recognition level, because Rule 18 makes you give way to all of them. Every signal here is a <strong>vertical stack of all-round lights</strong> read from the top down, with a black day shape as the daytime equivalent. The rhymes are old, but they work.</p>
<div class="table-wrap"><table><thead><tr><th>Lights (top down)</th><th>Day shape</th><th>Vessel</th><th>With sidelights and sternlight?</th></tr></thead><tbody>
<tr><td><strong>Green over white</strong></td><td>Two cones, apexes together</td><td>Trawling (Rule 26(b))</td><td>Only when making way; a trawler of 50 m or more adds a masthead light abaft and higher</td></tr>
<tr><td><strong>Red over white</strong></td><td>Two cones, apexes together</td><td>Fishing other than trawling (Rule 26(c))</td><td>Only when making way; gear over 150 m out: an extra white light or cone apex up toward the gear</td></tr>
<tr><td><strong>Red over red</strong></td><td>Two balls</td><td>Not under command (Rule 27(a)): engine or steering failure</td><td>Only when making way; no masthead light</td></tr>
<tr><td><strong>Red, white, red</strong></td><td>Ball, diamond, ball</td><td>Restricted in her ability to manoeuvre (Rule 27(b)): dredging, cable work, diving, surveying</td><td>When making way, with masthead light(s)</td></tr>
<tr><td><strong>Red, red, red</strong></td><td>Cylinder</td><td>Constrained by her draught (Rule 28)</td><td>Always, with normal power-driven lights</td></tr>
<tr><td><strong>White over red</strong></td><td>None prescribed</td><td>Pilot vessel on duty (Rule 29)</td><td>When underway</td></tr>
</tbody></table></div>
<p>"Red over white, fishing at night; green over white, trawling at night; red over red, the captain is dead; red white red, restricted ahead; white over red, pilot ahead." A vessel shows the fishing lights only while actually fishing; otherwise she is lit as an ordinary vessel of her length. Vessels under 12 m are exempt from the not-under-command and restricted-in-ability signals, except when engaged in diving. None of these is a distress signal.</p>
<p>A vessel dredging or doing underwater work with an obstruction adds two reds (balls) on the obstructed side and two greens (diamonds) on the side you may pass. Mine-clearance vessels show three green lights or three balls in a triangle; stay 1,000 m away. Two Norwegian extras: a <strong>cable ferry</strong> shows three red lights in a triangle (a ball by day), and a <strong>guard vessel</strong> protecting a closed area shows green over red over red and flies flag U by day.</p>`,
        illustration: () => stackChart(),
        caption: 'The vertical stacks, top down. Fishing and "cannot manoeuvre" vessels have priority over both motorboats and sailing boats (Rule 18).',
        keyFacts: ['Green over white = trawling; red over white = fishing; day: two cones apexes together', 'Red over red = not under command (two balls); red-white-red = restricted in ability to manoeuvre (ball-diamond-ball)', 'Three reds + steaming lights = constrained by draught (cylinder); white over red = pilot vessel', 'Sidelights and sternlight are added only when making way (fishing, NUC, RAM)', 'Under 12 m: exempt from NUC and RAM signals except when diving; none of these is a distress signal'],
        check: { q: 'At night you see a red light above a white light, both all-round, with a green sidelight below. What is it?', options: ['A pilot vessel', 'A vessel fishing (not trawling), making way', 'A vessel not under command', 'A trawler at anchor'], answer: 1, explanation: 'Rule 26(c): red over white is a vessel engaged in fishing other than trawling; the sidelight shows she is making way. Green over white would be a trawler, white over red a pilot vessel (F46, F49).' },
      },
      // 12 ------------------------------------------------------------
      {
        id: 'shapes',
        title: 'Day shapes: eight black silhouettes',
        html: `<p>By day the lights are replaced by <strong>black shapes</strong> hung where they can best be seen (Annex I). The exam asks for the colour (always black), for the meaning of the common shapes, and above all for the sailing boat's cone. Minimum sizes exist so the shapes are visible from a distance: a ball at least 0.6 m in diameter, a cone with a base of 0.6 m and the same height, a cylinder 0.6 m across and twice as high, a diamond made of two cones base to base, and at least 1.5 m between shapes in a stack. Vessels under 20 m may use smaller shapes in proportion.</p>
<ul>
<li><strong>Ball</strong>: one = at anchor; two = not under command; three = aground.</li>
<li><strong>Cone, apex down</strong>: sailing vessel using her engine (she is then a power-driven vessel).</li>
<li><strong>Cone, apex up</strong>: shown by a fishing vessel in the direction of gear extending more than 150 m.</li>
<li><strong>Two cones, apexes together</strong> (an hourglass): engaged in fishing or trawling.</li>
<li><strong>Diamond</strong>: tow longer than 200 m (on tug and tow); also the middle shape of ball-diamond-ball (restricted in ability to manoeuvre) and the "pass this side" shape on a dredger.</li>
<li><strong>Cylinder</strong>: constrained by her draught.</li>
</ul>
<p>Recreational boats only ever need two of these: the <strong>cone apex down</strong> when motor-sailing and the <strong>ball</strong> at anchor. In practice few yachts hang the anchor ball in a Norwegian bay, but it is the exam answer, and the cone is taken seriously because without it other boats will treat you as a sailing vessel with priority you do not have.</p>
<div class="callout tip"><p>Direction of the cone: think "engine pushing the point into the water" for apex <strong>down</strong>, and "pointing out towards the gear" for apex <strong>up</strong>. When a question says "cone with the point upwards" for a sailing boat under engine, it is a distractor.</p></div>`,
        illustration: () => dayShapeChart(),
        caption: 'All day shapes are black. One ball, cone apex down, two cones, diamond, cylinder, two balls, three balls and ball-diamond-ball.',
        keyFacts: ['Day shapes are always BLACK; ball at least 0.6 m across, shapes at least 1.5 m apart', 'Ball: 1 = anchored, 2 = not under command, 3 = aground', 'Cone apex DOWN = sailing under engine; apex UP = direction of fishing gear over 150 m; two cones apexes together = fishing', 'Diamond = tow over 200 m (and the middle of ball-diamond-ball); cylinder = constrained by draught'],
        check: { q: 'What colour are day shapes such as the ball, cone and cylinder?', options: ['Black', 'Red', 'Orange', 'White'], answer: 0, explanation: 'Annex I section 6: day shapes shall be black, with a ball at least 0.6 m in diameter (F73).' },
      },
    ],
    flashcards: [
      { front: 'When must navigation lights be shown?', back: 'From sunset to sunrise, and by day in restricted visibility; may be shown at any other time when necessary (Rule 20).' },
      { front: 'Colour and arc of the masthead light?', back: 'White, 225°, from right ahead to 22.5° abaft the beam on each side (Rule 21(a)).' },
      { front: 'Colour of the starboard sidelight? The port sidelight?', back: 'Starboard (right) green; port (left) red. Each 112.5° (Rule 21(b)).' },
      { front: 'Arc of the sternlight?', back: 'White, 135°: 67.5° on each side from right aft (Rule 21(c)).' },
      { front: 'Colour and arc of a towing light?', back: 'Yellow, 135°, same as the sternlight, carried directly above it (Rule 21(d)).' },
      { front: 'What is 22.5° abaft the beam?', back: 'The boundary where the sidelight and masthead arcs end and the sternlight (overtaking) sector begins.' },
      { front: 'Minimum range of lights on a boat under 12 m?', back: 'Sidelights 1 nautical mile; masthead, stern, towing and all-round lights 2 nautical miles (Rule 22(c)).' },
      { front: 'Standard lights of a power-driven vessel underway?', back: 'Masthead light, sidelights, sternlight; a second, higher masthead light aft is compulsory from 50 m (Rule 23(a)).' },
      { front: 'Lights a motorboat under 12 m may show instead of masthead + sternlight?', back: 'One all-round white light together with sidelights (Rule 23(c)/(d)(i)).' },
      { front: 'Which motorboat may show only an all-round white light?', back: 'Under 7 m AND maximum speed not more than 7 knots; sidelights if practicable (Rule 23(c)/(d)(ii)).' },
      { front: 'A 6 m boat with a 50 hp outboard: all-round white light only?', back: 'No. Its maximum speed exceeds 7 knots, so it needs sidelights plus an all-round white (or masthead + stern).' },
      { front: 'How high above the sidelights must the white light be on a boat under 12 m?', back: 'At least 1 m; Norwegian Rule 46 allows 0.5 m where conditions require.' },
      { front: 'Lights of a sailing vessel under sail?', back: 'Sidelights and a sternlight, no masthead light (Rule 25(a)).' },
      { front: 'What is a tricolour lantern and who may use it?', back: 'One masthead lantern combining sidelights and sternlight; sailing vessels under 20 m, under sail only (Rule 25(b)).' },
      { front: 'Red over green all-round at a masthead?', back: 'Optional extra lights of a sailing vessel, in addition to sidelights and sternlight; never with a tricolour (Rule 25(c)).' },
      { front: 'Sailing boat with the engine running: lights and day shape?', back: 'She is power-driven: masthead light + sidelights + sternlight at night; black cone, apex DOWN, by day (Rule 25(e)).' },
      { front: 'Lights on a rowing boat at night?', back: 'May show sidelights + sternlight; otherwise a torch or lit white lantern ready to show in time to prevent collision (Rule 25(d)(ii)).' },
      { front: 'Norwegian Rule 43 duty for a boat showing only a white light, or a rowing boat?', back: 'Manoeuvre with caution, slacken speed, stop if required, and keep WELL out of the way of other vessels.' },
      { front: 'Red light on your right, green on your left, white above: situation?', back: 'A power-driven vessel head-on. Both alter course to starboard (Rule 14).' },
      { front: 'You see a red sidelight with a white above, bearing steady: who gives way?', back: 'You do. You see her port side; she is on your starboard side (Rule 15). Turn to starboard, pass astern.' },
      { front: 'You see a green sidelight with a white above: who gives way?', back: 'She does; she has you on her starboard side. You stand on, keep course and speed (Rule 17).' },
      { front: 'Only a single white light ahead: what could it be?', back: 'A sternlight (you are overtaking), a boat under 7 m, or a vessel at anchor. Slow down and keep clear.' },
      { front: 'Flag A: colours and shape?', back: 'White half at the hoist, blue half at the fly, swallow-tailed.' },
      { front: 'Flag A: meaning and required action?', back: '"I have a diver down; keep well clear at slow speed." Pass with caution; power-driven vessels stop the engine if possible (Norwegian Rule 42).' },
      { front: 'How far from the flag A boat may divers be?', back: 'The Maritime Authority says up to about 300 m; the rule gives no fixed distance. Give a wide berth.' },
      { front: 'Lights of a vessel towing astern?', back: 'Two masthead lights in a vertical line (three if tow over 200 m), sidelights, sternlight, yellow towing light above the sternlight (Rule 24(a)).' },
      { front: 'Lights of the vessel being towed?', back: 'Sidelights and a sternlight; diamond by day if the tow exceeds 200 m (Rule 24(e)).' },
      { front: 'Vessel under 50 m at anchor: light and day shape?', back: 'One all-round white light where best seen; one black ball by day (Rule 30(b)).' },
      { front: 'Vessel aground: lights and day shape?', back: 'Anchor light(s) plus two all-round red lights vertical; three balls by day. Under 12 m: anchor light only (Rule 30(d),(f)).' },
      { front: 'Red over white, all-round?', back: 'Vessel engaged in fishing other than trawling (Rule 26(c)). "Red over white, fishing at night."' },
      { front: 'Green over white, all-round?', back: 'Vessel engaged in trawling (Rule 26(b)). "Green over white, trawling at night."' },
      { front: 'Red over red, all-round?', back: 'Vessel not under command (Rule 27(a)); two balls by day.' },
      { front: 'Red, white, red in a vertical line?', back: 'Vessel restricted in her ability to manoeuvre (Rule 27(b)); ball-diamond-ball by day.' },
      { front: 'Three all-round reds with normal steaming lights?', back: 'Vessel constrained by her draught (Rule 28); a cylinder by day.' },
      { front: 'White over red, all-round?', back: 'Pilot vessel on duty (Rule 29). "White over red, pilot ahead."' },
      { front: 'Colour of all day shapes, and the minimum ball size?', back: 'Black; ball at least 0.6 m in diameter; shapes at least 1.5 m apart (Annex I).' },
      { front: 'Fine for navigation lights not fitted / not working or not lit?', back: 'NOK 5,000 not fitted; NOK 4,000 fitted but not working or not switched on (simplified-fines regulation).' },
    ],
    questions: [
      // ----- part 4, 1.4.4: motorboat lights -----
      { id: 'lights-01', q: 'Which lights must a power-driven vessel of 60 m show when underway?', options: ['Two masthead lights (the after one higher), sidelights and sternlight', 'Masthead light, sidelights and sternlight', 'An all-round white light and sidelights', 'Red over white and sidelights'], answer: 0, explanation: 'Rule 23(a): the second, higher masthead light abaft the forward one is compulsory from 50 m. Under 50 m it is optional (F18).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['rule-23', 'power'] },
      { id: 'lights-02', q: 'Which lights may a 9 m motorboat show instead of a masthead light and a sternlight?', options: ['One all-round white light only', 'A tricolour lantern', 'One all-round white light together with sidelights', 'Two all-round white lights'], answer: 2, explanation: 'Rule 23(c)/(d)(i): a power-driven vessel under 12 m may replace masthead light and sternlight with one all-round white light, but the sidelights remain compulsory. A tricolour is for sailing vessels only (F19, F92).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['rule-23', 'power'] },
      { id: 'lights-03', q: 'Which lights may a 5 m motorboat whose maximum speed is 6 knots show at night?', options: ['An all-round white light, with sidelights if practicable', 'Sidelights only', 'A masthead light only', 'Red over white all-round lights'], answer: 0, explanation: 'Rule 23(c)/(d)(ii): under 7 m AND a maximum speed of 7 knots or less, an all-round white light is enough; sidelights are shown if practicable (F20).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['rule-23', 'power'] },
      { id: 'lights-04', q: 'A 6 m open motorboat with a 60 hp outboard is running at 5 knots at dusk. Which statement is correct?', options: ['It may show only an all-round white light because it is under 7 m', 'It may show only an all-round white light because it is doing under 7 knots', 'It must show sidelights, plus an all-round white light or a masthead light and sternlight', 'It must show two masthead lights'], answer: 2, explanation: 'The exemption requires a MAXIMUM speed of 7 knots or less; this boat can do much more. Under 12 m it needs sidelights plus an all-round white light, or the full masthead + sternlight set (F21, S1).', difficulty: 3, part: 4, p4: '1.4.4', tags: ['rule-23', 'power', 'trap'] },
      { id: 'lights-05', q: 'What colour is the starboard sidelight?', options: ['Red', 'White', 'Yellow', 'Green'], answer: 3, explanation: 'Rule 21(b): green on the starboard (right) side, red on the port (left) side (F6).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['rule-21', 'colours'] },
      { id: 'lights-06', q: 'What colour is the light at the stern of a motorboat?', options: ['Yellow', 'White', 'Red', 'Green'], answer: 1, explanation: 'Rule 21(c): the sternlight is white and shows over 135°. A yellow light at the stern is a towing light (F8, F10).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['rule-21', 'colours'] },
      { id: 'lights-07', q: 'On a motorboat under 12 m, how high must the all-round white (or masthead) light be above the sidelights?', options: ['No requirement', 'At least 1 m (0.5 m where conditions require, Norwegian Rule 46)', 'At least 2.5 m', 'At least 4.5 m'], answer: 1, explanation: 'Annex I section 2 and the Maritime Authority’s guidance: at least 1 m above the sidelights on boats under 12 m; Norwegian Rule 46 allows 0.5 m where conditions require. 2.5 m above the gunwale applies from 12 m to under 20 m (F23, F24).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['annex-i', 'power'] },
      { id: 'lights-08', q: 'A 40 m power-driven vessel shows only one masthead light. Is that allowed?', options: ['No, every power-driven vessel must show two', 'Only if she also shows a red over green', 'Only in restricted visibility', 'Yes, the second masthead light is optional under 50 m'], answer: 3, explanation: 'Rule 23(a)(ii): a vessel of less than 50 m is not obliged to show the second masthead light but may do so (F18).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['rule-23', 'power'] },
      { id: 'lights-09', q: 'Which lights does a motorboat of 15 m show when underway at night?', options: ['Masthead light, sidelights and sternlight', 'All-round white light only', 'Sidelights and sternlight only', 'Red over green and sidelights'], answer: 0, explanation: 'Rule 23(a): a power-driven vessel shows a masthead light, sidelights and a sternlight. The all-round-white options apply only under 12 m; sidelights and sternlight alone would mean a sailing vessel (F18, F38).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['rule-23', 'power'] },
      { id: 'lights-10', q: 'Night. You see the lights in the picture, directly ahead and getting brighter. What is it and what do you do?', illustration: SCENES.headOnPower, options: ['A sailing vessel; hold your course', 'A power-driven vessel head-on; both alter course to starboard', 'A vessel at anchor; pass on either side', 'A power-driven vessel crossing from port; you stand on'], answer: 1, explanation: 'Both sidelights with a white masthead light above means a power-driven vessel coming straight at you; her red (port) light appears on your right. Rule 14: both alter course to starboard (F83, S2).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['picture', 'rule-14', 'power'] },
      { id: 'lights-11', q: 'Night. The lights in the picture are on your starboard bow and the bearing is not changing. You are in a motorboat. What do you do?', illustration: SCENES.redWithWhite, options: ['Keep course and speed; she gives way', 'Alter course to port and cross ahead of her', 'Give way: turn to starboard to pass astern of her, or slow down', 'Sound five short blasts and continue'], answer: 2, explanation: 'White above red: a power-driven vessel showing you her port side, crossing from your starboard side. Rule 15: you are the give-way vessel; pass astern (F85, S3).', difficulty: 3, part: 4, p4: '1.4.4', tags: ['picture', 'rule-15', 'power'] },
      { id: 'lights-12', q: 'Night. The lights in the picture are on your port bow, bearing steady. You are in a motorboat. What is the situation?', illustration: SCENES.greenWithWhite, options: ['She is a sailing vessel; you give way', 'You see her starboard side; she has you on her starboard side and must give way, you stand on', 'You see her port side; you must give way', 'She is at anchor'], answer: 1, explanation: 'White above green: a power-driven vessel showing you her starboard side. You are on her starboard side, so under Rule 15 she gives way and you keep course and speed, watching her (F84).', difficulty: 3, part: 4, p4: '1.4.4', tags: ['picture', 'rule-15', 'power'] },
      { id: 'lights-13', q: 'Night. You see the lights in the picture a long way ahead. What can you say?', illustration: SCENES.bigShipPort, options: ['A sailing vessel heading left', 'A vessel of 50 m or more heading to your LEFT, showing her port side', 'A vessel of 50 m or more heading to your RIGHT, showing her starboard side', 'A tug with a tow'], answer: 1, explanation: 'Two masthead lights with the LOWER one on the left mean the bow is to the left, and the red sidelight confirms you see her port side. Two masthead lights are compulsory from 50 m (F88).', difficulty: 3, part: 4, p4: '1.4.4', tags: ['picture', 'rule-23', 'power'] },
      { id: 'lights-14', q: 'Night. You see only the light in the picture, low down, directly ahead. Which statement is correct?', illustration: SCENES.sternOnly, options: ['It must be a vessel at anchor', 'It must be a pilot vessel', 'It is a vessel not under command', 'It could be a sternlight, a small boat under 7 m or an anchored vessel; slow down and keep clear'], answer: 3, explanation: 'A single white light can be the sternlight of a vessel you are overtaking (Rule 13), a boat under 7 m and 7 knots (Rule 23), or a vessel under 50 m at anchor (Rule 30). In every case you slow down and keep clear (F86, S4).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['picture', 'rule-13', 'power'] },
      // ----- part 4, 1.4.4: sailing-boat lights -----
      { id: 'lights-15', q: 'Which lights must a sailing vessel under sail show at night?', options: ['Masthead light, sidelights and sternlight', 'An all-round white light only', 'Sidelights and a sternlight', 'Red over green only'], answer: 2, explanation: 'Rule 25(a): sidelights and sternlight, and no masthead light. The missing white light above the sidelights is what identifies a sailing vessel at night (F38).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['rule-25', 'sail'] },
      { id: 'lights-16', q: 'An 11 m sailing yacht may replace its deck-level sidelights and sternlight with:', options: ['One all-round white light', 'Red over green all-round lights only', 'Nothing; deck lights are compulsory', 'A tricolour lantern at or near the top of the mast'], answer: 3, explanation: 'Rule 25(b): a sailing vessel under 20 m may combine sidelights and sternlight in one lantern at the masthead. Red over green is an optional addition, never a replacement (F39, F40).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['rule-25', 'sail'] },
      { id: 'lights-17', q: 'A sailing boat shows red over green all-round lights at the masthead. What else must she show?', options: ['Nothing else', 'A tricolour lantern as well', 'Sidelights and a sternlight', 'A white masthead light'], answer: 2, explanation: 'Rule 25(c): the red-over-green lights are shown IN ADDITION to sidelights and sternlight, and never together with a tricolour lantern (F40).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['rule-25', 'sail'] },
      { id: 'lights-18', q: 'A yacht is motoring at night with the sails still set. Which lights must she show?', options: ['Sidelights and sternlight only, because the sails are up', 'The tricolour lantern', 'Red over green at the masthead', 'Masthead light, sidelights and sternlight, like any motorboat'], answer: 3, explanation: 'A vessel under sail that also uses her engine is a power-driven vessel (Rule 3) and shows Rule 23 lights. The tricolour is only for sailing under sail (F25, F92, S5).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['rule-25', 'rule-23', 'sail'] },
      { id: 'lights-19', q: 'A sailing boat is motoring with sails set by day. What must it show?', options: ['A black cone, apex downwards, forward', 'A black ball', 'A black cone, apex upwards', 'A black diamond'], answer: 0, explanation: 'Rule 25(e): a cone, apex downwards, forward where it can best be seen. A ball means anchored, a diamond a tow over 200 m (F43).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['rule-25', 'shapes', 'sail'] },
      { id: 'lights-20', q: 'Daytime. A sailing boat with sails set shows the shape in the picture. What does it mean?', illustration: () => dayShapeQuiz(['cone-down'], { sail: true, label: 'A sailing boat with sails set showing a black cone with its point downwards' }), options: ['She is at anchor', 'She is also using her engine and counts as a power-driven vessel', 'She is engaged in fishing', 'She is not under command'], answer: 1, explanation: 'A cone with its apex downwards is the Rule 25(e) signal for a vessel under sail that is also propelled by machinery; she then has no sailing-vessel priority (F43).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['picture', 'rule-25', 'shapes'] },
      { id: 'lights-21', q: 'Night. You see the lights in the picture ahead of you. You are in a motorboat. What is it, and who gives way?', illustration: SCENES.headOnSail, options: ['A power-driven vessel head-on; both turn to starboard', 'A sailing vessel coming towards you; you keep out of her way', 'A vessel at anchor; no action', 'A fishing vessel; she gives way to you'], answer: 1, explanation: 'Both sidelights and NO white light above: a sailing vessel under sail. A power-driven vessel keeps out of the way of a sailing vessel (Rule 18), so you alter course early and substantially (F87).', difficulty: 3, part: 4, p4: '1.4.4', tags: ['picture', 'rule-25', 'rule-18', 'sail'] },
      { id: 'lights-22', q: 'Night. You see the lights in the picture, high up and close together, nothing else. What vessel is it?', illustration: SCENES.tricolourAhead, options: ['A sailing vessel under 20 m using a tricolour lantern, coming towards you', 'A motorboat under 12 m', 'A pilot vessel', 'A vessel aground'], answer: 0, explanation: 'Red and green side by side at masthead height with no white above is a tricolour lantern, which only a sailing vessel under 20 m may use. Her red is on your right, so she is heading towards you (F39).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['picture', 'rule-25', 'sail'] },
      { id: 'lights-23', q: 'Night. You see the lights in the picture. What vessel is it?', illustration: SCENES.redOverGreen, options: ['A fishing vessel', 'A pilot vessel', 'A sailing vessel showing the optional red over green masthead lights, seen from her port side', 'A vessel not under command'], answer: 2, explanation: 'Rule 25(c): a sailing vessel may add red over green all-round lights at the masthead to her sidelights and sternlight. Red over WHITE would be fishing, WHITE over red a pilot vessel (F40).', difficulty: 3, part: 4, p4: '1.4.4', tags: ['picture', 'rule-25', 'sail'] },
      { id: 'lights-24', q: 'Which of these may a sailing dinghy of 5 m do at night if it has no fixed lights?', options: ['Sail without any light', 'Show a red all-round light', 'Have an electric torch or lit white lantern ready and show it in time to prevent collision', 'Show a yellow flashing light'], answer: 2, explanation: 'Rule 25(d)(i): a sailing vessel under 7 m shall if practicable show sidelights and sternlight; if not, she must have a torch or white lantern ready to show in time to prevent collision (F41).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['rule-25', 'sail'] },
      { id: 'lights-25', q: 'Which vessel may use a tricolour lantern?', options: ['Any vessel under 20 m', 'A motorboat under 12 m', 'A sailing vessel under 20 m, while under sail', 'A fishing vessel'], answer: 2, explanation: 'Rule 25(b) allows the combined masthead lantern only on sailing vessels under 20 m, and only while under sail; a motorboat may never use it (F39, F92).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['rule-25', 'sail', 'trap'] },
      // ----- part 4, 1.4.4: flag A -----
      { id: 'lights-26', q: 'What does International Code flag A mean when shown by a boat?', options: ['I am at anchor', 'I require a pilot', 'I am towing', 'I have a diver down; keep well clear at slow speed'], answer: 3, explanation: 'Flag A (white and blue, swallow-tailed) means "I have a diver down; keep well clear at slow speed". Norwegian Rule 42 adds the duty to pass with caution (F55, F56).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['flag-a'] },
      { id: 'lights-27', q: 'A boat shows the flag in the picture. What must a power-driven vessel passing nearby do?', illustration: () => flagAlpha({ quiz: true }), options: ['Pass with caution at slow speed and stop the engine if possible', 'Sound one prolonged blast and pass at normal speed', 'Stop and offer assistance', 'Keep at least 1 nautical mile away'], answer: 0, explanation: 'This is flag A, "I have a diver down". Norwegian Rule 42: other vessels pass with caution and power-driven vessels stop their engine if possible (F55).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['picture', 'flag-a'] },
      { id: 'lights-28', q: 'How is signal flag A coloured?', options: ['Red with a white diagonal stripe', 'White nearest the pole and blue at the outer edge, swallow-tailed', 'Blue and yellow halves', 'Red and white quarters'], answer: 1, explanation: 'Flag A is divided vertically, white at the hoist and blue at the fly, with a swallow-tailed notch. The red flag with a white diagonal is the North American diver-down flag, not the Norwegian signal (F56).', difficulty: 1, part: 4, p4: '1.4.4', tags: ['flag-a'] },
      { id: 'lights-29', q: 'How far from a boat flying flag A may divers be in the water?', options: ['At most 20 m', 'Within the boat’s own length', 'Up to about 300 m, according to the Norwegian Maritime Authority', 'At least 1 nautical mile'], answer: 2, explanation: 'The Maritime Authority warns that divers may be as far as about 300 m from the dive boat, which is why a wide berth at slow speed is required. The rule itself contains no fixed distance (F57).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['flag-a'] },
      { id: 'lights-30', q: 'At night a small vessel engaged in diving operations shows:', options: ['Flag A only', 'Red over red all-round lights', 'White over red all-round lights', 'Red, white, red all-round lights and a lit rigid replica of flag A at least 1 m high'], answer: 3, explanation: 'Rule 27(e): a small vessel engaged in diving that cannot show the full Rule 27(d) signals shows three all-round lights red-white-red and a rigid replica of flag A at least 1 m high, visible all round (F54).', difficulty: 3, part: 4, p4: '1.4.4', tags: ['flag-a', 'rule-27'] },
      { id: 'lights-31', q: 'You are sailing (under sail only) past a dive boat flying flag A. Which statement is correct?', options: ['Only motorboats need to take care; sailing boats have priority', 'You must pass with caution and keep well clear at slow speed; divers may be far from the flag', 'You must anchor until the divers surface', 'You may pass close because you have no propeller turning'], answer: 1, explanation: 'Norwegian Rule 42 applies to all vessels: pass with caution; the engine-stop duty is specific to power-driven vessels. Divers may be up to about 300 m away, so give a wide berth (F55, F57, S10).', difficulty: 2, part: 4, p4: '1.4.4', tags: ['flag-a'] },
      // ----- part 2: arcs, ranges, timing -----
      { id: 'lights-32', q: 'When must a recreational boat show its navigation lights?', options: ['From sunset to sunrise, and in restricted visibility by day', 'Only after 22:00', 'Only when other vessels are nearby', 'Only outside harbours'], answer: 0, explanation: 'Rule 20(b) and (c): from sunset to sunrise, plus between sunrise and sunset in restricted visibility; they may be shown at any other time when necessary (F1, F2).', difficulty: 1, part: 2, tags: ['rule-20'] },
      { id: 'lights-33', q: 'Over what arc does the sternlight show?', options: ['225°', '112.5°', '180°', '135°'], answer: 3, explanation: 'Rule 21(c): 135°, that is 67.5° on each side from right aft. 225° is the masthead light and 112.5° a sidelight (F8).', difficulty: 1, part: 2, tags: ['rule-21', 'arcs'] },
      { id: 'lights-34', q: 'Over what arc does each sidelight show?', options: ['112.5°, from right ahead to 22.5° abaft the beam on its side', '135°', '225°', '90°, from right ahead to the beam'], answer: 0, explanation: 'Rule 21(b): each sidelight shows over 112.5°, from right ahead to 22.5° abaft the beam on its own side (F6).', difficulty: 2, part: 2, tags: ['rule-21', 'arcs'] },
      { id: 'lights-35', q: 'At what minimum distance must the sidelights of a boat under 12 m be visible?', options: ['0.5 nautical mile', '2 nautical miles', '1 nautical mile', '3 nautical miles'], answer: 2, explanation: 'Rule 22(c): on a vessel under 12 m the sidelights must be visible 1 nautical mile; the masthead, stern, towing and all-round lights 2 nautical miles (F13).', difficulty: 2, part: 2, tags: ['rule-22', 'range'] },
      { id: 'lights-36', q: 'Which sector of a vessel corresponds exactly to the arc of her sternlight?', options: ['The head-on sector of Rule 14', 'The sector in which her sidelights are visible', 'The overtaking sector of Rule 13 (more than 22.5° abaft the beam)', 'The sector covered by the masthead light'], answer: 2, explanation: 'The sternlight shows over 135°, from 22.5° abaft the beam on each side round through dead astern, exactly the overtaking sector of Rule 13(b). If you see only her sternlight you are overtaking (F9).', difficulty: 3, part: 2, tags: ['rule-21', 'rule-13', 'arcs'] },
      { id: 'lights-37', q: 'Night, a single low white light ahead appears stationary against the shore lights. What is the safe conclusion?', options: ['It is a sternlight; overtake at full speed on either side', 'It could be an anchored vessel, a small boat or a sternlight; slow down, watch whether it moves and pass well clear', 'It is a pilot vessel; call on VHF', 'It is a cardinal mark'], answer: 1, explanation: 'A single white light is ambiguous: anchor light (Rule 30), a boat under 7 m (Rule 23) or a sternlight (Rule 13). The burden is on you to slow down and keep clear (S4, F86).', difficulty: 3, part: 2, tags: ['rule-13', 'rule-30'] },
      { id: 'lights-38', q: 'What must a rowing boat have at night if it carries no fixed navigation lights?', options: ['A torch or lit lantern showing a white light, ready to show in time to prevent collision', 'Nothing at all', 'A red all-round light', 'A yellow all-round light'], answer: 0, explanation: 'Rule 25(d)(ii): a vessel under oars may show sailing-vessel lights; if not, she must have a torch or white lantern ready at hand to show in time to prevent collision (F42).', difficulty: 1, part: 2, tags: ['rule-25', 'rowing'] },
      { id: 'lights-39', q: 'Under Norwegian Rule 43, what must a small boat showing only an all-round white light do when approaching other vessels?', options: ['Sound one short blast', 'Switch the light off to avoid confusion', 'Keep its course; other vessels must give way to it', 'Manoeuvre with caution, slacken speed, stop if required, and keep well out of the way'], answer: 3, explanation: 'Norwegian Rule 43: a vessel under oars, and a power-driven or sailing vessel showing only a white light under the small-vessel exemptions, must keep well out of the way of other vessels, slow down and stop if necessary (F44).', difficulty: 2, part: 2, tags: ['rule-43', 'rowing'] },
      { id: 'lights-40', q: 'What is the on-the-spot fine for operating in the dark with navigation lights that are fitted but not switched on?', options: ['NOK 900', 'NOK 4,000', 'NOK 5,000', 'NOK 15,000'], answer: 1, explanation: 'The simplified-fines regulation: NOK 4,000 for fitted lights that are not working or not switched on; NOK 5,000 when required lights are not fitted at all (F82).', difficulty: 2, part: 2, tags: ['fines'] },
      // ----- part 2: towing -----
      { id: 'lights-41', q: 'A tug towing astern at night shows at her stern:', options: ['Two white lights in a vertical line', 'A white light above a yellow light', 'A yellow towing light above the white sternlight', 'A red light above a white light'], answer: 2, explanation: 'Rule 24(a)(iv): a towing light (yellow, 135°) in a vertical line above the sternlight (F29).', difficulty: 2, part: 2, tags: ['rule-24', 'towing'] },
      { id: 'lights-42', q: 'Night. You see the lights in the picture. What is it?', illustration: SCENES.towingAstern, options: ['A vessel towing, seen from astern', 'A hovercraft', 'A fishing vessel', 'A vessel aground'], answer: 0, explanation: 'A yellow light directly above a white sternlight is the stern view of a vessel towing astern (Rule 24). Expect a towline and a towed vessel behind her; never pass between them (F29).', difficulty: 2, part: 2, tags: ['picture', 'rule-24', 'towing'] },
      { id: 'lights-43', q: 'When does a towing vessel show three masthead lights in a vertical line and a diamond by day?', options: ['When the tug is over 50 m', 'When towing at night only', 'When towing alongside', 'When the tow, measured from the tug’s stern to the end of the tow, exceeds 200 m'], answer: 3, explanation: 'Rule 24(a)(i) and (v): three masthead lights and a diamond when the length of the tow exceeds 200 m. The towed object then also carries a diamond (F30, F31).', difficulty: 2, part: 2, tags: ['rule-24', 'towing'] },
      { id: 'lights-44', q: 'You are being towed at night in your 7 m motorboat. Which lights do you show?', options: ['No lights', 'A yellow towing light', 'Sidelights and a sternlight', 'An all-round white light only'], answer: 2, explanation: 'Rule 24(e): the vessel being towed shows sidelights and a sternlight. The yellow light is carried by the towing vessel (F31, S6).', difficulty: 1, part: 2, tags: ['rule-24', 'towing'] },
      { id: 'lights-45', q: 'Your ordinary motorboat tows a disabled boat home at night and cannot show proper towing lights. What does Rule 24 expect?', options: ['Nothing; towing lights are only for professional tugs', 'Take all possible measures to show the relationship, in particular by lighting up the towline', 'Show two red lights in a vertical line', 'Show a flashing yellow light'], answer: 1, explanation: 'Rule 24(i): a vessel not normally engaged in towing that assists a vessel in distress need not show towing lights if impracticable, but must indicate the tow, especially by illuminating the towline (F35).', difficulty: 3, part: 2, tags: ['rule-24', 'towing'] },
      // ----- part 2: anchored / aground -----
      { id: 'lights-46', q: 'A vessel under 50 m at anchor at night shows:', options: ['Two white masthead lights', 'One all-round white light where it can best be seen', 'Sidelights and a sternlight', 'Red over red'], answer: 1, explanation: 'Rule 30(b): a vessel under 50 m may show a single all-round white light. No sidelights, no masthead light at anchor (F66).', difficulty: 1, part: 2, tags: ['rule-30', 'anchor'] },
      { id: 'lights-47', q: 'A vessel aground at night shows, in addition to her anchor lights:', options: ['Three all-round red lights', 'Red over white', 'Two all-round red lights in a vertical line', 'Two all-round green lights'], answer: 2, explanation: 'Rule 30(d): anchor lights plus two all-round red lights in a vertical line; by day three balls (F68).', difficulty: 2, part: 2, tags: ['rule-30', 'aground'] },
      { id: 'lights-48', q: 'Night. You see the lights in the picture and the vessel is not moving. What is it?', illustration: SCENES.aground, options: ['A vessel not under command', 'A vessel constrained by her draught', 'A trawler', 'A vessel aground'], answer: 3, explanation: 'Two white anchor lights (forward one higher) together with red over red mean a vessel aground (Rule 30(d)). Red over red alone, on a moving vessel, would be not under command (F68, S8).', difficulty: 3, part: 2, tags: ['picture', 'rule-30', 'aground'] },
      { id: 'lights-49', q: 'You anchor your 7.5 m boat for the night in a bay where other boats pass. What must you show?', options: ['Nothing; boats under 12 m are exempt', 'One all-round white light visible 2 nautical miles (and a ball by day)', 'Sidelights only', 'Red over red'], answer: 1, explanation: 'The under-7 m exemption does not apply (the boat is 7.5 m, and the bay is used by traffic). Rule 30(b): one all-round white light, visible 2 miles; one ball by day (S7, F66, F69, F71).', difficulty: 2, part: 2, tags: ['rule-30', 'anchor'] },
      { id: 'lights-50', q: 'A vessel at anchor by day shows:', options: ['A black cone, apex down', 'Two black balls', 'A black cylinder', 'One black ball forward'], answer: 3, explanation: 'Rule 30(a)(i): one ball in the fore part. Two balls would be not under command, three aground (F65).', difficulty: 1, part: 2, tags: ['rule-30', 'shapes'] },
      // ----- part 2: special vessels and shapes -----
      { id: 'lights-51', q: 'Night. You see the lights in the picture near the fishing grounds. What is it?', illustration: SCENES.trawling, options: ['A vessel engaged in trawling, making way', 'A pilot vessel', 'A sailing vessel with red over green', 'A vessel at anchor'], answer: 0, explanation: 'Green over white all-round lights: "green over white, trawling at night" (Rule 26(b)). The sidelight shows she is making way; expect nets astern and keep well clear (F45, S9).', difficulty: 2, part: 2, tags: ['picture', 'rule-26', 'fishing'] },
      { id: 'lights-52', q: 'Night. You see the lights in the picture. What is it?', illustration: SCENES.fishing, options: ['A trawler', 'A vessel fishing other than trawling, making way', 'A vessel restricted in her ability to manoeuvre', 'A pilot vessel'], answer: 1, explanation: 'Red over white all-round: a vessel engaged in fishing other than trawling (Rule 26(c)); the sidelight means she is making way. Both power-driven and sailing vessels keep out of her way (F46).', difficulty: 2, part: 2, tags: ['picture', 'rule-26', 'fishing'] },
      { id: 'lights-53', q: 'Night. You see the lights in the picture, moving slowly. What is it?', illustration: SCENES.nuc, options: ['A vessel aground', 'A vessel constrained by her draught', 'A vessel not under command, making way', 'A fishing vessel'], answer: 2, explanation: 'Red over red all-round with a sidelight: a vessel not under command that is making way (Rule 27(a)). Aground would add white anchor lights and not move; constrained by draught has three reds (F50, S8).', difficulty: 2, part: 2, tags: ['picture', 'rule-27', 'nuc'] },
      { id: 'lights-54', q: 'Night. You see the lights in the picture. What is it?', illustration: SCENES.pilot, options: ['A vessel fishing', 'A vessel not under command', 'A hovercraft', 'A pilot vessel on duty'], answer: 3, explanation: 'White over red all-round at the masthead: "white over red, pilot ahead" (Rule 29). Red over white would be fishing (F63).', difficulty: 2, part: 2, tags: ['picture', 'rule-29', 'pilot'] },
      { id: 'lights-55', q: 'Night. You see the lights in the picture. What is it?', illustration: SCENES.ram, options: ['A vessel restricted in her ability to manoeuvre, making way', 'A vessel constrained by her draught', 'A pilot vessel', 'A vessel fishing'], answer: 0, explanation: 'Red, white, red in a vertical line: restricted in her ability to manoeuvre (Rule 27(b)), for example dredging or cable work; when making way she adds masthead light, sidelights and sternlight. By day: ball, diamond, ball (F52).', difficulty: 3, part: 2, tags: ['picture', 'rule-27', 'ram'] },
      { id: 'lights-56', q: 'Three all-round red lights in a vertical line, together with normal steaming lights, mean:', options: ['A vessel aground', 'A vessel not under command', 'A mine-clearance vessel', 'A vessel constrained by her draught'], answer: 3, explanation: 'Rule 28: three all-round reds in addition to the power-driven lights; by day a cylinder. Two reds are not under command; aground shows anchor lights plus two reds (F61).', difficulty: 2, part: 2, tags: ['rule-28', 'cbd'] },
      { id: 'lights-57', q: 'Daytime. A vessel shows the shapes in the picture. What is she?', illustration: () => dayShapeQuiz(['ball', 'diamond', 'ball'], { label: 'A vessel showing a ball, a diamond and a ball in a vertical line' }), options: ['Not under command', 'Aground', 'Constrained by her draught', 'Restricted in her ability to manoeuvre'], answer: 3, explanation: 'Ball, diamond, ball in a vertical line is the day signal of a vessel restricted in her ability to manoeuvre (Rule 27(b)); at night red-white-red (F52).', difficulty: 2, part: 2, tags: ['picture', 'rule-27', 'shapes'] },
      { id: 'lights-58', q: 'Daytime. A vessel shows the shapes in the picture. What is she?', illustration: () => dayShapeQuiz(['two-cones'], { label: 'A vessel showing two black cones with their points together' }), options: ['Engaged in fishing or trawling', 'Sailing under engine', 'Towing a long tow', 'Constrained by her draught'], answer: 0, explanation: 'Two cones with apexes together is the day shape of a vessel engaged in fishing, including trawling (Rule 26). Keep clear of her and her gear (F45, F46).', difficulty: 1, part: 2, tags: ['picture', 'rule-26', 'shapes'] },
      { id: 'lights-59', q: 'Daytime. A vessel shows the shapes in the picture and is not moving. What is she?', illustration: () => dayShapeQuiz(['ball', 'ball', 'ball'], { label: 'A vessel showing three black balls in a vertical line' }), options: ['At anchor', 'Not under command', 'Aground', 'Engaged in mine clearance'], answer: 2, explanation: 'Three balls in a vertical line means a vessel aground (Rule 30(d)). One ball is at anchor, two balls not under command (F68).', difficulty: 2, part: 2, tags: ['picture', 'rule-30', 'shapes'] },
      { id: 'lights-60', q: 'What colour are day shapes (ball, cone, cylinder, diamond)?', options: ['Red', 'Black', 'Orange', 'White'], answer: 1, explanation: 'Annex I section 6: day shapes shall be black; a ball is at least 0.6 m in diameter (F73).', difficulty: 1, part: 2, tags: ['annex-i', 'shapes'] },
    ],
  });
})();
