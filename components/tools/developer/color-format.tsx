'use client';

import { useState, useCallback, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'rgba' | 'hsla';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
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

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
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
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function ColorFormatConverter() {
  const [color, setColor] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [alpha, setAlpha] = useState(100);
  const [inputFormat, setInputFormat] = useState<ColorFormat>('hex');

  // HEX change -> update RGB/HSL
  useEffect(() => {
    const rgbVal = hexToRgb(color);
    if (rgbVal) {
      setRgb(rgbVal);
      const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
      setHsl(hslVal);
    }
  }, [color]);

  const handleRgbChange = useCallback((part: 'r' | 'g' | 'b', val: number) => {
    const newRgb = { ...rgb, [part]: Math.max(0, Math.min(255, val)) };
    setRgb(newRgb);
    const hex = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
    setColor(hex);
    const hslVal = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    setHsl(hslVal);
  }, [rgb]);

  const handleHslChange = useCallback((part: 'h' | 's' | 'l', val: number) => {
    const newHsl = { ...hsl, [part]: part === 'h' ? Math.max(0, Math.min(360, val)) : Math.max(0, Math.min(100, val)) };
    setHsl(newHsl);
    const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(rgbVal);
    const hex = `#${rgbVal.r.toString(16).padStart(2, '0')}${rgbVal.g.toString(16).padStart(2, '0')}${rgbVal.b.toString(16).padStart(2, '0')}`;
    setColor(hex);
  }, [hsl]);

  const alphaPercent = alpha / 100;

  const formats = {
    hex: color.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaPercent.toFixed(2)})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alphaPercent.toFixed(2)})`,
  };

  // Generate shades
  const shades = Array.from({ length: 11 }, (_, i) => {
    const l = 10 + i * 8;
    const rgbVal = hslToRgb(hsl.h, hsl.s, l);
    return {
      hex: `#${rgbVal.r.toString(16).padStart(2, '0')}${rgbVal.g.toString(16).padStart(2, '0')}${rgbVal.b.toString(16).padStart(2, '0')}`,
      light: l,
    };
  });

  return (
    <ToolLayout
      title="颜色格式转换器"
      description="HEX、RGB、HSL、RGBA、HSLA颜色格式互相转换"
      instructions="输入任意格式的颜色值，自动转换为其他格式。支持调整透明度和查看色阶。"
    >
      {/* Color Preview */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: color }}
          />
          <div className="absolute inset-0 rounded-xl bg-mix-multiply opacity-50" style={{ mixBlendMode: 'multiply' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">当前颜色</p>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">透明度</p>
          <input
            type="number"
            value={alpha}
            onChange={(e) => setAlpha(Math.max(0, Math.min(100, Number(e.target.value))))}
            min={0}
            max={100}
            className="w-16 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center"
          />
          <span className="text-xs text-gray-500">%</span>
        </div>
      </div>

      {/* HEX Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">HEX</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={color.toUpperCase()}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setColor(v);
            }}
            className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono"
            placeholder="#000000"
          />
          <CopyButton text={color.toUpperCase()} />
        </div>
      </div>

      {/* RGB Sliders */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RGB</label>
        <div className="flex gap-2 items-center">
          <span className="w-6 text-xs text-red-500 font-medium">R</span>
          <input type="range" min={0} max={255} value={rgb.r} onChange={(e) => handleRgbChange('r', Number(e.target.value))} className="flex-1 h-2 rounded-lg cursor-pointer accent-red-500" />
          <input type="number" min={0} max={255} value={rgb.r} onChange={(e) => handleRgbChange('r', Number(e.target.value))} className="w-14 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center font-mono" />
        </div>
        <div className="flex gap-2 items-center">
          <span className="w-6 text-xs text-green-500 font-medium">G</span>
          <input type="range" min={0} max={255} value={rgb.g} onChange={(e) => handleRgbChange('g', Number(e.target.value))} className="flex-1 h-2 rounded-lg cursor-pointer accent-green-500" />
          <input type="number" min={0} max={255} value={rgb.g} onChange={(e) => handleRgbChange('g', Number(e.target.value))} className="w-14 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center font-mono" />
        </div>
        <div className="flex gap-2 items-center">
          <span className="w-6 text-xs text-blue-500 font-medium">B</span>
          <input type="range" min={0} max={255} value={rgb.b} onChange={(e) => handleRgbChange('b', Number(e.target.value))} className="flex-1 h-2 rounded-lg cursor-pointer accent-blue-500" />
          <input type="number" min={0} max={255} value={rgb.b} onChange={(e) => handleRgbChange('b', Number(e.target.value))} className="w-14 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center font-mono" />
        </div>
      </div>

      {/* HSL Sliders */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">HSL</label>
        <div className="flex gap-2 items-center">
          <span className="w-6 text-xs text-pink-500 font-medium">H</span>
          <input type="range" min={0} max={360} value={hsl.h} onChange={(e) => handleHslChange('h', Number(e.target.value))} className="flex-1 h-2 rounded-lg cursor-pointer accent-pink-500" />
          <span className="w-14 p-2 text-center text-sm font-mono">{hsl.h}°</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="w-6 text-xs text-purple-500 font-medium">S</span>
          <input type="range" min={0} max={100} value={hsl.s} onChange={(e) => handleHslChange('s', Number(e.target.value))} className="flex-1 h-2 rounded-lg cursor-pointer accent-purple-500" />
          <span className="w-14 p-2 text-center text-sm font-mono">{hsl.s}%</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="w-6 text-xs text-gray-500 font-medium">L</span>
          <input type="range" min={0} max={100} value={hsl.l} onChange={(e) => handleHslChange('l', Number(e.target.value))} className="flex-1 h-2 rounded-lg cursor-pointer accent-gray-500" />
          <span className="w-14 p-2 text-center text-sm font-mono">{hsl.l}%</span>
        </div>
      </div>

      {/* All Formats Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        {Object.entries(formats).map(([format, value]) => (
          <div key={format} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800 text-sm">
            <span className="text-gray-500 w-12">{format.toUpperCase()}</span>
            <span className="font-mono text-gray-700 dark:text-gray-300">{value}</span>
            <CopyButton text={value} />
          </div>
        ))}
      </div>

      {/* Shades */}
      <div>
        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">色阶 (Shades)</p>
        <div className="flex rounded-lg overflow-hidden h-12">
          {shades.map((s) => (
            <button
              key={s.hex}
              onClick={() => { navigator.clipboard.writeText(s.hex.toUpperCase()); }}
              className="flex-1 h-full rounded-none border-0 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: s.hex }}
              title={`点击复制 ${s.hex.toUpperCase()}`}
            />
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
