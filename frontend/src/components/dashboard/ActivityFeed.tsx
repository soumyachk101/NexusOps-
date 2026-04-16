"use client";

import { motion } from "framer-motion";
import {
  Search,
  AlertCircle,
  GitPullRequest,
  CheckSquare,
  Brain,
} from "lucide-react";
import { ActivityItem } from "@/lib/types";
import { formatRelativeTime, cn } from "@/lib/utils";

const moduleConfig = {
  memory: {
    color: "text-memory-primary",
    bg: "bg-memory-muted",
    border: "border-memory-border",
    dotColor: "bg-memory-primary",
  },
  autofix: {
    color: "text-autofix-primary",
    bg: "bg-autofix-muted",
    border: "border-autofix-border",
    dotColor: "bg-autofix-primary",
  },
  nexus: {
    color: "text-nexus-primary",
    bg: "bg-nexus-muted",
    border: "border-nexus-border",
    dotColor: "bg-nexus-primary",
  },
};

const typeIcons: Record<ActivityItem["type"], React.ElementType> = {
  memory_query: Search,
  incident_received: AlertCircle,
  pr_created: GitPullRequest,
  task_detected: CheckSquare,
  memory_enrichment: Brain,
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-1">
      {items.map((item, index) => {
        const config = moduleConfig[item.module];
        const Icon = typeIcons[item.type];

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer group"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                config.bg
              )}
            >
              <Icon className={cn("w-4 h-4", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate group-hover:text-white transition-colors">
                {item.title}
              </p>
              <p className="text-2xs text-text-muted mt-0.5 truncate">
                {item.description}
              </p>
            </div>

            {/* Time + Module dot */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
              <span className="text-2xs text-text-muted font-mono whitespace-nowrap">
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
