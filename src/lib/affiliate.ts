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

/** 記事内に挿入するリンクボックスの HTML 文字列 */
export function renderAffiliateBox(opts: AffiliateBoxOptions, config: SiteConfig): string {
  const link = buildAffiliateLink(opts.provider, opts.query, config);
  const label = opts.label?.trim() || `${link.providerLabel}で探す`;
  return [
    '<div class="affiliate-box">',
    `<span class="affiliate-box__provider">${escapeHtml(link.providerLabel)}</span>`,
    `<a class="affiliate-box__link" href="${escapeHtml(link.href)}" target="_blank" rel="sponsored noopener">${escapeHtml(label)}</a>`,
    '<span class="affiliate-box__pr">[PR] 当サイトはアフィリエイト広告を利用しています</span>',
    '</div>',
  ].join('');
}
