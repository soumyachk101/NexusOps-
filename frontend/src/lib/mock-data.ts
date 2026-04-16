import {
  DashboardStats,
  ActivityItem,
  Incident,
  QueryResult,
  Task,
  Source,
} from "./types";

// ====== MOCK DASHBOARD STATS ======
export const mockDashboardStats: DashboardStats = {
  nexus: {
    queries_today: 47,
    active_incidents: 3,
    prs_created: 12,
    memory_items: 8432,
  },
  memory: {
    messages_indexed: 24589,
    tasks_detected: 156,
    decisions_logged: 89,
    avg_answer_time_ms: 1240,
  },
  autofix: {
    total_incidents: 234,
    avg_mttr_seconds: 342,
    auto_reverts: 5,
    safety_blocks: 18,
  },
};

// ====== MOCK ACTIVITY FEED ======
export const mockActivityFeed: ActivityItem[] = [
  {
    id: "act-1",
    type: "incident_received",
    module: "autofix",
    title: "Critical: TypeError in auth middleware",
    description: "owner/api-gateway · main branch",
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: "act-2",
    type: "memory_enrichment",
    module: "nexus",
    title: "Memory context injected into incident #INC-047",
    description: "Found 3 related team discussions about auth module",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: "act-3",
    type: "memory_query",
    module: "memory",
    title: '"What was decided about the caching strategy?"',
    description: "Answered with 4 sources · 92% confidence",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "act-4",
    type: "pr_created",
    module: "autofix",
    title: "Draft PR opened for NullPointerException fix",
    description: "owner/payment-service · fix/a3b2c1d4",
    timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
  },
  {
    id: "act-5",
    type: "task_detected",
    module: "memory",
    title: "New task detected: Migrate Redis to cluster mode",
    description: "From Telegram message by Rahul · High priority",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "act-6",
    type: "memory_query",
    module: "memory",
    title: '"Who set up the CI/CD pipeline for staging?"',
    description: "Answered with 2 sources · 87% confidence",
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "act-7",
    type: "incident_received",
    module: "autofix",
    title: "High: Connection pool exhausted",
    description: "owner/user-service · production",
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "act-8",
    type: "memory_enrichment",
    module: "nexus",
    title: "Memory context found for connection issue",
    description: "Team discussed pool limits in Dec 2024 standup",
    timestamp: new Date(Date.now() - 91 * 60000).toISOString(),
  },
];

// ====== MOCK INCIDENTS ======
export const mockIncidents: Incident[] = [
  {
    id: "inc-001",
    error_type: "TypeError",
    error_message: "Cannot read property 'id' of undefined",
    stack_trace: `TypeError: Cannot read property 'id' of undefined
    at AuthMiddleware.handle (/src/middleware/auth.ts:42:18)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
    at Router.dispatch (/src/routes/index.ts:15:7)`,
    repo_full_name: "nexusops/api-gateway",
    branch: "main",
    severity: "critical",
    status: "analyzing",
    source: "sentry",
    received_at: new Date(Date.now() - 3 * 60000).toISOString(),
    root_cause_analysis:
      "The `user` object passed to `AuthMiddleware.handle()` can be `null` when the session expires mid-request. The code at line 42 accesses `user.id` without a null check. This is a race condition between session validation and request processing.",
    memory_context: {
      found: true,
      summary:
        "The team previously discussed this auth module issue in January 2025, noting that the user object can be null when sessions expire. A guard clause was suggested but never implemented.",
      chunks: [
        {
          id: "chunk-1",
          text: "the auth middleware will crash if user object is null — we should add a guard before accessing any properties",
          source: "telegram",
          source_type: "telegram",
          author: "Rahul",
          timestamp: "2025-01-15T10:32:14Z",
          similarity_score: 0.94,
        },
        {
          id: "chunk-2",
          text: "we discussed adding optional chaining to all auth-related middleware as a safety measure, but it got deprioritized",
          source: "telegram",
          source_type: "telegram",
          author: "Priya",
          timestamp: "2025-01-16T14:21:08Z",
          similarity_score: 0.87,
        },
      ],
    },
  },
  {
    id: "inc-002",
    error_type: "NullPointerException",
    error_message: "Null reference in PaymentProcessor.charge()",
    repo_full_name: "nexusops/payment-service",
    branch: "main",
    severity: "high",
    status: "pr_created",
    source: "sentry",
    received_at: new Date(Date.now() - 22 * 60000).toISOString(),
    resolved_at: new Date(Date.now() - 10 * 60000).toISOString(),
    pr_url: "https://github.com/nexusops/payment-service/pull/142",
    mttr_seconds: 720,
    safety_score: 0.92,
  },
  {
    id: "inc-003",
    error_type: "ConnectionError",
    error_message: "Connection pool exhausted — max connections reached",
    repo_full_name: "nexusops/user-service",
    branch: "production",
    severity: "high",
    status: "generating_fix",
    source: "webhook",
    received_at: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "inc-004",
    error_type: "ValidationError",
    error_message: "Invalid email format in registration handler",
    repo_full_name: "nexusops/auth-service",
    branch: "main",
    severity: "medium",
    status: "resolved",
    source: "sentry",
    received_at: new Date(Date.now() - 180 * 60000).toISOString(),
    resolved_at: new Date(Date.now() - 160 * 60000).toISOString(),
    pr_url: "https://github.com/nexusops/auth-service/pull/89",
    mttr_seconds: 1200,
    safety_score: 0.98,
  },
  {
    id: "inc-005",
    error_type: "DeprecationWarning",
    error_message: "Buffer() is deprecated, use Buffer.alloc() instead",
    repo_full_name: "nexusops/file-service",
    branch: "develop",
    severity: "low",
    status: "dismissed",
    source: "manual",
    received_at: new Date(Date.now() - 360 * 60000).toISOString(),
  },
];

// ====== MOCK CHAT HISTORY ======
export const mockChatMessages: Array<{
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: QueryResult["sources"];
  confidence?: number;
  timestamp: string;
}> = [
  {
    id: "msg-1",
    role: "user",
    content: "What was the team's decision about the caching strategy for the user service?",
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "Based on team discussions from January 2025, the team decided to implement a **multi-layer caching strategy** for the user service:\n\n1. **L1 Cache (In-memory)**: Using Redis with a 5-minute TTL for frequently accessed user profiles.\n2. **L2 Cache (CDN)**: Cloudflare for static user assets like avatars.\n3. **Cache Invalidation**: Event-driven invalidation via pub/sub whenever user data is updated.\n\nRahul proposed this architecture during the Jan 12 standup, and Priya confirmed the Redis cluster setup was completed on Jan 18.",
    sources: [
      {
        id: "s1",
        text: "For user service caching, let's go with Redis L1 + CDN L2 with event-driven invalidation",
        source: "telegram",
        source_type: "telegram",
        author: "Rahul",
        timestamp: "2025-01-12T10:15:00Z",
        similarity_score: 0.96,
      },
      {
        id: "s2",
        text: "Redis cluster is set up for the user cache. Using 5-min TTL for profile data.",
        source: "telegram",
        source_type: "telegram",
        author: "Priya",
        timestamp: "2025-01-18T14:30:00Z",
        similarity_score: 0.91,
      },
      {
        id: "s3",
        text: "Cache invalidation will be handled via our existing pub/sub system — no new infra needed",
        source: "document",
        source_type: "document",
        author: "Rahul",
        timestamp: "2025-01-12T10:25:00Z",
        similarity_score: 0.88,
      },
    ],
    confidence: 0.94,
    timestamp: new Date(Date.now() - 19 * 60000).toISOString(),
  },
];

// ====== MOCK SOURCES ======
export const mockSources: Source[] = [
  {
    id: "src-1",
    type: "telegram",
    name: "Engineering Team Chat",
    status: "active",
    messages_count: 18432,
    last_synced: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "src-2",
    type: "voice",
    name: "Daily Standups (Transcribed)",
    status: "active",
    messages_count: 342,
    last_synced: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "src-3",
    type: "document",
    name: "Architecture Docs",
    status: "syncing",
    messages_count: 89,
    last_synced: new Date(Date.now() - 10 * 60000).toISOString(),
  },
];

// ====== MOCK TASKS ======
export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Migrate Redis to cluster mode",
    description: "Current single-node Redis is hitting memory limits. Need to migrate to cluster mode for horizontal scaling.",
    assignee: "Rahul",
    priority: "high",
    status: "detected",
    source_message: "we really need to move redis to cluster mode this week, the single node is almost out of memory",
    detected_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "task-2",
    title: "Add rate limiting to public API endpoints",
    description: "Several public endpoints lack rate limiting, potential DDoS vector.",
    assignee: "Priya",
    priority: "high",
    status: "confirmed",
    source_message: "someone should add rate limiting to the public API — we're getting hammered with requests",
    detected_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: "task-3",
    title: "Update Node.js version to 20 LTS",
    description: "Currently on Node 18, should upgrade to 20 LTS for performance improvements.",
    priority: "medium",
    status: "synced_to_jira",
    source_message: "let's upgrade to node 20 when we get a chance, there are some nice perf wins",
    detected_at: new Date(Date.now() - 300 * 60000).toISOString(),
    jira_key: "NX-145",
  },
];
