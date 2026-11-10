/* 추리. requires: 연결해야 하는 증거 id(순서 자유). FINAL-01 은 MAIN 3개 + 4단계. */
(function () {
  const EF = window.EF;
  EF.DEDUCTIONS = [
    { id: 'MAIN-01', kind: 'main', title: '반복되는 일상', requires: ['R-01', 'R-03', 'C-01'],
      hypo: '이 세계의 하루는 되풀이되고 있는지도 모른다. (세계 반복 가설)' },
    { id: 'MAIN-02', kind: 'main', title: '예측된 행동', requires: ['C-03', 'C-02'],
      hypo: '누군가 우리의 행동을 미리 알고 지켜보고 있다. (행동 관찰 가설)' },
    { id: 'MAIN-03', kind: 'main', title: '지나친 친절', requires: ['LIB-BLOCK', 'R-05'],
      hypo: '친절함 뒤에서 무언가를 감추고 있다. (정보 은폐 가설)' },
    { id: 'FINAL-01', kind: 'final', title: '통합 추리', requires: [],
      hypo: '아리아가 이 세계를 만들었을 가능성이 있다. (가설 · 확정 아님)' },
    { id: 'OPT-01', kind: 'opt', title: '벨라의 기억', requires: ['O-01'], hypo: '벨라의 기억에는 비어 있는 부분이 있다. (임시 해석)' },
    { id: 'OPT-02', kind: 'opt', title: '노아의 행동', requires: ['O-02'], hypo: '노아는 무언가를 기다리고 있다. (임시 해석)' },
    { id: 'OPT-03', kind: 'opt', title: '오크스의 물건', requires: ['O-03'], hypo: '오크스는 팔 수 없는 물건을 간직하고 있다. (임시 해석)' },
    { id: 'OPT-04', kind: 'opt', title: '클로버의 과거 기록', requires: ['O-04'], hypo: '클로버의 기록은 어느 날부터 끊겨 있다. (임시 해석)' }
  ];
})();
