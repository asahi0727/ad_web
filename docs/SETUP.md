# 初期セットアップ手順

## 1. GitHub にリポジトリを作って push

```bash
gh repo create ad_web --public --source=. --push
```

リポジトリ名を変える場合は、GitHub Pages の URL が `https://<ユーザー名>.github.io/<リポジトリ名>/` になることを覚えておく。ワークフローはリポジトリ名を自動で `BASE_PATH` に使う。

`gh repo create ... --push` は現在のブランチを push してそれをデフォルトブランチにするため、作業ブランチをマージした後に `main` に切り替えてから実行する(先に作業ブランチのまま実行してしまった場合は、Settings → Branches でデフォルトブランチを `main` に変更する)。

## 2. GitHub Pages を有効にする

リポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** にする。
その後 Actions タブで「Deploy to GitHub Pages」を手動実行(Run workflow)するか、main に何か push すると公開される。

プロジェクトサイト(`<ユーザー名>.github.io/<リポジトリ名>/`)では `/robots.txt` を制御できないため、Google Search Console にサイトを登録して `https://<ユーザー名>.github.io/<リポジトリ名>/sitemap-index.xml` を手動で送信する。独自ドメイン移行後は robots.txt が有効になる。

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

## 5. お問い合わせフォームを用意する

1. Google フォームを作り、埋め込み URL(`https://docs.google.com/forms/d/e/.../viewform?embedded=true`)を控える
2. `site.config.ts` の `contactFormUrl` に設定してコミット、main に push

AdSense や ASP の審査ではお問い合わせ手段が求められるため、申請前に済ませておく。

## 6. 記事が増えたら(任意)

- 20〜30 本: 独自ドメインを取得し、Settings → Pages → Custom domain に設定。`.github/workflows/deploy.yml` の `SITE_URL` をそのドメインに、`BASE_PATH` を `/` に変更
- 同時期: A8.net に登録し、じゃらん・Expedia の広告リンクを `site.config.ts` の `affiliate.jalan.url` / `affiliate.expedia.url` に設定
- 同時期: Google AdSense に申請時に発行される `ca-pub-...` を `site.config.ts` の `adsense.client` に設定して main にマージし、サイトに反映されてから審査を待つ。承認後、AdSense 管理画面で「ディスプレイ広告」ユニットを作成し、その広告ユニット ID(数字)を `adsense.slot` に設定すると記事内の広告枠が有効になる(`adsense.client` だけでも自動広告は動く)
- 30 本以降: Amazon アソシエイトに申請。承認後 `affiliate.amazon.tag` を設定

## 週次の運用

1. PR が来たら本文を斜め読みし、「事実確認が必要な箇所」を確認する
2. 問題なければ Merge。数分後にサイトへ反映される
3. 直したい点があれば PR にコメントして Close。次回のネタとして `topics/backlog.md` に書き戻す
