'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export function FlexboxGenerator() {
  const [direction, setDirection] = useState<FlexDirection>('row');
  const [justifyContent, setJustifyContent] = useState<JustifyContent>('flex-start');
  const [alignItems, setAlignItems] = useState<AlignItems>('stretch');
  const [flexWrap, setFlexWrap] = useState<FlexWrap>('nowrap');
  const [gap, setGap] = useState(8);
  const [items, setItems] = useState(3);
  const [itemWidth, setItemWidth] = useState(60);

  const cssCode = `.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}`;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  return (
    <ToolLayout
      title="Flexbox 生成器"
      description="可视化生成Flexbox布局CSS代码"
      instructions="调整参数实时预览Flexbox布局效果，生成对应的CSS代码"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">flex-direction</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value as FlexDirection)} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="row">row</option>
            <option value="row-reverse">row-reverse</option>
            <option value="column">column</option>
            <option value="column-reverse">column-reverse</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">justify-content</label>
          <select value={justifyContent} onChange={(e) => setJustifyContent(e.target.value as JustifyContent)} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="flex-start">flex-start</option>
            <option value="flex-end">flex-end</option>
            <option value="center">center</option>
            <option value="space-between">space-between</option>
            <option value="space-around">space-around</option>
            <option value="space-evenly">space-evenly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">align-items</label>
          <select value={alignItems} onChange={(e) => setAlignItems(e.target.value as AlignItems)} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="stretch">stretch</option>
            <option value="flex-start">flex-start</option>
            <option value="flex-end">flex-end</option>
            <option value="center">center</option>
            <option value="baseline">baseline</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">flex-wrap</label>
          <select value={flexWrap} onChange={(e) => setFlexWrap(e.target.value as FlexWrap)} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="nowrap">nowrap</option>
            <option value="wrap">wrap</option>
            <option value="wrap-reverse">wrap-reverse</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">gap (px)</label>
          <input type="number" value={gap} onChange={(e) => setGap(Number(e.target.value))} min={0} max={100} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">子元素数量</label>
          <input type="number" value={items} onChange={(e) => setItems(Math.max(1, Math.min(12, Number(e.target.value))))} min={1} max={12} className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">预览</p>
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900 min-h-[120px]">
          <div style={{ display: 'flex', flexDirection: direction, justifyContent, alignItems, flexWrap, gap: `${gap}px` }}>
            {Array.from({ length: items }).map((_, i) => (
              <div key={i} style={{ width: itemWidth, height: 40 }} className="bg-blue-500 rounded flex items-center justify-center text-white text-xs font-medium shadow-sm">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

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
