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
- 画像は使わない(画像ファイルやルート相対の画像パスを書かない。記事のタイトルはレイアウトがサイン板として大きく表示する)

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
- Git Bash(Windows)で `BASE_PATH=/ad_web npm run build` のように環境変数を渡すときは `MSYS_NO_PATHCONV=1` を先頭に付ける(パス変換で `/ad_web` が壊れるため)
