// 동물 친구 데이터
//  - spot: 숲 맵(world/forest.js)의 ZONES 이름 (이 자리엔 나무가 안 자라요)
//  - lines: 말 걸 때 대사. escalate: true면 연달아 말 걸수록 다음 대사로 넘어가요.
//  - likes: 좋아하는 문장부호 곤충 id (선물하면 하트 +1)
//  - trait: 친구가 되면 새싹에 생기는 잎 모양 (player/sprout.js)

export const HEARTS_TO_FRIEND = 3;

export const ANIMALS = [
  {
    id: 'grotta',
    name: '그로타',
    en: 'Crota',
    kind: '맞장구 새',
    spot: 'grottaHill',
    model: 'bigBird',
    color: '#f2c14e',
    lines: ['그ㄹㄹ로타!', '맞아 맞아!', '그렇지 그렇지!', '완전 그 말이야!', '그ㄹㄹㄹㄹ로타!!'],
    escalate: false,
    likes: 'ant',
    reactions: {
      like: '느낌표다!!! 그ㄹㄹ로타!!! 너 말 진짜 잘한다!',
      other: '오 그것도 좋지! 그ㄹ로타~',
    },
    friendLine: '우리 이제 친구야! 네가 무슨 말을 해도 다 맞장구 쳐줄게. 그ㄹㄹ로타!',
    desc: '무슨 말을 해도 무한 맞장구를 쳐주는 커다란 새.',
    trait: 'feather',
    traitName: '깃털 잎',
  },
  {
    id: 'anyong',
    name: '아뇽',
    en: 'Anyong',
    kind: '아니라는 새',
    spot: 'anyongPerch',
    model: 'smallBird',
    color: '#8fbbe8',
    lines: ['아뇨.', '아니에요!', '아닙니다!!!'],
    escalate: true,
    likes: 'butterfly',
    reactions: {
      like: '물음표…? 아뇨! 아니… 사실 좀 좋아요.',
      other: '아뇨. 그건 아니에요.',
    },
    friendLine: '친구냐고요? 아뇨! …아니, 네. 친구 맞아요.',
    desc: '뭐든 일단 "아뇨"부터 하는 작은 새. 그로타의 짝꿍.',
    trait: 'notch',
    traitName: '단호한 잎',
  },
  {
    id: 'grellsdo',
    name: '그럴스도',
    en: 'Grellsdo',
    kind: '나무늘보',
    spot: 'slothNook',
    model: 'sloth',
    color: '#9a7b5c',
    lines: ['그럴 수도 있지~', '괜찮아~ 그럴 수도 있지~', '음… 그럴 수도…', 'zzz… 그럴 수도…'],
    escalate: false,
    likes: 'firefly',
    reactions: {
      like: '말줄임표구나… 좋다… 천천히… 고마워…',
      other: '이것도… 그럴 수도 있지~',
    },
    friendLine: '우리… 친구… 그럴 수도 있지~ 아니, 친구 맞아~',
    desc: '모든 말을 "그럴 수도 있지~"로 흘려보내는 느긋한 나무늘보.',
    trait: 'droopy',
    traitName: '느긋한 잎',
  },
];
