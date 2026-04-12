import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Download, FileUp, Trash2, ChevronDown, Table2 } from "lucide-react";
import { downloadTextFile, objectsToCSV, sumQuantityColumn, parseCsvText } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";

export type CsvDataset = { headers: string[]; rows: Record<string, string>[] };

interface CsvImportBlockProps {
  title: string;
  description: string;
  dataset: CsvDataset;
  onDatasetChange: (d: CsvDataset) => void;
  templateCsv: string;
  templateFilename: string;
  variant?: "import" | "export" | "stockIn" | "stockOut";
  /** Column help (slug → localized description) */
  columnHelp?: Record<string, string>;
}

const variantStyles = {
  import: "border-l-4 border-l-emerald-500/80",
  export: "border-l-4 border-l-sky-500/80",
  stockIn: "border-l-4 border-l-amber-500/80",
  stockOut: "border-l-4 border-l-violet-500/80",
};

export function CsvImportBlock({
  title,
  description,
  dataset,
  onDatasetChange,
  templateCsv,
  templateFilename,
  variant = "import",
  columnHelp,
}: CsvImportBlockProps) {
  const { t, locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        const { headers, data } = parseCsvText(text);
        onDatasetChange({ headers, rows: data });
      };
      reader.readAsText(file, "UTF-8");
    },
    [onDatasetChange],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.type === "text/csv")) loadFile(f);
  };

  const qtySum = sumQuantityColumn(dataset.headers, dataset.rows);
  const rowCount = dataset.rows.length;

  return (
    <Card className={cn("overflow-hidden shadow-sm", variantStyles[variant])}>
      <CardHeader className="pb-3 space-y-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Table2 className="h-4 w-4 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="text-xs mt-1 max-w-3xl">{description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {rowCount === 1 ? t("csv.rowSingular", { count: rowCount }) : t("csv.rowPlural", { count: rowCount })}
            </Badge>
            {qtySum != null && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {t("csv.qtyApprox", {
                  qty: qtySum.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 0 }),
                })}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onInputChange} />
          <Button type="button" size="sm" variant="default" className="text-xs h-8" onClick={() => inputRef.current?.click()}>
            <FileUp className="h-3.5 w-3.5 mr-1.5" />
            {t("csv.load")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => downloadTextFile(templateFilename, templateCsv)}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("csv.template")}
          </Button>
          {dataset.rows.length > 0 && (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() =>
                  downloadTextFile(
                    templateFilename.replace("template-", "export-"),
                    objectsToCSV(dataset.headers, dataset.rows),
                  )
                }
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {t("csv.exportLoaded")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs h-8 text-destructive/80 hover:text-destructive"
                onClick={() => onDatasetChange({ headers: [], rows: [] })}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {t("csv.clear")}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-md border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground"
        >
          {t("csv.dropHintPrefix")}{" "}
          <span className="font-mono text-foreground">.csv</span> {t("csv.dropHintSuffix")}
        </div>

        {columnHelp && Object.keys(columnHelp).length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-3.5 w-3.5" />
              {t("csv.glossaryTitle")}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <dl className="mt-2 grid gap-1.5 text-[10px] sm:grid-cols-2 border rounded-md p-3 bg-muted/10">
                {Object.entries(columnHelp).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="font-mono text-primary shrink-0">{k}</dt>
                    <dd className="text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </CollapsibleContent>
          </Collapsible>
        )}

        {dataset.headers.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-border/60 max-h-[min(420px,50vh)] overflow-y-auto">
            <table className="data-table text-xs min-w-max">
              <thead className="sticky top-0 z-[1] bg-card shadow-sm">
                <tr>
                  {dataset.headers.map((h) => (
                    <th key={h} className="whitespace-nowrap px-2 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.rows.map((row, i) => (
                  <tr key={i}>
                    {dataset.headers.map((h) => (
                      <td key={h} className="whitespace-nowrap max-w-[240px] truncate px-2 py-1.5 font-mono text-[11px]" title={row[h]}>
                        {row[h] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
