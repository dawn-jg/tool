'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function BarcodeGenerator() {
  const [text, setText] = useState('12345678');
  const [barcodeDataUrl, setBarcodeDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Code128B encoding
  const encodeCode128B = (data: string) => {
    const bars: number[] = [];
    const patterns: Record<string, number[]> = {
      ' ': [2,1,2,2,2,2], '!': [2,2,2,1,2,2], '"': [2,2,2,2,2,1], '#': [1,2,1,2,2,3],
      '$': [1,2,1,3,2,2], '%': [1,3,1,2,2,2], '&': [1,2,2,2,1,3], "'": [1,2,2,3,1,2],
      '(': [1,3,2,2,1,2], ')': [2,2,1,2,1,3], '*': [2,2,1,3,1,2], '+': [2,3,1,2,1,2],
      ',': [1,1,2,2,3,2], '-': [1,2,2,1,3,2], '.': [1,2,2,2,3,1], '/': [1,1,3,2,2,2],
      '0': [1,2,3,1,2,2], '1': [1,2,3,2,2,1], '2': [2,2,3,2,1,1], '3': [2,2,1,1,3,2],
      '4': [2,2,1,2,3,1], '5': [2,1,3,2,1,2], '6': [2,2,3,1,1,2], '7': [3,1,2,1,3,1],
      '8': [3,1,1,2,2,2], '9': [3,2,1,1,2,2], ':': [3,2,1,2,2,1], ';': [3,1,2,2,1,2],
      '<': [3,2,2,1,1,2], '=': [3,2,2,2,1,1], '>': [2,1,2,1,2,3], '?': [2,1,2,3,2,1],
      '@': [2,3,2,1,2,1], 'A': [1,1,1,3,2,3], 'B': [1,3,1,1,2,3], 'C': [1,3,1,3,2,1],
      'D': [1,1,2,3,1,3], 'E': [1,3,2,1,1,3], 'F': [1,3,2,3,1,1], 'G': [2,1,1,3,1,3],
      'H': [2,3,1,1,1,3], 'I': [2,3,1,3,1,1], 'J': [1,1,2,1,3,3], 'K': [1,1,2,3,3,1],
      'L': [1,3,2,1,3,1], 'M': [1,1,3,1,2,3], 'N': [1,1,3,3,2,1], 'O': [1,3,3,1,2,1],
      'P': [3,1,3,1,2,1], 'Q': [2,1,1,3,3,1], 'R': [2,3,1,1,3,1], 'S': [2,1,3,1,1,3],
      'T': [2,1,3,3,1,1], 'U': [2,1,3,1,3,1], 'V': [3,1,1,1,2,3], 'W': [3,1,1,3,2,1],
      'X': [3,3,1,1,2,1], 'Y': [3,1,2,1,1,3], 'Z': [3,1,2,3,1,1], '[': [3,3,2,1,1,1],
      '\\': [3,1,4,1,1,1], ']': [2,2,1,4,1,1], '^': [4,3,1,1,1,1], '_': [1,1,1,2,2,4],
      '`': [1,1,1,4,2,2], 'a': [1,2,1,1,2,4], 'b': [1,2,1,4,2,1], 'c': [1,4,1,1,2,2],
      'd': [1,4,1,2,2,1], 'e': [1,1,2,2,1,4], 'f': [1,1,2,4,1,2], 'g': [1,2,2,1,1,4],
      'h': [1,2,2,4,1,1], 'i': [1,4,2,1,1,2], 'j': [1,4,2,2,1,1], 'k': [2,4,1,2,1,1],
      'l': [2,2,1,1,1,4], 'm': [4,1,3,1,1,1], 'n': [2,4,1,1,1,2], 'o': [1,3,4,1,1,1],
      'p': [1,1,1,2,4,2], 'q': [1,2,1,1,4,2], 'r': [1,2,1,2,4,1], 's': [1,1,4,2,1,2],
      't': [1,2,4,1,1,2], 'u': [1,2,4,2,1,1], 'v': [4,1,1,2,1,2], 'w': [4,2,1,1,1,2],
      'x': [4,2,1,2,1,1], 'y': [2,1,2,1,4,1], 'z': [2,1,4,1,2,1], '{': [4,1,2,1,2,1],
      '|': [1,1,1,1,4,3], '}': [1,1,1,3,4,1], '~': [1,3,1,1,4,1],
    };

    // Check digit calculation
    let sum = 104; // Start B
    bars.push(...[2,1,1,2,1,4]); // Start B pattern

    for (let i = 0; i < data.length; i++) {
      const pattern = patterns[data[i]];
      if (!pattern) continue;
      bars.push(...pattern);
      sum += (i + 1) * (data.charCodeAt(i) - 32);
    }

    // Check digit
    sum %= 103;
    const checkChar = String.fromCharCode(sum + 32);
    bars.push(...(patterns[checkChar] || [2,3,3,1,1,1]));

    // Stop pattern
    bars.push(...[2,3,3,1,1,1,2]); // Stop + terminator

    return bars;
  };

  const generate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;

    const bars = encodeCode128B(text);
    const barWidth = 2;
    const height = 120;
    const quietZone = 10;
    const totalBars = bars.length;

    canvas.width = quietZone * 2 + totalBars * barWidth;
    canvas.height = height + 40;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = quietZone;
    for (let i = 0; i < bars.length; i++) {
      const w = bars[i] * barWidth;
      ctx.fillStyle = i % 2 === 0 ? '#000000' : '#ffffff';
      ctx.fillRect(x, 0, w, height);
      x += w;
    }

    // Text
    ctx.fillStyle = '#000000';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, height + 20);

    setBarcodeDataUrl(canvas.toDataURL('image/png'));
  }, [text]);

  const download = useCallback(() => {
    if (!barcodeDataUrl) return;
    const a = document.createElement('a');
    a.href = barcodeDataUrl;
    a.download = 'barcode.png';
    a.click();
  }, [barcodeDataUrl]);

  return (
    <ToolLayout
      title="条形码生成器"
      description="在线生成Code128条形码"
      instructions="输入数字或文本，点击生成创建Code128格式的条形码。Code128支持数字和英文字母。生成后可下载PNG图片。适用于产品标签、库存管理等场景。"
    >
      <div className="flex items-center gap-3 mb-4">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入条码内容..."
        />
        <button onClick={generate} className="btn-primary">生成</button>
        {barcodeDataUrl && <button onClick={download} className="btn-secondary">下载</button>}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {barcodeDataUrl && (
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <img src={barcodeDataUrl} alt="Barcode" className="max-w-full" />
        </div>
      )}
    </ToolLayout>
  );
}
