---
title: Stage1
id: A0001
status: in-progress
tags: [Three.js, MMD, WebGL, 음악]
createdAt: 2026-03-20
version: 0.1.0
---

## 프로젝트 개요
Web MMD 뷰어 & 댄스 스테이지. 브라우저에서 PMX 모델과 VMD 모션을 재생하고 음악과 동기화하는 서비스.

## 핵심 기능
- PMX/GLB 3D 모델 로드 (서버 또는 파일 업로드)
- VMD 모션 적용 (IK + 물리 시뮬레이션)
- 음악 재생 (MP3/WAV/OGG)
- 3D 스테이지 (바닥 + 반투명 벽)
- 터치/마우스 카메라 컨트롤

## 기술 스택
- Next.js + Tailwind CSS
- Three.js r128 (MMDLoader, MMDPhysics, CCDIKSolver)
- ammo.js (물리 엔진)
- OutlineEffect (MMD 윤곽선)

## 버전 이력

### v0.1.0 (2026-03-20)
- PMX 모델 텍스처 로드 성공
- VMD 모션 IK 포함 적용
- ammo.js 물리 시뮬레이션
- Shake It 음원 + 댄스 모션
- 스테이지 (바닥 + 반투명 벽)
- Lab0에서 분리, 독립 프로젝트화
