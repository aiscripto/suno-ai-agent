# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience (current):

- **Shop customers in-store.** A shop agent logs in at `/agent-login` on a counter device at the branch; walk-in customers then speak to the agent to give feedback, raise a complaint, or ask for support. The device is shared, used standing, often in a noisy shop, and each conversation is short (120 s session cap, 60 s per turn).

Planned audience (not live):

- **Website visitors via iframe.** Deliberately off for now: `/voice` requires an agent login (decision 2026-11-09). When iframe embedding is brought back (`/voice?tenant=…&token=…&shop=…`), the agent interface must first be reviewed and resized for iframe sizes and visitors' own phones and laptops. Until then, design for the in-store counter device.

Secondary audiences:

- **Shop managers** read their own branch's reviews, complaints and leads in `/dashboard` and update ticket status.
- **Admins** see all shops, compare branches and regions in the Reports tab.

## Product Purpose

NexusAgent lets a retail business collect customer feedback, complaints and support requests by natural voice conversation instead of forms, in the customer's own language, and turns each conversation into structured, actionable records (sentiment, category, rating, ticket with SLA, captured contact details) that managers act on.

Success: a customer finishes a short spoken conversation without typing; the shop gets a classified, routed record and, where configured, an email; managers see trends per branch and region.

## Positioning

A voice-first agent that already knows which branch it is standing in, so it never asks; that speaks the customer's language (auto-detected English, Urdu, Hindi) and extracts structured review, complaint and lead data silently during the conversation, then feeds a branch-scoped management dashboard. One deployment serves many tenants, each with its own persona, voice, greeting and knowledge.

## Operating Context

- Three agent types per tenant: `support`, `complaints`, `reviews`.
- Access paths in use: shop-agent login on an in-store device; manager/admin dashboard. The iframe embed path exists in code but is deliberately disabled for now.
- Conversation cycle: connect → idle → listening → transcribing → thinking → speaking → ended / error, with visible countdowns for the session and turn caps.
- Tenants and their personas are configured in `src/data/tenants.json`; branch context comes from the session or `shop` parameter.
- Pakistani retail context (branch codes, cities, regions in `src/data/pakistan-locations.ts`).

## Capabilities and Constraints

- Voice in via recording + Whisper; replies streamed by sentence and spoken by OpenAI TTS or ElevenLabs; text input exists as a fallback.
- At most 5 exchanges per conversation; 120 s session cap; 60 s per recording turn.
- Per-tenant theming of the embedded widget through CSS variables (`--va-primary*`, `--nx-accent*`); the parent page's theme can drive the accent.
- Dashboard: overview, reviews, complaints with ticket status and SLA, leads, and a multi-filter Reports tab (period trends, issue heat map, regional roll-up, shop comparison).
- Stack: Next.js 15 App Router, React 19, Tailwind 3, Recharts; MongoDB via Mongoose.
- **Interface language:** the voice widget follows the EN/اردو toggle. Choosing Urdu switches the widget's on-screen text to Urdu (right-to-left, Nastaliq) and sends Urdu as a language hint to transcription and the agent, when the tenant supports it. Without an explicit choice the tenant's default language and auto-detection apply. The dashboard and logins stay English.
- **Accessibility standard: undecided.** No formal target recorded yet.
- **Customer-facing terms (widget):** *conversation* (never "call" or "session"), *microphone*, *tap*, *your reference* (a server ticket ID; never invent one), the agent's own name (e.g. "Zara is speaking"). In-store failures point to *a member of staff*. Manager-facing terms (dashboard): *review*, *complaint*, *suggestion* (not "idea"), *ticket*, *follow-up*.

## Brand Commitments

- Product name: **NexusAgent**. It has its own identity, distinct from tenants and from Tkxel.
- Tkxel brand guidelines and logos in `audit/nexus-agent-branding/` are reference only, not binding.
- Tenants brand the agent persona (agent name, company name, greeting, voice) and the widget accent; the NexusAgent product identity sits around that.

## Evidence on Hand

- Product capability write-up: `NEXUS_AGENT_CAPABILITIES.md` (parts describe the earlier SQLite/Prisma data layer and are out of date).
- Exhibition sales pitch: `SALES_PITCH_NEXUS_AGENT.md`; deck `NexusAgent-Presentation.pptx`.
- Embed guide: `EMBED_INTEGRATION.md`.
- No customer testimonials, usage metrics, pricing or case studies are on hand. Do not invent them.

## Product Principles

1. **Talk, don't type.** Every surface the customer sees serves a spoken conversation; text is the fallback, never the default.
2. **Context is already known.** Never ask the customer what the system can know (branch, shop, tenant).
3. **Every conversation becomes a record someone acts on.** Capture is invisible to the customer and complete for the manager.
4. **Branch-true numbers.** Managers see only their branch; figures are real, never padded or invented.
5. **One product, many tenants.** Tenant persona and accent change; structure, behaviour and quality do not.
