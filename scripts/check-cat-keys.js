const fs = require('fs');
const s = fs.readFileSync('lib/translations.ts', 'utf8');
const lines = s.split('\n');
// 找到 en: { 所在行
let enLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('en: {')) { enLine = i; break; }
}
console.log('en at line:', enLine + 1);
const enPart = lines.slice(enLine).join('\n');
const keys = ['cat.developer', 'cat.text', 'cat.image', 'cat.data', 'cat.generators', 'cat.validators', 'cat.pdf', 'cat.utilities', 'cat.network', 'cat.fun'];
for (const k of keys) {
  const re = new RegExp('"' + k + '":\\s*"([^"]*)"');
  const enM = enPart.match(re);
  console.log(k, '| en:', enM ? enM[1] : 'N/A');
}
