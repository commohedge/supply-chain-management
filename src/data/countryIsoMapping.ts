/**
 * Country labels as stored in referentiel (English canonical; French kept for legacy rows) → ISO 3166-1 alpha-2
 * for Natural Earth GeoJSON (ISO_A2 / WB_A2).
 */
const LABEL_TO_ISO_A2: Record<string, string> = {
  Inde: "IN",
  India: "IN",
  Brésil: "BR",
  Brazil: "BR",
  Nigeria: "NG",
  "Nigéria": "NG",
  Éthiopie: "ET",
  Ethiopie: "ET",
  Ethiopia: "ET",
  France: "FR",
  "États-Unis": "US",
  "United States": "US",
  USA: "US",
  Qatar: "QA",
  "Émirats Arabes Unis": "AE",
  "United Arab Emirates": "AE",
  "Arabie Saoudite": "SA",
  "Saudi Arabia": "SA",
  Russie: "RU",
  Russia: "RU",
  "Trinité-et-Tobago": "TT",
  Canada: "CA",
  Espagne: "ES",
  Spain: "ES",
  Suisse: "CH",
  Mexique: "MX",
  Mexico: "MX",
  Pakistan: "PK",
  Australie: "AU",
  Maroc: "MA",
  Morocco: "MA",
  Kenya: "KE",
  Turquie: "TR",
  Turkey: "TR",
  Bangladesh: "BD",
  Belgique: "BE",
  Allemagne: "DE",
  "Royaume-Uni": "GB",
  Italie: "IT",
  PaysBas: "NL",
  "Pays-Bas": "NL",
  Pologne: "PL",
  Ukraine: "UA",
  Égypte: "EG",
  Chine: "CN",
  Japon: "JP",
  Corée: "KR",
  Argentine: "AR",
  Chili: "CL",
  Pérou: "PE",
  Colombie: "CO",
  Vietnam: "VN",
  Indonésie: "ID",
  Malaisie: "MY",
  Thaïlande: "TH",
  Philippines: "PH",
};

export function countryLabelToIsoA2Codes(label: string): string[] {
  const raw = label.trim();
  if (!raw || raw === "Europe") return [];
  if (raw.includes("/")) {
    return raw.split("/").flatMap((p) => countryLabelToIsoA2Codes(p.trim()));
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
