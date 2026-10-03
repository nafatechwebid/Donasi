import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
  DEFAULT: "rgb(var(--brand, 15 110 91) / <alpha-value>)",
  dark: "rgb(var(--brand-dark, 11 77 64) / <alpha-value>)",
  light: "rgb(var(--brand-light, 233 247 244) / <alpha-value>)",
},
        accent: "#E8A33D",       // kuning keemasan — aksen donasi/urgensi
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-source-serif)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
