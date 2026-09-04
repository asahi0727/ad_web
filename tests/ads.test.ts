import { describe, expect, it } from 'vitest';
import { siteConfig } from '../site.config';
import { renderAdSlot } from '../src/lib/ads';

describe('renderAdSlot', () => {
  it('renders nothing when the AdSense client is empty', () => {
    expect(renderAdSlot({ ...siteConfig, adsense: { client: '', slot: '' } })).toBe('');
  });

  it('renders nothing when only the client is set', () => {
    expect(renderAdSlot({ ...siteConfig, adsense: { client: 'ca-pub-123', slot: '' } })).toBe('');
  });

  it('renders an adsbygoogle unit when both client and slot are set', () => {
    const html = renderAdSlot({ ...siteConfig, adsense: { client: 'ca-pub-123', slot: '9876543210' } });
    expect(html).toContain('class="ad-slot"');
    expect(html).toContain('data-ad-client="ca-pub-123"');
    expect(html).toContain('data-ad-slot="9876543210"');
    expect(html).toContain('adsbygoogle');
  });
});
