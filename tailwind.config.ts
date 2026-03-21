import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'base': {
          DEFAULT: '#8CC63F',
          light: '#EBF5E0',
          dark: '#6B9E2E',
        },
      },
    },
  },
  plugins: [],
};
export default config;
