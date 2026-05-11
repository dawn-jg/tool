'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function HtmlEntities() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    ' ': '&nbsp;', '©': '&copy;', '®': '&reg;', '™': '&trade;',
    '¥': '&yen;', '€': '&euro;', '£': '&pound;',
  };

  const decodeEntities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'",
    '&nbsp;': ' ', '&copy;': '©', '&reg;': '®', '&trade;': '™',
    '&yen;': '¥', '&euro;': '€', '&pound;': '£',
  };

  const convert = () => {
    if (mode === 'encode') {
      let result = input;
      for (const [char, entity] of Object.entries(entities)) {
        result = result.replaceAll(char, entity);
      }
      // Numeric entities for all non-ASCII
      result = result.replace(/[-￿]/g, (c) => `&#${c.codePointAt(0)};`);
      setOutput(result);
    } else {
      let result = input;
      // Named entities
      for (const [entity, char] of Object.entries(decodeEntities)) {
        result = result.replaceAll(entity, char);
      }
      // Numeric entities
      result = result.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code)));
      // Hex entities
      result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)));
      setOutput(result);
    }
  };

  return (
    <ToolLayout
      title="HTML 实体编码"
      description="HTML实体编码与解码工具"
      instructions="编码模式将HTML特殊字符转换为实体（如 < 转为 &lt;），解码模式将HTML实体还原为原始字符。支持常用命名实体和数字实体。"
      output={output}
    >
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode('encode'); setOutput(''); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          编码 Encode
        </button>
        <button
          onClick={() => { setMode('decode'); setOutput(''); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          解码 Decode
        </button>
      </div>
      <textarea
        className="w-full h-40 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? '<div class="example">Hello & Welcome</div>' : '&lt;div&gt;Hello&lt;/div&gt;'}
      />
      <div className="flex items-center gap-2 mt-4">
        <button onClick={convert} className="btn-primary">转换</button>
        {output && <CopyButton text={output} />}
      </div>
    </ToolLayout>
  );
}
