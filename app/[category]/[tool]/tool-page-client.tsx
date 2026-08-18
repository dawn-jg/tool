"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool, getToolsByCategory } from "@/lib/tools-data";
import { getToolComponent } from "@/lib/tool-components";
import { useI18n } from "@/lib/i18n";
import { toolContent } from "@/lib/tool-content";

interface Props {
  category: string;
  tool: string;
}

export default function ToolPageClient({ category, tool }: Props) {
  const { t } = useI18n();
  const toolData = getTool(category, tool);
  if (!toolData) notFound();

  const Component = getToolComponent(category, tool);
  if (!Component) notFound();

  const toolName = t(toolData.nameKey);
  const toolDesc = t(toolData.descriptionKey);
  const content = toolContent[tool];

  // 相关工具（同分类，排除当前）
  const related = getToolsByCategory(category)
    .filter((x) => x.slug !== tool)
    .slice(0, 6);

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {toolName}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{toolDesc}</p>
        {content?.summary && (
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{content.summary}</p>
        )}
      </div>
      <Component />

      {/* 使用说明（真实步骤） */}
      {content?.steps && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("common.howToUse")}
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            {content.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* FAQ（工具特有真实问题） */}
      {content?.faq && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("common.faqTitle")}
          </h2>
          <div className="space-y-6">
            {content.faq.map((item, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {item.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 相关工具内链 */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("common.relatedTools")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.category}/${r.slug}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {t(r.nameKey)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {t(r.descriptionKey)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
