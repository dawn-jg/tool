'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function RandomPicker() {
  const [items, setItems] = useState('');
  const [result, setResult] = useState('');
  const [count, setCount] = useState(1);
  const [history, setHistory] = useState<string[]>([]);

  const pick = useCallback(() => {
    const list = items.split('\n').filter((l) => l.trim());
    if (list.length === 0) return;

    const picked: string[] = [];
    const available = [...list];
    const n = Math.min(count, available.length);

    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * available.length);
      picked.push(available.splice(idx, 1)[0]);
    }

    const r = picked.join(', ');
    setResult(r);
    setHistory((prev) => [r, ...prev].slice(0, 20));
  }, [items, count]);

  return (
    <ToolLayout
      title="随机抽签"
      description="从列表中随机抽取项目"
      instructions="每行输入一个选项，设置抽取数量，点击抽取即可随机获得结果。支持一次抽取多个选项（不重复）。历史记录保留最近20次抽取结果。"
      output={result || undefined}
    >
      <textarea
        className="w-full h-40 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={items}
        onChange={(e) => setItems(e.target.value)}
        placeholder={"每行一个选项：\n选项A\n选项B\n选项C\n选项D"}
      />
      <div className="flex items-center gap-3 mt-4">
        <label className="flex items-center gap-2 text-sm">
          抽取
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-sm"
          />
          个
        </label>
        <button onClick={pick} className="btn-primary">抽取</button>
        {result && <CopyButton text={result} />}
      </div>
      {result && (
        <div className="mt-4 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-center">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result}</span>
        </div>
      )}
      {history.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">历史记录</h4>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                #{history.length - i}. {h}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
