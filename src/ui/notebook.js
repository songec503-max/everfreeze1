/* 추리 수첩(NOTEBOOK): 증거 목록 + 필수/선택 추리. 슬롯에 증거를 채워 "연결"하면 가설이 기록된다. */
(function () {
  const EF = window.EF, UI = EF.UI, h = EF.h;

  UI.openNotebook = function () {
    if (UI.busy) return;
    UI.busy = true;
    const sc = h('div', 'scrim dim nbscrim'), panel = h('div', 'notebook');
    sc.append(panel); UI.stage.append(sc);
    let active = null, picks = [], detail = null, message = '';

    const close = () => { sc.remove(); UI.dismiss = null; UI.busy = false; UI.render(); };
    UI.dismiss = close;
    sc.onclick = e => { if (e.target === sc) close(); };

    function draw() {
      panel.innerHTML = '';
      const head = h('div', 'nb-head');
      head.append(h('h2', '', '📓 추리 수첩'));
      const x = h('button', 'btn', '닫기 (Esc)'); x.onclick = close; head.append(x);
      const cols = h('div', 'nb-cols');
      cols.append(drawEvidence(), drawDeductions());
      panel.append(head, cols);
    }

    function drawEvidence() {
      const left = h('div', 'nb-left');
      [['trace', '리셋 흔적'], ['clue', '단서'], ['opt', '선택 단서']].forEach(([type, title]) => {
        const own = Object.keys(EF.state.evidence).filter(id => EF.EVIDENCE[id].type === type)
          .sort((a, b) => EF.state.evidence[a] - EF.state.evidence[b]);
        left.append(h('h4', '', `${title} (${own.length})`));
        const list = h('div', 'evlist');
        if (!own.length) list.append(h('div', 'empty', '아직 없음'));
        own.forEach(id => {
          const e = EF.EVIDENCE[id];
          const b = h('button', 'ev' + (picks.includes(id) ? ' picked' : ''), `${id} · ${e.name}`);
          b.onclick = () => {
            detail = id; message = '';
            if (active && picks.length < active.requires.length && !picks.includes(id)) picks.push(id);
            draw();
          };
          list.append(b);
        });
        left.append(list);
      });
      const d = h('div', 'evdetail');
      if (detail) {
        const e = EF.EVIDENCE[detail];
        d.append(h('b', '', `${detail} · ${e.name}`), h('span', 'place', e.place), h('p', '', e.desc));
      } else d.append(h('p', 'empty', '증거를 누르면 설명이 보입니다. 추리 카드를 선택한 뒤 증거를 누르면 슬롯에 채워집니다.'));
      left.append(d);
      return left;
    }

    function drawDeductions() {
      const right = h('div', 'nb-right');
      [['main', '필수 추리'], ['final', '통합 추리'], ['opt', '선택 추리 (엔딩 조건과 무관)']].forEach(([kind, title]) => {
        right.append(h('h4', '', title));
        EF.DEDUCTIONS.filter(d => d.kind === kind).forEach(d => right.append(card(d)));
      });
      return right;
    }

    function card(d) {
      const solved = !!EF.state.deduced[d.id];
      const c = h('div', 'dcard' + (solved ? ' solved' : '') + (active === d ? ' active' : ''));
      const top = h('div', 'dtop');
      top.append(h('b', '', `${d.id} ${d.title}`), h('span', 'tag', solved ? '완료' : '미완료'));
      c.append(top);
      if (solved) { c.append(h('p', 'hypo', '가설: ' + d.hypo)); if (d.kind === 'final') c.append(h('p', 'sub', '(임시 안내) 아리아가 있는 도서관을 찾아가 보자.')); return c; }

      if (d.kind === 'final') {
        const st = EF.finalStatus();
        c.append(h('p', 'sub', `필수 추리 ${st.mains}/3 완료 · ${st.stageOk ? '4단계 이상 ✔' : '4단계 이상 필요'}`));
        const b = h('button', 'btn primary small', '통합 추리 기록'); b.disabled = !st.ready;
        b.onclick = () => { const r = EF.tryFinal(); r.q.forEach(i => i.t === 'toast' && UI.toast(i.text, i.kind)); draw(); };
        c.append(b); return c;
      }
      if (active !== d) {
        c.append(h('p', 'sub', `연결할 증거 ${d.requires.length}개`));
        const b = h('button', 'btn small', '이 추리에 증거 연결'); b.onclick = () => { active = d; picks = []; message = ''; draw(); };
        c.append(b); return c;
      }
      const slots = h('div', 'slots');
      for (let i = 0; i < d.requires.length; i++) {
        const id = picks[i];
        const s = h('button', 'slot' + (id ? ' filled' : ''), id ? `${id} · ${EF.EVIDENCE[id].name}` : '비어 있음');
        s.onclick = () => { if (id) { picks.splice(i, 1); draw(); } };
        slots.append(s);
      }
      c.append(slots);
      if (message) c.append(h('p', 'msg', message));
      const row = h('div', 'row');
      const link = h('button', 'btn primary small', '연결하기'); link.disabled = picks.length !== d.requires.length;
      link.onclick = () => {
        const r = EF.tryDeduce(d.id, picks);
        r.q.forEach(i => i.t === 'toast' && UI.toast(i.text, i.kind));
        if (r.ok) { active = null; picks = []; message = ''; } else { message = '서로 이어지지 않는다. 다른 증거를 골라 보자.'; picks = []; }
        draw();
      };
      const cancel = h('button', 'btn small', '취소'); cancel.onclick = () => { active = null; picks = []; message = ''; draw(); };
      row.append(link, cancel); c.append(row);
      return c;
    }
    draw();
  };
})();
