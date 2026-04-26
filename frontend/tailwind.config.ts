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
          // Backgrounds — darkest to elevated
          void:   "#0d0c0f",
          abyss:  "#131118",
          deep:   "#181520",
          pit:    "#1e1b28",
          // Borders
          rim:    "#26223a",
          edge:   "#342f47",
          seam:   "#463f5c",
          // Text
          bone:   "#e4ddd0",
          dust:   "#9f9299",
          smoke:  "#5a5068",
          // Crimson accent
          crimson:"#b83232",
          ember:  "#d44848",
          blood:  "#821e1e",
          // Gold accent
          gold:   "#c09530",
          shine:  "#e8b848",
          brass:  "#7a5c1e",
        },
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "Georgia", "serif"],
        sans:    ["var(--font-inter)",  "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)",   "'Courier New'", "monospace"],
      },
      boxShadow: {
        "glow-red":   "0 0 28px rgba(184, 50, 50, 0.22)",
        "glow-gold":  "0 0 28px rgba(192, 149, 48, 0.18)",
        "card":       "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        "lift":       "0 10px 44px rgba(0,0,0,0.75), 0 0 20px rgba(192, 149, 48, 0.06)",
        "inset-top":  "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "dot-grid": "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dots": "28px 28px",
      },
      keyframes: {
        "cta-glow": {
          "0%, 100%": { boxShadow: "0 0 16px rgba(184,50,50,0.25)" },
          "50%":      { boxShadow: "0 0 32px rgba(184,50,50,0.45)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      animation: {
        "cta-glow": "cta-glow 3s ease-in-out infinite",
        "float":    "float 7s ease-in-out infinite",
        "shimmer":  "shimmer 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
