"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { translations, categoryTranslations } from "@/lib/i18n";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, unknown>) => string;
  cat: (categoryId: string) => { name: string; description: string };
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh',
  setLocale: () => {},
  t: (key: string) => key,
  cat: (id: string) => ({ name: id, description: '' }),
});

export function useI18n() {
  return useContext(I18nContext);
}

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export default function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || 'zh');

  // Detect locale from cookie on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'zh') {
      setLocaleState(saved as Locale);
    } else if (initialLocale) {
      // Use server-detected locale as fallback
      localStorage.setItem('locale', initialLocale);
    }
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string, params?: Record<string, unknown>) => {
    const str = (translations[locale] as Record<string, string | ((...args: unknown[]) => string)>)[key];
    if (typeof str === 'function') {
      return (str as (...args: unknown[]) => string)(params?.value);
    }
    return str || key;
  };

  const cat = (categoryId: string) => {
    const catData = categoryTranslations[locale][categoryId as keyof typeof categoryTranslations[Locale]];
    return catData || { name: categoryId, description: '' };
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, cat }}>
      {children}
    </I18nContext.Provider>
  );
}
