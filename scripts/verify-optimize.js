// 部署后验证：Title模板/robots/sitemap拆分/301重定向/404页
const https = require('https');
const http = require('http');

function fetch(url, redirect = true) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && redirect) {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, body: b }));
        return;
      }
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, body: b }));
    }).on('error', reject);
  });
}

(async () => {
  // 1. Title 模板升级验证（3 个不同分类）
  for (const [name, url] of [
    ['dev-tool', 'https://tooltip.cc/developer-tools/json-formatter'],
    ['image-tool', 'https://tooltip.cc/image-tools/qrcode-generator'],
    ['network-tool', 'https://tooltip.cc/network-tools/speed-test'],
  ]) {
    const r = await fetch(url);
    const title = (r.body.match(/<title>([^<]*)<\/title>/) || [])[1] || 'N/A';
    console.log(`[${r.status}] ${name} Title: ${title}`);
  }

  // 2. robots.txt
  const robots = await fetch('https://tooltip.cc/robots.txt');
  console.log('\n--- robots.txt ---');
  console.log(robots.body.split('\n').slice(0, 8).join('\n'));

  // 3. sitemap 拆分
  for (const f of ['sitemap.xml', 'sitemap-tools.xml', 'sitemap-categories.xml', 'sitemap-static.xml']) {
    const r = await fetch(`https://tooltip.cc/${f}`);
    const urls = (r.body.match(/<loc>/g) || []).length;
    const isIndex = r.body.includes('<sitemapindex');
    console.log(`[${r.status}] ${f}: ${isIndex ? 'INDEX' : urls + ' urls'}`);
  }

  // 4. 裸 slug 301
  for (const [from, to] of [
    ['/base64-encode', '/developer-tools/base64'],
    ['/json-formatter', '/developer-tools/json-formatter'],
    ['/regex-tester', '/developer-tools/regex-tester'],
    ['/qr-code-generator', '/image-tools/qrcode-generator'],
    ['/url-encode', '/developer-tools/url-encoder-decoder'],
  ]) {
    const r = await fetch(`https://tooltip.cc${from}`, false);
    console.log(`[${r.status}] ${from} -> ${r.location || 'NO LOCATION'} (expect 301 to ${to})`);
  }

  // 5. 404 页热门工具
  const nf = await fetch('https://tooltip.cc/definitely-not-exist');
  const hasPopular = nf.body.includes('热门工具') || nf.body.includes('JSON 格式化');
  console.log(`\n404 页热门工具推荐: ${hasPopular ? 'OK' : 'MISSING'}`);
})();
