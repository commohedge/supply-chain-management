import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDashboardData } from "@/contexts/DashboardDataContext";

const COLORS = ["hsl(72, 100%, 50%)", "hsl(199, 89%, 48%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)"];
const chartTooltipStyle = {
  contentStyle: { backgroundColor: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)", fontSize: "12px", fontFamily: "JetBrains Mono" },
};

export default function OverviewPage() {
  const { config } = useDashboardData();
  const { kpis, storage, demand, forecast } = config.overview;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Supply Chain Dashboard</h1>
          <p className="page-subtitle">Global overview — Fertilizers (DAP/MAP/TSP)</p>
        </div>
        <div className="text-xs text-muted-foreground font-mono">{config.general.dashboardDate}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} change={k.change} changeDirection={k.changeDirection} subtitle={k.subtitle} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Storage Capacity by Subsidiary" subtitle="In Stock / In Transit / Planned (kt)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={storage} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="country" tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Bar dataKey="inStock" name="In Stock" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
              <Bar dataKey="inTransit" name="In Transit" fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
              <Bar dataKey="planned" name="Planned" fill="hsl(38,92%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Market Demand" subtitle="2025 vs 2026 YTD vs 2026 Forecast (kt)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={demand} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="country" tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Bar dataKey="y2025" name="2025" fill="hsl(0,0%,40%)" radius={[4,4,0,0]} />
              <Bar dataKey="y2026ytd" name="2026 YTD" fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
              <Bar dataKey="y2026f" name="2026 Forecast" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container mb-8">
        <SectionHeader title="Forecast Stock Level — Next 30 Days" subtitle="Starting Stock, Arrivals, Shipments, Ending Stock (kt)" />
        <DataTable
          headers={["Country", "Starting Stock", "Arrivals", "Shipments", "Ending Stock", "Total"]}
          rows={forecast.map(d => [
            d.country,
            d.startingStock.toLocaleString(),
            <span className="kpi-change-up">{d.arrivals.toLocaleString()}</span>,
            <span className="kpi-change-down">{d.shipments.toLocaleString()}</span>,
            d.endingStock.toLocaleString(),
            <span className="font-semibold">{(d.startingStock + d.arrivals).toLocaleString()}</span>,
          ])}
        />
      </div>
    </DashboardLayout>
  );
}
