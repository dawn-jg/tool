// scripts/fix-common-i18n.js
// 补上缺失的逗号（兼容 CRLF）
const fs = require('fs');
const path = require('path');

const f = path.resolve(__dirname, '../lib/translations.ts');
let c = fs.readFileSync(f, 'utf8');

// 用实际 CRLF 换行符
const NL = '\r\n';

const fixes = [
  ['"common.step1": "打开"', '"common.step1": "打开",'],
  ['"common.step2": "在下方输入框中输入或上传需要处理的内容"', '"common.step2": "在下方输入框中输入或上传需要处理的内容",'],
  ['"common.step3": "点击相应功能按钮执行操作"', '"common.step3": "点击相应功能按钮执行操作",'],
  ['"common.step4": "复制结果或下载文件"', '"common.step4": "复制结果或下载文件",'],
  ['"common.step1": "Open the tool below"', '"common.step1": "Open the tool below",'],
  ['"common.step2": "Enter or upload the content you want to process"', '"common.step2": "Enter or upload the content you want to process",'],
  ['"common.step3": "Click the action button to process"', '"common.step3": "Click the action button to process",'],
  ['"common.step4": "Copy the result or download the output file"', '"common.step4": "Copy the result or download the output file",'],
];

for (const [from, to] of fixes) {
  // 匹配 key 后可能跟逗号或直接换行
  const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=(' + NL + '|$))');
  if (re.test(c)) {
    c = c.replace(re, to);
    console.log('[OK]', from.slice(0, 45));
  } else {
    console.log('[SKIP]', from.slice(0, 45));
  }
}

fs.writeFileSync(f, c);

// 验证
const v = fs.readFileSync(f, 'utf8');
const lines = v.split(/\r?\n/);
console.log('line75:', lines[74]?.includes(',') ? 'OK' : 'FAIL');
console.log('line463:', lines[462]?.includes(',') ? 'OK' : 'FAIL');
