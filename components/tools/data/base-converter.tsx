'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function BaseConverter() {
  const [input, setInput] = useState('255');
  const [fromBase, setFromBase] = useState(10);

  const parse = (val: string, base: number): number | null => {
    try {
      const n = parseInt(val, base);
      return isNaN(n) ? null : n;
    } catch {
      return null;
    }
  };

  const num = parse(input, fromBase);
  const bases = [2, 8, 10, 16];

  return (
    <ToolLayout
      title="进制转换"
      description="二进制、八进制、十进制、十六进制互相转换"
      instructions="输入数字并选择当前进制，自动显示其他进制的转换结果。支持2-36进制的数值转换。常用于编程中的数值进制换算。"
    >
      <div className="flex items-center gap-3 mb-6">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入数值..."
        />
        <select
          value={fromBase}
          onChange={(e) => setFromBase(Number(e.target.value))}
          className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        >
          <option value={2}>二进制</option>
          <option value={8}>八进制</option>
          <option value={10}>十进制</option>
          <option value={16}>十六进制</option>
        </select>
      </div>

      {num !== null && (
        <div className="space-y-3">
          {bases.map((base) => (
            <div key={base} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {base === 2 ? '二进制 (BIN)' : base === 8 ? '八进制 (OCT)' : base === 10 ? '十进制 (DEC)' : '十六进制 (HEX)'}
              </span>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono text-gray-900 dark:text-white">
                  {base === 16 ? num.toString(16).toUpperCase() : num.toString(base)}
                </code>
                <CopyButton text={base === 16 ? num.toString(16).toUpperCase() : num.toString(base)} />
              </div>
            </div>
          ))}
        </div>
      )}
      {num === null && input && (
        <p className="text-red-500 text-sm">无效的{fromBase === 2 ? '二进制' : fromBase === 8 ? '八进制' : fromBase === 10 ? '十进制' : '十六进制'}数字</p>
      )}
    </ToolLayout>
  );
}
