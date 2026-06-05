import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Tooltip.cc - 免费在线工具箱",
    template: "%s - Tooltip.cc",
  },
  description: "免费在线工具箱，提供JSON格式化、Base64编解码、正则测试、二维码生成等79+实用工具。所有工具在浏览器本地运行，数据不上传服务器，无需注册，打开即用。",
  keywords: "在线工具,json格式化,base64,正则测试,二维码生成,md5,uuid,工具箱",
  authors: [{ name: "Tooltip.cc" }],
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    title: "Tooltip.cc - 免费在线工具箱",
    description: "79+免费在线工具，JSON格式化、Base64编解码、正则测试、二维码生成、图片压缩等实用功能，所有工具浏览器本地运行，隐私安全。",
    url: "https://tooltip.cc",
    siteName: "Tooltip.cc",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tooltip.cc - 免费在线工具箱",
    description: "79+免费在线工具，无需注册，浏览器本地运行，保护隐私。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  localStorage.setItem('theme', theme);
                  var lang = document.cookie.match(/lang=([^;]+)/);
                  if (lang) {
                    document.documentElement.lang = lang[1];
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <script charSet="UTF-8" id="LA_COLLECT" src="//sdk.51.la/js-sdk-pro.min.js"></script>
        <script dangerouslySetInnerHTML={{ __html: "LA.init({id:'LBnlcELKHTZlDEIf',ck:'LBnlcELKHTZlDEIf'})" }}></script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7487473818971469" crossOrigin="anonymous"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Tooltip.cc",
              url: "https://tooltip.cc",
              description: "免费在线工具箱，提供JSON格式化、Base64编解码、正则测试、二维码生成等79+实用工具，浏览器本地运行，隐私安全。",
              inLanguage: "zh-CN",
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <I18nProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
