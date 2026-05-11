'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna',
  'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco',
  'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute',
  'irure', 'dolor', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat',
  'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

export function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [mode, setMode] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    const generateSentence = () => {
      const len = 5 + Math.floor(Math.random() * 12);
      const words: string[] = [];
      for (let i = 0; i < len; i++) {
        words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }
      return words.join(' ') + '.';
    };

    const generateParagraph = () => {
      const len = 3 + Math.floor(Math.random() * 5);
      return Array.from({ length: len }, generateSentence).join(' ');
    };

    let result: string;
    if (mode === 'words') {
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }
      result = words.join(' ') + (words[words.length - 1].endsWith('.') ? '' : '.');
    } else if (mode === 'sentences') {
      result = Array.from({ length: count }, generateSentence).join(' ');
    } else {
      result = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        Array.from({ length: count }, generateParagraph).join('\n\n');
    }

    setOutput(result);
  }, [count, mode]);

  return (
    <ToolLayout
      title="Lorem Ipsum 生成器"
      description="随机Lorem Ipsum占位文本生成"
      instructions="选择生成模式（段落/句子/单词）并设置数量，点击生成按钮获得Lorem Ipsum占位文本。适用于设计和排版中的占位文字需求。"
      output={output}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {([
          { key: 'paragraphs', label: '段落' },
          { key: 'sentences', label: '句子' },
          { key: 'words', label: '单词' },
        ] as const).map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setOutput(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m.key ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            {m.label}
          </button>
        ))}
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
          className="w-20 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-sm"
        />
        <button onClick={generate} className="btn-primary">生成</button>
        {output && <CopyButton text={output} />}
      </div>
    </ToolLayout>
  );
}
