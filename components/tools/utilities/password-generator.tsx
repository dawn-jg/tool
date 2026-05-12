'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    customSymbols: '!@#$%^&*',
  });
  const [password, setPassword] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    let chars = '';
    if (options.lowercase) chars += options.excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) chars += options.excludeAmbiguous ? 'ABCDEFGHJJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) chars += options.excludeAmbiguous ? '23456789' : '0123456789';
    if (options.symbols) chars += options.customSymbols || '!@#$%^&*';

    if (chars === '') {
      setPassword('请至少选择一种字符类型');
      return;
    }

    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(pwd);
    setHistory((prev) => [pwd, ...prev].slice(0, 20));
  }, [length, options]);

  const strength = useCallback(() => {
    if (!password) return { label: '未生成', color: 'text-gray-400', width: '0%' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: '弱', color: 'text-red-500', width: '25%' };
    if (score <= 4) return { label: '中', color: 'text-yellow-500', width: '50%' };
    if (score <= 5) return { label: '强', color: 'text-green-500', width: '75%' };
    return { label: '极强', color: 'text-emerald-500', width: '100%' };
  }, [password]);

  return (
    <ToolLayout
      title="密码生成器"
      description="生成安全的随机密码"
      instructions="设置密码长度和字符类型，点击生成。支持大小写字母、数字、特殊字符，可排除易混淆字符（0、O、l、1等）。"
      output={password || undefined}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">密码长度</span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="w-12 text-center font-mono font-bold text-lg">{length}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'uppercase', label: '大写字母 (A-Z)' },
            { key: 'lowercase', label: '小写字母 (a-z)' },
            { key: 'numbers', label: '数字 (0-9)' },
            { key: 'symbols', label: '特殊字符' },
            { key: 'excludeAmbiguous', label: '排除易混淆字符' },
          ].map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                options[opt.key as keyof typeof options]
                  ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={options[opt.key as keyof typeof options] as boolean}
                onChange={(e) => setOptions((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>

        {options.symbols && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">自定义特殊字符</label>
            <input
              type="text"
              value={options.customSymbols}
              onChange={(e) => setOptions((prev) => ({ ...prev, customSymbols: e.target.value }))}
              placeholder="!@#$%^&*"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={generate} className="btn-primary flex-1 py-3 text-base">
            🎲 生成密码
          </button>
          {password && password !== '请至少选择一种字符类型' && (
            <CopyButton text={password} />
          )}
        </div>

        {password && password !== '请至少选择一种字符类型' && (
          <>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>密码强度</span>
                <span className={strength().color}>{strength().label}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${strength().color.replace('text-', 'bg-')} transition-all duration-300`} style={{ width: strength().width }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 font-mono text-lg break-all text-gray-800 dark:text-gray-200">
              {password}
            </div>
          </>
        )}

        {history.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">历史记录</span>
              <button onClick={() => setHistory([])} className="text-xs text-gray-500 hover:text-red-500">清空</button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {history.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-mono text-gray-600 dark:text-gray-400 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span>{p}</span>
                  <button onClick={() => { navigator.clipboard.writeText(p); }} className="text-xs text-blue-500 hover:text-blue-600">复制</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}