'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';

const FORMATS = [
  { value: 'image/png', ext: 'png', label: 'PNG' },
  { value: 'image/jpeg', ext: 'jpg', label: 'JPG' },
  { value: 'image/webp', ext: 'webp', label: 'WebP' },
  { value: 'image/avif', ext: 'avif', label: 'AVIF' },
  { value: 'image/bmp', ext: 'bmp', label: 'BMP' },
  { value: 'image/gif', ext: 'gif', label: 'GIF' },
];

const QUALITY_OPTIONS = [
  { value: 0.9, label: '高质量 (90%)' },
  { value: 0.75, label: '标准 (75%)' },
  { value: 0.5, label: '压缩 (50%)' },
];

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [targetFormat, setTargetFormat] = useState('image/webp');
  const [quality, setQuality] = useState(0.9);
  const [convertedUrls, setConvertedUrls] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const limiter = useToolLimiter({ toolKey: 'imgc' });
  const { checkLimit, markUsed } = limiter;

  const targetExt = FORMATS.find((f) => f.value === targetFormat)?.ext || 'webp';

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setFiles(list);
    setConvertedUrls([]);
    setError('');
    const readers = list.map(
      (f) =>
        new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = (ev) => resolve(ev.target?.result as string);
          r.readAsDataURL(f);
        })
    );
    Promise.all(readers).then(setPreviews);
  }, []);

  const convertOne = useCallback(
    (file: File, dataUrl: string): Promise<string> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return reject(new Error('canvas unavailable'));
          // Handle GIF animation: keep first frame
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('ctx unavailable'));
          ctx.drawImage(img, 0, 0);
          // JPEG/BMP have no alpha — fill white background
          if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
            const tmp = document.createElement('canvas');
            tmp.width = img.width;
            tmp.height = img.height;
            const tctx = tmp.getContext('2d');
            if (!tctx) return reject(new Error('ctx unavailable'));
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, tmp.width, tmp.height);
            tctx.drawImage(img, 0, 0);
            ctx.drawImage(tmp, 0, 0);
          }
          resolve(canvas.toDataURL(targetFormat, quality));
        };
        img.onerror = () => reject(new Error('图片解析失败'));
        img.src = dataUrl;
      }),
    [targetFormat, quality]
  );

  const convert = useCallback(async () => {
    if (!files.length || !checkLimit()) return;
    setConverting(true);
    setError('');
    try {
      const urls = await Promise.all(files.map((f, i) => convertOne(f, previews[i])));
      setConvertedUrls(urls);
      markUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败');
    } finally {
      setConverting(false);
    }
  }, [files, previews, convertOne, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!convertedUrls.length) return;
    convertedUrls.forEach((url, i) => {
      const a = document.createElement('a');
      const base = (files[i]?.name || `image_${i + 1}`).replace(/\.[^.]+$/, '');
      a.href = url;
      a.download = `${base}.${targetExt}`;
      a.click();
    });
  }, [convertedUrls, files, targetExt]);

  const reset = useCallback(() => {
    setFiles([]);
    setPreviews([]);
    setConvertedUrls([]);
    setError('');
  }, []);

  return (
    <ToolLayout
      title="图片格式转换"
      description="在线转换图片格式，支持 PNG、JPG、WebP、AVIF、BMP、GIF 互转，支持批量转换，纯浏览器处理不上传"
      instructions="上传一张或多张图片，选择目标格式（PNG/JPG/WebP/AVIF/BMP/GIF）和画质，点击转换后即可下载。转换全程在浏览器本地完成，图片不会上传到服务器。"
    >
      {/* Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传图片（支持多选）</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" id="iconv-upload" />
          <label htmlFor="iconv-upload" className="cursor-pointer">
            <p className="text-gray-600 dark:text-gray-400">点击选择图片，可多选批量转换</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 PNG / JPG / WebP / GIF / BMP / SVG 等常见格式</p>
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <>
          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">目标格式</label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">画质</label>
              <select
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {QUALITY_OPTIONS.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button onClick={convert} disabled={converting} className="btn-primary">
              {converting ? '转换中...' : '开始转换'}
            </button>
            <button onClick={reset} className="btn-secondary">
              清空
            </button>
            {convertedUrls.length > 0 && (
              <button onClick={download} className="btn-primary px-6">
                下载全部（{convertedUrls.length} 个 .{targetExt}）
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Preview grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((p, i) => (
              <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-2" style={{ minHeight: 120 }}>
                  <img src={p} alt={`原图${i + 1}`} className="max-w-full max-h-32 object-contain" />
                </div>
                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 truncate">{files[i]?.name}</div>
                {convertedUrls[i] && (
                  <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-2 border-t border-gray-200 dark:border-gray-700">
                    <img src={convertedUrls[i]} alt={`转换后${i + 1}`} className="max-w-full max-h-24 object-contain" />
                  </div>
                )}
                {convertedUrls[i] && (
                  <div className="px-2 pb-2">
                    <a
                      href={convertedUrls[i]}
                      download={`${(files[i]?.name || `image_${i + 1}`).replace(/\.[^.]+$/, '')}.${targetExt}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      下载
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
