// 문장부호 곤충 데이터
// 새 곤충을 추가하려면 이 배열에 항목을 하나 더 넣으면 돼요.
//  - time: 'day' | 'night' | 'any'
//  - zone: 숲 맵(world/forest.js)의 ZONES 이름
//  - behavior: 'crawl'(땅 기어다니기) | 'flutter'(팔랑팔랑) | 'float'(둥실둥실 빛나기)

export const INSECTS = [
  {
    id: 'ant',
    name: '개미',
    mark: '!',
    time: 'day',
    zone: 'stumps',
    behavior: 'crawl',
    count: 6,
    color: '#3a2a1e',
    desc: '한 마리가 느낌표 하나. 여럿이 모이면 말에 힘이 실린다.',
    hint: '낮에 그루터기 근처 땅을 잘 살펴보세요.',
  },
  {
    id: 'butterfly',
    name: '나비',
    mark: '?',
    time: 'day',
    zone: 'meadow',
    behavior: 'flutter',
    count: 5,
    color: '#f2a7c3',
    desc: '¿? 모양 날개로 팔랑이며 대답을 재촉한다.',
    hint: '햇살 좋은 낮, 꽃밭 위를 날아다닌대요.',
  },
  {
    id: 'firefly',
    name: '반딧불이',
    mark: '…',
    time: 'night',
    zone: 'pond',
    behavior: 'float',
    count: 7,
    color: '#e8ff8a',
    desc: '아련하고 흐릿한 빛. 말끝을 흐려 상대를 애타게 만든다.',
    hint: '밤이 되면 연못가에 작은 빛이 떠오른대요.',
  },
];
