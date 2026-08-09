'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

const POSITIONS = [
  { value: 'center', label: '居中' },
  { value: 'top', label: '顶部' },
  { value: 'bottom', label: '底部' },
];

export function PdfWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [wmText, setWmText] = useState('机密');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(30);
  const [position, setPosition] = useState('center');
  const [rotate, setRotate] = useState(-30);
  const [tiled, setTiled] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const limiter = useToolLimiter({ toolKey: 'pdfwm' });
  const { checkLimit, markUsed } = limiter;

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('请选择 PDF 文件');
      return;
    }
    setFile(f);
    setResultUrl('');
    setError('');
  }, []);

  const apply = useCallback(async () => {
    if (!file) return;
    if (!checkLimit()) return;
    setConverting(true);
    setError('');
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();

      for (const page of pages) {
        const { width: w, height: h } = page.getSize();

        if (tiled) {
          // Diagonal tiled watermark
          const textWidth = (wmText.length * fontSize) / 1.8;
          const textHeight = fontSize;
          const spacingX = textWidth + 60;
          const spacingY = textHeight * 2.2;
          for (let y = -h; y < h * 2; y += spacingY) {
            for (let x = -w; x < w * 2; x += spacingX) {
              page.drawText(wmText, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(0.5, 0.5, 0.5),
                opacity: opacity / 100,
                rotate: degrees(rotate),
              });
            }
          }
        } else {
          let x = 0;
          let y = 0;
          const textWidth = (wmText.length * fontSize) / 1.8;
          switch (position) {
            case 'top':
              x = (w - textWidth) / 2;
              y = h - fontSize - 10;
              break;
            case 'bottom':
              x = (w - textWidth) / 2;
              y = 10;
              break;
            default:
              x = (w - textWidth) / 2;
              y = (h - fontSize) / 2;
          }
          page.drawText(wmText, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity: opacity / 100,
            rotate: degrees(rotate),
          });
        }
      }

      const newBytes = await pdf.save();
      const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
      markUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加水印失败，PDF 可能已加密或损坏');
    } finally {
      setConverting(false);
    }
  }, [file, wmText, fontSize, opacity, position, rotate, tiled, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${(file?.name || 'pdf').replace(/\.[^.]+$/, '')}_watermarked.pdf`;
    a.click();
  }, [resultUrl, file]);

  return (
    <ToolLayout
      title="PDF 加水印"
      description="在线给 PDF 添加文字水印，支持单页居中、顶部、底部和平铺斜纹模式，纯浏览器处理"
      instructions="上传 PDF 文件，输入水印文字，设置字号、透明度和位置，点击添加水印后下载。文件全程在浏览器本地处理，不会上传。"
    >
      {/* Upload */}
      {!file && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传 PDF</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input type="file" accept="application/pdf,.pdf" onChange={handleFile} className="hidden" id="pdfwm-upload" />
            <label htmlFor="pdfwm-upload" className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-400">点击选择 PDF 文件</p>
            </label>
          </div>
        </div>
      )}

      {file && (
        <>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">已选择：{file.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">水印文字</label>
              <input
                type="text"
                value={wmText}
                onChange={(e) => setWmText(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">字号：{fontSize}pt</label>
              <input
                type="range"
                min={12}
                max={120}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">透明度：{opacity}%</label>
              <input
                type="range"
                min={5}
                max={80}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">位置</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">旋转角度：{rotate}°</label>
              <input
                type="range"
                min={-90}
                max={90}
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={tiled} onChange={(e) => setTiled(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">平铺（斜向铺满每一页）</span>
          </label>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={apply} disabled={converting} className="btn-primary">
              {converting ? '处理中...' : '添加水印'}
            </button>
            {resultUrl && (
              <button onClick={download} className="btn-primary px-6">
                下载 PDF
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        </>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
