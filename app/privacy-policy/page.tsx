import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "Tooltip.cc 隐私政策 — 我们如何使用和保护你的数据",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          隐私政策
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p><strong>最后更新日期：2026年5月26日</strong></p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              概述
            </h2>
            <p>
              本隐私政策说明了 Tooltip.cc（以下简称&ldquo;本站&rdquo;）如何收集、使用和保护你的信息。
              我们重视你的隐私，并在设计之初就将其作为核心原则。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              我们收集什么信息
            </h2>

            <h3 className="text-lg font-medium mt-4">我们<strong>不</strong>收集的信息</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>你在工具中输入的任何文本、文件、图片、URL 等内容</li>
              <li>个人身份信息（姓名、地址、电话等）</li>
              <li>账号密码（本站无需注册）</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">自动收集的匿名信息</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>访问统计</strong>：通过 51.la 统计收集匿名页面访问量、来源渠道、浏览器类型等统计数据，不包含个人身份信息</li>
              <li><strong>广告标识</strong>：Google AdSense 可能使用 Cookie 来投放相关广告，详见 Google 的<a href="https://policies.google.com/technologies/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">广告政策</a></li>
              <li><strong>本地存储</strong>：部分工具使用浏览器 localStorage 保存偏好设置（如主题、语言、计数等），这些数据仅存在于你的设备上</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              数据如何被使用
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>工具功能</strong>：你在工具中输入的所有内容仅在浏览器本地处理，<strong>不会上传至服务器</strong></li>
              <li><strong>访问统计</strong>：用于了解网站使用情况，改进内容和服务</li>
              <li><strong>广告投放</strong>：Google AdSense 使用 Cookie 投放你可能感兴趣的广告</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Cookie 政策
            </h2>
            <p>
              本站使用以下类型的 Cookie：
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>功能性 Cookie</strong>：localStorage 存储你的主题和语言偏好</li>
              <li><strong>第三方 Cookie</strong>：Google AdSense 和 51.la 可能设置 Cookie 用于广告投放和统计分析</li>
            </ul>
            <p>
              你可以在浏览器设置中管理或禁用 Cookie。Google 广告个性化设置请访问
              <a href="https://adssettings.google.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer"> Google 广告设置</a>。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              第三方服务
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Google AdSense</strong> — 提供广告服务，详见
                <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer"> Google 隐私政策</a></li>
              <li><strong>51.la</strong> — 提供网站统计分析</li>
              <li><strong>Cloudflare</strong> — 提供网站托管和 CDN 加速，详见
                <a href="https://www.cloudflare.com/privacypolicy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer"> Cloudflare 隐私政策</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              你的权利
            </h2>
            <p>
              由于本站不收集个人身份信息，因此不存在个人数据的访问、更正或删除等操作。
              你可以通过浏览器设置清除所有本地存储数据（localStorage）。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              联系我们
            </h2>
            <p>
              如对本隐私政策有任何疑问，请联系：tooltip.cc@outlook.com
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
