'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function UrlEncoderDecoder() {
  const [input, setInput] = useState('');
  const [encoded, setEncoded] = useState('');
  const [decoded, setDecoded] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleEncode = useCallback(() => {
    try {
      const result = encodeURIComponent(input);
      setEncoded(result);
    } catch {
      setEncoded('编码错误');
    }
  }, [input]);

  const handleDecode = useCallback(() => {
    try {
      const result = decodeURIComponent(input);
      setDecoded(result);
    } catch {
      setDecoded('解码错误：输入不是有效的URL编码');
    }
  }, [input]);

  const handleComponentEncode = useCallback(() => {
    try {
      const result = encodeURI(input.replace(/%/g, '%25'));
      setEncoded(result);
    } catch {
      setEncoded('编码错误');
    }
  }, [input]);

  return (
    <ToolLayout
      title="URL 编码/解码器"
      description="URL特殊字符编码与解码工具"
      instructions="输入文本，选择编码或解码功能。encodeURIComponent 会编码所有特殊字符，适合编码URL参数。"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">输入</label>
        <textarea
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要编码或解码的文本..."
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={handleEncode} className="btn-primary">编码 (encodeURIComponent)</button>
        <button onClick={handleDecode} className="btn-secondary">解码 (decodeURIComponent)</button>
        <button onClick={handleComponentEncode} className="btn-secondary">完整编码 (encodeURI)</button>
      </div>

      {encoded && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">编码结果</label>
            <CopyButton text={encoded} />
          </div>
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
            {encoded}
          </div>
        </div>
      )}

      {decoded && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">解码结果</label>
            <CopyButton text={decoded} />
          </div>
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
            {decoded}
          </div>
        </div>
      )}

      {/* Common patterns */}
      <div className="mt-6">
        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">常见字符编码</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm font-mono">
          {[
            ['空格', ' ', '%20'],
            ['中文', '中文', '%E4%B8%AD%E6%96%87'],
            ['!', '!', '%21'],
            ['#', '#', '%23'],
            ['$', '$', '%24'],
            ['&', '&', '%26'],
            ['+', '+', '%2B'],
            [':', ':', '%3A'],
          ].map(([name, char, code]) => (
            <div key={name} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
              <span className="text-gray-600 dark:text-gray-400">{name}</span>
              <span className="text-blue-600 dark:text-blue-400">{code}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
