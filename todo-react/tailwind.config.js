module.exports = {
  purge: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        rainbow: "rainbow 2s linear infinite",
      },
      keyframes: {
        rainbow: {
          "0%": { "background-color": "Magenta" },
          "33%": { "background-color": "yellow" },
          "66%": { "background-color": "Cyan" },
          "100%": { "background-color": "Magenta" },
          "12%": { "background-color": "#ff5353" },
          "24%": { "background-color": "#ffcf53" },
          "36%": { "background-color": "#e8ff53" },
          "48%": { "background-color": "#53ff5d" },
          "60%": { "background-color": "#53ffbc" },
          "72%": { "background-color": "#5393ff" },
          "84%": { "background-color": "#ca53ff" },
          "100%": { "background-color": "#ff53bd" },
        },
      },
    },
  },
  plugins: [],
};
