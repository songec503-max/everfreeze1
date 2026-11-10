/* 개발용 패널(DEV 버튼). 장면 이동 · 증거 지급 · 상태 확인 · 초기화. 최종 배포 때는 버튼만 숨기면 된다. */
(function () {
  const EF = window.EF, h = EF.h;
  let panel;
  EF.Debug = {
    init(stage) {
      panel = h('div', 'devpanel'); panel.style.display = 'none'; stage.append(panel);
    },
    toggle() {
      panel.style.display = panel.style.display === 'none' ? '' : 'none';
      if (panel.style.display === '') this.draw();
    },
    draw() {
      panel.innerHTML = '';
      const st = EF.state;
      panel.append(h('b', '', `DEV · 단계 ${EF.getStage()} · 흔적 ${EF.traceCount()}/13`));
      const sel = h('select'); Object.values(EF.SCENES).forEach(s => { const o = h('option', '', `${s.id} ${s.name}`); o.value = s.id; if (s.id === st.scene) o.selected = true; sel.append(o); });
      sel.onchange = () => { st.scene = sel.value; EF.UI.render(); };
      panel.append(sel);
      const ev = h('div', 'devev');
      Object.keys(EF.EVIDENCE).forEach(id => {
        const b = h('button', st.evidence[id] ? 'on' : '', id);
        b.title = EF.EVIDENCE[id].name;
        b.onclick = () => { if (st.evidence[id]) delete st.evidence[id]; else st.evidence[id] = ++st.order; EF.UI.render(); this.draw(); };
        ev.append(b);
      });
      panel.append(ev);
      const flags = h('div', 'devflags', 'flags: ' + (Object.keys(st.flags).join(', ') || '-') + ' | 퍼즐: ' + (Object.keys(st.solved).join(', ') || '-') + ' | 추리: ' + (Object.keys(st.deduced).join(', ') || '-'));
      panel.append(flags);
      const row = h('div', 'row');
      const reset = h('button', '', '전체 초기화'); reset.onclick = () => { EF.reset(); EF.UI.shown = null; EF.UI.render(); this.draw(); };
      const close = h('button', '', '닫기'); close.onclick = () => this.toggle();
      row.append(reset, close); panel.append(row);
    }
  };
})();
