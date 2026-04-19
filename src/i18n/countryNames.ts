import type { AppLocale } from "@/i18n/locales";

/** Mapping nom canonique (FR) → traduction par locale. */
const COUNTRY_EN: Record<string, string> = {
  "Maroc": "Morocco",
  "Arabie Saoudite": "Saudi Arabia",
  "Russie": "Russia",
  "Brésil": "Brazil",
  "Inde": "India",
  "Chine": "China",
  "Indonésie": "Indonesia",
  "Turquie": "Turkey",
  "USA": "USA",
  "Australie": "Australia",
  "Nigéria": "Nigeria",
  "Éthiopie": "Ethiopia",
  "Bangladesh": "Bangladesh",
  "Pakistan": "Pakistan",
  "Vietnam": "Vietnam",
  "Thaïlande": "Thailand",
  "Argentine": "Argentina",
  "Colombie": "Colombia",
  "Mexique": "Mexico",
  "Espagne": "Spain",
  "France": "France",
  "Pays-Bas": "Netherlands",
  "Allemagne": "Germany",
  "Côte d'Ivoire": "Ivory Coast",
  "Sénégal": "Senegal",
  "Kenya": "Kenya",
  "Afrique du Sud": "South Africa",
  "Égypte": "Egypt",
  "Iran": "Iran",
  "Émirats Arabes Unis": "United Arab Emirates",
  "Japon": "Japan",
  "Corée du Sud": "South Korea",
  "Philippines": "Philippines",
};

export function tCountry(name: string, locale: AppLocale): string {
  if (locale === "en") return COUNTRY_EN[name] ?? name;
  return name;
}
