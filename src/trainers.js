/* Skipper Prep — interactive trainers.
   Each trainer: BOAT.registerTrainer({ id, title, description, mount(root) -> cleanup? })
   Trainers draw with BOAT.svg helpers so pictures stay consistent with the lessons.
   Shared drill harness below: shows a prompt + picture, offers choices, keeps a streak. */
(function () {
  'use strict';
  const B = window.BOAT;
  const esc = B.esc;

  /* drill(root, { night, makeRound: () => ({ art, prompt, choices:[...], answer:index, explain }), choiceCount }) */
  function drill(root, cfg) {
    let streak = 0, right = 0, total = 0, round = null, locked = false;
    root.innerHTML = `<div class="stat"><span>Streak <b class="num" id="streak">0</b></span><span>Score <b class="num" id="score">0/0</b></span><span class="muted" id="hint"></span></div>
      <div class="stage ${cfg.night ? 'night' : ''}" id="stage"></div><p class="qtext" id="prompt"></p><div class="choices" id="choices"></div><div class="result" id="result"></div>
      <div class="btnrow" style="margin-top:1rem"><button class="btn primary" id="nextBtn" disabled>Next</button></div>`;
    const $ = s => root.querySelector(s);
    function next() {
      round = cfg.makeRound(); locked = false;
      $('#stage').innerHTML = B.renderArt(round.art); $('#prompt').textContent = round.prompt; $('#hint').textContent = round.hint || '';
      $('#choices').innerHTML = round.choices.map((c, i) => `<button type="button" class="opt" data-i="${i}"><span class="key">${i + 1}</span><span>${esc(c)}</span></button>`).join('');
      $('#result').textContent = ''; $('#result').className = 'result'; $('#nextBtn').disabled = true;
    }
    function answer(i) {
      if (locked) return; locked = true; total++;
      const ok = i === round.answer; if (ok) { right++; streak++; } else streak = 0;
      $('#choices').querySelectorAll('.opt').forEach(b => { b.disabled = true; const k = +b.dataset.i; if (k === round.answer) b.classList.add('correct'); else if (k === i) b.classList.add('wrong'); });
      $('#result').innerHTML = (ok ? '<strong>Correct.</strong> ' : '<strong>No.</strong> ') + esc(round.explain || '');
      $('#result').className = 'result ' + (ok ? 'good' : 'badr');
      $('#streak').textContent = streak; $('#score').textContent = `${right}/${total}`; $('#nextBtn').disabled = false; $('#nextBtn').focus();
    }
    $('#choices').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) answer(+b.dataset.i); });
    $('#nextBtn').addEventListener('click', next);
    const onKey = e => { if (/^[1-9]$/.test(e.key) && round && +e.key <= round.choices.length) answer(+e.key - 1); else if (e.key === 'Enter' && locked) next(); };
    document.addEventListener('keydown', onKey);
    next();
    return () => document.removeEventListener('keydown', onKey);
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function distractors(all, correct, n, key) {
    const k = key || (x => x);
    const others = B.shuffle(all.filter(x => k(x) !== k(correct))).slice(0, n);
    const choices = B.shuffle(others.concat([correct]));
    return { choices, answer: choices.findIndex(x => k(x) === k(correct)) };
  }

  B.trainerKit = { drill, pick, distractors };
})();
