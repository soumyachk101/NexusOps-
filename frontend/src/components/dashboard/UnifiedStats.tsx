"use client";

import { motion } from "framer-motion";
import { DashboardStats } from "@/lib/types";
import { formatMTTR } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  barColor: string;
  delay: number;
}

function StatCard({ label, value, barColor, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-bg-surface border border-border-faint rounded-xl p-5 relative overflow-hidden group hover:border-border-default transition-colors"
    >
      <div className="relative z-10">
        <p className="text-3xl font-light text-text-primary tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-2xs uppercase tracking-wider text-text-secondary mt-1.5 font-medium">
          {label}
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: barColor }}
      />
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{
          background: `radial-gradient(ellipse at bottom, ${barColor}10, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}

interface UnifiedStatsProps {
  stats: DashboardStats;
}

export function UnifiedStats({ stats }: UnifiedStatsProps) {
  return (
    <div className="space-y-8">
      {/* NexusOps Overview */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-nexus-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-nexus-primary">
            NexusOps Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Today's Queries" value={stats.nexus.queries_today} barColor="#8b5cf6" delay={0} />
          <StatCard label="Active Incidents" value={stats.nexus.active_incidents} barColor="#8b5cf6" delay={0.05} />
          <StatCard label="PRs Created" value={stats.nexus.prs_created} barColor="#8b5cf6" delay={0.1} />
          <StatCard label="Memory Items" value={stats.nexus.memory_items} barColor="#8b5cf6" delay={0.15} />
        </div>
      </section>

      {/* Memory Engine Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-memory-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-memory-primary">
            Memory Engine
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Messages Indexed" value={stats.memory.messages_indexed} barColor="#22d3ee" delay={0.2} />
          <StatCard label="Tasks Detected" value={stats.memory.tasks_detected} barColor="#22d3ee" delay={0.25} />
          <StatCard label="Decisions Logged" value={stats.memory.decisions_logged} barColor="#22d3ee" delay={0.3} />
          <StatCard label="Avg Answer Time" value={`${(stats.memory.avg_answer_time_ms / 1000).toFixed(1)}s`} barColor="#22d3ee" delay={0.35} />
        </div>
      </section>

      {/* AutoFix Engine Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-autofix-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-autofix-primary">
            AutoFix Engine
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Incidents" value={stats.autofix.total_incidents} barColor="#f59e0b" delay={0.4} />
          <StatCard label="Avg MTTR" value={formatMTTR(stats.autofix.avg_mttr_seconds)} barColor="#f59e0b" delay={0.45} />
          <StatCard label="Auto Reverts" value={stats.autofix.auto_reverts} barColor="#f59e0b" delay={0.5} />
          <StatCard label="Safety Blocks" value={stats.autofix.safety_blocks} barColor="#f59e0b" delay={0.55} />
        </div>
      </section>
    </div>
  );
}
