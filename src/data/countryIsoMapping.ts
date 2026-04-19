/**
 * Country labels as stored in referentiel (English canonical; French kept for legacy rows) → ISO 3166-1 alpha-2
 * for Natural Earth GeoJSON (ISO_A2 / WB_A2).
 *
 * Couvre tous les pays utilisés dans les commodity presets (phosphates, copper, LNG, grains).
 */
const LABEL_TO_ISO_A2: Record<string, string> = {
  // Asie du Sud
  Inde: "IN",
  India: "IN",
  Pakistan: "PK",
  Bangladesh: "BD",
  // Amériques
  Brésil: "BR",
  Brazil: "BR",
  USA: "US",
  "United States": "US",
  "États-Unis": "US",
  Canada: "CA",
  Mexique: "MX",
  Mexico: "MX",
  Argentine: "AR",
  Argentina: "AR",
  Chili: "CL",
  Chile: "CL",
  Pérou: "PE",
  Peru: "PE",
  Colombie: "CO",
  Colombia: "CO",
  Venezuela: "VE",
  "Trinité-et-Tobago": "TT",
  "Trinidad and Tobago": "TT",
  // Afrique
  Nigeria: "NG",
  "Nigéria": "NG",
  Éthiopie: "ET",
  Ethiopie: "ET",
  Ethiopia: "ET",
  Maroc: "MA",
  Morocco: "MA",
  Kenya: "KE",
  Égypte: "EG",
  Egypt: "EG",
  Egypte: "EG",
  Algérie: "DZ",
  Algeria: "DZ",
  Tunisie: "TN",
  Tunisia: "TN",
  Senegal: "SN",
  "Sénégal": "SN",
  Afrique: "ZA",
  // Moyen-Orient
  Qatar: "QA",
  "Émirats Arabes Unis": "AE",
  "United Arab Emirates": "AE",
  UAE: "AE",
  "Arabie Saoudite": "SA",
  "Saudi Arabia": "SA",
  // Asie de l'Est
  Chine: "CN",
  China: "CN",
  Japon: "JP",
  Japan: "JP",
  Corée: "KR",
  "Corée du Sud": "KR",
  "South Korea": "KR",
  Korea: "KR",
  Taiwan: "TW",
  // Asie du Sud-Est
  Vietnam: "VN",
  Indonésie: "ID",
  Indonesia: "ID",
  Malaisie: "MY",
  Malaysia: "MY",
  Thaïlande: "TH",
  Thailand: "TH",
  Philippines: "PH",
  Singapour: "SG",
  Singapore: "SG",
  // Europe (UE & autres)
  France: "FR",
  Espagne: "ES",
  Spain: "ES",
  Allemagne: "DE",
  Germany: "DE",
  Belgique: "BE",
  Belgium: "BE",
  PaysBas: "NL",
  "Pays-Bas": "NL",
  Netherlands: "NL",
  Italie: "IT",
  Italy: "IT",
  "Royaume-Uni": "GB",
  UK: "GB",
  "United Kingdom": "GB",
  Pologne: "PL",
  Poland: "PL",
  Roumanie: "RO",
  Romania: "RO",
  Suisse: "CH",
  Switzerland: "CH",
  Russie: "RU",
  Russia: "RU",
  Ukraine: "UA",
  // Océanie
  Australie: "AU",
  Australia: "AU",
  "Nouvelle-Zélande": "NZ",
  // Multi-pays — codes spéciaux gérés par splitter ci-dessous
};

/** Codes ISO-A2 des principaux pays UE — utilisé pour la résolution de "EU-27" / "Europe". */
const EU27_ISO_A2 = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
];

export function countryLabelToIsoA2Codes(label: string): string[] {
  const raw = label.trim();
  if (!raw) return [];
  // Bloc UE — étend sur tous les pays UE-27
  if (raw === "EU-27" || raw === "EU" || raw === "UE" || raw === "UE-27" || raw === "Europe") {
    return [...EU27_ISO_A2];
  }
  if (raw.includes("/")) {
    return raw.split("/").flatMap((p) => countryLabelToIsoA2Codes(p.trim()));
  }
  // Gestion "Switzerland / Russia"-style déjà couverte ci-dessus, mais aussi ", "
  if (raw.includes(",")) {
    return raw.split(",").flatMap((p) => countryLabelToIsoA2Codes(p.trim()));
  }
  const iso = LABEL_TO_ISO_A2[raw];
  if (iso) return [iso];
  return [];
}

/** Natural Earth : certains pays ont ISO_A2 = -99 ; WB_A2 est alors fiable (ex. France → FR). */
export function featureIsoA2FromNaturalEarth(feature: { properties?: unknown }): string | null {
  const p = feature.properties;
  if (!p || typeof p !== "object") return null;
  const rec = p as Record<string, unknown>;
  let a2 = String(rec.ISO_A2 ?? "");
  if (a2 === "-99" || !a2) {
    a2 = String(rec.WB_A2 ?? "");
  }
  if (a2 && a2 !== "-99") return a2;
  return null;
}

export function isoCodesFromCountryLabels(labels: Iterable<string>): Set<string> {
  const s = new Set<string>();
  for (const label of labels) {
    for (const code of countryLabelToIsoA2Codes(label)) {
      s.add(code);
    }
  }
  return s;
}
