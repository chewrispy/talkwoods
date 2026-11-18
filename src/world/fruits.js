import * as THREE from 'three';
import { FRUITS, FRUIT_RESPAWN } from '../data/tones.js';

// 말투 열매 덤불
export function createFruitBushes(scene, world) {
  // 이 숲에 열리는 열매·버섯만 (한 종류가 여러 곳에 날 수도 있어요)
  const spots = [];
  for (const f of FRUITS.filter((x) => x.area === world.area.id)) {
    for (const sp of f.spots || [f.spot]) if (world.zones[sp]) spots.push([f, sp]);
  }
  const bushes = spots.map(([f, spot]) => {
    const z = world.zones[spot];
    const g = new THREE.Group();
    g.position.set(z.x, world.heightAt(z.x, z.z), z.z);
    world.root.add(g);
    if (f.shape === 'mushroom') {
      // 소곤 버섯: 유난히 밝게 빛나는 큰 버섯 하나
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.7, 8), new THREE.MeshStandardMaterial({ color: '#f3ead8' }));
      stalk.position.y = 0.35;
      g.add(stalk);
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: f.color, emissive: f.color, emissiveIntensity: 1.1 })
      );
      cap.position.y = 0.66;
      cap.castShadow = true;
      g.add(cap);
      for (let i = 0; i < 6; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
        const a = (i / 6) * Math.PI * 2;
        dot.position.set(Math.cos(a) * 0.25, 0.92 - 0.05, Math.sin(a) * 0.25);
        g.add(dot);
      }
      const glow = new THREE.PointLight(f.color, 1.2, 5);
      glow.position.set(0, 1.0, 0);
      g.add(glow);
      world.colliders.push({ x: z.x, z: z.z, r: 0.5 });
      return { fruit: f, group: g, mesh: cap, glow, pos: g.position, ready: true, timer: 0, mushroom: true };
    }
    const leafMat = new THREE.MeshStandardMaterial({ color: '#4f8a3c', roughness: 0.9, flatShading: true });
    [[0, 0.55, 0, 0.75], [0.5, 0.45, 0.2, 0.55], [-0.45, 0.45, -0.1, 0.6], [0.1, 0.5, -0.45, 0.5]].forEach(([x, y, zz, r]) => {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leafMat);
      b.position.set(x, y, zz);
      b.castShadow = true;
      g.add(b);
    });
    let geo;
    if (f.shape === 'box') geo = new THREE.BoxGeometry(0.34, 0.34, 0.34);
    else if (f.shape === 'cone') geo = new THREE.ConeGeometry(0.22, 0.42, 3);
    else geo = new THREE.SphereGeometry(0.2, 14, 12);
    const fruit = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: f.color, roughness: 0.4, emissive: f.color, emissiveIntensity: 0.15 }));
    fruit.position.set(0, 1.45, 0);
    fruit.castShadow = true;
    g.add(fruit);
    const glow = new THREE.PointLight(f.color, 0.6, 4);
    glow.position.set(0, 1.5, 0);
    g.add(glow);
    world.colliders.push({ x: z.x, z: z.z, r: 0.9 });
    return { fruit: f, group: g, mesh: fruit, glow, pos: g.position, ready: true, timer: 0 };
  });

  return {
    bushes,
    update(dt, t) {
      for (const b of bushes) {
        if (!b.ready) {
          b.timer -= dt;
          if (b.timer <= 0) {
            b.ready = true;
            b.mesh.visible = true;
            b.glow.visible = true;
          }
          continue;
        }
        if (b.mushroom) {
          b.mesh.material.emissiveIntensity = 0.9 + Math.sin(t * 2 + b.pos.x) * 0.35;
          continue;
        }
        b.mesh.rotation.y = t * 0.8;
        b.mesh.position.y = 1.45 + Math.sin(t * 2 + b.pos.x) * 0.06;
      }
    },
    findNear(pos, range = 2.6) {
      let best = null;
      let bestD = range;
      for (const b of bushes) {
        if (!b.ready) continue;
        const d = Math.hypot(b.pos.x - pos.x, b.pos.z - pos.z) - 0.9;
        if (d < bestD) {
          bestD = d;
          best = b;
        }
      }
      return best;
    },
    pick(b) {
      b.ready = false;
      b.timer = FRUIT_RESPAWN;
      b.mesh.visible = false;
      b.glow.visible = false;
    },
  };
}
