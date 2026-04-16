"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DocumentChunk } from "@/lib/types";

interface SourceBadgeProps {
  chunk: DocumentChunk;
}

export function SourceBadge({ chunk }: SourceBadgeProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-2xs font-mono shrink-0",
        "bg-memory-tag-bg border border-memory-tag-border",
        "hover:border-memory-primary hover:text-memory-primary transition-all duration-150",
        "text-text-secondary"
      )}
    >
      <span>{chunk.source_type}</span>
      <span className="text-text-muted">·</span>
      <span>{format(new Date(chunk.timestamp), "dd MMM")}</span>
      {chunk.author && (
        <>
          <span className="text-text-muted">·</span>
          <span>{chunk.author}</span>
        </>
      )}
    </button>
  );
}
