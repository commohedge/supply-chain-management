import { createContext, useContext, useState, ReactNode, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────
export interface OverviewData {
  kpis: { label: string; value: string; change: string; changeDirection: "up" | "down" | "neutral"; subtitle?: string }[];
  storage: { country: string; inStock: number; inTransit: number; planned: number }[];
  demand: { country: string; y2025: number; y2026ytd: number; y2026f: number }[];
  forecast: { country: string; arrivals: number; shipments: number; startingStock: number; endingStock: number }[];
  imports: { material: string; volume: string; suppliers: string; usage: string }[];
  exports: { product: string; volume: string; mainMarkets: string; share: string }[];
}

export interface SupplyData {
  kpis: { label: string; value: string; subtitle: string; change: string; changeDirection: "up" | "down" | "neutral" }[];
  production: { month: string; volume: number }[];
  volumeByStatus: { name: string; value: number; pct: string; change: string }[];
  ports: { port: string; utilization: string; next7: string; next30: string }[];
  vessels: { inPort: number; atSea: number; charterOptions: number };
  constraints: { constraint: string; details: string; severity: "low" | "medium" | "high" }[];
  rawMaterials: { material: string; currentPrice: string; vs30d: string; trend: string }[];
}

export interface PipelineData {
  kpis: { label: string; value: string; subtitle: string; change: string; changeDirection: "up" | "down" | "neutral" }[];
  coverage: { month: string; days: number }[];
  maturity: { period: string; confirmed: number; unassigned: number; openDest: number }[];
  destinations: { name: string; value: number; netback: number }[];
  statusRows: { status: string; volume: string; pct: string; change: string; netback: string }[];
  clientsByRegion: { region: string; share: string; clients: string; products: string }[];
}

export interface MarketData {
  kpis: { label: string; value: string; subtitle: string; change: string; changeDirection: "up" | "down" | "neutral" }[];
  prices: { period: string; tampa: number; india: number; jorf: number }[];
  inventory: { period: string; global: number; india: number; brazil: number; na: number }[];
  demandByRegion: { name: string; value: number }[];
  competitors: { name: string; volume: number }[];
  netback: { market: string; fobJorf: string; freight: string; dapPrice: string; netback: string; vs30d: string }[];
  supplyDemand: { category: string; y2025: string; y2026e: string; vs2025: string }[];
  competitorDetails: { name: string; country: string; marketShare: string; strengths: string }[];
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
  tradeRoutes: { origin: string; destination: string; product: string; volume: string; transitDays: string }[];
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

// ── Default Data (Real OCP Data) ──────────────────────────────
const defaultConfig: DashboardConfig = {
  general: { companyName: "OCP GROUP", dashboardDate: "09/04/2026", currency: "USD" },
  overview: {
    kpis: [
      { label: "Production Totale", value: "12.8 Mt", change: "+6.2% vs 2025", changeDirection: "up", subtitle: "Phosphate & Engrais" },
      { label: "Chiffre d'Affaires", value: "$9.4 Mrd", change: "+8.5% vs 2025", changeDirection: "up", subtitle: "2026 YTD" },
      { label: "Réserves Mondiales", value: "70%", change: "Stable", changeDirection: "neutral", subtitle: "Part de marché roche" },
      { label: "Part de Marché Global", value: "31%", change: "+1.2 pp vs 2024", changeDirection: "up", subtitle: "Produits phosphatés" },
      { label: "Pays Desservis", value: "50+", change: "+3 nouveaux marchés", changeDirection: "up" },
      { label: "Investissement Vert", value: "$7 Mrd", change: "Programme NH₃ vert", changeDirection: "neutral", subtitle: "En cours" },
    ],
    storage: [
      { country: "Inde", inStock: 2850, inTransit: 1200, planned: 1500 },
      { country: "Brésil", inStock: 2100, inTransit: 950, planned: 1100 },
      { country: "Afrique", inStock: 1650, inTransit: 680, planned: 900 },
      { country: "Europe", inStock: 980, inTransit: 420, planned: 550 },
      { country: "Amérique du Nord", inStock: 750, inTransit: 380, planned: 480 },
      { country: "Autres Asie", inStock: 620, inTransit: 310, planned: 400 },
    ],
    demand: [
      { country: "Inde", y2025: 4800, y2026ytd: 2600, y2026f: 5200 },
      { country: "Brésil", y2025: 3600, y2026ytd: 1900, y2026f: 3900 },
      { country: "Afrique", y2025: 2800, y2026ytd: 1500, y2026f: 3200 },
      { country: "Europe", y2025: 1600, y2026ytd: 850, y2026f: 1700 },
      { country: "Amérique du Nord", y2025: 1200, y2026ytd: 650, y2026f: 1300 },
    ],
    forecast: [
      { country: "Inde", arrivals: 1200, shipments: 980, startingStock: 2850, endingStock: 3070 },
      { country: "Brésil", arrivals: 950, shipments: 870, startingStock: 2100, endingStock: 2180 },
      { country: "Afrique", arrivals: 680, shipments: 520, startingStock: 1650, endingStock: 1810 },
      { country: "Europe", arrivals: 420, shipments: 390, startingStock: 980, endingStock: 1010 },
      { country: "Amérique du Nord", arrivals: 380, shipments: 350, startingStock: 750, endingStock: 780 },
    ],
    imports: [
      { material: "Soufre (Sulfur)", volume: "~8.3 Mt/an", suppliers: "QatarEnergy, ADNOC, Aramco, Gazprom", usage: "Acide sulfurique → roche phosphatée" },
      { material: "Ammoniac (NH₃)", volume: "~$2 Mrd/an", suppliers: "Trinité-et-Tobago, CF Industries, EuroChem, Égypte", usage: "Engrais azotés-phosphorés (DAP/MAP)" },
      { material: "Potasse (KCl)", volume: "Variable", suppliers: "Nutrien (Canada), Producteurs européens", usage: "Engrais ternaires (NPK)" },
    ],
    exports: [
      { product: "DAP (Diammonium Phosphate)", volume: "~4.2 Mt", mainMarkets: "Inde, Brésil, Afrique", share: "38%" },
      { product: "MAP (Monoammonium Phosphate)", volume: "~2.8 Mt", mainMarkets: "Brésil, Argentine", share: "22%" },
      { product: "Acide Phosphorique", volume: "~3.1 Mt", mainMarkets: "Inde, Europe", share: "25%" },
      { product: "TSP (Triple Superphosphate)", volume: "~1.2 Mt", mainMarkets: "Europe, Afrique", share: "9%" },
      { product: "NPK/NPS", volume: "~0.8 Mt", mainMarkets: "Afrique (sols spécifiques)", share: "6%" },
    ],
  },
  supply: {
    kpis: [
      { label: "Volume Disponible", value: "3.8 Mt", subtitle: "30 prochains jours", change: "+12% vs mois dernier", changeDirection: "up" },
      { label: "Taux de Chargement", value: "78%", subtitle: "Ports Jorf + Safi", change: "+6 pp", changeDirection: "up" },
      { label: "Slots de Chargement", value: "18", subtitle: "2.7 Mt capacité", change: "+3 vs mois dernier", changeDirection: "up" },
      { label: "Volume Engagé", value: "4.6 Mt", subtitle: "30 prochains jours", change: "+9%", changeDirection: "up" },
      { label: "Couverture Pipeline", value: "62 Jours", subtitle: "de ventes", change: "+8 jours", changeDirection: "up" },
      { label: "Utilisation Stockage", value: "74%", subtitle: "Sites OCP (Jorf+Safi+Youssoufia)", change: "+5 pp", changeDirection: "up" },
    ],
    production: [
      { month: "Jan 2026", volume: 2100 },
      { month: "Fév 2026", volume: 2250 },
      { month: "Mar 2026", volume: 2400 },
      { month: "Avr 2026", volume: 2550 },
      { month: "Mai 2026", volume: 2700 },
      { month: "Jun 2026", volume: 2850 },
      { month: "Jul 2026", volume: 2650 },
      { month: "Aoû 2026", volume: 2500 },
    ],
    volumeByStatus: [
      { name: "Disponible", value: 3800, pct: "30%", change: "▲ +12%" },
      { name: "Engagé", value: 4600, pct: "36%", change: "▲ +9%" },
      { name: "Open Dest.", value: 2200, pct: "17%", change: "▲ +11%" },
      { name: "En Transit", value: 2200, pct: "17%", change: "▼ -2%" },
    ],
    ports: [
      { port: "Jorf Lasfar", utilization: "82%", next7: "5 / 7", next30: "16 / 22" },
      { port: "Safi", utilization: "71%", next7: "3 / 5", next30: "10 / 15" },
      { port: "Casablanca", utilization: "63%", next7: "2 / 3", next30: "5 / 8" },
      { port: "Laâyoune", utilization: "45%", next7: "1 / 2", next30: "3 / 6" },
    ],
    vessels: { inPort: 8, atSea: 14, charterOptions: 6 },
    constraints: [
      { constraint: "Congestion Port", details: "Jorf Lasfar: temps d'attente moyen ~2.1 jours (pic saison)", severity: "high" },
      { constraint: "Capacité Stockage", details: "Youssoufia à 89% — transfert vers Safi recommandé", severity: "high" },
      { constraint: "Disponibilité Navires", details: "Supramax limité dans les 10 prochains jours (marché tendu)", severity: "medium" },
      { constraint: "Prix Ammoniac", details: "Hausse de +8% sur 30j — impact marge DAP estimé -$12/t", severity: "high" },
      { constraint: "Soufre Supply", details: "Contrat QatarEnergy: livraison retardée de 5 jours", severity: "medium" },
      { constraint: "Maintenance", details: "Ligne DAP #3 Jorf en maintenance préventive 15-22 avril", severity: "low" },
    ],
    rawMaterials: [
      { material: "Soufre (CFR Maroc)", currentPrice: "$142/t", vs30d: "▲ +5.2%", trend: "Hausse" },
      { material: "Ammoniac (CFR Maroc)", currentPrice: "$385/t", vs30d: "▲ +8.1%", trend: "Forte hausse" },
      { material: "Roche Phosphatée (FOB)", currentPrice: "$110/t", vs30d: "▼ -1.3%", trend: "Stable" },
      { material: "Acide Sulfurique", currentPrice: "$95/t", vs30d: "▲ +3.7%", trend: "Hausse modérée" },
    ],
  },
  pipeline: {
    kpis: [
      { label: "Volume Confirmé", value: "4.6 Mt", subtitle: "36% du total", change: "+9% vs mois dernier", changeDirection: "up" },
      { label: "Non Assigné", value: "3.8 Mt", subtitle: "30% du total", change: "+12%", changeDirection: "up" },
      { label: "Open Destination", value: "2.2 Mt", subtitle: "17% du total", change: "+11%", changeDirection: "up" },
      { label: "Couverture Pipeline", value: "62 Jours", subtitle: "de ventes", change: "+8 jours", changeDirection: "up" },
      { label: "Valeur Pipeline", value: "$3.42 Mrd", subtitle: "aux prix spot", change: "+7.3%", changeDirection: "up" },
    ],
    coverage: [
      { month: "Jan", days: 48 }, { month: "Fév", days: 50 }, { month: "Mar", days: 53 },
      { month: "Avr", days: 56 }, { month: "Mai", days: 58 }, { month: "Jun", days: 60 },
      { month: "Jul", days: 62 },
    ],
    maturity: [
      { period: "Avr 2026", confirmed: 1.6, unassigned: 1.1, openDest: 0.7 },
      { period: "Mai 2026", confirmed: 1.3, unassigned: 1.0, openDest: 0.6 },
      { period: "Jun 2026", confirmed: 1.0, unassigned: 0.9, openDest: 0.5 },
      { period: "Jul 2026", confirmed: 0.5, unassigned: 0.5, openDest: 0.3 },
      { period: "Aoû 2026", confirmed: 0.2, unassigned: 0.3, openDest: 0.1 },
    ],
    destinations: [
      { name: "Inde", value: 2200, netback: 610 },
      { name: "Brésil", value: 1600, netback: 575 },
      { name: "Afrique", value: 1100, netback: 590 },
      { name: "Europe", value: 650, netback: 600 },
      { name: "Amérique du Nord", value: 480, netback: 640 },
      { name: "Autres Asie", value: 370, netback: 585 },
    ],
    statusRows: [
      { status: "Confirmé", volume: "4,600", pct: "36%", change: "▲ +9%", netback: "$610" },
      { status: "Non Assigné", volume: "3,800", pct: "30%", change: "▲ +12%", netback: "—" },
      { status: "Open Destination", volume: "2,200", pct: "17%", change: "▲ +11%", netback: "—" },
      { status: "En Transit", volume: "2,200", pct: "17%", change: "▼ -2%", netback: "$595" },
    ],
    clientsByRegion: [
      { region: "Inde (Asie)", share: "35-40%", clients: "Coromandel International, IFFCO, RCF", products: "DAP, Acide Phosphorique" },
      { region: "Brésil (Amériques)", share: "25-30%", clients: "Yara Brasil, Mosaic Fertilizantes", products: "MAP, DAP" },
      { region: "Afrique", share: "20-25%", clients: "Gouvernements (Éthiopie, Nigeria, Kenya)", products: "NPK/NPS spécifiques sols" },
      { region: "Europe", share: "10-15%", clients: "Distributeurs spécialisés, industriels chimie", products: "TSP, Acide Phosphorique" },
    ],
  },
  market: {
    kpis: [
      { label: "Demande Globale (2026)", value: "15.3 Mt", subtitle: "DAP+MAP+TSP", change: "+4.8% vs 2025", changeDirection: "up" },
      { label: "Inventaire Global", value: "24.2 Mt", subtitle: "72 jours de supply", change: "+3.6% vs 30j", changeDirection: "up" },
      { label: "Netback Moyen (Blended)", value: "$598/t", subtitle: "FOB Jorf Lasfar", change: "+5.2%", changeDirection: "up" },
      { label: "Volatilité Prix (30J)", value: "14.8%", subtitle: "Annualisée", change: "-2.1 pp", changeDirection: "down" },
    ],
    prices: [
      { period: "Oct 25", tampa: 590, india: 540, jorf: 505 },
      { period: "Nov 25", tampa: 605, india: 548, jorf: 510 },
      { period: "Déc 25", tampa: 615, india: 555, jorf: 518 },
      { period: "Jan 26", tampa: 625, india: 562, jorf: 525 },
      { period: "Fév 26", tampa: 638, india: 570, jorf: 532 },
      { period: "Mar 26", tampa: 648, india: 578, jorf: 540 },
      { period: "Avr 26", tampa: 650, india: 585, jorf: 548 },
    ],
    inventory: [
      { period: "Jan 26", global: 70, india: 55, brazil: 38, na: 22 },
      { period: "Avr 26", global: 72, india: 58, brazil: 40, na: 23 },
      { period: "Jul 26", global: 68, india: 52, brazil: 36, na: 21 },
      { period: "Oct 26", global: 74, india: 60, brazil: 42, na: 24 },
      { period: "Jan 27", global: 66, india: 50, brazil: 35, na: 20 },
    ],
    demandByRegion: [
      { name: "Inde", value: 5200 }, { name: "Brésil", value: 3900 },
      { name: "Afrique", value: 3200 }, { name: "Europe", value: 1700 },
      { name: "Amérique du Nord", value: 1300 },
    ],
    competitors: [
      { name: "OCP Group", volume: 12.8 }, { name: "Mosaic Co.", volume: 8.2 },
      { name: "PhosAgro", volume: 5.6 }, { name: "Ma'aden", volume: 4.8 },
      { name: "Nutrien", volume: 4.2 }, { name: "Yuntianhua (Chine)", volume: 3.5 },
    ],
    netback: [
      { market: "Inde", fobJorf: "$548", freight: "$62", dapPrice: "$610", netback: "$548", vs30d: "+4.8%" },
      { market: "Amérique du Nord", fobJorf: "$548", freight: "$108", dapPrice: "$650", netback: "$542", vs30d: "+5.2%" },
      { market: "Europe", fobJorf: "$548", freight: "$48", dapPrice: "$600", netback: "$552", vs30d: "+2.1%" },
      { market: "Brésil", fobJorf: "$548", freight: "$55", dapPrice: "$575", netback: "$520", vs30d: "+3.5%" },
      { market: "Afrique (Ouest)", fobJorf: "$548", freight: "$38", dapPrice: "$590", netback: "$552", vs30d: "+4.0%" },
    ],
    supplyDemand: [
      { category: "Production Mondiale", y2025: "38.2", y2026e: "40.5", vs2025: "+6.0%" },
      { category: "Demande Mondiale", y2025: "36.8", y2026e: "39.0", vs2025: "+6.0%" },
      { category: "Balance", y2025: "1.4", y2026e: "1.5", vs2025: "+7.1%" },
    ],
    competitorDetails: [
      { name: "Mosaic Company", country: "États-Unis", marketShare: "18%", strengths: "Proximité Brésil/USA, intégration verticale" },
      { name: "PhosAgro", country: "Russie", marketShare: "12%", strengths: "Coûts gaz très bas, qualité premium (low Cd)" },
      { name: "Ma'aden", country: "Arabie Saoudite", marketShare: "10%", strengths: "Soufre/gaz local, proximité Asie/Afrique" },
      { name: "Yuntianhua", country: "Chine", marketShare: "8%", strengths: "Énorme capacité, quotas export dictent les prix" },
    ],
  },
  optionality: {
    kpis: [
      { label: "Forward Curve (Mid)", value: "$598/t", subtitle: "Q3 2026", change: "+4.5% vs 30j", changeDirection: "up" },
      { label: "Option Value*", value: "$34/t", subtitle: "Moyenne pondérée", change: "+6.2%", changeDirection: "up" },
      { label: "Open Destination Vol.", value: "2.2 Mt", subtitle: "17% du pipeline total", change: "+11%", changeDirection: "up" },
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
      { name: "Inde", value: 0.68 }, { name: "Brésil", value: 0.52 },
      { name: "Afrique", value: 0.42 }, { name: "Autres Asie", value: 0.34 }, { name: "Autres", value: 0.24 },
    ],
    floatingStock: [
      { region: "Inde", current: "62", vs30d: "▲ +5", vsLastYear: "▼ -8" },
      { region: "Brésil", current: "78", vs30d: "▲ +7", vsLastYear: "▼ -5" },
      { region: "Afrique (Ouest)", current: "48", vs30d: "▲ +4", vsLastYear: "▼ -10" },
      { region: "Autres Asie", current: "42", vs30d: "▲ +3", vsLastYear: "▼ -6" },
    ],
    scenarios: [
      { scenario: "Base Case", assumption: "Forward curve actuelle (Q3 2026)", netbackImpact: "$598", vsBase: "—" },
      { scenario: "Upside", assumption: "Demande Inde +15%, restrictions Chine export", netbackImpact: "$665", vsBase: "+$67" },
      { scenario: "Downside", assumption: "Récession Brésil, surplus offre Chine", netbackImpact: "$545", vsBase: "-$53" },
      { scenario: "Ammoniac Stress", assumption: "Prix NH₃ +25% (pic gaz naturel)", netbackImpact: "$560", vsBase: "-$38" },
      { scenario: "Green Premium", assumption: "Prime engrais bas-cadmium +$20/t", netbackImpact: "$618", vsBase: "+$20" },
    ],
  },
  flows: {
    arbitrage: [
      { type: "Arbitrage Géographique", description: "Exploiter les écarts de prix entre régions en redirigeant les flux physiques", example: "Rediriger DAP vers l'Inde ($610/t) au lieu du Brésil ($575/t) = +$35/t", lever: "Géographie + Logistique" },
      { type: "Contrat vs Spot", description: "Optimiser entre contrats long-terme et ventes spot", example: "Vendre le minimum contractuel, maximiser le spot pendant les pics saisonniers", lever: "Timing" },
      { type: "Chaîne de Valeur (Roche-Acide-DAP)", description: "Arbitrer entre la vente de roche, d'acide ou de DAP selon les marges", example: "Stopper la production DAP et vendre l'acide quand l'ammoniac est cher", lever: "Flexibilité Industrielle" },
      { type: "Arbitrage Ammoniac", description: "Ajuster la production selon les fluctuations du coût ammoniac", example: "Réduire la production DAP quand le NH₃ dépasse $400/t, vendre MAP ou TSP", lever: "Input Timing" },
      { type: "Arbitrage Soufre", description: "Optimiser le sourcing et le timing d'achat du soufre", example: "Acheter pendant les périodes basses (été) et stocker pour les pics hiver", lever: "Input + Stockage" },
      { type: "Arbitrage Saisonnier", description: "Aligner les flux avec les cycles agricoles", example: "Shift volumes entre Inde (Kharif Jul-Oct) et Brésil (soja Oct-Mar)", lever: "Timing + Géographie" },
      { type: "Stockage (Contango)", description: "Stocker quand les prix forward > spot", example: "Stocker le DAP dans les ports, vendre à terme +$40/t sur 3 mois", lever: "Stockage" },
      { type: "Arbitrage Fret", description: "Exploiter les écarts entre fret spot et long-terme", example: "Verrouiller des Supramax à $18k/j vs spot $22k/j = $4k/j d'économie", lever: "Logistique" },
      { type: "Port & Routing", description: "Optimiser les routes de livraison et éviter la congestion", example: "Utiliser Safi au lieu de Jorf Lasfar pendant les pics de congestion", lever: "Logistique" },
      { type: "Subvention Inde", description: "Exploiter les distorsions de prix gouvernementales", example: "Augmenter les exports quand le NBS indien augmente le prix effectif", lever: "Géographie + Politique" },
      { type: "Arbitrage Forex", description: "Gérer l'exposition devises sur les marchés", example: "Hedger USD/INR et USD/BRL pour sécuriser les marges en MAD", lever: "Financier" },
      { type: "Papier vs Physique", description: "Utiliser les dérivés pour hedger et améliorer les trades physiques", example: "Verrouiller le prix futures et vendre le physique au spot plus élevé", lever: "Financier + Timing" },
    ],
    insights: [
      { title: "Insight Clé", subtitle: "Géographique", content: "Le contrôle de la flotte et du routing permet la redirection des cargos en cours de route. L'écart netback actuel entre l'Inde ($610/t) et le Brésil ($575/t) crée une opportunité d'arbitrage de $35/t. Avec 2.2 Mt en open destination, le potentiel est de ~$77M." },
      { title: "Insight Clé", subtitle: "Timing / Contango", content: "Forward curve en contango (Q2→Q4: +$45/t). Coût de stockage ~$8/t/mois. Net carry trade: +$21/t sur 3 mois. Avec la capacité de stockage résiduelle de ~800kt à Jorf, potentiel de +$16.8M." },
      { title: "Insight Clé", subtitle: "Fret & Input", content: "Taux Supramax volatils (±18% 30J). Verrouiller des charters 6 mois aux niveaux actuels pourrait économiser $6-10/t si les taux remontent. L'ammoniac à $385/t rend le TSP plus attractif que le DAP pour les prochains 30 jours." },
      { title: "Insight Clé", subtitle: "Avantage Compétitif OCP", content: "Avec 70% des réserves mondiales et le programme d'ammoniac vert ($7 Mrd), OCP se positionne sur le segment premium bas-cadmium. La réglementation EU favorise OCP vs PhosAgro/Chine. Prime estimée: +$15-25/t en Europe d'ici 2027." },
    ],
    tradeRoutes: [
      { origin: "Jorf Lasfar", destination: "Mumbai (Inde)", product: "DAP", volume: "850 kt/trim", transitDays: "18-22" },
      { origin: "Jorf Lasfar", destination: "Santos (Brésil)", product: "MAP", volume: "620 kt/trim", transitDays: "14-18" },
      { origin: "Safi", destination: "Lagos (Nigeria)", product: "NPK", volume: "280 kt/trim", transitDays: "5-7" },
      { origin: "Jorf Lasfar", destination: "Tampa (USA)", product: "DAP", volume: "180 kt/trim", transitDays: "12-15" },
      { origin: "Casablanca", destination: "Anvers (Belgique)", product: "TSP", volume: "150 kt/trim", transitDays: "4-6" },
      { origin: "Safi", destination: "Mombasa (Kenya)", product: "NPS", volume: "120 kt/trim", transitDays: "12-16" },
      { origin: "Laâyoune", destination: "Paradip (Inde)", product: "Acide Phosphorique", volume: "200 kt/trim", transitDays: "20-25" },
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

const STORAGE_KEY = "ocp-dashboard-config";

function loadConfig(): DashboardConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Deep merge each section to ensure new fields have defaults
      const merged = { ...defaultConfig };
      for (const key of Object.keys(defaultConfig) as (keyof DashboardConfig)[]) {
        merged[key] = { ...defaultConfig[key], ...(parsed[key] || {}) } as any;
      }
      return merged;
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
