import { describe, expect, it } from 'vitest';
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
  it('renders an SVG with the category color and label', () => {
    const svg = renderEyecatchSvg({ category: 'lounge', title: 'テスト<記事>' });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 1200 630"');
    expect(svg).toContain('#1d4ed8');
    expect(svg).toContain('空港ラウンジ');
    expect(svg).toContain('テスト&lt;記事&gt;');
    expect(svg).toContain('role="img"');
  });
});
