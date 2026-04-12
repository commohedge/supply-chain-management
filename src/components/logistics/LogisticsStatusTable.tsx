import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import type { LogisticsStatusRow, LogisticsMappings } from "@/types/logistics";
import { cn } from "@/lib/utils";
import { fleetMonitoringMeta, getBulkVesselNamesForUi } from "@/data/bulkVesselsFleet";
import { coordsNearDestination } from "@/lib/logisticsDestinationCoords";
import { formatEtaDateDisplay, normalizeEtaPair } from "@/lib/etaDate";
import { LEGEND_DOT_CLASSES, logisticsStatusVisual } from "@/components/logistics/logisticsTableUtils";
import { useI18n } from "@/contexts/I18nContext";
import { displayReferenceValue } from "@/i18n/referenceLocale";

const LEGEND_I18N_KEYS = [
  "logistics.legend.floatingStorage",
  "logistics.legend.loading",
  "logistics.legend.transit",
  "logistics.legend.regionalHub",
  "logistics.legend.lineUp",
  "logistics.legend.toMorocco",
] as const;

const SUGGESTED_PORTS = [
  "Jorf Lasfar",
  "Safi",
  "Casablanca",
  "Laâyoune",
  "Santos (Brazil)",
  "Paradip (India)",
  "Mumbai (India)",
  "Tampa (USA)",
  "Antwerp (Belgium)",
  "Mombasa (Kenya)",
  "Lagos (Nigeria)",
  "Santos",
  "Paradip",
  "Mumbai",
  "Tampa",
  "Antwerp",
  "Mombasa",
  "Lagos",
];

interface LogisticsStatusTableProps {
  rows: LogisticsStatusRow[];
  onRowsChange: (rows: LogisticsStatusRow[]) => void;
  mappings: LogisticsMappings;
  /** Noms clients (référentiel) pour la liste déroulante (mode détaillé) */
  clientNames?: string[];
  title?: string;
  subtitle?: string;
  showFooterTotal?: boolean;
  dense?: boolean;
  /** État initial du mode détaillé (colonnes étendues + légende) */
  defaultDetailedMode?: boolean;
}

export function LogisticsStatusTable({
  rows,
  onRowsChange,
  mappings,
  clientNames = [],
  title: titleProp,
  subtitle,
  showFooterTotal = true,
  dense = false,
  defaultDetailedMode = false,
}: LogisticsStatusTableProps) {
  const { t, locale } = useI18n();
  const title = titleProp ?? t("logistics.titleDefault");
  const [detailedMode, setDetailedMode] = useState(defaultDetailedMode);
  /** Rafraîchit la liste des noms quand la flotte est modifiée (Simulateur fret / autre onglet). */
  const [fleetNamesTick, setFleetNamesTick] = useState(0);
  useEffect(() => {
    const bump = () => setFleetNamesTick((t) => t + 1);
    window.addEventListener("bulk-fleet-storage-updated", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("bulk-fleet-storage-updated", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const vesselNames = useMemo(() => getBulkVesselNamesForUi(), [fleetNamesTick]);

  /** Réaligne ETA (j) et ETA date si données anciennes ou champ date vide. */
  useEffect(() => {
    const next = rows.map((r) => {
      const p = normalizeEtaPair(r.etaDays, r.etaDate);
      if (p.etaDate === r.etaDate && p.etaDays === r.etaDays) return r;
      return { ...r, etaDays: p.etaDays, etaDate: p.etaDate };
    });
    if (next.some((r, i) => r !== rows[i])) {
      onRowsChange(next);
    }
  }, [rows, onRowsChange]);

  const productOptions = mappings.productCodes.length ? mappings.productCodes : ["DAP", "MAP", "TSP"];
  const destBase = mappings.destinationCountries.length ? mappings.destinationCountries : ["Brazil", "India", "USA"];
  const statusBase = mappings.vesselStatuses.length ? mappings.vesselStatuses : ["Loading", "Transit", "To Morocco"];

  const destOptions = [...new Set([...destBase, ...rows.map((r) => r.destination).filter(Boolean)])];
  const productSelectOptions = [...new Set([...productOptions, ...rows.map((r) => r.product).filter(Boolean)])];
  const statusOptions = [...new Set([...statusBase, ...rows.map((r) => r.vesselStatus).filter(Boolean)])];
  const portOptions = [...new Set([...SUGGESTED_PORTS, ...rows.map((r) => r.destinationPort).filter(Boolean)])];
  const clientOptions = [...new Set([...clientNames, ...rows.map((r) => r.clientName).filter(Boolean)])];

  const update = (id: string, patch: Partial<LogisticsStatusRow>) => {
    onRowsChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const applyFleetVesselName = (id: string, name: string) => {
    const m = fleetMonitoringMeta(name.trim());
    update(id, {
      vesselName: name,
      ...(m ? { imo: m.imo, mmsi: m.mmsi } : {}),
    });
  };

  const fleetSelectOptions = useMemo(() => {
    const set = new Set(vesselNames);
    for (const r of rows) {
      const n = r.vesselName.trim();
      if (n) set.add(n);
    }
    return [...set];
  }, [vesselNames, rows]);

  const setEtaDays = (id: string, days: number) => {
    const d = Math.max(0, Math.round(days));
    update(id, normalizeEtaPair(d, undefined));
  };

  const setEtaDate = (id: string, iso: string) => {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const row = rows.find((r) => r.id === id);
      if (row) update(id, normalizeEtaPair(row.etaDays, undefined));
      return;
    }
    update(id, normalizeEtaPair(0, iso));
  };

  const addRow = () => {
    const names = vesselNames.length ? vesselNames : getBulkVesselNamesForUi();
    const vessel = names[rows.length % names.length] ?? "";
    const m = fleetMonitoringMeta(vessel);
    const eta = normalizeEtaPair(30, undefined);
    const destination = destBase[0] ?? "";
    const { lat, lng } = coordsNearDestination(destination, rows.length);
    onRowsChange([
      ...rows,
      {
        id: crypto.randomUUID(),
        volumeKt: 35,
        vesselStatus: statusBase[0] ?? "Loading",
        vesselId: `V${rows.length + 1}`,
        vesselName: vessel,
        destination,
        destinationPort: SUGGESTED_PORTS[rows.length % SUGGESTED_PORTS.length] ?? "",
        clientName: "",
        product: productOptions[0] ?? "DAP",
        etaDays: eta.etaDays,
        etaDate: eta.etaDate,
        costUsdPerT: 30,
        imo: m?.imo ?? "",
        mmsi: m?.mmsi ?? "",
        lat,
        lng,
      },
    ]);
  };

  const removeRow = (id: string) => {
    onRowsChange(rows.filter((r) => r.id !== id));
  };

  const cell = dense ? "py-1 px-1" : "py-1.5 px-1.5";
  const colCount = detailedMode ? 17 : 9;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 py-1.5">
            <Switch
              id="logistics-detailed-mode"
              checked={detailedMode}
              onCheckedChange={setDetailedMode}
              aria-label={t("logistics.detailedAria")}
            />
            <Label htmlFor="logistics-detailed-mode" className="text-xs cursor-pointer font-medium leading-none">
              {t("logistics.detailedMode")}
            </Label>
          </div>
          <Button type="button" size="sm" className="h-8 text-xs" onClick={addRow}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("logistics.addRow")}
          </Button>
        </div>
      </div>

      {detailedMode && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border/60 bg-muted/15 px-2 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("logistics.legend")}</span>
          {LEGEND_DOT_CLASSES.map((dot, i) => (
            <span key={LEGEND_I18N_KEYS[i]} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className={cn("h-2 w-2 shrink-0 rounded-sm", dot)} />
              {t(LEGEND_I18N_KEYS[i])}
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border/80 bg-card">
        <table
          className={cn(
            "w-full text-xs",
            detailedMode ? "min-w-[1540px]" : "min-w-[880px]",
            dense && "text-[11px]",
          )}
        >
          <thead>
            <tr className="border-b border-border bg-primary/10 dark:bg-primary/15">
              <th className={`text-left font-semibold uppercase tracking-wide ${cell}`}>{t("logistics.col.volume")}</th>
              <th className={`text-left font-semibold uppercase tracking-wide ${cell}`}>{t("logistics.col.vesselStatus")}</th>
              <th className={`text-left font-semibold uppercase tracking-wide min-w-[72px] ${cell}`}>{t("logistics.col.vesselId")}</th>
              <th className={`text-left font-semibold uppercase tracking-wide ${detailedMode ? "min-w-[160px]" : "min-w-[140px]"} ${cell}`}>
                {t("logistics.col.vesselName")}
              </th>
              {detailedMode && (
                <>
                  <th className={`text-left font-semibold uppercase tracking-wide ${cell}`}>{t("logistics.col.imo")}</th>
                  <th className={`text-left font-semibold uppercase tracking-wide ${cell}`}>{t("logistics.col.mmsi")}</th>
                  <th className={`text-left font-semibold uppercase tracking-wide min-w-[120px] ${cell}`}>{t("logistics.col.fleetCap")}</th>
                </>
              )}
              <th className={`text-left font-semibold uppercase tracking-wide ${cell}`}>{t("logistics.col.destination")}</th>
              {detailedMode && (
                <>
                  <th className={`text-left font-semibold uppercase tracking-wide min-w-[120px] ${cell}`}>{t("logistics.col.pod")}</th>
                  <th className={`text-left font-semibold uppercase tracking-wide min-w-[120px] ${cell}`}>{t("logistics.col.client")}</th>
                  <th className={`text-right font-semibold uppercase tracking-wide min-w-[92px] ${cell}`}>{t("logistics.col.lat")}</th>
                  <th className={`text-right font-semibold uppercase tracking-wide min-w-[92px] ${cell}`}>{t("logistics.col.lng")}</th>
                </>
              )}
              <th className={`text-left font-semibold uppercase tracking-wide ${cell}`}>{t("logistics.col.product")}</th>
              <th className={`text-right font-semibold uppercase tracking-wide ${cell}`}>{t("logistics.col.etaDays")}</th>
              {detailedMode && (
                <th className={`text-right font-semibold uppercase tracking-wide min-w-[118px] ${cell}`}>{t("logistics.col.etaDate")}</th>
              )}
              <th className={`text-right font-semibold uppercase tracking-wide ${cell}`}>{t("logistics.col.cost")}</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const eta = normalizeEtaPair(row.etaDays, row.etaDate);
              const visual = logisticsStatusVisual(row.vesselStatus);
              const meta = fleetMonitoringMeta(row.vesselName.trim());
              const rowClass = detailedMode
                ? cn("border-b border-border/40 hover:bg-muted/10", visual.rowBg, visual.borderLeft)
                : "border-b border-border/40 hover:bg-muted/20";
              return (
                <tr key={row.id} className={rowClass}>
                  <td className={cell}>
                    <Input
                      type="number"
                      className="h-8 font-mono text-xs"
                      value={row.volumeKt}
                      onChange={(e) => update(row.id, { volumeKt: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td className={cell}>
                    <div className="flex items-center gap-1.5">
                      {detailedMode && (
                        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", visual.dot)} title={row.vesselStatus} />
                      )}
                      <Select value={row.vesselStatus} onValueChange={(v) => update(row.id, { vesselStatus: v })}>
                        <SelectTrigger className={cn("h-8 text-[11px]", detailedMode ? "min-w-[132px]" : "min-w-[120px]")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className={cell}>
                    <Input
                      className="h-8 font-mono text-[11px] w-[72px]"
                      value={row.vesselId}
                      placeholder="V1"
                      onChange={(e) => update(row.id, { vesselId: e.target.value })}
                    />
                  </td>
                  <td className={cell}>
                    <Select
                      value={row.vesselName.trim() ? row.vesselName : "__none__"}
                      onValueChange={(v) => {
                        if (v === "__none__") update(row.id, { vesselName: "", imo: "", mmsi: "" });
                        else applyFleetVesselName(row.id, v);
                      }}
                    >
                      <SelectTrigger
                        className={cn("h-8 text-[11px]", detailedMode ? "min-w-[156px]" : "min-w-[136px]")}
                      >
                        <SelectValue placeholder={t("logistics.placeholder.vessel")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[min(280px,50vh)]">
                        <SelectItem value="__none__" className="text-xs text-muted-foreground">
                          —
                        </SelectItem>
                        {fleetSelectOptions.map((n) => (
                          <SelectItem key={n} value={n} className="text-xs">
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {detailedMode && (
                    <>
                      <td className={cell}>
                        <Input
                          className="h-8 font-mono text-[11px] w-[88px]"
                          value={row.imo}
                          readOnly={!!meta}
                          title={meta ? t("logistics.title.imoFleet") : t("logistics.title.imoManual")}
                          onChange={(e) => update(row.id, { imo: e.target.value })}
                        />
                      </td>
                      <td className={cell}>
                        <Input
                          className="h-8 font-mono text-[11px] w-[96px]"
                          value={row.mmsi}
                          readOnly={!!meta}
                          onChange={(e) => update(row.id, { mmsi: e.target.value })}
                        />
                      </td>
                      <td className={cn(cell, "text-[10px] leading-tight text-muted-foreground")}>
                        {meta ? (
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-foreground font-medium">
                                {meta.dwt.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}
                              </span>{" "}
                              {t("logistics.fleetDwt")}
                            </div>
                            <div>
                              {t("logistics.fleetGrain")} {meta.grainCapacityM3.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} m³
                            </div>
                            <div className="text-primary/90">{meta.category}</div>
                          </div>
                        ) : (
                          <span className="italic">—</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className={cell}>
                    <Select value={row.destination} onValueChange={(v) => update(row.id, { destination: v })}>
                      <SelectTrigger className="h-8 text-[11px]">
                        <SelectValue placeholder={t("logistics.placeholder.country")} />
                      </SelectTrigger>
                      <SelectContent>
                        {destOptions.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs">
                            {displayReferenceValue(d, "country", locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {detailedMode && (
                    <>
                      <td className={cell}>
                        <Input
                          className="h-8 text-[11px]"
                          value={row.destinationPort}
                          list={`ports-${row.id}`}
                          placeholder="POD"
                          onChange={(e) => update(row.id, { destinationPort: e.target.value })}
                        />
                        <datalist id={`ports-${row.id}`}>
                          {portOptions.map((p) => (
                            <option key={p} value={p} />
                          ))}
                        </datalist>
                      </td>
                      <td className={cell}>
                        <Select
                          value={row.clientName || "__none__"}
                          onValueChange={(v) => update(row.id, { clientName: v === "__none__" ? "" : v })}
                        >
                          <SelectTrigger className="h-8 text-[11px]">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__" className="text-xs text-muted-foreground">
                              —
                            </SelectItem>
                            {clientOptions.map((c) => (
                              <SelectItem key={c} value={c} className="text-xs">
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className={cell}>
                        <Input
                          type="number"
                          step="0.00001"
                          className="h-8 font-mono text-[11px] text-right w-[100px] ml-auto"
                          value={row.lat}
                          title={t("logistics.title.lat")}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (Number.isFinite(v)) update(row.id, { lat: v });
                          }}
                        />
                      </td>
                      <td className={cell}>
                        <Input
                          type="number"
                          step="0.00001"
                          className="h-8 font-mono text-[11px] text-right w-[100px] ml-auto"
                          value={row.lng}
                          title={t("logistics.title.lng")}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (Number.isFinite(v)) update(row.id, { lng: v });
                          }}
                        />
                      </td>
                    </>
                  )}
                  <td className={cell}>
                    <Select value={row.product} onValueChange={(v) => update(row.id, { product: v })}>
                      <SelectTrigger className="h-8 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {productSelectOptions.map((p) => (
                          <SelectItem key={p} value={p} className="text-xs">
                            {displayReferenceValue(p, "freeText", locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className={cell}>
                    <div className="flex flex-col items-end gap-0.5">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 font-mono text-xs text-right w-[64px]"
                        value={eta.etaDays}
                        onChange={(e) => setEtaDays(row.id, parseFloat(e.target.value) || 0)}
                      />
                      {!detailedMode && (
                        <span className="text-[10px] text-muted-foreground tabular-nums" title={t("logistics.etaHint")}>
                          → {formatEtaDateDisplay(eta.etaDate, locale)}
                        </span>
                      )}
                    </div>
                  </td>
                  {detailedMode && (
                    <td className={cell}>
                      <div className="flex flex-col gap-0.5 items-stretch min-w-[132px]">
                        <Input
                          type="date"
                          lang={locale === "fr" ? "fr-FR" : "en-GB"}
                          className="h-8 font-mono text-[11px]"
                          value={eta.etaDate}
                          onChange={(e) => setEtaDate(row.id, e.target.value)}
                        />
                        <span className="text-[10px] text-muted-foreground leading-tight pl-0.5">
                          {formatEtaDateDisplay(eta.etaDate, locale)}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className={cell}>
                    <Input
                      type="number"
                      className="h-8 font-mono text-xs text-right w-[72px] ml-auto"
                      value={row.costUsdPerT}
                      onChange={(e) => update(row.id, { costUsdPerT: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td className={cn(cell, "align-middle")}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive/70 hover:text-destructive"
                      onClick={() => removeRow(row.id)}
                      aria-label={t("logistics.deleteRow")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {showFooterTotal && (
            <tfoot>
              <tr className="bg-muted/30 border-t border-border font-mono text-[11px]">
                <td colSpan={colCount} className="py-2 px-3 text-muted-foreground">
                  {t("logistics.footer.total")}{" "}
                  <span className="text-foreground font-semibold">{rows.length}</span>{" "}
                  {rows.length === 1 ? t("logistics.footer.line") : t("logistics.footer.lines")}
                  {detailedMode && <span className="ml-3 text-[10px]">{t("logistics.footer.detailedHint")}</span>}
                  {!detailedMode && <span className="ml-3 text-[10px]">{t("logistics.footer.simpleHint")}</span>}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground italic">{t("logistics.empty")}</p>
      )}
    </div>
  );
}
