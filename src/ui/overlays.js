/* 오버레이: 조사 텍스트(INSPECT) · 대화(DIALOGUE) · 퍼즐(PUZZLE) · 엔딩, 그리고 큐 처리. */
(function () {
  const EF = window.EF, UI = EF.UI, h = EF.h;

  function scrim() { const s = h('div', 'scrim'); UI.stage.append(s); return s; }
  function closeWith(node, done) {
    node.remove(); UI.dismiss = null; done();
  }

  UI.showText = function (it, done) {
    const sc = scrim(), box = h('div', 'textbox');
    if (it.who) box.append(h('div', 'who', it.who));
    box.append(h('div', 'body', it.text));
    if (it.note) box.append(h('div', 'note', '✔ ' + it.note));
    box.append(h('div', 'next', '▼ 클릭'));
    sc.append(box);
    const close = () => closeWith(sc, done);
    sc.onclick = close; UI.dismiss = close;
  };

  UI.showSay = function (it, done) {
    const n = EF.NPCS[it.npc], sc = scrim(), box = h('div', 'textbox dialogue');
    const por = h('div', 'portrait', n.name[0]); por.style.background = n.color;
    const head = h('div', 'dhead');
    head.append(h('b', '', n.name), h('span', 'role', n.role));
    if (it.ctx) head.append(h('span', 'ctx', it.ctx));
    const body = h('div', 'body', EF.npcLine(it.npc));
    const btn = h('button', 'btn close', '닫기');
    const col = h('div', 'dcol'); col.append(head, body);
    box.append(por, col, btn);
    sc.append(box);
    const close = () => closeWith(sc, done);
    btn.onclick = e => { e.stopPropagation(); close(); };
    sc.onclick = e => { if (e.target === sc) close(); };
    UI.dismiss = close;
  };

  UI.showEnding = function (done) {
    const sc = scrim(); sc.classList.add('dim');
    const card = h('div', 'ending');
    card.append(h('h2', '', EF.TEXT.ending.title));
    EF.TEXT.ending.body.split('\n').forEach(l => card.append(h('p', '', l || ' ')));
    const b = h('button', 'btn primary', EF.TEXT.ending.btn);
    card.append(b); sc.append(card);
    const close = () => closeWith(sc, done);
    b.onclick = close; UI.dismiss = close;
  };

  // ---------- 퍼즐 ----------
  UI.showPuzzle = function (pid, done) {
    const p = EF.PUZZLES[pid], sc = scrim(); sc.classList.add('dim');
    const card = h('div', 'puzzle');
    card.append(h('h3', '', p.title), h('p', 'prompt', p.prompt));
    const msg = h('div', 'pmsg', '');
    const area = h('div', 'parea');
    const actions = h('div', 'pactions');
    const okBtn = h('button', 'btn primary', '확인'); okBtn.disabled = true;
    const cancel = h('button', 'btn', '닫기');
    actions.append(cancel, okBtn);
    card.append(area, msg, actions); sc.append(card);

    let getAnswerOk = () => false;

    function fail() {
      msg.textContent = p.fail; card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    }
    if (p.type === 'pick') {
      let sel = -1;
      p.options.forEach((o, i) => {
        const b = h('button', 'opt', o);
        b.onclick = () => { sel = i; [...area.children].forEach((c, j) => c.classList.toggle('on', j === i)); okBtn.disabled = false; msg.textContent = ''; };
        area.append(b);
      });
      getAnswerOk = () => sel === p.answer;
    } else if (p.type === 'order') {
      let seq = [];
      const seqEl = h('div', 'seq'), pool = h('div', 'pool');
      const draw = () => {
        seqEl.innerHTML = ''; pool.innerHTML = '';
        p.items.forEach((_, i) => { // slots
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
      getAnswerOk = () => seq.every((v, i) => v === i);
    } else if (p.type === 'code') {
      const inp = h('input', 'code'); inp.maxLength = p.digits || 4; inp.inputMode = 'numeric'; inp.placeholder = '숫자 입력';
      inp.oninput = () => { inp.value = inp.value.replace(/\D/g, ''); okBtn.disabled = !inp.value; msg.textContent = ''; };
      inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter' && !okBtn.disabled) okBtn.click(); };
      area.append(inp); setTimeout(() => inp.focus(), 30);
      getAnswerOk = () => inp.value === p.answer;
    }

    const close = (solved) => { sc.remove(); UI.dismiss = null; done(solved ? EF.solvePuzzle(pid) : []); };
    okBtn.onclick = () => { if (getAnswerOk()) close(true); else fail(); };
    cancel.onclick = () => close(false);
    UI.dismiss = () => close(false);
  };

  // ---------- 큐 처리 ----------
  UI.run = function (queue) {
    UI.busy = true;
    UI.render();
    const next = () => {
      const it = queue.shift();
      if (!it) { UI.busy = false; UI.render(); return; }
      switch (it.t) {
        case 'toast': UI.toast(it.text, it.kind); UI.render(); next(); break;
        case 'text': UI.showText(it, next); break;
        case 'say': UI.showSay(it, next); break;
        case 'puzzle': UI.showPuzzle(it.id, q => { queue.unshift(...q); next(); }); break;
        case 'stage': UI.render(); UI.banner(it.stage); next(); break;
        case 'ending': UI.render(); UI.showEnding(next); break;
        default: next();
      }
    };
    next();
  };
})();
