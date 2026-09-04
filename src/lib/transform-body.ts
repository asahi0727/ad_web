import type { SiteConfig } from '../../site.config';
import { renderAdSlot } from './ads';
import { isAffiliateProvider, renderAffiliateBox } from './affiliate';
import { decodeEntities } from './html';
import { withBase } from './url';

// <p>[[affiliate:provider|query|label]]</p>  query と label は省略可
const AFFILIATE_RE = /<p>\s*\[\[affiliate:([a-z-]+)(?:\|([^|\]]*))?(?:\|([^\]]*))?\]\]\s*<\/p>/g;
const AD_RE = /<p>\s*\[\[ad\]\]\s*<\/p>/g;
// href="/..." だけを対象にする(// で始まるプロトコル相対は対象外)
const ROOT_HREF_RE = /href="\/(?!\/)([^"]*)"/g;

/**
 * Markdown から生成された記事本文 HTML に対して
 * 1. [[affiliate:...]] をリンクボックスに展開
 * 2. [[ad]] を広告枠に展開
 * 3. ルート相対リンクに base を付与
 */
export function transformBody(html: string, config: SiteConfig, base: string = import.meta.env.BASE_URL): string {
  let out = html.replace(AFFILIATE_RE, (match, provider: string, query?: string, label?: string) => {
    if (!isAffiliateProvider(provider)) return match;
    return renderAffiliateBox(
      {
        provider,
        query: query ? decodeEntities(query).trim() : undefined,
        label: label ? decodeEntities(label).trim() : undefined,
      },
      config,
    );
  });
  out = out.replace(AD_RE, () => renderAdSlot(config));
  out = out.replace(ROOT_HREF_RE, (_m, rest: string) => `href="${withBase(`/${rest}`, base)}"`);
  return out;
}
