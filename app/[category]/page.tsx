"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getToolsByCategory, getCategory } from "@/lib/tools-data";
import { useI18n } from "@/lib/i18n";

interface Props {
  params: { category: string };
}

export default function CategoryPage({ params }: Props) {
  const { category } = params;
  const { t } = useI18n();
  const cat = getCategory(category);
  if (!cat) notFound();

  const tools = getToolsByCategory(category);
  const Icon = cat.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t(cat.nameKey)}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t(cat.descriptionKey)}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={`/${tool.category}/${tool.slug}`}
                className="group flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                  <ToolIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {t(tool.nameKey)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t(tool.descriptionKey)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}