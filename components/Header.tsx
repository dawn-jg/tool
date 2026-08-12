"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Wrench, Code, FileText, ImageIcon, Database, Zap, CheckCircle, Calculator, Globe, Sparkles, FileStack } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { SearchDialog } from "./SearchDialog";
import { cn } from "@/lib/utils";

const categories = [
  { nameKey: "cat.developer", href: "/developer-tools", icon: Code },
  { nameKey: "cat.text", href: "/text-tools", icon: FileText },
  { nameKey: "cat.image", href: "/image-tools", icon: ImageIcon },
  { nameKey: "cat.data", href: "/data-tools", icon: Database },
  { nameKey: "cat.generators", href: "/generators", icon: Zap },
  { nameKey: "cat.validators", href: "/validators", icon: CheckCircle },
  { nameKey: "cat.utilities", href: "/utilities", icon: Calculator },
  { nameKey: "cat.pdf", href: "/pdf-tools", icon: FileStack },
  { nameKey: "cat.network", href: "/network-tools", icon: Globe },
  { nameKey: "cat.fun", href: "/fun-tools", icon: Sparkles },
];

export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    document.documentElement.classList.toggle('dark', next);
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-bl-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">tooltip.cc</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  pathname === cat.href
                    ? "text-blue-600"
                    : "text-gray-600 dark:text-gray-300"
                )}
              >
                {t(cat.nameKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <SearchDialog />
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <nav className="px-4 py-3 space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === cat.href
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(cat.nameKey)}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
