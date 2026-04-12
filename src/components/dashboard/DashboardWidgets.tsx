import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
}

export function KpiCard({ label, value, subtitle, change, changeDirection = "neutral" }: KpiCardProps) {
  return (
    <div className="kpi-card animate-slide-in">
      <div className="kpi-label mb-2">{label}</div>
      <div className="kpi-value">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      {change && (
        <div className={`mt-2 ${changeDirection === "up" ? "kpi-change-up" : changeDirection === "down" ? "kpi-change-down" : "text-xs text-muted-foreground font-mono"}`}>
          {changeDirection === "up" ? "▲" : changeDirection === "down" ? "▼" : ""} {change}
        </div>
      )}
    </div>
  );
}

interface DataTableProps {
  headers: string[];
  rows: (string | ReactNode)[][];
}

export function DataTable({ headers, rows }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const cls = severity === "high" ? "status-high" : severity === "medium" ? "status-medium" : "status-low";
  return <span className={`status-badge ${cls}`}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>;
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="accent-dot" />
      <div>
        <h3 className="section-title">{title}</h3>
        {subtitle != null && subtitle !== "" && (
          <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
