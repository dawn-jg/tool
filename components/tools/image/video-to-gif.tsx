'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';

// ffmpeg-core.wasm is ~31MB and exceeds the Cloudflare Pages 25MiB single-asset
// limit, so it is served from jsDelivr CDN instead of being bundled as a static file.
const FFMPEG_CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

const QUALITY_PRESETS = [
  { value: 'low', fps: 8, width: 320, label: '低质量（文件小）' },
  { value: 'medium', fps: 12, width: 480, label: '中等质量' },
  { value: 'high', fps: 15, width: 640, label: '高质量（文件大）' },
];

export function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState('medium');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const ffmpegRef = useRef<any>(null);
  const limiter = useToolLimiter({ toolKey: 'vid2gif' });
  const { checkLimit, markUsed } = limiter;

  const getFFmpeg = useCallback(async () => {
    if (!ffmpegRef.current) {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');
      const ffmpeg = new FFmpeg();
      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(`${(p * 100).toFixed(1)}%`);
      });
      ffmpeg.on('log', ({ message }) => {
        if (message.includes('Output')) setProgress('输出中...');
      });
      await ffmpeg.load({
        coreURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      ffmpegRef.current = ffmpeg;
    }
    return ffmpegRef.current;
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) {
      setError('请选择视频文件');
      return;
    }
    setFile(f);
    setResultUrl('');
    setError('');
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    if (!checkLimit()) return;
    setConverting(true);
    setError('');
    setProgress('加载 ffmpeg 引擎...');
    try {
      const ffmpeg = await getFFmpeg();
      setProgress('读取视频...');
      const { fetchFile } = await import('@ffmpeg/util');
      const data = await fetchFile(file);
      await ffmpeg.writeFile('input', data);

      const preset = QUALITY_PRESETS.find((p) => p.value === quality) || QUALITY_PRESETS[1];
      setProgress('转换中...');
      await ffmpeg.exec([
        '-i', 'input',
        '-vf', `fps=${preset.fps},scale=${preset.width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-y', 'output.gif',
      ]);

      setProgress('生成文件...');
      const out = await ffmpeg.readFile('output.gif');
      const blob = new Blob([out as BlobPart], { type: 'image/gif' });
      setResultUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile('input');
      await ffmpeg.deleteFile('output.gif');
      markUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败，请确认视频格式（MP4/WebM 等）');
    } finally {
      setConverting(false);
      setProgress('');
    }
  }, [file, quality, getFFmpeg, checkLimit, markUsed]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${(file?.name || 'video').replace(/\.[^.]+$/, '')}.gif`;
    a.click();
  }, [resultUrl, file]);

  return (
    <ToolLayout
      title="视频转 GIF"
      description="在线将视频转换为 GIF 动图，支持 MP4/WebM 等格式，可选质量，全程在浏览器本地处理（ffmpeg.wasm）"
      instructions="上传视频文件（MP4、WebM、MOV 等），选择输出质量，点击转换。首次转换需加载约 30MB 的 ffmpeg 引擎（浏览器本地缓存），请耐心等待。视频不会上传到服务器。"
    >
      {!file && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">上传视频</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input type="file" accept="video/*" onChange={handleFile} className="hidden" id="v2g-upload" />
            <label htmlFor="v2g-upload" className="cursor-pointer">
              <p className="text-gray-600 dark:text-gray-400">点击选择视频文件</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">建议 10 秒以内短视频，转换在浏览器本地完成</p>
            </label>
          </div>
        </div>
      )}

      {file && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">输出质量</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {QUALITY_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-gray-500 dark:text-gray-400">已选择：{file.name}（{(file.size / 1024 / 1024).toFixed(1)} MB）</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={convert} disabled={converting} className="btn-primary">
              {converting ? '转换中...' : '转换为 GIF'}
            </button>
            {resultUrl && (
              <button onClick={download} className="btn-primary px-6">
                下载 GIF
              </button>
            )}
          </div>

          {converting && (
            <div className="mb-4 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-600 dark:text-blue-400">{progress}</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: progress.includes('%') ? progress.replace('%', '') + '%' : '0%' }}
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {resultUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">转换结果</p>
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 inline-block">
                <img src={resultUrl} alt="转换结果" className="max-w-full max-h-72" />
              </div>
            </div>
          )}
        </>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
