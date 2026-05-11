'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function YamlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json2yaml' | 'yaml2json'>('json2yaml');
  const [error, setError] = useState('');

  // Basic JSON → YAML
  const jsonToYaml = (obj: unknown, depth = 0): string => {
    const pad = '  '.repeat(depth);
    if (obj === null) return 'null';
    if (typeof obj === 'string') return `"${obj}"`;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map((item) => `${pad}- ${jsonToYaml(item, depth + 1).replace(/^${'  '.repeat(depth + 1)}/, '')}`).join('\n');
    }
    if (typeof obj === 'object') {
      const keys = Object.keys(obj as Record<string, unknown>);
      if (keys.length === 0) return '{}';
      return keys.map((key) => `${pad}${key}: ${jsonToYaml((obj as Record<string, unknown>)[key], depth + 1)}`).join('\n');
    }
    return String(obj);
  };

  // Basic YAML → JSON (simple key: value pairs)
  const yamlToJson = (yaml: string): unknown => {
    const lines = yaml.split('\n').filter((l) => l.trim());
    const parseValue = (v: string): unknown => {
      v = v.trim();
      if (v === 'null' || v === '~') return null;
      if (v === 'true') return true;
      if (v === 'false') return false;
      if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
      if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
      return v;
    };

    const result: Record<string, unknown> = {};
    const stack: { obj: Record<string, unknown>; indent: number }[] = [{ obj: result, indent: -1 }];

    for (const line of lines) {
      const indent = line.search(/\S/);
      const content = line.trim();
      if (content.startsWith('#')) continue;

      // Array item
      if (content.startsWith('- ')) {
        const arr: unknown[] = [];
        const val = parseValue(content.slice(2));
        arr.push(val ?? content.slice(2));
        // Find parent to attach
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
        const parent = stack[stack.length - 1].obj;
        const parentKey = Object.keys(parent).pop();
        if (parentKey) {
          const existing = parent[parentKey];
          if (Array.isArray(existing)) {
            existing.push(val ?? content.slice(2));
          } else {
            parent[parentKey] = [existing, val ?? content.slice(2)].filter((x) => x !== undefined);
          }
        }
        continue;
      }

      const colonIdx = content.indexOf(':');
      if (colonIdx === -1) continue;
      const key = content.slice(0, colonIdx).trim();
      const val = content.slice(colonIdx + 1).trim();

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const current = stack[stack.length - 1].obj;

      if (val === '') {
        const nested: Record<string, unknown> = {};
        current[key] = nested;
        stack.push({ obj: nested, indent });
      } else {
        current[key] = parseValue(val);
      }
    }

    return result;
  };

  const convert = () => {
    setError('');
    try {
      if (mode === 'json2yaml') {
        const parsed = JSON.parse(input);
        setOutput(jsonToYaml(parsed));
      } else {
        const parsed = yamlToJson(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  return (
    <ToolLayout
      title="YAML / JSON 互转"
      description="YAML与JSON格式互相转换工具"
      instructions="选择转换方向，粘贴数据到输入框，点击转换即可。支持嵌套对象和数组的互转。YAML转JSON目前支持简单的键值对和数组格式。"
      output={output}
    >
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode('json2yaml'); setOutput(''); setError(''); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'json2yaml' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          JSON → YAML
        </button>
        <button
          onClick={() => { setMode('yaml2json'); setOutput(''); setError(''); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'yaml2json' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          YAML → JSON
        </button>
      </div>
      <textarea
        className="w-full h-48 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'json2yaml' ? '{"key": "value"}' : 'key: value'}
      />
      <div className="flex items-center gap-2 mt-4">
        <button onClick={convert} className="btn-primary">转换</button>
        {output && <CopyButton text={output} />}
      </div>
      {error && <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">{error}</div>}
    </ToolLayout>
  );
}
