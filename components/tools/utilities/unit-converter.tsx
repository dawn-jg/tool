'use client';

import { useState, useMemo, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type UnitType = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed';

const units: Record<UnitType, { key: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]> = {
  length: [
    { key: 'mm', label: '毫米 (mm)', toBase: (v) => v, fromBase: (v) => v },
    { key: 'cm', label: '厘米 (cm)', toBase: (v) => v * 10, fromBase: (v) => v / 10 },
    { key: 'm', label: '米 (m)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { key: 'km', label: '公里 (km)', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    { key: 'inch', label: '英寸 (in)', toBase: (v) => v * 25.4, fromBase: (v) => v / 25.4 },
    { key: 'ft', label: '英尺 (ft)', toBase: (v) => v * 304.8, fromBase: (v) => v / 304.8 },
    { key: 'mile', label: '英里 (mi)', toBase: (v) => v * 1609344, fromBase: (v) => v / 1609344 },
  ],
  weight: [
    { key: 'mg', label: '毫克 (mg)', toBase: (v) => v, fromBase: (v) => v },
    { key: 'g', label: '克 (g)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { key: 'kg', label: '千克 (kg)', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    { key: 't', label: '吨 (t)', toBase: (v) => v * 1e9, fromBase: (v) => v / 1e9 },
    { key: 'lb', label: '磅 (lb)', toBase: (v) => v * 453592, fromBase: (v) => v / 453592 },
    { key: 'oz', label: '盎司 (oz)', toBase: (v) => v * 28349.5, fromBase: (v) => v / 28349.5 },
  ],
  temperature: [
    { key: 'c', label: '摄氏 (°C)', toBase: (v) => v, fromBase: (v) => v },
    { key: 'f', label: '华氏 (°F)', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    { key: 'k', label: '开尔文 (K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  area: [
    { key: 'm2', label: '平方米 (m²)', toBase: (v) => v, fromBase: (v) => v },
    { key: 'km2', label: '平方公里 (km²)', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    { key: 'ha', label: '公顷 (ha)', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    { key: 'acre', label: '英亩 (acre)', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
  ],
  volume: [
    { key: 'ml', label: '毫升 (mL)', toBase: (v) => v, fromBase: (v) => v },
    { key: 'l', label: '升 (L)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { key: 'gal', label: '加仑 (gal)', toBase: (v) => v * 3785.41, fromBase: (v) => v / 3785.41 },
    { key: 'floz', label: '液体盎司 (fl oz)', toBase: (v) => v * 29.5735, fromBase: (v) => v / 29.5735 },
  ],
  speed: [
    { key: 'ms', label: '米/秒 (m/s)', toBase: (v) => v, fromBase: (v) => v },
    { key: 'kmh', label: '公里/时 (km/h)', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { key: 'mph', label: '英里/时 (mph)', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { key: 'knot', label: '节 (kn)', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
  ],
};

export function UnitConverter() {
  const [type, setType] = useState<UnitType>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [value, setValue] = useState('1');

  const currentUnits = units[type];

  const result = useMemo(() => {
    const from = currentUnits.find((u) => u.key === fromUnit);
    const to = currentUnits.find((u) => u.key === toUnit);
    if (!from || !to) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    const baseVal = from.toBase(num);
    const converted = to.fromBase(baseVal);
    return converted.toPrecision(12).replace(/\.?0+$/, '');
  }, [value, fromUnit, toUnit, type]);

  return (
    <ToolLayout
      title="单位换算器"
      description="长度、重量、温度、面积等常用单位换算"
      instructions="选择换算类型，输入数值和单位，自动转换成目标单位。支持长度、重量、温度、面积、体积和速度等常用单位换算。"
      output={result ? `${value} ${fromUnit} = ${result} ${toUnit}` : undefined}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {([
            { key: 'length', label: '长度' },
            { key: 'weight', label: '重量' },
            { key: 'temperature', label: '温度' },
            { key: 'area', label: '面积' },
            { key: 'volume', label: '体积' },
            { key: 'speed', label: '速度' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => { setType(t.key); setFromUnit(units[t.key][1].key); setToUnit(units[t.key][0].key); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${type === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-32 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            {currentUnits.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
          <span className="text-xl">=</span>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            {currentUnits.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>

        {result && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
            <span className="text-lg font-mono text-blue-900 dark:text-blue-100">
              {value} {fromUnit} = <strong>{result} {toUnit}</strong>
            </span>
            <CopyButton text={`${value} ${fromUnit} = ${result} ${toUnit}`} className="ml-2" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
