/* Skipper Prep — "Lights at night" trainer.
   Multiple-choice drill built on BOAT.trainerKit.drill. Four question forms rotate:
     (a) identity   — "What vessel is this and from which side are you seeing it?"
     (b) status     — "What is she doing / what is her status?"
     (c) give-way   — "You are a power-driven vessel underway. Who gives way?"
     (d) day shapes — meaning of a black day shape, and give-way rounds by day
   Pictures come from the verified illustration library (BOAT.svg.vesselLights / dayShape). Those
   pictures carry the vessel's name, a "seen from PORT …" hint and the rule text, so quizArt() strips
   every <text> except the colour words beside the lamps and replaces the aria-label.

   Every correct answer below is derived from the verified fact sheets and the derivation is written
   beside the data:  L = facts/lights-and-shapes.md (L-F6 = its fact F6),  S = facts/colregs-steering.md.

   Core derivations used throughout (quoted so the data tables can refer to them):
     D1  Sidelights: GREEN on the STARBOARD side, RED on the PORT side, each from right ahead to 22.5°
         abaft the beam (L-F6, S-F82). So: you see her RED light  => you are looking at her PORT side;
         you see her GREEN light => you are looking at her STARBOARD side; you see BOTH => her bow
         points at you (head-on aspect, L-F83, S-F54); you see NEITHER but a single low WHITE light
         => you are more than 22.5° abaft her beam, i.e. in her sternlight sector (L-F8, L-F9, S-F83).
     D2  Crossing (two power-driven vessels, risk of collision): the vessel which has the other on her
         STARBOARD side keeps out of the way (S-F56). If, with a steady bearing, you see her RED
         sidelight she is showing you her port side, so she is crossing from your starboard side
         towards your port side: she is on YOUR starboard side => YOU give way (L-F85, S-F57). If you
         see her GREEN sidelight she is on your port side, so she has you on HER starboard side =>
         SHE gives way and you stand on, keeping course and speed (L-F84, S-F59).
     D3  Head-on (both sidelights and the masthead light(s) in line): both power-driven vessels alter
         course to STARBOARD (S-F53, S-F54, L-F83). Rule 14 applies only between two power-driven
         vessels (S-F55).
     D4  Only a white sternlight => you are overtaking (coming up from more than 22.5° abaft her beam);
         the overtaking vessel keeps out of the way, whatever the type of either vessel (S-F49, S-F50,
         L-F86).
     D5  Rule 18(a): a power-driven vessel underway keeps out of the way of a vessel not under command,
         a vessel restricted in her ability to manoeuvre, a vessel engaged in fishing and a sailing
         vessel — whatever the aspect (S-F65, L-F89, L-F87). Rule 18(d): any vessel other than NUC/RAM
         avoids impeding the safe passage of a vessel constrained by her draught (S-F68).
     D6  Overtaking overrides Rule 18 ("except where Rules 9, 10 and 13 otherwise require", S-F64).
*/
(function () {
  'use strict';
  const B = window.BOAT;
  const S = B.svg;                       // BOAT_SVG: vesselLights, dayShape, text, esc
  const K = B.trainerKit;                // drill, pick, distractors
  const esc = B.esc;

  /* ---------- picture post-processing: hide the answer that the library prints on the picture ---------- */
  // Keep only the colour words that sit beside each lamp ("red", "green", …) and the "≥ 1.5 m" spacing
  // notes; everything else (vessel name, "seen from …" hint, rule text, shape meaning) is removed.
  const KEEP = /^(red|green|white|yellow|≥ [\d.]+ m)$/;
  function quizArt(svg, label, caption) {
    let out = svg.replace(/<text\b[^>]*>([\s\S]*?)<\/text>/g, (m, inner) => KEEP.test(inner.trim()) ? m : '');
    out = out.replace(/aria-label="[^"]*"/, `aria-label="${esc(label)}"`);
    if (caption) out = out.replace(/<\/svg>\s*$/, caption + '</svg>');
    return out;
  }
  // vesselLights panels are 360 × 292 with a plain band along the bottom (y ≥ 222) where the hint used to be.
  function nightArt(type, view, opts) {
    const cap = S.text(180, 258, 'Night. Read the lights only.', { size: 11, fill: '#a7b6c4', italic: true });
    return quizArt(S.vesselLights(type, view, opts), 'Night view of a vessel: only her lights are visible', cap);
  }
  // dayShape panels are 380 × 320; the right half (x ≈ 262) held the title and meaning.
  function dayArt(kind) {
    const cap = S.text(262, 120, 'A black day shape.', { size: 13, weight: 700, fill: '#1a2630' }) +
      S.text(262, 140, 'What does it tell you?', { size: 12, fill: '#4b5a66' });
    return quizArt(S.dayShape(kind), 'A black day shape hoisted on a mast', cap);
  }

  /* ---------- vocabulary ---------- */
  const VIEW_TEXT = { ahead: 'from right ahead (her bow towards you)', port: 'from her port side', starboard: 'from her starboard side', astern: 'from astern' };
  // What the visible sidelight(s) tell you about the aspect — derivation D1.
  const VIEW_WHY = {
    port: 'You see her RED sidelight, so you are looking at her PORT side (Rule 21(b): red to port, green to starboard).',
    starboard: 'You see her GREEN sidelight, so you are looking at her STARBOARD side (Rule 21(b): green to starboard, red to port).',
    ahead: 'You see BOTH sidelights, so her bow points at you: her red (port) light is on your right and her green on your left (Rule 21(b)).',
    astern: 'No sidelight at all, only the white sternlight: you are more than 22.5° abaft her beam, in her sternlight sector (Rule 21(c)).',
  };

  /* ---------- (a) identity rounds ----------
     sig = what is actually visible (whites / colours), so two entries with the SAME picture are never offered
     against each other. Derivations: lights per type from L-F18 (power), L-F38/F39/F40 (sail),
     L-F29/F30 (towing), L-F45/F46 (fishing, trawling), L-F50 (NUC), L-F52 (RAM), L-F61 (CBD), L-F63 (pilot),
     L-F65/F66 (anchor), L-F68 (aground), L-F58 (mine clearance); visibility of each light by aspect from D1
     plus L-F5 (masthead 225°, seen from ahead and both sides, not from astern) and L-F11 (all-round, 360°). */
  const WHY = {
    'power<50': 'One white masthead light above the sidelight(s) means a power-driven vessel; under 50 m she carries one masthead light, 50 m or more carries two (Rule 23(a)). A boat under 12 m may show one all-round white light instead, which looks the same (Rule 23(d)).',
    'power>=50': 'TWO white masthead lights, the after one higher, mean a power-driven vessel of 50 m or more (Rule 23(a)(ii)); the bow is under the lower light (Annex I).',
    'sail': 'Sidelight(s) with NO white light above them: a sailing vessel under sail shows only sidelights and a sternlight, no masthead light (Rule 25(a)).',
    'sail-tricolour': 'Red/green (and white astern) in ONE lantern high at the masthead, nothing at deck level: the tricolour lantern a sailing vessel under 20 m may use under sail (Rule 25(b)).',
    'sail-redgreen': 'Sidelights with all-round RED over GREEN at the masthead: a sailing vessel using the optional Rule 25(c) lights (never together with a tricolour).',
    'towing': 'Two white masthead lights in a VERTICAL line plus sidelights mean a vessel towing astern; from astern she adds a YELLOW towing light above the white sternlight (Rule 24(a)). The sidelights tell you her aspect.',
    'towing-long': 'THREE white masthead lights in a vertical line: a vessel towing astern with a tow longer than 200 m (Rule 24(a)(i),(v)).',
    'cbd': 'Three all-round RED lights in a vertical line plus the normal masthead lights and sidelight: a vessel constrained by her draught (Rule 28).',
    'fishing': 'All-round RED over WHITE: a vessel engaged in fishing other than trawling; sidelight and sternlight show she is making way (Rule 26(c)).',
    'trawling': 'All-round GREEN over WHITE: a vessel engaged in trawling; sidelight and sternlight show she is making way (Rule 26(b)).',
    'trawling-large': 'All-round GREEN over WHITE plus a white masthead light abaft of and higher than them: a trawler of 50 m or more, making way (Rule 26(b)).',
    'nuc': 'Two all-round RED lights in a vertical line and no masthead light: a vessel not under command; the sidelight shows she is still making way (Rule 27(a)).',
    'ram': 'All-round RED–WHITE–RED in a vertical line below a masthead light, plus sidelight: a vessel restricted in her ability to manoeuvre, making way (Rule 27(b)).',
    'pilot': 'All-round WHITE over RED at the masthead plus sidelight: a pilot vessel on duty, underway (Rule 29).',
    'anchored>=50': 'Two all-round white lights, the FORWARD one higher and the after one lower, and no sidelights: a vessel of 50 m or more at anchor (Rule 30(a)). Compare the power-driven ship, whose AFTER masthead light is the higher one.',
    'aground': 'Anchor lights plus two all-round RED lights in a vertical line: a vessel aground (Rule 30(d)).',
    'minesweeping': 'Three all-round GREEN lights (foremast head and each end of the fore yard) with power-driven lights: mine clearance — do not approach within 1,000 m (Rule 27(f)).',
  };
  const ID = (type, view, vessel, sig, why, opts) => ({ type, view, vessel, sig, why: why || type, opts: opts || null, label: `${vessel}, seen ${VIEW_TEXT[view]}` });
  const IDENTITY = [
    // power<50: masthead (visible ahead/port/starboard) + the sidelight of the side you see (D1). Astern she shows
    // only a sternlight — identical to any other vessel's sternlight — so no identity round for that aspect.
    ID('power<50', 'ahead', 'Power-driven vessel under 50 m', 'W/RG'),
    ID('power<50', 'port', 'Power-driven vessel under 50 m', 'W/R'),
    ID('power<50', 'starboard', 'Power-driven vessel under 50 m', 'W/G'),
    // power>=50: two masthead lights (L-F18, after one higher L-F75) + sidelight (D1).
    ID('power>=50', 'ahead', 'Power-driven vessel of 50 m or more', 'WW/RG'),
    ID('power>=50', 'port', 'Power-driven vessel of 50 m or more', 'WW/R'),
    ID('power>=50', 'starboard', 'Power-driven vessel of 50 m or more', 'WW/G'),
    // sail: sidelights + sternlight, no masthead light (L-F38).
    ID('sail', 'ahead', 'Sailing vessel under sail', 'RG'),
    ID('sail', 'port', 'Sailing vessel under sail', 'R'),
    ID('sail', 'starboard', 'Sailing vessel under sail', 'G'),
    // tricolour: the same colours in one lantern at the masthead (L-F39) — distinguished by height in the picture.
    ID('sail-tricolour', 'ahead', 'Sailing vessel with a tricolour lantern', 'tRG'),
    ID('sail-tricolour', 'port', 'Sailing vessel with a tricolour lantern', 'tR'),
    ID('sail-tricolour', 'starboard', 'Sailing vessel with a tricolour lantern', 'tG'),
    // red over green all-round at the masthead + sidelights (L-F40).
    ID('sail-redgreen', 'ahead', 'Sailing vessel with red over green masthead lights', 'RGs/RG'),
    ID('sail-redgreen', 'port', 'Sailing vessel with red over green masthead lights', 'RGs/R'),
    // towing: two masthead lights in a vertical line + sidelights; yellow over white astern (L-F29).
    // (From right ahead a tug's two vertical lights look like a big ship's two masthead lights in line, so no ahead round.)
    ID('towing', 'port', 'Vessel towing another vessel astern', 'WWv/R'),
    ID('towing', 'starboard', 'Vessel towing another vessel astern', 'WWv/G'),
    ID('towing', 'astern', 'Vessel towing another vessel astern', 'W+Y'),
    ID('towing', 'ahead', 'Vessel towing astern, tow longer than 200 m', 'WWWv/RG', 'towing-long', { long: true }),
    // CBD: three all-round red + power-driven lights (L-F61).
    ID('cbd', 'port', 'Vessel constrained by her draught', 'RRR+WW/R'),
    ID('cbd', 'ahead', 'Vessel constrained by her draught', 'RRR+WW/RG'),
    // fishing / trawling making way (L-F45, L-F46).
    ID('fishing', 'port', 'Vessel engaged in fishing (not trawling), making way', 'RW/R'),
    ID('fishing', 'starboard', 'Vessel engaged in fishing (not trawling), making way', 'RW/G'),
    ID('trawling', 'starboard', 'Vessel engaged in trawling, making way', 'GW/G'),
    ID('trawling', 'port', 'Trawler of 50 m or more, making way', 'GW+W/R', 'trawling-large', { large: true }),
    // NUC, RAM, pilot (L-F50, L-F52, L-F63).
    ID('nuc', 'port', 'Vessel not under command, making way', 'RR/R'),
    ID('nuc', 'starboard', 'Vessel not under command, making way', 'RR/G'),
    ID('ram', 'port', 'Vessel restricted in her ability to manoeuvre, making way', 'W+RWR/R'),
    ID('pilot', 'port', 'Pilot vessel on duty, underway', 'WR/R'),
    ID('pilot', 'starboard', 'Pilot vessel on duty, underway', 'WR/G'),
    // anchored ≥ 50 m, aground, mine clearance (L-F65, L-F68, L-F58).
    ID('anchored>=50', 'port', 'Vessel of 50 m or more at anchor', 'WWa'),
    ID('aground', 'port', 'Vessel aground', 'WWa+RR'),
    ID('minesweeping', 'ahead', 'Vessel engaged in mine clearance', 'GGG+W/RG'),
  ];

  /* ---------- (b) status rounds ---------- */
  const ST = {
    power: 'Power-driven vessel underway, no special status',
    sail: 'Sailing vessel under sail',
    anchor: 'At anchor',
    aground: 'Aground',
    fishing: 'Engaged in fishing (not trawling)',
    trawling: 'Engaged in trawling',
    nuc: 'Not under command',
    ram: 'Restricted in her ability to manoeuvre',
    cbd: 'Constrained by her draught',
    pilot: 'On pilotage duty',
    towing: 'Towing another vessel astern',
    mine: 'Engaged in mine clearance',
  };
  const STATUS_ALL = Object.keys(ST);
  // exclude = statuses whose picture could be identical to this one (never offered as a distractor).
  const SR = (type, view, status, explain, opts, exclude) => ({ type, view, status, explain, opts: opts || null, exclude: exclude || [] });
  const STATUS = [
    // One all-round white light = anchored vessel under 50 m (L-F66). A single white light can also be the sternlight of a
    // power-driven or sailing vessel seen from astern (L-F86), so those two are never offered beside it.
    SR('anchored', 'port', 'anchor', 'One all-round white light and nothing else: a vessel under 50 m at anchor (Rule 30(b)). Beware: a lone white light can also be a sternlight or a boat under 7 m — watch whether it moves.', null, ['power', 'sail']),
    SR('anchored>=50', 'port', 'anchor', 'Two all-round white lights, the forward one HIGHER, and no sidelights: a vessel of 50 m or more at anchor (Rule 30(a)). A ship underway would carry her after masthead light higher and show a sidelight.'),
    SR('aground', 'port', 'aground', 'Anchor light(s) plus two all-round RED lights in a vertical line: aground (Rule 30(d)). "Red over red" alone would be not under command.'),
    SR('fishing', 'port', 'fishing', 'All-round RED over WHITE: "red over white, fishing at night" (Rule 26(c)). The sidelight shows she is making way.'),
    SR('fishing', 'ahead', 'fishing', 'All-round RED over WHITE: engaged in fishing other than trawling (Rule 26(c)); the sidelights mean she is making way. A fishing vessel shows these lights even at anchor (Rule 26).', { making: false }),
    SR('trawling', 'starboard', 'trawling', 'All-round GREEN over WHITE: "green over white, trawling at night" (Rule 26(b)). The sidelight shows she is making way.'),
    SR('trawling', 'ahead', 'trawling', 'All-round GREEN over WHITE with no sidelights: a trawler that is not making way (Rule 26(b)).', { making: false }),
    SR('nuc', 'port', 'nuc', 'Two all-round RED lights in a vertical line, no masthead light, a sidelight: not under command and still making way (Rule 27(a)). "Red over red, the captain is dead."'),
    SR('nuc', 'ahead', 'nuc', 'Two all-round RED lights and nothing else: a vessel not under command, not making way (Rule 27(a)).', { making: false }),
    SR('ram', 'port', 'ram', 'All-round RED–WHITE–RED in a vertical line: restricted in her ability to manoeuvre (dredging, cable work, diving…); the masthead light and sidelight mean she is making way (Rule 27(b)).'),
    SR('ram', 'ahead', 'ram', 'All-round RED–WHITE–RED only, no masthead light or sidelights: restricted in her ability to manoeuvre and not making way (Rule 27(b)).', { making: false }),
    SR('cbd', 'port', 'cbd', 'THREE all-round RED lights in a vertical line together with ordinary power-driven lights: constrained by her draught (Rule 28).'),
    SR('pilot', 'port', 'pilot', 'All-round WHITE over RED at the masthead: "white over red, pilot ahead" (Rule 29). Sidelight and sternlight because she is underway.'),
    SR('pilot', 'ahead', 'pilot', 'All-round WHITE over RED only: a pilot vessel on duty, here not underway (Rule 29). Do not confuse with red over white (fishing).', { making: false }),
    SR('towing', 'port', 'towing', 'Two white masthead lights in a VERTICAL line plus sidelight: a vessel towing astern (Rule 24(a)). From astern she would also show a yellow towing light above her sternlight.'),
    SR('towing', 'astern', 'towing', 'A YELLOW light above the white sternlight is the towing light (Rule 24(a)(iv)): she is towing something astern — keep well clear of the tow line.'),
    SR('sail', 'port', 'sail', 'A sidelight with NO white light above it: she is under sail (Rule 25(a)). A white light above a sidelight would make her power-driven.'),
    SR('power<50', 'starboard', 'power', 'A white masthead light above a green sidelight: an ordinary power-driven vessel underway (Rule 23(a)); no special status lights.'),
    SR('minesweeping', 'ahead', 'mine', 'Three all-round GREEN lights (foremast head and each end of the fore yard) in addition to power-driven lights: mine clearance — dangerous to approach within 1,000 m (Rule 27(f)).'),
  ];

  /* ---------- (c) give-way rounds ---------- */
  const C = {
    iGive: 'I give way — she is on my starboard side (Rule 15)',
    sheGives: 'She gives way — I stand on and keep my course and speed (Rules 15 and 17)',
    headOn: 'Head-on: we both alter course to starboard (Rule 14)',
    overtake: 'I keep out of her way — I am overtaking her (Rule 13)',
    r18: 'I keep out of her way whatever the aspect — she has priority under Rule 18',
    cbd: 'I avoid impeding her safe passage — she is constrained by her draught (Rule 18(d))',
    sheR18: 'She keeps out of my way — a power-driven vessel has priority under Rule 18',   // always wrong: power is lowest (S-F70)
  };
  const C_ALL = Object.keys(C);
  const GW = (type, view, answer, explain, traps, opts) => ({ type, view, answer, explain, traps: traps || [], opts: opts || null });
  // Power-driven vs power-driven: D2 (port/starboard), D3 (ahead), D4 (astern).
  const POWER_WHY = {
    port: 'Her RED sidelight under a white masthead light: a power-driven vessel showing you her PORT side. With a steady bearing she is crossing from your starboard side towards your port side, so she is on YOUR starboard side: the vessel which has the other on her starboard side keeps out of the way (Rule 15). Alter to starboard early and pass astern of her. "If to starboard red appear, it is your duty to keep clear."',
    starboard: 'Her GREEN sidelight under a white masthead light: a power-driven vessel showing you her STARBOARD side, so she is on your port side and has YOU on her starboard side. She is the give-way vessel (Rule 15); you stand on, keeping course and speed (Rule 17), but act yourself if she does not.',
    ahead: 'Both sidelights with the masthead light(s) in line: two power-driven vessels meeting head-on. Each alters course to STARBOARD and passes port to port (Rule 14).',
    astern: 'Only a white sternlight: you are coming up from more than 22.5° abaft her beam, i.e. overtaking. The overtaking vessel keeps out of the way, whatever the type of either vessel (Rule 13).',
  };
  const GIVEWAY = [
    GW('power<50', 'port', 'iGive', POWER_WHY.port, ['sheGives', 'headOn']),
    GW('power<50', 'starboard', 'sheGives', POWER_WHY.starboard, ['iGive', 'headOn']),
    GW('power<50', 'ahead', 'headOn', POWER_WHY.ahead, ['iGive', 'sheGives']),
    GW('power<50', 'astern', 'overtake', POWER_WHY.astern, ['sheGives', 'headOn']),
    GW('power>=50', 'port', 'iGive', POWER_WHY.port + ' Two masthead lights only tell you she is 50 m or more; size gives no priority.', ['sheGives', 'sheR18']),
    GW('power>=50', 'starboard', 'sheGives', POWER_WHY.starboard + ' Her size (two masthead lights) gives her no priority.', ['iGive', 'r18']),
    GW('power>=50', 'ahead', 'headOn', POWER_WHY.ahead, ['iGive', 'sheGives']),
    GW('power>=50', 'astern', 'overtake', POWER_WHY.astern, ['iGive', 'sheGives']),
    // Sailing vessel: no white light above the sidelights (L-F38) => Rule 18(a)(iv): the power-driven vessel keeps clear (D5),
    // on every aspect except overtaking (D6). Rule 14 is NOT used for power meeting sail (S-F55).
    GW('sail', 'port', 'r18', 'A red sidelight with NO white light above it: a sailing vessel under sail showing you her port side. A power-driven vessel keeps out of the way of a sailing vessel on any aspect (Rule 18(a)(iv)); the crossing rule of Rule 15 is for two power-driven vessels.', ['iGive', 'sheGives']),
    GW('sail', 'starboard', 'r18', 'A green sidelight with NO white light above it: a sailing vessel under sail showing you her starboard side. Even though she is on your port side, Rule 15 does not apply between power and sail: a power-driven vessel keeps out of the way of a sailing vessel (Rule 18(a)(iv)).', ['sheGives', 'iGive']),
    GW('sail', 'ahead', 'r18', 'Both sidelights and no white light above them: a sailing vessel coming towards you. Rule 14 (both to starboard) is only for two power-driven vessels; a power-driven vessel keeps out of the way of a sailing vessel (Rule 18(a)(iv)).', ['headOn', 'sheGives']),
    GW('sail-tricolour', 'port', 'r18', 'A red light high at the masthead with nothing at deck level: a sailing vessel with a tricolour lantern (Rule 25(b)) showing you her port side. A power-driven vessel keeps out of the way of a sailing vessel (Rule 18(a)(iv)).', ['iGive', 'sheGives']),
    // Fishing / trawling making way: Rule 18(a)(iii) (D5). Ahead aspect: Rule 14 does not apply (S-F55).
    GW('fishing', 'port', 'r18', 'Red over white all-round: a vessel engaged in fishing, making way. A power-driven vessel keeps out of the way of a vessel engaged in fishing whatever the aspect (Rule 18(a)(iii)).', ['iGive', 'sheGives']),
    GW('fishing', 'starboard', 'r18', 'Red over white all-round: engaged in fishing. Her green sidelight does NOT make you the stand-on vessel: Rule 15 is for two power-driven vessels, and a power-driven vessel keeps out of the way of a fishing vessel (Rule 18(a)(iii)).', ['sheGives', 'iGive']),
    GW('fishing', 'ahead', 'r18', 'Red over white all-round with both sidelights: a fishing vessel coming towards you. Rule 14 applies only between two power-driven vessels; you keep out of her way (Rule 18(a)(iii)).', ['headOn', 'sheGives']),
    GW('trawling', 'port', 'r18', 'Green over white all-round: a vessel engaged in trawling, making way. A power-driven vessel keeps out of the way of a vessel engaged in fishing, which includes trawling (Rule 18(a)(iii)).', ['iGive', 'sheGives']),
    GW('trawling', 'starboard', 'r18', 'Green over white all-round: a trawler. Although she shows you her starboard side, Rule 15 is for two power-driven vessels; you keep out of her way (Rule 18(a)(iii)).', ['sheGives', 'iGive']),
    // NUC / RAM making way: Rule 18(a)(i),(ii) (D5).
    GW('nuc', 'port', 'r18', 'Red over red all-round and no masthead light: a vessel not under command, making way. A power-driven vessel keeps out of the way of a vessel not under command (Rule 18(a)(i)).', ['iGive', 'sheGives']),
    GW('nuc', 'starboard', 'r18', 'Red over red all-round: not under command. Her green sidelight changes nothing: she cannot manoeuvre, and Rule 18(a)(i) makes you keep out of her way.', ['sheGives', 'iGive']),
    GW('ram', 'port', 'r18', 'Red–white–red all-round: a vessel restricted in her ability to manoeuvre, making way. A power-driven vessel keeps out of the way of such a vessel (Rule 18(a)(ii)).', ['iGive', 'sheGives']),
    GW('ram', 'ahead', 'r18', 'Red–white–red all-round with both sidelights: restricted in her ability to manoeuvre and coming towards you. Not a Rule 14 case: you keep out of her way (Rule 18(a)(ii)).', ['headOn', 'sheGives']),
    // CBD: Rule 18(d) "avoid impeding" (S-F68). Compare D2: on the port aspect she is on your starboard side anyway.
    GW('cbd', 'port', 'cbd', 'Three all-round red lights with power-driven lights: constrained by her draught. Any vessel other than NUC/RAM must avoid impeding her safe passage (Rule 18(d)); she is also on your starboard side, so keep well clear early.', ['sheGives', 'sheR18']),
    GW('cbd', 'starboard', 'cbd', 'Three all-round red lights with power-driven lights: constrained by her draught. Even though she shows you her starboard side, you avoid impeding her safe passage (Rule 18(d)) — she cannot leave the deep water.', ['sheGives', 'iGive']),
  ];

  /* ---------- (d) day-shape rounds ---------- */
  // Meanings from L-F43 (cone down), L-F45/F46 (two cones), L-F47 (cone up), L-F30 (diamond), L-F50 (two balls),
  // L-F52 (ball–diamond–ball), L-F68 (three balls), L-F61 (cylinder), L-F65 (ball).
  const SHAPE_MEANING = {
    ball: 'At anchor (Rule 30)',
    'cone-down': 'Sailing vessel also using her engine (Rule 25(e))',
    'cone-up': 'Fishing gear extends more than 150 m in that direction (Rule 26(c))',
    'two-cones': 'Engaged in fishing or trawling (Rule 26)',
    diamond: 'Tow longer than 200 m, on the tug and on the tow (Rule 24)',
    'two-balls': 'Not under command (Rule 27(a))',
    'ball-diamond-ball': 'Restricted in her ability to manoeuvre (Rule 27(b))',
    'three-balls': 'Aground (Rule 30(d))',
    cylinder: 'Constrained by her draught (Rule 28)',
  };
  const SHAPE_WHY = {
    ball: 'One black ball forward: a vessel at anchor (Rule 30). At night: one or two all-round white lights.',
    'cone-down': 'A cone with its apex DOWNWARDS, forward: a vessel under sail that is also using her engine — she then counts as a power-driven vessel (Rule 25(e)).',
    'cone-up': 'A cone apex UPWARDS is shown by a fishing vessel (not trawling) in the direction of gear extending more than 150 m (Rule 26(c)(ii)).',
    'two-cones': 'Two cones with their apexes together in a vertical line: a vessel engaged in fishing or trawling (Rule 26). At night: red over white (fishing) or green over white (trawling).',
    diamond: 'A diamond is carried by a towing vessel and by the tow when the tow is longer than 200 m (Rule 24). It is also the middle shape of ball–diamond–ball.',
    'two-balls': 'Two balls in a vertical line: a vessel not under command (Rule 27(a)). At night: red over red.',
    'ball-diamond-ball': 'Ball – diamond – ball: a vessel restricted in her ability to manoeuvre (Rule 27(b)). At night: red–white–red.',
    'three-balls': 'Three balls in a vertical line: a vessel aground (Rule 30(d)). At night: anchor lights plus red over red.',
    cylinder: 'A cylinder: a vessel constrained by her draught (Rule 28). At night: three all-round red lights in a vertical line.',
  };
  const SHAPES = Object.keys(SHAPE_MEANING);
  // Day give-way rounds: the prompt states where she is. cone-down => she is power-driven (L-F43, S-F8) => D2 applies by position;
  // two cones / two balls / ball-diamond-ball => Rule 18(a) (D5); cylinder => Rule 18(d).
  const DAY_GW = [
    { kind: 'cone-down', where: 'on your STARBOARD bow', answer: 'iGive', explain: 'A cone apex down means she is sailing AND motoring, so she is a power-driven vessel (Rule 25(e)). Two power-driven vessels crossing: the one with the other on her starboard side gives way (Rule 15) — that is you.', traps: ['r18', 'sheGives'] },
    { kind: 'cone-down', where: 'on your PORT bow', answer: 'sheGives', explain: 'A cone apex down means her engine is running, so she is a power-driven vessel (Rule 25(e)), not a sailing vessel with Rule 18 priority. She has you on her starboard side, so she gives way (Rule 15) and you stand on (Rule 17).', traps: ['r18', 'iGive'] },
    { kind: 'two-cones', where: 'on your PORT bow', answer: 'r18', explain: 'Two cones apexes together: engaged in fishing (Rule 26). A power-driven vessel keeps out of the way of a vessel engaged in fishing whatever the aspect (Rule 18(a)(iii)), so her being on your port side does not make you stand-on.', traps: ['sheGives', 'iGive'] },
    { kind: 'two-balls', where: 'on your PORT bow', answer: 'r18', explain: 'Two balls: not under command (Rule 27(a)). A power-driven vessel keeps out of the way of a vessel not under command (Rule 18(a)(i)) — she cannot manoeuvre at all.', traps: ['sheGives', 'iGive'] },
    { kind: 'ball-diamond-ball', where: 'on your STARBOARD bow', answer: 'r18', explain: 'Ball–diamond–ball: restricted in her ability to manoeuvre (Rule 27(b)). A power-driven vessel keeps out of the way of such a vessel (Rule 18(a)(ii)), on any aspect.', traps: ['iGive', 'sheGives'] },
    { kind: 'cylinder', where: 'on your PORT bow', answer: 'cbd', explain: 'A cylinder: constrained by her draught (Rule 28). Any vessel other than NUC/RAM avoids impeding her safe passage (Rule 18(d)); she cannot leave the deep channel, so do not rely on being stand-on.', traps: ['sheGives', 'r18'] },
  ];

  /* ---------- round builders ---------- */
  const PROMPT_A = 'What vessel is this and from which side are you seeing it?';
  const PROMPT_B = 'What is she doing — what is her status?';
  const PROMPT_C = 'You are a power-driven vessel underway and the bearing of these lights is steady (risk of collision). Who gives way?';
  const PROMPT_D = 'What does this day shape mean?';
  const dedupe = arr => arr.filter((x, i) => arr.indexOf(x) === i);

  function identityRound(e) {
    // distractor pool: one with the same vessel but another aspect, one with another vessel on the same aspect, then anything else —
    // never an entry whose picture would look the same (sig).
    const others = IDENTITY.filter(x => x !== e && x.sig !== e.sig);
    const sameVessel = B.shuffle(others.filter(x => x.vessel === e.vessel && x.view !== e.view));
    const sameView = B.shuffle(others.filter(x => x.view === e.view && x.vessel !== e.vessel));
    let pool = dedupe([sameVessel[0], sameView[0]].filter(Boolean));
    pool = pool.concat(B.shuffle(others.filter(x => !pool.includes(x))).slice(0, 3 - pool.length));
    const d = K.distractors(pool.concat([e]), e, 3, x => x.label);
    return { key: 'a:' + e.label, art: nightArt(e.type, e.view, e.opts), prompt: PROMPT_A, hint: 'Night · identify', choices: d.choices.map(x => x.label), answer: d.answer,
      explain: VIEW_WHY[e.view] + ' ' + WHY[e.why] };
  }
  function statusRound(r) {
    const pool = STATUS_ALL.filter(s => s !== r.status && !r.exclude.includes(s));
    const d = K.distractors(pool.concat([r.status]), r.status, 3);
    return { key: 'b:' + r.type + r.view + (r.opts ? 'x' : ''), art: nightArt(r.type, r.view, r.opts), prompt: PROMPT_B, hint: 'Night · status', choices: d.choices.map(s => ST[s]), answer: d.answer, explain: r.explain };
  }
  function choicesFor(answer, traps) {
    let pool = dedupe(B.shuffle(traps.filter(t => t !== answer)).slice(0, 2));
    pool = pool.concat(B.shuffle(C_ALL.filter(k => k !== answer && !pool.includes(k))).slice(0, 3 - pool.length));
    const d = K.distractors(pool.concat([answer]), answer, 3);
    return { choices: d.choices.map(k => C[k]), answer: d.answer };
  }
  function giveWayRound(g) {
    const c = choicesFor(g.answer, g.traps);
    return { key: 'c:' + g.type + g.view, art: nightArt(g.type, g.view, g.opts), prompt: PROMPT_C, hint: 'Night · who gives way?', choices: c.choices, answer: c.answer, explain: g.explain };
  }
  function dayRound() {
    if (Math.random() < 0.6) {
      const kind = K.pick(SHAPES);
      const d = K.distractors(SHAPES, kind, 3);
      return { key: 'd:' + kind, art: dayArt(kind), prompt: PROMPT_D, hint: 'Day shape', choices: d.choices.map(k => SHAPE_MEANING[k]), answer: d.answer, explain: SHAPE_WHY[kind] };
    }
    const g = K.pick(DAY_GW);
    const c = choicesFor(g.answer, g.traps);
    return { key: 'dg:' + g.kind + g.where, art: dayArt(g.kind), prompt: `By day. You are a power-driven vessel underway; this vessel is ${g.where} and her bearing is steady. Who gives way?`, hint: 'Day · who gives way?', choices: c.choices, answer: c.answer, explain: g.explain };
  }
  const FORMS = [() => identityRound(K.pick(IDENTITY)), () => statusRound(K.pick(STATUS)), () => giveWayRound(K.pick(GIVEWAY)), dayRound];

  function mount(root) {
    let turn = Math.floor(Math.random() * FORMS.length), lastKey = null;
    return K.drill(root, {
      night: true,
      makeRound() {
        const form = FORMS[turn % FORMS.length]; turn++;
        let r = form(), tries = 0;
        while (r.key === lastKey && tries++ < 8) r = form();     // never the same round twice in a row
        lastKey = r.key;
        // Day-shape rounds sit on the light stage, night rounds on the dark one (drill() sets the class once at mount).
        const stage = root.querySelector('#stage');
        if (stage) stage.classList.toggle('night', !r.key.startsWith('d'));
        return r;
      },
    });
  }

  B.registerTrainer({
    id: 'lights',
    title: 'Lights at night',
    description: 'Identify vessels from their lights and day shapes, read which side you are seeing, and decide who gives way — with the rule that says so.',
    mount,
  });

  // expose the tables for tests
  B.lightsDrills = { IDENTITY, STATUS, GIVEWAY, DAY_GW, SHAPES, quizArt, identityRound, statusRound, giveWayRound, dayRound };
})();
