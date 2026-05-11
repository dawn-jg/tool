"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X, Command } from "lucide-react";
import { tools } from "@/lib/tools-data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SearchDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? tools.filter((tool) => {
        const q = query.toLowerCase();
        return (
          t(tool.nameKey).toLowerCase().includes(q) ||
          t(tool.descriptionKey).toLowerCase().includes(q) ||
          tool.keywords.toLowerCase().includes(q)
        );
      })
    : [];

  const openDialog = useCallback(() => {
    setOpen(true);
    setQuery("");
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? closeDialog() : openDialog();
      }
      if (e.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openDialog, closeDialog]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const categoryLabels: Record<string, string> = {
    "developer-tools": "开发者",
    "text-tools": "文本",
    "image-tools": "图片",
    "data-tools": "数据",
    "generators": "生成器",
    "validators": "验证器",
    "utilities": "实用",
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openDialog}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">搜索工具...</span>
        <kbd className="hidden sm:flex items-center gap-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={closeDialog}
        />
      )}

      {/* Dialog */}
      {open && (
        <div className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-xl">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索工具..."
                className="flex-1 h-14 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {query && results.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">未找到相关工具</p>
              )}
              {!query && (
                <p className="text-center text-gray-400 py-8 text-sm">
                  输入关键词搜索 {tools.length}+ 工具
                </p>
              )}
              {results.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/${tool.category}/${tool.slug}`}
                  onClick={closeDialog}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {t(tool.nameKey)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {t(tool.descriptionKey)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs px-2 py-0.5 rounded-full",
                      "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {categoryLabels[tool.category] || tool.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}