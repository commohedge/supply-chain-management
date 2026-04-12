/**
 * Segments de classes de bulk carriers (dry) — gabarits DWT / LOA / tirant d’eau.
 * Référence infographie (usage pédagogique / contraintes ports) + segment Minibulker
 * pour alignement avec le fichier `bulk_vessels_50.xlsx`.
 */

export interface VesselDimensionRange {
  min?: number;
  max?: number;
  /** Valeur unique quand l’infographie donne une approximation (~) */
  approx?: number;
}

export interface BulkCarrierClassSegment {
  id: string;
  label: string;
  dwtMin: number;
  dwtMax: number;
  lengthM: VesselDimensionRange;
  draftM: VesselDimensionRange;
  /** Source ou précision */
  sourceNote?: string;
}

/** Classes « types » (infographie) — plages DWT peuvent se chevaucher (ex. Suezmax / Capesize). */
export const BULK_CARRIER_CLASS_SEGMENTS: BulkCarrierClassSegment[] = [
  {
    id: "minibulker",
    label: "Minibulker",
    dwtMin: 5_000,
    dwtMax: 14_999,
    lengthM: { max: 150 },
    draftM: { max: 8 },
    sourceNote: "Segment court pour navires < Handysize (ex. fichier xlsx MINI, Zhibek Zholy).",
  },
  {
    id: "handysize",
    label: "Handysize",
    dwtMin: 15_000,
    dwtMax: 35_000,
    lengthM: { min: 150, max: 180 },
    draftM: { min: 8, max: 10 },
  },
  {
    id: "supramax",
    label: "Supramax",
    dwtMin: 35_000,
    dwtMax: 59_999,
    lengthM: { min: 180, max: 200 },
    draftM: { min: 10, max: 12 },
  },
  {
    id: "panamax",
    label: "Panamax",
    dwtMin: 60_000,
    dwtMax: 80_000,
    lengthM: { approx: 225 },
    draftM: { approx: 12 },
  },
  {
    id: "kamsarmax",
    label: "Kamsarmax",
    dwtMin: 80_000,
    dwtMax: 87_000,
    lengthM: { approx: 229 },
    draftM: { approx: 14 },
  },
  {
    id: "suezmax",
    label: "Suezmax",
    dwtMin: 120_000,
    dwtMax: 200_000,
    lengthM: { approx: 280 },
    draftM: { approx: 16 },
  },
  {
    id: "capesize",
    label: "Capesize",
    dwtMin: 150_000,
    dwtMax: 200_000,
    lengthM: { approx: 290 },
    draftM: { approx: 18 },
  },
  {
    id: "newcastlemax",
    label: "Newcastlemax",
    dwtMin: 180_500,
    dwtMax: 210_000,
    lengthM: { approx: 300 },
    draftM: { min: 18, max: 18.4 },
  },
  {
    id: "valemax",
    label: "Valemax / Chinamax",
    dwtMin: 380_000,
    dwtMax: 400_000,
    lengthM: { approx: 360 },
    draftM: { approx: 23 },
  },
];

/** Retourne toutes les classes dont la plage DWT contient `dwt` (chevauchements possibles). */
export function classifyDwt(dwt: number): BulkCarrierClassSegment[] {
  if (!Number.isFinite(dwt) || dwt <= 0) return [];
  return BULK_CARRIER_CLASS_SEGMENTS.filter((s) => dwt >= s.dwtMin && dwt <= s.dwtMax);
}

/**
 * Classe « principale » pour affichage : la première sans chevauchement ambigu,
 * sinon la plus petite plage DWT parmi les correspondances.
 */
export function primaryClassForDwt(dwt: number): BulkCarrierClassSegment | null {
  const matches = classifyDwt(dwt);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  const sorted = [...matches].sort((a, b) => a.dwtMax - a.dwtMin - (b.dwtMax - b.dwtMin));
  return sorted[0] ?? matches[0];
}
