import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useI18n } from "@/contexts/I18nContext";
import { displayDashboardDataText } from "@/i18n/dashboardDataText";

const ttStyle = {
  contentStyle: { backgroundColor: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)", fontSize: "12px", fontFamily: "JetBrains Mono" },
};

export default function OverviewPage() {
  const { t, locale } = useI18n();
  const { config } = useDashboardData();
  const { kpis = [], storage = [], demand = [], forecast = [], imports = [], exports: exportProducts = [] } = config.overview;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("overview.pageTitle")}</h1>
          <p className="page-subtitle">{t("overview.pageSubtitle")}</p>
        </div>
        <div className="text-xs text-muted-foreground font-mono">{config.general.dashboardDate}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((k, i) => (
          <KpiCard
            key={i}
            label={displayDashboardDataText(k.label, locale)}
            value={k.value}
            change={displayDashboardDataText(k.change, locale)}
            changeDirection={k.changeDirection}
            subtitle={k.subtitle ? displayDashboardDataText(k.subtitle, locale) : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title={t("overview.storageTitle")} subtitle={t("overview.storageSubtitle")} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storage} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="country" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Bar dataKey="inStock" name={t("overview.barInStock")} fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
              <Bar dataKey="inTransit" name={t("overview.barInTransit")} fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
              <Bar dataKey="planned" name={t("overview.barPlanned")} fill="hsl(38,92%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title={t("overview.demandTitle")} subtitle={t("overview.demandSubtitle")} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demand} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="country" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Bar dataKey="y2025" name="2025" fill="hsl(0,0%,40%)" radius={[4,4,0,0]} />
              <Bar dataKey="y2026ytd" name="2026 YTD" fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
              <Bar dataKey="y2026f" name="2026 Forecast" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container mb-8">
        <SectionHeader title={t("overview.forecastTitle")} subtitle={t("overview.forecastSubtitle")} />
        <DataTable
          headers={[
            t("overview.forecastCol.country"),
            t("overview.forecastCol.opening"),
            t("overview.forecastCol.arrivals"),
            t("overview.forecastCol.shipments"),
            t("overview.forecastCol.closing"),
            t("overview.forecastCol.change"),
          ]}
          rows={forecast.map(d => [
            d.country,
            d.startingStock.toLocaleString(),
            <span className="kpi-change-up">{d.arrivals.toLocaleString()}</span>,
            <span className="kpi-change-down">{d.shipments.toLocaleString()}</span>,
            d.endingStock.toLocaleString(),
            <span className={d.endingStock >= d.startingStock ? "kpi-change-up" : "kpi-change-down"}>
              {d.endingStock >= d.startingStock ? "▲" : "▼"} {Math.abs(d.endingStock - d.startingStock).toLocaleString()} kt
            </span>,
          ])}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title={t("overview.importsTitle")} subtitle={t("overview.importsSubtitle")} />
          <DataTable
            headers={[
              t("overview.importsCol.material"),
              t("overview.importsCol.volume"),
              t("overview.importsCol.suppliers"),
              t("overview.importsCol.usage"),
            ]}
            rows={imports.map(d => [
              <span className="font-semibold text-primary">{d.material}</span>,
              d.volume,
              <span className="text-muted-foreground text-xs">{d.suppliers}</span>,
              <span className="text-xs">{d.usage}</span>,
            ])}
          />
        </div>

        <div className="chart-container">
          <SectionHeader title={t("overview.exportsTitle")} subtitle={t("overview.exportsSubtitle")} />
          <DataTable
            headers={[
              t("overview.exportsCol.product"),
              t("overview.exportsCol.volume"),
              t("overview.exportsCol.markets"),
              t("overview.exportsCol.share"),
            ]}
            rows={exportProducts.map(d => [
              <span className="font-semibold">{d.product}</span>,
              d.volume,
              <span className="text-muted-foreground text-xs">{d.mainMarkets}</span>,
              <span className="font-mono text-primary">{d.share}</span>,
            ])}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
