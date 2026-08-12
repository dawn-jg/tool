// scripts/verify-deploy.js
const https = require('https');
function fetch(u) {
  return new Promise((resolve, reject) => {
    https.get(u, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>resolve(b)); }).on('error', reject);
  });
}
(async () => {
  const urls = [
    'https://tooltip.cc/',
    'https://tooltip.cc/developer-tools',
    'https://tooltip.cc/developer-tools/json-formatter',
    'https://tooltip.cc/developer-tools/base64',
    'https://tooltip.cc/pdf-tools/pdf-compressor',
  ];
  for (const u of urls) {
    const html = await fetch(u);
    console.log('\n' + u);
    console.log('  TITLE:', html.match(/<title>([^<]*)<\/title>/)?.[1]);
    console.log('  WebApplication:', html.includes('WebApplication'));
    console.log('  FAQPage:', html.includes('FAQPage'));
    console.log('  BreadcrumbList:', html.includes('BreadcrumbList'));
    console.log('  price 0:', html.includes('"price":"0"'));
  }
})();
