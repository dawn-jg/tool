'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

interface LatencyResult {
  url: string;
  latency: number;
  status: number;
  timestamp: string;
  success: boolean;
}

export default function LatencyTestTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testLatency = useCallback(async (targetUrl: string) => {
    const startTime = performance.now();
    try {
      const response = await fetch(targetUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      return {
        url: targetUrl,
        latency,
        status: 0,
        timestamp: new Date().toLocaleTimeString(),
        success: true,
      };
    } catch (err) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      return {
        url: targetUrl,
        latency,
        status: 0,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
      };
    }
  }, []);

  const handleTest = async () => {
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

    try {
      const result = await testLatency(targetUrl);
      setResults((prev) => [result, ...prev].slice(0, 10));
    } catch (err) {
      setError('测试失败');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTest();
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-600';
    if (latency < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <ToolLayout
      title="延迟测试"
      description="测量到网站的响应时间（模拟 Ping）"
      instructions="输入 URL，测试到该网站的响应延迟。由于浏览器限制，使用 fetch 进行测量，结果仅供参考。"
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入 URL，如 example.com"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
          />
          <button
            onClick={handleTest}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
          >
            {loading ? '测试中...' : '测试'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              测试历史（最近 10 次）
            </h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-mono break-all">{result.url}</div>
                    <div className="text-xs text-gray-400 mt-1">{result.timestamp}</div>
                  </div>
                  <div className={`text-2xl font-bold ml-4 ${getLatencyColor(result.latency)}`}>
                    {result.latency}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-8">
            输入 URL 开始测试
          </div>
        )}
      </div>
    </ToolLayout>
  );
}