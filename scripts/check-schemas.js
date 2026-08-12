const https = require('https');
https.get('https://tooltip.cc/developer-tools/json-formatter', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    const checks = {
      'HowTo': '"@type":"HowTo"',
      'WebApplication': '"@type":"WebApplication"',
      'FAQPage': '"@type":"FAQPage"',
      'BreadcrumbList': '"@type":"BreadcrumbList"',
    };
    for (const [k, v] of Object.entries(checks)) {
      console.log(`${k}: ${b.includes(v) ? 'OK' : 'MISSING'}`);
    }
    console.log('HowToStep 数:', (b.match(/HowToStep/g) || []).length);
  });
});
