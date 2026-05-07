// Design Ref: §5.3 — 개별 메시지 버블 컴포넌트

import type { Message } from '../types/chat'

interface Props {
  message: Message
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
        {/* 메시지 내용 — 줄바꿈 처리 */}
        {message.content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  )
}
