'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function PunctuationConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  // Fullwidth offset: 0xFF00 - 0x0020 = 0xFEE0
  const toFullwidth = (s: string) =>
    s.replace(/[!-~]/g, (c) => {
      if (c === ' ') return '　';
      return String.fromCharCode(c.charCodeAt(0) + 0xFEE0);
    });

  const toHalfwidth = (s: string) =>
    s.replace(/[　！-～]/g, (c) => {
      if (c === '　') return ' ';
      return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
    });

  return (
    <ToolLayout
      title="全角半角转换"
      description="全角字符与半角字符互相转换"
      instructions="全角字符占用两个英文字符宽度，半角占用一个。日文、中文标点常用全角，英文编程等场景常用半角。支持ASCII字符和常用标点符号的转换。"
      output={output}
    >
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOutput(toFullwidth(input))}
          className="btn-primary"
        >
          半角 → 全角
        </button>
        <button
          onClick={() => setOutput(toHalfwidth(input))}
          className="btn-secondary"
        >
          全角 → 半角
        </button>
      </div>
      <textarea
        className="w-full h-40 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入文本... 半角: ABCabc123 全角: ＡＢＣａｂｃ１２３"
      />
      {output && (
        <div className="mt-4 flex items-center gap-2">
          <CopyButton text={output} />
        </div>
      )}
    </ToolLayout>
  );
}
