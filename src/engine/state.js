/* 게임 상태. 메모리에만 보관(새로고침하면 초기화). 오류 단계는 저장하지 않고 계산한다. */
(function () {
  const EF = window.EF;
  // 단계 구간: 구간 내 흔적을 모두 찾으면 다음 단계로 (임시 배분 3·3·4·3)
  EF.TIERS = [
    ['R-01', 'R-02', 'R-03'],
    ['R-04', 'R-05', 'R-06'],
    ['R-07', 'R-08', 'R-09', 'R-10'],
    ['R-11', 'R-12', 'R-13']
  ];
  const create = () => ({ scene: 'WORLD_MAP', evidence: {}, solved: {}, flags: {}, deduced: {}, order: 0 });
  EF.state = create();
  EF.reset = () => { EF.state = create(); };
  EF.getStage = (s = EF.state) => 1 + EF.TIERS.filter(t => t.every(id => s.evidence[id])).length;
  EF.isEnded = () => EF.getStage() === 5;
  EF.traceCount = () => Object.keys(EF.state.evidence).filter(id => EF.EVIDENCE[id].type === 'trace').length;
})();
