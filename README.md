# Talk of the Woods · 대화의 숲

말버릇을 가진 동물들과 문장부호 곤충이 사는 아늑한 3D 오픈월드 탐험 게임이에요.

## 지금 할 수 있는 것 (v0.1)
- 타이틀 화면 → 숲으로 입장
- 3인칭으로 숲 걸어다니기 (PC: WASD + 마우스 드래그 / 휴대폰: 왼쪽 조이스틱 + 오른쪽 드래그)
- 4분마다 한 바퀴 도는 낮과 밤
- 문장부호 곤충 채집: 개미(!) · 나비(?) · 반딧불이(…)
- 곤충 도감 (브라우저에 저장돼요)

## 실행하기
```bash
npm install
npm run dev      # 개발 서버
npm run build    # 배포용 빌드 (dist/)
```

## 배포 (Vercel)
Vercel에서 이 저장소를 Import 하면 Vite 프로젝트로 자동 인식돼요. 설정 변경 없이 Deploy 하면 끝.

## 구조
```
src/
  data/insects.js         곤충 데이터 (여기에 항목을 추가하면 새 곤충이 생겨요)
  world/forest.js         숲 맵, 장소(ZONES), 지형 높이
  world/timeOfDay.js      낮·밤, 하늘, 조명
  player/player.js        플레이어 캐릭터와 이동·충돌
  player/controls.js      키보드·마우스·터치 입력
  insects/insectManager.js 곤충 생성·움직임·채집
  ui/                     타이틀, HUD, 도감
  storage.js              저장
```

## 개발용 콘솔 명령
- `talkwoods.setTime(0.8)` 밤으로 (0.25 한낮, 0.5 해 질 녘, 0.75 한밤)
- `talkwoods.goTo('pond')` 장소로 이동 (`meadow`, `pond`, `stumps`, `spawn`)

## 다음 단계 아이디어
- 동물 친구들 (그로타, 아뇽, 그래소, 유카구리…)
- 문장 요리: 모은 문장부호와 단어로 문장 만들기
- 대화 배틀
