/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDF6F0",
        creamDark: "#F5D2B3",

        pink: "#F7C9D3",
        pinkDark: "#EF92A6",

        sky: "#C7DFF5",
        skyDark: "#91C0EC",

        wine: "#664147",
        wineDark: "#58383E",

        textDark: "#3B3B3B",
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // default
      },
    },
  },
  plugins: [],
};