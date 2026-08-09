'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeXmlAttr(s: string): string {
  return escapeXml(s);
}

function isValidXmlName(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_.-]*$/.test(name);
}

function sanitizeTagName(name: string): string {
  let n = name.replace(/[^A-Za-z0-9_.-]/g, '_');
  if (!/^[A-Za-z_]/.test(n)) n = '_' + n;
  if (!n) n = 'item';
  return n;
}

function jsonToXml(obj: unknown, indent = 0, tagName = 'root'): string {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);

  if (obj === null || obj === undefined) {
    return `${pad}<${tagName}/>`;
  }

  const type = Array.isArray(obj) ? 'array' : typeof obj;

  if (type === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return `${pad}<${tagName}/>`;
    const body = entries
      .map(([k, v]) => {
        const name = sanitizeTagName(k);
        const vt = Array.isArray(v) ? 'array' : typeof v;
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null && !Array.isArray(v[0])) {
          // Array of objects: repeat element
          return (v as unknown[])
            .map((item) => jsonToXml(item, indent + 1, name))
            .join('\n');
        }
        if (vt === 'object' || vt === 'array') {
          return jsonToXml(v, indent + 1, name);
        }
        if (v === null || v === undefined) {
          return `${padInner}<${name}/>`;
        }
        return `${padInner}<${name}>${escapeXml(String(v))}</${name}>`;
      })
      .join('\n');
    return `${pad}<${tagName}>\n${body}\n${pad}</${tagName}>`;
  }

  if (type === 'array') {
    const arr = obj as unknown[];
    if (arr.length === 0) return `${pad}<${tagName}/>`;
    return arr
      .map((item, i) => {
        const name = item !== null && typeof item === 'object' ? tagName : `${tagName}Item`;
        return jsonToXml(item, indent, name);
      })
      .join('\n');
  }

  return `${pad}<${tagName}>${escapeXml(String(obj))}</${tagName}>`;
}

interface XmlNode {
  tag: string;
  attrs: Record<string, string>;
  children: XmlNode[];
  text: string;
}

function parseXml(xml: string): XmlNode {
  // Strip comments and CDATA handling (CDATA kept as text)
  const cleaned = xml.replace(/<!--[\s\S]*?-->/g, '').replace(/<!DOCTYPE[\s\S]*?>/gi, '');

  let pos = 0;
  const len = cleaned.length;

  function skipWs() {
    while (pos < len && /\s/.test(cleaned[pos])) pos++;
  }

  function parseNode(): XmlNode {
    skipWs();
    if (cleaned[pos] !== '<') {
      // Text content
      const start = pos;
      while (pos < len && cleaned[pos] !== '<') pos++;
      const text = cleaned.slice(start, pos).replace(/\s+/g, ' ').trim();
      return { tag: '#text', attrs: {}, children: [], text };
    }

    // Element start or close
    if (cleaned.startsWith('</', pos)) {
      pos += 2;
      while (pos < len && cleaned[pos] !== '>') pos++;
      pos++; // skip >
      return { tag: '#close', attrs: {}, children: [], text: '' };
    }

    pos++; // skip <
    // tag name
    let tag = '';
    while (pos < len && !/[\s/>]/.test(cleaned[pos])) {
      tag += cleaned[pos];
      pos++;
    }
    // attributes
    const attrs: Record<string, string> = {};
    while (pos < len && cleaned[pos] !== '>' && !(cleaned[pos] === '/' && cleaned[pos + 1] === '>')) {
      skipWs();
      if (cleaned[pos] === '>') break;
      let attrName = '';
      while (pos < len && cleaned[pos] !== '=' && !/\s/.test(cleaned[pos]) && cleaned[pos] !== '>') {
        attrName += cleaned[pos];
        pos++;
      }
      skipWs();
      if (cleaned[pos] === '=') {
        pos++;
        skipWs();
        let quote = '';
        if (cleaned[pos] === '"' || cleaned[pos] === "'") {
          quote = cleaned[pos];
          pos++;
        }
        let attrVal = '';
        while (pos < len && (quote ? cleaned[pos] !== quote : cleaned[pos] !== '>' && !/\s/.test(cleaned[pos]))) {
          attrVal += cleaned[pos];
          pos++;
        }
        if (quote) pos++; // skip closing quote
        attrs[attrName] = attrVal
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&amp;/g, '&');
      }
      skipWs();
    }

    if (cleaned[pos] === '/' && cleaned[pos + 1] === '>') {
      pos += 2;
      return { tag, attrs, children: [], text: '' }; // self-closing
    }

    if (cleaned[pos] === '>') pos++; // skip >

    // children
    const children: XmlNode[] = [];
    let text = '';
    for (;;) {
      skipWs();
      if (pos >= len) break;
      if (cleaned[pos] === '<') {
        if (cleaned.startsWith('</', pos)) {
          // find closing tag
          const closeStart = pos;
          pos += 2;
          let closeTag = '';
          while (pos < len && cleaned[pos] !== '>') {
            closeTag += cleaned[pos];
            pos++;
          }
          pos++; // skip >
          if (closeTag.trim() === tag) {
            return { tag, attrs, children, text };
          }
          pos = closeStart; // mismatched — treat as child
        } else if (cleaned.startsWith('<![CDATA[', pos)) {
          const start = pos + 9;
          const end = cleaned.indexOf(']]>', start);
          if (end > -1) {
            text += cleaned.slice(start, end);
            pos = end + 3;
            continue;
          }
        } else {
          const child = parseNode();
          if (child.tag === '#text') text += child.text;
          else children.push(child);
          continue;
        }
      } else {
        const start = pos;
        while (pos < len && cleaned[pos] !== '<') pos++;
        text += cleaned.slice(start, pos);
      }
    }
    return { tag, attrs, children, text };
  }

  const root = parseNode();
  return root;
}

function xmlNodeToJson(node: XmlNode): unknown {
  if (node.tag === '#text') return node.text;

  const hasChildren = node.children.length > 0;
  const childObj: Record<string, unknown> = {};

  // Group children by tag
  const groups: Record<string, XmlNode[]> = {};
  for (const c of node.children) {
    if (c.tag === '#text') continue;
    if (!groups[c.tag]) groups[c.tag] = [];
    groups[c.tag].push(c);
  }

  for (const [tag, items] of Object.entries(groups)) {
    const values = items.map((it) => xmlNodeToJson(it));
    // If the tag appears multiple times, make it an array
    childObj[tag] = values.length === 1 ? values[0] : values;
  }

  const text = node.text.trim();
  const hasText = text.length > 0;

  const result: Record<string, unknown> = {};

  if (Object.keys(node.attrs).length > 0) {
    result['@attrs'] = { ...node.attrs };
  }

  if (hasChildren) {
    Object.assign(result, childObj);
  }

  if (hasText) {
    if (Object.keys(result).length > 0) {
      result['#text'] = text;
    } else {
      return text;
    }
  }

  if (Object.keys(result).length === 0) return '';

  return result;
}

export function JsonXmlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json2xml' | 'xml2json'>('json2xml');
  const [error, setError] = useState('');
  const limiter = useToolLimiter({ toolKey: 'jsxml' });
  const { checkLimit, markUsed } = limiter;

  const convert = useCallback(() => {
    if (!input.trim()) return;
    if (!checkLimit()) return;
    setError('');
    try {
      if (mode === 'json2xml') {
        const obj = JSON.parse(input);
        const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(obj, 0, 'root');
        setOutput(xml);
      } else {
        const root = parseXml(input);
        if (root.tag === '#text') {
          setOutput(root.text);
        } else {
          setOutput(JSON.stringify(xmlNodeToJson(root), null, 2));
        }
      }
      markUsed();
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败，请检查输入格式');
    }
  }, [input, mode, checkLimit, markUsed]);

  const swap = useCallback(() => {
    setMode((m) => (m === 'json2xml' ? 'xml2json' : 'json2xml'));
    setOutput('');
    setError('');
  }, []);

  return (
    <ToolLayout
      title="JSON ↔ XML 转换"
      description="在线 JSON 与 XML 互转工具，支持嵌套对象、数组、属性转换，纯浏览器处理"
      instructions="选择转换方向（JSON 转 XML 或 XML 转 JSON），粘贴内容，点击转换按钮即可得到结果。转换在浏览器本地完成，数据不会上传。"
    >
      {/* Mode switch */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{mode === 'json2xml' ? 'JSON → XML' : 'XML → JSON'}</span>
        <button onClick={swap} className="btn-secondary text-sm px-3 py-1.5">
          交换方向
        </button>
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{mode === 'json2xml' ? 'JSON 输入' : 'XML 输入'}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'json2xml' ? '{"name": "张三", "age": 30, "tags": ["a", "b"]}' : '<root><name>张三</name><age>30</age></root>'}
          className="w-full h-64 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={convert} className="btn-primary">
          转换
        </button>
        <button onClick={() => setInput('')} className="btn-secondary">
          清空输入
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Output */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">输出结果</label>
        <textarea
          readOnly
          value={output}
          placeholder="转换结果将显示在这里"
          className="w-full h-64 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {/* Copy */}
      {output && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(output);
            }}
            className="btn-secondary"
          >
            复制结果
          </button>
        </div>
      )}
      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
