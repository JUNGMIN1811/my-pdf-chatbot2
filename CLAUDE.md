# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

노무 관련 PDF 문서(근로기준법 등)를 기반으로 사용자 질문에 답변하는 챗봇.
Node.js + Express 백엔드, HTML/CSS/JS 프론트엔드, Vercel 배포.

## 기술 스택

- **서버**: Node.js + Express
- **프론트엔드**: HTML / CSS / JavaScript (바닐라)
- **AI**: OpenAI API — `gpt-4o-mini`
- **PDF 처리**: `pdf-parse`
- **배포**: Vercel

## 개발 명령어

```powershell
npm install       # 의존성 설치
node server.js    # 로컬 서버 실행
vercel dev        # Vercel 로컬 테스트
```

## 아키텍처

프론트엔드(`public/`)는 `/api/chat`에 POST 요청을 보내고, `server.js`가 PDF 텍스트를 컨텍스트로 포함해 OpenAI API를 호출한 뒤 응답을 반환한다. PDF는 서버 시작 시 `docs/`에서 로드해 메모리에 캐싱한다.

```
public/app.js  →  POST /api/chat  →  server.js  →  OpenAI API
                                         ↑
                                     docs/*.pdf (시작 시 로드)
```

## 환경변수

`.env`에 아래 키가 필요하다. **이 파일은 절대 읽거나 수정하거나 Git에 추가하지 않는다.**

```
OPENAI_API_KEY=sk-...
```

Vercel 배포 시 대시보드 → Settings → Environment Variables에 직접 등록한다.

## 핵심 규칙

- `OPENAI_API_KEY`는 `server.js`에서만 `process.env`로 참조한다 — 프론트엔드 노출 금지
- PDF 파일은 `docs/` 폴더에만 보관한다
- 코드 주석은 **항상 한국어**로 작성한다
- 에러 응답은 HTTP 상태 코드 + 한국어 메시지로 통일한다
