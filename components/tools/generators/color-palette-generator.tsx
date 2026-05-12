'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type PaletteType = 'analogous' | 'complementary' | 'triadic' | 'split' | 'tetradic' | 'monochromatic';

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`.toUpperCase();
}

export function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [paletteType, setPaletteType] = useState<PaletteType>('complementary');
  const [copied, setCopied] = useState('');

  const generatePalette = useCallback(() => {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return [];

    const { h, s, l } = hsl;
    const colors: { hex: string; name: string }[] = [];

    switch (paletteType) {
      case 'analogous':
        colors.push({ hex: hslToHex(h - 30, s, l), name: '左邻' });
        colors.push({ hex: hslToHex(h - 15, s, l), name: '次左' });
        colors.push({ hex: baseColor.toUpperCase(), name: '主色' });
        colors.push({ hex: hslToHex(h + 15, s, l), name: '次右' });
        colors.push({ hex: hslToHex(h + 30, s, l), name: '右邻' });
        break;
      case 'complementary':
        colors.push({ hex: hslToHex(h, s, l), name: '主色' });
        colors.push({ hex: hslToHex(h, s, Math.min(l + 20, 90)), name: '亮变' });
        colors.push({ hex: hslToHex(h, s, Math.max(l - 20, 10)), name: '暗变' });
        colors.push({ hex: hslToHex(h + 180, s, l), name: '互补' });
        colors.push({ hex: hslToHex(h + 180, s, Math.min(l + 15, 90)), name: '互补亮' });
        break;
      case 'triadic':
        colors.push({ hex: baseColor.toUpperCase(), name: '主色' });
        colors.push({ hex: hslToHex(h + 120, s, l), name: '三色1' });
        colors.push({ hex: hslToHex(h + 240, s, l), name: '三色2' });
        colors.push({ hex: hslToHex(h, s, Math.min(l + 15, 90)), name: '亮变' });
        colors.push({ hex: hslToHex(h, s, Math.max(l - 15, 10)), name: '暗变' });
        break;
      case 'split':
        colors.push({ hex: baseColor.toUpperCase(), name: '主色' });
        colors.push({ hex: hslToHex(h + 150, s, l), name: '分裂1' });
        colors.push({ hex: hslToHex(h + 210, s, l), name: '分裂2' });
        colors.push({ hex: hslToHex(h, s, Math.min(l + 20, 90)), name: '亮变' });
        colors.push({ hex: hslToHex(h, s, Math.max(l - 20, 10)), name: '暗变' });
        break;
      case 'tetradic':
        colors.push({ hex: baseColor.toUpperCase(), name: '主色' });
        colors.push({ hex: hslToHex(h + 90, s, l), name: '四色1' });
        colors.push({ hex: hslToHex(h + 180, s, l), name: '四色2' });
        colors.push({ hex: hslToHex(h + 270, s, l), name: '四色3' });
        colors.push({ hex: hslToHex(h, s, Math.min(l + 15, 90)), name: '亮变' });
        break;
      case 'monochromatic':
        colors.push({ hex: hslToHex(h, s, Math.max(l - 30, 10)), name: '深' });
        colors.push({ hex: hslToHex(h, s, Math.max(l - 15, 20)), name: '中深' });
        colors.push({ hex: baseColor.toUpperCase(), name: '主色' });
        colors.push({ hex: hslToHex(h, s, Math.min(l + 15, 80)), name: '中浅' });
        colors.push({ hex: hslToHex(h, s, Math.min(l + 30, 90)), name: '浅' });
        break;
    }
    return colors;
  }, [baseColor, paletteType]);

  const colors = generatePalette();

  const cssCode = `:root {
${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}
}

/* 使用示例 */
.color-1 { color: ${colors[0]?.hex}; }
.color-2 { color: ${colors[1]?.hex}; }
.color-3 { color: ${colors[2]?.hex}; }
.color-4 { color: ${colors[3]?.hex}; }
.color-5 { color: ${colors[4]?.hex}; }`;

  return (
    <ToolLayout
      title="颜色Palette生成器"
      description="基于一个颜色生成五种配色方案"
      instructions="选择基础颜色和配色方案类型，生成5个协调色的调色板。支持类比色、互补色、三色、四色和单色方案。"
    >
      {/* Settings */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">基础颜色</label>
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-16 h-10 rounded cursor-pointer border-2 border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">配色方案</label>
          <div className="flex flex-wrap gap-2">
            {(['analogous', 'complementary', 'triadic', 'split', 'tetradic', 'monochromatic'] as PaletteType[]).map((t) => (
              <button
                key={t}
                onClick={() => setPaletteType(t)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                  paletteType === t ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t === 'analogous' ? '类比色' :
                 t === 'complementary' ? '互补色' :
                 t === 'triadic' ? '三色' :
                 t === 'split' ? '分裂互补' :
                 t === 'tetradic' ? '四色' : '单色'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Palette Display */}
      <div className="flex rounded-xl overflow-hidden h-32 mb-6 shadow-lg">
        {colors.map((c, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-center cursor-pointer group relative"
            style={{ backgroundColor: c.hex }}
            onClick={() => {
              navigator.clipboard.writeText(c.hex);
              setCopied(c.hex);
              setTimeout(() => setCopied(''), 1500);
            }}
          >
            <span className="text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition px-2 py-1 rounded bg-black/50 text-white">
              {c.name}
            </span>
            {copied === c.hex && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm font-medium">
                已复制
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Color List */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {colors.map((c, i) => (
          <div key={i} className="text-center">
            <div className="w-full h-16 rounded-lg shadow-sm mb-1" style={{ backgroundColor: c.hex }} />
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{c.hex}</p>
            <p className="text-xs text-gray-400">{c.name}</p>
          </div>
        ))}
      </div>

      {/* CSS Output */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS 变量</p>
          <CopyButton text={cssCode} />
        </div>
        <pre className="p-4 rounded-lg bg-gray-900 text-green-400 text-sm font-mono overflow-auto">
          {cssCode}
        </pre>
      </div>
    </ToolLayout>
  );
}
