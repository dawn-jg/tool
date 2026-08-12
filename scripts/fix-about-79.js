// scripts/fix-about-79.js
// about 页 79+ → 92+（正文 + metadata description）
const fs = require('fs');
const path = require('path');
const f = path.resolve(__dirname, '../app/about/page.tsx');
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/79\+/g, '92+');
fs.writeFileSync(f, c.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));
const v = fs.readFileSync(f, 'utf8');
console.log('79+ 残留:', v.includes('79+'));
console.log('92+ 数量:', (v.match(/92\+/g) || []).length);
