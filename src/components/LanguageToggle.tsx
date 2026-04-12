import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";
import type { AppLocale } from "@/i18n/locales";
import { SUPPORTED_LOCALES } from "@/i18n/locales";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn("inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5", className)}
      role="group"
      aria-label={t("lang.label")}
    >
      {SUPPORTED_LOCALES.map((l: AppLocale) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
            locale === l
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l === "en" ? t("lang.en") : t("lang.fr")}
        </button>
      ))}
    </div>
  );
}
