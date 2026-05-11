'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function JwtDecoder() {
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [error, setError] = useState('');

  const decode = useCallback(() => {
    setError('');
    setHeader('');
    setPayload('');

    const parts = input.trim().split('.');
    if (parts.length !== 3) {
      setError('无效的JWT格式，JWT应包含 header.payload.signature 三部分，用点号分隔');
      return;
    }

    try {
      const decodePart = (str: string) => {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(str);
        return JSON.stringify(JSON.parse(json), null, 2);
      };

      setHeader(decodePart(parts[0]));
      setPayload(decodePart(parts[1]));
    } catch {
      setError('解码失败，请检查JWT格式是否正确');
    }
  }, [input]);

  return (
    <ToolLayout
      title="JWT 解码"
      description="在线解码JWT Token的Header和Payload"
      instructions="粘贴JWT Token到输入框，点击解码即可查看Header和Payload内容。注意：此工具仅解码查看，不验证签名有效性。JWT由 Header.Payload.Signature 三部分组成。"
    >
      <textarea
        className="w-full h-32 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
      />
      <button onClick={decode} className="btn-primary mt-4">解码</button>
      {error && <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">{error}</div>}
      {header && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Header</h4>
            <CopyButton text={header} />
          </div>
          <pre className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-800 dark:text-gray-200 overflow-auto">{header}</pre>
        </div>
      )}
      {payload && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Payload</h4>
            <CopyButton text={payload} />
          </div>
          <pre className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-800 dark:text-gray-200 overflow-auto">{payload}</pre>
        </div>
      )}
    </ToolLayout>
  );
}
