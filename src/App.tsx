// Design Ref: §9.1 — Presentation 레이어: 전체 상태 관리 및 레이아웃

import { useState } from 'react'
import type { Message } from './types/chat'
import { sendMessage } from './services/chatApi'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'
import SampleQuestions from './components/SampleQuestions'

// Plan SC: FR-07 — 초기 인사말 메시지
const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'bot',
  content:
    '안녕하세요! 노무 업무 어시스턴트입니다.\n근로기준법에 관한 궁금한 점을 질문해 주세요.',
  timestamp: new Date(),
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Plan SC: FR-01 — 메시지 전송 및 GPT 응답 처리
  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const reply = await sendMessage(text)
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: reply,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: err instanceof Error ? err.message : '연결을 확인해주세요.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Design Ref: §5.2 — 반응형 레이아웃 min-w-[400px] max-w-[900px]
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full min-w-[400px] max-w-[900px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">

        {/* 헤더 — Design Ref: §5.4 */}
        <header className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <h1 className="font-bold text-[#333333] text-lg">노무 챗봇</h1>
        </header>

        {/* 샘플 질문 버튼 */}
        <SampleQuestions onSelect={handleSend} disabled={isLoading} />

        {/* 채팅 메시지 영역 */}
        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* 입력창 */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
