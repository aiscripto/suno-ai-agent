import { C, bg, title, footer, panel } from './common.mjs'

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add()
  bg(slide, ctx)
  title(slide, ctx, 'Deployment model', 'Fast to place in outlets, controlled by tenant and branch', 'The embed guide supports iframe deployment, allowed parent domains, token authentication, shop codes, microphone permissions, and optional floating or inline mode.')
  const left = [
    ['Customer website / kiosk', 'iframe /voice?tenant=&token=&shop='],
    ['Embed auth', 'tenant token, API key, or allowed domain'],
    ['Voice agent UI', 'themeable NexusAgent component'],
    ['API pipeline', 'config, transcribe, chat, speak, summarize'],
  ]
  left.forEach(([h, b], i) => {
    const y = 284 + i * 84
    panel(slide, ctx, 78, y, 388, 58)
    ctx.addText(slide, { text: h, left: 104, top: y + 10, width: 250, height: 20, fontSize: 16, bold: true, color: C.white })
    ctx.addText(slide, { text: b, left: 104, top: y + 34, width: 330, height: 18, fontSize: 12, color: C.muted })
    if (i < 3) ctx.addShape(slide, { geometry: 'line', left: 272, top: y + 58, width: 0, height: 26, line: { fill: C.cyan, width: 2 } })
  })
  panel(slide, ctx, 612, 282, 430, 320, '#0A2432', C.cyan)
  ctx.addText(slide, { text: 'Access control built in', left: 642, top: 316, width: 300, height: 28, fontSize: 24, bold: true, color: C.white })
  ;[
    ['Agent login', 'shop agents use /agent-login and are scoped to /voice'],
    ['Manager login', 'managers see only their assigned shop dashboard'],
    ['Admin login', 'admins can view all outlets'],
    ['Frame policy', 'ALLOWED_FRAME_ANCESTORS protects iframe hosting'],
  ].forEach(([h, b], i) => {
    ctx.addShape(slide, { geometry: 'ellipse', left: 650, top: 370 + i * 48, width: 12, height: 12, fill: C.cyan, line: { fill: C.cyan, width: 0 } })
    ctx.addText(slide, { text: h, left: 674, top: 362 + i * 48, width: 150, height: 20, fontSize: 14, bold: true, color: C.white })
    ctx.addText(slide, { text: b, left: 824, top: 362 + i * 48, width: 250, height: 32, fontSize: 12, color: C.soft })
  })
  footer(slide, ctx, 8)
  return slide
}
