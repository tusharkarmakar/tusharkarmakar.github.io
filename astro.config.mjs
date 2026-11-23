import { defineConfig } from 'astro/config';

// Live at https://tusharkarmakar.github.io (change `site` if you add a custom domain).
export default defineConfig({
  site: 'https://tusharkarmakar.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
