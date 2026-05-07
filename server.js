// Design Ref: §9.1 — Infrastructure 레이어: Express 서버, PDF 처리, OpenAI 연동

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Plan SC: FR-06 — API 키는 서버에서만 처리 (SambaNova API)
const openai = new OpenAI({
  apiKey: process.env.SAMBANOVA_API_KEY,
  baseURL: 'https://api.sambanova.ai/v1',
})

app.use(cors())
app.use(express.json())

// Plan SC: FR-02 — 서버 시작 시 docs/ 폴더의 PDF를 메모리에 캐싱
let pdfText = ''

async function loadPdfDocuments() {
  const docsDir = path.join(__dirname, 'docs')

  if (!fs.existsSync(docsDir)) {
    console.log('docs/ 폴더가 없습니다. PDF 없이 시작합니다.')
    return
  }

  const pdfFiles = fs.readdirSync(docsDir).filter((f) => f.endsWith('.pdf'))

  if (pdfFiles.length === 0) {
    console.log('docs/ 폴더에 PDF 파일이 없습니다.')
    return
  }

  const texts = []
  for (const file of pdfFiles) {
    try {
      const buffer = fs.readFileSync(path.join(docsDir, file))
      const data = await pdfParse(buffer)
      texts.push(`=== ${file} ===\n${data.text}`)
      console.log(`PDF 로드 완료: ${file} (${data.numpages}페이지)`)
    } catch (err) {
      console.error(`PDF 로드 실패: ${file}`, err.message)
    }
  }

  pdfText = texts.join('\n\n')
  console.log(`총 PDF 텍스트 길이: ${pdfText.length}자`)
}

// Plan SC: FR-01 — 사용자 질문을 PDF 컨텍스트와 함께 OpenAI에 전달
app.post('/api/chat', async (req, res) => {
  const { message } = req.body

  // 입력 검증
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: '메시지를 입력해주세요.' })
  }

  if (message.length > 5000) {
    return res.status(400).json({ error: '메시지가 너무 깁니다. (최대 5000자)' })
  }

  try {
    // Design Ref: §4.3 — 시스템 프롬프트에 PDF 텍스트 주입
    const pdfSection = pdfText
      ? `\n\n[참고 법령 원문]\n${pdfText.slice(0, 12000)}`
      : ''

    const systemPrompt = `당신은 노무 전문 FAQ 어시스턴트입니다.
아래 지침에 따라 질문에 답변하십시오.

[답변 구조 — 반드시 아래 4개 항목을 순서대로 작성]
1. ✅ **결론**: 질문에 대한 핵심 답변을 한 문장으로 제시합니다.
2. 📋 **근거**: 관련 법령 조항을 직접 인용합니다. (예: 근로기준법 제○조 ○항)
3. 📌 **상세 설명**: 조건, 예외, 계산 방법 등을 항목별 bullet(•)로 서술합니다.
4. ⚠️ **유의사항**: 혼동하기 쉬운 부분이나 자주 발생하는 오해를 안내합니다.

[말투] 격식체를 사용합니다. (~입니다, ~합니다, ~됩니다)
[형식] 항목별 bullet(•) 사용, 핵심 수치·기간·금액은 **굵게** 표시합니다.
[이모티콘] 내용의 성격에 맞는 이모티콘을 자연스럽게 활용합니다.
  • 긍정적 내용 (권리, 수당, 혜택): 💰 🎉 👍
  • 기간·날짜 관련: 📅 ⏰
  • 계산·수치 관련: 🔢 💡
  • 주의·예외 사항: ⚠️ ❗
  • 법령·문서 인용: 📋 📄
  • 답변 마무리 인사: 😊
[길이] 각 항목을 충분히 상세하게 작성합니다. 내용이 많을수록 좋습니다.
[원칙] 참고 법령 원문에 근거가 있으면 반드시 인용하고, 없으면 일반 노무 지식을 바탕으로 답변하되 "법령 원문에서 확인되지 않은 내용입니다"라고 명시합니다.${pdfSection}`

    const completion = await openai.chat.completions.create({
      model: process.env.HF_MODEL || 'Meta-Llama-3.3-70B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const reply = completion.choices[0]?.message?.content || '답변을 생성할 수 없습니다.'
    res.json({ reply })
  } catch (err) {
    console.error('SambaNova API 오류:', err.message)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
})

// 서버 시작
loadPdfDocuments().then(() => {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`)
  })
})
