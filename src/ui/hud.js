export class Hud {
  constructor(root, { isTouch, onCatch, onOpenDex }) {
    this.isTouch = isTouch;
    this.el = document.createElement('div');
    this.el.className = 'hud';
    this.el.innerHTML = `
      <div class="hud-time"><span class="hud-time-icon"></span><span class="hud-time-text"></span></div>
      <button class="hud-dex" type="button">📖 수첩 <span class="hud-dex-count"></span></button>
      <button class="hud-catch" type="button"></button>
      <div class="hud-toasts"></div>
      <div class="hud-hint"></div>
    `;
    root.appendChild(this.el);
    this.timeIcon = this.el.querySelector('.hud-time-icon');
    this.timeText = this.el.querySelector('.hud-time-text');
    this.dexBtn = this.el.querySelector('.hud-dex');
    this.dexCount = this.el.querySelector('.hud-dex-count');
    this.catchBtn = this.el.querySelector('.hud-catch');
    this.toasts = this.el.querySelector('.hud-toasts');
    this.hint = this.el.querySelector('.hud-hint');
    this.targetId = null;

    this.catchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onCatch();
    });
    this.dexBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onOpenDex();
    });
    for (const b of [this.catchBtn, this.dexBtn]) b.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  show() {
    this.el.classList.add('on');
    this.hint.textContent = this.isTouch
      ? '왼쪽을 끌어 걷고, 오른쪽을 끌어 둘러보세요'
      : 'WASD로 걷고 · 드래그로 둘러보고 · E로 잡기·말 걸기';
    this.hint.classList.add('on');
    setTimeout(() => this.hint.classList.remove('on'), 7000);
  }

  setTime({ icon, text }) {
    if (this._t === text) return;
    this._t = text;
    this.timeIcon.textContent = icon;
    this.timeText.textContent = text;
  }

  setDexCount(found, total) {
    this.dexCount.textContent = `${found}/${total}`;
  }

  // target: { id, html } 또는 null
  setTarget(target) {
    const id = target ? target.id : null;
    if (id === this.targetId) return;
    this.targetId = id;
    if (target) {
      const key = this.isTouch ? '' : '<kbd>E</kbd> ';
      this.catchBtn.innerHTML = key + target.html;
      this.catchBtn.classList.add('on');
    } else {
      this.catchBtn.classList.remove('on');
    }
  }

  hideTarget() {
    this.setTarget(null);
  }

  toast(html) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    this.toasts.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2800);
  }

  pulseDex() {
    this.dexBtn.classList.remove('pulse');
    void this.dexBtn.offsetWidth;
    this.dexBtn.classList.add('pulse');
  }
}
