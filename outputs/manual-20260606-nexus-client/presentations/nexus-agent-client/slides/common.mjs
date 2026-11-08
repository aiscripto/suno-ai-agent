export const C = {
  ink: '#07111F',
  ink2: '#0D1B2A',
  panel: '#102235',
  panel2: '#142C42',
  line: '#28465F',
  soft: '#D9E7F2',
  muted: '#8EA5B8',
  white: '#FFFFFF',
  cyan: '#00D9F5',
  teal: '#00B7A8',
  emerald: '#23C483',
  amber: '#FFB020',
  red: '#FF4D6D',
  violet: '#8B7CF6',
  blue: '#4EA1FF',
}

export function bg(slide, ctx, color = C.ink) {
  ctx.addShape(slide, { left: 0, top: 0, width: ctx.W, height: ctx.H, fill: color })
}

export function title(slide, ctx, eyebrow, headline, sub = '') {
  if (eyebrow) ctx.addText(slide, { text: eyebrow.toUpperCase(), left: 58, top: 40, width: 420, height: 24, fontSize: 14, bold: true, color: C.cyan, typeface: ctx.fonts.body })
  ctx.addText(slide, { text: headline, left: 56, top: 72, width: 860, height: 96, fontSize: 38, bold: true, color: C.white, typeface: ctx.fonts.title })
  ctx.addShape(slide, { left: 58, top: 178, width: 92, height: 4, fill: C.teal })
  if (sub) ctx.addText(slide, { text: sub, left: 58, top: 198, width: 900, height: 54, fontSize: 18, color: C.soft, typeface: ctx.fonts.body })
}

export function footer(slide, ctx, n) {
  ctx.addText(slide, { text: 'Nexus Agent for Outlets', left: 58, top: 686, width: 240, height: 20, fontSize: 11, color: C.muted })
  ctx.addText(slide, { text: String(n).padStart(2, '0'), left: 1180, top: 684, width: 40, height: 20, fontSize: 11, bold: true, color: C.cyan, align: 'right' })
}

export function panel(slide, ctx, x, y, w, h, fill = C.panel, line = C.line) {
  return ctx.addShape(slide, { left: x, top: y, width: w, height: h, fill, line: { fill: line, width: 1 } })
}

export function pill(slide, ctx, text, x, y, w, color = C.cyan, txt = C.ink) {
  ctx.addShape(slide, { left: x, top: y, width: w, height: 34, fill: color, line: { fill: color, width: 0 } })
  ctx.addText(slide, { text, left: x + 10, top: y + 7, width: w - 20, height: 20, fontSize: 13, bold: true, color: txt, align: 'center' })
}

export function metric(slide, ctx, label, value, note, x, y, color = C.cyan) {
  ctx.addText(slide, { text: label.toUpperCase(), left: x, top: y, width: 190, height: 20, fontSize: 11, bold: true, color: C.muted })
  ctx.addText(slide, { text: value, left: x, top: y + 22, width: 220, height: 42, fontSize: 30, bold: true, color })
  ctx.addText(slide, { text: note, left: x, top: y + 68, width: 220, height: 38, fontSize: 12, color: C.soft })
}

export function bullet(slide, ctx, text, x, y, color = C.cyan) {
  ctx.addShape(slide, { geometry: 'ellipse', left: x, top: y + 7, width: 9, height: 9, fill: color, line: { fill: color, width: 0 } })
  ctx.addText(slide, { text, left: x + 20, top: y, width: 500, height: 30, fontSize: 15, color: C.soft })
}

export function line(slide, ctx, x1, y1, x2, y2, color = C.line, width = 2) {
  const left = Math.min(x1, x2)
  const top = Math.min(y1, y2)
  ctx.addShape(slide, { geometry: 'line', left, top, width: Math.abs(x2 - x1) || 1, height: Math.abs(y2 - y1) || 1, line: { fill: color, width } })
}
