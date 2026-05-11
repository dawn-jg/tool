'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [algo, setAlgo] = useState('SHA-256');

  const generate = useCallback(async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    if (algo === 'MD5' || algo === 'SHA-1') {
      setOutput('浏览器不支持MD5和SHA-1原生API，建议使用更安全的SHA-256或SHA-512');
      return;
    }

    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    setOutput(hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''));
  }, [input, algo]);

  return (
    <ToolLayout
      title="哈希生成器"
      description="在线生成MD5、SHA-1、SHA-256、SHA-512哈希值"
      instructions="输入文本，选择哈希算法，点击生成即可获得对应的哈希值。SHA-256和SHA-512使用浏览器原生Web Crypto API，MD5和SHA-1因浏览器安全限制不支持。"
      output={output}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {['SHA-256', 'SHA-512', 'SHA-1', 'MD5'].map((a) => (
          <button
            key={a}
            onClick={() => { setAlgo(a); setOutput(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${algo === a ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            {a}
          </button>
        ))}
      </div>
      <textarea
        className="w-full h-32 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入要生成哈希的文本..."
      />
      <div className="flex items-center gap-2 mt-4">
        <button onClick={generate} className="btn-primary">生成哈希</button>
        {output && <CopyButton text={output} />}
      </div>
    </ToolLayout>
  );
}
