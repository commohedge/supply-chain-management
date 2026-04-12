/**
 * Échantillon de 50 navires issu de `bulk_vessels_50.xlsx` (colonnes :
 * Nom du Navire, Catégorie, DWT (tonnes), Capacité Grain (m³), Capacité Bale (m³)).
 */

export interface BulkVesselFleetRecord {
  name: string;
  category: string;
  dwt: number;
  grainCapacityM3: number;
  baleCapacityM3: number;
}

export const BULK_VESSELS_SOURCE = {
  file: "bulk_vessels_50.xlsx",
  rowCount: 50,
  description: "Import sec — Minibulker, Handysize, Supramax, Panamax",
} as const;

/** Données alignées sur le classeur Excel (50 lignes). */
export const BULK_VESSELS_FLEET_SAMPLE: BulkVesselFleetRecord[] = [
  { name: "MINI", category: "Minibulker", dwt: 8000, grainCapacityM3: 25000, baleCapacityM3: 22000 },
  { name: "Zhibek Zholy", category: "Minibulker", dwt: 5686, grainCapacityM3: 18000, baleCapacityM3: 16000 },
  { name: "Adriatica", category: "Handysize", dwt: 16128, grainCapacityM3: 42000, baleCapacityM3: 38000 },
  { name: "Algoma Equinox", category: "Handysize", dwt: 23895, grainCapacityM3: 45500, baleCapacityM3: 41000 },
  { name: "Algoma Mariner", category: "Handysize", dwt: 24535, grainCapacityM3: 46000, baleCapacityM3: 41500 },
  { name: "American Mariner", category: "Handysize", dwt: 15396, grainCapacityM3: 38000, baleCapacityM3: 34500 },
  { name: "Antenor", category: "Handysize", dwt: 16128, grainCapacityM3: 42000, baleCapacityM3: 38000 },
  { name: "Baie Comeau", category: "Handysize", dwt: 24430, grainCapacityM3: 46000, baleCapacityM3: 41500 },
  { name: "Baie St Paul", category: "Handysize", dwt: 24430, grainCapacityM3: 46000, baleCapacityM3: 41500 },
  { name: "CSL Tadoussac", category: "Handysize", dwt: 20634, grainCapacityM3: 43000, baleCapacityM3: 38500 },
  { name: "Federal Rideau", category: "Handysize", dwt: 20659, grainCapacityM3: 43000, baleCapacityM3: 38500 },
  { name: "Helen Bulker", category: "Handysize", dwt: 25000, grainCapacityM3: 45000, baleCapacityM3: 40000 },
  { name: "Kaye E. Barker", category: "Handysize", dwt: 11726, grainCapacityM3: 32000, baleCapacityM3: 29000 },
  { name: "Kociewie", category: "Handysize", dwt: 38000, grainCapacityM3: 58000, baleCapacityM3: 52000 },
  { name: "Kuzma Minin", category: "Handysize", dwt: 24000, grainCapacityM3: 46000, baleCapacityM3: 41000 },
  { name: "Marvel K", category: "Handysize", dwt: 30000, grainCapacityM3: 50000, baleCapacityM3: 45000 },
  { name: "Matros Pozynich", category: "Handysize", dwt: 17025, grainCapacityM3: 40000, baleCapacityM3: 36000 },
  { name: "Nunavik", category: "Handysize", dwt: 22622, grainCapacityM3: 44000, baleCapacityM3: 39500 },
  { name: "Sabrina I", category: "Handysize", dwt: 53000, grainCapacityM3: 67500, baleCapacityM3: 60000 },
  { name: "U-Sea Saskatchewan", category: "Handysize", dwt: 34795, grainCapacityM3: 55000, baleCapacityM3: 50000 },
  { name: "Umiak I", category: "Handysize", dwt: 22462, grainCapacityM3: 44000, baleCapacityM3: 39500 },
  { name: "Yasa Jupiter", category: "Handysize", dwt: 34508, grainCapacityM3: 55000, baleCapacityM3: 49500 },
  { name: "Karavados", category: "Supramax", dwt: 56000, grainCapacityM3: 69000, baleCapacityM3: 64000 },
  { name: "MV ELIAS", category: "Supramax", dwt: 57970, grainCapacityM3: 70000, baleCapacityM3: 65000 },
  { name: "MV FILIA", category: "Supramax", dwt: 56000, grainCapacityM3: 69000, baleCapacityM3: 64000 },
  { name: "MV MANNA", category: "Supramax", dwt: 55000, grainCapacityM3: 68000, baleCapacityM3: 63000 },
  { name: "MV POLES", category: "Supramax", dwt: 58000, grainCapacityM3: 71000, baleCapacityM3: 66000 },
  { name: "MV SOZON", category: "Supramax", dwt: 55500, grainCapacityM3: 68500, baleCapacityM3: 63500 },
  { name: "MV ST. ANDREW", category: "Supramax", dwt: 56500, grainCapacityM3: 69500, baleCapacityM3: 64500 },
  { name: "MV STAVROS", category: "Supramax", dwt: 54000, grainCapacityM3: 67000, baleCapacityM3: 62000 },
  { name: "MV SWEET LADY III", category: "Supramax", dwt: 57000, grainCapacityM3: 70000, baleCapacityM3: 65000 },
  { name: "MV YANNIS", category: "Supramax", dwt: 57500, grainCapacityM3: 70500, baleCapacityM3: 65500 },
  { name: "A Max", category: "Panamax", dwt: 72000, grainCapacityM3: 93000, baleCapacityM3: 83000 },
  { name: "ACS Diamond", category: "Panamax", dwt: 68000, grainCapacityM3: 90000, baleCapacityM3: 80000 },
  { name: "Achilles", category: "Panamax", dwt: 74000, grainCapacityM3: 94000, baleCapacityM3: 84000 },
  { name: "Adfines East", category: "Panamax", dwt: 76000, grainCapacityM3: 96000, baleCapacityM3: 86000 },
  { name: "Adfines North", category: "Panamax", dwt: 77000, grainCapacityM3: 97000, baleCapacityM3: 87000 },
  { name: "American Century", category: "Panamax", dwt: 35923, grainCapacityM3: 60000, baleCapacityM3: 54000 },
  { name: "American Integrity", category: "Panamax", dwt: 35652, grainCapacityM3: 59500, baleCapacityM3: 53500 },
  { name: "Apollo Sea", category: "Panamax", dwt: 69904, grainCapacityM3: 95000, baleCapacityM3: 85000 },
  { name: "Arthur M. Anderson", category: "Panamax", dwt: 26525, grainCapacityM3: 48000, baleCapacityM3: 43500 },
  { name: "Burns Harbor", category: "Panamax", dwt: 35652, grainCapacityM3: 59500, baleCapacityM3: 53500 },
  { name: "CSL Tecumseh", category: "Panamax", dwt: 43691, grainCapacityM3: 75000, baleCapacityM3: 68000 },
  { name: "HL Balikpapan", category: "Panamax", dwt: 114531, grainCapacityM3: 105000, baleCapacityM3: 95000 },
  { name: "HL Samarinada", category: "Panamax", dwt: 75000, grainCapacityM3: 95000, baleCapacityM3: 85000 },
  { name: "Horizon II", category: "Panamax", dwt: 70000, grainCapacityM3: 92000, baleCapacityM3: 82000 },
  { name: "Indiana Harbor", category: "Panamax", dwt: 35923, grainCapacityM3: 60000, baleCapacityM3: 54000 },
  { name: "James R. Barker", category: "Panamax", dwt: 34728, grainCapacityM3: 58000, baleCapacityM3: 52500 },
  { name: "Namura Queen", category: "Panamax", dwt: 47146, grainCapacityM3: 78000, baleCapacityM3: 70500 },
  { name: "U-Sea Colonsay", category: "Panamax", dwt: 34778, grainCapacityM3: 55500, baleCapacityM3: 50000 },
];

/** Même clé que Simulateur fret — flotte éditable « Mapping flotte source » */
export const BULK_FLEET_STORAGE_KEY = "freight-bulk-vessel-fleet-v1";

export type FleetRowWithId = BulkVesselFleetRecord & { id: string };

/** Flotte par défaut (identique à l’échantillon bulk_vessels_50) — pour reset simulateur. */
export function createDefaultFleetRowsWithIds(): FleetRowWithId[] {
  return BULK_VESSELS_FLEET_SAMPLE.map((r, i) => ({ ...r, id: `seed-${i}` }));
}

/**
 * Lignes telles qu’enregistrées par le simulateur fret (id + champs navire).
 * Hors navigateur : échantillon statique (build / tests).
 */
export function loadFleetRowsFromStorage(): FleetRowWithId[] {
  if (typeof localStorage === "undefined") {
    return createDefaultFleetRowsWithIds();
  }
  try {
    const raw = localStorage.getItem(BULK_FLEET_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FleetRowWithId[];
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0]?.id === "string") {
        return parsed.map((row, i) => ({
          id: row.id || `seed-${i}`,
          name: String(row.name ?? ""),
          category: String(row.category ?? "Handysize"),
          dwt: Number.isFinite(Number(row.dwt)) ? Number(row.dwt) : 0,
          grainCapacityM3: Number.isFinite(Number(row.grainCapacityM3)) ? Number(row.grainCapacityM3) : 0,
          baleCapacityM3: Number.isFinite(Number(row.baleCapacityM3)) ? Number(row.baleCapacityM3) : 0,
        }));
      }
    }
  } catch {
    /* ignore */
  }
  return createDefaultFleetRowsWithIds();
}

/** Enregistre la flotte (appelé par le simulateur fret après édition). */
export function saveFleetRowsToStorage(rows: FleetRowWithId[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(BULK_FLEET_STORAGE_KEY, JSON.stringify(rows));
    window.dispatchEvent(new Event("bulk-fleet-storage-updated"));
  } catch {
    /* ignore */
  }
}

/** Records sans id — pour recherche nom / monitoring logistique. */
export function loadBulkFleetRecordsFromStorage(): BulkVesselFleetRecord[] {
  return loadFleetRowsFromStorage().map(({ id: _id, ...r }) => r);
}

/** Noms navires pour listes / datalist (source : mapping flotte éditable). */
export function getBulkVesselNamesForUi(): string[] {
  return loadBulkFleetRecordsFromStorage()
    .map((r) => r.name.trim())
    .filter(Boolean);
}

export function findFleetVesselByName(name: string): BulkVesselFleetRecord | undefined {
  const key = name.trim().toLowerCase();
  if (!key) return undefined;
  for (const v of loadBulkFleetRecordsFromStorage()) {
    if (v.name.trim().toLowerCase() === key) return v;
  }
  return undefined;
}

/** Identifiants stables de démo (croisement monitoring) — dérivés du nom si absent du fichier source. */
export function fleetIdentifiersForVesselName(name: string): { imo: string; mmsi: string } {
  let h = 2166136261;
  const s = name.trim();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = h >>> 0;
  const imo = 9_000_000 + (u % 900_000);
  const mmsi = 200_000_000 + (u % 800_000_000);
  return { imo: String(imo), mmsi: String(mmsi) };
}

/** Métadonnées affichées quand le nom correspond à la flotte 50 navires. */
export function fleetMonitoringMeta(name: string): {
  imo: string;
  mmsi: string;
  dwt: number;
  grainCapacityM3: number;
  baleCapacityM3: number;
  category: string;
} | null {
  const v = findFleetVesselByName(name);
  if (!v) return null;
  const { imo, mmsi } = fleetIdentifiersForVesselName(name);
  return {
    imo,
    mmsi,
    dwt: v.dwt,
    grainCapacityM3: v.grainCapacityM3,
    baleCapacityM3: v.baleCapacityM3,
    category: v.category,
  };
}

