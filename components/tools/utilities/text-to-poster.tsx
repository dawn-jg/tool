'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useI18n } from '@/lib/i18n';
import { useToolLimiter, PaywallModal } from '@/lib/use-tool-limiter';

export function TextToPoster() {
  const { t } = useI18n();
  const limiter = useToolLimiter({ toolKey: 'poster', freeLimit: 5 });
  const [title, setTitle] = useState('今日分享');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(48);
  const [gradientStyle, setGradientStyle] = useState<'linear' | 'radial'>('linear');
  const [gradientColors, setGradientColors] = useState('#667eea,#764ba2');
  const [useGradient, setUseGradient] = useState(false);
  const [layout, setLayout] = useState<'center' | 'top' | 'bottom'>('center');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#1a1a2e', '#16213e', '#0f3460', '#e94560',
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#fa709a', '#30cfd0',
  ];

  const generatePoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 800;
    canvas.height = 1000;

    if (useGradient) {
      const gradient = gradientStyle === 'linear'
        ? ctx.createLinearGradient(0, 0, 800, 1000)
        : ctx.createRadialGradient(400, 500, 0, 400, 500, 600);
      const [color1, color2] = gradientColors.split(',');
      gradient.addColorStop(0, color1.trim());
      gradient.addColorStop(1, color2.trim());
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, 800, 1000);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (layout === 'center') {
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(title, 400, 400);
      if (subtitle) {
        ctx.font = `${fontSize * 0.6}px sans-serif`;
        ctx.fillText(subtitle, 400, 480);
      }
      if (author) {
        ctx.font = `${fontSize * 0.4}px sans-serif`;
        ctx.fillText('— ' + author, 400, 560);
      }
    } else if (layout === 'top') {
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(title, 400, 200);
      if (subtitle) {
        ctx.font = `${fontSize * 0.5}px sans-serif`;
        ctx.fillText(subtitle, 400, 280);
      }
      if (author) {
        ctx.font = `${fontSize * 0.35}px sans-serif`;
        ctx.fillText(author, 400, 340);
      }
    } else {
      if (author) {
        ctx.font = `${fontSize * 0.4}px sans-serif`;
        ctx.fillText(author, 400, 500);
      }
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(title, 400, 600);
      if (subtitle) {
        ctx.font = `${fontSize * 0.5}px sans-serif`;
        ctx.fillText(subtitle, 400, 680);
      }
    }

    return canvas.toDataURL('image/png');
  }, [title, subtitle, author, bgColor, textColor, fontSize, gradientStyle, gradientColors, useGradient, layout]);

  const downloadPoster = () => {
    if (!limiter.checkLimit()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    limiter.markUsed();
  };

  const bgPresets = [
    { bg: '#1a1a2e', text: '#ffffff', label: '暗夜紫' },
    { bg: '#667eea', text: '#ffffff', label: '渐变蓝' },
    { bg: '#f093fb', text: '#1a1a2e', label: '粉色' },
    { bg: '#43e97b', text: '#1a1a2e', label: '绿色' },
  ];

  return (
    <ToolLayout
      title="文字转海报生成器"
      description="文字生成精美海报图片"
      instructions="输入文字，选择配色和布局，点击下载按钮生成海报图片。支持自定义背景色、文字颜色、字体大小。"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="今日分享"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">副标题</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="可选副标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">作者/来源</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="可选作者名"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">背景色</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">文字色</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">字体大小: {fontSize}px</label>
              <input
                type="range"
                min={24}
                max={96}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">布局</label>
              <div className="flex gap-2">
                {(['center', 'top', 'bottom'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLayout(l)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      layout === l ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {l === 'center' ? '居中' : l === 'top' ? '顶部' : '底部'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGradient}
                  onChange={(e) => setUseGradient(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">使用渐变背景</span>
              </label>
              {useGradient && (
                <div className="mt-2 flex gap-2">
                  <select
                    value={gradientStyle}
                    onChange={(e) => setGradientStyle(e.target.value as 'linear' | 'radial')}
                    className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <option value="linear">线性渐变</option>
                    <option value="radial">径向渐变</option>
                  </select>
                  <input
                    type="text"
                    value={gradientColors}
                    onChange={(e) => setGradientColors(e.target.value)}
                    placeholder="#667eea,#764ba2"
                    className="flex-1 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-sm"
                  />
                </div>
              )}
            </div>

            <button onClick={downloadPoster} className="btn-primary w-full py-3">
              📥 下载海报
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">预设配色</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {bgPresets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => { setBgColor(preset.bg); setTextColor(preset.text); }}
                  className="p-3 rounded-lg border-2 border-transparent hover:border-blue-400"
                  style={{ backgroundColor: preset.bg, color: preset.text }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium mb-2">快速配色</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-blue-400"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <label className="block text-sm font-medium mb-2">预览</label>
            <div
              ref={previewRef}
              className="w-full aspect-[4/5] rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: useGradient ? undefined : bgColor }}
            >
              {useGradient && (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    background: gradientStyle === 'linear'
                      ? `linear-gradient(45deg, ${gradientColors.split(',')[0]}, ${gradientColors.split(',')[1]})`
                      : `radial-gradient(circle, ${gradientColors.split(',')[0]}, ${gradientColors.split(',')[1]})`
                  }}
                />
              )}
              <div className="relative text-center p-8">
                <div className="text-4xl font-bold mb-4" style={{ color: textColor, fontSize: fontSize * 0.6 }}>{title}</div>
                {subtitle && <div className="text-lg mb-2" style={{ color: textColor, fontSize: fontSize * 0.4 }}>{subtitle}</div>}
                {author && <div className="text-sm" style={{ color: textColor, fontSize: fontSize * 0.3 }}>— {author}</div>}
              </div>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <PaywallModal limiter={limiter} />
    </ToolLayout>
  );
}
