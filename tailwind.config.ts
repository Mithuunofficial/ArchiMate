import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#050816",
        secondary: "#0B1120",
        card: "#0F172A",
        border: "#1E293B",
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#3B82F6",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          glow: "rgba(6, 182, 212, 0.15)",
        },
        muted: {
          DEFAULT: "#94A3B8",
          dark: "#64748B",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(30, 41, 59, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.2) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 80%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-flow": "glowFlow 3s ease-in-out infinite alternate",
        "dash-flow": "dashFlow 20s linear infinite",
      },
      keyframes: {
        glowFlow: {
          "0%": { opacity: "0.4", filter: "blur(20px)" },
          "100%": { opacity: "0.8", filter: "blur(30px)" },
        },
        dashFlow: {
          to: { strokeDashoffset: "-1000" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
