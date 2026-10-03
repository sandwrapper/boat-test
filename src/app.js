/* Skipper Prep — core: registry, storage, router, home/learn/lesson/review views. */
window.BOAT = (function () {
  'use strict';

  // ---------- Registry ----------
  const topics = [];
  const trainers = [];
  const exam = { questions: 50, minutes: 60, pass: 40, maxPart4Errors: 2, partCounts: { 1: 13, 2: 12, 3: 12, 4: 13 }, note: '' };

  // Deterministic per-question option shuffle so the correct answer is spread evenly over A-D
  // whatever order the author wrote (the real exam randomises too). Seeded by the question id.
  function seededRandom(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return function () { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  }
  function shuffleOptions(q) {
    if (!Array.isArray(q.options) || q.options.length !== 4 || typeof q.answer !== 'number' || q.noShuffle) return;
    if (q.options.every(o => /^[A-D]$/.test(String(o).trim()))) return; // options are picture labels: keep A-D order
    const rnd = seededRandom(String(q.id || q.q));
    const idx = [0, 1, 2, 3];
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    q.options = idx.map(k => q.options[k]);
    q.answer = idx.indexOf(q.answer);
  }
  function register(t) {
    if (!t || !t.id) throw new Error('BOAT.register: topic needs an id');
    t.sections = t.sections || [];
    t.sections.forEach(s => { if (s.check) { if (!s.check.id) s.check.id = t.id + '-check-' + s.id; shuffleOptions(s.check); } });
    t.flashcards = t.flashcards || [];
    t.questions = t.questions || [];
    t.questions.forEach((q, i) => {
      if (!q.id) q.id = t.id + '-' + (i + 1);
      q.topic = t.id;
      shuffleOptions(q);
      if (!Array.isArray(q.options) || q.options.length !== 4) console.warn('Question without 4 options', q.id);
      if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) console.warn('Question with bad answer index', q.id);
    });
    const existing = topics.findIndex(x => x.id === t.id);
    if (existing >= 0) topics[existing] = t; else topics.push(t);
    topics.sort((a, b) => (a.order || 99) - (b.order || 99));
  }
  function registerTrainer(tr) {
    if (!tr || !tr.id || typeof tr.mount !== 'function') throw new Error('BOAT.registerTrainer: needs id and mount()');
    const i = trainers.findIndex(x => x.id === tr.id);
    if (i >= 0) trainers[i] = tr; else trainers.push(tr);
  }
  function setExam(o) { Object.assign(exam, o || {}); }
  function topic(id) { return topics.find(t => t.id === id); }
  function allQuestions() { return topics.flatMap(t => t.questions); }
  function questionById(id) { return allQuestions().find(q => q.id === id); }

  // ---------- Storage (per-browser progress) ----------
  const PREFIX = 'skipperprep.';
  const store = {
    get(key, def) {
      try { const v = localStorage.getItem(PREFIX + key); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set(key, val) { try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } },
    remove(key) { try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ } },
  };
  const progress = {
    qstats() { return store.get('qstats', {}); },
    recordAnswer(qid, correct) {
      const s = this.qstats();
      const e = s[qid] || { seen: 0, right: 0, wrong: 0 };
      e.seen++; if (correct) e.right++; else e.wrong++;
      e.last = Date.now(); e.lastCorrect = !!correct;
      s[qid] = e; store.set('qstats', s);
    },
    read() { return store.get('read', {}); },
    markRead(topicId, sectionId) {
      const r = this.read(); r[topicId] = r[topicId] || {}; r[topicId][sectionId] = true; store.set('read', r);
    },
    isRead(topicId, sectionId) { const r = this.read(); return !!(r[topicId] && r[topicId][sectionId]); },
    topicReadPct(t) {
      if (!t.sections.length) return 0;
      const r = this.read()[t.id] || {};
      return Math.round(100 * t.sections.filter(s => r[s.id]).length / t.sections.length);
    },
    topicMastery(t) {
      // share of this topic's questions answered correctly on the most recent attempt
      const s = this.qstats();
      const seen = t.questions.filter(q => s[q.id]);
      if (!seen.length) return { seen: 0, pct: null };
      const right = seen.filter(q => s[q.id].lastCorrect).length;
      return { seen: seen.length, pct: Math.round(100 * right / seen.length) };
    },
    exams() { return store.get('exams', []); },
    addExam(result) { const e = this.exams(); e.unshift(result); store.set('exams', e.slice(0, 30)); },
    flashBoxes() { return store.get('flash', {}); },
    setFlashBox(key, box) { const f = this.flashBoxes(); f[key] = box; store.set('flash', f); },
    plan() { return store.get('plan', {}); },
    togglePlan(id) { const p = this.plan(); p[id] = !p[id]; store.set('plan', p); },
    reset() { ['qstats', 'read', 'exams', 'flash', 'plan'].forEach(k => store.remove(k)); },
    readiness() {
      if (!topics.length) return 0;
      let readSum = 0, masterySum = 0, masteryCount = 0;
      topics.forEach(t => { readSum += this.topicReadPct(t); const m = this.topicMastery(t); if (m.pct != null) { masterySum += m.pct; masteryCount++; } });
      const read = readSum / topics.length;
      const mastery = masteryCount ? masterySum / topics.length : 0;
      const bestExam = this.exams().reduce((b, e) => Math.max(b, e.score / e.total * 100), 0);
      return Math.round(read * 0.35 + mastery * 0.4 + bestExam * 0.25);
    },
  };

  // ---------- Utilities ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
  function renderArt(ill) {
    if (!ill) return '';
    try { const s = typeof ill === 'function' ? ill() : ill; return typeof s === 'string' ? s : ''; }
    catch (e) { console.error('Illustration failed', e); return '<p class="muted small">Illustration unavailable.</p>'; }
  }
  function fmtTime(sec) { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  let toastTimer = null;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
  }
  function ring(pct, label) {
    const r = 40, c = 2 * Math.PI * r, off = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
    return `<svg class="ring" viewBox="0 0 100 100" role="img" aria-label="${esc(label || pct + '%')}">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--shallow)" stroke-width="10"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--sea)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="56" text-anchor="middle" font-family="var(--font-mono)" font-size="22" font-weight="700" fill="var(--ink)">${pct}%</text></svg>`;
  }

  // ---------- Router ----------
  const views = {};
  function registerView(name, fn) { views[name] = fn; }
  function route() {
    const raw = (location.hash || '#home').slice(1);
    const parts = raw.split('.');
    return { view: parts[0] || 'home', a: parts[1] || '', b: parts[2] || '', raw };
  }
  function go(hash) { if (location.hash === '#' + hash) render(); else location.hash = hash; }
  let activeCleanup = null;
  function render() {
    const r = route();
    const el = document.getElementById('view');
    if (activeCleanup) { try { activeCleanup(); } catch (e) { /* ignore */ } activeCleanup = null; }
    const fn = views[r.view] || views.home;
    document.querySelectorAll('.mainnav a').forEach(a => a.classList.toggle('active', a.dataset.view === r.view || (r.view === 'lesson' && a.dataset.view === 'learn') || (r.view === 'trainer' && a.dataset.view === 'trainers')));
    el.innerHTML = '';
    try { const cleanup = fn(el, r); if (typeof cleanup === 'function') activeCleanup = cleanup; }
    catch (e) { console.error(e); el.innerHTML = `<div class="card"><h2>Something went wrong</h2><p class="muted">${esc(e.message)}</p><a class="btn" href="#home">Back to home</a></div>`; }
    if (!r.b) window.scrollTo(0, 0);
    el.focus({ preventScroll: true });
  }

  // ---------- Theme ----------
  function initTheme() {
    const saved = store.get('theme', null);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next = cur ? (cur === 'dark' ? 'light' : 'dark') : (sysDark ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', next); store.set('theme', next);
    });
  }

  // ---------- Views: Home ----------
  const PLAN = [
    { day: 'Day 1 — learn the rules', items: [
      { id: 'd1-1', text: 'Read "The exam and the law" and "Rules of the road" (about 90 min)' },
      { id: 'd1-2', text: 'Read "Navigation lights and day shapes" and run the Lights trainer until you score 10 in a row' },
      { id: 'd1-3', text: 'Read "Sound and distress signals" and "Sea marks"; run the Buoy trainer' },
      { id: 'd1-4', text: 'Practice quiz: 20 questions from each topic you read today' },
      { id: 'd1-5', text: 'Flashcards for the whole of day 1 before sleeping' },
    ]},
    { day: 'Day 2 — navigate, stay safe, rehearse', items: [
      { id: 'd2-1', text: 'Read "Charts and navigation"; do the course and speed–time–distance exercises in the Navigation trainer' },
      { id: 'd2-2', text: 'Read "Seamanship", "Safety and emergencies", "Weather" and "Engine and environment"' },
      { id: 'd2-3', text: 'Mock exam 1 (50 questions, 60 minutes). Review every wrong answer.' },
      { id: 'd2-4', text: 'Re-read the weakest two topics shown on the Review page' },
      { id: 'd2-5', text: 'Mock exam 2. Pass mark is 40 of 50; aim for 45 or more.' },
    ]},
  ];

  registerView('home', (el) => {
    const ready = progress.readiness();
    const exams = progress.exams();
    const best = exams.length ? Math.max(...exams.map(e => e.score)) : null;
    el.innerHTML = `
      <section class="hero">
        <div>
          <div class="eyebrow">Norwegian recreational boating licence · craft up to 15 m</div>
          <h1>Pass the boating licence exam in two days.</h1>
          <p class="lede">Ten short lessons with verified illustrations, interactive trainers for lights, sea marks, right of way and sound signals, flashcards, and a full-length mock exam with the real time limit and pass mark. Everything is in English.</p>
          <div class="btnrow">
            <a class="btn primary" href="#learn">Start learning</a>
            <a class="btn sea" href="#exam">Take a mock exam</a>
            <a class="btn" href="#trainers">Open the trainers</a>
          </div>
        </div>
        <div class="card raised">
          <div class="eyebrow">The real exam</div>
          <div class="examfacts" style="margin:.5rem 0 .8rem">
            <div class="fact"><b>${exam.questions}</b><span>questions</span></div>
            <div class="fact"><b>${exam.minutes}</b><span>minutes</span></div>
            <div class="fact"><b>${exam.pass}</b><span>to pass</span></div>
            <div class="fact"><b>≤${exam.maxPart4Errors}</b><span>wrong in part 4</span></div>
          </div>
          <p class="small muted" style="margin:0 0 .6rem">Four curriculum parts: seamanship, laws and regulations, navigation and chart reading, and the "particularly important topics" (part 4), where more than ${exam.maxPart4Errors} mistakes fails the exam regardless of the total.</p>
          ${exam.note ? `<p class="small muted" style="margin:0 0 .6rem">${exam.note}</p>` : ''}
          <div class="readiness">
            ${ring(ready, 'Readiness ' + ready + '%')}
            <div>
              <div class="eyebrow">Readiness</div>
              <p class="small" style="margin:0">Weighted from lessons read, practice accuracy and your best mock exam.${best != null ? ` Best exam so far: <b class="num">${best}/${exam.questions}</b>.` : ''}</p>
            </div>
          </div>
        </div>
      </section>

      <section style="margin-bottom:1.8rem">
        <div class="pagehead"><div><div class="eyebrow">Course</div><h2>Ten topics, in exam order</h2></div></div>
        <div class="grid" id="topicgrid"></div>
      </section>

      <section>
        <div class="pagehead"><div><div class="eyebrow">Study plan</div><h2>Two days to the exam</h2><p>Tick things off as you go. The plan is saved in this browser.</p></div></div>
        <div class="plan" id="plan"></div>
      </section>`;
    el.querySelector('#topicgrid').innerHTML = topics.map(topicCard).join('') || '<p class="muted">No topics loaded yet.</p>';
    const planEl = el.querySelector('#plan');
    const done = progress.plan();
    planEl.innerHTML = PLAN.map(d => `<div class="card"><h3>${esc(d.day)}</h3><ul>${d.items.map(i => `<li class="${done[i.id] ? 'done' : ''}"><input type="checkbox" id="plan-${i.id}" data-plan="${i.id}" ${done[i.id] ? 'checked' : ''}><span><label for="plan-${i.id}">${esc(i.text)}</label></span></li>`).join('')}</ul></div>`).join('');
    planEl.addEventListener('change', e => { const id = e.target.dataset.plan; if (id) { progress.togglePlan(id); e.target.closest('li').classList.toggle('done'); } });
  });

  function topicCard(t) {
    const read = progress.topicReadPct(t), m = progress.topicMastery(t);
    const pill = m.pct == null ? '<span class="pill">not practised</span>' : m.pct >= 80 ? `<span class="pill ok">${m.pct}% correct</span>` : m.pct >= 60 ? `<span class="pill warn">${m.pct}% correct</span>` : `<span class="pill bad">${m.pct}% correct</span>`;
    return `<article class="card topiccard">
      <div class="meta"><span class="eyebrow">Topic ${t.order}</span>${pill}</div>
      <h3><a href="#lesson.${t.id}" style="color:inherit;text-decoration:none">${esc(t.title)}</a></h3>
      <p class="small muted" style="margin:0">${esc(t.examWeight || '')}</p>
      <div class="progress" title="${read}% of sections read"><span style="width:${read}%"></span></div>
      <div class="actions">
        <a class="btn sm" href="#lesson.${t.id}">${read === 100 ? 'Re-read' : read ? 'Continue' : 'Read'}</a>
        <a class="btn sm ghost" href="#flash.${t.id}">Flashcards</a>
        <a class="btn sm ghost" href="#practice.${t.id}">Quiz</a>
      </div></article>`;
  }

  // ---------- Views: Learn (topic list) ----------
  registerView('learn', (el) => {
    el.innerHTML = `<div class="pagehead"><div><div class="eyebrow">Learn</div><h1>The course</h1><p>Read the topics in order. Each lesson ends with a short check, and every section has a "remember" box with the facts the exam asks for.</p></div></div>
      <div class="grid">${topics.map(topicCard).join('')}</div>`;
  });

  // ---------- Views: Lesson ----------
  registerView('lesson', (el, r) => {
    const t = topic(r.a);
    if (!t) { el.innerHTML = '<p>Unknown topic.</p><a class="btn" href="#learn">All topics</a>'; return; }
    const idx = topics.indexOf(t);
    const prev = topics[idx - 1], next = topics[idx + 1];
    el.innerHTML = `
      <div class="crumbs"><a href="#learn">Learn</a> › Topic ${t.order}</div>
      <div class="pagehead"><div><h1>${esc(t.title)}</h1><p>${esc(t.summary || '')}</p></div>
        <div class="btnrow"><span class="pill">${esc(t.examWeight || '')}</span><a class="btn sm" href="#flash.${t.id}">Flashcards</a><a class="btn sm sea" href="#practice.${t.id}">Quiz this topic</a></div></div>
      <div class="lesson">
        <aside class="lesson-toc"><div class="eyebrow" style="margin-bottom:.4rem">Sections</div><ol>${t.sections.map(s => `<li data-sec="${s.id}" class="${progress.isRead(t.id, s.id) ? 'read' : ''}"><a href="#lesson.${t.id}.${s.id}">${esc(s.title)}</a></li>`).join('')}</ol></aside>
        <div class="lesson-body">
          ${t.sections.map((s, i) => sectionHtml(t, s, i)).join('')}
          <nav class="lesson-nav">
            ${prev ? `<a class="btn" href="#lesson.${prev.id}">← ${esc(prev.title)}</a>` : '<span></span>'}
            ${next ? `<a class="btn primary" href="#lesson.${next.id}">Next: ${esc(next.title)} →</a>` : `<a class="btn primary" href="#exam">Take a mock exam →</a>`}
          </nav>
        </div>
      </div>`;
    // section checks + mark read
    el.querySelectorAll('.section').forEach(sec => {
      const sid = sec.dataset.sec;
      const check = t.sections.find(s => s.id === sid).check;
      const checkEl = sec.querySelector('.check');
      if (check && checkEl) BOAT.quiz.mountInlineCheck(checkEl, check, () => markRead(sid));
      const btn = sec.querySelector('[data-markread]');
      if (btn) btn.addEventListener('click', () => markRead(sid));
    });
    function markRead(sid) {
      progress.markRead(t.id, sid);
      const li = el.querySelector(`.lesson-toc li[data-sec="${sid}"]`); if (li) li.classList.add('read');
      const b = el.querySelector(`.section[data-sec="${sid}"] [data-markread]`); if (b) { b.textContent = 'Done ✓'; b.disabled = true; }
    }
    // highlight current section in toc while scrolling
    const tocItems = [...el.querySelectorAll('.lesson-toc li')];
    const obs = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { tocItems.forEach(li => li.classList.toggle('current', li.dataset.sec === en.target.dataset.sec)); } });
    }, { rootMargin: '-30% 0px -60% 0px' }) : null;
    if (obs) el.querySelectorAll('.section').forEach(s => obs.observe(s));
    if (r.b) { const target = el.querySelector(`.section[data-sec="${r.b}"]`); if (target) setTimeout(() => target.scrollIntoView({ block: 'start' }), 0); }
    return () => { if (obs) obs.disconnect(); };
  });

  function sectionHtml(t, s, i) {
    const art = renderArt(s.illustration);
    const read = progress.isRead(t.id, s.id);
    return `<section class="section" id="sec-${esc(s.id)}" data-sec="${esc(s.id)}">
      <h2><span class="n">${i + 1}</span>${esc(s.title)}</h2>
      ${s.html || ''}
      ${art ? `<figure class="figure"><div class="art">${art}</div>${s.caption ? `<figcaption>${s.caption}</figcaption>` : ''}</figure>` : ''}
      ${s.keyFacts && s.keyFacts.length ? `<div class="keyfacts"><div class="eyebrow">Remember</div><ul>${s.keyFacts.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}
      ${s.check ? `<div class="check"></div>` : ''}
      <div class="sectionfoot"><button class="btn sm ${read ? '' : 'ghost'}" data-markread ${read ? 'disabled' : ''}>${read ? 'Done ✓' : 'Mark section as done'}</button></div>
    </section>`;
  }

  // ---------- Views: Trainers list ----------
  registerView('trainers', (el) => {
    el.innerHTML = `<div class="pagehead"><div><div class="eyebrow">Trainers</div><h1>Interactive drills</h1><p>Fast repetition of the things the exam tests with pictures: lights at night, sea marks, who gives way, sound signals and chart arithmetic.</p></div></div>
      <div class="grid">${trainers.map(tr => `<article class="card topiccard"><h3>${esc(tr.title)}</h3><p class="small" style="margin:0">${esc(tr.description || '')}</p><div class="actions"><a class="btn sm primary" href="#trainer.${tr.id}">Open</a></div></article>`).join('') || '<p class="muted">No trainers loaded.</p>'}</div>`;
  });
  registerView('trainer', (el, r) => {
    const tr = trainers.find(x => x.id === r.a);
    if (!tr) { el.innerHTML = '<p>Unknown trainer.</p><a class="btn" href="#trainers">All trainers</a>'; return; }
    el.innerHTML = `<div class="crumbs"><a href="#trainers">Trainers</a> › ${esc(tr.title)}</div>
      <div class="pagehead"><div><h1>${esc(tr.title)}</h1><p>${esc(tr.description || '')}</p></div></div><div class="trainer" id="trainerRoot"></div>`;
    return tr.mount(el.querySelector('#trainerRoot'));
  });

  // ---------- Views: Review ----------
  registerView('review', (el) => {
    const s = progress.qstats();
    const all = allQuestions();
    const weak = all.filter(q => s[q.id] && (s[q.id].wrong > 0) && !s[q.id].lastCorrect);
    const exams = progress.exams();
    const rows = topics.map(t => { const m = progress.topicMastery(t); return { t, m, read: progress.topicReadPct(t) }; }).sort((a, b) => (a.m.pct == null ? 101 : a.m.pct) - (b.m.pct == null ? 101 : b.m.pct));
    el.innerHTML = `<div class="pagehead"><div><div class="eyebrow">Review</div><h1>Your weak spots</h1><p>Questions you last answered wrongly, topic by topic accuracy, and your mock exam history.</p></div>
      <div class="btnrow">${weak.length ? `<a class="btn primary" href="#practice.weak">Redo ${weak.length} missed question${weak.length === 1 ? '' : 's'}</a>` : ''}<button class="btn ghost sm" id="resetBtn">Reset all progress</button></div></div>
      <div class="grid two">
        <div class="card"><h3>Accuracy by topic</h3><div class="weak" style="margin-top:.6rem">${rows.map(r => `<div class="row"><a href="#practice.${r.t.id}">${esc(r.t.title)}</a><div class="progress ${r.m.pct != null && r.m.pct < 70 ? 'accent' : ''}"><span style="width:${r.m.pct == null ? 0 : r.m.pct}%"></span></div><span class="num small">${r.m.pct == null ? '—' : r.m.pct + '%'}</span></div>`).join('')}</div></div>
        <div class="card"><h3>Mock exams</h3>${exams.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Score</th><th>Result</th><th>Time used</th></tr></thead><tbody>${exams.map(e => `<tr><td>${new Date(e.date).toLocaleString()}</td><td class="num">${e.score}/${e.total}</td><td>${e.passed ? '<span class="pill ok">Pass</span>' : '<span class="pill bad">Fail</span>'}</td><td class="num">${fmtTime(e.seconds)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No mock exams yet. <a href="#exam">Take one now.</a></p>'}</div>
      </div>
      <section style="margin-top:1.5rem"><h2>Missed questions</h2>
        ${weak.length ? `<div class="reviewlist">${weak.map(q => `<div class="item"><div><div class="small muted">${esc(topic(q.topic).title)}</div><div>${esc(q.q)}</div><div class="small" style="color:var(--ok)">Answer: ${esc(q.options[q.answer])}</div></div><span class="pill bad">${s[q.id].wrong}× wrong</span></div>`).join('')}</div>` : '<p class="muted">Nothing here yet. Missed questions from quizzes and mock exams collect on this page.</p>'}
      </section>`;
    el.querySelector('#resetBtn').addEventListener('click', (e) => {
      if (e.target.dataset.armed) { progress.reset(); toast('Progress reset'); render(); }
      else { e.target.dataset.armed = '1'; e.target.textContent = 'Click again to confirm reset'; e.target.classList.add('primary'); }
    });
  });

  // ---------- Start ----------
  function start() {
    initTheme();
    window.addEventListener('hashchange', render);
    render();
    const n = allQuestions().length;
    console.info(`Skipper Prep: ${topics.length} topics, ${n} questions, ${trainers.length} trainers`);
  }

  return { register, registerTrainer, registerView, setExam, exam, topics, trainers, topic, allQuestions, questionById, store, progress, esc, shuffle, renderArt, fmtTime, toast, ring, go, render, route, start, svg: window.BOAT_SVG || null };
})();
