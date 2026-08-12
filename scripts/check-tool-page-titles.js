// scripts/check-tool-page-titles.js
// 检查工具页 Title/Description/Canonical 是否个性化
const https = require('https');

const urls = [
  'https://tooltip.cc/',
  'https://tooltip.cc/developer-tools',
  'https://tooltip.cc/developer-tools/json-formatter',
  'https://tooltip.cc/developer-tools/base64-encode',
  'https://tooltip.cc/developer-tools/regex-tester',
  'https://tooltip.cc/pdf-tools/pdf-compressor',
  'https://tooltip.cc/image-tools/image-compressor',
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

(async () => {
  for (const u of urls) {
    const html = await fetch(u);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    const canon = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
    const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
    
    console.log('\n' + u);
    console.log('  TITLE:', title);
    console.log('  DESC:', (desc || '').slice(0, 100));
    console.log('  CANON:', canon);
    console.log('  OG:TITLE:', ogTitle);
  }
})();
