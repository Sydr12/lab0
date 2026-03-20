---
title: Stage1
id: A0001
status: in-progress
tags: [Three.js, MMD, WebGL, 음악]
createdAt: 2026-03-20
version: 0.3.0
---

## 프로젝트 개요
Web MMD 뷰어 & 댄스 스테이지. 브라우저에서 PMX 모델과 VMD 모션을 재생하고 음악과 동기화하는 서비스.

## 핵심 기능
- PMX 3D 모델 로드 (MMDLoader + 텍스처)
- VMD 모션 적용 (IK + 물리 시뮬레이션)
- 음악 재생 (MP3) — 모션과 동기화 재생/정지
- 카메라 VMD 모션 ON/OFF
- 뒷벽 앨범 커버 이미지 표시
- 3D 스테이지 (반투명 바닥 + 벽)
- 가수/곡 드롭박스 선택 → 로드
- 캐릭터 드롭박스 선택
- 한 번 재생 후 자동 정지

## 기술 스택
- Next.js + Tailwind CSS (Lab0 내부 페이지 /stage1)
- Three.js r128 (MMDLoader, MMDPhysics, CCDIKSolver)
- ammo.js (물리 엔진)
- OutlineEffect (MMD 윤곽선)
- mmd-parser (PMX/VMD 파싱)

## 에셋 구조
```
public/mmd/
├── models/                    ← PMX 모델 + 텍스처
│   └── lovelive20141216/
└── songs/                     ← 가수/곡명/파일
    ├── emon/shake_it/
    │   ├── emon-shake_it.vmd
    │   └── emon-shake_it.mp3
    └── aespa/black_mamba/
        ├── aespa-black_mamba.vmd
        ├── aespa-black_mamba.mp3
        ├── aespa-black_mamba-cam.vmd
        └── aespa-black_mamba-cover.jpg
```

## 파일 네이밍 규칙
- 모션: `가수-곡명.vmd`
- 음악: `가수-곡명.mp3`
- 카메라: `가수-곡명-cam.vmd`
- 커버: `가수-곡명-cover.jpg`

## 버전 이력

### v0.3.0 (2026-03-20)
- 가수/곡 드롭박스 선택 시스템
- 캐릭터 선택 드롭박스
- 카메라 VMD 모션 ON/OFF 토글
- 뒷벽 앨범 커버 이미지
- 초기 접속 시 T포즈 대기 (곡 미로드)
- 한 번 재생 후 자동 정지
- 바닥/벽 반투명
- aespa Black Mamba 추가 (모션+음악+카메라+커버)
- 수동 업로드 버튼 비활성화

### v0.2.0 (2026-03-20)
- 모션+음악 동기화 재생/정지
- 에셋 디렉토리 구조 정리 (songs/가수/곡명/)
- Lab0 내부 페이지로 통합

### v0.1.0 (2026-03-20)
- PMX 모델 텍스처 로드
- VMD 모션 IK 포함 적용
- ammo.js 물리 시뮬레이션
- Shake It 음원 + 댄스 모션
- 스테이지 구성
