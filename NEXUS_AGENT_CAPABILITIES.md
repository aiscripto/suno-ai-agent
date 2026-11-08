# NexusAgent: Comprehensive Capabilities Overview

## Core Voice Intelligence & Conversation

- **Full Voice Conversation Pipeline** — End-to-end voice interaction: real-time audio recording (MediaRecorder), automatic speech recognition (OpenAI Whisper), conversational AI reasoning (OpenAI/Groq), and natural speech synthesis (OpenAI TTS or ElevenLabs)
- **Multiple Agent Archetypes** — Three specialized conversation modes: Customer Support (solution-oriented), Feedback/Reviews (genuine, conversational), and Complaint Resolution (empathetic, accountable)
- **Intelligent Response Extraction** — Hidden token protocol automatically parses structured data (leads, sentiment, classifications) from LLM responses without breaking natural conversation flow
- **Conversation Flow Control** — Built-in session management with configurable turn limits (default 5-exchange cap), automatic conversation termination signals (`[END_CALL]`), and role-based prompting
- **Context Awareness** — Agent automatically knows branch location and shop context without asking repetitive qualifying questions; all context injected via per-tenant system prompts

## Multi-Tenant Architecture & Customization

- **Enterprise Multi-Tenancy** — Statically configured in `tenants.json` with zero runtime overhead; supports unlimited parallel instances with isolated configurations, credentials, and data
- **Per-Tenant Customization** — Each tenant controls: agent persona (name, tone, style), voice profile (gender, style), conversation greeting, system instructions, knowledge base, and email notification rules
- **Flexible Authentication** — Three independent auth mechanisms: secure token pairs, API keys, or domain-based implicit authentication — customers choose what fits their deployment
- **Knowledge Base Integration** — Embed custom FAQs, pricing, timelines, tech specs, or service details per tenant; LLM automatically references knowledge when relevant without memorization overhead
- **Custom Instructions & Tone** — Fine-tune agent behavior (empathy level, formality, solution vs. listening emphasis) via text instructions; voice persona (gender, style) decoupled from text instructions

## Deployment & Integration

- **Embeddable iFrame Component** — Drop a single embed code into any website; agent loads in isolation with minimal footprint and zero third-party cookie burden
- **Three Access Paths** — Anonymous iframe embedding (no login), agent role login (staff/CSR access to `/voice`), and admin dashboard (manager/admin oversight and analytics)
- **Domain-Based Security** — Whitelist allowed parent domains; agent only loads from approved origins (prevents unauthorized embedding)
- **Flexible TTS Provider** — Switch between OpenAI (cost-effective, broad voice selection) and ElevenLabs (ultra-realistic, accent/style control) per tenant
- **LLM Flexibility** — Uses OpenAI by default; falls back to Groq for cost-sensitive deployments (Groq for chat, OpenAI retained for Whisper transcription)
- **Per-Tenant API Keys** — Tenants can supply their own OpenAI credentials for billing isolation and cost control

## Authentication & Security

- **HMAC-Signed JWT Sessions** — Custom JWT-based session auth (no library overhead); cryptographically signed with `SESSION_SECRET`; cookie-based (`app_session`) for seamless browser integration
- **Role-Based Access Control** — Three roles: `agent` (voice access only), `manager` (scoped dashboard — branch data only), `admin` (global access and reporting)
- **Embed API Authentication** — Separate from session auth; validates `x-embed-tenant` + `x-embed-token` headers on every API call; optional toggle (`EMBED_AUTH_ENABLED`)
- **Tenant Resolution Priority** — Intelligent fallback chain: token-pair → API key → domain matching → secure defaults
- **Session Time Limits** — Enforced 120-second session cap and 60-second per-turn recording limit with visual countdown feedback (SVG arcs in UI)

## Analytics & Data Management

- **Automatic Lead Capture** — Extracts contact information from conversation without explicit form filling; structured as `[LEAD:{...}]` tokens parsed server-side
- **Sentiment & Category Classification** — Every review/complaint automatically classified with sentiment (positive/negative/neutral) and category tags via LLM reasoning
- **Persistent Data Store** — SQLite backend (via Prisma ORM) stores: Shop metadata, User (agent/manager) accounts, Review (conversation summaries, sentiment), Lead (contact info, source)
- **Summarization Pipeline** — On conversation end, LLM generates executive summary; data immediately persisted with timestamps for downstream reporting
- **Email Notifications** — Optional per-tenant SMTP integration; sends summaries to configured recipients and/or captured lead emails with customizable templates
- **Multi-Tenant Dashboards** — Analytics UI shows: review sentiment trends, lead funnel, conversation performance, per-agent metrics (manager/admin scoped to their shops)

## Intelligent Language & Localization

- **Auto-Language Detection** — Detects customer language mid-conversation; switches TTS voice and system context automatically (no user intervention needed)
- **Multi-Language Support** — Configured per tenant (e.g., English, Urdu, Hindi); each language assigned separate TTS voice for authentic pronunciation
- **Language-Specific Prompts** — System prompts automatically adjust grammar rules, cultural tone, and formatting per detected language
- **Seamless Code-Switching** — Handles mixed-language responses naturally (e.g., customer switches between Urdu and English mid-conversation)

## Enterprise Features

- **Vercel Production Ready** — Deployable to Vercel with single environment variable (`DATABASE_URL`); handles SQLite path resolution, builds with Next.js 15 fast builds
- **Database Migrations** — Prisma-managed schema; dev command auto-generates Prisma client; production schema pushes via `prisma db push`; seed scripts for initial shop/user data
- **Admin Dashboard** — Shop management, user role assignment, review/lead export, trend analytics, agent performance metrics
- **Middleware-Based Route Guards** — Automatic redirect to `/agent-login` unless valid session; transparent to developers
- **Zero Hot-Reload Friction** — Custom DB proxy prevents reconnect storms on Next.js hot-reload during development; `postinstall` hooks regenerate Prisma client automatically
- **Performance Optimizations** — Session key pattern for NexusAgent UI ensures clean resets without full page reload; streaming SSE responses prevent blocking UI during transcription/chat

## Voice Quality & UX

- **High-Fidelity Recording** — WebM codec via MediaRecorder; 60-second per-turn recording limit with visual countdown prevents accidental infinite streams
- **Real-Time Voice Streaming** — SSE streaming for chat responses; sentences arrive progressively and play immediately (no wait for full response)
- **Visual State Feedback** — 5-phase conversation states (connecting → idle → listening → transcribing → thinking → speaking) with color-coded UI and animated indicators
- **Accent-Adaptive Voices** — ElevenLabs integration supports per-language voice selection; OpenAI offers distinct male/female options (Onyx, Nova) for persona consistency
- **Fail-Safe Fallback** — Web Speech API fallback (if Whisper unavailable); graceful degradation when TTS providers temporarily unavailable

## Operational Insights

- **Conversation Lifecycle Visibility** — Every call tracked: start time, duration, customer language, detected sentiment, captured leads, agent assigned (if applicable)
- **Performance Trending** — Dashboards show: conversion rates (lead capture %), sentiment distribution, average conversation length, repeat customer detection
- **Compliance-Ready Logs** — Full conversation audit trail; optional anonymization of PII before archival; configurable email recipient lists for sensitive data
- **No-Code Configuration** — All tenant setup via `tenants.json`; no code changes required to add a new agent or customize existing behavior

## Real-World Use Cases

- **Support** — SaaS helpdesk, e-commerce, tech troubleshooting
- **Retail** — Feedback kiosks, complaint escalation, sentiment dashboards
- **Sales** — Lead capture (real estate, auto, insurance) with CRM sync
- **Feedback** — NPS surveys, product research, brand sentiment tracking
- **Healthcare** — Patient feedback, appointments, mental health check-ins
- **Events** — Hotel/conference feedback, satisfaction tracking
- **Education** — Student support, course feedback, alumni engagement
- **Government** — Complaints, public health surveys
- **HR** — Onboarding, feedback loops, exit interviews

---

**Deployment Models**: Embedded iframe (website), standalone agent interface (`/voice` route), or full admin dashboard. **LLM Backends**: OpenAI (default) or Groq (chat only). **Storage**: SQLite (dev) or Vercel PostgreSQL-compatible (production). **Scale**: Unlimited concurrent tenants; per-tenant data isolation; horizontal scaling via stateless API replicas.
