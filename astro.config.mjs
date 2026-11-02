import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({
  output: 'static',
  site: 'https://diegohernan1994.github.io',
  base: '/the-abc-pro-dev/',
  vite: { cacheDir: './.vite-local' },
  integrations: [react()]
});
