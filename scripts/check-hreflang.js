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
  const html = await fetch('https://tooltip.cc/developer-tools/json-formatter');
  const links = [...html.matchAll(/<link[^>]*hreflang[^>]*>/g)].map(m => m[0]);
  console.log('hreflang links:', links.length);
  links.forEach(l => console.log(l));
  // 同时检查 html 标签 lang 属性
  const htmlLang = (html.match(/<html[^>]*>/) || [])[0] || '';
  console.log('html tag:', htmlLang);
})();
