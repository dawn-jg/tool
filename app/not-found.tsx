import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">页面未找到</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">你访问的页面不存在或已被移除</p>
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