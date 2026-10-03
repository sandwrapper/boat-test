/* TEMPORARY placeholder topic used to test the shell; replaced by the real content. */
BOAT.register({
  id: 'exam-and-law', title: 'The exam and the law (placeholder)', order: 1, examShare: 7,
  examWeight: 'about 7 of 50 questions',
  summary: 'Placeholder summary.',
  sections: [
    { id: 'intro', title: 'Intro', html: '<p>Placeholder text.</p>', illustration: () => BOAT.svg.svg(200, 100, BOAT.svg.sector(100, 50, 40, 0, 225, BOAT.svg.COLORS.white) + BOAT.svg.text(100, 50, 'hi')), caption: 'cap', keyFacts: ['a', 'b'],
      check: { id: 'exam-c1', q: 'Check?', options: ['1', '2', '3', '4'], answer: 1, explanation: 'because' } },
    { id: 'two', title: 'Two', html: '<p>More.</p>' },
  ],
  flashcards: Array.from({ length: 12 }, (_, i) => ({ front: 'Front ' + i, back: 'Back ' + i })),
  questions: Array.from({ length: 60 }, (_, i) => ({ id: 'law-' + (i + 1), q: 'Question ' + (i + 1) + '?', options: ['A' + i, 'B' + i, 'C' + i, 'D' + i], answer: i % 4, explanation: 'Expl ' + i, difficulty: 1 + (i % 3) })),
});
