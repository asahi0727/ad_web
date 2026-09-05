#!/usr/bin/env node
/**
 * 記事写真を Wikimedia Commons から探して取り込むスクリプト。
 *
 *   node scripts/photo.mjs search "<検索語(英語)>" [--limit 8]
 *     候補を .photo-candidates/ にサムネイル保存し、番号付きで一覧表示する。
 *     Read ツールでサムネイルを見て、人物が主役のもの・ロゴが主役のもの・
 *     事故や不快な場面・暗すぎる/ぼけたものを避けて選ぶ。
 *
 *   node scripts/photo.mjs pick <番号> <slug> --alt "<日本語の代替テキスト>"
 *     選んだ候補を 1600x900 の WebP に変換して public/photos/posts/<slug>.webp に保存し、
 *     frontmatter に貼る photo ブロック(先頭写真)を表示する。
 *
 *   node scripts/photo.mjs pick <番号> <slug> --id <id> --alt "<日本語の代替テキスト>"
 *     本文中に置く写真。public/photos/posts/<slug>-<id>.webp に保存し、
 *     frontmatter の photos に足す項目と、本文に書く [[photo:<id>]] を表示する。
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { cropBox, parsePickArgs, toCandidate, toFrontmatter, toPhotosItem } from './photo-lib.mjs';

const UA = 'soratabi-techo/1.0 (https://github.com/asahi0727/ad_web)';
const WORK = '.photo-candidates';
const OUT_DIR = 'public/photos/posts';
const WIDTH = 1600;
const HEIGHT = 900;

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchBytes(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function search(query, limit) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '40',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: String(WIDTH),
    iiextmetadatafilter: 'LicenseShortName|Artist|Credit|ImageDescription',
  });
  const data = await fetchJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const pages = Object.values(data?.query?.pages ?? {});
  const candidates = pages.map(toCandidate).filter(Boolean).slice(0, limit);
  await rm(WORK, { recursive: true, force: true }); // 前回の候補を消してから保存する
  await mkdir(WORK, { recursive: true });
  const rows = [];
  for (const [i, c] of candidates.entries()) {
    const thumbPath = path.join(WORK, `${i}.jpg`);
    try {
      const bytes = await fetchBytes(c.thumb.replace(`${WIDTH}px`, '480px'));
      await sharp(bytes).jpeg({ quality: 80 }).toFile(thumbPath);
      rows.push({ ...c, index: i, thumbPath });
    } catch (err) {
      console.error(`skip #${i}: ${err.message}`);
    }
  }
  await writeFile(path.join(WORK, 'candidates.json'), JSON.stringify({ query, rows }, null, 1));
  if (rows.length === 0) {
    console.log('候補がありません。検索語を変えてください(英語で、具体的な物や場所の名前を使う)。');
    return;
  }
  console.log(`検索語: ${query}\n`);
  for (const r of rows) {
    console.log(`#${r.index}  ${r.thumbPath}\n    ${r.title}\n    ${r.license} / ${r.author}\n    ${r.description || '(説明なし)'}\n`);
  }
  console.log('サムネイルを Read で確認して、node scripts/photo.mjs pick <番号> <slug> --alt "<代替テキスト>" で取り込む');
}

async function pick(index, slug, alt, id) {
  const { rows } = JSON.parse(await readFile(path.join(WORK, 'candidates.json'), 'utf8'));
  const c = rows.find((r) => r.index === index);
  if (!c) throw new Error(`候補 #${index} がありません。先に search を実行してください`);
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('slug は英小文字・数字・ハイフンのみ');
  if (!alt) throw new Error('--alt "<代替テキスト>" を指定してください');
  if (id && !/^[a-z0-9-]+$/.test(id)) throw new Error('--id は英小文字・数字・ハイフンのみ');
  const name = id ? `${slug}-${id}` : slug;
  const bytes = await fetchBytes(c.thumb);
  const meta = await sharp(bytes).metadata();
  const box = cropBox(meta.width, meta.height, WIDTH / HEIGHT);
  await mkdir(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${name}.webp`);
  await sharp(bytes).extract(box).resize(WIDTH, HEIGHT).webp({ quality: 78, effort: 6 }).toFile(outPath);
  const photo = {
    src: `/photos/posts/${name}.webp`,
    alt,
    author: c.author,
    license: c.license,
    licenseUrl: c.licenseUrl,
    source: c.source,
  };
  if (id) {
    console.log(`保存: ${outPath}\n\nfrontmatter の photos: に追加する項目(photos: が無ければ作る):\n\n${toPhotosItem({ id, ...photo })}\n\n本文の置きたい位置に単独の段落として書く:\n\n[[photo:${id}]]\n`);
  } else {
    console.log(`保存: ${outPath}\n\nfrontmatter に追加する行:\n\n${toFrontmatter(photo)}\n`);
  }
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === 'search') {
    const limitIdx = args.indexOf('--limit');
    const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : 8;
    const query = args.filter((_, i) => i !== limitIdx && i !== limitIdx + 1).join(' ');
    if (!query) throw new Error('検索語を指定してください');
    await search(query, limit);
  } else if (cmd === 'pick') {
    const { index, slug, alt, id } = parsePickArgs(args);
    await pick(index, slug, alt, id);
  } else {
    console.log('使い方:\n  node scripts/photo.mjs search "<query>" [--limit 8]\n  node scripts/photo.mjs pick <番号> <slug> --alt "<代替テキスト>"\n  node scripts/photo.mjs pick <番号> <slug> --id <id> --alt "<代替テキスト>"   (本文用)');
    process.exitCode = 1;
  }
} catch (err) {
  console.error(`エラー: ${err.message}`);
  process.exitCode = 1;
}
