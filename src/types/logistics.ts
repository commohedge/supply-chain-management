/** Statut navire / expédition — suivi type OCP Logistics & Shipment */

export interface LogisticsStatusRow {
  id: string;
  volumeKt: number;
  vesselStatus: string;
  /** Identifiant ligne (ex. V1, V2) — distinct du nom de navire commercial */
  vesselId: string;
  /** Nom du navire — flotte bulk_vessels_50 (Simulateur fret) */
  vesselName: string;
  destination: string;
  /** Port de déchargement / POD (plus fin que le pays) */
  destinationPort: string;
  /** Client destinataire si connu */
  clientName: string;
  product: string;
  etaDays: number;
  /** Date d’arrivée estimée (ISO yyyy-mm-dd), synchronisée avec etaDays */
  etaDate: string;
  costUsdPerT: number;
  imo: string;
  mmsi: string;
  /** Latitude WGS84 (°) — suivi / carte, souvent proche du pays de destination */
  lat: number;
  /** Longitude WGS84 (°) */
  lng: number;
}

export const LOGISTICS_CSV_HEADERS = [
  "volume_kt",
  "vessel_status",
  "vessel_id",
  "vessel_name",
  "imo",
  "mmsi",
  "destination",
  "destination_port",
  "client_name",
  "lat",
  "lng",
  "product",
  "eta_days",
  "eta_date",
  "cost_usd_per_t",
] as const;

/** Hub maritime (stock flottant) — coordonnées WGS84 pour la carte BI */
export interface FloatingHub {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const DEFAULT_FLOATING_HUBS: FloatingHub[] = [
  { id: "fh-atl-n", name: "Floating Atlantic North", lat: 43.5, lng: -38 },
  { id: "fh-atl-s", name: "Floating Atlantic South", lat: -5.5, lng: -19 },
  { id: "fh-ind", name: "Floating Indian Ocean", lat: -11, lng: 93 },
];

/** Listes de référence unifiées (éditables dans Paramètres → Mappings logistique). */
export interface LogisticsMappings {
  destinationCountries: string[];
  productCodes: string[];
  vesselStatuses: string[];
  floatingHubs: FloatingHub[];
}
