import type { LogisticsStatusRow } from "@/types/logistics";
import { LOGISTICS_CSV_HEADERS } from "@/types/logistics";
import { objectsToCSV } from "@/lib/csv";
import { fleetMonitoringMeta, loadBulkFleetRecordsFromStorage } from "@/data/bulkVesselsFleet";
import { coordsNearDestination } from "@/lib/logisticsDestinationCoords";
import { addDaysToTodayIso, normalizeEtaPair } from "@/lib/etaDate";
import type { CommodityMode } from "@/data/commodityPresets";

interface ModeSeedRecipe {
  destinations: string[];
  /** Port of Discharge (POD) candidates */
  pods: string[];
  products: string[];
  /** Volume samples (kt cargo) */
  volumes: number[];
  etas: number[];
  costs: number[];
  statusCycle: string[];
}

const MODE_SEED: Record<CommodityMode, ModeSeedRecipe> = {
  phosphates: {
    destinations: ["Brazil", "India", "USA", "Mexico", "Pakistan", "Australia", "Europe"],
    pods: ["Santos", "Paradip", "Mumbai", "Tampa", "Antwerp", "Mombasa", "Lagos", "Casablanca"],
    products: ["DAP", "MAP", "TSP"],
    volumes: [35, 50, 45],
    etas: [30, 35, 26],
    costs: [30, 32, 13],
    statusCycle: [
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
    ],
  },
  copper: {
    destinations: ["China", "Germany", "Netherlands", "USA", "Japan", "South Korea", "Italy"],
    pods: ["Shanghai", "Yantai", "Rotterdam", "Hamburg", "New Orleans", "Yokohama", "Incheon"],
    products: ["Cathode", "Concentrate", "Wire Rod"],
    volumes: [10, 15, 8],
    etas: [32, 28, 22],
    costs: [120, 95, 110],
    statusCycle: [
      "Loading",
      "At Anchor",
      "Transit",
      "Discharging",
      "Delivered",
      "LME Warranted",
      "Bonded Storage",
    ],
  },
  lng: {
    destinations: ["Japan", "South Korea", "China", "India", "Netherlands", "Belgium", "Spain", "France", "UK", "Italy", "Turkey"],
    pods: ["Tokyo Bay", "Incheon", "Yangshan", "Dahej", "Rotterdam", "Zeebrugge"],
    products: ["LNG", "LPG"],
    volumes: [70, 85, 60], // cargo size in kt LNG (~155k m³ ~ 70kt)
    etas: [18, 24, 12],
    costs: [1.2, 1.4, 0.8], // freight per mmbtu equivalent
    statusCycle: [
      "Loading",
      "Laden Voyage",
      "At Anchor (Asia)",
      "Discharging",
      "Ballast Voyage",
      "Floating Storage",
      "Reload",
      "Diverted",
    ],
  },
  grains: {
    destinations: ["China", "Egypt", "Mexico", "Indonesia", "Japan", "South Korea", "EU-27", "Algeria", "Nigeria", "Turkey"],
    pods: ["Qingdao", "Alexandria", "Veracruz", "Hamburg", "Rotterdam", "Yokohama", "Incheon"],
    products: ["Soybean", "Corn", "Wheat HRW", "Soymeal"],
    volumes: [60, 55, 65, 35],
    etas: [32, 18, 8, 22],
    costs: [42, 32, 22, 28],
    statusCycle: [
      "Loading",
      "Anchorage",
      "Sailing",
      "At Discharge Port",
      "Discharging",
      "Free Pratique",
      "Cleared",
      "Demurrage",
      "Floating Storage",
    ],
  },
};

export function buildLogisticsRowsForMode(mode: CommodityMode): LogisticsStatusRow[] {
  const recipe = MODE_SEED[mode] ?? MODE_SEED.phosphates;
  const fleet = loadBulkFleetRecordsFromStorage();
  const n = Math.max(1, fleet.length);
  const total = 30;
  return Array.from({ length: total }, (_, i) => {
    const vessel = fleet[i % n];
    const meta = fleetMonitoringMeta(vessel.name);
    const etaDays = recipe.etas[i % recipe.etas.length];
    const destination = recipe.destinations[i % recipe.destinations.length];
    const { lat, lng } = coordsNearDestination(destination, i);
    return {
      id: `log-seed-${mode}-${i}`,
      volumeKt: recipe.volumes[i % recipe.volumes.length],
      vesselStatus: recipe.statusCycle[i % recipe.statusCycle.length],
      vesselId: `V${i + 1}`,
      vesselName: vessel.name,
      destination,
      destinationPort: recipe.pods[i % recipe.pods.length],
      clientName: "",
      product: recipe.products[i % recipe.products.length],
      etaDays,
      etaDate: addDaysToTodayIso(etaDays),
      costUsdPerT: recipe.costs[i % recipe.costs.length],
      imo: meta?.imo ?? "",
      mmsi: meta?.mmsi ?? "",
      lat,
      lng,
    };
  });
}

/** Backwards-compatible default seed (phosphates). */
export function buildDefaultLogisticsRows(): LogisticsStatusRow[] {
  return buildLogisticsRowsForMode("phosphates");
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
