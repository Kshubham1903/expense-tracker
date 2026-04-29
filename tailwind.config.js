/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Premium Dark Backgrounds
        dark: {
          primary: '#0B0B0B',
          secondary: '#1A140F',
          card: '#121212',
          elevated: '#161616',
        },
        // Accent - Muted Gold
        luxury: {
          gold: '#C6A75E',
          'gold-light': '#D4B574',
          'gold-dark': '#B89448',
        },
        // Text Colors
        text: {
          primary: '#EDEDED',
          secondary: '#9A9A9A',
          subtle: '#6F6F6F',
        },
        // Semantic Colors
        state: {
          success: '#5F8F6F',
          'success-light': '#7BA888',
          error: '#B06A6A',
          'error-light': '#C68686',
        },
      },
      backgroundColor: {
        'dark-primary': '#0B0B0B',
        'dark-secondary': '#1A140F',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.3)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'elevation': '0 1px 3px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'luxury': '16px',
        'luxury-lg': '20px',
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #0B0B0B 0%, #1A140F 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #121212 0%, #161616 100%)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        // Luxury spacing scale
        'section': '3rem',
        'subsection': '2rem',
      },
    },
  },
  plugins: [
    function ({ addComponents, theme }) {
      addComponents({
        // Typography system
        '.text-title': {
          '@apply text-2xl font-medium text-text-primary': {},
          letterSpacing: '0.02em',
        },
        '.text-subtitle': {
          '@apply text-lg font-medium text-text-primary': {},
          letterSpacing: '0.01em',
        },
        '.text-body': {
          '@apply text-base text-text-primary': {},
          lineHeight: '1.6',
        },
        '.text-body-secondary': {
          '@apply text-sm text-text-secondary': {},
          lineHeight: '1.5',
        },
        '.text-label': {
          '@apply text-xs font-medium text-text-secondary uppercase': {},
          letterSpacing: '0.08em',
        },
        // Premium card styles
        '.card-luxury': {
          '@apply bg-dark-card rounded-luxury border border-gray-800': {},
        },
        '.card-luxury-elevated': {
          '@apply bg-dark-elevated rounded-luxury border border-gray-800 shadow-elevation': {},
        },
        // Button system
        '.btn-luxury-primary': {
          '@apply bg-luxury-gold text-gray-900 font-medium py-3 px-6 rounded-luxury transition-all duration-200 hover:bg-luxury-gold-light hover:shadow-soft': {},
        },
        '.btn-luxury-secondary': {
          '@apply bg-transparent border border-luxury-gold text-luxury-gold font-medium py-3 px-6 rounded-luxury transition-all duration-200 hover:bg-luxury-gold hover:text-gray-900': {},
        },
        '.btn-luxury-tertiary': {
          '@apply bg-dark-elevated text-text-primary border border-gray-800 font-medium py-3 px-6 rounded-luxury transition-all duration-200 hover:border-luxury-gold hover:text-luxury-gold': {},
        },
        // Input system
        '.input-luxury': {
          '@apply bg-dark-card border border-gray-700 text-text-primary rounded-luxury px-4 py-3 transition-all duration-200': {},
          '&:focus': {
            '@apply outline-none border-luxury-gold': {},
            boxShadow: '0 0 0 1px rgba(198, 167, 94, 0.1)',
          },
          '&::placeholder': {
            '@apply text-text-subtle': {},
          },
        },
      });
    },
  ],
};
