/* Skipper Prep — Topic 10: Engine, fuel and the environment.
   Facts: scratchpad/facts/engine-and-environment.md (fact ids F.. cited in comments).
   Extra verification (2026-10-03):
   - sdir.no "About CE marking" (en + no): CE marking required for recreational craft with hull length 2.5–24 m since
     16 June 1998 (engines since 1 Jan 2006); builder's plate = manufacturer, max load incl. optional outboard (kg),
     max persons, design category A–D, CE symbol (+ notified-body number if any); WIN (formerly HIN/CIN) "consists of
     15 numbers, characters and letters", permanently marked on the OUTSIDE of the hull on the STARBOARD side of the
     transom, tells who built the boat, when, and the model year (example NO-HXAB7A33G708); owner's manual to
     EN ISO 10240 with technical data, limits incl. maximum engine power (kW), fire and water-ingress risks, in a
     Scandinavian language for the Norwegian market; declaration of conformity = manufacturer's attestation with name,
     address, description of the craft and the standards used.
   - lovdata.no FOR-2016-01-15-35 (CE annex): CE mark affixed by the manufacturer or representative before the craft is
     placed on the market; on watercraft it is shown on the builder's plate, separate from the identification number.
   - storebrand.no boat insurance guide: "Boat insurance is not required by law" (Norwegian: not lovpaalagt); liability
     cover pays for damage to other people, boats and quays; hull (kasko) cover adds damage to your own boat. */
(function () {
  'use strict';
  const S = BOAT.svg, C = S.COLORS, T = S.text;
  const INK = 'var(--ink)', MUTED = 'var(--muted)', LINE = 'var(--line)', PAPER = 'var(--paper)';
  const DARK = '#15202b'; // text drawn on fixed light fills (works in both themes)
  const FUEL = '#D62828', WATER = '#1E6FD9', LAND = '#CDE7C6', SAND = '#F2E394';

  /* ---------- drawing helpers ---------- */
  function head(x, y, a, len, col) {
    const hx = x - len * Math.cos(a), hy = y - len * Math.sin(a), s = len * 0.5;
    return `<polygon points="${x.toFixed(1)},${y.toFixed(1)} ${(hx + s * Math.sin(a)).toFixed(1)},${(hy - s * Math.cos(a)).toFixed(1)} ${(hx - s * Math.sin(a)).toFixed(1)},${(hy + s * Math.cos(a)).toFixed(1)}" fill="${col}"/>`;
  }
  function arrow(x1, y1, x2, y2, o) {
    o = o || {}; const col = o.color || INK, w = o.width || 2, hl = o.head || 9;
    const a = Math.atan2(y2 - y1, x2 - x1);
    const ex = x2 - hl * 0.8 * Math.cos(a), ey = y2 - hl * 0.8 * Math.sin(a);
    const sx = o.both ? x1 + hl * 0.8 * Math.cos(a) : x1, sy = o.both ? y1 + hl * 0.8 * Math.sin(a) : y1;
    let s = `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''}/>`;
    s += head(x2, y2, a, hl, col);
    if (o.both) s += head(x1, y1, a + Math.PI, hl, col);
    return s;
  }
  function box(x, y, w, h, o) { o = o || {}; return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.fill || PAPER}" stroke="${o.stroke || LINE}" stroke-width="${o.sw || 1.5}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} ${o.op != null ? `opacity="${o.op}"` : ''}/>`; }
  function label(x, y, s, size, o) { return T(x, y, s, Object.assign({ size: size || 13 }, o || {})); }
  function lines(x, y, arr, size, o, lh) { return arr.map((s, i) => label(x, y + i * (lh || (size || 13) + 4), s, size, o)).join(''); }
  function leader(x1, y1, x2, y2, col) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || MUTED}" stroke-width="1.2"/><circle cx="${x1}" cy="${y1}" r="2.5" fill="${col || MUTED}"/>`; }
  function badge(x, y, s, col) { return `<circle cx="${x}" cy="${y}" r="13" fill="${col || INK}" stroke="${PAPER}" stroke-width="2"/>` + T(x, y, s, { size: 14, fill: PAPER, weight: 700 }); }
  function dline(x1, y1, x2, y2, col, w, dash) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w || 2}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`; }

  /* ---------- ILL-1 labelled outboard with cooling circuit, fuel system and kill cord (F12, F13, F18, F22, F39, F42) ---------- */
  function illOutboard(o) {
    o = o || {}; const quiz = !!o.quiz;
    const WL = 420;
    let s = '';
    // water
    s += `<rect x="0" y="${WL}" width="800" height="180" fill="${WATER}" opacity=".14"/>`;
    s += dline(0, WL, 800, WL, WATER, 3);
    s += label(760, WL - 12, 'waterline', 13, { fill: WATER, weight: 700 });
    // hull: bottom, transom, cockpit floor
    s += `<path d="M0,470 L360,470 L360,250 L300,250 L300,460 L0,460 Z" fill="#B0B7C3" stroke="${LINE}" stroke-width="1.5"/>`;
    s += dline(0, 400, 300, 400, MUTED, 3);
    s += label(60, 388, 'cockpit floor', 12, { fill: MUTED });
    if (!quiz) s += label(330, 300, 'TRANSOM', 12, { fill: DARK, weight: 700 }).replace('<text', '<text transform="rotate(-90 330 300)"');
    // clamp bracket
    s += box(360, 238, 52, 62, { fill: '#8A8F98', stroke: LINE, rx: 4 });
    s += `<circle cx="386" cy="262" r="6" fill="${PAPER}" stroke="${LINE}"/>`;
    // cowling
    s += box(410, 180, 220, 150, { fill: '#2B2B2B', stroke: LINE, rx: 24 });
    // inside cowling (dashed): block + spark plug
    s += box(500, 212, 90, 90, { fill: 'none', stroke: '#bbb', dash: '5 4', rx: 6, sw: 1.2 });
    s += box(595, 206, 14, 34, { fill: 'none', stroke: '#bbb', dash: '4 3', rx: 2, sw: 1.2 });
    // leg
    s += `<rect x="470" y="330" width="50" height="92" fill="#4A4A4A" stroke="${LINE}" stroke-width="1"/>`;
    s += dline(495, 334, 495, 440, '#bbb', 1.5, '6 4'); // drive shaft
    // anti-ventilation plate ON the waterline
    s += `<rect x="435" y="416" width="120" height="8" rx="3" fill="#6b7078" stroke="${LINE}" stroke-width="1"/>`;
    // gearcase (below waterline)
    s += `<rect x="450" y="428" width="140" height="77" rx="38" fill="#4A4A4A" stroke="${LINE}" stroke-width="1"/>`;
    // impeller
    s += `<circle cx="470" cy="447" r="9" fill="${WATER}" opacity=".9"/>` + `<path d="M470,438 v18 M461,447 h18 M463.6,440.6 l12.8,12.8 M476.4,440.6 l-12.8,12.8" stroke="${PAPER}" stroke-width="1.5"/>`;
    // intake grille
    for (let i = 0; i < 5; i++) s += `<rect x="${456 + i * 9}" y="464" width="4" height="18" fill="#cfd4da"/>`;
    // propeller
    s += `<circle cx="596" cy="466" r="11" fill="#8A8F98" stroke="${LINE}"/>`;
    for (let i = 0; i < 3; i++) s += `<ellipse cx="596" cy="466" rx="8" ry="34" fill="#8A8F98" stroke="${LINE}" stroke-width="1" transform="rotate(${i * 120 + 20} 596 466) translate(0 -30)"/>`;
    s += `<circle cx="596" cy="466" r="11" fill="#6b7078" stroke="${LINE}"/>` + dline(584, 466, 608, 466, PAPER, 2);
    // skeg
    s += `<polygon points="480,504 492,545 522,504" fill="#4A4A4A" stroke="${LINE}" stroke-width="1"/>`;
    // telltale (above waterline)
    s += `<circle cx="520" cy="345" r="3.5" fill="${PAPER}"/>`;
    s += `<path d="M522,345 q28,4 42,42" fill="none" stroke="${WATER}" stroke-width="2.5"/>`;
    s += `<circle cx="568" cy="393" r="2.5" fill="${WATER}"/><circle cx="574" cy="402" r="2" fill="${WATER}"/><circle cx="563" cy="406" r="2" fill="${WATER}"/>`;
    // cooling path (dashed blue, up the leg to the powerhead and back to the telltale)
    s += `<path d="M470,438 L470,430 L484,430 L484,250 L560,250 L560,345 L524,345" fill="none" stroke="${WATER}" stroke-width="2" stroke-dasharray="6 4"/>`;
    s += head(484, 390, -Math.PI / 2, 10, WATER) + head(484, 300, -Math.PI / 2, 10, WATER) + head(560, 310, Math.PI / 2, 10, WATER);
    // fuel system
    s += box(120, 330, 120, 70, { fill: FUEL, stroke: LINE, rx: 8 });
    s += `<rect x="146" y="320" width="16" height="10" rx="2" fill="#333" stroke="${LINE}"/>`; // vent
    s += `<path d="M232,338 L232,235 L410,235" fill="none" stroke="#111" stroke-width="3"/>`;
    s += `<ellipse cx="325" cy="235" rx="22" ry="10" fill="#333" stroke="${LINE}"/>`; // primer bulb
    s += box(222, 272, 20, 32, { fill: '#555', stroke: LINE, rx: 3 }); // filter
    // kill switch + cord
    s += box(414, 294, 28, 18, { fill: '#aaa', stroke: LINE, rx: 3 }) + `<circle cx="428" cy="303" r="4" fill="${FUEL}"/>`;
    s += `<path d="M420,312 Q300,322 240,382" fill="none" stroke="${FUEL}" stroke-width="2.5" stroke-dasharray="3 3"/>`;
    s += `<circle cx="233" cy="389" r="8" fill="none" stroke="${FUEL}" stroke-width="2.5"/>`;
    if (quiz) {
      s += badge(478, 473, 'A') + badge(548, 376, 'B') + badge(325, 262, 'C') + badge(430, 420, 'D');
      return S.svg(800, 600, s, { width: 640, label: 'Outboard engine with four parts marked A to D' });
    }
    // labels
    s += lines(300, 140, ['Transom clamp / tilt-and-steer bracket:', 'the whole engine pivots to steer and tilts up'], 13, { weight: 600 });
    s += leader(386, 250, 320, 160);
    s += label(600, 165, 'Cowling: engine (powerhead) inside', 14, { weight: 700 });
    s += leader(602, 240, 650, 300) + lines(652, 302, ['Spark plug', '(petrol engines only)'], 12, { anchor: 'start', fill: MUTED });
    s += label(462, 352, 'Drive shaft', 12, { anchor: 'end', fill: MUTED }) + leader(495, 352, 466, 352);
    s += lines(600, 356, ['TELLTALE (pee stream):', 'steady stream = cooling pump OK'], 13, { anchor: 'start', fill: WATER, weight: 700 });
    s += leader(545, 372, 596, 364, WATER);
    s += lines(640, 432, ['Anti-ventilation plate: at the', 'water surface when running'], 12, { anchor: 'start' });
    s += leader(555, 420, 636, 432);
    s += lines(640, 482, ['Propeller: diameter x pitch,', 'e.g. 13 x 19 inches'], 12, { anchor: 'start' });
    s += lines(640, 522, ['Shear pin / rubber hub', 'protects the gearbox'], 12, { anchor: 'start', fill: MUTED });
    s += leader(598, 466, 636, 516);
    s += label(545, 560, 'Skeg', 12) + leader(500, 535, 530, 556);
    s += lines(330, 530, ['Water-pump IMPELLER', '(rubber, replace regularly)'], 12, { weight: 600 });
    s += leader(470, 447, 400, 520);
    s += lines(470, 568, ['Cooling-water INTAKE:', 'keep clear of weed and plastic bags'], 12, { weight: 600 });
    s += leader(478, 484, 470, 556);
    s += label(180, 366, 'Portable fuel tank', 13, { fill: '#fff', weight: 700 });
    s += label(150, 305, 'VENT: OPEN when running', 12, { weight: 700 });
    s += label(325, 212, 'Primer bulb: squeeze until firm', 12);
    s += lines(212, 282, ['Fuel filter /', 'water separator'], 12, { anchor: 'end' });
    s += label(462, 326, 'Kill switch', 11, { anchor: 'end', fill: '#eee' }).replace('fill="#eee"', `fill="${PAPER}"`);
    s += label(140, 430, 'Kill cord: clipped to the driver', 12, { fill: FUEL, weight: 700 });
    // legend
    s += box(14, 548, 250, 44, { fill: PAPER, stroke: LINE });
    s += dline(24, 562, 54, 562, WATER, 2, '6 4') + label(60, 562, 'cooling-water path', 12, { anchor: 'start' });
    s += dline(24, 580, 54, 580, FUEL, 3) + label(60, 580, 'fuel', 12, { anchor: 'start' });
    s += dline(150, 580, 180, 580, '#2B2B2B', 6) + label(186, 580, 'engine', 12, { anchor: 'start' });
    return S.svg(800, 600, s, { width: 640, label: 'Labelled outboard engine with cooling circuit, fuel system and kill cord' });
  }

  /* ---------- telltale OK vs missing (F13) ---------- */
  function illTelltale() {
    function leg(x0, stream, letter) {
      let s = box(x0 + 40, 20, 120, 80, { fill: '#2B2B2B', stroke: LINE, rx: 16 });
      s += `<rect x="${x0 + 85}" y="100" width="30" height="80" fill="#4A4A4A" stroke="${LINE}"/>`;
      s += `<rect x="${x0 + 60}" y="176" width="80" height="6" fill="#6b7078"/>`;
      s += `<rect x="${x0 + 70}" y="184" width="80" height="40" rx="20" fill="#4A4A4A" stroke="${LINE}"/>`;
      s += `<circle cx="${x0 + 115}" cy="118" r="3" fill="${PAPER}"/>`;
      if (stream) s += `<path d="M${x0 + 117},118 q22,3 32,34" fill="none" stroke="${WATER}" stroke-width="2.5"/><circle cx="${x0 + 152}" cy="156" r="2.5" fill="${WATER}"/><circle cx="${x0 + 158}" cy="164" r="2" fill="${WATER}"/>`;
      s += badge(x0 + 100, 250, letter);
      return s;
    }
    let s = `<rect x="0" y="178" width="500" height="92" fill="${WATER}" opacity=".14"/>` + dline(0, 178, 500, 178, WATER, 3);
    s += leg(20, true, 'A') + leg(270, false, 'B');
    return S.svg(500, 270, s, { width: 480, label: 'Two outboards: A with a steady telltale stream, B with no stream' });
  }

  /* ---------- petrol vapour sinks into the bilge (F11, F27) ---------- */
  function illVapour() {
    let s = `<rect x="0" y="230" width="700" height="100" fill="${WATER}" opacity=".14"/>` + dline(0, 230, 700, 230, WATER, 3);
    // hull side section
    s += `<path d="M40,150 L640,150 L640,270 Q600,290 540,290 L110,290 Q60,280 40,230 Z" fill="#B0B7C3" stroke="${LINE}" stroke-width="1.5"/>`;
    s += `<path d="M60,165 L620,165 L620,268 Q590,280 540,280 L120,280 Q80,272 62,228 Z" fill="${PAPER}" stroke="none"/>`;
    // cabin
    s += `<path d="M150,150 L170,95 L420,95 L440,150 Z" fill="#B0B7C3" stroke="${LINE}" stroke-width="1.5"/>`;
    // engine compartment
    s += box(460, 180, 150, 90, { fill: '#2B2B2B', stroke: LINE, rx: 10 });
    s += label(535, 225, 'Inboard petrol engine', 12, { fill: '#fff', weight: 700 });
    s += box(300, 185, 90, 60, { fill: FUEL, stroke: LINE, rx: 6 }) + label(345, 215, 'Fuel tank', 12, { fill: '#fff', weight: 700 });
    // vapour cloud sinking
    for (let i = 0; i < 26; i++) { const x = 140 + (i * 37) % 440, y = 236 + ((i * 17) % 40); s += `<circle cx="${x}" cy="${y}" r="${4 + (i % 3)}" fill="${C.yellow}" opacity=".5"/>`; }
    s += arrow(420, 175, 420, 232, { color: C.orange, width: 3 });
    s += lines(250, 262, ['PETROL VAPOUR: about 2.8 x heavier than air,', 'sinks and collects in the bilge'], 12, { weight: 700, fill: DARK });
    // blower
    s += box(580, 100, 60, 30, { fill: PAPER, stroke: LINE }) + label(610, 115, 'BLOWER', 11, { weight: 700 });
    s += `<path d="M590,130 L590,255" fill="none" stroke="${INK}" stroke-width="3"/>` + `<path d="M585,255 L600,255" stroke="${INK}" stroke-width="3"/>`;
    s += arrow(600, 250, 600, 140, { color: INK, width: 2, dash: '5 4' });
    s += lines(610, 60, ['Run the blower for several minutes', 'BEFORE starting: its duct draws air', 'from the BOTTOM of the compartment'], 12, { anchor: 'end' });
    s += lines(95, 60, ['One spark (starter, switch, bilge pump,', 'cigarette) in a vapour-filled bilge', '= explosion'], 12, { anchor: 'start', fill: FUEL, weight: 600 });
    s += label(80, 310, 'Diesel does not form an explosive vapour at normal temperatures', 12, { anchor: 'start', fill: MUTED });
    return S.svg(700, 330, s, { width: 620, label: 'Side section of a boat showing petrol vapour collecting in the bilge and the blower duct' });
  }

  /* ---------- ILL-2 one-third rule (F29) ---------- */
  function illThirds() {
    let s = box(60, 50, 160, 300, { fill: PAPER, stroke: INK, sw: 3, rx: 14 });
    const bands = [['#2A9D8F', '1/3 OUT', 'fuel used to reach your destination'], ['#E9C46A', '1/3 BACK', 'fuel to return home'], ['#E76F51', '1/3 RESERVE', 'never planned to be used: weather,', 'current, detours, mistakes']];
    bands.forEach((b, i) => {
      const y = 50 + i * 100;
      s += `<rect x="63" y="${y + (i === 0 ? 3 : 0)}" width="154" height="${i === 0 ? 97 : i === 2 ? 97 : 100}" fill="${b[0]}" ${i === 0 ? 'rx="11"' : i === 2 ? 'rx="11"' : ''}/>`;
      if (i === 0) s += `<rect x="63" y="${y + 60}" width="154" height="40" fill="${b[0]}"/>`;
      if (i === 2) s += `<rect x="63" y="${y}" width="154" height="40" fill="${b[0]}"/>`;
      s += label(140, y + 50, b[1], 20, { fill: DARK, weight: 800 });
      s += lines(235, y + 42, b.slice(2), 12, { anchor: 'start' });
    });
    // map
    s += box(330, 40, 250, 320, { fill: WATER, op: .12, stroke: LINE });
    s += `<path d="M335,330 L395,330 L395,300 L365,282 L335,300 Z" fill="#8A8F98" stroke="${LINE}"/>` + label(365, 350, 'Home harbour', 12, { weight: 600 });
    s += `<rect x="340" y="318" width="80" height="6" fill="#7a5230"/>`;
    s += `<ellipse cx="520" cy="95" rx="45" ry="28" fill="${LAND}" stroke="${LINE}"/>` + label(520, 95, 'Destination', 11, { fill: DARK, weight: 600 });
    s += `<path d="M400,300 C440,220 420,160 500,120" fill="none" stroke="#2A9D8F" stroke-width="3" stroke-dasharray="7 5"/>` + head(500, 120, -0.5, 10, '#2A9D8F');
    s += `<path d="M545,125 C560,210 500,260 420,318" fill="none" stroke="#C99A2E" stroke-width="3" stroke-dasharray="7 5"/>` + head(420, 318, 2.5, 10, '#C99A2E');
    s += label(410, 200, 'out', 13, { fill: '#2A9D8F', weight: 800 }) + label(540, 230, 'back', 13, { fill: '#C99A2E', weight: 800 });
    // storm cloud
    s += `<path d="M470,160 q10,-18 28,-8 q8,-14 24,-4 q14,-4 16,12 q8,10 -6,14 l-56,0 q-14,-2 -6,-14z" fill="#8A8F98" stroke="${LINE}"/>`;
    s += dline(455, 182, 480, 182, MUTED, 2) + dline(462, 190, 492, 190, MUTED, 2);
    s += lines(455, 205, ['head wind + waves', '= more fuel per mile'], 11, { anchor: 'start', fill: DARK, weight: 600 });
    s += label(300, 385, 'Plan to arrive home with the tank still one-third full.', 14, { weight: 700 });
    return S.svg(600, 400, s, { width: 600, label: 'Fuel tank divided into thirds: out, back and reserve, with a map of the trip' });
  }

  /* ---------- troubleshooting flow (F33, F34) ---------- */
  function illFlow() {
    let s = '';
    s += box(230, 20, 240, 44, { fill: INK, stroke: INK }) + label(350, 42, 'Engine will not start', 15, { fill: PAPER, weight: 800 });
    s += arrow(350, 64, 350, 92, { color: INK });
    s += box(230, 92, 240, 44, { fill: PAPER, stroke: INK, sw: 2 }) + label(350, 114, 'Does the starter turn?', 14, { weight: 700 });
    s += arrow(230, 114, 150, 114, { color: INK }) + label(190, 102, 'NO', 12, { weight: 800, fill: FUEL });
    s += arrow(470, 114, 550, 114, { color: INK }) + label(510, 102, 'YES', 12, { weight: 800, fill: '#2A9D8F' });
    s += box(20, 150, 290, 190, { fill: PAPER, stroke: FUEL, sw: 2 });
    s += label(165, 170, 'Electrical or interlock fault', 14, { weight: 700, fill: FUEL });
    s += lines(34, 196, ['1. Gear lever in NEUTRAL', '2. Kill-cord clip in place', '3. Main battery switch ON', '4. Battery cables tight and clean', '5. Battery charge (12.7 V = full)', '6. Fuse'], 13, { anchor: 'start' }, 22);
    s += box(390, 150, 290, 190, { fill: PAPER, stroke: '#2A9D8F', sw: 2 });
    s += label(535, 170, 'Fuel first, then spark', 14, { weight: 700, fill: '#2A9D8F' });
    s += lines(404, 196, ['6. Fuel reaching the engine? (tank)', '7. Fuel hose intact and tight', '8. Tank VENT open', '9. Primer bulb pumped until firm', 'Then: spark plugs wet or fouled?', '(petrol only; diesel has no plugs)'], 13, { anchor: 'start' }, 22);
    s += arrow(150, 114, 150, 150, { color: INK }) + arrow(550, 114, 550, 150, { color: INK });
    s += label(350, 365, 'The order used by the Norwegian Society for Sea Rescue: neutral, kill cord, main switch, cables, charge, fuel, hose, vent, primer.', 12, { fill: MUTED });
    return S.svg(700, 385, s, { width: 640, label: 'Flow chart for an engine that will not start' });
  }

  /* ---------- propeller: diameter and pitch (F39, F40, F42) ---------- */
  function illProp() {
    let s = '';
    // face-on prop
    const cx = 150, cy = 170, R = 110;
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="6 5"/>`;
    for (let i = 0; i < 3; i++) s += `<ellipse cx="${cx}" cy="${cy}" rx="34" ry="${R * 0.5}" fill="#8A8F98" stroke="${LINE}" transform="rotate(${i * 120} ${cx} ${cy}) translate(0 -${R * 0.5})"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="24" fill="#6b7078" stroke="${LINE}"/>`;
    s += dline(cx - 30, cy, cx + 30, cy, PAPER, 3);
    s += arrow(cx - R, cy + R + 22, cx + R, cy + R + 22, { color: INK, both: true });
    s += label(cx, cy + R + 44, 'DIAMETER (13 in): circle swept by the blade tips', 13, { weight: 700 });
    s += label(cx, 28, 'Marked "13 x 19"  =  diameter x pitch, in inches', 15, { weight: 800 });
    s += leader(cx + 8, cy, cx + 60, 70) + lines(cx + 64, 64, ['Shear pin (small outboards) or rubber hub:', 'breaks or slips if the blades hit a rock', '-> engine revs, boat does not move'], 12, { anchor: 'start' });
    // pitch illustration
    const px = 360, py = 220;
    s += `<rect x="${px}" y="${py + 40}" width="300" height="70" fill="${WATER}" opacity=".14"/>` + dline(px, py + 40, px + 300, py + 40, WATER, 2);
    s += `<path d="M${px + 20},${py + 20} l50,0 l10,20 l-70,0 z" fill="#B0B7C3" stroke="${LINE}"/>`;
    s += `<path d="M${px + 190},${py + 20} l50,0 l10,20 l-70,0 z" fill="#B0B7C3" stroke="${LINE}" opacity=".5"/>`;
    s += arrow(px + 60, py + 60, px + 230, py + 60, { color: INK, width: 2 });
    s += label(px + 145, py + 80, 'PITCH (19 in): theoretical advance in ONE revolution', 12, { weight: 700 });
    s += label(px + 145, py + 97, '(real advance is less because of "slip")', 11, { fill: MUTED });
    s += `<path d="M${px + 300},${py - 70} a12,12 0 1,1 -1,0" fill="none" stroke="${INK}" stroke-width="2"/>` + label(px + 300, py - 40, '1 turn', 11, { fill: MUTED });
    s += lines(px + 10, 318, ['Lower pitch: more thrust, quicker acceleration, higher revs, lower top speed.', 'Higher pitch: higher top speed ONLY if the engine still reaches its rated full-throttle rpm.'], 12, { anchor: 'start' });
    return S.svg(680, 350, s, { width: 640, label: 'Propeller diameter and pitch explained' });
  }

  /* ---------- ILL-3 boat electrical circuit (F44, F45, F47, F48, F49, F50) ---------- */
  function illCircuit(o) {
    o = o || {}; const quiz = !!o.quiz;
    let s = '';
    const R = FUEL, K = INK;
    // batteries
    function battery(x, y, name) {
      let b = box(x, y, 120, 70, { fill: PAPER, stroke: INK, sw: 2 });
      b += `<rect x="${x + 10}" y="${y - 8}" width="18" height="8" fill="${INK}"/><rect x="${x + 92}" y="${y - 8}" width="18" height="8" fill="${R}"/>`;
      b += label(x + 19, y + 18, '-', 20, { weight: 900 }) + label(x + 101, y + 18, '+', 20, { fill: R, weight: 900 });
      b += label(x + 60, y + 45, name, 13, { weight: 700 });
      return b;
    }
    s += battery(60, 120, 'START battery 12 V') + battery(60, 320, 'SERVICE battery 12 V');
    // main switch
    s += `<circle cx="300" cy="230" r="38" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>`;
    s += `<line x1="300" y1="230" x2="300" y2="200" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    s += label(300, 182, 'OFF', 10, { weight: 700 }) + label(258, 230, '1', 10, { weight: 700 }) + label(342, 230, '2', 10, { weight: 700 }) + label(300, 280, 'BOTH', 10, { weight: 700 });
    // + feeds to switch
    s += `<path d="M170,112 L250,112 L250,205 L270,215" fill="none" stroke="${R}" stroke-width="3"/>`;
    s += `<path d="M170,312 L250,312 L250,255 L270,245" fill="none" stroke="${R}" stroke-width="3"/>`;
    // switch -> fuse panel
    s += `<path d="M338,230 L450,230" fill="none" stroke="${R}" stroke-width="3"/>`;
    s += box(450, 130, 80, 200, { fill: PAPER, stroke: INK, sw: 2 });
    for (let i = 0; i < 3; i++) { const y = 160 + i * 50; s += `<rect x="470" y="${y - 8}" width="40" height="16" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>` + dline(462, y, 518, y, INK, 1.5); }
    // loads
    function lamp(x, y) { return `<circle cx="${x}" cy="${y}" r="16" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><path d="M${x - 11},${y - 11} l22,22 M${x + 11},${y - 11} l-22,22" stroke="${INK}" stroke-width="2"/>`; }
    s += `<path d="M530,160 L634,160" stroke="${R}" stroke-width="3"/>` + lamp(650, 160);
    s += `<path d="M530,210 L630,210" stroke="${R}" stroke-width="3"/>` + box(630, 194, 60, 32, { fill: PAPER, stroke: INK, sw: 2 }) + label(660, 210, 'VHF', 11, { weight: 700 });
    s += `<path d="M530,260 L630,260" stroke="${R}" stroke-width="3"/>` + box(630, 244, 60, 32, { fill: PAPER, stroke: INK, sw: 2 }) + label(660, 260, 'plotter', 11, { weight: 700 });
    // bilge pump direct from service battery, own fuse
    s += `<path d="M170,312 L200,312 L200,420 L560,420" fill="none" stroke="${R}" stroke-width="3"/>`;
    s += `<rect x="360" y="412" width="36" height="16" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<circle cx="580" cy="420" r="20" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>` + `<path d="M580,406 a14,14 0 0,1 0,28 M580,420 l10,-8 M580,420 l-10,8 M580,420 l2,-13" stroke="${INK}" stroke-width="2" fill="none"/>`;
    // starter from start battery direct via switch? keep: start battery -> starter via dashed box path
    s += `<path d="M110,112 L110,60 L640,60 L640,100" fill="none" stroke="${R}" stroke-width="3"/>`;
    s += box(610, 100, 60, 32, { fill: '#2B2B2B', stroke: INK, sw: 2 }) + label(640, 116, 'STARTER', 10, { fill: '#fff', weight: 700 });
    s += box(40, 40, 650, 104, { fill: 'none', stroke: MUTED, dash: '6 5', rx: 10 });
    // negative bus
    s += `<path d="M80,190 L80,470 L740,470 L740,480" fill="none" stroke="${K}" stroke-width="3"/>`;
    s += `<path d="M80,390 L80,470" stroke="${K}" stroke-width="3"/>`;
    s += `<path d="M650,176 L650,186 L740,186 L740,470 M660,226 L660,236 L740,236 M660,276 L660,286 L740,286 M580,440 L580,470 M640,132 L640,142 L740,142" fill="none" stroke="${K}" stroke-width="3"/>`;
    // alternator
    s += `<circle cx="380" cy="330" r="22" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>` + label(380, 331, '~', 22, { weight: 800 });
    s += `<path d="M380,308 L380,296 L250,296" fill="none" stroke="${R}" stroke-width="3" stroke-dasharray="5 4"/>`;
    // warning triangle
    s += `<polygon points="30,250 60,250 45,224" fill="${C.yellow}" stroke="${INK}" stroke-width="1.5"/>` + label(45, 243, '!', 14, { fill: DARK, weight: 900 });
    if (quiz) {
      s += badge(300, 130, 'A') + badge(490, 340, 'B') + badge(380, 365, 'C') + badge(580, 450, 'D');
      return S.svg(800, 500, s, { width: 640, label: 'Boat electrical circuit with four components marked A to D' });
    }
    s += label(360, 36, 'Engine START circuit: kept separate so lights and fridge cannot flatten it', 12, { fill: MUTED, weight: 600 });
    s += lines(300, 300, ['MAIN BATTERY SWITCH', 'OFF when leaving the boat;', 'isolates everything'], 11, { weight: 700 }, 13);
    s += lines(490, 345, ['FUSE PANEL: every circuit fused;', 'replace with the SAME rating'], 11, { weight: 700 }, 13);
    s += label(650, 140, 'Navigation lights', 11, { anchor: 'start', weight: 600 }).replace('x="650"', 'x="676"');
    s += label(700, 210, 'VHF / chart plotter', 11, { anchor: 'start', weight: 600 });
    s += lines(600, 455, ['Automatic BILGE PUMP: wired BEFORE the main switch,', 'with its own fuse, so it works when you are away'], 11, { anchor: 'start', weight: 600 }, 13);
    s += label(378, 372, 'Alternator / charger: charges both banks', 11, { weight: 600 });
    s += lines(250, 490, ['Negative (-) return bus: common ground'], 11, { weight: 600 });
    s += lines(20, 275, ['Vented battery box:', 'hydrogen when charging;', 'no sparks, no smoking'], 10, { anchor: 'start', weight: 600 }, 12);
    s += lines(20, 440, ['Disconnect - first,', 'reconnect - last'], 10, { anchor: 'start', weight: 600 }, 12);
    return S.svg(800, 500, s, { width: 640, label: 'Schematic of a two-battery boat electrical system with main switch and fuses' });
  }

  /* ---------- transom with builder's plate and WIN (sdir.no CE page) ---------- */
  function illTransom() {
    let s = `<rect x="0" y="250" width="640" height="70" fill="${WATER}" opacity=".14"/>` + dline(0, 250, 640, 250, WATER, 3);
    s += `<path d="M90,70 L550,70 L520,250 L120,250 Z" fill="#B0B7C3" stroke="${LINE}" stroke-width="2"/>`;
    s += `<path d="M120,250 Q320,290 520,250" fill="#8A8F98" stroke="${LINE}" stroke-width="1.5"/>`;
    s += label(320, 56, 'Looking at the transom from astern', 14, { weight: 700 });
    s += label(150, 300, 'STARBOARD side', 13, { weight: 800, fill: C.green }) + label(150, 316, '(on your LEFT in this view)', 11, { fill: MUTED });
    s += label(490, 300, 'PORT side', 13, { weight: 800, fill: C.red }) + label(490, 316, '(on your RIGHT in this view)', 11, { fill: MUTED });
    // WIN plate on starboard side of transom
    s += box(140, 196, 180, 30, { fill: PAPER, stroke: INK, sw: 1.5, rx: 3 });
    s += label(230, 211, 'NO-HXAB7A33G708', 15, { weight: 800, family: 'monospace' });
    s += lines(230, 160, ['WIN / CIN (hull identification number)', 'permanently marked OUTSIDE the hull,', 'on the STARBOARD side of the transom'], 12, { weight: 600, fill: DARK });
    // builder's plate
    s += box(360, 90, 160, 110, { fill: '#e9ecef', stroke: INK, sw: 1.5, rx: 4 });
    s += label(440, 104, 'BUILDER\'S PLATE', 11, { fill: DARK, weight: 800 });
    s += lines(368, 120, ['Manufacturer: Example Boats AS', 'Max load incl. outboard: 650 kg', 'Max persons: 6', 'Design category: C'], 10, { anchor: 'start', fill: DARK }, 14);
    s += label(500, 184, 'CE', 16, { fill: DARK, weight: 900 });
    // outboard silhouette hint in centre? no: keep clear
    s += lines(320, 340, ['Code segments: NO = country | HXA = manufacturer | B7A33 = serial number | G 7 = production month and year | 08 = model year'], 11, { fill: MUTED });
    return S.svg(640, 355, s, { width: 640, label: 'Transom seen from astern with the builder plate and the hull identification number on the starboard side' });
  }

  /* ---------- ILL-4 toilet-waste discharge zones (F63, F64) ---------- */
  function illSewage() {
    let s = `<rect x="0" y="0" width="800" height="500" fill="${WATER}" opacity=".10" rx="8"/>`;
    // left: coast with 300 m band
    s += `<path d="M0,0 L170,0 Q150,80 190,140 Q230,200 170,260 Q120,330 180,400 Q210,460 170,500 L0,500 Z" fill="${LAND}" stroke="${LINE}"/>`;
    s += `<path d="M0,0 L170,0 Q150,80 190,140 Q230,200 170,260 Q120,330 180,400 Q210,460 170,500 L0,500 Z" fill="none" stroke="${FUEL}" stroke-width="2" stroke-dasharray="8 6" transform="translate(70 0)"/>`;
    s += `<path d="M170,0 Q150,80 190,140 Q230,200 170,260 Q120,330 180,400 Q210,460 170,500 L240,500 Q280,460 250,400 Q190,330 240,260 Q300,200 260,140 Q220,80 240,0 Z" fill="#F7D4D4" opacity=".7"/>`;
    s += `<ellipse cx="330" cy="330" rx="34" ry="24" fill="${LAND}" stroke="${LINE}"/>`;
    s += `<ellipse cx="330" cy="330" rx="74" ry="64" fill="#F7D4D4" opacity=".7"/>` + `<ellipse cx="330" cy="330" rx="74" ry="64" fill="none" stroke="${FUEL}" stroke-width="2" stroke-dasharray="8 6"/>`;
    s += `<ellipse cx="330" cy="330" rx="34" ry="24" fill="${LAND}" stroke="${LINE}"/>` + label(330, 330, 'island', 11, { fill: DARK });
    s += arrow(230, 60, 300, 60, { color: FUEL, width: 2, both: true }) + label(265, 44, '300 m', 13, { fill: FUEL, weight: 800 });
    s += label(60, 250, 'MAINLAND', 14, { fill: DARK, weight: 800 });
    s += lines(300, 110, ['Red band: NO discharge of toilet waste', 'within 300 m of mainland or islands', '(national rule, FOR-2012-05-30-488 s. 10)'], 12, { anchor: 'start', weight: 600 });
    s += lines(300, 420, ['Outside the dashed line: discharge allowed', 'under the national rule, but NOT at all', 'in the Oslofjord region, and never in rivers', 'or lakes; check local municipal bans'], 12, { anchor: 'start' });
    // right: Oslofjord inset (schematic)
    s += box(520, 20, 265, 460, { fill: PAPER, stroke: LINE });
    s += label(652, 40, 'OSLOFJORD BAN AREA (schematic)', 12, { weight: 800 });
    // land shape of SE Norway with fjord cut
    s += `<path d="M525,60 L780,60 L780,150 L740,190 Q710,170 700,120 Q690,220 650,240 Q640,120 630,110 Q625,200 590,250 Q560,280 530,300 Z" fill="${LAND}" stroke="${LINE}"/>`;
    s += `<path d="M525,300 Q560,280 590,250 Q625,200 630,110 Q640,120 650,240 Q690,220 700,120 Q710,170 740,190 L780,150 L780,470 L525,470 Z" fill="#E76F51" opacity=".6"/>`;
    s += label(770, 200, 'Swedish', 10, { fill: DARK, weight: 700, anchor: 'end' }) + label(770, 212, 'border', 10, { fill: DARK, weight: 700, anchor: 'end' });
    s += label(640, 95, 'Oslo', 11, { fill: DARK, weight: 700 });
    s += dline(527, 300, 560, 330, INK, 2, '4 3') + lines(545, 350, ['Agder', 'county', 'border'], 10, { fill: DARK, weight: 700, anchor: 'start' }, 11);
    s += lines(652, 405, ['ZERO discharge of toilet waste from', 'recreational boats since 1 July 2024:', 'all side fjords and the inner Oslofjord', 'included (FOR-2024-05-31-886)'], 11, { fill: DARK, weight: 600 }, 13);
    // pump-out icon
    s += box(540, 395, 40, 26, { fill: PAPER, stroke: INK, rx: 4 }) + `<path d="M580,408 q20,0 20,20" fill="none" stroke="${INK}" stroke-width="3"/>`;
    s += lines(560, 440, ['Use pump-out', 'stations'], 10, { weight: 700 }, 12);
    return S.svg(800, 500, s, { width: 640, label: 'Map diagram of the 300 m toilet-waste rule and the Oslofjord total ban area' });
  }

  /* ---------- ILL-5 bathing-area speed rule (F72) ---------- */
  function illBathing(o) {
    o = o || {}; const quiz = !!o.quiz;
    let s = `<rect x="0" y="0" width="700" height="400" fill="${WATER}" opacity=".14" rx="8"/>`;
    s += `<path d="M0,400 L0,250 Q120,230 210,300 Q260,350 280,400 Z" fill="${SAND}" stroke="${LINE}"/>` + label(70, 350, 'beach', 13, { fill: DARK, weight: 700 });
    // swimmers
    [[200, 250], [230, 275], [265, 300]].forEach(p => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#c97b4a" stroke="${LINE}"/><path d="M${p[0] - 12},${p[1] + 8} q12,-6 24,0" fill="none" stroke="#c97b4a" stroke-width="3"/>`; });
    s += `<circle cx="232" cy="275" r="150" fill="none" stroke="${FUEL}" stroke-width="2.5" stroke-dasharray="9 6"/>`;
    s += dline(232, 275, 382, 275, FUEL, 2) + label(307, 262, '50 m', 14, { fill: FUEL, weight: 800 });
    s += label(300, 330, quiz ? '?' : 'max 5 knots', 18, { fill: FUEL, weight: 900 });
    // buoy line bounding a bathing area
    const buoys = [[330, 395], [360, 350], [380, 300], [385, 250], [370, 200], [340, 160], [300, 130], [250, 115], [200, 110], [150, 120], [100, 135], [50, 160], [10, 190]];
    s += `<path d="M0,250 L0,190 ${buoys.slice().reverse().map(b => `L${b[0]},${b[1]}`).join(' ')} L330,400 L280,400 Q260,350 210,300 Q120,230 0,250 Z" fill="#F7D4D4" opacity=".55"/>`;
    buoys.forEach(b => { s += `<circle cx="${b[0]}" cy="${b[1]}" r="6" fill="${C.yellow}" stroke="${INK}" stroke-width="1.5"/>`; });
    if (!quiz) s += lines(170, 170, ['inside the buoys: no motor or', 'sailing vessels, no anchoring'], 12, { fill: DARK, weight: 700 });
    // motorboat outside circle
    s += `<g transform="rotate(-20 560 230)"><path d="M520,215 L585,215 L600,230 L585,245 L520,245 Z" fill="#D9DEE3" stroke="#2b3440" stroke-width="2"/><rect x="512" y="222" width="10" height="16" fill="#2b3440"/></g>`;
    s += arrow(540, 200, 430, 255, { color: INK, width: 2, dash: '6 4' });
    if (!quiz) s += lines(560, 300, ['slow to 5 knots BEFORE you are', 'within 50 m of the bathers'], 12, { weight: 700 });
    s += label(560, 370, 'Rule applies wherever bathing is in progress, marked beach or not', 11, { fill: MUTED });
    return S.svg(700, 400, s, { width: 640, label: 'Top view of a beach with swimmers, a 50 m circle, bathing-area buoys and an approaching motorboat' });
  }

  /* ---------- ILL-6 sea-bird reserve closure (F75) ---------- */
  function illBirds(o) {
    o = o || {}; const quiz = !!o.quiz;
    let s = `<rect x="0" y="0" width="700" height="400" fill="${WATER}" opacity=".14" rx="8"/>`;
    s += `<ellipse cx="260" cy="170" rx="190" ry="130" fill="#F7D4D4" opacity=".7"/>`;
    s += `<ellipse cx="260" cy="170" rx="190" ry="130" fill="none" stroke="${FUEL}" stroke-width="2.5" stroke-dasharray="9 6"/>`;
    s += `<path d="M150,120 Q200,60 290,80 Q380,100 370,170 Q350,240 260,250 Q160,240 150,120 Z" fill="${LAND}" stroke="${LINE}"/>`;
    // birds
    [[230, 120], [290, 150], [250, 190]].forEach(p => { s += `<path d="M${p[0] - 14},${p[1]} q7,-10 14,0 q7,-10 14,0" fill="none" stroke="${INK}" stroke-width="2.5"/>`; });
    s += dline(380, 170, 450, 170, FUEL, 2) + label(415, 156, '50 m', 14, { fill: FUEL, weight: 800 });
    if (!quiz) s += lines(260, 300, ['No landing; no boats, kayaks, paddleboards', 'or divers within 50 m of the shore'], 12, { fill: DARK, weight: 700 });
    s += label(260, 32, 'SEA-BIRD RESERVE', 15, { weight: 800 });
    // calendar
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m, i) => {
      const x = 20 + i * 55;
      s += box(x, 340, 52, 36, { fill: PAPER, stroke: LINE, rx: 4 });
      if (i === 3) s += `<rect x="${x + 26}" y="340" width="26" height="36" rx="4" fill="${FUEL}" opacity=".75"/>`;
      if (i === 4 || i === 5) s += `<rect x="${x}" y="340" width="52" height="36" rx="4" fill="${FUEL}" opacity=".75"/>`;
      if (i === 6) s += `<rect x="${x}" y="340" width="26" height="36" rx="4" fill="${FUEL}" opacity=".75"/>`;
      s += label(x + 26, 358, m, 12, { weight: 700, fill: (i >= 4 && i <= 5) ? '#fff' : INK });
    });
    s += label(350, 390, quiz ? 'CLOSED: red period' : 'CLOSED 15 April - 15 July (Faerder and Ytre Hvaler national parks; check local dates elsewhere)', 12, { fill: FUEL, weight: 800 });
    // kayak outside belt
    s += `<g transform="rotate(30 560 120)"><path d="M520,120 Q560,105 600,120 Q560,135 520,120 Z" fill="${C.orange}" stroke="${INK}"/></g>` + label(560, 160, 'stay outside the belt', 11, { fill: MUTED });
    return S.svg(700, 400, s, { width: 640, label: 'Island bird reserve with a 50 m no-go belt and a calendar showing the closure period' });
  }

  /* =====================================================================
     TOPIC
     ===================================================================== */
  BOAT.register({
    id: 'engine-and-environment',
    title: 'Engine, fuel and the environment',
    order: 10,
    examShare: 4,
    examWeight: 'about 3–5 of 50 questions',
    summary: 'How your engine, fuel, cooling and electrical systems work and how to keep them working; why petrol vapour, hydrogen and LPG are dangerous on board; how to plan fuel and troubleshoot an engine that will not start; the CE paperwork every boat carries; and the environmental rules for oil, garbage, toilet waste, noise, wash, bird reserves, national parks and the right to roam. A handful of items here (coast radio 120 and VHF 16, the alcohol limit and the flotation rule) belong to the "particularly important" part 4 of the exam.',
    sections: [
      /* ---------------- 1 ---------------- */
      {
        id: 'intro',
        title: 'What this topic is and how the exam tests it',
        html: `
<p>A boat is only as safe as its engine, and a boater is only welcome on the water if the water stays clean. This topic sits in <strong>part 1, Seamanship</strong>, of the official curriculum: fire risk from petrol vapour and LPG (item 1.1 b), good maintenance of boat, engine, fuel system, cooling system and lubricating oil (1.1 i), environmental considerations such as discharges, reserves, national parks, littering and noise (1.1 k), and liability and insurance (1.1 l). From <strong>part 2, Laws and regulations</strong>, it adds the CE rules for recreational craft: the CE mark, the builder's plate, the hull identification number (CIN, today called WIN) and the owner's manual, plus the Outdoor Recreation Act and the speed rules near bathers.</p>
<p>The exam asks short recognition questions: "What does the water stream on the side of an outboard tell you?", "The engine will not start, what do you check first?", "Why is petrol vapour dangerous?", "How close to land may you discharge toilet waste?", "May you land on a bird reserve in June?", "What do you do with old oil?". Expect roughly three to five questions from this topic.</p>
<div class="callout warn"><p><strong>Part 4 crossover.</strong> Three facts that appear in these scenarios are <strong>part-4 "particularly important" items</strong>, where more than two errors fails the whole exam: the coast radio telephone number <strong>120</strong> and <strong>VHF channel 16</strong> (item 1.4.6), the alcohol limit of <strong>0.8 per mille</strong> for boats under 15 m, and the duty to <strong>wear flotation in boats under 8 m</strong> under way (item 1.4.5). They are repeated here because engine trouble is exactly when you need them.</p></div>
<p>Work through the sections in order. The first half is technical (engine types, cooling, fuel, starting, propeller, electrics); the second half is paperwork and environment. Every "Remember" box contains the exact numbers the exam uses.</p>`,
        keyFacts: [
          'Part 1 items 1.1 b, i, k, l; part 2 item h (CE marking, builder\'s plate, CIN/WIN, owner\'s manual).',
          'Expect about 3–5 of the 50 questions from this topic (estimate; the split is not published).',
          'Part-4 items that appear here: coast radio 120 / VHF 16 (1.4.6); 0.8 per mille and flotation under 8 m (1.4.5).',
        ],
        check: { q: 'Your engine has died and you are drifting towards rocks. Which number reaches the coast radio service by telephone?', options: ['110', '113', '120', '02800'], answer: 2, explanation: 'The coast radio service answers on telephone 120 and keeps watch on VHF channel 16; this is part-4 item 1.4.6. 110 is the fire service (also used to report acute pollution), 113 is the ambulance (F38, F62).' },
      },
      /* ---------------- 2 ---------------- */
      {
        id: 'engine-types',
        title: 'Engine types: outboard, inboard, sterndrive, waterjet; two-stroke, four-stroke, diesel',
        html: `
<p>You must recognise four ways of pushing a boat, because each steers differently. An <strong>outboard</strong> is a complete unit (engine, gearbox and propeller) clamped to the transom. It steers by pivoting the whole unit so the <em>thrust</em> changes direction: it still steers at very low speed under power, but has almost no steering when the propeller is not turning. An <strong>inboard</strong> sits inside the hull and drives a fixed propeller through a shaft; a separate <strong>rudder</strong> steers, so the boat needs water flowing over the rudder (speed or prop wash) and steers poorly going astern. A <strong>sterndrive</strong> (inboard/outboard, Z-drive) has the engine inside, just forward of the transom, and a pivoting drive leg outside: it steers like an outboard, needs no rudder, and the leg can be trimmed and tilted. A <strong>waterjet</strong> sucks water in under the hull and pushes it out through a steerable nozzle: no exposed propeller (safer for swimmers), runs in very shallow water, reverses with a deflector bucket, but gives little steering with the throttle closed.</p>
<p>Next, how the engine is lubricated. A <strong>two-stroke</strong> petrol engine burns its oil with the fuel: oil is pre-mixed in the tank or injected from a separate oil tank, which is why two-strokes smoke and emit more unburned hydrocarbons. The ratio is set by the manufacturer and varies widely between engines, so the only safe answer is <em>the ratio in the owner's manual</em>, using outboard oil to the TC-W3 specification. Too little oil seizes the engine; too much fouls the spark plugs. A <strong>four-stroke</strong> keeps oil in a sump like a car: check it with the dipstick before starting (engine level, after a few minutes' rest) and change it at the recommended interval. Four-strokes are quieter, cleaner and use less fuel.</p>
<p>Finally, <strong>petrol versus diesel</strong>. Petrol needs a spark from a spark plug, so "no spark" is a petrol-only fault. A <strong>diesel</strong> ignites its fuel by compression heat alone and has <em>no spark plugs</em>, so diesel faults are almost always fuel-related: air in the fuel system, dirty filters or water in the fuel.</p>
<div class="callout tip"><p><strong>Exam trap:</strong> "The diesel will not start; check the spark plugs." A diesel has none. Think air in the fuel lines (bleed the system), blocked filter, or water and "diesel bug".</p></div>`,
        keyFacts: [
          'Outboard and sterndrive steer by turning the thrust: little steering when the prop is not turning. Inboard steers with a rudder: needs water flow.',
          'Waterjet: no exposed propeller, very shallow draught, poor steering with the throttle closed.',
          'Two-stroke: oil mixed into the petrol (ratio from the manual, TC-W3 oil). Four-stroke: sump oil, dipstick.',
          'Diesel has no spark plugs; its faults are fuel-related (air, filters, water).',
        ],
        check: { q: 'Which engine type burns lubricating oil mixed into the petrol?', options: ['Four-stroke outboard', 'Two-stroke outboard', 'Diesel inboard', 'Electric outboard'], answer: 1, explanation: 'Two-strokes use total-loss lubrication: the oil is pre-mixed in the tank or injected and burns with the fuel. Four-strokes keep their oil in a sump and never mix it into the fuel (F5, F7).' },
      },
      /* ---------------- 3 ---------------- */
      {
        id: 'cooling',
        title: 'The outboard, its cooling system and the telltale',
        html: `
<p>Almost all outboards and most inboards are <strong>raw-water cooled</strong>: a pump with a flexible rubber <strong>impeller</strong> in the lower unit draws seawater in through an <strong>intake grille</strong> on the gearcase, pushes it up the leg and round the hot engine, and discharges it overboard. The impeller wears out, so the Norwegian Maritime Authority says to carry a <strong>spare impeller kit</strong> on board and to service fuel filters, oil filter and impeller every year.</p>
<p>The engine tells you the pump is working through the <strong>telltale</strong> ("pee stream"): a thin stream of water from a small hole on the side of the leg, above the waterline, as soon as the engine runs. <strong>A steady stream means the cooling pump is working.</strong> A weak, intermittent or missing stream means stop and investigate: a blocked telltale hole (poke it with a thin wire), a blocked intake (weed, a plastic bag, mud, or the engine tilted so high that the intake is out of the water), or a failed impeller.</p>
<div class="callout warn"><p><strong>Never run an outboard out of the water</strong> without a flushing attachment or a test tank. The rubber impeller runs dry and shreds within seconds, and the engine has no cooling. Running the engine "just for a moment" on the trailer destroys the impeller.</p></div>
<p>If the engine <strong>overheats</strong> (alarm, steam, no telltale): go to idle and stop, tilt the engine and clear the intake, check the telltale hole, let it cool, and do not restart under load until water flows. A hot engine destroys its head gasket or seizes. Other overheating causes are a stuck thermostat and salt deposits in the passages, so flush the cooling system with fresh water after every trip in salt water.</p>
<p>At lay-up: flush, drain all cooling water (store the engine upright) because trapped water freezes and cracks the block, run stabilised fuel or drain the carburettor, fog the cylinders, change the engine oil on a four-stroke and the <strong>gear oil</strong> in the lower unit. <strong>Milky gear oil means water has got in</strong> past the seals; it will freeze and crack the housing if left.</p>`,
        illustration: () => illOutboard(),
        caption: 'An outboard seen from the port side. Blue dashes: cooling water from the impeller up to the powerhead and out through the telltale. The intake and impeller sit below the waterline, the telltale above it; the anti-ventilation plate runs at the surface.',
        keyFacts: [
          'Steady telltale stream = cooling pump working. No stream = stop and investigate at once.',
          'Overheating causes: blocked intake (weed, plastic, engine tilted too high), worn impeller, stuck thermostat, salt deposits.',
          'Never run an outboard out of the water: the impeller shreds within seconds.',
          'Annual service (Maritime Authority): fuel filters, oil filter, impeller. Carry a spare impeller kit.',
          'Flush with fresh water after salt water; milky gear oil = water inside; store upright so water drains.',
        ],
        check: { q: 'You start the outboard at the pontoon and see no stream of water from the small hole on the leg. What do you do?', options: ['Give it a minute at higher revs so the pump primes itself', 'Stop the engine at once and check the telltale hole, the intake and the impeller', 'Continue; the stream only appears above 10 knots', 'Add cooling water through the cowling'], answer: 1, explanation: 'No telltale means no proof of cooling water. Stop immediately, clear the telltale hole and the intake, and if there is still no stream the impeller has failed. Running a hot engine destroys it (F13, F15).' },
      },
      /* ---------------- 4 ---------------- */
      {
        id: 'fuel-system',
        title: 'Fuel system and the danger of petrol vapour',
        html: `
<p>A portable outboard fuel system has four parts you must know: the <strong>tank with a vent screw</strong>, the <strong>fuel line with a primer bulb</strong>, a <strong>fuel filter or water separator</strong>, and the engine's own pump. The vent must be <strong>open when running</strong> and closed only for transport: with a closed vent the engine sucks a vacuum in the tank, starves and stops after a few minutes. Before a cold start, <strong>squeeze the primer bulb until it is firm</strong>; if it never goes firm, the tank is empty, the vent is closed or the hose leaks. The hose must be intact and tight along its whole length: a leak both starves the engine and creates an explosion risk. Carry a <strong>spare fuel filter</strong>: rough seas stir up water and dirt from the bottom of the tank and clog it.</p>
<p>Now the reason fire is item 1.1 b of the curriculum. <strong>Petrol vapour is about 2.8 times heavier than air.</strong> It does not rise and escape; it sinks into the bilge and the engine compartment and collects there until a spark (starter, switch, bilge pump, cigarette) sets off an explosion. Diesel does not form an explosive vapour at normal temperatures, which is why diesel is the safer inboard fuel.</p>
<div class="callout rule"><p><strong>Refuelling rules (Maritime Authority):</strong> stop the engine; no smoking or open flame; with an inboard engine fill from outboard or over the deck; fill portable tanks ashore; close hatches so vapour cannot enter the cabin; wipe up spills; ventilate before starting.</p></div>
<p>Before starting an <strong>inboard petrol engine</strong>, run the engine-compartment <strong>blower</strong> for several minutes and sniff the compartment. Because the vapour lies at the bottom, the blower duct must draw from the lowest point. Boats with an inboard petrol engine should always have a fixed engine-room extinguishing system; above <strong>120 kW</strong> the CE standard ISO 9094 requires one. <strong>LPG</strong> (propane/butane for the galley) is also heavier than air and collects in the bilge: fit a gas alarm, a shut-off valve for each appliance, have it installed professionally and check hoses regularly.</p>
<p>If you smell petrol at the fuel dock: do not start the engine and do not switch anything electrical on or off. Stop refuelling, put out flames, get people off, open hatches, run the blower, find and fix the leak, and start only when the compartment is sniff-clean.</p>`,
        illustration: () => illVapour(),
        caption: 'Petrol vapour is about 2.8 times heavier than air and pools in the bilge. The blower draws from the bottom of the compartment; run it for several minutes before starting an inboard petrol engine.',
        keyFacts: [
          'Tank vent OPEN when running (closed vent: engine starves after a few minutes). Primer bulb firm before a cold start.',
          'Petrol vapour: about 2.8 x heavier than air, sinks into the bilge. Diesel: no explosive vapour at normal temperatures.',
          'Inboard petrol: run the blower for several minutes and sniff BEFORE starting; fixed extinguisher required above 120 kW (ISO 9094).',
          'Refuel: engine off, no flames, fill from outboard/over deck, portable tanks ashore, hatches closed, wipe spills, ventilate.',
          'LPG is heavier than air too: gas alarm, shut-off valve per appliance, professional installation.',
        ],
        check: { q: 'Why is petrol vapour so dangerous on board?', options: ['It rises quickly and poisons people in the cockpit', 'It is about 2.8 times heavier than air and collects in the bilge where a spark can ignite it', 'It dissolves in bilge water and corrodes the hull', 'It only ignites at very high temperatures, so leaks go unnoticed'], answer: 1, explanation: 'The Maritime Authority\'s fire-prevention guidance: petrol vapour is about 2.8 times heavier than air, so it sinks to the lowest point and waits for a spark. Ventilate from the bottom before starting (F11, F27).' },
      },
      /* ---------------- 5 ---------------- */
      {
        id: 'fuel-planning',
        title: 'Fuel planning: the one-third rule',
        html: `
<p>Running out of fuel is the most common reason the rescue service tows a recreational boat home, and the cure is arithmetic. Fuel gauges on small boats are unreliable, so plan from <strong>consumption</strong>: know how many litres per hour your engine burns at cruising revs, then <strong>range = usable litres divided by litres per hour, multiplied by speed</strong>. Then apply the <strong>one-third rule</strong>:</p>
<div class="callout rule"><p><strong>One third of the fuel to get out, one third to get back, one third kept in reserve</strong> for weather, current, detours and mistakes. The reserve third is never part of the plan.</p></div>
<p>Worked example: your 60-litre tank is full and the engine burns 10 litres per hour at 20 knots. In flat water the tank lasts 6 hours, which is 120 nautical miles. Under the rule of thirds you may plan about <strong>40 nautical miles out and 40 back</strong>, arriving home with 20 litres still in the tank. If you then meet a head wind and waves, consumption per mile rises sharply, so shorten the plan or slow down to an economical speed.</p>
<p>The rule is standard seamanship teaching, not a Norwegian legal requirement, but it is how the exam expects you to answer any fuel-planning question. Common wrong answers: "fill the tank to one third", "the reserve is for the trip home", "use one third throttle". None of those is the rule.</p>
<p>Two practical additions from the Maritime Authority's equipment list: carry a <strong>spare can of fuel</strong>, because petrol can be hard to find along the coast, and a spare fuel filter. And remember that a petrol can belongs in a ventilated locker or on deck, never in the cabin.</p>`,
        illustration: () => illThirds(),
        caption: 'The tank in thirds: green to get there, amber to get home, red untouched. Head wind and waves on the way back increase fuel per mile.',
        keyFacts: [
          'One third out, one third back, one third reserve (never planned to be used).',
          'Range = usable litres / litres per hour x speed; then apply the thirds.',
          '60 l at 10 l/h and 20 knots = 6 h = 120 nm in flat water; plan at most about 40 nm out.',
          'Head wind and waves raise consumption per mile sharply; gauges on small boats are unreliable.',
        ],
        check: { q: 'What does the one-third rule for fuel mean?', options: ['Fill the tank to one third before each trip', 'One third of the fuel out, one third back, one third kept in reserve', 'Use no more than one third of full throttle', 'Refuel when the gauge shows one third'], answer: 1, explanation: 'Out, back, reserve. The reserve third covers weather, current, detours and mistakes and is never part of the planned trip (F29).' },
      },
      /* ---------------- 6 ---------------- */
      {
        id: 'starting',
        title: 'Pre-start checks, the kill cord and the engine that will not start',
        html: `
<p>Before every trip run a <strong>pre-start checklist</strong>: fuel (thirds rule) and vent open; engine oil (four-stroke) or oil tank and mix (two-stroke); cooling intake clear and telltale once started; battery charged and main switch on; bilge dry, bilge pump working, drain plug in; gear lever in <strong>neutral</strong>; kill cord clipped on; blower run (inboard petrol); lifejackets on; weather checked. The gear lever has an <strong>interlock</strong>: the engine can only be started in neutral.</p>
<p>The <strong>kill cord</strong> (engine cut-off lanyard) clips to the driver and stops the engine if the driver leaves the helm or falls overboard, so the boat does not circle back at full speed or run away empty. Norway has <strong>no general legal duty</strong> to wear it: a 2020 proposal for a duty above 15 knots was never adopted; what became law from that proposal was the <strong>high-speed certificate</strong> for boats capable of 50 knots or more (from 1 June 2023, minimum age 18). The Maritime Authority still calls the kill cord important and the syllabus lists it as equipment you must know how to use. Attach it round your leg, never extend it, test it every trip by pulling it with the engine running, and carry a <strong>spare</strong> so the boat can be restarted if driver and cord go overboard together. Remember: in a boat under 8 m everyone must <strong>wear flotation</strong> under way, and leaning over the stern to work on an outboard is a classic man-overboard moment.</p>
<p>If the engine will not start, work in the order the Norwegian Society for Sea Rescue teaches: <strong>neutral, kill-cord clip, main switch, battery cables, battery charge (12.7 V when full), fuel reaching the engine, hose intact, vent open, primer pumped</strong>. The split is simple: <em>starter does not turn</em> = electrical or interlock; <em>starter turns but the engine does not fire</em> = fuel first, then spark (wet or fouled plugs). A flooded petrol engine (too much choke, smell of petrol, wet plugs) clears if you wait a few minutes, push the choke in, open the throttle fully and crank, or dry the plugs.</p>
<p>If the engine <strong>stops while running</strong>, think in order: fuel starvation (empty tank, vent, kinked hose, clogged filter, water), overheating (alarm, no telltale), a <strong>rope or weed round the propeller</strong>, or an electrical fault (kill cord pulled, loose lead). For a rope: stop, take the key out and the kill cord off so nobody can start it, tilt the engine and cut the rope; never let anyone near a propeller that can be started. If the engine cannot be restarted and you are drifting towards danger, <strong>anchor at once</strong>, put lifejackets on, and call early: the coast radio on <strong>VHF channel 16</strong> or telephone <strong>120</strong>; in a life-threatening emergency send a distress call on VHF 16 (DSC) or ring 112. The Sea Rescue Society tows its members.</p>`,
        illustration: () => illFlow(),
        caption: 'Starter does not turn: electrical or interlock. Starter turns but no firing: fuel first, then spark. The numbered checks follow the Sea Rescue Society\'s list.',
        keyFacts: [
          'Nine checks in order: neutral, kill cord, main switch, cables, charge (12.7 V), fuel, hose, vent, primer.',
          'Starter does not turn = electrical/interlock. Starter turns, no firing = fuel, then spark.',
          'Kill cord: strongly recommended, not a legal duty; carry a spare. High-speed certificate: 50 knots or more, from 1 June 2023, age 18.',
          'Rope round the prop: stop, key out, kill cord off, tilt, cut. Cannot restart and drifting: anchor, lifejackets, call VHF 16 / 120.',
          'Under 8 m everyone wears flotation under way (part 4). Spares: impeller kit, fuel filter, plugs, fuses, shear pin, spare kill cord, spare battery or jump pack.',
        ],
        check: { q: 'You turn the key and nothing happens: the starter does not turn. Which check is the sensible first step?', options: ['Remove and dry the spark plugs', 'Change the fuel filter', 'Check that the gear lever is in neutral and the kill-cord clip is in place', 'Squeeze the primer bulb until firm'], answer: 2, explanation: 'A starter that does not turn is an electrical or interlock problem. The engine can only be started in neutral and with the kill-cord clip in place; then check main switch, cables and battery. Fuel and plugs matter only once the starter turns (F32, F33, F34).' },
      },
      /* ---------------- 7 ---------------- */
      {
        id: 'propeller',
        title: 'The propeller: diameter, pitch, damage and spares',
        html: `
<p>A propeller is described by two numbers in inches, <strong>diameter x pitch</strong>, for example "13 x 19". <strong>Diameter</strong> is the circle swept by the blade tips. <strong>Pitch</strong> is the theoretical distance the propeller would move forward in one revolution through a solid medium; the real advance is less because of <em>slip</em>.</p>
<p>Pitch is the tuning knob. A <strong>lower pitch</strong> gives more thrust and quicker acceleration at higher revs but a lower top speed (good for heavy loads and towing). A <strong>higher pitch</strong> gives a higher top speed, but only if the engine can still reach its rated full-throttle rpm range; too much pitch makes the engine labour below its rated revs, which costs speed and shortens its life. The right propeller lets the engine reach the manufacturer's full-throttle rpm range with a normal load.</p>
<p>Two effects you must be able to name. <strong>Cavitation</strong> is vapour bubbles forming and collapsing on the blade at very low pressure: noise, vibration and eroded blades. <strong>Ventilation</strong> is air sucked down from the surface when the propeller runs too shallow or in a tight turn: the engine over-revs and loses thrust. Trim the engine down or slow the turn.</p>
<p>Small outboards protect the gearbox with a <strong>shear pin</strong> that breaks if the blades hit a rock; the engine then revs freely but the boat does not move. Larger outboards use a rubber hub that slips instead. A bent, chipped or unbalanced propeller vibrates, loses speed, burns more fuel and can wreck gearbox seals and bearings. Inspect the propeller after any grounding and carry a <strong>spare propeller with nut, washer and shear pin or cotter pin</strong>, plus the tools to change it.</p>
<div class="callout warn"><p>Never let anyone swim near the stern with the engine running, and never put hands near the propeller unless the key is out and the kill cord is off.</p></div>`,
        illustration: () => illProp(),
        caption: '"13 x 19": a 13-inch diameter and a 19-inch pitch. Pitch is the theoretical forward travel in one revolution.',
        keyFacts: [
          'Diameter x pitch in inches: 13 x 19 = 13 in diameter, 19 in pitch.',
          'Lower pitch: more thrust, higher revs, lower top speed. Higher pitch: higher top speed only if the engine reaches its rated rpm.',
          'Cavitation = vapour bubbles on the blade (noise, erosion). Ventilation = air from the surface (over-rev, lost thrust).',
          'Shear pin broken: engine revs, boat does not move. Carry a spare prop, pins, nut and tools.',
        ],
        check: { q: 'After touching a rock the engine revs freely but the boat barely moves. Most likely cause?', options: ['Water in the fuel', 'A broken shear pin or slipping rubber hub in the propeller', 'A closed tank vent', 'A failed impeller'], answer: 1, explanation: 'The shear pin (or rubber hub on larger engines) is designed to give way when the blades hit something, so the gearbox survives: the engine turns but the propeller does not. Fit the spare pin (F42).' },
      },
      /* ---------------- 8 ---------------- */
      {
        id: 'electrics',
        title: 'Batteries and the electrical system',
        html: `
<p>Boat batteries are normally <strong>12 V lead-acid</strong> (six cells of about 2.1 V). A fully charged battery at rest shows about <strong>12.7 V</strong>; at around 12.0 V it is roughly half discharged and may not turn the starter. Starting batteries are not built for deep discharge, which is the argument for <strong>two banks</strong>: a <strong>start battery</strong> reserved for the engine and a <strong>service battery</strong> for lights, plotter, pumps and fridge, so that a night with the fridge on never stops you starting the engine. The main switch selects OFF / 1 / 2 / BOTH, and the alternator or shore charger charges both banks.</p>
<p>Three safety facts. First, a charging (and especially overcharging) lead-acid battery gives off <strong>hydrogen</strong> and oxygen; hydrogen is explosive from about <strong>4 %</strong> in air, so the battery compartment must be ventilated and you never smoke, make sparks or connect leads while charging. Second, the electrolyte is <strong>sulphuric acid</strong>: it burns skin and eyes, so rinse splashes with plenty of water, keep batteries upright in an acid-proof box and strap them down. Third, never short the terminals: a spanner dropped across the posts can weld itself and start a fire. <strong>Disconnect the negative (-) lead first and reconnect it last</strong>, keep terminals covered and clean, and grease them against corrosion.</p>
<div class="callout rule"><p><strong>Maritime Authority wiring rules:</strong> fit a main battery switch and switch it off when you leave the boat; do not leave 12 V plugs in their sockets (the lead stays live); every circuit must have a fuse; use only multi-stranded cable with a large cross-section and extra-thick insulation.</p></div>
<p>A blown fuse is replaced with the <strong>same rating</strong>, never a higher one or a piece of wire, and the cause is found. The automatic bilge pump is wired before the main switch with its own fuse so it keeps working when the boat is left. Many boat fires are caused by electrical faults in batteries and connections, and others are plain accidents during refuelling, cooking or engine service. Fight fuel and electrical fires with powder or CO2, never water, after cutting the main switch and the fuel.</p>`,
        illustration: () => illCircuit(),
        caption: 'Two banks, one main switch, a fuse on every circuit, a common negative return, and the automatic bilge pump wired before the switch with its own fuse.',
        keyFacts: [
          'Full 12 V lead-acid battery at rest: about 12.7 V (6 cells x 2.1 V). About 12.0 V = roughly half discharged.',
          'Charging gives off hydrogen: explosive from about 4 % in air. Ventilate, no sparks.',
          'Disconnect negative (-) first, reconnect it last. Acid splash: rinse with plenty of water.',
          'Main switch OFF when leaving; every circuit fused; replace a fuse with the SAME rating; multi-stranded, thick-insulated cable.',
          'Separate start and service batteries so house loads cannot flatten the start battery.',
        ],
        check: { q: 'A fully charged 12 V lead-acid battery at rest (no load) shows about:', options: ['10.5 V', '11.8 V', '12.7 V', '14.4 V'], answer: 2, explanation: 'The Sea Rescue Society\'s check list: a fully charged battery rests at 12.7 V. 14.4 V is a charging voltage, 11.8 V is well discharged (F44).' },
      },
      /* ---------------- 9 ---------------- */
      {
        id: 'ce-and-insurance',
        title: 'CE marking, builder\'s plate, hull number, owner\'s manual; liability and insurance',
        html: `
<p>Since <strong>16 June 1998</strong> every new recreational craft with a hull length of <strong>2.5 to 24 m</strong> must be <strong>CE-marked</strong> before it is sold or first used in the EEA (engines since 1 January 2006). The manufacturer or its representative affixes the mark and must supply three things the exam asks about.</p>
<p><strong>The builder's plate</strong>, placed where it is easy to see, shows the manufacturer's name, the <strong>maximum load including an optional outboard (kg)</strong>, the <strong>maximum number of persons</strong>, the <strong>design category A, B, C or D</strong> and the <strong>CE symbol</strong> (plus the notified body's number if one was involved). The maximum engine power is <em>not</em> on the plate.</p>
<p><strong>The hull identification number</strong>, called CIN in the curriculum and WIN (watercraft identification number) today, is a 15-character code such as <strong>NO-HXAB7A33G708</strong>: country code, manufacturer code, serial number, production month and year, and model year. It is <strong>permanently marked on the outside of the hull on the starboard side of the transom</strong>, separate from the CE mark, and identifies the boat whatever its name, colour or owner.</p>
<p><strong>The owner's manual</strong> (to EN ISO 10240) gives what you need to use that specific boat safely: technical data, limits and capacities including the <strong>maximum engine power in kW</strong>, operating instructions, and the risks of fire and water ingress. For boats sold in Norway it must be in a Scandinavian language. The <strong>declaration of conformity</strong> is the manufacturer's written attestation, with name, address, a description of the craft and the standards used, that the boat meets the Recreational Craft Regulation.</p>
<div class="callout tip"><p><strong>Liability and insurance (item 1.1 l).</strong> Both owner and operator are responsible for the boat complying with the Small Craft Act, and the skipper is responsible for everyone on board and for not polluting. If your boat damages people, other boats or quays, you can be held financially liable. Unlike for cars, <strong>boat insurance is not required by law</strong> in Norway, but <strong>liability (third-party) insurance</strong> is strongly recommended; <strong>hull insurance</strong> adds damage to your own boat and equipment. Check that the policy covers your cruising area and season.</p></div>`,
        illustration: () => illTransom(),
        caption: 'Seen from astern, starboard is on your left. The hull identification number is marked there on the outside of the transom; the builder\'s plate sits where it is easy to read.',
        keyFacts: [
          'CE marking: new recreational craft 2.5–24 m, since 16 June 1998 (engines since 1 Jan 2006).',
          'Builder\'s plate: manufacturer, max load incl. outboard (kg), max persons, design category A–D, CE symbol. Engine power is in the manual, not on the plate.',
          'CIN/WIN: 15-character code (e.g. NO-HXAB7A33G708) on the outside of the hull, STARBOARD side of the transom; encodes maker, serial number, production date, model year.',
          'Owner\'s manual: safe use of that boat, max engine power (kW), fire and water-ingress risks; Scandinavian language in Norway.',
          'Boat insurance is not compulsory in Norway; liability insurance strongly recommended; owner and operator share responsibility.',
        ],
        check: { q: 'Where do you find the hull identification number (CIN/WIN) on a CE-marked boat?', options: ['Engraved inside the engine compartment', 'On the outside of the hull, on the starboard side of the transom', 'Printed only in the owner\'s manual', 'On the port bow next to the registration number'], answer: 1, explanation: 'The Maritime Authority: the WIN is permanently marked on the outside of the hull on the starboard side of the transom. Many boats carry a hidden duplicate inside, but the visible one is at the starboard transom.' },
      },
      /* ---------------- 10 ---------------- */
      {
        id: 'pollution',
        title: 'Oil, fuel, garbage, antifouling and alien species',
        html: `
<p>The Pollution Control Act is short and absolute. <strong>Section 7:</strong> nobody may have, do or set in motion anything that may cause pollution, so pumping oily bilge water, fuel or old oil overboard is prohibited. <strong>Section 28:</strong> nobody may dump, leave, store or transport waste so that it is unsightly or harms the environment, so <strong>nothing goes overboard</strong>: not cigarette butts, not food packaging, not fishing line. Breaches are punished with fines or imprisonment (sections 78–79). Internationally, <strong>MARPOL Annex V</strong> applies to pleasure craft too and bans the discharge of <strong>all plastics everywhere</strong>, including synthetic rope, nets and bags, with narrow exceptions only for food waste far from land.</p>
<p>Keep the bilge clean, because the automatic bilge pump will happily pump an oil film overboard. Put <strong>oil-absorbent pads or socks</strong> in the bilge and under the engine, and never use detergent to "disperse" an oil film: it is still a discharge and makes the harm worse. <strong>Used engine oil, oil filters, old fuel, antifreeze, batteries and paint are hazardous waste</strong>: deliver them to the marina's hazardous-waste point or the municipal recycling station, never into household rubbish or down a drain.</p>
<div class="callout rule"><p><strong>Spill at sea:</strong> stop the leak (close the valve, plug it), contain it with absorbents, and report it. Acute pollution must be reported at once: the Norwegian Coastal Administration says ring the emergency number <strong>110</strong> (fire service), which alerts its duty team; at sea you can also report via the coast radio on VHF 16.</p></div>
<p><strong>Antifouling</strong> paints release copper and other biocides. The tin compound <strong>TBT</strong> has been banned internationally: no application since 1 January 2003 and no TBT coating on hulls since 1 January 2008; cybutryne was added in 2023. Only approved biocidal paints may be used, and scraping, sanding or pressure-washing a painted hull must be done on a hardstanding with the dust and wash-water collected and delivered as hazardous waste. Washing a hull where the run-off goes straight into the sea is a prohibited discharge under section 7.</p>
<p><strong>Alien species:</strong> the Regulation on Alien Organisms (section 24) requires that boats, fishing gear and other equipment used in a watercourse are <strong>cleaned and dried</strong> before being moved to another lake or river. In the sea, hull fouling spreads species such as the Pacific oyster and the carpet sea squirt, so clean and inspect the hull before moving the boat to a new area.</p>`,
        keyFacts: [
          'Pollution Control Act s. 7: nothing that may pollute (no oil, fuel or oily bilge water overboard). S. 28: no littering. Fines or imprisonment.',
          'MARPOL Annex V covers pleasure craft: all plastics banned everywhere. Teach: nothing overboard.',
          'Oil in the bilge: absorbent pads, never detergent. Used oil, filters, fuel, antifreeze, batteries, paint = hazardous waste to the marina or recycling station.',
          'Acute pollution: stop, contain, report on 110 (or via the coast radio).',
          'TBT antifouling banned (2003 application / 2008 on hulls); hull scraping on a hardstanding with residue collected. Clean and dry boat and gear before moving to another watercourse.',
        ],
        check: { q: 'You find an oil film in the bilge. What is the correct action?', options: ['Pump it overboard once you are more than 300 m from land', 'Add dish soap so the oil disperses, then pump it out', 'Soak it up with absorbent pads and dispose of them as hazardous waste', 'Leave it; small amounts are allowed'], answer: 2, explanation: 'Any discharge of oil is prohibited by section 7 of the Pollution Control Act, and detergent only hides and spreads the oil. Absorb it and deliver the pads as hazardous waste. The 300 m figure belongs to toilet waste, not oil (F57, F60).' },
      },
      /* ---------------- 11 ---------------- */
      {
        id: 'sewage',
        title: 'Toilet waste: the 300 m rule and the Oslofjord ban',
        html: `
<p>Boats with a toilet produce sewage, and two rules decide where it may go. The <strong>national rule</strong> (Regulation on environmental safety for ships, section 10) says: <strong>it is forbidden to discharge sewage in Norwegian sea areas closer than 300 m from the mainland and islands</strong>, and it is prohibited altogether in rivers and lakes. Only boats with a type-approved treatment plant are exempt from the distance rule. Note the wording: 300 m from the mainland <em>and</em> from islands, so a small skerry counts.</p>
<div class="callout rule"><p><strong>Oslofjord total ban, since 1 July 2024:</strong> all discharge of sewage from recreational boats is prohibited in the sea and coastal waters from the <strong>Swedish border to the Agder county border</strong>, out to the boundary of the North Sea–Skagerrak management plan, <strong>including all side fjords and the inner Oslofjord</strong>. "Sewage" means drainage and other waste from toilets and urinals. The only exceptions are emergency discharge after damage, boats with an ISO-standard treatment plant, and heritage-protected vessels.</p></div>
<p>The practical consequence is a <strong>holding tank</strong> and the habit of using <strong>pump-out stations</strong> in guest harbours. Marine national parks add their own rules: in Faerder National Park emptying boat septic tanks is prohibited everywhere in the park, and pump-out stations are provided in the harbours. Outside the Oslofjord ban area a municipality may set stricter sewage rules than the national 300 m, so read the local information.</p>
<p>Do not confuse the small-craft rule with <strong>MARPOL Annex IV</strong>, which governs large ships: untreated sewage only beyond <strong>12 nautical miles</strong>, treated and disinfected sewage beyond <strong>3 nautical miles</strong>. Those distances are a common exam distractor; the Norwegian recreational-boat rule is 300 m (and zero in the Oslofjord region).</p>
<p>Scenario: you sail from Oslo along the coast to Grimstad in Agder. From Oslo to the Agder border you are inside the ban area: zero discharge, use pump-out stations. West of the Agder border the national rule applies: more than 300 m from mainland and islands, and never in a national park or where a local ban applies.</p>`,
        illustration: () => illSewage(),
        caption: 'Left: the national 300 m band around mainland and islands. Right (schematic): the Oslofjord ban area from the Swedish border to the Agder county border, zero discharge since 1 July 2024.',
        keyFacts: [
          'National rule: no sewage discharge closer than 300 m from mainland AND islands; none at all in rivers and lakes.',
          'Oslofjord region (Swedish border to Agder border, all side fjords, inner Oslofjord): total ban since 1 July 2024. Use pump-out stations.',
          'Faerder National Park: emptying septic tanks prohibited in the whole park. Municipalities may set stricter rules.',
          'MARPOL Annex IV (ships): 12 nm untreated / 3 nm treated. Not the rule for Norwegian recreational boats.',
        ],
        check: { q: 'Since 1 July 2024, what is the rule for discharging toilet waste from a recreational boat in the Oslofjord region (Swedish border to the Agder border)?', options: ['Allowed more than 300 m from land', 'Allowed more than 3 nautical miles from land', 'Totally prohibited; use pump-out stations', 'Allowed only in the outer fjord'], answer: 2, explanation: 'The Oslofjord regulation (FOR-2024-05-31-886) bans all sewage discharge from recreational boats in the whole region including side fjords and the inner Oslofjord. The 300 m rule applies only outside that area (F63, F64).' },
      },
      /* ---------------- 12 ---------------- */
      {
        id: 'wildlife-and-access',
        title: 'Noise, wash, wildlife, protected areas and the right to roam',
        html: `
<p>The speed regulation (2021) starts with a <strong>general duty</strong>: adapt your speed so that wash or other effects cause no danger, damage or nuisance to people (swimmers and paddlers included), other vessels, quays, fish farms, shorelines, wildlife and birds. Its best-known number: <strong>no more than 5 knots within 50 m of places where bathing is in progress</strong> or of the marker buoys of a public bathing area; inside those buoys you may neither move with a motor or sail nor anchor. The rule applies to <em>any</em> bathing place, marked or not, and the simplified fine is <strong>NOK 5,000</strong>. Noise is a nuisance too: keep revs down near cabins and anchorages, and remember that personal watercraft are banned in the whole of Faerder and Ytre Hvaler national parks.</p>
<p><strong>Wildlife.</strong> The Nature Diversity Act, section 15: in every activity, unnecessary harm and suffering to wild animals and their nests, dens and lairs shall be avoided, and so shall unnecessary chasing. You never chase seabirds or seals with the boat, anywhere. Slow down near seal haul-outs and never drive between a seal and the water.</p>
<div class="callout rule"><p><strong>Sea-bird reserves</strong> are closed in the breeding season. In Faerder National Park's bird zones all access on land and on the sea closer than <strong>50 m</strong> from the shore is prohibited from <strong>15 April to 15 July</strong>: no landing, no boats, kayaks, paddleboards or divers. Ytre Hvaler uses the same dates. Other reserves have their own regulations, so read the sign.</p></div>
<p>Norway's marine national parks in the Skagerrak are <strong>Ytre Hvaler</strong> (2009, the first), <strong>Faerder</strong> (2013), <strong>Raet</strong> and <strong>Jomfruland</strong> (both 2016). Garbage must never be left or burned in them; fires and barbecues may be lit but <strong>never on bare rock</strong>, which cracks from the heat. Nationally, open fire in or near forest and other uncultivated land is forbidden from <strong>15 April to 15 September</strong>, islands included, unless it is obvious that it cannot spread.</p>
<p><strong>Right to roam (Outdoor Recreation Act).</strong> Section 6: travel by boat on the sea is free for everyone. Section 7: you may briefly pull a boat ashore or land on uncultivated land, and use rings and bolts there, but <strong>you may not use a quay or jetty without the owner's consent</strong>. Section 8: bathing from shore or boat is free at a reasonable distance from inhabited houses and cabins. Section 9: a tent must be at least <strong>150 m</strong> from an inhabited house or cabin and may stay <strong>two days</strong> without permission. Cultivated land (house plots, farmyards, fields) is off limits in summer.</p>`,
        illustration: () => illBirds(),
        caption: 'A sea-bird reserve: in Faerder a 50 m belt of sea is closed with the island from 15 April to 15 July. Outside the closure landing is normally allowed, but disturbing birds is always forbidden.',
        keyFacts: [
          'Speed regulation s. 2: no danger, damage or nuisance from wash. S. 3: max 5 knots within 50 m of bathers or bathing buoys; inside the buoys no motor/sail and no anchoring. Fine NOK 5,000.',
          'Nature Diversity Act s. 15: never disturb or chase wild animals, nests or seals, protected area or not.',
          'Sea-bird reserves (Faerder, Ytre Hvaler): closed 15 April – 15 July; Faerder adds a 50 m sea belt. Other reserves: read the sign.',
          'Marine national parks: Ytre Hvaler 2009, Faerder 2013, Raet and Jomfruland 2016; personal watercraft banned; no fires on bare rock; open-fire ban 15 April – 15 September.',
          'Outdoor Recreation Act: boating on the sea free; landing on uncultivated shore free; quay/jetty needs consent; tent 150 m from houses, max 2 days.',
        ],
        check: { q: 'On 10 June you approach an island signed as a sea-bird reserve in Faerder National Park. What may you do?', options: ['Land for a short picnic on the rocks', 'Paddle a kayak along the shoreline', 'Neither: stay more than 50 m off until the closure ends on 15 July', 'Anchor 20 m off and swim ashore'], answer: 2, explanation: 'Faerder\'s bird zones are closed on land and within 50 m of the shore from 15 April to 15 July, to all boats, kayaks, paddleboards and divers (F75).' },
      },
    ],

    /* =====================================================================
       FLASHCARDS
       ===================================================================== */
    flashcards: [
      { front: 'Steady stream of water from the small hole on an outboard leg?', back: 'The telltale: the cooling-water pump is working. No stream = stop and investigate.' },
      { front: 'Three causes of an outboard overheating?', back: 'Blocked cooling intake (weed, plastic, engine tilted too high), worn impeller, stuck thermostat or salt deposits.' },
      { front: 'Why never run an outboard out of the water?', back: 'The rubber impeller runs dry and shreds within seconds; no cooling.' },
      { front: 'Annual engine service recommended by the Maritime Authority?', back: 'Fuel filters, oil filter and impeller. Carry a spare impeller kit.' },
      { front: 'Which engine type burns oil mixed into the petrol?', back: 'Two-stroke. Ratio from the owner\'s manual, TC-W3 oil. Four-strokes have sump oil (dipstick).' },
      { front: 'Diesel will not start. Spark plugs?', back: 'A diesel has none. Think air in the fuel system (bleed it), blocked filter, water or diesel bug.' },
      { front: 'Petrol vapour: heavier or lighter than air?', back: 'About 2.8 times heavier; it sinks and collects in the bilge where a spark can ignite it.' },
      { front: 'Before starting an inboard petrol engine?', back: 'Run the engine-compartment blower for several minutes and sniff for petrol.' },
      { front: 'Fixed engine-room extinguisher required above which power (inboard petrol)?', back: '120 kW (ISO 9094). Recommended for every inboard petrol boat.' },
      { front: 'Engine runs a few minutes then dies; primer bulb soft?', back: 'Tank vent closed (or empty tank / leaking hose). Open the vent, pump the primer until firm.' },
      { front: 'Refuelling an inboard: where do you fill?', back: 'From outboard or over the deck, engine stopped, no flames, hatches closed, wipe spills, ventilate before starting.' },
      { front: 'The one-third rule for fuel?', back: 'One third out, one third back, one third untouched reserve.' },
      { front: '60 l tank, 10 l/h at 20 knots: range and planning distance?', back: '6 h = 120 nm in flat water; plan about 40 nm out, 40 back, 20 l reserve.' },
      { front: 'Nine checks when the engine will not start (Sea Rescue Society)?', back: 'Neutral, kill-cord clip, main switch, battery cables, charge (12.7 V), fuel, hose, vent, primer.' },
      { front: 'Starter turns but engine does not fire?', back: 'Fuel first (vent, primer, filter, tank), then spark (wet or fouled plugs).' },
      { front: 'Is the kill cord compulsory by law in Norway?', back: 'No: strongly recommended, not a legal duty. The 2023 law change was the high-speed certificate (50 knots+, age 18).' },
      { front: 'Rope round the propeller: first actions?', back: 'Stop, key out, kill cord off, tilt the engine, cut the rope. Nobody near a prop that can start.' },
      { front: 'Engine dead, drifting towards rocks?', back: 'Anchor at once, lifejackets on, call the coast radio: VHF channel 16 or telephone 120 (part 4).' },
      { front: 'Propeller marked 13 x 19?', back: '13-inch diameter, 19-inch pitch (theoretical advance per revolution).' },
      { front: 'Engine revs freely after hitting a rock, boat does not move?', back: 'Broken shear pin (or slipping rubber hub). Fit the spare pin.' },
      { front: 'Cavitation vs ventilation?', back: 'Cavitation: vapour bubbles on the blade (noise, erosion). Ventilation: air drawn from the surface (over-rev, lost thrust).' },
      { front: 'Resting voltage of a fully charged 12 V battery?', back: 'About 12.7 V. Around 12.0 V = roughly half discharged.' },
      { front: 'Gas given off by a charging lead-acid battery?', back: 'Hydrogen (and oxygen); explosive from about 4 % in air. Ventilate, no sparks.' },
      { front: 'Which battery lead do you disconnect first?', back: 'The negative (-) first, reconnect it last, so a slipped tool cannot short the positive.' },
      { front: 'Replacing a blown fuse?', back: 'Same rating, never higher and never a piece of wire; find the cause.' },
      { front: 'Why two battery banks?', back: 'Start battery for the engine, service battery for house loads: lights and fridge cannot flatten the start battery.' },
      { front: 'Builder\'s (CE) plate shows?', back: 'Manufacturer, max load incl. outboard (kg), max persons, design category A–D, CE symbol. Not the engine power.' },
      { front: 'Where is the hull identification number (CIN/WIN)?', back: 'Permanently marked on the outside of the hull, starboard side of the transom (e.g. NO-HXAB7A33G708).' },
      { front: 'Is boat liability insurance compulsory in Norway?', back: 'No, but strongly recommended: you are liable for damage your boat causes to people, boats and quays.' },
      { front: 'Oil film in the bilge?', back: 'Absorbent pads, disposed of as hazardous waste. Never pump overboard, never detergent.' },
      { front: 'Reporting an oil spill at sea?', back: 'Emergency number 110 (fire service alerts the Coastal Administration) or via the coast radio.' },
      { front: 'What may go overboard from a recreational boat?', back: 'Nothing. Pollution Control Act s. 28 forbids littering; MARPOL Annex V bans all plastics everywhere.' },
      { front: 'Toilet waste: national distance rule?', back: 'Not closer than 300 m from mainland and islands; never in rivers and lakes.' },
      { front: 'Toilet waste in the Oslofjord region?', back: 'Total ban since 1 July 2024, Swedish border to Agder border, all side fjords included. Use pump-out stations.' },
      { front: 'Speed near bathers?', back: 'Max 5 knots within 50 m of bathers or bathing buoys; inside the buoys no motor/sail, no anchoring. Fine NOK 5,000.' },
      { front: 'Sea-bird reserve closure in Faerder National Park?', back: '15 April to 15 July: no landing and no boats, kayaks or divers within 50 m of the shore.' },
      { front: 'Tent rules under the Outdoor Recreation Act?', back: 'At least 150 m from an inhabited house or cabin, max 2 days without permission.' },
      { front: 'May you tie up to a private jetty under the right to roam?', back: 'No: a quay or jetty needs the owner\'s consent. Landing on an uncultivated shore is free.' },
    ],

    /* =====================================================================
       QUESTIONS
       ===================================================================== */
    questions: [
      // --- engine types (F1–F11) ---
      { id: 'engine-01', q: 'Which engine type needs lubricating oil mixed into the petrol?', options: ['Four-stroke outboard', 'Diesel inboard', 'Two-stroke outboard', 'Electric outboard'], answer: 2, explanation: 'Two-strokes use total-loss lubrication: the oil is pre-mixed in the tank or injected and burns with the fuel. Use the ratio in the owner\'s manual and TC-W3 oil (F5, F6).', difficulty: 1, part: 1, tags: ['two-stroke'] },
      { id: 'engine-02', q: 'How do you check the lubricating oil on a four-stroke outboard?', options: ['Look at the colour of the exhaust smoke', 'With the dipstick before starting, engine level and rested', 'Check the oil ratio on the fuel can', 'It cannot be checked; it is sealed for life'], answer: 1, explanation: 'A four-stroke keeps its oil in a sump like a car. Check the level with the dipstick before starting, with the engine level and after a few minutes\' rest, and change it at the recommended interval (F7).', difficulty: 1, part: 1, tags: ['four-stroke'] },
      { id: 'engine-03', q: 'How does a diesel engine ignite its fuel?', options: ['With a spark plug, like a petrol engine', 'With a glow plug that stays on while running', 'By the heat of compression alone; it has no spark plugs', 'With a pilot flame in the inlet manifold'], answer: 2, explanation: 'A diesel ignites the fuel by compression heat and has no spark plugs, so diesel faults are almost always fuel-related: air in the system, dirty filters or water (F8).', difficulty: 1, part: 1, tags: ['diesel'] },
      { id: 'engine-04', q: 'You run your diesel tank dry, refill it, and the engine still will not start. Why?', options: ['The spark plugs are wet and must be dried', 'Air in the fuel system must be bled out', 'The impeller has run dry', 'The choke has been left on'], answer: 1, explanation: 'Air in a diesel fuel system does not clear itself. Pump fuel through with the hand primer and open the bleed screws at the filter and injection pump until fuel without bubbles comes out (F9).', difficulty: 2, part: 1, tags: ['diesel'] },
      { id: 'engine-05', q: 'What describes a sterndrive (inboard/outboard) installation?', options: ['Engine inside the boat near the transom, with a pivoting drive leg outside the hull and no rudder', 'A complete engine unit clamped to the outside of the transom', 'An inboard engine driving a fixed shaft and propeller, steered by a rudder', 'A pump that pushes water through a steerable nozzle'], answer: 0, explanation: 'A sterndrive has the engine inside just forward of the transom and a drive leg outside that turns to steer and can be trimmed and tilted, so no rudder is needed (F3).', difficulty: 1, part: 1, tags: ['sterndrive'] },
      { id: 'engine-06', q: 'Why does an outboard-powered boat have almost no steering when the propeller is not turning?', options: ['Because the rudder is too small at low speed', 'Because it steers by directing the propeller thrust, and with no thrust there is nothing to direct', 'Because the hydraulic steering needs engine pressure', 'Because the anti-ventilation plate locks the leg'], answer: 1, explanation: 'An outboard (and a sterndrive) steers by pivoting the whole unit so the thrust changes direction. Under power it steers even at very low speed, but with the prop stopped there is no thrust to redirect (F1).', difficulty: 2, part: 1, tags: ['outboard'] },
      { id: 'engine-07', q: 'Which statement about a waterjet drive is correct?', options: ['It needs deep water because the intake is below the keel', 'It steers best with the throttle closed', 'It has no exposed propeller and can run in very shallow water, but steers poorly with the throttle closed', 'It cannot go astern'], answer: 2, explanation: 'A waterjet sucks water in under the hull and pushes it out through a steerable nozzle: no exposed propeller, very shallow draught, reverse with a deflector bucket, but little steering when the throttle is closed because steering depends on the jet (F4).', difficulty: 2, part: 1, tags: ['waterjet'] },
      { id: 'engine-08', q: 'Water has got into a diesel tank. What is the main long-term risk?', options: ['The diesel becomes explosive like petrol', 'Bacteria and fungi grow at the water-fuel boundary and the sludge blocks the filters', 'The injectors rust within hours', 'The engine will overheat'], answer: 1, explanation: '"Diesel bug" grows where water meets fuel and blocks filters. Keep the tank full to reduce condensation, drain the water separator and use fresh fuel (F10).', difficulty: 2, part: 1, tags: ['diesel'] },
      // --- cooling (F12–F17, F54) ---
      { id: 'engine-09', q: 'Look at the two outboards in the picture. Which engine must be stopped immediately, and why?', options: ['A: the stream shows the engine is overheating', 'B: no telltale stream means no proof that cooling water is circulating', 'Both: water should never come out of the leg', 'Neither: the stream only matters at high speed'], answer: 1, explanation: 'A steady telltale stream (engine A) means the cooling pump is working. No stream (engine B) means stop at once and check the telltale hole, the intake and the impeller (F13).', illustration: () => illTelltale(), difficulty: 1, part: 1, tags: ['telltale'] },
      { id: 'engine-10', q: 'What does a steady stream of water from the small hole on the side of an outboard leg tell you?', options: ['The engine is overheating', 'The fuel tank is venting', 'The gearbox oil seal is leaking', 'The cooling-water pump is working normally'], answer: 3, explanation: 'The telltale shows cooling water is circulating. The alarm sign is the opposite: a weak, intermittent or missing stream (F13).', difficulty: 1, part: 1, tags: ['telltale'] },
      { id: 'engine-11', q: 'Which is a common cause of an outboard overheating?', options: ['Too much two-stroke oil in the fuel', 'A full fuel tank', 'A cooling-water intake blocked by weed or a plastic bag, or a worn impeller', 'Running at idle for too long'], answer: 2, explanation: 'Blocked intake (weed, plastic, mud, or the engine tilted so high the intake is out of the water) and a worn impeller are the classic causes, with a stuck thermostat and salt deposits behind them (F14).', difficulty: 2, part: 1, tags: ['overheating'] },
      { id: 'engine-12', q: 'You want to test the outboard for a few seconds while the boat sits on the trailer. Is that safe for the engine?', options: ['Yes, a few seconds does no harm', 'Yes, as long as it is in neutral', 'No: the impeller runs dry and is destroyed within seconds, unless you use a flushing attachment or test tank', 'No: the gearbox oil will drain out'], answer: 2, explanation: 'Never run an outboard out of the water without a flushing attachment or test tank. The rubber impeller shreds within seconds and the engine has no cooling (F16).', difficulty: 1, part: 1, tags: ['impeller'] },
      { id: 'engine-13', q: 'In the picture, which letter marks the cooling-water intake that must be kept clear of weed and plastic?', options: ['A', 'B', 'C', 'D'], answer: 0, explanation: 'The intake grille sits on the gearcase below the waterline (A). B is the telltale, C the primer bulb on the fuel line, D the anti-ventilation plate at the water surface (F12, F13).', illustration: () => illOutboard({ quiz: true }), difficulty: 2, part: 1, tags: ['outboard', 'picture'] },
      { id: 'engine-14', q: 'In the picture, which letter marks the telltale that shows the cooling pump is working?', options: ['A', 'B', 'C', 'D'], answer: 1, explanation: 'The telltale (B) is the small hole on the leg above the waterline that squirts a thin stream as soon as the engine runs. A is the intake, C the primer bulb, D the anti-ventilation plate (F13).', illustration: () => illOutboard({ quiz: true }), difficulty: 2, part: 1, tags: ['outboard', 'picture'] },
      { id: 'engine-15', q: 'At lay-up you drain the gear oil from the outboard\'s lower unit and it is milky. What does that mean?', options: ['The oil is fresh and of good quality', 'Water has got in past the seals; it will freeze and crack the housing if left', 'Two-stroke oil has mixed in from the fuel', 'Nothing; gear oil is always milky when cold'], answer: 1, explanation: 'Milky gear oil means water has entered the gearcase through a worn seal. Change the oil and have the seals checked; water left inside freezes and cracks the housing (F54).', difficulty: 3, part: 1, tags: ['winterising'] },
      { id: 'engine-16', q: 'Which annual maintenance does the Norwegian Maritime Authority recommend for a boat engine?', options: ['New spark plugs, new propeller and new battery', 'Fuel filters, oil filter and impeller', 'Repainting the leg and greasing the steering', 'Replacing the fuel tank vent'], answer: 1, explanation: 'The Maritime Authority\'s equipment advice: it is wise to service fuel filters, oil filter and impeller every year, and to carry a spare impeller kit and spare fuel filters (F17, F12, F21).', difficulty: 2, part: 1, tags: ['maintenance'] },
      // --- fuel system and fire (F18–F28) ---
      { id: 'engine-17', q: 'The outboard starts, runs for a few minutes, then dies; the primer bulb has gone soft. Most likely cause?', options: ['Flat battery', 'Broken impeller', 'Rope round the propeller', 'Fuel tank vent closed'], answer: 3, explanation: 'With a closed vent the engine sucks a vacuum in the tank and starves. Open the vent, pump the primer until firm and restart (F18).', difficulty: 2, part: 1, tags: ['fuel'] },
      { id: 'engine-18', q: 'You squeeze the primer bulb before a cold start and it never goes firm. What does that indicate?', options: ['The engine is already primed; start it', 'The tank is empty, the vent is closed or the fuel line is leaking', 'The spark plugs are fouled', 'The impeller is worn'], answer: 1, explanation: 'The bulb should go firm when fuel fills the line. If it stays soft, fuel is not arriving: empty tank, closed vent, or a cracked or loose hose (F19, F20).', difficulty: 2, part: 1, tags: ['fuel'] },
      { id: 'engine-19', q: 'Why is petrol vapour so dangerous in a boat?', options: ['It is about 2.8 times heavier than air and collects in the bilge, where a spark can set off an explosion', 'It rises and escapes, taking oxygen with it', 'It dissolves in bilge water and corrodes the hull', 'It only burns at very high temperatures'], answer: 0, explanation: 'The Maritime Authority\'s fire guidance: petrol vapour is about 2.8 times heavier than air, sinks into the bilge and engine compartment and waits for a spark (F11).', difficulty: 1, part: 1, tags: ['petrol'] },
      { id: 'engine-20', q: 'Before starting an inboard petrol engine you should:', options: ['Open the throttle fully to clear the cylinders', 'Close the fuel tank vent', 'Run the engine-compartment blower for several minutes and check for a smell of petrol', 'Disconnect the service battery'], answer: 2, explanation: 'Petrol vapour collects at the bottom of the engine compartment, so the blower must run for several minutes before you start, and you sniff the compartment first (F27).', difficulty: 1, part: 1, tags: ['petrol', 'blower'] },
      { id: 'engine-21', q: 'Which refuelling practice is correct for a boat with an inboard petrol engine?', options: ['Fill with the engine idling so the fuel pump helps', 'Open all cabin hatches so vapour can spread out', 'Fill portable tanks in the cabin, out of the wind', 'Stop the engine, no flames, fill from outboard or over the deck, hatches closed, wipe spills, ventilate before starting'], answer: 3, explanation: 'Maritime Authority refuelling rules: engine stopped, no smoking or flame, filling outboard or over the deck for inboard boats, portable tanks filled ashore, hatches closed so vapour cannot enter the cabin, spills wiped and ventilation before starting (F25).', difficulty: 2, part: 1, tags: ['refuelling'] },
      { id: 'engine-22', q: 'Above which engine power does the CE standard ISO 9094 require a fixed extinguishing system for an inboard petrol engine?', options: ['25 kW', '50 kW', '120 kW', '250 kW'], answer: 2, explanation: 'Above 120 kW a fixed engine-room system is required; the Maritime Authority recommends one for every boat with an inboard petrol engine (F26).', difficulty: 3, part: 1, tags: ['fire'] },
      { id: 'engine-23', q: 'What does the Maritime Authority recommend for an LPG (propane) galley installation?', options: ['Store the bottle in the bilge where it is cool', 'A gas alarm, a shut-off valve for each appliance, professional installation and regular hose checks', 'Use the engine blower to ventilate the gas locker', 'No special measures, since LPG is lighter than air'], answer: 1, explanation: 'LPG is heavier than air and collects in the bilge like petrol vapour, so the Authority recommends a gas alarm, an isolation valve per appliance, professional installation and regular hose checks (F28).', difficulty: 2, part: 1, tags: ['lpg'] },
      { id: 'engine-24', q: 'At the fuel dock you smell petrol in the cabin of your inboard cruiser. What is the right first action?', options: ['Start the engine and motor away from the dock to disperse the vapour', 'Switch on the bilge pump to clear the bilge', 'Do not start the engine or operate any electrical switch; stop refuelling, extinguish flames, get people off, open hatches and run the blower', 'Light a match to test for gas'], answer: 2, explanation: 'Any spark, from the starter, a switch or the bilge pump, can ignite vapour in the bilge. Stop everything, ventilate, find and fix the leak, and start only when the compartment is sniff-clean (F11, F25, F27).', difficulty: 3, part: 1, tags: ['petrol', 'scenario'] },
      // --- fuel planning (F29, F30) ---
      { id: 'engine-25', q: 'What does the "one-third rule" for fuel mean?', options: ['Fill the tank to one third', 'One third of the fuel out, one third back, one third kept in reserve', 'Use no more than one third of full throttle', 'Refuel every third trip'], answer: 1, explanation: 'Plan to use one third to get out and one third to get back, and keep one third untouched for weather, current, detours and mistakes (F29).', difficulty: 1, part: 1, tags: ['fuel-planning'] },
      { id: 'engine-26', q: 'Your tank holds 60 litres and the engine burns 10 litres per hour at 20 knots. Applying the one-third rule, how far out may you plan to go in flat water?', options: ['About 20 nautical miles', 'About 40 nautical miles', 'About 60 nautical miles', 'About 120 nautical miles'], answer: 1, explanation: '60 l / 10 l/h = 6 h; 6 h x 20 knots = 120 nm total range. One third of that, 40 nm, is for the outward leg, 40 nm for the return and 40 nm (20 l) stays in reserve (F29, F30).', difficulty: 3, part: 1, tags: ['fuel-planning', 'calculation'] },
      { id: 'engine-27', q: 'On the way home you meet a strong head wind and waves. What happens to your fuel plan?', options: ['Consumption per mile falls because the engine works harder and more efficiently', 'Nothing; consumption depends only on engine revs', 'Consumption per mile rises sharply, so you should shorten the plan or slow down and use the reserve third only if necessary', 'You should speed up to get home before the fuel runs out'], answer: 2, explanation: 'Consumption per mile rises sharply in waves and head winds. That is exactly what the reserve third is for; the plan itself should shrink (F29, F30).', difficulty: 2, part: 1, tags: ['fuel-planning'] },
      // --- starting, kill cord, troubleshooting (F22–F24, F31–F38) ---
      { id: 'engine-28', q: 'The starter motor does not turn at all. Which checks come first?', options: ['Spark plugs and fuel filter', 'Gear lever in neutral, kill-cord clip in place, main battery switch on, battery cables and charge', 'Primer bulb and tank vent', 'Impeller and cooling intake'], answer: 1, explanation: 'A starter that does not turn is an electrical or interlock fault: the interlock allows starting only in neutral and with the kill-cord clip in place, then come main switch, cables, charge and fuse (F32, F33, F34).', difficulty: 2, part: 1, tags: ['troubleshooting'] },
      { id: 'engine-29', q: 'The starter turns normally but the petrol engine does not fire. In what order do you look?', options: ['Battery, then main switch', 'Impeller, then thermostat', 'Propeller, then gearbox', 'Fuel (vent, primer, filter, tank), then spark plugs'], answer: 3, explanation: 'If the starter turns, electrics and interlocks are fine. Check fuel supply first, then spark: wet or fouled plugs, cracked insulators (F34).', difficulty: 2, part: 1, tags: ['troubleshooting'] },
      { id: 'engine-30', q: 'You have used too much choke; the engine smells of petrol and will not start. What now?', options: ['Pull the choke out fully and keep cranking', 'Wait a few minutes, push the choke in, open the throttle fully and crank, or remove and dry the spark plugs', 'Pour petrol into the carburettor', 'Close the fuel vent and try again'], answer: 1, explanation: 'A flooded engine has too much fuel in the cylinders. Let it rest, crank with choke off and throttle open, or dry the plugs. Use choke only for a cold start and push it in as soon as the engine runs (F35).', difficulty: 2, part: 1, tags: ['troubleshooting'] },
      { id: 'engine-31', q: 'A rope has wrapped itself round your propeller. What do you do first?', options: ['Reverse hard to unwind it', 'Ask a passenger to swim down while the engine idles', 'Stop the engine, remove the key and the kill cord, then tilt the engine and cut the rope', 'Pull the rope while the engine is in gear'], answer: 2, explanation: 'Nobody goes near a propeller that can be started. Stop, key out, kill cord off, tilt the engine or work from the dinghy, and cut the rope away (F37).', difficulty: 1, part: 1, tags: ['propeller'] },
      { id: 'engine-32', q: 'What is the legal status of the kill cord (engine cut-off lanyard) in Norway?', options: ['Compulsory in all motorboats since 2015', 'Compulsory above 15 knots since 2023', 'Strongly recommended by the Maritime Authority, but there is no general legal duty to wear it', 'Compulsory only for personal watercraft'], answer: 2, explanation: 'The licence regulation contains no kill-cord duty; the 2020 proposal for a duty above 15 knots was not adopted. What became law in 2023 was the high-speed certificate for boats capable of 50 knots or more (F23).', difficulty: 3, part: 1, tags: ['kill-cord'] },
      { id: 'engine-33', q: 'Why carry a spare kill cord on board?', options: ['Because the cord must be changed every trip', 'So the boat can be restarted if the driver and the cord go overboard together', 'Because the law requires two cords', 'To tie the fuel can down'], answer: 1, explanation: 'If the driver falls in with the cord, the engine stops as intended, but the people left on board can only restart it with a spare cord (F24).', difficulty: 2, part: 1, tags: ['kill-cord'] },
      { id: 'engine-34', q: 'Your engine has stopped and cannot be restarted; wind is pushing you towards rocks. What is the right sequence?', options: ['Keep trying the starter until the battery is flat', 'Swim ashore with a line', 'Anchor at once, put lifejackets on, and call the coast radio on VHF channel 16 or telephone 120', 'Wait for another boat to pass; calling for help is only allowed in life-threatening situations'], answer: 2, explanation: 'Stop the drift first with the anchor, protect the crew, then call early: the coast radio keeps watch on VHF 16 and answers on 120. This is part-4 item 1.4.6 (F38).', difficulty: 2, part: 4, p4: '1.4.6', tags: ['emergency'] },
      { id: 'engine-35', q: 'Which VHF channel do you use to call the coast radio and to send a distress call?', options: ['Channel 6', 'Channel 12', 'Channel 16', 'Channel 70 by voice'], answer: 2, explanation: 'VHF channel 16 is the distress and calling channel on which the coast radio keeps a continuous watch. Channel 70 is for DSC data only, not voice (F38, part 4 item 1.4.6).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['emergency', 'vhf'] },
      { id: 'engine-36', q: 'Which telephone number reaches the coast radio service when your engine has failed and you need assistance?', options: ['110', '112', '120', '116 117'], answer: 2, explanation: 'The coast radio service answers on telephone 120 (still valid after the service moved to the Joint Rescue Coordination Centres on 1 January 2026). 110 is fire, 112 police, 113 ambulance (F38, part 4 item 1.4.6).', difficulty: 1, part: 4, p4: '1.4.6', tags: ['emergency'] },
      { id: 'engine-37', q: 'Fire has broken out in the engine compartment two miles off the coast and you have a VHF radio. What is the fastest way to alert the rescue service?', options: ['A distress call on VHF channel 16 (or DSC distress), then fight the fire', 'Send a text message to a friend ashore', 'Sound five short blasts on the horn', 'Wait until the fire is out, then ring 120 to report it'], answer: 0, explanation: 'In a life-threatening emergency send a distress call on VHF channel 16 (or press the DSC distress button); the coast radio and nearby vessels hear it at once. Telephone 112 is the alternative without VHF (F38, part 4 item 1.4.6).', difficulty: 2, part: 4, p4: '1.4.6', tags: ['emergency', 'vhf'] },
      { id: 'engine-38', q: 'In a 6 m open boat under way, you lean over the transom to clear weed from the outboard. What does the law require?', options: ['Nothing; flotation is only required for children', 'Everyone on board, including you, must be wearing suitable flotation equipment while the boat is under way', 'Only the skipper needs a lifejacket', 'Flotation is required only above 10 knots'], answer: 1, explanation: 'Small Craft Act section 23a: in recreational boats shorter than 8 m everyone wears suitable flotation when outdoors and under way. Working over the stern is a classic man-overboard moment (F89, part 4 item 1.4.5).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['flotation'] },
      { id: 'engine-39', q: 'You refuel your 7 m motorboat, have two beers at the marina cafe, and then drive home with 0.9 per mille alcohol in your blood. Legal?', options: ['Yes, the limit for boats under 15 m is 1.0 per mille', 'Yes, drinking at the marina is not covered by the law', 'No, the limit for operating a craft under 15 m is 0.8 per mille', 'No, there is a zero limit for all boats'], answer: 2, explanation: 'Small Craft Act section 33: 0.8 per mille (or 0.4 mg per litre of breath) for a motorboat or a sailing boat of 4.5 m or more under 15 m. The offence is operating the boat over the limit (F87, part 4 item 1.4.5).', difficulty: 2, part: 4, p4: '1.4.5', tags: ['alcohol'] },
      { id: 'engine-40', q: 'While you troubleshoot the engine, your 12-year-old passenger takes off his lifejacket in your 5.5 m boat, which is still under way. Who is responsible for him wearing it?', options: ['The child himself', 'His parents, whether or not they are on board', 'You, the operator, are responsible for children under 15', 'Nobody; the rule is suspended during a breakdown'], answer: 2, explanation: 'Section 23a of the Small Craft Act makes the operator responsible for children under 15 wearing flotation in boats under 8 m under way (F88, F89, part 4 item 1.4.5).', difficulty: 1, part: 4, p4: '1.4.5', tags: ['flotation'] },
      // --- propeller (F39–F43) ---
      { id: 'engine-41', q: 'A propeller is marked "13 x 19". What does that mean?', options: ['13 blades with a 19 cm radius', '13-inch diameter and 19-inch pitch', '19-inch diameter and 13-inch pitch', '13 kW rating for a 19 ft boat'], answer: 1, explanation: 'Propellers are described as diameter x pitch in inches: diameter is the circle swept by the blade tips, pitch the theoretical advance per revolution (F39).', difficulty: 1, part: 1, tags: ['propeller'] },
      { id: 'engine-42', q: 'After a grounding the boat vibrates badly at speed. Most likely cause?', options: ['Water in the fuel', 'A closed fuel vent', 'A bent or chipped propeller', 'A weak battery'], answer: 2, explanation: 'A damaged or unbalanced propeller vibrates, loses speed, burns more fuel and can wreck gearbox seals. Inspect the prop after any grounding and carry a spare (F41).', difficulty: 2, part: 1, tags: ['propeller'] },
      { id: 'engine-43', q: 'You fit a propeller with much higher pitch hoping for more top speed, but the engine no longer reaches its rated full-throttle rpm. What is the result?', options: ['Higher top speed as intended', 'The engine labours below its rated revs, loses speed and wears faster', 'Better acceleration from rest', 'Lower fuel consumption at all speeds'], answer: 1, explanation: 'Higher pitch gives more speed only if the engine can still reach its recommended full-throttle rpm range. Too much pitch overloads the engine (F40).', difficulty: 3, part: 1, tags: ['propeller'] },
      { id: 'engine-44', q: 'In a tight high-speed turn the engine suddenly over-revs and the boat loses thrust. What is happening?', options: ['Cavitation: the fuel is boiling in the carburettor', 'Ventilation: air is drawn down from the surface to the propeller', 'The shear pin has broken', 'The thermostat has closed'], answer: 1, explanation: 'Ventilation is air sucked from the surface when the prop runs too shallow or in a tight turn: over-revving and lost thrust. Trim the engine down or ease the turn. Cavitation is vapour bubbles collapsing on the blade (F43).', difficulty: 3, part: 1, tags: ['propeller'] },
      // --- electrics (F44–F52) ---
      { id: 'engine-45', q: 'What resting voltage does a fully charged 12 V lead-acid battery show?', options: ['About 10.5 V', 'About 11.8 V', 'About 14.4 V', 'About 12.7 V'], answer: 3, explanation: 'A full 12 V battery rests at about 12.7 V (six cells of about 2.1 V). Around 12.0 V it is roughly half discharged (F44).', difficulty: 1, part: 1, tags: ['battery'] },
      { id: 'engine-46', q: 'Which gas does a lead-acid battery give off while charging, and why does it matter?', options: ['Carbon monoxide, which is poisonous', 'Hydrogen, which is explosive from about 4 % in air', 'Propane, which sinks into the bilge', 'Nitrogen, which is harmless'], answer: 1, explanation: 'Charging electrolyses water into hydrogen and oxygen. Hydrogen is explosive from about 4 % in air, so ventilate the battery compartment and make no sparks while charging (F45).', difficulty: 1, part: 1, tags: ['battery'] },
      { id: 'engine-47', q: 'When you disconnect a boat battery, which lead do you remove first?', options: ['The positive (+) lead, so the circuit is dead', 'The negative (-) lead, so a slipped tool cannot short the positive to the hull or engine', 'Both at the same time', 'It makes no difference on 12 V systems'], answer: 1, explanation: 'Disconnect the negative first and reconnect it last. A spanner that touches the positive post and the engine block then cannot complete a circuit (F47).', difficulty: 2, part: 1, tags: ['battery'] },
      { id: 'engine-48', q: 'Why fit a separate start battery and service battery?', options: ['To double the engine power', 'Because the law requires two batteries', 'So that lights, plotter and fridge cannot flatten the battery you need to start the engine', 'To reduce corrosion of the terminals'], answer: 2, explanation: 'The service bank runs the house loads; the start battery is reserved for the engine. Starting batteries also lose capacity if repeatedly drained flat (F49).', difficulty: 2, part: 1, tags: ['battery'] },
      { id: 'engine-49', q: 'A fuse keeps blowing. What is the correct action?', options: ['Fit a fuse of a higher rating so it stops blowing', 'Bridge the fuse holder with a piece of wire', 'Find the cause and replace the fuse with one of the same rating', 'Remove the fuse; 12 V cannot start a fire'], answer: 2, explanation: 'The fuse protects the cable. A higher rating or a wire lets the cable overheat and start a fire; electrical faults in batteries and connections cause many boat fires (F48, F50).', difficulty: 1, part: 1, tags: ['fuse'] },
      { id: 'engine-50', q: 'In the circuit picture, which letter marks the component that isolates the whole electrical system and should be switched off when you leave the boat?', options: ['A', 'B', 'C', 'D'], answer: 0, explanation: 'A is the main battery switch (OFF / 1 / 2 / BOTH). B is the fuse panel, C the alternator/charger, D the automatic bilge pump, which is wired before the main switch so it keeps working (F48).', illustration: () => illCircuit({ quiz: true }), difficulty: 2, part: 1, tags: ['electrics', 'picture'] },
      { id: 'engine-51', q: 'What does the Maritime Authority say about leaving the boat?', options: ['Leave the 12 V plugs connected so the batteries stay balanced', 'Switch off the main battery switch and do not leave 12 V plugs in their sockets', 'Leave the blower running', 'Disconnect the bilge pump to save the battery'], answer: 1, explanation: 'Switch the main switch off when you leave; a 12 V plug left in its socket keeps the lead live. The automatic bilge pump is wired before the main switch on its own fuse so it still works (F48).', difficulty: 2, part: 1, tags: ['electrics'] },
      { id: 'engine-52', q: 'Battery acid splashes onto your hand while you are checking the cells. What do you do?', options: ['Wipe it off with an oily rag', 'Rinse with plenty of water', 'Neutralise it with petrol', 'Leave it; the acid is very dilute'], answer: 1, explanation: 'The electrolyte is sulphuric acid, which burns skin and can blind. Rinse at once with plenty of water, and keep batteries upright in an acid-proof, strapped-down box (F46).', difficulty: 2, part: 1, tags: ['battery'] },
      // --- CE marking and insurance (sdir.no CE page; F88) ---
      { id: 'engine-53', q: 'Which information must the builder\'s (CE) plate on a recreational craft show?', options: ['Manufacturer, maximum load including an optional outboard, maximum number of persons, design category A–D and the CE symbol', 'Hull number, engine power and top speed', 'Owner\'s name, home port and insurance company', 'Draught, displacement and fuel capacity'], answer: 0, explanation: 'The Maritime Authority lists the plate contents: manufacturer\'s name, max load incl. outboard (kg), max persons, construction category A, B, C or D, the CE symbol and, if applicable, the notified body\'s number. Engine power is in the owner\'s manual.', difficulty: 1, part: 2, tags: ['ce'] },
      { id: 'engine-54', q: 'Where is the hull identification number (CIN/WIN) placed on a CE-marked boat?', options: ['Inside the engine compartment', 'On the port bow', 'Permanently marked on the outside of the hull, on the starboard side of the transom', 'Only in the owner\'s manual'], answer: 2, explanation: 'The WIN (formerly HIN/CIN), a 15-character code such as NO-HXAB7A33G708, is permanently marked on the outside of the hull on the starboard side of the transom, separate from the CE mark.', illustration: () => illTransom(), difficulty: 2, part: 2, tags: ['ce', 'win', 'picture'] },
      { id: 'engine-55', q: 'What does the hull identification number (WIN/CIN) tell you?', options: ['The boat\'s maximum speed and engine power', 'The design category and the number of persons', 'The current owner and the home port', 'Who built the boat, in which country, its serial number, when it was built and its model year'], answer: 3, explanation: 'The code holds the country code, manufacturer code, serial number, production month and year, and model year. It identifies the hull whatever its colour, name or owner.', difficulty: 2, part: 2, tags: ['ce', 'win'] },
      { id: 'engine-56', q: 'Where do you find the maximum recommended engine power for a CE-marked boat?', options: ['On the builder\'s plate', 'In the owner\'s manual, in kW', 'Engraved next to the hull identification number', 'On the declaration of conformity only'], answer: 1, explanation: 'The owner\'s manual (EN ISO 10240) states the boat\'s limits and capacities, including maximum engine power in kW; the builder\'s plate carries load, persons, category and the CE symbol, not engine power.', difficulty: 2, part: 2, tags: ['ce', 'manual'] },
      { id: 'engine-57', q: 'What is the declaration of conformity that comes with a CE-marked boat?', options: ['The insurance certificate', 'The manufacturer\'s written attestation, with name, address, a description of the craft and the standards used, that the boat meets the Recreational Craft Regulation', 'The registration document from the Small Boat Register', 'The receipt from the dealer'], answer: 1, explanation: 'The declaration of conformity is the manufacturer\'s own attestation that the craft satisfies the regulation; it names the manufacturer, describes the craft and lists the standards it was built to.', difficulty: 2, part: 2, tags: ['ce'] },
      { id: 'engine-58', q: 'Which statement about boat insurance in Norway is correct?', options: ['Liability insurance is compulsory for every motorboat, like for cars', 'Insurance is compulsory only for boats over 8 m', 'Boat insurance is not required by law, but liability insurance is strongly recommended because you can be held liable for damage your boat causes', 'Boats cannot be insured for liability'], answer: 2, explanation: 'There is no legal duty to insure a recreational boat in Norway. Liability (third-party) insurance covers damage to other people, boats and quays; hull insurance adds your own boat. Owner and operator are both responsible for the boat (F88).', difficulty: 2, part: 1, tags: ['insurance'] },
      // --- pollution: oil, garbage, antifouling, alien species (F57–F62, F68–F70) ---
      { id: 'engine-59', q: 'What do you do with used engine oil and the old oil filter after a service?', options: ['Pour the oil into the bilge sump for the pump to handle', 'Put them in the household rubbish', 'Burn them ashore', 'Deliver them to the marina\'s hazardous-waste point or the municipal recycling station'], answer: 3, explanation: 'Used oil, filters, old fuel, antifreeze, batteries and paint are hazardous waste. Pouring them away breaches section 7 of the Pollution Control Act (F61).', difficulty: 1, part: 1, tags: ['waste'] },
      { id: 'engine-60', q: 'Which of these may be thrown into the sea from a recreational boat in Norwegian waters?', options: ['Food scraps near the coast', 'Paper and cardboard', 'Nothing: the Pollution Control Act forbids all littering and MARPOL Annex V bans all plastics everywhere', 'Biodegradable plastic bags'], answer: 2, explanation: 'Section 28 of the Pollution Control Act forbids dumping or leaving waste that is unsightly or harmful; MARPOL Annex V applies to pleasure craft and bans all plastics everywhere. Nothing goes overboard (F58, F59).', difficulty: 1, part: 1, tags: ['garbage'] },
      { id: 'engine-61', q: 'Your fuel tank splits and diesel is leaking into the harbour. Besides stopping and containing the leak, how do you report it?', options: ['Ring the emergency number 110, which alerts the Coastal Administration', 'Send an e-mail to the municipality next week', 'No report is needed for diesel', 'Ring 113'], answer: 0, explanation: 'Acute pollution must be reported at once. The Norwegian Coastal Administration instructs: ring 110 (fire service), which alerts its duty team; at sea you can also report via the coast radio (F62).', difficulty: 2, part: 1, tags: ['spill'] },
      { id: 'engine-62', q: 'You find an oil film in the bilge. The correct action is to:', options: ['Pump it overboard well away from the harbour', 'Add dish soap so it disperses, then pump', 'Ignore it; small films are allowed', 'Soak it up with absorbent pads and dispose of them as hazardous waste'], answer: 3, explanation: 'Any discharge of oil is prohibited (Pollution Control Act s. 7), and detergent only spreads it. Keep absorbent pads in the bilge so the automatic pump never discharges oil (F57, F60).', difficulty: 1, part: 1, tags: ['oil'] },
      { id: 'engine-63', q: 'You are going to scrape and pressure-wash old antifouling off your hull. Where and how?', options: ['On the beach at low tide, so the sea rinses the dust away', 'On a hardstanding with the dust and wash-water collected and delivered as hazardous waste', 'In the water, by diving and scrubbing', 'Anywhere, as long as the paint is copper-based'], answer: 1, explanation: 'Antifouling residue contains copper and other biocides. Washing it into the sea is a prohibited discharge under section 7; collect it on a hardstanding and deliver it as hazardous waste (F69).', difficulty: 2, part: 1, tags: ['antifouling'] },
      { id: 'engine-64', q: 'Before trailing your boat from one lake to another, the Regulation on Alien Organisms requires you to:', options: ['Repaint the hull with antifouling', 'Notify the police', 'Clean and dry the boat, trailer and fishing gear so you do not spread alien organisms', 'Nothing in particular'], answer: 2, explanation: 'Section 24: boats, fishing gear and other equipment used in a watercourse must be cleaned and dried before use in another one. At sea, hull fouling spreads species such as the carpet sea squirt (F70).', difficulty: 2, part: 1, tags: ['alien-species'] },
      { id: 'engine-65', q: 'Which antifouling biocide has been banned internationally (no application since 2003, none on hulls since 2008)?', options: ['Copper oxide', 'Zinc', 'TBT (tributyltin)', 'Silicone'], answer: 2, explanation: 'The IMO Anti-Fouling Systems Convention banned TBT: no application from 1 January 2003 and no TBT coating allowed on hulls from 1 January 2008. Cybutryne followed in 2023 (F68).', difficulty: 3, part: 1, tags: ['antifouling'] },
      // --- sewage (F63–F67) ---
      { id: 'engine-66', q: 'Under the national rule (outside the Oslofjord region), how close to land may a recreational boat discharge toilet waste?', options: ['Anywhere at sea', 'Not closer than 50 m from land', 'Not closer than 300 m from the mainland and islands', 'Not closer than 12 nautical miles'], answer: 2, explanation: 'Regulation on environmental safety for ships, section 10: no sewage discharge closer than 300 m from the mainland and islands, and none in rivers and lakes (F63).', difficulty: 1, part: 1, tags: ['sewage'] },
      { id: 'engine-67', q: 'Since 1 July 2024, what applies to toilet-waste discharge from recreational boats in the Oslofjord region?', options: ['Allowed beyond 300 m from land', 'Allowed beyond 3 nautical miles', 'Allowed at night only', 'Totally prohibited from the Swedish border to the Agder border, side fjords included; use pump-out stations'], answer: 3, explanation: 'The Oslofjord regulation (FOR-2024-05-31-886) bans all sewage discharge from recreational boats in the whole area, including side fjords and the inner Oslofjord; only treatment-plant boats, heritage vessels and emergencies are excepted (F64, F65).', difficulty: 1, part: 1, tags: ['sewage'] },
      { id: 'engine-68', q: 'You cruise with a holding tank from Oslo to Grimstad (Agder). Using the picture, where may you discharge toilet waste?', options: ['Anywhere more than 300 m from land along the whole route', 'Nowhere until you pass the Agder county border; west of it only more than 300 m from mainland and islands and outside any local ban', 'Anywhere in the outer Oslofjord', 'Only more than 12 nautical miles from land'], answer: 1, explanation: 'Oslo to the Agder border is inside the ban area: zero discharge, pump-out stations only. West of the border the national 300 m rule applies, subject to national parks and municipal bans (F63–F66).', illustration: () => illSewage(), difficulty: 3, part: 1, tags: ['sewage', 'scenario', 'picture'] },
      { id: 'engine-69', q: 'The MARPOL Annex IV distances of 3 and 12 nautical miles for sewage apply to:', options: ['All Norwegian recreational boats', 'Large ships; the Norwegian small-craft rule is 300 m (zero in the Oslofjord region)', 'Boats with holding tanks only', 'Boats in national parks'], answer: 1, explanation: 'MARPOL Annex IV governs ships: untreated sewage beyond 12 nm, treated beyond 3 nm. The 300 m rule for Norwegian recreational boats is a national rule, and the Oslofjord has a total ban (F67).', difficulty: 3, part: 1, tags: ['sewage'] },
      { id: 'engine-70', q: 'What is the rule for emptying a boat\'s septic tank inside Faerder National Park?', options: ['Allowed more than 300 m from land', 'Allowed in the outer part of the park', 'Prohibited everywhere in the park; use the pump-out stations in the harbours', 'Allowed at anchor overnight'], answer: 2, explanation: 'Faerder National Park: emptying boat septic tanks is prohibited in the park; pump-out stations are provided in the guest harbours. The park also lies inside the Oslofjord ban area (F66).', difficulty: 2, part: 1, tags: ['sewage', 'national-park'] },
      // --- noise, wash, wildlife, protected areas, access (F71–F82) ---
      { id: 'engine-71', q: 'In the picture a motorboat approaches a beach where people are swimming. What is the maximum speed inside the dashed circle?', options: ['3 knots', '5 knots', '8 knots', '10 knots'], answer: 1, explanation: 'Speed regulation section 3: no more than 5 knots within 50 m of places where bathing is in progress or of public bathing-area buoys; inside the buoys no motor or sail and no anchoring (F72).', illustration: () => illBathing({ quiz: true }), difficulty: 1, part: 2, tags: ['speed', 'picture'] },
      { id: 'engine-72', q: 'Inside the yellow marker buoys of a public bathing area you may:', options: ['Pass at 5 knots', 'Anchor, but not use the engine', 'Neither move with motor or sail nor anchor', 'Use an electric motor only'], answer: 2, explanation: 'Section 3 of the speed regulation: within the marker buoys of a bathing area it is forbidden to anchor or to move with a motor- or sail-driven vessel (F72).', difficulty: 2, part: 2, tags: ['speed'] },
      { id: 'engine-73', q: 'What is the simplified fine (2026) for exceeding 5 knots within 50 m of bathers?', options: ['NOK 900', 'NOK 2,000', 'NOK 5,000', 'NOK 8,900'], answer: 2, explanation: 'The simplified-fine regulation sets NOK 5,000 for breaking the bather rule or a posted local speed limit. NOK 900 is the flotation fine for one person (F73).', difficulty: 3, part: 2, tags: ['fine'] },
      { id: 'engine-74', q: 'The speed regulation\'s general duty (section 2) requires you to:', options: ['Never exceed 5 knots anywhere near the shore', 'Adapt your speed so that wash or other effects cause no danger, damage or nuisance to people, vessels, quays, fish farms, shorelines, wildlife or birds', 'Keep at least 100 m from all other boats', 'Sound your horn before passing a quay'], answer: 1, explanation: 'Section 2 is a general duty of care about wash and other effects, independent of any posted limit. The 5-knot figure is the specific bather rule in section 3 (F71).', difficulty: 2, part: 2, tags: ['wash'] },
      { id: 'engine-75', q: 'Using the picture, on 1 June a sea-bird reserve in Faerder National Park is:', options: ['Open; you may land but not light a fire', 'Closed on land only; kayaks may paddle along the shore', 'Open for landing before 10 in the morning', 'Closed on land and within 50 m of the shore to all boats, kayaks, paddleboards and divers until 15 July'], answer: 3, explanation: 'Faerder\'s bird zones are closed from 15 April to 15 July, including a 50 m belt of sea. Other reserves may have other dates, so read the sign (F75).', illustration: () => illBirds({ quiz: true }), difficulty: 2, part: 1, tags: ['bird-reserve', 'picture'] },
      { id: 'engine-76', q: 'Outside any protected area you see seals on a skerry. May you drive the boat close to make them jump into the water?', options: ['Yes, outside protected areas wildlife is not protected', 'Yes, if you stay above 5 knots', 'No: the Nature Diversity Act forbids unnecessary disturbance and chasing of wild animals everywhere', 'Only in winter'], answer: 2, explanation: 'Nature Diversity Act section 15: unnecessary harm, suffering and chasing of wild animals must be avoided in every activity, protected area or not. Slow down and never drive between a seal and the water (F74, F76).', difficulty: 2, part: 1, tags: ['wildlife'] },
      { id: 'engine-77', q: 'May you use a personal watercraft (jet ski) inside Faerder or Ytre Hvaler national parks?', options: ['Yes, at up to 5 knots', 'Yes, outside the bird zones', 'No, personal watercraft are banned in the whole of both parks', 'Only with a high-speed certificate'], answer: 2, explanation: 'Both park regulations prohibit the use of personal watercraft throughout the park (F77).', difficulty: 2, part: 1, tags: ['national-park'] },
      { id: 'engine-78', q: 'You land on an island in a national park on a June evening and want a barbecue. Which is correct?', options: ['Light it on the bare rock, which cannot burn', 'A fire or barbecue is allowed, but never on bare rock, and the national open-fire ban near forest and uncultivated land (15 April to 15 September) applies on islands too', 'Fires are always forbidden in national parks', 'Fires are allowed anywhere in June'], answer: 1, explanation: 'Faerder allows fires and barbecues but never on bare rock, which cracks from the heat; nationally open fire in or near forest and uncultivated land is forbidden 15 April to 15 September unless it obviously cannot spread. Garbage is never left or burned (F78).', difficulty: 2, part: 1, tags: ['national-park', 'fire'] },
      { id: 'engine-79', q: 'Under the Outdoor Recreation Act, which of these may you do without asking the owner?', options: ['Tie up to a private jetty for the night', 'Land briefly on an uncultivated shore and bathe there', 'Pitch a tent 50 m from an inhabited cabin', 'Moor to a private jetty if nobody is using it'], answer: 1, explanation: 'Section 7: brief landing on uncultivated land and use of rings and bolts is free, but a quay or jetty needs the owner\'s or user\'s consent; section 9: a tent must be at least 150 m from an inhabited house or cabin (F80, F81).', difficulty: 2, part: 2, tags: ['right-to-roam'] },
      { id: 'engine-80', q: 'How far from an inhabited house or cabin must you pitch a tent on uncultivated land, and for how long may it stay without permission?', options: ['50 m, one night', '100 m, one week', '150 m, up to two days', '300 m, unlimited'], answer: 2, explanation: 'Outdoor Recreation Act section 9: at least 150 m from an inhabited house or cabin, and no more than two days in one place without the owner\'s permission (F81).', difficulty: 2, part: 2, tags: ['right-to-roam'] },
    ],
  });
})();
