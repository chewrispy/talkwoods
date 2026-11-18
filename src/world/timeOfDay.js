import * as THREE from 'three';

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const SKY = {
  night: new THREE.Color('#0f1636'),
  dusk: new THREE.Color('#e9a07f'),
  day: new THREE.Color('#a9d9ef'),
};
const FOG = {
  night: new THREE.Color('#121a3a'),
  dusk: new THREE.Color('#d89a86'),
  day: new THREE.Color('#cfe5d6'),
};

// 하루: t=0 해 뜸 → 0.25 한낮 → 0.5 해 짐 → 0.75 한밤
export class TimeOfDay {
  constructor(scene, { dayLengthSeconds = 240, startAt = 0.06 } = {}) {
    this.scene = scene;
    this.dayLength = dayLengthSeconds;
    this.t = startAt;

    this.sky = new THREE.Color();
    scene.background = this.sky;
    scene.fog = new THREE.Fog(new THREE.Color(), 18, 75);

    this.hemi = new THREE.HemisphereLight('#dff2ff', '#4b5a33', 0.9);
    scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight('#fff1d6', 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = sc.bottom = -26;
    sc.right = sc.top = 26;
    sc.near = 1;
    sc.far = 120;
    this.sun.shadow.bias = -0.0006;
    scene.add(this.sun, this.sun.target);

    this.moon = new THREE.DirectionalLight('#9fb4ff', 0);
    scene.add(this.moon, this.moon.target);

    // 별
    const starGeo = new THREE.BufferGeometry();
    const pts = [];
    for (let i = 0; i < 600; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * 0.45 * Math.PI + 0.05;
      const r = 140;
      pts.push(Math.cos(u) * Math.cos(v) * r, Math.sin(v) * r, Math.sin(u) * Math.cos(v) * r);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.starMat = new THREE.PointsMaterial({ color: '#ffffff', size: 0.9, sizeAttenuation: true, transparent: true, opacity: 0, fog: false, depthWrite: false });
    this.stars = new THREE.Points(starGeo, this.starMat);
    scene.add(this.stars);

    this.update(0, new THREE.Vector3());
  }

  // 숲마다 하늘·안개 분위기 색을 섞어요
  setArea(area) {
    this.tint = area.tint ? { color: new THREE.Color(area.tint.color), amount: area.tint.amount } : null;
    this.scene.fog.near = area.tint?.fogNear ?? 18;
    this.scene.fog.far = area.tint?.fogFar ?? 75;
  }

  get elevation() {
    return Math.sin(this.t * Math.PI * 2);
  }

  get isDay() {
    return this.elevation > 0;
  }

  get label() {
    const e = this.elevation;
    const rising = Math.cos(this.t * Math.PI * 2) > 0;
    if (e > 0.25) return { icon: '☀️', text: '낮' };
    if (e > 0) return rising ? { icon: '🌅', text: '아침' } : { icon: '🌇', text: '저녁' };
    if (e > -0.25) return rising ? { icon: '🌌', text: '새벽' } : { icon: '🌆', text: '해 질 녘' };
    return { icon: '🌙', text: '밤' };
  }

  // 시간대별 말투용: 'sunset' | 'dawn' | null
  get mood() {
    const t = this.label.text;
    if (t === '저녁' || t === '해 질 녘') return 'sunset';
    if (t === '새벽') return 'dawn';
    return null;
  }

  update(dt, focus) {
    this.t = (this.t + dt / this.dayLength) % 1;
    const a = this.t * Math.PI * 2;
    const e = Math.sin(a);

    // 하늘·안개 색
    if (e >= 0) {
      const k = smoothstep(0, 0.35, e);
      this.sky.copy(SKY.dusk).lerp(SKY.day, k);
      this.scene.fog.color.copy(FOG.dusk).lerp(FOG.day, k);
    } else {
      const k = smoothstep(0, 0.3, -e);
      this.sky.copy(SKY.dusk).lerp(SKY.night, k);
      this.scene.fog.color.copy(FOG.dusk).lerp(FOG.night, k);
    }

    if (this.tint) {
      this.sky.lerp(this.tint.color, this.tint.amount);
      this.scene.fog.color.lerp(this.tint.color, this.tint.amount);
    }

    // 해
    const sunDir = new THREE.Vector3(Math.cos(a), Math.max(e, 0.05), 0.35).normalize();
    this.sun.position.copy(focus).addScaledVector(sunDir, 60);
    this.sun.target.position.copy(focus);
    this.sun.intensity = 2.4 * smoothstep(-0.02, 0.3, e);
    this.sun.color.set('#ffd2a8').lerp(new THREE.Color('#fff4e0'), smoothstep(0, 0.4, e));

    // 달
    const night = smoothstep(0, 0.3, -e);
    this.moon.position.copy(focus).add(new THREE.Vector3(-Math.cos(a) * 60, 50, -20));
    this.moon.target.position.copy(focus);
    this.moon.intensity = 0.55 * night;

    this.hemi.intensity = 0.35 + 0.75 * smoothstep(-0.2, 0.4, e);
    this.hemi.color.set('#9fb0ff').lerp(new THREE.Color('#e4f4ff'), smoothstep(-0.1, 0.3, e));

    this.starMat.opacity = night * 0.9;
    this.stars.position.set(focus.x, 0, focus.z);
  }
}
