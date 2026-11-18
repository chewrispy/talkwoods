import { INSECTS } from '../data/insects.js';
import { HEARTS_TO_FRIEND } from '../data/animals.js';

// 동물 친구와 대화하는 창
export class Dialogue {
  constructor(root, { save, onGift, onTalk, onClose }) {
    this.save = save;
    this.onGift = onGift;
    this.onTalk = onTalk;
    this.onClose = onClose;
    this.animal = null;
    this.el = document.createElement('div');
    this.el.className = 'dialogue';
    this.el.innerHTML = `
      <div class="dlg-box">
        <div class="dlg-head">
          <div class="dlg-name"></div>
          <div class="dlg-hearts"></div>
        </div>
        <div class="dlg-line"></div>
        <div class="dlg-gifts"></div>
        <div class="dlg-actions">
          <button type="button" class="dlg-talk">또 말 걸기</button>
          <button type="button" class="dlg-bye">안녕!</button>
        </div>
      </div>
    `;
    root.appendChild(this.el);
    this.nameEl = this.el.querySelector('.dlg-name');
    this.heartsEl = this.el.querySelector('.dlg-hearts');
    this.lineEl = this.el.querySelector('.dlg-line');
    this.giftsEl = this.el.querySelector('.dlg-gifts');
    this.el.querySelector('.dlg-talk').addEventListener('click', () => this.onTalk(this.animal));
    this.el.querySelector('.dlg-bye').addEventListener('click', () => this.close());
    this.giftsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-gift]');
      if (b && !b.disabled) this.onGift(this.animal, b.dataset.gift);
    });
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  get isOpen() {
    return this.el.classList.contains('on');
  }

  open(animal, line) {
    this.animal = animal;
    this.el.classList.add('on');
    this.render(line);
  }

  render(line) {
    const a = this.animal.data;
    const hearts = this.save.hearts[a.id] || 0;
    const friend = hearts >= HEARTS_TO_FRIEND;
    this.nameEl.innerHTML = `${a.name} <span class="dlg-kind">${a.kind}</span>${friend ? ' <span class="dlg-friend">친구</span>' : ''}`;
    this.heartsEl.textContent = Array.from({ length: HEARTS_TO_FRIEND }, (_, i) => (i < hearts ? '♥' : '♡')).join('');
    if (line !== undefined) {
      this.lineEl.textContent = line;
      this.lineEl.classList.remove('pop');
      void this.lineEl.offsetWidth;
      this.lineEl.classList.add('pop');
    }
    const items = INSECTS.map((t) => {
      const n = this.save.inventory[t.id] || 0;
      const known = (this.save.caught[t.id] || 0) > 0;
      if (!known) return '';
      return `<button type="button" data-gift="${t.id}" ${n ? '' : 'disabled'}>
          <b>${t.mark}</b> ${t.name} <span>×${n}</span>
        </button>`;
    }).join('');
    this.giftsEl.innerHTML = items
      ? `<div class="dlg-gift-label">선물하기</div><div class="dlg-gift-row">${items}</div>`
      : `<div class="dlg-gift-label">곤충을 잡으면 선물할 수 있어요</div>`;
  }

  close() {
    if (!this.isOpen) return;
    this.el.classList.remove('on');
    const a = this.animal;
    this.animal = null;
    this.onClose(a);
  }
}
