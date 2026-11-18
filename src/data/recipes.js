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
  { text: '그래ㅋ', name: '비웃는 맞장구', desc: 'ㅋ 하나로 맞장구가 순식간에 비아냥이 된다.' },
  { text: '아니ㅋ', name: '코웃음 거절', desc: '거절인데 웃음까지 섞어서 더 아프다.' },
  { text: '그래;', name: '식은땀 맞장구', desc: '맞는 말인지 모르겠지만 일단 동의.' },
  { text: '아니;;', name: '당황한 거절', desc: '아니라고는 했는데 땀이 난다.' },
  { text: '헤헤;', name: '어색한 웃음', desc: '분위기 수습용 웃음.' },
  { text: '오오@', name: '지목 추임새', desc: '추임새로 누군가를 콕 집어 부른다.' },
  { text: '왜ㅗ', name: '톡 쏘는 왜', desc: '질문인데 벌침이 달렸다.' },
  { text: '좋아…', name: '수줍은 고백', desc: '소곤 버섯에서 나온 단어로 만든 조용한 고백.' },
  { text: '고마워!', name: '진심 어린 고마워', desc: '퀘스트에서 그토록 듣고 싶던 그 말.' },
];

const FAV_NAMES = {
  grotta: { name: '힘찬 맞장구', desc: '듣는 사람의 어깨를 으쓱하게 만드는 한마디.' },
  anyong: { name: '되묻는 거절', desc: '아니라고 하면서 궁금해하는 복잡한 마음.' },
  grellsdo: { name: '느긋한 위로', desc: '모든 일을 천천히 흘려보내주는 문장.' },
  yukaguri: { name: '날카로운 질문', desc: '육하원칙의 마지막이자 가장 강한 질문.' },
  graeso: { name: '묵직한 되물음', desc: '다 듣고 나서 조용히 꺼내는 한마디.' },
  mar: { name: '삐진 한숨', desc: '알아달라는 신호. 우쭈쭈가 필요하다.' },
  sunhama: { name: '정중한 협박', desc: '평화를 지키기 위한 단호한 부탁.' },
  oeong: { name: '반짝 추임새', desc: '의견은 없지만 듣는 사람을 신나게 만드는 한마디.' },
  quokka: { name: '행복한 웃음', desc: '듣기만 해도 위로가 되는 소리. 가끔 돈이 든다.' },
  meerkat: { name: '메아리 도발', desc: '상대 말을 그대로 돌려주는 묘하게 열받는 문장.' },
  shibaem: { name: '시원한 한마디', desc: '내용은 없는데 속은 시원하다.' },
  jinjjanya: { name: '떼창 의심', desc: '혼자 하면 의심, 떼로 하면 공격.' },
};

export const RECIPES = [
  ...ANIMALS.map((a) => ({ text: a.favorite, ...FAV_NAMES[a.id], fan: a.id })),
  ...EXTRA,
];

export const RECIPE_BY_TEXT = Object.fromEntries(RECIPES.map((r) => [r.text, r]));

export function recipeFor(text) {
  return RECIPE_BY_TEXT[text] || { text, name: '소박한 문장', desc: '아직 이름이 없는 문장.' };
}
