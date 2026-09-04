import type { SiteConfig } from '../../site.config';
import { escapeHtml } from './html';

/** AdSense の自動サイズ広告ユニット。client と slot の両方が未設定なら空文字 */
export function renderAdSlot(config: SiteConfig): string {
  const { client, slot } = config.adsense;
  if (!client || !slot) return '';
  return [
    '<div class="ad-slot">',
    `<ins class="adsbygoogle" style="display:block" data-ad-client="${escapeHtml(client)}" data-ad-slot="${escapeHtml(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`,
    '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    '</div>',
  ].join('');
}
