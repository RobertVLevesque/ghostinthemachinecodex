import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#f8fafc",
        border: "rgba(90, 119, 255, 0.25)",
        accent: {
          50: "#f2f7ff",
          100: "#dce8ff",
          200: "#b6d1ff",
          300: "#84b3ff",
          400: "#5790ff",
          500: "#3a70ff",
          600: "#2c57d6",
          700: "#2242aa",
          800: "#1f3787",
          900: "#1d2f6e",
        },
        danger: "#ff4d6d",
        success: "#2dd4bf",
        muted: "#1a1d29",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        xl: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 30px rgba(88, 211, 255, 0.35)",
      },
      keyframes: {
        "ghost-glow": {
          "0%": { opacity: "0.15" },
          "50%": { opacity: "0.55" },
          "100%": { opacity: "0.15" },
        },
        "flicker-soft": {
          "0%, 100%": { opacity: "0.9" },
          "45%": { opacity: "0.6" },
          "55%": { opacity: "1" },
          "65%": { opacity: "0.7" },
        },
        "scanline": {
          "0%": { transform: "translateX(-50%) scaleX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "40%": { transform: "translateX(0) scaleX(1)" },
          "70%": { opacity: "1" },
          "100%": { transform: "translateX(50%) scaleX(0)", opacity: "0" },
        },
        "eye-glow": {
          "0%": { filter: "drop-shadow(0 0 0 rgba(255,0,0,0))" },
          "40%": { filter: "drop-shadow(0 0 12px rgba(255,0,0,0.75))", opacity: "1" },
          "100%": { filter: "drop-shadow(0 0 0 rgba(255,0,0,0))", opacity: "0.4" },
        },
        "terminal-caret": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "ghost-glow": "ghost-glow 3.2s ease-in-out infinite",
        "flicker-soft": "flicker-soft 4s ease-in-out infinite",
        "scanline": "scanline 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "eye-glow": "eye-glow 1.5s ease-in-out forwards",
        "terminal-caret": "terminal-caret 1.2s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
