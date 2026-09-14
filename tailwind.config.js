/** @type {import('tailwindcss').Config} */
// Colours are NOT duplicated here. They are CSS custom properties emitted at
// runtime from src/data/palette.ts, so editing that one file restyles both the
// canvas and every Tailwind class below.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--c-void)',
        ink: 'var(--c-ink)',
        shadow: 'var(--c-shadow)',
        slate: 'var(--c-slate)',
        stone: 'var(--c-stone)',
        ash: 'var(--c-ash)',
        fog: 'var(--c-fog)',
        mist: 'var(--c-mist)',
        linen: 'var(--c-linen)',
        paper: 'var(--c-paper)',
        amber0: 'var(--c-amber0)',
        amber1: 'var(--c-amber1)',
        amber2: 'var(--c-amber2)',
        amber3: 'var(--c-amber3)',
        amber4: 'var(--c-amber4)',
        rust: 'var(--c-rust)',
        ember: 'var(--c-ember)',
        flame: 'var(--c-flame)',
        moss: 'var(--c-moss)',
        leaf: 'var(--c-leaf)',
        lime: 'var(--c-lime)',
        teal: 'var(--c-teal)',
        cyan: 'var(--c-cyan)',
        violet: 'var(--c-violet)',
        orchid: 'var(--c-orchid)',
        gold: 'var(--c-gold)',
      },
      fontFamily: {
        head: ['"Press Start 2P"', 'monospace'],
        body: ['VT323', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
