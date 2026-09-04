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
