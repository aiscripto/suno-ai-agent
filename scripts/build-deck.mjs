import PptxGenJS from '/Users/tk-lpt-1088/.nvm/versions/node/v22.16.0/lib/node_modules/pptxgenjs/dist/pptxgen.cjs.js'

const pptx = new PptxGenJS()
pptx.layout = 'LAYOUT_WIDE'   // 13.33 × 7.5 in

// ── Brand colours ──────────────────────────────────────────────────────────
const C = {
  navy:    '0D1B2A',
  teal:    '00B4A6',
  accent:  '00E5CC',
  white:   'FFFFFF',
  offwhite:'F0F4F8',
  grey:    '94A3B8',
  dark:    '1E293B',
  card:    '1A2D42',
  red:     'EF4444',
  amber:   'F59E0B',
  green:   '22C55E',
  blue:    '3B82F6',
}

const FONT = 'Calibri'

// helper: full-bleed dark background
function darkSlide(slide) {
  slide.background = { color: C.navy }
}

// helper: accent underline bar
function accentBar(slide, x = 0.6, y = 1.35, w = 1.1) {
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.06, fill: { color: C.teal }, line: { color: C.teal } })
}

// helper: card rectangle
function card(slide, x, y, w, h, color = C.card) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color },
    line: { color: C.teal, width: 1 },
    rectRadius: 0.12,
  })
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 1 — TITLE                                                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  // gradient-like accent band on left
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.teal }, line: { color: C.teal } })

  s.addText('NEXUS AGENT', {
    x: 0.55, y: 1.6, w: 12, h: 1.1,
    fontSize: 64, bold: true, color: C.white, fontFace: FONT,
    charSpacing: 4,
  })
  s.addShape(pptx.ShapeType.rect, { x: 0.55, y: 2.75, w: 4.2, h: 0.08, fill: { color: C.teal }, line: { color: C.teal } })

  s.addText('AI-Powered Voice Agent for Customer Engagement', {
    x: 0.55, y: 2.95, w: 11, h: 0.55,
    fontSize: 22, color: C.accent, fontFace: FONT, bold: false,
  })

  s.addText('Capture reviews · resolve complaints · qualify leads\nautomatically — with every customer conversation.', {
    x: 0.55, y: 3.65, w: 10, h: 0.9,
    fontSize: 16, color: C.grey, fontFace: FONT, align: 'left',
  })

  s.addText('nexusagent.ai', {
    x: 0.55, y: 6.8, w: 4, h: 0.3,
    fontSize: 11, color: C.teal, fontFace: FONT,
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 2 — THE PROBLEM                                                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  s.addText('The Problem', { x: 0.6, y: 0.55, w: 12, h: 0.65, fontSize: 36, bold: true, color: C.white, fontFace: FONT })
  accentBar(s)

  const problems = [
    { icon: '😤', title: 'Complaints go unheard', body: 'Customers leave without reporting issues.\nProblems compound silently.' },
    { icon: '⭐', title: 'Reviews are missed', body: 'Less than 5% of happy customers\nleave a review unprompted.' },
    { icon: '📋', title: 'Manual follow-up fails', body: 'Staff forget to capture contact details.\nLeads are lost forever.' },
    { icon: '📊', title: 'No actionable data', body: 'Managers have no real-time view\nof what customers are saying.' },
  ]

  problems.forEach((p, i) => {
    const x = 0.5 + (i % 2) * 6.4
    const y = 1.65 + Math.floor(i / 2) * 2.55
    card(s, x, y, 5.9, 2.25)
    s.addText(p.icon, { x: x + 0.25, y: y + 0.18, w: 0.9, h: 0.9, fontSize: 34, fontFace: FONT })
    s.addText(p.title, { x: x + 1.2, y: y + 0.2, w: 4.4, h: 0.45, fontSize: 17, bold: true, color: C.accent, fontFace: FONT })
    s.addText(p.body, { x: x + 1.2, y: y + 0.7, w: 4.4, h: 0.95, fontSize: 13, color: C.grey, fontFace: FONT })
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 3 — WHAT IS NEXUS AGENT                                           ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  s.addText('What is Nexus Agent?', { x: 0.6, y: 0.55, w: 12, h: 0.65, fontSize: 36, bold: true, color: C.white, fontFace: FONT })
  accentBar(s, 0.6, 1.35, 1.5)

  s.addText(
    'Nexus Agent is an embeddable AI voice agent that sits inside your website or kiosk. ' +
    'It holds a natural spoken conversation with your customer, then automatically classifies the outcome, ' +
    'captures lead data, and delivers everything to your dashboard — with zero manual effort.',
    { x: 0.6, y: 1.6, w: 12, h: 1.2, fontSize: 15.5, color: C.offwhite, fontFace: FONT }
  )

  const pills = [
    { label: 'Speak', color: C.teal },
    { label: '→', color: C.navy },
    { label: 'Transcribe', color: C.blue },
    { label: '→', color: C.navy },
    { label: 'Understand', color: C.teal },
    { label: '→', color: C.navy },
    { label: 'Respond', color: C.blue },
    { label: '→', color: C.navy },
    { label: 'Summarise & Save', color: C.teal },
  ]

  let px = 0.5
  pills.forEach(p => {
    const isArrow = p.label === '→'
    s.addText(p.label, {
      x: px, y: 2.95, w: isArrow ? 0.35 : 1.55, h: 0.46,
      fontSize: isArrow ? 18 : 13, bold: !isArrow, color: isArrow ? C.grey : C.navy,
      fontFace: FONT, align: 'center',
      fill: isArrow ? undefined : { color: p.color },
      shape: isArrow ? undefined : pptx.ShapeType.roundRect,
      rectRadius: isArrow ? 0 : 0.08,
    })
    px += isArrow ? 0.38 : 1.6
  })

  const features = [
    { icon: '🎙️', text: 'Spoken conversation\n(no typing needed)' },
    { icon: '🧠', text: 'GPT-4 powered\nunderstanding' },
    { icon: '🔇', text: 'Hidden token extraction\n(lead / review / end)' },
    { icon: '📧', text: 'Auto email alerts\nto your team' },
    { icon: '🏢', text: 'Multi-tenant &\nbranch-aware' },
  ]

  features.forEach((f, i) => {
    const x = 0.5 + i * 2.6
    card(s, x, 3.65, 2.35, 3.0)
    s.addText(f.icon, { x: x + 0.5, y: 3.8, w: 1.3, h: 0.9, fontSize: 30, align: 'center', fontFace: FONT })
    s.addText(f.text, { x: x + 0.1, y: 4.75, w: 2.15, h: 1.1, fontSize: 12.5, color: C.offwhite, fontFace: FONT, align: 'center' })
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 4 — USE CASE: REVIEWS                                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  // left colour strip
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.green }, line: { color: C.green } })

  s.addText('USE CASE 1', { x: 0.55, y: 0.4, w: 5, h: 0.4, fontSize: 12, color: C.green, bold: true, fontFace: FONT, charSpacing: 3 })
  s.addText('Customer Review Collection', { x: 0.55, y: 0.82, w: 9, h: 0.7, fontSize: 34, bold: true, color: C.white, fontFace: FONT })
  s.addShape(pptx.ShapeType.rect, { x: 0.55, y: 1.57, w: 2.5, h: 0.06, fill: { color: C.green }, line: { color: C.green } })

  s.addText(
    'After a meal, purchase, or service interaction, the agent starts a warm spoken conversation ' +
    'with the customer. It asks how the experience was, listens, and extracts a sentiment score, ' +
    'category, key points, and star rating — all without a single form.',
    { x: 0.55, y: 1.75, w: 7.4, h: 1.4, fontSize: 14, color: C.offwhite, fontFace: FONT }
  )

  const steps = [
    'Customer taps "Start" on kiosk or phone',
    'Agent greets and asks about their visit',
    'Customer speaks freely for up to 5 exchanges',
    'AI classifies: sentiment · category · rating',
    'Review saved to dashboard instantly',
    'Team notified by email if negative',
  ]
  steps.forEach((t, i) => {
    s.addShape(pptx.ShapeType.ellipse, { x: 0.55, y: 3.35 + i * 0.58, w: 0.36, h: 0.36, fill: { color: C.green }, line: { color: C.green } })
    s.addText(String(i + 1), { x: 0.55, y: 3.35 + i * 0.58, w: 0.36, h: 0.36, fontSize: 12, bold: true, color: C.navy, align: 'center', fontFace: FONT })
    s.addText(t, { x: 1.05, y: 3.32 + i * 0.58, w: 7, h: 0.38, fontSize: 13.5, color: C.offwhite, fontFace: FONT })
  })

  // stat card
  card(s, 8.5, 1.75, 4.3, 5.3, '0A2218')
  s.addShape(pptx.ShapeType.rect, { x: 8.5, y: 1.75, w: 4.3, h: 0.06, fill: { color: C.green }, line: { color: C.green } })
  s.addText('Why it matters', { x: 8.65, y: 1.95, w: 4.0, h: 0.4, fontSize: 14, bold: true, color: C.green, fontFace: FONT })
  const stats = [
    ['5×', 'more reviews vs paper\nfeedback forms'],
    ['< 2 min', 'average conversation\nlength'],
    ['100%', 'digitised — no manual\ndata entry'],
    ['Real-time', 'alerts for negative\nfeedback'],
  ]
  stats.forEach(([num, label], i) => {
    s.addText(num, { x: 8.65, y: 2.55 + i * 1.12, w: 4.0, h: 0.52, fontSize: 28, bold: true, color: C.accent, fontFace: FONT })
    s.addText(label, { x: 8.65, y: 3.08 + i * 1.12, w: 4.0, h: 0.5, fontSize: 12, color: C.grey, fontFace: FONT })
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 5 — USE CASE: COMPLAINTS                                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.red }, line: { color: C.red } })

  s.addText('USE CASE 2', { x: 0.55, y: 0.4, w: 5, h: 0.4, fontSize: 12, color: C.red, bold: true, fontFace: FONT, charSpacing: 3 })
  s.addText('Complaint Resolution & Escalation', { x: 0.55, y: 0.82, w: 10, h: 0.7, fontSize: 34, bold: true, color: C.white, fontFace: FONT })
  s.addShape(pptx.ShapeType.rect, { x: 0.55, y: 1.57, w: 3.0, h: 0.06, fill: { color: C.red }, line: { color: C.red } })

  s.addText(
    'When a customer is unhappy, Nexus Agent listens without defensiveness, ' +
    'acknowledges the issue, and captures all the details needed to resolve it. ' +
    'High-priority complaints are flagged immediately so your team can act before the customer leaves.',
    { x: 0.55, y: 1.75, w: 7.4, h: 1.25, fontSize: 14, color: C.offwhite, fontFace: FONT }
  )

  const flow = [
    { label: 'Customer\ncontacts', color: C.red },
    { label: 'Issue\ncaptured', color: C.amber },
    { label: 'Priority\nassigned', color: C.amber },
    { label: 'Team\nalerted', color: C.teal },
    { label: 'Ticket\ncreated', color: C.teal },
  ]
  flow.forEach((f, i) => {
    const x = 0.55 + i * 2.5
    card(s, x, 3.1, 2.1, 1.3, C.card)
    s.addText(f.label, { x, y: 3.35, w: 2.1, h: 0.85, fontSize: 13, bold: true, color: f.color, fontFace: FONT, align: 'center' })
    if (i < flow.length - 1) {
      s.addText('→', { x: x + 2.1, y: 3.52, w: 0.4, h: 0.45, fontSize: 18, color: C.grey, fontFace: FONT, align: 'center' })
    }
  })

  const benefits = [
    { icon: '🎯', title: 'Auto-categorised', body: 'Behavioral · product · facility\nservice · pricing complaints' },
    { icon: '🚨', title: 'SLA tracking', body: 'Due-date set per ticket type\nso nothing slips through' },
    { icon: '📱', title: 'Instant alerts', body: 'Email to manager the moment\na complaint is logged' },
    { icon: '📝', title: 'Full transcript', body: 'Every word saved for\nquality review' },
  ]
  benefits.forEach((b, i) => {
    const x = 0.55 + (i % 2) * 6.4
    const y = 4.7 + Math.floor(i / 2) * 1.35
    s.addText(b.icon + '  ' + b.title, { x, y, w: 6.0, h: 0.42, fontSize: 14, bold: true, color: C.red, fontFace: FONT })
    s.addText(b.body, { x, y: y + 0.42, w: 6.0, h: 0.65, fontSize: 12.5, color: C.grey, fontFace: FONT })
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 6 — USE CASE: LEAD CAPTURE                                        ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.blue }, line: { color: C.blue } })

  s.addText('USE CASE 3', { x: 0.55, y: 0.4, w: 5, h: 0.4, fontSize: 12, color: C.blue, bold: true, fontFace: FONT, charSpacing: 3 })
  s.addText('Lead Capture & Contact Qualification', { x: 0.55, y: 0.82, w: 10, h: 0.7, fontSize: 34, bold: true, color: C.white, fontFace: FONT })
  s.addShape(pptx.ShapeType.rect, { x: 0.55, y: 1.57, w: 3.5, h: 0.06, fill: { color: C.blue }, line: { color: C.blue } })

  s.addText(
    'During any conversation, the agent naturally asks for the customer\'s name, email, and phone ' +
    'number where appropriate. Contact details are extracted, deduplicated, and attached to the review — ' +
    'ready for your CRM or marketing team.',
    { x: 0.55, y: 1.75, w: 7.4, h: 1.25, fontSize: 14, color: C.offwhite, fontFace: FONT }
  )

  const cols = [
    {
      heading: 'What gets captured',
      items: ['Full name', 'Email address', 'Phone / mobile number', 'Visit date & branch', 'Sentiment & star rating'],
      color: C.blue,
    },
    {
      heading: 'How it\'s used',
      items: ['Attached to every review record', 'Exported via dashboard', 'Triggers follow-up email', 'Segmentable by sentiment', 'GDPR-ready storage'],
      color: C.teal,
    },
    {
      heading: 'Channels supported',
      items: ['Website embed (iframe)', 'Tablet / kiosk in-store', 'QR code scan-to-open', 'WhatsApp (roadmap)', 'Mobile PWA (roadmap)'],
      color: C.accent,
    },
  ]

  cols.forEach((c, i) => {
    const x = 0.55 + i * 4.25
    card(s, x, 3.15, 3.95, 3.95)
    s.addText(c.heading, { x: x + 0.2, y: 3.3, w: 3.6, h: 0.45, fontSize: 14, bold: true, color: c.color, fontFace: FONT })
    s.addShape(pptx.ShapeType.rect, { x: x + 0.2, y: 3.76, w: 3.4, h: 0.04, fill: { color: c.color }, line: { color: c.color } })
    c.items.forEach((item, j) => {
      s.addText('• ' + item, { x: x + 0.2, y: 3.9 + j * 0.55, w: 3.6, h: 0.45, fontSize: 13, color: C.offwhite, fontFace: FONT })
    })
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 7 — DASHBOARD & ANALYTICS                                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  s.addText('Real-Time Dashboard', { x: 0.6, y: 0.55, w: 12, h: 0.65, fontSize: 36, bold: true, color: C.white, fontFace: FONT })
  accentBar(s, 0.6, 1.35, 1.6)

  s.addText('Every conversation produces actionable intelligence — visible the moment the call ends.',
    { x: 0.6, y: 1.55, w: 11.5, h: 0.5, fontSize: 15, color: C.grey, fontFace: FONT })

  const widgets = [
    { icon: '📈', title: 'Trend Chart', body: 'Monthly review volume\nover time per branch' },
    { icon: '⭐', title: 'Rating Spread', body: '1–5 star distribution\nacross all locations' },
    { icon: '🔥', title: 'Top Issues', body: 'Most reported complaint\ncategories ranked' },
    { icon: '💡', title: 'Suggestions', body: 'Customer ideas surfaced\nautomatically' },
    { icon: '👤', title: 'Lead Records', body: 'Name · email · phone\nlinked to each review' },
    { icon: '🎫', title: 'Ticket Queue', body: 'Pending · in-progress ·\nresolved statuses' },
  ]

  widgets.forEach((w, i) => {
    const x = 0.55 + (i % 3) * 4.25
    const y = 2.2 + Math.floor(i / 3) * 2.4
    card(s, x, y, 3.95, 2.1)
    s.addText(w.icon, { x: x + 0.2, y: y + 0.2, w: 0.8, h: 0.8, fontSize: 28, fontFace: FONT })
    s.addText(w.title, { x: x + 1.1, y: y + 0.22, w: 2.7, h: 0.42, fontSize: 15, bold: true, color: C.accent, fontFace: FONT })
    s.addText(w.body, { x: x + 1.1, y: y + 0.65, w: 2.7, h: 0.75, fontSize: 12.5, color: C.grey, fontFace: FONT })
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 8 — HOW IT INTEGRATES                                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  s.addText('Easy Integration', { x: 0.6, y: 0.55, w: 12, h: 0.65, fontSize: 36, bold: true, color: C.white, fontFace: FONT })
  accentBar(s, 0.6, 1.35, 1.2)

  s.addText('One snippet. Any website. No backend changes required.',
    { x: 0.6, y: 1.55, w: 11.5, h: 0.5, fontSize: 15, color: C.grey, fontFace: FONT })

  // Code block
  card(s, 0.55, 2.1, 7.0, 1.55, '0A1628')
  s.addText(
    '<iframe\n  src="https://nexusagent.ai/voice?tenant=YOUR_ID&token=YOUR_TOKEN"\n  allow="microphone"\n  style="border:none;width:100%;height:600px"\n/>',
    { x: 0.75, y: 2.22, w: 6.65, h: 1.3, fontSize: 11.5, color: C.accent, fontFace: 'Courier New' }
  )

  const steps = [
    { n: '1', title: 'Get your tenant ID', body: 'We configure a tenant for your brand, language, and agent personality.' },
    { n: '2', title: 'Drop in the iframe', body: 'Add one line of HTML to your website, kiosk, or portal.' },
    { n: '3', title: 'Go live', body: 'The agent is immediately live — no app download, no installation.' },
  ]
  steps.forEach((st, i) => {
    const y = 3.85 + i * 1.15
    s.addShape(pptx.ShapeType.ellipse, { x: 0.55, y, w: 0.55, h: 0.55, fill: { color: C.teal }, line: { color: C.teal } })
    s.addText(st.n, { x: 0.55, y, w: 0.55, h: 0.55, fontSize: 16, bold: true, color: C.navy, align: 'center', fontFace: FONT })
    s.addText(st.title, { x: 1.25, y: y - 0.02, w: 6.1, h: 0.38, fontSize: 14, bold: true, color: C.white, fontFace: FONT })
    s.addText(st.body, { x: 1.25, y: y + 0.35, w: 6.1, h: 0.38, fontSize: 12.5, color: C.grey, fontFace: FONT })
  })

  // right side — access methods
  card(s, 7.85, 2.1, 4.95, 5.3)
  s.addText('Who accesses what', { x: 8.05, y: 2.28, w: 4.55, h: 0.42, fontSize: 14, bold: true, color: C.teal, fontFace: FONT })

  const roles = [
    { role: 'Customer', icon: '🧑', desc: 'Speaks with agent via\niframe or kiosk' },
    { role: 'Shop Agent', icon: '🧑‍💼', desc: 'Logs in to start a\nvoice session for a customer' },
    { role: 'Manager', icon: '👔', desc: 'Views their branch\ndashboard & tickets' },
    { role: 'Admin', icon: '🔑', desc: 'Full access — all branches,\nall data, all reports' },
  ]
  roles.forEach((r, i) => {
    const ry = 2.9 + i * 1.1
    s.addText(r.icon, { x: 8.05, y: ry, w: 0.7, h: 0.7, fontSize: 22, fontFace: FONT })
    s.addText(r.role, { x: 8.8, y: ry, w: 3.8, h: 0.38, fontSize: 13, bold: true, color: C.accent, fontFace: FONT })
    s.addText(r.desc, { x: 8.8, y: ry + 0.38, w: 3.8, h: 0.5, fontSize: 11.5, color: C.grey, fontFace: FONT })
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 9 — INDUSTRIES / WHO IS IT FOR                                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  s.addText('Who Is It For?', { x: 0.6, y: 0.55, w: 12, h: 0.65, fontSize: 36, bold: true, color: C.white, fontFace: FONT })
  accentBar(s, 0.6, 1.35, 1.1)

  const sectors = [
    { icon: '🍽️', name: 'Restaurants & Cafés',    points: ['Post-meal review capture', 'Complaint escalation', 'Staff behaviour feedback'] },
    { icon: '🛍️', name: 'Retail Chains',           points: ['In-store experience rating', 'Product feedback', 'Lead capture for loyalty'] },
    { icon: '🏥', name: 'Healthcare Clinics',       points: ['Patient satisfaction survey', 'Appointment follow-up', 'Service quality tracking'] },
    { icon: '🏨', name: 'Hotels & Hospitality',    points: ['Check-out feedback', 'Facility complaints', 'Return visit incentives'] },
    { icon: '🏦', name: 'Banking & Finance',        points: ['Branch service feedback', 'Complaint triage', 'Advisor quality review'] },
    { icon: '🎓', name: 'Education',                points: ['Parent / student feedback', 'Facility issues', 'Teacher ratings'] },
  ]

  sectors.forEach((sec, i) => {
    const x = 0.5 + (i % 3) * 4.25
    const y = 1.65 + Math.floor(i / 3) * 2.8
    card(s, x, y, 3.95, 2.55)
    s.addText(sec.icon + '  ' + sec.name, { x: x + 0.2, y: y + 0.18, w: 3.6, h: 0.48, fontSize: 14, bold: true, color: C.accent, fontFace: FONT })
    s.addShape(pptx.ShapeType.rect, { x: x + 0.2, y: y + 0.7, w: 3.5, h: 0.04, fill: { color: '1A3D4A' }, line: { color: '1A3D4A' } })
    sec.points.forEach((p, j) => {
      s.addText('• ' + p, { x: x + 0.2, y: y + 0.9 + j * 0.52, w: 3.6, h: 0.42, fontSize: 12, color: C.offwhite, fontFace: FONT })
    })
  })
})()

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SLIDE 10 — CALL TO ACTION                                               ║
// ╚══════════════════════════════════════════════════════════════════════════╝
;(() => {
  const s = pptx.addSlide()
  darkSlide(s)

  // full-width teal bar at top
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.5, fill: { color: C.teal }, line: { color: C.teal } })

  s.addText('Start Listening to Every Customer', {
    x: 0.6, y: 1.0, w: 12, h: 1.1,
    fontSize: 40, bold: true, color: C.white, fontFace: FONT,
  })
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 2.15, w: 5.0, h: 0.08, fill: { color: C.teal }, line: { color: C.teal } })

  s.addText(
    'Nexus Agent converts every customer touchpoint into structured intelligence.\n' +
    'Deploy in hours. No hardware. No forms. No missed feedback.',
    { x: 0.6, y: 2.35, w: 11.5, h: 0.9, fontSize: 16, color: C.grey, fontFace: FONT }
  )

  const nextSteps = [
    { icon: '📞', text: 'Book a 30-minute live demo' },
    { icon: '🆓', text: 'Free pilot — 1 branch, 30 days' },
    { icon: '⚙️',  text: 'Custom tenant configured for your brand' },
  ]
  nextSteps.forEach((ns, i) => {
    card(s, 0.6 + i * 4.2, 3.55, 3.85, 1.5)
    s.addText(ns.icon, { x: 0.85 + i * 4.2, y: 3.7, w: 0.9, h: 0.8, fontSize: 28, fontFace: FONT })
    s.addText(ns.text, { x: 1.75 + i * 4.2, y: 3.78, w: 2.65, h: 0.9, fontSize: 13, bold: true, color: C.white, fontFace: FONT })
  })

  s.addText('tariq.sulehri@gmail.com', {
    x: 0.6, y: 5.45, w: 6, h: 0.5,
    fontSize: 16, color: C.teal, fontFace: FONT,
  })
  s.addText('nexusagent.ai', {
    x: 0.6, y: 5.95, w: 6, h: 0.4,
    fontSize: 14, color: C.grey, fontFace: FONT,
  })

  s.addText('NEXUS AGENT', {
    x: 8.5, y: 5.3, w: 4.5, h: 1.5,
    fontSize: 52, bold: true, color: '0D3D38', fontFace: FONT,
    charSpacing: 4,
  })
})()

// ── Write file ──────────────────────────────────────────────────────────────
const OUT = 'NexusAgent-Presentation.pptx'
await pptx.writeFile({ fileName: OUT })
console.log(`✅  Saved → ${OUT}`)
