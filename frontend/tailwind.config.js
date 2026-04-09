/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Theme-aware colors via CSS variables (defined in globals.css) */
        'bg-primary':    'var(--color-bg-primary)',
        'bg-secondary':  'var(--color-bg-secondary)',
        'bg-tertiary':   'var(--color-bg-tertiary)',
        'bg-overlay':    'var(--color-bg-overlay)',
        'neon-amber':    'var(--color-neon-amber)',
        'neon-amber-dim':'var(--color-neon-amber-dim)',
        'neon-cyan':     'var(--color-neon-cyan)',
        'neon-cyan-dim': 'var(--color-neon-cyan-dim)',
        'neon-purple':   'var(--color-neon-purple)',
        'midnight-deep': 'var(--color-midnight-deep)',
        'midnight-mid':  'var(--color-midnight-mid)',
        'midnight-light':'var(--color-midnight-light)',
        'charcoal-900':  'var(--color-charcoal-900)',
        'charcoal-800':  'var(--color-charcoal-800)',
        'charcoal-700':  'var(--color-charcoal-700)',
        'charcoal-600':  'var(--color-charcoal-600)',
        'charcoal-500':  'var(--color-charcoal-500)',
        'charcoal-400':  'var(--color-charcoal-400)',
        'charcoal-300':  'var(--color-charcoal-300)',
        'text-warm':     'var(--color-text-warm)',
        'text-secondary':'var(--color-text-secondary)',
        'text-muted':    'var(--color-text-muted)',
        /* Flavor colors — not theme-dependent */
        'flavor-citrus': '#FFD700',
        'flavor-tropical':'#FF8C00',
        'flavor-berry':  '#DC143C',
        'flavor-herbal': '#228B22',
        'flavor-smoky':  '#696969',
        'flavor-floral': '#DDA0DD',
        'flavor-caramel':'#C27820',
        'flavor-vanilla':'#F5DEB3',
      },
      fontFamily: {
        display: ['Playfair Display', 'Noto Serif TC', 'Georgia', 'serif'],
        sans:    ['Inter', 'Noto Sans TC', '-apple-system', 'sans-serif'],
        mono:    ['Fira Code', 'Cascadia Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'neon-amber':  '0 0 15px var(--shadow-neon-amber), 0 0 30px var(--shadow-neon-amber-dim)',
        'neon-cyan':   '0 0 15px var(--shadow-neon-cyan), 0 0 30px var(--shadow-neon-cyan-dim)',
        'neon-purple': '0 0 15px rgba(155, 89, 182, 0.4)',
        'glass':       'var(--shadow-glass)',
        'card':        'var(--shadow-card)',
      },
      backgroundImage: {
        'gradient-dark':  'var(--gradient-dark)',
        'gradient-amber': 'linear-gradient(135deg, var(--color-neon-amber) 0%, var(--color-neon-amber-dim) 100%)',
        'gradient-midnight': 'var(--gradient-midnight)',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(245, 166, 35, 0.2)' },
          '50%':       { boxShadow: '0 0 20px rgba(245, 166, 35, 0.6)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'glow':        'glow 3s ease-in-out infinite',
        'fade-in':     'fade-in 0.4s ease-out forwards',
        'pulse-slow':  'pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
