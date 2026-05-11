'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function SlugGenerator() {
  const [input, setInput] = useState('');

  const slug = useCallback((s: string) => {
    return s
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const output = slug(input);

  return (
    <ToolLayout
      title="Slug 生成器"
      description="将文本转换为URL友好的slug格式"
      instructions="输入文本，自动生成URL友好的slug格式。会转换为小写、空格替换为连字符、移除特殊字符。适用于博客文章URL、文件名等场景。"
      output={output || undefined}
    >
      <div className="flex items-center gap-3">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入文本，如：Hello World 你好"
        />
        {output && <CopyButton text={output} />}
      </div>
      {output && (
        <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <span className="text-sm text-gray-500 dark:text-gray-400">生成的 Slug: </span>
          <code className="text-lg font-mono text-blue-600 dark:text-blue-400">{output}</code>
        </div>
      )}
    </ToolLayout>
  );
}
