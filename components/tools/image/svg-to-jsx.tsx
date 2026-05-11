'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function SvgToJsx() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    let jsx = input
      // Remove XML declaration and comments
      .replace(/<\?xml[^>]*\?>/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      // Convert attributes to camelCase
      .replace(/\s(stroke-width)="/g, ' strokeWidth="')
      .replace(/\s(stroke-dasharray)="/g, ' strokeDasharray="')
      .replace(/\s(stroke-dashoffset)="/g, ' strokeDashoffset="')
      .replace(/\s(stroke-linecap)="/g, ' strokeLinecap="')
      .replace(/\s(stroke-linejoin)="/g, ' strokeLinejoin="')
      .replace(/\s(stroke-opacity)="/g, ' strokeOpacity="')
      .replace(/\s(stroke-miterlimit)="/g, ' strokeMiterlimit="')
      .replace(/\s(fill-opacity)="/g, ' fillOpacity="')
      .replace(/\s(fill-rule)="/g, ' fillRule="')
      .replace(/\s(font-family)="/g, ' fontFamily="')
      .replace(/\s(font-size)="/g, ' fontSize="')
      .replace(/\s(font-weight)="/g, ' fontWeight="')
      .replace(/\s(font-style)="/g, ' fontStyle="')
      .replace(/\s(text-anchor)="/g, ' textAnchor="')
      .replace(/\s(text-decoration)="/g, ' textDecoration="')
      .replace(/\s(clip-path)="/g, ' clipPath="')
      .replace(/\s(clip-rule)="/g, ' clipRule="')
      .replace(/\s(xmlns:xlink)="/g, ' xmlnsXlink="')
      .replace(/\s(xlink:href)="/g, ' xlinkHref="')
      .replace(/\s(view-box)="/g, ' viewBox="')
      .replace(/\s(class)="/g, ' className="')
      // Self-closing tags
      .replace(/<([\w.]+)([^>]*?)\s*\/>/g, '<$1$2 />')
      // Remove namespace if present
      .replace(/\sxmlns="[^"]*"/g, '')
      .trim();

    setOutput(jsx);
  };

  return (
    <ToolLayout
      title="SVG 转 JSX"
      description="将SVG代码转换为React JSX格式"
      instructions="粘贴SVG代码，点击转换自动将SVG属性转为React JSX兼容的camelCase格式。包括className、strokeWidth、fillOpacity等常用属性的转换。"
      output={output}
    >
      <textarea
        className="w-full h-48 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'
      />
      <div className="flex items-center gap-2 mt-4">
        <button onClick={convert} className="btn-primary">转换为 JSX</button>
        {output && <CopyButton text={output} />}
      </div>
    </ToolLayout>
  );
}
