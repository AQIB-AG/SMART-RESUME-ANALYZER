/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          // Modern gradient colors
          'indigo': {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
          },
          'cyan': {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
          },
          'electric-blue': {
            500: '#0077ff',
            600: '#0066cc',
            700: '#0052a3',
          },
          'neon-purple': {
            400: '#b36cff',
            500: '#a142f4',
            600: '#8b2de0',
          },
          'mint-green': {
            400: '#48dbb4',
            500: '#1dd1a1',
            600: '#10ac84',
          },
          'soft-coral': {
            400: '#ff9f80',
            500: '#ff7675',
            600: '#d63031',
          },
          // Dark mode colors
          'dark': {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          },
          'navy': {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          'charcoal': {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          },
        },
        fontFamily: {
          'sans': ['Inter', 'system-ui', 'sans-serif'],
          'heading': ['Space Grotesk', 'system-ui', 'sans-serif'],
          'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
        },
        boxShadow: {
          'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          'neon': '0 0 15px rgba(161, 66, 244, 0.5)',
          'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        },
        backdropBlur: {
          'xs': '2px',
        },
        animation: {
          'gradient': 'gradient 8s linear infinite',
          'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        },
        keyframes: {
          gradient: {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
          },
          'pulse-glow': {
            '0%': { boxShadow: '0 0 0 0 rgba(161, 66, 244, 0.4)' },
            '100%': { boxShadow: '0 0 0 10px rgba(161, 66, 244, 0)' },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }
  