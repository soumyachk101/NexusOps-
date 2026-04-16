# NexusOps — Code Structure

## 1. Monorepo Layout

```
nexusops/
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
│
├── frontend/                          # Next.js 14 App Router
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx             # Root layout, font imports, providers
│       │   ├── page.tsx               # Landing / redirect to dashboard
│       │   ├── (auth)/
│       │   │   └── login/page.tsx     # GitHub OAuth login
│       │   └── (dashboard)/
│       │       ├── layout.tsx         # Sidebar + module nav wrapper
│       │       ├── dashboard/page.tsx # Unified dashboard: both modules
│       │       │
│       │       ├── memory/            # Memory Engine pages
│       │       │   ├── ask/page.tsx
│       │       │   ├── sources/page.tsx
│       │       │   ├── tasks/page.tsx
│       │       │   └── problems/page.tsx
│       │       │
│       │       ├── autofix/           # AutoFix Engine pages
│       │       │   ├── incidents/page.tsx
│       │       │   ├── incidents/[id]/page.tsx
│       │       │   └── repos/page.tsx
│       │       │
│       │       └── settings/
│       │           ├── page.tsx
│       │           ├── integrations/page.tsx
│       │           ├── notifications/page.tsx
│       │           └── members/page.tsx
│       │
│       ├── components/
│       │   ├── ui/                    # shadcn/ui base components
│       │   │
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx        # Module-aware sidebar
│       │   │   ├── TopBar.tsx
│       │   │   ├── WorkspaceSwitcher.tsx
│       │   │   └── ModuleBadge.tsx    # "Memory" / "AutoFix" tag
│       │   │
│       │   ├── dashboard/
│       │   │   ├── UnifiedStats.tsx   # Stats from both modules
│       │   │   ├── ActivityFeed.tsx   # Combined timeline
│       │   │   └── QuickAskWidget.tsx # Inline Q&A on dashboard
│       │   │
│       │   ├── memory/
│       │   │   ├── ChatInput.tsx
│       │   │   ├── AnswerCard.tsx
│       │   │   ├── SourceBadge.tsx
│       │   │   ├── QueryHistory.tsx
│       │   │   ├── TaskCard.tsx
│       │   │   ├── TaskBoard.tsx
│       │   │   ├── JiraSyncButton.tsx
│       │   │   ├── SourceCard.tsx
│       │   │   ├── SourceList.tsx
│       │   │   └── UploadDropzone.tsx
│       │   │
│       │   ├── autofix/
│       │   │   ├── IncidentCard.tsx
│       │   │   ├── IncidentList.tsx
│       │   │   ├── SeverityBadge.tsx
│       │   │   ├── StatusBadge.tsx
│       │   │   ├── PipelineProgress.tsx  # Live step tracker
│       │   │   ├── DiffViewer.tsx        # react-diff-viewer-continued
│       │   │   ├── SafetyBadge.tsx
│       │   │   ├── SanitizationReport.tsx
│       │   │   └── ApproveFixButton.tsx
│       │   │
│       │   └── nexus/
│       │       └── MemoryContextPanel.tsx # Shows memory enrichment in incident
│       │
│       ├── hooks/
│       │   ├── useWorkspace.ts
│       │   ├── useMemoryQuery.ts      # Q&A with loading state
│       │   ├── useTasks.ts
│       │   ├── useIncident.ts
│       │   ├── usePipelineStatus.ts   # Polling for pipeline progress
│       │   └── useDashboard.ts
│       │
│       ├── lib/
│       │   ├── api.ts                 # Axios instance with JWT interceptor
│       │   ├── auth.ts                # NextAuth config
│       │   └── utils.ts               # cn(), formatDate(), formatMTTR()
│       │
│       ├── store/
│       │   ├── workspaceStore.ts
│       │   └── moduleStore.ts         # Active module: 'memory' | 'autofix'
│       │
│       └── types/
│           ├── workspace.ts
│           ├── memory.ts              # Source, Chunk, Task, QueryResult
│           ├── autofix.ts             # Incident, Fix, SafetyReport, Revert
│           └── nexus.ts               # MemoryContext, ActivityItem, DashboardStats
│
└── backend/                           # FastAPI Python
    ├── requirements.txt
    ├── Dockerfile
    ├── alembic.ini
    ├── alembic/versions/
    └── app/
        ├── main.py
        ├── config.py
        ├── database.py
        ├── dependencies.py
        ├── routers/
        │   ├── auth.py
        │   ├── workspace.py
        │   ├── webhooks.py
        │   ├── memory/
        │   │   ├── ingest.py
        │   │   ├── query.py
        │   │   ├── tasks.py
        │   │   └── problems.py
        │   └── autofix/
        │       ├── repos.py
        │       ├── incidents.py
        │       ├── fixes.py
        │       └── revert.py
        ├── services/
        │   ├── memory/
        │   │   ├── ingestion_service.py
        │   │   ├── transcription_service.py
        │   │   ├── chunking_service.py
        │   │   ├── embedding_service.py
        │   │   ├── rag_service.py
        │   │   ├── task_detection_service.py
        │   │   ├── problem_detection_service.py
        │   │   └── jira_service.py
        │   ├── autofix/
        │   │   ├── sanitization_service.py
        │   │   ├── analysis_service.py
        │   │   ├── fix_generation_service.py
        │   │   ├── safety_check_service.py
        │   │   ├── pr_service.py
        │   │   └── revert_service.py
        │   └── nexus/
        │       ├── memory_enrichment_service.py
        │       ├── notification_service.py
        │       └── dashboard_service.py
        ├── models/
        ├── schemas/
        ├── workers/
        │   ├── celery_app.py
        │   ├── memory_worker.py
        │   └── autofix_worker.py
        ├── integrations/
        │   ├── telegram_bot.py
        │   ├── github_client.py
        │   ├── anthropic_client.py
        │   ├── whisper_client.py
        │   ├── jira_client.py
        │   ├── vercel_client.py
        │   └── railway_client.py
        └── utils/
            ├── chunker.py
            ├── text_extractor.py
            ├── sanitizer.py
            ├── stack_trace_parser.py
            ├── diff_utils.py
            ├── safety_checker.py
            └── prompt_builder.py
```

---

## 2. Key Frontend Files

### `src/app/(dashboard)/layout.tsx`
Renders sidebar with two sections:
- **Memory** section: Ask, Sources, Tasks, Problems
- **AutoFix** section: Incidents, Repos

### `src/components/nexus/MemoryContextPanel.tsx`
The most important cross-module component — rendered inside the incident detail page.
```tsx
interface MemoryContextPanelProps {
  context: MemoryContext | null;
  loading: boolean;
}

export function MemoryContextPanel({ context, loading }: MemoryContextPanelProps) {
  if (loading) return <SkeletonPanel />;
  if (!context?.found) return (
    <EmptyPanel message="No related team discussions found" />
  );
  
  return (
    <div className="nexus-panel">
      <div className="nexus-panel-header">
        <BrainIcon /> Team Memory Context
        <Badge variant="nexus">NexusOps</Badge>
      </div>
      <p className="nexus-summary">{context.summary}</p>
      {context.chunks.map((chunk, i) => (
        <div key={i} className="memory-chunk">
          <span className="chunk-source">{chunk.source}</span>
          <p className="chunk-text">"{chunk.text}"</p>
        </div>
      ))}
    </div>
  );
}
```

### `src/hooks/usePipelineStatus.ts`
```typescript
export function usePipelineStatus(incidentId: string) {
  const [incident, setIncident] = useState<Incident | null>(null);
  
  const TERMINAL = ['pr_created', 'fix_blocked', 'failed', 'resolved', 'dismissed'];
  
  useEffect(() => {
    if (incident && TERMINAL.includes(incident.status)) return;
    const interval = setInterval(async () => {
      const data = await api.get(`/autofix/incidents/${incidentId}`);
      setIncident(data);
      if (TERMINAL.includes(data.status)) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [incidentId, incident?.status]);
  
  return incident;
}
```

### `src/store/workspaceStore.ts`
```typescript
interface WorkspaceStore {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (ws: Workspace) => void;
  activeModule: 'memory' | 'autofix' | 'nexus';
  setActiveModule: (module: 'memory' | 'autofix' | 'nexus') => void;
}
```

---

## 3. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Python modules | snake_case | `rag_service.py` |
| Python classes | PascalCase | `RAGService`, `SanitizationService` |
| TypeScript components | PascalCase | `MemoryContextPanel.tsx` |
| TypeScript hooks | camelCase + use prefix | `usePipelineStatus.ts` |
| DB tables | snake_case, plural | `document_chunks`, `revert_events` |
| DB columns | snake_case | `workspace_id`, `safety_score` |
| API routes | kebab-case | `/memory/query`, `/autofix/incidents` |
| Env vars | SCREAMING_SNAKE | `ANTHROPIC_API_KEY` |

---

## 4. pip Requirements

```txt
fastapi==0.110.0
uvicorn[standard]==0.27.0
sqlalchemy[asyncio]==2.0.25
asyncpg==0.29.0
alembic==1.13.1
celery==5.3.6
redis==5.0.1
anthropic==0.18.0
openai==1.12.0
PyGithub==2.2.0
python-telegram-bot==20.8
httpx==0.26.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic-settings==2.1.0
python-multipart==0.0.9
pdfplumber==0.10.3
python-docx==1.1.0
nltk==3.8.1
boto3==1.34.0          # for Cloudflare R2 (S3-compatible)
pgvector==0.2.4
cryptography==42.0.0
```

## 5. npm Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-tooltip": "latest",
    "shadcn-ui": "latest",
    "lucide-react": "latest",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "next-auth": "^4.24.0",
    "react-diff-viewer-continued": "^4.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "framer-motion": "^11.0.0",
    "date-fns": "^3.3.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```
