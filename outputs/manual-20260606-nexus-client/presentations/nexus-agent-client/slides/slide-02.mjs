import { C, bg, title, footer, bullet, panel } from './common.mjs'

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Why outlets need it', 'Feedback disappears at the exact moment it matters', 'Most outlet teams only hear from customers after the experience has already turned into a public review, a lost customer, or a silent operational issue.')
  const moments = [
    ['Happy customer leaves', 'No prompt, no review, no reusable praise', C.emerald],
    ['Unhappy customer complains to staff', 'Details are emotional, incomplete, and rarely classified', C.red],
    ['Manager checks later', 'No transcript, no branch trend, no customer contact', C.amber],
    ['Regional team compares outlets', 'Issues are anecdotal instead of measurable', C.violet],
  ]
  moments.forEach(([head, body, color], i) => {
    const x = 76 + i * 286
    ctx.addShape(slide, { left: x, top: 286, width: 42, height: 42, fill: color, line: { fill: color, width: 0 } })
    ctx.addText(slide, { text: String(i + 1), left: x, top: 296, width: 42, height: 22, fontSize: 16, bold: true, color: C.ink, align: 'center' })
    panel(slide, ctx, x - 26, 354, 230, 122)
    ctx.addText(slide, { text: head, left: x - 10, top: 378, width: 198, height: 28, fontSize: 18, bold: true, color: C.white })
    ctx.addText(slide, { text: body, left: x - 10, top: 416, width: 198, height: 50, fontSize: 13, color: C.soft })
    if (i < 3) ctx.addShape(slide, { geometry: 'line', left: x + 206, top: 374, width: 72, height: 0, line: { fill: C.line, width: 2 } })
  })
  ctx.addText(slide, { text: 'Nexus Agent turns the outlet counter into a structured customer intelligence point.', left: 100, top: 558, width: 920, height: 42, fontSize: 28, bold: true, color: C.cyan, align: 'center' })
  bullet(slide, ctx, 'Captures the voice of the customer while the visit is still fresh', 160, 620, C.emerald)
  bullet(slide, ctx, 'Routes complaints into follow-up instead of letting them disappear', 660, 620, C.red)
  footer(slide, ctx, 2)
  return slide
}
