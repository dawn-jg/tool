'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function EmailValidator() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<{ label: string; ok: boolean; msg: string }[]>([]);

  const validate = useCallback(() => {
    const r: { label: string; ok: boolean; msg: string }[] = [];
    const trimmed = email.trim();

    // Empty check
    if (!trimmed) {
      r.push({ label: '格式', ok: false, msg: '请输入邮箱地址' });
      setResults(r);
      return;
    }

    // Basic format
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validFormat = regex.test(trimmed);
    r.push({ label: '格式', ok: validFormat, msg: validFormat ? '格式正确' : '缺少@或域名不完整' });

    if (validFormat) {
      const [local, domain] = trimmed.split('@');

      // Local part checks
      if (local.length > 64) r.push({ label: '本地部分', ok: false, msg: '本地部分超过64字符' });
      else if (/^\.|\.\.|\.$/.test(local)) r.push({ label: '本地部分', ok: false, msg: '本地部分开头/结尾/连续点号' });
      else r.push({ label: '本地部分', ok: true, msg: `长度 ${local.length}/64` });

      // Domain checks
      if (domain.length > 255) r.push({ label: '域名', ok: false, msg: '域名超过255字符' });
      else if (!/\.[a-zA-Z]{2,}$/.test(domain)) r.push({ label: '域名', ok: false, msg: '顶级域名不完整' });
      else r.push({ label: '域名', ok: true, msg: `域名 ${domain}` });

      // Common email providers
      const commonDomains = ['gmail.com', 'outlook.com', 'qq.com', '163.com', '126.com', 'sina.com', 'yahoo.com', 'hotmail.com', 'foxmail.com', 'icloud.com'];
      if (commonDomains.includes(domain.toLowerCase())) {
        r.push({ label: '服务商', ok: true, msg: `常见邮箱: ${domain}` });
      }
    }

    setResults(r);
  }, [email]);

  return (
    <ToolLayout
      title="邮箱验证器"
      description="验证邮箱地址格式是否正确"
      instructions="输入邮箱地址，点击验证检查格式是否正确。会检查@符号、本地部分、域名和顶级域名是否符合规范。仅做格式验证，不发送验证邮件。"
    >
      <div className="flex gap-3">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="输入邮箱地址..."
          type="email"
        />
        <button onClick={validate} className="btn-primary">验证</button>
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              <span className={`text-sm font-medium w-20 shrink-0`}>{r.label}</span>
              <span className="text-sm">{r.msg}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
