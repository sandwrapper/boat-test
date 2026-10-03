/* Skipper Prep — "Sea marks and lights" trainer.
   Multiple-choice drill built on BOAT.trainerKit.drill. Seven families of rounds rotate:
     (a) name     — a mark (buoy, Norwegian spar or fixed perch) → "which mark is this?"; spar pictures may
                    instead ask which topmark the mark would carry
     (b) pass     — a mark → "on which side do you pass it / where is the safe water?" (+ odd/even numbering)
     (c) rhythm   — a light rhythm timeline at night → "which mark?"; or → "what is this character called?"
     (d) chart    — an INT1 chart symbol → its meaning
     (e) sector   — a sector-light scenario → "the light turns red: what do you do?" and the sector rules
     (f) decode   — a chart light description such as "Fl(3) WRG 15s 21m 15-11M" → what one token means
     (g) pointer  — a Norwegian pole with a pointer arm → which side to pass, reflector colours
   Pictures come from the verified illustration library (BOAT.svg.mark / lightRhythm / sectorLight /
   chartSymbol / pointerPole). Those pictures print their own names, light characters and passing rules, so
   every picture is post-processed: the <text> elements that carry the answer are removed, the viewBox is
   cropped to the drawing and the aria-label is replaced by a neutral one.

   Every correct answer is derived from the verified fact sheets and the derivation is written beside the
   data:  M = facts/buoyage-and-marks.md (M-F23 = its fact F23),  C = facts/charts-and-navigation.md.
   Core derivations used throughout:
     D1  Day identification = colour bands + shape + topmark; night = light colour + rhythm (M-F3).
         Lateral: red can / red light = port-hand, green cone / green light = starboard-hand, any rhythm except
         Fl(2+1) (M-F10, M-F11). Preferred-channel marks: red–green–red + Fl(2+1) R = preferred channel to
         STARBOARD (treat as a port mark); green–red–green + Fl(2+1) G = preferred channel to PORT (treat as a
         starboard mark); not used in Norwegian waters (M-F17, M-F18, M-F19).
         Cardinals: N black over yellow, cones up, VQ/Q; E black–yellow–black, cones base to base, VQ(3)/Q(3);
         S yellow over black, cones down, VQ(6)+LFl/Q(6)+LFl; W yellow–black–yellow, cones point to point,
         VQ(9)/Q(9); all lights white (M-F23–F26). Clock face: 3 = E, 6 = S, 9 = W, N continuous (M-F28).
         Isolated danger: black with red band(s), two black spheres, Fl(2) W (M-F33). Safe water: red/white
         VERTICAL stripes, one red sphere, Iso / Oc / LFl 10s / Mo(A) W (M-F36). Special: yellow, yellow X,
         yellow light with a rhythm not used for white lights, Fl(4) Y typical, Oc Y 2s on fish farms
         (M-F40, M-F41, M-F44). Emergency wreck: blue/yellow vertical stripes, upright yellow cross,
         Al Bu/Y (M-F45).
     D2  Norwegian spars carry no topmark: red spars BLUNT, green spars POINTED (M-F14); cardinal spars black
         at the top (N, E) POINTED, yellow at the top (S, W) BLUNT (M-F30). On fixed beacons only the topmark
         has meaning (M-F5); Norwegian fixed laterals are white with a red or green band (M-F15).
     D3  Passing: approaching a harbour from seaward IS the direction of buoyage (M-F6), so entering you keep
         red to PORT and green to STARBOARD; leaving (against the direction) the rule reverses (M-F12).
         A cardinal mark is passed on the NAMED side — the safe water lies in that quadrant (M-F20).
         Isolated danger: any side, at a safe distance, the danger is directly beneath (M-F33, M-F34).
         Safe water: navigable water all around (M-F37). Special: marks an area or feature shown on the
         chart, not a channel side (M-F40, M-F42). Wreck buoy: a NEW danger, keep well clear (M-F45).
         Numbering follows the direction of buoyage: even on red, odd on green (M-F9).
     D4  Sector lights (IALA rule, all Norwegian lights converted by 11 Nov 2025, M-F67): heading TOWARDS the
         light in its white sector, GREEN lies to STARBOARD and RED to PORT (M-F64). So the light turning
         GREEN = you drifted to starboard → turn to PORT; turning RED = drifted to port → turn to STARBOARD
         (M-F65). With the light ASTERN the picture is mirrored (M-F66). White = navigable water for the
         vessels expected there, red/green = foul water (M-F62); shoals can still lie in a white sector
         (M-F63). Limits are TRUE bearings from the sea towards the light (M-F70).
     D5  Chart light description "Fl(3) WRG 15s 21m 15-11M": character, colours of the sectors, period
         (one full cycle), elevation above MEAN HIGH WATER, nominal range (white 15 M, green 11 M, red
         between) (M-F97, M-F98, C-F36); nominal range assumes 10 NM visibility (M-F99). Characters:
         F fixed; Oc occulting (light longer than dark); Iso equal; Fl flashing (dark longer than light);
         LFl long flash ≥ 2 s; Q 50–60/min; VQ 100–120/min; Mo(A) Morse; Al alternating (M-F89–F95).
     D6  Pole with a pointer: the arm points TOWARDS navigable water; two arms = passable on both sides
         (M-F50); reflector red = leave to port, green = leave to starboard, white = either side (M-F51);
         pointers can be bent — check the chart (M-F52).
     D7  Chart symbols (INT1): rocks K10–K15 (C-F21–F25), wrecks / foul / obstruction (C-F27), cables and
         pipelines (C-F28), anchorage (C-F30), light flare (C-F33), sector arcs (C-F40), leading line
         (C-F41), direction-of-buoyage arrow (M-F8), colour abbreviations BY/BYB/YB/YBY/BRB/RW/Y (M-F103).
*/
(function () {
  'use strict';
  const B = window.BOAT;
  const S = B.svg;                       // BOAT_SVG: mark, lightRhythm, sectorLight, chartSymbol, pointerPole, svg, text
  const K = B.trainerKit;                // drill, pick, distractors
  const esc = B.esc;
  const dedupe = arr => arr.filter((x, i) => arr.indexOf(x) === i);

  /* ---------- picture post-processing: hide the answers the library prints on its pictures ---------- */
  function stripText(svg, keep) { return svg.replace(/<text\b[^>]*>([\s\S]*?)<\/text>/g, (m, inner) => keep && keep.test(inner.trim()) ? m : ''); }
  function relabel(svg, label) { return svg.replace(/aria-label="[^"]*"/, `aria-label="${esc(label)}"`); }
  // crop the viewBox to the drawing (the stripped captions leave empty bands) and set the stage width
  function reframe(svg, viewBox, width) { return svg.replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`).replace(/^(<svg\b[^>]*?)\swidth="\d+"/, `$1 width="${width}"`); }

  // mark(): 360 × 440 with the name at the top and "Light: … / pass rule" under the water (y ≥ 392); the drawing
  // sits between y ≈ 60 and the water line at 330 (+42 of water).
  function markArt(kind, form, light) {
    let svg = stripText(S.mark(kind, { form: form || 'buoy', light: !!light }));
    svg = svg.replace(/<g opacity="\.7">[\s\S]*?<\/g>/, '');                       // the rock drawn under the isolated danger mark would give it away
    svg = svg.replace(/<line [^>]*stroke="var\(--ink-2\)" stroke-width="1"\/>/, '');  // pointer line to the removed "reflective band" note on spars
    return relabel(reframe(svg, '0 56 360 316', 380), 'A navigation mark on the water: read its colours, shape and topmark');
  }
  // lightRhythm(): 640 × 186; the character and its description are printed at the top (y ≤ 41). The picture
  // uses theme ink for ticks and labels, which would vanish on the dark night stage, so fixed pale colours are
  // substituted (the night stage is #0a1420 in both themes).
  const KEEP_RHYTHM = /^(\d+|seconds|light on|dark \(eclipse\)|one period = \d+ s|continuous \(\d+ s shown\)|steady \(no period\)|white|red|green|yellow|blue)$/;
  function rhythmArt(spec, color) {
    let svg = stripText(S.lightRhythm(spec, color ? { color } : undefined), KEEP_RHYTHM);
    svg = svg.replace(/var\(--ink-2\)/g, '#c3ced8').replace(/var\(--ink\)/g, '#e7edf2').replace(/var\(--muted\)/g, '#93a4b2');
    svg = svg.replace(/fill="#0a1420"\/>/g, 'fill="#0a1420" stroke="#c3ced8" stroke-width="1"/>');   // the "dark" legend swatch needs an edge on the night stage
    return relabel(reframe(svg, '0 48 640 138', 640), 'Night: the rhythm of a light shown as a timeline of one period, light and dark');
  }
  // sectorLight(): 640 × 580 with boat captions ("too far to PORT — turn to starboard") and a legend box at the bottom.
  // Only the colour names, the bearings and the light description stay: "WHITE = fairway" and "foul water" would answer
  // the sector-meaning questions.
  const KEEP_SECTOR = /^(\d{3}°|RED|GREEN|WHITE = fairway|Fl WRG 4s 21m 18-12M)$/;
  function sectorArt() {
    let svg = stripText(S.sectorLight({ preset: 'fairway' }), KEEP_SECTOR).replace('>WHITE = fairway<', '>WHITE<');
    svg = svg.replace(/<rect x="24" y="\d+" width="592"[^>]*\/>/, '');
    return relabel(reframe(svg, '0 0 640 512', 600), 'Plan view of a sector light: a white sector over the fairway, a red sector to the left and a green sector to the right as seen by a boat heading towards the light; limits as true bearings');
  }
  // chartSymbol(): 360 × 250, the symbol on a chart-paper square (x 90–270, y 12–162) with its meaning printed below.
  const KEEP_CHART = /^(\(\d+,\d+\)|Wk|Obstn|Foul|Kabler|Gas|24h|Ldg Lts \d+°|Fl .+|R|G|BY|BYB|YB|YBY|BRB|RW|Y|\d+|\d+,\d+)$/;
  function chartArt(kind) { return relabel(reframe(stripText(S.chartSymbol(kind), KEEP_CHART), '80 2 200 170', 320), 'A chart symbol drawn in INT1 style'); }
  // pointerPole(): 480 × 360 with the passing boats drawn as plan-view hulls (paper fill, ink-2 outline) and captions.
  function poleArt(variant) {
    let svg = stripText(S.pointerPole(variant));
    svg = svg.replace(/<polygon points="[^"]*" fill="var\(--paper\)"[^>]*\/>/g, '').replace(/<polygon points="[^"]*" fill="var\(--ink-2\)"\s*\/>/g, '').replace(/<line [^>]*stroke="var\(--ink-2\)" stroke-width="1\.6"\/>/g, '');
    return relabel(reframe(svg, '100 68 280 224', 420), `An iron pole standing on a rock with ${variant === 'both' ? 'two pointer arms carrying a white reflector' : 'one pointer arm pointing ' + variant + ', carrying a ' + (variant === 'left' ? 'green' : 'red') + ' reflector'}`);
  }
  // A chart light description in large type with one token highlighted (no library helper prints a description alone).
  function descArt(tokens, hi) {
    const size = 30, cw = size * 0.6, gap = cw, totalW = tokens.reduce((a, t) => a + t.length * cw, 0) + gap * (tokens.length - 1);
    let x = (640 - totalW) / 2, inner = `<rect x="16" y="14" width="608" height="118" rx="8" fill="var(--paper)" stroke="var(--line)"/>`;
    inner += `<circle cx="44" cy="74" r="4" fill="var(--ink)"/><path d="M44,71 Q54,60 64,68 Q54,76 44,71 Z" fill="var(--accent)"/>`;   // chart light: position dot + magenta flare
    tokens.forEach((t, i) => {
      const w = t.length * cw;
      if (i === hi) inner += `<rect x="${x - 5}" y="52" width="${w + 10}" height="44" rx="6" fill="var(--shallow)" stroke="var(--accent)" stroke-width="2"/>`;
      inner += `<text x="${x}" y="74" font-size="${size}" font-weight="800" font-family="var(--font-mono)" fill="var(--ink)" text-anchor="start" dominant-baseline="middle" textLength="${w}" lengthAdjust="spacingAndGlyphs">${esc(t)}</text>`;
      x += w + gap;
    });
    inner += S.text(320, 118, 'light description as printed beside the light on the chart', { size: 11.5, fill: 'var(--muted)' });
    return S.svg(640, 140, inner, { label: `Chart light description ${tokens.join(' ')} with the part "${tokens[hi]}" highlighted` });
  }

  /* ---------- the marks: names, descriptions, confusable neighbours (D1, D2) ---------- */
  const KINDS = ['lateral-port', 'lateral-starboard', 'preferred-starboard', 'preferred-port', 'cardinal-n', 'cardinal-e', 'cardinal-s', 'cardinal-w', 'isolated-danger', 'safe-water', 'special', 'wreck'];
  const NAME = {
    'lateral-port': 'Port-hand lateral mark', 'lateral-starboard': 'Starboard-hand lateral mark',
    'preferred-starboard': 'Preferred channel to starboard (red–green–red)', 'preferred-port': 'Preferred channel to port (green–red–green)',
    'cardinal-n': 'North cardinal mark', 'cardinal-e': 'East cardinal mark', 'cardinal-s': 'South cardinal mark', 'cardinal-w': 'West cardinal mark',
    'isolated-danger': 'Isolated danger mark', 'safe-water': 'Safe water (centre fairway) mark', special: 'Special mark', wreck: 'Emergency wreck marking buoy',
  };
  // What identifies each mark by day and by night — the explanation of every name/rhythm round (D1).
  const WHY = {
    'lateral-port': 'RED, can-shaped (or a single red can topmark), red light with any rhythm except Fl(2+1): a port-hand lateral mark (IALA R1001 Table 1; Norwegian Coastal Administration guideline §2.2).',
    'lateral-starboard': 'GREEN, conical (or a single green cone topmark, point up), green light with any rhythm except Fl(2+1): a starboard-hand lateral mark (IALA R1001 Table 1; Norwegian Coastal Administration guideline §2.2).',
    'preferred-starboard': 'Red with one broad GREEN band, red can topmark, red light Fl(2+1): "preferred channel to starboard" — treat it as a PORT-hand mark to follow the main channel (IALA R1001 Table 3). Not used in Norwegian waters (INT1 Q130).',
    'preferred-port': 'Green with one broad RED band, green cone topmark, green light Fl(2+1): "preferred channel to port" — treat it as a STARBOARD-hand mark to follow the main channel (IALA R1001 Table 3). Not used in Norwegian waters (INT1 Q130).',
    'cardinal-n': 'BLACK over YELLOW, two black cones points UP, white light VQ or Q (continuous): a NORTH cardinal mark — the cones point towards the black band, i.e. up (IALA R1001 Table 5).',
    'cardinal-e': 'BLACK–YELLOW–BLACK, two black cones base to base (an "egg"), white light VQ(3) 5s or Q(3) 10s: an EAST cardinal mark — clock face 3 o\'clock (IALA R1001 Table 5).',
    'cardinal-s': 'YELLOW over BLACK, two black cones points DOWN, white light VQ(6)+LFl 10s or Q(6)+LFl 15s: a SOUTH cardinal mark — clock face 6 o\'clock, the long flash stops 6 being mistaken for 3 or 9 (IALA R1001 Table 6).',
    'cardinal-w': 'YELLOW–BLACK–YELLOW, two black cones point to point (a "wineglass"), white light VQ(9) 10s or Q(9) 15s: a WEST cardinal mark — clock face 9 o\'clock (IALA R1001 Table 6).',
    'isolated-danger': 'BLACK with one or more broad RED horizontal bands, two black spheres, white light Fl(2): an isolated danger mark — the danger is directly beneath it, navigable water all around (IALA R1001 Table 7).',
    'safe-water': 'RED and WHITE VERTICAL stripes (the only mark with vertical red/white stripes), one red sphere, white light Iso, Oc, LFl 10s or Mo(A): a safe water mark — navigable water all around (IALA R1001 Table 8).',
    special: 'YELLOW with a yellow X topmark and a yellow light whose rhythm is not one used for white lights (Fl(4) Y is typical in Norway; Oc Y 2s on fish farms): a special mark for an area or feature shown on the chart (IALA R1001 Table 9; Norwegian Coastal Administration §6).',
    wreck: 'BLUE and YELLOW vertical stripes, an upright yellow cross (+, not an X), light alternating 1 s blue / 1 s yellow: the emergency wreck marking buoy for a NEW danger (IALA R1001 Table 11).',
  };
  // Norwegian spars without a topmark: the top shape (D2, M-F14, M-F30). Only these six are documented.
  const SPAR_TOP = { 'lateral-port': 'blunt', 'lateral-starboard': 'pointed', 'cardinal-n': 'pointed', 'cardinal-e': 'pointed', 'cardinal-s': 'blunt', 'cardinal-w': 'blunt' };
  const SPAR_WHY = 'Norwegian spar buoys carry no topmark: read the colours and the top — red laterals are BLUNT, green laterals POINTED; cardinals black at the top (N, E) are POINTED, yellow at the top (S, W) BLUNT (the Norwegian Pilot).';
  const PERCH_WHY = 'On a fixed mark only the topmark has meaning, not the body (INT1 Q130); Norwegian fixed lateral marks are white with a red (port) or green (starboard) band (Norwegian Coastal Administration guideline §2.2).';
  // Marks that look alike or share a feature — two of these are always among the distractors.
  const CONFUSE = {
    'lateral-port': ['lateral-starboard', 'preferred-starboard', 'special'], 'lateral-starboard': ['lateral-port', 'preferred-port', 'special'],
    'preferred-starboard': ['lateral-port', 'preferred-port', 'isolated-danger'], 'preferred-port': ['lateral-starboard', 'preferred-starboard', 'lateral-port'],
    'cardinal-n': ['cardinal-s', 'cardinal-e', 'cardinal-w'], 'cardinal-e': ['cardinal-w', 'cardinal-n', 'cardinal-s'], 'cardinal-s': ['cardinal-n', 'cardinal-w', 'cardinal-e'], 'cardinal-w': ['cardinal-e', 'cardinal-s', 'cardinal-n'],
    'isolated-danger': ['safe-water', 'cardinal-e', 'preferred-starboard'], 'safe-water': ['isolated-danger', 'lateral-port', 'wreck'],
    special: ['safe-water', 'lateral-starboard', 'wreck'], wreck: ['special', 'safe-water', 'isolated-danger'],
  };
  function nameChoices(kind) {
    let pool = B.shuffle(CONFUSE[kind]).slice(0, 2);
    pool = pool.concat(B.shuffle(KINDS.filter(k => k !== kind && !pool.includes(k))).slice(0, 1));
    const d = K.distractors(pool.concat([kind]), kind, 3);
    return { choices: d.choices.map(k => NAME[k]), answer: d.answer };
  }
  // Which forms the library can draw for each kind (preferred-channel marks: buoy only; wreck buoy: no perch).
  const FORMS_FOR = k => k.startsWith('preferred') ? ['buoy'] : k === 'wreck' ? ['buoy', 'spar'] : ['buoy', 'spar', 'perch'];
  // Topmarks (D1): IALA Tables 1, 3, 5–9, 11.
  const TOPMARK = {
    'lateral-port': 'A single red can (cylinder)', 'lateral-starboard': 'A single green cone, point up',
    'preferred-starboard': 'A single red can (cylinder)', 'preferred-port': 'A single green cone, point up',
    'cardinal-n': 'Two black cones, both points UP', 'cardinal-e': 'Two black cones, base to base', 'cardinal-s': 'Two black cones, both points DOWN', 'cardinal-w': 'Two black cones, point to point',
    'isolated-danger': 'Two black spheres, one above the other', 'safe-water': 'One red sphere', special: 'A yellow X (diagonal cross)', wreck: 'An upright yellow cross (+)',
  };
  const TOPMARKS = dedupe(Object.values(TOPMARK));

  /* ---------- (a) name rounds ---------- */
  function nameRound() {
    const kind = K.pick(KINDS), form = K.pick(FORMS_FOR(kind)), light = Math.random() < 0.35;
    if (form === 'spar' && Math.random() < 0.4) {
      // topmark question on a spar (which has none): the learner must know the IALA topmark from the colours (D1, D2)
      const d = K.distractors(TOPMARKS, TOPMARK[kind], 3);
      return { key: 'at:' + kind, art: markArt(kind, form, light), prompt: 'This Norwegian spar buoy has no topmark. Which topmark would this type of mark carry?', hint: 'Day · topmark', choices: d.choices, answer: d.answer,
        explain: `${NAME[kind]}: ${WHY[kind]} ${SPAR_WHY}` };
    }
    const c = nameChoices(kind);
    const extra = form === 'spar' ? ' ' + SPAR_WHY + (SPAR_TOP[kind] ? ` This spar has a ${SPAR_TOP[kind].toUpperCase()} top.` : '') : form === 'perch' ? ' ' + PERCH_WHY : '';
    return { key: 'a:' + kind + form, art: markArt(kind, form, light), prompt: form === 'perch' ? 'Which mark is this fixed perch?' : form === 'spar' ? 'Which mark is this spar buoy?' : 'Which mark is this?', hint: 'Day · name the mark', choices: c.choices, answer: c.answer, explain: WHY[kind] + extra };
  }

  /* ---------- (b) pass rounds (D3) ---------- */
  const SIDE = {
    port: 'Leave it on my PORT (left) side', stbd: 'Leave it on my STARBOARD (right) side',
    either: 'Either side, at a safe distance — the danger lies directly beneath the mark',
    around: 'Either side — it marks NO danger: navigable water all around (centre-fairway / mid-channel mark)',
    N: 'Pass NORTH of it — the safe water lies to the north', E: 'Pass EAST of it — the safe water lies to the east',
    S: 'Pass SOUTH of it — the safe water lies to the south', W: 'Pass WEST of it — the safe water lies to the west',
    special: 'It marks a special area or feature shown on the chart, not a side of the channel — check the chart',
    wreck: 'Keep well clear — it marks a NEW danger (a wreck) that may not be on your chart yet',
  };
  const ENTER = 'You are ENTERING harbour from the open sea, i.e. travelling in the direction of buoyage. On which side do you leave this mark?';
  const LEAVE = 'You are LEAVING harbour towards the open sea, i.e. travelling AGAINST the direction of buoyage. On which side do you leave this mark?';
  const WHERE = 'On which side of this mark is the safe water — where do you pass it?';
  const HOW = 'How do you pass this mark?';
  const PR = (kind, prompt, answer, traps, explain) => ({ kind, prompt, answer, traps, explain });
  const PASS = [
    // Entering = direction of buoyage (M-F6); red to port, green to starboard (M-F12); reversed when leaving (M-F12).
    PR('lateral-port', ENTER, 'port', ['stbd', 'around'], 'Approaching a harbour from seaward is the direction of buoyage (IALA §2.1.1.1). In that direction a RED port-hand mark is kept on your PORT side: "red to port when returning" in IALA Region A (Norwegian Coastal Administration guideline §2.1).'),
    PR('lateral-port', LEAVE, 'stbd', ['port', 'around'], 'Leaving harbour you travel AGAINST the direction of buoyage, so the lateral rule reverses: the RED mark is now left on your STARBOARD side (Norwegian Coastal Administration guideline §2.1; IALA §2.1.1.1).'),
    PR('lateral-starboard', ENTER, 'stbd', ['port', 'around'], 'Entering from seaward is the direction of buoyage (IALA §2.1.1.1); a GREEN starboard-hand mark is kept on your STARBOARD side (Norwegian Coastal Administration guideline §2.1).'),
    PR('lateral-starboard', LEAVE, 'port', ['stbd', 'around'], 'Leaving harbour you travel against the direction of buoyage, so the GREEN mark is left on your PORT side (Norwegian Coastal Administration guideline §2.1).'),
    // Preferred channel marks (M-F17, M-F18): treat as the mark of the dominant colour.
    PR('preferred-starboard', 'At a channel junction, travelling in the direction of buoyage, you want to follow the MAIN (preferred) channel. On which side do you leave this mark?', 'port', ['stbd', 'around'], 'Red with a green band and Fl(2+1) R means "preferred channel to STARBOARD": the main channel lies to starboard of the mark, so you treat it as a PORT-hand mark and leave it to port (IALA R1001 Table 3). Not used in Norway (INT1 Q130).'),
    PR('preferred-port', 'At a channel junction, travelling in the direction of buoyage, you want to follow the MAIN (preferred) channel. On which side do you leave this mark?', 'stbd', ['port', 'around'], 'Green with a red band and Fl(2+1) G means "preferred channel to PORT": the main channel lies to port of the mark, so you treat it as a STARBOARD-hand mark and leave it to starboard (IALA R1001 Table 3). Not used in Norway (INT1 Q130).'),
    // Cardinals: pass on the named side (M-F20); name from colours/topmark (M-F23–F26).
    PR('cardinal-n', WHERE, 'N', ['S', 'E', 'W'], 'Black over yellow with the cones pointing UP is a NORTH cardinal mark. A cardinal mark is placed in the named quadrant of the danger and you pass on the NAMED side: the danger lies south of it, the safe water north (IALA R1001 §2.2.1, Table 5).'),
    PR('cardinal-e', WHERE, 'E', ['W', 'N', 'S'], 'Black–yellow–black with the cones base to base is an EAST cardinal mark: pass EAST of it, the danger lies to its west (IALA R1001 §2.2.1, Table 5).'),
    PR('cardinal-s', WHERE, 'S', ['N', 'E', 'W'], 'Yellow over black with the cones pointing DOWN is a SOUTH cardinal mark: pass SOUTH of it, the danger lies to its north (IALA R1001 §2.2.1, Table 6).'),
    PR('cardinal-w', WHERE, 'W', ['E', 'S', 'N'], 'Yellow–black–yellow with the cones point to point is a WEST cardinal mark: pass WEST of it, the danger lies to its east (IALA R1001 §2.2.1, Table 6).'),
    // Isolated danger (M-F33, M-F34), safe water (M-F36, M-F37), special (M-F40, M-F42), wreck (M-F45).
    PR('isolated-danger', HOW, 'either', ['around', 'N', 'special'], 'Black with a red band and two black spheres: an isolated danger mark, moored on or above the danger itself. Navigable water lies all around, but pass at a safe distance and check the chart — the mark does not show how far the danger extends (IALA R1001 §2.3).'),
    PR('safe-water', HOW, 'around', ['either', 'port', 'special'], 'Red and white vertical stripes with a red sphere: a safe water (centre fairway) mark. It marks no danger — navigable water all around — and is used as a mid-channel, landfall or best-passage-under-a-bridge mark (IALA R1001 §2.4; Norwegian Coastal Administration §5). In a narrow fairway keep to its starboard side (COLREG Rule 9).'),
    PR('special', HOW, 'special', ['around', 'port', 'either'], 'A yellow mark with a yellow X is a special mark: it marks an area or feature shown on the chart — a fish farm, cable, bathing area, anchorage or similar — and says nothing about a channel side. Read the chart for what it marks (IALA R1001 Table 9; Norwegian Coastal Administration §6).'),
    PR('wreck', HOW, 'wreck', ['around', 'special', 'either'], 'Blue and yellow vertical stripes with an upright yellow cross: the emergency wreck marking buoy, placed on a NEW danger until it is charted and permanently marked. Keep well clear and check Notices to Mariners (IALA R1001 §2.6).'),
  ];
  const SIDES = Object.keys(SIDE);
  function passRound() {
    const p = K.pick(PASS);
    let pool = dedupe(B.shuffle(p.traps).slice(0, 2));
    pool = pool.concat(B.shuffle(SIDES.filter(s => s !== p.answer && !pool.includes(s))).slice(0, 3 - pool.length));
    const d = K.distractors(pool.concat([p.answer]), p.answer, 3);
    const form = K.pick(FORMS_FOR(p.kind));
    return { key: 'b:' + p.kind + p.prompt.slice(0, 12), art: markArt(p.kind, form, Math.random() < 0.3), prompt: p.prompt, hint: 'Day · which side?', choices: d.choices.map(s => SIDE[s]), answer: d.answer, explain: p.explain };
  }
  // Numbering: even on red (port), odd on green (starboard), counted in the direction of buoyage (M-F9).
  const NUM = { even: 'An EVEN number (2, 4, 6 …)', odd: 'An ODD number (1, 3, 5 …)', any: 'Any number — the colour alone shows the side', none: 'Lateral marks are never numbered' };
  function numberRound() {
    const kind = K.pick(['lateral-port', 'lateral-starboard']), answer = kind === 'lateral-port' ? 'even' : 'odd';
    const d = K.distractors(Object.keys(NUM), answer, 3);
    return { key: 'bn:' + kind, art: markArt(kind, K.pick(['buoy', 'spar']), false), prompt: 'If this lateral mark carries a number, what kind of number is it?', hint: 'Day · numbering', choices: d.choices.map(k => NUM[k]), answer: d.answer,
      explain: `When lateral marks are numbered the numbers follow the direction of buoyage: EVEN numbers on red port-hand marks, ODD numbers on green starboard-hand marks (IALA §2.1.1.2; Norwegian Coastal Administration guideline §2.2.4). This ${kind === 'lateral-port' ? 'red port-hand' : 'green starboard-hand'} mark therefore carries an ${answer} number.` };
  }

  /* ---------- (c) rhythm rounds at night (D1) ---------- */
  // spec = characteristic as drawn by BOAT.svg.lightRhythm; colour from the mark's light colour.
  const RR = (spec, color, kind, extra) => ({ spec, color, kind, extra: extra || '' });
  const RHYTHMS = [
    RR('VQ', 'W', 'cardinal-n', 'Very quick (100–120/min) or quick (50–60/min) CONTINUOUS white flashes = north, the "12 o\'clock" of the clock face.'),
    RR('Q', 'W', 'cardinal-n', 'Continuous quick white flashes, no group and no pause = north (IALA §2.2.2). Only north has an uninterrupted rhythm.'),
    RR('Q(3) 10s', 'W', 'cardinal-e', 'Three quick flashes then darkness, repeated every 10 s: 3 o\'clock = EAST.'),
    RR('VQ(3) 5s', 'W', 'cardinal-e', 'Three very quick flashes every 5 s: 3 o\'clock = EAST.'),
    RR('Q(6)+LFl 15s', 'W', 'cardinal-s', 'Six quick flashes followed by one LONG flash (≥ 2 s), every 15 s: 6 o\'clock = SOUTH. The long flash is there so that six cannot be miscounted as three or nine (IALA §2.2.2).'),
    RR('VQ(6)+LFl 10s', 'W', 'cardinal-s', 'Six very quick flashes plus a long flash every 10 s: 6 o\'clock = SOUTH.'),
    RR('Q(9) 15s', 'W', 'cardinal-w', 'Nine quick flashes every 15 s: 9 o\'clock = WEST.'),
    RR('VQ(9) 10s', 'W', 'cardinal-w', 'Nine very quick flashes every 10 s: 9 o\'clock = WEST.'),
    RR('Fl(2) 10s', 'W', 'isolated-danger', 'Group flashing TWO white flashes = isolated danger (IALA Table 7). Do not confuse with Fl(2+1), the preferred-channel rhythm, which is red or green.'),
    RR('Fl 5s', 'R', 'lateral-port', 'A RED light (any rhythm except Fl(2+1)) belongs to a port-hand lateral mark (IALA Table 1).'),
    RR('Fl 5s', 'G', 'lateral-starboard', 'A GREEN light (any rhythm except Fl(2+1)) belongs to a starboard-hand lateral mark (IALA Table 1).'),
    RR('Fl(2+1) 10s', 'R', 'preferred-starboard', 'Composite group flashing (2+1) is reserved for preferred-channel marks; RED means "preferred channel to starboard", treated as a port-hand mark (IALA Table 3; not used in Norway, INT1 Q130).'),
    RR('Fl(2+1) 10s', 'G', 'preferred-port', 'Composite group flashing (2+1) is reserved for preferred-channel marks; GREEN means "preferred channel to port", treated as a starboard-hand mark (IALA Table 3; not used in Norway, INT1 Q130).'),
    RR('Fl(4) Y 10s', null, 'special', 'A YELLOW light is a special mark; Fl(4) Y is the typical Norwegian special-mark rhythm (Norwegian List of Lights; IALA Table 9).'),
    RR('Oc Y 2s', null, 'special', 'Yellow occulting, 2 s period (1.25 s light / 0.75 s dark): the light prescribed for the yellow special marks at the outer points of a Norwegian fish farm (FOR-2012-12-19-1329 Annex 2).'),
    RR('Iso 4s', 'W', 'safe-water', 'White ISOPHASE (equal light and dark) is one of the four safe-water rhythms: Iso, Oc, LFl 10s, Mo(A) (IALA Table 8).'),
    RR('Oc 6s', 'W', 'safe-water', 'White OCCULTING (light longer than dark) is one of the four safe-water rhythms: Iso, Oc, LFl 10s, Mo(A) (IALA Table 8).'),
    RR('LFl 10s', 'W', 'safe-water', 'One white LONG flash every 10 s is one of the four safe-water rhythms: Iso, Oc, LFl 10s, Mo(A) (IALA Table 8).'),
    RR('Mo(A) 8s', 'W', 'safe-water', 'White Morse "A" (short–long) is one of the four safe-water rhythms: Iso, Oc, LFl 10s, Mo(A) (IALA Table 8).'),
    RR('Al BuY 3s', null, 'wreck', 'Alternating 1 s BLUE / 1 s YELLOW with 0.5 s darkness between is the emergency wreck marking buoy (IALA Table 11).'),
  ];
  const COLOUR_WORD = { W: 'WHITE', R: 'RED', G: 'GREEN' };
  function rhythmRound() {
    const r = K.pick(RHYTHMS), c = nameChoices(r.kind);
    const col = r.color ? COLOUR_WORD[r.color] : r.spec.startsWith('Al') ? 'BLUE and YELLOW' : 'YELLOW';
    return { key: 'c:' + r.spec + r.color, night: true, art: rhythmArt(r.spec, r.color), prompt: `Night. You see a ${col} light with this rhythm (${r.spec}${r.color ? ' ' + r.color : ''}). Which mark is it?`, hint: 'Night · light rhythm', choices: c.choices, answer: c.answer,
      explain: `${r.extra} ${WHY[r.kind]}` };
  }
  // Character names (D5, M-F89–F95, INT1 P10).
  const CHAR = [
    { spec: 'F', name: 'Fixed (F) — a steady light', why: 'A light that is on all the time is FIXED, F (INT1 P10.1).' },
    { spec: 'Oc 6s', name: 'Occulting (Oc) — light longer than dark', why: 'Mostly light with short dark gaps is OCCULTING, Oc: total light longer than total darkness (INT1 P10.2). The opposite of flashing.' },
    { spec: 'Iso 4s', name: 'Isophase (Iso) — light and dark equal', why: 'Light and dark of equal length is ISOPHASE, Iso (INT1 P10.3).' },
    { spec: 'Fl 5s', name: 'Flashing (Fl) — light shorter than dark', why: 'A short flash and a long eclipse is FLASHING, Fl: total light shorter than total darkness (INT1 P10.4).' },
    { spec: 'Fl(3) 15s', name: 'Group flashing, three flashes — Fl(3)', why: 'Three flashes in a group followed by a long eclipse is GROUP FLASHING, Fl(3) (INT1 P10.4).' },
    { spec: 'LFl 10s', name: 'Long flash (LFl) — a flash of 2 s or more', why: 'A single flash lasting 2 s or more is a LONG FLASH, LFl (INT1 P10.5; IALA §2.2.2).' },
    { spec: 'Q', name: 'Quick (Q) — 50 or 60 flashes per minute', why: 'Continuous flashes at 50–79 (usually 50 or 60) per minute is QUICK, Q (INT1 P10.6).' },
    { spec: 'VQ', name: 'Very quick (VQ) — 100 or 120 flashes per minute', why: 'Continuous flashes at 80–159 (usually 100 or 120) per minute is VERY QUICK, VQ (INT1 P10.7).' },
    { spec: 'Mo(A) 8s', name: 'Morse code letter A — Mo(A)', why: 'A short flash followed by a long one is the Morse letter A (· –), written Mo(A) (INT1 P10.9).' },
    { spec: 'Al WR', name: 'Alternating (Al WR) — colour changes, no eclipse', why: 'A light that changes colour without going dark is ALTERNATING, Al (INT1 P10.11).' },
    { spec: 'Fl(2+1) 10s', name: 'Composite group flashing — Fl(2+1)', why: 'Two flashes, a pause, then one flash is COMPOSITE GROUP FLASHING, Fl(2+1) — the rhythm reserved for preferred-channel marks (INT1 P10.4; IALA Table 3).' },
  ];
  function charRound() {
    const c = K.pick(CHAR);
    const d = K.distractors(CHAR, c, 3, x => x.name);
    return { key: 'cc:' + c.spec, night: true, art: rhythmArt(c.spec), prompt: 'Night. What is this light character called on the chart?', hint: 'Night · light character', choices: d.choices.map(x => x.name), answer: d.answer, explain: c.why };
  }

  /* ---------- (d) chart symbol rounds (D7) ---------- */
  const SYM = {
    'rock-awash': { m: 'Rock awash at chart datum — between chart datum and 0.5 m below it', g: 'rock', why: 'A cross with a dot in each quadrant is a rock AWASH at chart datum, lying between chart datum and 0.5 m below it (INT1 K12).' },
    'rock-submerged': { m: 'Underwater rock of unknown depth, dangerous to surface navigation', g: 'rock', why: 'A plain cross (+) is an underwater rock of unknown depth that is dangerous to surface navigation (INT1 K13). On Norwegian charts a depth of 0.5–9.9 m may be written beside it.' },
    'rock-drying': { m: 'Rock that covers and uncovers (dries) — between chart datum and mean high water', g: 'rock', why: 'The asterisk-like star is a rock that covers and uncovers: it lies between chart datum and mean high water and may show a drying height (INT1 K11).' },
    'rock-above-water': { m: 'Islet or rock always above water — the figure is its height above mean high water', g: 'rock', why: 'A small land outline with a figure in brackets is a rock that never covers; (1,7) is its height in metres above mean high water (INT1 K10).' },
    'wreck-dangerous': { m: 'Dangerous wreck of unknown depth (dotted danger circle)', g: 'wreck', why: 'The wreck symbol inside a dotted danger circle is a wreck of unknown depth that may be dangerous to surface navigation (INT1 K28).' },
    'wreck-non-dangerous': { m: 'Wreck NOT dangerous to surface navigation — at least 20 m of water over it', g: 'wreck', why: 'The wreck symbol without a danger circle is a wreck considered to have at least 20 m of water over it, not dangerous to surface navigation (INT1 K29).' },
    foul: { m: 'Foul ground — not dangerous to surface navigation', g: 'wreck', why: '"Foul" marks foul ground (remains of a wreck, debris): not dangerous to surface navigation, but not a place to anchor (INT1 K31).' },
    obstruction: { m: 'Obstruction (danger circle with "Obstn")', g: 'wreck', why: '"Obstn" inside a dotted danger circle is an obstruction dangerous to navigation (INT1 K40).' },
    light: { m: 'A light — the magenta flare marks a lit aid, the text is its description', g: 'light', why: 'A position dot with a magenta flare is a LIGHT; the description beside it gives character, colour, period, elevation and range (INT1 P1).' },
    'sector-light': { m: 'A sector light — the arcs show the colour sectors', g: 'light', why: 'Arcs around a light are its colour SECTORS; on multicoloured charts the white sector is drawn in yellow and the white sector marks the fairway (INT1 P40–P41).' },
    'leading-line': { m: 'A leading line (leading lights) — solid where it is the track to follow', g: 'nav', why: 'Two lights in line with a bearing is a LEADING LINE; it is drawn solid where it is the track to follow and dashed beyond, with the bearing in degrees true (INT1 P20).' },
    'buoyage-direction': { m: 'The direction of buoyage', g: 'nav', why: 'The magenta arrow with an open head and two circles at the tail shows the DIRECTION OF BUOYAGE, printed where it is not obvious (INT1 Q130.2).' },
    anchorage: { m: 'Anchorage area', g: 'area', why: 'An anchor symbol inside a dashed boundary is an ANCHORAGE area, here limited to 24 hours (INT1 N12).' },
    cable: { m: 'Submarine cable (the zigzags mark a power cable)', g: 'area', why: 'A wavy magenta line is a submarine CABLE; a wavy line with lightning zigzags is a submarine POWER cable (INT1 L30–L31). Do not anchor over cables.' },
    pipeline: { m: 'Submarine pipeline', g: 'area', why: 'A magenta line of long dashes with a dot between them is a PIPELINE, labelled Oil, Gas or Water where known (INT1 L40).' },
    'depth-contour': { m: 'Depth contours (blue tint under 10 m); italic figures are soundings, the circled upright figure a shoal', g: 'nav', why: 'Blue lines are DEPTH CONTOURS and the tint normally covers water shallower than 10 m; ordinary soundings are italic, a shoal depth is upright inside a dotted danger circle (INT1 I30, K14; Norwegian chart conventions).' },
    'beacon-port': { m: 'Fixed port-hand beacon (red can topmark)', g: 'mark', why: 'A fixed beacon with a red can topmark and the letter R is a PORT-hand beacon; on fixed marks only the topmark has meaning (INT1 Q130).' },
    'beacon-starboard': { m: 'Fixed starboard-hand beacon (green cone topmark)', g: 'mark', why: 'A fixed beacon with a green cone topmark and the letter G is a STARBOARD-hand beacon (INT1 Q130).' },
    'buoy-port': { m: 'Port-hand buoy (red, R)', g: 'mark', why: 'A red buoy symbol lettered R is a PORT-hand lateral buoy; Norwegian charts omit topmarks, so the colour letters are what you read (INT1 Q130).' },
    'buoy-starboard': { m: 'Starboard-hand buoy (green, G)', g: 'mark', why: 'A green buoy symbol lettered G is a STARBOARD-hand lateral buoy (INT1 Q130).' },
    'buoy-cardinal-n': { m: 'North cardinal buoy (BY = black over yellow)', g: 'mark', why: 'BY = black over yellow: a NORTH cardinal buoy — pass north of it (INT1 Q130.3).' },
    'buoy-cardinal-e': { m: 'East cardinal buoy (BYB = black–yellow–black)', g: 'mark', why: 'BYB = black, yellow, black: an EAST cardinal buoy — pass east of it (INT1 Q130.3).' },
    'buoy-cardinal-s': { m: 'South cardinal buoy (YB = yellow over black)', g: 'mark', why: 'YB = yellow over black: a SOUTH cardinal buoy — pass south of it (INT1 Q130.3).' },
    'buoy-cardinal-w': { m: 'West cardinal buoy (YBY = yellow–black–yellow)', g: 'mark', why: 'YBY = yellow, black, yellow: a WEST cardinal buoy — pass west of it (INT1 Q130.3).' },
    'buoy-isolated-danger': { m: 'Isolated danger buoy (BRB = black–red–black)', g: 'mark', why: 'BRB = black, red, black: an ISOLATED DANGER buoy — navigable water all around, pass at a safe distance (INT1 Q130.4).' },
    'buoy-safe-water': { m: 'Safe water buoy (RW = red and white)', g: 'mark', why: 'RW = red and white (vertical stripes): a SAFE WATER buoy with navigable water all around (INT1 Q130.5).' },
    'buoy-special': { m: 'Special buoy (Y = yellow)', g: 'mark', why: 'Y = yellow: a SPECIAL buoy marking an area or feature described on the chart (INT1 Q130.6).' },
  };
  const SYM_KEYS = Object.keys(SYM);
  function chartRound() {
    const kind = K.pick(SYM_KEYS), s = SYM[kind];
    let pool = B.shuffle(SYM_KEYS.filter(k => k !== kind && SYM[k].g === s.g)).slice(0, 2);
    pool = pool.concat(B.shuffle(SYM_KEYS.filter(k => k !== kind && !pool.includes(k))).slice(0, 3 - pool.length));
    const d = K.distractors(pool.concat([kind]), kind, 3);
    return { key: 'd:' + kind, art: chartArt(kind), prompt: 'What does this chart symbol mean?', hint: 'Chart symbol', choices: d.choices.map(k => SYM[k].m), answer: d.answer, explain: s.why };
  }

  /* ---------- (e) sector-light rounds (D4) ---------- */
  const SA = {
    toStbd: 'Alter course to STARBOARD until the light shows white again — I have drifted to port',
    toPort: 'Alter course to PORT until the light shows white again — I have drifted to starboard',
    hold: 'Hold my course — white is the fairway sector (but still check the chart for shoals)',
    stop: 'Stop and anchor — a coloured sector means the fairway is closed',
    away: 'Turn away from the light — a coloured sector means I am too close to it',
    fairway: 'Navigable water for the vessels expected there — but shoals can still lie inside it',
    foul: 'Foul (unclean) water — rocks and shoals: get back into the white sector',
    deep: 'Guaranteed deep water over its whole length',
    speed: 'A speed-limited zone around the light',
    bearingsSea: 'As TRUE bearings from the sea towards the light, 0–360° clockwise',
    bearingsLight: 'As bearings from the light towards the sea',
    bearingsMag: 'As magnetic bearings, so that they can be read straight off the steering compass',
    bearingsRel: 'As relative bearings from the fairway centre line',
    green: 'GREEN', red: 'RED', white: 'WHITE', yellow: 'YELLOW',
    noGuarantee: 'No — shoals can occur inside a white sector; read it together with the chart',
    yesGuarantee: 'Yes — the Norwegian Coastal Administration surveys every white sector to be free of shoals',
    yesRange: 'Yes, but only out to the nominal range of the light',
    noSea: 'No — the white sector only shows the direction to the open sea',
    iala: 'The IALA rule: heading towards the light in white, red lies to port and green to starboard',
    oldNo: 'The old Norwegian convention: each light must be read from the chart case by case',
    anyNo: 'There is no rule — the colours vary from light to light',
    mirrorNo: 'The mirrored rule: heading towards the light, green lies to port and red to starboard',
  };
  const TOWARDS = 'You are heading TOWARDS this sector light in the white sector at night.';
  const ER = (q, answer, traps, explain) => ({ q, answer, traps, explain });
  const SECTOR = [
    ER(TOWARDS + ' The light turns RED. What do you do?', 'toStbd', ['toPort', 'hold', 'stop'], 'Heading towards a light in its white sector, RED lies on your PORT side and GREEN on your STARBOARD side (IALA rule applied to all Norwegian sector lights since Nov 2025, Norwegian Coastal Administration guideline §9.2.1). Seeing red means you have strayed to PORT: alter course to STARBOARD until the light is white again.'),
    ER(TOWARDS + ' The light turns GREEN. What do you do?', 'toPort', ['toStbd', 'hold', 'away'], 'Heading towards a light in its white sector, GREEN lies on your STARBOARD side (Norwegian Coastal Administration guideline §9.2.1). Seeing green means you have strayed to STARBOARD: alter course to PORT until the light is white again.'),
    ER(TOWARDS + ' The light stays WHITE. What do you do?', 'hold', ['toStbd', 'toPort', 'stop'], 'The white sector is the navigable fairway for the vessels expected there (Norwegian Coastal Administration; Norwegian List of Lights). Hold your course — but a white sector does not guarantee deep water everywhere, so keep checking the chart.'),
    ER('You are LEAVING the fairway with this sector light ASTERN, in its white sector. The light turns RED. Which way do you turn?', 'toPort', ['toStbd', 'hold', 'stop'], 'With the light ASTERN the picture is mirrored: red now lies on your STARBOARD side and green on your port side (consequence of the IALA rule, Norwegian Coastal Administration §9.2.1). Seeing red means you have drifted to starboard: turn to PORT until the light is white. Think "as if heading towards the light", then mirror.'),
    ER('You are LEAVING the fairway with this sector light ASTERN, in its white sector. The light turns GREEN. Which way do you turn?', 'toStbd', ['toPort', 'hold', 'away'], 'With the light ASTERN the colours are mirrored: green lies on your PORT side. Seeing green means you have drifted to port: turn to STARBOARD until the light is white (Norwegian Coastal Administration §9.2.1, mirrored).'),
    ER('What does the WHITE sector of a Norwegian sector light mean?', 'fairway', ['deep', 'foul', 'speed'], 'The white sector shows navigable water for the vessels expected to use the area; red and green show foul water. But shoals can occur inside a white sector — it must be read together with the chart (Norwegian Coastal Administration; Norwegian List of Lights).'),
    ER('What do the RED and GREEN sectors of a sector light mean?', 'foul', ['fairway', 'speed', 'deep'], 'Red and green sectors mark FOUL (unclean) water — rocks and shoals outside the fairway; only the white sector is the fairway (Norwegian Coastal Administration; Norwegian List of Lights).'),
    ER('How are the limits of the sectors stated on the chart and in the List of Lights?', 'bearingsSea', ['bearingsLight', 'bearingsMag', 'bearingsRel'], 'Sector limits are TRUE bearings taken from the sea towards the light, from 0° (north) clockwise to 360° (Norwegian Coastal Administration guideline §9.2.1; the Norwegian Pilot).'),
    ER(TOWARDS + ' Which colour lies on your STARBOARD side of the white sector?', 'green', ['red', 'yellow', 'white'], 'Under the IALA rule, when you steer towards a light in its white sector the sector on your STARBOARD side is GREEN and the one on your PORT side is RED (Norwegian Coastal Administration guideline §9.2.1; conversion completed 11 Nov 2025).'),
    ER(TOWARDS + ' Which colour lies on your PORT side of the white sector?', 'red', ['green', 'yellow', 'white'], 'Under the IALA rule, when you steer towards a light in its white sector the sector on your PORT side is RED and the one on your STARBOARD side is GREEN (Norwegian Coastal Administration guideline §9.2.1).'),
    ER('Does the white sector guarantee deep water all the way to the light?', 'noGuarantee', ['yesGuarantee', 'yesRange', 'noSea'], 'No. The Norwegian Coastal Administration warns that shoals can occur inside a white sector: the white sector shows clear water only within a limited area and must be read with the chart and the other marks (Norwegian Coastal Administration; Norwegian List of Lights).'),
    ER('Which convention do Norwegian sector lights follow today?', 'iala', ['oldNo', 'anyNo', 'mirrorNo'], 'The Norwegian Coastal Administration converted about 1,800 sector lights to the IALA standard (IALA Guideline 1041) between 2019 and 11 November 2025: heading towards a light in white, red lies to port and green to starboard. Old charts may still show pre-conversion sectors — use updated charts.'),
    ER('Between the red and the green sector of a light there is a narrow band in which the light looks…', 'white', ['red', 'yellow', 'green'], 'Where a red and a green sector meet there is a narrow transition in which the light appears WHITE, and about 2° on every sector boundary where the colour cannot be determined (the Norwegian Pilot; Norwegian List of Lights). Never navigate on a sector boundary.'),
  ];
  const SECTOR_KEYS = Object.keys(SA);
  function sectorRound() {
    const r = K.pick(SECTOR);
    let pool = dedupe(B.shuffle(r.traps).slice(0, 3));
    pool = pool.concat(B.shuffle(SECTOR_KEYS.filter(k => k !== r.answer && !pool.includes(k))).slice(0, 3 - pool.length));
    const d = K.distractors(pool.concat([r.answer]), r.answer, 3);
    return { key: 'e:' + r.answer + r.q.slice(0, 20), art: sectorArt(), prompt: r.q, hint: 'Sector light', choices: d.choices.map(k => SA[k]), answer: d.answer, explain: r.explain };
  }

  /* ---------- (f) light description rounds (D5) ---------- */
  const DCHAR = [
    { tok: 'Fl(3)', m: 'Group flashing — three flashes in each group, then a longer eclipse', why: 'Fl(3) is GROUP FLASHING with three flashes per group; the light is dark longer than it is lit (INT1 P10.4).' },
    { tok: 'Fl', m: 'Flashing — one flash, dark longer than light', why: 'Fl is FLASHING: a single flash, total darkness longer than total light (INT1 P10.4).' },
    { tok: 'Oc', m: 'Occulting — a steady light briefly cut off, light longer than dark', why: 'Oc is OCCULTING: light longer than darkness, the opposite of flashing (INT1 P10.2).' },
    { tok: 'Iso', m: 'Isophase — light and dark of equal length', why: 'Iso is ISOPHASE: equal periods of light and darkness (INT1 P10.3).' },
    { tok: 'LFl', m: 'Long flash — a flash of 2 s or more', why: 'LFl is a LONG FLASH of 2 s or more (INT1 P10.5).' },
    { tok: 'Q', m: 'Quick — 50 or 60 flashes per minute', why: 'Q is QUICK flashing, 50–79 (usually 50 or 60) flashes per minute (INT1 P10.6).' },
    { tok: 'Oc(2)', m: 'Group occulting — two short eclipses in each group', why: 'Oc(2) is GROUP OCCULTING: a steady light with two short eclipses per period (INT1 P10.2).' },
  ];
  const DCOL = [
    { tok: 'WRG', m: 'The light shows white, red and green sectors', why: 'WRG lists the colours of the light\'s SECTORS: white, red and green (INT1 P11, P16).' },
    { tok: 'WR', m: 'The light shows white and red sectors', why: 'WR lists the colours of the light\'s sectors: white and red (INT1 P11).' },
    { tok: 'W', m: 'A white light (all round, no coloured sectors)', why: 'W is a WHITE light with no coloured sectors (INT1 P11).' },
    { tok: 'R', m: 'A red light', why: 'R is a RED light (INT1 P11).' },
  ];
  const COL_TRAPS = ['An alternating light that changes colour over time', 'The colours of the tower by day (its daymark), not of the light', 'Three separate lights on the same structure', 'The colour of the light seen from west, right and green… the letters are just a name'];
  const PER_TRAPS = s => [`Each flash lasts ${s} s`, `The light is lit for ${s} s and then switched off for the night`, `The darkness between two flashes lasts ${s} s`, `The light can be seen for ${s} s after you pass it`];
  const ELEV_TRAPS = m => [`${m} m above chart datum (LAT)`, `${m} m above highest astronomical tide (HAT)`, `The tower is ${m} m tall, measured from the ground`, `The light stands ${m} m from the shoreline`];
  function descRound() {
    const ch = K.pick(DCHAR), col = K.pick(DCOL), per = K.pick([4, 5, 6, 8, 10, 12, 15]), elev = 5 + Math.floor(Math.random() * 36);
    const hi = 8 + Math.floor(Math.random() * 11), lo = Math.max(3, hi - 3 - Math.floor(Math.random() * 5));
    const multi = col.tok.length > 1, range = multi ? `${hi}-${lo}M` : `${hi}M`;
    const tokens = [ch.tok, col.tok, `${per}s`, `${elev}m`, range];
    const which = K.pick(['char', 'col', 'per', 'elev', 'range', 'nominal']);
    const hiIdx = { char: 0, col: 1, per: 2, elev: 3, range: 4, nominal: 4 }[which];
    const art = descArt(tokens, hiIdx), base = `A chart shows "${tokens.join(' ')}" beside a light.`;
    let answer, pool, prompt, explain;
    if (which === 'char') { answer = ch.m; pool = B.shuffle(DCHAR.filter(x => x !== ch).map(x => x.m)).slice(0, 3); prompt = `${base} What does "${ch.tok}" mean?`; explain = ch.why; }
    else if (which === 'col') { answer = col.m; pool = B.shuffle(DCOL.filter(x => x !== col).map(x => x.m).slice(0, 1).concat(B.shuffle(COL_TRAPS).slice(0, 2))); prompt = `${base} What does "${col.tok}" mean?`; explain = col.why + (multi ? ' On the chart the sectors are drawn as arcs around the light; the white sector marks the fairway (INT1 P40–P41).' : ''); }
    else if (which === 'per') { answer = `The period: one full cycle of light and darkness takes ${per} s`; pool = B.shuffle(PER_TRAPS(per)).slice(0, 3); prompt = `${base} What does "${per}s" mean?`; explain = `"${per}s" is the PERIOD — the time for one complete cycle of flashes and eclipses before the pattern repeats (INT1 P12). Count the seconds between the starts of two groups to identify the light.`; }
    else if (which === 'elev') { answer = `The elevation: the light is ${elev} m above MEAN HIGH WATER`; pool = B.shuffle(ELEV_TRAPS(elev)).slice(0, 3); prompt = `${base} What does "${elev}m" mean?`; explain = `"${elev}m" is the ELEVATION of the light above MEAN HIGH WATER (INT1 P13, P16). Not chart datum (which is used for depths) and not HAT (which is used for bridge and cable clearances).`; }
    else if (which === 'range') {
      answer = multi ? (col.tok === 'WRG' ? `Nominal range: white ${hi} M, green ${lo} M, red between ${hi} and ${lo} M` : `Nominal range: white ${hi} M, red ${lo} M`) : `Nominal range ${hi} nautical miles`;
      pool = multi ? [`The light is visible at ${lo} to ${hi} M depending on the weather`, `Range ${hi} M by day and ${lo} M by night`, `The light is ${hi} m high and ${lo} m wide`, col.tok === 'WRG' ? `Nominal range: white ${lo} M, green ${hi} M, red between` : `Nominal range: white ${lo} M, red ${hi} M`] : [`The light is visible from ${hi} m above the sea`, `The light is ${hi} km from the fairway`, `Range ${hi} M, by day only`, `Period ${hi} minutes`];
      pool = B.shuffle(pool).slice(0, 3); prompt = `${base} What does "${range}" mean?`;
      explain = multi ? `"${range}" is the NOMINAL RANGE in nautical miles for each colour: ${col.tok === 'WRG' ? `white ${hi} M, green ${lo} M and red between ${hi} and ${lo} M` : `white ${hi} M and red ${lo} M`} (INT1 P14, P16 — "15-11M: white 15 M, green 11 M, red between 15 and 11 M").` : `"${range}" is the NOMINAL RANGE of the light: ${hi} nautical miles in a meteorological visibility of 10 NM (INT1 P14; the Norwegian Pilot).`;
    }
    else { answer = 'The range in a meteorological visibility of 10 nautical miles — not a promise of how far you will actually see it'; pool = ['The greatest distance at which the light has ever been seen', 'The distance at which the light disappears below the horizon for an eye height of 5 m', 'The distance to the nearest shoal in the white sector']; prompt = `${base} What is the "nominal" range given on the chart?`; explain = 'Charted ranges are NOMINAL ranges: the range in a meteorological visibility of 10 nautical miles. Fog, haze and snow reduce it; the geographical range (horizon) is a separate figure in the List of Lights, computed for an eye height of 5 m (the Norwegian Pilot; Norwegian List of Lights).'; }
    const d = K.distractors(pool.concat([answer]), answer, 3);
    return { key: 'f:' + which, art, prompt, hint: 'Chart · light description', choices: d.choices, answer: d.answer, explain };
  }

  /* ---------- (g) pointer-pole rounds (D6) ---------- */
  const PA = {
    left: 'To the LEFT of the pole — the arm points towards navigable water', right: 'To the RIGHT of the pole — the arm points towards navigable water',
    both: 'Either side — two arms with a white reflector mean the mark can be passed on both sides',
    atRock: 'On the side AWAY from the arm — the arm points at the shallow water', none: 'Do not pass — a pole with an arm marks a closed area', current: 'On the side the current sets — the arm shows the current',
    keepPort: 'Keep the pole on my PORT side when travelling in the direction of buoyage', keepStbd: 'Keep the pole on my STARBOARD side when travelling in the direction of buoyage',
    keepEither: 'The pole can be passed on either side', keepNight: 'The reflector colour only tells me the pole is lit at night',
    trustNo: 'No — pointers can be bent by ice or collisions; always check the chart', trustYes: 'Yes — the Norwegian Coastal Administration inspects every pointer each spring', trustDay: 'Only by day; at night use the reflector instead', trustGps: 'Only if the GPS position agrees',
  };
  const PA_KEYS = Object.keys(PA);
  const POLE = [
    { v: 'left', q: 'The arm on this pole points to the LEFT. On which side of the pole do you pass?', answer: 'left', traps: ['atRock', 'right', 'current'], explain: 'A pole with a pointer has an arm that points TOWARDS navigable water, never towards the rock (Norwegian Coastal Administration guideline §11.2.1; the Norwegian Pilot). The arm points left, so pass on the left of the pole.' },
    { v: 'right', q: 'The arm on this pole points to the RIGHT. On which side of the pole do you pass?', answer: 'right', traps: ['atRock', 'left', 'none'], explain: 'The pointer arm points TOWARDS navigable (deep) water (Norwegian Coastal Administration guideline §11.2.1). The arm points right, so pass on the right of the pole.' },
    { v: 'both', q: 'This pole has an arm to each side and a WHITE reflector. How do you pass it?', answer: 'both', traps: ['left', 'right', 'none'], explain: 'Where a mark can be passed on both sides it carries TWO arms, one to each side, and a WHITE reflector means "may be passed on either side" (Norwegian Coastal Administration guideline §11.2.1; kystverket.no).' },
    { v: 'right', q: 'The reflector on this arm is RED. What does the colour tell you?', answer: 'keepPort', traps: ['keepStbd', 'keepEither', 'keepNight'], explain: 'The reflector colour follows the direction of buoyage like a lateral mark: RED = a mark to be left on your PORT side, GREEN = on your STARBOARD side, WHITE = either side (Norwegian Coastal Administration guideline §11.2.1).' },
    { v: 'left', q: 'The reflector on this arm is GREEN. What does the colour tell you?', answer: 'keepStbd', traps: ['keepPort', 'keepEither', 'keepNight'], explain: 'The reflector colour follows the direction of buoyage: GREEN = a mark to be left on your STARBOARD side, RED = on your PORT side, WHITE = either side (Norwegian Coastal Administration guideline §11.2.1).' },
    { v: 'left', q: 'Can you rely on this pointer alone to show the safe side?', answer: 'trustNo', traps: ['trustYes', 'trustDay', 'trustGps'], explain: 'Fixed marks can be damaged or twisted by ice, weather and collisions so that a pointer points the wrong way — never trust a pointer blindly, always check the chart (the Norwegian Pilot; Norwegian Coastal Administration).' },
  ];
  function poleRound() {
    const p = K.pick(POLE);
    let pool = dedupe(B.shuffle(p.traps).slice(0, 3));
    pool = pool.concat(B.shuffle(PA_KEYS.filter(k => k !== p.answer && !pool.includes(k))).slice(0, 3 - pool.length));
    const d = K.distractors(pool.concat([p.answer]), p.answer, 3);
    return { key: 'g:' + p.answer + p.v, art: poleArt(p.v), prompt: p.q, hint: 'Fixed mark · pointer', choices: d.choices.map(k => PA[k]), answer: d.answer, explain: p.explain };
  }

  /* ---------- rotation ---------- */
  // Marks and lights are the exam's favourites, so they come round more often than the chart and pointer rounds.
  const PATTERN = [nameRound, rhythmRound, passRound, chartRound, nameRound, () => (Math.random() < 0.6 ? rhythmRound() : charRound()), sectorRound, () => (Math.random() < 0.8 ? passRound() : numberRound()), descRound, nameRound, chartRound, poleRound, rhythmRound, sectorRound];

  function mount(root) {
    let turn = Math.floor(Math.random() * PATTERN.length), lastKey = null;
    return K.drill(root, {
      night: false,
      makeRound() {
        const form = PATTERN[turn % PATTERN.length]; turn++;
        let r = form(), tries = 0;
        while (r.key === lastKey && tries++ < 8) r = form();     // never the same round twice in a row
        lastKey = r.key;
        // rhythm rounds sit on the dark night stage, everything else on the paper stage (drill() sets the class once at mount)
        const stage = root.querySelector('#stage');
        if (stage) stage.classList.toggle('night', !!r.night);
        return r;
      },
    });
  }

  B.registerTrainer({
    id: 'marks',
    title: 'Sea marks and lights',
    description: 'Name IALA marks and Norwegian spars, decide which side to pass, read light rhythms at night, chart symbols, sector lights and light descriptions — with the rule that says so.',
    mount,
  });

  // expose the tables and art builders for tests
  B.marksDrills = { KINDS, NAME, PASS, RHYTHMS, CHAR, SYM, SECTOR, POLE, markArt, rhythmArt, sectorArt, chartArt, poleArt, descArt, nameRound, passRound, numberRound, rhythmRound, charRound, chartRound, sectorRound, descRound, poleRound };

  // gallery entries so the stripped pictures can be checked by eye with test/check-topic.js --gallery
  if (S && S.gallery) {
    S.gallery.push({ name: 'trainer-marks mark cardinal-e spar (quiz)', svg: () => markArt('cardinal-e', 'spar', false) });
    S.gallery.push({ name: 'trainer-marks mark isolated-danger light (quiz)', svg: () => markArt('isolated-danger', 'buoy', true) });
    S.gallery.push({ name: 'trainer-marks mark lateral-port perch (quiz)', svg: () => markArt('lateral-port', 'perch', false) });
    S.gallery.push({ name: 'trainer-marks rhythm Q(6)+LFl 15s (quiz, night colours)', svg: () => rhythmArt('Q(6)+LFl 15s', 'W') });
    S.gallery.push({ name: 'trainer-marks rhythm Al BuY 3s (quiz, night colours)', svg: () => rhythmArt('Al BuY 3s') });
    S.gallery.push({ name: 'trainer-marks sector (quiz)', svg: () => sectorArt() });
    S.gallery.push({ name: 'trainer-marks chartSymbol sector-light (quiz)', svg: () => chartArt('sector-light') });
    S.gallery.push({ name: 'trainer-marks chartSymbol buoy-cardinal-w (quiz)', svg: () => chartArt('buoy-cardinal-w') });
    S.gallery.push({ name: 'trainer-marks pointerPole right (quiz)', svg: () => poleArt('right') });
    S.gallery.push({ name: 'trainer-marks pointerPole both (quiz)', svg: () => poleArt('both') });
    S.gallery.push({ name: 'trainer-marks light description decoder (quiz)', svg: () => descArt(['Fl(3)', 'WRG', '15s', '21m', '15-11M'], 4) });
  }
})();
