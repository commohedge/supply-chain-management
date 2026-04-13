import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard, DataTable, SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useI18n } from "@/contexts/I18nContext";
import { displayDashboardDataText } from "@/i18n/dashboardDataText";

const COLORS = ["hsl(72,100%,50%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(0,0%,45%)"];
const ttStyle = { contentStyle: { backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: "8px", color: "hsl(0,0%,95%)", fontSize: "12px", fontFamily: "JetBrains Mono" } };

export default function OptionalityPage() {
  const { t, locale } = useI18n();
  const { config } = useDashboardData();
  const { kpis, forwardCurve, optionValue, openDest, floatingStock, scenarios } = config.optionality;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("nav.optionality")}</h1>
          <p className="page-subtitle">{t("optionality.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((k, i) => (
          <KpiCard
            key={i}
            label={displayDashboardDataText(k.label, locale)}
            value={k.value}
            subtitle={k.subtitle ? displayDashboardDataText(k.subtitle, locale) : undefined}
            change={displayDashboardDataText(k.change, locale)}
            changeDirection={k.changeDirection}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader title={t("optionality.forwardTitle")} subtitle={t("optionality.forwardSubtitle")} />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forwardCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} domain={[400, 720]} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="current" name={t("optionality.lineCurrent")} stroke="hsl(72,100%,50%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(72,100%,50%)" }} />
              <Line type="monotone" dataKey="m1" name={t("optionality.lineM1")} stroke="hsl(199,89%,48%)" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="m3" name={t("optionality.lineM3")} stroke="hsl(0,0%,45%)" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <SectionHeader title={t("optionality.optionTitle")} subtitle={t("optionality.optionSubtitle")} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={optionValue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
              <XAxis dataKey="period" tick={{ fill: "hsl(0,0%,55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(0,0%,16%)" }} />
              <Tooltip {...ttStyle} />
              <Bar dataKey="value" name={t("optionality.barOptionValue")} fill="hsl(72,100%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <SectionHeader
            title={t("optionality.openDestTitle")}
            subtitle={t("optionality.openDestSubtitle", { total: openDest.reduce((s, d) => s + d.value, 0).toFixed(1) })}
          />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={openDest} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={2} stroke="hsl(0,0%,4%)">
                  {openDest.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {openDest.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground w-20">{d.name}</span>
                  <span className="font-mono">{d.value} Mt</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <SectionHeader title={t("optionality.floatingTitle")} subtitle={t("optionality.floatingSubtitle")} />
          <DataTable
            headers={[
              t("optionality.floatCol.region"),
              t("optionality.floatCol.current"),
              t("optionality.floatCol.vs30"),
              t("optionality.floatCol.vsYear"),
            ]}
            rows={[
              ...floatingStock.map(f => [
                f.region, f.current,
                <span className={f.vs30d.includes("▲") ? "kpi-change-up" : "kpi-change-down"}>{f.vs30d}</span>,
                <span className={f.vsLastYear.includes("▲") ? "kpi-change-up" : "kpi-change-down"}>{f.vsLastYear}</span>,
              ]),
              [<span className="font-bold">{t("optionality.globalLabel")}</span>, <span className="font-bold">61</span>, <span className="font-bold kpi-change-up">▲ +4</span>, <span className="font-bold kpi-change-down">▼ -7</span>],
            ]}
          />
        </div>
      </div>

      <div className="chart-container">
        <SectionHeader title={t("optionality.scenariosTitle")} subtitle={t("optionality.scenariosSubtitle")} />
        <DataTable
          headers={[
            t("optionality.scenCol.scenario"),
            t("optionality.scenCol.assumption"),
            t("optionality.scenCol.impact"),
            t("optionality.scenCol.vsBase"),
          ]}
          rows={scenarios.map(s => [
            <span className={`font-semibold ${s.scenario === "Upside" ? "text-success" : s.scenario === "Downside" ? "text-destructive" : ""}`}>{s.scenario}</span>,
            s.assumption,
            <span className={`font-mono ${s.scenario === "Upside" ? "text-success" : s.scenario === "Downside" ? "text-destructive" : ""}`}>{s.netbackImpact}</span>,
            <span className={s.vsBase.includes("+") ? "kpi-change-up" : s.vsBase.includes("-") ? "kpi-change-down" : ""}>{s.vsBase}</span>,
          ])}
        />
        <p className="mt-4 text-xs text-muted-foreground italic">{t("optionality.footnote")}</p>
      </div>
    </DashboardLayout>
  );
}
