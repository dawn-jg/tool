'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';

const POSITIONS = [
  { value: 'center', label: '居中' },
  { value: 'top-left', label: '左上' },
  { value: 'top-right', label: '右上' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-right', label: '右下' },
];

export function ImageWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [wmType, setWmType] = useState<'text' | 'image'>('text');
  const [wmText, setWmText] = useState('© tooltip.cc');
  const [fontSize, setFontSize] = useState(32);
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState('bottom-right');
  const [tiled, setTiled] = useState(false);
  const [wmFile, setWmFile] = useState<File | null>(null);
  const [wmPreview, setWmPreview] = useState('');
  const [wmScale, setWmScale] = useState(30); // percent of image width
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wmImgRef = useRef<HTMLImageElement | null>(null);
  const limiter = useToolLimiter({ toolKey: 'imgwm' });
  const { checkLimit, markUsed } = limiter;

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setResultUrl('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setPreview(ev.target?.result as string);
        setImgSize({ width: img.width, height: img.height });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(f);
  }, []);

  const handleWmFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setWmFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setWmPreview(ev.target?.result as string);
      const img = new Image();
      img.onload = () => {
        wmImgRef.current = img;
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(f);
  }, []);

  const applyWatermark = useCallback(() => {
    if (!file || !canvasRef.current) return;
    if (!checkLimit()) return;
    setError('');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const W = img.width;
      const H = img.height;
      canvas.width = W;
      canvas.height = H;
      ctx.drawImage(img, 0, 0);

      const alpha = opacity / 100;
      ctx.globalAlpha = alpha;

      const drawText = (x: number, y: number) => {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = Math.max(1, fontSize / 12);
        ctx.strokeText(wmText, x, y);
        ctx.fillText(wmText, x, y);
      };

      const drawImage = (x: number, y: number, w: number, h: number) => {
        if (wmImgRef.current) {
          ctx.drawImage(wmImgRef.current, x, y, w, h);
        }
      };

      if (tiled) {
        if (wmType === 'text') {
          ctx.font = `bold ${fontSize}px sans-serif`;
          const metrics = ctx.measureText(wmText);
          const tw = metrics.width;
          const th = fontSize * 1.4;
          ctx.translate(W / 2, H / 2);
          ctx.rotate(-Math.PI / 6);
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.strokeStyle = 'rgba(0,0,0,0.6)';
          ctx.lineWidth = Math.max(1, fontSize / 12);
          for (let y = -H; y < H * 2; y += th * 2.5) {
            for (let x = -W; x < W * 2; x += tw + fontSize * 2) {
              ctx.strokeText(wmText, x, y);
              ctx.fillText(wmText, x, y);
            }
          }
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else if (wmImgRef.current) {
          const wm = wmImgRef.current;
          const tileW = Math.max(40, Math.round(W * (wmScale / 100) / 3));
          const tileH = Math.round((tileW * wm.height) / wm.width);
          for (let y = 0; y < H; y += tileH * 2) {
            for (let x = 0; x < W; x += tileW * 2) {
              ctx.drawImage(wm, x, y, tileW, tileH);
            }
          }
        }
      } else {
        if (wmType === 'text') {
          ctx.font = `bold ${fontSize}px sans-serif`;
          const metrics = ctx.measureText(wmText);
          const tw = metrics.width;
          const th = fontSize;
          const pad = 20;
          let x = 0;
          let y = 0;
          switch (position) {
            case 'top-left':
              x = pad;
              y = th + pad;
              break;
            case 'top-right':
              x = W - tw - pad;
              y = th + pad;
              break;
            case 'bottom-left':
              x = pad;
              y = H - pad;
              break;
            case 'bottom-right':
              x = W - tw - pad;
              y = H - pad;
              break;
            default:
              x = (W - tw) / 2;
              y = (H + th) / 2;
          }
          drawText(x, y);
        } else if (wmImgRef.current) {
          const wm = wmImgRef.current;
          const wmW = Math.max(30, Math.round(W * (wmScale / 100)));
          const wmH = Math.round((wmW * wm.height) / wm.width);
          const pad = 20;
          let x = 0;
          let y = 0;
          switch (position) {
            case 'top-left':
              x = pad;
              y = pad;
              break;
            case 'top-right':
              x = W - wmW - pad;
              y = pad;
              break;
            case 'bottom-left':
              x = pad;
              y = H - wmH - pad;
              break;
            case 'bottom-right':
              x = W - wmW - pad;
              y = H - wmH - pad;
              break;
            default:
              x = (W - wmW) / 2;
              y = (H - wmH) / 2;
          }
          drawImage(x, y, wmW, wmH);
        }
      }

      ctx.globalAlpha = 1;
      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = preview;
    markUsed();
  }, [file, preview, wmType, wmText, fontSize, opacity, position, tiled, wmScale, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `watermarked_${(file?.name || 'image').replace(/\.[^.]+$/, '')}.png`;
    a.click();
  }, [resultUrl, file]);

  return (
    <ToolLayout
      title="图片加水印"
      description="在线给图片添加文字水印或图片水印，支持位置、透明度、平铺设置，纯浏览器处理"
      instructions="上传原图，选择水印类型（文字或图片），设置内容、大小、透明度和位置，点击添加水印即可预览并下载。图片不会上传到服务器。"
    >
      {/* Upload original */}
      {!file && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传原图</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="wm-upload" />
            <label htmlFor="wm-upload" className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-400">点击选择图片</p>
            </label>
          </div>
        </div>
      )}

      {file && (
        <>
          {/* Watermark type */}
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={wmType === 'text'} onChange={() => setWmType('text')} className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">文字水印</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={wmType === 'image'} onChange={() => setWmType('image')} className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">图片水印</span>
            </label>
          </div>

          {/* Watermark config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {wmType === 'text' ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">水印文字</label>
                <input
                  type="text"
                  value={wmText}
                  onChange={(e) => setWmText(e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">水印图片</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleWmFile} className="hidden" id="wm-img" />
                  <label htmlFor="wm-img" className="cursor-pointer">
                    {wmPreview ? (
                      <img src={wmPreview} alt="水印" className="max-h-16 mx-auto object-contain" />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">点击选择水印图片（PNG 带透明背景最佳）</p>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {wmType === 'text' ? `字号：${fontSize}px` : `水印宽度：${wmScale}%`}
              </label>
              <input
                type="range"
                min={wmType === 'text' ? 12 : 10}
                max={wmType === 'text' ? 120 : 80}
                value={wmType === 'text' ? fontSize : wmScale}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (wmType === 'text') setFontSize(v);
                  else setWmScale(v);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">透明度：{opacity}%</label>
              <input
                type="range"
                min={5}
                max={100}
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

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={tiled} onChange={(e) => setTiled(e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">平铺（斜向铺满）</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={applyWatermark} className="btn-primary">
              添加水印
            </button>
            {resultUrl && (
              <button onClick={download} className="btn-primary px-6">
                下载图片
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">原图</p>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
                <img src={preview} alt="原图" className="max-w-full max-h-64 object-contain" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">加水印后</p>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
                {resultUrl ? (
                  <img src={resultUrl} alt="结果" className="max-w-full max-h-64 object-contain" />
                ) : (
                  <p className="text-gray-400 text-sm">点击"添加水印"预览效果</p>
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
