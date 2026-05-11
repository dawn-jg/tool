'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function Timestamp() {
  const [now, setNow] = useState(new Date());
  const [tsInput, setTsInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [tsResult, setTsResult] = useState('');
  const [dateResult, setDateResult] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTs = Math.floor(now.getTime() / 1000);
  const currentTsMs = now.getTime();
  const currentISO = now.toISOString();

  const tsToDate = useCallback(() => {
    const ts = parseInt(tsInput);
    if (isNaN(ts)) { setDateResult('请输入有效时间戳'); return; }
    const ms = ts > 9999999999 ? ts : ts * 1000;
    const d = new Date(ms);
    setDateResult(`${d.toLocaleString('zh-CN')}\nISO: ${d.toISOString()}\nUTC: ${d.toUTCString()}`);
  }, [tsInput]);

  const dateToTs = useCallback(() => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) { setTsResult('请输入有效日期'); return; }
    setTsResult(`秒: ${Math.floor(d.getTime() / 1000)}\n毫秒: ${d.getTime()}`);
  }, [dateInput]);

  return (
    <ToolLayout
      title="Unix 时间戳转换"
      description="Unix时间戳与日期格式互转，实时显示当前时间"
      instructions="支持秒级和毫秒级时间戳。10位数字为秒级，13位数字为毫秒级。输入时间戳即可转换为日期，输入日期即可转换为时间戳。"
    >
      <div className="p-4 mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">当前时间</h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200 font-mono">
          <div className="flex items-center justify-between">
            <span>本地时间:</span>
            <span>{now.toLocaleString('zh-CN')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Unix 秒:</span>
            <span className="flex items-center gap-2">{currentTs}<CopyButton text={String(currentTs)} /></span>
          </div>
          <div className="flex items-center justify-between">
            <span>Unix 毫秒:</span>
            <span className="flex items-center gap-2">{currentTsMs}<CopyButton text={String(currentTsMs)} /></span>
          </div>
          <div className="flex items-center justify-between">
            <span>ISO 8601:</span>
            <span className="flex items-center gap-2">{currentISO}<CopyButton text={currentISO} /></span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">时间戳 → 日期</h4>
          <input
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="输入时间戳，如 1700000000"
          />
          <button onClick={tsToDate} className="btn-primary mt-2 text-xs">转换</button>
          {dateResult && <pre className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200">{dateResult}</pre>}
        </div>
        <div>
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">日期 → 时间戳</h4>
          <input
            type="datetime-local"
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
          <button onClick={dateToTs} className="btn-primary mt-2 text-xs">转换</button>
          {tsResult && <pre className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200">{tsResult}</pre>}
        </div>
      </div>
    </ToolLayout>
  );
}
