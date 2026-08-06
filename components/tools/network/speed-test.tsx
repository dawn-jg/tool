'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useI18n } from '@/lib/i18n';

/*
 * 网速测试工具
 * 测速引擎: Ookla Speedtest (speedtest.net)
 * 服务器列表经 /api/speedtest 代理获取（Ookla 服务器不开放 CORS，无法直连）
 * 下载/上传/延迟均通过站内代理转发到 Ookla 测速服务器，结果在页面内展示
 */

type TestPhase = 'idle' | 'loading' | 'testing' | 'done';

interface SpeedResult {
  download: string;
  upload: string;
  ping: string;
  jitter: string;
}

interface OoklaServer {
  id: string;
  name: string;
  country: string;
  cc: string;
  sponsor: string;
  host: string;
  base: string;
}

const DOWNLOAD_FILE = 'random1000x1000.jpg';
const UPLOAD_BYTES = 12_000_000;
const DOWNLOAD_DURATION = 10_000; // ms

// 下载测速：循环拉取测速文件，流式数字节，实时计算速率
async function runDownload(
  serverId: string,
  onProgress: (mbps: number) => void
): Promise<number> {
  const start = performance.now();
  let total = 0;
  let lastTime = start;
  let lastBytes = 0;
  while (performance.now() - start < DOWNLOAD_DURATION) {
    const resp = await fetch(`/api/speedtest?action=download&id=${serverId}&file=${DOWNLOAD_FILE}`);
    if (!resp.ok || !resp.body) throw new Error('download failed');
    const reader = resp.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      const now = performance.now();
      if (now - lastTime > 400) {
        const dt = (now - lastTime) / 1000;
        const mbps = ((total - lastBytes) * 8) / dt / 1_000_000;
        lastTime = now;
        lastBytes = total;
        onProgress(mbps);
      }
    }
  }
  const elapsed = (performance.now() - start) / 1000;
  if (elapsed <= 0) return 0;
  return (total * 8) / elapsed / 1_000_000;
}

// 上传测速：XHR POST 到站内代理（同源），onprogress 采样速率，超时取最终值
function runUpload(
  serverId: string,
  onProgress: (mbps: number) => void
): Promise<number> {
  return new Promise((resolve) => {
    const chunk = new Uint8Array(1024 * 1024);
    for (let i = 0; i < chunk.length; i++) chunk[i] = Math.floor(Math.random() * 256);
    const parts: BlobPart[] = [];
    for (let i = 0; i < Math.ceil(UPLOAD_BYTES / chunk.length); i++) parts.push(chunk);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/speedtest?action=upload&id=${serverId}`, true);

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
      if (dt >= 0.4) {
        speed = ((e.loaded - lastLoaded) * 8) / dt / 1_000_000;
        lastLoaded = e.loaded;
        lastTime = now;
        onProgress(speed);
      }
    };

    xhr.onload = () => finish(speed);
    xhr.onerror = () => finish(speed); // 出错也返回已测到的速率，避免中断整轮测试

    setTimeout(() => finish(speed), 12000);

    xhr.send(new Blob(parts));
  });
}

// 延迟/抖动：多次请求站内 ping 代理，平均值为延迟，平均绝对偏差为抖动
async function runPing(serverId: string, count: number): Promise<{ ping: number; jitter: number }> {
  const pings: number[] = [];
  for (let i = 0; i < count; i++) {
    const t0 = performance.now();
    await fetch(`/api/speedtest?action=ping&id=${serverId}`);
    pings.push(performance.now() - t0);
  }
  const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
  const mad = pings.reduce((a, b) => a + Math.abs(b - avg), 0) / pings.length;
  return { ping: avg, jitter: mad };
}

export default function SpeedTestTool() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [servers, setServers] = useState<OoklaServer[]>([]);
  const [serverId, setServerId] = useState('');
  const [result, setResult] = useState<SpeedResult>({ download: '--', upload: '--', ping: '--', jitter: '--' });
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  // 加载 Ookla 服务器列表（优先中国节点），并行探测可用性，自动选最快节点
  useEffect(() => {
    let mounted = true;
    setPhase('loading');
    setStatus(t('tool.speedTestLoading'));
    fetch('/api/speedtest?action=servers&search=China,Beijing,Shanghai,Guangzhou,Hong%20Kong')
      .then((r) => r.json())
      .then(async (data) => {
        if (!mounted) return;
        if (!data.servers || data.servers.length === 0) {
          setError(t('tool.speedTestNoServer'));
          setPhase('idle');
          setStatus('');
          return;
        }
        // 并行探测各节点可用性与延迟
        const probed = await Promise.all(
          data.servers.map(async (s: OoklaServer) => {
            try {
              const t0 = performance.now();
              const r = await fetch(`/api/speedtest?action=ping&id=${s.id}`);
              const j = await r.json();
              return {
                ...s,
                ok: j.status === 200,
                rtt: j.ms + (performance.now() - t0),
              };
            } catch (e) {
              return { ...s, ok: false, rtt: Infinity };
            }
          })
        );
        if (!mounted) return;
        const usable = probed
          .filter((s: any) => s.ok)
          .sort((a: any, b: any) => a.rtt - b.rtt);
        if (usable.length === 0) {
          setError(t('tool.speedTestNoServer'));
          setPhase('idle');
          setStatus('');
          return;
        }
        setServers(usable);
        setServerId(usable[0].id);
        setPhase('idle');
        setStatus(t('tool.speedTestReady'));
      })
      .catch(() => {
        if (!mounted) return;
        setError(t('tool.speedTestLoadError'));
        setPhase('idle');
        setStatus('');
      });
    return () => {
      mounted = false;
    };
  }, [t]);

  const startTest = useCallback(async () => {
    if (!serverId) return;
    setPhase('testing');
    setError(null);
    setResult({ download: '--', upload: '--', ping: '--', jitter: '--' });
    setProgress(0);
    abortRef.current = false;

    try {
      // 1. 延迟/抖动 (8 次)
      setStatus(t('tool.speedTestPhase2'));
      const { ping, jitter } = await runPing(serverId, 8);
      if (abortRef.current) return;
      setResult((r) => ({ ...r, ping: ping.toFixed(0), jitter: jitter.toFixed(0) }));
      setProgress(15);

      // 2. 下载测速 (10 秒)
      setStatus(t('tool.speedTestPhase1'));
      const dl = await runDownload(serverId, (mbps) => {
        if (abortRef.current) return;
        setResult((r) => ({ ...r, download: mbps.toFixed(2) }));
      });
      if (abortRef.current) return;
      setResult((r) => ({ ...r, download: dl.toFixed(2) }));
      setProgress(65);

      // 3. 上传测速 (12MB)
      setStatus(t('tool.speedTestPhase3'));
      const ul = await runUpload(serverId, (mbps) => {
        if (abortRef.current) return;
        setResult((r) => ({ ...r, upload: mbps.toFixed(2) }));
      });
      if (abortRef.current) return;
      setResult((r) => ({ ...r, upload: ul.toFixed(2) }));
      setProgress(100);

      setPhase('done');
      setStatus(t('tool.speedTestDone'));
    } catch (e) {
      setError(t('tool.speedTestEngineError'));
      setPhase('idle');
      setStatus('');
    }
  }, [serverId, t]);

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
        {/* 服务器选择 */}
        {servers.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              {t('tool.speedTestServer')}
            </label>
            <select
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              disabled={phase === 'testing'}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-100 disabled:opacity-50"
            >
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.sponsor}
                </option>
              ))}
            </select>
          </div>
        )}

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
              disabled={phase === 'loading' || !serverId}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              {phase === 'loading' ? t('tool.speedTestLoading') : phase === 'done' ? t('tool.speedTestRestart') : t('tool.speedTestStart')}
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
