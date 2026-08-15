const preset = require("@portfolio/config/tailwind-preset.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
};
