const KEY = 'talkwoods.save.v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { caught: data.caught || {}, firstCaughtAt: data.firstCaughtAt || {} };
    }
  } catch (e) {
    /* 저장소를 쓸 수 없는 환경이면 새로 시작 */
  }
  return { caught: {}, firstCaughtAt: {} };
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch (e) {
    /* 저장 실패해도 게임은 계속 */
  }
}
