'use client';

import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function ImageToBase64() {
  const [output, setOutput] = useState('');
  const [preview, setPreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setOutput(base64);
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <ToolLayout
      title="图片转 Base64"
      description="将图片文件转换为Base64编码字符串"
      instructions="选择或拖拽图片文件，自动生成Base64编码字符串。支持PNG、JPG、GIF、SVG、WebP等常见图片格式。生成的Data URI可直接用于img标签src属性或CSS背景。"
      output={output}
    >
      <div className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && fileRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileRef.current.files = dt.files;
            fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <p className="text-gray-500 dark:text-gray-400">点击或拖拽图片到此处</p>
      </div>
      {preview && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">预览</p>
          <img src={preview} alt="preview" className="max-w-full max-h-64 rounded-lg border border-gray-200 dark:border-gray-700" />
        </div>
      )}
    </ToolLayout>
  );
}
