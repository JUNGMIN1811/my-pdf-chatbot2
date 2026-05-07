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

// Plan SC: FR-06 — API 키는 서버에서만 처리
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
    const systemPrompt = pdfText
      ? `당신은 노무 전문 어시스턴트입니다.\n아래 근로기준법 내용을 참고하여 질문에 답변하세요.\n법령 조항을 근거로 제시하고, 모르는 내용은 모른다고 답하세요.\n\n[PDF 내용]\n${pdfText.slice(0, 12000)}`
      : '당신은 노무 전문 어시스턴트입니다. 근로기준법 등 노무 관련 질문에 성실히 답변하세요.'

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    console.error('OpenAI API 오류:', err.message)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
})

// 서버 시작
loadPdfDocuments().then(() => {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`)
  })
})
