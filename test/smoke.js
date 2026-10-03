/* Playwright smoke test: loads the built single-file app, visits every view, checks for console
   errors and validates the question bank. Run: node build.js && node test/smoke.js */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const file = 'file://' + path.join(__dirname, '..', 'dist', 'index.html');
  if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) { console.error('Run node build.js first'); process.exit(1); }
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/ERR_CERT_AUTHORITY_INVALID|fonts.g/.test(m.text())) errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
  await page.goto(file);
  await page.waitForTimeout(300);

  const stats = await page.evaluate(() => {
    const B = window.BOAT;
    const problems = [];
    const ids = new Set();
    B.topics.forEach(t => {
      if (!t.sections.length) problems.push(`${t.id}: no sections`);
      if (t.questions.length < 20) problems.push(`${t.id}: only ${t.questions.length} questions`);
      if (t.flashcards.length < 10) problems.push(`${t.id}: only ${t.flashcards.length} flashcards`);
      t.questions.forEach(q => {
        if (ids.has(q.id)) problems.push(`duplicate question id ${q.id}`); ids.add(q.id);
        if (!Array.isArray(q.options) || q.options.length !== 4) problems.push(`${q.id}: needs 4 options`);
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) problems.push(`${q.id}: bad answer index`);
        if (new Set((q.options || []).map(o => String(o).trim().toLowerCase())).size !== 4) problems.push(`${q.id}: duplicate options`);
        if (!q.explanation) problems.push(`${q.id}: missing explanation`);
        if (/[æøåÆØÅ]/.test(JSON.stringify(q))) problems.push(`${q.id}: Norwegian characters in question`);
        if (q.illustration) { try { const s = typeof q.illustration === 'function' ? q.illustration() : q.illustration; if (typeof s !== 'string' || !s.includes('<svg')) problems.push(`${q.id}: illustration did not return svg`); } catch (e) { problems.push(`${q.id}: illustration threw ${e.message}`); } }
      });
      t.sections.forEach(s => {
        if (s.illustration) { try { const v = typeof s.illustration === 'function' ? s.illustration() : s.illustration; if (typeof v !== 'string' || !v.includes('<svg')) problems.push(`${t.id}/${s.id}: illustration did not return svg`); } catch (e) { problems.push(`${t.id}/${s.id}: illustration threw ${e.message}`); } }
        if (/[æøåÆØÅ]/.test(s.html || '')) problems.push(`${t.id}/${s.id}: Norwegian characters in section`);
        if (s.check && (s.check.options.length !== 4 || typeof s.check.answer !== 'number')) problems.push(`${t.id}/${s.id}: bad check question`);
      });
      t.flashcards.forEach((c, k) => { if (!c.front || !c.back) problems.push(`${t.id}: flashcard ${k} incomplete`); });
    });
    return { topics: B.topics.length, questions: B.allQuestions().length, trainers: B.trainers.length, flashcards: B.topics.reduce((a, t) => a + t.flashcards.length, 0), problems };
  });

  const routes = ['#home', '#learn', '#flash', '#practice', '#trainers', '#exam', '#review', '#practice.all.5', '#exam.run', '#flash.all'];
  await page.evaluate(() => window.BOAT.topics.forEach(t => null));
  const topicIds = await page.evaluate(() => window.BOAT.topics.map(t => t.id));
  const trainerIds = await page.evaluate(() => window.BOAT.trainers.map(t => t.id));
  routes.push(...topicIds.map(id => '#lesson.' + id), ...trainerIds.map(id => '#trainer.' + id));
  for (const r of routes) {
    await page.evaluate(h => { location.hash = h; }, r);
    await page.waitForTimeout(150);
    const txt = await page.evaluate(() => document.getElementById('view').innerText.length);
    if (txt < 20) errors.push(`route ${r} rendered almost nothing`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) errors.push(`route ${r} overflows horizontally at 1200px`);
  }
  // phone width overflow check on a lesson
  await page.setViewportSize({ width: 390, height: 800 });
  for (const r of ['#home', '#lesson.' + topicIds[0], '#exam.run', '#trainers']) {
    await page.evaluate(h => { location.hash = h; }, r);
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) errors.push(`route ${r} overflows horizontally at 390px`);
  }
  await browser.close();
  console.log(JSON.stringify(stats, null, 2));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); }
  const fatal = errors.filter(e => !e.startsWith('[warning]')).length + stats.problems.length;
  process.exit(fatal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
