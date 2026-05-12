'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Share2, Check, Link as LinkIcon, Twitter, Facebook, MessageCircle, Linkedin } from 'lucide-react';

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  getUrl: (url: string, title: string, desc?: string) => string;
  bgClass: string;
  hoverClass: string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    name: 'X (Twitter)',
    icon: <Twitter className="h-4 w-4" />,
    getUrl: (url, title) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    bgClass: 'bg-black',
    hoverClass: 'hover:bg-gray-800',
  },
  {
    name: 'Facebook',
    icon: <Facebook className="h-4 w-4" />,
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    bgClass: 'bg-blue-600',
    hoverClass: 'hover:bg-blue-700',
  },
  {
    name: '微博',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.378-.595 1.176-.861 1.793-.602.622.263.82.972.442 1.593zm1.27-1.627c-.141.237-.447.338-.68.225-.236-.112-.336-.42-.221-.667.117-.243.379-.353.624-.225.233.119.329.426.277.667zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.642 4.318-.341 5.132-2.179.8-1.793-.201-3.672-2.161-4.149zm7.563-1.371c-.346-.105-.577-.18-.404-.633.179-.474.374-.879.554-1.317.161-.388.095-.629-.344-.736-.467-.114-.93-.061-1.378.041-.385.087-.49.37-.313.727.165.338.341.674.505 1.014.136.282.052.553-.254.703-.336.164-.673.215-1.034.112-.301-.086-.483-.349-.468-.663.017-.353.247-.558.579-.616.339-.06.68-.018.976.194.315.227.456.554.33.918-.138.396-.426.562-.82.486-.315-.061-.607-.175-.896-.286-.269-.103-.475-.026-.57.263l-.015.045c-.054.132-.114.286-.197.484-.107.255-.367.354-.62.245-.293-.126-.438-.421-.323-.702.125-.305.287-.605.438-.915.161-.33.076-.561-.303-.765-.401-.216-.828-.304-1.274-.194-.43.106-.718.406-.79.835-.073.438.112.807.511 1.017.304.161.628.288.935.432.279.13.479.33.469.658-.012.339-.197.565-.494.664-.336.111-.68.111-1.018.027-.318-.079-.53-.295-.564-.638-.031-.312.072-.607.353-.793.275-.182.595-.241.9-.143.345.111.533.423.442.732-.081.275-.279.48-.556.561-.298.088-.596.074-.882-.068-.271-.134-.417-.409-.373-.702.045-.301.276-.508.586-.548.314-.04.628.038.89.246.248.197.39.471.329.78-.053.268-.25.449-.527.493-.281.045-.552-.081-.744-.332-.185-.241-.231-.542-.111-.822.136-.318.427-.472.757-.417.289.049.56.176.821.303.259.126.467.012.582-.249.103-.233.076-.492-.074-.679-.172-.215-.418-.339-.676-.342-.269-.004-.524.112-.696.337-.188.247-.204.562-.048.825.162.271.423.404.714.355.276-.047.505-.234.622-.503.121-.279.072-.575-.133-.809z"/></svg>,
    getUrl: (url, title) => `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    bgClass: 'bg-red-500',
    hoverClass: 'hover:bg-red-600',
  },
  {
    name: 'WhatsApp',
    icon: <MessageCircle className="h-4 w-4" />,
    getUrl: (url, title) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    bgClass: 'bg-green-500',
    hoverClass: 'hover:bg-green-600',
  },
  {
    name: 'LinkedIn',
    icon: <Linkedin className="h-4 w-4" />,
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    bgClass: 'bg-blue-700',
    hoverClass: 'hover:bg-blue-800',
  },
];

interface Props {
  title?: string;
  text?: string;
  url?: string;
}

export function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const shareText = text || shareTitle;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        setShowDropdown(false);
      } catch (e) {
        // user cancelled or failed, show dropdown
        setShowDropdown(true);
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  }, [shareTitle, shareText, shareUrl, showDropdown]);

  const handleSocialShare = (platform: SocialPlatform) => {
    const targetUrl = platform.getUrl(shareUrl, shareTitle, shareText);
    window.open(targetUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label="分享"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
        {copied ? "已复制" : "分享"}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
          <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            分享到社交平台
          </div>
          {socialPlatforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => handleSocialShare(platform)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-white ${platform.hoverClass} transition-colors`}
            >
              {platform.icon}
              <span>{platform.name}</span>
            </button>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
            <button
              onClick={copyUrl}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
              <span>复制链接</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

