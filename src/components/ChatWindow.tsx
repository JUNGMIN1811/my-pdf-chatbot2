// Design Ref: §5.3 — 메시지 목록 + 자동 하단 스크롤

import { useEffect, useRef } from 'react'
import type { Message } from '../types/chat'
import MessageBubble from './Message'

interface Props {
  messages: Message[]
  isLoading: boolean
}

export default function ChatWindow({ messages, isLoading }: Props) {
  // Plan SC: FR-04 — 새 메시지 수신 시 자동 하단 스크롤
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 min-h-[400px] max-h-[500px]">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Plan SC: FR-05 — 로딩 인디케이터 */}
      {isLoading && (
        <div className="flex justify-start mb-3">
          <div className="bg-[#F5F5F5] rounded-2xl rounded-bl-sm px-4 py-3">
            <span className="flex gap-1">
              <span className="w-2 h-2 bg-[#999999] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-[#999999] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-[#999999] rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
