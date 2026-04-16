# NexusOps — Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** NexusOps  
**Tagline:** *Your team's AI brain — remembers everything, fixes everything.*  
**Type:** B2B SaaS / Hackathon MVP  
**Target Users:** Engineering teams (2–30 devs), startup CTOs, solo founders running production apps

---

## 2. The Core Problem

Modern engineering teams suffer from two deeply related pain points:

### Pain Point 1 — Knowledge Loss
Teams talk across Telegram, voice calls, meetings, and docs. Critical decisions, architectural rationale, and task assignments get buried. When something breaks or a new member joins, institutional knowledge is gone — everyone starts from scratch.

> *"Why did we use Redis here?"*  
> *"Who was supposed to fix the auth bug?"*  
> *"What did we decide in last Tuesday's call?"*  

### Pain Point 2 — Manual Incident Response
When production crashes, developers manually dig through logs, find code, diagnose, write a fix, open a PR, and deploy — often at 3am. Mean Time To Recovery (MTTR) is measured in hours, not minutes.

> *"The app is down. Check the logs. Find the file. Write the fix. Open a PR. Wait for review..."*

### Why These Are the Same Problem
Both stem from **missing context**. When an app crashes, the fix is faster if you already know *why that code was written that way*. When a decision needs to be made, it's better if you remember *what was tried before*.

NexusOps solves both — as one unified AI operations platform.

---

## 3. The Solution: NexusOps

NexusOps is a **dual-module AI platform** for engineering teams:

### Module 1: Memory Engine (LocalLens)
Ingests all team communication (Telegram, voice notes, meetings, documents), converts them into a searchable knowledge base, and lets the team ask natural language questions with cited answers.

### Module 2: AutoFix Engine (SlothOps)
Monitors for production crashes, fetches relevant code from GitHub, generates an AI fix as a draft PR, validates safety, and can auto-revert a bad deploy before the fix is even written.

### The Integration Layer (NexusOps Secret Weapon)
When a crash is detected by AutoFix, it *automatically queries the Memory Engine*:
- "Has this error been discussed before?"
- "Was there a known risk mentioned about this module?"
- "What did the team decide about the last similar incident?"

The resulting PR includes not just a code fix — but *historical team context* about the issue.

---

## 4. User Personas

### Persona 1 — Engineering Lead (Rohan, 28)
- Manages 6 devs, daily standups on Telegram
- Pain: Spends 45min/day answering "why did we do X?" questions + woken up for production incidents
- **Gets from NexusOps:** Q&A answers in seconds, AI draft PRs while sleeping

### Persona 2 — New Team Member (Priya, 23)  
- Just joined a 4-month-old project, zero documentation
- Pain: Entire codebase history is in people's heads or buried in chat
- **Gets from NexusOps:** Full searchable history, ask anything about past decisions

### Persona 3 — Solo SaaS Founder (Karan, 27)
- Runs a production app solo, no on-call rotation
- Pain: App crashes, he's the only one to fix it — takes hours
- **Gets from NexusOps:** AI fixes + auto-revert = wakes up to a PR, not a 3-hour session

### Persona 4 — CTO (Meera, 32)
- 4-engineer team, no dedicated DevOps
- Pain: Every incident is manual, every knowledge gap costs sprint time
- **Gets from NexusOps:** Both modules in one tool, one cost, one integration

---

## 5. Core Features

### 5.1 Memory Engine (Module 1)

| Feature | Priority | Description |
|---------|----------|-------------|
| Telegram Ingestion | P0 | Bot connects to team group, ingests all messages + voice notes |
| Voice Transcription | P0 | Whisper STT converts voice notes → searchable text |
| Document Upload | P0 | Ingest PDF, DOCX, Markdown files |
| Meeting Import | P1 | Upload .mp3/.mp4 meeting recordings, auto-transcribe |
| AI Q&A with Citations | P0 | Natural language questions → answer + source references |
| Task Detection | P1 | AI identifies action items from chats/meetings |
| Decision Tracking | P1 | AI flags team decisions with rationale |
| Jira Auto-Ticket | P1 | 1-click create Jira ticket from detected task |
| Problem Detection | P1 | Surfaces recurring complaints/blockers |

### 5.2 AutoFix Engine (Module 2)

| Feature | Priority | Description |
|---------|----------|-------------|
| Sentry Webhook | P0 | Real-time error reception from Sentry |
| Custom Webhook | P0 | Any monitoring tool can POST error data |
| Manual Error Input | P0 | Paste any stack trace manually |
| Data Sanitization | P0 | Strip API keys, passwords, PII before Claude sees it |
| GitHub Code Fetch | P0 | Fetch relevant files + context from stack trace |
| AI Root Cause Analysis | P0 | Claude diagnoses WHY the error occurred |
| AI Fix Generation | P0 | Claude generates minimal code fix |
| Safety Check | P0 | AST + pattern analysis on generated code |
| Draft PR Creation | P0 | GitHub draft PR with full context, never auto-merged |
| Auto-Revert | P1 | Error spike after deploy → auto-rollback via Vercel/Railway API |
| Team Notifications | P1 | Telegram + email notifications on PR created / revert triggered |

### 5.3 Integration Layer (NexusOps Unique Value)

| Feature | Priority | Description |
|---------|----------|-------------|
| Memory-Enriched PRs | P0 | AutoFix queries Memory Engine for past context on every incident |
| Incident Indexing | P1 | After fix merged, incident + fix stored in memory for future reference |
| Cross-Module Search | P1 | Search across both incidents and team discussions |
| Historical Pattern | P1 | "This error has been mentioned 3x in team chats" surfaced in incident view |

---

## 6. User Stories

```
As an Engineering Lead,
When an app crashes at night,
I want NexusOps to create a draft fix PR automatically
So I can review and merge it in the morning.

As an Engineering Lead,
When reviewing an incident PR,
I want to see if this issue was discussed before in our team chats
So I can understand full context before merging.

As a New Team Member,
I want to ask "Why are we using PostgreSQL instead of MySQL?"
And get an answer with the exact Telegram message where it was decided.

As a PM,
I want all action items from yesterday's standup auto-detected
So I never have to manually create Jira tickets.

As a CTO,
When a bad deploy breaks production,
I want auto-revert to fire within 2 minutes
So users experience minimal downtime.
```

---

## 7. Integration with External Tools

| Tool | Integration Type | Module |
|------|-----------------|--------|
| Telegram | Bot API — message + voice ingestion | Memory |
| GitHub | OAuth + REST — code fetch, PR creation | AutoFix |
| Sentry | Webhook — real-time error alerts | AutoFix |
| Jira | REST API — auto ticket creation | Memory |
| Vercel | Deploy API — auto-revert | AutoFix |
| Railway | Deploy API — auto-revert | AutoFix |
| Anthropic Claude | AI — Q&A, fix generation, detection | Both |
| OpenAI Whisper | STT — voice transcription | Memory |
| OpenAI Embeddings | Vector embeddings | Memory |

---

## 8. MVP Scope (Hackathon)

**What ships:**
- Memory Engine: Telegram ingestion, voice transcription, Q&A with citations, task detection
- AutoFix Engine: Webhook ingestion, GitHub code fetch, sanitization, Claude fix, safety check, draft PR
- Integration Layer: Memory-enriched PR context (this is the showpiece)
- Notifications: Telegram bot for both modules
- Dashboard: Unified view of recent knowledge queries + recent incidents

**What's post-MVP:**
- Meeting recording import, multi-workspace, Slack/Discord, mobile app, GitLab support

---

## 9. Success Metrics (Hackathon Demo)

| Metric | Target |
|--------|--------|
| Q&A answer latency | < 4s |
| Error → Draft PR time | < 30s |
| Memory-enriched context in PR | Working demo |
| Auto-revert demo | Simulated or live |
| Voice note → searchable text | Working demo |

---

## 10. Competitive Moat

| Product | What it does | NexusOps Advantage |
|---------|-------------|-------------------|
| Sentry | Error detection | NexusOps also auto-fixes |
| Mem.ai | Team memory | NexusOps also fixes crashes |
| GitHub Copilot | Code suggestions | NexusOps is incident-triggered + has team context |
| Notion AI | Docs search | NexusOps ingests Telegram, voice, and auto-generates fixes |
| PagerDuty | Alerting | NexusOps remediates, not just alerts |

**No existing tool does Memory + AutoFix + Integration Layer together.** That's the pitch.
