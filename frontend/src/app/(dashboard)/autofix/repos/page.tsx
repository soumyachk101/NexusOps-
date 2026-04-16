"use client";

import { motion } from "framer-motion";
import { GitBranch, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const mockRepos = [
  {
    id: "repo-1",
    full_name: "nexusops/api-gateway",
    default_branch: "main",
    language: "TypeScript",
    incidents_count: 12,
    sentry_connected: true,
    webhook_active: true,
  },
  {
    id: "repo-2",
    full_name: "nexusops/payment-service",
    default_branch: "main",
    language: "Python",
    incidents_count: 8,
    sentry_connected: true,
    webhook_active: true,
  },
  {
    id: "repo-3",
    full_name: "nexusops/user-service",
    default_branch: "production",
    language: "TypeScript",
    incidents_count: 5,
    sentry_connected: true,
    webhook_active: false,
  },
  {
    id: "repo-4",
    full_name: "nexusops/auth-service",
    default_branch: "main",
    language: "Go",
    incidents_count: 3,
    sentry_connected: false,
    webhook_active: true,
  },
];

const langColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  Python: "bg-yellow-500",
  Go: "bg-cyan-500",
  JavaScript: "bg-yellow-400",
  Rust: "bg-orange-500",
};

export default function ReposPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Repositories
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Connected repositories monitored by AutoFix
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockRepos.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-bg-surface border border-border-faint rounded-xl p-5 hover:border-autofix-border transition-all group cursor-pointer"
          >
            {/* Repo name */}
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-mono font-medium text-text-primary group-hover:text-autofix-primary transition-colors">
                {repo.full_name}
              </span>
            </div>

            {/* Language + Branch */}
            <div className="flex items-center gap-3 mb-4 text-2xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-full", langColors[repo.language] || "bg-gray-500")} />
                {repo.language}
              </div>
              <span className="font-mono">{repo.default_branch}</span>
              <span className="font-mono">{repo.incidents_count} incidents</span>
            </div>

            {/* Integration status */}
            <div className="flex items-center gap-4 text-2xs">
              <div className={cn("flex items-center gap-1", repo.sentry_connected ? "text-status-success" : "text-text-muted")}>
                {repo.sentry_connected ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Sentry
              </div>
              <div className={cn("flex items-center gap-1", repo.webhook_active ? "text-status-success" : "text-text-muted")}>
                {repo.webhook_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Webhook
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
