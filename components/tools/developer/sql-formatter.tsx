'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    let sql = input.trim();
    // Uppercase keywords
    const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL',
      'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'ORDER', 'BY',
      'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE',
      'END', 'ASC', 'DESC', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'CHECK', 'UNIQUE',
      'CASCADE', 'TRUNCATE', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'BEGIN', 'COMMIT', 'ROLLBACK', 'IF'];
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    sql = sql.replace(regex, (m) => m.toUpperCase());

    // Newline before main clauses
    sql = sql.replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|ON|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|UNION|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/gi, '\n$1');

    // Indent
    const lines = sql.split('\n');
    let indent = 0;
    const formatted = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith(')')) indent = Math.max(0, indent - 1);
      const result = '  '.repeat(indent) + trimmed;
      if (trimmed.endsWith('(')) indent++;
      return result;
    });

    setOutput(formatted.join('\n').replace(/\n{3,}/g, '\n\n').trim());
  };

  return (
    <ToolLayout
      title="SQL 格式化"
      description="在线SQL语句格式化和美化工具"
      instructions="将SQL语句粘贴到输入框，点击格式化自动美化。支持SELECT、INSERT、UPDATE、DELETE等常见SQL语句的关键字高亮和缩进格式化。"
      output={output}
    >
      <textarea
        className="w-full h-48 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="SELECT id, name FROM users WHERE status = 'active' ORDER BY created_at DESC"
      />
      <div className="flex items-center gap-2 mt-4">
        <button onClick={format} className="btn-primary">格式化</button>
        {output && <CopyButton text={output} />}
      </div>
    </ToolLayout>
  );
}
