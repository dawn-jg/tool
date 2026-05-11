"use client";

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { useI18n } from '@/lib/i18n';

export function JsonFormatter() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const compress = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput(t('json.valid'));
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  return (
    <ToolLayout
      title={t('tool.jsonFormatter')}
      description={t('tool.jsonFormatterDesc')}
      instructions="tool.jsonFormatter.instructions"
      output={output}
    >
      <textarea
        className="w-full h-64 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"example": "..."}'
      />
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <button onClick={format} className="btn-primary">{t('common.format')}</button>
        <button onClick={compress} className="btn-secondary">{t('common.compress')}</button>
        <button onClick={validate} className="btn-secondary">{t('common.validate')}</button>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-2">
          {t('common.indent')}:
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </label>
        {output && <CopyButton text={output} />}
      </div>
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}
    </ToolLayout>
  );
}