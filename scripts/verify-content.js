// 验证工具页真实内容上线
const https = require('https');

const urls = [
  'https://tooltip.cc/developer-tools/json-formatter',
  'https://tooltip.cc/developer-tools/base64',
  'https://tooltip.cc/image-tools/qrcode-generator',
  'https://tooltip.cc/network-tools/speed-test',
];

function fetch(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 0, body: '' }));
  });
}

(async () => {
  for (const url of urls) {
    const { status, body } = await fetch(url);
    const slug = url.split('/').pop();
    // 检查是否有工具特有内容（比如常见 FAQ 问题）
    const hasUnique = body.includes('常见错误') || body.includes('实时') ||
      body.includes('加密随机数') || body.includes('下载') ||
      body.includes('FAQs') || body.includes('常见问题') || body.includes('使用说明');
    const hasHowTo = body.includes('如何使用') || body.includes('使用说明');
    const faqCount = (body.match(/是什么？|怎么办？|有什么区别|支持/g) || []).length;
    console.log(`[${status}] ${slug} | unique=${hasUnique} howto=${hasHowTo} faqHits=${faqCount} len=${body.length}`);
  }
})();
