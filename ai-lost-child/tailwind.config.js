/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#000000',
        snow: '#ffffff',
        lavender: '#7C5CFF',
        mint: '#31D0AA',
        charcoal: '#16151C',
        haze: '#F5F5F7',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px rgba(124, 92, 255, 0.45)',
        card: '0 30px 80px rgba(6, 8, 20, 0.12)',
      },
      borderRadius: {
        '2.5xl': '1.5rem',
      },
      backgroundImage: {
        'aurora': 'linear-gradient(135deg, rgba(124,92,255,0.9), rgba(49,208,170,0.9))',
        'mint-glow': 'linear-gradient(120deg, rgba(124,92,255,0.85), rgba(49,208,170,0.85))',
      },
    },
  },
  plugins: [],
}

