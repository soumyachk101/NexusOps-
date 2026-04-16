# NexusOps — Technical Requirements Document (TRD)

## 1. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 14 (App Router), TypeScript | SSR, file-based routing, type safety |
| Styling | Tailwind CSS + shadcn/ui | Rapid consistent UI |
| State | Zustand | Lightweight global state |
| Backend | FastAPI (Python 3.11+) | Async-native, perfect for AI pipelines |
| Primary DB | PostgreSQL 15 + pgvector | Relational + vector search in one DB |
| Cache / Queue | Redis (Upstash) | Job queue, rate limiting, dedup, session cache |
| Async Workers | Celery + Redis | Both ingestion and fix pipelines run async |
| Object Storage | Cloudflare R2 | Voice notes, audio, uploaded docs |
| AI / LLM | Anthropic Claude claude-sonnet-4-20250514 | Q&A, task detection, fix generation, root cause |
| Embeddings | OpenAI text-embedding-3-small | 1536-dim vectors for semantic search |
| STT | OpenAI Whisper API | Voice note transcription |
| Telegram | python-telegram-bot v20 | Team message + voice ingestion |
| GitHub | PyGithub + GitHub OAuth App | Code fetch, branch create, PR creation |
| Auth | NextAuth.js (GitHub OAuth) | Single sign-on — GitHub is required anyway |
| ORM | SQLAlchemy 2.0 async + Alembic | Type-safe DB, migrations |
| Diff Viewer | react-diff-viewer-continued | Code diff display in frontend |
| Notifications | python-telegram-bot (same bot) | Alerts for incidents and PRs |
| Jira | Atlassian REST API v3 | Task ticket creation |
| Deployment | Vercel (frontend) + Railway (backend + workers) | Fast hackathon deploy |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INPUT SOURCES                                     │
│                                                                              │
│  [Telegram Messages]  [Voice Notes]  [Sentry Webhook]  [GitHub Events]      │
│  [Document Uploads]   [Meetings]     [Custom Webhooks]  [Manual Input]      │
└───────────┬──────────────────┬────────────────┬──────────────────────────────┘
            │                  │                │
            ▼                  ▼                ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND (Single Service)                         │
│                                                                               │
│  /api/v1/memory/*    ←── Memory Engine routes                                │
│  /api/v1/autofix/*   ←── AutoFix Engine routes                               │
│  /api/v1/nexus/*     ←── Integration Layer routes                            │
│  /webhook/*          ←── Telegram + Sentry + Deploy webhooks                 │
└───────────┬────────────────────┬──────────────────────────────────────────────┘
            │                    │
            ▼                    ▼
┌────────────────────┐   ┌───────────────────────────────────────────────────┐
│   SYNC HANDLERS    │   │          CELERY ASYNC WORKERS                     │
│                    │   │                                                   │
│ • JWT auth         │   │  Queue: HIGH   → voice transcription              │
│ • Q&A queries      │   │  Queue: DEFAULT→ chunking, embedding, fix pipeline│
│ • Task CRUD        │   │  Queue: LOW    → detection scans, cleanup        │
│ • Fix review       │   │                                                   │
│ • Dashboard stats  │   │  Beat: task detection (1hr), problem scan (6hr)  │
└────────────────────┘   └───────────────────────────────────────────────────┘
            │                    │
            └─────────┬──────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
│                                                                              │
│   PostgreSQL 15 + pgvector          Redis (Upstash)     Cloudflare R2       │
│   ├── users, workspaces             ├── Celery queue    ├── voice notes      │
│   ├── sources (Memory)              ├── rate limits     ├── meeting audio    │
│   ├── document_chunks + vectors     ├── session cache   └── uploaded docs    │
│   ├── query_history                 └── dedup keys                          │
│   ├── tasks, decisions                                                       │
│   ├── incidents (AutoFix)                                                   │
│   ├── fixes, revert_events                                                  │
│   └── repositories                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL AI SERVICES                                   │
│                                                                              │
│  Anthropic Claude         OpenAI Embeddings       OpenAI Whisper            │
│  ├── Memory Q&A           ├── text-embedding-3-sm  ├── voice transcription  │
│  ├── Task detection       └── 1536-dim vectors     └── language detection   │
│  ├── Root cause analysis                                                    │
│  └── Fix generation                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Module API Design

### Base URL: `/api/v1`

#### Auth
```
POST   /auth/login
POST   /auth/refresh
DELETE /auth/logout
GET    /auth/github/callback
```

#### Memory Engine Routes
```
POST   /memory/ingest/telegram/connect    → link Telegram group
POST   /memory/ingest/telegram/history    → bulk import history
POST   /memory/ingest/audio               → upload voice note / meeting
POST   /memory/ingest/document            → upload PDF/DOCX/MD
GET    /memory/ingest/jobs/:job_id        → poll ingestion status
POST   /memory/query                      → RAG Q&A
GET    /memory/search?q=...               → semantic search (raw chunks)
GET    /memory/sources                    → list all sources
GET    /memory/tasks                      → detected tasks
PATCH  /memory/tasks/:id                  → update task status
POST   /memory/tasks/:id/jira             → push to Jira
GET    /memory/problems                   → recurring issues
```

#### AutoFix Engine Routes
```
POST   /autofix/repos/connect             → connect GitHub repo
GET    /autofix/repos                     → list repos
DELETE /autofix/repos/:id
POST   /autofix/incidents/manual          → manually submit error
GET    /autofix/incidents                 → incident list
GET    /autofix/incidents/:id             → incident + fix detail
PATCH  /autofix/incidents/:id/status      → dismiss / resolve
POST   /autofix/incidents/:id/retry       → retry fix pipeline
POST   /autofix/fixes/:id/approve         → create real PR from draft
POST   /autofix/revert/trigger            → manual revert
```

#### Integration Layer Routes
```
GET    /nexus/memory-context/:incident_id → memory search results for incident
GET    /nexus/dashboard                   → unified stats for both modules
GET    /nexus/timeline                    → combined activity feed
```

#### Webhooks
```
POST   /webhook/telegram/:workspace_token
POST   /webhook/sentry/:project_token
POST   /webhook/error/:project_token
POST   /webhook/deploy/:project_token
```

---

## 4. Key Pipeline Designs

### Memory Ingestion Pipeline
```
Source received (Telegram / audio / doc)
→ Store raw source + metadata in DB
→ Enqueue Celery job (HIGH if audio, DEFAULT if text/doc)
→ Worker: transcribe (Whisper) if audio
→ Worker: extract text (pdfplumber / python-docx) if doc
→ Semantic chunk (512 tokens, 50 overlap)
→ Batch embed (OpenAI text-embedding-3-small, 25/call)
→ Store document_chunks with pgvector embedding
→ Update source status → 'processed'
```

### AutoFix Pipeline
```
Error webhook received
→ Validate HMAC
→ Create incident record
→ Enqueue: fix_pipeline (DEFAULT queue)

Worker:
1. Sanitize: strip secrets/PII from error + stack trace
2. Parse stack trace → file paths + line numbers
3. GitHub API: fetch file content + 60-line context per file
4. Claude: root cause analysis → JSON {root_cause, affected_files, confidence}
5. Claude: fix generation → JSON {file_changes: [{path, original, fixed}]}
6. Safety check: AST parse + dangerous pattern scan
7. If BLOCKED → notify team, stop
8. GitHub API: create branch → commit changes → open draft PR
9. Notify team (Telegram): PR link + incident summary
```

### Integration: Memory-Enriched PR
```
After step 4 (root cause analysis complete):
→ Extract error keywords + file names from analysis
→ POST /nexus/memory-context with keywords
→ Vector search in document_chunks for matching team discussions
→ Fetch top 3 relevant memory chunks
→ Include in PR body as "Team History" section
→ Full PR: Code Fix + Root Cause + Team Memory Context
```

---

## 5. Performance Requirements

| Operation | Target P95 |
|-----------|-----------|
| Memory Q&A (RAG) | < 4s |
| Semantic search | < 600ms |
| Voice transcription (5 min) | < 30s |
| Error → Draft PR (full pipeline) | < 30s |
| Auto-revert trigger | < 30s from threshold breach |
| pgvector similarity search | < 400ms |

---

## 6. Security Requirements

- All API routes: JWT Bearer token auth
- Every DB query scoped to `workspace_id` (workspace isolation)
- Webhook validation: HMAC-SHA256 on every inbound webhook
- Sanitization: runs BEFORE any data touches Claude API
- GitHub + Jira tokens: AES-256 encrypted in DB
- Telegram bot token: env secret, never exposed to frontend
- Rate limits: 100 req/min per workspace on AI endpoints

---

## 7. Environment Variables

```env
# Core
DATABASE_URL=postgresql+asyncpg://user:pass@host/nexusops
REDIS_URL=redis://...
SECRET_KEY=...

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Integrations
TELEGRAM_BOT_TOKEN=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...
SENTRY_WEBHOOK_SECRET=...
JIRA_BASE_URL=https://team.atlassian.net
JIRA_API_TOKEN=...
JIRA_USER_EMAIL=...

# Deploy platforms (for auto-revert)
VERCEL_TOKEN=...
RAILWAY_TOKEN=...

# Storage
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_BUCKET=nexusops

# Frontend
NEXT_PUBLIC_API_URL=https://api.nexusops.dev
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://nexusops.dev
NEXT_PUBLIC_GITHUB_CLIENT_ID=...
```

---

## 8. Third-Party Cost Estimate (Hackathon)

| Service | Usage | Estimated Cost |
|---------|-------|---------------|
| Anthropic Claude | ~500 queries × $0.003 | ~$1.50 |
| OpenAI Embeddings | ~100k chunks × $0.0001/1k | ~$0.01 |
| OpenAI Whisper | ~60 min audio × $0.006/min | ~$0.36 |
| Telegram Bot API | Unlimited | $0 |
| GitHub API | OAuth free | $0 |
| Railway (backend) | Free tier | $0 |
| Vercel (frontend) | Hobby free | $0 |
| Cloudflare R2 | 10GB free | $0 |
| Upstash Redis | 10k cmds/day free | $0 |
| **Total** | | **< $3** |
