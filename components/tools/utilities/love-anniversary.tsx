'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

interface Anniversary {
  name: string;
  date: string;
  emoji: string;
}

export function LoveAnniversaryCalculator() {
  const [startDate, setStartDate] = useState('2020-05-20');
  const [partnerName, setPartnerName] = useState('亲爱的');

  const anniversaries = useMemo<Anniversary[]>(() => {
    const start = new Date(startDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return [
      { name: '相识', date: startDate, emoji: '🌟' },
      { name: '在一起', date: startDate, emoji: '💕' },
      { name: '100天', date: getDateAfterDays(start, 100), emoji: '💯' },
      { name: '1个月', date: getDateAfterDays(start, 30), emoji: '🌙' },
      { name: '3个月', date: getDateAfterDays(start, 90), emoji: '🎉' },
      { name: '6个月', date: getDateAfterDays(start, 180), emoji: '🎈' },
      { name: '1年', date: getDateAfterDays(start, 365), emoji: '💑' },
      { name: '2年', date: getDateAfterDays(start, 730), emoji: '🥳' },
      { name: '3年', date: getDateAfterDays(start, 1095), emoji: '🎊' },
      { name: '5年', date: getDateAfterDays(start, 1825), emoji: '💍' },
      { name: '10年', date: getDateAfterDays(start, 3650), emoji: '👑' },
    ];
  }, [startDate]);

  const daysTogether = useMemo(() => {
    const start = new Date(startDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [startDate]);

  const nextAnniversary = useMemo(() => {
    const start = new Date(startDate);
    const today = new Date();
    const thisYear = new Date(today.getFullYear(), start.getMonth(), start.getDate());
    const nextDate = thisYear >= today ? thisYear : new Date(today.getFullYear() + 1, start.getMonth(), start.getDate());
    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { date: nextDate.toISOString().split('T')[0], daysUntil };
  }, [startDate]);

  const getStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return 'upcoming';
    if (date.toDateString() === today.toDateString()) return 'today';
    return 'past';
  };

  const formatCountdown = (days: number) => {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const days_rem = days % 30;
    if (years > 0) return `${years}年${months}月`;
    if (months > 0) return `${months}个月${days_rem}天`;
    return `${days}天`;
  };

  return (
    <ToolLayout
      title="恋爱纪念日计算器"
      description="记录相恋天数，计算下一个纪念日"
      instructions="设置在一起的日子，自动计算相识天数和下一个纪念日的倒计时。支持多种纪念日：100天、1个月、1年、2年、5年、10年等。"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">在一起的日子</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">称呼</label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="亲爱的"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center">
          <p className="text-pink-100 mb-2">{partnerName}</p>
          <p className="text-5xl font-bold mb-2">{daysTogether}</p>
          <p className="text-pink-100 text-lg">相恋天数</p>
        </div>

        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-center">
          <p className="text-yellow-700 dark:text-yellow-300">
            🎊 下个纪念日：{nextAnniversary.date}（还有 {nextAnniversary.daysUntil} 天）
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">纪念日一览</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {anniversaries.map((a) => {
              const status = getStatus(a.date);
              return (
                <div
                  key={a.name}
                  className={`p-4 rounded-xl border-2 ${
                    status === 'today'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 animate-pulse'
                      : status === 'past'
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                      : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{a.emoji}</div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">{a.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{a.date}</div>
                  {status === 'past' && (
                    <div className="text-xs text-pink-500 mt-1">
                      已过 {formatCountdown(daysTogether - Math.floor((new Date(a.date).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))}
                    </div>
                  )}
                  {status === 'today' && (
                    <div className="text-xs text-pink-500 mt-1 font-bold">🎉 今天！</div>
                  )}
                  {status === 'upcoming' && (
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      {formatCountdown(Math.floor((new Date(a.date).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function getDateAfterDays(start: Date, days: number): string {
  const d = new Date(start);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}