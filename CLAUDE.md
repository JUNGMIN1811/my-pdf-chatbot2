# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

노무 관련 PDF 문서(근로기준법 등)를 기반으로 사용자 질문에 답변하는 챗봇.
Node.js + Express 백엔드, HTML/CSS/JS 프론트엔드, Vercel 배포.

## 기술 스택

- **서버**: Node.js + Express (`"type": "module"`, ESM)
- **프론트엔드**: React + TypeScript + Tailwind CSS (Vite 빌드)
- **AI**: OpenAI API — `gpt-4o-mini`
- **PDF 처리**: `pdf-parse`
- **배포**: Vercel

## 개발 명령어

```powershell
npm install           # 의존성 설치
node server.js        # 백엔드 서버 실행 (port 3001)
npm run dev:client    # 프론트엔드 개발 서버 실행 (port 5173)
npm run build         # 프로덕션 빌드
```

## 아키텍처

```
src/App.tsx  →  POST /api/chat  →  server.js  →  OpenAI API
(Vite proxy)                           ↑
                                   docs/*.pdf (시작 시 로드)
```

- 프론트: `src/` (React + TypeScript + Tailwind)
- 백엔드: `server.js` (Express, ESM)
- Vite 개발 서버가 `/api` 요청을 `localhost:3001`로 프록시

## 환경변수

`.env`에 아래 키가 필요하다. **이 파일은 절대 읽거나 수정하거나 Git에 추가하지 않는다.**

```
OPENAI_API_KEY=sk-...
```

Vercel 배포 시 대시보드 → Settings → Environment Variables에 직접 등록한다.

## 사용자 가이드

### PDF 교체 방법

1. 기존 PDF를 `docs/` 폴더에서 삭제한다
2. 새 PDF 파일을 `docs/` 폴더에 복사한다
3. 서버를 재시작한다 (`node server.js` 또는 `vercel dev`)
   - 서버는 시작 시 `docs/` 폴더의 PDF를 자동으로 다시 로드한다
4. Vercel 배포 환경에서 교체 시: 새 PDF를 커밋 후 푸시하면 자동 재배포된다

> 주의: PDF가 이미지형(스캔본)인 경우 텍스트 추출이 되지 않는다. 반드시 텍스트 기반 PDF를 사용한다.

---

## 핵심 규칙

- `OPENAI_API_KEY`는 `server.js`에서만 `process.env`로 참조한다 — 프론트엔드 노출 금지
- PDF 파일은 `docs/` 폴더에만 보관한다
- 코드 주석은 **항상 한국어**로 작성한다
- 에러 응답은 HTTP 상태 코드 + 한국어 메시지로 통일한다
