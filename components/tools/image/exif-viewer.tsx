'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function ExifViewer() {
  const [info, setInfo] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lines: string[] = [];
    lines.push(`文件名: ${file.name}`);
    lines.push(`文件大小: ${(file.size / 1024).toFixed(2)} KB`);
    lines.push(`MIME类型: ${file.type}`);
    lines.push(`最后修改: ${new Date(file.lastModified).toLocaleString('zh-CN')}`);

    const reader = new FileReader();
    reader.onload = () => {
      const view = new DataView(reader.result as ArrayBuffer);
      const arr = new Uint8Array(reader.result as ArrayBuffer);

      // Check JPEG
      if (arr[0] === 0xFF && arr[1] === 0xD8) {
        lines.push('\n格式: JPEG');

        // Look for EXIF (0xFFE1)
        for (let i = 2; i < arr.length - 1; i++) {
          if (arr[i] === 0xFF && arr[i + 1] === 0xE1) {
            const length = (arr[i + 2] << 8) | arr[i + 3];
            const exifStart = i + 4;

            // Check "Exif" marker
            const marker = String.fromCharCode(...arr.slice(exifStart, exifStart + 4));
            if (marker === 'Exif') {
              lines.push('Exif数据: 已找到');

              // Tiff header
              const tiffStart = exifStart + 6;
              const isLittleEndian = arr[tiffStart] === 0x49;
              const read16 = (offset: number) => {
                const v = view.getUint16(offset, isLittleEndian);
                return v;
              };
              const read32 = (offset: number) => {
                const v = view.getUint32(offset, isLittleEndian);
                return v;
              };

              const ifd0Offset = read32(tiffStart + 4);
              const ifd0 = tiffStart + ifd0Offset;
              const entryCount = read16(ifd0);
              const tags: Record<number, string> = {
                0x010F: '相机制造商', 0x0110: '相机型号', 0x0112: '方向',
                0x0132: '拍摄时间', 0x8769: 'Exif子IFD', 0x8825: 'GPS子IFD',
                0x9003: '原始时间', 0x9004: '数字化时间',
                0x011A: 'X分辨率', 0x011B: 'Y分辨率',
              };

              for (let j = 0; j < entryCount; j++) {
                const entry = ifd0 + 2 + j * 12;
                const tag = read16(entry);
                const tagName = tags[tag];
                if (tagName) {
                  const type = read16(entry + 2);
                  const count = read32(entry + 4);
                  let value = '';
                  if (type === 2) {
                    const vo = read32(entry + 8);
                    if (count <= 4) {
                      for (let k = 0; k < count - 1; k++) {
                        value += String.fromCharCode(arr[entry + 8 + k]);
                      }
                    } else {
                      for (let k = 0; k < count - 1; k++) {
                        value += String.fromCharCode(arr[tiffStart + vo + k]);
                      }
                    }
                  } else {
                    value = String(read32(entry + 8));
                  }
                  lines.push(`${tagName}: ${value}`);
                }
              }
              break;
            }
          }
        }
      } else if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
        lines.push('\n格式: PNG');

        // Read PNG chunks
        let offset = 8;
        while (offset < arr.length) {
          const length = (arr[offset] << 24) | (arr[offset + 1] << 16) | (arr[offset + 2] << 8) | arr[offset + 3];
          const type = String.fromCharCode(...arr.slice(offset + 4, offset + 8));
          if (type === 'IHDR') {
            const w = (arr[offset + 8] << 24) | (arr[offset + 9] << 16) | (arr[offset + 10] << 8) | arr[offset + 11];
            const h = (arr[offset + 12] << 24) | (arr[offset + 13] << 16) | (arr[offset + 14] << 8) | arr[offset + 15];
            lines.push(`尺寸: ${w} x ${h} px`);
            lines.push(`位深度: ${arr[offset + 16]}`);
            const colorTypes = ['灰度', '', 'RGB', '索引色', '灰度+Alpha', '', 'RGBA'];
            lines.push(`颜色类型: ${colorTypes[arr[offset + 17]] || '未知'}`);
          }
          if (type === 'IEND') break;
          offset += 12 + length;
        }
      } else if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46) {
        lines.push('\n格式: GIF');
      } else if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46) {
        lines.push('\n格式: WebP');
      }

      setInfo(lines.join('\n'));
    };
    reader.readAsArrayBuffer(file.slice(0, 65536)); // Read first 64KB
  };

  return (
    <ToolLayout
      title="Exif 查看器"
      description="查看图片Exif元数据信息"
      instructions="选择一张图片（支持JPEG、PNG），即可查看图片的元数据信息。包括文件名、大小、类型、拍摄参数（针对JPEG的Exif数据）等。读取在浏览器本地完成。"
      output={info || undefined}
    >
      <div className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <p className="text-gray-500 dark:text-gray-400">点击选择图片文件</p>
      </div>
    </ToolLayout>
  );
}
