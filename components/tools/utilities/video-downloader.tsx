"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";

interface VideoResult {
  platform: string;
  title?: string;
  author?: string;
  cover?: string;
  downloadUrl?: string;
  error?: string;
  fallbackUrl?: string;
}

const PLATFORM_INFO: Record<string, { name: string; color: string; icon: string; hint: string }> = {
  bilibili: { name: "B站", color: "bg-pink-500", icon: "📺", hint: "例如: https://www.bilibili.com/video/BV1xx411c7mD" },
  tiktok: { name: "TikTok", color: "bg-black", icon: "🎵", hint: "例如: https://www.tiktok.com/@user/video/123456789" },
  douyin: { name: "抖音", color: "bg-cyan-500", icon: "🎶", hint: "抖音链接" },
  kuaishou: { name: "快手", color: "bg-orange-500", icon: "📱", hint: "快手链接" },
  xiaohongshu: { name: "小红书", color: "bg-red-500", icon: "📕", hint: "小红书链接" },
};

function detectPlatform(url: string): string | null {
  if (/bilibili\.com|b23\.tv/i.test(url)) return 'bilibili';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/douyin\.com/i.test(url)) return 'douyin';
  if (/kuaishou\.com/i.test(url)) return 'kuaishou';
  if (/xiaohongshu\.com|xhslink\.com/i.test(url)) return 'xiaohongshu';
  return null;
}

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [detected, setDetected] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setUrl(v);
    setDetected(detectPlatform(v));
    setResult(null);
  };

  const handleParse = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/video-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data: VideoResult = await res.json();
      setResult(data);
    } catch {
      setResult({ platform: "unknown", error: "网络请求失败，请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  const platform = detected as string;
  const info = platform ? PLATFORM_INFO[platform] : null;
  const canDownload = result?.downloadUrl;
  const hasError = result?.error;
  const hasPartial = result?.title || result?.author;

  return (
    <ToolLayout
      title="短视频下载"
      description="输入短视频链接，快速获取高清下载"
      instructions="支持 B站 / TikTok / 抖音 / 快手 / 小红书。注意：抖音/快手/小红书因平台限制，需要配合第三方工具使用。"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* URL 输入 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            粘贴短视频链接
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={(e) => e.key === "Enter" && handleParse()}
              placeholder="https://www.bilibili.com/video/BV... 或 TikTok/抖音链接..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={handleParse}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors whitespace-nowrap"
            >
              {loading ? "解析中..." : "解析"}
            </button>
          </div>

          {/* 平台检测提示 */}
          {detected && info && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white ${info.color}`}>
              <span>{info.icon}</span>
              <span>检测到 {info.name} 链接</span>
            </div>
          )}
        </div>

        {/* 结果展示 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            {/* 错误 */}
            {hasError && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">{result.error}</p>
                {result.platform === "tiktok" && (
                  <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
                    试试: 使用 TikTok 官方APP下载，或搜索 &quot;TikTok 视频下载&quot; 使用第三方网站
                  </p>
                )}
              </div>
            )}

            {/* 部分信息 */}
            {hasPartial && (
              <div className="space-y-3">
                {result.title && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">标题</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{result.title}</p>
                  </div>
                )}
                {result.author && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">作者</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{result.author}</p>
                  </div>
                )}
                {result.cover && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2">封面</span>
                    <img
                      src={result.cover}
                      alt="视频封面"
                      className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-600"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 下载按钮 */}
            {canDownload ? (
              <a
                href={result.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
              >
                ⬇️ 下载视频 ({info?.name || "未知平台"})
              </a>
            ) : hasPartial && !hasError ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                此平台暂未开放直接下载，请使用官方 APP 下载
              </p>
            ) : null}

            {/* 平台对照表 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">各平台下载方式一览</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(PLATFORM_INFO).map(([key, p]) => (
                  <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span>{p.icon}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{p.name}</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-white text-[10px] ${
                      key === "bilibili" ? "bg-green-500" :
                      key === "tiktok" ? "bg-yellow-500" : "bg-gray-400"
                    }`}>
                      {key === "bilibili" ? "✅ 支持" : key === "tiktok" ? "⚠️ 有限" : "❌ 需第三方"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
