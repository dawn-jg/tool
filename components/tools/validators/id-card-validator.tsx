'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function IdCardValidator() {
  const [id, setId] = useState('');
  const [results, setResults] = useState<{ label: string; ok: boolean; msg: string }[]>([]);

  const validate = useCallback(() => {
    const r: { label: string; ok: boolean; msg: string }[] = [];
    const trimmed = id.trim();

    if (!trimmed) {
      r.push({ label: '格式', ok: false, msg: '请输入身份证号码' });
      setResults(r);
      return;
    }

    const regex18 = /^\d{17}[\dXx]$/;
    const regex15 = /^\d{15}$/;

    if (regex18.test(trimmed)) {
      r.push({ label: '格式', ok: true, msg: '18位身份证号码' });

      // Area code
      const area = trimmed.substring(0, 6);
      const knownAreas: Record<string, string> = {
        '110000': '北京市', '310000': '上海市', '440100': '广州市', '440300': '深圳市',
        '330100': '杭州市', '510100': '成都市', '320100': '南京市', '420100': '武汉市',
      };
      r.push({ label: '地区码', ok: true, msg: knownAreas[area] || `代码 ${area}` });

      // Birthday
      const year = parseInt(trimmed.substring(6, 10));
      const month = parseInt(trimmed.substring(10, 12));
      const day = parseInt(trimmed.substring(12, 14));
      const birthDate = new Date(year, month - 1, day);
      const birthValid = birthDate.getFullYear() === year && birthDate.getMonth() === month - 1 && birthDate.getDate() === day;
      if (birthValid && year >= 1900 && year <= new Date().getFullYear()) {
        const age = new Date().getFullYear() - year;
        r.push({ label: '出生日期', ok: true, msg: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} (${age}岁)` });
      } else {
        r.push({ label: '出生日期', ok: false, msg: '日期无效' });
      }

      // Gender
      const genderDigit = parseInt(trimmed.charAt(16));
      r.push({ label: '性别', ok: true, msg: genderDigit % 2 === 0 ? '女' : '男' });

      // Check digit
      const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      let sum = 0;
      for (let i = 0; i < 17; i++) sum += parseInt(trimmed[i]) * weights[i];
      const checkMap = '10X98765432';
      const expectedCheck = checkMap[sum % 11];
      const actualCheck = trimmed[17].toUpperCase();
      if (expectedCheck === actualCheck) {
        r.push({ label: '校验位', ok: true, msg: `校验通过 (${actualCheck})` });
      } else {
        r.push({ label: '校验位', ok: false, msg: `不匹配 (期望${expectedCheck}, 实际${actualCheck})` });
      }

    } else if (regex15.test(trimmed)) {
      r.push({ label: '格式', ok: true, msg: '15位身份证号码（旧版）' });
      r.push({ label: '提示', ok: true, msg: '15位旧版号码，建议升级到18位' });
    } else {
      r.push({ label: '格式', ok: false, msg: `长度为${trimmed.length}，标准为15或18位` });
    }

    setResults(r);
  }, [id]);

  return (
    <ToolLayout
      title="身份证验证器"
      description="验证中国大陆身份证号码并解析信息"
      instructions="输入18位身份证号码，点击验证即可校验格式、地区码、出生日期、性别和校验位。支持15位旧版号码检测。数据在浏览器本地验证，不会上传。"
    >
      <div className="flex gap-3">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="输入18位身份证号码..."
        />
        <button onClick={validate} className="btn-primary">验证</button>
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              <span className="text-sm font-medium w-20 shrink-0">{r.label}</span>
              <span className="text-sm">{r.msg}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
