// scripts/verify-content.js
// 验证工具页的 FAQ 正文、HowTo 步骤、相关工具内链、JSON-LD
const https = require('https');
function fetch(u) {
  return new Promise((resolve, reject) => {
    https.get(u, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>resolve(b)); }).on('error', reject);
  });
}
(async () => {
  const url = 'https://tooltip.cc/developer-tools/json-formatter';
  const html = await fetch(url);
  console.log('=== 工具页内容验证 ===');
  console.log('1. HowTo 使用步骤:', html.includes('使用步骤') ? 'OK' : 'MISSING');
  console.log('2. FAQ 可见文本:', html.includes('常见问题') ? 'OK' : 'MISSING');
  console.log('3. 相关工具:', html.includes('相关工具') ? 'OK' : 'MISSING');
  console.log('4. FAQ JSON-LD:', html.includes('FAQPage') ? 'OK' : 'MISSING');
  console.log('5. Breadcrumb JSON-LD:', html.includes('BreadcrumbList') ? 'OK' : 'MISSING');
  console.log('6. WebApplication JSON-LD:', html.includes('WebApplication') ? 'OK' : 'MISSING');
  // 检查相关工具链接数
  const relatedLinks = html.match(/href="\/developer-tools\/(?!json-formatter)[a-z-]+"/g) || [];
  console.log('7. 相关工具链接数:', relatedLinks.length);
  // 检查 HowTo 步骤
  const steps = html.match(/<li[^>]*>[^<]*<\/li>/g) || [];
  console.log('8. li 步骤数:', steps.length);
  // 检查 H1/H2
  const h1 = html.match(/<h1[^>]*>([^<]*)<\/h1>/g) || [];
  const h2 = html.match(/<h2[^>]*>([^<]*)<\/h2>/g) || [];
  console.log('9. H1 数量:', h1.length, '| H2:', h2.map(x => x.replace(/<[^>]*>/g, '')).join(' / '));
})();
