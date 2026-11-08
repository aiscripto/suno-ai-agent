# Audit config: NexusAgent (suno-ai-agent)

Pre-filled for the Audit Kit at `/Users/tk-lpt-1088/development/node/suno-ai-agent/audit/kit` (kit version in `kit/VERSION`).
Fields follow `kit/config.template.md`.

| Field | Value |
|---|---|
| `PRODUCT` | NexusAgent: multi-tenant, embeddable AI voice agent for retail shops (support, complaints, reviews), with an agent console and a management dashboard. Package name `voiceagent`. |
| `REPOS` | `/Users/tk-lpt-1088/development/node/suno-ai-agent` (one repo, one git) |
| `BRANCH` | `master`. Never use `main` as a base. The working tree is usually **dirty**: audit the working tree, and record both `git rev-parse --short HEAD` and the list from `git status --short` in `run.json`. |
| `MODE` | `AUDIT-ONLY` unless a prompt says otherwise |
| `DEPTH` | `standard` unless a prompt says otherwise |
| `INCLUDE` | `src/` (app, components, hooks, lib, data, cli, types, `middleware.ts`), `next.config.ts`, `vercel.json`, `deployment/` (Dockerfile, compose, shell scripts), `.dockerignore`, `.gitignore`, `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`, `tailwind.config.ts`, `public/` (embed scripts only), `prisma/schema.prisma` and `prisma/migrations/` (legacy, see context), `CLAUDE.md`, `EMBED_INTEGRATION.md`, `NEXUS_AGENT_CAPABILITIES.md` |
| `EXCLUDE` | `node_modules`, `.next`, `tsconfig.tsbuildinfo`, `next-env.d.ts`, `audit/` (kit, results, branding), `outputs/`, `scripts/build-deck.mjs`, `*.pptx`, `SALES_PITCH_NEXUS_AGENT.md` (sales copy; read only to check claims if prompt 13 asks), `.claude/`, `calude.md` (empty). **Do not open the contents of `dev.db` or `prisma/dev.db`** (see safety rule 2). |
| `DIMENSIONS` | all: security, ai-llm, architecture, data, performance, reliability, observability, testing, cicd-supply-chain, dependencies, accessibility, ux-design, cost, compliance, code-health, documentation |
| `COMPLIANCE` | None formally declared. The product handles **personal data** of shop customers: voice audio, transcripts, names, phone numbers, emails, complaints. Customers are mainly in Pakistan (PECA 2016; draft Personal Data Protection Bill). Use GDPR-style principles as the yardstick (minimisation, retention, purpose, processor disclosure), and say that no law is formally in scope. |
| `OUTPUT_DIR` | `/Users/tk-lpt-1088/development/node/suno-ai-agent/audit/results/nexus-agent` (gitignored; never commit reports) |
| `PREVIOUS_RUN` | none yet. After the first run, put its folder here. |
| `GENERATE_STACK_DRAFT` | `false` (modules exist: `nextjs`, `react`, `mongodb-mongoose`, `llm-voice-providers`, `docker-cicd`) |
| `TEAM_SIZE` | 1 (the owner) |
| `RELEASE_CADENCE` | as needed; image built on the VM and pushed to Docker Hub, or deployed to Vercel |
| `CONFIDENTIALITY` | Confidential. Reports describe weaknesses and tenant names. |
| `BUDGET` | none |
| Project module | `/Users/tk-lpt-1088/development/node/suno-ai-agent/audit/project-standards.md`. Load it at Stage 3 with the stack modules. |

## Hard safety rules for this project

1. **Production database.** `.env` / `.env.local` hold `MONGODB_URI`, which may point at a live MongoDB Atlas cluster. Never connect to it. Do not run `npm run seed`, `src/lib/db/seed*.ts`, `npx prisma *`, or any script that imports `connectDB`. Read models and queries as plain files.
2. **Local database files.** `dev.db` and `prisma/dev.db` are SQLite files that may hold real reviews, leads and transcripts. Do not open, query or print their contents. You may report that they exist, their size, and whether git tracks them.
3. **Paid and outbound services.** Never call OpenAI, Groq, ElevenLabs or SMTP. Do not run `npm run cli:voice`, `npm run cli:text`, `npm run dev` with real keys, or any route that sends email. A live run needs the owner's yes and test keys with a spend cap.
4. **Secrets.** Never print values from `.env*`, `src/data/tenants.json` (`token`, `apiKeys`, `openaiApiKey`), or `deployment/.env.nexus-agent`. Show variable names and at most the first 4 characters. If a live key is in a git-tracked file, stop and tell the owner where (that is also a finding).
5. **Commands.** Allowed without asking, read-only: `git log`, `git status`, `git ls-files`, `git diff`, `npm ls`, `npx tsc --noEmit`, `npm run lint`. Allowed only after Checkpoint A: `npm audit --json` / `osv-scanner` (network), `npm run build` (writes `.next/`). Never `npm install` / `npm update` (changes the lockfile).
6. **Audit folder layout.** `audit/kit/` is the kit, `audit/results/nexus-agent/` holds runs (gitignored), and `audit/nexus-agent-branding/` holds the company brand guidelines PDF and logos (reference for UI and report styling only; never copy them into a report unless asked). Nothing else belongs in `audit/`.

## Known and accepted (do not flag; owner to confirm at Checkpoint A)

| Item | Reason |
|---|---|
| Tenants are defined statically in `src/data/tenants.json`, loaded at module init | Design choice for a small number of tenants. Flag secrets inside it, not the static design. |
| Vector search is off (`isVectorsEnabled()` returns false) | MongoDB Atlas Search not wired. Not a defect; flag only dead code that still runs. |
| No queue or worker; summaries and emails run in the request | By design. Report the reliability or timeout consequence if real, not the absence of a queue. |
| Browser Web Speech recognition off by default; recording + Whisper is the main path | Product choice. |
| Default model `gpt-4o-mini` for chat and summary | Cost and latency choice. |

## Decisions already made (do not reopen)

- Hidden token protocol (`[LEAD:{...}]`, `[REVIEW:{...}]`, `[END_CALL]`) is the contract between the prompt and `/api/chat`. Check that it is parsed safely and cannot be forged; do not propose replacing it with tool calls as a finding (it may go in "ideas").
- The agent never asks which branch the caller is at: shop context is injected from the session or `shop` param.
- Session cap 120 s and per-turn recording cap 60 s are product rules. Check where they are enforced (client and server).
- Three roles: `agent` (only `/voice`), `manager` (dashboard scoped to own `shopId`), `admin` (all shops).
- `/voice` is agent-login only by design (2026-11-09): anonymous and token iframe embedding is deliberately off. Do not report the redirect to `/agent-login` as a defect. Iframe support is future work and needs a review and resize of the agent interface first. Do still report embed-only code paths that are dead or would be unsafe if re-enabled.

## Context the agent should know

- **Actual stack (verify in Stage 0):** Next.js 15 App Router, React 19, TypeScript, Tailwind 3, Recharts, Zod. Data: **MongoDB via Mongoose 8** (`src/lib/db/connection.ts`, `src/lib/db/models/`). AI: OpenAI SDK v4 (Whisper STT, `gpt-4o-mini` chat via SSE, OpenAI TTS, embeddings), optional Groq for chat, ElevenLabs TTS, `franc` language detection. Email: nodemailer (Gmail SMTP). Auth: home-grown HMAC-signed session token in cookie `app_session` (`src/lib/auth/session.ts`), SHA-256 password hashing (`src/lib/auth/password.ts`).
- **Documentation drift is known:** `CLAUDE.md` still describes Prisma + SQLite + `better-sqlite3` + `sqlite-vec` and Node ≥ 24, while `package.json` has `mongoose`, no Prisma, and `engines: >=20` (`.nvmrc` 24.12.0). `prisma/`, `dev.db` and `src/generated/prisma` in `.gitignore` are leftovers of the SQLite era. The migration to MongoDB is in progress in the working tree (`src/lib/db/path.ts` deleted). Report drift as documentation and code-health findings; do not trust `CLAUDE.md` over the code.
- **Entry points:** pages `/voice`, `/agent-login`, `/dashboard`, `/dashboard/login`, `/`; embed loader `src/app/agent.js/route.ts` and `src/app/voice/agent.js`; API route handlers under `src/app/api/` (agent-auth, chat, config, dashboard, dashboard/auth, dashboard/report, dashboard/search, leads/[id], reviews/[id], shops, shops/[id], speak, summarize, transcribe); CLI `src/cli/voice.ts`, `src/cli/text.ts`.
- **Three access paths:** iframe embed (`?tenant&token&shop` → `x-embed-*` headers; `EMBED_AUTH_ENABLED` defaults to false), agent login (`/agent-login` → `app_session` → `/voice`), dashboard login (admin / manager).
- **Deployment:** two targets. (a) Vercel (`vercel.json` sets `maxDuration` 60 s on chat and summarize). (b) Docker on an Ubuntu VM: `deployment/Dockerfile` (node:24-slim, non-root), `docker-compose.yml` (port 3020, `env_file: .env.nexus-agent`), `build-push.sh` pushes `tariqsulehri/nexus-agent:latest` to a personal Docker Hub namespace, `deploy.sh` pulls and restarts. **No CI pipeline and no automated tests** exist; confirm in Stage 0.
- **Embedding hosts** allowed by default `frame-ancestors` in `next.config.ts` include third-party sites and `localhost` origins.
- Five critical flows to trace in Stage 3: (1) embed boot → `/api/config`; (2) record → `/api/transcribe` → `/api/chat` SSE → `/api/speak`; (3) `[END_CALL]` → `/api/summarize` → Review + Lead write + email; (4) agent and dashboard login → session cookie → middleware; (5) dashboard read and edits (`/api/dashboard*`, `PATCH /api/leads|reviews|shops/[id]`) with manager scoping.
