'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function FaviconGenerator() {
  const [preview, setPreview] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(32);
  const [color, setColor] = useState('#3b82f6');

  const generate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Add a letter
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', size / 2, size / 2);
    setPreview(canvas.toDataURL('image/png'));
  }, [size, color]);

  const download = useCallback(() => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = 'favicon.png';
    a.click();
  }, [preview]);

  return (
    <ToolLayout
      title="Favicon 生成器"
      description="在线生成网站Favicon图标"
      instructions="选择图标大小和颜色，点击生成即可创建简单的Favicon图标。点击下载保存为PNG格式，可用于网站favicon.ico或apple-touch-icon。"
      output={preview || undefined}
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          大小:
          <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm">
            <option value={16}>16x16</option>
            <option value={32}>32x32</option>
            <option value={64}>64x64</option>
            <option value={128}>128x128</option>
            <option value={180}>180x180</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          颜色:
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
        </label>
        <button onClick={generate} className="btn-primary">生成</button>
        {preview && <button onClick={download} className="btn-secondary">下载</button>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {preview && (
        <div className="flex items-center gap-4">
          <img src={preview} alt="favicon" className="rounded-lg border border-gray-200 dark:border-gray-700" style={{ width: size, height: size }} />
          <span className="text-sm text-gray-500 dark:text-gray-400">{size}x{size} PNG</span>
        </div>
      )}
    </ToolLayout>
  );
}
