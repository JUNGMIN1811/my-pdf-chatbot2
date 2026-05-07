# pdf-chatbot Design Document

> **Summary**: 근로기준법 PDF 기반 노무 챗봇 — React + TypeScript + Tailwind + Express 설계
>
> **Project**: 노무 업무 어시스턴트 챗봇
> **Version**: 0.1.0
> **Author**: JUNGMIN
> **Date**: 2026-05-07
> **Status**: Draft
> **Planning Doc**: [pdf-chatbot.plan.md](../01-plan/features/pdf-chatbot.plan.md)

---

## Context Anchor

> Plan 문서에서 복사. Design→Do 핸드오프 시 전략적 맥락 유지.

| Key | Value |
|-----|-------|
| **WHY** | 노무 법령 정보 접근 어려움 — 일반인이 근로기준법을 스스로 검색·이해하기 어려운 문제 해결 |
| **WHO** | 근로자/사용자(고용주) — 임금, 퇴직금, 휴가, 4대보험 등 노무 관련 궁금증을 가진 일반인 |
| **RISK** | PDF 텍스트 추출 품질 저하 시 답변 정확도 하락, OpenAI 토큰 비용 초과 |
| **SUCCESS** | 채팅으로 질문 시 3초 내 응답, 근로기준법 관련 질문 80% 이상 정확한 답변 제공 |
| **SCOPE** | Phase 1: UI + 목업 응답 / Phase 2: PDF 파싱 + OpenAI 연동 / Phase 3: Vercel 배포 |

---

## 1. Overview

### 1.1 Design Goals

- React + TypeScript로 타입 안전한 컴포넌트 설계
- PDF 텍스트를 서버에서 캐싱하여 매 요청마다 파싱 오버헤드 제거
- OpenAI API 키를 서버에만 격리하여 보안 보장
- 네이버 스타일 초록색 테마 + 반응형 채팅 UI 구현

### 1.2 Design Principles

- **관심사 분리**: UI(components), API 호출(services), 타입(types) 명확히 분리
- **서버사이드 보안**: API 키와 PDF 처리는 절대 클라이언트에 노출하지 않음
- **단순성 우선**: MVP 수준에서 불필요한 추상화 배제

---

## 2. Architecture

### 2.0 Architecture Comparison

**선택: Option C — Pragmatic Balance**

| 기준 | Option A: Minimal | Option B: Clean | **Option C: Pragmatic** |
|------|:-:|:-:|:-:|
| 신규 파일 수 | 4 | 10 | **6** |
| 복잡도 | 낮음 | 높음 | **중간** |
| 유지보수성 | 낮음 | 높음 | **높음** |
| 개발 속도 | 빠름 | 느림 | **중간** |

**선택 이유**: 컴포넌트 재사용성과 서비스 계층 분리로 유지보수 가능하면서, 4계층 클린 아키텍처의 과도한 복잡성은 배제.

### 2.1 Component Diagram

```
┌─────────────────────────────────────────┐
│          Browser (React + Vite)          │
│                                          │
│  App.tsx                                 │
│   ├── Header (로고 + 제목)               │
│   ├── SampleQuestions (샘플 질문 버튼)   │
│   ├── ChatWindow (메시지 목록)           │
│   │    └── Message (개별 메시지)         │
│   └── ChatInput (입력창 + 전송)          │
│                                          │
│  services/chatApi.ts ──POST /api/chat──▶ │
└──────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│          server.js (Express)             │
│                                          │
│  POST /api/chat                          │
│   ├── pdfText (메모리 캐시)              │
│   └── OpenAI API (gpt-4o-mini)          │
└──────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
  docs/*.pdf            process.env
  (읽기 전용)          OPENAI_API_KEY
```

### 2.2 Data Flow

```
사용자 입력
  → ChatInput.tsx (입력 이벤트)
  → App.tsx (상태 업데이트: messages 배열 추가)
  → chatApi.ts (POST /api/chat { message })
  → server.js (pdfText + message → OpenAI 호출)
  → OpenAI gpt-4o-mini (응답 생성)
  → server.js (응답 반환 { reply })
  → App.tsx (messages 배열에 봇 응답 추가)
  → ChatWindow.tsx (새 메시지 렌더링 + 자동 스크롤)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `App.tsx` | `ChatWindow`, `ChatInput`, `SampleQuestions`, `chatApi` | 상태 관리 및 조율 |
| `ChatWindow.tsx` | `Message` | 메시지 목록 렌더링 |
| `chatApi.ts` | fetch API | 서버 API 호출 |
| `server.js` | `pdf-parse`, `openai`, `express`, `cors` | PDF 파싱 + AI 응답 |

---

## 3. Data Model

### 3.1 TypeScript 타입 정의

```typescript
// src/types/chat.ts

// 채팅 메시지 단위
interface Message {
  id: string;           // crypto.randomUUID()
  role: 'user' | 'bot'; // 발신자 구분
  content: string;      // 메시지 텍스트
  timestamp: Date;      // 생성 시각
}

// /api/chat 요청 본문
interface ChatRequest {
  message: string;      // 사용자 질문
}

// /api/chat 응답 본문
interface ChatResponse {
  reply: string;        // GPT 답변
}

// 에러 응답
interface ErrorResponse {
  error: string;        // 한국어 에러 메시지
}
```

### 3.2 서버 내부 상태

```javascript
// server.js 전역 변수 (메모리 캐시)
let pdfText = '';  // 서버 시작 시 docs/*.pdf 텍스트 저장
```

---

## 4. API Specification

### 4.1 Endpoint List

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/chat` | 사용자 질문 → GPT 답변 반환 | 불필요 |

### 4.2 상세 스펙

#### `POST /api/chat`

**Request:**
```json
{
  "message": "퇴직금은 어떻게 계산하나요?"
}
```

**Response (200 OK):**
```json
{
  "reply": "근로기준법 제34조에 따르면 퇴직금은..."
}
```

**Error Responses:**
- `400 Bad Request`: `{ "error": "메시지를 입력해주세요." }`
- `500 Internal Server Error`: `{ "error": "서버 오류가 발생했습니다." }`

### 4.3 서버 시스템 프롬프트

```
당신은 노무 전문 어시스턴트입니다.
아래 근로기준법 내용을 참고하여 질문에 답변하세요.
법령 조항을 근거로 제시하고, 모르는 내용은 모른다고 답하세요.

[PDF 내용]
{pdfText}
```

---

## 5. UI/UX Design

### 5.1 색상 토큰 (ui_ux.md 기준)

| Token | Value | 용도 |
|-------|-------|------|
| `primary` | `#00C73C` | 전송 버튼, 액센트 |
| `bg-gray-light` | `#F5F5F5` | 봇 메시지 배경, 페이지 배경 |
| `text-dark` | `#333333` | 주요 텍스트 |
| `text-muted` | `#999999` | 보조 텍스트, 타임스탬프 |
| `user-bubble` | `#0066FF` | 사용자 메시지 배경 |
| `white` | `#FFFFFF` | 사용자 메시지 텍스트 |

### 5.2 Screen Layout

```
┌──────────────────────────────────┐  max-w-[900px]
│  🟢 노무 챗봇          Header    │  bg-white, shadow
├──────────────────────────────────┤
│  [최저임금] [퇴직금] [휴가] [4대보험]│  SampleQuestions
├──────────────────────────────────┤
│                                  │
│  봇: 안녕하세요! 노무 관련...    │  ChatWindow
│                      [사용자 메시지]│  h-[400px~500px]
│  봇: 근로기준법 제34조...        │  overflow-y-scroll
│                                  │
├──────────────────────────────────┤
│  [질문을 입력하세요...]  [전송▶]  │  ChatInput
└──────────────────────────────────┘
```

### 5.3 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `App` | `src/App.tsx` | 전체 상태(messages) 관리, 레이아웃 |
| `ChatWindow` | `src/components/ChatWindow.tsx` | 메시지 목록 + 자동 스크롤 |
| `Message` | `src/components/Message.tsx` | 개별 메시지 버블 렌더링 |
| `ChatInput` | `src/components/ChatInput.tsx` | 텍스트 입력 + 전송 버튼 |
| `SampleQuestions` | `src/components/SampleQuestions.tsx` | 샘플 질문 버튼 4개 |

### 5.4 Page UI Checklist

#### 메인 채팅 페이지 (단일 페이지)

- [ ] Header: 로고(초록 원형 아이콘) + "노무 챗봇" 텍스트
- [ ] SampleQuestions: "최저임금 조회" 버튼
- [ ] SampleQuestions: "퇴직금 계산" 버튼
- [ ] SampleQuestions: "휴가 일수" 버튼
- [ ] SampleQuestions: "4대 보험" 버튼
- [ ] ChatWindow: 봇 초기 인사말 메시지 (회색 배경, 왼쪽 정렬)
- [ ] ChatWindow: 사용자 메시지 버블 (파란색 `#0066FF` 배경, 흰 텍스트, 오른쪽 정렬)
- [ ] ChatWindow: 봇 응답 버블 (회색 `#F5F5F5` 배경, 왼쪽 정렬)
- [ ] ChatWindow: 로딩 인디케이터 (봇 응답 대기 중 애니메이션)
- [ ] ChatWindow: 새 메시지 수신 시 자동 하단 스크롤
- [ ] ChatInput: 텍스트 입력창 (placeholder: "질문을 입력하세요...")
- [ ] ChatInput: 전송 버튼 (초록색 `#00C73C`, 화살표 아이콘)
- [ ] ChatInput: Enter 키로 전송 가능
- [ ] 반응형: 모바일(400px) ~ 데스크톱(900px) 레이아웃 정상

---

## 6. Error Handling

### 6.1 에러 코드 정의

| 상황 | HTTP | 메시지 | 클라이언트 처리 |
|------|------|--------|----------------|
| 빈 메시지 전송 | 400 | "메시지를 입력해주세요." | 전송 버튼 비활성화 |
| OpenAI API 오류 | 500 | "서버 오류가 발생했습니다." | 에러 메시지 버블 표시 |
| PDF 로드 실패 | 500 | "문서를 불러올 수 없습니다." | 서버 재시작 유도 |
| 네트워크 오류 | — | "연결을 확인해주세요." | 클라이언트 catch 처리 |

### 6.2 에러 응답 형식

```json
{
  "error": "한국어 에러 메시지"
}
```

---

## 7. Security Considerations

- [x] `OPENAI_API_KEY`는 `server.js`에서만 `process.env`로 참조 — 프론트 노출 금지
- [x] CORS: Express `cors()` 미들웨어로 허용 도메인 제한 (Vercel 도메인만)
- [x] 입력값 검증: 빈 메시지, 과도하게 긴 메시지(5000자 초과) 400 반환
- [x] `.env` Git 미포함 (.gitignore 확인 완료)
- [ ] Rate Limiting: `express-rate-limit` 적용 (100req/15min)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool | Phase |
|------|--------|------|-------|
| L1: API Tests | `/api/chat` 엔드포인트 | curl | Do |
| L2: UI Action Tests | 채팅 인터페이스 요소 | 수동 테스트 | Do |
| L3: E2E Scenario | 질문→답변 전체 플로우 | 수동 테스트 | Do |

### 8.2 L1: API Test Scenarios

| # | Endpoint | Method | 설명 | 예상 Status | 예상 응답 |
|---|----------|--------|------|:-----------:|-----------|
| 1 | `/api/chat` | POST | 정상 질문 전송 | 200 | `.reply` 문자열 존재 |
| 2 | `/api/chat` | POST | 빈 메시지 전송 | 400 | `.error` = "메시지를 입력해주세요." |
| 3 | `/api/chat` | POST | 노무 관련 질문 | 200 | 법령 조항 포함된 답변 |

### 8.3 L2: UI Action Test Scenarios

| # | 액션 | 예상 결과 |
|---|------|-----------|
| 1 | 샘플 질문 버튼 클릭 | 해당 질문 자동 전송, 봇 응답 표시 |
| 2 | 텍스트 입력 후 Enter | 메시지 전송, 입력창 초기화 |
| 3 | 전송 중 버튼 상태 | 전송 버튼 비활성화 + 로딩 표시 |
| 4 | 메시지 누적 | 스크롤 자동 하단 이동 |

### 8.4 L3: E2E Scenario

| # | 시나리오 | 단계 | 성공 기준 |
|---|----------|------|-----------|
| 1 | 퇴직금 문의 | 버튼 클릭 → 응답 확인 | 근로기준법 조항 포함 답변 |
| 2 | 직접 질문 | 입력 → 전송 → 응답 | 3초 내 응답 표시 |
| 3 | 연속 질문 | 3회 연속 질문 | 대화 히스토리 유지 안 되어도 정상 |

---

## 9. Clean Architecture (Dynamic Level)

### 9.1 레이어 구조

| 레이어 | 책임 | 위치 |
|--------|------|------|
| **Presentation** | UI 컴포넌트, 이벤트 핸들러 | `src/components/`, `src/App.tsx` |
| **Application** | API 호출 서비스 | `src/services/` |
| **Domain** | 타입, 인터페이스 | `src/types/` |
| **Infrastructure** | Express 서버, PDF 처리, OpenAI 연동 | `server.js` |

### 9.2 이 피처의 레이어 할당

| 컴포넌트 | 레이어 | 위치 |
|---------|--------|------|
| `App`, `ChatWindow`, `Message`, `ChatInput`, `SampleQuestions` | Presentation | `src/components/` |
| `chatApi.ts` | Application | `src/services/` |
| `Message`, `ChatRequest`, `ChatResponse` | Domain | `src/types/chat.ts` |
| `server.js` (PDF + OpenAI) | Infrastructure | 루트 |

---

## 10. Coding Convention Reference

### 10.1 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `ChatWindow`, `ChatInput` |
| 함수/변수 | camelCase | `sendMessage()`, `pdfText` |
| 타입/인터페이스 | PascalCase | `Message`, `ChatResponse` |
| 파일(컴포넌트) | PascalCase.tsx | `ChatWindow.tsx` |
| 파일(유틸) | camelCase.ts | `chatApi.ts` |

### 10.2 환경변수 규칙

| 변수 | 범위 | 설명 |
|------|------|------|
| `OPENAI_API_KEY` | 서버 전용 | 절대 `VITE_` 접두사 금지 |
| `VITE_API_URL` | 클라이언트 (dev) | 로컬 개발 시 `http://localhost:3001` |
| `PORT` | 서버 | Express 포트 (기본 3001) |

---

## 11. Implementation Guide

### 11.1 File Structure

```
my-pdf-chatbot2/
├── src/
│   ├── components/
│   │   ├── ChatWindow.tsx     # 메시지 목록 + 자동 스크롤
│   │   ├── ChatInput.tsx      # 입력창 + 전송 버튼
│   │   ├── Message.tsx        # 개별 메시지 버블
│   │   └── SampleQuestions.tsx # 샘플 질문 버튼 4개
│   ├── services/
│   │   └── chatApi.ts         # POST /api/chat 호출
│   ├── types/
│   │   └── chat.ts            # Message, ChatRequest, ChatResponse
│   ├── App.tsx                # 루트 컴포넌트 + 상태 관리
│   ├── main.tsx               # React 진입점
│   └── index.css              # Tailwind directives
├── server.js                  # Express API + PDF 로드 + OpenAI
├── docs/
│   └── 근로기준법(법률)(...).pdf
├── .env                       # OPENAI_API_KEY (Git 제외)
├── .gitignore
├── package.json
├── vite.config.ts             # Vite 빌드 설정 (proxy: /api → 3001)
├── tailwind.config.js
├── tsconfig.json
└── vercel.json                # Vercel 배포 설정
```

### 11.2 Implementation Order

1. [ ] `package.json` 초기화 및 의존성 설치
   - 프론트: `react`, `react-dom`, `typescript`, `vite`, `tailwindcss`
   - 백엔드: `express`, `cors`, `pdf-parse`, `openai`, `dotenv`
2. [ ] `tsconfig.json`, `vite.config.ts`, `tailwind.config.js` 설정
3. [ ] `src/types/chat.ts` 타입 정의
4. [ ] `server.js` 구현 (PDF 로드 + `/api/chat` 엔드포인트)
5. [ ] `src/services/chatApi.ts` 구현
6. [ ] `src/components/Message.tsx` 구현
7. [ ] `src/components/ChatWindow.tsx` 구현
8. [ ] `src/components/ChatInput.tsx` 구현
9. [ ] `src/components/SampleQuestions.tsx` 구현
10. [ ] `src/App.tsx` 구현 (상태 관리 + 레이아웃)
11. [ ] `vercel.json` 배포 설정
12. [ ] 로컬 테스트 후 Vercel 배포

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | 설명 | 예상 턴 |
|--------|-----------|------|:-------:|
| 프로젝트 설정 | `module-1` | package.json, vite, tailwind, tsconfig | 10-15 |
| 백엔드 서버 | `module-2` | server.js (PDF + OpenAI + Express) | 15-20 |
| 프론트 컴포넌트 | `module-3` | types + services + 4개 컴포넌트 + App.tsx | 20-25 |
| 배포 설정 | `module-4` | vercel.json + 환경변수 + 최종 테스트 | 10-15 |

#### Recommended Session Plan

| 세션 | 단계 | Scope | 예상 턴 |
|------|------|-------|:-------:|
| Session 1 | Plan + Design | 전체 | 30-35 |
| Session 2 | Do | `--scope module-1,module-2` | 40-50 |
| Session 3 | Do | `--scope module-3,module-4` | 40-50 |
| Session 4 | Check + Report | 전체 | 20-30 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-07 | 초기 Design 작성 (Option C Pragmatic 선택) | JUNGMIN |
