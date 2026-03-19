---
title: Reel1
id: A0001
status: paused
tags: [Next.js, 영화, 드라마, OTT, 크롤링, DB]
createdAt: 2026-03-19
version: 0.1.0
---

## 프로젝트 개요
영화/드라마 개인 아카이브. 본 작품을 정리하고, 평점/한줄평을 기록하며, 작품 정보를 DB화하는 개인용 서비스.

## 핵심 기능

### 개인 기록
- 본 작품 리스팅 (시청 완료/시청중/보고싶은)
- 개인 평점 (10점 만점 또는 별점)
- 한줄평 작성

### 작품 정보 DB
- 제목 (한글/영문)
- 줄거리 (시놉시스)
- 감독, 출연 배우
- 개봉 연도, 국적
- 장르
- 수상 내역
- 러닝타임
- 포스터 이미지

### OTT 시청 가능 여부
- 넷플릭스, 왓챠, 디즈니+, 쿠팡플레이, 웨이브, 티빙 등
- 어디서 볼 수 있는지 표시

### 배우/감독 페이지
- 프로필 정보
- 필모그래피 (출연/감독 작품 목록)
- 대표작 표시

### 크롤링/데이터 수집
- TMDB API (영화 정보, 포스터, 배우)
- JustWatch 또는 크롤링 (OTT 시청 가능 여부)
- 한국 영화는 KOBIS(영화진흥위원회) API 활용 가능

## 설계 사항

### 기술 스택
- **프론트:** Next.js + Tailwind CSS (Lab0와 동일 스택)
- **DB:** Turso (SQLite 클라우드) — 작품/배우/시청기록 저장
- **외부 API:** TMDB API (무료, 영화 정보)
- **배포:** Vercel
- **인증:** 개인용이므로 단순 인증 또는 없음

### 데이터 구조 (초안)

#### movies 테이블
- id, tmdb_id, title_ko, title_en, year, country, genre
- director, runtime, synopsis, poster_url
- awards

#### actors 테이블
- id, tmdb_id, name_ko, name_en, profile_url

#### movie_actors (관계)
- movie_id, actor_id, role

#### ott_availability
- movie_id, platform, url

#### my_reviews (개인 기록)
- movie_id, rating, comment, status, watched_at

### 페이지 구성
- `/` — 대시보드 (최근 본 작품, 통계)
- `/movies` — 작품 목록 (검색, 필터)
- `/movies/[id]` — 작품 상세
- `/actors/[id]` — 배우/감독 상세
- `/my` — 내 시청 기록, 평점, 한줄평

## 고려 사항

### TMDB API
- 무료, 일 요청 제한 넉넉 (개인용 충분)
- 영화/드라마/배우 정보, 포스터 이미지 제공
- 한국어 데이터 지원

### OTT 정보
- 공식 API 없는 플랫폼이 많아 크롤링 또는 JustWatch 활용
- 시청 가능 여부는 수시로 변경되므로 주기적 갱신 필요

### 확장 계획
- 친구 추천 기능
- 장르별/연도별 통계 시각화
- 시리즈(드라마) 에피소드별 관리

## 버전 이력

### v0.1.0 (2026-03-19)
- 프로젝트 목적 전면 변경 (영화 각본 → 영화/드라마 아카이브)
- 기본 설계 및 데이터 구조 초안
- Lab0 허브 프로젝트 페이지 업데이트
