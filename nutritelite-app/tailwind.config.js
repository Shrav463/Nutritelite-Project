/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f766e",      // main green
        primaryDark: "#0d9488",  // gradient start
        primaryLight: "#ecfdf5", // soft background
        primaryBorder: "#99f6e4",
      },
    },
  },
  plugins: [],
};
