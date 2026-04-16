// ====== WORKSPACE ======
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// ====== MEMORY ENGINE ======
export interface Source {
  id: string;
  type: "telegram" | "voice" | "document" | "manual";
  name: string;
  status: "active" | "syncing" | "error";
  messages_count: number;
  last_synced: string;
}

export interface DocumentChunk {
  id: string;
  text: string;
  source: string;
  source_type: string;
  author?: string;
  timestamp: string;
  similarity_score?: number;
}

export interface QueryResult {
  answer: string;
  sources: DocumentChunk[];
  confidence: number;
  query_time_ms: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  priority: "high" | "medium" | "low";
  status: "detected" | "confirmed" | "synced_to_jira" | "dismissed";
  source_message: string;
  detected_at: string;
  jira_key?: string;
}

// ====== AUTOFIX ENGINE ======
export type IncidentStatus =
  | "received"
  | "sanitizing"
  | "fetching_code"
  | "analyzing"
  | "querying_memory"
  | "generating_fix"
  | "safety_check"
  | "creating_pr"
  | "pr_created"
  | "fix_blocked"
  | "failed"
  | "resolved"
  | "dismissed";

export type Severity = "critical" | "high" | "medium" | "low";

export interface Incident {
  id: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  repo_full_name: string;
  branch: string;
  severity: Severity;
  status: IncidentStatus;
  source: "sentry" | "webhook" | "manual";
  received_at: string;
  resolved_at?: string;
  pr_url?: string;
  mttr_seconds?: number;
  root_cause_analysis?: string;
  sanitization_report?: string;
  safety_score?: number;
  safety_report?: string;
  fix_diff?: string;
  memory_context?: MemoryContext;
}

export interface MemoryContext {
  found: boolean;
  summary: string;
  chunks: DocumentChunk[];
}

// ====== DASHBOARD ======
export interface DashboardStats {
  nexus: {
    queries_today: number;
    active_incidents: number;
    prs_created: number;
    memory_items: number;
  };
  memory: {
    messages_indexed: number;
    tasks_detected: number;
    decisions_logged: number;
    avg_answer_time_ms: number;
  };
  autofix: {
    total_incidents: number;
    avg_mttr_seconds: number;
    auto_reverts: number;
    safety_blocks: number;
  };
}

export interface ActivityItem {
  id: string;
  type: "memory_query" | "incident_received" | "pr_created" | "task_detected" | "memory_enrichment";
  module: "memory" | "autofix" | "nexus";
  title: string;
  description: string;
  timestamp: string;
}
