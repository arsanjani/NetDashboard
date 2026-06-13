/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        card: 'rgba(30, 32, 40, 0.7)',
        border: 'rgba(255, 255, 255, 0.06)',
        accent: {
          green: '#22c55e',
          yellow: '#eab308',
          red: '#ef4444',
          blue: '#3b82f6',
        },
      },
      borderRadius: {
        lg: '18px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
