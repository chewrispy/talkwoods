import { ANIMALS, HEARTS_TO_FRIEND } from './animals.js';

// 새싹 레벨: 지금까지 잡은 곤충 총 수 기준
export const LEVEL_THRESHOLDS = [0, 3, 8, 15, 25];
export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

// 문장부호 곤충을 이만큼 모으면 새싹에 특성이 생겨요
export const MARK_TRAIT_COUNT = 3;
export const MARK_TRAITS = {
  ant: { trait: 'bang', name: '뾰족 잎', mark: '!' },
  butterfly: { trait: 'curl', name: '물음표 덩굴', mark: '?' },
  firefly: { trait: 'glow', name: '빛 방울', mark: '…' },
};

export function totalCaught(save) {
  return Object.values(save.caught).reduce((a, b) => a + b, 0);
}

export function levelFor(save) {
  const total = totalCaught(save);
  let lv = 0;
  for (const t of LEVEL_THRESHOLDS) if (total >= t) lv++;
  return lv;
}

export function nextLevelAt(save) {
  const lv = levelFor(save);
  return lv >= MAX_LEVEL ? null : LEVEL_THRESHOLDS[lv];
}

export function traitsFor(save) {
  const list = [];
  for (const id in MARK_TRAITS) {
    if ((save.caught[id] || 0) >= MARK_TRAIT_COUNT) list.push({ ...MARK_TRAITS[id], source: id });
  }
  for (const a of ANIMALS) {
    if ((save.hearts[a.id] || 0) >= HEARTS_TO_FRIEND) list.push({ trait: a.trait, name: a.traitName, source: a.id, friend: a.name });
  }
  return list;
}

export function growthKey(save) {
  return `${levelFor(save)}|${traitsFor(save).map((t) => t.trait).join(',')}`;
}
