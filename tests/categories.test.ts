import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_KEYS } from '../src/lib/categories';

describe('CATEGORIES', () => {
  it('lists six categories in display order', () => {
    expect(CATEGORY_KEYS).toEqual(['lounge', 'miles', 'aircraft', 'domestic', 'overseas', 'goods']);
  });

  it('gives every category a label and a 6-digit hex color', () => {
    for (const key of CATEGORY_KEYS) {
      expect(CATEGORIES[key].label.length).toBeGreaterThan(0);
      expect(CATEGORIES[key].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
