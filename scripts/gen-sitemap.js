// 一次性脚本：从 tools-data.ts 动态重建 public/sitemap.xml
// 运行: node scripts/gen-sitemap.js
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'lib', 'tools-data.ts');
const OUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

const src = fs.readFileSync(DATA_PATH, 'utf8');

// 提取分类 slug：{ slug: 'xxx', nameKey: 'cat.yyy', ... }
const catRe = /slug:\s*'([^']+)'[^}]*?nameKey:\s*'cat\./g;
const cats = [];
let m;
while ((m = catRe.exec(src)) !== null) {
  if (!cats.includes(m[1])) cats.push(m[1]);
}

// 提取工具：{ slug: 'xxx', category: 'yyy', ... }
const toolRe = /slug:\s*'([^']+)'[^}]*?category:\s*'([^']+)'/g;
const tools = [];
while ((m = toolRe.exec(src)) !== null) {
  tools.push({ slug: m[1], category: m[2] });
}

// 静态页
const staticPages = [
  { loc: 'https://tooltip.cc', lastmod: '2026-08-09', freq: 'weekly', pri: '1.0' },
  { loc: 'https://tooltip.cc/about', lastmod: '2026-06-05', freq: 'monthly', pri: '0.5' },
  { loc: 'https://tooltip.cc/privacy-policy', lastmod: '2026-06-05', freq: 'monthly', pri: '0.5' },
];

const url = (loc, lastmod, freq, pri) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`;

const lines = ['<?xml version="1.0" ?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

// 首页
lines.push(url('https://tooltip.cc', '2026-08-09', 'weekly', '1.0'));

// 分类页
for (const c of cats) {
  lines.push(url(`https://tooltip.cc/${c}`, '2026-08-09', 'weekly', '0.9'));
}

// 工具页（按分类排序，保持可读性）
const byCat = {};
for (const t of tools) {
  (byCat[t.category] = byCat[t.category] || []).push(t);
}
for (const c of cats) {
  for (const t of byCat[c] || []) {
    lines.push(url(`https://tooltip.cc/${c}/${t.slug}`, '2026-08-09', 'monthly', '0.8'));
  }
}

// 静态辅助页
for (const p of staticPages.slice(1)) {
  lines.push(url(p.loc, p.lastmod, p.freq, p.pri));
}

lines.push('</urlset>');
lines.push('');

fs.writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');
console.log(`categories: ${cats.length}, tools: ${tools.length}, total urls: ${cats.length + tools.length + staticPages.length}`);
