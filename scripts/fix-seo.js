// 一次性：SEO 修复脚本
// 1. metadata.ts 补 canonical + og:image
// 2. layout.tsx 补 canonical + og:image + twitter:image
// 3. ToolLayout.tsx H1 -> H2（消除重复 H1）
// 4. json-formatter.tsx 补 instructions 翻译（translations.ts 加 key）
// 5. translations.ts 补 tool.jsonFormatter.instructions 中英
const fs = require('fs');

function patch(file, pairs) {
  let c = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!c.includes(from)) { console.log(`!! ${file}: anchor NOT FOUND: ${from.slice(0, 60)}...`); continue; }
    c = c.split(from).join(to);
  }
  fs.writeFileSync(file, c, 'utf8');
  console.log(`OK ${file}`);
}

const OG_IMAGE = 'https://tooltip.cc/og-image.png';

// 1. metadata.ts
patch('D:/tooltip.cc/lib/metadata.ts', [
  // 工具页 metadata 补 canonical + og:image
  [`    title: \`${'${name}'} - 在线工具\`,
    description,
    keywords,`,
`    title: \`${'${name}'} - 在线工具\`,
    description,
    keywords,
    alternates: {
      canonical: \`https://tooltip.cc/${'${tool.category}'}/${'${tool.slug}'}\`,
    },`],
  [`    openGraph: {
      title: \`${'${name}'} - ${'${SITE_NAME}'}\`,
      description,
      url: \`https://tooltip.cc/${'${tool.category}'}/${'${tool.slug}'}\`,
      siteName: SITE_NAME,
      locale: "zh_CN",
      type: "website",
    },`,
`    openGraph: {
      title: \`${'${name}'} - ${'${SITE_NAME}'}\`,
      description,
      url: \`https://tooltip.cc/${'${tool.category}'}/${'${tool.slug}'}\`,
      siteName: SITE_NAME,
      locale: "zh_CN",
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },`],
  // 分类页 metadata 补 canonical + og:image
  [`    title: \`${'${name}'} - 免费在线工具\`,
    description,`,
`    title: \`${'${name}'} - 免费在线工具\`,
    description,
    alternates: {
      canonical: \`https://tooltip.cc/${'${cat.slug}'}\`,
    },`],
  [`    openGraph: {
      title: \`${'${name}'} - ${'${SITE_NAME}'}\`,
      description,
      url: \`https://tooltip.cc/${'${cat.slug}'}\`,
      siteName: SITE_NAME,
      locale: "zh_CN",
      type: "website",
    },`,
`    openGraph: {
      title: \`${'${name}'} - ${'${SITE_NAME}'}\`,
      description,
      url: \`https://tooltip.cc/${'${cat.slug}'}\`,
      siteName: SITE_NAME,
      locale: "zh_CN",
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },`],
  // 文件头加常量
  [`const SITE_NAME = "Tooltip.cc";`, `const SITE_NAME = "Tooltip.cc";
const OG_IMAGE = "https://tooltip.cc/og-image.png";`],
]);

// 2. layout.tsx
patch('D:/tooltip.cc/app/layout.tsx', [
  [`  manifest: "/manifest.json",
  openGraph: {`, `  manifest: "/manifest.json",
  alternates: {
    canonical: "https://tooltip.cc",
  },
  openGraph: {`],
  [`    url: "https://tooltip.cc",
    siteName: "Tooltip.cc",
    locale: "zh_CN",
    type: "website",
  },`, `    url: "https://tooltip.cc",
    siteName: "Tooltip.cc",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://tooltip.cc/og-image.png", width: 1200, height: 630, alt: "Tooltip.cc" }],
  },`],
  [`  twitter: {
    card: "summary",
    title: "Tooltip.cc - 免费在线工具箱",
    description: "79+免费在线工具，无需注册，浏览器本地运行，保护隐私。",
  },`, `  twitter: {
    card: "summary_large_image",
    title: "Tooltip.cc - 免费在线工具箱",
    description: "79+免费在线工具，无需注册，浏览器本地运行，保护隐私。",
    images: ["https://tooltip.cc/og-image.png"],
  },`],
]);

// 3. ToolLayout.tsx H1 -> H2
patch('D:/tooltip.cc/components/ToolLayout.tsx', [
  [`<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t(title)}</h1>`,
   `<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t(title)}</h2>`],
]);

// 4. translations.ts 补 tool.jsonFormatter.instructions（中英）
patch('D:/tooltip.cc/lib/translations.ts', [
  [`  "tool.jsonFormatter": "JSON格式化",`,
   `  "tool.jsonFormatter": "JSON格式化",
  "tool.jsonFormatter.instructions": "粘贴JSON数据，点击格式化美化排版，或点击压缩去除多余空格。支持校验JSON语法合法性。所有处理均在浏览器本地完成，数据不会上传。",`],
  [`  "tool.jsonFormatter": "JSON Formatter",`,
   `  "tool.jsonFormatter": "JSON Formatter",
  "tool.jsonFormatter.instructions": "Paste JSON data, click Format to beautify, or click Minify to remove extra whitespace. Validation checks JSON syntax. All processing happens locally in your browser - nothing is uploaded.",`],
]);

console.log('\nAll patches applied.');
