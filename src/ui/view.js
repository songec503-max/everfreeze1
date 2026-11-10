/* 화면(View): 옛날 홈페이지식 "페이지 이동형".
   - 장소 하나 = 페이지 하나 (주소 #장소ID, 브라우저 뒤로가기 동작)
   - 페이지 구성: 제목·소개 → 그림(클릭 가능) + 오른쪽 링크 목록 → 기록(대사·조사 결과가 본문에 쌓임)
   - 추리 메모는 별도 페이지(#MEMO). 팝업/오버레이는 쓰지 않는다. */
(function () {
  const EF = window.EF;
  const $ = id => document.getElementById(id);
  const h = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  EF.h = h;
  const UI = (EF.UI = { busy: false, hints: false, dismiss: null, visited: {}, shown: null, memoFrom: 'WORLD_MAP' });
  let stage, wrap, sceneEl, wm, hsEl, navEl, crumbsEl, ptitle, pintro, tagline, counter, sideEl, nbCount, firstRender = true;

  UI.init = function () {
    EF.SCENES.MEMO = EF.SCENES.MEMO || { id: 'MEMO', name: EF.TEXT.site.memoName, kind: 'memo', hotspots: [], bg: '#eee', intro: EF.TEXT.site.memoIntro };
    stage = UI.stage = $('stage'); wrap = $('stagewrap');
    navEl = $('nav'); crumbsEl = $('crumbs'); ptitle = $('ptitle'); pintro = $('pintro');
    tagline = $('tagline'); counter = $('counter'); sideEl = $('side');
    UI.panelEl = $('panel'); UI.logEl = $('log'); UI.memoEl = $('memo');
    stage.innerHTML = '';
    sceneEl = h('div', 'scene'); wm = h('div', 'wm'); sceneEl.append(wm);
    hsEl = h('div', 'hotspots');
    stage.append(sceneEl, h('div', 'fx'), hsEl);
    EF.Debug.init(stage);

    EF.TEXT.site.nav.forEach(([label, id]) => {
      const a = h('a', 'navitem', label); a.href = '#' + id; a.dataset.scene = id;
      a.onclick = e => { e.preventDefault(); UI.goto(id); };
      navEl.append(a);
    });
    const memo = h('a', 'navitem nav-memo', '📓 메모'); memo.href = '#MEMO'; nbCount = h('b', '', '0');
    memo.append(' (', nbCount, ')');
    memo.onclick = e => { e.preventDefault(); UI.openMemo(); };
    navEl.append(memo);

    $('hintLink').onclick = e => {
      e.preventDefault(); UI.hints = !UI.hints; stage.classList.toggle('hints', UI.hints);
      e.target.textContent = UI.hints ? '클릭할 수 있는 곳 표시 끄기' : '클릭할 수 있는 곳 표시하기';
    };
    if (/[?&]dev\b/.test(location.search)) {
      const d = h('a', 'devlink', 'DEV'); d.href = '#'; d.onclick = e => { e.preventDefault(); EF.Debug.toggle(); };
      $('devSlot').append(d);
    }

    addEventListener('resize', UI.fit);
    addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') { EF.Debug.toggle(); return; }
      if (e.key === 'Escape' && UI.dismiss) { e.preventDefault(); UI.dismiss(); }
    });
    addEventListener('popstate', () => {
      const id = location.hash.slice(1);
      if (!EF.SCENES[id] || !UI.visited[id]) { history.replaceState(null, '', '#' + EF.state.scene); return; }
      if (UI.dismiss) UI.dismiss();
      if (id !== EF.state.scene) { if (EF.state.scene !== 'MEMO' && id === 'MEMO') UI.memoFrom = EF.state.scene; EF.state.scene = id; UI.render(true); }
    });
    UI.render();
    UI.fit();
  };

  UI.fit = function () {
    if (!wrap.clientWidth) return;           // 메모 페이지처럼 그림이 숨겨진 동안은 계산하지 않는다
    const s = wrap.clientWidth / 1280;
    wrap.style.height = Math.round(720 * s) + 'px';
    stage.style.transform = `scale(${s})`;
  };

  UI.goto = function (id) {
    if (!EF.SCENES[id] || id === EF.state.scene) return;
    if (UI.dismiss) UI.dismiss();            // 열려 있는 퍼즐은 닫고 이동
    if (EF.state.scene !== 'MEMO' && id === 'MEMO') UI.memoFrom = EF.state.scene;
    EF.state.scene = id; UI.render();
    scrollTo({ top: 0 });
  };
  UI.openMemo = function () { UI.goto(EF.state.scene === 'MEMO' ? UI.memoFrom : 'MEMO'); };

  UI.activate = function (hp) { if (UI.busy) return; UI.run(EF.click(hp)); };

  UI.render = function (fromHistory) {
    const st = EF.state, sc = EF.SCENES[st.scene], stg = EF.getStage(), memo = sc.kind === 'memo';
    UI.visited[sc.id] = true;
    if (!fromHistory && location.hash !== '#' + sc.id) {
      if (firstRender) history.replaceState(null, '', '#' + sc.id); else history.pushState(null, '', '#' + sc.id);
    }
    firstRender = false;
    document.title = `${sc.name} · EVERFREEZE`;
    stage.dataset.stage = stg; document.body.dataset.stage = stg;

    // 페이지가 바뀌면 기록·패널 비우기
    const changed = UI.shown !== sc.id;
    UI.shown = sc.id;
    if (changed) { UI.logEl.innerHTML = ''; UI.panelEl.innerHTML = ''; }

    // 사이트 틀
    tagline.textContent = EF.TEXT.site.tagline[stg];
    counter.textContent = EF.TEXT.site.counter[stg];
    nbCount.textContent = Object.keys(st.evidence).length;
    [...navEl.querySelectorAll('.navitem')].forEach(a => {
      const on = memo ? a.classList.contains('nav-memo')
        : (a.dataset.scene === sc.id || (sc.village && a.textContent === sc.village));
      a.classList.toggle('on', !!on);
    });
    const parentId = memo ? UI.memoFrom : sc.parent;
    crumbsEl.innerHTML = '';
    if (parentId) {
      const b = h('a', 'back', memo ? '◀ 돌아가기' : '◀ 뒤로'); b.href = '#'; b.onclick = e => { e.preventDefault(); UI.goto(parentId); };
      crumbsEl.append(b, h('span', 'sep', '|'));
    }
    const chain = []; if (!memo) for (let c = sc; c; c = EF.SCENES[c.parent]) chain.unshift(c); else chain.push(sc);
    chain.forEach((c, i) => {
      if (i) crumbsEl.append(h('span', 'sep', '›'));
      if (i < chain.length - 1) {
        const a = h('a', 'crumb', c.name); a.href = '#'; a.onclick = e => { e.preventDefault(); UI.goto(c.id); };
        crumbsEl.append(a);
      } else crumbsEl.append(h('span', 'crumb now', c.name));
    });
    ptitle.textContent = sc.name;
    pintro.textContent = sc.intro || (sc.kind === 'world' ? EF.TEXT.site.worldIntro : EF.TEXT.site.mapIntro);

    $('cols').style.display = memo ? 'none' : '';
    $('tip').style.display = memo ? 'none' : '';
    UI.memoEl.style.display = memo ? '' : 'none';
    if (memo) { if (changed) UI.mountNotebook(UI.memoEl); return; }

    // 그림 + 핫스팟
    const img = EF.BG_IMAGES.includes(sc.id) ? `url(assets/bg/${sc.id}.png) center/cover no-repeat, ` : '';
    sceneEl.style.background = img + sc.bg;
    wm.textContent = sc.name;
    UI.fit();                                 // 숨겨졌다 돌아온 경우에도 크기를 다시 맞춘다
    hsEl.innerHTML = ''; sideEl.innerHTML = '';
    sideEl.append(h('h3', '', EF.TEXT.site.sideTitle));
    const groups = { move: [], npc: [], inspect: [], puzzle: [] };
    sc.hotspots.forEach(hp => {
      if (!EF.check(hp.showIf)) return;
      const b = h('button', `hs hs-${hp.kind}` + (hp.temp ? ' temp' : ''));
      b.style.cssText = `left:${hp.x}px;top:${hp.y}px;width:${hp.w}px;height:${hp.h}px`;
      b.dataset.id = hp.id;
      b.append(h('span', 'ico', hp.icon), h('span', 'lbl', hp.label));
      b.onclick = () => UI.activate(hp);
      hsEl.append(b);
      const a = h('a', 'lk lk-' + hp.kind, `${hp.icon} ${hp.label}`); a.href = '#'; a.dataset.id = hp.id;
      a.onclick = e => { e.preventDefault(); UI.activate(hp); };
      groups[hp.kind].push(a);
    });
    Object.keys(groups).forEach(k => {
      if (!groups[k].length) return;
      const g = h('div', 'sgroup'); g.append(h('div', 'sg-title', EF.TEXT.site.sideGroups[k]));
      groups[k].forEach(a => g.append(a)); sideEl.append(g);
    });
  };
})();
