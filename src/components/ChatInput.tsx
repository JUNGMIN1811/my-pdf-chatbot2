// Design Ref: §5.3 — 텍스트 입력창 + 전송 버튼

interface Props {
  onSend: (message: string) => void
  isLoading: boolean
  value: string
  onChange: (value: string) => void
}

export default function ChatInput({ onSend, isLoading, value, onChange }: Props) {
  // Plan SC: FR-03, FR-06 — Enter 키 전송 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
  }

  return (
    <div className="flex gap-2 px-4 py-3 border-t border-gray-200 bg-white">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="질문을 입력하세요..."
        disabled={isLoading}
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
      {/* Plan SC: FR-01 — 전송 버튼 (초록색 #00C73C) */}
      <button
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-90 transition-all flex-shrink-0"
        aria-label="전송"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  )
}
