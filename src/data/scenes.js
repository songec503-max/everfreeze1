/* 장면 + 핫스팟 + 규칙.
   - 좌표는 1280x720 기준 px. (x,y,w,h)
   - 핫스팟 rules 는 위에서부터 검사해 "처음 통과한 규칙"의 do 를 실행한다.
   - temp:true 는 임시 요소(힌트 표시를 켜면 점선으로 보임).
   - 배경 이미지는 assets/bg/<장면ID>.png 를 넣으면 자동으로 덮어쓴다. */
(function () {
  const EF = window.EF;
  const TX = EF.TEXT;

  // ---------- 배경 헬퍼 ----------
  const room = (wall, floor, at = 66) =>
    `linear-gradient(180deg, ${wall} 0%, ${wall} ${at}%, ${floor} ${at}%, ${floor} 100%)`;
  const sky = (top, bottom, ground, at = 64) =>
    `linear-gradient(180deg, ${top} 0%, ${bottom} ${at}%, ${ground} ${at}%, ${ground} 100%)`;

  // ---------- 핫스팟 헬퍼 ----------
  const hs = (kind, id, label, icon, box, rules, o = {}) =>
    Object.assign({ kind, id, label, icon, x: box[0], y: box[1], w: box[2], h: box[3], rules, temp: false }, o);

  const lockRule = o => {
    if (o.min) return { if: [{ not: { stageMin: o.min } }], do: [{ text: o.early || TX.notYet }] };
    if (o.lock) return { if: [{ not: o.lock.cond }], do: [{ text: o.lock.text }] };
    return null;
  };

  // 조사: 첫 클릭에만 증거 등록, 재클릭은 기존 설명
  function inspect(id, label, icon, box, o) {
    const r = [], lk = lockRule(o);
    if (lk) r.push(lk);
    if (o.grant) {
      r.push({ if: [{ has: o.grant }], do: [{ text: o.repeat || o.text, note: TX.alreadyNoted }] });
      r.push({ if: [{ ended: true }], do: [{ text: TX.endedInspect }] });
      r.push({ do: [{ text: o.text }, { grant: o.grant }] });
    } else r.push({ do: [{ text: o.text }] });
    return hs('inspect', id, label, icon, box, r, { temp: o.temp !== false, showIf: o.showIf });
  }

  // 퍼즐
  function puzzle(id, label, icon, box, pid, o = {}) {
    const r = [], lk = lockRule(o);
    if (lk) r.push(lk);
    r.push({ if: [{ solved: pid }], do: [{ text: o.repeat || '이미 풀어낸 퍼즐이다.' }] });
    r.push({ if: [{ ended: true }], do: [{ text: TX.endedInspect }] });
    r.push({ do: [{ puzzle: pid }] });
    return hs('puzzle', id, label, icon, box, r, { temp: o.temp !== false, showIf: o.showIf });
  }

  const npc = (id, label, icon, box, npcId, o = {}) =>
    hs('npc', id, label, icon, box, o.rules || [{ do: [{ say: npcId }] }], { temp: !!o.temp });

  const move = (id, label, icon, box, to, o = {}) =>
    hs('move', id, label, icon, box, o.rules || [{ do: [{ go: to }] }], { temp: !!o.temp, showIf: o.showIf });

  // ---------- 장면 ----------
  // 배경 이미지를 넣은 장면 ID 를 여기에 적으면 assets/bg/<ID>.png 가 사용된다. 예: ['RM_HOME']
  EF.BG_IMAGES = [];

  const S = (EF.SCENES = {});
  const add = s => (S[s.id] = s);

  // ===== 월드맵 =====
  add({
    id: 'WORLD_MAP', name: '월드맵', kind: 'world', bg: sky('#cfe3f5', '#eaf0e6', '#d8e6c8', 55),
    hotspots: [
      move('go-rm', '로즈메리', '🌿', [130, 250, 270, 210], 'MAP_ROSEMARY'),
      move('go-gw', '글렌위버', '🍂', [505, 200, 270, 210], 'MAP_GLENWEAVER'),
      move('go-lm', '루미나리아', '🐚', [880, 280, 270, 210], 'MAP_LUMINARIA')
    ]
  });

  // ===== 마을 지도 =====
  add({
    id: 'MAP_ROSEMARY', name: '로즈메리', kind: 'map', parent: 'WORLD_MAP', village: '로즈메리',
    bg: sky('#e6def2', '#eef0e4', '#cfe3c2'),
    hotspots: [
      move('m-home', '클로버의 집', '🏠', [110, 270, 220, 170], 'RM_HOME', { temp: true }),
      move('m-plaza', '광장 · 시계탑', '⏰', [370, 150, 240, 210], 'RM_PLAZA', { temp: true }),
      move('m-lib', '도서관', '📚', [670, 240, 240, 190], 'RM_LIBRARY_EXT'),
      move('m-shop', '베라의 잡화점', '🛒', [950, 270, 220, 170], 'RM_VERA_SHOP')
    ]
  });
  add({
    id: 'MAP_GLENWEAVER', name: '글렌위버', kind: 'map', parent: 'WORLD_MAP', village: '글렌위버',
    bg: sky('#f6e6c8', '#f1ecd2', '#b9c99a'),
    hotspots: [
      move('m-tower', '주야 교대 새집 탑', '🐦', [110, 160, 250, 230], 'GW_TOWER'),
      move('m-oaks', '나이테 회전형 만물상', '🌳', [400, 260, 260, 190], 'GW_OAKS'),
      move('m-sienna', '시에나의 계절 망토 공방', '🧵', [700, 200, 260, 190], 'GW_SIENNA'),
      move('m-house', '마을 주택', '🏡', [990, 290, 190, 160], 'GW_HOUSE', { temp: true })
    ]
  });
  add({
    id: 'MAP_LUMINARIA', name: '루미나리아', kind: 'map', parent: 'WORLD_MAP', village: '루미나리아',
    bg: sky('#cfeaf0', '#e4f2ef', '#efe5d2'),
    hotspots: [
      move('m-light', '바다거북 우체국 등대', '🗼', [110, 140, 250, 260], 'LM_LIGHTHOUSE'),
      move('m-atelier', '펄 루미너스 아틀리에', '🔮', [400, 250, 260, 190], 'LM_ATELIER'),
      move('m-cafe', '루루의 카페', '☕', [700, 270, 240, 170], 'LM_CAFE'),
      move('m-harbor', '항구', '⚓', [980, 300, 200, 160], 'LM_HARBOR', { temp: true })
    ]
  });

  // ===== 로즈메리 =====
  add({
    id: 'RM_HOME', name: '클로버의 집', kind: 'location', parent: 'MAP_ROSEMARY', village: '로즈메리',
    bg: room('#f4e4d4', '#c9a27e'), intro: '클로버가 사는 아늑한 집. 모든 것이 제자리에 있다.',
    hotspots: [
      inspect('desk', '책상', '📝', [120, 300, 260, 150], {
        text: '책상 위에 오래된 노트가 펼쳐져 있다. 낯익은 글씨인데, 쓴 기억이 없다. (이전 기록 확인)', grant: 'O-04' }),
      inspect('drawer', '서랍', '🗄️', [470, 330, 220, 150], {
        text: '서랍 속에서 같은 하루를 적은 메모가 여러 장 나왔다. (클로버의 과거 메모)', grant: 'R-02' }),
      inspect('mirror', '거울', '🪞', [820, 160, 170, 300], {
        text: '거울 속의 클로버가 잠시 늦게 따라 웃은 것 같다. 기분 탓일까.' })
    ]
  });

  add({
    id: 'RM_PLAZA', name: '광장 · 시계탑', kind: 'location', parent: 'MAP_ROSEMARY', village: '로즈메리',
    bg: sky('#d8e8f5', '#eef2ec', '#d9d2c0'), intro: '마을 한가운데 시계탑이 서 있는 광장.',
    hotspots: [
      inspect('clock', '시계', '🕰️', [150, 120, 230, 300], {
        text: '시계탑의 바늘이 어제와 똑같은 시각을 가리키고 있다. 어제도, 그제도 같았던 것 같다.', grant: 'R-01' }),
      inspect('board', '게시판', '📌', [520, 260, 230, 180], {
        min: 2, early: '평범한 마을 소식이 붙어 있다. 지금은 별다른 점이 보이지 않는다.',
        text: '어제 떼어냈다고 들은 공지가 오늘도 그대로 붙어 있다.', grant: 'R-04' }),
      npc('plaza-npc', '주민', '🧑', [860, 280, 150, 200], 'resident', { temp: true })
    ]
  });

  // --- 도서관(외부) + 하위 장소 3곳 ---
  add({
    id: 'RM_LIBRARY_EXT', name: '도서관', kind: 'location', parent: 'MAP_ROSEMARY', village: '로즈메리',
    bg: sky('#e0d6ee', '#ebe6dd', '#c9d8b5'), intro: '조용한 기록의 공간. 입구 앞에 아리아가 서 있다.',
    hotspots: [
      inspect('lib-notice', '출입 제한 안내문', '📄', [170, 330, 190, 140], {
        text: '「도서관 출입은 사서가 허락한 사람에 한함」 — 낯선 문구가 적혀 있다.', grant: 'LIB-BLOCK' }),
      hs('move', 'lib-door', '도서관 문', '🚪', [470, 200, 260, 280], [
        { if: [{ stageMin: 2 }], do: [{ go: 'RM_LIBRARY_READING' }] },
        { if: [{ has: 'LIB-BLOCK' }], do: [{ say: 'aria', ctx: '출입 차단' }] },
        { do: [{ say: 'aria', ctx: '출입 차단' }, { grant: 'LIB-BLOCK' }] }
      ]),
      npc('aria', '아리아', '👤', [820, 250, 150, 230], 'aria', {
        rules: [
          { if: [{ flag: 'ariaConfronted' }], do: [{ say: 'aria', ctx: '대화' }] },
          { if: [{ deduced: 'FINAL-01' }, { stageMin: 4 }, { notEnded: true }],
            do: [{ say: 'aria', ctx: '대면' }, { flag: 'ariaConfronted' }] },
          { if: [{ stageMin: 2 }], do: [{ say: 'aria', ctx: '대화' }] },
          { do: [{ say: 'aria', ctx: '출입 차단' }] }
        ]
      })
    ]
  });

  add({
    id: 'RM_LIBRARY_READING', name: '도서관 열람실', kind: 'location', parent: 'RM_LIBRARY_EXT', village: '로즈메리',
    bg: room('#d9cdb8', '#8d6e55'), intro: '책이 빼곡한 열람실. 종이 냄새가 난다.',
    hotspots: [
      puzzle('ledger', '대출 장부', '📒', [130, 330, 220, 140], 'P-LEDGER', {
        repeat: '대출 장부의 모순을 이미 확인했다.' }),
      inspect('shelf', '책장', '📚', [440, 150, 260, 320], {
        text: '빼곡한 책 사이로 같은 제목이 여러 권 꽂혀 있다. (기록 단서 · 임시)' }),
      hs('move', 'to-archive', '자료 보관실 문', '🔒', [850, 190, 200, 280], [
        { if: [{ stageMin: 3 }, { solved: 'P-LEDGER' }], do: [{ go: 'RM_LIBRARY_ARCHIVE' }] },
        { if: [{ not: { stageMin: 3 } }], do: [{ text: '문이 굳게 잠겨 있다. 아직은 들어갈 수 없다.' }] },
        { do: [{ text: '문이 잠겨 있다. 열람실에서 놓친 기록이 있는 듯하다.' }] }
      ])
    ]
  });

  add({
    id: 'RM_LIBRARY_ARCHIVE', name: '자료 보관실', kind: 'location', parent: 'RM_LIBRARY_READING', village: '로즈메리',
    bg: room('#b9ad99', '#6f5a48'), intro: '오래된 자료가 잠든 곳. 공기가 차갑다.',
    hotspots: [
      puzzle('fragments', '기록 조각', '🧩', [150, 320, 240, 150], 'P-ARCHIVE', {
        repeat: '기록 조각은 이미 복원했다.' }),
      inspect('archive-box', '보관함', '🗃️', [480, 230, 230, 240], {
        text: '보관함은 대부분 비어 있다. 누군가 급히 치운 듯하다. (임시)' }),
      move('to-secret', '비밀 기록실 출입구', '🕳️', [850, 200, 200, 270], 'RM_LIBRARY_SECRET', {
        showIf: [{ solved: 'P-ARCHIVE' }] })
    ]
  });

  add({
    id: 'RM_LIBRARY_SECRET', name: '비밀 기록실', kind: 'location', parent: 'RM_LIBRARY_ARCHIVE', village: '로즈메리',
    bg: room('#5b5268', '#3b3446'), intro: '숨겨진 기록이 남은 방. 아무도 오지 않은 지 오래된 듯하다.',
    hotspots: [
      inspect('journal', '관찰일지', '📓', [200, 290, 230, 170], {
        text: '마을 사람들의 행동이 "하루 전에" 적혀 있다. 클로버의 이름도 있다.', grant: 'C-03' }),
      inspect('old-record', '오래된 기록', '📜', [600, 240, 260, 220], {
        min: 4, early: '먼지 쌓인 기록들이다. 아직은 무슨 뜻인지 알 수 없다.',
        text: '아주 오래전부터 같은 날이 되풀이되었다는 기록. 첫 장의 날짜가 지워져 있다.', grant: 'R-11' })
    ]
  });

  add({
    id: 'RM_VERA_SHOP', name: '베라의 잡화점', kind: 'location', parent: 'MAP_ROSEMARY', village: '로즈메리',
    bg: room('#f1ddc0', '#b98f6a'), intro: '없는 게 없는 작은 잡화점. 베라와 벨라가 가게를 지킨다.',
    hotspots: [
      npc('vera', '베라', '🧑‍🌾', [130, 260, 150, 220], 'vera'),
      npc('bella', '벨라', '👧', [330, 280, 140, 200], 'bella'),
      inspect('display', '진열대', '🧺', [560, 300, 220, 160], {
        text: '진열대 한쪽에 벨라가 자주 찾는 물건이 놓여 있다. 먼지 한 톨 없이 깨끗하다.', grant: 'O-01' }),
      inspect('ledger-shop', '장부', '📖', [870, 310, 200, 130], {
        text: '장부의 날짜가 어제와 똑같이 적혀 있다. 베라는 그걸 알고 있을까?', grant: 'R-03' })
    ]
  });

  // ===== 글렌위버 =====
  add({
    id: 'GW_TOWER', name: '주야 교대 새집 탑', kind: 'location', parent: 'MAP_GLENWEAVER', village: '글렌위버',
    bg: room('#cfd9ee', '#8c8f7a'), intro: '낮과 밤이 교대하는 새집 탑.',
    hotspots: [
      inspect('birdhouse', '새집 장치', '🐦', [170, 160, 260, 300], {
        min: 2, early: '새집이 규칙적으로 열렸다 닫힌다. 지금은 평범한 장치로 보인다.',
        text: '장치의 톱니가 같은 자리에서 정확히 되돌아간다. 낮과 밤이 "재생"되는 느낌이다.', grant: 'R-06' }),
      inspect('shift-log', '교대 기록', '📋', [620, 300, 240, 160], {
        text: '낮과 밤의 교대 시각이 단 1초도 어긋나지 않는다. 사람의 일이라기엔 이상하다.', grant: 'C-01' })
    ]
  });

  add({
    id: 'GW_OAKS', name: '나이테 회전형 만물상', kind: 'location', parent: 'MAP_GLENWEAVER', village: '글렌위버',
    bg: room('#e8d8b4', '#9b7b52'), intro: '나이테 모양 선반이 천천히 도는 만물상.',
    hotspots: [
      npc('oaks', '오크스', '🧔', [130, 260, 150, 220], 'oaks'),
      puzzle('shelf-spin', '회전 선반', '🌀', [420, 170, 260, 300], 'P-SHELF', {
        min: 3, early: '선반이 느리게 돌고 있다. 지금은 눈여겨볼 점이 없다.', repeat: '선반은 이미 한 바퀴 돌려 보았다.' }),
      inspect('old-thing', '오래된 물건', '🪵', [800, 320, 220, 140], {
        text: '팔지 않는다는 딱지가 붙은 낡은 물건. 손때가 묻어 있다.', grant: 'O-03' })
    ]
  });

  add({
    id: 'GW_SIENNA', name: '시에나의 계절 망토 공방', kind: 'location', parent: 'MAP_GLENWEAVER', village: '글렌위버',
    bg: room('#f2d9d3', '#b88f7a'), intro: '계절마다 다른 망토를 짓는 공방.',
    hotspots: [
      npc('sienna', '시에나', '👩‍🎨', [130, 270, 150, 210], 'sienna'),
      inspect('cloak', '망토', '🧥', [400, 190, 230, 280], {
        text: '걸린 망토마다 계절이 다르다. 그런데 모두 같은 날짜의 태그가 달려 있다. (계절 기록 단서 · 임시)' }),
      inspect('workbench-gw', '작업대', '🪡', [760, 320, 260, 150], {
        min: 3, early: '바느질감이 놓여 있다. 지금은 평범한 작업대다.',
        text: '계절이 바뀌어도 망토는 늘 같은 단계에서 멈춰 있다. 완성되는 것을 본 적이 없다.', grant: 'R-08' })
    ]
  });

  add({
    id: 'GW_HOUSE', name: '마을 주택', kind: 'location', parent: 'MAP_GLENWEAVER', village: '글렌위버',
    bg: room('#efe5cf', '#c3a77f'), intro: '숲속 마을의 평범한 집.',
    hotspots: [ npc('gw-resident', '주민', '🧑', [520, 260, 150, 220], 'resident', { temp: true }) ]
  });

  // ===== 루미나리아 =====
  add({
    id: 'LM_LIGHTHOUSE', name: '바다거북 우체국 등대', kind: 'location', parent: 'MAP_LUMINARIA', village: '루미나리아',
    bg: room('#d3ebf0', '#e3d7bd'), intro: '바다거북이 지키는 우체국 등대.',
    hotspots: [
      npc('noa', '노아', '🧑‍✈️', [130, 270, 150, 210], 'noa'),
      inspect('mailbox', '우편함', '📮', [420, 280, 200, 180], {
        min: 3, early: '우편함에는 평범한 우편물이 들어 있다. 지금은 별다른 점이 없다.',
        text: '배달된 적 없는 편지가 매일 같은 자리에 다시 도착한다.', grant: 'R-09' }),
      inspect('letter', '편지', '✉️', [780, 320, 200, 130], {
        min: 4, early: '봉투가 단단히 봉해져 있다. 지금은 열 수 없을 것 같다.',
        text: '클로버에게 보낸 것 같은, 부치지 못한 편지다. 소인의 날짜가 지워져 있다.', grant: 'R-12' })
    ]
  });

  add({
    id: 'LM_ATELIER', name: '펄 루미너스 아틀리에', kind: 'location', parent: 'MAP_LUMINARIA', village: '루미나리아',
    bg: room('#e9e4f4', '#c9bfd9'), intro: '진주빛 유리가 빛나는 아틀리에.',
    hotspots: [
      inspect('glass', '유리 작품', '🔮', [160, 170, 250, 300], {
        text: '진주빛 유리 속에서 마을의 풍경이 어렴풋이 비친다. (유리 작품 관련 단서 · 임시)' }),
      puzzle('workbench-lm', '작업대', '🛠️', [640, 300, 280, 160], 'P-ATELIER', {
        lock: { cond: { flag: 'ariaConfronted' }, text: '작업대에 손이 닿지 않는다. 아직 정리되지 않은 무언가가 남아 있다.' },
        repeat: '유리 조각은 이미 이어 붙였다.' })
    ]
  });

  add({
    id: 'LM_CAFE', name: '루루의 카페', kind: 'location', parent: 'MAP_LUMINARIA', village: '루미나리아',
    bg: room('#d6f0f1', '#a8d0cf'), intro: '해파리 조명이 떠다니는 카페.',
    hotspots: [
      npc('lulu', '루루', '👩‍🍳', [130, 270, 150, 210], 'lulu'),
      inspect('menu', '메뉴판', '🍵', [400, 190, 200, 200], {
        text: '메뉴판의 오늘의 메뉴가 어제와 같다. 손님이 고르기도 전에 정해진 것 같다. (임시)' }),
      inspect('jelly', '해파리 조명', '🪼', [760, 100, 240, 280], {
        text: '조명이 손님의 움직임을 한 박자 앞서 따라간다. 마치 어디로 갈지 알고 있다는 듯이.', grant: 'C-02' })
    ]
  });

  add({
    id: 'LM_HARBOR', name: '항구', kind: 'location', parent: 'MAP_LUMINARIA', village: '루미나리아',
    bg: sky('#cfe6f2', '#9ec6dc', '#e6d9bd', 55), intro: '배가 드나드는 작은 항구.',
    hotspots: [
      inspect('pier', '선착장', '⛵', [200, 320, 260, 150], {
        text: '선착장 끝에 노아가 서 있던 자국이 있다. 매일 같은 자리, 같은 시각이다.', grant: 'O-02' }),
      move('sign', '표지판', '🪧', [720, 280, 180, 190], 'MAP_LUMINARIA', { temp: true })
    ]
  });
})();
