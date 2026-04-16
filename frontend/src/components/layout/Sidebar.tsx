"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FolderOpen,
  CheckSquare,
  AlertTriangle,
  AlertCircle,
  GitBranch,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,

  LayoutDashboard,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspaceStore";


const memoryNavItems = [
  { label: "Ask", href: "/memory/ask", icon: Search },
  { label: "Sources", href: "/memory/sources", icon: FolderOpen },
  { label: "Tasks", href: "/memory/tasks", icon: CheckSquare },
  { label: "Problems", href: "/memory/problems", icon: AlertTriangle },
];

const autofixNavItems = [
  { label: "Incidents", href: "/autofix/incidents", icon: AlertCircle },
  { label: "Repositories", href: "/autofix/repos", icon: GitBranch },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { setActiveModule } = useWorkspaceStore();



  const handleNavClick = (module: "memory" | "autofix" | "nexus") => {
    setActiveModule(module);
    onMobileClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border-faint shrink-0">
        <div className="w-8 h-8 rounded-lg bg-nexus-primary/20 flex items-center justify-center shrink-0">
          <Brain className="w-4.5 h-4.5 text-nexus-primary" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-sm font-semibold text-text-primary tracking-tight">
              NexusOps
            </span>
            <span className="text-2xs text-text-muted font-mono">v1.0.0</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {/* Dashboard */}
        <div>
          <Link
            href="/dashboard"
            onClick={() => handleNavClick("nexus")}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative group",
              pathname === "/dashboard"
                ? "bg-nexus-muted text-nexus-primary"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            )}
          >
            {pathname === "/dashboard" && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-nexus-primary"
              />
            )}
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </div>

        {/* Memory Section */}
        <div>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-memory-primary" />
              <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                Memory
              </span>
            </div>
          )}
          <div className="space-y-0.5">
            {memoryNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick("memory")}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 relative group",
                    isActive
                      ? "bg-memory-muted text-memory-primary"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-memory-primary"
                    />
                  )}
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* AutoFix Section */}
        <div>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-autofix-primary" />
              <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                AutoFix
              </span>
            </div>
          )}
          <div className="space-y-0.5">
            {autofixNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick("autofix")}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 relative group",
                    isActive
                      ? "bg-autofix-muted text-autofix-primary"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-autofix-primary"
                    />
                  )}
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom: Settings + Collapse */}
      <div className="border-t border-border-faint p-2 space-y-1 shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all duration-150"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={onToggle}
          className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-hover hover:text-text-secondary transition-all duration-150 w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-bg-surface border-r border-border-faint z-30 transition-all duration-200",
          collapsed ? "w-14" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-bg-surface border-r border-border-faint z-50 md:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-3 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
