// 말투 열매와 시간대별 말투
// 도감: 네모네모(내가 하는 말) · 세모(내가 듣는 말) · 동글동글(둘 다)

export const FRUIT_SECONDS = 60;
export const FRUIT_RESPAWN = 45;

export const FRUITS = [
  {
    id: 'nemo',
    area: 'catchup',
    name: '네모네모 열매',
    icon: '◼',
    shape: 'box',
    color: '#e8603c',
    spot: 'nemoBush',
    affects: '내가 하는 말',
    desc: '말투가 네모지게, 즉 공격적으로 변해요.',
  },
  {
    id: 'semo',
    area: 'catchup',
    name: '세모 열매',
    icon: '▲',
    shape: 'cone',
    color: '#d6c83a',
    spot: 'semoBush',
    affects: '내가 듣는 말',
    desc: '뾰족하게 삐지듯 남의 말을 곡해해요.',
  },
  {
    id: 'donggeul',
    area: 'catchup',
    name: '동글동글 열매',
    icon: '●',
    shape: 'sphere',
    color: '#f49ac1',
    spot: 'donggeulBush',
    affects: '둘 다',
    desc: '말투가 둥글어지고 모든 말을 둥글게 받아들여요.',
  },
  {
    id: 'sogon',
    area: 'whisper',
    name: '소곤 버섯',
    icon: '🍄',
    shape: 'mushroom',
    color: '#c9a6ff',
    spot: 'sogonA',
    spots: ['sogonA', 'sogonB', 'sogonC'],
    affects: '내 목소리',
    desc: '먹으면 목소리가 귓속말이 돼요. 친구들이 다가와 비밀 단어와 속마음을 알려줘요.',
  },
];

export const FRUIT_BY_ID = Object.fromEntries(FRUITS.map((f) => [f.id, f]));

// 내가 하는 말
export const MY_LINES = {
  normal: ['안녕!', '뭐 하고 있어?', '오늘 기분 어때?', '같이 놀자!', '여기 좋다~'],
  nemo: ['야. 뭐해.', '빨리 말해.', '그래서 뭐.', '대답 안 해?', '비켜봐.'],
  donggeul: ['안녕~ 오늘도 반가워~', '천천히 얘기해도 괜찮아~', '네 얘기 듣는 거 좋아~', '오늘 하루 어땠어~?'],
  sunset: ['노을이 예쁘다… 너도.', '이 시간엔 왠지 마음이 몽글몽글해.', '노을 보면서 얘기하니까 좋다.', '하늘이 너 볼처럼 빨개졌어.'],
  sogon: ['(소곤) 나 비밀 하나 말해줄까?', '(소곤) 여기서만 하는 얘긴데…', '(소곤) 너한테만 물어볼게.', '(소곤) 아무한테도 말 안 할게.'],
  dawn: ['나 요즘 잘 살고 있는 걸까…', '새벽엔 괜히 생각이 많아져.', '너는 꿈이 뭐야…?', '이 시간엔 다들 무슨 생각 할까.'],
};

// 시간대별 말투가 나올 확률 (의도와 완전히 다르게 나가면 안 되니까 확률형)
export const TIME_TONE_CHANCE = 0.35;

// 네모 말투에 대한 친구들의 반응 (타입별)
export const NEMO_REACT = {
  긍정: '그… 그ㄹ로타…? (움찔)',
  부정: '아뇨! 그렇게 말하면 더 아니에요!',
  무력화: null, // 자기 대사 + (전혀 안 통한다)
  공격: '오, 좋아. 그럼 누가? 언제? 어디서? 제대로 붙어보자!',
  지원: '힝… 무서워…',
  협박: '그 말투를 순순히 거둔다면… 유혈사태는 없을 것이다.',
};

// 동글동글 말투에 대한 반응 (타입별)
export const DONGGEUL_REACT = {
  긍정: '그ㄹㄹ로타~ 너랑 얘기하면 기분 좋아~',
  부정: '아뇨~ …아니, 사실 좋아요~',
  무력화: null, // 자기 대사를 더 둥글게
  공격: '음… 오늘은 안 따질게. 왜냐하면… 기분이 좋으니까~',
  지원: '히힝~ 기분 좋아~',
  협박: '순순히… 아니, 그냥 다 줄게~',
};

// 세모 열매: 친구 말이 이렇게 들려요
export const SEMO_TWISTS = [
  '흥, 그 말 하려고 불렀어?',
  '지금 나 놀리는 거지?',
  '내가 그렇게 별로야?',
  '아~ 그러셔?',
  '말투가 왜 그래?',
  '그래서 나보고 어쩌라고?',
  '됐어, 신경 꺼.',
];

export const SUNSET_TAG = '(노을 때문인지 볼이 살짝 빨개졌다)';
export const DAWN_TAG = '(새벽 감성에 같이 젖었다)';
