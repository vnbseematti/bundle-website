/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        "account-s": "#ffffcb", // yellow
        "account-t": "#ccffff", // light green
        "account-r": "#feccff", // pink
      },
    },
  },
  plugins: [],
};
