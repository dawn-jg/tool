"use client";

import { ReactNode } from "react";
import { CopyButton } from "./CopyButton";
import { ShareButton } from "./ShareButton";
import { useI18n } from "@/lib/i18n";

interface ToolLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  instructions: string;
  output?: string;
}

export function ToolLayout({
  children,
  title,
  description,
  instructions,
  output,
}: ToolLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t(title)}</h1>
        <ShareButton />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        {children}
      </div>

      {output && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t("common.output")}
            </span>
            <div className="flex items-center gap-2">
              <CopyButton text={output} />
            </div>
          </div>
          <pre className="whitespace-pre-wrap break-all text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
            {output}
          </pre>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          {t("common.usage")}
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">{t(instructions)}</p>
      </div>
    </div>
  );
}