# Project module: NexusAgent (suno-ai-agent)

**Status:** written from the code and `CLAUDE.md` on 2026-11-08; owner to confirm at the first Checkpoint A.
**Loads with dimensions:** security, ai-llm, architecture, data, reliability, cost, compliance, testing, code-health, ux-design, accessibility, documentation.
**How it is used:** load it at Stage 3 together with the stack modules `nextjs`, `react`, `mongodb-mongoose`, `llm-voice-providers`, `docker-cicd`. A failed item below is a finding, with this file and the item number as the reference.

Sources, in order: the code, then `CLAUDE.md`, then `EMBED_INTEGRATION.md`. `CLAUDE.md` is known to be out of date on the data layer (see `config.md`); where it disagrees with code, the code wins and the disagreement is a documentation finding.

## 1. Tenant isolation and embed access

- [ ] **Every API route resolves the tenant on the server.** For each `src/app/api/**/route.ts`, record how the tenant is found (`getTenantFromRequest`, session `shopId`, or nothing). A route that trusts a tenant id, shop code or prompt setting sent in the body is a finding.
- [ ] **Embed path is off by design** (agent-login only since 2026-11-09). Check that `/voice` cannot be reached without an agent session, and list embed-only code that is now dead.
- [ ] **Embed auth when disabled.** With `EMBED_AUTH_ENABLED=false` (the default), state exactly what an anonymous caller on the internet can reach: chat, transcribe, speak, summarize, config. Rate as exposure of paid endpoints (see §4).
- [ ] **Tenant resolution order** `tenantId + token` → `x-api-key` → `Referer` domain → default tenant. `Referer` is client-controlled: check that domain matching never grants more than the default tenant, and that a missing or unknown tenant does not fall back to a privileged one.
- [ ] **Token comparison** uses a constant-time compare, and tokens are not logged or echoed in errors.
- [ ] **Secrets in `src/data/tenants.json`** (git-tracked): `token`, `apiKeys`, `openaiApiKey`, SMTP settings. Tokens shipped in git are a finding; `openaiApiKey: ""` that falls back to the env key is fine (see stack module).
- [ ] **`/api/config` response** returns only what the widget needs. No knowledge base internals, keys, tokens, email recipients or other tenants.
- [ ] **Embed loader** (`src/app/agent.js/route.ts`, `src/app/voice/agent.js`, `public/`): query values are not interpolated into served JavaScript or HTML without escaping.
- [ ] **Framing**: `frame-ancestors` default list in `next.config.ts` contains `localhost` and third-party origins. Production should set `ALLOWED_FRAME_ANCESTORS`; check `deployment/` and `vercel.json` for it. Check that `/dashboard` and `/agent-login` cannot be framed (clickjacking).

## 2. Session auth and roles

- [ ] **Middleware is not the only guard.** `src/middleware.ts` matches `/dashboard/:path*` and `/voice` pages only. Every `/api/dashboard*`, `/api/leads/[id]`, `/api/reviews/[id]`, `/api/shops`, `/api/shops/[id]` handler must call `getSessionFromRequest` and check role itself. List each one with its check or its absence.
- [ ] **Manager scope.** A `manager` reads and edits only their own `shopId` (`dashboardScope` in `src/lib/auth/authorize.ts`). Check every query in `dashboard-query.ts`, `report-query.ts`, `dashboard/search`, and every `PATCH /[id]` handler filters by scope (object-level access).
- [ ] **Agent scope.** An `agent` session can use only `/voice` for its own shop; it cannot call dashboard APIs or write another shop's reviews via `/api/summarize`.
- [ ] **Session token** (`src/lib/auth/session.ts`): HMAC algorithm, constant-time signature check, `exp` enforced, role and `shopId` read only from the verified payload. `SESSION_SECRET` has no insecure fallback in production.
- [ ] **Cookie** `app_session`: `httpOnly`, `secure` (see `COOKIE_SECURE`), `sameSite`, `path=/`, 7-day max age justified; logout (`DELETE` handlers) clears it with matching attributes; no server-side revocation (note the consequence).
- [ ] **Passwords** (`src/lib/auth/password.ts`): SHA-256 with a static, defaulted salt (`SESSION_SALT ?? 'va-dashboard-2025'`) is not a password hash. Compare against bcrypt/argon2/scrypt; check `===` comparison timing; check `DASHBOARD_PASSWORD` env fallback logins.
- [ ] **Login endpoints** (`/api/agent-auth`, `/api/dashboard/auth`) have rate limiting or lockout, generic error messages, and safe `from` redirect handling (same-origin only).
- [ ] **CSRF.** Cookie-authenticated `POST`/`PATCH`/`DELETE` routes combined with `Access-Control-Allow-Origin: *` on `/api/:path*` in `next.config.ts`: check `sameSite` and origin checks.

## 3. LLM and the hidden token protocol

- [ ] **System prompt is built only on the server** (`buildSystemPrompt` in `src/lib/config/prompt.ts`). `/api/chat` accepts only user/assistant text from the client, caps message count and length, and never accepts a `system` role or prompt override.
- [ ] **Forged history.** The client posts the history. Can a caller add a fake `assistant` turn containing `[LEAD:{...}]`, `[REVIEW:{...}]` or `[END_CALL]` and have it acted on?
- [ ] **Token parsing** (`findJsonToken`, `stripTokens` in `src/app/api/chat/route.ts`): tolerant of malformed JSON, nested brackets and tokens split across stream chunks; the parsed object is validated with Zod before it reaches `/api/summarize` or the database.
- [ ] **Tokens never reach the user**: not in visible text, not in transcripts shown on screen, not in text sent to TTS, including partial chunks at sentence boundaries.
- [ ] **Tenant prompt content** (knowledge base, `customInstructions`, `greeting`) cannot override platform rules (language rules, token schema, the 5-exchange cap).
- [ ] **5-exchange cap** is enforced on the server as well as in the prompt; check the same for the 120 s session and 60 s turn caps.
- [ ] **Language handling**: `languageMode`, `supportedLanguages`, `franc` detection and `languageVoices` agree; Urdu, Arabic and Hindi text splits into sentences correctly for TTS.
- [ ] **Model names and providers** configured in one place (`src/lib/ai/client.ts`); Groq fallback for chat keeps the same safety behaviour.

## 4. Paid endpoints and cost bounds

- [ ] `/api/transcribe`: maximum upload size and duration enforced on the server; MIME types accepted include Safari `audio/mp4`.
- [ ] `/api/speak`: maximum text length; voice id taken from tenant config, not from the request; ElevenLabs/OpenAI choice not caller-controlled.
- [ ] `/api/chat` and `/api/summarize`: `max_tokens` set; abort on client disconnect; `maxDuration` matches Vercel plan.
- [ ] Per-IP, per-tenant and per-session rate limits exist somewhere (code, Vercel firewall, or reverse proxy). In-memory limiters are per instance; say so.
- [ ] Per-tenant `openaiApiKey` vs platform key: which tenant's usage lands on the platform bill.
- [ ] `/api/summarize` cannot be called repeatedly for the same conversation to create duplicate reviews, leads and emails (idempotency).

## 5. Data (MongoDB / Mongoose) and personal data

- [ ] **Models** `Shop`, `User`, `Review`, `Lead` (`src/lib/db/models/`): required fields, enums for `sentiment`, `category`, `status`, `ticketPriority`; indexes on `shopId`, `createdAt`, `status`; unique index on user login.
- [ ] **JSON-in-strings** (`items`, `keyPoints`, `transcript` stored as JSON strings): parse failures handled; consider arrays.
- [ ] **Review + Lead writes** in `/api/summarize` are consistent if one fails (transaction or compensating logic).
- [ ] **`PATCH` handlers** use a field allow-list (no mass assignment of `shopId`, `status` outside the allowed set, `passwordHash`).
- [ ] **No password hash** or session secret in any API response or log line (`.select('-passwordHash')` or equivalent).
- [ ] **Operator injection**: query values from requests are validated as primitives (Zod) or `sanitizeFilter` is on.
- [ ] **Personal data inventory**: what is stored (audio? transcripts, names, phones, emails), where, for how long; a retention rule exists; who can read transcripts; what goes to OpenAI, ElevenLabs, Groq and Gmail. Write it as a table in the report.
- [ ] **Legacy data**: `dev.db` and `prisma/dev.db` tracked in git (check `git ls-files`). If tracked, they may contain personal data in history: finding, with the owner deciding on history rewriting.

## 6. Dashboard numbers must be true

- [ ] No invented numbers: no `Math.random()`, mock arrays, or fallbacks such as `?? 3` in dashboard or report render paths (`src/app/dashboard/`, `src/components/dashboard/reports/`). Absent data shows a dash or empty state.
- [ ] Averages (rating, sentiment share) skip records with no value instead of counting them as zero.
- [ ] Filters (period, region, shop, category) give the same totals in the overview, the Reports tab and the export; one computation per metric (`dashboard-query.ts` vs `report-query.ts`).
- [ ] SLA (`slaDueAt`) and ticket priority are computed in one place and use a clear timezone (Pakistan time vs UTC).
- [ ] Charts: axes start at zero for counts; labels in plain English.

## 7. Headers, CORS and transport

- [ ] `/api/:path*` sends `Access-Control-Allow-Origin: *` while also using cookies: confirm no cookie-authenticated route is reachable cross-origin with credentials.
- [ ] Missing security headers on pages: CSP (beyond `frame-ancestors`), HSTS, `X-Content-Type-Options`, `Referrer-Policy`; `poweredByHeader`.
- [ ] `Permissions-Policy: microphone=(self)` on `/voice`; the iframe parent must also pass `allow="microphone"`; check `EMBED_INTEGRATION.md` says so.
- [ ] Docker deploy on port 3020: is TLS terminated in front (reverse proxy)? If served over plain HTTP, `COOKIE_SECURE=false` disables the secure flag: finding with the trade-off.

## 8. Operations and supply chain

- [ ] **No CI**: no automated lint, typecheck, test, audit or build before deploy. Record as a finding with the smallest useful pipeline.
- [ ] **Two deploy targets** (Vercel and Docker VM): env vars and limits that differ between them (`maxDuration`, `ALLOWED_FRAME_ANCESTORS`, `COOKIE_SECURE`, `MONGODB_URI`).
- [ ] **Docker**: `node:24-slim` not pinned by digest; full `node_modules` and `src` copied to the runner (no `output: 'standalone'`); build tools (`python3`, `g++`) only in `deps` stage; healthcheck hits `/agent-login`; `:latest` tag only (no rollback tag).
- [ ] **Personal Docker Hub namespace** `tariqsulehri/nexus-agent` for production images: supply-chain and access-continuity risk.
- [ ] **Dependencies**: semver ranges (`^`) on `next`, `openai`, `mongoose`, `nodemailer`; known CVEs (Next.js middleware bypass CVE-2025-29927 fixed in 15.2.3, check installed version); unused deps left from the SQLite era.
- [ ] **Logging**: `console.*` calls do not print transcripts, phone numbers, emails, tokens or keys; errors from providers are not returned raw to clients.
- [ ] **Email**: SMTP credentials referenced by env name (`userEnv`, `passEnv`) only; recipients come from tenant config, not the request; escalation emails cannot be triggered repeatedly by a caller.

## 9. Tests

- [ ] There are no automated tests and no `test` script. Rate testing honestly, and propose the smallest high-value set: (a) session sign/verify and role checks; (b) route-handler auth matrix (anonymous, agent, manager of shop A, manager of shop B, admin) for every API route; (c) `findJsonToken` / `stripTokens` unit tests with malformed and split tokens; (d) golden-transcript tests for each `agentType` with a mocked model; (e) one Playwright flow per access path.

## 10. UI and accessibility (`/voice`, widget, dashboard)

- [ ] Mic button, status and countdown arcs have accessible names and live-region announcements (`status-indicator.tsx`, `mic-button.tsx`, `nexus-agent.tsx`).
- [ ] Text input fallback works without a microphone and with mic permission denied.
- [ ] Keyboard-only use of the widget and dashboard; focus visible; dialogs trap and return focus.
- [ ] Colour contrast meets WCAG AA for every tenant accent (`--nx-accent` themes) and in dark mode.
- [ ] RTL rendering for Urdu and Arabic transcripts.
- [ ] Errors (quota, invalid key, mic denied, network) are shown in plain words with a next step.

## 11. Looks wrong but is fine

- Empty `openaiApiKey` values in `tenants.json` (fallback to env key).
- `connectDB` cached on `globalThis` (correct pattern for Next.js).
- `X-Accel-Buffering: no` and `Cache-Control: no-cache, no-transform` on `/api/*` (needed for SSE).
- Greeting played without an LLM call.
- `export { OPTIONS }` re-exported from `src/lib/utils/cors.ts` in each route.
- No queue or worker (see `config.md`).
