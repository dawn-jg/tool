// 一次性：layout.tsx SEO 修复（兼容 CRLF）
const fs = require('fs');
const f = 'D:/tooltip.cc/app/layout.tsx';
let c = fs.readFileSync(f, 'utf8');
const nl = c.includes('\r\n') ? '\r\n' : '\n';
console.log('line ending:', nl === '\r\n' ? 'CRLF' : 'LF');

function patch(from, to) {
  // 统一用当前行尾构造 anchor
  const f2 = from.split('\n').join(nl);
  const t2 = to.split('\n').join(nl);
  if (!c.includes(f2)) { console.log('!! NOT FOUND:', from.split('\n')[0].trim()); return; }
  c = c.split(f2).join(t2);
  console.log('OK:', from.split('\n')[0].trim());
}

patch(`  manifest: "/manifest.json",
  openGraph: {`,
`  manifest: "/manifest.json",
  alternates: {
    canonical: "https://tooltip.cc",
  },
  openGraph: {`);

patch(`    url: "https://tooltip.cc",
    siteName: "Tooltip.cc",
    locale: "zh_CN",
    type: "website",
  },`,
`    url: "https://tooltip.cc",
    siteName: "Tooltip.cc",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://tooltip.cc/og-image.png", width: 1200, height: 630, alt: "Tooltip.cc" }],
  },`);

patch(`  twitter: {
    card: "summary",
    title: "Tooltip.cc - 免费在线工具箱",
    description: "79+免费在线工具，无需注册，浏览器本地运行，保护隐私。",
  },`,
`  twitter: {
    card: "summary_large_image",
    title: "Tooltip.cc - 免费在线工具箱",
    description: "79+免费在线工具，无需注册，浏览器本地运行，保护隐私。",
    images: ["https://tooltip.cc/og-image.png"],
  },`);

fs.writeFileSync(f, c, 'utf8');
console.log('done');
