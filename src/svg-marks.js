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
    /* The blunt/pointed top rule is verified only for lateral and cardinal spars (DNL1, F14/F30): `spar: null` below
       means "draw a plain top and make no claim". Reflectors: isolated danger blue over red (F35), safe water red over
       white (F39), special one yellow band (F41); none is documented for the wreck buoy, so it gets no reflex bands. */
    'isolated-danger':   { name: 'Isolated danger mark', bands: [[B, .3], [R, .4], [B, .3]], shape: 'pillar', top: 'two-balls', topColor: B, light: W, charText: 'Fl(2) W', pass: 'Danger directly beneath; navigable water all around — pass either side at a safe distance', spar: null, reflex: [BU, R], abbr: 'BRB' },
    'safe-water':        { name: 'Safe water mark (centre fairway)', bands: [[R, 1], [W, 1], [R, 1], [W, 1], [R, 1], [W, 1]], vertical: true, shape: 'sphere', top: 'ball', topColor: R, light: W, charText: 'Iso W / Oc W / LFl 10s W / Mo(A) W', pass: 'Navigable water all around: mid-channel, landfall or best passage under a bridge', spar: null, reflex: [R, W], abbr: 'RW' },
    'special':           { name: 'Special mark', bands: [[Y, 1]], shape: 'pillar', top: 'x', topColor: Y, light: Y, charText: 'Fl(4) Y typical — any rhythm not used for white', pass: 'Marks a special area or feature shown on the chart (fish farm, cable, bathing area, anchorage)', spar: null, reflex: [Y], abbr: 'Y' },
    'wreck':             { name: 'Emergency wreck marking buoy', bands: [[BU, 1], [Y, 1], [BU, 1], [Y, 1], [BU, 1], [Y, 1]], vertical: true, shape: 'pillar', top: 'plus', topColor: Y, light: [BU, Y], charText: 'Al Bu/Y: 1 s blue, 1 s yellow, 0.5 s dark between', pass: 'A NEW danger (wreck) — keep well clear and check Notices to Mariners', spar: null, reflex: [], abbr: 'BuY' },
  };
  const KIND_NAMES = Object.keys(KINDS);
  const FORMS = ['buoy', 'perch', 'can', 'cone', 'spar'];
  const LATERALS = ['lateral-port', 'lateral-starboard', 'preferred-starboard', 'preferred-port'];
  /* Preferred-channel marks are not used in Norwegian waters (INT1 Q130 note 1, fact F19) and the emergency wreck
     buoy is a floating pillar/spar (IALA Table 11, F45): the Norwegian perch/spar forms exist only for the others.
     ILLUSTRATIONS.md allows every form for every kind; the fact sheet wins, so these combinations throw. */
  const NO_NORWEGIAN_FORMS = ['preferred-starboard', 'preferred-port'];
  const NO_PERCH = NO_NORWEGIAN_FORMS.concat(['wreck']);

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
      /* reflective bands (blue replaces black), 20 cm wide, near the top: drawn as the band colour with a fine lighter
         hatch (reflective tape) and a thin grey outline, so a red band on a red body does not read as white stripes */
      if (k.reflex.length) body += `<defs><pattern id="${id}-rx" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${W}" stroke-width="1.2" opacity=".45"/></pattern></defs>`;
      k.reflex.forEach((c, i) => { const y = -(H - 40) + i * 22; body += `<rect x="${-halfW}" y="${y}" width="${2 * halfW}" height="12" fill="${c}"/><rect x="${-halfW}" y="${y}" width="${2 * halfW}" height="12" fill="url(#${id}-rx)" stroke="${INK2}" stroke-width=".8"/>`; });
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
      /* lantern: a fixed dark housing behind the disc so a WHITE light is visible on light paper too */
      const ly = top - 24; svg += `<line x1="0" y1="${top}" x2="0" y2="${ly}" stroke="${INK}" stroke-width="2"/><rect x="-13" y="${ly - 13}" width="26" height="26" rx="6" fill="${C.hullDark}"/>` + lamp(0, ly, k.light, 9); top = ly - 22;
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
    if ((form === 'spar' || form === 'perch') && NO_NORWEGIAN_FORMS.includes(kind)) throw new Error(`mark form "${form}" is not available for "${kind}": preferred-channel marks are not used in Norwegian waters (INT1 Q130). Use form "buoy".`);
    if (form === 'perch' && NO_PERCH.includes(kind)) throw new Error(`mark form "perch" is not available for "${kind}": the emergency wreck marking buoy is a floating pillar or spar buoy (IALA). Use form "buoy" or "spar".`);
    if (form === 'buoy') form = defaultForm(kind);
    const k = KINDS[kind], Wd = 360, Ht = 440, wl = 330, cx = Wd / 2;
    const m = drawMark(kind, form, { light: !!opts.light });
    const sc = Math.min(1.3, 262 / (-m.top + 8)); /* fill the space above the waterline */
    let inner = water(0, wl, Wd, 42);
    /* isolated danger: the danger lies directly beneath the mark (IL-7) */
    if (kind === 'isolated-danger' && form !== 'perch') inner += `<g opacity=".7">${rockBlob(cx, wl + 26, 24, MUTED)}</g>` + T(cx, wl + 22, 'rock', { size: 11, weight: 700, fill: PAPER });
    inner += `<g transform="translate(${cx},${wl}) scale(${fx(sc)})">${m.svg}</g>`;
    if (form === 'spar' && k.reflex.length) { /* pointer to the reflective band(s) near the top of the spar */
      const by0 = wl - sc * (m.H - 40), by1 = by0 + sc * (12 + (k.reflex.length - 1) * 22), bx = cx + sc * 13;
      inner += `<line x1="${fx(bx)}" y1="${fx((by0 + by1) / 2)}" x2="${fx(bx + 26)}" y2="${fx((by0 + by1) / 2)}" stroke="${INK2}" stroke-width="1"/>` + T(bx + 30, (by0 + by1) / 2, `reflective band${k.reflex.length > 1 ? 's' : ''}`, { size: 11, anchor: 'start', fill: INK2 });
    }
    inner += title(Wd, 26, k.name, 18);
    const sub = form === 'spar' ? (k.spar ? `Norwegian spar buoy: ${k.spar} top, no topmark, reflective band${k.reflex.length > 1 ? 's' : ''}` : `Spar form: no topmark — read the colours${k.reflex.length ? ' and reflex bands' : ''}`) :
      form === 'perch' ? 'Norwegian fixed perch on a rock — the topmark gives the meaning' : '';
    if (sub) inner += note(cx, 48, sub, { size: 12, fill: MUTED });
    inner += note(cx, wl + 62, 'Light: ' + k.charText, { size: 12.5, weight: 600, fill: INK });
    /* wrap the pass rule on two lines */
    const words = k.pass.split(' '); let l1 = '', l2 = '';
    words.forEach(w => { if (l1.length < 52 && !l2) l1 += (l1 ? ' ' : '') + w; else l2 += (l2 ? ' ' : '') + w; });
    inner += note(cx, wl + 84, l1) + (l2 ? note(cx, wl + 101, l2) : '');
    const label = `${k.name}: ${form === 'spar' ? 'spar buoy without topmark, ' + (k.spar ? k.spar + ' top, ' : '') : ''}${k.vertical ? 'vertical stripes' : 'colour bands top to bottom'} ${k.bands.map(b => colourName(b[0])).join(k.vertical ? '/' : ' over ')}${m.H && form !== 'spar' ? ', topmark ' + topmarkName(k.top) : ''}. Light ${k.charText}. ${k.pass}.`;
    return S.svg(Wd, Ht, inner, { label });
  }
  function colourName(c) { return c === R ? 'red' : c === G ? 'green' : c === Y ? 'yellow' : c === B ? 'black' : c === W ? 'white' : c === BU ? 'blue' : 'colour'; }
  function topmarkName(t) { return { can: 'red can', 'cone-up': 'green cone point up', 'cones-up': 'two black cones points up', 'cones-down': 'two black cones points down', 'cones-base': 'two black cones base to base', 'cones-point': 'two black cones point to point', 'two-balls': 'two black spheres', ball: 'one red sphere', x: 'yellow X', plus: 'upright yellow cross' }[t]; }

  /* cardinalCompass() — a danger in the centre with the four cardinal marks placed N/E/S/W of it. */
  function cardinalCompass() {
    const Wd = 640, Ht = 664, cx = 320, cy = 330, sc = 0.55;
    let inner = `<rect width="${Wd}" height="${Ht}" fill="${SHALLOW}" opacity=".55" rx="8"/>`;
    inner += title(Wd, 24, 'Cardinal marks: the name says on which side to pass', 17);
    /* quadrant boundaries NW–NE, NE–SE, SE–SW, SW–NW (true bearings 315°, 045°, 135°, 225° from the danger) */
    [45, 135, 225, 315].forEach(a => {
      const x = cx + 240 * Math.sin(deg(a)), y = cy - 240 * Math.cos(deg(a));
      inner += `<line x1="${cx}" y1="${cy}" x2="${fx(x)}" y2="${fx(y)}" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="6 5"/>`;
      /* label offset sideways from the dashed line, on a small paper box, so the line does not run through the text */
      const lx = cx + 215 * Math.sin(deg(a)) + 20 * Math.cos(deg(a)), ly = cy - 215 * Math.cos(deg(a)) + 20 * Math.sin(deg(a));
      inner += `<rect x="${fx(lx - 25)}" y="${fx(ly - 8)}" width="50" height="16" rx="3" fill="${PAPER}" opacity=".85"/>` + T(lx, ly, { 45: 'NE 045°', 135: 'SE 135°', 225: 'SW 225°', 315: 'NW 315°' }[a], { size: 11, fill: MUTED });
    });
    /* the danger */
    inner += rockBlob(cx, cy, 30, MUTED) + T(cx, cy + 2, 'DANGER', { size: 11, weight: 700, fill: PAPER }) + `<text x="${cx}" y="${cy - 40}" font-size="12" fill="${INK2}" text-anchor="middle">rock / shoal</text>`;
    const place = [
      { kind: 'cardinal-n', x: cx, wl: 215, letter: 'N', lx: cx - 95, ly: 120, boat: [cx + 125, 95, 270], side: 'pass NORTH of it', bx: cx + 125, by: 125 },
      { kind: 'cardinal-e', x: 545, wl: cy + 60, letter: 'E', lx: 606, ly: cy + 45, boat: [605, cy - 95, 0], side: 'pass EAST', bx: 598, by: cy - 55 },
      { kind: 'cardinal-s', x: cx, wl: 560, letter: 'S', lx: cx - 95, ly: 470, boat: [cx + 125, 600, 90], side: 'pass SOUTH of it', bx: cx + 125, by: 625 },
      { kind: 'cardinal-w', x: 95, wl: cy + 60, letter: 'W', lx: 36, ly: cy + 45, boat: [40, cy - 95, 180], side: 'pass WEST', bx: 42, by: cy - 55 },
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
    inner += note(cx, Ht - 14, 'Cones point towards the black band: up = N, down = S, outward (base to base) = E, inward (point to point) = W', { size: 11.5 });
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
    /* marks: red cans on the left (port), green cones on the right (starboard). Numbers follow the direction of
       buoyage (IALA §2.1.1.2, F9): 1/2 are the first pair met from seaward (bottom), numbers grow towards the harbour. */
    [430, 290, 150].forEach((y, i) => {
      inner += `<g transform="translate(150,${y}) scale(${sc})">${drawMark('lateral-port', 'can', { idSuffix: '-lc' + i }).svg}</g>`;
      inner += `<g transform="translate(330,${y}) scale(${sc})">${drawMark('lateral-starboard', 'cone', { idSuffix: '-lc' + i }).svg}</g>`;
      inner += T(150, y + 14, `${(i + 1) * 2}`, { size: 11, weight: 700 }) + T(330, y + 14, `${i * 2 + 1}`, { size: 11, weight: 700 });
    });
    inner += note(60, 300, 'RED', { size: 13, weight: 700, fill: R }) + note(60, 316, 'cans', { size: 12 }) + note(60, 332, 'even nos.', { size: 11, fill: MUTED });
    inner += note(420, 300, 'GREEN', { size: 13, weight: 700, fill: G }) + note(420, 316, 'cones', { size: 12 }) + note(420, 332, 'odd nos.', { size: 11, fill: MUTED });
    inner += note(60, 348, 'numbers grow', { size: 10.5, fill: MUTED }) + note(60, 361, 'from seaward', { size: 10.5, fill: MUTED });
    /* boat entering: keeps to its starboard side of the channel */
    inner += boatPlan(290, 450, 0, 44);
    inner += T(305, 490, 'entering:', { size: 12, weight: 700 }) + T(305, 505, 'red to PORT,', { size: 11.5 }) + T(305, 519, 'green to STARBOARD', { size: 11.5 });
    /* boat leaving */
    inner += boatPlan(192, 215, 180, 44);
    inner += T(66, 206, 'leaving:', { size: 12, weight: 700 }) + T(66, 221, 'red on STARBOARD,', { size: 11.5 }) + T(66, 235, 'green on PORT', { size: 11.5 });
    inner += `<line x1="118" y1="226" x2="172" y2="219" stroke="${INK2}" stroke-width="1" stroke-dasharray="3 3"/>`;
    inner += note(240, 560, 'With the direction of buoyage: red cans on your left, green cones on your right', { size: 11 });
    return S.svg(Wd, Ht, inner, { label: 'Channel entered from seaward (bottom) to the harbour (top). Magenta arrow shows the direction of buoyage. Red can marks with even numbers on the left (port), green cone marks with odd numbers on the right (starboard); numbering starts with 1 and 2 at the seaward end and increases in the direction of buoyage. A boat entering keeps red to port and green to starboard; a boat leaving has red on its starboard and green on its port side.' });
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
        } else if (P === 2 && p.colours && p.colours.includes('Y')) on.push([0, 1.25]); /* fish-farm marks Oc Y 2s: 1.25 s light / 0.75 s dark (FOR-2012-12-19-1329 Vedlegg 2, F44) */
        else on.push([0, P - Math.min(1, P / 4)]);
        break;
      case 'Mo': {
        const code = { A: '.-', D: '-..', U: '..-' }[(p.group || 'A').toUpperCase()] || '.-'; P = P || 8; let t = 0;
        code.split('').forEach(c => { const d = c === '.' ? .5 : 1.5; on.push([t, t + d]); t += d + .5; });
        break;
      }
      case 'Al': {
        const cs = p.colours || ['W', 'R'];
        if (cs.includes('Bu')) { /* emergency wreck buoy: 1 s blue, 0.5 s dark, 1 s yellow, 0.5 s dark (IALA Table 11, F45) */
          P = P || 3; const d = (P - 1) / 2; on.push([0, d, 'Bu']); on.push([d + .5, 2 * d + .5, cs.includes('Y') ? 'Y' : cs[1] || 'Y']);
        } else { P = P || 4; const d = P / cs.length; cs.forEach((c, i) => on.push([i * d, (i + 1) * d, c])); }
        break;
      }
    }
    return { on, P };
  }
  const TYPE_NAMES = { F: 'Fixed — steady light', Fl: 'Flashing — light shorter than dark', LFl: 'Long flash — 2 s or longer', Q: 'Quick — 50–60 flashes per minute', VQ: 'Very quick — 100–120 flashes per minute', UQ: 'Ultra quick — 160+ per minute', IQ: 'Interrupted quick', IVQ: 'Interrupted very quick', Iso: 'Isophase — light and dark equal', Oc: 'Occulting — light longer than dark', Mo: 'Morse code letter', Al: 'Alternating — colour changes, no eclipse' };
  /* lightRhythm(spec, opts) — timeline of one period: light on = coloured block, off = dark. opts.color: W | R | G | Y | Bu */
  function lightRhythm(spec, opts) {
    opts = opts || {};
    const p = parseChar(spec);
    /* composite group flashing Fl(2+1) exists only on preferred-channel marks, which are red or green (F17/F18): default red */
    const colKey = opts.color || (p.colours && p.colours.length === 1 ? p.colours[0] : p.type === 'Fl' && p.group === '2+1' ? 'R' : 'W');
    if (p.type === 'Fl' && p.group === '2+1' && colKey !== 'R' && colKey !== 'G') throw new Error(`lightRhythm: Fl(2+1) is used only on preferred-channel marks, which are red or green — colour "${colKey}" is not possible`);
    if (!LIGHT_COLOURS[colKey]) throw bad('lightRhythm colour', colKey, Object.keys(LIGHT_COLOURS));
    const { on, P } = rhythmIntervals(p);
    const Wd = 640, Ht = 186, x0 = 46, x1 = 606, by = 78, bh = 48, sx = (x1 - x0) / P;
    const heading = (p.type === 'Al' || p.colours) ? spec : `${spec} ${colKey}`;
    let inner = title(Wd, 22, heading, 18);
    const wreckAl = p.type === 'Al' && p.colours && p.colours.includes('Bu');
    const fishFarm = p.type === 'Oc' && !p.group && P === 2 && p.colours && p.colours.includes('Y');
    const desc = wreckAl ? 'Alternating blue / yellow with 0.5 s dark between (emergency wreck buoy)' :
      fishFarm ? 'Occulting: 1.25 s light / 0.75 s dark (Norwegian fish-farm marks)' :
      TYPE_NAMES[p.type] + (p.group && p.type !== 'Mo' && p.type !== 'Al' ? `, group of ${p.group}` : '') + (p.plusLFl ? ' plus one long flash' : '') + (p.type === 'Mo' ? ` "${(p.group || 'A').toUpperCase()}"` : '') +
      (p.type === 'Fl' && p.group === '2+1' ? ' — preferred-channel marks only: red or green' : '');
    inner += note(Wd / 2, 41, desc, { size: 12.5 });
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
    inner += T(Wd / 2, by + bh + 34, 'seconds', { size: 11, fill: MUTED });
    const isCont = (p.type === 'Q' || p.type === 'VQ' || p.type === 'UQ') && !p.group;
    inner += `<path d="M${x0},${by - 8} v-5 H${x1} v5" fill="none" stroke="${INK2}" stroke-width="1"/>` + T((x0 + x1) / 2, by - 18, isCont ? `continuous (${P} s shown)` : p.type === 'F' ? 'steady (no period)' : `one period = ${P} s`, { size: 11.5, fill: INK2, weight: 600 });
    /* legend: one swatch per colour shown in the bar (two for alternating lights) */
    const swatches = p.type === 'Al' ? Array.from(new Set(on.map(iv => iv[2]))) : [colKey];
    let sxl = x0 + 380 - (swatches.length - 1) * 14;
    swatches.forEach(c => { inner += `<rect x="${sxl}" y="${Ht - 22}" width="12" height="12" fill="${LIGHT_COLOURS[c]}" stroke="${INK2}" stroke-width=".8"/>`; sxl += 14; });
    inner += T(sxl + 4, Ht - 16, 'light on', { size: 11, anchor: 'start', fill: INK2 }) + `<rect x="${x0 + 460}" y="${Ht - 22}" width="12" height="12" fill="${C.night}"/>` + T(x0 + 478, Ht - 16, 'dark (eclipse)', { size: 11, anchor: 'start', fill: INK2 });
    return S.svg(Wd, Ht, inner, { label: `Light rhythm ${spec}: ${desc}; ${isCont ? 'continuous' : 'period ' + P + ' seconds'}; colour ${colKey}.` });
  }

  /* ---------- sector lights ---------- */
  function lighthouse(cx, cy, s) {
    s = s || 1;
    return `<g transform="translate(${cx},${cy}) scale(${s})"><rect x="-13" y="-6" width="26" height="24" fill="${W}" stroke="${INK}" stroke-width="1.2"/>` +
      `<polygon points="-16,-6 16,-6 0,-22" fill="${R}" stroke="${INK}" stroke-width="1.2"/><rect x="-5" y="4" width="10" height="14" fill="${INK2}"/></g>`;
  }
  const SECTOR_PRESETS = {
    /* angles are measured FROM THE LIGHT (0 = north, clockwise); the fairway runs south from the light so the boat heads north */
    fairway: {
      sectors: [[110, 170, 'G'], [170, 190, 'W'], [190, 250, 'R']],
      boats: [{ a: 180, r: 320, label: ['on track in the WHITE sector', 'steer towards the light'] }],
      ghosts: [{ a: 156, r: 300, label: ['too far to STARBOARD', 'you see GREEN — turn to port'] }, { a: 204, r: 300, label: ['too far to PORT', 'you see RED — turn to starboard'] }],
      rocks: [[128, 262], [232, 262]], names: { W: 'WHITE = fairway' },
    },
    'two-fairways': {
      sectors: [[110, 150, 'G'], [150, 170, 'W'], [170, 195, 'R'], [195, 220, 'G'], [220, 240, 'W'], [240, 290, 'R']],
      boats: [{ a: 160, r: 300, label: ['fairway 1: heading for the light', 'red to port, green to starboard'] }, { a: 228, r: 300, label: ['fairway 2: heading for the light', 'red to port, green to starboard'] }],
      ghosts: [], rocks: [[130, 240], [182, 230], [207, 230], [265, 230]], names: {},
    },
  };
  /* sectorLight(opts) — plan view of a coast with a sector light; white = fairway, red/green = foul water. opts.preset: fairway | two-fairways */
  function sectorLight(opts) {
    opts = opts || {};
    const preset = opts.preset || 'fairway';
    const P = SECTOR_PRESETS[preset];
    if (!P) throw bad('sectorLight preset', preset, Object.keys(SECTOR_PRESETS));
    const Wd = 640, Ht = 580, lx = 320, ly = 118, RAD = 470;
    const pt = (a, r) => [lx + r * Math.sin(deg(a)), ly - r * Math.cos(deg(a))];
    let inner = `<rect width="${Wd}" height="${Ht}" fill="${SHALLOW}" rx="8"/>`;
    /* sectors on the water (white drawn pale yellow, as on multicoloured charts) */
    P.sectors.forEach(([a1, a2, c]) => { inner += c === 'W' ? S.sector(lx, ly, RAD, a1, a2, Y, .28) : S.sector(lx, ly, RAD, a1, a2, c === 'R' ? R : G, .32); });
    /* sector limits with true bearings FROM THE SEA towards the light (= angle from the light + 180) */
    const limits = []; P.sectors.forEach(s => { if (!limits.includes(s[0])) limits.push(s[0]); if (!limits.includes(s[1])) limits.push(s[1]); });
    limits.forEach(a => {
      const [x, y] = pt(a, RAD); inner += `<line x1="${lx}" y1="${ly}" x2="${fx(x)}" y2="${fx(y)}" stroke="${INK2}" stroke-width="1" stroke-dasharray="5 4" opacity=".8"/>`;
      const [tx, ty] = pt(a, 250); inner += `<rect x="${fx(tx - 19)}" y="${fx(ty - 8)}" width="38" height="16" rx="3" fill="${PAPER}" opacity=".85"/>` + T(tx, ty, `${String(((a + 180) % 360)).padStart(3, '0')}°`, { size: 11.5, weight: 700 });
    });
    /* sector names */
    P.sectors.forEach(([a1, a2, c]) => {
      const [x, y] = pt((a1 + a2) / 2, c === 'W' ? 225 : (a2 - a1 < 30 ? 150 : 190));
      const nm = c === 'W' ? (P.names.W || 'WHITE') : c === 'R' ? 'RED' : 'GREEN';
      inner += T(x, y, nm, { size: c === 'W' ? 12 : 13, weight: 800, fill: c === 'W' ? INK : c === 'R' ? R : G }) + (c !== 'W' ? T(x, y + 15, 'foul water', { size: 11, fill: INK2 }) : '');
    });
    /* rocks inside the coloured sectors */
    P.rocks.forEach(([a, r]) => { const [x, y] = pt(a, r); inner += rockBlob(x, y, 12, MUTED) + `<g stroke="${INK}" stroke-width="2"><line x1="${fx(x - 5)}" y1="${fx(y)}" x2="${fx(x + 5)}" y2="${fx(y)}"/><line x1="${fx(x)}" y1="${fx(y - 5)}" x2="${fx(x)}" y2="${fx(y + 5)}"/></g>`; });
    /* land and the light */
    inner += `<path d="M0,0 H${Wd} V70 Q560,95 480,100 Q400,105 360,122 Q320,140 280,122 Q240,105 160,100 Q80,95 0,70 Z" fill="${PAPER2}" stroke="${LINE}" stroke-width="1.5"/>`;
    inner += `<circle cx="${lx}" cy="${ly}" r="5" fill="${INK}"/>` + lighthouse(lx, ly - 24, 1.1) + T(lx, 36, 'sector light', { size: 13, weight: 700 });
    inner += T(lx, 54, 'Fl WRG 4s 21m 18-12M', { size: 12, fill: INK2 });
    /* boats */
    P.boats.forEach(b => { const [x, y] = pt(b.a, b.r); inner += boatPlan(x, y, (b.a + 180) % 360, 40); inner += T(x, y + 36, b.label[0], { size: 11.5, weight: 700 }) + T(x, y + 50, b.label[1], { size: 11 }); });
    P.ghosts.forEach(b => { const [x, y] = pt(b.a, b.r); inner += `<g opacity=".75">${boatPlan(x, y, (b.a + 180) % 360, 36)}</g>`; inner += T(x, y + 34, b.label[0], { size: 11.5, weight: 700 }) + T(x, y + 48, b.label[1], { size: 11 }); });
    inner += `<rect x="24" y="${Ht - 66}" width="${Wd - 48}" height="58" rx="6" fill="${PAPER}" opacity=".92"/>`;
    inner += T(Wd / 2, Ht - 52, 'Heading TOWARDS the light in its white sector: RED lies to PORT, GREEN to STARBOARD.', { size: 12, weight: 700 });
    inner += T(Wd / 2, Ht - 36, '(IALA rule; all Norwegian sector lights converted by Nov 2025. With the light astern the picture is mirrored.)', { size: 11, fill: INK2 });
    inner += T(Wd / 2, Ht - 20, 'Limits are true bearings from the sea towards the light. Shoals can still lie in a white sector — check the chart.', { size: 11, fill: INK2 });
    return S.svg(Wd, Ht, inner, { label: `Sector light plan view (${preset}): white sector marks the fairway; for a boat heading towards the light the red sector is on its port side and the green sector on its starboard side; red and green mean foul water. Sector limits given as true bearings from the sea.` });
  }

  /* leadingLine() — two leading marks in transit, with a boat on and off the line. */
  function leadingLine() {
    const Wd = 640, Ht = 540;
    let inner = title(Wd, 22, 'Leading line: two marks in line = you are on the track', 16);
    const win = (x, y, w, h, offset, cap1, cap2, good) => {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${PAPER}" stroke="${good ? C.green : LINE}" stroke-width="${good ? 2.5 : 1.2}"/>`;
      const hz = y + h - 56, cx = x + w / 2;
      s += `<path d="M${x + 4},${hz} Q${x + w * .3},${hz - 26} ${x + w * .55},${hz - 18} Q${x + w * .8},${hz - 10} ${x + w - 4},${hz - 20} V${hz} Z" fill="${PAPER2}"/>`;
      s += `<rect x="${x + 4}" y="${hz}" width="${w - 8}" height="${y + h - hz - 4}" fill="${SHALLOW}"/>`;
      /* front mark: lower, triangle apex UP; rear mark: higher, apex DOWN, displaced by offset */
      const fxm = cx, rxm = cx + offset;
      s += `<line x1="${rxm}" y1="${hz - 10}" x2="${rxm}" y2="${hz - 84}" stroke="${INK}" stroke-width="2"/>` + cone(rxm, hz - 56, 26, 28, false, R, `stroke="${INK}" stroke-width="1"`);
      s += `<line x1="${fxm}" y1="${hz + 8}" x2="${fxm}" y2="${hz - 40}" stroke="${INK}" stroke-width="2.5"/>` + cone(fxm, hz - 12, 30, 30, true, R, `stroke="${INK}" stroke-width="1"`);
      s += T(cx, y + h - 42, cap1, { size: 12, weight: 700, fill: good ? C.green : INK }) + T(cx, y + h - 26, cap2[0], { size: 11.5 }) + T(cx, y + h - 11, cap2[1], { size: 11.5, weight: 700 });
      if (good) s += T(cx + 22, hz - 68, 'rear (higher)', { size: 11, anchor: 'start', fill: MUTED }) + T(cx + 22, hz - 24, 'front', { size: 11, anchor: 'start', fill: MUTED });
      return s;
    };
    inner += win(16, 40, 196, 200, 0, 'ON the line', ['rear mark exactly above front mark', 'hold this course'], true);
    inner += win(222, 40, 196, 200, -30, 'You are LEFT of the line', ['rear mark appears LEFT of front', '→ steer RIGHT'], false);
    inner += win(428, 40, 196, 200, 30, 'You are RIGHT of the line', ['rear mark appears RIGHT of front', '→ steer LEFT'], false);
    /* plan view */
    const py = 258; inner += `<rect x="330" y="${py}" width="294" height="${Ht - py - 12}" rx="6" fill="${SHALLOW}"/>`;
    inner += `<path d="M420,${py} H624 V${py + 130} Q560,${py + 120} 520,${py + 95} Q470,${py + 70} 440,${py + 60} Q400,${py + 40} 420,${py} Z" fill="${PAPER2}" stroke="${LINE}" stroke-width="1.2"/>`;
    const brg = 25.5, F = [482, py + 72], Rm = [F[0] + 50 * Math.sin(deg(brg)), F[1] - 50 * Math.cos(deg(brg))];
    const seaEnd = [F[0] - 215 * Math.sin(deg(brg)), F[1] + 215 * Math.cos(deg(brg))];
    inner += `<line x1="${fx(F[0])}" y1="${fx(F[1])}" x2="${fx(seaEnd[0])}" y2="${fx(seaEnd[1])}" stroke="${INK}" stroke-width="2"/>`;
    inner += `<line x1="${fx(F[0])}" y1="${fx(F[1])}" x2="${fx(Rm[0] + 20 * Math.sin(deg(brg)))}" y2="${fx(Rm[1] - 20 * Math.cos(deg(brg)))}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    [F, Rm].forEach((m, i) => { inner += `<circle cx="${fx(m[0])}" cy="${fx(m[1])}" r="5" fill="${R}" stroke="${INK}" stroke-width="1"/>` + T(m[0] + 14, m[1] + (i ? -4 : 6), i ? 'rear' : 'front', { size: 11, anchor: 'start' }); });
    const bOn = [F[0] - 120 * Math.sin(deg(brg)), F[1] + 120 * Math.cos(deg(brg))];
    inner += boatPlan(bOn[0], bOn[1], brg, 36) + T(bOn[0] - 24, bOn[1] + 4, 'on the line', { size: 11, weight: 700, anchor: 'end' });
    const bOff = [bOn[0] + 72, bOn[1] + 40];
    inner += `<g opacity=".8">${boatPlan(bOff[0], bOff[1], brg, 34)}</g>` + T(bOff[0] + 4, bOff[1] + 36, 'right of the line', { size: 11, weight: 700 }) + T(bOff[0] + 4, bOff[1] + 50, 'rear appears right → steer left', { size: 11 });
    const mid = [F[0] - 190 * Math.sin(deg(brg)), F[1] + 190 * Math.cos(deg(brg))];
    inner += `<rect x="${fx(mid[0] - 46)}" y="${fx(mid[1] - 9)}" width="92" height="18" rx="3" fill="${PAPER}"/>` + T(mid[0], mid[1], 'Ldg 025.5°', { size: 12, weight: 700, fill: MAGENTA });
    /* explanation */
    const ex = 24, ey = py + 20;
    inner += T(ex, ey, 'Why the rear mark shows where you are', { size: 13, weight: 700, anchor: 'start' });
    ['The front (nearer) mark swings across your view', 'faster than the distant rear mark, so the rear', 'mark appears displaced towards the side YOU are on.', '', 'Steer from the rear mark towards the front mark', 'until they line up again.', '', 'On the chart the line is drawn solid where it is', 'the track to follow and dashed beyond; the bearing', 'is given in degrees true towards the marks (Ldg 025.5°).', '', 'Daymarks: front triangle apex UP, rear triangle apex', 'DOWN; the rear mark is always the higher one.'].forEach((l, i) => { if (l) inner += T(ex, ey + 22 + i * 17, l, { size: 11.5, anchor: 'start', fill: INK2 }); });
    return S.svg(Wd, Ht, inner, { label: 'Leading line: when the rear (higher, apex-down) mark is exactly above the front (lower, apex-up) mark you are on the line. Rear mark appearing left means you are left of the line, steer right; rear mark appearing right means you are right, steer left. Plan view shows the charted leading line Ldg 025.5 degrees, solid in the fairway and dashed beyond, with a boat on and a boat off the line.' });
  }

  /* ---------- chart symbols (INT1) ---------- */
  const ITAL = `font-style="italic"`;
  /* tiny chart-style buoy: a leaning spar on a base dot, coloured with the kind's bands, optional topmark (topmarks not charted in Norway, INT1 Q130 note) */
  function chartBuoy(kind, x, y, withTop) {
    const k = KINDS[kind], id = `cb-${kind}`;
    const pt = pts([[x - 4, y - 2], [x + 4, y - 2], [x + 10, y - 30], [x + 2, y - 30]]);
    let s = `<defs><clipPath id="${id}"><polygon points="${pt}"/></clipPath></defs><g clip-path="url(#${id})">`;
    if (k.vertical) { const n = k.bands.length, w = 16 / n; k.bands.forEach((b, i) => { s += `<rect x="${fx(x - 6 + i * w)}" y="${y - 32}" width="${fx(w + .4)}" height="32" fill="${b[0]}"/>`; }); }
    else { let yy = y - 30; k.bands.forEach(b => { const h = 28 * b[1]; s += `<rect x="${x - 8}" y="${fx(yy)}" width="24" height="${fx(h + .4)}" fill="${b[0]}"/>`; yy += h; }); }
    s += `</g><polygon points="${pt}" fill="none" stroke="${INK}" stroke-width="1"/><circle cx="${x}" cy="${y}" r="2.2" fill="${INK}"/>`;
    if (withTop) { const tm = topmark(kind, x + 6.5, y - 31); s += `<g transform="translate(${x + 6.5},${y - 31}) scale(.32) translate(${-(x + 6.5)},${-(y - 31)})">${tm.svg}</g>`; }
    return s;
  }
  const plusSym = (x, y, s, w) => `<g stroke="${INK}" stroke-width="${w || 2}" stroke-linecap="round"><line x1="${x - s}" y1="${y}" x2="${x + s}" y2="${y}"/><line x1="${x}" y1="${y - s}" x2="${x}" y2="${y + s}"/></g>`;
  const dotCircle = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="2.5 3"/>`;
  const flare = (x, y, a) => `<g transform="translate(${x},${y}) rotate(${a == null ? 35 : a})"><path d="M0,-3 Q10,-14 20,-6 Q10,2 0,-3 Z" fill="${MAGENTA}"/></g>`;
  const wreckSym = (x, y, k) => { k = k || 1; return `<g stroke="${INK}" stroke-width="2" stroke-linecap="round"><line x1="${x - 14 * k}" y1="${y}" x2="${x + 14 * k}" y2="${y}"/><line x1="${x - 7 * k}" y1="${y - 7 * k}" x2="${x - 7 * k}" y2="${y + 7 * k}"/><line x1="${x}" y1="${y - 10 * k}" x2="${x}" y2="${y + 10 * k}"/><line x1="${x + 7 * k}" y1="${y - 7 * k}" x2="${x + 7 * k}" y2="${y + 7 * k}"/></g>`; };
  const anchorSym = (x, y, col) => `<g stroke="${col || INK}" stroke-width="2.2" fill="none" stroke-linecap="round"><circle cx="${x}" cy="${y - 16}" r="4"/><line x1="${x}" y1="${y - 12}" x2="${x}" y2="${y + 14}"/><line x1="${x - 9}" y1="${y - 4}" x2="${x + 9}" y2="${y - 4}"/><path d="M${x - 14},${y + 4} Q${x},${y + 20} ${x + 14},${y + 4}"/></g>`;
  function wavy(x1, y, x2, col, amp) { amp = amp || 3; let d = `M${x1},${y}`; for (let x = x1; x < x2; x += 10) d += ` q2.5,${-amp} 5,0 t5,0`; return `<path d="${d}" fill="none" stroke="${col || MAGENTA}" stroke-width="1.6"/>`; }
  function beaconSym(x, y, kind) {
    const k = KINDS[kind]; const col = k.topColor;
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 28}" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="3" fill="${INK}"/>` +
      (kind === 'lateral-port' ? `<rect x="${x - 8}" y="${y - 44}" width="16" height="14" fill="${col}" stroke="${INK}" stroke-width="1"/>` : cone(x, y - 28, 16, 15, true, col, `stroke="${INK}" stroke-width="1"`)) +
      T(x + 14, y - 12, kind === 'lateral-port' ? 'R' : 'G', { size: 12, anchor: 'start', weight: 700 });
  }
  const SYMS = {
    'rock-awash': { scale: 1.8, draw: (x, y) => plusSym(x, y, 12, 2.2) + [[-6, -6], [6, -6], [-6, 6], [6, 6]].map(d => `<circle cx="${x + d[0]}" cy="${y + d[1]}" r="2" fill="${INK}"/>`).join(''), title: 'Rock awash at chart datum', sub: '(INT1 K12): between CD and 0.5 m below', water: true },
    'rock-submerged': { scale: 1.8, draw: (x, y) => plusSym(x, y, 12, 2.2), title: 'Underwater rock, depth unknown', sub: 'dangerous to surface navigation (INT1 K13)', water: true },
    'rock-drying': { scale: 1.8, draw: (x, y) => `<g stroke="${INK}" stroke-width="2.2" stroke-linecap="round">${[0, 60, 120].map(a => `<line x1="${fx(x + 12 * Math.sin(deg(a)))}" y1="${fx(y - 12 * Math.cos(deg(a)))}" x2="${fx(x - 12 * Math.sin(deg(a)))}" y2="${fx(y + 12 * Math.cos(deg(a)))}"/>`).join('')}</g>`, title: 'Rock that covers and uncovers', sub: 'drying rock, between chart datum and MHW (INT1 K11)', water: true },
    'rock-above-water': { scale: 1.5, draw: (x, y) => rockBlob(x, y, 14, PAPER2) + T(x + 22, y + 2, '(1,7)', { size: 12, anchor: 'start' }), title: 'Islet / rock always above water', sub: 'height in metres above MHW in brackets (INT1 K10)', water: true },
    'wreck-dangerous': { scale: 1.5, draw: (x, y) => wreckSym(x, y) + dotCircle(x, y, 22), title: 'Dangerous wreck, depth unknown', sub: 'wreck symbol inside a dotted danger circle (INT1 K28)', water: true },
    'wreck-non-dangerous': { scale: 1.6, draw: (x, y) => wreckSym(x, y) + T(x + 24, y + 2, 'Wk', { size: 12, anchor: 'start' }), title: 'Wreck not dangerous to surface navigation', sub: 'no danger circle: at least 20 m of water over it (INT1 K29)', water: true },
    'light': { scale: 1.3, draw: (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${INK}"/>` + flare(x, y) + T(x + 2, y + 22, 'Fl R 3s 6m 4M', { size: 12, anchor: 'start' }), title: 'Light', sub: 'position dot with a magenta flare; description beside it (INT1 P1)', water: false },
    'sector-light': { draw: (x, y) => { let s = ''; [[200, 240, G], [240, 275, Y], [275, 320, R]].forEach(([a, b, c]) => { const p = a2 => [x + 46 * Math.sin(deg(a2)), y - 46 * Math.cos(deg(a2))]; const [x1, y1] = p(a), [x2, y2] = p(b); s += `<path d="M${fx(x1)},${fx(y1)} A46,46 0 0,1 ${fx(x2)},${fx(y2)}" fill="none" stroke="${c}" stroke-width="${c === Y ? 3 : 5}"/>`; }); [200, 240, 275, 320].forEach(a => { s += `<line x1="${x}" y1="${y}" x2="${fx(x + 52 * Math.sin(deg(a)))}" y2="${fx(y - 52 * Math.cos(deg(a)))}" stroke="${INK2}" stroke-width=".8" stroke-dasharray="2 2"/>`; }); return s + `<circle cx="${x}" cy="${y}" r="3.5" fill="${INK}"/>` + flare(x, y) + T(x + 8, y + 20, 'Fl WRG 4s', { size: 12, anchor: 'start' }) + T(x - 62, y + 40, 'W = fairway', { size: 11, fill: INK2 }); }, title: 'Sector light', sub: 'arcs show the sectors; white drawn yellow on colour charts (P40)', water: false },
    'beacon-port': { scale: 1.4, draw: (x, y) => beaconSym(x, y + 14, 'lateral-port'), title: 'Port-hand beacon (red)', sub: 'fixed mark; only the topmark has meaning (INT1 Q130)', water: false },
    'beacon-starboard': { scale: 1.4, draw: (x, y) => beaconSym(x, y + 14, 'lateral-starboard'), title: 'Starboard-hand beacon (green)', sub: 'fixed mark with green cone topmark (INT1 Q130)', water: false },
    'anchorage': { draw: (x, y) => dotCircle(x, y, 34).replace('stroke-dasharray="2.5 3"', `stroke-dasharray="6 4" stroke="${MAGENTA}"`) + anchorSym(x, y, MAGENTA) + T(x, y + 50, '24h', { size: 11, fill: MAGENTA }), title: 'Anchorage area', sub: 'anchor symbol inside a dashed boundary (INT1 N12)', water: true },
    'cable': { draw: (x, y) => wavy(x - 60, y - 8, x + 60) + `<polyline points="${x - 12},${y + 12} ${x - 4},${y + 18} ${x - 10},${y + 22} ${x - 2},${y + 30}" fill="none" stroke="${MAGENTA}" stroke-width="1.6"/>` + wavy(x - 60, y + 22, x - 14) + wavy(x - 2, y + 22, x + 60) + T(x + 2, y - 20, 'Kabler', { size: 11, fill: MAGENTA }), title: 'Submarine cable (top) and power cable', sub: 'wavy magenta line; zigzags = power cable (INT1 L30–L31)', water: true },
    'pipeline': { scale: 1.2, draw: (x, y) => `<line x1="${x - 60}" y1="${y}" x2="${x + 60}" y2="${y}" stroke="${MAGENTA}" stroke-width="1.8" stroke-dasharray="14 4 1.5 4" stroke-linecap="round"/>` + T(x, y - 14, 'Gas', { size: 11, fill: MAGENTA }), title: 'Pipeline', sub: 'magenta long dash – dot – long dash (INT1 L40)', water: true },
    /* blue tint covers everything shallower than the 10 m contour (F14); the decimal sounding 7,3 lies inside it, between the 5 m and 10 m lines */
    'depth-contour': { draw: (x, y) => `<path d="M${x - 40},${y - 50} Q${x + 10},${y} ${x - 30},${y + 50} H${x - 90} V${y - 50} Z" fill="${SHALLOW}" stroke="none"/><path d="M${x - 40},${y - 50} Q${x + 10},${y} ${x - 30},${y + 50}" fill="none" stroke="${C.blue}" stroke-width="1.2"/><path d="M${x - 75},${y - 50} Q${x - 30},${y - 10} ${x - 70},${y + 50}" fill="none" stroke="${C.blue}" stroke-width="1.2"/>` + T(x - 58, y - 38, '5', { size: 10, fill: C.blue }) + T(x - 22, y - 38, '10', { size: 10, fill: C.blue }) + `<text x="${x + 18}" y="${y - 10}" font-size="13" ${ITAL} fill="${INK}">12</text><text x="${x - 33}" y="${y + 14}" font-size="13" ${ITAL} fill="${INK}" text-anchor="middle">7,3</text><text x="${x + 44}" y="${y + 36}" font-size="13" ${ITAL} fill="${INK}">21</text><text x="${x + 10}" y="${y + 34}" font-size="13" font-weight="700" fill="${INK}">4</text>` + dotCircle(x + 14, y + 30, 10), title: 'Depth contours and soundings', sub: 'blue contours, tint <10 m; italic = depth, circled upright = shoal', water: false },
    'leading-line': { draw: (x, y) => `<line x1="${x - 70}" y1="${y + 50}" x2="${x + 20}" y2="${y - 20}" stroke="${INK}" stroke-width="1.8"/><line x1="${x + 20}" y1="${y - 20}" x2="${x + 52}" y2="${y - 45}" stroke="${INK}" stroke-width="1.4" stroke-dasharray="5 4"/>` + `<circle cx="${x + 20}" cy="${y - 20}" r="3" fill="${INK}"/><circle cx="${x + 40}" cy="${y - 35.5}" r="3" fill="${INK}"/>` + flare(x + 20, y - 20, 50) + flare(x + 40, y - 35.5, 50) + T(x + 16, y + 42, 'Ldg Lts 052°', { size: 11.5, weight: 700 }), title: 'Leading line / leading lights', sub: 'solid where it is the track, dashed beyond; true bearing (P20)', water: true },
    'buoyage-direction': { scale: 1.2, draw: (x, y) => arrow(x - 40, y + 20, x + 50, y - 25, MAGENTA, { width: 2.4, head: 14, open: true }) + `<circle cx="${x - 48}" cy="${y + 18}" r="3" fill="${MAGENTA}"/><circle cx="${x - 42}" cy="${y + 28}" r="3" fill="${MAGENTA}"/>`, title: 'Direction of buoyage', sub: 'magenta arrow where the direction is not obvious (Q130.2)', water: true },
    'foul': { scale: 1.6, draw: (x, y) => `<g stroke="${INK}" stroke-width="1.8"><line x1="${x - 8}" y1="${y - 12}" x2="${x - 4}" y2="${y + 12}"/><line x1="${x + 4}" y1="${y - 12}" x2="${x + 8}" y2="${y + 12}"/><line x1="${x - 12}" y1="${y - 5}" x2="${x + 12}" y2="${y - 5}"/><line x1="${x - 12}" y1="${y + 5}" x2="${x + 12}" y2="${y + 5}"/></g>` + T(x + 18, y + 2, 'Foul', { size: 12, anchor: 'start' }), title: 'Foul ground', sub: 'not dangerous to surface navigation; do not anchor (INT1 K31)', water: true },
    'obstruction': { scale: 1.5, draw: (x, y) => dotCircle(x, y, 20) + T(x, y + 1, 'Obstn', { size: 11.5 }), title: 'Obstruction', sub: 'danger circle with "Obstn" (INT1 K40)', water: true },
  };
  /* buoy symbols: INT1 international style with the topmark; Norwegian charts omit topmarks (Q130 note 1), so the colour letters are what you read */
  ['n', 'e', 's', 'w'].forEach(d => { const kind = 'cardinal-' + d; SYMS['buoy-cardinal-' + d] = { scale: 1.8, draw: (x, y) => chartBuoy(kind, x - 6, y + 20, true) + T(x + 28, y + 6, KINDS[kind].abbr, { size: 12, anchor: 'start', weight: 700 }), title: `${KINDS[kind].name} (buoy)`, sub: `${KINDS[kind].abbr} = ${KINDS[kind].bands.map(b => colourName(b[0])).join('-')}; Norwegian charts omit the topmark`, water: true }; });
  [['buoy-port', 'lateral-port'], ['buoy-starboard', 'lateral-starboard'], ['buoy-isolated-danger', 'isolated-danger'], ['buoy-safe-water', 'safe-water'], ['buoy-special', 'special']].forEach(([key, kind]) => { SYMS[key] = { scale: 1.8, draw: (x, y) => chartBuoy(kind, x - 6, y + 20, true) + T(x + 28, y + 6, KINDS[kind].abbr, { size: 12, anchor: 'start', weight: 700 }), title: `${KINDS[kind].name} (buoy)`, sub: `colour abbreviation ${KINDS[kind].abbr}; Norwegian charts omit the topmark`, water: true }; });
  const SYM_NAMES = Object.keys(SYMS);
  /* chartSymbol(kind) — one INT1-style symbol on a chart-paper square with its meaning. */
  function chartSymbol(kind) {
    const s = SYMS[kind]; if (!s) throw bad('chartSymbol kind', kind, SYM_NAMES);
    const Wd = 360, Ht = 250, sc = s.scale || 1;
    let inner = `<rect x="90" y="12" width="180" height="150" rx="4" fill="${PAPER}" stroke="${LINE}" stroke-width="1.2"/>`;
    if (s.water) inner += `<rect x="91" y="13" width="178" height="148" rx="4" fill="${SHALLOW}" opacity=".6"/>`;
    inner += `<g transform="translate(180,87) scale(${sc}) translate(-180,-87)">${s.draw(180, 87)}</g>`;
    inner += T(Wd / 2, 190, s.title, { size: 14, weight: 700 }) + note(Wd / 2, 212, s.sub, { size: 11.5 });
    inner += note(Wd / 2, 236, 'chart symbol (INT1 style)', { size: 11, fill: MUTED });
    return S.svg(Wd, Ht, inner, { label: `Chart symbol: ${s.title} — ${s.sub}` });
  }

  /* chartExcerpt() — a small invented chart excerpt with a legend. Clearly marked as an example. */
  function chartExcerpt() {
    const Wd = 640, Ht = 500, mx = 16, my = 16, mw = 400, mh = 400;
    let inner = `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="${PAPER}" stroke="${INK2}" stroke-width="1.5"/>`;
    /* shallow tint and contours */
    inner += `<path d="M${mx},${my + 60} Q120,110 150,170 Q180,230 130,300 Q90,360 ${mx},${my + mh}" fill="${SHALLOW}" stroke="${C.blue}" stroke-width="1.2"/>`;
    inner += `<path d="M${mx},${my + 110} Q100,150 115,190 Q130,230 95,300 Q70,350 ${mx},${my + mh}" fill="none" stroke="${C.blue}" stroke-width="1"/>`;
    inner += `<path d="M${mx + mw},${my + 40} Q370,120 385,200 Q400,280 350,340 Q325,380 ${mx + mw},${my + mh - 40}" fill="${SHALLOW}" stroke="${C.blue}" stroke-width="1.2"/>`;
    inner += T(146, 215, '10', { size: 10, fill: C.blue }) + T(108, 215, '5', { size: 10, fill: C.blue });
    /* land */
    inner += `<path d="M${mx},${my} H150 Q130,40 100,70 Q60,110 ${mx},${my + 60} Z" fill="${PAPER2}" stroke="${INK}" stroke-width="1.5"/>`;
    inner += `<path d="M${mx + mw},${my} H300 Q320,30 350,50 Q390,70 ${mx + mw},${my + 40} Z" fill="${PAPER2}" stroke="${INK}" stroke-width="1.5"/>`;
    inner += `<path d="M${mx},${my + mh} V330 Q50,345 70,380 Q85,405 100,${my + mh} Z" fill="${PAPER2}" stroke="${INK}" stroke-width="1.5"/>`;
    inner += T(60, 40, 'LAND', { size: 12, weight: 700, fill: INK2 }) + T(380, 32, 'LAND', { size: 12, weight: 700, fill: INK2 });
    /* soundings: italic = ordinary depths; upright = shoals. Decimal depths (7,3) only inside the <10 m tint (F12/F14). */
    [[225, 95, '32'], [300, 160, '27'], [250, 250, '18'], [340, 330, '21'], [200, 340, '14'], [195, 150, '12'], [260, 380, '15'], [365, 390, '17'], [398, 300, '7,3']].forEach(([x, y, d]) => { inner += `<text x="${x}" y="${y}" font-size="12" ${ITAL} fill="${INK}" text-anchor="middle">${d}</text>`; });
    inner += T(236, 190, '4', { size: 12, weight: 700 }) + dotCircle(236, 189, 9);
    /* dangerous underwater rock + rock awash */
    inner += plusSym(150, 260, 8, 2) + plusSym(345, 240, 8, 2) + [[-4, -4], [4, -4], [-4, 4], [4, 4]].map(d => `<circle cx="${345 + d[0]}" cy="${240 + d[1]}" r="1.5" fill="${INK}"/>`).join('');
    /* lateral pair with direction-of-buoyage arrow (into the harbour to the north) */
    inner += chartBuoy('lateral-port', 196, 300, false) + T(214, 296, 'R', { size: 11, weight: 700, anchor: 'start' });
    inner += chartBuoy('lateral-starboard', 290, 300, false) + T(308, 296, 'G', { size: 11, weight: 700, anchor: 'start' });
    inner += arrow(248, 360, 248, 300, MAGENTA, { width: 2, head: 11, open: true }) + `<circle cx="244" cy="364" r="2.5" fill="${MAGENTA}"/><circle cx="252" cy="364" r="2.5" fill="${MAGENTA}"/>`;
    /* sector light on the left shore with its sectors (white drawn yellow) */
    const lx = 108, ly = 86;
    [[60, 95, G], [95, 125, Y], [125, 170, R]].forEach(([a, b, c]) => { const p = a2 => [lx + 52 * Math.sin(deg(a2)), ly - 52 * Math.cos(deg(a2))]; const [x1, y1] = p(a), [x2, y2] = p(b); inner += `<path d="M${fx(x1)},${fx(y1)} A52,52 0 0,1 ${fx(x2)},${fx(y2)}" fill="none" stroke="${c}" stroke-width="${c === Y ? 3 : 5}"/>`; });
    [60, 95, 125, 170].forEach(a => { inner += `<line x1="${lx}" y1="${ly}" x2="${fx(lx + 58 * Math.sin(deg(a)))}" y2="${fx(ly - 58 * Math.cos(deg(a)))}" stroke="${INK2}" stroke-width=".8" stroke-dasharray="2 2"/>`; });
    inner += `<circle cx="${lx}" cy="${ly}" r="3.5" fill="${INK}"/>` + flare(lx, ly, -60) + T(lx - 60, ly + 76, 'Oc WRG 6s 12m 9-6M', { size: 11, anchor: 'start', weight: 600 });
    /* leading line into the harbour at the top */
    inner += `<line x1="248" y1="300" x2="248" y2="60" stroke="${INK}" stroke-width="1.6"/><line x1="248" y1="60" x2="248" y2="${my + 6}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="5 4"/>`;
    inner += `<circle cx="248" cy="60" r="3" fill="${INK}"/><circle cx="248" cy="36" r="3" fill="${INK}"/>` + flare(248, 60, -20) + flare(248, 36, -20);
    inner += `<text x="256" y="130" font-size="11" font-weight="700" fill="${INK}" transform="rotate(-90 256 130)" text-anchor="middle">Ldg Lts 000°</text>`;
    /* obstruction + wreck */
    inner += dotCircle(372, 120, 16) + T(372, 121, 'Obstn', { size: 9.5 });
    inner += wreckSym(200, 60) + dotCircle(200, 60, 15);
    inner += `<rect x="${mx}" y="${my + mh - 24}" width="${mw}" height="24" fill="${PAPER}" opacity=".92"/>` + T(mx + mw / 2, my + mh - 12, 'EXAMPLE ONLY — invented chart excerpt, not for navigation', { size: 12.5, weight: 800, fill: C.red });
    /* legend */
    const Lx = 432, Ly = 24, step = 31;
    inner += `<rect x="${Lx - 6}" y="${Ly - 10}" width="${Wd - Lx - 6}" height="${Ht - Ly - 6}" rx="6" fill="${PAPER2}" stroke="${LINE}"/>` + T(Lx + 98, Ly + 6, 'Legend', { size: 14, weight: 700 });
    const rows = [
      [y => `<text x="${Lx + 12}" y="${y + 4}" font-size="12" ${ITAL} fill="${INK}" text-anchor="middle">18</text>`, 'sounding in metres (italic)'],
      [y => T(Lx + 12, y + 1, '4', { size: 12, weight: 700 }) + dotCircle(Lx + 12, y, 9), 'shoal: upright + danger circle'],
      [y => plusSym(Lx + 12, y, 7, 2), 'underwater rock, depth unknown'],
      [y => plusSym(Lx + 12, y, 7, 2) + [[-4, -4], [4, -4], [-4, 4], [4, 4]].map(d => `<circle cx="${Lx + 12 + d[0]}" cy="${y + d[1]}" r="1.5" fill="${INK}"/>`).join(''), 'rock awash at chart datum'],
      [y => `<line x1="${Lx + 2}" y1="${y}" x2="${Lx + 22}" y2="${y}" stroke="${C.blue}" stroke-width="1.2"/>`, 'depth contour (blue); tint <10 m'],
      [y => chartBuoy('lateral-port', Lx + 8, y + 14, false), 'red port-hand buoy (R)'],
      [y => chartBuoy('lateral-starboard', Lx + 8, y + 14, false), 'green starboard-hand buoy (G)'],
      [y => arrow(Lx + 2, y + 8, Lx + 24, y - 8, MAGENTA, { width: 1.8, head: 9, open: true }), 'direction of buoyage'],
      [y => `<circle cx="${Lx + 12}" cy="${y}" r="3" fill="${INK}"/>` + flare(Lx + 12, y), 'light (magenta flare)'],
      [y => `<path d="M${Lx + 2},${y + 7} A14,14 0 0,1 ${Lx + 12},${y - 7}" fill="none" stroke="${G}" stroke-width="4"/><path d="M${Lx + 12},${y - 7} A14,14 0 0,1 ${Lx + 22},${y + 7}" fill="none" stroke="${Y}" stroke-width="3"/>`, 'light sectors (white = yellow)'],
      [y => `<line x1="${Lx + 2}" y1="${y}" x2="${Lx + 14}" y2="${y}" stroke="${INK}" stroke-width="1.6"/><line x1="${Lx + 14}" y1="${y}" x2="${Lx + 24}" y2="${y}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="3 3"/>`, 'leading line (solid = track)'],
      [y => wreckSym(Lx + 12, y, .65) + dotCircle(Lx + 12, y, 11), 'wreck (circle = dangerous)'],
      [y => dotCircle(Lx + 12, y, 9) + T(Lx + 12, y + 1, 'Obstn', { size: 6 }), 'obstruction / danger circle'],
    ];
    rows.forEach(([sym, label], i) => { const y = Ly + 36 + i * step; inner += sym(y) + T(Lx + 32, y + 1, label, { size: 10.5, anchor: 'start' }); });
    inner += note(Lx + 98, Ht - 22, 'Depths in metres below chart datum (LAT)', { size: 10.5, fill: MUTED });
    return S.svg(Wd, Ht, inner, { label: 'Invented example chart excerpt (not for navigation): land, blue depth contours and tint, italic soundings, an upright shoal depth in a danger circle, underwater rock and rock awash symbols, a red port-hand and green starboard-hand buoy with the magenta direction-of-buoyage arrow, a sector light with green, white (yellow) and red arcs, a leading line, a wreck, an obstruction and a legend.' });
  }

  /* ---------- extra helpers from the fact sheet (IL-11, IL-12, IL-15) ---------- */
  /* sparRule() — Norwegian spar buoys without topmarks: identify by colour and top shape. */
  function sparRule() {
    const Wd = 640, Ht = 436, wl = 300;
    const kinds = ['lateral-port', 'lateral-starboard', 'cardinal-n', 'cardinal-e', 'cardinal-s', 'cardinal-w'];
    let inner = title(Wd, 22, 'Norwegian spar buoys: no topmark — read the colour and the top', 16) + water(0, wl, Wd, 40);
    kinds.forEach((k, i) => {
      const x = 60 + i * 104, m = drawMark(k, 'spar', { idSuffix: '-sr' });
      inner += `<g transform="translate(${x},${wl}) scale(.9)">${m.svg}</g>`;
      inner += T(x, wl + 58, KINDS[k].name.replace(' mark', '').replace('-hand lateral', ''), { size: 12, weight: 700 });
      inner += T(x, wl + 74, KINDS[k].spar.toUpperCase() + ' top', { size: 11.5, fill: INK2 });
    });
    inner += note(Wd / 2, Ht - 48, 'Red laterals are BLUNT, green laterals POINTED.', { size: 12, weight: 600 });
    inner += note(Wd / 2, Ht - 32, 'Cardinals: black on top (N, E) = POINTED; yellow on top (S, W) = BLUNT.', { size: 12, weight: 600 });
    inner += note(Wd / 2, Ht - 14, 'Reflective bands show the colours at night; BLUE tape stands for black (N: blue/yellow, E: 2 blue, S: yellow/blue, W: 2 yellow).', { size: 11 });
    return S.svg(Wd, Ht, inner, { label: 'Six Norwegian spar buoys: red blunt-topped port lateral, green pointed starboard lateral, black-over-yellow pointed north cardinal, black-yellow-black pointed east cardinal, yellow-over-black blunt south cardinal, yellow-black-yellow blunt west cardinal; reflective bands with blue standing for black.' });
  }
  /* pointerPole(variant) — Norwegian iron pole with a pointer arm: the arm points towards navigable water. variant: left | right | both */
  function pointerPole(variant) {
    variant = variant || 'left';
    const V = ['left', 'right', 'both']; if (!V.includes(variant)) throw bad('pointerPole variant', variant, V);
    const Wd = 480, Ht = 360, wl = 250, cx = 240;
    let inner = title(Wd, 22, 'Pole with pointer (Norwegian perch)', 16) + water(0, wl, Wd, 40) + rockBlob(cx, wl + 4, 50, MUTED);
    inner += `<line x1="${cx}" y1="${wl}" x2="${cx}" y2="80" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    /* Reflector colour follows the direction of buoyage (F51). The boats below head AWAY from the viewer, so a boat passing
       on the LEFT of the pole keeps the pole on its STARBOARD side (green reflector); passing on the RIGHT keeps it to PORT (red). */
    const arm = (dir) => { const x2 = cx + dir * 70; return `<line x1="${cx}" y1="100" x2="${x2}" y2="100" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` + `<rect x="${dir > 0 ? x2 - 14 : x2}" y="94" width="14" height="12" fill="${variant === 'both' ? W : dir < 0 ? G : R}" stroke="${INK}" stroke-width="1"/>`; };
    if (variant !== 'right') inner += arm(-1);
    if (variant !== 'left') inner += arm(1);
    const boat = (x, label) => boatPlan(x, wl + 20, 0, 34) + T(x, wl + 56, label, { size: 11.5, weight: 700 });
    if (variant === 'left') inner += boat(110, 'pass HERE (deep water)') + T(370, wl + 56, 'shallow — do not pass', { size: 11.5, fill: MUTED }) + `<text x="370" y="${wl + 20}" font-size="22" fill="${C.red}" text-anchor="middle">✕</text>`;
    if (variant === 'right') inner += boat(370, 'pass HERE (deep water)') + T(110, wl + 56, 'shallow — do not pass', { size: 11.5, fill: MUTED }) + `<text x="110" y="${wl + 20}" font-size="22" fill="${C.red}" text-anchor="middle">✕</text>`;
    if (variant === 'both') inner += boat(110, 'either side') + boat(370, 'either side');
    inner += note(cx, 60, variant === 'both' ? 'Two arms + white reflector: the mark can be passed on both sides' : 'The arm points TOWARDS navigable water — never towards the rock', { size: 12.5, weight: 600 });
    if (variant !== 'both') inner += note(cx, Ht - 32, `Reflector ${variant === 'left' ? 'GREEN: the pole stays on your STARBOARD side' : 'RED: the pole stays on your PORT side'} (direction of buoyage: away from you).`, { size: 11 });
    inner += note(cx, Ht - 16, variant === 'both' ? 'Reflector: red = leave to port, green = leave to starboard, white = either side.' : 'Pointers can be bent by ice and collisions: always check the chart and the Norwegian sailing directions.', { size: 11 });
    return S.svg(Wd, Ht, inner, { label: `Norwegian iron pole on a rock with ${variant === 'both' ? 'two pointer arms and a white reflector: pass on either side' : 'a pointer arm pointing ' + variant + ' with a ' + (variant === 'left' ? 'green' : 'red') + ' reflector: the arm points towards navigable water, pass on the ' + variant + ' (heading away from the viewer, the pole stays to ' + (variant === 'left' ? 'starboard' : 'port') + ')'}.` });
  }
  /* lightDecoder() — full light description decoded: Fl(3) WRG 15s 21m 15-11M */
  function lightDecoder() {
    const Wd = 640, Ht = 326;
    let inner = title(Wd, 24, 'Reading a light description on the chart', 16);
    const parts = [['Fl(3)', 'group flashing', '3 flashes in a group', INK], ['WRG', 'colours', 'white, red and green sectors', INK], ['15s', 'period', 'one full cycle of flashes and darkness', INK], ['21m', 'elevation', 'height above MEAN HIGH WATER', INK], ['15-11M', 'nominal range', 'white 15 M, green 11 M, red in between', INK]];
    const xs = [70, 185, 285, 375, 500];
    parts.forEach(([tok, what, how], i) => {
      const x = xs[i]; inner += T(x, 90, tok, { size: 30, weight: 800, family: 'var(--font-mono)' });
      inner += `<line x1="${x}" y1="112" x2="${x}" y2="${140 + (i % 2) * 50}" stroke="${INK2}" stroke-width="1.2"/>`;
      inner += T(x, 156 + (i % 2) * 50, what, { size: 13, weight: 700 }) + T(x, 173 + (i % 2) * 50, how, { size: 11.5, fill: INK2 });
    });
    /* timing bar for Fl(3) 15s */
    const x0 = 60, x1 = 580, by = 262, sx = (x1 - x0) / 15;
    inner += `<rect x="${x0}" y="${by}" width="${x1 - x0}" height="22" fill="${C.night}" rx="3"/>`;
    [0, 1, 2].forEach(t => { inner += `<rect x="${fx(x0 + t * sx)}" y="${by + 3}" width="${fx(.5 * sx)}" height="16" fill="${W}" rx="2"/>`; });
    for (let t = 0; t <= 15; t++) inner += `<line x1="${fx(x0 + t * sx)}" y1="${by + 22}" x2="${fx(x0 + t * sx)}" y2="${by + 27}" stroke="${INK2}"/>` + (t % 5 === 0 ? T(x0 + t * sx, by + 36, t + ' s', { size: 11, fill: INK2 }) : '');
    inner += T(Wd / 2, by - 10, 'Fl(3) 15s: three flashes, then dark until the 15-second period restarts', { size: 11.5, fill: INK2 });
    inner += note(Wd / 2, Ht - 8, 'Range is NOMINAL (10 M visibility) — not a promise of how far you will see it. Bridge clearances, by contrast, are referred to HAT.', { size: 11 });
    return S.svg(Wd, Ht, inner, { label: 'Decoded light description Fl(3) WRG 15s 21m 15-11M: group flashing three flashes; white, red and green sectors; period 15 seconds; elevation 21 metres above mean high water; nominal range white 15, green 11, red between.' });
  }

  Object.assign(S, { mark, cardinalCompass, lateralChannel, lightRhythm, sectorLight, leadingLine, chartSymbol, chartExcerpt, sparRule, pointerPole, lightDecoder, MARK_KINDS: KIND_NAMES, CHART_SYMBOLS: SYM_NAMES });

  /* ---------- gallery ---------- */
  const g = S.gallery;
  KIND_NAMES.forEach(k => {
    g.push({ name: `mark ${k}`, svg: () => mark(k) });
    g.push({ name: `mark ${k} light`, svg: () => mark(k, { light: true }) });
    if (!NO_PERCH.includes(k)) g.push({ name: `mark ${k} perch`, svg: () => mark(k, { form: 'perch' }) });
    if (!NO_NORWEGIAN_FORMS.includes(k)) g.push({ name: `mark ${k} spar`, svg: () => mark(k, { form: 'spar' }) });
  });
  g.push({ name: 'mark lateral-starboard cone light', svg: () => mark('lateral-starboard', { form: 'cone', light: true }) });
  g.push({ name: 'mark lateral-port can form light', svg: () => mark('lateral-port', { form: 'can', light: true }) });
  g.push({ name: 'cardinalCompass', svg: () => cardinalCompass() });
  g.push({ name: 'lateralChannel', svg: () => lateralChannel() });
  ['F', 'Fl 5s', 'Fl(2) 10s', 'Fl(3) 15s', 'LFl 10s', 'Q', 'VQ', 'Q(3) 10s', 'VQ(3) 5s', 'Q(6)+LFl 15s', 'VQ(6)+LFl 10s', 'Q(9) 15s', 'VQ(9) 10s', 'Iso 4s', 'Oc 6s', 'Oc(2) 10s', 'Mo(A) 8s', 'Fl(2+1) 10s', 'Al WR', 'Fl(4) Y 10s', 'Oc Y 2s', 'Al BuY 3s'].forEach(spec => g.push({ name: `lightRhythm ${spec}`, svg: () => lightRhythm(spec) }));
  g.push({ name: 'lightRhythm Fl(2+1) 10s G', svg: () => lightRhythm('Fl(2+1) 10s', { color: 'G' }) });
  g.push({ name: 'lightRhythm Fl 5s G', svg: () => lightRhythm('Fl 5s', { color: 'G' }) });
  g.push({ name: 'sectorLight fairway', svg: () => sectorLight({ preset: 'fairway' }) });
  g.push({ name: 'sectorLight two-fairways', svg: () => sectorLight({ preset: 'two-fairways' }) });
  g.push({ name: 'leadingLine', svg: () => leadingLine() });
  SYM_NAMES.forEach(k => g.push({ name: `chartSymbol ${k}`, svg: () => chartSymbol(k) }));
  g.push({ name: 'chartExcerpt', svg: () => chartExcerpt() });
  g.push({ name: 'mark sparRule (Norwegian top shapes)', svg: () => sparRule() });
  ['left', 'right', 'both'].forEach(v => g.push({ name: `perch pointerPole ${v}`, svg: () => pointerPole(v) }));
  g.push({ name: 'lightRhythm decoder Fl(3) WRG 15s 21m 15-11M', svg: () => lightDecoder() });
})();
