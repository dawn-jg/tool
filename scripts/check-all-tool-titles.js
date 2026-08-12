// scripts/check-all-tool-titles.js v2
// 批量检查所有工具页 title 唯一性 + 英文版
const https = require('https');
const fs = require('fs');
const path = require('path');

const td = fs.readFileSync(path.resolve(__dirname, '../lib/tools-data.ts'), 'utf8');
const tools = [...td.matchAll(/slug: '([^']+)',[\s\S]*?category: '([^']+)'/g)]
  .map(m => ({ slug: m[1], category: m[2] }));

function fetch(u) {
  return new Promise((resolve, reject) => {
    https.get(u, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    }).on('error', reject);
  });
}

(async () => {
  const results = [];
  const titles = [];
  let i = 0;
  for (const t of tools) {
    const u = `https://tooltip.cc/${t.category}/${t.slug}`;
    try {
      const { status, body } = await fetch(u);
      const title = body.match(/<title>([^<]*)<\/title>/)?.[1] || '(none)';
      const canon = body.match(/<link rel="canonical" href="([^"]*)"/)?.[1] || '(none)';
      const isHome = title.includes('免费在线工具箱');
      results.push({ ...t, title, status, isHome });
      titles.push(title);
    } catch (e) {
      results.push({ ...t, title: 'ERROR', status: 0, isHome: false });
    }
    i++;
    if (i % 20 === 0) process.stdout.write(`${i}/102 `);
  }
  console.log('\n\n=== 统计 ===');
  const homeDupes = results.filter(r => r.isHome);
  console.log(`首页 fallback: ${homeDupes.length} / ${results.length}`);
  homeDupes.forEach(r => console.log(`  /${r.category}/${r.slug} -> ${r.title}`));
  const uniqueTitles = new Set(titles);
  console.log(`Title 去重: ${uniqueTitles.size} / ${titles.length}`);

  // 检查英文版（3个代表性）
  console.log('\n=== 英文版抽查 ===');
  for (const t of [tools[0], tools[1], tools.find(x => x.slug === 'base64')]) {
    if (!t) continue;
    const u = `https://tooltip.cc/${t.category}/${t.slug}`;
    const { body } = await fetch(u);
    const ogLocale = body.match(/<meta property="og:locale" content="([^"]*)"/)?.[1];
    const lang = body.match(/<html[^>]*lang="([^"]*)"/)?.[1];
    console.log(`/${t.category}/${t.slug}  html.lang=${lang} og:locale=${ogLocale}`);
  }
})();
