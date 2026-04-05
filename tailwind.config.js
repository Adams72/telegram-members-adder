/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'telegram-blue': '#0088cc',
        'telegram-dark': '#1a1a1a',
      },
    },
  },
  plugins: [],
}
