/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#12151c",
        panel: "#1b2030",
        panel2: "#242b3d",
        brass: "#c9a227",
        "brass-light": "#e2c05a",
        emerald: "#2f6b5e",
        parchment: "#edeae2",
        muted: "#9aa0ae",
        hairline: "#2c3244",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 10px 40px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
