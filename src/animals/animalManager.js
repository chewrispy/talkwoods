import * as THREE from 'three';
import { ANIMALS, ANIMAL_BY_ID } from '../data/animals.js';
import { disposeObject } from '../world/forest.js';

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

// ── 그로타: 타조 비율의 맞장구 새 (긴 목으로 끄덕끄덕) ──
// 도감: 피치·코랄 몸통, 민트색 목 깃털 포인트, 긴 목·긴 다리·통통한 몸
function bigBird(a) {
  const g = new THREE.Group();
  const coral = std(a.color);
  const mint = std('#9fe0c8');
  const legMat = std('#e58b5a');
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 18, 14), coral);
  body.scale.set(1.0, 0.85, 1.15);
  body.position.set(0, 1.75, -0.1);
  body.castShadow = true;
  g.add(body);
  // 꼬리 깃털
  for (const s of [-1, 0, 1]) {
    const tf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), std('#f8c2ad'));
    tf.scale.set(0.6, 0.9, 1.3);
    tf.position.set(s * 0.25, 2.0 + (s === 0 ? 0.12 : 0), -1.05);
    tf.rotation.x = -0.6;
    g.add(tf);
  }
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), std('#ee9677'));
    wing.scale.set(0.35, 0.75, 1.1);
    wing.position.set(0.82 * s, 1.8, -0.1);
    wing.rotation.z = 0.2 * s;
    wing.castShadow = true;
    g.add(wing);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.35, 4, 8), coral);
    thigh.position.set(0.3 * s, 1.1, 0);
    g.add(thigh);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), legMat);
    leg.position.set(0.3 * s, 0.5, 0.02);
    leg.castShadow = true;
    g.add(leg);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), legMat);
    foot.scale.set(1, 0.35, 1.5);
    foot.position.set(0.3 * s, 0.03, 0.12);
    g.add(foot);
  }
  // 목 (끄덕이는 축)
  const neck = new THREE.Group();
  neck.position.set(0, 2.2, 0.55);
  g.add(neck);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.12, 8, 14), mint);
  collar.rotation.x = Math.PI / 2 - 0.3;
  collar.position.set(0, 0.05, 0.02);
  neck.add(collar);
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.15, 10), coral);
  neckMesh.position.set(0, 0.6, 0.1);
  neckMesh.rotation.x = 0.15;
  neck.add(neckMesh);
  for (let i = 0; i < 4; i++) {
    const fluff = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), mint);
    fluff.position.set((i % 2 ? 0.08 : -0.08), 0.25 + i * 0.12, -0.02);
    neck.add(fluff);
  }
  const head = new THREE.Group();
  head.position.set(0, 1.25, 0.2);
  neck.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), coral);
  skull.castShadow = true;
  head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 10), std('#ff9a3c'));
  beak.rotation.x = Math.PI / 2;
  beak.scale.set(1.2, 1, 0.6);
  beak.position.set(0, -0.06, 0.38);
  head.add(beak);
  addEyes(head, 0.08, 0.24, 0.14, 0.07);
  for (const s of [-1, 1]) {
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.06, 10), new THREE.MeshBasicMaterial({ color: '#ff7f8e', transparent: true, opacity: 0.6 }));
    blush.position.set(0.22 * s, -0.04, 0.22);
    blush.rotation.y = 0.75 * s;
    head.add(blush);
  }
  for (const r of [-0.3, 0, 0.3]) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 6), mint);
    tuft.position.set(r * 0.3, 0.34, -0.04);
    tuft.rotation.z = -r;
    head.add(tuft);
  }
  return {
    group: g,
    facer: g,
    character: g,
    bubbleY: 4.3,
    radius: 1.1,
    idle(t, talking) {
      const speed = talking ? 9 : 3.2;
      const nod = Math.max(0, Math.sin(t * speed));
      neck.rotation.x = nod * 0.28;
      head.rotation.x = nod * 0.25;
      body.scale.y = 0.85 + Math.sin(t * speed) * 0.012;
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
    character: bird,
    bubbleY: 2.0,
    followBubbleY: 1.4,
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
    character: hang,
    bubbleY: 3.4,
    followBubbleY: 2.3,
    radius: 0.9,
    colliders: [{ x: -1.1, z: 0, r: 0.45 }],
    idle(t, talking) {
      hang.rotation.z = Math.sin(t * (talking ? 1.4 : 0.7)) * 0.18;
      hang.rotation.x = Math.sin(t * 0.5) * 0.05;
    },
  };
}

// ── 유카구리: 나무줄기에 붙은 딱따구리 (콕콕 쪼기) ──
function woodpecker(a) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 4.2, 9), std('#6b4b32', { roughness: 1 }));
  trunk.position.y = 2.1;
  trunk.castShadow = true;
  g.add(trunk);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), std('#5e9446', { flatShading: true }));
  crown.position.y = 4.6;
  crown.castShadow = true;
  g.add(crown);
  // 줄기를 빙 돌 수 있는 축
  const pivot = new THREE.Group();
  pivot.position.y = 1.5;
  g.add(pivot);
  const bird = new THREE.Group();
  bird.position.z = 0.48;
  pivot.add(bird);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), std(a.color));
  body.scale.set(0.9, 1.3, 0.85);
  body.castShadow = true;
  bird.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), std('#f4efe6'));
  chest.scale.set(0.9, 1.3, 0.45);
  chest.position.set(0, -0.02, 0.17);
  bird.add(chest);
  const head = new THREE.Group();
  head.position.set(0, 0.45, 0.02);
  bird.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), std(a.color));
  head.add(skull);
  const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), std('#f4efe6'));
  cheek.scale.set(1.5, 0.7, 1);
  cheek.position.set(0, -0.06, 0.08);
  head.add(cheek);
  const crest = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), std('#e2453c'));
  crest.scale.set(0.7, 0.9, 1.3);
  crest.position.set(0, 0.14, -0.06);
  head.add(crest);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.32, 8), std('#3a3530'));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0, 0.32);
  head.add(beak);
  addEyes(head, 0.06, 0.15, 0.09, 0.035);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 6), std('#2a2a33'));
  tail.position.set(0, -0.45, -0.1);
  tail.rotation.x = 0.4;
  bird.add(tail);
  let burst = 0;
  return {
    group: g,
    facer: pivot,
    character: bird,
    bubbleY: 2.6,
    followBubbleY: 1.3,
    radius: 0.9,
    idle(t, talking, level = 0) {
      burst = (t * (talking ? 1.2 + level * 0.4 : 0.6)) % 1;
      const pecking = burst < 0.35;
      head.rotation.x = pecking ? Math.max(0, Math.sin(t * 40)) * 0.5 : 0;
      head.rotation.y = pecking ? 0 : Math.sin(t * 1.5) * 0.3;
    },
  };
}

// ── 그래소: 묵직한 물소 (천천히 되새김질) ──
function buffalo(a) {
  const g = new THREE.Group();
  const fur = std(a.color);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), fur);
  body.scale.set(1.05, 0.85, 1.5);
  body.position.y = 1.25;
  body.castShadow = true;
  g.add(body);
  const hump = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), fur);
  hump.position.set(0, 1.85, 0.45);
  g.add(hump);
  for (const [x, z] of [[-0.55, 0.85], [0.55, 0.85], [-0.55, -0.85], [0.55, -0.85]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.75, 8), std('#4a4039'));
    leg.position.set(x, 0.37, z);
    leg.castShadow = true;
    g.add(leg);
  }
  const head = new THREE.Group();
  head.position.set(0, 1.35, 1.55);
  g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), fur);
  skull.scale.set(1, 0.95, 1.05);
  skull.castShadow = true;
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.33, 12, 8), std('#7d6f64'));
  snout.scale.set(1.1, 0.8, 0.8);
  snout.position.set(0, -0.18, 0.38);
  head.add(snout);
  for (const s of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshBasicMaterial({ color: '#2a201a' }));
    nostril.position.set(0.11 * s, -0.17, 0.64);
    head.add(nostril);
    const horn = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 6, 14, Math.PI * 0.75), std('#e8dcc4'));
    horn.position.set(0.32 * s, 0.25, -0.05);
    horn.rotation.set(0, s > 0 ? 0 : Math.PI, 0.35);
    head.add(horn);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.02), new THREE.MeshBasicMaterial({ color: '#1d1611' }));
    lid.position.set(0.2 * s, 0.1, 0.45);
    head.add(lid);
  }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5), std('#4a4039'));
  tail.position.set(0, 1.0, -1.5);
  tail.rotation.x = 0.3;
  g.add(tail);
  return {
    group: g,
    facer: g,
    character: g,
    bubbleY: 2.9,
    radius: 1.5,
    idle(t, talking) {
      head.rotation.z = Math.sin(t * (talking ? 2.5 : 1.2)) * 0.06;
      snout.position.y = -0.18 + Math.sin(t * 4) * 0.015;
      tail.rotation.z = Math.sin(t * 2) * 0.3;
    },
  };
}

// ── 마르: 잘 삐지는 말 ──
function horse(a) {
  const g = new THREE.Group();
  const coat = std(a.color);
  const maneMat = std('#b07a5a');
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 1.0, 6, 12), coat);
  body.rotation.x = Math.PI / 2;
  body.position.y = 1.15;
  body.castShadow = true;
  g.add(body);
  const legs = [];
  for (const [x, z] of [[-0.28, 0.55], [0.28, 0.55], [-0.28, -0.55], [0.28, -0.55]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.85, 6), coat);
    leg.position.set(x, 0.43, z);
    leg.castShadow = true;
    g.add(leg);
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), std('#6b4f3a'));
    hoof.position.set(x, 0.05, z);
    g.add(hoof);
    legs.push(leg);
  }
  const neck = new THREE.Group();
  neck.position.set(0, 1.35, 0.75);
  g.add(neck);
  const neckMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.6, 4, 10), coat);
  neckMesh.rotation.x = 0.55;
  neckMesh.position.set(0, 0.32, 0.12);
  neck.add(neckMesh);
  const head = new THREE.Group();
  head.position.set(0, 0.75, 0.32);
  neck.add(head);
  const skull = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.4, 4, 10), coat);
  skull.rotation.x = 1.2;
  skull.position.z = 0.15;
  skull.castShadow = true;
  head.add(skull);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), std('#e6c7aa'));
  muzzle.position.set(0, -0.12, 0.42);
  head.add(muzzle);
  addEyes(head, 0.08, 0.22, 0.16, 0.04);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), coat);
    ear.position.set(0.1 * s, 0.25, -0.02);
    head.add(ear);
  }
  for (let i = 0; i < 5; i++) {
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), maneMat);
    tuft.scale.set(0.8, 1.2, 1);
    tuft.position.set(0, 0.62 - i * 0.12, -0.02 - i * 0.08);
    neck.add(tuft);
  }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.7, 6), maneMat);
  tail.position.set(0, 1.0, -1.0);
  tail.rotation.x = -2.5;
  g.add(tail);
  return {
    group: g,
    facer: g,
    character: g,
    bubbleY: 2.6,
    radius: 1.0,
    idle(t, talking, level = 0, moving = 0) {
      tail.rotation.z = Math.sin(t * 3) * 0.35;
      neck.rotation.x = talking ? Math.sin(t * (6 + level * 4)) * 0.12 * (level + 1) : Math.sin(t * 0.8) * 0.05;
      for (let i = 0; i < legs.length; i++) legs[i].rotation.x = Math.sin(t * 12 + i * 1.6) * 0.5 * moving;
    },
  };
}

// ── 순하마: 연못가 하마 (귀를 쫑긋쫑긋) ──
function hippo(a) {
  const g = new THREE.Group();
  const skin = std(a.color);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), skin);
  body.scale.set(1.1, 0.8, 1.35);
  body.position.y = 0.75;
  body.castShadow = true;
  g.add(body);
  for (const [x, z] of [[-0.55, 0.65], [0.55, 0.65], [-0.55, -0.65], [0.55, -0.65]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 8), skin);
    leg.position.set(x, 0.18, z);
    g.add(leg);
  }
  const head = new THREE.Group();
  head.position.set(0, 1.05, 1.15);
  g.add(head);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), skin);
  top.scale.set(1, 0.85, 0.9);
  head.add(top);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 10), std('#b3a8c4'));
  snout.scale.set(1.25, 0.75, 0.85);
  snout.position.set(0, -0.2, 0.4);
  head.add(snout);
  addEyes(head, 0.25, 0.32, 0.22, 0.06);
  const ears = [];
  for (const s of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: '#4a3f58' }));
    nostril.position.set(0.18 * s, -0.08, 0.76);
    head.add(nostril);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), skin);
    ear.scale.set(0.8, 1.2, 0.6);
    ear.position.set(0.3 * s, 0.38, -0.05);
    head.add(ear);
    ears.push(ear);
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.08, 10), new THREE.MeshBasicMaterial({ color: '#f2a3b8', transparent: true, opacity: 0.8 }));
    blush.position.set(0.38 * s, -0.12, 0.6);
    blush.rotation.y = 0.6 * s;
    head.add(blush);
  }
  return {
    group: g,
    facer: g,
    character: g,
    bubbleY: 2.4,
    radius: 1.3,
    idle(t, talking) {
      const k = talking ? 10 : 3;
      ears[0].rotation.z = Math.max(0, Math.sin(t * k)) * 0.6;
      ears[1].rotation.z = -Math.max(0, Math.sin(t * k + 1)) * 0.6;
      body.scale.y = 0.8 + Math.sin(t * 1.5) * 0.012;
    },
  };
}

// ── 오엉: 추임새 부엉이 (눈이 커졌다가, 화나면 반쯤 감김) ──
function owl(a) {
  const g = new THREE.Group();
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.7, 10), std('#6b4b32', { roughness: 1 }));
  stump.position.y = 0.35;
  stump.castShadow = true;
  g.add(stump);
  const bird = new THREE.Group();
  bird.position.y = 0.7;
  g.add(bird);
  const feather = std(a.color);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), feather);
  body.scale.set(1, 1.15, 0.95);
  body.position.y = 0.55;
  body.castShadow = true;
  bird.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), std('#e9dcc4'));
  belly.scale.set(1, 1.2, 0.45);
  belly.position.set(0, 0.48, 0.33);
  bird.add(belly);
  const face = new THREE.Group();
  face.position.set(0, 0.85, 0.3);
  bird.add(face);
  const lids = [];
  for (const s of [-1, 1]) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), new THREE.MeshBasicMaterial({ color: '#fff8e8' }));
    disc.position.set(0.16 * s, 0, 0.12);
    face.add(disc);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.075, 14), new THREE.MeshBasicMaterial({ color: '#241a12' }));
    pupil.position.set(0.16 * s, 0, 0.125);
    face.add(pupil);
    const shine = new THREE.Mesh(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    shine.position.set(0.16 * s + 0.03, 0.03, 0.13);
    face.add(shine);
    const lid = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16, 0, Math.PI), feather);
    lid.position.set(0.16 * s, 0, 0.135);
    lid.scale.y = 0.01;
    face.add(lid);
    lids.push(lid);
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 6), feather);
    tuft.position.set(0.28 * s, 0.4, -0.25);
    tuft.rotation.z = -0.35 * s;
    face.add(tuft);
  }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 6), std('#e0a14a'));
  beak.rotation.x = Math.PI;
  beak.position.set(0, -0.12, 0.15);
  face.add(beak);
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), std('#76624f'));
    wing.scale.set(0.35, 0.9, 0.8);
    wing.position.set(0.47 * s, 0.55, 0);
    bird.add(wing);
  }
  return {
    group: g,
    facer: bird,
    character: bird,
    bubbleY: 2.4,
    followBubbleY: 1.6,
    radius: 0.8,
    idle(t, talking, level = 0) {
      face.rotation.z = Math.sin(t * (talking ? 4 : 0.8)) * (talking ? 0.25 : 0.12);
      const close = talking ? Math.min(1, level / 3) : 0;
      for (const l of lids) l.scale.y = 0.01 + close * 0.9;
      body.scale.y = 1.15 + (talking && level < 2 ? Math.abs(Math.sin(t * 8)) * 0.04 : 0);
    },
  };
}

// ── 쿼카: 은은하게 웃는 힐러 ──
function quokka(a) {
  const g = new THREE.Group();
  const fur = std(a.color);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), fur);
  body.scale.set(1, 1.15, 0.95);
  body.position.y = 0.5;
  body.castShadow = true;
  g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), std('#d9c0a0'));
  belly.scale.set(1, 1.2, 0.45);
  belly.position.set(0, 0.45, 0.28);
  g.add(belly);
  const head = new THREE.Group();
  head.position.set(0, 1.0, 0.05);
  g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 12), fur);
  skull.scale.set(1.05, 0.95, 1);
  skull.castShadow = true;
  head.add(skull);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), std('#c9a682'));
  muzzle.scale.set(1.2, 0.8, 0.8);
  muzzle.position.set(0, -0.08, 0.24);
  head.add(muzzle);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: '#2a201a' }));
  nose.position.set(0, -0.03, 0.35);
  head.add(nose);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 6, 14, Math.PI), new THREE.MeshBasicMaterial({ color: '#2a201a' }));
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.1, 0.33);
  head.add(smile);
  addEyes(head, 0.06, 0.24, 0.12, 0.04);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), fur);
    ear.scale.set(1, 1, 0.5);
    ear.position.set(0.22 * s, 0.24, -0.02);
    head.add(ear);
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.05, 10), new THREE.MeshBasicMaterial({ color: '#ff9aa8', transparent: true, opacity: 0.7 }));
    blush.position.set(0.18 * s, -0.05, 0.27);
    blush.rotation.y = 0.5 * s;
    head.add(blush);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), fur);
    foot.scale.set(0.8, 0.5, 1.6);
    foot.position.set(0.18 * s, 0.06, 0.15);
    g.add(foot);
  }
  return {
    group: g,
    facer: g,
    character: g,
    bubbleY: 1.9,
    radius: 0.6,
    idle(t, talking) {
      head.rotation.z = Math.sin(t * (talking ? 3 : 1)) * 0.12;
      g.children[0].scale.y = 1.15 + Math.sin(t * 2) * 0.02;
    },
  };
}

// ── 미어캣: 굴에서 불쑥 솟아 따라 하는 도발형 ──
function meerkat(a) {
  const g = new THREE.Group();
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#a77b52', { roughness: 1 }));
  mound.scale.y = 0.4;
  g.add(mound);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.3, 14), new THREE.MeshBasicMaterial({ color: '#2a1d14' }));
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = 0.31;
  g.add(hole);
  const kat = new THREE.Group();
  kat.position.y = 0.25;
  g.add(kat);
  const fur = std(a.color);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.6, 6, 12), fur);
  body.position.y = 0.55;
  body.castShadow = true;
  kat.add(body);
  const belly = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.4, 4, 10), std('#efdcbc'));
  belly.position.set(0, 0.5, 0.1);
  kat.add(belly);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 6), fur);
    arm.position.set(0.15 * s, 0.68, 0.14);
    arm.rotation.x = 0.6;
    kat.add(arm);
  }
  const head = new THREE.Group();
  head.position.y = 1.12;
  kat.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), fur);
  skull.scale.set(1, 1, 1.15);
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), fur);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.04, 0.2);
  head.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), new THREE.MeshBasicMaterial({ color: '#2a201a' }));
  nose.position.set(0, -0.04, 0.3);
  head.add(nose);
  for (const s of [-1, 1]) {
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), std('#5a4330'));
    patch.scale.set(1, 0.8, 0.5);
    patch.position.set(0.09 * s, 0.03, 0.14);
    head.add(patch);
    // 반쯤 감은 눈
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.02), new THREE.MeshBasicMaterial({ color: '#1a120c' }));
    lid.position.set(0.09 * s, 0.035, 0.17);
    head.add(lid);
  }
  // 한쪽만 올라간 입꼬리
  const smirk = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: '#1a120c' }));
  smirk.position.set(0.03, -0.1, 0.22);
  smirk.rotation.z = 0.35;
  head.add(smirk);
  return {
    group: g,
    facer: kat,
    character: kat,
    bubbleY: 2.1,
    followBubbleY: 1.6,
    radius: 0.7,
    idle(t, talking) {
      head.rotation.z = Math.sin(t * (talking ? 3 : 0.9)) * 0.3;
      kat.position.y = talking ? 0.25 : 0.25 + Math.max(0, Math.sin(t * 0.7)) * 0.08;
    },
  };
}

// ── 쉬뱀: 바위 위의 똬리 (화날수록 연두 → 초록 → 보라) ──
function snake(a) {
  const g = new THREE.Group();
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), std('#a0573f', { flatShading: true }));
  rock.scale.set(1.3, 0.5, 1.1);
  rock.position.y = 0.3;
  rock.castShadow = true;
  g.add(rock);
  const coilG = new THREE.Group();
  coilG.position.y = 0.72;
  g.add(coilG);
  const skin = std(a.color, { roughness: 0.5 });
  const coils = [];
  [[0.42, 0], [0.32, 0.18], [0.22, 0.34]].forEach(([r, y]) => {
    const c = new THREE.Mesh(new THREE.TorusGeometry(r, 0.11, 8, 20), skin);
    c.rotation.x = Math.PI / 2;
    c.position.y = y;
    c.castShadow = true;
    coilG.add(c);
    coils.push(c);
  });
  const neck = new THREE.Group();
  neck.position.set(0, 0.45, 0.1);
  coilG.add(neck);
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.5, 8), skin);
  neckMesh.position.y = 0.2;
  neck.add(neckMesh);
  const head = new THREE.Group();
  head.position.set(0, 0.5, 0.06);
  neck.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skin);
  skull.scale.set(1.1, 0.75, 1.35);
  head.add(skull);
  for (const s of [-1, 1]) {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 5), std('#ffffff'));
    fang.rotation.x = Math.PI;
    fang.position.set(0.05 * s, -0.11, 0.15);
    head.add(fang);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.02), new THREE.MeshBasicMaterial({ color: '#1a120c' }));
    brow.position.set(0.08 * s, 0.09, 0.15);
    brow.rotation.z = -0.5 * s;
    head.add(brow);
  }
  addEyes(head, 0.04, 0.15, 0.08, 0.03);
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.14), std('#e2453c'));
  tongue.position.set(0, -0.05, 0.25);
  head.add(tongue);
  const stage = ['#9ad66a', '#3f9a4a', '#8a4fb5'].map((c) => new THREE.Color(c));
  return {
    group: g,
    facer: coilG,
    character: coilG,
    bubbleY: 2.2,
    followBubbleY: 1.4,
    radius: 1.2,
    idle(t, talking, level = 0) {
      neck.rotation.z = Math.sin(t * (talking ? 3 + level * 2 : 1.2)) * 0.25;
      tongue.scale.z = Math.max(0, Math.sin(t * 9)) * 1.0 + 0.1;
      skin.color.lerp(stage[talking ? Math.min(level, 2) : 0], 0.08);
      const grow = 1 + (talking ? Math.min(level, 2) * 0.12 : 0);
      coilG.scale.lerp(new THREE.Vector3(grow, grow, grow), 0.08);
    },
  };
}

// ── 진짜냐: 연못 속 피라냐 떼 (말 걸수록 늘어나요) ──
function piranhas(a) {
  const g = new THREE.Group();
  const school = new THREE.Group();
  g.add(school);
  const fishes = [];
  for (let i = 0; i < 10; i++) {
    const fish = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), std(a.color, { roughness: 0.5 }));
    body.scale.set(0.6, 0.9, 1.2);
    fish.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), std('#e2453c'));
    belly.scale.set(0.55, 0.6, 1.0);
    belly.position.set(0, -0.08, 0.02);
    fish.add(belly);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.2, 4), std(a.color));
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = -0.32;
    fish.add(tail);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.08), std('#f4efe6'));
    jaw.position.set(0, -0.06, 0.26);
    fish.add(jaw);
    addEyes(fish, 0.07, 0.2, 0.09, 0.03);
    fish.userData = { r: 1.5 + (i % 4) * 0.9, speed: 0.6 + (i % 3) * 0.25, off: i * 1.7, depth: 0.38 + (i % 2) * 0.1 };
    school.add(fish);
    fishes.push(fish);
  }
  let shown = 3;
  return {
    group: g,
    facer: school,
    character: school,
    bubbleY: 2.2,
    radius: 5.6,
    idle(t, talking, level = 0) {
      const want = talking ? [3, 6, 10][Math.min(level, 2)] : 3;
      shown += (want - shown) * 0.05;
      fishes.forEach((f, i) => {
        f.visible = i < Math.round(shown);
        const u = f.userData;
        const ang = t * u.speed + u.off;
        f.position.set(Math.cos(ang) * u.r, u.depth + Math.sin(t * 3 + i) * 0.05 + (talking && level >= 2 ? Math.abs(Math.sin(t * 6 + i)) * 0.35 : 0), Math.sin(ang) * u.r);
        f.rotation.y = -ang;
      });
    },
  };
}

const MODELS = { bigBird, smallBird, sloth, woodpecker, buffalo, horse, hippo, owl, quokka, meerkat, snake, piranhas };

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
  // companionId: 같이 다니는 친구. 다른 숲 친구면 손님으로 데려와요.
  constructor(scene, world, { companionId = null, arrival = null } = {}) {
    this.scene = scene;
    this.world = world;
    this.follower = null;
    const natives = ANIMALS.filter((d) => (d.area || 'catchup') === world.area.id);
    this.list = natives.map((data) => this.create(data, world.zones[data.spot]));
    if (companionId) {
      let a = this.byId(companionId);
      if (!a && ANIMAL_BY_ID[companionId]) {
        const at = arrival || world.zones.spawn;
        a = this.create(ANIMAL_BY_ID[companionId], { x: at.x + 1.5, z: at.z + 1.5 }, true);
        this.list.push(a);
      }
      if (a) {
        this.startFollow(a);
        // 손님은 나무·횃대 같은 소품은 두고 와요
        if (a.visitor && a.model.group !== a.model.character) a.model.group.visible = false;
      }
    }
  }

  create(data, spot, visitor = false) {
    const world = this.world;
    const model = MODELS[data.model](data);
    const y = world.heightAt(spot.x, spot.z);
    model.group.position.set(spot.x, y, spot.z);
    model.group.rotation.y = Math.atan2(-spot.x, -spot.z);
    world.root.add(model.group);
    const homeCollider = { x: spot.x, z: spot.z, r: visitor ? 0 : model.radius };
    world.colliders.push(homeCollider);
    if (!visitor) {
      for (const c of model.colliders || []) {
        const cos = Math.cos(model.group.rotation.y);
        const sin = Math.sin(model.group.rotation.y);
        world.colliders.push({ x: spot.x + c.x * cos + c.z * sin, z: spot.z - c.x * sin + c.z * cos, r: c.r });
      }
    }
    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false }));
    bubble.renderOrder = 10;
    bubble.visible = false;
    world.root.add(bubble);
    const ch = model.character;
    return {
      data,
      model,
      bubble,
      visitor,
      homeCollider,
      home: model.group.position,
      pos: new THREE.Vector3().copy(model.group.position),
      phase: Math.random() * 10,
      bubbleTimer: 2 + Math.random() * 4,
      bubbleShown: 0,
      talking: false,
      talkLevel: 0,
      following: false,
      moving: 0,
      sulking: false,
      restore: { parent: ch.parent, pos: ch.position.clone(), quat: ch.quaternion.clone() },
      groundOffset: 0,
    };
  }

  // 숲을 떠날 때 정리
  dispose() {
    for (const a of this.list) if (a.following) disposeObject(a.model.character);
    this.list = [];
    this.follower = null;
  }

  byId(id) {
    return this.list.find((a) => a.data.id === id);
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

  // ── 같이 다니기 ──
  startFollow(a) {
    if (this.follower && this.follower !== a) this.stopFollow(this.follower);
    const ch = a.model.character;
    this.scene.attach(ch);
    ch.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(ch);
    const wp = new THREE.Vector3();
    ch.getWorldPosition(wp);
    a.groundOffset = wp.y - box.min.y;
    ch.rotation.set(0, ch.rotation.y, 0);
    a.following = true;
    a.sulking = false;
    a.sulkTimer = 45 + Math.random() * 35;
    a.homeCollider.r = 0;
    this.follower = a;
  }

  stopFollow(a) {
    const ch = a.model.character;
    if (a.visitor) {
      // 손님 친구는 자기 숲으로 돌아가요
      disposeObject(ch);
      a.bubble.visible = false;
      this.list = this.list.filter((x) => x !== a);
      if (this.follower === a) this.follower = null;
      return;
    }
    a.restore.parent.add(ch);
    ch.position.copy(a.restore.pos);
    ch.quaternion.copy(a.restore.quat);
    a.following = false;
    a.sulking = false;
    a.moving = 0;
    a.homeCollider.r = a.model.radius;
    if (this.follower === a) this.follower = null;
  }

  update(dt, player) {
    const playerPos = player.position;
    for (const a of this.list) {
      a.phase += dt;
      const ch = a.model.character;

      if (a.following) {
        // 마르는 가끔 삐져요
        if (a.data.id === 'mar' && !a.sulking) {
          a.sulkTimer -= dt;
          if (a.sulkTimer <= 0) {
            a.sulking = true;
            this.say(a, '힝…', 3);
            this.onSulk?.(a);
          }
        }
        if (a.sulking) {
          a.moving = 0;
          if (a.bubbleShown <= 0 && Math.random() < dt * 0.4) this.say(a, Math.random() < 0.5 ? '힝…' : '히힝…', 2.2);
          const dx = playerPos.x - ch.position.x;
          const dz = playerPos.z - ch.position.z;
          // 삐져서 등을 돌리고 있어요
          ch.rotation.y = Math.atan2(-dx, -dz);
        } else {
          // 플레이어 오른쪽 뒤로 따라가기
          // 카메라를 가리지 않게 옆쪽에서 나란히 걸어요
          const back = 0.6 + a.model.radius * 0.5;
          const side = 1.5 + a.model.radius;
          const f = player.facing;
          const tx = playerPos.x - Math.sin(f) * back + Math.cos(f) * side;
          const tz = playerPos.z - Math.cos(f) * back - Math.sin(f) * side;
          // 너무 멀어지면 (순간이동 등) 바로 옆으로 따라와요
          if (Math.hypot(tx - ch.position.x, tz - ch.position.z) > 25) ch.position.set(tx, ch.position.y, tz);
          const dx = tx - ch.position.x;
          const dz = tz - ch.position.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.4) {
            const speed = Math.min(d * 2.2, player.speed * player.speedMul * 1.15 + 1);
            ch.position.x += (dx / d) * speed * dt;
            ch.position.z += (dz / d) * speed * dt;
            const want = Math.atan2(dx, dz);
            const diff = Math.atan2(Math.sin(want - ch.rotation.y), Math.cos(want - ch.rotation.y));
            ch.rotation.y += diff * Math.min(1, dt * 8);
            a.moving = Math.min(1, d / 2);
          } else {
            a.moving *= 0.9;
            const want = Math.atan2(playerPos.x - ch.position.x, playerPos.z - ch.position.z);
            const diff = Math.atan2(Math.sin(want - ch.rotation.y), Math.cos(want - ch.rotation.y));
            ch.rotation.y += diff * Math.min(1, dt * 3);
          }
        }
        const hop = Math.abs(Math.sin(a.phase * 10)) * 0.12 * a.moving;
        ch.position.y = Math.max(this.world.heightAt(ch.position.x, ch.position.z), -0.35) + a.groundOffset + hop;
        a.pos.copy(ch.position);
      } else {
        a.pos.copy(a.home);
        // 가까이 오면 플레이어 쪽을 바라봐요
        const dx = playerPos.x - a.pos.x;
        const dz = playerPos.z - a.pos.z;
        const dist = Math.hypot(dx, dz);
        const fc = a.model.facer;
        const parentRot = fc === a.model.group ? 0 : a.model.group.rotation.y;
        if (a.homeRot === undefined) a.homeRot = fc.rotation.y + parentRot;
        const want = (dist < 9 ? Math.atan2(dx, dz) : a.homeRot) - parentRot;
        const diff = Math.atan2(Math.sin(want - fc.rotation.y), Math.cos(want - fc.rotation.y));
        fc.rotation.y += diff * Math.min(1, dt * 3);
      }

      a.model.idle(a.phase, a.talking, a.talkLevel, a.moving);

      // 말풍선 위치
      const by = a.following ? a.model.followBubbleY ?? a.model.bubbleY : a.model.bubbleY;
      if (a.following) a.bubble.position.set(a.pos.x, a.pos.y - a.groundOffset + by + 0.3, a.pos.z);
      else a.bubble.position.set(a.home.x, a.home.y + by, a.home.z);

      // 혼잣말 말풍선 (가까이 있을 때만)
      const near = Math.hypot(a.pos.x - playerPos.x, a.pos.z - playerPos.z) < 14;
      if (a.bubbleShown > 0) {
        a.bubbleShown -= dt;
        if (a.bubbleShown <= 0) a.bubble.visible = false;
      } else if (near && !a.talking && !a.following) {
        a.bubbleTimer -= dt;
        if (a.bubbleTimer <= 0) {
          this.say(a, a.data.lines[0], 2.4);
          a.bubbleTimer = 5 + Math.random() * 5;
        }
      }
    }
  }

  // skipFollower: 같이 다니는 친구(안 삐졌을 때)는 빼고 찾기
  findTalkable(pos, range = 3.6, skipFollower = false) {
    let best = null;
    let bestD = Infinity;
    for (const a of this.list) {
      if (skipFollower && a.following && !a.sulking) continue;
      const d = Math.hypot(a.pos.x - pos.x, a.pos.z - pos.z) - a.model.radius;
      if (d < range && d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best;
  }
}
