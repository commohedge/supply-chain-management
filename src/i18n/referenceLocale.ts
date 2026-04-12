/**
 * Canonical reference strings are stored in English. French UI uses these maps for display/edit.
 */

import type { PortData, ReferentielData } from "@/contexts/DashboardDataContext";
import type { LogisticsMappings } from "@/types/logistics";

export type AppLocale = "en" | "fr";

/** Geographic zones — English is canonical (Settings / referentiel). */
export const REFERENCE_ZONES_EN = [
  "Middle East",
  "South Asia",
  "Southeast Asia",
  "East Asia",
  "North America",
  "Latin America",
  "Europe",
  "Europe / CIS",
  "North Africa",
  "West Africa",
  "East Africa",
  "Southern Africa",
  "Oceania",
] as const;

const ZONE_EN_TO_FR: Record<string, string> = {
  "Middle East": "Moyen-Orient",
  "South Asia": "Asie du Sud",
  "Southeast Asia": "Asie du Sud-Est",
  "East Asia": "Asie de l'Est",
  "North America": "Amérique du Nord",
  "Latin America": "Amérique Latine",
  Europe: "Europe",
  "Europe / CIS": "Europe / CEI",
  "North Africa": "Afrique du Nord",
  "West Africa": "Afrique de l'Ouest",
  "East Africa": "Afrique de l'Est",
  "Southern Africa": "Afrique Australe",
  Oceania: "Océanie",
};

const ZONE_FR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(ZONE_EN_TO_FR).map(([en, fr]) => [fr, en]),
);

export const PORT_STATUSES_EN = ["Operational", "Maintenance", "Limited"] as const;

const PORT_STATUS_EN_TO_FR: Record<string, string> = {
  Operational: "Opérationnel",
  Maintenance: "Maintenance",
  Limited: "Limité",
};

const PORT_STATUS_FR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(PORT_STATUS_EN_TO_FR).map(([en, fr]) => [fr, en]),
);

export const EXPORT_CATEGORIES_EN = [
  "Phosphate fertilizer",
  "Compound fertilizer",
  "Intermediate product",
  "Raw material",
] as const;

const EXPORT_CAT_EN_TO_FR: Record<string, string> = {
  "Phosphate fertilizer": "Engrais phosphaté",
  "Compound fertilizer": "Engrais composé",
  "Intermediate product": "Produit intermédiaire",
  "Raw material": "Matière première",
};

const EXPORT_CAT_FR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(EXPORT_CAT_EN_TO_FR).map(([en, fr]) => [fr, en]),
);

export const IMPORT_CATEGORIES_EN = [
  "Critical input",
  "Secondary input",
  "Energy",
  "Other",
] as const;

const IMPORT_CAT_EN_TO_FR: Record<string, string> = {
  "Critical input": "Intrant critique",
  "Secondary input": "Intrant secondaire",
  Energy: "Énergie",
  Other: "Autre",
};

const IMPORT_CAT_FR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(IMPORT_CAT_EN_TO_FR).map(([en, fr]) => [fr, en]),
);

/** Supplier/client contract types — English canonical */
export const CONTRACT_TYPES_SUPPLIER_EN = [
  "Long-term",
  "Annual contract",
  "Spot",
  "Spot + Contract",
] as const;

export const CONTRACT_TYPES_CLIENT_EN = [
  "Long-term",
  "Annual contract",
  "Government contract",
  "Spot",
  "Spot + Contract",
] as const;

const CONTRACT_EN_TO_FR: Record<string, string> = {
  "Long-term": "Long-terme",
  "Annual contract": "Contrat annuel",
  "Government contract": "Contrat gouvernemental",
  Spot: "Spot",
  "Spot + Contract": "Spot + Contrat",
};

const CONTRACT_FR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(CONTRACT_EN_TO_FR).map(([en, fr]) => [fr, en]),
);

/** Country & region names (exact match in cells / lists) */
const COUNTRY_EN_TO_FR: Record<string, string> = {
  India: "Inde",
  Brazil: "Brésil",
  Africa: "Afrique",
  Europe: "Europe",
  Argentina: "Argentine",
  Morocco: "Maroc",
  Peru: "Pérou",
  Canada: "Canada",
  Spain: "Espagne",
  France: "France",
  Ethiopia: "Éthiopie",
  Nigeria: "Nigeria",
  Qatar: "Qatar",
  "United Arab Emirates": "Émirats Arabes Unis",
  "Saudi Arabia": "Arabie Saoudite",
  Russia: "Russie",
  "United States": "États-Unis",
  "Trinidad and Tobago": "Trinité-et-Tobago",
  "Switzerland / Russia": "Suisse / Russie",
  Mexico: "Mexique",
  Pakistan: "Pakistan",
  Australia: "Australie",
  Kenya: "Kenya",
  Turkey: "Turquie",
  Bangladesh: "Bangladesh",
  USA: "USA",
  Various: "Divers",
};

const COUNTRY_FR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_EN_TO_FR).map(([en, fr]) => [fr, en]),
);

/** Phrase-level (substring) replacements FR → EN for migration & mixed fields */
const PHRASE_FR_TO_EN_ORDERED: [string, string][] = [
  ["Acide Phosphorique", "Phosphoric Acid"],
  ["Roche Phosphatée", "Phosphate rock"],
  ["Roche", "Rock"],
  ["sols spécifiques", "specific soils"],
  ["Égypte", "Egypt"],
  ["Producteurs européens", "European producers"],
  ["attaque roche phosphatée", "attack on phosphate rock"],
  ["engrais azotés-phosphorés", "nitrogen-phosphate fertilizers"],
  ["Engrais ternaires", "Ternary fertilizers"],
  ["Procédés industriels", "Industrial processes"],
  ["marché international", "international market"],
  ["Soufre", "Sulfur"],
  ["Ammoniac", "Ammonia"],
  ["Potasse", "Potash"],
  ["Europe / CEI", "Europe / CIS"],
];

const PHRASE_EN_TO_FR_ORDERED: [string, string][] = PHRASE_FR_TO_EN_ORDERED.map(([fr, en]) => [en, fr]);

function replacePhrases(s: string, pairs: [string, string][]): string {
  let out = s;
  for (const [from, to] of pairs) {
    if (from && out.includes(from)) {
      out = out.split(from).join(to);
    }
  }
  return out;
}

function translateTokensFrToEn(s: string): string {
  let out = replacePhrases(s, PHRASE_FR_TO_EN_ORDERED);
  return out
    .split(",")
    .map((seg) => {
      const t = seg.trim();
      if (!t) return seg;
      const mapped = COUNTRY_FR_TO_EN[t] ?? t;
      return seg.replace(t, mapped);
    })
    .join(",");
}

function translateTokensEnToFr(s: string): string {
  let out = s;
  const keysByLen = Object.keys(COUNTRY_EN_TO_FR).sort((a, b) => b.length - a.length);
  for (const en of keysByLen) {
    const fr = COUNTRY_EN_TO_FR[en];
    const re = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    out = out.replace(re, fr);
  }
  return replacePhrases(out, PHRASE_EN_TO_FR_ORDERED);
}

export type ReferenceStringRole =
  | "portStatus"
  | "exportCategory"
  | "importCategory"
  | "zone"
  | "country"
  | "contractType"
  | "freeText";

/**
 * Display stored reference strings. Canonical storage is English; legacy French values
 * are still translated when locale is `en` (e.g. destination "Brésil" → "Brazil").
 */
export function displayReferenceValue(value: string, role: ReferenceStringRole, locale: AppLocale): string {
  if (!value) return value;

  if (locale === "en") {
    switch (role) {
      case "portStatus":
        return PORT_STATUS_FR_TO_EN[value] ?? value;
      case "exportCategory":
        return EXPORT_CAT_FR_TO_EN[value] ?? value;
      case "importCategory":
        return IMPORT_CAT_FR_TO_EN[value] ?? value;
      case "zone":
        return ZONE_FR_TO_EN[value] ?? value;
      case "country":
        return COUNTRY_FR_TO_EN[value] ?? translateTokensFrToEn(value);
      case "contractType":
        return CONTRACT_FR_TO_EN[value] ?? value;
      case "freeText":
        return translateTokensFrToEn(value);
      default:
        return value;
    }
  }

  switch (role) {
    case "portStatus":
      return PORT_STATUS_EN_TO_FR[value] ?? value;
    case "exportCategory":
      return EXPORT_CAT_EN_TO_FR[value] ?? value;
    case "importCategory":
      return IMPORT_CAT_EN_TO_FR[value] ?? value;
    case "zone":
      return ZONE_EN_TO_FR[value] ?? value;
    case "country":
      return COUNTRY_EN_TO_FR[value] ?? translateTokensEnToFr(value);
    case "contractType":
      return CONTRACT_EN_TO_FR[value] ?? value;
    case "freeText":
      return translateTokensEnToFr(value);
    default:
      return value;
  }
}

export function parseReferenceValue(value: string, role: ReferenceStringRole, locale: AppLocale): string {
  if (!value) return value;

  if (locale === "en") return value;

  switch (role) {
    case "portStatus":
      return PORT_STATUS_FR_TO_EN[value] ?? value;
    case "exportCategory":
      return EXPORT_CAT_FR_TO_EN[value] ?? value;
    case "importCategory":
      return IMPORT_CAT_FR_TO_EN[value] ?? value;
    case "zone":
      return ZONE_FR_TO_EN[value] ?? value;
    case "country":
      return COUNTRY_FR_TO_EN[value] ?? translateTokensFrToEn(value);
    case "contractType":
      return CONTRACT_FR_TO_EN[value] ?? value;
    case "freeText":
      return translateTokensFrToEn(value);
    default:
      return value;
  }
}

/** Logistics list items: countries or product labels */
export function displayLogisticsListItem(value: string, kind: "destination" | "product", locale: AppLocale): string {
  if (!value) return value;
  if (kind === "destination") return displayReferenceValue(value, "country", locale);
  return displayReferenceValue(value, "freeText", locale);
}

export function parseLogisticsListItem(value: string, kind: "destination" | "product", locale: AppLocale): string {
  if (locale === "en" || !value) return value;
  if (kind === "destination") return parseReferenceValue(value, "country", locale);
  return parseReferenceValue(value, "freeText", locale);
}

function migrateStringFrToEn(s: string): string {
  if (!s || typeof s !== "string") return s;
  let out = translateTokensFrToEn(s);
  out = replacePhrases(out, PHRASE_FR_TO_EN_ORDERED);
  for (const [fr, en] of Object.entries(ZONE_FR_TO_EN)) {
    if (out === fr) return en;
  }
  for (const [fr, en] of Object.entries(PORT_STATUS_FR_TO_EN)) {
    if (out === fr) return en;
  }
  for (const [fr, en] of Object.entries(EXPORT_CAT_FR_TO_EN)) {
    if (out === fr) return en;
  }
  for (const [fr, en] of Object.entries(IMPORT_CAT_FR_TO_EN)) {
    if (out === fr) return en;
  }
  for (const [fr, en] of Object.entries(CONTRACT_FR_TO_EN)) {
    if (out === fr) return en;
  }
  for (const [fr, en] of Object.entries(COUNTRY_FR_TO_EN)) {
    if (out === fr) return en;
  }
  return out;
}

/** One-time migration: French reference data → English (localStorage). */
export function migrateReferentielAndMappingsToEnglish(
  referentiel: ReferentielData,
  logistics: LogisticsMappings,
): { referentiel: ReferentielData; logisticsMappings: LogisticsMappings } {
  const ports = referentiel.ports.map((p) => ({
    ...p,
    location: migrateStringFrToEn(p.location),
    products: migrateStringFrToEn(p.products),
    status: (PORT_STATUS_FR_TO_EN[p.status] ?? p.status) as PortData["status"],
  }));

  const exportProducts = referentiel.exportProducts.map((r) => ({
    ...r,
    name: migrateStringFrToEn(r.name),
    category: EXPORT_CAT_FR_TO_EN[r.category] ?? migrateStringFrToEn(r.category),
    mainMarkets: migrateStringFrToEn(r.mainMarkets),
    unit: r.unit,
  }));

  const importMaterials = referentiel.importMaterials.map((r) => ({
    ...r,
    name: migrateStringFrToEn(r.name),
    category: IMPORT_CAT_FR_TO_EN[r.category] ?? migrateStringFrToEn(r.category),
    mainSuppliers: migrateStringFrToEn(r.mainSuppliers),
    usage: migrateStringFrToEn(r.usage),
  }));

  const suppliers = referentiel.suppliers.map((r) => ({
    ...r,
    country: COUNTRY_FR_TO_EN[r.country] ?? migrateStringFrToEn(r.country),
    zone: ZONE_FR_TO_EN[r.zone] ?? migrateStringFrToEn(r.zone),
    contractType: CONTRACT_FR_TO_EN[r.contractType] ?? migrateStringFrToEn(r.contractType),
    products: migrateStringFrToEn(r.products),
  }));

  const clients = referentiel.clients.map((r) => ({
    ...r,
    country: COUNTRY_FR_TO_EN[r.country] ?? migrateStringFrToEn(r.country),
    zone: ZONE_FR_TO_EN[r.zone] ?? migrateStringFrToEn(r.zone),
    contractType: CONTRACT_FR_TO_EN[r.contractType] ?? migrateStringFrToEn(r.contractType),
    products: migrateStringFrToEn(r.products),
  }));

  const destinationCountries = logistics.destinationCountries.map((c) => COUNTRY_FR_TO_EN[c] ?? migrateStringFrToEn(c));
  const productCodes = logistics.productCodes.map((c) => migrateStringFrToEn(c));

  return {
    referentiel: {
      ports,
      exportProducts,
      importMaterials,
      suppliers,
      clients,
    },
    logisticsMappings: {
      ...logistics,
      destinationCountries,
      productCodes,
    },
  };
}
