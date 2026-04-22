/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  // Theme toggling via data-theme attribute on <html>
  // We don't use Tailwind's class-based dark mode; we use CSS vars instead.
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // ── Semantic theme tokens (backed by CSS custom properties) ──────────
      colors: {
        'th-bg-0':          'var(--bg-0)',
        'th-bg-1':          'var(--bg-1)',
        'th-bg-2':          'var(--bg-2)',
        'th-bg-3':          'var(--bg-3)',
        'th-bg-4':          'var(--bg-4)',
        'th-border':        'var(--border-base)',
        'th-border-subtle': 'var(--border-subtle)',
        'th-border-strong': 'var(--border-strong)',
        'th-text-1':        'var(--text-1)',
        'th-text-2':        'var(--text-2)',
        'th-text-3':        'var(--text-3)',
        'th-text-4':        'var(--text-4)',
        'th-accent':        'var(--accent)',
      },
      // ── Animations ───────────────────────────────────────────────────────
      animation: {
        'pulse-glow':  'pulseGlow 1.2s ease-in-out infinite',
        'fade-in':     'fadeIn 0.15s ease-out',
        'slide-up':    'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
        'slide-right': 'slideRight 0.25s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':    'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        'hover-lift':  'hoverLift 0.2s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.85', transform: 'scale(1.02)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        hoverLift: {
          to: { transform: 'translateY(-1px)' },
        },
      },
      boxShadow: {
        'node':       '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
        'node-hover': '0 4px 24px rgba(0,0,0,0.16), 0 1px 4px rgba(0,0,0,0.1)',
        'panel':      '0 0 0 1px var(--border-subtle), 0 8px 32px rgba(0,0,0,0.24)',
        'toolbar':    '0 1px 0 var(--border-base)',
      },
    },
  },
  plugins: [],
}
