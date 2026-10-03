/* Skipper Prep — illustration library, part 2: IALA / Norwegian marks, light rhythms, sector lights,
   leading lines and chart symbols. Every helper returns an SVG string (see ILLUSTRATIONS.md).
   Facts follow the verified sheets buoyage-and-marks.md and charts-and-navigation.md (IALA R1001,
   Kystverket guideline, INT1). Real navigation colours come from BOAT_SVG.COLORS only; everything
   else uses CSS variables so pictures read in light and dark themes. */
(function () {
  'use strict';
  const S = window.BOAT_SVG;
  const C = S.COLORS, T = S.text, esc = S.esc;
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)';
  const PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', SHALLOW = 'var(--shallow)', MAGENTA = 'var(--accent)';
  const fx = n => Math.round(n * 100) / 100;
  const deg = S.deg;
  const bad = (what, got, valid) => new Error(`${what} "${got}" is not valid. Use one of: ${valid.join(', ')}`);

  /* ---------- small shared drawing helpers ---------- */
  function pts(arr) { return arr.map(p => `${fx(p[0])},${fx(p[1])}`).join(' '); }
  function poly(arr, fill, extra) { return `<polygon points="${pts(arr)}" fill="${fill}" ${extra || ''}/>`; }
  /* rotate a list of [x,y] offsets by heading (0 = up, clockwise) and translate to (cx, cy) */
  function rot(cx, cy, heading, arr) {
    const a = deg(heading), s = Math.sin(a), c = Math.cos(a);
    return arr.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
  }
  /* plan-view boat, bow pointing along heading (0 = up/north, clockwise) */
  function boatPlan(cx, cy, heading, len, fill, stroke) {
    const L = len || 40, W = L * 0.38;
    const hull = rot(cx, cy, heading, [[0, -L / 2], [W / 2, -L / 8], [W / 2, L / 2], [-W / 2, L / 2], [-W / 2, -L / 8]]);
    const arrow = rot(cx, cy, heading, [[0, -L / 2 - 4], [0, -L / 2 - 16]]);
    const head = rot(cx, cy, heading, [[0, -L / 2 - 20], [-4, -L / 2 - 12], [4, -L / 2 - 12]]);
    return poly(hull, fill || PAPER, `stroke="${stroke || INK2}" stroke-width="1.6" stroke-linejoin="round"`) +
      `<line x1="${fx(arrow[0][0])}" y1="${fx(arrow[0][1])}" x2="${fx(arrow[1][0])}" y2="${fx(arrow[1][1])}" stroke="${stroke || INK2}" stroke-width="1.6"/>` + poly(head, stroke || INK2);
  }
  /* straight arrow with a filled (or open) head */
  function arrow(x1, y1, x2, y2, color, o) {
    o = o || {}; const w = o.width || 2, hs = o.head || 10;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const bx = x2 - hs * Math.cos(ang), by = y2 - hs * Math.sin(ang);
    const l = [bx + hs * 0.5 * Math.sin(ang), by - hs * 0.5 * Math.cos(ang)], r = [bx - hs * 0.5 * Math.sin(ang), by + hs * 0.5 * Math.cos(ang)];
    const head = o.open
      ? `<polyline points="${pts([l, [x2, y2], r])}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`
      : poly([[x2, y2], l, r], color);
    return `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(o.open ? x2 : bx)}" y2="${fx(o.open ? y2 : by)}" stroke="${color}" stroke-width="${w}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>` + head;
  }
  /* cone (triangle) with base width w and height h, apex up or down; (cx, yBase) is the base centre */
  function cone(cx, yBase, w, h, up, fill, extra) {
    return up ? poly([[cx - w / 2, yBase], [cx + w / 2, yBase], [cx, yBase - h]], fill, extra)
      : poly([[cx - w / 2, yBase - h], [cx + w / 2, yBase - h], [cx, yBase]], fill, extra);
  }
  function rockBlob(cx, cy, r, fill) {
    return `<path d="M${fx(cx - r)},${fx(cy)} Q${fx(cx - r * .8)},${fx(cy - r * .9)} ${fx(cx - r * .2)},${fx(cy - r * .75)} Q${fx(cx + r * .4)},${fx(cy - r * 1.1)} ${fx(cx + r * .9)},${fx(cy - r * .3)} Q${fx(cx + r * 1.1)},${fx(cy + r * .5)} ${fx(cx + r * .3)},${fx(cy + r * .7)} Q${fx(cx - r * .6)},${fx(cy + r * .9)} ${fx(cx - r)},${fx(cy)} Z" fill="${fill || MUTED}" stroke="${INK2}" stroke-width="1"/>`;
  }
  /* a soft glowing lamp (used on marks and in night scenes) */
  function lamp(cx, cy, color, r) {
    r = r || 9;
    const disc = Array.isArray(color)
      ? `<path d="M${fx(cx)},${fx(cy - r)} A${r},${r} 0 0,0 ${fx(cx)},${fx(cy + r)} Z" fill="${color[0]}"/><path d="M${fx(cx)},${fx(cy - r)} A${r},${r} 0 0,1 ${fx(cx)},${fx(cy + r)} Z" fill="${color[1]}"/>`
      : `<circle cx="${fx(cx)}" cy="${fx(cy)}" r="${r}" fill="${color}"/>`;
    const glow = Array.isArray(color) ? color[1] : color;
    return `<circle cx="${fx(cx)}" cy="${fx(cy)}" r="${r * 2.2}" fill="${glow}" opacity=".22"/><circle cx="${fx(cx)}" cy="${fx(cy)}" r="${r * 1.45}" fill="${glow}" opacity=".3"/>${disc}<circle cx="${fx(cx)}" cy="${fx(cy)}" r="${r}" fill="none" stroke="${INK}" stroke-width=".8" opacity=".6"/>`;
  }
  /* water band with a wavy surface line; the surface is at y */
  function water(x, y, w, h) {
    let d = `M${x},${y}`; for (let i = 0; i < w; i += 20) d += ` q10,-4 20,0`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${SHALLOW}"/><path d="${d}" fill="none" stroke="${INK2}" stroke-width="1.4" opacity=".7"/>`;
  }
  function title(w, y, s, size) { return T(w / 2, y, s, { size: size || 17, weight: 700 }); }
  function note(x, y, s, o) { return T(x, y, s, Object.assign({ size: 12, fill: INK2 }, o || {})); }

  /* ---------- the mark catalogue (IALA R1001 Region A; Kystverket; INT1) ---------- */
  const R = C.red, G = C.green, Y = C.yellow, B = C.black, W = C.white, BU = C.blue;
  /* bands are listed TOP to BOTTOM as [colour, fraction of height]; `vertical: true` means vertical stripes */
  const KINDS = {
    'lateral-port':      { name: 'Port-hand lateral mark', bands: [[R, 1]], shape: 'can', top: 'can', topColor: R, light: R, charText: 'Fl R — red, any rhythm except Fl(2+1)', pass: 'Keep it on your PORT (left) side when travelling in the direction of buoyage', spar: 'blunt', reflex: [R], abbr: 'R' },
    'lateral-starboard': { name: 'Starboard-hand lateral mark', bands: [[G, 1]], shape: 'cone', top: 'cone-up', topColor: G, light: G, charText: 'Fl G — green, any rhythm except Fl(2+1)', pass: 'Keep it on your STARBOARD (right) side when travelling in the direction of buoyage', spar: 'pointed', reflex: [G], abbr: 'G' },
    'preferred-starboard': { name: 'Preferred channel to STARBOARD', bands: [[R, .35], [G, .3], [R, .35]], shape: 'can', top: 'can', topColor: R, light: R, charText: 'Fl(2+1) R', pass: 'Treat as a PORT mark: keep it on your left to follow the main channel (not used in Norway)', spar: 'blunt', reflex: [R], abbr: 'RGR' },
    'preferred-port':    { name: 'Preferred channel to PORT', bands: [[G, .35], [R, .3], [G, .35]], shape: 'cone', top: 'cone-up', topColor: G, light: G, charText: 'Fl(2+1) G', pass: 'Treat as a STARBOARD mark: keep it on your right to follow the main channel (not used in Norway)', spar: 'pointed', reflex: [G], abbr: 'GRG' },
    'cardinal-n':        { name: 'North cardinal mark', bands: [[B, .5], [Y, .5]], shape: 'pillar', top: 'cones-up', topColor: B, light: W, charText: 'VQ W or Q W (continuous quick flashes)', pass: 'Safe water lies NORTH of the mark — pass north of it', spar: 'pointed', reflex: [BU, Y], abbr: 'BY', clock: '12 (continuous)' },
    'cardinal-e':        { name: 'East cardinal mark', bands: [[B, .3], [Y, .4], [B, .3]], shape: 'pillar', top: 'cones-base', topColor: B, light: W, charText: 'VQ(3) 5s or Q(3) 10s W', pass: 'Safe water lies EAST of the mark — pass east of it', spar: 'pointed', reflex: [BU, BU], abbr: 'BYB', clock: '3 o’clock = 3 flashes' },
    'cardinal-s':        { name: 'South cardinal mark', bands: [[Y, .5], [B, .5]], shape: 'pillar', top: 'cones-down', topColor: B, light: W, charText: 'VQ(6)+LFl 10s or Q(6)+LFl 15s W', pass: 'Safe water lies SOUTH of the mark — pass south of it', spar: 'blunt', reflex: [Y, BU], abbr: 'YB', clock: '6 o’clock = 6 flashes + long flash' },
    'cardinal-w':        { name: 'West cardinal mark', bands: [[Y, .33], [B, .34], [Y, .33]], shape: 'pillar', top: 'cones-point', topColor: B, light: W, charText: 'VQ(9) 10s or Q(9) 15s W', pass: 'Safe water lies WEST of the mark — pass west of it', spar: 'blunt', reflex: [Y, Y], abbr: 'YBY', clock: '9 o’clock = 9 flashes' },
    'isolated-danger':   { name: 'Isolated danger mark', bands: [[B, .3], [R, .4], [B, .3]], shape: 'pillar', top: 'two-balls', topColor: B, light: W, charText: 'Fl(2) W', pass: 'Danger directly beneath; navigable water all around — pass either side at a safe distance', spar: 'blunt', reflex: [BU, R], abbr: 'BRB' },
    'safe-water':        { name: 'Safe water mark (centre fairway)', bands: [[R, 1], [W, 1], [R, 1], [W, 1], [R, 1], [W, 1]], vertical: true, shape: 'sphere', top: 'ball', topColor: R, light: W, charText: 'Iso W / Oc W / LFl 10s W / Mo(A) W', pass: 'Navigable water all around: mid-channel, landfall or best passage under a bridge', spar: 'blunt', reflex: [R, W], abbr: 'RW' },
    'special':           { name: 'Special mark', bands: [[Y, 1]], shape: 'pillar', top: 'x', topColor: Y, light: Y, charText: 'Fl(4) Y (typical in Norway) — yellow, never a white-light rhythm', pass: 'Marks a special area or feature shown on the chart (fish farm, cable, bathing area, anchorage)', spar: 'blunt', reflex: [Y], abbr: 'Y' },
    'wreck':             { name: 'Emergency wreck marking buoy', bands: [[BU, 1], [Y, 1], [BU, 1], [Y, 1], [BU, 1], [Y, 1]], vertical: true, shape: 'pillar', top: 'plus', topColor: Y, light: [BU, Y], charText: 'Al Bu/Y: 1 s blue, 1 s yellow, 0.5 s dark between', pass: 'A NEW danger (wreck) — keep well clear and check Notices to Mariners', spar: 'blunt', reflex: [BU, Y], abbr: 'BuY' },
  };
  const KIND_NAMES = Object.keys(KINDS);
  const FORMS = ['buoy', 'perch', 'can', 'cone', 'spar'];
  const LATERALS = ['lateral-port', 'lateral-starboard', 'preferred-starboard', 'preferred-port'];

  /* fill a shape with the kind's bands: returns clipPath + rects. Local coords: x centred on 0, y from -H (top) to 0 (bottom). */
  function bandFill(kind, id, shapePath, H, halfW) {
    const k = KINDS[kind];
    let out = `<defs><clipPath id="${id}">${shapePath}</clipPath></defs><g clip-path="url(#${id})">`;
    if (k.vertical) {
      const n = k.bands.length, w = (2 * halfW) / n;
      k.bands.forEach((b, i) => { out += `<rect x="${fx(-halfW + i * w)}" y="${-H - 2}" width="${fx(w + .5)}" height="${H + 4}" fill="${b[0]}"/>`; });
    } else {
      let y = -H;
      k.bands.forEach(b => { const h = H * b[1]; out += `<rect x="${-halfW - 2}" y="${fx(y)}" width="${2 * halfW + 4}" height="${fx(h + .5)}" fill="${b[0]}"/>`; y += h; });
    }
    return out + '</g>';
  }
  /* topmark glyph with its base at (cx, yBase); returns { svg, h } (height used) */
  function topmark(kind, cx, yBase) {
    const k = KINDS[kind], col = k.topColor, o = `stroke="${INK}" stroke-width="1" stroke-linejoin="round"`;
    switch (k.top) {
      case 'can': return { svg: `<rect x="${cx - 17}" y="${yBase - 30}" width="34" height="30" fill="${col}" ${o}/>`, h: 30 };
      case 'cone-up': return { svg: cone(cx, yBase, 38, 34, true, col, o), h: 34 };
      case 'cones-up': return { svg: cone(cx, yBase, 36, 26, true, col, o) + cone(cx, yBase - 32, 36, 26, true, col, o), h: 58 };
      case 'cones-down': return { svg: cone(cx, yBase, 36, 26, false, col, o) + cone(cx, yBase - 32, 36, 26, false, col, o), h: 58 };
      case 'cones-base': /* east: lower cone points DOWN, upper cone points UP, bases together (diamond) */
        return { svg: cone(cx, yBase, 36, 26, false, col, o) + cone(cx, yBase - 30, 36, 26, true, col, o), h: 56 };
      case 'cones-point': /* west: lower cone points UP, upper cone points DOWN, points together (hourglass) */
        return { svg: cone(cx, yBase, 36, 26, true, col, o) + cone(cx, yBase - 30, 36, 26, false, col, o), h: 56 };
      case 'two-balls': return { svg: `<circle cx="${cx}" cy="${yBase - 14}" r="14" fill="${col}" ${o}/><circle cx="${cx}" cy="${yBase - 46}" r="14" fill="${col}" ${o}/>`, h: 60 };
      case 'ball': return { svg: `<circle cx="${cx}" cy="${yBase - 16}" r="16" fill="${col}" ${o}/>`, h: 32 };
      case 'x': return { svg: `<g stroke="${col}" stroke-width="9" stroke-linecap="round"><line x1="${cx - 17}" y1="${yBase - 36}" x2="${cx + 17}" y2="${yBase - 2}"/><line x1="${cx + 17}" y1="${yBase - 36}" x2="${cx - 17}" y2="${yBase - 2}"/></g>`, h: 38 };
      case 'plus': return { svg: `<g stroke="${col}" stroke-width="9" stroke-linecap="square"><line x1="${cx}" y1="${yBase - 40}" x2="${cx}" y2="${yBase - 2}"/><line x1="${cx - 18}" y1="${yBase - 21}" x2="${cx + 18}" y2="${yBase - 21}"/></g>`, h: 42 };
    }
    return { svg: '', h: 0 };
  }
  /* Draw a complete mark in local coordinates: origin (0,0) = centre of the waterline, y negative upwards.
     Returns { svg, top } where top is the y of the highest element. */
  function drawMark(kind, form, opts) {
    opts = opts || {};
    const k = KINDS[kind], id = `mk-${kind}-${form}${opts.idSuffix || ''}`;
    let body = '', H, halfW, hasTopmark = true;
    const outline = `fill="none" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"`;
    if (form === 'can') { H = 112; halfW = 46; const p = `<rect x="${-halfW}" y="${-H}" width="${2 * halfW}" height="${H}"/>`; body = bandFill(kind, id, p, H, halfW) + p.replace('/>', ` ${outline}/>`); }
    else if (form === 'cone') { H = 132; halfW = 50; const pt = pts([[-halfW, 0], [halfW, 0], [halfW, -26], [0, -H], [-halfW, -26]]); body = bandFill(kind, id, `<polygon points="${pt}"/>`, H, halfW) + `<polygon points="${pt}" ${outline}/>`; }
    else if (form === 'sphere') { H = 120; halfW = 60; const p = `<circle cx="0" cy="-60" r="60"/>`; body = bandFill(kind, id, p, H, halfW) + p.replace('/>', ` ${outline}/>`); }
    else if (form === 'pillar') {
      H = 150; halfW = 36; const pt = pts([[-halfW, 0], [halfW, 0], [24, -H], [-24, -H]]);
      body = bandFill(kind, id, `<polygon points="${pt}"/>`, H, halfW) + `<polygon points="${pt}" ${outline}/>`;
    }
    else if (form === 'spar') {
      /* Norwegian spar buoy: no topmark; red laterals blunt, green pointed; black-topped cardinals pointed, yellow-topped blunt (DNL1) */
      hasTopmark = false; halfW = 12; H = 230;
      const pointed = k.spar === 'pointed';
      const pt = pointed ? pts([[-halfW, 0], [halfW, 0], [halfW, -(H - 26)], [0, -H], [-halfW, -(H - 26)]]) : pts([[-halfW, 0], [halfW, 0], [halfW, -H], [-halfW, -H]]);
      body = bandFill(kind, id, `<polygon points="${pt}"/>`, H, halfW) + `<polygon points="${pt}" ${outline}/>`;
      /* reflective bands (blue replaces black), 20 cm wide, near the top */
      k.reflex.forEach((c, i) => { const y = -(H - 40) + i * 22; body += `<rect x="${-halfW - 1}" y="${y}" width="${2 * halfW + 2}" height="12" fill="${c}" stroke="${W}" stroke-width="1.5"/>`; });
    }
    else if (form === 'perch') {
      /* Norwegian iron perch on a rock: fixed lateral marks are white with a red/green band (KV-GL §2.2); only the topmark counts (INT1 Q130) */
      H = 190; halfW = 7;
      body = rockBlob(0, 6, 46, MUTED);
      if (LATERALS.includes(kind)) {
        body += `<rect x="${-halfW}" y="${-H}" width="${2 * halfW}" height="${H}" fill="${W}" ${outline.replace('fill="none" ', '')}/>` +
          `<rect x="${-halfW - 1}" y="${-H + 40}" width="${2 * halfW + 2}" height="36" fill="${k.topColor}"/>`;
      } else {
        const p = `<rect x="${-halfW}" y="${-H}" width="${2 * halfW}" height="${H}"/>`;
        body += bandFill(kind, id, p, H, halfW) + p.replace('/>', ` ${outline}/>`);
      }
    }
    let top = -H, svg = body;
    if (hasTopmark) {
      const stemTop = -H - 16;
      svg += `<line x1="0" y1="${-H}" x2="0" y2="${stemTop}" stroke="${INK}" stroke-width="3"/>`;
      const tm = topmark(kind, 0, stemTop); svg += tm.svg; top = stemTop - tm.h;
    }
    if (opts.light) {
      const ly = top - 22; svg += `<line x1="0" y1="${top}" x2="0" y2="${ly}" stroke="${INK}" stroke-width="2"/>` + lamp(0, ly, k.light, 9); top = ly - 20;
    }
    return { svg, top, H };
  }
  function defaultForm(kind) { const s = KINDS[kind].shape; return s; }

  /* mark(kind, opts) — a navigation mark on water, large and clear. opts.form: buoy | perch | can | cone | spar; opts.light: true */
  function mark(kind, opts) {
    opts = opts || {};
    if (!KINDS[kind]) throw bad('mark kind', kind, KIND_NAMES);
    let form = opts.form || 'buoy';
    if (!FORMS.includes(form)) throw bad('mark form', form, FORMS);
    if ((form === 'can' || form === 'cone') && !LATERALS.includes(kind)) throw new Error(`mark form "${form}" is only for lateral kinds (${LATERALS.join(', ')})`);
    if (form === 'buoy') form = defaultForm(kind);
    const k = KINDS[kind], Wd = 360, Ht = 440, wl = 330, cx = Wd / 2;
    const m = drawMark(kind, form, { light: !!opts.light });
    let inner = water(0, wl, Wd, 42) + `<g transform="translate(${cx},${wl})">${m.svg}</g>`;
    inner += title(Wd, 26, k.name, 18);
    const sub = form === 'spar' ? `Norwegian spar buoy: ${k.spar} top, no topmark, reflective band${k.reflex.length > 1 ? 's' : ''}` :
      form === 'perch' ? 'Norwegian fixed perch on a rock — the topmark gives the meaning' : '';
    if (sub) inner += note(cx, 48, sub, { size: 12, fill: MUTED });
    inner += note(cx, wl + 62, 'Light: ' + k.charText, { size: 12.5, weight: 600, fill: INK });
    /* wrap the pass rule on two lines */
    const words = k.pass.split(' '); let l1 = '', l2 = '';
    words.forEach(w => { if (l1.length < 52 && !l2) l1 += (l1 ? ' ' : '') + w; else l2 += (l2 ? ' ' : '') + w; });
    inner += note(cx, wl + 84, l1) + (l2 ? note(cx, wl + 101, l2) : '');
    const label = `${k.name}: ${form === 'spar' ? 'Norwegian spar buoy, ' + k.spar + ' top, ' : ''}${k.vertical ? 'vertical stripes' : 'colour bands top to bottom'} ${k.bands.map(b => colourName(b[0])).join(k.vertical ? '/' : ' over ')}${m.H && form !== 'spar' ? ', topmark ' + topmarkName(k.top) : ''}. Light ${k.charText}. ${k.pass}.`;
    return S.svg(Wd, Ht, inner, { label });
  }
  function colourName(c) { return c === R ? 'red' : c === G ? 'green' : c === Y ? 'yellow' : c === B ? 'black' : c === W ? 'white' : c === BU ? 'blue' : 'colour'; }
  function topmarkName(t) { return { can: 'red can', 'cone-up': 'green cone point up', 'cones-up': 'two black cones points up', 'cones-down': 'two black cones points down', 'cones-base': 'two black cones base to base', 'cones-point': 'two black cones point to point', 'two-balls': 'two black spheres', ball: 'one red sphere', x: 'yellow X', plus: 'upright yellow cross' }[t]; }

  /* cardinalCompass() — a danger in the centre with the four cardinal marks placed N/E/S/W of it. */
  function cardinalCompass() {
    const Wd = 640, Ht = 640, cx = 320, cy = 330, sc = 0.55;
    let inner = `<rect width="${Wd}" height="${Ht}" fill="${SHALLOW}" opacity=".55" rx="8"/>`;
    inner += title(Wd, 24, 'Cardinal marks: the name says on which side to pass', 17);
    /* quadrant boundaries NW–NE, NE–SE, SE–SW, SW–NW (true bearings 315°, 045°, 135°, 225° from the danger) */
    [45, 135, 225, 315].forEach(a => {
      const x = cx + 300 * Math.sin(deg(a)), y = cy - 300 * Math.cos(deg(a));
      inner += `<line x1="${cx}" y1="${cy}" x2="${fx(x)}" y2="${fx(y)}" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="6 5"/>`;
      const lx = cx + 215 * Math.sin(deg(a)), ly = cy - 215 * Math.cos(deg(a));
      inner += T(lx, ly, { 45: 'NE 045°', 135: 'SE 135°', 225: 'SW 225°', 315: 'NW 315°' }[a], { size: 11, fill: MUTED });
    });
    /* the danger */
    inner += rockBlob(cx, cy, 30, MUTED) + T(cx, cy + 2, 'DANGER', { size: 11, weight: 700, fill: PAPER }) + `<text x="${cx}" y="${cy - 40}" font-size="12" fill="${INK2}" text-anchor="middle">rock / shoal</text>`;
    const place = [
      { kind: 'cardinal-n', x: cx, wl: 215, letter: 'N', lx: cx - 95, ly: 120, boat: [cx + 125, 95, 270], side: 'pass NORTH of it', bx: cx + 125, by: 125 },
      { kind: 'cardinal-e', x: 545, wl: cy + 60, letter: 'E', lx: 545, ly: cy + 85, boat: [605, cy - 95, 0], side: 'pass EAST', bx: 598, by: cy - 55 },
      { kind: 'cardinal-s', x: cx, wl: 560, letter: 'S', lx: cx - 95, ly: 470, boat: [cx + 125, 600, 90], side: 'pass SOUTH of it', bx: cx + 125, by: 625 },
      { kind: 'cardinal-w', x: 95, wl: cy + 60, letter: 'W', lx: 95, ly: cy + 85, boat: [40, cy - 95, 180], side: 'pass WEST', bx: 42, by: cy - 55 },
    ];
    place.forEach(p => {
      const k = KINDS[p.kind], m = drawMark(p.kind, 'pillar', { idSuffix: '-cc' });
      inner += `<g transform="translate(${p.x},${p.wl}) scale(${sc})">${m.svg}</g>`;
      inner += T(p.lx, p.ly, p.letter, { size: 26, weight: 800 });
      inner += note(p.x, p.wl + 16, k.charText.replace(' W', '').replace('(continuous quick flashes)', ''), { size: 11, fill: INK2 }) + note(p.x, p.wl + 30, 'white light', { size: 11, fill: MUTED });
      inner += boatPlan(p.boat[0], p.boat[1], p.boat[2], 34) + note(p.bx, p.by, p.side, { size: 11, weight: 600 });
    });
    /* clock-face mnemonic */
    const kx = 78, ky = 92, kr = 46;
    inner += `<circle cx="${kx}" cy="${ky}" r="${kr}" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>`;
    [['12', 0, 'N: continuous'], ['3', 90, 'E: 3 flashes'], ['6', 180, 'S: 6 + long'], ['9', 270, 'W: 9 flashes']].forEach(([n, a]) => {
      inner += T(kx + (kr - 11) * Math.sin(deg(a)), ky - (kr - 11) * Math.cos(deg(a)), n, { size: 12, weight: 700 });
    });
    inner += `<line x1="${kx}" y1="${ky}" x2="${kx}" y2="${ky - 24}" stroke="${INK}" stroke-width="2"/><line x1="${kx}" y1="${ky}" x2="${kx + 18}" y2="${ky}" stroke="${INK}" stroke-width="2"/>`;
    inner += note(kx, ky + kr + 14, 'Clock face: 3 = E, 6 = S, 9 = W', { size: 11 }) + note(kx, ky + kr + 28, '12 = N (continuous)', { size: 11 });
    inner += note(cx, Ht - 12, 'Cones point towards the black band: up = N, down = S, outward (base to base) = E, inward (point to point) = W', { size: 11.5 });
    return S.svg(Wd, Ht, inner, { label: 'Cardinal marks around a danger: north mark (black over yellow, cones up) to the north, east mark (black-yellow-black, cones base to base) to the east, south mark (yellow over black, cones down) to the south, west mark (yellow-black-yellow, cones point to point) to the west. Pass on the named side. Clock face: 3 flashes east, 6 south, 9 west, continuous north.' });
  }

  /* lateralChannel(opts) — plan view of a channel entered from seaward (bottom) towards the harbour (top). */
  function lateralChannel(opts) {
    opts = opts || {};
    const Wd = 480, Ht = 600, sc = 0.32;
    let inner = `<rect width="${Wd}" height="${Ht}" fill="${SHALLOW}" rx="8"/>`;
    const landL = `M0,0 L0,${Ht} L80,${Ht} Q110,520 125,420 Q140,300 135,200 Q130,120 170,60 Q190,30 175,0 Z`;
    const landR = `M${Wd},0 L${Wd},${Ht} L400,${Ht} Q370,520 355,420 Q340,300 345,200 Q350,120 310,60 Q290,30 305,0 Z`;
    inner += `<path d="${landL}" fill="${PAPER2}" stroke="${LINE}" stroke-width="1.5"/><path d="${landR}" fill="${PAPER2}" stroke="${LINE}" stroke-width="1.5"/>`;
    inner += title(Wd, 24, 'HARBOUR', 15) + T(240, Ht - 14, 'OPEN SEA', { size: 15, weight: 700 });
    /* direction of buoyage: magenta arrow with an open head and two circles at the tail (INT1 Q130.2) */
    inner += arrow(240, 530, 240, 90, MAGENTA, { width: 3, head: 18, open: true }) + `<circle cx="233" cy="536" r="4" fill="${MAGENTA}"/><circle cx="247" cy="536" r="4" fill="${MAGENTA}"/>`;
    inner += `<text x="252" y="300" font-size="12.5" font-weight="700" fill="${MAGENTA}" transform="rotate(-90 252 300)" text-anchor="middle">direction of buoyage (from seaward)</text>`;
    /* marks: red cans on the left (port), green cones on the right (starboard) */
    [150, 290, 430].forEach((y, i) => {
      inner += `<g transform="translate(150,${y}) scale(${sc})">${drawMark('lateral-port', 'can', { idSuffix: '-lc' + i }).svg}</g>`;
      inner += `<g transform="translate(330,${y}) scale(${sc})">${drawMark('lateral-starboard', 'cone', { idSuffix: '-lc' + i }).svg}</g>`;
      inner += T(150, y + 14, `${(i + 1) * 2}`, { size: 11, weight: 700 }) + T(330, y + 14, `${i * 2 + 1}`, { size: 11, weight: 700 });
    });
    inner += note(60, 300, 'RED', { size: 13, weight: 700, fill: R }) + note(60, 316, 'cans', { size: 12 }) + note(60, 332, 'even nos.', { size: 11, fill: MUTED });
    inner += note(420, 300, 'GREEN', { size: 13, weight: 700, fill: G }) + note(420, 316, 'cones', { size: 12 }) + note(420, 332, 'odd nos.', { size: 11, fill: MUTED });
    /* boat entering: keeps to its starboard side of the channel */
    inner += boatPlan(290, 450, 0, 44);
    inner += T(290, 490, 'entering', { size: 12, weight: 700 }) + T(290, 505, 'red to PORT, green to STARBOARD', { size: 11.5 });
    inner += arrow(275, 450, 185, 450, R, { width: 1.5, head: 8, dash: '4 3' }) + arrow(305, 450, 310, 450, G, { width: 1.5, head: 8 });
    /* boat leaving */
    inner += boatPlan(190, 215, 180, 44);
    inner += T(190, 250, 'leaving', { size: 12, weight: 700 }) + T(190, 265, 'red on STARBOARD, green on PORT', { size: 11.5 });
    inner += note(240, 560, 'Travelling WITH the direction of buoyage: red cans on your left, green cones on your right (IALA Region A)', { size: 11 });
    return S.svg(Wd, Ht, inner, { label: 'Channel entered from seaward (bottom) to the harbour (top). Magenta arrow shows the direction of buoyage. Red can marks with even numbers on the left (port), green cone marks with odd numbers on the right (starboard). A boat entering keeps red to port and green to starboard; a boat leaving has red on its starboard and green on its port side.' });
  }

  /* ---------- light rhythms ---------- */
  const LIGHT_COLOURS = { W: W, R: R, G: G, Y: Y, Bu: BU };
  /* parse a characteristic such as 'Fl(2+1) 10s', 'Q(6)+LFl 15s', 'Al WR', 'Oc Y 2s'. Returns { type, group, plusLFl, colours, period } */
  function parseChar(spec) {
    const s0 = String(spec).trim();
    const m = /^(LFl|Fl|F|VQ|Q|UQ|IVQ|IQ|Iso|Oc|Mo|Al)(?:\(([A-Za-z0-9+]+)\))?(\+LFl)?((?:\s+(?:W|R|G|Y|Bu|WR|WG|RG|BuY|RW|GW|WRG))*)\s*(?:(\d+(?:[.,]\d+)?)\s*s)?$/.exec(s0);
    if (!m) throw new Error(`lightRhythm: cannot read characteristic "${spec}". Examples: F, Fl 5s, Fl(2) 10s, LFl 10s, Q, VQ, Q(3) 10s, VQ(3) 5s, Q(6)+LFl 15s, Q(9) 15s, Iso 4s, Oc 6s, Oc(2) 10s, Mo(A) 8s, Fl(2+1) 10s, Al WR`);
    const colours = m[4].trim() ? m[4].trim().split(/\s+/).join('').match(/Bu|W|R|G|Y/g) : null;
    return { type: m[1], group: m[2] || null, plusLFl: !!m[3], colours, period: m[5] ? parseFloat(m[5].replace(',', '.')) : null };
  }
  /* build the on-intervals [[start, end, colourKey], ...] and the period */
  function rhythmIntervals(p) {
    const on = []; let P = p.period; const n = p.group && /^\d+$/.test(p.group) ? parseInt(p.group, 10) : null;
    const flashes = (count, step, dur, start) => { for (let i = 0; i < count; i++) on.push([start + i * step, start + i * step + dur]); };
    switch (p.type) {
      case 'F': P = P || 10; on.push([0, P]); break;
      case 'Fl':
        if (p.group === '2+1') { P = P || 10; flashes(2, 1, .5, 0); on.push([3, 3.5]); }
        else if (n) { P = P || Math.max(10, n + 5); flashes(n, 1, .5, 0); }
        else { P = P || 4; on.push([0, .5]); }
        break;
      case 'LFl': P = P || 10; on.push([0, 2]); break;
      case 'Q': case 'IQ':
        if (n) { P = P || (p.plusLFl ? 15 : 10); flashes(n, 1, .5, 0); if (p.plusLFl) on.push([n + 1, n + 3]); }
        else { P = P || 10; flashes(Math.round(P), 1, .5, 0); }
        break;
      case 'VQ': case 'IVQ':
        if (n) { P = P || (p.plusLFl ? 10 : 5); flashes(n, .5, .25, 0); if (p.plusLFl) on.push([n * .5 + .75, n * .5 + 2.75]); }
        else { P = P || 10; flashes(Math.round(P * 2), .5, .25, 0); }
        break;
      case 'UQ': P = P || 10; flashes(Math.round(P * 4), .25, .125, 0); break;
      case 'Iso': P = P || 4; on.push([0, P / 2]); break;
      case 'Oc':
        P = P || 4;
        if (n) { /* group occulting: n short eclipses of 1 s separated by 1 s of light at the end of the period */
          const eclipses = []; for (let i = 0; i < n; i++) eclipses.push([P - (2 * n - 1 - 2 * i), P - (2 * n - 2 - 2 * i)]);
          let t = 0; eclipses.forEach(e => { on.push([t, e[0]]); t = e[1]; }); if (t < P) on.push([t, P]);
        } else on.push([0, P - Math.min(1, P / 4)]);
        break;
      case 'Mo': {
        const code = { A: '.-', D: '-..', U: '..-' }[(p.group || 'A').toUpperCase()] || '.-'; P = P || 8; let t = 0;
        code.split('').forEach(c => { const d = c === '.' ? .5 : 1.5; on.push([t, t + d]); t += d + .5; });
        break;
      }
      case 'Al': { const cs = p.colours || ['W', 'R']; P = P || 4; const d = P / cs.length; cs.forEach((c, i) => on.push([i * d, (i + 1) * d, c])); break; }
    }
    return { on, P };
  }
  const TYPE_NAMES = { F: 'Fixed — steady light', Fl: 'Flashing — light shorter than dark', LFl: 'Long flash — 2 s or longer', Q: 'Quick — 50–60 flashes per minute', VQ: 'Very quick — 100–120 flashes per minute', UQ: 'Ultra quick — 160+ per minute', IQ: 'Interrupted quick', IVQ: 'Interrupted very quick', Iso: 'Isophase — light and dark equal', Oc: 'Occulting — light longer than dark', Mo: 'Morse code letter', Al: 'Alternating — colour changes, no eclipse' };
  /* lightRhythm(spec, opts) — timeline of one period: light on = coloured block, off = dark. opts.color: W | R | G | Y | Bu */
  function lightRhythm(spec, opts) {
    opts = opts || {};
    const p = parseChar(spec);
    const colKey = opts.color || (p.colours && p.colours.length === 1 ? p.colours[0] : 'W');
    if (!LIGHT_COLOURS[colKey]) throw bad('lightRhythm colour', colKey, Object.keys(LIGHT_COLOURS));
    const { on, P } = rhythmIntervals(p);
    const Wd = 640, Ht = 170, x0 = 46, x1 = 606, by = 64, bh = 48, sx = (x1 - x0) / P;
    let inner = title(Wd, 22, spec + (p.type === 'Al' ? '' : ' ' + (p.colours ? '' : colKey)).trim(), 18);
    const desc = TYPE_NAMES[p.type] + (p.group && p.type !== 'Mo' && p.type !== 'Al' ? `, group of ${p.group}` : '') + (p.plusLFl ? ' plus one long flash' : '') + (p.type === 'Mo' ? ` "${(p.group || 'A').toUpperCase()}"` : '');
    inner += note(Wd / 2, 42, desc, { size: 12.5 });
    inner += `<rect x="${x0}" y="${by}" width="${x1 - x0}" height="${bh}" fill="${C.night}" rx="3"/>`;
    on.forEach(iv => {
      const col = LIGHT_COLOURS[iv[2] || colKey];
      const xa = x0 + iv[0] * sx, xb = x0 + Math.min(iv[1], P) * sx;
      inner += `<rect x="${fx(xa)}" y="${by + 3}" width="${fx(Math.max(xb - xa, 1.5))}" height="${bh - 6}" fill="${col}" rx="2"/>`;
      if (iv[2]) inner += T((xa + xb) / 2, by + bh / 2, iv[2] === 'W' ? 'white' : iv[2] === 'R' ? 'red' : iv[2] === 'G' ? 'green' : iv[2] === 'Y' ? 'yellow' : 'blue', { size: 12, weight: 700, fill: iv[2] === 'W' || iv[2] === 'Y' ? C.night : C.white });
    });
    inner += `<rect x="${x0}" y="${by}" width="${x1 - x0}" height="${bh}" fill="none" stroke="${INK2}" stroke-width="1"/>`;
    /* ticks every second */
    const step = P <= 16 ? 1 : P <= 40 ? 5 : 10;
    for (let t = 0; t <= P + 1e-9; t += step) {
      const x = x0 + t * sx; inner += `<line x1="${fx(x)}" y1="${by + bh}" x2="${fx(x)}" y2="${by + bh + 7}" stroke="${INK2}" stroke-width="1"/>` + T(x, by + bh + 19, `${t}`, { size: 11, fill: INK2 });
    }
    inner += T(Wd / 2, by + bh + 36, 'seconds', { size: 11, fill: MUTED });
    const isCont = (p.type === 'Q' || p.type === 'VQ' || p.type === 'UQ') && !p.group;
    inner += `<path d="M${x0},${by - 8} v-5 H${x1} v5" fill="none" stroke="${INK2}" stroke-width="1"/>` + T((x0 + x1) / 2, by - 18, isCont ? `continuous (${P} s shown)` : p.type === 'F' ? 'steady (no period)' : `one period = ${P} s`, { size: 11.5, fill: INK2, weight: 600 });
    inner += `<rect x="${x0}" y="${Ht - 22}" width="12" height="12" fill="${LIGHT_COLOURS[colKey]}" stroke="${INK2}" stroke-width=".8"/>` + T(x0 + 18, Ht - 16, 'light on', { size: 11, anchor: 'start', fill: INK2 }) + `<rect x="${x0 + 80}" y="${Ht - 22}" width="12" height="12" fill="${C.night}"/>` + T(x0 + 98, Ht - 16, 'dark (eclipse)', { size: 11, anchor: 'start', fill: INK2 });
    return S.svg(Wd, Ht, inner, { label: `Light rhythm ${spec}: ${desc}; ${isCont ? 'continuous' : 'period ' + P + ' seconds'}; colour ${colKey}.` });
  }
