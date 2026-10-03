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
    [5, 'Fresh breeze', '8.0-10.7', '17-21', '2', 'many white horses'],
    [6, 'Strong breeze', '10.8-13.8', '22-27', '3', 'foam crests everywhere'],
    [7, 'Near gale', '13.9-17.1', '28-33', '4', 'foam blown in streaks'],
    [8, 'Gale', '17.2-20.7', '34-40', '5.5', 'high waves, spindrift'],
    [9, 'Strong gale', '20.8-24.4', '41-47', '7', 'spray cuts visibility'],
    [10, 'Storm', '24.5-28.4', '48-55', '9', 'very high, white sea'],
    [11, 'Violent storm', '28.5-32.6', '56-63', '11.5', 'exceptionally high'],
    [12, 'Hurricane', '32.7+', '64+', '14+', 'air filled with foam'],
  ];
  const BF_BG = ['#e8f5e9', '#e8f5e9', '#e8f5e9', '#e8f5e9', '#c8e6c9', '#fff176', '#ffb300', '#fb8c00', '#e65100', '#c62828', '#c62828', '#c62828', '#4a0000'];
  const BF_FG = ['#2e7d32', '#2e7d32', '#2e7d32', '#2e7d32', '#1b5e20', '#5d4037', '#3e2723', '#3e2723', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'];
  const BF_KN = [0, 0, 5, 10, 15, 20, 25, 30, 35, 45, 50, 60, 65]; // barb values per IL-1 spec
  function beaufortStrip(o) {
    o = o || {};
    const W = 640, H = 530, y0 = 64, rh = 28, x0 = 12, tw = 548;
    let s = T(W / 2, 20, 'The Beaufort scale as MET Norway uses it (mean wind, 10-minute average)', { size: 14, weight: 700 });
    const cols = [[x0 + 16, 'F', 'middle'], [x0 + 36, 'Name', 'start'], [x0 + 150, 'm/s', 'start'], [x0 + 232, 'knots', 'start'], [x0 + 296, 'wave m', 'start'], [x0 + 346, 'what the sea looks like', 'start'], [x0 + 512, 'barb', 'middle']];
    cols.forEach(([x, l, a]) => s += T(x, y0 - 12, l, { size: 10, weight: 700, fill: MUTED, anchor: a }));
    BEAUFORT.forEach((r, i) => {
      const y = y0 + i * rh;
      s += rect(x0, y, tw, rh - 2, BF_BG[i], 'none', { rx: 3 });
      const fg = BF_FG[i];
      s += T(x0 + 16, y + rh / 2 - 1, String(r[0]), { size: 13, weight: 700, fill: fg });
      s += T(x0 + 36, y + rh / 2 - 1, r[1], { size: 12, weight: 700, fill: fg, anchor: 'start' });
      s += T(x0 + 150, y + rh / 2 - 1, r[2], { size: 11.5, fill: fg, anchor: 'start' });
      s += T(x0 + 232, y + rh / 2 - 1, r[3], { size: 11.5, fill: fg, anchor: 'start' });
      s += T(x0 + 296, y + rh / 2 - 1, r[4], { size: 11.5, fill: fg, anchor: 'start' });
      s += T(x0 + 346, y + rh / 2 - 1, r[5], { size: 10.5, fill: fg, anchor: 'start' });
      if (BF_KN[i] > 0) s += barb(x0 + 494, y + rh / 2 + 2, 0, BF_KN[i], fg, 42);
      else s += line(x0 + 494, y + rh / 2, x0 + 536, y + rh / 2, fg, { sw: 1.2, dash: '2 3' });
    });
    // gale warning marker between row 6 and row 7
    const gy = y0 + 7 * rh - 1;
    s += line(x0, gy, x0 + tw, gy, BAD, { sw: 2.5, dash: '8 4' });
    s += rect(x0 + 150, gy - 9, 190, 18, PAPER, BAD, { rx: 3, sw: 1 }) + T(x0 + 245, gy, 'MET coastal gale warning: 15 m/s', { size: 10, weight: 700, fill: BAD });
    // CE brackets on the right
    const bx = x0 + tw + 14;
    const br = [[0, 4, 'D'], [0, 6, 'C'], [0, 8, 'B'], [9, 12, 'A']];
    br.forEach(([a, b, l], k) => {
      const x = bx + k * 17, ya = y0 + a * rh + 2, yb = y0 + (b + 1) * rh - 4;
      s += `<path d="M${x + 6},${ya} h-5 V${yb} h5" fill="none" stroke="${INK2}" stroke-width="1.5"/>`;
      s += T(x + 1, yb + 11, l, { size: 11, weight: 700, fill: INK2 });
    });
    s += T(bx + 26, y0 - 12, 'CE', { size: 10, weight: 700, fill: MUTED });
    s += lines(W / 2, H - 56, ['CE design category (builder\'s plate): D up to force 4 and 0.3 m waves; C up to force 6 and 2 m;', 'B up to force 8 and 4 m; A above force 8 and 4 m.', 'MET issues a coastal gale warning at 15 m/s mean wind, inside the force-7 (near gale) band;', 'MET calls near gale "dangerous for small boats".'], { size: 10.5, fill: INK2, lh: 14 });
    return S.svg(W, H, s, { label: 'Beaufort scale 0 to 12 with m/s, knots, wave heights, sea state, wind barbs, CE categories and the gale-warning threshold' });
  }

  // ---------- IL-2 Low and high pressure, northern hemisphere (F39-F42) ----------
  function pressureSystems(o) {
    o = o || {};
    const W = 640, H = 480;
    let s = T(W / 2, 20, 'Northern hemisphere: anticlockwise into a LOW, clockwise out of a HIGH', { size: 14, weight: 700 });
    function system(cx, cy, low) {
      let g = T(cx, cy - 168, 'N', { size: 12, weight: 700, fill: INK2 }) + arrow([[cx, cy - 140], [cx, cy - 158]], INK2, { sw: 1.5, head: 7 });
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
    s += rect(150, by - 30, 340, 66, SHALLOW, 'none');
    s += arrow([[198, by], [236, by]], SEA, { sw: 2.5 }) + T(190, by - 14, 'wind', { size: 10, fill: SEA, weight: 700 });
    s += `<circle cx="252" cy="${by}" r="9" fill="${INK2}"/>` + line(252, by - 9, 252, by - 14, INK2, { sw: 3 });
    s += T(252, by + 30, 'you, back to the wind', { size: 9.5, fill: MUTED });
    s += T(266, by - 16, 'L', { size: 18, weight: 800, fill: LOWRED }) + T(232, by + 14, 'H', { size: 18, weight: 800, fill: HIGHBLUE });
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
    s += T(572, 120, 'WARM AIR', { size: 12, weight: 700, fill: LOWRED }) + T(110, 150, 'COLD AIR', { size: 12, weight: 700, fill: HIGHBLUE });
    // clouds along the slope
    s += `<g stroke="${INK2}" stroke-width="1.4" fill="none">${[[40, 62], [52, 58], [64, 66]].map(([x, y]) => `<path d="M${x},${y} q10,-6 22,-2"/>`).join('')}</g>` + T(58, 82, 'cirrus', { size: 9.5, fill: MUTED });
    s += rect(120, 58, 130, 10, '#e0e0e0', 'none', { rx: 5 }) + sun(185, 50, 7) + `<circle cx="185" cy="50" r="15" fill="none" stroke="${SUN}" stroke-width="1.2" opacity="0.8"/>` + T(185, 82, 'cirrostratus (halo)', { size: 9.5, fill: MUTED });
    s += rect(230, 100, 150, 22, '#bdbdbd', 'none', { rx: 8 }) + T(305, 136, 'altostratus', { size: 9.5, fill: MUTED });
    s += rect(330, 140, 190, 48, '#757575', 'none', { rx: 10 }) + T(425, 130, 'nimbostratus, steady rain', { size: 9.5, fill: MUTED });
    for (let i = 0; i < 8; i++) s += line(345 + i * 22, 192, 341 + i * 22, 214, HIGHBLUE, { sw: 1.3 });
    // ground, sea, front symbol
    s += rect(20, gy, 600, 6, WATER, 'none', { rx: 0 });
    s += line(20, gy + 3, 620, gy + 3, WATER2, { sw: 1 });
    // surface front: red line with semicircles pointing left (direction of movement)
    for (let i = 0; i < 4; i++) s += `<path d="M${215 + i * 26},${gy - 1} a8,8 0 0 0 -16,0 Z" fill="${LOWRED}"/>`;
    s += arrow([[200, gy - 22], [150, gy - 22]], LOWRED, { sw: 2 }) + T(176, gy - 34, 'front moves this way', { size: 9.5, fill: LOWRED });
    s += lines(110, gy + 24, ['Ahead: wind S to SE, backing;', 'barometer falling; swell building'], { size: 10.5, fill: INK2, lh: 13 });
    s += lines(470, gy + 24, ['Behind: wind veers to SW, warmer,', 'barometer steadies, drizzle'], { size: 10.5, fill: INK2, lh: 13 });
    s += T(30, H - 8, 'West (ahead of the front)', { size: 9.5, fill: MUTED, anchor: 'start' }) + T(610, H - 8, 'East (behind the front)', { size: 9.5, fill: MUTED, anchor: 'end' });
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
        s += arrow([[420, y + 24], [140, y + 24]], '#607d8b', { sw: 1.6, dash: '5 4' }) + T(280, y + 36, 'return flow aloft', { size: 9.5, fill: '#455a64' });
        s += T(60, y + 60, 'H', { size: 22, weight: 800, fill: HIGHBLUE }) + T(60, y + 80, 'cool', { size: 10, fill: '#37474f' });
        s += T(600, y + 76, 'L', { size: 22, weight: 800, fill: LOWRED }) + T(600, y + 96, 'warm', { size: 10, fill: '#37474f' });
      } else {
        s += `<circle cx="70" cy="${y + 34}" r="13" fill="#eceff1"/><circle cx="78" cy="${y + 30}" r="11" fill="#1a2b4a"/>`;
        for (let i = 0; i < 3; i++) s += arrow([[440 + i * 40, gy - 72], [440 + i * 40, gy - 26]], '#64b5f6', { sw: 2 });
        s += T(480, gy - 86, 'land cools', { size: 10, fill: '#90caf9', weight: 700 });
        s += arrow([[300, gy - 18], [120, gy - 18]], '#90caf9', { sw: 3.5, head: 11 });
        s += T(210, gy - 36, 'LAND BREEZE (offshore), weak', { size: 12, weight: 800, fill: '#e3f2fd' });
        s += arrow([[140, y + 24], [420, y + 24]], '#90a4ae', { sw: 1.4, dash: '5 4' }) + T(280, y + 36, 'return flow aloft', { size: 9.5, fill: '#cfd8dc' });
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
      s += arrow([[200, y + 46], [440, y + 46]], INK2, { sw: 5, head: 14 }) + T(320, y + 32, 'Wind 10 m/s from the west', { size: 11, weight: 700, fill: INK2 });
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
    for (let x = 50; x <= 590; x += 4) { const A = 3 + (x - 50) / 540 * 13; const L = 80 - (x - 50) / 540 * 40; const ph = (x - 50) / L * Math.PI * 2; d += ` L${x},${(sy - A * Math.sin(ph)).toFixed(1)}`; }
    s += `<path d="${d} L590,${y + 68} L470,${y + 78} L300,${y + 100} L50,${y + 112} Z" fill="${WATER}" stroke="${WATER2}" stroke-width="1.5"/>`;
    s += `<path d="M520,${sy - 20} q8,-4 16,3" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/><path d="M560,${sy - 20} q8,-4 16,3" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>`;
    s += arrow([[60, y + 34], [170, y + 34]], INK2, { sw: 3 }) + T(115, y + 46, 'wind and waves', { size: 10, fill: INK2 });
    s += lines(330, y + 28, ['waves break when the depth is only', 'about 1.3 x the wave height'], { size: 10.5, fill: INK2, lh: 12, weight: 600 });
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
    const lv = [[yHAT, 'HAT  highest astronomical tide', MUTED, '3 4'], [yHAT + 30, 'MHWS  mean high water springs', MUTED, '3 4'], [(yHAT + yLAT) / 2, 'MSL  mean sea level', MUTED, '3 4'], [yLAT - 28, 'MLWS  mean low water springs', MUTED, '3 4'], [yLAT, 'LAT = CHART DATUM', INK, null]];
    lv.forEach(([y, l, col, dash]) => { s += line(x0, y, x1 + 8, y, col, { sw: dash ? 1 : 2.5, dash }); s += T(x1 + 14, y, l, { size: 10.5, fill: col, anchor: 'start', weight: dash ? 500 : 700 }); });
    s += line(x0, yNow, x1 + 8, yNow, INK2, { sw: 1.5 }) + T(x1 + 14, yNow, 'water level now', { size: 10.5, fill: INK2, anchor: 'start', weight: 700 });
    s += T(x1 + 14, yLAT + 13, 'zero for charted depths and tide heights', { size: 9.5, fill: MUTED, anchor: 'start' });
    // dimension arrows
    const dx = 40;
    s += arrow([[dx, yLAT], [dx, ySea - 2]], INK2, { sw: 1.5, head: 7 }) + arrow([[dx, ySea], [dx, yLAT + 2]], INK2, { sw: 1.5, head: 7 });
    s += `<g transform="rotate(-90 ${dx - 10} ${(yLAT + ySea) / 2})">${T(dx - 10, (yLAT + ySea) / 2, 'charted depth', { size: 10, weight: 700, fill: INK2 })}</g>`;
    s += arrow([[dx + 25, yLAT], [dx + 25, yNow + 2]], OK, { sw: 1.5, head: 7 }) + arrow([[dx + 25, yNow], [dx + 25, yLAT - 2]], OK, { sw: 1.5, head: 7 });
    s += `<g transform="rotate(-90 ${dx + 15} ${(yLAT + yNow) / 2})">${T(dx + 15, (yLAT + yNow) / 2, 'height of tide', { size: 10, weight: 700, fill: OK })}</g>`;
    s += rect(x1 + 14, 250, 216, 44, PAPER2, LINE) + lines(x1 + 122, 264, ['depth now = charted depth + height of tide', '(plus or minus the weather effect)'], { size: 10.5, weight: 700, lh: 14 });
    s += lines(x1 + 122, 310, ['Chart datum = LAT, except inner Oslofjord', '(30 cm below LAT) and Swedish border', 'to Utsira (20 cm below LAT).'], { size: 9.5, fill: MUTED, lh: 12 });
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
      // 7 ------------------------------------------------------------
      {
        id: 'waves',
        title: 'Waves: height, steepness and where they break',
        html: `<p>Wind does not sink boats; waves do. The size of wind waves depends on four things: the <strong>wind speed</strong>, the <strong>fetch</strong> (the uninterrupted stretch of water the wind has blown over), the <strong>duration</strong> the wind has blown, and the <strong>water depth</strong>. That is why a force 6 in a narrow fjord gives a short chop while the same wind over the open sea builds 3 m waves, and why swell from a North Sea storm can break on the coast on a windless day.</p>
<p>The figure in a forecast is the <strong>significant wave height</strong>: the average height of the <strong>highest third</strong> of the waves. It is not the biggest wave. Individual waves regularly reach <strong>almost twice</strong> the significant height, so a forecast of 1.5 m means you must expect waves approaching 3 m. BarentsWatch shows both the significant and the maximum height for exactly this reason.</p>
<p>Waves become dangerous when they are <strong>steep</strong>, not merely high. In deep water a wave breaks when its height reaches roughly one seventh of its length. In <strong>shallow water</strong> the wave slows at its base while the crest keeps going, so it steepens, shortens and breaks when the depth is only about <strong>1.3 times the wave height</strong> (roughly when the depth falls below twice the significant height). Refraction bends wave crests towards shallows and concentrates their energy on headlands, shoals, bars and harbour entrances, the places where a boat is also closest to rock.</p>
<p>A <strong>current</strong> changes wave shape too. <strong>Wind against the current compresses the waves: shorter, steeper, breaking.</strong> Wind with the current stretches them out: longer and lower. Tidal sounds and river mouths are therefore worst when the stream runs against the wind, and calmest at the turn.</p>
<div class="callout warn"><p>A <strong>lee shore</strong> is the shore downwind of you, the one the wind blows onto. It is the dangerous one: waves are biggest and break there, and wind and sea push a drifting or disabled boat onto it. The <strong>weather shore</strong>, upwind, gives shelter and small waves. Candidates often reverse these.</p></div>
<div class="callout tip"><p>Course guidance for small boats (not law): under 0.5 m is calm, 0.5 to 1 m comfortable, 1 to 1.5 m noticeable motion, 1.5 to 2.5 m experienced skippers only, above 2.5 m stay ashore.</p></div>`,
        illustration: () => windCurrent(),
        caption: 'Same wind, different sea. With the current the waves are long and low; against the current they are short, steep and breaking. In shallow water waves grow, steepen and break once the depth is about 1.3 times the wave height.',
        keyFacts: ['Wave size depends on wind speed, fetch, duration and depth', 'Significant wave height = average of the highest third; single waves reach almost twice that (1.5 m forecast means waves near 3 m)', 'Waves break in shallow water when depth is about 1.3 x wave height; deep-water steepness limit about 1:7', 'Wind against current: shorter, steeper, breaking waves. Wind with current: longer, lower', 'Lee shore = downwind shore the wind blows onto: dangerous. Weather shore = upwind, sheltered'],
        check: { id: 'weather-c7', q: 'The wind is from the north. A tidal stream runs north at 3 knots through the sound you must pass. What sea do you expect in the sound, and when is it safest?', options: ['Long, low waves; it is safest at maximum stream', 'Short, steep, breaking waves; safest at slack water when the stream turns', 'No change; current does not affect waves', 'Smaller waves because the current carries them away'], answer: 1, explanation: 'A stream running north meets wind blowing from the north, i.e. towards the south: wind against current, which compresses and steepens the waves (F35). Pass at slack water around the turn of the tide (F87).' },
      },
      // 8 ------------------------------------------------------------
      {
        id: 'thunder',
        title: 'Thunderstorms and squalls',
        html: `<p>A towering cumulonimbus on a warm summer afternoon is a weather system of its own: lightning, hail, a wall of rain and, for a small boat most dangerous of all, a <strong>sudden squall</strong>. The rule of thumb from Norwegian boating practice is simple: <strong>the bigger and darker the cloud, the more wind and rain to expect</strong>. The wind is strongest at the front and sides of the cloud, arrives suddenly, <strong>before the rain starts</strong>, and is usually short-lived, often followed by calm behind the cloud.</p>
<p>Judge the distance with the <strong>flash-to-thunder count</strong>: count the seconds between the lightning and the thunder and <strong>divide by three for kilometres</strong>. Three seconds is about 1 km, nine seconds about 3 km. If the count is shrinking, the storm is coming towards you.</p>
<div class="callout rule"><p>MET's advice: postpone swimming and being on the water until the thunderstorm has passed. If you are caught out, <strong>get to shore</strong>; if you cannot, the safest place is an enclosed space with continuous metal on all sides (a metal hull or cabin), keeping your distance from the metal itself. <strong>Never hold the mast</strong> or large metal parts, and avoid anything that conducts electricity.</p></div>
<p>Practical seamanship adds: everyone into the cabin or, in an open boat, low in the middle of the boat; lifejackets on; switch off the VHF and phones; reduce speed and take the squall with the <strong>bow into the waves</strong>, or head for the nearest safe harbour before it hits. Remember that MET's lightning warnings are yellow only and are <strong>not issued for showers over the sea</strong>, so the absence of a warning says nothing about your risk out on the water.</p>
<p>The same afternoon heating that drives thunderstorms also drives the sea breeze, so a hot, humid summer day with cloud towers growing over the hills inland is a day to be back in harbour by mid-afternoon.</p>`,
        keyFacts: ['Bigger and darker cloud = more wind and rain; the squall hits before the rain, suddenly and briefly', 'Seconds from flash to thunder divided by 3 = kilometres (9 s = about 3 km)', 'Get to shore; otherwise stay inside a metal hull or cabin away from the metal; never hold the mast', 'Lifejackets on, reduce speed, bow to the waves, VHF and phones off', 'MET lightning warnings are yellow only and are not issued for showers over the sea'],
        check: { id: 'weather-c8', q: 'You see lightning and count six seconds before the thunder. How far away is the storm?', options: ['About 600 m', 'About 2 km', 'About 6 km', 'About 18 km'], answer: 1, explanation: 'Divide the seconds by three to get kilometres: 6 / 3 = 2 km (F57). Head for shelter now.' },
      },
      // 9 ------------------------------------------------------------
      {
        id: 'fog',
        title: 'Fog, visibility and what the Rules demand',
        html: `<p><strong>Fog</strong> is visibility below <strong>1 km (1000 m)</strong>; when water droplets reduce visibility but you can still see more than 1 km it is <strong>mist</strong>. Marine forecasts grade visibility as good (more than 5 nautical miles), moderate (2 to 5 nm), poor (1000 m to 2 nm) and very poor (under 1000 m, i.e. fog).</p>
<p>Three kinds of fog matter on the Norwegian coast. <strong>Advection fog</strong> (sea fog) forms when warm, moist air flows over colder water and cools to its dew point. It is typical in <strong>spring and summer</strong>: on a fine day with an offshore wind the fog forms some way off the coast and is then carried in by the afternoon sea breeze. Because it is fed by the air flow <strong>it persists in wind</strong>. <strong>Radiation fog</strong> forms on calm, clear nights and mornings when the ground cools, mostly inland and in autumn; it drifts out over sheltered fjords and harbours and burns off soon after sunrise. <strong>Sea smoke</strong> is winter fog formed when very cold air flows over warmer water.</p>
<p>The Rules of the Road call all of this <strong>restricted visibility</strong> (Rule 3: fog, mist, falling snow, heavy rain and similar). In it every vessel must proceed at a <strong>safe speed</strong> adapted to the conditions, and a power-driven vessel must have her <strong>engines ready for immediate manoeuvre</strong> (Rule 19). If you hear another vessel's fog signal apparently forward of your beam, reduce to the minimum speed at which you can hold your course, and if necessary take all way off. Navigation lights must be switched on (Rule 20).</p>
<div class="callout rule"><p>Rule 35 sound signals, all at intervals of <strong>not more than 2 minutes</strong>: a power-driven vessel <strong>making way</strong> sounds <strong>one prolonged blast</strong>; <strong>underway but stopped</strong>, <strong>two prolonged blasts</strong> about two seconds apart. A vessel <strong>under 12 m</strong> need not give these particular signals but must then make <strong>some other efficient sound signal</strong> at intervals of not more than 2 minutes.</p></div>
<p>The fog drill for a small boat: slow down, lights on, sound signals, a lookout posted, stop the engine now and then to listen, hoist the radar reflector, fix your position and move out of the fairway or anchor until it clears.</p>`,
        illustration: () => S.soundSignal('-'),
        caption: 'One prolonged blast (4 to 6 s) at intervals of not more than 2 minutes: a power-driven vessel making way in restricted visibility (Rule 35(a)). Stopped: two prolonged blasts. Under 12 m: any efficient sound signal every 2 minutes at most.',
        keyFacts: ['Fog = visibility under 1 km; mist = reduced but over 1 km', 'Advection (sea) fog: warm moist air over cold water, spring and summer, persists in wind. Radiation fog: calm clear nights, burns off after sunrise. Sea smoke: very cold air over warmer water in winter', 'Restricted visibility: safe speed, engines ready for immediate manoeuvre, navigation lights on (Rules 19 and 20)', 'Fog signals every 2 minutes at most: 1 prolonged = making way; 2 prolonged = stopped; under 12 m any efficient sound signal', 'Fog signal heard forward of the beam: reduce to minimum steering speed, stop if necessary'],
        check: { id: 'weather-c9', q: 'Your 7 m motorboat is caught in fog. Which statement about sound signals is correct?', options: ['Boats under 12 m are exempt from all sound signals in fog', 'You must sound one prolonged blast every minute', 'You must make some efficient sound signal at intervals of not more than 2 minutes', 'You must sound a bell continuously'], answer: 2, explanation: 'Rule 35(j): a vessel under 12 m need not give the prescribed signals but must make some other efficient sound signal at intervals of not more than 2 minutes (F66).' },
      },
      // 10 -----------------------------------------------------------
      {
        id: 'tides',
        title: 'Tides: why, when and how much',
        html: `<p>The tide is the regular rise and fall of the sea caused by the gravitational pull of the <strong>moon and the sun</strong>. The moon's effect is about 7/3 of the sun's, so the lunar rhythm dominates: <strong>two high waters and two low waters per lunar day of 24 h 50 min</strong>. Successive high waters are therefore about <strong>12 h 25 min</strong> apart, and high water comes about <strong>50 minutes later each day</strong>.</p>
<p>The range changes through the month. When sun and moon pull in line, at <strong>new moon and full moon</strong>, their effects add up and we get <strong>spring tides</strong>, the largest range. At half moon they pull at right angles and we get <strong>neap tides</strong>, the smallest range. Spring tides have nothing to do with the season; they come every fortnight all year. From western Norway northwards the spring peak arrives <strong>1 to 2 days after</strong> new or full moon; on the south coast and in the Oslofjord the spring period comes <strong>2 to 4 days before</strong> it.</p>
<p>Norway's tides are very uneven. Near <strong>Egersund</strong> lies an <strong>amphidromic point</strong> where the range is almost zero, so along the whole Skagerrak coast and in the Oslofjord the tide is only a few tens of centimetres: Mandal 0.50 m, Oslo 0.72 m. From Stavanger the range grows steadily northwards: Bergen 1.8 m, Kristiansund 2.65 m, Harstad 2.68 m, Narvik 3.82 m, Vadso 3.97 m, with the largest range in Norway at Nesseby in inner Varangerfjord. In the south-east the <strong>weather often dominates over the small tide</strong>, so the real water level can be far from the tide table and even the times of high and low water shift.</p>
<p>The official tide tables and predictions come from the Norwegian Mapping Authority's "Se havniva" service, based on 24 permanent tide gauges. Table heights are in centimetres above chart datum and times in Norwegian standard time (UTC+1); <strong>add one hour during summer time</strong>.</p>
<div class="callout tip"><p>Three numbers for the exam: 12 h 25 min between high waters, 50 minutes later each day, and spring tides at new and full moon. Then the geography: small in the south-east, near zero at Egersund, up to about 4 m in Finnmark.</p></div>`,
        illustration: () => tideRange(),
        caption: 'Tidal range at Norwegian ports. Only half a metre or so in the Skagerrak and Oslofjord, almost nothing at the amphidromic point near Egersund, growing to nearly 4 m in Finnmark.',
        keyFacts: ['Tides are caused by moon and sun; the moon dominates (about 7/3 of the sun)', 'Two highs and two lows per lunar day (24 h 50 min); high waters 12 h 25 min apart; about 50 min later each day', 'Spring tides (largest range) at new and full moon; neaps at half moon', 'Range: Oslo 0.72 m, Mandal 0.50 m, about zero at Egersund, Bergen 1.8 m, Narvik 3.82 m, Vadso 3.97 m; largest at Nesseby', 'Tide-table times are standard time (UTC+1): add 1 hour in summer time'],
        check: { id: 'weather-c10', q: 'High water in Bergen was at 08:10 today. At roughly what time is the first high water tomorrow morning?', options: ['08:10', '07:20', '09:00', '14:35'], answer: 2, explanation: 'High waters come about 12 h 25 min apart, so about 50 minutes later each day: 08:10 today becomes about 09:00 tomorrow (F74).' },
      },
      // 11 -----------------------------------------------------------
      {
        id: 'water-level',
        title: 'Chart datum, water level and tidal streams',
        html: `<p>The depth printed on a Norwegian chart is measured below <strong>chart datum</strong>, and chart datum is set at <strong>Lowest Astronomical Tide (LAT)</strong>, the lowest level the tide alone can produce. Two stretches of coast are set even lower because weather there often holds the water below LAT for a week or two: the inner Oslofjord (inside Drobak sound) uses <strong>30 cm below LAT</strong> and the coast from the Swedish border to Utsira <strong>20 cm below LAT</strong>. So the charted depth is a near-minimum, and the depth you have now is:</p>
<div class="callout rule"><p><strong>Depth now = charted depth + height of tide above chart datum, plus or minus the weather effect.</strong> A 1.5 m bar with 1.6 m of tide gives about 3.1 m at high water but only 1.7 m near a 0.2 m low water, and less in high pressure with an offshore wind.</p></div>
<p>The <strong>weather effect</strong> is what makes the water level differ from the tide table. Air pressure: a change of <strong>1 hPa moves the sea about 1 cm</strong>, with <strong>low pressure raising</strong> the level and high pressure lowering it, so a 960 hPa low lifts the sea about half a metre. Wind: strong <strong>onshore wind</strong> (on the Norwegian coast mainly from south and west) piles water up along the coast and into the fjords; offshore wind lowers it. Together they can move the level <strong>more than a metre</strong> either way, and in high pressure with offshore wind the water can fall below chart datum. The worst case is a <strong>storm surge</strong>: a deep low with onshore gale coinciding with spring tide, typically in winter. The Mapping Authority therefore recommends its five-day water-level forecast (tide plus weather) rather than the bare tide table.</p>
<p><strong>Tidal streams</strong> are the horizontal flow the tide creates. They are strongest in narrow sounds connecting large basins, reverse roughly every <strong>six hours</strong>, are strongest around spring tides and pause at <strong>slack water</strong> shortly after local high and low water. <strong>Saltstraumen</strong>, about 10 km south-east of Bodo, 150 m wide, is Norway's strongest tidal current and is often called the world's strongest; popular sources quote up to about 20 knots, while the Norwegian Pilot gives about 7 to 8 knots. The Coastal Administration issues automatic current warnings for Saltstraumen, Moskstraumen, Langesund, Rakkebaane and the Tonsberg-Tonne area. Rivers and melting snow add an outgoing surface current in fjords in spring. And remember the wave rule: wind against the stream makes the sea short and steep.</p>`,
        illustration: () => chartDatum(),
        caption: 'Charted depths are measured down from chart datum (LAT, or 20 to 30 cm lower in the south-east). Add the height of tide and allow for the weather effect to find the depth you really have.',
        keyFacts: ['Chart datum = LAT, except inner Oslofjord 30 cm below LAT and Swedish border to Utsira 20 cm below LAT', 'Depth now = charted depth + height of tide, plus or minus weather', '1 hPa = about 1 cm: low pressure raises the sea, high pressure lowers it; onshore wind raises, offshore lowers; weather effect can exceed 1 m', 'Storm surge = deep low + onshore gale + spring tide, usually in winter', 'Tidal streams reverse about every 6 h, strongest at springs, weakest at slack water; Saltstraumen near Bodo is the strongest'],
        check: { id: 'weather-c11', q: 'The barometer stands at 1033 hPa and a steady wind blows off the land. Compared with the tide table, what water level should you expect?', options: ['Higher than the table, because high pressure pushes water towards the coast', 'About the same; weather does not affect the water level', 'Lower than the table, because high pressure and offshore wind both lower the level', 'Higher than the table, by about 20 cm from the pressure alone'], answer: 2, explanation: 'High pressure lowers the sea (about 1 cm per hPa, so roughly 20 cm below normal at 1033 hPa) and offshore wind pushes water away from the coast; together the level can fall below chart datum (F79, F80).' },
      },
    ],

    flashcards: [
      { front: 'Wind "from south-west" blows towards which direction?', back: 'North-east. Wind is always named by the direction it comes FROM.' },
      { front: 'On a weather map, where do the barbs sit on a wind arrow?', back: 'On the tail, the "from" end. Short barb 5 kn, long barb 10 kn, filled triangle 50 kn.' },
      { front: 'Forecast "mean wind" is averaged over how long?', back: '10 minutes. A gust is the 3-second peak, typically about 1.5 x the mean.' },
      { front: 'Quick conversion m/s to knots?', back: 'Multiply by 2 (exactly 1.94). 10 m/s is about 20 knots. 1 knot = 1852 m/h = 0.514 m/s.' },
      { front: 'Force 5 fresh breeze in m/s and knots?', back: '8.0-10.7 m/s, 17-21 knots. Open-sea waves about 2 m, many white horses.' },
      { front: 'Force 6 strong breeze in m/s?', back: '10.8-13.8 m/s (22-27 kn). Large waves, foam crests everywhere, about 3 m at sea.' },
      { front: 'Force 7 near gale in m/s?', back: '13.9-17.1 m/s (28-33 kn). MET calls it dangerous for small boats.' },
      { front: 'Force 8 gale in m/s?', back: '17.2-20.7 m/s (34-40 kn). Open-sea waves about 5.5 m.' },
      { front: 'Force 4 moderate breeze in m/s?', back: '5.5-7.9 m/s (11-16 kn), about 1 m waves, frequent white horses. Upper limit of CE category D.' },
      { front: 'MET coastal gale warning: threshold?', back: 'Mean wind expected to reach 15 m/s (inside the near-gale band). Fishing banks: 20 m/s. Only issued above 50 % probability.' },
      { front: 'CE design categories A, B, C, D?', back: 'A above force 8 and 4 m; B up to force 8 and 4 m; C up to force 6 and 2 m; D up to force 4 and 0.3 m.' },
      { front: 'Circulation around a LOW in the northern hemisphere?', back: 'Anticlockwise and slightly inwards. Rising air: cloud, rain, unsettled weather.' },
      { front: 'Circulation around a HIGH in the northern hemisphere?', back: 'Clockwise and slightly outwards. Sinking air: fair, settled weather, light winds.' },
      { front: "Buys Ballot's law?", back: 'Back to the wind (northern hemisphere): the low is on your left, slightly ahead; the high on your right.' },
      { front: 'What do closely spaced isobars mean?', back: 'Strong wind. Wide spacing means light wind. Standard sea-level pressure is 1013 hPa.' },
      { front: 'Barometer "falling quickly"?', back: 'A fall of 3.6-6.0 hPa in 3 hours; "very rapidly" is more than 6 hPa in 3 h. A falling barometer announces a low.' },
      { front: 'Veering vs backing?', back: 'Veering = wind direction changing clockwise (SW to NW). Backing = anticlockwise (W to S).' },
      { front: 'Cloud sequence ahead of a warm front?', back: 'Cirrus, cirrostratus (halo round the sun), altostratus, nimbostratus with steady rain; barometer falls, wind backs, then veers at the front.' },
      { front: 'What does a cold front bring?', back: 'A narrow band of heavy showers, a sharp veer (SW to NW), pressure turning to rise, colder air, then clearing.' },
      { front: 'Sea breeze: direction, cause, timing?', back: 'Onshore (sea to land). Land heats faster than the sea. Starts late morning, strongest in the afternoon, dies at sunset. Often 15-25 kn on the Norwegian coast.' },
      { front: 'Land breeze?', back: 'Weak offshore wind at night when the land cools faster than the sea.' },
      { front: 'Fall wind in a fjord?', back: 'Strong wind crossing mountains strikes down the lee side in sudden violent gusts under steep fjord sides.' },
      { front: 'Significant wave height?', back: 'Average height of the highest third of the waves. Single waves reach almost twice that: 1.5 m forecast means waves near 3 m.' },
      { front: 'Wind against current does what to waves?', back: 'Shortens and steepens them, making them break. Wind with the current stretches them: longer and lower.' },
      { front: 'When do waves break in shallow water?', back: 'When the depth is about 1.3 x the wave height (roughly below twice the significant height). Shoals, bars and harbour entrances.' },
      { front: 'Lee shore?', back: 'The shore downwind of the boat, onto which the wind blows. Biggest waves, and a drifting boat is pushed onto it. The weather shore (upwind) is sheltered.' },
      { front: 'Distance to a thunderstorm?', back: 'Seconds from flash to thunder divided by 3 = kilometres. 9 s is about 3 km.' },
      { front: 'Fog is defined as visibility below?', back: '1 km (1000 m). Mist is reduced visibility above 1 km.' },
      { front: 'Advection (sea) fog forms when?', back: 'Warm, moist air flows over colder water, typically spring and summer on the Norwegian coast. It persists in wind.' },
      { front: 'Fog signals, power-driven vessel (Rule 35)?', back: 'Making way: one prolonged blast. Stopped: two prolonged. Both at intervals of not more than 2 minutes. Under 12 m: any efficient sound every 2 min.' },
      { front: 'Rule 19 in restricted visibility?', back: 'Safe speed, engines ready for immediate manoeuvre; a fog signal heard forward of the beam means reduce to minimum steering speed, stop if necessary.' },
      { front: 'Time between successive high waters?', back: 'About 12 h 25 min, so high water comes about 50 minutes later each day. Two highs and two lows per lunar day of 24 h 50 min.' },
      { front: 'Spring and neap tides occur when?', back: 'Springs (largest range) at new and full moon; neaps (smallest) at half moon. Every fortnight, in every season.' },
      { front: 'Where in Norway is the tide smallest and largest?', back: 'Almost zero at the amphidromic point near Egersund; 0.5-0.7 m in the Skagerrak and Oslofjord; nearly 4 m in Finnmark (Vadso 3.97 m).' },
      { front: 'Chart datum in Norway?', back: 'Lowest Astronomical Tide (LAT), except 30 cm below LAT in the inner Oslofjord and 20 cm below LAT from the Swedish border to Utsira.' },
      { front: 'Effect of air pressure on water level?', back: '1 hPa = about 1 cm. Low pressure raises the sea, high pressure lowers it. A 960 hPa low lifts it about 50 cm.' },
      { front: 'Effect of wind on water level?', back: 'Onshore wind (S and W in Norway) piles water up the coast and into the fjords; offshore wind lowers it. Weather effect can exceed 1 m.' },
      { front: 'Storm surge recipe?', back: 'A deep low with onshore gale coinciding with spring tide, usually in winter.' },
      { front: 'Tidal streams: rhythm and strongest place in Norway?', back: 'Reverse about every 6 hours, strongest at springs, slack shortly after high and low water. Saltstraumen near Bodo is Norway\'s strongest.' },
      { front: 'Coast radio: watch channels and weather broadcast times?', back: 'Continuous watch on VHF ch 16 and DSC ch 70. Weather at 09, 12, 15, 18 and 21 local time on the working channels. Telephone 120.' },
    ],

    questions: [
      // ---- Reading wind (part 1) ----
      { id: 'weather-01', q: 'The forecast says the wind is "from north-west". Towards which direction is the air moving?', options: ['North-west', 'South-east', 'North-east', 'South-west'], answer: 1, explanation: 'Wind is named by its origin. A north-westerly comes from the north-west and travels towards the south-east (F16).', difficulty: 1, part: 1, tags: ['wind-direction'] },
      { id: 'weather-02', q: 'A forecast of 9 m/s corresponds to which Beaufort force and name?', options: ['Force 5, fresh breeze', 'Force 4, moderate breeze', 'Force 6, strong breeze', 'Force 7, near gale'], answer: 0, explanation: 'Fresh breeze is 8.0-10.7 m/s (17-21 kn). Moderate breeze is 5.5-7.9 and strong breeze 10.8-13.8 m/s (F21).', difficulty: 1, part: 1, tags: ['beaufort'] },
      { id: 'weather-03', q: '"Gale" on the Beaufort scale is force:', options: ['6', '7', '8', '9'], answer: 2, explanation: 'Force 8 gale is 17.2-20.7 m/s (34-40 kn). Force 7 is near gale and force 9 strong gale (F21).', difficulty: 1, part: 1, tags: ['beaufort'] },
      { id: 'weather-04', q: 'Approximately how many knots is a wind of 12 m/s?', options: ['6 knots', '12 knots', '43 knots', '24 knots'], answer: 3, explanation: '1 m/s is about 1.94 knots, so 12 m/s is about 23-24 knots. The exam shortcut is m/s x 2 (F19).', difficulty: 1, part: 1, tags: ['units'] },
      { id: 'weather-05', q: 'The "mean wind" in a forecast or observation is averaged over:', options: ['3 seconds', '1 minute', '10 minutes', '1 hour'], answer: 2, explanation: 'Mean wind is the 10-minute average; a gust is the highest 3-second value in the period (F18).', difficulty: 1, part: 1, tags: ['gusts'] },
      { id: 'weather-06', q: 'The forecast gives a mean wind of 10 m/s with no gust figure. What gusts should you typically plan for in open coastal water?', options: ['About 10 m/s; gusts equal the mean wind', 'About 25 m/s', 'About 5 m/s; gusts are weaker than the mean', 'About 13-15 m/s'], answer: 3, explanation: 'Gusts are typically about 1.3-1.5 x the mean wind, more in rough terrain, so plan on 13-15 m/s (F18).', difficulty: 2, part: 1, tags: ['gusts'] },
      { id: 'weather-07', q: 'A wind that changes from south-west to north-west has:', options: ['Veered', 'Backed', 'Gusted', 'Freshened'], answer: 0, explanation: 'A clockwise change of direction (SW to W to NW) is veering; anticlockwise is backing (F44).', difficulty: 1, part: 1, tags: ['veer-back'] },
      { id: 'weather-08', q: 'Which wind symbol is shown on the compass rose in the picture?', illustration: () => windQuestion(315, 15), options: ['Wind from the south-east, 15 knots', 'Wind from the north-west, 15 knots', 'Wind from the north-west, 30 knots', 'Wind towards the north-west, 5 knots'], answer: 1, explanation: 'The arrow points where the air goes (towards the south-east), and the barbs sit on the tail, the "from" end, which lies in the north-west. One long barb (10 kn) and one short barb (5 kn) make 15 knots (F16, F17).', difficulty: 2, part: 1, tags: ['wind-direction', 'picture'] },
      { id: 'weather-09', q: 'Approximately how many m/s is a wind of 25 knots?', options: ['About 12.5 m/s', 'About 25 m/s', 'About 50 m/s', 'About 5 m/s'], answer: 0, explanation: '1 knot = 0.514 m/s, so 25 knots is about 12.9 m/s; dividing knots by two is close enough (F19).', difficulty: 2, part: 1, tags: ['units'] },
      { id: 'weather-10', q: 'What is the effect of an offshore wind (blowing from the land out to sea) near the coast?', options: ['Big breaking waves at the shore and a drifting boat is pushed onto it', 'Flat water near the shore, bigger seas further out, and a drifting boat is carried away from land', 'No waves anywhere', 'The water level rises along the coast'], answer: 1, explanation: 'Offshore wind has no fetch at the shore, so the water is flat there, but the waves grow further out and a disabled boat drifts away from land. Onshore wind gives the opposite (F30).', difficulty: 2, part: 1, tags: ['offshore-wind'] },
      // ---- Beaufort, warnings, CE (part 1) ----
      { id: 'weather-11', q: 'The Beaufort scale runs from force 0 (calm) up to which force?', options: ['Force 8, gale', 'Force 10, storm', 'Force 12, hurricane', 'Force 20'], answer: 2, explanation: 'The scale has 13 steps, force 0 calm to force 12 hurricane (32.7 m/s or more) (F20, F21).', difficulty: 1, part: 1, tags: ['beaufort'] },
      { id: 'weather-12', q: 'A mean wind of 17 m/s is forecast. Which Beaufort force is that?', options: ['Force 6, strong breeze', 'Force 7, near gale', 'Force 8, gale', 'Force 9, strong gale'], answer: 1, explanation: 'Near gale is 13.9-17.1 m/s. Gale starts at 17.2 m/s (F21).', difficulty: 2, part: 1, tags: ['beaufort'] },
      { id: 'weather-13', q: 'MET Norway issues a coastal gale warning when the mean wind is expected to reach at least:', options: ['10.8 m/s', '13.9 m/s', '15 m/s', '20 m/s'], answer: 2, explanation: 'The coastal threshold is 15 m/s (inside the near-gale band); the near fishing banks get a warning at 20 m/s. Warnings are issued only when the probability exceeds 50 % (F3).', difficulty: 2, part: 1, tags: ['warnings'] },
      { id: 'weather-14', q: 'A boat marked CE design category C is designed for conditions up to:', options: ['Force 4 and 0.3 m waves', 'Force 6 and 2 m significant waves', 'Force 8 and 4 m significant waves', 'Above force 8 and 4 m'], answer: 1, explanation: 'C = up to force 6 and 2 m; D = up to force 4 and 0.3 m; B = up to force 8 and 4 m; A = beyond that (F27).', difficulty: 1, part: 1, tags: ['ce-category'] },
      { id: 'weather-15', q: 'Which CE design category is intended for the most sheltered waters?', options: ['D: up to force 4 and 0.3 m waves', 'C: up to force 6 and 2 m waves', 'B: up to force 8 and 4 m waves', 'A: above force 8 and 4 m waves'], answer: 0, explanation: 'D is the sheltered-water category and A the most seaworthy. Candidates often reverse them (F27).', difficulty: 1, part: 1, tags: ['ce-category'] },
      { id: 'weather-16', q: 'What does a red MET weather warning mean?', options: ['Be aware: a challenging situation, most activities can continue', 'Be prepared: serious consequences possible', 'Secure your assets: extreme weather with great danger to life', 'The warning has been cancelled'], answer: 2, explanation: 'Yellow = be aware, orange = be prepared, red = secure your assets, extreme and dangerous to life. A named red event is an "extreme weather" warning (F5).', difficulty: 2, part: 1, tags: ['warnings'] },
      { id: 'weather-17', q: 'Sea Safety Rule 3 says:', options: ['Always carry a VHF radio', 'Keep to 5 knots within 50 m of the shore', 'Wear a wetsuit when boating alone', 'Respect weather and waters; use the boat only under suitable conditions'], answer: 3, explanation: 'Rule 3 of the seven Sea Safety Rules is "Respect weather and waters. The boat must only be used under suitable conditions" (F26, F92).', difficulty: 1, part: 1, tags: ['sea-safety-rules'] },
      { id: 'weather-18', q: 'Yr forecasts 9 m/s from the south-west with gusts at 15 m/s and 1.2 m waves for the afternoon. You have a 17-foot open boat (category C). What is the sound decision?', options: ['Go: 9 m/s is only force 5 and the boat is rated for force 6', 'Go, but only after 15:00 when the sea breeze has died', 'Go: 1.2 m waves are comfortable in any boat', 'Stay in sheltered water or ashore: the gusts reach force 7, beyond what the boat is designed for, and single waves may reach 2-2.5 m'], answer: 3, explanation: 'Plan on the gusts: 15 m/s is in the near-gale band (13.9-17.1), beyond category C (up to force 6). Significant height 1.2 m means occasional waves near twice that (F18, F21, F27, F32).', difficulty: 3, part: 1, tags: ['scenario'] },
      // ---- Pressure and fronts (part 1) ----
      { id: 'weather-19', q: 'In the northern hemisphere, how does air move around a centre of low pressure?', options: ['Clockwise and outwards', 'Clockwise and inwards', 'Anticlockwise and inwards', 'Anticlockwise and outwards'], answer: 2, explanation: 'Lows: anticlockwise and slightly inwards, with rising air and unsettled weather. Highs: clockwise and slightly outwards (F39).', difficulty: 2, part: 1, tags: ['pressure'] },
      { id: 'weather-20', q: 'You stand with your back to the wind. Where is the low pressure according to Buys Ballot\'s law?', options: ['Straight ahead', 'On your right', 'Straight behind', 'On your left, slightly ahead'], answer: 3, explanation: 'Back to the wind in the northern hemisphere: low on the left (slightly ahead), high on the right (F40).', difficulty: 1, part: 1, tags: ['pressure'] },
      { id: 'weather-21', q: 'What do closely spaced isobars on a weather chart indicate?', options: ['Light winds', 'Fog', 'High pressure', 'Strong winds'], answer: 3, explanation: 'Isobars are lines of equal pressure; the closer together they are, the steeper the pressure gradient and the stronger the wind (F42).', difficulty: 2, part: 1, tags: ['pressure'] },
      { id: 'weather-22', q: 'What weather does a high-pressure area normally bring?', options: ['Unsettled weather with rain and strong wind', 'Steady rain from a lowering cloud base', 'Settled, fair weather with light winds', 'Thunderstorms every afternoon'], answer: 2, explanation: 'In a high the air sinks, dries and warms: settled fair weather and light winds, though summer nights can be cold and winter highs can bring fog (F41).', difficulty: 2, part: 1, tags: ['pressure'] },
      { id: 'weather-23', q: 'The barometer shows the readings in the picture. What is happening?', illustration: () => barometer(1012, 1007), options: ['Pressure is rising; fine weather is on the way', 'Pressure is "falling quickly" (3.6-6.0 hPa in 3 h): a low is approaching with wind and rain', 'Pressure is steady; no change expected', 'Pressure is "falling slowly"; nothing to worry about'], answer: 1, explanation: 'A fall of 5 hPa in three hours is "falling quickly" in Met Office terms (3.6-6.0 hPa per 3 h). A falling barometer announces an approaching low (F43).', difficulty: 2, part: 1, tags: ['barometer', 'picture'] },
      { id: 'weather-24', q: 'A halo appears around the sun, the cloud thickens and lowers and the barometer falls steadily. What is most likely approaching?', options: ['A warm front with steady rain and a veer of the wind', 'A building high with fair weather', 'The afternoon sea breeze', 'Radiation fog'], answer: 0, explanation: 'Cirrostratus (halo), lowering cloud and a steadily falling barometer are the classic warm-front sequence; the wind veers when the front passes (F46, F48).', difficulty: 2, part: 1, tags: ['fronts'] },
      { id: 'weather-25', q: 'Which description fits the passage of a cold front?', options: ['Drizzle for many hours, slowly rising temperature, wind backing', 'Flat calm and dense fog', 'A steady easterly wind and rising pressure for two days', 'A narrow band of heavy showers, a sharp veer of the wind (typically SW to NW), pressure starting to rise, colder air and clearing skies'], answer: 3, explanation: 'Cold fronts move fast: heavy, sometimes thundery showers, a sharp veer, pressure turning from falling to rising, a temperature drop and clearing (F47).', difficulty: 2, part: 1, tags: ['fronts'] },
      { id: 'weather-26', q: 'On a weather chart a warm front is drawn as:', options: ['A blue line with triangles', 'A purple line with alternating semicircles and triangles', 'A red line with semicircles', 'A dashed black line'], answer: 2, explanation: 'Warm front: red with semicircles; cold front: blue with triangles; occluded front: purple with both. The symbols point the way the front moves (F45).', difficulty: 1, part: 1, tags: ['fronts'] },
      { id: 'weather-27', q: 'Polar lows are a hazard mainly:', options: ['Over the Norwegian and Barents Seas from October to May, taking the wind from near calm to storm force in minutes', 'In the Oslofjord on hot July afternoons', 'Only in the tropics', 'Along the south coast in May, as light sea breezes'], answer: 0, explanation: 'Polar lows are small, intense winter lows over northern waters (peak December-March) with sudden gale to storm winds and heavy snow showers (F49).', difficulty: 3, part: 1, tags: ['polar-low'] },
      // ---- Local winds (part 1) ----
      { id: 'weather-28', q: 'Which statement about the sea breeze on a sunny summer day is correct?', options: ['It blows from land to sea and peaks at dawn', 'It blows from sea to land and is strongest in the afternoon', 'It occurs only in winter', 'It needs a strong background wind to develop'], answer: 1, explanation: 'The sea breeze is an onshore wind caused by the land heating faster than the sea; it needs weak background wind and peaks in the afternoon (F50).', difficulty: 1, part: 1, tags: ['sea-breeze'] },
      { id: 'weather-29', q: 'How strong can the sea breeze typically become on the Norwegian coast on a hot, calm summer afternoon?', options: ['1-2 knots', '5-8 knots', '40 knots', '15-25 knots'], answer: 3, explanation: 'Convergence along the coast commonly gives 15-25 knots (8-13 m/s), uncomfortable for small open boats even when the morning forecast said light breeze (F52).', difficulty: 2, part: 1, tags: ['sea-breeze'] },
      { id: 'weather-30', q: 'What is the land breeze?', options: ['A strong onshore wind in the afternoon', 'A wind blowing along the fjord at midday', 'A weak offshore wind at night, when the land cools faster than the sea', 'The gusty wind under steep mountainsides'], answer: 2, explanation: 'At night the daytime circulation reverses: a weak land breeze flows from the cooled land out over the water (F53).', difficulty: 2, part: 1, tags: ['sea-breeze'] },
      { id: 'weather-31', q: 'A "fall wind" in a fjord is:', options: ['A steady onshore wind', 'A sudden, strong, turbulent wind striking down from the mountainside', 'The weak night-time land breeze', 'A rising thermal over warm land'], answer: 1, explanation: 'When strong wind crosses the mountains it is forced down the lee side in violent gusts that hit the water under steep fjord sides (F55).', difficulty: 2, part: 1, tags: ['fall-wind'] },
      { id: 'weather-32', q: 'The 07:00 forecast says 2 m/s, sunny, 24 degrees. You must cross an open stretch in a small boat today. When should you plan the crossing?', options: ['At 16:00, when the air is warmest', 'In the morning or in the evening, avoiding the afternoon sea breeze', 'Exactly at noon, when the sea breeze is weakest', 'It does not matter; the forecast says 2 m/s all day'], answer: 1, explanation: 'Hot sun and a calm background wind are the recipe for a sea breeze that builds through the afternoon, often to 15-25 knots, and dies in the evening (F50, F52, F53).', difficulty: 3, part: 1, tags: ['sea-breeze', 'scenario'] },
      // ---- Waves (part 1) ----
      { id: 'weather-33', q: 'A significant wave height of 1.5 m is forecast. How high may the largest individual waves be?', options: ['1.5 m, significant height is the maximum', 'About 2 m', 'About 3 m', 'About 6 m'], answer: 2, explanation: 'Significant height is the mean of the highest third; single waves reach almost twice that, so about 3 m (F32).', difficulty: 2, part: 1, tags: ['waves'] },
      { id: 'weather-34', q: 'Wind blowing against a tidal stream makes the waves:', options: ['Shorter and steeper, with breaking crests', 'Longer and lower', 'Disappear completely', 'Unchanged; current does not affect waves'], answer: 0, explanation: 'An opposing current compresses the waves so they become short, steep and break; wind with the current stretches them out (F35).', difficulty: 1, part: 1, tags: ['waves', 'current'] },
      { id: 'weather-35', q: 'What is a "lee shore"?', options: ['The shore the wind blows away from, giving shelter', 'The shore downwind of the boat, onto which the wind blows', 'Any rocky shore', 'The shore with the strongest tidal stream'], answer: 1, explanation: 'The lee shore lies downwind of you; waves are largest and break there, and wind and sea push a disabled boat onto it. The weather shore, upwind, is the sheltered one (F36).', difficulty: 1, part: 1, tags: ['waves'] },
      { id: 'weather-36', q: 'Which four factors decide the size of wind-driven waves?', options: ['Wind speed, fetch, duration of the wind and water depth', 'Air temperature, humidity, cloud cover and season', 'Boat speed, boat length, engine power and load', 'Latitude, longitude, time of day and tide'], answer: 0, explanation: 'Wave growth depends on how hard the wind blows, over how long a stretch of water (fetch), for how long, and in how deep water (F31).', difficulty: 2, part: 1, tags: ['waves'] },
      { id: 'weather-37', q: 'Why do waves break over a shoal, a bar or a shallow harbour entrance?', options: ['Because the water is colder there', 'Because the wind is always stronger near land', 'Because in shallow water the wave slows at its base, steepens and breaks once the depth is only about 1.3 times its height', 'Because the tide always runs against the wind there'], answer: 2, explanation: 'Entering shallow water the base of the wave is slowed while the crest keeps its speed, so the wave steepens, shortens and breaks when the depth is about 1.3 x the wave height (F33, F34).', difficulty: 2, part: 1, tags: ['waves'] },
      // ---- Thunder (part 1) ----
      { id: 'weather-38', q: 'You see lightning and count nine seconds before the thunder. How far away is the storm?', options: ['About 900 m', 'About 3 km', 'About 9 km', 'About 27 km'], answer: 1, explanation: 'Seconds divided by three gives kilometres: 9 / 3 = 3 km (F57).', difficulty: 1, part: 1, tags: ['thunder'] },
      { id: 'weather-39', q: 'A thunderstorm catches you on the water and you cannot reach shore. What is the safest action?', options: ['Stay inside a metal hull or cabin, keeping your distance from the metal, and never hold the mast or large metal parts', 'Hold on to the mast to steady yourself', 'Swim towards the nearest rock', 'Stand on the bow to watch for the next flash'], answer: 0, explanation: 'MET advice: get to shore; if you cannot, an enclosed space with continuous metal on all sides is safest, away from the metal itself, avoiding anything that conducts electricity (F56).', difficulty: 2, part: 1, tags: ['thunder'] },
      { id: 'weather-40', q: 'A large, dark thundercloud approaches. When is its wind usually strongest?', options: ['Only after the rain has stopped', 'Suddenly at the front and sides of the cloud, before the rain starts', 'Evenly throughout the day', 'Never; thunderclouds bring rain but no wind'], answer: 1, explanation: 'The squall arrives suddenly ahead of the rain, is strongest at the front and sides of the cloud and is usually short-lived, often with calm behind (F58).', difficulty: 2, part: 1, tags: ['thunder'] },
      // ---- Fog and restricted visibility (parts 1 and 2) ----
      { id: 'weather-41', q: 'Fog is defined as visibility below:', options: ['5 nautical miles', '2 nautical miles', '1 km (1000 m)', '100 m'], answer: 2, explanation: 'Fog is visibility under 1 km; reduced visibility above 1 km caused by water droplets is mist (F60).', difficulty: 1, part: 1, tags: ['fog'] },
      { id: 'weather-42', q: 'Sea fog (advection fog) on the Norwegian coast most typically forms when:', options: ['Very cold air flows over warmer water in midwinter', 'The ground cools on a clear, calm autumn night', 'A cold front passes', 'Warm, moist air flows over colder water in spring or summer'], answer: 3, explanation: 'Advection fog forms when warm moist air is cooled to its dew point over cold sea, typically in spring and summer; it persists in wind, unlike radiation fog (F61).', difficulty: 2, part: 1, tags: ['fog'] },
      { id: 'weather-43', q: 'Which statement about radiation fog is correct?', options: ['It forms on calm, clear nights as the ground cools, drifts over sheltered fjords and burns off after sunrise', 'It forms over the open sea in strong wind', 'It only occurs in midsummer at noon', 'It is caused by warm air flowing over cold water'], answer: 0, explanation: 'Radiation fog needs calm, clear nights, mostly inland in autumn, and clears soon after sunrise (F62).', difficulty: 2, part: 1, tags: ['fog'] },
      { id: 'weather-44', q: 'What does this sound signal mean when heard in fog?', illustration: () => S.soundSignal('-', { meaning: ' ' }), options: ['A power-driven vessel making way, repeated at intervals of not more than 2 minutes', 'I am altering my course to starboard', 'A vessel at anchor', 'A power-driven vessel underway but stopped'], answer: 0, explanation: 'One prolonged blast (4-6 s) every 2 minutes at most is a power-driven vessel making way in restricted visibility, Rule 35(a). Stopped: two prolonged blasts (F66).', difficulty: 2, part: 2, tags: ['fog', 'rule-35', 'picture'] },
      { id: 'weather-45', q: 'In fog, a power-driven vessel over 12 m that is underway but stopped must sound:', options: ['One prolonged blast every minute', 'One short blast every 2 minutes', 'Two prolonged blasts about 2 s apart, at intervals of not more than 2 minutes', 'Three short blasts every 5 minutes'], answer: 2, explanation: 'Rule 35(b): two prolonged blasts in succession with about two seconds between them, at intervals of not more than 2 minutes (F66).', difficulty: 2, part: 2, tags: ['fog', 'rule-35'] },
      { id: 'weather-46', q: 'Your 7 m motorboat is in fog. Which is correct about sound signals?', options: ['Boats under 12 m need not make any sound signal', 'You must sound a bell continuously', 'You must sound one prolonged blast every minute', 'You must make some efficient sound signal at intervals of not more than 2 minutes'], answer: 3, explanation: 'Rule 35(j): a vessel under 12 m is not obliged to give the prescribed signals but must make some other efficient sound signal at intervals of not more than 2 minutes (F66).', difficulty: 2, part: 2, tags: ['fog', 'rule-35'] },
      { id: 'weather-47', q: 'In fog you hear another vessel\'s fog signal apparently forward of your beam. What does Rule 19 require?', options: ['Increase speed to clear the area quickly', 'Turn hard to port and continue at the same speed', 'Sound five short blasts and hold your course', 'Reduce speed to the minimum at which you can keep your course, and if necessary take all way off'], answer: 3, explanation: 'Rule 19(e): a fog signal apparently forward of the beam means reducing to minimum steering speed and, if necessary, stopping. The engines must be ready for immediate manoeuvre (F65).', difficulty: 2, part: 2, tags: ['fog', 'rule-19'] },
      { id: 'weather-48', q: 'Visibility drops to 300 m in a fairway. Which set of actions is correct for your motorboat?', options: ['Keep full speed to reach harbour before it thickens, lights off to save power', 'Slow to a safe speed with the engine ready, switch on navigation lights, sound signals every 2 minutes at most, post a lookout and listen, fix your position', 'Stop in the middle of the fairway and wait', 'Switch off the engine and drift until it clears'], answer: 1, explanation: 'Rules 19, 20 and 35 plus the practical fog drill: safe speed, lights on, sound signals, lookout, listening, position fix, and move out of the fairway or anchor (F65-F67).', difficulty: 3, part: 1, tags: ['fog', 'scenario'] },
      // ---- Tide and water level (part 3) ----
      { id: 'weather-49', q: 'Spring tides (the largest tidal range) occur:', options: ['Only in the spring season', 'At half moon', 'Once a year', 'At new moon and full moon'], answer: 3, explanation: 'When sun and moon pull in line, every fortnight at new and full moon, the range is largest; at half moon the range is smallest (neaps) (F75).', difficulty: 1, part: 3, tags: ['tide'] },
      { id: 'weather-50', q: 'The interval between two successive high waters is about:', options: ['6 hours', '12 hours 25 minutes', '24 hours', '24 hours 50 minutes'], answer: 1, explanation: 'The lunar day is 24 h 50 min with two high waters, so they are 12 h 25 min apart and high water comes about 50 minutes later each day (F73, F74).', difficulty: 1, part: 3, tags: ['tide'] },
      { id: 'weather-51', q: 'Where in Norway is the tidal range largest?', options: ['In the Oslofjord', 'Along the Skagerrak coast', 'Near Egersund', 'In Finnmark, for example Vadso with about 4 m'], answer: 3, explanation: 'Range grows from about 0.5 m in the south to nearly 4 m in Finnmark and is almost zero at the amphidromic point near Egersund (F76, F77).', difficulty: 2, part: 3, tags: ['tide'] },
      { id: 'weather-52', q: 'What is special about the tide near Egersund?', options: ['It is the largest in Norway', 'High water occurs only once a day', 'The tide runs at 20 knots', 'The range is almost zero because an amphidromic point lies there'], answer: 3, explanation: 'An amphidromic point near Egersund gives an almost zero range, which is why the whole Skagerrak coast has only a few tens of centimetres of tide (F77).', difficulty: 2, part: 3, tags: ['tide'] },
      { id: 'weather-53', q: 'Air pressure falls from 1020 to 990 hPa. The water level will tend to be:', options: ['About 30 cm higher than the tide table', 'About 30 cm lower than the tide table', 'About 3 m higher', 'Unchanged'], answer: 0, explanation: 'Rule of thumb: 1 hPa changes the level by about 1 cm, and low pressure raises the sea (F79).', difficulty: 2, part: 3, tags: ['water-level'] },
      { id: 'weather-54', q: 'Depths on Norwegian charts are referenced to:', options: ['Mean sea level', 'Highest astronomical tide', 'Chart datum, which equals lowest astronomical tide or lies slightly below it', 'The water level on the day of the survey'], answer: 2, explanation: 'Chart datum is LAT, except 30 cm below LAT in the inner Oslofjord and 20 cm below LAT from the Swedish border to Utsira (F83).', difficulty: 2, part: 3, tags: ['chart-datum'] },
      { id: 'weather-55', q: 'The chart shows 1.5 m over a bar. The tide table gives 1.6 m above chart datum at high water. Ignoring weather, what depth do you have at high water?', options: ['About 3.1 m', 'About 1.5 m', 'About 1.6 m', 'About 0.1 m'], answer: 0, explanation: 'Depth now = charted depth + height of tide above chart datum = 1.5 + 1.6 = 3.1 m, before any weather effect (F84).', difficulty: 3, part: 3, tags: ['chart-datum', 'scenario'] },
      { id: 'weather-56', q: 'Which combination produces the classic winter storm surge on the Norwegian coast?', options: ['High pressure, offshore wind and neap tide', 'A calm night with radiation fog', 'An afternoon sea breeze at half moon', 'A deep low with onshore gale coinciding with spring tide'], answer: 3, explanation: 'Low pressure lifts the sea (1 hPa = 1 cm), onshore gales pile water onto the coast and a spring tide adds the largest astronomical range (F79-F81).', difficulty: 3, part: 3, tags: ['water-level'] },
      { id: 'weather-57', q: 'Tide-table times for Norway are given in standard time (UTC+1). During summer time you must:', options: ['Subtract one hour', 'Use them unchanged', 'Add one hour', 'Add two hours'], answer: 2, explanation: 'The tables use Norwegian standard time; add one hour to get summer time (F84).', difficulty: 2, part: 3, tags: ['tide'] },
      { id: 'weather-58', q: 'Which statement about Norway\'s strongest tidal current is correct?', options: ['It is in the Drobak sound at the entrance to the inner Oslofjord', 'It is Saltstraumen near Bodo, with popular figures of up to about 20 knots', 'It is in the Karmsund near Haugesund', 'Tidal currents in Norway never exceed 1 knot'], answer: 1, explanation: 'Saltstraumen, about 10 km south-east of Bodo, is Norway\'s strongest tidal current and is often called the world\'s strongest; popular sources quote about 20 knots, the Norwegian Pilot about 7-8 knots (F88).', difficulty: 1, part: 3, tags: ['current'] },
      { id: 'weather-59', q: 'When is a tidal stream through a narrow sound weakest?', options: ['At spring tide', 'Midway between high and low water', 'At slack water, shortly after local high and low water, when it turns', 'Whenever the wind blows against it'], answer: 2, explanation: 'Streams reverse roughly every six hours and pause at slack water around the turn; they are strongest at springs (F87).', difficulty: 2, part: 3, tags: ['current'] },
      { id: 'weather-60', q: 'On the south coast and in the Oslofjord, why can the real water level differ a lot from the tide table?', options: ['Because the tide there is so small that the weather effect (pressure and wind) often dominates', 'Because the tide tables are not published for that area', 'Because the tide there is the largest in Norway', 'Because chart datum is set above the highest tide'], answer: 0, explanation: 'With a tidal range of only 0.5-0.7 m, pressure and wind effects of up to a metre or more easily outweigh the tide and even shift the times of high and low water (F78, F80).', difficulty: 2, part: 3, tags: ['water-level'] },
    ],
  });
})();
