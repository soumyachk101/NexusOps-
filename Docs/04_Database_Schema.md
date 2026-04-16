# NexusOps — Database Schema

## 1. Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- trigram for full-text search
```

---

## 2. Core: Auth & Workspace

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    name                VARCHAR(255),
    avatar_url          TEXT,
    github_id           VARCHAR(100) UNIQUE,
    github_username     VARCHAR(100),
    github_access_token TEXT,                     -- encrypted
    hashed_password     TEXT,
    provider            VARCHAR(50) DEFAULT 'github',
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspaces (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(100) UNIQUE NOT NULL,
    owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Memory Engine config
    telegram_chat_id    VARCHAR(100),
    jira_project_key    VARCHAR(50),
    jira_base_url       TEXT,
    -- AutoFix Engine config
    default_branch      VARCHAR(100) DEFAULT 'main',
    auto_revert_enabled BOOLEAN DEFAULT FALSE,
    error_rate_threshold FLOAT DEFAULT 3.0,
    revert_window_min   INTEGER DEFAULT 5,
    -- Notifications
    notify_telegram_chat_id VARCHAR(100),
    notify_on_pr        BOOLEAN DEFAULT TRUE,
    notify_on_revert    BOOLEAN DEFAULT TRUE,
    notify_on_task      BOOLEAN DEFAULT FALSE,
    -- Settings
    settings            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspace_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(20) DEFAULT 'member', -- 'admin', 'member', 'viewer'
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

CREATE TABLE workspace_secrets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    key             VARCHAR(100) NOT NULL,
    -- e.g. 'jira_api_token', 'telegram_bot_token', 'vercel_token', 'github_token'
    encrypted_value TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, key)
);
```

---

## 3. Memory Engine: Sources & Knowledge Base

```sql
CREATE TABLE sources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_type     VARCHAR(50) NOT NULL,
    -- 'telegram_message', 'voice_note', 'meeting_audio', 'document', 'incident_fix'
    name            VARCHAR(500),
    status          VARCHAR(30) DEFAULT 'pending',
    -- 'pending', 'processing', 'processed', 'failed'
    file_url        TEXT,              -- R2 path for audio/doc
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    external_id     VARCHAR(255),      -- Telegram message_id, etc.
    metadata        JSONB DEFAULT '{}',
    -- {channel_id, chat_title, sender_name, incident_id (for incident_fix type)}
    error_message   TEXT,
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sources_workspace ON sources(workspace_id);
CREATE INDEX idx_sources_status ON sources(status);
CREATE INDEX idx_sources_type ON sources(source_type);

-- Vector knowledge store
CREATE TABLE document_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_id       UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    chunk_index     INTEGER NOT NULL,
    text            TEXT NOT NULL,
    embedding       VECTOR(1536),          -- text-embedding-3-small
    -- Denormalized for fast retrieval
    sender          VARCHAR(255),
    timestamp       TIMESTAMPTZ,
    source_type     VARCHAR(50),
    channel_name    VARCHAR(255),
    -- For incident_fix type: link back to incident
    incident_id     UUID,                  -- references incidents(id) if applicable
    -- Full-text search
    text_tsv        TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', text)) STORED,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast ANN vector search
CREATE INDEX idx_chunks_embedding ON document_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_chunks_fts        ON document_chunks USING GIN (text_tsv);
CREATE INDEX idx_chunks_workspace  ON document_chunks(workspace_id);
CREATE INDEX idx_chunks_source     ON document_chunks(source_id);

-- Q&A history
CREATE TABLE query_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    question        TEXT NOT NULL,
    answer          TEXT NOT NULL,
    sources         JSONB DEFAULT '[]',
    latency_ms      INTEGER,
    model_used      VARCHAR(100),
    feedback        VARCHAR(20),     -- 'helpful', 'not_helpful', null
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AI-detected tasks
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) DEFAULT 'detected',
    -- 'detected', 'confirmed', 'in_progress', 'done', 'dismissed'
    priority        VARCHAR(20) DEFAULT 'medium',
    assignee_hint   VARCHAR(255),
    deadline_hint   TEXT,
    source_chunk_id UUID REFERENCES document_chunks(id),
    source_preview  TEXT,
    jira_ticket_key VARCHAR(50),
    jira_synced_at  TIMESTAMPTZ,
    detected_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_status    ON tasks(status);

-- AI-detected decisions
CREATE TABLE decisions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    summary         TEXT NOT NULL,
    rationale       TEXT,
    made_by_hint    VARCHAR(255),
    decision_date   TIMESTAMPTZ,
    source_chunk_id UUID REFERENCES document_chunks(id),
    source_preview  TEXT,
    tags            TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring problems
CREATE TABLE problems (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    frequency       INTEGER DEFAULT 1,
    severity        VARCHAR(20) DEFAULT 'medium',
    status          VARCHAR(30) DEFAULT 'open',
    first_seen      TIMESTAMPTZ DEFAULT NOW(),
    last_seen       TIMESTAMPTZ DEFAULT NOW(),
    related_chunk_ids UUID[],
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. AutoFix Engine: Incidents & Fixes

```sql
CREATE TABLE repositories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    github_repo_id  BIGINT UNIQUE,
    full_name       VARCHAR(255) NOT NULL,   -- 'owner/repo'
    name            VARCHAR(255) NOT NULL,
    default_branch  VARCHAR(100) DEFAULT 'main',
    language        VARCHAR(50),             -- 'python', 'javascript', 'typescript'
    is_private      BOOLEAN DEFAULT FALSE,
    webhook_id      BIGINT,                  -- GitHub webhook ID
    last_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repos_workspace  ON repositories(workspace_id);
CREATE INDEX idx_repos_full_name  ON repositories(full_name);

CREATE TYPE incident_status AS ENUM (
    'received', 'sanitizing', 'sanitized', 'fetching_code',
    'analyzing', 'analyzed', 'querying_memory', 'generating_fix',
    'creating_pr', 'pr_created', 'fix_blocked', 'failed',
    'resolved', 'dismissed'
);

CREATE TABLE incidents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    repository_id       UUID REFERENCES repositories(id),
    -- Raw data (PII may be present, encrypted at rest)
    raw_error           TEXT,
    raw_stack_trace     TEXT,
    -- Sanitized (safe to display)
    sanitized_error     TEXT,
    sanitized_stack_trace TEXT,
    sanitization_report JSONB DEFAULT '{}',
    -- Classification
    error_type          VARCHAR(255),
    error_message       TEXT,
    severity            VARCHAR(20) DEFAULT 'medium',
    environment         VARCHAR(50) DEFAULT 'production',
    branch              VARCHAR(100) DEFAULT 'main',
    -- Source
    source              VARCHAR(50),         -- 'sentry', 'webhook', 'manual'
    external_id         VARCHAR(255),
    -- Analysis
    root_cause          TEXT,
    affected_files      JSONB DEFAULT '[]',
    analysis_confidence FLOAT,
    analysis_keywords   TEXT[],              -- extracted for memory search
    -- Memory Engine enrichment
    memory_context      JSONB,               -- {found, summary, chunks[]}
    -- PR info
    pr_url              TEXT,
    pr_number           INTEGER,
    pr_branch           VARCHAR(255),
    pr_merged_at        TIMESTAMPTZ,
    -- Status
    status              incident_status DEFAULT 'received',
    pipeline_error      TEXT,
    -- Timing (for MTTR)
    received_at         TIMESTAMPTZ DEFAULT NOW(),
    pr_created_at       TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    -- Meta
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_workspace ON incidents(workspace_id);
CREATE INDEX idx_incidents_status    ON incidents(status);
CREATE INDEX idx_incidents_severity  ON incidents(severity);
CREATE INDEX idx_incidents_created   ON incidents(created_at DESC);

CREATE TABLE fixes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id         UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    title               VARCHAR(500) NOT NULL,
    explanation         TEXT,
    confidence          FLOAT,
    caveats             TEXT[],
    file_changes        JSONB NOT NULL DEFAULT '[]',
    -- [{path, original_code, fixed_code, diff, change_summary}]
    safety_score        VARCHAR(30),         -- 'SAFE', 'REVIEW_REQUIRED', 'BLOCKED'
    safety_issues       JSONB DEFAULT '[]',
    reviewed_by         UUID REFERENCES users(id),
    reviewed_at         TIMESTAMPTZ,
    review_note         TEXT,
    model_used          VARCHAR(100),
    prompt_tokens       INTEGER,
    completion_tokens   INTEGER,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fixes_incident ON fixes(incident_id);

CREATE TABLE revert_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    incident_id     UUID REFERENCES incidents(id),
    trigger_type    VARCHAR(50),   -- 'auto', 'manual'
    reason          TEXT,
    bad_deploy_id   VARCHAR(255),
    reverted_to     VARCHAR(255),
    platform        VARCHAR(50),   -- 'vercel', 'railway'
    status          VARCHAR(30),   -- 'success', 'failed'
    error_message   TEXT,
    triggered_at    TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- Error rate snapshots for auto-revert threshold
CREATE TABLE error_rate_snapshots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    rate            FLOAT NOT NULL,
    deploy_id       VARCHAR(255),
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snapshots_workspace_time
    ON error_rate_snapshots(workspace_id, recorded_at DESC);
```

---

## 5. Integration & Audit

```sql
-- Unified activity feed (used in dashboard timeline)
CREATE TABLE activity_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    module          VARCHAR(30) NOT NULL,    -- 'memory', 'autofix', 'nexus'
    action          VARCHAR(100) NOT NULL,
    -- e.g. 'query_asked', 'task_detected', 'pr_created', 'memory_enriched', 'reverted'
    resource_type   VARCHAR(50),
    resource_id     UUID,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_workspace_time
    ON activity_log(workspace_id, created_at DESC);
```

---

## 6. Key Indexes Summary

```sql
-- Most critical for query performance
CREATE INDEX idx_chunks_embedding       ON document_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_chunks_workspace       ON document_chunks(workspace_id);
CREATE INDEX idx_incidents_workspace    ON incidents(workspace_id);
CREATE INDEX idx_incidents_status       ON incidents(status);
CREATE INDEX idx_tasks_workspace_status ON tasks(workspace_id, status);
CREATE INDEX idx_query_history_ws       ON query_history(workspace_id, created_at DESC);
```

---

## 7. Migration Commands

```bash
# Setup
alembic init alembic
alembic revision --autogenerate -m "001_initial_schema"
alembic upgrade head

# New migration
alembic revision --autogenerate -m "002_add_activity_log"
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 8. Development Seed Data

```sql
INSERT INTO users (email, name, github_username)
VALUES ('dev@nexusops.dev', 'Dev User', 'devuser');

INSERT INTO workspaces (name, slug, owner_id)
VALUES ('Test Team', 'test-team', (SELECT id FROM users LIMIT 1));

-- Create test workspace membership
INSERT INTO workspace_members (workspace_id, user_id, role)
VALUES (
    (SELECT id FROM workspaces LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    'admin'
);
```
