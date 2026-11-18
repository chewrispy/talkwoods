import * as THREE from 'three';

// 플레이어 머리 위 새싹. 레벨과 특성에 따라 다시 만들어져요.
const LEAF_GREEN = '#6fbf4a';

let glowTex = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

function roundLeaf(mat, size) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 6), mat);
  m.scale.set(1.6, 0.42, 0.9);
  return m;
}

function pointyLeaf(mat, size) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(size * 0.6, size * 2.3, 5), mat);
  m.scale.set(1, 1, 0.35);
  return m;
}

export class Sprout {
  constructor(parent) {
    this.root = new THREE.Group();
    parent.add(this.root);
    this.glows = [];
  }

  build(level, traits) {
    this.root.clear();
    this.glows = [];
    const has = (t) => traits.some((x) => x.trait === t);

    const stemH = 0.12 + level * 0.07;
    const leafMat = new THREE.MeshStandardMaterial({ color: has('bang') ? '#4fa63a' : LEAF_GREEN, roughness: 0.8 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014 + level * 0.003, 0.018 + level * 0.004, stemH, 6), leafMat);
    stem.position.y = stemH / 2;
    this.root.add(stem);

    // 잎: 레벨마다 한 쌍씩 늘어나요
    const tips = [];
    const pairs = Math.min(level, 4);
    for (let i = 0; i < pairs; i++) {
      const y = stemH - i * (stemH / (pairs + 0.6));
      const size = 0.075 + (pairs - i) * 0.006 + level * 0.004;
      const turn = i * 1.2;
      for (const s of [-1, 1]) {
        const holder = new THREE.Group();
        holder.position.y = y;
        holder.rotation.y = turn;
        const leaf = has('bang') ? pointyLeaf(leafMat, size) : roundLeaf(leafMat, size);
        if (has('bang')) {
          leaf.rotation.z = -1.0 * s;
          leaf.position.set(size * 1.0 * s, size * 0.45, 0);
        } else {
          leaf.rotation.z = -0.5 * s;
          leaf.position.set(size * 1.25 * s, size * 0.25, 0);
        }
        holder.add(leaf);
        this.root.add(holder);
        tips.push({ holder, x: size * (has('bang') ? 1.9 : 2.4) * s, y: size * (has('bang') ? 1.2 : 0.6) });
      }
    }

    // 물음표 덩굴
    if (has('curl')) {
      const vineMat = new THREE.MeshStandardMaterial({ color: '#8cd36a', roughness: 0.7 });
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.011, 6, 18, Math.PI * 1.5), vineMat);
      arc.position.set(0.03, stemH + 0.07, 0);
      arc.rotation.z = -0.6;
      this.root.add(arc);
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.06, 5), vineMat);
      tail.position.set(0.03, stemH + 0.0, 0);
      this.root.add(tail);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), vineMat);
      dot.position.set(0.03, stemH - 0.06, 0.0);
      this.root.add(dot);
    }

    // 빛 방울
    if (has('glow')) {
      const dropMat = new THREE.MeshBasicMaterial({ color: '#e8ff8a' });
      for (const t of tips) {
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), dropMat);
        d.position.set(t.x, t.y, 0);
        t.holder.add(d);
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: glowTexture(), color: '#e8ff8a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        glow.scale.setScalar(0.16);
        glow.position.copy(d.position);
        t.holder.add(glow);
        this.glows.push(glow);
      }
    }

    // 그로타 친구: 깃털 잎
    if (has('feather')) {
      const m = new THREE.MeshStandardMaterial({ color: '#ffd45e', roughness: 0.5, emissive: '#5a3f00', emissiveIntensity: 0.3 });
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 6), m);
      f.scale.set(0.7, 2.6, 0.3);
      f.position.set(-0.04, stemH + 0.13, 0);
      f.rotation.z = 0.35;
      this.root.add(f);
    }

    // 아뇽 친구: 단호한 X자 잎
    if (has('notch')) {
      const m = new THREE.MeshStandardMaterial({ color: '#8fbbe8', roughness: 0.6 });
      for (const s of [-1, 1]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.02), m);
        bar.rotation.z = 0.78 * s;
        bar.position.set(0, stemH + 0.02, 0.05);
        this.root.add(bar);
      }
    }

    // 그럴스도 친구: 느긋하게 늘어진 잎
    if (has('droopy')) {
      const m = new THREE.MeshStandardMaterial({ color: '#a3b86c', roughness: 0.8 });
      const holder = new THREE.Group();
      holder.position.set(0, stemH * 0.9, 0);
      holder.rotation.y = -0.6;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6), m);
      leaf.scale.set(2.8, 0.35, 0.8);
      leaf.position.set(0.17, -0.06, 0);
      leaf.rotation.z = -0.55;
      holder.add(leaf);
      this.root.add(holder);
    }

    // 유카구리 친구: 빨간 볏 잎
    if (has('peck')) {
      const m = new THREE.MeshStandardMaterial({ color: '#e2453c', roughness: 0.6 });
      const crest = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), m);
      crest.scale.set(0.6, 1.4, 1.6);
      crest.position.set(0, stemH + 0.06, -0.03);
      this.root.add(crest);
    }

    // 그래소 친구: 뿔처럼 휜 덩굴
    if (has('horn')) {
      const m = new THREE.MeshStandardMaterial({ color: '#e8dcc4', roughness: 0.7 });
      for (const s of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.013, 5, 12, Math.PI * 0.7), m);
        horn.position.set(0.05 * s, 0.03, 0);
        horn.rotation.set(0, s > 0 ? 0 : Math.PI, 0.3);
        this.root.add(horn);
      }
    }

    // 마르 친구: 바람에 날리는 갈기 잎
    if (has('mane')) {
      const m = new THREE.MeshStandardMaterial({ color: '#c99673', roughness: 0.8 });
      for (let i = 0; i < 3; i++) {
        const strand = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.12, 0.01), m);
        strand.position.set(-0.02, stemH * (0.45 + i * 0.18), -0.03 - i * 0.01);
        strand.rotation.x = -0.9;
        this.root.add(strand);
      }
    }

    // 순하마 친구: 동그란 연잎
    if (has('round')) {
      const m = new THREE.MeshStandardMaterial({ color: '#7fb069', roughness: 0.7, side: THREE.DoubleSide });
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.09, 14, 0.3, Math.PI * 1.8), m);
      pad.rotation.x = -Math.PI / 2 + 0.25;
      pad.position.set(-0.12, stemH * 0.35, 0.04);
      this.root.add(pad);
    }

    // 오엉 친구: 귀깃 잎
    if (has('tuft')) {
      const m = new THREE.MeshStandardMaterial({ color: '#8a7560', roughness: 0.8 });
      for (const s of [-1, 1]) {
        const t = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 5), m);
        t.position.set(0.045 * s, stemH + 0.04, 0.02);
        t.rotation.z = -0.4 * s;
        this.root.add(t);
      }
    }

    // 쿼카 친구: 웃는 잎
    if (has('smile')) {
      const m = new THREE.MeshStandardMaterial({ color: '#ff9aa8', roughness: 0.6 });
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), m);
      arc.rotation.z = Math.PI;
      arc.position.set(0, stemH * 0.55, 0.05);
      this.root.add(arc);
    }

    // 미어캣 친구: 거울 잎
    if (has('mirror')) {
      const m = new THREE.MeshStandardMaterial({ color: '#dfe8ef', roughness: 0.1, metalness: 0.9 });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), m);
      disc.position.set(0.1, stemH * 0.7, 0.02);
      disc.rotation.y = -0.5;
      this.root.add(disc);
    }

    // 쉬뱀 친구: 줄기를 감은 똬리 덩굴
    if (has('coil')) {
      const m = new THREE.MeshStandardMaterial({ color: '#9ad66a', roughness: 0.6 });
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 14), m);
      coil.rotation.x = Math.PI / 2;
      coil.position.y = stemH * 0.25;
      this.root.add(coil);
    }

    // 진짜냐 친구: 지느러미 잎
    if (has('fin')) {
      const m = new THREE.MeshStandardMaterial({ color: '#e2453c', roughness: 0.6 });
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 3), m);
      fin.scale.z = 0.3;
      fin.position.set(-0.07, stemH * 0.8, 0);
      fin.rotation.z = 0.8;
      this.root.add(fin);
    }

    // 최고 레벨: 꼭대기에 꽃봉오리
    if (level >= 5) {
      const bud = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshStandardMaterial({ color: '#ff9ec4', roughness: 0.6 }));
      bud.scale.set(1, 1.3, 1);
      bud.position.y = stemH + 0.05;
      this.root.add(bud);
    }
  }

  update(t) {
    this.root.rotation.z = Math.sin(t * 2.2) * 0.06;
    for (const g of this.glows) g.material.opacity = 0.6 + 0.4 * Math.sin(t * 3 + g.position.x * 20);
  }
}
