/* Validate ONE content file (or the illustration library) in a headless browser without touching dist/.
   Usage: node test/check-topic.js <slug>            -> loads src/*.js + content/<slug>.js, validates
          node test/check-topic.js <slug> --shots DIR -> also renders every illustration in the topic to DIR/*.png
          node test/check-topic.js --gallery DIR      -> renders every BOAT_SVG.gallery entry to DIR/*.png */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const slug = args[0] && !args[0].startsWith('--') ? args[0] : null;
const shotsDir = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null;
const galleryDir = args.includes('--gallery') ? args[args.indexOf('--gallery') + 1] : null;
const dark = args.includes('--dark');

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const srcFiles = [...indexHtml.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)].map(m => m[1]).filter(f => fs.existsSync(path.join(root, f)));
const css = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8');
const scripts = srcFiles.map(f => `<script>\n${fs.readFileSync(path.join(root, f), 'utf8')}\n</script>`);
if (slug) {
  const cf = path.join(root, 'content', slug + '.js');
  if (!fs.existsSync(cf)) { console.error('No such content file: ' + cf); process.exit(2); }
  scripts.push(`<script>\n${fs.readFileSync(cf, 'utf8')}\n</script>`);
}
const html = `<!doctype html><html lang="en" ${dark ? 'data-theme="dark"' : ''}><head><meta charset="utf-8"><style>${css}</style></head><body><div id="app"><header class="topbar"><nav class="mainnav"></nav></header><main id="view" class="view"></main></div>${scripts.join('\n')}<script>try{BOAT.start()}catch(e){console.error('start failed: '+e.message)}</script></body></html>`;
const tmp = path.join(require('os').tmpdir(), `skipper-check-${process.pid}.html`);
fs.writeFileSync(tmp, html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/ERR_CERT|fonts\.g/.test(m.text())) errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
  await page.goto('file://' + tmp);
  await page.waitForTimeout(200);

  const report = await page.evaluate((slug) => {
    const B = window.BOAT; const problems = [];
    const norw = /[æøåÆØÅ]/;
    const t = slug ? B.topic(slug) : null;
    if (slug && !t) problems.push(`topic ${slug} did not register (check the id)`);
    const svgs = [];
    if (t) {
      if (!t.title || !t.summary || !t.order || !t.examShare) problems.push('missing title/summary/order/examShare');
      if (t.sections.length < 5) problems.push(`only ${t.sections.length} sections`);
      if (t.questions.length < 30) problems.push(`only ${t.questions.length} questions (need 30+)`);
      if (t.flashcards.length < 20) problems.push(`only ${t.flashcards.length} flashcards (need 20+)`);
      const secIds = new Set();
      t.sections.forEach(s => {
        if (secIds.has(s.id)) problems.push(`duplicate section id ${s.id}`); secIds.add(s.id);
        if (!s.html || s.html.length < 200) problems.push(`section ${s.id}: html too short`);
        if (norw.test(s.html || '') || norw.test(s.title || '') || norw.test((s.keyFacts || []).join(''))) problems.push(`section ${s.id}: Norwegian characters`);
        if (s.illustration) { try { const v = typeof s.illustration === 'function' ? s.illustration() : s.illustration; if (typeof v !== 'string' || !v.includes('<svg')) problems.push(`section ${s.id}: illustration is not an svg string`); else svgs.push({ name: 'section-' + s.id, svg: v }); } catch (e) { problems.push(`section ${s.id}: illustration threw: ${e.message}`); } }
        if (s.check) { if (!Array.isArray(s.check.options) || s.check.options.length !== 4) problems.push(`section ${s.id}: check needs 4 options`); if (typeof s.check.answer !== 'number' || s.check.answer < 0 || s.check.answer > 3) problems.push(`section ${s.id}: check bad answer`); if (!s.check.explanation) problems.push(`section ${s.id}: check missing explanation`); }
      });
      const qids = new Set(); const answerHist = [0, 0, 0, 0];
      t.questions.forEach(q => {
        if (qids.has(q.id)) problems.push(`duplicate question id ${q.id}`); qids.add(q.id);
        if (!Array.isArray(q.options) || q.options.length !== 4) problems.push(`${q.id}: needs exactly 4 options`);
        else if (new Set(q.options.map(o => String(o).trim().toLowerCase())).size !== 4) problems.push(`${q.id}: duplicate options`);
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) problems.push(`${q.id}: bad answer index`); else answerHist[q.answer]++;
        if (!q.explanation || q.explanation.length < 20) problems.push(`${q.id}: explanation missing or too short`);
        if (![1, 2, 3, 4].includes(q.part)) problems.push(`${q.id}: part must be 1-4`);
        if (q.part === 4 && !/^1\.4\.[1-7]$/.test(q.p4 || '')) problems.push(`${q.id}: part 4 question needs p4 like '1.4.3'`);
        if (norw.test(JSON.stringify({ q: q.q, o: q.options, e: q.explanation }))) problems.push(`${q.id}: Norwegian characters`);
        if (/all of the above|none of the above/i.test((q.options || []).join(' '))) problems.push(`${q.id}: avoid "all/none of the above"`);
        if (q.illustration) { try { const v = typeof q.illustration === 'function' ? q.illustration() : q.illustration; if (typeof v !== 'string' || !v.includes('<svg')) problems.push(`${q.id}: illustration is not an svg string`); else svgs.push({ name: 'q-' + q.id, svg: v }); } catch (e) { problems.push(`${q.id}: illustration threw: ${e.message}`); } }
      });
      const n = t.questions.length; if (n >= 20 && answerHist.some(c => c > n * 0.45)) problems.push(`answer positions are skewed ${answerHist.join('/')} — shuffle correct answers across A–D`);
      t.flashcards.forEach((c, k) => { if (!c.front || !c.back) problems.push(`flashcard ${k} incomplete`); if (norw.test(c.front + c.back)) problems.push(`flashcard ${k}: Norwegian characters`); });
    }
    const gallery = (window.BOAT_SVG && window.BOAT_SVG.gallery) ? window.BOAT_SVG.gallery.map(g => { try { const v = typeof g.svg === 'function' ? g.svg() : g.svg; if (typeof v !== 'string' || !v.includes('<svg')) { problems.push(`gallery ${g.name}: not an svg string`); return null; } return { name: g.name, svg: v }; } catch (e) { problems.push(`gallery ${g.name}: threw ${e.message}`); return null; } }).filter(Boolean) : [];
    return { topic: t ? { id: t.id, sections: t.sections.length, questions: t.questions.length, flashcards: t.flashcards.length } : null, problems, svgs, gallery, trainers: B.trainers.map(x => x.id) };
  }, slug);

  async function renderAll(list, dir) {
    fs.mkdirSync(dir, { recursive: true });
    const out = [];
    for (const item of list) {
      const file = path.join(dir, item.name.replace(/[^a-z0-9_.-]+/gi, '_') + '.png');
      await page.setContent(`<!doctype html><html ${dark ? 'data-theme="dark"' : ''}><head><meta charset="utf-8"><style>${css} body{padding:12px;display:inline-block}</style></head><body><div id="fig" style="display:inline-block;background:var(--paper-2);padding:8px;border-radius:8px">${item.svg}</div></body></html>`);
      await page.waitForTimeout(30);
      const el = await page.$('#fig');
      await el.screenshot({ path: file });
      out.push(file);
    }
    return out;
  }
  // render a lesson page for layout review when --shots is given with a slug
  if (slug && shotsDir && report.topic) {
    await renderAll(report.svgs, shotsDir);
    await page.goto('file://' + tmp + '#lesson.' + slug); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shotsDir, '_lesson-' + slug + '.png'), fullPage: true });
    // trainers too
    for (const id of report.trainers) { await page.goto('file://' + tmp + '#trainer.' + id); await page.waitForTimeout(200); await page.screenshot({ path: path.join(shotsDir, '_trainer-' + id + '.png'), fullPage: true }); }
  }
  if (galleryDir) await renderAll(report.gallery, galleryDir);
  await browser.close();
  fs.unlinkSync(tmp);
  const summary = { topic: report.topic, galleryEntries: report.gallery.length, trainers: report.trainers, problems: report.problems, errors };
  console.log(JSON.stringify(summary, null, 2));
  process.exit(report.problems.length || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
