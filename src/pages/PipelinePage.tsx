import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useDashboardData } from "@/contexts/DashboardDataContext";

const COLORS = ["hsl(72,100%,50%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(0,0%,45%)"];
const ttStyle = { contentStyle: { backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: "8px", color: "hsl(0,0%,95%)", fontSize: "12px", fontFamily: "JetBrains Mono" } };

export default function PipelinePage() {
  const { config } = useDashboardData();
  const { kpis, coverage, maturity, destinations, statusRows } = config.pipeline;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Pipeline</h1>
          <p className="page-subtitle">Commitment level, coverage & destination analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {kpis.map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} subtitle={k.subtitle} change={k.change} changeDirection={k.changeDirection} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Pipeline Coverage" subtitle="Days of sales — Target: 60-65 days" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={coverage}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} domain={[30, 70]} />
              <Tooltip {...ttStyle} />
              <Line type="monotone" dataKey="days" stroke="hsl(72,100%,50%)" strokeWidth={2} dot={{ fill: "hsl(72,100%,50%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Top Confirmed Destinations" subtitle={`Next 30 days — Total: ${(destinations.reduce((s, d) => s + d.value, 0) / 1000).toFixed(1)} Mt`} />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={250}>
              <PieChart>
                <Pie data={destinations} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={2} stroke="hsl(0,0%,4%)">
                  {destinations.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {destinations.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
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
          <BarChart data={maturity} barGap={2}>
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
            ...statusRows.map(r => [
              r.status,
              r.volume,
              r.pct,
              <span className={r.change.includes("▲") ? "kpi-change-up" : "kpi-change-down"}>{r.change}</span>,
              r.netback,
            ]),
            [
              <span className="font-bold">Total</span>,
              <span className="font-bold">{statusRows.reduce((s, r) => s + parseInt(r.volume.replace(/,/g, "")), 0).toLocaleString()}</span>,
              <span className="font-bold">100%</span>,
              <span className="font-bold kpi-change-up">▲ +4%</span>,
              <span className="font-bold">$615</span>,
            ],
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
