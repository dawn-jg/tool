'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function CronGenerator() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');

  const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const presets = [
    { label: '每分钟', expr: '* * * * *' },
    { label: '每5分钟', expr: '*/5 * * * *' },
    { label: '每30分钟', expr: '*/30 * * * *' },
    { label: '每小时', expr: '0 * * * *' },
    { label: '每天0点', expr: '0 0 * * *' },
    { label: '每天8点', expr: '0 8 * * *' },
    { label: '每周一8点', expr: '0 8 * * 1' },
    { label: '每月1号0点', expr: '0 0 1 * *' },
  ];

  const description = useMemo(() => {
    const parts: string[] = [];
    const desc = (field: string, unit: string) => {
      if (field === '*') return `每${unit}`;
      if (field.startsWith('*/')) return `每${field.slice(2)}${unit}`;
      return `${unit}${field}`;
    };
    parts.push(desc(minute, '分钟'));
    parts.push(desc(hour, '小时'));
    if (dayOfMonth !== '*') parts.push(`月第${dayOfMonth}天`);
    if (month !== '*') parts.push(`${month}月`);
    if (dayOfWeek !== '*') {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      parts.push(`周${dayOfWeek.split(',').map((d) => days[parseInt(d)] || d).join(',')}`);
    }
    return parts.join(', ');
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  return (
    <ToolLayout
      title="Cron 表达式生成器"
      description="可视化生成和解析Cron表达式"
      instructions="通过下拉菜单选择Cron表达式的各个字段，也可使用预设快速生成常用表达式。支持5字段标准Cron表达式（分钟、小时、日、月、星期）。"
      output={expr}
    >
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {([
          { label: '分钟', val: minute, set: setMinute, opts: ['*', '0', '*/5', '*/10', '*/15', '*/30', '0,30'] },
          { label: '小时', val: hour, set: setHour, opts: ['*', '0', '*/2', '*/6', '8', '9', '12', '18', '0,12'] },
          { label: '日', val: dayOfMonth, set: setDayOfMonth, opts: ['*', '1', '15', 'L'] },
          { label: '月', val: month, set: setMonth, opts: ['*', '1', '6', '12'] },
          { label: '星期', val: dayOfWeek, set: setDayOfWeek, opts: ['*', '0', '1', '1-5', '6,0'] },
        ] as const).map((f) => (
          <div key={f.label}>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{f.label}</label>
            <select
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <code className="text-lg font-mono text-blue-600 dark:text-blue-400">{expr}</code>
        <CopyButton text={expr} />
        <span className="text-sm text-gray-500 dark:text-gray-400">{description}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              const parts = p.expr.split(' ');
              setMinute(parts[0]); setHour(parts[1]); setDayOfMonth(parts[2]);
              setMonth(parts[3]); setDayOfWeek(parts[4]);
            }}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {p.label}: {p.expr}
          </button>
        ))}
      </div>
    </ToolLayout>
  );
}
