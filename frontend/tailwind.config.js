/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        grotesk:   ["Anton", "sans-serif"],
        condiment: ["Condiment", "cursive"],
        mono:      ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        background: "#010828",
        cream:      "#EFF4FF",
        neon:       "#6FFF00",
      },
    },
  },
  plugins: [],
};
