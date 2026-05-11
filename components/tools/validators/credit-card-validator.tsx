'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function CreditCardValidator() {
  const [card, setCard] = useState('');
  const [results, setResults] = useState<{ label: string; ok: boolean; msg: string }[]>([]);

  const luhnCheck = (num: string): boolean => {
    let sum = 0;
    let alternate = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i]);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  };

  const getCardType = (num: string): string => {
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'MasterCard';
    if (/^3[47]/.test(num)) return 'American Express';
    if (/^6011|^65/.test(num)) return 'Discover';
    if (/^62/.test(num) && num.length >= 16) return '银联 (UnionPay)';
    if (/^35/.test(num)) return 'JCB';
    return '未知';
  };

  const validate = useCallback(() => {
    const r: { label: string; ok: boolean; msg: string }[] = [];
    const cleaned = card.replace(/\s/g, '');

    if (!cleaned) {
      r.push({ label: '输入', ok: false, msg: '请输入信用卡号' });
      setResults(r);
      return;
    }

    if (!/^\d+$/.test(cleaned)) {
      r.push({ label: '格式', ok: false, msg: '只能包含数字' });
      setResults(r);
      return;
    }

    // Length
    r.push({ label: '长度', ok: cleaned.length >= 13 && cleaned.length <= 19, msg: `${cleaned.length}位 (标准13-19位)` });

    // Card type
    const type = getCardType(cleaned);
    r.push({ label: '卡类型', ok: type !== '未知', msg: type });

    // Luhn
    const luhn = luhnCheck(cleaned);
    r.push({ label: 'Luhn校验', ok: luhn, msg: luhn ? '校验通过' : '校验失败，卡号可能无效' });

    // Masked
    const masked = cleaned.slice(0, 4) + ' **** **** ' + cleaned.slice(-4);
    r.push({ label: '脱敏', ok: true, msg: masked });

    setResults(r);
  }, [card]);

  return (
    <ToolLayout
      title="信用卡校验器"
      description="使用Luhn算法校验信用卡号有效性"
      instructions="输入信用卡号，点击验证即可检查卡号格式、识别发卡机构（Visa/MasterCard/Amex/Discover/银联/JCB），并使用Luhn算法验证卡号有效性。仅做格式校验，不验证真实交易。"
    >
      <div className="flex gap-3">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={card}
          onChange={(e) => setCard(e.target.value)}
          placeholder="输入信用卡号..."
        />
        <button onClick={validate} className="btn-primary">验证</button>
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              <span className="text-sm font-medium w-20 shrink-0">{r.label}</span>
              <span className="text-sm font-mono">{r.msg}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
