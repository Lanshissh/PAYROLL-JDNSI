function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[,"\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export type CsvRow = Record<string, unknown>;
export type CsvColumn = Readonly<{ key: string; header: string }>;

export function toCsv(
  rows: ReadonlyArray<CsvRow>,
  columns: ReadonlyArray<CsvColumn>
): string {
  const headerLine = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(row[c.key])).join(",")
  );
  return [headerLine, ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}