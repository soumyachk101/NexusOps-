"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 bg-bg-base/80 backdrop-blur-md border-t border-border-faint p-4">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="flex-1 bg-bg-surface border border-border-default rounded-xl overflow-hidden focus-within:border-memory-primary transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your team's decisions, tasks, or history..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none outline-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
            value.trim() && !disabled
              ? "bg-memory-primary text-bg-base hover:bg-memory-hover"
              : "bg-bg-elevated text-text-muted cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-2xs text-text-muted text-center mt-2">
        Press <kbd className="px-1 py-0.5 bg-bg-elevated rounded text-text-secondary font-mono">Ctrl + Enter</kbd> to send
      </p>
    </div>
  );
}
