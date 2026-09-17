/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#16a34a",
          accent: "#f59e0b",
        },
        page: "#fdf2f8",
        // TODO: заменить на реальные оттенки уровней лояльности
        tier: {
          bronze: "#b08d57",
          silver: "#9ca3af",
          gold: "#eab308",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
