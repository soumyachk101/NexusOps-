# NexusOps — Backend Architecture

## 1. Project Structure

```
backend/
├── app/
│   ├── main.py                        # FastAPI entry, all routers registered
│   ├── config.py                      # Pydantic Settings
│   ├── database.py                    # Async SQLAlchemy engine + session
│   ├── dependencies.py                # get_db, get_current_user, get_workspace
│   │
│   ├── routers/
│   │   ├── auth.py                    # Login, GitHub OAuth callback
│   │   ├── workspace.py               # Workspace CRUD + members
│   │   ├── webhooks.py                # Telegram, Sentry, deploy webhooks
│   │   │
│   │   ├── memory/                    # Memory Engine routes
│   │   │   ├── __init__.py
│   │   │   ├── ingest.py              # Source ingestion endpoints
│   │   │   ├── query.py               # RAG Q&A, semantic search
│   │   │   ├── tasks.py               # Detected tasks + Jira
│   │   │   └── problems.py            # Recurring problem detection
│   │   │
│   │   └── autofix/                   # AutoFix Engine routes
│   │       ├── __init__.py
│   │       ├── repos.py               # GitHub repo connect/list
│   │       ├── incidents.py           # Incident CRUD + pipeline trigger
│   │       ├── fixes.py               # Fix review, approve, dismiss
│   │       └── revert.py              # Auto-revert config + history
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── workspace_service.py
│   │   │
│   │   ├── memory/
│   │   │   ├── ingestion_service.py   # Orchestrates ingestion pipeline
│   │   │   ├── transcription_service.py  # Whisper STT
│   │   │   ├── chunking_service.py    # Semantic chunking
│   │   │   ├── embedding_service.py   # OpenAI embeddings
│   │   │   ├── rag_service.py         # Q&A RAG pipeline
│   │   │   ├── task_detection_service.py
│   │   │   ├── problem_detection_service.py
│   │   │   └── jira_service.py
│   │   │
│   │   ├── autofix/
│   │   │   ├── sanitization_service.py   # PII / secret stripping
│   │   │   ├── analysis_service.py        # Claude root cause
│   │   │   ├── fix_generation_service.py  # Claude fix generation
│   │   │   ├── safety_check_service.py    # AST + pattern check
│   │   │   ├── pr_service.py              # GitHub draft PR
│   │   │   └── revert_service.py          # Vercel/Railway revert
│   │   │
│   │   └── nexus/
│   │       ├── memory_enrichment_service.py  # Integration: memory → PR
│   │       ├── notification_service.py       # Telegram + email alerts
│   │       └── dashboard_service.py          # Unified stats
│   │
│   ├── models/                        # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── workspace.py
│   │   ├── source.py                  # Memory: ingested sources
│   │   ├── document_chunk.py          # Memory: vector chunks
│   │   ├── task.py                    # Memory: detected tasks
│   │   ├── problem.py                 # Memory: recurring issues
│   │   ├── repository.py              # AutoFix: GitHub repos
│   │   ├── incident.py                # AutoFix: crash incidents
│   │   ├── fix.py                     # AutoFix: AI-generated fixes
│   │   └── revert_event.py            # AutoFix: revert log
│   │
│   ├── schemas/                       # Pydantic request/response models
│   │   ├── auth.py
│   │   ├── workspace.py
│   │   ├── memory/
│   │   │   ├── ingest.py
│   │   │   ├── query.py
│   │   │   └── tasks.py
│   │   └── autofix/
│   │       ├── incident.py
│   │       ├── fix.py
│   │       └── webhook.py
│   │
│   ├── workers/
│   │   ├── celery_app.py              # Celery app + queue config + beat schedule
│   │   ├── memory_worker.py           # Ingestion + detection jobs
│   │   └── autofix_worker.py          # Fix pipeline job
│   │
│   ├── integrations/
│   │   ├── telegram_bot.py            # Bot setup + message handlers
│   │   ├── github_client.py           # All GitHub API operations
│   │   ├── anthropic_client.py        # Claude API wrapper
│   │   ├── whisper_client.py          # Whisper STT client
│   │   ├── jira_client.py             # Jira REST API
│   │   ├── vercel_client.py           # Vercel deploy API
│   │   └── railway_client.py          # Railway deploy API
│   │
│   └── utils/
│       ├── chunker.py                 # Semantic chunking logic
│       ├── text_extractor.py          # PDF / DOCX / MD text extraction
│       ├── sanitizer.py               # PII + secret stripping
│       ├── stack_trace_parser.py      # Parse file paths from stack traces
│       ├── diff_utils.py              # Unified diff generation
│       ├── safety_checker.py          # AST + pattern safety check
│       └── prompt_builder.py          # All prompt construction functions
│
├── alembic/
│   └── versions/
│       ├── 001_initial_schema.py
│       └── 002_add_nexus_integration.py
├── tests/
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## 2. main.py — Router Registration

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, workspace, webhooks
from app.routers.memory import ingest, query, tasks, problems
from app.routers.autofix import repos, incidents, fixes, revert

app = FastAPI(title="NexusOps API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["https://nexusops.dev"])

# Core
app.include_router(auth.router,       prefix="/api/v1/auth",      tags=["auth"])
app.include_router(workspace.router,  prefix="/api/v1/workspace",  tags=["workspace"])
app.include_router(webhooks.router,   prefix="/webhook",           tags=["webhooks"])

# Memory Engine
app.include_router(ingest.router,    prefix="/api/v1/memory/ingest",   tags=["memory"])
app.include_router(query.router,     prefix="/api/v1/memory",          tags=["memory"])
app.include_router(tasks.router,     prefix="/api/v1/memory/tasks",    tags=["memory"])
app.include_router(problems.router,  prefix="/api/v1/memory/problems", tags=["memory"])

# AutoFix Engine
app.include_router(repos.router,      prefix="/api/v1/autofix/repos",     tags=["autofix"])
app.include_router(incidents.router,  prefix="/api/v1/autofix/incidents", tags=["autofix"])
app.include_router(fixes.router,      prefix="/api/v1/autofix/fixes",     tags=["autofix"])
app.include_router(revert.router,     prefix="/api/v1/autofix/revert",    tags=["autofix"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
```

---

## 3. Memory Engine: RAG Service (Core Logic)

```python
# services/memory/rag_service.py

SYSTEM_PROMPT = """You are NexusOps Memory, an intelligent knowledge assistant for engineering teams.

You answer questions about team decisions, discussions, and tasks based ONLY on provided context.

Rules:
1. Only use information from the provided context.
2. Always cite source: [Source: {type} | {date} | {sender}]
3. If not found: "I couldn't find this in your team's records."
4. For decisions: include the rationale if mentioned.
5. Be concise (2-4 sentences) unless the question demands detail."""

class RAGService:
    async def query(self, workspace_id: str, question: str) -> QueryResponse:
        # 1. Embed question
        q_embedding = await embedding_service.embed_single(question)
        
        # 2. pgvector search — top 8 chunks, cosine similarity > 0.65
        chunks = await db.execute("""
            SELECT id, text, source_type, sender, timestamp, channel_name,
                   1 - (embedding <=> $1) AS similarity
            FROM document_chunks
            WHERE workspace_id = $2 AND 1 - (embedding <=> $1) > 0.65
            ORDER BY embedding <=> $1
            LIMIT 8
        """, [q_embedding, workspace_id])
        
        if not chunks:
            return QueryResponse(
                answer="I couldn't find relevant info in your team's records.",
                sources=[]
            )
        
        # 3. Build context
        context = "\n\n---\n\n".join([
            f"[{i+1}] {c.source_type} | {c.timestamp} | {c.sender or 'Unknown'}\n{c.text}"
            for i, c in enumerate(chunks)
        ])
        
        # 4. Claude call
        response = await anthropic.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}]
        )
        
        return QueryResponse(
            answer=response.content[0].text,
            sources=[chunk_to_source(c) for c in chunks[:3]],
            latency_ms=int((time.time() - start) * 1000)
        )
```

---

## 4. AutoFix Engine: Fix Pipeline Worker (Core Logic)

```python
# workers/autofix_worker.py

@celery_app.task(name="autofix.process_incident", queue="default", max_retries=2)
async def process_incident(incident_id: str):
    incident = await db.get_incident(incident_id)
    
    try:
        # Step 1: Sanitize
        await set_status(incident_id, "sanitizing")
        sanitized = await sanitization_service.sanitize(
            incident.raw_error, incident.raw_stack_trace
        )
        
        # Step 2: Fetch code from GitHub
        await set_status(incident_id, "fetching_code")
        file_refs = stack_trace_parser.extract_files(sanitized.stack_trace)
        code_snippets = await github_client.fetch_code_context(
            incident.repository.full_name, file_refs, incident.branch
        )
        
        # Step 3: Root cause analysis
        await set_status(incident_id, "analyzing")
        analysis = await analysis_service.analyze(
            sanitized.error, sanitized.stack_trace, code_snippets
        )
        
        # *** NEXUS INTEGRATION: Query Memory Engine ***
        await set_status(incident_id, "querying_memory")
        memory_context = await memory_enrichment_service.get_context(
            workspace_id=incident.workspace_id,
            error_keywords=analysis.keywords,
            affected_files=analysis.affected_files
        )
        
        # Step 4: Fix generation
        await set_status(incident_id, "generating_fix")
        fix = await fix_generation_service.generate(analysis, code_snippets)
        
        # Step 5: Safety check
        safety = await safety_check_service.check(fix)
        if safety.score == "BLOCKED":
            await set_status(incident_id, "fix_blocked")
            await notification_service.notify_blocked(incident, safety)
            return
        
        # Step 6: Create draft PR (memory context injected here)
        await set_status(incident_id, "creating_pr")
        pr_url = await pr_service.create_draft_pr(
            repo=incident.repository.full_name,
            fix=fix,
            analysis=analysis,
            memory_context=memory_context,  # ← NexusOps magic
            safety_report=safety,
            incident=incident
        )
        
        # Step 7: Finalize + notify
        await set_status(incident_id, "pr_created", pr_url=pr_url)
        await notification_service.notify_pr_created(incident, pr_url, analysis, memory_context)
        
    except Exception as e:
        await set_status(incident_id, "failed", error=str(e))
        await notification_service.notify_failure(incident, str(e))
```

---

## 5. NexusOps Integration: Memory Enrichment Service

```python
# services/nexus/memory_enrichment_service.py

class MemoryEnrichmentService:
    """
    Queries the Memory Engine using AutoFix incident context.
    Finds relevant past discussions about the error or affected code.
    """
    
    async def get_context(
        self,
        workspace_id: str,
        error_keywords: List[str],
        affected_files: List[dict]
    ) -> MemoryContext | None:
        
        if not workspace_id:
            return None
        
        # Build search query from error context
        file_names = [f["path"].split("/")[-1] for f in affected_files]
        search_query = " ".join(error_keywords[:5] + file_names[:3])
        
        # Query the Memory Engine's vector store
        embedding = await embedding_service.embed_single(search_query)
        
        chunks = await db.execute("""
            SELECT text, source_type, sender, timestamp,
                   1 - (embedding <=> $1) AS similarity
            FROM document_chunks
            WHERE workspace_id = $2 AND 1 - (embedding <=> $1) > 0.60
            ORDER BY embedding <=> $1
            LIMIT 5
        """, [embedding, workspace_id])
        
        if not chunks or chunks[0].similarity < 0.60:
            return None
        
        return MemoryContext(
            found=True,
            chunks=[{
                "text": c.text[:300],
                "source": f"{c.source_type} | {c.timestamp} | {c.sender}",
                "similarity": round(c.similarity, 2)
            } for c in chunks[:3]],
            summary=await self._summarize(chunks, search_query)
        )
    
    async def _summarize(self, chunks, query: str) -> str:
        """Ask Claude to briefly summarize what the team said about this."""
        context = "\n\n".join([c.text for c in chunks])
        response = await anthropic.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": f"Context from team discussions:\n{context}\n\n"
                           f"In 1-2 sentences, what did the team previously say about: {query}?"
            }]
        )
        return response.content[0].text
```

---

## 6. PR Body Builder (with Memory Context)

```python
# utils/prompt_builder.py

def build_pr_body(fix, analysis, memory_context, safety_report, incident) -> str:
    memory_section = ""
    if memory_context and memory_context.found:
        memory_section = f"""
---

### 🧠 Team Memory Context
*NexusOps found relevant past discussions about this issue:*

> {memory_context.summary}

**Sources:**
{chr(10).join(f'- {c["source"]}: "{c["text"][:120]}..."' for c in memory_context.chunks)}
"""

    return f"""## 🤖 NexusOps AutoFix — Draft PR

> **⚠️ DRAFT — Review before merging. AI-generated fix.**

---

### 📋 Incident
- **Error:** `{incident.error_type}: {incident.error_message[:150]}`
- **Severity:** {incident.severity}
- **Detected:** {incident.created_at}

---

### 🔍 Root Cause
{analysis.explanation}

**Confidence:** {fix.confidence:.0%}

---

### 🔧 Fix Applied
{fix.explanation}

**Files changed:** {", ".join(f"`{fc['path']}`" for fc in fix.file_changes)}

---

### 🛡️ Safety Check
**Score:** `{safety_report.score}`
{safety_report.summary}
{memory_section}
---

*Generated by [NexusOps](https://nexusops.dev) | Incident: `{incident.id[:8]}`*
"""
```

---

## 7. Celery Configuration

```python
# workers/celery_app.py

from celery import Celery
from app.config import settings

celery_app = Celery(
    "nexusops",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.memory_worker", "app.workers.autofix_worker"]
)

celery_app.conf.task_routes = {
    "memory.transcribe_voice":     {"queue": "high"},
    "memory.ingest_text":          {"queue": "default"},
    "memory.embed_chunks":         {"queue": "default"},
    "autofix.process_incident":    {"queue": "default"},
    "memory.detect_tasks":         {"queue": "low"},
    "memory.detect_problems":      {"queue": "low"},
}

celery_app.conf.beat_schedule = {
    "detect-tasks-hourly": {
        "task": "memory.detect_tasks",
        "schedule": 3600.0,
    },
    "detect-problems-6hr": {
        "task": "memory.detect_problems",
        "schedule": 21600.0,
    },
}
```

---

## 8. Webhook Security

```python
# routers/webhooks.py

import hmac, hashlib

async def verify_hmac(request: Request, secret: str) -> bool:
    signature = (
        request.headers.get("sentry-hook-signature") or
        request.headers.get("x-nexusops-signature", "")
    )
    body = await request.body()
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)

@router.post("/webhook/sentry/{project_token}")
async def sentry_webhook(project_token: str, request: Request):
    project = await db.get_project_by_token(project_token)
    if not await verify_hmac(request, project.sentry_webhook_secret):
        raise HTTPException(401, "Invalid signature")
    
    payload = await request.json()
    incident = await incident_service.create_from_sentry(payload, project)
    process_incident.delay(str(incident.id))
    
    return {"status": "accepted", "incident_id": str(incident.id)}
```

---

## 9. Docker Compose (Local Dev)

```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: nexusops
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres, redis]
    env_file: .env
    command: uvicorn app.main:app --reload --host 0.0.0.0

  celery-worker:
    build: ./backend
    depends_on: [postgres, redis]
    env_file: .env
    command: celery -A app.workers.celery_app worker -Q high,default,low --loglevel=info

  celery-beat:
    build: ./backend
    depends_on: [postgres, redis]
    env_file: .env
    command: celery -A app.workers.celery_app beat --loglevel=info

  telegram-bot:
    build: ./backend
    depends_on: [postgres, redis]
    env_file: .env
    command: python -m app.integrations.telegram_bot

volumes:
  pgdata:
```
