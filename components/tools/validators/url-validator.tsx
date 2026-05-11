'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function UrlValidator() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<{ label: string; ok: boolean; msg: string }[]>([]);

  const validate = useCallback(() => {
    const r: { label: string; ok: boolean; msg: string }[] = [];
    const trimmed = url.trim();

    if (!trimmed) {
      r.push({ label: '输入', ok: false, msg: '请输入URL' });
      setResults(r);
      return;
    }

    try {
      const parsed = new URL(trimmed);
      r.push({ label: '格式', ok: true, msg: 'URL格式正确' });
      r.push({ label: '协议', ok: true, msg: parsed.protocol.replace(':', '') });
      r.push({ label: '主机', ok: true, msg: parsed.hostname });
      if (parsed.port) r.push({ label: '端口', ok: true, msg: parsed.port });
      if (parsed.pathname && parsed.pathname !== '/') r.push({ label: '路径', ok: true, msg: parsed.pathname });
      if (parsed.search) r.push({ label: '查询', ok: true, msg: parsed.search });
      if (parsed.hash) r.push({ label: '锚点', ok: true, msg: parsed.hash });

      // Security checks
      if (parsed.protocol === 'http:') r.push({ label: '安全', ok: false, msg: '使用HTTP，建议升级到HTTPS' });
      else if (parsed.protocol === 'https:') r.push({ label: '安全', ok: true, msg: '使用HTTPS加密连接' });
    } catch {
      // Try adding https://
      try {
        new URL('https://' + trimmed);
        r.push({ label: '格式', ok: true, msg: '缺少协议头 (已自动补全)' });
        r.push({ label: '建议', ok: true, msg: 'URL应包含协议头，如 https://' });
      } catch {
        r.push({ label: '格式', ok: false, msg: 'URL格式无效' });
      }
    }

    setResults(r);
  }, [url]);

  return (
    <ToolLayout
      title="URL 验证器"
      description="验证URL格式并解析各组成部分"
      instructions="输入URL地址，点击验证可解析出协议、主机、端口、路径、查询参数和锚点等组成部分。同时检查是否使用安全的HTTPS协议。"
    >
      <div className="flex gap-3">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入URL，如 https://example.com/path?q=1#top"
          type="url"
        />
        <button onClick={validate} className="btn-primary">验证</button>
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
              <span className="text-sm font-medium w-16 shrink-0">{r.label}</span>
              <span className="text-sm font-mono break-all">{r.msg}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
