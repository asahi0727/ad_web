import { describe, expect, it } from 'vitest';
import { renderPhotoFigure } from '../src/lib/photo-figure';

const photo = {
  src: '/photos/posts/foo.webp',
  alt: 'ラウンジの<席>',
  author: 'A & B',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  source: 'https://commons.wikimedia.org/wiki/File:Foo.jpg',
};

describe('renderPhotoFigure', () => {
  it('renders an image with base-prefixed src and a credit line', () => {
    const html = renderPhotoFigure(photo, '/repo');
    expect(html.startsWith('<figure class="post-photo">')).toBe(true);
    expect(html).toContain('src="/repo/photos/posts/foo.webp"');
    expect(html).toContain('alt="ラウンジの&lt;席&gt;"');
    expect(html).toContain('撮影: A &amp; B');
    expect(html).toContain('href="https://creativecommons.org/licenses/by/4.0/"');
    expect(html).toContain('>CC BY 4.0</a>');
    expect(html).toContain('>出典</a>');
    expect(html).toContain('loading="lazy"');
  });
});
