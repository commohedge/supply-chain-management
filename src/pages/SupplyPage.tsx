import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader, StatusBadge } from "@/components/dashboard/DashboardWidgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useDashboardData } from "@/contexts/DashboardDataContext";

const COLORS = ["hsl(72,100%,50%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(0,0%,45%)"];
const ttStyle = { contentStyle: { backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: "8px", color: "hsl(0,0%,95%)", fontSize: "12px", fontFamily: "JetBrains Mono" } };

export default function SupplyPage() {
  const { config } = useDashboardData();
  const { kpis, production, volumeByStatus, ports, vessels, constraints } = config.supply;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Supply & Execution</h1>
          <p className="page-subtitle">Production, loading capacity, vessels — OCP</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} subtitle={k.subtitle} change={k.change} changeDirection={k.changeDirection} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Production Forecast" subtitle="By port (kt)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={production}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...ttStyle} />
              <Bar dataKey="volume" name="Volume (kt)" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Volume by Status" subtitle={`Next 30 days — Total: ${(volumeByStatus.reduce((s, d) => s + d.value, 0) / 1000).toFixed(1)} Mt`} />
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={volumeByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} strokeWidth={2} stroke="hsl(0,0%,4%)">
                  {volumeByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {volumeByStatus.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-mono font-medium">{d.value.toLocaleString()} kt</span>
                  <span className="text-xs text-muted-foreground">{d.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Loading Capacity by Port" />
          <DataTable
            headers={["Port", "Utilization", "Next 7 Days", "Next 30 Days"]}
            rows={ports.map(p => [p.port, p.utilization, p.next7, p.next30])}
          />
        </div>

        <div className="chart-container">
          <SectionHeader title="Vessels Available" subtitle={`${vessels.inPort + vessels.atSea + vessels.charterOptions} Total`} />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-mono font-bold text-info">{vessels.inPort}</div>
              <div className="text-xs text-muted-foreground mt-1">In Port (Loading)</div>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-mono font-bold text-primary">{vessels.atSea}</div>
              <div className="text-xs text-muted-foreground mt-1">At Sea (En route)</div>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-mono font-bold text-warning">{vessels.charterOptions}</div>
              <div className="text-xs text-muted-foreground mt-1">Charter Options</div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <SectionHeader title="Constraints to Watch" />
        <DataTable
          headers={["Constraint", "Details", "Severity"]}
          rows={constraints.map(c => [
            <span className="font-semibold">{c.constraint}</span>,
            c.details,
            <StatusBadge severity={c.severity} />,
          ])}
        />
      </div>
    </DashboardLayout>
  );
}
