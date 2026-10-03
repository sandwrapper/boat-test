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
