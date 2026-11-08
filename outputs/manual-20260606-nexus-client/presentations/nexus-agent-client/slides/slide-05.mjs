import { C, bg, title, footer, panel } from './common.mjs'

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Use case 2', 'Complaints become managed tickets, not hallway conversations', 'The complaint agent is trained to acknowledge, avoid excuses, capture optional contact details, and trigger escalation for serious issues.')
  const tiers = [
    ['Normal', 'Suggestion or mild negative', '72h SLA', C.emerald],
    ['High', 'Complaint or low rating', '24h SLA', C.amber],
    ['Urgent', 'Hygiene, safety, rude staff, injury, refund risk', '4h SLA', C.red],
  ]
  tiers.forEach(([h, b, sla, color], i) => {
    const x = 114 + i * 360
    panel(slide, ctx, x, 294 - i * 24, 286, 182 + i * 24, i === 2 ? '#351727' : C.panel)
    ctx.addText(slide, { text: h, left: x + 24, top: 322 - i * 24, width: 180, height: 36, fontSize: 26, bold: true, color })
    ctx.addText(slide, { text: b, left: x + 24, top: 370 - i * 24, width: 226, height: 52, fontSize: 15, color: C.soft })
    ctx.addShape(slide, { left: x + 24, top: 446, width: 118, height: 38, fill: color, line: { fill: color, width: 0 } })
    ctx.addText(slide, { text: sla, left: x + 34, top: 456, width: 98, height: 20, fontSize: 14, bold: true, color: C.ink, align: 'center' })
  })
  ctx.addText(slide, { text: 'Built-in ticket logic', left: 116, top: 568, width: 240, height: 26, fontSize: 19, bold: true, color: C.cyan })
  ctx.addText(slide, { text: 'The summarization route classifies complaint risk, generates CMP / NEG / SUG ticket IDs, assigns priority, calculates SLA due time, and sends escalation alerts for serious cases.', left: 116, top: 602, width: 990, height: 48, fontSize: 18, color: C.white })
  footer(slide, ctx, 5)
  return slide
}
