"use client";

import { motion } from "framer-motion";
import { AlertTriangle, MessageCircle } from "lucide-react";

const mockProblems = [
  {
    id: "prob-1",
    title: "Redis single-node approaching memory limit",
    severity: "high" as const,
    mentions: 4,
    first_mentioned: "2025-01-10T09:00:00Z",
    latest_mention: new Date(Date.now() - 2 * 3600000).toISOString(),
    summary: "Multiple team members have flagged that the Redis instance is running near capacity. Migration to cluster mode has been discussed but not actioned.",
  },
  {
    id: "prob-2",
    title: "Missing rate limiting on public API",
    severity: "high" as const,
    mentions: 3,
    first_mentioned: "2025-01-05T14:00:00Z",
    latest_mention: new Date(Date.now() - 24 * 3600000).toISOString(),
    summary: "Several public-facing endpoints lack rate limiting, creating a potential attack vector. Implementation has been deferred twice.",
  },
  {
    id: "prob-3",
    title: "Flaky integration tests in CI",
    severity: "medium" as const,
    mentions: 6,
    first_mentioned: "2024-12-20T10:00:00Z",
    latest_mention: new Date(Date.now() - 48 * 3600000).toISOString(),
    summary: "CI pipeline intermittently fails due to timing-dependent integration tests. Team has discussed adding retries or refactoring test setup.",
  },
];

const severityColors = {
  high: "border-l-sev-high text-sev-high",
  medium: "border-l-sev-medium text-sev-medium",
  low: "border-l-sev-low text-sev-low",
};

export default function MemoryProblemsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Detected Problems
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Recurring issues identified across team discussions
        </p>
      </div>

      <div className="space-y-3">
        {mockProblems.map((problem, index) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-bg-surface border border-border-faint rounded-xl p-5 border-l-4 ${severityColors[problem.severity].split(" ")[0]}`}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${severityColors[problem.severity].split(" ")[1]}`} />
                <h3 className="text-sm font-medium text-text-primary">{problem.title}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-2xs text-text-muted shrink-0">
                <MessageCircle className="w-3 h-3" />
                {problem.mentions} mentions
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed ml-6">
              {problem.summary}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
