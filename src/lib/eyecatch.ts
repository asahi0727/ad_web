import { CATEGORIES, type Category } from './categories';
import { escapeHtml } from './html';

const MAX_LINES = 3;

/** 1 行 maxChars 文字で折り返し、最大 3 行。超えた分は末尾を … にする */
export function wrapTitle(title: string, maxChars: number): string[] {
  const chars = Array.from(title.trim());
  const lines: string[] = [];
  for (let i = 0; i < chars.length && lines.length < MAX_LINES; i += maxChars) {
    lines.push(chars.slice(i, i + maxChars).join(''));
  }
  const overflow = chars.length > maxChars * MAX_LINES;
  if (overflow) {
    const last = Array.from(lines[MAX_LINES - 1]);
    lines[MAX_LINES - 1] = last.slice(0, maxChars - 1).join('') + '…';
  }
  return lines;
}

export interface EyecatchOptions {
  category: Category;
  title: string;
}

/** 1200x630 のカテゴリ配色アイキャッチ SVG(インライン用) */
export function renderEyecatchSvg({ category, title }: EyecatchOptions): string {
  const { label, color } = CATEGORIES[category];
  const lines = wrapTitle(title, 16);
  const lineHeight = 84;
  const startY = 330 - ((lines.length - 1) * lineHeight) / 2;
  const text = lines
    .map((line, i) => `<text x="600" y="${startY + i * lineHeight}" text-anchor="middle" font-size="64" font-weight="700" fill="#ffffff">${escapeHtml(line)}</text>`)
    .join('');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="${escapeHtml(title)}" font-family="-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif">`,
    `<rect width="1200" height="630" fill="${color}"/>`,
    '<rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="4"/>',
    `<text x="600" y="150" text-anchor="middle" font-size="36" fill="#ffffff" fill-opacity="0.9">${escapeHtml(label)}</text>`,
    text,
    '</svg>',
  ].join('');
}
