import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader, DataTable } from "@/components/dashboard/DashboardWidgets";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useI18n } from "@/contexts/I18nContext";

export default function FlowsPage() {
  const { t } = useI18n();
  const { config } = useDashboardData();
  const { arbitrage = [], insights = [], tradeRoutes = [] } = config.flows;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("flows.pageTitle")}</h1>
          <p className="page-subtitle">{t("flows.subtitle")}</p>
        </div>
      </div>

      <div className="chart-container mb-8">
        <SectionHeader title={t("flows.routesTitle")} subtitle={t("flows.routesSubtitle")} />
        <DataTable
          headers={[
            t("flows.routesCol.origin"),
            t("flows.routesCol.dest"),
            t("flows.routesCol.product"),
            t("flows.routesCol.vol"),
            t("flows.routesCol.transit"),
          ]}
          rows={tradeRoutes.map(d => [
            <span className="font-semibold text-primary">{d.origin}</span>,
            d.destination,
            <span className="font-mono text-xs">{d.product}</span>,
            d.volume,
            <span className="font-mono">{d.transitDays}</span>,
          ])}
        />
      </div>

      <div className="chart-container mb-8">
        <SectionHeader title={t("flows.arbitrageTitle")} subtitle={t("flows.arbitrageSubtitle")} />
        <DataTable
          headers={[
            t("flows.arbCol.strategy"),
            t("flows.arbCol.desc"),
            t("flows.arbCol.example"),
            t("flows.arbCol.lever"),
          ]}
          rows={arbitrage.map(d => [
            <span className="font-semibold text-primary">{d.type}</span>,
            <span className="text-xs">{d.description}</span>,
            <span className="text-muted-foreground text-xs">{d.example}</span>,
            <span className="status-badge status-low">{d.lever}</span>,
          ])}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, i) => (
          <div key={i} className="chart-container">
            <SectionHeader title={insight.title} subtitle={insight.subtitle} />
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
