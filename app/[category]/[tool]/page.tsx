"use client";

export const runtime = 'edge';

import { notFound } from "next/navigation";
import { getTool } from "@/lib/tools-data";
import { getToolComponent } from "@/lib/tool-components";
import { useI18n } from "@/lib/i18n";

interface Props {
  params: { category: string; tool: string };
}

export default function ToolPage({ params }: Props) {
  const { t } = useI18n();
  const tool = getTool(params.category, params.tool);
  if (!tool) notFound();

  const Component = getToolComponent(params.category, params.tool);
  if (!Component) notFound();

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t(tool.nameKey)}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t(tool.descriptionKey)}</p>
      </div>
      <Component />
    </div>
  );
}
