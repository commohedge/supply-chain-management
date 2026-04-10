import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Ship, Settings2, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

// ── Types ──────────────────────────────────────────────
interface FreightSettings {
  buyerMarkup: number;
  cargoSizes: number[];
  defaultTcRate: number;
  defaultBunkerPrice: number;
  defaultDailyBF: number;
  defaultOtherCosts: number;
  defaultIranTransitFee: number;
  defaultWarRiskCost: number;
}

interface FreightRoute {
  id: string;
  origin: string;
  destination: string;
  bunkerPrice: number;
  tcRate: number;
  voyageDays: number;
  dailyBFConsumption: number;
  warRiskCost: number;
  iranTransitFee: number;
  otherCosts: number;
}

// ── Constants ──────────────────────────────────────────
const COUNTRIES = [
  "Maroc", "Arabie Saoudite", "Russie", "Brésil", "Inde", "Chine",
  "Indonésie", "Turquie", "USA", "Australie", "Nigéria", "Éthiopie",
  "Bangladesh", "Pakistan", "Vietnam", "Thaïlande", "Argentine",
  "Colombie", "Mexique", "Espagne", "France", "Pays-Bas", "Allemagne",
  "Côte d'Ivoire", "Sénégal", "Kenya", "Afrique du Sud", "Égypte",
  "Iran", "Émirats Arabes Unis", "Japon", "Corée du Sud", "Philippines",
].sort();

const DEFAULT_SETTINGS: FreightSettings = {
  buyerMarkup: 1.3,
  cargoSizes: [35000, 40000, 50000, 80000],
  defaultTcRate: 20000,
  defaultBunkerPrice: 700,
  defaultDailyBF: 25,
  defaultOtherCosts: 5,
  defaultIranTransitFee: 1000000,
  defaultWarRiskCost: 400000,
};

const INITIAL_ROUTES: Omit<FreightRoute, "id">[] = [
  { origin: "Arabie Saoudite", destination: "Brésil", voyageDays: 40, bunkerPrice: 700, tcRate: 20000, dailyBFConsumption: 25, warRiskCost: 400000, iranTransitFee: 1000000, otherCosts: 5 },
  { origin: "Arabie Saoudite", destination: "Inde", voyageDays: 25, bunkerPrice: 700, tcRate: 20000, dailyBFConsumption: 25, warRiskCost: 400000, iranTransitFee: 1000000, otherCosts: 5 },
  { origin: "Maroc", destination: "Brésil", voyageDays: 20, bunkerPrice: 700, tcRate: 20000, dailyBFConsumption: 25, warRiskCost: 0, iranTransitFee: 0, otherCosts: 5 },
  { origin: "Maroc", destination: "Chine", voyageDays: 35, bunkerPrice: 700, tcRate: 20000, dailyBFConsumption: 25, warRiskCost: 0, iranTransitFee: 0, otherCosts: 5 },
  { origin: "Russie", destination: "Brésil", voyageDays: 40, bunkerPrice: 700, tcRate: 20000, dailyBFConsumption: 25, warRiskCost: 0, iranTransitFee: 0, otherCosts: 5 },
  { origin: "Russie", destination: "Inde", voyageDays: 50, bunkerPrice: 700, tcRate: 20000, dailyBFConsumption: 25, warRiskCost: 0, iranTransitFee: 0, otherCosts: 5 },
];

// ── Formulas ───────────────────────────────────────────
function calc(r: FreightRoute, cargoSize: number, markup: number) {
  const tc = (r.tcRate * r.voyageDays) / cargoSize;
  const bf = (r.dailyBFConsumption * r.bunkerPrice * r.voyageDays) / cargoSize;
  const wr = r.warRiskCost / cargoSize;
  const ir = r.iranTransitFee / cargoSize;
  const total = tc + bf + wr + ir + r.otherCosts;
  const buyer = total * markup;
  return { tc, bf, wr, ir, total, buyer };
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sizeLabel(s: number) {
  return `${(s / 1000).toFixed(0)}KT`;
}

// ── Settings Panel ─────────────────────────────────────
function SettingsPanel({ settings, onChange, onClose }: {
  settings: FreightSettings;
  onChange: (s: FreightSettings) => void;
  onClose: () => void;
}) {
  const update = (key: keyof FreightSettings, value: any) => onChange({ ...settings, [key]: value });

  const updateCargoSize = (index: number, value: number) => {
    const sizes = [...settings.cargoSizes];
    sizes[index] = value;
    onChange({ ...settings, cargoSizes: sizes.sort((a, b) => a - b) });
  };

  const addCargoSize = () => {
    if (settings.cargoSizes.length >= 6) return;
    onChange({ ...settings, cargoSizes: [...settings.cargoSizes, 60000].sort((a, b) => a - b) });
  };

  const removeCargoSize = (index: number) => {
    if (settings.cargoSizes.length <= 2) return;
    const sizes = settings.cargoSizes.filter((_, i) => i !== index);
    onChange({ ...settings, cargoSizes: sizes });
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" /> Paramètres du simulateur
        </h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Markup Buyer (×)</Label>
          <Input className="h-8 text-xs font-mono" type="number" step="0.05" value={settings.buyerMarkup}
            onChange={e => update("buyerMarkup", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">TC Rate par défaut ($/j)</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultTcRate}
            onChange={e => update("defaultTcRate", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Bunker Price par défaut ($)</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultBunkerPrice}
            onChange={e => update("defaultBunkerPrice", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">BF Cons. par défaut (mt/j)</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultDailyBF}
            onChange={e => update("defaultDailyBF", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Other Costs par défaut ($/t)</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultOtherCosts}
            onChange={e => update("defaultOtherCosts", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Iran Transit Fee défaut ($)</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultIranTransitFee}
            onChange={e => update("defaultIranTransitFee", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">War‑Risk défaut ($)</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultWarRiskCost}
            onChange={e => update("defaultWarRiskCost", +e.target.value)} />
        </div>
      </div>

      {/* Cargo sizes */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[11px] text-muted-foreground">Tailles de Cargo (mt)</Label>
          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={addCargoSize}
            disabled={settings.cargoSizes.length >= 6}>
            <Plus className="h-3 w-3 mr-1" /> Ajouter
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {settings.cargoSizes.map((size, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input className="h-7 w-24 text-xs font-mono" type="number" value={size}
                onChange={e => updateCargoSize(i, +e.target.value)} />
              {settings.cargoSizes.length > 2 && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive"
                  onClick={() => removeCargoSize(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function FreightSimulatorPage() {
  const [settings, setSettings] = useState<FreightSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [routes, setRoutes] = useState<FreightRoute[]>(
    INITIAL_ROUTES.map(r => ({ ...r, id: crypto.randomUUID() }))
  );

  const updateRoute = (id: string, key: keyof FreightRoute, value: any) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));
  };

  const addRoute = () => {
    setRoutes(prev => [...prev, {
      id: crypto.randomUUID(),
      origin: "Maroc",
      destination: "Brésil",
      bunkerPrice: settings.defaultBunkerPrice,
      tcRate: settings.defaultTcRate,
      voyageDays: 20,
      dailyBFConsumption: settings.defaultDailyBF,
      warRiskCost: 0,
      iranTransitFee: 0,
      otherCosts: settings.defaultOtherCosts,
    }]);
    toast.success("Route ajoutée");
  };

  const removeRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  const { cargoSizes, buyerMarkup } = settings;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Ship className="h-7 w-7 text-primary" /> Freight Simulator
          </h1>
          <p className="page-subtitle">
            Pricer de fret maritime — Coût par route et par capacité de bateau
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowSettings(v => !v)}>
            <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Paramètres
          </Button>
          <Button size="sm" onClick={addRoute} className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter une route
          </Button>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
      )}

      {/* Formulas reference */}
      <div className="mb-4 p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[10px] text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
        <span>TC = TC Rate × Days ÷ Cargo</span>
        <span>BF = Cons. × Bunker × Days ÷ Cargo</span>
        <span>War‑Risk & Iran = Coût ÷ Cargo</span>
        <span className="text-primary font-semibold">Buyer = Total × {settings.buyerMarkup.toFixed(2)}</span>
      </div>

      {/* Main table */}
      <div className="chart-container overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            {/* Top header row: group labels */}
            <tr className="border-b border-border">
              <th rowSpan={2} className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider sticky left-0 bg-card z-10 min-w-[140px] border-r border-border">
                Route
              </th>
              <th colSpan={7} className="text-center py-1.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider border-r border-border">
                Paramètres d'entrée
              </th>
              {cargoSizes.map((size) => (
                <th key={size} colSpan={3} className="text-center py-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider border-r border-border last:border-r-0">
                  <span className="text-primary">{sizeLabel(size)}</span>
                </th>
              ))}
              <th rowSpan={2} className="w-8"></th>
            </tr>
            {/* Sub header row */}
            <tr className="border-b border-border bg-muted/10">
              <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">Bunker $</th>
              <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">TC $/j</th>
              <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">Jours</th>
              <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">BF mt/j</th>
              <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">War‑Risk $</th>
              <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">Iran $</th>
              <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center border-r border-border">Other $/t</th>
              {cargoSizes.map((size) => (
                <th key={size} colSpan={3} className="border-r border-border last:border-r-0">
                  <div className="flex">
                    <span className="flex-1 py-1 text-[9px] text-muted-foreground font-medium text-center">Total</span>
                    <span className="flex-1 py-1 text-[9px] text-accent font-semibold text-center border-l border-border/40">Buyer</span>
                    <span className="flex-1 py-1 text-[9px] text-muted-foreground/60 font-medium text-center border-l border-border/40">TC</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} className="border-b border-border/30 hover:bg-muted/10">
                {/* Route */}
                <td className="py-2 px-2 sticky left-0 bg-card z-10 border-r border-border">
                  <div className="flex items-center gap-1.5">
                    <Select value={r.origin} onValueChange={v => updateRoute(r.id, "origin", v)}>
                      <SelectTrigger className="h-6 text-[10px] bg-background/50 w-[62px] px-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-[9px] text-muted-foreground">→</span>
                    <Select value={r.destination} onValueChange={v => updateRoute(r.id, "destination", v)}>
                      <SelectTrigger className="h-6 text-[10px] bg-background/50 w-[62px] px-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </td>
                {/* Inputs */}
                <td className="py-1 px-0.5">
                  <Input className="h-6 text-[10px] bg-background/50 font-mono w-16 px-1.5" type="number"
                    value={r.bunkerPrice} onChange={e => updateRoute(r.id, "bunkerPrice", +e.target.value)} />
                </td>
                <td className="py-1 px-0.5">
                  <Input className="h-6 text-[10px] bg-background/50 font-mono w-16 px-1.5" type="number"
                    value={r.tcRate} onChange={e => updateRoute(r.id, "tcRate", +e.target.value)} />
                </td>
                <td className="py-1 px-0.5">
                  <Input className="h-6 text-[10px] bg-background/50 font-mono w-12 px-1.5" type="number"
                    value={r.voyageDays} onChange={e => updateRoute(r.id, "voyageDays", +e.target.value)} />
                </td>
                <td className="py-1 px-0.5">
                  <Input className="h-6 text-[10px] bg-background/50 font-mono w-12 px-1.5" type="number"
                    value={r.dailyBFConsumption} onChange={e => updateRoute(r.id, "dailyBFConsumption", +e.target.value)} />
                </td>
                <td className="py-1 px-0.5">
                  <Input className="h-6 text-[10px] bg-background/50 font-mono w-20 px-1.5" type="number"
                    value={r.warRiskCost} onChange={e => updateRoute(r.id, "warRiskCost", +e.target.value)} />
                </td>
                <td className="py-1 px-0.5">
                  <Input className="h-6 text-[10px] bg-background/50 font-mono w-20 px-1.5" type="number"
                    value={r.iranTransitFee} onChange={e => updateRoute(r.id, "iranTransitFee", +e.target.value)} />
                </td>
                <td className="py-1 px-0.5 border-r border-border">
                  <Input className="h-6 text-[10px] bg-background/50 font-mono w-12 px-1.5" type="number"
                    value={r.otherCosts} onChange={e => updateRoute(r.id, "otherCosts", +e.target.value)} />
                </td>
                {/* Calculated values per cargo size */}
                {cargoSizes.map((size) => {
                  const c = calc(r, size, buyerMarkup);
                  return (
                    <td key={size} colSpan={3} className="py-1 px-0 border-r border-border last:border-r-0">
                      <div className="flex">
                        <span className="flex-1 text-center font-mono text-[10px] font-bold text-foreground px-1">
                          {fmt(c.total)}
                        </span>
                        <span className="flex-1 text-center font-mono text-[10px] font-bold text-accent px-1 border-l border-border/30">
                          {fmt(c.buyer)}
                        </span>
                        <span className="flex-1 text-center font-mono text-[10px] text-muted-foreground px-1 border-l border-border/30">
                          {fmt(c.tc)}
                        </span>
                      </div>
                    </td>
                  );
                })}
                <td className="py-1 px-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive"
                    onClick={() => removeRoute(r.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* War-risk reference */}
      <div className="mt-5 p-3 rounded-lg bg-muted/20 border border-border/50 text-[10px] text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">📌 Référence War‑Risk Premium (Cargo hull value $40M)</p>
        <div className="grid grid-cols-3 gap-2">
          <span>× 0.5% = <strong className="text-foreground font-mono">$200,000</strong></span>
          <span>× 1.0% = <strong className="text-foreground font-mono">$400,000</strong></span>
          <span>× 1.5% = <strong className="text-foreground font-mono">$600,000</strong></span>
        </div>
        <p className="mt-1">Iran transit fee standard: <strong className="text-foreground font-mono">$1,000,000</strong>/voyage</p>
      </div>
    </DashboardLayout>
  );
}
