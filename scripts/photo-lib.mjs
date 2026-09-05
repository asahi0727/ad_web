/**
 * 記事写真まわりの純粋関数。scripts/photo.mjs から使い、tests/ で検証する。
 */

/** 使ってよいライセンスの接頭辞(表示義務のある CC BY 系も含む) */
export const ALLOWED_LICENSES = ['CC0', 'Public domain', 'CC BY 2.0', 'CC BY 2.5', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 2.0', 'CC BY-SA 2.5', 'CC BY-SA 3.0', 'CC BY-SA 4.0'];

const LICENSE_URLS = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Public domain': 'https://commons.wikimedia.org/wiki/Commons:Licensing#Public_domain',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 2.5': 'https://creativecommons.org/licenses/by/2.5/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

export function stripHtml(s) {
  return String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/** ライセンス表記を許可リストの正規名に寄せる。許可外なら null */
export function normalizeLicense(name) {
  const n = stripHtml(name);
  for (const allowed of ALLOWED_LICENSES) {
    if (n === allowed || n.startsWith(allowed + ' ')) return allowed;
  }
  if (/^public domain/i.test(n) || /^PD/.test(n)) return 'Public domain';
  return null;
}

export function licenseUrl(license) {
  return LICENSE_URLS[license] ?? LICENSE_URLS['Public domain'];
}

/**
 * Commons の imageinfo から候補を作る。使えないものは null。
 * 条件: 横長(1.3 以上)、1600x900 以上、許可ライセンス、作者名がある
 */
export function toCandidate(page) {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const { width = 0, height = 0, extmetadata: meta = {} } = info;
  if (width < 1600 || height < 900 || width / height < 1.3) return null;
  const license = normalizeLicense(meta.LicenseShortName?.value);
  if (!license) return null;
  const author = stripHtml(meta.Artist?.value) || stripHtml(meta.Credit?.value);
  if (!author) return null;
  return {
    title: page.title,
    width,
    height,
    license,
    licenseUrl: licenseUrl(license),
    author: author.slice(0, 80),
    description: stripHtml(meta.ImageDescription?.value).slice(0, 160),
    thumb: info.thumburl,
    source: info.descriptionurl,
  };
}

/** 中央で ratio(幅/高さ)に切り抜く矩形 */
export function cropBox(width, height, ratio) {
  if (width / height > ratio) {
    const w = Math.round(height * ratio);
    return { left: Math.floor((width - w) / 2), top: 0, width: w, height };
  }
  const h = Math.round(width / ratio);
  return { left: 0, top: Math.floor((height - h) / 2), width, height: h };
}

/** frontmatter に貼る photo ブロック(YAML) */
export function toFrontmatter(photo) {
  const q = (s) => JSON.stringify(String(s));
  return [
    'photo:',
    `  src: ${q(photo.src)}`,
    `  alt: ${q(photo.alt)}`,
    `  author: ${q(photo.author)}`,
    `  license: ${q(photo.license)}`,
    `  licenseUrl: ${q(photo.licenseUrl)}`,
    `  source: ${q(photo.source)}`,
  ].join('\n');
}
