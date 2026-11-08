import { C, bg, title, footer, panel } from './common.mjs'

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Outlet use cases', 'One agent platform, four practical outlet plays', 'The same architecture can be configured per tenant as a review agent, complaint agent, or support/lead agent.')
  const cols = ['Where it sits', 'Conversation style', 'Captured output', 'Outlet value']
  cols.forEach((c, i) => ctx.addText(slide, { text: c, left: 86 + i * 285, top: 262, width: 240, height: 22, fontSize: 13, bold: true, color: C.cyan, align: 'center' }))
  const rows = [
    ['Review kiosk', 'Warm feedback prompt', 'sentiment + rating', 'More structured post-visit learning'],
    ['Complaint desk', 'Empathetic issue capture', 'ticket + SLA', 'Faster recovery before public escalation'],
    ['Website embed', 'Service/support Q&A', 'lead + purpose', 'Qualifies prospects without staff handoff'],
    ['Manager station', 'Branch-scoped login', 'shop trends', 'Compares performance across outlets'],
  ]
  rows.forEach((r, row) => {
    const y = 306 + row * 86
    const color = [C.emerald, C.red, C.blue, C.violet][row]
    ctx.addShape(slide, { left: 58, top: y, width: 10, height: 58, fill: color })
    r.forEach((txt, col) => {
      panel(slide, ctx, 82 + col * 285, y, 244, 58, row % 2 ? C.ink2 : C.panel)
      ctx.addText(slide, { text: txt, left: 96 + col * 285, top: y + 15, width: 214, height: 22, fontSize: 15, bold: col === 0, color: col === 3 ? C.white : C.soft, align: 'center' })
    })
  })
  ctx.addText(slide, { text: 'Configurable per brand, per outlet, and per use case through tenant settings: voice, tone, languages, knowledge base, domains, API keys, and notifications.', left: 100, top: 642, width: 1000, height: 34, fontSize: 18, color: C.white, align: 'center' })
  footer(slide, ctx, 7)
  return slide
}
