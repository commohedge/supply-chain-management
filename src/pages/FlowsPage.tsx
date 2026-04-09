import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader, DataTable } from "@/components/dashboard/DashboardWidgets";
import { useDashboardData } from "@/contexts/DashboardDataContext";

export default function FlowsPage() {
  const { config } = useDashboardData();
  const { arbitrage, insights } = config.flows;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Flows & Arbitrage</h1>
          <p className="page-subtitle">Supply flow optimization, arbitrage strategies & competitive intelligence</p>
        </div>
      </div>

      <div className="chart-container mb-8">
        <SectionHeader title="Arbitrage Opportunities Matrix" subtitle="Key strategies leveraged by Trafigura, Glencore, Vitol" />
        <DataTable
          headers={["Strategy", "Description", "Example", "Main Lever"]}
          rows={arbitrage.map(d => [
            <span className="font-semibold text-primary">{d.type}</span>,
            d.description,
            <span className="text-muted-foreground">{d.example}</span>,
            <span className="status-badge status-low">{d.lever}</span>,
          ])}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
