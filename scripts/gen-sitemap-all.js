// scripts/gen-sitemap-all.js
// 重建 sitemap：sitemap-index.xml + 3 个子文件
// 运行: node scripts/gen-sitemap-all.js
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'lib', 'tools-data.ts');
const OUT_DIR = path.join(__dirname, '..', 'public');
const TODAY = '2026-08-13'; // 统一 lastmod

const src = fs.readFileSync(DATA_PATH, 'utf8');

// 提取分类
const catRe = /slug:\s*'([^']+)'[^}]*?nameKey:\s*'cat\./g;
const cats = [];
let m;
while ((m = catRe.exec(src)) !== null) { if (!cats.includes(m[1])) cats.push(m[1]); }

// 提取工具
const toolRe = /slug:\s*'([^']+)'[^}]*?category:\s*'([^']+)'/g;
const tools = [];
while ((m = toolRe.exec(src)) !== null) { tools.push({ slug: m[1], category: m[2] }); }

const BASE = 'https://tooltip.cc';

function url(loc, lastmod, freq, pri) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`;
}

function writeSitemap(filename, urls) {
  const lines = ['<?xml version="1.0" ?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const u of urls) lines.push(url(u.loc, u.lastmod || TODAY, u.freq || 'weekly', u.pri || '0.5'));
  lines.push('</urlset>');
  lines.push('');
  const out = lines.join('\n');
  fs.writeFileSync(path.join(OUT_DIR, filename), out, 'utf8');
  return urls.length;
}

// 1. static-pages.xml：首页 + about + privacy
writeSitemap('sitemap-static.xml', [
  { loc: `${BASE}/`, lastmod: TODAY, freq: 'weekly', pri: '1.0' },
  { loc: `${BASE}/about`, lastmod: '2026-06-05', freq: 'monthly', pri: '0.5' },
  { loc: `${BASE}/privacy-policy`, lastmod: '2026-06-05', freq: 'monthly', pri: '0.5' },
]);

// 2. categories.xml：10 个分类页
const catUrls = cats.map(slug => ({
  loc: `${BASE}/${slug}`,
  lastmod: TODAY,
  freq: 'weekly',
  pri: '0.9',
}));
writeSitemap('sitemap-categories.xml', catUrls);

// 3. tools.xml：92 个工具页（按分类排序）
const byCat = {};
for (const t of tools) { (byCat[t.category] = byCat[t.category] || []).push(t); }
const toolUrls = [];
for (const c of cats) { for (const t of byCat[c] || []) toolUrls.push({ loc: `${BASE}/${c}/${t.slug}`, lastmod: TODAY, freq: 'monthly', pri: '0.8' }); }
writeSitemap('sitemap-tools.xml', toolUrls);

// 4. sitemap-index.xml
const indexLines = ['<?xml version="1.0" ?>', '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const [loc, lastmod] of [
  [`${BASE}/sitemap-static.xml`, TODAY],
  [`${BASE}/sitemap-categories.xml`, TODAY],
  [`${BASE}/sitemap-tools.xml`, TODAY],
]) {
  indexLines.push('  <sitemap>');
  indexLines.push(`    <loc>${loc}</loc>`);
  indexLines.push(`    <lastmod>${lastmod}</lastmod>`);
  indexLines.push('  </sitemap>');
}
indexLines.push('</sitemapindex>');
indexLines.push('');
fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), indexLines.join('\n'), 'utf8');

console.log(`Done: sitemap.xml (index) + sitemap-static.xml (${3} urls) + sitemap-categories.xml (${catUrls.length} urls) + sitemap-tools.xml (${toolUrls.length} urls)`);
