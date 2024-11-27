/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'verde-gramado': '#289827',
        'verde-header': '#6BCB6B',
        'verde-mensagem': '#A6E2A6',
        'cinza-mensagem': '#D9D9D9'
      }
    },
  },
  plugins: [],
}