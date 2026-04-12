import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { LogisticsStatusTable } from "@/components/logistics/LogisticsStatusTable";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useI18n } from "@/contexts/I18nContext";
import { loadHubCommodity, saveLogisticsRowsOnly } from "@/data/hubCommodityData";
import type { LogisticsStatusRow } from "@/types/logistics";

const GlobalMap = lazy(() => import("@/components/dashboard/GlobalMap"));

export default function MapPage() {
  const { t } = useI18n();
  const { config } = useDashboardData();
  const { tradeRoutes = [] } = config.flows;

  const [logisticsRows, setLogisticsRows] = useState<LogisticsStatusRow[]>(() => loadHubCommodity().logisticsRows);

  useEffect(() => {
    saveLogisticsRowsOnly(logisticsRows);
  }, [logisticsRows]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">🗺️ {t("map.pageTitle")}</h1>
          <p className="page-subtitle">{t("map.pageSubtitle")}</p>
        </div>
      </div>

      {/* Map */}
      <div className="chart-container mb-6" style={{ height: "65vh", minHeight: 500 }}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {t("map.loading")}
          </div>
        }>
          <GlobalMap logisticsRows={logisticsRows} />
        </Suspense>
      </div>

      {/* Logistics status — même données que Data → Logistics */}
      <div className="chart-container mb-6">
        <LogisticsStatusTable
          rows={logisticsRows}
          onRowsChange={setLogisticsRows}
          mappings={config.logisticsMappings}
          clientNames={config.referentiel.clients.map((c) => c.name)}
          title={t("logistics.titleDefault")}
          subtitle={t("map.tableSubtitle")}
        />
      </div>

      {/* Route summary */}
      <div className="chart-container">
        <SectionHeader title={t("map.routesActive")} subtitle={t("map.routesSubtitle", { count: tradeRoutes.length })} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
          {tradeRoutes.map((route, i) => (
            <div key={i} className="bg-secondary/30 border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono text-primary">{route.product}</span>
              </div>
              <div className="text-sm font-semibold">{route.origin}</div>
              <div className="text-xs text-muted-foreground mb-1">→ {route.destination}</div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
                <span>{route.volume}</span>
                <span>{route.transitDays}j</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
