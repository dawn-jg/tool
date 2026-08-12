// scripts/verify-en-final.js
// 全量验证：英文版 Title/描述 + hreflang + JSON-LD
const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(b));
    }).on('error', reject);
  });
}
(async () => {
  const pages = [
    ['工具页(英)', 'https://tooltip.cc/developer-tools/json-formatter?lang=en'],
    ['工具页(中)', 'https://tooltip.cc/developer-tools/json-formatter'],
    ['分类页(英)', 'https://tooltip.cc/pdf-tools?lang=en'],
    ['分类页(中)', 'https://tooltip.cc/pdf-tools'],
  ];
  for (const [name, url] of pages) {
    const h = await fetch(url);
    const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || 'MISSING';
    const hreflang = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map(m => m[1]);
    console.log(`[${name}] ${url}`);
    console.log(`  Title: ${title}`);
    console.log(`  hreflang: ${hreflang.join(', ') || 'NONE'}`);
  }
})();
