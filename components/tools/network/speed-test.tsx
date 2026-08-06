'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useI18n } from '@/lib/i18n';

/*
 * 网速测试工具
 * 测速引擎: LibreSpeed (https://github.com/librespeed/speedtest) - GNU LGPLv3
 * 测速后端: Cloudflare 官方测速服务 (speed.cloudflare.com/__down, /__up)
 * 数据通过 Cloudflare 全球边缘节点传输，结果反映用户到最近边缘节点的网络质量
 */

interface SpeedResult {
  download: string;
  upload: string;
  ping: string;
  jitter: string;
}

type TestPhase = 'idle' | 'testing' | 'done';

// 动态加载 LibreSpeed 脚本（放 public/speedtest/ 下）
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('script load failed'));
    document.body.appendChild(script);
  });
}

export default function SpeedTestTool() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [result, setResult] = useState<SpeedResult>({ download: '--', upload: '--', ping: '--', jitter: '--' });
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [libLoaded, setLibLoaded] = useState(false);
  const speedtestRef = useRef<any>(null);

  useEffect(() => {
    setStatus(t('tool.speedTestReady'));
  }, [t]);

  // 加载 LibreSpeed 引擎
  useEffect(() => {
    let mounted = true;
    loadScript('/speedtest/speedtest.js')
      .then(() => {
        if (mounted && typeof (window as any).Speedtest === 'function') {
          setLibLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) setError(t('tool.speedTestLoadError'));
      });
    return () => {
      mounted = false;
    };
  }, [t]);

  const startTest = useCallback(() => {
    if (!libLoaded) {
      setError(t('tool.speedTestLoadError'));
      return;
    }
    setPhase('testing');
    setError(null);
    setResult({ download: '--', upload: '--', ping: '--', jitter: '--' });
    setProgress(0);

    let s: any;
    try {
      s = new (window as any).Speedtest();
    } catch (e) {
      setError(t('tool.speedTestEngineError'));
      setPhase('idle');
      return;
    }
    speedtestRef.current = s;

    // 配置 Cloudflare 官方测速端点
    s.setParameter('url_dl', 'https://speed.cloudflare.com/__down?bytes=25000000');
    s.setParameter('url_ul', 'https://speed.cloudflare.com/__up');
    s.setParameter('url_ping', 'https://speed.cloudflare.com/__down?bytes=100');
    s.setParameter('telemetry_level', 0);
    s.setParameter('garbagePhp_chunkSize', 25000000);
    s.setParameter('xhr_dlMultistream', 4);
    s.setParameter('xhr_ulMultistream', 4);
    s.setParameter('time_dl_max', 12);
    s.setParameter('time_ul_max', 12);
    s.setParameter('test_order', 'D_U_P');

    const phases: Record<number, string> = {
      0: t('tool.speedTestPhase0'),
      1: t('tool.speedTestPhase1'),
      2: t('tool.speedTestPhase2'),
      3: t('tool.speedTestPhase3'),
      4: t('tool.speedTestPhase4'),
      5: t('tool.speedTestPhase5'),
    };

    s.onupdate = function (d: any) {
      setResult({
        download: d.dlStatus || '--',
        upload: d.ulStatus || '--',
        ping: d.pingStatus || '--',
        jitter: d.jitterStatus || '--',
      });
      const p = Math.max(d.dlProgress || 0, d.ulProgress || 0, d.pingProgress || 0);
      setProgress(Math.round(p * 100));
      setStatus(phases[d.testState] || '');
    };

    s.onend = function () {
      setPhase('done');
      setProgress(100);
      setStatus(t('tool.speedTestDone'));
    };

    s.start();
  }, [libLoaded, t]);

  const stopTest = useCallback(() => {
    if (speedtestRef.current) {
      try {
        speedtestRef.current.abort();
      } catch (e) {}
    }
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
              disabled={!libLoaded}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              {!libLoaded ? t('tool.speedTestLoading') : phase === 'done' ? t('tool.speedTestRestart') : t('tool.speedTestStart')}
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
