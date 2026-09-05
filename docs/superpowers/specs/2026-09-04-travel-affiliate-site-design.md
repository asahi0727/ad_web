# 旅行・飛行機アフィリエイトサイト 設計書

作成日: 2026-09-04

## 1. 目的と方針

- 旅行・飛行機ジャンルのアフィリエイトサイトを、最小の手間と費用で運用し、広告収入を得る。
- 記事は人が書かない。Claude Code のクラウド定期実行(routine)が週1本の下書き PR を作り、運用者は PR をマージするだけ。
- 費用は独自ドメイン代(任意、年1,500円前後)以外ゼロ。GitHub Pages、GitHub Actions、Claude Code の定期実行はすべて既存契約内で賄う。
- 完全自動公開はしない。Google の「スケールされたコンテンツの不正使用」ポリシーと ASP 審査への対策として、必ず人の承認(PR マージ)を挟む。

## 2. 技術構成

| 項目 | 選定 | 理由 |
|---|---|---|
| サイト生成 | Astro(最新安定版)+ TypeScript | Markdown を置くだけで記事になる。SEO・速度に強い。部品化しやすい |
| スタイル | 素の CSS(Tailwind 不使用) | 依存を減らしビルド失敗リスクを下げる |
| ホスティング | GitHub Pages(GitHub Actions ソース) | 無料。将来は Cloudflare Pages + 独自ドメインへ移行可能 |
| CI/CD | GitHub Actions `deploy.yml` | main へのマージで自動ビルド・公開 |
| 記事生成 | Claude Code クラウド定期実行 | 追加課金なし。GitHub リポジトリをクローンして PR を作成できる |
| 画像 | Wikimedia Commons の自由ライセンス写真をカテゴリ単位で 7 枚だけ使う(`public/photos/`、クレジットは運営者情報に表示)。記事ごとの画像は使わない | 費用ゼロ、出典表記で著作権を満たす |

## 3. リポジトリ構成

```
ad_web/
├── CLAUDE.md               # 編集方針(エージェント用の執筆ルール)
├── topics/backlog.md       # ネタ候補リスト(未消化 / 消化済み / 失敗メモ)
├── site.config.ts          # サイト名、説明、アフィリエイト ID、AdSense ID を一元管理
├── src/
│   ├── content.config.ts   # コンテンツコレクションのスキーマ定義
│   ├── content/
│   │   └── posts/          # 記事 Markdown(1 記事 1 ファイル、YYYY-MM-DD-slug.md)
│   ├── components/         # SiteHeader, SiteFooter, DepartureBoard, PostRow, TOC, AdSlot, AiNotice
│   ├── layouts/            # BaseLayout, PostLayout
│   ├── pages/              # index, posts/[slug], category/[category], about, privacy, contact
│   └── styles/             # global.css
├── public/                 # favicon, robots.txt
├── .github/workflows/deploy.yml
└── docs/superpowers/specs/ # 設計書
```

## 4. 記事データモデル(frontmatter)

コンテンツコレクションで型検証する。スキーマ違反はビルドエラーになり、壊れた PR はマージ前に検知できる。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| title | string | 必須 | 記事タイトル(32〜60 字目安) |
| description | string | 必須 | 要約(80〜120 字)。meta description と一覧カードに使用 |
| pubDate | date | 必須 | 公開日 |
| updatedDate | date | 任意 | 更新日 |
| category | enum | 必須 | `lounge` / `miles` / `aircraft` / `domestic` / `overseas` / `goods` |
| tags | string[] | 任意 | 自由タグ |
| affiliate | enum[] | 任意 | 使用する部品種別: `rakuten-travel` / `jalan` / `expedia` / `amazon` |
| draft | boolean | 任意(既定 false) | true の記事はビルド対象外 |

カテゴリの表示名: 空港ラウンジ / マイル / 機材・座席 / 国内旅行 / 海外旅行 / 旅行グッズ

## 5. コンポーネント

- **アフィリエイト枠(プレースホルダー方式)**: 素の Markdown ではコンポーネントを直接書けない(MDX が必要になる)ため、本文には単独段落として `[[affiliate:rakuten-travel|検索語|リンク文言]]` と書く。`PostLayout` が本文 HTML を `Astro.slots.render` で取得し、純粋関数 `transformBody()` がリンクボックス HTML に展開する。`site.config.ts` の ID が未設定なら公式サイトへの通常リンクになり、サイトは壊れない。`rel="sponsored noopener"` と `[PR]` 表記を必ず付ける。同じ仕組みで `[[ad]]` を広告枠に展開し、本文中のルート相対リンクに base を付与する。
- **AdSlot**: AdSense のクライアント ID が設定されているときのみ広告枠を描画。未設定なら何も出力しない。
- **写真**: `src/lib/photos.ts` にカテゴリ別 6 枚とトップ用 1 枚を定義。出発案内板・記事タイトル板・カテゴリページの背景(紺を透かして重ねる)と、トップのカテゴリ板のサムネイルに使う。CC BY / CC BY-SA の写真は運営者情報ページの「写真について」でクレジットを表示する。
- **記事写真**: 1 記事 1 枚、frontmatter の `photo`(src / alt / author / license / licenseUrl / source)に登録する。`scripts/photo.mjs` が Wikimedia Commons を検索し、候補サムネイルを保存して選ばせ、1600x900 の WebP を `public/photos/posts/<slug>.webp` に書き出す。PostLayout が本文の前に写真とクレジットを表示する。本文中の写真は frontmatter の `photos[]`(id 付き)に登録し、本文の単独段落 `[[photo:id]]` の位置に `transformBody()` が展開する(未登録 id はビルドエラー)。写真は任意で、良い候補が無ければ省略する。1 記事 3 枚まで。
- **アイキャッチ**: 使わない(2026-09-05 のデザイン刷新で廃止)。記事タイトルは紺のサイン板に大きく表示し、SNS 用の画像は生成しない(`og:title` / `og:description` / `og:url` のみ出力)。
- **TOC**: h2 のみから目次を生成する(h3 はネスト処理を避けるため含めない)。
- **DepartureBoard / PostRow**: トップの出発案内板(新着 5 件)と、時刻表のような記事一覧の行。
- **AiNotice**: 記事末尾の定型注記「この記事は AI を活用して執筆しています。価格・運航情報などは必ず公式サイトでご確認ください」。PostLayout が自動挿入する。

## 6. 必須ページ

- トップ(最新記事一覧)、記事ページ、カテゴリ一覧
- プライバシーポリシー(AdSense・ASP 審査で必須。Cookie、アフィリエイト、アクセス解析の記載)
- 運営者情報(about)
- お問い合わせ(Google フォーム埋め込み。URL は `site.config.ts` で設定、未設定なら「準備中」表示)
- sitemap.xml、RSS(`@astrojs/sitemap`、`@astrojs/rss` で自動生成)
- robots.txt

## 7. 記事生成パイプライン(週次ルーチン)

Claude Code のクラウド定期実行を週 1 回設定する(曜日・時刻は運用者が指定、UTC 換算して登録)。プロンプトは自己完結させ、以下を行わせる。

1. `CLAUDE.md` と `topics/backlog.md` を読む
2. 「未消化」から 1 件選ぶ。`src/content/posts/` の既存記事と題材が重複しないか確認する
3. 記事 Markdown を 1 本作成する(3,000〜4,000 字、h2/h3 構成、まとめ、AffiliateBox の挿入、既存記事への内部リンク 2 本以上)。`scripts/photo.mjs` で記事写真を 1 枚選び、frontmatter に登録する
4. `backlog.md` の該当行を「消化済み」に移す。未消化が 5 件未満なら新ネタを 10 件追記する
5. `npm ci && npm run build` でビルドが通ることを確認する
6. ブランチ `post/YYYY-MM-DD-slug` を切り、PR を作成する。PR 本文に「要約」「事実確認が必要な箇所」「使った AffiliateBox」「内部リンク先」を列挙する

失敗時: ビルドが通らない場合は記事 PR を出さず、`backlog.md` の「失敗メモ」に日付と理由を書いた PR だけを出す。

モデル: 既定は `claude-sonnet-5`。品質を見て `claude-opus-5` に切り替え可能。

## 8. 編集方針(CLAUDE.md に記載)

- 文体: です・ます調。1 文は短く。体験談風の断定(「私は〜しました」)は書かない
- 書かないこと: 具体的な価格、運賃、キャンペーン期限、運航スケジュール、特定日の空席状況(変動して誤りになるため)
- 書くこと: 仕組みの解説、比較の観点、選び方、チェックリスト、用語解説
- 記事末尾の AI 注記はレイアウトが自動挿入するので本文には書かない
- アフィリエイト枠のプレースホルダー `[[affiliate:...]]` は 1 記事 1〜3 個。本文の流れに沿った位置に置く
- 内部リンクは最低 2 本
- frontmatter はスキーマに厳密に従う
- 事実に自信がない箇所は本文に断定で書かず、PR 本文の「事実確認が必要な箇所」に列挙する

## 9. 収益化の段階

| 段階 | 記事数の目安 | やること |
|---|---|---|
| 1 | 0〜10 本 | 楽天アフィリエイト登録(審査なし)。楽天トラベルのリンクボックスを配置 |
| 2 | 20〜30 本 | 独自ドメイン取得(唯一の有料項目)。A8.net 申請(じゃらん、Expedia)。Google AdSense 申請 |
| 3 | 30 本以降 | Amazon アソシエイト申請(旅行グッズ向け。180 日以内に 3 件成約が必要なので後回し) |

段階 2 以降は任意。段階 1 のみなら完全無料。

## 10. 運用者の初期セットアップ手順

1. GitHub にリポジトリを作成して push
2. リポジトリ設定 > Pages > Source を「GitHub Actions」に設定
3. Claude Code のクラウド定期実行を作成(設定内容はこのプロジェクトの `docs/routine-prompt.md` に用意する)
4. 楽天アフィリエイトに登録し、ID を `site.config.ts` に記入してマージ

初期 URL は `https://<ユーザー名>.github.io/<リポジトリ名>/`。Astro の `base` 設定でサブパス配信に対応する。

## 11. テスト方針

- `npm run build` が通ることを CI(PR 時)で検証する。これが最重要のテスト
- コンテンツコレクションのスキーマ検証で frontmatter の誤りを検知する
- `AffiliateBox` / `AdSlot` は ID 未設定・設定済みの両ケースでレンダリング結果を確認する(Astro Container API またはビルド出力の HTML を検査)
- サンプル記事を 2〜3 本同梱し、ビルドとレイアウトの動作確認に使う

## 12. 含めないもの(YAGNI)

コメント機能、サイト内検索、会員機能、多言語対応、画像生成、アクセス解析の作り込み(必要になれば GA4 タグを `site.config.ts` で有効化できる欄だけ用意する)。

## 13. 既知のリスク

- AI 生成記事はポリシー・審査リスクがある。人の承認、AI 注記、変動情報を書かない方針で緩和する
- GitHub Pages のサブパス配信は Astro の `base` 設定を忘れるとリンクが壊れる。独自ドメイン移行時に `base` を `/` に戻す
- クラウド定期実行の利用枠はプランに依存する。週 1 本から始め、上限に当たったら頻度を下げる
