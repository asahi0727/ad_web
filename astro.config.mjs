import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Actions からは SITE_URL / BASE_PATH を環境変数で渡す。
// ローカルでは localhost とルートパスで動く。
const site = process.env.SITE_URL ?? 'http://localhost:4321';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap()],
});
