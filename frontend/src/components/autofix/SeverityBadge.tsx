"use client";

import { cn } from "@/lib/utils";
import { Severity } from "@/lib/types";

const severityConfig: Record<
  Severity,
  { label: string; color: string; bg: string; border: string }
> = {
  critical: {
    label: "CRITICAL",
    color: "text-sev-critical",
    bg: "bg-sev-critical-bg",
    border: "border-sev-critical-border",
  },
  high: {
    label: "HIGH",
    color: "text-sev-high",
    bg: "bg-sev-high-bg",
    border: "border-sev-high-border",
  },
  medium: {
    label: "MEDIUM",
    color: "text-sev-medium",
    bg: "bg-sev-medium-bg",
    border: "border-sev-medium-border",
  },
  low: {
    label: "LOW",
    color: "text-sev-low",
    bg: "bg-sev-low-bg",
    border: "border-sev-low-border",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono font-semibold uppercase tracking-wider border",
        config.color,
        config.bg,
        config.border
      )}
    >
      {config.label}
    </span>
  );
}
