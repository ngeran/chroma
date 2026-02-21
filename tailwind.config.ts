import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans',    'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
        display: ['Orbitron',   'sans-serif'],
      },
      colors: {
        void:            'var(--void)',
        surface:         'var(--surface)',
        base:            'var(--base)',
        layer:           'var(--layer)',
        dim:             'var(--dim)',
        'dim-brt':       'var(--dim-brt)',
        fg:              'var(--fg)',
        cyan:            'var(--cyan)',
        accent:          'var(--accent)',
        'accent-dim':    'var(--accent-dim)',
        success:         'var(--success)',
        'success-dim':   'var(--success-dim)',
        warning:         'var(--warning)',
        'warning-dim':   'var(--warning-dim)',
        error:           'var(--error)',
        'error-dim':     'var(--error-dim)',
      },
    },
  },
  plugins: [],
} satisfies Config;
