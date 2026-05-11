'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function BmiCalculator() {
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('7');
  const [weightLb, setWeightLb] = useState('143');

  const bmi = useMemo(() => {
    if (unit === 'metric') {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (h <= 0 || w <= 0) return null;
      return w / (h * h);
    } else {
      const totalIn = parseInt(heightFt) * 12 + parseInt(heightIn);
      const w = parseFloat(weightLb);
      if (totalIn <= 0 || w <= 0) return null;
      return (w / (totalIn * totalIn)) * 703;
    }
  }, [height, weight, heightFt, heightIn, weightLb, unit]);

  const category = useMemo(() => {
    if (bmi === null) return null;
    if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: '体重低于健康范围，建议加强营养' };
    if (bmi < 24) return { label: '正常', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', desc: '体重在健康范围内，请保持良好生活习惯' };
    if (bmi < 28) return { label: '超重', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', desc: '体重略高于健康范围，建议适当运动' };
    return { label: '肥胖', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', desc: '体重超出健康范围，建议咨询医生' };
  }, [bmi]);

  const output = bmi !== null ? `BMI: ${bmi.toFixed(1)} (${category?.label})` : '';

  return (
    <ToolLayout
      title="BMI 计算器"
      description="身体质量指数BMI计算与评估"
      instructions="输入身高和体重，自动计算BMI指数并进行健康评估。BMI = 体重(kg) / 身高²(m²)。中国标准：<18.5偏瘦，18.5-23.9正常，24-27.9超重，≥28肥胖。支持公制和英制单位。"
      output={output}
    >
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setUnit('metric')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${unit === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            公制 (cm/kg)
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${unit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            英制 (ft/lb)
          </button>
        </div>

        {unit === 'metric' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">身高 (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-lg" />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">体重 (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-lg" />
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">身高 英尺</label>
              <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-lg" />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">身高 英寸</label>
              <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-lg" />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">体重 (lb)</label>
              <input type="number" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-lg" />
            </div>
          </div>
        )}

        {bmi !== null && category && (
          <div className={`p-6 rounded-xl ${category.bg} text-center`}>
            <div className="text-4xl font-bold font-mono text-gray-900 dark:text-white mb-2">
              {bmi.toFixed(1)}
            </div>
            <div className={`text-xl font-semibold ${category.color} mb-1`}>{category.label}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{category.desc}</div>

            <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>偏瘦: &lt;18.5</span>
              <span>正常: 18.5-23.9</span>
              <span>超重: 24-27.9</span>
              <span>肥胖: ≥28</span>
            </div>
          </div>
        )}

        <CopyButton text={output} />
      </div>
    </ToolLayout>
  );
}
