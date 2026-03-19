/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dhikr-deep': '#0f172a',
        'dhikr-sand': '#f8fafc',
      },
    },
  },
  plugins: [],
}
