'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataFile = path.join(root, '_data/travel/shandong_2026.yml');
const imageRoot = path.join(root, 'assets/images/travel/shandong-2026');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const queries = {
  'a-penglai': 'Penglai Pavilion', 'a-penglai-ocean': '蓬莱 海洋 极地 世界', 'a-sanxian': '蓬莱 三仙山',
  'a-yantaishan': '烟台山', 'a-changyu': '张裕酒文化博物馆', 'a-fisher': '烟台 渔人码头',
  'a-liugong': '威海 刘公岛', 'a-haiyuan': '威海 海源公园', 'a-huoju': '威海 火炬八街',
  'a-naxianghai': '荣成 那香海', 'a-olympic': '青岛 奥帆中心', 'a-mayfourth': '青岛 五四广场',
  'a-zhanqiao': '青岛 栈桥', 'a-xiaoyushan': '青岛 小鱼山', 'a-signalhill': '青岛 信号山',
  'a-cathedral': 'St. Michael Cathedral Qingdao', 'a-underwater': 'Qingdao underwater world',
  'a-polar': '青岛 极地海洋公园', 'a-badaguan': '青岛 八大关', 'a-yangma': '烟台 养马岛',
  'a-suo': '烟台 所城里', 'a-banyue': '威海 半月湾', 'a-chengshan': '荣成 成山头',
  'a-jinshi': '荣成 金石湾', 'a-xiaomai': '青岛 小麦岛'
};

// Commons 搜索按标题相关度返回，仍可能混入同名地铁站或城市卫星图。
// 人工复核后在这里排除，保证详情页只展示能帮助决策的现场画面。
const rejectedPageIds = new Set([131490195, 58593130, 160438834]);
const curateOnly = process.argv.includes('--curate-only');
const fallbackPhoto = (name) => ({
  src: '/assets/images/travel/shandong-2026/place-placeholder.svg',
  alt: `${name}资料封面（非实拍）`,
  credit: '穆朗旅行执行台 · 原创占位插画',
  license: '原创项目资产',
  source: 'local-generated-placeholder'
});

function curl(args) {
  return execFileSync('curl', [
    '--silent', '--show-error', '--fail', '--retry', '2',
    '--user-agent', 'MoulangTravelPlanner/3.0 (https://zhuyuncheng.github.io/)'
  ].concat(args), {
    encoding: args.includes('-o') ? undefined : 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });
}

function pause(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function text(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function search(query) {
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '8',
    prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '960', format: 'json', origin: '*'
  });
  const response = curl([`https://commons.wikimedia.org/w/api.php?${params}`]);
  const result = JSON.parse(response);
  return Object.values((result.query && result.query.pages) || {}).sort((a, b) => a.index - b.index);
}

const credits = [];
for (const poi of data.pois.filter((item) => item.type === 'attraction')) {
  const placeholder = (poi.photos || []).find((photo) => /place-placeholder/.test(photo.src)) || fallbackPhoto(poi.name);
  const existing = (poi.photos || []).filter((photo) => {
    if (/place-placeholder/.test(photo.src)) return false;
    const match = String(photo.src).match(/commons-(\d+)/);
    return !match || !rejectedPageIds.has(Number(match[1]));
  });
  const knownSources = new Set(existing.map((photo) => photo.source));
  let candidates = [];
  if (existing.length >= 3) {
    poi.photos = existing;
    poi.photos.forEach((photo) => {
      if (photo.source) credits.push({ poi: poi.id, file: photo.src.replace('/assets/images/travel/shandong-2026/', ''), source: photo.source, author: photo.credit, license: photo.license });
    });
    console.log(`${poi.id}: ${poi.photos.length} photo(s)`);
    continue;
  }
  if (curateOnly) {
    poi.photos = existing.length ? existing : [placeholder];
    poi.photos.forEach((photo) => {
      if (photo.source && !/placeholder/.test(photo.source)) credits.push({ poi: poi.id, file: photo.src.replace('/assets/images/travel/shandong-2026/', ''), source: photo.source, author: photo.credit, license: photo.license });
    });
    console.log(`${poi.id}: ${poi.photos.length} curated photo(s)`);
    continue;
  }
  pause(1600);
  try { candidates = search(queries[poi.id] || poi.name); } catch (error) {
    console.warn(`search failed: ${poi.id} ${error.message}`);
  }
  for (const page of candidates) {
    if (existing.length >= 3) break;
    if (rejectedPageIds.has(Number(page.pageid))) continue;
    const info = page.imageinfo && page.imageinfo[0];
    const meta = info && info.extmetadata || {};
    const license = text(meta.LicenseShortName && meta.LicenseShortName.value);
    if (!info || !/^image\/(jpeg|png|webp)$/.test(info.mime || '') || !license || knownSources.has(info.descriptionurl)) continue;
    const extension = info.mime === 'image/png' ? 'png' : info.mime === 'image/webp' ? 'webp' : 'jpg';
    const directory = path.join(imageRoot, poi.id);
    const filename = `commons-${page.pageid}.${extension}`;
    const absolute = path.join(directory, filename);
    fs.mkdirSync(directory, { recursive: true });
    try { curl(['-L', info.thumburl || info.url, '-o', absolute]); } catch (error) {
      console.warn(`download failed: ${poi.id}/${filename}`);
      continue;
    }
    const author = text((meta.Attribution || meta.Artist || {}).value) || 'Wikimedia Commons contributor';
    existing.push({
      src: `/assets/images/travel/shandong-2026/${poi.id}/${filename}`,
      alt: `${poi.name}授权实拍`, credit: author, license, source: info.descriptionurl
    });
    knownSources.add(info.descriptionurl);
  }
  poi.photos = existing.length ? existing : [placeholder];
  poi.photos.forEach((photo) => {
    if (photo.source) credits.push({ poi: poi.id, file: photo.src.replace('/assets/images/travel/shandong-2026/', ''), source: photo.source, author: photo.credit, license: photo.license });
  });
  console.log(`${poi.id}: ${poi.photos.length} photo(s)`);
}

fs.writeFileSync(dataFile, `${JSON.stringify(data, null, 2)}\n`);
const quote = (value) => JSON.stringify(String(value || ''));
const sourceLines = [
  'generated:',
  '  - file: place-placeholder.svg',
  '    description: 山东半岛旅行资料封面，非地点实拍',
  '    author: 穆朗旅行执行台',
  '    license: 原创项目资产',
  'authorized_photos:'
];
credits.forEach((item) => {
  sourceLines.push(`  - poi: ${item.poi}`, `    file: ${quote(item.file)}`, `    source: ${quote(item.source)}`, `    author: ${quote(item.author)}`, `    license: ${quote(item.license)}`);
});
sourceLines.push('notes:', '  - 授权实拍已下载为项目本地资产，页面不依赖图片外链。', '  - 酒店和餐厅无明确复用授权时使用占位插画，并明确标注非现场实拍。', '');
fs.writeFileSync(path.join(imageRoot, 'SOURCES.yml'), sourceLines.join('\n'));
console.log(`saved ${credits.length} authorized photo credits`);
