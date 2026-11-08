# NexusAgent: Sales Pitch for Exhibition

## The Problem Your Customers Have

- Customer calls and website inquiries go unanswered after hours.
- Feedback is scattered across WhatsApp, phone calls, forms, and memory.
- Leads disappear because staff forget to capture name, phone, email, or intent.
- Managers do not know which branch, product, or service is causing complaints.
- Customers prefer speaking naturally, but most digital tools still force them to type.
- Language barriers stop businesses from serving English, Urdu, and Hindi speakers smoothly.

---

## The Solution: NexusAgent in 30 Seconds

**NexusAgent is an AI voice agent for customer support, lead capture, reviews, and complaint handling.**

It can be embedded on a website, opened as a standalone voice screen, or used at a branch as a feedback kiosk. Customers speak naturally; NexusAgent listens, replies, captures contact details, classifies sentiment, creates follow-up records, and sends everything to a manager dashboard.

**Simple pitch:** It is like hiring a 24/7 customer service representative who speaks multiple languages, remembers every conversation, and automatically prepares your customer intelligence dashboard.

---

## Top Business Benefits

1. **24/7 Availability** — Customers get instant help even when staff are offline.
2. **Automatic Lead Capture** — Name, phone, email, company, and intent can be extracted during conversation.
3. **Real-Time Customer Sentiment** — Reviews are classified as positive, negative, complaint, or suggestion.
4. **Complaint Escalation** — Serious issues become ticketed follow-ups with priority and SLA timing.
5. **Multi-Branch Visibility** — Managers can compare outlet performance, top issues, ratings, and satisfaction trends.
6. **Multi-Language Conversations** — Supports English, Urdu, Hindi, and natural code-switching.
7. **Fast Website Integration** — Drop in an iframe or script-style embed; no custom mobile app required.
8. **Lower Operating Cost** — Reduces repetitive call handling, manual note-taking, and missed leads.

---

## Agent Features

| Feature | What It Does | Business Value |
|---|---|---|
| **Voice Conversation Pipeline** | Records customer speech, transcribes it, generates a response, and speaks back. | Customers interact naturally instead of filling long forms. |
| **Support Agent Mode** | Answers questions about services, pricing approach, timelines, and next steps. | Qualifies prospects and captures sales leads. |
| **Review Agent Mode** | Collects praise, complaints, suggestions, and ratings in a short guided flow. | Turns raw feedback into structured insight. |
| **Complaint Agent Mode** | Responds empathetically, avoids false promises, and requests optional contact details. | Helps save unhappy customers before they post publicly. |
| **Hidden Data Extraction** | Parses lead and review data silently from the AI response. | The customer hears a natural conversation while the business gets structured records. |
| **Auto Language Detection** | Detects the customer's language and keeps replies in the same language. | Better experience for local markets and mixed-language conversations. |
| **Knowledge Base Support** | Uses tenant-specific FAQs, services, policies, and custom instructions. | Each business gets a custom-trained feel without retraining a model. |
| **Email Notifications** | Can send call summaries, lead details, and complaint alerts through SMTP. | Managers receive important issues quickly. |
| **Dashboard Analytics** | Shows sentiment, categories, trends, ratings, issues, suggestions, shops, and recent conversations. | Owners see what is happening across the business. |
| **Secure Tenant Embedding** | Supports tenant tokens, API keys, allowed domains, and role-based sessions. | One platform can serve multiple clients safely. |

---

## Tools and Technologies Used

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript | Voice UI, dashboard, login screens, and embeddable agent pages. |
| **Styling/UI** | Tailwind CSS, custom React components, Recharts | Responsive voice widget, dashboard cards, charts, reports, and analytics views. |
| **Audio Capture** | Browser MediaRecorder API | Records customer voice as WebM audio for transcription. |
| **Speech Recognition** | OpenAI Whisper (`whisper-1`) | Converts customer speech into text. |
| **AI Conversation** | OpenAI Chat Completions (`gpt-4o-mini`) | Generates short, natural, business-aware agent replies. |
| **Speech Synthesis** | OpenAI TTS (`tts-1`) and optional ElevenLabs | Converts agent replies into natural voice audio. |
| **Embeddings** | OpenAI `text-embedding-3-small` | Generates semantic vectors for review/search intelligence where enabled. |
| **Backend** | Next.js API routes | Handles chat streaming, transcription, speech, summaries, auth, dashboards, reports, shops, leads, and reviews. |
| **Database** | MongoDB with Mongoose | Stores shops, users, reviews, transcripts, leads, ticket metadata, and dashboard data. |
| **Validation/Config** | Zod, tenant JSON registry | Validates environment settings and drives per-client agent configuration. |
| **Email** | Nodemailer / SMTP | Sends call summaries and escalation alerts. |
| **Auth/Security** | HMAC-signed sessions, role-based access, embed tokens, API keys, domain allow-listing | Protects manager/admin dashboards and client embeds. |
| **Developer Stack** | Node.js 20+, TypeScript 5.6, TSX, ESLint | Modern, maintainable engineering workflow. |

---

## Frontend Experience

NexusAgent includes a polished customer-facing voice interface and a manager dashboard.

**Customer voice UI**

- Animated voice avatar with clear states: connecting, idle, listening, transcribing, thinking, speaking, ended, and error.
- Microphone controls with recording limits to prevent long accidental recordings.
- Live transcript and partial AI reply display.
- Voice playback with automatic sentence-level response handling.
- Theme support for different brand styles.
- Embeddable `/voice` page for websites, kiosks, tablets, and branch counters.

**Manager dashboard**

- Role-based login for agents, managers, and admins.
- KPI cards for total reviews, rating, sentiment split, and pending follow-ups.
- Charts for trends, categories, ratings, and sentiment distribution.
- Recent conversation list with customer contact details when available.
- Report filters by branch, city, province, category, sentiment, and date.
- Regional rollups, shop comparison, trend charts, and issue heat maps.
- Review status workflow: pending, contacted, resolved, and reopen.
- Shop management for branch name, location, city, province, contact details, and map coordinates.
- Multiple dashboard themes for different viewing preferences.

---

## Backend Capabilities

The backend is built with Next.js API routes and TypeScript, giving the product one unified app for UI, API, and server-side workflows.

- **Streaming chat endpoint** sends live tokens and completed sentences using Server-Sent Events.
- **Transcription endpoint** sends recorded audio to OpenAI Whisper.
- **Speech endpoint** converts AI responses into playable audio.
- **Summarization endpoint** creates executive summaries and structured key points.
- **Review persistence** saves sentiment, category, rating, transcript, shop, lead, and ticket data.
- **Ticket classification** marks complaints, negative feedback, and suggestions with priority and SLA dates.
- **Dashboard APIs** aggregate MongoDB records into charts, reports, branch comparisons, and operational views.
- **Tenant resolution** supports tenant ID/token, API key, domain-based matching, and default fallback.
- **Session auth** protects staff screens with signed cookies and role scopes.
- **Review and lead update APIs** let managers update follow-up status and customer contact records.
- **Shop management APIs** allow admin users to maintain outlet profile and location data.

---

## OpenAI Usage

NexusAgent uses OpenAI across the full voice intelligence loop:

| OpenAI Capability | How NexusAgent Uses It |
|---|---|
| **Whisper transcription** | Converts customer voice recordings into accurate text. |
| **GPT conversation** | Produces concise, natural replies based on tenant instructions, language, shop context, and knowledge base. |
| **JSON-style summarization** | Converts conversation transcripts into business summaries and key points. |
| **Sentiment/classification support** | Helps identify positive feedback, complaints, suggestions, categories, subcategories, and ratings. |
| **Text-to-speech** | Speaks the agent's answer using OpenAI voices such as `nova` or `onyx`. |
| **Embeddings** | Converts reviews and search queries into vectors for semantic intelligence where vector search is enabled. |

The current default chat and summary model is `gpt-4o-mini`, selected for speed, cost efficiency, and reliable short-form customer conversations.

---

## TypeScript Advantage

TypeScript is used across the frontend, backend, data models, API contracts, tenant configuration, and AI workflows.

- Safer API route logic with typed request/response data.
- Shared types for chat history, leads, reviews, tenants, roles, and dashboard data.
- Stronger maintainability as the product expands to more industries and tenants.
- Better developer confidence when changing AI prompts, database schemas, or dashboard analytics.
- Clearer interfaces between audio capture, AI services, persistence, and UI state.

---

## Database and Data Model

NexusAgent stores operational data in MongoDB through Mongoose models.

| Collection | What It Stores |
|---|---|
| **Shops** | Tenant branches, branch codes, city/province, and location context. |
| **Users** | Agent, manager, and admin accounts with role and shop scope. |
| **Reviews** | Sentiment, category, subcategory, rating, transcript, summary, status, ticket ID, priority, SLA, and timestamps. |
| **Leads** | Customer name, email, phone, and linked review/call record. |

This gives managers a searchable operational history: who contacted the business, what they said, how they felt, which branch was involved, and what still needs follow-up.

---

## Security and Multi-Tenant Design

- Each client can have its own tenant ID, token, API keys, domains, agent name, company name, voice, language settings, and knowledge base.
- Embeds can be restricted by approved parent domains.
- API requests can be authenticated with tenant headers, embed tokens, or API keys.
- Dashboard users are separated by role: `agent`, `manager`, and `admin`.
- Managers can be scoped to a single shop while admins can see all shops.
- Sessions are HMAC-signed and stored in secure browser cookies.
- Tenants may supply their own OpenAI key for billing separation.

---

## Where It Works

| Industry | What They Use It For |
|---|---|
| **Restaurants & Retail** | Feedback kiosk, complaint capture, branch performance, customer satisfaction. |
| **Real Estate** | Buyer inquiries, budget capture, property interest, callback requests. |
| **Software/SaaS** | Website support, product questions, demo requests, lead qualification. |
| **Auto Dealerships** | Test-drive inquiries, financing questions, service follow-ups. |
| **Hotels** | Guest complaints, housekeeping issues, service feedback, escalation. |
| **Insurance** | Quote intake, customer profile capture, follow-up routing. |
| **E-Commerce** | Order support, returns, delivery complaints, product feedback. |
| **Events & Education** | Post-event feedback, satisfaction surveys, student/support questions. |

---

## Why NexusAgent Wins

| Customer Concern | NexusAgent Answer |
|---|---|
| **"We miss calls."** | The AI agent answers 24/7 and captures the conversation. |
| **"We do not track complaints well."** | Every complaint is classified, saved, and visible in the dashboard. |
| **"Our staff forgets follow-up details."** | Leads and contact details are captured automatically during the call. |
| **"Customers hate forms."** | Customers speak naturally; the system creates the structured record. |
| **"We have multiple branches."** | Each review is linked to a shop/branch for comparison and reporting. |
| **"We need local language support."** | The agent can respond in English, Urdu, Hindi, or mixed conversation style. |
| **"We need fast setup."** | Tenant configuration and website embedding make launch lightweight. |

---

## The Dashboard: Your Command Center

Every conversation becomes business intelligence.

| Dashboard Area | What It Shows |
|---|---|
| **Sentiment Overview** | Positive, negative, complaint, and suggestion counts. |
| **Ratings and Satisfaction** | Average rating and satisfaction percentage. |
| **Top Issues** | Most common complaint subcategories such as service, pricing, product, or facility problems. |
| **Suggestions** | Recurring improvement ideas from customers. |
| **Branch Comparison** | Which shops are performing well and which need attention. |
| **Trend Reporting** | Monthly or weekly review volume and satisfaction movement. |
| **Follow-Up Queue** | Pending complaints and leads that require manager action. |
| **Recent Conversations** | Summary, key points, transcript, ticket status, and customer contact. |
| **Reports Tab** | Date, location, branch, category, and sentiment filters for deeper analysis. |
| **Regional Rollup** | Province to city to shop hierarchy with review volume, ratings, and satisfaction. |
| **Issue Heat Map** | Where complaint categories are concentrated across branches. |
| **Shop Management** | Branch code, outlet address, city, province, phone, email, and coordinates. |
| **Status Workflow** | Mark each review as pending, contacted, resolved, or reopened. |

**Translation:** You stop guessing what customers think and start seeing exactly where revenue, service quality, and reputation are at risk.

---

## Dashboard Features in Detail

| Feature | What Managers Can Do |
|---|---|
| **Executive Overview** | See total reviews, average rating, satisfaction score, sentiment mix, best-performing shop, and open follow-ups at a glance. |
| **Sentiment Analytics** | Track positive feedback, negative feedback, complaints, and suggestions as separate business signals. |
| **Category Breakdown** | Understand whether issues are about product quality, service, staff behavior, facility, pricing, or general experience. |
| **Ratings Distribution** | Spot whether customer experience is improving or clustering around poor ratings. |
| **Top Issues and Suggestions** | Identify repeated complaints and recurring improvement ideas without manually reading every transcript. |
| **Recent Reviews Panel** | Search and filter conversations by outlet, customer, phone number, sentiment, category, rating, and follow-up status. |
| **Conversation Detail View** | Open a review to see summary, key points, customer details, transcript, ticket ID, priority, and SLA deadline. |
| **Follow-Up Status Control** | Move cases from `pending` to `contacted` to `resolved`, or reopen them if needed. |
| **Branch Ranking** | Compare shops by review volume, sentiment, average rating, satisfaction, and pending follow-ups. |
| **Advanced Reports** | Filter by date range, province, city, shop, category, and sentiment for management reporting. |
| **Trend Charts** | Compare review count or satisfaction over time, with multi-shop trend lines. |
| **Regional Rollups** | View performance from province level down to city and individual shop. |
| **Issue Heat Map** | Quickly see which branches have the highest concentration of complaints by category. |
| **Shop Directory** | View and edit shop profile data, including branch code, address, contact information, city/province, and coordinates. |
| **Role-Based Views** | Admins see all shops; managers see only their assigned shop; agents use the voice workflow. |
| **AI Search Readiness** | Where vector search is enabled, managers can ask natural-language questions about customer feedback and get sourced answers. |
| **Dashboard Themes** | Switch between light, day, dark, and night modes for comfortable viewing. |

**Sales angle:** The dashboard is not just reporting. It is a customer recovery workspace: it tells managers what happened, where it happened, who needs a callback, and whether the issue has been resolved.

---

## Demo Flow for Exhibition

1. Open the voice agent on a phone, tablet, or laptop.
2. Ask the visitor to speak a realistic customer question or complaint.
3. Let NexusAgent respond in voice.
4. Show how the lead, sentiment, summary, ticket, priority, and follow-up status appear in the dashboard.
5. Open reports to show branch comparison, regional rollup, issue heat map, and trend charts.
6. Ask which branch, website, or use case they would want to automate first.

**Demo line:** "Say anything a real customer would say. Ask a question, complain about service, or leave feedback, and I will show you what the business receives on the dashboard."

---

## Quick Questions to Ask a Customer

- "How many calls or website inquiries do you miss every week?"
- "Where do customer complaints go right now?"
- "How do you know which branch is creating the most complaints?"
- "What is the cost of one missed lead for your business?"
- "Do your customers speak multiple languages?"
- "Would your team benefit from automatic summaries and follow-up tickets?"

If they say yes to any of these, NexusAgent is an easy fit.

---

## The Pitch: 2-Minute Version

> "NexusAgent is an AI voice agent for your website, shop, or customer service workflow. Customers speak naturally, and the agent answers questions, collects leads, captures feedback, classifies sentiment, and creates follow-up records automatically. On the backend, it uses OpenAI for transcription, conversation, summaries, speech, and embeddings; it is built with Next.js, React, TypeScript, and MongoDB. For the business, the value is simple: fewer missed calls, faster complaint handling, better customer insights, and a dashboard that shows what is happening across every branch."

---

## Objection Handlers

**"We already have a chatbot."**  
NexusAgent is voice-first. Customers can talk instead of typing, which is faster and more natural for support, feedback, and complaints.

**"Will customers get frustrated talking to AI?"**  
The agent keeps responses short, listens in the customer's language, and focuses on completing the task quickly. For serious complaints, it captures follow-up details instead of pretending to solve everything instantly.

**"How much technical setup is needed?"**  
The frontend can be embedded on a website, and tenant configuration controls the agent name, voice, language, knowledge base, and security settings.

**"Can it work for multiple branches?"**  
Yes. Reviews and leads are linked to shop/branch records, so managers can compare locations and spot issues.

**"What technologies does it use?"**  
Next.js, React, TypeScript, OpenAI, MongoDB, Mongoose, Tailwind CSS, Recharts, Nodemailer, and optional ElevenLabs.

**"Can it speak our language?"**  
Yes. It supports English, Urdu, Hindi, and code-switching based on configuration.

---

## Call to Action

**"Can I show you a 60-second live demo?"**

Next steps:

- Share your website or branch use case.
- Choose the first agent type: support, reviews, or complaints.
- Configure company name, voice, language, and knowledge base.
- Embed NexusAgent and start capturing calls, leads, and feedback.

---

## Final Takeaway

**NexusAgent turns customer conversations into structured business intelligence.**

It answers, listens, speaks, summarizes, classifies, stores, reports, and escalates, all through a modern AI stack built with OpenAI, TypeScript, Next.js, and MongoDB.
