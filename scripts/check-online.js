const https = require('https');
const url = 'https://tooltip.cc/developer-tools/json-formatter';
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('status:', res.statusCode);
    console.log('has HowTo section:', d.includes('如何使用') || d.includes('使用说明'));
    console.log('has FAQ section:', d.includes('常见问题') || d.includes('是什么？'));
    console.log('JSONLD blocks:', (d.match(/"@type":\s*"(WebApplication|HowTo|FAQPage|BreadcrumbList)"/g) || []).length);
    console.log('has WebApplication schema:', d.includes('WebApplication'));
    console.log('has FAQPage schema:', d.includes('FAQPage'));
    console.log('has HowTo schema:', d.includes('HowTo'));
    console.log('has BreadcrumbList schema:', d.includes('BreadcrumbList'));
    console.log('has related tools:', d.includes('相关工具'));
    console.log('body len:', d.length);
    // title
    const ttl = d.match(/<title>([^<]+)<\/title>/);
    console.log('title:', ttl ? ttl[1] : 'N/A');
    // og:title
    const ogt = d.match(/property="og:title" content="([^"]+)"/);
    console.log('og:title:', ogt ? ogt[1] : 'N/A');
    // og:description
    const ogd = d.match(/property="og:description" content="([^"]+)"/);
    console.log('og:description:', ogd ? ogd[1].slice(0, 80) : 'N/A');
    // JSON-LD samples
    const ldBlocks = d.match(/<script type="application\/ld\+json">[^<]+<\/script>/g) || [];
    console.log('\n--- JSON-LD blocks ---');
    ldBlocks.forEach((b, i) => {
      try {
        const obj = JSON.parse(b.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, ''));
        console.log(`block ${i+1}: @type = ${obj['@type']}`);
      } catch (e) {
        console.log(`block ${i+1}: parse error`);
      }
    });
  });
}).on('error', e => console.error(e));
