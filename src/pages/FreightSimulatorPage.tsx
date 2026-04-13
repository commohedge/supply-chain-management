import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Ship, Settings2, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/contexts/I18nContext";
import type { AppLocale } from "@/i18n/locales";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BULK_CARRIER_CLASS_SEGMENTS,
  BULK_CARRIER_CLASSES_IMAGE,
  BULK_VESSELS_XLSX,
  type BulkCarrierClassSegment,
} from "@/data/vesselMapping";
import {
  createDefaultFleetRowsWithIds,
  loadFleetRowsFromStorage,
  saveFleetRowsToStorage,
  type BulkVesselFleetRecord,
  type FleetRowWithId,
} from "@/data/bulkVesselsFleet";

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
  /** Affiche chaque route comme une carte avec tableau par capacité (côte à côte) */
  simulationCardLayout: boolean;
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
  simulationCardLayout: false,
};

const FREIGHT_SETTINGS_KEY = "freight-simulator-settings";

function loadFreightSettings(): FreightSettings {
  try {
    const raw = localStorage.getItem(FREIGHT_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FreightSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        cargoSizes: Array.isArray(parsed.cargoSizes) && parsed.cargoSizes.length >= 2
          ? [...parsed.cargoSizes].sort((a, b) => a - b)
          : DEFAULT_SETTINGS.cargoSizes,
        simulationCardLayout: typeof parsed.simulationCardLayout === "boolean"
          ? parsed.simulationCardLayout
          : DEFAULT_SETTINGS.simulationCardLayout,
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

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

function fmt(n: number, locale: AppLocale) {
  return n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sizeLabel(s: number) {
  return `${(s / 1000).toFixed(0)}KT`;
}

function fmtDim(r: BulkCarrierClassSegment["lengthM"] | BulkCarrierClassSegment["draftM"]): string {
  if (r.approx != null) return `~${r.approx} m`;
  if (r.min != null && r.max != null) return `${r.min}–${r.max} m`;
  if (r.max != null) return `≤${r.max} m`;
  if (r.min != null) return `≥${r.min} m`;
  return "—";
}

// ── Settings Panel ─────────────────────────────────────
function SettingsPanel({ settings, onChange, onClose }: {
  settings: FreightSettings;
  onChange: (s: FreightSettings) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const update = <K extends keyof FreightSettings>(key: K, value: FreightSettings[K]) =>
    onChange({ ...settings, [key]: value });

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
          <Settings2 className="h-4 w-4 text-primary" /> {t("freight.settingsPanelTitle")}
        </h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">{t("freight.label.buyerMarkup")}</Label>
          <Input className="h-8 text-xs font-mono" type="number" step="0.05" value={settings.buyerMarkup}
            onChange={e => update("buyerMarkup", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">{t("freight.label.defaultTc")}</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultTcRate}
            onChange={e => update("defaultTcRate", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">{t("freight.label.defaultBunker")}</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultBunkerPrice}
            onChange={e => update("defaultBunkerPrice", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">{t("freight.label.defaultBf")}</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultDailyBF}
            onChange={e => update("defaultDailyBF", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">{t("freight.label.defaultOther")}</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultOtherCosts}
            onChange={e => update("defaultOtherCosts", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">{t("freight.label.defaultIran")}</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultIranTransitFee}
            onChange={e => update("defaultIranTransitFee", +e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">{t("freight.label.defaultWarRisk")}</Label>
          <Input className="h-8 text-xs font-mono" type="number" value={settings.defaultWarRiskCost}
            onChange={e => update("defaultWarRiskCost", +e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-border/60 bg-muted/15 px-3 py-2.5">
        <div className="space-y-0.5">
          <Label htmlFor="simulation-card-layout" className="text-xs font-medium text-foreground">
            {t("freight.cardLayoutTitle")}
          </Label>
          <p className="text-[10px] text-muted-foreground leading-snug max-w-xl">
            {t("freight.cardLayoutDesc")}
          </p>
        </div>
        <Switch
          id="simulation-card-layout"
          checked={settings.simulationCardLayout}
          onCheckedChange={(v) => update("simulationCardLayout", v)}
        />
      </div>

      {/* Cargo sizes */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[11px] text-muted-foreground">{t("freight.cargoSizes")}</Label>
          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={addCargoSize}
            disabled={settings.cargoSizes.length >= 6}>
            <Plus className="h-3 w-3 mr-1" /> {t("settings.add")}
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

// ── Card layout: one card per route (tables side by side in grid) ──
function RouteSimulationCard({
  route: r,
  cargoSizes,
  buyerMarkup,
  onUpdate,
  onRemove,
}: {
  route: FreightRoute;
  cargoSizes: number[];
  buyerMarkup: number;
  onUpdate: (id: string, key: keyof FreightRoute, value: number | string) => void;
  onRemove: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  const detailRows: { label: string; key: "tc" | "bf" | "wr" | "ir" | "other" | "total" | "buyer"; bold?: boolean; accent?: boolean }[] = useMemo(
    () => [
      { label: t("freight.row.tcPerT"), key: "tc" },
      { label: t("freight.row.bfPerT"), key: "bf" },
      { label: t("freight.row.warPerT"), key: "wr" },
      { label: t("freight.row.iranPerT"), key: "ir" },
      { label: t("freight.row.otherPerT"), key: "other" },
      { label: t("freight.row.totalPerT"), key: "total", bold: true },
      { label: t("freight.row.buyerPerT"), key: "buyer", bold: true, accent: true },
    ],
    [t],
  );

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="py-3 px-4 pb-2 space-y-2 border-b border-border/50 bg-muted/10">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold tracking-tight">{t("freight.simulation")}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive/60 hover:text-destructive"
            onClick={() => onRemove(r.id)}
            aria-label={t("freight.removeRoute")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Select value={r.origin} onValueChange={(v) => onUpdate(r.id, "origin", v)}>
            <SelectTrigger className="h-7 text-[10px] bg-background/80 min-w-[100px] max-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[10px] text-muted-foreground">→</span>
          <Select value={r.destination} onValueChange={(v) => onUpdate(r.id, "destination", v)}>
            <SelectTrigger className="h-7 text-[10px] bg-background/80 min-w-[100px] max-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">{t("freight.inputParams")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{t("freight.label.bunker")}</Label>
              <Input
                className="h-7 text-[10px] font-mono"
                type="number"
                value={r.bunkerPrice}
                onChange={(e) => onUpdate(r.id, "bunkerPrice", +e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{t("freight.label.tcDay")}</Label>
              <Input
                className="h-7 text-[10px] font-mono"
                type="number"
                value={r.tcRate}
                onChange={(e) => onUpdate(r.id, "tcRate", +e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{t("freight.label.days")}</Label>
              <Input
                className="h-7 text-[10px] font-mono"
                type="number"
                value={r.voyageDays}
                onChange={(e) => onUpdate(r.id, "voyageDays", +e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{t("freight.label.bfMtDay")}</Label>
              <Input
                className="h-7 text-[10px] font-mono"
                type="number"
                value={r.dailyBFConsumption}
                onChange={(e) => onUpdate(r.id, "dailyBFConsumption", +e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{t("freight.label.warRisk")}</Label>
              <Input
                className="h-7 text-[10px] font-mono"
                type="number"
                value={r.warRiskCost}
                onChange={(e) => onUpdate(r.id, "warRiskCost", +e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{t("freight.label.iran")}</Label>
              <Input
                className="h-7 text-[10px] font-mono"
                type="number"
                value={r.iranTransitFee}
                onChange={(e) => onUpdate(r.id, "iranTransitFee", +e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{t("freight.label.otherPerT")}</Label>
              <Input
                className="h-7 text-[10px] font-mono"
                type="number"
                value={r.otherCosts}
                onChange={(e) => onUpdate(r.id, "otherCosts", +e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-border/60">
          <table className="w-full text-[10px] border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left py-1.5 px-2 font-medium text-muted-foreground w-[88px]"> </th>
                {cargoSizes.map((size) => (
                  <th key={size} className="text-center py-1.5 px-1 font-semibold text-primary border-l border-border/40">
                    {sizeLabel(size)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detailRows.map((row) => (
                <tr key={row.key} className="border-b border-border/40 last:border-0">
                  <td
                    className={`py-1 px-2 text-muted-foreground whitespace-nowrap ${row.bold ? "font-semibold text-foreground" : ""}`}
                  >
                    {row.label}
                  </td>
                  {cargoSizes.map((size) => {
                    const c = calc(r, size, buyerMarkup);
                    const other = r.otherCosts;
                    const val =
                      row.key === "other"
                        ? other
                        : row.key === "tc"
                          ? c.tc
                          : row.key === "bf"
                            ? c.bf
                            : row.key === "wr"
                              ? c.wr
                              : row.key === "ir"
                                ? c.ir
                                : row.key === "total"
                                  ? c.total
                                  : c.buyer;
                    return (
                      <td
                        key={size}
                        className={`text-center py-1 px-1 font-mono border-l border-border/30 ${
                          row.accent ? "text-accent font-bold" : row.bold ? "font-bold text-foreground" : ""
                        }`}
                      >
                        {fmt(val, locale)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function FreightSimulatorPage() {
  const { t, locale } = useI18n();
  const [settings, setSettings] = useState<FreightSettings>(loadFreightSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [routes, setRoutes] = useState<FreightRoute[]>(
    INITIAL_ROUTES.map(r => ({ ...r, id: crypto.randomUUID() }))
  );

  const [fleetRows, setFleetRows] = useState<FleetRowWithId[]>(() => loadFleetRowsFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(FREIGHT_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  useEffect(() => {
    saveFleetRowsToStorage(fleetRows);
  }, [fleetRows]);

  const updateFleetRow = (id: string, key: keyof BulkVesselFleetRecord, raw: string) => {
    setFleetRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        if (key === "name" || key === "category") {
          return { ...row, [key]: raw };
        }
        const n = parseFloat(raw.replace(/,/g, ""));
        return { ...row, [key]: Number.isFinite(n) ? n : 0 };
      }),
    );
  };

  const addFleetRow = () => {
    setFleetRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        category: "Handysize",
        dwt: 0,
        grainCapacityM3: 0,
        baleCapacityM3: 0,
      },
    ]);
    toast.success(t("freight.toast.rowAdded"));
  };

  const removeFleetRow = (id: string) => {
    setFleetRows((prev) => prev.filter((r) => r.id !== id));
  };

  const resetFleetToSample = () => {
    setFleetRows(createDefaultFleetRowsWithIds());
    toast.info(t("freight.toast.fleetReset"));
  };

  const updateRoute = (id: string, key: keyof FreightRoute, value: string | number) => {
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
    toast.success(t("freight.toast.routeAdded"));
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
            <Ship className="h-7 w-7 text-primary" /> {t("freight.pageTitle")}
          </h1>
          <p className="page-subtitle">{t("freight.pageSubtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowSettings(v => !v)}>
            <Settings2 className="h-3.5 w-3.5 mr-1.5" /> {t("freight.settings")}
          </Button>
          <Button size="sm" onClick={addRoute} className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> {t("freight.addRoute")}
          </Button>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
      )}

      {/* Formulas reference */}
      <div className="mb-4 p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[10px] text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
        <span>{t("freight.formula.tc")}</span>
        <span>{t("freight.formula.bf")}</span>
        <span>{t("freight.formula.wr")}</span>
        <span className="text-primary font-semibold">
          {t("freight.formula.buyer", { n: settings.buyerMarkup.toFixed(2) })}
        </span>
      </div>

      {/* Main table or card grid */}
      {settings.simulationCardLayout ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {routes.map((r) => (
            <RouteSimulationCard
              key={r.id}
              route={r}
              cargoSizes={cargoSizes}
              buyerMarkup={buyerMarkup}
              onUpdate={updateRoute}
              onRemove={removeRoute}
            />
          ))}
        </div>
      ) : (
        <div className="chart-container overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Top header row: group labels */}
              <tr className="border-b border-border">
                <th rowSpan={2} className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider sticky left-0 bg-card z-10 min-w-[140px] border-r border-border">
                  {t("freight.table.route")}
                </th>
                <th colSpan={7} className="text-center py-1.5 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider border-r border-border">
                  {t("freight.table.inputParams")}
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
                <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">{t("freight.label.bunker")}</th>
                <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">{t("freight.label.tcDay")}</th>
                <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">{t("freight.label.days")}</th>
                <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">{t("freight.label.bfMtDay")}</th>
                <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">{t("freight.label.warRisk")}</th>
                <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center">{t("freight.label.iran")}</th>
                <th className="py-1.5 px-1.5 text-[9px] text-muted-foreground font-medium text-center border-r border-border">{t("freight.label.otherPerT")}</th>
                {cargoSizes.map((size) => (
                  <th key={size} colSpan={3} className="border-r border-border last:border-r-0">
                    <div className="flex">
                      <span className="flex-1 py-1 text-[9px] text-muted-foreground font-medium text-center">{t("freight.table.total")}</span>
                      <span className="flex-1 py-1 text-[9px] text-accent font-semibold text-center border-l border-border/40">{t("freight.table.buyer")}</span>
                      <span className="flex-1 py-1 text-[9px] text-muted-foreground/60 font-medium text-center border-l border-border/40">{t("freight.table.tcShort")}</span>
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
                            {fmt(c.total, locale)}
                          </span>
                          <span className="flex-1 text-center font-mono text-[10px] font-bold text-accent px-1 border-l border-border/30">
                            {fmt(c.buyer, locale)}
                          </span>
                          <span className="flex-1 text-center font-mono text-[10px] text-muted-foreground px-1 border-l border-border/30">
                            {fmt(c.tc, locale)}
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
      )}

      {/* Bulk carrier classes + fleet xlsx (mapping data) */}
      <Collapsible className="mt-5 rounded-lg border border-border/60 bg-card/40">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold hover:bg-muted/30 rounded-t-lg">
          <span>{t("freight.collapsibleTitle")}</span>
          <span className="text-[10px] font-normal text-muted-foreground shrink-0">{t("freight.collapsibleBadge")}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">
            <p className="text-[11px] text-muted-foreground max-w-3xl">{t("freight.bulkIntro")}</p>
            <div className="rounded-md border border-border/50 overflow-hidden bg-muted/10">
              <img
                src={BULK_CARRIER_CLASSES_IMAGE}
                alt={t("freight.bulkImgAlt")}
                className="w-full max-h-[420px] object-contain object-left"
              />
            </div>
            <div className="overflow-x-auto rounded-md border border-border/50">
              <table className="w-full text-[10px] data-table">
                <thead>
                  <tr>
                    <th className="text-left">{t("freight.table.class")}</th>
                    <th className="text-right">{t("freight.table.dwt")}</th>
                    <th className="text-left">{t("freight.table.length")}</th>
                    <th className="text-left">{t("freight.table.draft")}</th>
                  </tr>
                </thead>
                <tbody>
                  {BULK_CARRIER_CLASS_SEGMENTS.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.label}</td>
                      <td className="text-right font-mono">
                        {s.dwtMin.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} – {s.dwtMax.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}
                      </td>
                      <td className="font-mono text-muted-foreground">{fmtDim(s.lengthM)}</td>
                      <td className="font-mono text-muted-foreground">{fmtDim(s.draftM)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  {t("freight.fleetMappingTitle")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" onClick={resetFleetToSample}>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {t("freight.reset")}
                  </Button>
                  <Button type="button" size="sm" className="h-7 text-[10px]" onClick={addFleetRow}>
                    <Plus className="h-3 w-3 mr-1" />
                    {t("freight.addRow")}
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{t("freight.fleetHelp")}</p>
              <div className="overflow-x-auto rounded-md border border-border/50 max-h-[min(480px,55vh)] overflow-y-auto">
                <table className="w-full text-[10px] data-table">
                  <thead className="sticky top-0 z-[1] bg-card shadow-sm">
                    <tr>
                      <th className="text-left min-w-[100px]">{t("freight.col.vesselName")}</th>
                      <th className="text-left min-w-[88px]">{t("freight.col.category")}</th>
                      <th className="text-right min-w-[72px]">{t("freight.table.dwt")}</th>
                      <th className="text-right min-w-[80px]">{t("freight.table.grain")}</th>
                      <th className="text-right min-w-[80px]">{t("freight.table.bale")}</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {fleetRows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-1.5 px-1">
                          <Input
                            className="h-7 text-[10px] font-mono"
                            value={row.name}
                            onChange={(e) => updateFleetRow(row.id, "name", e.target.value)}
                            placeholder={t("freight.placeholder.name")}
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <Input
                            className="h-7 text-[10px]"
                            value={row.category}
                            onChange={(e) => updateFleetRow(row.id, "category", e.target.value)}
                            placeholder={t("freight.placeholder.class")}
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <Input
                            className="h-7 text-[10px] font-mono text-right"
                            type="number"
                            value={row.dwt}
                            onChange={(e) => updateFleetRow(row.id, "dwt", e.target.value)}
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <Input
                            className="h-7 text-[10px] font-mono text-right"
                            type="number"
                            value={row.grainCapacityM3}
                            onChange={(e) => updateFleetRow(row.id, "grainCapacityM3", e.target.value)}
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <Input
                            className="h-7 text-[10px] font-mono text-right"
                            type="number"
                            value={row.baleCapacityM3}
                            onChange={(e) => updateFleetRow(row.id, "baleCapacityM3", e.target.value)}
                          />
                        </td>
                        <td className="py-1 px-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive/60 hover:text-destructive"
                            onClick={() => removeFleetRow(row.id)}
                            aria-label={t("freight.removeRow")}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {fleetRows.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic">{t("freight.fleetEmpty")}</p>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground">{t("freight.sourceFile")}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* War-risk reference */}
      <div className="mt-5 p-3 rounded-lg bg-muted/20 border border-border/50 text-[10px] text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">{t("freight.warRiskTitle")}</p>
        <div className="grid grid-cols-3 gap-2">
          <span>× 0.5% = <strong className="text-foreground font-mono">$200,000</strong></span>
          <span>× 1.0% = <strong className="text-foreground font-mono">$400,000</strong></span>
          <span>× 1.5% = <strong className="text-foreground font-mono">$600,000</strong></span>
        </div>
        <p className="mt-1">{t("freight.iranFee")}</p>
      </div>
    </DashboardLayout>
  );
}
