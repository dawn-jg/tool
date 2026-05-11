"use client";

import { useI18n } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLang = e.target.value as "zh" | "en";
    console.log("Language changed to:", newLang);
    setLang(newLang);
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-gray-500" />
      <select
        value={lang}
        onChange={handleChange}
        className="bg-transparent text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
