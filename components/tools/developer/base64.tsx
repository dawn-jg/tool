'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setOutput('转换失败，请检查输入内容');
    }
  };

  return (
    <ToolLayout
      title="Base64 编解码"
      description="在线Base64编码和解码工具"
      instructions="选择编码模式可将普通文本转为Base64字符串，选择解码模式可将Base64字符串还原为原始文本。支持中文等Unicode字符。"
      output={output}
    >
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          编码 Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          解码 Decode
        </button>
      </div>
      <textarea
        className="w-full h-48 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入Base64字符串...'}
      />
      <div className="flex items-center gap-2 mt-4">
        <button onClick={handleConvert} className="btn-primary">转换</button>
        {output && <CopyButton text={output} />}
      </div>
    </ToolLayout>
  );
}
