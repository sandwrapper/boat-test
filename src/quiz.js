/* Skipper Prep — quiz engines: inline checks, topic practice, mock exam, flashcards. */
(function () {
  'use strict';
  const B = window.BOAT;
  const esc = B.esc;
  const KEYS = ['A', 'B', 'C', 'D'];

  function questionCard(q, opts) {
    opts = opts || {};
    const art = B.renderArt(q.illustration);
    return `<div class="qcard">
      ${opts.header || ''}
      <div class="qtext">${esc(q.q)}</div>
      ${art ? `<div class="qart">${art}</div>` : ''}
      <div class="options" role="group" aria-label="Answer options">
        ${q.options.map((o, i) => `<button type="button" class="opt ${opts.selected === i ? 'selected' : ''}" data-i="${i}"><span class="key">${KEYS[i]}</span><span>${esc(o)}</span></button>`).join('')}
      </div>
      <div class="explain-slot"></div>
    </div>`;
  }

  function reveal(card, q, chosen) {
    card.querySelectorAll('.opt').forEach(btn => {
      const i = +btn.dataset.i;
      btn.disabled = true;
      if (i === q.answer) btn.classList.add('correct');
      else if (i === chosen) btn.classList.add('wrong');
    });
    const ok = chosen === q.answer;
    card.querySelector('.explain-slot').innerHTML = `<div class="explain ${ok ? '' : 'bad'}"><p><strong>${ok ? 'Correct.' : 'Not quite.'}</strong> ${q.explanation ? esc(q.explanation) : ''}</p></div>`;
    return ok;
  }

  // ---------- Inline section check ----------
  function mountInlineCheck(el, q, onCorrect) {
    q = Object.assign({ options: [], answer: 0 }, q);
    el.innerHTML = `<div class="eyebrow" style="margin:.8rem 0 .3rem">Check yourself</div>` + questionCard(q);
    el.addEventListener('click', e => {
      const btn = e.target.closest('.opt'); if (!btn || btn.disabled) return;
      const ok = reveal(el, q, +btn.dataset.i);
      if (q.id) B.progress.recordAnswer(q.id, ok);
      if (ok && onCorrect) onCorrect();
    });
  }

  // ---------- Practice quiz ----------
  function pickPractice(scope, n) {
    let pool;
    if (scope === 'all' || !scope) pool = B.allQuestions();
    else if (scope === 'weak') { const s = B.progress.qstats(); pool = B.allQuestions().filter(q => s[q.id] && !s[q.id].lastCorrect); }
    else { const t = B.topic(scope); pool = t ? t.questions.slice() : []; }
    // prefer unseen / previously-wrong questions
    const s = B.progress.qstats();
    const weight = q => { const e = s[q.id]; if (!e) return 3; if (!e.lastCorrect) return 2.5; return 1; };
    const weighted = pool.map(q => ({ q, k: Math.random() * weight(q) })).sort((a, b) => b.k - a.k).map(x => x.q);
    return weighted.slice(0, n);
  }

  B.registerView('practice', (el, r) => {
    const scope = r.a || 'all';
    const t = scope !== 'all' && scope !== 'weak' ? B.topic(scope) : null;
    const title = scope === 'weak' ? 'Missed questions' : t ? t.title : 'All topics';
    if (!r.b) {
      // setup screen
      const total = scope === 'weak' ? pickPractice('weak', 9999).length : t ? t.questions.length : B.allQuestions().length;
      el.innerHTML = `<div class="crumbs"><a href="#practice">Practice</a> › ${esc(title)}</div>
        <div class="pagehead"><div><div class="eyebrow">Practice quiz</div><h1>${esc(title)}</h1><p>Immediate feedback with an explanation after every answer. Questions you have not seen, or got wrong, come first. Use keys <kbd>1</kbd>–<kbd>4</kbd> to answer and <kbd>Enter</kbd> for the next question.</p></div></div>
        <div class="card" style="max-width:640px">
          <div class="inputrow">
            <label for="scopeSel">Topic</label>
            <select id="scopeSel"><option value="all" ${scope === 'all' ? 'selected' : ''}>All topics</option><option value="weak" ${scope === 'weak' ? 'selected' : ''}>Only questions I got wrong</option>${B.topics.map(x => `<option value="${x.id}" ${x.id === scope ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select>
            <label for="countSel">Questions</label>
            <select id="countSel"><option>10</option><option selected>20</option><option>30</option><option>50</option></select>
            <button class="btn primary" id="startBtn" ${total ? '' : 'disabled'}>Start</button>
          </div>
          <p class="small muted" style="margin:.8rem 0 0">${total} question${total === 1 ? '' : 's'} available in this selection.</p>
        </div>`;
      el.querySelector('#scopeSel').addEventListener('change', e => B.go('practice.' + e.target.value));
      el.querySelector('#startBtn').addEventListener('click', () => { B.go(`practice.${el.querySelector('#scopeSel').value}.${el.querySelector('#countSel').value}`); });
      return;
    }
    const n = Math.max(1, parseInt(r.b, 10) || 20);
    const qs = pickPractice(scope, n);
    if (!qs.length) { el.innerHTML = `<p>No questions available.</p><a class="btn" href="#practice">Back</a>`; return; }
    let i = 0, right = 0, answered = false;
    el.innerHTML = `<div class="quiz"><div class="quiz-head"><div><div class="crumbs"><a href="#practice.${scope}">Practice</a> › ${esc(title)}</div><div class="eyebrow">Question <span id="qn">1</span> of ${qs.length}</div></div><div class="pill" id="scorepill">0 correct</div></div>
      <div class="progress" style="margin-bottom:1rem"><span id="bar" style="width:0%"></span></div><div id="qhost"></div>
      <div class="qfoot"><a class="btn ghost sm" href="#practice.${scope}">Quit</a><button class="btn primary" id="nextBtn" disabled>Next question</button></div></div>`;
    const host = el.querySelector('#qhost'), nextBtn = el.querySelector('#nextBtn');
    function show() {
      answered = false; const q = qs[i];
      el.querySelector('#qn').textContent = i + 1; el.querySelector('#bar').style.width = (100 * i / qs.length) + '%';
      host.innerHTML = questionCard(q, { header: `<div class="small muted" style="margin-bottom:.4rem">${esc(B.topic(q.topic).title)}</div>` });
      nextBtn.disabled = true; nextBtn.textContent = i === qs.length - 1 ? 'See results' : 'Next question';
    }
    function answer(idx) {
      if (answered) return; answered = true;
      const q = qs[i]; const ok = reveal(host, q, idx); B.progress.recordAnswer(q.id, ok);
      if (ok) right++; el.querySelector('#scorepill').textContent = `${right} correct`; nextBtn.disabled = false; nextBtn.focus();
    }
    function next() {
      if (!answered) return;
      i++; if (i < qs.length) { show(); window.scrollTo({ top: 0 }); } else finish();
    }
    function finish() {
      const pct = Math.round(100 * right / qs.length);
      el.querySelector('.quiz').innerHTML = `<div class="qcard score"><div class="eyebrow">${esc(title)}</div><div class="big">${right}/${qs.length}</div><div class="verdict ${pct >= 80 ? 'pass' : 'fail'}">${pct}% correct</div><p class="muted">${pct >= 80 ? 'That is exam standard. Keep going.' : 'Below the 80% the exam needs. Re-read the lesson, then try again.'}</p>
        <div class="btnrow" style="justify-content:center"><a class="btn primary" href="#practice.${scope}.${n}" onclick="setTimeout(()=>BOAT.render(),0)">Another round</a>${t ? `<a class="btn" href="#lesson.${t.id}">Re-read lesson</a>` : ''}<a class="btn" href="#review">Review weak spots</a></div></div>`;
    }
    host.addEventListener('click', e => { const btn = e.target.closest('.opt'); if (btn && !btn.disabled) answer(+btn.dataset.i); });
    nextBtn.addEventListener('click', next);
    const onKey = e => { if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return; if (/^[1-4]$/.test(e.key)) answer(+e.key - 1); else if (e.key === 'Enter') next(); };
    document.addEventListener('keydown', onKey);
    show();
    return () => document.removeEventListener('keydown', onKey);
  });

  // ---------- Mock exam ----------
  // The real exam draws from four curriculum parts (1 seamanship, 2 laws and regulations,
  // 3 navigation and chart reading, 4 particularly important topics). Part 4 has its own rule:
  // more than two wrong answers there fails the exam regardless of the total.
  function partOf(q) { const p = +q.part; if (p >= 1 && p <= 4) return p; const t = B.topic(q.topic); return (t && t.defaultPart) || 1; }
  function buildExam() {
    const total = B.exam.questions;
    const counts = Object.assign({}, B.exam.partCounts);
    const recent = new Set((B.progress.exams()[0] || { ids: [] }).ids || []);
    const byPart = { 1: [], 2: [], 3: [], 4: [] };
    B.allQuestions().forEach(q => byPart[partOf(q)].push(q));
    // shuffled, with questions from the previous exam moved to the back
    const order = g => { const sh = B.shuffle(g); return sh.filter(q => !recent.has(q.id)).concat(sh.filter(q => recent.has(q.id))); };
    const groupBy = (list, key) => { const g = {}; list.forEach(q => { (g[key(q)] = g[key(q)] || []).push(q); }); return g; };
    const picked = [];
    // Parts 1-3: each topic gets a share of the part's slots proportional to its examShare and to the
    // fraction of its questions that sit in that part, so a topic with a handful of part-3 questions
    // (tides in the weather topic) does not take a quarter of the navigation block.
    [1, 2, 3].forEach(part => {
      const groups = groupBy(byPart[part], q => q.topic);
      const ids = Object.keys(groups);
      if (!ids.length) return;
      const lists = ids.map(id => order(groups[id]));
      const weights = ids.map(id => { const t = B.topic(id); const n = t ? t.questions.length : groups[id].length; return ((t && t.examShare) || 1) * groups[id].length / Math.max(1, n); });
      const sum = weights.reduce((a, b) => a + b, 0) || 1;
      const target = weights.map(w => counts[part] * w / sum);
      const take = target.map((t, i) => Math.min(Math.floor(t), lists[i].length));
      let left = counts[part] - take.reduce((a, b) => a + b, 0);
      // hand out the remaining slots with probability proportional to the fractional remainders
      while (left > 0) {
        const cand = ids.map((id, i) => ({ i, w: Math.max(0.05, target[i] - take[i]) })).filter(c => lists[c.i].length > take[c.i]);
        if (!cand.length) break;
        let r = Math.random() * cand.reduce((a, c) => a + c.w, 0), chosen = cand[cand.length - 1];
        for (const c of cand) { r -= c.w; if (r <= 0) { chosen = c; break; } }
        take[chosen.i]++; left--;
      }
      ids.forEach((id, i) => picked.push(...lists[i].slice(0, take[i])));
    });
    // Part 4: round-robin over the seven "particularly important" items (1.4.1 ... 1.4.7) so every item is
    // represented, and within an item over the topics that contribute to it.
    {
      const items = groupBy(byPart[4], q => q.p4 || 'other');
      const lists = B.shuffle(Object.keys(items)).map(k => {
        const tl = Object.values(groupBy(items[k], q => q.topic)).map(order);
        const out = []; let i = 0;
        while (tl.some(l => l.length)) { const l = tl[i % tl.length]; if (l.length) out.push(l.shift()); i++; }
        return out;
      });
      let got = 0, k = 0;
      while (got < counts[4] && lists.some(l => l.length)) { const l = lists[k % lists.length]; if (l.length) { picked.push(l.shift()); got++; } k++; }
    }
    if (picked.length < total) {
      const have = new Set(picked.map(q => q.id));
      picked.push(...B.shuffle(B.allQuestions().filter(q => !have.has(q.id))).slice(0, total - picked.length));
    }
    return B.shuffle(picked.slice(0, total));
  }

  B.registerView('exam', (el, r) => {
    if (r.a !== 'run') {
      const exams = B.progress.exams();
      el.innerHTML = `<div class="pagehead"><div><div class="eyebrow">Mock exam</div><h1>Full-length exam simulation</h1><p>${B.exam.questions} multiple-choice questions in ${B.exam.minutes} minutes, drawn from the four official curriculum parts in roughly equal numbers. Two things must both be true to pass: at least ${B.exam.pass} correct overall, and no more than ${B.exam.maxPart4Errors} wrong in part 4, the "particularly important topics". No feedback until you hand in. ${B.exam.note ? esc(B.exam.note) : ''}</p></div></div>
        <div class="grid two">
          <div class="card raised"><h3>Before you start</h3><ul><li>You can move freely between questions and flag any for a second look.</li><li>The attempt is lost if you leave the page or reload, so stay on it until you hand in.</li><li>Unanswered questions count as wrong, so always pick something.</li><li>Keys <kbd>1</kbd>–<kbd>4</kbd> answer, <kbd>←</kbd> <kbd>→</kbd> move, <kbd>F</kbd> flags.</li></ul><div class="btnrow"><a class="btn primary" href="#exam.run">Start the exam</a></div></div>
          <div class="card"><h3>Your attempts</h3>${exams.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Score</th><th>Result</th></tr></thead><tbody>${exams.slice(0, 8).map(e => `<tr><td>${new Date(e.date).toLocaleDateString()}</td><td class="num">${e.score}/${e.total}</td><td>${e.passed ? '<span class="pill ok">Pass</span>' : '<span class="pill bad">Fail</span>'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No attempts yet.</p>'}</div>
        </div>`;
      return;
    }
    const qs = buildExam();
    if (qs.length < 5) { el.innerHTML = '<p>Not enough questions loaded for an exam.</p>'; return; }
    const answers = new Array(qs.length).fill(null), flags = new Array(qs.length).fill(false);
    let i = 0, finished = false;
    const startedAt = Date.now(), deadline = startedAt + B.exam.minutes * 60 * 1000;
    el.innerHTML = `<div class="quiz">
      <div class="quiz-head"><div><div class="eyebrow">Mock exam</div><h2 style="margin:0">Question <span id="qn">1</span> of ${qs.length}</h2></div><div class="btnrow"><span class="timer" id="timer" aria-live="off">${B.fmtTime(B.exam.minutes * 60)}</span><button class="btn sm" id="flagBtn" title="Flag for review (F)">⚑ Flag</button><button class="btn sm sea" id="handIn">Hand in</button></div></div>
      <div class="navgrid" id="navgrid"></div><div id="qhost"></div>
      <div class="qfoot"><button class="btn" id="prevBtn">← Previous</button><span class="small muted" id="status"></span><button class="btn primary" id="nextBtn">Next →</button></div></div>`;
    const host = el.querySelector('#qhost'), nav = el.querySelector('#navgrid'), timerEl = el.querySelector('#timer');
    function renderNav() {
      nav.innerHTML = qs.map((q, k) => `<button type="button" data-k="${k}" class="${answers[k] != null ? 'answered' : ''} ${flags[k] ? 'flagged' : ''} ${k === i ? 'current' : ''}" aria-label="Question ${k + 1}">${k + 1}</button>`).join('');
      const left = answers.filter(a => a == null).length;
      el.querySelector('#status').textContent = left ? `${left} unanswered` : 'All answered';
    }
    function show() {
      const q = qs[i]; el.querySelector('#qn').textContent = i + 1;
      host.innerHTML = questionCard(q, { selected: answers[i] });
      el.querySelector('#flagBtn').classList.toggle('primary', flags[i]);
      el.querySelector('#prevBtn').disabled = i === 0; el.querySelector('#nextBtn').textContent = i === qs.length - 1 ? 'Review and hand in' : 'Next →';
      renderNav();
    }
    function select(idx) { answers[i] = idx; host.querySelectorAll('.opt').forEach(b => b.classList.toggle('selected', +b.dataset.i === idx)); renderNav(); }
    function move(d) { const n = i + d; if (n < 0) return; if (n >= qs.length) { confirmHandIn(); return; } i = n; show(); }
    function confirmHandIn() {
      const left = answers.filter(a => a == null).length;
      const bar = el.querySelector('#handIn');
      if (left && !bar.dataset.armed) { bar.dataset.armed = '1'; bar.textContent = `Hand in with ${left} unanswered?`; bar.classList.add('primary'); setTimeout(() => { delete bar.dataset.armed; bar.textContent = 'Hand in'; bar.classList.remove('primary'); }, 4000); return; }
      finish(false);
    }
    const tick = setInterval(() => {
      const left = (deadline - Date.now()) / 1000;
      timerEl.textContent = B.fmtTime(left); timerEl.classList.toggle('low', left < 300);
      if (left <= 0) finish(true);
    }, 500);
    function finish(timedOut) {
      if (finished) return; finished = true; clearInterval(tick); document.removeEventListener('keydown', onKey);
      const seconds = Math.round((Math.min(Date.now(), deadline) - startedAt) / 1000);
      let score = 0; const perTopic = {}; const perPart = { 1: { right: 0, total: 0 }, 2: { right: 0, total: 0 }, 3: { right: 0, total: 0 }, 4: { right: 0, total: 0 } };
      qs.forEach((q, k) => {
        const ok = answers[k] === q.answer; if (ok) score++;
        B.progress.recordAnswer(q.id, ok);
        const pt = perTopic[q.topic] || (perTopic[q.topic] = { right: 0, total: 0 }); pt.total++; if (ok) pt.right++;
        const pp = perPart[partOf(q)]; pp.total++; if (ok) pp.right++;
      });
      const p4wrong = perPart[4].total - perPart[4].right;
      const scoreOk = score >= B.exam.pass, p4ok = p4wrong <= B.exam.maxPart4Errors;
      const passed = scoreOk && p4ok;
      B.progress.addExam({ date: Date.now(), score, total: qs.length, passed, seconds, ids: qs.map(q => q.id), perTopic, perPart, p4wrong });
      el.innerHTML = `<div class="quiz">
        <div class="qcard score"><div class="eyebrow">${timedOut ? 'Time is up' : 'Handed in'} · ${B.fmtTime(seconds)} used</div><div class="big">${score}/${qs.length}</div><div class="verdict ${passed ? 'pass' : 'fail'}">${passed ? 'PASS' : 'FAIL'}</div>
          <p class="muted" style="margin:.4rem 0 0">Pass mark ${B.exam.pass} of ${qs.length}: <b>${scoreOk ? 'met' : 'not met'}</b>. Part 4 (particularly important topics): <b class="num">${p4wrong}</b> wrong of ${perPart[4].total}, limit ${B.exam.maxPart4Errors}: <b>${p4ok ? 'met' : 'not met'}</b>.</p>
          <p class="muted">${passed ? (score >= B.exam.pass + 5 && p4wrong <= 1 ? 'Comfortably above the pass mark. Review the misses below so they do not come back.' : 'Passed, but close to the line. Review the misses and run another exam.') : (!p4ok && scoreOk ? 'Your total would pass, but more than two mistakes in the particularly important topics fails the real exam. Drill those first.' : 'Not there yet. Work through every wrong answer below, re-read the weak topics, then try again.')}</p>
          <div class="btnrow" style="justify-content:center"><a class="btn primary" href="#exam.run" onclick="setTimeout(()=>BOAT.render(),0)">New exam</a><a class="btn" href="#review">Review page</a><a class="btn ghost" href="#home">Home</a></div></div>
        <div class="card" style="margin:1rem 0"><h3>By curriculum part</h3><div class="weak" style="margin:.6rem 0 1rem">${[1, 2, 3, 4].map(p => { const pp = perPart[p]; if (!pp.total) return ''; const pct = Math.round(100 * pp.right / pp.total); return `<div class="row"><span>${['', 'Part 1 · Seamanship', 'Part 2 · Laws and regulations', 'Part 3 · Navigation and chart reading', 'Part 4 · Particularly important topics'][p]}</span><div class="progress ${p === 4 && pp.total - pp.right > B.exam.maxPart4Errors ? 'accent' : ''}"><span style="width:${pct}%"></span></div><span class="num small">${pp.right}/${pp.total}</span></div>`; }).join('')}</div><h3>By topic</h3><div class="weak" style="margin-top:.6rem">${Object.keys(perTopic).map(id => { const pt = perTopic[id], pct = Math.round(100 * pt.right / pt.total); const t = B.topic(id); return `<div class="row"><a href="#lesson.${id}">${esc(t ? t.title : id)}</a><div class="progress ${pct < 70 ? 'accent' : ''}"><span style="width:${pct}%"></span></div><span class="num small">${pt.right}/${pt.total}</span></div>`; }).join('')}</div></div>
        <h2 style="margin:1.2rem 0 .6rem">All questions</h2><div class="navgrid" id="resnav">${qs.map((q, k) => `<button type="button" data-k="${k}" class="${answers[k] === q.answer ? 'right' : 'wrongq'}">${k + 1}</button>`).join('')}</div>
        <div id="reslist">${qs.map((q, k) => { const ok = answers[k] === q.answer; const art = B.renderArt(q.illustration); return `<div class="qcard" id="res-${k}" style="margin-bottom:1rem"><div class="small muted">Question ${k + 1} · ${esc(B.topic(q.topic).title)} · Part ${partOf(q)}${partOf(q) === 4 ? ' (particularly important)' : ''} · ${ok ? '<span class="pill ok">correct</span>' : '<span class="pill bad">wrong</span>'}</div><div class="qtext">${esc(q.q)}</div>${art ? `<div class="qart">${art}</div>` : ''}<div class="options">${q.options.map((o, j) => `<div class="opt ${j === q.answer ? 'correct' : (j === answers[k] ? 'wrong' : '')}"><span class="key">${KEYS[j]}</span><span>${esc(o)}</span></div>`).join('')}</div><div class="explain ${ok ? '' : 'bad'}"><p>${answers[k] == null ? '<strong>Not answered.</strong> ' : ''}${esc(q.explanation || '')}</p></div></div>`; }).join('')}</div></div>`;
      el.querySelector('#resnav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) document.getElementById('res-' + b.dataset.k).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      window.scrollTo(0, 0);
    }
    host.addEventListener('click', e => { const btn = e.target.closest('.opt'); if (btn) select(+btn.dataset.i); });
    nav.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { i = +b.dataset.k; show(); } });
    el.querySelector('#prevBtn').addEventListener('click', () => move(-1));
    el.querySelector('#nextBtn').addEventListener('click', () => move(1));
    el.querySelector('#flagBtn').addEventListener('click', () => { flags[i] = !flags[i]; show(); });
    el.querySelector('#handIn').addEventListener('click', confirmHandIn);
    const onKey = e => { if (finished) return; if (/^[1-4]$/.test(e.key)) select(+e.key - 1); else if (e.key === 'ArrowRight') move(1); else if (e.key === 'ArrowLeft') move(-1); else if (e.key.toLowerCase() === 'f') { flags[i] = !flags[i]; show(); } };
    document.addEventListener('keydown', onKey);
    show();
    return () => { clearInterval(tick); document.removeEventListener('keydown', onKey); };
  });

  // ---------- Flashcards (3-box Leitner) ----------
  B.registerView('flash', (el, r) => {
    const scope = r.a || '';
    if (!scope) {
      el.innerHTML = `<div class="pagehead"><div><div class="eyebrow">Flashcards</div><h1>Flashcards</h1><p>Tap a card to flip it. Mark it "Got it" or "Again"; cards you miss come back sooner. Progress is saved in this browser.</p></div></div>
        <div class="grid">${B.topics.map(t => { const boxes = B.progress.flashBoxes(); const known = t.flashcards.filter((c, k) => (boxes[t.id + ':' + k] || 0) >= 2).length; return `<article class="card topiccard"><h3>${esc(t.title)}</h3><div class="meta"><span>${t.flashcards.length} cards</span><span>${known} known</span></div><div class="progress"><span style="width:${t.flashcards.length ? Math.round(100 * known / t.flashcards.length) : 0}%"></span></div><div class="actions"><a class="btn sm primary" href="#flash.${t.id}">Study</a></div></article>`; }).join('')}
        <article class="card topiccard"><h3>Everything</h3><p class="small muted" style="margin:0">All topics mixed, weakest cards first.</p><div class="actions"><a class="btn sm sea" href="#flash.all">Study all</a></div></article></div>`;
      return;
    }
    const cards = scope === 'all' ? B.topics.flatMap(t => t.flashcards.map((c, k) => ({ c, key: t.id + ':' + k, topic: t.title }))) : (B.topic(scope) ? B.topic(scope).flashcards.map((c, k) => ({ c, key: scope + ':' + k, topic: B.topic(scope).title })) : []);
    if (!cards.length) { el.innerHTML = '<p>No flashcards here yet.</p><a class="btn" href="#flash">Back</a>'; return; }
    const boxes = B.progress.flashBoxes();
    let queue = cards.map(x => ({ ...x, box: boxes[x.key] || 0 })).sort((a, b) => a.box - b.box || Math.random() - 0.5);
    let idx = 0, flipped = false, gotIt = 0, again = 0;
    const title = scope === 'all' ? 'All topics' : B.topic(scope).title;
    el.innerHTML = `<div class="flash"><div class="crumbs"><a href="#flash">Flashcards</a> › ${esc(title)}</div><div class="quiz-head"><div class="eyebrow">Card <span id="cn">1</span> of <span id="ctot">${queue.length}</span></div><div class="btnrow"><span class="pill ok" id="gotpill">0 got it</span><span class="pill bad" id="againpill">0 again</span></div></div>
      <div class="fcard" id="fcard" tabindex="0" role="button" aria-label="Flip card"><div class="inner"><div class="face front"><span class="eyebrow" id="ftopic"></span><div id="front"></div></div><div class="face back"><span class="eyebrow">Answer</span><div id="back"></div></div></div></div>
      <div class="qfoot" style="margin-top:1rem"><button class="btn" id="againBtn" disabled>Again</button><span class="small muted">Space flips · 1 again · 2 got it</span><button class="btn primary" id="gotBtn" disabled>Got it</button></div></div>`;
    const fc = el.querySelector('#fcard');
    function show() {
      const x = queue[idx]; flipped = false; fc.classList.remove('flipped');
      el.querySelector('#cn').textContent = idx + 1; el.querySelector('#ftopic').textContent = x.topic;
      el.querySelector('#front').innerHTML = x.c.front; el.querySelector('#back').innerHTML = x.c.back;
      el.querySelector('#againBtn').disabled = el.querySelector('#gotBtn').disabled = true;
    }
    function flip() { flipped = !flipped; fc.classList.toggle('flipped', flipped); if (flipped) el.querySelector('#againBtn').disabled = el.querySelector('#gotBtn').disabled = false; }
    function grade(ok) {
      if (!flipped) return;
      const x = queue[idx]; x.box = ok ? Math.min(3, x.box + 1) : 0; B.progress.setFlashBox(x.key, x.box);
      if (ok) gotIt++; else { again++; queue.push({ ...x }); }
      el.querySelector('#gotpill').textContent = `${gotIt} got it`; el.querySelector('#againpill').textContent = `${again} again`;
      idx++;
      if (idx >= queue.length) { el.querySelector('.flash').innerHTML = `<div class="qcard score"><div class="eyebrow">${esc(title)}</div><div class="big">${gotIt}</div><div class="verdict pass">cards known</div><p class="muted">${again ? `${again} card${again === 1 ? '' : 's'} needed a second look.` : 'Every card known on the first pass.'}</p><div class="btnrow" style="justify-content:center"><a class="btn primary" href="#flash.${scope}" onclick="setTimeout(()=>BOAT.render(),0)">Again</a><a class="btn" href="#flash">All decks</a></div></div>`; return; }
      el.querySelector('#cn').textContent = idx + 1; el.querySelector('#ctot').textContent = queue.length; show();
    }
    fc.addEventListener('click', flip);
    el.querySelector('#againBtn').addEventListener('click', () => grade(false));
    el.querySelector('#gotBtn').addEventListener('click', () => grade(true));
    const onKey = e => { if (e.key === ' ') { e.preventDefault(); flip(); } else if (e.key === '1') grade(false); else if (e.key === '2') grade(true); else if (e.key === 'Enter' && !flipped) flip(); };
    document.addEventListener('keydown', onKey);
    show();
    return () => document.removeEventListener('keydown', onKey);
  });

  B.quiz = { questionCard, reveal, mountInlineCheck, buildExam, pickPractice, partOf };
})();
