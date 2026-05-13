'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

interface DomainInfo {
  domain: string;
  registrar: string;
  createdDate: string;
  expiryDate: string;
  updatedDate: string;
  nameservers: string[];
  status: string[];
}

export default function DomainInfoTool() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDomainInfo = useCallback(async () => {
    if (!domain.trim()) {
      setError('请输入域名');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Clean the domain
      let cleanDomain = domain.trim().toLowerCase();
      cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
      cleanDomain = cleanDomain.split('/')[0];

      // Use our API route (server-side proxy to bypass CORS)
      const response = await fetch(`/api/domain-whois?domain=${encodeURIComponent(cleanDomain)}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || '查询失败');
      }

      setResult({
        domain: data.domain,
        registrar: data.registrar,
        createdDate: data.createdDate,
        expiryDate: data.expiryDate,
        updatedDate: data.updatedDate,
        nameservers: data.nameservers,
        status: data.status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败');
    } finally {
      setLoading(false);
    }
  }, [domain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDomainInfo();
  };

  return (
    <ToolLayout
      title="域名信息查询"
      description="查询域名的 WHOIS 注册信息"
      instructions="输入域名,查询域名的注册信息、到期时间、DNS 服务器等"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="输入域名,如 example.com"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
          >
            {loading ? '查询中...' : '查询'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">域名</div>
              <div className="text-lg font-mono font-semibold">{result.domain}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">注册商</div>
              <div className="text-lg">{result.registrar || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">创建日期</div>
              <div className="text-lg">{result.createdDate || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">到期日期</div>
              <div className="text-lg">{result.expiryDate || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">更新日期</div>
              <div className="text-lg">{result.updatedDate || '未知'}</div>
            </div>
            {result.nameservers.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg md:col-span-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">DNS 服务器</div>
                <div className="space-y-1">
                  {result.nameservers.map((ns, index) => (
                    <div key={index} className="text-sm font-mono">{ns}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!result && !loading && !error && (
          <div className="text-center text-gray-400 py-8">
            输入域名查询 WHOIS 信息
          </div>
        )}
      </div>
    </ToolLayout>
  );
}