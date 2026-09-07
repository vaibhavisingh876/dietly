/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#F3F6F2",
          100: "#E3EAE0",
          200: "#C4D3BE",
          300: "#9FB897",
          400: "#719467",
          500: "#4F7345",
          600: "#3A5A32",
          700: "#2B3A2E",
          800: "#212E23",
          900: "#171F19",
        },
        clay: {
          50: "#FDF3EF",
          100: "#FBE3D8",
          200: "#F4C0A8",
          300: "#E89A72",
          400: "#D67849",
          500: "#C1502E",
          600: "#A43F22",
          700: "#82321C",
          800: "#5F2515",
          900: "#3D170D",
        },
        cream: {
          50: "#FEFDFB",
          100: "#FAF7F2",
          200: "#F3EDE3",
          300: "#E8DFD0",
        },
        ink: {
          400: "#7A756C",
          500: "#5F5B53",
          600: "#4A463F",
          700: "#37342E",
          800: "#26241F",
          900: "#1A1815",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
