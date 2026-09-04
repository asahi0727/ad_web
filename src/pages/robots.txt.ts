import type { APIContext } from 'astro';
import { withBase } from '../lib/url';

export function GET({ site }: APIContext) {
  const sitemap = new URL(withBase('/sitemap-index.xml'), site ?? 'http://localhost:4321').href;
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
