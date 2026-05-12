'use client';

import { useState, useCallback, useMemo } from 'react';
import { ToolLayout } from '@/components/ToolLayout';

const defaultMarkdown = `# Markdown 预览示例

## 标题
支持 **粗体**、*斜体*、~~删除线~~ 和 \`行内代码\`

### 列表
- 无序列表项 1
- 无序列表项 2
  - 嵌套列表
  - 嵌套列表

1. 有序列表 1
2. 有序列表 2
3. 有序列表 3

### 链接和图片
[访问 Google](https://www.google.com)

### 引用
> 这是一段引用文字
> 可以有多行

### 代码块
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### 表格
| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 25 | 北京 |
| 李四 | 30 | 上海 |

### 分割线
---

### 任务列表
- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个任务
`;

function parseMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (before other processing)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Blockquote
    .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rule
    .replace(/^---+$/gm, '<hr />')
    .replace(/^\*\*\*+$/gm, '<hr />')
    // Unordered lists
    .replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Task lists
    .replace(/^- \[x\]\s+(.+)$/gim, '<li class="task checked"><input type="checkbox" checked disabled /> $1</li>')
    .replace(/^- \[ \]\s+(.+)$/gim, '<li class="task"><input type="checkbox" disabled /> $1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<hr \/>)/g, '$1');
  html = html.replace(/(<hr \/>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<li)/g, '<li');
  html = html.replace(/(<\/li>)\s*<\/p>/g, '$1');

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>)(\s*<li[^>]*>[\s\S]*?<\/li>)*/g, '<ul>$&</ul>');

  return html;
}

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [view, setView] = useState<'split' | 'editor' | 'preview'>('split');

  const html = useMemo(() => parseMarkdown(markdown), [markdown]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(markdown);
  }, [markdown]);

  return (
    <ToolLayout
      title="Markdown 预览"
      description="在线编辑和预览Markdown文档"
      instructions="在左侧编辑器输入Markdown语法，右侧实时预览渲染效果。支持标题、列表、代码块、表格等常用语法。"
    >
      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('split')}
          className={`px-3 py-1.5 rounded text-sm ${view === 'split' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
        >
          分屏
        </button>
        <button
          onClick={() => setView('editor')}
          className={`px-3 py-1.5 rounded text-sm ${view === 'editor' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
        >
          仅编辑
        </button>
        <button
          onClick={() => setView('preview')}
          className={`px-3 py-1.5 rounded text-sm ${view === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
        >
          仅预览
        </button>
        <button onClick={handleCopy} className="btn-secondary text-xs ml-auto">复制Markdown</button>
      </div>

      <div className={`grid gap-4 ${view === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        {(view === 'split' || view === 'editor') && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">编辑器</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="输入 Markdown..."
            />
          </div>
        )}

        {/* Preview */}
        {(view === 'split' || view === 'preview') && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">预览</label>
            <div
              className="flex-1 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-auto prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
              style={{ minHeight: 300 }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .prose h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        .prose h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        .prose h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
        .prose h4 { font-size: 1em; font-weight: bold; margin: 1.33em 0; }
        .prose h5 { font-size: 0.83em; font-weight: bold; margin: 1.67em 0; }
        .prose h6 { font-size: 0.67em; font-weight: bold; margin: 2.33em 0; }
        .prose p { margin: 1em 0; line-height: 1.6; }
        .prose a { color: #3B82F6; text-decoration: underline; }
        .prose a:hover { color: #2563EB; }
        .prose code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
        .prose pre { background: #1f2937; color: #e5e7eb; padding: 1em; border-radius: 0.5em; overflow-x: auto; margin: 1em 0; }
        .prose pre code { background: transparent; padding: 0; color: inherit; }
        .prose blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; margin: 1em 0; color: #6b7280; }
        .prose ul { list-style-type: disc; padding-left: 2em; margin: 1em 0; }
        .prose li { margin: 0.25em 0; }
        .prose li.task { list-style: none; margin-left: -1.5em; }
        .prose li.task input { margin-right: 0.5em; }
        .prose hr { border: none; border-top: 1px solid #d1d5db; margin: 2em 0; }
        .prose img { max-width: 100%; height: auto; border-radius: 0.5em; }
        .prose table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .prose th, .prose td { border: 1px solid #d1d5db; padding: 0.5em 1em; text-align: left; }
        .prose th { background: #f9fafb; font-weight: bold; }
        .dark .prose code { background: #374151; }
        .dark .prose blockquote { border-left-color: #4b5563; color: #9ca3af; }
        .dark .prose th { background: #374151; }
        .dark .prose th, .dark .prose td { border-color: #4b5563; }
      `}</style>
    </ToolLayout>
  );
}
