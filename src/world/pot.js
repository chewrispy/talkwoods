import * as THREE from 'three';

// 문장 냄비: 모닥불 위에서 보글보글
export function createPot(scene, world) {
  const z = world.zones.pot;
  const g = new THREE.Group();
  const y = world.heightAt(z.x, z.z);
  g.position.set(z.x, y, z.z);
  scene.add(g);

  const stoneMat = new THREE.MeshStandardMaterial({ color: '#8f8b80', roughness: 1, flatShading: true });
  const stoneGeo = new THREE.DodecahedronGeometry(0.22, 0);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const st = new THREE.Mesh(stoneGeo, stoneMat);
    st.position.set(Math.cos(a) * 0.85, 0.08, Math.sin(a) * 0.85);
    st.rotation.set(i, i * 2, i * 3);
    st.castShadow = true;
    g.add(st);
  }
  const logMat = new THREE.MeshStandardMaterial({ color: '#6b4b32', roughness: 1 });
  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6), logMat);
    log.rotation.set(Math.PI / 2, 0, (i / 3) * Math.PI);
    log.position.y = 0.1;
    g.add(log);
  }
  const flames = [];
  const flameCols = ['#ffb13b', '#ff7a2f', '#ffd76a'];
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.16 - i * 0.03, 0.5 - i * 0.08, 6), new THREE.MeshBasicMaterial({ color: flameCols[i], transparent: true, opacity: 0.9 }));
    f.position.set((i - 1) * 0.1, 0.35, (i % 2) * 0.08);
    g.add(f);
    flames.push(f);
  }
  // 냄비
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push(new THREE.Vector2(0.15 + Math.sin(t * Math.PI * 0.85) * 0.5, t * 0.62));
  }
  const potMat = new THREE.MeshStandardMaterial({ color: '#3b3a40', roughness: 0.45, metalness: 0.4, side: THREE.DoubleSide });
  const pot = new THREE.Mesh(new THREE.LatheGeometry(pts, 18), potMat);
  pot.position.y = 0.55;
  pot.castShadow = true;
  g.add(pot);
  const brew = new THREE.Mesh(new THREE.CircleGeometry(0.44, 18), new THREE.MeshStandardMaterial({ color: '#f3d58a', roughness: 0.3, emissive: '#6b4a10', emissiveIntensity: 0.4 }));
  brew.rotation.x = -Math.PI / 2;
  brew.position.y = 1.1;
  g.add(brew);
  // 냄비 받침대
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 5), logMat);
    post.position.set(0.95 * s, 0.85, 0);
    g.add(post);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 5), logMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 1.7;
  g.add(bar);

  // 김 (문장부호 모양이 피어올라요)
  const steamMarks = ['!', '?', '…', '!', '?'];
  const puffs = steamMarks.map((m, i) => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    ctx.font = 'bold 46px "IM Fell English", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(m, 32, 36);
    const tex = new THREE.CanvasTexture(c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.setScalar(0.35);
    sp.userData.offset = i / steamMarks.length;
    g.add(sp);
    return sp;
  });

  const light = new THREE.PointLight('#ffae5c', 0, 8, 1.6);
  light.position.y = 0.8;
  g.add(light);

  world.colliders.push({ x: z.x, z: z.z, r: 1.0 });

  return {
    position: g.position,
    radius: 1.0,
    update(t, isDay) {
      flames.forEach((f, i) => {
        f.scale.y = 1 + Math.sin(t * (9 + i * 3) + i) * 0.18;
        f.rotation.y = t * (1 + i);
      });
      puffs.forEach((p) => {
        const k = (t * 0.35 + p.userData.offset) % 1;
        p.position.set(Math.sin(k * 6 + p.userData.offset * 10) * 0.2, 1.2 + k * 1.6, 0);
        p.material.opacity = Math.sin(k * Math.PI) * 0.85;
      });
      light.intensity = (isDay ? 0.3 : 2.2) + Math.sin(t * 13) * 0.2;
    },
  };
}
