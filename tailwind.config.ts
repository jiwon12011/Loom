import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#8B7EA8",
          "purple-dark": "#6E5F8A",
          "purple-light": "#A99ABF",
          peach: "#D4BFA8",
          "peach-light": "#E8D8C8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F8F7FA",
          section: "#F3F1F6",
          warm: "#FAF8F5",
        },
        text: {
          primary: "#1A1721",
          secondary: "#4A4358",
          muted: "#7D7589",
          placeholder: "#B0A9BA",
        },
        border: {
          DEFAULT: "#E8E4EE",
          light: "#F0EDF4",
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
