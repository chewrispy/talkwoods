import * as THREE from 'three';

// 숲의 주요 장소들 — 곤충 데이터의 zone 이름과 연결돼요.
export const ZONES = {
  spawn: { x: 0, z: 0, r: 5 },
  meadow: { x: 17, z: -12, r: 8 }, // 꽃밭
  pond: { x: -15, z: 14, r: 6.5 }, // 연못
  stumps: { x: -12, z: -15, r: 6 }, // 그루터기 공터
};

const WORLD_RADIUS = 56; // 플레이어가 갈 수 있는 반경

export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function heightAt(x, z) {
  let h = 0.7 * Math.sin(x * 0.075) * Math.cos(z * 0.065) + 0.35 * Math.sin(x * 0.17 + z * 0.13) + 0.2 * Math.cos(z * 0.21 - x * 0.05);
  // 연못은 오목하게
  const p = ZONES.pond;
  const dp = Math.hypot(x - p.x, z - p.z);
  const k = 1 - smoothstep(p.r - 1.5, p.r + 3, dp);
  h = h * (1 - k) + -0.9 * k;
  // 가장자리는 살짝 언덕처럼
  const d = Math.hypot(x, z);
  h += smoothstep(WORLD_RADIUS - 6, WORLD_RADIUS + 10, d) * 3.5;
  return h;
}

function inZone(x, z, margin = 0) {
  for (const key in ZONES) {
    const zn = ZONES[key];
    if (Math.hypot(x - zn.x, z - zn.z) < zn.r + margin) return true;
  }
  return false;
}

export function createForest(scene) {
  const rand = mulberry32(20261118);
  const colliders = [];

  // ── 땅 ──
  const size = 170;
  const groundGeo = new THREE.PlaneGeometry(size, size, 140, 140);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position;
  const colors = [];
  const cA = new THREE.Color('#6f9a4a');
  const cB = new THREE.Color('#9dbb5a');
  const cDirt = new THREE.Color('#8a7350');
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
    const n = 0.5 + 0.5 * Math.sin(x * 0.31) * Math.cos(z * 0.27);
    tmp.copy(cA).lerp(cB, n * 0.7);
    const s = ZONES.stumps;
    const ds = Math.hypot(x - s.x, z - s.z);
    if (ds < s.r) tmp.lerp(cDirt, (1 - ds / s.r) * 0.45);
    colors.push(tmp.r, tmp.g, tmp.b);
  }
  groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  ground.receiveShadow = true;
  scene.add(ground);

  // ── 연못 ──
  const p = ZONES.pond;
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(p.r + 0.6, 48),
    new THREE.MeshStandardMaterial({ color: '#5aa3c4', roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.88 })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(p.x, -0.35, p.z);
  scene.add(water);
  colliders.push({ x: p.x, z: p.z, r: p.r - 0.4 });

  // 연못가 돌
  const stoneGeo = new THREE.DodecahedronGeometry(0.45, 0);
  const stoneMat = new THREE.MeshStandardMaterial({ color: '#9a9a8e', roughness: 1, flatShading: true });
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + rand() * 0.2;
    const r = p.r + 0.6 + rand() * 0.5;
    const x = p.x + Math.cos(a) * r;
    const z = p.z + Math.sin(a) * r;
    const st = new THREE.Mesh(stoneGeo, stoneMat);
    st.position.set(x, heightAt(x, z) - 0.05, z);
    st.scale.setScalar(0.6 + rand() * 0.7);
    st.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    st.castShadow = true;
    scene.add(st);
  }

  // ── 그루터기 ──
  const s = ZONES.stumps;
  const stumpGeo = new THREE.CylinderGeometry(0.55, 0.7, 0.55, 12);
  const stumpMat = new THREE.MeshStandardMaterial({ color: '#7b5a3a', roughness: 1 });
  const ringMat = new THREE.MeshStandardMaterial({ color: '#d8b98a', roughness: 1 });
  const ringGeo = new THREE.CircleGeometry(0.52, 12);
  const stumpSpots = [
    [0, 0], [2.6, 1.4], [-2.2, 2.1], [1.2, -2.8], [-2.8, -1.6],
  ];
  for (const [ox, oz] of stumpSpots) {
    const x = s.x + ox;
    const z = s.z + oz;
    const y = heightAt(x, z);
    const st = new THREE.Mesh(stumpGeo, stumpMat);
    st.position.set(x, y + 0.25, z);
    st.castShadow = st.receiveShadow = true;
    scene.add(st);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, y + 0.53, z);
    scene.add(ring);
    colliders.push({ x, z, r: 0.7 });
  }

  // ── 나무 ──
  const treeSpots = [];
  const tryAddTree = (x, z) => {
    if (inZone(x, z, 2.2)) return;
    for (const t of treeSpots) if (Math.hypot(t.x - x, t.z - z) < 2.6) return;
    treeSpots.push({ x, z, kind: rand() < 0.55 ? 'pine' : 'round', s: 0.8 + rand() * 0.6 });
  };
  for (let i = 0; i < 900 && treeSpots.length < 150; i++) {
    const a = rand() * Math.PI * 2;
    const r = 7 + Math.sqrt(rand()) * 48;
    tryAddTree(Math.cos(a) * r, Math.sin(a) * r);
  }
  // 경계를 두르는 빽빽한 숲
  for (let i = 0; i < 260; i++) {
    const a = (i / 260) * Math.PI * 2 + rand() * 0.02;
    const r = WORLD_RADIUS + 2 + rand() * 14;
    tryAddTree(Math.cos(a) * r, Math.sin(a) * r);
  }

  const pines = treeSpots.filter((t) => t.kind === 'pine');
  const rounds = treeSpots.filter((t) => t.kind === 'round');
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.6, 7);
  trunkGeo.translate(0, 0.8, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#6b4b32', roughness: 1 });
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeSpots.length);
  trunks.castShadow = true;

  const coneGeo = new THREE.ConeGeometry(1.35, 2.4, 8);
  const pineMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, flatShading: true });
  const pineLayers = new THREE.InstancedMesh(coneGeo, pineMat, pines.length * 3);
  pineLayers.castShadow = true;

  const crownGeo = new THREE.IcosahedronGeometry(1.5, 1);
  const roundMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, flatShading: true });
  const crowns = new THREE.InstancedMesh(crownGeo, roundMat, rounds.length * 2);
  crowns.castShadow = true;

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const pineColors = ['#2f6b45', '#3b7a4c', '#2a5e44', '#447f50'];
  const roundColors = ['#6ea24b', '#7fb04f', '#5e9446', '#93b957', '#c9a44a'];
  let ti = 0;
  let pi = 0;
  let ri = 0;
  for (const t of treeSpots) {
    const y = heightAt(t.x, t.z) - 0.1;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
    m.compose(v.set(t.x, y, t.z), q, sc.set(t.s, t.s, t.s));
    trunks.setMatrixAt(ti++, m);
    if (Math.hypot(t.x, t.z) < WORLD_RADIUS + 3)
      colliders.push({ x: t.x, z: t.z, r: 0.45 * t.s, tree: true, canopy: 1.5 * t.s, top: y + 4.6 * t.s });
    if (t.kind === 'pine') {
      const col = new THREE.Color(pineColors[Math.floor(rand() * pineColors.length)]);
      for (let k = 0; k < 3; k++) {
        const layerS = t.s * (1 - k * 0.22);
        m.compose(v.set(t.x, y + t.s * (2.0 + k * 1.05), t.z), q, sc.set(layerS, layerS, layerS));
        pineLayers.setMatrixAt(pi, m);
        pineLayers.setColorAt(pi++, col);
      }
    } else {
      const col = new THREE.Color(roundColors[Math.floor(rand() * roundColors.length)]);
      m.compose(v.set(t.x, y + t.s * 2.6, t.z), q, sc.set(t.s * 1.1, t.s, t.s * 1.1));
      crowns.setMatrixAt(ri, m);
      crowns.setColorAt(ri++, col);
      const ox = (rand() - 0.5) * 0.9 * t.s;
      const oz = (rand() - 0.5) * 0.9 * t.s;
      m.compose(v.set(t.x + ox, y + t.s * 3.4, t.z + oz), q, sc.set(t.s * 0.7, t.s * 0.7, t.s * 0.7));
      crowns.setMatrixAt(ri, m);
      crowns.setColorAt(ri++, col.clone().offsetHSL(0, 0, 0.05));
    }
  }
  scene.add(trunks, pineLayers, crowns);

  // ── 풀 ──
  const grassGeo = new THREE.ConeGeometry(0.07, 0.45, 3);
  grassGeo.translate(0, 0.2, 0);
  const grassMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 });
  const GRASS = 1400;
  const grass = new THREE.InstancedMesh(grassGeo, grassMat, GRASS);
  const grassCols = ['#5f8f3e', '#76a548', '#8db552', '#6b9a40'];
  let gi = 0;
  while (gi < GRASS) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (WORLD_RADIUS + 4);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x - p.x, z - p.z) < p.r + 0.8) continue;
    const sz = 0.6 + rand() * 1.0;
    q.setFromEuler(new THREE.Euler((rand() - 0.5) * 0.4, rand() * 3, (rand() - 0.5) * 0.4));
    m.compose(v.set(x, heightAt(x, z) - 0.02, z), q, sc.set(sz, sz, sz));
    grass.setMatrixAt(gi, m);
    grass.setColorAt(gi++, new THREE.Color(grassCols[Math.floor(rand() * grassCols.length)]));
  }
  scene.add(grass);

  // ── 꽃밭 ──
  const md = ZONES.meadow;
  const petalGeo = new THREE.IcosahedronGeometry(0.13, 0);
  const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
  stemGeo.translate(0, 0.2, 0);
  const FLOWERS = 220;
  const petals = new THREE.InstancedMesh(petalGeo, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 }), FLOWERS);
  const stems = new THREE.InstancedMesh(stemGeo, new THREE.MeshStandardMaterial({ color: '#4f7f36' }), FLOWERS);
  const flowerCols = ['#ffd1e1', '#ffe680', '#ffffff', '#c9b6ff', '#ffb38a', '#ff8fb1'];
  for (let i = 0; i < FLOWERS; i++) {
    const inMeadow = i < 190;
    const a = rand() * Math.PI * 2;
    let x;
    let z;
    if (inMeadow) {
      const r = Math.sqrt(rand()) * md.r;
      x = md.x + Math.cos(a) * r;
      z = md.z + Math.sin(a) * r;
    } else {
      const r = 6 + rand() * 44;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
    }
    const y = heightAt(x, z);
    const h = 0.7 + rand() * 0.6;
    m.compose(v.set(x, y, z), q.identity(), sc.set(1, h, 1));
    stems.setMatrixAt(i, m);
    m.compose(v.set(x, y + 0.4 * h, z), q.identity(), sc.set(1, 0.7, 1));
    petals.setMatrixAt(i, m);
    petals.setColorAt(i, new THREE.Color(flowerCols[Math.floor(rand() * flowerCols.length)]));
  }
  scene.add(stems, petals);

  // ── 바위 ──
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const r = 8 + rand() * 46;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (inZone(x, z, 1)) continue;
    const rock = new THREE.Mesh(stoneGeo, stoneMat);
    const rs = 0.8 + rand() * 1.4;
    rock.scale.set(rs, rs * 0.7, rs);
    rock.position.set(x, heightAt(x, z), z);
    rock.rotation.set(rand(), rand() * 3, rand());
    rock.castShadow = rock.receiveShadow = true;
    scene.add(rock);
    colliders.push({ x, z, r: 0.42 * rs });
  }

  return { heightAt, colliders, boundary: WORLD_RADIUS, zones: ZONES };
}
