// const { Config } = require('tailwindcss');
const forms = require('@tailwindcss/forms');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    forms,
  ],
};