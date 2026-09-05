import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../src/lib/categories';
import { renderEyecatchSvg, wrapTitle } from '../src/lib/eyecatch';

describe('wrapTitle', () => {
  it('splits a long title into lines of at most N characters', () => {
    expect(wrapTitle('あいうえおかきくけこさしすせそ', 5)).toEqual(['あいうえお', 'かきくけこ', 'さしすせそ']);
  });

  it('caps at 3 lines and appends an ellipsis', () => {
    expect(wrapTitle('あいうえおかきくけこさしすせそたちつてとなにぬねの', 5)).toEqual(['あいうえお', 'かきくけこ', 'さしすせ…']);
  });
});

describe('renderEyecatchSvg', () => {
  it('renders a sky-gradient SVG with the category label and escaped title', () => {
    const svg = renderEyecatchSvg({ category: 'lounge', title: 'テスト<記事>' });
    const { sky, label } = CATEGORIES.lounge;
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 1200 630"');
    expect(svg).toContain(`stop-color="${sky.from}"`);
    expect(svg).toContain(`stop-color="${sky.to}"`);
    expect(svg).toContain(label);
    expect(svg).toContain('テスト&lt;記事&gt;');
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="テスト&lt;記事&gt;"');
  });

  it('draws clouds and a plane silhouette', () => {
    const svg = renderEyecatchSvg({ category: 'aircraft', title: 'x' });
    expect(svg).toContain('class="ec-cloud"');
    expect(svg).toContain('class="ec-plane"');
  });

  it('uses a gradient id unique to the category so several eyecatches can share a page', () => {
    const a = renderEyecatchSvg({ category: 'miles', title: 'a' });
    const b = renderEyecatchSvg({ category: 'goods', title: 'b' });
    expect(a).toContain('id="ec-sky-miles"');
    expect(b).toContain('id="ec-sky-goods"');
    expect(a).toContain('url(#ec-sky-miles)');
  });
});

describe('CATEGORIES', () => {
  it('gives every category a badge color and a sky gradient', () => {
    for (const cat of Object.values(CATEGORIES)) {
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(cat.sky.from).toMatch(/^#[0-9a-f]{6}$/);
      expect(cat.sky.to).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
