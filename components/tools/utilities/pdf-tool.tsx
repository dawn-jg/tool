'use client';

import { useState, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { ToolLayout } from '@/components/ToolLayout';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';
import { PDFDocument, degrees } from 'pdf-lib';

type Tab = 'merge' | 'split' | 'rotate' | 'encrypt' | 'decrypt';

interface FileEntry {
  file: File;
  id: string;
  name: string;
}

function asBuf(data: Uint8Array): Uint8Array<ArrayBuffer> { return data as unknown as Uint8Array<ArrayBuffer>; }

const encoder = new TextEncoder();

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: asBuf(salt), iterations: 200000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptPdf(data: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: asBuf(iv) }, key, asBuf(data));
  const out = new Uint8Array(16 + 12 + cipher.byteLength);
  out.set(salt, 0);
  out.set(iv, 16);
  out.set(new Uint8Array(cipher), 28);
  return out;
}

async function decryptPdf(data: Uint8Array, password: string): Promise<Uint8Array> {
  if (data.length < 28) throw new Error('Invalid file');
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const cipher = data.slice(28);
  const key = await deriveKey(password, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: asBuf(iv) }, key, asBuf(cipher));
  return new Uint8Array(plain);
}

export function PdfTool() {
  const { t } = useI18n();
  const limiter = useToolLimiter({ toolKey: 'pdf-tool', freeLimit: 3 });
  const [tab, setTab] = useState<Tab>('merge');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState('output.pdf');
  const [error, setError] = useState('');

  const [splitRanges, setSplitRanges] = useState('');
  const [rotatePages, setRotatePages] = useState('');
  const [rotateAngle, setRotateAngle] = useState(90);
  const [encryptPassword, setEncryptPassword] = useState('');
  const [encryptConfirm, setEncryptConfirm] = useState('');
  const [decryptPassword, setDecryptPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList) => {
    const entries: FileEntry[] = [];
    const acceptPdf = tab !== 'decrypt';
    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i];
      if (acceptPdf && (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
        entries.push({ file: f, id: `${Date.now()}-${i}`, name: f.name });
      } else if (!acceptPdf) {
        entries.push({ file: f, id: `${Date.now()}-${i}`, name: f.name });
      }
    }
    if (tab === 'merge') {
      setFiles(prev => [...prev, ...entries]);
    } else {
      setFiles(entries.slice(0, 1));
    }
    setError('');
  }, [tab]);

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const moveFile = (id: string, dir: number) => {
    setFiles(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const clearResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setError('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const readFile = (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    if (!limiter.checkLimit()) return;
    setProcessing(true);
    try {
      const merged = await PDFDocument.create();
      for (const entry of files) {
        const bytes = await readFile(entry.file);
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const mergedBytes = await merged.save();
      const blob = new Blob([asBuf(mergedBytes)], { type: 'application/pdf' });
      clearResult();
      setResultUrl(URL.createObjectURL(blob));
      setResultName('merged.pdf');
      limiter.markUsed();
    } catch (err: any) { setError(err?.message || String(err)); }
    setProcessing(false);
  };

  const handleSplit = async () => {
    if (files.length !== 1) return;
    if (!limiter.checkLimit()) return;
    setProcessing(true);
    try {
      const bytes = await readFile(files[0].file);
      const doc = await PDFDocument.load(bytes);
      const total = doc.getPageCount();
      const rangeStr = splitRanges.trim() || [...Array(total)].map((_, i) => i + 1).join(',');
      const selected = new Set<number>();
      for (const part of rangeStr.split(',')) {
        const t = part.trim();
        if (t.includes('-')) {
          const [a, b] = t.split('-').map(Number);
          for (let i = Math.max(1, a); i <= Math.min(total, b || a); i++) selected.add(i - 1);
        } else {
          const n = Number(t);
          if (n >= 1 && n <= total) selected.add(n - 1);
        }
      }
      const extracted = await PDFDocument.create();
      const indices = Array.from(selected).filter(i => i < total).sort((a, b) => a - b);
      if (indices.length === 0) { setError(t('pdf.noPages')); setProcessing(false); return; }
      const pages = await extracted.copyPages(doc, indices);
      pages.forEach(p => extracted.addPage(p));
      const extBytes = await extracted.save();
      const blob = new Blob([asBuf(extBytes)], { type: 'application/pdf' });
      clearResult();
      setResultUrl(URL.createObjectURL(blob));
      setResultName('split.pdf');
      limiter.markUsed();
    } catch (err: any) { setError(err?.message || String(err)); }
    setProcessing(false);
  };

  const handleRotate = async () => {
    if (files.length !== 1) return;
    if (!limiter.checkLimit()) return;
    setProcessing(true);
    try {
      const bytes = await readFile(files[0].file);
      const doc = await PDFDocument.load(bytes);
      const total = doc.getPageCount();
      const pageSet = rotatePages.trim() || [...Array(total)].map((_, i) => i + 1).join(',');
      const selected = new Set<number>();
      for (const part of pageSet.split(',')) {
        const t = part.trim();
        if (t.includes('-')) {
          const [a, b] = t.split('-').map(Number);
          for (let i = Math.max(1, a); i <= Math.min(total, b || a); i++) selected.add(i - 1);
        } else {
          const n = Number(t);
          if (n >= 1 && n <= total) selected.add(n - 1);
        }
      }
      for (const idx of selected) {
        const page = doc.getPage(idx);
        page.setRotation(degrees(rotateAngle as 90 | 180 | 270));
      }
      const rotBytes = await doc.save();
      const blob = new Blob([asBuf(rotBytes)], { type: 'application/pdf' });
      clearResult();
      setResultUrl(URL.createObjectURL(blob));
      setResultName('rotated.pdf');
      limiter.markUsed();
    } catch (err: any) { setError(err?.message || String(err)); }
    setProcessing(false);
  };

  const handleEncrypt = async () => {
    if (files.length !== 1) return;
    if (!encryptPassword || encryptPassword !== encryptConfirm) return;
    if (!limiter.checkLimit()) return;
    setProcessing(true);
    try {
      const bytes = await readFile(files[0].file);
      const encrypted = await encryptPdf(bytes, encryptPassword);
      const blob = new Blob([asBuf(encrypted)], { type: 'application/octet-stream' });
      clearResult();
      setResultUrl(URL.createObjectURL(blob));
      setResultName(files[0].name + '.enc');
      limiter.markUsed();
    } catch (err: any) { setError(err?.message || String(err)); }
    setProcessing(false);
  };

  const handleDecrypt = async () => {
    if (!limiter.checkLimit()) return;
    if (files.length !== 1) return;
    if (!decryptPassword) return;
    setProcessing(true);
    try {
      const bytes = await readFile(files[0].file);
      const decrypted = await decryptPdf(bytes, decryptPassword);
      const blob = new Blob([asBuf(decrypted)], { type: 'application/pdf' });
      clearResult();
      setResultUrl(URL.createObjectURL(blob));
      setResultName(files[0].name.replace(/\.enc$/i, '.pdf'));
      limiter.markUsed();
    } catch (err: any) { setError(t('pdf.decryptError')); }
    setProcessing(false);
  };

  const tabs: { key: Tab; labelKey: string }[] = [
    { key: 'merge', labelKey: 'pdf.tabs.merge' },
    { key: 'split', labelKey: 'pdf.tabs.split' },
    { key: 'rotate', labelKey: 'pdf.tabs.rotate' },
    { key: 'encrypt', labelKey: 'pdf.tabs.encrypt' },
    { key: 'decrypt', labelKey: 'pdf.tabs.decrypt' },
  ];

  const dropText: Record<Tab, string> = {
    merge: 'pdf.drop.merge', split: 'pdf.drop.split', rotate: 'pdf.drop.rotate',
    encrypt: 'pdf.drop.encrypt', decrypt: 'pdf.drop.decrypt',
  };
  const dropHint: Record<Tab, string> = {
    merge: 'pdf.dropHint.merge', decrypt: 'pdf.dropHint.decrypt',
    split: 'pdf.dropHint.default', rotate: 'pdf.dropHint.default', encrypt: 'pdf.dropHint.default',
  };
  const btnText: Record<Tab, string> = {
    merge: 'pdf.btn.merge', split: 'pdf.btn.split', rotate: 'pdf.btn.rotate',
    encrypt: 'pdf.btn.encrypt', decrypt: 'pdf.btn.decrypt',
  };

  return (
    <ToolLayout
      title="PDF Tools"
      instructions="tool.pdfTool"
      description="Merge, split, rotate, encrypt and decrypt PDF files. All processed locally in your browser."
    >
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 flex-wrap">
        {tabs.map(item => (
          <button
            key={item.key}
            onClick={() => { setTab(item.key); clearResult(); setFiles([]); }}
            className={`flex-1 min-w-[64px] py-2.5 text-sm font-semibold rounded-lg transition-all ${
              tab === item.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors mb-4"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={tab === 'decrypt' ? '*/*' : '.pdf'}
          multiple={tab === 'merge'}
          className="hidden"
          onChange={e => e.target.files && addFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">{tab === 'decrypt' ? '🔐' : '📄'}</div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {t(dropText[tab])}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {t(dropHint[tab])}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mb-4">
          {files.map((f, i) => (
            <div key={f.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
              <span className="text-sm text-gray-400 w-6 text-center">{i + 1}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{f.name}</span>
              {tab === 'merge' && files.length > 1 && (
                <div className="flex gap-1">
                  <button onClick={() => moveFile(f.id, -1)} disabled={i === 0}
                    className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors">↑</button>
                  <button onClick={() => moveFile(f.id, 1)} disabled={i === files.length - 1}
                    className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors">↓</button>
                </div>
              )}
              <button onClick={() => removeFile(f.id)}
                className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">✕</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'split' && files.length === 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('pdf.label.pageRanges')}</label>
          <input
            type="text" value={splitRanges} onChange={e => setSplitRanges(e.target.value)}
            placeholder={t('pdf.placeholder.range')}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      )}

      {tab === 'rotate' && files.length === 1 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('pdf.label.pages')}</label>
            <input
              type="text" value={rotatePages} onChange={e => setRotatePages(e.target.value)}
              placeholder={t('pdf.placeholder.pages')}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('pdf.label.angle')}</label>
            <select
              value={rotateAngle} onChange={e => setRotateAngle(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value={90}>{t('pdf.angle.cw90')}</option>
              <option value={180}>{t('pdf.angle.180')}</option>
              <option value={270}>{t('pdf.angle.cw270')}</option>
            </select>
          </div>
        </div>
      )}

      {tab === 'encrypt' && files.length === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('pdf.label.password')}</label>
            <input
              type="password" value={encryptPassword} onChange={e => setEncryptPassword(e.target.value)}
              placeholder={t('pdf.placeholder.password')}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('pdf.label.confirmPassword')}</label>
            <input
              type="password" value={encryptConfirm} onChange={e => setEncryptConfirm(e.target.value)}
              placeholder={t('pdf.placeholder.confirm')}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none ${
                encryptConfirm && encryptPassword !== encryptConfirm ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
              }`}
            />
          </div>
        </div>
      )}

      {tab === 'encrypt' && encryptConfirm && encryptPassword !== encryptConfirm && (
        <p className="text-sm text-red-500 mb-4">{t('pdf.passwordMismatch')}</p>
      )}
      {tab === 'encrypt' && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          {t('pdf.encryptDesc')}
        </p>
      )}

      {tab === 'decrypt' && files.length === 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('pdf.label.password')}</label>
          <input
            type="password" value={decryptPassword} onChange={e => setDecryptPassword(e.target.value)}
            placeholder={t('pdf.placeholder.decryptPassword')}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {files.length > 0 && (
        <button
          onClick={() => {
            if (tab === 'merge') handleMerge();
            else if (tab === 'split') handleSplit();
            else if (tab === 'rotate') handleRotate();
            else if (tab === 'encrypt') handleEncrypt();
            else if (tab === 'decrypt') handleDecrypt();
          }}
          disabled={
            processing ||
            (tab === 'merge' && files.length < 2) ||
            (tab === 'encrypt' && (!encryptPassword || encryptPassword.length < 4 || encryptPassword !== encryptConfirm)) ||
            (tab === 'decrypt' && !decryptPassword)
          }
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 dark:disabled:bg-purple-800 text-white font-semibold text-sm rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('pdf.processing')}</>
          ) : (
            <>{t(btnText[tab])}</>
          )}
        </button>
      )}

      {resultUrl && (
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium mb-3">
            <span>✓</span> {t('pdf.ready')}
          </div>
          <a
            href={resultUrl} download={resultName}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {t('pdf.download')} {resultName}
          </a>
        </div>
      )}

      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
