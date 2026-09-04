export const CATEGORIES = {
  lounge: { label: '空港ラウンジ', color: '#1d4ed8' },
  miles: { label: 'マイル', color: '#b45309' },
  aircraft: { label: '機材・座席', color: '#0f766e' },
  domestic: { label: '国内旅行', color: '#be123c' },
  overseas: { label: '海外旅行', color: '#6d28d9' },
  goods: { label: '旅行グッズ', color: '#4d7c0f' },
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
