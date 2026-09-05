/**
 * カテゴリ定義。
 * color: バッジ・見出しなどに使う濃い色
 * sky:   アイキャッチの空グラデーション(上→下)。カテゴリごとに空の表情を変える
 */
export const CATEGORIES = {
  lounge: { label: '空港ラウンジ', color: '#2563eb', sky: { from: '#1e3a8a', to: '#60a5fa' } }, // 夜の空港
  miles: { label: 'マイル', color: '#d97706', sky: { from: '#c2410c', to: '#fcd34d' } }, // 夕焼け
  aircraft: { label: '機材・座席', color: '#0284c7', sky: { from: '#0369a1', to: '#bae6fd' } }, // 昼の青空
  domestic: { label: '国内旅行', color: '#e11d48', sky: { from: '#be123c', to: '#fda4af' } }, // 朝焼け
  overseas: { label: '海外旅行', color: '#7c3aed', sky: { from: '#4c1d95', to: '#c4b5fd' } }, // 宵の空
  goods: { label: '旅行グッズ', color: '#0d9488', sky: { from: '#0f766e', to: '#99f6e4' } }, // 海辺の空
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
