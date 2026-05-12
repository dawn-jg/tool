'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

type RecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME';

interface DnsResult {
  name: string;
  type: string;
  TTL: number;
  data: string;
}

export default function DnsLookupTool() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState<RecordType>('A');
  const [results, setResults] = useState<DnsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordTypes: RecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'];

  const fetchDns = useCallback(async () => {
    if (!domain.trim()) {
      setError('请输入域名');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Use Cloudflare DNS over HTTPS API
      const typeCode = recordType === 'MX' ? 15 : recordType === 'TXT' ? 16 : recordType === 'NS' ? 2 : recordType === 'CNAME' ? 5 : recordType === 'AAAA' ? 28 : 1;
      const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${typeCode}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('DNS 查询失败');
      
      const data = await response.json();
      
      if (data.Status !== 0) {
        throw new Error(`DNS 查询返回错误: ${data.Status}`);
      }

      if (!data.Answer) {
        setResults([]);
        return;
      }

      const formattedResults: DnsResult[] = data.Answer.map((answer: any) => ({
        name: answer.name,
        type: answer.type,
        TTL: answer.TTL,
        data: answer.data,
      }));

      setResults(formattedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  }, [domain, recordType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDns();
  };

  return (
    <ToolLayout
      title="DNS 查询"
      description="查询域名的 DNS 解析记录"
      instructions="输入域名，选择记录类型，查询 DNS 解析结果。支持 A、AAAA、MX、TXT、NS、CNAME 等记录类型。"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="输入域名，如 example.com"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
          />
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value as RecordType)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          >
            {recordTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
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

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              查询结果 ({results.length} 条)
            </h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                      {result.type === '1' ? 'A' : result.type === '28' ? 'AAAA' : result.type === '15' ? 'MX' : result.type === '16' ? 'TXT' : result.type === '2' ? 'NS' : result.type === '5' ? 'CNAME' : result.type}
                    </span>
                    <span className="text-xs text-gray-400">TTL: {result.TTL}s</span>
                  </div>
                  <div className="break-all">{result.data}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && !error && domain && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-600 text-center">
            未找到 {recordType} 记录
          </div>
        )}
      </div>
    </ToolLayout>
  );
}