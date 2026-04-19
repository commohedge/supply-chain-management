import type { CsvDataset } from "@/components/data/CsvImportBlock";
import type { LogisticsStatusRow } from "@/types/logistics";
import { buildDefaultLogisticsRows, buildLogisticsRowsForMode } from "@/data/logisticsSeed";
import { fleetMonitoringMeta } from "@/data/bulkVesselsFleet";
import { coordsNearDestination } from "@/lib/logisticsDestinationCoords";
import { normalizeEtaPair } from "@/lib/etaDate";
import type { CommodityMode } from "@/data/commodityPresets";

/** Event dispatché quand on change de commodity preset → les pages rechargent les rows. */
export const HUB_LOGISTICS_RESEED_EVENT = "hub-logistics-reseeded";

export const HUB_STORAGE_KEY = "hub-commodity-data-v1";

/** Incrémenter pour recalculer Lat/Long maritime sur les lignes existantes au chargement. */
const LOGISTICS_GEO_VERSION = 5;

export interface HubCommodityState {
  imports: CsvDataset;
  exports: CsvDataset;
  stockInbound: CsvDataset;
  stockExport: CsvDataset;
  logisticsRows: LogisticsStatusRow[];
  /** Version du générateur de coordonnées maritimes (migration automatique). */
  logisticsGeoVersion?: number;
}

const emptyDs = (): CsvDataset => ({ headers: [], rows: [] });

function normalizeLogisticsRow(r: Partial<LogisticsStatusRow>, i: number): LogisticsStatusRow {
  const etaDaysIn =
    typeof r.etaDays === "number" && !Number.isNaN(r.etaDays) ? Math.round(r.etaDays) : 30;
  const etaDateRaw = String(r.etaDate ?? "").trim();
  const { etaDays, etaDate } = normalizeEtaPair(etaDaysIn, etaDateRaw || undefined);
  let vesselId = String(r.vesselId ?? "").trim();
  let vesselName = String(r.vesselName ?? "").trim();
  if (!vesselId && /^V\d+$/i.test(vesselName)) {
    vesselId = vesselName;
    vesselName = "";
  }
  if (!vesselId) vesselId = `V${i + 1}`;
  const destination = String(r.destination ?? "");
  const meta = fleetMonitoringMeta(vesselName.trim());
  const imo = String(r.imo ?? "").trim() || meta?.imo || "";
  const mmsi = String(r.mmsi ?? "").trim() || meta?.mmsi || "";
  const hasLat = typeof r.lat === "number" && Number.isFinite(r.lat);
  const hasLng = typeof r.lng === "number" && Number.isFinite(r.lng);
  const fallbackCoords = coordsNearDestination(destination, i);
  const lat = hasLat ? r.lat! : fallbackCoords.lat;
  const lng = hasLng ? r.lng! : fallbackCoords.lng;
  return {
    id: r.id || `log-${i}`,
    volumeKt: typeof r.volumeKt === "number" && !Number.isNaN(r.volumeKt) ? r.volumeKt : 0,
    vesselStatus: r.vesselStatus || "Loading",
    vesselId,
    vesselName,
    destination,
    destinationPort: String(r.destinationPort ?? ""),
    clientName: String(r.clientName ?? ""),
    product: String(r.product ?? "DAP"),
    etaDays,
    etaDate,
    costUsdPerT:
      typeof r.costUsdPerT === "number" && !Number.isNaN(r.costUsdPerT) ? r.costUsdPerT : 0,
    imo,
    mmsi,
    lat,
    lng,
  };
}

export const defaultHubCommodity: HubCommodityState = {
  imports: emptyDs(),
  exports: emptyDs(),
  stockInbound: emptyDs(),
  stockExport: emptyDs(),
  logisticsRows: buildDefaultLogisticsRows(),
  logisticsGeoVersion: LOGISTICS_GEO_VERSION,
};

function mergeDs(d: Partial<CsvDataset> | undefined): CsvDataset {
  return {
    headers: Array.isArray(d?.headers) ? d.headers : [],
    rows: Array.isArray(d?.rows) ? d.rows : [],
  };
}

export function loadHubCommodity(): HubCommodityState {
  try {
    const raw = localStorage.getItem(HUB_STORAGE_KEY);
    if (!raw) return { ...defaultHubCommodity };
    const p = JSON.parse(raw) as Partial<HubCommodityState>;
    let logisticsRows = Array.isArray(p.logisticsRows)
      ? p.logisticsRows.map((r: Partial<LogisticsStatusRow>, i: number) => normalizeLogisticsRow(r, i))
      : buildDefaultLogisticsRows();
    let logisticsGeoVersion = typeof p.logisticsGeoVersion === "number" ? p.logisticsGeoVersion : 0;

    if (logisticsGeoVersion < LOGISTICS_GEO_VERSION) {
      logisticsRows = logisticsRows.map((r, i) => {
        const c = coordsNearDestination(r.destination, i);
        return { ...r, lat: c.lat, lng: c.lng };
      });
      logisticsGeoVersion = LOGISTICS_GEO_VERSION;
    }

    return {
      imports: mergeDs(p.imports),
      exports: mergeDs(p.exports),
      stockInbound: mergeDs(p.stockInbound),
      stockExport: mergeDs(p.stockExport),
      logisticsRows,
      logisticsGeoVersion,
    };
  } catch {
    return { ...defaultHubCommodity };
  }
}

export function saveHubCommodity(state: HubCommodityState) {
  try {
    localStorage.setItem(HUB_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/** Met à jour uniquement les lignes logistique sans écraser le reste du hub. */
export function saveLogisticsRowsOnly(rows: LogisticsStatusRow[]) {
  const full = loadHubCommodity();
  full.logisticsRows = rows;
  full.logisticsGeoVersion = LOGISTICS_GEO_VERSION;
  saveHubCommodity(full);
}
