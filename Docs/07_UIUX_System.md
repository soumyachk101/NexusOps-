# NexusOps — UI/UX System

## 1. Design Philosophy

**Aesthetic Direction:** *Dual Cockpit* — two modules, one command center. 

NexusOps has two distinct personalities that must coexist in one interface:
- **Memory Engine** feel: archival, calm, like a well-organized library with a smart librarian. Dense information, confident citations.
- **AutoFix Engine** feel: urgent, incident-room, mission critical. Status at a glance. Red means something. Every second counts.

The challenge — and the craft — is building one design system that gracefully handles both modes. The solution: a **shared dark foundation** with **module-tinted accent zones**. Memory speaks in cyan/teal. AutoFix speaks in amber/red. The NexusOps integration layer speaks in violet.

**Typography direction:** Geometric sans for UI + monospace for all code and data. Grotesk-adjacent but distinct — not Inter, not Space Grotesk. Go with **Geist** (Vercel's font — familiar to devs, functional, precise) paired with **JetBrains Mono** for code/data/metadata.

**Motion philosophy:** Purposeful, minimal. One entrance animation per page. Incident pipeline steps animate linearly. No decoration for its own sake.

---

## 2. Color System

```css
:root {
  /* === BASE === */
  --bg-base: #080a0f;             /* Page background — near-black, cool tint */
  --bg-surface: #0e1117;          /* Cards, sidebar — GitHub-dark reference */
  --bg-elevated: #161b24;         /* Dropdowns, modals, tooltips */
  --bg-hover: #1c2230;            /* Hover state */
  --bg-selected: #1a2640;         /* Selected/active item */

  /* Borders */
  --border-faint: #1a1f2e;
  --border-default: #242b3d;
  --border-strong: #323c52;

  /* Text */
  --text-primary: #e2e8f5;
  --text-secondary: #7d8ba3;
  --text-muted: #404a5f;
  --text-code: #7dd3fc;           /* Light blue for inline code */

  /* === MEMORY ENGINE ACCENT (Cyan/Teal) === */
  --memory-primary: #22d3ee;      /* Cyan — Memory module accent */
  --memory-hover: #67e8f9;
  --memory-muted: #0a2535;        /* Subtle memory-tinted bg */
  --memory-border: #164e63;
  --memory-tag-bg: #0c2030;
  --memory-tag-border: #164350;

  /* === AUTOFIX ENGINE ACCENT (Amber) === */
  --autofix-primary: #f59e0b;     /* Amber — AutoFix module accent */
  --autofix-hover: #fbbf24;
  --autofix-muted: #1c1200;
  --autofix-border: #422006;

  /* === NEXUS INTEGRATION ACCENT (Violet) === */
  --nexus-primary: #8b5cf6;       /* Violet — Integration layer */
  --nexus-hover: #a78bfa;
  --nexus-muted: #1a0f35;
  --nexus-border: #3b2080;

  /* === SEVERITY (AutoFix) === */
  --sev-critical: #ef4444;
  --sev-critical-bg: #1f0505;
  --sev-critical-border: #3f0808;
  --sev-high: #f97316;
  --sev-high-bg: #1c0d00;
  --sev-high-border: #3d2000;
  --sev-medium: #eab308;
  --sev-medium-bg: #1a1400;
  --sev-medium-border: #3a2d00;
  --sev-low: #22c55e;
  --sev-low-bg: #071a0e;
  --sev-low-border: #0f3520;

  /* === STATUS === */
  --status-processing: var(--autofix-primary);
  --status-success: #22c55e;
  --status-warning: #eab308;
  --status-error: #ef4444;
  --status-neutral: #475569;

  /* === DIFF VIEWER === */
  --diff-added-bg: #052a10;
  --diff-removed-bg: #2a0505;
  --diff-added-line: #0a4020;
  --diff-removed-line: #4a0a0a;
}
```

---

## 3. Typography

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* OR use local Geist (Next.js built-in) */
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

:root {
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

**When to use mono:**
- All file paths: `src/utils/chunker.py`
- All error messages and stack traces
- Timestamp metadata: `2025-01-15 10:32:14`
- Source citations in Memory answers
- PR branch names: `slothops/fix-a3b2c1d4`
- Similarity scores, confidence percentages
- Chunk IDs, incident IDs

**When to use sans:** Everything else.

**Type Scale:**
```
xs:   11px / font-mono for metadata
sm:   13px / secondary content
base: 15px / body text  
lg:   17px / card titles
xl:   20px / section headers
2xl:  24px / page titles
3xl:  32px / stat numbers on dashboard
```

---

## 4. Component Patterns

### 4.1 Sidebar

```
Width: 240px (icon-only collapsed: 56px)
Background: var(--bg-surface)
Right border: 1px solid var(--border-faint)

Logo area (top):
  NexusOps logo + wordmark

Module sections:
  ┌── MEMORY ──────────────────┐
  │  🔍 Ask                    │  ← cyan accent when active
  │  📁 Sources                │
  │  ✅ Tasks                  │
  │  ⚠️  Problems              │
  ├── AUTOFIX ─────────────────┤
  │  🔴 Incidents              │  ← amber accent when active
  │  📦 Repositories           │
  └────────────────────────────┘
  
  Settings (bottom)
  Workspace switcher (top-right)

Nav item states:
  default: text-secondary, no bg
  hover: bg var(--bg-hover), text-primary
  active Memory: bg var(--memory-muted), text var(--memory-primary), left border 2px solid cyan
  active AutoFix: bg var(--autofix-muted), text var(--autofix-primary), left border 2px solid amber
```

### 4.2 Memory Engine: Q&A Interface

```
Layout: 2-column desktop (chat 65% | source panel 35%)

Chat area:
  User query:
    → Right-aligned, bg var(--bg-elevated), max-w-[70%], rounded-xl
    → Font: Geist sans, base
    
  AI answer card:
    → Left-aligned, bg var(--memory-tag-bg)
    → Left border: 3px solid var(--memory-primary)
    → Padding: 20px 24px
    → Answer text: sans, base, line-height 1.8
    
  Source badges (below answer):
    → Horizontal flex, overflow-x-auto on mobile
    → Each badge: bg var(--memory-tag-bg), border var(--memory-tag-border)
    → Font: JetBrains Mono, 11px
    → Format: [telegram · 15 Jan · Rahul]
    → Hover: border var(--memory-primary), text var(--memory-primary)

Input bar (sticky bottom):
  → Multi-line textarea, auto-expand
  → Cmd/Ctrl + Enter to submit
  → Placeholder: "Ask anything about your team's decisions, tasks, or history..."
  → Submit button: var(--memory-primary) bg
```

### 4.3 AutoFix Engine: Incident Card

```
Full-width horizontal card in incident list

Layout:
  ┌─[severity border]──────────────────────────────────────────────────────┐
  │  [SeverityBadge] [error_type: mono]                   [StatusBadge]   │
  │  "TypeError: Cannot read property 'id' of undefined"  (mono, text-code)│
  │  [GitBranchIcon] owner/repo · main    [ClockIcon] 3 min ago            │
  └────────────────────────────────────────────────────────────────────────┘

Left border: 4px solid (severity color: critical=red, high=orange, medium=amber, low=green)
Hover: bg var(--bg-hover), translateY(-1px) transition 150ms
Click: navigate to /autofix/incidents/:id

StatusBadge colors:
  received/sanitizing/fetching_code: var(--status-neutral)
  analyzing/generating_fix/querying_memory: var(--autofix-primary) + spin
  creating_pr: var(--memory-primary) + pulse
  pr_created: var(--status-success)
  fix_blocked: var(--sev-critical)
  failed: var(--status-error)
  resolved: var(--status-success), faded
  dismissed: var(--status-neutral), faded
```

### 4.4 Pipeline Progress Component

```
Vertical step list, left-aligned, in incident detail right panel

Steps (in order):
  1. Sanitizing Data          (shield-check icon)
  2. Fetching Code            (github icon)
  3. Analyzing Root Cause     (search icon)
  4. Querying Team Memory     (brain icon, VIOLET — NexusOps)
  5. Generating Fix           (wand-sparkles icon)
  6. Safety Check             (shield icon)
  7. Creating Draft PR        (git-pull-request icon)

Step states:
  ○ pending: circle dotted, text-muted
  ◉ active: filled + spinning indicator, autofix-primary, glow pulse anim
  ✓ done: filled checkmark, status-success
  ✗ failed: X icon, status-error
  
Special: Step 4 "Querying Team Memory" uses var(--nexus-primary) (violet)
This is the visual showpiece of NexusOps — makes judges notice the integration
```

### 4.5 NexusOps Memory Context Panel (Integration Showpiece)

```
Rendered inside incident detail page, after pipeline completes

If memory found:
  ┌─────────────────────────────────────────────────────────┐
  │  🧠 Team Memory Context           [NexusOps Badge]      │
  │  ─────────────────────────────────────────────────────  │
  │  "The team previously discussed this auth module issue  │
  │   in Jan 2025, noting it could fail with null users..." │
  │                                                         │
  │  ┌─ telegram · 15 Jan · Rahul ──────────────────────┐  │
  │  │ "the auth middleware will crash if user object    │  │
  │  │  is null — we should add a guard..."              │  │
  │  └───────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────┘

Styling:
  Background: var(--nexus-muted)
  Border: 1px solid var(--nexus-border)
  Left accent: 3px solid var(--nexus-primary)
  Header: var(--nexus-primary)
  Badge: "NexusOps" in nexus-primary color
  Memory chunk cards: bg var(--bg-elevated), border var(--border-faint)
  Source label: JetBrains Mono, 11px, text-secondary

If no memory found:
  Small gray notice: "No related team discussions found in memory."
```

### 4.6 Dashboard Stats

```
3 sections:

Section 1 — NexusOps Overview (violet header)
  Today's queries / Active incidents / PRs created / Memory items indexed

Section 2 — Memory Engine Stats (cyan header)
  Total messages indexed / Tasks detected / Decisions logged / Avg answer time

Section 3 — AutoFix Engine Stats (amber header)
  Total incidents / Avg MTTR / Auto-reverts / Safety blocks

Stat card anatomy:
  Number: text-3xl, Geist 300
  Label: text-xs uppercase tracking-wider, text-secondary
  Module color bar: 2px at bottom (cyan/amber/violet)
```

---

## 5. Page Layouts

### `/dashboard` — Unified Command Center
```
Header: "NexusOps Dashboard" + workspace switcher
Stats grid: 3 sections (overview, memory, autofix)
Main 2-col:
  Left (60%): Combined activity feed (color-coded: cyan=memory, amber=autofix, violet=nexus)
  Right (40%):
    Active incidents (if any — amber border, priority order)
    Recent Q&A queries
    Quick Ask input
```

### `/memory/ask` — Q&A Interface
```
Full height, no outer scroll
Header: module-tinted "Ask Your Team's Memory"
Chat area (scrollable center)
Fixed bottom input bar
Right panel (desktop): source preview
```

### `/autofix/incidents/:id` — Incident Detail (Most Complex Page)
```
Breadcrumb + back
2-column desktop:
  Left (65%):
    Incident metadata bar
    ▼ Root Cause Analysis (collapsible, open by default)
    ▼ Sanitization Report (collapsible)
    ▼ Code Changes — DiffViewer (collapsible, open by default)
    ▼ Safety Check Report (collapsible)
    
  Right (35%, sticky):
    Pipeline Progress (live, auto-updates)
    ─────────────────
    NexusOps Memory Context Panel ← violet, prominent
    ─────────────────
    Action Buttons:
      [Approve Fix → Create PR]  (primary, disabled if BLOCKED)
      [View Draft PR on GitHub ↗] (secondary, after pr_created)
      [Dismiss]  (ghost)
      [Retry]    (ghost, if failed)
    ─────────────────
    Metadata:
      Severity badge
      Status badge
      Repo + branch (mono)
      Error type (mono)
      Source (Sentry/webhook)
      Received / PR created times
      MTTR (if resolved)
```

---

## 6. Animation & Motion

```css
/* Sidebar active indicator slide-in */
.nav-item-active::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px;
  background: var(--module-accent); /* cyan or amber depending on module */
  animation: slideDown 200ms ease forwards;
}

/* Pipeline step active glow */
@keyframes stepGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); }
  50%       { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
}
.step-active .step-icon { animation: stepGlow 1.5s ease-in-out infinite; }

/* NexusOps memory panel: violet pulse when data found */
@keyframes nexusPulse {
  0%, 100% { border-color: var(--nexus-border); }
  50%       { border-color: var(--nexus-primary); }
}
.memory-panel-found { animation: nexusPulse 2s ease-in-out 3; }

/* Critical incident card border */
@keyframes criticalBlink {
  0%, 100% { border-left-color: var(--sev-critical); }
  50%       { border-left-color: rgba(239, 68, 68, 0.3); }
}
.incident-critical { animation: criticalBlink 2s ease-in-out infinite; }

/* Page entrance */
.page-enter { animation: fadeSlideUp 250ms ease forwards; }
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## 7. UI Reference Sources — What to Pull and Where

### Color System
| Reference | What to borrow |
|-----------|---------------|
| **GitHub dark** | Base surface colors (`#0d1117`, `#161b22`), border palette |
| **Vercel dashboard** | Deployment status colors, monospace metadata presentation |
| **Linear** | Sidebar nav density and active states |

### Component Patterns
| Reference | What to steal |
|-----------|--------------|
| **Sentry** | Incident row layout: severity badge + error type + repo + time |
| **Perplexity AI** | Source citation badges under answers |
| **Vercel deployments** | Pipeline step progress tracker (copy the visual language) |
| **Linear** | Task board, priority color dots, filter bar |
| **GitHub PR page** | Diff viewer styling and file path headers |
| **PlanetScale** | Status pills (processing/active/healthy) |

### Module-Specific References
| Module | Reference | Borrow |
|--------|-----------|--------|
| Memory Q&A | Perplexity | Answer cards with source badges |
| Memory Sources | Cloudflare dashboard | Source/item status cards |
| AutoFix Incidents | Sentry Issues | Incident list, severity, stack trace display |
| AutoFix Pipeline | Vercel Deploy | Step progress visual |
| Nexus Panel | Linear comments | Side panel with contextual info |

### Typography Reference
- Geist font: vercel.com (already using it — familiar to developer audience)
- JetBrains Mono: used in the JetBrains IDE — devs already love it

---

## 8. Responsive Behavior

```
Mobile (< 768px):
  Sidebar → hamburger + bottom sheet drawer
  2-col layouts → single column, stacked
  DiffViewer → unified view (not split)
  Pipeline progress → horizontal scroll

Tablet (768px–1024px):
  Sidebar → icon-only (56px)
  2-col layouts → 55% / 45%

Desktop (> 1024px):
  Full sidebar (240px)
  All 2-col layouts as designed
```

---

## 9. Module Visual Identity Quick Reference

| Element | Memory (cyan) | AutoFix (amber) | NexusOps (violet) |
|---------|--------------|-----------------|-------------------|
| Nav active border | `#22d3ee` | `#f59e0b` | `#8b5cf6` |
| Answer/Panel border | `#22d3ee` | — | `#8b5cf6` |
| Status glow | cyan | amber | violet |
| Badge | "MEMORY" cyan | "AUTOFIX" amber | "NexusOps" violet |
| Empty state icon | Database/Search | AlertCircle | Brain |
| Font (data) | JetBrains Mono | JetBrains Mono | JetBrains Mono |
```
