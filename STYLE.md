# Writing style for lessons, flashcards and questions

Audience: an adult with zero boating knowledge who sits the Norwegian boating licence exam in two days,
reading in English. Everything must be in English; no Norwegian words in user-facing text (write
"the Norwegian boating licence exam", "the Rules of the Road", "the coast radio station", "the Norwegian
Maritime Authority").

Lessons
- Teach, do not list. Explain WHY a rule exists in one sentence, then state the rule precisely, then give
  the exam-relevant numbers. Second person ("you give way"), active voice, short sentences.
- Each section: 150–350 words of HTML, then an illustration where a picture helps, a "Remember" box of
  2–6 bullets with the exact facts the exam asks for, and (for important sections) a one-question check.
- Use `<div class="callout rule">` for the exact wording of a rule, `<div class="callout tip">` for
  mnemonics and exam tips, `<div class="callout warn">` for dangerous misconceptions.
- Tables for numbers (`<div class="table-wrap"><table>…</table></div>` when the table has 4+ columns).
- Use official English terminology: give way / stand on, power-driven vessel, sailing vessel,
  underway / making way, restricted visibility, port / starboard, nautical mile, knot.
- Order sections from most fundamental to most detailed; the first section tells the reader what the
  topic is and how the exam tests it (which curriculum part(s), including any part 4 items).

Flashcards (25–40 per topic)
- Front: one precise question or a cue ("Red over white, all round, at night?"). Back: the answer in
  ≤ 25 words with the rule or number. Plain text or minimal HTML (`<b>`), no pictures.

Questions (40–60 per topic)
- Exam style: a short stem, 4 options, exactly one correct, distractors that a half-prepared candidate
  would find tempting (adjacent numbers, swapped sides, the rule for a neighbouring case).
- No "all/none of the above", no negatives like "Which is NOT…" unless unavoidable, no trick wording.
- The explanation (1–3 sentences) states the rule and why the distractors are wrong when useful.
- Spread the correct answer evenly over A–D (the checker rejects skew). Mix difficulty 1/2/3 ≈ 30/50/20.
- Tag `part` (1–4) and, for part 4, `p4`. Part-4 items deserve the MOST questions and the clearest wording.
- Use pictures for anything the real exam shows as a picture: encounter situations, lights at night,
  sea marks, chart symbols, day shapes, light rhythms.
