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
