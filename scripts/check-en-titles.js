// scripts/check-en-titles.js
const fs = require('fs');
const path = require('path');
const c = fs.readFileSync(path.resolve(__dirname, '../lib/translations.ts'), 'utf8');

// 结构: translations = { zh: {...}, en: {...} }
const zhStart = c.indexOf('zh: {');
const enStart = c.indexOf('en: {');
const zhBlock = c.slice(zhStart + 5, enStart);
const enBlock = c.slice(enStart + 5);

const checkKey = (block, key) => {
  const m = block.match(new RegExp('"' + key + '": "([^"]*)"'));
  return m ? m[1] : 'MISSING';
};

console.log('=== 工具名英文对照 ===');
const toolKeys = ['tool.base64', 'tool.base64Desc', 'tool.jsonFormatter', 'tool.jsonFormatterDesc', 'tool.regexTester', 'tool.qrCodeGenerator'];
for (const k of toolKeys) {
  console.log(`${k}: ZH=${checkKey(zhBlock, k)} | EN=${checkKey(enBlock, k)}`);
}

// 统计 EN 缺失
const zhKeys = [...zhBlock.matchAll(/"(tool\.[a-zA-Z0-9]+)":/g)].map(m => m[1]);
const enKeys = [...enBlock.matchAll(/"(tool\.[a-zA-Z0-9]+)":/g)].map(m => m[1]);
const zhSet = new Set(zhKeys);
const enSet = new Set(enKeys);
const missingInEn = [...zhSet].filter(k => !enSet.has(k));
const zhNames = missingInEn.filter(k => k.endsWith('') && !k.includes('Desc'));
console.log(`\n工具名 key 总数: ${[...zhSet].filter(k => !k.includes('Desc')).length}`);
console.log(`英文翻译缺失 (不含Desc): ${zhNames.length} / ${[...zhSet].filter(k => !k.includes('Desc')).length}`);
console.log('缺失示例:', zhNames.slice(0, 5));
