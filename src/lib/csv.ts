/** Parse CSV with quoted fields and escaped quotes. */

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else {
      cur += c;
    }
  }
  row.push(cur);
  if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) {
    rows.push(row);
  }
  return rows;
}

export function csvRowsToObjects(rows: string[][]): { headers: string[]; data: Record<string, string>[] } {
  if (rows.length === 0) return { headers: [], data: [] };
  const headers = rows[0].map((h) => h.trim());
  const data: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const line = rows[r];
    if (line.every((c) => !String(c).trim())) continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = line[i] ?? "";
    });
    data.push(obj);
  }
  return { headers, data };
}

export function parseCsvText(text: string): { headers: string[]; data: Record<string, string>[] } {
  const rows = parseCSV(text.trim());
  return csvRowsToObjects(rows);
}

export function objectsToCSV(headers: string[], rows: Record<string, string>[]): string {
  const esc = (s: string) => {
    const t = String(s ?? "");
    if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
    return t;
  };
  const lines = [headers.map(esc).join(","), ...rows.map((row) => headers.map((h) => esc(row[h] ?? "")).join(","))];
  return lines.join("\r\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sumNumericColumn(key: string, rows: Record<string, string>[]): { sum: number; n: number } {
  let sum = 0;
  let n = 0;
  for (const r of rows) {
    const raw = String(r[key] ?? "").replace(/,/g, "").replace(/\s/g, "");
    const v = parseFloat(raw);
    if (!Number.isNaN(v)) {
      sum += v;
      n++;
    }
  }
  return { sum, n };
}

/** Somme une colonne tonnage : priorité aux noms métier, sinon heuristique. */
export function sumQuantityColumn(headers: string[], rows: Record<string, string>[]): number | null {
  const preferred = [
    "quantity_mt",
    "quantity_mt_physical",
    "quantity_mt_available",
    "quantity_mt_nominated",
    "quantity_mt_committed",
  ];
  for (const p of preferred) {
    const key = headers.find((h) => h === p || h.toLowerCase() === p.toLowerCase());
    if (key) {
      const { sum, n } = sumNumericColumn(key, rows);
      if (n > 0) return sum;
    }
  }
  const idx = headers.findIndex((h) => {
    const x = h.toLowerCase();
    return (
      (x.includes("quantity") || x.includes("qty") || x.includes("tonnage") || x.includes("volume_mt")) &&
      !x.includes("price") &&
      !x.includes("cost_usd") &&
      !x.includes("storage")
    );
  });
  if (idx < 0) return null;
  const key = headers[idx];
  const { sum, n } = sumNumericColumn(key, rows);
  return n > 0 ? sum : null;
}
