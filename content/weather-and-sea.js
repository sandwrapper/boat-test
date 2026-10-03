/* Skipper Prep — topic 9: Weather, wind, waves and tide.
   Facts: scratchpad/facts/weather-and-sea.md (verified 2026-10-03 against MET Norway, Kartverket,
   Kystverket, the Joint Rescue Coordination Centres, Lovdata, SNL, the Met Office Beaufort page and COLREG).
   Fact ids (F1...F93) and illustration ids (IL-1...IL-7) in comments refer to that sheet.
   Weather sits in curriculum part 1 (item n) and part 3 (item f); it is NOT a part-4 item. */
(function () {
  'use strict';
  const S = BOAT.svg, C = S.COLORS, T = S.text;
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)', PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', SHALLOW = 'var(--shallow)';
  const OK = 'var(--ok)', BAD = 'var(--bad)', WARN = 'var(--warn)', SEA = 'var(--sea)', ACC = 'var(--accent)';
  // fixed picture colours (real-world objects, same in both themes)
  const WATER = '#4fc3f7', WATER2 = '#1e88e5', LAND = '#a5d6a7', SOIL = '#8d6e63', SUN = '#fdd835', LOWRED = '#c62828', HIGHBLUE = '#1565c0', ISO = '#9e9e9e', DARKINK = '#1a2630';

  // ---------- small drawing helpers ----------
  function rect(x, y, w, h, fill, stroke, o) {
    o = o || {};
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 4 : o.rx}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${o.sw || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`;
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
  function arrow(pts, stroke, o) {
    o = o || {}; stroke = stroke || INK;
    const n = pts.length, [x1, y1] = pts[n - 2], [x2, y2] = pts[n - 1];
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const L = o.head || 9;
    const ex = x2 - (L - 2) * Math.cos(ang), ey = y2 - (L - 2) * Math.sin(ang);
    const body = pts.slice(0, n - 1).concat([[ex, ey]]).map(p => p.map(v => (+v).toFixed(1)).join(',')).join(' ');
    return `<polyline points="${body}" fill="none" stroke="${stroke}" stroke-width="${o.sw || 1.8}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>` + head(x2, y2, ang, stroke, L);
  }
  /* arc arrow around (cx,cy): from angle a1 to a2 (degrees, 0 = up, clockwise positive) */
  function arcArrow(cx, cy, r1, r2, a1, a2, stroke, o) {
    o = o || {};
    const d = a => a * Math.PI / 180;
    const p = (r, a) => [cx + r * Math.sin(d(a)), cy - r * Math.cos(d(a))];
    const [x1, y1] = p(r1, a1), [x2, y2] = p(r2, a2);
    const sweep = a2 > a1 ? 1 : 0;
    // tangent direction at the end, adjusted for the radial drift
    const t = a2 > a1 ? d(a2) : d(a2) + Math.PI;
    let ang = Math.atan2(Math.sin(t), Math.cos(t)); // direction of travel tangent: for clockwise at angle a, travel vector = (cos a, sin a) in screen coords
    ang = a2 > a1 ? Math.atan2(Math.sin(d(a2)), Math.cos(d(a2))) : Math.atan2(-Math.sin(d(a2)), -Math.cos(d(a2)));
    const rm = (r1 + r2) / 2;
    return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${rm},${rm} 0 0,${sweep} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${o.sw || 2.4}" stroke-linecap="round"/>` + head(x2, y2, ang, stroke, 10);
  }
  function lines(x, y, arr, o) { o = o || {}; const lh = o.lh || 15; return arr.map((s, i) => T(x, y + i * lh, s, o)).join(''); }
  function sun(cx, cy, r) {
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SUN}"/>`;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += line(cx + Math.cos(a) * (r + 4), cy + Math.sin(a) * (r + 4), cx + Math.cos(a) * (r + 10), cy + Math.sin(a) * (r + 10), SUN, { sw: 2 }); }
    return s;
  }
  function cloud(cx, cy, w, fill, stroke) {
    const h = w * 0.45;
    return `<path d="M${cx - w / 2},${cy + h / 2} a${h * 0.55},${h * 0.55} 0 0 1 ${h * 0.4},${-h * 0.9} a${h * 0.7},${h * 0.7} 0 0 1 ${w * 0.45},${-h * 0.25} a${h * 0.6},${h * 0.6} 0 0 1 ${w * 0.3},${h * 0.5} a${h * 0.4},${h * 0.4} 0 0 1 ${-h * 0.15},${h * 0.65} Z" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="1"/>`;
  }
  /* boat side view, bow pointing right, waterline y */
  function boat(x, y, len, fill) {
    const h = len * 0.22;
    return `<path d="M${x},${y - h} L${x + len * 0.72},${y - h} Q${x + len},${y - h * 1.1} ${x + len},${y - h * 0.1} L${x + len * 0.93},${y + h * 0.4} L${x + len * 0.05},${y + h * 0.4} Z" fill="${fill}" stroke="${DARKINK}" stroke-width="1.2"/>` +
      rect(x + len * 0.3, y - h - len * 0.14, len * 0.32, len * 0.14 + 2, fill, DARKINK, { rx: 2 });
  }
  /* sinusoidal wave surface between x0 and x1 at mean level y, wavelength L, amplitude A */
  function waves(x0, x1, y, L, A, fill, stroke, o) {
    o = o || {};
    let d = `M${x0},${y}`;
    const step = 4;
    for (let x = x0; x <= x1; x += step) {
      const ph = ((x - x0) / L) * Math.PI * 2;
      // peaked waves lean forward when o.steep
      const yy = o.steep ? y - A * (Math.sin(ph) + 0.35 * Math.sin(2 * ph - 1)) : y - A * Math.sin(ph);
      d += ` L${x},${yy.toFixed(1)}`;
    }
    d += ` L${x1},${o.bottom} L${x0},${o.bottom} Z`;
    return `<path d="${d}" fill="${fill}" stroke="${stroke || WATER2}" stroke-width="1.5"/>`;
  }

  /* wind barb: shaft from tail (tx,ty) to head pointing in direction ang (radians, screen coords); knots rounded to 5 */
  function barb(tx, ty, ang, knots, col, len) {
    len = len || 60; col = col || INK;
    const hx = tx + len * Math.cos(ang), hy = ty + len * Math.sin(ang);
    let s = line(tx, ty, hx, hy, col, { sw: 2 }) + head(hx, hy, ang, col, 10);
    // barbs on the tail side, drawn on the left-hand side of the shaft (looking downwind) and angled back
    let k = knots, pos = 0, step = 7;
    const nx = -Math.sin(ang), ny = Math.cos(ang); // normal (to the right of travel in screen coords -> we use the negative for "up" when ang = 0)
    const draw = (p, L) => {
      const bx = tx + p * Math.cos(ang), by = ty + p * Math.sin(ang);
      const ex = bx - L * nx * 1 + L * 0.35 * Math.cos(ang) * -1, ey = by - L * ny + L * 0.35 * Math.sin(ang) * -1;
      return line(bx, by, ex, ey, col, { sw: 2 });
    };
    while (k >= 50) { const bx = tx + pos * Math.cos(ang), by = ty + pos * Math.sin(ang); const cx = tx + (pos + 8) * Math.cos(ang), cy = ty + (pos + 8) * Math.sin(ang); s += `<polygon points="${bx.toFixed(1)},${by.toFixed(1)} ${(bx - 14 * nx - 4 * Math.cos(ang)).toFixed(1)},${(by - 14 * ny - 4 * Math.sin(ang)).toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}" fill="${col}"/>`; k -= 50; pos += 10; }
    while (k >= 10) { s += draw(pos, 14); k -= 10; pos += step; }
    if (k >= 5) { if (pos === 0) pos = step; s += draw(pos, 8); }
    return s;
  }

  // ---------- Wind direction and barbs (F16, F17) ----------
  function windArrows(o) {
    o = o || {};
    const W = 640, H = 300;
    let s = T(W / 2, 22, 'Wind is named by where it comes FROM; the arrow shows where it goes TO', { size: 14, weight: 700 });
    // compass on the left with a south-westerly wind
    const cx = 130, cy = 160, R = 88;
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${PAPER}" stroke="${LINE}" stroke-width="1.5"/>`;
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([l, a]) => { const r = a * Math.PI / 180; s += T(cx + Math.sin(r) * (R + 14), cy - Math.cos(r) * (R + 14), l, { size: 13, weight: 700, fill: INK2 }); });
    [['NE', 45], ['SE', 135], ['SW', 225], ['NW', 315]].forEach(([l, a]) => { const r = a * Math.PI / 180; s += T(cx + Math.sin(r) * (R + 16), cy - Math.cos(r) * (R + 16), l, { size: 10, fill: MUTED }); });
    // wind from SW (225) blowing towards NE (45): arrow from SW edge towards NE
    const a = Math.atan2(-1, 1); // towards NE in screen coords: dx +, dy -
    const fx = cx - Math.cos(a) * 70, fy = cy - Math.sin(a) * 70;
    s += barb(fx, fy, a, 20, SEA, 140);
    s += T(cx - 60, cy + 92, 'from SW', { size: 11, weight: 700, fill: SEA, anchor: 'start' });
    s += T(cx + 40, cy - 94, 'to NE', { size: 11, weight: 700, fill: SEA, anchor: 'start' });
    s += lines(cx, 272, ['"South-westerly, 10 m/s": blows FROM the south-west', 'towards the north-east. Two long barbs = 20 kn = 10 m/s.'], { size: 11, fill: INK2, lh: 14 });
    // barb legend on the right
    const x0 = 300;
    s += T(x0, 56, 'Reading the barbs (on the tail, the FROM end)', { size: 12.5, weight: 700, anchor: 'start' });
    const rows = [[5, 'short barb = 5 kn (about 2.5 m/s)'], [10, 'long barb = 10 kn (about 5 m/s)'], [15, 'long + short = 15 kn (about 7.5 m/s)'], [25, 'two long + short = 25 kn (about 13 m/s)'], [50, 'filled triangle = 50 kn (about 25 m/s)'], [65, 'triangle + long + short = 65 kn (hurricane)']];
    rows.forEach(([k, lab], i) => { const y = 86 + i * 34; s += barb(x0 + 6, y, 0, k, INK, 72); s += T(x0 + 96, y, lab, { size: 11.5, anchor: 'start', fill: INK2 }); });
    s += rect(x0, 288 - 18, 330, 24, SHALLOW, 'none') + T(x0 + 165, 282, 'Rule of thumb: m/s x 2 = knots (10 m/s is about 20 kn)', { size: 11, weight: 600 });
    return S.svg(W, H, s, { label: 'Wind direction convention and wind-barb symbols' });
  }
  /* a single wind arrow on a compass for picture questions: wind blowing FROM `from` degrees */
  function windQuestion(from, knots) {
    const W = 320, H = 300, cx = 160, cy = 150, R = 100;
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${PAPER}" stroke="${LINE}" stroke-width="1.5"/>`;
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([l, a]) => { const r = a * Math.PI / 180; s += T(cx + Math.sin(r) * (R + 16), cy - Math.cos(r) * (R + 16), l, { size: 14, weight: 700, fill: INK2 }); });
    [['NE', 45], ['SE', 135], ['SW', 225], ['NW', 315]].forEach(([l, a]) => { const r = a * Math.PI / 180; s += T(cx + Math.sin(r) * (R + 18), cy - Math.cos(r) * (R + 18), l, { size: 10, fill: MUTED }); });
    const to = (from + 180) % 360, ang = (to - 90) * Math.PI / 180; // screen angle of travel
    const tx = cx - Math.cos(ang) * 75, ty = cy - Math.sin(ang) * 75;
    s += barb(tx, ty, ang, knots, SEA, 150);
    s += T(cx, H - 10, 'Wind symbol as drawn on a weather map', { size: 11, fill: MUTED });
    return S.svg(W, H, s, { label: 'A wind arrow on a compass rose' });
  }

  // ---------- IL-1 Beaufort scale strip (F21, F23, F24, F27, F3) ----------
  const BEAUFORT = [
    [0, 'Calm', '0-0.2', '<1', '0', 'mirror-flat sea'],
    [1, 'Light air', '0.3-1.5', '1-3', '0.1', 'ripples'],
    [2, 'Light breeze', '1.6-3.3', '4-6', '0.2', 'small wavelets'],
    [3, 'Gentle breeze', '3.4-5.4', '7-10', '0.6', 'scattered white horses'],
    [4, 'Moderate breeze', '5.5-7.9', '11-16', '1', 'frequent white horses'],
    [5, 'Fresh breeze', '8.0-10.7', '17-21', '2', 'many white horses, spray'],
    [6, 'Strong breeze', '10.8-13.8', '22-27', '3', 'foam crests everywhere'],
    [7, 'Near gale', '13.9-17.1', '28-33', '4', 'foam blown in streaks'],
    [8, 'Gale', '17.2-20.7', '34-40', '5.5', 'moderately high, spindrift'],
    [9, 'Strong gale', '20.8-24.4', '41-47', '7', 'spray affects visibility'],
    [10, 'Storm', '24.5-28.4', '48-55', '9', 'very high waves, white sea'],
    [11, 'Violent storm', '28.5-32.6', '56-63', '11.5', 'exceptionally high waves'],
    [12, 'Hurricane', '32.7 or more', '64 or more', '14 or more', 'air filled with foam'],
  ];
  const BF_BG = ['#e8f5e9', '#e8f5e9', '#e8f5e9', '#e8f5e9', '#c8e6c9', '#fff176', '#ffb300', '#fb8c00', '#e65100', '#c62828', '#c62828', '#c62828', '#4a0000'];
  const BF_FG = ['#2e7d32', '#2e7d32', '#2e7d32', '#2e7d32', '#1b5e20', '#5d4037', '#3e2723', '#3e2723', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'];
  const BF_KN = [0, 0, 5, 10, 15, 20, 25, 30, 35, 45, 50, 60, 65]; // barb values per IL-1 spec
  function beaufortStrip(o) {
    o = o || {};
    const W = 640, H = 500, y0 = 64, rh = 28, x0 = 12, tw = 540;
    let s = T(W / 2, 20, 'The Beaufort scale as MET Norway uses it (mean wind, 10-minute average)', { size: 14, weight: 700 });
    const cols = [[x0 + 16, 'F', 'middle'], [x0 + 36, 'Name', 'start'], [x0 + 150, 'm/s', 'start'], [x0 + 232, 'knots', 'start'], [x0 + 300, 'wave m', 'start'], [x0 + 356, 'what the sea looks like', 'start'], [x0 + 500, 'barb', 'middle']];
    cols.forEach(([x, l, a]) => s += T(x, y0 - 12, l, { size: 10, weight: 700, fill: MUTED, anchor: a }));
    BEAUFORT.forEach((r, i) => {
      const y = y0 + i * rh;
      s += rect(x0, y, tw, rh - 2, BF_BG[i], 'none', { rx: 3 });
      const fg = BF_FG[i];
      s += T(x0 + 16, y + rh / 2 - 1, String(r[0]), { size: 13, weight: 700, fill: fg });
      s += T(x0 + 36, y + rh / 2 - 1, r[1], { size: 12, weight: 700, fill: fg, anchor: 'start' });
      s += T(x0 + 150, y + rh / 2 - 1, r[2], { size: 11.5, fill: fg, anchor: 'start' });
      s += T(x0 + 232, y + rh / 2 - 1, r[3], { size: 11.5, fill: fg, anchor: 'start' });
      s += T(x0 + 300, y + rh / 2 - 1, r[4], { size: 11.5, fill: fg, anchor: 'start' });
      s += T(x0 + 356, y + rh / 2 - 1, r[5], { size: 10.5, fill: fg, anchor: 'start' });
      if (BF_KN[i] > 0) s += barb(x0 + 478, y + rh / 2 + 2, 0, BF_KN[i], fg, 44);
      else s += line(x0 + 478, y + rh / 2, x0 + 522, y + rh / 2, fg, { sw: 1.2, dash: '2 3' });
    });
    // gale warning marker between row 6 and row 7
    const gy = y0 + 7 * rh - 1;
    s += line(x0, gy, x0 + tw, gy, BAD, { sw: 2.5, dash: '8 4' });
    s += rect(x0 + 352, gy - 9, 182, 18, PAPER, BAD, { rx: 3, sw: 1 }) + T(x0 + 443, gy, 'MET coastal gale warning: 15 m/s', { size: 10, weight: 700, fill: BAD });
    // CE brackets on the right
    const bx = x0 + tw + 14;
    const br = [[0, 4, 'D'], [0, 6, 'C'], [0, 8, 'B'], [9, 12, 'A']];
    br.forEach(([a, b, l], k) => {
      const x = bx + k * 17, ya = y0 + a * rh + 2, yb = y0 + (b + 1) * rh - 4;
      s += `<path d="M${x + 6},${ya} h-5 V${yb} h5" fill="none" stroke="${INK2}" stroke-width="1.5"/>`;
      s += T(x + 1, yb + 11, l, { size: 11, weight: 700, fill: INK2 });
    });
    s += T(bx + 26, y0 - 12, 'CE', { size: 10, weight: 700, fill: MUTED });
    s += lines(W / 2, H - 36, ['CE design category (builder\'s plate): D up to force 4 and 0.3 m waves; C up to force 6 and 2 m; B up to force 8 and 4 m; A above force 8 and 4 m.', 'MET issues a coastal gale warning at 15 m/s mean wind, which lies inside the force-7 (near gale) band; near gale is "dangerous for small boats".'], { size: 10.5, fill: INK2, lh: 14 });
    return S.svg(W, H, s, { label: 'Beaufort scale 0 to 12 with m/s, knots, wave heights, sea state, wind barbs, CE categories and the gale-warning threshold' });
  }

  // ---------- IL-2 Low and high pressure, northern hemisphere (F39-F42) ----------
  function pressureSystems(o) {
    o = o || {};
    const W = 640, H = 470;
    let s = T(W / 2, 20, 'Northern hemisphere: anticlockwise into a LOW, clockwise out of a HIGH', { size: 14, weight: 700 });
    function system(cx, cy, low) {
      let g = T(cx, cy - 150, 'N', { size: 12, weight: 700, fill: INK2 }) + arrow([[cx, cy - 142], [cx, cy - 160]], INK2, { sw: 1.5, head: 7 });
      const gaps = low ? [36, 66, 96] : [48, 84, 120];
      const labels = low ? ['990', '1000', '1010'] : ['1025', '1015', '1005'];
      gaps.forEach((r, i) => { g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ISO}" stroke-width="1.3"/>`; g += rect(cx + r * 0.72 - 14, cy - r * 0.72 - 7, 28, 14, PAPER, 'none', { rx: 2 }) + T(cx + r * 0.72, cy - r * 0.72, labels[i], { size: 9.5, fill: MUTED }); });
      g += T(cx, cy - 2, low ? 'L' : 'H', { size: 44, weight: 800, fill: low ? LOWRED : HIGHBLUE });
      g += T(cx, cy + 30, low ? 'LOW 985 hPa' : 'HIGH 1030 hPa', { size: 11, weight: 700, fill: low ? LOWRED : HIGHBLUE });
      // six arrows: anticlockwise + inwards for the low, clockwise + outwards for the high
      const col = low ? HIGHBLUE : '#ef6c00';
      for (let i = 0; i < 6; i++) {
        const a0 = i * 60 + 10;
        const r0 = low ? 128 : 100, r1 = low ? 112 : 118;
        if (low) g += arcArrow(cx, cy, r0, r1, a0 + 46, a0, col);   // decreasing angle = anticlockwise, radius shrinking = inward
        else g += arcArrow(cx, cy, r0, r1, a0, a0 + 46, col);       // increasing angle = clockwise, radius growing = outward
      }
      return g;
    }
    s += system(160, 190, true) + system(480, 190, false);
    s += lines(160, 352, ['Air flows anticlockwise and inwards.', 'Rising air: cloud, rain, unsettled, often windy.', 'Isobars close together: strong wind.'], { size: 11, fill: INK2, lh: 14 });
    s += lines(480, 352, ['Air flows clockwise and outwards.', 'Sinking air: fair, settled weather, light winds.', 'Isobars far apart: light wind.'], { size: 11, fill: INK2, lh: 14 });
    // Buys Ballot inset
    const by = 430;
    s += rect(150, by - 28, 340, 56, SHALLOW, 'none');
    s += arrow([[198, by], [236, by]], SEA, { sw: 2.5 }) + T(190, by - 14, 'wind', { size: 10, fill: SEA, weight: 700 });
    s += `<circle cx="252" cy="${by}" r="9" fill="${INK2}"/>` + line(252, by - 9, 252, by - 14, INK2, { sw: 3 });
    s += T(252, by + 22, 'you, back to the wind', { size: 9.5, fill: MUTED });
    s += T(262, by - 16, 'L', { size: 18, weight: 800, fill: LOWRED }) + T(236, by + 16, 'H', { size: 18, weight: 800, fill: HIGHBLUE });
    s += lines(400, by - 6, ['Buys Ballot: back to the wind, the LOW is on', 'your LEFT (and a little ahead), the HIGH on your right.'], { size: 10.5, fill: INK2, lh: 13, weight: 600 });
    return S.svg(W, H, s, { label: 'Circulation around a low and a high in the northern hemisphere, with Buys Ballot\'s law' });
  }

  // ---------- IL-7 Warm front cross-section (F45, F46, F48) ----------
  function warmFront() {
    const W = 640, H = 300, gy = 232;
    let s = T(W / 2, 20, 'A warm front approaching from the west: the cloud lowers for 6 to 12 hours before the rain', { size: 13.5, weight: 700 });
    // front moves to the LEFT (west is left). Warm air on the right sliding up over cold air to the left.
    s += rect(20, 40, 600, gy - 40, SHALLOW, 'none', { rx: 0, opacity: 0.6 });
    s += `<polygon points="200,${gy} 620,40 620,${gy}" fill="#ffcdd2" opacity="0.55"/>`;
    s += line(200, gy, 620, 40, LOWRED, { sw: 2 });
    s += T(540, 150, 'WARM AIR', { size: 12, weight: 700, fill: LOWRED }) + T(110, 150, 'COLD AIR', { size: 12, weight: 700, fill: HIGHBLUE });
    // clouds along the slope
    s += `<g stroke="${INK2}" stroke-width="1.4" fill="none">${[[40, 62], [52, 58], [64, 66]].map(([x, y]) => `<path d="M${x},${y} q10,-6 22,-2"/>`).join('')}</g>` + T(58, 82, 'cirrus', { size: 9.5, fill: MUTED });
    s += rect(120, 58, 130, 10, '#e0e0e0', 'none', { rx: 5 }) + sun(185, 50, 7) + `<circle cx="185" cy="50" r="15" fill="none" stroke="${SUN}" stroke-width="1.2" opacity="0.8"/>` + T(185, 82, 'cirrostratus (halo)', { size: 9.5, fill: MUTED });
    s += rect(230, 100, 150, 22, '#bdbdbd', 'none', { rx: 8 }) + T(305, 136, 'altostratus', { size: 9.5, fill: MUTED });
    s += rect(330, 140, 190, 48, '#757575', 'none', { rx: 10 }) + T(425, 202, 'nimbostratus, steady rain', { size: 9.5, fill: MUTED });
    for (let i = 0; i < 8; i++) s += line(345 + i * 22, 192, 341 + i * 22, 214, HIGHBLUE, { sw: 1.3 });
    // ground, sea, front symbol
    s += rect(20, gy, 600, 6, WATER, 'none', { rx: 0 });
    s += line(20, gy + 3, 620, gy + 3, WATER2, { sw: 1 });
    // surface front: red line with semicircles pointing left (direction of movement)
    for (let i = 0; i < 4; i++) s += `<path d="M${215 + i * 26},${gy - 1} a8,8 0 0 0 -16,0 Z" fill="${LOWRED}"/>`;
    s += arrow([[200, gy - 22], [150, gy - 22]], LOWRED, { sw: 2 }) + T(176, gy - 34, 'front moves this way', { size: 9.5, fill: LOWRED });
    s += lines(110, gy + 24, ['Ahead: wind S to SE, backing;', 'barometer falling; swell building'], { size: 10.5, fill: INK2, lh: 13 });
    s += lines(470, gy + 24, ['Behind: wind veers to SW, warmer,', 'barometer steadies, drizzle'], { size: 10.5, fill: INK2, lh: 13 });
    s += T(W / 2, H - 8, 'West (ahead of the front)                                                 East (behind it)', { size: 9.5, fill: MUTED });
    return S.svg(W, H, s, { label: 'Cross-section of a warm front with the cloud sequence cirrus, cirrostratus, altostratus, nimbostratus' });
  }

  // ---------- IL-3 Sea breeze (day) and land breeze (night) (F50-F53) ----------
  function seaBreeze() {
    const W = 640, H = 430;
    let s = '';
    function panel(y, night) {
      const h = 170, gy = y + 118;
      s += rect(20, y, 600, h, night ? '#1a2b4a' : '#bbdefb', 'none', { rx: 8 });
      // sea left, land right
      s += rect(20, gy, 300, y + h - gy, WATER, 'none', { rx: 0 });
      s += `<path d="M320,${gy} L620,${gy} L620,${gy - 30} Q500,${gy - 36} 400,${gy - 12} Q360,${gy - 4} 320,${gy} Z" fill="${LAND}"/>`;
      s += `<path d="M320,${gy} L620,${gy} L620,${y + h} L20,${y + h} L20,${gy} Z" fill="${SOIL}"/>`;
      s += rect(20, gy, 300, y + h - gy, WATER, 'none', { rx: 0 });
      s += T(90, gy + 26, 'SEA', { size: 13, weight: 800, fill: '#ffffff' }) + T(540, gy + 26, 'LAND', { size: 13, weight: 800, fill: '#ffffff' });
      const fg = night ? '#ffffff' : DARKINK;
      if (!night) {
        s += sun(560, y + 34, 14);
        for (let i = 0; i < 3; i++) s += arrow([[440 + i * 40, gy - 24], [440 + i * 40, gy - 72]], LOWRED, { sw: 2.2 });
        s += cloud(480, y + 42, 60, '#ffffff', '#90a4ae');
        s += T(480, gy - 86, 'warm air rises', { size: 10, fill: LOWRED, weight: 700 });
        s += arrow([[80, gy - 18], [300, gy - 18]], HIGHBLUE, { sw: 6, head: 16 });
        s += T(190, gy - 36, 'SEA BREEZE (onshore), afternoon', { size: 12, weight: 800, fill: HIGHBLUE });
        s += arrow([[420, y + 24], [140, y + 24]], '#607d8b', { sw: 1.6, dash: '5 4' }) + T(280, y + 14, 'return flow aloft', { size: 9.5, fill: '#455a64' });
        s += T(60, y + 60, 'H', { size: 22, weight: 800, fill: HIGHBLUE }) + T(60, y + 80, 'cool', { size: 10, fill: '#37474f' });
        s += T(600, y + 76, 'L', { size: 22, weight: 800, fill: LOWRED }) + T(600, y + 96, 'warm', { size: 10, fill: '#37474f' });
      } else {
        s += `<circle cx="70" cy="${y + 34}" r="13" fill="#eceff1"/><circle cx="78" cy="${y + 30}" r="11" fill="#1a2b4a"/>`;
        for (let i = 0; i < 3; i++) s += arrow([[440 + i * 40, gy - 72], [440 + i * 40, gy - 26]], '#64b5f6', { sw: 2 });
        s += T(480, gy - 86, 'land cools', { size: 10, fill: '#90caf9', weight: 700 });
        s += arrow([[300, gy - 18], [120, gy - 18]], '#90caf9', { sw: 3.5, head: 11 });
        s += T(210, gy - 36, 'LAND BREEZE (offshore), weak', { size: 12, weight: 800, fill: '#e3f2fd' });
        s += arrow([[140, y + 24], [420, y + 24]], '#90a4ae', { sw: 1.4, dash: '5 4' }) + T(280, y + 14, 'return flow aloft', { size: 9.5, fill: '#cfd8dc' });
        s += T(60, y + 70, 'L', { size: 22, weight: 800, fill: '#ef9a9a' }) + T(600, y + 76, 'H', { size: 22, weight: 800, fill: '#90caf9' });
      }
      s += T(night ? 330 : 330, y + 12, night ? 'NIGHT' : 'DAY', { size: 11, weight: 800, fill: fg, anchor: 'middle' });
    }
    panel(14, false);
    s += lines(W / 2, 200, ['Land heats faster than the sea. Warm air rises over land, cooler sea air flows in. Sets in late morning,', 'strongest late afternoon, often 15-25 knots on the Norwegian coast in sunny weather, dies at sunset.'], { size: 10.5, fill: INK2, lh: 13 });
    panel(232, true);
    s += lines(W / 2, 418, ['At night the land cools faster: a weak offshore land breeze flows out over the water.'], { size: 10.5, fill: INK2 });
    return S.svg(W, H, s, { label: 'Sea breeze by day (onshore) and land breeze by night (offshore)' });
  }

  // ---------- IL-4 Wind with / against current, shallow water (F33-F35) ----------
  function windCurrent() {
    const W = 640, H = 420;
    let s = '';
    function strip(y, title, opposing) {
      const sy = y + 70, bottom = y + 112;
      s += rect(20, y, 600, 118, SHALLOW, 'none', { rx: 8, opacity: 0.5 });
      s += T(30, y + 14, title, { size: 12.5, weight: 800, anchor: 'start' });
      s += T(30, sy - 6, 'W', { size: 11, weight: 700, fill: MUTED }) + T(610, sy - 6, 'E', { size: 11, weight: 700, fill: MUTED });
      s += arrow([[200, y + 34], [440, y + 34]], INK2, { sw: 5, head: 14 }) + T(320, y + 20, 'Wind 10 m/s from the west', { size: 11, weight: 700, fill: INK2 });
      if (opposing) {
        s += waves(50, 590, sy, 36, 11, WATER, WATER2, { bottom, steep: true });
        for (let x = 68; x < 590; x += 36) s += `<path d="M${x - 4},${sy - 10} q6,-3 12,2" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>`;
        s += arrow([[500, sy + 28], [220, sy + 28]], '#0d47a1', { sw: 3.5 }) + T(360, sy + 42, 'Current 2 kn opposing the wind', { size: 11, weight: 700, fill: '#0d47a1' });
      } else {
        s += waves(50, 590, sy, 90, 7, WATER, WATER2, { bottom });
        s += arrow([[220, sy + 28], [500, sy + 28]], '#0d47a1', { sw: 3.5 }) + T(360, sy + 42, 'Current 2 kn, same direction as the wind', { size: 11, weight: 700, fill: '#0d47a1' });
      }
    }
    strip(10, 'WIND WITH CURRENT: waves stretched out, longer and lower', false);
    strip(140, 'WIND AGAINST CURRENT: waves compressed, short, steep, breaking', true);
    // shallow water strip
    const y = 270, bottom = y + 122, sy = y + 60;
    s += rect(20, y, 600, 130, SHALLOW, 'none', { rx: 8, opacity: 0.5 });
    s += T(30, y + 14, 'SHALLOW WATER: waves slow down, grow taller and steeper, then break', { size: 12.5, weight: 800, anchor: 'start' });
    // seabed rising left to right
    s += `<path d="M50,${bottom} L50,${y + 112} L300,${y + 100} L470,${y + 78} L590,${y + 68} L590,${bottom} Z" fill="${SOIL}"/>`;
    // waves increasing amplitude
    let d = `M50,${sy}`;
    for (let x = 50; x <= 590; x += 4) { const A = 4 + (x - 50) / 540 * 14; const L = 80 - (x - 50) / 540 * 40; const ph = (x - 50) / L * Math.PI * 2; d += ` L${x},${(sy - A * Math.sin(ph)).toFixed(1)}`; }
    s += `<path d="${d} L590,${y + 68} L470,${y + 78} L300,${y + 100} L50,${y + 112} Z" fill="${WATER}" stroke="${WATER2}" stroke-width="1.5"/>`;
    s += `<path d="M520,${sy - 20} q8,-4 16,3" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/><path d="M560,${sy - 20} q8,-4 16,3" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>`;
    s += arrow([[120, y + 30], [260, y + 30]], INK2, { sw: 3 }) + T(190, y + 20, 'wind and waves', { size: 10, fill: INK2 });
    s += lines(430, y + 34, ['waves break when the depth is only', 'about 1.3 x the wave height'], { size: 10.5, fill: INK2, lh: 13, weight: 600 });
    s += T(330, bottom - 6, 'seabed rising towards a shoal, bar or beach', { size: 9.5, fill: '#efebe9' });
    return S.svg(W, H, s, { label: 'Wind with current gives long low waves; wind against current gives short steep breaking waves; shallow water makes waves break' });
  }

  // ---------- IL-5 Tidal range along the Norwegian coast (F76, F77) ----------
  function tideRange() {
    const W = 640, H = 330, x0 = 60, bw = 46, gap = 18, base = 250, scale = 44; // px per metre
    const data = [['Oslo', 0.72], ['Mandal', 0.50], ['Egersund', 0.05], ['Bergen', 1.8], ['Kristiansund', 2.65], ['Harstad', 2.68], ['Narvik', 3.82], ['Vadso', 3.97]];
    let s = T(W / 2, 20, 'Tidal range (highest minus lowest astronomical tide), south-east to north-east', { size: 13.5, weight: 700 });
    for (let m = 0; m <= 4; m++) { const y = base - m * scale; s += line(x0 - 10, y, x0 + data.length * (bw + gap), y, LINE, { sw: 1, dash: '3 4' }); s += T(x0 - 16, y, m + ' m', { size: 10, fill: MUTED, anchor: 'end' }); }
    data.forEach(([name, v], i) => {
      const x = x0 + i * (bw + gap), h = v * scale;
      const t = v / 4;
      const col = `rgb(${Math.round(200 - 170 * t)},${Math.round(225 - 150 * t)},${Math.round(255 - 90 * t)})`;
      s += rect(x, base - h, bw, h, col, 'none', { rx: 3 });
      s += T(x + bw / 2, base - h - 10, name === 'Egersund' ? 'about 0' : v.toFixed(2) + ' m', { size: 10.5, weight: 700, fill: INK });
      s += T(x + bw / 2, base + 14, name, { size: 10.5, fill: INK2 });
    });
    s += T(x0 + 2 * (bw + gap) + bw / 2, base + 28, 'amphidromic point', { size: 9, fill: MUTED });
    s += arrow([[x0, 290], [x0 + data.length * (bw + gap) - 10, 290]], INK2, { sw: 1.5 }) + T(W / 2, 304, 'Oslofjord and Skagerrak coast (south)  ->  west coast  ->  north Norway and Finnmark (largest in Norway: Nesseby, inner Varangerfjord)', { size: 9.5, fill: MUTED });
    s += rect(x0 + 5 * (bw + gap) - 6, 30, 100, 34, PAPER2, LINE) + lines(x0 + 5 * (bw + gap) + 44, 41, ['Saltstraumen near Bodo:', 'strongest tidal current'], { size: 9.5, fill: INK2, lh: 12, weight: 600 });
    return S.svg(W, H, s, { label: 'Bar chart of tidal range at Norwegian ports from Oslo (0.72 m) to Vadso (3.97 m), near zero at Egersund' });
  }

  // ---------- IL-6 Chart datum and tide levels (F79, F80, F83, F84) ----------
  function chartDatum() {
    const W = 640, H = 360, x0 = 90, x1 = 400, yHAT = 50, yLAT = 230, ySea = 300;
    let s = '';
    s += rect(x0, yHAT, x1 - x0, ySea - yHAT, SHALLOW, 'none', { rx: 0, opacity: 0.6 });
    s += `<path d="M${x0},${ySea} L${x1},${ySea} L${x1},${H - 10} L${x0},${H - 10} Z" fill="${SOIL}"/>`;
    s += T((x0 + x1) / 2, ySea + 24, 'seabed', { size: 11, weight: 700, fill: '#efebe9' });
    const yNow = 150;
    s += rect(x0, yNow, x1 - x0, ySea - yNow, WATER, 'none', { rx: 0, opacity: 0.75 });
    s += waves(x0, x1, yNow, 50, 3, WATER, WATER2, { bottom: yNow + 6 });
    s += boat(200, yNow + 1, 90, '#eceff1');
    // level lines
    const lv = [[yHAT, 'HAT  highest astronomical tide', MUTED, '3 4'], [yHAT + 30, 'MHWS  mean high water springs', MUTED, '3 4'], [(yHAT + yLAT) / 2, 'MSL  mean sea level', MUTED, '3 4'], [yLAT - 28, 'MLWS  mean low water springs', MUTED, '3 4'], [yLAT, 'LAT = CHART DATUM (zero for charted depths and tide heights)', INK, null]];
    lv.forEach(([y, l, col, dash]) => { s += line(x0, y, x1 + 8, y, col, { sw: dash ? 1 : 2.5, dash }); s += T(x1 + 14, y, l, { size: 10.5, fill: col, anchor: 'start', weight: dash ? 500 : 700 }); });
    s += line(x0, yNow, x1 + 8, yNow, INK2, { sw: 1.5 }) + T(x1 + 14, yNow, 'water level now', { size: 10.5, fill: INK2, anchor: 'start', weight: 700 });
    // dimension arrows
    const dx = 40;
    s += arrow([[dx, yLAT], [dx, ySea - 2]], INK2, { sw: 1.5, head: 7 }) + arrow([[dx, ySea], [dx, yLAT + 2]], INK2, { sw: 1.5, head: 7 });
    s += `<g transform="rotate(-90 ${dx - 10} ${(yLAT + ySea) / 2})">${T(dx - 10, (yLAT + ySea) / 2, 'charted depth', { size: 10, weight: 700, fill: INK2 })}</g>`;
    s += arrow([[dx + 25, yLAT], [dx + 25, yNow + 2]], OK, { sw: 1.5, head: 7 }) + arrow([[dx + 25, yNow], [dx + 25, yLAT - 2]], OK, { sw: 1.5, head: 7 });
    s += `<g transform="rotate(-90 ${dx + 15} ${(yLAT + yNow) / 2})">${T(dx + 15, (yLAT + yNow) / 2, 'height of tide', { size: 10, weight: 700, fill: OK })}</g>`;
    s += rect(x1 + 14, 250, 216, 44, PAPER2, LINE) + lines(x1 + 122, 264, ['depth now = charted depth + height of tide', '(plus or minus the weather effect)'], { size: 10.5, weight: 700, lh: 14 });
    s += lines(x1 + 122, 312, ['Chart datum = LAT everywhere except: inner Oslofjord 30 cm', 'below LAT; Swedish border to Utsira 20 cm below LAT.'], { size: 9.5, fill: MUTED, lh: 12 });
    return S.svg(W, H, s, { label: 'Tide levels: chart datum (LAT), height of tide, charted depth and the depth available now' });
  }

  // ---------- barometer / pressure tendency picture for questions (F43) ----------
  function barometer(from, to) {
    const W = 320, H = 200;
    let s = T(W / 2, 20, 'Barometer readings', { size: 13, weight: 700 });
    [[80, '09:00', from], [240, '12:00', to]].forEach(([cx, t, v]) => {
      s += `<circle cx="${cx}" cy="105" r="52" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>`;
      for (let i = 0; i < 9; i++) { const a = (-135 + i * 33.75) * Math.PI / 180; s += line(cx + Math.sin(a) * 44, 105 - Math.cos(a) * 44, cx + Math.sin(a) * 50, 105 - Math.cos(a) * 50, INK2, { sw: 1.2 }); }
      const a = (-135 + (v - 960) / 80 * 270) * Math.PI / 180;
      s += line(cx, 105, cx + Math.sin(a) * 40, 105 - Math.cos(a) * 40, BAD, { sw: 2.5 }) + `<circle cx="${cx}" cy="105" r="4" fill="${INK}"/>`;
      s += T(cx, 128, v + ' hPa', { size: 12, weight: 700 }) + T(cx, 175, t, { size: 12, fill: INK2, weight: 600 });
    });
    s += arrow([[142, 105], [178, 105]], INK2, { sw: 2 });
    return S.svg(W, H, s, { label: `Barometer falling from ${from} to ${to} hPa in three hours` });
  }

  BOAT.register({
    id: 'weather-and-sea',
    title: 'Weather, wind, waves and tide',
    order: 9,
    examShare: 3,
    examWeight: 'about 2 to 5 of 50 questions',
    summary: 'How to read a marine forecast and the sky: wind direction and the Beaufort scale, gusts, highs and lows, fronts, the afternoon sea breeze, waves and why they break, fog and what the Rules of the Road demand in it, thunder, and the tide and water level that decide how much water you really have under the keel. Weather is tested in curriculum part 1 (seamanship) and tide and current in part 3 (navigation); none of it is a part-4 item.',
    sections: [
      // 1 ------------------------------------------------------------
      {
        id: 'intro',
        title: 'What the exam asks and where forecasts come from',
        html: `<p>Most serious accidents in small boats start with weather that was forecast. The curriculum therefore expects you to understand "meteorological conditions: weather and wind, sea state, visibility" (<strong>part 1, seamanship</strong>) and "current and tide in general" (<strong>part 3, navigation</strong>). Expect roughly 2 to 5 of the 50 questions here. None of it belongs to part 4, so a weather mistake only counts against the overall limit of 10 wrong answers, but these are easy points once you know the numbers.</p>
<p>The official forecast source is the Norwegian Meteorological Institute, published together with NRK on <strong>Yr</strong> (yr.no). The "coast" forecast for any place on the shore gives the wind in m/s with its Beaufort name and the direction it blows <em>from</em>, the gusts, the wave height, the sea current, sea temperature and the predicted tide and water level, about nine to ten days ahead. The Coastal Administration adds a wave and current forecast for the fairways on BarentsWatch (60 hours ahead, updated four times a day) and live wind observations from more than 130 coastal stations.</p>
<p>Away from a phone signal the forecast reaches you by radio. The <strong>coast radio stations</strong> (two of them, one for the south at Sola near Stavanger and one for the north in Bodo, run by the Joint Rescue Coordination Centres since 1 January 2026) keep a continuous watch on <strong>VHF channel 16</strong> and DSC channel 70, and read weather forecasts on their working channels at <strong>09:00, 12:00, 15:00, 18:00 and 21:00</strong> local time, announced on channel 16 first. You can also phone coast radio on <strong>120</strong> and ask for a forecast or report that you need help. Navigational warnings go out on NAVTEX (518 kHz) and are read on VHF six times a day.</p>
<div class="callout rule"><p>Sea Safety Rule 3: <strong>Respect weather and waters. The boat must only be used under suitable conditions.</strong> There is no legal wind limit for recreational craft; the limit is your judgement, the builder's CE category and the forecast.</p></div>
<div class="callout tip"><p>Gale and storm warnings are only issued when the probability is above 50 %, and MET calls near gale "dangerous for small boats". A warning is a decision already made for you: stay in.</p></div>`,
        keyFacts: ['Weather = curriculum part 1; tide and current = part 3; not part 4', 'Yr (MET Norway and NRK) is the official forecast; the coast forecast shows m/s, Beaufort name, direction FROM, gusts, waves, tide', 'Coast radio: watch on VHF ch 16 and DSC ch 70; weather at 09, 12, 15, 18, 21 local time; telephone 120', 'Sea Safety Rule 3: respect weather and waters; use the boat only in suitable conditions', 'MET issues a gale warning only when the probability exceeds 50 %'],
        check: { id: 'weather-c1', q: 'You are out of mobile coverage and want the latest coastal forecast. Which is the correct way to get it?', options: ['Call the police on 112 and ask for the forecast', 'Listen to the coast radio weather broadcast, announced on VHF channel 16 and read on a working channel at 09, 12, 15, 18 or 21 local time', 'Send a DSC distress alert on channel 70 to request weather', 'Wait for the hourly forecast on channel 16 itself'], answer: 1, explanation: 'Coast radio announces its weather broadcasts on channel 16 and reads them on a working channel five times a day (F8). Channel 70 DSC and 112 are for emergencies, not forecasts; you may also phone coast radio on 120 (F9).' },
      },
      // 2 ------------------------------------------------------------
      {
        id: 'reading-wind',
        title: 'Reading wind: direction, mean wind, gusts, knots',
        html: `<p>Four small conventions trip up more candidates than any storm. Learn them first and half the weather questions become easy.</p>
<p><strong>Direction.</strong> Wind is always named by the direction it comes <strong>from</strong>. A "southerly" or "wind from south" blows from the south towards the north. On a weather map the wind arrow points in the direction the air is <em>going</em>, and the little barbs sit on the tail, the "from" end. Each short barb is 5 knots, each long barb 10 knots and a filled triangle 50 knots. Two long barbs on a shaft pointing north-east therefore mean a 20-knot south-westerly.</p>
<p><strong>Mean wind and gusts.</strong> The number in a forecast or observation is the <strong>mean wind averaged over 10 minutes</strong>. A gust is the highest momentary wind (MET reports 3-second gusts) and is typically about <strong>1.5 times</strong> the mean, or 30 to 70 % stronger; over land and under steep terrain gusts can be many times stronger. Yr prints both: "9 m/s fresh breeze from south-west with gusts at 15 m/s". Plan the trip on the gust figure, because that is what will hit the boat when you least want it.</p>
<p><strong>Units.</strong> Norwegian forecasts use metres per second; charts, logs and most boat instruments use knots. One knot is one nautical mile (1852 m) per hour, which is 0.514 m/s, so <strong>1 m/s is about 1.94 knots</strong>. The exam-proof shortcut: <strong>multiply m/s by two to get knots</strong>. 10 m/s is about 20 knots; 15 m/s about 30 knots.</p>
<div class="callout warn"><p>The forecast number is not the maximum wind. A forecast of 10 m/s normally means gusts around 13 to 15 m/s, and more in gusty fjord terrain. Wind force on the boat grows with the <em>square</em> of the speed: double the wind and the pressure on hull and rig is four times greater.</p></div>
<div class="callout tip"><p>Offshore wind (from the land out to sea) gives flat water by the shore but bigger waves further out, and a disabled boat drifts away from land. Onshore wind gives the biggest waves at the shore and pushes a drifting boat onto it.</p></div>`,
        illustration: () => windArrows(),
        caption: 'Wind arrows point where the air goes; the barbs on the tail show the strength in knots. A 20-knot (10 m/s) south-westerly is drawn with two long barbs on a shaft pointing north-east.',
        keyFacts: ['Wind direction = where the wind comes FROM; the arrow points where it goes TO, barbs on the tail', 'Barbs: short 5 kn, long 10 kn, triangle 50 kn', 'Forecast wind = 10-minute mean; gusts (3 s) are typically about 1.5 x the mean', '1 knot = 1852 m/h = 0.514 m/s; 1 m/s is about 1.94 kn, so m/s x 2 = knots', 'Wind pressure grows with the square of the speed'],
        check: { id: 'weather-c2', q: 'The forecast says "12 m/s from north-west". Which statement is correct?', options: ['The wind blows towards the north-west at about 12 knots', 'The wind blows from the north-west towards the south-east at about 24 knots', 'The wind blows towards the north-west at about 24 knots', 'The wind blows from the south-east at about 12 knots'], answer: 1, explanation: 'Wind is named by its origin, so a north-westerly travels towards the south-east, and 12 m/s is about 24 knots (m/s x 2) (F16, F19).' },
      },
      // 3 ------------------------------------------------------------
      {
        id: 'beaufort',
        title: 'The Beaufort scale and what your boat is built for',
        html: `<p>The Beaufort scale turns a wind speed into a word and a picture of the sea. Norwegian forecasts quote the speed in m/s together with the force name, and the exam likes to ask you to convert between the two: "fresh breeze equals what in m/s?" or "17 m/s is which force?". The scale runs from <strong>force 0 (calm)</strong> to <strong>force 12 (hurricane)</strong>. Learn the bands in the illustration; the ones that matter most to a small-boat skipper are forces 4 to 8.</p>
<div class="table-wrap"><table><thead><tr><th>Force</th><th>Name</th><th>m/s</th><th>Knots</th><th>Open-sea waves</th></tr></thead><tbody>
<tr><td>4</td><td>Moderate breeze</td><td>5.5-7.9</td><td>11-16</td><td>1 m, frequent white horses</td></tr>
<tr><td>5</td><td>Fresh breeze</td><td>8.0-10.7</td><td>17-21</td><td>2 m, many white horses, some spray</td></tr>
<tr><td>6</td><td>Strong breeze</td><td>10.8-13.8</td><td>22-27</td><td>3 m, foam crests everywhere</td></tr>
<tr><td>7</td><td>Near gale</td><td>13.9-17.1</td><td>28-33</td><td>4 m, foam blown in streaks</td></tr>
<tr><td>8</td><td>Gale</td><td>17.2-20.7</td><td>34-40</td><td>5.5 m, spindrift</td></tr>
</tbody></table></div>
<p>Two official thresholds hang on this scale. MET Norway issues a <strong>coastal gale warning when the mean wind is expected to reach 15 m/s</strong>, which lies inside the near-gale band (force 7), and a warning for the near fishing banks at 20 m/s (gale, force 8). And the <strong>CE design category</strong> on your builder's plate states the worst conditions the boat was designed for: <strong>D</strong> up to force 4 and 0.3 m waves (0.5 m occasionally), <strong>C</strong> up to force 6 and 2 m, <strong>B</strong> up to force 8 and 4 m, <strong>A</strong> beyond force 8 and 4 m. Most open leisure boats are C or D.</p>
<p>Practical guidance from Norwegian courses, not law: below 8 m/s (up to force 4) suits most leisure boats; 8 to 12 m/s (force 5 to low 6) calls for experience and a capable boat; above about 12 to 14 m/s small open boats stay in harbour. Remember that fjords and coastal waters with short fetch give lower waves than the open-sea figures in the table, but gusts there are worse.</p>
<div class="callout warn"><p>English and Norwegian names do not map one to one. In English, "gale" is force 8 only and "storm" is force 10 only; force 7 is "near gale" and force 9 "strong gale". Forecasts in Norwegian group forces 6 to 8 under one family of names and 9 to 11 under another, so always check the m/s figure rather than trusting the word.</p></div>`,
        illustration: () => beaufortStrip(),
        caption: 'Force 0 to 12 with the m/s and knot bands MET Norway uses, Met Office open-sea wave heights, the sea-state cue, the map barb, the CE categories D, C, B and A, and the 15 m/s coastal gale-warning line inside the force-7 band.',
        keyFacts: ['Force 4 moderate breeze 5.5-7.9 m/s; 5 fresh breeze 8.0-10.7; 6 strong breeze 10.8-13.8; 7 near gale 13.9-17.1; 8 gale 17.2-20.7', 'Scale runs from force 0 (calm) to force 12 (hurricane, 32.7 m/s or more)', 'MET coastal gale warning at 15 m/s mean wind; fishing banks at 20 m/s', 'CE categories: D up to force 4 / 0.3 m, C up to force 6 / 2 m, B up to force 8 / 4 m, A above that', 'Near gale (force 7) is "dangerous for small boats" according to MET'],
        check: { id: 'weather-c3', q: 'Your boat is CE design category C. The forecast says 16 m/s. Is the boat designed for this?', options: ['Yes, category C covers up to force 8', 'Yes, 16 m/s is only force 5', 'No, 16 m/s is force 7 (near gale) and category C is designed for up to force 6', 'No, category C is only for sheltered waters up to force 2'], answer: 2, explanation: '16 m/s lies in the near-gale band (13.9-17.1 m/s, force 7). Category C covers up to force 6 and 2 m significant waves; B covers up to force 8 (F21, F27).' },
      },
      // 4 ------------------------------------------------------------
      {
        id: 'pressure',
        title: 'Highs, lows and the barometer',
        html: `<p>Wind is air moving from high pressure towards low pressure, bent by the rotation of the Earth. That one sentence explains the weather map. In the northern hemisphere air circulates <strong>anticlockwise and slightly inwards around a low</strong> and <strong>clockwise and slightly outwards around a high</strong>. Air converging into a low has nowhere to go but up; rising air cools, forms cloud and rain, so a low means unsettled, often windy weather. Air sinking in a high dries and warms, so a high means settled, fair weather with light winds (though in summer the clear nights give big temperature swings and in winter a high can bring fog).</p>
<p>The lines on the map are <strong>isobars</strong>, lines of equal pressure. <strong>The closer together the isobars, the stronger the wind.</strong> Standard sea-level pressure is <strong>1013 hPa</strong>; a deep winter low may read 960 hPa, a summer high 1030 hPa.</p>
<div class="callout rule"><p><strong>Buys Ballot's law</strong> (northern hemisphere): stand with your <strong>back to the wind</strong> and the <strong>low pressure is on your left</strong>, a little ahead of you; the high is on your right. It tells you where the bad weather sits and which way it is likely to move.</p></div>
<p>A barometer on board reads the trend. A <strong>falling barometer announces an approaching low</strong>: wind and rain. A rising barometer means improving weather. Speed matters as much as direction. The Met Office terms used in shipping forecasts: "falling slowly" is 0.1 to 1.5 hPa in three hours, "falling quickly" 3.6 to 6.0 hPa in three hours, and "falling very rapidly" more than 6 hPa in three hours. A drop of 7 hPa between breakfast and lunch is a reason to be back in harbour by the afternoon.</p>
<p>Two more words the forecast uses for how the wind changes direction: <strong>veering</strong> is a clockwise change (south-west to west to north-west), <strong>backing</strong> is anticlockwise (west to south-west to south). In Norway the wind usually veers as a front passes and backs ahead of an approaching low.</p>
<div class="callout tip"><p>Clockwise = "veer" and also = "high". If you picture the clock face around an H you have both facts in one image; the L runs the other way.</p></div>`,
        illustration: () => pressureSystems(),
        caption: 'Left: a low with closely spaced isobars, air spiralling anticlockwise and inwards. Right: a high with wider isobars, air spiralling clockwise and outwards. Below: Buys Ballot, back to the wind, low on the left.',
        keyFacts: ['Low: anticlockwise and inwards, rising air, cloud, rain, wind. High: clockwise and outwards, sinking air, fair weather', 'Closer isobars = stronger wind; standard pressure 1013 hPa', 'Buys Ballot: back to the wind, the low is on your LEFT (northern hemisphere)', 'Falling barometer = approaching low; "falling quickly" = 3.6-6.0 hPa in 3 h, "very rapidly" = more than 6 hPa in 3 h', 'Veering = clockwise change of wind direction; backing = anticlockwise'],
        check: { id: 'weather-c4', q: 'You stand on deck with the wind on your back. Where, according to Buys Ballot, is the centre of low pressure?', options: ['Directly ahead of you', 'On your right-hand side', 'On your left-hand side, slightly ahead', 'Directly behind you'], answer: 2, explanation: 'In the northern hemisphere air flows anticlockwise around a low, so with the wind at your back the low lies to your left and a little ahead (F39, F40).' },
      },
      // 5 ------------------------------------------------------------
      {
        id: 'fronts',
        title: 'Fronts and the signs of bad weather',
        html: `<p>A front is the boundary between two air masses. Lows that reach Norway from the Atlantic usually carry a <strong>warm front</strong> followed by a faster <strong>cold front</strong>, and each has a recognisable sequence you can read from the cockpit hours before the wind arrives.</p>
<p><strong>Warm front</strong> (on the chart a red line with semicircles pointing the way it moves). The warm air slides up over the cold air ahead of it on a very shallow slope, so the first signs appear high up and far ahead: thin wisps of <strong>cirrus</strong>, then a milky veil of <strong>cirrostratus</strong> that puts a <strong>halo around the sun or moon</strong>, then a grey <strong>altostratus</strong> layer and finally dark <strong>nimbostratus</strong> with steady rain. The rain can start up to 300 km ahead of the front. Meanwhile the barometer falls steadily and the wind backs towards south or south-east. When the front passes, the wind <strong>veers</strong>, the temperature rises and the pressure steadies.</p>
<p><strong>Cold front</strong> (blue line with triangles). It moves faster and is steeper, so the change is sharp: a narrow band of heavy, sometimes thundery showers from towering cumulonimbus, a sudden <strong>veer</strong> of the wind (typically south-west to north-west in Norway), the barometer turning from falling to rising, a temperature drop and then clearing skies with showers. An <strong>occluded front</strong> (purple, alternating symbols) is a cold front that has caught up with the warm front.</p>
<div class="callout rule"><p>Classic signs of deteriorating weather for a skipper: a halo round the sun or moon; cloud thickening and lowering; a falling barometer; wind backing to south or south-east; a long swell arriving before the wind; and towering cumulonimbus building on a warm afternoon.</p></div>
<p>One winter hazard deserves a name: the <strong>polar low</strong>. These small, intense lows (200 to 500 km across) form over the Norwegian and Barents Seas from October to May, peaking December to March, and can take the wind from near calm to storm force in less than ten minutes, with heavy snow showers. Their average observed peak wind is 22 m/s (strong gale). They matter from the Trondelag coast northwards; in winter there, treat a forecast of polar lows as a day ashore.</p>`,
        illustration: () => warmFront(),
        caption: 'Warm front seen from the side, moving towards the west (left). Cirrus and the cirrostratus halo come first, high and far ahead; altostratus and rain-bearing nimbostratus follow as the cloud base lowers. The wind backs and the barometer falls ahead of the front, then veers as it passes.',
        keyFacts: ['Warm front: red line with semicircles; cirrus, cirrostratus (halo), altostratus, nimbostratus; steady rain, falling barometer, wind veers at passage', 'Cold front: blue line with triangles; heavy showers, sharp veer (SW to NW), pressure rises, clearing', 'Symbols on a front point in the direction it moves', 'Signs of bad weather: halo, lowering cloud, falling barometer, backing wind, rising swell, towering cumulonimbus', 'Polar lows: small intense winter lows (Oct-May) over northern waters; calm to storm force in under 10 minutes'],
        check: { id: 'weather-c5', q: 'Morning: wind south-east, barometer falling steadily, a halo around the sun and the cloud slowly thickening. What is the most likely development?', options: ['A high is building; the day will stay fine', 'A warm front is approaching: steady rain and wind that will veer to south-west', 'A sea breeze will set in from the sea by noon', 'Radiation fog will form within the hour'], answer: 1, explanation: 'Halo (cirrostratus), thickening cloud, a steadily falling barometer and a backed south-easterly are the textbook warm-front approach (F46, F48). Expect rain and a veer to the south-west when it passes.' },
      },
      // 6 ------------------------------------------------------------
      {
        id: 'local-winds',
        title: 'Local winds: sea breeze, land breeze, fjord effects',
        html: `<p>The national forecast can say "light breeze" and still leave you fighting 20 knots in the afternoon. The reason is local wind, and the exam asks about three kinds.</p>
<p><strong>The sea breeze.</strong> On a sunny day the land heats much faster than the sea. Warm air rises over the land, pressure there drops a little, and cooler air from the sea flows in to replace it: an <strong>onshore wind</strong>, blowing from sea to land. It needs sunshine and a weak background wind, sets in during the late morning, is <strong>strongest in the afternoon to early evening</strong> and dies away in the evening when the sun stops heating the land. Along the Norwegian coast the convergence of air along the shore commonly makes it <strong>15 to 25 knots</strong> (8 to 13 m/s) on a hot summer afternoon, enough to make an open crossing unpleasant. Through the afternoon the sea breeze <strong>veers</strong> (turns clockwise, because of the Earth's rotation) from blowing straight onshore towards blowing nearly along the coast; in many fjords it instead keeps blowing inland, up the fjord.</p>
<p><strong>The land breeze.</strong> At night the land cools faster than the sea and the circulation reverses: a weak <strong>offshore</strong> breeze flows out over the water. It is much weaker than the sea breeze and is often barely noticeable.</p>
<p><strong>Channelling and fall winds.</strong> Weak winds tend to follow the line of a coast, fjord or valley, so a fjord often has wind along its axis and a sound can accelerate it. More dangerous is the <strong>fall wind</strong>: when a strong wind crosses a mountain range it is forced down the lee side in violent, turbulent gusts that strike the water under steep fjord sides, even when the fjord looked sheltered. A related phenomenon is the katabatic wind, cold dense air draining down slopes under gravity, mostly on clear nights and in winter.</p>
<div class="callout tip"><p>Plan an open crossing in a small boat for the morning or the evening on a hot summer day. The morning forecast of 2 m/s says nothing about the sea breeze that will be blowing at 16:00.</p></div>`,
        illustration: () => seaBreeze(),
        caption: 'Day: the land warms, air rises over it and cool sea air flows onshore as the sea breeze, strongest in the afternoon. Night: the land cools and a weak land breeze flows offshore.',
        keyFacts: ['Sea breeze: onshore (sea to land), sunny weather with weak background wind, sets in late morning, strongest afternoon, dies at sunset', 'Norwegian coast: sea breeze commonly 15-25 knots on a hot afternoon', 'The sea breeze veers (clockwise) during the afternoon', 'Land breeze: weak offshore wind at night', 'Fall wind: strong wind crossing mountains strikes down the lee side in violent gusts under steep fjord sides'],
        check: { id: 'weather-c6', q: 'Which statement about the sea breeze on a sunny Norwegian summer day is correct?', options: ['It blows from land to sea and is strongest at dawn', 'It blows from sea to land and is strongest in the afternoon', 'It only occurs when a strong gradient wind is already blowing', 'It is always weaker than 5 knots'], answer: 1, explanation: 'The sea breeze is an onshore wind driven by land heating, needs weak background wind, and peaks in the afternoon, often at 15-25 knots on the Norwegian coast (F50, F52). The night-time land breeze is the weak offshore one (F53).' },
      },
