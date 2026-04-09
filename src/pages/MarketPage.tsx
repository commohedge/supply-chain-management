import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useDashboardData } from "@/contexts/DashboardDataContext";

const COLORS = ["hsl(72,100%,50%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(0,0%,45%)", "hsl(280,70%,50%)"];
const ttStyle = { contentStyle: { backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: "8px", color: "hsl(0,0%,95%)", fontSize: "12px", fontFamily: "JetBrains Mono" } };

export default function MarketPage() {
  const { config } = useDashboardData();
  const { kpis = [], prices = [], inventory = [], demandByRegion = [], competitors = [], netback = [], supplyDemand = [], competitorDetails = [] } = config.market;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Market & Value</h1>
          <p className="page-subtitle">Demande, pricing, netback & paysage concurrentiel — Phosphates mondiaux</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} subtitle={k.subtitle} change={k.change} changeDirection={k.changeDirection} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Benchmark Prix" subtitle="$/t, FOB — DAP Tampa / DAP India / FOB Jorf" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={prices}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} domain={[480, 680]} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Line type="monotone" dataKey="tampa" name="DAP Tampa" stroke="hsl(72,100%,50%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="india" name="DAP India" stroke="hsl(199,89%,48%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="jorf" name="FOB Jorf" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Demande par Région (2026)" subtitle={`Total: ${(demandByRegion.reduce((s, d) => s + d.value, 0) / 1000).toFixed(1)} Mt`} />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={demandByRegion} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={2} stroke="hsl(0,0%,4%)">
                  {demandByRegion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {demandByRegion.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground w-28">{d.name}</span>
                  <span className="font-mono">{(d.value / 1000).toFixed(1)} Mt</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Niveaux d'Inventaire" subtitle="Jours de supply" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={inventory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} domain={[10, 80]} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="global" name="Global" stroke="hsl(72,100%,50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="india" name="Inde" stroke="hsl(199,89%,48%)" strokeWidth={2} />
              <Line type="monotone" dataKey="brazil" name="Brésil" stroke="hsl(38,92%,50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="na" name="Amérique du Nord" stroke="hsl(142,71%,45%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Exports Concurrents (2026e)" subtitle="Mt — Parts de marché phosphates" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={competitors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis type="number" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(0,0%,55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} width={100} />
              <Tooltip {...ttStyle} />
              <Bar dataKey="volume" name="Volume (Mt)" fill="hsl(72,100%,50%)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Netback par Marché" subtitle="$/t — FOB Jorf Lasfar" />
          <DataTable
            headers={["Marché", "FOB Jorf", "Fret", "Prix DAP", "Netback", "vs 30J"]}
            rows={netback.map(n => [
              n.market, n.fobJorf, n.freight, n.dapPrice, n.netback,
              <span className="kpi-change-up">{n.vs30d}</span>,
            ])}
          />
        </div>

        <div className="chart-container">
          <SectionHeader title="Balance Offre / Demande" subtitle="Mt P₂O₅ — Mondial" />
          <DataTable
            headers={["Catégorie", "2025A", "2026E", "vs 2025"]}
            rows={supplyDemand.map(s => [
              s.category, s.y2025, s.y2026e,
              <span className="kpi-change-up">{s.vs2025}</span>,
            ])}
          />
        </div>
      </div>

      <div className="chart-container">
        <SectionHeader title="Analyse Concurrentielle Détaillée" subtitle="Principaux rivaux OCP sur le marché mondial" />
        <DataTable
          headers={["Concurrent", "Pays", "Part de Marché", "Forces / Avantages"]}
          rows={competitorDetails.map(c => [
            <span className="font-semibold text-primary">{c.name}</span>,
            c.country,
            <span className="font-mono">{c.marketShare}</span>,
            <span className="text-xs text-muted-foreground">{c.strengths}</span>,
          ])}
        />
      </div>
    </DashboardLayout>
  );
}
