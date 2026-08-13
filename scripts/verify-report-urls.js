// 验证报告实测 URL 与真实 URL 的状态码和 Title
const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    }).on('error', reject);
  });
}
(async () => {
  const urls = [
    ['报告实测-裸slug', 'https://tooltip.cc/base64-encode'],
    ['报告实测-裸slug', 'https://tooltip.cc/json-formatter'],
    ['报告实测-裸slug', 'https://tooltip.cc/regex-tester'],
    ['报告实测-裸slug', 'https://tooltip.cc/qr-code-generator'],
    ['报告实测-裸slug', 'https://tooltip.cc/url-encode'],
    ['真实URL', 'https://tooltip.cc/developer-tools/base64'],
    ['真实URL', 'https://tooltip.cc/developer-tools/json-formatter'],
    ['真实URL', 'https://tooltip.cc/developer-tools/regex-tester'],
  ];
  for (const [tag, url] of urls) {
    try {
      const { status, body } = await fetch(url);
      const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1] || 'N/A';
      const canonical = (body.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || 'N/A';
      console.log(`[${status}] ${tag} ${url}`);
      console.log(`  Title: ${title}`);
      console.log(`  Canonical: ${canonical}`);
    } catch (e) {
      console.log(`[ERR] ${tag} ${url}: ${e.message}`);
    }
  }
})();
