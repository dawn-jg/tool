'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

function isValidIPv4(ip: string): { valid: boolean; parts?: number[]; error?: string } {
  const parts = ip.split('.');
  if (parts.length !== 4) return { valid: false, error: 'IPv4地址必须是4段' };
  
  for (let i = 0; i < parts.length; i++) {
    const num = parseInt(parts[i], 10);
    if (isNaN(num) || num < 0 || num > 255) {
      return { valid: false, error: `第${i + 1}段值 ${parts[i]} 超出范围 (0-255)` };
    }
    if (parts[i] !== String(num)) {
      return { valid: false, error: `第${i + 1}段 ${parts[i]} 不是有效数字` };
    }
  }
  return { valid: true, parts: parts.map(Number) };
}

function isValidIPv6(ip: string): { valid: boolean; error?: string } {
  // Handle :: expansion
  const ipLower = ip.toLowerCase();
  
  // Full form check
  const fullParts = ipLower.split(':');
  
  // Check for invalid characters
  if (!/^[0-9a-f:]+$/.test(ipLower)) {
    return { valid: false, error: 'IPv6地址只允许包含0-9、a-f和冒号' };
  }
  
  // Count colons
  const colonCount = (ipLower.match(/:/g) || []).length;
  if (colonCount > 8) return { valid: false, error: 'IPv6地址最多8段' };
  
  // Handle :: compression
  if (ipLower.includes('::')) {
    if (ipLower.split('::').length > 2) {
      return { valid: false, error: 'IPv6地址只能有一个 ::' };
    }
    const doubleColonParts = ip.split('::');
    const leftParts = doubleColonParts[0] ? doubleColonParts[0].split(':').filter(Boolean).length : 0;
    const rightParts = doubleColonParts[1] ? doubleColonParts[1].split(':').filter(Boolean).length : 0;
    if (leftParts + rightParts > 7) {
      return { valid: false, error: '使用 :: 压缩时，非压缩部分不能超过7段' };
    }
    return { valid: true };
  }
  
  if (fullParts.length !== 8) {
    return { valid: false, error: `IPv6完整地址需要8段，当前${fullParts.length}段` };
  }
  
  for (const part of fullParts) {
    if (!part) return { valid: false, error: '段不能为空（除了::压缩）' };
    if (part.length > 4) return { valid: false, error: `段 ${part} 超过4个字符` };
    const num = parseInt(part, 16);
    if (isNaN(num)) return { valid: false, error: `段 ${part} 不是有效的十六进制` };
  }
  return { valid: true };
}

function getIPType(ip: string): 'ipv4' | 'ipv6' | 'unknown' {
  if (/^[\d.]+$/.test(ip) && ip.includes('.')) return 'ipv4';
  if (ip.includes(':')) return 'ipv6';
  return 'unknown';
}

function ipToNumber(ip: string): number | null {
  if (getIPType(ip) !== 'ipv4') return null;
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isPrivateIP(ip: string): boolean {
  if (getIPType(ip) !== 'ipv4') return false;
  const num = ipToNumber(ip);
  if (num === null) return false;
  
  // 10.0.0.0 - 10.255.255.255
  if (num >= 0x0A000000 && num <= 0x0AFFFFFF) return true;
  // 172.16.0.0 - 172.31.255.255
  if (num >= 0xAC100000 && num <= 0xAC1FFFFF) return true;
  // 192.168.0.0 - 192.168.255.255
  if (num >= 0xC0A80000 && num <= 0xC0A8FFFF) return true;
  // 127.0.0.0 - 127.255.255.255 (localhost)
  if (num >= 0x7F000000 && num <= 0x7FFFFFFF) return true;
  return false;
}

export function IpValidator() {
  const [ip, setIp] = useState('');
  const [results, setResults] = useState<{ label: string; ok: boolean; msg: string }[]>([]);

  const validate = useCallback(() => {
    const trimmed = ip.trim();
    if (!trimmed) {
      setResults([{ label: '输入', ok: false, msg: '请输入IP地址' }]);
      return;
    }

    const r: { label: string; ok: boolean; msg: string }[] = [];
    const type = getIPType(trimmed);
    
    r.push({ label: '类型', ok: true, msg: type === 'ipv4' ? 'IPv4' : type === 'ipv6' ? 'IPv6' : '未知' });

    if (type === 'ipv4') {
      const v4 = isValidIPv4(trimmed);
      r.push({ label: '格式', ok: v4.valid, msg: v4.valid ? '格式正确' : v4.error || '格式错误' });
      if (v4.valid) {
        r.push({ label: '数值', ok: true, msg: v4.parts?.join('.') || '' });
        r.push({ label: '十六进制', ok: true, msg: v4.parts?.map(p => p.toString(16).padStart(2, '0').toUpperCase()).join('.') || '' });
        r.push({ label: '二进制', ok: true, msg: v4.parts?.map(p => p.toString(2).padStart(8, '0')).join('.') || '' });
        r.push({ label: '分类', ok: true, msg: getIPv4Class(v4.parts![0]) });
        r.push({ label: '私有IP', ok: !isPrivateIP(trimmed), msg: isPrivateIP(trimmed) ? '是私有IP' : '不是私有IP' });
      }
    } else if (type === 'ipv6') {
      const v6 = isValidIPv6(trimmed);
      r.push({ label: '格式', ok: v6.valid, msg: v6.valid ? '格式正确' : v6.error || '格式错误' });
    } else {
      r.push({ label: '格式', ok: false, msg: '无法识别的IP格式' });
    }

    setResults(r);
  }, [ip]);

  return (
    <ToolLayout
      title="IP 地址验证器"
      description="验证IPv4和IPv6地址格式是否正确"
      instructions="输入IP地址，点击验证。支持IPv4和IPv6格式检查，包括段范围、压缩格式、私有IP识别等。"
    >
      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="输入 IPv4 或 IPv6 地址..."
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
    </ToolLayout>
  );
}

function getIPv4Class(firstOctet: number): string {
  if (firstOctet < 128) return 'A类 (1-126)';
  if (firstOctet < 192) return 'B类 (128-191)';
  if (firstOctet < 224) return 'C类 (192-223)';
  if (firstOctet < 240) return 'D类 (224-239, 多播)';
  return 'E类 (240-255, 保留)';
}
