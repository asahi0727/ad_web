/**
 * カテゴリ定義。color は空港サインの色分けにならった濃い色で、
 * 一覧の行の左バーやカテゴリページの見出しに使う。
 */
export const CATEGORIES = {
  lounge: { label: '空港ラウンジ', color: '#2457C5' },
  miles: { label: 'マイル', color: '#C8102E' },
  aircraft: { label: '機材・座席', color: '#007A78' },
  domestic: { label: '国内旅行', color: '#D9731A' },
  overseas: { label: '海外旅行', color: '#6A3FA0' },
  goods: { label: '旅行グッズ', color: '#3D8B37' },
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
