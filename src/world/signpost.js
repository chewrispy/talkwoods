import * as THREE from 'three';

// 숲길 표지판: 다른 숲으로 가는 길
export function createSignpost(world) {
  const z = world.zones.signpost;
  const g = new THREE.Group();
  g.position.set(z.x, world.heightAt(z.x, z.z), z.z);
  g.rotation.y = Math.atan2(-z.x, -z.z) + Math.PI;
  world.root.add(g);
  const wood = new THREE.MeshStandardMaterial({ color: '#7b5a3a', roughness: 1 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.4, 7), wood);
  post.position.y = 1.2;
  post.castShadow = true;
  g.add(post);
  const boards = ['#f3d9a4', '#c9b6ff', '#ffb38a', '#ffd1e1', '#d8d0c0'];
  boards.forEach((c, i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.24, 0.06), new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));
    const dir = i % 2 ? -1 : 1;
    b.position.set(0.42 * dir, 2.1 - i * 0.32, 0);
    b.rotation.y = (i - 2) * 0.35;
    b.castShadow = true;
    g.add(b);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.24, 3), b.material);
    tip.rotation.z = -Math.PI / 2 * dir;
    tip.position.set(0.97 * dir, 2.1 - i * 0.32, 0);
    tip.rotation.y = (i - 2) * 0.35;
    g.add(tip);
  });
  const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd68a' }));
  lantern.position.set(0, 2.55, 0);
  g.add(lantern);
  world.colliders.push({ x: z.x, z: z.z, r: 0.5 });
  return { position: g.position, radius: 0.5 };
}
