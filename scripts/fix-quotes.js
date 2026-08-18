const fs = require('fs');
const path = 'lib/tool-content.ts';
let s = fs.readFileSync(path, 'utf8');

// 替换 <img src="..."> 里的嵌套引号为单引号（保持字符串合法）
s = s.split('<img src="...">').join("<img src='...'>");
s = s.split('<img src=\\"...\\">').join("<img src='...'>");

fs.writeFileSync(path, s, 'utf8');
console.log('fixed img src quotes');

const lines = s.split('\n');
[410, 698].forEach(n => console.log('L' + n + ':', lines[n - 1].trim().slice(0, 120)));
