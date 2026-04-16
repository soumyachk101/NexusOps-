"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Code2,
  Search,
  Brain,
  Wand2,
  Shield,
  GitPullRequest,
  Check,
  X,
  Circle,
  Loader2,
} from "lucide-react";
import { IncidentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PipelineStep {
  key: string;
  label: string;
  icon: React.ElementType;
  accentOverride?: string;
}

const pipelineSteps: PipelineStep[] = [
  { key: "sanitizing", label: "Sanitizing Data", icon: ShieldCheck },
  { key: "fetching_code", label: "Fetching Code", icon: Code2 },
  { key: "analyzing", label: "Analyzing Root Cause", icon: Search },
  { key: "querying_memory", label: "Querying Team Memory", icon: Brain, accentOverride: "nexus" },
  { key: "generating_fix", label: "Generating Fix", icon: Wand2 },
  { key: "safety_check", label: "Safety Check", icon: Shield },
  { key: "creating_pr", label: "Creating Draft PR", icon: GitPullRequest },
];

const statusOrder: IncidentStatus[] = [
  "received",
  "sanitizing",
  "fetching_code",
  "analyzing",
  "querying_memory",
  "generating_fix",
  "safety_check",
  "creating_pr",
  "pr_created",
];

function getStepState(
  stepKey: string,
  currentStatus: IncidentStatus
): "pending" | "active" | "done" | "failed" {
  if (currentStatus === "failed") {
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepKey as IncidentStatus);
    if (stepIdx < currentIdx) return "done";
    if (stepKey === currentStatus) return "failed";
    return "pending";
  }

  const currentIdx = statusOrder.indexOf(currentStatus);
  const stepIdx = statusOrder.indexOf(stepKey as IncidentStatus);

  if (stepIdx < 0) return "pending";
  if (currentStatus === "pr_created" || currentStatus === "resolved") return "done";
  if (currentIdx < 0) return "pending";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

interface PipelineProgressProps {
  status: IncidentStatus;
}

export function PipelineProgress({ status }: PipelineProgressProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
        Pipeline Progress
      </h3>
      <div className="space-y-0">
        {pipelineSteps.map((step, index) => {
          const state = getStepState(step.key, status);
          const isNexus = step.accentOverride === "nexus";

          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              {/* Connecting line */}
              {index < pipelineSteps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[13px] top-[28px] w-[2px] h-[calc(100%-4px)]",
                    state === "done"
                      ? "bg-status-success/30"
                      : "bg-border-faint"
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
                  state === "pending" && "border-2 border-dashed border-border-default bg-bg-base",
                  state === "active" && !isNexus && "bg-autofix-primary/20 border-2 border-autofix-primary animate-step-glow",
                  state === "active" && isNexus && "bg-nexus-primary/20 border-2 border-nexus-primary",
                  state === "done" && "bg-status-success/20 border-2 border-status-success",
                  state === "failed" && "bg-status-error/20 border-2 border-status-error"
                )}
              >
                {state === "pending" && (
                  <Circle className="w-3 h-3 text-text-muted" />
                )}
                {state === "active" && (
                  <Loader2
                    className={cn(
                      "w-3.5 h-3.5 animate-spin",
                      isNexus ? "text-nexus-primary" : "text-autofix-primary"
                    )}
                  />
                )}
                {state === "done" && (
                  <Check className="w-3.5 h-3.5 text-status-success" />
                )}
                {state === "failed" && (
                  <X className="w-3.5 h-3.5 text-status-error" />
                )}
              </div>

              {/* Label */}
              <div className="py-1.5 pb-4">
                <span
                  className={cn(
                    "text-sm transition-colors",
                    state === "pending" && "text-text-muted",
                    state === "active" && !isNexus && "text-autofix-primary font-medium",
                    state === "active" && isNexus && "text-nexus-primary font-medium",
                    state === "done" && "text-text-secondary",
                    state === "failed" && "text-status-error"
                  )}
                >
                  {step.label}
                </span>
                {state === "active" && isNexus && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xs text-nexus-primary/70 font-mono mt-0.5"
                  >
                    NexusOps Integration
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
