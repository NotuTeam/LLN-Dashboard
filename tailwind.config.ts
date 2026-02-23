/** @format */

import type { Config } from "tailwindcss";

// Primary brand color palette
const PRIMARY_COLOR = "#238b45";

// Generate color shades from primary color
const generateColorShades = (hex: string) => {
  // Convert hex to RGB
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  return {
    50: `rgb(${Math.round(r + (255 - r) * 0.95)} ${Math.round(g + (255 - g) * 0.95)} ${Math.round(b + (255 - b) * 0.95)} / 1)`,
    100: `rgb(${Math.round(r + (255 - r) * 0.9)} ${Math.round(g + (255 - g) * 0.9)} ${Math.round(b + (255 - b) * 0.9)} / 1)`,
    200: `rgb(${Math.round(r + (255 - r) * 0.8)} ${Math.round(g + (255 - g) * 0.8)} ${Math.round(b + (255 - b) * 0.8)} / 1)`,
    300: `rgb(${Math.round(r + (255 - r) * 0.6)} ${Math.round(g + (255 - g) * 0.6)} ${Math.round(b + (255 - b) * 0.6)} / 1)`,
    500: hex,
    600: `rgb(${Math.round(r * 0.9)} ${Math.round(g * 0.9)} ${Math.round(b * 0.9)} / 1)`,
    700: `rgb(${Math.round(r * 0.8)} ${Math.round(g * 0.8)} ${Math.round(b * 0.8)} / 1)`,
  };
};

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "Arial", "Helvetica", "sans-serif"],
      },
      colors: {
        primary: generateColorShades(PRIMARY_COLOR),
      },
      animation: {
        "spin-slow": "spin 10s linear infinite",
      },
      keyframes: {
        spin: {
          "0%, ": { rotate: "0deg" },
          "50%": { scale: "1.15" },
          "100%": { rotate: "360deg" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
export { PRIMARY_COLOR };
