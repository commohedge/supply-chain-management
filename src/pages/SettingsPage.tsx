import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, RotateCcw, Save, Database, Anchor, Package, FlaskConical, Users, Building2, Truck, Ship } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { LogisticsMappings } from "@/types/logistics";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import {
  REFERENCE_ZONES_EN,
  PORT_STATUSES_EN,
  EXPORT_CATEGORIES_EN,
  IMPORT_CATEGORIES_EN,
  CONTRACT_TYPES_SUPPLIER_EN,
  CONTRACT_TYPES_CLIENT_EN,
  displayReferenceValue,
  parseReferenceValue,
  displayLogisticsListItem,
  parseLogisticsListItem,
  type ReferenceStringRole,
} from "@/i18n/referenceLocale";

function EditableTable<T extends Record<string, unknown>>({
  data,
  columns,
  onUpdate,
  onAdd,
  onRemove,
}: {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    type?: "text" | "number" | "select";
    options?: string[];
    role?: ReferenceStringRole;
  }[];
  onUpdate: (index: number, key: keyof T, value: unknown) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th key={String(col.key)} className="text-left py-2 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                {columns.map((col) => {
                  const role = col.role ?? "freeText";
                  const raw = row[col.key];
                  const displayStr =
                    col.type === "number"
                      ? String(raw ?? "")
                      : displayReferenceValue(String(raw ?? ""), role, locale);
                  return (
                    <td key={String(col.key)} className="py-1.5 px-1.5">
                      {col.type === "select" && col.options ? (
                        <Select value={String(raw ?? "")} onValueChange={(v) => onUpdate(i, col.key, v)}>
                          <SelectTrigger className="h-8 text-xs bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {col.options.map((o) => (
                              <SelectItem key={o} value={o}>
                                {displayReferenceValue(o, role, locale)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          className="h-8 text-xs bg-background/50 font-mono"
                          type={col.type === "number" ? "number" : "text"}
                          value={displayStr}
                          onChange={(e) =>
                            onUpdate(
                              i,
                              col.key,
                              col.type === "number" ? Number(e.target.value) : parseReferenceValue(e.target.value, role, locale),
                            )
                          }
                        />
                      )}
                    </td>
                  );
                })}
                <td className="py-1.5 px-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => onRemove(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" className="text-xs" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5 mr-1" /> {t("settings.add")}
      </Button>
    </div>
  );
}

function StringListField({
  label,
  description,
  items,
  onChange,
  localizeKind,
}: {
  label: string;
  description?: string;
  items: string[];
  onChange: (next: string[]) => void;
  /** When set, values are stored in English and shown/edited per locale */
  localizeKind?: "destination" | "product";
}) {
  const { t, locale } = useI18n();
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            className="h-8 text-xs"
            value={localizeKind ? displayLogisticsListItem(item, localizeKind, locale) : item}
            onChange={(e) => {
              const n = [...items];
              n[i] = localizeKind ? parseLogisticsListItem(e.target.value, localizeKind, locale) : e.target.value;
              onChange(n);
            }}
          />
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => onChange([...items, ""])}>
        <Plus className="h-3 w-3 mr-1" /> {t("settings.addValue")}
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const { config, updateSection, resetAll } = useDashboardData();
  const [local, setLocal] = useState(structuredClone(config.referentiel));
  const [localLogistics, setLocalLogistics] = useState<LogisticsMappings>(() => structuredClone(config.logisticsMappings));

  const save = () => {
    updateSection("referentiel", local);
    updateSection("logisticsMappings", localLogistics);
    toast.success(t("settings.saved"));
  };

  const handleReset = () => {
    resetAll();
    toast.info(t("settings.resetInfo"));
    setTimeout(() => window.location.reload(), 300);
  };

  const updateField = <K extends keyof typeof local>(field: K, data: (typeof local)[K]) => {
    setLocal(prev => ({ ...prev, [field]: data }));
  };

  const tableUpdate = <K extends keyof typeof local>(field: K, i: number, key: string, v: any) => {
    const arr = [...(local[field] as any[])];
    arr[i] = { ...arr[i], [key]: v };
    updateField(field, arr as any);
  };

  const tableAdd = <K extends keyof typeof local>(field: K, template: any) => {
    updateField(field, [...(local[field] as any[]), template] as any);
  };

  const tableRemove = <K extends keyof typeof local>(field: K, i: number) => {
    updateField(field, (local[field] as any[]).filter((_: any, j: number) => j !== i) as any);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><Database className="h-7 w-7 text-primary" /> {t("settings.title")}</h1>
          <p className="page-subtitle">{t("settings.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleReset} className="text-xs">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> {t("settings.reset")}
          </Button>
          <Button size="sm" onClick={save} className="text-xs">
            <Save className="h-3.5 w-3.5 mr-1.5" /> {t("settings.saveAll")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ports" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/30 p-1 mb-6">
          <TabsTrigger value="ports" className="text-xs flex items-center gap-1.5"><Anchor className="h-3.5 w-3.5" /> {t("settings.tab.ports")}</TabsTrigger>
          <TabsTrigger value="exports" className="text-xs flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> {t("settings.tab.exports")}</TabsTrigger>
          <TabsTrigger value="imports" className="text-xs flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> {t("settings.tab.imports")}</TabsTrigger>
          <TabsTrigger value="suppliers" className="text-xs flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {t("settings.tab.suppliers")}</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {t("settings.tab.clients")}</TabsTrigger>
          <TabsTrigger value="logistics-mapping" className="text-xs flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> {t("settings.tab.logisticsMapping")}</TabsTrigger>
        </TabsList>

        {/* PORTS */}
        <TabsContent value="ports">
          <div className="chart-container space-y-4">
            <SectionHeader title={t("settings.section.ports")} subtitle={t("settings.section.portsSub")} />
            <EditableTable
              data={local.ports}
              columns={[
                { key: "name", label: t("settings.col.port"), role: "freeText" },
                { key: "location", label: t("settings.col.location"), role: "freeText" },
                { key: "capacityMt", label: t("settings.col.capacityMt"), type: "number" },
                { key: "currentUtilization", label: t("settings.col.utilization"), role: "freeText" },
                { key: "products", label: t("settings.col.products"), role: "freeText" },
                { key: "status", label: t("settings.col.status"), type: "select", options: [...PORT_STATUSES_EN], role: "portStatus" },
              ]}
              onUpdate={(i, k, v) => tableUpdate("ports", i, String(k), v)}
              onAdd={() => tableAdd("ports", { name: "", location: "", capacityMt: 0, currentUtilization: "0%", products: "", status: "Operational" })}
              onRemove={i => tableRemove("ports", i)}
            />
          </div>
        </TabsContent>

        {/* EXPORT PRODUCTS */}
        <TabsContent value="exports">
          <div className="chart-container space-y-4">
            <SectionHeader title={t("settings.section.exportProducts")} subtitle={t("settings.section.exportProductsSub")} />
            <EditableTable
              data={local.exportProducts}
              columns={[
                { key: "name", label: t("settings.col.product"), role: "freeText" },
                { key: "category", label: t("settings.col.category"), type: "select", options: [...EXPORT_CATEGORIES_EN], role: "exportCategory" },
                { key: "annualCapacity", label: t("settings.col.annualCapacity"), role: "freeText" },
                { key: "currentPrice", label: t("settings.col.currentPrice"), role: "freeText" },
                { key: "mainMarkets", label: t("settings.col.mainMarkets"), role: "freeText" },
                { key: "unit", label: t("settings.col.unit"), role: "freeText" },
              ]}
              onUpdate={(i, k, v) => tableUpdate("exportProducts", i, String(k), v)}
              onAdd={() =>
                tableAdd("exportProducts", {
                  name: "",
                  category: "Phosphate fertilizer",
                  annualCapacity: "",
                  currentPrice: "",
                  mainMarkets: "",
                  unit: "Mt",
                })
              }
              onRemove={i => tableRemove("exportProducts", i)}
            />
          </div>
        </TabsContent>

        {/* IMPORT MATERIALS */}
        <TabsContent value="imports">
          <div className="chart-container space-y-4">
            <SectionHeader title={t("settings.section.imports")} subtitle={t("settings.section.importsSub")} />
            <EditableTable
              data={local.importMaterials}
              columns={[
                { key: "name", label: t("settings.col.material"), role: "freeText" },
                { key: "category", label: t("settings.col.category"), type: "select", options: [...IMPORT_CATEGORIES_EN], role: "importCategory" },
                { key: "annualVolume", label: t("settings.col.annualVolume"), role: "freeText" },
                { key: "currentPrice", label: t("settings.col.currentPrice"), role: "freeText" },
                { key: "mainSuppliers", label: t("settings.col.mainSuppliers"), role: "freeText" },
                { key: "usage", label: t("settings.col.usage"), role: "freeText" },
              ]}
              onUpdate={(i, k, v) => tableUpdate("importMaterials", i, String(k), v)}
              onAdd={() =>
                tableAdd("importMaterials", {
                  name: "",
                  category: "Critical input",
                  annualVolume: "",
                  currentPrice: "",
                  mainSuppliers: "",
                  usage: "",
                })
              }
              onRemove={i => tableRemove("importMaterials", i)}
            />
          </div>
        </TabsContent>

        {/* SUPPLIERS */}
        <TabsContent value="suppliers">
          <div className="chart-container space-y-4">
            <SectionHeader title={t("settings.section.suppliers")} subtitle={t("settings.section.suppliersSub")} />
            <EditableTable
              data={local.suppliers}
              columns={[
                { key: "name", label: t("settings.col.name"), role: "freeText" },
                { key: "country", label: t("settings.col.country"), role: "country" },
                { key: "zone", label: t("settings.col.geoZone"), type: "select", options: [...REFERENCE_ZONES_EN], role: "zone" },
                { key: "products", label: t("settings.col.productsSupplied"), role: "freeText" },
                { key: "contractType", label: t("settings.col.contractType"), type: "select", options: [...CONTRACT_TYPES_SUPPLIER_EN], role: "contractType" },
                { key: "rating", label: t("settings.col.rating"), role: "freeText" },
              ]}
              onUpdate={(i, k, v) => tableUpdate("suppliers", i, String(k), v)}
              onAdd={() => tableAdd("suppliers", { name: "", country: "", zone: "Europe", products: "", contractType: "Spot", rating: "B" })}
              onRemove={i => tableRemove("suppliers", i)}
            />
          </div>
        </TabsContent>

        {/* CLIENTS */}
        <TabsContent value="clients">
          <div className="chart-container space-y-4">
            <SectionHeader title={t("settings.section.clients")} subtitle={t("settings.section.clientsSub")} />
            <EditableTable
              data={local.clients}
              columns={[
                { key: "name", label: t("settings.col.name"), role: "freeText" },
                { key: "country", label: t("settings.col.country"), role: "country" },
                { key: "zone", label: t("settings.col.geoZone"), type: "select", options: [...REFERENCE_ZONES_EN], role: "zone" },
                { key: "products", label: t("settings.col.productsBought"), role: "freeText" },
                { key: "annualVolume", label: t("settings.col.annualVolume"), role: "freeText" },
                { key: "contractType", label: t("settings.col.contractType"), type: "select", options: [...CONTRACT_TYPES_CLIENT_EN], role: "contractType" },
              ]}
              onUpdate={(i, k, v) => tableUpdate("clients", i, String(k), v)}
              onAdd={() => tableAdd("clients", { name: "", country: "", zone: "Europe", products: "", annualVolume: "", contractType: "Spot" })}
              onRemove={i => tableRemove("clients", i)}
            />
          </div>
        </TabsContent>

        <TabsContent value="logistics-mapping">
          <div className="chart-container space-y-8">
            <SectionHeader title={t("settings.mappingsTitle")} subtitle={t("settings.mappingsUnifiedSubtitle")} />
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              <StringListField
                label={t("settings.mapping.destinations")}
                description={t("settings.mapping.destinationsHint")}
                items={localLogistics.destinationCountries}
                onChange={(destinationCountries) => setLocalLogistics((prev) => ({ ...prev, destinationCountries }))}
                localizeKind="destination"
              />
              <StringListField
                label={t("settings.mapping.products")}
                description={t("settings.mapping.productsHint")}
                items={localLogistics.productCodes}
                onChange={(productCodes) => setLocalLogistics((prev) => ({ ...prev, productCodes }))}
                localizeKind="product"
              />
              <StringListField
                label={t("settings.mapping.statuses")}
                description={t("settings.mapping.statusesHint")}
                items={localLogistics.vesselStatuses}
                onChange={(vesselStatuses) => setLocalLogistics((prev) => ({ ...prev, vesselStatuses }))}
              />
            </div>

            <div className="border-t border-border pt-8 space-y-4">
              <SectionHeader
                title={t("settings.mapping.hubs")}
                subtitle={
                  <span className="flex items-center gap-2 flex-wrap">
                    <Ship className="h-4 w-4 text-primary shrink-0" />
                    {t("settings.mapping.hubsHint")}
                  </span>
                }
              />
              <EditableTable
                data={localLogistics.floatingHubs ?? []}
                columns={[
                  { key: "id", label: t("settings.col.id") },
                  { key: "name", label: t("settings.col.name") },
                  { key: "lat", label: t("settings.col.lat"), type: "number" },
                  { key: "lng", label: t("settings.col.lng"), type: "number" },
                ]}
                onUpdate={(i, k, v) => {
                  const arr = [...(localLogistics.floatingHubs ?? [])];
                  arr[i] = { ...arr[i], [k]: k === "lat" || k === "lng" ? Number(v) : v };
                  setLocalLogistics((prev) => ({ ...prev, floatingHubs: arr }));
                }}
                onAdd={() => {
                  const nid =
                    typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? `fh-${crypto.randomUUID().slice(0, 8)}`
                      : `fh-${Date.now()}`;
                  setLocalLogistics((prev) => ({
                    ...prev,
                    floatingHubs: [...(prev.floatingHubs ?? []), { id: nid, name: "", lat: 0, lng: 0 }],
                  }));
                }}
                onRemove={(i) => {
                  setLocalLogistics((prev) => ({
                    ...prev,
                    floatingHubs: (prev.floatingHubs ?? []).filter((_, j) => j !== i),
                  }));
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
