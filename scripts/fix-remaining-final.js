// scripts/fix-remaining-final.js
// 不依赖正则替换，直接定位行号 + slice 构建
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── 1. translations.ts 中文区 79+ → 92+ ────────────────────────────────
{
  const f = path.join(ROOT, 'lib/translations.ts');
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split(/\r?\n/);
  let changed = 0;
  lines.forEach((line, i) => {
    if (line.includes('79+') && line.includes('实用工具')) {
      lines[i] = line.replace('79+', '92+');
      console.log(`[translations L${i + 1}] 79+ → 92+`);
      changed++;
    }
  });
  if (changed > 0) {
    fs.writeFileSync(f, lines.join('\r\n'));
    console.log(`[translations] 修改 ${changed} 处`);
  } else {
    console.log('[translations] 无需修改');
  }
}

// ── 2. about/page.tsx 全量重建分类列表 + 插入责任声明 ──────────────────
{
  const f = path.join(ROOT, 'app/about/page.tsx');
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split(/\r?\n/);

  // 找到分类数组开始行（{ name: "开发者工具"）
  const startLine = lines.findIndex(l => l.includes('{ name: "开发者工具"'));
  const endLine = lines.findIndex((l, i) => i > startLine && l.trim() === ']).map((cat) => (');

  if (startLine < 0 || endLine < 0) {
    console.log('[about] 未找到分类数组锚点，跳过');
  } else {
    // 新分类数组（准确计数）
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

    // 替换
    const before = lines.slice(0, startLine);
    const after = lines.slice(endLine);
    lines.length = 0;
    lines.push(...before, ...newCats, ...after);
    console.log(`[about] 分类数组已更新 ${startLine + 1}-${endLine + 1} 行`);
  }

  // 插入责任声明（在「联系我们」section 前）
  const contactLine = lines.findIndex(l => l.includes('<h2') && l.includes('联系我们'));
  if (contactLine >= 0 && !lines.some(l => l.includes('内容责任声明'))) {
    const eeat = [
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
      ``,
    ];
    lines.splice(contactLine - 5, 0, ...eeat);  // 在联系我们 section 开始前插入
    console.log('[about] 责任声明已插入');
  }

  fs.writeFileSync(f, lines.join('\r\n'));
}

console.log('[done] 完成');
