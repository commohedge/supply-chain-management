import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader, DataTable } from "@/components/dashboard/DashboardWidgets";
import { useDashboardData } from "@/contexts/DashboardDataContext";

export default function FlowsPage() {
  const { config } = useDashboardData();
  const { arbitrage, insights, tradeRoutes } = config.flows;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Flows & Arbitrage</h1>
          <p className="page-subtitle">Optimisation des flux, stratégies d'arbitrage & intelligence compétitive — OCP</p>
        </div>
      </div>

      <div className="chart-container mb-8">
        <SectionHeader title="Routes Commerciales Principales" subtitle="Flux physiques OCP — Ports d'origine vers destinations" />
        <DataTable
          headers={["Origine", "Destination", "Produit", "Volume/Trim.", "Transit (jours)"]}
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
        <SectionHeader title="Matrice d'Opportunités d'Arbitrage" subtitle="Stratégies clés — Inspiré des modèles Trafigura, Glencore, Vitol" />
        <DataTable
          headers={["Stratégie", "Description", "Exemple OCP", "Levier"]}
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
