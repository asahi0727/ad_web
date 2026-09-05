import { escapeHtml } from './html';
import { withBase } from './url';

/** 記事写真 1 枚分のメタデータ(frontmatter の photo / photos[] と同じ形) */
export interface ArticlePhoto {
  src: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}

/** 写真とクレジットを <figure> として描画する(先頭写真・本文中の写真で共通) */
export function renderPhotoFigure(photo: ArticlePhoto, base: string = import.meta.env.BASE_URL): string {
  const alt = escapeHtml(photo.alt);
  return (
    `<figure class="post-photo">` +
    `<img src="${escapeHtml(withBase(photo.src, base))}" alt="${alt}" width="1600" height="900" loading="lazy" decoding="async">` +
    `<figcaption>${alt}(撮影: ${escapeHtml(photo.author)} / ` +
    `<a href="${escapeHtml(photo.licenseUrl)}" target="_blank" rel="noopener">${escapeHtml(photo.license)}</a> / ` +
    `<a href="${escapeHtml(photo.source)}" target="_blank" rel="noopener">出典</a>)</figcaption>` +
    `</figure>`
  );
}
