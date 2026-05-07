// Design Ref: §2.3 — Application 레이어: /api/chat 서버 호출 로직

import type { ChatRequest, ChatResponse } from '../types/chat'

// Plan SC: FR-01 — 사용자 질문을 서버로 전달하고 GPT 답변을 반환
export async function sendMessage(message: string): Promise<string> {
  const body: ChatRequest = { message }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || '서버 오류가 발생했습니다.')
  }

  const data: ChatResponse = await res.json()
  return data.reply
}
