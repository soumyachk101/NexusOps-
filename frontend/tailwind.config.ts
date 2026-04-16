import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* === BASE === */
        "bg-base": "#080a0f",
        "bg-surface": "#0e1117",
        "bg-elevated": "#161b24",
        "bg-hover": "#1c2230",
        "bg-selected": "#1a2640",

        /* Borders */
        "border-faint": "#1a1f2e",
        "border-default": "#242b3d",
        "border-strong": "#323c52",

        /* Text */
        "text-primary": "#e2e8f5",
        "text-secondary": "#7d8ba3",
        "text-muted": "#404a5f",
        "text-code": "#7dd3fc",

        /* === MEMORY ENGINE (Cyan) === */
        "memory-primary": "#22d3ee",
        "memory-hover": "#67e8f9",
        "memory-muted": "#0a2535",
        "memory-border": "#164e63",
        "memory-tag-bg": "#0c2030",
        "memory-tag-border": "#164350",

        /* === AUTOFIX ENGINE (Amber) === */
        "autofix-primary": "#f59e0b",
        "autofix-hover": "#fbbf24",
        "autofix-muted": "#1c1200",
        "autofix-border": "#422006",

        /* === NEXUS INTEGRATION (Violet) === */
        "nexus-primary": "#8b5cf6",
        "nexus-hover": "#a78bfa",
        "nexus-muted": "#1a0f35",
        "nexus-border": "#3b2080",

        /* === SEVERITY === */
        "sev-critical": "#ef4444",
        "sev-critical-bg": "#1f0505",
        "sev-critical-border": "#3f0808",
        "sev-high": "#f97316",
        "sev-high-bg": "#1c0d00",
        "sev-high-border": "#3d2000",
        "sev-medium": "#eab308",
        "sev-medium-bg": "#1a1400",
        "sev-medium-border": "#3a2d00",
        "sev-low": "#22c55e",
        "sev-low-bg": "#071a0e",
        "sev-low-border": "#0f3520",

        /* === STATUS === */
        "status-success": "#22c55e",
        "status-warning": "#eab308",
        "status-error": "#ef4444",
        "status-neutral": "#475569",

        /* === DIFF === */
        "diff-added-bg": "#052a10",
        "diff-removed-bg": "#2a0505",
        "diff-added-line": "#0a4020",
        "diff-removed-line": "#4a0a0a",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],       // 11px
        xs: ["0.8125rem", { lineHeight: "1.125rem" }],      // 13px
        sm: ["0.9375rem", { lineHeight: "1.375rem" }],      // 15px
        base: ["0.9375rem", { lineHeight: "1.625rem" }],    // 15px body
        lg: ["1.0625rem", { lineHeight: "1.5rem" }],        // 17px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],         // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],          // 24px
        "3xl": ["2rem", { lineHeight: "2.25rem" }],         // 32px
      },
      animation: {
        "step-glow": "stepGlow 1.5s ease-in-out infinite",
        "nexus-pulse": "nexusPulse 2s ease-in-out 3",
        "critical-blink": "criticalBlink 2s ease-in-out infinite",
        "fade-slide-up": "fadeSlideUp 250ms ease forwards",
        "spin-slow": "spin 2s linear infinite",
        "pulse-dot": "pulseDot 1.5s ease-in-out infinite",
      },
      keyframes: {
        stepGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.5)" },
          "50%": { boxShadow: "0 0 0 8px rgba(245, 158, 11, 0)" },
        },
        nexusPulse: {
          "0%, 100%": { borderColor: "#3b2080" },
          "50%": { borderColor: "#8b5cf6" },
        },
        criticalBlink: {
          "0%, 100%": { borderLeftColor: "#ef4444" },
          "50%": { borderLeftColor: "rgba(239, 68, 68, 0.3)" },
        },
        fadeSlideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
