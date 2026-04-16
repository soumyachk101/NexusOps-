# NexusOps — System Design

## 1. Complete Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                           NEXUSOPS PLATFORM                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  INPUT LAYER                                                                 ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │ MEMORY INPUTS              │ AUTOFIX INPUTS                         │    ║
║  │ ┌──────────┐ ┌──────────┐  │ ┌──────────┐ ┌──────────┐ ┌────────┐ │    ║
║  │ │ Telegram │ │  Voice   │  │ │  Sentry  │ │ Custom   │ │ Manual │ │    ║
║  │ │ Messages │ │  Notes   │  │ │ Webhook  │ │ Webhook  │ │  Input │ │    ║
║  │ └────┬─────┘ └────┬─────┘  │ └────┬─────┘ └────┬─────┘ └───┬────┘ │    ║
║  │ ┌──────────┐ ┌──────────┐  │      └─────────────┴───────────┘      │    ║
║  │ │ Meeting  │ │   Docs   │  │                   │                    │    ║
║  │ │  Audio   │ │ PDF/DOCX │  │                   │                    │    ║
║  │ └────┬─────┘ └────┬─────┘  │                   │                    │    ║
║  └──────┼────────────┼─────── ┼───────────────────┼────────────────────┘    ║
║         │            │        │                   │                          ║
║         ▼            ▼        │                   ▼                          ║
║  ┌──────────────────────────────────────────────────────────────────────┐   ║
║  │                   FASTAPI BACKEND (Single Service)                    │   ║
║  │                                                                        │   ║
║  │  /api/v1/memory/*    /api/v1/autofix/*    /api/v1/nexus/*             │   ║
║  │  /webhook/telegram   /webhook/sentry      /webhook/deploy             │   ║
║  └──────────────────────────────┬─────────────────────────────────────────┘   ║
║                                 │                                              ║
║              ┌──────────────────┴──────────────────┐                          ║
║              │                                      │                          ║
║              ▼                                      ▼                          ║
║  ┌──────────────────────┐          ┌─────────────────────────────────────┐    ║
║  │  SYNCHRONOUS PATH    │          │       CELERY WORKERS                 │    ║
║  │                      │          │                                      │    ║
║  │ • JWT validation     │          │ HIGH   → voice transcription         │    ║
║  │ • RAG Q&A queries    │          │ DEFAULT→ chunking, embedding,        │    ║
║  │ • Dashboard stats    │          │          fix pipeline                │    ║
║  │ • Task CRUD          │          │ LOW    → task/problem detection      │    ║
║  │ • Fix review         │          │                                      │    ║
║  │ • Revert config      │          │ Beat Schedule:                       │    ║
║  └──────────────────────┘          │ • detect_tasks: every 1hr           │    ║
║                                    │ • detect_problems: every 6hr        │    ║
║                                    └───────────────────────────────────  ┘    ║
║                                              │                                 ║
║  ┌─────────────────────────────────────────── ┼──────────────────────────────┐ ║
║  │                    DATA LAYER               │                              │ ║
║  │                                             ▼                              │ ║
║  │  ┌─────────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │ ║
║  │  │ PostgreSQL 15 + pgvector │  │ Redis (Upstash) │  │  Cloudflare R2  │  │ ║
║  │  │                         │  │                │  │                  │  │ ║
║  │  │ Memory tables:          │  │ • Celery queue │  │ • Voice notes    │  │ ║
║  │  │  sources                │  │ • Rate limits  │  │ • Meeting audio  │  │ ║
║  │  │  document_chunks        │  │ • Session cache│  │ • Uploaded docs  │  │ ║
║  │  │  [HNSW vector index]    │  │ • Job dedup    │  └──────────────────┘  │ ║
║  │  │  query_history          │  └────────────────┘                        │ ║
║  │  │  tasks, decisions       │                                             │ ║
║  │  │  problems               │                                             │ ║
║  │  │                         │                                             │ ║
║  │  │ AutoFix tables:         │                                             │ ║
║  │  │  incidents              │                                             │ ║
║  │  │  fixes                  │                                             │ ║
║  │  │  repositories           │                                             │ ║
║  │  │  revert_events          │                                             │ ║
║  │  │                         │                                             │ ║
║  │  │ Shared tables:          │                                             │ ║
║  │  │  users, workspaces      │                                             │ ║
║  │  │  activity_log           │                                             │ ║
║  │  └─────────────────────────┘                                             │ ║
║  └───────────────────────────────────────────────────────────────────────────┘ ║
║                                    │                                            ║
║  ┌─────────────────────────────────┼──────────────────────────────────────┐    ║
║  │            EXTERNAL AI & INTEGRATIONS                                   │    ║
║  │                                 │                                        │    ║
║  │  ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    ║
║  │  │   Anthropic  │ │  OpenAI  │ │  OpenAI  │ │  GitHub  │ │ Telegram │ │    ║
║  │  │   Claude     │ │ Whisper  │ │ Embeds   │ │   API    │ │  Bot API │ │    ║
║  │  │ • Q&A        │ │ • STT    │ │ • 1536-d │ │ • Code   │ │ • Ingest │ │    ║
║  │  │ • Root cause │ │          │ │  vectors │ │ • PR     │ │ • Notify │ │    ║
║  │  │ • Fix gen    │ │          │ │          │ │          │ │          │ │    ║
║  │  │ • Detection  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    ║
║  │  └──────────────┘                                                        │    ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                               │    ║
║  │  │  Jira    │  │  Vercel  │  │ Railway  │                               │    ║
║  │  │ • Tickets│  │ • Revert │  │ • Revert │                               │    ║
║  │  └──────────┘  └──────────┘  └──────────┘                               │    ║
║  └──────────────────────────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. The NexusOps Integration Flow (Key Differentiator)

```
Production error received
          │
          ▼
Fix Pipeline starts...
          │
          ├─► [sanitize] → [fetch code] → [root cause analysis]
          │                                         │
          │                               Extract: error_keywords, affected_files
          │                                         │
          ▼                                         ▼
   ┌─────────────────────────────────────────────────────┐
   │         NEXUS INTEGRATION: Memory Enrichment         │
   │                                                       │
   │  1. Build search query from keywords + filenames      │
   │  2. Embed query (OpenAI text-embedding-3-small)       │
   │  3. pgvector search in document_chunks                │
   │     (same table used by Memory Engine Q&A)            │
   │  4. Get top 3 chunks (similarity > 0.60)              │
   │  5. Summarize: "Team previously discussed..."         │
   │                                                       │
   └──────────────────────┬──────────────────────────────┘
                          │
                          ▼
   ┌─────────────────────────────────────────────────────┐
   │              Fix + Memory context merged              │
   │                                                       │
   │  Draft PR body includes:                              │
   │    Section 1: Root Cause Analysis                     │
   │    Section 2: Code Changes (diff)                     │
   │    Section 3: Safety Check Report                     │
   │    Section 4: 🧠 Team Memory Context  ← NEXUS MAGIC  │
   │                                                       │
   └─────────────────────────────────────────────────────┘
```

---

## 3. Memory Ingestion Pipeline (Detailed)

```
Source received (Telegram bot / file upload / manual)
          │
          ├── Audio (voice note / meeting)?
          │       │
          │       ▼
          │   Upload to R2 → enqueue HIGH queue job
          │       │
          │       ▼ (Celery worker)
          │   Whisper API: OGG/MP3 → text + timestamps
          │       │
          │       └──────────────────────┐
          │                              │
          ├── Document (PDF/DOCX/MD)?   │
          │       │                      │
          │       ▼                      │
          │   pdfplumber / python-docx   │
          │   → extract raw text         │
          │       └──────────────────────┘
          │                              │
          └── Text (Telegram message)?  │
                  │                      │
                  └──────────────────────┘
                                         │
                                         ▼
                          Semantic chunking (512 tokens, 50 overlap)
                                         │
                                         ▼
                          Batch embed: OpenAI text-embedding-3-small
                          (25 chunks per API call)
                                         │
                                         ▼
                          INSERT INTO document_chunks
                          (text, embedding, metadata, workspace_id)
                                         │
                                         ▼
                          UPDATE sources SET status = 'processed'
```

---

## 4. AutoFix Pipeline with Memory Enrichment (Detailed)

```
Step 1: RECEIVE
  POST /webhook/sentry/:token or /webhook/error/:token
  → Validate HMAC
  → Parse payload (error, stack_trace, environment, repo info)
  → INSERT INTO incidents (status='received')
  → Enqueue: autofix.process_incident (DEFAULT queue)
  → Return 200 immediately

Step 2: SANITIZE (worker)
  → Apply regex patterns to error + stack trace
  → Strip: API keys, passwords, emails, IPs, JWTs, DB URLs
  → Generate sanitization_report
  → UPDATE incidents (sanitized_error, sanitized_stack_trace, status='sanitized')

Step 3: FETCH CODE
  → Parse sanitized stack trace → file paths + line numbers
  → GitHub API: GET /repos/{owner}/{repo}/contents/{path}?ref={branch}
  → For each file: decode base64 → extract ±60 lines around error line
  → UPDATE incidents (status='fetching_code' → 'analyzed' eventually)

Step 4: ROOT CAUSE ANALYSIS
  → Claude: error + stack trace + code snippets → JSON analysis
  → Extract: root_cause, explanation, affected_files, keywords, confidence
  → UPDATE incidents (root_cause, affected_files, analysis_keywords, analysis_confidence)

Step 5: MEMORY ENRICHMENT (NexusOps Integration)
  → Embed search query built from analysis.keywords + affected_files
  → pgvector search in document_chunks WHERE workspace_id = incident.workspace_id
  → If results found (similarity > 0.60):
      Claude: summarize team's past discussions
      → Store in incidents.memory_context
  → UPDATE incidents (memory_context, status='querying_memory' → ...)

Step 6: FIX GENERATION
  → Claude: analysis + code → JSON with file_changes (original + fixed + diff)
  → UPDATE incidents (status='generating_fix')

Step 7: SAFETY CHECK
  → For each file change: AST parse + dangerous pattern scan
  → Score: SAFE | REVIEW_REQUIRED | BLOCKED
  → If BLOCKED: UPDATE incidents (status='fix_blocked'), notify, STOP
  → If REVIEW_REQUIRED: proceed but flag in PR

Step 8: CREATE DRAFT PR
  → GitHub API: create branch slothops/fix-{incident_id[:8]} from default branch
  → Commit each file change via GitHub API
  → Create pull request (draft=True, ALWAYS)
  → PR body: root cause + code changes + safety + memory context
  → UPDATE incidents (pr_url, pr_branch, pr_created_at, status='pr_created')

Step 9: NOTIFY
  → Telegram bot: send to workspace.notify_telegram_chat_id
  → Message: "[NexusOps] Draft PR ready for: TypeError in auth.py\n{pr_url}"
  → Log to activity_log
```

---

## 5. Auto-Revert Flow

```
POST /webhook/deploy/:token → record deploy_id + timestamp

Background monitor starts (Celery delayed task, runs every 30s for 5min):

  Check: incidents in last 10 min with severity >= 'high' and status NOT 'dismissed'
  
  If spike detected (>= 2 critical/high incidents since deploy):
    → Determine deploy platform (vercel / railway)
    → Call platform rollback API
    → INSERT INTO revert_events (trigger_type='auto', reason, status)
    → UPDATE incidents: add auto_reverted = true
    → Notify team: "🔄 Auto-reverted {project} — {N} critical incidents since deploy"
    → Still run fix pipeline: root cause still needs fixing
```

---

## 6. Security Threat Model

| Threat | Mitigation |
|--------|-----------|
| Webhook replay attack | HMAC-SHA256 signature + timestamp check (reject if >5min old) |
| Sensitive data to LLM | Sanitizer runs BEFORE any Claude API call |
| Cross-workspace data leak | Every query scoped to workspace_id, enforced in DB layer |
| GitHub token exposure | Tokens encrypted in DB (AES-256), never returned in API responses |
| Bad fix auto-merged | All PRs are DRAFT — human must approve |
| Safety bypass | BLOCKED score = pipeline halts, no PR created |
| Rate abuse | 100 req/min per workspace on AI endpoints via Redis |
| Bot token hijack | Telegram tokens in env secrets, per-workspace validation |

---

## 7. Deployment Architecture

```
┌────────────────────┐  ┌───────────────────────────────────────┐
│  Vercel            │  │  Railway                               │
│                    │  │                                         │
│  Next.js frontend  │  │  FastAPI backend (uvicorn)             │
│  Auto-deploy main  │  │  Celery worker (3 queues)              │
│  Custom domain:    │  │  Celery beat (scheduler)               │
│  nexusops.dev      │  │  PostgreSQL 15 + pgvector              │
│                    │  │  Redis (or Upstash external)           │
│                    │  │  Custom domain: api.nexusops.dev       │
└────────────────────┘  └───────────────────────────────────────┘
          │                              │
          └──────────────────────────────┘
                    Both on HTTPS
              Telegram webhook → api.nexusops.dev/webhook/telegram/...
              Sentry webhook   → api.nexusops.dev/webhook/sentry/...
```

---

## 8. Hackathon Demo Script (3-minute pitch flow)

```
Minute 1: Memory Engine demo
  → Show Telegram group with messages about a tech decision
  → Open NexusOps Memory tab
  → Type: "Why did we choose PostgreSQL?"
  → Show: Answer with citation [telegram · Rahul · Jan 15]
  → Show tasks auto-detected from chat

Minute 2: AutoFix Engine demo
  → Trigger a demo Sentry webhook (pre-prepared JSON payload)
  → Show incident appear in dashboard in real-time
  → Watch pipeline steps progress (animate live)
  → Step 4 (Querying Team Memory) glows VIOLET — "wait for it..."
  → PR created — open GitHub draft PR
  → Show PR body: Code fix + "🧠 Team Memory Context" section

Minute 3: The NexusOps pitch
  → "Other tools do memory. Other tools do auto-fix."
  → "NexusOps is the only platform that connects both."
  → "When your app crashes at 3am, it already knows what your team said about it."
  → Show the memory context in the PR — highlight that Claude found relevant team discussion
  → "Nothing gets lost. Nothing stays broken."
```

---

## 9. Monitoring (MVP)

```python
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "memory_chunks": await db.count("SELECT COUNT(*) FROM document_chunks"),
        "active_incidents": await db.count(
            "SELECT COUNT(*) FROM incidents WHERE status NOT IN ('resolved','dismissed')"
        ),
        "celery_queue_depth": await redis.llen("celery:default"),
        "version": "1.0.0"
    }
```

Tools:
- **Sentry** free tier: error tracking for NexusOps itself
- **UptimeRobot**: ping `/health` every 5 min
- **Railway logs**: structured JSON logging on every pipeline step
- **Telegram self-alert**: if `celery:default` queue depth > 50 for >5min
