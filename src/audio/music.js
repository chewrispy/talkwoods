// 배경음악: 파일 없이 브라우저에서 직접 연주해요 (Web Audio).
// 숲마다 음계·빠르기·악기가 달라요. 밤에는 조금 더 조용하고 부드러워져요.

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const THEMES = {
  // 근황의 숲: 따뜻하고 통통 튀는 C장조 5음계
  catchup: {
    bpm: 92,
    scale: [60, 62, 64, 67, 69, 72, 74, 76],
    chords: [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]],
    melody: { rest: 0.35, step: 'eighth', voice: 'pluck', vol: 0.11 },
    pad: { vol: 0.045, type: 'sine', cutoff: 1400 },
    bass: { vol: 0.07, type: 'triangle', pattern: [1, 0, 0.6, 0] },
    drums: null,
    bell: 0.12,
  },
  // 귓속말의 숲: 몽환적이고 느린 A단조, 종소리와 긴 잔향
  whisper: {
    bpm: 62,
    scale: [69, 72, 74, 76, 79, 81, 84],
    chords: [[45, 57, 64, 71], [41, 53, 60, 69], [43, 55, 62, 71], [40, 52, 59, 67]],
    melody: { rest: 0.65, step: 'quarter', voice: 'bell', vol: 0.09 },
    pad: { vol: 0.06, type: 'sine', cutoff: 900 },
    bass: { vol: 0.04, type: 'sine', pattern: [1, 0, 0, 0] },
    drums: null,
    bell: 0.35,
  },
  // 싸움의 숲: 긴장감 있는 D단조, 둥둥 북소리
  fight: {
    bpm: 118,
    scale: [62, 65, 67, 69, 72, 74, 77],
    chords: [[38, 50, 57, 65], [34, 46, 53, 62], [36, 48, 55, 64], [33, 45, 52, 61]],
    melody: { rest: 0.45, step: 'eighth', voice: 'square', vol: 0.05 },
    pad: { vol: 0.035, type: 'sawtooth', cutoff: 700 },
    bass: { vol: 0.09, type: 'square', pattern: [1, 0.5, 1, 0.5] },
    drums: { kick: [1, 0, 0, 1, 1, 0, 0, 0], snare: [0, 0, 1, 0, 0, 0, 1, 0] },
    bell: 0.1,
  },
};

export class Music {
  constructor() {
    this.ctx = null;
    this.area = 'catchup';
    this.night = false;
    try {
      this.muted = localStorage.getItem('talkwoods.music') === 'off';
    } catch (e) {
      this.muted = false;
    }
  }

  // 휴대폰은 사용자가 화면을 눌러야 소리를 낼 수 있어서, 시작하기 버튼에서 불러요
  start() {
    if (this.ctx) {
      this.ctx.resume?.();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.tone = ctx.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.tone.frequency.value = 12000;
    this.tone.connect(this.master);
    this.master.connect(ctx.destination);
    // 잔향 (딜레이)
    this.delay = ctx.createDelay(1.5);
    this.delay.delayTime.value = 0.36;
    this.feedback = ctx.createGain();
    this.feedback.gain.value = 0.32;
    this.delaySend = ctx.createGain();
    this.delaySend.gain.value = 1;
    this.delaySend.connect(this.delay);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.delay.connect(this.tone);
    this.noise = this.makeNoise();

    this.step = 0;
    this.nextTime = ctx.currentTime + 0.1;
    this.melIdx = 2;
    this.timer = setInterval(() => this.schedule(), 30);
  }

  makeNoise() {
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  setArea(id) {
    if (THEMES[id]) this.area = id;
  }

  setNight(night) {
    if (this.night === night || !this.ctx) {
      this.night = night;
      return;
    }
    this.night = night;
    const t = this.ctx.currentTime;
    this.tone.frequency.setTargetAtTime(night ? 2200 : 12000, t, 1.5);
    if (!this.muted) this.master.gain.setTargetAtTime(night ? 0.55 : 0.8, t, 1.5);
  }

  toggle() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('talkwoods.music', this.muted ? 'off' : 'on');
    } catch (e) {
      /* 무시 */
    }
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : this.night ? 0.55 : 0.8, this.ctx.currentTime, 0.2);
    return !this.muted;
  }

  schedule() {
    const ctx = this.ctx;
    if (ctx.state !== 'running') return;
    const th = THEMES[this.area];
    const eighth = 60 / th.bpm / 2;
    while (this.nextTime < ctx.currentTime + 0.15) {
      this.playStep(th, this.step, this.nextTime, eighth);
      this.nextTime += eighth;
      this.step = (this.step + 1) % 64;
    }
  }

  playStep(th, step, t, eighth) {
    const bar = Math.floor(step / 8) % th.chords.length;
    const inBar = step % 8;
    const chord = th.chords[bar];

    // 패드: 마디 첫 박에 화음
    if (inBar === 0) {
      for (const n of chord.slice(1)) this.pad(midi(n), t, eighth * 8, th.pad);
    }
    // 베이스
    if (inBar % 2 === 0) {
      const v = th.bass.pattern[(inBar / 2) % th.bass.pattern.length];
      if (v) this.bass(midi(chord[0]), t, eighth * 1.6, th.bass.vol * v, th.bass.type);
    }
    // 북
    if (th.drums) {
      if (th.drums.kick[inBar]) this.kick(t);
      if (th.drums.snare[inBar]) this.snare(t);
    }
    // 멜로디: 음계 위를 걷듯이
    const m = th.melody;
    const onGrid = m.step === 'eighth' || inBar % 2 === 0;
    if (onGrid && Math.random() > m.rest) {
      this.melIdx = Math.max(0, Math.min(th.scale.length - 1, this.melIdx + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
      const f = midi(th.scale[this.melIdx]);
      const len = m.step === 'eighth' ? eighth * 0.9 : eighth * 1.8;
      if (m.voice === 'bell') this.bell(f, t, m.vol, th.bell);
      else this.pluck(f, t, len, m.vol, m.voice === 'square' ? 'square' : 'triangle', th.bell);
    }
  }

  out(send) {
    const g = this.ctx.createGain();
    g.connect(this.tone);
    if (send) {
      const s = this.ctx.createGain();
      s.gain.value = send;
      g.connect(s);
      s.connect(this.delaySend);
    }
    return g;
  }

  pluck(f, t, len, vol, type, send) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = this.out(send);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.25);
    o.connect(g);
    o.start(t);
    o.stop(t + len + 0.3);
  }

  bell(f, t, vol, send) {
    for (const [mul, v] of [[1, 1], [2.76, 0.3], [5.4, 0.12]]) {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * mul;
      const g = this.out(send);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol * v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2 / mul + 0.3);
      o.connect(g);
      o.start(t);
      o.stop(t + 2.6);
    }
  }

  pad(f, t, len, { vol, type, cutoff }) {
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = cutoff;
    const g = this.out(0.15);
    filt.connect(g);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + len * 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + len * 1.05);
    for (const det of [-6, 6]) {
      const o = this.ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = det;
      o.connect(filt);
      o.start(t);
      o.stop(t + len * 1.1);
    }
  }

  bass(f, t, len, vol, type) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 500;
    const g = this.out(0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(filt);
    filt.connect(g);
    o.start(t);
    o.stop(t + len + 0.05);
  }

  kick(t) {
    const o = this.ctx.createOscillator();
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = this.out(0);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.32);
  }

  snare(t) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    const g = this.out(0.1);
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    src.connect(bp);
    bp.connect(g);
    src.start(t);
    src.stop(t + 0.2);
  }
}
