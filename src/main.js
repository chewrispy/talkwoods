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
import { HEARTS_TO_FRIEND, ANIMAL_BY_ID } from './data/animals.js';
import { recipeFor } from './data/recipes.js';
import { createPot } from './world/pot.js';
import { Kitchen } from './ui/kitchen.js';
import { josa } from './util/josa.js';
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
const pot = createPot(scene, world);
const save = loadSave();
// 예전 저장: 이미 만난 친구의 단어 카드 채워주기
for (const id in save.met) {
  const w = ANIMAL_BY_ID[id]?.word;
  if (w && !save.words.includes(w)) save.words.push(w);
}
const isFriend = (id) => (save.hearts[id] || 0) >= HEARTS_TO_FRIEND;
if (save.companion && isFriend(save.companion)) animals.startFollow(animals.byId(save.companion));

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

const kitchen = new Kitchen(uiRoot, {
  save,
  onCook: (text) => cooked(text),
  onClose: () => {
    if (state === 'play') controls.enabled = true;
  },
});

animals.onSulk = (a) => hud.toast(`💢 <b>${josa(a.data.name, '가', '이')}</b> 삐졌어요! 가서 우쭈쭈 해주세요`);

const dialogue = new Dialogue(uiRoot, {
  save,
  onTalk: (a) => talkTo(a),
  onGift: (a, insectId) => giftTo(a, insectId),
  onGiftSentence: (a, text) => giftSentence(a, text),
  onFollow: (a) => {
    animals.startFollow(a);
    save.companion = a.data.id;
    writeSave(save);
    const line = a.data.id === 'mar' ? '히힝! 달리자! (같이 다니면 빨라져요)' : a.data.cheer[0];
    animals.say(a, line.length > 16 ? line.slice(0, 15) + '…' : line, 2.5);
    dialogue.render(line);
  },
  onStay: (a) => {
    animals.stopFollow(a);
    save.companion = null;
    writeSave(save);
    dialogue.close();
    hud.toast(`<b>${josa(a.data.name, '가', '이')}</b> 원래 자리로 돌아갔어요`);
  },
  onPat: (a) => {
    a.sulking = false;
    a.sulkTimer = 45 + Math.random() * 35;
    const line = '히힝! (기분이 풀렸다) …또 우쭈쭈 해줘야 해.';
    animals.say(a, '히힝!', 2);
    dialogue.render(line);
  },
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
  const talkTarget = (x) => ({ kind: 'animal', ref: x, id: 'a:' + x.data.id + (x.sulking ? 's' : ''), html: x.sulking ? `우쭈쭈 · ${x.data.name} 💢` : `말 걸기 · ${x.data.name}` });
  // 같이 다니는 친구는 삐졌을 때만 먼저 챙겨요
  if (a && (!a.following || a.sulking)) return talkTarget(a);
  const potD = Math.hypot(pot.position.x - player.position.x, pot.position.z - player.position.z) - pot.radius;
  if (potD < 3.0) return { kind: 'pot', id: 'pot', html: '요리하기 · 문장 냄비' };
  const bug = insects.findCatchable(player.position);
  if (bug) return { kind: 'bug', ref: bug, id: 'b:' + bug.type.id + bug.group.id, html: `잡기 · ${bug.type.name} <b>${bug.type.mark}</b>` };
  if (a) return talkTarget(a);
  return null;
}

function openKitchen() {
  controls.enabled = false;
  controls.reset();
  hud.hideTarget();
  kitchen.open();
}

function cooked(text) {
  const r = recipeFor(text);
  const isNew = !save.recipes[text];
  save.sentences[text] = (save.sentences[text] || 0) + 1;
  save.recipes[text] = true;
  writeSave(save);
  hud.toast(isNew ? `✨ 새 요리! <b>${r.name}</b> “${text}”` : `🍲 “${text}” 완성!`);
}

function giftSentence(a, text) {
  if (!(save.sentences[text] > 0)) return;
  const d = a.data;
  save.sentences[text] -= 1;
  const before = save.hearts[d.id] || 0;
  let line;
  if (text === d.favorite) {
    save.hearts[d.id] = Math.min(HEARTS_TO_FRIEND, before + 2);
    line = d.reactions.fav;
    if (before < HEARTS_TO_FRIEND && save.hearts[d.id] >= HEARTS_TO_FRIEND) {
      line = d.friendLine;
      hud.toast(`💛 <b>${josa(d.name, '와', '과')}</b> 친구가 되었어요!`);
    }
  } else {
    line = `“${text}”… ${d.reactions.other}`;
  }
  writeSave(save);
  animals.say(a, text === d.favorite ? d.favorite + ' ♥' : text, 2.8);
  dialogue.render(line);
  checkGrowth();
}

function interact() {
  if (state !== 'play' || dialogue.isOpen || kitchen.isOpen) return;
  const t = currentTarget();
  if (!t) return;
  if (t.kind === 'animal') openDialogue(t.ref);
  else if (t.kind === 'pot') openKitchen();
  else tryCatch(t.ref);
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
    if (!save.words.includes(a.data.word)) {
      save.words.push(a.data.word);
      hud.toast(`📜 단어 카드 <b>「${a.data.word}」</b>${josa(a.data.word, '를', '을').slice(a.data.word.length)} 받았어요`);
    }
    writeSave(save);
  }
  const line = a.sulking ? '힝…' : a.data.lines[0];
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
  const f = animals.follower;
  if (f && !f.sulking) animals.say(f, f.data.cheer[Math.floor(Math.random() * f.data.cheer.length)], 2);
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
    if (!dialogue.isOpen && !kitchen.isOpen) hud.setTarget(currentTarget());
  }
  const f = animals.follower;
  player.speedMul = f && f.data.id === 'mar' && !f.sulking ? 1.7 : 1;
  insects.update(dt, time.isDay);
  animals.update(dt, player);
  pot.update(performance.now() / 1000, time.isDay);
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
  befriend: (id) => {
    save.met[id] = true;
    const w = ANIMAL_BY_ID[id].word;
    if (!save.words.includes(w)) save.words.push(w);
    save.hearts[id] = HEARTS_TO_FRIEND;
    writeSave(save);
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
