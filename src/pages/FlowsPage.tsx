import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader, DataTable } from "@/components/dashboard/DashboardWidgets";

const arbitrageData = [
  { type: "Geographic Arbitrage", description: "Exploit price differences between regions by redirecting physical flows", example: "Ship DAP to India instead of Brazil when netback is higher", lever: "Geography + Logistics" },
  { type: "Contract vs Spot", description: "Optimize between long-term contracts and spot market sales", example: "Sell minimum contracted volumes, maximize spot during spikes", lever: "Timing" },
  { type: "Value Chain (Rock-Acid-DAP)", description: "Switch between selling rock, acid or DAP depending on margin", example: "Stop DAP production and sell acid when ammonia is expensive", lever: "Industrial Flexibility" },
  { type: "Ammonia Arbitrage", description: "Adjust production based on ammonia cost fluctuations", example: "Reduce DAP output when ammonia prices surge", lever: "Input Timing" },
  { type: "Sulfur Arbitrage", description: "Optimize sulfur sourcing and timing", example: "Buy sulfur during low price periods and store for later use", lever: "Input + Storage" },
  { type: "Seasonal Arbitrage", description: "Align flows with agricultural demand cycles", example: "Shift volumes between India (Kharif) and Brazil (soy)", lever: "Timing + Geography" },
  { type: "Storage (Contango)", description: "Store product when future prices are higher than spot", example: "Store DAP in ports, sell later at higher forward prices", lever: "Storage" },
  { type: "Freight Arbitrage", description: "Exploit differences between freight spot and long-term rates", example: "Lock vessels at low rates, benefit when freight spikes", lever: "Logistics" },
  { type: "Port & Routing", description: "Optimize delivery routes and avoid congestion", example: "Switch ports to avoid delays and capture better pricing windows", lever: "Logistics" },
  { type: "India Subsidy", description: "Exploit government pricing distortions", example: "Increase exports when subsidies increase effective prices", lever: "Geography + Policy" },
  { type: "Forex Arbitrage", description: "Manage currency exposure across markets", example: "Hedge USD vs INR vs MAD for India sales", lever: "Financial" },
  { type: "Paper vs Physical", description: "Use derivatives to hedge and enhance physical trades", example: "Lock futures price and sell physical at higher spot", lever: "Financial + Timing" },
];

export default function FlowsPage() {
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
          rows={arbitrageData.map(d => [
            <span className="font-semibold text-primary">{d.type}</span>,
            d.description,
            <span className="text-muted-foreground">{d.example}</span>,
            <span className="status-badge status-low">{d.lever}</span>,
          ])}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="chart-container">
          <SectionHeader title="Key Insight" subtitle="Geographic" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Control of vessels and routing allows cargo redirection mid-journey. Current netback spread between India ($615/t) and Brazil ($575/t) creates a <span className="text-primary font-semibold">$40/t arbitrage opportunity</span>.
          </p>
        </div>
        <div className="chart-container">
          <SectionHeader title="Key Insight" subtitle="Timing" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Forward curve in contango (Q2→Q4: +$40/t). Storage cost ~$8/t/month. <span className="text-primary font-semibold">Net carry trade: +$16/t</span> for 3-month hold at current rates.
          </p>
        </div>
        <div className="chart-container">
          <SectionHeader title="Key Insight" subtitle="Freight" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Supramax rates volatile (±15% 30D). Locking 6-month charters at current levels could save <span className="text-primary font-semibold">$5-8/t</span> if rates normalize upward.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
