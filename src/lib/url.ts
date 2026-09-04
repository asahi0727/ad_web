/**
 * ルート相対パスに Astro の base(GitHub Pages のサブパス)を付ける。
 * withBase('/posts/foo/') -> '/repo/posts/foo/' (base が '/repo' のとき)
 */
export function withBase(path: string, base: string = import.meta.env.BASE_URL): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
