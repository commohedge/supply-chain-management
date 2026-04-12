/** ETA en jours → date ISO locale (yyyy-mm-dd) à partir d’aujourd’hui. */
export function addDaysToTodayIso(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + Math.round(days));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Différence en jours entre une date ISO (aaaa-mm-jj) et aujourd’hui (midi local). */
export function daysFromTodayToIso(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return 0;
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d, 12, 0, 0, 0);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** Accepte aaaa-mm-jj ou jj/mm/aaaa (saisie FR) → aaaa-mm-jj ou undefined */
export function parseEtaDateInput(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  const t = String(raw).trim();
  if (!t) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) {
    const day = m[1].padStart(2, "0");
    const month = m[2].padStart(2, "0");
    const year = m[3];
    return `${year}-${month}-${day}`;
  }
  return undefined;
}

/** Affichage lisible (ex. sous le champ date) selon la locale UI. */
export function formatEtaDateDisplay(isoYmd: string, locale: "en" | "fr"): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoYmd)) return "—";
  const [y, mo, d] = isoYmd.split("-").map(Number);
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  return dt.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** @deprecated Utiliser formatEtaDateDisplay(iso, 'fr') */
export function formatEtaDateFr(isoYmd: string): string {
  return formatEtaDateDisplay(isoYmd, "fr");
}

/**
 * Garantit que ETA (j) et ETA date restent alignés.
 * - Si `etaDate` est une date valide (aaaa-mm-jj ou jj/mm/aaaa), elle fait foi et recalcule les jours.
 * - Sinon, les jours font foi et la date est dérivée.
 */
export function normalizeEtaPair(
  etaDays: number,
  etaDate: string | undefined,
): { etaDays: number; etaDate: string } {
  const parsed = parseEtaDateInput(etaDate);
  if (parsed && /^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
    return { etaDays: daysFromTodayToIso(parsed), etaDate: parsed };
  }
  const d = Math.max(0, Math.round(Number(etaDays)) || 0);
  return { etaDays: d, etaDate: addDaysToTodayIso(d) };
}
