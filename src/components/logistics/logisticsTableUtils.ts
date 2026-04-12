/** Ligne du tableau — teinte de fond + bord gauche + pastille de légende */
export function logisticsStatusVisual(status: string): { rowBg: string; dot: string; borderLeft: string } {
  const s = status.toLowerCase();
  if (s.includes("floating")) {
    return { rowBg: "bg-sky-500/12", dot: "bg-sky-500", borderLeft: "border-l-4 border-l-sky-500" };
  }
  if (s.includes("loading")) {
    return { rowBg: "bg-orange-500/12", dot: "bg-orange-500", borderLeft: "border-l-4 border-l-orange-500" };
  }
  if (s.includes("transit")) {
    return { rowBg: "bg-amber-400/14", dot: "bg-amber-400", borderLeft: "border-l-4 border-l-amber-500" };
  }
  if (s.includes("regional hub")) {
    return { rowBg: "bg-emerald-600/15", dot: "bg-emerald-600", borderLeft: "border-l-4 border-l-emerald-600" };
  }
  if (s.includes("line up")) {
    return { rowBg: "bg-slate-500/12", dot: "bg-slate-500", borderLeft: "border-l-4 border-l-slate-500" };
  }
  if (s.includes("morocco")) {
    return { rowBg: "bg-blue-500/12", dot: "bg-blue-500", borderLeft: "border-l-4 border-l-blue-500" };
  }
  return { rowBg: "bg-muted/25", dot: "bg-muted-foreground", borderLeft: "border-l-4 border-l-border" };
}

/** Pastilles légende (couleur) — libellés via i18n keys logistics.legend.* */
export const LEGEND_DOT_CLASSES: string[] = [
  "bg-sky-500",
  "bg-orange-500",
  "bg-amber-400",
  "bg-emerald-600",
  "bg-slate-500",
  "bg-blue-500",
];
