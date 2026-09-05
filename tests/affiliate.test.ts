import { describe, expect, it } from 'vitest';
import type { SiteConfig } from '../site.config';
import { siteConfig } from '../site.config';
import { buildAffiliateLink, isAffiliateProvider, renderAffiliateBox } from '../src/lib/affiliate';

function configWith(overrides: Partial<SiteConfig['affiliate']>): SiteConfig {
  return { ...siteConfig, affiliate: { ...siteConfig.affiliate, ...overrides } };
}

// 実際の site.config.ts に ID が入っていても影響を受けないよう、明示的に空にする
const empty = configWith({
  rakutenTravel: { id: '' },
  jalan: { url: '' },
  expedia: { url: '' },
  amazon: { tag: '' },
});

describe('isAffiliateProvider', () => {
  it('accepts known providers and rejects others', () => {
    expect(isAffiliateProvider('rakuten-travel')).toBe(true);
    expect(isAffiliateProvider('amazon')).toBe(true);
    expect(isAffiliateProvider('foo')).toBe(false);
  });
});

describe('buildAffiliateLink', () => {
  it('links to the official site when rakuten id is empty', () => {
    const link = buildAffiliateLink('rakuten-travel', undefined, empty);
    expect(link.href).toBe('https://travel.rakuten.co.jp/');
    expect(link.isAffiliate).toBe(false);
    expect(link.providerLabel).toBe('楽天トラベル');
  });

  it('wraps the rakuten target with the affiliate id', () => {
    const cfg = configWith({ rakutenTravel: { id: 'abc.def' } });
    const link = buildAffiliateLink('rakuten-travel', undefined, cfg);
    expect(link.href).toBe(
      'https://hb.afl.rakuten.co.jp/hgc/abc.def/?pc=https%3A%2F%2Ftravel.rakuten.co.jp%2F&m=https%3A%2F%2Ftravel.rakuten.co.jp%2F',
    );
    expect(link.isAffiliate).toBe(true);
  });

  it('uses the configured jalan url as-is', () => {
    const cfg = configWith({ jalan: { url: 'https://px.a8.net/svt/ejp?a8mat=XYZ' } });
    expect(buildAffiliateLink('jalan', undefined, cfg).href).toBe('https://px.a8.net/svt/ejp?a8mat=XYZ');
    expect(buildAffiliateLink('jalan', undefined, empty).href).toBe('https://www.jalan.net/');
  });

  it('uses the configured expedia url as-is', () => {
    const cfg = configWith({ expedia: { url: 'https://px.a8.net/svt/ejp?a8mat=EXP' } });
    expect(buildAffiliateLink('expedia', undefined, cfg).href).toBe('https://px.a8.net/svt/ejp?a8mat=EXP');
    expect(buildAffiliateLink('expedia', undefined, cfg).isAffiliate).toBe(true);
    expect(buildAffiliateLink('expedia', undefined, empty).href).toBe('https://www.expedia.co.jp/');
    expect(buildAffiliateLink('expedia', undefined, empty).isAffiliate).toBe(false);
  });

  it('builds an amazon search url with the tag when set', () => {
    expect(buildAffiliateLink('amazon', 'ネックピロー', empty).href).toBe(
      'https://www.amazon.co.jp/s?k=%E3%83%8D%E3%83%83%E3%82%AF%E3%83%94%E3%83%AD%E3%83%BC',
    );
    const cfg = configWith({ amazon: { tag: 'example-22' } });
    expect(buildAffiliateLink('amazon', 'ネックピロー', cfg).href).toBe(
      'https://www.amazon.co.jp/s?k=%E3%83%8D%E3%83%83%E3%82%AF%E3%83%94%E3%83%AD%E3%83%BC&tag=example-22',
    );
  });
});

describe('renderAffiliateBox', () => {
  it('renders a sponsored link with PR label and escaped text', () => {
    const html = renderAffiliateBox({ provider: 'amazon', query: 'a&b', label: '<b>探す</b>' }, empty);
    expect(html).toContain('class="affiliate-box affiliate-box--goods"');
    expect(html).toContain('rel="sponsored noopener"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('[PR]');
    expect(html).toContain('&lt;b&gt;探す&lt;/b&gt;');
    expect(html).not.toContain('<b>探す</b>');
  });

  it('shows a pictogram, a provider note, the search term and a provider button', () => {
    const html = renderAffiliateBox({ provider: 'rakuten-travel', query: '羽田 ホテル', label: '羽田のホテルを探す' }, empty);
    expect(html).toContain('affiliate-box--hotel');
    expect(html).toContain('<svg');
    expect(html).toContain('class="affiliate-box__heading">羽田のホテルを探す<');
    expect(html).toContain('楽天トラベルの検索結果を開きます');
    expect(html).toContain('検索語: 「羽田 ホテル」');
    expect(html).toContain('>楽天トラベルで探す</a>');
    const amazon = renderAffiliateBox({ provider: 'amazon' }, empty);
    expect(amazon).toContain('affiliate-box--goods');
    expect(amazon).not.toContain('検索語');
  });

  it('falls back to a default label built from the provider name', () => {
    const html = renderAffiliateBox({ provider: 'rakuten-travel' }, empty);
    expect(html).toContain('楽天トラベルで探す');
  });
});
