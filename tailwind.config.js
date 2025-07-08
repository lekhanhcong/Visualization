/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Infrastructure colors
        '500kv': '#ef4444', // red-500
        '220kv': '#3b82f6', // blue-500
        '110kv': '#ec4899', // pink-500
        'datacenter': '#10b981', // emerald-500
        'project-boundary': '#fbbf24', // amber-400
        'accent': '#8b5cf6', // violet-500
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      keyframes: {
        fadeInGlow: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.8)',
            boxShadow: '0 4px 16px rgba(0, 102, 204, 0.1)',
          },
          '50%': {
            opacity: '0.7',
            transform: 'translateY(10px) scale(0.9)',
            boxShadow: '0 6px 24px rgba(0, 102, 204, 0.2)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            borderColor: '#7dd3fc',
          },
          '50%': {
            boxShadow: '0 12px 40px rgba(0, 102, 204, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 0 0 4px rgba(0, 102, 204, 0.1)',
            borderColor: '#0066CC',
          },
        },
        'power-flow': {
          '0%': {
            strokeDashoffset: '0',
          },
          '100%': {
            strokeDashoffset: '-20',
          },
        },
        'pulse-substation': {
          '0%, 100%': {
            opacity: '0.8',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.1)',
          },
        },
      },
      animation: {
        fadeInGlow: 'fadeInGlow 0.6s ease-out',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        'power-flow': 'power-flow 1s linear infinite',
        'pulse-substation': 'pulse-substation 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}