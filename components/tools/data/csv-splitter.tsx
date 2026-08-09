'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';

interface SplitPart {
  name: string;
  content: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cell);
        cell = '';
      } else if (ch === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      } else if (ch === '\r') {
        // skip, handle \r\n
      } else {
        cell += ch;
      }
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function toCsv(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          if (/[",\n\r]/.test(c)) return '"' + c.replace(/"/g, '""') + '"';
          return c;
        })
        .join(',')
    )
    .join('\n');
}

function sanitizeName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_');
}

export function CsvSplitter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'rows' | 'columns'>('rows');
  const [rowsPerFile, setRowsPerFile] = useState(100);
  const [columnsPerFile, setColumnsPerFile] = useState(2);
  const [hasHeader, setHasHeader] = useState(true);
  const [parts, setParts] = useState<SplitPart[]>([]);
  const [error, setError] = useState('');
  const limiter = useToolLimiter({ toolKey: 'csvsplit' });
  const { checkLimit, markUsed } = limiter;

  const split = useCallback(() => {
    if (!input.trim()) return;
    if (!checkLimit()) return;
    setError('');
    try {
      const rows = parseCsv(input);
      if (rows.length === 0) {
        setError('未解析到数据行');
        return;
      }
      const header = hasHeader ? rows[0] : null;
      const dataRows = hasHeader ? rows.slice(1) : rows;

      let result: SplitPart[] = [];

      if (mode === 'rows') {
        const per = Math.max(1, rowsPerFile);
        for (let i = 0; i < dataRows.length; i += per) {
          const chunk = dataRows.slice(i, i + per);
          const out = header ? [header, ...chunk] : chunk;
          result.push({
            name: `part_${Math.floor(i / per) + 1}.csv`,
            content: toCsv(out),
          });
        }
      } else {
        // columns mode: split by column groups
        const per = Math.max(1, columnsPerFile);
        const totalCols = header ? header.length : Math.max(...dataRows.map((r) => r.length));
        for (let start = 0; start < totalCols; start += per) {
          const end = Math.min(start + per, totalCols);
          const outRows = (header ? [header] : []).concat(dataRows).map((r) => r.slice(start, end));
          result.push({
            name: `columns_${start + 1}-${end}.csv`,
            content: toCsv(outRows),
          });
        }
      }

      setParts(result);
      markUsed();
    } catch (e) {
      setError(e instanceof Error ? e.message : '拆分失败，请检查 CSV 格式');
    }
  }, [input, mode, rowsPerFile, columnsPerFile, hasHeader, checkLimit, markUsed]);

  const downloadAll = useCallback(() => {
    parts.forEach((p) => {
      const a = document.createElement('a');
      const blob = new Blob(['\ufeff' + p.content], { type: 'text/csv;charset=utf-8' });
      a.href = URL.createObjectURL(blob);
      a.download = sanitizeName(p.name);
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }, [parts]);

  return (
    <ToolLayout
      title="CSV 拆分工具"
      description="在线拆分 CSV 文件，支持按行数拆分和按列分组拆分，保留表头，纯浏览器处理"
      instructions="粘贴 CSV 内容，选择拆分方式（按行数或按列分组），设置每份大小，点击拆分后即可分别下载。数据全程在浏览器本地处理。"
    >
      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">CSV 内容</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'name,age,city,email\n张三,28,北京,zhang@example.com\n李四,32,上海,li@example.com'}
          className="w-full h-48 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">拆分方式</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'rows' | 'columns')}
            className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="rows">按行数拆分</option>
            <option value="columns">按列分组拆分</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            {mode === 'rows' ? '每份行数' : '每组列数'}
          </label>
          <input
            type="number"
            min={1}
            max={100000}
            value={mode === 'rows' ? rowsPerFile : columnsPerFile}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (mode === 'rows') setRowsPerFile(v);
              else setColumnsPerFile(v);
            }}
            className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="w-4 h-4 rounded" />
        <span className="text-sm text-gray-700 dark:text-gray-300">第一行是表头（每份保留）</span>
      </label>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={split} className="btn-primary">
          拆分
        </button>
        <button onClick={() => setInput('')} className="btn-secondary">
          清空
        </button>
        {parts.length > 0 && (
          <button onClick={downloadAll} className="btn-primary px-6">
            下载全部（{parts.length} 份）
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Results */}
      {parts.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">拆分结果</label>
          <div className="space-y-2">
            {parts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{p.name}</span>
                <span className="text-xs text-gray-400">{(p.content.length / 1024).toFixed(1)} KB</span>
                <a
                  href={URL.createObjectURL(new Blob(['\ufeff' + p.content], { type: 'text/csv;charset=utf-8' }))}
                  download={sanitizeName(p.name)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={(e) => {
                    // revoke later
                    setTimeout(() => URL.revokeObjectURL((e.currentTarget as HTMLAnchorElement).href), 5000);
                  }}
                >
                  下载
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
