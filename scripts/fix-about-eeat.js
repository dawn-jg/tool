// scripts/fix-about-eeat.js v3
// 在「核心原则」section 后插入 E-E-A-T 内容责任声明
const fs = require('fs');
const path = require('path');

const f = path.resolve(__dirname, '../app/about/page.tsx');
const c = fs.readFileSync(f, 'utf8');
const lines = c.split(/\r?\n/);

// 找「核心原则」文字行（不含 <h2 前缀，是 h2 的下一行）
const coreText = lines.findIndex(l => l.includes('核心原则'));
if (coreText < 0) { console.log('未找到核心原则文字'); process.exit(0); }
// section 开始：向上找 <section>
let secStart = coreText;
while (secStart > 0 && !lines[secStart].includes('<section>')) secStart--;
// section 结束：向下找 </section>
let secEnd = coreText;
while (secEnd < lines.length && !lines[secEnd].includes('</section>')) secEnd++;
console.log(`核心原则 section: L${secStart + 1} ~ L${secEnd + 1}`);

if (lines.some(l => l.includes('内容责任声明'))) {
  console.log('责任声明已存在');
  process.exit(0);
}

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
lines.splice(secEnd + 1, 0, ...eeat);
fs.writeFileSync(f, lines.join('\r\n'));

const v = fs.readFileSync(f, 'utf8');
console.log('内容责任声明:', v.includes('内容责任声明'));
console.log('done');
