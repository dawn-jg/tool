'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function RandomPassword() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');

  const generate = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const dig = '0123456789';
    const sym = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let chars = '';
    if (uppercase) chars += upper;
    if (lowercase) chars += lower;
    if (digits) chars += dig;
    if (symbols) chars += sym;
    if (!chars) chars = lower;

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    const result = Array.from(arr, (n) => chars[n % chars.length]).join('');
    setPassword(result);
  }, [length, uppercase, lowercase, digits, symbols]);

  const strength = (() => {
    let score = 0;
    if (uppercase) score++;
    if (lowercase) score++;
    if (digits) score++;
    if (symbols) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (score >= 5) return { text: '非常强', color: 'text-green-600' };
    if (score >= 3) return { text: '强', color: 'text-green-500' };
    if (score >= 2) return { text: '一般', color: 'text-yellow-500' };
    return { text: '弱', color: 'text-red-500' };
  })();

  return (
    <ToolLayout
      title="随机密码生成器"
      description="生成高强度的随机密码"
      instructions="设置密码长度和包含的字符类型（大写字母、小写字母、数字、特殊符号），点击生成获得随机密码。使用浏览器原生crypto.getRandomValues保证密码的加密安全性。"
      output={password || undefined}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium w-20">长度</label>
          <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="flex-1" />
          <span className="text-sm font-mono w-8 text-center">{length}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {([
            { key: 'uppercase', val: uppercase, set: setUppercase, label: '大写字母' },
            { key: 'lowercase', val: lowercase, set: setLowercase, label: '小写字母' },
            { key: 'digits', val: digits, set: setDigits, label: '数字' },
            { key: 'symbols', val: symbols, set: setSymbols, label: '特殊符号' },
          ] as const).map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={opt.val} onChange={(e) => opt.set(e.target.checked)} className="rounded" />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={generate} className="btn-primary">生成密码</button>
          {password && <CopyButton text={password} />}
          {password && <span className={`text-sm font-medium ${strength.color}`}>强度: {strength.text}</span>}
        </div>
      </div>
    </ToolLayout>
  );
}
