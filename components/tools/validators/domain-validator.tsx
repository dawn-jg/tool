'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

function isValidDomain(domain: string): { valid: boolean; parts?: string[]; error?: string } {
  const trimmed = domain.trim().toLowerCase();
  
  if (!trimmed) {
    return { valid: false, error: '请输入域名' };
  }
  
  // Remove protocol if present
  const cleanDomain = trimmed.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Check length
  if (cleanDomain.length > 253) {
    return { valid: false, error: '域名长度不能超过253个字符' };
  }
  
  // Check for valid characters
  if (!/^[a-z0-9]+([\-\.]{1,2}[a-z0-9]+)*\.[a-z]{2,}$/.test(cleanDomain)) {
    return { valid: false, error: '域名格式不正确（只允许字母、数字、连字符）' };
  }
  
  // Check parts
  const parts = cleanDomain.split('.');
  if (parts.length < 2) {
    return { valid: false, error: '域名至少需要包含一个主域名和一个顶级域' };
  }
  
  for (const part of parts) {
    if (part.length === 0) {
      return { valid: false, error: '域名部分不能为空' };
    }
    if (part.length > 63) {
      return { valid: false, error: `域名部分 ${part} 超过63个字符` };
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(part)) {
      return { valid: false, error: `域名部分 ${part} 包含无效字符` };
    }
    if (part.startsWith('-') || part.endsWith('-')) {
      return { valid: false, error: `域名部分 ${part} 不能以连字符开头或结尾` };
    }
  }
  
  // Check TLD
  const tld = parts[parts.length - 1];
  if (tld.length < 2) {
    return { valid: false, error: '顶级域名长度至少2个字符' };
  }
  
  return { valid: true, parts };
}

function getDomainInfo(domain: string) {
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  const sld = parts.length > 1 ? parts[parts.length - 2] : '';
  const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : '';
  
  return { tld, sld, subdomain };
}

const commonTLDs = ['com', 'cn', 'net', 'org', 'io', 'co', 'me', 'dev', 'app', 'xyz', 'info', 'biz', 'tv', 'cc'];

export function DomainValidator() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<{ label: string; ok: boolean; msg: string }[]>([]);

  const validate = useCallback(() => {
    const trimmed = domain.trim();
    if (!trimmed) {
      setResults([{ label: '输入', ok: false, msg: '请输入域名' }]);
      return;
    }

    const r: { label: string; ok: boolean; msg: string }[] = [];
    const validation = isValidDomain(trimmed);
    
    r.push({ label: '格式', ok: validation.valid, msg: validation.valid ? '格式正确' : validation.error || '格式错误' });
    
    if (validation.valid && validation.parts) {
      const info = getDomainInfo(trimmed);
      r.push({ label: '顶级域', ok: true, msg: `.${info.tld}` });
      r.push({ label: '主域名', ok: true, msg: info.sld });
      if (info.subdomain) {
        r.push({ label: '子域名', ok: true, msg: info.subdomain });
      }
      
      // Check if TLD is common
      r.push({ label: '常见TLD', ok: commonTLDs.includes(info.tld), msg: commonTLDs.includes(info.tld) ? `是常见顶级域 (.${info.tld})` : `非常见顶级域 (.${info.tld})` });
      
      // DNS label check simulation
      r.push({ label: 'DNS兼容', ok: true, msg: validation.parts.join(' → ') });
      
      // Length info
      r.push({ label: '总长度', ok: trimmed.length <= 63, msg: `${trimmed.length} 字符 (限制63)` });
    }

    setResults(r);
  }, [domain]);

  return (
    <ToolLayout
      title="域名格式验证器"
      description="验证域名格式是否正确，检查顶级域和子域名"
      instructions="输入域名，点击验证。支持检查域名格式、顶级域名、子域名、DNS兼容性等。"
    >
      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="输入域名，如 example.com 或 sub.example.com"
        />
        <button onClick={validate} className="btn-primary px-6">验证</button>
      </div>
      
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg flex items-center gap-3 ${
                r.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}
            >
              <span className="text-sm font-medium w-20 shrink-0">{r.label}</span>
              <span className="text-sm font-mono flex-1">{r.msg}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">常见顶级域</p>
        <div className="flex flex-wrap gap-2">
          {commonTLDs.map((tld) => (
            <button
              key={tld}
              onClick={() => setDomain(prev => prev ? `${prev}.${tld}` : `example.${tld}`)}
              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600"
            >
              .{tld}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
