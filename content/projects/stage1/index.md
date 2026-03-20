---
title: Stage1
id: A0001
status: in-progress
tags: [Babylon.js, MMD, WebGL, babylon-mmd, 물리, IK]
createdAt: 2026-03-20
version: 1.1.0
---

## 프로젝트 개요
Web MMD 뷰어 & 댄스 스테이지. Babylon.js + babylon-mmd 기반으로 PMX 모델과 VMD 모션을 브라우저에서 재생.

## 핵심 기능
- PMX 3D 모델 로드 (babylon-mmd + PmxLoader)
- VMD 모션 적용 (IK + 물리 시뮬레이션)
- 음악 재생 (StreamAudioPlayer, 모션 동기화)
- 카메라 VMD 모션 ON/OFF (MmdCamera)
- 멀티 캐릭터 (최대 5명 동시, 슬롯 시스템)
- 스테이지 PMX 로드 (Moon/Neon)
- 포스트 프로세싱 (Bloom, ACES 톤매핑, FXAA, Glow)
- 아웃라인 렌더러 (MmdOutlineRenderer)
- Shadow ON/OFF (ShadowGenerator)
- SDEF ON/OFF (어깨 관절 개선)
- songDB 외부 JSON 동적 로드

## 기술 스택
- Babylon.js 8.x + babylon-mmd v1.1.0
- ammo.wasm (물리 엔진, 중력 30)
- Next.js 15 + Tailwind CSS (Lab0 내부 페이지 /stage1)
- PostProcessing: DefaultRenderingPipeline, GlowLayer

## 에셋 현황
- **모델**: 17종 (다수 버전 포함)
- **모션**: 89곡 (13 아티스트)
- **스테이지**: 2세트 (Moon 4파츠, Neon 3파츠)
- songDB: mmd_assets/songdb.json

## UI 구성
```
[STAGE 스테이지 선택 ─────── 적용]
[MUSIC 가수 ─── 곡 ─── 곡 로드  ]
[CHARACTERS                 + -]
[#1 캐릭터▼ 버전▼        로드  ]
[#2 ...                        ]
[▶재생 ■정지 CAM  Shadow SDEF  ]
[         3D 뷰포트             ]
[         로그                  ]
```

## 버전 이력

### v1.1.0 (2026-03-21)
- 멀티 캐릭터 (최대 5명, 슬롯 추가/제거)
- 포스트 프로세싱 (Bloom, ACES, FXAA, Glow)
- Shadow/SDEF 체크박스 (기본 OFF)
- StreamAudioPlayer (모션-음악 동기화)
- MmdOutlineRenderer (윤곽선)
- 캐릭터 6종 추가 (Pauline, Sakura, Chloe, Kaiji, Mash, Eleanor)
- IVE Love Dive 모션 추가
- TGA→PNG 전체 변환 (45개)
- UI 패널 재배치 (스테이지/곡/캐릭터/컨트롤 분리)
- 뮤직 패널 비활성/활성 연동

### v1.0.0 (2026-03-21)
- Three.js → Babylon.js + babylon-mmd 전환
- IK + 물리(ammo.wasm), 프레임 시크
- MmdCamera VMD 카메라 ON/OFF
- 스테이지 PMX 로드 (Moon/Neon)

### v0.3.0 (2026-03-20)
- 가수/곡 드롭박스, 카메라 모션, 앨범 커버
- 모션+음악 동기화, 한 번 재생 후 정지

### v0.1.0 (2026-03-20)
- 초기 구현 (Three.js r128 + CDN)
