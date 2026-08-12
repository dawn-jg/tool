// scripts/optimize-metadata.js
// 1. 工具页 Title: {name} - 在线工具 → {name} - 免费在线工具 | Tooltip.cc
// 2. 分类页 Title: {name} - 免费在线工具 → {name} - 免费在线工具 | Tooltip.cc
const fs = require('fs');
const path = require('path');

const f = path.resolve(__dirname, '../lib/metadata.ts');
let c = fs.readFileSync(f, 'utf8');
const isCRLF = c.includes('\r\n');

// 工具页（getToolMetadata 内，title 在 description 之前）
const oldTool = 'title: `${name} - 在线工具`,';
const newTool = 'title: `${name} - 免费在线工具 | ${SITE_NAME}`,';
if (c.includes(oldTool)) {
  c = c.replace(oldTool, newTool);
  console.log('[1] 工具页 Title 模板已更新');
} else {
  console.log('[1] 工具页 oldTitle 未找到!');
}

// 分类页
const oldCat = 'title: `${name} - 免费在线工具`,';
const newCat = 'title: `${name} - 免费在线工具 | ${SITE_NAME}`,';
if (c.includes(oldCat)) {
  c = c.replace(oldCat, newCat);
  console.log('[2] 分类页 Title 模板已更新');
} else {
  console.log('[2] 分类页 oldTitle 未找到!');
}

fs.writeFileSync(f, c);
const v = fs.readFileSync(f, 'utf8');
console.log('验证:', v.includes(newTool) ? '工具页 OK' : '工具页 FAIL');
console.log('验证:', v.includes(newCat) ? '分类页 OK' : '分类页 FAIL');
