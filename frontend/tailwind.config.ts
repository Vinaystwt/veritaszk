import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#0a0a0f",
          green: "#00ff88",
          gold: "#ffd700",
          danger: "#ff4444",
          card: "rgba(255,255,255,0.03)",
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        "dot-grid": "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot": "32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
