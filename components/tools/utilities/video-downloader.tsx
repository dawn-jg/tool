"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";

interface VideoResult {
  platform: string;
  platformName: string;
  title?: string;
  author?: string;
  cover?: string;
  downloadUrl?: string;
  error?: string;
}

interface PlatformInfo {
  name: string;
  icon: string;
  color: string;
  hint: string;
  level: "full" | "partial" | "try";
}

const PLATFORMS: Record<string, PlatformInfo> = {
  bilibili: { name: "B站", icon: "📺", color: "bg-pink-500", hint: "bilibili.com/video/BV...", level: "full" },
  douyin: { name: "抖音", icon: "🎵", color: "bg-black", hint: "douyin.com/video/...", level: "try" },
  tiktok: { name: "TikTok", icon: "🎵", color: "bg-gray-800", hint: "tiktok.com/@user/video/...", level: "partial" },
  kuaishou: { name: "快手", icon: "📱", color: "bg-orange-500", hint: "kuaishou.com/...", level: "try" },
  xiaohongshu: { name: "小红书", icon: "📕", color: "bg-red-500", hint: "xiaohongshu.com/...", level: "try" },
  weibo: { name: "微博", icon: "💬", color: "bg-red-600", hint: "weibo.com/...", level: "try" },
  xigua: { name: "西瓜视频", icon: "🍉", color: "bg-green-600", hint: "ixigua.com/...", level: "try" },
  toutiao: { name: "今日头条", icon: "📰", color: "bg-blue-600", hint: "toutiao.com/...", level: "try" },
  haokan: { name: "好看视频", icon: "👀", color: "bg-blue-500", hint: "haokan.baidu.com/...", level: "try" },
  pipixia: { name: "皮皮虾", icon: "🦐", color: "bg-yellow-600", hint: "pipixia.com/...", level: "try" },
};

const LEVEL_LABEL: Record<string, string> = {
  full: "✅ 完整支持",
  partial: "⚠️ 有限支持",
  try: "🔍 可尝试",
};

function detectPlatform(url: string): string | null {
  if (/bilibili\.com|b23\.tv/i.test(url)) return 'bilibili';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/douyin\.com|iesdouyin/i.test(url)) return 'douyin';
  if (/kuaishou\.com/i.test(url)) return 'kuaishou';
  if (/xiaohongshu\.com|xhslink\.com/i.test(url)) return 'xiaohongshu';
  if (/weibo\.com/i.test(url)) return 'weibo';
  if (/ixigua\.com/i.test(url)) return 'xigua';
  if (/toutiao\.com/i.test(url)) return 'toutiao';
  if (/haokan\./i.test(url)) return 'haokan';
  if (/pipixia\.com/i.test(url)) return 'pipixia';
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
      setResult({ platform: "", platformName: "", error: "网络请求失败" });
    } finally {
      setLoading(false);
    }
  };

  const info = detected ? PLATFORMS[detected] : null;
  const r = result;

  return (
    <ToolLayout
      title="短视频下载"
      description="输入短视频/直播链接，解析并获取高清下载"
      instructions="复制你想下载的视频链接（支持从分享菜单获取），粘贴到下方输入框后点击解析。B站可以完整解析，其他平台自动尝试抓取。"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* URL 输入 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            粘贴短视频/直播链接
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={(e) => e.key === "Enter" && handleParse()}
              placeholder="粘贴视频分享链接..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={handleParse}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors whitespace-nowrap"
            >
              {loading ? "解析中..." : "🔍 解析"}
            </button>
          </div>

          {detected && info && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white ${info.color}`}>
              <span>{info.icon}</span>
              <span>检测到 {info.name} 链接</span>
              <span className="ml-2 text-white/70 text-xs">{LEVEL_LABEL[info.level]}</span>
            </div>
          )}
        </div>

        {/* 结果 */}
        {r && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            {r.error ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <p className="text-amber-800 dark:text-amber-200 text-sm">{r.error}</p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">
                  💡 试试：在对应APP内点击分享 → 复制链接 → 粘贴到这里
                  {r.platform === "bilibili" && " 或检查BV号是否正确"}
                  {["douyin", "kuaishou", "xiaohongshu", "pipixia"].includes(r.platform) &&
                    " | 也可在APP内选择「保存到本地」"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(r.cover || r.title || r.author) && (
                  <div className="flex gap-4">
                    {r.cover && (
                      <img
                        src={r.cover}
                        alt="封面"
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      {r.title && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{r.title}</p>
                      )}
                      {r.author && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">@{r.author}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{r.platformName}</p>
                    </div>
                  </div>
                )}

                {r.downloadUrl ? (
                  <a
                    href={r.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
                  >
                    ⬇️ 下载视频 (MP4)
                  </a>
                ) : r.platform === "bilibili" ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    该视频可能设置了权限限制，尝试在 B站 APP 中下载
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* 支持平台列表 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">支持平台一览</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <div
                key={key}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                  key === detected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-900"
                }`}
              >
                <span>{p.icon}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{p.name}</span>
                <span className="ml-auto text-[10px] opacity-60">
                  {p.level === "full" ? "✅" : p.level === "partial" ? "⚠️" : "🔍"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
            ✅ 完整支持 = 直接解析下载链接 | ⚠️ 有限支持 = 仅基本信息 | 🔍 可尝试 = 自动抓取页面
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
