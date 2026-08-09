'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';
import JSZip from 'jszip';

const SCALES = [
  { value: 1, label: '标准 (1x)' },
  { value: 2, label: '高清 (2x)' },
  { value: 3, label: '超清 (3x)' },
];

const FORMATS = [
  { value: 'image/png', ext: 'png', label: 'PNG' },
  { value: 'image/jpeg', ext: 'jpg', label: 'JPG' },
];

export function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState('image/png');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const limiter = useToolLimiter({ toolKey: 'pdftoimg' });
  const { checkLimit, markUsed } = limiter;

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('请选择 PDF 文件');
      return;
    }
    setFile(f);
    setPages([]);
    setPageCount(0);
    setError('');
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    if (!checkLimit()) return;
    setConverting(true);
    setError('');
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const data = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data }).promise;
      setPageCount(pdf.numPages);

      const results: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvas context unavailable');
        const renderContext = {
          canvasContext: ctx,
          viewport,
        };
        await page.render(renderContext).promise;
        results.push(canvas.toDataURL(format, 0.92));
        // yield to UI
        await new Promise((r) => setTimeout(r, 0));
      }
      setPages(results);
      markUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF 解析失败，请确认文件未损坏');
    } finally {
      setConverting(false);
    }
  }, [file, scale, format, checkLimit, markUsed]);

  const ext = FORMATS.find((f) => f.value === format)?.ext || 'png';

  const downloadOne = useCallback(
    (url: string, i: number) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `page_${i + 1}.${ext}`;
      a.click();
    },
    [ext]
  );

  const downloadAll = useCallback(async () => {
    if (!pages.length) return;
    const zip = new JSZip();
    pages.forEach((url, i) => {
      const base64 = url.split(',')[1] || '';
      zip.file(`page_${i + 1}.${ext}`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(file?.name || 'pdf').replace(/\.[^.]+$/, '')}_pages.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [pages, ext, file]);

  return (
    <ToolLayout
      title="PDF 转图片"
      description="在线将 PDF 每页转为 PNG/JPG 图片，支持高清导出和打包下载，纯浏览器处理"
      instructions="上传 PDF 文件，选择导出比例（1x/2x/3x）和图片格式（PNG/JPG），点击转换后逐页预览，可单页下载或打包 ZIP 下载。文件不会上传到服务器。"
    >
      {/* Upload */}
      {!file && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传 PDF</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input type="file" accept="application/pdf,.pdf" onChange={handleFile} className="hidden" id="pdf2img-upload" />
            <label htmlFor="pdf2img-upload" className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-400">点击选择 PDF 文件</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">转换在浏览器本地完成，不上传文件</p>
            </label>
          </div>
        </div>
      )}

      {file && (
        <>
          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">导出比例</label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {SCALES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">图片格式</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={convert} disabled={converting} className="btn-primary">
              {converting ? `转换中...${pageCount ? `（已处理 ${pages.length}/${pageCount} 页）` : ''}` : '开始转换'}
            </button>
            {pages.length > 0 && (
              <button onClick={downloadAll} className="btn-primary px-6">
                打包下载 ZIP（{pages.length} 页）
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {file && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">已选择：{file.name}（{Math.round(file.size / 1024)} KB）</p>}

          {/* Results */}
          {pages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">转换结果（{pages.length} 页）</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pages.map((url, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-2" style={{ minHeight: 140 }}>
                      <img src={url} alt={`第 ${i + 1} 页`} className="max-w-full max-h-40 object-contain" />
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">第 {i + 1} 页</span>
                      <button onClick={() => downloadOne(url, i)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        下载
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
