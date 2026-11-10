/* 본문 기록(조사·대화·알림) · 퍼즐 · 엔딩 · 큐 처리. 팝업 없이 모두 페이지 안에 글로 쌓인다. */
(function () {
  const EF = window.EF, UI = EF.UI, h = EF.h;

  function entry(cls) {
    const e = h('div', 'entry ' + cls);
    UI.logEl.append(e);
    setTimeout(() => e.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30);
    return e;
  }

  UI.showText = function (it) {
    const e = entry('text');
    if (it.who) e.append(h('div', 'who', it.who));
    e.append(h('div', 'body', it.text));
    if (it.note) e.append(h('div', 'note', '✔ ' + it.note));
  };

  UI.showSay = function (it) {
    const n = EF.NPCS[it.npc], e = entry('say');
    const por = h('div', 'portrait', n.name[0]); por.style.background = n.color;
    const col = h('div', 'dcol'), head = h('div', 'dhead');
    head.append(h('b', '', n.name), h('span', 'role', n.role));
    if (it.ctx) head.append(h('span', 'ctx', it.ctx));
    col.append(head, h('div', 'body', EF.npcLine(it.npc)));
    e.append(por, col);
  };

  UI.toast = function (text, kind) { entry('line' + (kind ? ' ' + kind : '')).textContent = text; };
  UI.banner = function () { entry('stagenote').textContent = '… ' + EF.TEXT.site.stageNotice; };

  UI.showEnding = function () {
    UI.panelEl.innerHTML = '';
    const card = h('div', 'ending');
    card.append(h('h2', '', EF.TEXT.ending.title));
    EF.TEXT.ending.body.split('\n').forEach(l => card.append(h('p', '', l || ' ')));
    const b = h('button', 'btn primary', EF.TEXT.ending.btn);
    b.onclick = () => { UI.panelEl.innerHTML = ''; };
    card.append(b); UI.panelEl.append(card);
    setTimeout(() => card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30);
  };

  // ---------- 퍼즐 (페이지 안 패널) ----------
  UI.showPuzzle = function (pid, done) {
    const p = EF.PUZZLES[pid];
    UI.busy = true;
    UI.panelEl.innerHTML = '';
    const card = h('div', 'puzzle');
    card.append(h('h3', '', p.title), h('p', 'prompt', p.prompt));
    const msg = h('div', 'pmsg', ''), area = h('div', 'parea'), actions = h('div', 'pactions');
    const okBtn = h('button', 'btn primary', '확인'); okBtn.disabled = true;
    const cancel = h('button', 'btn', '닫기');
    actions.append(cancel, okBtn);
    card.append(area, msg, actions); UI.panelEl.append(card);
    setTimeout(() => card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30);

    let ok = () => false;
    const fail = () => { msg.textContent = p.fail; card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); };

    if (p.type === 'pick') {
      let sel = -1;
      p.options.forEach((o, i) => {
        const b = h('button', 'opt', o);
        b.onclick = () => { sel = i; [...area.children].forEach((c, j) => c.classList.toggle('on', j === i)); okBtn.disabled = false; msg.textContent = ''; };
        area.append(b);
      });
      ok = () => sel === p.answer;
    } else if (p.type === 'order') {
      let seq = [];
      const seqEl = h('div', 'seq'), pool = h('div', 'pool');
      const draw = () => {
        seqEl.innerHTML = ''; pool.innerHTML = '';
        p.items.forEach((_, i) => {
          const slot = h('div', 'slot', seq[i] !== undefined ? p.items[seq[i]] : String(i + 1));
          if (seq[i] !== undefined) slot.classList.add('filled');
          seqEl.append(slot);
        });
        p.shuffle.forEach(idx => {
          const b = h('button', 'opt', p.items[idx]); b.disabled = seq.includes(idx);
          b.onclick = () => { seq.push(idx); msg.textContent = ''; draw(); };
          pool.append(b);
        });
        const reset = h('button', 'btn small', '처음부터'); reset.onclick = () => { seq = []; msg.textContent = ''; draw(); };
        pool.append(reset);
        okBtn.disabled = seq.length !== p.items.length;
      };
      area.append(seqEl, pool); draw();
      ok = () => seq.every((v, i) => v === i);
    } else if (p.type === 'code') {
      const inp = h('input', 'code'); inp.maxLength = p.digits || 4; inp.inputMode = 'numeric'; inp.placeholder = '숫자 입력';
      inp.oninput = () => { inp.value = inp.value.replace(/\D/g, ''); okBtn.disabled = !inp.value; msg.textContent = ''; };
      inp.onkeydown = e => { if (e.key === 'Enter' && !okBtn.disabled) okBtn.click(); };
      area.append(inp); setTimeout(() => inp.focus({ preventScroll: true }), 30);
      ok = () => inp.value === p.answer;
    }

    const close = solved => {
      UI.panelEl.innerHTML = ''; UI.dismiss = null; UI.busy = false;
      done(solved ? EF.solvePuzzle(pid) : []);
    };
    okBtn.onclick = () => { if (ok()) close(true); else fail(); };
    cancel.onclick = () => close(false);
    UI.dismiss = () => close(false);
  };

  // ---------- 큐 처리 ----------
  UI.run = function (queue) {
    UI.render();
    const next = () => {
      for (;;) {
        const it = queue.shift();
        if (!it) { UI.render(); return; }
        switch (it.t) {
          case 'toast': UI.toast(it.text, it.kind); break;
          case 'text': UI.showText(it); break;
          case 'say': UI.showSay(it); break;
          case 'stage': UI.render(); UI.banner(); break;
          case 'ending': UI.render(); UI.showEnding(); break;
          case 'puzzle': UI.showPuzzle(it.id, q => { queue.unshift(...q); next(); }); return;
        }
        UI.render();
      }
    };
    next();
  };
})();
