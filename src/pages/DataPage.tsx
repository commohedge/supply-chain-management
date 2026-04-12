import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/DashboardWidgets";
import { CsvImportBlock, type CsvDataset } from "@/components/data/CsvImportBlock";
import { LogisticsStatusTable } from "@/components/logistics/LogisticsStatusTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TEMPLATE_EXPORT_CSV,
  TEMPLATE_IMPORT_CSV,
  TEMPLATE_STOCK_EX_CSV,
  TEMPLATE_STOCK_IN_CSV,
} from "@/data/hubCsvTemplates";
import { loadHubCommodity, saveHubCommodity, type HubCommodityState } from "@/data/hubCommodityData";
import { csvRecordsToRows, logisticsRowsToCsvString, TEMPLATE_LOGISTICS_CSV } from "@/data/logisticsSeed";
import { parseCsvText, sumQuantityColumn, downloadTextFile } from "@/lib/csv";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useI18n } from "@/contexts/I18nContext";
import { Database, FileSpreadsheet, Ship, Warehouse, Truck, Download, FileUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

const GLOSSARY_IMPORT_KEYS = [
  "trade_date",
  "deal_ref",
  "contract_id",
  "counterparty_supplier",
  "incoterm",
  "loading_port_pol",
  "discharge_port_pod",
  "quantity_mt",
  "unit_price_usd_mt",
  "lc_ref",
  "status_execution",
] as const;

const GLOSSARY_EXPORT_KEYS = [
  "client",
  "buyer_country",
  "loading_port_pol",
  "quantity_mt",
  "premium_discount_usd_mt",
  "laycan_start",
  "margin_usd_mt",
  "co2_intensity_gmt",
] as const;

const GLOSSARY_STOCK_IN_KEYS = [
  "as_of_date",
  "location_type",
  "quantity_mt_physical",
  "quantity_mt_committed",
  "customs_status",
  "linked_deal_ref",
] as const;

const GLOSSARY_STOCK_EX_KEYS = [
  "quantity_mt_nominated",
  "vessel_pre_advice",
  "laycan_window",
  "linked_sales_ref",
] as const;

const GLOSSARY_LOGISTICS_KEYS = [
  "volume_kt",
  "vessel_status",
  "vessel_id",
  "vessel_name",
  "imo",
  "mmsi",
  "destination",
  "destination_port",
  "client_name",
  "lat",
  "lng",
  "product",
  "eta_days",
  "eta_date",
  "cost_usd_per_t",
] as const;

function buildGlossary(
  prefix: "import" | "export" | "stockIn" | "stockEx" | "logistics",
  keys: readonly string[],
  t: (k: string) => string,
): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, t(`glossary.${prefix}.${k}`)]));
}

function buildClientVolumeChart(rows: Record<string, string>[], headers: string[]) {
  const clientKey = headers.find((h) => /^(client|buyer|counterparty)/i.test(h.trim()));
  const qtyKey =
    headers.find((h) => h.toLowerCase() === "quantity_mt") ||
    headers.find((h) => /quantity_mt$/i.test(h));
  if (!clientKey || !qtyKey) return [];
  const map = new Map<string, number>();
  for (const r of rows) {
    const name = String(r[clientKey] ?? "—").trim() || "—";
    const raw = String(r[qtyKey] ?? "").replace(/,/g, "");
    const v = parseFloat(raw);
    if (!Number.isNaN(v)) map.set(name, (map.get(name) ?? 0) + v);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 22 ? `${name.slice(0, 20)}…` : name,
      fullName: name,
      kt: Math.round(value / 1000),
      value,
    }));
}

export default function DataPage() {
  const { t, locale } = useI18n();
  const { config } = useDashboardData();
  const [hub, setHub] = useState<HubCommodityState>(() => loadHubCommodity());
  const logisticsFileRef = useRef<HTMLInputElement>(null);

  const glossaryImport = useMemo(
    () => buildGlossary("import", GLOSSARY_IMPORT_KEYS, t),
    [t],
  );
  const glossaryExport = useMemo(
    () => buildGlossary("export", GLOSSARY_EXPORT_KEYS, t),
    [t],
  );
  const glossaryStockIn = useMemo(
    () => buildGlossary("stockIn", GLOSSARY_STOCK_IN_KEYS, t),
    [t],
  );
  const glossaryStockEx = useMemo(
    () => buildGlossary("stockEx", GLOSSARY_STOCK_EX_KEYS, t),
    [t],
  );
  const glossaryLogistics = useMemo(
    () => buildGlossary("logistics", GLOSSARY_LOGISTICS_KEYS, t),
    [t],
  );

  const numLocale = locale === "fr" ? "fr-FR" : "en-US";

  useEffect(() => {
    saveHubCommodity(hub);
  }, [hub]);

  const importQty = sumQuantityColumn(hub.imports.headers, hub.imports.rows);
  const exportQty = sumQuantityColumn(hub.exports.headers, hub.exports.rows);
  const stockInQty = sumQuantityColumn(hub.stockInbound.headers, hub.stockInbound.rows);
  const stockExQty = sumQuantityColumn(hub.stockExport.headers, hub.stockExport.rows);

  const chartData = useMemo(
    () => buildClientVolumeChart(hub.exports.rows, hub.exports.headers),
    [hub.exports.rows, hub.exports.headers],
  );

  const setImports = (imports: CsvDataset) => setHub((h) => ({ ...h, imports }));
  const setExports = (exports_: CsvDataset) => setHub((h) => ({ ...h, exports: exports_ }));
  const setStockIn = (stockInbound: CsvDataset) => setHub((h) => ({ ...h, stockInbound }));
  const setStockEx = (stockExport: CsvDataset) => setHub((h) => ({ ...h, stockExport }));
  const setLogisticsRows = useCallback((logisticsRows: HubCommodityState["logisticsRows"]) => {
    setHub((h) => ({ ...h, logisticsRows }));
  }, []);

  const onLogisticsCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { data } = parseCsvText(String(reader.result ?? ""));
        setLogisticsRows(csvRecordsToRows(data));
        toast.success(t("data.import.success", { count: data.length }));
      } catch {
        toast.error(t("data.import.error"));
      }
    };
    reader.readAsText(f, "UTF-8");
    e.target.value = "";
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Database className="h-7 w-7 text-primary" />
            {t("data.title")}
          </h1>
          <p className="page-subtitle max-w-4xl">{t("data.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        <KpiCard
          label={t("data.kpi.importLines")}
          value={String(hub.imports.rows.length)}
          subtitle={t("data.kpi.importSub")}
          change={
            importQty != null
              ? `${t("data.kpi.sigma")} ${importQty.toLocaleString(numLocale, { maximumFractionDigits: 0 })} t`
              : undefined
          }
          changeDirection="neutral"
        />
        <KpiCard
          label={t("data.kpi.exportLines")}
          value={String(hub.exports.rows.length)}
          subtitle={t("data.kpi.exportSub")}
          change={
            exportQty != null
              ? `${t("data.kpi.sigma")} ${exportQty.toLocaleString(numLocale, { maximumFractionDigits: 0 })} t`
              : undefined
          }
          changeDirection="neutral"
        />
        <KpiCard
          label={t("data.kpi.stockInLines")}
          value={String(hub.stockInbound.rows.length)}
          subtitle={t("data.kpi.stockInSub")}
          change={
            stockInQty != null
              ? `${t("data.kpi.sigma")} ${stockInQty.toLocaleString(numLocale, { maximumFractionDigits: 0 })} t`
              : undefined
          }
          changeDirection="neutral"
        />
        <KpiCard
          label={t("data.kpi.stockExLines")}
          value={String(hub.stockExport.rows.length)}
          subtitle={t("data.kpi.stockExSub")}
          change={
            stockExQty != null
              ? `${t("data.kpi.sigma")} ${stockExQty.toLocaleString(numLocale, { maximumFractionDigits: 0 })} t`
              : undefined
          }
          changeDirection="neutral"
        />
        <KpiCard
          label={t("data.kpi.logistics")}
          value={String(hub.logisticsRows.length)}
          subtitle={t("data.kpi.logisticsSub")}
          change={t("data.kpi.mapData")}
          changeDirection="neutral"
        />
      </div>

      <Tabs defaultValue="imports" className="space-y-4">
        <TabsList className="grid w-full max-w-5xl grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
          <TabsTrigger value="imports" className="text-xs gap-1.5 py-2">
            <Ship className="h-3.5 w-3.5" />
            {t("data.tab.imports")}
          </TabsTrigger>
          <TabsTrigger value="exports" className="text-xs gap-1.5 py-2">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {t("data.tab.exports")}
          </TabsTrigger>
          <TabsTrigger value="stocks" className="text-xs gap-1.5 py-2">
            <Warehouse className="h-3.5 w-3.5" />
            {t("data.tab.stocks")}
          </TabsTrigger>
          <TabsTrigger value="logistics" className="text-xs gap-1.5 py-2">
            <Truck className="h-3.5 w-3.5" />
            {t("data.tab.logistics")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="imports" className="space-y-4 mt-4">
          <CsvImportBlock
            title={t("data.importsBlockTitle")}
            description={t("data.importsBlockDesc")}
            dataset={hub.imports}
            onDatasetChange={setImports}
            templateCsv={TEMPLATE_IMPORT_CSV}
            templateFilename="template-achats-imports.csv"
            variant="import"
            columnHelp={glossaryImport}
          />
        </TabsContent>

        <TabsContent value="exports" className="space-y-4 mt-4">
          <CsvImportBlock
            title={t("data.exportsBlockTitle")}
            description={t("data.exportsBlockDesc")}
            dataset={hub.exports}
            onDatasetChange={setExports}
            templateCsv={TEMPLATE_EXPORT_CSV}
            templateFilename="template-ventes-exports.csv"
            variant="export"
            columnHelp={glossaryExport}
          />
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("data.chartTopClients")}</CardTitle>
                <CardDescription className="text-xs">{t("data.chartTopClientsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v: number) => [`${v} kt`, t("data.chartVolume")]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullName ? String(payload[0].payload.fullName) : ""
                      }
                    />
                    <Bar dataKey="kt" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="kt" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stocks" className="space-y-6 mt-4">
          <p className="text-xs text-muted-foreground max-w-3xl">{t("data.stocksIntro")}</p>
          <CsvImportBlock
            title={t("data.stockInTitle")}
            description={t("data.stockInDesc")}
            dataset={hub.stockInbound}
            onDatasetChange={setStockIn}
            templateCsv={TEMPLATE_STOCK_IN_CSV}
            templateFilename="template-stock-intrants.csv"
            variant="stockIn"
            columnHelp={glossaryStockIn}
          />
          <CsvImportBlock
            title={t("data.stockExTitle")}
            description={t("data.stockExDesc")}
            dataset={hub.stockExport}
            onDatasetChange={setStockEx}
            templateCsv={TEMPLATE_STOCK_EX_CSV}
            templateFilename="template-stock-export.csv"
            variant="stockOut"
            columnHelp={glossaryStockEx}
          />
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4 mt-4">
          <div className="chart-container space-y-4">
            <p className="text-xs text-muted-foreground max-w-3xl">{t("data.logisticsIntro")}</p>
            <div className="flex flex-wrap gap-2">
              <input
                ref={logisticsFileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onLogisticsCsvFile}
              />
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => logisticsFileRef.current?.click()}>
                <FileUp className="h-3.5 w-3.5 mr-1.5" />
                {t("data.btn.import")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => downloadTextFile("template-logistics-status.csv", TEMPLATE_LOGISTICS_CSV)}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {t("data.btn.template")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => downloadTextFile("logistics-status-export.csv", logisticsRowsToCsvString(hub.logisticsRows))}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {t("data.btn.export")}
              </Button>
            </div>
            <LogisticsStatusTable
              rows={hub.logisticsRows}
              onRowsChange={setLogisticsRows}
              mappings={config.logisticsMappings}
              clientNames={config.referentiel.clients.map((c) => c.name)}
              title={t("logistics.titleDefault")}
              subtitle={t("data.logistics.subtitle")}
            />
            <dl className="grid gap-1 text-[10px] text-muted-foreground border rounded-md p-3 bg-muted/10 sm:grid-cols-2">
              {GLOSSARY_LOGISTICS_KEYS.map((k) => (
                <div key={k} className="flex gap-2">
                  <dt className="font-mono text-primary shrink-0">{k}</dt>
                  <dd>{glossaryLogistics[k]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
