import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} tooltip.cc - 免费在线工具箱
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              首页
            </Link>
            <Link href="/developer-tools" className="hover:text-blue-600 transition-colors">
              开发者工具
            </Link>
            <Link href="/text-tools" className="hover:text-blue-600 transition-colors">
              文本处理
            </Link>
            <Link href="/image-tools" className="hover:text-blue-600 transition-colors">
              图片工具
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          所有工具均在浏览器本地执行，数据不上传服务器，保护隐私安全
        </div>
      </div>
    </footer>
  );
}
