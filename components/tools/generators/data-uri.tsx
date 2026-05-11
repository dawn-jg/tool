'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function DataUri() {
  const [text, setText] = useState('Hello, World!');
  const [mime, setMime] = useState('text/plain');
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    const base64 = btoa(unescape(encodeURIComponent(text)));
    setOutput(`data:${mime};base64,${base64}`);
  }, [text, mime]);

  const mimePresets = [
    'text/plain', 'text/html', 'text/css', 'text/javascript',
    'application/json', 'image/svg+xml', 'application/octet-stream',
  ];

  return (
    <ToolLayout
      title="Data URI 生成器"
      description="将文本转换为Data URI格式"
      instructions="输入文本内容和MIME类型，生成Data URI格式的字符串。Data URI可以将文件内容内嵌到HTML或CSS中，减少HTTP请求。"
      output={output}
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">MIME类型</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {mimePresets.map((m) => (
              <button
                key={m}
                onClick={() => setMime(m)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${mime === m ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                {m}
              </button>
            ))}
          </div>
          <input
            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={mime}
            onChange={(e) => setMime(e.target.value)}
            placeholder="自定义MIME类型"
          />
        </div>
        <textarea
          className="w-full h-32 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入文本内容..."
        />
        <div className="flex items-center gap-2">
          <button onClick={generate} className="btn-primary">生成 Data URI</button>
          {output && <CopyButton text={output} />}
        </div>
        {output && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">使用方式:</p>
            <code className="text-xs text-blue-600 dark:text-blue-400 break-all">{`<a href="${output}">下载</a>`}</code>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
