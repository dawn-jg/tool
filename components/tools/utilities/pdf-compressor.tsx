'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';
import { PDFDocument } from 'pdf-lib';

export function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const limiter = useToolLimiter({ toolKey: 'pdfcompress' });
  const { checkLimit, markUsed } = limiter;

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('请选择 PDF 文件');
      return;
    }
    setFile(f);
    setOriginalSize(f.size);
    setCompressedSize(0);
    setResultUrl('');
    setError('');
  }, []);

  const compress = useCallback(async () => {
    if (!file) return;
    if (!checkLimit()) return;
    setCompressing(true);
    setError('');
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

      // Recompress: strip unused objects & rebuild structure
      const newBytes = await pdf.save({ useObjectStreams: true });

      const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' });
      setCompressedSize(blob.size);
      setResultUrl(URL.createObjectURL(blob));
      markUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : '压缩失败，PDF 可能已加密或损坏');
    } finally {
      setCompressing(false);
    }
  }, [file, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${(file?.name || 'pdf').replace(/\.[^.]+$/, '')}_compressed.pdf`;
    a.click();
  }, [resultUrl, file]);

  const ratio = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <ToolLayout
      title="PDF 压缩"
      description="在线压缩 PDF 文件，去除冗余数据、优化结构减小体积，显示压缩前后对比，纯浏览器处理"
      instructions="上传 PDF 文件，点击压缩按钮。工具会通过重新构建 PDF 结构、去除冗余对象来减小文件体积。压缩在浏览器本地完成，文件不会上传。注意：包含大量图片的 PDF 压缩效果有限，图片压缩请使用图片压缩工具。"
    >
      {/* Upload */}
      {!file && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传 PDF</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input type="file" accept="application/pdf,.pdf" onChange={handleFile} className="hidden" id="pdfc-upload" />
            <label htmlFor="pdfc-upload" className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-400">点击选择 PDF 文件</p>
            </label>
          </div>
        </div>
      )}

      {file && (
        <>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">已选择：{file.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              原始大小：{(originalSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={compress} disabled={compressing} className="btn-primary">
              {compressing ? '压缩中...' : '开始压缩'}
            </button>
            {resultUrl && (
              <button onClick={download} className="btn-primary px-6">
                下载压缩后 PDF
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {resultUrl && compressedSize > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">原始大小</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{(originalSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="p-4 rounded-lg border border-green-200 dark:border-green-900 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">压缩后</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{(compressedSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">节省</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{ratio}%</p>
              </div>
            </div>
          )}
        </>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
