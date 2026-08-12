// scripts/fix-about-final.js
// about/page.tsx：重建分类数组 + 插入责任声明
const fs = require('fs');
const path = require('path');

const f = path.resolve(__dirname, '../app/about/page.tsx');
const c = fs.readFileSync(f, 'utf8');
const lines = c.split(/\r?\n/);

const startLine = lines.findIndex(l => l.includes('{ name: "开发者工具"'));
// 分类数组结束行：].map((cat) => ( 之前一行就是数组最后一项
const endLine = lines.findIndex((l, i) => i > startLine && l.trim() === '].map((cat) => (');
console.log(`分类数组: L${startLine + 1} ~ L${endLine + 1}`);

const newCats = [
  { name: '开发者工具', desc: 'JSON格式化、正则测试、Base64、时间戳等', count: 20 },
  { name: '文本处理', desc: '文本对比、Markdown编辑、字数统计等', count: 7 },
  { name: '图片工具', desc: '图片压缩、二维码生成、Favicon生成等', count: 14 },
  { name: '数据工具', desc: '密码生成、Cron表达式、进制转换等', count: 4 },
  { name: 'PDF 工具', desc: 'PDF压缩、合并、分割、图片转PDF等', count: 5 },
  { name: '生成器', desc: '占位图、渐变色、假数据等', count: 8 },
  { name: '验证器', desc: '邮箱、手机号、身份证等格式验证', count: 9 },
  { name: '实用工具', desc: '计算器、计时器、视频下载等', count: 17 },
  { name: '网络工具', desc: 'IP查询、DNS查询、HTTP头查看等', count: 6 },
  { name: '趣味工具', desc: 'MBTI人格测试等', count: 2 },
].map(c => `                { name: "${c.name}", desc: "${c.desc}", count: ${c.count} },`);

const before = lines.slice(0, startLine);
const after = lines.slice(endLine);
const newLines = [...before, ...newCats, ...after];

// 插入责任声明（找到联系我们 section 标题，在其前插入）
const contactIdx = newLines.findIndex(l => l.includes('<h2') && l.includes('联系我们'));
if (contactIdx >= 0) {
  const eeat = [
    '',
    `          <section>`,
    `            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">`,
    `              内容责任声明`,
    `            </h2>`,
    `            <p>`,
    `              Tooltip.cc 所有工具均为技术功能型内容，不涉及新闻资讯、用户生成内容或医疗/金融建议。`,
    `              我们不对用户通过工具产生的内容承担连带责任，详情参阅`,
    `              <Link href="/privacy-policy" className="text-blue-600 hover:underline"> 隐私政策</Link>。`,
    `            </p>`,
    `          </section>`,
    '',
  ];
  newLines.splice(contactIdx, 0, ...eeat);
  console.log(`[about] 责任声明插入在 L${contactIdx + 1}（联系我们前）`);
} else {
  console.log('[about] 未找到联系我们 section，跳过责任声明');
}

fs.writeFileSync(f, newLines.join('\r\n'));
console.log('[done] about/page.tsx 已更新');

// 验证
const verify = fs.readFileSync(f, 'utf8');
console.log('PDF 工具:', verify.includes('PDF 工具'));
console.log('count: 5:', verify.includes('count: 5'));
console.log('count: 20:', verify.includes('count: 20'));
console.log('内容责任声明:', verify.includes('内容责任声明'));
