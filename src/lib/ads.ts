import type { SiteConfig } from '../../site.config';
import { escapeHtml } from './html';

/** AdSense の自動サイズ広告ユニット。client 未設定なら空文字 */
export function renderAdSlot(config: SiteConfig): string {
  const client = config.adsense.client;
  if (!client) return '';
  return [
    '<div class="ad-slot">',
    `<ins class="adsbygoogle" style="display:block" data-ad-client="${escapeHtml(client)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`,
    '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    '</div>',
  ].join('');
}
