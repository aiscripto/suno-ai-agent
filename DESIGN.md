---
name: NexusAgent
description: A voice agent that listens for every branch — one console identity, an expressive widget and a calm operations dashboard.
colors:
  signal-cyan: "#00E5FF"
  signal-violet: "#7B6FFF"
  deep-space: "#050816"
  night-navy: "#080E24"
  console-navy: "#101934"
  starlight-text: "#F0F6FF"
  daylight-accent: "#1D55D9"
  daylight-teal: "#0D6F68"
  daylight-ground: "#F2F6FB"
  daylight-ink: "#0F1E38"
  emerald-accent: "#0FD090"
  ember-accent: "#FF7A1A"
  tenant-primary: "#2563EB"
  tenant-primary-deep: "#1D4ED8"
  tenant-primary-wash: "#EFF6FF"
  slate-ground: "#F8FAFC"
  slate-card: "#FFFFFF"
  slate-raised: "#F1F5F9"
  slate-line: "#E2E8F0"
  slate-ink: "#0F172A"
  slate-sub: "#475569"
  slate-muted: "#64748B"
  service-teal: "#0D9488"
  alert-red: "#DC2626"
  ok-green: "#16A34A"
  warn-amber: "#D97706"
typography:
  display:
    fontFamily: "\"SF Pro Display\", Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 800
    letterSpacing: "0.04em"
  title:
    fontFamily: "Inter, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "0.97rem"
    fontWeight: 700
  body:
    fontFamily: "Inter, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Inter, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 700
    letterSpacing: "0.06em"
  mono:
    fontFamily: "\"SF Mono\", \"Roboto Mono\", ui-monospace, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.72rem"
    fontWeight: 600
  dashboard-body:
    fontFamily: "\"Segoe UI\", -apple-system, BlinkMacSystemFont, Inter, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  control: "0.6rem"
  card: "1rem"
  panel: "22px"
  pill: "999px"
  orb: "50%"
  dash-sm: "0.5rem"
  dash-md: "0.75rem"
  dash-lg: "1rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
components:
  mic-button-idle:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.starlight-text}"
    rounded: "{rounded.orb}"
    size: "128px"
  mic-button-busy:
    backgroundColor: "{colors.console-navy}"
    textColor: "{colors.starlight-text}"
    rounded: "{rounded.orb}"
    size: "128px"
  agent-bubble:
    backgroundColor: "{colors.night-navy}"
    textColor: "{colors.starlight-text}"
    rounded: "{rounded.card}"
    typography: "{typography.body}"
  dash-card:
    backgroundColor: "{colors.slate-card}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.dash-md}"
    padding: "1rem"
  dash-button-primary:
    backgroundColor: "{colors.tenant-primary}"
    textColor: "{colors.slate-card}"
    rounded: "{rounded.dash-sm}"
    padding: "0.5rem 1rem"
  dash-button-primary-hover:
    backgroundColor: "{colors.tenant-primary-deep}"
  dash-pill:
    backgroundColor: "{colors.tenant-primary-wash}"
    textColor: "{colors.tenant-primary}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.5rem"
    typography: "{typography.dashboard-body}"
---

# Design System: NexusAgent

## Overview

**Creative North Star: "The Listening Console"**

NexusAgent is an instrument that is clearly, visibly listening. One luminous control sits at the centre of a quiet, dark console; everything around it exists to show what the agent heard, what it is doing, and how much time is left. The customer should feel attended to, not processed: the console is calm until it is spoken to, then it breathes, rings and answers.

The system has **one identity and two modes**. The **widget** (`/voice`, iframe embed, fullscreen) is the expressive mode: deep-space grounds, glass surfaces, the signal glow, wave rings and countdown arcs. It is an experience surface used standing at a shop counter or on a visitor's phone, so it favours one big target, large state cues and very little text. The **dashboard** and **logins** are the operating mode: bright slate surfaces, compact type, tables and charts, the same accent logic, no spectacle. Managers scan, filter and act; brand lives in the details (accent, pill shapes, type stack), not in effects.

Tenants change the accent, the agent's name and voice; they never change structure, states or the console's behaviour.

**Key Characteristics:**
- A single glowing focal control (the round mic) per screen in the widget, always the largest object.
- Dark, layered navy grounds with translucent glass panels; four themes (nexus, daylight, emerald, ember) swap only tokens.
- Every conversation phase (connecting, idle, listening, transcribing, thinking, speaking, ended, error) has a distinct state, announced in one status line.
- Time is visible: the 60 s turn countdown is drawn as an arc around the control (the 120 s session cap is not yet shown).
- Dashboard: dense, light, legible; 12 px body text, pill filters, rounded cards.

## Colors

A night-sky console lit by one signal colour, with a sober slate palette for operations.

### Primary
- **Signal Cyan** (#00E5FF): the listening signal. Mic orb ring and glow, live dot, active borders (`--nx-accent`). The one colour that says "the agent is here".
- **Tenant Primary** (#2563EB, `--va-primary`): the tenant-controlled accent for the classic widget and the dashboard's primary actions. Overridable via `?primaryColor=` or `postMessage`.

### Secondary
- **Signal Violet** (#7B6FFF, `--nx-accent-2`): the second stop of the signal gradient (company name, orb gradient). Never used alone for meaning.
- **Service Teal** (#0D9488): secondary emphasis in the dashboard (shop badge, positive service highlights).

### Theme accents
- **Daylight Blue** (#1D55D9) with **Daylight Teal** (#0D6F68) on **Daylight Ground** (#F2F6FB), ink **#0F1E38**: the light widget theme.
- **Emerald Signal** (#0FD090) and **Ember Signal** (#FF7A1A): alternative tenant moods; each theme redefines the full `--nx-*` set.

### Neutral
- **Deep Space** (#050816), **Night Navy** (#080E24), **Console Navy** (#101934): the widget's ground, layered from back to front.
- **Starlight** (#F0F6FF): widget text; muted and soft variants are translucent tints of the same blue-white.
- **Slate Ground** (#F8FAFC), **Card White** (#FFFFFF), **Raised Slate** (#F1F5F9), **Slate Line** (#E2E8F0): dashboard surfaces and dividers.
- **Slate Ink** (#0F172A), **Slate Sub** (#475569), **Slate Muted** (#64748B): dashboard text hierarchy.

### Status
- **Alert Red** (#DC2626), **OK Green** (#16A34A), **Warn Amber** (#D97706): complaint severity, SLA state, sentiment. Always paired with a word or icon, never colour alone.
- **Status badges** (white text on a solid fill) use the 700 shades: Pending `#c2410c`, Contacted `#2563eb`, Resolved `#15803d` (all ≥ 5:1).

### Ink and fill (dashboard)
Sentiment and category hues come in two roles. **Fill** colours (`#22c55e` positive, `#f97316` negative, `#ef4444` complaint, `#6366f1` suggestion) are for bars, dots and markers only. **Ink** tokens are for text and are defined per dashboard theme so they pass AA on that theme's surface:

| Token | Light / Day | Dark / Night |
|---|---|---|
| `--dash-ink-positive` | `#15803d` | `#86efac` |
| `--dash-ink-negative` | `#c2410c` | `#fdba74` |
| `--dash-ink-complaint` | `#b91c1c` | `#fca5a5` |
| `--dash-ink-suggestion` | `#4f46e5` | `#a5b4fc` |
| `--dash-ink-rating` | `#b45309` | `#fcd34d` |
| `--dash-ink-info` | `#1d4ed8` | `#93c5fd` |

**The Ink Not Fill Rule.** Never set text in a fill colour. Numbers, labels and counts that carry a sentiment use the `--dash-ink-*` token; the bright fill stays on the bar or dot beside them.

**The No Dimmed Text Rule.** Do not lower text contrast with `opacity-*`; choose the muted/subtle token instead, so the ratio is known.

Dark and night dashboard modes remap Tailwind slate classes and (generated) the pale tint classes the dashboard uses (`bg-*-50/100`, `text-*-500…900`, `border-*-100…300`). New code should prefer `--dash-*` tokens over tint classes, so it themes without the remap.

### Named Rules
**The One Signal Rule.** In the widget, the signal accent belongs to the agent: the orb, the live dot, the active turn. Decorative surfaces use translucent tints of it (≤ 0.26 alpha lines), never the full colour.

**The Quiet Classification Rule.** The customer never sees how the agent classified them. The accent stays the tenant/theme colour for the whole call (no red or amber mood shift), and no sentiment, complaint, priority, or captured name/phone appears on the customer's screen. That data belongs to the dashboard.

**The Full Theme Rule.** Each widget theme (nexus, daylight, emerald, ember) re-skins everything through the `--nx-*` role tokens: ground (`--nx-bg-0…2`), surfaces, lines, text tiers, bubbles and accent. No widget rule hard-codes a theme colour; text pairs are checked at ≥ 4.5:1 in all four themes.

**The Tenant Owns the Accent Rule.** Tenant theming flows only through `--va-primary*` and `--nx-accent*` variables. Never hard-code a tenant colour into a component.

## Typography

**UI Font:** Inter / SF Pro Text system stack (`--nx-font-ui`)
**Display Font:** SF Pro Display / Inter stack (`--nx-font-display`)
**Mono Font:** SF Mono / Roboto Mono (`--nx-font-mono`) for reference codes, ticket ids, timers
**Dashboard:** Segoe UI-first system stack (Tailwind `font-sans`)

**Character:** Neutral, system-native sans that disappears behind the voice; weight (700–800) and tracking, not size, carry hierarchy in the small widget.

### Hierarchy
- **Display** (800, 1.08rem, tracking 0.04em): agent and company names in the widget header.
- **Title** (700, 0.97rem): panel titles, shop name.
- **Body** (500, 0.86rem, 1.5): transcript bubbles and agent replies. Keep bubbles ≤ 60ch.
- **Label** (700, 0.68rem, tracking 0.06em, often uppercase): state chips, metric captions, countdown badges.
- **Mono** (600, 0.72rem): reference codes, timers.
- **Dashboard** (`text-xs` 0.75rem body, `text-sm` 0.875rem emphasis, `text-xl` 1.25rem KPI values; `font-semibold`/`font-bold` for headings).

### Named Rules
**The Weight-Not-Size Rule.** Inside the widget, create hierarchy with weight and tracking first; the widget lives in small iframes and must not grow headings to compete with the orb.

## Layout

The widget is one stage with three regions in this DOM order, which is also the reading order on phones and portrait counter tablets: **agent strip** (avatar, name, branch) → **conversation** (the customer's own words, given the most room) → **controls dock** (status line, mic, one action hint, close cue, "Type instead"). Below 900px the regions stack and the dock sits at the bottom in thumb reach, so the mic can never be covered. From 900px a grid puts the agent strip and dock in a 300–380px left column and the conversation beside them. The header (brand, EN/اردو, End Call) sits above the stage; errors appear in the flow above the header, never over it. Breakpoints in use: 900px (split), plus a short-height rule that hides the close cue on short phones. Spacing runs on a 0.25rem step (0.25 / 0.5 / 0.75 / 1 / 1.25rem).

**The One Hero Rule.** The mic is the largest interactive object on every widget screen. Nothing animated or decorative may be larger than it or sit between the status line and it.

The dashboard is a header with tabs over a responsive card grid; filters are pill rows; tables are compact (`px-3 py-2`, `text-xs`). Gaps use 0.5–1rem (`gap-2` to `gap-4`).

## Elevation & Depth

The widget uses **glow and glass**: depth comes from layered navy grounds, translucent surfaces with an 18px backdrop blur (`--nx-glass-blur`), and light emitted by the accent. The dashboard is nearly flat: white cards on slate with a single soft shadow.

### Shadow Vocabulary
- **Console lift** (`--nx-shadow: 0 20px 70px rgba(0,0,0,0.45)`): widget panels and cards.
- **Signal glow** (`0 0 0 3px rgba(0,229,255,0.70), 0 0 0 8px rgba(0,229,255,0.18), 0 8px 40px rgba(0,229,255,0.55)`): idle mic orb; intensifies on hover.
- **Card** (`0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)`): dashboard cards.
- **Header** (`0 2px 6px rgba(0,0,0,0.12)`): dashboard and classic widget headers.
- **Bubble** (`0 1px 2px rgba(0,0,0,0.08)`): message bubbles in light themes.

### Named Rules
**The Signal Glow Rule.** Glow and gradient text are deliberate NexusAgent signature, sanctioned in the widget (the mic orb, live states, the company wordmark). They are not used in the dashboard or on data, numbers or body text. The design checker exempts `dark-glow` and `gradient-text` only in `src/app/globals.css` and `src/components/voice-agent/**`.

## Motion

**Thesis: calm until it is spoken to.** The one authored motion is the mic while recording (breathe 1.4s, wave rings to 1.32×, the draining 60s arc). The ambient background (drifting blobs, orbits, scan line) runs only during a live conversation (`data-motion="live"` on `.nx-root` while listening, thinking or speaking) and is paused when idle, on end screens, and in hidden tabs, which also keeps always-on counter tablets cool. Entrances use `cubic-bezier(0.16, 1, 0.3, 1)`; no bounce or overshoot. Routine state changes 150–300ms.

**Reduced motion** (`prefers-reduced-motion: reduce`) is an alternative, not an off switch: decorative loops stop and the scan line and orbits are hidden; the avatar is still; recording shows one static ring plus colour, the stop icon, the arc and the countdown; end cards fade without moving; spinners stay but slow to 1.6s; the login error drops its shake.

**The Earned Motion Rule.** Anything that moves must show state (listening, thinking, speaking, time left) or acknowledge an action. Ambient motion pauses whenever nobody is talking.

## Shapes

Soft and round. The mic orb, avatar and live dots are perfect circles; chips, filters and badges are full pills (999px). Widget cards use 1rem, controls 0.6rem, large panels 20–24px. Dashboard cards use `rounded-xl` (0.75rem) and `rounded-2xl` (1rem); inputs and buttons `rounded-lg` (0.5rem). No sharp corners anywhere in the product.

## Components

### Mic Button (signature)
- **Shape:** a perfect circle in every state: 128px inside a 152px zone from 900px, 112px inside 132px on phones and portrait tablets. The countdown arc is drawn around it in the same zone; inner decorative layers are clipped to the circle.
- **Idle:** cyan-to-indigo gradient (`#00CCEE → #0A12B8`) with a specular highlight and the signal glow; hover scales to 1.08, press to 0.95.
- **Recording:** breathes (scale 1 → 1.06, 1.4s); three wave rings expand to 1.32× and stay inside the controls region.
- **Busy (connecting, thinking):** dark navy fill, muted ring, 0.72 opacity, `not-allowed` cursor.
- **Countdown:** only the 60s turn countdown is drawn (arc plus a "0:42 turn left" badge). The 120s session cap is **not shown** in the UI yet.

### Mic states (turn-taking)
- **Idle:** glowing gradient, "Tap to speak".
- **Recording:** breathe, rings, draining arc; the "0:42 left to speak" badge appears only in the last 15 s.
- **Agent speaking:** the mic switches to an outlined, non-glowing button ("Tap to speak now") and the agent strip takes an accent border; one tap stops the reply and starts listening.
- **Microphone unavailable:** the mic greys out ("Microphone unavailable") and the type field leads.

### Language (EN / اردو)
- The widget's text comes from `src/components/voice-agent/copy.ts` (English and Urdu). Urdu sets `lang="ur" dir="rtl"` on the widget, uses a Nastaliq stack (`Noto Nastaliq Urdu`, `Jameel Noori Nastaleeq`, `Noto Naskh Arabic`) at line-height 1.9, and mirrors the layout. Bubbles are tagged per message by script, so English text inside Urdu mode keeps the Latin face.
- Header language and End controls are at least 44px tall (counter device).

### Agent strip
- **Persona, not hero:** the robot is a 44px avatar beside the agent's name and the branch badge. It never competes with the mic.

### Status line
- **One place for status:** a single `role="status"` line under the agent says what the agent is doing (connecting, listening, thinking, speaking). The button label below the mic only says what tapping does ("Tap to speak", "Tap to send", "Tap to interrupt"). No other element repeats the phase.

### Transcript Bubbles
- **Agent:** `--nx-agent-bubble` glass, starlight text, 1rem radius.
- **User:** accent tint at 0.20 alpha. Hidden tokens never appear in either. Bubbles use `dir="auto"` so Urdu reads right-to-left.

### Cards / Panels (widget)
- **Corner:** 1rem to 22px. **Background:** `--nx-surface` glass with blur. **Border:** `--nx-line`. **Shadow:** console lift.

### Dashboard cards
- **Corner:** 0.75–1rem. **Background:** white on slate ground (dark and night modes remap slate classes). **Shadow:** card. **Padding:** 1–1.25rem.

### Buttons (dashboard)
- **Primary:** tenant primary, white text, 0.5rem radius, `px-4 py-2`; hover to the deep variant.
- **Pill filters:** primary-wash background with primary text when active; slate when idle.

### Inputs
- **Widget text fallback:** glass field, accent focus ring. **Dashboard:** white field, slate line border, primary focus ring, 0.5rem radius.

### Focus
- **Widget:** 2–3px solid `var(--nx-text)` outline with 3–6px offset on every control (mic, actions, language, End, type form).
- **Dashboard:** 2px `var(--dash-accent)` outline, 2px offset, on every button, tab, link and select; inputs keep their focus ring.
- **Logins:** 2px `var(--login-accent-focus)` outline in addition to the border colour change.

## Do's and Don'ts

### Do:
- **Do** keep one glowing focal control per widget screen: the mic orb.
- **Do** give every conversation phase a distinct visual state, stated once in the status line.
- **Do** theme through `--nx-*` and `--va-primary*` variables so all four themes and tenant colours keep working.
- **Do** keep dashboard numbers in solid colours with the slate text hierarchy.
- **Do** pair status colours with a word or icon.

### Don't:
- **Don't** style guidance text as a pill or button (the close cue is plain helper text).
- **Don't** recolour the widget or show labels, priorities or contact details based on the agent's classification (The Quiet Classification Rule).
- **Don't** use glow or gradient text in the dashboard, on numbers, or on body text (The Signal Glow Rule).
- **Don't** hard-code tenant or theme colours (for example `#00E5FF`) in components; use the variable.
- **Don't** add a second competing glowing element next to the orb.
- **Don't** grow widget headings to compete with the orb (The Weight-Not-Size Rule).
