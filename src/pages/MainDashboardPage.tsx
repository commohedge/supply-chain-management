import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { LogisticsStatusTable } from "@/components/logistics/LogisticsStatusTable";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useI18n } from "@/contexts/I18nContext";
import { HUB_LOGISTICS_RESEED_EVENT, loadHubCommodity, saveLogisticsRowsOnly } from "@/data/hubCommodityData";
import type { LogisticsStatusRow } from "@/types/logistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Boxes, Clock, Ship, Warehouse, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandingLogo } from "@/components/dashboard/BrandingLogo";
import { displayDashboardDataText } from "@/i18n/dashboardDataText";

const GlobalMap = lazy(() => import("@/components/dashboard/GlobalMap"));

const ttStyle = {
  contentStyle: {
    backgroundColor: "hsl(0, 0%, 8%)",
    border: "1px solid hsl(0, 0%, 16%)",
    borderRadius: "8px",
    color: "hsl(0, 0%, 95%)",
    fontSize: "11px",
    fontFamily: "JetBrains Mono",
  },
};

const VESSEL_COLORS = ["hsl(199,89%,48%)", "hsl(72,100%,50%)", "hsl(38,92%,50%)", "hsl(0,0%,45%)"];

function parsePercent(s: string): number {
  const n = parseFloat(String(s).replace(/%/g, ""));
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}

function MainKpiCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <div className="rounded-lg bg-primary/12 p-2.5 text-primary">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate font-mono text-xl font-bold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}

/** KPI strip above the logistics table (dashboard mock style) */
function LogisticsTableStatCard({
  value,
  label,
  valueClass,
  shellClass,
}: {
  value: string;
  label: string;
  valueClass: string;
  shellClass: string;
}) {
  return (
    <div className={cn("rounded-xl border p-4 text-center shadow-sm", shellClass)}>
      <div className={cn("text-2xl font-mono font-bold tabular-nums tracking-tight", valueClass)}>{value}</div>
      <div className="mt-2 text-[11px] font-medium leading-snug text-muted-foreground">{label}</div>
    </div>
  );
}

export default function MainDashboardPage() {
  const { t, locale } = useI18n();
  const { config } = useDashboardData();
  const { storage = [] } = config.overview;
  const supply = config.supply;
  const pipeline = config.pipeline;
  const { ports: refPorts = [] } = config.referentiel;

  const [logisticsRows, setLogisticsRows] = useState<LogisticsStatusRow[]>(() => loadHubCommodity().logisticsRows);

  useEffect(() => {
    saveLogisticsRowsOnly(logisticsRows);
  }, [logisticsRows]);

  useEffect(() => {
    const onReseed = () => setLogisticsRows(loadHubCommodity().logisticsRows);
    window.addEventListener(HUB_LOGISTICS_RESEED_EVENT, onReseed);
    return () => window.removeEventListener(HUB_LOGISTICS_RESEED_EVENT, onReseed);
  }, []);

  const totalStockMt = useMemo(() => {
    const kt = storage.reduce((s, x) => s + (x.inStock ?? 0), 0);
    return (kt / 1000).toFixed(1);
  }, [storage]);

  const inTransitMt = useMemo(() => {
    const kt = storage.reduce((s, x) => s + (x.inTransit ?? 0), 0);
    return (kt / 1000).toFixed(1);
  }, [storage]);

  const storageCapacityMt = useMemo(() => {
    const sum = refPorts.reduce((s, p) => s + (Number(p.capacityMt) || 0), 0);
    return sum > 0 ? sum.toFixed(1) : "—";
  }, [refPorts]);

  const avgLeadDays = useMemo(() => {
    const cov = pipeline.coverage ?? [];
    if (cov.length === 0) return "—";
    const avg = cov.reduce((s, c) => s + c.days, 0) / cov.length;
    return String(Math.round(avg));
  }, [pipeline.coverage]);

  const supplyKpis = supply.kpis ?? [];
  const production = supply.production ?? [];
  const supplyPorts = supply.ports ?? [];
  const vessels = supply.vessels ?? { inPort: 0, atSea: 0, charterOptions: 0 };

  const vesselPieData = useMemo(
    () => [
      { name: t("supply.vesselInPort"), value: vessels.inPort },
      { name: t("supply.vesselAtSea"), value: vessels.atSea },
      { name: t("supply.charterOptions"), value: vessels.charterOptions },
    ],
    [t, vessels.inPort, vessels.atSea, vessels.charterOptions],
  );

  const logisticsSummary = useMemo(() => {
    const n = logisticsRows.length;
    if (n === 0) {
      return { volMt: "0.00", avgCost: "—", avgEta: "—" };
    }
    const volKt = logisticsRows.reduce((s, r) => s + (r.volumeKt ?? 0), 0);
    const avgCost = logisticsRows.reduce((s, r) => s + (r.costUsdPerT ?? 0), 0) / n;
    const avgEta = logisticsRows.reduce((s, r) => s + (r.etaDays ?? 0), 0) / n;
    return {
      volMt: (volKt / 1000).toFixed(2),
      avgCost: avgCost.toFixed(1),
      avgEta: avgEta.toFixed(1),
    };
  }, [logisticsRows]);

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <BrandingLogo
            logoDataUrl={config.general.logoDataUrl}
            className="h-12 w-12 text-base"
            imgClassName="h-12 w-12 max-h-12 max-w-12"
          />
          <div>
            <h1 className="page-title text-balance">{t("mainDash.title")}</h1>
            <p className="page-subtitle max-w-2xl">{t("mainDash.subtitle")}</p>
          </div>
        </div>
        <div className="text-right text-xs font-mono text-muted-foreground whitespace-nowrap">
          {t("nav.statusAsOf")} {config.general.dashboardDate}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MainKpiCard icon={Boxes} label={t("mainDash.kpi.totalStock")} value={`${totalStockMt} Mt`} />
        <MainKpiCard icon={Ship} label={t("mainDash.kpi.inTransit")} value={`${inTransitMt} Mt`} />
        <MainKpiCard icon={Warehouse} label={t("mainDash.kpi.storageCapacity")} value={`${storageCapacityMt} Mt`} />
        <MainKpiCard
          icon={Clock}
          label={t("mainDash.kpi.avgLeadTime")}
          value={avgLeadDays === "—" ? "—" : `${avgLeadDays} ${t("mainDash.days")}`}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Map + filters */}
        <div className="space-y-3 xl:col-span-8">
          <SectionHeader title={t("mainDash.mapSectionTitle")} subtitle={t("mainDash.mapSectionSubtitle")} />

          <div className="chart-container overflow-hidden p-0" style={{ height: "min(55vh, 520px)", minHeight: 420 }}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {t("map.loading")}
                </div>
              }
            >
              <GlobalMap logisticsRows={logisticsRows} />
            </Suspense>
          </div>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="py-3 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("mainDash.decisionCardTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-3 pt-0">
              <table className="w-full min-w-[640px] text-[11px]">
                <thead>
                  <tr className="border-b border-border/60 text-left text-muted-foreground">
                    <th className="pb-2 pr-2 font-medium">{t("mainDash.decision.route")}</th>
                    <th className="pb-2 pr-2 font-medium">{t("mainDash.decision.avail")}</th>
                    <th className="pb-2 pr-2 font-medium">{t("mainDash.decision.cost")}</th>
                    <th className="pb-2 pr-2 font-medium">{t("mainDash.decision.pressure")}</th>
                    <th className="pb-2 pr-2 font-medium">{t("mainDash.decision.maad")}</th>
                    <th className="pb-2 pr-2 font-medium">{t("mainDash.decision.russia")}</th>
                    <th className="pb-2 font-medium">{t("mainDash.decision.india")}</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {(
                    [
                      ["Brazil", "850", "$548", t("mainDash.decision.high"), "—", t("mainDash.decision.low"), t("mainDash.decision.med")],
                      ["US Gulf", "420", "$612", t("mainDash.decision.med"), t("mainDash.decision.med"), t("mainDash.decision.high"), t("mainDash.decision.low")],
                      ["India Direct", "1 100", "$610", t("mainDash.decision.high"), t("mainDash.decision.high"), "—", t("mainDash.decision.high")],
                      ["Europe", "650", "$600", t("mainDash.decision.low"), t("mainDash.decision.low"), t("mainDash.decision.med"), t("mainDash.decision.med")],
                    ] as const
                  ).map((row) => (
                    <tr key={row[0]} className="border-b border-border/40 last:border-0">
                      {row.map((cell, i) => (
                        <td key={i} className="py-1.5 pr-2 text-foreground/90">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Supply & execution */}
        <div className="space-y-4 xl:col-span-4">
          <SectionHeader title={t("mainDash.supplyTitle")} subtitle={t("mainDash.supplySubtitle")} />

          <div className="grid grid-cols-2 gap-2">
            {supplyKpis.slice(0, 6).map((k, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/60 bg-card/50 px-3 py-2.5"
              >
                <div className="text-[9px] font-medium uppercase leading-tight text-muted-foreground">
                  {displayDashboardDataText(k.label, locale)}
                </div>
                <div className="mt-1 font-mono text-base font-bold text-foreground">{k.value}</div>
                {k.subtitle && (
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {displayDashboardDataText(k.subtitle, locale)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Card className="border-border/60">
            <CardHeader className="py-3">
              <CardTitle className="text-xs font-semibold">{t("mainDash.productionTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="h-[160px] pb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={production.slice(0, 8)} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,50%)", fontSize: 9 }} />
                  <YAxis tick={{ fill: "hsl(0,0%,50%)", fontSize: 9 }} width={32} />
                  <Tooltip {...ttStyle} />
                  <Bar dataKey="volume" name={t("supply.barVolume")} fill="hsl(72,100%,45%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="py-3">
              <CardTitle className="text-xs font-semibold">{t("mainDash.portsLoadTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              {supplyPorts.slice(0, 4).map((p) => (
                <div key={p.port} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">{p.port}</span>
                    <span className="font-mono">{p.utilization}</span>
                  </div>
                  <Progress value={parsePercent(p.utilization)} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="py-3">
              <CardTitle className="text-xs font-semibold">{t("mainDash.vesselsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 pb-3">
              <ResponsiveContainer width="45%" height={120}>
                <PieChart>
                  <Pie
                    data={vesselPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={48}
                    strokeWidth={1}
                  >
                    {vesselPieData.map((_, i) => (
                      <Cell key={i} fill={VESSEL_COLORS[i % VESSEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...ttStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="min-w-0 flex-1 space-y-1.5 text-[11px]">
                <div className="font-mono text-lg font-bold">{vessels.inPort + vessels.atSea + vessels.charterOptions}</div>
                <div className="text-muted-foreground">{t("supply.fleetTotal", { n: vessels.inPort + vessels.atSea + vessels.charterOptions })}</div>
                <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                  <div>
                    <div className="font-mono font-semibold text-info">{vessels.inPort}</div>
                    <div className="text-[9px] text-muted-foreground">{t("supply.vesselInPort")}</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-primary">{vessels.atSea}</div>
                    <div className="text-[9px] text-muted-foreground">{t("supply.vesselAtSea")}</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-warning">{vessels.charterOptions}</div>
                    <div className="text-[9px] text-muted-foreground">{t("supply.charterOptions")}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logistics table */}
      <div className="chart-container space-y-4">
        <div className="text-center">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{t("mainDash.logisticsTableTitle")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("mainDash.tableSubtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <LogisticsTableStatCard
            value={String(logisticsRows.length)}
            label={t("mainDash.logisticsKpi.totalVessels")}
            valueClass="text-sky-400"
            shellClass="border-sky-500/25 bg-sky-500/5"
          />
          <LogisticsTableStatCard
            value={`${logisticsSummary.volMt} MT`}
            label={t("mainDash.logisticsKpi.totalVolume")}
            valueClass="text-emerald-400"
            shellClass="border-emerald-500/25 bg-emerald-500/5"
          />
          <LogisticsTableStatCard
            value={logisticsSummary.avgCost === "—" ? "—" : `$${logisticsSummary.avgCost}`}
            label={t("mainDash.logisticsKpi.avgCost")}
            valueClass="text-amber-500"
            shellClass="border-amber-500/25 bg-amber-500/5"
          />
          <LogisticsTableStatCard
            value={logisticsSummary.avgEta === "—" ? "—" : logisticsSummary.avgEta}
            label={t("mainDash.logisticsKpi.avgEta")}
            valueClass="text-violet-400"
            shellClass="border-violet-500/25 bg-violet-500/5"
          />
        </div>

        <LogisticsStatusTable
          rows={logisticsRows}
          onRowsChange={setLogisticsRows}
          mappings={config.logisticsMappings}
          clientNames={config.referentiel.clients.map((c) => c.name)}
          showHeading={false}
          dense
        />
      </div>
    </DashboardLayout>
  );
}
