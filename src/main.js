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
import { Dialogue } from './ui/dialogue.js';
import { AnimalManager } from './animals/animalManager.js';
import { INSECTS } from './data/insects.js';
import { HEARTS_TO_FRIEND } from './data/animals.js';
import { levelFor, traitsFor, growthKey } from './data/growth.js';
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
const animals = new AnimalManager(scene, world);
const save = loadSave();

// 새싹 성장 상태
let lastGrowth = growthKey(save);
player.sprout.build(levelFor(save), traitsFor(save));

let state = 'title';

const hud = new Hud(uiRoot, {
  isTouch: controls.isTouch,
  onCatch: () => interact(),
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

const dialogue = new Dialogue(uiRoot, {
  save,
  onTalk: (a) => talkTo(a),
  onGift: (a, insectId) => giftTo(a, insectId),
  onClose: (a) => {
    if (a) {
      a.talking = false;
      a.talkLevel = 0;
    }
    if (state === 'play') controls.enabled = true;
  },
});

new TitleScreen(uiRoot, () => {
  state = 'play';
  controls.enabled = true;
  controls.yaw = Math.PI * 0.15;
  hud.show();
});

controls.onAction(() => interact());

function currentTarget() {
  const a = animals.findTalkable(player.position);
  if (a) return { kind: 'animal', ref: a, id: 'a:' + a.data.id, html: `말 걸기 · ${a.data.name}` };
  const bug = insects.findCatchable(player.position);
  if (bug) return { kind: 'bug', ref: bug, id: 'b:' + bug.type.id + bug.group.id, html: `잡기 · ${bug.type.name} <b>${bug.type.mark}</b>` };
  return null;
}

function interact() {
  if (state !== 'play' || dialogue.isOpen) return;
  const t = currentTarget();
  if (!t) return;
  if (t.kind === 'animal') openDialogue(t.ref);
  else tryCatch(t.ref);
}

// 받침에 따라 조사 고르기: josa('그로타','와','과') → '그로타와'
function josa(word, withoutBatchim, withBatchim) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const has = code >= 0 && code <= 11171 && code % 28 !== 0;
  return word + (has ? withBatchim : withoutBatchim);
}

function openDialogue(a) {
  controls.enabled = false;
  controls.reset();
  // 동물과 새싹이 같이 보이도록 카메라 돌리기
  const dir = Math.atan2(a.pos.x - player.position.x, a.pos.z - player.position.z);
  player.facing = dir;
  player.sync();
  controls.yaw = dir + Math.PI + 0.55;
  controls.pitch = Math.max(controls.pitch, 0.35);
  hud.hideTarget();
  a.talking = true;
  a.talkLevel = 0;
  const first = !save.met[a.data.id];
  if (first) {
    save.met[a.data.id] = true;
    writeSave(save);
  }
  const line = a.data.lines[0];
  animals.say(a, line, 2.5);
  dialogue.open(a, first ? `${line}  (${a.data.desc})` : line);
}

function talkTo(a) {
  const d = a.data;
  if (d.escalate) {
    a.talkLevel = Math.min(a.talkLevel + 1, d.lines.length - 1);
  } else {
    a.talkLevel = (a.talkLevel + 1 + Math.floor(Math.random() * (d.lines.length - 1))) % d.lines.length;
  }
  const line = d.lines[a.talkLevel];
  animals.say(a, line, 2.5);
  dialogue.render(line);
}

function giftTo(a, insectId) {
  if (!(save.inventory[insectId] > 0)) return;
  const d = a.data;
  save.inventory[insectId] -= 1;
  const before = save.hearts[d.id] || 0;
  let line;
  if (insectId === d.likes && before < HEARTS_TO_FRIEND) {
    save.hearts[d.id] = before + 1;
    line = save.hearts[d.id] >= HEARTS_TO_FRIEND ? d.friendLine : d.reactions.like;
    if (save.hearts[d.id] >= HEARTS_TO_FRIEND) hud.toast(`💛 <b>${josa(d.name, '와', '과')}</b> 친구가 되었어요!`);
  } else {
    line = insectId === d.likes ? d.reactions.like : d.reactions.other;
  }
  writeSave(save);
  animals.say(a, line.length > 16 ? line.slice(0, 15) + '…' : line, 2.8);
  dialogue.render(line);
  checkGrowth();
}

function checkGrowth() {
  const key = growthKey(save);
  if (key === lastGrowth) return;
  const [oldLv, oldTraits] = lastGrowth.split('|');
  lastGrowth = key;
  const lv = levelFor(save);
  const traits = traitsFor(save);
  player.sprout.build(lv, traits);
  if (lv > Number(oldLv)) hud.toast(`🌱 새싹이 자랐어요! <b>Lv.${lv}</b>`);
  const had = oldTraits ? oldTraits.split(',') : [];
  for (const t of traits) if (!had.includes(t.trait)) hud.toast(`🍃 새싹에 <b>${josa(t.name, '가', '이')}</b> 생겼어요`);
}

function tryCatch(bug) {
  if (state !== 'play' || !bug) return;
  const first = !(save.caught[bug.type.id] > 0);
  insects.catch(bug);
  save.caught[bug.type.id] = (save.caught[bug.type.id] || 0) + 1;
  save.inventory[bug.type.id] = (save.inventory[bug.type.id] || 0) + 1;
  if (first) save.firstCaughtAt[bug.type.id] = new Date().toISOString();
  writeSave(save);
  hud.setDexCount(dex.found, INSECTS.length);
  hud.toast(
    first
      ? `✨ 새로운 발견! <b>${bug.type.name}</b> <span class="mk">${bug.type.mark}</span>`
      : `<b>${bug.type.name}</b> <span class="mk">${bug.type.mark}</span> 를 잡았어요`
  );
  hud.pulseDex();
  hud.hideTarget();
  checkGrowth();
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
    if (!dialogue.isOpen) hud.setTarget(currentTarget());
  }
  insects.update(dt, time.isDay);
  animals.update(dt, player.position);
  player.sprout.update(performance.now() / 1000);
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
  give: (id, n = 1) => {
    save.caught[id] = (save.caught[id] || 0) + n;
    save.inventory[id] = (save.inventory[id] || 0) + n;
    writeSave(save);
    hud.setDexCount(dex.found, INSECTS.length);
    checkGrowth();
  },
  zoom: (d) => {
    controls.distance = d;
  },
  goTo: (zone) => {
    const z = world.zones[zone];
    if (!z) return;
    player.position.set(z.x + z.r + 1.5, 0, z.z);
  },
};
