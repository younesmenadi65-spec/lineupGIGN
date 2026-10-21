import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0F18', panel: '#141A24', raised: '#1C2330', line: '#2A3342',
        text: '#E6E9EE', muted: '#8B94A3', accent: '#FF6B2C',
        smoke: '#8FA9C4', flash: '#F2C230', frag: '#E5484D',
      },
      fontFamily: { display: ['var(--font-display)', 'sans-serif'], sans: ['var(--font-body)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
