'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function CaseConverter() {
  const [input, setInput] = useState('');

  const toCamel = (s: string) => s.replace(/[_\-\s]+(.)?/g, (_, c: string) => c ? c.toUpperCase() : '').replace(/^[A-Z]/, (m) => m.toLowerCase());
  const toPascal = (s: string) => s.replace(/[_\-\s]+(.)?/g, (_, c: string) => c ? c.toUpperCase() : '').replace(/^[a-z]/, (m) => m.toUpperCase());
  const toSnake = (s: string) => s.replace(/([A-Z])/g, '_$1').replace(/[-\s]+/g, '_').replace(/^_/, '').toLowerCase().replace(/__+/g, '_');
  const toKebab = (s: string) => s.replace(/([A-Z])/g, '-$1').replace(/[_\s]+/g, '-').replace(/^-/, '').toLowerCase().replace(/--+/g, '-');
  const toUpper = (s: string) => s.toUpperCase();
  const toLower = (s: string) => s.toLowerCase();
  const toConstant = (s: string) => toSnake(s).toUpperCase();

  const results = [
    { label: 'camelCase', value: toCamel(input) },
    { label: 'PascalCase', value: toPascal(input) },
    { label: 'snake_case', value: toSnake(input) },
    { label: 'kebab-case', value: toKebab(input) },
    { label: 'UPPER_CASE', value: toConstant(input) },
    { label: 'UPPERCASE', value: toUpper(input) },
    { label: 'lowercase', value: toLower(input) },
  ];

  return (
    <ToolLayout
      title="命名风格转换"
      description="camelCase、snake_case、kebab-case等命名风格互相转换"
      instructions="输入任意风格的文本，自动生成7种常用命名风格的结果。支持camelCase、PascalCase、snake_case、kebab-case、UPPER_CASE等转换。"
    >
      <input
        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入文本，如 hello_world 或 HelloWorld..."
      />
      <div className="mt-6 space-y-3">
        {results.map((r) => (
          <div key={r.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">{r.label}</span>
            <code className="flex-1 text-sm text-gray-800 dark:text-gray-200">{r.value || '-'}</code>
            {r.value && <CopyButton text={r.value} />}
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
