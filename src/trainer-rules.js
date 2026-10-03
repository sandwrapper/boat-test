/* Skipper Prep — "Who gives way?" trainer.
   Multiple-choice drill built on BOAT.trainerKit.drill. Every round is a freshly generated plan-view
   encounter: your own vessel bow-up, another vessel at a random relative bearing on a course that
   produces a risk of collision (steady bearing, closing range). Two question forms rotate:
     (a) "Who gives way — and under which rule?"
     (b) "What should you do?"
   The correct answer is never stored in the template: it is DERIVED from the geometry and the vessel
   categories by decide() below, and the derivation is written into the explanation. Fact numbers
   (F..) refer to the verified fact sheet facts/colregs-steering.md; S.. are its worked scenarios.

   Derivation chain used by decide(), in the order the Rules impose it:
     G   Geometry. Relative bearing of the other vessel from own vessel (0° = own bow, clockwise) and
         relative bearing of own vessel from her. "More than 22.5° abaft the beam" = relative bearing
         inside (112.5°, 247.5°), the 135° sternlight sector (F50, F83). Steady bearing + closing range
         = risk of collision (F24).
     D1  Rule 13 comes first: "notwithstanding anything in Sections I and II", ANY vessel overtaking
         any other keeps out of the way, whatever the types (F49) — overtaking also overrides Rule 18
         (F64) and lasts until finally past and clear (F52). Own vessel is overtaking when she lies
         inside the other's stern sector; the other is overtaking when she lies inside ours (F50).
     D2  Norwegian Rule 44: in narrow waters, busy fairways and harbour areas, pleasure craft and open
         boats under oars, sail OR engine keep out of the way of larger vessels, scheduled ferries and
         other commercial traffic (F91) — a sailing yacht too (F92); Rule 9(b) adds that vessels under
         20 m and sailing vessels shall not impede a vessel that can only navigate inside the channel
         (F33). This is applied irrespective of the port/starboard geometry (S11).
     D3  A kayak or rowing boat is a vessel (F6) with no rung in Rule 18 (F71); Norwegian Rule 43 puts
         the duty on the small craft to manoeuvre with caution, slow down, stop if required and keep
         WELL out of the way (F90) — the other skipper must still keep a look-out, slow down and pass
         well clear (Rules 2, 5, 6, 8; S12).
     D4  A vessel constrained by her draught is a "do not impede" case: every vessel other than NUC/RAM
         avoids impeding her safe passage (F68, F70).
     D5  Rule 18 ladder (F65, F66, F67, F70): power-driven < sailing < engaged in fishing < NUC = RAM;
         the lower rung keeps out of the way, whichever side the other is on. Categories: a yacht with
         her engine running is POWER-DRIVEN even with sails up (F8, F9); a boat trolling a lure is NOT
         engaged in fishing (F10).
     D6  Two sailing vessels, Rule 12: wind on different sides -> the port-tack boat gives way (F45);
         same side -> the windward boat gives way (F46); the windward side is opposite the mainsail, so
         boom to starboard = port tack (F48). Rule 14 is NOT used between sailing vessels (F55).
     D7  Two power-driven vessels: reciprocal or nearly reciprocal courses, bow to bow = head-on, BOTH
         alter to starboard and pass port to port (F53, F54); otherwise crossing, and the vessel which
         has the other on her own STARBOARD side keeps out of the way and avoids crossing ahead (F56).
         Give-way action is early and substantial (F58); the stand-on vessel keeps course and speed
         (F59), may act when the other clearly does not (F60), must act when it is too late for the
         other alone (F61), and does not turn to port for a vessel on her port side (F62). */
(function () {
  'use strict';
  const B = window.BOAT;
  const S = B.svg;                       // BOAT_SVG: svg, text, COLORS, esc, gallery
  const K = B.trainerKit;                // drill, pick
  const C = S.COLORS;
  const esc = S.esc;
  const rad = d => d * Math.PI / 180;
  const norm = d => ((d % 360) + 360) % 360;
  const f1 = n => Math.round(n * 10) / 10;
  const dirv = a => [Math.sin(rad(a)), -Math.cos(rad(a))];
  const bearing = (x0, y0, x1, y1) => norm(Math.atan2(x1 - x0, -(y1 - y0)) * 180 / Math.PI);
  const WIND = '#2A9D8F', SHORE = '#8A9A5B', FERRY = '#7D8597', SHIP = '#6b7a86';

  /* Deterministic generator for the gallery pictures (mulberry32); the drill uses Math.random. */
  function seeded(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }

  /* ---------- vessel catalogue ----------
     cat = Rule 18 category (D5): power (F7, F8, F10), sail (F8), fishing (F10), nuc (F11), ram (F12),
     cbd (F13), oars (F6, F71). commercial = protected by Norwegian Rule 44 in narrow waters (F91). */
  const V = {
    power:     { cat: 'power', name: 'motorboat', you: 'motorboat', label: ['MOTORBOAT'], len: 56, draw: { power: true } },
    sail:      { cat: 'sail', name: 'sailing yacht under sail', you: 'sailing yacht, engine off', label: ['SAILING YACHT', 'under sail, engine off'], len: 56, draw: { sail: true } },
    motorsail: { cat: 'power', name: 'yacht with sails up and her engine running', you: 'yacht motor-sailing (engine on)', label: ['SAILING YACHT, ENGINE ON', 'cone apex down'], len: 56, draw: { sail: true, power: true, shape: 'cone-down' } },
    fishing:   { cat: 'fishing', name: 'vessel engaged in fishing', label: ['FISHING VESSEL', 'two cones apexes together, nets out'], len: 64, draw: { power: true, shape: 'cones', nets: true } },
    trolling:  { cat: 'power', name: 'leisure boat trolling a lure', label: ['LEISURE BOAT', 'trolling one lure astern'], len: 50, draw: { power: true, troll: true } },
    nuc:       { cat: 'nuc', name: 'vessel not under command', label: ['NOT UNDER COMMAND', 'two black balls, drifting'], len: 70, draw: { shape: 'balls', beam: .34 } },
    ram:       { cat: 'ram', name: 'vessel restricted in her ability to manoeuvre', label: ['RESTRICTED IN HER ABILITY', 'TO MANOEUVRE: ball, diamond, ball'], len: 70, draw: { power: true, shape: 'bdb', beam: .34 } },
    cbd:       { cat: 'cbd', name: 'ship constrained by her draught', label: ['SHIP CONSTRAINED BY', 'HER DRAUGHT: cylinder'], len: 96, draw: { ship: true, shape: 'cyl' } },
    ferry:     { cat: 'power', name: 'scheduled ferry', label: ['SCHEDULED FERRY'], len: 84, draw: { ferry: true }, commercial: true },
    cargo:     { cat: 'power', name: 'coastal cargo ship', label: ['COASTAL CARGO SHIP', 'needs the deep water of the channel'], len: 96, draw: { ship: true }, commercial: true },
    oars:      { cat: 'oars', name: 'rowing boat', label: ['ROWING BOAT'], len: 34, draw: { oars: true, beam: .45 } },
    kayak:     { cat: 'oars', name: 'kayak', you: 'kayak', label: ['KAYAK'], len: 40, draw: { kayak: true, beam: .3 } },
  };
  const RANK = { power: 0, sail: 1, fishing: 2, nuc: 3, ram: 3 };   // F70

  /* ---------- geometry -> situation (G) ---------- */
  const inStern = a => a > 112.5 && a < 247.5;   // more than 22.5° abaft the beam (F50)
  function situation(rel, relFromOther, otherHdg) {
    if (inStern(relFromOther)) return 'own-overtakes';          // we lie in HER sternlight sector
    if (inStern(rel)) return 'other-overtakes';                 // she lies in OUR sternlight sector
    if ((rel <= 6 || rel >= 354) && Math.abs(norm(otherHdg) - 180) <= 6) return 'head-on';   // reciprocal, bow to bow (F54)
    return rel < 180 ? 'crossing-starboard' : 'crossing-port';  // she is on our starboard (0–112.5°) or port side
  }
  /* Tack from the wind direction (F48): wind over the starboard side = starboard tack = boom to port. */
  function tackOf(hdg, windFrom) { const w = norm(windFrom - hdg); return w > 0 && w < 180 ? 'starboard' : 'port'; }
  const boomSide = tack => (tack === 'starboard' ? -1 : 1);   // -1 = boom to port, +1 = boom to starboard

  /* ---------- the decision (D1–D7) ---------- */
  function decide(sc) {
    const o = V[sc.own.kind], t = V[sc.other.kind], sit = sc.sit;
    const D = (who, rule, action) => ({ who, rule, action });
    if (sit === 'own-overtakes') return D('own', '13', 'overtake');                       // D1 (F49, F50, F52)
    if (sit === 'other-overtakes') return D('other', '13', 'standon-ot');                 // D1 + F59
    if (sc.narrow && t.commercial && !o.commercial) return D('own', '44', sit === 'head-on' ? 'narrow-headon' : 'narrow');   // D2 (F91, F92, F33)
    if (o.cat === 'oars') return D('own', '43', 'kayak-own');                             // D3 (F90)
    if (t.cat === 'oars') return D('other', '43', 'rowing');                              // D3 (F90, S12)
    if (t.cat === 'cbd') return D('own', '18d', 'impede');                                // D4 (F68)
    if (RANK[o.cat] !== RANK[t.cat]) return RANK[o.cat] < RANK[t.cat] ? D('own', '18', 'r18') : D('other', '18', o.cat === 'sail' ? 'sail-stand' : 'standon');   // D5 (F65–F67)
    if (o.cat === 'sail') {                                                               // D6 (F45, F46)
      if (sc.ownTack !== sc.otherTack) return sc.ownTack === 'port' ? D('own', '12i', 'sail-give') : D('other', '12i', 'sail-stand');
      return sc.windward === 'own' ? D('own', '12ii', 'sail-give') : D('other', '12ii', 'sail-stand');
    }
    if (sit === 'head-on') return D('both', '14', 'both-stbd');                           // D7 (F53)
    return sit === 'crossing-starboard' ? D('own', '15', 'stbd-astern') : D('other', '15', 'standon');   // D7 (F56, F59)
  }

  /* ---------- scenario templates ----------
     sector: where the other vessel is placed relative to own bow-up vessel —
       stbd (starboard bow, crossing), port (port bow, crossing), cross (either), head (bow to bow),
       we-overtake (she is ahead, we come up in her stern sector), they-overtake (she comes up in ours).
     wind: constraint for sailing rounds — any | own-port | own-stbd (own tack) | own-windward | own-leeward | opposite.
     expect: [who, action] the template is meant to teach; scene() resamples until the derived answer
     matches (a self-check that the picture shows what the template intends), and selfTest() verifies it. */
  const T = (id, own, other, sector, x) => Object.assign({ id, own, other, sector }, x || {});
  const TEMPLATES = [
    // --- you are a motorboat (power-driven, F7) ---
    T('pp-stbd', 'power', 'power', 'stbd', { expect: ['own', 'stbd-astern'] }),              // D7, S1
    T('pp-port', 'power', 'power', 'port', { expect: ['other', 'standon'] }),                // D7, S2
    T('pp-head', 'power', 'power', 'head', { expect: ['both', 'both-stbd'] }),               // D7, S3
    T('pp-we-ot', 'power', 'power', 'we-overtake', { expect: ['own', 'overtake'] }),         // D1, S8
    T('pp-they-ot', 'power', 'power', 'they-overtake', { expect: ['other', 'standon-ot'] }), // D1
    T('ps-stbd', 'power', 'sail', 'stbd', { wind: 'any', expect: ['own', 'r18'] }),          // D5, S4
    T('ps-port', 'power', 'sail', 'port', { wind: 'any', expect: ['own', 'r18'] }),          // D5 (trap T1)
    T('ps-head', 'power', 'sail', 'head', { wind: 'any', expect: ['own', 'r18'] }),          // D5, F55
    T('ps-they-ot', 'power', 'sail', 'they-overtake', { wind: 'any', expect: ['other', 'standon-ot'] }),   // D1 overrides D5 (T3)
    T('ps-we-ot', 'power', 'sail', 'we-overtake', { wind: 'any', expect: ['own', 'overtake'] }),           // D1
    T('pm-stbd', 'power', 'motorsail', 'stbd', { wind: 'any', expect: ['own', 'stbd-astern'] }),   // F8, S5
    T('pm-port', 'power', 'motorsail', 'port', { wind: 'any', expect: ['other', 'standon'] }),     // F8, S5
    T('pf-stbd', 'power', 'fishing', 'stbd', { expect: ['own', 'r18'] }),                    // D5, S10
    T('pf-port', 'power', 'fishing', 'port', { expect: ['own', 'r18'] }),                    // D5, S10
    T('pf-they-ot', 'power', 'fishing', 'they-overtake', { expect: ['other', 'standon-ot'] }),   // D1 overrides D5
    T('pt-port', 'power', 'trolling', 'port', { expect: ['other', 'standon'] }),             // F10 (T11)
    T('pt-stbd', 'power', 'trolling', 'stbd', { expect: ['own', 'stbd-astern'] }),           // F10
    T('pn-cross', 'power', 'nuc', 'cross', { expect: ['own', 'r18'] }),                      // D5, S14
    T('pr-cross', 'power', 'ram', 'cross', { expect: ['own', 'r18'] }),                      // D5
    T('pc-cross', 'power', 'cbd', 'cross', { expect: ['own', 'impede'] }),                   // D4, S13
    T('pfe-nar-port', 'power', 'ferry', 'port', { narrow: true, expect: ['own', 'narrow'] }),         // D2, S11
    T('pfe-nar-stbd', 'power', 'ferry', 'stbd', { narrow: true, expect: ['own', 'narrow'] }),         // D2, S11
    T('pca-nar-head', 'power', 'cargo', 'head', { narrow: true, expect: ['own', 'narrow-headon'] }),  // D2, F32, F33
    T('pca-nar-stbd', 'power', 'cargo', 'stbd', { narrow: true, expect: ['own', 'narrow'] }),         // D2, F33
    T('pfe-open-port', 'power', 'ferry', 'port', { expect: ['other', 'standon'] }),          // T16: open water, ordinary rules
    T('pfe-open-stbd', 'power', 'ferry', 'stbd', { expect: ['own', 'stbd-astern'] }),        // T16
    T('po-stbd', 'power', 'oars', 'stbd', { expect: ['other', 'rowing'] }),                  // D3, S12
    T('pk-port', 'power', 'kayak', 'port', { expect: ['other', 'rowing'] }),                 // D3, S12
    // --- you are a sailing yacht under sail (F8) ---
    T('ss-opp-port', 'sail', 'sail', 'cross', { wind: 'opposite-own-port', expect: ['own', 'sail-give'] }),     // D6, S6
    T('ss-opp-stbd', 'sail', 'sail', 'cross', { wind: 'opposite-own-stbd', expect: ['other', 'sail-stand'] }),  // D6
    T('ss-same-wind', 'sail', 'sail', 'cross', { wind: 'same-own-windward', expect: ['own', 'sail-give'] }),    // D6, S7
    T('ss-same-lee', 'sail', 'sail', 'cross', { wind: 'same-own-leeward', expect: ['other', 'sail-stand'] }),   // D6
    T('ss-head-port', 'sail', 'sail', 'head', { wind: 'opposite-own-port', expect: ['own', 'sail-give'] }),     // D6, T20
    T('ss-head-stbd', 'sail', 'sail', 'head', { wind: 'opposite-own-stbd', expect: ['other', 'sail-stand'] }),  // D6, T20
    T('sp-stbd', 'sail', 'power', 'stbd', { wind: 'any', expect: ['other', 'sail-stand'] }), // D5
    T('sp-port', 'sail', 'power', 'port', { wind: 'any', expect: ['other', 'sail-stand'] }), // D5
    T('sp-head', 'sail', 'power', 'head', { wind: 'any', expect: ['other', 'sail-stand'] }), // D5, F55
    T('sp-they-ot', 'sail', 'power', 'they-overtake', { wind: 'any', expect: ['other', 'standon-ot'] }),   // D1
    T('sp-we-ot', 'sail', 'power', 'we-overtake', { wind: 'any', expect: ['own', 'overtake'] }),           // D1 (T3)
    T('sm-stbd', 'sail', 'motorsail', 'stbd', { wind: 'any', expect: ['other', 'sail-stand'] }),           // F8 + D5
    T('sf-cross', 'sail', 'fishing', 'cross', { wind: 'any', expect: ['own', 'r18'] }),      // D5, F66
    T('sn-cross', 'sail', 'nuc', 'cross', { wind: 'any', expect: ['own', 'r18'] }),          // D5, F66
    T('sr-cross', 'sail', 'ram', 'cross', { wind: 'any', expect: ['own', 'r18'] }),          // D5, F66
    T('sc-cross', 'sail', 'cbd', 'cross', { wind: 'any', expect: ['own', 'impede'] }),       // D4
    T('sfe-nar-port', 'sail', 'ferry', 'port', { narrow: true, wind: 'any', expect: ['own', 'narrow'] }),   // D2, F92
    T('sfe-nar-stbd', 'sail', 'ferry', 'stbd', { narrow: true, wind: 'any', expect: ['own', 'narrow'] }),   // D2, F92
    T('sca-nar-head', 'sail', 'cargo', 'head', { narrow: true, wind: 'any', expect: ['own', 'narrow-headon'] }),   // D2, F33
    T('sfe-open-port', 'sail', 'ferry', 'port', { wind: 'any', expect: ['other', 'sail-stand'] }),   // T16 + D5
    T('so-cross', 'sail', 'oars', 'cross', { wind: 'any', expect: ['other', 'rowing'] }),    // D3
    // --- you are a yacht motor-sailing (power-driven, F8) ---
    T('ms-stbd', 'motorsail', 'sail', 'stbd', { wind: 'any', expect: ['own', 'r18'] }),      // F8 + D5
    T('ms-port', 'motorsail', 'sail', 'port', { wind: 'any', expect: ['own', 'r18'] }),      // F8 + D5
    T('mp-stbd', 'motorsail', 'power', 'stbd', { wind: 'any', expect: ['own', 'stbd-astern'] }),   // F8 + D7
    T('mp-port', 'motorsail', 'power', 'port', { wind: 'any', expect: ['other', 'standon'] }),     // F8 + D7
    // --- you are paddling a kayak (F6, F71) ---
    T('kfe-nar', 'kayak', 'ferry', 'cross', { narrow: true, expect: ['own', 'narrow'] }),     // D2 (Rule 44 names open boats under oars) + D3
    T('ks-cross', 'kayak', 'sail', 'cross', { wind: 'any', expect: ['own', 'kayak-own'] }),  // D3 (S12 exam framing)
    T('kp-cross', 'kayak', 'power', 'cross', { expect: ['own', 'kayak-own'] }),              // D3
  ];

  /* ---------- scene generation ---------- */
  const W = 480, H = 420;
  function tryScene(tpl, rng) {
    const narrow = !!tpl.narrow;
    const own = { kind: tpl.own, x: 240, y: 300, hdg: 0, len: V[tpl.own].len };
    const other = { kind: tpl.other, len: V[tpl.other].len };
    let P = null, sector = tpl.sector;
    if (sector === 'cross') sector = rng() < .5 ? 'stbd' : 'port';
    const place = (rel, dist) => { const [ux, uy] = dirv(rel); other.x = own.x + ux * dist; other.y = own.y - 0 + uy * dist; };
    if (sector === 'stbd' || sector === 'port') {
      place(sector === 'stbd' ? 25 + rng() * 70 : 265 + rng() * 70, 150 + rng() * 80);
      P = [own.x, own.y - (95 + rng() * 65)];
      other.hdg = bearing(other.x, other.y, P[0], P[1]);
    } else if (sector === 'head') {
      place(norm(-3 + rng() * 6), 185 + rng() * 45);
      other.hdg = norm(180 + (-4 + rng() * 8));
      P = [(own.x + other.x) / 2, (own.y + other.y) / 2];
    } else if (sector === 'we-overtake') {
      place(norm(-22 + rng() * 44), 115 + rng() * 45);
      other.hdg = norm(-15 + rng() * 30);
    } else { // they-overtake
      own.y = 150;
      place(150 + rng() * 60, 125 + rng() * 40);
      other.hdg = norm(-15 + rng() * 30);
    }
    const xmin = narrow ? 105 : 50, xmax = narrow ? 375 : 430;
    if (other.x < xmin || other.x > xmax || other.y < 48 || other.y > 362) return null;
    const rel = norm(bearing(own.x, own.y, other.x, other.y) - own.hdg);
    const relFromOther = norm(bearing(other.x, other.y, own.x, own.y) - other.hdg);
    const sc = { tpl, own, other, P, narrow, sector, rel, relFromOther, sit: situation(rel, relFromOther, other.hdg), wind: null };
    // wind for sailing rounds: no boat may have the wind within 40° of her bow (cannot sail) or within 20° of dead astern (tack ambiguous)
    const sails = [tpl.own, tpl.other].map(k => V[k].draw.sail);
    if (sails[0] || sails[1]) {
      const ok = w => [own, other].every((v, i) => { if (!sails[i]) return true; const r = norm(w - v.hdg), off = Math.min(r, 360 - r); return off >= 40 && off <= 160; });
      let found = false;
      for (let i = 0; i < 80 && !found; i++) {
        const w = Math.floor(rng() * 36) * 10;
        if (!ok(w)) continue;
        sc.wind = w;
        sc.ownTack = sails[0] ? tackOf(own.hdg, w) : null;
        sc.otherTack = sails[1] ? tackOf(other.hdg, w) : null;
        // windward = nearer to where the wind comes from: positive projection on the wind-from direction (F46)
        const [ux, uy] = dirv(w), dot = (other.x - own.x) * ux + (other.y - own.y) * uy;
        sc.windward = Math.abs(dot) < 30 ? null : (dot > 0 ? 'other' : 'own');
        const c = tpl.wind || 'any';
        if (c === 'any') found = true;
        else if (c === 'opposite-own-port') found = sc.ownTack === 'port' && sc.otherTack === 'starboard';
        else if (c === 'opposite-own-stbd') found = sc.ownTack === 'starboard' && sc.otherTack === 'port';
        else if (c === 'same-own-windward') found = sc.ownTack === sc.otherTack && sc.windward === 'own';
        else if (c === 'same-own-leeward') found = sc.ownTack === sc.otherTack && sc.windward === 'other';
      }
      if (!found) return null;
    }
    sc.d = decide(sc);
    return sc;
  }
  function scene(tpl, rng) {
    rng = rng || Math.random;
    let last = null;
    for (let i = 0; i < 400; i++) {
      const sc = tryScene(tpl, rng);
      if (!sc) continue;
      last = sc;
      if (!tpl.expect || (sc.d.who === tpl.expect[0] && sc.d.action === tpl.expect[1])) return sc;
    }
    console.warn('trainer-rules: template ' + tpl.id + ' could not reach its intended answer', last && last.d);
    return last;
  }

  /* ---------- drawing (fact sheet illustration conventions: bow-up own vessel, course arrows meeting at
     the collision point, dashed teal wind arrow, labels in words, inset "bow up" compass) ---------- */
  function txt(x, y, s, o) {
    o = o || {};
    return `<text x="${f1(x)}" y="${f1(y)}" font-size="${o.size || 12}" font-weight="${o.weight || 500}" fill="${o.fill || 'var(--ink)'}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle"${o.halo !== false ? ` paint-order="stroke" stroke="${o.halo || 'var(--shallow)'}" stroke-width="3.5" stroke-linejoin="round"` : ''}${o.italic ? ' font-style="italic"' : ''}>${esc(s)}</text>`;
  }
  const lines = (x, y, arr, o) => arr.map((l, i) => txt(x, y + i * ((o && o.lh) || 14), l, o)).join('');
  const arrowHead = (x, y, ang, fill, k) => { k = k || 9; return `<polygon points="0,0 ${-k * .5},${k} ${k * .5},${k}" fill="${fill}" transform="translate(${f1(x)},${f1(y)}) rotate(${f1(ang)})"/>`; };
  const line = (x1, y1, x2, y2, color, w, dashed) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${dashed ? ' stroke-dasharray="6 5"' : ''}/>`;
  /* Hull seen from above, bow up before rotation; o = V[kind].draw plus {sail: +1|-1 boom side}. */
  function hull(v, fill, o) {
    const len = v.len, hb = len * (o.beam || .38) / 2, stroke = o.stroke || 'var(--ink)';
    let body, extra = '';
    if (o.kayak) body = `<polygon points="0,${-len / 2} ${f1(hb)},0 0,${len / 2} ${f1(-hb)},0" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/><line x1="${f1(-hb - 12)}" y1="6" x2="${f1(hb + 12)}" y2="-6" stroke="${stroke}" stroke-width="2"/>`;
    else if (o.ship || o.ferry) body = `<path d="M0,${-len / 2} L${f1(hb)},${f1(-len / 4)} L${f1(hb)},${f1(len / 2 - 6)} Q${f1(hb)},${f1(len / 2)} ${f1(hb - 6)},${f1(len / 2)} L${f1(-hb + 6)},${f1(len / 2)} Q${f1(-hb)},${f1(len / 2)} ${f1(-hb)},${f1(len / 2 - 6)} L${f1(-hb)},${f1(-len / 4)} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
    else body = `<polygon points="0,${-len / 2} ${f1(hb)},${f1(-len / 6)} ${f1(hb)},${f1(len / 2 - 3)} ${f1(-hb)},${f1(len / 2 - 3)} ${f1(-hb)},${f1(-len / 6)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
    if (o.ferry) extra += `<rect x="${f1(-hb * .7)}" y="${f1(-len * .18)}" width="${f1(hb * 1.4)}" height="${f1(len * .55)}" rx="3" fill="#f4f4f4" stroke="#41505c"/><circle cx="0" cy="${f1(-len * .06)}" r="3" fill="#41505c"/>`;
    if (o.ship) extra += `<rect x="${f1(-hb * .6)}" y="${f1(-len * .3)}" width="${f1(hb * 1.2)}" height="${f1(len * .42)}" rx="2" fill="none" stroke="#f4f4f4" stroke-width="1.2"/><rect x="${f1(-hb * .7)}" y="${f1(len * .22)}" width="${f1(hb * 1.4)}" height="${f1(len * .16)}" rx="2" fill="#f4f4f4" stroke="#41505c"/>`;
    if (o.oars) extra += `<line x1="${f1(-hb)}" y1="0" x2="${f1(-hb - 14)}" y2="-7" stroke="${stroke}" stroke-width="2"/><line x1="${f1(hb)}" y1="0" x2="${f1(hb + 14)}" y2="-7" stroke="${stroke}" stroke-width="2"/>`;
    if (o.sail) {
      // Boom swung ~55° out to the side opposite the wind (F48); the mainsail is the triangle behind it.
      const s = o.sail, my = -len * .1, bl = len * .5, bx = s * bl * Math.sin(rad(55)), by = my + bl * Math.cos(rad(55));
      extra += `<polygon points="0,${f1(my)} ${f1(bx)},${f1(by)} 0,${f1(len * .3)}" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.3"/><line x1="0" y1="${f1(my)}" x2="${f1(bx)}" y2="${f1(by)}" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="${f1(my)}" r="2.2" fill="var(--ink)"/>`;
    }
    if (o.power) extra += `<path d="M${f1(-hb * .5)},${f1(len / 2 - 1)} l-2,9 M0,${f1(len / 2 - 1)} l0,10 M${f1(hb * .5)},${f1(len / 2 - 1)} l2,9" stroke="var(--muted)" stroke-width="1.5" fill="none"/>`;
    if (o.nets) extra += `<path d="M0,${f1(len / 2)} c8,14 -8,30 4,46 c6,8 -4,16 2,26" fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-dasharray="3 4"/>`;
    if (o.troll) extra += `<line x1="0" y1="${f1(len / 2)}" x2="0" y2="${f1(len / 2 + 40)}" stroke="var(--ink-2)" stroke-width="1"/><circle cx="0" cy="${f1(len / 2 + 42)}" r="2" fill="var(--ink-2)"/>`;
    if (!o.kayak && !o.oars) extra += `<circle cx="${f1(-hb)}" cy="${f1(-len / 5)}" r="3.5" fill="${C.red}" stroke="var(--paper)" stroke-width="1"/><circle cx="${f1(hb)}" cy="${f1(-len / 5)}" r="3.5" fill="${C.green}" stroke="var(--paper)" stroke-width="1"/>`;
    return `<g transform="translate(${f1(v.x)},${f1(v.y)}) rotate(${f1(v.hdg)})">${body}${extra}</g>`;
  }
  /* Side-view day-shape glyph on a short mast, drawn unrotated beside the vessel. */
  function shapeIcon(kind, x, y) {
    const st = `fill="${C.black}" stroke="var(--paper)" stroke-width=".8"`;
    const ball = cy => `<circle cx="${x}" cy="${cy}" r="5" ${st}/>`;
    const coneUp = cy => `<polygon points="${x - 5},${cy + 5} ${x + 5},${cy + 5} ${x},${cy - 5}" ${st}/>`;
    const coneDown = cy => `<polygon points="${x - 5},${cy - 5} ${x + 5},${cy - 5} ${x},${cy + 5}" ${st}/>`;
    const diamond = cy => `<polygon points="${x},${cy - 6} ${x + 5},${cy} ${x},${cy + 6} ${x - 5},${cy}" ${st}/>`;
    let s = `<line x1="${x}" y1="${y - 26}" x2="${x}" y2="${y + 14}" stroke="var(--ink-2)" stroke-width="1.5"/>`;
    if (kind === 'cones') s += coneDown(y - 14) + coneUp(y - 2);          // apexes together, one above the other (fishing)
    else if (kind === 'balls') s += ball(y - 16) + ball(y - 3);          // NUC
    else if (kind === 'bdb') s += ball(y - 20) + diamond(y - 7) + ball(y + 6);   // RAM
    else if (kind === 'cyl') s += `<rect x="${x - 4}" y="${y - 20}" width="8" height="18" ${st}/>`;   // CBD
    else if (kind === 'cone-down') s += coneDown(y - 10);                 // motor-sailing
    return s;
  }
  function courseArrow(v, P, color) {
    const [ux, uy] = dirv(v.hdg), bx = v.x + ux * v.len / 2, by = v.y + uy * v.len / 2, ex = bx + ux * 34, ey = by + uy * 34;
    let s = line(bx, by, ex, ey, color, 2.5) + arrowHead(ex, ey, v.hdg, color, 9);
    if (P) s += line(ex, ey, P[0], P[1], color, 1.5, true);
    else s += line(ex, ey, ex + ux * 150, ey + uy * 150, color, 1.5, true);
    return s;
  }
  function windArrow(sc) {
    // the arrow points the way the wind BLOWS (from sc.wind towards sc.wind + 180); placed in the corner farthest from both boats
    const corners = sc.narrow ? [[355, 70], [355, 300], [125, 300], [125, 125]] : [[420, 70], [420, 300], [60, 300], [60, 125]];   // clear of the compass inset, the status line and the shores
    const far = c => Math.min(Math.hypot(c[0] - sc.own.x, c[1] - sc.own.y), Math.hypot(c[0] - sc.other.x, c[1] - sc.other.y));
    const [cx, cy] = corners.reduce((a, b) => (far(b) > far(a) ? b : a));
    const [ux, uy] = dirv(sc.wind + 180), x1 = cx - ux * 26, y1 = cy - uy * 26, x2 = cx + ux * 26, y2 = cy + uy * 26;
    return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${WIND}" stroke-width="3" stroke-dasharray="8 5" stroke-linecap="round"/>` + arrowHead(x2, y2, sc.wind + 180, WIND, 12) +
      `<path d="M${f1(x1 - 7)},${f1(y1)} l7,-9 l7,9" fill="none" stroke="${WIND}" stroke-width="3" stroke-linecap="round" opacity=".6" transform="rotate(${f1(sc.wind + 180)} ${f1(x1)} ${f1(y1)})"/>` +
      txt(cx, cy + 40, 'WIND', { fill: WIND, weight: 700, size: 13 }) + txt(cx, cy + 54, 'read the tack from the boom', { size: 9, fill: 'var(--muted)' });
  }
  function art(sc) {
    const o = V[sc.own.kind], t = V[sc.other.kind];
    let g = `<rect width="${W}" height="${H}" rx="8" fill="var(--shallow)"/>`;
    if (sc.narrow) g += `<polygon points="0,0 72,0 60,120 82,250 66,${H} 0,${H}" fill="${SHORE}" opacity=".9"/><polygon points="${W},0 408,0 420,140 398,260 414,${H} ${W},${H}" fill="${SHORE}" opacity=".9"/>`;
    const own = sc.own, oth = sc.other;
    // courses first, then hulls on top
    g += courseArrow(oth, sc.P, 'var(--ink-2)') + courseArrow(own, sc.P, 'var(--ink-2)');
    if (sc.P) g += `<circle cx="${f1(sc.P[0])}" cy="${f1(sc.P[1])}" r="4" fill="none" stroke="var(--bad)" stroke-width="2"/>`;
    const od = Object.assign({}, t.draw, t.draw.sail ? { sail: boomSide(sc.otherTack) } : {});
    const wd = Object.assign({}, o.draw, o.draw.sail ? { sail: boomSide(sc.ownTack) } : {});
    g += hull(oth, t.draw.ferry ? FERRY : t.draw.ship ? SHIP : C.hullLight, od);
    g += hull(own, 'var(--ink)', Object.assign({ stroke: 'var(--paper)' }, wd));
    // day shapes beside the vessel that carries them (on her starboard beam, unrotated)
    const sideOff = (v, k) => { const [px, py] = dirv(v.hdg + 90); return [v.x + px * k, v.y + py * k]; };
    if (t.draw.shape) { const [sx, sy] = sideOff(oth, t.len * (t.draw.beam || .38) / 2 + 22); g += shapeIcon(t.draw.shape, sx, sy); }
    if (o.draw.shape) { const [sx, sy] = sideOff(own, o.len * .19 + 22); g += shapeIcon(o.draw.shape, sx, sy); }
    // labels: other vessel below her if she is high on the page, else above; own vessel below (or beside when she comes from astern)
    const below = oth.y < 215;
    const ly = below ? oth.y + oth.len / 2 + 16 : oth.y - oth.len / 2 - 10 - (t.label.length - 1) * 14;
    g += lines(Math.min(Math.max(oth.x, 85), W - 85), ly, t.label, { size: 11, weight: 700, fill: 'var(--ink)' });
    const youLabel = ['YOU: ' + (o.you || o.name)];
    if (sc.sector === 'they-overtake') { const left = oth.x >= own.x; g += txt(own.x + (left ? -40 : 40), own.y, youLabel[0], { size: 11, weight: 700, anchor: left ? 'end' : 'start' }); }
    else g += lines(own.x, own.y + own.len / 2 + 16, youLabel, { size: 11, weight: 700 });
    if (sc.wind != null) g += windArrow(sc);
    // inset compass ("bow up") and the status line
    g += `<circle cx="30" cy="30" r="17" fill="var(--paper)" stroke="var(--line)"/><polygon points="30,17 25,34 35,34" fill="var(--ink)"/>` + txt(30, 56, 'bow up', { size: 9, fill: 'var(--muted)' });
    g += txt(W / 2, H - 14, (sc.narrow ? 'Narrow sound / harbour area' : 'Open water, plenty of sea room') + ' · daylight · her bearing is steady, the range is closing', { size: 10.5, fill: 'var(--ink-2)' });
    const off = sc.rel < 180 ? sc.rel : 360 - sc.rel;
    const label = `Plan view with your bow up. You are a ${o.you || o.name}. A ${t.name} is about ${Math.round(off)} degrees on your ${sc.rel < 180 ? 'starboard' : 'port'} side${sc.narrow ? ' in a narrow sound' : ' in open water'}, on a converging course.`;
    return S.svg(W, H, g, { label });
  }

  /* ---------- answer options ----------
     Each option knows when it is TRUE for a round (holds), so distractors are always wrong for that
     round and the correct option is the one decide() derived. */
  const WHO = [
    // Rule 15 is also literally true for a motorboat with a ferry/cargo ship on her starboard side in a narrow
    // channel (both power-driven), so it is not offered as a distractor there: Rule 44 is the rule that decides.
    { k: 'own-15', t: 'You: she is on your starboard side (Rule 15)', holds: d => d.who === 'own' && d.rule === '15', when: sc => !(sc.d.rule === '44' && sc.sit === 'crossing-starboard' && V[sc.own.kind].cat === 'power') },
    { k: 'own-18', t: 'You: she ranks above you in the Rule 18 pecking order', holds: d => d.who === 'own' && d.rule === '18' },
    { k: 'own-13', t: 'You: you are overtaking her (Rule 13)', holds: d => d.who === 'own' && d.rule === '13' },
    { k: 'own-12', t: 'You: port tack gives way to starboard tack (Rule 12(a)(i))', holds: d => d.who === 'own' && d.rule === '12i' },
    { k: 'own-12w', t: 'You: the windward boat gives way (Rule 12(a)(ii))', holds: d => d.who === 'own' && d.rule === '12ii' },
    { k: 'own-44', t: 'You: pleasure craft keep clear of ferries and commercial traffic in narrow waters (Norwegian Rule 44)', holds: d => d.who === 'own' && d.rule === '44' },
    { k: 'own-18d', t: 'You: do not impede a vessel constrained by her draught (Rule 18(d))', holds: d => d.who === 'own' && d.rule === '18d' },
    // Rule 43 always binds a kayak, so when the kayak's answer is Rule 44 (ferry in a narrow sound) this is not a distractor.
    { k: 'own-43', t: 'You: a kayak or rowing boat keeps well out of the way of other vessels (Norwegian Rule 43)', holds: d => d.who === 'own' && d.rule === '43', when: sc => V[sc.own.kind].cat !== 'oars' },
    { k: 'oth-15', t: 'The other vessel: you are on her starboard side (Rule 15)', holds: d => d.who === 'other' && d.rule === '15' },
    { k: 'oth-18', t: 'The other vessel: a power-driven vessel keeps out of the way of a sailing vessel (Rule 18)', holds: d => d.who === 'other' && d.rule === '18' },
    { k: 'oth-13', t: 'The other vessel: she is overtaking you (Rule 13)', holds: d => d.who === 'other' && d.rule === '13' },
    { k: 'oth-12', t: 'The other vessel: she is on port tack (Rule 12(a)(i))', holds: d => d.who === 'other' && d.rule === '12i' },
    { k: 'oth-12w', t: 'The other vessel: she is the windward boat (Rule 12(a)(ii))', holds: d => d.who === 'other' && d.rule === '12ii' },
    { k: 'oth-43', t: 'The rowing boat or kayak keeps well out of your way (Norwegian Rule 43) — but you still slow down and pass well clear', holds: d => d.who === 'other' && d.rule === '43', when: sc => V[sc.other.kind].cat === 'oars' },   // only meaningful when she IS a rowing boat/kayak
    // Two power-driven vessels bow to bow in a narrow channel: Rule 14 is not wrong, but Rule 44 decides, so it is not offered as a distractor there.
    { k: 'both-14', t: 'Both of you: head-on, each alters course to starboard (Rule 14)', holds: d => d.who === 'both', when: sc => !(sc.d.rule === '44' && sc.sit === 'head-on' && V[sc.own.kind].cat === 'power') },
    { k: 'none', t: 'Neither: her bearing is steady, so there is no risk of collision', holds: () => false },
    { k: 'sail-always', t: 'The motorboat, always: a sailing vessel has priority in every situation', holds: () => false, when: sc => [sc.own.kind, sc.other.kind].some(k => V[k].draw.sail) },
    { k: 'big', t: 'The smaller boat, always: a big ship has right of way wherever she is', holds: () => false, when: sc => [sc.own.kind, sc.other.kind].some(k => V[k].commercial || V[k].cat === 'cbd') },
  ];
  const ACT = [
    { k: 'stbd-astern', t: 'Alter course to starboard early and substantially and pass astern of her; do not cross ahead', when: sc => sc.sit !== 'head-on' },   // head-on: "alter to starboard" is right, so never a distractor there
    { k: 'r18', t: 'Keep out of her way whichever side she is on: alter early, pass well clear, preferably astern' },
    { k: 'overtake', t: 'Keep clear of her until you are finally past and clear; pass on either side at a safe distance' },
    { k: 'sail-give', t: 'Keep clear: bear away or tack early to pass astern of the other boat', when: sc => V[sc.own.kind].draw.sail },
    { k: 'narrow', t: 'Slow down early, keep to the starboard side of the channel, pass astern of her or wait; never cross close ahead', when: sc => sc.narrow },
    { k: 'narrow-headon', t: 'Keep well over to the starboard side of the channel, slow down and let her pass; do not get in her way', when: sc => sc.narrow },
    { k: 'impede', t: 'Alter course early, give her the deep water and do not cross ahead of her', when: sc => ['cbd', 'cargo', 'ferry'].includes(sc.other.kind) },
    { k: 'kayak-own', t: 'Slow down, stop if necessary, and keep well out of her way' },
    { k: 'both-stbd', t: 'Both alter course to starboard and pass port to port (red to red)' },
    { k: 'standon', t: 'Keep course and speed and watch her; if she clearly does nothing, act yourself, but not by turning to port' },
    { k: 'standon-ot', t: 'Keep course and speed; she must keep clear of you until she is finally past and clear' },
    { k: 'sail-stand', t: 'Stand on: keep course and speed, but watch her and be ready to act if she does nothing', when: sc => V[sc.own.kind].draw.sail },
    { k: 'rowing', t: 'Slow down, keep a sharp look-out and pass well clear with little wash while the rowing boat or kayak keeps out of your way', when: sc => V[sc.other.kind].cat === 'oars' },
    { k: 'port-ahead', t: 'Alter course to port and cross ahead of her' },
    { k: 'speed-up', t: 'Increase speed to get past before she arrives' },
    { k: 'five-hold', t: 'Sound five short blasts and hold your course until she moves' },
    { k: 'one-port', t: 'You alter to port and she alters to starboard, so you pass starboard to starboard' },
    { k: 'port-turn', t: 'Alter course to port to open the distance' },
  ];
  // Options that say the same thing as the correct one in other words are never offered as distractors.
  const KEEPCLEAR = ['stbd-astern', 'r18', 'overtake', 'sail-give', 'narrow', 'narrow-headon', 'impede', 'kayak-own'];
  const STAND = ['standon', 'standon-ot', 'sail-stand'];
  function whoChoices(sc) {
    const d = sc.d;
    const correct = WHO.find(o => o.holds(d));
    const pool = WHO.filter(o => o !== correct && !o.holds(d) && (!o.when || o.when(sc)));
    // one option with the opposite outcome first, then any two others
    const opposite = pool.filter(o => (d.who === 'own' ? o.k.startsWith('oth-') : o.k.startsWith('own-')));
    const first = opposite.length ? K.pick(opposite) : K.pick(pool);
    const rest = B.shuffle(pool.filter(o => o !== first)).slice(0, 2);
    const choices = B.shuffle([correct, first].concat(rest));
    return { choices: choices.map(o => o.t), answer: choices.indexOf(correct) };
  }
  function actChoices(sc) {
    const d = sc.d;
    const correct = ACT.find(o => o.k === d.action);
    const group = KEEPCLEAR.includes(d.action) || d.action === 'rowing' ? KEEPCLEAR : STAND.includes(d.action) ? STAND : [];
    const cands = ACT.filter(o => o !== correct && !group.includes(o.k) && (!o.when || o.when(sc)));
    // one option from the opposite camp (stand on vs keep clear) first, then two more
    const camp = cands.filter(o => (group === KEEPCLEAR ? STAND.includes(o.k) : KEEPCLEAR.includes(o.k)));
    const first = camp.length ? K.pick(camp) : K.pick(cands);
    const rest = B.shuffle(cands.filter(o => o !== first)).slice(0, 2);
    const choices = B.shuffle([correct, first].concat(rest));
    return { choices: choices.map(o => o.t), answer: choices.indexOf(correct) };
  }

  /* ---------- explanations: the derivation in words, citing the rule ---------- */
  const CAT = {
    power: 'A motorboat is a power-driven vessel (Rule 3(b)).',
    sail: 'A yacht under sail with her engine off is a sailing vessel (Rule 3(c)).',
    motorsail: 'A yacht with sails up and her engine running is a POWER-DRIVEN vessel (Rule 3(c)); the cone, apex down, is her day signal (Rule 25(e)).',
    trolling: 'A boat trolling a lure is NOT "engaged in fishing" (Rule 3(d) excludes trolling lines), so she is an ordinary power-driven vessel.',
    fishing: 'Two cones with apexes together (red over white all-round lights at night) mean a vessel engaged in fishing with gear that restricts her manoeuvrability (Rules 3(d), 26).',
    nuc: 'Two black balls (two all-round red lights at night) mean a vessel not under command (Rules 3(f), 27(a)).',
    ram: 'Ball, diamond, ball (red-white-red all-round lights at night) mean a vessel restricted in her ability to manoeuvre (Rules 3(g), 27(b)).',
    cbd: 'A cylinder (three all-round red lights at night) means a vessel constrained by her draught (Rules 3(h), 28).',
    ferry: 'In open water with sea room a ferry is simply a power-driven vessel: the ordinary rules apply and size gives no priority (Norwegian Rule 44 only applies in narrow waters, busy fairways and harbours).',
    cargo: 'A cargo ship is a power-driven vessel (Rule 3(b)).',
    oars: 'A rowing boat is a vessel (Rule 3(a)) but neither power-driven nor sailing, so Rule 18 gives her no rung.',
    kayak: 'A kayak is a vessel (Rule 3(a)) but neither power-driven nor sailing, so Rule 18 gives it no rung.',
  };
  const ABOVE = { sail: 'a sailing vessel (Rule 18(a)(iv))', fishing: 'a vessel engaged in fishing (Rule 18(a)(iii) for power, 18(b)(iii) for sail)', nuc: 'a vessel not under command (Rule 18(a)(i), 18(b)(i))', ram: 'a vessel restricted in her ability to manoeuvre (Rule 18(a)(ii), 18(b)(ii))' };
  const cats = (a, b) => (CAT[a] === CAT[b] ? CAT[a].replace('A motorboat is', 'Both are motorboats, i.e.').replace('vessel (', 'vessels (') : CAT[a] + ' ' + CAT[b]);
  function geomText(sc) {
    const off = Math.round((sc.rel < 180 ? sc.rel : 360 - sc.rel) / 5) * 5, side = sc.rel < 180 ? 'starboard' : 'port';
    const where = off <= 6 ? 'right ahead' : off <= 67.5 ? `about ${off}° on your ${side} bow` : off <= 112.5 ? `nearly abeam to ${side} (about ${off}° from your bow)` : `on your ${side} quarter (about ${off}° from your bow)`;
    let s = `She is ${where}; her bearing is steady and the range is closing, so risk of collision exists (Rule 7(d)).`;
    if (sc.sit === 'crossing-starboard' || sc.sit === 'crossing-port') s += ' Neither vessel is in the other\'s 135° stern sector and the courses are not reciprocal: a crossing situation.';
    else if (sc.sit === 'head-on') s += ' The courses are reciprocal, bow to bow.';
    return s;
  }
  function explain(sc) {
    const o = V[sc.own.kind], t = V[sc.other.kind], d = sc.d;
    const p = [geomText(sc)];
    switch (d.rule) {
      case '13':
        p.push(d.who === 'own'
          ? 'You are coming up on her from more than 22.5° abaft her beam (at night you would see only her white sternlight), so you are OVERTAKING. Any vessel overtaking any other keeps out of the way, whatever the types: Rule 13 overrides Rule 18' + (t.cat === 'sail' || o.cat === 'sail' ? ' (even sail against power)' : '') + '. Keep clear until finally past and clear, on either side; if in doubt, assume you are overtaking (Rule 13(a)–(d)).'
          : 'She is coming up from more than 22.5° abaft YOUR beam, inside your 135° sternlight sector, so SHE is overtaking and keeps clear until finally past and clear, whatever her type (Rule 13 overrides Rule 18' + (t.cat === 'sail' ? ', so sail-over-power does not help her' : '') + '). You keep your course and speed (Rule 17(a)(i)).');
        break;
      case '44':
        p.push(`This is a narrow sound / harbour area. Norwegian Rule 44: pleasure craft and open boats under oars, sail or engine keep out of the way, as far as practicable, of larger vessels, scheduled ferries and other commercial traffic in narrow waters, busy fairways and harbour areas; Rule 9(b) also says a vessel under 20 m or a sailing vessel shall not impede a vessel that can only navigate inside the channel. ${o.cat === 'sail' ? 'That applies to a sailing yacht too: sail-over-power (Rule 18) does not help you here.' : o.cat === 'oars' ? 'A kayak is an open boat under oars, named in Rule 44; Norwegian Rule 43 also requires a vessel under oars to keep WELL out of the way of other vessels.' : 'The port/starboard geometry of Rule 15 does not decide this.'} Slow down early, keep to your starboard side of the channel (Rule 9(a)), pass astern or wait, and never cross close ahead of a ferry.`);
        break;
      case '43':
        p.push(d.who === 'own'
          ? `${CAT.kayak} Norwegian Rule 43: a vessel under oars manoeuvres with caution, slackens speed, stops if required and keeps WELL out of the way of other vessels${sc.narrow ? '; Rule 44 adds the duty to keep clear of ferries and commercial traffic in narrow waters' : ''}. Do not count on her giving way to you.`
          : `${CAT.oars} Norwegian Rule 43: a vessel under oars keeps WELL out of the way of other vessels, slowing or stopping if required. That does not excuse you: keep a proper look-out, slow down, pass well clear and mind your wash (Rules 2, 5, 6, 8), because she cannot get out of your way quickly.`);
        break;
      case '18d':
        p.push(`${CAT.cbd} Rule 18(d): every vessel other than one not under command or restricted in her ability to manoeuvre shall avoid impeding her safe passage. Alter early, give her the deep water and do not cross ahead; she is probably also confined to the channel (Rule 9(b)).`);
        break;
      case '18':
        if (d.who === 'own') p.push(`${CAT[sc.own.kind]} ${CAT[sc.other.kind]} Rule 18: a ${o.cat === 'power' ? 'power-driven' : 'sailing'} vessel keeps out of the way of ${ABOVE[t.cat]}, whichever side she is on; the crossing rule (Rule 15) only decides between two power-driven vessels. Act early and substantially (Rule 16) and pass well clear${t.cat === 'fishing' ? ' of her and her gear' : ''}, preferably astern.`);
        else p.push(`${CAT[sc.other.kind]} ${CAT[sc.own.kind]} Rule 18(a)(iv): a power-driven vessel keeps out of the way of a sailing vessel, whichever side she is on. You stand on: keep course and speed, but watch her and act yourself if she clearly does nothing (Rule 17).`);
        break;
      case '12i':
        p.push(`Two sailing vessels with the wind on different sides: the one with the wind on her PORT side keeps out of the way (Rule 12(a)(i)). Read the tack from the boom: the windward side is opposite the mainsail (Rule 12(b)). You have the wind on your ${sc.ownTack} side (boom out to ${sc.ownTack === 'port' ? 'starboard' : 'port'}), she has it on her ${sc.otherTack} side, so ${d.who === 'own' ? 'you give way: bear away or tack early to pass clear.' : 'she gives way and you stand on, keeping course and speed (Rule 17). Rule 14 does not apply between sailing vessels.'}`);
        break;
      case '12ii':
        p.push(`Both boats have the wind on the ${sc.ownTack} side: same tack. Rule 12(a)(ii): the vessel to WINDWARD, nearer to where the wind comes from, keeps out of the way of the vessel to leeward. ${d.who === 'own' ? 'You are the windward boat, so you give way: bear away to pass astern of her, or tack away.' : 'She is the windward boat, so she gives way and you stand on, keeping course and speed (Rule 17).'}`);
        break;
      case '14':
        p.push(`${cats(sc.own.kind, sc.other.kind)} Meeting on reciprocal courses, bow to bow, is a head-on situation (Rule 14(b)): EACH alters course to STARBOARD so that you pass port to port, red to red (Rule 14(a)), with one short blast as you turn (Rule 34(a)). If in doubt whether it is head-on, assume it is (Rule 14(c)).`);
        break;
      default: // 15
        p.push(d.who === 'own'
          ? `${cats(sc.own.kind, sc.other.kind)} Rule 15: in a crossing situation the vessel which has the other on her STARBOARD side keeps out of the way. She is on your starboard side, so that is you. Act early and substantially (Rule 16): alter to starboard and pass astern; do not cross ahead. At night you would see her RED sidelight: red means stop (Rule 21(b)).`
          : `${cats(sc.own.kind, sc.other.kind)} She is on your PORT side, so YOU are on HER starboard side: she gives way (Rule 15) and you stand on, keeping course and speed (Rule 17(a)(i)). If it becomes clear she is not acting you may act, but not by turning to port towards her (Rule 17(a)(ii), (c)); sound at least five short blasts if in doubt (Rule 34(d)). At night you would see her GREEN sidelight: green means go.`);
    }
    return p.join(' ');
  }

  /* ---------- rounds ---------- */
  const PROMPT_WHO = 'Who gives way, and under which rule?';
  const PROMPT_ACT = 'What should you do?';
  function makeRound(tpl, form, rng) {
    const sc = scene(tpl, rng);
    const c = form === 'act' ? actChoices(sc) : whoChoices(sc);
    const o = V[sc.own.kind];
    return { key: tpl.id + ':' + form, tpl: tpl.id, art: art(sc), prompt: form === 'act' ? PROMPT_ACT : PROMPT_WHO, hint: `${sc.narrow ? 'Narrow waters' : 'Open water'} · you are a ${o.you || o.name}`, choices: c.choices, answer: c.answer, explain: explain(sc), scene: sc };
  }
  function selfTest(n) {
    const out = [];
    TEMPLATES.forEach(tpl => {
      for (let i = 0; i < (n || 20); i++) {
        const r = makeRound(tpl, i % 2 ? 'act' : 'who');
        const sc = r.scene;
        if (sc.d.who !== tpl.expect[0] || sc.d.action !== tpl.expect[1]) out.push(`${tpl.id}: derived ${sc.d.who}/${sc.d.action}, template expects ${tpl.expect.join('/')}`);
        if (r.choices.length !== 4 || new Set(r.choices).size !== 4) out.push(`${tpl.id}: ${r.choices.length} choices / duplicates`);
        if (r.answer < 0 || r.answer > 3) out.push(`${tpl.id}: bad answer index`);
        if (!/Rule/.test(r.explain) || r.explain.length < 80) out.push(`${tpl.id}: explanation missing a rule citation`);
        if (!r.art.includes('<svg')) out.push(`${tpl.id}: no picture`);
        if (/GIVE-WAY|STAND-ON/.test(r.art)) out.push(`${tpl.id}: picture leaks the answer`);
        // no distractor may be a true statement for the round (two defensible answers)
        const others = r.choices.filter((c, k) => k !== r.answer).join(' | ');
        if (i % 2 === 0) {
          if (V[tpl.own].cat === 'oars' && /Rule 43\)/.test(others)) out.push(`${tpl.id}: Rule 43 (also true) offered as a distractor to a kayak`);
          if (sc.d.rule === '44' && sc.sit === 'crossing-starboard' && V[tpl.own].cat === 'power' && /You: she is on your starboard side/.test(others)) out.push(`${tpl.id}: Rule 15 (also true) offered as a distractor`);
          if (sc.d.rule === '44' && sc.sit === 'head-on' && V[tpl.own].cat === 'power' && /Rule 14\)/.test(others)) out.push(`${tpl.id}: Rule 14 (also true) offered as a distractor`);
        } else if (sc.sit === 'head-on' && /Alter course to starboard early/.test(others)) out.push(`${tpl.id}: "alter to starboard" offered as a distractor in a head-on round`);
      }
    });
    return out;
  }

  function mount(root) {
    let lastId = null, form = Math.random() < .5 ? 'who' : 'act';
    return K.drill(root, {
      makeRound() {
        let tpl = K.pick(TEMPLATES), tries = 0;
        while (tpl.id === lastId && tries++ < 8) tpl = K.pick(TEMPLATES);   // never the same scenario twice in a row
        lastId = tpl.id;
        form = form === 'who' ? 'act' : 'who';                             // the two question forms alternate
        return makeRound(tpl, form);
      },
    });
  }

  B.registerTrainer({
    id: 'rules',
    title: 'Who gives way?',
    description: 'Random crossing, head-on, overtaking, sail-against-sail and narrow-channel encounters: decide who gives way and what to do, with the rule that decides it.',
    mount,
  });

  // one gallery picture per template (seeded, so the same picture renders every time)
  TEMPLATES.forEach((tpl, i) => S.gallery.push({ name: 'trainer-rules ' + tpl.id, svg: () => art(scene(tpl, seeded(1000 + i))) }));

  // expose for tests
  B.rulesDrills = { TEMPLATES, V, scene, decide, situation, tackOf, makeRound, selfTest, art };
})();
