/* NPC. lines: [{if:[조건], text}] 를 위에서부터 검사, 없으면 placeholder("000과 대화").
   실제 대사가 정해지면 lines 에 추가만 하면 된다. */
(function () {
  const EF = window.EF;
  EF.NPCS = {
    resident: { name: '주민', role: '마을 주민', color: '#9aa7b8', lines: [] },
    vera:   { name: '베라', role: '로즈메리의 선택받은 주민 · 잡화점 주인', color: '#8fb3d9', lines: [] },
    bella:  { name: '벨라', role: '로즈메리 주민', color: '#d9a3c4', lines: [] },
    aria:   { name: '아리아', role: '도서관', color: '#b9a3e0', lines: [] },
    oaks:   { name: '오크스', role: '나이테 회전형 만물상 주인', color: '#c9a26b', lines: [] },
    sienna: { name: '시에나', role: '계절 망토 공방 주인', color: '#e0a39a', lines: [] },
    noa:    { name: '노아', role: '바다거북 우체국 등대', color: '#7fc4c4', lines: [] },
    lulu:   { name: '루루', role: '루루의 카페 주인', color: '#8fd0d9', lines: [] }
  };
})();
