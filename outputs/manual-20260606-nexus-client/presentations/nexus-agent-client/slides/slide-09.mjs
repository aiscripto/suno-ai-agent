import { C, bg, title, footer, panel } from './common.mjs'

export async function slide09(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Business case', 'The value is not “AI novelty”; it is faster service recovery', 'For outlets, the commercial case comes from protecting repeat visits, reducing manager blind spots, and making follow-up measurable.')
  const cx = 610, cy = 414
  ctx.addShape(slide, { geometry: 'ellipse', left: cx - 96, top: cy - 96, width: 192, height: 192, fill: C.panel2, line: { fill: C.cyan, width: 2 } })
  ctx.addText(slide, { text: `Service
Recovery
Loop`, left: cx - 70, top: cy - 54, width: 140, height: 92, fontSize: 24, bold: true, color: C.white, align: 'center' })
  const items = [
    ['Capture', 'Every customer can speak at the outlet', 240, 250, C.cyan],
    ['Understand', 'AI classifies issue, rating, and category', 760, 250, C.amber],
    ['Act', 'Ticket priority and SLA direct follow-up', 760, 520, C.red],
    ['Improve', 'Dashboard reveals outlet-level patterns', 240, 520, C.emerald],
  ]
  items.forEach(([h, b, x, y, color]) => {
    panel(slide, ctx, x, y, 280, 88)
    ctx.addText(slide, { text: h, left: x + 24, top: y + 18, width: 220, height: 26, fontSize: 22, bold: true, color })
    ctx.addText(slide, { text: b, left: x + 24, top: y + 50, width: 230, height: 30, fontSize: 13, color: C.soft })
  })
  ctx.addShape(slide, { geometry: 'line', left: 522, top: 298, width: 214, height: 0, line: { fill: C.line, width: 2 } })
  ctx.addShape(slide, { geometry: 'line', left: 902, top: 344, width: 0, height: 168, line: { fill: C.line, width: 2 } })
  ctx.addShape(slide, { geometry: 'line', left: 522, top: 566, width: 214, height: 0, line: { fill: C.line, width: 2 } })
  ctx.addShape(slide, { geometry: 'line', left: 378, top: 344, width: 0, height: 168, line: { fill: C.line, width: 2 } })
  footer(slide, ctx, 9)
  return slide
}
