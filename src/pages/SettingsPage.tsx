import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, RotateCcw, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";

function EditableTable<T extends Record<string, any>>({
  data, columns, onUpdate, onAdd, onRemove,
}: {
  data: T[];
  columns: { key: keyof T; label: string; type?: "text" | "number" | "select"; options?: string[] }[];
  onUpdate: (index: number, key: keyof T, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map(col => (
                <th key={String(col.key)} className="text-left py-2 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">{col.label}</th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                {columns.map(col => (
                  <td key={String(col.key)} className="py-1.5 px-1.5">
                    {col.type === "select" && col.options ? (
                      <Select value={String(row[col.key])} onValueChange={v => onUpdate(i, col.key, v)}>
                        <SelectTrigger className="h-8 text-xs bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent>{col.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="h-8 text-xs bg-background/50 font-mono"
                        type={col.type === "number" ? "number" : "text"}
                        value={String(row[col.key] ?? "")}
                        onChange={e => onUpdate(i, col.key, col.type === "number" ? Number(e.target.value) : e.target.value)}
                      />
                    )}
                  </td>
                ))}
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
        <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter une ligne
      </Button>
    </div>
  );
}

function KpiEditor({ kpis, onChange }: { kpis: any[]; onChange: (kpis: any[]) => void }) {
  const update = (i: number, key: string, value: any) => { const next = [...kpis]; next[i] = { ...next[i], [key]: value }; onChange(next); };
  const add = () => onChange([...kpis, { label: "Nouveau KPI", value: "0", change: "", changeDirection: "neutral", subtitle: "" }]);
  const remove = (i: number) => onChange(kpis.filter((_, j) => j !== i));
  return (
    <EditableTable
      data={kpis}
      columns={[
        { key: "label", label: "Label" }, { key: "value", label: "Valeur" },
        { key: "subtitle", label: "Sous-titre" }, { key: "change", label: "Variation" },
        { key: "changeDirection", label: "Direction", type: "select", options: ["up", "down", "neutral"] },
      ]}
      onUpdate={update} onAdd={add} onRemove={remove}
    />
  );
}

export default function SettingsPage() {
  const { config, updateSection, resetSection, resetAll } = useDashboardData();
  const [localConfig, setLocalConfig] = useState(structuredClone(config));

  const saveSection = (section: keyof typeof config) => {
    updateSection(section, localConfig[section] as any);
    toast.success(`Section "${section}" sauvegardée`);
  };

  const handleResetSection = (section: keyof typeof config) => {
    resetSection(section);
    setLocalConfig(prev => ({ ...prev, [section]: structuredClone(config[section]) }));
    toast.info(`Section "${section}" réinitialisée`);
    setTimeout(() => window.location.reload(), 300);
  };

  const handleResetAll = () => {
    resetAll();
    toast.info("Toutes les données réinitialisées");
    setTimeout(() => window.location.reload(), 300);
  };

  const updateLocal = <K extends keyof typeof localConfig>(section: K, data: (typeof localConfig)[K]) => {
    setLocalConfig(prev => ({ ...prev, [section]: data }));
  };

  // Helper for editable table updates
  const tableUpdate = <S extends keyof typeof localConfig, K extends keyof (typeof localConfig)[S]>(
    section: S, field: K, i: number, key: string, v: any
  ) => {
    const arr = [...(localConfig[section][field] as any[])];
    arr[i] = { ...arr[i], [key]: v };
    updateLocal(section, { ...localConfig[section], [field]: arr });
  };

  const tableAdd = <S extends keyof typeof localConfig, K extends keyof (typeof localConfig)[S]>(
    section: S, field: K, template: any
  ) => {
    updateLocal(section, { ...localConfig[section], [field]: [...(localConfig[section][field] as any[]), template] });
  };

  const tableRemove = <S extends keyof typeof localConfig, K extends keyof (typeof localConfig)[S]>(
    section: S, field: K, i: number
  ) => {
    updateLocal(section, { ...localConfig[section], [field]: (localConfig[section][field] as any[]).filter((_: any, j: number) => j !== i) });
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><Settings2 className="h-7 w-7 text-primary" /> Configuration</h1>
          <p className="page-subtitle">Personnalisez toutes les données du dashboard OCP</p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleResetAll} className="text-xs">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Réinitialiser tout
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/30 p-1 mb-6">
          <TabsTrigger value="general" className="text-xs">⚙️ Général</TabsTrigger>
          <TabsTrigger value="overview" className="text-xs">📊 Overview</TabsTrigger>
          <TabsTrigger value="supply" className="text-xs">📦 Supply</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs">🛒 Pipeline</TabsTrigger>
          <TabsTrigger value="market" className="text-xs">📈 Market</TabsTrigger>
          <TabsTrigger value="optionality" className="text-xs">⏰ Optionality</TabsTrigger>
          <TabsTrigger value="flows" className="text-xs">🚢 Flows</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general">
          <div className="chart-container space-y-6">
            <div className="flex items-center justify-between">
              <SectionHeader title="Paramètres Généraux" />
              <Button size="sm" onClick={() => saveSection("general")} className="text-xs"><Save className="h-3.5 w-3.5 mr-1.5" />Sauvegarder</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Nom de l'entreprise</Label>
                <Input value={localConfig.general.companyName} onChange={e => updateLocal("general", { ...localConfig.general, companyName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Date du dashboard</Label>
                <Input value={localConfig.general.dashboardDate} onChange={e => updateLocal("general", { ...localConfig.general, dashboardDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Devise</Label>
                <Select value={localConfig.general.currency} onValueChange={v => updateLocal("general", { ...localConfig.general, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="MAD">MAD (DH)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="chart-container space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader title="KPIs — Overview" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResetSection("overview")} className="text-xs"><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
                  <Button size="sm" onClick={() => saveSection("overview")} className="text-xs"><Save className="h-3.5 w-3.5 mr-1.5" />Sauvegarder</Button>
                </div>
              </div>
              <KpiEditor kpis={localConfig.overview.kpis} onChange={kpis => updateLocal("overview", { ...localConfig.overview, kpis })} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Stockage par Pays" subtitle="In Stock / In Transit / Planned (kt)" />
              <EditableTable data={localConfig.overview.storage}
                columns={[{ key: "country", label: "Pays" }, { key: "inStock", label: "In Stock", type: "number" }, { key: "inTransit", label: "In Transit", type: "number" }, { key: "planned", label: "Planifié", type: "number" }]}
                onUpdate={(i, k, v) => tableUpdate("overview", "storage", i, String(k), v)}
                onAdd={() => tableAdd("overview", "storage", { country: "Nouveau", inStock: 0, inTransit: 0, planned: 0 })}
                onRemove={i => tableRemove("overview", "storage", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Demande Marché" />
              <EditableTable data={localConfig.overview.demand}
                columns={[{ key: "country", label: "Pays" }, { key: "y2025", label: "2025", type: "number" }, { key: "y2026ytd", label: "2026 YTD", type: "number" }, { key: "y2026f", label: "2026 Forecast", type: "number" }]}
                onUpdate={(i, k, v) => tableUpdate("overview", "demand", i, String(k), v)}
                onAdd={() => tableAdd("overview", "demand", { country: "Nouveau", y2025: 0, y2026ytd: 0, y2026f: 0 })}
                onRemove={i => tableRemove("overview", "demand", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Importations — Matières Premières" />
              <EditableTable data={localConfig.overview.imports}
                columns={[{ key: "material", label: "Matière" }, { key: "volume", label: "Volume/Coût" }, { key: "suppliers", label: "Fournisseurs" }, { key: "usage", label: "Usage" }]}
                onUpdate={(i, k, v) => tableUpdate("overview", "imports", i, String(k), v)}
                onAdd={() => tableAdd("overview", "imports", { material: "Nouveau", volume: "", suppliers: "", usage: "" })}
                onRemove={i => tableRemove("overview", "imports", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Exportations — Portefeuille Produits" />
              <EditableTable data={localConfig.overview.exports}
                columns={[{ key: "product", label: "Produit" }, { key: "volume", label: "Volume" }, { key: "mainMarkets", label: "Marchés" }, { key: "share", label: "Part" }]}
                onUpdate={(i, k, v) => tableUpdate("overview", "exports", i, String(k), v)}
                onAdd={() => tableAdd("overview", "exports", { product: "Nouveau", volume: "", mainMarkets: "", share: "" })}
                onRemove={i => tableRemove("overview", "exports", i)} />
            </div>
          </div>
        </TabsContent>

        {/* SUPPLY */}
        <TabsContent value="supply">
          <div className="space-y-6">
            <div className="chart-container space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader title="KPIs — Supply & Execution" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResetSection("supply")} className="text-xs"><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
                  <Button size="sm" onClick={() => saveSection("supply")} className="text-xs"><Save className="h-3.5 w-3.5 mr-1.5" />Sauvegarder</Button>
                </div>
              </div>
              <KpiEditor kpis={localConfig.supply.kpis} onChange={kpis => updateLocal("supply", { ...localConfig.supply, kpis })} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Production Forecast" />
              <EditableTable data={localConfig.supply.production}
                columns={[{ key: "month", label: "Mois" }, { key: "volume", label: "Volume (kt)", type: "number" }]}
                onUpdate={(i, k, v) => tableUpdate("supply", "production", i, String(k), v)}
                onAdd={() => tableAdd("supply", "production", { month: "Nouveau", volume: 0 })}
                onRemove={i => tableRemove("supply", "production", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Ports de Chargement" />
              <EditableTable data={localConfig.supply.ports}
                columns={[{ key: "port", label: "Port" }, { key: "utilization", label: "Utilisation" }, { key: "next7", label: "7J" }, { key: "next30", label: "30J" }]}
                onUpdate={(i, k, v) => tableUpdate("supply", "ports", i, String(k), v)}
                onAdd={() => tableAdd("supply", "ports", { port: "Nouveau", utilization: "0%", next7: "0/0", next30: "0/0" })}
                onRemove={i => tableRemove("supply", "ports", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Prix Matières Premières" />
              <EditableTable data={localConfig.supply.rawMaterials}
                columns={[{ key: "material", label: "Matière" }, { key: "currentPrice", label: "Prix" }, { key: "vs30d", label: "vs 30J" }, { key: "trend", label: "Tendance" }]}
                onUpdate={(i, k, v) => tableUpdate("supply", "rawMaterials", i, String(k), v)}
                onAdd={() => tableAdd("supply", "rawMaterials", { material: "Nouveau", currentPrice: "$0", vs30d: "—", trend: "Stable" })}
                onRemove={i => tableRemove("supply", "rawMaterials", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Navires" />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label className="text-xs">En Port</Label><Input type="number" value={localConfig.supply.vessels.inPort} onChange={e => updateLocal("supply", { ...localConfig.supply, vessels: { ...localConfig.supply.vessels, inPort: Number(e.target.value) } })} /></div>
                <div className="space-y-2"><Label className="text-xs">En Mer</Label><Input type="number" value={localConfig.supply.vessels.atSea} onChange={e => updateLocal("supply", { ...localConfig.supply, vessels: { ...localConfig.supply.vessels, atSea: Number(e.target.value) } })} /></div>
                <div className="space-y-2"><Label className="text-xs">Options Charter</Label><Input type="number" value={localConfig.supply.vessels.charterOptions} onChange={e => updateLocal("supply", { ...localConfig.supply, vessels: { ...localConfig.supply.vessels, charterOptions: Number(e.target.value) } })} /></div>
              </div>
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Contraintes" />
              <EditableTable data={localConfig.supply.constraints}
                columns={[{ key: "constraint", label: "Contrainte" }, { key: "details", label: "Détails" }, { key: "severity", label: "Sévérité", type: "select", options: ["low", "medium", "high"] }]}
                onUpdate={(i, k, v) => tableUpdate("supply", "constraints", i, String(k), v)}
                onAdd={() => tableAdd("supply", "constraints", { constraint: "Nouveau", details: "", severity: "low" as const })}
                onRemove={i => tableRemove("supply", "constraints", i)} />
            </div>
          </div>
        </TabsContent>

        {/* PIPELINE */}
        <TabsContent value="pipeline">
          <div className="space-y-6">
            <div className="chart-container space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader title="KPIs — Sales Pipeline" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResetSection("pipeline")} className="text-xs"><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
                  <Button size="sm" onClick={() => saveSection("pipeline")} className="text-xs"><Save className="h-3.5 w-3.5 mr-1.5" />Sauvegarder</Button>
                </div>
              </div>
              <KpiEditor kpis={localConfig.pipeline.kpis} onChange={kpis => updateLocal("pipeline", { ...localConfig.pipeline, kpis })} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Destinations" />
              <EditableTable data={localConfig.pipeline.destinations}
                columns={[{ key: "name", label: "Destination" }, { key: "value", label: "Volume (kt)", type: "number" }, { key: "netback", label: "Netback ($/t)", type: "number" }]}
                onUpdate={(i, k, v) => tableUpdate("pipeline", "destinations", i, String(k), v)}
                onAdd={() => tableAdd("pipeline", "destinations", { name: "Nouveau", value: 0, netback: 0 })}
                onRemove={i => tableRemove("pipeline", "destinations", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Clients par Région" />
              <EditableTable data={localConfig.pipeline.clientsByRegion}
                columns={[{ key: "region", label: "Région" }, { key: "share", label: "Part" }, { key: "clients", label: "Clients" }, { key: "products", label: "Produits" }]}
                onUpdate={(i, k, v) => tableUpdate("pipeline", "clientsByRegion", i, String(k), v)}
                onAdd={() => tableAdd("pipeline", "clientsByRegion", { region: "Nouveau", share: "0%", clients: "", products: "" })}
                onRemove={i => tableRemove("pipeline", "clientsByRegion", i)} />
            </div>
          </div>
        </TabsContent>

        {/* MARKET */}
        <TabsContent value="market">
          <div className="space-y-6">
            <div className="chart-container space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader title="KPIs — Market & Value" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResetSection("market")} className="text-xs"><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
                  <Button size="sm" onClick={() => saveSection("market")} className="text-xs"><Save className="h-3.5 w-3.5 mr-1.5" />Sauvegarder</Button>
                </div>
              </div>
              <KpiEditor kpis={localConfig.market.kpis} onChange={kpis => updateLocal("market", { ...localConfig.market, kpis })} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Prix Benchmark" />
              <EditableTable data={localConfig.market.prices}
                columns={[{ key: "period", label: "Période" }, { key: "tampa", label: "DAP Tampa", type: "number" }, { key: "india", label: "DAP India", type: "number" }, { key: "jorf", label: "FOB Jorf", type: "number" }]}
                onUpdate={(i, k, v) => tableUpdate("market", "prices", i, String(k), v)}
                onAdd={() => tableAdd("market", "prices", { period: "Nouveau", tampa: 0, india: 0, jorf: 0 })}
                onRemove={i => tableRemove("market", "prices", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Concurrents" />
              <EditableTable data={localConfig.market.competitors}
                columns={[{ key: "name", label: "Concurrent" }, { key: "volume", label: "Volume (Mt)", type: "number" }]}
                onUpdate={(i, k, v) => tableUpdate("market", "competitors", i, String(k), v)}
                onAdd={() => tableAdd("market", "competitors", { name: "Nouveau", volume: 0 })}
                onRemove={i => tableRemove("market", "competitors", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Analyse Concurrentielle" />
              <EditableTable data={localConfig.market.competitorDetails}
                columns={[{ key: "name", label: "Nom" }, { key: "country", label: "Pays" }, { key: "marketShare", label: "Part Marché" }, { key: "strengths", label: "Forces" }]}
                onUpdate={(i, k, v) => tableUpdate("market", "competitorDetails", i, String(k), v)}
                onAdd={() => tableAdd("market", "competitorDetails", { name: "Nouveau", country: "", marketShare: "0%", strengths: "" })}
                onRemove={i => tableRemove("market", "competitorDetails", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Netback par Marché" />
              <EditableTable data={localConfig.market.netback}
                columns={[{ key: "market", label: "Marché" }, { key: "fobJorf", label: "FOB Jorf" }, { key: "freight", label: "Fret" }, { key: "dapPrice", label: "DAP Price" }, { key: "netback", label: "Netback" }, { key: "vs30d", label: "vs 30J" }]}
                onUpdate={(i, k, v) => tableUpdate("market", "netback", i, String(k), v)}
                onAdd={() => tableAdd("market", "netback", { market: "Nouveau", fobJorf: "$0", freight: "$0", dapPrice: "$0", netback: "$0", vs30d: "0%" })}
                onRemove={i => tableRemove("market", "netback", i)} />
            </div>
          </div>
        </TabsContent>

        {/* OPTIONALITY */}
        <TabsContent value="optionality">
          <div className="space-y-6">
            <div className="chart-container space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader title="KPIs — Optionality & Timing" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResetSection("optionality")} className="text-xs"><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
                  <Button size="sm" onClick={() => saveSection("optionality")} className="text-xs"><Save className="h-3.5 w-3.5 mr-1.5" />Sauvegarder</Button>
                </div>
              </div>
              <KpiEditor kpis={localConfig.optionality.kpis} onChange={kpis => updateLocal("optionality", { ...localConfig.optionality, kpis })} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Forward Curve" />
              <EditableTable data={localConfig.optionality.forwardCurve}
                columns={[{ key: "period", label: "Période" }, { key: "current", label: "Actuel", type: "number" }, { key: "m1", label: "M-1", type: "number" }, { key: "m3", label: "M-3", type: "number" }]}
                onUpdate={(i, k, v) => tableUpdate("optionality", "forwardCurve", i, String(k), v)}
                onAdd={() => tableAdd("optionality", "forwardCurve", { period: "Nouveau", current: 0, m1: 0, m3: 0 })}
                onRemove={i => tableRemove("optionality", "forwardCurve", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Scénarios Netback" />
              <EditableTable data={localConfig.optionality.scenarios}
                columns={[{ key: "scenario", label: "Scénario" }, { key: "assumption", label: "Hypothèse" }, { key: "netbackImpact", label: "Netback" }, { key: "vsBase", label: "vs Base" }]}
                onUpdate={(i, k, v) => tableUpdate("optionality", "scenarios", i, String(k), v)}
                onAdd={() => tableAdd("optionality", "scenarios", { scenario: "Nouveau", assumption: "", netbackImpact: "$0", vsBase: "—" })}
                onRemove={i => tableRemove("optionality", "scenarios", i)} />
            </div>
          </div>
        </TabsContent>

        {/* FLOWS */}
        <TabsContent value="flows">
          <div className="space-y-6">
            <div className="chart-container space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader title="Routes Commerciales" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResetSection("flows")} className="text-xs"><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
                  <Button size="sm" onClick={() => saveSection("flows")} className="text-xs"><Save className="h-3.5 w-3.5 mr-1.5" />Sauvegarder</Button>
                </div>
              </div>
              <EditableTable data={localConfig.flows.tradeRoutes}
                columns={[{ key: "origin", label: "Origine" }, { key: "destination", label: "Destination" }, { key: "product", label: "Produit" }, { key: "volume", label: "Volume/Trim" }, { key: "transitDays", label: "Transit (j)" }]}
                onUpdate={(i, k, v) => tableUpdate("flows", "tradeRoutes", i, String(k), v)}
                onAdd={() => tableAdd("flows", "tradeRoutes", { origin: "Nouveau", destination: "", product: "", volume: "", transitDays: "" })}
                onRemove={i => tableRemove("flows", "tradeRoutes", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Stratégies d'Arbitrage" />
              <EditableTable data={localConfig.flows.arbitrage}
                columns={[{ key: "type", label: "Stratégie" }, { key: "description", label: "Description" }, { key: "example", label: "Exemple" }, { key: "lever", label: "Levier" }]}
                onUpdate={(i, k, v) => tableUpdate("flows", "arbitrage", i, String(k), v)}
                onAdd={() => tableAdd("flows", "arbitrage", { type: "Nouveau", description: "", example: "", lever: "" })}
                onRemove={i => tableRemove("flows", "arbitrage", i)} />
            </div>
            <div className="chart-container space-y-4">
              <SectionHeader title="Insights Clés" />
              <EditableTable data={localConfig.flows.insights}
                columns={[{ key: "title", label: "Titre" }, { key: "subtitle", label: "Sous-titre" }, { key: "content", label: "Contenu" }]}
                onUpdate={(i, k, v) => tableUpdate("flows", "insights", i, String(k), v)}
                onAdd={() => tableAdd("flows", "insights", { title: "Nouveau", subtitle: "", content: "" })}
                onRemove={i => tableRemove("flows", "insights", i)} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
