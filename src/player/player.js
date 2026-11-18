import * as THREE from 'three';
import { Sprout } from './sprout.js';

export class Player {
  constructor(scene, world) {
    this.world = world;
    this.speed = 5.2;
    this.speedMul = 1;
    this.position = new THREE.Vector3(0, world.heightAt(0, 2), 2);
    this.facing = Math.PI;
    this.walkPhase = 0;

    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.36, 0.55, 6, 14),
      new THREE.MeshStandardMaterial({ color: '#ffe0b0', roughness: 0.8 })
    );
    body.position.y = 0.66;
    body.castShadow = true;
    g.add(body);

    // 망토(스카프)
    const scarf = new THREE.Mesh(
      new THREE.TorusGeometry(0.33, 0.08, 8, 20),
      new THREE.MeshStandardMaterial({ color: '#d9534f', roughness: 0.9 })
    );
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 0.72;
    g.add(scarf);

    const eyeMat = new THREE.MeshBasicMaterial({ color: '#2b2118' });
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
      eye.position.set(0.12 * s, 0.98, 0.31);
      g.add(eye);
    }
    const blushMat = new THREE.MeshBasicMaterial({ color: '#ffa3a3', transparent: true, opacity: 0.7 });
    for (const s of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.CircleGeometry(0.05, 10), blushMat);
      b.position.set(0.2 * s, 0.9, 0.325);
      b.rotation.y = 0.35 * s;
      g.add(b);
    }

    // 머리 위 새싹 (레벨·특성에 따라 자라요)
    this.sprout = new Sprout(g);
    this.sprout.root.position.y = 1.27;
    this.sprout.build(1, []);

    this.body = body;
    this.mesh = g;
    scene.add(g);
    this.sync();
  }

  update(dt, input, cameraYaw) {
    const fx = -Math.sin(cameraYaw);
    const fz = -Math.cos(cameraYaw);
    const rx = Math.cos(cameraYaw);
    const rz = -Math.sin(cameraYaw);
    const mx = fx * input.y + rx * input.x;
    const mz = fz * input.y + rz * input.x;
    const mag = Math.min(1, Math.hypot(input.x, input.y));

    if (mag > 0.05) {
      const len = Math.hypot(mx, mz) || 1;
      this.position.x += (mx / len) * this.speed * this.speedMul * mag * dt;
      this.position.z += (mz / len) * this.speed * this.speedMul * mag * dt;
      const target = Math.atan2(mx, mz);
      let diff = target - this.facing;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.facing += diff * Math.min(1, dt * 12);
      this.walkPhase += dt * 11 * mag;
    } else {
      this.walkPhase *= 0.9;
    }

    // 충돌
    for (const c of this.world.colliders) {
      const dx = this.position.x - c.x;
      const dz = this.position.z - c.z;
      const d = Math.hypot(dx, dz);
      const min = c.r + 0.35;
      if (d < min && d > 0.0001) {
        this.position.x = c.x + (dx / d) * min;
        this.position.z = c.z + (dz / d) * min;
      }
    }
    const d = Math.hypot(this.position.x, this.position.z);
    const b = this.world.boundary;
    if (d > b) {
      this.position.x *= b / d;
      this.position.z *= b / d;
    }
    this.position.y = this.world.heightAt(this.position.x, this.position.z);
    this.sync(mag);
  }

  sync(mag = 0) {
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.facing;
    const bob = Math.abs(Math.sin(this.walkPhase)) * 0.08 * Math.min(1, mag * 2);
    this.body.position.y = 0.66 + bob;
    this.mesh.rotation.z = Math.sin(this.walkPhase) * 0.05 * mag;
    this.sprout.root.position.y = 1.27 + bob;
  }
}
