'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';
import JSZip from 'jszip';

interface ZipFile {
  name: string;
  data: Blob;
  size: number;
}

export function ZipCreator() {
  const [files, setFiles] = useState<ZipFile[]>([]);
  const [textFileMode, setTextFileMode] = useState(false);
  const [textFileName, setTextFileName] = useState('note.txt');
  const [textContent, setTextContent] = useState('');
  const [zipName, setZipName] = useState('archive');
  const [compression, setCompression] = useState<'STORE' | 'DEFLATE'>('DEFLATE');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');
  const limiter = useToolLimiter({ toolKey: 'zipmake' });
  const { checkLimit, markUsed } = limiter;

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setCreatedUrl('');
    setFiles((prev) => [...prev, ...list.map((f) => ({ name: f.name, data: f, size: f.size }))]);
  }, []);

  const addTextFile = useCallback(() => {
    if (!textContent && textFileMode) return;
    setCreatedUrl('');
    setFiles((prev) => [...prev, { name: textFileName || 'note.txt', data: new Blob([textContent], { type: 'text/plain' }), size: textContent.length }]);
    setTextContent('');
  }, [textContent, textFileName, textFileMode]);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setCreatedUrl('');
  }, []);

  const createZip = useCallback(async () => {
    if (!files.length) return;
    if (!checkLimit()) return;
    setCreating(true);
    setError('');
    try {
      const zip = new JSZip();
      for (const f of files) {
        zip.file(f.name, f.data);
      }
      const blob = await zip.generateAsync({
        type: 'blob',
        compression,
        compressionOptions: compression === 'DEFLATE' ? { level: 6 } : undefined,
      });
      const url = URL.createObjectURL(blob);
      setCreatedUrl(url);
      markUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ZIP 创建失败');
    } finally {
      setCreating(false);
    }
  }, [files, compression, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!createdUrl) return;
    const a = document.createElement('a');
    a.href = createdUrl;
    a.download = `${zipName || 'archive'}.zip`;
    a.click();
  }, [createdUrl, zipName]);

  return (
    <ToolLayout
      title="创建 ZIP 压缩包"
      description="在线创建 ZIP 压缩文件，支持添加多个文件、压缩级别选择、添加文本文件，纯浏览器处理"
      instructions="上传文件（可多选）或添加文本文件，设置压缩方式，点击创建 ZIP 即可下载。文件全程在浏览器本地处理，不会上传。"
    >
      {/* Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">添加文件（可多选）</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
          <input type="file" multiple onChange={handleFiles} className="hidden" id="zip-upload" />
          <label htmlFor="zip-upload" className="cursor-pointer">
            <p className="text-gray-600 dark:text-gray-400">点击选择文件，可多选</p>
          </label>
        </div>
      </div>

      {/* Text file adder */}
      <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={textFileMode}
            onChange={(e) => setTextFileMode(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">添加一个文本文件</span>
        </div>
        {textFileMode && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={textFileName}
                onChange={(e) => setTextFileName(e.target.value)}
                placeholder="文件名.txt"
                className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
              <button onClick={addTextFile} className="btn-secondary">
                添加到列表
              </button>
            </div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="输入文本内容..."
              className="w-full h-24 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">压缩包名称</label>
          <input
            type="text"
            value={zipName}
            onChange={(e) => setZipName(e.target.value)}
            className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">压缩方式</label>
          <select
            value={compression}
            onChange={(e) => setCompression(e.target.value as 'STORE' | 'DEFLATE')}
            className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="DEFLATE">标准压缩 (DEFLATE)</option>
            <option value="STORE">仅存储不压缩 (STORE)</option>
          </select>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">文件列表（{files.length} 个，共 {(files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(1)} KB）</p>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{f.name}</span>
              <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</span>
              <button onClick={() => removeFile(i)} className="px-2 py-1 text-xs rounded bg-red-50 dark:bg-red-900/30 text-red-500">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={createZip} disabled={creating || !files.length} className="btn-primary">
          {creating ? '创建中...' : `创建 ZIP（${files.length} 个文件）`}
        </button>
        {createdUrl && (
          <button onClick={download} className="btn-primary px-6">
            下载 {zipName || 'archive'}.zip
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
