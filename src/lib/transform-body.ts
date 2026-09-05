import type { SiteConfig } from '../../site.config';
import { renderAdSlot } from './ads';
import { isAffiliateProvider, renderAffiliateBox } from './affiliate';
import { decodeEntities } from './html';
import { renderPhotoFigure, type ArticlePhoto } from './photo-figure';
import { withBase } from './url';

// <p>[[affiliate:provider|query|label]]</p>  query と label は省略可
const AFFILIATE_RE = /<p>\s*\[\[affiliate:([a-z-]+)(?:\|([^|\]]*))?(?:\|([^\]]*))?\]\]\s*<\/p>/g;
const AD_RE = /<p>\s*\[\[ad\]\]\s*<\/p>/g;
// <p>[[photo:id]]</p>  frontmatter の photos[] に登録した id
const PHOTO_RE = /<p>\s*\[\[photo:([a-z0-9-]+)\]\]\s*<\/p>/g;
// href="/..." だけを対象にする(// で始まるプロトコル相対は対象外)
const ROOT_HREF_RE = /href="\/(?!\/)([^"]*)"/g;

/** 本文中に置ける写真(id 付き) */
export type InlinePhoto = ArticlePhoto & { id: string };

/**
 * Markdown から生成された記事本文 HTML に対して
 * 1. [[affiliate:...]] をリンクボックスに展開
 * 2. [[ad]] を広告枠に展開
 * 3. [[photo:id]] を写真(クレジット付き)に展開。未登録の id はビルドエラーにする
 * 4. ルート相対リンクに base を付与
 */
export function transformBody(
  html: string,
  config: SiteConfig,
  base: string = import.meta.env.BASE_URL,
  photos: InlinePhoto[] = [],
): string {
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
  out = out.replace(PHOTO_RE, (_m, id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (!photo) {
      throw new Error(`[[photo:${id}]] に対応する写真が frontmatter の photos に登録されていません(登録済み: ${photos.map((p) => p.id).join(', ') || 'なし'})`);
    }
    return renderPhotoFigure(photo, base);
  });
  out = out.replace(ROOT_HREF_RE, (_m, rest: string) => `href="${withBase(`/${rest}`, base)}"`);
  return out;
}
