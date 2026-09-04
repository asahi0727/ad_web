const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

/** エントリ id(ファイル名)から日付プレフィックスを除いた URL 用スラッグ */
export function postSlug(id: string): string {
  return id.replace(DATE_PREFIX, '');
}

/** 記事ページのルート相対パス(base なし) */
export function postPath(id: string): string {
  return `/posts/${postSlug(id)}/`;
}

/** 公開日の新しい順に並べた新しい配列を返す */
export function sortByDateDesc<T extends { data: { pubDate: Date } }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** 2026年9月4日 のような表記(UTC 基準) */
export function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
}
