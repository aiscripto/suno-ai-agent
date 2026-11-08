import { C, bg, title, footer, panel } from './common.mjs'

export async function slide10(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Rollout path', 'Start with a controlled pilot, then scale outlet by outlet', 'The architecture supports branch-level shop codes and role-scoped dashboards, so the client can launch without changing the whole operating model on day one.')
  const phases = [
    ['Week 1', 'Configure', 'Tenant, brand tone, languages, greeting, knowledge base, branch codes'],
    ['Week 2', 'Pilot', 'Place iframe/kiosk at 1-3 outlets and validate calls, summaries, alerts'],
    ['Week 3', 'Train managers', 'Dashboard usage, ticket status updates, response ownership'],
    ['Week 4+', 'Scale', 'Roll out more branches and compare issue patterns by outlet'],
  ]
  phases.forEach(([time, h, b], i) => {
    const x = 94 + i * 292
    ctx.addShape(slide, { geometry: 'ellipse', left: x, top: 310, width: 60, height: 60, fill: [C.cyan, C.emerald, C.amber, C.violet][i], line: { fill: [C.cyan, C.emerald, C.amber, C.violet][i], width: 0 } })
    ctx.addText(slide, { text: String(i + 1), left: x, top: 325, width: 60, height: 26, fontSize: 22, bold: true, color: C.ink, align: 'center' })
    if (i < 3) ctx.addShape(slide, { geometry: 'line', left: x + 68, top: 340, width: 218, height: 0, line: { fill: C.line, width: 3 } })
    ctx.addText(slide, { text: time, left: x - 28, top: 404, width: 116, height: 22, fontSize: 13, bold: true, color: C.cyan, align: 'center' })
    panel(slide, ctx, x - 58, 434, 176, 130)
    ctx.addText(slide, { text: h, left: x - 36, top: 456, width: 132, height: 26, fontSize: 20, bold: true, color: C.white, align: 'center' })
    ctx.addText(slide, { text: b, left: x - 38, top: 492, width: 136, height: 56, fontSize: 11.5, color: C.soft, align: 'center' })
  })
  ctx.addText(slide, { text: 'Pilot success criteria: clean voice flow, accurate branch capture, manager-visible tickets, and actionable issue categories.', left: 120, top: 624, width: 1000, height: 32, fontSize: 20, bold: true, color: C.white, align: 'center' })
  footer(slide, ctx, 10)
  return slide
}
