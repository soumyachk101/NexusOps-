"use client";

import { motion } from "framer-motion";
import { mockSources } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Mic,
  FileText,
  Edit3,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  telegram: MessageCircle,
  voice: Mic,
  document: FileText,
  manual: Edit3,
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  active: { icon: CheckCircle, color: "text-status-success", label: "Active" },
  syncing: { icon: Loader2, color: "text-autofix-primary", label: "Syncing" },
  error: { icon: AlertCircle, color: "text-status-error", label: "Error" },
};

export default function MemorySourcesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Sources
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Connected data sources feeding into team memory
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-memory-primary text-bg-base rounded-lg text-sm font-medium hover:bg-memory-hover transition-colors">
          <Upload className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSources.map((source, index) => {
          const TypeIcon = typeIcons[source.type] || FileText;
          const status = statusConfig[source.status];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-bg-surface border border-border-faint rounded-xl p-5 hover:border-memory-border transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-memory-muted border border-memory-border flex items-center justify-center">
                  <TypeIcon className="w-5 h-5 text-memory-primary" />
                </div>
                <div className={cn("flex items-center gap-1.5", status.color)}>
                  <StatusIcon className={cn("w-3.5 h-3.5", source.status === "syncing" && "animate-spin")} />
                  <span className="text-2xs font-medium">{status.label}</span>
                </div>
              </div>

              <h3 className="text-sm font-medium text-text-primary group-hover:text-memory-primary transition-colors">
                {source.name}
              </h3>

              <div className="mt-3 flex items-center justify-between text-2xs text-text-muted">
                <span className="font-mono">
                  {source.messages_count.toLocaleString()} items
                </span>
                <span className="font-mono">
                  Synced {formatRelativeTime(source.last_synced)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-memory-primary/40 rounded-full" style={{ width: "100%" }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
