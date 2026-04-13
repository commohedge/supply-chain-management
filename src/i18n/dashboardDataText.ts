import type { AppLocale } from "@/i18n/locales";

/**
 * Many KPIs/recap cards come from stored dashboard data (config.*) and are not i18n-keyed.
 * This helper provides a safe, best-effort display translation for the known dataset.
 */

const FR_TO_EN: Record<string, string> = {
  // Overview KPIs
  "Production Totale": "Total production",
  "Chiffre d'Affaires": "Revenue",
  "Réserves Mondiales": "Global reserves",
  "Part de Marché Global": "Global market share",
  "Pays Desservis": "Countries served",
  "Investissement Vert": "Green investment",
  "Phosphate & Engrais": "Phosphate & fertilizers",
  "Part de marché roche": "Rock market share",
  "Produits phosphatés": "Phosphate products",
  "Programme NH₃ vert": "Green NH₃ program",
  "En cours": "In progress",
  "Stable": "Stable",
  "+3 nouveaux marchés": "+3 new markets",

  // Supply KPIs
  "Volume Disponible": "Available volume",
  "Taux de Chargement": "Loading rate",
  "Slots de Chargement": "Loading slots",
  "Volume Engagé": "Committed volume",
  "Couverture Pipeline": "Pipeline coverage",
  "Utilisation Stockage": "Storage utilization",
  "30 prochains jours": "Next 30 days",
  "Ports Jorf + Safi": "Jorf + Safi ports",
  "2.7 Mt capacité": "2.7 Mt capacity",
  "de ventes": "of sales",
  "Sites OCP (Jorf+Safi+Youssoufia)": "OCP sites (Jorf+Safi+Youssoufia)",
  "vs mois dernier": "vs last month",
  "jours": "days",
  "Jours": "Days",

  // Pipeline KPIs
  "Volume Confirmé": "Confirmed volume",
  "Non Assigné": "Unassigned",
  "Open Destination": "Open destination",
  "Valeur Pipeline": "Pipeline value",
  "aux prix spot": "at spot prices",
  "du total": "of total",

  // Market KPIs
  "Demande Globale (2026)": "Global demand (2026)",
  "Inventaire Global": "Global inventory",
  "Netback Moyen (Blended)": "Avg. netback (blended)",
  "Volatilité Prix (30J)": "Price volatility (30D)",
  "72 jours de supply": "72 days of supply",
  "Annualisée": "Annualized",

  // Optionality KPIs
  "Moyenne pondérée": "Weighted average",
};

const EN_TO_FR: Record<string, string> = Object.fromEntries(Object.entries(FR_TO_EN).map(([fr, en]) => [en, fr]));

function replaceAll(out: string, from: string, to: string): string {
  if (!from || !out.includes(from)) return out;
  return out.split(from).join(to);
}

function phraseSwap(out: string, locale: AppLocale): string {
  // light phrase-level swaps for KPI change strings
  if (locale === "en") {
    out = replaceAll(out, "vs mois dernier", "vs last month");
    out = replaceAll(out, "prochains jours", "days");
    out = replaceAll(out, "jours", "days");
  } else {
    out = replaceAll(out, "vs last month", "vs mois dernier");
    out = replaceAll(out, "days", "jours");
  }
  return out;
}

export function displayDashboardDataText(raw: string, locale: AppLocale): string {
  const s = String(raw ?? "");
  if (!s) return s;

  if (locale === "en") {
    const direct = FR_TO_EN[s];
    if (direct) return direct;
    // Replace comma-separated segments or short phrases inside a longer string
    let out = s;
    for (const [fr, en] of Object.entries(FR_TO_EN)) {
      if (fr.length < 3) continue;
      out = replaceAll(out, fr, en);
    }
    return phraseSwap(out, "en");
  }

  const direct = EN_TO_FR[s];
  if (direct) return direct;
  let out = s;
  for (const [en, fr] of Object.entries(EN_TO_FR)) {
    if (en.length < 3) continue;
    out = replaceAll(out, en, fr);
  }
  return phraseSwap(out, "fr");
}

