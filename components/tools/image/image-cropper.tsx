'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';

const PRESET_RATIOS = [
  { label: '自由', value: 0 },
  { label: '1:1 方形', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4', value: 3 / 4 },
  { label: '9:16', value: 9 / 16 },
];

export function ImageCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [ratio, setRatio] = useState(0);
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<null | 'se' | 'nw' | 'ne' | 'sw'>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startBox, setStartBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [croppedUrl, setCroppedUrl] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const limiter = useToolLimiter({ toolKey: 'imgcrop' });
  const { checkLimit, markUsed } = limiter;

  // display scale: displayed px per original px
  const displayScale = useRef(1);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setCroppedUrl('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const url = ev.target?.result as string;
        setPreview(url);
        setImgSize({ width: img.width, height: img.height });
        // default box: center 80%
        const w = Math.round(img.width * 0.8);
        const h = Math.round(img.height * 0.8);
        setBox({ x: Math.round((img.width - w) / 2), y: Math.round((img.height - h) / 2), w, h });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(f);
  }, []);

  // keep box within image bounds
  const clampBox = useCallback(
    (b: { x: number; y: number; w: number; h: number }) => {
      const W = imgSize.width;
      const H = imgSize.height;
      let { x, y, w, h } = b;
      w = Math.max(10, Math.min(w, W));
      h = Math.max(10, Math.min(h, H));
      x = Math.max(0, Math.min(x, W - w));
      y = Math.max(0, Math.min(y, H - h));
      return { x, y, w, h };
    },
    [imgSize]
  );

  const applyRatio = useCallback(
    (b: { x: number; y: number; w: number; h: number }) => {
      if (ratio <= 0) return clampBox(b);
      let { x, y, w, h } = b;
      const r = ratio;
      const cur = w / h;
      if (cur > r) {
        w = Math.round(h * r);
      } else {
        h = Math.round(w / r);
      }
      // keep center
      x = Math.round(b.x + (b.w - w) / 2);
      y = Math.round(b.y + (b.h - h) / 2);
      return clampBox({ x, y, w, h });
    },
    [ratio, clampBox]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const imgEl = imgRef.current;
      if (!rect || !imgEl) return;
      const scale = displayScale.current;
      const px = (e.clientX - rect.left) / scale;
      const py = (e.clientY - rect.top) / scale;

      // check if clicking near edges (resize)
      const near = 10 / scale;
      const nearRight = Math.abs(px - (box.x + box.w)) < near;
      const nearLeft = Math.abs(px - box.x) < near;
      const nearBottom = Math.abs(py - (box.y + box.h)) < near;
      const nearTop = Math.abs(py - box.y) < near;

      if (nearRight && nearBottom) return setResizing('se');
      if (nearLeft && nearTop) return setResizing('nw');
      if (nearRight && nearTop) return setResizing('ne');
      if (nearLeft && nearBottom) return setResizing('sw');
      if (nearRight) return setResizing('se');
      if (nearLeft) return setResizing('nw');
      if (nearBottom) return setResizing('se');
      if (nearTop) return setResizing('nw');

      // inside box: drag
      if (px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h) {
        setDragging(true);
        setStartPos({ x: px, y: py });
        setStartBox(box);
      }
    },
    [box]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scale = displayScale.current;
      const px = (e.clientX - rect.left) / scale;
      const py = (e.clientY - rect.top) / scale;

      if (dragging) {
        const dx = px - startPos.x;
        const dy = py - startPos.y;
        setBox(
          clampBox({
            x: Math.round(startBox.x + dx),
            y: Math.round(startBox.y + dy),
            w: startBox.w,
            h: startBox.h,
          })
        );
      } else if (resizing) {
        let b = { ...startBox };
        if (resizing.includes('e')) b.w = Math.round(px - startBox.x);
        if (resizing.includes('s')) b.h = Math.round(py - startBox.y);
        if (resizing.includes('w')) {
          b.w = Math.round(startBox.x + startBox.w - px);
          b.x = Math.round(px);
        }
        if (resizing.includes('n')) {
          b.h = Math.round(startBox.y + startBox.h - py);
          b.y = Math.round(py);
        }
        b = applyRatio(b);
        setBox(b);
      }
    },
    [dragging, resizing, startPos, startBox, clampBox, applyRatio]
  );

  const endDrag = useCallback(() => {
    setDragging(false);
    setResizing(null);
  }, []);

  // measure displayed scale after preview loads
  useEffect(() => {
    if (preview && imgRef.current && containerRef.current) {
      const imgEl = imgRef.current;
      displayScale.current = imgEl.getBoundingClientRect().width / imgSize.width;
    }
  }, [preview, imgSize]);

  const crop = useCallback(() => {
    if (!file || !canvasRef.current) return;
    if (!checkLimit()) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = box.w;
      canvas.height = box.h;
      ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
      setCroppedUrl(canvas.toDataURL('image/png'));
    };
    img.src = preview;
    markUsed();
  }, [file, preview, box, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!croppedUrl) return;
    const a = document.createElement('a');
    a.href = croppedUrl;
    a.download = `cropped_${box.w}x${box.h}.png`;
    a.click();
  }, [croppedUrl, box]);

  return (
    <ToolLayout
      title="图片裁剪工具"
      description="在线裁剪图片，支持自由裁剪和 1:1、4:3、16:9 等常用比例，拖拽调整选区，纯浏览器处理"
      instructions="上传图片，拖动选框调整裁剪区域，拖动边缘可缩放选区，选择比例预设后自动对齐，点击裁剪按钮导出结果。"
    >
      {/* Upload */}
      {!file && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传图片</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="crop-upload" />
            <label htmlFor="crop-upload" className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-400">点击选择图片</p>
            </label>
          </div>
        </div>
      )}

      {file && (
        <>
          {/* Ratio presets */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">裁剪比例：</span>
            {PRESET_RATIOS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setRatio(p.value);
                  if (p.value > 0) setBox(applyRatio(box));
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  ratio === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Canvas area */}
          <div
            ref={containerRef}
            className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 select-none touch-none"
            style={{ cursor: dragging ? 'grabbing' : 'crosshair' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
          >
            <img ref={imgRef} src={preview} alt="待裁剪" className="max-w-full h-auto" draggable={false} />
            {imgSize.width > 0 && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/10"
                style={{
                  left: `${(box.x / imgSize.width) * 100}%`,
                  top: `${(box.y / imgSize.height) * 100}%`,
                  width: `${(box.w / imgSize.width) * 100}%`,
                  height: `${(box.h / imgSize.height) * 100}%`,
                }}
              >
                {/* corner handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm" />
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            选区：{box.w} × {box.h} px
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={crop} className="btn-primary">
              裁剪
            </button>
            <button
              onClick={() => {
                setFile(null);
                setPreview('');
                setCroppedUrl('');
              }}
              className="btn-secondary"
            >
              重新选择
            </button>
            {croppedUrl && (
              <button onClick={download} className="btn-primary px-6">
                下载裁剪结果
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Result */}
          {croppedUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">裁剪结果</p>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 inline-block">
                <img src={croppedUrl} alt="裁剪结果" className="max-w-full max-h-64" />
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
