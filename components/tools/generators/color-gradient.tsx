'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function ColorGradient() {
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#ec4899');
  const [direction, setDirection] = useState('to right');
  const [type, setType] = useState<'linear' | 'radial'>('linear');

  const css = useMemo(() => {
    if (type === 'linear') return `linear-gradient(${direction}, ${color1}, ${color2})`;
    return `radial-gradient(circle, ${color1}, ${color2})`;
  }, [color1, color2, direction, type]);

  const bgStyle = { background: css };

  return (
    <ToolLayout
      title="CSS 渐变生成器"
      description="可视化生成CSS渐变代码"
      instructions="选择两个颜色、渐变类型和方向，实时预览渐变效果并获取CSS代码。支持线性渐变和径向渐变，多种方向可选。直接复制CSS代码即可使用。"
      output={css}
    >
      <div className="space-y-4">
        <div className="h-40 rounded-xl border border-gray-200 dark:border-gray-700" style={bgStyle} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">颜色1</label>
            <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">颜色2</label>
            <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">类型</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'linear' | 'radial')} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
              <option value="linear">线性</option>
              <option value="radial">径向</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">方向</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
              <option value="to right">→ 向右</option>
              <option value="to left">← 向左</option>
              <option value="to bottom">↓ 向下</option>
              <option value="to top">↑ 向上</option>
              <option value="to bottom right">↘ 右下</option>
              <option value="to bottom left">↙ 左下</option>
              <option value="45deg">45°</option>
              <option value="135deg">135°</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-mono text-gray-800 dark:text-gray-200">
            background: {css};
          </code>
          <CopyButton text={`background: ${css};`} />
        </div>
      </div>
    </ToolLayout>
  );
}
