"use client";

import { create } from "zustand";

type ActiveModule = "memory" | "autofix" | "nexus";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceStore {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  setCurrentWorkspace: (ws: Workspace) => void;
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  currentWorkspace: {
    id: "ws-1",
    name: "NexusOps Engineering",
    slug: "nexusops-eng",
  },
  workspaces: [
    { id: "ws-1", name: "NexusOps Engineering", slug: "nexusops-eng" },
    { id: "ws-2", name: "Frontend Team", slug: "frontend-team" },
  ],
  setCurrentWorkspace: (ws) => set({ currentWorkspace: ws }),
  activeModule: "nexus",
  setActiveModule: (module) => set({ activeModule: module }),
}));
