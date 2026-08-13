import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kemp: {
          dark: "#0a0a0a",
          panel: "#141414",
          accent: "#C41E3A",
          red: "#8B2635",
          orange: "#D4652A",
          yellow: "#E8B923",
          green: "#4A7C59",
          blue: "#2E5AAC",
          violet: "#6B3FA0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
