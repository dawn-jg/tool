import Link from "next/link";

const popularTools = [
  { name: "JSON 格式化", href: "/developer-tools/json-formatter" },
  { name: "Base64 编解码", href: "/developer-tools/base64" },
  { name: "正则表达式测试", href: "/developer-tools/regex-tester" },
  { name: "二维码生成器", href: "/image-tools/qrcode-generator" },
  { name: "图片压缩", href: "/image-tools/image-compressor" },
  { name: "网速测试", href: "/network-tools/speed-test" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
      <div className="text-center max-w-lg mx-auto px-4">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">页面未找到</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          你访问的页面不存在或已被移动，试试下面的热门工具：
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {popularTools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
