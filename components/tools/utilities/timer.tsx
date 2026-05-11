'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function TimerTool() {
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [time, setTime] = useState(0); // ms
  const [running, setRunning] = useState(false);
  const [countdownInput, setCountdownInput] = useState(60); // seconds
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const start = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (mode === 'countdown' && prev <= 0) {
          clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return mode === 'stopwatch' ? prev + 10 : prev - 10;
      });
    }, 10);
  }, [mode]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setTime(mode === 'countdown' ? countdownInput * 1000 : 0);
    setLaps([]);
  }, [mode, countdownInput, stop]);

  const lap = useCallback(() => {
    setLaps((prev) => [...prev, time]);
  }, [time]);

  const switchMode = (m: 'stopwatch' | 'countdown') => {
    stop();
    setMode(m);
    setTime(m === 'countdown' ? countdownInput * 1000 : 0);
    setLaps([]);
  };

  const formatTime = (ms: number) => {
    const sign = ms < 0 ? '-' : '';
    ms = Math.abs(ms);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  return (
    <ToolLayout
      title="计时器"
      description="在线秒表计时器与倒计时"
      instructions="支持秒表（正计时）和倒计时两种模式。秒表模式可记录各圈成绩，倒计时模式设置目标秒数后开始倒计。精确到10毫秒。"
    >
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => switchMode('stopwatch')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'stopwatch' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            秒表
          </button>
          <button
            onClick={() => switchMode('countdown')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'countdown' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            倒计时
          </button>
        </div>

        {mode === 'countdown' && !running && (
          <div className="mb-4">
            <input
              type="number"
              value={countdownInput}
              onChange={(e) => { setCountdownInput(Number(e.target.value)); setTime(Number(e.target.value) * 1000); }}
              className="w-24 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-sm"
              min={1}
            />
            <span className="ml-2 text-sm text-gray-500">秒</span>
          </div>
        )}

        <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white mb-6 tracking-wider">
          {formatTime(time)}
        </div>

        <div className="flex justify-center gap-3">
          {!running ? (
            <button onClick={start} className="btn-primary">开始</button>
          ) : (
            <button onClick={stop} className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">停止</button>
          )}
          <button onClick={reset} className="btn-secondary">重置</button>
          {mode === 'stopwatch' && running && <button onClick={lap} className="btn-secondary">计圈</button>}
        </div>

        {laps.length > 0 && (
          <div className="mt-6 max-h-48 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2">圈数</th>
                  <th className="py-2">分段时间</th>
                  <th className="py-2">累计时间</th>
                </tr>
              </thead>
              <tbody>
                {laps.map((lapTime, i) => {
                  const prev = i > 0 ? laps[i - 1] : 0;
                  return (
                    <tr key={i} className="font-mono text-gray-800 dark:text-gray-200">
                      <td className="py-1">{i + 1}</td>
                      <td className="py-1">{formatTime(lapTime - prev)}</td>
                      <td className="py-1">{formatTime(lapTime)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
