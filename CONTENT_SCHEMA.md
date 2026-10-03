# Content schema

Every topic lives in one classic script `content/<slug>.js` that calls
`BOAT.register(topic)`. Scripts are loaded in order by `index.html`; a topic may
use `BOAT.svg.*` helpers (defined in `src/svg.js`) to build illustrations.

```js
BOAT.register({
  id: 'lights-and-shapes',          // slug, matches the file name
  title: 'Navigation lights and day shapes',
  order: 3,                         // position in the course
  examShare: 7,                    // approximate number of questions out of 50 in the real exam (drives mock-exam sampling)
  examWeight: 'about 6–8 of 50 questions',   // shown to the learner
  summary: 'One paragraph: what this topic is and why it matters on the exam.',
  sections: [                       // the lesson, read top to bottom (6–14 sections)
    {
      id: 'arcs',                   // unique within the topic
      title: 'The four light arcs',
      // HTML string. Allowed tags: p, ul/ol/li, strong, em, table/thead/tbody/tr/th/td,
      // h4, figure/figcaption, div.callout (class "callout tip|warn|rule"), kbd, br.
      html: `<p>…</p>`,
      // Optional illustration: an SVG string, or a function returning one (evaluated lazily).
      illustration: () => BOAT.svg.lightArcs(),
      caption: 'Masthead 225°, sidelights 112.5° each, sternlight 135°.',
      keyFacts: ['Masthead light: white, 225°', '…'],   // 2–6 bullets shown as a "remember" box
      // Optional one-question check at the end of the section (same shape as a quiz question).
      check: { q: '…', options: ['…','…','…','…'], answer: 1, explanation: '…' },
    },
  ],
  flashcards: [                     // 20–40 cards
    { front: 'Red over white, all-round, at night?', back: 'A vessel engaged in fishing (not trawling). COLREG Rule 26.' },
  ],
  questions: [                      // 30–60 exam-style questions
    {
      id: 'lights-01',              // unique across the whole app: '<slug-short>-<nn>'
      q: 'You see a green light and a white light above it…',
      options: ['A', 'B', 'C', 'D'],      // exactly 4, exactly one correct
      answer: 2,                          // index of the correct option
      explanation: 'Why, in 1–3 sentences. Cite the rule/number.',
      illustration: () => BOAT.svg.nightView({...}), // optional SVG string or thunk
      difficulty: 2,                      // 1 easy recall, 2 standard, 3 scenario/reasoning
      part: 2,                            // official curriculum part: 1 seamanship, 2 laws and regulations, 3 navigation and chart reading, 4 particularly important topics
      p4: '1.4.4',                        // only when part is 4: which sub-topic of part 4 (see scratchpad/facts/curriculum.md)
      tags: ['rule-26', 'fishing'],
    },
  ],
});
```

Rules for authors
- Tag every question with its curriculum `part` (and `p4` for part 4). Part 4 is the "particularly important"
  group where more than two wrong answers fails the whole exam, so write plenty of part-4 questions where the
  topic touches a 1.4.x item, and make them unambiguous.
- English only. No Norwegian words anywhere in user-facing text (the exam name may be
  written as "the Norwegian boating licence exam").
- Every number, rule number, colour and side must come from the verified fact sheet for the
  topic. Do not add facts that are not in the sheet unless you verify them yourself.
- Questions: plausible distractors, no "all of the above", no trick wording, one unambiguous
  correct answer, explanation teaches the rule. Spread difficulty 30/50/20.
- Illustrations: use the shared helpers in `src/svg.js` where one exists (they are verified).
  Hand-written SVG must use the theme tokens (`var(--ink)`, `var(--paper)`, …) for anything
  that is not a real navigation colour. Real navigation colours use the constants in
  `BOAT.svg.COLORS` (red, green, white, yellow, black) and must never be theme-dependent.
