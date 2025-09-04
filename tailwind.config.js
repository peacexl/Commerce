 /** @type {import('tailwindcss').Config} */
 export default {
   content: ["./dist/**/*.{html,js}"],
    theme: {
      extend: {},
    },
    variants: {
    extend: {
      placeholderColor: ['responsive', 'focus'],
      placeholderOpacity: ['responsive', 'focus'],
    },
  },
    plugins: [],
  }