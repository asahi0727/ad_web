import { describe, expect, it } from 'vitest';
import { siteConfig } from '../site.config';
import { transformBody } from '../src/lib/transform-body';

describe('transformBody', () => {
  it('expands an affiliate placeholder paragraph into a link box', () => {
    const html = '<p>前置き</p><p>[[affiliate:rakuten-travel|羽田 ホテル|羽田のホテルを探す]]</p><p>後書き</p>';
    const out = transformBody(html, siteConfig, '/');
    expect(out).toContain('<p>前置き</p><div class="affiliate-box">');
    expect(out).toContain('羽田のホテルを探す');
    expect(out).toContain('rel="sponsored noopener"');
    expect(out).not.toContain('[[affiliate');
  });

  it('accepts placeholders without query or label', () => {
    const out = transformBody('<p>[[affiliate:jalan]]</p>', siteConfig, '/');
    expect(out).toContain('じゃらんで探す');
  });

  it('decodes entities inside the placeholder before rendering', () => {
    const out = transformBody('<p>[[affiliate:amazon|A&amp;B|買う]]</p>', siteConfig, '/');
    expect(out).toContain('k=A%26B');
  });

  it('leaves unknown providers as plain text', () => {
    const src = '<p>[[affiliate:foo]]</p>';
    expect(transformBody(src, siteConfig, '/')).toBe(src);
  });

  it('replaces [[ad]] with the ad slot (empty when unconfigured)', () => {
    expect(transformBody('<p>a</p><p>[[ad]]</p><p>b</p>', siteConfig, '/')).toBe('<p>a</p><p>b</p>');
    const cfg = { ...siteConfig, adsense: { client: 'ca-pub-1', slot: '1234567890' } };
    expect(transformBody('<p>[[ad]]</p>', cfg, '/')).toContain('class="ad-slot"');
  });

  it('prefixes root-relative hrefs with the base path', () => {
    const out = transformBody('<a href="/posts/foo/">x</a><a href="https://example.com/">y</a>', siteConfig, '/repo');
    expect(out).toContain('href="/repo/posts/foo/"');
    expect(out).toContain('href="https://example.com/"');
  });

  it('does not touch hrefs when base is root', () => {
    const out = transformBody('<a href="/posts/foo/">x</a>', siteConfig, '/');
    expect(out).toContain('href="/posts/foo/"');
  });
});

describe('transformBody photos', () => {
  const photos = [
    { id: 'seats', src: '/photos/posts/foo-seats.webp', alt: '座席', author: 'X', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', source: 'https://commons.wikimedia.org/wiki/File:Foo.jpg' },
  ];

  it('expands [[photo:id]] into a figure with credit', () => {
    const out = transformBody('<h2>a</h2><p>[[photo:seats]]</p><p>b</p>', siteConfig, '/repo', photos);
    expect(out).toContain('<h2>a</h2><figure class="post-photo">');
    expect(out).toContain('src="/repo/photos/posts/foo-seats.webp"');
    expect(out).toContain('撮影: X');
    expect(out).not.toContain('[[photo');
  });

  it('fails the build for an unregistered photo id', () => {
    expect(() => transformBody('<p>[[photo:nope]]</p>', siteConfig, '/', photos)).toThrow(/nope/);
  });

  it('leaves photo placeholders alone inside code blocks', () => {
    const src = '<pre><code>[[photo:seats]]</code></pre>';
    expect(transformBody(src, siteConfig, '/', photos)).toBe(src);
  });
});
