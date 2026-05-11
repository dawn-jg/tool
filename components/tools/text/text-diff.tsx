'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [result, setResult] = useState<{ type: 'same' | 'add' | 'remove'; text: string }[]>([]);

  const compare = useCallback(() => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    // Simple line-by-line LCS diff
    const m = lines1.length;
    const n = lines2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (lines1[i - 1] === lines2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const diff: { type: 'same' | 'add' | 'remove'; text: string }[] = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
        diff.unshift({ type: 'same', text: lines1[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'add', text: lines2[j - 1] });
        j--;
      } else {
        diff.unshift({ type: 'remove', text: lines1[i - 1] });
        i--;
      }
    }
    setResult(diff);
  }, [text1, text2]);

  return (
    <ToolLayout
      title="文本差异对比"
      description="对比两段文本差异，高亮显示不同之处"
      instructions="在左右两个文本框中分别粘贴原始文本和修改后的文本，点击对比按钮查看差异。绿色为新增行，红色为删除行。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">原始文本</label>
          <textarea
            className="w-full h-48 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="粘贴原始文本..."
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">修改后文本</label>
          <textarea
            className="w-full h-48 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="粘贴修改后文本..."
          />
        </div>
      </div>
      <button onClick={compare} className="btn-primary mt-4">对比</button>
      {result.length > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm overflow-auto max-h-96">
          {result.map((line, i) => (
            <div
              key={i}
              className={
                line.type === 'add'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-0.5'
                  : line.type === 'remove'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-0.5'
                  : 'px-2 py-0.5'
              }
            >
              {line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  '}
              {line.text}
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
