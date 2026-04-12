import type { LogisticsStatusRow } from "@/types/logistics";
import { LOGISTICS_CSV_HEADERS } from "@/types/logistics";
import { objectsToCSV } from "@/lib/csv";
import { fleetMonitoringMeta, loadBulkFleetRecordsFromStorage } from "@/data/bulkVesselsFleet";
import { coordsNearDestination } from "@/lib/logisticsDestinationCoords";
import { addDaysToTodayIso, normalizeEtaPair } from "@/lib/etaDate";

const DEST = ["Brazil", "India", "USA", "Mexico", "Pakistan", "Australia", "Europe"];
const POD = ["Santos", "Paradip", "Mumbai", "Tampa", "Antwerp", "Mombasa", "Lagos", "Casablanca"];
const PRODUCTS = ["DAP", "MAP", "TSP"];
const VOLS = [35, 50, 45];
const ETAS = [30, 35, 26];
const COSTS = [30, 32, 13];
const STATUS_CYCLE = [
  "To Morocco",
  "Loading Open",
  "Loading",
  "Loading Sold",
  "Transit Open",
  "Transit Sold",
  "Transit Subsidiary",
  "Floating Storage",
  "Regional Hub",
  "Transit",
  "Line Up",
];

export function buildDefaultLogisticsRows(): LogisticsStatusRow[] {
  const fleet = loadBulkFleetRecordsFromStorage();
  const n = Math.max(1, fleet.length);
  return Array.from({ length: 30 }, (_, i) => {
    const vessel = fleet[i % n];
    const meta = fleetMonitoringMeta(vessel.name);
    const etaDays = ETAS[i % 3];
    const destination = DEST[i % DEST.length];
    const { lat, lng } = coordsNearDestination(destination, i);
    return {
      id: `log-seed-${i}`,
      volumeKt: VOLS[i % 3],
      vesselStatus: STATUS_CYCLE[i % STATUS_CYCLE.length],
      vesselId: `V${i + 1}`,
      vesselName: vessel.name,
      destination,
      destinationPort: POD[i % POD.length],
      clientName: "",
      product: PRODUCTS[i % 3],
      etaDays,
      etaDate: addDaysToTodayIso(etaDays),
      costUsdPerT: COSTS[i % 3],
      imo: meta?.imo ?? "",
      mmsi: meta?.mmsi ?? "",
      lat,
      lng,
    };
  });
}

export function rowsToCsvRecords(rows: LogisticsStatusRow[]): Record<string, string>[] {
  return rows.map((r) => ({
    volume_kt: String(r.volumeKt),
    vessel_status: r.vesselStatus,
    vessel_id: r.vesselId,
    vessel_name: r.vesselName,
    imo: r.imo,
    mmsi: r.mmsi,
    destination: r.destination,
    destination_port: r.destinationPort,
    client_name: r.clientName,
    lat: String(r.lat),
    lng: String(r.lng),
    product: r.product,
    eta_days: String(r.etaDays),
    eta_date: r.etaDate,
    cost_usd_per_t: String(r.costUsdPerT),
  }));
}

export function csvRecordsToRows(records: Record<string, string>[]): LogisticsStatusRow[] {
  return records.map((rec, idx) => {
    let vesselId = String(rec.vessel_id ?? rec["vessel_id"] ?? "").trim();
    let vesselName = String(rec.vessel_name ?? "").trim();
    if (!vesselId && /^V\d+$/i.test(vesselName)) {
      vesselId = vesselName;
      vesselName = "";
    }
    if (!vesselId) vesselId = `V${idx + 1}`;
    const meta = fleetMonitoringMeta(vesselName);
    const etaDaysParsed = parseFloat(String(rec.eta_days ?? "").replace(/,/g, "")) || 0;
    const etaDateRaw = String(rec.eta_date ?? "").trim();
    const { etaDays, etaDate } = normalizeEtaPair(etaDaysParsed, etaDateRaw || undefined);
    const imo = String(rec.imo ?? "").trim() || meta?.imo || "";
    const mmsi = String(rec.mmsi ?? "").trim() || meta?.mmsi || "";
    const destination = String(rec.destination ?? "").trim();
    const latRaw = parseFloat(String(rec.lat ?? rec["lat"] ?? "").replace(/,/g, ""));
    const lngRaw = parseFloat(String(rec.lng ?? rec["lng"] ?? "").replace(/,/g, ""));
    const fallback = coordsNearDestination(destination, idx);
    const lat = Number.isFinite(latRaw) ? latRaw : fallback.lat;
    const lng = Number.isFinite(lngRaw) ? lngRaw : fallback.lng;
    return {
      id: crypto.randomUUID(),
      volumeKt: parseFloat(String(rec.volume_kt ?? rec["volume_kt"] ?? "0").replace(/,/g, "")) || 0,
      vesselStatus: String(rec.vessel_status ?? "").trim(),
      vesselId,
      vesselName,
      destination,
      destinationPort: String(rec.destination_port ?? rec["destination_port"] ?? "").trim(),
      clientName: String(rec.client_name ?? rec["client_name"] ?? "").trim(),
      lat,
      lng,
      product: String(rec.product ?? "").trim(),
      etaDays,
      etaDate,
      costUsdPerT: parseFloat(String(rec.cost_usd_per_t ?? "").replace(/,/g, "")) || 0,
      imo,
      mmsi,
    };
  });
}

export function logisticsRowsToCsvString(rows: LogisticsStatusRow[]): string {
  const headers = [...LOGISTICS_CSV_HEADERS];
  const data = rowsToCsvRecords(rows);
  return objectsToCSV(headers, data);
}

export const TEMPLATE_LOGISTICS_CSV = (() => {
  const sample = buildDefaultLogisticsRows().slice(0, 3);
  return logisticsRowsToCsvString(sample);
})();
