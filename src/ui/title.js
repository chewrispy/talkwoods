export class TitleScreen {
  constructor(root, onStart) {
    this.el = document.createElement('div');
    this.el.className = 'title-screen';
    this.el.innerHTML = `
      <div class="title-inner">
        <div class="title-en">
          <span class="t-big">Talk</span>
          <span class="t-small">of the</span>
          <span class="t-big">Woods</span>
        </div>
        <div class="title-ornament">❦</div>
        <div class="title-ko">대화의 숲</div>
        <button class="title-start" type="button">시작하기</button>
      </div>
      <div class="title-foot">a cozy little forest of words</div>
    `;
    root.appendChild(this.el);
    this.el.querySelector('.title-start').addEventListener('click', () => {
      this.el.classList.add('leaving');
      setTimeout(() => this.el.remove(), 900);
      onStart();
    });
  }
}
