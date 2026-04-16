"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-nexus-primary animate-pulse-dot" />
        <span className="text-sm text-text-muted">Loading NexusOps...</span>
      </div>
    </div>
  );
}
