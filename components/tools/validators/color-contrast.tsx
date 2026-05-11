'use client';

import { useState, useCallback, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function ColorContrast() {
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#3b82f6');
  const [results, setResults] = useState<{ label: string; ok: boolean; msg: string }[]>([]);

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const relativeLuminance = (rgb: [number, number, number]): number => {
    const [r, g, b] = rgb.map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const calculate = useCallback(() => {
    const rgbFg = hexToRgb(fg);
    const rgbBg = hexToRgb(bg);
    const lFg = relativeLuminance(rgbFg);
    const lBg = relativeLuminance(rgbBg);
    const lighter = Math.max(lFg, lBg);
    const darker = Math.min(lFg, lBg);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    const r: { label: string; ok: boolean; msg: string }[] = [];
    r.push({ label: '对比度', ok: ratio >= 4.5, msg: `${ratio.toFixed(2)}:1` });
    r.push({ label: 'AA 大文本', ok: ratio >= 3, msg: ratio >= 3 ? '通过 (>=3:1) ✓' : '未通过 (需>=3:1) ✗' });
    r.push({ label: 'AA 普通文本', ok: ratio >= 4.5, msg: ratio >= 4.5 ? '通过 (>=4.5:1) ✓' : '未通过 (需>=4.5:1) ✗' });
    r.push({ label: 'AAA 大文本', ok: ratio >= 4.5, msg: ratio >= 4.5 ? '通过 (>=4.5:1) ✓' : '未通过 (需>=4.5:1) ✗' });
    r.push({ label: 'AAA 普通文本', ok: ratio >= 7, msg: ratio >= 7 ? '通过 (>=7:1) ✓' : '未通过 (需>=7:1) ✗' });

    setResults(r);
  }, [fg, bg]);

  useEffect(() => { calculate(); }, [calculate]);

  return (
    <ToolLayout
      title="WCAG 对比度检查器"
      description="计算颜色对比度并检查WCAG无障碍合规性"
      instructions="选择前景色（文字色）和背景色，自动计算WCAG 2.0对比度比率。包含AA和AAA级别的合规检查（普通文本和大文本）。符合WCAG标准有助于提升网站无障碍体验。"
    >
      <div className="space-y-4">
        <div className="p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center" style={{ backgroundColor: bg }}>
          <span style={{ color: fg }} className="text-2xl font-bold">
            示例文字 Aa 123
          </span>
          <p style={{ color: fg }} className="text-sm mt-2">普通文本示例</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">前景色（文字）</label>
            <div className="flex items-center gap-2">
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <code className="text-sm">{fg}</code>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">背景色</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <code className="text-sm">{bg}</code>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                <span className="text-sm font-medium w-28 shrink-0">{r.label}</span>
                <span className="text-sm">{r.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
