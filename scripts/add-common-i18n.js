// scripts/add-common-i18n.js
// 直接在 zh (line ~70) 和 en (line ~451) 的 common 区末尾插入新 key
const fs = require('fs');
const path = require('path');

const f = path.resolve(__dirname, '../lib/translations.ts');
let c = fs.readFileSync(f, 'utf8');
const isCRLF = c.includes('\r\n');
const nl = isCRLF ? '\r\n' : '\n';
const lines = c.split(nl);

// 找 zh // tools - developer 行（是 common 区结束）
let zhInsertLine = -1;
let enInsertLine = -1;
let foundEn = false;
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t.startsWith('// tools') || t.startsWith('// meme')) {
    if (!foundEn) {
      zhInsertLine = i;
    } else {
      enInsertLine = i;
      break;
    }
  }
  if (t.startsWith('en:')) foundEn = true;
}
console.log('zh 插入行:', zhInsertLine + 1, '| en 插入行:', enInsertLine + 1);
console.log('zh 内容:', lines[zhInsertLine - 1]?.trim(), '| en 内容:', lines[enInsertLine - 1]?.trim());

const zhNew = [
  '  "common.howToUse": "使用步骤",',
  '  "common.step1": "打开"',
  '  "common.step2": "在下方输入框中输入或上传需要处理的内容"',
  '  "common.step3": "点击相应功能按钮执行操作"',
  '  "common.step4": "复制结果或下载文件"',
  '  "common.faqTitle": "常见问题",',
  '  "common.relatedTools": "相关工具",',
].join(nl);

const enNew = [
  '  "common.howToUse": "How to Use",',
  '  "common.step1": "Open the tool below"',
  '  "common.step2": "Enter or upload the content you want to process"',
  '  "common.step3": "Click the action button to process"',
  '  "common.step4": "Copy the result or download the output file"',
  '  "common.faqTitle": "FAQ",',
  '  "common.relatedTools": "Related Tools",',
].join(nl);

// 从后往前插避免偏移
const insertions = [
  { line: enInsertLine, content: enNew },
  { line: zhInsertLine, content: zhNew },
].sort((a, b) => b.line - a.line); // 从后往前

let result = lines;
for (const { line, content } of insertions) {
  const arr = [...result];
  arr.splice(line, 0, content);
  result = arr;
}

const final = result.join(nl);
fs.writeFileSync(f, final);

// 验证
const v = fs.readFileSync(f, 'utf8');
const zhOk = v.includes('"common.howToUse": "使用步骤"');
const enOk = v.includes('"common.howToUse": "How to Use"');
console.log('zh OK:', zhOk, '| en OK:', enOk);
if (!zhOk || !enOk) {
  console.log('ERROR: 插入失败');
  process.exit(1);
}
console.log('[done]');
