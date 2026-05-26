"use client";

import { useEffect } from "react";

interface AdUnitProps {
  slot?: string;
  format?: string;
  className?: string;
}

/**
 * AdSense 广告位组件
 *
 * ⚠️ 使用前需要在 Google AdSense 后台创建广告单元
 * 创建后替换 data-ad-slot 的值为真实 slot ID
 *
 * 或者在 AdSense 后台启用「自动广告(Auto Ads)」
 * 启用后无需手动放置 ad unit，脚本会自动在合适位置插入广告
 */
export function AdUnit({ slot = "REPLACE_WITH_YOUR_AD_SLOT", format = "auto", className = "" }: AdUnitProps) {
  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }, 200);
      return () => clearTimeout(timer);
    } catch {}
  }, []);

  return (
    <div className={`my-6 mx-auto w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7487473818971469"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}