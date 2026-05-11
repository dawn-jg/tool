'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function PlaceholderImage() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bg, setBg] = useState('cccccc');
  const [fg, setFg] = useState('666666');
  const [text, setText] = useState('');

  const url = `https://via.placeholder.com/${width}x${height}/${bg}/${fg}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  const html = `<img src="${url}" alt="placeholder" width="${width}" height="${height}" />`;
  const css = `background-image: url('${url}');`;
  const markdown = `![placeholder](${url})`;

  return (
    <ToolLayout
      title="占位图生成器"
      description="生成占位图片URL和HTML代码"
      instructions="设置图片宽度、高度、背景色和文字色，可选自定义文字。生成后获得URL、HTML、CSS和Markdown多种引用格式，方便在网页开发中使用。"
      output={url}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">宽</label>
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">高</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">背景色</label>
            <input type="color" value={`#${bg}`} onChange={(e) => setBg(e.target.value.replace('#', ''))} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">文字色</label>
            <input type="color" value={`#${fg}`} onChange={(e) => setFg(e.target.value.replace('#', ''))} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
        </div>
        <input
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="自定义文字（可选）"
        />
        <div className="flex items-center gap-2">
          <CopyButton text={url} />
          <CopyButton text={html} />
          <CopyButton text={markdown} />
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 flex justify-center">
          <img src={url} alt="placeholder" className="max-w-full rounded border border-gray-200 dark:border-gray-700" />
        </div>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">URL:</span>
            <code className="flex-1 text-blue-600 dark:text-blue-400 break-all">{url}</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">HTML:</span>
            <code className="flex-1 text-blue-600 dark:text-blue-400">{html}</code>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
