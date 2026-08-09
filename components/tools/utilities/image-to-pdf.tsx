'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';
import { PDFDocument } from 'pdf-lib';

const PAGE_SIZES = [
  { value: 'auto', label: '适应图片大小' },
  { value: 'a4', label: 'A4 纵向' },
  { value: 'a4l', label: 'A4 横向' },
  { value: 'letter', label: 'Letter 纵向' },
];

interface ImgItem {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export function ImageToPdf() {
  const [images, setImages] = useState<ImgItem[]>([]);
  const [pageSize, setPageSize] = useState('auto');
  const [margin, setMargin] = useState(10); // mm-ish (points: 20 default)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const limiter = useToolLimiter({ toolKey: 'imgtopdf' });
  const { checkLimit, markUsed } = limiter;

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setResultUrl('');
    setError('');
    const tasks = list.map(
      (f) =>
        new Promise<ImgItem>((resolve, reject) => {
          const r = new FileReader();
          r.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              resolve({ name: f.name, dataUrl: ev.target?.result as string, width: img.width, height: img.height });
            };
            img.onerror = () => reject(new Error(`${f.name} 无法解析`));
            img.src = ev.target?.result as string;
          };
          r.onerror = () => reject(new Error(`${f.name} 读取失败`));
          r.readAsDataURL(f);
        })
    );
    Promise.all(tasks)
      .then((items) => {
        setImages((prev) => [...prev, ...items]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '图片加载失败'));
  }, []);

  const removeImage = useCallback((idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setResultUrl('');
  }, []);

  const moveImage = useCallback((idx: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setResultUrl('');
  }, []);

  const convert = useCallback(async () => {
    if (!images.length) return;
    if (!checkLimit()) return;
    setConverting(true);
    setError('');
    try {
      const doc = await PDFDocument.create();
      const marginPt = margin * 2.835; // mm to pt approx

      for (const img of images) {
        // Determine page size
        let pageW = 0;
        let pageH = 0;
        const A4_PT = [595.28, 841.89];
        const LETTER_PT = [612, 792];

        if (pageSize === 'a4' || pageSize === 'a4l') {
          const portrait = pageSize === 'a4' ? true : orientation === 'portrait';
          pageW = portrait ? A4_PT[0] : A4_PT[1];
          pageH = portrait ? A4_PT[1] : A4_PT[0];
        } else if (pageSize === 'letter') {
          pageW = LETTER_PT[0];
          pageH = LETTER_PT[1];
        } else {
          pageW = img.width;
          pageH = img.height;
        }

        // Load image
        let pdfImage;
        if (img.dataUrl.startsWith('data:image/png')) {
          const pngBytes = await fetch(img.dataUrl).then((r) => r.arrayBuffer());
          pdfImage = await doc.embedPng(pngBytes);
        } else if (img.dataUrl.startsWith('data:image/jpeg')) {
          const jpgBytes = await fetch(img.dataUrl).then((r) => r.arrayBuffer());
          pdfImage = await doc.embedJpg(jpgBytes);
        } else {
          // Convert others (webp/gif/bmp) via canvas to PNG
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('canvas unavailable');
          const temp = new Image();
          await new Promise<void>((resolve, reject) => {
            temp.onload = () => {
              ctx.drawImage(temp, 0, 0);
              resolve();
            };
            temp.onerror = () => reject(new Error(`${img.name} 无法解析`));
            temp.src = img.dataUrl;
          });
          const pngData = canvas.toDataURL('image/png');
          const pngBytes = await fetch(pngData).then((r) => r.arrayBuffer());
          pdfImage = await doc.embedPng(pngBytes);
        }

        // Compute fit
        const availW = Math.max(50, pageW - marginPt * 2);
        const availH = Math.max(50, pageH - marginPt * 2);
        const scale = Math.min(availW / pdfImage.width, availH / pdfImage.height);
        const drawW = pdfImage.width * scale;
        const drawH = pdfImage.height * scale;

        const page = doc.addPage([pageW, pageH]);
        page.drawImage(pdfImage, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      markUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF 生成失败');
    } finally {
      setConverting(false);
    }
  }, [images, pageSize, orientation, margin, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'images.pdf';
    a.click();
  }, [resultUrl]);

  return (
    <ToolLayout
      title="图片转 PDF"
      description="在线将多张图片合成为一个 PDF 文件，支持 PNG/JPG/WebP/GIF，可调整页面大小和边距，纯浏览器处理"
      instructions="上传一张或多张图片，可选择页面尺寸（A4/Letter/适应图片）和边距，拖动调整顺序，点击生成 PDF 后下载。图片不会上传到服务器。"
    >
      {/* Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传图片（可多选，支持 PNG/JPG/WebP/GIF/BMP）</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" id="img2pdf-upload" />
          <label htmlFor="img2pdf-upload" className="cursor-pointer">
            <p className="text-gray-600 dark:text-gray-400">点击选择图片，可多选</p>
          </label>
        </div>
      </div>

      {images.length > 0 && (
        <>
          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">页面尺寸</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">边距：{margin}mm</label>
              <input
                type="range"
                min={0}
                max={30}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>
            {pageSize === 'a4l' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">A4 方向</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                  className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="portrait">纵向</option>
                  <option value="landscape">横向</option>
                </select>
              </div>
            )}
          </div>

          {/* Image list */}
          <div className="mb-4 space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <img src={img.dataUrl} alt={img.name} className="w-14 h-14 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{img.name}</p>
                  <p className="text-xs text-gray-400">{img.width}×{img.height}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-30">↑</button>
                  <button onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-30">↓</button>
                  <button onClick={() => removeImage(i)} className="px-2 py-1 text-xs rounded bg-red-50 dark:bg-red-900/30 text-red-500">✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={convert} disabled={converting} className="btn-primary">
              {converting ? '生成中...' : `生成 PDF（${images.length} 张图片）`}
            </button>
            {resultUrl && (
              <button onClick={download} className="btn-primary px-6">
                下载 PDF
              </button>
            )}
            {resultUrl && (
              <a href={resultUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                预览 PDF
              </a>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        </>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
