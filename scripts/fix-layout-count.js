// 一次性脚本：layout.tsx 的 79+ → 92+
const fs = require('fs');
const p = 'app/layout.tsx';
let s = fs.readFileSync(p, 'utf8');
const before = s;
// 只替换 79+ 相关文案（description/keywords/openGraph/twitter）
s = s.replace(/79\+/g, '92+');
if (s === before) {
  console.log('NO CHANGE: no "79+" found');
} else {
  fs.writeFileSync(p, s, 'utf8');
  console.log('Replaced 79+ -> 92+');
  // 统计
  const cnt = (before.match(/79\+/g) || []).length;
  console.log('Occurrences replaced:', cnt);
}
