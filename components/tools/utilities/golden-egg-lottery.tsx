'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

interface Prize {
  name: string;
  weight: number;
  emoji: string;
}

export function GoldenEggLottery() {
  const [eggColor, setEggColor] = useState('#FFD700');
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: '一等奖', weight: 5, emoji: '🏆' },
    { name: '二等奖', weight: 15, emoji: '🥈' },
    { name: '三等奖', weight: 30, emoji: '🥉' },
    { name: '谢谢参与', weight: 50, emoji: '😢' },
  ]);
  const [isHammering, setIsHammering] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hammerCount, setHammerCount] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showEgg, setShowEgg] = useState(true);

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);

  const roll = useCallback(() => {
    if (isHammering) return;

    setIsHammering(true);
    setShowEgg(false);
    setResult(null);

    let random = Math.random() * totalWeight;
    let selected = prizes[prizes.length - 1];

    for (const prize of prizes) {
      random -= prize.weight;
      if (random <= 0) {
        selected = prize;
        break;
      }
    }

    setTimeout(() => {
      setResult(selected.emoji + ' ' + selected.name);
      setHammerCount((c) => c + 1);
      setHistory((prev) => [selected.name + ' - ' + selected.emoji, ...prev].slice(0, 50));
      setIsHammering(false);
      setShowEgg(true);
    }, 1500);
  }, [isHammering, prizes, totalWeight]);

  const addPrize = () => {
    setPrizes((prev) => [...prev, { name: '新奖品', weight: 10, emoji: '🎁' }]);
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    setPrizes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removePrize = (index: number) => {
    setPrizes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ToolLayout
      title="砸金蛋抽奖"
      description="砸金蛋抽奖游戏，可自定义奖品概率"
      instructions="设置奖品和概率，点击金蛋开始抽奖。概率权重越高，中奖几率越大。"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="relative inline-block">
            {showEgg ? (
              <div
                className={`cursor-pointer transition-transform ${isHammering ? '' : 'hover:scale-110'}`}
                onClick={roll}
                title="点击砸金蛋"
              >
                <span className="text-9xl" style={{ 
                  color: eggColor,
                  textShadow: `0 0 40px ${eggColor}, 0 0 80px ${eggColor}80, 0 0 120px ${eggColor}40`
                }}>🥚</span>
              </div>
            ) : (
              <div className="text-9xl animate-bounce">
                💥
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {isHammering ? '砸！' : '点击金蛋开始抽奖'}
          </p>
        </div>

        <div className="text-center">
          <label className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>金蛋颜色：</span>
            <input
              type="color"
              value={eggColor}
              onChange={(e) => setEggColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <span>{eggColor}</span>
          </label>
        </div>

        {result && (
          <div className={`text-center p-6 rounded-2xl text-2xl font-bold ${
            result.includes('谢谢参与') || result.includes('😢')
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
          }`}>
            {result}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          已砸次数：{hammerCount}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">奖品设置</h3>
            <button onClick={addPrize} className="text-sm text-blue-500 hover:text-blue-600">+ 添加奖品</button>
          </div>
          <div className="space-y-2">
            {prizes.map((prize, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-2xl">{prize.emoji}</span>
                <input
                  type="text"
                  value={prize.name}
                  onChange={(e) => updatePrize(index, 'name', e.target.value)}
                  className="flex-1 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                />
                <input
                  type="number"
                  value={prize.weight}
                  onChange={(e) => updatePrize(index, 'weight', parseInt(e.target.value) || 0)}
                  min={1}
                  className="w-20 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center"
                />
                <span className="text-xs text-gray-400 w-20 text-right">
                  {((prize.weight / totalWeight) * 100).toFixed(1)}%
                </span>
                <button onClick={() => removePrize(index)} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">抽奖记录</span>
              <button onClick={() => setHistory([])} className="text-xs text-gray-500 hover:text-red-500">清空</button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {history.map((h, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">{h}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}