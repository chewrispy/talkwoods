import { ANIMALS } from './animals.js';

// 문장 냄비: 단어 하나 + 문장부호 1~3개
export const MAX_MARKS = 3;

// 이름 붙은 요리. 동물 친구의 favorite 문장은 자동으로 들어가요.
const EXTRA = [
  { text: '그래?', name: '갸웃하는 맞장구', desc: '맞장구인데 살짝 의심이 섞였다.' },
  { text: '그래…', name: '체념한 맞장구', desc: '그래, 뭐… 그렇다고 하자.' },
  { text: '그래!!!', name: '폭발하는 맞장구', desc: '그로타가 들으면 기절할지도.' },
  { text: '아니!!!', name: '단호한 거절', desc: '아뇽이 세 번째로 화났을 때.' },
  { text: '아니…', name: '머뭇거리는 거절', desc: '아니라고는 했는데 확신은 없다.' },
  { text: '왜!', name: '따지는 왜', desc: '유카구리가 마지막에 외치는 말.' },
  { text: '왜…', name: '서운한 왜', desc: '대답을 듣고 싶지 않은 질문.' },
  { text: '힝!', name: '토라진 힝', desc: '삐졌다는 걸 꼭 알아줬으면 할 때.' },
  { text: '그래서…', name: '끝나지 않는 그래서', desc: '이야기가 아직 남았다는 뜻.' },
];

const FAV_NAMES = {
  grotta: { name: '힘찬 맞장구', desc: '듣는 사람의 어깨를 으쓱하게 만드는 한마디.' },
  anyong: { name: '되묻는 거절', desc: '아니라고 하면서 궁금해하는 복잡한 마음.' },
  grellsdo: { name: '느긋한 위로', desc: '모든 일을 천천히 흘려보내주는 문장.' },
  yukaguri: { name: '날카로운 질문', desc: '육하원칙의 마지막이자 가장 강한 질문.' },
  graeso: { name: '묵직한 되물음', desc: '다 듣고 나서 조용히 꺼내는 한마디.' },
  mar: { name: '삐진 한숨', desc: '알아달라는 신호. 우쭈쭈가 필요하다.' },
  sunhama: { name: '정중한 협박', desc: '평화를 지키기 위한 단호한 부탁.' },
};

export const RECIPES = [
  ...ANIMALS.map((a) => ({ text: a.favorite, ...FAV_NAMES[a.id], fan: a.id })),
  ...EXTRA,
];

export const RECIPE_BY_TEXT = Object.fromEntries(RECIPES.map((r) => [r.text, r]));

export function recipeFor(text) {
  return RECIPE_BY_TEXT[text] || { text, name: '소박한 문장', desc: '아직 이름이 없는 문장.' };
}
