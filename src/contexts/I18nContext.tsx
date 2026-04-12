import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type AppLocale } from "@/i18n/locales";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";

const bundles: Record<AppLocale, Record<string, string>> = { en, fr };

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

function messageFor(locale: AppLocale, key: string): string {
  return bundles[locale][key] ?? bundles.en[key] ?? key;
}

type I18nValue = {
  locale: AppLocale;
  setLocale: (l: AppLocale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    try {
      const s = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (s === "en" || s === "fr") return s;
    } catch {
      /* ignore */
    }
    return DEFAULT_LOCALE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale === "fr" ? "fr" : "en";
  }, [locale]);

  const setLocale = useCallback((l: AppLocale) => setLocaleState(l), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => interpolate(messageFor(locale, key), vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
