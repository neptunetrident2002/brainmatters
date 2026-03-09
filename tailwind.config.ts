import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SharpStack design tokens — PRD §4.1
        orange: {
          DEFAULT: "#E8520A",
          light: "#FFF0E8",
          dim: "#B84008",
        },
        dark: "#1A1208",
        mid: "#5A4A2A",
        muted: "#8A7A5A",
        border: "#C8B89A",
        bg: "#F5F0E8",
        card: "#FFFEF9",
        cream: "#FAF6F0",
        success: {
          DEFAULT: "#2E7D32",
          light: "#E8F5E9",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
