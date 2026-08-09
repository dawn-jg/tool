'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';

export function CircleAvatar() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [size, setSize] = useState(512);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [hasBg, setHasBg] = useState(true);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const limiter = useToolLimiter({ toolKey: 'circavatar' });
  const { checkLimit, markUsed } = limiter;

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setResultUrl('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const generate = useCallback(() => {
    if (!file || !canvasRef.current) return;
    if (!checkLimit()) return;
    setError('');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const s = size;
      canvas.width = s;
      canvas.height = s;
      ctx.clearRect(0, 0, s, s);

      if (hasBg) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, s, s);
      }

      // Circle clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // cover-fit draw
      const scale = Math.max(s / img.width, s / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (s - dw) / 2, (s - dh) / 2, dw, dh);
      ctx.restore();

      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = preview;
    markUsed();
  }, [file, preview, size, bgColor, hasBg, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `avatar_${size}.png`;
    a.click();
  }, [resultUrl, size]);

  return (
    <ToolLayout
      title="圆形头像生成"
      description="在线将图片裁剪为圆形头像，支持自定义尺寸和背景色，生成透明或纯色背景 PNG，纯浏览器处理"
      instructions="上传一张图片，设置头像尺寸和背景（白色/透明/自定义），点击生成即可得到圆形头像 PNG。图片不会上传到服务器。"
    >
      {!file && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传图片</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="cav-upload" />
            <label htmlFor="cav-upload" className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-400">点击选择图片</p>
            </label>
          </div>
        </div>
      )}

      {file && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">输出尺寸：{size}px</label>
              <input
                type="range"
                min={128}
                max={1024}
                step={64}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">背景</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!hasBg} onChange={() => setHasBg(false)} className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">透明</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={hasBg} onChange={() => setHasBg(true)} className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">纯色</span>
                </label>
                {hasBg && (
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={generate} className="btn-primary">
              生成圆形头像
            </button>
            {resultUrl && (
              <button onClick={download} className="btn-primary px-6">
                下载 PNG
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">原图</p>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
                <img src={preview} alt="原图" className="max-w-full max-h-64 object-contain" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">圆形头像</p>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
                {resultUrl ? (
                  <img src={resultUrl} alt="头像" className="max-h-64 object-contain" style={{ borderRadius: '50%' }} />
                ) : (
                  <p className="text-gray-400 text-sm">点击"生成圆形头像"预览</p>
                )}
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
