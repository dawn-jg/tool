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

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);

    function wrapText(text: string, maxWidth: number): string[] {
      const lines: string[] = [];
      if (!text) return lines;
      let line = '';
      for (const ch of text) {
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

    function drawTopText(text: string) {
      if (!text) return;
      const maxWidth = canvas.width * 0.9;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = `bold ${fontSize}px "Impact","Arial Black","SimHei",sans-serif`;
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
      ctx.font = `bold ${fontSize}px "Impact","Arial Black","SimHei",sans-serif`;
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
    a.download = `${memeName || 'meme'}-meme.png`;
    a.click();
  }, [resultUrl, memeName]);

  const share = useCallback(async () => {
    if (!resultUrl) return;
    const blob = await (await fetch(resultUrl)).blob();
    if (navigator.share && navigator.canShare({ files: [new File([blob], 'meme.png', { type: 'image/png' })] })) {
      await navigator.share({ files: [new File([blob], 'meme.png', { type: 'image/png' })] });
    } else {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert(t('meme.copied'));
      } catch {
        download();
      }
    }
  }, [resultUrl, t, download]);

  return (
    <ToolLayout
      title="meme.title"
      description="tool.memeGeneratorDesc"
      instructions="meme.instructions"
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
          <img src={imageUrl} alt="preview" className="max-h-48 mx-auto rounded-lg" />
        ) : (
          <div className="text-gray-400 dark:text-gray-500">
            <p className="text-lg mb-1">{t('meme.dropzone')}</p>
            <p className="text-xs mt-1">{t('meme.dropzoneTip')}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meme.topText')}</label>
          <input
            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500"
            value={topText}
            onChange={e => setTopText(e.target.value)}
            placeholder={t('meme.topText')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meme.bottomText')}</label>
          <input
            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500"
            value={bottomText}
            onChange={e => setBottomText(e.target.value)}
            placeholder={t('meme.bottomText')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meme.fontSize')} ({fontSize}px)</label>
          <input type="range" min="16" max="120" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meme.strokeSize')} ({strokeSize}px)</label>
          <input type="range" min="0" max="10" step="0.5" value={strokeSize} onChange={e => setStrokeSize(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meme.textColor')}</label>
          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meme.strokeColor')}</label>
          <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!image}
        className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors text-sm"
      >
        {t('meme.generate')}
      </button>

      {resultUrl && (
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('meme.preview')}</p>
          <img src={resultUrl} alt="meme" className="max-w-full max-h-96 mx-auto rounded-xl border border-gray-200 dark:border-gray-700" />
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              {t('meme.download')}
            </button>
            <button onClick={share} className="py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
              {t('meme.share')}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
