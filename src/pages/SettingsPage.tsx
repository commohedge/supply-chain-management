import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/dashboard/DashboardWidgets";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, RotateCcw, Save, Database, Anchor, Package, FlaskConical, Users, Building2 } from "lucide-react";
import { toast } from "sonner";

const ZONES = [
  "Moyen-Orient", "Asie du Sud", "Asie du Sud-Est", "Asie de l'Est",
  "Amérique du Nord", "Amérique Latine", "Europe", "Europe / CEI",
  "Afrique du Nord", "Afrique de l'Ouest", "Afrique de l'Est", "Afrique Australe",
  "Océanie",
];

const PORT_STATUSES = ["Opérationnel", "Maintenance", "Limité"] as const;

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
        <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const { config, updateSection, resetAll } = useDashboardData();
  const [local, setLocal] = useState(structuredClone(config.referentiel));

  const save = () => {
    updateSection("referentiel", local);
    toast.success("Référentiel sauvegardé");
  };

  const handleReset = () => {
    resetAll();
    toast.info("Données réinitialisées");
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
          <h1 className="page-title flex items-center gap-3"><Database className="h-7 w-7 text-primary" /> Référentiel</h1>
          <p className="page-subtitle">Données de référence — Ports, Produits, Matières premières, Fournisseurs, Clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleReset} className="text-xs">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Réinitialiser
          </Button>
          <Button size="sm" onClick={save} className="text-xs">
            <Save className="h-3.5 w-3.5 mr-1.5" /> Sauvegarder tout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ports" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/30 p-1 mb-6">
          <TabsTrigger value="ports" className="text-xs flex items-center gap-1.5"><Anchor className="h-3.5 w-3.5" /> Ports</TabsTrigger>
          <TabsTrigger value="exports" className="text-xs flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Produits Exportés</TabsTrigger>
          <TabsTrigger value="imports" className="text-xs flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Matières Premières</TabsTrigger>
          <TabsTrigger value="suppliers" className="text-xs flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Fournisseurs</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Clients</TabsTrigger>
        </TabsList>

        {/* PORTS */}
        <TabsContent value="ports">
          <div className="chart-container space-y-4">
            <SectionHeader title="Ports de Chargement & Réception" subtitle="Infrastructure portuaire OCP avec capacités annuelles" />
            <EditableTable
              data={local.ports}
              columns={[
                { key: "name", label: "Port" },
                { key: "location", label: "Localisation" },
                { key: "capacityMt", label: "Capacité (Mt/an)", type: "number" },
                { key: "currentUtilization", label: "Utilisation" },
                { key: "products", label: "Produits" },
                { key: "status", label: "Statut", type: "select", options: [...PORT_STATUSES] },
              ]}
              onUpdate={(i, k, v) => tableUpdate("ports", i, String(k), v)}
              onAdd={() => tableAdd("ports", { name: "", location: "", capacityMt: 0, currentUtilization: "0%", products: "", status: "Opérationnel" })}
              onRemove={i => tableRemove("ports", i)}
            />
          </div>
        </TabsContent>

        {/* EXPORT PRODUCTS */}
        <TabsContent value="exports">
          <div className="chart-container space-y-4">
            <SectionHeader title="Produits Exportés" subtitle="Engrais et produits phosphatés destinés à l'export" />
            <EditableTable
              data={local.exportProducts}
              columns={[
                { key: "name", label: "Produit" },
                { key: "category", label: "Catégorie", type: "select", options: ["Engrais phosphaté", "Engrais composé", "Produit intermédiaire", "Matière première"] },
                { key: "annualCapacity", label: "Capacité/an" },
                { key: "currentPrice", label: "Prix actuel" },
                { key: "mainMarkets", label: "Marchés principaux" },
                { key: "unit", label: "Unité" },
              ]}
              onUpdate={(i, k, v) => tableUpdate("exportProducts", i, String(k), v)}
              onAdd={() => tableAdd("exportProducts", { name: "", category: "Engrais phosphaté", annualCapacity: "", currentPrice: "", mainMarkets: "", unit: "Mt" })}
              onRemove={i => tableRemove("exportProducts", i)}
            />
          </div>
        </TabsContent>

        {/* IMPORT MATERIALS */}
        <TabsContent value="imports">
          <div className="chart-container space-y-4">
            <SectionHeader title="Matières Premières Importées" subtitle="Intrants critiques pour la production OCP" />
            <EditableTable
              data={local.importMaterials}
              columns={[
                { key: "name", label: "Matière" },
                { key: "category", label: "Catégorie", type: "select", options: ["Intrant critique", "Intrant secondaire", "Énergie", "Autre"] },
                { key: "annualVolume", label: "Volume annuel" },
                { key: "currentPrice", label: "Prix actuel" },
                { key: "mainSuppliers", label: "Fournisseurs" },
                { key: "usage", label: "Usage" },
              ]}
              onUpdate={(i, k, v) => tableUpdate("importMaterials", i, String(k), v)}
              onAdd={() => tableAdd("importMaterials", { name: "", category: "Intrant critique", annualVolume: "", currentPrice: "", mainSuppliers: "", usage: "" })}
              onRemove={i => tableRemove("importMaterials", i)}
            />
          </div>
        </TabsContent>

        {/* SUPPLIERS */}
        <TabsContent value="suppliers">
          <div className="chart-container space-y-4">
            <SectionHeader title="Fournisseurs" subtitle="Réseau de fournisseurs de matières premières" />
            <EditableTable
              data={local.suppliers}
              columns={[
                { key: "name", label: "Nom" },
                { key: "country", label: "Pays" },
                { key: "zone", label: "Zone Géographique", type: "select", options: ZONES },
                { key: "products", label: "Produits fournis" },
                { key: "contractType", label: "Type contrat", type: "select", options: ["Long-terme", "Contrat annuel", "Spot", "Spot + Contrat"] },
                { key: "rating", label: "Rating" },
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
            <SectionHeader title="Clients" subtitle="Portefeuille clients et volumes contractuels" />
            <EditableTable
              data={local.clients}
              columns={[
                { key: "name", label: "Nom" },
                { key: "country", label: "Pays" },
                { key: "zone", label: "Zone Géographique", type: "select", options: ZONES },
                { key: "products", label: "Produits achetés" },
                { key: "annualVolume", label: "Volume annuel" },
                { key: "contractType", label: "Type contrat", type: "select", options: ["Long-terme", "Contrat annuel", "Contrat gouvernemental", "Spot", "Spot + Contrat"] },
              ]}
              onUpdate={(i, k, v) => tableUpdate("clients", i, String(k), v)}
              onAdd={() => tableAdd("clients", { name: "", country: "", zone: "Europe", products: "", annualVolume: "", contractType: "Spot" })}
              onRemove={i => tableRemove("clients", i)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
