'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

interface Countdown {
  id: string;
  name: string;
  targetDate: string;
  emoji: string;
}

export function CountdownDays() {
  const [countdowns, setCountdowns] = useState<Countdown[]>(() => {
    const saved = localStorage.getItem('countdowns');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '高考', targetDate: '2026-06-07', emoji: '📚' },
      { id: '2', name: '春节', targetDate: '2027-01-29', emoji: '🧧' },
    ];
  });
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newEmoji, setNewEmoji] = useState('📅');

  useEffect(() => {
    localStorage.setItem('countdowns', JSON.stringify(countdowns));
  }, [countdowns]);

  const addCountdown = () => {
    if (!newName || !newDate) return;
    setCountdowns((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName, targetDate: newDate, emoji: newEmoji }
    ]);
    setNewName('');
    setNewDate('');
  };

  const removeCountdown = (id: string) => {
    setCountdowns((prev) => prev.filter((c) => c.id !== id));
  };

  const getTimeLeft = (target: string) => {
    const now = new Date();
    const targetDate = new Date(target);
    const diff = targetDate.getTime() - now.getTime();

    if (diff < 0) {
      const past = Math.abs(diff);
      const days = Math.floor(past / (1000 * 60 * 60 * 24));
      const hours = Math.floor((past % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { days, hours, minutes: Math.floor((past % (1000 * 60 * 60)) / (1000 * 60)), past: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, past: false };
  };

  const emojis = ['📅', '🎯', '📚', '🎓', '💼', '🏠', '💒', '✈️', '🎉', '🧧', '🎄', '🌸', '❤️', '⭐', '🔥'];

  return (
    <ToolLayout
      title="倒计时日"
      description="重要日子倒计时"
      instructions="添加倒计时目标，自动计算距离目标日期的天数、小时、分钟。支持多个倒计时，本地存储。"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="事件名称"
            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <span className="text-2xl">{newEmoji}</span>
            <select
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              className="flex-1 bg-transparent outline-none"
            >
              {emojis.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <button onClick={addCountdown} className="btn-primary">添加</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countdowns.map((countdown) => {
            const timeLeft = getTimeLeft(countdown.targetDate);
            return (
              <div
                key={countdown.id}
                className={`p-6 rounded-2xl border-2 ${
                  timeLeft.past
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                    : timeLeft.days <= 7
                    ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    : timeLeft.days <= 30
                    ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{countdown.emoji}</div>
                  <button onClick={() => removeCountdown(countdown.id)} className="text-gray-400 hover:text-red-500">✕</button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{countdown.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{countdown.targetDate}</p>
                {timeLeft.past ? (
                  <div className="text-center py-3">
                    <p className="text-3xl font-bold text-gray-400">{timeLeft.days}</p>
                    <p className="text-sm text-gray-500">天前</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-2">
                      <p className="text-2xl font-bold">{timeLeft.days}</p>
                      <p className="text-xs text-gray-500">天</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-2">
                      <p className="text-2xl font-bold">{timeLeft.hours}</p>
                      <p className="text-xs text-gray-500">时</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-2">
                      <p className="text-2xl font-bold">{timeLeft.minutes}</p>
                      <p className="text-xs text-gray-500">分</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}