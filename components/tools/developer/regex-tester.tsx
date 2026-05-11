'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testStr, setTestStr] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState('');

  const test = useCallback(() => {
    setError('');
    setMatches([]);
    try {
      const re = new RegExp(pattern, flags);
      const result: string[] = [];
      let m: RegExpExecArray | null;

      if (flags.includes('g')) {
        while ((m = re.exec(testStr)) !== null) {
          result.push(`匹配 "${m[0]}" 位置 ${m.index}-${m.index + m[0].length}${m.length > 1 ? ' | 分组: ' + m.slice(1).join(', ') : ''}`);
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        m = re.exec(testStr);
        if (m) {
          result.push(`匹配 "${m[0]}" 位置 ${m.index}-${m.index + m[0].length}${m.length > 1 ? ' | 分组: ' + m.slice(1).join(', ') : ''}`);
        }
      }

      if (result.length === 0) setMatches(['未找到匹配']);
      else setMatches(result);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [pattern, flags, testStr]);

  const replace = useCallback(() => {
    setError('');
    try {
      const re = new RegExp(pattern, flags);
      return testStr.replace(re, '');
    } catch {
      return '';
    }
  }, [pattern, flags, testStr]);

  return (
    <ToolLayout
      title="正则表达式测试"
      description="在线正则表达式测试工具，支持匹配和替换"
      instructions="输入正则表达式和测试文本，点击测试查看匹配结果。支持所有JS正则语法和标志(i/g/m/s/u/y)。匹配结果会显示位置和捕获组信息。"
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="正则表达式，如 \d{4}-\d{2}-\d{2}"
          />
          <input
            className="w-24 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g"
          />
        </div>
        <textarea
          className="w-full h-40 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          placeholder="测试文本..."
        />
        <div className="flex gap-2">
          <button onClick={test} className="btn-primary">测试匹配</button>
        </div>
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}
        {matches.length > 0 && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-800 dark:text-gray-200">
            {matches.map((m, i) => <div key={i}>{m}</div>)}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
