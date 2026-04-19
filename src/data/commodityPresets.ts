/**
 * Commodity Presets
 *
 * Each preset provides a FULL replacement of dashboard data so the same
 * Supply Chain Dashboard can serve any commodity vertical.
 *
 * Presets included:
 *   - phosphates  (DAP/MAP/TSP/NPK — OCP-style data)
 *   - copper      (LME copper — concentrates, cathodes, smelters)
 *   - lng         (Liquefied Natural Gas — terminals, tankers, JKM)
 *   - grains      (Wheat / Corn / Soybean — Black Sea, Brazil, USA)
 */

import type {
  OverviewData,
  SupplyData,
  PipelineData,
  MarketData,
  OptionalityData,
  FlowsData,
  ReferentielData,
} from "@/contexts/DashboardDataContext";
import type { LogisticsMappings } from "@/types/logistics";
import { DEFAULT_FLOATING_HUBS } from "@/types/logistics";

export type CommodityMode = "phosphates" | "copper" | "lng" | "grains";

export interface CommodityPreset {
  id: CommodityMode;
  label: string;
  shortLabel: string;
  description: string;
  defaultCompanyName: string;
  currency: string;
  unit: string;
  overview: OverviewData;
  supply: SupplyData;
  pipeline: PipelineData;
  market: MarketData;
  optionality: OptionalityData;
  flows: FlowsData;
  referentiel: ReferentielData;
  logisticsMappings: LogisticsMappings;
}

// ─────────────────────────────────────────────────────────────────
// PHOSPHATES (default — current OCP-style dataset)
// ─────────────────────────────────────────────────────────────────
const phosphates: CommodityPreset = {
  id: "phosphates",
  label: "Phosphates & Fertilizers",
  shortLabel: "Phosphates",
  description: "DAP, MAP, TSP, NPK, Phosphoric Acid — OCP-style fertilizer trading.",
  defaultCompanyName: "Commohedge Phosphates",
  currency: "USD",
  unit: "Mt",
  overview: {
    kpis: [
      { label: "Total Production", value: "12.8 Mt", change: "+6.2% vs 2025", changeDirection: "up", subtitle: "Phosphate & fertilizers" },
      { label: "Revenue", value: "$9.4 Bn", change: "+8.5% vs 2025", changeDirection: "up", subtitle: "2026 YTD" },
      { label: "World Reserves Share", value: "70%", change: "Stable", changeDirection: "neutral", subtitle: "Phosphate rock" },
      { label: "Global Market Share", value: "31%", change: "+1.2 pp vs 2024", changeDirection: "up", subtitle: "Phosphate products" },
      { label: "Countries Served", value: "50+", change: "+3 new markets", changeDirection: "up" },
      { label: "Green Investment", value: "$7 Bn", change: "Green NH₃ program", changeDirection: "neutral", subtitle: "In progress" },
    ],
    storage: [
      { country: "India", inStock: 2850, inTransit: 1200, planned: 1500 },
      { country: "Brazil", inStock: 2100, inTransit: 950, planned: 1100 },
      { country: "Africa", inStock: 1650, inTransit: 680, planned: 900 },
      { country: "Europe", inStock: 980, inTransit: 420, planned: 550 },
      { country: "North America", inStock: 750, inTransit: 380, planned: 480 },
      { country: "Other Asia", inStock: 620, inTransit: 310, planned: 400 },
    ],
    demand: [
      { country: "India", y2025: 4800, y2026ytd: 2600, y2026f: 5200 },
      { country: "Brazil", y2025: 3600, y2026ytd: 1900, y2026f: 3900 },
      { country: "Africa", y2025: 2800, y2026ytd: 1500, y2026f: 3200 },
      { country: "Europe", y2025: 1600, y2026ytd: 850, y2026f: 1700 },
      { country: "North America", y2025: 1200, y2026ytd: 650, y2026f: 1300 },
    ],
    forecast: [
      { country: "India", arrivals: 1200, shipments: 980, startingStock: 2850, endingStock: 3070 },
      { country: "Brazil", arrivals: 950, shipments: 870, startingStock: 2100, endingStock: 2180 },
      { country: "Africa", arrivals: 680, shipments: 520, startingStock: 1650, endingStock: 1810 },
      { country: "Europe", arrivals: 420, shipments: 390, startingStock: 980, endingStock: 1010 },
      { country: "North America", arrivals: 380, shipments: 350, startingStock: 750, endingStock: 780 },
    ],
    imports: [
      { material: "Sulfur", volume: "~8.3 Mt/y", suppliers: "QatarEnergy, ADNOC, Aramco, Gazprom", usage: "Sulfuric acid → phosphate rock" },
      { material: "Ammonia (NH₃)", volume: "~$2 Bn/y", suppliers: "Trinidad, CF Industries, EuroChem, Egypt", usage: "Nitrogen-phosphate fertilizers (DAP/MAP)" },
      { material: "Potash (KCl)", volume: "Variable", suppliers: "Nutrien (Canada), European producers", usage: "Ternary fertilizers (NPK)" },
    ],
    exports: [
      { product: "DAP (Diammonium Phosphate)", volume: "~4.2 Mt", mainMarkets: "India, Brazil, Africa", share: "38%" },
      { product: "MAP (Monoammonium Phosphate)", volume: "~2.8 Mt", mainMarkets: "Brazil, Argentina", share: "22%" },
      { product: "Phosphoric Acid", volume: "~3.1 Mt", mainMarkets: "India, Europe", share: "25%" },
      { product: "TSP (Triple Superphosphate)", volume: "~1.2 Mt", mainMarkets: "Europe, Africa", share: "9%" },
      { product: "NPK/NPS", volume: "~0.8 Mt", mainMarkets: "Africa", share: "6%" },
    ],
  },
  supply: {
    kpis: [
      { label: "Available Volume", value: "3.8 Mt", subtitle: "Next 30 days", change: "+12% vs last month", changeDirection: "up" },
      { label: "Loading Rate", value: "78%", subtitle: "Jorf + Safi ports", change: "+6 pp", changeDirection: "up" },
      { label: "Loading Slots", value: "18", subtitle: "2.7 Mt capacity", change: "+3 vs last month", changeDirection: "up" },
      { label: "Committed Volume", value: "4.6 Mt", subtitle: "Next 30 days", change: "+9%", changeDirection: "up" },
      { label: "Pipeline Coverage", value: "62 days", subtitle: "of sales", change: "+8 days", changeDirection: "up" },
      { label: "Storage Utilization", value: "74%", subtitle: "Sites (Jorf+Safi+Youssoufia)", change: "+5 pp", changeDirection: "up" },
    ],
    production: [
      { month: "Jan 2026", volume: 2100 },
      { month: "Feb 2026", volume: 2250 },
      { month: "Mar 2026", volume: 2400 },
      { month: "Apr 2026", volume: 2550 },
      { month: "May 2026", volume: 2700 },
      { month: "Jun 2026", volume: 2850 },
      { month: "Jul 2026", volume: 2650 },
      { month: "Aug 2026", volume: 2500 },
    ],
    volumeByStatus: [
      { name: "Available", value: 3800, pct: "30%", change: "▲ +12%" },
      { name: "Committed", value: 4600, pct: "36%", change: "▲ +9%" },
      { name: "Open Dest.", value: 2200, pct: "17%", change: "▲ +11%" },
      { name: "In Transit", value: 2200, pct: "17%", change: "▼ -2%" },
    ],
    ports: [
      { port: "Jorf Lasfar", utilization: "82%", next7: "5 / 7", next30: "16 / 22" },
      { port: "Safi", utilization: "71%", next7: "3 / 5", next30: "10 / 15" },
      { port: "Casablanca", utilization: "63%", next7: "2 / 3", next30: "5 / 8" },
      { port: "Laâyoune", utilization: "45%", next7: "1 / 2", next30: "3 / 6" },
    ],
    vessels: { inPort: 8, atSea: 14, charterOptions: 6 },
    constraints: [
      { constraint: "Port Congestion", details: "Jorf Lasfar: avg wait ~2.1 days (peak season)", severity: "high" },
      { constraint: "Storage Capacity", details: "Youssoufia at 89% — transfer to Safi recommended", severity: "high" },
      { constraint: "Vessel Availability", details: "Limited Supramax in next 10 days", severity: "medium" },
      { constraint: "Ammonia Price", details: "+8% over 30d — DAP margin impact ~-$12/t", severity: "high" },
      { constraint: "Sulfur Supply", details: "QatarEnergy contract: 5-day delivery delay", severity: "medium" },
      { constraint: "Maintenance", details: "DAP Line #3 Jorf — preventive 15-22 April", severity: "low" },
    ],
    rawMaterials: [
      { material: "Sulfur (CFR Morocco)", currentPrice: "$142/t", vs30d: "▲ +5.2%", trend: "Rising" },
      { material: "Ammonia (CFR Morocco)", currentPrice: "$385/t", vs30d: "▲ +8.1%", trend: "Strong rise" },
      { material: "Phosphate Rock (FOB)", currentPrice: "$110/t", vs30d: "▼ -1.3%", trend: "Stable" },
      { material: "Sulfuric Acid", currentPrice: "$95/t", vs30d: "▲ +3.7%", trend: "Moderate rise" },
    ],
  },
  pipeline: {
    kpis: [
      { label: "Confirmed Volume", value: "4.6 Mt", subtitle: "36% of total", change: "+9% vs last month", changeDirection: "up" },
      { label: "Unassigned", value: "3.8 Mt", subtitle: "30% of total", change: "+12%", changeDirection: "up" },
      { label: "Open Destination", value: "2.2 Mt", subtitle: "17% of total", change: "+11%", changeDirection: "up" },
      { label: "Pipeline Coverage", value: "62 days", subtitle: "of sales", change: "+8 days", changeDirection: "up" },
      { label: "Pipeline Value", value: "$3.42 Bn", subtitle: "at spot prices", change: "+7.3%", changeDirection: "up" },
    ],
    coverage: [
      { month: "Jan", days: 48 }, { month: "Feb", days: 50 }, { month: "Mar", days: 53 },
      { month: "Apr", days: 56 }, { month: "May", days: 58 }, { month: "Jun", days: 60 },
      { month: "Jul", days: 62 },
    ],
    maturity: [
      { period: "Apr 2026", confirmed: 1.6, unassigned: 1.1, openDest: 0.7 },
      { period: "May 2026", confirmed: 1.3, unassigned: 1.0, openDest: 0.6 },
      { period: "Jun 2026", confirmed: 1.0, unassigned: 0.9, openDest: 0.5 },
      { period: "Jul 2026", confirmed: 0.5, unassigned: 0.5, openDest: 0.3 },
      { period: "Aug 2026", confirmed: 0.2, unassigned: 0.3, openDest: 0.1 },
    ],
    destinations: [
      { name: "India", value: 2200, netback: 610 },
      { name: "Brazil", value: 1600, netback: 575 },
      { name: "Africa", value: 1100, netback: 590 },
      { name: "Europe", value: 650, netback: 600 },
      { name: "North America", value: 480, netback: 640 },
      { name: "Other Asia", value: 370, netback: 585 },
    ],
    statusRows: [
      { status: "Confirmed", volume: "4,600", pct: "36%", change: "▲ +9%", netback: "$610" },
      { status: "Unassigned", volume: "3,800", pct: "30%", change: "▲ +12%", netback: "—" },
      { status: "Open Destination", volume: "2,200", pct: "17%", change: "▲ +11%", netback: "—" },
      { status: "In Transit", volume: "2,200", pct: "17%", change: "▼ -2%", netback: "$595" },
    ],
    clientsByRegion: [
      { region: "India (Asia)", share: "35-40%", clients: "Coromandel, IFFCO, RCF", products: "DAP, Phosphoric Acid" },
      { region: "Brazil (Americas)", share: "25-30%", clients: "Yara Brasil, Mosaic Fertilizantes", products: "MAP, DAP" },
      { region: "Africa", share: "20-25%", clients: "Governments (Ethiopia, Nigeria, Kenya)", products: "NPK/NPS" },
      { region: "Europe", share: "10-15%", clients: "Specialized distributors, chem industry", products: "TSP, Phosphoric Acid" },
    ],
  },
  market: {
    kpis: [
      { label: "Global Demand (2026)", value: "15.3 Mt", subtitle: "DAP+MAP+TSP", change: "+4.8% vs 2025", changeDirection: "up" },
      { label: "Global Inventory", value: "24.2 Mt", subtitle: "72 days of supply", change: "+3.6% vs 30d", changeDirection: "up" },
      { label: "Avg. Netback (Blended)", value: "$598/t", subtitle: "FOB Jorf Lasfar", change: "+5.2%", changeDirection: "up" },
      { label: "Price Volatility (30D)", value: "14.8%", subtitle: "Annualized", change: "-2.1 pp", changeDirection: "down" },
    ],
    prices: [
      { period: "Oct 25", tampa: 590, india: 540, jorf: 505 },
      { period: "Nov 25", tampa: 605, india: 548, jorf: 510 },
      { period: "Dec 25", tampa: 615, india: 555, jorf: 518 },
      { period: "Jan 26", tampa: 625, india: 562, jorf: 525 },
      { period: "Feb 26", tampa: 638, india: 570, jorf: 532 },
      { period: "Mar 26", tampa: 648, india: 578, jorf: 540 },
      { period: "Apr 26", tampa: 650, india: 585, jorf: 548 },
    ],
    inventory: [
      { period: "Jan 26", global: 70, india: 55, brazil: 38, na: 22 },
      { period: "Apr 26", global: 72, india: 58, brazil: 40, na: 23 },
      { period: "Jul 26", global: 68, india: 52, brazil: 36, na: 21 },
      { period: "Oct 26", global: 74, india: 60, brazil: 42, na: 24 },
      { period: "Jan 27", global: 66, india: 50, brazil: 35, na: 20 },
    ],
    demandByRegion: [
      { name: "India", value: 5200 }, { name: "Brazil", value: 3900 },
      { name: "Africa", value: 3200 }, { name: "Europe", value: 1700 },
      { name: "North America", value: 1300 },
    ],
    competitors: [
      { name: "OCP Group", volume: 12.8 }, { name: "Mosaic Co.", volume: 8.2 },
      { name: "PhosAgro", volume: 5.6 }, { name: "Ma'aden", volume: 4.8 },
      { name: "Nutrien", volume: 4.2 }, { name: "Yuntianhua (China)", volume: 3.5 },
    ],
    netback: [
      { market: "India", fobJorf: "$548", freight: "$62", dapPrice: "$610", netback: "$548", vs30d: "+4.8%" },
      { market: "North America", fobJorf: "$548", freight: "$108", dapPrice: "$650", netback: "$542", vs30d: "+5.2%" },
      { market: "Europe", fobJorf: "$548", freight: "$48", dapPrice: "$600", netback: "$552", vs30d: "+2.1%" },
      { market: "Brazil", fobJorf: "$548", freight: "$55", dapPrice: "$575", netback: "$520", vs30d: "+3.5%" },
      { market: "Africa (West)", fobJorf: "$548", freight: "$38", dapPrice: "$590", netback: "$552", vs30d: "+4.0%" },
    ],
    supplyDemand: [
      { category: "World Production", y2025: "38.2", y2026e: "40.5", vs2025: "+6.0%" },
      { category: "World Demand", y2025: "36.8", y2026e: "39.0", vs2025: "+6.0%" },
      { category: "Balance", y2025: "1.4", y2026e: "1.5", vs2025: "+7.1%" },
    ],
    competitorDetails: [
      { name: "Mosaic Company", country: "USA", marketShare: "18%", strengths: "Brazil/USA proximity, vertical integration" },
      { name: "PhosAgro", country: "Russia", marketShare: "12%", strengths: "Low gas costs, premium quality (low Cd)" },
      { name: "Ma'aden", country: "Saudi Arabia", marketShare: "10%", strengths: "Local sulfur/gas, Asia/Africa proximity" },
      { name: "Yuntianhua", country: "China", marketShare: "8%", strengths: "Massive capacity, export quotas drive prices" },
    ],
  },
  optionality: {
    kpis: [
      { label: "Forward Curve (Mid)", value: "$598/t", subtitle: "Q3 2026", change: "+4.5% vs 30d", changeDirection: "up" },
      { label: "Option Value*", value: "$34/t", subtitle: "Weighted avg", change: "+6.2%", changeDirection: "up" },
      { label: "Open Destination Vol.", value: "2.2 Mt", subtitle: "17% of total pipeline", change: "+11%", changeDirection: "up" },
    ],
    forwardCurve: [
      { period: "Q2 26", current: 575, m1: 560, m3: 540 },
      { period: "Q3 26", current: 598, m1: 580, m3: 555 },
      { period: "Q4 26", current: 620, m1: 600, m3: 570 },
      { period: "Q1 27", current: 640, m1: 615, m3: 585 },
      { period: "Q2 27", current: 650, m1: 630, m3: 600 },
      { period: "Q3 27", current: 655, m1: 640, m3: 610 },
    ],
    optionValue: [
      { period: "Q2 2026", value: 22 }, { period: "Q3 2026", value: 34 },
      { period: "Q4 2026", value: 38 }, { period: "Q1 2027", value: 30 },
      { period: "Q2 2027", value: 24 }, { period: "Q3 2027", value: 18 },
    ],
    openDest: [
      { name: "India", value: 0.68 }, { name: "Brazil", value: 0.52 },
      { name: "Africa", value: 0.42 }, { name: "Other Asia", value: 0.34 }, { name: "Other", value: 0.24 },
    ],
    floatingStock: [
      { region: "India", current: "62", vs30d: "▲ +5", vsLastYear: "▼ -8" },
      { region: "Brazil", current: "78", vs30d: "▲ +7", vsLastYear: "▼ -5" },
      { region: "Africa (West)", current: "48", vs30d: "▲ +4", vsLastYear: "▼ -10" },
      { region: "Other Asia", current: "42", vs30d: "▲ +3", vsLastYear: "▼ -6" },
    ],
    scenarios: [
      { scenario: "Base Case", assumption: "Current forward curve (Q3 2026)", netbackImpact: "$598", vsBase: "—" },
      { scenario: "Upside", assumption: "India demand +15%, China export curbs", netbackImpact: "$665", vsBase: "+$67" },
      { scenario: "Downside", assumption: "Brazil recession, China supply surplus", netbackImpact: "$545", vsBase: "-$53" },
      { scenario: "Ammonia Stress", assumption: "NH₃ +25% (gas price spike)", netbackImpact: "$560", vsBase: "-$38" },
      { scenario: "Green Premium", assumption: "Low-cadmium fertilizer premium +$20/t", netbackImpact: "$618", vsBase: "+$20" },
    ],
  },
  flows: {
    arbitrage: [
      { type: "Geographic Arbitrage", description: "Exploit price gaps between regions by redirecting physical flows", example: "Redirect DAP to India ($610/t) instead of Brazil ($575/t) = +$35/t", lever: "Geography + Logistics" },
      { type: "Contract vs Spot", description: "Optimize between long-term contracts and spot sales", example: "Sell contractual minimum, max out spot during seasonal peaks", lever: "Timing" },
      { type: "Value Chain (Rock-Acid-DAP)", description: "Arbitrage between rock, acid or DAP based on margins", example: "Stop DAP production and sell acid when ammonia is expensive", lever: "Industrial Flexibility" },
      { type: "Freight Arbitrage", description: "Exploit gaps between spot and long-term freight", example: "Lock Supramax at $18k/d vs spot $22k/d = $4k/d savings", lever: "Logistics" },
    ],
    insights: [
      { title: "Key Insight", subtitle: "Geography", content: "Fleet & routing control allows mid-voyage redirection. Current netback gap India ($610/t) vs Brazil ($575/t) creates $35/t opportunity. With 2.2 Mt open destination → ~$77M potential." },
      { title: "Key Insight", subtitle: "Timing / Contango", content: "Forward curve in contango (Q2→Q4: +$45/t). Storage cost ~$8/t/mo. Net carry trade: +$21/t over 3 months." },
      { title: "Key Insight", subtitle: "Freight & Input", content: "Supramax rates volatile (±18% 30D). Locking 6-month charters at current levels could save $6-10/t if rates rise." },
    ],
    tradeRoutes: [
      { origin: "Jorf Lasfar", destination: "Mumbai (India)", product: "DAP", volume: "850 kt/qtr", transitDays: "18-22" },
      { origin: "Jorf Lasfar", destination: "Santos (Brazil)", product: "MAP", volume: "620 kt/qtr", transitDays: "14-18" },
      { origin: "Safi", destination: "Lagos (Nigeria)", product: "NPK", volume: "280 kt/qtr", transitDays: "5-7" },
      { origin: "Jorf Lasfar", destination: "Tampa (USA)", product: "DAP", volume: "180 kt/qtr", transitDays: "12-15" },
      { origin: "Casablanca", destination: "Antwerp (Belgium)", product: "TSP", volume: "150 kt/qtr", transitDays: "4-6" },
    ],
  },
  referentiel: {
    ports: [
      { name: "Jorf Lasfar", location: "El Jadida, Morocco", capacityMt: 23, currentUtilization: "82%", products: "DAP, MAP, TSP, Phosphoric Acid", status: "Operational" },
      { name: "Safi", location: "Safi, Morocco", capacityMt: 10, currentUtilization: "71%", products: "NPK, NPS, DAP", status: "Operational" },
      { name: "Casablanca", location: "Casablanca, Morocco", capacityMt: 5, currentUtilization: "63%", products: "TSP, Phosphate rock", status: "Operational" },
      { name: "Laâyoune", location: "Laâyoune, Morocco", capacityMt: 4, currentUtilization: "45%", products: "Phosphoric Acid, Rock", status: "Operational" },
    ],
    exportProducts: [
      { name: "DAP (Diammonium Phosphate)", category: "Phosphate fertilizer", annualCapacity: "~4.2 Mt", currentPrice: "$610/t", mainMarkets: "India, Brazil, Africa", unit: "Mt" },
      { name: "MAP (Monoammonium Phosphate)", category: "Phosphate fertilizer", annualCapacity: "~2.8 Mt", currentPrice: "$575/t", mainMarkets: "Brazil, Argentina", unit: "Mt" },
      { name: "Phosphoric Acid", category: "Intermediate product", annualCapacity: "~3.1 Mt", currentPrice: "$780/t P₂O₅", mainMarkets: "India, Europe", unit: "Mt P₂O₅" },
      { name: "TSP (Triple Superphosphate)", category: "Phosphate fertilizer", annualCapacity: "~1.2 Mt", currentPrice: "$420/t", mainMarkets: "Europe, Africa", unit: "Mt" },
      { name: "NPK / NPS", category: "Compound fertilizer", annualCapacity: "~0.8 Mt", currentPrice: "$490/t", mainMarkets: "Africa", unit: "Mt" },
    ],
    importMaterials: [
      { name: "Sulfur", category: "Critical input", annualVolume: "~8.3 Mt/year", currentPrice: "$142/t CFR", mainSuppliers: "QatarEnergy, ADNOC, Aramco", usage: "Sulfuric acid → phosphate rock" },
      { name: "Ammonia (NH₃)", category: "Critical input", annualVolume: "~2.5 Mt/year", currentPrice: "$385/t CFR", mainSuppliers: "Trinidad, CF Industries, EuroChem", usage: "DAP/MAP production" },
      { name: "Potash (KCl)", category: "Secondary input", annualVolume: "Variable", currentPrice: "$290/t CFR", mainSuppliers: "Nutrien (Canada), European producers", usage: "NPK fertilizers" },
    ],
    suppliers: [
      { name: "QatarEnergy", country: "Qatar", zone: "Middle East", products: "Sulfur", contractType: "Long-term", rating: "A+" },
      { name: "ADNOC", country: "United Arab Emirates", zone: "Middle East", products: "Sulfur", contractType: "Long-term", rating: "A+" },
      { name: "Saudi Aramco", country: "Saudi Arabia", zone: "Middle East", products: "Sulfur", contractType: "Long-term", rating: "A+" },
      { name: "CF Industries", country: "United States", zone: "North America", products: "Ammonia", contractType: "Annual contract", rating: "A" },
      { name: "Trinidad Nitrogen", country: "Trinidad and Tobago", zone: "North America", products: "Ammonia", contractType: "Long-term", rating: "A" },
      { name: "Nutrien", country: "Canada", zone: "North America", products: "Potash (KCl)", contractType: "Annual contract", rating: "A" },
    ],
    clients: [
      { name: "Coromandel International", country: "India", zone: "South Asia", products: "DAP, Phosphoric Acid", annualVolume: "~1.2 Mt", contractType: "Long-term" },
      { name: "IFFCO", country: "India", zone: "South Asia", products: "DAP", annualVolume: "~0.8 Mt", contractType: "Long-term" },
      { name: "Yara Brasil", country: "Brazil", zone: "Latin America", products: "MAP, DAP", annualVolume: "~0.9 Mt", contractType: "Annual contract" },
      { name: "Mosaic Fertilizantes", country: "Brazil", zone: "Latin America", products: "MAP", annualVolume: "~0.6 Mt", contractType: "Spot + Contract" },
      { name: "Ethiopia Government", country: "Ethiopia", zone: "East Africa", products: "NPK/NPS", annualVolume: "~0.4 Mt", contractType: "Government contract" },
      { name: "Nigeria Government", country: "Nigeria", zone: "West Africa", products: "NPK", annualVolume: "~0.3 Mt", contractType: "Government contract" },
      { name: "Groupe Roullier", country: "France", zone: "Europe", products: "Phosphoric Acid, TSP", annualVolume: "~0.2 Mt", contractType: "Annual contract" },
    ],
  },
  logisticsMappings: {
    destinationCountries: ["Brazil", "India", "USA", "Mexico", "Pakistan", "Australia", "Europe", "Morocco", "Nigeria", "Kenya", "Turkey", "Bangladesh"],
    productCodes: ["DAP", "MAP", "TSP", "NPK", "Phosphoric Acid", "NPS"],
    vesselStatuses: ["To Morocco", "Loading Open", "Loading", "Loading Sold", "Transit Open", "Transit Sold", "Transit Subsidiary", "Transit", "Floating Storage", "Regional Hub", "Line Up"],
    floatingHubs: DEFAULT_FLOATING_HUBS,
  },
};

// ─────────────────────────────────────────────────────────────────
// COPPER (LME)
// ─────────────────────────────────────────────────────────────────
const copper: CommodityPreset = {
  id: "copper",
  label: "Copper & Base Metals",
  shortLabel: "Copper",
  description: "Copper concentrates & cathodes — LME, smelters, TC/RC.",
  defaultCompanyName: "Commohedge Metals",
  currency: "USD",
  unit: "kt",
  overview: {
    kpis: [
      { label: "Refined Output", value: "1.45 Mt", change: "+4.1% vs 2025", changeDirection: "up", subtitle: "Copper cathode" },
      { label: "Revenue", value: "$13.8 Bn", change: "+11.2% vs 2025", changeDirection: "up", subtitle: "2026 YTD" },
      { label: "LME 3M Price", value: "$9,520/t", change: "+6.8% YTD", changeDirection: "up", subtitle: "London Metal Exchange" },
      { label: "Global Market Share", value: "6.2%", change: "+0.4 pp vs 2024", changeDirection: "up", subtitle: "Refined copper" },
      { label: "Mines Operated", value: "12", change: "+1 (Quellaveco)", changeDirection: "up" },
      { label: "TC/RC Benchmark", value: "$80 / 8c", change: "Annual settlement", changeDirection: "neutral", subtitle: "Treatment / Refining" },
    ],
    storage: [
      { country: "China (LME warrants)", inStock: 145, inTransit: 82, planned: 110 },
      { country: "Europe (Rotterdam)", inStock: 88, inTransit: 45, planned: 60 },
      { country: "USA (COMEX)", inStock: 64, inTransit: 38, planned: 48 },
      { country: "Asia ex-China", inStock: 52, inTransit: 28, planned: 35 },
      { country: "South America", inStock: 41, inTransit: 22, planned: 28 },
    ],
    demand: [
      { country: "China", y2025: 14800, y2026ytd: 7900, y2026f: 15600 },
      { country: "Europe", y2025: 3850, y2026ytd: 2050, y2026f: 4000 },
      { country: "USA", y2025: 1800, y2026ytd: 980, y2026f: 1900 },
      { country: "Japan", y2025: 980, y2026ytd: 520, y2026f: 1010 },
      { country: "South Korea", y2025: 720, y2026ytd: 380, y2026f: 740 },
    ],
    forecast: [
      { country: "China", arrivals: 380, shipments: 320, startingStock: 145, endingStock: 205 },
      { country: "Europe", arrivals: 180, shipments: 165, startingStock: 88, endingStock: 103 },
      { country: "USA", arrivals: 95, shipments: 88, startingStock: 64, endingStock: 71 },
      { country: "Asia ex-China", arrivals: 70, shipments: 62, startingStock: 52, endingStock: 60 },
    ],
    imports: [
      { material: "Copper Concentrate", volume: "~2.8 Mt/y Cu", suppliers: "Chile (BHP, Codelco), Peru (Antamina), Indonesia (Freeport)", usage: "Smelter feed → blister → cathode" },
      { material: "Sulfuric Acid", volume: "Variable", suppliers: "Smelter byproduct market", usage: "SX-EW leaching" },
      { material: "Energy / Power", volume: "Heavy load", suppliers: "Grid + on-site solar (Chile)", usage: "Refining electrolysis" },
    ],
    exports: [
      { product: "Copper Cathode (Grade A)", volume: "~1.2 Mt", mainMarkets: "China, Europe", share: "82%" },
      { product: "Copper Concentrate", volume: "~180 kt Cu", mainMarkets: "China, Japan smelters", share: "12%" },
      { product: "Copper Wire Rod", volume: "~70 kt", mainMarkets: "Europe", share: "5%" },
      { product: "Molybdenum (byproduct)", volume: "~8 kt", mainMarkets: "Steel mills (US, EU)", share: "1%" },
    ],
  },
  supply: {
    kpis: [
      { label: "Mine Output (LTM)", value: "1.62 Mt Cu", subtitle: "Concentrate basis", change: "+3.8%", changeDirection: "up" },
      { label: "Smelter Utilization", value: "84%", subtitle: "Owned + tolling", change: "+2 pp", changeDirection: "up" },
      { label: "Refinery Throughput", value: "1.45 Mt", subtitle: "Cathode output", change: "+4.1%", changeDirection: "up" },
      { label: "Committed Sales", value: "1.18 Mt", subtitle: "Annual contracts", change: "+6%", changeDirection: "up" },
      { label: "Strip Ratio", value: "2.4 : 1", subtitle: "Waste : Ore", change: "Stable", changeDirection: "neutral" },
      { label: "C1 Cash Cost", value: "$1.85/lb", subtitle: "Net of byproducts", change: "-$0.08", changeDirection: "down" },
    ],
    production: [
      { month: "Jan 2026", volume: 122 },
      { month: "Feb 2026", volume: 118 },
      { month: "Mar 2026", volume: 130 },
      { month: "Apr 2026", volume: 135 },
      { month: "May 2026", volume: 138 },
      { month: "Jun 2026", volume: 140 },
      { month: "Jul 2026", volume: 132 },
      { month: "Aug 2026", volume: 128 },
    ],
    volumeByStatus: [
      { name: "Refined - Available", value: 285, pct: "24%", change: "▲ +6%" },
      { name: "Sold (LME-priced)", value: 540, pct: "46%", change: "▲ +4%" },
      { name: "Sold (Fixed price)", value: 215, pct: "18%", change: "▲ +2%" },
      { name: "In Transit", value: 142, pct: "12%", change: "▼ -1%" },
    ],
    ports: [
      { port: "Antofagasta (CL)", utilization: "78%", next7: "4 / 6", next30: "14 / 20" },
      { port: "Callao (PE)", utilization: "65%", next7: "3 / 5", next30: "11 / 16" },
      { port: "Shanghai (CN)", utilization: "88%", next7: "6 / 7", next30: "20 / 24" },
      { port: "Rotterdam (NL)", utilization: "62%", next7: "2 / 4", next30: "9 / 14" },
    ],
    vessels: { inPort: 6, atSea: 11, charterOptions: 4 },
    constraints: [
      { constraint: "Water Permits Chile", details: "Drought restrictions limiting mine throughput Q3", severity: "high" },
      { constraint: "Smelter Maintenance", details: "Chuquicamata smelter shutdown 12 Apr - 2 May", severity: "high" },
      { constraint: "TC/RC Squeeze", details: "Spot TC at $35/t, well below $80 benchmark — concentrates tight", severity: "high" },
      { constraint: "China Cathode Demand", details: "SHFE inventories drawing fast, supports premium", severity: "medium" },
      { constraint: "DRC Export Tax", details: "Cobalt export restrictions impact byproduct revenue", severity: "low" },
    ],
    rawMaterials: [
      { material: "Copper Concentrate (TC)", currentPrice: "$35/t", vs30d: "▼ -12%", trend: "Tight" },
      { material: "Sulfuric Acid (CFR)", currentPrice: "$110/t", vs30d: "▲ +4%", trend: "Stable" },
      { material: "Power (mine site)", currentPrice: "$85/MWh", vs30d: "▲ +2%", trend: "Stable" },
      { material: "Diesel (Chile)", currentPrice: "$0.92/L", vs30d: "▼ -3%", trend: "Easing" },
    ],
  },
  pipeline: {
    kpis: [
      { label: "Confirmed Sales", value: "1.18 Mt", subtitle: "78% of guidance", change: "+6%", changeDirection: "up" },
      { label: "Open / Spot", value: "228 kt", subtitle: "15% of total", change: "+12%", changeDirection: "up" },
      { label: "Hedged Volume", value: "640 kt", subtitle: "LME futures", change: "+8%", changeDirection: "up" },
      { label: "Order Book Days", value: "48 days", subtitle: "of cathode sales", change: "+5 days", changeDirection: "up" },
      { label: "Pipeline Value", value: "$11.2 Bn", subtitle: "at LME 3M", change: "+9.3%", changeDirection: "up" },
    ],
    coverage: [
      { month: "Jan", days: 38 }, { month: "Feb", days: 40 }, { month: "Mar", days: 42 },
      { month: "Apr", days: 44 }, { month: "May", days: 46 }, { month: "Jun", days: 47 },
      { month: "Jul", days: 48 },
    ],
    maturity: [
      { period: "Apr 2026", confirmed: 0.13, unassigned: 0.04, openDest: 0.02 },
      { period: "May 2026", confirmed: 0.12, unassigned: 0.05, openDest: 0.03 },
      { period: "Jun 2026", confirmed: 0.10, unassigned: 0.06, openDest: 0.03 },
      { period: "Jul 2026", confirmed: 0.07, unassigned: 0.05, openDest: 0.02 },
      { period: "Aug 2026", confirmed: 0.04, unassigned: 0.04, openDest: 0.02 },
    ],
    destinations: [
      { name: "China", value: 720, netback: 9420 },
      { name: "Europe", value: 230, netback: 9580 },
      { name: "USA", value: 140, netback: 9620 },
      { name: "Japan/Korea", value: 95, netback: 9510 },
      { name: "Other Asia", value: 60, netback: 9460 },
    ],
    statusRows: [
      { status: "LME-priced", volume: "540", pct: "46%", change: "▲ +4%", netback: "$9,520" },
      { status: "Fixed price", volume: "215", pct: "18%", change: "▲ +2%", netback: "$9,180" },
      { status: "Open / Spot", volume: "228", pct: "19%", change: "▲ +12%", netback: "—" },
      { status: "In Transit", volume: "142", pct: "12%", change: "▼ -1%", netback: "$9,480" },
    ],
    clientsByRegion: [
      { region: "China (Asia)", share: "55-60%", clients: "Maike, Jiangxi Copper, Tongling, CMOC", products: "Cathode Grade A, Concentrate" },
      { region: "Europe", share: "18-22%", clients: "Aurubis, KGHM, Boliden", products: "Cathode, Wire rod" },
      { region: "Americas", share: "12-15%", clients: "Southwire, Encore Wire, Freeport USA", products: "Cathode" },
      { region: "Japan / Korea", share: "8-10%", clients: "Pan Pacific Copper, LS-Nikko, Sumitomo", products: "Concentrate, Cathode" },
    ],
  },
  market: {
    kpis: [
      { label: "Global Demand (2026)", value: "26.8 Mt", subtitle: "Refined copper", change: "+3.2% vs 2025", changeDirection: "up" },
      { label: "LME Stocks", value: "182 kt", subtitle: "Total warrant", change: "-8.4% vs 30d", changeDirection: "down" },
      { label: "Cash-3M Spread", value: "$42/t backwardation", subtitle: "Tight nearby", change: "Widening", changeDirection: "up" },
      { label: "Vol (30d)", value: "22.8%", subtitle: "Annualized LME", change: "+1.6 pp", changeDirection: "up" },
    ],
    prices: [
      { period: "Oct 25", tampa: 8650, india: 8480, jorf: 8410 },
      { period: "Nov 25", tampa: 8780, india: 8620, jorf: 8540 },
      { period: "Dec 25", tampa: 8920, india: 8760, jorf: 8680 },
      { period: "Jan 26", tampa: 9120, india: 8960, jorf: 8880 },
      { period: "Feb 26", tampa: 9280, india: 9120, jorf: 9040 },
      { period: "Mar 26", tampa: 9410, india: 9260, jorf: 9180 },
      { period: "Apr 26", tampa: 9520, india: 9380, jorf: 9300 },
    ],
    inventory: [
      { period: "Jan 26", global: 245, india: 32, brazil: 12, na: 58 },
      { period: "Apr 26", global: 220, india: 28, brazil: 10, na: 52 },
      { period: "Jul 26", global: 198, india: 25, brazil: 9, na: 48 },
      { period: "Oct 26", global: 215, india: 30, brazil: 11, na: 55 },
      { period: "Jan 27", global: 240, india: 34, brazil: 13, na: 60 },
    ],
    demandByRegion: [
      { name: "China", value: 15600 }, { name: "Europe", value: 4000 },
      { name: "USA", value: 1900 }, { name: "Japan", value: 1010 },
      { name: "South Korea", value: 740 },
    ],
    competitors: [
      { name: "Codelco", volume: 1.45 }, { name: "BHP", volume: 1.18 },
      { name: "Freeport-McMoRan", volume: 1.10 }, { name: "Glencore", volume: 1.02 },
      { name: "Antofagasta", volume: 0.66 }, { name: "Anglo American", volume: 0.62 },
    ],
    netback: [
      { market: "China (Shanghai)", fobJorf: "$9,180", freight: "$120", dapPrice: "$9,520", netback: "$9,400", vs30d: "+3.8%" },
      { market: "Europe (Rotterdam)", fobJorf: "$9,180", freight: "$95", dapPrice: "$9,580", netback: "$9,485", vs30d: "+2.6%" },
      { market: "USA (New Orleans)", fobJorf: "$9,180", freight: "$110", dapPrice: "$9,620", netback: "$9,510", vs30d: "+3.1%" },
      { market: "Japan (Yokohama)", fobJorf: "$9,180", freight: "$130", dapPrice: "$9,510", netback: "$9,380", vs30d: "+2.4%" },
    ],
    supplyDemand: [
      { category: "World Mine Production", y2025: "22.4", y2026e: "23.1", vs2025: "+3.1%" },
      { category: "World Refined Demand", y2025: "26.0", y2026e: "26.8", vs2025: "+3.2%" },
      { category: "Balance (deficit)", y2025: "-0.4", y2026e: "-0.5", vs2025: "Tighter" },
    ],
    competitorDetails: [
      { name: "Codelco", country: "Chile", marketShare: "9%", strengths: "World #1 producer, state-owned" },
      { name: "BHP", country: "Australia", marketShare: "7%", strengths: "Escondida (largest mine), low cost" },
      { name: "Freeport-McMoRan", country: "USA", marketShare: "7%", strengths: "Grasberg, Cerro Verde, US smelter" },
      { name: "Glencore", country: "Switzerland", marketShare: "6%", strengths: "Trading + production integrated" },
    ],
  },
  optionality: {
    kpis: [
      { label: "Forward Curve (Mid)", value: "$9,480/t", subtitle: "Q3 2026 LME", change: "+3.8% vs 30d", changeDirection: "up" },
      { label: "Option Value*", value: "$185/t", subtitle: "ATM call, 6M", change: "+8%", changeDirection: "up" },
      { label: "Open / Unhedged", value: "228 kt", subtitle: "19% of pipeline", change: "+12%", changeDirection: "up" },
    ],
    forwardCurve: [
      { period: "Q2 26", current: 9520, m1: 9420, m3: 9180 },
      { period: "Q3 26", current: 9480, m1: 9380, m3: 9120 },
      { period: "Q4 26", current: 9450, m1: 9340, m3: 9080 },
      { period: "Q1 27", current: 9420, m1: 9320, m3: 9060 },
      { period: "Q2 27", current: 9400, m1: 9300, m3: 9040 },
      { period: "Q3 27", current: 9380, m1: 9290, m3: 9020 },
    ],
    optionValue: [
      { period: "Q2 2026", value: 165 }, { period: "Q3 2026", value: 185 },
      { period: "Q4 2026", value: 195 }, { period: "Q1 2027", value: 178 },
      { period: "Q2 2027", value: 162 }, { period: "Q3 2027", value: 145 },
    ],
    openDest: [
      { name: "China", value: 0.12 }, { name: "Europe", value: 0.04 },
      { name: "USA", value: 0.03 }, { name: "Asia other", value: 0.025 }, { name: "Other", value: 0.015 },
    ],
    floatingStock: [
      { region: "China bonded (Shanghai)", current: "82", vs30d: "▼ -8", vsLastYear: "▼ -22" },
      { region: "LME Europe", current: "48", vs30d: "▼ -4", vsLastYear: "▼ -12" },
      { region: "LME Asia", current: "32", vs30d: "▼ -2", vsLastYear: "▼ -8" },
      { region: "COMEX (USA)", current: "28", vs30d: "▲ +2", vsLastYear: "▼ -4" },
    ],
    scenarios: [
      { scenario: "Base Case", assumption: "Forward curve Q3 2026", netbackImpact: "$9,480", vsBase: "—" },
      { scenario: "Upside", assumption: "China stimulus + EV demand acceleration", netbackImpact: "$10,800", vsBase: "+$1,320" },
      { scenario: "Downside", assumption: "China property crisis deepens, recession EU", netbackImpact: "$8,200", vsBase: "-$1,280" },
      { scenario: "Supply Shock", assumption: "Major Chilean mine strike (3 months)", netbackImpact: "$10,400", vsBase: "+$920" },
      { scenario: "Energy Transition", assumption: "EV + grid investment surprise to upside", netbackImpact: "$10,200", vsBase: "+$720" },
    ],
  },
  flows: {
    arbitrage: [
      { type: "LME-SHFE Arbitrage", description: "Exploit price gaps between London and Shanghai", example: "When SHFE - LME spread > $200/t inc tax, ship China-bound", lever: "Geography + FX" },
      { type: "TC/RC Optimization", description: "Toll-treat at favorable smelters when TC is low", example: "Send concentrate to lowest-TC smelter when terms favor miner", lever: "Industrial Flexibility" },
      { type: "Cathode Premium Arbitrage", description: "Region premiums vary $50-150/t over LME", example: "Yangshan premium $80 vs Rotterdam $55 → ship Asia", lever: "Geography" },
      { type: "Contango Storage", description: "When LME 3M-Cash > carry, lock in contango", example: "Borrow LME warrant + sell forward when spread > $40/t", lever: "Financing + Storage" },
    ],
    insights: [
      { title: "Key Insight", subtitle: "China Demand", content: "China consumes 55%+ of global refined copper. Watch SHFE inventories + import arb window for routing decisions. Current draw rate suggests $9,800+ by Q3." },
      { title: "Key Insight", subtitle: "TC/RC Squeeze", content: "Spot TC at $35 vs $80 benchmark → smelter margins crushed. Concentrate sellers benefit. Locking 2027 TC contracts NOW could capture upside." },
      { title: "Key Insight", subtitle: "Energy Transition", content: "EV (80kg Cu/car) + grid (10x current capex) drive 2030 deficit estimates to 5+ Mt. Long-term physical positions valuable." },
    ],
    tradeRoutes: [
      { origin: "Antofagasta (CL)", destination: "Shanghai (China)", product: "Cathode", volume: "180 kt/qtr", transitDays: "30-35" },
      { origin: "Callao (Peru)", destination: "Yantai (China)", product: "Concentrate", volume: "120 kt/qtr", transitDays: "32-38" },
      { origin: "Antofagasta (CL)", destination: "Rotterdam (NL)", product: "Cathode", volume: "65 kt/qtr", transitDays: "26-30" },
      { origin: "Callao (Peru)", destination: "New Orleans (USA)", product: "Cathode", volume: "45 kt/qtr", transitDays: "12-15" },
    ],
  },
  referentiel: {
    ports: [
      { name: "Antofagasta", location: "Antofagasta, Chile", capacityMt: 1.8, currentUtilization: "78%", products: "Copper cathode, Concentrate", status: "Operational" },
      { name: "Callao", location: "Callao, Peru", capacityMt: 1.2, currentUtilization: "65%", products: "Concentrate, Cathode", status: "Operational" },
      { name: "Mejillones", location: "Mejillones, Chile", capacityMt: 0.8, currentUtilization: "70%", products: "Concentrate, Sulfuric acid", status: "Operational" },
      { name: "Shanghai (Yangshan)", location: "Shanghai, China", capacityMt: 4.5, currentUtilization: "88%", products: "Cathode imports", status: "Operational" },
      { name: "Rotterdam", location: "Rotterdam, Netherlands", capacityMt: 1.5, currentUtilization: "62%", products: "LME warrant cathode", status: "Operational" },
    ],
    exportProducts: [
      { name: "Copper Cathode (Grade A LME)", category: "Refined metal", annualCapacity: "~1.2 Mt", currentPrice: "$9,520/t", mainMarkets: "China, Europe, USA", unit: "kt" },
      { name: "Copper Concentrate (28-32% Cu)", category: "Mineral concentrate", annualCapacity: "~180 kt Cu", currentPrice: "$6,850/t Cu", mainMarkets: "China, Japan, Korea smelters", unit: "kt Cu" },
      { name: "Copper Wire Rod (8mm)", category: "Semi-fabricated", annualCapacity: "~70 kt", currentPrice: "$9,820/t", mainMarkets: "Europe wire & cable", unit: "kt" },
      { name: "Molybdenum (TMo)", category: "Byproduct", annualCapacity: "~8 kt", currentPrice: "$22/lb", mainMarkets: "Steel mills", unit: "kt" },
      { name: "Sulfuric Acid (smelter)", category: "Byproduct", annualCapacity: "~2.4 Mt", currentPrice: "$110/t", mainMarkets: "Chile leaching, regional", unit: "Mt" },
    ],
    importMaterials: [
      { name: "Copper Concentrate (toll)", category: "Critical input", annualVolume: "~400 kt Cu", currentPrice: "TC $35/t", mainSuppliers: "BHP, Codelco, Antamina", usage: "Smelter feed" },
      { name: "Sulfuric Acid", category: "Process input", annualVolume: "~600 kt", currentPrice: "$110/t CFR", mainSuppliers: "Regional smelters", usage: "SX-EW heap leaching" },
      { name: "Diesel / HFO", category: "Energy", annualVolume: "Heavy load", currentPrice: "$0.92/L", mainSuppliers: "Shell, Copec, ENAP", usage: "Mine fleet, generators" },
    ],
    suppliers: [
      { name: "BHP Trading", country: "Australia", zone: "Asia Pacific", products: "Concentrate", contractType: "Long-term", rating: "A+" },
      { name: "Codelco Trading", country: "Chile", zone: "South America", products: "Concentrate, Cathode", contractType: "Annual contract", rating: "A+" },
      { name: "Antamina", country: "Peru", zone: "South America", products: "Concentrate (Cu/Zn)", contractType: "Long-term", rating: "A" },
      { name: "Freeport-McMoRan", country: "USA", zone: "North America", products: "Concentrate", contractType: "Annual contract", rating: "A+" },
      { name: "Trafigura", country: "Switzerland", zone: "Global", products: "Cathode, Concentrate (trading)", contractType: "Spot + Contract", rating: "A" },
      { name: "Shell Lubricants", country: "Netherlands", zone: "Global", products: "Mining lubes, diesel", contractType: "Annual contract", rating: "A" },
    ],
    clients: [
      { name: "Maike Group", country: "China", zone: "East Asia", products: "Cathode Grade A", annualVolume: "~280 kt", contractType: "Annual contract" },
      { name: "Jiangxi Copper", country: "China", zone: "East Asia", products: "Concentrate, Cathode", annualVolume: "~220 kt", contractType: "Long-term" },
      { name: "Tongling Nonferrous", country: "China", zone: "East Asia", products: "Concentrate", annualVolume: "~140 kt Cu", contractType: "Annual contract" },
      { name: "Aurubis", country: "Germany", zone: "Europe", products: "Cathode, Wire rod", annualVolume: "~95 kt", contractType: "Long-term" },
      { name: "KGHM", country: "Poland", zone: "Europe", products: "Cathode", annualVolume: "~60 kt", contractType: "Annual contract" },
      { name: "Pan Pacific Copper", country: "Japan", zone: "East Asia", products: "Concentrate", annualVolume: "~80 kt Cu", contractType: "Long-term" },
      { name: "Southwire", country: "USA", zone: "North America", products: "Cathode", annualVolume: "~55 kt", contractType: "Annual contract" },
    ],
  },
  logisticsMappings: {
    destinationCountries: ["China", "Germany", "Netherlands", "USA", "Japan", "South Korea", "India", "Italy", "Spain", "Turkey", "Brazil"],
    productCodes: ["Cathode", "Concentrate", "Wire Rod", "Molybdenum", "Sulfuric Acid"],
    vesselStatuses: ["Loading", "At Anchor", "Transit", "Discharging", "Delivered", "LME Warranted", "Bonded Storage", "Free Circulation"],
    floatingHubs: DEFAULT_FLOATING_HUBS,
  },
};

// ─────────────────────────────────────────────────────────────────
// LNG (Liquefied Natural Gas)
// ─────────────────────────────────────────────────────────────────
const lng: CommodityPreset = {
  id: "lng",
  label: "Energy — LNG & Gas",
  shortLabel: "LNG",
  description: "Liquefied Natural Gas — terminals, tankers, JKM/TTF.",
  defaultCompanyName: "Commohedge Energy",
  currency: "USD",
  unit: "mmbtu",
  overview: {
    kpis: [
      { label: "LNG Volume (LTM)", value: "32.4 Mtpa", change: "+8.1% vs 2025", changeDirection: "up", subtitle: "Liquefaction output" },
      { label: "Revenue", value: "$22.8 Bn", change: "+12.4% vs 2025", changeDirection: "up", subtitle: "2026 YTD" },
      { label: "JKM Spot", value: "$13.20/mmbtu", change: "+4.6% vs 30d", changeDirection: "up", subtitle: "Asia benchmark" },
      { label: "TTF Front-month", value: "€38.50/MWh", change: "+3.2%", changeDirection: "up", subtitle: "European hub" },
      { label: "Liquefaction Trains", value: "16", change: "+2 (commissioning)", changeDirection: "up" },
      { label: "Long-term Contracts", value: "85%", change: "+3 pp", changeDirection: "up", subtitle: "of volume oil-indexed" },
    ],
    storage: [
      { country: "Japan (METI)", inStock: 4.2, inTransit: 2.1, planned: 2.8 },
      { country: "South Korea (KOGAS)", inStock: 3.8, inTransit: 1.9, planned: 2.4 },
      { country: "China", inStock: 5.4, inTransit: 2.8, planned: 3.6 },
      { country: "Europe (storage %)", inStock: 68, inTransit: 12, planned: 18 },
      { country: "India", inStock: 1.4, inTransit: 0.8, planned: 1.2 },
    ],
    demand: [
      { country: "China", y2025: 78, y2026ytd: 42, y2026f: 84 },
      { country: "Japan", y2025: 64, y2026ytd: 34, y2026f: 62 },
      { country: "South Korea", y2025: 44, y2026ytd: 24, y2026f: 46 },
      { country: "Europe", y2025: 110, y2026ytd: 58, y2026f: 115 },
      { country: "India", y2025: 28, y2026ytd: 16, y2026f: 32 },
    ],
    forecast: [
      { country: "China", arrivals: 7.8, shipments: 7.2, startingStock: 5.4, endingStock: 6.0 },
      { country: "Japan", arrivals: 5.4, shipments: 5.2, startingStock: 4.2, endingStock: 4.4 },
      { country: "Europe", arrivals: 9.6, shipments: 9.0, startingStock: 68, endingStock: 74 },
      { country: "India", arrivals: 2.6, shipments: 2.4, startingStock: 1.4, endingStock: 1.6 },
    ],
    imports: [
      { material: "Feed Gas (pipeline)", volume: "~48 Bcm/y", suppliers: "Permian basin, North Field, Sakhalin", usage: "Liquefaction feed" },
      { material: "Refrigerants (MR/C3)", volume: "Closed loop", suppliers: "Air Liquide, Linde", usage: "Cascade refrigeration" },
      { material: "Power (electric drives)", volume: "Heavy load", suppliers: "Grid + on-site CCGT", usage: "Compressors" },
    ],
    exports: [
      { product: "LNG (Long-term oil-indexed)", volume: "~24 Mtpa", mainMarkets: "Japan, Korea, China utilities", share: "74%" },
      { product: "LNG (Spot / Hub-indexed)", volume: "~6 Mtpa", mainMarkets: "Europe, India, opportunistic Asia", share: "19%" },
      { product: "Condensate (byproduct)", volume: "~80 kbpd", mainMarkets: "Refineries Asia", share: "5%" },
      { product: "LPG (byproduct)", volume: "~3 Mtpa", mainMarkets: "Asian petrochem", share: "2%" },
    ],
  },
  supply: {
    kpis: [
      { label: "Liquefaction Output", value: "32.4 Mtpa", subtitle: "All trains", change: "+8.1%", changeDirection: "up" },
      { label: "Train Utilization", value: "94%", subtitle: "16 trains operational", change: "+2 pp", changeDirection: "up" },
      { label: "Cargoes Loaded (LTM)", value: "468", subtitle: "Avg 70k m³", change: "+9%", changeDirection: "up" },
      { label: "Boil-off Rate", value: "0.10%/day", subtitle: "Modern fleet", change: "Stable", changeDirection: "neutral" },
      { label: "Henry Hub Cost", value: "$2.85/mmbtu", subtitle: "Feed gas", change: "+4%", changeDirection: "up" },
      { label: "Liquefaction Cost", value: "$2.20/mmbtu", subtitle: "Tolling fee equivalent", change: "Stable", changeDirection: "neutral" },
    ],
    production: [
      { month: "Jan 2026", volume: 2.8 },
      { month: "Feb 2026", volume: 2.6 },
      { month: "Mar 2026", volume: 2.7 },
      { month: "Apr 2026", volume: 2.7 },
      { month: "May 2026", volume: 2.8 },
      { month: "Jun 2026", volume: 2.7 },
      { month: "Jul 2026", volume: 2.6 },
      { month: "Aug 2026", volume: 2.5 },
    ],
    volumeByStatus: [
      { name: "Long-term", value: 24.0, pct: "74%", change: "▲ +5%" },
      { name: "Spot Sold", value: 4.2, pct: "13%", change: "▲ +18%" },
      { name: "Open / Diversion", value: 1.8, pct: "6%", change: "▲ +12%" },
      { name: "In Transit", value: 2.4, pct: "7%", change: "▲ +4%" },
    ],
    ports: [
      { port: "Ras Laffan (QA)", utilization: "96%", next7: "12 / 13", next30: "44 / 48" },
      { port: "Sabine Pass (USA)", utilization: "92%", next7: "8 / 9", next30: "30 / 34" },
      { port: "Gladstone (AU)", utilization: "88%", next7: "6 / 7", next30: "22 / 26" },
      { port: "Yamal (RU)", utilization: "76%", next7: "4 / 6", next30: "16 / 22" },
    ],
    vessels: { inPort: 14, atSea: 22, charterOptions: 8 },
    constraints: [
      { constraint: "Panama Canal Slots", details: "LNG carrier transit limited; reroute via Cape adds 14 days", severity: "high" },
      { constraint: "European Storage Full", details: "EU storage at 92%, limited absorption Q3", severity: "medium" },
      { constraint: "JKM-TTF Spread", details: "Asia premium $1.20 — supports diversion eastward", severity: "medium" },
      { constraint: "Train Maintenance", details: "Train T-3 turnaround 20 May - 18 Jun (28 days)", severity: "high" },
      { constraint: "Charter Rates", details: "Spot LNG carrier $145k/d (high) — squeezes spot economics", severity: "high" },
    ],
    rawMaterials: [
      { material: "Henry Hub Gas", currentPrice: "$2.85/mmbtu", vs30d: "▲ +4%", trend: "Rising" },
      { material: "Brent (oil-indexed)", currentPrice: "$82/bbl", vs30d: "▲ +2%", trend: "Stable" },
      { material: "LNG Charter (160k m³)", currentPrice: "$145k/day", vs30d: "▲ +12%", trend: "Tight" },
      { material: "Bunker (VLSFO)", currentPrice: "$580/t", vs30d: "▲ +3%", trend: "Stable" },
    ],
  },
  pipeline: {
    kpis: [
      { label: "Long-term SPA Volume", value: "24 Mtpa", subtitle: "Through 2040+", change: "+5%", changeDirection: "up" },
      { label: "Spot Pipeline (12M)", value: "6 Mtpa", subtitle: "Hub-indexed", change: "+18%", changeDirection: "up" },
      { label: "Diversion Optionality", value: "1.8 Mtpa", subtitle: "Cargoes available", change: "+12%", changeDirection: "up" },
      { label: "Forward Sales Days", value: "85 days", subtitle: "of liquefaction", change: "+8 days", changeDirection: "up" },
      { label: "Pipeline Value", value: "$18.4 Bn", subtitle: "at JKM forward", change: "+11.2%", changeDirection: "up" },
    ],
    coverage: [
      { month: "Jan", days: 72 }, { month: "Feb", days: 75 }, { month: "Mar", days: 78 },
      { month: "Apr", days: 80 }, { month: "May", days: 82 }, { month: "Jun", days: 84 },
      { month: "Jul", days: 85 },
    ],
    maturity: [
      { period: "Apr 2026", confirmed: 2.4, unassigned: 0.4, openDest: 0.2 },
      { period: "May 2026", confirmed: 2.2, unassigned: 0.5, openDest: 0.3 },
      { period: "Jun 2026", confirmed: 2.0, unassigned: 0.6, openDest: 0.3 },
      { period: "Jul 2026", confirmed: 1.6, unassigned: 0.5, openDest: 0.2 },
      { period: "Aug 2026", confirmed: 1.0, unassigned: 0.4, openDest: 0.2 },
    ],
    destinations: [
      { name: "China", value: 8.4, netback: 12.80 },
      { name: "Japan", value: 6.2, netback: 13.10 },
      { name: "South Korea", value: 4.6, netback: 13.05 },
      { name: "Europe", value: 9.8, netback: 11.40 },
      { name: "India", value: 2.4, netback: 12.60 },
    ],
    statusRows: [
      { status: "Long-term (oil-indexed)", volume: "24,000", pct: "74%", change: "▲ +5%", netback: "$11.80" },
      { status: "Spot (hub-indexed)", volume: "4,200", pct: "13%", change: "▲ +18%", netback: "$13.20" },
      { status: "Diversion / Open", volume: "1,800", pct: "6%", change: "▲ +12%", netback: "—" },
      { status: "In Transit", volume: "2,400", pct: "7%", change: "▲ +4%", netback: "$12.50" },
    ],
    clientsByRegion: [
      { region: "Northeast Asia", share: "52%", clients: "JERA, Tokyo Gas, KOGAS, CNOOC, Sinopec, PetroChina", products: "LNG SPA + Spot" },
      { region: "Europe", share: "28%", clients: "Shell, TotalEnergies, BP, Naturgy, ENGIE, Eni", products: "LNG (TTF-indexed)" },
      { region: "South Asia", share: "10%", clients: "Petronet, GAIL, Pakistan LNG, BPCL", products: "LNG SPA" },
      { region: "Southeast Asia / Other", share: "10%", clients: "PTT, Petronas trading, Shell trading", products: "Spot LNG" },
    ],
  },
  market: {
    kpis: [
      { label: "Global Demand (2026)", value: "428 Mtpa", subtitle: "LNG", change: "+5.4% vs 2025", changeDirection: "up" },
      { label: "EU Storage Level", value: "68%", subtitle: "vs 5y avg 62%", change: "+6 pp", changeDirection: "up" },
      { label: "JKM-TTF Spread", value: "$1.20/mmbtu", subtitle: "Asia premium", change: "Widening", changeDirection: "up" },
      { label: "Vol (30d)", value: "38.5%", subtitle: "JKM annualized", change: "+4.2 pp", changeDirection: "up" },
    ],
    prices: [
      { period: "Oct 25", tampa: 11.20, india: 11.50, jorf: 9.80 },
      { period: "Nov 25", tampa: 12.10, india: 12.40, jorf: 10.50 },
      { period: "Dec 25", tampa: 13.40, india: 13.60, jorf: 11.20 },
      { period: "Jan 26", tampa: 14.20, india: 14.40, jorf: 12.00 },
      { period: "Feb 26", tampa: 13.80, india: 14.00, jorf: 11.80 },
      { period: "Mar 26", tampa: 13.50, india: 13.70, jorf: 11.60 },
      { period: "Apr 26", tampa: 13.20, india: 13.40, jorf: 11.40 },
    ],
    inventory: [
      { period: "Jan 26", global: 78, india: 65, brazil: 50, na: 72 },
      { period: "Apr 26", global: 68, india: 58, brazil: 42, na: 65 },
      { period: "Jul 26", global: 62, india: 52, brazil: 38, na: 58 },
      { period: "Oct 26", global: 88, india: 72, brazil: 55, na: 78 },
      { period: "Jan 27", global: 76, india: 62, brazil: 48, na: 70 },
    ],
    demandByRegion: [
      { name: "China", value: 84 }, { name: "Europe", value: 115 },
      { name: "Japan", value: 62 }, { name: "South Korea", value: 46 },
      { name: "India", value: 32 },
    ],
    competitors: [
      { name: "QatarEnergy LNG", volume: 78 }, { name: "Cheniere", volume: 45 },
      { name: "Shell LNG", volume: 38 }, { name: "ExxonMobil LNG", volume: 32 },
      { name: "Novatek (Yamal)", volume: 22 }, { name: "Woodside", volume: 18 },
    ],
    netback: [
      { market: "Japan (JKM)", fobJorf: "$11.80", freight: "$1.40", dapPrice: "$13.20", netback: "$11.80", vs30d: "+3.6%" },
      { market: "China (Shanghai)", fobJorf: "$11.80", freight: "$1.20", dapPrice: "$12.80", netback: "$11.60", vs30d: "+4.2%" },
      { market: "Europe (TTF)", fobJorf: "$11.80", freight: "$0.80", dapPrice: "$11.40", netback: "$10.60", vs30d: "+2.1%" },
      { market: "India (Dahej)", fobJorf: "$11.80", freight: "$1.10", dapPrice: "$12.60", netback: "$11.50", vs30d: "+3.4%" },
    ],
    supplyDemand: [
      { category: "World Liquefaction Capacity", y2025: "418", y2026e: "452", vs2025: "+8.1%" },
      { category: "World Demand", y2025: "406", y2026e: "428", vs2025: "+5.4%" },
      { category: "Surplus / (Deficit)", y2025: "12", y2026e: "24", vs2025: "+100%" },
    ],
    competitorDetails: [
      { name: "QatarEnergy LNG", country: "Qatar", marketShare: "21%", strengths: "Lowest cost producer, North Field expansion to 142 Mtpa" },
      { name: "Cheniere Energy", country: "USA", marketShare: "12%", strengths: "Tolling model, US shale linked, Henry Hub flexibility" },
      { name: "Shell LNG", country: "UK / Netherlands", marketShare: "9%", strengths: "Largest portfolio, trading expertise, fleet" },
      { name: "Novatek", country: "Russia", marketShare: "5%", strengths: "Yamal cost, Arctic shipping (sanctions risk)" },
    ],
  },
  optionality: {
    kpis: [
      { label: "Forward Curve (Mid)", value: "$11.80/mmbtu", subtitle: "JKM Q3 2026", change: "+3.4% vs 30d", changeDirection: "up" },
      { label: "Option Value*", value: "$2.40/mmbtu", subtitle: "ATM call, 6M", change: "+12%", changeDirection: "up" },
      { label: "Diversion Optionality", value: "1.8 Mtpa", subtitle: "Open destination", change: "+12%", changeDirection: "up" },
    ],
    forwardCurve: [
      { period: "Q2 26", current: 13.20, m1: 12.80, m3: 12.20 },
      { period: "Q3 26", current: 11.80, m1: 11.50, m3: 11.00 },
      { period: "Q4 26", current: 13.50, m1: 13.10, m3: 12.50 },
      { period: "Q1 27", current: 14.20, m1: 13.80, m3: 13.20 },
      { period: "Q2 27", current: 12.80, m1: 12.40, m3: 11.90 },
      { period: "Q3 27", current: 11.50, m1: 11.20, m3: 10.80 },
    ],
    optionValue: [
      { period: "Q2 2026", value: 1.80 }, { period: "Q3 2026", value: 2.40 },
      { period: "Q4 2026", value: 3.20 }, { period: "Q1 2027", value: 3.60 },
      { period: "Q2 2027", value: 2.20 }, { period: "Q3 2027", value: 1.60 },
    ],
    openDest: [
      { name: "Asia (China/India)", value: 1.0 }, { name: "Europe", value: 0.5 },
      { name: "South America", value: 0.2 }, { name: "Other", value: 0.1 },
    ],
    floatingStock: [
      { region: "Asia (floating)", current: "8", vs30d: "▲ +2", vsLastYear: "▲ +4" },
      { region: "Europe terminals", current: "12", vs30d: "▼ -1", vsLastYear: "▼ -3" },
      { region: "Americas", current: "4", vs30d: "Stable", vsLastYear: "▲ +1" },
      { region: "Middle East transit", current: "6", vs30d: "▲ +1", vsLastYear: "Stable" },
    ],
    scenarios: [
      { scenario: "Base Case", assumption: "Normal winter, JKM forward Q3", netbackImpact: "$11.80", vsBase: "—" },
      { scenario: "Cold Winter Asia", assumption: "Northeast Asia winter +2σ cold", netbackImpact: "$16.50", vsBase: "+$4.70" },
      { scenario: "Mild Winter / Demand Drop", assumption: "Europe storage stays 80%+, Asia mild", netbackImpact: "$8.20", vsBase: "-$3.60" },
      { scenario: "Russia Pipeline Cut", assumption: "Loss of remaining EU pipeline gas", netbackImpact: "$15.40", vsBase: "+$3.60" },
      { scenario: "Panama Disruption", assumption: "Canal restrictions persist 6+ months", netbackImpact: "$13.20", vsBase: "+$1.40" },
    ],
  },
  flows: {
    arbitrage: [
      { type: "JKM-TTF Arbitrage", description: "Divert cargoes between Asia and Europe based on hub spreads", example: "JKM-TTF > $1.50/mmbtu + freight diff → Asia diversion", lever: "Geography + Trading" },
      { type: "Time Spread (Winter Premium)", description: "Store cargoes for winter delivery", example: "Buy summer JKM, sell Q1 JKM forward when spread > $4/mmbtu", lever: "Storage + Timing" },
      { type: "Hub-Oil Index Arbitrage", description: "Switch contract pricing optionality between Brent and JKM", example: "Trigger oil-indexed when Brent slope*pricing < JKM forward", lever: "Contract structure" },
      { type: "Reload / Reverse Trade", description: "Reload European cargoes when Asia premium widens", example: "Reload at Zeebrugge, sell to JKM market when spread justifies", lever: "Logistics + Trading" },
    ],
    insights: [
      { title: "Key Insight", subtitle: "Asia premium", content: "JKM-TTF spread averaging $1.20 supports continued Asia diversion. Each 100k m³ cargo diverted captures $4-6M margin uplift vs Europe delivery." },
      { title: "Key Insight", subtitle: "2026 oversupply risk", content: "Capacity additions (Qatar +32 Mtpa, USA +25 Mtpa by 2027) will pressure spot prices. Lock long-term SPAs now for 2027+." },
      { title: "Key Insight", subtitle: "Charter strategy", content: "LNG carrier rates at $145k/d (top decile). Time-charter 5-7 years at $80-90k/d to lock margins through 2030 build-out." },
    ],
    tradeRoutes: [
      { origin: "Ras Laffan (Qatar)", destination: "Tokyo Bay (Japan)", product: "LNG", volume: "1.8 Mt/qtr", transitDays: "16-20" },
      { origin: "Sabine Pass (USA)", destination: "Zeebrugge (Belgium)", product: "LNG", volume: "1.2 Mt/qtr", transitDays: "14-18" },
      { origin: "Sabine Pass (USA)", destination: "Yangshan (China)", product: "LNG", volume: "0.9 Mt/qtr", transitDays: "32-38 (Cape)" },
      { origin: "Gladstone (Aus)", destination: "Incheon (S. Korea)", product: "LNG", volume: "0.7 Mt/qtr", transitDays: "10-13" },
      { origin: "Yamal (Russia)", destination: "Rotterdam (NL)", product: "LNG", volume: "0.5 Mt/qtr", transitDays: "8-12" },
    ],
  },
  referentiel: {
    ports: [
      { name: "Ras Laffan", location: "Ras Laffan, Qatar", capacityMt: 77, currentUtilization: "96%", products: "LNG, Condensate, LPG", status: "Operational" },
      { name: "Sabine Pass", location: "Cameron Parish, USA", capacityMt: 30, currentUtilization: "92%", products: "LNG", status: "Operational" },
      { name: "Gladstone (QCLNG/APLNG)", location: "Queensland, Australia", capacityMt: 21, currentUtilization: "88%", products: "LNG", status: "Operational" },
      { name: "Yamal", location: "Sabetta, Russia", capacityMt: 17.4, currentUtilization: "76%", products: "LNG (Arctic)", status: "Operational" },
      { name: "Bonny Island", location: "Bonny, Nigeria", capacityMt: 22, currentUtilization: "70%", products: "LNG", status: "Operational" },
    ],
    exportProducts: [
      { name: "LNG (Long-term, oil-indexed)", category: "Liquefied gas", annualCapacity: "~24 Mtpa", currentPrice: "$11.80/mmbtu", mainMarkets: "Japan, Korea, China utilities", unit: "Mtpa" },
      { name: "LNG (Spot, hub-indexed)", category: "Liquefied gas", annualCapacity: "~6 Mtpa", currentPrice: "$13.20/mmbtu (JKM)", mainMarkets: "Asia spot, Europe", unit: "Mtpa" },
      { name: "Condensate", category: "Light hydrocarbon", annualCapacity: "~80 kbpd", currentPrice: "$84/bbl", mainMarkets: "Refineries Asia", unit: "kbpd" },
      { name: "LPG (C3/C4)", category: "Byproduct", annualCapacity: "~3 Mtpa", currentPrice: "$590/t", mainMarkets: "Asian petrochem", unit: "Mtpa" },
    ],
    importMaterials: [
      { name: "Feed Gas (pipeline)", category: "Critical input", annualVolume: "~48 Bcm/y", currentPrice: "$2.85/mmbtu HH", mainSuppliers: "Permian, North Field, Sakhalin", usage: "Liquefaction feed" },
      { name: "Refrigerants (C3/MR)", category: "Process input", annualVolume: "Closed loop", currentPrice: "Capex/maint", mainSuppliers: "Air Liquide, Linde", usage: "Cascade refrigeration" },
      { name: "Electric Power", category: "Energy", annualVolume: "Heavy load", currentPrice: "$60-80/MWh", mainSuppliers: "On-site CCGT + grid", usage: "Compressors, utilities" },
    ],
    suppliers: [
      { name: "QatarEnergy", country: "Qatar", zone: "Middle East", products: "Feed gas (North Field)", contractType: "Long-term", rating: "A+" },
      { name: "Cheniere Marketing", country: "USA", zone: "North America", products: "Tolling capacity", contractType: "Long-term", rating: "A" },
      { name: "Pioneer Natural Resources", country: "USA", zone: "North America", products: "Permian gas", contractType: "Annual contract", rating: "A" },
      { name: "Air Liquide", country: "France", zone: "Global", products: "Refrigerants, gases", contractType: "Long-term", rating: "A+" },
      { name: "Baker Hughes", country: "USA", zone: "Global", products: "Compressors, turbines", contractType: "Project + service", rating: "A" },
    ],
    clients: [
      { name: "JERA", country: "Japan", zone: "Northeast Asia", products: "LNG SPA", annualVolume: "~6 Mtpa", contractType: "Long-term (oil-indexed)" },
      { name: "Tokyo Gas", country: "Japan", zone: "Northeast Asia", products: "LNG SPA", annualVolume: "~3 Mtpa", contractType: "Long-term" },
      { name: "KOGAS", country: "South Korea", zone: "Northeast Asia", products: "LNG SPA", annualVolume: "~5 Mtpa", contractType: "Long-term" },
      { name: "CNOOC Gas & Power", country: "China", zone: "East Asia", products: "LNG SPA + Spot", annualVolume: "~4 Mtpa", contractType: "Long-term + Spot" },
      { name: "Sinopec", country: "China", zone: "East Asia", products: "LNG SPA", annualVolume: "~2.5 Mtpa", contractType: "Long-term" },
      { name: "Shell Trading", country: "UK / Netherlands", zone: "Global", products: "LNG portfolio (trading)", annualVolume: "~3 Mtpa", contractType: "Spot + Contract" },
      { name: "Petronet LNG", country: "India", zone: "South Asia", products: "LNG SPA", annualVolume: "~1.8 Mtpa", contractType: "Long-term" },
      { name: "TotalEnergies Gas & Power", country: "France", zone: "Europe", products: "LNG (hub-indexed)", annualVolume: "~2 Mtpa", contractType: "Long-term (TTF)" },
    ],
  },
  logisticsMappings: {
    destinationCountries: ["Japan", "South Korea", "China", "India", "Netherlands", "Belgium", "Spain", "UK", "France", "Italy", "Turkey", "Pakistan", "Bangladesh"],
    productCodes: ["LNG", "Condensate", "LPG", "Pipeline Gas"],
    vesselStatuses: ["Loading", "Laden Voyage", "At Anchor (Asia)", "Discharging", "Ballast Voyage", "Drydock", "Floating Storage", "Reload", "Diverted"],
    floatingHubs: DEFAULT_FLOATING_HUBS,
  },
};

// ─────────────────────────────────────────────────────────────────
// GRAINS (Soft commodities — Wheat / Corn / Soybean)
// ─────────────────────────────────────────────────────────────────
const grains: CommodityPreset = {
  id: "grains",
  label: "Soft Commodities — Grains",
  shortLabel: "Grains",
  description: "Wheat, Corn, Soybean — Black Sea, Brazil, USA exports.",
  defaultCompanyName: "Commohedge Agri",
  currency: "USD",
  unit: "Mt",
  overview: {
    kpis: [
      { label: "Total Origination", value: "48.5 Mt", change: "+4.8% vs 2025", changeDirection: "up", subtitle: "Wheat + Corn + Soy" },
      { label: "Revenue", value: "$15.2 Bn", change: "+6.3% vs 2025", changeDirection: "up", subtitle: "2026 YTD" },
      { label: "CBOT Soybean", value: "$13.45/bu", change: "+2.8% YTD", changeDirection: "up", subtitle: "Front-month" },
      { label: "Wheat (FOB Black Sea)", value: "$245/t", change: "-3.2%", changeDirection: "down", subtitle: "12.5% protein" },
      { label: "Corn (FOB Santos)", value: "$215/t", change: "+1.4%", changeDirection: "up", subtitle: "Brazil export" },
      { label: "Crush Margin (Soy)", value: "$48/t", change: "+$8 vs 30d", changeDirection: "up", subtitle: "Meal+oil-bean" },
    ],
    storage: [
      { country: "China", inStock: 42.0, inTransit: 8.5, planned: 12.0 },
      { country: "Egypt", inStock: 8.2, inTransit: 3.4, planned: 4.5 },
      { country: "EU-27", inStock: 28.5, inTransit: 5.8, planned: 7.2 },
      { country: "Mexico", inStock: 4.8, inTransit: 2.6, planned: 3.4 },
      { country: "Indonesia", inStock: 3.6, inTransit: 1.8, planned: 2.4 },
    ],
    demand: [
      { country: "China", y2025: 124, y2026ytd: 68, y2026f: 130 },
      { country: "EU-27", y2025: 85, y2026ytd: 45, y2026f: 88 },
      { country: "Mexico", y2025: 42, y2026ytd: 23, y2026f: 44 },
      { country: "Egypt", y2025: 22, y2026ytd: 12, y2026f: 23 },
      { country: "Indonesia", y2025: 18, y2026ytd: 10, y2026f: 19 },
    ],
    forecast: [
      { country: "China", arrivals: 11.0, shipments: 9.8, startingStock: 42.0, endingStock: 43.2 },
      { country: "EU-27", arrivals: 7.6, shipments: 7.2, startingStock: 28.5, endingStock: 28.9 },
      { country: "Mexico", arrivals: 3.8, shipments: 3.4, startingStock: 4.8, endingStock: 5.2 },
      { country: "Egypt", arrivals: 2.0, shipments: 1.8, startingStock: 8.2, endingStock: 8.4 },
    ],
    imports: [
      { material: "Origination Logistics", volume: "Heavy load", suppliers: "Class I rail, river barges (Mississippi, Paraná)", usage: "Field-to-port" },
      { material: "Phytosanitary / QC", volume: "Per cargo", suppliers: "SGS, Cotecna, Bureau Veritas", usage: "Quality certification" },
      { material: "Bunker Fuel", volume: "Per voyage", suppliers: "Shell, BP, Chevron, regional", usage: "Vessel propulsion" },
    ],
    exports: [
      { product: "Soybean", volume: "~22 Mt", mainMarkets: "China, EU, SE Asia", share: "45%" },
      { product: "Corn", volume: "~16 Mt", mainMarkets: "Mexico, Japan, China, EU", share: "33%" },
      { product: "Wheat (HRW + SRW)", volume: "~7.5 Mt", mainMarkets: "Egypt, Algeria, Indonesia, Nigeria", share: "16%" },
      { product: "Soybean Meal", volume: "~2.8 Mt", mainMarkets: "EU livestock, SE Asia", share: "5%" },
      { product: "Soybean Oil", volume: "~0.6 Mt", mainMarkets: "India, MENA", share: "1%" },
    ],
  },
  supply: {
    kpis: [
      { label: "Origination Volume", value: "48.5 Mt", subtitle: "Trailing 12M", change: "+4.8%", changeDirection: "up" },
      { label: "Elevator Utilization", value: "82%", subtitle: "US + Brazil network", change: "+4 pp", changeDirection: "up" },
      { label: "Vessel Loadings (LTM)", value: "640", subtitle: "Avg 60kt cargo", change: "+6%", changeDirection: "up" },
      { label: "Forward Sales Coverage", value: "72%", subtitle: "of 2026 origination", change: "+8 pp", changeDirection: "up" },
      { label: "Crush Capacity Util.", value: "88%", subtitle: "Owned soy crush", change: "+2 pp", changeDirection: "up" },
      { label: "Farm Gate Premium", value: "$12/t", subtitle: "Above local cash", change: "+$3", changeDirection: "up" },
    ],
    production: [
      { month: "Jan 2026", volume: 4.2 },
      { month: "Feb 2026", volume: 5.8 },
      { month: "Mar 2026", volume: 6.5 },
      { month: "Apr 2026", volume: 5.2 },
      { month: "May 2026", volume: 3.8 },
      { month: "Jun 2026", volume: 3.2 },
      { month: "Jul 2026", volume: 2.8 },
      { month: "Aug 2026", volume: 3.4 },
    ],
    volumeByStatus: [
      { name: "Originated - Available", value: 12.4, pct: "26%", change: "▲ +5%" },
      { name: "Forward Sold (Hedged)", value: 24.8, pct: "51%", change: "▲ +6%" },
      { name: "Open / Spot", value: 6.2, pct: "13%", change: "▲ +14%" },
      { name: "In Transit", value: 5.1, pct: "10%", change: "▲ +2%" },
    ],
    ports: [
      { port: "Santos (BR)", utilization: "92%", next7: "8 / 9", next30: "30 / 34" },
      { port: "Paranaguá (BR)", utilization: "85%", next7: "5 / 6", next30: "20 / 24" },
      { port: "New Orleans (USA)", utilization: "78%", next7: "6 / 8", next30: "22 / 28" },
      { port: "Rosario (AR)", utilization: "82%", next7: "4 / 5", next30: "16 / 20" },
      { port: "Constanta (RO)", utilization: "70%", next7: "3 / 5", next30: "12 / 18" },
    ],
    vessels: { inPort: 11, atSea: 18, charterOptions: 7 },
    constraints: [
      { constraint: "Mississippi River Levels", details: "Low water restrictions on barge drafts (-15% capacity)", severity: "high" },
      { constraint: "Brazil Trucking", details: "Diesel costs + driver shortage delaying inland transport", severity: "medium" },
      { constraint: "Argentina Soy Strike", details: "Crush worker stoppage, 5-day delay risk", severity: "medium" },
      { constraint: "Black Sea Insurance", details: "War-risk premium adds $8-12/t to FOB", severity: "high" },
      { constraint: "China GMO Rules", details: "New protocol delays specific origin approvals", severity: "low" },
    ],
    rawMaterials: [
      { material: "Diesel (US Gulf)", currentPrice: "$2.85/gal", vs30d: "▲ +3%", trend: "Rising" },
      { material: "Fertilizer (DAP)", currentPrice: "$610/t", vs30d: "▲ +4%", trend: "Rising" },
      { material: "Panamax Charter", currentPrice: "$22k/d", vs30d: "▼ -8%", trend: "Easing" },
      { material: "Bunker (VLSFO)", currentPrice: "$580/t", vs30d: "▲ +3%", trend: "Stable" },
    ],
  },
  pipeline: {
    kpis: [
      { label: "Forward Sold", value: "24.8 Mt", subtitle: "51% of book", change: "+6%", changeDirection: "up" },
      { label: "Open Tonnage", value: "6.2 Mt", subtitle: "13% of book", change: "+14%", changeDirection: "up" },
      { label: "Hedged via Futures", value: "32 Mt", subtitle: "CBOT + MATIF", change: "+9%", changeDirection: "up" },
      { label: "Order Book Days", value: "58 days", subtitle: "of origination", change: "+6 days", changeDirection: "up" },
      { label: "Pipeline Value", value: "$10.8 Bn", subtitle: "at FOB forward", change: "+7.8%", changeDirection: "up" },
    ],
    coverage: [
      { month: "Jan", days: 42 }, { month: "Feb", days: 46 }, { month: "Mar", days: 50 },
      { month: "Apr", days: 53 }, { month: "May", days: 55 }, { month: "Jun", days: 56 },
      { month: "Jul", days: 58 },
    ],
    maturity: [
      { period: "Apr 2026", confirmed: 6.2, unassigned: 1.8, openDest: 0.8 },
      { period: "May 2026", confirmed: 5.4, unassigned: 1.6, openDest: 0.7 },
      { period: "Jun 2026", confirmed: 4.8, unassigned: 1.4, openDest: 0.6 },
      { period: "Jul 2026", confirmed: 3.6, unassigned: 1.2, openDest: 0.5 },
      { period: "Aug 2026", confirmed: 2.4, unassigned: 0.8, openDest: 0.3 },
    ],
    destinations: [
      { name: "China", value: 11.0, netback: 442 },
      { name: "EU-27", value: 7.6, netback: 462 },
      { name: "Mexico", value: 3.8, netback: 218 },
      { name: "Egypt", value: 2.0, netback: 248 },
      { name: "SE Asia", value: 3.4, netback: 245 },
      { name: "Other", value: 2.2, netback: 232 },
    ],
    statusRows: [
      { status: "Forward Sold (Hedged)", volume: "24,800", pct: "51%", change: "▲ +6%", netback: "$432" },
      { status: "Originated Available", volume: "12,400", pct: "26%", change: "▲ +5%", netback: "—" },
      { status: "Open / Spot", volume: "6,200", pct: "13%", change: "▲ +14%", netback: "—" },
      { status: "In Transit", volume: "5,100", pct: "10%", change: "▲ +2%", netback: "$418" },
    ],
    clientsByRegion: [
      { region: "China", share: "30-35%", clients: "COFCO, Sinograin, Shandong Bohi, Yihai Kerry", products: "Soybean, Corn" },
      { region: "Europe (EU-27)", share: "20-25%", clients: "Cargill EU, Bunge EU, ADM Hamburg, animal feed mills", products: "Soymeal, Wheat, Corn" },
      { region: "MENA", share: "12-15%", clients: "GASC (Egypt), OAIC (Algeria), Saudi Grains", products: "Wheat (milling)" },
      { region: "LatAm + Mexico", share: "10-12%", clients: "Bimbo, Maseca, Mexican feed industry", products: "Corn (yellow #2)" },
      { region: "SE Asia + India", share: "12-15%", clients: "Wilmar, Olam, Charoen Pokphand", products: "Soybean, Soyoil, Wheat" },
    ],
  },
  market: {
    kpis: [
      { label: "Global Demand (2026)", value: "1,180 Mt", subtitle: "Wheat+Corn+Soy", change: "+2.8% vs 2025", changeDirection: "up" },
      { label: "Stocks-to-Use", value: "26.4%", subtitle: "Global wheat", change: "-1.8 pp", changeDirection: "down" },
      { label: "Crush Margin (CBOT)", value: "$48/t", subtitle: "Soy meal+oil-bean", change: "+$8", changeDirection: "up" },
      { label: "Vol (30d)", value: "18.2%", subtitle: "Soybean annualized", change: "+2.1 pp", changeDirection: "up" },
    ],
    prices: [
      { period: "Oct 25", tampa: 1320, india: 218, jorf: 252 },
      { period: "Nov 25", tampa: 1340, india: 220, jorf: 248 },
      { period: "Dec 25", tampa: 1360, india: 215, jorf: 245 },
      { period: "Jan 26", tampa: 1380, india: 212, jorf: 243 },
      { period: "Feb 26", tampa: 1395, india: 215, jorf: 244 },
      { period: "Mar 26", tampa: 1410, india: 218, jorf: 245 },
      { period: "Apr 26", tampa: 1345, india: 215, jorf: 245 },
    ],
    inventory: [
      { period: "Jan 26", global: 28, india: 14, brazil: 12, na: 32 },
      { period: "Apr 26", global: 26, india: 13, brazil: 11, na: 30 },
      { period: "Jul 26", global: 24, india: 12, brazil: 9, na: 28 },
      { period: "Oct 26", global: 30, india: 16, brazil: 14, na: 35 },
      { period: "Jan 27", global: 28, india: 14, brazil: 12, na: 33 },
    ],
    demandByRegion: [
      { name: "China", value: 130 }, { name: "EU-27", value: 88 },
      { name: "Mexico", value: 44 }, { name: "Egypt", value: 23 },
      { name: "Indonesia", value: 19 },
    ],
    competitors: [
      { name: "Cargill", volume: 145 }, { name: "ADM", volume: 118 },
      { name: "Bunge", volume: 98 }, { name: "Louis Dreyfus (LDC)", volume: 82 },
      { name: "COFCO International", volume: 68 }, { name: "Viterra", volume: 52 },
    ],
    netback: [
      { market: "China (Soy)", fobJorf: "$432", freight: "$42", dapPrice: "$485", netback: "$443", vs30d: "+3.2%" },
      { market: "EU (Soymeal)", fobJorf: "$462", freight: "$32", dapPrice: "$520", netback: "$488", vs30d: "+2.8%" },
      { market: "Egypt (Wheat)", fobJorf: "$245", freight: "$22", dapPrice: "$278", netback: "$256", vs30d: "+1.4%" },
      { market: "Mexico (Corn)", fobJorf: "$215", freight: "$25", dapPrice: "$248", netback: "$223", vs30d: "+2.1%" },
    ],
    supplyDemand: [
      { category: "World Production", y2025: "1,168", y2026e: "1,205", vs2025: "+3.2%" },
      { category: "World Demand", y2025: "1,148", y2026e: "1,180", vs2025: "+2.8%" },
      { category: "Surplus", y2025: "20", y2026e: "25", vs2025: "+25%" },
    ],
    competitorDetails: [
      { name: "Cargill", country: "USA", marketShare: "12%", strengths: "Largest private trader, full origination network" },
      { name: "ADM", country: "USA", marketShare: "10%", strengths: "Crush + processing, US heartland" },
      { name: "Bunge", country: "USA / Switzerland", marketShare: "8%", strengths: "Brazil + Argentina origination, Viterra merger" },
      { name: "Louis Dreyfus", country: "Netherlands", marketShare: "7%", strengths: "Asian distribution, hedging strength" },
      { name: "COFCO International", country: "China", marketShare: "6%", strengths: "China demand integration, S America origination" },
    ],
  },
  optionality: {
    kpis: [
      { label: "Forward Curve (Mid)", value: "$13.45/bu", subtitle: "CBOT Soy Q3 2026", change: "+2.8% vs 30d", changeDirection: "up" },
      { label: "Option Value*", value: "$0.85/bu", subtitle: "ATM call, 6M soy", change: "+15%", changeDirection: "up" },
      { label: "Open Tonnage", value: "6.2 Mt", subtitle: "13% of pipeline", change: "+14%", changeDirection: "up" },
    ],
    forwardCurve: [
      { period: "Q2 26", current: 13.20, m1: 13.05, m3: 12.80 },
      { period: "Q3 26", current: 13.45, m1: 13.25, m3: 12.95 },
      { period: "Q4 26", current: 13.65, m1: 13.45, m3: 13.10 },
      { period: "Q1 27", current: 13.85, m1: 13.60, m3: 13.20 },
      { period: "Q2 27", current: 13.55, m1: 13.30, m3: 12.95 },
      { period: "Q3 27", current: 13.30, m1: 13.10, m3: 12.80 },
    ],
    optionValue: [
      { period: "Q2 2026", value: 0.65 }, { period: "Q3 2026", value: 0.85 },
      { period: "Q4 2026", value: 0.95 }, { period: "Q1 2027", value: 0.88 },
      { period: "Q2 2027", value: 0.72 }, { period: "Q3 2027", value: 0.58 },
    ],
    openDest: [
      { name: "China", value: 2.4 }, { name: "EU", value: 1.6 },
      { name: "MENA", value: 0.9 }, { name: "SE Asia", value: 0.8 }, { name: "Other", value: 0.5 },
    ],
    floatingStock: [
      { region: "China bonded", current: "8", vs30d: "▲ +1", vsLastYear: "▲ +2" },
      { region: "EU mills inventory", current: "4", vs30d: "Stable", vsLastYear: "▼ -1" },
      { region: "Brazil port", current: "6", vs30d: "▼ -1", vsLastYear: "▲ +1" },
      { region: "Argentina silos", current: "3", vs30d: "▲ +1", vsLastYear: "Stable" },
    ],
    scenarios: [
      { scenario: "Base Case", assumption: "USDA WASDE forecast, normal weather", netbackImpact: "$13.45/bu", vsBase: "—" },
      { scenario: "Drought USA", assumption: "La Niña + US Midwest -10% yield", netbackImpact: "$15.80/bu", vsBase: "+$2.35" },
      { scenario: "Bumper Brazil", assumption: "Brazil safrinha record + USA normal", netbackImpact: "$11.80/bu", vsBase: "-$1.65" },
      { scenario: "China Stockpiling", assumption: "China reserves rebuild +20Mt soy", netbackImpact: "$14.60/bu", vsBase: "+$1.15" },
      { scenario: "Black Sea Disruption", assumption: "Russia/Ukraine conflict escalation", netbackImpact: "$14.40/bu", vsBase: "+$0.95" },
    ],
  },
  flows: {
    arbitrage: [
      { type: "US Gulf vs Brazil Arbitrage", description: "Origin switch based on FOB spread", example: "When Santos < NOLA by $20/t for soy, sell Brazil cargoes to Asia", lever: "Geography + Origination" },
      { type: "Crush Arbitrage", description: "Crush bean → meal+oil when margin > $40/t", example: "Lock CBOT crush spread when board crush > $50/t", lever: "Industrial + Hedging" },
      { type: "Wheat Quality Arbitrage", description: "Blend HRW (US) with SRW or Black Sea wheat for spec match", example: "Blend 60/40 HRW/Russian to hit Egypt 12.5% protein at lower cost", lever: "Quality + Blending" },
      { type: "Carry Trade (Storage)", description: "Store grain when futures > spot + carry cost", example: "Lock May/Jul futures spread when > $0.15/bu storage cost", lever: "Storage + Financing" },
      { type: "Basis Trading", description: "Buy farm at low basis, sell FOB high basis", example: "Buy Mato Grosso at -120 basis, sell Santos at +40 basis", lever: "Logistics + Timing" },
    ],
    insights: [
      { title: "Key Insight", subtitle: "Origin Arbitrage", content: "Brazil Q1-Q2 cheaper than US Gulf by $18/t for soy. With 6.2 Mt open tonnage, captures ~$110M margin uplift if directed to Asia from Brazil vs USA." },
      { title: "Key Insight", subtitle: "Crush Margin", content: "CBOT board crush at $48/t (top quartile). Lock 6-month crush via futures + soybean buying programs to capture ~$140M on owned crush capacity." },
      { title: "Key Insight", subtitle: "Black Sea Risk", content: "Insurance + war risk add $8-12/t to Black Sea FOB. North African buyers shifting to Brazil/EU origin — opportunity to capture displaced volumes at premium." },
    ],
    tradeRoutes: [
      { origin: "Santos (BR)", destination: "Qingdao (China)", product: "Soybean", volume: "1.8 Mt/qtr", transitDays: "32-38" },
      { origin: "New Orleans (USA)", destination: "Hamburg (DE)", product: "Soymeal", volume: "0.8 Mt/qtr", transitDays: "16-20" },
      { origin: "Constanta (RO)", destination: "Alexandria (EG)", product: "Wheat", volume: "0.6 Mt/qtr", transitDays: "5-7" },
      { origin: "Rosario (AR)", destination: "Veracruz (MX)", product: "Corn", volume: "0.5 Mt/qtr", transitDays: "22-26" },
      { origin: "Paranaguá (BR)", destination: "Rotterdam (NL)", product: "Soymeal", volume: "0.4 Mt/qtr", transitDays: "18-22" },
    ],
  },
  referentiel: {
    ports: [
      { name: "Santos", location: "Santos, Brazil", capacityMt: 36, currentUtilization: "92%", products: "Soybean, Soymeal, Sugar, Corn", status: "Operational" },
      { name: "Paranaguá", location: "Paraná, Brazil", capacityMt: 22, currentUtilization: "85%", products: "Soybean, Corn, Soymeal", status: "Operational" },
      { name: "New Orleans (Mississippi)", location: "Louisiana, USA", capacityMt: 65, currentUtilization: "78%", products: "Corn, Soybean, Wheat", status: "Operational" },
      { name: "Rosario", location: "Santa Fe, Argentina", capacityMt: 32, currentUtilization: "82%", products: "Soybean, Soymeal, Soyoil, Corn", status: "Operational" },
      { name: "Constanta", location: "Constanta, Romania", capacityMt: 14, currentUtilization: "70%", products: "Wheat, Corn, Sunflower", status: "Operational" },
    ],
    exportProducts: [
      { name: "Soybean (US #2 Yellow)", category: "Oilseed", annualCapacity: "~22 Mt", currentPrice: "$432/t FOB", mainMarkets: "China, EU, SE Asia", unit: "Mt" },
      { name: "Corn (US #2 Yellow / Brazil)", category: "Coarse grain", annualCapacity: "~16 Mt", currentPrice: "$215/t FOB", mainMarkets: "Mexico, Japan, China, EU", unit: "Mt" },
      { name: "Wheat (HRW 12.5% / SRW)", category: "Milling grain", annualCapacity: "~7.5 Mt", currentPrice: "$245/t FOB", mainMarkets: "Egypt, Algeria, Indonesia, Nigeria", unit: "Mt" },
      { name: "Soybean Meal (48% protein)", category: "Crush product", annualCapacity: "~2.8 Mt", currentPrice: "$420/t FOB", mainMarkets: "EU livestock, SE Asia", unit: "Mt" },
      { name: "Soybean Oil (degummed)", category: "Crush product", annualCapacity: "~0.6 Mt", currentPrice: "$1,150/t FOB", mainMarkets: "India, MENA biodiesel", unit: "Mt" },
    ],
    importMaterials: [
      { name: "Inland Logistics (rail/barge/truck)", category: "Critical input", annualVolume: "Heavy load", currentPrice: "Variable", mainSuppliers: "BNSF, Union Pacific, ADM Trucking, CNN", usage: "Field-to-port movement" },
      { name: "Phytosanitary Inspection", category: "Service", annualVolume: "Per cargo", currentPrice: "$3-5/t", mainSuppliers: "SGS, Cotecna, Bureau Veritas", usage: "Quality / origin certification" },
      { name: "Storage / Elevator Fees", category: "Storage", annualVolume: "Variable", currentPrice: "$0.04/bu/mo", mainSuppliers: "Owned + leased terminals", usage: "Position holding" },
    ],
    suppliers: [
      { name: "American Farm Bureau Coops", country: "USA", zone: "North America", products: "Soybean, Corn, Wheat", contractType: "Annual contract", rating: "A" },
      { name: "Mato Grosso producers", country: "Brazil", zone: "South America", products: "Soybean, Corn (safrinha)", contractType: "Forward contract", rating: "A" },
      { name: "Argentine cooperatives (CRA, FAA)", country: "Argentina", zone: "South America", products: "Soybean, Corn, Wheat", contractType: "Spot + Contract", rating: "B+" },
      { name: "Russian / Ukrainian elevators", country: "Russia / Ukraine", zone: "Black Sea", products: "Wheat, Corn, Sunflower", contractType: "Spot", rating: "B" },
      { name: "Class I Railroads (BNSF, UP)", country: "USA", zone: "North America", products: "Rail logistics", contractType: "Tariff + Contract", rating: "A" },
    ],
    clients: [
      { name: "COFCO International", country: "China", zone: "East Asia", products: "Soybean, Corn", annualVolume: "~6 Mt", contractType: "Long-term" },
      { name: "Sinograin", country: "China", zone: "East Asia", products: "Wheat, Corn (state reserve)", annualVolume: "~3 Mt", contractType: "Government" },
      { name: "GASC (General Authority for Supply Commodities)", country: "Egypt", zone: "MENA", products: "Wheat (milling)", annualVolume: "~2 Mt", contractType: "Tender" },
      { name: "Bunge Loders Croklaan (EU)", country: "Netherlands", zone: "Europe", products: "Soyoil, Soymeal", annualVolume: "~0.8 Mt", contractType: "Annual contract" },
      { name: "Cargill EU Animal Nutrition", country: "Germany", zone: "Europe", products: "Soymeal, Corn", annualVolume: "~1.2 Mt", contractType: "Long-term" },
      { name: "Maseca / Bimbo", country: "Mexico", zone: "North America", products: "Corn (yellow + white)", annualVolume: "~1.5 Mt", contractType: "Annual contract" },
      { name: "Wilmar International", country: "Singapore", zone: "SE Asia", products: "Soybean, Soyoil", annualVolume: "~1.4 Mt", contractType: "Long-term" },
      { name: "Charoen Pokphand (CP)", country: "Thailand", zone: "SE Asia", products: "Corn, Soymeal", annualVolume: "~0.9 Mt", contractType: "Annual contract" },
    ],
  },
  logisticsMappings: {
    destinationCountries: ["China", "Egypt", "Mexico", "Indonesia", "Japan", "South Korea", "EU-27", "Algeria", "Nigeria", "Vietnam", "Philippines", "Pakistan", "India", "Turkey"],
    productCodes: ["Soybean", "Corn", "Wheat HRW", "Wheat SRW", "Soymeal", "Soyoil", "Sunflower"],
    vesselStatuses: ["Loading", "Anchorage", "Sailing", "At Discharge Port", "Discharging", "Free Pratique", "Cleared", "Demurrage", "Floating Storage"],
    floatingHubs: DEFAULT_FLOATING_HUBS,
  },
};

// ─────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────
export const COMMODITY_PRESETS: Record<CommodityMode, CommodityPreset> = {
  phosphates,
  copper,
  lng,
  grains,
};

export const COMMODITY_PRESET_LIST: CommodityPreset[] = [phosphates, copper, lng, grains];

export function getPreset(mode: CommodityMode): CommodityPreset {
  return COMMODITY_PRESETS[mode] ?? phosphates;
}
