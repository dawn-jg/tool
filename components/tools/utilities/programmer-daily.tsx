'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type TabType = 'timestamp' | 'ascii' | 'color' | 'http' | 'binary';

export default function ProgrammerDaily() {
  const [activeTab, setActiveTab] = useState<TabType>('timestamp');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimestamp = (date: Date) => {
    return {
      unix: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString('zh-CN'),
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN'),
    };
  };

  const ts = formatTimestamp(currentTime);

  return (
    <ToolLayout
      title="程序员日常"
      description="程序员常用工具集：时间戳、ASCII表、颜色转换、HTTP状态码"
      instructions="集合了程序员日常开发中常用的小工具，包括：Unix时间戳转换、ASCII码表、颜色格式转换（HEX/RGB/HSL）、HTTP状态码参考、进制转换等。"
    >
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {[
            { key: 'timestamp', label: '时间戳' },
            { key: 'ascii', label: 'ASCII表' },
            { key: 'color', label: '颜色转换' },
            { key: 'http', label: 'HTTP状态码' },
            { key: 'binary', label: '进制转换' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timestamp Tab */}
        {activeTab === 'timestamp' && (
          <div className="space-y-3">
            <div className="grid gap-2">
              <TimestampRow label="Unix 秒" value={ts.unix} copyText={ts.unix.toString()} />
              <TimestampRow label="Unix 毫秒" value={ts.unixMs} copyText={ts.unixMs.toString()} />
              <TimestampRow label="ISO 8601" value={ts.iso} copyText={ts.iso} />
              <TimestampRow label="UTC" value={ts.utc} copyText={ts.utc} />
              <TimestampRow label="本地时间" value={ts.local} copyText={ts.local} />
              <TimestampRow label="日期" value={ts.date} copyText={ts.date} />
              <TimestampRow label="时间" value={ts.time} copyText={ts.time} />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              当前时间自动更新，每秒刷新
            </div>
          </div>
        )}

        {/* ASCII Table Tab */}
        {activeTab === 'ascii' && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1 text-xs font-mono">
              {Array.from({ length: 95 }, (_, i) => i + 32).map(num => (
                <div key={num} className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-400 w-8">{num}</span>
                  <span className="text-gray-900 dark:text-gray-100">{String.fromCharCode(num)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color Converter Tab */}
        {activeTab === 'color' && (
          <ColorConverter />
        )}

        {/* HTTP Status Codes Tab */}
        {activeTab === 'http' && (
          <HttpStatusCodes />
        )}

        {/* Binary Converter Tab */}
        {activeTab === 'binary' && (
          <BinaryConverter />
        )}
      </div>
    </ToolLayout>
  );
}

function TimestampRow({ label, value, copyText }: { label: string; value: string | number; copyText: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">{value}</code>
        <CopyButton text={copyText} />
      </div>
    </div>
  );
}

function ColorConverter() {
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const handleHexChange = (value: string) => {
    setHex(value);
    const rgbVal = hexToRgb(value);
    if (rgbVal) {
      setRgb(rgbVal);
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
    }
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [component]: value };
    setRgb(newRgb);
    const hexVal = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
    setHex(hexVal);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg" style={{ backgroundColor: hex }}>
        <p className="text-center font-mono text-white text-shadow">{hex}</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HEX</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hex}
              onChange={e => handleHexChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
              placeholder="#000000"
            />
            <CopyButton text={hex} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['r', 'g', 'b'] as const).map(c => (
            <div key={c}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase">{c}: {rgb[c]}</label>
              <input
                type="range"
                min="0"
                max="255"
                value={rgb[c]}
                onChange={e => handleRgbChange(c, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RGB</label>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              rgb({rgb.r}, {rgb.g}, {rgb.b})
            </code>
            <CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HSL</label>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
            </code>
            <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HttpStatusCodes() {
  const statusCodes = [
    { code: 200, text: 'OK', desc: '请求成功' },
    { code: 201, text: 'Created', desc: '资源创建成功' },
    { code: 204, text: 'No Content', desc: '请求成功，无返回内容' },
    { code: 301, text: 'Moved Permanently', desc: '永久重定向' },
    { code: 302, text: 'Found', desc: '临时重定向' },
    { code: 304, text: 'Not Modified', desc: '缓存未修改' },
    { code: 400, text: 'Bad Request', desc: '请求语法错误' },
    { code: 401, text: 'Unauthorized', desc: '未授权，需要登录' },
    { code: 403, text: 'Forbidden', desc: '禁止访问' },
    { code: 404, text: 'Not Found', desc: '资源不存在' },
    { code: 405, text: 'Method Not Allowed', desc: '请求方法不允许' },
    { code: 429, text: 'Too Many Requests', desc: '请求过于频繁' },
    { code: 500, text: 'Internal Server Error', desc: '服务器内部错误' },
    { code: 502, text: 'Bad Gateway', desc: '网关错误' },
    { code: 503, text: 'Service Unavailable', desc: '服务不可用' },
    { code: 504, text: 'Gateway Timeout', desc: '网关超时' },
  ];

  return (
    <div className="grid gap-2">
      {statusCodes.map(status => (
        <div key={status.code} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="font-mono font-bold text-blue-500 w-12">{status.code}</span>
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{status.text}</span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">{status.desc}</span>
        </div>
      ))}
    </div>
  );
}

function BinaryConverter() {
  const [decimal, setDecimal] = useState(42);
  const [binary, setBinary] = useState('101010');
  const [hex, setHex] = useState('2A');
  const [octal, setOctal] = useState('52');

  const updateFromDecimal = (dec: number) => {
    setDecimal(dec);
    setBinary(dec.toString(2));
    setHex(dec.toString(16).toUpperCase());
    setOctal(dec.toString(8));
  };

  const updateFromBinary = (bin: string) => {
    setBinary(bin);
    const dec = parseInt(bin, 2);
    if (!isNaN(dec)) {
      setDecimal(dec);
      setHex(dec.toString(16).toUpperCase());
      setOctal(dec.toString(8));
    }
  };

  return (
    <div className="space-y-4">
      {[
        { label: '十进制 (Decimal)', value: decimal, onChange: (v: string) => updateFromDecimal(parseInt(v) || 0), base: 10 },
        { label: '二进制 (Binary)', value: binary, onChange: updateFromBinary, base: 2 },
        { label: '十六进制 (Hex)', value: hex, onChange: (v: string) => { const d = parseInt(v, 16); if (!isNaN(d)) updateFromDecimal(d); }, base: 16 },
        { label: '八进制 (Octal)', value: octal, onChange: (v: string) => { const d = parseInt(v, 8); if (!isNaN(d)) updateFromDecimal(d); }, base: 8 },
      ].map(item => (
        <div key={item.label}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{item.label}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={item.value}
              onChange={e => item.onChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
            />
            <CopyButton text={String(item.value)} />
          </div>
        </div>
      ))}
    </div>
  );
}
