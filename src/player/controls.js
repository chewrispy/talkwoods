// 키보드·마우스·터치 입력을 한곳에서 처리해요.
export class Controls {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.keys = new Set();
    this.yaw = 0;
    this.pitch = 0.42;
    this.distance = 7.5;
    this.joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
    this.look = { id: null, lx: 0, ly: 0 };
    this.actionHandlers = [];
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

    // 조이스틱 UI
    this.joyBase = document.createElement('div');
    this.joyBase.className = 'joy-base';
    this.joyKnob = document.createElement('div');
    this.joyKnob.className = 'joy-knob';
    this.joyBase.appendChild(this.joyKnob);
    document.body.appendChild(this.joyBase);

    addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      this.keys.add(e.code);
      if (e.code === 'KeyE' || e.code === 'Space') {
        e.preventDefault();
        this.actionHandlers.forEach((h) => h());
      }
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    addEventListener('pointermove', (e) => this.onMove(e));
    addEventListener('pointerup', (e) => this.onUp(e));
    addEventListener('pointercancel', (e) => this.onUp(e));
    canvas.addEventListener(
      'wheel',
      (e) => {
        if (!this.enabled) return;
        this.distance = Math.min(13, Math.max(4, this.distance + e.deltaY * 0.01));
      },
      { passive: true }
    );
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  onAction(fn) {
    this.actionHandlers.push(fn);
  }

  onDown(e) {
    if (!this.enabled) return;
    const touchLike = e.pointerType === 'touch' || e.pointerType === 'pen';
    if (touchLike && e.clientX < innerWidth * 0.45 && this.joy.id === null) {
      this.joy.id = e.pointerId;
      this.joy.ox = e.clientX;
      this.joy.oy = e.clientY;
      this.joy.x = this.joy.y = 0;
      this.joyBase.style.left = `${e.clientX}px`;
      this.joyBase.style.top = `${e.clientY}px`;
      this.joyBase.classList.add('on');
      this.joyKnob.style.transform = 'translate(-50%, -50%)';
    } else if (this.look.id === null) {
      this.look.id = e.pointerId;
      this.look.lx = e.clientX;
      this.look.ly = e.clientY;
    }
  }

  onMove(e) {
    if (e.pointerId === this.joy.id) {
      const max = 48;
      let dx = e.clientX - this.joy.ox;
      let dy = e.clientY - this.joy.oy;
      const d = Math.hypot(dx, dy);
      if (d > max) {
        dx = (dx / d) * max;
        dy = (dy / d) * max;
      }
      this.joy.x = dx / max;
      this.joy.y = -dy / max;
      this.joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    } else if (e.pointerId === this.look.id) {
      const dx = e.clientX - this.look.lx;
      const dy = e.clientY - this.look.ly;
      this.look.lx = e.clientX;
      this.look.ly = e.clientY;
      this.yaw -= dx * 0.006;
      this.pitch = Math.min(1.2, Math.max(0.12, this.pitch + dy * 0.004));
    }
  }

  onUp(e) {
    if (e.pointerId === this.joy.id) {
      this.joy.id = null;
      this.joy.x = this.joy.y = 0;
      this.joyBase.classList.remove('on');
    }
    if (e.pointerId === this.look.id) this.look.id = null;
  }

  getMove() {
    if (!this.enabled) return { x: 0, y: 0 };
    let x = this.joy.x;
    let y = this.joy.y;
    const k = this.keys;
    if (k.has('KeyW') || k.has('ArrowUp')) y += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) y -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  reset() {
    this.keys.clear();
    this.joy.id = null;
    this.joy.x = this.joy.y = 0;
    this.look.id = null;
    this.joyBase.classList.remove('on');
  }
}
