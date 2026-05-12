'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type GradientType = 'linear' | 'radial' | 'conic';
type ColorStop = { color: string; pos: number };

export function GradientGenerator() {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#3B82F6', pos: 0 },
    { color: '#8B5CF6', pos: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const addStop = useCallback(() => {
    const lastStop = stops[stops.length - 1];
    const midPos = lastStop ? Math.min(lastStop.pos + 25, 100) : 50;
    setStops([...stops, { color: '#ffffff', pos: midPos }]);
  }, [stops]);

  const removeStop = useCallback((index: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== index));
  }, [stops]);

  const updateStop = useCallback((index: number, field: 'color' | 'pos', value: string | number) => {
    setStops(stops.map((s, i) => i === index ? { ...s, [field]: field === 'color' ? value : Number(value) } : s));
  }, [stops]);

  const sortedStops = [...stops].sort((a, b) => a.pos - b.pos);

  const buildGradient = () => {
    const colorStr = sortedStops.map(s => `${s.color} ${s.pos}%`).join(', ');
    if (type === 'linear') return `linear-gradient(${angle}deg, ${colorStr})`;
    if (type === 'radial') return `radial-gradient(circle, ${colorStr})`;
    return `conic-gradient(from ${angle}deg, ${colorStr})`;
  };

  const cssCode = `.gradient-bg {
  background: ${buildGradient()};
}

/* Tailwind CSS */
<div className="bg-gradient-to-br from-[${sortedStops[0]?.color}] to-[${sortedStops[sortedStops.length - 1]?.color}]"></div>`;

  const copy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="渐变背景生成器"
      description="可视化生成CSS渐变背景代码"
      instructions="选择渐变类型、添加颜色断点、调整角度，生成可复制的CSS渐变代码。"
    >
      {/* Type Selection */}
      <div className="flex gap-2 mb-6">
        {(['linear', 'radial', 'conic'] as GradientType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              type === t ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t === 'linear' ? '线性渐变' : t === 'radial' ? '径向渐变' : '圆锥渐变'}
          </button>
        ))}
        {type === 'linear' && (
          <div className="flex items-center gap-2 ml-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">角度</label>
            <input
              type="number"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value) % 360)}
              className="w-16 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center"
            />
            <span className="text-sm text-gray-500">°</span>
          </div>
        )}
      </div>

      {/* Preview */}
      <div
        className="w-full h-48 rounded-xl mb-6 shadow-lg"
        style={{ background: buildGradient() }}
      />

      {/* Color Stops */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">颜色断点</label>
          <button onClick={addStop} className="btn-secondary text-xs px-3 py-1">+ 添加</button>
        </div>
        <div className="space-y-2">
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(i, 'color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={stop.color}
                onChange={(e) => updateStop(i, 'color', e.target.value)}
                className="w-24 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={stop.pos}
                onChange={(e) => updateStop(i, 'pos', e.target.value)}
                className="flex-1 h-2 rounded cursor-pointer accent-blue-500"
              />
              <span className="w-12 text-sm text-gray-500 text-right">{stop.pos}%</span>
              <button
                onClick={() => removeStop(i)}
                disabled={stops.length <= 2}
                className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Bar Preview */}
      <div className="h-6 rounded-full mb-6 shadow-inner" style={{ background: buildGradient() }} />

      {/* CSS Output */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS 代码</p>
          <button onClick={copy} className="btn-primary text-xs px-3 py-1">{copied ? '已复制!' : '复制'}</button>
        </div>
        <pre className="p-4 rounded-lg bg-gray-900 text-green-400 text-sm font-mono overflow-auto">
          {cssCode}
        </pre>
      </div>
    </ToolLayout>
  );
}
