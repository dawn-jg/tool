'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type Distribution = 'uniform' | 'gaussian';

export function RandomNumberGenerator() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [decimal, setDecimal] = useState(0);
  const [distribution, setDistribution] = useState<Distribution>('uniform');
  const [unique, setUnique] = useState(false);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);

  const generateUniform = (minVal: number, maxVal: number, cnt: number): number[] => {
    const results: number[] = [];
    for (let i = 0; i < cnt; i++) {
      const val = Math.random() * (maxVal - minVal) + minVal;
      results.push(decimal === 0 ? Math.round(val) : parseFloat(val.toFixed(decimal)));
    }
    return results;
  };

  const generateGaussian = (minVal: number, maxVal: number, cnt: number): number[] => {
    const results: number[] = [];
    const mean = (minVal + maxVal) / 2;
    const stdDev = (maxVal - minVal) / 6;
    
    for (let i = 0; i < cnt; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      let val = mean + z * stdDev;
      val = Math.max(minVal, Math.min(maxVal, val));
      results.push(decimal === 0 ? Math.round(val) : parseFloat(val.toFixed(decimal)));
    }
    return results;
  };

  const generate = useCallback(() => {
    let results: number[];
    
    if (unique && count > 1) {
      const range = max - min + 1;
      if (count > range) {
        alert(`无法生成${count}个不重复的随机数，范围只有${range}个数字`);
        return;
      }
      const seen = new Set<number>();
      while (seen.size < count) {
        const val = distribution === 'gaussian' 
          ? generateGaussian(min, max, 1)[0]
          : generateUniform(min, max, 1)[0];
        if (!seen.has(val)) seen.add(val);
      }
      results = Array.from(seen);
    } else if (distribution === 'gaussian') {
      results = generateGaussian(min, max, count);
    } else {
      results = generateUniform(min, max, count);
    }

    setNumbers(results);
    setHistory(prev => [results, ...prev].slice(0, 10));
  }, [min, max, count, decimal, distribution, unique]);

  const formatNum = (n: number) => decimal > 0 ? n.toFixed(decimal) : String(n);
  const output = numbers.map(formatNum).join(', ');

  return (
    <ToolLayout
      title="随机数生成器"
      description="生成随机数字，支持指定范围、个数、正态分布"
      instructions="设置最小值、最大值、数量和精度，点击生成。支持均匀分布和正态分布（高斯分布）。可生成不重复的随机数。"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">最小值</label>
          <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">最大值</label>
          <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">生成数量</label>
          <input type="number" value={count} onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))} min={1} max={1000} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">小数位数</label>
          <input type="number" value={decimal} onChange={(e) => setDecimal(Math.max(0, Math.min(10, Number(e.target.value))))} min={0} max={10} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={distribution === 'uniform'} onChange={() => setDistribution('uniform')} className="w-4 h-4" />
            <span className="text-sm text-gray-700 dark:text-gray-300">均匀分布</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={distribution === 'gaussian'} onChange={() => setDistribution('gaussian')} className="w-4 h-4" />
            <span className="text-sm text-gray-700 dark:text-gray-300">正态分布</span>
          </label>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="w-4 h-4" />
          <span className="text-sm text-gray-700 dark:text-gray-300">不重复</span>
        </label>
        <button onClick={generate} className="btn-primary px-6 ml-auto">生成</button>
      </div>

      {numbers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">生成结果 ({numbers.length}个)</p>
            <CopyButton text={output} />
          </div>
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900 font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
            {output}
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div>
          <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">历史记录</p>
          <div className="space-y-1">
            {history.slice(1).map((h, i) => (
              <button key={i} onClick={() => setNumbers(h)} className="w-full text-left p-2 rounded bg-gray-50 dark:bg-gray-800 text-sm font-mono text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 truncate">
                {i + 1}. {h.map(formatNum).join(', ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
