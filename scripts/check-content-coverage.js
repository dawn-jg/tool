const fs = require('fs');
// 从 tools-data.ts 提取所有 slug
const td = fs.readFileSync('lib/tools-data.ts', 'utf8');
const slugs = [...td.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
// 从 tool-content.ts 提取所有 key
const tc = fs.readFileSync('lib/tool-content.ts', 'utf8');
const keys = [...tc.matchAll(/^\s*"([a-z0-9-]+)":\s*\{/gm)].map(m => m[1]);

const missing = slugs.filter(s => !keys.includes(s));
console.log('tools total:', slugs.length, '| content keys:', keys.length);
console.log('missing:', JSON.stringify(missing));
// 重复
const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
console.log('dup:', JSON.stringify(dup));
