'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

const FORMATS: { value: OutputFormat; ext: string; lossy: boolean }[] = [
  { value: 'image/jpeg', ext: '.jpg', lossy: true },
  { value: 'image/png', ext: '.png', lossy: false },
  { value: 'image/webp', ext: '.webp', lossy: true },
  { value: 'image/avif', ext: '.avif', lossy: true },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ImageCompressor() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState(0);
  const [originalW, setOriginalW] = useState(0);
  const [originalH, setOriginalH] = useState(0);
  const [originalFmt, setOriginalFmt] = useState('');
  
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/webp');
  const [quality, setQuality] = useState(80);
  const [maxW, setMaxW] = useState(0);
  const [maxH, setMaxH] = useState(0);
  
  const [resultUrl, setResultUrl] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [avifSupported, setAvifSupported] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 1;
    c.toBlob(b => setAvifSupported(!!b), 'image/avif');
  }, []);

  const availableFormats = FORMATS.filter(f => f.value !== 'image/avif' || avifSupported);

  const loadFile = useCallback((f: File) => {
    setFile(f);
    setOriginalSize(f.size);
    setError('');
    setResultUrl('');
    setResultSize(0);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setOriginalW(img.naturalWidth);
      setOriginalH(img.naturalHeight);
      if (!maxW) setMaxW(img.naturalWidth);
      if (!maxH) setMaxH(img.naturalHeight);
      const ext = f.name.split('.').pop()?.toUpperCase() || '';
      setOriginalFmt(ext);
    };
    img.src = url;
  }, [maxW, maxH]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) loadFile(f);
  }, [loadFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  }, [loadFile]);

  const compress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError('');
    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
      });

      const canvas = canvasRef.current!;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (maxW > 0 && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      if (maxH > 0 && h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
      
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      const fmt = FORMATS.find(f => f.value === outputFormat)!;
      const q = fmt.lossy ? quality / 100 : undefined;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(b => resolve(b!), outputFormat, q);
      });
      
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err: any) {
      setError(err.message || 'Compression failed');
    } finally {
      setProcessing(false);
    }
  }, [file, originalUrl, outputFormat, quality, maxW, maxH]);

  const outputExt = FORMATS.find(f => f.value === outputFormat)!.ext;
  const outputName = file ? file.name.replace(/\.[^.]+$/, '') + outputExt : 'output' + outputExt;
  const ratio = originalSize > 0 ? ((1 - resultSize / originalSize) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {file ? (
          <div className="space-y-2">
            <div className="w-48 h-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img src={originalUrl} alt="" className="w-full h-full object-contain" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</p>
            <p className="text-xs text-gray-500">
              {originalW}×{originalH} · {formatBytes(originalSize)} · {originalFmt}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-4xl">🖼️</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Drag & drop an image here (or click to browse)
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Processed entirely in your browser. No uploads.
            </p>
          </div>
        )}
      </div>

      {/* Settings */}
      {file && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Output format</label>
            <select
              value={outputFormat}
              onChange={e => setOutputFormat(e.target.value as OutputFormat)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {availableFormats.map(f => (
                <option key={f.value} value={f.value}>{f.ext} — {f.value.split('/')[1].toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Quality: {quality}%
            </label>
            <input
              type="range"
              min={1} max={100}
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max width (px)</label>
            <input
              type="number"
              value={maxW || ''}
              onChange={e => setMaxW(Number(e.target.value) || 0)}
              placeholder={`Original: ${originalW}`}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max height (px)</label>
            <input
              type="number"
              value={maxH || ''}
              onChange={e => setMaxH(Number(e.target.value) || 0)}
              placeholder={`Original: ${originalH}`}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Action button */}
      {file && (
        <button
          onClick={compress}
          disabled={processing}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : (
            'Compress & Convert'
          )}
        </button>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
            <span>✓</span> Done!
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span>Before: <strong>{formatBytes(originalSize)}</strong></span>
            <span>→</span>
            <span>After: <strong className="text-emerald-600 dark:text-emerald-400">{formatBytes(resultSize)}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">(-{ratio}%)</span>
          </div>
          <div className="w-48 h-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img src={resultUrl} alt="" className="w-full h-full object-contain" />
          </div>
          <a
            href={resultUrl}
            download={outputName}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Download {outputExt} ({formatBytes(resultSize)})
          </a>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
