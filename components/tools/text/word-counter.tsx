'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function WordCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const paragraphs = text ? text.split('\n').filter((l) => l.trim() !== '').length : 0;
    const bytes = new TextEncoder().encode(text).length;
    // Chinese character count
    const chinese = (text.match(/[一-鿿]/g) || []).length;
    const english = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    return { chars, charsNoSpaces, words, lines, paragraphs, bytes, chinese, english, digits };
  }, [text]);

  const readingTime = stats.words > 0 ? Math.ceil(stats.words / 200) : 0;

  return (
    <ToolLayout
      title="字数统计"
      description="统计文本字数、字符数、行数、段落数等"
      instructions="输入或粘贴文本，实时查看详细的字数统计信息。包括字符数、单词数、行数、段落数、中文字数、英文字母数、数字数、字节数和预估阅读时间。"
    >
      <textarea
        className="w-full h-48 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入或粘贴文本..."
      />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: '总字符数', value: stats.chars },
          { label: '无空格字符', value: stats.charsNoSpaces },
          { label: '单词数', value: stats.words },
          { label: '行数', value: stats.lines },
          { label: '段落数', value: stats.paragraphs },
          { label: '字节数', value: stats.bytes },
          { label: '中文字数', value: stats.chinese },
          { label: '英文字母', value: stats.english },
          { label: '数字', value: stats.digits },
          { label: '阅读时间', value: `${readingTime} 分钟` },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
            <div className="text-2xl font-bold text-blue-600">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
