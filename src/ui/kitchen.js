import { INSECTS } from '../data/insects.js';
import { MAX_MARKS, recipeFor } from '../data/recipes.js';

// 문장 냄비 화면: 단어 하나 + 문장부호 1~3개
export class Kitchen {
  constructor(root, { save, onCook, onClose }) {
    this.save = save;
    this.onCook = onCook;
    this.onClose = onClose;
    this.word = null;
    this.marks = [];
    this.el = document.createElement('div');
    this.el.className = 'dialogue kitchen';
    this.el.innerHTML = `
      <div class="dlg-box">
        <div class="dlg-head">
          <div class="dlg-name">문장 냄비 <span class="dlg-kind">단어 하나 + 문장부호</span></div>
          <button type="button" class="kit-x" aria-label="닫기">✕</button>
        </div>
        <div class="kit-preview"></div>
        <div class="kit-hint"></div>
        <div class="dlg-gift-label">단어 카드</div>
        <div class="dlg-gift-row kit-words"></div>
        <div class="dlg-gift-label">문장부호 넣기</div>
        <div class="dlg-gift-row kit-marks"></div>
        <div class="kit-foot"></div>
        <div class="dlg-actions">
          <button type="button" class="kit-clear">다시</button>
          <button type="button" class="kit-cook dlg-bye">보글보글 끓이기</button>
        </div>
      </div>
    `;
    root.appendChild(this.el);
    this.preview = this.el.querySelector('.kit-preview');
    this.hint = this.el.querySelector('.kit-hint');
    this.wordsEl = this.el.querySelector('.kit-words');
    this.marksEl = this.el.querySelector('.kit-marks');
    this.cookBtn = this.el.querySelector('.kit-cook');
    this.footEl = this.el.querySelector('.kit-foot');
    this.footEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-word2]');
      if (!b) return;
      this.word2 = this.word2 === b.dataset.word2 ? null : b.dataset.word2;
      this.render();
    });
    this.el.querySelector('.kit-x').addEventListener('click', () => this.close());
    this.el.querySelector('.kit-clear').addEventListener('click', () => {
      this.marks = [];
      this.word2 = null;
      this.render();
    });
    this.cookBtn.addEventListener('click', () => this.cook());
    this.wordsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-word]');
      if (!b) return;
      this.word = b.dataset.word;
      this.render();
    });
    this.marksEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-mark]');
      if (!b || b.disabled) return;
      if (this.marks.length >= MAX_MARKS) return;
      this.marks.push(b.dataset.mark);
      this.render();
    });
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  get isOpen() {
    return this.el.classList.contains('on');
  }

  open() {
    this.marks = [];
    this.word2 = null;
    if (!this.word || !this.save.words.includes(this.word)) this.word = this.save.words[0] || null;
    this.el.classList.add('on');
    this.render();
  }

  close() {
    if (!this.isOpen) return;
    this.el.classList.remove('on');
    this.onClose();
  }

  used(id) {
    return this.marks.filter((m) => m === id).length;
  }

  get hasFootnote() {
    return this.marks.some((id) => INSECTS.find((t) => t.id === id).footnote);
  }

  get text() {
    if (!this.word) return '';
    const base = this.word + this.marks.map((id) => INSECTS.find((t) => t.id === id).mark).join('');
    // * 부연설명: 단어를 하나 더 이어 붙여요
    return this.hasFootnote && this.word2 ? `${base} ${this.word2}` : base;
  }

  render() {
    const words = this.save.words;
    this.wordsEl.innerHTML = words.length
      ? words.map((w) => `<button type="button" data-word="${w}" class="${w === this.word ? 'sel' : ''}">${w}</button>`).join('')
      : '<span class="kit-empty">숲 친구들에게 말을 걸면 단어 카드를 받아요</span>';
    this.marksEl.innerHTML = INSECTS.map((t) => {
      const left = (this.save.inventory[t.id] || 0) - this.used(t.id);
      if (!(this.save.caught[t.id] > 0)) return '';
      return `<button type="button" data-mark="${t.id}" ${left > 0 && this.marks.length < MAX_MARKS ? '' : 'disabled'}><b>${t.mark}</b> ${t.name} <span>×${left}</span></button>`;
    }).join('') || '<span class="kit-empty">문장부호 곤충을 잡아오세요</span>';

    if (this.hasFootnote) {
      this.footEl.innerHTML = `<div class="dlg-gift-label">* 부연설명: 단어 하나 더 붙이기</div><div class="dlg-gift-row">${this.save.words
        .map((w) => `<button type="button" data-word2="${w}" class="${w === this.word2 ? 'sel' : ''}">${w}</button>`)
        .join('')}</div>`;
    } else {
      this.word2 = null;
      this.footEl.innerHTML = '';
    }

    const text = this.text;
    if (!text) {
      this.preview.innerHTML = '<span class="kit-ph">단어를 골라주세요</span>';
      this.hint.textContent = '';
    } else {
      this.preview.innerHTML = `“${text}<span class="kit-caret"></span>”`;
      const known = this.save.recipes[text];
      this.hint.textContent = this.marks.length
        ? known
          ? `이미 아는 요리: ${recipeFor(text).name}`
          : '어떤 문장이 될까요?'
        : '문장부호를 하나 이상 넣어주세요';
    }
    this.cookBtn.disabled = !(this.word && this.marks.length);
  }

  cook() {
    if (!(this.word && this.marks.length)) return;
    const text = this.text;
    for (const id of this.marks) this.save.inventory[id] -= 1;
    this.marks = [];
    this.word2 = null;
    this.onCook(text);
    this.render();
  }
}
