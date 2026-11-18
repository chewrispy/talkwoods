import { INSECTS } from '../data/insects.js';
import { ANIMALS, HEARTS_TO_FRIEND, ANIMAL_BY_ID } from '../data/animals.js';
import { RECIPES, recipeFor } from '../data/recipes.js';
import { josa } from '../util/josa.js';
import { levelFor, traitsFor, totalCaught, nextLevelAt, MAX_LEVEL, MARK_TRAITS, MARK_TRAIT_COUNT } from '../data/growth.js';

export class Dex {
  constructor(root, save, { onOpen, onClose }) {
    this.save = save;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.el = document.createElement('div');
    this.el.className = 'dex';
    this.el.innerHTML = `
      <div class="dex-book">
        <div class="dex-head">
          <div>
            <div class="dex-title">숲 수첩</div>
            <div class="dex-sub"></div>
          </div>
          <button class="dex-close" type="button" aria-label="닫기">✕</button>
        </div>
        <div class="dex-list"></div>
      </div>
    `;
    root.appendChild(this.el);
    this.list = this.el.querySelector('.dex-list');
    this.sub = this.el.querySelector('.dex-sub');
    this.el.querySelector('.dex-close').addEventListener('click', () => this.close());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
    });
    this.render();
  }

  get found() {
    return INSECTS.filter((t) => this.save.caught[t.id] > 0).length;
  }

  render() {
    this.sub.textContent = `곤충 ${this.found} / ${INSECTS.length}종 발견`;
    const bugs = INSECTS.map((t) => {
      const n = this.save.caught[t.id] || 0;
      if (!n) {
        return `
          <div class="dex-card unknown">
            <div class="dex-mark">?</div>
            <div class="dex-body">
              <div class="dex-name">???</div>
              <div class="dex-desc">${t.hint}</div>
            </div>
          </div>`;
      }
      return `
        <div class="dex-card">
          <div class="dex-mark" style="--c:${t.color}">${t.mark}</div>
          <div class="dex-body">
            <div class="dex-name">${t.name} <span class="dex-n">× ${n}</span></div>
            <div class="dex-desc">${t.desc}</div>
            <div class="dex-meta">${t.time === 'night' ? '🌙 밤' : t.time === 'day' ? '☀️ 낮' : '하루 종일'}</div>
          </div>
        </div>`;
    }).join('');

    const friends = ANIMALS.map((a) => {
      const met = this.save.met[a.id];
      const h = this.save.hearts[a.id] || 0;
      if (!met) {
        return `<div class="dex-card unknown"><div class="dex-mark">?</div><div class="dex-body"><div class="dex-name">???</div><div class="dex-desc">숲 어딘가에서 누군가 혼잣말을 하고 있어요.</div></div></div>`;
      }
      const like = INSECTS.find((t) => t.id === a.likes);
      const hearts = Array.from({ length: HEARTS_TO_FRIEND }, (_, i) => (i < h ? '♥' : '♡')).join('');
      const likeText = h > 0 ? `좋아하는 선물: ${like.name} ${like.mark}` : '좋아하는 선물: 아직 몰라요';
      return `<div class="dex-card"><div class="dex-mark" style="--c:${a.color}">${a.name[0]}</div><div class="dex-body">
          <div class="dex-name">${a.name} <span class="dex-n">${a.kind}</span></div>
          <div class="dex-desc">${a.desc}</div>
          <div class="dex-meta"><span class="dex-hearts">${hearts}</span>${h >= HEARTS_TO_FRIEND ? ' 친구!' : ''} · ${likeText}</div>
        </div></div>`;
    }).join('');

    const lv = levelFor(this.save);
    const next = nextLevelAt(this.save);
    const total = totalCaught(this.save);
    const traits = traitsFor(this.save);
    const markHints = Object.entries(MARK_TRAITS)
      .filter(([id, m]) => !traits.some((t) => t.trait === m.trait) && this.save.caught[id] > 0)
      .map(([id, m]) => `${m.mark} ${this.save.caught[id]}/${MARK_TRAIT_COUNT}`)
      .join(' · ');
    const sprout = `<div class="dex-card sprout"><div class="dex-mark" style="--c:#6fbf4a">🌱</div><div class="dex-body">
        <div class="dex-name">나의 새싹 <span class="dex-n">Lv.${lv}${lv >= MAX_LEVEL ? ' (최고)' : ''}</span></div>
        <div class="dex-desc">${next ? `곤충을 ${next - total}마리 더 잡으면 자라요.` : '꽃봉오리가 맺혔어요!'}</div>
        <div class="dex-meta">${traits.length ? '생긴 잎: ' + traits.map((t) => t.name).join(', ') : '어떤 잎이 날지는 무엇을 모으고 누구와 친해지느냐에 달려 있어요.'}</div>
        ${markHints ? `<div class="dex-meta">다음 잎까지: ${markHints}</div>` : ''}
      </div></div>`;

    // 문장 요리책
    const known = Object.keys(this.save.recipes);
    const cards = known.map((text) => {
      const r = recipeFor(text);
      const fan = r.fan ? ANIMAL_BY_ID[r.fan] : null;
      return `<div class="dex-card"><div class="dex-mark recipe">“”</div><div class="dex-body">
          <div class="dex-name">${text} <span class="dex-n">${r.name}</span></div>
          <div class="dex-desc">${r.desc}</div>
          ${fan ? `<div class="dex-meta">♥ ${josa(fan.name, '가', '이')} 제일 좋아하는 문장</div>` : ''}
        </div></div>`;
    });
    const hints = RECIPES.filter((r) => r.fan && !this.save.recipes[r.text] && this.save.met[r.fan]).map((r) => {
      const fan = ANIMAL_BY_ID[r.fan];
      return `<div class="dex-card unknown"><div class="dex-mark">“”</div><div class="dex-body"><div class="dex-name">???</div>
          <div class="dex-desc">${josa(fan.name, '가', '이')} 좋아할 것 같은 문장. 「${fan.word}」 카드에 무언가를 넣어보세요.</div></div></div>`;
    });
    const recipeHtml = cards.length || hints.length
      ? cards.join('') + hints.join('')
      : '<div class="dex-card unknown"><div class="dex-body"><div class="dex-desc">출발 지점 근처 문장 냄비에서 단어와 문장부호를 끓여보세요.</div></div></div>';

    this.list.innerHTML = `
      <div class="dex-section">나의 새싹</div>${sprout}
      <div class="dex-section">곤충 도감</div>${bugs}
      <div class="dex-section">숲 친구들</div>${friends}
      <div class="dex-section">문장 요리책 · ${known.length}</div>${recipeHtml}`;
  }

  open() {
    this.render();
    this.el.classList.add('on');
    this.onOpen?.();
  }

  close() {
    this.el.classList.remove('on');
    this.onClose?.();
  }
}
