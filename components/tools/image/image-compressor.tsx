'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState('');
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(f);
    setCompressedUrl('');
  }, []);

  const compress = useCallback(() => {
    if (!file || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality / 100);
      setCompressedUrl(dataUrl);
      
      // Calculate compressed size from base64
      const base64 = dataUrl.split(',')[1];
      const byteSize = Math.ceil((base64.length * 3) / 4);
      setCompressedSize(byteSize);
    };
    img.src = preview;
  }, [file, preview, quality, maxWidth, format]);

  const download = useCallback(() => {
    if (!compressedUrl) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = `compressed.${format === 'webp' ? 'webp' : format === 'jpeg' ? 'jpg' : 'png'}`;
    a.click();
  }, [compressedUrl, format]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const ratio = originalSize && compressedSize ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0;

  return (
    <ToolLayout
      title="图片压缩器"
      description="在线压缩图片文件大小，支持JPEG、PNG、WebP格式"
      instructions="上传图片，调整压缩质量和尺寸限制，点击压缩按钮。预览原图和压缩后的效果对比。"
    >
      {/* Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传图片</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="image-upload" />
          <label htmlFor="image-upload" className="cursor-pointer">
            <p className="text-gray-600 dark:text-gray-400 mb-2">点击选择图片或拖拽到此处</p>
            <p className="text-xs text-gray-400">支持 PNG, JPG, GIF, WebP, SVG</p>
          </label>
        </div>
      </div>

      {file && (
        <>
          {/* Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">输出格式</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">质量 (%)</label>
              <input type="number" value={quality} onChange={(e) => setQuality(Math.max(1, Math.min(100, Number(e.target.value))))} min={1} max={100} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">最大宽度 (px)</label>
              <input type="number" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} min={100} max={4096} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div className="flex items-end">
              <button onClick={compress} className="btn-primary w-full">压缩图片</button>
            </div>
          </div>

          {/* Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">原图</p>
                <span className="text-xs text-gray-500">{formatSize(originalSize)}</span>
              </div>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
                <img src={preview} alt="Original" className="max-w-full max-h-64 object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">压缩后</p>
                {compressedSize > 0 && (
                  <span className={`text-xs font-medium ${compressedSize < originalSize ? 'text-green-500' : 'text-red-500'}`}>
                    -{ratio}% ({formatSize(compressedSize)})
                  </span>
                )}
              </div>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
                {compressedUrl ? (
                  <img src={compressedUrl} alt="Compressed" className="max-w-full max-h-64 object-contain" />
                ) : (
                  <p className="text-gray-400 text-sm">点击上方压缩按钮</p>
                )}
              </div>
            </div>
          </div>

          {/* Download */}
          {compressedUrl && (
            <div className="flex items-center justify-center gap-4">
              <button onClick={download} className="btn-primary px-8">下载压缩图片</button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
    </ToolLayout>
  );
}
