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
    /** 広告ユニット ID(数字)。client と slot の両方が設定されたときだけ広告枠を出す */
    slot: string;
  };
  analytics: {
    /** 例: 'G-XXXXXXXXXX'。空ならタグを出さない */
    ga4: string;
    /** Google Search Console の所有権確認タグの content 値。空ならタグを出さない */
    searchConsole: string;
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
  contactFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSebUkAJvpt1Ze3xS_BglCgRbj31ClMD-PFq8FQMy6Qy1Xe6_w/viewform?embedded=true',
  adsense: { client: '', slot: '' },
  analytics: { ga4: '', searchConsole: 'QDNjb-Gi3J7PPb8Td2MYO8QkVoYsmQ9I8iK-_vl8ACA' },
  affiliate: {
    rakutenTravel: { id: '572e6e0a.18da062b.572e6e0b.79ef97d9' },
    jalan: { url: '' },
    expedia: { url: '' },
    amazon: { tag: '' },
  },
};
