const fs = require('fs');
const s = fs.readFileSync('lib/tool-content.ts', 'utf8');
const keys = [];
const re = /^\s*"([a-z0-9-]+)":\s*\{/gm;
let m;
while ((m = re.exec(s))) keys.push(m[1]);
console.log('已写:', keys.length);
console.log(keys.join(', '));
