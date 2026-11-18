import * as THREE from 'three';
import { INSECT_BY_ID } from '../data/insects.js';

function makeLabelTexture(mark, color) {
  const c = document.createElement('canvas');
  c.width = 192;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 84px "IM Fell English", "Gowun Batang", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(30,24,18,0.85)';
  ctx.strokeText(mark, 96, 70);
  ctx.fillStyle = color;
  ctx.fillText(mark, 96, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let glowTex = null;
function getGlowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...extra });

function wings(g, parts, mat, size = 0.2, stretch = 1.3) {
  const wingGeo = new THREE.CircleGeometry(size, 12);
  wingGeo.translate(size, 0, 0);
  wingGeo.rotateX(-Math.PI / 2);
  parts.wings = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    const w = new THREE.Mesh(wingGeo, mat);
    w.scale.set(1, 1, stretch);
    pivot.add(w);
    pivot.scale.x = s;
    g.add(pivot);
    parts.wings.push(pivot);
  }
}

// 곤충 생김새
const MODELS = {
  ant(type, g) {
    const mat = std(type.color);
    [[0, 0.09], [0.13, 0.07], [0.27, 0.1]].forEach(([z, r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
      s.position.set(0, r, z - 0.13);
      s.castShadow = true;
      g.add(s);
    });
    g.scale.setScalar(1.5);
  },
  butterfly(type, g, parts) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.18, 4, 6), std('#3b2a3a'));
    body.rotation.x = Math.PI / 2;
    g.add(body);
    const palette = ['#f2a7c3', '#ffd36e', '#a9c8ff', '#c7a6ff', '#ffb38a'];
    wings(g, parts, std(palette[Math.floor(Math.random() * palette.length)], { side: THREE.DoubleSide, roughness: 0.5 }));
    g.scale.setScalar(1.3);
  },
  moth(type, g, parts) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.16, 4, 6), std('#8a7a60'));
    body.rotation.x = Math.PI / 2;
    g.add(body);
    wings(g, parts, std(type.color, { side: THREE.DoubleSide, roughness: 0.9, emissive: '#3a3020', emissiveIntensity: 0.3 }), 0.22, 1.0);
    for (const s of [-1, 1]) {
      const ant = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 4), std('#8a7a60'));
      ant.position.set(0.04 * s, 0.03, 0.15);
      ant.rotation.set(-1.0, 0, -0.5 * s);
      g.add(ant);
    }
    g.scale.setScalar(1.3);
  },
  firefly(type, g, parts) {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), std('#2d2a20'));
    g.add(body);
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: type.color }));
    tail.position.z = -0.07;
    g.add(tail);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: getGlowTexture(), color: type.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    glow.scale.setScalar(1.1);
    g.add(glow);
    parts.glow = glow;
  },
  caterpillar(type, g, parts) {
    const mat = std(type.color, { roughness: 0.5 });
    parts.segs = [];
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(i === 4 ? 0.085 : 0.07, 10, 8), mat);
      s.position.set(0, 0.07, 0.11 * i - 0.22);
      s.castShadow = true;
      g.add(s);
      parts.segs.push(s);
    }
    const head = parts.segs[4];
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), new THREE.MeshBasicMaterial({ color: '#241a12' }));
      e.position.set(0.035 * s, 0.03, 0.07);
      head.add(e);
    }
    // 식은땀 한 방울
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshStandardMaterial({ color: '#8fd3ff', roughness: 0.1, transparent: true, opacity: 0.85 }));
    drop.scale.set(1, 1.4, 1);
    drop.position.set(0.08, 0.1, 0.02);
    head.add(drop);
    parts.drop = drop;
    g.scale.setScalar(1.5);
  },
  snail(type, g, parts) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 4, 8), std('#d9c8a0', { roughness: 0.4 }));
    body.rotation.x = Math.PI / 2;
    body.position.y = 0.06;
    g.add(body);
    const head = new THREE.Group();
    head.position.set(0, 0.08, 0.17);
    g.add(head);
    for (const s of [-1, 1]) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.12, 5), std('#d9c8a0'));
      st.position.set(0.03 * s, 0.07, 0);
      st.rotation.z = -0.2 * s;
      head.add(st);
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), new THREE.MeshBasicMaterial({ color: '#241a12' }));
      e.position.set(0.042 * s, 0.13, 0);
      head.add(e);
    }
    parts.head = head;
    parts.body = body;
    // @ 모양 껍데기
    const shell = new THREE.Group();
    shell.position.set(0, 0.17, -0.04);
    const shellMat = std(type.color, { roughness: 0.35 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 18, Math.PI * 1.75), shellMat);
    ring.rotation.y = Math.PI / 2;
    shell.add(ring);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), std('#a07ec8'));
    core.scale.x = 0.7;
    shell.add(core);
    g.add(shell);
    parts.shell = shell;
    g.scale.setScalar(1.6);
  },
  cricket(type, g, parts) {
    const mat = std(type.color);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.2, 4, 8), mat);
    body.rotation.x = Math.PI / 2;
    body.position.y = 0.07;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), std('#5a3f22'));
    head.position.set(0, 0.08, 0.16);
    g.add(head);
    parts.legs = [];
    for (const s of [-1, 1]) {
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.14, 3, 5), mat);
      thigh.position.set(0.06 * s, 0.11, -0.06);
      thigh.rotation.x = -0.9;
      g.add(thigh);
      parts.legs.push(thigh);
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.25, 3), std('#3a2a1a'));
      ant.position.set(0.03 * s, 0.14, 0.27);
      ant.rotation.set(-1.1, 0, 0.3 * s);
      g.add(ant);
    }
    g.scale.setScalar(1.7);
  },
  pollen(type, g, parts) {
    // 뾰족뾰족 별 모양 꽃가루
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), std(type.color, { emissive: '#7a5a00', emissiveIntensity: 0.35 }));
    g.add(core);
    const spikeGeo = new THREE.ConeGeometry(0.025, 0.09, 5);
    spikeGeo.translate(0, 0.08, 0);
    const spikeMat = std('#ffe680', { emissive: '#7a5a00', emissiveIntensity: 0.25 });
    const dirs = new THREE.IcosahedronGeometry(1, 0).attributes.position;
    const seen = new Set();
    for (let i = 0; i < dirs.count; i++) {
      const v = new THREE.Vector3(dirs.getX(i), dirs.getY(i), dirs.getZ(i)).normalize();
      const key = v.toArray().map((n) => n.toFixed(2)).join();
      if (seen.has(key)) continue;
      seen.add(key);
      const sp = new THREE.Mesh(spikeGeo, spikeMat);
      sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
      core.add(sp);
    }
    parts.core = core;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: '#fff2a0', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(0.45);
    g.add(glow);
    g.scale.setScalar(1.5);
  },
  bee(type, g, parts) {
    const yellow = std(type.color, { roughness: 0.5 });
    const black = std('#2a2118');
    const body = new THREE.Group();
    g.add(body);
    [[0.07, 0.065, yellow], [-0.02, 0.075, black], [-0.11, 0.07, yellow], [-0.19, 0.055, black]].forEach(([z, r, m]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), m);
      s.position.z = z;
      body.add(s);
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), black);
    head.position.z = 0.15;
    body.add(head);
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
      e.position.set(0.03 * s, 0.02, 0.19);
      body.add(e);
    }
    // ㅗ 모양 침
    const sting = new THREE.Group();
    sting.position.z = -0.24;
    const needle = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.1, 0.018), black);
    needle.position.y = 0.05;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.018), black);
    sting.add(needle, bar);
    sting.rotation.x = Math.PI / 2;
    body.add(sting);
    parts.sting = sting;
    wings(g, parts, new THREE.MeshStandardMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.6, side: THREE.DoubleSide }), 0.13, 1.4);
    parts.wings.forEach((w) => (w.position.y = 0.06));
    g.scale.setScalar(1.5);
  },
};

function buildMesh(type) {
  const g = new THREE.Group();
  const parts = {};
  MODELS[type.model](type, g, parts);
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeLabelTexture(type.mark, type.behavior === 'float' ? '#f4ffb0' : '#fffaf0'),
      transparent: true,
      depthWrite: false,
    })
  );
  label.scale.set((0.85 * 1.5) / g.scale.x, 0.85 / g.scale.x, 1);
  label.position.y = (type.behavior === 'crawl' || type.behavior === 'hop' ? 0.7 : 0.6) / g.scale.x;
  g.add(label);
  parts.label = label;
  label.userData.baseY = label.position.y;
  g.userData.baseScale = g.scale.x;
  return { group: g, parts };
}

export class InsectManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.list = [];
    // 숲마다 사는 곤충과 마릿수가 달라요 (data/areas.js)
    for (const entry of world.area.insects || []) {
      const base = INSECT_BY_ID[entry.id];
      const zone = entry.zone || base.zone;
      if (!base || !world.zones[zone]) continue;
      const type = { ...base, zone, time: entry.time || base.time };
      for (let i = 0; i < entry.count; i++) this.list.push(this.spawn(type));
    }
  }

  spawn(type, origin = type) {
    const { group, parts } = buildMesh(type);
    this.world.root.add(group);
    const bug = {
      type,
      origin,
      group,
      parts,
      pos: new THREE.Vector3(),
      heading: Math.random() * Math.PI * 2,
      phase: Math.random() * 10,
      age: Math.random() * 60,
      hopT: Math.random() * 2,
      hopY: 0,
      respawn: 0,
      caught: false,
      pop: 0,
    };
    this.placeRandom(bug);
    return bug;
  }

  // 생김새 바꾸기 (애벌레 → 나비, 잡힌 나비 → 다시 애벌레)
  reshape(bug, type) {
    const pos = bug.pos.clone();
    this.world.root.remove(bug.group);
    const { group, parts } = buildMesh(type);
    this.world.root.add(group);
    bug.group = group;
    bug.parts = parts;
    bug.type = type;
    bug.pos.copy(pos);
  }

  placeRandom(bug) {
    const z = this.world.zones[bug.type.zone];
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * z.r * (bug.type.behavior === 'float' ? 1.3 : 0.95);
    bug.pos.set(z.x + Math.cos(a) * r, 0, z.z + Math.sin(a) * r);
  }

  isActiveTime(type, isDay) {
    if (type.time === 'any') return true;
    return type.time === 'day' ? isDay : !isDay;
  }

  update(dt, isDay, playerPos) {
    for (const bug of this.list) {
      const { type, group, parts } = bug;
      bug.phase += dt;

      if (bug.caught) {
        bug.respawn -= dt;
        if (bug.pop > 0) {
          bug.pop -= dt;
          const k = Math.max(0, bug.pop / 0.35);
          group.scale.setScalar(group.userData.baseScale * (1 + (1 - k) * 0.8));
          group.position.y += dt * 2;
          group.traverse((o) => {
            if (o.material) {
              o.material.transparent = true;
              o.material.opacity = k;
            }
          });
          if (bug.pop <= 0) group.visible = false;
        }
        if (bug.respawn <= 0) {
          bug.caught = false;
          bug.age = 0;
          // 변신했던 곤충은 원래 모습으로 다시 태어나요
          if (bug.type.id !== bug.origin.id) this.reshape(bug, bug.origin);
          else {
            group.scale.setScalar(group.userData.baseScale);
            group.traverse((o) => {
              if (o.material && o.material !== parts.label?.material) o.material.opacity = 1;
            });
            parts.label.material.opacity = 1;
          }
          this.placeRandom(bug);
        } else continue;
      }

      const active = this.isActiveTime(type, isDay);
      bug.group.visible = active;
      if (!active) continue;
      const g = bug.group;
      const p = bug.parts;
      bug.age += dt;

      // 애벌레는 오래 두면 나비가 돼요
      if (type.morphTo && bug.age > 90 && isDay) {
        const to = INSECT_BY_ID[type.morphTo];
        this.reshape(bug, { ...to, zone: type.zone, time: to.time });
        bug.age = 0;
        this.onMorph?.(bug, type, to);
        continue;
      }

      const zone = this.world.zones[type.zone];
      const near = playerPos ? Math.hypot(bug.pos.x - playerPos.x, bug.pos.z - playerPos.z) : 99;
      const hiding = type.shy && near < 2.4;
      let speed = type.speed ?? (type.behavior === 'crawl' ? 0.55 : type.behavior === 'flutter' ? 1.1 : type.behavior === 'hop' ? 0 : 0.35);
      if (hiding) speed = 0;
      bug.heading += (Math.random() - 0.5) * dt * (type.behavior === 'crawl' ? 3 : 2);
      const dx = zone.x - bug.pos.x;
      const dz = zone.z - bug.pos.z;
      const dist = Math.hypot(dx, dz);
      const limit = zone.r * (type.behavior === 'float' ? 1.4 : 1);
      if (dist > limit) {
        const want = Math.atan2(dx, dz);
        const diff = Math.atan2(Math.sin(want - bug.heading), Math.cos(want - bug.heading));
        bug.heading += diff * Math.min(1, dt * 3);
      }

      // 귀뚜라미: 폴짝폴짝
      if (type.behavior === 'hop') {
        bug.hopT -= dt;
        if (bug.hopT <= 0 && bug.hopY <= 0) {
          bug.hopT = 0.8 + Math.random() * 1.8;
          bug.hopV = 3.2;
          bug.hopY = 0.001;
          bug.heading += (Math.random() - 0.5) * 1.5;
        }
        if (bug.hopY > 0) {
          speed = 2.2;
          bug.hopV -= 12 * dt;
          bug.hopY += bug.hopV * dt;
          if (bug.hopY <= 0) bug.hopY = 0;
        }
        p.legs?.forEach((l) => (l.rotation.x = bug.hopY > 0 ? -0.2 : -0.9));
      }

      bug.pos.x += Math.sin(bug.heading) * speed * dt;
      bug.pos.z += Math.cos(bug.heading) * speed * dt;

      const ground = this.world.heightAt(bug.pos.x, bug.pos.z);
      let y = ground;
      if (type.behavior === 'crawl' || type.behavior === 'hop') {
        y = ground + 0.02 + (bug.hopY || 0);
        if (type.id === 'ant') {
          for (const c of this.world.colliders) {
            if (c.r < 0.8 && c.r > 0.6 && Math.hypot(bug.pos.x - c.x, bug.pos.z - c.z) < c.r) y = Math.max(y, ground + 0.55);
          }
        }
        if (p.segs) p.segs.forEach((s, i) => (s.position.y = 0.07 + Math.max(0, Math.sin(bug.phase * 6 - i * 0.9)) * 0.04));
        if (p.drop) p.drop.position.y = 0.1 - ((bug.phase * 0.5) % 1) * 0.12;
        if (p.shell) {
          // 부끄러우면 껍데기 속으로 쏙
          const k = hiding ? 0 : 1;
          p.head.scale.lerp(new THREE.Vector3(k, k, k), 0.15);
          p.body.scale.lerp(new THREE.Vector3(1, hiding ? 0.3 : 1, 1), 0.15);
        }
      } else if (type.behavior === 'drift') {
        // 바람 따라 둥실둥실 흩날려요
        y = Math.max(ground, -0.3) + 1.1 + Math.sin(bug.phase * 0.9) * 0.4;
        p.core.rotation.x += dt * 0.8;
        p.core.rotation.y += dt * 1.1;
      } else if (type.behavior === 'flutter') {
        y = Math.max(ground, -0.3) + 0.9 + Math.sin(bug.phase * 2.3) * 0.25;
        const flap = Math.sin(bug.phase * (type.id === 'bee' ? 40 : 22)) * 0.9;
        p.wings[0].rotation.z = -flap;
        p.wings[1].rotation.z = flap;
        if (p.sting) p.sting.rotation.x = near < 3 ? 0 : Math.PI / 2; // 가까이 오면 ㅗ 침을 치켜세워요
      } else {
        y = Math.max(ground, -0.35) + 0.7 + Math.sin(bug.phase * 1.3) * 0.35;
        const pulse = 0.55 + 0.45 * Math.sin(bug.phase * 3 + bug.heading);
        p.glow.material.opacity = pulse;
        p.glow.scale.setScalar(0.8 + pulse * 0.6);
      }
      g.position.set(bug.pos.x, y, bug.pos.z);
      g.rotation.y = bug.heading;
      p.label.position.y = p.label.userData.baseY + Math.sin(bug.phase * 2) * 0.05;
    }
  }

  findCatchable(pos, range = 2.2) {
    let best = null;
    let bestD = range;
    for (const bug of this.list) {
      if (bug.caught || !bug.group.visible) continue;
      const d = Math.hypot(bug.group.position.x - pos.x, bug.group.position.z - pos.z);
      if (d < bestD) {
        bestD = d;
        best = bug;
      }
    }
    return best;
  }

  catch(bug) {
    bug.caught = true;
    bug.pop = 0.35;
    bug.respawn = 20 + Math.random() * 10;
  }
}
