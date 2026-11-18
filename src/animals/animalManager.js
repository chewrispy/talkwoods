import * as THREE from 'three';
import { ANIMALS } from '../data/animals.js';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extra });
const eye = () => new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: '#241a12' }));

function addEyes(parent, y, z, spread, size) {
  for (const s of [-1, 1]) {
    const e = eye();
    e.scale.setScalar(size);
    e.position.set(spread * s, y, z);
    parent.add(e);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(size * 0.35, 6, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    shine.position.set(spread * s + size * 0.3, y + size * 0.35, z + size * 0.7);
    parent.add(shine);
  }
}

// ── 그로타: 커다란 맞장구 새 (고개를 끄덕끄덕) ──
function bigBird(a) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 14), std(a.color));
  body.scale.set(1.05, 1.15, 1.1);
  body.position.y = 1.35;
  body.castShadow = true;
  g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), std('#fff1c9'));
  belly.scale.set(1, 1.15, 0.42);
  belly.position.set(0, 1.25, 0.8);
  g.add(belly);
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), std('#e0a83a'));
    wing.scale.set(0.35, 0.9, 0.8);
    wing.position.set(1.0 * s, 1.35, -0.05);
    wing.rotation.z = 0.25 * s;
    wing.castShadow = true;
    g.add(wing);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 6), std('#e07b39'));
    leg.position.set(0.35 * s, 0.22, 0.1);
    g.add(leg);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), std('#e07b39'));
    foot.scale.set(1, 0.4, 1.4);
    foot.position.set(0.35 * s, 0.03, 0.2);
    g.add(foot);
  }
  const head = new THREE.Group();
  head.position.set(0, 2.45, 0.15);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), std(a.color));
  skull.castShadow = true;
  head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 10), std('#ff9a3c'));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, -0.05, 0.7);
  head.add(beak);
  addEyes(head, 0.15, 0.5, 0.24, 0.09);
  for (const r of [-0.3, 0, 0.3]) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35, 6), std('#e0a83a'));
    tuft.position.set(r * 0.5, 0.65, -0.05);
    tuft.rotation.z = -r;
    head.add(tuft);
  }
  g.add(head);
  return {
    group: g,
    facer: g,
    bubbleY: 3.6,
    radius: 1.2,
    idle(t, talking) {
      const speed = talking ? 9 : 3.2;
      head.rotation.x = Math.max(0, Math.sin(t * speed)) * 0.35;
      body.scale.y = 1.15 + Math.sin(t * speed) * 0.015;
    },
  };
}

// ── 아뇽: 작은 새 (고개를 도리도리) ──
function smallBird(a) {
  const g = new THREE.Group();
  const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.5, 10), std('#7b5a3a', { roughness: 1 }));
  perch.position.y = 0.25;
  perch.castShadow = true;
  g.add(perch);
  const bird = new THREE.Group();
  bird.position.y = 0.5;
  g.add(bird);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), std(a.color));
  body.scale.set(1, 1.05, 1.1);
  body.position.y = 0.42;
  body.castShadow = true;
  bird.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), std('#eaf3ff'));
  belly.scale.set(1, 1.1, 0.45);
  belly.position.set(0, 0.38, 0.33);
  bird.add(belly);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 6), std('#6c98c8'));
  tail.rotation.x = -2.2;
  tail.position.set(0, 0.42, -0.45);
  bird.add(tail);
  const head = new THREE.Group();
  head.position.set(0, 0.88, 0.05);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), std(a.color));
  head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), std('#f7b267'));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, -0.02, 0.33);
  head.add(beak);
  addEyes(head, 0.07, 0.24, 0.12, 0.05);
  // 화난 눈썹
  for (const s of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.02), new THREE.MeshBasicMaterial({ color: '#241a12' }));
    brow.position.set(0.12 * s, 0.16, 0.27);
    brow.rotation.z = -0.4 * s;
    head.add(brow);
  }
  bird.add(head);
  return {
    group: g,
    facer: bird,
    bubbleY: 2.0,
    radius: 0.8,
    idle(t, talking, level = 0) {
      const amp = talking ? 0.5 + level * 0.25 : 0.35;
      const speed = talking ? 10 + level * 6 : 2.2;
      head.rotation.y = Math.sin(t * speed) * amp;
      bird.position.y = 0.5 + (talking ? Math.abs(Math.sin(t * 12)) * 0.04 * (level + 1) : 0);
    },
  };
}

// ── 그럴스도: 나뭇가지에 매달린 나무늘보 (느릿느릿 흔들) ──
function sloth(a) {
  const g = new THREE.Group();
  const wood = std('#6b4b32', { roughness: 1 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 3.4, 8), wood);
  trunk.position.set(-1.1, 1.7, 0);
  trunk.castShadow = true;
  g.add(trunk);
  const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 2.4, 6), wood);
  branch.rotation.z = Math.PI / 2;
  branch.position.set(0, 2.7, 0);
  branch.castShadow = true;
  g.add(branch);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), std('#6ea24b', { flatShading: true }));
  crown.position.set(-1.1, 3.8, 0);
  crown.castShadow = true;
  g.add(crown);

  const hang = new THREE.Group();
  hang.position.set(0.15, 2.7, 0);
  g.add(hang);
  const fur = std(a.color);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.5, 6, 12), fur);
  body.position.y = -0.85;
  body.castShadow = true;
  hang.add(body);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.55, 4, 6), fur);
    arm.position.set(0.28 * s, -0.35, 0);
    arm.rotation.z = -0.25 * s;
    hang.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4, 4, 6), fur);
    leg.position.set(0.22 * s, -1.45, 0.1);
    leg.rotation.x = 0.4;
    hang.add(leg);
  }
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), std('#ead7b8'));
  face.scale.set(1.1, 0.9, 0.5);
  face.position.set(0, -0.62, 0.3);
  hang.add(face);
  // 졸린 눈 (눈 아래 다크서클 줄무늬)
  for (const s of [-1, 1]) {
    const mask = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), std('#5a4330'));
    mask.scale.set(1.5, 0.6, 0.4);
    mask.position.set(0.11 * s, -0.6, 0.42);
    mask.rotation.z = 0.35 * s;
    hang.add(mask);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.02), new THREE.MeshBasicMaterial({ color: '#241a12' }));
    lid.position.set(0.11 * s, -0.59, 0.46);
    hang.add(lid);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: '#241a12' }));
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.72, 0.43);
  hang.add(smile);
  return {
    group: g,
    facer: hang,
    bubbleY: 3.4,
    radius: 0.9,
    colliders: [{ x: -1.1, z: 0, r: 0.45 }],
    idle(t, talking) {
      hang.rotation.z = Math.sin(t * (talking ? 1.4 : 0.7)) * 0.18;
      hang.rotation.x = Math.sin(t * 0.5) * 0.05;
    },
  };
}

const MODELS = { bigBird, smallBird, sloth };

function makeBubbleTexture(text) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = '600 44px "Gowun Batang", serif';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 60;
  c.width = Math.max(140, w);
  c.height = 110;
  ctx.font = font;
  const r = 34;
  ctx.fillStyle = 'rgba(255,250,240,0.96)';
  ctx.strokeStyle = 'rgba(181,143,69,0.9)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(4, 4, c.width - 8, 76, r);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(c.width / 2 - 14, 78);
  ctx.lineTo(c.width / 2, 104);
  ctx.lineTo(c.width / 2 + 14, 78);
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width / 2, 44);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: c.width / c.height };
}

export class AnimalManager {
  constructor(scene, world) {
    this.world = world;
    this.list = ANIMALS.map((data) => {
      const model = MODELS[data.model](data);
      const spot = world.zones[data.spot];
      const y = world.heightAt(spot.x, spot.z);
      model.group.position.set(spot.x, y, spot.z);
      // 출발 지점을 바라보게
      model.group.rotation.y = Math.atan2(-spot.x, -spot.z);
      scene.add(model.group);
      world.colliders.push({ x: spot.x, z: spot.z, r: model.radius });
      for (const c of model.colliders || []) {
        const cos = Math.cos(model.group.rotation.y);
        const sin = Math.sin(model.group.rotation.y);
        world.colliders.push({ x: spot.x + c.x * cos + c.z * sin, z: spot.z - c.x * sin + c.z * cos, r: c.r });
      }
      const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false }));
      bubble.position.y = model.bubbleY;
      bubble.renderOrder = 10;
      bubble.visible = false;
      model.group.add(bubble);
      return {
        data,
        model,
        bubble,
        pos: model.group.position,
        phase: Math.random() * 10,
        bubbleTimer: 2 + Math.random() * 4,
        bubbleShown: 0,
        talking: false,
        talkLevel: 0,
      };
    });
  }

  say(animal, text, seconds = 3) {
    const { tex, aspect } = makeBubbleTexture(text);
    animal.bubble.material.map?.dispose();
    animal.bubble.material.map = tex;
    animal.bubble.material.needsUpdate = true;
    const h = 0.75;
    animal.bubble.scale.set(h * aspect, h, 1);
    animal.bubble.visible = true;
    animal.bubbleShown = seconds;
  }

  update(dt, playerPos) {
    for (const a of this.list) {
      a.phase += dt;
      a.model.idle(a.phase, a.talking, a.talkLevel);
      // 가까이 오면 플레이어 쪽을 바라봐요
      const dx = playerPos.x - a.pos.x;
      const dz = playerPos.z - a.pos.z;
      const dist = Math.hypot(dx, dz);
      const f = a.model.facer;
      const base = f === a.model.group ? 0 : a.model.group.rotation.y;
      const parentRot = f === a.model.group ? 0 : a.model.group.rotation.y;
      if (a.homeRot === undefined) a.homeRot = f.rotation.y + base;
      const want = (dist < 9 ? Math.atan2(dx, dz) : a.homeRot) - parentRot;
      let diff = Math.atan2(Math.sin(want - f.rotation.y), Math.cos(want - f.rotation.y));
      f.rotation.y += diff * Math.min(1, dt * 3);
      // 혼잣말 말풍선 (가까이 있을 때만)
      const near = Math.hypot(a.pos.x - playerPos.x, a.pos.z - playerPos.z) < 14;
      if (a.bubbleShown > 0) {
        a.bubbleShown -= dt;
        if (a.bubbleShown <= 0) a.bubble.visible = false;
      } else if (near && !a.talking) {
        a.bubbleTimer -= dt;
        if (a.bubbleTimer <= 0) {
          this.say(a, a.data.lines[0], 2.4);
          a.bubbleTimer = 5 + Math.random() * 5;
        }
      }
    }
  }

  findTalkable(pos, range = 3.6) {
    let best = null;
    let bestD = Infinity;
    for (const a of this.list) {
      const d = Math.hypot(a.pos.x - pos.x, a.pos.z - pos.z) - a.model.radius;
      if (d < range && d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best;
  }
}
