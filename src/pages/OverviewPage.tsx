import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDashboardData } from "@/contexts/DashboardDataContext";

const ttStyle = {
  contentStyle: { backgroundColor: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)", fontSize: "12px", fontFamily: "JetBrains Mono" },
};

export default function OverviewPage() {
  const { config } = useDashboardData();
  const { kpis = [], storage = [], demand = [], forecast = [], imports = [], exports: exportProducts = [] } = config.overview;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Supply Chain Dashboard — OCP Group</h1>
          <p className="page-subtitle">Vue globale — Phosphates & Engrais (DAP/MAP/TSP/NPK)</p>
        </div>
        <div className="text-xs text-muted-foreground font-mono">{config.general.dashboardDate}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} change={k.change} changeDirection={k.changeDirection} subtitle={k.subtitle} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Capacité de Stockage par Filiale" subtitle="In Stock / In Transit / Planned (kt)" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storage} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="country" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Bar dataKey="inStock" name="En Stock" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
              <Bar dataKey="inTransit" name="En Transit" fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
              <Bar dataKey="planned" name="Planifié" fill="hsl(38,92%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Demande par Marché" subtitle="2025 vs 2026 YTD vs 2026 Forecast (kt)" />
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
        <SectionHeader title="Prévisions Stock — 30 Prochains Jours" subtitle="Stock Initial, Arrivées, Expéditions, Stock Final (kt)" />
        <DataTable
          headers={["Pays", "Stock Initial", "Arrivées", "Expéditions", "Stock Final", "Variation"]}
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
          <SectionHeader title="Importations — Matières Premières" subtitle="Dépendances critiques OCP" />
          <DataTable
            headers={["Matière", "Volume/Coût", "Fournisseurs Clés", "Usage"]}
            rows={imports.map(d => [
              <span className="font-semibold text-primary">{d.material}</span>,
              d.volume,
              <span className="text-muted-foreground text-xs">{d.suppliers}</span>,
              <span className="text-xs">{d.usage}</span>,
            ])}
          />
        </div>

        <div className="chart-container">
          <SectionHeader title="Exportations — Portefeuille Produits" subtitle="Production & marchés clés" />
          <DataTable
            headers={["Produit", "Volume", "Marchés Principaux", "Part"]}
            rows={exports.map(d => [
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
