import type { Category } from './categories';

/**
 * サイトで使う写真。すべて Wikimedia Commons から取得した自由ライセンスの写真で、
 * public/photos/ に 1600x700 と 800x350 の WebP を置いている。
 * クレジットは運営者情報ページに表示する(CC BY / CC BY-SA は表示が必須)。
 */
export interface Photo {
  /** public/ 以下のパス(ルート相対、base なし) */
  src: string;
  /** 半分サイズ(一覧のサムネイル用) */
  srcSmall: string;
  /** 代替テキスト(装飾用途では空文字にする) */
  alt: string;
  author: string;
  license: string;
  licenseUrl: string;
  /** Wikimedia Commons のファイルページ */
  source: string;
}

export type PhotoKey = 'hero' | Category;

const COMMONS = 'https://commons.wikimedia.org/wiki/';

function photo(key: PhotoKey, alt: string, author: string, license: string, licenseUrl: string, file: string): Photo {
  return {
    src: `/photos/${key}.webp`,
    srcSmall: `/photos/${key}-800.webp`,
    alt,
    author,
    license,
    licenseUrl,
    source: `${COMMONS}File:${encodeURIComponent(file)}`,
  };
}

const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const PD = 'https://commons.wikimedia.org/wiki/Commons:Licensing#Public_domain';
const BY2 = 'https://creativecommons.org/licenses/by/2.0/';
const BYSA2 = 'https://creativecommons.org/licenses/by-sa/2.0/';
const BYSA4 = 'https://creativecommons.org/licenses/by-sa/4.0/';

export const PHOTOS: Record<PhotoKey, Photo> = {
  hero: photo('hero', '夕焼けの空を飛ぶ飛行機の主翼', 'Paul-Vincent Roll', 'CC0', CC0, 'Sunset from a plane (Unsplash).jpg'),
  lounge: photo('lounge', '空港ラウンジのソファ席', 'Eugene Dimarsky', 'CC BY-SA 2.0', BYSA2, 'Air India Lounge.jpg'),
  miles: photo('miles', '雲の上を飛ぶ飛行機の翼端', 'U.S. Department of Agriculture', 'Public domain', PD, 'A wing tip of an airplane (40118125441).jpg'),
  aircraft: photo('aircraft', '旅客機のエコノミークラスの客室', 'Delta News Hub', 'CC BY 2.0', BY2, 'A220 Interior (45617530511).jpg'),
  domestic: photo('domestic', '羽田空港を離陸する ANA のボーイング 787', 'Masahiro TAKAGI', 'CC BY 2.0', BY2, 'All Nippon Airways Boeing 787-8 (JA821A) at Tokyo Haneda Airport (3).jpg'),
  overseas: photo('overseas', '夕方の空を飛ぶ大型旅客機', 'N509FZ', 'CC BY-SA 4.0', BYSA4, 'B-18215@PEK (20190630191441).jpg'),
  goods: photo('goods', '空港のカウンターに置かれたパスポートとスーツケース', 'Aaaatu', 'CC BY-SA 4.0', BYSA4, 'E2A0423.jpg'),
};

export const PHOTO_KEYS = Object.keys(PHOTOS) as PhotoKey[];
