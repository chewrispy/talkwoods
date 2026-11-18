import * as THREE from 'three';
import { FRUITS, FRUIT_RESPAWN } from '../data/tones.js';

// 말투 열매 덤불
export function createFruitBushes(scene, world) {
  const bushes = FRUITS.map((f) => {
    const z = world.zones[f.spot];
    const g = new THREE.Group();
    g.position.set(z.x, world.heightAt(z.x, z.z), z.z);
    scene.add(g);
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
