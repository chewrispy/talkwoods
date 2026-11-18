import { INSECTS } from '../data/insects.js';

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
            <div class="dex-title">곤충 도감</div>
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
    this.sub.textContent = `${this.found} / ${INSECTS.length}종 발견`;
    this.list.innerHTML = INSECTS.map((t) => {
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
