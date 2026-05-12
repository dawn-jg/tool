'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

interface IpInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_name: string;
  org: string;
  postal: string;
  timezone: string;
  asn: string;
  latitude: number;
  longitude: number;
}

export default function IpInfoTool() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIpInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('获取IP信息失败');
      const data = await response.json();
      setIpInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIpInfo();
  }, [fetchIpInfo]);

  return (
    <ToolLayout
      title="IP 信息查询"
      description="查询本机 IP 地址及地理位置信息"
      instructions="显示当前网络的公网 IP 地址和相关地理位置信息"
    >
      <div className="space-y-6">
        <div className="text-center">
          <button
            onClick={fetchIpInfo}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
          >
            {loading ? '查询中...' : '刷新 IP 信息'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        {ipInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">IP 地址</div>
              <div className="text-2xl font-mono font-bold">{ipInfo.ip || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">国家/地区</div>
              <div className="text-xl font-semibold">{ipInfo.country_name || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">省份/城市</div>
              <div className="text-lg">{ipInfo.region || '未知'}{ipInfo.city ? ` / ${ipInfo.city}` : ''}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">邮政编码</div>
              <div className="text-lg">{ipInfo.postal || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">时区</div>
              <div className="text-lg">{ipInfo.timezone || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">运营商/组织</div>
              <div className="text-lg">{ipInfo.org || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">ASN</div>
              <div className="text-lg font-mono">{ipInfo.asn || '未知'}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">坐标</div>
              <div className="text-lg font-mono">
                {ipInfo.latitude && ipInfo.longitude 
                  ? `${ipInfo.latitude}, ${ipInfo.longitude}` 
                  : '未知'}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}