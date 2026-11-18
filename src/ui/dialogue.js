import { INSECTS } from '../data/insects.js';
import { HEARTS_TO_FRIEND } from '../data/animals.js';

// 동물 친구와 대화하는 창
export class Dialogue {
  constructor(root, { save, onGift, onGiftSentence, onTalk, onFollow, onStay, onPat, onClose }) {
    this.save = save;
    this.handlers = { onGift, onGiftSentence, onTalk, onFollow, onStay, onPat, onClose };
    this.animal = null;
    this.el = document.createElement('div');
    this.el.className = 'dialogue';
    this.el.innerHTML = `
      <div class="dlg-box">
        <div class="dlg-head">
          <div class="dlg-name"></div>
          <div class="dlg-hearts"></div>
        </div>
        <div class="dlg-me"></div>
        <div class="dlg-line"></div>
        <div class="dlg-real"></div>
        <div class="dlg-gifts"></div>
        <div class="dlg-actions"></div>
      </div>
    `;
    root.appendChild(this.el);
    this.nameEl = this.el.querySelector('.dlg-name');
    this.heartsEl = this.el.querySelector('.dlg-hearts');
    this.lineEl = this.el.querySelector('.dlg-line');
    this.meEl = this.el.querySelector('.dlg-me');
    this.realEl = this.el.querySelector('.dlg-real');
    this.realEl.addEventListener('click', (e) => {
      if (e.target.closest('.dlg-reveal') && this.real) {
        this.realEl.innerHTML = `<span class="dlg-real-text">원래 한 말: “${this.real}”</span>`;
      }
    });
    this.giftsEl = this.el.querySelector('.dlg-gifts');
    this.actionsEl = this.el.querySelector('.dlg-actions');
    this.giftsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-gift]');
      if (b && !b.disabled) this.handlers.onGift(this.animal, b.dataset.gift);
      const s = e.target.closest('[data-sentence]');
      if (s && !s.disabled) this.handlers.onGiftSentence(this.animal, s.dataset.sentence);
    });
    this.actionsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'talk') this.handlers.onTalk(this.animal);
      if (act === 'follow') this.handlers.onFollow(this.animal);
      if (act === 'stay') this.handlers.onStay(this.animal);
      if (act === 'pat') this.handlers.onPat(this.animal);
      if (act === 'bye') this.close();
    });
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  get isOpen() {
    return this.el.classList.contains('on');
  }

  open(animal, line, extra) {
    this.animal = animal;
    this.el.classList.add('on');
    this.render(line, extra);
  }

  // extra: { me: 내가 한 말, tag: 말투 표시, real: 세모 열매일 때 진짜 대사 }
  render(line, extra = {}) {
    const a = this.animal.data;
    const hearts = this.save.hearts[a.id] || 0;
    const friend = hearts >= HEARTS_TO_FRIEND;
    this.nameEl.innerHTML = `${a.name} <span class="dlg-kind">${a.kind}</span>${friend ? ' <span class="dlg-friend">친구</span>' : ''}`;
    this.heartsEl.textContent = Array.from({ length: HEARTS_TO_FRIEND }, (_, i) => (i < hearts ? '♥' : '♡')).join('');
    if (line !== undefined) {
      this.meEl.innerHTML = extra.me ? `<span class="dlg-me-label">나</span> ${extra.me}${extra.tag ? ` <span class="dlg-tag">${extra.tag}</span>` : ''}` : '';
      this.real = extra.real || null;
      this.realEl.innerHTML = this.real ? '<button type="button" class="dlg-reveal">▲ 원래 뭐라고 했더라?</button>' : '';
      this.lineEl.textContent = line;
      this.lineEl.classList.remove('pop');
      void this.lineEl.offsetWidth;
      this.lineEl.classList.add('pop');
    }
    const bugs = INSECTS.map((t) => {
      const n = this.save.inventory[t.id] || 0;
      if (!(this.save.caught[t.id] > 0)) return '';
      return `<button type="button" data-gift="${t.id}" ${n ? '' : 'disabled'}><b>${t.mark}</b> ${t.name} <span>×${n}</span></button>`;
    }).join('');
    const sentences = Object.entries(this.save.sentences)
      .filter(([, n]) => n > 0)
      .map(([text, n]) => `<button type="button" class="sentence" data-sentence="${text}">“${text}” <span>×${n}</span></button>`)
      .join('');
    const items = bugs + sentences;
    this.giftsEl.innerHTML = items
      ? `<div class="dlg-gift-label">선물하기</div><div class="dlg-gift-row">${items}</div>`
      : `<div class="dlg-gift-label">곤충을 잡거나 문장을 요리하면 선물할 수 있어요</div>`;

    const an = this.animal;
    const btns = [];
    if (an.sulking) btns.push('<button type="button" data-act="pat" class="pat">우쭈쭈 🤍</button>');
    btns.push('<button type="button" data-act="talk">또 말 걸기</button>');
    if (friend && !an.following) btns.push('<button type="button" data-act="follow">같이 다니자</button>');
    if (an.following) btns.push('<button type="button" data-act="stay">여기서 쉬어</button>');
    btns.push('<button type="button" data-act="bye" class="dlg-bye">안녕!</button>');
    this.actionsEl.innerHTML = btns.join('');
  }

  close() {
    if (!this.isOpen) return;
    this.el.classList.remove('on');
    const a = this.animal;
    this.animal = null;
    this.handlers.onClose(a);
  }
}
