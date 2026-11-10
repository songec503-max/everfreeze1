/* 화면(View): 1280x720 고정 무대를 창 크기에 맞춰 축소/확대하고, 현재 장면을 그린다. */
(function () {
  const EF = window.EF;
  const h = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  EF.h = h;
  const UI = (EF.UI = { busy: false, hints: false, shown: null, dismiss: null });
  let stage, sceneEl, wm, hsEl, crumb, pips, backBtn, nbBtn, nbBadge, introEl;

  UI.init = function () {
    stage = UI.stage = document.getElementById('stage');
    stage.innerHTML = '';
    sceneEl = h('div', 'scene'); wm = h('div', 'wm'); sceneEl.append(wm);
    const fx = h('div', 'fx');
    hsEl = h('div', 'hotspots');
    const hud = h('div', 'hud');
    crumb = h('div', 'crumb');
    const right = h('div', 'hud-right');
    pips = h('div', 'pips');
    const hintBtn = h('button', 'btn', '힌트 표시');
    hintBtn.onclick = () => { UI.hints = !UI.hints; stage.classList.toggle('hints', UI.hints); hintBtn.classList.toggle('on', UI.hints); };
    nbBtn = h('button', 'btn nb', '📓 추리 수첩');
    nbBadge = h('span', 'badge', '0'); nbBtn.append(nbBadge);
    nbBtn.onclick = () => UI.openNotebook();
    const devBtn = h('button', 'btn dev', 'DEV');
    devBtn.onclick = () => EF.Debug.toggle();
    right.append(pips, hintBtn, nbBtn, devBtn);
    hud.append(crumb, right);
    backBtn = h('button', 'btn back', '← 뒤로');
    backBtn.onclick = () => {
      if (UI.busy) return;
      const sc = EF.SCENES[EF.state.scene];
      if (sc.parent) { EF.state.scene = sc.parent; UI.render(); }
    };
    introEl = h('div', 'intro');
    UI.toastEl = h('div', 'toasts');
    UI.bannerEl = h('div', 'banner');
    stage.append(sceneEl, fx, hsEl, hud, backBtn, introEl, UI.toastEl, UI.bannerEl);
    EF.Debug.init(stage);
    UI.fit();
    addEventListener('resize', UI.fit);
    addEventListener('keydown', e => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        if (UI.dismiss) { e.preventDefault(); UI.dismiss(); }
      } else if ((e.key === 'n' || e.key === 'N') && !UI.busy) UI.openNotebook();
    });
    UI.render();
  };

  UI.fit = function () {
    const s = Math.min(innerWidth / 1280, innerHeight / 720);
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
  };

  UI.render = function () {
    const st = EF.state, sc = EF.SCENES[st.scene], stg = EF.getStage();
    stage.dataset.stage = stg;
    stage.dataset.kind = sc.kind;
    const img = EF.BG_IMAGES.includes(sc.id) ? `url(assets/bg/${sc.id}.png) center/cover no-repeat, ` : '';
    sceneEl.style.background = img + sc.bg;
    wm.textContent = sc.name;
    // 이동 경로(월드맵 › 마을 › 장소)
    const chain = []; for (let c = sc; c; c = EF.SCENES[c.parent]) chain.unshift(c.name);
    crumb.textContent = chain.join('  ›  ');
    // 오류 단계 표시
    pips.innerHTML = '';
    const lab = h('span', 'pip-label', `오류 ${stg}단계 · ${EF.TEXT.stages[stg].name}`);
    pips.append(lab);
    for (let i = 1; i <= 5; i++) pips.append(h('i', 'pip' + (i <= stg ? ' on' : '')));
    nbBadge.textContent = Object.keys(st.evidence).length;
    backBtn.style.display = sc.parent ? '' : 'none';
    // 핫스팟
    hsEl.innerHTML = '';
    sc.hotspots.forEach(hp => {
      if (!EF.check(hp.showIf)) return;
      const b = h('button', `hs hs-${hp.kind}` + (hp.temp ? ' temp' : ''));
      b.style.cssText = `left:${hp.x}px;top:${hp.y}px;width:${hp.w}px;height:${hp.h}px`;
      b.dataset.id = hp.id;
      b.append(h('span', 'ico', hp.icon), h('span', 'lbl', hp.label));
      b.onclick = () => { if (UI.busy) return; UI.run(EF.click(hp)); };
      hsEl.append(b);
    });
    // 장소 소개말(장소 진입 시 자동)
    if (UI.shown !== sc.id) {
      UI.shown = sc.id;
      if (sc.intro) {
        introEl.textContent = sc.intro;
        introEl.classList.remove('show'); void introEl.offsetWidth; introEl.classList.add('show');
      } else introEl.classList.remove('show');
    }
  };

  UI.toast = function (text, kind) {
    const t = h('div', 'toast' + (kind ? ' ' + kind : ''), text);
    UI.toastEl.append(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3200);
  };

  UI.banner = function (stg) {
    const s = EF.TEXT.stages[stg];
    UI.bannerEl.innerHTML = '';
    UI.bannerEl.append(h('b', '', `세계의 무언가가 어긋났다 — ${stg}단계 · ${s.name}`), h('span', '', s.desc));
    UI.bannerEl.classList.remove('show'); void UI.bannerEl.offsetWidth; UI.bannerEl.classList.add('show');
  };
})();
