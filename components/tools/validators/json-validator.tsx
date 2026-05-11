'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function JsonValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ valid: boolean; message: string; lines?: string[] }>({ valid: true, message: '' });

  const validate = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setResult({
        valid: true,
        message: `JSON 格式正确 ✓\n\n类型: ${Array.isArray(parsed) ? '数组' : typeof parsed === 'object' ? '对象' : typeof parsed}\n${typeof parsed === 'object' ? `键数量: ${Object.keys(parsed).length}` : ''}`,
      });
    } catch (e) {
      const msg = (e as Error).message;
      // Try to extract position
      const posMatch = msg.match(/position\s+(\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const lines = input.substring(0, pos).split('\n');
        const lineNum = lines.length;
        const colNum = lines[lines.length - 1].length + 1;
        const context = input.split('\n').slice(Math.max(0, lineNum - 3), lineNum + 2);
        setResult({
          valid: false,
          message: `第 ${lineNum} 行，第 ${colNum} 列: ${msg}`,
          lines: context,
        });
      } else {
        setResult({ valid: false, message: msg });
      }
    }
  }, [input]);

  return (
    <ToolLayout
      title="JSON 校验器"
      description="校验JSON格式并定位错误位置"
      instructions="粘贴JSON数据，点击校验检查格式是否正确。如果JSON格式有误，会提示具体的错误行号、列号和上下文内容，方便快速定位修复。"
    >
      <textarea
        className="w-full h-48 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"key": "value"}'
      />
      <button onClick={validate} className="btn-primary mt-4">校验</button>
      {result.message && (
        <div className={`mt-4 p-4 rounded-lg ${result.valid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'} text-sm whitespace-pre-wrap`}>
          {result.message}
        </div>
      )}
      {result.lines && (
        <div className="mt-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm">
          {result.lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
