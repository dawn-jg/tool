'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    const uuid = crypto.randomUUID();
    setUuids((prev) => [uuid, ...prev].slice(0, 20));
  }, []);

  const generateBulk = useCallback(() => {
    const bulk = Array.from({ length: 10 }, () => crypto.randomUUID());
    setUuids((prev) => [...bulk, ...prev].slice(0, 50));
  }, []);

  const output = uuids.join('\n');

  return (
    <ToolLayout
      title="UUID 生成器"
      description="在线生成UUID v4唯一标识符"
      instructions="点击生成按钮创建UUID v4格式的唯一标识符。支持单个生成和批量生成（10个）。生成的UUID可以复制使用。"
      output={uuids.length > 0 ? output : undefined}
    >
      <div className="flex items-center gap-2 mb-4">
        <button onClick={generate} className="btn-primary">生成 UUID</button>
        <button onClick={generateBulk} className="btn-secondary">批量生成 10 个</button>
        {uuids.length > 0 && <CopyButton text={output} />}
      </div>
      {uuids.length > 0 && (
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-800 dark:text-gray-200 max-h-96 overflow-auto">
          {uuids.map((id, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5">
              <span className="text-gray-400 w-6 text-right">{i + 1}.</span>
              <span>{id}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
