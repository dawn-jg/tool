'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useI18n } from '@/lib/i18n';

/*
 * 网速测试工具
 * 直接调用 Cloudflare 官方测速服务 (speed.cloudflare.com/__down, /__up)
 * 纯 fetch/XHR 实现，无第三方依赖，结果在页面内展示
 */

type TestPhase = 'idle' | 'testing' | 'done';

interface SpeedResult {
  download: string;
  upload: string;
  ping: string;
  jitter: string;
}

const CF_DOWN = 'https://speed.cloudflare.com/__down';
const CF_UP = 'https://speed.cloudflare.com/__up';

// 下载测速：流式读取下载数据，实时计算速率
async function runDownload(
  totalBytes: number,
  onProgress: (mbps: number) => void
): Promise<number> {
  const url = `${CF_DOWN}?bytes=${totalBytes}&r=${Math.random()}`;
  const start = performance.now();
  const resp = await fetch(url);
  if (!resp.ok || !resp.body) throw new Error('download failed');
  const reader = resp.body.getReader();
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    const elapsed = (performance.now() - start) / 1000;
    if (elapsed > 0.2) onProgress((received * 8) / elapsed / 1_000_000);
  }
  const elapsed = (performance.now() - start) / 1000;
  if (elapsed <= 0) return 0;
  return (received * 8) / elapsed / 1_000_000;
}

// 上传测速：XHR 带进度事件，onprogress 采样计算速率，超时后取最终值
function runUpload(
  totalBytes: number,
  onProgress: (mbps: number) => void
): Promise<number> {
  return new Promise((resolve) => {
    const chunk = new Uint8Array(1024 * 1024);
    for (let i = 0; i < chunk.length; i++) chunk[i] = Math.floor(Math.random() * 256);
    const parts: BlobPart[] = [];
    for (let i = 0; i < Math.ceil(totalBytes / chunk.length); i++) parts.push(chunk);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${CF_UP}?r=${Math.random()}`, true);

    let lastLoaded = 0;
    let lastTime = performance.now();
    let speed = 0;
    let settled = false;

    const finish = (val: number) => {
      if (settled) return;
      settled = true;
      try {
        xhr.abort();
      } catch (e) {}
      resolve(val);
    };

    xhr.upload.onprogress = (e) => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      if (dt >= 0.5) {
        speed = ((e.loaded - lastLoaded) * 8) / dt / 1_000_000;
        lastLoaded = e.loaded;
        lastTime = now;
        onProgress(speed);
      }
    };

    xhr.onload = () => finish(speed);
    xhr.onerror = () => finish(speed); // 出错也返回已测到的速率，避免中断整轮测试

    // Cloudflare __up 端点上传完成后会挂起连接，12 秒后强制结束取当前速率
    setTimeout(() => finish(speed), 12000);

    xhr.send(new Blob(parts));
  });
}

// 延迟/抖动：多次小请求测量 RTT，平均值为延迟，平均绝对偏差为抖动
async function runPing(count: number): Promise<{ ping: number; jitter: number }> {
  const pings: number[] = [];
  for (let i = 0; i < count; i++) {
    const t0 = performance.now();
    await fetch(`${CF_DOWN}?bytes=100&r=${Math.random()}`, { cache: 'no-store' });
    pings.push(performance.now() - t0);
  }
  const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
  const mad = pings.reduce((a, b) => a + Math.abs(b - avg), 0) / pings.length;
  return { ping: avg, jitter: mad };
}

export default function SpeedTestTool() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [result, setResult] = useState<SpeedResult>({ download: '--', upload: '--', ping: '--', jitter: '--' });
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const startTest = useCallback(async () => {
    setPhase('testing');
    setError(null);
    setResult({ download: '--', upload: '--', ping: '--', jitter: '--' });
    setProgress(0);
    abortRef.current = false;

    try {
      // 1. 下载测速 (25MB)
      setStatus(t('tool.speedTestPhase1'));
      const dl = await runDownload(25_000_000, (mbps) => {
        if (abortRef.current) return;
        setResult((r) => ({ ...r, download: mbps.toFixed(2) }));
      });
      if (abortRef.current) return;
      setResult((r) => ({ ...r, download: dl.toFixed(2) }));
      setProgress(40);

      // 2. 上传测速 (12MB)
      setStatus(t('tool.speedTestPhase3'));
      const ul = await runUpload(12_000_000, (mbps) => {
        if (abortRef.current) return;
        setResult((r) => ({ ...r, upload: mbps.toFixed(2) }));
      });
      if (abortRef.current) return;
      setResult((r) => ({ ...r, upload: ul.toFixed(2) }));
      setProgress(75);

      // 3. 延迟/抖动 (8 次)
      setStatus(t('tool.speedTestPhase2'));
      const { ping, jitter } = await runPing(8);
      if (abortRef.current) return;
      setResult((r) => ({ ...r, ping: ping.toFixed(1), jitter: jitter.toFixed(1) }));
      setProgress(100);

      setPhase('done');
      setStatus(t('tool.speedTestDone'));
    } catch (e) {
      setError(t('tool.speedTestEngineError'));
      setPhase('idle');
      setStatus('');
    }
  }, [t]);

  const stopTest = useCallback(() => {
    abortRef.current = true;
    setPhase('idle');
    setStatus(t('tool.speedTestAborted'));
  }, [t]);

  const metricCard = (label: string, value: string, unit: string, color: string) => (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700/50">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="tool.speedTest"
      description="tool.speedTestDesc"
      instructions="tool.speedTestInstructions"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 指标卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metricCard(t('tool.speedTestDownload'), result.download, 'Mbps', 'text-blue-600 dark:text-blue-400')}
          {metricCard(t('tool.speedTestUpload'), result.upload, 'Mbps', 'text-green-600 dark:text-green-400')}
          {metricCard(t('tool.speedTestPing'), result.ping, 'ms', 'text-purple-600 dark:text-purple-400')}
          {metricCard(t('tool.speedTestJitter'), result.jitter, 'ms', 'text-orange-600 dark:text-orange-400')}
        </div>

        {/* 进度条 */}
        <div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 min-h-[20px]">
            {status}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        {/* 按钮 */}
        <div className="flex justify-center gap-4">
          {phase !== 'testing' ? (
            <button
              onClick={startTest}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              {phase === 'done' ? t('tool.speedTestRestart') : t('tool.speedTestStart')}
            </button>
          ) : (
            <button
              onClick={stopTest}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            >
              {t('tool.speedTestStop')}
            </button>
          )}
        </div>

        {/* 说明 */}
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
          {t('tool.speedTestFooter')}
        </div>
      </div>
    </ToolLayout>
  );
}
