import { C, bg, footer, metric, pill } from './common.mjs'

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  ctx.addShape(slide, { left: 0, top: 0, width: 18, height: ctx.H, fill: C.cyan })
  ctx.addText(slide, { text: 'NEXUS AGENT', left: 60, top: 92, width: 860, height: 82, fontSize: 64, bold: true, color: C.white, typeface: ctx.fonts.title })
  ctx.addText(slide, { text: `AI voice agent for outlet feedback, complaints,
and customer follow-up`, left: 64, top: 184, width: 720, height: 64, fontSize: 23, color: C.cyan })
  ctx.addText(slide, { text: 'A customer speaks naturally. The agent listens, responds, classifies the conversation, creates follow-up tickets, and gives managers a live dashboard across outlets.', left: 66, top: 276, width: 650, height: 100, fontSize: 21, color: C.soft })
  pill(slide, ctx, 'Voice first', 66, 414, 130, C.cyan)
  pill(slide, ctx, 'Urdu + English', 216, 414, 158, C.emerald)
  pill(slide, ctx, 'Branch aware', 394, 414, 142, C.amber)
  pill(slide, ctx, 'Dashboard ready', 556, 414, 166, C.violet, C.white)
  ctx.addShape(slide, { left: 844, top: 86, width: 300, height: 520, fill: C.panel2, line: { fill: C.line, width: 1 } })
  ctx.addText(slide, { text: 'Customer moment', left: 875, top: 128, width: 240, height: 28, fontSize: 14, bold: true, color: C.cyan, align: 'center' })
  for (let i = 0; i < 4; i++) {
    const y = 186 + i * 72
    ctx.addShape(slide, { left: 890 + i * 12, top: y, width: 148 + i * 14, height: 42, fill: i % 2 ? C.ink2 : C.panel, line: { fill: C.line, width: 1 } })
  }
  ctx.addText(slide, { text: '“The staff handled it well.”', left: 916, top: 198, width: 200, height: 24, fontSize: 14, color: C.white })
  ctx.addText(slide, { text: '“Food was cold.”', left: 930, top: 270, width: 160, height: 24, fontSize: 14, color: C.white })
  ctx.addText(slide, { text: 'sentiment: complaint', left: 908, top: 414, width: 210, height: 24, fontSize: 15, bold: true, color: C.red, align: 'center' })
  ctx.addText(slide, { text: 'ticket: CMP · SLA 24h', left: 908, top: 444, width: 210, height: 24, fontSize: 15, bold: true, color: C.amber, align: 'center' })
  metric(slide, ctx, 'Designed for', 'Outlets', 'Restaurants, retail branches, kiosks, service counters', 66, 530, C.emerald)
  metric(slide, ctx, 'Captured', 'Every call', 'Transcript, summary, sentiment, category, contact', 314, 530, C.cyan)
  metric(slide, ctx, 'Action', 'Follow-up', 'Tickets, priority, SLA, email escalation', 562, 530, C.amber)
  footer(slide, ctx, 1)
  return slide
}
