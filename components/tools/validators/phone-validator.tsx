'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function PhoneValidator() {
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<{ label: string; ok: boolean; msg: string }[]>([]);

  const validate = useCallback(() => {
    const r: { label: string; ok: boolean; msg: string }[] = [];
    const trimmed = phone.trim();

    if (!trimmed) {
      r.push({ label: '格式', ok: false, msg: '请输入手机号码' });
      setResults(r);
      return;
    }

    // China mobile
    const cnRegex = /^1[3-9]\d{9}$/;
    if (cnRegex.test(trimmed)) {
      r.push({ label: '中国手机号', ok: true, msg: '格式正确' });
      const prefix = trimmed.substring(0, 3);
      const carriers: Record<string, string> = {
        '134': '中国移动', '135': '中国移动', '136': '中国移动', '137': '中国移动', '138': '中国移动', '139': '中国移动',
        '150': '中国移动', '151': '中国移动', '152': '中国移动', '157': '中国移动', '158': '中国移动', '159': '中国移动',
        '182': '中国移动', '183': '中国移动', '184': '中国移动', '187': '中国移动', '188': '中国移动',
        '130': '中国联通', '131': '中国联通', '132': '中国联通', '155': '中国联通', '156': '中国联通', '185': '中国联通', '186': '中国联通',
        '133': '中国电信', '153': '中国电信', '180': '中国电信', '181': '中国电信', '189': '中国电信',
      };
      if (carriers[prefix]) r.push({ label: '运营商', ok: true, msg: carriers[prefix] });
      const areaCodes: Record<string, string> = {
        '010': '北京', '021': '上海', '020': '广州', '0755': '深圳', '028': '成都', '0571': '杭州',
      };
    } else if (trimmed.startsWith('+')) {
      // International
      r.push({ label: '国际号码', ok: true, msg: `国际格式 ${trimmed.substring(0, 6)}...` });
      if (trimmed.startsWith('+86') && /^\+861[3-9]\d{9}$/.test(trimmed)) {
        r.push({ label: '中国手机号', ok: true, msg: '国际格式的中国手机号' });
      }
    } else if (/^\d{11}$/.test(trimmed)) {
      r.push({ label: '中国手机号', ok: false, msg: '号段无效，应以1开头且第二位为3-9' });
    } else {
      r.push({ label: '格式', ok: false, msg: `${trimmed.length}位数字，标准手机号为11位` });
    }

    setResults(r);
  }, [phone]);

  return (
    <ToolLayout
      title="手机号验证器"
      description="验证中国大陆手机号格式"
      instructions="输入手机号码，点击验证检查格式是否正确。支持中国大陆手机号（11位，1开头）和国际格式（+开头）。可识别中国三大运营商号段。"
    >
      <div className="flex gap-3">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="输入手机号码..."
          type="tel"
        />
        <button onClick={validate} className="btn-primary">验证</button>
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              <span className="text-sm font-medium w-24 shrink-0">{r.label}</span>
              <span className="text-sm">{r.msg}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
