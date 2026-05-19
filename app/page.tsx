"use client";

import Link from "next/link";
import { Code, FileText, ImageIcon, Database, Zap, CheckCircle, Calculator, ArrowRight, Globe, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const categories = [
  {
    nameKey: "cat.developer",
    nameDescKey: "cat.developerDesc",
    href: "/developer-tools",
    icon: Code,
    count: 10,
    color: "bg-blue-500",
  },
  {
    nameKey: "cat.text",
    nameDescKey: "cat.textDesc",
    href: "/text-tools",
    icon: FileText,
    count: 7,
    color: "bg-green-500",
  },
  {
    nameKey: "cat.image",
    nameDescKey: "cat.imageDesc",
    href: "/image-tools",
    icon: ImageIcon,
    count: 6,
    color: "bg-purple-500",
  },
  {
    nameKey: "cat.data",
    nameDescKey: "cat.dataDesc",
    href: "/data-tools",
    icon: Database,
    count: 3,
    color: "bg-orange-500",
  },
  {
    nameKey: "cat.generators",
    nameDescKey: "cat.generatorsDesc",
    href: "/generators",
    icon: Zap,
    count: 5,
    color: "bg-yellow-500",
  },
  {
    nameKey: "cat.validators",
    nameDescKey: "cat.validatorsDesc",
    href: "/validators",
    icon: CheckCircle,
    count: 7,
    color: "bg-teal-500",
  },
  {
    nameKey: "cat.utilities",
    nameDescKey: "cat.utilitiesDesc",
    href: "/utilities",
    icon: Calculator,
    count: 13,
    color: "bg-pink-500",
  },
  {
    nameKey: "cat.network",
    nameDescKey: "cat.networkDesc",
    href: "/network-tools",
    icon: Globe,
    count: 5,
    color: "bg-indigo-500",
  },
  {
    nameKey: "cat.fun",
    nameDescKey: "cat.funDesc",
    href: "/fun-tools",
    icon: Sparkles,
    count: 2,
    color: "bg-rose-500",
  },
];

const featuredTools = [
  { nameKey: "tool.jsonFormatter", descKey: "tool.jsonFormatterDesc", href: "/developer-tools/json-formatter" },
  { nameKey: "tool.base64", descKey: "tool.base64Desc", href: "/developer-tools/base64" },
  { nameKey: "tool.regexTester", descKey: "tool.regexTesterDesc", href: "/developer-tools/regex-tester" },
  { nameKey: "tool.qrcodeGenerator", descKey: "tool.qrcodeGeneratorDesc", href: "/image-tools/qrcode-generator" },
  { nameKey: "tool.randomPassword", descKey: "tool.randomPasswordDesc", href: "/data-tools/random-password" },
];

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("site.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("site.subtitle")}
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t("home.featured")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 mb-1">
                  {t(tool.nameKey)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t(tool.descKey)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t("home.categories")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${cat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                          {t(cat.nameKey)}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {cat.count}{t("home.toolsCount")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {t(cat.nameDescKey)}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-blue-600 group-hover:gap-2 transition-all">
                        <span>{t("home.viewAll")}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t("home.footer")}</p>
          <p className="mt-1">{t("home.footerBrand")}</p>
        </div>
      </div>
    </div>
  );
}