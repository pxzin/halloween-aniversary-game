import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      // Halloween theme colors - Persona 5 inspired
      'halloween-orange': '#ff5e00',
      'halloween-purple': '#8a2be2',
      'halloween-dark': '#0a0015',
      'halloween-dark-2': '#1a0f2e',
      'halloween-dark-3': '#1a0a2e',
      'halloween-dark-4': '#0f051d',
      'halloween-dark-5': '#0a0a0a',
      'halloween-dark-6': '#1a0a25',
      'halloween-light-purple': '#b388ff',
    },
    fontFamily: {
      'game': ['Arial Black', 'Arial Bold', 'Gadget', 'sans-serif'],
    },
  },
  shortcuts: {
    // Halloween UI shortcuts
    'halloween-gradient-bg': 'bg-gradient-to-br from-halloween-dark to-halloween-dark-2',
    'halloween-border': 'border-3 border-halloween-orange',
    'halloween-glow-orange': 'shadow-[0_0_20px_rgba(255,94,0,0.6)]',
    'halloween-glow-purple': 'shadow-[0_0_20px_rgba(138,43,226,0.6)]',
    'halloween-text-shadow': 'drop-shadow-[0_0_10px_rgba(255,94,0,0.8)]',
  },
  safelist: [
    // Ensure these classes are always generated
    'halloween-orange',
    'halloween-purple',
    'halloween-dark',
    'font-game',
  ],
})
