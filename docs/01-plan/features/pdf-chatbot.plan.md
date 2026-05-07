# pdf-chatbot Planning Document

> **Summary**: 근로기준법 PDF를 기반으로 노무 관련 질문에 답변하는 React 챗봇 웹앱
>
> **Project**: 노무 업무 어시스턴트 챗봇
> **Version**: 0.1.0
> **Author**: JUNGMIN
> **Date**: 2026-05-07
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 노무 관련 법령(근로기준법 등) 정보를 일반인이 직접 검색하고 이해하기 어려워 전문가에 의존해야 함 |
| **Solution** | PDF 문서를 컨텍스트로 활용해 OpenAI GPT-4o-mini가 자연어 질문에 법령 근거를 포함한 답변을 제공 |
| **Function/UX Effect** | 채팅 인터페이스로 질문-답변, 샘플 질문 버튼으로 진입 장벽 낮춤, 모바일 최적화 반응형 레이아웃 |
| **Core Value** | 노무 전문가 없이도 근로기준법 관련 궁금증을 즉시 해결할 수 있는 셀프서비스 도구 |

---

## Context Anchor

> Plan에서 자동 추출. Design/Do 문서에 전파되어 맥락 연속성을 유지한다.

| Key | Value |
|-----|-------|
| **WHY** | 노무 법령 정보 접근 어려움 — 일반인이 근로기준법을 스스로 검색·이해하기 어려운 문제 해결 |
| **WHO** | 근로자/사용자(고용주) — 임금, 퇴직금, 휴가, 4대보험 등 노무 관련 궁금증을 가진 일반인 |
| **RISK** | PDF 텍스트 추출 품질 저하 시 답변 정확도 하락, OpenAI 토큰 비용 초과 |
| **SUCCESS** | 채팅으로 질문 시 3초 내 응답, 근로기준법 관련 질문 80% 이상 정확한 답변 제공 |
| **SCOPE** | Phase 1: UI + 목업 응답 / Phase 2: PDF 파싱 + OpenAI 연동 / Phase 3: Vercel 배포 |

---

## 1. Overview

### 1.1 Purpose

근로기준법 등 노무 관련 PDF 문서를 서버에서 파싱하여 컨텍스트로 활용하고, 사용자의 자연어 질문에 OpenAI GPT-4o-mini가 법령 근거를 포함한 답변을 반환하는 챗봇 웹애플리케이션.

### 1.2 Background

- 노무 관련 문의는 빈도가 높지만(최저임금, 퇴직금, 연차 등) 법령 텍스트는 난해하여 일반인이 직접 해석하기 어려움
- 기존 챗봇은 일반 지식만 제공하고 회사/법령별 맥락을 반영하지 못함
- PDF 문서를 직접 컨텍스트로 주입하면 최신 법령 기반 정확한 답변 가능

### 1.3 Related Documents

- UI/UX 요구사항: `ui_ux.md`
- 프로젝트 규칙: `CLAUDE.md`
- PDF 원본: `근로기준법(법률)(제20520호)(20250223).pdf`

---

## 2. Scope

### 2.1 In Scope

- [x] React + TypeScript + Tailwind CSS 프론트엔드
- [x] Node.js + Express 백엔드 API (`/api/chat`)
- [x] PDF 파싱 및 텍스트 추출 (`pdf-parse`)
- [x] OpenAI GPT-4o-mini 연동 (서버사이드)
- [x] 채팅 UI (사용자 메시지 우측, 봇 응답 좌측)
- [x] 샘플 질문 버튼 (최저임금, 퇴직금, 휴가 일수, 4대보험)
- [x] 반응형 레이아웃 (모바일 최적화, 400px~900px)
- [x] Vercel 배포

### 2.2 Out of Scope

- 회원가입/로그인 기능
- 대화 히스토리 DB 저장
- 복수 PDF 파일 동적 업로드
- 실시간 스트리밍 응답 (초기 버전)
- 관리자 페이지

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 사용자가 텍스트를 입력하고 전송하면 GPT-4o-mini가 PDF 기반 답변 반환 | High | Pending |
| FR-02 | 서버 시작 시 `docs/` 폴더의 PDF를 자동 로드 및 텍스트 캐싱 | High | Pending |
| FR-03 | 샘플 질문 버튼 클릭 시 해당 질문이 자동 입력·전송 | High | Pending |
| FR-04 | 채팅 메시지 영역 스크롤 — 새 메시지 수신 시 자동 하단 스크롤 | Medium | Pending |
| FR-05 | 답변 생성 중 로딩 인디케이터 표시 | Medium | Pending |
| FR-06 | API 키는 서버에서만 사용, 프론트엔드에 노출 금지 | High | Pending |
| FR-07 | 초기 화면에 인사말과 카테고리별 샘플 질문 버튼 표시 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 질문 전송 후 응답 3초 이내 (GPT 응답 시간 제외) | 브라우저 Network 탭 |
| Security | API 키 서버사이드 전용, CORS 설정 | 코드 리뷰 + 배포 환경 확인 |
| Accessibility | 키보드로 메시지 전송 가능 (Enter 키) | 수동 테스트 |
| Responsive | 400px ~ 900px 모든 해상도에서 레이아웃 정상 | 브라우저 개발자 도구 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] FR-01 ~ FR-07 모든 기능 구현 완료
- [x] 로컬에서 `npm run dev` 정상 동작 확인
- [x] Vercel 배포 후 공개 URL 접근 가능
- [x] 근로기준법 관련 샘플 질문 5개 이상 정상 답변

### 4.2 Quality Criteria

- [x] TypeScript 컴파일 에러 없음
- [x] Tailwind 클래스 기반 스타일 적용 (인라인 스타일 최소화)
- [x] `.env` 파일 Git 미포함 확인

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| PDF 텍스트 추출 실패 (이미지형 PDF) | High | Low | pdf-parse 사용 전 텍스트 추출 테스트 선행 |
| OpenAI 토큰 한도 초과 (PDF 전체 주입) | High | Medium | PDF 텍스트를 청크로 분할, 질문 관련 부분만 전달 |
| Vercel 서버리스 함수 콜드 스타트 지연 | Medium | Medium | PDF 캐싱 전략, 함수 warm-up 고려 |
| CORS 오류 (프론트-백엔드 도메인 불일치) | Medium | Low | Express CORS 미들웨어 설정 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `server.js` | API Server | `/api/chat` 엔드포인트 추가, PDF 로드 로직 |
| `docs/*.pdf` | Static File | 서버에서 읽기 전용으로 참조 |
| `public/` → `src/` | Frontend | 바닐라 JS → React+TS 전환 |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| PDF 파일 | READ | `server.js` → `pdf-parse` | 서버 시작 시 1회 로드 |
| `/api/chat` | POST | `src/App.tsx` → fetch | 메시지 전송마다 호출 |

### 6.3 Verification

- [x] PDF 파일 존재 및 텍스트 추출 가능 여부 확인
- [x] OpenAI API 키 환경변수 설정 확인
- [x] 프론트-백엔드 포트 충돌 없음 확인

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | 단순 구조 | 정적 사이트 | ☐ |
| **Dynamic** | 피처 기반 모듈, 백엔드 연동 | 풀스택 웹앱, SaaS MVP | ☑ |
| **Enterprise** | 엄격한 레이어 분리 | 대규모 시스템 | ☐ |

**선택: Dynamic** — 백엔드(Express) + 프론트엔드(React) 분리 구조, Vercel 배포

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | React / Vue / 바닐라 | React + TypeScript | ui_ux.md 요구사항, 컴포넌트 재사용성 |
| Styling | Tailwind / CSS Modules | Tailwind CSS | ui_ux.md 요구사항, 빠른 개발 |
| API Client | fetch / axios | fetch (native) | 의존성 최소화 |
| Backend | Express / Serverless | Express + Vercel | 기존 스택 유지 |
| PDF 처리 | pdf-parse / pdfjs | pdf-parse | 서버사이드 텍스트 추출 단순함 |
| Build Tool | Vite / CRA | Vite | 빠른 HMR, 최신 표준 |

### 7.3 Clean Architecture Approach

```
Dynamic Level 구조:

my-pdf-chatbot2/
├── src/                    # React 프론트엔드
│   ├── components/
│   │   ├── ChatWindow.tsx  # 채팅 메시지 영역
│   │   ├── ChatInput.tsx   # 입력창 + 전송 버튼
│   │   ├── Message.tsx     # 개별 메시지 컴포넌트
│   │   └── SampleQuestions.tsx  # 샘플 질문 버튼
│   ├── services/
│   │   └── chatApi.ts      # /api/chat 호출 로직
│   ├── types/
│   │   └── chat.ts         # Message, ChatResponse 타입
│   └── App.tsx             # 루트 컴포넌트
├── server.js               # Express API 서버
├── docs/                   # PDF 파일 보관
├── vercel.json             # Vercel 배포 설정
└── vite.config.ts          # Vite 빌드 설정
```

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [x] `CLAUDE.md`에 코딩 규칙 섹션 존재
- [ ] ESLint 설정 필요
- [ ] TypeScript 설정 필요 (`tsconfig.json`)

### 8.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | 미정 | 컴포넌트 PascalCase, 함수 camelCase | High |
| **Folder structure** | 미정 | `src/components/`, `src/services/`, `src/types/` | High |
| **주석 언어** | CLAUDE.md 정의 | 한국어 | High |
| **Environment variables** | `.env` 존재 | `OPENAI_API_KEY` 서버 전용 | High |

### 8.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `OPENAI_API_KEY` | OpenAI API 인증 | Server only | ☑ (기존) |
| `PORT` | Express 서버 포트 (기본 3001) | Server | ☐ |
| `VITE_API_URL` | 로컬 개발 시 API URL | Client (dev only) | ☐ |

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`/pdca design pdf-chatbot`)
2. [ ] 컴포넌트 구조 확정 및 구현 시작 (`/pdca do pdf-chatbot`)
3. [ ] CLAUDE.md 스택 정보 React+TS로 업데이트

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-07 | 초기 Plan 작성 (ui_ux.md 반영) | JUNGMIN |
