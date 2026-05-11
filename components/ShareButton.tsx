"use client";

import { useState, useCallback } from "react";
import { Share2, Check, Link as LinkIcon } from "lucide-react";

interface Props {
  title?: string;
  text?: string;
  url?: string;
}

export function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;
    const shareText = text || shareTitle;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (e) {
        // user cancelled or failed, fall back to copy
        copyUrl(shareUrl);
      }
    } else {
      copyUrl(shareUrl);
    }
  }, [title, text, url]);

  const copyUrl = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      aria-label="分享"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
      {copied ? "已复制" : "分享"}
    </button>
  );
}