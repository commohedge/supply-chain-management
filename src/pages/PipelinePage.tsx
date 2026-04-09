import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const coverageData = [
  { month: "Apr", days: 40 },
  { month: "May", days: 42 },
  { month: "Jun", days: 45 },
  { month: "Jul", days: 48 },
  { month: "Aug", days: 50 },
  { month: "Sep", days: 52 },
  { month: "Oct", days: 54 },
];

const maturityData = [
  { period: "Apr 2026", confirmed: 1.2, unassigned: 0.8, openDest: 0.5 },
  { period: "May 2026", confirmed: 1.0, unassigned: 0.9, openDest: 0.4 },
  { period: "Jul 2026", confirmed: 0.8, unassigned: 0.6, openDest: 0.2 },
  { period: "Aug 2026", confirmed: 0.3, unassigned: 0.2, openDest: 0.1 },
  { period: "Sep 2026", confirmed: 0.1, unassigned: 0.1, openDest: 0.0 },
];

const destData = [
  { name: "Brazil", value: 1200, pct: "35%", netback: 625 },
  { name: "India", value: 900, pct: "26%", netback: 610 },
  { name: "USA", value: 700, pct: "21%", netback: 600 },
  { name: "Others", value: 600, pct: "18%", netback: 590 },
];

const COLORS = ["hsl(72,100%,50%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(0,0%,45%)"];
const ttStyle = { contentStyle: { backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: "8px", color: "hsl(0,0%,95%)", fontSize: "12px", fontFamily: "JetBrains Mono" } };

export default function PipelinePage() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Pipeline</h1>
          <p className="page-subtitle">Commitment level, coverage & destination analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <KpiCard label="Confirmed Volume" value="3.4 Mt" subtitle="43% of total" change="+4% vs last 30d" changeDirection="up" />
        <KpiCard label="Unassigned" value="2.6 Mt" subtitle="33% of total" change="+8%" changeDirection="up" />
        <KpiCard label="Open Destination" value="1.2 Mt" subtitle="15% of total" change="+7%" changeDirection="up" />
        <KpiCard label="Pipeline Coverage" value="54 Days" subtitle="of sales" change="+6 days" changeDirection="up" />
        <KpiCard label="Pipeline Value" value="$2.18 B" subtitle="at spot prices" change="+5%" changeDirection="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Pipeline Coverage" subtitle="Days of sales — Target: 60-65 days" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={coverageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} domain={[30, 70]} />
              <Tooltip {...ttStyle} />
              <Line type="monotone" dataKey="days" stroke="hsl(72,100%,50%)" strokeWidth={2} dot={{ fill: "hsl(72,100%,50%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Top Confirmed Destinations" subtitle="Next 30 days — Total: 3.4 Mt" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={250}>
              <PieChart>
                <Pie data={destData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={2} stroke="hsl(0,0%,4%)">
                  {destData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {destData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground w-16">{d.name}</span>
                  <span className="font-mono">{d.value.toLocaleString()} kt</span>
                  <span className="text-xs text-muted-foreground">${d.netback}/t</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container mb-8">
        <SectionHeader title="Volume Maturity by Loading Period" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={maturityData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
            <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
            <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
            <Tooltip {...ttStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
            <Bar dataKey="confirmed" name="Confirmed" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} stackId="a" />
            <Bar dataKey="unassigned" name="Unassigned" fill="hsl(199,89%,48%)" radius={[0,0,0,0]} stackId="a" />
            <Bar dataKey="openDest" name="Open Dest." fill="hsl(38,92%,50%)" radius={[4,4,0,0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <SectionHeader title="Pipeline by Destination Status" subtitle="Next 30 days" />
        <DataTable
          headers={["Status", "Volume (kt)", "% of Total", "vs Last 30 Days", "Avg. Netback ($/t)"]}
          rows={[
            ["Confirmed", "3,400", "43%", <span className="kpi-change-up">▲ +4%</span>, "$620"],
            ["Unassigned", "2,600", "33%", <span className="kpi-change-up">▲ +8%</span>, "—"],
            ["Open Destination", "1,200", "15%", <span className="kpi-change-up">▲ +7%</span>, "—"],
            ["In Transit", "700", "9%", <span className="kpi-change-down">▼ -3%</span>, "$610"],
            [<span className="font-bold">Total</span>, <span className="font-bold">7,900</span>, <span className="font-bold">100%</span>, <span className="font-bold kpi-change-up">▲ +4%</span>, <span className="font-bold">$615</span>],
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
