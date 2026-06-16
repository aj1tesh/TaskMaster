import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        raised: "var(--bg-raised)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        accent: "#e8632a",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        none: "0px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      spacing: {
        sidebar: "240px",
        "sidebar-collapsed": "56px",
      },
      boxShadow: {
        md: "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)",
      },
      keyframes: {
        "loading-slide": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(420%)" },
        },
        "dropdown-in": {
          "0%": { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "loading-slide": "loading-slide 1.4s ease-in-out infinite",
        "dropdown-in": "dropdown-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
