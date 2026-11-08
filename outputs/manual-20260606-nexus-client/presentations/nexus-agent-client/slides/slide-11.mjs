import { C, bg, footer, panel, pill } from './common.mjs'

export async function slide11(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  ctx.addText(slide, { text: 'Recommended next step', left: 70, top: 70, width: 760, height: 58, fontSize: 46, bold: true, color: C.white, typeface: ctx.fonts.title })
  ctx.addText(slide, { text: 'Launch a 30-day pilot across selected outlets and let the agent capture what customers are already saying.', left: 72, top: 146, width: 850, height: 74, fontSize: 25, color: C.cyan })
  panel(slide, ctx, 92, 296, 324, 230, '#0A2432', C.cyan)
  panel(slide, ctx, 468, 296, 324, 230, '#16261C', C.emerald)
  panel(slide, ctx, 844, 296, 324, 230, '#2B1E12', C.amber)
  ctx.addText(slide, { text: 'Pilot package', left: 126, top: 330, width: 260, height: 28, fontSize: 24, bold: true, color: C.white, align: 'center' })
  ctx.addText(slide, { text: `1-3 outlets
Review + complaint flows
Manager dashboard
Email escalation`, left: 126, top: 386, width: 260, height: 92, fontSize: 18, color: C.soft, align: 'center' })
  ctx.addText(slide, { text: 'What client gets', left: 502, top: 330, width: 260, height: 28, fontSize: 24, bold: true, color: C.white, align: 'center' })
  ctx.addText(slide, { text: `Structured customer voice
Branch-level visibility
Follow-up queue
Implementation learning`, left: 502, top: 386, width: 260, height: 92, fontSize: 18, color: C.soft, align: 'center' })
  ctx.addText(slide, { text: 'Decision needed', left: 878, top: 330, width: 260, height: 28, fontSize: 24, bold: true, color: C.white, align: 'center' })
  ctx.addText(slide, { text: `Pilot outlets
Brand tone
Manager recipients
Success criteria`, left: 878, top: 386, width: 260, height: 92, fontSize: 18, color: C.soft, align: 'center' })
  pill(slide, ctx, 'Ready for outlet pilot', 466, 588, 260, C.cyan)
  footer(slide, ctx, 11)
  return slide
}
