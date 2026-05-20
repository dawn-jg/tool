'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useI18n } from '@/lib/i18n';

export function MemeGenerator() {
  const { t } = useI18n();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [strokeSize, setStrokeSize] = useState(3);
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [resultUrl, setResultUrl] = useState('');
  const [memeName, setMemeName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset meme templates (inline data URIs for simple text-based backgrounds)
  const PRESETS = [
    { name: '空白', color: '#ffffff', text: '' },
    { name: '黑底', color: '#000000', text: '' },
  ];

  const loadImage = useCallback((f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageUrl(reader.result as string);
        setResultUrl('');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
    setMemeName(f.name.replace(/\.[^.]+$/, ''));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) loadImage(f);
  }, [loadImage]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadImage(f);
  }, [loadImage]);

  const generate = useCallback(() => {
    if (!image) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    // Set canvas to image size
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);

    // Text wrap helper
    function wrapText(text: string, maxWidth: number): string[] {
      const lines: string[] = [];
      if (!text) return lines;
      const words = text.split('');
      let line = '';
      for (const ch of words) {
        const testLine = line + ch;
        if (ctx.measureText(testLine).width > maxWidth && line) {
          lines.push(line);
          line = ch;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    // Draw text block (top or bottom)
    function drawTextBlock(text: string, y: number, align: CanvasTextAlign) {
      if (!text) return;
      const maxWidth = canvas.width * 0.9;
      ctx.textAlign = align;
      ctx.textBaseline = 'top';
      ctx.font = `bold ${fontSize}px "Impact", "Arial Black", "SimHei", sans-serif`;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
      ctx.lineJoin = 'round';
      ctx.fillStyle = textColor;

      const lines = wrapText(text, maxWidth);
      const lineHeight = fontSize * 1.2;

      // Adjust starting Y for multi-line
      if (align === 'center') {
        const totalH = lines.length * lineHeight;
        let startY = y === 0 ? 20 : canvas.height - totalH - 20;
        for (let i = 0; i < lines.length; i++) {
          const ly = startY + i * lineHeight;
          ctx.strokeText(lines[i], canvas.width / 2, ly);
          ctx.fillText(lines[i], canvas.width / 2, ly);
        }
      }
    }

    drawTextBlock(topText, 0, 'center');
    drawTextBlock(bottomText, 0, 'center');

    // For top text: left align at top
    function drawTopText(text: string) {
      if (!text) return;
      const maxWidth = canvas.width * 0.9;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = `bold ${fontSize}px "Impact", "Arial Black", "SimHei", sans-serif`;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
      ctx.lineJoin = 'round';
      ctx.fillStyle = textColor;

      const lines = wrapText(text, maxWidth);
      const lineHeight = fontSize * 1.2;
      let y = 20;
      for (const line of lines) {
        ctx.strokeText(line, canvas.width / 2, y);
        ctx.fillText(line, canvas.width / 2, y);
        y += lineHeight;
      }
    }

    function drawBottomText(text: string) {
      if (!text) return;
      const maxWidth = canvas.width * 0.9;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = `bold ${fontSize}px "Impact", "Arial Black", "SimHei", sans-serif`;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
      ctx.lineJoin = 'round';
      ctx.fillStyle = textColor;

      const lines = wrapText(text, maxWidth);
      const lineHeight = fontSize * 1.2;
      let y = canvas.height - 20;
      for (let i = lines.length - 1; i >= 0; i--) {
        ctx.strokeText(lines[i], canvas.width / 2, y);
        ctx.fillText(lines[i], canvas.width / 2, y);
        y -= lineHeight;
      }
    }

    drawTopText(topText);
    drawBottomText(bottomText);

    setResultUrl(canvas.toDataURL('image/png'));
  }, [image, topText, bottomText, fontSize, strokeSize, textColor, strokeColor]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${memeName || 'meme'}-表情包.png`;
    a.click();
  }, [resultUrl, memeName]);

  const share = useCallback(async () => {
    if (!resultUrl) return;
    const blob = await (await fetch(resultUrl)).blob();
    if (navigator.share && navigator.canShare({ files: [new File([blob], 'meme.png', { type: 'image/png' })] })) {
      await navigator.share({ files: [new File([blob], 'meme.png', { type: 'image/png' })] });
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert(t('meme.copied') || '图片已复制到剪贴板');
      } catch {
        download();
      }
    }
  }, [resultUrl, t]);

  return (
    <ToolLayout
      title="表情包生成器"
      description="上传图片，添加文字，快速生成搞笑表情包"
      instructions="上传一张图片或使用预设背景，添加顶部和底部文字，调整字体大小和颜色，点击生成即可预览。支持一键下载和分享，纯浏览器端处理，不上传服务器。"
    >
      {/* Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {imageUrl ? (
          <img src={imageUrl} alt="预览" className="max-h-48 mx-auto rounded-lg" />
        ) : (
          <div className="text-gray-400 dark:text-gray-500">
            <p className="text-lg mb-1">🎭</p>
            <p className="text-sm">{t('meme.dropzone') || '点击或拖拽上传图片'}</p>
            <p className="text-xs mt-1">{t('meme.dropzoneTip') || '纯本地处理，不上传服务器'}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('meme.topText') || '顶部文字'}
          </label>
          <input
            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500"
            value={topText}
            onChange={e => setTopText(e.target.value)}
            placeholder="输入顶部文字..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('meme.bottomText') || '底部文字'}
          </label>
          <input
            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500"
            value={bottomText}
            onChange={e => setBottomText(e.target.value)}
            placeholder="输入底部文字..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('meme.fontSize') || '字号'} ({fontSize}px)
          </label>
          <input
            type="range"
            min="16"
            max="120"
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('meme.strokeSize') || '描边粗细'} ({strokeSize}px)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={strokeSize}
            onChange={e => setStrokeSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('meme.textColor') || '文字颜色'}
          </label>
          <input
            type="color"
            value={textColor}
            onChange={e => setTextColor(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('meme.strokeColor') || '描边颜色'}
          </label>
          <input
            type="color"
            value={strokeColor}
            onChange={e => setStrokeColor(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={!image}
        className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors text-sm"
      >
        {t('meme.generate') || '生成表情包'}
      </button>

      {/* Result */}
      {resultUrl && (
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('meme.preview') || '生成结果'}
          </p>
          <img src={resultUrl} alt="表情包" className="max-w-full max-h-96 mx-auto rounded-xl border border-gray-200 dark:border-gray-700" />
          <div className="flex gap-3 justify-center">
            <button
              onClick={download}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              📥 {t('meme.download') || '下载'}
            </button>
            <button
              onClick={share}
              className="py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              📤 {t('meme.share') || '分享'}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
