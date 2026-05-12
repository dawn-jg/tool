'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const defaultJson = `{
  "store": {
    "book": [
      { "category": "fiction", "author": "鲁迅", "title": "呐喊", "price": 8.95 },
      { "category": "fiction", "author": "老舍", "title": "骆驼祥子", "price": 12.99 },
      { "category": "programming", "author": "张三", "title": "JavaScript高级", "price": 39.95 },
      { "category": "science", "author": "李四", "title": "物理入门", "price": 19.95 }
    ],
    "bicycle": { "color": "red", "price": 399.00 }
  }
}`;

function simpleJsonPath(obj: any, path: string): any[] {
  const cleanPath = path.replace(/^\$\.?/, '').replace(/^\./, '');
  if (!cleanPath) return [obj];
  
  const results: any[] = [];
  const parts = cleanPath.split(/\./);
  
  function traverse(current: any, partIndex: number) {
    if (partIndex >= parts.length) {
      results.push(current);
      return;
    }
    
    const part = parts[partIndex];
    
    // Check for array index access like [0] or ['key'] or ["key"]
    const arrayMatch = part.match(/^\[(-?\d+|'([^']+)'|"([^"]+)")\]$/);
    if (arrayMatch) {
      const idxStr = arrayMatch[1];
      const keyStr = arrayMatch[2] || arrayMatch[3];
      
      if (idxStr !== undefined) {
        // Numeric index for arrays
        const idx = parseInt(idxStr, 10);
        if (Array.isArray(current) && idx >= 0 && idx < current.length) {
          traverse(current[idx], partIndex + 1);
        } else if (idx < 0 && Array.isArray(current) && current.length + idx >= 0) {
          traverse(current[current.length + idx], partIndex + 1);
        }
      } else if (keyStr !== undefined) {
        // String key for objects
        if (current && typeof current === 'object' && keyStr in current) {
          traverse(current[keyStr], partIndex + 1);
        }
      } else {
        // Wildcard [*]
        if (Array.isArray(current)) {
          current.forEach(item => traverse(item, partIndex + 1));
        } else if (current && typeof current === 'object') {
          Object.values(current).forEach(val => traverse(val, partIndex + 1));
        }
      }
      return;
    }
    
    // Object key access
    if (current && typeof current === 'object') {
      if (Array.isArray(current)) {
        current.forEach(item => traverse(item, partIndex));
      } else if (part in current) {
        traverse(current[part], partIndex + 1);
      }
    }
  }
  
  traverse(obj, 0);
  return results;
}

function getResultType(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `Array[${value.length}]`;
  return typeof value;
}

export function JsonPathQuery() {
  const [json, setJson] = useState(defaultJson);
  const [path, setPath] = useState('$.store.book[*].author');
  const [result, setResult] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [jsonError, setJsonError] = useState('');

  const execute = useCallback(() => {
    setError('');
    setResult([]);
    
    try {
      const parsed = JSON.parse(json);
      setJsonError('');
      try {
        const queryResults = simpleJsonPath(parsed, path);
        setResult(queryResults);
      } catch (e: any) {
        setError(`查询错误: ${e.message}`);
      }
    } catch (e: any) {
      setJsonError(`JSON 解析错误: ${e.message}`);
    }
  }, [json, path]);

  const formatResult = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const commonPaths = [
    { label: '所有book作者', path: '$.store.book[*].author' },
    { label: '第一本书', path: '$.store.book[0]' },
    { label: '所有价格', path: '$.store.book[*].price' },
    { label: '自行车', path: '$.store.bicycle' },
    { label: '最后一本', path: '$.store.book[-1]' },
  ];

  return (
    <ToolLayout
      title="JSON Path 查询器"
      description="使用JSONPath语法从JSON数据中提取字段"
      instructions="输入JSON数据，输入JSONPath查询表达式，点击执行。支持 $.store.book[0].title、$.store.book[*].author 等常见查询语法。"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">JSON 数据</label>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className={`w-full p-3 rounded-lg border font-mono text-sm h-48 resize-none focus:ring-2 focus:ring-blue-500 outline-none ${
            jsonError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}
          placeholder="输入 JSON 数据..."
        />
        {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">JSONPath 查询</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="$.store.book[*].author"
          />
          <button onClick={execute} className="btn-primary px-6">执行</button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">常用路径</label>
        <div className="flex flex-wrap gap-2">
          {commonPaths.map((cp) => (
            <button
              key={cp.path}
              onClick={() => setPath(cp.path)}
              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600"
            >
              {cp.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {result.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              查询结果 ({result.length} 项)
            </p>
            <CopyButton text={JSON.stringify(result, null, 2)} />
          </div>
          <div className="space-y-2">
            {result.map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">[{i}]</span>
                  <span className="text-xs text-gray-500">{getResultType(item)}</span>
                </div>
                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                  {formatResult(item)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
