import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CATEGORY_KEYS } from '../src/lib/categories';
import { PHOTOS, PHOTO_KEYS } from '../src/lib/photos';

describe('PHOTOS', () => {
  it('covers the hero and every category', () => {
    expect(PHOTO_KEYS).toContain('hero');
    for (const key of CATEGORY_KEYS) expect(PHOTOS[key]).toBeDefined();
  });

  it('points at files that exist in public/ and carries a credit for each', () => {
    for (const key of PHOTO_KEYS) {
      const p = PHOTOS[key];
      expect(existsSync(`public${p.src}`)).toBe(true);
      expect(existsSync(`public${p.srcSmall}`)).toBe(true);
      expect(p.author.length).toBeGreaterThan(0);
      expect(p.license).toMatch(/^(CC0|Public domain|CC BY)/);
      expect(p.source.startsWith('https://commons.wikimedia.org/wiki/File:')).toBe(true);
      expect(p.licenseUrl.startsWith('https://')).toBe(true);
    }
  });
});
