/** @type {import('tailwindcss').Config} */
// Colours are CSS variables so each table colour (light clay or a dark ground)
// can swap the ink, accent and power colours at once. See tableTokens() in src/ui/designs.ts.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        table: "var(--base)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        king: "var(--king)",
        queen: "var(--queen)",
        jack: "var(--jack)",
        good: "var(--good)",
        bad: "var(--bad)",
        glaze: "#1B1511",
        slip: "#F0DDBB",
        clay: "#C8642E",
      },
      fontFamily: {
        sans: ["Alegreya Sans", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Forum", "Times New Roman", "serif"],
      },
      boxShadow: { none: "none" },
    },
  },
  plugins: [],
};
