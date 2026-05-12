'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function BorderRadiusGenerator() {
  const [tl, setTl] = useState(12);
  const [tr, setTr] = useState(12);
  const [br, setBr] = useState(12);
  const [bl, setBl] = useState(12);
  const [unit, setUnit] = useState<'px' | '%'>('px');
  const [linked, setLinked] = useState(true);

  const getVal = (v: number) => unit === 'px' ? `${v}px` : `${v}%`;

  const single = tl === tr && tr === br && br === bl;
  const cssValue = single
    ? getVal(tl)
    : `${getVal(tl)} ${getVal(tr)} ${getVal(br)} ${getVal(bl)}`;

  const cssCode = `.box {
  border-radius: ${cssValue};
}

/* 完整写法 */
.box {
  border-top-left-radius: ${getVal(tl)};
  border-top-right-radius: ${getVal(tr)};
  border-bottom-right-radius: ${getVal(br)};
  border-bottom-left-radius: ${getVal(bl)};
}`;

  const handleChange = (val: number, setter: (v: number) => void) => {
    setter(Math.max(0, Math.min(unit === '%' ? 100 : 100, val)));
    if (linked) {
      setTl(val);
      setTr(val);
      setBr(val);
      setBl(val);
    }
  };

  return (
    <ToolLayout
      title="Border Radius 生成器"
      description="可视化生成CSS border-radius代码"
      instructions="拖动滑块调整四个角的圆角半径，生成可复制的CSS代码。支持px和百分比单位。"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">圆角半径</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">锁定四边</span>
            </label>
            <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-700">
              <button onClick={() => setUnit('px')} className={`px-3 py-1 text-sm ${unit === 'px' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>px</button>
              <button onClick={() => setUnit('%')} className={`px-3 py-1 text-sm ${unit === '%' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>%</button>
            </div>
          </div>
        </div>

        {/* Preview Box with radius visualization */}
        <div className="p-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-6">
          <div className="relative">
            {/* Corner indicators */}
            <div className="absolute -top-6 left-0 text-xs text-gray-500">TL: {getVal(tl)}</div>
            <div className="absolute -top-6 right-0 text-xs text-gray-500">TR: {getVal(tr)}</div>
            <div className="absolute -bottom-6 right-0 text-xs text-gray-500">BR: {getVal(br)}</div>
            <div className="absolute -bottom-6 left-0 text-xs text-gray-500">BL: {getVal(bl)}</div>
            
            <div
              className="w-48 h-32 bg-gradient-to-br from-blue-400 to-purple-500"
              style={{
                borderTopLeftRadius: tl,
                borderTopRightRadius: tr,
                borderBottomRightRadius: br,
                borderBottomLeftRadius: bl,
                ...(unit === 'px' ? {} : {
                  borderTopLeftRadius: `${tl}%`,
                  borderTopRightRadius: `${tr}%`,
                  borderBottomRightRadius: `${br}%`,
                  borderBottomLeftRadius: `${bl}%`,
                })
              }}
            />
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">左上角 (Top-Left)</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{getVal(tl)}</span>
            </div>
            <input type="range" min={0} max={unit === '%' ? 100 : 100} value={tl} onChange={(e) => handleChange(Number(e.target.value), setTl)} className="w-full h-2 rounded-lg cursor-pointer accent-blue-500" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">右上角 (Top-Right)</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{getVal(tr)}</span>
            </div>
            <input type="range" min={0} max={unit === '%' ? 100 : 100} value={tr} onChange={(e) => handleChange(Number(e.target.value), setTr)} className="w-full h-2 rounded-lg cursor-pointer accent-blue-500" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">右下角 (Bottom-Right)</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{getVal(br)}</span>
            </div>
            <input type="range" min={0} max={unit === '%' ? 100 : 100} value={br} onChange={(e) => handleChange(Number(e.target.value), setBr)} className="w-full h-2 rounded-lg cursor-pointer accent-blue-500" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">左下角 (Bottom-Left)</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{getVal(bl)}</span>
            </div>
            <input type="range" min={0} max={unit === '%' ? 100 : 100} value={bl} onChange={(e) => handleChange(Number(e.target.value), setBl)} className="w-full h-2 rounded-lg cursor-pointer accent-blue-500" />
          </div>
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
