'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

interface HeaderInfo {
  key: string;
  value: string;
}

interface HttpHeadersResult {
  url: string;
  status: number;
  statusText: string;
  headers: HeaderInfo[];
  timestamp: string;
}

export default function HttpHeadersTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HttpHeadersResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHeaders = useCallback(async () => {
    if (!url.trim()) {
      setError('请输入 URL');
      return;
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(targetUrl, { method: 'HEAD' });
      
      const headers: HeaderInfo[] = [];
      response.headers.forEach((value, key) => {
        headers.push({ key, value });
      });

      setResult({
        url: targetUrl,
        status: response.status,
        statusText: response.statusText,
        headers,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      setError('获取失败，可能是跨域限制或 URL 无效');
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHeaders();
  };

  return (
    <ToolLayout
      title="HTTP 头查看"
      description="查看任意网站返回的 HTTP 响应头"
      instructions="输入 URL，获取该网站的 HTTP 响应头信息"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="输入 URL，如 https://example.com"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
          >
            {loading ? '获取中...' : '获取'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  result.status < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                  result.status < 400 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {result.status} {result.statusText}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 truncate">{result.url}</span>
              <span className="text-xs text-gray-400">{result.timestamp}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                响应头 ({result.headers.length} 条)
              </h3>
              <div className="space-y-1">
                {result.headers.map((header, index) => (
                  <div key={index} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold min-w-[180px]">
                      {header.key}:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 break-all">
                      {header.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="text-center text-gray-400 py-8">
            输入 URL 获取 HTTP 响应头
          </div>
        )}
      </div>
    </ToolLayout>
  );
}