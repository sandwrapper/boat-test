/* Skipper Prep — illustration library, part 1: navigation lights, day shapes, encounters, sound signals.
   Facts follow the verified fact sheets (COLREG Rules 12–18, 21–30, 32–35, Annex I; Norwegian Rules 41–44).
   Real navigation colours come from BOAT_SVG.COLORS only; diagram ink uses CSS variables so pictures
   read in light and dark themes. Night scenes sit on COLORS.night with lights as discs plus a soft halo.
   Day shapes are black, so they are drawn on a fixed pale daytime sky (fact sheet IL-8 convention). */
(function () {
  'use strict';
  const S = window.BOAT_SVG;
  const C = S.COLORS;
  const esc = S.esc;
  const LIGHT = { white: C.white, red: C.red, green: C.green, yellow: C.yellow };
  const NIGHT_INK = '#e7edf2', NIGHT_MUTED = '#a7b6c4', NIGHT_HULL = '#1f3447', NIGHT_SEA = '#0d1d2c', NIGHT_MAST = '#34506a';
  const DAY_SKY = '#eaf2fb', DAY_SEA = '#9ec5d8', DAY_INK = '#1a2630', DAY_MUTED = '#4b5a66', HULL_GREY = '#8a97a3', NIGHT_HULL_P = '#4d5b68';
  const GIVE = '#F4A261', STAND = '#3A6EA5', WIND = '#2A9D8F', SHORE = '#8A9A5B';
  const fmt = n => Math.round(n * 100) / 100;
  const rad = d => d * Math.PI / 180;

  function fail(what, got, valid) { throw new Error(`${what}: unknown value "${got}". Valid values: ${valid.join(', ')}`); }
  function txt(x, y, s, o) {
    o = o || {};
    return `<text x="${fmt(x)}" y="${fmt(y)}" font-size="${o.size || 12}" font-weight="${o.weight || 500}" fill="${o.fill || 'var(--ink)'}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle"${o.halo ? ` paint-order="stroke" stroke="${o.halo}" stroke-width="3.5" stroke-linejoin="round"` : ''}${o.italic ? ' font-style="italic"' : ''}>${esc(s)}</text>`;
  }
  function wrap(s, max) {
    const out = []; let line = '';
    String(s).split(/\s+/).forEach(w => { if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); });
    if (line) out.push(line); return out;
  }
  function lines(x, y, arr, o) { o = o || {}; return arr.map((l, i) => txt(x, y + i * (o.lh || 15), l, o)).join(''); }
  function caption(x, y, s, max, o) { return lines(x, y, wrap(s, max), o); }
  /* A navigation light: bright disc + soft halo (two translucent circles) + optional colour word. */
  function lamp(x, y, color, o) {
    o = o || {};
    const r = o.r || 6, col = LIGHT[color] || color;
    let s = '';
    if (o.glow !== false) s += `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${r * 3}" fill="${col}" opacity=".13"/><circle cx="${fmt(x)}" cy="${fmt(y)}" r="${r * 1.8}" fill="${col}" opacity=".3"/>`;
    s += `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${r}" fill="${col}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="1.5"` : ''}/>`;
    if (o.label) {
      const right = o.side !== 'left', arr = Array.isArray(o.label) ? o.label : [o.label], lh = 12;
      s += lines(x + (right ? r + 7 : -r - 7), y + (o.dy || 0) - (arr.length - 1) * lh / 2, arr, { size: o.size || 11, fill: o.fill || NIGHT_MUTED, anchor: right ? 'start' : 'end', weight: 600, lh });
    }
    return s;
  }
  function arrowHead(x, y, ang, fill, size) { const k = size || 9; return `<polygon points="0,0 ${-k * .5},${k} ${k * .5},${k}" fill="${fill}" transform="translate(${fmt(x)},${fmt(y)}) rotate(${fmt(ang)})"/>`; }
  const angOf = (x0, y0, x1, y1) => Math.atan2(x1 - x0, -(y1 - y0)) * 180 / Math.PI;
  /* Cubic curve with an arrowhead at the end. */
  function curve(p0, c1, c2, p1, color, o) {
    o = o || {};
    return `<path d="M${p0[0]},${p0[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p1[0]},${p1[1]}" fill="none" stroke="${color}" stroke-width="${o.width || 2.5}"${o.dashed ? ' stroke-dasharray="7 5"' : ''} stroke-linecap="round"/>` + arrowHead(p1[0], p1[1], angOf(c2[0], c2[1], p1[0], p1[1]), color, o.head || 10);
  }
  function arcPath(cx, cy, r, a1, a2) {
    let span = ((a2 - a1) % 360 + 360) % 360; if (span === 0) span = 360;
    const p = a => [fmt(cx + r * Math.sin(rad(a))), fmt(cy - r * Math.cos(rad(a)))];
    const [x1, y1] = p(a1), [x2, y2] = p(a1 + span);
    return `M${x1},${y1} A${r},${r} 0 ${span > 180 ? 1 : 0},1 ${x2},${y2}`;
  }
  const dash = (x1, y1, x2, y2, color, w) => `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${color || 'var(--ink-2)'}" stroke-width="${w || 1.5}" stroke-dasharray="6 5"/>`;
  const line = (x1, y1, x2, y2, color, w, extra) => `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${color || 'var(--ink)'}" stroke-width="${w || 1.5}" ${extra || ''}/>`;

  /* ---------------------------------------------------------------- plan-view boats (shared) */
  /* Boat seen from above, bow up before rotation. o: {beam, sail: +1|-1 boom side, power, cones, lights, ferry, kayak, oars} */
  function planBoat(x, y, hdg, len, fill, o) {
    o = o || {};
    const b = len * (o.beam || .38), hb = b / 2;
    let body;
    if (o.kayak) {
      // Slim pointed hull (two cubic sides), a dark cockpit and a paddle with blades, so it reads as a small boat at a glance.
      const cw = fmt(hb * 1.7), q = fmt(len / 4), pl = hb + 8, pa = fmt(Math.atan2(-14, 2 * pl) * 180 / Math.PI);
      const blade = (bx, by) => `<ellipse cx="${fmt(bx)}" cy="${fmt(by)}" rx="4.5" ry="2.2" fill="var(--ink)" transform="rotate(${pa} ${fmt(bx)} ${fmt(by)})"/>`;
      body = `<path d="M0,${fmt(-len / 2)} C${cw},${-q} ${cw},${q} 0,${fmt(len / 2)} C${-cw},${q} ${-cw},${-q} 0,${fmt(-len / 2)} Z" fill="${fill}" stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="0" cy="${fmt(len * .06)}" rx="${fmt(hb * .55)}" ry="${fmt(len * .14)}" fill="var(--ink-2)" opacity=".65"/><line x1="${fmt(-pl)}" y1="7" x2="${fmt(pl)}" y2="-7" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>` + blade(-pl - 1, 7.3) + blade(pl + 1, -7.3);
    }
    else body = `<polygon points="0,${-len / 2} ${hb},${-len / 6} ${hb},${len / 2 - 3} ${-hb},${len / 2 - 3} ${-hb},${-len / 6}" fill="${fill}" stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round"/>`;
    let extra = '';
    if (o.ferry) extra += `<rect x="${-hb * .7}" y="${-len * .12}" width="${hb * 1.4}" height="${len * .5}" rx="3" fill="#f4f4f4" stroke="var(--ink-2)"/>`;
    if (o.oars) extra += `<line x1="${-hb}" y1="0" x2="${-hb - 14}" y2="-7" stroke="var(--ink)" stroke-width="2"/><line x1="${hb}" y1="0" x2="${hb + 14}" y2="-7" stroke="var(--ink)" stroke-width="2"/>`;
    if (o.sail) {
      // Boom swung clearly out (≈55° off the centreline) to the labelled side so the tack can be read at a glance
      // (Rule 12(b): the mainsail is carried on the side opposite the wind).
      const s = o.sail, my = -len * .1, bl = len * .5, bx = s * bl * Math.sin(rad(55)), by = my + bl * Math.cos(rad(55));
      extra += `<polygon points="0,${fmt(my)} ${fmt(bx)},${fmt(by)} 0,${fmt(len * .3)}" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.3"/><line x1="0" y1="${fmt(my)}" x2="${fmt(bx)}" y2="${fmt(by)}" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="${fmt(my)}" r="2.2" fill="var(--ink)"/>`;
    }
    if (o.power) extra += `<path d="M${-hb * .5},${len / 2 - 1} l-2,9 M0,${len / 2 - 1} l0,10 M${hb * .5},${len / 2 - 1} l2,9" stroke="var(--muted)" stroke-width="1.5" fill="none"/>`;
    if (o.cone) extra += `<polygon points="-6,${-len * .3} 6,${-len * .3} 0,${-len * .3 + 11}" fill="${C.black}" stroke="var(--paper)" stroke-width=".8"/>`;
    if (o.cones) extra += `<polygon points="-6,-16 6,-16 0,-5" fill="${C.black}" stroke="var(--paper)" stroke-width=".8"/><polygon points="-6,6 6,6 0,-5" fill="${C.black}" stroke="var(--paper)" stroke-width=".8"/>`;
    if (o.lights) extra += `<circle cx="${-hb}" cy="${-len / 5}" r="3.5" fill="${C.red}" stroke="var(--paper)" stroke-width="1"/><circle cx="${hb}" cy="${-len / 5}" r="3.5" fill="${C.green}" stroke="var(--paper)" stroke-width="1"/>`;
    return `<g transform="translate(${fmt(x)},${fmt(y)}) rotate(${hdg})">${body}${extra}</g>`;
  }
  /* Straight course arrow from a boat's bow: solid part with head, then a dashed continuation to (px,py). */
  function course(x, y, hdg, len, solid, px, py, color) {
    const sx = Math.sin(rad(hdg)), sy = -Math.cos(rad(hdg));
    const bx = x + sx * len / 2, by = y + sy * len / 2, ex = bx + sx * solid, ey = by + sy * solid;
    let s = line(bx, by, ex, ey, color, 2.5) + arrowHead(ex, ey, hdg, color, 9);
    if (px != null) s += dash(ex, ey, px, py, color, 1.5);
    return s;
  }
  function xmark(x, y, color) { const c = color || 'var(--bad)'; return line(x - 7, y - 7, x + 7, y + 7, c, 3) + line(x - 7, y + 7, x + 7, y - 7, c, 3); }
  function windArrow(x1, y1, x2, y2, lx, ly) {
    const a = angOf(x1, y1, x2, y2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${WIND}" stroke-width="3" stroke-dasharray="8 5" stroke-linecap="round"/>` + arrowHead(x2, y2, a, WIND, 12) +
      `<path d="M${x1 - 7},${y1} l7,-9 l7,9" fill="none" stroke="${WIND}" stroke-width="3" stroke-linecap="round" opacity=".6" transform="rotate(${fmt(a)} ${x1} ${y1})"/>` + txt(lx, ly, 'WIND', { fill: WIND, weight: 700, size: 13, halo: 'var(--shallow)' });
  }
  function compass(x, y, boatUp) {
    return `<circle cx="${x}" cy="${y}" r="17" fill="var(--paper)" stroke="var(--line)"/>` + (boatUp ? txt(x, y, 'bow up', { size: 9, fill: 'var(--muted)' }) : `<polygon points="${x},${y - 13} ${x - 5},${y + 4} ${x + 5},${y + 4}" fill="var(--ink)"/>` + txt(x, y + 10, 'N', { size: 10, weight: 700 }));
  }
  function legend(x, y) {
    return `<rect x="${x}" y="${y - 7}" width="14" height="14" fill="${GIVE}" stroke="var(--ink)"/>` + txt(x + 20, y, 'give-way', { size: 11, anchor: 'start', halo: 'var(--shallow)' }) +
      `<rect x="${x + 82}" y="${y - 7}" width="14" height="14" fill="${STAND}" stroke="var(--ink)"/>` + txt(x + 102, y, 'stand-on', { size: 11, anchor: 'start', halo: 'var(--shallow)' });
  }

  /* ---------------------------------------------------------------- lightArcs */
  const ARC_KEYS = ['masthead', 'port', 'starboard', 'stern'];
  function lightArcs(opts) {
    opts = opts || {};
    const only = opts.only || ARC_KEYS;
    only.forEach(k => { if (!ARC_KEYS.includes(k)) fail('lightArcs opts.only', k, ARC_KEYS); });
    const on = k => only.includes(k);
    const W = 480, H = 470, cx = 240, cy = 215, R = 170, r = 128;
    let g = `<defs><pattern id="bl-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--ink-2)" stroke-width="2" opacity=".5"/></pattern></defs>`;
    g += `<rect width="${W}" height="${H}" rx="8" fill="var(--shallow)"/>`;
    // Masthead: 225° from 247.5° through dead ahead to 112.5° (Rule 21(a)); drawn largest, light shading.
    if (on('masthead')) g += S.sector(cx, cy, R, 247.5, 112.5, 'var(--ink)', .1) + `<path d="${arcPath(cx, cy, R, 247.5, 112.5)}" fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-dasharray="8 5"/>`;
    // Sidelights: green 0°→112.5° (starboard), red 247.5°→360° (port) (Rule 21(b)).
    if (on('starboard')) g += S.sector(cx, cy, r, 0, 112.5, C.green, .5);
    if (on('port')) g += S.sector(cx, cy, r, 247.5, 360, C.red, .5);
    // Sternlight: 135° from 112.5° to 247.5°, hatched (Rule 21(c)); abuts the sidelights exactly.
    if (on('stern')) g += S.sector(cx, cy, r, 112.5, 247.5, 'var(--ink)', .07) + S.sector(cx, cy, r, 112.5, 247.5, 'url(#bl-hatch)', 1) + `<path d="${arcPath(cx, cy, r, 112.5, 247.5)}" fill="none" stroke="var(--ink-2)" stroke-width="1.5"/>`;
    // beam line and the two 22.5°-abaft-the-beam boundaries
    g += dash(cx - R - 12, cy, cx + R + 12, cy, 'var(--ink-2)', 1.5) + txt(cx + R + 32, cy, 'beam', { size: 11, fill: 'var(--ink-2)' }) + txt(cx - R - 32, cy, 'beam', { size: 11, fill: 'var(--ink-2)' });
    [112.5, 247.5].forEach(a => { g += line(cx, cy, cx + (R + 12) * Math.sin(rad(a)), cy - (R + 12) * Math.cos(rad(a)), 'var(--ink)', 1.5); });
    g += txt(cx + 150, cy + 100, '22.5° abaft the beam', { size: 11, weight: 600, halo: 'var(--shallow)' }) + txt(cx - 150, cy + 100, '22.5° abaft the beam', { size: 11, weight: 600, halo: 'var(--shallow)' });
    // boat at the centre, bow up, with its four lanterns marked
    g += planBoat(cx, cy, 0, 64, 'var(--paper)', { power: true, lights: true }) + `<circle cx="${cx}" cy="${cy - 6}" r="3.5" fill="${C.white}" stroke="var(--ink)"/><circle cx="${cx}" cy="${cy + 27}" r="3.5" fill="${C.white}" stroke="var(--ink)"/>` + txt(cx, cy - 44, 'bow', { size: 11, fill: 'var(--ink-2)' });
    // labels
    if (on('masthead')) g += txt(cx, 22, 'MASTHEAD LIGHT — white, 225°', { size: 13, weight: 700 }) + txt(cx, 38, 'from 22.5° abaft the port beam, through ahead, to 22.5° abaft the starboard beam', { size: 11, fill: 'var(--ink-2)' });
    if (on('starboard')) g += lines(cx + 72, cy - 56, ['STARBOARD', 'sidelight', 'green, 112.5°'], { size: 12, weight: 700, lh: 14, halo: 'var(--shallow)' });
    if (on('port')) g += lines(cx - 72, cy - 56, ['PORT', 'sidelight', 'red, 112.5°'], { size: 12, weight: 700, lh: 14, halo: 'var(--shallow)' });
    if (on('stern')) g += lines(cx, cy + 62, ['STERNLIGHT — white, 135°', '(67.5° each side of dead astern)'], { size: 12, weight: 700, lh: 14, halo: 'var(--shallow)' });
    g += caption(cx, 420, '225° + 135° = 360°. The sternlight sector (more than 22.5° abaft the beam) is also the OVERTAKING sector of Rule 13: from there you see only her white sternlight.', 70, { size: 12, lh: 15 });
    return S.svg(W, H, g, { label: 'Plan view of a boat with the arcs of its navigation lights: masthead white 225 degrees, starboard green and port red 112.5 degrees each, sternlight white 135 degrees' });
  }

  /* ---------------------------------------------------------------- vesselLights (what you see at night) */
  // Light definition: arc = mh masthead | sp port sidelight | ss starboard sidelight | st sternlight | tw towing light | ar all-round.
  // lon: +1 bow … −1 stern; h: height units above deck; lat: −1 port … +1 starboard; mw: only when making way.
  // tag: optional label shown instead of the bare colour word (a string or an array of lines).
  const L = (arc, color, lon, h, lat, mw, tag) => ({ arc, color, lon, h, lat: lat || 0, mw: !!mw, tag });
  const MINE = ['green', '(mine clearance)'];
  const sidesL = (lon, h, mw) => [L('sp', 'red', lon, h, -1, mw), L('ss', 'green', lon, h, 1, mw)];
  const sternL = (h, mw) => L('st', 'white', -1, h, 0, mw);
  const VIEWS = ['ahead', 'port', 'starboard', 'astern'];
  const ARC_VIS = { mh: ['ahead', 'port', 'starboard'], sp: ['ahead', 'port'], ss: ['ahead', 'starboard'], st: ['astern'], tw: ['astern'], ar: VIEWS };
  const VESSELS = {
    'power<50': { name: 'Power-driven vessel under 50 m', rule: 'Rule 23(a): masthead light, sidelights, sternlight', lights: [L('mh', 'white', .3, 3), ...sidesL(.5, 1), sternL(.8)] },
    'power>=50': { name: 'Power-driven vessel 50 m or more', rule: 'Rule 23(a): two masthead lights, the after one higher', lights: [L('mh', 'white', .55, 3), L('mh', 'white', -.35, 4.2), ...sidesL(.2, 1.4), sternL(.8)] },
    'power<12': { name: 'Power-driven vessel under 12 m', rule: 'Rule 23(c)/(d)(i): one all-round white light + sidelights', lights: [L('ar', 'white', 0, 2.6), ...sidesL(.5, 1)] },
    'power<7': { name: 'Power-driven vessel under 7 m, max 7 knots', rule: 'Rule 23(c)/(d)(ii): all-round white light only (sidelights if practicable)', lights: [L('ar', 'white', -.1, 2)] },
    'sail': { name: 'Sailing vessel under sail', rule: 'Rule 25(a): sidelights + sternlight, NO white light above them', lights: [...sidesL(.6, .8), sternL(.7)] },
    'sail-tricolour': { name: 'Sailing vessel under 20 m with tricolour lantern', rule: 'Rule 25(b): one masthead lantern combines red, green and white', lights: [L('sp', 'red', .1, 5, -.32), L('ss', 'green', .1, 5, .32), L('st', 'white', .1, 5)] },
    'sail-redgreen': { name: 'Sailing vessel with red over green masthead lights', rule: 'Rule 25(c): sidelights + sternlight + all-round RED over GREEN (never with a tricolour)', lights: [L('ar', 'red', .1, 5), L('ar', 'green', .1, 4), ...sidesL(.6, .8), sternL(.7)] },
    'anchored': { name: 'Vessel at anchor, under 50 m', rule: 'Rule 30(b): one all-round white light where best seen', lights: [L('ar', 'white', .6, 2.8)] },
    'anchored>=50': { name: 'Vessel at anchor, 50 m or more', rule: 'Rule 30(a): all-round white forward and a second, LOWER one aft', lights: [L('ar', 'white', .7, 4.4), L('ar', 'white', -.6, 2.4)] },
    'aground': { name: 'Vessel aground', rule: 'Rule 30(d): anchor light(s) + two all-round RED lights in a vertical line', lights: [L('ar', 'white', .7, 4.4), L('ar', 'white', -.6, 2.4), L('ar', 'red', .05, 4.2), L('ar', 'red', .05, 3.2)] },
    'fishing': { name: 'Vessel engaged in fishing (not trawling)', rule: 'Rule 26(c): all-round RED over WHITE; sidelights + sternlight only when making way', lights: [L('ar', 'red', .1, 4), L('ar', 'white', .1, 3), ...sidesL(.4, 1, true), sternL(.8, true)] },
    'trawling': { name: 'Vessel engaged in trawling', rule: 'Rule 26(b): all-round GREEN over WHITE; masthead light abaft and higher if 50 m or more; sidelights + sternlight when making way', lights: o => [L('ar', 'green', .1, 4), L('ar', 'white', .1, 3), ...(o.large ? [L('mh', 'white', -.45, 5)] : []), ...sidesL(.4, 1, true), sternL(.8, true)] },
    'nuc': { name: 'Vessel not under command', rule: 'Rule 27(a): two all-round RED lights; sidelights + sternlight when making way, no masthead light', lights: [L('ar', 'red', 0, 4), L('ar', 'red', 0, 3), ...sidesL(.4, 1, true), sternL(.8, true)] },
    // Annex I §2(f): the red-white-red stack is carried BELOW the masthead light, so the masthead light sits highest, forward.
    'ram': { name: 'Vessel restricted in her ability to manoeuvre', rule: 'Rule 27(b): all-round RED–WHITE–RED (below the masthead light); + masthead light, sidelights, sternlight when making way', lights: [L('mh', 'white', .55, 5.2, 0, true), L('ar', 'red', -.1, 4), L('ar', 'white', -.1, 3), L('ar', 'red', -.1, 2), ...sidesL(.3, 1, true), sternL(.8, true)] },
    // Annex I §2(f): the Rule 28 reds are carried below the masthead lights — here vertically between the forward and the (higher) after masthead light, as on the RAM card.
    'cbd': { name: 'Vessel constrained by her draught', rule: 'Rule 28: three all-round RED lights in a vertical line (below the masthead lights) + normal power-driven lights', lights: [L('mh', 'white', .6, 2.6), L('mh', 'white', -.45, 5.6), L('ar', 'red', .1, 4.8), L('ar', 'red', .1, 3.9), L('ar', 'red', .1, 3), ...sidesL(.3, 1.4), sternL(.8)] },
    'pilot': { name: 'Pilot vessel on duty', rule: 'Rule 29: all-round WHITE over RED at the masthead; + sidelights and sternlight when underway', lights: [L('ar', 'white', .1, 4), L('ar', 'red', .1, 3), ...sidesL(.4, 1, true), sternL(.8, true)] },
    'towing': { name: 'Power-driven vessel towing astern', rule: 'Rule 24(a): two masthead lights in a vertical line (three if tow > 200 m), sidelights, sternlight, YELLOW towing light above the sternlight', lights: o => [...Array.from({ length: o.long ? 3 : 2 }, (_, i) => L('mh', 'white', .4, 2.8 + i)), ...sidesL(.5, 1), sternL(.8), L('tw', 'yellow', -1, 1.6)] },
    'towed': { name: 'Vessel being towed', rule: 'Rule 24(e): sidelights + sternlight', lights: [...sidesL(.6, .9), sternL(.8)] },
    // The three greens are labelled as the mine-clearance signal and the sidelights sit lower and wider, and are named, so the green sidelight is not counted as a fourth green.
    'minesweeping': { name: 'Vessel engaged in mine clearance', rule: 'Rule 27(f): three all-round GREEN lights (foremast head + each fore yardarm) + power-driven lights; keep 1,000 m away', lights: [L('ar', 'green', 0, 5, 0, false, MINE), L('ar', 'green', 0, 4, -1.2, false, MINE), L('ar', 'green', 0, 4, 1.2, false, MINE), L('mh', 'white', .6, 2.8), L('sp', 'red', .3, 1.2, -1.4, false, 'red sidelight'), L('ss', 'green', .3, 1.2, 1.4, false, 'green sidelight'), sternL(.8)] },
  };
  const VIEW_HINT = {
    ahead: 'her bow points at YOU — her red (port) light is on YOUR right',
    port: 'you look at her PORT side — her bow points LEFT',
    starboard: 'you look at her STARBOARD side — her bow points RIGHT',
    astern: 'you are astern of her (overtaking sector) — no sidelights visible',
  };
  function vesselLights(type, view, opts) {
    opts = opts || {};
    const def = VESSELS[type]; if (!def) fail('vesselLights type', type, Object.keys(VESSELS));
    if (!VIEWS.includes(view)) fail('vesselLights view', view, VIEWS);
    const making = opts.making !== false;
    const all = typeof def.lights === 'function' ? def.lights(opts) : def.lights;
    const lights = all.filter(l => (making || !l.mw) && ARC_VIS[l.arc].includes(view));
    const W = 360, H = 292, cx = 180, base = 204;
    const side = view === 'port' || view === 'starboard', dir = view === 'starboard' ? 1 : -1;
    const px = l => side ? cx + dir * l.lon * 105 : cx + (view === 'ahead' ? -l.lat : l.lat) * 46;
    const py = l => base - 16 - l.h * 24;
    let g = `<rect x="0" y="${base}" width="${W}" height="${H - base}" fill="${NIGHT_SEA}"/><rect x="0" y="${H - 70}" width="${W}" height="70" fill="${C.night}"/>`;
    // faint silhouette: a yacht (hull + mast + sail outline) for the sailing types, a motorboat with a deckhouse otherwise,
    // so a sailing panel is not read as "a motorboat with a light missing".
    const yacht = type.startsWith('sail'), SAIL = '#16293a';
    if (side) {
      const x0 = cx - dir * 105, x1 = cx + dir * 105;   // x1 = bow
      if (yacht) {
        const mx = fmt(cx + dir * .1 * 105), top = base - 16 - 5.6 * 24;   // mast at the tricolour's position, as tall as the highest light
        g += `<polygon points="${x0},${base} ${fmt(x0 + dir * 4)},${base - 12} ${fmt(x1 - dir * 26)},${base - 12} ${x1},${base - 7} ${fmt(x1 - dir * 5)},${base}" fill="${NIGHT_HULL}"/><rect x="${fmt(Math.min(cx - dir * 30, cx + dir * 30))}" y="${base - 20}" width="60" height="8" rx="2" fill="${NIGHT_HULL}"/>`;
        g += `<polygon points="${mx},${fmt(top + 6)} ${fmt(mx - dir * 72)},${base - 24} ${mx},${base - 24}" fill="${SAIL}" stroke="${NIGHT_MAST}" stroke-width="1"/><polygon points="${mx},${fmt(top + 22)} ${fmt(mx + dir * 78)},${base - 22} ${mx},${base - 22}" fill="${SAIL}" stroke="${NIGHT_MAST}" stroke-width="1"/>` + line(mx, base - 20, mx, top, NIGHT_MAST, 2.5);
      } else g += `<polygon points="${x0},${base} ${x0},${base - 16} ${fmt(x1 - dir * 22)},${base - 16} ${x1},${base - 9} ${fmt(x1 - dir * 6)},${base}" fill="${NIGHT_HULL}"/><rect x="${fmt(Math.min(cx - dir * 42, cx + dir * 22))}" y="${base - 34}" width="64" height="18" rx="2" fill="${NIGHT_HULL}"/>`;
    } else if (yacht) {
      const top = base - 16 - 5.6 * 24;
      g += `<polygon points="${cx - 34},${base} ${cx + 34},${base} ${cx + 26},${base - 18} ${cx - 26},${base - 18}" fill="${NIGHT_HULL}"/><polygon points="${cx},${fmt(top + 6)} ${cx + 14},${base - 22} ${cx - 4},${base - 22}" fill="${SAIL}" stroke="${NIGHT_MAST}" stroke-width="1"/>` + line(cx, base - 18, cx, top, NIGHT_MAST, 2.5);
    } else g += `<polygon points="${cx - 40},${base} ${cx + 40},${base} ${cx + 30},${base - 22} ${cx - 30},${base - 22}" fill="${NIGHT_HULL}"/><rect x="${cx - 18}" y="${base - 42}" width="36" height="20" rx="2" fill="${NIGHT_HULL}"/>`;
    // masts under stacked / high lights, then lamps (dedupe lights that coincide on screen)
    const masts = new Set(), seen = new Set();
    // one mast per longitudinal position (so a tricolour pair or yardarm lights share a mast)
    lights.filter(l => l.h >= 1.6).forEach(l => { const x = fmt(px(Object.assign({}, l, { lat: 0 }))); if (!masts.has(x)) { masts.add(x); const top = Math.min(...lights.filter(k => fmt(px(Object.assign({}, k, { lat: 0 }))) === x).map(py)); g += line(x, base - 20, x, top + 4, NIGHT_MAST, 2); } });
    if (!side) lights.filter(l => l.lat && l.arc === 'ar').forEach(l => { g += line(cx, py(l), px(l), py(l), NIGHT_MAST, 2); });
    lights.forEach(l => {
      const x = px(l), y = py(l), key = fmt(x) + ',' + fmt(y);
      if (seen.has(key)) return; seen.add(key);
      g += lamp(x, y, l.color, { r: 6.5, label: l.tag || l.color, side: x < cx ? 'left' : 'right' });
    });
    const title = def.name + (making ? '' : ', stopped');
    g += txt(cx, 20, title, { size: title.length > 36 ? 12 : 13, weight: 700, fill: NIGHT_INK });
    // the "red on your right" hint only makes sense when sidelights are actually visible
    const sides = lights.some(l => l.arc === 'sp' || l.arc === 'ss');
    // Why no sidelights: a stopped fishing/NUC/RAM/pilot vessel is "not making way"; a boat under 7 m / 7 kn may
    // carry none (Rule 23(c)/(d)(ii)) — a power-driven vessel's sidelights never depend on making way.
    let why = 'not making way';
    if (making) why = type === 'power<7' ? 'under 7 m and max 7 kn she may show only an all-round white light' : 'she is not underway';
    const hint = view === 'ahead' && !sides ? `her bow points at YOU — no sidelights: ${why}` : VIEW_HINT[view];
    g += caption(cx, H - 58, 'Seen from ' + view.toUpperCase() + ': ' + hint, 62, { size: 11, fill: NIGHT_INK, lh: 13 });
    g += caption(cx, H - 27, def.rule, 70, { size: 10, fill: NIGHT_MUTED, lh: 12 });
    return S.svg(W, H, g, { bg: C.night, label: `Night view of a ${def.name} seen from ${view}: ${lights.map(l => l.color).join(', ') || 'no lights'}` });
  }

  /* ---------------------------------------------------------------- shipProfile */
  /* Side view, bow to the RIGHT, so the viewer sees the STARBOARD side (green sidelight). The scene has its own fixed
     sky (night = COLORS.night, day = pale daytime sky so black shapes show) and therefore fixed ink colours. */
  function shipProfile(type, opts) {
    opts = opts || {};
    const TYPES = ['motorboat', 'sailboat', 'ship', 'fishing', 'tug'];
    if (!TYPES.includes(type)) fail('shipProfile type', type, TYPES);
    const day = !!opts.day, ink = day ? DAY_INK : NIGHT_INK, mut = day ? DAY_MUTED : NIGHT_MUTED, hull = day ? HULL_GREY : NIGHT_HULL_P, bg = day ? DAY_SKY : C.night;
    const wide = type === 'tug' || (type === 'ship' && day);   // the ship's day picture carries an "at anchor by day" inset at lower right
    const W = wide ? 640 : 560, H = type === 'tug' ? 320 : wide ? 348 : 300, wl = 200;
    const lp = (x, y, color) => lamp(x, y, color, { r: 6, glow: !day, stroke: day ? DAY_INK : null });
    const note = (x, y, s, o) => txt(x, y, s, Object.assign({ size: 11, fill: ink, weight: 600, halo: bg }, o || {}));
    const notes = (x, y, arr, o) => lines(x, y, arr, Object.assign({ size: 11, fill: ink, weight: 600, halo: bg, lh: 13 }, o || {}));
    const leader = (x1, y1, x2, y2) => line(x1, y1, x2, y2, mut, 1);
    const dim = (x, y1, y2, label, left) => line(x, y1, x, y2, ink, 1.5) + arrowHead(x, y1, 0, ink, 7) + arrowHead(x, y2, 180, ink, 7) + note(x + (left ? -8 : 8), (y1 + y2) / 2, label, { anchor: left ? 'end' : 'start', weight: 700 });
    const shape = (kind, x, y) => dayShapeGlyph(kind, x, y, .55);
    const mast = (x, y1, y2) => line(x, y1, x, y2, day ? '#555' : NIGHT_MAST, 3);
    const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${hull}" stroke="${day ? '#fff' : '#000'}" stroke-width=".5"/>`;
    let g = `<rect width="${W}" height="${H}" rx="8" fill="${bg}"/><rect x="0" y="${wl}" width="${W}" height="${H - wl}" fill="${day ? DAY_SEA : NIGHT_SEA}"/>`;
    let cap = '', label = '';
    if (type === 'motorboat') {
      g += `<polygon points="90,${wl} 96,172 385,172 404,190 396,${wl}" fill="${hull}"/><polygon points="170,172 178,146 300,146 300,172" fill="${hull}"/><path d="M212,146 L236,108 L264,108 L288,146" fill="none" stroke="${hull}" stroke-width="5"/>`;
      g += lp(250, 104, 'white') + note(250, 82, 'Masthead light (white), 225° — at least 1 m above the sidelights');
      g += lp(388, 165, 'green') + note(548, 138, 'Starboard sidelight (green), 112.5°', { anchor: 'end' }) + leader(388, 160, 420, 146);
      g += lp(93, 168, 'white') + note(26, 138, 'Sternlight (white), 135°', { anchor: 'start' }) + leader(93, 163, 72, 146);
      g += dash(250, 104, 330, 104, mut, 1) + dash(388, 165, 330, 165, mut, 1) + dim(330, 104, 165, '≥ 1 m');
      cap = 'Under 12 m the masthead light + sternlight may be replaced by ONE all-round white light (Rule 23(c)/(d)). Sidelights are still required unless the boat is under 7 m AND cannot exceed 7 knots. The red sidelight is on the port side (hidden here).';
      if (day) cap = 'A motorboat underway shows no day shape. Under 12 m the masthead light + sternlight may be replaced by ONE all-round white light (Rule 23(c)/(d)); sidelights are still required unless under 7 m AND max 7 knots.';
      label = 'Side view of an 8 m motorboat with masthead light, green starboard sidelight and sternlight';
    } else if (type === 'sailboat') {
      g += `<polygon points="110,${wl} 116,175 372,175 392,190 384,${wl}" fill="${hull}"/>` + mast(250, 175, 48) + `<polygon points="253,58 253,168 150,168" fill="${day ? '#fff' : '#d8dde3'}" stroke="${mut}" stroke-width="1"/><polygon points="247,62 247,160 365,170" fill="${day ? '#fff' : '#c9d0d8'}" stroke="${mut}" stroke-width="1"/>`;
      if (day) g += `<circle cx="250" cy="40" r="7" fill="none" stroke="${mut}" stroke-width="1.5" stroke-dasharray="3 2"/>` + note(264, 40, 'motoring at night: white masthead light here', { anchor: 'start' });
      else g += `<circle cx="250" cy="40" r="7" fill="none" stroke="${mut}" stroke-width="1.5" stroke-dasharray="3 2"/>` + line(245, 35, 255, 45, C.red, 2) + line(245, 45, 255, 35, C.red, 2) + note(264, 40, 'NO white masthead light under sail (Rule 25)', { anchor: 'start' });
      g += lp(376, 170, 'green') + note(548, 140, 'Starboard sidelight (green)', { anchor: 'end' }) + leader(376, 165, 404, 147);
      g += lp(113, 171, 'white') + note(26, 140, 'Sternlight (white)', { anchor: 'start' }) + leader(113, 166, 92, 147);
      if (day) g += shape('cone-down', 304, 92) + leader(318, 104, 362, 104) + notes(440, 92, ['Cone, apex DOWN (black):', 'sails up + engine running', '= power-driven (Rule 25(e))']);
      cap = day ? 'By day a sailing boat motoring with sails set hangs a black cone, apex downwards, forward. At night she then shows power-driven lights: white masthead light + sidelights + sternlight.' : 'Under sail: sidelights + sternlight only (Rule 25(a)). Under 20 m she may instead use a tricolour lantern at the masthead, or add RED over GREEN all-round lights at the masthead — never both.';
      label = 'Side view of a sailing yacht with sidelights and sternlight and no masthead light' + (day ? ', with the motoring cone apex down' : '');
    } else if (type === 'ship') {
      g += `<polygon points="40,${wl} 46,170 520,170 544,186 536,${wl}" fill="${hull}"/>` + box(90, 118, 100, 52) + `<rect x="110" y="98" width="24" height="20" fill="${hull}"/>` + mast(415, 170, 96) + mast(140, 118, 60);
      g += lp(415, 92, 'white') + note(360, 72, 'Forward masthead light (white)', { anchor: 'start' }) + note(340, 110, '≤ ¼ of the length from the bow', { size: 10, weight: 500 });
      g += lp(140, 56, 'white') + note(153, 40, 'After masthead light (white) — HIGHER', { anchor: 'start' });
      g += lp(195, 128, 'green') + note(208, 124, 'Starboard sidelight (green)', { anchor: 'start' }) + note(208, 137, 'lower than ¾ of the forward masthead height', { anchor: 'start', size: 10, weight: 500 });
      g += lp(43, 166, 'white') + note(26, 140, 'Sternlight (white)', { anchor: 'start' }) + leader(43, 161, 50, 148);
      g += dash(415, 92, 300, 92, mut, 1) + dash(140, 56, 300, 56, mut, 1) + dim(300, 56, 92, '≥ 4.5 m higher', true);
      g += line(140, 230, 415, 230, ink, 1) + arrowHead(140, 230, 270, ink, 7) + arrowHead(415, 230, 90, ink, 7) + note(277, 243, 'horizontal distance ≥ half the ship’s length', { size: 10, weight: 500 });
      // Underway she shows no day shape, so the anchor ball is NOT hung on the main profile: it lives in a separate
      // "at anchor by day" inset (own mini ship, ball forward, no lights), clear of the horizontal-distance label.
      if (day) {
        const bx = 436, by = 206, bw = 192, bh = 102, wi = by + 58, mx = bx + 150;
        g += `<clipPath id="sp-anchor-inset"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6"/></clipPath><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${DAY_SKY}"/><g clip-path="url(#sp-anchor-inset)"><rect x="${bx}" y="${wi}" width="${bw}" height="${bh}" fill="${DAY_SEA}"/></g>`;
        g += `<polygon points="${bx + 16},${wi} ${bx + 20},${wi - 10} ${bx + 160},${wi - 10} ${bx + 174},${wi - 5} ${bx + 170},${wi}" fill="${hull}"/>` + box(bx + 34, wi - 22, 34, 12) + line(mx, wi - 10, mx, wi - 26, '#555', 2) + dayShapeGlyph('ball', mx, wi - 37, .25);
        g += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="none" stroke="${DAY_MUTED}" stroke-width="1"/>`;
        g += note(bx + bw / 2, by + 12, 'AT ANCHOR by day — not underway', { size: 10, weight: 700 });
        g += notes(bx + bw / 2, wi + 13, ['one black ball forward (Rule 30),', 'and NO masthead, side or', 'stern lights are shown'], { size: 10, weight: 500, lh: 12, halo: DAY_SEA });
      }
      cap = 'Power-driven vessel of 50 m or more: two masthead lights, the after one at least 4.5 m higher than the forward one. Under 50 m the after masthead light is optional (Rule 23(a)).';
      label = 'Side view of a ship over 50 m with forward and higher after masthead lights, green sidelight and sternlight';
    } else if (type === 'fishing') {
      const trawl = !!opts.trawling;
      g += `<polygon points="80,${wl} 86,170 420,170 442,188 434,${wl}" fill="${hull}"/>` + box(280, 132, 80, 38) + mast(220, 170, 56);
      if (day) g += shape('two-cones', 220, 58) + note(250, 84, 'Two cones, apexes together (Rule 26)', { anchor: 'start' });
      else g += lp(220, 70, trawl ? 'green' : 'red') + note(233, 70, (trawl ? 'GREEN' : 'RED') + ' over', { anchor: 'start' }) + lp(220, 100, 'white') + note(233, 100, 'WHITE — all-round, ' + (trawl ? 'trawling' : 'fishing (not trawling)'), { anchor: 'start' });
      g += lp(366, 150, 'green') + notes(379, 124, ['Starboard sidelight (green)', 'only when making way'], { anchor: 'start' }) + leader(366, 145, 376, 132);
      g += lp(83, 166, 'white') + notes(26, 124, ['Sternlight (white)', 'only when making way'], { anchor: 'start' }) + leader(83, 161, 70, 138);
      g += `<path d="M82,182 C60,195 40,215 22,232" fill="none" stroke="${mut}" stroke-width="1.5" stroke-dasharray="4 4"/>` + note(46, 222, 'gear', { fill: mut, size: 10, weight: 500 });
      cap = (trawl ? 'Green over white = trawling at night. ' : 'Red over white = fishing at night; green over white would mean trawling. ') + 'Sidelights and sternlight are added only when making way; at anchor she keeps the fishing lights (Rule 26). A trawler of 50 m or more adds a masthead light abaft of and higher than the green light.';
      label = 'Side view of a fishing vessel showing ' + (trawl ? 'green' : 'red') + ' over white all-round lights, green sidelight and sternlight';
    } else { // tug
      const long = !!opts.long;
      g += `<polygon points="300,${wl} 306,170 500,170 522,186 514,${wl}" fill="${hull}"/>` + box(420, 134, 60, 36) + mast(440, 134, long ? 50 : 74) + line(306, 170, 306, 140, day ? '#555' : NIGHT_MAST, 3);
      g += `<polygon points="40,${wl} 44,178 200,178 212,190 206,${wl}" fill="${hull}"/><path d="M304,172 Q250,200 206,186" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
      if (day) g += shape('diamond', 440, 92) + shape('diamond', 120, 118) + line(120, 162, 120, 178, '#555', 2) + note(440, 60, 'Diamond on the tug AND on the tow when the tow is over 200 m (Rule 24)', { size: 10 });
      else {
        [104, 80].concat(long ? [56] : []).forEach(y => { g += lp(440, y, 'white') + note(427, y, 'white', { anchor: 'end', fill: mut, size: 10 }); });
        g += notes(560, 68, ['Masthead lights (white)', 'two in a vertical line —', 'three if the tow > 200 m']);
        g += lp(306, 146, 'yellow') + lp(306, 168, 'white') + notes(306, 112, ['YELLOW towing light', 'ABOVE the white sternlight']);
        g += lp(482, 152, 'green') + note(495, 128, 'green sidelight', { anchor: 'start' }) + leader(482, 147, 495, 134);
        g += lp(196, 174, 'green') + note(150, 152, 'tow: green sidelight') + leader(196, 169, 175, 158) + lp(43, 174, 'white') + note(90, 128, 'tow: sternlight (white)') + leader(43, 169, 60, 136);
      }
      g += line(40, 236, 304, 236, ink, 1) + arrowHead(40, 236, 270, ink, 7) + arrowHead(304, 236, 90, ink, 7) + notes(172, 250, ['tow length (tug’s stern to end of tow):', '> 200 m → 3 masthead lights + diamond'], { size: 10, weight: 500, lh: 12, halo: day ? DAY_SEA : NIGHT_SEA });
      cap = 'Tug towing astern (Rule 24): two masthead lights in a vertical line (three if the tow exceeds 200 m), sidelights, sternlight and a YELLOW towing light directly above the sternlight. The towed vessel shows sidelights and a sternlight only.';
      label = 'Side view of a tug towing a barge at night with two masthead lights, yellow towing light above the white sternlight, and the barge showing sidelight and sternlight';
    }
    const capLines = wrap(cap, W > 600 ? 108 : 94);   // caption band grows upward so the last line never clips
    g += lines(W / 2, H - 14 - (capLines.length - 1) * 13, capLines, { size: 11, fill: ink, lh: 13 });
    return S.svg(W, H, g, { label: label + (day ? ' (day)' : '') });
  }

  /* ---------------------------------------------------------------- dayShape */
  const SHAPES = {
    ball: { parts: ['ball'], title: 'Ball', meaning: 'At anchor (Rule 30). Minimum diameter 0.6 m.' },
    'cone-down': { parts: ['cone-down'], title: 'Cone, apex downwards', meaning: 'Sailing vessel under sail AND using her engine — she is then a power-driven vessel (Rule 25(e)).' },
    // ILLUSTRATIONS.md says "not used by COLREG; omit", but the verified fact sheet (F47, IL-8) lists it: fact sheet wins.
    'cone-up': { parts: ['cone-up'], title: 'Cone, apex upwards', meaning: 'Shown by a fishing vessel in the direction of gear extending more than 150 m (Rule 26(c)(ii)).' },
    'two-cones': { parts: ['cone-down', 'cone-up'], gap: 0, title: 'Two cones, apexes together', meaning: 'Vessel engaged in fishing or trawling (Rule 26).' },
    diamond: { parts: ['diamond'], title: 'Diamond', meaning: 'Tow longer than 200 m — on the tug and on the tow (Rule 24). Also the middle shape of a RAM vessel.' },
    'two-balls': { parts: ['ball', 'ball'], title: 'Two balls in a vertical line', meaning: 'Vessel NOT UNDER COMMAND (Rule 27(a)). Night: red over red.' },
    'ball-diamond-ball': { parts: ['ball', 'diamond', 'ball'], title: 'Ball – diamond – ball', meaning: 'Vessel RESTRICTED IN HER ABILITY TO MANOEUVRE (Rule 27(b)). Night: red–white–red.' },
    'three-balls': { parts: ['ball', 'ball', 'ball'], title: 'Three balls in a vertical line', meaning: 'Vessel AGROUND (Rule 30(d)). Night: anchor light(s) + red over red.' },
    cylinder: { parts: ['cylinder'], title: 'Cylinder', meaning: 'Vessel CONSTRAINED BY HER DRAUGHT (Rule 28). Height = 2 × diameter. Night: three all-round red lights.' },
  };
  const GLYPH_H = { ball: 44, 'cone-down': 46, 'cone-up': 46, diamond: 80, cylinder: 80 };
  /* One black shape with its top edge at y, centred on x; k scales it. */
  function dayShapeGlyph(kind, x, y, k) {
    k = k || 1; const b = C.black;
    if (kind === 'ball') return `<circle cx="${x}" cy="${fmt(y + 22 * k)}" r="${22 * k}" fill="${b}"/>`;
    if (kind === 'cone-down') return `<polygon points="${fmt(x - 23 * k)},${y} ${fmt(x + 23 * k)},${y} ${x},${fmt(y + 46 * k)}" fill="${b}"/>`;
    if (kind === 'cone-up') return `<polygon points="${x},${y} ${fmt(x + 23 * k)},${fmt(y + 46 * k)} ${fmt(x - 23 * k)},${fmt(y + 46 * k)}" fill="${b}"/>`;
    if (kind === 'diamond') return `<polygon points="${x},${y} ${fmt(x + 24 * k)},${fmt(y + 40 * k)} ${x},${fmt(y + 80 * k)} ${fmt(x - 24 * k)},${fmt(y + 40 * k)}" fill="${b}"/>`;
    if (kind === 'cylinder') return `<rect x="${fmt(x - 20 * k)}" y="${y}" width="${40 * k}" height="${80 * k}" fill="${b}"/>`;
    if (kind === 'two-cones') return dayShapeGlyph('cone-down', x, y, k) + dayShapeGlyph('cone-up', x, y + 46 * k, k);
    throw new Error('dayShapeGlyph: unknown ' + kind);
  }
  function dayShape(kind) {
    const def = SHAPES[kind]; if (!def) fail('dayShape kind', kind, Object.keys(SHAPES));
    const W = 380, H = 320, cx = 100, deck = 238, gap0 = def.gap == null ? 16 : def.gap;
    const total0 = def.parts.reduce((a, p) => a + GLYPH_H[p], 0) + gap0 * (def.parts.length - 1);
    const k = total0 > 160 ? 160 / total0 : 1, gap = gap0 * k, total = total0 * k;   // tall stacks are scaled to fit
    let y = 140 - total / 2;
    let g = `<rect width="${W}" height="${H}" rx="8" fill="${DAY_SKY}"/><rect x="0" y="${deck}" width="${W}" height="${H - deck}" fill="${DAY_SEA}"/>` + line(cx, deck, cx, y - 14, '#555', 3) + `<polygon points="${cx - 60},${deck} ${cx - 50},${deck - 14} ${cx + 60},${deck - 14} ${cx + 70},${deck}" fill="${HULL_GREY}"/>`;
    def.parts.forEach((p, i) => {
      g += dayShapeGlyph(p, cx, y, k);
      const h = GLYPH_H[p] * k;
      if (i < def.parts.length - 1 && gap > 0) g += line(cx - 36, y + h, cx - 36, y + h + gap, DAY_MUTED, 1) + txt(cx - 42, y + h + gap / 2, '≥ 1.5 m', { size: 10, fill: DAY_MUTED, anchor: 'end' });
      y += h + gap;
    });
    const title = wrap(def.title, 20);
    g += lines(262, 56, title, { size: 14, weight: 700, fill: DAY_INK, lh: 17 });
    g += caption(262, 56 + title.length * 17 + 6, def.meaning, 28, { size: 11, fill: DAY_INK, lh: 14 });
    g += txt(W / 2, H - 18, 'Day shapes are always BLACK (Annex I).', { size: 11, fill: DAY_INK, italic: true });
    return S.svg(W, H, g, { label: `Day shape: ${def.title} — ${def.meaning}` });
  }

  /* ---------------------------------------------------------------- encounter */
  const ENCOUNTERS = ['crossing-starboard', 'crossing-port', 'head-on', 'overtaking', 'sail-opposite-tacks', 'sail-same-tack', 'power-vs-sail', 'sail-vs-fishing', 'narrow-channel', 'power-vs-rowing'];
  function encounter(name, opts) {
    opts = opts || {};
    if (!ENCOUNTERS.includes(name)) fail('encounter name', name, ENCOUNTERS);
    const W = 480, H = 460;
    let g = `<rect width="${W}" height="${H}" rx="8" fill="var(--shallow)"/>`;
    const tag = (x, y, s, fill, o) => txt(x, y, s, Object.assign({ size: 12, weight: 700, fill: fill || 'var(--ink)', halo: 'var(--shallow)' }, o || {}));
    const roleTag = (x, y, role, extra) => tag(x, y, role, role === 'GIVE-WAY' ? 'var(--bad)' : 'var(--sea)') + (extra ? lines(x, y + 15, wrap(extra, 34), { size: 11, halo: 'var(--shallow)' }) : '');
    let cap = '', label = '';
    const standardCrossing = (otherOpts, ownOpts, ownLabel, otherLabel, avoid) => {
      const av = Object.assign({ curve: [[170, 282], [170, 228], [300, 250], [405, 215]], text: [310, 290, ['turns to STARBOARD,', 'passes ASTERN of her']] }, avoid || {});
      // own vessel bottom-left heading north; other on the starboard bow heading west; courses meet at P.
      g += course(340, 150, 270, 56, 40, 170, 150, 'var(--ink-2)') + course(170, 310, 0, 56, 40, 170, 150, 'var(--ink-2)');
      g += planBoat(340, 150, 270, 56, STAND, Object.assign({ lights: true }, otherOpts)) + planBoat(170, 310, 0, 56, GIVE, Object.assign({ lights: true }, ownOpts));
      g += xmark(170, 165) + tag(110, 165, 'do not cross ahead', 'var(--bad)', { size: 11 });
      g += curve(av.curve[0], av.curve[1], av.curve[2], av.curve[3], 'var(--bad)') + lines(av.text[0], av.text[1], av.text[2], { size: 11, weight: 600, halo: 'var(--shallow)' });
      g += roleTag(170, 352, 'GIVE-WAY', ownLabel) + roleTag(340, 102, 'STAND-ON', otherLabel);
    };
    if (name === 'crossing-starboard') {
      standardCrossing({ power: true }, { power: true }, 'you: other vessel on your STARBOARD side', 'keeps course and speed');
      g += tag(340, 196, 'you see her RED light', C.red, { size: 11 });
      cap = 'Two power-driven vessels crossing: the vessel which has the other on her own STARBOARD side keeps out of the way (Rule 15) — early and substantially (Rule 16), by turning to starboard to pass astern, or slowing down. Never cross ahead.';
      label = 'Crossing situation: the other power-driven vessel is on our starboard bow, so we give way by turning to starboard and passing astern';
    } else if (name === 'crossing-port') {
      g += course(140, 150, 90, 56, 40, 310, 150, 'var(--ink-2)') + course(310, 310, 0, 56, 40, 310, 150, 'var(--ink-2)');
      g += planBoat(140, 150, 90, 56, GIVE, { power: true, lights: true }) + planBoat(310, 310, 0, 56, STAND, { power: true, lights: true });
      g += curve([168, 150], [240, 160], [240, 300], [300, 372], 'var(--bad)') + lines(150, 250, ['turns to STARBOARD,', 'passes ASTERN of you'], { size: 11, weight: 600, halo: 'var(--shallow)' });
      g += roleTag(140, 196, 'GIVE-WAY', 'she has you on her starboard side') + tag(405, 282, 'STAND-ON', 'var(--sea)') + lines(405, 297, ['you: keep course and', 'speed, watch her'], { size: 11, halo: 'var(--shallow)' });
      g += tag(108, 128, 'you see her GREEN light', C.green, { size: 11 });
      cap = 'The other power-driven vessel is on your PORT side: she gives way and you STAND ON — keep course and speed (Rule 17). If she clearly does nothing, you must act: slow down or turn to starboard, never to port towards her (Rule 17(c)); sound 5 short blasts if in doubt.';
      label = 'Crossing situation: the other power-driven vessel is on our port bow, so she gives way and we stand on';
    } else if (name === 'head-on') {
      g += course(240, 320, 0, 56, 30, null, null, 'var(--ink-2)') + course(240, 110, 180, 56, 30, null, null, 'var(--ink-2)');
      g += planBoat(240, 320, 0, 56, GIVE, { power: true, lights: true }) + planBoat(240, 110, 180, 56, GIVE, { power: true, lights: true });
      g += curve([240, 292], [240, 245], [280, 235], [305, 185], 'var(--bad)') + curve([240, 138], [240, 185], [200, 195], [175, 245], 'var(--bad)');
      g += lines(360, 228, ['alters to', 'STARBOARD'], { size: 11, weight: 600, halo: 'var(--shallow)' }) + lines(120, 200, ['alters to', 'STARBOARD'], { size: 11, weight: 600, halo: 'var(--shallow)' });
      g += lines(345, 300, ['pass port to port', '(red to red)'], { size: 11, weight: 700, fill: C.red, halo: 'var(--shallow)' });
      g += roleTag(240, 362, 'GIVE-WAY', 'both vessels') + roleTag(240, 70, 'GIVE-WAY', 'both vessels');
      cap = 'Two power-driven vessels meeting head-on (you see both her sidelights and her masthead lights in line): BOTH alter course to STARBOARD and pass port-to-port (Rule 14). If in doubt whether it is head-on, assume it is.';
      label = 'Head-on situation between two power-driven vessels: both alter course to starboard and pass port to port';
    } else if (name === 'overtaking') {
      const sail = !!opts.sail;
      g += S.sector(240, 150, 175, 112.5, 247.5, 'var(--ink)', .12) + `<path d="${arcPath(240, 150, 175, 112.5, 247.5)}" fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-dasharray="6 4"/>`;
      [112.5, 247.5].forEach(a => { g += dash(240, 150, 240 + 175 * Math.sin(rad(a)), 150 - 175 * Math.cos(rad(a)), 'var(--ink-2)', 1.2); });
      g += dash(60, 150, 420, 150, 'var(--muted)', 1) + tag(440, 150, 'beam', 'var(--ink-2)', { size: 11, weight: 500 });
      g += course(240, 150, 0, 56, 40, null, null, 'var(--ink-2)') + planBoat(240, 150, 0, 56, STAND, { power: true, lights: true });
      g += curve([300, 272], [300, 230], [322, 200], [322, 90], 'var(--bad)') + curve([300, 272], [300, 250], [160, 230], [160, 90], 'var(--bad)', { dashed: true });
      g += planBoat(300, 300, 0, 56, GIVE, sail ? { sail: -1, lights: true } : { power: true, lights: true });
      if (sail) g += windArrow(450, 70, 395, 70, 422, 52);
      g += roleTag(240, 102, 'STAND-ON', 'keeps course and speed') + roleTag(300, 345, 'GIVE-WAY', 'keeps clear until finally past and clear — on either side');
      g += lines(240, 222, ['overtaking sector 135°', 'more than 22.5° abaft her beam:', 'you see only her sternlight'], { size: 11, weight: 600, halo: 'var(--shallow)', lh: 13 });
      cap = sail ? 'A sailing boat coming up from more than 22.5° abaft a motorboat’s beam is OVERTAKING and keeps clear (Rule 13) — Rule 13 overrides the sail-over-power rule of Rule 18. She stays give-way until finally past and clear.' : 'Coming up from more than 22.5° abaft her beam (where at night you see only her sternlight) is OVERTAKING: the overtaking vessel keeps out of the way, on either side, until finally past and clear (Rule 13). If in doubt, assume you are overtaking.';
      label = 'Overtaking: the ' + (sail ? 'sailing boat' : 'motorboat') + ' coming up inside the 135 degree stern sector of a motorboat keeps clear and may pass on either side';
    } else if (name === 'sail-opposite-tacks') {
      g += windArrow(240, 22, 240, 78, 240, 94);
      g += course(130, 270, 45, 56, 40, 240, 160, 'var(--ink-2)') + course(350, 270, 315, 56, 40, 240, 160, 'var(--ink-2)');
      g += curve([150, 250], [180, 205], [235, 225], [290, 305], 'var(--bad)') + lines(240, 326, ['bears away (turns to STARBOARD),', 'passes astern of her'], { size: 11, weight: 600, halo: 'var(--shallow)' });
      g += planBoat(130, 270, 45, 56, GIVE, { sail: 1, lights: true }) + planBoat(350, 270, 315, 56, STAND, { sail: -1, lights: true });
      g += roleTag(100, 356, 'GIVE-WAY', 'PORT TACK: boom out to starboard') + roleTag(385, 356, 'STAND-ON', 'STARBOARD TACK: boom out to port');
      cap = 'Two sailing vessels with the wind on different sides: the boat with the wind on her PORT side keeps out of the way (Rule 12(a)(i)). Read the tack from the boom: boom out to starboard = wind from port = port tack.';
      label = 'Two sailing boats on opposite tacks with wind from the north: the port-tack boat gives way to the starboard-tack boat';
    } else if (name === 'sail-same-tack') {
      // Windward boat (orange) up-left of the leeward boat, ~12° abaft her port beam — i.e. NOT inside the 135° stern
      // sector, so Rule 13 (overtaking) does not apply. Both close-hauled on port tack; the windward boat on a slightly
      // more bore-away course (075° vs 045°) so the courses converge ahead of both. Wind from the top.
      g += windArrow(240, 22, 240, 78, 240, 94);
      g += course(275, 290, 45, 56, 40, 412, 153, 'var(--ink-2)') + course(166, 219, 75, 56, 40, 412, 153, 'var(--ink-2)');
      g += curve([193, 212], [225, 215], [230, 355], [340, 365], 'var(--bad)') + lines(400, 318, ['bears away to STARBOARD,', 'passes astern of her'], { size: 11, weight: 600, halo: 'var(--shallow)' });
      g += planBoat(275, 290, 45, 56, STAND, { sail: 1, lights: true }) + planBoat(166, 219, 75, 56, GIVE, { sail: 1, lights: true });
      g += roleTag(400, 240, 'STAND-ON', 'LEEWARD boat (further from the wind)') + roleTag(100, 150, 'GIVE-WAY', 'WINDWARD boat (nearer the wind)');
      g += tag(100, 110, 'both on PORT tack (booms to starboard)', 'var(--ink-2)', { size: 11, weight: 600, anchor: 'start' });
      cap = 'Two sailing vessels with the wind on the SAME side: the WINDWARD boat — the one nearer to where the wind comes from — keeps out of the way of the leeward boat (Rule 12(a)(ii)).';
      label = 'Two sailing boats on the same tack with wind from the north: the windward boat gives way to the leeward boat';
    } else if (name === 'power-vs-sail') {
      g += windArrow(60, 22, 60, 78, 60, 94);
      standardCrossing({ sail: -1 }, { power: true }, 'POWER-DRIVEN vessel', 'SAILING vessel: keeps course and speed');
      g += planBoat(430, 300, 0, 40, 'var(--paper)', { sail: -1, cone: true }) + lines(430, 340, ['sails up + engine on', '= POWER-DRIVEN:', 'motorboat rules apply'], { size: 10, halo: 'var(--shallow)', lh: 12 });
      cap = 'A power-driven vessel keeps out of the way of a sailing vessel whichever side she is on (Rule 18(a)(iv)) — except when overtaking (Rule 13), in a narrow channel the ship can only use (Rule 9(b)), and in Norwegian confined waters against large vessels and ferries (Rule 44).';
      label = 'Power-driven vessel gives way to a sailing vessel under sail; inset shows a sailing boat with engine running and cone apex down, which counts as power-driven';
    } else if (name === 'sail-vs-fishing') {
      g += windArrow(22, 240, 78, 240, 50, 222);
      // Her gear trails astern (east) and ENDS at a float, and the avoiding track curves round that end, so the sailing
      // boat visibly passes astern of her AND outside her gear.
      g += `<path d="M368,150 C388,142 406,160 426,152" fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="429" cy="152" r="3.5" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.5"/>` + tag(390, 172, 'nets / lines astern', 'var(--ink-2)', { size: 10, weight: 500 });
      standardCrossing({ power: true }, { sail: 1 }, 'SAILING vessel', 'ENGAGED IN FISHING: two cones apexes together', { curve: [[170, 282], [170, 226], [350, 268], [452, 190]], text: [300, 300, ['turns to STARBOARD, passes', 'ASTERN of her — outside her gear']] });
      // The day shape as it really hangs: two cones apexes together in a VERTICAL line, drawn as an icon beside the vessel.
      g += line(438, 136, 438, 146, 'var(--ink-2)', 2) + dayShapeGlyph('two-cones', 438, 99, .4) + line(400, 124, 426, 124, 'var(--ink-2)', 1);
      cap = 'A vessel ENGAGED IN FISHING (two cones apexes together by day; red over white — or green over white when trawling — at night) has priority over sailing AND power-driven vessels (Rule 18(a)(iii), (b)(iii)). Keep clear of her and of her gear.';
      label = 'A sailing boat gives way to a vessel engaged in fishing showing two cones apexes together';
    } else if (name === 'narrow-channel') {
      g += `<polygon points="0,0 115,0 175,220 115,380 0,380" fill="${SHORE}" opacity=".9"/><polygon points="480,0 365,0 305,220 365,380 480,380" fill="${SHORE}" opacity=".9"/>`;
      g += course(205, 110, 180, 90, 30, null, null, 'var(--ink-2)') + planBoat(205, 110, 180, 90, '#7D8597', { beam: .32, ferry: true, lights: true });
      g += lines(205, 185, ['SCHEDULED FERRY', 'keeps to ITS starboard side'], { size: 11, weight: 700, halo: 'var(--shallow)', lh: 13 });
      g += planBoat(280, 250, 0, 40, GIVE, { sail: 1, lights: true }) + curve([280, 230], [280, 215], [292, 208], [300, 190], 'var(--bad)') + planBoat(290, 340, 0, 40, GIVE, { power: true, lights: true }) + curve([290, 320], [290, 305], [302, 298], [310, 282], 'var(--bad)');
      g += lines(395, 240, ['KEEP CLEAR', '(Norwegian Rule 44)', 'slow down, keep right'], { size: 11, weight: 700, fill: 'var(--bad)', halo: 'var(--shallow)', lh: 13 });
      g += planBoat(332, 352, 0, 34, 'var(--paper)', { kayak: true, beam: .4 }) + lines(412, 306, ['kayak / rowing boat:', 'Rule 43 — caution, slow,', 'keep WELL out of the way'], { size: 10, weight: 600, halo: 'var(--shallow)', lh: 12 });
      g += `<rect x="12" y="48" width="222" height="26" rx="13" fill="var(--paper)" stroke="var(--line)"/><rect x="22" y="57" width="24" height="8" fill="var(--sea)"/>` + txt(52, 61, '1 long blast ≥ 10 s from ~0.5 NM (NO Rule 41)', { size: 9, anchor: 'start' });
      cap = 'Keep to the starboard side of a narrow channel (Rule 9(a)). Boats under 20 m and sailing vessels must not impede a vessel that can only navigate inside the channel (Rule 9(b)). In Norwegian narrow waters, busy fairways and harbours, pleasure craft keep out of the way of larger vessels, ferries and commercial traffic (Rule 44).';
      label = 'Narrow channel: a ferry keeps to its starboard side while a small motorboat, a sailing boat and a kayak keep clear on their own starboard side';
    } else { // power-vs-rowing
      g += course(340, 150, 270, 40, 30, 170, 150, 'var(--ink-2)') + course(170, 310, 0, 56, 25, 170, 150, 'var(--ink-2)');
      g += planBoat(340, 150, 270, 40, GIVE, { oars: true, beam: .45 }) + planBoat(170, 310, 0, 56, 'var(--paper)', { power: true, lights: true });
      g += curve([320, 150], [290, 150], [300, 115], [330, 100], 'var(--bad)') + lines(390, 95, ['turns away / stops,', 'keeps WELL clear'], { size: 11, weight: 600, halo: 'var(--shallow)' });
      g += tag(340, 190, 'keeps WELL clear', 'var(--bad)') + lines(340, 205, ['ROWING BOAT or KAYAK', '(Norwegian Rule 43)'], { size: 11, halo: 'var(--shallow)' }) + lines(170, 352, ['MOTORBOAT — no formal priority', '(Rule 18 is silent): slow down, keep a', 'look-out, pass well clear (Rules 2, 5, 6, 8)'], { size: 11, weight: 600, halo: 'var(--shallow)', lh: 13 });
      g += tag(100, 268, 'slows down', 'var(--ink-2)', { size: 11 }) + line(140, 268, 162, 268, 'var(--ink-2)', 1);
      cap = 'A rowing boat or kayak is a vessel, but Rule 18 gives it no rung. Norwegian Rule 43: a vessel under oars manoeuvres with caution, slows down and keeps WELL out of the way of other vessels (in narrow waters and harbours Rule 44 adds: keep clear of larger vessels and ferries). The motorboat must still avoid collision: look-out, safe speed, pass well clear, mind your wash.';
      label = 'Motorboat meeting a rowing boat: the rowing boat keeps well clear under Norwegian Rules 43 and 44, and the motorboat slows down and passes clear';
    }
    g += `<rect x="0" y="${H - 74}" width="${W}" height="74" fill="var(--paper)" opacity=".92"/>` + caption(W / 2, H - 58, cap, 86, { size: 11, lh: 13 });
    g += compass(30, 30, opts.boatUp) + legend(290, 22);
    return S.svg(W, H, g, { label });
  }

  /* ---------------------------------------------------------------- soundSignal */
  const MEANINGS = {
    '.': 'One short blast: "I am altering my course to STARBOARD" (Rule 34(a)).',
    '..': 'Two short blasts: "I am altering my course to PORT" (Rule 34(a)).',
    '...': 'Three short blasts: "I am operating astern propulsion" (Rule 34(a)).',
    '....': 'Four short blasts: pilot vessel identity signal (Rule 35(k)).',
    '.....': 'At least FIVE short, rapid blasts: doubt / danger — "I do not understand your intentions" (Rule 34(d)).',
    '-': 'One prolonged blast: power-driven vessel MAKING WAY in restricted visibility, every ≤ 2 min (Rule 35(a)); also when nearing a blind bend (Rule 34(e)).',
    '--': 'Two prolonged blasts about 2 s apart: power-driven vessel underway but STOPPED, every ≤ 2 min (Rule 35(b)).',
    '-..': 'One prolonged + two short: sailing, fishing, NUC, RAM, constrained-by-draught or towing vessel in restricted visibility, every ≤ 2 min (Rule 35(c)).',
    '-...': 'One prolonged + three short: manned vessel being towed, every ≤ 2 min (Rule 35(e)).',
    '--.': 'Two prolonged + one short: "I intend to overtake you on your STARBOARD side" (narrow channel, Rule 34(c)).',
    '--..': 'Two prolonged + two short: "I intend to overtake you on your PORT side" (narrow channel, Rule 34(c)).',
    '-.-.': 'Prolonged, short, prolonged, short: "Agreed — you may overtake" (Rule 34(c)(ii)).',
    '.-.': 'Short, prolonged, short: optional warning from a vessel at anchor (Rule 35(g)).',
  };
  function soundSignal(pattern, opts) {
    opts = opts || {};
    pattern = String(pattern == null ? '' : pattern).replace(/\s+$/, '');
    if (!/^[.\- ]+$/.test(pattern) || !/[.-]/.test(pattern)) throw new Error(`soundSignal: pattern "${pattern}" must contain only "." (short), "-" (prolonged) and spaces (extra gap)`);
    const compact = pattern.replace(/ /g, '');
    const doubt = compact === '.....';
    // Gaps inside one signal are 1 unit (fact sheet convention; ILLUSTRATIONS.md's "spaces as gaps" is read as: a single
    // space only separates blasts, each EXTRA consecutive space adds 1 s). Rule 35(b)'s two prolonged blasts are ≈2 s apart.
    const gap = doubt ? .5 : 1, blasts = [];
    let t = 0, spaces = 0;
    for (const ch of pattern) {
      if (ch === ' ') { if (++spaces > 1) t += 1; continue; }
      spaces = 0;
      if (blasts.length && compact === '--') t += 1;
      const d = ch === '.' ? 1 : 5;
      blasts.push({ s: t, d });
      t += d + gap;
    }
    const total = Math.ceil(t - gap + (doubt ? 2 : 0));
    const U = 22, top = 52, hgt = 34, W = Math.max(400, Math.min(640, 68 + total * U)), H = 176;
    const x0 = Math.round((W - total * U) / 2);   // the timeline is centred, so a one-blast signal does not sit lost at the left edge
    const col = doubt ? 'var(--warn)' : 'var(--sea)';
    let g = `<rect width="${W}" height="${H}" rx="8" fill="var(--paper-2)"/>`;
    blasts.forEach((b, i) => {
      g += `<rect x="${fmt(x0 + b.s * U)}" y="${top}" width="${fmt(b.d * U - 2)}" height="${hgt}" rx="3" fill="${col}"/>`;
      g += txt(x0 + (b.s + b.d / 2) * U - 1, top - 10, b.d === 1 ? '≈1 s' : '4–6 s', { size: 11, fill: 'var(--ink-2)' });
      const prev = blasts[i - 1], gapLen = prev ? b.s - prev.s - prev.d : 0;   // label a widened gap (e.g. "≈2 s" between the two prolonged blasts of Rule 35(b))
      if (gapLen >= 2) g += txt(x0 + (prev.s + prev.d + gapLen / 2) * U - 1, top + hgt / 2, `≈${gapLen} s`, { size: 10, fill: 'var(--muted)' });
    });
    if (doubt) g += txt(x0 + (t - gap) * U + 14, top + hgt / 2, '…', { size: 20, fill: col, weight: 700 });
    // seconds ruler
    const ry = top + hgt + 12;
    g += line(x0, ry, x0 + total * U, ry, 'var(--ink-2)', 1);
    for (let s = 0; s <= total; s++) { g += line(x0 + s * U, ry, x0 + s * U, ry + (s % 5 === 0 ? 7 : 4), 'var(--ink-2)', 1); if (total <= 12 || s % 2 === 0) g += txt(x0 + s * U, ry + 16, String(s), { size: 10, fill: 'var(--muted)' }); }
    g += txt(x0 + total * U + 14, ry + 16, 's', { size: 10, fill: 'var(--muted)' });
    const sym = compact.replace(/\./g, '·').replace(/-/g, '—').split('').join(' ');
    g += txt(W / 2, 22, sym + (doubt ? ' …' : ''), { size: 18, weight: 700 });
    const meaning = opts.meaning || MEANINGS[compact] || '';
    if (meaning) g += caption(W / 2, H - 44, meaning, Math.floor(W / 6.2), { size: 11, lh: 13 });
    return S.svg(W, H, g, { label: `Sound signal ${sym}: ${meaning || pattern}` });
  }

  /* ---------------------------------------------------------------- flagA (fact sheet IL-11, Norwegian Rule 42) */
  const FLAG_BLUE = '#1E6FD9', FLAG_EDGE = '#9aa5b1';
  function flagA() {
    const W = 560, H = 300, fx = 44, fy = 48, fw = 240, fh = 160;   // 3 : 2, hoist on the left
    let g = `<rect width="${W}" height="${H}" rx="8" fill="var(--paper-2)"/>`;
    g += txt(W / 2, 24, 'Signal flag A (Alpha) — “I have a diver down; keep well clear at slow speed”', { size: 13, weight: 700 });
    // staff, white hoist half (thin grey outline so it shows on a pale page), blue fly half with the swallow-tail notch
    // cut from the fly edge: outer points (3,0) and (3,2), apex at (2.25,1) in flag units of fw/3.
    const u = fw / 3;
    g += line(fx - 6, fy - 10, fx - 6, fy + fh + 30, 'var(--ink-2)', 3) + `<circle cx="${fx - 6}" cy="${fy - 13}" r="4" fill="var(--ink-2)"/>`;
    g += `<rect x="${fx}" y="${fy}" width="${fmt(u * 1.5)}" height="${fh}" fill="#ffffff" stroke="${FLAG_EDGE}" stroke-width="1"/>`;
    g += `<polygon points="${fmt(fx + u * 1.5)},${fy} ${fx + fw},${fy} ${fmt(fx + u * 2.25)},${fy + fh / 2} ${fx + fw},${fy + fh} ${fmt(fx + u * 1.5)},${fy + fh}" fill="${FLAG_BLUE}" stroke="${FLAG_EDGE}" stroke-width="1"/>`;
    g += txt(fx + u * .75, fy + fh / 2 - 6, 'WHITE', { size: 13, weight: 700, fill: DAY_MUTED }) + txt(fx + u * .75, fy + fh / 2 + 10, 'hoist half', { size: 10, fill: DAY_MUTED });
    g += txt(fx + u * 1.85, fy + fh / 2 - 6, 'BLUE', { size: 13, weight: 700, fill: '#ffffff' }) + txt(fx + u * 1.85, fy + fh / 2 + 10, 'fly half', { size: 10, fill: '#ffffff' });
    g += line(fx + u * 2.25 + 4, fy + fh / 2 + 6, fx + fw - 10, fy + fh + 18, 'var(--ink-2)', 1) + txt(fx + fw - 8, fy + fh + 26, 'swallow-tail notch at the fly', { size: 10, fill: 'var(--ink-2)', anchor: 'end' });
    g += txt(fx - 14, fy + fh + 26, 'hoist', { size: 10, fill: 'var(--ink-2)', anchor: 'start' });
    // the North American red flag with a white diagonal stripe, crossed out
    const rx = 380, ry = 80, rw = 140, rh = 93;
    g += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${C.red}"/><polygon points="${rx},${ry} ${rx + 18},${ry} ${rx + rw},${ry + rh - 18} ${rx + rw},${ry + rh} ${rx + rw - 18},${ry + rh} ${rx},${ry + 18}" fill="#ffffff"/>`;
    g += line(rx - 8, ry - 8, rx + rw + 8, ry + rh + 8, 'var(--bad)', 5) + line(rx - 8, ry + rh + 8, rx + rw + 8, ry - 8, 'var(--bad)', 5);
    g += txt(rx + rw / 2, 58, 'NOT the Norwegian signal', { size: 12, weight: 700, fill: 'var(--bad)' });
    g += lines(rx + rw / 2, 196, ['red with a white diagonal stripe:', 'the North American “diver down” flag'], { size: 10, fill: 'var(--ink-2)', lh: 13 });
    g += caption(W / 2, 258, 'Other vessels pass with caution and power-driven vessels stop the engine if possible (Norwegian Rule 42). The flag — or a rigid replica — is on the dive boat or a buoy, and divers may be far from it, so keep well clear at slow speed.', 94, { size: 11, lh: 14 });
    return S.svg(W, H, g, { label: 'Signal flag A: white hoist half, blue fly half with a swallow-tail notch — I have a diver down, keep well clear at slow speed; beside it, crossed out, the red flag with a white diagonal stripe which is not the Norwegian signal' });
  }

  /* ---------------------------------------------------------------- export + gallery */
  Object.assign(S, { lightArcs, vesselLights, shipProfile, dayShape, encounter, soundSignal, flagA });
  const G = (name, fn) => S.gallery.push({ name, svg: fn });
  G('lightArcs all', () => lightArcs());
  G('lightArcs masthead+stern', () => lightArcs({ only: ['masthead', 'stern'] }));
  const safe = t => t.replace('<', ' under ').replace('>=', ' over ');
  ['power<50', 'power>=50', 'power<12', 'sail', 'sail-tricolour'].forEach(t => VIEWS.forEach(v => G(`vesselLights ${safe(t)} ${v}`, () => vesselLights(t, v))));
  G('vesselLights power under 7 ahead', () => vesselLights('power<7', 'ahead'));
  G('vesselLights sail-redgreen port', () => vesselLights('sail-redgreen', 'port'));
  G('vesselLights sail-redgreen ahead', () => vesselLights('sail-redgreen', 'ahead'));
  G('vesselLights anchored port', () => vesselLights('anchored', 'port'));
  G('vesselLights anchored over 50 port', () => vesselLights('anchored>=50', 'port'));
  G('vesselLights aground port', () => vesselLights('aground', 'port'));
  G('vesselLights fishing port', () => vesselLights('fishing', 'port'));
  G('vesselLights fishing ahead stopped', () => vesselLights('fishing', 'ahead', { making: false }));
  G('vesselLights trawling port', () => vesselLights('trawling', 'port'));
  G('vesselLights trawling large starboard', () => vesselLights('trawling', 'starboard', { large: true }));
  G('vesselLights nuc port', () => vesselLights('nuc', 'port'));
  G('vesselLights nuc ahead stopped', () => vesselLights('nuc', 'ahead', { making: false }));
  G('vesselLights ram port', () => vesselLights('ram', 'port'));
  G('vesselLights cbd port', () => vesselLights('cbd', 'port'));
  G('vesselLights pilot port', () => vesselLights('pilot', 'port'));
  G('vesselLights towing port', () => vesselLights('towing', 'port'));
  G('vesselLights towing astern', () => vesselLights('towing', 'astern'));
  G('vesselLights towing long ahead', () => vesselLights('towing', 'ahead', { long: true }));
  G('vesselLights towed astern', () => vesselLights('towed', 'astern'));
  G('vesselLights minesweeping ahead', () => vesselLights('minesweeping', 'ahead'));
  ['motorboat', 'sailboat', 'ship', 'fishing', 'tug'].forEach(t => { G(`shipProfile ${t}`, () => shipProfile(t)); G(`shipProfile ${t} day`, () => shipProfile(t, { day: true })); });
  G('shipProfile fishing trawling', () => shipProfile('fishing', { trawling: true }));
  G('shipProfile tug long', () => shipProfile('tug', { long: true }));
  Object.keys(SHAPES).forEach(k => G(`dayShape ${k}`, () => dayShape(k)));
  ENCOUNTERS.forEach(n => G(`encounter ${n}`, () => encounter(n)));
  G('encounter overtaking sail', () => encounter('overtaking', { sail: true }));
  ['.', '..', '...', '.....', '-', '- -', '- . .', '- . . .', '- - .', '- - . .', '- . - .', '. - .'].forEach(p => G(`soundSignal ${p}`, () => soundSignal(p)));
  G('flag A', () => flagA());
})();
