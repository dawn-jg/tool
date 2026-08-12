// scripts/explore-tools.js
const fs = require('fs');
const path = require('path');
const c = fs.readFileSync(path.resolve(__dirname, '../lib/tools-data.ts'), 'utf8');

// 解析所有工具（slug, category, nameKey, descriptionKey, keywords）
const tools = [];
const toolBlocks = c.matchAll(/{\s*slug: '([^']+)',\s*category: '([^']+)',\s*nameKey: '([^']+)',\s*descriptionKey: '([^']+)',\s*keywords: '([^']*)'/g);
for (const m of toolBlocks) {
  tools.push({ slug: m[1], category: m[2], nameKey: m[3], descKey: m[4], keywords: m[5] });
}
console.log('工具总数:', tools.length);

// 按分类分组
const byCat = {};
for (const t of tools) {
  (byCat[t.category] = byCat[t.category] || []).push(t);
}
console.log('\n各分类工具数:');
for (const [cat, list] of Object.entries(byCat)) {
  console.log(`  ${cat}: ${list.length}`);
}

// 输出一个分类的完整列表（如 developer-tools）
const dev = byCat['developer-tools'] || [];
console.log('\ndeveloper-tools 工具列表:');
dev.forEach(t => console.log(`  ${t.slug} (${t.nameKey}) kw=${t.keywords.slice(0, 40)}`));

// 看看是否有 instructions 相关 key 或者工具间关联
const trans = fs.readFileSync(path.resolve(__dirname, '../lib/translations.ts'), 'utf8');
const insKeys = [...trans.matchAll(/"([a-zA-Z0-9.]*[Ii]nstructions[a-zA-Z0-9.]*)":/g)].map(m => m[1]);
console.log('\ninstructions key 数量:', insKeys.length, insKeys.slice(0, 5));

// 检查是否有 HowTo/useGuide 之类 key
const howKeys = [...trans.matchAll(/"([a-zA-Z0-9.]*[Hh]ow[a-zA-Z0-9.]*)":/g)].map(m => m[1]);
console.log('HowTo key:', howKeys.length ? howKeys : '无');

// 检查 ToolLayout props
const tl = fs.readFileSync(path.resolve(__dirname, '../components/ToolLayout.tsx'), 'utf8');
console.log('\nToolLayout 存在:', tl.length > 0 ? '是' : '否');
const props = tl.match(/interface [\s\S]*?\{[\s\S]*?\}/);
console.log('ToolLayout interface:', props ? props[0].slice(0, 400) : '未找到');
