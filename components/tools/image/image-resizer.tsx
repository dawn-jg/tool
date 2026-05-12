'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  const [keepAspect, setKeepAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [resizedUrl, setResizedUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setPreview(ev.target?.result as string);
        setOriginalSize({ width: img.width, height: img.height });
        setNewWidth(img.width);
        setNewHeight(img.height);
        setAspectRatio(img.width / img.height);
        setResizedUrl('');
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(f);
  }, []);

  const handleWidthChange = useCallback((w: number) => {
    setNewWidth(w);
    if (keepAspect) {
      setNewHeight(Math.round(w / aspectRatio));
    }
  }, [keepAspect, aspectRatio]);

  const handleHeightChange = useCallback((h: number) => {
    setNewHeight(h);
    if (keepAspect) {
      setNewWidth(Math.round(h * aspectRatio));
    }
  }, [keepAspect, aspectRatio]);

  const resize = useCallback(() => {
    if (!file || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      setResizedUrl(canvas.toDataURL('image/png'));
    };
    img.src = preview;
  }, [file, preview, newWidth, newHeight]);

  const download = useCallback(() => {
    if (!resizedUrl) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    a.download = `resized_${newWidth}x${newHeight}.png`;
    a.click();
  }, [resizedUrl, newWidth, newHeight]);

  const presetSizes = [
    { label: '4K (3840×2160)', w: 3840, h: 2160 },
    { label: '1080p (1920×1080)', w: 1920, h: 1080 },
    { label: '720p (1280×720)', w: 1280, h: 720 },
    { label: '480p (854×480)', w: 854, h: 480 },
    { label: 'Avatar (200×200)', w: 200, h: 200 },
    { label: 'Icon (64×64)', w: 64, h: 64 },
  ];

  return (
    <ToolLayout
      title="图片尺寸调整"
      description="在线调整图片宽高尺寸，支持批量预设和保持宽高比"
      instructions="上传图片，输入新的宽高尺寸，点击调整大小。支持批量预设尺寸和保持宽高比选项。"
    >
      {/* Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传图片</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="resize-upload" />
          <label htmlFor="resize-upload" className="cursor-pointer">
            <p className="text-gray-600 dark:text-gray-400">点击选择图片</p>
          </label>
        </div>
      </div>

      {file && (
        <>
          {/* Original Info */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span>原图尺寸: {originalSize.width} × {originalSize.height}</span>
            <span>宽高比: {aspectRatio.toFixed(2)}</span>
          </div>

          {/* Size Inputs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">宽度 (px)</label>
              <input
                type="number"
                value={newWidth}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                min={1}
                max={10000}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">高度 (px)</label>
              <input
                type="number"
                value={newHeight}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                min={1}
                max={10000}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepAspect}
                  onChange={(e) => setKeepAspect(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">保持宽高比</span>
              </label>
            </div>
            <div className="flex items-end">
              <button onClick={resize} className="btn-primary w-full">调整尺寸</button>
            </div>
          </div>

          {/* Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">预设尺寸</label>
            <div className="flex flex-wrap gap-2">
              {presetSizes.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setNewWidth(preset.w);
                    setNewHeight(preset.h);
                  }}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">原图</p>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
                <img src={preview} alt="Original" className="max-w-full max-h-64 object-contain" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">调整后 ({newWidth}×{newHeight})</p>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
                {resizedUrl ? (
                  <img src={resizedUrl} alt="Resized" className="max-w-full max-h-64 object-contain" />
                ) : (
                  <p className="text-gray-400 text-sm">点击调整尺寸按钮</p>
                )}
              </div>
            </div>
          </div>

          {/* Download */}
          {resizedUrl && (
            <div className="flex items-center justify-center">
              <button onClick={download} className="btn-primary px-8">下载调整后的图片</button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
    </ToolLayout>
  );
}
