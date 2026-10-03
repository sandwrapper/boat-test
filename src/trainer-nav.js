/* Skipper Prep — Navigation calculator drills.
   Randomised NUMERIC drills (typed answer + check button, small tolerance), not multiple choice:
   speed–time–distance (three forms), the 6-minute rule, compass/true conversions with variation and
   deviation (random signs), one-step magnetic conversions, reciprocal bearings, relative → true bearing,
   latitude minute = nautical mile, ETA for a leg, fuel-thirds planning and updating variation from the rose.
   Every correct answer is derived from the verified fact sheet "charts-and-navigation.md"; the fact
   numbers (F65, F70, F80 …) are cited in code comments next to each generator and in the explanations.
   Sign convention throughout (F79): east = +, west = −. */
(function () {
  'use strict';
  const B = window.BOAT;
  const esc = B.esc;
  const S = B.svg;                      // BOAT_SVG: courseTriangle, compassRose, std, latitudeScale, svg, text, COLORS

  /* ---------- small helpers ---------- */
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const norm = d => ((d % 360) + 360) % 360;
  const deg3 = d => String(Math.round(norm(d))).padStart(3, '0') + '°';
  const num = n => String(Math.round(n * 100) / 100);
  const ew = v => (v >= 0 ? 'E' : 'W');
  const signed = v => `${Math.abs(v)}° ${ew(v)}`;           // 4 → "4° E", −3 → "3° W"
  const hm = min => { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`; };
  const clock = min => { min = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`; };
  /* Non-zero variation/deviation. Norway's variation is easterly everywhere (F74) but the exam and the
     syllabus (1.3 d) require handling both signs, so westerly values appear too, labelled as practice. */
  const nonZero = (lo, hi) => { let v = 0; while (v === 0) v = rnd(lo, hi); return v; };

  /* ---------- answer parsing ---------- */
  // "7,5" → 7.5; "007°" → 7; "1 h 30 min" is NOT parsed as 90 (prompts always say which unit to use).
  function parseNum(s) {
    const m = /-?\d+(?:[.,]\d+)?/.exec(String(s || '').replace(/\s+/g, ''));
    return m ? parseFloat(m[0].replace(',', '.')) : NaN;
  }
  // Clock answers: "10:39", "1039", "10.39", "10 39" → minutes since midnight.
  function parseClock(s) {
    const m = /(\d{1,2})\s*[:.h]?\s*(\d{2})\b/.exec(String(s || '').trim());
    if (!m) return NaN;
    const h = +m[1], mm = +m[2];
    if (h > 23 || mm > 59) return NaN;
    return h * 60 + mm;
  }

  /* ---------- inline pictures that have no library helper ---------- */
  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', MUTED = 'var(--muted)', LINE = 'var(--line)', PAPER = 'var(--paper)', PAPER2 = 'var(--paper-2)', MAGENTA = 'var(--accent)', SEA = 'var(--sea)';
  const T = (x, y, s, o) => S.text(x, y, s, o);
  const dirv = a => [Math.sin(a * Math.PI / 180), -Math.cos(a * Math.PI / 180)];
  function arrow(cx, cy, a, r, color, w) {
    const [ux, uy] = dirv(a), x2 = cx + ux * r, y2 = cy + uy * r, [px, py] = dirv(a + 90);
    const hx = x2 - ux * 14, hy = y2 - uy * 14;
    return `<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="${color}" stroke-width="${w || 3}" stroke-linecap="round"/>` +
      `<polygon points="${x2},${y2} ${hx + px * 6},${hy + py * 6} ${hx - px * 6},${hy - py * 6}" fill="${color}"/>`;
  }
  // Compass circle with the boat's true heading (grey) and the bearing to an object (magenta); for a
  // reciprocal round the second arrow is the opposite direction (F86: bearings 0–360° clockwise from north).
  function bearingPlot(o) {
    const W = 600, H = 360, cx = 190, cy = 180, R = 140;
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`;
    for (let a = 0; a < 360; a += 10) { const [ux, uy] = dirv(a); const len = a % 30 === 0 ? 14 : 7; s += `<line x1="${cx + ux * R}" y1="${cy + uy * R}" x2="${cx + ux * (R - len)}" y2="${cy + uy * (R - len)}" stroke="${INK}" stroke-width="${a % 30 === 0 ? 1.4 : .7}"/>`; }
    [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']].forEach(([a, l]) => { const [ux, uy] = dirv(a); s += T(cx + ux * (R + 18), cy + uy * (R + 18), l, { size: 14, weight: 700 }); });
    if (o.heading != null) {
      // boat outline pointing along the heading
      const [ux, uy] = dirv(o.heading), [px, py] = dirv(o.heading + 90);
      const pts = [[0, -46], [16, -10], [14, 40], [-14, 40], [-16, -10]].map(([x, y]) => `${cx + px * x - ux * y},${cy + py * x - uy * y}`).join(' ');
      s += `<polygon points="${pts}" fill="${S.COLORS.hullLight}" stroke="${INK}" stroke-width="1.5" opacity=".95"/>`;
      s += arrow(cx, cy, o.heading, R - 4, INK2, 2.5);
      s += T(cx + ux * (R - 30) + px * 26, cy + uy * (R - 30) + py * 26, `heading ${deg3(o.heading)}`, { size: 12, fill: INK2, weight: 700 });
    }
    s += arrow(cx, cy, o.bearing, R - 4, MAGENTA, 3);
    if (o.second != null) s += arrow(cx, cy, o.second, R - 4, SEA, 3);
    if (o.relative != null) {
      // relative-bearing arc from the bow to the object, clockwise
      const r = 60, a1 = o.heading, span = norm(o.relative), [x1, y1] = dirv(a1), [x2, y2] = dirv(a1 + span);
      s += `<path d="M${cx + x1 * r},${cy + y1 * r} A${r},${r} 0 ${span > 180 ? 1 : 0},1 ${cx + x2 * r},${cy + y2 * r}" fill="none" stroke="${MAGENTA}" stroke-width="2" stroke-dasharray="4 3"/>`;
    }
    // legend / working on the right
    const lx = 360;
    s += `<rect x="${lx - 10}" y="40" width="240" height="280" rx="8" fill="${PAPER2}" stroke="${LINE}"/>`;
    (o.lines || []).forEach((l, i) => s += T(lx + 2, 70 + i * 30, l, { size: 13, anchor: 'start', weight: i === o.lines.length - 1 ? 700 : 500, fill: i === o.lines.length - 1 ? MAGENTA : INK }));
    return S.svg(W, H, s, { label: o.label || 'Bearing diagram' });
  }
  // Fuel tank split into thirds (F103): out, back, reserve.
  function fuelThirds(o) {
    const W = 600, H = 250, x = 40, y = 70, w = 520, h = 70, third = w / 3;
    let s = T(W / 2, 30, `Tank ${o.tank} L · burns ${o.burn} L/h at ${o.speed} kn`, { size: 15, weight: 700 });
    const cols = [SEA, MAGENTA, MUTED], names = ['OUT', 'BACK', 'RESERVE'];
    for (let i = 0; i < 3; i++) {
      s += `<rect x="${x + i * third}" y="${y}" width="${third}" height="${h}" fill="${cols[i]}" opacity=".75" stroke="${INK}" stroke-width="1.5"/>`;
      s += T(x + i * third + third / 2, y + 26, names[i], { size: 15, weight: 800, fill: '#ffffff' });
      s += T(x + i * third + third / 2, y + 50, `${num(o.tank / 3)} L`, { size: 14, weight: 700, fill: '#ffffff' });
    }
    s += T(W / 2, y + h + 30, `1/3 out = ${num(o.tank / 3)} L ÷ ${o.burn} L/h = ${num(o.hours)} h at cruise`, { size: 14, fill: INK });
    s += T(W / 2, y + h + 56, `${num(o.hours)} h × ${o.speed} kn = ${num(o.nm)} NM before turning back`, { size: 14, weight: 700, fill: MAGENTA });
    s += T(W / 2, y + h + 86, 'Rule of thumb (F103): one third out, one third back, one third in reserve.', { size: 11.5, fill: MUTED });
    return S.svg(W, H, s, { label: `Fuel thirds: ${o.tank} litre tank, ${num(o.tank / 3)} litres out, ${num(o.hours)} hours at ${o.burn} litres per hour, ${num(o.nm)} nautical miles at ${o.speed} knots` });
  }

  /* ---------- round templates ----------
     Each returns { kind, prompt, unit, answer, tol, parse?, isAngle?, steps:[...], rule, art }.
     answer is checked |typed − answer| ≤ tol (angles modulo 360). */
  const T_STD_MIN = [6, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 48, 50, 60, 72, 75, 80, 90, 100, 120];
  // Speeds and minutes are combined so that distance = speed × minutes / 60 has at most one decimal.
  function stdPair() {
    for (let i = 0; i < 50; i++) { const sp = rnd(4, 30), mn = pick(T_STD_MIN); if ((sp * mn) % 6 === 0) return { sp, mn, d: sp * mn / 60 }; }
    return { sp: 12, mn: 40, d: 8 };
  }
  const STD_RULE = 'F70: Distance (NM) = Speed (kn) × Time (h); Time = Distance ÷ Speed; Speed = Distance ÷ Time. Minutes ÷ 60 = hours (F67: 1 knot = 1 NM per hour).';

  const templates = {
    // F70 worked example: 12 kn for 40 min = 12 × 40/60 = 8 NM.  Derivation: d = sp × mn/60.
    'std-distance'() {
      const { sp, mn, d } = stdPair();
      return { kind: 'Speed – time – distance', prompt: `You run at ${sp} knots for ${mn} minutes. How far have you travelled?`, unit: 'NM', answer: d, tol: 0.1,
        steps: [`${mn} min ÷ 60 = ${num(mn / 60)} h`, `Distance = Speed × Time = ${sp} kn × ${num(mn / 60)} h = ${num(d)} NM`], rule: STD_RULE,
        art: () => S.std({ speed: sp, minutes: mn }) };
    },
    // F70 worked example: 15 NM at 10 kn = 1.5 h = 1 h 30 min.  Derivation: minutes = d / sp × 60.
    'std-time'() {
      const { sp, mn, d } = stdPair();
      return { kind: 'Speed – time – distance', prompt: `A leg measures ${num(d)} NM and you make ${sp} knots. How long does it take? Answer in minutes.`, unit: 'min', answer: mn, tol: 1,
        steps: [`Time = Distance ÷ Speed = ${num(d)} NM ÷ ${sp} kn = ${num(d / sp)} h`, `${num(d / sp)} h × 60 = ${mn} min${mn >= 60 ? ` (${hm(mn)})` : ''}`], rule: STD_RULE,
        art: () => S.std({ distance: d, speed: sp }) };
    },
    // F70 / worked example 5: 4.5 NM in 27 min (0.45 h) → 4.5 / 0.45 = 10 knots.  Derivation: sp = d / (mn/60).
    'std-speed'() {
      const { sp, mn, d } = stdPair();
      return { kind: 'Speed – time – distance', prompt: `You cover ${num(d)} NM in ${mn} minutes. What is your speed?`, unit: 'kn', answer: sp, tol: 0.2,
        steps: [`${mn} min ÷ 60 = ${num(mn / 60)} h`, `Speed = Distance ÷ Time = ${num(d)} NM ÷ ${num(mn / 60)} h = ${sp} kn`], rule: STD_RULE,
        art: () => S.std({ distance: d, minutes: mn }) };
    },
    // F71: in 6 minutes (0.1 h) you travel one tenth of your speed in NM (18 kn → 1.8 NM; in 12 min, 3.6 NM).
    'six-minute'() {
      const sp = rnd(5, 30), k = pick([1, 1, 2, 3]), mn = 6 * k, d = sp * k / 10;
      return { kind: 'Six-minute rule', prompt: `You are making ${sp} knots. How far do you travel in ${mn} minutes?`, unit: 'NM', answer: d, tol: 0.05,
        steps: [`6 min = 0.1 h, so in 6 min you cover one tenth of your speed: ${sp} ÷ 10 = ${num(sp / 10)} NM`].concat(k > 1 ? [`${mn} min = ${k} × 6 min → ${k} × ${num(sp / 10)} = ${num(d)} NM`] : []),
        rule: 'F71 (6-minute rule), which is F70 with time = 0.1 h: distance = speed × 0.1.',
        art: () => S.std({ speed: sp, minutes: mn }) };
    },
    // F80 (CADET): Magnetic = Compass + deviation (E +); True = Magnetic + variation (E +). F82: 359° + 4° E + 4° E = 367 → 007°.
    'compass-to-true'() {
      const cc = rnd(0, 359), dev = nonZero(-6, 6), vr = Math.random() < 0.75 ? rnd(1, 12) : -rnd(1, 6);
      const mc = norm(cc + dev), tc = norm(mc + vr), rawM = cc + dev, rawT = mc + vr;
      return { kind: 'Compass → true', prompt: `Your steering compass shows ${deg3(cc)}. Deviation on this heading is ${signed(dev)}, variation ${signed(vr)}. What is the true course?`, unit: '° true', answer: tc, tol: 0.5, isAngle: true,
        steps: [`Compass ${deg3(cc)} ${dev >= 0 ? '+' : '−'} deviation ${Math.abs(dev)}° = ${rawM !== mc ? `${rawM} → ${deg3(mc)} (wrap at 360)` : deg3(mc)} magnetic`,
          `Magnetic ${deg3(mc)} ${vr >= 0 ? '+' : '−'} variation ${Math.abs(vr)}° = ${rawT !== tc ? `${rawT} → ${deg3(tc)} (wrap at 360)` : deg3(tc)} true`],
        rule: 'F80 "CADET" – Compass ADd East to get True: going from compass to magnetic to true, ADD easterly and SUBTRACT westerly errors (F79: east = +, west = −).' + (vr < 0 ? ' Westerly variation is for practice only – all of Norway has easterly variation (F74).' : ''),
        art: () => S.courseTriangle({ compass: cc, variation: vr, deviation: dev }) };
    },
    // F80 reverse: Magnetic = True − variation; Compass = Magnetic − deviation.  Worked example 2: 146° T, var 4° W, dev 2° E → 150° M → 148° C.
    'true-to-compass'() {
      const tc = rnd(0, 359), dev = nonZero(-6, 6), vr = Math.random() < 0.75 ? rnd(1, 12) : -rnd(1, 6);
      const mc = norm(tc - vr), cc = norm(mc - dev), rawM = tc - vr, rawC = mc - dev;
      return { kind: 'True → compass', prompt: `The course you drew in the chart is ${deg3(tc)} true. Variation is ${signed(vr)} and the deviation table gives ${signed(dev)}. What course do you steer by compass?`, unit: '° compass', answer: cc, tol: 0.5, isAngle: true,
        steps: [`True ${deg3(tc)} ${vr >= 0 ? '−' : '+'} variation ${Math.abs(vr)}° = ${rawM !== mc ? `${rawM} → ${deg3(mc)} (wrap)` : deg3(mc)} magnetic`,
          `Magnetic ${deg3(mc)} ${dev >= 0 ? '−' : '+'} deviation ${Math.abs(dev)}° = ${rawC !== cc ? `${rawC} → ${deg3(cc)} (wrap)` : deg3(cc)} compass`],
        rule: 'F80: from true to compass do the opposite of CADET – SUBTRACT easterly, ADD westerly (F81: "error east, compass least; error west, compass best"). Worked example F83: 146° true with 4° W variation gives 150° magnetic.' + (vr < 0 ? ' Westerly variation is for practice only – Norway is easterly (F74).' : ''),
        art: () => S.courseTriangle({ true: tc, variation: vr, deviation: dev }) };
    },
    // One step only (F80/F83): true ↔ magnetic with variation, or compass → magnetic with deviation.
    'one-step'() {
      const v = Math.random() < 0.75 ? rnd(1, 12) : -rnd(1, 6), start = rnd(0, 359), which = pick(['t2m', 'm2t', 'c2m']);
      if (which === 't2m') {
        const mc = norm(start - v), raw = start - v;
        return { kind: 'Variation only', prompt: `True course ${deg3(start)}, variation ${signed(v)}. What is the magnetic course?`, unit: '° magnetic', answer: mc, tol: 0.5, isAngle: true,
          steps: [`True ${deg3(start)} ${v >= 0 ? '−' : '+'} variation ${Math.abs(v)}° = ${raw !== mc ? `${raw} → ${deg3(mc)} (wrap)` : deg3(mc)} magnetic`],
          rule: 'F80: Magnetic = True − variation (east positive), so easterly variation is subtracted and westerly added. F83 worked example: 146° true, 4° W → 150° magnetic.',
          art: () => S.courseTriangle({ true: start, variation: v, deviation: 0 }) };
      }
      if (which === 'm2t') {
        const tc = norm(start + v), raw = start + v;
        return { kind: 'Variation only', prompt: `Magnetic course ${deg3(start)}, variation ${signed(v)}. What is the true course?`, unit: '° true', answer: tc, tol: 0.5, isAngle: true,
          steps: [`Magnetic ${deg3(start)} ${v >= 0 ? '+' : '−'} variation ${Math.abs(v)}° = ${raw !== tc ? `${raw} → ${deg3(tc)} (wrap)` : deg3(tc)} true`],
          rule: 'F80: True = Magnetic + variation with east positive (CADET). F73: variation is the angle between true and magnetic north.',
          art: () => S.courseTriangle({ compass: start, variation: v, deviation: 0 }) };
      }
      const dev = nonZero(-6, 6), mc = norm(start + dev), raw = start + dev;
      return { kind: 'Deviation only', prompt: `Compass course ${deg3(start)}, deviation ${signed(dev)}. What is the magnetic course?`, unit: '° magnetic', answer: mc, tol: 0.5, isAngle: true,
        steps: [`Compass ${deg3(start)} ${dev >= 0 ? '+' : '−'} deviation ${Math.abs(dev)}° = ${raw !== mc ? `${raw} → ${deg3(mc)} (wrap)` : deg3(mc)} magnetic`],
        rule: 'F80: Magnetic = Compass + deviation (east positive). F78: deviation comes from the boat\'s own magnetism and changes with heading, so read it from the deviation table for this heading.',
        art: () => S.courseTriangle({ compass: start, variation: 0, deviation: dev }) };
    },
    // Reciprocal bearing: the opposite direction on the 0–360° compass (F86/F39: bearings run 0–360° clockwise
    // from north), i.e. ±180°. Used when a bearing TO an object is turned into the bearing FROM it for plotting (F87).
    'reciprocal'() {
      const b = rnd(0, 359), r = norm(b + 180);
      return { kind: 'Reciprocal bearing', prompt: `The true bearing from your boat to a lighthouse is ${deg3(b)}. What is the reciprocal – the bearing from the lighthouse back to you, which you plot on the chart?`, unit: '° true', answer: r, tol: 0.5, isAngle: true,
        steps: [b < 180 ? `${deg3(b)} + 180° = ${deg3(r)}` : `${deg3(b)} − 180° = ${deg3(r)} (adding 180 would exceed 360)`],
        rule: 'A reciprocal is the same line in the opposite direction: ±180° on the 0–360° compass (F86 – bearings are directions measured clockwise from north; F87 – position lines are plotted from the charted object toward the boat).',
        art: () => bearingPlot({ bearing: b, second: r, lines: ['Bearing to the object (magenta):', deg3(b), 'Reciprocal (teal), plotted from', 'the object back to the boat:', `${deg3(b)} ${b < 180 ? '+' : '−'} 180° = ${deg3(r)}`], label: `Bearing ${deg3(b)} and its reciprocal ${deg3(r)}` }) };
    },
    // F86: relative bearing is measured from the bow; true bearing = true heading + relative bearing (mod 360).
    'relative'() {
      const hd = rnd(0, 359), rel = pick([10, 20, 30, 45, 60, 90, 120, 135, 225, 240, 270, 300, 315, 330, 340, 350]);
      // "on the bow" only up to 90°; beyond that it is abeam / abaft the beam, so name the side and the angle from the bow
      const tb = norm(hd + rel), raw = hd + rel, off = rel < 180 ? rel : 360 - rel, sideName = rel < 180 ? 'starboard' : 'port';
      const side = off === 90 ? `abeam to ${sideName} (relative ${deg3(rel)})` : off < 90 ? `${off}° on the ${sideName} bow (relative ${deg3(rel)})` : `${off}° to ${sideName} of the bow, abaft the beam (relative ${deg3(rel)})`;
      return { kind: 'Relative → true bearing', prompt: `You are steering ${deg3(hd)} true and sight a beacon ${side}. What is the true bearing of the beacon?`, unit: '° true', answer: tb, tol: 0.5, isAngle: true,
        steps: [`Relative bearing measured clockwise from the bow = ${deg3(rel)}`, `True bearing = heading + relative = ${hd} + ${rel} = ${raw !== tb ? `${raw} → ${deg3(tb)} (wrap at 360)` : deg3(tb)}`],
        rule: 'F86: a relative bearing is measured from the boat\'s bow, a true bearing from true north; only true bearings are plotted on the chart. Add the relative bearing (clockwise 0–360°) to the true heading.',
        art: () => bearingPlot({ heading: hd, bearing: tb, relative: rel, lines: [`Heading ${deg3(hd)} true`, `Relative ${deg3(rel)} (dashed arc)`, 'True bearing = heading + relative', `${hd} + ${rel} = ${raw}${raw !== tb ? ` − 360 = ${tb}` : ''}`, `= ${deg3(tb)} true`], label: `Heading ${deg3(hd)}, relative bearing ${deg3(rel)}, true bearing ${deg3(tb)}` }) };
    },
    // F65: 1' of latitude = 1 NM = 1852 m. F66: 1 cable = 0.1 NM = 185.2 m. F68: 1' of longitude at 60°N ≈ 0.5 NM (cos 60° = 0.5).
    'latitude'() {
      const which = pick(['min2nm', 'min2nm', 'nm2m', 'm2nm', 'cable', 'lon60']);
      const art = () => S.latitudeScale();
      if (which === 'min2nm') {
        const mins = pick([2.5, 3, 4.5, 6, 7.5, 8, 10, 12.5]);
        return { kind: 'Chart scale', prompt: `With dividers you span ${num(mins)}′ (minutes) on the latitude scale at the side of the chart. What distance is that?`, unit: 'NM', answer: mins, tol: 0.05,
          steps: [`1′ of latitude = 1 nautical mile, so ${num(mins)}′ = ${num(mins)} NM`], rule: 'F65: the nautical mile is 1852 m and 1 minute of latitude ≈ 1 NM. F68: measure on the latitude (side) scale, never on the longitude scale.', art };
      }
      if (which === 'nm2m') {
        const nm = pick([1, 2, 2.5, 3, 5, 10]);
        return { kind: 'Chart scale', prompt: `How many metres are ${num(nm)} nautical mile${nm === 1 ? '' : 's'}?`, unit: 'm', answer: nm * 1852, tol: 1,
          steps: [`${num(nm)} × 1852 m = ${nm * 1852} m`], rule: 'F65: the international nautical mile is exactly 1852 m (= 1′ of latitude).', art };
      }
      if (which === 'm2nm') {
        const nm = pick([0.5, 1, 1.5, 2, 3, 4]);
        return { kind: 'Chart scale', prompt: `A channel is ${nm * 1852} m long. How many nautical miles is that?`, unit: 'NM', answer: nm, tol: 0.05,
          steps: [`${nm * 1852} m ÷ 1852 m/NM = ${num(nm)} NM`], rule: 'F65: 1 NM = 1852 m.', art };
      }
      if (which === 'cable') {
        const c = pick([1, 2, 3, 5, 10]);
        return { kind: 'Chart scale', prompt: `A chart note says "keep ${c} cable${c === 1 ? '' : 's'} off the point". How many metres is that?`, unit: 'm', answer: c * 185.2, tol: 1,
          steps: [`1 cable = 0.1 NM = 185.2 m`, `${c} × 185.2 m = ${num(c * 185.2)} m`], rule: 'F66: a cable (kabellengde) is one tenth of a nautical mile, 185.2 m.', art };
      }
      const mins = pick([1, 2, 4, 6, 10]);
      return { kind: 'Chart scale', prompt: `At 60°N you mistakenly measure ${mins}′ on the LONGITUDE scale (top border). About how many nautical miles does that really represent?`, unit: 'NM', answer: mins * 0.5, tol: 0.05,
        steps: [`1′ of longitude = cos(latitude) NM; cos 60° = 0.5, so 1′ ≈ 0.5 NM`, `${mins}′ × 0.5 = ${num(mins * 0.5)} NM – half of what the latitude scale would give`],
        rule: 'F68: distance must be measured on the latitude scale; 1′ of longitude shrinks with the cosine of the latitude and is only about 0.5 NM (≈ 926 m) at 60°N.', art };
    },
    // F70 time form plus clock arithmetic (worked example 5 reversed: beacon at 10:12, 4.5 NM at 10 kn = 27 min → 10:39).
    'eta'() {
      const { sp, mn, d } = stdPair();
      const dep = rnd(6, 20) * 60 + pick([0, 5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 48, 50, 55]);
      const arr = (dep + mn) % 1440;
      return { kind: 'Time to run a distance', prompt: `You pass a beacon at ${clock(dep)} making ${sp} knots. The next waypoint is ${num(d)} NM ahead. At what time do you reach it? Answer as HH:MM.`, unit: 'HH:MM', answer: arr, tol: 1, parse: parseClock, isClock: true,
        steps: [`Time = Distance ÷ Speed = ${num(d)} ÷ ${sp} = ${num(d / sp)} h = ${mn} min${mn >= 60 ? ` (${hm(mn)})` : ''}`, `${clock(dep)} + ${hm(mn)} = ${clock(arr)}`],
        rule: STD_RULE + ' Worked example 5 of the fact sheet runs the same leg the other way: 4.5 NM between 10:12 and 10:39 (27 min) = 10 knots.',
        art: () => S.std({ distance: d, speed: sp }) };
    },
    // F103 / worked example 16: 60 L tank, 20 L/h → 20 L out, 20 L back, 20 L reserve → 1 h out ≈ 15 NM at 15 kn.
    'fuel'() {
      const combos = [[60, 20], [60, 10], [90, 15], [90, 30], [120, 20], [120, 40], [150, 25], [150, 10], [180, 20], [180, 30], [180, 15], [240, 40], [240, 20], [300, 25], [300, 50]];
      const [tank, burn] = pick(combos), speed = pick([10, 12, 15, 18, 20, 22, 25]);
      const out = tank / 3, hours = out / burn, nm = hours * speed;
      const askLitres = Math.random() < 0.3;
      const common = { kind: 'Fuel planning (thirds rule)', rule: 'F103: carry enough fuel using the 1/3 rule – one third out, one third back, one third in reserve (a recommendation, not Norwegian law). Range follows from F70: distance = speed × time.', art: () => fuelThirds({ tank, burn, speed, hours, nm }) };
      if (askLitres) return Object.assign(common, { prompt: `Your tank holds ${tank} litres. Using the thirds rule, how many litres may you use on the way OUT?`, unit: 'L', answer: out, tol: 0.5,
        steps: [`${tank} L ÷ 3 = ${num(out)} L out, ${num(out)} L back, ${num(out)} L reserve`] });
      return Object.assign(common, { prompt: `Tank ${tank} litres, engine burns ${burn} L/h at ${speed} knots cruising. Using the thirds rule, how far out can you go before you must turn back?`, unit: 'NM', answer: nm, tol: 0.5,
        steps: [`One third of ${tank} L = ${num(out)} L for the outward leg`, `${num(out)} L ÷ ${burn} L/h = ${num(hours)} h at cruise`, `${num(hours)} h × ${speed} kn = ${num(nm)} NM`] });
    },
    // F76: the rose gives variation + annual change, e.g. "4° E 2020 (8'W)" = 4° E decreasing 8′ per year.
    // Worked example 3: "3° E 2020 (10'E)" → in 2026, 3° + 6 × 10′ = 4° E.  Values chosen so the result is a whole or half degree.
    'variation-update'() {
      const base = rnd(2, 8), ch = pick([[6, 5], [10, 6], [10, 3], [12, 5], [5, 6], [15, 2], [15, 4], [6, 10], [10, 9]]);
      const [mins, years] = ch, dir = Math.random() < 0.7 ? 'E' : 'W';
      const year = years > 6 ? 2015 : pick([2015, 2020]);        // target year stays ≤ 2026 (today), like a real chart excerpt
      const total = mins * years, delta = total / 60 * (dir === 'E' ? 1 : -1), result = base + delta;
      if (result <= 0) return templates['variation-update']();
      const target = year + years;
      return { kind: 'Variation from the rose', prompt: `The compass rose reads "${base}° E ${year} (${mins}'${dir})". What variation (degrees east) do you use in ${target}?`, unit: '° E', answer: result, tol: 0.05,
        steps: [`Annual change ${mins}′ ${dir === 'E' ? 'east → variation increasing' : 'west → variation decreasing'}`, `${target} − ${year} = ${years} years × ${mins}′ = ${total}′ = ${num(total / 60)}°`, `${base}° E ${dir === 'E' ? '+' : '−'} ${num(total / 60)}° = ${num(result)}° E`],
        rule: 'F76: the rose carries the variation and its annual change in minutes with E or W; apply the change for each year since the printed year (worked example 3). F74: Norwegian variation grows about 0.1–0.2° per year.',
        art: () => S.compassRose({ variation: result, year: target, change: `${mins}'${dir}` }) };
    },
  };
  const TEMPLATE_IDS = Object.keys(templates);

  /* ---------- the trainer ---------- */
  function mount(root) {
    let streak = 0, right = 0, total = 0, round = null, locked = false, lastId = null, lastPrompt = '';
    root.innerHTML = `
      <div class="stat"><span>Streak <b class="num" id="nvStreak">0</b></span><span>Score <b class="num" id="nvScore">0/0</b></span><span class="muted" id="nvKind"></span></div>
      <p class="small muted" style="margin:.4rem 0 .8rem">Type the number and press Enter (or Check). Degrees can be written 7 or 007; decimals with a point or comma. Sign convention: east = +, west = −.</p>
      <p class="qtext" id="nvPrompt"></p>
      <form class="inputrow" id="nvForm" autocomplete="off" style="margin-bottom:.4rem">
        <label for="nvInput" class="sr-only">Your answer</label>
        <input id="nvInput" type="text" inputmode="decimal" placeholder="?" aria-describedby="nvUnit"
          style="font:inherit;font-family:var(--font-mono);font-size:1.25rem;padding:.45rem .7rem;width:9em;max-width:100%;border:1px solid var(--line);border-radius:6px;background:var(--paper);color:var(--ink)">
        <span id="nvUnit" class="num" style="font-weight:700;color:var(--ink-2)"></span>
        <button type="submit" class="btn primary" id="nvCheck">Check</button>
        <button type="button" class="btn ghost" id="nvShow">Show solution</button>
        <button type="button" class="btn primary" id="nvNext" hidden>Next</button>
      </form>
      <div class="result" id="nvResult" aria-live="polite"></div>
      <div id="nvSolution" hidden></div>
      <div class="stage" id="nvStage" hidden></div>`;
    const $ = s => root.querySelector(s);
    const input = $('#nvInput'), stage = $('#nvStage'), sol = $('#nvSolution'), result = $('#nvResult');
    // .btn sets display:flex, which beats the [hidden] attribute, so toggle display explicitly.
    const show = (el, on) => { el.hidden = !on; el.style.display = on ? '' : 'none'; };
    const btnCheck = $('#nvCheck'), btnShow = $('#nvShow'), btnNext = $('#nvNext');

    function makeRound() {
      // never the same template twice in a row, and never the identical prompt
      for (let i = 0; i < 20; i++) {
        const id = pick(TEMPLATE_IDS.filter(t => t !== lastId));
        const r = templates[id]();
        if (r.prompt !== lastPrompt) { r.id = id; return r; }
      }
      const id = pick(TEMPLATE_IDS); const r = templates[id](); r.id = id; return r;
    }
    function next() {
      round = makeRound(); lastId = round.id; lastPrompt = round.prompt; locked = false;
      $('#nvKind').textContent = round.kind; $('#nvPrompt').textContent = round.prompt; $('#nvUnit').textContent = round.unit;
      input.value = ''; input.disabled = false; input.placeholder = round.isClock ? 'HH:MM' : '?';
      result.textContent = ''; result.className = 'result';
      show(sol, false); sol.innerHTML = ''; show(stage, false); stage.innerHTML = '';
      show(btnCheck, true); show(btnShow, true); show(btnNext, false);
      input.focus();
    }
    function fmtAnswer(r) {
      if (r.isClock) return clock(r.answer);
      if (r.isAngle) return deg3(r.answer);
      return num(r.answer) + ' ' + r.unit;
    }
    function finish(ok, typed, gaveUp) {
      locked = true; total++;
      if (ok) { right++; streak++; } else streak = 0;
      input.disabled = true;
      result.className = 'result ' + (ok ? 'good' : 'badr');
      result.innerHTML = gaveUp ? `<strong>Solution shown.</strong> The answer is ${esc(fmtAnswer(round))}.` : ok ? `<strong>Correct.</strong> ${esc(fmtAnswer(round))}.` : `<strong>No.</strong> You typed ${esc(typed)}; the answer is ${esc(fmtAnswer(round))}.`;
      show(sol, true);
      sol.innerHTML = `<div class="explain ${ok ? '' : 'bad'}"><div class="eyebrow" style="margin-bottom:.3rem">Worked solution</div><ol style="margin:0 0 .5rem;padding-left:1.3rem">${round.steps.map(s => `<li class="num" style="font-family:var(--font-body)">${esc(s)}</li>`).join('')}</ol><p class="small" style="margin:0;color:var(--ink-2)"><b>Rule:</b> ${esc(round.rule)}</p></div>`;
      show(stage, true); stage.innerHTML = B.renderArt(round.art);
      $('#nvStreak').textContent = streak; $('#nvScore').textContent = `${right}/${total}`;
      show(btnCheck, false); show(btnShow, false); show(btnNext, true); btnNext.focus();
    }
    function check() {
      if (locked) return;
      const raw = input.value.trim();
      const val = (round.parse || parseNum)(raw);
      if (isNaN(val)) { result.className = 'result badr'; result.textContent = round.isClock ? 'Type a time such as 10:39.' : 'Type a number first.'; input.focus(); return; }
      let diff = Math.abs(val - round.answer);
      if (round.isAngle) diff = Math.min(norm(val - round.answer), norm(round.answer - val));
      if (round.isClock) diff = Math.min(diff, 1440 - diff);
      finish(diff <= round.tol + 1e-9, raw, false);
    }
    $('#nvForm').addEventListener('submit', e => { e.preventDefault(); if (locked) next(); else check(); });
    $('#nvShow').addEventListener('click', () => { if (!locked) finish(false, '', true); });
    $('#nvNext').addEventListener('click', next);
    const onKey = e => {
      if (e.key === 'Enter' && locked) { e.preventDefault(); next(); }
      else if (e.key === 'Enter' && !locked && document.activeElement !== input && !root.contains(document.activeElement)) { input.focus(); }
    };
    document.addEventListener('keydown', onKey);
    next();
    return () => document.removeEventListener('keydown', onKey);
  }

  B.registerTrainer({
    id: 'nav',
    title: 'Navigation calculator drills',
    description: 'Typed-answer arithmetic for the chart work in the exam: speed, time and distance, compass, magnetic and true courses with variation and deviation, bearings, the nautical mile and fuel planning.',
    mount,
  });

  // expose for tests
  B.navDrills = { templates, parseNum, parseClock };
})();
