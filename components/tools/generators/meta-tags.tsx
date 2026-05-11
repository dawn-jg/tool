'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function MetaTags() {
  const [title, setTitle] = useState('我的网站');
  const [description, setDescription] = useState('这是一个很棒的网站');
  const [keywords, setKeywords] = useState('关键词1, 关键词2');
  const [url, setUrl] = useState('https://example.com');
  const [siteName, setSiteName] = useState('我的网站');
  const [ogImage, setOgImage] = useState('https://example.com/og-image.png');
  const [twitterCard, setTwitterCard] = useState('summary_large_image');
  const [charset, setCharset] = useState('UTF-8');

  const html = [
    `<meta charset="${charset}">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<meta name="keywords" content="${keywords}">`,
    `<link rel="canonical" href="${url}">`,
    '',
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:site_name" content="${siteName}">`,
    `<meta property="og:image" content="${ogImage}">`,
    '',
    `<meta name="twitter:card" content="${twitterCard}">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
  ].join('\n');

  return (
    <ToolLayout
      title="Meta 标签生成器"
      description="生成SEO优化的HTML Meta标签"
      instructions="填写网站信息，自动生成符合SEO标准的HTML Meta标签。包括Open Graph（Facebook/LinkedIn）和Twitter Card标签，优化社交媒体分享效果。"
      output={html}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {([
          { label: '网站标题', val: title, set: setTitle, type: 'text' as const },
          { label: '描述', val: description, set: setDescription, type: 'text' as const },
          { label: '关键词', val: keywords, set: setKeywords, type: 'text' as const },
          { label: 'URL', val: url, set: setUrl, type: 'url' as const },
          { label: '网站名称', val: siteName, set: setSiteName, type: 'text' as const },
          { label: 'OG图片URL', val: ogImage, set: setOgImage, type: 'url' as const },
        ]).map((f) => (
          <div key={f.label}>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{f.label}</label>
            <input
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              type={f.type}
            />
          </div>
        ))}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Twitter Card</label>
          <select value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="summary_large_image">Summary Large Image</option>
            <option value="summary">Summary</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <CopyButton text={html} />
      </div>
    </ToolLayout>
  );
}
