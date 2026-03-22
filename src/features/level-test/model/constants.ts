// ═══════════════════════════════════════════════════
//  레벨 테스트 상수 (설문·시나리오 문제은행, 레벨, 지역, 돌봄 타입)
// ═══════════════════════════════════════════════════

export interface QuestionOption {
  label: string
  desc: string
  score: number
  typeTag?: string
}

export interface Question {
  id: string
  type: 'survey' | 'scenario'
  category: string
  text: string
  hint: string | null
  options: QuestionOption[]
  maxScore: number
  certifiable?: boolean
  docLabel?: string
  docKey?: string
  isType?: boolean
  correctIdx?: number
  feedback?: { correct: string; wrong: string }
}

// ── 설문 문항 (SV-01 ~ SV-08) ──────────────────────
export const SURVEY_QUESTIONS: Question[] = [
  {
    id: 'SV-01', type: 'survey', category: '설문',
    text: '아이돌봄 관련 실무 경력은 얼마나 되시나요?',
    hint: null,
    options: [
      { label: '경력 없음 (처음 도전)', desc: '', score: 0 },
      { label: '6개월 미만', desc: '가정보육, 친인척 돌봄 포함', score: 5 },
      { label: '6개월 ~ 2년', desc: '아이돌봄 서비스 또는 유사 기관 경험', score: 10 },
      { label: '2년 이상', desc: '전문 아이돌보미 활동 이력', score: 15 },
    ],
    maxScore: 15, certifiable: false,
  },
  {
    id: 'SV-02', type: 'survey', category: '설문',
    text: '보유하신 자격증을 선택해 주세요.',
    hint: '복수 자격 보유 시 가장 높은 수준의 자격증을 선택하세요.',
    options: [
      { label: '자격증 없음', desc: '', score: 0 },
      { label: '아이돌보미 (일반형)', desc: '한국건강가정진흥원 이수 후 취득', score: 5 },
      { label: '아이돌보미 (영아종합형)', desc: '만 36개월 이하 영아 전문 자격', score: 10 },
      { label: '보육교사 2급 이상 / 유치원교사', desc: '국가공인 전문 자격증', score: 15 },
    ],
    maxScore: 15, certifiable: true,
    docLabel: '자격증 사본', docKey: 'cert',
  },
  {
    id: 'SV-03', type: 'survey', category: '설문',
    text: '아이돌봄 관련 교육 이수 현황은 어떻게 되나요?',
    hint: null,
    options: [
      { label: '교육 이수 없음', desc: '', score: 0 },
      { label: '기본 교육만 이수', desc: '아이돌보미 양성 교육 (80시간)', score: 3 },
      { label: '기본 + 보수 교육 이수', desc: '연간 보수교육 1회 이상 완료', score: 6 },
      { label: '기본 + 보수 교육 + 전문 교육', desc: '응급처치, 특수 돌봄 등 추가 이수', score: 10 },
    ],
    maxScore: 10, certifiable: true,
    docLabel: '교육 이수증', docKey: 'edu',
  },
  {
    id: 'SV-04', type: 'survey', category: '설문',
    text: '주로 돌봄 가능한 연령대를 선택해 주세요.',
    hint: null,
    options: [
      { label: '만 3세 이상 (유아~초등)', desc: '기본적인 생활 가능한 연령', score: 2 },
      { label: '만 1~3세 (걸음마기)', desc: '집중 관찰이 필요한 연령', score: 5 },
      { label: '만 1세 미만 (영아)', desc: '전문적 수유·기저귀 케어 포함', score: 7 },
      { label: '전 연령 (0세~12세)', desc: '영아부터 초등까지 모두 가능', score: 10 },
    ],
    maxScore: 10, certifiable: false,
  },
  {
    id: 'SV-05', type: 'survey', category: '설문',
    text: '응급처치(CPR) 또는 하임리히법 교육을 받으신 적 있나요?',
    hint: null,
    options: [
      { label: '전혀 없음', desc: '', score: 0 },
      { label: '온라인 영상으로만 시청', desc: '공식 이수 인정 불가', score: 1 },
      { label: '공식 기관 오프라인 교육 이수', desc: '소방서·대한적십자사 등', score: 5 },
      { label: '응급처치 자격증 보유', desc: '1·2급 응급처치 자격증 취득', score: 10 },
    ],
    maxScore: 10, certifiable: true,
    docLabel: '응급처치 수료증 / 자격증', docKey: 'emergency',
  },
  // ── 돌봄 타입 진단 문항 (점수 미반영) ──
  {
    id: 'SV-06', type: 'survey', category: '타입진단', isType: true,
    text: '아이와 하루를 보낸다면 주로 어떤 활동을 하고 싶으신가요?',
    hint: null,
    options: [
      { label: '공원·놀이터에서 뛰어놀기, 신체 활동 중심', desc: '달리기, 공놀이, 자전거 등 에너지 발산', score: 0, typeTag: 'ACT' },
      { label: '그림책 읽기, 노래·율동으로 감성 교감', desc: '조용한 실내 활동, 정서적 연결 중심', score: 0, typeTag: 'CAL' },
      { label: '퍼즐·숫자·한글 등 학습 놀이', desc: '구조적 활동, 인지 발달 자극 중심', score: 0, typeTag: 'EDU' },
      { label: '미술·만들기·역할 놀이·상상 놀이', desc: '자유로운 창의 활동, 스토리텔링 중심', score: 0, typeTag: 'CRE' },
    ],
    maxScore: 0, certifiable: false,
  },
  {
    id: 'SV-07', type: 'survey', category: '타입진단', isType: true,
    text: '아이가 칭얼대거나 기분이 안 좋을 때 나의 첫 번째 반응은?',
    hint: null,
    options: [
      { label: '밖에 나가 몸을 움직이며 에너지를 발산시킨다', desc: '활동으로 기분 전환을 유도한다', score: 0, typeTag: 'ACT' },
      { label: '안아주거나 감정을 먼저 충분히 들어준다', desc: '공감과 위로로 정서적 안정을 준다', score: 0, typeTag: 'CAL' },
      { label: '왜 그런지 차분히 묻고 이유와 해결책을 설명한다', desc: '논리적 대화로 상황을 정리한다', score: 0, typeTag: 'EDU' },
      { label: '재미있는 이야기나 새로운 놀이로 기분을 전환시킨다', desc: '창의적인 방식으로 관심을 돌린다', score: 0, typeTag: 'CRE' },
    ],
    maxScore: 0, certifiable: false,
  },
  {
    id: 'SV-08', type: 'survey', category: '타입진단', isType: true,
    text: '돌봄이로서 가장 보람을 느끼는 순간은?',
    hint: null,
    options: [
      { label: '아이가 땀 흘리며 신나게 뛰어놀 때', desc: '건강하게 에너지를 쏟는 모습이 뿌듯하다', score: 0, typeTag: 'ACT' },
      { label: '아이가 안정감 있게 잠들거나 품에 안길 때', desc: '심리적 안정을 주었다는 것이 보람 있다', score: 0, typeTag: 'CAL' },
      { label: '아이가 새로운 것을 배우고 성취감을 느낄 때', desc: '성장과 발달을 이끌었다는 것이 뿌듯하다', score: 0, typeTag: 'EDU' },
      { label: '아이가 상상력을 발휘해 무언가를 만들어낼 때', desc: '창의적 표현을 이끌어냈다는 것이 보람 있다', score: 0, typeTag: 'CRE' },
    ],
    maxScore: 0, certifiable: false,
  },
]

// ── 시나리오 문제 은행 (A~E 카테고리) ──────────────
export const SCENARIO_BANK: Record<string, Question[]> = {
  A: [
    {
      id: 'A-01', type: 'scenario', category: '응급·안전',
      text: '18개월 아이가 포도를 먹다가 목이 막혀 숨을 쉬지 못하고 있습니다. 어떻게 대응하시겠어요?',
      hint: '🚨 기도 이물 질식 상황입니다. 최선의 응급 처치를 선택하세요.',
      options: [
        { label: '등을 세게 두드린다', desc: '무작정 두드리는 것은 위험할 수 있음', score: 3 },
        { label: '물을 마시게 해서 이물을 내려보낸다', desc: '기도 막힘 시 물은 위험할 수 있음', score: 0 },
        { label: '등 두드리기(5회) → 복부 밀어올리기(5회) 반복 후 119 신고', desc: '영아 기도 이물 제거 표준 처치법', score: 10 },
        { label: '즉시 119에 신고하고 아무것도 하지 않는다', desc: '처치 없이 대기하면 뇌 손상 위험', score: 5 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 영아 기도 이물 처치는 등 두드리기 5회 → 가슴 밀어내기 5회 반복이 표준 처치법입니다.',
        wrong: '⚠️ 영아 기도 이물 처치 표준법은 등 두드리기 5회 → 가슴 밀어내기 5회 반복 + 즉시 119 신고입니다.',
      },
    },
    {
      id: 'A-02', type: 'scenario', category: '응급·안전',
      text: '만 2세 아이에게 38.5도 열이 있었는데, 갑자기 온몸을 떨며 경련을 일으킵니다.',
      hint: '🚨 열성경련 상황입니다. 올바른 응급 대응을 선택하세요.',
      options: [
        { label: '입에 수건을 물려 혀를 다치지 않게 한다', desc: '기도 폐쇄 위험, 절대 금지', score: 0 },
        { label: '아이를 강하게 붙잡아 경련을 막는다', desc: '골절·부상 위험', score: 0 },
        { label: '안전한 바닥에 옆으로 눕히고 시간을 재며 119에 신고한다', desc: '열성경련 표준 대응법', score: 10 },
        { label: '찬물로 온몸을 닦아 열을 즉시 내린다', desc: '급격한 체온 변화는 위험', score: 3 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 열성경련 시 안전한 곳에 옆으로 눕히고 경련 시간을 측정하며 119에 신고하는 것이 올바른 대응입니다.',
        wrong: '⚠️ 열성경련 시 입에 이물을 넣거나 강하게 붙잡는 것은 위험합니다.',
      },
    },
    {
      id: 'A-03', type: 'scenario', category: '응급·안전',
      text: '만 18개월 아이가 소파에서 떨어진 후 울다가 잠시 후 눈을 감고 반응이 없습니다.',
      hint: '🚨 낙상 후 의식 저하 상황입니다.',
      options: [
        { label: '잠든 것이니 이불을 덮어준다', desc: '의식 확인 없이 방치는 위험', score: 0 },
        { label: '깨우기 위해 뺨을 때린다', desc: '두부 손상 가능성 있을 때 자극은 금지', score: 0 },
        { label: '목을 고정하고 움직이지 않게 한 채 즉시 119 신고', desc: '경추 손상 가능성 고려한 표준 처치', score: 10 },
        { label: '물을 먹여서 깨어나게 한다', desc: '의식 없는 상태에서 음식물 투여 금지', score: 1 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 낙상 후 의식 저하 시 경추 손상 가능성을 고려해 목을 고정하고 즉시 119에 신고해야 합니다.',
        wrong: '⚠️ 낙상 후 의식이 없는 아이를 흔들거나 음식을 먹이는 것은 금지입니다.',
      },
    },
    {
      id: 'A-04', type: 'scenario', category: '응급·안전',
      text: '아이가 뜨거운 국물에 손을 데었습니다. 손등이 빨갛게 달아올랐습니다.',
      hint: '🔥 화상 응급처치 상황입니다.',
      options: [
        { label: '버터나 치약을 발라 열기를 식힌다', desc: '감염 위험, 절대 금지', score: 0 },
        { label: '얼음을 직접 상처에 올려 식힌다', desc: '동상·조직 손상 위험', score: 2 },
        { label: '흐르는 차가운 물에 15분 이상 식힌 후 병원에 연락한다', desc: '화상 표준 응급처치', score: 10 },
        { label: '화상 부위를 천으로 꽉 감아 압박한다', desc: '혈액순환 방해, 수포 손상 위험', score: 1 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 화상 처치의 기본은 흐르는 차가운 물에 15분 이상 식히는 것입니다.',
        wrong: '⚠️ 화상 처치 시 버터, 치약, 얼음 직접 접촉은 금지입니다.',
      },
    },
  ],
  B: [
    {
      id: 'B-01', type: 'scenario', category: '영아케어',
      text: '생후 4개월 아기가 분유를 계속 뱉고 보채고 있습니다. 어떻게 하시겠어요?',
      hint: '🍼 영아 수유 거부 상황입니다.',
      options: [
        { label: '계속 먹이려고 시도한다', desc: '강제 수유는 흡인 위험 있음', score: 1 },
        { label: '트림을 시키고 자세를 바꿔 재시도, 이상 징후 시 보호자 연락', desc: '영아 수유 문제 표준 대응', score: 10 },
        { label: '배가 안 고픈 것이니 나중에 준다', desc: '보채는 원인 파악 없이 포기', score: 3 },
        { label: '분유 농도가 잘못된 것 같아 물을 더 탄다', desc: '임의 농도 변경 금지', score: 0 },
      ],
      maxScore: 10, correctIdx: 1,
      feedback: {
        correct: '✅ 잘 하셨습니다! 트림 후 자세를 조정해 재시도하고, 지속 시 보호자에게 즉시 연락하는 것이 올바른 대응입니다.',
        wrong: '⚠️ 영아 수유 거부 시 트림을 시키고 자세를 바꿔 재시도하는 것이 표준 대응입니다.',
      },
    },
    {
      id: 'B-02', type: 'scenario', category: '영아케어',
      text: '생후 3개월 영아의 체온이 38도입니다. 평소보다 울음이 많고 먹으려 하지 않습니다.',
      hint: '🌡 영아 발열 상황입니다. 월령을 고려하세요.',
      options: [
        { label: '두꺼운 이불로 덮어 땀을 빼게 한다', desc: '체온 상승 위험', score: 0 },
        { label: '임의로 해열제를 먹인다', desc: '3개월 미만 영아 임의 투약 금지', score: 0 },
        { label: '즉시 보호자에게 연락하고 응급실 방문을 권유한다', desc: '3개월 미만 발열은 즉시 응급 처치 필요', score: 10 },
        { label: '옷을 얇게 입히고 미지근한 수건으로 닦아 준다', desc: '처치는 맞지만 보호자 연락이 우선', score: 5 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 생후 3개월 이하 영아의 발열은 즉각적인 의료 처치가 필요합니다.',
        wrong: '⚠️ 3개월 미만 영아의 38도 이상 발열은 응급 상황입니다.',
      },
    },
    {
      id: 'B-03', type: 'scenario', category: '영아케어',
      text: '낮잠을 재운 생후 5개월 영아가 뒤집혀 엎드린 채 자고 있습니다.',
      hint: '😴 영아 수면 자세 안전 상황입니다.',
      options: [
        { label: '스스로 뒤집을 수 있으니 그냥 둔다', desc: '영아 돌연사 위험', score: 0 },
        { label: '조심스럽게 옆으로만 돌린다', desc: '올바른 자세가 아님', score: 3 },
        { label: '즉시 바로 눕히고 이후 주기적으로 확인한다', desc: '영아 수면 안전 표준 권고', score: 10 },
        { label: '엎드려 자면 소화에 좋으니 그대로 둔다', desc: '위험한 잘못된 상식', score: 0 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 영아는 항상 바로 눕혀 재워야 하며, 엎드린 것을 발견하면 즉시 바로 눕혀야 합니다.',
        wrong: '⚠️ 영아는 반드시 바로 눕혀 재워야 합니다. 엎드려 자는 자세는 영아 돌연사(SIDS)의 위험 요인입니다.',
      },
    },
    {
      id: 'B-04', type: 'scenario', category: '영아케어',
      text: '생후 10일 신생아의 피부와 눈 흰자가 노랗게 보입니다. 보호자는 외출 중입니다.',
      hint: '🌙 신생아 황달 의심 상황입니다.',
      options: [
        { label: '신생아는 원래 그럴 수 있으니 보호자 귀가를 기다린다', desc: '황달 방치 시 뇌 손상 가능', score: 2 },
        { label: '창문을 열어 햇빛을 쬐어준다', desc: '의료 처치 없이 햇빛만으로는 부족', score: 3 },
        { label: '즉시 보호자에게 사진과 함께 연락하고 의료 확인을 요청한다', desc: '신생아 황달은 신속한 의료 확인 필요', score: 10 },
        { label: '분유를 더 자주 먹인다', desc: '수분 보충은 도움이 되나 의료 확인이 우선', score: 4 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 신생아 황달은 방치 시 뇌 손상(핵황달)으로 이어질 수 있습니다.',
        wrong: '⚠️ 신생아 황달은 조기 의료 처치가 매우 중요합니다.',
      },
    },
  ],
  C: [
    {
      id: 'C-01', type: 'scenario', category: '행동·정서',
      text: '만 3세 아이가 30분째 밥을 거부하고 울며 떼를 쓰고 있습니다.',
      hint: '🍚 아이의 정서와 자율성을 존중하는 접근법을 선택하세요.',
      options: [
        { label: '"다 먹어야 나간다"고 강요한다', desc: '강압적 식사 강요는 역효과', score: 2 },
        { label: '아이가 원하는 것(간식, 장난감)을 주고 달랜다', desc: '단기 효과는 있으나 행동 강화 문제', score: 3 },
        { label: '강요 없이 잠시 놀이 후 재시도하고 보호자에게 상황 공유', desc: '아이 리듬 존중 + 보호자 소통', score: 10 },
        { label: '그냥 먹기 싫으면 안 먹어도 된다고 하고 치운다', desc: '영양 섭취 문제, 보호자 보고 누락', score: 4 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 좋은 선택입니다! 강요 없이 활동을 전환 후 재시도하고 보호자에게 투명하게 전달하는 것이 올바른 대응입니다.',
        wrong: '⚠️ 식사 거부 상황에서 강요하거나 달래기보다, 잠시 전환 후 재시도하고 보호자에게 반드시 공유하는 것이 바람직합니다.',
      },
    },
    {
      id: 'C-02', type: 'scenario', category: '행동·정서',
      text: '만 2세 아이가 부모가 나가자마자 30분째 울음을 멈추지 않고 달래도 반응이 없습니다.',
      hint: '😢 분리불안 상황입니다.',
      options: [
        { label: '"엄마 곧 와"라며 계속 말로만 설득한다', desc: '반복된 빈말은 신뢰를 떨어뜨림', score: 3 },
        { label: '아이 감정을 인정하며 관심을 전환할 활동을 시도한다', desc: '정서 인정 + 환경 전환', score: 10 },
        { label: '울음이 멈출 때까지 방에 혼자 두고 기다린다', desc: '방임으로 오해될 수 있음', score: 0 },
        { label: '보호자에게 즉시 전화해 돌아오게 한다', desc: '과도한 개입, 분리 훈련 방해', score: 4 },
      ],
      maxScore: 10, correctIdx: 1,
      feedback: {
        correct: '✅ 정확합니다! 아이의 감정을 인정하고 관심을 전환시키는 것이 분리불안 대응의 핵심입니다.',
        wrong: '⚠️ 분리불안 시 감정을 인정하고 흥미로운 활동으로 관심을 전환시키는 것이 가장 효과적인 대응입니다.',
      },
    },
    {
      id: 'C-03', type: 'scenario', category: '행동·정서',
      text: '만 2세 아이가 갑자기 돌봄이의 손을 세게 물었습니다.',
      hint: '😤 공격 행동 대응 상황입니다.',
      options: [
        { label: '크게 혼내고 타임아웃을 준다', desc: '2세 아이의 발달 수준에 맞지 않음', score: 2 },
        { label: '"아파"라고 말하고 물기는 안 된다고 단호하고 침착하게 설명한다', desc: '발달에 적합한 일관된 한계 설정', score: 10 },
        { label: '모른 척하고 넘어간다', desc: '행동 강화 위험', score: 1 },
        { label: '보호자에게 즉시 연락해 아이를 데려가게 한다', desc: '과잉 대응, 관계 손상 위험', score: 3 },
      ],
      maxScore: 10, correctIdx: 1,
      feedback: {
        correct: '✅ 정확합니다! 침착하게 감정을 표현하고 단호하게 한계를 설명하는 것이 발달 수준에 맞는 올바른 대응입니다.',
        wrong: '⚠️ 공격 행동에는 침착하게 "아파"라고 말하고 그 행동이 안 된다고 일관성 있게 설명하는 것이 가장 효과적입니다.',
      },
    },
    {
      id: 'C-04', type: 'scenario', category: '행동·정서',
      text: '보호자가 "스마트폰을 30분만 보여주세요"라고 했는데 아이가 1시간째 더 보겠다고 울고 있습니다.',
      hint: '📱 미디어 사용 경계 설정 상황입니다.',
      options: [
        { label: '울음을 멈추기 위해 계속 보여준다', desc: '경계 설정 실패, 행동 강화', score: 0 },
        { label: '보호자가 허용한 시간을 지키고, 울더라도 일관되게 종료한다', desc: '보호자 지시 준수 + 일관성', score: 10 },
        { label: '보호자에게 연락해 추가 허용 여부를 확인한다', desc: '올바른 소통이지만 원칙이 우선', score: 7 },
        { label: '잠깐이니 괜찮다고 생각하며 10분만 더 보여준다', desc: '임의적 변경, 일관성 훼손', score: 2 },
      ],
      maxScore: 10, correctIdx: 1,
      feedback: {
        correct: '✅ 정확합니다! 보호자가 정한 규칙을 일관성 있게 지키는 것이 가장 중요합니다.',
        wrong: '⚠️ 보호자가 정한 시간 제한은 반드시 지켜야 합니다.',
      },
    },
  ],
  D: [
    {
      id: 'D-01', type: 'scenario', category: '아동보호',
      text: '돌봄 중 아이 몸에서 이전에 없던 멍 자국을 발견했습니다. 아이는 대답하지 않습니다.',
      hint: '🔍 아동보호 관련 민감한 상황입니다.',
      options: [
        { label: '부모가 낸 것일 수도 있으니 모른 척 한다', desc: '아동 안전 의무 위반', score: 0 },
        { label: '아이를 추궁해서 원인을 파악한다', desc: '2차 트라우마 유발 가능', score: 2 },
        { label: '사진을 찍어 증거를 남기고 의뢰 기관·보호자에게 보고하며 필요시 112 신고', desc: '돌보미 법적 신고 의무 이행', score: 10 },
        { label: '보호자에게만 조용히 이야기한다', desc: '가해자가 보호자일 경우 위험', score: 4 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 아이돌보미는 아동학대 신고의무자입니다.',
        wrong: '⚠️ 아이돌보미는 아동학대 신고의무자입니다. 멍 자국 발견 시 증거를 보존하고 기관에 보고해야 합니다.',
      },
    },
    {
      id: 'D-02', type: 'scenario', category: '아동보호',
      text: '보호자 귀가 후 아이에게 "넌 왜 이렇게 멍청하니" 등의 심한 말을 반복적으로 하는 것을 목격했습니다.',
      hint: '🗣 언어적 학대 의심 상황입니다.',
      options: [
        { label: '가정 내 일이라 개입하지 않는다', desc: '언어 학대도 신고 의무 대상', score: 0 },
        { label: '그 자리에서 보호자에게 직접 주의를 준다', desc: '돌봄이의 역할 범위 초과, 갈등 위험', score: 3 },
        { label: '상황을 기록해 두고 의뢰 기관에 보고한다', desc: '돌보미의 올바른 신고 의무 이행', score: 10 },
        { label: '아이에게 괜찮냐고 물어본다', desc: '아이 앞에서 확인은 2차 상처 가능', score: 4 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 언어적 학대도 아동학대에 해당합니다.',
        wrong: '⚠️ 언어적 학대도 아동학대 신고 대상입니다. 상황을 기록하고 의뢰 기관에 보고해야 합니다.',
      },
    },
    {
      id: 'D-03', type: 'scenario', category: '아동보호',
      text: '돌봄 가정 방문 시 아이가 3일째 같은 옷을 입고 있고, 냉장고에 음식이 거의 없습니다.',
      hint: '🏠 방임 의심 상황입니다.',
      options: [
        { label: '보호자 사정이 있을 수 있으니 그냥 돌봄을 진행한다', desc: '방임 의심 신고 의무 방치', score: 1 },
        { label: '아이에게 밥을 차려주고 보호자를 기다린다', desc: '즉각 도움은 좋으나 신고 의무 누락', score: 4 },
        { label: '상황을 기록하고 의뢰 기관에 보고한다. 반복 시 아동보호전문기관(112) 신고 검토', desc: '방임 의심 표준 대응 절차', score: 10 },
        { label: '직접 마트에서 식재료를 사다 채워준다', desc: '일시적 해결, 근본 문제 미보고', score: 3 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 방임 의심 상황은 기록 후 기관 보고가 우선입니다.',
        wrong: '⚠️ 방임도 아동학대의 한 형태입니다. 기록 후 의뢰 기관에 보고해야 합니다.',
      },
    },
    {
      id: 'D-04', type: 'scenario', category: '아동보호',
      text: '만 5세 아이가 돌봄 중 성인이 알 법한 성적인 표현을 반복적으로 사용합니다.',
      hint: '⚠️ 아동 성 노출 의심 상황입니다.',
      options: [
        { label: '아이들이 워낙 말을 잘 배우니 대수롭지 않게 넘긴다', desc: '성학대 징후를 방치하는 위험한 대응', score: 0 },
        { label: '아이를 혼내고 그런 말을 쓰지 말라고 한다', desc: '아이에게 죄책감 부여, 상황 은폐 위험', score: 2 },
        { label: '반응을 보이지 않되 즉시 기록하고 의뢰 기관에 보고한다', desc: '성학대 의심 표준 대응', score: 10 },
        { label: '어디서 들었는지 자세히 캐묻는다', desc: '돌봄이가 직접 조사하면 2차 피해 위험', score: 3 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 아이의 성적 발언은 성 노출 또는 학대의 징후일 수 있습니다.',
        wrong: '⚠️ 아이의 부적절한 성적 발언은 학대 징후일 수 있습니다. 혼내거나 캐묻지 말고 즉시 기록 후 보고하세요.',
      },
    },
  ],
  E: [
    {
      id: 'E-01', type: 'scenario', category: '위기대응',
      text: '보호자로부터 연락이 안 되고 귀가 시간이 1시간 넘게 지났습니다. 아이는 불안해하고 있습니다.',
      hint: '📞 보호자 귀가 지연 상황입니다.',
      options: [
        { label: '집 앞에 아이를 두고 퇴근한다', desc: '아동 방임·유기에 해당, 절대 불가', score: 0 },
        { label: '아이를 안심시키고 비상연락처·의뢰 기관에 순차 연락 후 대기', desc: '아이 정서 안정 + 프로토콜 이행', score: 10 },
        { label: '기관 보고 없이 아이와 계속 기다린다', desc: '기관 보고 없이 대기만 하는 것은 부적절', score: 3 },
        { label: '가까운 이웃에게 아이를 맡긴다', desc: '허가받지 않은 제3자에게 아동 위탁 불가', score: 1 },
      ],
      maxScore: 10, correctIdx: 1,
      feedback: {
        correct: '✅ 완벽한 대응입니다! 아이를 안심시키며 비상연락처 → 의뢰 기관 순으로 연락하고 자리를 지키는 것이 올바른 절차입니다.',
        wrong: '⚠️ 보호자 귀가 지연 시 아이를 안심시키고 비상연락처·의뢰 기관에 연락하며 자리를 지켜야 합니다.',
      },
    },
    {
      id: 'E-02', type: 'scenario', category: '위기대응',
      text: '보호자가 귀가했는데 술에 취한 상태입니다. 아이를 인계해야 하는 상황입니다.',
      hint: '🍺 보호자 음주 귀가 상황입니다. 아이 안전이 최우선입니다.',
      options: [
        { label: '보호자가 왔으니 바로 아이를 인계하고 퇴근한다', desc: '음주 보호자 인계는 아동 안전 위협', score: 0 },
        { label: '보호자 상태를 확인하고, 아이 안전 우려 시 비상연락처에 연락하거나 귀가를 늦춘다', desc: '아이 안전 최우선 판단', score: 10 },
        { label: '보호자에게 술 마신 것을 지적하고 주의를 준다', desc: '갈등 유발, 돌봄이 역할 범위 초과', score: 3 },
        { label: '아이를 옆집에 잠시 맡긴다', desc: '허가 없는 제3자 위탁 불가', score: 1 },
      ],
      maxScore: 10, correctIdx: 1,
      feedback: {
        correct: '✅ 정확합니다! 음주 상태의 보호자에게 즉시 인계하는 것은 아동 안전을 위협할 수 있습니다.',
        wrong: '⚠️ 음주 상태의 보호자에게 즉시 인계하는 것은 위험합니다. 아이 안전을 최우선으로 판단해야 합니다.',
      },
    },
    {
      id: 'E-03', type: 'scenario', category: '위기대응',
      text: '돌봄 중 아이가 뛰다 넘어져 이마에 혹이 생겼습니다. 아이는 울다가 금방 괜찮아졌습니다.',
      hint: '🏃 돌봄 중 경미한 사고 발생 상황입니다.',
      options: [
        { label: '아이가 괜찮으니 보호자에게 굳이 알리지 않는다', desc: '사고 은폐는 신뢰 훼손', score: 0 },
        { label: '보호자 귀가 시 말로만 전달한다', desc: '기록 없는 구두 전달은 추후 분쟁 위험', score: 3 },
        { label: '즉시 보호자에게 연락하고 사진·상황 경위를 문자로 기록해 공유한다', desc: '투명한 보고 + 기록 보존', score: 10 },
        { label: '아이에게 보호자에게 말하지 말자고 한다', desc: '아동에게 비밀 강요, 절대 금지', score: 0 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 아무리 경미한 사고라도 즉시 보호자에게 연락하고 기록으로 남겨야 합니다.',
        wrong: '⚠️ 경미한 사고도 반드시 보호자에게 즉시 연락하고 사진·경위를 기록으로 공유해야 합니다.',
      },
    },
    {
      id: 'E-04', type: 'scenario', category: '위기대응',
      text: '보호자가 "아이가 졸리면 차 뒷좌석에 그냥 눕혀서 재워도 된다"고 지시했습니다.',
      hint: '🚗 보호자 지시와 안전 원칙 충돌 상황입니다.',
      options: [
        { label: '보호자의 지시이므로 그대로 따른다', desc: '카시트 미착용 도로교통법 위반', score: 0 },
        { label: '어색하지만 일단 따르고 나중에 물어본다', desc: '명백한 안전 위반 묵인', score: 1 },
        { label: '카시트 미착용은 안전 원칙 위반임을 정중히 설명하고 대안을 제안한다', desc: '안전 원칙 수호 + 보호자 소통', score: 10 },
        { label: '짧은 거리라면 괜찮으니 보호자 지시를 따른다', desc: '거리 무관, 법적 의무 위반', score: 2 },
      ],
      maxScore: 10, correctIdx: 2,
      feedback: {
        correct: '✅ 정확합니다! 카시트 미착용은 법적 의무 위반이자 아동 안전 위협입니다.',
        wrong: '⚠️ 카시트 미착용은 도로교통법 위반이자 아동 안전 위협입니다. 보호자 지시라도 정중히 거절하고 대안을 제안해야 합니다.',
      },
    },
  ],
}

// ── 레벨 정의 ──────────────────────────────────────
export interface LevelDef {
  min: number
  max: number
  num: number
  icon: string
  label: string
  title: string
  cssClass: string
  /** HTML 없이 순수 텍스트 — dangerouslySetInnerHTML 사용 불필요 */
  descText: string
  next: string[]
}

export const LEVELS: LevelDef[] = [
  {
    min: 0, max: 29, num: 1, icon: '🌱', label: 'Lv.1', title: '돌봄 입문자', cssClass: 'lv1',
    descText: '아이돌봄에 관심은 있지만 아직 자격과 경험이 부족한 단계입니다.',
    next: ['아이돌보미 양성 교육(기본 80시간) 등록하기', '한국건강가정진흥원 아이돌봄 서비스 포털 가입 및 교육 신청', '응급처치 기초 교육(소방서·적십자사 무료) 이수'],
  },
  {
    min: 30, max: 49, num: 2, icon: '🌿', label: 'Lv.2', title: '초급 돌봄이', cssClass: 'lv2',
    descText: '기초 자격과 일부 경험을 갖추고 있습니다. 다양한 상황 대처 능력을 더 키우면 한 단계 올라설 수 있어요.',
    next: ['보수 교육 및 심화 과정 이수하기', '영아종합형 자격 취득 검토', '응급처치 자격증 취득 목표 세우기'],
  },
  {
    min: 50, max: 69, num: 3, icon: '🌳', label: 'Lv.3', title: '중급 돌봄이', cssClass: 'lv3',
    descText: '자격과 경험을 고루 갖춘 안정적인 돌봄이입니다.',
    next: ['취약 분야(응급처치·특수 돌봄) 집중 보수 교육 수강', '연간 보수 교육 꾸준히 이수하기', '상위 자격(보육교사 2급 등) 취득 검토'],
  },
  {
    min: 70, max: 84, num: 4, icon: '🌟', label: 'Lv.4', title: '고급 돌봄이', cssClass: 'lv4',
    descText: '높은 수준의 자격과 실전 대처 능력을 갖추고 있습니다.',
    next: ['아이돌봄 서비스 전문 인력으로 등록·활동 시작', '후배 돌봄이 멘토링 참여 검토', '자격 갱신 및 포트폴리오 정기 업데이트'],
  },
  {
    min: 85, max: 100, num: 5, icon: '👑', label: 'Lv.5', title: '전문 돌봄이', cssClass: 'lv5',
    descText: '최고 수준의 자격과 완성도 높은 상황 대처 능력을 보유하고 있습니다.',
    next: ['고급 돌봄 서비스 제공자로서 프리미엄 플랫폼 등록', '돌봄 교육 강사·멘토로서 활동 검토', '자격 포트폴리오 디지털화 및 정기 홍보'],
  },
]

// ── 돌봄 타입 ──────────────────────────────────────
export interface CareTypeDef {
  code: string
  label: string
  fullLabel: string
  color: string
  summary: string
  strengths: string[]
  matchDesc: string
  compound?: boolean
}

export const CARE_TYPES: Record<string, CareTypeDef> = {
  ACT: {
    code: 'ACT', label: '활동형', fullLabel: '활동형 돌봄이',
    color: '#D85A3A',
    summary: '신체 활동과 야외 놀이를 통해 아이의 에너지를 긍정적으로 발산시키는 데 능숙합니다.',
    strengths: ['신체 발달 지원', '야외 활동 안전 관리', '활발한 상호작용'],
    matchDesc: '활동적인 유아·초등 가정, 에너지 넘치는 아이에게 잘 맞습니다.',
  },
  CAL: {
    code: 'CAL', label: '차분형', fullLabel: '차분형 돌봄이',
    color: '#3A9E94',
    summary: '아이의 감정을 세심하게 읽고 안정적인 정서 환경을 만드는 데 탁월합니다.',
    strengths: ['정서적 안정감 제공', '공감·경청 능력', '세심한 관찰'],
    matchDesc: '내성적이거나 민감한 아이, 감성적 돌봄을 원하는 가정에 잘 맞습니다.',
  },
  EDU: {
    code: 'EDU', label: '교육형', fullLabel: '교육형 돌봄이',
    color: '#4A9FCC',
    summary: '체계적인 학습 놀이와 발달 자극을 통해 아이의 성장을 이끌어냅니다.',
    strengths: ['학습 지원', '규칙·일과 관리', '발달 수준 맞춤 활동'],
    matchDesc: '학습 병행을 원하는 가정, 규칙적인 생활 패턴이 필요한 아이에게 잘 맞습니다.',
  },
  CRE: {
    code: 'CRE', label: '창의형', fullLabel: '창의형 돌봄이',
    color: '#8B4EAB',
    summary: '미술, 역할 놀이, 스토리텔링으로 아이의 창의력과 상상력을 키워줍니다.',
    strengths: ['창의적 활동 기획', '상상력 자극', '예술적 표현 지원'],
    matchDesc: '예술적 자극을 원하는 가정, 상상력이 풍부한 아이에게 잘 맞습니다.',
  },
}

// ── 지역 데이터 ────────────────────────────────────
export const REGIONS: Record<string, string[]> = {
  '서울특별시': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  '부산광역시': ['강서구','금정구','기장군','남구','동구','동래구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  '대구광역시': ['군위군','남구','달서구','달성군','동구','북구','서구','수성구','중구'],
  '인천광역시': ['강화군','계양구','남동구','동구','미추홀구','부평구','서구','연수구','옹진군','중구'],
  '광주광역시': ['광산구','남구','동구','북구','서구'],
  '대전광역시': ['대덕구','동구','서구','유성구','중구'],
  '울산광역시': ['남구','동구','북구','울주군','중구'],
  '세종특별자치시': ['세종시 전체'],
  '경기도': ['가평군','고양시','과천시','광명시','광주시','구리시','군포시','김포시','남양주시','동두천시','부천시','성남시','수원시','시흥시','안산시','안성시','안양시','양주시','양평군','여주시','연천군','오산시','용인시','의왕시','의정부시','이천시','파주시','평택시','포천시','하남시','화성시'],
  '강원특별자치도': ['강릉시','고성군','동해시','삼척시','속초시','양구군','양양군','영월군','원주시','인제군','정선군','철원군','춘천시','태백시','평창군','홍천군','화천군','횡성군'],
  '충청북도': ['괴산군','단양군','보은군','영동군','옥천군','음성군','제천시','증평군','진천군','청주시','충주시'],
  '충청남도': ['계룡시','공주시','금산군','논산시','당진시','보령시','부여군','서산시','서천군','아산시','예산군','천안시','청양군','태안군','홍성군'],
  '전북특별자치도': ['고창군','군산시','김제시','남원시','무주군','부안군','순창군','완주군','익산시','임실군','장수군','전주시','정읍시','진안군'],
  '전라남도': ['강진군','고흥군','곡성군','광양시','구례군','나주시','담양군','목포시','무안군','보성군','순천시','신안군','여수시','영광군','영암군','완도군','장성군','장흥군','진도군','함평군','해남군','화순군'],
  '경상북도': ['경산시','경주시','고령군','구미시','김천시','문경시','봉화군','상주시','성주군','안동시','영덕군','영양군','영주시','영천시','예천군','울릉군','울진군','의성군','청도군','청송군','칠곡군','포항시'],
  '경상남도': ['거제시','거창군','고성군','김해시','남해군','밀양시','사천시','산청군','양산시','의령군','진주시','창녕군','창원시','통영시','하동군','함안군','함양군','합천군'],
  '제주특별자치도': ['서귀포시','제주시'],
}

// ── 유틸리티 ──────────────────────────────────────
export function buildQuestionSet(): Question[] {
  const scenarios = Object.values(SCENARIO_BANK).map(
    (cat) => cat[Math.floor(Math.random() * cat.length)]
  )
  return [...SURVEY_QUESTIONS, ...scenarios]
}

export function calcCareType(
  questions: Question[],
  answers: (number | null)[]
): CareTypeDef {
  const tally: Record<string, number> = { ACT: 0, CAL: 0, EDU: 0, CRE: 0 }
  questions.forEach((q, i) => {
    if (q.isType && answers[i] !== null) {
      const tag = q.options[answers[i] as number]?.typeTag
      if (tag && tag in tally) tally[tag]++
    }
  })
  const max = Math.max(...Object.values(tally))
  if (max === 0) return { ...CARE_TYPES['CAL'], compound: false }
  const winners = Object.keys(tally).filter((k) => tally[k] === max)
  if (winners.length === 1) return { ...CARE_TYPES[winners[0]], compound: false }

  // 복합 타입 (동점)
  const primary = CARE_TYPES[winners[0]]
  const secondary = CARE_TYPES[winners[1]]
  return {
    code: winners[0],
    label: `${primary.label}·${secondary.label}형`,
    fullLabel: `${primary.label}·${secondary.label}형 돌봄이`,
    color: primary.color,
    summary: `${primary.summary} 동시에 ${secondary.summary.replace(/합니다\.$/, '는 면도 가집니다.')}`,
    strengths: [...primary.strengths.slice(0, 2), ...secondary.strengths.slice(0, 1)],
    matchDesc: primary.matchDesc,
    compound: true,
  }
}

export function getLevel(totalScore: number): LevelDef {
  return LEVELS.find((l) => totalScore >= l.min && totalScore <= l.max) ?? LEVELS[0]
}

export function calcScores(questions: Question[], answers: (number | null)[]) {
  const maxSurvey = SURVEY_QUESTIONS.reduce((s, q) => s + q.maxScore, 0)
  let rawSurvey = 0
  let rawScenario = 0
  questions.forEach((q, i) => {
    if (answers[i] === null) return
    if (q.type === 'survey') rawSurvey += q.options[answers[i] as number].score
    else rawScenario += q.options[answers[i] as number].score
  })
  const surveyNorm = Math.round((rawSurvey / maxSurvey) * 50)
  const scenarioNorm = Math.round((rawScenario / 50) * 50)
  return { surveyNorm, scenarioNorm, total: surveyNorm + scenarioNorm }
}
