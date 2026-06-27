/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Identité visuelle Le Panda (référencées aussi en variables CSS dans index.css)
        noir: '#1a1108',
        sombre: '#120d06',
        or: '#D4AF57',
        'or-clair': '#e8c97a',
        rouge: '#C0392B',
        creme: '#f5f0e8',
        texte: '#e8e0d0',
        muted: '#8a7060',
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'bouton-rouge': '0 12px 35px rgba(192,57,43,0.4)',
        card: '0 24px 60px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
