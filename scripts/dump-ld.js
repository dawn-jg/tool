const fs = require('fs');
const c = fs.readFileSync('app/layout.tsx', 'utf8');
const idx = c.indexOf('"@type": "WebSite"');
console.log('index:', idx);
console.log(JSON.stringify(c.substring(idx - 150, idx + 350)));
