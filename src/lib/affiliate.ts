import type { SiteConfig } from '../../site.config';
import { escapeHtml } from './html';

export const AFFILIATE_PROVIDERS = ['rakuten-travel', 'jalan', 'expedia', 'amazon'] as const;
export type AffiliateProvider = (typeof AFFILIATE_PROVIDERS)[number];

export function isAffiliateProvider(s: string): s is AffiliateProvider {
  return (AFFILIATE_PROVIDERS as readonly string[]).includes(s);
}

interface ProviderDef {
  label: string;
  /** ID 未設定時、または広告リンクの飛び先として使う公式 URL */
  target: (query?: string) => string;
}

const PROVIDERS: Record<AffiliateProvider, ProviderDef> = {
  'rakuten-travel': { label: '楽天トラベル', target: () => 'https://travel.rakuten.co.jp/' },
  jalan: { label: 'じゃらん', target: () => 'https://www.jalan.net/' },
  expedia: { label: 'Expedia', target: () => 'https://www.expedia.co.jp/' },
  amazon: {
    label: 'Amazon',
    target: (query) => (query ? `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}` : 'https://www.amazon.co.jp/'),
  },
};

export interface AffiliateLink {
  href: string;
  isAffiliate: boolean;
  providerLabel: string;
}

export function buildAffiliateLink(
  provider: AffiliateProvider,
  query: string | undefined,
  config: SiteConfig,
): AffiliateLink {
  const def = PROVIDERS[provider];
  const target = def.target(query);
  const aff = config.affiliate;

  switch (provider) {
    case 'rakuten-travel': {
      if (!aff.rakutenTravel.id) return { href: target, isAffiliate: false, providerLabel: def.label };
      const enc = encodeURIComponent(target);
      return {
        href: `https://hb.afl.rakuten.co.jp/hgc/${aff.rakutenTravel.id}/?pc=${enc}&m=${enc}`,
        isAffiliate: true,
        providerLabel: def.label,
      };
    }
    case 'jalan':
      return { href: aff.jalan.url || target, isAffiliate: Boolean(aff.jalan.url), providerLabel: def.label };
    case 'expedia':
      return { href: aff.expedia.url || target, isAffiliate: Boolean(aff.expedia.url), providerLabel: def.label };
    case 'amazon': {
      if (!aff.amazon.tag) return { href: target, isAffiliate: false, providerLabel: def.label };
      const sep = target.includes('?') ? '&' : '?';
      return { href: `${target}${sep}tag=${encodeURIComponent(aff.amazon.tag)}`, isAffiliate: true, providerLabel: def.label };
    }
  }
}

export interface AffiliateBoxOptions {
  provider: AffiliateProvider;
  query?: string;
  label?: string;
}

/** リンク先の説明(1 文)と、アイコンの種類 */
const PROVIDER_COPY: Record<AffiliateProvider, { note: string; icon: 'hotel' | 'goods' }> = {
  'rakuten-travel': { note: '楽天トラベルの検索結果を開きます。国内のホテルや旅館を探すときの定番サイトです。', icon: 'hotel' },
  jalan: { note: 'じゃらんの検索結果を開きます。国内の宿と観光プランをまとめて探せます。', icon: 'hotel' },
  expedia: { note: 'Expedia の検索結果を開きます。海外のホテルを探すときに候補が多いサイトです。', icon: 'hotel' },
  amazon: { note: 'Amazon の検索結果を開きます。旅行グッズを比べて選ぶときに便利です。', icon: 'goods' },
};

/** 空港サイン風のピクトグラム(ベッド / スーツケース)。装飾用 */
const BOX_ICONS = {
  hotel:
    'M6 12h6a3 3 0 0 1 3 3v3h9a6 6 0 0 1 6 6v2h6V16a3 3 0 0 1 3-3h3v27h-6v-5H12v5H6V12zm6 9a3 3 0 0 0-3 3v2h18v-2a3 3 0 0 0-3-3H12z',
  goods:
    'M18 4h12a3 3 0 0 1 3 3v5h-4V8H19v4h-4V7a3 3 0 0 1 3-3zM10 14h28a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3h-1v4h-4v-4H15v4h-4v-4h-1a3 3 0 0 1-3-3V17a3 3 0 0 1 3-3zm5 5v14h4V19h-4zm14 0v14h4V19h-4z',
};

/** 記事内に挿入するリンクボックスの HTML 文字列 */
export function renderAffiliateBox(opts: AffiliateBoxOptions, config: SiteConfig): string {
  const link = buildAffiliateLink(opts.provider, opts.query, config);
  const copy = PROVIDER_COPY[opts.provider];
  const heading = opts.label?.trim() || `${link.providerLabel}で探す`;
  const query = opts.query?.trim();
  return [
    `<div class="affiliate-box affiliate-box--${copy.icon}">`,
    `<div class="affiliate-box__icon"><svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="${BOX_ICONS[copy.icon]}"/></svg></div>`,
    '<div class="affiliate-box__body">',
    `<span class="affiliate-box__provider">${escapeHtml(link.providerLabel)}</span>`,
    `<strong class="affiliate-box__heading">${escapeHtml(heading)}</strong>`,
    `<span class="affiliate-box__note">${escapeHtml(copy.note)}${query ? `<span class="affiliate-box__query">検索語: 「${escapeHtml(query)}」</span>` : ''}</span>`,
    `<a class="affiliate-box__link" href="${escapeHtml(link.href)}" target="_blank" rel="sponsored noopener">${escapeHtml(link.providerLabel)}で探す</a>`,
    '<span class="affiliate-box__pr">[PR] 当サイトはアフィリエイト広告を利用しています</span>',
    '</div>',
    '</div>',
  ].join('');
}
