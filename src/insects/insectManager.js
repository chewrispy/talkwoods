import * as THREE from 'three';
import { INSECTS } from '../data/insects.js';

function makeLabelTexture(mark, color) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 84px "IM Fell English", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(30,24,18,0.85)';
  ctx.strokeText(mark, 64, 70);
  ctx.fillStyle = color;
  ctx.fillText(mark, 64, 70);
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

function buildMesh(type) {
  const g = new THREE.Group();
  const parts = {};
  if (type.behavior === 'crawl') {
    const mat = new THREE.MeshStandardMaterial({ color: type.color, roughness: 0.6 });
    [[0, 0.09], [0.13, 0.07], [0.27, 0.1]].forEach(([z, r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
      s.position.set(0, r, z - 0.13);
      s.castShadow = true;
      g.add(s);
    });
    g.scale.setScalar(1.5);
  } else if (type.behavior === 'flutter') {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.03, 0.18, 4, 6),
      new THREE.MeshStandardMaterial({ color: '#3b2a3a' })
    );
    body.rotation.x = Math.PI / 2;
    g.add(body);
    const palette = ['#f2a7c3', '#ffd36e', '#a9c8ff', '#c7a6ff', '#ffb38a'];
    const wingMat = new THREE.MeshStandardMaterial({
      color: palette[Math.floor(Math.random() * palette.length)],
      side: THREE.DoubleSide,
      roughness: 0.5,
    });
    const wingGeo = new THREE.CircleGeometry(0.2, 12);
    wingGeo.translate(0.2, 0, 0);
    wingGeo.rotateX(-Math.PI / 2);
    parts.wings = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      const w = new THREE.Mesh(wingGeo, wingMat);
      w.scale.set(1, 1, 1.3);
      pivot.add(w);
      pivot.scale.x = s;
      g.add(pivot);
      parts.wings.push(pivot);
    }
    g.scale.setScalar(1.3);
  } else {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshStandardMaterial({ color: '#2d2a20' }));
    g.add(body);
    const tail = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 6),
      new THREE.MeshBasicMaterial({ color: type.color })
    );
    tail.position.z = -0.07;
    g.add(tail);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: type.color,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    glow.scale.setScalar(1.1);
    g.add(glow);
    parts.glow = glow;
    parts.tail = tail;
  }

  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeLabelTexture(type.mark, type.behavior === 'float' ? '#f4ffb0' : '#fffaf0'),
      transparent: true,
      depthWrite: false,
    })
  );
  label.scale.setScalar(0.85 / g.scale.x);
  label.position.y = (type.behavior === 'crawl' ? 0.7 : 0.6) / g.scale.x;
  g.add(label);
  parts.label = label;
  return { group: g, parts };
}

export class InsectManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.types = Object.fromEntries(INSECTS.map((t) => [t.id, t]));
    this.list = [];
    // 이 숲에 사는 곳이 있는 곤충만 나와요
    for (const type of INSECTS.filter((t) => world.zones[t.zone])) {
      for (let i = 0; i < type.count; i++) {
        const { group, parts } = buildMesh(type);
        world.root.add(group);
        const bug = {
          type,
          group,
          parts,
          pos: new THREE.Vector3(),
          heading: Math.random() * Math.PI * 2,
          phase: Math.random() * 10,
          respawn: 0,
          caught: false,
          pop: 0,
        };
        this.placeRandom(bug);
        this.list.push(bug);
      }
    }
  }

  zoneOf(type) {
    return this.world.zones[type.zone];
  }

  placeRandom(bug) {
    const z = this.zoneOf(bug.type);
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * z.r * (bug.type.behavior === 'float' ? 1.3 : 0.95);
    bug.pos.set(z.x + Math.cos(a) * r, 0, z.z + Math.sin(a) * r);
  }

  isActiveTime(type, isDay) {
    if (type.time === 'any') return true;
    return type.time === 'day' ? isDay : !isDay;
  }

  update(dt, isDay) {
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
          group.scale.setScalar(group.userData.baseScale);
          group.traverse((o) => {
            if (o.material) o.material.opacity = 1;
          });
          this.placeRandom(bug);
        } else continue;
      }

      const active = this.isActiveTime(type, isDay);
      group.visible = active;
      if (!active) continue;
      if (group.userData.baseScale === undefined) group.userData.baseScale = group.scale.x;

      // 돌아다니기
      const zone = this.zoneOf(type);
      const speed = type.behavior === 'crawl' ? 0.55 : type.behavior === 'flutter' ? 1.1 : 0.35;
      bug.heading += (Math.random() - 0.5) * dt * (type.behavior === 'crawl' ? 3 : 2);
      const dx = zone.x - bug.pos.x;
      const dz = zone.z - bug.pos.z;
      const dist = Math.hypot(dx, dz);
      const limit = zone.r * (type.behavior === 'float' ? 1.4 : 1);
      if (dist > limit) {
        const want = Math.atan2(dx, dz);
        let diff = Math.atan2(Math.sin(want - bug.heading), Math.cos(want - bug.heading));
        bug.heading += diff * Math.min(1, dt * 3);
      }
      bug.pos.x += Math.sin(bug.heading) * speed * dt;
      bug.pos.z += Math.cos(bug.heading) * speed * dt;

      const ground = this.world.heightAt(bug.pos.x, bug.pos.z);
      let y = ground;
      if (type.behavior === 'crawl') {
        y = ground + 0.02;
        // 그루터기 위로 올라가 보이게
        for (const c of this.world.colliders) {
          if (c.r < 0.8 && c.r > 0.6 && Math.hypot(bug.pos.x - c.x, bug.pos.z - c.z) < c.r) y = Math.max(y, ground + 0.55);
        }
      } else if (type.behavior === 'flutter') {
        y = Math.max(ground, -0.3) + 0.9 + Math.sin(bug.phase * 2.3) * 0.25;
        const flap = Math.sin(bug.phase * 22) * 0.9;
        parts.wings[0].rotation.z = -flap;
        parts.wings[1].rotation.z = flap;
      } else {
        y = Math.max(ground, -0.35) + 0.7 + Math.sin(bug.phase * 1.3) * 0.35;
        const pulse = 0.55 + 0.45 * Math.sin(bug.phase * 3 + bug.heading);
        parts.glow.material.opacity = pulse;
        parts.glow.scale.setScalar(0.8 + pulse * 0.6);
      }
      group.position.set(bug.pos.x, y, bug.pos.z);
      group.rotation.y = bug.heading;
      parts.label.position.y = parts.label.userData.baseY ?? (parts.label.userData.baseY = parts.label.position.y);
      parts.label.position.y = parts.label.userData.baseY + Math.sin(bug.phase * 2) * 0.05;
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
