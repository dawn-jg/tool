const fs = require('fs');
const path = 'app/layout.tsx';
let c = fs.readFileSync(path, 'utf8');

// 匹配 WebSite JSON-LD 块（CRLF 文件）
const oldBlock = `            __html: JSON.stringify({\r\n              "@context": "https://schema.org",\r\n              "@type": "WebSite",\r\n              name: "Tooltip.cc",\r\n              url: "https://tooltip.cc",\r\n              description: "免费在线工具箱，提供JSON格式化、Base64编解码、正则测试、二维码生成等79+实用工具，浏览器本地运行，隐私安全。",\r\n              inLanguage: "zh-CN",\r\n            }),\r\n          }}\r\n        />`;

const newBlock = `            __html: JSON.stringify({\r\n              "@context": "https://schema.org",\r\n              "@type": "WebSite",\r\n              name: "Tooltip.cc",\r\n              url: "https://tooltip.cc",\r\n              description: "免费在线工具箱，提供JSON格式化、Base64编解码、正则测试、二维码生成等79+实用工具，浏览器本地运行，隐私安全。",\r\n              inLanguage: "zh-CN",\r\n            }),\r\n          }}\r\n        />\r\n        <script\r\n          type="application/ld+json"\r\n          dangerouslySetInnerHTML={{\r\n            __html: JSON.stringify({\r\n              "@context": "https://schema.org",\r\n              "@type": "Organization",\r\n              name: "Tooltip.cc",\r\n              url: "https://tooltip.cc",\r\n              email: "admin@tooltip.cc",\r\n              description: "Tooltip.cc is an independent developer-run free online tools platform. All tools run locally in the browser.",\r\n              foundingDate: "2026",\r\n              areaServed: "Worldwide",\r\n              knowsAbout: [\r\n                "Web development",\r\n                "Online tools",\r\n                "Data conversion",\r\n                "Image processing",\r\n                "Network diagnostics"\r\n              ],\r\n            }),\r\n          }}\r\n        />`;

if (!c.includes(oldBlock)) {
  console.log('MATCH FAILED - block not found');
  process.exit(1);
}
c = c.replace(oldBlock, newBlock);
fs.writeFileSync(path, c, 'utf8');
console.log('OK - Organization JSON-LD added to layout.tsx');
