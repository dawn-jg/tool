'use client';

import { useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { ToolLayout } from '@/components/ToolLayout';

export function QrcodeGenerator() {
  const [text, setText] = useState('https://tooltip.cc');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(async () => {
    if (!text) return;
    try {
      const canvas = canvasRef.current!;
      await QRCode.toCanvas(canvas, text, {
        width: size,
        color: { dark: fgColor, light: bgColor },
        margin: 2,
      });
      setQrDataUrl(canvas.toDataURL('image/png'));
    } catch {
      // Ignore
    }
  }, [text, size, fgColor, bgColor]);

  const download = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode.png';
    a.click();
  }, [qrDataUrl]);

  return (
    <ToolLayout
      title="二维码生成器"
      description="在线生成二维码，支持自定义大小和颜色"
      instructions="输入文本或网址，设置大小和颜色，点击生成即可创建二维码。支持自定义前景色和背景色。生成后可下载PNG格式图片。"
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          className="flex-1 min-w-[200px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入文本或网址..."
        />
        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" title="前景色" />
        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" title="背景色" />
        <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-2 text-sm">
          <option value={128}>128</option>
          <option value={256}>256</option>
          <option value={512}>512</option>
        </select>
        <button onClick={generate} className="btn-primary">生成</button>
        {qrDataUrl && <button onClick={download} className="btn-secondary">下载</button>}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {qrDataUrl && (
        <div className="flex justify-center p-4">
          <img src={qrDataUrl} alt="QR Code" className="rounded-lg border border-gray-200 dark:border-gray-700" />
        </div>
      )}
    </ToolLayout>
  );
}
