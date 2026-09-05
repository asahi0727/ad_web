import { describe, expect, it } from 'vitest';
import { CATEGORY_KEYS } from '../src/lib/categories';
import { renderPictogram } from '../src/lib/pictograms';

describe('renderPictogram', () => {
  it('returns a decorative inline SVG for every category', () => {
    for (const key of CATEGORY_KEYS) {
      const svg = renderPictogram(key);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('viewBox="0 0 48 48"');
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('<path');
    }
  });

  it('applies the given size and class, and inherits color via currentColor', () => {
    const svg = renderPictogram('goods', { size: 20, className: 'pict' });
    expect(svg).toContain('width="20"');
    expect(svg).toContain('height="20"');
    expect(svg).toContain('class="pict"');
    expect(svg).toContain('fill="currentColor"');
  });

  it('gives each category a different drawing', () => {
    const drawings = new Set(CATEGORY_KEYS.map((key) => renderPictogram(key)));
    expect(drawings.size).toBe(CATEGORY_KEYS.length);
  });
});
