import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";

const storageData = [
  { country: "Brazil", inStock: 1250, inTransit: 650, planned: 700, total: 2600 },
  { country: "India", inStock: 1750, inTransit: 300, planned: 450, total: 2500 },
  { country: "US", inStock: 950, inTransit: 400, planned: 650, total: 2000 },
];

const demandData = [
  { country: "Brazil", y2025: 3200, y2026ytd: 2400, y2026f: 3000 },
  { country: "US", y2025: 2100, y2026ytd: 1700, y2026f: 2200 },
  { country: "India", y2025: 4300, y2026ytd: 2000, y2026f: 4400 },
];

const forecastData = [
  { country: "Brazil", arrivals: 900, shipments: 400, startingStock: 1900, endingStock: 1900, total: 3200 },
  { country: "US", arrivals: 300, shipments: 450, startingStock: 1000, endingStock: 1000, total: 1750 },
  { country: "India", arrivals: 500, shipments: 600, startingStock: 2000, endingStock: 2000, total: 3100 },
];

const COLORS = ["hsl(72, 100%, 50%)", "hsl(199, 89%, 48%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)"];

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(0, 0%, 8%)",
    border: "1px solid hsl(0, 0%, 16%)",
    borderRadius: "8px",
    color: "hsl(0, 0%, 95%)",
    fontSize: "12px",
    fontFamily: "JetBrains Mono",
  },
};

export default function OverviewPage() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Supply Chain Dashboard</h1>
          <p className="page-subtitle">Global overview — Fertilizers (DAP/MAP/TSP)</p>
        </div>
        <div className="text-xs text-muted-foreground font-mono">02/04/2026</div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Stock" value="6.4 Mt" change="+5% vs last month" changeDirection="up" />
        <KpiCard label="In Transit" value="2.1 Mt" change="+3% vs last month" changeDirection="up" />
        <KpiCard label="Storage Capacity" value="8.9 Mt" subtitle="71.9% utilization" />
        <KpiCard label="Avg. Lead Time" value="41 days" change="-2 days vs avg" changeDirection="down" />
      </div>

      {/* Storage + Market Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title="Storage Capacity by Subsidiary" subtitle="In Stock / In Transit / Planned (kt)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={storageData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="country" tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Bar dataKey="inStock" name="In Stock" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
              <Bar dataKey="inTransit" name="In Transit" fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
              <Bar dataKey="planned" name="Planned" fill="hsl(38,92%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title="Market Demand" subtitle="2025 vs 2026 YTD vs 2026 Forecast (kt)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={demandData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="country" tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Bar dataKey="y2025" name="2025" fill="hsl(0,0%,40%)" radius={[4,4,0,0]} />
              <Bar dataKey="y2026ytd" name="2026 YTD" fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
              <Bar dataKey="y2026f" name="2026 Forecast" fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Stock Level */}
      <div className="chart-container mb-8">
        <SectionHeader title="Forecast Stock Level — Next 30 Days" subtitle="Starting Stock, Arrivals, Shipments, Ending Stock (kt)" />
        <DataTable
          headers={["Country", "Starting Stock", "Arrivals", "Shipments", "Ending Stock", "Total"]}
          rows={forecastData.map(d => [
            d.country,
            d.startingStock.toLocaleString(),
            <span className="kpi-change-up">{d.arrivals.toLocaleString()}</span>,
            <span className="kpi-change-down">{d.shipments.toLocaleString()}</span>,
            d.endingStock.toLocaleString(),
            <span className="font-semibold">{d.total.toLocaleString()}</span>,
          ])}
        />
      </div>

      {/* Open Destination Shipments */}
      <div className="chart-container">
        <SectionHeader title="Global Supply Flows — In Transit" subtitle="Open destination shipments (kt)" />
        <DataTable
          headers={["Volume (kt)", "Vessel Status", "Destination", "Product"]}
          rows={[
            ["35", <span className="status-badge status-medium">Loading</span>, "Decided — Brazil", "TBD"],
            ["30", <span className="status-badge status-low">In Transit</span>, "Decided — Brazil", "TBD"],
            ["30", <span className="status-badge status-low">In Transit</span>, "Decided — Brazil", "TBD"],
            ["50", <span className="status-badge status-medium">Loading</span>, "Decided — India", "TBD"],
            ["30", <span className="status-badge status-low">In Transit</span>, "Open — Americas", "TBD"],
            ["30", <span className="status-badge status-low">In Transit</span>, "Open — Americas", "TBD"],
            ["30", <span className="status-badge status-low">In Transit</span>, "Open — Americas", "TBD"],
            ["35", <span className="status-badge status-medium">Loading</span>, "Open — Americas", "TBD"],
            ["30", <span className="status-badge status-low">In Transit</span>, "Open — Americas", "TBD"],
            ["30", <span className="status-badge status-low">In Transit</span>, "Open — Americas", "TBD"],
          ]}
        />
        <div className="mt-3 text-xs text-muted-foreground">Source: SBL, OCP</div>
      </div>
    </DashboardLayout>
  );
}
