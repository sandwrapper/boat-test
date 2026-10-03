# Illustration library — API contract

All helpers live on `window.BOAT_SVG` (also reachable as `BOAT.svg`). Each returns an SVG
**string** (never a DOM node) sized with a `viewBox`, `width` ≤ 640 and `style="max-width:100%;height:auto"`.
Pictures must look right in light AND dark themes: use `var(--ink)`, `var(--ink-2)`, `var(--muted)`,
`var(--paper)`, `var(--paper-2)`, `var(--line)`, `var(--shallow)` for diagram ink, labels and water;
use the fixed constants in `BOAT_SVG.COLORS` for real navigation colours (red, green, white, yellow,
black, blue, orange). Night scenes draw on `COLORS.night` with lights as bright discs with a soft glow.

Every helper registers one gallery entry per meaningful variant so the pictures can be rendered and
checked by eye:

```js
BOAT_SVG.gallery.push({ name: 'vesselLights power<50 ahead', svg: () => BOAT_SVG.vesselLights('power<50', 'ahead') });
```

## Files
- `src/svg.js` — base: `COLORS`, `svg(w,h,inner,opts)`, `sector(cx,cy,r,fromDeg,toDeg,fill,opacity)` (0° = up, clockwise), `text(x,y,str,opts)`, `gallery`.
- `src/svg-lights.js` — lights, day shapes, encounters, sound signals.
- `src/svg-marks.js` — IALA/Norwegian marks, light rhythms, sector lights, chart symbols.
- `src/svg-nav.js` — compass/variation, course conversion, bearing fix, latitude scale, speed-time-distance.

## src/svg-lights.js
- `lightArcs(opts)` — plan view of a boat (bow up) with the four standard arcs drawn as translucent
  sectors from the boat's centre: masthead white 225° (from 112.5° on the port bow round through
  ahead to 112.5° on the starboard bow, i.e. from relative bearing 247.5° through 0° to 112.5°),
  port sidelight red 112.5° (from dead ahead to 22.5° abaft the port beam: relative 247.5°→360°),
  starboard sidelight green 112.5° (relative 0°→112.5°), sternlight white 135° (relative 112.5°→247.5°).
  Labels with the degree numbers. `opts.only` = array subset to draw.
- `vesselLights(type, view)` — what you SEE at night: a dark panel with the lights of the vessel as
  seen from `view` ∈ `'ahead' | 'port' | 'starboard' | 'astern'` (port = you are looking at her port
  side, so you see her red sidelight). Lights are placed with correct vertical order and plausible
  horizontal spacing; a faint silhouette may be shown. Types:
  `'power<50'` (masthead + sidelights + stern), `'power>=50'` (two masthead lights, forward one lower),
  `'power<12'` (all-round white + sidelights), `'power<7'` (all-round white only),
  `'sail'` (sidelights + stern), `'sail-tricolour'` (tricolour at masthead), `'sail-redgreen'` (sidelights+stern+red over green all-round at masthead),
  `'anchored'` (one all-round white), `'anchored>=50'` (two all-round white, forward higher),
  `'aground'` (anchor light + two all-round red), `'fishing'` (red over white all-round + sidelights/stern when making way),
  `'trawling'` (green over white + masthead abaft and higher when ≥50 m; sidelights/stern when making way),
  `'nuc'` (red over red all-round; sidelights/stern when making way), `'ram'` (red-white-red all-round; + masthead/sidelights/stern when making way),
  `'cbd'` (three all-round red in a vertical line + normal power lights), `'pilot'` (white over red all-round + sidelights/stern when underway),
  `'towing'` (two masthead lights in a vertical line (three if tow > 200 m) + sidelights + stern + yellow towing light above the stern light),
  `'towed'` (sidelights + stern), `'minesweeping'` (three all-round green: one at foremast head, one at each fore yardarm) — optional,
  `'seaplane'` optional.
  Add a `making` option (`{ making: false }`) where lights differ when stopped.
- `shipProfile(type, opts)` — side view of a vessel with lights (and day shapes when `opts.day`) placed
  where they belong, labelled; for `'motorboat'`, `'sailboat'`, `'ship'`, `'fishing'`, `'tug'`.
- `dayShape(kind)` — black shape(s) on a short mast: `'ball'`, `'cone-down'` (apex down: motor-sailing),
  `'two-cones'` (apexes together: fishing), `'diamond'`, `'two-balls'` (NUC), `'ball-diamond-ball'` (RAM),
  `'three-balls'` (aground), `'cylinder'` (constrained by draught), `'cone-up'` (not used by COLREG; omit).
- `encounter(name, opts)` — plan view (north up unless `opts.boatUp`) of two vessels with heading arrows,
  the give-way vessel's required action drawn as a curved dashed arrow, labels "give way" / "stand on".
  Names: `'crossing-starboard'` (other vessel on our starboard bow: we give way, turn to starboard and pass astern),
  `'crossing-port'` (other on our port bow: we stand on), `'head-on'` (both turn to starboard),
  `'overtaking'` (overtaker keeps clear, any side), `'sail-opposite-tacks'` (port-tack boat gives way),
  `'sail-same-tack'` (windward boat gives way), `'power-vs-sail'` (power gives way), `'sail-vs-fishing'`,
  `'narrow-channel'` (keep to starboard side; small craft do not impede), `'power-vs-rowing'` (both power-driven rules? no: rowing boat has no special status; treat as a vessel — explain in caption).
  Include a wind arrow when sails are involved. Overtaking sector: 135° astern (from 22.5° abaft each beam).
- `soundSignal(pattern)` — timeline of blasts: `'.'` short (about 1 s), `'-'` prolonged (4–6 s), spaces as gaps;
  e.g. `soundSignal('.')`, `soundSignal('.....')`, `soundSignal('-')`, `soundSignal('- - ')`, `soundSignal('- . .')`, `soundSignal('- . . .')`.
  Draw to scale (prolonged ≈ 5× short) with labels; the timeline is centred so short signals do not sit at the left edge.
- `flagA()` — signal flag A (Alpha), rectangle 3:2 with the hoist on the left: hoist half WHITE (thin grey outline),
  fly half BLUE (#1E6FD9), swallow-tail notch cut from the fly edge (outer points (3,0) and (3,2), apex at (2.25,1));
  caption "I have a diver down; keep well clear at slow speed" with the Norwegian Rule 42 duties (pass with caution,
  power-driven vessels stop the engine if possible; divers may be far from the flag). Beside it, crossed out, the red
  flag with a white diagonal stripe labelled "NOT the Norwegian signal". Gallery entry `'flag A'`.

## src/svg-marks.js
- `mark(kind, opts)` — a navigation mark on water, large and clear, correct colours top-to-bottom and
  correct topmark. `opts.form` ∈ `'buoy'` (default pillar/spar buoy) | `'perch'` (Norwegian iron perch / spar beacon on a rock) | `'can'`/`'cone'` for lateral shapes.
  `opts.light` true adds a light symbol with the characteristic text. Kinds:
  `'lateral-port'` (red, can shape, red can topmark), `'lateral-starboard'` (green, conical, green cone up topmark),
  `'preferred-starboard'` (red with one green horizontal band; red can topmark; "preferred channel to starboard": treat as a port-hand mark when following the preferred channel),
  `'preferred-port'` (green with one red band; green cone topmark),
  `'cardinal-n'` (black over yellow, two cones points up), `'cardinal-e'` (black-yellow-black, cones base to base),
  `'cardinal-s'` (yellow over black, two cones points down), `'cardinal-w'` (yellow-black-yellow, cones points together),
  `'isolated-danger'` (black with red horizontal band(s), two black balls), `'safe-water'` (red and white VERTICAL stripes, red ball),
  `'special'` (yellow, yellow X topmark), `'wreck'` (blue and yellow vertical stripes, yellow upright cross).
- `cardinalCompass()` — a danger (rock) in the centre with the four cardinal marks placed N/E/S/W of it, compass labels, and a note "pass on the named side".
- `lateralChannel(opts)` — plan view of a channel entered from seaward with red can marks on the left (port) and green cones on the right (starboard), direction-of-buoyage arrow (magenta) and a boat.
- `lightRhythm(spec, opts)` — timeline (one period, light on = coloured block, off = dark) for a characteristic string: `'F'`, `'Fl 5s'`, `'Fl(2) 10s'`, `'LFl 10s'`, `'Q'`, `'VQ'`, `'Q(3) 10s'`, `'VQ(3) 5s'`, `'Q(6)+LFl 15s'`, `'Q(9) 15s'`, `'Iso 4s'`, `'Oc 6s'`, `'Oc(2) 10s'`, `'Mo(A) 8s'`, `'Fl(2+1) 10s'`, `'Al WR'`. Colour from `opts.color` (`'W'|'R'|'G'|'Y'`).
- `sectorLight(opts)` — plan view of a coast with a minor light whose sectors are drawn as coloured
  arcs over the water (white = safe fairway, red and green = off-track/danger), with a boat and a note of what the skipper sees. `opts.preset` ∈ `'fairway'` (white leading in, red to the left/port of white, green to the right/starboard as seen by a vessel approaching the light), `'two-fairways'`.
- `leadingLine()` — two leading marks/lights in transit with a boat on and off the line.
- `chartSymbol(kind)` — INT1-style chart symbol on a chart-paper square: `'rock-awash'`, `'rock-submerged'` (dangerous underwater rock), `'rock-drying'`, `'rock-above-water'`, `'wreck-dangerous'`, `'wreck-non-dangerous'`, `'light'` (magenta flare), `'sector-light'`, `'beacon-port'`, `'beacon-starboard'`, `'buoy-cardinal-n'` etc., `'anchorage'`, `'cable'`, `'depth-contour'`, `'leading-line'`, `'buoyage-direction'` (magenta arrow), `'foul'`, `'obstruction'`.
- `chartExcerpt()` — a small invented chart excerpt (soundings in metres, contours, a rock, a lateral pair, a light with sectors, a leading line) with a legend; clearly marked as an example, not a real chart.

## src/svg-nav.js (navigation only; also used by the navigation trainer)
- `compassRose(opts)` — true rose with a magnetic rose rotated by `opts.variation` degrees (east positive), labelled, with the chart-style annotation text (e.g. "Var 3°E (2026)").
- `courseTriangle(opts)` — the true / magnetic / compass ladder: boxes T → (±variation) → M → (±deviation) → C with a worked example from `opts` (e.g. `{ true: 90, variation: 3, deviation: -2 }`), arrows showing the direction of each conversion.
- `bearingFix(opts)` — chart with two or three bearing lines from landmarks crossing at the fix (optionally a small cocked hat).
- `latitudeScale()` — chart edge showing that 1 minute of latitude = 1 nautical mile, with dividers, and that the longitude scale must not be used.
- `latitudeScale({ position: true, lat, lon, quiz })` — reading a position off the border scales; `lat` = minutes south of 60°00′N (0–10), `lon` = minutes east of 010°30′E (0–20), `quiz: true` hides the answer so the picture can carry a question.
- `std(opts)` — speed-time-distance triangle with a worked example (`{ speed: 12, minutes: 40 }` → 8 NM).
- `plotExample()` — a leg drawn on a chart excerpt with course, distance and time labelled.

## Topic-specific diagrams live in the topic's own content file
These are used by one lesson only, so the content author draws them inline with the base primitives
(`BOAT.svg.svg`, `sector`, `text`, `COLORS`) inside `content/<slug>.js`. Keep them simple and
correct: boat terminology (bow, stern, port, starboard, beam, draught, freeboard, transom, keel),
prop walk (right-handed propeller: stern swings to port when going astern), berthing against wind/current
with named lines, anchor scope (3–5 × depth), man-overboard turn, HELP position/huddle, fire triangle,
outboard engine labelled (cooling-water telltale, kill cord, primer bulb, trim), fuel thirds rule,
low/high pressure rotation (northern hemisphere), sea breeze, wind against current, Beaufort scale strip,
flag A (white and blue swallow-tailed, blue half at the fly), life-jacket buoyancy classes.
