/* Skipper Prep — "Sound signals" trainer.
   Multiple-choice drill built on BOAT.trainerKit.drill with a Web Audio horn/bell player on top.
   Three families of rounds rotate:
     (H) hear    — a signal is shown on the BOAT.svg.soundSignal timeline (and played with the Play button);
                   "what does it mean?"
     (R) reverse — a situation picture; "what do you sound?" — after answering, the correct signal is
                   shown on the timeline and can be played
     (N) numbers — durations, intervals, equipment, when Rule 34 applies, light supplements

   Every correct answer is derived from the verified fact sheets and the derivation is written beside the
   data:  F = facts/sound-and-distress-signals.md (F15 = its fact F15),  S = facts/colregs-steering.md.
   Core derivations used throughout:
     D1  Rule 32: short blast ≈ 1 s, prolonged blast 4–6 s (F2, F3; S-F80). The player uses exactly 1 s and 5 s,
         gaps of 1 s inside a signal (0.5 s for the "rapid" doubt signal, ≈2 s between the two prolonged blasts of
         Rule 35(b), F38), i.e. the same scale as the timeline picture.
     D2  Rule 34(a) manoeuvring signals are given by a POWER-DRIVEN vessel, only when vessels are IN SIGHT of one
         another: 1 short = starboard, 2 short = port, 3 short = astern propulsion (F14–F17; S-F77).
     D3  Rule 34(d): at least five short and rapid blasts = doubt / danger; the vessel in doubt SHALL give it, any
         vessel (F25, F30; S-F79). Norwegian Rule 41(c) uses the same ≥5 short blasts for "channel too narrow, wait"
         (F33; S-F88).
     D4  Rule 34(c) narrow-channel overtaking: 2 prolonged + 1 short = "on your STARBOARD side", 2 prolonged + 2 short =
         "on your PORT side", reply prolonged-short-prolonged-short = agreement (F21–F23; S-F36).
     D5  Rule 34(e): one prolonged blast when nearing a blind bend, answered with one prolonged blast (F28; S-F38).
     D6  Rule 35 (restricted visibility, every ≤ 2 min): power-driven making way = 1 prolonged (F37); power-driven
         stopped = 2 prolonged ≈2 s apart (F38); sailing / fishing / NUC / RAM / CBD / towing = 1 prolonged + 2 short
         (F39, and a fishing vessel at anchor F40); manned towed vessel = 1 prolonged + 3 short (F41); at anchor =
         bell rung rapidly ≈5 s every ≤ 1 MINUTE, optionally short-prolonged-short (F43, F45); aground = anchor bell
         plus three separate strokes before and after (F46); pilot identity = 4 short (F50); vessels under 12 m may
         omit all of these but must then make some other efficient sound signal every ≤ 2 min (F48).
     D7  Norwegian Rule 41(a): a power-driven vessel announces her arrival in a narrow channel from about ½ NM with a
         LONG blast of at least 10 s (F31; S-F86). Confirmed in the fact sheet (confidence high), so it is included.
     D8  Annex IV 1(b): continuous sounding of any fog-signalling apparatus is a DISTRESS signal (F57).
*/
(function () {
  'use strict';
  const B = window.BOAT;
  const S = B.svg;                       // BOAT_SVG: soundSignal, svg, text, COLORS
  const K = B.trainerKit;                // drill, pick, distractors
  const esc = B.esc;

  /* ---------- timeline geometry (mirrors BOAT.svg.soundSignal so the playhead lines up) ---------- */
  const U = 22, X0 = 24, TOP = 52, HGT = 34;

  /* Blast schedule for a soundSignal pattern — the same algorithm as the picture helper (D1):
     '.' = 1 s, '-' = 5 s, 1 s gap (0.5 s for the ≥5-short doubt signal, 2 s between the two prolonged blasts of Rule 35(b)). */
  function schedule(pattern) {
    const compact = pattern.replace(/ /g, '');
    const doubt = compact === '.....', gap = doubt ? .5 : 1, blasts = [];
    let t = 0, spaces = 0;
    for (const ch of pattern) {
      if (ch === ' ') { if (++spaces > 1) t += 1; continue; }
      spaces = 0;
      if (blasts.length && compact === '--') t += 1;
      const d = ch === '.' ? 1 : 5;
      blasts.push({ s: t, d, kind: 'horn' });
      t += d + gap;
    }
    return { blasts, total: t - gap };
  }

  /* Standard signal picture: BOAT.svg.soundSignal with the printed meaning replaced by a neutral caption
     (the meaning is the answer), blast bars tagged for the player, and a playhead added. */
  function signalArt(pattern, caption) {
    let svg = S.soundSignal(pattern, { meaning: caption || ' ' });
    svg = svg.replace(/<rect x="([\d.]+)" y="52" width="([\d.]+)" height="34" rx="3"/g, '<rect class="blast" x="$1" y="52" width="$2" height="34" rx="3"');
    return addPlayhead(svg);
  }
  function addPlayhead(svg) {
    return svg.replace(/<\/svg>\s*$/, `<g class="playhead" style="display:none"><line x1="${X0}" x2="${X0}" y1="${TOP - 10}" y2="${TOP + HGT + 10}" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/></g></svg>`);
  }

  /* Custom timeline for signals the library does not draw: the ≥10 s Norwegian long blast, the anchor / aground
     bell and the continuous distress horn. Same geometry and conventions (bars on a seconds ruler). */
  const BELL = '#b0702f';   // bronze, readable on light and dark paper
  function customArt(kind, caption) {
    let blasts, total, sym, note, color = 'var(--sea)';
    if (kind === 'long10') { blasts = [{ s: 0, d: 10, kind: 'horn', label: '≥ 10 s' }]; total = 12; sym = '——— (one long blast)'; }
    else if (kind === 'anchor') { blasts = [{ s: 0, d: 5, kind: 'bell', label: 'ring rapidly ≈5 s' }]; total = 8; sym = 'bell'; color = BELL; note = 'repeated every ≤ 1 minute'; }
    else if (kind === 'aground') {
      blasts = [0, .9, 1.8].map(s => ({ s, d: .5, kind: 'stroke', label: '' })).concat([{ s: 3.2, d: 5, kind: 'bell', label: 'rapid ≈5 s' }], [9.1, 10, 10.9].map(s => ({ s, d: .5, kind: 'stroke', label: '' })));
      total = 12; sym = 'bell: 3 strokes · 5 s · 3 strokes'; color = BELL; note = 'repeated every ≤ 1 minute';
    }
    else if (kind === 'continuous') { blasts = [{ s: 0, d: 12, kind: 'horn', label: 'without stopping …' }]; total = 12; sym = '——————— ∞'; color = 'var(--bad)'; }
    else throw new Error('customArt: unknown kind ' + kind);
    const W = Math.max(400, Math.min(640, X0 * 2 + total * U + 20)), H = 176;
    let g = `<rect width="${W}" height="${H}" rx="8" fill="var(--paper-2)"/>`;
    blasts.forEach(b => {
      g += `<rect class="blast" x="${X0 + b.s * U}" y="${TOP}" width="${Math.max(4, b.d * U - 2)}" height="${HGT}" rx="3" fill="${color}"/>`;
      if (b.label) g += S.text(X0 + (b.s + b.d / 2) * U - 1, TOP - 10, b.label, { size: 11, fill: 'var(--ink-2)' });
    });
    if (kind === 'aground') { g += S.text(X0 + 1.4 * U, TOP - 10, '3 strokes', { size: 11, fill: 'var(--ink-2)' }); g += S.text(X0 + 10.5 * U, TOP - 10, '3 strokes', { size: 11, fill: 'var(--ink-2)' }); }
    const ry = TOP + HGT + 12;
    g += `<line x1="${X0}" y1="${ry}" x2="${X0 + total * U}" y2="${ry}" stroke="var(--ink-2)" stroke-width="1"/>`;
    for (let s = 0; s <= total; s++) { g += `<line x1="${X0 + s * U}" y1="${ry}" x2="${X0 + s * U}" y2="${ry + (s % 5 === 0 ? 7 : 4)}" stroke="var(--ink-2)" stroke-width="1"/>`; if (s % 2 === 0) g += S.text(X0 + s * U, ry + 16, String(s), { size: 10, fill: 'var(--muted)' }); }
    g += S.text(X0 + total * U + 14, ry + 16, 's', { size: 10, fill: 'var(--muted)' });
    g += S.text(X0, 22, sym, { size: 16, weight: 700, anchor: 'start' });
    if (note) g += S.text(W - 16, 22, note, { size: 11, fill: 'var(--muted)', anchor: 'end' });
    if (caption) g += S.text(W / 2, H - 38, caption, { size: 11, fill: 'var(--ink-2)' });
    return addPlayhead(S.svg(W, H, g, { label: `Sound signal timeline: ${sym}${caption ? '. ' + caption : ''}` }));
  }
  function customSchedule(kind) {
    if (kind === 'long10') return { blasts: [{ s: 0, d: 10, kind: 'horn' }], total: 10 };
    if (kind === 'anchor') return { blasts: [{ s: 0, d: 5, kind: 'bell' }], total: 5 };
    if (kind === 'aground') return { blasts: [0, .9, 1.8].map(s => ({ s, d: .5, kind: 'stroke' })).concat([{ s: 3.2, d: 5, kind: 'bell' }], [9.1, 10, 10.9].map(s => ({ s, d: .5, kind: 'stroke' }))), total: 11.4 };
    if (kind === 'continuous') return { blasts: [{ s: 0, d: 12, kind: 'horn' }], total: 12 };
    throw new Error('customSchedule: unknown kind ' + kind);
  }
  // A "signal" object = { art, sched }; sig(pattern) for standard patterns, csig(kind) for the custom ones.
  const sig = (pattern, caption) => ({ art: signalArt(pattern, caption), sched: schedule(pattern) });
  const csig = (kind, caption) => ({ art: customArt(kind, caption), sched: customSchedule(kind) });

  /* ---------- situation pictures for the reverse rounds (plan view, bow up; starboard = right of the page) ---------- */
  const boatPath = (x, y, scale, rot) => `<path transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${scale || 1})" d="M0,-34 C11,-30 15,-12 15,8 L15,30 Q0,36 -15,30 L-15,8 C-15,-12 -11,-30 0,-34 Z" fill="${S.COLORS.hullLight}" stroke="var(--ink)" stroke-width="2"/>`;
  const sailPath = (x, y) => `<path d="M${x},${y - 30} L${x + 2},${y + 12} L${x - 16},${y + 12} Z" fill="${S.COLORS.white}" stroke="var(--ink)" stroke-width="1.5"/>`;
  function scene(kind, title, sub) {
    const W = 480, H = 230;
    let g = `<rect width="${W}" height="${H}" rx="8" fill="var(--shallow)"/>`;
    const arrow = `<defs><marker id="sndArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)"/></marker></defs>`;
    const curve = (d) => `<path d="${d}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="7 5" marker-end="url(#sndArrow)"/>`;
    const cx = 110, cy = 120;
    g += arrow;
    if (kind === 'turn-stbd') g += boatPath(cx, cy) + curve(`M${cx},${cy - 40} C${cx + 5},${cy - 70} ${cx + 40},${cy - 80} ${cx + 75},${cy - 70}`) + S.text(cx + 70, cy - 48, 'to STARBOARD', { size: 11, weight: 700, fill: 'var(--accent)' });
    else if (kind === 'turn-port') g += boatPath(cx, cy) + curve(`M${cx},${cy - 40} C${cx - 5},${cy - 70} ${cx - 40},${cy - 80} ${cx - 75},${cy - 70}`) + S.text(cx - 60, cy - 48, 'to PORT', { size: 11, weight: 700, fill: 'var(--accent)' });
    else if (kind === 'astern') g += boatPath(cx, cy) + curve(`M${cx},${cy + 40} L${cx},${cy + 85}`) + S.text(cx + 48, cy + 70, 'engine astern', { size: 11, weight: 700, fill: 'var(--accent)' });
    else if (kind === 'doubt') g += boatPath(cx, cy) + boatPath(cx + 120, cy - 60, .8, 225) + S.text(cx + 60, cy - 10, '?', { size: 44, weight: 800, fill: 'var(--warn)' });
    else if (kind === 'overtake-stbd' || kind === 'overtake-port' || kind === 'agree' || kind === 'narrow' || kind === 'channel-entry') {
      // narrow channel: shore bands left and right, vessel A ahead in the centre, B astern
      g += `<rect x="0" y="0" width="38" height="${H}" fill="var(--line)"/><rect x="${W / 2 - 38}" y="0" width="38" height="${H}" fill="var(--line)"/>`;
      const ax = W / 4, ay = 70;
      if (kind === 'channel-entry') { g += boatPath(ax, 185, .8) + S.text(ax, 20, 'narrow channel ahead', { size: 11, weight: 700, fill: 'var(--ink-2)' }) + curve(`M${ax},${145} L${ax},${60}`) + S.text(ax, 110, '≈ ½ NM', { size: 11, fill: 'var(--ink-2)', halo: 'var(--shallow)' }); }
      else if (kind === 'narrow') { g += boatPath(ax, 170, .8) + boatPath(ax, 60, .8, 180) + S.text(ax, 115, 'too narrow to pass', { size: 11, weight: 700, fill: 'var(--bad)' }); }
      else {
        const side = kind === 'overtake-port' ? -1 : 1;
        g += boatPath(ax, ay, .8) + S.text(ax + 44, ay, 'A', { size: 13, weight: 700 });
        const bx = ax + side * 34;
        g += boatPath(bx, 175, .8) + S.text(bx + 44 * side, 175, 'B', { size: 13, weight: 700 });
        if (kind === 'agree') g += S.text(ax, 20, 'A agrees', { size: 11, weight: 700, fill: 'var(--ok)' });
        else g += curve(`M${bx},${140} C${bx},${100} ${ax + side * 50},${90} ${ax + side * 52},${30}`) + S.text(ax, 20, side > 0 ? "A's STARBOARD side" : "A's PORT side", { size: 11, weight: 700, fill: 'var(--accent)' });
      }
    }
    else if (kind === 'bend') {
      // channel runs up the right of the panel, then turns left around a headland that fills the lower left
      g += `<path d="M0,70 L120,70 Q160,70 160,110 L160,${H} L0,${H} Z" fill="var(--line)"/>`;
      g += boatPath(200, 185, .8) + S.text(200, 222, 'you', { size: 11, fill: 'var(--ink-2)' });
      g += boatPath(70, 36, .7, 90) + S.text(70, 60, 'hidden vessel?', { size: 11, fill: 'var(--ink-2)', italic: true });
      g += curve(`M200,140 L200,60 Q200,36 176,36 L130,36`);
    }
    else if (kind === 'fog-power' || kind === 'fog-stopped' || kind === 'fog-sail' || kind === 'fog-tow' || kind === 'fog-towed' || kind === 'fog-fishing-anchor' || kind === 'fog-small') {
      g += `<rect width="${W / 2}" height="${H}" rx="8" fill="var(--paper-2)" opacity=".85"/>`;
      if (kind === 'fog-sail') g += boatPath(cx, cy, .9) + sailPath(cx + 4, cy - 8);
      else if (kind === 'fog-tow' || kind === 'fog-towed') {
        // tug ahead (higher on the page), towline, towed boat astern; both heading up
        g += `<line x1="${cx}" y1="${cy - 26}" x2="${cx}" y2="${cy + 22}" stroke="var(--ink)" stroke-width="1.5"/>` + boatPath(cx, cy - 50, .7) + boatPath(cx, cy + 42, .6);
        g += S.text(cx + 30, cy - 50, kind === 'fog-tow' ? 'you (towing)' : 'tug', { size: 11, fill: 'var(--ink-2)', anchor: 'start' });
        g += S.text(cx + 30, cy + 42, kind === 'fog-towed' ? 'you (towed)' : 'tow', { size: 11, fill: 'var(--ink-2)', anchor: 'start' });
      }
      else if (kind === 'fog-fishing-anchor') g += boatPath(cx, cy, .9) + S.text(cx, cy + 4, '⚓', { size: 22 }) + S.text(cx, cy + 50, 'fishing vessel, at anchor', { size: 11, fill: 'var(--ink-2)' });
      else g += boatPath(cx, cy, kind === 'fog-small' ? .7 : .9);
      if (kind === 'fog-power') g += `<path d="M${cx - 10},${cy + 40} q-6,20 -10,45 M${cx + 10},${cy + 40} q6,20 10,45" fill="none" stroke="var(--sea)" stroke-width="2" opacity=".8"/>`;
      if (kind === 'fog-stopped') g += S.text(cx, cy + 56, 'stopped, no way on', { size: 11, weight: 700, fill: 'var(--ink-2)' });
      if (kind === 'fog-small') g += S.text(cx, cy + 52, 'under 12 m, no whistle', { size: 11, weight: 700, fill: 'var(--ink-2)' });
      g += S.text(cx, 24, 'FOG', { size: 14, weight: 800, fill: 'var(--muted)' });
    }
    else if (kind === 'anchor') g += boatPath(cx, cy, .9) + S.text(cx, cy + 4, '⚓', { size: 22 }) + S.text(cx, 24, 'FOG', { size: 14, weight: 800, fill: 'var(--muted)' });
    else if (kind === 'aground') g += `<path d="M${cx - 60},${cy + 60} L${cx - 20},${cy + 10} L${cx + 30},${cy + 30} L${cx + 60},${cy + 60} Z" fill="var(--ink-2)"/>` + boatPath(cx, cy - 10, .9, -20) + S.text(cx, 24, 'FOG', { size: 14, weight: 800, fill: 'var(--muted)' });
    else if (kind === 'distress') g += boatPath(cx, cy, .9) + `<path d="M${cx - 8},${cy - 8} q8,-30 16,0 q-8,-14 -16,0 M${cx},${cy - 30} q10,-22 0,-40 q-10,18 0,40" fill="${S.COLORS.red}" opacity=".9"/>` + S.text(cx, cy + 56, 'taking water — need help', { size: 11, weight: 700, fill: 'var(--bad)' });
    else if (kind === 'sail-sight') g += boatPath(cx, cy, .9) + sailPath(cx + 4, cy - 8) + curve(`M${cx},${cy - 40} C${cx + 5},${cy - 70} ${cx + 40},${cy - 80} ${cx + 75},${cy - 70}`) + S.text(cx + 60, cy + 56, 'under sail, in sight', { size: 11, fill: 'var(--ink-2)' });
    else if (kind === 'none') { /* text only */ }
    // right-hand text panel
    const tx = W / 2 + 16;
    g += S.text(tx, 60, title, { size: 15, weight: 700, anchor: 'start' });
    if (sub) sub.split('\n').forEach((l, i) => { g += S.text(tx, 88 + i * 18, l, { size: 12, fill: 'var(--ink-2)', anchor: 'start' }); });
    g += S.text(tx, H - 30, 'What do you sound?', { size: 12, fill: 'var(--muted)', anchor: 'start', italic: true });
    return S.svg(W, H, g, { label: `${title}. ${sub || ''} What do you sound?` });
  }

  /* ---------- vocabulary: meanings (answers to "what does it mean?") and signals (answers to "what do you sound?") ---------- */
  const M = {
    stbd: 'I am altering my course to starboard',
    port: 'I am altering my course to port',
    astern: 'I am operating astern propulsion',
    doubt: 'I do not understand your intentions — doubt / danger signal',
    ovS: 'I intend to overtake you on your starboard side',
    ovP: 'I intend to overtake you on your port side',
    agree: 'Agreed — you may overtake me, I will make room',
    bend: 'I am nearing a blind bend of the channel',
    pdMaking: 'Power-driven vessel making way through the water',
    pdStopped: 'Power-driven vessel underway but stopped, no way on',
    hampered: 'Sailing, fishing, NUC, RAM, constrained-by-draught or towing vessel',
    towed: 'Manned vessel being towed (last of the tow)',
    anchorWarn: 'Vessel at anchor warning you of her position',
    pilot: 'Pilot vessel on pilotage duty (identity signal)',
    anchor: 'Vessel at anchor',
    aground: 'Vessel aground',
    distress: 'Distress — she needs assistance',
    r41: 'Power-driven vessel announcing her arrival in a narrow channel (Norwegian Rule 41)',
    tooNarrow: 'Channel too narrow for us to pass — wait until I am through (Norwegian Rule 41)',
  };
  const SG = {
    s1: 'One short blast', s2: 'Two short blasts', s3: 'Three short blasts', s4: 'Four short blasts',
    s5: 'At least five short, rapid blasts',
    p1: 'One prolonged blast', p2: 'Two prolonged blasts', pdd: 'One prolonged followed by two short blasts',
    pddd: 'One prolonged followed by three short blasts', ppd: 'Two prolonged followed by one short blast',
    ppdd: 'Two prolonged followed by two short blasts', pdpd: 'Prolonged, short, prolonged, short',
    dpd: 'Short, prolonged, short',
    bell: 'Rapid ringing of the bell for about 5 seconds, at least every minute',
    bellAground: 'Three bell strokes, 5 s rapid ringing, three bell strokes, at least every minute',
    long10: 'One long blast of at least 10 seconds',
    cont: 'Continuous sounding of the horn without stopping',
    none: 'No whistle signal is required',
    other: 'Some other efficient sound signal at least every 2 minutes',
  };
  const M_ALL = Object.keys(M), SG_ALL = Object.keys(SG);

  /* ---------- (H) hear rounds: pattern -> meaning ---------- */
  // H(key, signal, prompt, answer, explain, traps, exclude): traps = preferred wrong options, exclude = never offered
  // (used where the same pattern has a second, context-dependent meaning: one prolonged blast = blind bend in sight
  // (D5) OR power-driven vessel making way in fog (D6)).
  const H = (key, signal, prompt, answer, explain, traps, exclude) => ({ key: 'h-' + key, signal, prompt, answer, explain, traps: traps || [], exclude: exclude || [] });
  const IN_SIGHT = 'A motorboat in sight of you sounds this signal. What does it mean?';
  const IN_FOG = 'Fog. You hear this signal repeated about every two minutes. What is it?';
  const HEAR = [
    H('stbd', () => sig('.', 'In sight of one another'), IN_SIGHT, 'stbd', 'One short blast (about 1 s) from a power-driven vessel in sight means "I am altering my course to STARBOARD" (Rule 34(a)).', ['port', 'astern']),          // F15 (D2)
    H('port', () => sig('..', 'In sight of one another'), IN_SIGHT, 'port', 'Two short blasts mean "I am altering my course to PORT" (Rule 34(a)). Remember: one = starboard, two = port, three = astern.', ['stbd', 'astern']),     // F16 (D2)
    H('astern', () => sig('...', 'In sight of one another'), IN_SIGHT, 'astern', 'Three short blasts mean "I am operating astern propulsion" — her engine is going astern, though she may still be moving ahead (Rule 34(a)).', ['port', 'stbd']),   // F17 (D2)
    H('doubt', () => sig('.....', 'In sight of one another'), 'A vessel in sight of you sounds this. What does it mean?', 'doubt', 'At least five short and rapid blasts is the doubt / danger signal of Rule 34(d): "I do not understand your intentions" or "I doubt you are doing enough to avoid collision". React at once.', ['astern', 'pilot']),   // F25 (D3)
    H('ovS', () => sig('- - .', 'Narrow channel, vessel astern of you'), 'In a narrow channel a vessel astern of you sounds this. What does it mean?', 'ovS', 'Two prolonged blasts followed by ONE short blast: "I intend to overtake you on your STARBOARD side" (Rule 34(c)(i)). If you agree, answer prolonged-short-prolonged-short.', ['ovP', 'agree']),   // F21 (D4)
    H('ovP', () => sig('- - . .', 'Narrow channel, vessel astern of you'), 'In a narrow channel a vessel astern of you sounds this. What does it mean?', 'ovP', 'Two prolonged blasts followed by TWO short blasts: "I intend to overtake you on your PORT side" (Rule 34(c)(i)). One short = starboard, two short = port, as in Rule 34(a).', ['ovS', 'agree']),   // F22 (D4)
    H('agree', () => sig('- . - .', 'Narrow channel, you have asked to overtake'), 'You asked to overtake in a narrow channel and the vessel ahead answers with this. What does it mean?', 'agree', 'Prolonged, short, prolonged, short (Morse "C") from the vessel about to be overtaken means she agrees and will take steps to let you pass safely (Rule 34(c)(ii)). You still keep clear (Rule 13).', ['doubt', 'ovS']),   // F23, F24 (D4)
    H('bend', () => sig('-', 'In sight, near a bend of the channel'), 'Good visibility. A vessel approaching a sharp bend of the fairway sounds this once. What does it mean?', 'bend', 'A vessel nearing a bend where others may be hidden sounds ONE prolonged blast (4–6 s); a vessel within hearing around the bend answers with one prolonged blast (Rule 34(e), Rule 9(f)).', ['pdMaking', 'ovS'], ['pdMaking']),   // F28 (D5); exclude the fog meaning of the same pattern
    H('fogMaking', () => sig('-', 'Fog, repeated every ≤ 2 minutes'), IN_FOG, 'pdMaking', 'In restricted visibility a power-driven vessel MAKING WAY through the water sounds one prolonged blast at intervals of not more than 2 minutes (Rule 35(a)).', ['pdStopped', 'hampered'], ['bend']),   // F37 (D6)
    H('fogStopped', () => sig('- -', 'Fog, repeated every ≤ 2 minutes'), IN_FOG, 'pdStopped', 'Two prolonged blasts about 2 s apart, every ≤ 2 minutes: a power-driven vessel underway but STOPPED and making no way through the water (Rule 35(b)).', ['pdMaking', 'hampered']),   // F38 (D6)
    H('fogHampered', () => sig('- . .', 'Fog, repeated every ≤ 2 minutes'), IN_FOG, 'hampered', 'One prolonged followed by two short blasts, every ≤ 2 minutes, is the fog signal of a vessel not under command, restricted in her ability to manoeuvre, constrained by her draught, SAILING, fishing, or towing/pushing (Rule 35(c)).', ['towed', 'pdMaking']),   // F39 (D6)
    H('fogTowed', () => sig('- . . .', 'Fog, repeated every ≤ 2 minutes'), IN_FOG, 'towed', 'One prolonged followed by THREE short blasts, every ≤ 2 minutes, sounded right after the tug\'s signal: a manned vessel being towed, or the last vessel of the tow (Rule 35(e)).', ['hampered', 'pilot']),   // F41 (D6)
    H('fogAnchorWarn', () => sig('. - .', 'Fog, from a vessel you are approaching'), 'Fog. Between bell signals a vessel you are heading towards sounds this on her whistle. What is it?', 'anchorWarn', 'Short, prolonged, short: a vessel at anchor MAY sound this in addition to her bell to warn an approaching vessel of her position and the possibility of collision (Rule 35(g)).', ['anchor', 'pilot']),   // F45 (D6)
    H('fogPilot', () => sig('....', 'Fog, in addition to her normal fog signal'), 'Fog. A vessel adds this to her usual fog signal. What is it?', 'pilot', 'Four short blasts is the identity signal a pilot vessel on pilotage duty may sound in addition to her Rule 35(a), (b) or (g) signal (Rule 35(k)).', ['doubt', 'towed']),   // F50 (D6)
    H('fogAnchor', () => csig('anchor', 'Fog, repeated every ≤ 1 minute'), 'Fog. You hear a bell rung rapidly for about five seconds, repeated every minute. What is it?', 'anchor', 'A vessel at anchor rings the bell rapidly for about 5 seconds at intervals of not more than ONE minute (Rule 35(g)) — note one minute, not two.', ['aground', 'pdStopped']),   // F43 (D6)
    H('fogAground', () => csig('aground', 'Fog, repeated every ≤ 1 minute'), 'Fog. You hear three distinct bell strokes, then rapid ringing for five seconds, then three strokes again. What is it?', 'aground', 'A vessel AGROUND gives the anchor bell signal and, in addition, three separate and distinct strokes immediately before and after the rapid ringing (Rule 35(h)).', ['anchor', 'hampered']),   // F46 (D6)
    H('distress', () => csig('continuous', 'Horn sounded without stopping'), 'You hear a fog horn sounded continuously, without stopping. What does it mean?', 'distress', 'Continuous sounding with any fog-signalling apparatus is a DISTRESS signal (Annex IV 1(b)): the vessel needs assistance. Never use it for anything else (Annex IV 2).', ['doubt', 'pdMaking']),   // F57 (D8)
    H('r41', () => csig('long10', 'Norway, about ½ NM from a narrow channel'), 'In Norway a motor vessel about half a mile from the entrance of a narrow channel sounds one long blast of more than ten seconds. What is it?', 'r41', 'Norwegian Rule 41(a): a power-driven vessel shall always give warning of her arrival in a narrow channel from a distance of about half a mile by sounding a long blast of at least 10 seconds. A vessel arriving later must then wait (Rule 41(b)).', ['bend', 'pdMaking']),   // F31, F32 (D7)
  ];

  /* ---------- (R) reverse rounds: situation -> signal ---------- */
  const R = (key, art, prompt, answer, explain, traps, reveal, exclude) => ({ key: 'r-' + key, art, prompt, answer, explain, traps: traps || [], reveal, exclude: exclude || [] });
  const REVERSE = [
    R('port', () => scene('turn-port', 'You alter course to port', 'Motorboat, in sight of another vessel'), 'You are a motorboat in sight of another vessel and you alter course to PORT. What do you sound?', 's2', 'Two short blasts = "I am altering my course to port" (Rule 34(a)). One short = starboard, three short = astern.', ['s1', 's3'], () => sig('..')),    // F16 (D2)
    R('stbd', () => scene('turn-stbd', 'You alter course to starboard', 'Motorboat, in sight of another vessel'), 'You are a motorboat in sight of another vessel and you alter course to STARBOARD. What do you sound?', 's1', 'One short blast = "I am altering my course to starboard" (Rule 34(a)).', ['s2', 'p1'], () => sig('.')),   // F15 (D2)
    R('astern', () => scene('astern', 'You put the engine astern', 'Motorboat, in sight of another vessel'), 'You are a motorboat in sight of another vessel and you put your engine astern to stop. What do you sound?', 's3', 'Three short blasts = "I am operating astern propulsion" (Rule 34(a)) — given whenever the propeller is driving astern, even if the boat is still moving ahead.', ['s2', 's5'], () => sig('...')),   // F17 (D2)
    R('doubt', () => scene('doubt', 'You do not understand', 'the other vessel\'s intentions\nor doubt she is doing enough'), 'A vessel is approaching and you cannot tell what she intends to do. What do you sound?', 's5', 'At least five short and rapid blasts on the whistle, immediately (Rule 34(d)). Any vessel in doubt SHALL give it; it may be backed by at least five short rapid flashes.', ['s3', 'p2'], () => sig('.....')),   // F25, F26, F30 (D3)
    R('ovS', () => scene('overtake-stbd', 'You (B) want to overtake A', 'Narrow channel; A must make room\nfor you to pass on her starboard side'), 'Narrow channel: you want to overtake the vessel ahead on HER STARBOARD side, and she must make room. What do you sound?', 'ppd', 'Two prolonged blasts followed by one short blast: "I intend to overtake you on your starboard side" (Rule 34(c)(i)). Wait for her prolonged-short-prolonged-short agreement.', ['ppdd', 'pdpd'], () => sig('- - .')),   // F21 (D4)
    R('ovP', () => scene('overtake-port', 'You (B) want to overtake A', 'Narrow channel; A must make room\nfor you to pass on her port side'), 'Narrow channel: you want to overtake the vessel ahead on HER PORT side, and she must make room. What do you sound?', 'ppdd', 'Two prolonged blasts followed by two short blasts: "I intend to overtake you on your port side" (Rule 34(c)(i)).', ['ppd', 'pdpd'], () => sig('- - . .')),   // F22 (D4)
    R('agree', () => scene('agree', 'You are A; B asked to overtake', 'Narrow channel; you agree\nand will make room'), 'Narrow channel: the vessel astern has signalled that she intends to overtake you and you agree. What do you sound?', 'pdpd', 'One prolonged, one short, one prolonged, one short blast, in that order (Rule 34(c)(ii)), then take steps to permit safe passing. In doubt: at least five short rapid blasts instead.', ['ppd', 's5'], () => sig('- . - .')),   // F23 (D4)
    R('bend', () => scene('bend', 'You approach a blind bend', 'Other vessels may be hidden\nbehind the headland'), 'You are nearing a sharp bend of the fairway where other vessels may be hidden. What do you sound?', 'p1', 'One prolonged blast (4–6 s) when nearing a bend or an obstruction that hides other vessels (Rule 34(e), Rule 9(f)); any vessel within hearing answers with one prolonged blast.', ['s5', 'p2'], () => sig('-')),   // F28 (D5)
    R('bendAnswer', () => scene('bend', 'One prolonged blast heard', 'from a vessel hidden\naround the bend ahead'), 'You hear one prolonged blast from a vessel hidden around the bend ahead of you. What do you sound?', 'p1', 'Answer with one prolonged blast (Rule 34(e)): the approaching vessel within hearing around the bend replies with the same signal.', ['s5', 's1'], () => sig('-')),   // F28 (D5)
    R('fogMaking', () => scene('fog-power', 'Motorboat under way in fog', 'Making way through the water'), 'Fog. You are a motorboat (with a whistle) making way through the water. What do you sound, and how often?', 'p1', 'One prolonged blast at intervals of not more than 2 minutes (Rule 35(a)). Fog signals are given whether or not anyone is known to be near.', ['p2', 'pdd'], () => sig('-', 'every ≤ 2 minutes')),   // F37, F51 (D6)
    R('fogStopped', () => scene('fog-stopped', 'Motorboat stopped in fog', 'Under way, engine idling,\nno way through the water'), 'Fog. You are a motorboat under way but you have stopped and are making no way through the water. What do you sound?', 'p2', 'Two prolonged blasts in succession, about 2 s apart, at intervals of not more than 2 minutes (Rule 35(b)).', ['p1', 'pdd'], () => sig('- -', 'every ≤ 2 minutes')),   // F38 (D6)
    R('fogSail', () => scene('fog-sail', 'Sailing in fog', 'Under sail only'), 'Fog. You are a sailing vessel under sail. What do you sound?', 'pdd', 'One prolonged followed by two short blasts, every ≤ 2 minutes (Rule 35(c)) — the shared signal of sailing, fishing, NUC, RAM, constrained-by-draught and towing vessels.', ['p1', 'pddd'], () => sig('- . .', 'every ≤ 2 minutes')),   // F39 (D6)
    R('fogTow', () => scene('fog-tow', 'Towing in fog', 'You are the towing vessel'), 'Fog. You are towing another boat. What do you sound?', 'pdd', 'A vessel towing or pushing sounds one prolonged followed by two short blasts every ≤ 2 minutes (Rule 35(c)) — not the power-driven signal of Rule 35(a).', ['p1', 'pddd'], () => sig('- . .', 'every ≤ 2 minutes')),   // F39 (D6)
    R('fogTowed', () => scene('fog-towed', 'Being towed in fog', 'Your boat is manned and on the towline'), 'Fog. Your boat, with you on board, is being towed. What do you sound?', 'pddd', 'A manned towed vessel sounds one prolonged followed by THREE short blasts every ≤ 2 minutes, when practicable immediately after the towing vessel\'s signal (Rule 35(e)).', ['pdd', 'p1'], () => sig('- . . .', 'every ≤ 2 minutes')),   // F41 (D6)
    R('fogFishAnchor', () => scene('fog-fishing-anchor', 'Fishing vessel at anchor in fog', 'Engaged in fishing, lying to her anchor'), 'Fog. A vessel engaged in fishing is at anchor. Which fog signal does she give?', 'pdd', 'A fishing vessel at anchor (and a RAM vessel working at anchor) sounds the Rule 35(c) signal — one prolonged + two short — instead of the anchor bell (Rule 35(d)).', ['bell', 'p1'], () => sig('- . .', 'every ≤ 2 minutes')),   // F40 (D6)
    R('fogAnchor', () => scene('anchor', 'At anchor in fog', 'Vessel of 20 m or more, bell on board'), 'Fog. You are at anchor (a vessel of 20 m or more, with a bell). What do you sound?', 'bell', 'Ring the bell rapidly for about 5 seconds at intervals of not more than ONE minute (Rule 35(g)). You may add short-prolonged-short on the whistle to warn an approaching vessel.', ['p2', 'pdd'], () => csig('anchor')),   // F43, F45 (D6)
    R('fogAground', () => scene('aground', 'Aground in fog', 'Vessel of 20 m or more, bell on board'), 'Fog. Your vessel (20 m or more) is aground. What do you sound?', 'bellAground', 'The anchor signal plus three separate and distinct strokes on the bell immediately before and after the rapid ringing (Rule 35(h)), at intervals of not more than one minute.', ['bell', 'pdd'], () => csig('aground')),   // F46 (D6)
    R('r41a', () => scene('channel-entry', 'Entering a narrow channel', 'Norway; motor vessel about\n½ nautical mile from the entrance'), 'Norway: you are a motor vessel about half a mile from a narrow channel. Which warning does Norwegian Rule 41 require?', 'long10', 'Norwegian Rule 41(a): a power-driven vessel always gives warning of her arrival in a narrow channel from about ½ NM by sounding a LONG blast of at least 10 seconds. A vessel arriving later shall then wait (Rule 41(b)).', ['p1', 's5'], () => csig('long10')),   // F31, F32 (D7)
    R('r41c', () => scene('narrow', 'Channel too narrow to pass', 'Norway; a vessel is coming\nthe other way'), 'Norway: you are already in a channel too narrow for the vessel coming the other way to pass you safely. What do you sound?', 's5', 'Norwegian Rule 41(c): indicate this by at least five short blasts; the meeting vessel shall then wait until you have passed through.', ['long10', 'p1'], () => sig('.....')),   // F33 (D3)
    R('sailSight', () => scene('sail-sight', 'Sailing vessel alters course', 'Under sail, in sight of a motorboat'), 'A sailing vessel under sail, in sight of a motorboat, alters course to starboard. Which Rule 34(a) signal must she give?', 'none', 'None. The Rule 34(a) manoeuvring signals are for POWER-DRIVEN vessels; a vessel under sail does not give them. The Rule 34(d) doubt signal, however, applies to any vessel.', ['s1', 's2']),   // F14, F30 (D2)
    R('small', () => scene('fog-small', 'Small boat in fog', 'Under 12 m; no whistle on board'), 'Fog. Your boat is under 12 m and carries no whistle or bell. What does Rule 35 require of you?', 'other', 'A vessel of less than 12 m need not give the Rule 35 signals, but if she does not she shall make some other efficient sound signal at intervals of not more than 2 minutes (Rule 35(j)).', ['none', 'p1']),   // F48, F49 (D6)
    R('distress', () => scene('distress', 'Distress', 'You need assistance; you have\nonly a horn to attract attention'), 'You are in distress and need assistance. How can you signal it with your fog horn alone?', 'cont', 'Continuous sounding with any fog-signalling apparatus is a distress signal (Annex IV 1(b)); SOS (· · · — — — · · ·) by sound is another (Annex IV 1(d)).', ['s5', 'p2'], () => csig('continuous')),   // F57, F59 (D8)
  ];

  /* ---------- (N) numbers and definitions ---------- */
  // N(key, art, prompt, options[4], answer index, explain)
  const N = (key, art, prompt, options, answer, explain) => ({ key: 'n-' + key, art, prompt, options, answer, explain });
  const NUMBERS = [
    N('short', () => sig('.', 'A short blast'), 'How long is a "short blast"?', ['About 1 second', 'About 2–3 seconds', '4–6 seconds', 'At least 10 seconds'], 0, 'Rule 32(b): a short blast lasts about one second.'),   // F2 (D1)
    N('prolonged', () => sig('-', 'A prolonged blast'), 'How long is a "prolonged blast"?', ['About 1 second', 'About 2–3 seconds', '4–6 seconds', 'At least 10 seconds'], 2, 'Rule 32(c): a prolonged blast lasts from four to six seconds. (Norwegian Rule 41 separately uses a LONG blast of at least 10 s.)'),   // F3 (D1)
    N('interval2', () => sig('-', 'Fog signal of a power-driven vessel making way'), 'In fog, how often at most must a vessel under way repeat her whistle signal?', ['At least every 30 seconds', 'At least every minute', 'At least every 2 minutes', 'At least every 5 minutes'], 2, 'All the Rule 35 whistle signals for vessels under way are given at intervals of not more than 2 minutes (Rule 35(a)–(f)); the small-craft "other efficient sound signal" too (Rule 35(j)).'),   // F37, F48 (D6)
    N('interval1', () => csig('anchor', 'Fog signal of a vessel at anchor'), 'In fog, how often must a vessel at anchor ring her bell?', ['At least every 30 seconds', 'At least every minute', 'At least every 2 minutes', 'Only when another vessel is heard'], 1, 'Rule 35(g): rapid ringing for about 5 seconds at intervals of not more than ONE minute — unlike the whistle signals, which are every 2 minutes.'),   // F43 (D6)
    N('whistle12', null, 'From what length must a vessel be provided with a whistle?', ['7 m', '12 m', '20 m', '50 m'], 1, 'Rule 33(a): a vessel of 12 m or more shall carry a whistle; from 20 m also a bell, from 100 m also a gong.'),   // F4, F5, F6
    N('bell20', null, 'From what length must a vessel carry a bell in addition to the whistle?', ['12 m', '15 m', '20 m', '100 m'], 2, 'Rule 33(a): a bell is required from 20 m (since the 2003 amendments); a gong from 100 m.'),   // F5, F6
    N('under12', null, 'What must a boat under 12 m carry for sound signals if she has no whistle?', ['Nothing — she is exempt', 'Some other means of making an efficient sound signal', 'A bell of at least 300 mm', 'A radio instead'], 1, 'Rule 33(b): a vessel under 12 m is not obliged to carry the whistle/bell, but must then be provided with some other means of making an efficient sound signal.'),   // F8
    N('inSight', () => sig('..', 'Rule 34(a) manoeuvring signal'), 'When are the one/two/three-short-blast manoeuvring signals given?', ['Only by power-driven vessels, when vessels are in sight of one another', 'By any vessel, in any visibility', 'Only in restricted visibility', 'Only in a narrow channel'], 0, 'Rule 34(a) applies to a power-driven vessel manoeuvring when vessels are in sight of one another; the fog signals of Rule 35 are given whether or not another vessel is near.'),   // F14, F51 (D2)
    N('flashes', null, 'A vessel supplements her whistle signal with two flashes of a white light. What is she doing?', ['Altering course to starboard', 'Altering course to port', 'Operating astern propulsion', 'Asking you to overtake'], 1, 'Rule 34(b): one flash = starboard, two flashes = port, three flashes = astern propulsion, each flash about 1 s with 1 s between flashes and at least 10 s between signals.'),   // F18, F19 (D2)
    N('lightColour', null, 'What colour and range has the light used for Rule 34(b) manoeuvring flashes?', ['All-round white, visible at least 5 miles', 'Red, visible 2 miles', 'Yellow, visible 3 miles', 'Green, visible 5 miles'], 0, 'Rule 34(b)(iii): an all-round WHITE light visible at a minimum range of 5 miles, complying with Annex I.'),   // F20
    N('doubtLight', () => sig('.....', 'Rule 34(d) doubt signal'), 'How may the five-short-blast doubt signal be supplemented?', ['By at least five short and rapid flashes of light', 'By one prolonged blast', 'By a red flare', 'By ringing the bell'], 0, 'Rule 34(d): the doubt signal may be supplemented by a light signal of at least five short and rapid flashes.'),   // F26 (D3)
    N('r41dist', () => csig('long10', 'Norwegian Rule 41(a)'), 'From about what distance does Norwegian Rule 41 require the long blast before a narrow channel?', ['About 100 m', 'About half a nautical mile', 'About 2 nautical miles', 'Only at the entrance itself'], 1, 'Norwegian Rule 41(a): from a distance of about half a mile, a long blast of at least 10 seconds.'),   // F31 (D7)
  ];

  /* ---------- round builders ---------- */
  function choose(pool, labels, correct, traps, exclude) {
    const want = [...new Set(traps)].filter(k => k !== correct && !exclude.includes(k)).slice(0, 3);
    const rest = B.shuffle(pool.filter(k => k !== correct && !want.includes(k) && !exclude.includes(k)));
    const wrong = want.concat(rest).slice(0, 3);
    const keys = B.shuffle(wrong.concat([correct]));
    return { choices: keys.map(k => labels[k]), answer: keys.indexOf(correct) };
  }
  function hearRound(h) {
    const s = h.signal();
    const c = choose(M_ALL, M, h.answer, h.traps, h.exclude);
    return { key: h.key, art: s.art, signal: s.sched, prompt: h.prompt, choices: c.choices, answer: c.answer, explain: h.explain, hint: 'P = play the signal · 1–4 = answer · M = mute' };
  }
  function reverseRound(r) {
    const c = choose(SG_ALL, SG, r.answer, r.traps, r.exclude);
    return { key: r.key, art: r.art, signal: null, reveal: r.reveal || null, prompt: r.prompt, choices: c.choices, answer: c.answer, explain: r.explain, hint: r.reveal ? 'Answer with 1–4; the correct signal is then shown and can be played (P)' : '1–4 = answer' };
  }
  function numberRound(n) {
    const s = n.art ? n.art() : null;
    return { key: n.key, art: s ? s.art : null, signal: s ? s.sched : null, prompt: n.prompt, choices: n.options, answer: n.answer, explain: n.explain, hint: s ? 'P = play the signal · 1–4 = answer' : '1–4 = answer' };
  }
  const FORMS = [() => hearRound(K.pick(HEAR)), () => reverseRound(K.pick(REVERSE)), () => hearRound(K.pick(HEAR)), () => reverseRound(K.pick(REVERSE)), () => numberRound(K.pick(NUMBERS))];

  /* ---------- Web Audio player ----------
     The AudioContext is created on the first click of Play (browsers block audio before a user gesture).
     Horn: a square wave at 290 Hz (whistle fundamental for vessels under 75 m is 250–700 Hz, F10) through a low-pass
     filter, with a 30 ms attack and 80 ms release so blasts start and stop cleanly. Bell: two decaying sine partials. */
  const player = { ctx: null, nodes: [], raf: 0, timer: 0, playing: false, muted: !!B.store.get('soundMute', false) };
  function ctx() {
    if (!player.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; player.ctx = new AC(); }
    if (player.ctx.state === 'suspended') player.ctx.resume();
    return player.ctx;
  }
  function horn(ac, t0, dur) {
    const osc = ac.createOscillator(), filt = ac.createBiquadFilter(), g = ac.createGain();
    osc.type = 'square'; osc.frequency.value = 290;
    filt.type = 'lowpass'; filt.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.03);
    g.gain.setValueAtTime(0.16, t0 + dur); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.08);
    osc.connect(filt); filt.connect(g); g.connect(ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.12); player.nodes.push(osc);
  }
  function strike(ac, t0, loud) {
    [[880, 0.22], [1760, 0.08], [2640, 0.04]].forEach(([f, v]) => {
      const osc = ac.createOscillator(), g = ac.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      g.gain.setValueAtTime(v * (loud ? 1.3 : 1), t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (loud ? 0.6 : 0.35));
      osc.connect(g); g.connect(ac.destination); osc.start(t0); osc.stop(t0 + 0.65); player.nodes.push(osc);
    });
  }
  function stop() {
    player.nodes.forEach(n => { try { n.stop(); } catch (e) { /* already stopped */ } });
    player.nodes = []; cancelAnimationFrame(player.raf); clearTimeout(player.timer); player.playing = false;
  }
  /* Plays a schedule and animates the timeline in the stage (playhead + blasts lighting up as they sound). */
  function play(sched, stage, onEnd) {
    stop();
    const ac = player.muted ? null : ctx();
    const t0 = ac ? ac.currentTime + 0.05 : 0;
    if (ac) sched.blasts.forEach(b => {
      if (b.kind === 'horn') horn(ac, t0 + b.s, b.d);
      else if (b.kind === 'stroke') strike(ac, t0 + b.s, true);
      else for (let t = 0; t < b.d; t += 0.12) strike(ac, t0 + b.s + t, false);
    });
    const svg = stage.querySelector('svg'), head = svg && svg.querySelector('.playhead'), bars = svg ? [...svg.querySelectorAll('.blast')] : [];
    bars.forEach(r => { r.style.opacity = '.35'; });
    if (head) head.style.display = '';
    const start = performance.now(); player.playing = true;
    const frame = () => {
      const t = (performance.now() - start) / 1000;
      if (head) head.setAttribute('transform', `translate(${(Math.min(t, sched.total) * U).toFixed(1)} 0)`);
      sched.blasts.forEach((b, i) => { if (bars[i] && t >= b.s) bars[i].style.opacity = '1'; });
      if (t < sched.total + 0.3) player.raf = requestAnimationFrame(frame);
      else { if (head) head.style.display = 'none'; bars.forEach(r => { r.style.opacity = '1'; }); player.playing = false; onEnd && onEnd(); }
    };
    player.raf = requestAnimationFrame(frame);
  }

  /* ---------- mount ---------- */
  function mount(root) {
    let turn = Math.floor(Math.random() * FORMS.length), lastKey = null, current = null, revealed = false;
    const cleanupDrill = K.drill(root, {
      makeRound() {
        stop(); revealed = false;
        let r = FORMS[turn++ % FORMS.length](), tries = 0;
        while (r.key === lastKey && tries++ < 8) r = FORMS[turn++ % FORMS.length]();   // never the same round twice in a row
        lastKey = r.key; current = r;
        setTimeout(syncButtons, 0);
        return r;
      },
    });
    // Player controls sit between the stage and the question.
    const bar = document.createElement('div');
    bar.className = 'btnrow'; bar.style.margin = '-.4rem 0 1rem';
    bar.innerHTML = `<button type="button" class="btn sea sm" id="playBtn" accesskey="p" title="Play the signal (P)">▶ Play signal</button>
      <button type="button" class="btn sm" id="muteBtn" aria-pressed="${player.muted}" title="Mute (M)">${player.muted ? '🔇 Muted' : '🔊 Sound on'}</button>
      <span class="small muted" id="playNote"></span>`;
    const stage = root.querySelector('#stage');
    stage.insertAdjacentElement('afterend', bar);
    const playBtn = bar.querySelector('#playBtn'), muteBtn = bar.querySelector('#muteBtn'), note = bar.querySelector('#playNote');

    function activeSignal() { return current ? (current.signal || (revealed && current.revealSched) || null) : null; }
    function syncButtons() {
      const s = activeSignal();
      playBtn.disabled = !s;
      note.textContent = !current ? '' : s ? (player.muted ? 'Muted: the timeline still animates.' : 'Short ≈ 1 s, prolonged 5 s, as drawn.') : current.reveal ? 'Answer first — the correct signal then appears here.' : '';
    }
    function doPlay() {
      const s = activeSignal(); if (!s) return;
      if (player.playing) { stop(); playBtn.textContent = '▶ Play signal'; return; }
      playBtn.textContent = '■ Stop';
      play(s, stage, () => { playBtn.textContent = '▶ Replay'; });
    }
    function toggleMute() {
      player.muted = !player.muted; B.store.set('soundMute', player.muted);
      muteBtn.setAttribute('aria-pressed', String(player.muted)); muteBtn.textContent = player.muted ? '🔇 Muted' : '🔊 Sound on';
      if (player.muted) stop(); syncButtons();
    }
    // After a reverse round is answered, show the correct signal on the stage so it can be played.
    function maybeReveal() {
      if (!current || revealed || !current.reveal || !root.querySelector('.opt.correct')) return;
      revealed = true;
      const s = current.reveal(); current.revealSched = s.sched;
      stage.innerHTML = B.renderArt(s.art);
      playBtn.textContent = '▶ Play the correct signal'; syncButtons();
    }
    playBtn.addEventListener('click', doPlay);
    muteBtn.addEventListener('click', toggleMute);
    root.querySelector('#choices').addEventListener('click', () => setTimeout(maybeReveal, 0));
    const onKey = e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); doPlay(); }
      else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); toggleMute(); }
      else if (/^[1-9]$/.test(e.key)) setTimeout(maybeReveal, 0);   // drill() has just handled the answer
    };
    document.addEventListener('keydown', onKey);
    syncButtons();
    return () => {
      document.removeEventListener('keydown', onKey); stop();
      if (player.ctx) { try { player.ctx.close(); } catch (e) { /* ignore */ } player.ctx = null; }
      if (typeof cleanupDrill === 'function') cleanupDrill();
    };
  }

  // Register every trainer picture in the illustration gallery so check-topic.js --gallery renders them for review.
  if (S.gallery) {
    ['turn-stbd', 'turn-port', 'astern', 'doubt', 'overtake-stbd', 'overtake-port', 'agree', 'narrow', 'channel-entry', 'bend', 'fog-power', 'fog-stopped', 'fog-sail', 'fog-tow', 'fog-towed', 'fog-fishing-anchor', 'fog-small', 'anchor', 'aground', 'distress', 'sail-sight']
      .forEach(k => S.gallery.push({ name: `trainer-sound scene ${k}`, svg: () => scene(k, 'Title line', 'Second line\nthird line') }));
    ['long10', 'anchor', 'aground', 'continuous'].forEach(k => S.gallery.push({ name: `trainer-sound timeline ${k}`, svg: () => customArt(k, 'caption') }));
    S.gallery.push({ name: 'trainer-sound signalArt - - .', svg: () => signalArt('- - .', 'Narrow channel') });
  }

  B.registerTrainer({
    id: 'sound',
    title: 'Sound signals',
    description: 'Hear and see whistle, fog and bell signals, say what they mean, and pick the right signal for a situation.',
    mount,
    // exposed for tests: number of distinct rounds
    rounds: HEAR.length + REVERSE.length + NUMBERS.length,
  });
})();
