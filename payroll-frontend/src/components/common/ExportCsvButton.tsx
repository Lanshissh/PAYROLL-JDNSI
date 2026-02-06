import { downloadCsv, toCsv, type CsvColumn, type CsvRow } from "../../utils/csv";

type Props = {
  filename: string;
  rows: ReadonlyArray<CsvRow>;
  columns: ReadonlyArray<CsvColumn>;
  disabled?: boolean;
};

export default function ExportCsvButton({
  filename,
  rows,
  columns,
  disabled
}: Props) {
  return (
    <button
      disabled={disabled || rows.length === 0}
      onClick={() => {
        const csv = toCsv(rows, columns);
        downloadCsv(filename, csv);
      }}
    >
      Export CSV
    </button>
  );
}