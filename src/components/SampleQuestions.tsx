// Design Ref: §5.4 — 샘플 질문 버튼 4개 (Plan SC: FR-03, FR-07)

const SAMPLE_QUESTIONS = [
  '최저임금 조회',
  '퇴직금 계산',
  '휴가 일수',
  '4대 보험',
]

interface Props {
  onSelect: (question: string) => void
  disabled: boolean
}

export default function SampleQuestions({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-gray-100">
      {SAMPLE_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="text-xs px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
