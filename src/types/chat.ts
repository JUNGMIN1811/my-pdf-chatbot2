// Design Ref: §3.1 — 채팅 도메인 타입 정의

// 채팅 메시지 단위
export interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

// /api/chat 요청 본문
export interface ChatRequest {
  message: string
}

// /api/chat 응답 본문
export interface ChatResponse {
  reply: string
}

// 에러 응답
export interface ErrorResponse {
  error: string
}
