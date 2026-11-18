import { AREAS } from '../data/areas.js';
import { ANIMALS } from '../data/animals.js';

// 숲길 표지판 화면
export class Travel {
  constructor(root, { save, onGo, onClose }) {
    this.save = save;
    this.onGo = onGo;
    this.onClose = onClose;
    this.current = 'catchup';
    this.el = document.createElement('div');
    this.el.className = 'dex travel';
    this.el.innerHTML = `
      <div class="dex-book">
        <div class="dex-head">
          <div>
            <div class="dex-title">숲길 표지판</div>
            <div class="dex-sub">대화의 형태에 따라 숲이 나뉘어 있어요</div>
          </div>
          <button class="dex-close" type="button" aria-label="닫기">✕</button>
        </div>
        <div class="dex-list"></div>
      </div>
    `;
    root.appendChild(this.el);
    this.list = this.el.querySelector('.dex-list');
    this.el.querySelector('.dex-close').addEventListener('click', () => this.close());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
      const b = e.target.closest('[data-go]');
      if (b) {
        this.el.classList.remove('on');
        this.onGo(b.dataset.go);
      }
    });
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  get isOpen() {
    return this.el.classList.contains('on');
  }

  open(current) {
    this.current = current;
    this.list.innerHTML = AREAS.map((a) => {
      const natives = ANIMALS.filter((x) => (x.area || 'catchup') === a.id);
      const met = natives.filter((x) => this.save.met[x.id]).length;
      const here = a.id === current;
      const action = !a.ready
        ? '<span class="tr-soon">준비 중</span>'
        : here
          ? '<span class="tr-here">지금 여기</span>'
          : `<button type="button" class="tr-go" data-go="${a.id}">가기</button>`;
      return `<div class="dex-card ${a.ready ? '' : 'unknown'}">
          <div class="dex-body">
            <div class="dex-name">${a.name} <span class="dex-n">${a.en}</span></div>
            <div class="dex-desc">${a.ready ? a.blurb : '아직 길이 나지 않았어요.'}</div>
            ${a.ready ? `<div class="dex-meta">만난 친구 ${met} / ${natives.length}</div>` : ''}
          </div>
          <div class="tr-act">${action}</div>
        </div>`;
    }).join('');
    this.el.classList.add('on');
  }

  close() {
    if (!this.isOpen) return;
    this.el.classList.remove('on');
    this.onClose();
  }
}
