import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const priceData = [
  { period: "Apr", tampa: 650, india: 570, jorf: 530 },
  { period: "May", tampa: 660, india: 580, jorf: 540 },
  { period: "Jun", tampa: 670, india: 590, jorf: 550 },
  { period: "Jul", tampa: 680, india: 600, jorf: 560 },
  { period: "Aug", tampa: 690, india: 610, jorf: 570 },
  { period: "Sep", tampa: 695, india: 615, jorf: 575 },
];

const inventoryData = [
  { period: "Apr 26", global: 68, india: 52, brazil: 35, na: 20 },
  { period: "Jul 26", global: 66, india: 51, brazil: 34, na: 20 },
  { period: "Oct 26", global: 69, india: 55, brazil: 38, na: 22 },
  { period: "Jan 27", global: 63, india: 50, brazil: 34, na: 20 },
  { period: "Apr 27", global: 67, india: 54, brazil: 37, na: 21 },
];

const demandPie = [
  { name: "India", value: 3300 },
  { name: "Brazil", value: 2200 },
  { name: "N. America", value: 1700 },
  { name: "Europe", value: 1000 },
  { name: "Other", value: 400 },
];

const competitorData = [
  { name: "OCP", volume: 8.6 },
  { name: "Mosaic", volume: 6.8 },
  { name: "Nutrien", volume: 4.2 },
  { name: "Others", volume: 3.4 },
];

const COLORS = ["hsl(72,100%,50%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(0,0%,45%)"];
const ttStyle = { contentStyle: { backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: "8px", color: "hsl(0,0%,95%)", fontSize: "12px", fontFamily: "JetBrains Mono" } };

export default function MarketPage() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Market & Value</h1>
          <p className="page-subtitle">Demand, pricing, netback & competitive landscape</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Global Demand (2026)" value="8.6 Mt" subtitle="Forecast" change="+3.2% vs 2025" changeDirection="up" />
        <KpiCard label="Global Inventory" value="20.1 Mt" subtitle="68 days of supply" change="+5.1% vs 30d" changeDirection="up" />
        <KpiCard label="Avg. Netback (Blended)" value="$615/t" subtitle="FOB Jorf Lasfar" change="+4.8%" changeDirection="up" />
        <KpiCard label="Price Volatility (30D)" value="16%" subtitle="Annualized" change="-1.2 pp" changeDirection="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Price Benchmarks" subtitle="$/t, FOB" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} domain={[500, 720]} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Line type="monotone" dataKey="tampa" name="DAP Tampa" stroke="hsl(72,100%,50%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="india" name="DAP India" stroke="hsl(199,89%,48%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="jorf" name="FOB Jorf" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Demand by Region (2026)" subtitle="Total: 8.6 Mt" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={demandPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={2} stroke="hsl(0,0%,4%)">
                  {demandPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {demandPie.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground w-20">{d.name}</span>
                  <span className="font-mono">{(d.value / 1000).toFixed(1)} Mt</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Inventory Levels" subtitle="Days of supply" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={inventoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} domain={[10, 80]} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="global" name="Global" stroke="hsl(72,100%,50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="india" name="India" stroke="hsl(199,89%,48%)" strokeWidth={2} />
              <Line type="monotone" dataKey="brazil" name="Brazil" stroke="hsl(38,92%,50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="na" name="N. America" stroke="hsl(142,71%,45%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Competitor Exports (2026e)" subtitle="Mt" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={competitorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis type="number" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} width={70} />
              <Tooltip {...ttStyle} />
              <Bar dataKey="volume" name="Volume (Mt)" fill="hsl(72,100%,50%)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <SectionHeader title="Netback Overview" subtitle="$/t" />
          <DataTable
            headers={["Market", "FOB Jorf", "Freight", "DAP Price", "Netback", "vs 30D"]}
            rows={[
              ["USA", "$530", "$120", "$650", "$530", <span className="kpi-change-up">+5.1%</span>],
              ["India", "$530", "$90", "$615", "$615", <span className="kpi-change-up">+4.2%</span>],
              ["Brazil", "$530", "$70", "$575", "$575", <span className="kpi-change-up">+3.0%</span>],
              ["Europe", "$530", "$85", "$600", "$600", <span className="kpi-change-up">+1.8%</span>],
              [<span className="font-bold">Average</span>, <span className="font-bold">$530</span>, <span className="font-bold">$91</span>, <span className="font-bold">$610</span>, <span className="font-bold">$615</span>, <span className="font-bold kpi-change-up">+4.8%</span>],
            ]}
          />
        </div>

        <div className="chart-container">
          <SectionHeader title="Supply / Demand Balance" subtitle="Mt P₂O₅" />
          <DataTable
            headers={["Category", "2025A", "2026E", "vs 2025"]}
            rows={[
              ["Supply", "21.8", "23.0", <span className="kpi-change-up">+5.5%</span>],
              ["Demand", "20.9", "22.0", <span className="kpi-change-up">+5.3%</span>],
              [<span className="font-bold">Balance</span>, <span className="font-bold">0.9</span>, <span className="font-bold">1.0</span>, <span className="font-bold kpi-change-up">+11.1%</span>],
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
