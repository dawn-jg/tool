const fs = require('fs');
const s = fs.readFileSync('lib/tool-content.ts', 'utf8');
const lines = s.split('\n');
lines.forEach((line, i) => {
  // 字符串里出现 "xxx" 嵌套（q: "..." 或 a: "..." 内部再出现 ASCII 引号）
  // 粗查：同一行里 " 出现次数 >= 6 且模式是 a: "... "..."..." 的
  const count = (line.match(/"/g) || []).length;
  if (count >= 6) {
    console.log(`L${i + 1} (${count} quotes): ${line.trim().slice(0, 120)}`);
  }
});
