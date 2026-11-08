import { C, bg, title, footer, panel } from './common.mjs'

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Manager dashboard', 'Outlet leaders see patterns, not scattered anecdotes', 'The dashboard query aggregates sentiment, category, ratings, top issues, top suggestions, recent reviews, shop stats, ticket status, and lead contact details.')
  panel(slide, ctx, 62, 250, 1090, 390, '#F6FAFE', '#D9E7F2')
  ctx.addText(slide, { text: 'Customer Experience Command Center', left: 92, top: 278, width: 450, height: 26, fontSize: 18, bold: true, color: C.ink })
  const bars = [
    ['Positive', 250, C.emerald],
    ['Negative', 130, C.amber],
    ['Complaint', 95, C.red],
    ['Suggestion', 170, C.violet],
  ]
  bars.forEach(([label, w, color], i) => {
    const y = 340 + i * 48
    ctx.addText(slide, { text: label, left: 96, top: y, width: 100, height: 20, fontSize: 13, color: C.ink, bold: true })
    ctx.addShape(slide, { left: 204, top: y + 4, width: 280, height: 14, fill: '#E6EEF6' })
    ctx.addShape(slide, { left: 204, top: y + 4, width: w, height: 14, fill: color })
  })
  panel(slide, ctx, 565, 304, 246, 212, C.white, '#D9E7F2')
  ctx.addText(slide, { text: 'Top issue clusters', left: 592, top: 326, width: 190, height: 22, fontSize: 15, bold: true, color: C.ink })
  ;[['cold food', C.red], ['rude cashier', C.amber], ['slow service', C.violet], ['pricing confusion', C.blue]].forEach(([t, color], i) => {
    ctx.addShape(slide, { geometry: 'ellipse', left: 596, top: 368 + i * 34, width: 12, height: 12, fill: color, line: { fill: color, width: 0 } })
    ctx.addText(slide, { text: t, left: 620, top: 362 + i * 34, width: 160, height: 22, fontSize: 13, color: C.ink })
  })
  panel(slide, ctx, 850, 304, 250, 212, C.white, '#D9E7F2')
  ctx.addText(slide, { text: 'Recent ticket', left: 874, top: 326, width: 170, height: 22, fontSize: 15, bold: true, color: C.ink })
  ctx.addText(slide, { text: 'CMP-2026-8KD29', left: 874, top: 366, width: 170, height: 24, fontSize: 18, bold: true, color: C.red })
  ctx.addText(slide, { text: `High priority
SLA due: 24h
Customer phone captured
Transcript attached`, left: 874, top: 404, width: 190, height: 80, fontSize: 14, color: C.ink })
  ;[
    ['Views', 'Role scoped', 'Admin sees all outlets; managers see one shop', C.blue],
    ['Search', 'AI-ready', 'Vector hooks exist for review search', C.violet],
    ['Follow-up', 'Ticketing', 'pending, contacted, resolved', C.emerald],
  ].forEach(([label, value, note, color], i) => {
    const x = 96 + i * 270
    ctx.addText(slide, { text: label.toUpperCase(), left: x, top: 552, width: 180, height: 18, fontSize: 10, bold: true, color: '#6B7F90' })
    ctx.addText(slide, { text: value, left: x, top: 574, width: 190, height: 28, fontSize: 22, bold: true, color })
    ctx.addText(slide, { text: note, left: x, top: 606, width: 210, height: 26, fontSize: 11, color: '#334155' })
  })
  footer(slide, ctx, 6)
  return slide
}
