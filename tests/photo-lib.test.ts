import { describe, expect, it } from 'vitest';
import { cropBox, normalizeLicense, stripHtml, toCandidate, toFrontmatter } from '../scripts/photo-lib.mjs';

function page(overrides: Record<string, unknown> = {}, meta: Record<string, string> = {}) {
  const extmetadata = Object.fromEntries(Object.entries({ LicenseShortName: 'CC BY 4.0', Artist: 'Someone', ...meta }).map(([k, v]) => [k, { value: v }]));
  return {
    title: 'File:Example.jpg',
    imageinfo: [{ width: 3000, height: 2000, thumburl: 'https://upload.wikimedia.org/x/1600px-Example.jpg', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Example.jpg', extmetadata, ...overrides }],
  };
}

describe('normalizeLicense', () => {
  it('accepts CC0, public domain and CC BY / BY-SA', () => {
    expect(normalizeLicense('CC0')).toBe('CC0');
    expect(normalizeLicense('Public domain')).toBe('Public domain');
    expect(normalizeLicense('CC BY-SA 4.0')).toBe('CC BY-SA 4.0');
  });

  it('rejects non-commercial and no-derivatives licenses', () => {
    expect(normalizeLicense('CC BY-NC 4.0')).toBeNull();
    expect(normalizeLicense('CC BY-ND 2.0')).toBeNull();
    expect(normalizeLicense('Fair use')).toBeNull();
  });
});

describe('toCandidate', () => {
  it('keeps a large landscape photo with an allowed license and an author', () => {
    const c = toCandidate(page());
    expect(c).not.toBeNull();
    expect(c?.license).toBe('CC BY 4.0');
    expect(c?.author).toBe('Someone');
    expect(c?.licenseUrl).toContain('creativecommons.org');
  });

  it('drops portrait, small, unlicensed or anonymous files', () => {
    expect(toCandidate(page({ width: 1000, height: 1500 }))).toBeNull();
    expect(toCandidate(page({ width: 1200, height: 800 }))).toBeNull();
    expect(toCandidate(page({}, { LicenseShortName: 'CC BY-NC-SA 3.0' }))).toBeNull();
    expect(toCandidate(page({}, { Artist: '' }))).toBeNull();
  });

  it('strips HTML from the author field', () => {
    const c = toCandidate(page({}, { Artist: '<a href="/wiki/User:Foo">Foo</a>' }));
    expect(c?.author).toBe('Foo');
  });
});

describe('cropBox', () => {
  it('crops a wide image horizontally and a tall image vertically, centered', () => {
    expect(cropBox(4000, 1000, 16 / 9)).toEqual({ left: 1111, top: 0, width: 1778, height: 1000 });
    expect(cropBox(1600, 1600, 16 / 9)).toEqual({ left: 0, top: 350, width: 1600, height: 900 });
  });
});

describe('stripHtml / toFrontmatter', () => {
  it('produces a quoted YAML block', () => {
    expect(stripHtml('<b>a</b>  b')).toBe('a b');
    const yaml = toFrontmatter({ src: '/photos/posts/x.webp', alt: 'a "b"', author: 'A', license: 'CC0', licenseUrl: 'https://l', source: 'https://s' });
    expect(yaml.split('\n')[0]).toBe('photo:');
    expect(yaml).toContain('  alt: "a \\"b\\""');
    expect(yaml).toContain('  src: "/photos/posts/x.webp"');
  });
});
