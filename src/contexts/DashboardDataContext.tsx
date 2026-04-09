import { createContext, useContext, useState, ReactNode, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────
export interface OverviewData {
  kpis: { label: string; value: string; change: string; changeDirection: "up" | "down" | "neutral"; subtitle?: string }[];
  storage: { country: string; inStock: number; inTransit: number; planned: number }[];
  demand: { country: string; y2025: number; y2026ytd: number; y2026f: number }[];
  forecast: { country: string; arrivals: number; shipments: number; startingStock: number; endingStock: number }[];
}

export interface SupplyData {
  kpis: { label: string; value: string; subtitle: string; change: string; changeDirection: "up" | "down" | "neutral" }[];
  production: { month: string; volume: number }[];
  volumeByStatus: { name: string; value: number; pct: string; change: string }[];
  ports: { port: string; utilization: string; next7: string; next30: string }[];
  vessels: { inPort: number; atSea: number; charterOptions: number };
  constraints: { constraint: string; details: string; severity: "low" | "medium" | "high" }[];
}

export interface PipelineData {
  kpis: { label: string; value: string; subtitle: string; change: string; changeDirection: "up" | "down" | "neutral" }[];
  coverage: { month: string; days: number }[];
  maturity: { period: string; confirmed: number; unassigned: number; openDest: number }[];
  destinations: { name: string; value: number; netback: number }[];
  statusRows: { status: string; volume: string; pct: string; change: string; netback: string }[];
}

export interface MarketData {
  kpis: { label: string; value: string; subtitle: string; change: string; changeDirection: "up" | "down" | "neutral" }[];
  prices: { period: string; tampa: number; india: number; jorf: number }[];
  inventory: { period: string; global: number; india: number; brazil: number; na: number }[];
  demandByRegion: { name: string; value: number }[];
  competitors: { name: string; volume: number }[];
  netback: { market: string; fobJorf: string; freight: string; dapPrice: string; netback: string; vs30d: string }[];
  supplyDemand: { category: string; y2025: string; y2026e: string; vs2025: string }[];
}

export interface OptionalityData {
  kpis: { label: string; value: string; subtitle: string; change: string; changeDirection: "up" | "down" | "neutral" }[];
  forwardCurve: { period: string; current: number; m1: number; m3: number }[];
  optionValue: { period: string; value: number }[];
  openDest: { name: string; value: number }[];
  floatingStock: { region: string; current: string; vs30d: string; vsLastYear: string }[];
  scenarios: { scenario: string; assumption: string; netbackImpact: string; vsBase: string }[];
}

export interface FlowsData {
  arbitrage: { type: string; description: string; example: string; lever: string }[];
  insights: { title: string; subtitle: string; content: string }[];
}

export interface DashboardConfig {
  general: { companyName: string; dashboardDate: string; currency: string };
  overview: OverviewData;
  supply: SupplyData;
  pipeline: PipelineData;
  market: MarketData;
  optionality: OptionalityData;
  flows: FlowsData;
}

// ── Default Data ──────────────────────────────────────────────
const defaultConfig: DashboardConfig = {
  general: { companyName: "COMMOHEDGE", dashboardDate: "02/04/2026", currency: "USD" },
  overview: {
    kpis: [
      { label: "Total Stock", value: "6.4 Mt", change: "+5% vs last month", changeDirection: "up" },
      { label: "In Transit", value: "2.1 Mt", change: "+3% vs last month", changeDirection: "up" },
      { label: "Storage Capacity", value: "8.9 Mt", change: "", changeDirection: "neutral", subtitle: "71.9% utilization" },
      { label: "Avg. Lead Time", value: "41 days", change: "-2 days vs avg", changeDirection: "down" },
    ],
    storage: [
      { country: "Brazil", inStock: 1250, inTransit: 650, planned: 700 },
      { country: "India", inStock: 1750, inTransit: 300, planned: 450 },
      { country: "US", inStock: 950, inTransit: 400, planned: 650 },
    ],
    demand: [
      { country: "Brazil", y2025: 3200, y2026ytd: 2400, y2026f: 3000 },
      { country: "US", y2025: 2100, y2026ytd: 1700, y2026f: 2200 },
      { country: "India", y2025: 4300, y2026ytd: 2000, y2026f: 4400 },
    ],
    forecast: [
      { country: "Brazil", arrivals: 900, shipments: 400, startingStock: 1900, endingStock: 1900 },
      { country: "US", arrivals: 300, shipments: 450, startingStock: 1000, endingStock: 1000 },
      { country: "India", arrivals: 500, shipments: 600, startingStock: 2000, endingStock: 2000 },
    ],
  },
  supply: {
    kpis: [
      { label: "Available Volume", value: "2.6 Mt", subtitle: "Next 30 days", change: "+8% vs last 30d", changeDirection: "up" },
      { label: "Loading Utilization", value: "72%", subtitle: "Next 30 days", change: "+5 pp", changeDirection: "up" },
      { label: "Loading Slots", value: "12", subtitle: "1.8 Mt capacity", change: "+2 vs last 30d", changeDirection: "up" },
      { label: "Committed", value: "3.4 Mt", subtitle: "Next 30 days", change: "+4%", changeDirection: "up" },
      { label: "Pipeline Coverage", value: "54 Days", subtitle: "of sales", change: "+6 days", changeDirection: "up" },
      { label: "Storage Utilization", value: "68%", subtitle: "Across OCP sites", change: "+3 pp", changeDirection: "up" },
    ],
    production: [
      { month: "Apr 2026", volume: 1700 },
      { month: "May 2026", volume: 1850 },
      { month: "Jun 2026", volume: 2000 },
      { month: "Jul 2026", volume: 2150 },
      { month: "Aug 2026", volume: 2300 },
      { month: "Sep 2026", volume: 2400 },
    ],
    volumeByStatus: [
      { name: "Available", value: 2600, pct: "33%", change: "▲ +8%" },
      { name: "Committed", value: 3400, pct: "43%", change: "▲ +4%" },
      { name: "Open Dest.", value: 1200, pct: "15%", change: "▲ +7%" },
      { name: "In Transit", value: 700, pct: "9%", change: "▼ -3%" },
    ],
    ports: [
      { port: "Jorf Lasfar", utilization: "78%", next7: "3 / 5", next30: "11 / 16" },
      { port: "Safi", utilization: "65%", next7: "2 / 4", next30: "7 / 12" },
      { port: "Casablanca", utilization: "58%", next7: "1 / 2", next30: "3 / 6" },
    ],
    vessels: { inPort: 6, atSea: 8, charterOptions: 4 },
    constraints: [
      { constraint: "Port Congestion", details: "Jorf Lasfar waiting time ~ 1.8 days", severity: "medium" },
      { constraint: "Storage", details: "Youssoufia storage at 85%", severity: "high" },
      { constraint: "Vessel Availability", details: "Limited Supramax in next 10 days", severity: "low" },
    ],
  },
  pipeline: {
    kpis: [
      { label: "Confirmed Volume", value: "3.4 Mt", subtitle: "43% of total", change: "+4% vs last 30d", changeDirection: "up" },
      { label: "Unassigned", value: "2.6 Mt", subtitle: "33% of total", change: "+8%", changeDirection: "up" },
      { label: "Open Destination", value: "1.2 Mt", subtitle: "15% of total", change: "+7%", changeDirection: "up" },
      { label: "Pipeline Coverage", value: "54 Days", subtitle: "of sales", change: "+6 days", changeDirection: "up" },
      { label: "Pipeline Value", value: "$2.18 B", subtitle: "at spot prices", change: "+5%", changeDirection: "up" },
    ],
    coverage: [
      { month: "Apr", days: 40 }, { month: "May", days: 42 }, { month: "Jun", days: 45 },
      { month: "Jul", days: 48 }, { month: "Aug", days: 50 }, { month: "Sep", days: 52 }, { month: "Oct", days: 54 },
    ],
    maturity: [
      { period: "Apr 2026", confirmed: 1.2, unassigned: 0.8, openDest: 0.5 },
      { period: "May 2026", confirmed: 1.0, unassigned: 0.9, openDest: 0.4 },
      { period: "Jul 2026", confirmed: 0.8, unassigned: 0.6, openDest: 0.2 },
      { period: "Aug 2026", confirmed: 0.3, unassigned: 0.2, openDest: 0.1 },
      { period: "Sep 2026", confirmed: 0.1, unassigned: 0.1, openDest: 0.0 },
    ],
    destinations: [
      { name: "Brazil", value: 1200, netback: 625 },
      { name: "India", value: 900, netback: 610 },
      { name: "USA", value: 700, netback: 600 },
      { name: "Others", value: 600, netback: 590 },
    ],
    statusRows: [
      { status: "Confirmed", volume: "3,400", pct: "43%", change: "▲ +4%", netback: "$620" },
      { status: "Unassigned", volume: "2,600", pct: "33%", change: "▲ +8%", netback: "—" },
      { status: "Open Destination", volume: "1,200", pct: "15%", change: "▲ +7%", netback: "—" },
      { status: "In Transit", volume: "700", pct: "9%", change: "▼ -3%", netback: "$610" },
    ],
  },
  market: {
    kpis: [
      { label: "Global Demand (2026)", value: "8.6 Mt", subtitle: "Forecast", change: "+3.2% vs 2025", changeDirection: "up" },
      { label: "Global Inventory", value: "20.1 Mt", subtitle: "68 days of supply", change: "+5.1% vs 30d", changeDirection: "up" },
      { label: "Avg. Netback (Blended)", value: "$615/t", subtitle: "FOB Jorf Lasfar", change: "+4.8%", changeDirection: "up" },
      { label: "Price Volatility (30D)", value: "16%", subtitle: "Annualized", change: "-1.2 pp", changeDirection: "down" },
    ],
    prices: [
      { period: "Apr", tampa: 650, india: 570, jorf: 530 },
      { period: "May", tampa: 660, india: 580, jorf: 540 },
      { period: "Jun", tampa: 670, india: 590, jorf: 550 },
      { period: "Jul", tampa: 680, india: 600, jorf: 560 },
      { period: "Aug", tampa: 690, india: 610, jorf: 570 },
      { period: "Sep", tampa: 695, india: 615, jorf: 575 },
    ],
    inventory: [
      { period: "Apr 26", global: 68, india: 52, brazil: 35, na: 20 },
      { period: "Jul 26", global: 66, india: 51, brazil: 34, na: 20 },
      { period: "Oct 26", global: 69, india: 55, brazil: 38, na: 22 },
      { period: "Jan 27", global: 63, india: 50, brazil: 34, na: 20 },
      { period: "Apr 27", global: 67, india: 54, brazil: 37, na: 21 },
    ],
    demandByRegion: [
      { name: "India", value: 3300 }, { name: "Brazil", value: 2200 },
      { name: "N. America", value: 1700 }, { name: "Europe", value: 1000 }, { name: "Other", value: 400 },
    ],
    competitors: [
      { name: "OCP", volume: 8.6 }, { name: "Mosaic", volume: 6.8 },
      { name: "Nutrien", volume: 4.2 }, { name: "Others", volume: 3.4 },
    ],
    netback: [
      { market: "USA", fobJorf: "$530", freight: "$120", dapPrice: "$650", netback: "$530", vs30d: "+5.1%" },
      { market: "India", fobJorf: "$530", freight: "$90", dapPrice: "$615", netback: "$615", vs30d: "+4.2%" },
      { market: "Brazil", fobJorf: "$530", freight: "$70", dapPrice: "$575", netback: "$575", vs30d: "+3.0%" },
      { market: "Europe", fobJorf: "$530", freight: "$85", dapPrice: "$600", netback: "$600", vs30d: "+1.8%" },
    ],
    supplyDemand: [
      { category: "Supply", y2025: "21.8", y2026e: "23.0", vs2025: "+5.5%" },
      { category: "Demand", y2025: "20.9", y2026e: "22.0", vs2025: "+5.3%" },
    ],
  },
  optionality: {
    kpis: [
      { label: "Forward Curve (Mid)", value: "$615/t", subtitle: "Q3 2026", change: "+3.2% vs 30d", changeDirection: "up" },
      { label: "Option Value*", value: "$28/t", subtitle: "Average", change: "+4.1%", changeDirection: "up" },
      { label: "Open Destination Vol.", value: "1.2 Mt", subtitle: "15% of total pipeline", change: "+7%", changeDirection: "up" },
    ],
    forwardCurve: [
      { period: "Q2 26", current: 590, m1: 460, m3: 450 },
      { period: "Q3 26", current: 615, m1: 480, m3: 460 },
      { period: "Q4 26", current: 630, m1: 500, m3: 480 },
      { period: "Q1 27", current: 645, m1: 520, m3: 500 },
      { period: "Q2 27", current: 660, m1: 540, m3: 520 },
      { period: "Q3 27", current: 675, m1: 560, m3: 540 },
      { period: "Q4 27", current: 690, m1: 580, m3: 560 },
    ],
    optionValue: [
      { period: "Q2 2026", value: 18 }, { period: "Q3 2026", value: 28 },
      { period: "Q4 2026", value: 32 }, { period: "Q1 2027", value: 26 },
      { period: "Q2 2027", value: 22 }, { period: "Q3 2027", value: 16 },
    ],
    openDest: [
      { name: "India", value: 0.42 }, { name: "Brazil", value: 0.30 },
      { name: "Other Asia", value: 0.24 }, { name: "Africa", value: 0.14 }, { name: "Others", value: 0.10 },
    ],
    floatingStock: [
      { region: "India", current: "58", vs30d: "▲ +4", vsLastYear: "▼ -6" },
      { region: "Brazil", current: "72", vs30d: "▲ +6", vsLastYear: "▼ -4" },
      { region: "Other Asia", current: "45", vs30d: "▲ +3", vsLastYear: "▼ -8" },
    ],
    scenarios: [
      { scenario: "Base Case", assumption: "Current forward curve (Q3 2026)", netbackImpact: "$615", vsBase: "—" },
      { scenario: "Upside", assumption: "Stronger demand (+10% price)", netbackImpact: "$665", vsBase: "+$50" },
      { scenario: "Downside", assumption: "Softer demand (-10% price)", netbackImpact: "$565", vsBase: "-$50" },
    ],
  },
  flows: {
    arbitrage: [
      { type: "Geographic Arbitrage", description: "Exploit price differences between regions by redirecting physical flows", example: "Ship DAP to India instead of Brazil when netback is higher", lever: "Geography + Logistics" },
      { type: "Contract vs Spot", description: "Optimize between long-term contracts and spot market sales", example: "Sell minimum contracted volumes, maximize spot during spikes", lever: "Timing" },
      { type: "Value Chain (Rock-Acid-DAP)", description: "Switch between selling rock, acid or DAP depending on margin", example: "Stop DAP production and sell acid when ammonia is expensive", lever: "Industrial Flexibility" },
      { type: "Ammonia Arbitrage", description: "Adjust production based on ammonia cost fluctuations", example: "Reduce DAP output when ammonia prices surge", lever: "Input Timing" },
      { type: "Sulfur Arbitrage", description: "Optimize sulfur sourcing and timing", example: "Buy sulfur during low price periods and store for later use", lever: "Input + Storage" },
      { type: "Seasonal Arbitrage", description: "Align flows with agricultural demand cycles", example: "Shift volumes between India (Kharif) and Brazil (soy)", lever: "Timing + Geography" },
      { type: "Storage (Contango)", description: "Store product when future prices are higher than spot", example: "Store DAP in ports, sell later at higher forward prices", lever: "Storage" },
      { type: "Freight Arbitrage", description: "Exploit differences between freight spot and long-term rates", example: "Lock vessels at low rates, benefit when freight spikes", lever: "Logistics" },
      { type: "Port & Routing", description: "Optimize delivery routes and avoid congestion", example: "Switch ports to avoid delays and capture better pricing windows", lever: "Logistics" },
      { type: "India Subsidy", description: "Exploit government pricing distortions", example: "Increase exports when subsidies increase effective prices", lever: "Geography + Policy" },
      { type: "Forex Arbitrage", description: "Manage currency exposure across markets", example: "Hedge USD vs INR vs MAD for India sales", lever: "Financial" },
      { type: "Paper vs Physical", description: "Use derivatives to hedge and enhance physical trades", example: "Lock futures price and sell physical at higher spot", lever: "Financial + Timing" },
    ],
    insights: [
      { title: "Key Insight", subtitle: "Geographic", content: "Control of vessels and routing allows cargo redirection mid-journey. Current netback spread between India ($615/t) and Brazil ($575/t) creates a $40/t arbitrage opportunity." },
      { title: "Key Insight", subtitle: "Timing", content: "Forward curve in contango (Q2→Q4: +$40/t). Storage cost ~$8/t/month. Net carry trade: +$16/t for 3-month hold at current rates." },
      { title: "Key Insight", subtitle: "Freight", content: "Supramax rates volatile (±15% 30D). Locking 6-month charters at current levels could save $5-8/t if rates normalize upward." },
    ],
  },
};

// ── Context ──────────────────────────────────────────────────
interface DashboardDataContextType {
  config: DashboardConfig;
  updateSection: <K extends keyof DashboardConfig>(section: K, data: DashboardConfig[K]) => void;
  resetSection: (section: keyof DashboardConfig) => void;
  resetAll: () => void;
}

const DashboardDataContext = createContext<DashboardDataContextType | null>(null);

const STORAGE_KEY = "commohedge-dashboard-config";

function loadConfig(): DashboardConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch {}
  return defaultConfig;
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DashboardConfig>(loadConfig);

  const updateSection = useCallback(<K extends keyof DashboardConfig>(section: K, data: DashboardConfig[K]) => {
    setConfig(prev => {
      const next = { ...prev, [section]: data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSection = useCallback((section: keyof DashboardConfig) => {
    setConfig(prev => {
      const next = { ...prev, [section]: defaultConfig[section] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(defaultConfig);
  }, []);

  return (
    <DashboardDataContext.Provider value={{ config, updateSection, resetSection, resetAll }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return ctx;
}

export { defaultConfig };
