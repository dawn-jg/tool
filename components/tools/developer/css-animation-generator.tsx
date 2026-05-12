'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type AnimationType = 'fade' | 'slide' | 'bounce' | 'scale' | 'rotate' | 'pulse' | 'shake';

const presets: Record<AnimationType, { from: string; to: string; duration: number }> = {
  fade: { from: 'opacity: 0;', to: 'opacity: 1;', duration: 1 },
  slide: { from: 'transform: translateX(-100%);', to: 'transform: translateX(0);', duration: 0.5 },
  bounce: { from: 'transform: translateY(-50px);', to: 'transform: translateY(0);', duration: 0.6 },
  scale: { from: 'transform: scale(0);', to: 'transform: scale(1);', duration: 0.4 },
  rotate: { from: 'transform: rotate(-180deg);', to: 'transform: rotate(0deg);', duration: 0.5 },
  pulse: { from: 'transform: scale(1); opacity: 1;', to: 'transform: scale(1.1); opacity: 0.8;', duration: 0.8 },
  shake: { from: 'transform: translateX(0);', to: 'transform: translateX(-10px);', duration: 0.1 },
};

export function CssAnimationGenerator() {
  const [type, setType] = useState<AnimationType>('fade');
  const [name, setName] = useState('myAnimation');
  const [duration, setDuration] = useState(1);
  const [iteration, setIteration] = useState(1);
  const [direction, setDirection] = useState<'normal' | 'reverse' | 'alternate' | 'alternate-reverse'>('normal');
  const [timing, setTiming] = useState<'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'>('ease');
  const [delay, setDelay] = useState(0);
  const [playState, setPlayState] = useState<'running' | 'paused'>('running');
  const [customFrom, setCustomFrom] = useState(presets.fade.from);
  const [customTo, setCustomTo] = useState(presets.fade.to);

  const handleTypeChange = (t: AnimationType) => {
    setType(t);
    setCustomFrom(presets[t].from);
    setCustomTo(presets[t].to);
    setDuration(presets[t].duration);
  };

  const cssCode = `@keyframes ${name} {
  from {
    ${customFrom}
  }
  to {
    ${customTo}
  }
}

.animated-element {
  animation-name: ${name};
  animation-duration: ${duration}s;
  animation-timing-function: ${timing};
  animation-delay: ${delay}s;
  animation-iteration-count: ${iteration === 0 ? 'infinite' : iteration};
  animation-direction: ${direction};
  animation-fill-mode: forwards;
  animation-play-state: ${playState};
}

/* 简写 */
.animated-element {
  animation: ${name} ${duration}s ${timing} ${delay}s ${iteration === 0 ? 'infinite' : iteration} ${direction} forwards;
}`;

  return (
    <ToolLayout
      title="CSS Animation 生成器"
      description="可视化生成CSS @keyframes动画代码"
      instructions="选择预设动画或自定义动画属性，生成可复制的CSS动画代码"
    >
      {/* Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">动画预设</label>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {(Object.keys(presets) as AnimationType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-2 py-2 rounded-lg text-xs font-medium capitalize transition ${
                type === t ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-center h-32 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <div
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"
            style={{
              animation: `${name} ${duration}s ${timing} ${delay}s ${iteration === 0 ? 'infinite' : iteration} ${direction} forwards`,
              animationPlayState: playState,
            }}
          />
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">动画名称</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">时长 (s)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={0.1} max={10} step={0.1} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">循环次数</label>
          <input type="number" value={iteration} onChange={(e) => setIteration(Number(e.target.value))} min={0} max={100} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <span className="text-xs text-gray-500">0 = infinite</span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">延迟 (s)</label>
          <input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} min={0} max={10} step={0.1} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">缓动函数</label>
          <select value={timing} onChange={(e) => setTiming(e.target.value as typeof timing)} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="ease">ease</option>
            <option value="linear">linear</option>
            <option value="ease-in">ease-in</option>
            <option value="ease-out">ease-out</option>
            <option value="ease-in-out">ease-in-out</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">方向</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value as typeof direction)} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="normal">normal</option>
            <option value="reverse">reverse</option>
            <option value="alternate">alternate</option>
            <option value="alternate-reverse">alternate-reverse</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => setPlayState(playState === 'running' ? 'paused' : 'running')} className="btn-primary w-full">
            {playState === 'running' ? '暂停' : '播放'}
          </button>
        </div>
      </div>

      {/* Custom Keyframes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">自定义 Keyframes</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500 block mb-1">from { }</span>
            <textarea
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono h-20 resize-none"
            />
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-1">to { }</span>
            <textarea
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono h-20 resize-none"
            />
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS 代码</p>
          <CopyButton text={cssCode} />
        </div>
        <pre className="p-4 rounded-lg bg-gray-900 text-green-400 text-sm font-mono overflow-auto max-h-64">
          {cssCode}
        </pre>
      </div>
    </ToolLayout>
  );
}
