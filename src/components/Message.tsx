// Design Ref: §5.3 — 개별 메시지 버블 컴포넌트

import type { Message } from '../types/chat'

interface Props {
  message: Message
}

// XSS 방지: & < > 문자를 HTML 엔티티로 이스케이프
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// bot 메시지 전용 마크다운 → HTML 변환 (외부 라이브러리 없이 직접 구현)
function renderMarkdown(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let inList = false

  for (const raw of lines) {
    const line = escapeHtml(raw)

    // * 또는 • 로 시작하는 목록 항목
    const listMatch = line.match(/^[*•]\s+(.+)/)
    if (listMatch) {
      if (!inList) {
        result.push('<ul class="list-none pl-0 my-1 space-y-0.5">')
        inList = true
      }
      result.push(`<li class="flex gap-1.5"><span class="text-[#00C73C] flex-shrink-0">•</span><span>${applyInline(listMatch[1])}</span></li>`)
      continue
    }

    // 목록 종료
    if (inList) {
      result.push('</ul>')
      inList = false
    }

    // 빈 줄
    if (line.trim() === '') {
      result.push('<br>')
      continue
    }

    // 일반 텍스트 (인라인 포맷 적용 후 줄바꿈)
    result.push(`<span class="block">${applyInline(line)}</span>`)
  }

  if (inList) result.push('</ul>')

  return result.join('')
}

// **굵게** 인라인 변환
function applyInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export default function Message({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#0066FF] text-white rounded-br-sm'
            : 'bg-[#F5F5F5] text-[#333333] rounded-bl-sm'
        }`}
      >
        {isUser ? (
          // 사용자 메시지: textContent 그대로 렌더링
          <span>{message.content}</span>
        ) : (
          // bot 메시지: 마크다운 렌더링 (dangerouslySetInnerHTML은 escapeHtml 처리 후 안전)
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
        )}
      </div>
    </div>
  )
}
