'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function BoxShadowGenerator() {
  const [offsetX, setOffsetX] = useState(5);
  const [offsetY, setOffsetY] = useState(5);
  const [blur, setBlur] = useState(10);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(25);
  const [inset, setInset] = useState(false);
  const [multiple, setMultiple] = useState(false);

  const shadowColor = `${color}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}`;
  
  const singleShadow = inset ? `inset ${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor}` : `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor}`;
  
  const cssCode = `.box {
  box-shadow: ${singleShadow};
}${multiple ? `

/* 多层阴影 */
.box {
  box-shadow: ${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor},
              ${-offsetX}px ${-offsetY}px ${blur}px ${spread}px ${shadowColor}40;
}` : ''}`;

  const rgbaColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity / 100})`;

  return (
    <ToolLayout
      title="Box Shadow 生成器"
      description="可视化生成CSS box-shadow代码"
      instructions="调整阴影参数实时预览效果，生成可复制的CSS代码。支持内阴影和多层阴影。"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">X偏移 (px)</label>
          <input type="number" value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Y偏移 (px)</label>
          <input type="number" value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">模糊 (px)</label>
          <input type="number" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">扩散 (px)</label>
          <input type="number" value={spread} onChange={(e) => setSpread(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">阴影颜色</label>
          <div className="flex gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
            <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">不透明度 (%)</label>
          <input type="number" value={opacity} onChange={(e) => setOpacity(Math.min(100, Math.max(0, Number(e.target.value))))} min={0} max={100} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">阴影类型</label>
          <select value={inset ? 'inset' : 'outset'} onChange={(e) => setInset(e.target.value === 'inset')} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="outset">外阴影</option>
            <option value="inset">内阴影</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={multiple} onChange={(e) => setMultiple(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">多层阴影</span>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">预览</p>
        <div className="p-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div
            className="w-40 h-24 bg-white rounded-lg"
            style={{ boxShadow: singleShadow }}
          />
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 text-xs font-mono">
        <div className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-center">
          <span className="text-gray-500">HEX: </span><span className="text-gray-700 dark:text-gray-300">{shadowColor}</span>
        </div>
        <div className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-center">
          <span className="text-gray-500">RGBA: </span><span className="text-gray-700 dark:text-gray-300">{rgbaColor}</span>
        </div>
        <div className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-center col-span-2">
          <span className="text-gray-500">单层: </span><span className="text-gray-700 dark:text-gray-300">{singleShadow}</span>
        </div>
      </div>

      {/* CSS Output */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS 代码</p>
          <CopyButton text={cssCode} />
        </div>
        <pre className="p-4 rounded-lg bg-gray-900 text-green-400 text-sm font-mono overflow-auto">
          {cssCode}
        </pre>
      </div>
    </ToolLayout>
  );
}
