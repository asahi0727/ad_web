import type { Category } from './categories';

/**
 * 空港の案内サイン風のピクトグラム(48x48、塗りは currentColor)。
 * 太いシルエットで、小さく表示しても読めるように単純な形にしている。
 */
const PATHS: Record<Category, string> = {
  // ラウンジ: ソファ
  lounge:
    'M8 20a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v3h-2a4 4 0 0 0-4 4v3H14v-3a4 4 0 0 0-4-4H8v-3z' +
    'M4 25h4a2 2 0 0 1 2 2v7h28v-7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2v3h-4v-3H10v3H6v-3H4a2 2 0 0 1-2-2V27a2 2 0 0 1 2-2z',
  // マイル: 搭乗券(半券の切り取り部分がある券)
  miles:
    'M6 12a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V12z' +
    'M31 9a3.5 3.5 0 0 0 7 0h-7zM31 39a3.5 3.5 0 0 1 7 0h-7z' +
    'M33 14h2v20h-2z' +
    'M11 15h15v3H11zM11 21h11v3H11zM11 27h15v3H11z',
  // 機材・座席: 座席(横から見たシート)
  aircraft:
    'M14 6h6a3 3 0 0 1 3 3l1 16h10a3 3 0 0 1 3 3v3h-4v-2H22a4 4 0 0 1-4-3.6L16 10h-2V6z' +
    'M8 32h30a3 3 0 0 1 3 3v2H8a3 3 0 0 1-3-3v-2h3zM9 38h4v6H9zM35 38h4v6h-4z',
  // 国内旅行: 山と太陽
  domestic:
    'M34 8a6 6 0 1 1 0 12 6 6 0 0 1 0-12z' +
    'M4 40 18 16l6 10 4-5 16 19H4z',
  // 海外旅行: 地球
  overseas:
    'M24 4a20 20 0 1 1 0 40 20 20 0 0 1 0-40zm0 4c-2.5 0-5 4.4-6.2 10h12.4C29 12.4 26.5 8 24 8zm-9.9 3.4A16 16 0 0 0 8.5 18h5.3c.5-2.8 1.3-5.3 2.3-7.4-.7.2-1.4.5-2 .8zM8.1 22a16.7 16.7 0 0 0 0 4h5.1a37 37 0 0 1 0-4H8.1zm.4 8a16 16 0 0 0 5.6 6.6c-1-2.1-1.8-4.6-2.3-7.4H8.5zm9.3 0c1.2 5.6 3.7 10 6.2 10s5-4.4 6.2-10H17.8zm-.6-4h13.6a33 33 0 0 0 0-4H17.2a33 33 0 0 0 0 4zm16.4-8h5.3a16 16 0 0 0-5.6-6.6c1 2.1 1.8 4.6 2.3 7.4zm1 4a37 37 0 0 1 0 4h5.1a16.7 16.7 0 0 0 0-4h-5.1zm-1 8c-.5 2.8-1.3 5.3-2.3 7.4A16 16 0 0 0 39.5 30h-5.3z',
  // 旅行グッズ: キャリーケース
  goods:
    'M18 4h12a3 3 0 0 1 3 3v5h-4V8H19v4h-4V7a3 3 0 0 1 3-3z' +
    'M10 14h28a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3h-1v4h-4v-4H15v4h-4v-4h-1a3 3 0 0 1-3-3V17a3 3 0 0 1 3-3zm5 5v14h4V19h-4zm14 0v14h4V19h-4z',
};

export interface PictogramOptions {
  /** 表示サイズ(px)。既定 24 */
  size?: number;
  /** 付与する class */
  className?: string;
}

/** カテゴリのピクトグラムを装飾用インライン SVG として返す(読み上げ対象外) */
export function renderPictogram(category: Category, { size = 24, className }: PictogramOptions = {}): string {
  const cls = className ? ` class="${className}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"${cls} aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="${PATHS[category]}"/></svg>`;
}
