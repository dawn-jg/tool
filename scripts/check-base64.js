// scripts/check-base64.js
const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>resolve(b)); }).on('error', reject);
  });
}
(async () => {
  const u = 'https://tooltip.cc/developer-tools/base64';
  const html = await fetch(u);
  console.log('TITLE:', html.match(/<title>([^<]*)<\/title>/)?.[1]);
  console.log('DESC:', html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.slice(0, 100));
  console.log('CANON:', html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]);
})();
