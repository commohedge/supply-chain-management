import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const forwardCurve = [
  { period: "Q2 26", current: 590, m1: 460, m3: 450 },
  { period: "Q3 26", current: 615, m1: 480, m3: 460 },
  { period: "Q4 26", current: 630, m1: 500, m3: 480 },
  { period: "Q1 27", current: 645, m1: 520, m3: 500 },
  { period: "Q2 27", current: 660, m1: 540, m3: 520 },
  { period: "Q3 27", current: 675, m1: 560, m3: 540 },
  { period: "Q4 27", current: 690, m1: 580, m3: 560 },
];

const optionValue = [
  { period: "Q2 2026", value: 18 },
  { period: "Q3 2026", value: 28 },
  { period: "Q4 2026", value: 32 },
  { period: "Q1 2027", value: 26 },
  { period: "Q2 2027", value: 22 },
  { period: "Q3 2027", value: 16 },
];

const openDestPie = [
  { name: "India", value: 0.42 },
  { name: "Brazil", value: 0.30 },
  { name: "Other Asia", value: 0.24 },
  { name: "Africa", value: 0.14 },
  { name: "Others", value: 0.10 },
];

const COLORS = ["hsl(72,100%,50%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(0,0%,45%)"];
const ttStyle = { contentStyle: { backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: "8px", color: "hsl(0,0%,95%)", fontSize: "12px", fontFamily: "JetBrains Mono" } };

export default function OptionalityPage() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Optionality & Timing</h1>
          <p className="page-subtitle">Forward curves, option value & floating stock analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Forward Curve (Mid)" value="$615/t" subtitle="Q3 2026" change="+3.2% vs 30d" changeDirection="up" />
        <KpiCard label="Option Value*" value="$28/t" subtitle="Average" change="+4.1%" changeDirection="up" />
        <KpiCard label="Open Destination Vol." value="1.2 Mt" subtitle="15% of total pipeline" change="+7%" changeDirection="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Forward Price Curve" subtitle="$/t, FOB Jorf Lasfar" />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forwardCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} domain={[400, 720]} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="current" name="Current" stroke="hsl(72,100%,50%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(72,100%,50%)" }} />
              <Line type="monotone" dataKey="m1" name="1 Month Ago" stroke="hsl(199,89%,48%)" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="m3" name="3 Months Ago" stroke="hsl(0,0%,45%)" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Option Value by Delivery Window" subtitle="$/t" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={optionValue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...ttStyle} />
              <Bar dataKey="value" name="Option Value ($/t)" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Open Destination Volume by Region" subtitle="Total: 1.2 Mt" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={openDestPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={2} stroke="hsl(0,0%,4%)">
                  {openDestPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {openDestPie.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground w-20">{d.name}</span>
                  <span className="font-mono">{d.value} Mt</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <SectionHeader title="Floating Stock Duration" subtitle="Days" />
          <DataTable
            headers={["Region", "Current", "vs Last 30 Days", "vs Last Year"]}
            rows={[
              ["India", "58", <span className="kpi-change-up">▲ +4</span>, <span className="kpi-change-down">▼ -6</span>],
              ["Brazil", "72", <span className="kpi-change-up">▲ +6</span>, <span className="kpi-change-down">▼ -4</span>],
              ["Other Asia", "45", <span className="kpi-change-up">▲ +3</span>, <span className="kpi-change-down">▼ -8</span>],
              [<span className="font-bold">Global</span>, <span className="font-bold">61</span>, <span className="font-bold kpi-change-up">▲ +4</span>, <span className="font-bold kpi-change-down">▼ -7</span>],
            ]}
          />
        </div>
      </div>

      <div className="chart-container">
        <SectionHeader title="Optionality Scenarios — Netback Impact" subtitle="$/t" />
        <DataTable
          headers={["Scenario", "Assumption", "Netback Impact", "vs Base"]}
          rows={[
            [<span className="font-semibold">Base Case</span>, "Current forward curve (Q3 2026)", <span className="font-mono">$615</span>, "—"],
            [<span className="font-semibold text-success">Upside</span>, "Stronger demand (+10% price)", <span className="font-mono text-success">$665</span>, <span className="kpi-change-up">+$50</span>],
            [<span className="font-semibold text-destructive">Downside</span>, "Softer demand (-10% price)", <span className="font-mono text-destructive">$565</span>, <span className="kpi-change-down">-$50</span>],
          ]}
        />
        <p className="mt-4 text-xs text-muted-foreground italic">*Option value represents the estimated value of keeping destinations open, based on the volatility of the forward curve and historical price movements.</p>
      </div>
    </DashboardLayout>
  );
}
