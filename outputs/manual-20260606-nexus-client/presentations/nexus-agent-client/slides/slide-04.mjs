import { C, bg, title, footer, panel, bullet } from './common.mjs'

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Use case 1', 'Turn post-visit feedback into structured reviews', 'The review agent is designed to be warm and short: positive feedback closes quickly, while negative feedback asks for optional contact details for follow-up.')
  const y = 338
  const steps = [
    ['1', 'Customer speaks', '“How was your experience today?”', C.cyan],
    ['2', 'Agent listens', 'Same-language response in English or Urdu', C.emerald],
    ['3', 'AI classifies', 'sentiment, category, subcategory, rating', C.amber],
    ['4', 'Dashboard updates', 'Review saved with summary and transcript', C.violet],
  ]
  steps.forEach(([num, h, b, color], i) => {
    const x = 86 + i * 285
    ctx.addShape(slide, { geometry: 'ellipse', left: x, top: y, width: 68, height: 68, fill: color, line: { fill: color, width: 0 } })
    ctx.addText(slide, { text: num, left: x, top: y + 16, width: 68, height: 30, fontSize: 24, bold: true, color: C.ink, align: 'center' })
    panel(slide, ctx, x - 34, y + 94, 210, 126)
    ctx.addText(slide, { text: h, left: x - 8, top: y + 116, width: 158, height: 28, fontSize: 18, bold: true, color: C.white, align: 'center' })
    ctx.addText(slide, { text: b, left: x - 12, top: y + 154, width: 168, height: 42, fontSize: 13, color: C.soft, align: 'center' })
    if (i < 3) ctx.addShape(slide, { geometry: 'line', left: x + 78, top: y + 34, width: 210, height: 0, line: { fill: C.line, width: 3 } })
  })
  bullet(slide, ctx, 'Positive review: thanks customer and ends without asking for unnecessary contact details', 100, 610, C.emerald)
  bullet(slide, ctx, 'Negative, complaint, or suggestion: captures name and phone together, then routes follow-up', 650, 610, C.red)
  footer(slide, ctx, 4)
  return slide
}
