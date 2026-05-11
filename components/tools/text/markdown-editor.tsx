'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

export function MarkdownEditor() {
  const [md, setMd] = useState('# Hello Markdown\n\n**Bold** *Italic* ~~Strikethrough~~\n\n- List item 1\n- List item 2\n\n`inline code`\n\n```js\nconsole.log("code block");\n```\n\n[Link](https://example.com) ![Image](https://via.placeholder.com/100)');

  const renderMd = useCallback((text: string): string => {
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto text-sm my-2"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">$1</code>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener">$1</a>')
      // Headers
      .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      // Horizontal rule
      .replace(/^---+$/gm, '<hr class="my-4 border-gray-300 dark:border-gray-600" />')
      // Bold + Italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del class="text-gray-400">$1</del>')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')
      // Unordered list
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p class="my-2">');

    // Wrap adjacent list items
    html = html.replace(/(<li[^>]*>.*?<\/li>)(\s*(?!<li))/g, '$1</ul>$2');
    html = html.replace(/(?<!<\/ul>\n?)(<li[^>]*>)/g, '<ul class="my-2">$1');

    return `<p class="my-2">${html}</p>`;
  }, []);

  return (
    <ToolLayout
      title="Markdown 编辑器"
      description="Markdown在线编辑与实时预览"
      instructions="左侧编辑Markdown文本，右侧实时预览渲染效果。支持标题、粗体、斜体、代码块、列表、链接、图片、引用等常用Markdown语法。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">编辑</label>
          <textarea
            className="w-full h-[500px] p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            value={md}
            onChange={(e) => setMd(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">预览</label>
          <div
            className="h-[500px] p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm overflow-auto prose prose-sm dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderMd(md) }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
