import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于我们",
  description: "Tooltip.cc 是一个免费在线工具箱，提供79+实用工具，所有工具在浏览器本地运行，保护隐私安全。",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          关于 Tooltip.cc
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              我们是什么
            </h2>
            <p>
              Tooltip.cc 是一个<strong>免费在线工具箱</strong>，目前已收录 79+ 个实用工具，
              涵盖开发者工具、文本处理、图片工具、数据工具、生成器、验证器、网络工具等多个类别。
            </p>
            <p>
              所有工具均<strong>在浏览器本地运行</strong>，你的数据不会上传到任何服务器。
              无需注册、无需付费、打开即用。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              核心原则
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>隐私优先</strong> — 所有工具在浏览器本地执行，不上传数据</li>
              <li><strong>免费使用</strong> — 全部工具免费，无隐藏收费</li>
              <li><strong>无需注册</strong> — 无需账号，打开就能用</li>
              <li><strong>快速可靠</strong> — 纯前端实现，响应即时</li>
              <li><strong>持续更新</strong> — 不断添加新工具和优化现有功能</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              工具分类
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "开发者工具", desc: "JSON格式化、正则测试、Base64、时间戳等", count: 19 },
                { name: "文本处理", desc: "文本对比、Markdown编辑、字数统计等", count: 7 },
                { name: "图片工具", desc: "图片压缩、二维码生成、Favicon生成等", count: 9 },
                { name: "数据工具", desc: "密码生成、Cron表达式、进制转换等", count: 3 },
                { name: "生成器", desc: "占位图、渐变色、假数据等", count: 8 },
                { name: "验证器", desc: "邮箱、手机号、身份证等格式验证", count: 9 },
                { name: "实用工具", desc: "计算器、计时器、视频下载等", count: 16 },
                { name: "网络工具", desc: "IP查询、DNS查询、HTTP头查看等", count: 5 },
                { name: "趣味工具", desc: "MBTI人格测试等", count: 2 },
              ].map((cat) => (
                <div key={cat.name} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {cat.name}
                    <span className="ml-2 text-xs text-gray-400">{cat.count} 个</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cat.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              技术栈
            </h2>
            <p>
              本站基于 Next.js 构建，托管于 Cloudflare Pages。
              工具层采用纯前端 JavaScript/TypeScript 实现，
              Canvas API、Web Crypto API、File API 等浏览器原生能力支撑核心功能。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              联系我们
            </h2>
            <p>
              如果你有功能建议、发现 Bug、或想添加新工具，欢迎通过以下方式联系：
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>GitHub: <a href="https://github.com/dawn-jg/tool" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">dawn-jg/tool</a></li>
              <li>邮箱: admin@tooltip.cc</li>
            </ul>
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
