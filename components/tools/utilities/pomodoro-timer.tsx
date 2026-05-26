'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

type PomodoroState = 'idle' | 'working' | 'break' | 'longBreak';

interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export function PomodoroTimer() {
  const [settings] = useState<PomodoroSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  });
  
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [state, setState] = useState<PomodoroState>('idle');
  const [sessions, setSessions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  const handleStartPause = () => {
    if (state === 'idle') {
      setState('working');
      startTimer();
    } else if (intervalRef.current) {
      stopTimer();
      // Keep state as-is (working/break) for resume
    } else {
      // Resume from pause — state is still correct
      startTimer();
    }
  };

  const reset = () => {
    stopTimer();
    setState('idle');
    setTimeLeft(settings.workDuration * 60);
    setSessions(0);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      stopTimer();
      if (state === 'working') {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        setTotalSessions((prev) => prev + 1);
        
        if (newSessions >= settings.sessionsBeforeLongBreak) {
          setState('longBreak');
          setTimeLeft(settings.longBreakDuration * 60);
          setSessions(0);
        } else {
          setState('break');
          setTimeLeft(settings.breakDuration * 60);
        }
      } else if (state === 'break' || state === 'longBreak') {
        setState('working');
        setTimeLeft(settings.workDuration * 60);
      }
    }
  }, [timeLeft, state, sessions, settings, stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    if (state === 'working') return settings.workDuration * 60;
    if (state === 'break') return settings.breakDuration * 60;
    if (state === 'longBreak') return settings.longBreakDuration * 60;
    return settings.workDuration * 60;
  };

  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;

  const stateColors = {
    idle: 'bg-gray-100 dark:bg-gray-800',
    working: 'bg-red-50 dark:bg-red-900/20',
    break: 'bg-green-50 dark:bg-green-900/20',
    longBreak: 'bg-blue-50 dark:bg-blue-900/20',
  };

  const stateLabels = {
    idle: '准备开始',
    working: '专注中 🔴',
    break: '休息中 🟢',
    longBreak: '长休息中 🔵',
  };

  return (
    <ToolLayout
      title="番茄钟专注器"
      description="专注时间管理，提高效率"
      instructions="点击开始专注，25分钟后自动休息5分钟。每完成4个番茄钟后休息15分钟。专注于任务，避免中断。"
    >
      <div className="space-y-6">
        <div className={`p-8 rounded-3xl ${stateColors[state]} transition-colors`}>
          <div className="text-center mb-6">
            <span className="text-lg font-medium">{stateLabels[state]}</span>
          </div>

          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={state === 'idle' ? 'text-gray-400' : state === 'working' ? 'text-red-500' : state === 'break' ? 'text-green-500' : 'text-blue-500'}
                style={{ strokeDasharray: 754, strokeDashoffset: 754 - (754 * progress) / 100 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-mono font-bold text-gray-800 dark:text-white">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            第 {sessions + 1} / {settings.sessionsBeforeLongBreak} 个番茄钟
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={handleStartPause} className="btn-primary px-8 py-3 text-lg">
            {!intervalRef.current ? '开始' : '暂停'}
          </button>
          <button onClick={reset} className="btn-secondary px-8 py-3 text-lg">
            重置
          </button>
        </div>

        <div className="flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>🍅 今日完成：{totalSessions} 个番茄钟</span>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">番茄钟规则</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 专注工作 25 分钟，休息 5 分钟</li>
            <li>• 每 4 个番茄钟后，休息 15-30 分钟</li>
            <li>• 专注期间尽量不要中断</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}