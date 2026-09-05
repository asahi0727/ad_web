# セットアップと運用の手引き

このサイトは 2026-09-05 に公開済みです。この手引きは「これから何をすればいいか」を、初めての人向けに画面操作の単位で書いています。

- 公開 URL: https://asahi0727.github.io/ad_web/
- リポジトリ: https://github.com/asahi0727/ad_web
- 記事作成ルーチン: https://claude.ai/code/routines (毎週月曜 9:00 JST に記事の PR を作る)

## 済んでいること

| 項目 | 状態 |
|---|---|
| GitHub リポジトリの作成と push | 済み |
| GitHub Pages の有効化(ソース: GitHub Actions) | 済み。main に push すると数分で自動公開 |
| 記事作成ルーチンの作成 | 済み(weekly-travel-post、毎週月曜 9:00 JST、claude-sonnet-5) |
| Claude GitHub App のインストール | 済み(2026-09-05)。初回 PR #1 をマージ済み |
| 楽天アフィリエイト ID の設定 | 済み(2026-09-05)。記事内の楽天トラベル枠が成果報酬付きリンクになっている |
| お問い合わせフォーム(Google フォーム) | 済み(2026-09-05)。回答は Google フォームの「回答」タブに届く |
| Search Console の確認タグ | サイトに設置済み(2026-09-05)。`site.config.ts` の `analytics.searchConsole` |

## 毎週やること(所要 5〜10 分)

1. 月曜の朝、GitHub からメールが届く(件名は記事タイトル)。届かなければ https://github.com/asahi0727/ad_web/pulls を開く。
2. PR を開き、「Files changed」タブで記事本文を斜め読みする。
3. PR 本文の「事実確認が必要な箇所」を読む。気になる点があれば検索して確かめる。
4. 問題なければ緑の「Merge pull request」→「Confirm merge」を押す。数分後にサイトへ反映される。
5. 直したい点があれば「Conversation」タブの一番下で「Close pull request」を押す。直してほしい内容を `topics/backlog.md` の「未消化」に 1 行で書き足しておくと、次回以降のネタになる。

## これからやること

### D. Claude GitHub App をインストールする(済み。参考として残す)

記事作成ルーチンはクラウドで動き、GitHub へ push するときに「Claude GitHub App」の権限を使います。初回実行では記事が書けたのに push が 403 で拒否されました。

1. ブラウザで GitHub に **asahi0727** としてログインしていることを確認する(右上のアイコン)。
2. https://github.com/apps/claude/installations/select_target を開く。
3. アカウント一覧から **asahi0727** を選ぶ。
4. 「Only select repositories」を選び、**ad_web** にチェックを入れて「Install」を押す。
5. 済んだら Claude Code に「ルーチンをもう一度実行して」と頼む。数分後に https://github.com/asahi0727/ad_web/pulls に PR が出れば完了。

### A. 楽天アフィリエイトに登録する(済み。参考として残す)

記事内の「楽天トラベルで探す」リンクが成果報酬付きになります。

1. https://affiliate.rakuten.co.jp/ を開き、楽天 ID でログインして登録する(楽天 ID が無ければ先に作る)。
2. 登録後、楽天にログインしたまま https://webservice.rakuten.co.jp/account_affiliate_id/ を開く。「アフィリエイト ID」として `xxxxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx`(英数字 8 桁がドットで 4 つ)が表示されるので控える。
   - 別の方法: https://affiliate.rakuten.co.jp/ の上部にある検索欄で適当な商品を検索し、商品の「リンクを作成」ボタンを押すと、表示されるリンクコードの中に `hb.afl.rakuten.co.jp/hgc/xxxxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx/` という部分がある。この `hgc/` と次の `/` の間がアフィリエイト ID。
3. このプロジェクトを Claude Code で開き、次のように頼む。

   ```
   楽天アフィリエイトのIDは xxxxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx です。site.config.ts に設定して main に push してください
   ```

   自分で編集する場合は `site.config.ts` の `rakutenTravel: { id: '' }` の `''` の中に ID を貼り、コミットして push する。
4. 数分後、公開サイトの記事内リンクを一度クリックする。翌日以降、楽天アフィリエイトの管理画面「レポート」にクリック数が出ていれば設定完了。

### B. お問い合わせフォームを作る(済み。参考として残す)

AdSense や ASP の審査で「お問い合わせ手段」が求められるため、申請前に済ませます。

1. https://docs.google.com/forms/ で新しいフォームを作る。質問は「お名前」「メールアドレス」「お問い合わせ内容」の 3 つで十分。
2. 右上の「送信」→ `<>` (HTML を埋め込む) タブを開き、表示された `src="https://docs.google.com/forms/d/e/.../viewform?embedded=true"` の URL 部分を控える。
3. Claude Code で次のように頼む。

   ```
   お問い合わせフォームの埋め込みURLは https://docs.google.com/forms/d/e/.../viewform?embedded=true です。site.config.ts に設定して main に push してください
   ```

4. 数分後、https://asahi0727.github.io/ad_web/contact/ にフォームが表示されていれば完了。

### C. Google Search Console に登録する(無料、任意、10 分)

検索エンジンに記事を早く見つけてもらうための設定です。

1. https://search.google.com/search-console/ を開き、「プロパティを追加」→「URL プレフィックス」に `https://asahi0727.github.io/ad_web/` を入れる。
2. 所有権の確認は「HTML タグ」を選ぶ。表示される `<meta name="google-site-verification" content="...">` の `content` の値を控える。
3. Claude Code に「Search Console の確認タグの content は ... です。サイトに入れて push してください」と頼む(`site.config.ts` の `analytics.searchConsole` に入る)。反映後、Search Console の「確認」を押す。
4. 左メニュー「サイトマップ」に `sitemap-index.xml` と入力して送信する。

## 記事が増えたら(任意)

- **20〜30 本**: 独自ドメインを取得し、Settings → Pages → Custom domain に設定。`.github/workflows/deploy.yml` の `SITE_URL` をそのドメインに、`BASE_PATH` を `/` に変更する。
- **同時期**: A8.net に登録し、じゃらん・Expedia の広告リンクを `site.config.ts` の `affiliate.jalan.url` / `affiliate.expedia.url` に設定する。
- **同時期**: Google AdSense に申請する。申請時に発行される `ca-pub-...` を `site.config.ts` の `adsense.client` に設定して main に push し、サイトに反映されてから審査を待つ。承認後、AdSense 管理画面で「ディスプレイ広告」ユニットを作成し、その広告ユニット ID(数字)を `adsense.slot` に設定すると記事内の広告枠が有効になる。
- **30 本以降**: Amazon アソシエイトに申請する。承認後 `affiliate.amazon.tag` を設定する。

## 困ったとき

- **記事の PR が月曜に来ない**: https://claude.ai/code/routines で weekly-travel-post が「有効」か確認する。実行履歴にエラーがあれば、その画面の内容を Claude Code に貼って相談する。
- **マージしたのにサイトが更新されない**: https://github.com/asahi0727/ad_web/actions で「Deploy to GitHub Pages」が失敗していないか見る。赤い × があればクリックして、エラー文を Claude Code に貼って相談する。
- **記事の頻度を変えたい**: Claude Code で「記事ルーチンを週 2 回(月・木)にして」と頼む。
- **ルーチンを止めたい**: https://claude.ai/code/routines で該当ルーチンを無効化する。

## 参考: リポジトリを作り直す場合

```bash
gh repo create <リポジトリ名> --public --source=. --push
```

`main` ブランチにいる状態で実行する。公開 URL は `https://<ユーザー名>.github.io/<リポジトリ名>/` になり、ワークフローがリポジトリ名を自動で `BASE_PATH` に使う。作成後、Settings → Pages → Source を **GitHub Actions** にする。
