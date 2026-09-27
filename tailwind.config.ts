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
          DEFAULT: "#0F6E5B",   // hijau tua — kepercayaan, kemanusiaan
          light: "#E7F3EF",
          dark: "#0A4F41",
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
