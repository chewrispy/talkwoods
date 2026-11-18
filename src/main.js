import * as THREE from 'three';
import './style.css';
import { createForest } from './world/forest.js';
import { TimeOfDay } from './world/timeOfDay.js';
import { Player } from './player/player.js';
import { Controls } from './player/controls.js';
import { InsectManager } from './insects/insectManager.js';
import { TitleScreen } from './ui/title.js';
import { Hud } from './ui/hud.js';
import { Dex } from './ui/dex.js';
import { INSECTS } from './data/insects.js';
import { loadSave, writeSave } from './storage.js';

const canvas = document.getElementById('game');
const uiRoot = document.getElementById('ui');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 400);
const fitFov = () => {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 1 ? 70 : 58; // 세로 화면(휴대폰)은 조금 더 넓게
  camera.updateProjectionMatrix();
};
fitFov();

const world = createForest(scene);
const time = new TimeOfDay(scene, { dayLengthSeconds: 240, startAt: 0.07 });
const player = new Player(scene, world);
const controls = new Controls(canvas);
const insects = new InsectManager(scene, world);
const save = loadSave();

let state = 'title';

const hud = new Hud(uiRoot, {
  isTouch: controls.isTouch,
  onCatch: () => tryCatch(),
  onOpenDex: () => dex.open(),
});
const dex = new Dex(uiRoot, save, {
  onOpen: () => {
    controls.enabled = false;
    controls.reset();
  },
  onClose: () => {
    if (state === 'play') controls.enabled = true;
  },
});
hud.setDexCount(dex.found, INSECTS.length);

new TitleScreen(uiRoot, () => {
  state = 'play';
  controls.enabled = true;
  controls.yaw = Math.PI * 0.15;
  hud.show();
});

controls.onAction(() => tryCatch());

function tryCatch() {
  if (state !== 'play') return;
  const bug = insects.findCatchable(player.position);
  if (!bug) return;
  const first = !(save.caught[bug.type.id] > 0);
  insects.catch(bug);
  save.caught[bug.type.id] = (save.caught[bug.type.id] || 0) + 1;
  if (first) save.firstCaughtAt[bug.type.id] = new Date().toISOString();
  writeSave(save);
  hud.setDexCount(dex.found, INSECTS.length);
  hud.toast(
    first
      ? `✨ 새로운 발견! <b>${bug.type.name}</b> <span class="mk">${bug.type.mark}</span>`
      : `<b>${bug.type.name}</b> <span class="mk">${bug.type.mark}</span> 를 잡았어요`
  );
  hud.pulseDex();
  hud.setTarget(null);
}

// 카메라
const camTarget = new THREE.Vector3();
const camPos = new THREE.Vector3();
let titleAngle = 0.6;
let blend = 0; // 타이틀 → 플레이 전환

const trees = world.colliders.filter((c) => c.tree);
function cameraClearDistance(from, to) {
  const total = from.distanceTo(to);
  let best = total;
  const steps = 14;
  for (const c of trees) {
    if (Math.hypot(c.x - from.x, c.z - from.z) > total + 4) continue;
    for (let i = 2; i <= steps; i++) {
      const k = i / steps;
      const x = from.x + (to.x - from.x) * k;
      const y = from.y + (to.y - from.y) * k;
      const z = from.z + (to.z - from.z) * k;
      if (y > c.top) continue;
      if (Math.hypot(x - c.x, z - c.z) < c.canopy) {
        best = Math.min(best, Math.max(2.2, total * (k - 1 / steps)));
        break;
      }
    }
  }
  return best;
}

function updateCamera(dt) {
  // 플레이 카메라 목표
  const p = player.position;
  camTarget.set(p.x, p.y + 1.1, p.z);
  const d = controls.distance;
  const playPos = new THREE.Vector3(
    p.x + Math.sin(controls.yaw) * Math.cos(controls.pitch) * d,
    p.y + 1.1 + Math.sin(controls.pitch) * d,
    p.z + Math.cos(controls.yaw) * Math.cos(controls.pitch) * d
  );
  // 나무에 카메라가 파묻히지 않게 당겨오기
  const dist = cameraClearDistance(camTarget, playPos);
  if (dist < d) playPos.sub(camTarget).multiplyScalar(dist / d).add(camTarget);
  const minY = world.heightAt(playPos.x, playPos.z) + 0.6;
  if (playPos.y < minY) playPos.y = minY;

  // 타이틀 카메라: 숲 위를 천천히 맴돌기
  titleAngle += dt * 0.05;
  const titlePos = new THREE.Vector3(Math.sin(titleAngle) * 24, 10, Math.cos(titleAngle) * 24);
  const titleLook = new THREE.Vector3(0, 2, 0);

  if (state === 'play') blend = Math.min(1, blend + dt * 0.7);
  const k = blend * blend * (3 - 2 * blend);
  camPos.copy(titlePos).lerp(playPos, k);
  camera.position.copy(camPos);
  camera.lookAt(titleLook.lerp(camTarget, k));
}

const timer = new THREE.Timer();
timer.connect(document);
function loop(ts) {
  timer.update(ts);
  const dt = Math.min(timer.getDelta(), 0.05);
  time.update(dt, player.position);
  if (state === 'play') {
    player.update(dt, controls.getMove(), controls.yaw);
    hud.setTime(time.label);
    hud.setTarget(insects.findCatchable(player.position));
  }
  insects.update(dt, time.isDay);
  updateCamera(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

addEventListener('resize', () => {
  fitFov();
  renderer.setSize(innerWidth, innerHeight);
});

// 개발용: 콘솔에서 talkwoods.skipTime(0.5) 처럼 시간을 넘길 수 있어요
window.talkwoods = {
  skipTime: (amount = 0.25) => {
    time.t = (time.t + amount) % 1;
  },
  setTime: (t) => {
    time.t = t;
  },
  goTo: (zone) => {
    const z = world.zones[zone];
    if (!z) return;
    player.position.set(z.x + z.r + 1.5, 0, z.z);
  },
};
