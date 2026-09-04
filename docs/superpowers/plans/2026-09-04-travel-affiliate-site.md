# 旅行・飛行機アフィリエイトサイト 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Astro 製の静的アフィリエイトサイトを GitHub Pages に無料で公開し、Claude Code のクラウド定期実行が毎週記事 PR を出せる状態にする。

**Architecture:** Astro 7 のコンテンツコレクション(glob loader)で `src/content/posts/*.md` を記事として扱う。記事本文中のアフィリエイト枠は `[[affiliate:provider|query|label]]` というプレーンテキストのプレースホルダーで書き、`PostLayout` が `Astro.slots.render` で本文 HTML を取得してから純粋関数 `transformBody()` で展開する(MDX 不要)。設定値は `site.config.ts` に集約し、ID 未設定でもサイトが壊れない。デプロイは GitHub Actions、テストは vitest による純粋関数のユニットテストと `astro build` の成功で担保する。

**Tech Stack:** Node 22+、Astro 7.3.x、@astrojs/sitemap 3.7.x、@astrojs/rss 4.0.x、vitest、TypeScript(strict)、素の CSS。

**Spec:** `docs/superpowers/specs/2026-09-04-travel-affiliate-site-design.md`

## Global Constraints

- 費用ゼロ: 有料サービス・有料 API を一切追加しない。画像生成もしない。
- Astro 7 の Rust コンパイラは閉じタグ必須。`.astro` ファイルでは void 要素(`<br>`, `<img>`, `<hr>`, `<input>`, `<meta>`, `<link>`)以外は必ず閉じる。
- `astro.config.mjs` は `compressHTML: true`(v6 互換の HTML 空白処理)を設定する。
- Zod は `import { z } from 'astro/zod'` から読み込む。
- コンテンツ設定ファイルは `src/content.config.ts`(`src/content/config.ts` ではない)。
- 内部リンクは必ず `withBase()` を通す(GitHub Pages のサブパス配信対応)。
- アフィリエイトリンクは `rel="sponsored noopener"` と `[PR]` 表記を必ず付ける(景品表示法のステルスマーケティング規制対応)。
- 記事カテゴリは `lounge / miles / aircraft / domestic / overseas / goods` の 6 種のみ。
- 各コミットの前に `npm test` と `npm run build` を通す。
- コミットメッセージ末尾に以下を付ける:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01Ljcx5yp6FZgRZpuqaPbGXQ
  ```
- 仕様からの逸脱(承認済み): 記事ごとの OGP 画像は生成しない。SNS クローラーが SVG を画像として扱わないため。`og:title` / `og:description` / `og:url` のみ出力する。

## ファイル構成

| パス | 責務 |
|---|---|
| `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts` | プロジェクト設定 |
| `site.config.ts` | サイト名・説明・アフィリエイト ID・AdSense ID・GA4 ID・問い合わせフォーム URL |
| `src/lib/url.ts` | `withBase()` 内部リンクのベースパス付与 |
| `src/lib/html.ts` | `escapeHtml()`, `decodeEntities()` |
| `src/lib/categories.ts` | カテゴリ定義(キー、表示名、色) |
| `src/lib/posts.ts` | `postSlug()`, `postPath()`, `sortByDateDesc()`, `formatDate()` |
| `src/lib/affiliate.ts` | `buildAffiliateLink()`, `renderAffiliateBox()` |
| `src/lib/ads.ts` | `renderAdSlot()` |
| `src/lib/eyecatch.ts` | `renderEyecatchSvg()`, `wrapTitle()` |
| `src/lib/transform-body.ts` | `transformBody()` プレースホルダー展開と内部リンクのベース付与 |
| `src/content.config.ts` | コンテンツコレクション `posts` のスキーマ |
| `src/content/posts/*.md` | 記事 |
| `src/components/*.astro` | `Eyecatch`, `AdSlot`, `AiNotice`, `TOC`, `PostCard`, `SiteHeader`, `SiteFooter` |
| `src/layouts/BaseLayout.astro`, `src/layouts/PostLayout.astro` | 共通レイアウト、記事レイアウト |
| `src/pages/**` | ルーティング(トップ、記事、カテゴリ、about、privacy、contact、404、rss.xml、robots.txt) |
| `src/styles/global.css` | 全体スタイル |
| `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | PR 検証、公開 |
| `CLAUDE.md` | エージェント向け編集方針 |
| `topics/backlog.md` | ネタ候補 |
| `docs/SETUP.md`, `docs/routine-prompt.md` | 運用者向け手順、定期実行のプロンプト |

---

### Task 1: プロジェクト雛形とビルド成功

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `site.config.ts`, `src/styles/global.css`, `src/lib/url.ts`, `src/lib/categories.ts`, `src/layouts/BaseLayout.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/pages/index.astro`, `public/favicon.svg`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Produces: `siteConfig` オブジェクト(型 `SiteConfig`)。以降の全タスクが `import { siteConfig } from '../../site.config'` で参照する。
- Produces: `withBase(path: string, base?: string): string`(Task 2 でテストを固定する)
- Produces: `CATEGORIES`, `CATEGORY_KEYS`, `type Category`
- Produces: `BaseLayout` の props `{ title: string; description: string; path?: string }`。

- [ ] **Step 1: 依存をインストールする**

```bash
cd D:/develop/ad_web
npm init -y
npm install astro@^7.3.1 @astrojs/sitemap@^3.7.4 @astrojs/rss@^4.0.19
npm install -D vitest typescript
```

- [ ] **Step 2: `package.json` の scripts と type を書き換える**

`package.json` を以下の内容にする(`dependencies` / `devDependencies` は Step 1 で入ったものをそのまま残す):

```json
{
  "name": "ad_web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "astro": "astro"
  }
}
```

- [ ] **Step 3: 設定ファイルを作る**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Actions からは SITE_URL / BASE_PATH を環境変数で渡す。
// ローカルでは localhost とルートパスで動く。
const site = process.env.SITE_URL ?? 'http://localhost:4321';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap()],
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

`vitest.config.ts`:

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
```

`site.config.ts`:

```ts
export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  lang: string;
  /** Google フォームなどの埋め込み URL。空なら「準備中」表示 */
  contactFormUrl: string;
  adsense: {
    /** 例: 'ca-pub-1234567890123456'。空なら広告枠を出さない */
    client: string;
  };
  analytics: {
    /** 例: 'G-XXXXXXXXXX'。空ならタグを出さない */
    ga4: string;
  };
  affiliate: {
    /** 楽天アフィリエイト ID。例: '0a1b2c3d.e4f5g6h7.0a1b2c3d.i8j9k0l1' */
    rakutenTravel: { id: string };
    /** A8.net などで発行された じゃらん の広告リンク URL(丸ごと) */
    jalan: { url: string };
    /** A8.net などで発行された Expedia の広告リンク URL(丸ごと) */
    expedia: { url: string };
    /** Amazon アソシエイトのトラッキング ID。例: 'example-22' */
    amazon: { tag: string };
  };
}

export const siteConfig: SiteConfig = {
  title: 'そらたび手帖',
  description: '空港ラウンジ、マイル、機材・座席、旅行の準備まで。飛行機旅を少しラクにする情報をまとめています。',
  author: 'そらたび手帖 編集部',
  lang: 'ja',
  contactFormUrl: '',
  adsense: { client: '' },
  analytics: { ga4: '' },
  affiliate: {
    rakutenTravel: { id: '' },
    jalan: { url: '' },
    expedia: { url: '' },
    amazon: { tag: '' },
  },
};
```

- [ ] **Step 4: スモークテストを書く**

`tests/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../site.config';

describe('siteConfig', () => {
  it('has a title and description', () => {
    expect(siteConfig.title.length).toBeGreaterThan(0);
    expect(siteConfig.description.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 5: テストを実行して vitest が動くことを確認する**

Run: `npm test`
Expected: 1 passed。エラーで落ちる場合は `vitest.config.ts` の `getViteConfig` 読み込みを見直す。

- [ ] **Step 6: ライブラリの最小実装を置く**

`src/lib/url.ts`:

```ts
/**
 * ルート相対パスに Astro の base(GitHub Pages のサブパス)を付ける。
 * withBase('/posts/foo/') -> '/repo/posts/foo/' (base が '/repo' のとき)
 */
export function withBase(path: string, base: string = import.meta.env.BASE_URL): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
```

`src/lib/categories.ts`:

```ts
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
```

- [ ] **Step 7: グローバル CSS を書く**

`src/styles/global.css`:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1f2933;
  --color-muted: #616e7c;
  --color-line: #e4e7eb;
  --color-accent: #1d4ed8;
  --color-accent-bg: #eff6ff;
  --max-width: 760px;
  --font: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif;
}

* { box-sizing: border-box; }

html { font-family: var(--font); color: var(--color-text); background: var(--color-bg); line-height: 1.8; }
body { margin: 0; }
a { color: var(--color-accent); }
img, svg { max-width: 100%; height: auto; }

.container { max-width: var(--max-width); margin: 0 auto; padding: 0 1rem; }

.site-header { border-bottom: 1px solid var(--color-line); }
.site-header .container { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; padding-top: 0.75rem; padding-bottom: 0.75rem; }
.site-header__title { font-weight: 700; font-size: 1.25rem; text-decoration: none; color: var(--color-text); }
.site-nav { display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; font-size: 0.9rem; }
.site-nav a { text-decoration: none; color: var(--color-muted); }
.site-nav a:hover { color: var(--color-accent); }

.site-footer { border-top: 1px solid var(--color-line); margin-top: 3rem; padding: 1.5rem 0; font-size: 0.85rem; color: var(--color-muted); }
.site-footer nav { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; margin-bottom: 0.5rem; }

main { padding: 1.5rem 0; }

.post-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 1.25rem; }
.post-card { display: grid; grid-template-columns: 120px 1fr; gap: 1rem; align-items: start; }
.post-card__eyecatch { border-radius: 6px; overflow: hidden; display: block; }
.post-card__title { margin: 0 0 0.25rem; font-size: 1.05rem; }
.post-card__title a { text-decoration: none; color: var(--color-text); }
.post-card__meta { font-size: 0.8rem; color: var(--color-muted); }
.post-card__desc { margin: 0.25rem 0 0; font-size: 0.9rem; color: var(--color-muted); }
@media (max-width: 480px) { .post-card { grid-template-columns: 1fr; } }

.badge { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 999px; font-size: 0.75rem; color: #fff; text-decoration: none; }

.post-header__title { font-size: 1.7rem; line-height: 1.4; margin: 0.5rem 0; }
.post-header__meta { font-size: 0.85rem; color: var(--color-muted); display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
.post-eyecatch { margin: 1rem 0; border-radius: 8px; overflow: hidden; }

.toc { background: #f8fafc; border: 1px solid var(--color-line); border-radius: 8px; padding: 1rem 1.25rem; margin: 1.5rem 0; font-size: 0.9rem; }
.toc__title { font-weight: 700; margin-bottom: 0.5rem; }
.toc ol { margin: 0; padding-left: 1.25rem; }
.toc ol ol { padding-left: 1rem; }

.post-body h2 { font-size: 1.35rem; margin-top: 2.5rem; padding-bottom: 0.3rem; border-bottom: 2px solid var(--color-line); }
.post-body h3 { font-size: 1.1rem; margin-top: 1.75rem; }
.post-body table { border-collapse: collapse; width: 100%; font-size: 0.9rem; display: block; overflow-x: auto; }
.post-body th, .post-body td { border: 1px solid var(--color-line); padding: 0.5rem 0.75rem; text-align: left; }
.post-body th { background: #f8fafc; }
.post-body blockquote { border-left: 4px solid var(--color-line); margin: 1rem 0; padding: 0.25rem 1rem; color: var(--color-muted); }

.affiliate-box { border: 1px solid var(--color-accent); background: var(--color-accent-bg); border-radius: 8px; padding: 1rem 1.25rem; margin: 1.75rem 0; }
.affiliate-box__provider { font-size: 0.8rem; color: var(--color-muted); }
.affiliate-box__link { display: block; font-weight: 700; font-size: 1.05rem; margin: 0.25rem 0; }
.affiliate-box__pr { font-size: 0.75rem; color: var(--color-muted); }

.ad-slot { margin: 1.75rem 0; text-align: center; }

.ai-notice { margin-top: 2.5rem; padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid var(--color-line); border-radius: 8px; font-size: 0.85rem; color: var(--color-muted); }

.page-title { font-size: 1.6rem; margin: 0.5rem 0 1.5rem; }
```

- [ ] **Step 8: ヘッダー・フッター・ベースレイアウト・トップページを作る**

`src/components/SiteHeader.astro`:

```astro
---
import { siteConfig } from '../../site.config';
import { withBase } from '../lib/url';
import { CATEGORIES, CATEGORY_KEYS } from '../lib/categories';
---
<header class="site-header">
  <div class="container">
    <a class="site-header__title" href={withBase('/')}>{siteConfig.title}</a>
    <nav class="site-nav" aria-label="カテゴリ">
      {CATEGORY_KEYS.map((key) => (
        <a href={withBase(`/category/${key}/`)}>{CATEGORIES[key].label}</a>
      ))}
    </nav>
  </div>
</header>
```

`src/components/SiteFooter.astro`:

```astro
---
import { siteConfig } from '../../site.config';
import { withBase } from '../lib/url';
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="container">
    <nav aria-label="サイト情報">
      <a href={withBase('/about/')}>運営者情報</a>
      <a href={withBase('/privacy/')}>プライバシーポリシー</a>
      <a href={withBase('/contact/')}>お問い合わせ</a>
      <a href={withBase('/rss.xml')}>RSS</a>
    </nav>
    <p>© {year} {siteConfig.title}</p>
  </div>
</footer>
```

`src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
import { siteConfig } from '../../site.config';
import { withBase } from '../lib/url';
import SiteHeader from '../components/SiteHeader.astro';
import SiteFooter from '../components/SiteFooter.astro';

interface Props {
  title: string;
  description: string;
  /** ページのパス(例: '/posts/foo/')。canonical と og:url に使う */
  path?: string;
}

const { title, description, path = '/' } = Astro.props;
const canonical = Astro.site ? new URL(withBase(path), Astro.site).href : withBase(path);
const fullTitle = path === '/' ? siteConfig.title : `${title} | ${siteConfig.title}`;
const ogType = path.startsWith('/posts/') ? 'article' : 'website';
---
<!DOCTYPE html>
<html lang={siteConfig.lang}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{fullTitle}</title>
    <meta name="description" content={description}>
    <link rel="canonical" href={canonical}>
    <link rel="icon" href={withBase('/favicon.svg')} type="image/svg+xml">
    <link rel="alternate" type="application/rss+xml" title={siteConfig.title} href={withBase('/rss.xml')}>
    <link rel="sitemap" href={withBase('/sitemap-index.xml')}>
    <meta property="og:type" content={ogType}>
    <meta property="og:title" content={fullTitle}>
    <meta property="og:description" content={description}>
    <meta property="og:url" content={canonical}>
    <meta property="og:site_name" content={siteConfig.title}>
    <meta name="twitter:card" content="summary">
    {siteConfig.adsense.client && (
      <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsense.client}`} crossorigin="anonymous" is:inline></script>
    )}
    {siteConfig.analytics.ga4 && (
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics.ga4}`} is:inline></script>
    )}
    {siteConfig.analytics.ga4 && (
      <script is:inline define:vars={{ id: siteConfig.analytics.ga4 }}>
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', id);
      </script>
    )}
  </head>
  <body>
    <SiteHeader />
    <main class="container">
      <slot />
    </main>
    <SiteFooter />
  </body>
</html>
```

`src/pages/index.astro`(このタスクでは仮。Task 6 で記事一覧に置き換える):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { siteConfig } from '../../site.config';
---
<BaseLayout title={siteConfig.title} description={siteConfig.description} path="/">
  <h1 class="page-title">{siteConfig.title}</h1>
  <p>{siteConfig.description}</p>
</BaseLayout>
```

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1d4ed8"/><path d="M14 36l24-16-6 20-6-6-12 2z" fill="#fff"/></svg>
```

- [ ] **Step 9: ビルドとテストを通す**

Run: `npm test && npm run build`
Expected: vitest 1 passed。`astro build` が `dist/index.html` を生成して終了コード 0。

- [ ] **Step 10: コミット**

```bash
git add -A
git commit -m "feat: scaffold Astro site with base layout and site config"
```

---

### Task 2: `withBase` のテスト

**Files:**
- Modify: `src/lib/url.ts`(Task 1 で作成済み。テストで挙動を固定する)
- Test: `tests/url.test.ts`

**Interfaces:**
- Produces: `withBase(path: string, base?: string): string`

- [ ] **Step 1: テストを書く**

`tests/url.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { withBase } from '../src/lib/url';

describe('withBase', () => {
  it('returns the path unchanged when base is root', () => {
    expect(withBase('/posts/foo/', '/')).toBe('/posts/foo/');
  });

  it('prefixes the base path', () => {
    expect(withBase('/posts/foo/', '/repo')).toBe('/repo/posts/foo/');
  });

  it('tolerates a trailing slash on base', () => {
    expect(withBase('/posts/foo/', '/repo/')).toBe('/repo/posts/foo/');
  });

  it('adds a leading slash to relative paths', () => {
    expect(withBase('about/', '/repo')).toBe('/repo/about/');
  });

  it('returns "/" for the root path with root base', () => {
    expect(withBase('/', '/')).toBe('/');
  });

  it('returns "/repo/" for the root path with a base', () => {
    expect(withBase('/', '/repo')).toBe('/repo/');
  });
});
```

- [ ] **Step 2: テストを実行する**

Run: `npm test`
Expected: 全て passed(Task 1 の実装で通る想定。落ちた場合は `withBase` を修正する)

- [ ] **Step 3: コミット**

```bash
git add tests/url.test.ts src/lib/url.ts
git commit -m "test: cover withBase path joining"
```

---

### Task 3: コンテンツコレクションと記事ユーティリティ

**Files:**
- Create: `src/content.config.ts`, `src/lib/posts.ts`, `src/content/posts/2026-09-04-airport-lounge-basics.md`
- Test: `tests/posts.test.ts`

**Interfaces:**
- Consumes: `CATEGORY_KEYS`, `Category` from `src/lib/categories.ts`
- Produces: コレクション `posts`。エントリの `data` 型は `{ title, description, pubDate: Date, updatedDate?: Date, category: Category, tags: string[], affiliate: string[], draft: boolean }`
- Produces: `postSlug(id: string): string`, `postPath(id: string): string`, `sortByDateDesc<T extends { data: { pubDate: Date } }>(posts: T[]): T[]`, `formatDate(d: Date): string`

- [ ] **Step 1: テストを書く**

`tests/posts.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatDate, postPath, postSlug, sortByDateDesc } from '../src/lib/posts';

describe('postSlug', () => {
  it('strips the YYYY-MM-DD- prefix from the entry id', () => {
    expect(postSlug('2026-09-04-airport-lounge-basics')).toBe('airport-lounge-basics');
  });

  it('keeps ids without a date prefix', () => {
    expect(postSlug('airport-lounge-basics')).toBe('airport-lounge-basics');
  });
});

describe('postPath', () => {
  it('builds a trailing-slash path under /posts/', () => {
    expect(postPath('2026-09-04-airport-lounge-basics')).toBe('/posts/airport-lounge-basics/');
  });
});

describe('sortByDateDesc', () => {
  it('sorts newest first without mutating the input', () => {
    const a = { id: 'a', data: { pubDate: new Date('2026-01-01') } };
    const b = { id: 'b', data: { pubDate: new Date('2026-03-01') } };
    const input = [a, b];
    const sorted = sortByDateDesc(input);
    expect(sorted.map((p) => p.id)).toEqual(['b', 'a']);
    expect(input.map((p) => p.id)).toEqual(['a', 'b']);
  });
});

describe('formatDate', () => {
  it('formats as Japanese year/month/day', () => {
    expect(formatDate(new Date(Date.UTC(2026, 8, 4)))).toBe('2026年9月4日');
  });
});
```

- [ ] **Step 2: テストを実行して失敗を確認する**

Run: `npm test`
Expected: FAIL with "Cannot find module '../src/lib/posts'"(または同等の読み込みエラー)

- [ ] **Step 3: `src/lib/posts.ts` を実装する**

```ts
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
```

- [ ] **Step 4: テストを通す**

Run: `npm test`
Expected: all tests passed

- [ ] **Step 5: コンテンツコレクションを定義する**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_KEYS, type Category } from './lib/categories';

// Task 4 で src/lib/affiliate.ts に移す。それまではここで定義する
const AFFILIATE_PROVIDERS = ['rakuten-travel', 'jalan', 'expedia', 'amazon'] as const;

const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(10).max(80),
    description: z.string().min(40).max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(CATEGORY_KEYS as [Category, ...Category[]]),
    tags: z.array(z.string()).default([]),
    affiliate: z.array(z.enum(AFFILIATE_PROVIDERS)).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

- [ ] **Step 6: サンプル記事を 1 本置く**

`src/content/posts/2026-09-04-airport-lounge-basics.md`:

```md
---
title: "空港ラウンジとは? 種類と入り方をやさしく解説"
description: "空港ラウンジには航空会社ラウンジとカードラウンジがあり、入る条件がまったく違います。初めての人向けに、種類・入り方・使い方の基本をまとめました。"
pubDate: 2026-09-04
category: lounge
tags: ["ラウンジ", "初心者向け"]
affiliate: ["rakuten-travel"]
---

飛行機に乗る前の待ち時間を快適に過ごせるのが空港ラウンジです。ただ、一口にラウンジといっても種類があり、入れる条件はそれぞれ違います。この記事では、初めての人がつまずきやすいポイントに絞って整理します。

## 空港ラウンジは大きく2種類

| 種類 | 運営 | 主な入室条件 |
| --- | --- | --- |
| 航空会社ラウンジ | 航空会社 | 上級会員、ビジネスクラス以上の搭乗 |
| カードラウンジ | 空港・カード会社 | 対象クレジットカードの提示 |

航空会社ラウンジは軽食やアルコールが充実している一方、入室条件は厳しめです。カードラウンジは条件がゆるく、対象カードを持っていれば当日の搭乗券と一緒に提示するだけで入れます。

## カードラウンジに入るまでの流れ

1. 出発空港にカードラウンジがあるか確認する
2. 自分のカードが対象か、カード会社のサイトで確認する
3. 受付でカードと当日の搭乗券を提示する

同伴者の扱いはカードやラウンジによって異なります。無料になる場合と有料になる場合があるので、事前に確認しておくと安心です。

## ラウンジを使うときのちょっとしたコツ

- 混雑しやすい時間帯(早朝・夕方)は早めに入る
- 保安検査の前にあるか後にあるかを確認しておく
- 搭乗時刻のアナウンスはラウンジ内で流れないことがあるので、時計をこまめに見る

早朝便の場合は、前泊して空港近くのホテルに泊まると余裕をもってラウンジを使えます。

[[affiliate:rakuten-travel|空港 ホテル|空港周辺のホテルを楽天トラベルで探す]]

## まとめ

- 航空会社ラウンジとカードラウンジは入室条件が別物
- 初心者はまず対象クレジットカードでカードラウンジから
- 位置(保安検査の前後)と混雑時間帯を事前に把握しておく
```

- [ ] **Step 7: ビルドが通ることを確認する**

Run: `npm run build`
Expected: 終了コード 0。コレクションのスキーマ検証エラーが出ないこと。

- [ ] **Step 8: コミット**

```bash
git add src/content.config.ts src/lib/posts.ts src/content/posts tests/posts.test.ts
git commit -m "feat: define posts collection and post utilities"
```

---

### Task 4: HTML ユーティリティとアフィリエイトリンク生成

**Files:**
- Create: `src/lib/html.ts`, `src/lib/affiliate.ts`
- Modify: `src/content.config.ts`
- Test: `tests/html.test.ts`, `tests/affiliate.test.ts`

**Interfaces:**
- Consumes: `SiteConfig` from `site.config.ts`
- Produces: `escapeHtml(s: string): string`, `decodeEntities(s: string): string`
- Produces: `AFFILIATE_PROVIDERS`, `type AffiliateProvider = 'rakuten-travel' | 'jalan' | 'expedia' | 'amazon'`, `isAffiliateProvider(s: string): s is AffiliateProvider`, `buildAffiliateLink(provider, query, config): { href: string; isAffiliate: boolean; providerLabel: string }`, `renderAffiliateBox(opts: { provider: AffiliateProvider; query?: string; label?: string }, config: SiteConfig): string`

- [ ] **Step 1: HTML ユーティリティのテストを書く**

`tests/html.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { decodeEntities, escapeHtml } from '../src/lib/html';

describe('escapeHtml', () => {
  it('escapes &, <, >, " and \'', () => {
    expect(escapeHtml(`a&b<c>"d'e`)).toBe('a&amp;b&lt;c&gt;&quot;d&#39;e');
  });
});

describe('decodeEntities', () => {
  it('decodes the basic named and numeric entities', () => {
    expect(decodeEntities('a&amp;b&lt;c&gt;&quot;d&#39;e')).toBe(`a&b<c>"d'e`);
  });
});
```

- [ ] **Step 2: 失敗を確認する**

Run: `npm test`
Expected: FAIL with "Cannot find module '../src/lib/html'"

- [ ] **Step 3: `src/lib/html.ts` を実装する**

```ts
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Markdown 処理で付いた最小限のエンティティを元に戻す */
export function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}
```

- [ ] **Step 4: HTML テストを通す**

Run: `npm test`
Expected: all passed

- [ ] **Step 5: アフィリエイトのテストを書く**

`tests/affiliate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { SiteConfig } from '../site.config';
import { siteConfig } from '../site.config';
import { buildAffiliateLink, isAffiliateProvider, renderAffiliateBox } from '../src/lib/affiliate';

function configWith(overrides: Partial<SiteConfig['affiliate']>): SiteConfig {
  return { ...siteConfig, affiliate: { ...siteConfig.affiliate, ...overrides } };
}

const empty = configWith({});

describe('isAffiliateProvider', () => {
  it('accepts known providers and rejects others', () => {
    expect(isAffiliateProvider('rakuten-travel')).toBe(true);
    expect(isAffiliateProvider('amazon')).toBe(true);
    expect(isAffiliateProvider('foo')).toBe(false);
  });
});

describe('buildAffiliateLink', () => {
  it('links to the official site when rakuten id is empty', () => {
    const link = buildAffiliateLink('rakuten-travel', undefined, empty);
    expect(link.href).toBe('https://travel.rakuten.co.jp/');
    expect(link.isAffiliate).toBe(false);
    expect(link.providerLabel).toBe('楽天トラベル');
  });

  it('wraps the rakuten target with the affiliate id', () => {
    const cfg = configWith({ rakutenTravel: { id: 'abc.def' } });
    const link = buildAffiliateLink('rakuten-travel', undefined, cfg);
    expect(link.href).toBe(
      'https://hb.afl.rakuten.co.jp/hgc/abc.def/?pc=https%3A%2F%2Ftravel.rakuten.co.jp%2F&m=https%3A%2F%2Ftravel.rakuten.co.jp%2F',
    );
    expect(link.isAffiliate).toBe(true);
  });

  it('uses the configured jalan url as-is', () => {
    const cfg = configWith({ jalan: { url: 'https://px.a8.net/svt/ejp?a8mat=XYZ' } });
    expect(buildAffiliateLink('jalan', undefined, cfg).href).toBe('https://px.a8.net/svt/ejp?a8mat=XYZ');
    expect(buildAffiliateLink('jalan', undefined, empty).href).toBe('https://www.jalan.net/');
  });

  it('builds an amazon search url with the tag when set', () => {
    expect(buildAffiliateLink('amazon', 'ネックピロー', empty).href).toBe(
      'https://www.amazon.co.jp/s?k=%E3%83%8D%E3%83%83%E3%82%AF%E3%83%94%E3%83%AD%E3%83%BC',
    );
    const cfg = configWith({ amazon: { tag: 'example-22' } });
    expect(buildAffiliateLink('amazon', 'ネックピロー', cfg).href).toBe(
      'https://www.amazon.co.jp/s?k=%E3%83%8D%E3%83%83%E3%82%AF%E3%83%94%E3%83%AD%E3%83%BC&tag=example-22',
    );
  });
});

describe('renderAffiliateBox', () => {
  it('renders a sponsored link with PR label and escaped text', () => {
    const html = renderAffiliateBox({ provider: 'amazon', query: 'a&b', label: '<b>探す</b>' }, empty);
    expect(html).toContain('class="affiliate-box"');
    expect(html).toContain('rel="sponsored noopener"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('[PR]');
    expect(html).toContain('&lt;b&gt;探す&lt;/b&gt;');
    expect(html).not.toContain('<b>探す</b>');
  });

  it('falls back to a default label built from the provider name', () => {
    const html = renderAffiliateBox({ provider: 'rakuten-travel' }, empty);
    expect(html).toContain('楽天トラベルで探す');
  });
});
```

- [ ] **Step 6: 失敗を確認する**

Run: `npm test`
Expected: FAIL with "Cannot find module '../src/lib/affiliate'"

- [ ] **Step 7: `src/lib/affiliate.ts` を実装する**

```ts
import type { SiteConfig } from '../../site.config';
import { escapeHtml } from './html';

export const AFFILIATE_PROVIDERS = ['rakuten-travel', 'jalan', 'expedia', 'amazon'] as const;
export type AffiliateProvider = (typeof AFFILIATE_PROVIDERS)[number];

export function isAffiliateProvider(s: string): s is AffiliateProvider {
  return (AFFILIATE_PROVIDERS as readonly string[]).includes(s);
}

interface ProviderDef {
  label: string;
  /** ID 未設定時、または広告リンクの飛び先として使う公式 URL */
  target: (query?: string) => string;
}

const PROVIDERS: Record<AffiliateProvider, ProviderDef> = {
  'rakuten-travel': { label: '楽天トラベル', target: () => 'https://travel.rakuten.co.jp/' },
  jalan: { label: 'じゃらん', target: () => 'https://www.jalan.net/' },
  expedia: { label: 'Expedia', target: () => 'https://www.expedia.co.jp/' },
  amazon: {
    label: 'Amazon',
    target: (query) => (query ? `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}` : 'https://www.amazon.co.jp/'),
  },
};

export interface AffiliateLink {
  href: string;
  isAffiliate: boolean;
  providerLabel: string;
}

export function buildAffiliateLink(
  provider: AffiliateProvider,
  query: string | undefined,
  config: SiteConfig,
): AffiliateLink {
  const def = PROVIDERS[provider];
  const target = def.target(query);
  const aff = config.affiliate;

  switch (provider) {
    case 'rakuten-travel': {
      if (!aff.rakutenTravel.id) return { href: target, isAffiliate: false, providerLabel: def.label };
      const enc = encodeURIComponent(target);
      return {
        href: `https://hb.afl.rakuten.co.jp/hgc/${aff.rakutenTravel.id}/?pc=${enc}&m=${enc}`,
        isAffiliate: true,
        providerLabel: def.label,
      };
    }
    case 'jalan':
      return { href: aff.jalan.url || target, isAffiliate: Boolean(aff.jalan.url), providerLabel: def.label };
    case 'expedia':
      return { href: aff.expedia.url || target, isAffiliate: Boolean(aff.expedia.url), providerLabel: def.label };
    case 'amazon': {
      if (!aff.amazon.tag) return { href: target, isAffiliate: false, providerLabel: def.label };
      const sep = target.includes('?') ? '&' : '?';
      return { href: `${target}${sep}tag=${encodeURIComponent(aff.amazon.tag)}`, isAffiliate: true, providerLabel: def.label };
    }
  }
}

export interface AffiliateBoxOptions {
  provider: AffiliateProvider;
  query?: string;
  label?: string;
}

/** 記事内に挿入するリンクボックスの HTML 文字列 */
export function renderAffiliateBox(opts: AffiliateBoxOptions, config: SiteConfig): string {
  const link = buildAffiliateLink(opts.provider, opts.query, config);
  const label = opts.label?.trim() || `${link.providerLabel}で探す`;
  return [
    '<div class="affiliate-box">',
    `<span class="affiliate-box__provider">${escapeHtml(link.providerLabel)}</span>`,
    `<a class="affiliate-box__link" href="${escapeHtml(link.href)}" target="_blank" rel="sponsored noopener">${escapeHtml(label)}</a>`,
    '<span class="affiliate-box__pr">[PR] 当サイトはアフィリエイト広告を利用しています</span>',
    '</div>',
  ].join('');
}
```

- [ ] **Step 8: テストを通す**

Run: `npm test`
Expected: all passed

- [ ] **Step 9: `content.config.ts` の重複定義を `affiliate.ts` に寄せる**

`src/content.config.ts` の `const AFFILIATE_PROVIDERS = [...]` 行とその上のコメント行を削除し、import に 1 行追加する:

```ts
import { AFFILIATE_PROVIDERS } from './lib/affiliate';
```

Run: `npm run build`
Expected: 終了コード 0

- [ ] **Step 10: コミット**

```bash
git add src/lib/html.ts src/lib/affiliate.ts src/content.config.ts tests/html.test.ts tests/affiliate.test.ts
git commit -m "feat: add affiliate link builder and HTML helpers"
```

---

### Task 5: 広告枠・アイキャッチ SVG・本文変換

**Files:**
- Create: `src/lib/ads.ts`, `src/lib/eyecatch.ts`, `src/lib/transform-body.ts`
- Test: `tests/ads.test.ts`, `tests/eyecatch.test.ts`, `tests/transform-body.test.ts`

**Interfaces:**
- Consumes: `renderAffiliateBox`, `isAffiliateProvider` from `src/lib/affiliate.ts`; `escapeHtml`, `decodeEntities` from `src/lib/html.ts`; `CATEGORIES`, `Category` from `src/lib/categories.ts`; `withBase` from `src/lib/url.ts`
- Produces: `renderAdSlot(config: SiteConfig): string`(未設定なら `''`)
- Produces: `wrapTitle(title: string, maxChars: number): string[]`, `renderEyecatchSvg(opts: { category: Category; title: string }): string`
- Produces: `transformBody(html: string, config: SiteConfig, base?: string): string`

- [ ] **Step 1: 広告枠のテストを書く**

`tests/ads.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../site.config';
import { renderAdSlot } from '../src/lib/ads';

describe('renderAdSlot', () => {
  it('renders nothing when the AdSense client is empty', () => {
    expect(renderAdSlot({ ...siteConfig, adsense: { client: '' } })).toBe('');
  });

  it('renders an adsbygoogle unit when the client is set', () => {
    const html = renderAdSlot({ ...siteConfig, adsense: { client: 'ca-pub-123' } });
    expect(html).toContain('class="ad-slot"');
    expect(html).toContain('data-ad-client="ca-pub-123"');
    expect(html).toContain('adsbygoogle');
  });
});
```

- [ ] **Step 2: 失敗を確認する**

Run: `npm test`
Expected: FAIL with "Cannot find module '../src/lib/ads'"

- [ ] **Step 3: `src/lib/ads.ts` を実装する**

```ts
import type { SiteConfig } from '../../site.config';
import { escapeHtml } from './html';

/** AdSense の自動サイズ広告ユニット。client 未設定なら空文字 */
export function renderAdSlot(config: SiteConfig): string {
  const client = config.adsense.client;
  if (!client) return '';
  return [
    '<div class="ad-slot">',
    `<ins class="adsbygoogle" style="display:block" data-ad-client="${escapeHtml(client)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`,
    '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    '</div>',
  ].join('');
}
```

- [ ] **Step 4: 広告テストを通す**

Run: `npm test`
Expected: all passed

- [ ] **Step 5: アイキャッチのテストを書く**

`tests/eyecatch.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { renderEyecatchSvg, wrapTitle } from '../src/lib/eyecatch';

describe('wrapTitle', () => {
  it('splits a long title into lines of at most N characters', () => {
    expect(wrapTitle('あいうえおかきくけこさしすせそ', 5)).toEqual(['あいうえお', 'かきくけこ', 'さしすせそ']);
  });

  it('caps at 3 lines and appends an ellipsis', () => {
    expect(wrapTitle('あいうえおかきくけこさしすせそたちつてとなにぬねの', 5)).toEqual(['あいうえお', 'かきくけこ', 'さしすせ…']);
  });
});

describe('renderEyecatchSvg', () => {
  it('renders an SVG with the category color and label', () => {
    const svg = renderEyecatchSvg({ category: 'lounge', title: 'テスト<記事>' });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 1200 630"');
    expect(svg).toContain('#1d4ed8');
    expect(svg).toContain('空港ラウンジ');
    expect(svg).toContain('テスト&lt;記事&gt;');
    expect(svg).toContain('role="img"');
  });
});
```

- [ ] **Step 6: 失敗を確認する**

Run: `npm test`
Expected: FAIL with "Cannot find module '../src/lib/eyecatch'"

- [ ] **Step 7: `src/lib/eyecatch.ts` を実装する**

```ts
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
```

- [ ] **Step 8: アイキャッチテストを通す**

Run: `npm test`
Expected: all passed

- [ ] **Step 9: 本文変換のテストを書く**

`tests/transform-body.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../site.config';
import { transformBody } from '../src/lib/transform-body';

describe('transformBody', () => {
  it('expands an affiliate placeholder paragraph into a link box', () => {
    const html = '<p>前置き</p><p>[[affiliate:rakuten-travel|羽田 ホテル|羽田のホテルを探す]]</p><p>後書き</p>';
    const out = transformBody(html, siteConfig, '/');
    expect(out).toContain('<p>前置き</p><div class="affiliate-box">');
    expect(out).toContain('羽田のホテルを探す');
    expect(out).toContain('rel="sponsored noopener"');
    expect(out).not.toContain('[[affiliate');
  });

  it('accepts placeholders without query or label', () => {
    const out = transformBody('<p>[[affiliate:jalan]]</p>', siteConfig, '/');
    expect(out).toContain('じゃらんで探す');
  });

  it('decodes entities inside the placeholder before rendering', () => {
    const out = transformBody('<p>[[affiliate:amazon|A&amp;B|買う]]</p>', siteConfig, '/');
    expect(out).toContain('k=A%26B');
  });

  it('leaves unknown providers as plain text', () => {
    const src = '<p>[[affiliate:foo]]</p>';
    expect(transformBody(src, siteConfig, '/')).toBe(src);
  });

  it('replaces [[ad]] with the ad slot (empty when unconfigured)', () => {
    expect(transformBody('<p>a</p><p>[[ad]]</p><p>b</p>', siteConfig, '/')).toBe('<p>a</p><p>b</p>');
    const cfg = { ...siteConfig, adsense: { client: 'ca-pub-1' } };
    expect(transformBody('<p>[[ad]]</p>', cfg, '/')).toContain('class="ad-slot"');
  });

  it('prefixes root-relative hrefs with the base path', () => {
    const out = transformBody('<a href="/posts/foo/">x</a><a href="https://example.com/">y</a>', siteConfig, '/repo');
    expect(out).toContain('href="/repo/posts/foo/"');
    expect(out).toContain('href="https://example.com/"');
  });

  it('does not touch hrefs when base is root', () => {
    const out = transformBody('<a href="/posts/foo/">x</a>', siteConfig, '/');
    expect(out).toContain('href="/posts/foo/"');
  });
});
```

- [ ] **Step 10: 失敗を確認する**

Run: `npm test`
Expected: FAIL with "Cannot find module '../src/lib/transform-body'"

- [ ] **Step 11: `src/lib/transform-body.ts` を実装する**

```ts
import type { SiteConfig } from '../../site.config';
import { renderAdSlot } from './ads';
import { isAffiliateProvider, renderAffiliateBox } from './affiliate';
import { decodeEntities } from './html';
import { withBase } from './url';

// <p>[[affiliate:provider|query|label]]</p>  query と label は省略可
const AFFILIATE_RE = /<p>\s*\[\[affiliate:([a-z-]+)(?:\|([^|\]]*))?(?:\|([^\]]*))?\]\]\s*<\/p>/g;
const AD_RE = /<p>\s*\[\[ad\]\]\s*<\/p>/g;
// href="/..." だけを対象にする(// で始まるプロトコル相対は対象外)
const ROOT_HREF_RE = /href="\/(?!\/)([^"]*)"/g;

/**
 * Markdown から生成された記事本文 HTML に対して
 * 1. [[affiliate:...]] をリンクボックスに展開
 * 2. [[ad]] を広告枠に展開
 * 3. ルート相対リンクに base を付与
 */
export function transformBody(html: string, config: SiteConfig, base: string = import.meta.env.BASE_URL): string {
  let out = html.replace(AFFILIATE_RE, (match, provider: string, query?: string, label?: string) => {
    if (!isAffiliateProvider(provider)) return match;
    return renderAffiliateBox(
      {
        provider,
        query: query ? decodeEntities(query).trim() : undefined,
        label: label ? decodeEntities(label).trim() : undefined,
      },
      config,
    );
  });
  out = out.replace(AD_RE, () => renderAdSlot(config));
  out = out.replace(ROOT_HREF_RE, (_m, rest: string) => `href="${withBase(`/${rest}`, base)}"`);
  return out;
}
```

- [ ] **Step 12: テストを通す**

Run: `npm test`
Expected: all passed

- [ ] **Step 13: コミット**

```bash
git add src/lib/ads.ts src/lib/eyecatch.ts src/lib/transform-body.ts tests/ads.test.ts tests/eyecatch.test.ts tests/transform-body.test.ts
git commit -m "feat: add ad slot, eyecatch SVG, and body transform"
```

---

### Task 6: 記事ページ・一覧・カテゴリページ

**Files:**
- Create: `src/components/Eyecatch.astro`, `src/components/AdSlot.astro`, `src/components/AiNotice.astro`, `src/components/TOC.astro`, `src/components/PostCard.astro`, `src/layouts/PostLayout.astro`, `src/pages/posts/[slug].astro`, `src/pages/category/[category].astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `renderEyecatchSvg`, `renderAdSlot`, `transformBody`, `postPath`, `postSlug`, `sortByDateDesc`, `formatDate`, `withBase`, `CATEGORIES`, `CATEGORY_KEYS`
- Produces: `PostLayout` props `{ entry: CollectionEntry<'posts'>; headings: MarkdownHeading[] }`、本文はデフォルトスロット

- [ ] **Step 1: 小さなコンポーネントを作る**

`src/components/Eyecatch.astro`:

```astro
---
import type { Category } from '../lib/categories';
import { renderEyecatchSvg } from '../lib/eyecatch';

interface Props {
  category: Category;
  title: string;
  class?: string;
}
const { category, title, class: className } = Astro.props;
---
<div class={className} set:html={renderEyecatchSvg({ category, title })}></div>
```

`src/components/AdSlot.astro`:

```astro
---
import { siteConfig } from '../../site.config';
import { renderAdSlot } from '../lib/ads';
const html = renderAdSlot(siteConfig);
---
{html && <Fragment set:html={html} />}
```

`src/components/AiNotice.astro`:

```astro
<aside class="ai-notice">
  この記事は AI を活用して執筆し、運営者が内容を確認のうえ公開しています。価格・運航情報・キャンペーン内容などは変更されることがあるため、必ず各公式サイトで最新情報をご確認ください。
</aside>
```

`src/components/TOC.astro`(h2 のみを目次にする。h3 は入れないことでネスト処理を不要にする):

```astro
---
import type { MarkdownHeading } from 'astro';

interface Props {
  headings: MarkdownHeading[];
}
const headings = Astro.props.headings.filter((h) => h.depth === 2);
---
{headings.length > 0 && (
  <nav class="toc" aria-label="目次">
    <div class="toc__title">目次</div>
    <ol>
      {headings.map((h) => (
        <li><a href={`#${h.slug}`}>{h.text}</a></li>
      ))}
    </ol>
  </nav>
)}
```

`src/components/PostCard.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { CATEGORIES } from '../lib/categories';
import { formatDate, postPath } from '../lib/posts';
import { withBase } from '../lib/url';
import Eyecatch from './Eyecatch.astro';

interface Props {
  entry: CollectionEntry<'posts'>;
}
const { entry } = Astro.props;
const category = CATEGORIES[entry.data.category];
const href = withBase(postPath(entry.id));
---
<li class="post-card">
  <a class="post-card__eyecatch" href={href} aria-hidden="true" tabindex="-1">
    <Eyecatch category={entry.data.category} title={entry.data.title} />
  </a>
  <div>
    <h2 class="post-card__title"><a href={href}>{entry.data.title}</a></h2>
    <div class="post-card__meta">
      <span class="badge" style={`background:${category.color}`}>{category.label}</span>
      {' '}
      <time datetime={entry.data.pubDate.toISOString()}>{formatDate(entry.data.pubDate)}</time>
    </div>
    <p class="post-card__desc">{entry.data.description}</p>
  </div>
</li>
```

- [ ] **Step 2: 記事レイアウトを作る**

`src/layouts/PostLayout.astro`:

```astro
---
import type { MarkdownHeading } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { siteConfig } from '../../site.config';
import { CATEGORIES } from '../lib/categories';
import { formatDate, postPath } from '../lib/posts';
import { transformBody } from '../lib/transform-body';
import { withBase } from '../lib/url';
import BaseLayout from './BaseLayout.astro';
import Eyecatch from '../components/Eyecatch.astro';
import TOC from '../components/TOC.astro';
import AdSlot from '../components/AdSlot.astro';
import AiNotice from '../components/AiNotice.astro';

interface Props {
  entry: CollectionEntry<'posts'>;
  headings: MarkdownHeading[];
}
const { entry, headings } = Astro.props;
const { title, description, pubDate, updatedDate, category } = entry.data;
const cat = CATEGORIES[category];
const path = postPath(entry.id);

// 本文スロットを HTML 文字列にしてからプレースホルダーを展開する
const rawBody = await Astro.slots.render('default');
const body = transformBody(rawBody, siteConfig);
---
<BaseLayout title={title} description={description} path={path}>
  <article>
    <header class="post-header">
      <a class="badge" href={withBase(`/category/${category}/`)} style={`background:${cat.color}`}>{cat.label}</a>
      <h1 class="post-header__title">{title}</h1>
      <div class="post-header__meta">
        <span>公開: <time datetime={pubDate.toISOString()}>{formatDate(pubDate)}</time></span>
        {updatedDate && <span>更新: <time datetime={updatedDate.toISOString()}>{formatDate(updatedDate)}</time></span>}
      </div>
      <Eyecatch class="post-eyecatch" category={category} title={title} />
    </header>
    <AdSlot />
    <TOC headings={headings} />
    <div class="post-body" set:html={body}></div>
    <AdSlot />
    <AiNotice />
  </article>
</BaseLayout>
```

- [ ] **Step 3: 記事ページを作る**

`src/pages/posts/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';
import { postSlug } from '../../lib/posts';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map((entry) => ({ params: { slug: postSlug(entry.id) }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content, headings } = await render(entry);
---
<PostLayout entry={entry} headings={headings}>
  <Content />
</PostLayout>
```

- [ ] **Step 4: トップとカテゴリ一覧を作る**

`src/pages/index.astro`(置き換え):

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import { siteConfig } from '../../site.config';
import { sortByDateDesc } from '../lib/posts';

const posts = sortByDateDesc(await getCollection('posts', ({ data }) => !data.draft));
---
<BaseLayout title={siteConfig.title} description={siteConfig.description} path="/">
  <h1 class="page-title">新着記事</h1>
  <ul class="post-list">
    {posts.map((entry) => <PostCard entry={entry} />)}
  </ul>
</BaseLayout>
```

`src/pages/category/[category].astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { CATEGORIES, CATEGORY_KEYS, type Category } from '../../lib/categories';
import { sortByDateDesc } from '../../lib/posts';

export async function getStaticPaths() {
  return CATEGORY_KEYS.map((category) => ({ params: { category } }));
}

const category = Astro.params.category as Category;
const cat = CATEGORIES[category];
const posts = sortByDateDesc(
  await getCollection('posts', ({ data }) => !data.draft && data.category === category),
);
---
<BaseLayout title={cat.label} description={`${cat.label}に関する記事一覧`} path={`/category/${category}/`}>
  <h1 class="page-title">{cat.label}</h1>
  {posts.length === 0 ? (
    <p>このカテゴリの記事はまだありません。</p>
  ) : (
    <ul class="post-list">
      {posts.map((entry) => <PostCard entry={entry} />)}
    </ul>
  )}
</BaseLayout>
```

- [ ] **Step 5: ビルドして出力を確認する**

Run: `npm run build && node -e "const h=require('fs').readFileSync('dist/posts/airport-lounge-basics/index.html','utf8');console.log(h.includes('affiliate-box'), h.includes('ai-notice'), h.includes('class=\"toc\"'), !h.includes('[[affiliate'))"`
Expected: ビルド成功。出力が `true true true true`。

- [ ] **Step 6: base 付きでもビルドできることを確認する**

Run(PowerShell): `$env:SITE_URL='https://example.github.io'; $env:BASE_PATH='/ad_web'; npm run build; node -e "const h=require('fs').readFileSync('dist/index.html','utf8');console.log(h.includes('href=\"/ad_web/posts/airport-lounge-basics/\"'))"; Remove-Item Env:SITE_URL; Remove-Item Env:BASE_PATH`
Run(bash): `SITE_URL=https://example.github.io BASE_PATH=/ad_web npm run build && node -e "const h=require('fs').readFileSync('dist/index.html','utf8');console.log(h.includes('href=\"/ad_web/posts/airport-lounge-basics/\"'))"`
Expected: `true`

- [ ] **Step 7: コミット**

```bash
git add src/components src/layouts src/pages
git commit -m "feat: add post, index, and category pages"
```

---

### Task 7: 固定ページ・RSS・robots・404

**Files:**
- Create: `src/pages/about.astro`, `src/pages/privacy.astro`, `src/pages/contact.astro`, `src/pages/404.astro`, `src/pages/rss.xml.ts`, `src/pages/robots.txt.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `siteConfig`, `withBase`, `postPath`, `sortByDateDesc`

- [ ] **Step 1: 固定ページを作る**

`src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { siteConfig } from '../../site.config';
---
<BaseLayout title="運営者情報" description={`${siteConfig.title}の運営者情報と、このサイトの方針について`} path="/about/">
  <h1 class="page-title">運営者情報</h1>
  <p><strong>サイト名:</strong> {siteConfig.title}</p>
  <p><strong>運営:</strong> {siteConfig.author}</p>
  <h2>このサイトについて</h2>
  <p>{siteConfig.description}</p>
  <p>記事は AI を活用して下書きを作成し、運営者が内容を確認したうえで公開しています。価格や運航スケジュールなどの変動する情報は原則として記載せず、仕組みや選び方といった時間が経っても役立つ情報を中心にまとめています。</p>
  <h2>広告について</h2>
  <p>当サイトはアフィリエイトプログラムに参加しており、記事内のリンクから商品やサービスを申し込まれた場合に運営者が報酬を受け取ることがあります。該当する箇所には [PR] の表記をしています。</p>
</BaseLayout>
```

`src/pages/privacy.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { siteConfig } from '../../site.config';
import { withBase } from '../lib/url';
---
<BaseLayout title="プライバシーポリシー" description={`${siteConfig.title}のプライバシーポリシー。Cookie、アクセス解析、広告配信、アフィリエイトについて`} path="/privacy/">
  <h1 class="page-title">プライバシーポリシー</h1>

  <h2>広告の配信について</h2>
  <p>当サイトは第三者配信の広告サービス(Google AdSense など)を利用することがあります。広告配信事業者は、ユーザーの興味に応じた広告を表示するために Cookie を使用することがあります。Cookie を無効にする方法や Google AdSense に関する詳細は、<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener">Google の広告に関するポリシー</a>をご確認ください。</p>

  <h2>アフィリエイトプログラムについて</h2>
  <p>当サイトは、楽天アフィリエイト、A8.net、Amazon アソシエイト・プログラムなどのアフィリエイトプログラムに参加しています。記事内のリンク経由で商品やサービスを購入・申し込みされた場合、運営者に報酬が支払われることがあります。該当箇所には [PR] と表記しています。</p>

  <h2>アクセス解析ツールについて</h2>
  <p>当サイトは、アクセス解析のために Google アナリティクスを利用することがあります。Google アナリティクスはトラフィックデータの収集のために Cookie を使用しますが、このデータは匿名で収集されており、個人を特定するものではありません。</p>

  <h2>免責事項</h2>
  <p>当サイトの情報は、できる限り正確を期していますが、正確性や安全性を保証するものではありません。価格、運航スケジュール、サービス内容などは変更される場合があるため、必ず各公式サイトで最新の情報をご確認ください。当サイトの情報を利用したことによる損害について、運営者は責任を負いかねます。</p>

  <h2>著作権について</h2>
  <p>当サイトに掲載している文章・画像の無断転載を禁止します。引用の際は出典として当サイトへのリンクを明記してください。</p>

  <h2>お問い合わせ</h2>
  <p>本ポリシーに関するお問い合わせは、<a href={withBase('/contact/')}>お問い合わせページ</a>からご連絡ください。</p>
</BaseLayout>
```

`src/pages/contact.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { siteConfig } from '../../site.config';
const url = siteConfig.contactFormUrl;
---
<BaseLayout title="お問い合わせ" description={`${siteConfig.title}へのお問い合わせフォーム`} path="/contact/">
  <h1 class="page-title">お問い合わせ</h1>
  {url ? (
    <iframe src={url} width="100%" height="900" title="お問い合わせフォーム">読み込んでいます…</iframe>
  ) : (
    <p>お問い合わせフォームは準備中です。しばらくお待ちください。</p>
  )}
</BaseLayout>
```

`src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { withBase } from '../lib/url';
---
<BaseLayout title="ページが見つかりません" description="お探しのページは見つかりませんでした" path="/404/">
  <h1 class="page-title">ページが見つかりません</h1>
  <p>URL が変更されたか、ページが削除された可能性があります。</p>
  <p><a href={withBase('/')}>トップページへ戻る</a></p>
</BaseLayout>
```

- [ ] **Step 2: RSS と robots.txt を作る**

`src/pages/rss.xml.ts`:

```ts
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../../site.config';
import { postPath, sortByDateDesc } from '../lib/posts';
import { withBase } from '../lib/url';

export async function GET(context: APIContext) {
  const posts = sortByDateDesc(await getCollection('posts', ({ data }) => !data.draft));
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? 'http://localhost:4321',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: withBase(postPath(post.id)),
    })),
  });
}
```

`src/pages/robots.txt.ts`:

```ts
import type { APIContext } from 'astro';
import { withBase } from '../lib/url';

export function GET({ site }: APIContext) {
  const sitemap = new URL(withBase('/sitemap-index.xml'), site ?? 'http://localhost:4321').href;
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
```

- [ ] **Step 3: ビルドして生成物を確認する**

Run(bash): `SITE_URL=https://example.github.io BASE_PATH=/ad_web npm run build && ls dist dist/about dist/privacy dist/contact && cat dist/robots.txt && head -c 600 dist/rss.xml`
Expected: `about/ privacy/ contact/ 404.html rss.xml robots.txt sitemap-index.xml` が存在。robots.txt に `Sitemap: https://example.github.io/ad_web/sitemap-index.xml`。rss.xml の `<link>` が `https://example.github.io/ad_web/posts/airport-lounge-basics/`。

- [ ] **Step 4: コミット**

```bash
git add src/pages
git commit -m "feat: add static pages, RSS feed, and robots.txt"
```

---

### Task 8: GitHub Actions(PR 検証と GitHub Pages 公開)

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

- [ ] **Step 1: PR 検証ワークフローを書く**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches-ignore: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    env:
      SITE_URL: https://${{ github.repository_owner }}.github.io
      BASE_PATH: /${{ github.event.repository.name }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: 公開ワークフローを書く**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      # 独自ドメインに移行したら SITE_URL をそのドメインに、BASE_PATH を / に変える
      SITE_URL: https://${{ github.repository_owner }}.github.io
      BASE_PATH: /${{ github.event.repository.name }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: ローカルで同じ手順が通ることを確認する**

Run: `npm ci && npm test && npm run build`
Expected: 全て成功(ワークフロー自体の動作確認は GitHub へ push 後に Actions タブで行う)

- [ ] **Step 4: コミット**

```bash
git add .github
git commit -m "ci: add PR verification and GitHub Pages deploy workflows"
```

---

### Task 9: 編集方針(CLAUDE.md)とネタ帳と追加サンプル記事

**Files:**
- Create: `CLAUDE.md`, `topics/backlog.md`, `src/content/posts/2026-09-04-miles-basics.md`, `src/content/posts/2026-09-04-carry-on-checklist.md`

- [ ] **Step 1: `CLAUDE.md` を書く**

````md
# そらたび手帖 — 編集方針と作業ルール

このリポジトリは Astro 製の旅行・飛行機情報サイトです。記事は `src/content/posts/` の Markdown ファイルです。
このファイルは、記事を書くエージェント(Claude Code の定期実行)と開発者の両方が読みます。

## 記事ファイルの作り方

- パス: `src/content/posts/YYYY-MM-DD-slug.md`(日付は作成日、slug は英小文字とハイフンのみ)
- URL は日付を除いた `/posts/slug/` になる。slug は他の記事と重複させない
- frontmatter はスキーマ(`src/content.config.ts`)に厳密に従う

```yaml
---
title: "32〜60 字。検索意図が分かる具体的なタイトル"
description: "80〜120 字。記事の要点。meta description と一覧カードに使う"
pubDate: 2026-09-04
category: lounge        # lounge | miles | aircraft | domestic | overseas | goods
tags: ["タグ1", "タグ2"]
affiliate: ["rakuten-travel"]   # 本文で使ったプレースホルダーの provider を列挙
---
```

## 本文のルール

- 3,000〜4,000 字。です・ます調。1 文は短く
- 構成: 導入(2〜3 文) → h2 を 3〜5 個(必要なら h3) → 「まとめ」h2(箇条書き 3〜5 個)
- 比較や条件の整理には Markdown の表を使う
- 体験談風の断定(「私は〜しました」「実際に行ってみたら」)は書かない
- **書かないこと**: 具体的な価格、運賃、キャンペーン期限、運航スケジュール、特定日の空席状況、特定便の遅延実績。これらは変動して誤りになる
- **書くこと**: 仕組みの解説、比較の観点、選び方、チェックリスト、用語解説、注意点
- 事実に自信がない箇所は本文で断定せず、PR 本文の「事実確認が必要な箇所」に列挙する
- 記事末尾の AI 注記はレイアウトが自動で付けるので本文には書かない
- h1 は書かない(タイトルはレイアウトが出す)

## アフィリエイト枠と広告枠

本文中に、単独の段落として次のプレースホルダーを書く。レイアウトがリンクボックスに展開する。

```
[[affiliate:rakuten-travel|検索語(任意)|リンクの文言(任意)]]
[[affiliate:jalan]]
[[affiliate:expedia|バンコク ホテル|バンコクのホテルを Expedia で探す]]
[[affiliate:amazon|ネックピロー|ネックピローを Amazon で探す]]
[[ad]]
```

- provider は `rakuten-travel` `jalan` `expedia` `amazon` の 4 つだけ
- 1 記事に 1〜3 個。本文の流れに沿った場所(「〜を探すなら」の直後など)に置く
- 国内ホテル系は `rakuten-travel` を優先、海外ホテルは `expedia`、旅行グッズは `amazon`
- `[[ad]]` は任意。入れるなら本文中盤の h2 直前に 1 つまで

## 内部リンク

- 既存記事(`src/content/posts/` を `ls` して確認)への内部リンクを最低 2 本入れる
- 書き方: `[記事タイトル](/posts/slug/)`(ルート相対。base はレイアウトが付ける。slug はファイル名から日付を除いたもの)
- 関連が薄い記事に無理に貼らない。「あわせて読みたい」の h2 を末尾に置いてまとめても良い

## ネタ帳(`topics/backlog.md`)

- 「未消化」から 1 件選び、書き終えたら「消化済み」に日付付きで移す
- 未消化が 5 件未満になったら、サイトのカテゴリに合う新ネタを 10 件追記する
- ビルドが失敗して記事を出せなかった場合は「失敗メモ」に日付と理由を書く

## 作業手順(定期実行エージェント向け)

1. `npm ci`
2. `CLAUDE.md`(このファイル)と `topics/backlog.md` を読む
3. ネタを 1 件選び、`src/content/posts/` の既存記事と題材が重複しないことを確認する
4. 記事を書く。`topics/backlog.md` を更新する
5. `npm test && npm run build` を実行し、成功を確認する
6. ブランチ `post/YYYY-MM-DD-slug` を作り、コミットし、PR を作る
7. PR 本文に「要約」「事実確認が必要な箇所」「使ったアフィリエイト枠」「内部リンク先」を列挙する

## 開発者向けメモ

- `npm run dev` でローカル確認、`npm test` で単体テスト、`npm run build` でビルド
- 設定は `site.config.ts` に集約。アフィリエイト ID や AdSense ID はここに書く
- 内部リンクは必ず `withBase()` を通す(GitHub Pages のサブパス配信)
- Astro 7 の Rust コンパイラは閉じタグ必須。`.astro` では void 要素以外を必ず閉じる
````

- [ ] **Step 2: `topics/backlog.md` を書く**

```md
# ネタ帳

エージェントは「未消化」から 1 件選んで記事にし、書き終えたら「消化済み」に移す。
未消化が 5 件未満になったら新しいネタを 10 件追記する。

## 未消化

- [lounge] 羽田空港のラウンジの種類と場所の整理(ターミナル別、保安検査の前後)
- [lounge] プライオリティ・パスとは何か。仕組みと向いている人
- [lounge] 成田空港のラウンジの種類と場所の整理
- [miles] 特典航空券の仕組み。必要マイル数の考え方と予約の流れ
- [miles] マイルの有効期限と失効を防ぐ考え方
- [miles] ANA と JAL のマイルプログラムの違い(仕組みの比較、数字は書かない)
- [miles] ポイントサイト経由でマイルを貯める仕組みと注意点
- [aircraft] 飛行機の座席の選び方。窓側・通路側・非常口席のメリットとデメリット
- [aircraft] ボーイング 787 とエアバス A350 の違いを乗客目線で解説
- [aircraft] 機内 Wi-Fi の仕組みと使うときの注意点
- [aircraft] 座席指定はいつすべきか。予約から搭乗までの流れ
- [domestic] 国内線の当日の流れ。チェックイン、保安検査、搭乗までの時間配分
- [domestic] 早朝便に間に合わせるための前泊という選択肢
- [domestic] 国内線で預け荷物と機内持ち込みを分ける考え方
- [overseas] 初めての海外旅行の準備チェックリスト(出発 1 か月前から当日まで)
- [overseas] 乗り継ぎ(トランジット)の基本。最低乗継時間と注意点
- [overseas] 海外のホテル予約サイトの選び方。比較するときの観点
- [overseas] 海外旅行保険の基本。クレジットカード付帯保険との違い
- [goods] ネックピローの選び方。形状と素材の違い
- [goods] 圧縮バッグとパッキングキューブの使い分け
- [goods] 海外で使う変換プラグと変圧器の違い

## 消化済み

- 2026-09-04 [lounge] 空港ラウンジとは? 種類と入り方をやさしく解説 → `2026-09-04-airport-lounge-basics`
- 2026-09-04 [miles] マイルとは? 貯め方の種類と使い道 → `2026-09-04-miles-basics`
- 2026-09-04 [goods] 機内持ち込み荷物のチェックリスト → `2026-09-04-carry-on-checklist`

## 失敗メモ

(なし)
```

- [ ] **Step 3: サンプル記事を 2 本追加する**

`src/content/posts/2026-09-04-miles-basics.md`:

```md
---
title: "マイルとは? 貯め方の種類と使い道をまとめて解説"
description: "航空会社のマイルは、フライト・クレジットカード・ポイント交換で貯まり、特典航空券や座席アップグレードに使えます。仕組みの全体像を初心者向けに整理しました。"
pubDate: 2026-09-04
category: miles
tags: ["マイル", "初心者向け"]
affiliate: ["rakuten-travel"]
---

「マイルを貯めるとタダで飛行機に乗れる」とよく聞きますが、何がどう貯まって、何に使えるのかは意外と分かりにくいものです。この記事では、マイルの仕組みを全体像から整理します。

## マイルは航空会社のポイント

マイルは、航空会社が運営するポイントプログラムの単位です。日本では ANA のマイレージクラブと JAL のマイレージバンクが代表的で、どちらも入会は無料です。

## 貯め方は大きく3種類

| 貯め方 | 概要 | 向いている人 |
| --- | --- | --- |
| フライト | 搭乗距離と運賃種別に応じて加算 | 出張や帰省で飛行機によく乗る人 |
| クレジットカード | 日常の支払いで貯める | 飛行機にはあまり乗らない人 |
| ポイント交換 | 他社ポイントをマイルに交換 | すでにポイントを貯めている人 |

多くの人にとって現実的なのは、クレジットカードとポイント交換の組み合わせです。飛行機に乗る機会が少なくても、日常の支払いを 1 枚のカードにまとめるだけで着実に貯まります。

## 主な使い道

- 特典航空券(マイルで航空券を発券する)
- 座席のアップグレード
- 提携ホテルや買い物での利用

もっとも価値が高いとされるのは特典航空券です。空港での過ごし方は [空港ラウンジとは? 種類と入り方をやさしく解説](/posts/airport-lounge-basics/) も合わせて読むと、旅の準備の全体像が掴めます。

## 有効期限に注意

マイルには有効期限が設定されていることが一般的です。期限の考え方はプログラムによって異なるので、貯め始める前に公式サイトで確認しておきましょう。

マイルで航空券を確保できたら、宿の予約も早めに済ませておくと安心です。

[[affiliate:rakuten-travel||国内ホテルを楽天トラベルで探す]]

## まとめ

- マイルは航空会社のポイントで、入会は無料
- 貯め方はフライト・クレジットカード・ポイント交換の 3 種類
- 特典航空券がもっとも価値の高い使い道
- 有効期限はプログラムごとに確認する
```

`src/content/posts/2026-09-04-carry-on-checklist.md`:

```md
---
title: "機内持ち込み荷物のチェックリスト。忘れがちな物と入れてはいけない物"
description: "機内に持ち込む荷物は、長時間フライトを快適にする物と、保安検査で引っかからない物の両面から考える必要があります。忘れやすい物と制限のある物をリストにしました。"
pubDate: 2026-09-04
category: goods
tags: ["持ち物", "チェックリスト"]
affiliate: ["amazon"]
---

機内持ち込み荷物は「あると快適な物」と「持ち込めない物」を分けて考えると整理しやすくなります。この記事では、出発前に確認しておきたい項目をチェックリスト形式でまとめます。

## 必ず手元に置く物

- パスポート(海外)や本人確認書類
- 搭乗券(スマートフォンの画面でも可)
- 財布、スマートフォン、充電ケーブル
- 常備薬

預け荷物が万一届かなかった場合に備えて、1 日分の下着や薬は機内持ち込みに入れておくと安心です。

## 長時間フライトを快適にする物

| アイテム | 役割 |
| --- | --- |
| ネックピロー | 首の負担を減らす |
| アイマスク・耳栓 | 機内の光と音を遮る |
| 保湿用品 | 乾燥対策 |
| 羽織り物 | 冷房対策 |
| モバイルバッテリー | 機内で充電できない場合の備え |

ネックピローは形状や素材で使い心地が大きく変わります。

[[affiliate:amazon|ネックピロー|ネックピローを Amazon で探す]]

## 持ち込みに制限がある物

- 液体類: 国際線では容量制限があり、透明な袋にまとめる必要がある
- モバイルバッテリー: 預け荷物には入れられず、容量の上限もある
- 刃物類: 小さなハサミやカッターも対象になることがある

制限の細かい条件は航空会社や国によって異なるので、出発前に公式サイトで確認しておきましょう。

## 準備の流れ

1. 出発 1 週間前にリストを見ながら不足品を買い足す
2. 前日に液体類とバッテリーを分けて詰める
3. 当日は搭乗券と本人確認書類を取り出しやすい場所に入れる

空港での待ち時間の過ごし方は [空港ラウンジとは? 種類と入り方をやさしく解説](/posts/airport-lounge-basics/) も参考にしてください。

## まとめ

- 貴重品と 1 日分の必需品は必ず機内持ち込みに
- 快適グッズはネックピロー、アイマスク、保湿、羽織り物
- 液体、バッテリー、刃物は制限を事前に確認する
```

- [ ] **Step 4: テストとビルドを通す**

Run(bash): `npm test && SITE_URL=https://example.github.io BASE_PATH=/ad_web npm run build && node -e "const h=require('fs').readFileSync('dist/posts/miles-basics/index.html','utf8');console.log(h.includes('href=\"/ad_web/posts/airport-lounge-basics/\"'))"`
Expected: テスト全通過、ビルド成功、出力 `true`(記事本文中の内部リンクに base が付いている)

- [ ] **Step 5: コミット**

```bash
git add CLAUDE.md topics src/content/posts
git commit -m "docs: add editorial guidelines, topic backlog, and sample posts"
```

---

### Task 10: 運用手順書と定期実行プロンプト

**Files:**
- Create: `docs/SETUP.md`, `docs/routine-prompt.md`

- [ ] **Step 1: `docs/SETUP.md` を書く**

````md
# 初期セットアップ手順

## 1. GitHub にリポジトリを作って push

```bash
gh repo create ad_web --public --source=. --push
```

リポジトリ名を変える場合は、GitHub Pages の URL が `https://<ユーザー名>.github.io/<リポジトリ名>/` になることを覚えておく。ワークフローはリポジトリ名を自動で `BASE_PATH` に使う。

## 2. GitHub Pages を有効にする

リポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** にする。
その後 Actions タブで「Deploy to GitHub Pages」を手動実行(Run workflow)するか、main に何か push すると公開される。

## 3. Claude Code の定期実行を作る

`docs/routine-prompt.md` の内容を使って、Claude Code で `/schedule` を実行するか、https://claude.ai/code/routines から作成する。

- リポジトリ: このリポジトリの URL
- スケジュール: 週 1 回(例: 毎週月曜 9:00 JST = `0 0 * * 1` UTC)
- モデル: `claude-sonnet-5`(品質を上げたければ `claude-opus-5`)
- 許可ツール: Bash, Read, Write, Edit, Glob, Grep

初回は「今すぐ実行」で 1 本作らせて、PR の品質を確認する。

## 4. 楽天アフィリエイトに登録する

1. https://affiliate.rakuten.co.jp/ で楽天 ID を使って登録(審査なし)
2. 管理画面の「リンク作成」で表示されるアフィリエイト ID(`xxxxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx` 形式)を控える
3. `site.config.ts` の `affiliate.rakutenTravel.id` に貼ってコミット、main に push
4. 公開後、記事内の楽天トラベル枠をクリックして、楽天アフィリエイトの管理画面でクリックが計測されることを確認する

## 5. 記事が増えたら(任意)

- 20〜30 本: 独自ドメインを取得し、Settings → Pages → Custom domain に設定。`.github/workflows/deploy.yml` の `SITE_URL` をそのドメインに、`BASE_PATH` を `/` に変更
- 同時期: A8.net に登録し、じゃらん・Expedia の広告リンクを `site.config.ts` の `affiliate.jalan.url` / `affiliate.expedia.url` に設定
- 同時期: Google AdSense に申請。承認後 `site.config.ts` の `adsense.client` に `ca-pub-...` を設定
- 30 本以降: Amazon アソシエイトに申請。承認後 `affiliate.amazon.tag` を設定
- お問い合わせフォーム: Google フォームを作り、埋め込み URL を `contactFormUrl` に設定

## 週次の運用

1. PR が来たら本文を斜め読みし、「事実確認が必要な箇所」を確認する
2. 問題なければ Merge。数分後にサイトへ反映される
3. 直したい点があれば PR にコメントして Close。次回のネタとして `topics/backlog.md` に書き戻す
````

- [ ] **Step 2: `docs/routine-prompt.md` を書く**

````md
# 定期実行(routine)の設定内容

## 基本設定

- 名前: weekly-travel-post
- リポジトリ: https://github.com/<ユーザー名>/ad_web
- cron: `0 0 * * 1`(毎週月曜 9:00 JST)
- モデル: claude-sonnet-5
- allowed_tools: Bash, Read, Write, Edit, Glob, Grep

## プロンプト(そのまま貼る)

```
あなたは旅行・飛行機情報サイト「そらたび手帖」の記事ライターです。このリポジトリで新しい記事を 1 本書き、PR を作成してください。

手順:
1. `npm ci` を実行する
2. `CLAUDE.md` を読み、編集方針とプレースホルダーの書き方を把握する
3. `topics/backlog.md` の「未消化」から 1 件選ぶ。`ls src/content/posts/` で既存記事を確認し、題材が重複しないものを選ぶ
4. `src/content/posts/YYYY-MM-DD-slug.md` を作成する(YYYY-MM-DD は今日の日付、slug は英小文字とハイフン)。frontmatter は `src/content.config.ts` のスキーマに従う。本文は CLAUDE.md のルール(3,000〜4,000 字、価格や運航スケジュールは書かない、アフィリエイト枠 1〜3 個、内部リンク 2 本以上)を守る
5. `topics/backlog.md` を更新する: 選んだネタを「消化済み」に日付付きで移す。未消化が 5 件未満なら新ネタを 10 件追記する
6. `npm test && npm run build` を実行する。失敗したら原因を直す。直せない場合は記事ファイルを削除し、`topics/backlog.md` の「失敗メモ」に日付と理由を書いて、それだけを PR にする
7. `git checkout -b post/YYYY-MM-DD-slug` でブランチを作り、変更をコミットして push し、`gh pr create` で main への PR を作る

PR のタイトルは記事タイトルにする。PR 本文には次の見出しで書く:
- 要約(3 行以内)
- 事実確認が必要な箇所(本文中で自信のない記述を箇条書き。なければ「なし」)
- 使ったアフィリエイト枠(provider と配置場所)
- 内部リンク先(リンクした記事の slug)

注意:
- 記事本文に価格、運賃、キャンペーン期限、運航スケジュールを書かない
- 体験談風の断定を書かない
- h1 を書かない。AI 注記はレイアウトが付けるので書かない
- 1 回の実行で書く記事は 1 本だけ
```
````

- [ ] **Step 3: コミット**

```bash
git add docs/SETUP.md docs/routine-prompt.md
git commit -m "docs: add setup guide and routine prompt"
```

---

### Task 11: 最終確認

- [ ] **Step 1: クリーンな状態で全体を検証する**

Run(bash): `rm -rf node_modules dist && npm ci && npm test && SITE_URL=https://example.github.io BASE_PATH=/ad_web npm run build`
Expected: 全テスト通過、ビルド成功

- [ ] **Step 2: base なしでビルドし直してプレビューで目視する**

Run: `npm run build && npm run preview`
Expected: `http://localhost:4321/` でトップに 3 記事。記事ページに目次・リンクボックス(`[PR]` 付き)・AI 注記が表示される。ヘッダーのカテゴリリンク、フッターのリンクが動く。確認後に Ctrl+C で止める。

- [ ] **Step 3: 作業ツリーがクリーンなことを確認する**

Run: `git status --short`
Expected: 出力なし
