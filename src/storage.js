const KEY = 'talkwoods.save.v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const caught = data.caught || {};
      return {
        caught,
        firstCaughtAt: data.firstCaughtAt || {},
        // 예전 저장에는 가방이 없어서, 잡은 만큼 채워줘요
        inventory: data.inventory || { ...caught },
        hearts: data.hearts || {},
        met: data.met || {},
      };
    }
  } catch (e) {
    /* 저장소를 쓸 수 없는 환경이면 새로 시작 */
  }
  return { caught: {}, firstCaughtAt: {}, inventory: {}, hearts: {}, met: {} };
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch (e) {
    /* 저장 실패해도 게임은 계속 */
  }
}
