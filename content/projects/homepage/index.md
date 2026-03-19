---
title: Lab0
id: A0001
status: in-progress
tags: [Next.js, Tailwind, Vercel, TypeScript]
createdAt: 2026-03-19
version: 0.2.0
---

## 프로젝트 개요
개인 연구 포털 구축. 다양한 프로젝트의 허브 역할을 하며 설계서, 로그, 자료를 체계적으로 관리하는 개인 작업 공간.

## 설계 사항

### 아키텍처
- **프레임워크:** Next.js 15 (App Router) + TypeScript
- **스타일링:** Tailwind CSS v4 — 유틸리티 기반, 커스텀 테마 적용
- **콘텐츠 관리:** Markdown 파일 기반 (Git이 곧 CMS)
- **배포:** Vercel (GitHub push → 자동 빌드/배포)
- **DB:** 초기 없음 → 필요 시 Turso (SQLite 클라우드) 연동 예정

### UI/UX 설계
- 화이트톤 기반 심플하고 아담한 디자인
- 모바일 퍼스트 반응형 (모바일 50% 이상 접속 고려)
- 도현체(Do Hyeon) 기본 글꼴 — 경쾌하고 깔끔한 느낌
- 네온 글로우 로고, 사선 타이틀바, 반투명 사이드 메뉴
- 히어로 배너 + 하단 그라데이션 페이드

### 페이지 구성
- `/` — 메인 (프로젝트 카드 그리드)
- `/projects` — 프로젝트 전체 목록
- `/projects/[slug]` — 프로젝트 상세 (개요, 설계, 로그)
- `/fonts` — 한글 글꼴 비교 도구

## 고려 사항

### 호스팅
- Vercel 무료 tier: 월 100GB 대역폭, 빌드 6,000분
- 개인 사용 수준에서 무료 범위 충분

### 확장 계획
- 인증: 관리자 전용 → 추후 NextAuth 또는 Supabase Auth
- DB: Turso (9GB 무료, SQLite 기반) 연동 시 검색/태그/필터 기능
- 자료실: 북마크, 메모 수집 기능
- 블로그/연구 노트 기능

### 제약 사항
- 개발 환경: Termux on Android (Docker 불가, RAM 2.6GB 제한)
- inotify 제한으로 hot reload 불안정 가능 (polling 모드 사용)

## 버전 이력

### v0.2.0 (2026-03-19)
- 프로젝트명 Lab0 확정
- 도현체 기본 글꼴 적용
- 타이틀바 사선 디자인, 네온 로고, 국기 닉네임 UI
- 히어로 배너 (검은색 그라데이션 + 하단 페이드)
- 반투명 블러 사이드 메뉴 (아코디언 카테고리)
- 한글 글꼴 비교 페이지 (/fonts)
- 플로팅 햄버거 버튼

### v0.1.0 (2026-03-19)
- 프로젝트 초기 생성
- Next.js + Tailwind CSS 기본 구조
- Markdown 기반 프로젝트 콘텐츠 시스템
- GitHub 연동 및 Vercel 배포 준비
