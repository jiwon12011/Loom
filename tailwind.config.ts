import type { Config } from "tailwindcss";

const rgb = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          purple: rgb("brand-purple"),
          "purple-dark": rgb("brand-purple-dark"),
          "purple-light": rgb("brand-purple-light"),
          peach: rgb("brand-peach"),
          "peach-light": rgb("brand-peach-light"),
        },
        surface: {
          DEFAULT: rgb("surface"),
          soft: rgb("surface-soft"),
          section: rgb("surface-section"),
          warm: rgb("surface-warm"),
        },
        text: {
          primary: rgb("text-primary"),
          secondary: rgb("text-secondary"),
          muted: rgb("text-muted"),
          placeholder: rgb("text-placeholder"),
        },
        border: {
          DEFAULT: rgb("border"),
          light: rgb("border-light"),
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
        card: "0 1px 4px rgba(45, 42, 51, 0.04)",
        elevated: "0 4px 16px rgba(45, 42, 51, 0.06)",
        modal: "0 -4px 24px rgba(45, 42, 51, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
