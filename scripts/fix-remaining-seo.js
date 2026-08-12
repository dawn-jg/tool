// scripts/fix-remaining-seo.js
// 批量修复：工具总数文案 + about 页分类计数 + IndexNow sitemap 读取
// CRLF 兼容

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── 1. translations.ts: 79+ → 92+ ────────────────────────────────────────
{
  const f = path.join(ROOT, 'lib/translations.ts');
  let c = fs.readFileSync(f, 'utf8');
  const before = c.length;
  c = c.replace(/79\+"/g, '92+',)  // 中文
       .replace(/79\+ Tools/g, '92+ Tools');  // 英文
  if (c === fs.readFileSync(f, 'utf8')) {
    console.log('[translations] 无需修改（已为 92+）');
  } else {
    fs.writeFileSync(f, c.replace(/\n/g, '\r\n'));
    console.log('[translations] 79+ → 92+ OK');
  }
}

// ── 2. about page.tsx: 修正分类计数 + 补 pdf-tools + 补责任声明 ─────────────
{
  const f = path.join(ROOT, 'app/about/page.tsx');
  let c = fs.readFileSync(f, 'utf8');

  const catCounts = {
    '开发者工具': 20,
    '文本处理': 7,
    '图片工具': 14,
    '数据工具': 4,
    'PDF 工具': 5,  // 新增
    '生成器': 8,
    '验证器': 9,
    '实用工具': 17,
    '网络工具': 6,
    '趣味工具': 2,
  };

  // 更新各分类的 count
  Object.entries(catCounts).forEach(([name, count]) => {
    const re = new RegExp(`(${name}[^}]+?<span[^>]*>)\\d+( 个</span>)`, 'g');
    c = c.replace(re, `$1${count}$2`);
  });

  // 补 pdf-tools 到分类列表（在数据工具后）
  if (!c.includes("'PDF 工具'")) {
    c = c.replace(
      /(\{ name: "数据工具", desc: "密码生成、Cron表达式、进制转换等", count: 4 \},)/,
 `$1
                { name: "PDF 工具", desc: "PDF 压缩、合并、分割、图片转PDF等", count: 5 },`
    );
    console.log('[about] 补 pdf-tools 分类 OK');
  } else {
    console.log('[about] pdf-tools 已存在');
  }

  // 补责任声明（在「联系我们」section 前）
  const eeatBlock = `
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              内容责任声明
            </h2>
            <p>
              Tooltip.cc 所有工具均为技术功能型内容，不涉及新闻资讯、用户生成内容或医疗/金融建议。
              我们不对用户通过工具产生的内容承担连带责任，详情参阅
              <Link href="/privacy-policy" className="text-blue-600 hover:underline"> 隐私政策</Link>。
            </p>
          </section>

`;
  if (!c.includes('内容责任声明')) {
    c = c.replace(
      /(            <section>\s*<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">\s*联系我们)/,
      eeatBlock + '$1'
    );
    console.log('[about] 补 E-E-A-T 责任声明 OK');
  } else {
    console.log('[about] 责任声明已存在');
  }

  fs.writeFileSync(f, c.replace(/\n/g, '\r\n'));
  console.log('[about] 更新完成');
}

// ── 3. 改写 IndexNow 脚本：读取 sitemap.xml 提取全部 URL ─────────────────
{
  const sitemapPath = path.join(ROOT, 'public/sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [];
  const locRe = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = locRe.exec(xml)) !== null) urls.push(m[1]);
  console.log(`[indexnow] 从 sitemap 读取 ${urls.length} 个 URL`);

  const key = '70e83ca4f6512db9';
  const host = 'tooltip.cc';
  const body = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  };

  // 直接提交
  const https = require('https');
  const data = JSON.stringify(body);
  const req = https.request({
    hostname: 'api.indexnow.org',
    path: '/indexnow',
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(data) },
  }, (res) => {
    let t = '';
    res.on('data', d => t += d);
    res.on('end', () => {
      console.log(`[indexnow] HTTP ${res.statusCode}: ${t}`);
      // 改写脚本文件保存 URL 列表供后续使用
      const scriptContent = `// scripts/indexnow-submit.js (auto-generated, do not edit manually)
// Last updated: ${new Date().toISOString().slice(0, 10)}
const key = "${key}";
const host = "${host}";
const urls = ${JSON.stringify(urls, null, 2)};

const body = { host, key, keyLocation: \`https://\${host}/\${key}.txt\`, urlList: urls };
fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
})
  .then(res => {
    console.log("Status:", res.status);
    res.status === 200 || res.status === 202 ? console.log("Submitted OK") : res.text().then(t => console.log("Body:", t));
  })
  .catch(e => console.error("Error:", e.message));
`;
      fs.writeFileSync(path.join(ROOT, 'scripts/indexnow-submit.js'), scriptContent.replace(/\n/g, '\r\n'));
      console.log('[indexnow] 脚本已更新，提交了全部 URL');
    });
  });
  req.write(data);
  req.end();
}
