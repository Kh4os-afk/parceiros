/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        oxanium: ['Oxanium', 'sans-serif'],
        sans:    ['Oxanium', 'sans-serif'],
        mono:    ['Oxanium', 'monospace'],
      },
      colors: {
        background:  'oklch(var(--background) / <alpha-value>)',
        foreground:  'oklch(var(--foreground) / <alpha-value>)',
        border:      'oklch(var(--border) / <alpha-value>)',
        input:       'oklch(var(--input) / <alpha-value>)',
        ring:        'oklch(var(--ring) / <alpha-value>)',
        primary: {
          DEFAULT:    'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'oklch(var(--destructive) / <alpha-value>)',
        },
        card: {
          DEFAULT:    'oklch(var(--card) / <alpha-value>)',
          foreground: 'oklch(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'oklch(var(--popover) / <alpha-value>)',
          foreground: 'oklch(var(--popover-foreground) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT:    'oklch(var(--sidebar) / <alpha-value>)',
          foreground: 'oklch(var(--sidebar-foreground) / <alpha-value>)',
          primary: {
            DEFAULT:    'oklch(var(--sidebar-primary) / <alpha-value>)',
            foreground: 'oklch(var(--sidebar-primary-foreground) / <alpha-value>)',
          },
          accent: {
            DEFAULT:    'oklch(var(--sidebar-accent) / <alpha-value>)',
            foreground: 'oklch(var(--sidebar-accent-foreground) / <alpha-value>)',
          },
          border: 'oklch(var(--sidebar-border) / <alpha-value>)',
          ring:   'oklch(var(--sidebar-ring) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'var(--radius)',
        sm: 'var(--radius)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
