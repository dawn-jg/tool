"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { translations } from "./translations";

type Language = "zh" | "en";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("zh");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang") as Language;
      if (stored === "zh" || stored === "en") setLangState(stored);
    } catch (e) {}
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("lang", newLang);
    } catch (e) {}
    document.cookie = `lang=${newLang};path=/;max-age=31536000`;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[lang][key as keyof (typeof translations)["zh"]] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
