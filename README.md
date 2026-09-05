# そらたび手帖

飛行機旅(空港ラウンジ・マイル・機材座席・国内外旅行の準備)をテーマにした、Astro 製の静的アフィリエイトブログです。

## 公開場所

- **公開サイト**: https://asahi0727.github.io/ad_web/
- ホスティング: GitHub Pages(このリポジトリの `main` に push すると GitHub Actions が自動でビルドして公開)
- リポジトリ: https://github.com/asahi0727/ad_web
- 記事作成ルーチン: https://claude.ai/code/routines (weekly-travel-post、毎週月曜 9:00 JST)

## 仕組み

記事は Claude Code のクラウド定期実行が週 1 本の下書きを PR として作成し、運用者が内容を確認して Merge するだけで公開されます。完全自動公開はせず、必ず人の承認を挟みます。

## ドキュメント

- 運用の手引き(初めての人向け): [docs/SETUP.md](docs/SETUP.md)
- 週次の定期実行プロンプト: [docs/routine-prompt.md](docs/routine-prompt.md)
- 編集方針・執筆ルール: [CLAUDE.md](CLAUDE.md)
- 設計書: [docs/superpowers/specs/2026-09-04-travel-affiliate-site-design.md](docs/superpowers/specs/2026-09-04-travel-affiliate-site-design.md)
