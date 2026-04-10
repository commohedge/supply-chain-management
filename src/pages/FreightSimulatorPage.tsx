import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Ship, Anchor } from "lucide-react";
import { toast } from "sonner";

const CARGO_SIZES = [35000, 40000, 50000, 80000];

const COUNTRIES = [
  "Maroc", "Arabie Saoudite", "Russie", "Brésil", "Inde", "Chine",
  "Indonésie", "Turquie", "USA", "Australie", "Nigéria", "Éthiopie",
  "Bangladesh", "Pakistan", "Vietnam", "Thaïlande", "Argentine",
  "Colombie", "Mexique", "Espagne", "France", "Pays-Bas", "Allemagne",
  "Côte d'Ivoire", "Sénégal", "Kenya", "Afrique du Sud", "Égypte",
  "Iran", "Émirats Arabes Unis", "Japon", "Corée du Sud", "Philippines",
];

interface FreightRoute {
  id: string;
  origin: string;
  destination: string;
  bunkerPrice: number;
  tcRate: number;
  voyageDays: number;
  cargoSize: number;
  dailyBFConsumption: number;
  warRiskCost: number;
  iranTransitFee: number;
  otherCosts: number;
}

const defaultRoute = (): FreightRoute => ({
  id: crypto.randomUUID(),
  origin: "Maroc",
  destination: "Brésil",
  bunkerPrice: 700,
  tcRate: 20000,
  voyageDays: 20,
  cargoSize: 50000,
  dailyBFConsumption: 25,
  warRiskCost: 0,
  iranTransitFee: 0,
  otherCosts: 5,
});

const INITIAL_ROUTES: FreightRoute[] = [
  { ...defaultRoute(), origin: "Arabie Saoudite", destination: "Brésil", voyageDays: 40, warRiskCost: 400000, iranTransitFee: 1000000 },
  { ...defaultRoute(), origin: "Arabie Saoudite", destination: "Inde", voyageDays: 25, warRiskCost: 400000, iranTransitFee: 1000000 },
  { ...defaultRoute(), origin: "Maroc", destination: "Brésil", voyageDays: 20 },
  { ...defaultRoute(), origin: "Maroc", destination: "Chine", voyageDays: 35 },
  { ...defaultRoute(), origin: "Russie", destination: "Brésil", voyageDays: 40 },
  { ...defaultRoute(), origin: "Russie", destination: "Inde", voyageDays: 50 },
];

// Formulas from Excel
function calcTimeCharter(r: FreightRoute) {
  return (r.tcRate * r.voyageDays) / r.cargoSize;
}
function calcBunkerFuel(r: FreightRoute) {
  return (r.dailyBFConsumption * r.bunkerPrice * r.voyageDays) / r.cargoSize;
}
function calcWarRisk(r: FreightRoute) {
  return r.warRiskCost / r.cargoSize;
}
function calcIranTransit(r: FreightRoute) {
  return r.iranTransitFee / r.cargoSize;
}
function calcTotalFreight(r: FreightRoute) {
  return calcTimeCharter(r) + calcBunkerFuel(r) + calcWarRisk(r) + calcIranTransit(r) + r.otherCosts;
}
function calcBuyerPrice(r: FreightRoute) {
  return calcTotalFreight(r) * 1.3;
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function FreightSimulatorPage() {
  const [routes, setRoutes] = useState<FreightRoute[]>(INITIAL_ROUTES.map(r => ({ ...r, id: crypto.randomUUID() })));

  const updateRoute = (id: string, key: keyof FreightRoute, value: any) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));
  };

  const addRoute = () => {
    setRoutes(prev => [...prev, defaultRoute()]);
    toast.success("Route ajoutée");
  };

  const removeRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Ship className="h-7 w-7 text-primary" /> Freight Simulator
          </h1>
          <p className="page-subtitle">
            Pricer de fret maritime — Calcul du coût de transport par route avec vue Trader & Buyer
          </p>
        </div>
        <Button size="sm" onClick={addRoute} className="text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter une route
        </Button>
      </div>

      {/* Info box */}
      <div className="mb-6 p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground space-y-1">
        <p><strong className="text-foreground">Formules appliquées :</strong></p>
        <p>• Time Charter ($/t) = TC Rate × Voyage Days ÷ Cargo Size</p>
        <p>• Bunker Fuel ($/t) = Daily Consumption × Bunker Price × Voyage Days ÷ Cargo Size</p>
        <p>• War‑Risk & Iran Transit ($/t) = Coût total ÷ Cargo Size</p>
        <p>• <strong className="text-primary">Buyer Price = Total Freight × 1.30</strong> (marge 30%)</p>
      </div>

      <div className="chart-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider sticky left-0 bg-card z-10 min-w-[100px]">Route</th>
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider min-w-[90px]">Bunker Price ($)</th>
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider min-w-[90px]">TC Rate ($/day)</th>
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider min-w-[70px]">Voyage Days</th>
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider min-w-[90px]">Cargo Size (mt)</th>
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider min-w-[70px]">BF Cons. (mt/j)</th>
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider min-w-[90px]">War‑Risk ($)</th>
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider min-w-[90px]">Iran Fee ($)</th>
              <th className="text-left py-2.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider min-w-[70px]">Other ($/t)</th>
              <th className="text-center py-2.5 px-2 text-[10px] text-primary font-semibold uppercase tracking-wider border-l border-border min-w-[70px]">TC ($/t)</th>
              <th className="text-center py-2.5 px-2 text-[10px] text-primary font-semibold uppercase tracking-wider min-w-[70px]">Bunker ($/t)</th>
              <th className="text-center py-2.5 px-2 text-[10px] text-primary font-semibold uppercase tracking-wider min-w-[80px]">War‑Risk ($/t)</th>
              <th className="text-center py-2.5 px-2 text-[10px] text-primary font-semibold uppercase tracking-wider min-w-[70px]">Iran ($/t)</th>
              <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-accent border-l border-border min-w-[90px]">Total Freight ($/t)</th>
              <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-success min-w-[90px]">Buyer Price ($/t)</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => {
              const tc = calcTimeCharter(r);
              const bf = calcBunkerFuel(r);
              const wr = calcWarRisk(r);
              const ir = calcIranTransit(r);
              const total = calcTotalFreight(r);
              const buyer = calcBuyerPrice(r);

              return (
                <tr key={r.id} className="border-b border-border/40 hover:bg-muted/10">
                  {/* Route origin → destination */}
                  <td className="py-1.5 px-1 sticky left-0 bg-card z-10">
                    <div className="flex flex-col gap-1">
                      <Select value={r.origin} onValueChange={v => updateRoute(r.id, "origin", v)}>
                        <SelectTrigger className="h-7 text-[11px] bg-background/50 w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground justify-center">
                        <Anchor className="h-2.5 w-2.5" /> →
                      </div>
                      <Select value={r.destination} onValueChange={v => updateRoute(r.id, "destination", v)}>
                        <SelectTrigger className="h-7 text-[11px] bg-background/50 w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </td>
                  {/* Inputs */}
                  <td className="py-1.5 px-1">
                    <Input className="h-7 text-xs bg-background/50 font-mono w-full" type="number" value={r.bunkerPrice} onChange={e => updateRoute(r.id, "bunkerPrice", +e.target.value)} />
                  </td>
                  <td className="py-1.5 px-1">
                    <Input className="h-7 text-xs bg-background/50 font-mono w-full" type="number" value={r.tcRate} onChange={e => updateRoute(r.id, "tcRate", +e.target.value)} />
                  </td>
                  <td className="py-1.5 px-1">
                    <Input className="h-7 text-xs bg-background/50 font-mono w-full" type="number" value={r.voyageDays} onChange={e => updateRoute(r.id, "voyageDays", +e.target.value)} />
                  </td>
                  <td className="py-1.5 px-1">
                    <Select value={String(r.cargoSize)} onValueChange={v => updateRoute(r.id, "cargoSize", +v)}>
                      <SelectTrigger className="h-7 text-[11px] bg-background/50 font-mono w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{CARGO_SIZES.map(s => <SelectItem key={s} value={String(s)}>{(s / 1000).toFixed(0)}K</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="py-1.5 px-1">
                    <Input className="h-7 text-xs bg-background/50 font-mono w-full" type="number" value={r.dailyBFConsumption} onChange={e => updateRoute(r.id, "dailyBFConsumption", +e.target.value)} />
                  </td>
                  <td className="py-1.5 px-1">
                    <Input className="h-7 text-xs bg-background/50 font-mono w-full" type="number" value={r.warRiskCost} onChange={e => updateRoute(r.id, "warRiskCost", +e.target.value)} />
                  </td>
                  <td className="py-1.5 px-1">
                    <Input className="h-7 text-xs bg-background/50 font-mono w-full" type="number" value={r.iranTransitFee} onChange={e => updateRoute(r.id, "iranTransitFee", +e.target.value)} />
                  </td>
                  <td className="py-1.5 px-1">
                    <Input className="h-7 text-xs bg-background/50 font-mono w-full" type="number" value={r.otherCosts} onChange={e => updateRoute(r.id, "otherCosts", +e.target.value)} />
                  </td>
                  {/* Calculated - Trader view */}
                  <td className="py-1.5 px-2 text-center font-mono text-xs text-muted-foreground border-l border-border">{fmt(tc)}</td>
                  <td className="py-1.5 px-2 text-center font-mono text-xs text-muted-foreground">{fmt(bf)}</td>
                  <td className="py-1.5 px-2 text-center font-mono text-xs text-muted-foreground">{wr > 0 ? fmt(wr) : "—"}</td>
                  <td className="py-1.5 px-2 text-center font-mono text-xs text-muted-foreground">{ir > 0 ? fmt(ir) : "—"}</td>
                  {/* Totals */}
                  <td className="py-1.5 px-2 text-center font-mono text-xs font-bold text-accent border-l border-border">${fmt(total)}</td>
                  <td className="py-1.5 px-2 text-center font-mono text-xs font-bold text-success">${fmt(buyer)}</td>
                  <td className="py-1.5 px-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => removeRoute(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* War-risk reference */}
      <div className="mt-6 p-3 rounded-lg bg-muted/20 border border-border/50 text-[11px] text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">📌 Référence War‑Risk Premium (Cargo hull value $40M)</p>
        <div className="grid grid-cols-3 gap-2">
          <span>× 0.5% = <strong className="text-foreground font-mono">$200,000</strong>/voyage</span>
          <span>× 1.0% = <strong className="text-foreground font-mono">$400,000</strong>/voyage</span>
          <span>× 1.5% = <strong className="text-foreground font-mono">$600,000</strong>/voyage</span>
        </div>
        <p className="mt-1">Iran transit fee standard: <strong className="text-foreground font-mono">$1,000,000</strong>/voyage</p>
      </div>
    </DashboardLayout>
  );
}
