import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader, StatusBadge } from "@/components/dashboard/DashboardWidgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const prodData = [
  { month: "Apr 2026", volume: 1700 },
  { month: "May 2026", volume: 1850 },
  { month: "Jun 2026", volume: 2000 },
  { month: "Jul 2026", volume: 2150 },
  { month: "Aug 2026", volume: 2300 },
  { month: "Sep 2026", volume: 2400 },
];

const volumeByStatus = [
  { name: "Available", value: 2600, pct: "33%", change: "▲ +8%" },
  { name: "Committed", value: 3400, pct: "43%", change: "▲ +4%" },
  { name: "Open Dest.", value: 1200, pct: "15%", change: "▲ +7%" },
  { name: "In Transit", value: 700, pct: "9%", change: "▼ -3%" },
];

const COLORS = ["hsl(72,100%,50%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(0,0%,45%)"];

const ttStyle = {
  contentStyle: { backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: "8px", color: "hsl(0,0%,95%)", fontSize: "12px", fontFamily: "JetBrains Mono" },
};

export default function SupplyPage() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Supply & Execution</h1>
          <p className="page-subtitle">Production, loading capacity, vessels — OCP</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KpiCard label="Available Volume" value="2.6 Mt" subtitle="Next 30 days" change="+8% vs last 30d" changeDirection="up" />
        <KpiCard label="Loading Utilization" value="72%" subtitle="Next 30 days" change="+5 pp" changeDirection="up" />
        <KpiCard label="Loading Slots" value="12" subtitle="1.8 Mt capacity" change="+2 vs last 30d" changeDirection="up" />
        <KpiCard label="Committed" value="3.4 Mt" subtitle="Next 30 days" change="+4%" changeDirection="up" />
        <KpiCard label="Pipeline Coverage" value="54 Days" subtitle="of sales" change="+6 days" changeDirection="up" />
        <KpiCard label="Storage Utilization" value="68%" subtitle="Across OCP sites" change="+3 pp" changeDirection="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Production Forecast" subtitle="By port (kt)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={prodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...ttStyle} />
              <Bar dataKey="volume" name="Volume (kt)" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Volume by Status" subtitle="Next 30 days — Total: 7.9 Mt" />
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={volumeByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} strokeWidth={2} stroke="hsl(0,0%,4%)">
                  {volumeByStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {volumeByStatus.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
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
            rows={[
              ["Jorf Lasfar", "78%", "3 / 5", "11 / 16"],
              ["Safi", "65%", "2 / 4", "7 / 12"],
              ["Casablanca", "58%", "1 / 2", "3 / 6"],
            ]}
          />
        </div>

        <div className="chart-container">
          <SectionHeader title="Vessels Available" subtitle="14 Total" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-mono font-bold text-info">6</div>
              <div className="text-xs text-muted-foreground mt-1">In Port (Loading)</div>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-mono font-bold text-primary">8</div>
              <div className="text-xs text-muted-foreground mt-1">At Sea (En route)</div>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-mono font-bold text-warning">4</div>
              <div className="text-xs text-muted-foreground mt-1">Charter Options</div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <SectionHeader title="Constraints to Watch" />
        <DataTable
          headers={["Constraint", "Details", "Severity"]}
          rows={[
            [<span className="font-semibold">Port Congestion</span>, "Jorf Lasfar waiting time ~ 1.8 days", <StatusBadge severity="medium" />],
            [<span className="font-semibold">Storage</span>, "Youssoufia storage at 85%", <StatusBadge severity="high" />],
            [<span className="font-semibold">Vessel Availability</span>, "Limited Supramax in next 10 days", <StatusBadge severity="low" />],
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
