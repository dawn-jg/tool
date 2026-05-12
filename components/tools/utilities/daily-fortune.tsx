'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

const fortunes = [
  { rank: '大吉', emoji: '🌟', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', desc: '今日运势极佳，诸事顺意！' },
  { rank: '中吉', emoji: '🎉', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', desc: '运势不错，保持好心情！' },
  { rank: '小吉', emoji: '😊', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: '运势平稳，适合稳扎稳打。' },
  { rank: '吉', emoji: '🍀', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: '整体不错，可能有小惊喜。' },
  { rank: '平', emoji: '🌤️', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', desc: '普通的一天，保持平常心。' },
  { rank: '凶', emoji: '🌧️', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', desc: '运势欠佳，注意防小人。' },
  { rank: '大凶', emoji: '⚠️', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', desc: '今日谨慎，避免冲动决策。' },
];

const luckyColors = ['红色', '蓝色', '绿色', '黄色', '紫色', '粉色', '白色', '黑色', '金色', '银色'];
const luckyNumbers = ['3', '7', '9', '12', '18', '24', '36', '48', '66', '88'];
const directions = ['正北', '正南', '正东', '正西', '东南', '东北', '西南', '西北'];

const goodDeeds = [
  '帮助同事解决问题',
  '给陌生人一个微笑',
  '随手捡起垃圾',
  '给老人让座',
  '给家人一个拥抱',
  '喝足够的水',
  '做10分钟运动',
  '整理房间',
  '阅读30分钟',
  '早点睡觉',
];

const tips = [
  '今日适合制定计划',
  '注意控制情绪',
  '保持积极心态',
  '多与他人沟通',
  '注重细节',
  '避免过度消费',
  '多听少说',
  '适当休息',
  '保持专注',
  '勇往直前',
];

export function DailyFortune() {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [result, setResult] = useState<any>(null);

  const generateFortune = useMemo(() => {
    if (!name && !birthday) return null;

    const seed = (name + birthday).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pseudoRandom = (n: number) => Math.abs(Math.sin(seed * n + seed)) * 10000 % 1;

    const fortuneIndex = Math.floor(pseudoRandom(1) * fortunes.length);
    const colorIndex = Math.floor(pseudoRandom(2) * luckyColors.length);
    const numberIndex = Math.floor(pseudoRandom(3) * luckyNumbers.length);
    const directionIndex = Math.floor(pseudoRandom(4) * directions.length);
    const deedIndex = Math.floor(pseudoRandom(5) * goodDeeds.length);
    const tipIndex = Math.floor(pseudoRandom(6) * tips.length);

    return {
      fortune: fortunes[fortuneIndex],
      luckyColor: luckyColors[colorIndex],
      luckyNumber: luckyNumbers[numberIndex],
      direction: directions[directionIndex],
      goodDeed: goodDeeds[deedIndex],
      tip: tips[tipIndex],
    };
  }, [name, birthday]);

  const handleGenerate = () => {
    if (name || birthday) {
      setResult(generateFortune);
    }
  };

  return (
    <ToolLayout
      title="每日运势生成器"
      description="输入姓名和生日，生成今日运势"
      instructions="输入姓名和生日，点击生成按钮查看今日运势。运势基于姓名和生日生成，每日不同，仅供娱乐。"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入姓名"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">生日</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <button onClick={handleGenerate} className="btn-primary w-full py-3">
          🔮 查看今日运势
        </button>

        {result && (
          <div className="space-y-4">
            <div className={`p-8 rounded-3xl ${result.fortune.bg} text-center`}>
              <div className="text-6xl mb-4">{result.fortune.emoji}</div>
              <div className={`text-3xl font-bold ${result.fortune.color} mb-2`}>{result.fortune.rank}</div>
              <p className="text-gray-600 dark:text-gray-400">{result.fortune.desc}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-center">
                <div className="text-2xl mb-1">🎨</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">幸运色</div>
                <div className="font-bold text-orange-600 dark:text-orange-400">{result.luckyColor}</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                <div className="text-2xl mb-1">🔢</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">幸运数</div>
                <div className="font-bold text-blue-600 dark:text-blue-400">{result.luckyNumber}</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center">
                <div className="text-2xl mb-1">🧭</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">幸运方位</div>
                <div className="font-bold text-purple-600 dark:text-purple-400">{result.direction}</div>
              </div>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
                <div className="text-2xl mb-1">💪</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">今日建议</div>
                <div className="font-bold text-green-600 dark:text-green-400">{result.goodDeed}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">💡 今日提示</p>
              <p className="text-gray-700 dark:text-gray-300">{result.tip}</p>
            </div>

            <p className="text-xs text-center text-gray-400">
              ⚠️ 仅供娱乐，请勿过度认真对待运势结果
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}