import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nr: {
          // Backgrounds
          bg:           "#FFFFFF",
          surface:      "#F9FAFB",
          panel:        "#F3F4F6",
          // Borders
          border:       "#E5E7EB",
          ring:         "#D1D5DB",
          // Text
          ink:          "#111827",
          body:         "#374151",
          muted:        "#6B7280",
          faint:        "#9CA3AF",
          placeholder:  "#D1D5DB",
          // Novarite Red accent
          red:          "#DC2626",
          redhover:     "#B91C1C",
          redlight:     "#FEF2F2",
          redborder:    "#FECACA",
          // Web3 / Solana accent (secondary — used sparingly)
          indigo:       "#6366F1",
          indigobg:     "#EEF2FF",
          indigoborder: "#C7D2FE",
          indigomuted:  "#818CF8",
        },
      },
      fontFamily: {
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "'Courier New'", "monospace"],
      },
      boxShadow: {
        card:       "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-md":  "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)",
        "card-lg":  "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.04)",
        "red-ring": "0 0 0 3px rgba(220,38,38,0.15)",
        header:     "0 1px 0 0 #E5E7EB",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(220,38,38,0.20)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(220,38,38,0)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.5s ease-out",
        "fade-in":    "fade-in 0.4s ease-out",
        "pulse-red":  "pulse-red 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
