import { C, bg, title, footer, panel } from './common.mjs'

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Product system', 'From spoken conversation to manager action', 'The repo implements a full pipeline: record, transcribe, stream AI response, synthesize voice, extract hidden classification tokens, summarize, persist, and alert.')
  const nodes = [
    ['Customer voice', `Mic recording
60s turn cap`, C.cyan],
    ['Transcription', `OpenAI Whisper
via /api/transcribe`, C.blue],
    ['AI conversation', `Streaming chat
SSE sentence events`, C.violet],
    ['Classification', `LEAD + REVIEW
hidden tokens`, C.amber],
    ['Persistence', `Review + Lead
summary + transcript`, C.emerald],
    ['Manager action', `Ticket priority
SLA + escalation`, C.red],
  ]
  nodes.forEach(([h, b, color], i) => {
    const x = 70 + i * 196
    panel(slide, ctx, x, 292, 154, 150, i % 2 ? C.ink2 : C.panel)
    ctx.addShape(slide, { left: x, top: 292, width: 154, height: 6, fill: color })
    ctx.addText(slide, { text: h, left: x + 14, top: 318, width: 126, height: 30, fontSize: 16, bold: true, color: C.white, align: 'center' })
    ctx.addText(slide, { text: b, left: x + 14, top: 366, width: 126, height: 52, fontSize: 12, color: C.soft, align: 'center' })
    if (i < 5) ctx.addShape(slide, { geometry: 'line', left: x + 160, top: 367, width: 38, height: 0, line: { fill: C.cyan, width: 2 } })
  })
  panel(slide, ctx, 130, 500, 990, 82, '#0A2432', C.cyan)
  ctx.addText(slide, { text: 'Branch context is automatic: tenant + token + shop code tell the agent which outlet it is serving, so customers do not need to explain where they visited.', left: 166, top: 522, width: 900, height: 36, fontSize: 20, bold: true, color: C.white, align: 'center' })
  footer(slide, ctx, 3)
  return slide
}
