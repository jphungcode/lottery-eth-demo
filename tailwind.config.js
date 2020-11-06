module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      "rubik": ['Rubik', 'sans-serif'],
    },
    extend: {
      colors: {
        'accent-1': '#333',
      },
      inset: {
        '2rem': '2rem'
      }
    },
  },
  variants: {},
  plugins: [],
}