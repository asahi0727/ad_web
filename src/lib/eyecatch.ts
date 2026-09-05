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

/** ふわっとした雲(楕円の重なり)。x, y は雲の中心、s は大きさの倍率 */
function cloud(x: number, y: number, s: number, opacity: number): string {
  const e = (dx: number, dy: number, rx: number, ry: number) =>
    `<ellipse cx="${x + dx * s}" cy="${y + dy * s}" rx="${rx * s}" ry="${ry * s}"/>`;
  return `<g class="ec-cloud" fill="#ffffff" fill-opacity="${opacity}">${e(0, 0, 120, 44)}${e(-60, -14, 60, 40)}${e(30, -26, 76, 52)}${e(90, -4, 56, 36)}</g>`;
}

/** 小さな飛行機のシルエット(右上へ向かう) */
function plane(x: number, y: number, s: number): string {
  // 機体を原点中心に描き、拡大・回転して配置する
  const path =
    'M0 -6 L26 -6 L44 -30 L54 -30 L45 -6 L70 -6 Q84 -6 84 0 Q84 6 70 6 L45 6 L54 30 L44 30 L26 6 L0 6 L-10 16 L-18 16 L-13 0 L-18 -16 L-10 -16 Z';
  return `<g class="ec-plane" transform="translate(${x} ${y}) rotate(-22) scale(${s})"><path d="${path}" fill="#ffffff" fill-opacity="0.95"/><path d="M-70 4 L-2 4" stroke="#ffffff" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round" stroke-dasharray="14 10"/></g>`;
}

/** 1200x630 の空をモチーフにしたカテゴリ別アイキャッチ SVG(インライン用) */
export function renderEyecatchSvg({ category, title }: EyecatchOptions): string {
  const { label, sky } = CATEGORIES[category];
  const gradientId = `ec-sky-${category}`;
  const lines = wrapTitle(title, 16);
  const lineHeight = 84;
  const startY = 350 - ((lines.length - 1) * lineHeight) / 2;
  const text = lines
    .map(
      (line, i) =>
        `<text x="600" y="${startY + i * lineHeight}" text-anchor="middle" font-size="60" font-weight="700" fill="#ffffff" stroke="#0f172a" stroke-opacity="0.18" stroke-width="6" paint-order="stroke">${escapeHtml(line)}</text>`,
    )
    .join('');
  const safeTitle = escapeHtml(title);
  const labelWidth = Array.from(label).length * 34 + 56;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="${safeTitle}" font-family="'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif">`,
    `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.from}"/><stop offset="1" stop-color="${sky.to}"/></linearGradient></defs>`,
    `<rect width="1200" height="630" fill="url(#${gradientId})"/>`,
    cloud(220, 520, 1.6, 0.85),
    cloud(1010, 560, 1.3, 0.75),
    cloud(760, 470, 0.9, 0.5),
    cloud(120, 170, 0.7, 0.35),
    plane(1030, 150, 1.5),
    `<rect x="${600 - labelWidth / 2}" y="112" width="${labelWidth}" height="56" rx="28" fill="#ffffff" fill-opacity="0.22"/>`,
    `<text x="600" y="151" text-anchor="middle" font-size="32" font-weight="700" fill="#ffffff">${escapeHtml(label)}</text>`,
    text,
    '</svg>',
  ].join('');
}
