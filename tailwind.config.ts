import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "var(--brand-purple)",
          "purple-dark": "var(--brand-purple-dark)",
          "purple-light": "var(--brand-purple-light)",
          peach: "var(--brand-peach)",
          "peach-light": "var(--brand-peach-light)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          soft: "var(--surface-soft)",
          section: "var(--surface-section)",
          warm: "var(--surface-warm)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          placeholder: "var(--text-placeholder)",
        },
        border: {
          DEFAULT: "var(--border)",
          light: "var(--border-light)",
        },
      },
      fontFamily: {
        pretendard: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 1px 4px var(--shadow-color, rgba(45, 42, 51, 0.04))",
        elevated: "0 4px 16px var(--shadow-color, rgba(45, 42, 51, 0.06))",
        modal: "0 -4px 24px var(--shadow-color, rgba(45, 42, 51, 0.08))",
      },
    },
  },
  plugins: [],
};
export default config;
