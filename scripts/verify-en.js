// scripts/verify-en.js
// 验证英文版 metadata + hreflang + JSON-LD
const https = require('https');
function fetch(u) {
  return new Promise((resolve, reject) => {
    https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>resolve(b)); }).on('error', reject);
  });
}
(async () => {
  console.log('=== 英文版验证 (?lang=en) ===');
  const url = 'https://tooltip.cc/developer-tools/json-formatter?lang=en';
  const html = await fetch(url);
  console.log('1. Title:', (html.match(/<title>([^<]*)<\/title>/) || [])[1]);
  console.log('2. hreflang zh-CN:', html.includes('hreflang="zh-CN"') ? 'OK' : 'MISSING');
  console.log('3. hreflang en:', html.includes('hreflang="en"') ? 'OK' : 'MISSING');
  console.log('4. hreflang x-default:', html.includes('hreflang="x-default"') ? 'OK' : 'MISSING');
  console.log('5. og:locale en_US:', html.includes('og:locale') && html.includes('en_US') ? 'OK' : 'MISSING');
  console.log('6. FAQ JSON-LD English:', html.includes('"What is') ? 'OK' : 'MISSING');
  console.log('7. WebApp featureList English:', html.includes('Free to use') ? 'OK' : 'MISSING');
  console.log('8. Breadcrumb Home:', html.includes('"name":"Home"') ? 'OK' : 'MISSING');
  console.log('9. canonical:', (html.match(/rel="canonical" href="([^"]*)"/) || [])[1]);
  // 中文版对比
  const html2 = await fetch('https://tooltip.cc/developer-tools/json-formatter');
  console.log('--- 中文版对照 ---');
  console.log('A. Title:', (html2.match(/<title>([^<]*)<\/title>/) || [])[1]);
  console.log('B. og:locale zh_CN:', html2.includes('zh_CN') ? 'OK' : 'MISSING');
  console.log('C. FAQ 中文:', html2.includes('是什么？') ? 'OK' : 'MISSING');
})();
