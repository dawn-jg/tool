'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const timezones = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore', 'Asia/Kolkata',
  'Asia/Dubai', 'Asia/Jerusalem', 'Asia/Bangkok', 'Asia/Hong_Kong',
  'Australia/Sydney', 'Australia/Melbourne',
  'Pacific/Auckland', 'Pacific/Honolulu',
  'Africa/Cairo', 'Africa/Lagos',
  'UTC',
];

export function TimezoneConverter() {
  const [fromTz, setFromTz] = useState('Asia/Shanghai');
  const [toTz, setToTz] = useState('America/New_York');
  const [dateInput, setDateInput] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const convert = useCallback(() => {
    const base = dateInput ? new Date(dateInput) : now;
    const fmt = (tz: string) => {
      try {
        return base.toLocaleString('zh-CN', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      } catch {
        return '不可用';
      }
    };
    setResults([
      `${fromTz}: ${fmt(fromTz)}`,
      `${toTz}: ${fmt(toTz)}`,
      `UTC: ${base.toISOString()}`,
    ]);
  }, [dateInput, fromTz, toTz, now]);

  useEffect(() => { convert(); }, []);

  return (
    <ToolLayout
      title="时区转换器"
      description="全球时区时间转换工具"
      instructions="选择来源时区和目标时区，输入或使用当前时间，点击转换即可查看对应时区的时间。支持全球主要城市时区。"
      output={results.join('\n')}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">来源时区</label>
            <select value={fromTz} onChange={(e) => setFromTz(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
              {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">目标时区</label>
            <select value={toTz} onChange={(e) => setToTz(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
              {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">日期时间（留空使用当前时间）</label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <button onClick={convert} className="btn-primary">转换</button>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-800 dark:text-gray-200">
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
