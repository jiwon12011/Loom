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
      fontSize: {
        // 타이포 스케일 (행간 기본 동봉) — 점진 적용용 토큰
        caption: ["12px", { lineHeight: "1.5" }],
        footnote: ["13px", { lineHeight: "1.5" }],
        body: ["15px", { lineHeight: "1.6" }],
        callout: ["17px", { lineHeight: "1.5", fontWeight: "600" }],
        title3: ["20px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        title1: ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        display: ["35px", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
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
        floating: "0 8px 28px rgba(45, 42, 51, 0.12)",
        modal: "0 -8px 32px rgba(45, 42, 51, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
