"use client";

import { cn } from "@/lib/utils";
import { IncidentStatus } from "@/lib/types";
import { Loader2 } from "lucide-react";

const statusConfig: Record<
  IncidentStatus,
  { label: string; color: string; bg: string; spin?: boolean; pulse?: boolean; faded?: boolean }
> = {
  received: { label: "Received", color: "text-status-neutral", bg: "bg-status-neutral/10" },
  sanitizing: { label: "Sanitizing", color: "text-status-neutral", bg: "bg-status-neutral/10" },
  fetching_code: { label: "Fetching Code", color: "text-status-neutral", bg: "bg-status-neutral/10" },
  analyzing: { label: "Analyzing", color: "text-autofix-primary", bg: "bg-autofix-muted", spin: true },
  querying_memory: { label: "Querying Memory", color: "text-nexus-primary", bg: "bg-nexus-muted", spin: true },
  generating_fix: { label: "Generating Fix", color: "text-autofix-primary", bg: "bg-autofix-muted", spin: true },
  safety_check: { label: "Safety Check", color: "text-autofix-primary", bg: "bg-autofix-muted", spin: true },
  creating_pr: { label: "Creating PR", color: "text-memory-primary", bg: "bg-memory-muted", pulse: true },
  pr_created: { label: "PR Created", color: "text-status-success", bg: "bg-sev-low-bg" },
  fix_blocked: { label: "Blocked", color: "text-sev-critical", bg: "bg-sev-critical-bg" },
  failed: { label: "Failed", color: "text-status-error", bg: "bg-sev-critical-bg" },
  resolved: { label: "Resolved", color: "text-status-success", bg: "bg-sev-low-bg", faded: true },
  dismissed: { label: "Dismissed", color: "text-status-neutral", bg: "bg-status-neutral/10", faded: true },
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-medium transition-all",
        config.color,
        config.bg,
        config.faded && "opacity-60"
      )}
    >
      {config.spin && <Loader2 className="w-3 h-3 animate-spin" />}
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-memory-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-memory-primary" />
        </span>
      )}
      {config.label}
    </span>
  );
}
