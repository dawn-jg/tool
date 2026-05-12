'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function LuckyWheel() {
  const [prizes, setPrizes] = useState([
    { name: '一等奖', weight: 5, emoji: '🏆', color: '#ffd700' },
    { name: '二等奖', weight: 15, emoji: '🥈', color: '#c0c0c0' },
    { name: '三等奖', weight: 20, emoji: '🥉', color: '#cd7f32' },
    { name: '四等奖', weight: 25, emoji: '🎁', color: '#ff69b4' },
    { name: '谢谢参与', weight: 35, emoji: '😢', color: '#808080' },
  ]);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinCount, setSpinCount] = useState(0);

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    let random = Math.random() * totalWeight;
    let selectedIndex = prizes.length - 1;
    
    for (let i = 0; i < prizes.length; i++) {
      random -= prizes[i].weight;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const segmentAngle = 360 / prizes.length;
    const targetAngle = selectedIndex * segmentAngle + segmentAngle / 2;
    const extraSpins = 5 + Math.random() * 3;
    const finalRotation = rotation + extraSpins * 360 + (360 - targetAngle) + 720;

    setRotation(finalRotation);

    setTimeout(() => {
      setResult(prizes[selectedIndex].emoji + ' ' + prizes[selectedIndex].name);
      setIsSpinning(false);
      setSpinCount((c) => c + 1);
    }, 5000);
  };

  const addPrize = () => {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setPrizes((prev) => [...prev, { name: '新奖品', weight: 10, emoji: '🎁', color: randomColor }]);
  };

  const updatePrize = (index: number, field: string, value: any) => {
    setPrizes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removePrize = (index: number) => {
    if (prizes.length <= 2) return;
    setPrizes((prev) => prev.filter((_, i) => i !== index));
  };

  const segmentAngle = 360 / prizes.length;

  return (
    <ToolLayout
      title="幸运大转盘"
      description="抽奖大转盘，可自定义奖品"
      instructions="设置奖品和概率，点击开始抽奖。支持自定义奖品名称、emoji、颜色和概率权重。"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-yellow-500"
                   style={{ borderTopWidth: '24px' }} />
            </div>

            <div
              className="w-72 h-72 md:w-96 md:h-96 rounded-full border-4 border-gray-800 dark:border-gray-200 transition-all ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: '5000ms',
                background: `conic-gradient(${prizes.map((p, i) => `${p.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ')})`,
              }}
            >
              {prizes.map((prize, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)` }}
                >
                  <span className="text-3xl md:text-4xl" style={{ transform: 'rotate(90deg)' }}>{prize.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`btn-primary px-12 py-4 text-xl ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSpinning ? '🎰 抽奖中...' : '🎯 开始抽奖'}
          </button>
        </div>

        {result && (
          <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold">
            🎉 {result}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          已抽奖次数：{spinCount}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">奖品设置</h3>
            <button onClick={addPrize} className="text-sm text-blue-500 hover:text-blue-600">+ 添加奖品</button>
          </div>
          <div className="space-y-2">
            {prizes.map((prize, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <input
                  type="color"
                  value={prize.color}
                  onChange={(e) => updatePrize(index, 'color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={prize.name}
                  onChange={(e) => updatePrize(index, 'name', e.target.value)}
                  className="flex-1 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                />
                <input
                  type="text"
                  value={prize.emoji}
                  onChange={(e) => updatePrize(index, 'emoji', e.target.value)}
                  className="w-12 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center"
                />
                <input
                  type="number"
                  value={prize.weight}
                  onChange={(e) => updatePrize(index, 'weight', parseInt(e.target.value) || 0)}
                  min={1}
                  className="w-20 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center"
                />
                <span className="text-xs text-gray-400 w-16 text-right">
                  {((prize.weight / totalWeight) * 100).toFixed(1)}%
                </span>
                <button onClick={() => removePrize(index)} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}